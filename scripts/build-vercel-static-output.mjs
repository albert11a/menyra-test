import { cp, mkdir, rm, stat, readFile, writeFile } from "node:fs/promises";
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

console.log(`Prepared Vercel static output in ${relative(repoRoot, distRoot) || "dist"}`);
console.log(`Copied: ${copied.join(", ")}`);

// Ship startup metadata with the HTML from the same build. The browser can
// preload the entry graph without waiting for a separate manifest request.
const manifest = JSON.parse(await readFile(resolve(distRoot, "apps/menyra-social/bundled/manifest.json"), "utf8"));
const htmlPath = resolve(distRoot, "apps/menyra-social/index.html");
const html = await readFile(htmlPath, "utf8");
const marker = "<!-- mnyra-build-manifest -->";
if (!html.includes(marker)) throw new Error("Missing social build manifest marker");
const startupManifest = {};
function includeStartupEntry(key) {
  if (startupManifest[key]) return;
  const entry = manifest[key];
  if (!entry?.file) throw new Error(`Missing startup bundle: ${key}`);
  startupManifest[key] = { file: entry.file, imports: entry.imports || [] };
  for (const dependency of entry.imports || []) includeStartupEntry(dependency);
}
includeStartupEntry("apps/menyra-social/social-public-bundled-entry.js");
includeStartupEntry("apps/menyra-social/social-app.js");
const safeManifest = JSON.stringify(startupManifest).replace(/</g, "\\u003c");
await writeFile(htmlPath, html.replace(marker,
  `<script>window.__MENYRA_SOCIAL_INLINE_BUNDLE_MANIFEST__=${safeManifest};</script>`));
