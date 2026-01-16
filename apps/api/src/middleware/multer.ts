import multer from 'multer';
import { Request } from 'express';
import { validateFile } from '../utils/storage';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const validation = validateFile(file);
  if (validation.valid) {
    cb(null, true);
  } else {
    // Pass the validation error to provide meaningful feedback to users
    // Multer will handle this error and attach it to req.fileValidationError
    cb(new Error(validation.error || 'File validation failed'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.STORAGE_MAX_SIZE || '10485760'), // 10MB
  },
  fileFilter,
});
