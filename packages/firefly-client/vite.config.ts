import { createViteConfig } from '../../vite.config.base';

console.log('Creating Vite config for firefly-client');

export default createViteConfig({
  entry: 'src/index.ts',
  external: ['@musallam/ims-client'],
});
