/**
 * Sample: Generate Similar Images
 * Demonstrates generating variations of an existing image
 */

import 'dotenv/config';
import { IMSClient, FireflyApiClient, pollGenerateSimilarJob } from '@musallam/firefly-client';
import { readFileSync } from 'fs';

async function main() {
  // 1. Setup IMS Client for authentication
  const imsClient = new IMSClient({
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    scopes: process.env.ADOBE_SCOPES?.split(',') || ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  console.log('🔐 Authenticating with Adobe IMS...');
  const authHeaders = await imsClient.getAuthHeaders();

  // 2. Upload the source image
  const fileRelativePath = 'assets/5afc0299-26cf-4c88-ab79-6fb79a03d77d.jpeg';
  console.log(`\n📤 Uploading source image: ${fileRelativePath}`);

  const imageBuffer = readFileSync(fileRelativePath);
  const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });

  const uploadResult = await FireflyApiClient.storageImageV2(imageBlob, {
    headers: {
      ...authHeaders,
      'Content-Type': 'image/jpeg',
    },
  });

  console.log(`✓ Upload complete: ${uploadResult.images?.[0]?.id}`);

  console.log('\n🖼️  Starting similar image generation...');
  const job = await FireflyApiClient.generateSimilarImagesV3Async(
    {
      image: {
        source: {
          uploadId: uploadResult.images![0].id,
        },
      },
      numVariations: 3,
      size: {
        width: 2048,
        height: 2048,
      },
    },
    { headers: authHeaders }
  );

  console.log(`✓ Job created: ${job}`);

  // 3. Poll for completion
  console.log('\n⏳ Waiting for generation to complete...');
  const result = await pollGenerateSimilarJob(job, {
    axiosRequestConfig: { headers: authHeaders },
    intervalMs: 3000,
    onProgress: (status) => {
      console.log(`  Status: ${status.status}${status.progress ? ` (${status.progress}%)` : ''}`);
    },
  });

  console.log('\n✅ Generation complete!');
  console.log(`  Generated ${result.result?.outputs.length} similar variations:`);
  result.result?.outputs.forEach((img, index) => {
    console.log(`  ${index + 1}. ${img.image.url}`);
    console.log(`     Seed: ${img.seed}`);
  });

  console.log('\n💡 Tip: Download these images and compare them to your source!');
}

// Run the sample
main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
