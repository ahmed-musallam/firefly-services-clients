/**
 * Sample: Generative Expand
 * Demonstrates expanding an image using AI to generate new content
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import {
  GenerativeExpandClient,
  UploadImageClient,
  pollJob,
  IMSClient,
} from '@musallam/firefly-services-clients';

async function main() {
  // 1. Setup IMS Client for authentication
  const imsClient = new IMSClient({
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    scopes: process.env.ADOBE_SCOPES?.split(',') || ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  console.log('🔐 Authenticating with Adobe IMS...');
  const authHeaders = await imsClient.getAuthHeaders();

  // 2. Upload the sample image
  const imagePath = 'assets/5afc0299-26cf-4c88-ab79-6fb79a03d77d.jpeg';

  console.log('\n📤 Uploading source image...');
  console.log(`   File: ${imagePath}`);

  const imageBuffer = readFileSync(imagePath);
  const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });

  // Upload the image
  const uploadResult = await UploadImageClient.storageImageV2(imageBlob, {
    headers: authHeaders,
  });

  const uploadId = uploadResult.images![0].id;
  console.log(`✓ Image uploaded: ${uploadId}`);

  // 3. Start generative expand
  console.log('\n🔍 Starting generative expand...');
  console.log(`   Source: ${imagePath}`);
  console.log(`   Target size: 3000x3000px (expanding from source)`);

  const job = await GenerativeExpandClient.expandImagesV3Async(
    {
      image: {
        source: {
          uploadId: uploadId,
        },
      },
      size: {
        width: 3000,
        height: 3000,
      },
      // Optional: Add a prompt to guide the expansion
      prompt: 'natural landscape, coherent style',
    },
    { headers: authHeaders }
  );

  console.log(`✓ Job created: ${job.jobId}`);

  // 4. Poll for completion
  console.log('\n⏳ Waiting for expansion to complete...');
  const result = await pollJob<GenerativeExpandClient.ExpandImageResponseV3>(job, {
    fetchOptions: { headers: authHeaders },
    intervalMs: 3000,
    onProgress: (status) => {
      console.log(`  Status: ${status.status}${status.progress ? ` (${status.progress}%)` : ''}`);
    },
  });

  // 5. Display results
  console.log('\n✅ Expansion complete!');
  console.log(`  Generated ${result.outputs.length} expanded images:`);
  result.outputs.forEach((img, index) => {
    console.log(`  ${index + 1}. ${img.image.url}`);
    console.log(`     Seed: ${img.seed}`);
  });

  console.log(`\n📐 Expanded to: ${result.size.width}x${result.size.height}px`);
  console.log('💡 Tip: Compare the expanded image with your original!');
}

// Run the sample
main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
