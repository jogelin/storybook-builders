import { AssetPattern, ExtraEntryPoint } from '@angular-devkit/build-angular';

export interface StorybookSchema {
  /**
   * List of static application assets.
   */
  assets?: AssetPattern[];
  /**
   * The name of the polyfills file.
   */
  polyfills?: string;
  /**
   * The name of the TypeScript configuration file.
   */
  tsConfig: string;
  /**
   * Global styles to be included in the build.
   */
  styles: ExtraEntryPoint[];
  /**
   * Global styles to be included in the build.
   */
  staticDir?: string[];
  /**
   * Directory where to load Storybook configurations from
   */
  configDir?: string;
}
