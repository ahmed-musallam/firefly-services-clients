import { createViteConfig } from '../../vite.config.base';

console.log('Creating Vite config for audio-video-client');

export default createViteConfig({
  entry: 'src/index.ts',
  external: ['@musallam/ims-client'],
});
