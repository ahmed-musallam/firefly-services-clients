/**
 * Orval configuration for Audio and Video Client
 * Generates TypeScript clients from OpenAPI specs in ./spec folder
 */

import { defineConfig } from 'orval';
import { createOrvalConfigsFromFolder, mergeOrvalConfigs } from '../../orval.config.base.ts';

// Create configs for all specs in ./spec folder
const configs = createOrvalConfigsFromFolder({
  specFolder: './spec',
  packageSrcPath: './src',
  mutatorPath: '../../mutator/custom-audio-video-axios-instance.ts',
  mutatorName: 'customAudioVideoAxiosInstance',
});

export default defineConfig(mergeOrvalConfigs(configs));
