import fs from "node:fs/promises";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

async function appendGithubEnv(values = {}) {
  const githubEnvPath = asText(process.env.GITHUB_ENV);
  if (!githubEnvPath) return;
  const lines = [];
  Object.entries(values).forEach(([key, value]) => {
    if (!key) return;
    lines.push(`${key}<<__MNYRA_HEART_ENV__`);
    lines.push(String(value ?? ""));
    lines.push("__MNYRA_HEART_ENV__");
  });
  if (lines.length) {
    await fs.appendFile(githubEnvPath, `${lines.join("\n")}\n`, "utf8");
  }
}

function collectFallbackEnv() {
  const fallbackEnv = {};
  Object.entries(process.env || {}).forEach(([key, value]) => {
    if (!/^MNYRA_/.test(String(key || ""))) return;
    fallbackEnv[key] = asText(value);
  });
  if (!asText(fallbackEnv.MNYRA_WAITER_BASE_URL) && asText(fallbackEnv.MNYRA_STAFF_BASE_URL)) {
    fallbackEnv.MNYRA_WAITER_BASE_URL = asText(fallbackEnv.MNYRA_STAFF_BASE_URL);
  }
  return fallbackEnv;
}

function mergeEnvValues(fallbackEnv = {}, fetchedEnv = {}) {
  const mergedEnv = { ...(fallbackEnv || {}) };
  Object.entries(fetchedEnv || {}).forEach(([key, value]) => {
    const safeKey = asText(key);
    if (!safeKey) return;
    const textValue = String(value ?? "");
    if (!String(textValue).trim()) return;
    mergedEnv[safeKey] = textValue;
  });
  if (!asText(mergedEnv.MNYRA_WAITER_BASE_URL) && asText(mergedEnv.MNYRA_STAFF_BASE_URL)) {
    mergedEnv.MNYRA_WAITER_BASE_URL = asText(mergedEnv.MNYRA_STAFF_BASE_URL);
  }
  return mergedEnv;
}

async function main() {
  const fallbackEnv = collectFallbackEnv();
  const endpoint = asText(
    process.env.HEART_RUNNER_CONFIG_URL,
    "https://us-central1-menyra-c0e68.cloudfunctions.net/heartGetRunnerConfig"
  );
  const secret = asText(process.env.HEART_WEBHOOK_SECRET);
  if (!endpoint || !secret) {
    await appendGithubEnv(fallbackEnv);
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Heart-Webhook-Secret": secret
    },
    body: JSON.stringify({
      socialBaseUrl: asText(process.env.MNYRA_SOCIAL_BASE_URL),
      waiterBaseUrl: asText(process.env.MNYRA_WAITER_BASE_URL || process.env.MNYRA_STAFF_BASE_URL)
    })
  });
  if (!response.ok) {
    console.warn(`[mnyra-heart] runner config fetch skipped with status ${response.status}`);
    await appendGithubEnv(fallbackEnv);
    return;
  }
  const payload = await response.json();
  const env = payload?.env && typeof payload.env === "object" ? payload.env : {};
  await appendGithubEnv(mergeEnvValues(fallbackEnv, env));
}

main().catch(async (error) => {
  console.warn("[mnyra-heart] runner config fetch skipped", error);
  await appendGithubEnv(collectFallbackEnv());
});
