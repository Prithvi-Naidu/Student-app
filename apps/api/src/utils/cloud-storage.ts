import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, getR2Bucket, isR2Configured, createR2Client } from '../config/r2';
import { logger } from './logger';
import { Readable } from 'stream';

/**
 * Upload file to R2
 * @param buffer - File buffer to upload
 * @param key - Object key (path) in R2
 * @param mimeType - MIME type of the file
 * @returns Object key on success
 */
export async function uploadToR2(
  buffer: Buffer,
  key: string,
  mimeType: string
): Promise<string> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured. Please set R2 environment variables.');
  }

  // Get fresh client and bucket name
  const client = r2Client || createR2Client();
  const bucketName = getR2Bucket();

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await client.send(command);
    logger.info(`File uploaded to R2: ${key}`);
    return key;
  } catch (error) {
    logger.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file to R2');
  }
}

/**
 * Download file from R2
 * @param key - Object key (path) in R2
 * @returns File buffer
 */
export async function downloadFromR2(key: string): Promise<Buffer> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured. Please set R2 environment variables.');
  }

  // Get fresh client and bucket name
  const client = r2Client || createR2Client();
  const bucketName = getR2Bucket();

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await client.send(command);
    
    if (!response.Body) {
      throw new Error('Empty response body from R2');
    }

    // Convert stream to buffer
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      throw new Error('File not found in R2');
    }
    logger.error('Error downloading from R2:', error);
    throw new Error('Failed to download file from R2');
  }
}

/**
 * Delete file from R2
 * @param key - Object key (path) in R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured. Please set R2 environment variables.');
  }

  // Get fresh client and bucket name
  const client = r2Client || createR2Client();
  const bucketName = getR2Bucket();

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await client.send(command);
    logger.info(`File deleted from R2: ${key}`);
  } catch (error) {
    logger.error('Error deleting from R2:', error);
    throw new Error('Failed to delete file from R2');
  }
}

/**
 * Check if file exists in R2
 * @param key - Object key (path) in R2
 * @returns True if file exists
 */
export async function fileExistsInR2(key: string): Promise<boolean> {
  if (!isR2Configured()) {
    return false;
  }

  // Get fresh client and bucket name
  const client = r2Client || createR2Client();
  const bucketName = getR2Bucket();

  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    logger.error('Error checking file existence in R2:', error);
    return false;
  }
}

/**
 * Generate a presigned URL for temporary file access (expires in 1 hour)
 * @param key - Object key (path) in R2
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL
 */
export async function getR2PresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured. Please set R2 environment variables.');
  }

  // Get fresh client and bucket name
  const client = r2Client || createR2Client();
  const bucketName = getR2Bucket();

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn });
    return url;
  } catch (error) {
    logger.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate presigned URL');
  }
}

/**
 * Generate object key for document storage
 * @param documentId - Document UUID
 * @param fileName - Original file name
 * @returns Object key (path) for R2
 */
export function generateR2Key(documentId: string, fileName: string): string {
  const timestamp = Date.now();
  const ext = fileName.split('.').pop() || 'bin';
  return `documents/${documentId}-${timestamp}.${ext}`;
}

