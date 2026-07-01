import { gzipSync } from "node:zlib";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const bundleDir = resolve(repoRoot, "apps/menyra-social/bundled");
const reportPath = resolve(
  repoRoot,
  "docs/codex/generated/BUNDLE_ANALYSIS_REPORT.md",
);

async function walk(root) {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const pathname = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(pathname)));
      continue;
    }
    if ([".js", ".css", ".html", ".json"].includes(extname(entry.name))) {
      files.push(pathname);
    }
  }
  return files;
}

function kb(value) {
  return `${(value / 1024).toFixed(1)} kB`;
}

const files = await walk(bundleDir);
const rows = [];
for (const file of files) {
  const data = await readFile(file);
  const info = await stat(file);
  rows.push({
    file: relative(repoRoot, file).replace(/\\/g, "/"),
    bytes: info.size,
    gzipBytes: gzipSync(data).length,
  });
}

rows.sort((a, b) => b.gzipBytes - a.gzipBytes);
const largest = rows.slice(0, 20);

const hasVisualizer = rows.some(
  (row) => row.file === "docs/codex/generated/bundle-stats.html",
);
const generatedAt = new Date().toISOString();

const lines = [
  "# Bundle Analysis Report",
  "",
  `Generated: ${generatedAt}`,
  "",
  "Scope: current Vite output in `apps/menyra-social/bundled`.",
  "",
  "## Largest bundle files",
  "",
  "| File | Raw | Gzip |",
  "| --- | ---: | ---: |",
  ...largest.map(
    (row) => `| \`${row.file}\` | ${kb(row.bytes)} | ${kb(row.gzipBytes)} |`,
  ),
  "",
  "## Current loading risk",
  "",
  "- `social-app.js` is still the authenticated mega-entry and remains coupled to profile, feed, shopping, travel, order, chat, notification and owner surfaces.",
  "- Public profile and public menu still depend on chunks that are produced from the same source tree as authenticated social runtime.",
  "- QR/menu should not receive owner/editor, CRM/Heart, feed-search-map, upload/media or notification runtime in a future entry split.",
  "- Public profile should avoid loading chat, push, owner/editor, checkout/order mutation and full marketplace runtimes unless the user enters those flows.",
  "",
  "## Lazy import candidates for later refactor",
  "",
  "- `apps/menyra-social/core/media/*` for upload-only flows.",
  "- `apps/menyra-social/core/orders/*` for cart/order-only flows.",
  "- `apps/menyra-social/core/chat/*` for authenticated chat-only flows.",
  "- `apps/menyra-social/core/crm/*` for Heart/owner/admin-only flows.",
  "- Marketplace event bindings for Feed/Travel/Shopping as separate route runtimes.",
  "",
  "## Target entry structure",
  "",
  "- `public-home-entry`",
  "- `public-profile-entry`",
  "- `public-menu-entry`",
  "- `restaurant-qr-entry`",
  "- `authenticated-social-entry`",
  "- `business-owner-entry`",
  "- `waiter-entry`",
  "- `heart-entry`",
  "",
  "## Notes",
  "",
  hasVisualizer
    ? "- Visualizer output was generated at `docs/codex/generated/bundle-stats.html`."
    : "- Run `npm run build:analyze` to generate `docs/codex/generated/bundle-stats.html`.",
  "- This report is a baseline only. No entry split is activated in this prep branch.",
  "",
];

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${lines.join("\n")}\n`);
console.log(`Wrote ${relative(repoRoot, reportPath)}`);
