# @musallam/firefly-services-clients

TypeScript client library for [Adobe Firefly Services API](https://developer.adobe.com/firefly-services/docs/guides/)

> **Auto-generated clients** powered by [Orval](https://orval.dev/) from official Adobe Firefly OpenAPI specifications.

## Features

- 🔥 **Full TypeScript support** with complete type definitions
- 🤖 **Auto-generated clients** from OpenAPI specs using Orval
- 🎨 **Complete API coverage** for all Firefly operations:
  - Text to Image generation
  - Image expansion
  - Generative fill
  - Similar image generation
  - Object composite generation
  - Video generation
  - Custom models
  - Image upload
- 🏷️ **Namespaced exports** to avoid type conflicts between clients
- ⚡ **Type-safe job polling** with progress tracking and error handling
- 🎯 **Full type inference** for polling results and progress callbacks
- 🔐 **Fetch-based** with flexible authentication
- 📦 **ESM and CommonJS** support
- 🚀 **Modern async/await** API

## Installation

```bash
npm install @musallam/firefly-services-clients
```

## Quick Start

> **Note:** All clients are exported under namespaces to avoid type conflicts. See [docs/USAGE_EXAMPLES.md](./docs/USAGE_EXAMPLES.md) for detailed examples.

### Generate Images

```typescript
import { ImageGenerationClient } from '@musallam/firefly-services-clients';

const authOptions = {
  headers: {
    Authorization: `Bearer YOUR_ACCESS_TOKEN`,
    'x-api-key': 'YOUR_CLIENT_ID',
  },
};

// Start image generation job
const job = await ImageGenerationClient.generateImagesV3Async(
  {
    prompt: 'A futuristic city at sunset',
    numVariations: 2,
    size: { width: 2048, height: 2048 },
    contentClass: ImageGenerationClient.ContentClassV3.photo,
  },
  authOptions
);

console.log('Job started:', job.jobId);
console.log('Status URL:', job.statusUrl);
```

### Poll Until Complete

Use the built-in polling utility to automatically wait for job completion with full type safety:

```typescript
import { ImageGenerationClient, pollJob } from '@musallam/firefly-services-clients';

// Start the job
const job = await ImageGenerationClient.generateImagesV3Async(
  {
    prompt: 'A futuristic city at sunset',
    size: { width: 2048, height: 2048 },
  },
  authOptions
);

// Poll until complete with explicit result type for full type safety
const result = await pollJob<ImageGenerationClient.GenerateImagesResponseV3>(job, {
  fetchOptions: authOptions,
  intervalMs: 2000, // Check every 2 seconds
  onProgress: (status) => {
    console.log(`Status: ${status.status}, Progress: ${status.progress}%`);
    if (status.result) {
      // status.result is properly typed!
      console.log(`Generated ${status.result.outputs.length} images so far`);
    }
  },
});

// result is typed as GenerateImagesResponseV3
console.log('Generated images:', result.outputs);
result.outputs.forEach((output) => {
  console.log(`Image URL: ${output.image.url}`);
});
```

## Available Clients

All clients are exported under their own namespace to prevent type conflicts:

| Client                          | Description                         | Source                                      |
| ------------------------------- | ----------------------------------- | ------------------------------------------- |
| `ImageGenerationClient`         | Text-to-image generation            | `image-generation-async-v3-client`          |
| `GenerateSimilarClient`         | Generate similar image variations   | `generate-similar-async-v3-client`          |
| `GenerateObjectCompositeClient` | Composite objects into images       | `generate-object-composite-async-v3-client` |
| `GenerativeExpandClient`        | Expand images with AI               | `generative-expand-async-v3-client`         |
| `GenerativeFillClient`          | Generative fill/remove objects      | `generative-fill-async-v3-client`           |
| `GenerateVideoClient`           | Generate videos from images/prompts | `generate-video-api-client`                 |
| `UploadImageClient`             | Upload images to Firefly storage    | `upload-image-client`                       |
| `CustomModelsClient`            | List and manage custom models       | `custom-models-listing-client`              |

### Usage Pattern

```typescript
import {
  ImageGenerationClient,
  GenerateSimilarClient,
  UploadImageClient,
} from '@musallam/firefly-services-clients';

// Each client has its own types - no conflicts!
const alignment1: ImageGenerationClient.AlignmentHorizontal = 'center';
const alignment2: GenerateSimilarClient.AlignmentHorizontal = 'left';

// Use client functions
const result = await ImageGenerationClient.generateImagesV3Async(request, authOptions);
```

## Authentication

All Firefly API calls require authentication headers with an access token and API key.

### Built-in IMS Client

This library includes an `IMSClient` that handles OAuth 2.0 Client Credentials flow automatically:

```typescript
import { IMSClient, ImageGenerationClient } from '@musallam/firefly-services-clients';

// Create IMS client
const imsClient = new IMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
});

// Get auth headers (handles token fetching and caching)
const authHeaders = await imsClient.getAuthHeaders();

// Use with any client
const job = await ImageGenerationClient.generateImagesV3Async(request, {
  headers: authHeaders,
});
```

**Features:**

- ✅ Automatic token fetching and caching
- ✅ Token expiration handling with 60s buffer
- ✅ OAuth 2.0 Client Credentials flow
- ✅ Returns properly formatted headers (`Authorization`, `x-api-key`)

### Manual Authentication

If you already have an access token, pass it directly:

```typescript
const authOptions = {
  headers: {
    Authorization: `Bearer YOUR_ACCESS_TOKEN`,
    'x-api-key': 'YOUR_CLIENT_ID',
  },
};

const job = await ImageGenerationClient.generateImagesV3Async(request, authOptions);
```

### Custom IMS Client

You can implement your own authentication strategy by implementing the `IIMSClient` interface:

```typescript
import { IIMSClient } from '@musallam/firefly-services-clients';

class MyCustomIMSClient implements IIMSClient {
  async getAccessToken(): Promise<string> {
    // Your custom token fetching logic
    // e.g., fetch from cache, service account, etc.
    return 'your_access_token';
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      'x-api-key': 'YOUR_CLIENT_ID',
    };
  }
}

// Use your custom client
const myClient = new MyCustomIMSClient();
const authHeaders = await myClient.getAuthHeaders();
```

**Use cases for custom clients:**

- Token caching in Redis or external cache
- Service account authentication
- Integration with existing auth systems
- Custom token refresh logic
- Multi-tenant authentication

### Token-only IMS Client

For scenarios where you already have a long-lived access token:

```typescript
import { TokenIMSClient } from '@musallam/firefly-services-clients';

const tokenClient = new TokenIMSClient({
  accessToken: 'YOUR_EXISTING_TOKEN',
  clientId: 'YOUR_CLIENT_ID',
});

const authHeaders = await tokenClient.getAuthHeaders();
```

For more details on obtaining credentials, see the [Adobe Firefly Services Authentication Guide](https://developer.adobe.com/firefly-services/docs/guides/authentication/).

## Image Upload

For uploading images to Firefly storage (for use with operations like generate similar, expand, fill), use the `uploadImage` utility:

```typescript
import { uploadImage } from '@musallam/firefly-services-clients';

// Read your image file
const imageBuffer = readFileSync('./my-image.jpg');
const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });

// Upload to Firefly storage
const uploadResult = await uploadImage(imageBlob, {
  headers: authHeaders,
});

const uploadId = uploadResult.images[0].id;

// Use the uploadId in other operations
const job = await GenerateSimilarClient.generateSimilarImagesV3Async(
  {
    image: {
      source: { uploadId },
    },
    numVariations: 3,
  },
  { headers: authHeaders }
);
```

**Note:** Use `uploadImage` instead of `UploadImageClient.storageImageV2` as it properly handles binary data uploads. The generated client has a limitation with Blob serialization that this utility addresses.

## Job Polling

All async operations return `{ jobId, statusUrl, cancelUrl }`. Use the polling utilities to wait for completion:

### `pollJob<TResult>(jobResult, options)`

Polls a single job until completion with full TypeScript type safety. Specify the result type explicitly for the best developer experience:

```typescript
import { ImageGenerationClient, pollJob } from '@musallam/firefly-services-clients';

// Recommended: Specify the result type for full type safety
const result = await pollJob<ImageGenerationClient.GenerateImagesResponseV3>(job, {
  fetchOptions: authOptions,
  intervalMs: 2000, // Poll every 2 seconds (default)
  maxAttempts: 60, // Max 60 attempts (default: 120 seconds)
  timeoutMs: 300000, // Or set explicit 5-minute timeout
  onProgress: (status) => {
    console.log(`Status: ${status.status}`);
    console.log(`Progress: ${status.progress}%`);
    // status.result is properly typed as GenerateImagesResponseV3 | undefined
    if (status.result) {
      console.log(`Generated ${status.result.outputs.length} images`);
    }
  },
});

// result is typed as GenerateImagesResponseV3
console.log(`Image URL: ${result.outputs[0].image.url}`);
```

**Available Result Types:**

- `ImageGenerationClient.GenerateImagesResponseV3`
- `GenerativeExpandClient.ExpandImageResponseV3`
- `GenerativeFillClient.FillImageResponseV3`
- `GenerateSimilarClient.GenerateSimilarImagesResponseV3`
- `GenerateObjectCompositeClient.GenerateObjectCompositeResponseV3`
- `GenerateVideoClient.AsyncResult`

See [docs/TYPE_INFERENCE_GUIDE.md](./docs/TYPE_INFERENCE_GUIDE.md) for detailed examples.

### Polling Multiple Jobs

You can poll multiple jobs in parallel using `Promise.all`:

```typescript
import { pollJob, ImageGenerationClient } from '@musallam/firefly-services-clients';

const jobs = [job1, job2, job3];

const results = await Promise.all(
  jobs.map((job) =>
    pollJob<ImageGenerationClient.GenerateImagesResponseV3>(job, {
      fetchOptions: authOptions,
    })
  )
);

// results is an array of GenerateImagesResponseV3
results.forEach((result, index) => {
  console.log(`Job ${index + 1} generated ${result.outputs.length} images`);
});
```

### Error Handling

```typescript
import {
  ImageGenerationClient,
  pollJob,
  PollingError,
  PollingTimeoutError,
} from '@musallam/firefly-services-clients';

try {
  const result = await pollJob<ImageGenerationClient.GenerateImagesResponseV3>(job, {
    fetchOptions: authOptions,
    maxAttempts: 30,
  });
  console.log(`Success! Generated ${result.outputs.length} images`);
} catch (error) {
  if (error instanceof PollingTimeoutError) {
    console.error('Job timed out after maximum attempts');
  } else if (error instanceof PollingError) {
    console.error('Job failed:', error.message);
    console.log('Job status:', error.status);
  }
}
```

## Architecture

This package uses **Orval** to auto-generate TypeScript clients from OpenAPI specifications:

```
build-scripts/
  ├── fetch-spec.ts          # Downloads OpenAPI specs
  └── spec-urls.ts           # Configuration for spec URLs

src/
  ├── spec/                  # OpenAPI spec files (JSON)
  ├── generated/             # Auto-generated clients (DO NOT EDIT)
  │   ├── image-generation-async-v3-client/
  │   ├── generate-similar-async-v3-client/
  │   └── ...
  ├── extension/             # Custom extensions
  │   └── job-polling-extension.ts
  ├── mutator/               # Custom fetch client
  └── index.ts               # Main entry (namespaced exports)

orval.config.ts              # Orval configuration
```

### Code Generation Workflow

1. **Fetch specs**: Download OpenAPI specs from Adobe

   ```bash
   npm run fetch-spec
   ```

2. **Generate clients**: Generate TypeScript clients using Orval

   ```bash
   npm run orval
   ```

3. **Build**: Bundle the library
   ```bash
   npm run build
   ```

### Namespaced Exports

To avoid type name conflicts (e.g., multiple clients exporting `AlignmentHorizontal`), all clients are imported and re-exported under namespaces in `src/index.ts`:

```typescript
// src/index.ts
import * as ImageGenerationClient from './generated/image-generation-async-v3-client/index.js';
import * as GenerateSimilarClient from './generated/generate-similar-async-v3-client/index.js';

export {
  ImageGenerationClient,
  GenerateSimilarClient,
  // ...
};
```

This allows consumers to use:

```typescript
const type1: ImageGenerationClient.AlignmentHorizontal = 'center';
const type2: GenerateSimilarClient.AlignmentHorizontal = 'left';
// No conflicts!
```

## More Examples

See [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for comprehensive examples including:

- All client types with usage examples
- Polling patterns and error handling
- Batch processing multiple jobs
- Working with different content types

Also check the [Adobe Firefly Services documentation](https://developer.adobe.com/firefly-services/docs/guides/) for API details and guides.

## Development

### Setup

```bash
# Install dependencies
npm install

# Download OpenAPI specs
npm run fetch-spec

# Generate clients from specs
npm run orval
```

### Common Commands

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format

# Build library
npm run build

# Run all checks
npm run type-check && npm run lint
```

### Regenerating Clients

When Adobe updates their OpenAPI specs:

```bash
# 1. Download latest specs
npm run fetch-spec

# 2. Regenerate clients
npm run orval

# 3. Verify everything works
npm run type-check
npm run build
```

### Project Structure

- **`src/generated/`** - Auto-generated code (never edit manually)
- **`src/extension/`** - Custom utilities and extensions
- **`src/mutator/`** - Custom fetch implementation
- **`orval.config.ts`** - Orval configuration for code generation
- **`build-scripts/`** - Scripts for fetching specs and automation

## Contributing

This project uses:

- **[Orval](https://orval.dev/)** - OpenAPI to TypeScript code generation
- **Conventional Commits** for commit messages
- **ESLint + Prettier** for code quality
- **Husky** for git hooks
- **Semantic Release** for automated versioning

### Contributing Guidelines

1. Never edit files in `src/generated/` directly - they are auto-generated
2. Use conventional commits format: `feat:`, `fix:`, `docs:`, etc.
3. Run linter and type-check before committing
4. Extensions and utilities go in `src/extension/`

## License

MIT

---

**Built with** [Orval](https://orval.dev/) | **API by** [Adobe Firefly Services](https://developer.adobe.com/firefly-services/)
