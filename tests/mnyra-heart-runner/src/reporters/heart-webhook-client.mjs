import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

async function postJson(url, payload, secret = "") {
  const body = JSON.stringify(payload);
  const headers = {
    "Content-Type": "application/json"
  };
  if (secret) {
    headers["X-Heart-Webhook-Secret"] = secret;
    headers["X-Heart-Signature"] = crypto.createHmac("sha256", secret).update(body).digest("hex");
  }
  const response = await fetch(url, {
    method: "POST",
    headers,
    body
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(asText(text, `Heart webhook failed with ${response.status}`));
  }
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export async function postHeartStatus(env, payload = {}) {
  if (!env.heartStatusUrl) return;
  await postJson(env.heartStatusUrl, payload, env.heartWebhookSecret);
}

export async function postHeartReport(env, payload = {}) {
  if (!env.heartReportUrl) return;
  await postJson(env.heartReportUrl, payload, env.heartWebhookSecret);
}

export async function postHeartIncident(env, payload = {}) {
  if (!env.heartIncidentUrl) return;
  await postJson(env.heartIncidentUrl, payload, env.heartWebhookSecret);
}

function detectContentType(filePath = "", kind = "") {
  const extension = path.extname(String(filePath || "")).toLowerCase();
  if (kind === "screenshot") {
    return extension === ".jpg" || extension === ".jpeg" ? "image/jpeg" : "image/png";
  }
  if (extension === ".zip") return "application/zip";
  if (extension === ".json") return "application/json";
  if (extension === ".pdf") return "application/pdf";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  return "application/octet-stream";
}

export async function uploadHeartArtifact(env, {
  runId = "",
  label = "",
  kind = "artifact",
  filePath = ""
} = {}) {
  if (!env.heartArtifactUrl) return null;
  const safeFilePath = asText(filePath);
  if (!safeFilePath) return null;
  const buffer = await fs.readFile(safeFilePath).catch(() => null);
  if (!buffer?.length) return null;

  const form = new FormData();
  form.set("runId", asText(runId));
  form.set("label", asText(label));
  form.set("kind", asText(kind, "artifact"));
  const fileName = path.basename(safeFilePath);
  const contentType = detectContentType(safeFilePath, kind);
  form.set("file", new Blob([buffer], { type: contentType }), fileName);

  const headers = {};
  if (env.heartWebhookSecret) {
    headers["X-Heart-Webhook-Secret"] = env.heartWebhookSecret;
  }
  const response = await fetch(env.heartArtifactUrl, {
    method: "POST",
    headers,
    body: form
  });
  const text = await response.text();
  let parsed = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = {};
  }
  if (!response.ok) {
    throw new Error(asText(parsed?.error || text, `Heart artifact upload failed with ${response.status}`));
  }
  return parsed?.artifact || null;
}
