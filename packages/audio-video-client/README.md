# @musallam/audio-video-client

TypeScript client library for the Adobe Audio and Video API - programmatically render dynamic graphics templates, process audio, and manipulate video content.

## Features

- 🚀 **Full TypeScript support** with auto-generated types from OpenAPI spec
- 📦 **Complete API coverage** for all Audio and Video API endpoints
- 🔄 **Job polling utilities** for async operations
- 🔐 **Built-in authentication** via IMS client
- 📝 **Comprehensive documentation** and examples
- 🎨 **Dynamic Graphics Rendering** - Render templates with custom data
- 🎵 **Audio Processing** - Audio manipulation and processing
- 🎬 **Video Processing** - Video editing and transformations

## Installation

```bash
npm install @musallam/audio-video-client
```

## Quick Start

```typescript
import {
  AudioVideoClient,
  AUDIO_VIDEO_AXIOS_INSTANCE,
  IMSClient,
  pollAudioVideoJob,
} from '@musallam/audio-video-client';

// 1. Setup authentication
const imsClient = new IMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
});

// 2. Get auth headers
const authHeaders = await imsClient.getAuthHeaders();

// 3. Describe a template
const templateInfo = await AudioVideoClient.templateDescribe(
  { templateId: 'your-template-id' },
  { headers: authHeaders }
);

// 4. Render template with custom data
const job = await AudioVideoClient.templateRender(
  {
    source: {
      id: 'your-template-id',
    },
    variations: [
      {
        controls: [
          {
            id: 'text-control-1',
            type: 'text',
            data: {
              value: 'Hello World',
            },
          },
        ],
      },
    ],
  },
  { headers: authHeaders }
);

// 5. Poll for results
const result = await pollAudioVideoJob(job, {
  axiosRequestConfig: { headers: authHeaders },
  onProgress: (status) => console.log(`Status: ${status.status}`),
});

console.log('Rendered output:', result.outputs?.[0]?.url);
```

## API Coverage

The client provides full TypeScript support for:

### Dynamic Graphics Rendering

- `templateDescribe()` - Get template metadata and controls
- `templateRender()` - Render template with custom data
- Template controls for text, media, colors, and more

### Job Management

- `jobStatus()` - Get job status
- `pollAudioVideoJob()` - Poll until completion (utility)

### Additional Features

- Audio processing endpoints
- Video processing endpoints
- Asset management

## Usage Examples

### Describe a Template

```typescript
const templateInfo = await AudioVideoClient.templateDescribe(
  { templateId: 'my-template-id' },
  { headers: authHeaders }
);

console.log('Template:', templateInfo.name);
console.log(
  'Controls:',
  templateInfo.controls?.map((c) => c.id)
);
```

### Render Template with Text Control

```typescript
const job = await AudioVideoClient.templateRender(
  {
    source: {
      id: 'template-123',
    },
    variations: [
      {
        controls: [
          {
            id: 'headline',
            type: 'text',
            data: {
              value: 'Welcome to Adobe!',
              fontSize: 48,
              fontColor: '#FF0000',
            },
          },
        ],
      },
    ],
  },
  { headers: authHeaders }
);

const result = await pollAudioVideoJob(job, {
  axiosRequestConfig: { headers: authHeaders },
});
```

### Render Template with Media Control

```typescript
const job = await AudioVideoClient.templateRender(
  {
    source: {
      id: 'video-template',
    },
    variations: [
      {
        controls: [
          {
            id: 'background-image',
            type: 'media',
            data: {
              url: 'https://your-bucket.s3.amazonaws.com/image.jpg',
            },
          },
        ],
      },
    ],
  },
  { headers: authHeaders }
);
```

### Render Multiple Variations

