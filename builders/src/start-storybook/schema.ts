/**
 * Start Storybook target options (https://storybook.js.org/configurations/cli-options/)
 */
export interface StartStorybookSchema {
    /**
     * Port to run Storybook
     */
    port: number;
    /**
     * Host to run Storybook
     */
    host?: string;
    /**
     * Directories where to load static files from
     */
    staticDirs?: string[];
    /**
     * Directory where to load Storybook configurations from
     */
    configDir?: string;
    /**
     * Suppress verbose build output
     */
    quiet?: boolean;
  }
  