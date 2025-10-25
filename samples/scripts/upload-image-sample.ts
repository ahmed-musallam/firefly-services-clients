/**
 * Sample: Upload Image
 * Demonstrates uploading an image to Firefly storage
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { UploadImageClient, IMSClient } from '@musallam/firefly-services-clients';

async function main() {
  // 1. Setup IMS Client for authentication
  const imsClient = new IMSClient({
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    scopes: process.env.ADOBE_SCOPES?.split(',') || ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  console.log('🔐 Authenticating with Adobe IMS...');
  const authHeaders = await imsClient.getAuthHeaders();

  // 2. Upload an image
  // Note: Replace with your local image path
  const imagePath = 'assets/5afc0299-26cf-4c88-ab79-6fb79a03d77d.jpeg'; // Change this to your image path

  console.log('\n📤 Uploading image...');
  console.log(`   File: ${imagePath}`);

  try {
    // Read the image file
    const imageBuffer = readFileSync(imagePath);
    const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });

    // Upload the image
    const job = await UploadImageClient.storageImageV2(imageBlob, {
      headers: authHeaders,
    });

    // 3. Display results
    console.log('\n✅ Upload complete!');
    if (job.images && job.images.length > 0) {
      console.log(`  Upload ID: ${job.images[0].id}`);

      console.log('\n💡 Use this uploadId in other API calls:');
      console.log('   Example:');
      console.log('   {');
      console.log('     image: {');
      console.log('       source: {');
      console.log(`         uploadId: "${job.images[0].id}"`);
      console.log('       }');
      console.log('     }');
      console.log('   }');
    }
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      console.error('\n❌ Error: File not found');
      console.error(`   Could not find image at: ${imagePath}`);
      console.error('\n⚠️  Please update imagePath with a valid image file');
    } else {
      throw error;
    }
  }
}

// Run the sample
main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
