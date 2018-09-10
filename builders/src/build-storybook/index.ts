import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { bindNodeCallback, Observable, of, OperatorFunction, pipe } from 'rxjs';
import { catchError, concatMap, concatMapTo, map, tap } from 'rxjs/operators';
import { getSystemPath, Path, resolve, virtualFs, normalize } from '@angular-devkit/core';
import { existsSync, readFile, Stats, writeFile } from 'fs';
import path from 'path';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils';
import { buildStatic } from '@storybook/core/server'; // @ts-ignore
import * as ts from 'typescript'; // tslint:disable-line:no-implicit-dependencies
import stringifyObject from 'stringify-object';
import { BuildStorybookSchema, NormalizedBuildStorybookSchema } from './schema';
import { StorybookOptions } from '../storybook.types';
import { Configuration, ContextReplacementPlugin } from 'webpack';
import { StorybookSchema } from '../storybook-schema';
import program from 'commander';
import packageJson from '../../package.json';
import { WebpackConfigOptions } from '@angular-devkit/build-angular/src/angular-cli-files/models/build-options';
import { readTsconfig } from '@angular-devkit/build-angular/src/angular-cli-files/utilities/read-tsconfig';
import { requireProjectModule } from '@angular-devkit/build-angular/src/angular-cli-files/utilities/require-project-module';
import { logger } from '@storybook/node-logger';

const webpackMerge = require('webpack-merge');
const writeFileObs = bindNodeCallback(writeFile);

export class BuildStorybookBuilder implements Builder<BuildStorybookSchema> {

  options: NormalizedBuildStorybookSchema;
  root: Path;
  projectRoot: Path;
  host: virtualFs.AliasHost;

  protected constructor(protected context: BuilderContext) {
    this.root = this.context.workspace.root;
    this.host = new virtualFs.AliasHost(this.context.host as virtualFs.Host<Stats>);
  }

  public run(builderConfig: BuilderConfiguration<BuildStorybookSchema>): Observable<BuildEvent> {
    this.projectRoot = resolve(this.root, builderConfig.root);


    return of(null).pipe(
      // Init options with normalized assets
      concatMap(() => normalizeAssetPatterns(builderConfig.options.assets, this.host, this.root, this.projectRoot, builderConfig.sourceRoot)),
      tap(assetPatternObjects => {
        this.options = {
          ...builderConfig.options,
          assets: assetPatternObjects
        } as NormalizedBuildStorybookSchema;
      }),

      // Generate webpack configurations using the browse builder of angular
      map(() => this.buildWebpackConfig()),

      // Initialize the storybook options and run the build
      this.writeAngularPresetsFile(), // write config to a file (TO DELETE)
      this.mapToStorybookOptionsWithAngularPresets(),
      this.injectBuilderOptionsToProgram(),
      this.buildStorybook()
    );
  }

  private buildWebpackConfig(): Configuration {
    if (!existsSync(path.resolve(this.options.tsConfig))) {
      throw new Error(`Typescript config file "${this.options.tsConfig}" not found`);
    }

    //TODO
    // return webpackMerge(this.getAngularWebpackConfig(), this.getAngularCliWebpackConfig());
    return this.getAngularWebpackConfig();
  }

