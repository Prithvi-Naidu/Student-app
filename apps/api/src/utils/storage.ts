import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

const STORAGE_PATH = process.env.STORAGE_PATH || './storage/uploads';
const MAX_FILE_SIZE = parseInt(process.env.STORAGE_MAX_SIZE || '10485760'); // 10MB default
const ALLOWED_TYPES = (process.env.STORAGE_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp,application/pdf').split(',');

// Ensure storage directory exists
export const ensureStorageDir = (): void => {
  if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
    logger.info(`Created storage directory: ${STORAGE_PATH}`);
  }
};

// Save file to local storage
export const saveFile = async (
  file: Express.Multer.File,
  subfolder?: string
): Promise<string> => {
  ensureStorageDir();
  
  const uploadPath = subfolder 
    ? path.join(STORAGE_PATH, subfolder)
    : STORAGE_PATH;
  
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(file.originalname);
  const filename = `${timestamp}-${randomStr}${ext}`;
  const filepath = path.join(uploadPath, filename);

  // Write file
  fs.writeFileSync(filepath, file.buffer);

  // Return relative path (will be converted to URL in route handlers)
  return subfolder ? path.join(subfolder, filename) : filename;
};

// Delete file from storage
export const deleteFile = (filepath: string): void => {
  const fullPath = path.join(STORAGE_PATH, filepath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    logger.info(`Deleted file: ${fullPath}`);
  }
};

// Get file path
export const getFilePath = (filepath: string): string => {
  return path.join(STORAGE_PATH, filepath);
};

// Validate file
export const validateFile = (file: Express.Multer.File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `File type ${file.mimetype} is not allowed`,
    };
  }

  return { valid: true };
};

// Initialize storage on module load
ensureStorageDir();

