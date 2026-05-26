import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const SOCIAL_ENTRY_SOURCE = "apps/menyra-social/social-app.js";
const SOCIAL_ENTRY_BUNDLE = "apps/menyra-social/bundled/entry/social-app.js";
const PUBLIC_ENTRY_BUNDLE = "apps/menyra-social/bundled/entry/social-public-entry.js";
const MANIFEST = "apps/menyra-social/bundled/manifest.json";

const TARGET_MODULES = [
  {
    path: "apps/menyra-social/core/crm/crm-domain-runtime-cluster.js",
    role: "CRM/Heart domain runtime cluster",
    splitRisk: "already-split",
    nextAction: "must stay dynamic"
  },
  {
    path: "apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js",
    role: "public profile/menu orchestration cluster",
    splitRisk: "high",
    nextAction: "keep static until manual Public Profile/Menu/QR/Cart testing is green"
  },
  {
    path: "apps/menyra-social/core/profile/public-profile-runtime-controller.js",
    role: "public profile runtime data/show-state controller",
    splitRisk: "high",
    nextAction: "map dependencies before moving behind a route runtime boundary"
  },
  {
    path: "apps/menyra-social/core/profile/public-profile-direct-entry-controller.js",
    role: "direct public route bootstrap/profile entry controller",
    splitRisk: "high",
    nextAction: "do not split away from QR/table handoff without a dedicated contract"
  },
  {
    path: "apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js",
    role: "public bootstrap/menu/focus seed controller",
    splitRisk: "high",
    nextAction: "keep coupled to public route truth until cold-start behavior is manually checked"
  },
  {
    path: "apps/menyra-social/core/app-shell/public-route-runtime-cluster.js",
    role: "public route runtime cluster",
    splitRisk: "medium",
    nextAction: "possible later boundary owner, but not a first split target"
  },
  {
    path: "apps/menyra-social/core/profile/social-engagement-runtime-controller.js",
    role: "profile social engagement and post detail runtime",
    splitRisk: "already-split",
    nextAction: "must stay dynamic"
  },
  {
    path: "apps/menyra-social/core/profile/self-profile-runtime-controller.js",
    role: "own profile runtime",
    splitRisk: "medium",
    nextAction: "separate from public split planning"
  },
  {
    path: "apps/menyra-social/core/profile/public-profile-surface-controller.js",
    role: "public surface state resolver",
    splitRisk: "low",
    nextAction: "keep shared; too small to split alone"
  },
  {
    path: "apps/menyra-social/core/profile/public-menu-surface-state-utils.js",
    role: "public menu/focus surface helpers",
    splitRisk: "low",
    nextAction: "keep shared; too small to split alone"
  },
  {
    path: "apps/menyra-social/core/profile/profile-menu-focus-render-controller.js",
    role: "profile/menu/focus renderer",
    splitRisk: "already-split",
    nextAction: "must stay dynamic"
  },
  {
    path: "apps/menyra-social/core/profile/profile-open-flow-utils.js",
    role: "profile open flow",
    splitRisk: "already-split",
    nextAction: "must stay dynamic"
  },
  {
    path: "apps/menyra-social/core/menu/menu-modal-render-utils.js",
    role: "menu modal renderer",
    splitRisk: "already-split",
    nextAction: "must stay dynamic"
  },
  {
    path: "apps/menyra-social/core/orders/orders-runtime-controller.js",
    role: "orders runtime",
    splitRisk: "already-split",
    nextAction: "must stay dynamic"
  }
];

function toPosix(value = "") {
  return String(value || "").replace(/\\/g, "/");
}

function resolveWorkspacePath(filePath = "") {
  return path.resolve(process.cwd(), filePath);
}

function readText(filePath) {
  return readFileSync(resolveWorkspacePath(filePath), "utf8");
}

function readBytes(filePath) {
  return readFileSync(resolveWorkspacePath(filePath));
}

function getSize(filePath) {
  const absolutePath = resolveWorkspacePath(filePath);
  if (!existsSync(absolutePath)) {
    return { exists: false, rawBytes: 0, gzipBytes: 0 };
  }
  const buffer = readFileSync(absolutePath);
  return {
    exists: true,
    rawBytes: buffer.length,
    gzipBytes: gzipSync(buffer).length
  };
}