```typescript
const job = await AudioVideoClient.templateRender(
  {
    source: {
      id: 'template-123',
    },
    variations: [
      {
        controls: [{ id: 'title', type: 'text', data: { value: 'Variation 1' } }],
      },
      {
        controls: [{ id: 'title', type: 'text', data: { value: 'Variation 2' } }],
      },
      {
        controls: [{ id: 'title', type: 'text', data: { value: 'Variation 3' } }],
      },
    ],
  },
  { headers: authHeaders }
);

const result = await pollAudioVideoJob(job, {
  axiosRequestConfig: { headers: authHeaders },
});

console.log(`Rendered ${result.outputs?.length} variations`);
```

## Job Polling

The `pollAudioVideoJob` utility works with **all job types** in the Audio and Video API:

- Template jobs (describe, render)
- Speech generation
- Transcription
- Dubbing
- Avatar generation
- Video reframing (v1 and v2)

### Basic Polling

```typescript
import { pollAudioVideoJob, PollingTimeoutError } from '@musallam/audio-video-client';

try {
  const result = await pollAudioVideoJob(jobResult, {
    axiosRequestConfig: { headers: authHeaders },
    intervalMs: 2000, // Poll every 2 seconds
    maxAttempts: 60, // Try up to 60 times
    timeoutMs: 300000, // Or timeout after 5 minutes
    onProgress: (status) => {
      console.log(`Status: ${status.status}`);
      if ('percentCompleted' in status && status.percentCompleted) {
        console.log(`Progress: ${status.percentCompleted}%`);
      }
    },
  });

  console.log('Job completed:', result);
} catch (error) {
  if (error instanceof PollingTimeoutError) {
    console.error('Job timed out');
  } else {
    console.error('Job failed:', error);
  }
}
```

### Polling Different Job Types

```typescript
// Template rendering
const renderJob = await AudioVideoClient.templateRender(
  { source, variations },
  { headers: authHeaders }
);
const renderResult = await pollAudioVideoJob(renderJob, {
  axiosRequestConfig: { headers: authHeaders },
});

// Speech generation
const speechJob = await AudioVideoClient.generateSpeech(
  { text: 'Hello world' },
  { headers: authHeaders }
);
const speechResult = await pollAudioVideoJob(speechJob, {
  axiosRequestConfig: { headers: authHeaders },
});

// Video reframing
const reframeJob = await AudioVideoClient.generateReframedVideoV2(
  { input, outputs },
  { headers: authHeaders }
);
const reframeResult = await pollAudioVideoJob(reframeJob, {
  axiosRequestConfig: { headers: authHeaders },
});

// Avatar generation
const avatarJob = await AudioVideoClient.generateAvatar(
  { transcript, voice, avatar },
  { headers: authHeaders }
);
const avatarResult = await pollAudioVideoJob(avatarJob, {
  axiosRequestConfig: { headers: authHeaders },
});

// Transcription
const transcribeJob = await AudioVideoClient.transcribe({ input }, { headers: authHeaders });
const transcribeResult = await pollAudioVideoJob(transcribeJob, {
  axiosRequestConfig: { headers: authHeaders },
});

// Dubbing
const dubJob = await AudioVideoClient.dub({ input, targetLanguage }, { headers: authHeaders });
const dubResult = await pollAudioVideoJob(dubJob, { axiosRequestConfig: { headers: authHeaders } });
```

## Error Handling

```typescript
import axios from 'axios';

try {
  const job = await AudioVideoClient.templateRender(request, { headers: authHeaders });
} catch (error) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 400:
        console.error('Bad Request:', data.message);
        break;
      case 401:
        console.error('Unauthorized - check your credentials');
        break;
      case 403:
        console.error('Forbidden:', data.message);
        break;
      case 404:
        console.error('Template Not Found');
        break;
      case 429:
        console.error('Rate Limit Exceeded');
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
import { AUDIO_VIDEO_AXIOS_INSTANCE } from '@musallam/audio-video-client';

// Add custom headers
AUDIO_VIDEO_AXIOS_INSTANCE.defaults.headers.common['X-Custom-Header'] = 'value';

// Add request interceptor
AUDIO_VIDEO_AXIOS_INSTANCE.interceptors.request.use((config) => {
  console.log(`Making request to ${config.url}`);
  return config;
});

// Add response interceptor
AUDIO_VIDEO_AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Request failed:', error.message);
    return Promise.reject(error);
  }
);
```

