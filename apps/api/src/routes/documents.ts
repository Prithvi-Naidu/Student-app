import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { logger } from '../utils/logger';
import { upload } from '../middleware/multer';
import { saveFile, deleteFile, getFilePath } from '../utils/storage';
import * as path from 'path';
import * as fs from 'fs';
import {
  encryptFile,
  decryptFile,
  generateEncryptionKey,
  hashEncryptionKey,
} from '../utils/encryption';
import {
  uploadToR2,
  downloadFromR2,
  deleteFromR2,
  generateR2Key,
} from '../utils/cloud-storage';
import { isR2Configured as checkR2Config } from '../config/r2';

const router = Router();

// Get all documents for a user (user_id nullable for now)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { user_id, document_type } = req.query;

    let query = 'SELECT * FROM documents WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (user_id) {
      paramCount++;
      query += ` AND user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (document_type) {
      paramCount++;
      query += ` AND document_type = $${paramCount}`;
      params.push(document_type);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    // Add HTTP caching headers
    // Allow browser/CDN to cache for 30 seconds, but must revalidate
    res.setHeader('Cache-Control', 'public, max-age=30, must-revalidate');
    res.setHeader('ETag', `"${Buffer.from(JSON.stringify(result.rows)).toString('base64').substring(0, 27)}"`);

    // Check If-None-Match header for conditional requests
    const ifNoneMatch = req.headers['if-none-match'];
    const currentETag = res.getHeader('ETag');
    if (ifNoneMatch === currentETag) {
      return res.status(304).end(); // Not Modified
    }

    res.json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch documents',
    });
  }
});

// Get documents expiring soon (must be before /:id route)
router.get('/expiring/soon', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const date = new Date();
    date.setDate(date.getDate() + days);

    const result = await pool.query(
      `SELECT * FROM documents 
       WHERE expiration_date IS NOT NULL 
       AND expiration_date <= $1 
       AND expiration_date >= CURRENT_DATE
       ORDER BY expiration_date ASC`,
      [date]
    );

    res.json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    logger.error('Error fetching expiring documents:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch expiring documents',
    });
  }
});

// Upload document
router.post('/', (req: Request, res: Response, next: any) => {
  upload.single('file')(req, res, (err: any) => {
    // Handle multer fileFilter errors
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message || 'File validation failed',
      });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }

    const {
      user_id,
      document_type,
      expiration_date,
      metadata,
      use_cloud_storage,
      encrypt,
      country_code,
    } = req.body;

    // Debug logging - also log to response for easier debugging
    const debugInfo: any = {
      document_type,
      use_cloud_storage,
      encrypt,
      use_cloud_storage_type: typeof use_cloud_storage,
      use_cloud_storage_value: use_cloud_storage,
      req_body_keys: Object.keys(req.body),
      req_body: req.body,
    };
    logger.info('Upload request body:', debugInfo);

    if (!document_type) {
      return res.status(400).json({
        status: 'error',
        message: 'Document type is required',
      });
    }

    // Determine storage type
    const useCloud = use_cloud_storage === 'true' || use_cloud_storage === true;
    const useEncryption = encrypt === 'true' || encrypt === true;
    const isR2ConfigOk = checkR2Config();
    const storageType = useCloud && isR2ConfigOk ? 'cloud_r2' : 'local';
    
    const storageDebug = {
      useCloud,
      isR2ConfigOk,
      storageType,
      use_cloud_storage_raw: use_cloud_storage,
      comparison_result: use_cloud_storage === 'true',
    };
    logger.info('Storage decision:', storageDebug);
    
    // For development, include debug info in response
    if (process.env.NODE_ENV === 'development') {
      (debugInfo as any).storageDecision = storageDebug;
    }

    let fileBuffer = req.file.buffer;
    let encryptionKey: string | null = null;
    let encryptionKeyHash: string | null = null;
    let encryptionIv: string | null = null;
    let encryptionTag: string | null = null;

    // Encrypt file if requested
    if (useEncryption) {
      encryptionKey = generateEncryptionKey();
      encryptionKeyHash = hashEncryptionKey(encryptionKey);
      const encrypted = encryptFile(fileBuffer, encryptionKey);
      fileBuffer = encrypted.encrypted;
      encryptionIv = encrypted.iv;
      encryptionTag = encrypted.tag;
    }

    let filePath: string;
    let cloudKey: string | null = null;
    let cloudUrl: string | null = null;
    let cloudProvider: string | null = null;

    // Generate a temporary ID for R2 key generation if using cloud storage
    let tempDocumentId: string | null = null;
    if (storageType === 'cloud_r2') {
      const tempResult = await pool.query('SELECT uuid_generate_v4() as id');
      tempDocumentId = tempResult.rows[0].id;
    }

    if (storageType === 'cloud_r2' && tempDocumentId) {
      // Upload to R2
      cloudKey = generateR2Key(tempDocumentId, req.file.originalname);
      await uploadToR2(fileBuffer, cloudKey, req.file.mimetype);
      cloudUrl = cloudKey; // Store key as URL reference
      cloudProvider = 'cloudflare_r2';
      filePath = cloudKey; // Store key in file_path for backward compatibility
    } else {
      // Save to local storage
      const tempFile = {
        ...req.file,
        buffer: fileBuffer,
      };
      filePath = await saveFile(tempFile, 'documents');
    }

    // Store document metadata in database
    const result = await pool.query(
      `INSERT INTO documents (
        user_id, document_type, file_name, file_path, file_size, mime_type,
        expiration_date, metadata, encrypted, storage_type, cloud_provider,
        cloud_url, cloud_key, encryption_key_hash, encryption_iv, country_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        user_id || null,
        document_type,
        req.file.originalname,
        filePath,
        fileBuffer.length, // Use encrypted size if encrypted
        req.file.mimetype,
        expiration_date || null,
        metadata || null,
        useEncryption,
        storageType,
        cloudProvider,
        cloudUrl,
        cloudKey,
        encryptionKeyHash,
        encryptionIv ? `${encryptionIv}:${encryptionTag}` : null, // Store IV and tag together
        country_code || null,
      ]
    );

    // Don't return encryption key in response (security)
    const document = result.rows[0];
    delete (document as any).encryption_key_hash;
    delete (document as any).encryption_iv;

    const response: any = {
      status: 'success',
      data: document,
    };

    // Include debug info in development mode
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        received: {
          use_cloud_storage,
          use_cloud_storage_type: typeof use_cloud_storage,
        },
        decision: {
          useCloud,
          isR2ConfigOk,
          storageType,
        },
      };
    }

    res.status(201).json(response);
  } catch (error) {
    logger.error('Error uploading document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : String(error);
    logger.error('Error details:', { errorMessage, errorStack });
    res.status(500).json({
      status: 'error',
      message: errorMessage || 'Failed to upload document',
    });
  }
});

