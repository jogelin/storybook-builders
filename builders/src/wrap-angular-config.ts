import { ConfigurationWrapper } from './storybook.types';
import fs from 'fs';
import path from 'path';
import { normalizeAssetPatterns } from '@angular-devkit/build-angular/src/utils/normalize-asset-patterns';
/*
export function wrapAngularConfig(tsConfigPath: string): ConfigurationWrapper {}

export function getAngularCliWebpackConfigOptions(tsConfigPath: string): WebpackConfigOptions {
  let wco: WebpackConfigOptions<NormalizedBrowserBuilderSchema>;

  wco = {
    root: getSystemPath(root),
    projectRoot: getSystemPath(projectRoot),
    buildOptions: options,
    tsConfig,
    tsConfigPath,
    supportES2015
  };
}
*/
