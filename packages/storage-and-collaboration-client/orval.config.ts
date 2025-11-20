/**
 * Orval configuration for Storage and Collaboration Client
 * Generates TypeScript clients from OpenAPI specs in ./spec folder
 */

import { defineConfig } from 'orval';
import { createOrvalConfig } from '../../orval.config.base.ts';

// Create config for the storage-and-collaboration spec
const config = createOrvalConfig(
  './spec/storage-and-collaboration.yml',
  'storage-and-collaboration',
  {
    specFolder: './spec',
    packageSrcPath: './src',
    mutatorPath: '../../mutator/custom-storage-axios-instance.ts',
    mutatorName: 'customStorageAxiosInstance',
  }
);

export default defineConfig(config);
