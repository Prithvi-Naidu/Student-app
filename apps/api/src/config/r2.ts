import { S3Client } from '@aws-sdk/client-s3';
import { logger } from '../utils/logger';

// Helper to get R2 config at runtime (reads from process.env directly)
const getR2Config = () => {
  return {
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME || 'onestop-documents',
  };
};

const config = getR2Config();

if (!config.endpoint || !config.accessKeyId || !config.secretAccessKey) {
  logger.warn(
    'R2 credentials not fully configured. Cloud storage features will be disabled.'
  );
}

// Create S3-compatible client for Cloudflare R2 (will use runtime config)
const createR2Client = (): S3Client => {
  const currentConfig = getR2Config();
  if (!currentConfig.endpoint || !currentConfig.accessKeyId || !currentConfig.secretAccessKey) {
    throw new Error('R2 credentials not configured');
  }
  return new S3Client({
    region: 'auto',
    endpoint: currentConfig.endpoint,
    credentials: {
      accessKeyId: currentConfig.accessKeyId,
      secretAccessKey: currentConfig.secretAccessKey,
    },
  });
};

// Initialize client (may be null if config not available at module load)
let r2Client: S3Client | null = null;
if (config.endpoint && config.accessKeyId && config.secretAccessKey) {
  r2Client = createR2Client();
}

export { r2Client };
export { createR2Client };

export const getR2Bucket = () => getR2Config().bucketName;

/**
 * Check if R2 is properly configured (reads env vars at runtime)
 */
export function isR2Configured(): boolean {
  const config = getR2Config();
  const isConfigured = !!(
    config.endpoint &&
    config.accessKeyId &&
    config.secretAccessKey &&
    config.bucketName
  );
  return isConfigured;
}
