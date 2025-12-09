# @musallam/lightroom-client

TypeScript client library for the Adobe Lightroom API - programmatically apply Lightroom settings and image adjustments to photos.

## Features

- 🚀 **Full TypeScript support** with auto-generated types from OpenAPI spec
- 📦 **Complete API coverage** for all Lightroom endpoints
- 🔄 **Job polling utilities** for async operations
- 🔐 **Built-in authentication** via IMS client
- 📝 **Comprehensive documentation** and examples

## Installation

```bash
npm install @musallam/lightroom-client
```

## Quick Start

```typescript
import {
  LightroomClient,
  LIGHTROOM_AXIOS_INSTANCE,
  TokenIMSClient,
  pollLightroomJob,
} from '@musallam/lightroom-client';

// 1. Setup authentication
const imsClient = new TokenIMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
});

// 2. Configure axios instance
LIGHTROOM_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await imsClient.getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-api-key'] = 'YOUR_CLIENT_ID';
  return config;
});

// 3. Apply auto-tone to an image
const job = await LightroomClient.autoTone({
  inputs: {
    href: 'https://your-bucket.s3.amazonaws.com/image.jpg',
    storage: 'external',
  },
  outputs: [
    {
      href: 'https://your-bucket.s3.amazonaws.com/output.jpg',
      storage: 'external',
    },
  ],
});

// 4. Poll for results
const result = await pollLightroomJob(job, {
  onProgress: (status) => console.log(`Status: ${status.status}`),
});

console.log('Processed image:', result.outputs?.[0]?.href);
```

## API Coverage

The client provides full TypeScript support for:

### Image Processing

- `presets()` - Apply Lightroom preset
- `xmp()` - Apply XMP settings
- `autoStraighten()` - Auto-straighten image
- `autoTone()` - Auto-adjust image tone
- `edit()` - Apply manual image edits

### Job Management

- `acrstatus()` - Get job status
- `pollLightroomJob()` - Poll until completion (utility)

## Usage Examples

### Apply Lightroom Preset

```typescript
const job = await LightroomClient.presets({
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
    },
  ],
});

const result = await pollLightroomJob(job);
console.log('Processed:', result.outputs?.[0]?.href);
```

### Apply XMP Settings

```typescript
const job = await LightroomClient.xmp({
  inputs: {
    source: {
      href: 'https://your-bucket.s3.amazonaws.com/photo.jpg',
      storage: 'external',
    },
    xmp: {
      href: 'https://your-bucket.s3.amazonaws.com/settings.xmp',
      storage: 'external',
    },
  },
  outputs: [
    {
      href: 'https://your-bucket.s3.amazonaws.com/edited.jpg',
      storage: 'external',
    },
  ],
});
```

### Auto-Straighten Image

```typescript
const job = await LightroomClient.autoStraighten({
  inputs: {
    href: 'https://your-bucket.s3.amazonaws.com/crooked.jpg',
    storage: 'external',
  },
  outputs: [
    {
      href: 'https://your-bucket.s3.amazonaws.com/straightened.jpg',
      storage: 'external',
    },
  ],
});

const result = await pollLightroomJob(job, {
  intervalMs: 2000,
  maxAttempts: 60,
});
```

### Auto-Tone Adjustment

```typescript
const job = await LightroomClient.autoTone({
  inputs: {
    href: 'https://your-bucket.s3.amazonaws.com/photo.jpg',
    storage: 'external',
  },
  outputs: [
    {
      href: 'https://your-bucket.s3.amazonaws.com/auto-toned.jpg',
      storage: 'external',
    },
  ],
});
```

### Manual Image Edits

```typescript
const job = await LightroomClient.edit({
  inputs: {
    source: {
      href: 'https://your-bucket.s3.amazonaws.com/photo.jpg',
      storage: 'external',
    },
    edits: {
      href: 'https://your-bucket.s3.amazonaws.com/edits.json',
      storage: 'external',
    },
  },
  outputs: [
    {
      href: 'https://your-bucket.s3.amazonaws.com/edited.jpg',
      storage: 'external',
    },
  ],
});
```

## Job Polling

For async operations, use the polling utility:

```typescript
import { pollLightroomJob, PollingTimeoutError } from '@musallam/lightroom-client';

try {
  const result = await pollLightroomJob(jobResult, {
    intervalMs: 2000, // Poll every 2 seconds
    maxAttempts: 60, // Try up to 60 times
    timeoutMs: 300000, // Or timeout after 5 minutes
    onProgress: (status) => {
      console.log(`Status: ${status.status}`);
      if (status.status === 'running') {
        console.log('Job is processing...');
      }
    },
  });

  console.log('Job completed:', result.outputs);
} catch (error) {
  if (error instanceof PollingTimeoutError) {
    console.error('Job timed out');
  } else {
    console.error('Job failed:', error);
  }
}
```

