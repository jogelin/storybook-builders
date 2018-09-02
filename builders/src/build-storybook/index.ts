import {BuilderContext} from '@angular-devkit/architect';
import {BuildStorybookSchema} from './schema';
import {buildStatic} from '@storybook/core/server';
import {BrowserBuilderSchema} from '@angular-devkit/build-angular/src/browser/schema';
import {StorybookBuilder} from '../storybook-builder';
import {OperatorFunction} from 'rxjs';
import {StorybookOptions} from '../storybook.types';
import {tap} from 'rxjs/operators';

export class BuildStorybookBuilder extends StorybookBuilder<BuildStorybookSchema> {

  constructor(protected context: BuilderContext) {
    super(context);
  }

  protected getBrowserOptionsOverrides(options: BuildStorybookSchema): Partial<BrowserBuilderSchema> {
    return {
      ...(options.tsConfig !== undefined ? {tsConfig: options.tsConfig} : {}),
      ...(options.outputDir !== undefined ? {outputPath: options.outputDir} : {})
    };
  }

  protected buildStorybook(): OperatorFunction<StorybookOptions, StorybookOptions> {
    return tap(storybookOptions => buildStatic(storybookOptions));
  }
}

export default BuildStorybookBuilder;