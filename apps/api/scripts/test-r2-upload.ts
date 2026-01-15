import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'onestop-documents';

console.log('🔍 Testing R2 Configuration...\n');

// Check configuration
console.log('Configuration Check:');
console.log(`  R2_ENDPOINT: ${R2_ENDPOINT ? '✅ SET' : '❌ NOT SET'}`);
console.log(`  R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID ? '✅ SET' : '❌ NOT SET'}`);
console.log(`  R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log(`  R2_BUCKET_NAME: ${R2_BUCKET_NAME}`);
console.log('');

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('❌ R2 credentials not fully configured!');
  process.exit(1);
}

// Create S3 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function testR2Upload() {
  try {
    console.log('📤 Testing R2 Upload...\n');

    // Create a test file
    const testContent = `Test file uploaded at: ${new Date().toISOString()}\nThis is a test file to verify R2 upload functionality.`;
    const testFileName = `test-${Date.now()}.txt`;
    const testKey = `test/${testFileName}`;

    console.log(`Creating test file: ${testFileName}`);
    console.log(`Upload key: ${testKey}`);
    console.log(`Bucket: ${R2_BUCKET_NAME}\n`);

    // Upload to R2
    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });

    console.log('Uploading to R2...');
    const uploadResponse = await r2Client.send(uploadCommand);
    console.log('✅ Upload successful!');
    console.log('Response:', JSON.stringify(uploadResponse, null, 2));
    console.log('');

    // List objects in the bucket to verify
    console.log('📋 Listing objects in bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'test/',
      MaxKeys: 10,
    });

    const listResponse = await r2Client.send(listCommand);
    
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      console.log(`✅ Found ${listResponse.Contents.length} object(s) in test/ prefix:\n`);
      listResponse.Contents.forEach((obj) => {
        console.log(`  - ${obj.Key} (${obj.Size} bytes, modified: ${obj.LastModified})`);
      });
    } else {
      console.log('⚠️  No objects found in test/ prefix');
    }
    console.log('');

    // Try to download the file to verify it was uploaded correctly
    console.log('📥 Downloading test file to verify...');
    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: testKey,
    });

    const getResponse = await r2Client.send(getCommand);
    if (getResponse.Body) {
      const streamToString = (stream: any): Promise<string> => {
        return new Promise((resolve, reject) => {
          const chunks: Buffer[] = [];
          stream.on('data', (chunk: Buffer) => chunks.push(chunk));
          stream.on('error', reject);
          stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        });
      };

      const bodyContents = await streamToString(getResponse.Body);
      console.log('✅ Download successful!');
      console.log('File contents:', bodyContents);
      console.log('');
    }

    console.log('✅ All R2 tests passed!');
    console.log(`\nTest file uploaded to: ${testKey}`);
    console.log('You can verify this in your Cloudflare R2 dashboard.');

  } catch (error: any) {
    console.error('\n❌ Error testing R2 upload:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.$metadata) {
      console.error('HTTP Status:', error.$metadata.httpStatusCode);
      console.error('Request ID:', error.$metadata.requestId);
    }
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testR2Upload()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
