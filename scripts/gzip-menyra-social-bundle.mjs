import { gzipSync } from "node:zlib";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bundleRoot = resolve(repoRoot, "apps/menyra-social/bundled");
const gzipExtensions = new Set([
  ".html",
  ".js",
  ".mjs",
  ".css",
  ".json",
  ".webmanifest",
  ".svg",
  ".txt"
]);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(path));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files;
}

async function gzipBundle() {
  const rootStat = await stat(bundleRoot).catch(() => null);
  if (!rootStat?.isDirectory()) {
    throw new Error(`Bundle output not found: ${relative(repoRoot, bundleRoot)}`);
  }

  const files = await collectFiles(bundleRoot);
  let written = 0;
  let rawBytes = 0;
  let gzipBytes = 0;

  for (const file of files) {
    if (file.endsWith(".gz")) continue;
    if (!gzipExtensions.has(extname(file).toLowerCase())) continue;
    const buffer = await readFile(file);
    const compressed = gzipSync(buffer, { level: 9 });
    await writeFile(`${file}.gz`, compressed);
    written += 1;
    rawBytes += buffer.length;
    gzipBytes += compressed.length;
  }

  console.log(`Prepared ${written} gzip bundle assets in ${relative(repoRoot, bundleRoot)}`);
  console.log(`Bundle gzip total: ${rawBytes} raw bytes -> ${gzipBytes} gzip bytes`);
}

await gzipBundle();
