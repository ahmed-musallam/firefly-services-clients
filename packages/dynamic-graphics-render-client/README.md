# @musallam/dynamic-graphics-render-client

TypeScript client library for the Adobe Dynamic Graphics Render API (beta). This client provides a type-safe interface for inspecting and rendering Motion Graphics Templates (.mogrt files) with dynamic content.

## Features

- 🎬 **Template Inspection**: Analyze .mogrt templates to discover editable properties
- 🎨 **Dynamic Rendering**: Render templates with custom text, media, and controls
- 📺 **Preset Management**: Access various video export presets (aspect ratios, codecs)
- 🔄 **Job Polling**: Built-in utilities for tracking async rendering jobs
- 📘 **Full TypeScript Support**: Complete type definitions auto-generated from OpenAPI specs
- 🔐 **IMS Authentication**: Integrated Adobe IMS client for authentication

## Installation

```bash
npm install @musallam/dynamic-graphics-render-client @musallam/ims-client
```

## Quick Start

### Basic Setup

```typescript
import {
  DynamicGraphicsRenderClient,
  DYNAMIC_GRAPHICS_AXIOS_INSTANCE,
  pollDynamicGraphicsJob,
  TokenIMSClient,
} from '@musallam/dynamic-graphics-render-client';

// Setup authentication
const imsClient = new TokenIMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
});

// Configure the axios instance with authentication
DYNAMIC_GRAPHICS_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await imsClient.getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-api-key'] = 'YOUR_CLIENT_ID';
  return config;
});
```

### 1. Inspect a Template

First, inspect your .mogrt template to discover what properties can be customized:

```typescript
// Start template inspection
const describeJob = await DynamicGraphicsRenderClient.templateDescribe({
  source: {
    url: 'https://your-storage.com/templates/my-template.mogrt',
  },
  type: 'mogrt',
});

// Poll for completion
const templateInfo = await pollDynamicGraphicsJob(describeJob, {
  onProgress: (status) => {
    console.log(`Status: ${status.status}`);
    if (status.percentCompleted) {
      console.log(`Progress: ${status.percentCompleted}%`);
    }
  },
});

// Examine template structure
console.log('Available fonts:', templateInfo.output?.fonts);
console.log('Available elements:', templateInfo.output?.elements);
```

### 2. Get Available Presets

Fetch the list of available video rendering presets:

```typescript
const presets = await DynamicGraphicsRenderClient.getPresets();

console.log('Available presets:');
presets.items.forEach((preset) => {
  console.log(`- ${preset.label} (${preset.presetId})`);
  console.log(`  ${preset.codec}, ${preset.targetBitrateInKbps}kbps`);
});
```

Example presets:

- `ffs_video_api_land_1080p_hq` - Landscape 1920×1080 HQ
- `ffs_video_api_square_1080p_hq` - Square 1080×1080 HQ
- `ffs_video_api_vert_1920p_hq` - Vertical 1080×1920 HQ
- `ffs_video_api_prores` - ProRes with alpha channel

### 3. Render a Template

Render the template with your custom content:

```typescript
const renderJob = await DynamicGraphicsRenderClient.templateRender({
  source: {
    url: 'https://your-storage.com/templates/my-template.mogrt',
  },
  type: 'mogrt',

  // Optional: Custom fonts
  fonts: [
    {
      name: 'MyCustomFont',
      source: {
        url: 'https://your-storage.com/fonts/custom-font.otf',
      },
    },
  ],

  // Configuration
  config: {
    handleMissingFonts: 'fail', // or 'use_default'
  },

  // Variations to render
  variations: [
    {
      id: 'variation-1',
      presetIds: ['ffs_video_api_vert_1920p_hq'],
      elements: [
        {
          id: 'element-id-from-describe',
          type: 'mogrt',
          controls: [
            // Text control
            {
              id: 'control-id-1',
              label: 'Title',
              type: 'text',
              data: {
                text: 'Hello World!',
                font: {
                  name: 'MyCustomFont',
                },
              },
            },
            // Media control
            {
              id: 'control-id-2',
              label: 'Logo',
              type: 'media',
              data: {
                name: 'logo.png',
                mediaType: 'image/png',
                source: {
                  url: 'https://your-storage.com/media/logo.png',
                },
              },
              scale: 'fit_to_frame', // or 'no_scale', 'stretch_to_fill', 'fill_frame'
            },
            // Dropdown control
            {
              id: 'control-id-3',
              type: 'dropdown',
              label: 'Theme',
              data: {
                value: '0', // Index of the option
              },
            },
          ],
        },
      ],
    },
  ],
});

// Poll for completion
const result = await pollDynamicGraphicsJob(renderJob, {
  intervalMs: 3000, // Check every 3 seconds
  onProgress: (status) => {
    console.log(`Render status: ${status.status}`);
    if (status.percentCompleted) {
      console.log(`Progress: ${status.percentCompleted}%`);
    }
  },
});

// Get rendered video URL
if (result.outputs && result.outputs.length > 0) {
  result.outputs.forEach((output) => {
    console.log(`Variation ${output.variationId}:`);
    console.log(`  Download: ${output.destination.url}`);
    console.log(`  Preset: ${output.presetId}`);
  });
}

// Handle partial success
if (result.status === 'partially_succeeded' && result.errors) {
  console.error('Some variations failed:');
  result.errors.forEach((error) => {
    console.error(`  Variation ${error.variationId}: ${error.error.message}`);
  });
}
```

