/**
 * Build Storybook target options (https://storybook.js.org/configurations/cli-options/)
 */
export interface BuildStorybookSchema {
    /**
     * Host to run Storybook
     */
    host?: string;
    /**
     * Directories where to load static files from
     */
    staticDirs?: string[];
    /**
     * Directory where to store built files
     */
    outputDir?: string;
    /**
     * Directory where to load Storybook configurations from
     */
    configDir?: string;
    /**
     * Enable watch mode
     */
    watch?: boolean;
  }
  