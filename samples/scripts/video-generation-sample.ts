/**
 * Sample: Video Generation
 * Demonstrates generating videos using Firefly API
 */

import 'dotenv/config';
import { GenerateVideoClient, pollJob, IMSClient } from '@musallam/firefly-services-clients';

async function main() {
  // 1. Setup IMS Client for authentication
  const imsClient = new IMSClient({
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    scopes: process.env.ADOBE_SCOPES?.split(',') || ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  console.log('🔐 Authenticating with Adobe IMS...');
  const authHeaders = await imsClient.getAuthHeaders();

  console.log('\n🎬 Starting video generation...');
  console.log(`   Motion: camera pan right`);

  const job = await GenerateVideoClient.generateVideoV3(
    {
      prompt: 'A beautiful sunset over a calm ocean',
      videoSettings: {
        cameraMotion: GenerateVideoClient.CameraMotion.camera_pan_right,
      },
    },
    { headers: authHeaders }
  );

  console.log(`✓ Job created: ${job}`);
  console.log('⚠️  Video generation can take several minutes...');

  // 3. Poll for completion (with longer timeout)
  console.log('\n⏳ Waiting for video generation to complete...');
  const result = await pollJob<GenerateVideoClient.AsyncResult>(job, {
    fetchOptions: { headers: authHeaders },
    intervalMs: 5000, // Check every 5 seconds
    maxAttempts: 120, // Allow up to 10 minutes
    onProgress: (status) => {
      console.log(`  Status: ${status.status}${status.progress ? ` (${status.progress}%)` : ''}`);
    },
  });

  // 4. Display results
  console.log('\n✅ Video generation complete!');
  if (result.outputs?.[0]?.video?.url) {
    console.log(`  Video URL: ${result.outputs[0].video.url}`);
    console.log(`  Seed: ${result.outputs[0].seed}`);
  }

  console.log('\n💡 Tip: Download the video and view it in your media player!');
}

// Run the sample
main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
