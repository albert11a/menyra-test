"use strict";

const fs = require("fs/promises");
const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_CONTRACT_CONFIG = path.resolve(
  ROOT_DIR,
  "tests/mnyra-heart-runner/config/heart-pack-config.contract-smoke.example.json"
);
const DEFAULT_REPORT_PATH = path.resolve(ROOT_DIR, "tmp/phase1-gate/phase1-gate-last-run.json");

const EXIT_CODES = {
  success: 0,
  infrastructureNotReady: 10,
  resetFailed: 11,
  rulesFailed: 12,
  contractFailed: 13,
  verifyFailed: 14,
  internalError: 15
};

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function parseHostPort(rawValue = "", fallbackHost, fallbackPort) {
  const safeValue = asText(rawValue);
  if (!safeValue) {
    return {
      host: fallbackHost,
      port: fallbackPort
    };
  }
  const [hostPart, portPart] = safeValue.split(":");
  const parsedPort = Number(portPart || fallbackPort);
  return {
    host: asText(hostPart, fallbackHost),
    port: Number.isFinite(parsedPort) ? parsedPort : fallbackPort
  };
}

function getNpmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function getNpmInvocation(args = []) {
  const safeArgs = Array.isArray(args) ? args.filter(Boolean) : [];
  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", [getNpmCommand(), ...safeArgs].join(" ")]
    };
  }
  return {
    command: getNpmCommand(),
    args: safeArgs
  };
}

function createStageRecord(name, command, workdir) {
  return {
    name,
    command,
    workdir,
    status: "pending",
    startedAt: "",
    endedAt: "",
    durationMs: 0,
    exitCode: null,
    signal: "",
    error: ""
  };
}

function finalizeStage(stage, status, startedAt, details = {}) {
  const endedAt = new Date().toISOString();
  const durationMs = Date.now() - startedAt.getTime();
  Object.assign(stage, {
    status,
    endedAt,
    durationMs,
    exitCode: details.exitCode ?? stage.exitCode ?? null,
    signal: asText(details.signal, stage.signal),
    error: asText(details.error, stage.error)
  });
}

async function writeGateReport(reportPath, payload) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(payload, null, 2), "utf8");
}

async function checkTcpReachable(label, host, port, timeoutMs = 2000) {
  await new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error(`${label} ist nicht erreichbar unter ${host}:${port}.`));
    }, timeoutMs);

    socket.once("connect", () => {
      clearTimeout(timeout);
      socket.end();
      resolve();
    });
    socket.once("error", (error) => {
      clearTimeout(timeout);
      reject(new Error(`${label} ist nicht erreichbar unter ${host}:${port}. ${error?.message || error}`));
    });
  });
}

