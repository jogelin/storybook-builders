import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { bindNodeCallback, Observable, of, OperatorFunction } from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';
import { Path, resolve, virtualFs } from '@angular-devkit/core';
import { Stats, writeFile } from 'fs';
import path from 'path';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils';
import { BrowserBuilderSchema } from '@angular-devkit/build-angular/src/browser/schema';
import { BrowserBuilder, NormalizedBrowserBuilderSchema } from '@angular-devkit/build-angular/src/browser';
import { StartStorybookSchema } from './start-storybook/schema';
import { BuildStorybookSchema } from './build-storybook/schema';
import program from 'commander';
import { StorybookOptions } from './storybook.types';
// @ts-ignore
import packageJson from '../package.json';
import  stringifyObject from 'stringify-object';

export abstract class StorybookBuilder<T extends (BuildStorybookSchema | StartStorybookSchema)> implements Builder<T> {

  protected constructor(protected context: BuilderContext) {
  }

  public run(builderConfig: BuilderConfiguration<T>): Observable<BuildEvent> {
    const options = builderConfig.options;
    const root = this.context.workspace.root;
    const projectRoot = resolve(root, builderConfig.root);
    const host = new virtualFs.AliasHost(this.context.host as virtualFs.Host<Stats>);
    const browserOptions: Partial<BrowserBuilderSchema> = {};
    const writeFileObs = bindNodeCallback(writeFile);

    return of(null).pipe(
      // Get options from the browser builder config and set them
      concatMap(() => this.getBrowserOptions(options)),
      tap(opts => (Object.assign(browserOptions, opts))),

      // Normalize assets and replace the assets in options with the normalized version.
      concatMap(() => normalizeAssetPatterns(browserOptions.assets, host, root, projectRoot, builderConfig.sourceRoot)),
      tap(assetPatternObjects => (browserOptions.assets = assetPatternObjects)),

      // Generate webpack configurations using the browse builder of angular
      map(() => this.buildWebpackConfig(root, projectRoot, host, browserOptions as NormalizedBrowserBuilderSchema)),

      // write config to a file (TO DELETE)
      map(webpackConfig => stringifyObject(webpackConfig)),
      concatMap(webpackConfigSerialized => writeFileObs(path.resolve(__dirname, 'framework-preset-angular-cli.js'),
        `"use strict";
         Object.defineProperty(exports, "__esModule", { value: true });
         function webpack(config) {
            return ${ webpackConfigSerialized };
         }
         exports.webpack = webpack;`)
      ),

      // Inject options in program to allow storybook to use them
      this.injectBuilderOptionsToProgram(options, browserOptions, projectRoot),

      // Initialize the storybook options and run the build
      this.getStorybookOptionsWithAngularPresets(),
      this.buildStorybook(),

      // return build event
      map(_ => ({success: true})),
      catchError(e => {
        console.error(e);
        this.context.logger.error("Failed to build storybook", e);
        return of({success: false});
      })
    ) as Observable<BuildEvent>;
  }

  private getBrowserOptions(options: T) {
    const architect = this.context.architect;
    const [project, target, configuration] = options.browserTarget.split(':');

    const browserTargetSpec = {project, target, configuration, ...this.getBrowserOptionsOverrides(options)};
    const builderConfig = architect.getBuilderConfiguration<BrowserBuilderSchema>(browserTargetSpec);

    return architect.getBuilderDescription(builderConfig).pipe(
      concatMap(browserDescription => architect.validateBuilderOptions(builderConfig, browserDescription)),
      map(browserConfig => browserConfig.options),
    );
  }

  protected abstract getBrowserOptionsOverrides(options: T): Partial<BrowserBuilderSchema>;

  private buildWebpackConfig(root: Path, projectRoot: Path, host: virtualFs.Host<Stats>, browserOptions: BrowserBuilderSchema) {
    const browserBuilder = new BrowserBuilder(this.context);
    return browserBuilder.buildWebpackConfig(root, projectRoot, host, browserOptions as NormalizedBrowserBuilderSchema);
  }

  private injectBuilderOptionsToProgram(options: T, browserOptions: Partial<BrowserBuilderSchema>, projectRoot: string): OperatorFunction<void, void> {
    return tap(() => {
      // init storybook arguments = command argument OR builder option
      Object.keys(options).forEach(key => {
        program[key] = program[key] || Array.isArray(options[key]) ? options[key].join(',') : options[key];
      });

      // set default
      program.configDir = program.configDir || projectRoot;
      program.outputDir = program.outputDir || browserOptions.outputPath;
    });
  }

  private getStorybookOptionsWithAngularPresets(): OperatorFunction<void, StorybookOptions> {
    // TODO : merge angularWebpackConfig with storybook config
    return map(_ => ({
      packageJson,
      defaultConfigName: 'angular-cli',
      frameworkPresets: [
        require.resolve(path.resolve(__dirname,'framework-preset-angular-cli.js')),
      ]
    }));
  }

  protected abstract buildStorybook(): OperatorFunction<StorybookOptions, StorybookOptions>;
}
