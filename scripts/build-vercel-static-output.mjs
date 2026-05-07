import { cp, mkdir, rm, stat } from "node:fs/promises";
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
