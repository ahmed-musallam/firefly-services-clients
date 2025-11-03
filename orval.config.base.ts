/**
 * Shared Orval configuration helpers for all packages
 * Each package uses these helpers in their own orval.config.ts
 */

import { type Options, type OutputOptions, type Config } from 'orval';
import { readdirSync } from 'fs';

export interface OrvalConfigOptions {
  /**
   * Path to the spec folder containing JSON files
   * @example './spec'
   */
  specFolder: string;

  /**
   * Path to the package source folder where generated code will be placed
   * @example './src'
   */
  packageSrcPath: string;

  /**
   * Path to the custom axios instance mutator (relative to generated client)
   * @example '../mutator/custom-firefly-axios-instance.ts'
   */
  mutatorPath: string;

  /**
   * Name of the mutator function
   * @example 'customFireflyAxiosInstance'
   */
  mutatorName: string;

  /**
   * Additional output options to override defaults
   */
  outputOverrides?: Options;
}

/**
 * Creates an Orval config for a single spec file
 */
export const createOrvalConfig = (
  specFile: string,
  name: string,
  options: OrvalConfigOptions
): Config => {
  const { packageSrcPath, mutatorPath, mutatorName, outputOverrides } = options;
  const clientName = name.replace(/_/g, '-') + '-client';

  return {
    [clientName]: {
      input: specFile,
      output: {
        baseUrl: '',
        workspace: `${packageSrcPath}/generated/${clientName}`,
        target: `${clientName}.ts`,
        client: 'axios-functions',
        namingConvention: 'kebab-case',
        mode: 'split',
        mock: false,
        prettier: true,
        clean: true,
        fileExtension: '.ts',
        override: {
          useNamedParameters: true,
          mutator: {
            path: mutatorPath,
            name: mutatorName,
          },
        },
        ...(outputOverrides?.output as OutputOptions),
      },
    },
  };
};

/**
 * Scans a folder for .json spec files and generates configs for each
 */
export const createOrvalConfigsFromFolder = (options: OrvalConfigOptions): Config[] => {
  const { specFolder } = options;

  return readdirSync(specFolder)
    .filter((file: string) => file.endsWith('.json'))
    .map((file: string) => {
      const name = file.replace(/\.json$/, '');
      const specFile = `${specFolder}/${file}`;
      return createOrvalConfig(specFile, name, options);
    });
};

/**
 * Merges multiple Orval configs into a single config object
 */
export const mergeOrvalConfigs = (configs: Config[]): Config => {
  return Object.assign({}, ...configs);
};
