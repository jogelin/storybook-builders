import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { getSystemPath } from '@angular-devkit/core';
import { existsSync } from 'fs';

import { buildDev } from '@storybook/core/server';

import { StartStorybookSchema } from './schema';

import storyBookOptions from '../options';

export default class StartStorybookBuilder implements Builder<StartStorybookSchema> {
  constructor(private context: BuilderContext) {}

  run(builderConfig: BuilderConfiguration<Partial<StartStorybookSchema>>): Observable<BuildEvent> {
    const { options } = builderConfig;
    const root = this.context.workspace.root;

    return from(buildDev(storyBookOptions)).pipe(map(() => ({ success: true })));
  }
}
