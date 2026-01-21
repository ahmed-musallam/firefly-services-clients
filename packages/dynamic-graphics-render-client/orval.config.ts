/**
 * Orval configuration for Dynamic Graphics Render Client
 * Generates TypeScript clients from OpenAPI specs in ./spec folder
 */

import { defineConfig } from 'orval';
import { createOrvalConfigsFromFolder, mergeOrvalConfigs } from '../../orval.config.base.ts';

// Create configs for all specs in ./spec folder
const configs = createOrvalConfigsFromFolder({
  specFolder: './spec',
  packageSrcPath: './src',
  mutatorPath: '../../mutator/custom-dynamic-graphics-axios-instance.ts',
  mutatorName: 'customDynamicGraphicsAxiosInstance',
});

export default defineConfig(mergeOrvalConfigs(configs));
