import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { StartStorybookSchema } from './schema';
import { buildDev } from '@storybook/core/server';
import { Observable, of } from 'rxjs';
import { BuildStorybookSchema } from '../build-storybook/schema';

export class StartStorybookBuilder implements Builder<StartStorybookSchema> {

  protected constructor(protected context: BuilderContext) {
  }

  public run(builderConfig: BuilderConfiguration<BuildStorybookSchema>): Observable<BuildEvent> {
    return of({success: true});
  }
}

export default StartStorybookBuilder;