import { Configuration } from 'webpack';

export type ConfigurationWrapper = (config: Configuration, configDir?: string) => Configuration;

// TODO: Improve typing
export interface StorybookOptions {
  packageJson: any;
  defaultConfigName: string;
  wrapInitialConfig: ConfigurationWrapper;
  wrapDefaultConfig: ConfigurationWrapper;
  wrapBasicConfig: ConfigurationWrapper;
}