## Error Handling

```typescript
import axios from 'axios';

try {
  const job = await LightroomClient.autoTone(request);
} catch (error) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 400:
        console.error('Bad Request:', data.details?.reason);
        break;
      case 402:
        console.error('Trial Limit Exceeded');
        break;
      case 403:
        console.error('Forbidden:', data.details?.reason);
        break;
      case 404:
        console.error('Resource Not Found');
        break;
      case 409:
        console.error('File Overwrite Error');
        break;
      case 410:
        console.error('Asset Link Invalid or Expired');
        break;
      default:
        console.error('Error:', data);
    }
  }
}
```

## Advanced Configuration

### Custom Axios Instance

```typescript
import { LIGHTROOM_AXIOS_INSTANCE } from '@musallam/lightroom-client';

// Add custom headers
LIGHTROOM_AXIOS_INSTANCE.defaults.headers.common['X-Custom-Header'] = 'value';

// Add request interceptor
LIGHTROOM_AXIOS_INSTANCE.interceptors.request.use((config) => {
  console.log(`Making request to ${config.url}`);
  return config;
});

// Add response interceptor
LIGHTROOM_AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Request failed:', error.message);
    return Promise.reject(error);
  }
);
```

### Timeout Configuration

```typescript
LIGHTROOM_AXIOS_INSTANCE.defaults.timeout = 30000; // 30 seconds
```

### IMS Organization ID (for Adobe I/O Events)

```typescript
LIGHTROOM_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await imsClient.getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-api-key'] = 'YOUR_CLIENT_ID';
  config.headers['x-gw-ims-org-id'] = 'YOUR_ORG_ID'; // Optional, for events
  return config;
});
```

## TypeScript Support

All types are automatically generated from the OpenAPI spec:

```typescript
import type {
  PostPresetsSchema,
  PostXmpSchema,
  PostAutoStraightenSchema,
  PostAutoToneSchema,
  PostImageEditSchema,
  GetStatusSchema,
  ApiResponseSuccessSchema,
} from '@musallam/lightroom-client';

const request: PostAutoToneSchema = {
  inputs: {
    href: 'https://example.com/image.jpg',
    storage: 'external',
  },
  outputs: [
    {
      href: 'https://example.com/output.jpg',
      storage: 'external',
    },
  ],
};

const job = await LightroomClient.autoTone(request);
```

## Storage Options

The Lightroom API supports various storage options:

- **`external`** - Pre-signed URLs to external storage (AWS S3, Azure, etc.)
- **`adobe`** - Adobe's cloud storage (requires different authentication)

Example with external storage:

```typescript
const job = await LightroomClient.autoTone({
  inputs: {
    href: 'https://my-bucket.s3.amazonaws.com/input.jpg',
    storage: 'external',
  },
  outputs: [
    {
      href: 'https://my-bucket.s3.amazonaws.com/output.jpg',
      storage: 'external',
    },
  ],
});
```

## Complete Example

```typescript
import {
  LightroomClient,
  LIGHTROOM_AXIOS_INSTANCE,
  TokenIMSClient,
  pollLightroomJob,
} from '@musallam/lightroom-client';

async function processImage() {
  // Setup authentication
  const imsClient = new TokenIMSClient({
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  LIGHTROOM_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
    const token = await imsClient.getAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-api-key'] = process.env.ADOBE_CLIENT_ID!;
    return config;
  });

  try {
    // Apply auto-tone
    console.log('Applying auto-tone...');
    const job = await LightroomClient.autoTone({
      inputs: {
        href: 'https://my-bucket.s3.amazonaws.com/photo.jpg',
        storage: 'external',
      },
      outputs: [
        {
          href: 'https://my-bucket.s3.amazonaws.com/auto-toned.jpg',
          storage: 'external',
        },
      ],
    });

    // Poll for completion
    const result = await pollLightroomJob(job, {
      intervalMs: 2000,
      onProgress: (status) => {
        console.log(`Job status: ${status.status}`);
      },
    });

    console.log('✓ Processing complete!');
    console.log('Output:', result.outputs?.[0]?.href);
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();
```

## License

MIT

## Related Packages

- [@musallam/firefly-client](../firefly-client) - Adobe Firefly Services API
- [@musallam/photoshop-client](../photoshop-client) - Adobe Photoshop API
- [@musallam/storage-and-collaboration-client](../storage-and-collaboration-client) - Adobe Cloud Storage API
- [@musallam/ims-client](../ims-client) - Adobe Identity Management Services

## Resources

- [Adobe Lightroom API Documentation](https://developer.adobe.com/firefly-services/docs/lightroom/)
- [API Reference](https://developer.adobe.com/firefly-services/docs/lightroom/api/)
