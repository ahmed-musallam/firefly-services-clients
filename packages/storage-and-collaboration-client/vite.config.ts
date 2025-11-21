import { createViteConfig } from '../../vite.config.base';

console.log('Creating Vite config for storage-and-collaboration-client');

export default createViteConfig({
  entry: 'src/index.ts',
  external: ['@musallam/ims-client'],
});
