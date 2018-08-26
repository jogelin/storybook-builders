import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { Observable, of, OperatorFunction } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { StartStorybookSchema } from './schema';
import { buildDev } from '@storybook/core/server';
import program from 'commander';

import { mapToStorybookOptions } from '../storybook-options';

export type BuilderConfig = BuilderConfiguration<Partial<StartStorybookSchema>>;

export default class StartStorybookBuilder implements Builder<StartStorybookSchema> {
  constructor(private context: BuilderContext) {}

  run(builderConfig: BuilderConfig): Observable<BuildEvent> {
    console.log('ok');
    return of(builderConfig).pipe(
      initArgumentsFromOptions(),
      tap(_ => console.log(_)),
      mapToStorybookOptions<BuilderConfig>(),
      tap(console.log),
      tap(options => buildDev(options)),
      tap(console.log),
      map(() => ({ success: true }))
    );
  }
}

export function initArgumentsFromOptions(): OperatorFunction<BuilderConfig, BuilderConfig> {
  return tap(({ options, root }) => {
    // init storybook arguments = command argument OR builder option
    Object.keys(options).forEach(key => {
      program[key] = program[key] || Array.isArray(options[key]) ? options[key].join(',') : options[key];
    });

    //set default root config dir if not specified
    program.configDir = program.configDir || root;

    console.log(program);
  });
}
