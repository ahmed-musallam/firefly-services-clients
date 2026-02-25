/**
 * Sample: Audio and Video API
 * Demonstrates template description and rendering with the Audio and Video API
 */

import 'dotenv/config';
import { IMSClient } from '@musallam/ims-client';
import { AudioVideoApiClient, pollAudioVideoJob } from '@musallam/audio-video-client';

async function main() {
  // 1. Setup IMS Client for authentication
  const imsClient = new IMSClient({
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    scopes: process.env.ADOBE_SCOPES?.split(',') || ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  console.log('🔐 Authenticating with Adobe IMS...');
  const authHeaders = await imsClient.getAuthHeaders();

  // Example template ID - replace with your actual template ID
  const templateId = process.env.TEMPLATE_PRESIGNED_URL || 'your-template-id';

  // 2. Describe the template to see available controls
  console.log(`\n🔍 Fetching template info for: ${templateId}...`);

  try {
    const templateInfoJob = await AudioVideoApiClient.templateDescribe(
      { source: { url: templateId } },
      { headers: authHeaders }
    );

    const templateInfo = (await pollAudioVideoJob(templateInfoJob, {
      axiosRequestConfig: { headers: authHeaders },
      intervalMs: 2000,
      maxAttempts: 60,
      onProgress: (status) => {
        console.log(`   Status: ${status.status}`);
      },
    })) as AudioVideoApiClient.JobStatus;

    console.log('\n✅ Template info retrieved!');
    console.log(`   Job ID: ${templateInfo.jobId}`);
    console.log(`   Status URL: ${templateInfoJob.statusUrl}`);

    // 3. Render the template with custom data
    console.log('\n🎨 Rendering template with custom content...');

    const renderJob = await AudioVideoApiClient.templateRender(
      {
        source: { url: templateId },
        variations: [
          {
            variables: [],
          },
        ],
      },
      { headers: authHeaders }
    );

    console.log(`✅ Render job submitted! Job ID: ${renderJob.jobId}`);

    // 4. Poll for completion
    console.log('\n⏳ Polling for job completion...');

    const result = (await pollAudioVideoJob(renderJob, {
      axiosRequestConfig: { headers: authHeaders },
      intervalMs: 2000,
      maxAttempts: 60,
      onProgress: (status) => {
        if (status.status === 'running') {
          console.log('   ⏳ Job is running...');
        } else if (status.status === 'not_started') {
          console.log('   ⏳ Job is queued...');
        }
      },
    })) as AudioVideoApiClient.JobStatus;

    console.log('\n✅ Rendering complete!');
    console.log(`   Status: ${result.status}`);
    console.log(`   Output: ${result.outputs}`);

    // Display any errors
    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.error?.message || 'Unknown error'}`);
      });
    }
  } catch (error: unknown) {
    console.error('\n❌ Error:', error);
  }

  console.log('\n💡 Tips:');
  console.log('   - Set TEMPLATE_ID environment variable to use your own template');
  console.log('   - Update control IDs based on your template structure');
  console.log('   - Use templateDescribe to discover available controls');
  console.log('\n💡 Other Job Types:');
  console.log('   The pollAudioVideoJob utility works with ALL job types:');
  console.log('   - generateSpeech() - Text to speech');
  console.log('   - transcribe() - Audio/video transcription');
  console.log('   - dub() - Audio/video dubbing');
  console.log('   - generateAvatar() - Avatar video generation');
  console.log('   - generateReframedVideoV2() - Video reframing');
}

// Run the sample
main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
