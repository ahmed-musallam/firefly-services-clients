# @musallam/ims-client

TypeScript client library for Adobe IMS (Identity Management Services) authentication and token management.

This package is part of the [firefly-services-clients](https://github.com/ahmed-musallam/firefly-services-clients) monorepo.

## Features

- 🚀 **Full TypeScript support** with auto-complete and type safety
- 🔐 **Simple acquisition and refresh of IMS access tokens**
- 🔄 **Automatic token management utilities**
- 🧩 **Works seamlessly with other firefly-services client packages**

## Installation

```bash
npm install @musallam/ims-client
```

## Quick Start

```typescript
import { TokenIMSClient } from '@musallam/ims-client';

// 1. Instantiate the IMS client
const imsClient = new TokenIMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'creative_sdk', 'AdobeID'],
});

// 2. Acquire an access token
const accessToken = await imsClient.getAccessToken();
console.log('IMS Token:', accessToken);

// Tokens are cached and automatically refreshed before expiry
```

## Use Cases

- Obtain and refresh OAuth access tokens for Adobe APIs
- Integrate with [@musallam/firefly-client](../firefly-client) or [@musallam/storage-and-collaboration-client](../storage-and-collaboration-client)
- Manage authentication for server-side and command-line applications

## API Overview

### `TokenIMSClient`

- `constructor(options)`
  - `clientId` (string)
  - `clientSecret` (string)
  - `scopes` (string[])
- `getAccessToken(): Promise<string>`
  - Fetches a valid (cached or new) IMS access token.

### Example integration

```typescript
import {
  StorageAndCollaborationClient,
  STORAGE_AXIOS_INSTANCE,
} from '@musallam/storage-and-collaboration-client';
import { TokenIMSClient } from '@musallam/ims-client';

const imsClient = new TokenIMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'creative_sdk', 'AdobeID'],
});

STORAGE_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await imsClient.getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## Documentation

For full API documentation, see: [https://ahmed-musallam.github.io/firefly-services-clients/ims-client/](https://ahmed-musallam.github.io/firefly-services-clients/ims-client/)
