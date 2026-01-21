import { createViteConfig } from '../../vite.config.base';

console.log('Creating Vite config for dynamic-graphics-render-client');

export default createViteConfig({
  entry: 'src/index.ts',
  external: ['@musallam/ims-client'],
});