### Timeout Configuration

```typescript
AUDIO_VIDEO_AXIOS_INSTANCE.defaults.timeout = 30000; // 30 seconds
```

## TypeScript Support

All types are automatically generated from the OpenAPI spec:

```typescript
import type {
  TemplateDescribeRequest,
  TemplateDescribeResponse,
  TemplateRenderRequest,
  TemplateRenderResponse,
  JobStatus,
  Control,
} from '@musallam/audio-video-client';

const request: TemplateRenderRequest = {
  source: {
    id: 'template-123',
  },
  variations: [
    {
      controls: [
        {
          id: 'text-1',
          type: 'text',
          data: {
            value: 'Hello World',
          },
        },
      ],
    },
  ],
};

const job = await AudioVideoClient.templateRender(request, { headers: authHeaders });
```

## Complete Example

```typescript
import { AudioVideoClient, IMSClient, pollAudioVideoJob } from '@musallam/audio-video-client';

async function renderTemplate() {
  // Setup authentication
  const imsClient = new IMSClient({
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
  });

  const authHeaders = await imsClient.getAuthHeaders();

  try {
    // Get template info
    console.log('Fetching template info...');
    const templateInfo = await AudioVideoClient.templateDescribe(
      { templateId: 'my-template' },
      { headers: authHeaders }
    );
    console.log('Template name:', templateInfo.name);

    // Render template
    console.log('Rendering template...');
    const job = await AudioVideoClient.templateRender(
      {
        source: { id: 'my-template' },
        variations: [
          {
            controls: [
              {
                id: 'headline',
                type: 'text',
                data: { value: 'Dynamic Content!' },
              },
            ],
          },
        ],
      },
      { headers: authHeaders }
    );

    // Poll for completion
    const result = await pollAudioVideoJob(job, {
      axiosRequestConfig: { headers: authHeaders },
      intervalMs: 2000,
      onProgress: (status) => {
        console.log(`Job status: ${status.status}`);
      },
    });

    console.log('✓ Rendering complete!');
    console.log('Output:', result.outputs?.[0]?.url);
  } catch (error) {
    console.error('Error rendering template:', error);
  }
}

renderTemplate();
```

## Migration from @musallam/dynamic-graphics-render-client

If you were using `@musallam/dynamic-graphics-render-client`, migrating to this package is straightforward:

```typescript
// Old:
import { DynamicGraphicsRenderClient } from '@musallam/dynamic-graphics-render-client';

// New:
import { AudioVideoClient } from '@musallam/audio-video-client';

// The API is the same, just rename the import
const job = await AudioVideoClient.templateRender(request, { headers: authHeaders });
```

**Note:** `@musallam/dynamic-graphics-render-client` is now deprecated in favor of this package.

## License

MIT

## Related Packages

- [@musallam/firefly-client](../firefly-client) - Adobe Firefly Services API
- [@musallam/photoshop-client](../photoshop-client) - Adobe Photoshop API
- [@musallam/lightroom-client](../lightroom-client) - Adobe Lightroom API
- [@musallam/storage-and-collaboration-client](../storage-and-collaboration-client) - Adobe Cloud Storage API
- [@musallam/ims-client](../ims-client) - Adobe Identity Management Services

## Resources

- [Adobe Audio and Video API Documentation](https://developer.adobe.com/firefly-services/docs/audio-video/)
- [API Reference](https://developer.adobe.com/firefly-services/docs/audio-video/api/)
- [Dynamic Graphics Guide](https://developer.adobe.com/firefly-services/docs/audio-video/dynamic-graphics/)
