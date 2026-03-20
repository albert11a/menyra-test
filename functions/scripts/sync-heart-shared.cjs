"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "../..");
const sourcePath = path.join(repoRoot, "shared", "github-execution-state.js");
const outputDir = path.resolve(__dirname, "../heart/generated");
const outputPath = path.join(outputDir, "github-execution-state.cjs");

function buildCommonJsModule(sourceText) {
  const normalized = String(sourceText || "")
    .replace(/\r\n/g, "\n")
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

const sourceText = fs.readFileSync(sourcePath, "utf8");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, buildCommonJsModule(sourceText), "utf8");
console.log(`Synced Heart shared GitHub execution state to ${outputPath}`);
