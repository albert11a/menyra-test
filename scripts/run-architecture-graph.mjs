import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const reportPath = resolve(
  repoRoot,
  "docs/codex/generated/madge-social-app-graph.json",
);
const bin = resolve(repoRoot, "node_modules/madge/bin/cli.js");
const args = [
  "--extensions",
  "js,mjs,cjs",
  "--exclude",
  "node_modules|bundled|dist|tmp|seed/export",
  "--json",
  "apps/menyra-social/social-app.js",
];

const output = [];
const child = spawn(process.execPath, [bin, ...args], { cwd: repoRoot });
child.stdout.on("data", (chunk) => output.push(chunk));
child.stderr.on("data", (chunk) => output.push(chunk));

const exitCode = await new Promise((resolveRun, rejectRun) => {
  child.on("error", rejectRun);
  child.on("exit", (code) => resolveRun(code ?? 1));
});

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, Buffer.concat(output).toString("utf8") || "{}\n");
console.log(`Wrote ${relative(repoRoot, reportPath)}`);
process.exit(exitCode === 0 ? 0 : 1);
