import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_URL = process.env.API_URL || 'http://localhost:4000';

async function testDocumentUpload() {
  try {
    console.log('🧪 Testing Document Upload API...\n');
    console.log(`API URL: ${API_URL}\n`);

    // Create a test PDF file (PDFs are allowed)
    const testContent = Buffer.from('%PDF-1.4\nTest document uploaded at: ' + new Date().toISOString());
    const testFileName = `test-document-${Date.now()}.pdf`;
    const testFilePath = path.join(__dirname, testFileName);

    // Write test file
    fs.writeFileSync(testFilePath, testContent);
    console.log(`Created test file: ${testFileName}`);

    // Create FormData
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath), testFileName);
    formData.append('document_type', 'Test');
    formData.append('use_cloud_storage', 'true');
    formData.append('encrypt', 'false');

    console.log('\n📤 Uploading to API...');
    console.log('  document_type: Test');
    console.log('  use_cloud_storage: true');
    console.log('  encrypt: false\n');

    const response = await fetch(`${API_URL}/api/documents`, {
      method: 'POST',
      body: formData,
    });

    // Clean up test file
    fs.unlinkSync(testFilePath);

    const responseData = await response.json();

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(responseData, null, 2));

    if (response.ok && responseData.status === 'success') {
      console.log('\n✅ Upload successful!');
      console.log(`Document ID: ${responseData.data.id}`);
      console.log(`Storage Type: ${responseData.data.storage_type}`);
      console.log(`Cloud Provider: ${responseData.data.cloud_provider || 'N/A'}`);
      console.log(`Cloud Key: ${responseData.data.cloud_key || 'N/A'}`);
      
      if (responseData.data.storage_type === 'cloud_r2') {
        console.log('\n✅ File was uploaded to R2!');
      } else {
        console.log('\n⚠️  File was stored locally, not in R2!');
      }
    } else {
      console.error('\n❌ Upload failed!');
      console.error('Error:', responseData.message || 'Unknown error');
    }

  } catch (error: any) {
    console.error('\n❌ Error testing upload:');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Check if API is running
fetch(`${API_URL}/health`)
  .then((res) => {
    if (res.ok) {
      console.log('✅ API is running\n');
      return testDocumentUpload();
    } else {
      console.error('❌ API health check failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Cannot connect to API. Is it running?');
    console.error('Error:', error.message);
    console.log(`\nMake sure the API is running on ${API_URL}`);
    process.exit(1);
  });

