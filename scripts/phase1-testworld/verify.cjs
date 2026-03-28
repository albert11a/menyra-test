"use strict";

const { initializePhase1TestWorldAdmin } = require("./lib/runtime.cjs");
const { runPhase1GateVerify, runVerify } = require("./lib/tasks.cjs");

function resolveVerifyMode() {
  const mode = String(process.env.MNYRA_TESTWORLD_VERIFY_MODE || "").trim().toLowerCase();
  return mode || "baseline";
}

async function main() {
  const { db, auth, runtime } = initializePhase1TestWorldAdmin();
  const verifyMode = resolveVerifyMode();
  const result = verifyMode === "phase1-gate"
    ? await runPhase1GateVerify({ db, auth, runtime })
    : await runVerify({ db, auth, runtime });
  console.log(JSON.stringify({
    action: "verify",
    mode: verifyMode,
    target: runtime.target,
    projectId: runtime.projectId,
    useEmulators: runtime.useEmulators,
    ok: result.ok,
    verifiedDocCount: result.verifiedDocCount,
    summary: result.manifest.summary,
    errors: result.errors
  }, null, 2));
  if (!result.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`[phase1-testworld:verify] ${error?.message || error}`);
  process.exitCode = 1;
});
