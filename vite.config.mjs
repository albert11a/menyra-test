import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const socialRoot = resolve(repoRoot, "apps/menyra-social");
const analyzeBundle = process.env.MNYRA_BUNDLE_ANALYZE === "1";

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

function isHeartPrettyRoutePath(pathname = "") {
  const clean = String(pathname || "").split("?")[0].replace(/\/+$/g, "") || "/";
  return clean === "/leads"
    || clean === "/customers"
    || clean === "/admin/staff"
    || clean.startsWith("/admin/staff/");
}

function rewriteHeartPrettyRoute(req) {
  if (!req || (req.method !== "GET" && req.method !== "HEAD")) return;
  const parsed = new URL(req.url || "/", "http://mnyra.local");
  if (!isHeartPrettyRoutePath(parsed.pathname)) return;
  req.url = `/apps/mnyra-heart/index.html${parsed.search || ""}`;
}

function localHeartPrettyRoutePlugin() {
  return {
    name: "mnyra-local-heart-pretty-routes",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteHeartPrettyRoute(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteHeartPrettyRoute(req);
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    localHeartPrettyRoutePlugin(),
    ...(analyzeBundle
      ? [
          visualizer({
            filename: resolve(repoRoot, "docs/codex/generated/bundle-stats.html"),
            gzipSize: true,
            brotliSize: true,
            template: "treemap"
          })
        ]
      : [])
  ],
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