## API Reference

### Main Client

#### `DynamicGraphicsRenderClient.templateDescribe(request)`

Inspect a .mogrt template to discover editable properties.

**Parameters:**

- `request.source.url` - Pre-signed URL to the .mogrt file
- `request.type` - Template type (always `'mogrt'`)

**Returns:** Job response with `jobId` and `statusUrl`

#### `DynamicGraphicsRenderClient.templateRender(request)`

Render a template with custom content.

**Parameters:**

- `request.source.url` - Pre-signed URL to the .mogrt file
- `request.type` - Template type (always `'mogrt'`)
- `request.fonts` - Array of custom fonts (optional)
- `request.config.handleMissingFonts` - `'fail'` or `'use_default'`
- `request.variations` - Array of variations to render

**Returns:** Job response with `jobId` and `statusUrl`

#### `DynamicGraphicsRenderClient.getPresets()`

Fetch available video rendering presets.

**Returns:** List of preset configurations with details about codec, bitrate, resolution, etc.

#### `DynamicGraphicsRenderClient.getJobStatus(jobId)`

Get the current status of a job.

**Parameters:**

- `jobId` - The job ID from the initial request

**Returns:** Job status with progress and results

### Job Polling

#### `pollDynamicGraphicsJob(jobResult, options)`

Polls a job until completion.

**Parameters:**

- `jobResult` - Initial job response from describe or render
- `options.intervalMs` - Polling interval in ms (default: 2000)
- `options.maxAttempts` - Max polling attempts (default: 60)
- `options.timeoutMs` - Custom timeout (overrides maxAttempts)
- `options.onProgress` - Progress callback function
- `options.axiosRequestConfig` - Custom axios config

**Returns:** Final job status when completed

**Throws:**

- `PollingTimeoutError` - If timeout is reached
- `PollingError` - If job fails or polling encounters an error

### Control Types

Templates support various control types:

1. **Text Controls**

   ```typescript
   {
     type: 'text',
     data: {
       text: 'Your text here',
       font: { name: 'FontName' }
     }
   }
   ```

2. **Media Controls**

   ```typescript
   {
     type: 'media',
     data: {
       name: 'file.mp4',
       mediaType: 'video/mp4',
       source: { url: 'https://...' }
     },
     scale: 'fit_to_frame'
   }
   ```

3. **Dropdown Controls**

   ```typescript
   {
     type: 'dropdown',
     data: { value: '0' } // Index as string
   }
   ```

4. **Checkbox Controls**

   ```typescript
   {
     type: 'checkbox',
     data: { value: 'true' } // 'true' or 'false' as string
   }
   ```

5. **Slider Controls**
   ```typescript
   {
     type: 'slider',
     data: { value: '50' } // Numeric value as string
   }
   ```

## Custom Axios Configuration

You can customize the Axios instance for advanced use cases:

```typescript
import { DYNAMIC_GRAPHICS_AXIOS_INSTANCE } from '@musallam/dynamic-graphics-render-client';

// Add request interceptor
DYNAMIC_GRAPHICS_AXIOS_INSTANCE.interceptors.request.use((config) => {
  console.log('Request:', config.url);
  return config;
});

// Add response interceptor
DYNAMIC_GRAPHICS_AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
  }
);

// Configure timeout
DYNAMIC_GRAPHICS_AXIOS_INSTANCE.defaults.timeout = 30000;

// Use custom base URL (e.g., proxy)
DYNAMIC_GRAPHICS_AXIOS_INSTANCE.defaults.baseURL = 'https://your-proxy.com';
```

## Error Handling

```typescript
import { PollingError, PollingTimeoutError } from '@musallam/dynamic-graphics-render-client';

try {
  const result = await pollDynamicGraphicsJob(job);
  console.log('Success:', result);
} catch (error) {
  if (error instanceof PollingTimeoutError) {
    console.error('Job timed out after max attempts');
  } else if (error instanceof PollingError) {
    console.error('Job failed:', error.message);
    console.error('Job status:', error.status);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Job Status States

- `not_started` - Job queued but not yet processing
- `running` - Job is currently processing
- `succeeded` - All variations rendered successfully
- `partially_succeeded` - Some variations succeeded, others failed
- `failed` - Job failed completely

## Complete Example

See [samples/scripts/dynamic-graphics-render-sample.ts](../../samples/scripts/dynamic-graphics-render-sample.ts) for a complete working example.

## API Documentation

For detailed API documentation, see the [TypeDoc documentation](../../typedoc/dynamic-graphics-render-client).

## Resources

- [Adobe Dynamic Graphics Render API Documentation](https://developer.adobe.com/firefly-services/docs/)
- [Motion Graphics Templates (.mogrt) Guide](https://helpx.adobe.com/after-effects/using/creating-motion-graphics-templates.html)
- [Adobe Developer Console](https://developer.adobe.com/console)

## License

MIT
