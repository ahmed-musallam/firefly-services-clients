import { defineConfig, type Config } from 'orval';
import { readdirSync } from 'fs';

const getConfig = (name: string): Config => {
  const clientName = name.replace(/_/g, '-') + '-client';
  return {
    [clientName]: {
      input: `./src/spec/${name}.json`,
      output: {
        baseUrl: 'https://firefly-api.adobe.io',
        workspace: `./src/generated/${clientName}`,
        target: `${clientName}.ts`, // output file name relative to workspace
        client: 'axios-functions',
        namingConvention: 'kebab-case',
        mode: 'split',
        mock: false, // enabling mocks causes issues.. we can generate these later if needed.
        prettier: true,
        clean: true,
        fileExtension: '.ts',
        override: {
          useNamedParameters: true,
          // fetch: {
          //   includeHttpResponseReturnType: false,
          // },
          mutator: {
            path: '../../../src/mutator/custom-axios-instance.ts',
            name: 'customAxiosInstance',
            // default: true
          },
        },
      },
    },
  };
};

const config = readdirSync('./src/spec')
  .filter((f: string) => f.endsWith('.json'))
  .map((f: string) => {
    const name = f.replace(/\.json$/, '');
    return getConfig(name);
  });

// console.info('generated config:\n', JSON.stringify(config, null, 2));

export default defineConfig({
  ...Object.assign({}, ...config),
});