async function checkHttpReachable(label, url, timeoutMs = 4000) {
  const safeUrl = asText(url);
  if (!safeUrl) {
    throw new Error(`${label} URL ist leer.`);
  }
  let response;
  try {
    response = await fetch(safeUrl, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (error) {
    throw new Error(`${label} ist nicht erreichbar unter ${safeUrl}. ${error?.message || error}`);
  }
  if ((response?.status || 0) >= 500) {
    throw new Error(`${label} antwortet mit ${response.status} unter ${safeUrl}.`);
  }
}

async function readOptionalJson(filePath = "") {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function buildGateEnvironment() {
  const testworldProjectId = asText(
    process.env.MNYRA_TESTWORLD_FIREBASE_PROJECT_ID,
    "demo-mnyra-phase1"
  );
  return {
    ...process.env,
    MNYRA_TESTWORLD_TARGET: asText(process.env.MNYRA_TESTWORLD_TARGET, "emulator"),
    MNYRA_TESTWORLD_FIREBASE_PROJECT_ID: testworldProjectId,
    FIRESTORE_EMULATOR_HOST: asText(process.env.FIRESTORE_EMULATOR_HOST, "127.0.0.1:8080"),
    FIREBASE_AUTH_EMULATOR_HOST: asText(process.env.FIREBASE_AUTH_EMULATOR_HOST, "127.0.0.1:9099"),
    MNYRA_RULES_TEST_PROJECT_ID: asText(process.env.MNYRA_RULES_TEST_PROJECT_ID, "demo-mnyra-phase1-rules"),
    MNYRA_CONTRACT_FIRESTORE_PROJECT_ID: asText(
      process.env.MNYRA_CONTRACT_FIRESTORE_PROJECT_ID,
      testworldProjectId
    ),
    MNYRA_USE_FIREBASE_EMULATORS: asText(process.env.MNYRA_USE_FIREBASE_EMULATORS, "true"),
    MNYRA_FIREBASE_PROJECT_ALIAS: asText(process.env.MNYRA_FIREBASE_PROJECT_ALIAS, "local"),
    MNYRA_ALLOW_LIVE_MUTATIONS: asText(process.env.MNYRA_ALLOW_LIVE_MUTATIONS, "true"),
    MNYRA_SYNTHETIC_ISOLATION_KEY: asText(process.env.MNYRA_SYNTHETIC_ISOLATION_KEY, "phase1-gate"),
    MNYRA_HEART_PACK_CONFIG_FILE: asText(process.env.MNYRA_HEART_PACK_CONFIG_FILE, DEFAULT_CONTRACT_CONFIG),
    MNYRA_TESTWORLD_VERIFY_MODE: asText(process.env.MNYRA_TESTWORLD_VERIFY_MODE, "phase1-gate"),
    MNYRA_HEART_HEADLESS: asText(process.env.MNYRA_HEART_HEADLESS, "true")
  };
}

async function resolvePreflightTargets(env) {
  const firestore = parseHostPort(env.FIRESTORE_EMULATOR_HOST, "127.0.0.1", 8080);
  const auth = parseHostPort(env.FIREBASE_AUTH_EMULATOR_HOST, "127.0.0.1", 9099);
  const contractConfig = await readOptionalJson(env.MNYRA_HEART_PACK_CONFIG_FILE);
  const socialBaseUrl = asText(
    env.MNYRA_SOCIAL_BASE_URL,
    contractConfig?.runtime?.socialBaseUrl,
    "http://127.0.0.1:4173/social/"
  );
  return {
    firestore,
    auth,
    socialBaseUrl
  };
}

async function runCommand(stage, { command, args = [], workdir, env }) {
  stage.status = "running";
  stage.startedAt = new Date().toISOString();
  const startedAt = new Date(stage.startedAt);

  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: workdir,
      env,
      stdio: "inherit",
      shell: false
    });

    child.on("error", (error) => {
      finalizeStage(stage, "failed", startedAt, {
        error: error?.message || String(error),
        exitCode: null
      });
      reject(error);
    });

    child.on("exit", (code, signal) => {
      if ((code ?? 0) === 0) {
        finalizeStage(stage, "passed", startedAt, {
          exitCode: code ?? 0,
          signal
        });
        resolve();
        return;
      }
      finalizeStage(stage, "failed", startedAt, {
        exitCode: code ?? null,
        signal,
        error: `Command exited with code ${code ?? "unknown"}${signal ? ` (signal ${signal})` : ""}.`
      });
      reject(new Error(stage.error));
    });
  });
}

