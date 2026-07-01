import { readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const args = process.argv.slice(2);
const roots = [];
const excludes = [];

for (let index = 0; index < args.length; index += 1) {
  const value = args[index];
  if (value === "--exclude") {
    const next = args[index + 1];
    if (next) {
      excludes.push(resolve(repoRoot, next));
      index += 1;
    }
    continue;
  }
  roots.push(resolve(repoRoot, value));
}

function isExcluded(pathname) {
  return excludes.some(
    (excluded) =>
      pathname === excluded ||
      pathname.startsWith(`${excluded}\\`) ||
      pathname.startsWith(`${excluded}/`),
  );
}

async function collectTests(root) {
  if (isExcluded(root)) return [];
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const pathname = resolve(root, entry.name);
    if (isExcluded(pathname)) continue;
    if (entry.isDirectory()) {
      files.push(...(await collectTests(pathname)));
      continue;
    }
    if (/\.(test|spec)\.(mjs|cjs|js)$/.test(entry.name)) {
      files.push(pathname);
    }
  }
  return files;
}

const files = [];
for (const root of roots.length ? roots : [resolve(repoRoot, "tests")]) {
  files.push(...(await collectTests(root)));
}

const uniqueFiles = [...new Set(files)].sort();
if (!uniqueFiles.length) {
  console.log("No Node test files found for the selected scope.");
  process.exit(0);
}

console.log(`Running ${uniqueFiles.length} Node test file(s):`);
for (const file of uniqueFiles) {
  console.log(`- ${relative(repoRoot, file)}`);
}

const child = spawn(process.execPath, ["--test", ...uniqueFiles], {
  cwd: repoRoot,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Node test runner stopped by signal ${signal}.`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
