/**
 * Client-side encryption utilities using Web Crypto API
 * For encrypting files in the browser before upload
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 128; // 128 bits for GCM auth tag

/**
 * Generate a random encryption key
 * @returns Encryption key as hex string
 */
export async function generateEncryptionKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  const exported = await crypto.subtle.exportKey('raw', key);
  const keyArray = new Uint8Array(exported);
  
  // Convert to hex string
  return Array.from(keyArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Import encryption key from hex string
 * @param keyHex - Encryption key as hex string
 * @returns CryptoKey object
 */
async function importKey(keyHex: string): Promise<CryptoKey> {
  // Convert hex string to ArrayBuffer
  const keyArray = new Uint8Array(
    keyHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  return crypto.subtle.importKey(
    'raw',
    keyArray,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false, // not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt file using Web Crypto API
 * @param file - File to encrypt
 * @param keyHex - Encryption key as hex string
 * @returns Object with encrypted file data, IV, and tag
 */
export async function encryptFile(
  file: File,
  keyHex: string
): Promise<{
  encrypted: ArrayBuffer;
  iv: Uint8Array;
  tag: Uint8Array;
  encryptedFile: File;
}> {
  try {
    const key = await importKey(keyHex);
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      key,
      fileBuffer
    );
    
    // Extract tag from the end of encrypted data (last 16 bytes for GCM)
    const tagStart = encrypted.byteLength - TAG_LENGTH / 8;
    const tag = new Uint8Array(encrypted.slice(tagStart));
    const encryptedData = encrypted.slice(0, tagStart);
    
    // Create File object from encrypted data
    const encryptedFile = new File(
      [encryptedData],
      file.name + '.encrypted',
      { type: 'application/octet-stream' }
    );
    
    return {
      encrypted: encryptedData,
      iv,
      tag,
      encryptedFile,
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
}

/**
 * Decrypt file using Web Crypto API
 * @param encrypted - Encrypted data as ArrayBuffer
 * @param keyHex - Encryption key as hex string
 * @param iv - Initialization vector
 * @param tag - Authentication tag
 * @returns Decrypted Blob
 */
export async function decryptFile(
  encrypted: ArrayBuffer,
  keyHex: string,
  iv: Uint8Array,
  tag: Uint8Array
): Promise<Blob> {
  try {
    const key = await importKey(keyHex);
    
    // Combine encrypted data with tag
    const encryptedWithTag = new Uint8Array(encrypted.byteLength + tag.byteLength);
    encryptedWithTag.set(new Uint8Array(encrypted), 0);
    encryptedWithTag.set(tag, encrypted.byteLength);
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv as BufferSource,
        tagLength: TAG_LENGTH,
      },
      key,
      encryptedWithTag
    );
    
    return new Blob([decrypted]);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt file. Invalid key or corrupted data.');
  }
}

/**
 * Convert Uint8Array to hex string
 */
export function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
export function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(
    hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
}
