import { StartStorybookSchema } from './index.d';
import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { getSystemPath } from '@angular-devkit/core';
import { existsSync } from 'fs';

import { buildDev } from '@storybook/core/server';

import packageJson from '../../package.json';
import wrapInitialConfig from '../wrapInitialConfig';

export default class StartStorybookBuilder implements Builder<StartStorybookSchema> {
  constructor(private context: BuilderContext) {}

  run(builderConfig: BuilderConfiguration<Partial<StartStorybookSchema>>): Observable<BuildEvent> {
    const { options } = builderConfig;
    const root = this.context.workspace.root;

    const storybookOptions = {
      packageJson,
      defaultConfigName: 'angular-cli',
      wrapInitialConfig,
      wrapDefaultConfig: config => applyAngularCliWebpackConfig(config, cliWebpackConfigOptions),
      wrapBasicConfig: config => applyAngularCliWebpackConfig(config, cliWebpackConfigOptions)
    };

    return from(buildDev(storybookOptions)).pipe(map(() => ({ success: true })));
  }
}
