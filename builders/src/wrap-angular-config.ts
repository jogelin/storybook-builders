import { ConfigurationWrapper } from './storybook.types';
import fs from 'fs';
import path from 'path';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils/normalize-asset-patterns';

export function wrapAngularConfig(tsConfigPath: string): ConfigurationWrapper {
  normalizeAssetPatterns();

  return (config, configDir) => ({
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: require.resolve('ts-loader'),
              options: {
                configFile: tsConfigPath
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
      ...config.resolve,
      extensions: [...config.resolve.extensions, '.ts', '.tsx']
    }
  });
}
