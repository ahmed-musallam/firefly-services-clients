# Adobe Services Clients Monorepo

A comprehensive TypeScript client library monorepo for Adobe Firefly, Photoshop, and Cloud Storage APIs, with full type safety and modern tooling.

## 📦 Packages

This monorepo contains several packages that can be used independently:

| Package                                                                                       | Description                                  | npm Package                                  |
| --------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| **[@musallam/firefly-client](./packages/firefly-client)**                                     | Adobe Firefly Services API client            | `@musallam/firefly-client`                   |
| **[@musallam/photoshop-client](./packages/photoshop-client)**                                 | Adobe Photoshop API client                   | `@musallam/photoshop-client`                 |
| **[@musallam/lightroom-client](./packages/lightroom-client)**                                 | Adobe Lightroom API client                   | `@musallam/lightroom-client`                 |
| **[@musallam/dynamic-graphics-render-client](./packages/dynamic-graphics-render-client)**     | Adobe Dynamic Graphics Render API client     | `@musallam/dynamic-graphics-render-client`   |
| **[@musallam/storage-and-collaboration-client](./packages/storage-and-collaboration-client)** | Adobe Cloud Storage and Collaboration client | `@musallam/storage-and-collaboration-client` |
| **[@musallam/ims-client](./packages/ims-client)**                                             | Adobe IMS authentication client              | `@musallam/ims-client`                       |

## 🚀 Quick Start

### Installation

Install the packages you need:

```bash
# For Firefly API
npm install @musallam/firefly-client @musallam/ims-client

# For Photoshop API
npm install @musallam/photoshop-client @musallam/ims-client

# For Lightroom API
npm install @musallam/lightroom-client @musallam/ims-client

# For Dynamic Graphics Render API
npm install @musallam/dynamic-graphics-render-client @musallam/ims-client

# For Storage and Collaboration API
npm install @musallam/storage-and-collaboration-client @musallam/ims-client

# For all
npm install @musallam/firefly-client @musallam/photoshop-client @musallam/lightroom-client @musallam/dynamic-graphics-render-client @musallam/storage-and-collaboration-client @musallam/ims-client
```

### Basic Usage

#### Firefly API Example

```typescript
import { ImageGenerationClient, pollGenerateImagesJob, IMSClient } from '@musallam/firefly-client';
import { IMSClient } from '@musallam/ims-client';

// Authenticate
const imsClient = new IMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
});

const authHeaders = await imsClient.getAuthHeaders();

// Generate images
const job = await ImageGenerationClient.generateImagesV3Async(
  {
    prompt: 'A majestic lion on a cliff at sunset',
    numVariations: 2,
  },
  { headers: authHeaders }
);

// Poll for results
const result = await pollGenerateImagesJob(job, {
  axiosRequestConfig: { headers: authHeaders },
});

console.log(
  'Images:',
  result.outputs.map((o) => o.image.url)
);
```

#### Photoshop API Example

```typescript
import { PhotoshopClient, pollMaskObjectsJob } from '@musallam/photoshop-client';
import { IMSClient } from '@musallam/ims-client';

const imsClient = new IMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
});

const authHeaders = await imsClient.getAuthHeaders();

// Generate masks
const job = await PhotoshopClient.maskObjects(
  {
    image: {
      source: {
        url: 'https://your-bucket.s3.amazonaws.com/image.jpg',
      },
    },
  },
  { headers: authHeaders }
);

console.log('Job ID:', job.jobId);

const result = await pollMaskObjectsJob(job, {
  axiosRequestConfig: { headers: authHeaders },
  intervalMs: 2000,
  maxAttempts: 60,
  onProgress: (status) => {
    if (status.status === 'not_started' || status.status === 'running') {
      console.log(`  Status: ${status.status}${status.status === 'running' ? '...' : ''}`);
    }
  },
});
```

#### Lightroom API Example

```typescript
import {
  LightroomClient,
  LIGHTROOM_AXIOS_INSTANCE,
  pollLightroomJob,
} from '@musallam/lightroom-client';
import { IMSClient } from '@musallam/ims-client';

const imsClient = new IMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
});

// Setup axios instance with authentication
LIGHTROOM_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await imsClient.getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-api-key'] = 'YOUR_CLIENT_ID';
  return config;
});

// Apply auto-tone to an image
const job = await LightroomClient.applyAutoTone({
  inputs: {
    href: 'https://your-bucket.s3.amazonaws.com/photo.jpg',
    storage: 'external',
  },
  outputs: [
    {
      href: 'https://your-bucket.s3.amazonaws.com/auto-toned.jpg',
      storage: 'external',
      type: 'image/jpeg',
    },
  ],
});

// Poll for completion
const result = await pollLightroomJob(job, {
  onProgress: (status) => {
    console.log(`Status: ${status.outputs?.[0]?.status}`);
  },
});

console.log('Output:', result.outputs?.[0]?._links?.self?.href);
```

