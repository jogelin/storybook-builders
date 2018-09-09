import { Builder, BuilderConfiguration, BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { bindNodeCallback, Observable, of, OperatorFunction, pipe } from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';
import { resolve, virtualFs } from '@angular-devkit/core';
import { existsSync, readFile, Stats, writeFile } from 'fs';
import path from 'path';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils';
import { buildStatic } from '@storybook/core/server'; // @ts-ignore
import stringifyObject from 'stringify-object';
import { BuildStorybookSchema, NormalizedBuildStorybookSchema } from './schema';
import { StorybookOptions } from '../storybook.types';
import { Configuration, ContextReplacementPlugin } from 'webpack';
import { StorybookSchema } from '../storybook-schema';
import program from 'commander';
import packageJson from '../../package.json';


export class BuildStorybookBuilder implements Builder<BuildStorybookSchema> {

  protected constructor(protected context: BuilderContext) {
  }

  public run(builderConfig: BuilderConfiguration<BuildStorybookSchema>): Observable<BuildEvent> {
    const options = builderConfig.options;
    const root = this.context.workspace.root;
    const projectRoot = resolve(root, builderConfig.root);
    const host = new virtualFs.AliasHost(this.context.host as virtualFs.Host<Stats>);
    const readFileObs = bindNodeCallback(readFile);
    const writeFileObs = bindNodeCallback(writeFile);

    return of(null).pipe(
      // Normalize assets and replace the assets in options with the normalized version.
      concatMap(() => normalizeAssetPatterns(options.assets, host, root, projectRoot, builderConfig.sourceRoot)),
      tap(assetPatternObjects => (options.assets = assetPatternObjects)),

      // Generate webpack configurations using the browse builder of angular
      map(() => this.buildWebpackConfig(options as NormalizedBuildStorybookSchema)),

      // write config to a file (TO DELETE)
      concatMap(webpackConfig => {
        return writeFileObs(path.resolve(__dirname, 'framework-preset-angular-cli.js'), `
          "use strict";
          Object.defineProperty(exports, "__esModule", { value: true });
          const webpackMerge = require('webpack-merge');
          function webpack(config) {
            var cfg = webpackMerge(config, ${stringifyObject(webpackConfig)});
            return cfg;
          }
          exports.webpack = webpack;
        `)
        }
      ),

      // Initialize the storybook options and run the build
      this.injectBuilderOptionsToProgram(options, projectRoot),
      this.mapToStorybookOptionsWithAngularPresets(),
      this.buildStorybook()

    );
  }

  private buildWebpackConfig(options: NormalizedBuildStorybookSchema): Configuration {
    if (!existsSync(path.resolve(options.tsConfig))) {
      throw new Error(`Typescript config file "${options.tsConfig}" not found`);
    }

    return {
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: [
              {
                loader: require.resolve('ts-loader'),
                options: {
                  configFile: options.tsConfig
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

  protected injectBuilderOptionsToProgram(options: StorybookSchema, projectRoot: string): OperatorFunction<void, void> {
    return tap(() => {
      // init storybook arguments = command argument OR builder option
      Object.keys(options).forEach(key => {
        program[key] = program[key] || Array.isArray(options[key]) ? options[key].join(',') : options[key];
      });

      // set default
      program.configDir = program.configDir || projectRoot;
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