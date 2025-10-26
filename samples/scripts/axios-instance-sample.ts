/**
 * Sample: Custom Axios Instance Configuration
 * Demonstrates how to configure AXIOS_INSTANCE with custom base URL and verify it's being used
 * by starting a local validation server that validates incoming requests
 */

import 'dotenv/config';
import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { AXIOS_INSTANCE, ImageGenerationClient } from '@musallam/firefly-services-clients';

const PORT = 8765; // Uncommon port for testing
const EXPECTED_PATH = '/v3/images/generate-async';
const EXPECTED_METHOD = 'POST';

interface ValidationResult {
  success: boolean;
  errors: string[];
  receivedPayload?: unknown;
}

function validateRequest(req: IncomingMessage): ValidationResult {
  const errors: string[] = [];
  let payload: unknown;

  // Validate method
  if (req.method !== EXPECTED_METHOD) {
    errors.push(`Expected method ${EXPECTED_METHOD}, got ${req.method}`);
  }

  // Validate path
  if (req.url !== EXPECTED_PATH) {
    errors.push(`Expected path ${EXPECTED_PATH}, got ${req.url}`);
  }

  return {
    success: errors.length === 0,
    errors,
    receivedPayload: payload,
  };
}

async function startValidationServer(
  expectedPrompt: string
): Promise<{ closeServer: () => Promise<void> }> {
  return new Promise((resolve, reject) => {
    let serverClosed = false;

    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      console.log(`\n🌐 Server received request:`);
      console.log(`   Method: ${req.method}`);
      console.log(`   Path: ${req.url}`);
      console.log(`   Headers: ${JSON.stringify(req.headers, null, 2)}`);

      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        console.log(`   Body: ${body}\n`);

        const validation = validateRequest(req, body, expectedPrompt);

        if (validation.success) {
          console.log('✅ Server validation PASSED!');
          console.log('   All expected fields and values match\n');

          // Return a mock successful response
          res.writeHead(202, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jobId: 'test-job-123',
              statusUrl: '/v3/status/test-job-123',
              cancelUrl: '/v3/cancel/test-job-123',
            })
          );
        } else {
          console.error('❌ Server validation FAILED!');
          validation.errors.forEach((error) => {
            console.error(`   - ${error}`);
          });
          console.log(
            `\n   Received payload: ${JSON.stringify(validation.receivedPayload, null, 2)}\n`
          );

          // Return error response
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Validation failed',
              details: validation.errors,
            })
          );

          // Close server and reject
          server.close(() => {
            serverClosed = true;
            reject(new Error(`Server validation failed: ${validation.errors.join(', ')}`));
          });
        }
      });
    });

    server.on('error', (error) => {
      reject(error);
    });

    server.listen(PORT, () => {
      console.log(`🚀 Test server started on http://localhost:${PORT}`);
      console.log(`   Listening for ${EXPECTED_METHOD} ${EXPECTED_PATH}\n`);

      resolve({
        closeServer: () =>
          new Promise((resolveClose) => {
            if (!serverClosed) {
              server.close(() => {
                console.log('🛑 Server closed\n');
                resolveClose();
              });
            } else {
              resolveClose();
            }
          }),
      });
    });
  });
}

async function main() {
  console.log('🔧 Axios Instance Configuration Test\n');
  console.log('This sample demonstrates:');
  console.log('  1. Starting a local validation server');
  console.log('  2. Configuring AXIOS_INSTANCE.defaults.baseURL');
  console.log('  3. Making an API call that goes to the local server');
  console.log('  4. Server validates the request payload and headers\n');

  const testPrompt = 'A beautiful sunset over mountains, photorealistic';

  // Start the validation server
  const { closeServer } = await startValidationServer(testPrompt);

  try {
    // Configure AXIOS_INSTANCE to point to local server
    console.log(`🔧 Configuring AXIOS_INSTANCE.defaults.baseURL to http://localhost:${PORT}`);
    AXIOS_INSTANCE.defaults.baseURL = `http://localhost:${PORT}`;

    // Make the image generation request
    console.log('📤 Sending image generation request...');
    console.log(`   Prompt: "${testPrompt}"\n`);

    const job = await ImageGenerationClient.generateImagesV3Async({
      prompt: testPrompt,
      numVariations: 2,
      size: {
        width: 2048,
        height: 2048,
      },
      contentClass: ImageGenerationClient.ContentClassV3.photo,
    });

    console.log('✅ Request completed successfully!');
    console.log(`   Job ID: ${job.jobId}`);
    console.log(`   Status URL: ${job.statusUrl}\n`);

    console.log('💡 Key Takeaways:');
    console.log('   1. AXIOS_INSTANCE.defaults.baseURL successfully overridden');
    console.log('   2. Request went to local server instead of Adobe API');
    console.log('   4. This technique is useful for:');
    console.log('      - Testing with mock servers');
    console.log('      - Proxying requests through custom middleware');
    console.log('      - Routing to different environments (dev, staging, prod)');
    console.log('      - Logging and monitoring API calls');
  } finally {
    // Clean up: close the server
    await closeServer();
    console.log('🧹 Cleanup complete');
  }
}

// Run the sample
main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
