/**
 * Sample: Image Generation
 * Demonstrates text-to-image generation using Firefly API
 */

import 'dotenv/config';
import { ImageGenerationClient, pollJob, IMSClient } from '@musallam/firefly-services-clients';

async function main() {
  // 1. Setup IMS Client for authentication
  const imsClient = new IMSClient({
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    scopes: process.env.ADOBE_SCOPES?.split(',') || ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  console.log('🔐 Authenticating with Adobe IMS...');
  const authHeaders = await imsClient.getAuthHeaders();

  // 2. Start image generation job
  console.log('\n🎨 Starting image generation...');

  const job = await ImageGenerationClient.generateImagesV3Async(
    {
      prompt: 'A majestic lion standing on a cliff at sunset, cinematic lighting, 4k quality',
    },
    { headers: { ...authHeaders } }
  );

  console.log(`✓ Job created: ${job.jobId}`);
  console.log(`  Status URL: ${job.statusUrl}`);

  // 3. Poll for completion
  console.log('\n⏳ Waiting for generation to complete...');
  const result = await pollJob<ImageGenerationClient.GenerateImagesResponseV3>(job, {
    fetchOptions: { headers: authHeaders },
    intervalMs: 3000,
    onProgress: (status) => {
      console.log(`  Status: ${status.status}${status.progress ? ` (${status.progress}%)` : ''}`);
    },
  });

  // 4. Display results
  console.log('\n✅ Generation complete!');
  console.log(`  Generated ${result.outputs.length} images:`);
  result.outputs.forEach((img, index) => {
    console.log(`  ${index + 1}. ${img.image.url}`);
    console.log(`     Seed: ${img.seed}`);
  });

  console.log('\n📊 Image details:');
  console.log(`  Size: ${result.size.width}x${result.size.height}`);
  console.log(`  Content class: ${result.contentClass}`);
}

// Run the sample
main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
