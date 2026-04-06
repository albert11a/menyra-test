import { spawn } from "node:child_process";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function withDefaultEnv(baseEnv = {}, key = "", value = "") {
  const safeKey = asText(key);
  if (!safeKey) return baseEnv;
  if (asText(baseEnv[safeKey])) return baseEnv;
  return {
    ...baseEnv,
    [safeKey]: asText(value)
  };
}

async function runNodeStep(label = "", args = [], env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      stdio: "inherit",
      env
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(0);
        return;
      }
      reject(new Error(`${label} failed with exit code ${code}.`));
    });
  });
}

async function main() {
  let env = { ...process.env };
  env = withDefaultEnv(env, "MNYRA_HEART_PACK_CONFIG_FILE", "config/casarita-prod-config.json");
  env = withDefaultEnv(env, "MNYRA_HEART_FAIL_ON_CONSOLE_ERRORS", "true");
  env = withDefaultEnv(env, "MNYRA_HEART_FAIL_ON_REQUEST_FAILURES", "true");
  env = withDefaultEnv(env, "MNYRA_HEART_FAIL_ON_HTTP_ERRORS", "true");
  env = withDefaultEnv(env, "COLD_AUDIT_BASE_URL", "https://www.mnyra.com/social/");
  env = withDefaultEnv(env, "COLD_AUDIT_RESTAURANT_ID", "Lzm6RpNu3ErSDtGCHxpi");
  env = withDefaultEnv(env, "COLD_AUDIT_ITERATIONS", "5");
  env = withDefaultEnv(env, "COLD_AUDIT_EXPECTED_PRODUCTS", "27");
  env = withDefaultEnv(env, "COLD_AUDIT_STRICT_PRODUCT_COUNT", "true");
  env = withDefaultEnv(env, "COLD_AUDIT_NETWORK_PROFILES", "wifi,slow4g");

  console.log("[casarita-live] Step 1/2 guest-pack (live read-only)");
  await runNodeStep("guest-pack", ["./src/run-pack.mjs", "guest-pack"], env);

  console.log("[casarita-live] Step 2/2 cold-audit (wifi + slow4g)");
  await runNodeStep("cold-audit", ["./scripts/cold-load-audit.mjs"], env);

  console.log("[casarita-live] completed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
