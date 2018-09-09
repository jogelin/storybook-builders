const webpackMerge = require('webpack-merge');

export function webpack(config) {
  const webpackConfig = {};
  return webpackMerge(config, webpackConfig);
}