  private getAngularCliWebpackConfig(): Configuration {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const ngcliConfigFactory = require('@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs');

    let wco: WebpackConfigOptions<NormalizedBuildStorybookSchema & {scripts: string[], outputPath: string}>;

    const tsConfigPath = getSystemPath(normalize(resolve(this.root, normalize(this.options.tsConfig))));
    const tsConfig = readTsconfig(tsConfigPath);

    const projectTs = requireProjectModule(getSystemPath(this.projectRoot), 'typescript') as typeof ts;

    const supportES2015 = tsConfig.options.target !== projectTs.ScriptTarget.ES3
      && tsConfig.options.target !== projectTs.ScriptTarget.ES5;

    wco = {
      root: getSystemPath(this.root),
      projectRoot: getSystemPath(this.projectRoot),
      buildOptions: { ...this.options, scripts: [], outputPath: this.options.outputDir },
      tsConfig,
      tsConfigPath,
      supportES2015
    };
    console.log(wco);

    let cliCommonConfig;
    let cliStyleConfig;
    try {
      cliCommonConfig = ngcliConfigFactory.getCommonConfig(wco);
      cliStyleConfig = ngcliConfigFactory.getStylesConfig(wco);
    } catch (e) {
      console.error(e);
      logger.warn('=> Failed to get angular-cli webpack config.');
      return {};
    }
    logger.info('=> Get angular-cli webpack config.');

    // Don't use storybooks .css/.scss rules because we have to use rules created by @angular-devkit/build-angular
    // TODO
    // because @angular-devkit/build-angular created rules have include/exclude for global style files.
    /*    const rulesExcludingStyles = baseConfig.module.rules.filter(
          rule =>
            !rule.test || (rule.test.toString() !== '/\\.css$/' && rule.test.toString() !== '/\\.scss$/')
        );*/

    // cliStyleConfig.entry adds global style files to the webpack context
    const entry = {
      iframe: []
        .concat(Object.values(cliStyleConfig.entry).reduce((acc: string[], item: string[]) => acc.concat(item, [])))
    };

    return {
      entry,
      module: {
        // rules: [...cliStyleConfig.module.rules, ...rulesExcludingStyles]
        rules: [...cliStyleConfig.module.rules]
      },
      // We use cliCommonConfig plugins to serve static assets files.
      plugins: [...cliStyleConfig.plugins, ...cliCommonConfig.plugins],
      resolveLoader: cliCommonConfig.resolveLoader
    };
  }

  private getAngularWebpackConfig(): Configuration {
    return {
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: [
              {
                loader: require.resolve('ts-loader'),
                options: {
                  configFile: this.options.tsConfig
                }
              },
              require.resolve('angular2-template-loader')
            ]
          },
          {
            test: /[/\\]@angular[/\\]core[/\\].+\.js$/,
            parser: { system: true }
          },
          {
            test: /\.html$/,
            loader: 'raw-loader',
            exclude: /\.async\.html$/
          },
          {
            test: /\.scss$/,
            use: [require.resolve('raw-loader'), require.resolve('sass-loader')]
          }
        ]
      },
      resolve: {
        extensions: ['.ts', '.tsx']
      }/*,
      plugins: [
        // See https://github.com/angular/angular/issues/11580#issuecomment-401127742
        new ContextReplacementPlugin(
          /@angular(\\|\/)core(\\|\/)fesm5/,
          path.resolve(__dirname, '..')
        )
      ]*/
    };
  }

  protected writeAngularPresetsFile(): OperatorFunction<Configuration, void> {
    return concatMap(webpackConfig => {
        return writeFileObs(path.resolve(__dirname, 'framework-preset-angular-cli.js'), `
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        const webpackMerge = require('webpack-merge');
        function webpack(config) {
          var cfg = webpackMerge(config, ${stringifyObject(webpackConfig)});
          return cfg;
        }
        exports.webpack = webpack;
      `);
      }
    );
  }

  protected injectBuilderOptionsToProgram(): OperatorFunction<StorybookOptions, StorybookOptions> {
    return tap(() => {
      // init storybook arguments = command argument OR builder option
      Object.keys(this.options).forEach(key => {
        program[key] = program[key] || Array.isArray(this.options[key]) ? this.options[key].join(',') : this.options[key];
      });

      // set default
      program.configDir = program.configDir || this.projectRoot;
    });
  }

  protected mapToStorybookOptionsWithAngularPresets(): OperatorFunction<void, StorybookOptions> {
    return map(_ => ({
      packageJson,
      defaultConfigName: 'angular-cli',
      frameworkPresets: [
        require.resolve(path.resolve(__dirname, 'framework-preset-angular-cli.js'))
      ]
    }));
  }


  protected buildStorybook(): OperatorFunction<StorybookOptions, BuildEvent> {
    return pipe(
      tap(storybookOptions => buildStatic(storybookOptions)),

      // return build event
      map(_ => ({ success: true })),
      catchError(e => {
        console.error(e);
        this.context.logger.error('Failed to build storybook', e);
        return of({ success: false });
      })
    );
  }
}

export default BuildStorybookBuilder;