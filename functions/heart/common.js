"use strict";

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const crypto = require("crypto");
const { buildHttpLogContext, logFunctionWarn } = require("../logging");

const ALBERT_CEO_UID = "aklBkkIuZ7Nrpx266TJn63rrxX62";
const ALBERT_CEO_ALIASES = Object.freeze(["alberthoti", "albert_hoti"]);
const ALBERT_CEO_EMAILS = Object.freeze(["alberthoti.vsa@gmail.com"]);
const HIDDEN_LEGACY_CEO_EMAILS = Object.freeze(["albert.hoti@menyra.com"]);
const HEART_DEFAULT_REGION = "us-central1";

let runtimeConfigCache = null;

function asText(value, fallback = "", ...restFallbacks) {
  const text = String(value || "").trim();
  if (text) return text;
  if (restFallbacks.length) {
    return [fallback, ...restFallbacks]
      .map((entry) => String(entry || "").trim())
      .find(Boolean) || "";
  }
  return String(fallback || "").trim();
}

function normalizeRoleList(value = "") {
  if (Array.isArray(value)) {
    return value.map((item) => asText(item).toLowerCase()).filter(Boolean);
  }
  return asText(value)
    .split(",")
    .map((item) => asText(item).toLowerCase())
    .filter(Boolean);
}

function normalizeEmailValue(value = "") {
  return asText(value).toLowerCase();
}

function normalizeHandleValue(value = "") {
  return asText(value)
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "");
}

function normalizeStatus(value = "", fallback = "idle") {
  const status = asText(value).toLowerCase();
  if (!status) return fallback;
  if (status === "in_progress") return "running";
  if (status === "failure") return "failed";
  if (status === "timed_out") return "failed";
  if (status === "action_required") return "warning";
  if (status === "not-configured") return "not_configured";
  if (status === "needs-setup") return "not_configured";
  return status;
}

function normalizeSeverity(value = "", fallback = "info") {
  const severity = asText(value).toLowerCase();
  if (!severity) return fallback;
  if (severity === "error") return "critical";
  return severity;
}

function toIso(value = "") {
  try {
    if (value && typeof value.toDate === "function") {
      return value.toDate().toISOString();
    }
    if (value && typeof value.toMillis === "function") {
      return new Date(value.toMillis()).toISOString();
    }
  } catch {}
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}

function serializeFirestoreValue(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => serializeFirestoreValue(item));
  }
  if (value && typeof value === "object") {
    if (typeof value.toDate === "function" || typeof value.toMillis === "function") {
      return toIso(value);
    }
    const next = {};
    Object.keys(value).forEach((key) => {
      next[key] = serializeFirestoreValue(value[key]);
    });
    return next;
  }
  return value;
}

function resolveRuntimeConfig() {
  if (runtimeConfigCache) return runtimeConfigCache;
  try {
    runtimeConfigCache = functions.config() || {};
  } catch {
    runtimeConfigCache = {};
  }
  return runtimeConfigCache;
}

function readConfigValue(...paths) {
  const config = resolveRuntimeConfig();
  for (const path of paths) {
    const segments = String(path || "").split(".").filter(Boolean);
    let current = config;
    for (const segment of segments) {
      current = current && typeof current === "object" ? current[segment] : undefined;
    }
    const text = asText(current);
    if (text) return text;
  }
  return "";
}

function getWebhookSecret() {
  return asText(process.env.HEART_WEBHOOK_SECRET)
    || readConfigValue("heart.webhook_secret", "mnyra.heart_webhook_secret");
}

function getHeartBaseUrl() {
  return asText(process.env.HEART_BASE_URL)
    || readConfigValue("heart.base_url", "mnyra.heart_base_url")
    || "https://menyra.com/apps/mnyra-heart/";
}

function buildWebhookSignature(payloadText, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(String(payloadText || ""))
    .digest("hex");
}