function resolveRelativeImport(fromFile, specifier) {
  if (!specifier.startsWith(".")) return "";
  const fromDir = path.dirname(resolveWorkspacePath(fromFile));
  const base = path.resolve(fromDir, specifier);
  const candidates = [
    base,
    `${base}.js`,
    `${base}.mjs`,
    path.join(base, "index.js")
  ];
  const match = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
  if (!match) return "";
  return toPosix(path.relative(process.cwd(), match));
}

function parseStaticImports(source) {
  const imports = [];
  const patterns = [
    /\bimport\s+[^"'()]*?\s+from\s+["']([^"']+)["']/g,
    /\bimport\s+["']([^"']+)["']/g,
    /\bexport\s+[^"']*?\s+from\s+["']([^"']+)["']/g
  ];
  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(source))) {
      imports.push(match[1]);
    }
  });
  return imports;
}

function parseDynamicImports(source) {
  const imports = [];
  const pattern = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
  let match;
  while ((match = pattern.exec(source))) {
    imports.push(match[1]);
  }
  return imports;
}

function buildStaticImportGraph(entryFile) {
  const visited = new Set();
  const stack = [entryFile];
  while (stack.length) {
    const current = stack.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    const absolutePath = resolveWorkspacePath(current);
    if (!existsSync(absolutePath)) continue;
    const source = readFileSync(absolutePath, "utf8");
    parseStaticImports(source)
      .map((specifier) => resolveRelativeImport(current, specifier))
      .filter(Boolean)
      .forEach((resolved) => {
        if (!visited.has(resolved)) stack.push(resolved);
      });
  }
  return visited;
}

function findManifestEntry(manifest, sourcePath) {
  const normalizedSourcePath = toPosix(sourcePath);
  const direct = manifest[normalizedSourcePath];
  if (direct) return direct;
  return Object.entries(manifest).find(([key]) => key.split("?")[0] === normalizedSourcePath)?.[1] || null;
}

function getBundleSizeForManifestEntry(entry) {
  if (!entry?.file) return { exists: false, rawBytes: 0, gzipBytes: 0 };
  return getSize(`apps/menyra-social/bundled/${entry.file}`);
}

const manifest = JSON.parse(readText(MANIFEST));
const socialManifest = manifest[SOCIAL_ENTRY_SOURCE] || {};
const socialDynamicImports = new Set(Array.isArray(socialManifest.dynamicImports)
  ? socialManifest.dynamicImports.map((entry) => entry.split("?")[0])
  : []);
const staticGraph = buildStaticImportGraph(SOCIAL_ENTRY_SOURCE);

const targetModules = TARGET_MODULES.map((target) => {
  const manifestEntry = findManifestEntry(manifest, target.path);
  const dynamicFromSocial = socialDynamicImports.has(target.path);
  const staticReachableFromSocial = staticGraph.has(target.path);
  return {
    ...target,
    sourceSize: getSize(target.path),
    bundleSize: getBundleSizeForManifestEntry(manifestEntry),
    manifestFile: manifestEntry?.file || "",
    dynamicFromSocial,
    staticReachableFromSocial,
    currentPlacement: dynamicFromSocial
      ? "dynamic"
      : (staticReachableFromSocial ? "social-entry-static-graph" : "not-in-social-static-graph")
  };
});

const staticCandidateBytes = targetModules
  .filter((target) => target.currentPlacement === "social-entry-static-graph")
  .reduce((sum, target) => sum + target.sourceSize.rawBytes, 0);

const result = {
  status: "ok",
  branchExpected: "refactorapp",
  entry: {
    source: SOCIAL_ENTRY_SOURCE,
    bundle: {
      socialApp: getSize(SOCIAL_ENTRY_BUNDLE),
      socialPublicEntry: getSize(PUBLIC_ENTRY_BUNDLE)
    }
  },
  staticGraph: {
    moduleCount: staticGraph.size,
    trackedStaticCandidateRawBytes: staticCandidateBytes
  },
  targetModules,
  nextSafeTechnicalMove: {
    recommendedStep: "manual verification first, then split planning around public-profile-runtime-controller dependencies",
    blockedUntilManualCheck: true,
    reason: "Public Profile, Public Menu, Cart, Order and QR/table context still share runtime state and must not be split blind."
  }
};

console.log(JSON.stringify(result, null, 2));
