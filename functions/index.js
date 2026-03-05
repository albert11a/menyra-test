"use strict";

const admin = require("firebase-admin");
const functions = require("firebase-functions");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const DEFAULT_SOCIAL_URL = "https://menyra.com/apps/menyra-social/";
const DEFAULT_ICON = "/apps/menyra-social/assets/menyra-social-logo.png";
const INVALID_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token"
]);

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function resolveNotificationTitle(data = {}) {
  return asText(
    data.title || data.user || data.userName || data.senderName || data.senderHandle,
    "Benachrichtigung"
  );
}

function resolveNotificationBody(data = {}) {
  const type = asText(data.type).toLowerCase();
  if (type === "chat_message") return asText(data.text, "Neue Nachricht");
  if (type === "chat_call") return asText(data.text, "Eingehender Audio-Anruf");
  return asText(data.text || data.body, "Neue Mitteilung");
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
        link
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
