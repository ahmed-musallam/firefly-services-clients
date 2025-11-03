import { defineConfig, type UserConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

interface PackageConfig {
  entry: string;
  external?: string[];
}

export function createViteConfig(packageConfig: PackageConfig): UserConfig {
  return defineConfig({
    plugins: [
      dts({
        rollupTypes: false,
        copyDtsFiles: true,
        entryRoot: 'src',
        outDir: 'dist',
        tsconfigPath: './tsconfig.json',
        staticImport: true,
      }),
    ],
    build: {
      lib: {
        entry: resolve(process.cwd(), packageConfig.entry),
        formats: ['es', 'cjs'],
        fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      },
      rollupOptions: {
        external: ['axios', ...(packageConfig.external || [])],
      },
      sourcemap: true,
    },
  });
}
