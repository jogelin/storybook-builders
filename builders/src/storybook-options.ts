import { BuilderConfiguration } from '@angular-devkit/architect';
import { BuildStorybookSchema } from './build-storybook/schema';
import { logger } from '@storybook/node-logger';

import packageJson from '../package.json';

import { wrapInitialConfig } from './wrap-initial-config';

import { getAngularCliWebpackConfigOptions, applyAngularCliWebpackConfig } from '@storybook/angular/dist/server';
import { Options } from './storybook.types';
import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { StartStorybookSchema } from './start-storybook/schema';

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