// Download document (must be before /:id route)
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { encryption_key } = req.query; // Optional: if client-side encryption key provided

    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }

    const document = result.rows[0];
    let fileBuffer: Buffer;

    // Download from appropriate storage
    if (document.storage_type === 'cloud_r2' && document.cloud_key) {
      // Download from R2
      fileBuffer = await downloadFromR2(document.cloud_key);
    } else {
      // Download from local storage
      const filePath = getFilePath(document.file_path);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          status: 'error',
          message: 'File not found on server',
        });
      }
      fileBuffer = fs.readFileSync(filePath);
    }

    // Decrypt if encrypted
    if (document.encrypted) {
      if (!encryption_key) {
        return res.status(400).json({
          status: 'error',
          message: 'Encryption key required to download encrypted file',
        });
      }

      // Parse IV and tag from stored value
      const ivAndTag = document.encryption_iv;
      if (!ivAndTag) {
        return res.status(500).json({
          status: 'error',
          message: 'Encryption metadata missing',
        });
      }

      const [iv, tag] = ivAndTag.split(':');
      if (!iv || !tag) {
        return res.status(500).json({
          status: 'error',
          message: 'Invalid encryption metadata',
        });
      }

      try {
        fileBuffer = decryptFile(fileBuffer, encryption_key as string, iv, tag);
      } catch (decryptError) {
        logger.error('Decryption error:', decryptError);
        return res.status(400).json({
          status: 'error',
          message: 'Failed to decrypt file. Invalid encryption key.',
        });
      }
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.mime_type || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.file_name}"`
    );
    res.send(fileBuffer);
  } catch (error) {
    logger.error('Error downloading document:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to download document',
    });
  }
});

// Get single document by ID (must be after specific routes like /:id/download)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error fetching document:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch document',
    });
  }
});

// Delete document
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get document to delete file from storage
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }

    const document = result.rows[0];

    // Delete file from appropriate storage
    if (document.storage_type === 'cloud_r2' && document.cloud_key) {
      // Delete from R2
      try {
        await deleteFromR2(document.cloud_key);
      } catch (error) {
        logger.warn('Error deleting from R2 (continuing with DB delete):', error);
        // Continue with database deletion even if R2 delete fails
      }
    } else {
      // Delete from local storage
      deleteFile(document.file_path);
    }

    // Delete from database
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);

    res.json({
      status: 'success',
      message: 'Document deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting document:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete document',
    });
  }
});

export default router;

