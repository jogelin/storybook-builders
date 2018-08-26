import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { StartStorybookSchema } from './schema';
import { buildDev } from '@storybook/core/server';
import program from 'commander';

import storyBookOptions from '@storybook/angular/dist/server/options';

import jsonSchema from './schema.json';

export default class StartStorybookBuilder implements Builder<StartStorybookSchema> {
  constructor(private context: BuilderContext) {}

  run(builderConfig: BuilderConfiguration<Partial<StartStorybookSchema>>): Observable<BuildEvent> {
    return of(builderConfig).pipe(
      initArgumentsFromOptions(),
      tap(_ => buildDev(storyBookOptions)),
      map(() => ({ success: true }))
    );
  }
}

export function initArgumentsFromOptions() {
  return tap(({ options, root }) => {
    // init storybook arguments = command argument OR builder option
    Object.keys(jsonSchema.properties).forEach(key => {
      program[key] = program[key] || Array.isArray(options[key]) ? options[key].join(',') : options[key];
    });

    //set default root config dir if not specified
    program.configDir = program.configDir || root;
  });
}
