import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { logger } from '../utils/logger';
import { upload } from '../middleware/multer';
import { saveFile, deleteFile, getFilePath } from '../utils/storage';
import * as path from 'path';
import * as fs from 'fs';

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

    const { user_id, document_type, expiration_date, metadata } = req.body;

    if (!document_type) {
      return res.status(400).json({
        status: 'error',
        message: 'Document type is required',
      });
    }

    // Save file to local storage
    const filePath = await saveFile(req.file, 'documents');

    // Store document metadata in database
    const result = await pool.query(
      `INSERT INTO documents (
        user_id, document_type, file_name, file_path, file_size, mime_type,
        expiration_date, metadata, encrypted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        user_id || null,
        document_type,
        req.file.originalname,
        filePath,
        req.file.size,
        req.file.mimetype,
        expiration_date || null,
        metadata || null, // Already parsed by express.json() middleware
        false, // Encryption will be added later
      ]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error uploading document:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload document',
    });
  }
});

// Download document (must be before /:id route)
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }

    const document = result.rows[0];
    const filePath = getFilePath(document.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found on server',
      });
    }

    res.download(filePath, document.file_name);
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

    // Delete file from storage
    deleteFile(document.file_path);

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

