"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "../..");
const outputDir = path.resolve(__dirname, "../heart/generated");
const githubExecutionStateSourcePath = path.join(repoRoot, "shared", "github-execution-state.js");
const githubExecutionStateOutputPath = path.join(outputDir, "github-execution-state.cjs");
const heartPackCatalogSourcePath = path.join(repoRoot, "shared", "heart-pack-catalog.js");
const heartPackCatalogOutputPath = path.join(outputDir, "heart-pack-catalog.cjs");

function normalizeSourceText(sourceText) {
  return String(sourceText || "").replace(/\r\n/g, "\n");
}

function buildCommonJsModule(sourceText) {
  const normalized = normalizeSourceText(sourceText)
    .replace(/^export\s+/gm, "");

  return [
    "\"use strict\";",
    "",
    "// Generated from ../../shared/github-execution-state.js. Do not edit manually.",
    normalized.trim(),
    "",
    "module.exports = {",
    "  normalizeGithubExecutionState",
    "};",
    ""
  ].join("\n");
}

function buildHeartPackCatalogModule(sourceText) {
  const normalized = normalizeSourceText(sourceText)
    .replace(/^export\s+function\s+/gm, "function ")
    .replace(/^export\s+const\s+/gm, "const ")
    .replace(/\nexport\s*\{[\s\S]*?\};?\s*$/m, "\n");

  return [
    "\"use strict\";",
    "",
    "// Generated from ../../shared/heart-pack-catalog.js. Do not edit manually.",
    normalized.trim(),
    "",
    "module.exports = {",
    "  HEART_PACKS,",
    "  HEART_PACK_ALIASES,",
    "  getHeartPackCatalog,",
    "  resolveHeartPackKey,",
    "  getHeartPack,",
    "  listHeartPackQuickActions",
    "};",
    ""
  ].join("\n");
}

fs.mkdirSync(outputDir, { recursive: true });

const githubExecutionStateSourceText = fs.readFileSync(githubExecutionStateSourcePath, "utf8");
fs.writeFileSync(githubExecutionStateOutputPath, buildCommonJsModule(githubExecutionStateSourceText), "utf8");
console.log(`Synced Heart shared GitHub execution state to ${githubExecutionStateOutputPath}`);

const heartPackCatalogSourceText = fs.readFileSync(heartPackCatalogSourcePath, "utf8");
fs.writeFileSync(heartPackCatalogOutputPath, buildHeartPackCatalogModule(heartPackCatalogSourceText), "utf8");
console.log(`Synced Heart pack catalog to ${heartPackCatalogOutputPath}`);
