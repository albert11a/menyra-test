import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const socialRoot = resolve(repoRoot, "apps/menyra-social");

function normalizeForRollup(id = "") {
  return String(id || "").split("?")[0].replace(/\\/g, "/");
}

function socialManualChunks(id) {
  const clean = normalizeForRollup(id);

  if (clean.includes("/shared/vendor/firebase/11.0.0/")) {
    return "vendor-firebase";
  }

  return undefined;
}

export default defineConfig({
  appType: "custom",
  base: "/apps/menyra-social/bundled/",
  publicDir: false,
  build: {
    outDir: resolve(socialRoot, "bundled"),
    emptyOutDir: true,
    copyPublicDir: false,
    target: "es2022",
    minify: "esbuild",
    sourcemap: false,
    manifest: "manifest.json",
    cssCodeSplit: true,
    modulePreload: {
      polyfill: false
    },
    rollupOptions: {
      input: {
        "social-public-entry": resolve(socialRoot, "social-public-bundled-entry.js"),
        "social-app": resolve(socialRoot, "social-app.js")
      },
      output: {
        entryFileNames: "entry/[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        manualChunks: socialManualChunks
      }
    }
  }
});
