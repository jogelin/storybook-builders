
# Storybook Builders

## Goals
- Provide 2 builders to build and start storybook as the angular way
- Provide the storybook folder as a normal angular project and inject configurations using `angular.json`
- Include directly in storybook share components of libraries of the angular workspace

## Dev

### Build builders
```
cd builders && yarn build
```
When builders are built, they are copied to the node_modules/ of the example

### Build example
```
cd builders && yarn build storybook
```

### start example
```
yarn start storybook
```

### Error since upgrade to alpha.20
```
Cannot find module 'babel-loader/package.json' from '/mnt/c/Users/jo/dev/build-storybook/example'
Error: Cannot find module 'babel-loader/package.json' from '/mnt/c/Users/jo/dev/build-storybook/example'
    at module.exports (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/resolve/lib/sync.js:43:15)
    at isBabelLoader8 (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/@storybook/core/dist/server/loadCustomBabelConfig.js:68:50)
    at _default (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/@storybook/core/dist/server/loadCustomBabelConfig.js:88:10)
    at getBabelConfig (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/@storybook/core/dist/server/config.js:39:61)
    at _default (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/@storybook/core/dist/server/config.js:73:6)
    at Object.buildStatic (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/@storybook/core/dist/server/build-static.js:69:36)
    at TapSubscriber.operators_1.tap.storybookOptions [as _tapNext] (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/@storybook/angular/dist/builders/src/build-storybook/index.js:15:61)
    at TapSubscriber._next (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/rxjs/internal/operators/tap.js:59:27)
    at TapSubscriber.Subscriber.next (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/rxjs/internal/Subscriber.js:68:18)
    at MapSubscriber._next (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/rxjs/internal/operators/map.js:55:26)
    at MapSubscriber.Subscriber.next (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/rxjs/internal/Subscriber.js:68:18)
    at TapSubscriber._next (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/rxjs/internal/operators/tap.js:65:26)
    at TapSubscriber.Subscriber.next (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/rxjs/internal/Subscriber.js:68:18)
    at TapSubscriber._next (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/rxjs/internal/operators/tap.js:65:26)
    at TapSubscriber.Subscriber.next (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/rxjs/internal/Subscriber.js:68:18)
    at MapSubscriber._next (/mnt/c/Users/jo/dev/build-storybook/example/node_modules/rxjs/internal/operators/map.js:55:26)
error Command failed with exit code 1.

```

## Angular Configurations

```json
"storybook": {
      "root": "projects/storybook/",
      "sourceRoot": "projects/storybook/src",
      "projectType": "application",
      "schematics": {},
      "architect": {
        "browse": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/storybook/",
            "main": "",
            "index": "",
            "polyfills": "projects/storybook/src/polyfills.ts",
            "tsConfig": "projects/storybook/tsconfig.app.json",
            "assets": [
              "projects/storybook/src/favicon.ico",
              "projects/storybook/src/assets"
            ],
            "styles": [
              "projects/storybook/src/styles.css"
            ],
            "scripts": []
          }
        },
        "build": {
          "builder": "@storybook/angular/dist/builders:build-storybook",
          "options": {
            "browserTarget": "storybook:browse",
            "tsConfig": "projects/storybook/tsconfig.app.json"
          }
        },
        "serve": {
          "builder": "@storybook/angular/dist/builders:start-storybook",
          "options": {
            "browserTarget": "storybook:browse",
            "tsConfig": "projects/storybook/tsconfig.app.json"
          }
        }
      }
    }
```

## Reminders
- [x] Create schema skeleton for builder `@storybook/angular:start`: `tsConfig`, `port`, `host`, `staticDirs`, `configDir`, `quiet`
- [x] Create schema skeleton for builder `@storybook/angular:build`: `tsConfig`, `host`, `staticDirs`, `outputDir`, `configDir`, `watch`
- [ ] **_IN PROGRESS_** Start with `@storybook/angular:build` and include the `storybook/app/angular/server` functionalities
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

**Later improvments:**

- [ ] Include `storybook/app/angular/client` functionalities (!!! don't know yet the faisability)
  - [ ] try to use builder option to configure storybook instead of the `config.ts` file: - [ ] Load stories from `tsconfig` instead of a method in conf - [ ] List of addons could be speicy in a array in option `addons` in the builder spec - [ ] the custom webpack config should be specify by a path option `webpackConfig` in the builder spec - [ ] ...
