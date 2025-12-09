/**
 * Orval configuration for Lightroom Client
 * Generates TypeScript clients from OpenAPI specs in ./spec folder
 */

import { defineConfig } from 'orval';
import { createOrvalConfigsFromFolder, mergeOrvalConfigs } from '../../orval.config.base.ts';

// Create configs for all specs in ./spec folder
const configs = createOrvalConfigsFromFolder({
  specFolder: './spec',
  packageSrcPath: './src',
  mutatorPath: '../../mutator/custom-lightroom-axios-instance.ts',
  mutatorName: 'customLightroomAxiosInstance',
});

export default defineConfig(mergeOrvalConfigs(configs));
