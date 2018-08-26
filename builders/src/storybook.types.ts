import { Configuration } from 'webpack';

export type ConfigurationWrapper = (config: Configuration, configDir?: string) => Configuration;

// TODO: Improve typing
export interface Options {
  packageJson: any;
  defaultConfigName: string;
  wrapInitialConfig: ConfigurationWrapper;
  wrapDefaultConfig: ConfigurationWrapper;
  wrapBasicConfig: ConfigurationWrapper;
}
