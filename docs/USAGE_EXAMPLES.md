# Usage Examples

This document provides examples of how to use the Firefly Services Clients with the namespaced exports.

## Namespaced Exports

To avoid type conflicts between clients (e.g., multiple clients exporting `AlignmentHorizontal`), all clients are exported under their own namespaces.

### Import Pattern

```typescript
import {
  ImageGenerationClient,
  GenerateSimilarClient,
  GenerateObjectCompositeClient,
  GenerativeExpandClient,
  GenerativeFillClient,
  GenerateVideoClient,
  UploadImageClient,
  CustomModelsClient,
} from '@musallam/firefly-services-clients';
```

### Using Types from Different Clients

```typescript
// No conflicts! Each client has its own namespace
const alignment1: ImageGenerationClient.AlignmentHorizontal = 'center';
const alignment2: GenerateSimilarClient.AlignmentHorizontal = 'left';
const alignment3: GenerateObjectCompositeClient.AlignmentHorizontal = 'right';

// Access client functions
const result = await ImageGenerationClient.generateImagesV3Async({
  /* ... */
});
```

### Example: Image Generation

```typescript
import { ImageGenerationClient } from '@musallam/firefly-services-clients';

const authOptions = {
  headers: {
    Authorization: `Bearer YOUR_ACCESS_TOKEN`,
    'x-api-key': 'YOUR_CLIENT_ID',
  },
};

async function generateImage() {
  const result = await ImageGenerationClient.generateImagesV3Async(
    {
      prompt: 'A beautiful sunset over mountains',
      numVariations: 2,
      size: {
        width: 2048,
        height: 2048,
      },
      contentClass: ImageGenerationClient.ContentClassV3.photo,
    },
    authOptions
  );

  return result; // { jobId, statusUrl, cancelUrl }
}
```

### Example: Polling for Job Completion

```typescript
import { ImageGenerationClient, pollJob } from '@musallam/firefly-services-clients';

const authOptions = {
  headers: {
    Authorization: `Bearer YOUR_ACCESS_TOKEN`,
    'x-api-key': 'YOUR_CLIENT_ID',
  },
};

async function generateImageAndWait() {
  // Start the job
  const job = await ImageGenerationClient.generateImagesV3Async(
    {
      prompt: 'A beautiful sunset over mountains',
      contentClass: ImageGenerationClient.ContentClassV3.photo,
      size: { width: 2048, height: 2048 },
    },
    authOptions
  );

  console.log('Job started:', job.jobId);

  // Poll until complete
  const result = await pollJob(job.statusUrl, {
    fetchOptions: authOptions,
    intervalMs: 2000, // Check every 2 seconds
    maxAttempts: 60, // Max 2 minutes
    onProgress: (status) => {
      console.log(`Status: ${status.status}, Progress: ${status.progress}%`);
    },
  });

  console.log('Generated images:', result);
  return result;
}
```

### Example: Generate and Wait (One-Liner)

```typescript
import { ImageGenerationClient, generateAndWait } from '@musallam/firefly-services-clients';

async function quickGenerate() {
  const result = await generateAndWait(
    (opts) =>
      ImageGenerationClient.generateImagesV3Async(
        {
          prompt: 'A futuristic cityscape',
          contentClass: ImageGenerationClient.ContentClassV3.photo,
        },
        opts
      ),
    authOptions,
    {
      onProgress: (status) => console.log(`Status: ${status.status}`),
    }
  );

  return result;
}
```

### Example: Generate Similar Images with Polling

```typescript
import {
  GenerateSimilarClient,
  UploadImageClient,
  pollJob,
} from '@musallam/firefly-services-clients';

async function generateSimilarImages(imageUrl: string) {
  // Start the generation job
  const job = await GenerateSimilarClient.generateSimilarImagesV3Async(
    {
      image: {
        source: {
          url: imageUrl, // or use uploadId from UploadImageClient
        },
      },
      numVariations: 3,
      size: {
        width: 2048,
        height: 2048,
      },
    },
    authOptions
  );

  // Poll until complete
  const result = await pollJob(job.statusUrl, {
    fetchOptions: authOptions,
  });

  return result;
}
```

### Example: Poll Multiple Jobs in Parallel

```typescript
import { ImageGenerationClient, pollJobs } from '@musallam/firefly-services-clients';

async function generateMultipleImages() {
  const prompts = ['A sunset over mountains', 'A futuristic city', 'An abstract painting'];

  // Start all jobs
  const jobs = await Promise.all(
    prompts.map((prompt) =>
      ImageGenerationClient.generateImagesV3Async(
        {
          prompt,
          contentClass: ImageGenerationClient.ContentClassV3.photo,
        },
        authOptions
      )
    )
  );

  console.log('Started', jobs.length, 'jobs');

  // Poll all jobs in parallel
  const results = await pollJobs(
    jobs.map((job) => job.statusUrl),
    {
      fetchOptions: authOptions,
      intervalMs: 3000,
    }
  );

  console.log('All jobs completed!');
  return results;
}
```

