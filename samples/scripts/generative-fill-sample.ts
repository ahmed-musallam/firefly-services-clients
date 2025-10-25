/**
 * Sample: Generative Fill
 * Demonstrates filling/removing objects from images using AI
 */

import 'dotenv/config';
import { GenerativeFillClient, pollJob, IMSClient } from '@musallam/firefly-services-clients';

async function main() {
  // 1. Setup IMS Client for authentication
  const imsClient = new IMSClient({
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    scopes: process.env.ADOBE_SCOPES?.split(',') || ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  console.log('🔐 Authenticating with Adobe IMS...');
  const authHeaders = await imsClient.getAuthHeaders();

  // 2. Start generative fill
  // Note: Replace with your image and mask URLs
  // The mask should be a black/white image where white indicates areas to fill
  const sourceImageUrl = 'assets/5afc0299-26cf-4c88-ab79-6fb79a03d77d.jpeg';
  const maskImageUrl = 'assets/mask.png';

  console.log('\n🎨 Starting generative fill...');
  console.log(`   Source: ${sourceImageUrl}`);
  console.log(`   Mask: ${maskImageUrl}`);
  console.log(`   Fill with: "a beautiful flower"`);

  const job = await GenerativeFillClient.fillImagesV3Async(
    {
      image: {
        source: {
          url: sourceImageUrl,
        },
      },
      mask: {
        source: {
          url: maskImageUrl,
        },
      },
      prompt: 'a beautiful flower',
      size: {
        width: 2048,
        height: 2048,
      },
    },
    { headers: authHeaders }
  );

  console.log(`✓ Job created: ${job.jobId}`);

  // 3. Poll for completion
  console.log('\n⏳ Waiting for fill to complete...');
  const result = await pollJob<GenerativeFillClient.FillImageResponseV3>(job, {
    fetchOptions: { headers: authHeaders },
    intervalMs: 3000,
    onProgress: (status) => {
      console.log(`  Status: ${status.status}${status.progress ? ` (${status.progress}%)` : ''}`);
    },
  });

  // 4. Display results
  console.log('\n✅ Fill complete!');
  console.log(`  Generated ${result.outputs.length} filled images:`);
  result.outputs.forEach((img, index) => {
    console.log(`  ${index + 1}. ${img.image.url}`);
    console.log(`     Seed: ${img.seed}`);
  });

  console.log('\n💡 Tip: The masked area has been filled with your prompt!');
}

// Run the sample
main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
