# @musallam/photoshop-client

TypeScript client library for the Adobe Photoshop API.

This package is part of the [firefly-services-clients](https://github.com/ahmed-musallam/firefly-services-clients) monorepo.

## Features

- 🚀 **Full TypeScript support** with auto-generated types from OpenAPI spec
- 📦 **API coverage** for major Adobe Photoshop endpoints
- 🔄 **Async job polling utilities** for long-running operations
- 🔐 **Built-in authentication** via IMS client
- 📝 **Comprehensive documentation** and usage examples

## Installation

```bash
npm install @musallam/photoshop-client
```

## Quick Start

```typescript
import {
  PhotoshopClient,
  PHOTOSHOP_AXIOS_INSTANCE,
  TokenIMSClient,
} from '@musallam/photoshop-client';

// 1. Setup authentication
const imsClient = new TokenIMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'creative_sdk', 'AdobeID'],
});

// 2. Configure axios instance
PHOTOSHOP_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await imsClient.getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-api-key'] = 'YOUR_CLIENT_ID';
  return config;
});

// 3. Use the client
const jobs = await PhotoshopClient.getJobs({
  limit: 10,
});
console.log(jobs);
```

## API Coverage

### Jobs

- `getJobs()` - List jobs for your account
- `createJob()` - Submit a new Photoshop job
- `getJob()` - Retrieve details about a specific job
- `cancelJob()` - Cancel an in-progress job

### Documents

- `getDocument()` - Retrieve a Photoshop document
- `createDocument()` - Create a new document
- `updateDocument()` - Update or edit an existing document

---

For full API reference and advanced usage, see: [https://ahmed-musallam.github.io/firefly-services-clients/photoshop-client/](https://ahmed-musallam.github.io/firefly-services-clients/photoshop-client/)
