/**
 * Sample: Generate Object and Background Masks
 * Demonstrates using Photoshop API to generate semantic masks for foreground objects
 * and background regions in an image
 *
 * This sample uploads images to AWS S3 and generates a pre-signed URL for the Photoshop API.
 * Pre-signed URLs provide secure, temporary access to private S3 objects without making them public.
 *
 * Required environment variables:
 * - AWS_ACCESS_KEY_ID: Your AWS access key ID
 * - AWS_SECRET_ACCESS_KEY: Your AWS secret access key
 * - AWS_REGION: AWS region (e.g., us-east-1)
 * - S3_BUCKET_NAME: Name of your S3 bucket
 * - ADOBE_CLIENT_ID: Adobe IMS client ID
 * - ADOBE_CLIENT_SECRET: Adobe IMS client secret
 */

import 'dotenv/config';
import { PhotoshopClient, pollMaskObjectsJob } from '@musallam/photoshop-client';
import { IMSClient } from '@musallam/ims-client';
import { readFileSync } from 'fs';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

/**
 * Uploads an image file to AWS S3 and returns a pre-signed URL
 * Pre-signed URLs provide temporary access without making objects public
 */
async function uploadImageToS3(
  filePath: string,
  bucketName: string,
  s3Client: S3Client
): Promise<string> {
  const imageBuffer = readFileSync(filePath);
  const fileName = `photoshop-masks/${randomUUID()}-${filePath.split('/').pop()}`;

  console.log(`   Uploading to S3: s3://${bucketName}/${fileName}`);

  // Upload the object (private by default, no ACL needed)
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: imageBuffer,
      ContentType: filePath.endsWith('.png') ? 'image/png' : 'image/jpeg',
    })
  );

  console.log(`✓ Image uploaded to S3`);

  // Generate a pre-signed URL valid for 1 hour
  // This allows temporary access to the object without making it public
  console.log(`   Generating pre-signed URL...`);
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  const preSignedUrl = await getSignedUrl(s3Client, getObjectCommand, {
    expiresIn: 3600, // 1 hour
  });

  console.log(`✓ Pre-signed URL generated (valid for 1 hour)`);
  console.log(`   URL: ${preSignedUrl}`);

  return preSignedUrl;
}

async function main() {
  // 1. Setup IMS Client for authentication
  const imsClient = new IMSClient({
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    scopes: process.env.ADOBE_SCOPES?.split(',') || ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  console.log('🔐 Authenticating with Adobe IMS...');
  const authHeaders = await imsClient.getAuthHeaders();

  // 2. Setup AWS S3 client
  const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const awsRegion = process.env.AWS_REGION || 'us-east-1';
  const s3BucketName = process.env.S3_BUCKET_NAME;

  if (!awsAccessKeyId || !awsSecretAccessKey || !s3BucketName) {
    throw new Error(
      'Missing required AWS environment variables:\n' +
        '  - AWS_ACCESS_KEY_ID\n' +
        '  - AWS_SECRET_ACCESS_KEY\n' +
        '  - S3_BUCKET_NAME\n' +
        '  - AWS_REGION (optional, defaults to us-east-1)'
    );
  }

  const s3Client = new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    },
  });

  console.log('\n☁️  AWS S3 configured');
  console.log(`   Region: ${awsRegion}`);
  console.log(`   Bucket: ${s3BucketName}`);

  // 3. Upload the sample image to S3
  const imagePath = 'assets/Programmers.jpg';

  console.log('\n📤 Uploading source image to S3...');
  console.log(`   File: ${imagePath}`);

  try {
    const imageUrl = await uploadImageToS3(imagePath, s3BucketName, s3Client);

    // 4. Start mask generation job
    console.log('\n🎭 Starting mask generation...');
    console.log(`   Image URL: ${imageUrl}`);

    const job = await PhotoshopClient.maskObjects(
      {
        image: {
          source: {
            url: imageUrl,
          },
        },
      },
      { headers: authHeaders }
    );

    console.log(`✓ Job created: ${job.jobId}`);
    console.log(`  Status URL: ${job.statusUrl}`);

    // 5. Poll for completion using the polling utility
    console.log('\n⏳ Waiting for mask generation to complete...');

    const result = await pollMaskObjectsJob(job, {
      axiosRequestConfig: { headers: authHeaders },
      intervalMs: 2000,
      maxAttempts: 60,
      onProgress: (status) => {
        if (status.status === 'not_started' || status.status === 'running') {
          console.log(`  Status: ${status.status}${status.status === 'running' ? '...' : ''}`);
        }
      },
    });

    // 6. Display results
    console.log('\n✅ Mask generation complete!');
    console.log(`\n📊 Found ${result.semanticMasks?.length || 0} foreground object masks:`);

    result.semanticMasks?.forEach((mask, index) => {
      console.log(`\n  ${index + 1}. ${mask.label}`);
      console.log(`     JSON: ${JSON.stringify(mask, null, 2)}`);
    });

    console.log(`\n📊 Found ${result.backgroundMasks?.length || 0} background region masks:`);

    result.backgroundMasks?.forEach((mask, index) => {
      console.log(`\n  ${index + 1}. ${mask.label}`);
      console.log(`     JSON: ${JSON.stringify(mask, null, 2)}`);
    });

    console.log('\n💡 Key Takeaways:');
    console.log('   - Semantic masks identify foreground objects in the image');
    console.log('   - Background masks segment different background regions');
    console.log('   - Each mask includes a label, confidence score, and bounding box');
    console.log('   - Masks can be used for further image editing operations');
    console.log('   - The pollMaskObjectsJob utility handles all polling logic with type safety');
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
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
  if (error instanceof Error && error.stack) {
    console.error('\nStack trace:', error.stack);
  }
  process.exit(1);
});