#### Dynamic Graphics Render API Example

```typescript
import {
  DynamicGraphicsRenderClient,
  DYNAMIC_GRAPHICS_AXIOS_INSTANCE,
  pollDynamicGraphicsJob,
} from '@musallam/dynamic-graphics-render-client';
import { IMSClient } from '@musallam/ims-client';

const imsClient = new IMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
});

// Setup axios instance with authentication
DYNAMIC_GRAPHICS_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await imsClient.getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-api-key'] = 'YOUR_CLIENT_ID';
  return config;
});

// Render a Motion Graphics Template
const renderJob = await DynamicGraphicsRenderClient.templateRender({
  source: {
    url: 'https://your-storage.com/templates/template.mogrt',
  },
  type: 'mogrt',
  variations: [
    {
      id: 'variation-1',
      presetIds: ['ffs_video_api_vert_1920p_hq'],
      elements: [
        {
          id: 'element-id',
          type: 'mogrt',
          controls: [
            {
              id: 'text-control-id',
              type: 'text',
              data: {
                text: 'Custom Title',
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
  onProgress: (status) => {
    console.log(`Status: ${status.status}, Progress: ${status.percentCompleted}%`);
  },
});

console.log(
  'Rendered videos:',
  result.outputs?.map((o) => o.destination.url)
);
```

#### Storage and Collaboration API Example

```typescript
import {
  StorageAndCollaborationClient,
  STORAGE_AXIOS_INSTANCE,
} from '@musallam/storage-and-collaboration-client';
import { IMSClient } from '@musallam/ims-client';

const imsClient = new IMSClient({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['openid', 'creative_sdk', 'AdobeID'],
});

// Setup axios instance with authentication
STORAGE_AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await imsClient.getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-api-key'] = 'YOUR_CLIENT_ID';
  return config;
});

// List projects
const projects = await StorageAndCollaborationClient.getProjects({
  limit: 10,
  sortBy: '-created',
});

// Create a new project
const newProject = await StorageAndCollaborationClient.createProject({
  name: 'My New Project',
});

console.log('Created project:', newProject.assetId);
```

## 🏗️ Monorepo Structure

```
adobe-services-clients/
├── packages/
│   ├── firefly-client/                      # Firefly API client
│   │   ├── src/
│   │   │   ├── generated/                   # Auto-generated from OpenAPI specs
│   │   │   ├── mutator/                     # Axios instance customization
│   │   │   └── index.ts                     # Main exports
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── photoshop-client/                    # Photoshop API client
│   │   ├── src/
│   │   │   ├── generated/                   # Auto-generated from OpenAPI specs
│   │   │   ├── mutator/                     # Axios instance customization
│   │   │   └── index.ts                     # Main exports
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── lightroom-client/                    # Lightroom API client
│   │   ├── src/
│   │   │   ├── generated/                   # Auto-generated from OpenAPI specs
│   │   │   ├── mutator/                     # Axios instance customization
│   │   │   ├── extension/                   # Job polling utilities
│   │   │   └── index.ts                     # Main exports
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── dynamic-graphics-render-client/      # Dynamic Graphics Render API client
│   │   ├── src/
│   │   │   ├── generated/                   # Auto-generated from OpenAPI specs
│   │   │   ├── mutator/                     # Axios instance customization
│   │   │   ├── extension/                   # Job polling utilities
│   │   │   └── index.ts                     # Main exports
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── storage-and-collaboration-client/    # Storage and Collaboration API client
│   │   ├── src/
│   │   │   ├── generated/                   # Auto-generated from OpenAPI specs
│   │   │   ├── mutator/                     # Axios instance customization
│   │   │   ├── extension/                   # Job polling utilities
│   │   │   └── index.ts                     # Main exports
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── ims-client/                          # IMS authentication
│       ├── src/
│       │   └── ims/                         # IMS client implementations
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── samples/                   # Example usage scripts
├── spec/                      # OpenAPI specifications
│   ├── firefly/              # Firefly API specs
│   └── photoshop/            # Photoshop API specs
├── build-scripts/            # Build utilities
├── package.json              # Root workspace config
└── orval.config.ts           # Code generation config
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/ahmed-musallam/adobe-services-clients.git
cd adobe-services-clients

# Install dependencies (for all workspaces)
npm install

# Build all packages
npm run build
```

