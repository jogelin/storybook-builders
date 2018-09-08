import { logger } from '@storybook/node-logger';
import * as fs from 'fs';

export function webpack(config) {
  const cliWebpackConfigOptions = JSON.parse(fs.readFileSync('angular-cli-webpack-config.json', 'utf8'));

  if (cliWebpackConfigOptions) {
    logger.info('=> Loading angular-cli config.');
  }

  return cliWebpackConfigOptions;
}
