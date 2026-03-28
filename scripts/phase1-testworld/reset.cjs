"use strict";

const { initializePhase1TestWorldAdmin } = require("./lib/runtime.cjs");
const { runReset } = require("./lib/tasks.cjs");

async function main() {
  const { db, auth, runtime } = initializePhase1TestWorldAdmin();
  const result = await runReset({ db, auth, runtime });
  console.log(JSON.stringify({
    action: "reset",
    target: runtime.target,
    projectId: runtime.projectId,
    useEmulators: runtime.useEmulators,
    deletedAuthUsers: result.deletedAuthUsers.length,
    reseededAuthUsers: result.seedResult.authResults.length,
    docsWritten: result.seedResult.writtenDocs,
    summary: result.manifest.summary
  }, null, 2));
}

main().catch((error) => {
  console.error(`[phase1-testworld:reset] ${error?.message || error}`);
  process.exitCode = 1;
});