### ⚡️ Powered by Nx

This monorepo uses [Nx](https://nx.dev) for intelligent build orchestration:

- **Smart Caching**: Only rebuilds what changed
- **Parallel Execution**: Runs tasks concurrently for speed
- **Dependency Graph**: Automatic task ordering
- **Affected Commands**: Build/test only what's impacted by changes

```bash
# View dependency graph
npm run nx:graph

# Build only affected projects
npm run build:affected

# Reset Nx cache
npm run nx:reset
```

See [NX_MIGRATION.md](./NX_MIGRATION.md) for detailed Nx documentation.

### Shared Configuration

The monorepo uses shared configuration files:

- **`vite.config.base.ts`** - Shared Vite build configuration for all packages
- **`tsconfig.json`** - Base TypeScript configuration
- **`nx.json`** - Nx configuration including release settings

### Build Commands

```bash
# Build all packages (with Nx caching)
npm run build

# Build only affected by changes (Nx)
npm run build:affected

# Watch mode (rebuild on changes)
npm run dev

# Type check all packages
npm run type-check

# Clean build artifacts
npm run clean
```

**Note**: Nx automatically caches build outputs. Subsequent builds without changes are instant!

### Code Generation

The clients are auto-generated from OpenAPI specifications using Orval, fully integrated with Nx:

```bash
# Generate all clients
npm run codegen

# Generate specific client
npm run codegen:firefly
npm run codegen:photoshop

# Fetch latest API specs (from Adobe)
npm run fetch-spec
```

**Note**: Code generation runs **automatically** when you build. Nx caches generated code for faster subsequent builds.

See [CODEGEN.md](./CODEGEN.md) for detailed documentation on the code generation process.

### Linting & Formatting

The project uses Nx-integrated linting and formatting for intelligent caching and parallel execution:

```bash
# Lint all packages
npm run lint

# Lint only affected packages
npm run lint:affected

# Format all packages
npm run format

# Format only affected packages
npm run format:affected

# Check formatting
npm run format:check
npm run format:check:affected
```

**Note**: Nx caches lint and format results. Subsequent runs without changes are instant!

### Running Samples

```bash
cd samples

# Run individual samples
npm run image-generation
npm run photoshop-mask-objects
npm run upload-image
# ... see samples/package.json for all available scripts
```

## 📚 Documentation

### API Documentation (TypeDoc)

Generate comprehensive TypeDoc documentation for all packages:

```bash
# Generate all package docs + unified landing page
npm run docs

# Generate docs only for affected packages
npm run docs:affected
```

The documentation is generated in `typedoc/` with:

- **Unified Landing Page**: `typedoc/index.html` - Beautiful landing page linking to all packages
- **Per-Package Docs**: `typedoc/{package-name}/` - Complete API documentation for each package
- **Nx Caching**: Docs are only regenerated when source files change

**Live Documentation**: [View on GitHub Pages](https://ahmed-musallam.github.io/adobe-services-clients/)

**Note**: Documentation generation is integrated with Nx, providing intelligent caching and parallel execution. See [Nx Docs Integration](./docs/NX_DOCS_INTEGRATION.md) for details.

### Package-Specific Docs

- [Firefly Client Documentation](./packages/firefly-client/README.md)
- [Photoshop Client Documentation](./packages/photoshop-client/README.md)
- [Lightroom Client Documentation](./packages/lightroom-client/README.md)
- [Dynamic Graphics Render Client Documentation](./packages/dynamic-graphics-render-client/README.md)
- [Storage and Collaboration Client Documentation](./packages/storage-and-collaboration-client/README.md)
- [IMS Client Documentation](./packages/ims-client/README.md)

## 🔑 Authentication

All Adobe API clients require authentication using Adobe IMS (Identity Management Services):

```typescript
import { IMSClient } from '@musallam/ims-client';

const imsClient = new IMSClient({
  clientId: process.env.ADOBE_CLIENT_ID,
  clientSecret: process.env.ADOBE_CLIENT_SECRET,
  scopes: ['openid', 'AdobeID', 'firefly_api', 'ff_apis'],
});

// Get formatted headers for API requests
const authHeaders = await imsClient.getAuthHeaders();
// Returns: { Authorization: 'Bearer ...', 'x-api-key': '...' }
```

### Using Your Own Token

If you already have an access token:

```typescript
import { TokenIMSClient } from '@musallam/ims-client';

const imsClient = new TokenIMSClient({
  accessToken: 'your-access-token',
  clientId: 'your-client-id',
});

const authHeaders = imsClient.getAuthHeaders();
```

## ⚙️ Custom Axios Configuration

Both Firefly and Photoshop clients export their Axios instances for customization:

```typescript
import { FIREFLY_AXIOS_INSTANCE } from '@musallam/firefly-client';
import { PHOTOSHOP_AXIOS_INSTANCE } from '@musallam/photoshop-client';
import { LIGHTROOM_AXIOS_INSTANCE } from '@musallam/lightroom-client';
import { DYNAMIC_GRAPHICS_AXIOS_INSTANCE } from '@musallam/dynamic-graphics-render-client';
import { STORAGE_AXIOS_INSTANCE } from '@musallam/storage-and-collaboration-client';

// Add request interceptors
FIREFLY_AXIOS_INSTANCE.interceptors.request.use((config) => {
  console.log('Request:', config.url);
  return config;
});

// Configure timeouts
FIREFLY_AXIOS_INSTANCE.defaults.timeout = 30000;

// Override base URLs (useful for proxies)
PHOTOSHOP_AXIOS_INSTANCE.defaults.baseURL = 'https://custom-proxy.example.com';
LIGHTROOM_AXIOS_INSTANCE.defaults.baseURL = 'https://custom-lightroom-proxy.example.com';
DYNAMIC_GRAPHICS_AXIOS_INSTANCE.defaults.baseURL =
  'https://custom-dynamic-graphics-proxy.example.com';
STORAGE_AXIOS_INSTANCE.defaults.baseURL = 'https://custom-storage-proxy.example.com';
```

See the [axios-instance-sample.ts](./samples/scripts/axios-instance-sample.ts) for more examples.

## 🧪 Testing

```bash
npm test
```

## 📝 License

MIT

## 🚀 Release Process

This monorepo uses **Nx Release** for automated versioning and publishing. Each package is released independently based on conventional commits.

See [NX_RELEASE.md](./NX_RELEASE.md) for detailed documentation on:

- Commit message format
- Version management
- Release workflow
- Nx Release commands
- Troubleshooting

### Quick Reference

**Commit Format:**

```bash
feat(firefly): add new feature    # Minor version bump
fix(photoshop): fix bug           # Patch version bump
feat(ims)!: breaking change       # Major version bump
```

**Release Commands:**

```bash
# Automated release (CI)
npm run release                   # Full release (version + publish)

# Manual release steps
npm run release:version           # Version packages
npm run release:publish           # Publish to npm

# View release plan
npm run release -- --dry-run      # See what would be released
```

**Automated Release:**

- Push commits to `main` branch
- GitHub Actions automatically versions, tags, and publishes
- Or trigger "Release" workflow manually in GitHub Actions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Follow conventional commit format
5. Submit a pull request

## 📞 Support

For issues and questions:

- [GitHub Issues](https://github.com/ahmed-musallam/adobe-services-clients/issues)
- [Adobe Firefly API Documentation](https://developer.adobe.com/firefly-services/docs/firefly-api/)
- [Adobe Photoshop API Documentation](https://developer.adobe.com/photoshop/photoshop-api-docs/)

## 🔄 Migrating from v2.x

If you're upgrading from the previous `@musallam/firefly-services-clients` package:

### Before (v2.x)

```typescript
import {
  ImageGenerationClient,
  PhotoshopClient,
  IMSClient,
} from '@musallam/firefly-services-clients';
```

### After (v3.x)

```typescript
import { ImageGenerationClient } from '@musallam/firefly-client';
import { PhotoshopClient } from '@musallam/photoshop-client';
import { LightroomClient } from '@musallam/lightroom-client';
import { DynamicGraphicsRenderClient } from '@musallam/dynamic-graphics-render-client';
import { StorageAndCollaborationClient } from '@musallam/storage-and-collaboration-client';
import { IMSClient } from '@musallam/ims-client';
```

**Key Changes:**

- Packages are now separate and can be installed independently
- Import paths have changed to use the new package names
- `AXIOS_INSTANCE` is now split into `FIREFLY_AXIOS_INSTANCE`, `PHOTOSHOP_AXIOS_INSTANCE`, `LIGHTROOM_AXIOS_INSTANCE`, `DYNAMIC_GRAPHICS_AXIOS_INSTANCE`, and `STORAGE_AXIOS_INSTANCE`
- All other APIs remain the same

## 🎯 Roadmap

- [x] Adobe Cloud Storage and Collaboration API client
- [x] Adobe Lightroom API client
- [x] Adobe Dynamic Graphics Render API client
- [ ] Add more Adobe service clients (Substance 3D, etc.)
- [ ] Add comprehensive test suite
- [ ] Add rate limiting utilities
- [ ] Add request caching support
- [ ] Add more examples and tutorials
