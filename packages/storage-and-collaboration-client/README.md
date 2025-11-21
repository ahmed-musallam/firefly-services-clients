# @musallam/storage-and-collaboration-client

TypeScript client library for the Adobe Cloud Storage and Collaboration API.

## Features

- 🚀 **Full TypeScript support** with auto-generated types from OpenAPI spec
- 📦 **Complete API coverage** for all Storage and Collaboration endpoints
- 🔄 **Job polling utilities** for async operations
- 🔐 **Built-in authentication** via IMS client
- 📝 **Comprehensive documentation** and examples

## Installation

```bash
npm install @musallam/storage-and-collaboration-client
```

## Quick Start

```typescript
import {
  StorageAndCollaborationClient,
  STORAGE_AXIOS_INSTANCE,
  TokenIMSClient,
} from '@musallam/storage-and-collaboration-client';

// 1. Setup authentication
const imsClient = new TokenIMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'creative_sdk', 'AdobeID'],
});

// 2. Configure axios instance
STORAGE_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await imsClient.getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-api-key'] = 'YOUR_CLIENT_ID';
  return config;
});

// 3. Use the client
const projects = await StorageAndCollaborationClient.getProjects({
  limit: 10,
});
console.log(projects);
```

## API Coverage

### Projects

- `getProjects()` - List all projects
- `createProject()` - Create a new project
- `getProject()` - Get project details
- `discardProject()` - Soft delete a project
- `getProjectChildren()` - List project contents
- `getProjectEffectivePermission()` - Get user's permission
- `getProjectPermissions()` - List all permissions
- `patchProjectPermissions()` - Modify permissions

### Folders

- `createFolder()` - Create a folder
- `getFolder()` - Get folder details
- `getFolderChildren()` - List folder contents
- `getFolderEffectivePermission()` - Get user's permission
- `getFolderPermissions()` - List all permissions

### Files

- `getFile()` - Get file metadata
- `downloadFile()` - Get download URL
- `getFileImageRendition()` - Get image rendition
- `getFileEffectivePermission()` - Get user's permission
- `initBlockBasedFileUpload()` - Initialize file upload
- `finalizeBlockBasedFileUpload()` - Complete file upload

### Jobs

- `getJobStatus()` - Check async job status
- `pollStorageJob()` - Poll until completion (utility)

## Usage Examples

### Creating a Project

```typescript
const project = await StorageAndCollaborationClient.createProject({
  name: 'My New Project',
});
console.log(`Created: ${project.assetId}`);
```

### Creating Folders

```typescript
// Single folder
const folder = await StorageAndCollaborationClient.createFolder({
  parentId: 'urn:aaid:sc:US:project-id',
  name: 'Documents',
});

// Nested folders (creates entire hierarchy)
const nestedFolder = await StorageAndCollaborationClient.createFolder({
  parentId: 'urn:aaid:sc:US:project-id',
  path: 'Marketing/2024/Q4',
});
```

### Uploading a File

```typescript
import { pollStorageJob } from '@musallam/storage-and-collaboration-client';

// 1. Initialize upload
const uploadInit = await StorageAndCollaborationClient.initBlockBasedFileUpload({
  parentId: 'urn:aaid:sc:US:folder-id',
  name: 'document.pdf',
  mediaType: 'application/pdf',
  size: fileSize,
  blockSize: 10485760, // 10MB blocks (optional)
});

// 2. Upload blocks to transfer URLs
for (let i = 0; i < uploadInit.transferLinks.length; i++) {
  const link = uploadInit.transferLinks[i];
  const blockData = getBlockData(i); // Your logic to get block data

  await axios.put(link.url, blockData, {
    headers: { 'Content-Type': 'application/octet-stream' },
  });
}

// 3. Finalize upload
const finalizeResponse = await StorageAndCollaborationClient.finalizeBlockBasedFileUpload({
  uploadId: uploadInit.uploadId,
  usedTransferLinks: [1, 2, 3], // Part numbers you uploaded
});

// 4. Poll for completion
const result = await pollStorageJob(finalizeResponse.jobId, {
  intervalMs: 2000,
  maxAttempts: 60,
  onProgress: (status) => {
    console.log(`Upload status: ${status.status}`);
  },
});

console.log('Upload complete!', result);
```

### Managing Permissions

```typescript
// Get effective permission for current user
const permission = await StorageAndCollaborationClient.getProjectEffectivePermission({
  assetId: 'urn:aaid:sc:US:project-id',
});
console.log(`Your role: ${permission.role}`); // 'edit' or 'comment'

// List all permissions
const permissions = await StorageAndCollaborationClient.getProjectPermissions({
  assetId: 'urn:aaid:sc:US:project-id',
});
console.log(`Direct: ${permissions.direct.length}`);
console.log(`Pending: ${permissions.pending.length}`);

// Add collaborators
await StorageAndCollaborationClient.patchProjectPermissions(
  { assetId: 'urn:aaid:sc:US:project-id' },
  {
    direct: {
      additions: [
        {
          recipient: 'mailto:user@example.com',
          type: 'user',
          role: 'comment',
        },
        {
          recipient: 'name:Marketing Team',
          type: 'group',
          role: 'edit',
        },
      ],
    },
  }
);

// Update or remove permissions
await StorageAndCollaborationClient.patchProjectPermissions(
  { assetId: 'urn:aaid:sc:US:project-id' },
  {
    direct: {
      updates: [
        {
          id: 'user-id@AdobeID',
          type: 'user',
          role: 'edit', // Changed from 'comment' to 'edit'
        },
      ],
      deletions: [
        {
          id: 'another-user-id@AdobeID',
          type: 'user',
        },
      ],
    },
  }
);
```

