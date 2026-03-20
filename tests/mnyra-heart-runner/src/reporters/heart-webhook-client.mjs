import crypto from "node:crypto";

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
