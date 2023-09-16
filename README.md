<h1 align="center">
<sub>
<img src="src/assets/icon/cross128.png" width="38" />
</sub>
Blacklist AutoClose <br>
Install it as a <a href="https://addons.mozilla.org/en-US/firefox/addon/blacklist-autoclose/">Firefox Addon</a>
</h1>

## Build from source
### Prerequisites:

- [npm](https://www.npmjs.com/) / [pnpm](https://pnpm.io/installation)
- [Firefox](https://www.mozilla.org/en-US/firefox/new/) to use it

### PNPM:

1. `pnpm install`
2. `NODE_ENV="production" pnpm build`  
→ bundles most of the files
3. `NODE_ENV="production" pnpm build:prepare`  
→ copies the loose assets and generates the `manifest.json` in `dist/`

### NPM:

1. `npm install`
2. `NODE_ENV="production" npm run build`  
→ bundles most of the files
3. `NODE_ENV="production" npm run build:prepare`  
→ copies the loose assets and generates the `manifest.json` in `dist/`