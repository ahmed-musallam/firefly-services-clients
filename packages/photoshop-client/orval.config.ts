/**
 * Orval configuration for Photoshop Client
 * Generates TypeScript clients from OpenAPI specs in ./spec folder
 */

import { defineConfig } from 'orval';
import { createOrvalConfigsFromFolder, mergeOrvalConfigs } from '../../orval.config.base.ts';

// Generate configs for all spec files in the spec folder
const configs = createOrvalConfigsFromFolder({
  specFolder: './spec',
  packageSrcPath: './src',
  mutatorPath: '../../mutator/custom-photoshop-axios-instance.ts',
  mutatorName: 'customPhotoshopAxiosInstance',
});

export default defineConfig(mergeOrvalConfigs(configs));
