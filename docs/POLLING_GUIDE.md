# Polling Guide

All Firefly async clients return a response with `statusUrl`, `jobId`, and `cancelUrl`. This guide shows how to poll for job completion.

## Quick Start

```typescript
import { ImageGenerationClient, pollJob } from '@musallam/firefly-services-clients';

const authOptions = {
  headers: {
    Authorization: `Bearer YOUR_ACCESS_TOKEN`,
    'x-api-key': 'YOUR_CLIENT_ID',
  },
};

// 1. Start the job
const job = await ImageGenerationClient.generateImagesV3Async({ prompt: 'A sunset' }, authOptions);

// 2. Poll until complete
const result = await pollJob(job.statusUrl, {
  fetchOptions: authOptions,
});

console.log('Done!', result);
```

## Three Polling Functions

### 1. `pollJob` - Poll a Single Job

Most common use case - poll one job until completion.

```typescript
import { pollJob } from '@musallam/firefly-services-clients';

const result = await pollJob(statusUrl, {
  fetchOptions: authOptions, // Required: auth headers
  intervalMs: 2000, // Optional: poll every 2s (default)
  maxAttempts: 60, // Optional: max 60 attempts (default)
  timeoutMs: 120000, // Optional: 2min timeout (overrides maxAttempts)
  onProgress: (status) => {
    // Optional: progress callback
    console.log(status.status); // 'pending' | 'running' | 'succeeded' | 'failed'
    console.log(status.progress); // 0-100
  },
});
```

### 2. `generateAndWait` - All-in-One Helper

Generate and wait in a single function call.

```typescript
import { ImageGenerationClient, generateAndWait } from '@musallam/firefly-services-clients';

const result = await generateAndWait(
  // Pass a function that calls your client
  (opts) => ImageGenerationClient.generateImagesV3Async(request, opts),
  authOptions,
  {
    intervalMs: 2000,
    onProgress: (status) => console.log(status.status),
  }
);
```

### 3. `pollJobs` - Poll Multiple Jobs in Parallel

Start multiple jobs and wait for all to complete.

```typescript
import { ImageGenerationClient, pollJobs } from '@musallam/firefly-services-clients';

// Start 3 jobs
const job1 = await ImageGenerationClient.generateImagesV3Async(request1, authOptions);
const job2 = await ImageGenerationClient.generateImagesV3Async(request2, authOptions);
const job3 = await ImageGenerationClient.generateImagesV3Async(request3, authOptions);

// Poll all in parallel
const [result1, result2, result3] = await pollJobs(
  [job1.statusUrl, job2.statusUrl, job3.statusUrl],
  { fetchOptions: authOptions }
);
```

## Options Reference

| Option         | Type          | Default     | Description                                  |
| -------------- | ------------- | ----------- | -------------------------------------------- |
| `fetchOptions` | `RequestInit` | `{}`        | **Required**: Auth headers and fetch options |
| `intervalMs`   | `number`      | `2000`      | Milliseconds between polls                   |
| `maxAttempts`  | `number`      | `60`        | Maximum polling attempts                     |
| `timeoutMs`    | `number`      | `undefined` | Total timeout in ms (overrides maxAttempts)  |
| `onProgress`   | `function`    | `undefined` | Callback for each status update              |

## Status Types

Each poll returns a status object:

```typescript
interface JobStatus {
  jobId: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'canceled';
  progress?: number; // 0-100
  result?: any; // Final result when status === 'succeeded'
}
```

## Error Handling

### PollingTimeoutError

Thrown when max attempts or timeout is reached.

```typescript
import { pollJob, PollingTimeoutError } from '@musallam/firefly-services-clients';

try {
  const result = await pollJob(statusUrl, {
    fetchOptions: authOptions,
    maxAttempts: 10,
  });
} catch (error) {
  if (error instanceof PollingTimeoutError) {
    console.error('Timed out after 10 attempts');
    console.log('Last status:', error.status);
  }
}
```

### PollingError

Thrown when job fails or is canceled.

