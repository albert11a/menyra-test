"use strict";

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const crypto = require("crypto");

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
    sendMediaCors(res, req);
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "Method not allowed" });
      return;
    }

    const secret = resolveMediaActionTicketSecret();
    if (!secret) {
      res.status(500).json({ ok: false, error: "Media ticket secret missing" });
      return;
    }

    const bearerToken = parseBearerToken(req);
    if (!bearerToken) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    let decodedToken = null;
    try {
      decodedToken = await admin.auth().verifyIdToken(bearerToken, true);
    } catch {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const uid = asText(decodedToken?.uid);
    if (!uid) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const body = parseRequestJson(req);
    const action = asText(body.action).toLowerCase();
    if (!MEDIA_ACTIONS.has(action)) {
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
        res.status(400).json({ ok: false, error: "restaurantId required" });
        return;
      }
      if (isStoryUpload && ownerId === normalizeMediaOwnerId(uid)) {
        res.status(403).json({ ok: false, error: "Story upload requires business owner id" });
        return;
      }
      const authorized = await canUserManageOwnerId(uid, ownerId, { allowSelfOwner: isImageUpload });
      if (!authorized) {
        res.status(403).json({ ok: false, error: "Forbidden" });
        return;
      }
    }

    if (isStoryDelete) {
      videoId = normalizeMediaVideoId(body.videoId || "");
      if (!videoId) {
        res.status(400).json({ ok: false, error: "videoId required" });
        return;
      }
      const storyOwnerId = resolveStoryOwnerIdFromVideoKey(videoId);
      if (!storyOwnerId) {
        res.status(400).json({ ok: false, error: "Invalid videoId" });
        return;
      }
      if (ownerId && ownerId !== storyOwnerId) {
        res.status(403).json({ ok: false, error: "Forbidden" });
        return;
      }
      ownerId = storyOwnerId;
      const authorized = await canUserManageOwnerId(uid, ownerId, { allowSelfOwner: false });
      if (!authorized) {
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
  });

exports.socialBootstrapFeed = functions
  .region("us-central1")
  .https.onRequest(async (req, res) => {
    sendCors(res, req);
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "GET") {
      res.status(405).json({ ok: false, error: "Method not allowed" });
      return;
    }

    try {
      const [restaurantsSnap, feedSnap, storiesSnap] = await Promise.all([
        db.collection("restaurants").limit(120).get(),
        queryActiveFeed(16),
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
      res.status(200).json({
        ok: true,
        ts: Date.now(),
        data: {
          restaurants: restaurants.slice(0, 120),
          feedPosts: feedPosts.slice(0, 16),
          stories
        }
      });
    } catch (err) {
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

    const data = snap.data() || {};
    if (data.silent === true) return;

    const userId = asText(context.params?.userId);
    const notificationId = asText(context.params?.notificationId || snap.id);
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

    console.log("sendWebPushOnNotificationCreate", {
      userId,
      notificationId,
      tokens: tokens.length,
      success: response.successCount,
      failed: response.failureCount
    });
  });

const { migrateEmailsToMnyra } = require("./email-domain-migration");
exports.migrateEmailsToMnyra = migrateEmailsToMnyra;
