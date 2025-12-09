/**
 * Sample script demonstrating Adobe Lightroom API usage
 *
 * This example shows how to:
 * - Apply auto-tone adjustments to an image
 * - Poll for job completion
 * - Handle results
 */

import {
  LightroomClient,
  LIGHTROOM_AXIOS_INSTANCE,
  TokenIMSClient,
  pollLightroomJob,
  type PollLightroomJobOptions,
} from '@musallam/lightroom-client';

// Configuration from environment variables
const config = {
  clientId: process.env.ADOBE_CLIENT_ID || '',
  clientSecret: process.env.ADOBE_CLIENT_SECRET || '',
  inputImageUrl: process.env.INPUT_IMAGE_URL || 'https://your-bucket.s3.amazonaws.com/input.jpg',
  outputImageUrl: process.env.OUTPUT_IMAGE_URL || 'https://your-bucket.s3.amazonaws.com/output.jpg',
};

async function main() {
  console.log('🎨 Adobe Lightroom API Sample\n');

  // Step 1: Setup authentication
  console.log('1️⃣  Setting up authentication...');
  const imsClient = new TokenIMSClient({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  // Configure axios instance with authentication
  LIGHTROOM_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
    const token = await imsClient.getAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-api-key'] = process.env.ADOBE_CLIENT_ID!;
    config.headers['Content-Type'] = 'application/json';
    return config;
  });

  console.log('✓ Authentication configured\n');

  // Step 2: Apply auto-tone to image
  console.log('2️⃣  Applying auto-tone to image...');
  console.log(`   Input: ${config.inputImageUrl}`);
  console.log(`   Output: ${config.outputImageUrl}`);

  try {
    const job = await LightroomClient.applyAutoTone({
      inputs: {
        href: config.inputImageUrl,
        storage: 'external',
      },
      outputs: [
        {
          href: config.outputImageUrl,
          storage: 'external',
          type: 'image/jpeg',
        },
      ],
    });

    console.log('✓ Job submitted successfully');
    console.log(`   Status URL: ${job._links?.self?.href}\n`);

    // Step 3: Poll for job completion
    console.log('3️⃣  Polling for job completion...');

    const pollOptions: PollLightroomJobOptions = {
      intervalMs: 2000,
      maxAttempts: 60,
      onProgress: (status) => {
        const outputStatus = status.outputs?.[0]?.status || 'unknown';
        console.log(`   Status: ${outputStatus} (${new Date().toLocaleTimeString()})`);
      },
    };

    const result = await pollLightroomJob(job, pollOptions);

    // Step 4: Display results
    console.log('\n✅ Job completed successfully!\n');
    console.log('📊 Results:');
    console.log(`   Job ID: ${result.jobId}`);
    console.log(`   Created: ${result.created}`);
    console.log(`   Modified: ${result.modified}`);

    if (result.outputs && result.outputs.length > 0) {
      console.log('\n🖼️  Output Images:');
      result.outputs.forEach((output, index) => {
        console.log(`   ${index + 1}. ${output._links?.self?.href} (${output.status})`);
      });
    }

    console.log('\n🎉 Done! Your auto-toned image is ready.');
  } catch (error) {
    console.error('\n❌ Error processing image:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  }
}

// Additional examples

/**
 * Example: Apply a Lightroom preset to an image
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function applyPresetExample() {
  const job = await LightroomClient.applyPreset({
    inputs: {
      source: {
        href: 'https://your-bucket.s3.amazonaws.com/photo.jpg',
        storage: 'external',
      },
      presets: [
        {
          href: 'https://your-bucket.s3.amazonaws.com/preset.xmp',
          storage: 'external',
        },
      ],
    },
    outputs: [
      {
        href: 'https://your-bucket.s3.amazonaws.com/result.jpg',
        storage: 'external',
        type: 'image/jpeg',
      },
    ],
  });

  const result = await pollLightroomJob(job);
  console.log('Preset applied:', result.outputs?.[0]?._links?.self?.href);
}

/**
 * Example: Auto-straighten an image
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function autoStraightenExample() {
  const job = await LightroomClient.autoStraightenImage({
    inputs: {
      href: 'https://your-bucket.s3.amazonaws.com/crooked.jpg',
      storage: 'external',
    },
    outputs: [
      {
        href: 'https://your-bucket.s3.amazonaws.com/straightened.jpg',
        storage: 'external',
        type: 'image/jpeg',
      },
    ],
  });

  const result = await pollLightroomJob(job);
  console.log('Image straightened:', result.outputs?.[0]?._links?.self?.href);
}

/**
 * Example: Apply XMP settings to an image
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function applyXmpExample() {
  const job = await LightroomClient.applyPresetFromXmpContent({
    inputs: {
      source: {
        href: 'https://your-bucket.s3.amazonaws.com/photo.jpg',
        storage: 'external',
      },
    },
    options: {
      xmp: '<x:xmpmeta>...</x:xmpmeta>',
    },
    outputs: [
      {
        href: 'https://your-bucket.s3.amazonaws.com/edited.jpg',
        storage: 'external',
        type: 'image/jpeg',
      },
    ],
  });

  const result = await pollLightroomJob(job);
  console.log('XMP applied:', result.outputs?.[0]?._links?.self?.href);
}

/**
 * Example: Apply manual edits to an image
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function manualEditExample() {
  const job = await LightroomClient.applyEdits({
    inputs: {
      source: {
        href: 'https://your-bucket.s3.amazonaws.com/photo.jpg',
        storage: 'external',
      },
    },
    options: {
      Exposure: 0.5,
      Contrast: 25,
      Saturation: 10,
    },
    outputs: [
      {
        href: 'https://your-bucket.s3.amazonaws.com/edited.jpg',
        storage: 'external',
        type: 'image/jpeg',
      },
    ],
  });

  const result = await pollLightroomJob(job);
  console.log('Manual edits applied:', result.outputs?.[0]?._links?.self?.href);
}

// Run the main example
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
