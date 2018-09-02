import {BuilderContext} from '@angular-devkit/architect';
import {StartStorybookSchema} from './schema';
import {buildDev} from '@storybook/core/server';
import {BrowserBuilderSchema} from '@angular-devkit/build-angular/src/browser/schema';
import {StorybookBuilder} from '../storybook-builder';
import {OperatorFunction} from 'rxjs';
import {StorybookOptions} from '../storybook.types';
import {tap} from 'rxjs/operators';

export class StartStorybookBuilder extends StorybookBuilder<StartStorybookSchema> {

  constructor(protected context: BuilderContext) {
    super(context);
  }

  protected getBrowserOptionsOverrides(options: StartStorybookSchema): Partial<BrowserBuilderSchema> {
    return {
      ...(options.tsConfig !== undefined ? {tsConfig: options.tsConfig} : {})
    };
  }

  protected buildStorybook(): OperatorFunction<StorybookOptions, StorybookOptions> {
    return tap(storybookOptions => buildDev(storybookOptions));
  }
}

export default StartStorybookBuilder;