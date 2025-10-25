import { builtinModules } from 'node:module';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    cacheDir: 'node_modules/.vite',
    optimizeDeps: {
      exclude: [...builtinModules],
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      },
      exclude: ['**/node_modules/**', '**/test/**', '**/dist/**', 'tsdoc.json'],
      sourcemap: true,
      minify: false,
    },
    resolve: { alias: { src: resolve('src/') } },
    test: {
      globals: true,
      include: ['test/*.test.ts'],
    },
    plugins: [
      // generate typescript types
      dts({
        entryRoot: 'src',
        outDir: 'dist',
        tsconfigPath: './tsconfig.json',
        rollupTypes: false, // Don't bundle - keep namespace structure
        copyDtsFiles: true, // Copy all .d.ts files to maintain imports
        staticImport: true,
      }),
    ],
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
