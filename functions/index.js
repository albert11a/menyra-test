"use strict";

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const Busboy = require("busboy");
const crypto = require("crypto");
const {
  buildHttpLogContext,
  buildCallableLogContext,
  buildEventLogContext,
  logFunctionInfo,
  logFunctionWarn,
  logFunctionError
} = require("./logging");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const DEFAULT_SOCIAL_URL = "https://menyra.com/apps/menyra-social/";
const DEFAULT_SOCIAL_PATH = "/apps/menyra-social/";
const DEFAULT_ICON = "/apps/menyra-social/assets/icon-192.png";
const INVALID_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token"
]);
const MEDIA_TICKET_VERSION = 1;
const MEDIA_ACTIONS = new Set(["image_upload", "story_upload", "story_delete"]);
const MEDIA_TICKET_DEFAULT_TTL_SECONDS = 120;
const MEDIA_TICKET_MAX_TTL_SECONDS = 600;
const BUNNY_DEFAULT_STREAM_LIBRARY_ID = "568747";
const BUNNY_DEFAULT_STORAGE_HOST = "storage.bunnycdn.com";
let runtimeConfigCache = null;

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function resolveNotificationActor(data = {}) {
  return asText(
    data.user || data.userName || data.senderName || data.senderHandle || data.userHandle,
    ""
  );
}

function resolveNotificationTitle(data = {}) {
  const customTitle = asText(process.env.MENYRA_PUSH_TITLE);
  return customTitle || "Menyra";
}

function resolveNotificationBody(data = {}) {
  const type = asText(data.type).toLowerCase();
  const actor = resolveNotificationActor(data);
  const text = asText(data.text || data.body);
  if (type === "chat_message") {
    if (actor && text) return `${actor} hat dir eine Nachricht geschickt: ${text}`;
    if (actor) return `${actor} hat dir eine Nachricht geschickt`;
    if (text) return `Neue Nachricht: ${text}`;
    return "Neue Nachricht";
  }
  if (actor && text) return `${actor} ${text}`;
  if (text) return text;
  return "Neue Mitteilung";
}