### Example: Object Composite

```typescript
import { GenerateObjectCompositeClient } from '@musallam/firefly-services-clients';

async function compositeObject() {
  const result = await GenerateObjectCompositeClient.generateObjectCompositeV3Async({
    prompt: 'a red sports car',
    image: {
      source: {
        url: 'https://example.com/background.jpg',
      },
    },
    placement: {
      alignment: {
        horizontal: GenerateObjectCompositeClient.AlignmentHorizontal.center,
        vertical: GenerateObjectCompositeClient.AlignmentVertical.center,
      },
    },
  });

  return result;
}
```

### Alternative: Direct Import from Client Directory

If you prefer to avoid the namespace prefix in your code, you can import directly from the client directory:

```typescript
import * as ImageGen from '@musallam/firefly-services-clients/generated/image-generation-async-v3-client';

// Now use without the long namespace prefix
const alignment: ImageGen.AlignmentHorizontal = 'center';
await ImageGen.generateImagesV3Async({
  /* ... */
});
```

### Alternative: Import with Aliases

```typescript
import { ImageGenerationClient as ImgGen } from '@musallam/firefly-services-clients';

// Use with shorter alias
const result = await ImgGen.generateImagesV3Async({
  /* ... */
});
```

## Polling Utilities

The package provides three polling utilities for async jobs:

### `pollJob(statusUrl, options)`

Polls a single job until completion.

**Options:**

- `fetchOptions` - Authentication headers (required)
- `intervalMs` - Polling interval in milliseconds (default: 2000)
- `maxAttempts` - Maximum polling attempts (default: 60)
- `timeoutMs` - Custom timeout (overrides maxAttempts)
- `onProgress` - Callback for progress updates

```typescript
import { pollJob } from '@musallam/firefly-services-clients';

const result = await pollJob(job.statusUrl, {
  fetchOptions: authOptions,
  intervalMs: 2000,
  maxAttempts: 60,
  onProgress: (status) => console.log(status),
});
```

### `generateAndWait(generateFn, authOptions, pollOptions)`

Convenience function to generate and wait in one call.

```typescript
import { ImageGenerationClient, generateAndWait } from '@musallam/firefly-services-clients';

const result = await generateAndWait(
  (opts) => ImageGenerationClient.generateImagesV3Async(request, opts),
  authOptions,
  { intervalMs: 2000 }
);
```

### `pollJobs(statusUrls, options)`

Polls multiple jobs in parallel.

```typescript
import { pollJobs } from '@musallam/firefly-services-clients';

const results = await pollJobs([job1.statusUrl, job2.statusUrl, job3.statusUrl], {
  fetchOptions: authOptions,
});
```

## Error Handling

### Polling Errors

```typescript
import { pollJob, PollingError, PollingTimeoutError } from '@musallam/firefly-services-clients';

try {
  const result = await pollJob(job.statusUrl, {
    fetchOptions: authOptions,
    maxAttempts: 30,
  });
} catch (error) {
  if (error instanceof PollingTimeoutError) {
    console.error('Job timed out after max attempts');
    console.log('Last known status:', error.status);
  } else if (error instanceof PollingError) {
    console.error('Job failed:', error.message);
    console.log('Job status:', error.status);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### API Errors

```typescript
import { ImageGenerationClient } from '@musallam/firefly-services-clients';

try {
  const job = await ImageGenerationClient.generateImagesV3Async(request, authOptions);
  const result = await pollJob(job.statusUrl, { fetchOptions: authOptions });
} catch (error) {
  if (error instanceof Response) {
    // HTTP error from the API
    const errorData = await error.json();
    console.error('API Error:', errorData);
  } else {
    console.error('Error:', error);
  }
}
```

### Handling Job Cancellation

```typescript
import { ImageGenerationClient, pollJob } from '@musallam/firefly-services-clients';

const job = await ImageGenerationClient.generateImagesV3Async(request, authOptions);

// Cancel the job if needed
const cancelJob = async () => {
  await fetch(job.cancelUrl, {
    method: 'PUT',
    ...authOptions,
  });
};

// Poll will throw PollingError if job is canceled
try {
  const result = await pollJob(job.statusUrl, { fetchOptions: authOptions });
} catch (error) {
  if (error instanceof PollingError && error.status?.status === 'canceled') {
    console.log('Job was canceled');
  }
}
```
