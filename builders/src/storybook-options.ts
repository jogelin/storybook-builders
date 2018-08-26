import { logger } from '@storybook/node-logger';

import packageJson from '../package.json';

import { wrapInitialConfig } from './wrapInitialConfig';

import { getAngularCliWebpackConfigOptions, applyAngularCliWebpackConfig } from './angular-cli_config';
import { Options } from './storybook.types';
import { OperatorFunction } from '../node_modules/rxjs';
import { map } from '../node_modules/rxjs/operators';
import { BuilderConfiguration } from '../node_modules/@angular-devkit/architect';
import { StartStorybookSchema } from './start-storybook/schema';
import { BuildStorybookSchema } from 'dist/src/build-storybook/schema';

const cliWebpackConfigOptions = getAngularCliWebpackConfigOptions(process.cwd());

if (cliWebpackConfigOptions) {
  logger.info('=> Loading angular-cli config.');
}

export function mapToStorybookOptions<
  T extends BuilderConfiguration<Partial<StartStorybookSchema | BuildStorybookSchema>>
>(): OperatorFunction<T, Options> {
  return map(({ options, root }) => ({
    packageJson,
    defaultConfigName: 'angular-cli',
    wrapInitialConfig: wrapInitialConfig(options.tsConfig),
    wrapDefaultConfig: config => applyAngularCliWebpackConfig(config, cliWebpackConfigOptions),
    wrapBasicConfig: config => applyAngularCliWebpackConfig(config, cliWebpackConfigOptions)
  }));
}
