# @musallam/firefly-client

TypeScript client library for the Adobe Firefly API.

This package is part of the [firefly-services-clients](https://github.com/ahmed-musallam/firefly-services-clients) monorepo.

## Features

- 🚀 **Full TypeScript support** with auto-generated types from OpenAPI spec
- 📦 **Comprehensive API coverage** for Firefly endpoints
- 🔄 **Job polling utilities** for long-running operations
- 🔐 **Built-in authentication** via IMS client
- 📝 **Typed responses** and strong intellisense

## Installation

```bash
npm install @musallam/firefly-client
```

## Quick start (recommended)

Use `IMSClient` and pass auth headers on each request (same pattern as the repo samples):

```typescript
import { FireflyApiClient, pollGenerateImagesJob, IMSClient } from '@musallam/firefly-client';

const imsClient = new IMSClient({
  clientId: process.env.ADOBE_CLIENT_ID!,
  clientSecret: process.env.ADOBE_CLIENT_SECRET!,
  scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
});

const authHeaders = await imsClient.getAuthHeaders();

const job = await FireflyApiClient.generateImagesV3Async(
  { prompt: 'A red bicycle on a cobblestone street at golden hour' },
  { headers: authHeaders }
);

const result = await pollGenerateImagesJob(job, {
  axiosRequestConfig: { headers: authHeaders },
});

console.log(
  'Images:',
  result?.result.outputs.map((o) => o.image.url)
);
```

## API surface (`FireflyApiClient`)

All functions are imported as **`FireflyApiClient`** from `@musallam/firefly-client`:

| Area              | Methods                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| **Async image**   | `generateImagesV3Async`, `generateSimilarImagesV3Async`, `expandImagesV3Async`, `fillImagesV3Async` |
| **Composites**    | `generateObjectCompositeV3Async`, `preciseComposite`, `adaptiveComposite`                           |
| **Video**         | `generateVideoV3`                                                                                   |
| **Custom models** | `getCustomModels`                                                                                   |
| **Upload**        | `storageImageV2` (JPEG body; see spec for content type)                                             |
| **Job control**   | `jobResultV3`, `cancelJobV4`                                                                        |

Async POSTs return an acceptance payload (e.g. `jobId`, `statusUrl`). Poll using the helpers below.

## Job polling

Async jobs return `{ statusUrl, ... }`. Poll until completion:

```typescript
import {
  FireflyApiClient,
  pollFireflyJob,
  pollGenerateImagesJob,
  pollGenerateSimilarJob,
  pollGenerateObjectCompositeJob,
  pollGenerateVideoJob,
  pollGenerateExpandJob,
  pollGenerateFillJob,
} from '@musallam/firefly-client';

// Generic — you supply the result type
const typed = await pollFireflyJob<YourResultType>(job, {
  axiosRequestConfig: { headers: authHeaders },
  intervalMs: 2000,
  maxAttempts: 60,
  onProgress: (status) => console.log(status.status, status.progress),
});

// Typed helpers (wrap pollFireflyJob with the right result type)
await pollGenerateImagesJob(job, { axiosRequestConfig: { headers: authHeaders } });
await pollGenerateSimilarJob(job, { axiosRequestConfig: { headers: authHeaders } });
await pollGenerateObjectCompositeJob(job, { axiosRequestConfig: { headers: authHeaders } });
await pollGenerateVideoJob(job, { axiosRequestConfig: { headers: authHeaders } });
await pollGenerateExpandJob(job, { axiosRequestConfig: { headers: authHeaders } });
await pollGenerateFillJob(job, { axiosRequestConfig: { headers: authHeaders } });
```

## Object composite example

```typescript
const job = await FireflyApiClient.generateObjectCompositeV3Async(
  {
    prompt: 'Your scene description',
    // ...see GenerateObjectCompositeRequestV3 / BodyGenerateObjectCompositeV3Async in generated types
  },
  { headers: authHeaders }
);

const result = await pollGenerateObjectCompositeJob(job, {
  axiosRequestConfig: { headers: authHeaders },
});
```

## Custom models (sync GET)

```typescript
const models = await FireflyApiClient.getCustomModels({ limit: 20 }, { headers: authHeaders });
```

## Alternative: Axios interceptors

If you prefer a global interceptor on `FIREFLY_AXIOS_INSTANCE`:

```typescript
import { FIREFLY_AXIOS_INSTANCE, FireflyApiClient, TokenIMSClient } from '@musallam/firefly-client';

const imsClient = new TokenIMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
});

FIREFLY_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await imsClient.getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-api-key'] = 'YOUR_CLIENT_ID';
  return config;
});

await FireflyApiClient.getCustomModels();
```

## Custom Axios / proxy

```typescript
import { FIREFLY_AXIOS_INSTANCE } from '@musallam/firefly-client';

FIREFLY_AXIOS_INSTANCE.defaults.baseURL = 'https://your-proxy.example.com';
FIREFLY_AXIOS_INSTANCE.defaults.timeout = 60000;
```

## Migrating from older `@musallam/firefly-client` (multiple clients)

Previously, the package exported separate namespaces such as `ImageGenerationClient`, `CustomModelsClient`, etc. **Now everything is under `FireflyApiClient`.**

| Before                                             | After                                         |
| -------------------------------------------------- | --------------------------------------------- |
| `ImageGenerationClient.generateImagesV3Async(...)` | `FireflyApiClient.generateImagesV3Async(...)` |
| `CustomModelsClient.getCustomModels(...)`          | `FireflyApiClient.getCustomModels(...)`       |
| `UploadImageClient.storageImageV2(...)`            | `FireflyApiClient.storageImageV2(...)`        |

Polling helpers (`pollGenerateImagesJob`, etc.) still exist; ensure the job object includes `statusUrl` from the async response.

## TypeDoc / reference

👉 [Package API docs](https://ahmed-musallam.github.io/firefly-services-clients/firefly-client/) (when published)

## License

MIT
