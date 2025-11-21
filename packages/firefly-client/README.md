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

## Quick Start

```typescript
import { FireflyClient, FIREFLY_AXIOS_INSTANCE, TokenIMSClient } from '@musallam/firefly-client';

// 1. Setup authentication
const imsClient = new TokenIMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'creative_sdk', 'AdobeID'],
});

// 2. Configure axios instance
FIREFLY_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await imsClient.getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-api-key'] = 'YOUR_CLIENT_ID';
  return config;
});

// 3. Use the client
const generations = await FireflyClient.getGenerations({
  limit: 10,
});
console.log(generations);
```

## API Coverage

### Generations

- `getGenerations()` - List all generations/jobs
- `createGeneration()` - Trigger a new generation
- `getGeneration()` - Get generation details
- `cancelGeneration()` - Cancel a running generation

### Assets

- `getAsset()` - Get asset details
- `downloadAsset()` - Download asset

_...and more! See [API docs](https://ahmed-musallam.github.io/firefly-services-clients/firefly-client/) for the full reference._

---

For full documentation, examples, and advanced usage, see:  
👉 [https://ahmed-musallam.github.io/firefly-services-clients/firefly-client/](https://ahmed-musallam.github.io/firefly-services-clients/firefly-client/)
