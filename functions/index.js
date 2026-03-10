"use strict";

const admin = require("firebase-admin");
const functions = require("firebase-functions");

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
