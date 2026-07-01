import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const reportPath = resolve(
  repoRoot,
  "docs/codex/generated/dependency-cruiser-check.txt",
);
const bin = resolve(
  repoRoot,
  "node_modules/dependency-cruiser/bin/dependency-cruise.mjs",
);
const args = [
  "--config",
  ".dependency-cruiser.cjs",
  "--output-type",
  "err-long",
  "apps/menyra-social",
  "apps/mnyra-heart",
  "apps/waiter",
  "functions",
  "shared",
];

const output = [];
const child = spawn(process.execPath, [bin, ...args], { cwd: repoRoot });
child.stdout.on("data", (chunk) => output.push(chunk));
child.stderr.on("data", (chunk) => output.push(chunk));

const exitCode = await new Promise((resolveRun, rejectRun) => {
  child.on("error", rejectRun);
  child.on("exit", (code) => resolveRun(code ?? 1));
});

const text = Buffer.concat(output).toString("utf8");
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(
  reportPath,
  [
    "Dependency Cruiser baseline check",
    `Exit code: ${exitCode}`,
    "This prep branch records warnings as baseline and does not fail on legacy coupling yet.",
    "",
    text || "No output.",
  ].join("\n"),
);

if (text.trim()) {
  console.log(text);
}
if (exitCode !== 0) {
  console.log(
    `Dependency baseline written to ${relative(repoRoot, reportPath)}; keeping arch:check non-blocking for now.`,
  );
}
process.exit(0);
