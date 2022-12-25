import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import { r } from "./scripts/utils"

// https://vitejs.dev/config/
export default defineConfig({
  root: r("src"),
  resolve: {
    alias: {
      "~/": `${r("src")}/`,
    },
  },
  plugins: [svelte()],
  build: {
    outDir: r("dist"),
    sourcemap: true,
    emptyOutDir: false,
    rollupOptions: {
      input: {
        background: r("src/background/index.html"),
        options: r("src/options/index.html"),
        popup: r("src/popup/index.html"),
      }
    }
  }
})
