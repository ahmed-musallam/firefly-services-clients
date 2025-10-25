/**
 * Sample: Object Composite
 * Demonstrates compositing generated objects into existing images
 */

import 'dotenv/config';
import {
  GenerateObjectCompositeClient,
  pollJob,
  UploadImageClient,
  IMSClient,
} from '@musallam/firefly-services-clients';
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

  // 2. Start object composite generation
  // Note: Replace with your background image URL
  const backgroundImageUrl = 'assets/5afc0299-26cf-4c88-ab79-6fb79a03d77d.jpeg';
  console.log('\n📤 Uploading background image...');
  console.log(`   File: ${backgroundImageUrl}`);
  const imageBuffer = readFileSync(backgroundImageUrl);
  const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });

  const uploadResult = await UploadImageClient.storageImageV2(imageBlob, {
    headers: authHeaders,
  });

  console.log('\n🎨 Starting object composite generation...');
  console.log(`   Background: ${backgroundImageUrl}`);
  console.log(`   Object: "a red sports car"`);

  const job = await GenerateObjectCompositeClient.generateObjectCompositeV3Async(
    {
      prompt: 'a red sports car',
      image: {
        source: {
          uploadId: uploadResult.images![0].id,
        },
      },
      size: {
        width: 2048,
        height: 2048,
      },
      placement: {
        alignment: {
          horizontal: GenerateObjectCompositeClient.AlignmentHorizontal.center,
          vertical: GenerateObjectCompositeClient.AlignmentVertical.center,
        },
      },
      contentClass: GenerateObjectCompositeClient.ContentClassV3.photo,
    },
    { headers: authHeaders }
  );

  console.log(`✓ Job created: ${job.jobId}`);

  // 3. Poll for completion
  console.log('\n⏳ Waiting for generation to complete...');
  const result = await pollJob<GenerateObjectCompositeClient.GenerateObjectCompositeResponseV3>(
    job,
    {
      fetchOptions: { headers: authHeaders },
      intervalMs: 3000,
      onProgress: (status) => {
        console.log(`  Status: ${status.status}${status.progress ? ` (${status.progress}%)` : ''}`);
      },
    }
  );

  // 4. Display results
  console.log('\n✅ Generation complete!');
  console.log(`  Generated ${result.outputs.length} composite images:`);
  result.outputs.forEach((img, index) => {
    console.log(`  ${index + 1}. ${img.image.url}`);
    console.log(`     Seed: ${img.seed}`);
  });

  console.log('\n💡 Tip: The object has been composited into your background image!');
}

// Run the sample
main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
