TODO:

- [ ] Create schema skeleton for builder `@storybook/angular:start`: `tsConfig`, `port`, `host`, `staticDirs`, `configDir`, `quiet`
- [ ] Create schema skeleton for builder `@storybook/angular:build`: `tsConfig`, `host`, `staticDirs`, `outputDir`, `configDir`, `watch`
- [ ] Start with `@storybook/angular:build` and include the `storybook/app/angular/server` functionalities
  - [ ] use `tsConfig` option to get typescript configurations instead of default `tsconfig` in the `configDir`
  - [ ] Wrap initial webpack configs (ts-loader, angular2-template-loader, raw-loader, sass-loader)
  - [ ] Wrap default webpack configs from `builder options`:
    - [ ] get `@angular/cli` webpack configs
    - [ ] get styles and add to webpack configs
    - [ ] get assets and add to webpack configs
  - [ ] Wrap basic webpack configs (same as default webpack configs)
- [ ] Extend `@storybook/angular:build` to create the builder `@storybook/angular:start`
- [ ] Create schema skeleton for builder `@storybook/angular:test` to run tests in storybook
- [ ] include the builders in the storybook repository

  - [ ] replace `storybook/app/angular/server` by the builder
  - [ ] adapt `storybook/examples/angular-cli`
    - [ ] simple an multiple packages examples
    - [ ] jest test using `@angular-builders/jest`
  - [ ] adapt `storybook/lib/cli/generators/ANGULAR` to inject storybook project with builders in `angular.json`
        Later improvments:

- [ ] Include `storybook/app/angular/client` functionalities (!!! don't know yet the faisability)
  - [ ] try to use builder option to configure storybook instead of the `config.ts` file:
    - [ ] Load stories from `tsconfig` instead of a method in conf
    - [ ] List of addons could be speicy in a array in option `addons` in the builder spec
    - [ ] the custom webpack config should be specify by a path option `webpackConfig` in the builder spec
    - [ ] ...

Questions:

what is the differences between