function resolveNotificationLink(data = {}) {
  const envUrl = asText(process.env.MENYRA_SOCIAL_URL);
  const deepLink = asText(data.link || data.url);
  const baseUrl = envUrl || DEFAULT_SOCIAL_URL;
  if (!deepLink) return baseUrl;
  try {
    return new URL(deepLink, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

function resolveNotificationClientLink(data = {}) {
  const deepLink = asText(data.link || data.url);
  if (!deepLink) return DEFAULT_SOCIAL_PATH;
  if (/^https?:\/\//i.test(deepLink)) {
    try {
      const parsed = new URL(deepLink);
      return `${parsed.pathname || DEFAULT_SOCIAL_PATH}${parsed.search || ""}${parsed.hash || ""}` || DEFAULT_SOCIAL_PATH;
    } catch {
      return DEFAULT_SOCIAL_PATH;
    }
  }
  if (deepLink.startsWith("/")) return deepLink;
  if (deepLink.startsWith("?")) return `${DEFAULT_SOCIAL_PATH}${deepLink}`;
  return `${DEFAULT_SOCIAL_PATH}${deepLink.replace(/^\.?\//, "")}`;
}

function hasActiveWaiterAccess(data = {}) {
  const permissions = data.permissions && typeof data.permissions === "object" ? data.permissions : {};
  const disabled = data.active === false || asText(data.status).toLowerCase() === "disabled";
  if (disabled) return false;
  return data.waiterAccess === true || permissions.waiterAccess === true;
}

async function loadWaiterStaffRecipients(restaurantId = "") {
  const safeRestaurantId = asText(restaurantId);
  if (!safeRestaurantId) return [];
  const staffRef = db.collection("restaurants").doc(safeRestaurantId).collection("staff");
  const settled = await Promise.allSettled([
    staffRef.where("waiterAccess", "==", true).get(),
    staffRef.where("permissions.waiterAccess", "==", true).get()
  ]);
  const docsById = new Map();
  let optimizedQueryWorked = false;
  settled.forEach((result) => {
    if (result.status !== "fulfilled") return;
    optimizedQueryWorked = true;
    result.value.forEach((docSnap) => {
      docsById.set(docSnap.id, docSnap);
    });
  });
  if (!optimizedQueryWorked) {
    const fullSnap = await staffRef.get();
    fullSnap.forEach((docSnap) => {
      docsById.set(docSnap.id, docSnap);
    });
  }
  return Array.from(docsById.values());
}

function buildRestaurantOrderWaiterLink(restaurantId, orderId) {
  const safeRestaurantId = encodeURIComponent(asText(restaurantId));
  const safeOrderId = encodeURIComponent(asText(orderId));
  return `/waiter/?restaurant=${safeRestaurantId}&order=${safeOrderId}`;
}

function buildRestaurantOrderNotificationPayload({
  restaurantId = "",
  orderId = "",
  orderData = {},
  restaurantData = {}
} = {}) {
  const businessName = asText(
    orderData.businessName
    || restaurantData.name
    || restaurantData.restaurantName,
    "Business"
  );
  const buyerName = asText(orderData.buyerName || orderData.contact?.name);
  const itemCount = Math.max(
    0,
    Number(
      orderData.itemCount
      || (Array.isArray(orderData.items) ? orderData.items.length : 0)
      || 0
    ) || 0
  );
  const body = buyerName
    ? `Neue Bestellung von ${buyerName}`
    : `Neue Bestellung mit ${itemCount || 1} Positionen`;
  return {
    type: "restaurant_order",
    user: businessName,
    text: body,
    body,
    avatar: asText(
      restaurantData.logoUrl
      || restaurantData.logo
      || orderData.businessAvatar,
      DEFAULT_ICON
    ),
    img: asText(
      restaurantData.logoUrl
      || restaurantData.logo
      || orderData.businessAvatar,
      DEFAULT_ICON
    ),
    ownerType: "restaurant",
    ownerId: asText(restaurantId),
    restaurantId: asText(restaurantId),
    orderId: asText(orderId),
    itemCount,
    read: false,
    link: buildRestaurantOrderWaiterLink(restaurantId, orderId),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
}

function addNotificationQuery(link, notificationId) {
  const safeNotificationId = asText(notificationId);
  if (!safeNotificationId) return asText(link, DEFAULT_SOCIAL_URL);
  try {
    const parsed = new URL(asText(link, DEFAULT_SOCIAL_URL), DEFAULT_SOCIAL_URL);
    if (!parsed.searchParams.get("notif")) {
      parsed.searchParams.set("notif", safeNotificationId);
    }
    return parsed.toString();
  } catch {
    const base = asText(link, DEFAULT_SOCIAL_URL);
    const glue = base.includes("?") ? "&" : "?";
    return `${base}${glue}notif=${encodeURIComponent(safeNotificationId)}`;
  }
}

function addNotificationQueryToClientLink(link, notificationId) {
  const safeLink = asText(link, DEFAULT_SOCIAL_PATH);
  const safeNotificationId = asText(notificationId);
  if (!safeNotificationId) return safeLink;
  if (/[?&]notif=/.test(safeLink)) return safeLink;
  const glue = safeLink.includes("?") ? "&" : "?";
  return `${safeLink}${glue}notif=${encodeURIComponent(safeNotificationId)}`;
}

function toMillis(value) {
  try {
    if (value && typeof value.toMillis === "function") return Number(value.toMillis()) || 0;
    if (value && typeof value.toDate === "function") return Number(value.toDate().getTime()) || 0;
  } catch {}
  if (value instanceof Date) return Number(value.getTime()) || 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeStoryName(value) {
  const text = asText(value);
  if (!text) return "";
  return text.toLowerCase() === "business" ? "" : text;
}

function extractStoryRestaurantId(docSnap, data = {}) {
  const direct = asText(data.restaurantId || data.rid);
  if (direct) return direct;
  let current = docSnap?.ref?.parent?.parent || null;
  while (current) {
    const parentId = asText(current?.parent?.id).toLowerCase();
    if (parentId === "restaurants") return asText(current.id);
    current = current?.parent?.parent || null;
  }
  return "";
}

function sendCors(res, req) {
  const origin = asText(req.get("origin"), "*");
  res.set("Access-Control-Allow-Origin", origin === "null" ? "*" : origin);
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

function sendMediaCors(res, req) {
  const origin = asText(req.get("origin"), "*");
  res.set("Access-Control-Allow-Origin", origin === "null" ? "*" : origin);
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

function normalizeMediaOwnerId(value) {
  return String(value || "")
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 80);
}

function normalizeMediaVideoId(value) {
  return String(value || "")
    .trim()
    .replace(/^\/+/, "");
}

function parseBearerToken(req) {
  const authHeader = asText(req.get("authorization"));
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? asText(match[1]) : "";
}

function parseRequestJson(req) {
  if (req?.body && typeof req.body === "object") return req.body;
  if (typeof req?.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

function resolveStoryOwnerIdFromVideoKey(videoId) {
  const safeVideoId = normalizeMediaVideoId(videoId);
  if (!safeVideoId.startsWith("stories/")) return "";
  const parts = safeVideoId.split("/").filter(Boolean);
  if (parts.length < 3) return "";
  return normalizeMediaOwnerId(parts[1]);
}

function createMediaActionTicket(payload, secret) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function resolveMediaTicketTtlSeconds() {
  const configured = Number(process.env.MEDIA_TICKET_TTL_SECONDS || MEDIA_TICKET_DEFAULT_TTL_SECONDS);
  if (!Number.isFinite(configured) || configured <= 0) return MEDIA_TICKET_DEFAULT_TTL_SECONDS;
  return Math.min(Math.max(Math.round(configured), 30), MEDIA_TICKET_MAX_TTL_SECONDS);
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

function requireEnvValue(name, value) {
  if (asText(value)) return;
  throw new functions.https.HttpsError(
    "failed-precondition",
    `Missing required env: ${name}`
  );
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function resolveBunnyConfigValue(key, envName, fallback = "") {
  const cfg = resolveRuntimeConfig();
  return asText(process.env[envName] || cfg?.bunny?.[key], fallback);
}

function resolveBunnyStreamLibraryId() {
  return resolveBunnyConfigValue("stream_library_id", "BUNNY_STREAM_LIBRARY_ID", BUNNY_DEFAULT_STREAM_LIBRARY_ID);
}

function resolveBunnyStreamApiKey() {
  return resolveBunnyConfigValue("stream_api_key", "BUNNY_STREAM_API_KEY");
}

function resolveBunnyStreamCdnHost() {
  return resolveBunnyConfigValue("stream_cdn_host", "BUNNY_STREAM_CDN_HOST");
}

function resolveBunnyStorageZone() {
  return resolveBunnyConfigValue("storage_zone", "BUNNY_STORAGE_ZONE", "menyra");
}

function resolveBunnyStorageAccessKey() {
  return resolveBunnyConfigValue("storage_access_key", "BUNNY_STORAGE_ACCESS_KEY");
}

function resolveBunnyStorageHost() {
  return resolveBunnyConfigValue("storage_host", "BUNNY_STORAGE_HOST", BUNNY_DEFAULT_STORAGE_HOST);
}

function resolveBunnyImagesCdnHost() {
  return resolveBunnyConfigValue("images_cdn_host", "BUNNY_IMAGES_CDN_HOST");
}

function isTruthyFlag(value) {
  return /^(1|true|yes|on)$/i.test(asText(value));
}

function isLegacyMediaEndpointEnabled() {
  const cfg = resolveRuntimeConfig();
  return isTruthyFlag(
    process.env.ENABLE_LEGACY_MEDIA_ENDPOINTS
    || cfg?.media?.enable_legacy_media_endpoints
    || cfg?.mnyra?.enable_legacy_media_endpoints
  );
}

async function verifyRequestUserFromBearerToken(req, flow, logContext = {}) {
  const bearerToken = parseBearerToken(req);
  if (!bearerToken) {
    logFunctionWarn(flow, {
      ...logContext,
      status: "unauthorized",
      reason: "missing_bearer_token"
    });
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  let decodedToken = null;
  try {
    decodedToken = await admin.auth().verifyIdToken(bearerToken, true);
  } catch {
    logFunctionWarn(flow, {
      ...logContext,
      status: "unauthorized",
      reason: "invalid_bearer_token"
    });
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const uid = asText(decodedToken?.uid);
  if (!uid) {
    logFunctionWarn(flow, {
      ...logContext,
      status: "unauthorized",
      reason: "missing_uid"
    });
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true, uid };
}

async function createBunnyStreamVideo({ title = "" } = {}) {
  const streamApiKey = resolveBunnyStreamApiKey();
  const streamLibraryId = resolveBunnyStreamLibraryId();
  requireEnvValue("BUNNY_STREAM_API_KEY", streamApiKey);

  const response = await fetch(`https://video.bunnycdn.com/library/${streamLibraryId}/videos`, {
    method: "POST",
    headers: {
      AccessKey: streamApiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title: asText(title, "Story Video") })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Bunny Stream create video failed (${response.status}): ${text}`);
  }

  const data = await response.json().catch(() => ({}));
  const guid = asText(data?.guid || data?.Guid || data?.id);
  if (!guid) {
    throw new Error("Bunny Stream returned no guid");
  }
  return guid;
}

function resolveMediaActionTicketSecret() {
  const fromEnv = asText(process.env.MEDIA_ACTION_TICKET_SECRET);
  if (fromEnv) return fromEnv;

  const cfg = resolveRuntimeConfig();
  return asText(
    cfg?.mnyra?.media_action_ticket_secret ||
    cfg?.media?.action_ticket_secret
  );
}

async function canUserManageOwnerId(uid, ownerId, { allowSelfOwner = false } = {}) {
  const safeUid = asText(uid);
  const safeOwnerId = normalizeMediaOwnerId(ownerId);
  if (!safeUid || !safeOwnerId) return false;

  if (allowSelfOwner && safeOwnerId === normalizeMediaOwnerId(safeUid)) {
    return true;
  }

  try {
    const restSnap = await db.collection("restaurants").doc(safeOwnerId).get();
    if (restSnap.exists) {
      const data = restSnap.data() || {};
      const createdByUid = asText(data.createdByUid);
      const ownerUid = asText(data.ownerUid || data.uid || data.userUid);
      const ceoParentUid = asText(data.ceoParentUid);
      const ceoPath = Array.isArray(data.ceoPath)
        ? data.ceoPath.map((item) => asText(item)).filter(Boolean)
        : [];
      if (createdByUid === safeUid || ownerUid === safeUid || ceoParentUid === safeUid || ceoPath.includes(safeUid)) {
        return true;
      }
    }
  } catch {
    return false;
  }

  try {
    const userSnap = await db.collection("users").doc(safeUid).get();
    if (userSnap.exists) {
      const data = userSnap.data() || {};
      const profileRestaurantId = normalizeMediaOwnerId(data.restaurantId || "");
      if (profileRestaurantId && profileRestaurantId === safeOwnerId) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

exports.getStreamUploadSignature = functions.https.onCall(async (data, context) => {
  const restaurantId = normalizeMediaOwnerId(data?.restaurantId || "");
  const title = asText(data?.title);
  const flow = "legacy.media.stream.callable";
  const logContext = buildCallableLogContext(context, {
    endpoint: "getStreamUploadSignature",
    restaurantId
  });

  if (!restaurantId) {
    logFunctionWarn(flow, {
      ...logContext,
      status: "invalid_argument",
      reason: "restaurant_id_missing"
    });
    throw new functions.https.HttpsError("invalid-argument", "restaurantId is required");
  }
  if (!isLegacyMediaEndpointEnabled()) {
    logFunctionWarn(flow, {
      ...logContext,
      status: "disabled"
    });
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Legacy media endpoint disabled. Use issueMediaActionTicket."
    );
  }

  const uid = asText(context?.auth?.uid);
  if (!uid) {
    logFunctionWarn(flow, {
      ...logContext,
      status: "unauthorized",
      reason: "missing_auth"
    });
    throw new functions.https.HttpsError("unauthenticated", "Authentication required");
  }

  const authorized = await canUserManageOwnerId(uid, restaurantId, { allowSelfOwner: false });
  if (!authorized) {
    logFunctionWarn(flow, {
      ...logContext,
      status: "forbidden",
      userId: uid
    });
    throw new functions.https.HttpsError("permission-denied", "Forbidden");
  }

  try {
    const streamApiKey = resolveBunnyStreamApiKey();
    const streamLibraryId = resolveBunnyStreamLibraryId();
    requireEnvValue("BUNNY_STREAM_API_KEY", streamApiKey);

    const videoId = await createBunnyStreamVideo({ title: title || "Story Video" });
    const expiration = Math.floor(Date.now() / 1000) + (60 * 60);
    const signature = sha256Hex(`${streamLibraryId}${streamApiKey}${expiration}${videoId}`);

    logFunctionInfo(flow, {
      ...logContext,
      status: "issued",
      userId: uid,
      videoId
    });

    return {
      videoId,
      tusEndpoint: "https://video.bunnycdn.com/tusupload",
      tusHeaders: {
        AuthorizationSignature: signature,
        AuthorizationExpire: String(expiration),
        LibraryId: String(streamLibraryId),
        VideoId: String(videoId)
      },
      streamCdnHost: resolveBunnyStreamCdnHost() || null
    };
  } catch (error) {
    logFunctionError(flow, error, {
      ...logContext,
      status: "failed",
      userId: uid
    });
    throw new functions.https.HttpsError("internal", "Legacy upload signature failed");
  }
});

exports.getStreamUploadSignatureHttp = functions.https.onRequest(async (req, res) => {
  const flow = "legacy.media.stream.http";
  const baseLogContext = buildHttpLogContext(req, {
    endpoint: "getStreamUploadSignatureHttp"
  });
  sendMediaCors(res, req);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  if (req.method !== "POST") {
    logFunctionWarn(flow, {
      ...baseLogContext,
      status: "method_not_allowed"
    });
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }
  if (!isLegacyMediaEndpointEnabled()) {
    logFunctionWarn(flow, {
      ...baseLogContext,
      status: "disabled"
    });
    res.status(410).json({ ok: false, error: "Legacy media endpoint disabled. Use issueMediaActionTicket." });
    return;
  }

  try {
    const body = parseRequestJson(req);
    const restaurantId = normalizeMediaOwnerId(body.restaurantId || "");
    const title = asText(body.title);
    const logContext = {
      ...baseLogContext,
      restaurantId
    };
    if (!restaurantId) {
      logFunctionWarn(flow, {
        ...logContext,
        status: "invalid_argument",
        reason: "restaurant_id_missing"
      });
      res.status(400).json({ ok: false, error: "restaurantId is required" });
      return;
    }

    const verifiedUser = await verifyRequestUserFromBearerToken(req, flow, logContext);
    if (!verifiedUser.ok) {
      res.status(verifiedUser.status).json({ ok: false, error: verifiedUser.error });
      return;
    }

    const authorized = await canUserManageOwnerId(verifiedUser.uid, restaurantId, { allowSelfOwner: false });
    if (!authorized) {
      logFunctionWarn(flow, {
        ...logContext,
        status: "forbidden",
        userId: verifiedUser.uid
      });
      res.status(403).json({ ok: false, error: "Forbidden" });
      return;
    }

    const streamApiKey = resolveBunnyStreamApiKey();
    const streamLibraryId = resolveBunnyStreamLibraryId();
    requireEnvValue("BUNNY_STREAM_API_KEY", streamApiKey);

    const videoId = await createBunnyStreamVideo({ title: title || "Story Video" });
    const expiration = Math.floor(Date.now() / 1000) + (60 * 60);
    const signature = sha256Hex(`${streamLibraryId}${streamApiKey}${expiration}${videoId}`);

    logFunctionInfo(flow, {
      ...logContext,
      status: "issued",
      userId: verifiedUser.uid,
      videoId
    });

    res.status(200).json({
      ok: true,
      videoId,
      tusEndpoint: "https://video.bunnycdn.com/tusupload",
      tusHeaders: {
        AuthorizationSignature: signature,
        AuthorizationExpire: String(expiration),
        LibraryId: String(streamLibraryId),
        VideoId: String(videoId)
      },
      streamCdnHost: resolveBunnyStreamCdnHost() || null
    });
  } catch (error) {
    logFunctionError(flow, error, {
      ...baseLogContext,
      status: "failed"
    });
    res.status(500).json({ ok: false, error: String(error?.message || error) });
  }
});

exports.uploadStoryImage = functions.https.onRequest(async (req, res) => {
  const flow = "legacy.media.story.upload";
  const baseLogContext = buildHttpLogContext(req, {
    endpoint: "uploadStoryImage"
  });
  sendMediaCors(res, req);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  if (req.method !== "POST") {
    logFunctionWarn(flow, {
      ...baseLogContext,
      status: "method_not_allowed"
    });
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }
  if (!isLegacyMediaEndpointEnabled()) {
    logFunctionWarn(flow, {
      ...baseLogContext,
      status: "disabled"
    });
    res.status(410).json({ ok: false, error: "Legacy media endpoint disabled. Use issueMediaActionTicket." });
    return;
  }

  try {
    const verifiedUser = await verifyRequestUserFromBearerToken(req, flow, baseLogContext);
    if (!verifiedUser.ok) {
      res.status(verifiedUser.status).json({ ok: false, error: verifiedUser.error });
      return;
    }

    const storageZone = resolveBunnyStorageZone();
    const storageAccessKey = resolveBunnyStorageAccessKey();
    const storageHost = resolveBunnyStorageHost();
    const imagesCdnHost = resolveBunnyImagesCdnHost();
    requireEnvValue("BUNNY_STORAGE_ZONE", storageZone);
    requireEnvValue("BUNNY_STORAGE_ACCESS_KEY", storageAccessKey);
    requireEnvValue("BUNNY_IMAGES_CDN_HOST", imagesCdnHost);

    const busboy = Busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: 12 * 1024 * 1024 }
    });

    let restaurantId = "";
    let fileName = "image";
    let fileMime = "application/octet-stream";
    const fileBuffers = [];

    busboy.on("field", (name, value) => {
      if (name === "restaurantId") {
        restaurantId = normalizeMediaOwnerId(value);
      }
    });

    busboy.on("file", (_name, file, info) => {
      fileName = asText(info?.filename, "image");
      fileMime = asText(info?.mimeType, "application/octet-stream");
      file.on("data", (chunk) => fileBuffers.push(chunk));
    });

    busboy.on("finish", async () => {
      const logContext = {
        ...baseLogContext,
        restaurantId
      };
      try {
        if (!restaurantId) {
          logFunctionWarn(flow, {
            ...logContext,
            status: "invalid_argument",
            reason: "restaurant_id_missing"
          });
          res.status(400).json({ ok: false, error: "restaurantId required" });
          return;
        }

        const authorized = await canUserManageOwnerId(verifiedUser.uid, restaurantId, { allowSelfOwner: false });
        if (!authorized) {
          logFunctionWarn(flow, {
            ...logContext,
            status: "forbidden",
            userId: verifiedUser.uid
          });
          res.status(403).json({ ok: false, error: "Forbidden" });
          return;
        }

        const ext = asText(fileName.split(".").pop(), "jpg").toLowerCase();
        const safeExt = ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext) ? ext : "jpg";
        const path = `stories/${restaurantId}/${Date.now()}.${safeExt}`;
        const body = Buffer.concat(fileBuffers);

        if (!body.length) {
          logFunctionWarn(flow, {
            ...logContext,
            status: "invalid_argument",
            reason: "missing_file"
          });
          res.status(400).json({ ok: false, error: "No file received" });
          return;
        }

        const uploadResponse = await fetch(`https://${storageHost}/${storageZone}/${path}`, {
          method: "PUT",
          headers: {
            AccessKey: storageAccessKey,
            "Content-Type": fileMime
          },
          body
        });

        if (!uploadResponse.ok) {
          const text = await uploadResponse.text().catch(() => "");
          logFunctionWarn(flow, {
            ...logContext,
            status: "upstream_failed",
            userId: verifiedUser.uid,
            upstreamStatus: uploadResponse.status
          });
          res.status(502).json({ ok: false, error: `Bunny upload failed (${uploadResponse.status}): ${text}` });
          return;
        }

        logFunctionInfo(flow, {
          ...logContext,
          status: "uploaded",
          userId: verifiedUser.uid,
          path
        });

        res.status(200).json({
          ok: true,
          url: `https://${imagesCdnHost}/${path}`,
          path
        });
      } catch (error) {
        logFunctionError(flow, error, {
          ...logContext,
          status: "failed",
          userId: verifiedUser.uid
        });
        if (!res.headersSent) {
          res.status(500).json({ ok: false, error: String(error?.message || error) });
        }
      }
    });

    busboy.on("error", (error) => {
      logFunctionError(flow, error, {
        ...baseLogContext,
        status: "invalid_request",
        userId: verifiedUser.uid
      });
      if (!res.headersSent) {
        res.status(400).json({ ok: false, error: String(error?.message || error) });
      }
    });

    req.pipe(busboy);
  } catch (error) {
    logFunctionError(flow, error, {
      ...baseLogContext,
      status: "failed"
    });
    res.status(500).json({ ok: false, error: String(error?.message || error) });
  }
});

async function queryActiveFeed(limitCount = 14) {
  try {
    return await db
      .collection("socialFeed")
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .limit(limitCount)
      .get();
  } catch {
    return db.collection("socialFeed").limit(limitCount).get();
  }
}

async function queryActiveStories(limitCount = 12) {
  try {
    return await db
      .collectionGroup("stories")
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .limit(limitCount)
      .get();
  } catch {
    return db.collectionGroup("stories").limit(limitCount).get();
  }
}

exports.issueMediaActionTicket = functions
  .region("us-central1")
  .https.onRequest(async (req, res) => {
    const flow = "media.ticket.issue";
    const baseLogContext = buildHttpLogContext(req, {
      endpoint: "issueMediaActionTicket"
    });
    sendMediaCors(res, req);
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      logFunctionWarn(flow, {
        ...baseLogContext,
        status: "method_not_allowed"
      });
      res.status(405).json({ ok: false, error: "Method not allowed" });
      return;
    }

    try {
      const secret = resolveMediaActionTicketSecret();
      if (!secret) {
        logFunctionWarn(flow, {
          ...baseLogContext,
          status: "misconfigured",
          reason: "missing_ticket_secret"
        });
        res.status(500).json({ ok: false, error: "Media ticket secret missing" });
        return;
      }

      const verifiedUser = await verifyRequestUserFromBearerToken(req, flow, baseLogContext);
      if (!verifiedUser.ok) {
        res.status(verifiedUser.status).json({ ok: false, error: verifiedUser.error });
        return;
      }
      const uid = verifiedUser.uid;

      const body = parseRequestJson(req);
      const action = asText(body.action).toLowerCase();
      const scopedLogContext = {
        ...baseLogContext,
        userId: uid,
        action
      };
      if (!MEDIA_ACTIONS.has(action)) {
        logFunctionWarn(flow, {
          ...scopedLogContext,
          status: "invalid_argument",
          reason: "invalid_action"
        });
        res.status(400).json({ ok: false, error: "Invalid action" });
        return;
      }

      let ownerId = normalizeMediaOwnerId(body.restaurantId || "");
      let videoId = "";
      const isImageUpload = action === "image_upload";
      const isStoryUpload = action === "story_upload";
      const isStoryDelete = action === "story_delete";

      if (isImageUpload || isStoryUpload) {
        if (!ownerId) {
          logFunctionWarn(flow, {
            ...scopedLogContext,
            status: "invalid_argument",
            reason: "restaurant_id_missing"
          });
          res.status(400).json({ ok: false, error: "restaurantId required" });
          return;
        }
        if (isStoryUpload && ownerId === normalizeMediaOwnerId(uid)) {
          logFunctionWarn(flow, {
            ...scopedLogContext,
            status: "forbidden",
            restaurantId: ownerId,
            reason: "story_upload_requires_business_owner"
          });
          res.status(403).json({ ok: false, error: "Story upload requires business owner id" });
          return;
        }
        const authorized = await canUserManageOwnerId(uid, ownerId, { allowSelfOwner: isImageUpload });
        if (!authorized) {
          logFunctionWarn(flow, {
            ...scopedLogContext,
            status: "forbidden",
            restaurantId: ownerId
          });
          res.status(403).json({ ok: false, error: "Forbidden" });
          return;
        }
      }

      if (isStoryDelete) {
        videoId = normalizeMediaVideoId(body.videoId || "");
        if (!videoId) {
          logFunctionWarn(flow, {
            ...scopedLogContext,
            status: "invalid_argument",
            reason: "video_id_missing"
          });
          res.status(400).json({ ok: false, error: "videoId required" });
          return;
        }
        const storyOwnerId = resolveStoryOwnerIdFromVideoKey(videoId);
        if (!storyOwnerId) {
          logFunctionWarn(flow, {
            ...scopedLogContext,
            status: "invalid_argument",
            reason: "invalid_video_id"
          });
          res.status(400).json({ ok: false, error: "Invalid videoId" });
          return;
        }
        if (ownerId && ownerId !== storyOwnerId) {
          logFunctionWarn(flow, {
            ...scopedLogContext,
            status: "forbidden",
            restaurantId: ownerId,
            reason: "story_owner_mismatch"
          });
          res.status(403).json({ ok: false, error: "Forbidden" });
          return;
        }
        ownerId = storyOwnerId;
        const authorized = await canUserManageOwnerId(uid, ownerId, { allowSelfOwner: false });
        if (!authorized) {
          logFunctionWarn(flow, {
            ...scopedLogContext,
            status: "forbidden",
            restaurantId: ownerId
          });
          res.status(403).json({ ok: false, error: "Forbidden" });
          return;
        }
      }

      const nowSeconds = Math.floor(Date.now() / 1000);
      const ttlSeconds = resolveMediaTicketTtlSeconds();
      const payload = {
        v: MEDIA_TICKET_VERSION,
        action,
        uid,
        ownerId,
        videoId: videoId || "",
        iat: nowSeconds,
        exp: nowSeconds + ttlSeconds,
        nonce: crypto.randomBytes(12).toString("base64url")
      };
      const ticket = createMediaActionTicket(payload, secret);

      logFunctionInfo(flow, {
        ...scopedLogContext,
        status: "issued",
        restaurantId: ownerId,
        videoId: videoId || ""
      });

      res.status(200).json({
        ok: true,
        ticket,
        expiresAt: payload.exp * 1000,
        action,
        restaurantId: ownerId,
        constraints: {
          maxImageMb: Number(process.env.MAX_IMAGE_MB || 15) || 15,
          maxStoryMb: Number(process.env.MAX_STORY_MB || 50) || 50,
          ttlSeconds
        }
      });
    } catch (error) {
      logFunctionError(flow, error, {
        ...baseLogContext,
        status: "failed"
      });
      res.status(500).json({ ok: false, error: "Media ticket request failed" });
    }
  });

exports.socialBootstrapFeed = functions
  .region("us-central1")
  .https.onRequest(async (req, res) => {
    const flow = "social.bootstrap.feed";
    const logContext = buildHttpLogContext(req, {
      endpoint: "socialBootstrapFeed"
    });
    sendCors(res, req);
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "GET") {
      logFunctionWarn(flow, {
        ...logContext,
        status: "method_not_allowed"
      });
      res.status(405).json({ ok: false, error: "Method not allowed" });
      return;
    }

    try {
      const FEED_BOOTSTRAP_LIMIT = 20;
      const [restaurantsSnap, feedSnap, storiesSnap] = await Promise.all([
        db.collection("restaurants").limit(120).get(),
        queryActiveFeed(FEED_BOOTSTRAP_LIMIT),
        queryActiveStories(16)
      ]);

      const restaurants = [];
      const restaurantMap = new Map();
      restaurantsSnap.forEach((docSnap) => {
        const data = docSnap.data() || {};
        const id = asText(docSnap.id);
        if (!id) return;
        const rest = {
          id,
          name: asText(data.name || data.restaurantName || data.displayName),
          restaurantName: asText(data.restaurantName || data.name),
          logoUrl: asText(data.logoUrl || data.logo || data.logoURL),
          city: asText(data.city),
          type: asText(data.type || data.customerType || data.category || data.kind || data.restaurantType)
        };
        restaurants.push(rest);
        restaurantMap.set(id, rest);
      });

      const feedPosts = [];
      feedSnap.forEach((docSnap) => {
        const data = docSnap.data() || {};
        const rid = asText(data.rid || data.restaurantId);
        if (!rid) return;
        const rest = restaurantMap.get(rid) || {};
        const mediaRow = Array.isArray(data.media) && data.media.length ? data.media[0] : null;
        feedPosts.push({
          id: asText(docSnap.id),
          restaurantId: rid,
          business: asText(data.businessName || data.restaurantName || rest.name || rest.restaurantName, "Business"),
          logo: asText(rest.logoUrl || rest.logo || data.logoUrl || data.logo || data.logoURL),
          location: asText(data.city || rest.city, "Prishtina"),
          content: asText(data.caption || data.captionShort),
          image: asText(data.thumbUrl || data.mediaUrl || mediaRow?.thumbUrl || mediaRow?.url || data.imageUrl || data.url),
          likes: Number(data.likesCount || data.likes || 0) || 0,
          comments: Number(data.commentsCount || data.comments || 0) || 0,
          createdAt: toMillis(data.createdAt),
          category: asText(data.postType, "food"),
          isLive: !!data.isLive,
          ownerType: "restaurant",
          ownerId: rid
        });
      });

      const storiesByRestaurant = new Map();
      storiesSnap.forEach((docSnap) => {
        const data = docSnap.data() || {};
        const status = asText(data.status, "active").toLowerCase();
        if (status && status !== "active" && status !== "live") return;
        if (data.active === false || data.isActive === false) return;
        const rid = extractStoryRestaurantId(docSnap, data);
        if (!rid || storiesByRestaurant.has(rid)) return;
        const rest = restaurantMap.get(rid) || {};
        const canonicalName = normalizeStoryName(rest.name || rest.restaurantName || rest.displayName || "");
        const sourceName = normalizeStoryName(data.businessName || data.restaurantName || "");
        const canonicalLogo = asText(rest.logoUrl || rest.logo || rest.logoURL);
        const sourceLogo = asText(data.logoUrl || data.logo);
        const media = asText(data.imageUrl || data.mediaUrl || data.videoUrl || data.embedUrl || data.url);
        const name = canonicalName || sourceName;
        const img = canonicalLogo || sourceLogo || media;
        if (!name || !img) return;
        storiesByRestaurant.set(rid, {
          id: rid,
          restaurantId: rid,
          name,
          img,
          isLive: data.isLive !== undefined ? !!data.isLive : true,
          createdAt: toMillis(data.createdAt)
        });
      });

      const stories = Array.from(storiesByRestaurant.values())
        .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
        .slice(0, 12)
        .map((row) => ({
          id: row.id,
          restaurantId: row.restaurantId,
          name: row.name,
          img: row.img,
          isLive: !!row.isLive
        }));

      res.set("Cache-Control", "public, max-age=30, s-maxage=90, stale-while-revalidate=180");
      logFunctionInfo(flow, {
        ...logContext,
        status: "served",
        restaurants: restaurants.length,
        feedPosts: feedPosts.length,
        stories: stories.length
      });
      res.status(200).json({
        ok: true,
        ts: Date.now(),
        data: {
          restaurants: restaurants.slice(0, 120),
          feedPosts: feedPosts.slice(0, FEED_BOOTSTRAP_LIMIT),
          stories
        }
      });
    } catch (err) {
      logFunctionError(flow, err, {
        ...logContext,
        status: "failed"
      });
      res.status(500).json({
        ok: false,
        error: asText(err?.message, "Bootstrap fetch failed")
      });
    }
  });

exports.sendWebPushOnNotificationCreate = functions
  .region("us-central1")
  .firestore.document("users/{userId}/notifications/{notificationId}")
  .onCreate(async (snap, context) => {
    if (!snap?.exists) return;

    const userId = asText(context.params?.userId);
    const notificationId = asText(context.params?.notificationId || snap.id);
    const logContext = buildEventLogContext(context, {
      userId,
      notificationId
    });

    try {
      const data = snap.data() || {};
      if (data.silent === true) return;
      if (!userId || !notificationId) return;

      const devicesSnap = await db
        .collection("users")
        .doc(userId)
        .collection("devices")
        .where("enabled", "==", true)
        .limit(30)
        .get();

      if (devicesSnap.empty) return;

      const tokenRefs = new Map();
      devicesSnap.forEach((docSnap) => {
        const token = asText(docSnap.get("token"));
        if (!token) return;
        if (!tokenRefs.has(token)) tokenRefs.set(token, []);
        tokenRefs.get(token).push(docSnap.ref);
      });

      const tokens = Array.from(tokenRefs.keys());
      if (!tokens.length) return;

      const title = resolveNotificationTitle(data);
      const body = resolveNotificationBody(data);
      const link = addNotificationQuery(resolveNotificationLink(data), notificationId);
      const clientLink = addNotificationQueryToClientLink(resolveNotificationClientLink(data), notificationId);
      const icon = asText(data.avatar || data.img, DEFAULT_ICON);

      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: {
          notificationId,
          userId,
          type: asText(data.type),
          userUid: asText(data.userUid || data.uid),
          ownerType: asText(data.ownerType),
          ownerId: asText(data.ownerId),
          postId: asText(data.postId),
          commentId: asText(data.commentId),
          link: clientLink
        },
        webpush: {
          fcmOptions: {
            link
          },
          notification: {
            title,
            body,
            icon,
            badge: icon,
            silent: false,
            vibrate: [180, 90, 180],
            renotify: true,
            tag: `menyra_notif_${notificationId}`
          }
        }
      });

      const cleanupWrites = [];
      response.responses.forEach((item, index) => {
        if (item.success) return;
        const errorCode = asText(item.error?.code);
        if (!INVALID_TOKEN_CODES.has(errorCode)) return;
        const token = tokens[index];
        const refs = tokenRefs.get(token) || [];
        refs.forEach((ref) => {
          cleanupWrites.push(ref.set({
            enabled: false,
            token: "",
            lastErrorCode: errorCode,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true }));
        });
      });

      if (cleanupWrites.length) {
        await Promise.allSettled(cleanupWrites);
      }

      logFunctionInfo("push.notification.dispatch", {
        ...logContext,
        status: "completed",
        tokens: tokens.length,
        success: response.successCount,
        failed: response.failureCount
      });
    } catch (error) {
      logFunctionError("push.notification.dispatch", error, {
        ...logContext,
        status: "failed"
      });
      throw error;
    }
  });

exports.notifyWaiterOnRestaurantOrderCreate = functions
  .region("us-central1")
  .firestore.document("restaurants/{restaurantId}/orders/{orderId}")
  .onCreate(async (snap, context) => {
    if (!snap?.exists) return;

    const restaurantId = asText(context.params?.restaurantId);
    const orderId = asText(context.params?.orderId || snap.id);
    const logContext = buildEventLogContext(context, {
      restaurantId,
      orderId
    });

    try {
      if (!restaurantId || !orderId) return;

      const orderData = snap.data() || {};
      const [restaurantSnap, staffDocs] = await Promise.all([
        db.collection("restaurants").doc(restaurantId).get(),
        loadWaiterStaffRecipients(restaurantId)
      ]);

      const restaurantData = restaurantSnap.exists ? (restaurantSnap.data() || {}) : {};
      const recipients = new Set();
      const ownerUid = asText(restaurantData.ownerUid);
      if (ownerUid) recipients.add(ownerUid);

      staffDocs.forEach((docSnap) => {
        if (!hasActiveWaiterAccess(docSnap.data() || {})) return;
        const uid = asText(docSnap.id);
        if (uid) recipients.add(uid);
      });

      if (!recipients.size) return;

      const payload = buildRestaurantOrderNotificationPayload({
        restaurantId,
        orderId,
        orderData,
        restaurantData
      });

      const writes = Array.from(recipients).map((uid) => (
        db
          .collection("users")
          .doc(uid)
          .collection("notifications")
          .doc(`restaurant_order_${orderId}`)
          .set({
            ...payload,
            userUid: uid
          }, { merge: true })
      ));

      await Promise.allSettled(writes);

      logFunctionInfo("waiter.order.notification", {
        ...logContext,
        status: "completed",
        recipients: recipients.size
      });
    } catch (error) {
      logFunctionError("waiter.order.notification", error, {
        ...logContext,
        status: "failed"
      });
      throw error;
    }
  });

const { migrateEmailsToMnyra } = require("./email-domain-migration");
exports.migrateEmailsToMnyra = migrateEmailsToMnyra;

Object.assign(exports, require("./heart"));