```typescript
import { pollJob, PollingError } from '@musallam/firefly-services-clients';

try {
  const result = await pollJob(statusUrl, { fetchOptions: authOptions });
} catch (error) {
  if (error instanceof PollingError) {
    console.error('Job failed:', error.message);

    if (error.status?.status === 'failed') {
      console.log('Job failed');
    } else if (error.status?.status === 'canceled') {
      console.log('Job was canceled');
    }
  }
}
```

## Common Patterns

### Pattern 1: Simple Poll with Progress

```typescript
const result = await pollJob(job.statusUrl, {
  fetchOptions: authOptions,
  onProgress: (status) => {
    console.log(`[${status.jobId}] ${status.status} - ${status.progress}%`);
  },
});
```

### Pattern 2: Fast Polling with Timeout

```typescript
const result = await pollJob(job.statusUrl, {
  fetchOptions: authOptions,
  intervalMs: 500, // Check every 500ms
  timeoutMs: 30000, // 30 second timeout
});
```

### Pattern 3: Batch Processing

```typescript
const prompts = ['sunset', 'city', 'mountains'];

// Start all jobs
const jobs = await Promise.all(
  prompts.map((prompt) => ImageGenerationClient.generateImagesV3Async({ prompt }, authOptions))
);

// Poll all in parallel
const results = await pollJobs(
  jobs.map((job) => job.statusUrl),
  {
    fetchOptions: authOptions,
    intervalMs: 3000,
    onProgress: (status) => {
      console.log(`Job ${status.jobId}: ${status.status}`);
    },
  }
);

console.log(`Completed ${results.length} jobs`);
```

### Pattern 4: With Cancellation

```typescript
import { ImageGenerationClient, pollJob, PollingError } from '@musallam/firefly-services-clients';

const job = await ImageGenerationClient.generateImagesV3Async(request, authOptions);

// Set up a way to cancel
const controller = new AbortController();
setTimeout(() => {
  // Cancel after 10 seconds
  fetch(job.cancelUrl, {
    method: 'PUT',
    ...authOptions,
    signal: controller.signal,
  });
}, 10000);

try {
  const result = await pollJob(job.statusUrl, {
    fetchOptions: authOptions,
  });
} catch (error) {
  if (error instanceof PollingError && error.status?.status === 'canceled') {
    console.log('Job was canceled');
  }
}
```

## Works with All Async Clients

The polling utilities work with **all** async Firefly clients:

```typescript
import {
  ImageGenerationClient,
  GenerateSimilarClient,
  GenerateObjectCompositeClient,
  GenerativeExpandClient,
  GenerativeFillClient,
  GenerateVideoClient,
  pollJob,
} from '@musallam/firefly-services-clients';

// All return { statusUrl, jobId, cancelUrl }
const job1 = await ImageGenerationClient.generateImagesV3Async(...);
const job2 = await GenerateSimilarClient.generateSimilarImagesV3Async(...);
const job3 = await GenerativeExpandClient.expandImagesV3Async(...);
const job4 = await GenerativeFillClient.fillImagesV3Async(...);
const job5 = await GenerateObjectCompositeClient.generateObjectCompositeV3Async(...);
const job6 = await GenerateVideoClient.generateVideo(...);

// Poll any of them
const result = await pollJob(job1.statusUrl, { fetchOptions: authOptions });
```

## Best Practices

1. **Set Reasonable Timeouts**: Default is 2 minutes (60 attempts × 2s). Adjust based on operation complexity.

2. **Use onProgress**: Track progress for long-running operations:

   ```typescript
   onProgress: (status) => {
     if (status.progress) {
       updateProgressBar(status.progress);
     }
   };
   ```

3. **Handle Errors**: Always catch and handle `PollingError` and `PollingTimeoutError`.

4. **Batch Operations**: Use `pollJobs` for multiple operations - more efficient than sequential polling.

5. **Don't Poll Too Fast**: Default 2s interval is reasonable. Faster polling increases API load without much benefit.

## See Also

- [USAGE_EXAMPLES.md](../USAGE_EXAMPLES.md) - Full usage examples
- [README.md](../README.md) - Package documentation
- [Adobe Firefly Services Docs](https://developer.adobe.com/firefly-services/docs/guides/)
