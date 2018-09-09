import { OperatorFunction } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import path from 'path';
import program from 'commander';
import { StorybookOptions } from './storybook.types';
// @ts-ignore
import packageJson from '../package.json';
import { StorybookSchema } from './storybook-schema';


export function injectBuilderOptionsToProgram(options: StorybookSchema, projectRoot: string): OperatorFunction<void, void> {
  return tap(() => {
    // init storybook arguments = command argument OR builder option
    Object.keys(options).forEach(key => {
      program[key] = program[key] || Array.isArray(options[key]) ? options[key].join(',') : options[key];
    });

    // set default
    program.configDir = program.configDir || projectRoot;
  });
}

export function getStorybookOptionsWithAngularPresets(): OperatorFunction<void, StorybookOptions> {
  return map(_ => ({
    packageJson,
    defaultConfigName: 'angular-cli',
    frameworkPresets: [
      require.resolve(path.resolve(__dirname, 'framework-preset-angular-cli-template.ts'))
    ]
  }));
}
