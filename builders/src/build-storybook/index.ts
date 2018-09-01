import {Builder, BuilderConfiguration, BuilderContext, BuildEvent} from '@angular-devkit/architect';
import {Observable, of, OperatorFunction} from 'rxjs';
import {concatMap, map, tap} from 'rxjs/operators';
import {BuildStorybookSchema} from './schema';
import {buildStatic} from '@storybook/core/server';
import {Path, resolve, virtualFs} from '@angular-devkit/core';
import * as fs from 'fs';
import {normalizeAssetPatterns} from '@angular-devkit/build-angular/src/utils';
import {BrowserBuilderSchema} from '@angular-devkit/build-angular/src/browser/schema';
import {BrowserBuilder, NormalizedBrowserBuilderSchema} from '@angular-devkit/build-angular/src/browser';
import {Options} from '../storybook.types';
import {wrapInitialConfig} from '../wrap-initial-config';
import program from 'commander';
import packageJson from '../../package.json';
import * as webpack from 'webpack';

export default class BuildStorybookBuilder implements Builder<BuildStorybookSchema> {

  private browserBuilder = new BrowserBuilder(this.context);

  constructor(private context: BuilderContext) {
  }

  public run(builderConfig: BuilderConfiguration<BuildStorybookSchema>): Observable<BuildEvent> {
    const options = builderConfig.options;
    const root = this.context.workspace.root;
    const projectRoot = resolve(root, builderConfig.root);
    const host = new virtualFs.AliasHost(this.context.host as virtualFs.Host<fs.Stats>);
    let browserOptions: Partial<BrowserBuilderSchema> = {};
    this.browserBuilder = new BrowserBuilder(this.context);


    return of(null).pipe(
      concatMap(() => this._getBrowserOptions(options)),
      tap(opts => (Object.assign(browserOptions, opts))),
      concatMap(() => normalizeAssetPatterns(browserOptions.assets, host, root, projectRoot, builderConfig.sourceRoot)),
      // Replace the assets in options with the normalized version.
      tap(assetPatternObjects => (browserOptions.assets = assetPatternObjects)),
      map(() => this.buildWebpackConfig(root, projectRoot, host, browserOptions as NormalizedBrowserBuilderSchema)),
      initProgramArgumentsFromOptions(options, browserOptions, projectRoot),
      mapToStorybookOptions(options, browserOptions),
      tap(storybookOptions => buildStatic(storybookOptions)),
      map(() => ({success: true}))
    );
  }

  public buildWebpackConfig(root: Path, projectRoot: Path, host: virtualFs.Host<fs.Stats>, browserOptions: BrowserBuilderSchema) {
    const browserBuilder = new BrowserBuilder(this.context);
    return browserBuilder.buildWebpackConfig(root, projectRoot, host, browserOptions as NormalizedBrowserBuilderSchema
    );
  }

  private _getBrowserOptions(options: BuildStorybookSchema) {

    const architect = this.context.architect;
    const [project, target, configuration] = options.browserTarget.split(':');

    const overrides = {
      ...(options.tsConfig !== undefined ? {tsConfig: options.tsConfig} : {})
    };

    const browserTargetSpec = {project, target, configuration, overrides};
    const builderConfig = architect.getBuilderConfiguration<BrowserBuilderSchema>(browserTargetSpec);

    return architect.getBuilderDescription(builderConfig).pipe(
      concatMap(browserDescription => architect.validateBuilderOptions(builderConfig, browserDescription)),
      map(browserConfig => browserConfig.options),
    );
  }
}

export function initProgramArgumentsFromOptions(options: BuildStorybookSchema, browserOptions:Partial<BrowserBuilderSchema>, projectRoot): OperatorFunction<any, any> {
  return tap(() => {
    // init storybook arguments = command argument OR builder option
    Object.keys(options).forEach(key => {
      program[key] = program[key] || Array.isArray(options[key]) ? options[key].join(',') : options[key];
    });

    // set default root config dir if not specified
    program.configDir = program.configDir || projectRoot;

    program.outputDir = browserOptions.outputPath;
  });
}

export function mapToStorybookOptions(options: BuildStorybookSchema,  browserOptions:Partial<BrowserBuilderSchema>): OperatorFunction<webpack.Configuration, Options> {
  return map(angularWebpackConfig => {
    console.log(angularWebpackConfig);
    return {
    packageJson,
    defaultConfigName: 'angular-cli',
    wrapInitialConfig: wrapInitialConfig(browserOptions.tsConfig),
    wrapDefaultConfig: config => angularWebpackConfig,
    wrapBasicConfig: config => angularWebpackConfig
  }});
}