async function main() {
  const env = buildGateEnvironment();
  const reportPath = asText(process.env.MNYRA_PHASE1_GATE_REPORT, DEFAULT_REPORT_PATH);
  const summary = {
    gate: "phase1",
    startedAt: new Date().toISOString(),
    endedAt: "",
    status: "running",
    failureKind: "",
    exitCode: null,
    environment: {
      testworldTarget: env.MNYRA_TESTWORLD_TARGET,
      rulesProjectId: env.MNYRA_RULES_TEST_PROJECT_ID,
      firestoreEmulatorHost: env.FIRESTORE_EMULATOR_HOST,
      authEmulatorHost: env.FIREBASE_AUTH_EMULATOR_HOST,
      heartPackConfigFile: env.MNYRA_HEART_PACK_CONFIG_FILE,
      verifyMode: env.MNYRA_TESTWORLD_VERIFY_MODE
    },
    prerequisites: {},
    stages: [
      createStageRecord("reset", "node scripts/phase1-testworld/reset.cjs", ROOT_DIR),
      createStageRecord("rules", `${getNpmCommand()} test`, path.resolve(ROOT_DIR, "tests/firestore-rules")),
      createStageRecord("contract", `${getNpmCommand()} run contract-smoke`, path.resolve(ROOT_DIR, "tests/mnyra-heart-runner")),
      createStageRecord("verify", "node scripts/phase1-testworld/verify.cjs", ROOT_DIR)
    ]
  };

  try {
    const preflight = await resolvePreflightTargets(env);
    summary.prerequisites = {
      firestore: `${preflight.firestore.host}:${preflight.firestore.port}`,
      auth: `${preflight.auth.host}:${preflight.auth.port}`,
      socialBaseUrl: preflight.socialBaseUrl
    };

    console.log("[phase1-gate] Preflight: pruefe Emulatoren und lokale Social-App.");
    await checkTcpReachable("Firestore emulator", preflight.firestore.host, preflight.firestore.port);
    await checkTcpReachable("Auth emulator", preflight.auth.host, preflight.auth.port);
    await checkHttpReachable("Social app", preflight.socialBaseUrl);

    console.log("[phase1-gate] Stage reset");
    await runCommand(summary.stages[0], {
      command: process.execPath,
      args: [path.resolve(ROOT_DIR, "scripts/phase1-testworld/reset.cjs")],
      workdir: ROOT_DIR,
      env
    });

    console.log("[phase1-gate] Stage rules");
    const rulesInvocation = getNpmInvocation(["test"]);
    await runCommand(summary.stages[1], {
      command: rulesInvocation.command,
      args: rulesInvocation.args,
      workdir: path.resolve(ROOT_DIR, "tests/firestore-rules"),
      env
    });

    console.log("[phase1-gate] Stage contract");
    const contractInvocation = getNpmInvocation(["run", "contract-smoke"]);
    await runCommand(summary.stages[2], {
      command: contractInvocation.command,
      args: contractInvocation.args,
      workdir: path.resolve(ROOT_DIR, "tests/mnyra-heart-runner"),
      env
    });

    console.log("[phase1-gate] Stage verify");
    await runCommand(summary.stages[3], {
      command: process.execPath,
      args: [path.resolve(ROOT_DIR, "scripts/phase1-testworld/verify.cjs")],
      workdir: ROOT_DIR,
      env
    });

    summary.status = "passed";
    summary.exitCode = EXIT_CODES.success;
    console.log("[phase1-gate] PHASE-1-Gate erfolgreich abgeschlossen.");
  } catch (error) {
    const message = asText(error?.message, "PHASE-1-Gate fehlgeschlagen.");
    const resetStage = summary.stages[0];
    const rulesStage = summary.stages[1];
    const contractStage = summary.stages[2];
    const verifyStage = summary.stages[3];

    if (summary.stages.every((stage) => stage.status === "pending")) {
      summary.status = "infrastructure_not_ready";
      summary.failureKind = "infrastructure_not_started";
      summary.exitCode = EXIT_CODES.infrastructureNotReady;
      console.error(`[phase1-gate] Infrastruktur nicht gestartet: ${message}`);
    } else if (resetStage.status === "failed") {
      summary.status = "reset_failed";
      summary.failureKind = "reset_failed";
      summary.exitCode = EXIT_CODES.resetFailed;
      console.error(`[phase1-gate] Reset fehlgeschlagen: ${resetStage.error || message}`);
    } else if (rulesStage.status === "failed") {
      summary.status = "rules_failed";
      summary.failureKind = "rules_failed";
      summary.exitCode = EXIT_CODES.rulesFailed;
      console.error(`[phase1-gate] Rules fehlgeschlagen: ${rulesStage.error || message}`);
    } else if (contractStage.status === "failed") {
      summary.status = "contract_failed";
      summary.failureKind = "contract_failed";
      summary.exitCode = EXIT_CODES.contractFailed;
      console.error(`[phase1-gate] Contract fehlgeschlagen: ${contractStage.error || message}`);
    } else if (verifyStage.status === "failed") {
      summary.status = "verify_failed";
      summary.failureKind = "verify_failed";
      summary.exitCode = EXIT_CODES.verifyFailed;
      console.error(`[phase1-gate] Verify fehlgeschlagen: ${verifyStage.error || message}`);
    } else {
      summary.status = "internal_error";
      summary.failureKind = "internal_error";
      summary.exitCode = EXIT_CODES.internalError;
      console.error(`[phase1-gate] Unerwarteter Fehler: ${message}`);
    }
  } finally {
    summary.endedAt = new Date().toISOString();
    await writeGateReport(reportPath, summary).catch((error) => {
      console.error(`[phase1-gate] Konnte Gate-Report nicht schreiben: ${error?.message || error}`);
    });
    process.exit(summary.exitCode ?? EXIT_CODES.internalError);
  }
}

main().catch((error) => {
  console.error(`[phase1-gate] Fatal: ${error?.message || error}`);
  process.exit(EXIT_CODES.internalError);
});
