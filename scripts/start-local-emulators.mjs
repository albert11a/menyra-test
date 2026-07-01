import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const firebaseCliPath = require.resolve("firebase-tools/lib/bin/firebase.js");

const env = {
  ...process.env,
  FUNCTIONS_DISCOVERY_TIMEOUT: process.env.FUNCTIONS_DISCOVERY_TIMEOUT || "120",
};

const child = spawn(
  process.execPath,
  [
    firebaseCliPath,
    "emulators:start",
    "--project",
    "mnyra-local",
    "--import=seed/export",
    "--export-on-exit=seed/export",
  ],
  {
    env,
    stdio: "inherit",
  },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