function verifyWebhookSignature(req, secret) {
  const headerSignature = asText(req.get("x-heart-signature") || req.get("x-mnyra-heart-signature"));
  if (!headerSignature || !secret) return false;
  const rawBody = typeof req.rawBody === "string"
    ? req.rawBody
    : Buffer.isBuffer(req.rawBody)
      ? req.rawBody.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body || {});
  const expected = buildWebhookSignature(rawBody, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(headerSignature), Buffer.from(expected));
  } catch {
    return false;
  }
}

function sendCors(res, req, methods = "GET,OPTIONS") {
  const origin = asText(req.get("origin"), "*");
  res.set("Access-Control-Allow-Origin", origin === "null" ? "*" : origin);
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", methods);
  res.set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Heart-Authorization,X-Heart-Webhook-Secret,X-Heart-Signature");
}

function parseBearerToken(req) {
  const authHeader = asText(req.get("authorization") || req.get("x-heart-authorization"));
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? asText(match[1]) : "";
}

function parseRequestJson(req) {
  if (req && req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req?.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req?.rawBody)) {
    try {
      return JSON.parse(req.rawBody.toString("utf8"));
    } catch {
      return {};
    }
  }
  return {};
}

function isCeoRole(profile = {}) {
  const roles = normalizeRoleList(profile.roles || profile.role || "");
  return roles.includes("ceo");
}

// Vertrauenswuerdige CEO/Superadmin-Signale aus verifizierten Custom Claims.
// Claims werden ausschliesslich serverseitig gesetzt und sind nicht vom Nutzer editierbar.
function hasTrustedCeoClaim(claims = {}) {
  if (!claims || typeof claims !== "object") return false;
  if (claims.ceo === true || claims.superadmin === true || claims.superAdmin === true) return true;
  const roles = normalizeRoleList(claims.roles || claims.role || "");
  return roles.includes("ceo") || roles.includes("superadmin");
}

// SICHERHEIT: Global-CEO-Zugriff darf NICHT von nutzer-editierbaren Feldern
// (Anzeigename, Handle, beliebige E-Mail-Domain) abhaengen. Deshalb nur exakte,
// VERIFIZIERTE Owner-E-Mail aus dem ID-Token. displayName/handle/name entfallen.
function isAlbertCeoUser(user = {}, profile = {}) {
  const email = normalizeEmailValue(user.email);
  if (!email) return false;
  if (HIDDEN_LEGACY_CEO_EMAILS.includes(email)) return false;
  if (user.emailVerified !== true) return false;
  return ALBERT_CEO_EMAILS.includes(email);
}

function hasGlobalCeoAccess(user = {}, profile = {}) {
  const uid = asText(user.uid || profile.uid);
  if (uid && uid === ALBERT_CEO_UID) return true;
  if (hasTrustedCeoClaim(user.claims)) return true;
  if (user.isSuperadmin === true) return true;
  return isAlbertCeoUser(user, profile);
}

function canAccessHeartAsCeo(user = {}, profile = {}) {
  return isCeoRole(profile) || hasGlobalCeoAccess(user, profile);
}

async function loadUserProfile(db, uid) {
  const safeUid = asText(uid);
  if (!safeUid) return null;
  try {
    const snap = await db.collection("users").doc(safeUid).get();
    if (!snap.exists) return { uid: safeUid, roles: [], role: "" };
    return { uid: safeUid, ...serializeFirestoreValue(snap.data() || {}) };
  } catch {
    return { uid: safeUid, roles: [], role: "" };
  }
}

// Vertrauenswuerdige Superadmin-Mitgliedschaft: superadmins/{uid} ist per
// Firestore-Rules schreibgeschuetzt und daher nicht selbst vergebbar.
async function isSuperadminUid(db, uid) {
  const safeUid = asText(uid);
  if (!safeUid) return false;
  try {
    const snap = await db.collection("superadmins").doc(safeUid).get();
    return snap.exists;
  } catch {
    return false;
  }
}

