# Blacklist Autoclose 
### A WebExtension for Firefox

Get it here: https://addons.mozilla.org/en-US/firefox/addon/blacklist-autoclose/

## Build from source

### Prerequisites:

- [`pnpm`](https://pnpm.io/installation) (though just `npm` probably will work too)

### Steps:

1. `pnpm install`
2. `NODE_ENV="production" pnpm build`  This bundles most of the files
3. `NODE_ENV="production" pnpm build:prepare`  This copies the loose assets and generates the `manifest.json`. 
Make sure to pass NODE_ENV=production otherwise it will rewrite .html files to point to the vite development server instead of the generated .js files.
4. Look in the `dist/` folder.
