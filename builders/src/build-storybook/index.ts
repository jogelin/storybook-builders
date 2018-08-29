import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { Observable, concat, of, throwError } from 'rxjs';
import { concatMap, last, tap, map } from 'rxjs/operators';
import { BuildStorybookSchema } from './schema';
import { buildDev } from '@storybook/core/server';
import program from 'commander';

import { mapToStorybookOptions } from '../storybook-options';

import { LoggingCallback, WebpackBuilder } from '@angular-devkit/build-webpack';
import { Path, getSystemPath, normalize, resolve, virtualFs } from '@angular-devkit/core';
import * as fs from 'fs';
import * as ts from 'typescript'; // tslint:disable-line:no-implicit-dependencies
import { WebpackConfigOptions } from '@angular-devkit/build-angular/src/angular-cli-files/models/build-options';
import {
  getAotConfig,
  getBrowserConfig,
  getCommonConfig,
  getNonAotConfig,
  getStatsConfig,
  getStylesConfig
} from '@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs';
import { readTsconfig } from '@angular-devkit/build-angular/src//angular-cli-files/utilities/read-tsconfig';
import { requireProjectModule } from '@angular-devkit/build-angular/src//angular-cli-files/utilities/require-project-module';
import {
  statsErrorsToString,
  statsToString,
  statsWarningsToString
} from '@angular-devkit/build-angular/src/angular-cli-files/utilities/stats';
import {
  defaultProgress,
  normalizeAssetPatterns,
  normalizeFileReplacements
} from '@angular-devkit/build-angular/src/utils';
import { BrowserBuilderSchema } from '@angular-devkit/build-angular/src/browser/schema';
import { BrowserBuilder, NormalizedBrowserBuilderSchema } from '@angular-devkit/build-angular/src/browser';

export default class BuildStorybookBuilder implements Builder<BuildStorybookSchema> {
  constructor(private context: BuilderContext) {}

  run(builderConfig: BuilderConfiguration<BuildStorybookSchema>): Observable<BuildEvent> {
    const options = builderConfig.options;
    const root = this.context.workspace.root;
    const projectRoot = resolve(root, builderConfig.root);
    const host = new virtualFs.AliasHost(this.context.host as virtualFs.Host<fs.Stats>);
    const webpackBuilder = new WebpackBuilder({ ...this.context, host });
    let browserOptions: BrowserBuilderSchema;

    return of(null).pipe(
      concatMap(() => this._getBrowserOptions(options)),
      tap(opts => (browserOptions = opts)),
      concatMap(() => normalizeAssetPatterns(browserOptions.assets, host, root, projectRoot, builderConfig.sourceRoot)),
      // Replace the assets in options with the normalized version.
      tap(assetPatternObjects => (browserOptions.assets = assetPatternObjects)),
      concatMap(() => {
        const webpackConfig = this.buildWebpackConfig(
          root,
          projectRoot,
          host,
          browserOptions as NormalizedBrowserBuilderSchema
        );
        return webpackConfig;
        // return webpackBuilder.runWebpack(webpackConfig, getBrowserLoggingCb(options.verbose));
      }),
      tap(config => console.log(config)),
      //   tap(options => buildDev(options)),
      map(() => ({ success: true }))
    );
  }

  buildWebpackConfig(
    root: Path,
    projectRoot: Path,
    host: virtualFs.Host<fs.Stats>,
    browserOptions: BrowserBuilderSchema
  ) {
    const browserBuilder = new BrowserBuilder(this.context);
    const webpackConfig = browserBuilder.buildWebpackConfig(
      root,
      projectRoot,
      host,
      browserOptions as NormalizedBrowserBuilderSchema
    );

    return webpackConfig;
  }

  private _getBrowserOptions(options: BuildStorybookSchema) {
    const architect = this.context.architect;
    // TODO: take the name from the angular.json
    const project = 'storybook';
    const target = 'build';
    const configuration = null;

    const overrides = {
      // Override browser build watch setting.
      //   outputPath: options.outputDir,
      tsConfig: options.tsConfig,
      assets: options.assets,
      styles: options.styles,

      // Update the browser options with the same options we support in serve, if defined.
      optimization: {},
      aot: {},
      sourceMap: {},
      vendorSourceMap: {},
      evalSourceMap: {},
      vendorChunk: {},
      commonChunk: {},
      baseHref: {},
      progress: {},
      poll: {}
    };

    const browserTargetSpec = { project, target, configuration, overrides };
    const builderConfig = architect.getBuilderConfiguration<BrowserBuilderSchema>(browserTargetSpec);

    return architect.getBuilderDescription(builderConfig).pipe(
      tap(browserDescription => console.log(browserDescription)),
      concatMap(browserDescription => architect.validateBuilderOptions(builderConfig, browserDescription)),
      map(browserConfig => browserConfig.options)
    );
  }
}

/*
export function initArgumentsFromOptions(): OperatorFunction<BuilderConfig, BuilderConfig> {
  return tap(({ options, root }) => {
    // init storybook arguments = command argument OR builder option
    Object.keys(options).forEach(key => {
      program[key] = program[key] || Array.isArray(options[key]) ? options[key].join(',') : options[key];
    });

    //set default root config dir if not specified
    program.configDir = program.configDir || root;
  });
}
*/