async function verifyCeoRequest(req, res, db, {
  methods = ["GET"],
  allowWebhookSecret = false
} = {}) {
  const logContext = buildHttpLogContext(req, { area: "heart-auth" });
  sendCors(res, req, `${methods.join(",")},OPTIONS`);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return { ok: false, handled: true };
  }
  if (!methods.includes(req.method)) {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return { ok: false, handled: true };
  }

  if (allowWebhookSecret) {
    const secret = getWebhookSecret();
    const providedSecret = asText(req.get("x-heart-webhook-secret"));
    if (secret && providedSecret && providedSecret === secret) {
      return { ok: true, handled: false, authMode: "webhook-secret" };
    }
    if (secret && verifyWebhookSignature(req, secret)) {
      return { ok: true, handled: false, authMode: "webhook-signature" };
    }
  }

  const bearerToken = parseBearerToken(req);
  if (!bearerToken) {
    logFunctionWarn("heart.auth.request", {
      ...logContext,
      status: "unauthorized",
      reason: "missing_bearer_token",
      hasAuthorizationHeader: !!asText(req.get("authorization")),
      hasHeartAuthorizationHeader: !!asText(req.get("x-heart-authorization"))
    });
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return { ok: false, handled: true };
  }

  let decodedToken = null;
  try {
    decodedToken = await admin.auth().verifyIdToken(bearerToken, true);
  } catch {
    logFunctionWarn("heart.auth.request", {
      ...logContext,
      status: "unauthorized",
      reason: "invalid_bearer_token"
    });
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return { ok: false, handled: true };
  }

  const uid = asText(decodedToken?.uid);
  if (!uid) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return { ok: false, handled: true };
  }

  const profile = await loadUserProfile(db, uid);
  const user = {
    uid,
    email: asText(decodedToken?.email),
    emailVerified: decodedToken?.email_verified === true,
    displayName: asText(decodedToken?.name || decodedToken?.displayName),
    claims: decodedToken || {},
    isSuperadmin: await isSuperadminUid(db, uid)
  };
  if (!canAccessHeartAsCeo(user, profile || {})) {
    logFunctionWarn("heart.auth.request", {
      ...logContext,
      status: "forbidden",
      reason: "ceo_access_required",
      uid,
      email: asText(user.email),
      roles: normalizeRoleList(profile?.roles || profile?.role || "")
    });
    res.status(403).json({ ok: false, error: "CEO access required" });
    return { ok: false, handled: true };
  }

  return {
    ok: true,
    handled: false,
    authMode: "firebase-bearer",
    user,
    profile: profile || {}
  };
}

function createRunId(mode = "smoke") {
  const stamp = new Date().toISOString().replace(/[.:TZ-]/g, "").slice(0, 14);
  return `heart_${asText(mode, "run")}_${stamp}_${crypto.randomBytes(4).toString("hex")}`;
}

function createIncidentId() {
  return `incident_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

module.exports = {
  ALBERT_CEO_UID,
  ALBERT_CEO_ALIASES,
  ALBERT_CEO_EMAILS,
  HIDDEN_LEGACY_CEO_EMAILS,
  HEART_DEFAULT_REGION,
  asText,
  normalizeRoleList,
  normalizeEmailValue,
  normalizeHandleValue,
  normalizeStatus,
  normalizeSeverity,
  toIso,
  serializeFirestoreValue,
  resolveRuntimeConfig,
  readConfigValue,
  getWebhookSecret,
  getHeartBaseUrl,
  buildWebhookSignature,
  verifyWebhookSignature,
  sendCors,
  parseBearerToken,
  parseRequestJson,
  isCeoRole,
  hasTrustedCeoClaim,
  isAlbertCeoUser,
  hasGlobalCeoAccess,
  canAccessHeartAsCeo,
  loadUserProfile,
  isSuperadminUid,
  verifyCeoRequest,
  createRunId,
  createIncidentId
};
