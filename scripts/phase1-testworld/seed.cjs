"use strict";

const { initializePhase1TestWorldAdmin } = require("./lib/runtime.cjs");
const { runSeed } = require("./lib/tasks.cjs");

async function main() {
  const { db, auth, runtime } = initializePhase1TestWorldAdmin();
  const result = await runSeed({ db, auth, runtime });
  console.log(JSON.stringify({
    action: "seed",
    target: runtime.target,
    projectId: runtime.projectId,
    useEmulators: runtime.useEmulators,
    authUsersProcessed: result.authResults.length,
    docsWritten: result.writtenDocs,
    summary: result.manifest.summary
  }, null, 2));
}

main().catch((error) => {
  console.error(`[phase1-testworld:seed] ${error?.message || error}`);
  process.exitCode = 1;
});
