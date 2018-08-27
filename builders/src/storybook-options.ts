import { BuilderConfiguration } from '@angular-devkit/architect';
import { BuildStorybookSchema } from './build-storybook/schema';
import { logger } from '@storybook/node-logger';

import packageJson from '../package.json';

import { wrapInitialConfig } from './wrap-initial-config';

import { Options } from './storybook.types';
import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { StartStorybookSchema } from './start-storybook/schema';

export function mapToStorybookOptions<
  T extends BuilderConfiguration<Partial<StartStorybookSchema | BuildStorybookSchema>>
>(): OperatorFunction<T, Options> {
  return map(({ options, root }) => ({
    packageJson,
    defaultConfigName: 'angular-cli',
    wrapInitialConfig: wrapInitialConfig(options.tsConfig),
    wrapDefaultConfig: config => config,
    wrapBasicConfig: config => config
  }));
}
