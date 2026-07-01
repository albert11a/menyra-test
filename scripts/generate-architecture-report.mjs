import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const generatedDir = resolve(repoRoot, "docs/codex/generated");
const reportPath = resolve(generatedDir, "ARCHITECTURE_DEPENDENCY_REPORT.md");
const roots = [
  "apps/menyra-social",
  "apps/mnyra-heart",
  "apps/waiter",
  "functions",
  "shared",
];
const sourceExtensions = new Set([".js", ".mjs", ".cjs"]);
const ignoredParts = ["node_modules", "bundled", "dist", "tmp", "seed/export"];

function normalize(pathname) {
  return relative(repoRoot, pathname).replace(/\\/g, "/");
}

function shouldIgnore(pathname) {
  const clean = normalize(pathname);
  return ignoredParts.some((part) => clean.includes(part));
}

async function walk(root) {
  const absolute = resolve(repoRoot, root);
  let entries;
  try {
    entries = await readdir(absolute, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const pathname = join(absolute, entry.name);
    if (shouldIgnore(pathname)) continue;
    if (entry.isDirectory()) {
      files.push(...(await walk(normalize(pathname))));
      continue;
    }
    if (sourceExtensions.has(extname(entry.name))) {
      files.push(pathname);
    }
  }
  return files;
}

function extractImports(source) {
  const imports = new Set();
  const patterns = [
    /import\s+(?:[^'"]*?\s+from\s+)?["']([^"']+)["']/g,
    /export\s+[^'"]*?\s+from\s+["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source))) {
      imports.add(match[1]);
    }
  }
  return [...imports];
}

async function resolveRelativeImport(fromFile, specifier) {
  if (!specifier.startsWith(".")) return null;
  const base = resolve(dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.js`,
    `${base}.mjs`,
    `${base}.cjs`,
    join(base, "index.js"),
    join(base, "index.mjs"),
    join(base, "index.cjs"),
  ];

  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch (_error) {
      // Try the next resolution candidate.
    }
  }
  return null;
}

function findCycles(graph, limit = 50) {
  const cycles = [];
  const visiting = new Set();
  const visited = new Set();
  const stack = [];

  function visit(node) {
    if (cycles.length >= limit) return;
    if (visiting.has(node)) {
      const start = stack.indexOf(node);
      if (start >= 0) cycles.push([...stack.slice(start), node]);
      return;
    }
    if (visited.has(node)) return;

    visiting.add(node);
    stack.push(node);
    for (const next of graph.get(node) || []) {
      visit(next);
    }
    stack.pop();
    visiting.delete(node);
    visited.add(node);
  }

  for (const node of graph.keys()) {
    visit(node);
    if (cycles.length >= limit) break;
  }
  return cycles;
}

function reachableFrom(graph, start) {
  const seen = new Set();
  const stack = [start];
  while (stack.length) {
    const node = stack.pop();
    for (const next of graph.get(node) || []) {
      if (seen.has(next)) continue;
      seen.add(next);
      stack.push(next);
    }
  }
  return [...seen].sort();
}

function bulletList(
  items,
  emptyText = "- None found in static relative-import scan.",
) {
  if (!items.length) return [emptyText];
  return items.map((item) => `- \`${item}\``);
}

const files = [];
for (const root of roots) {
  files.push(...(await walk(root)));
}

const graph = new Map();
const externalImports = new Map();
for (const file of files) {
  const source = await readFile(file, "utf8");
  const imports = extractImports(source);
  const localDeps = [];
  const externalDeps = [];
  for (const specifier of imports) {
    const resolved = await resolveRelativeImport(file, specifier);
    if (resolved && !shouldIgnore(resolved)) {
      localDeps.push(normalize(resolved));
    } else {
      externalDeps.push(specifier);
    }
  }
  graph.set(normalize(file), [...new Set(localDeps)].sort());
  externalImports.set(normalize(file), [...new Set(externalDeps)].sort());
}

const socialEntry = "apps/menyra-social/social-app.js";
const directImports = graph.get(socialEntry) || [];
const socialReachable = reachableFrom(graph, socialEntry);
const cycles = findCycles(graph, 50);

const criticalPatterns = [
  /core\/profile\//,
  /core\/menu\//,
  /core\/orders\//,
  /core\/feed\//,
  /core\/marketplace\//,
  /core\/crm\//,
  /core\/chat\//,
  /core\/media\//,
  /core\/notifications\//,
  /core\/push\//,
];

const criticalReachable = socialReachable.filter((file) =>
  criticalPatterns.some((pattern) => pattern.test(file)),
);
const qrMenuDeps = socialReachable.filter((file) =>
  /core\/(menu|orders|shop|profile|app-shell)\//.test(file),
);
const publicProfileDeps = socialReachable.filter((file) =>
  /core\/(profile|router|app-shell|menu)\//.test(file),
);
const waiterDeps = [...graph.keys()].filter((file) =>
  file.startsWith("apps/waiter"),
);
const heartDeps = [...graph.keys()].filter(
  (file) => file.startsWith("apps/mnyra-heart") || file.includes("/core/crm/"),
);

const lines = [
  "# Architecture Dependency Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "Scope: static relative-import scan plus Dependency Cruiser/Madge tooling baseline.",
  "",
  "## Direct imports from social-app.js",
  "",
  ...bulletList(directImports),
  "",
  "## Critical indirect dependencies reachable from social-app.js",
  "",
  ...bulletList(criticalReachable.slice(0, 80)),
  criticalReachable.length > 80
    ? `- ... ${criticalReachable.length - 80} more`
    : "",
  "",
  "## Circular dependencies",
  "",
  ...(cycles.length
    ? cycles
        .slice(0, 20)
        .map((cycle) => `- ${cycle.map((file) => `\`${file}\``).join(" -> ")}`)
    : [
        "- No cycles found by the built-in static scan. Run `npm run arch:cycles` for Madge output.",
      ]),
  "",
  "## QR/Menu unnecessary dependency candidates",
  "",
  ...bulletList(
    qrMenuDeps
      .filter((file) =>
        /crm|chat|media|notifications|push|feed|marketplace/.test(file),
      )
      .slice(0, 50),
    "- Static scan did not prove a specific QR/Menu unwanted import; verify with Madge and bundle report.",
  ),
  "",
  "## Public Profile unnecessary dependency candidates",
  "",
  ...bulletList(
    publicProfileDeps
      .filter((file) => /crm|chat|media|notifications|push|orders/.test(file))
      .slice(0, 50),
    "- Static scan did not prove a specific Public Profile unwanted import; verify with entry-level bundle analysis.",
  ),
  "",
  "## Waiter coupling",
  "",
  ...bulletList(waiterDeps),
  "",
  "## Owner/Heart coupling",
  "",
  ...bulletList(heartDeps.slice(0, 80)),
  heartDeps.length > 80 ? `- ... ${heartDeps.length - 80} more` : "",
  "",
  "## Safe extraction order",
  "",
  "1. Freeze route, public visibility and Firestore read/write contracts.",
  "2. Extract pure normalize/state helpers that have no DOM or Firebase ownership.",
  "3. Split public profile read-only runtime behind false feature flags.",
  "4. Split public menu/QR runtime after cart/order contract is test-covered.",
  "5. Split waiter runtime after staff auth and order visibility tests exist.",
  "6. Split owner/editor runtime after direct client-write inventory is reviewed.",
  "7. Split Heart/CRM after CRM facade boundaries are locked.",
  "8. Move feed, travel and shopping into route-owned lazy runtimes.",
  "",
  "## Follow-up commands",
  "",
  "- `npm run arch:check` writes `docs/codex/generated/dependency-cruiser-check.txt`.",
  "- `npm run arch:graph` writes `docs/codex/generated/madge-social-app-graph.json`.",
  "- `npm run arch:cycles` writes `docs/codex/generated/madge-cycles.txt`.",
  "",
].filter(Boolean);

await mkdir(generatedDir, { recursive: true });
await writeFile(reportPath, `${lines.join("\n")}\n`);
console.log(`Wrote ${relative(repoRoot, reportPath)}`);
