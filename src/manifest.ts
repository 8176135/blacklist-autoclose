import fs from "fs-extra"
import type { Manifest } from "webextension-polyfill"
import type PkgType from "../package.json"
import { isDev, port, r } from "../scripts/utils"

export async function getManifest() {
  const pkg = await fs.readJSON(r("package.json")) as typeof PkgType

  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 2,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    applications: {
      gecko: {
        id: "{74108f18-bfa1-4cd3-a0b1-6c575ee3dce0}",
        strict_min_version: "57.0",
      }
    },
    browser_action: {
      default_icon: "./assets/icon/cross128.png",
      default_popup: "./popup/index.html",
    },
    options_ui: {
      page: "./options/index.html",
      open_in_tab: false,
      browser_style: true,
      chrome_style: true,
    },
    background: {
      page: "./background/index.html",
      persistent: false,
    },
    icons: {
      48: "./assets/icon/cross48.png",
      128: "./assets/icon/cross128.png",
    },
    permissions: [
      "tabs",
      "storage",
      "activeTab",
      "http://*/",
      "https://*/",
    ],
    content_scripts: [{
      matches: ["http://*/*", "https://*/*"],
      js: ["./dist/contentScripts/index.global.js"],
    }],
    web_accessible_resources: [
      "dist/contentScripts/style.css",
    ],
  }

  if (isDev) {
    // for content script, as browsers will cache them for each reload,
    // we use a background script to always inject the latest version
    // see src/background/contentScriptHMR.ts
    delete manifest.content_scripts
    manifest.permissions?.push("webNavigation")

    // this is required on dev for Vite script to load
    manifest.content_security_policy = `script-src 'self' http://localhost:${port}; object-src 'self'`
  }

  return manifest
}
