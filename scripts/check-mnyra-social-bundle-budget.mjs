import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const SOCIAL_ENTRY = "apps/menyra-social/bundled/entry/social-app.js";
const PUBLIC_ENTRY = "apps/menyra-social/bundled/entry/social-public-entry.js";
const MANIFEST = "apps/menyra-social/bundled/manifest.json";
const SOCIAL_SOURCE = "apps/menyra-social/social-app.js";
const ROUTE_RUNTIME_REGISTRY_SOURCE = "apps/menyra-social/core/app-shell/route-runtime-registry.js";
const PROFILE_MENU_FOCUS_BOUNDARY_SOURCE = "apps/menyra-social/core/profile/profile-menu-focus-render-boundary.js";

const SOCIAL_ENTRY_RAW_BUDGET = 1_052_000;
const SOCIAL_ENTRY_GZIP_BUDGET = 285_000;

function readText(path) {
  return readFileSync(path, "utf8");
}

function readBytes(path) {
  return readFileSync(path);
}

function fail(message) {
  console.error(`[mnyra][bundle-budget] ${message}`);
  process.exitCode = 1;
}

function normalizeSource(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function expectSourceIncludes(source, needle, message) {
  if (!source.includes(needle)) {
    fail(message);
  }
}

function getSize(path) {
  const buffer = readBytes(path);
  return {
    rawBytes: buffer.length,
    gzipBytes: gzipSync(buffer).length
  };
}

const socialSize = getSize(SOCIAL_ENTRY);
const publicSize = getSize(PUBLIC_ENTRY);
const manifest = JSON.parse(readText(MANIFEST));
const publicEntry = readText(PUBLIC_ENTRY);
const socialSource = normalizeSource(readText(SOCIAL_SOURCE));
const routeRuntimeRegistrySource = normalizeSource(readText(ROUTE_RUNTIME_REGISTRY_SOURCE));
const profileMenuFocusBoundarySource = normalizeSource(readText(PROFILE_MENU_FOCUS_BOUNDARY_SOURCE));

if (socialSize.rawBytes > SOCIAL_ENTRY_RAW_BUDGET) {
  fail(`${SOCIAL_ENTRY} raw ${socialSize.rawBytes} exceeds ${SOCIAL_ENTRY_RAW_BUDGET}`);
}

if (socialSize.gzipBytes > SOCIAL_ENTRY_GZIP_BUDGET) {
  fail(`${SOCIAL_ENTRY} gzip ${socialSize.gzipBytes} exceeds ${SOCIAL_ENTRY_GZIP_BUDGET}`);
}

const socialManifest = manifest["apps/menyra-social/social-app.js"];
const publicManifest = manifest["apps/menyra-social/social-public-bundled-entry.js"];

if (!socialManifest || socialManifest.file !== "entry/social-app.js") {
  fail("social-app manifest entry missing or changed");
}

if (!publicManifest || publicManifest.file !== "entry/social-public-entry.js") {
  fail("social-public-bundled-entry manifest entry missing or changed");
}

const socialStaticImports = new Set(Array.isArray(socialManifest?.imports) ? socialManifest.imports : []);
const socialDynamicImports = new Set(Array.isArray(socialManifest?.dynamicImports) ? socialManifest.dynamicImports : []);

[
  "apps/menyra-social/core/profile/profile-open-flow-utils.js",
  "apps/menyra-social/core/chat/chat-app-runtime-lazy-facade.js",
  "apps/menyra-social/core/discovery/discovery-runtime-controller.js",
  "apps/menyra-social/core/orders/orders-runtime-controller.js",
  "apps/menyra-social/core/crm/crm-domain-runtime-cluster.js",
  "apps/menyra-social/core/profile/social-engagement-runtime-controller.js",
  "apps/menyra-social/core/profile/profile-menu-focus-render-controller.js",
  "apps/menyra-social/core/menu/menu-modal-render-utils.js"
].forEach((entry) => {
  if (socialStaticImports.has(entry)) {
    fail(`${entry} is static again in social-app`);
  }
  if (!socialDynamicImports.has(entry)) {
    fail(`${entry} is no longer registered as a social-app dynamic import`);
  }
});

const publicDynamicImports = new Set(Array.isArray(publicManifest?.dynamicImports) ? publicManifest.dynamicImports : []);
if (!publicDynamicImports.has("apps/menyra-social/social-app.js")) {
  fail("public entry no longer declares social-app as a dynamic import");
}

if (/;\s*await\s+[A-Za-z0-9_$]+\(\);?$/.test(publicEntry.trim())) {
  fail("public entry appears to await the social-app import at top level");
}

expectSourceIncludes(
  profileMenuFocusBoundarySource,
  "import(\"./profile-menu-focus-render-controller.js\")",
  "profile menu focus renderer boundary no longer uses a dynamic import"
);

expectSourceIncludes(
  socialSource,
  "import { shouldPreloadProfileMenuFocusRenderer } from \"./core/profile/profile-menu-focus-render-preload-utils.js\";",
  "social-app no longer imports the Profile/Menu/Focus preload decision utility"
);

expectSourceIncludes(
  socialSource,
  "if (shouldPreloadProfileMenuFocusRenderer({ state, pendingRoute: pendingRouteState.getPendingState?.() || {} })) { preloadProfileMenuFocusRender(); }",
  "social-app no longer performs the guarded Profile/Menu/Focus early preload"
);

expectSourceIncludes(
  socialSource,
  "publicBusiness: { render: renderPublicProfileView, preload: preloadProfileMenuFocusRender }, publicMenu: { render: renderPublicProfileView, preload: preloadProfileMenuFocusRender }",
  "publicBusiness/publicMenu runtime slots no longer share the existing public profile renderer preload"
);

expectSourceIncludes(
  routeRuntimeRegistrySource,
  "return isPublicMenuRuntime(state) ? \"publicMenu\" : \"publicBusiness\";",
  "route runtime registry no longer separates publicBusiness and publicMenu slots"
);

expectSourceIncludes(
  routeRuntimeRegistrySource,
  "menuAccessSource === \"qr\"",
  "route runtime registry no longer keeps QR menu access in the publicMenu slot"
);

console.log(JSON.stringify({
  ok: process.exitCode !== 1,
  socialEntry: socialSize,
  publicEntry: publicSize,
  budgets: {
    socialEntryRawBytes: SOCIAL_ENTRY_RAW_BUDGET,
    socialEntryGzipBytes: SOCIAL_ENTRY_GZIP_BUDGET
  }
}, null, 2));
