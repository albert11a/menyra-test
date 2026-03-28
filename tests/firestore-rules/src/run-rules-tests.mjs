import { spawn } from "node:child_process";

import {
  cleanupRulesTestEnvironment,
  getRulesTestEnvironment
} from "./helpers/test-env.mjs";

const testFiles = [
  "./src/users.rules.test.mjs",
  "./src/notifications.rules.test.mjs",
  "./src/restaurant-orders.rules.test.mjs",
  "./src/leads.rules.test.mjs",
  "./src/superadmins.rules.test.mjs"
];

async function main() {
  try {
    await getRulesTestEnvironment();
    await cleanupRulesTestEnvironment();
  } catch (error) {
    console.error(`[rules-tests] ${error?.message || error}`);
    process.exit(1);
    return;
  }

  const child = spawn(
    process.execPath,
    ["--test", "--test-concurrency=1", ...testFiles],
    {
      stdio: "inherit",
      env: process.env
    }
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });
}

main().catch((error) => {
  console.error(`[rules-tests] ${error?.message || error}`);
  process.exit(1);
});
