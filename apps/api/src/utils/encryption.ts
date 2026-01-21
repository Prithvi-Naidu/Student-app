import * as crypto from 'crypto';
import { logger } from './logger';

const ALGORITHM = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits for GCM auth tag
const SALT_LENGTH = 32;

/**
 * Generate a random encryption key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): string {
  return crypto.randomBytes(SALT_LENGTH).toString('hex');
}

/**
 * Derive encryption key from user password/salt (PBKDF2)
 * Future: Use this when we have user passwords
 */
export function deriveKeyFromPassword(
  password: string,
  salt: string,
  iterations: number = 100000
): string {
  return crypto
    .pbkdf2Sync(password, salt, iterations, KEY_LENGTH, 'sha256')
    .toString('hex');
}

/**
 * Hash encryption key for storage (SHA-256)
 * We store hash, not the key itself
 */
export function hashEncryptionKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Encrypt file buffer using AES-256-GCM
 * @param buffer - File buffer to encrypt
 * @param key - Encryption key (hex string)
 * @returns Object with encrypted buffer and IV
 */
export function encryptFile(
  buffer: Buffer,
  key: string
): { encrypted: Buffer; iv: string; tag: string } {
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv) as crypto.CipherGCM;
    
    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final(),
    ]);
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  } catch (error) {
    logger.error('Encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
}

/**
 * Decrypt file buffer using AES-256-GCM
 * @param encrypted - Encrypted buffer
 * @param key - Encryption key (hex string)
 * @param iv - Initialization vector (hex string)
 * @param tag - Authentication tag (hex string)
 * @returns Decrypted buffer
 */
export function decryptFile(
  encrypted: Buffer,
  key: string,
  iv: string,
  tag: string
): Buffer {
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const tagBuffer = Buffer.from(tag, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, ivBuffer) as crypto.DecipherGCM;
    decipher.setAuthTag(tagBuffer);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption error:', error);
    throw new Error('Failed to decrypt file');
  }
}

/**
 * Verify encryption key hash matches
 */
export function verifyKeyHash(key: string, keyHash: string): boolean {
  const computedHash = hashEncryptionKey(key);
  return computedHash === keyHash;
}
