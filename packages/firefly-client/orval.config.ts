/**
 * Orval configuration for Firefly Client
 * Generates TypeScript clients from OpenAPI specs in ./spec folder
 */

import { defineConfig } from 'orval';
import { createOrvalConfigsFromFolder, mergeOrvalConfigs } from '../../orval.config.base.ts';

// Generate configs for all spec files in the spec folder
const configs = createOrvalConfigsFromFolder({
  specFolder: './spec',
  packageSrcPath: './src',
  mutatorPath: '../../mutator/custom-firefly-axios-instance.ts',
  mutatorName: 'customFireflyAxiosInstance',
});

export default defineConfig(mergeOrvalConfigs(configs));