### Downloading Files

```typescript
// Get download URL
const downloadInfo = await StorageAndCollaborationClient.downloadFile({
  assetId: 'urn:aaid:sc:US:file-id',
  urlTTL: 3600, // URL valid for 1 hour
});

console.log(`Download from: ${downloadInfo.url}`);
console.log(`Expires: ${downloadInfo.urlExpirationDate}`);
console.log(`Size: ${downloadInfo.size} bytes`);

// For large files, the API might return 202 with a job ID
// Poll the job to get the download URL when ready
```

### Pagination

```typescript
let cursor: string | undefined;
let allProjects: typeof projects.items = [];

do {
  const projects = await StorageAndCollaborationClient.getProjects({
    limit: 100,
    cursor,
  });

  allProjects.push(...(projects.items || []));

  // Extract cursor from nextUrl if present
  if (projects.paging?.nextUrl) {
    const url = new URL(projects.paging.nextUrl);
    cursor = url.searchParams.get('cursor') || undefined;
  } else {
    cursor = undefined;
  }
} while (cursor);

console.log(`Total projects: ${allProjects.length}`);
```

### Filtering and Sorting

```typescript
// Filter projects by view
const myProjects = await StorageAndCollaborationClient.getProjects({
  filter: 'view==yours',
  sortBy: '-created', // Sort by creation date descending
});

// Filter children by asset type
const onlyFolders = await StorageAndCollaborationClient.getProjectChildren({
  assetId: 'urn:aaid:sc:US:project-id',
  filter: 'assetType==folder',
});

// Filter children by media type
const pdfFiles = await StorageAndCollaborationClient.getProjectChildren({
  assetId: 'urn:aaid:sc:US:project-id',
  filter: 'assetType==file;mediaType==application/pdf',
});
```

## Job Polling

For async operations, use the polling utility:

```typescript
import { pollStorageJob, PollingTimeoutError } from '@musallam/storage-and-collaboration-client';

try {
  const result = await pollStorageJob(jobId, {
    intervalMs: 2000, // Poll every 2 seconds
    maxAttempts: 60, // Try up to 60 times
    timeoutMs: 300000, // Or timeout after 5 minutes
    onProgress: (status) => {
      console.log(`Status: ${status.status}`);
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

## Error Handling

```typescript
try {
  const project = await StorageAndCollaborationClient.getProject({
    assetId: 'invalid-id',
  });
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error(`HTTP ${error.response?.status}: ${error.response?.data?.message}`);
    console.error(`Error code: ${error.response?.data?.error_code}`);
  }
}
```

## Advanced Configuration

### Custom Axios Instance

```typescript
import axios from 'axios';
import { STORAGE_AXIOS_INSTANCE } from '@musallam/storage-and-collaboration-client';

// Add custom headers
STORAGE_AXIOS_INSTANCE.defaults.headers.common['X-Custom-Header'] = 'value';

// Add request interceptor
STORAGE_AXIOS_INSTANCE.interceptors.request.use((config) => {
  console.log(`Making request to ${config.url}`);
  return config;
});

// Add response interceptor
STORAGE_AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Request failed:', error.message);
    return Promise.reject(error);
  }
);
```

### Timeout Configuration

```typescript
STORAGE_AXIOS_INSTANCE.defaults.timeout = 30000; // 30 seconds
```

## TypeScript Support

All types are automatically generated from the OpenAPI spec:

```typescript
import type {
  ProjectAsset,
  FolderAsset,
  FileAsset,
  JobStatus,
  PaginatedProjectsResponseResponse,
} from '@musallam/storage-and-collaboration-client';

const project: ProjectAsset = await StorageAndCollaborationClient.createProject({
  name: 'Typed Project',
});

const status: JobStatus = await StorageAndCollaborationClient.getJobStatus({
  jobId: 'job-id',
});
```

## License

MIT

## Related Packages

- [@musallam/firefly-client](../firefly-client) - Adobe Firefly Services API
- [@musallam/photoshop-client](../photoshop-client) - Adobe Photoshop API
- [@musallam/ims-client](../ims-client) - Adobe Identity Management Services

## Resources

- [Adobe Cloud Storage and Collaboration API Documentation](https://developer.adobe.com/apis/storage/)
- [API Reference](https://developer.adobe.com/apis/storage/v1/reference/)
