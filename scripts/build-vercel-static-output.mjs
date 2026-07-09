import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(repoRoot, "dist");

const deployablePaths = [
  "apps",
  "shared",
  "hub",
  "heart",
  "index.html",
  "sw.js"
];

const optionalRootFiles = [
  "favicon.ico",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "manifest.json",
  "manifest.webmanifest"
];

const ignoredExtensions = new Set([
  ".md",
  ".doc",
  ".docx"
]);

const ignoredFileNames = new Set([
  "tailwind.static.config.cjs",
  "tailwind.input.css"
]);

const ignoredDeployPathPrefixes = [
  "apps/testfirst"
];

const ignoredDeployPaths = new Set([
  "apps/menyra-social/menu-detail-food-drink-standalone.html",
  "apps/menyra-social/profile/external/current-profile.html"
]);

function assertSafeDistPath() {
  const normalizedRepoRoot = repoRoot.endsWith(sep) ? repoRoot : `${repoRoot}${sep}`;
  if (distRoot === repoRoot || !distRoot.startsWith(normalizedRepoRoot)) {
    throw new Error(`Refusing to clean unsafe output directory: ${distRoot}`);
  }
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function shouldCopySource(src) {
  const relativePath = relative(repoRoot, src).replace(/\\/g, "/");
  if (!relativePath || relativePath.startsWith("../")) return false;
  if (ignoredDeployPaths.has(relativePath)) return false;
  if (ignoredDeployPathPrefixes.some((prefix) => relativePath === prefix || relativePath.startsWith(`${prefix}/`))) return false;
  const fileName = relativePath.split("/").pop() || "";
  if (ignoredFileNames.has(fileName)) return false;
  if (ignoredExtensions.has(extname(fileName).toLowerCase())) return false;
  return true;
}

async function copyIfPresent(pathFromRoot) {
  const source = resolve(repoRoot, pathFromRoot);
  if (!(await exists(source))) return false;
  const destination = resolve(distRoot, pathFromRoot);
  await cp(source, destination, {
    recursive: true,
    filter: shouldCopySource
  });
  return true;
}

assertSafeDistPath();
await rm(distRoot, { recursive: true, force: true });
await mkdir(distRoot, { recursive: true });

const copied = [];
for (const pathFromRoot of [...deployablePaths, ...optionalRootFiles]) {
  if (await copyIfPresent(pathFromRoot)) copied.push(pathFromRoot);
}

// Vite-Bundle-Manifest direkt in die ausgelieferte Social-Shell inlinen:
// entfernt den blockierenden manifest.json-Roundtrip vom Cold-Start-Kritikpfad
// (index.html ist no-store, wird also bei jedem Load frisch geholt und traegt
// das Manifest damit immer aktuell mit). Ohne Injektion bleibt der
// Laufzeit-Fetch-Fallback aktiv.
const INLINE_MANIFEST_PLACEHOLDER = "null;/*__MNYRA_INLINE_BUNDLE_MANIFEST__*/";

async function inlineSocialBundleManifest() {
  const manifestPath = resolve(distRoot, "apps/menyra-social/bundled/manifest.json");
  const indexPath = resolve(distRoot, "apps/menyra-social/index.html");
  if (!(await exists(manifestPath)) || !(await exists(indexPath))) {
    console.warn("Inline bundle manifest skipped: manifest.json or index.html missing in dist");
    return false;
  }
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (err) {
    console.warn(`Inline bundle manifest skipped: manifest.json unreadable (${err?.message || err})`);
    return false;
  }
  if (!manifest || typeof manifest !== "object") {
    console.warn("Inline bundle manifest skipped: manifest.json has no object payload");
    return false;
  }
  const html = await readFile(indexPath, "utf8");
  if (!html.includes(INLINE_MANIFEST_PLACEHOLDER)) {
    console.warn("Inline bundle manifest skipped: placeholder not found in index.html");
    return false;
  }
  const safeJson = JSON.stringify(manifest)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  await writeFile(indexPath, html.replace(INLINE_MANIFEST_PLACEHOLDER, () => `${safeJson};`), "utf8");
  return true;
}

const inlinedManifest = await inlineSocialBundleManifest();

console.log(`Prepared Vercel static output in ${relative(repoRoot, distRoot) || "dist"}`);
console.log(`Copied: ${copied.join(", ")}`);
console.log(`Inline bundle manifest: ${inlinedManifest ? "injected" : "skipped"}`);
