import fs from "node:fs/promises";
import path from "node:path";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function asBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  const safe = String(value).trim().toLowerCase();
  return safe === "1" || safe === "true" || safe === "yes" || safe === "on";
}

function createRunStamp() {
  return new Date().toISOString().replace(/[.:TZ-]/g, "").slice(0, 14);
}

export async function getRunnerEnv(mode = "smoke") {
  const rootDir = process.cwd();
  const artifactDir = path.resolve(rootDir, process.env.MNYRA_HEART_ARTIFACT_DIR || `artifacts/${mode}-${createRunStamp()}`);
  await fs.mkdir(artifactDir, { recursive: true });
  const outputFile = path.resolve(artifactDir, process.env.MNYRA_HEART_REPORT_FILE || `${mode}-report.json`);
  return {
    mode,
    rootDir,
    artifactDir,
    outputFile,
    runId: asText(process.env.HEART_RUN_ID, `heart_${mode}_${createRunStamp()}`),
    socialBaseUrl: asText(process.env.MNYRA_SOCIAL_BASE_URL, "https://menyra-test.vercel.app/social/"),
    ceoEmail: asText(process.env.MNYRA_CEO_EMAIL),
    ceoPassword: asText(process.env.MNYRA_CEO_PASSWORD),
    headless: asBoolean(process.env.MNYRA_HEART_HEADLESS, true),
    allowLiveMutations: asBoolean(process.env.MNYRA_ALLOW_LIVE_MUTATIONS, false),
    syntheticIsolationKey: asText(process.env.MNYRA_SYNTHETIC_ISOLATION_KEY),
    syntheticPrefix: asText(process.env.MNYRA_SYNTHETIC_PREFIX, `mnyra-heart-synth-${createRunStamp()}`),
    businessProfileUrl: asText(process.env.MNYRA_SMOKE_BUSINESS_PROFILE_URL),
    chatTargetUrl: asText(process.env.MNYRA_SMOKE_CHAT_TARGET_URL),
    chatComposerSelector: asText(process.env.MNYRA_SMOKE_CHAT_COMPOSER_SELECTOR),
    chatSendSelector: asText(process.env.MNYRA_SMOKE_CHAT_SEND_SELECTOR),
    chatMessageTemplate: asText(process.env.MNYRA_SMOKE_CHAT_MESSAGE, "mnyra-heart smoke ping"),
    cartOpenUrl: asText(process.env.MNYRA_SMOKE_CART_URL),
    cartTriggerSelector: asText(process.env.MNYRA_SMOKE_CART_TRIGGER_SELECTOR),
    cartRemovalSelector: asText(process.env.MNYRA_SMOKE_CART_REMOVAL_SELECTOR),
    orderTriggerSelector: asText(process.env.MNYRA_SMOKE_ORDER_TRIGGER_SELECTOR),
    orderSuccessText: asText(process.env.MNYRA_SMOKE_ORDER_SUCCESS_TEXT),
    leadCreateUrl: asText(process.env.MNYRA_SMOKE_LEAD_CREATE_URL),
    leadSaveSelector: asText(process.env.MNYRA_SMOKE_LEAD_SAVE_SELECTOR),
    heartStatusUrl: asText(process.env.HEART_STATUS_URL),
    heartReportUrl: asText(process.env.HEART_REPORT_URL),
    heartIncidentUrl: asText(process.env.HEART_INCIDENT_URL),
    heartWebhookSecret: asText(process.env.HEART_WEBHOOK_SECRET),
    githubRunId: asText(process.env.GITHUB_RUN_ID),
    githubRunNumber: asText(process.env.GITHUB_RUN_NUMBER),
    githubServerUrl: asText(process.env.GITHUB_SERVER_URL),
    githubRepository: asText(process.env.GITHUB_REPOSITORY),
    githubSha: asText(process.env.GITHUB_SHA),
    githubRefName: asText(process.env.GITHUB_REF_NAME)
  };
}

export function requireCredentials(env) {
  if (!env.ceoEmail || !env.ceoPassword) {
    throw new Error("Missing MNYRA_CEO_EMAIL or MNYRA_CEO_PASSWORD for Playwright runner.");
  }
}
