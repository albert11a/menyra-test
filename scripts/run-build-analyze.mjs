import { spawn } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, env = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: { ...process.env, ...env },
      stdio: "inherit",
    });
    child.on("error", rejectRun);
    child.on("exit", (code) => resolveRun(code ?? 1));
  });
}

const buildCode = await run(npmBin, ["run", "build:menyra-social:bundle"], {
  MNYRA_BUNDLE_ANALYZE: "1",
});

if (buildCode !== 0) {
  process.exit(buildCode);
}

process.exit(
  await run(process.execPath, ["scripts/generate-bundle-report.mjs"]),
);
