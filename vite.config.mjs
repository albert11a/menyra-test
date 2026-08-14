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

// Domain-Ordner unter apps/menyra-social/core/, die in eigene, parallel geladene
// Chunks ausgelagert werden, damit der Entry (entry/social-app.js) unter Budget
// bleibt. Bewusst AUSGENOMMEN:
//  - app-shell/common/router/ui: eng mit dem Entry-Orchestrator verwoben (Zyklus).
//  - marketplace/media/overlays/shop: enthalten LAZY (dynamisch importierte)
//    Render-/Upload-Cluster; sie hier zu gruppieren wuerde sie mit ihrer
//    statischen Boundary in einen eager Chunk zwingen und damit den Cold-Start
//    verschlechtern. Sie bleiben ungegruppt -> ihre schweren Teile laden erst
//    on-demand (Rollup-Dynamic-Chunks).
// Verhaltensneutral: Rollup verdrahtet statische Sibling-Chunks, modulepreload
// laedt sie parallel.
// Explizite Datei-Listen: Module dieser Domains, die HEUTE statisch (eager)
// im Social-Entry stecken. Sie wandern in eigene, parallel geladene und
// content-gehashte Chunks. Bewusst NUR die aktuell eagere Teilmenge pro
// Ordner - dieselben Ordner enthalten auch LAZY-Cluster (dynamische Chunks
// wie profile-menu-focus-render-controller oder menu-modal-render-utils),
// die hier NICHT auftauchen duerfen, sonst wuerden sie eager erzwungen.
// Neue Dateien landen standardmaessig weiter im Entry (sicherer Default).
const SOCIAL_EAGER_FILE_CHUNKS = {
  "domain-feed-social-eager": [
    "core/profile/business-profile-type-utils.js",
    "core/profile/business-visibility-utils.js",
    "core/profile/handle-utils.js",
    "core/profile/profile-display-utils.js",
    "core/profile/profile-menu-focus-render-boundary.js",
    "core/profile/profile-menu-focus-render-preload-utils.js",
    "core/profile/profile-menu-focus-utils.js",
    "core/profile/profile-route-open-utils.js",
    "core/profile/profile-skeleton-markup.js",
    "core/profile/profile-visible-patch-utils.js",
    "core/profile/public-menu-surface-state-utils.js",
    "core/profile/public-profile-direct-entry-controller.js",
    "core/profile/public-profile-runtime-controller.js",
    "core/profile/public-profile-surface-controller.js",
    "core/profile/restaurant-identity-utils.js",
    "core/profile/restaurant-type-utils.js",
    "core/profile/role-switch-utils.js",
    "core/profile/self-profile-runtime-controller.js",
    "core/profile/social-engagement-runtime-boundary.js",
    "core/profile/social-engagement-support-runtime-controller.js",
    "core/overlays/menu-detail-update-utils.js",
    "core/overlays/overlay-basic-bind-utils.js",
    "core/overlays/overlay-bind-orchestrator-utils.js",
    "core/overlays/overlay-chat-post-bind-utils.js",
    "core/overlays/overlay-comment-render-utils.js",
    "core/overlays/overlay-menu-detail-bind-utils.js",
    "core/overlays/overlay-menu-focus-bind-utils.js",
    "core/overlays/overlay-orchestration-controller.js",
    "core/overlays/overlay-render-orchestrator-utils.js",
    "core/overlays/overlay-root-ui-utils.js",
    "core/overlays/post-modal-update-utils.js",
    "core/shop/shop-cart-access-utils.js",
    "core/shop/shop-cart-state-utils.js",
    "core/shop/shop-variant-utils.js",
    "core/shop/shop-view-cart-orchestration-controller.js"
  ],
  "domain-menu-eager": [
    "core/menu/ads-runtime-controller.js",
    "core/menu/catalog-mode-utils.js",
    "core/menu/customer-focus-modal-render-utils.js",
    "core/menu/focus-runtime-controller.js",
    "core/menu/menu-card-style-utils.js",
    "core/menu/menu-delete-utils.js",
    "core/menu/menu-doc-normalize-utils.js",
    "core/menu/menu-input-utils.js",
    "core/menu/menu-item-coercion-utils.js",
    "core/menu/menu-layout-utils.js",
    "core/menu/menu-public-runtime-controller.js",
    "core/menu/menu-save-utils.js",
    "core/menu/table-qr-runtime-controller.js"
  ],
  "domain-crm-eager": [
    "core/crm/ceo-crm-count-runtime-controller.js",
    "core/crm/ceo-meta-utils.js",
    "core/crm/ceo-normalize-utils.js",
    "core/crm/ceo-staff-sync-utils.js",
    "core/crm/crm-ceo-scope-support-runtime.js",
    "core/crm/crm-domain-runtime-boundary.js",
    "core/crm/crm-lead-geo-support-runtime.js",
    "core/crm/crm-scope-state-utils.js",
    "core/crm/crm-shared-render-utils.js",
    "core/crm/staff-save-utils.js"
  ],
  "domain-media-eager": [
    "core/media/avatar-logo-cache.js",
    "core/media/crop-utils.js",
    "core/media/media-upload-view-render-utils.js",
    "core/media/video-poster-utils.js"
  ],
  "domain-chat-eager": [
    "core/chat/chat-app-runtime-boundary.js",
    "core/chat/chat-route-open-utils.js",
    "core/chat/chat-thread-action-state-utils.js"
  ],
  "domain-orders-eager": [
    "core/orders/orders-render-utils.js"
  ],
  "domain-marketplace-eager": [
    "core/marketplace/marketplace-runtime-boundary.js"
  ]
};

const SOCIAL_EAGER_FILE_CHUNK_BY_SUFFIX = new Map(
  Object.entries(SOCIAL_EAGER_FILE_CHUNKS).flatMap(([chunkName, files]) =>
    files.map((file) => [`/apps/menyra-social/${file}`, chunkName])
  )
);

const SOCIAL_DOMAIN_CHUNKS = [
  "stories",
  "leads",
  "notifications",
  "push",
  "map",
  "follow",
  "business-accounts",
  "public-profile",
  "auth",
  "app-events",
  // analytics hat keine Lazy-Cluster -> ganzer Ordner als eigener Chunk.
  "analytics",
  // dashboard baut auf analytics auf und bleibt wie dieses ein eigener Chunk.
  "dashboard",
];

function socialManualChunks(id) {
  const clean = normalizeForRollup(id);

  // core/feed teilt sich mit den eager Profil-/Overlay-/Shop-Modulen einen
  // Import-Zyklus. Alle Beteiligten kommen in EINEN Chunk, damit der Zyklus
  // chunk-intern bleibt (Rollup-Warnung "Circular chunk" vermeiden).
  if (clean.includes("/apps/menyra-social/core/feed/")) {
    return "domain-feed-social-eager";
  }

  if (clean.includes("/shared/vendor/firebase/11.0.0/")) {
    // Functions wird nur von Lazy-Flows (Bestellung, Notification-Write)
    // dynamisch importiert - eigener Chunk, damit es nicht den eager
    // vendor-firebase-Chunk vergroessert.
    if (clean.endsWith("/firebase-functions.js")) {
      return "vendor-firebase-functions";
    }
    return "vendor-firebase";
  }

  for (const [suffix, chunkName] of SOCIAL_EAGER_FILE_CHUNK_BY_SUFFIX) {
    if (clean.endsWith(suffix)) {
      return chunkName;
    }
  }

  for (const domain of SOCIAL_DOMAIN_CHUNKS) {
    if (clean.includes(`/apps/menyra-social/core/${domain}/`)) {
      return `domain-${domain}`;
    }
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
