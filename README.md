# @musallam/firefly-services-client

TypeScript client library for [Adobe Firefly Services API](https://developer.adobe.com/firefly-services/docs/guides/)

## Features

- 🔥 Full TypeScript support with complete type definitions
- 🎨 Support for all Firefly API operations:
  - Text to Image generation
  - Image expansion
  - Generative fill
  - Similar image generation
  - Object composite generation
  - Video generation
- 🔐 Multiple authentication strategies (OAuth2, Token-based)
- 📦 ESM and CommonJS support
- 🚀 Modern async/await API

## Installation

```bash
npm install @musallam/firefly-services-client
```

## Quick Start

### Using OAuth2 Client Credentials (Recommended)

```typescript
import { FireflyClient, IMSClient } from '@musallam/firefly-services-client';

// Initialize IMS client with your credentials
const imsClient = new IMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
});

// Create Firefly client
const firefly = new FireflyClient(imsClient);

// Generate images
const result = await firefly.generateImagesAsync({
  prompt: 'A futuristic city at sunset',
  numVariations: 2,
  size: { width: 1024, height: 1024 },
});

console.log('Job ID:', result.jobID);

// Poll for results
const jobStatus = await firefly.getJobStatus(result.jobID);
console.log('Generated images:', jobStatus.outputs);
```

### Using Pre-issued Access Token

```typescript
import { FireflyClient, TokenIMSClient } from '@musallam/firefly-services-client';

const imsClient = new TokenIMSClient({
  accessToken: 'YOUR_ACCESS_TOKEN',
  clientId: 'YOUR_CLIENT_ID',
});

const firefly = new FireflyClient(imsClient);
```

## API Reference

### FireflyClient

#### Image Generation

- `generateImagesAsync(request)` - Generate images from text prompt
- `generateImagesAndWait(request, maxRetries?, interval?)` - Generate and wait for completion
- `generateSimilarImagesAsync(request)` - Generate similar variations of an image
- `expandImageAsync(request)` - Expand an image using AI

#### Image Editing

- `fillImageAsync(request)` - Fill/remove parts of an image using generative fill
- `generateObjectCompositeAsync(request)` - Generate objects and composite them into images

#### Video Generation

- `generateVideoAsync(request)` - Generate videos from images or prompts

#### Job Management

- `getJobStatus(jobID)` - Check the status of an async job
- `cancelJob(jobID)` - Cancel a running job

#### Utilities

- `uploadImage(imageSource)` - Upload an image and get a storage URL

## Authentication Options

### 1. OAuth2 Client Credentials (`IMSClient`)

Recommended for server-to-server applications. Handles token refresh automatically.

### 2. Token-based (`TokenIMSClient`)

For scenarios where you already have a valid access token.

## Constants

The library exports useful constants for API parameters:

```typescript
import {
  CameraMotion,
  PromptStyle,
  ShotAngle,
  ShotSize,
  ModelVersion,
} from '@musallam/firefly-services-client';
```

## Examples

See the [Adobe Firefly Services documentation](https://developer.adobe.com/firefly-services/docs/guides/) for detailed examples and API reference.

## Development

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format

# Build
npm run build
```

## Contributing

This project uses:

- Conventional Commits for commit messages
- ESLint + Prettier for code quality
- Semantic Release for automated versioning

## License

MIT
