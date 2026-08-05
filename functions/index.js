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
const { FieldValue } = require("firebase-admin/firestore");
const {
  OrderValidationError,
  normalizeCreateOrderInput,
  buildSecureRestaurantOrderPayload
} = require("./order-security");

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
const CLIENT_NOTIFICATION_ALLOWED_TYPES = new Set([
  "chat_message",
  "follow",
  "follow_request",
  "follow_accepted",
  "like",
  "comment"
]);
const PUSH_NOTIFICATION_ALLOWED_TYPES = new Set([
  "chat_message",
  "follow",
  "follow_request",
  "follow_accepted",
  "like",
  "comment",
  "restaurant_order"
]);
const NOTIFICATION_TEXT_MAX_CHARS = 280;
const NOTIFICATION_SHORT_TEXT_MAX_CHARS = 120;
const NOTIFICATION_LINK_MAX_CHARS = 1024;
const NOTIFICATION_DOC_ID_MAX_CHARS = 180;
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
    serverAuth: true,
    source: "server",
    createdByUid: "system",
    link: buildRestaurantOrderWaiterLink(restaurantId, orderId),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };
}

function normalizeCanonicalOrderStatusKey(value = "") {
  const key = asText(value).toLowerCase();
  if (!key || key === "neu" || key === "new" || key === "bestellung" || key === "pending" || key === "open") {
    return "bestellung";
  }
  if (key === "angenommen" || key === "accepted" || key === "arbeit" || key === "in_progress") {
    return "angenommen";
  }
  if (key === "fertig" || key === "ready" || key === "serviert" || key === "served") {
    return "fertig";
  }
  if (key === "archiv" || key === "archived" || key === "done" || key === "completed") {
    return "archiv";
  }
  return "bestellung";
}

function buildCanonicalOrderProjection({
  restaurantId = "",
  orderId = "",
  orderData = {}
} = {}) {
  const safeRestaurantId = asText(restaurantId);
  const safeOrderId = asText(orderId);
  const source = orderData && typeof orderData === "object" ? orderData : {};
  const guestLookupToken = asText(source.guestLookupToken || source.orderLookupToken);
  const guestSessionId = asText(source.guestSessionId);
  const statusRaw = asText(source.status || "Neu", "Neu");
  return {
    id: safeOrderId,
    restaurantId: safeRestaurantId || asText(source.restaurantId),
    businessName: asText(source.businessName),
    businessAvatar: asText(source.businessAvatar),
    buyerUid: asText(source.buyerUid),
    buyerName: asText(source.buyerName),
    buyerHandle: asText(source.buyerHandle),
    buyerAvatar: asText(source.buyerAvatar),
    contact: source.contact && typeof source.contact === "object" ? source.contact : {},
    tableNumber: Number(source.tableNumber || source.contact?.tableNumber || 0) || 0,
    tableLabel: asText(source.tableLabel || source.contact?.tableLabel),
    items: Array.isArray(source.items) ? source.items : [],
    itemCount: Number(source.itemCount || 0) || 0,
    total: Number(source.total || 0) || 0,
    status: statusRaw,
    statusKey: normalizeCanonicalOrderStatusKey(statusRaw),
    guestSessionId,
    guestLookupToken,
    orderLookupToken: guestLookupToken,
    createdAt: source.createdAt || source.createdAtClient || null,
    updatedAt: source.updatedAt || source.updatedAtClient || source.createdAt || null,
    createdAtClient: asText(source.createdAtClient),
    updatedAtClient: asText(source.updatedAtClient),
    canonicalPath: safeRestaurantId && safeOrderId
      ? `restaurants/${safeRestaurantId}/orders/${safeOrderId}`
      : "",
    mirroredAt: FieldValue.serverTimestamp(),
    source: "server"
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

function clampText(value, maxChars) {
  return asText(value).slice(0, Math.max(1, Number(maxChars) || 1));
}

function normalizeNotificationType(value) {
  return asText(value).toLowerCase();
}

function sanitizeNotificationDocId(notificationId = "", fallbackId = "") {
  const candidate = asText(notificationId, fallbackId);
  if (!candidate) return "";
  const safe = candidate
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, NOTIFICATION_DOC_ID_MAX_CHARS);
  return asText(safe);
}

function sanitizeNotificationIdSegment(value = "", maxChars = 72) {
  return asText(value)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, Math.max(8, Number(maxChars) || 8));
}

function resolvePostDocRef(ownerType = "", ownerId = "", postId = "") {
  const safeOwnerType = normalizeNotificationType(ownerType);
  const safeOwnerId = asText(ownerId);
  const safePostId = asText(postId);
  if (!safeOwnerId || !safePostId) return null;
  if (safeOwnerType === "user") {
    return db.collection("users").doc(safeOwnerId).collection("posts").doc(safePostId);
  }
  if (safeOwnerType === "restaurant") {
    return db.collection("restaurants").doc(safeOwnerId).collection("socialPosts").doc(safePostId);
  }
  return null;
}

async function assertPostNotificationTargetOwnership({
  ownerType = "",
  ownerId = "",
  targetUid = ""
} = {}) {
  const safeOwnerType = normalizeNotificationType(ownerType);
  const safeOwnerId = asText(ownerId);
  const safeTargetUid = asText(targetUid);
  if (!safeOwnerType || !safeOwnerId || !safeTargetUid) {
    throw new functions.https.HttpsError("permission-denied", "Post notification target is invalid.");
  }
  if (safeOwnerType === "user") {
    if (safeOwnerId !== safeTargetUid) {
      throw new functions.https.HttpsError("permission-denied", "Post notification target mismatch.");
    }
    return;
  }
  if (safeOwnerType === "restaurant") {
    const restaurantSnap = await db.collection("restaurants").doc(safeOwnerId).get();
    if (!restaurantSnap.exists) {
      throw new functions.https.HttpsError("permission-denied", "Restaurant notification owner not found.");
    }
    const restaurantData = restaurantSnap.data() || {};
    const ownerUid = asText(restaurantData.ownerUid || restaurantData.uid || restaurantData.userUid);
    if (!ownerUid || ownerUid !== safeTargetUid) {
      throw new functions.https.HttpsError("permission-denied", "Restaurant notification target mismatch.");
    }
    return;
  }
  throw new functions.https.HttpsError("permission-denied", "Unsupported post notification owner type.");
}

function resolveChatMessageIdFromNotification({
  notificationId = "",
  actorUid = "",
  payload = {}
} = {}) {
  const payloadMessageId = asText(payload?.messageId || payload?.chatMessageId);
  if (payloadMessageId) return payloadMessageId;
  const safeActorUid = asText(actorUid);
  const safeNotificationId = asText(notificationId);
  if (!safeActorUid || !safeNotificationId) return "";
  const prefix = `chat_${safeActorUid}_`;
  if (!safeNotificationId.startsWith(prefix)) return "";
  return asText(safeNotificationId.slice(prefix.length));
}

function buildExpectedNotificationId({
  type = "",
  actorUid = "",
  notificationId = "",
  payload = {}
} = {}) {
  const safeType = normalizeNotificationType(type);
  const safeActorUid = sanitizeNotificationIdSegment(actorUid);
  if (!safeType || !safeActorUid) return "";

  if (safeType === "follow_request") {
    return sanitizeNotificationDocId(`follow_request_${safeActorUid}`);
  }
  if (safeType === "follow") {
    return sanitizeNotificationDocId(`follow_${safeActorUid}`);
  }
  if (safeType === "follow_accepted") {
    return sanitizeNotificationDocId(`follow_accepted_${safeActorUid}`);
  }
  if (safeType === "like") {
    const ownerType = sanitizeNotificationIdSegment(normalizeNotificationType(payload?.ownerType), 24);
    const ownerId = sanitizeNotificationIdSegment(payload?.ownerId);
    const postId = sanitizeNotificationIdSegment(payload?.postId);
    if (!ownerType || !ownerId || !postId) return "";
    return sanitizeNotificationDocId(`like_${safeActorUid}_${ownerType}_${ownerId}_${postId}`);
  }
  if (safeType === "comment") {
    const ownerType = sanitizeNotificationIdSegment(normalizeNotificationType(payload?.ownerType), 24);
    const ownerId = sanitizeNotificationIdSegment(payload?.ownerId);
    const postId = sanitizeNotificationIdSegment(payload?.postId);
    const commentId = sanitizeNotificationIdSegment(payload?.commentId);
    if (!ownerType || !ownerId || !postId || !commentId) return "";
    return sanitizeNotificationDocId(`comment_${safeActorUid}_${ownerType}_${ownerId}_${postId}_${commentId}`);
  }
  if (safeType === "chat_message") {
    const messageId = sanitizeNotificationIdSegment(resolveChatMessageIdFromNotification({
      notificationId,
      actorUid,
      payload
    }));
    if (!messageId) return "";
    return sanitizeNotificationDocId(`chat_${safeActorUid}_${messageId}`);
  }
  return "";
}

function buildServerAuthNotificationPayload({
  type = "",
  actorUid = "",
  targetUid = "",
  payload = {}
} = {}) {
  const safeType = normalizeNotificationType(type);
  const safeActorUid = asText(actorUid);
  const safeTargetUid = asText(targetUid);
  const safePayload = payload && typeof payload === "object" ? payload : {};
  const safeOwnerType = normalizeNotificationType(safePayload.ownerType);
  const safeOwnerId = asText(safePayload.ownerId);
  const safePostId = asText(safePayload.postId);
  const safeCommentId = asText(safePayload.commentId);
  const safeRestaurantId = asText(safePayload.restaurantId);
  const safeMessageId = asText(safePayload.messageId || safePayload.chatMessageId);
  const safeUrl = clampText(safePayload.url, NOTIFICATION_LINK_MAX_CHARS);
  const safeLink = clampText(safePayload.link || safeUrl, NOTIFICATION_LINK_MAX_CHARS);
  const safeAvatar = clampText(safePayload.avatar || safePayload.img, NOTIFICATION_LINK_MAX_CHARS);
  const safeText = clampText(safePayload.text || safePayload.body, NOTIFICATION_TEXT_MAX_CHARS);
  const safeBody = clampText(safePayload.body || safePayload.text, NOTIFICATION_TEXT_MAX_CHARS);

  return {
    type: safeType,
    user: clampText(safePayload.user, NOTIFICATION_SHORT_TEXT_MAX_CHARS),
    userHandle: clampText(safePayload.userHandle || safePayload.senderHandle, NOTIFICATION_SHORT_TEXT_MAX_CHARS),
    userUid: safeActorUid,
    avatar: safeAvatar,
    img: safeAvatar,
    text: safeText,
    body: safeBody,
    ownerType: safeOwnerType,
    ownerId: safeOwnerId,
    postId: safePostId,
    commentId: safeCommentId,
    restaurantId: safeRestaurantId,
    messageId: safeMessageId,
    link: safeLink,
    url: safeUrl || safeLink,
    read: false,
    silent: safePayload.silent === true,
    serverAuth: true,
    source: "server",
    createdByUid: safeActorUid,
    targetUid: safeTargetUid,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp()
  };
}

async function assertFollowRequestNotificationAllowed({
  actorUid = "",
  targetUid = ""
} = {}) {
  if (!actorUid || !targetUid || actorUid === targetUid) {
    throw new functions.https.HttpsError("permission-denied", "Invalid follow request notification target.");
  }
  const followRequestRef = db
    .collection("users")
    .doc(targetUid)
    .collection("followRequests")
    .doc(actorUid);
  const followRequestSnap = await followRequestRef.get();
  if (!followRequestSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Follow request notification not authorized.");
  }
  const requestData = followRequestSnap.data() || {};
  if (asText(requestData.requesterUid) && asText(requestData.requesterUid) !== actorUid) {
    throw new functions.https.HttpsError("permission-denied", "Follow request actor mismatch.");
  }
}

async function assertFollowAcceptedNotificationAllowed({
  actorUid = "",
  targetUid = ""
} = {}) {
  if (!actorUid || !targetUid || actorUid === targetUid) {
    throw new functions.https.HttpsError("permission-denied", "Invalid follow accepted notification target.");
  }
  const followDocId = `user_${actorUid}`;
  const followRef = db
    .collection("users")
    .doc(targetUid)
    .collection("following")
    .doc(followDocId);
  const followSnap = await followRef.get();
  if (!followSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Follow accepted notification not authorized.");
  }
}

async function assertFollowNotificationAllowed({
  actorUid = "",
  targetUid = ""
} = {}) {
  if (!actorUid || !targetUid || actorUid === targetUid) {
    throw new functions.https.HttpsError("permission-denied", "Invalid follow notification target.");
  }
  const followDocId = `user_${targetUid}`;
  const followRef = db
    .collection("users")
    .doc(actorUid)
    .collection("following")
    .doc(followDocId);
  const followSnap = await followRef.get();
  if (!followSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Follow notification not authorized.");
  }
  const followData = followSnap.data() || {};
  if (asText(followData.targetType) && asText(followData.targetType) !== "user") {
    throw new functions.https.HttpsError("permission-denied", "Follow notification target type mismatch.");
  }
  if (asText(followData.targetId) && asText(followData.targetId) !== targetUid) {
    throw new functions.https.HttpsError("permission-denied", "Follow notification target mismatch.");
  }
}

async function assertPostLikeNotificationAllowed({
  actorUid = "",
  targetUid = "",
  payload = {}
} = {}) {
  const postRef = resolvePostDocRef(payload.ownerType, payload.ownerId, payload.postId);
  if (!postRef) {
    throw new functions.https.HttpsError("invalid-argument", "Like notification requires valid post ownership.");
  }
  await assertPostNotificationTargetOwnership({
    ownerType: payload.ownerType,
    ownerId: payload.ownerId,
    targetUid
  });
  const likeRef = postRef.collection("likes").doc(actorUid);
  const likeSnap = await likeRef.get();
  if (!likeSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Like notification not authorized.");
  }
  const likeData = likeSnap.data() || {};
  if (asText(likeData.uid) && asText(likeData.uid) !== actorUid) {
    throw new functions.https.HttpsError("permission-denied", "Like actor mismatch.");
  }
}

async function assertCommentNotificationAllowed({
  actorUid = "",
  targetUid = "",
  payload = {}
} = {}) {
  const postRef = resolvePostDocRef(payload.ownerType, payload.ownerId, payload.postId);
  const commentId = asText(payload.commentId);
  if (!postRef || !commentId) {
    throw new functions.https.HttpsError("invalid-argument", "Comment notification requires valid post/comment identifiers.");
  }
  await assertPostNotificationTargetOwnership({
    ownerType: payload.ownerType,
    ownerId: payload.ownerId,
    targetUid
  });
  const commentRef = postRef.collection("comments").doc(commentId);
  const commentSnap = await commentRef.get();
  if (!commentSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Comment notification not authorized.");
  }
  const commentData = commentSnap.data() || {};
  if (asText(commentData.uid) !== actorUid) {
    throw new functions.https.HttpsError("permission-denied", "Comment actor mismatch.");
  }
}

async function assertChatMessageNotificationAllowed({
  actorUid = "",
  targetUid = "",
  notificationId = "",
  payload = {}
} = {}) {
  if (!actorUid || !targetUid || actorUid === targetUid) {
    throw new functions.https.HttpsError("permission-denied", "Invalid chat notification target.");
  }
  const messageId = resolveChatMessageIdFromNotification({
    notificationId,
    actorUid,
    payload
  });
  if (!messageId) {
    throw new functions.https.HttpsError("invalid-argument", "Chat notification requires a message identifier.");
  }
  const messageRef = db
    .collection("users")
    .doc(targetUid)
    .collection("chatThreads")
    .doc(actorUid)
    .collection("messages")
    .doc(messageId);
  const messageSnap = await messageRef.get();
  if (!messageSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Chat notification not authorized.");
  }
  const messageData = messageSnap.data() || {};
  if (asText(messageData.senderUid) !== actorUid) {
    throw new functions.https.HttpsError("permission-denied", "Chat sender mismatch.");
  }
}

async function assertClientNotificationWriteAllowed({
  type = "",
  actorUid = "",
  targetUid = "",
  notificationId = "",
  payload = {}
} = {}) {
  const safeType = normalizeNotificationType(type);
  switch (safeType) {
    case "follow":
      await assertFollowNotificationAllowed({ actorUid, targetUid });
      return;
    case "follow_request":
      await assertFollowRequestNotificationAllowed({ actorUid, targetUid });
      return;
    case "follow_accepted":
      await assertFollowAcceptedNotificationAllowed({ actorUid, targetUid });
      return;
    case "like":
      await assertPostLikeNotificationAllowed({ actorUid, targetUid, payload });
      return;
    case "comment":
      await assertCommentNotificationAllowed({ actorUid, targetUid, payload });
      return;
    case "chat_message":
      await assertChatMessageNotificationAllowed({
        actorUid,
        targetUid,
        notificationId,
        payload
      });
      return;
    default:
      throw new functions.https.HttpsError("invalid-argument", "Unsupported notification type.");
  }
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

const RESERVED_PUBLIC_ROUTE_SEGMENTS = new Set([
  "b",
  "feed",
  "admin",
  "ceo",
  "owner",
  "staff",
  "waiter",
  "wr",
  "kitchen",
  "social",
  "heart",
  "hub",
  "apps",
  "api",
  "login",
  "register",
  "profile",
  "post",
  "posts",
  "story",
  "stories",
  "menu",
  "dashboard",
  "search",
  "discover",
  "map",
  "location",
  "user",
  "orders",
  "notifications",
  "settings",
  "upload",
  "leads",
  "customers",
  "business-accounts",
  "businessaccounts",
  "menyra-restaurants",
  "lp",
  "index.html",
  "manifest.webmanifest",
  "manifest.json",
  "sw.js",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "assets",
  "shared",
  "_shared",
  "core",
  "lead-landing"
]);

function safeLowerText(value = "") {
  return asText(value).toLowerCase();
}

function isBootstrapRestaurantPublicRecord(rest = {}) {
  const source = rest && typeof rest === "object" ? rest : {};
  if (source.deleted === true || source.isDeleted === true || source.hiddenFromDiscover === true) return false;
  if (source.deletedAt) return false;
  const status = safeLowerText(
    source.status
    || source.state
    || source.businessStatus
    || source.lifecycleStatus
    || ""
  );
  if (status === "deleted") return false;
  const visibility = safeLowerText(
    source.visibility
    || source.publicVisibility
    || source.discoveryVisibility
    || source.profileVisibility
    || ""
  );
  if (visibility === "hidden" || visibility === "private") return false;
  return true;
}

function isBootstrapMenuItemPubliclyVisible(item = {}) {
  const source = item && typeof item === "object" ? item : {};
  if (source.menuHidden === true || source.statusHidden === true || source.hidden === true || source.visible === false) {
    return false;
  }
  const menuVisibility = safeLowerText(source.menuVisibility || "");
  const statusVisibility = safeLowerText(source.statusVisibility || "");
  const visibility = safeLowerText(source.visibility || source.status || "");
  if (menuVisibility === "hidden" || statusVisibility === "hidden" || visibility === "hidden") {
    return false;
  }
  return true;
}

function normalizePublicRouteSlug(value = "") {
  let key = asText(value).toLowerCase();
  if (!key) return "";
  try {
    if (typeof key.normalize === "function") {
      key = key.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }
  } catch {}
  return key
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

function normalizePublicProfileTopTab(value = "", fallback = "profile") {
  const topTab = safeLowerText(value);
  if (topTab === "menu" || topTab === "karte" || topTab === "speisekarte" || topTab === "shop") return "menu";
  if (topTab === "qr" || topTab === "menuqr" || topTab === "scan-qr" || topTab === "scanqr") return "menu";
  if (topTab === "profile" || topTab === "posts" || topTab === "home" || topTab === "overview") return "profile";
  if (topTab === "landing" || topTab === "welcome" || topTab === "onboarding") return "landing";
  if (topTab === "cart" || topTab === "basket" || topTab === "warenkorb") return "cart";
  return safeLowerText(fallback) || "profile";
}

function isQrLikePublicAccessSource(value = "") {
  const source = safeLowerText(value);
  return source === "qr"
    || source === "qrcode"
    || source === "qr-code"
    || source === "menuqr"
    || source === "menu-qr"
    || source === "scanqr"
    || source === "scan-qr";
}

function normalizePathRestaurantSlug(value = "") {
  const raw = asText(value);
  if (!raw) return "";
  const stripped = raw.startsWith("@") ? raw.slice(1) : raw;
  if (!stripped || stripped.includes(".")) return "";
  const slug = normalizePublicRouteSlug(stripped);
  if (!slug || RESERVED_PUBLIC_ROUTE_SEGMENTS.has(slug)) return "";
  return slug;
}

function buildCanonicalPublicRoutePath(slugValue = "", topTab = "profile") {
  const safeSlug = normalizePathRestaurantSlug(slugValue);
  if (!safeSlug) return "";
  const safeTopTab = normalizePublicProfileTopTab(topTab, "profile");
  const basePath = `/${encodeURIComponent(safeSlug)}`;
  if (safeTopTab === "menu") return `${basePath}/menu`;
  return basePath;
}

function resolvePathPublicProfileRoute(rawPath = "") {
  const safePath = asText(rawPath).split("?")[0].split("#")[0].trim();
  if (!safePath) return { restaurantId: "", topTab: "", accessSource: "" };
  let segments = safePath.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  if (!segments.length) return { restaurantId: "", topTab: "", accessSource: "" };
  const appRootIndex = segments.findIndex((seg) => safeLowerText(seg) === "menyra-social");
  if (appRootIndex >= 0 && appRootIndex < segments.length - 1) {
    segments = segments.slice(appRootIndex + 1);
  }
  if (segments[0] && safeLowerText(segments[0]) === "index.html") {
    segments = segments.slice(1);
  }
  if (!segments.length) return { restaurantId: "", topTab: "", accessSource: "" };
  const usesLegacyPrefix = safeLowerText(segments[0]) === "b";
  const slug = normalizePathRestaurantSlug(usesLegacyPrefix ? segments[1] : segments[0]);
  const surfaceSegment = safeLowerText(usesLegacyPrefix ? segments[2] : segments[1]);
  if (slug) {
    if (!surfaceSegment) {
      return {
        restaurantId: slug,
        topTab: "profile",
        accessSource: ""
      };
    }
    if (surfaceSegment === "menu") {
      return {
        restaurantId: slug,
        topTab: "menu",
        accessSource: ""
      };
    }
    if (surfaceSegment === "posts" || surfaceSegment === "profile") {
      return {
        restaurantId: slug,
        topTab: "profile",
        accessSource: ""
      };
    }
    if (surfaceSegment === "qr") {
      return {
        restaurantId: slug,
        topTab: "menu",
        accessSource: "qr"
      };
    }
  }
  const tailSegments = segments.length > 2 ? segments.slice(-2) : segments.slice();
  const first = asText(tailSegments[0]);
  const second = asText(tailSegments[1]);
  const firstTopTab = normalizePublicProfileTopTab(first, "");
  const secondTopTab = normalizePublicProfileTopTab(second, "");
  const firstQrHint = isQrLikePublicAccessSource(first);
  const secondQrHint = isQrLikePublicAccessSource(second);
  const firstSlug = normalizePathRestaurantSlug(first);
  const secondSlug = normalizePathRestaurantSlug(second);
  if (tailSegments.length === 1 && firstSlug) {
    return {
      restaurantId: firstSlug,
      topTab: "profile",
      accessSource: ""
    };
  }
  if (tailSegments.length >= 2 && firstTopTab && secondSlug) {
    return {
      restaurantId: secondSlug,
      topTab: firstTopTab,
      accessSource: firstQrHint ? "qr" : ""
    };
  }
  if (tailSegments.length >= 2 && secondTopTab && firstSlug) {
    return {
      restaurantId: firstSlug,
      topTab: secondTopTab,
      accessSource: secondQrHint ? "qr" : ""
    };
  }
  return { restaurantId: "", topTab: "", accessSource: "" };
}

function resolveCountOrNull(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) continue;
    return Math.max(0, Math.round(numeric));
  }
  return null;
}

function normalizeBootstrapOrderIndex(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return Math.max(0, Number(fallback) || 0);
  return Math.max(0, Math.floor(numeric));
}

function normalizeExternalBootstrapUrl(value = "") {
  const raw = asText(value);
  if (!raw) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
}

function normalizeBootstrapMenuImage(value = "", depth = 0) {
  if (!value) return "";
  if (typeof value === "string") {
    const text = asText(value);
    if (!text) return "";
    const lower = text.toLowerCase();
    if (lower === "null" || lower === "undefined" || lower === "data") return "";
    if ((text.startsWith("{") && text.endsWith("}")) || (text.startsWith("[") && text.endsWith("]"))) {
      try {
        return normalizeBootstrapMenuImage(JSON.parse(text), depth + 1);
      } catch {
        return text;
      }
    }
    return text;
  }
  if (depth > 2 || typeof value !== "object") return "";
  const candidate = value.url
    || value.src
    || value.imageUrl
    || value.imageURL
    || value.image_url
    || value.imagePath
    || value.image_path
    || value.imageSrc
    || value.image_src
    || value.path
    || value.cdnUrl
    || value.cdnURL
    || value.downloadURL
    || value.downloadUrl
    || value.photoUrl
    || value.photoURL
    || value.photo_url
    || value.picture
    || value.pictureUrl
    || value.pictureURL
    || value.photo
    || value.img
    || value.imgUrl
    || value.imgURL
    || value.img_src
    || value.imgSrc
    || value.thumbnail
    || value.thumbnailUrl
    || value.thumbnailURL
    || value.thumb
    || value.original
    || value.file
    || value.fileUrl
    || value.fileURL
    || value.publicUrl
    || value.publicURL
    || value.secure_url
    || value.secureUrl;
  const resolved = normalizeBootstrapMenuImage(candidate, depth + 1);
  if (resolved) return resolved;
  for (const nested of Object.values(value)) {
    const next = normalizeBootstrapMenuImage(nested, depth + 1);
    if (next) return next;
  }
  return "";
}

function normalizeBootstrapCrossSellItemIds(value = "", { excludeId = "" } = {}) {
  const blocked = asText(excludeId);
  const seen = new Set();
  const push = (entry) => {
    if (entry === null || entry === undefined) return;
    if (Array.isArray(entry)) {
      entry.forEach(push);
      return;
    }
    const raw = typeof entry === "object"
      ? (entry.id || entry.itemId || entry.productId || entry.menuItemId || "")
      : entry;
    const str = asText(raw);
    if (!str) return;
    str.split(",").forEach((part) => {
      const next = asText(part);
      if (!next || next === blocked || seen.has(next)) return;
      seen.add(next);
    });
  };
  push(value);
  return Array.from(seen);
}

function normalizeBootstrapMenuItem(item = {}, restaurantId = "", index = 0) {
  const row = item && typeof item === "object" ? item : {};
  const safeRestaurantId = asText(restaurantId || row.restaurantId);
  const explicitId = asText(
    row.id
    || row.itemId
    || row.menuItemId
    || row.productId
  );
  const fallbackNameToken = normalizePublicRouteSlug(row.name || row.title || row.category || "item") || "item";
  const resolvedId = explicitId || `${fallbackNameToken}_${Math.max(0, Number(index) || 0)}`;
  const rawImageValues = [];
  [
    row.imageUrl,
    row.imageURL,
    row.image_url,
    row.image,
    row.photoUrl,
    row.photoURL,
    row.photo_url,
    row.img,
    row.imgUrl,
    row.imgURL,
    row.thumbnail,
    row.thumb,
    row.cover,
    row.coverUrl,
    row.coverURL
  ].forEach((entry) => {
    if (entry !== null && entry !== undefined) rawImageValues.push(entry);
  });
  [
    row.imageUrls,
    row.images,
    row.gallery,
    row.photos,
    row.media,
    row.mediaUrls,
    row.photoUrls,
    row.pictureUrls
  ].forEach((list) => {
    if (Array.isArray(list)) rawImageValues.push(...list);
    else if (list !== null && list !== undefined) rawImageValues.push(list);
  });
  const imageUrls = Array.from(new Set(rawImageValues
    .map((entry) => normalizeBootstrapMenuImage(entry))
    .filter(Boolean)));
  const imageUrl = asText(row.imageUrl || imageUrls[0]);
  const menuSectionRaw = safeLowerText(row.menuSection || row.displaySection || row.menuPlacement || "");
  const typeRaw = safeLowerText(row.type || row.menuType || row.kind || row.group || row.section || "");
  const normalizedType = typeRaw === "drink" ? "drink" : "food";
  const menuSection = menuSectionRaw === "drink" || menuSectionRaw === "food"
    ? menuSectionRaw
    : normalizedType;
  const orderIndex = normalizeBootstrapOrderIndex(
    row.orderIndex ?? row.sortOrder ?? row.position ?? row.rank,
    index
  );
  const statusVisibilityRaw = safeLowerText(row.statusVisibility || "");
  const visibilityRaw = safeLowerText(row.visibility || row.status || "");
  const statusHidden = row.statusHidden === true
    || statusVisibilityRaw === "hidden"
    || row.hidden === true
    || row.visible === false
    || visibilityRaw === "hidden";
  const menuVisibilityRaw = safeLowerText(row.menuVisibility || "");
  const hidden = row.menuHidden === true || menuVisibilityRaw === "hidden";
  const specialSizeRaw = safeLowerText(row.specialSize || row.specialCardSize || "");
  const specialActionPayload = row.specialAction && typeof row.specialAction === "object"
    ? row.specialAction
    : {};
  const specialActionTypeRaw = safeLowerText(
    row.specialActionType
    || row.actionType
    || specialActionPayload.type
    || ""
  );
  const specialActionType = specialActionTypeRaw === "link" || specialActionTypeRaw === "product"
    ? specialActionTypeRaw
    : "self";
  const stockRaw = row.stock ?? row.stockCount ?? row.inventory ?? row.quantity ?? null;
  const stockNumber = Number(stockRaw);
  return {
    id: resolvedId,
    restaurantId: safeRestaurantId,
    type: normalizedType,
    menuSection,
    orderIndex,
    category: asText(row.category, "Sonstiges"),
    name: asText(row.name || row.title, "Produkt"),
    description: asText(row.description || row.desc),
    ingredients: asText(row.ingredients || row.ingredient || row.inhaltsstoffe),
    longDescription: asText(row.longDescription),
    allergens: asText(row.allergens || row.allergen),
    brand: asText(row.brand || row.manufacturer),
    sku: asText(row.sku || row.articleNumber || row.articleNo || row.code),
    stock: stockRaw === null || stockRaw === undefined || asText(stockRaw) === ""
      ? null
      : (Number.isFinite(stockNumber) ? Math.max(0, Math.round(stockNumber)) : null),
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    cropX: Number.isFinite(Number(row.cropX)) ? Number(row.cropX) : 50,
    cropY: Number.isFinite(Number(row.cropY)) ? Number(row.cropY) : 50,
    price: row.price ?? "",
    available: row.available !== false,
    hidden,
    statusHidden,
    statusVisibility: statusHidden ? "hidden" : "auto",
    cardStyle: asText(row.cardStyle || row.menuCardStyle || row.cardLayout || row.layoutStyle),
    specialSize: specialSizeRaw === "food" ? "food" : "default",
    specialActionType,
    specialActionUrl: specialActionType === "link"
      ? asText(row.specialActionUrl || row.linkUrl || row.actionUrl || specialActionPayload.url)
      : "",
    specialActionProductId: specialActionType === "product"
      ? asText(row.specialActionProductId || row.targetProductId || row.productId || specialActionPayload.productId)
      : "",
    crossSellItemIds: normalizeBootstrapCrossSellItemIds(
      row.crossSellItemIds
      || row.crossSellIds
      || row.crossSellProducts
      || row.crossSelling
      || row.crossSell,
      { excludeId: resolvedId }
    ),
    woltUrl: normalizeExternalBootstrapUrl(
      row.woltUrl
      || row.woltLink
      || row.woltURL
      || row.deliveryUrl
      || row.deliveryURL
      || ""
    ),
    imageUrl,
    imageUrls
  };
}

function coerceBootstrapMenuItemsFromData(data = {}) {
  const source = data && typeof data === "object" ? data : {};
  const directList = source.items || source.menu || source.menuItems || source.products || source.data || [];
  if (Array.isArray(directList)) return directList;
  if (directList && typeof directList === "object") {
    return Object.values(directList);
  }
  return [];
}

function normalizePublicRouteTruthState(value = "", fallback = "unknown") {
  const truth = safeLowerText(value);
  if (truth === "seeded") return "seeded";
  if (truth === "knownempty" || truth === "known-empty") return "knownEmpty";
  if (truth === "unknown") return "unknown";
  const fallbackTruth = safeLowerText(fallback);
  if (fallbackTruth === "seeded") return "seeded";
  if (fallbackTruth === "knownempty" || fallbackTruth === "known-empty") return "knownEmpty";
  return "unknown";
}

function buildPublicRouteTruthSection({
  state = "unknown",
  count = 0,
  items = [],
  extras = {}
} = {}) {
  const truthState = normalizePublicRouteTruthState(state, "unknown");
  const list = Array.isArray(items) ? items : [];
  const safeCount = Math.max(0, Number(count) || 0);
  return {
    state: truthState,
    seeded: truthState === "seeded",
    knownEmpty: truthState === "knownEmpty",
    unknown: truthState === "unknown",
    count: safeCount,
    items: list,
    ...(extras && typeof extras === "object" ? extras : {})
  };
}

async function queryPublicMenuItemsForRestaurant(restaurantId = "", { limitCount = 56 } = {}) {
  const safeRestaurantId = asText(restaurantId);
  const safeLimit = Math.max(1, Number(limitCount) || 56);
  if (!safeRestaurantId) {
    return {
      state: "unknown",
      items: [],
      count: 0,
      updatedAt: 0
    };
  }
  try {
    const snap = await db
      .collection("restaurants")
      .doc(safeRestaurantId)
      .collection("public")
      .doc("menu")
      .get();
    if (!snap.exists) {
      return {
        state: "knownEmpty",
        items: [],
        count: 0,
        updatedAt: 0
      };
    }
    const raw = coerceBootstrapMenuItemsFromData(snap.data() || {});
    const normalized = raw
      .map((item, index) => normalizeBootstrapMenuItem(item, safeRestaurantId, index))
      .filter((item) => isBootstrapMenuItemPubliclyVisible(item))
      .sort((a, b) => normalizeBootstrapOrderIndex(a?.orderIndex) - normalizeBootstrapOrderIndex(b?.orderIndex));
    const count = normalized.length;
    const limitedItems = normalized.slice(0, safeLimit);
    const data = snap.data() || {};
    const updatedAt = Math.max(
      0,
      toMillis(data.updatedAt || data.lastUpdatedAt || data.ts || data.modifiedAt || 0)
    );
    return {
      state: count > 0 ? "seeded" : "knownEmpty",
      items: limitedItems,
      count,
      updatedAt
    };
  } catch {
    return {
      state: "unknown",
      items: [],
      count: 0,
      updatedAt: 0
    };
  }
}

async function queryPublicMenuMetaForRestaurant(restaurantId = "") {
  const safeRestaurantId = asText(restaurantId);
  if (!safeRestaurantId) {
    return { statusBadgeVisible: true };
  }
  try {
    const snap = await db
      .collection("restaurants")
      .doc(safeRestaurantId)
      .collection("public")
      .doc("meta")
      .get();
    if (!snap.exists) {
      return { statusBadgeVisible: true };
    }
    const data = snap.data() || {};
    if (typeof data.menuStatusBadgeVisible === "boolean") {
      return { statusBadgeVisible: data.menuStatusBadgeVisible };
    }
    if (typeof data.menuAvailabilityBadgeVisible === "boolean") {
      return { statusBadgeVisible: data.menuAvailabilityBadgeVisible };
    }
    return { statusBadgeVisible: true };
  } catch {
    return { statusBadgeVisible: true };
  }
}

async function queryPublicPostsForRestaurant(restaurantId = "", limitCount = 12) {
  const safeRestaurantId = asText(restaurantId);
  const safeLimit = Math.max(1, Number(limitCount) || 12);
  if (!safeRestaurantId) {
    return {
      state: "unknown",
      items: [],
      count: 0,
      updatedAt: 0
    };
  }
  const ref = db.collection("restaurants").doc(safeRestaurantId).collection("socialPosts");
  try {
    let snap = null;
    try {
      snap = await ref
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .limit(safeLimit)
        .get();
    } catch {
      try {
        snap = await ref
          .orderBy("createdAt", "desc")
          .limit(safeLimit)
          .get();
      } catch {
        snap = await ref.limit(safeLimit).get();
      }
    }
    const posts = [];
    let maxUpdatedAt = 0;
    if (snap && typeof snap.forEach === "function") {
      snap.forEach((docSnap) => {
        const row = docSnap.data() || {};
        const normalized = mapPublicRoutePostSeed({
          docId: docSnap.id,
          data: row,
          restaurantId: safeRestaurantId
        });
        if (!normalized) return;
        posts.push(normalized);
        maxUpdatedAt = Math.max(
          maxUpdatedAt,
          toMillis(
            row.updatedAt
            || row.modifiedAt
            || row.createdAt
            || 0
          )
        );
      });
    }
    return {
      state: posts.length > 0 ? "seeded" : "knownEmpty",
      items: posts,
      count: posts.length,
      updatedAt: maxUpdatedAt
    };
  } catch {
    return {
      state: "unknown",
      items: [],
      count: 0,
      updatedAt: 0
    };
  }
}

function normalizePublicRouteFocusItem(item = {}, fallbackId = "") {
  const source = item && typeof item === "object" ? item : {};
  const id = asText(source.id || source._id || fallbackId);
  if (!id) return null;
  return {
    id,
    title: asText(source.title || source.name || "Sot ne Fokus", "Sot ne Fokus"),
    text: asText(source.text || source.desc || source.description),
    imageUrl: asText(source.imageUrl || source.image || source.photoUrl),
    cropX: Number.isFinite(Number(source.cropX)) ? Number(source.cropX) : 50,
    cropY: Number.isFinite(Number(source.cropY)) ? Number(source.cropY) : 50,
    active: source.active !== false
  };
}

async function queryPublicFocusSeedForRestaurant(restaurantId = "", { limitCount = 8 } = {}) {
  const safeRestaurantId = asText(restaurantId);
  const safeLimit = Math.max(1, Number(limitCount) || 8);
  if (!safeRestaurantId) {
    return {
      state: "unknown",
      items: [],
      count: 0,
      enabled: true,
      updatedAt: 0
    };
  }
  let enabled = true;
  let metaUpdatedAt = 0;
  try {
    const metaSnap = await db
      .collection("restaurants")
      .doc(safeRestaurantId)
      .collection("public")
      .doc("meta")
      .get();
    if (metaSnap.exists) {
      const data = metaSnap.data() || {};
      if (typeof data.offersEnabled === "boolean") {
        enabled = data.offersEnabled;
      }
      metaUpdatedAt = Math.max(
        0,
        toMillis(data.updatedAt || data.lastUpdatedAt || data.ts || data.modifiedAt || 0)
      );
    }
  } catch {}
  try {
    const offersSnap = await db
      .collection("restaurants")
      .doc(safeRestaurantId)
      .collection("public")
      .doc("offers")
      .get();
    if (!offersSnap.exists) {
      return {
        state: "knownEmpty",
        items: [],
        count: 0,
        enabled,
        updatedAt: metaUpdatedAt
      };
    }
    const data = offersSnap.data() || {};
    const rawItems = Array.isArray(data.items) ? data.items : [];
    const normalizedItems = rawItems
      .map((row, index) => normalizePublicRouteFocusItem(row, `focus_${index}`))
      .filter(Boolean)
      .filter((row) => row.active !== false)
      .slice(0, safeLimit);
    const updatedAt = Math.max(
      metaUpdatedAt,
      toMillis(data.updatedAt || data.lastUpdatedAt || data.ts || data.modifiedAt || 0)
    );
    return {
      state: normalizedItems.length > 0 ? "seeded" : "knownEmpty",
      items: normalizedItems,
      count: normalizedItems.length,
      enabled,
      updatedAt
    };
  } catch {
    return {
      state: "unknown",
      items: [],
      count: 0,
      enabled,
      updatedAt: metaUpdatedAt
    };
  }
}

function resolveMenuLayoutColorFromRestaurant(data = {}) {
  const source = data && typeof data === "object" ? data : {};
  return safeLowerText(
    source.menuCardColor
    || source.menuLayoutColor
    || source.menuLayout?.cardColor
    || source.layout?.menuCardColor
    || source.menu?.cardColor
    || "white"
  ) || "white";
}

async function findBootstrapPublicSlugConflictDoc(slugValue = "", { restaurantId = "" } = {}) {
  const safeSlugValue = normalizePublicRouteSlug(slugValue);
  const safeRestaurantId = asText(restaurantId);
  if (!safeSlugValue) return null;
  try {
    const routeSnap = await db.collection("publicRoutes").doc(safeSlugValue).get();
    if (routeSnap.exists) {
      const routeData = routeSnap.data() || {};
      const routeRestaurantId = asText(routeData.restaurantId || routeData.canonicalRestaurantId);
      if (!routeRestaurantId || routeRestaurantId !== safeRestaurantId) {
        return {
          id: routeRestaurantId || `publicRoutes/${safeSlugValue}`,
          data: routeData,
          source: "publicRoutes"
        };
      }
    }
  } catch {}
  const fields = ["publicSlug", "landingSlug", "handle"];
  for (const fieldName of fields) {
    try {
      const snap = await db
        .collection("restaurants")
        .where(fieldName, "==", safeSlugValue)
        .limit(3)
        .get();
      const first = (snap.docs || []).find((docSnap) => asText(docSnap.id) !== safeRestaurantId) || null;
      if (!first?.id) continue;
      return {
        id: asText(first.id),
        data: first.data() || {},
        source: `restaurants.${fieldName}`
      };
    } catch {}
  }
  return null;
}

async function resolveBootstrapPublicSlugUnique(restaurantId = "", data = {}, routeLookupId = "") {
  const safeRestaurantId = asText(restaurantId);
  const source = data && typeof data === "object" ? data : {};
  const routeSlugCandidate = safeRestaurantId && asText(routeLookupId) === safeRestaurantId
    ? ""
    : normalizePublicRouteSlug(routeLookupId);
  const baseCandidate = normalizePublicRouteSlug(
    source.publicSlug
    || source.landingSlug
    || source.handle
    || routeSlugCandidate
    || source.name
    || source.restaurantName
    || source.displayName
    || safeRestaurantId
    || "business"
  ) || "business";
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const candidate = normalizePublicRouteSlug(
      attempt === 0
        ? baseCandidate
        : `${baseCandidate}-${attempt + 1}`
    );
    if (!candidate || RESERVED_PUBLIC_ROUTE_SEGMENTS.has(candidate)) continue;
    const conflict = await findBootstrapPublicSlugConflictDoc(candidate, { restaurantId: safeRestaurantId });
    if (!conflict) return candidate;
  }
  throw new Error("No unique public route slug available.");
}

async function ensureBootstrapRestaurantPublicRouteMeta(restaurantId = "", data = {}, {
  routeLookupId = "",
  allowWrite = true
} = {}) {
  const safeRestaurantId = asText(restaurantId);
  const source = data && typeof data === "object" ? data : {};
  if (!safeRestaurantId) {
    return {
      data: source,
      publicSlug: "",
      canonicalPublicPath: ""
    };
  }
  const resolvedPublicSlug = normalizePathRestaurantSlug(source.publicSlug)
    || await resolveBootstrapPublicSlugUnique(safeRestaurantId, source, routeLookupId);
  const canonicalPublicPath = buildCanonicalPublicRoutePath(resolvedPublicSlug, "profile");
  const nextLandingSlug = asText(source.landingSlug || resolvedPublicSlug);
  const nextData = {
    ...source,
    publicSlug: resolvedPublicSlug,
    landingSlug: nextLandingSlug,
    canonicalPublicPath,
    landingRestaurantId: asText(source.landingRestaurantId || safeRestaurantId)
  };
  const needsWrite = asText(source.publicSlug) !== resolvedPublicSlug
    || asText(source.canonicalPublicPath) !== nextData.canonicalPublicPath
    || (!asText(source.landingSlug) && !!nextLandingSlug)
    || (!asText(source.landingRestaurantId) && !!nextData.landingRestaurantId);
  if (needsWrite && allowWrite) {
    try {
      await db.collection("restaurants").doc(safeRestaurantId).set({
        publicSlug: resolvedPublicSlug,
        landingSlug: nextLandingSlug,
        canonicalPublicPath: nextData.canonicalPublicPath,
        landingRestaurantId: nextData.landingRestaurantId,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    } catch {}
  }
  return {
    data: nextData,
    publicSlug: resolvedPublicSlug,
    canonicalPublicPath: nextData.canonicalPublicPath
  };
}

function resolveRouteStatusForRestaurant(data = {}) {
  const source = data && typeof data === "object" ? data : {};
  const status = safeLowerText(
    source.status
    || source.state
    || source.businessStatus
    || source.lifecycleStatus
    || ""
  );
  if (status === "active" || status === "kunde" || status === "customer") return "active";
  if (status === "preview" || status === "demo" || status === "testphase") return "preview";
  if (status === "lead" || status === "prospect" || status === "registered" || status === "contacted" || status === "pending") {
    return "lead";
  }
  if (status === "inactive" || status === "disabled" || status === "deleted" || status === "blocked") return "";
  return "";
}

function buildNumberedPublicRouteSlug(baseSlug = "", attempt = 0) {
  const safeBase = normalizePathRestaurantSlug(baseSlug);
  if (!safeBase) return "";
  return normalizePathRestaurantSlug(attempt === 0 ? safeBase : `${safeBase}-${attempt + 1}`);
}

function publicRouteData(routeDocOrData = {}) {
  if (routeDocOrData && typeof routeDocOrData.data === "function") {
    return routeDocOrData.data() || {};
  }
  return routeDocOrData && typeof routeDocOrData === "object" ? routeDocOrData : {};
}

function routeBelongsToSameRestaurant(routeDocOrData = {}, restaurantId = "") {
  const safeRestaurantId = asText(restaurantId);
  if (!safeRestaurantId) return false;
  const routeData = publicRouteData(routeDocOrData);
  const routeRestaurantId = asText(routeData.restaurantId || routeData.canonicalRestaurantId);
  return !!routeRestaurantId && routeRestaurantId === safeRestaurantId;
}

function extractSlugFromCanonicalPublicPath(pathValue = "") {
  const raw = asText(pathValue).replace(/^https?:\/\/[^/]+/i, "");
  const firstSegment = raw.split(/[?#]/)[0].split("/").filter(Boolean)[0] || "";
  try {
    return normalizePathRestaurantSlug(decodeURIComponent(firstSegment));
  } catch {
    return normalizePathRestaurantSlug(firstSegment);
  }
}

function uniquePublicRouteSlugCandidates(values = []) {
  const seen = new Set();
  const out = [];
  values.forEach((value) => {
    const slug = normalizePathRestaurantSlug(value);
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    out.push(slug);
  });
  return out;
}

function restaurantRouteSlugCandidates(source = {}) {
  return uniquePublicRouteSlugCandidates([
    source.publicSlug,
    source.landingSlug,
    source.handle,
    extractSlugFromCanonicalPublicPath(source.canonicalPublicPath)
  ]);
}

function buildMissingPublicRoutePatch({ slug = "", restaurantId = "", routeData = {}, routeStatus = "", restaurantStatus = "" } = {}) {
  const patch = {};
  if (!asText(routeData.restaurantId)) patch.restaurantId = asText(restaurantId);
  if (!asText(routeData.canonicalSlug)) patch.canonicalSlug = asText(slug);
  if (!asText(routeData.status) && asText(routeStatus)) patch.status = safeLowerText(routeStatus);
  if (!asText(routeData.restaurantStatus) && asText(restaurantStatus)) patch.restaurantStatus = asText(restaurantStatus);
  return patch;
}

async function mergeMissingPublicRouteMetadata({
  slug = "",
  restaurantId = "",
  routeStatus = "",
  restaurantStatus = "",
  routeRef = null,
  routeData = {}
} = {}) {
  const safeSlug = normalizePathRestaurantSlug(slug);
  if (!safeSlug || !routeBelongsToSameRestaurant(routeData, restaurantId)) {
    return { slug: safeSlug, action: "skipped" };
  }
  const patch = buildMissingPublicRoutePatch({
    slug: safeSlug,
    restaurantId,
    routeData,
    routeStatus,
    restaurantStatus
  });
  if (!Object.keys(patch).length) {
    return { slug: safeSlug, action: "unchanged", alreadyOwned: true };
  }
  patch.updatedAt = FieldValue.serverTimestamp();
  await (routeRef || db.collection("publicRoutes").doc(safeSlug)).set(patch, { merge: true });
  return { slug: safeSlug, action: "metadata-updated", alreadyOwned: true };
}

async function findExistingOwnedPublicRouteForRestaurant({
  restaurantId = "",
  data = {},
  routeStatus = ""
} = {}) {
  const safeRestaurantId = asText(restaurantId);
  if (!safeRestaurantId) return null;
  const source = data && typeof data === "object" ? data : {};
  const restaurantStatus = asText(source.status || source.state || source.businessStatus || source.lifecycleStatus);
  const candidates = restaurantRouteSlugCandidates(source);
  for (const slug of candidates) {
    try {
      const routeRef = db.collection("publicRoutes").doc(slug);
      const routeSnap = await routeRef.get();
      if (!routeSnap.exists) continue;
      const routeData = routeSnap.data() || {};
      if (!routeBelongsToSameRestaurant(routeData, safeRestaurantId)) continue;
      return mergeMissingPublicRouteMetadata({
        slug,
        restaurantId: safeRestaurantId,
        routeStatus,
        restaurantStatus,
        routeRef,
        routeData
      });
    } catch {}
  }
  return null;
}

async function findNextAvailableSlugOnlyForDifferentRestaurant({
  baseSlug = "",
  restaurantId = "",
  data = {},
  routeStatus = ""
} = {}) {
  return claimUniquePublicRouteForRestaurant({
    restaurantId,
    data,
    baseSlug,
    routeStatus
  });
}

async function claimUniquePublicRouteForRestaurant({
  restaurantId = "",
  data = {},
  baseSlug = "",
  routeStatus = ""
} = {}) {
  const safeRestaurantId = asText(restaurantId);
  const source = data && typeof data === "object" ? data : {};
  const safeRouteStatus = safeLowerText(routeStatus);
  const restaurantStatus = asText(source.status || source.state || source.businessStatus || source.lifecycleStatus);
  if (!safeRestaurantId || !safeRouteStatus) return { slug: "", action: "skipped" };

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const slug = buildNumberedPublicRouteSlug(baseSlug, attempt);
    if (!slug || RESERVED_PUBLIC_ROUTE_SEGMENTS.has(slug)) continue;
    const routeRef = db.collection("publicRoutes").doc(slug);
    const result = await db.runTransaction(async (transaction) => {
      const routeSnap = await transaction.get(routeRef);
      if (routeSnap.exists) {
        const routeData = routeSnap.data() || {};
        const routeRestaurantId = asText(routeData.restaurantId || routeData.canonicalRestaurantId);
        if (routeRestaurantId && !routeBelongsToSameRestaurant(routeData, safeRestaurantId)) {
          return { conflict: true, slug, existingRestaurantId: routeRestaurantId };
        }
        const patch = {};
        if (!asText(routeData.restaurantId)) patch.restaurantId = safeRestaurantId;
        if (!asText(routeData.canonicalSlug)) patch.canonicalSlug = slug;
        if (!asText(routeData.status)) patch.status = safeRouteStatus;
        if (!asText(routeData.restaurantStatus) && restaurantStatus) patch.restaurantStatus = restaurantStatus;
        if (Object.keys(patch).length) {
          patch.updatedAt = FieldValue.serverTimestamp();
          transaction.set(routeRef, patch, { merge: true });
          return { slug, action: "updated" };
        }
        return { slug, action: "unchanged" };
      }
      transaction.set(routeRef, {
        restaurantId: safeRestaurantId,
        canonicalSlug: slug,
        status: safeRouteStatus,
        restaurantStatus,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
      return { slug, action: "created" };
    });
    if (result.conflict) continue;
    return result;
  }
  return { slug: "", action: "conflict" };
}

async function ensurePublicRouteForRestaurantWrite(restaurantId = "", data = {}) {
  const safeRestaurantId = asText(restaurantId);
  const source = data && typeof data === "object" ? data : {};
  if (!safeRestaurantId || !isBootstrapRestaurantPublicRecord({ id: safeRestaurantId, ...source })) {
    return { slug: "", action: "skipped" };
  }
  const routeStatus = resolveRouteStatusForRestaurant(source);
  if (!routeStatus) return { slug: "", action: "skipped" };
  const existingOwnedRoute = await findExistingOwnedPublicRouteForRestaurant({
    restaurantId: safeRestaurantId,
    data: source,
    routeStatus
  });
  if (existingOwnedRoute?.slug) {
    return {
      ...existingOwnedRoute,
      restaurantPatchFields: []
    };
  }
  const baseSlug = normalizePathRestaurantSlug(
    source.publicSlug
    || source.landingSlug
    || source.handle
    || source.name
    || source.restaurantName
    || source.businessName
    || safeRestaurantId
  );
  if (!baseSlug) return { slug: "", action: "skipped" };
  const result = await findNextAvailableSlugOnlyForDifferentRestaurant({
    restaurantId: safeRestaurantId,
    data: source,
    baseSlug,
    routeStatus
  });
  const finalSlug = asText(result.slug);
  if (!finalSlug) return result;
  const canonicalPublicPath = buildCanonicalPublicRoutePath(finalSlug, "profile");
  const restaurantPatch = {};
  const shouldStoreNewClaim = result.action === "created"
    || !normalizePathRestaurantSlug(source.publicSlug)
    || !normalizePathRestaurantSlug(source.landingSlug);
  if (shouldStoreNewClaim && asText(source.publicSlug) !== finalSlug) restaurantPatch.publicSlug = finalSlug;
  if (shouldStoreNewClaim && asText(source.landingSlug) !== finalSlug) restaurantPatch.landingSlug = finalSlug;
  if (shouldStoreNewClaim && asText(source.canonicalPublicPath) !== canonicalPublicPath) restaurantPatch.canonicalPublicPath = canonicalPublicPath;
  if (shouldStoreNewClaim && !asText(source.landingRestaurantId)) restaurantPatch.landingRestaurantId = safeRestaurantId;
  if (Object.keys(restaurantPatch).length) {
    restaurantPatch.updatedAt = FieldValue.serverTimestamp();
    await db.collection("restaurants").doc(safeRestaurantId).set(restaurantPatch, { merge: true });
  }
  return {
    ...result,
    restaurantPatchFields: Object.keys(restaurantPatch)
  };
}

exports.ensurePublicRouteOnRestaurantWrite = functions
  .firestore
  .document("restaurants/{restaurantId}")
  .onWrite(async (change, context) => {
    if (!change.after.exists) return null;
    const restaurantId = asText(context?.params?.restaurantId);
    const data = change.after.data() || {};
    try {
      return await ensurePublicRouteForRestaurantWrite(restaurantId, data);
    } catch (error) {
      logFunctionWarn("publicRoute.ensure.failed", {
        restaurantId,
        errorCode: asText(error?.code),
        errorMessage: asText(error?.message || error)
      });
      return null;
    }
  });

function mapPublicRestaurantPreview(restaurantId = "", data = {}) {
  const type = asText(
    data.type
    || data.customerType
    || data.category
    || data.kind
    || data.restaurantType
  );
  const publicSlug = normalizePathRestaurantSlug(data.publicSlug || data.landingSlug || data.handle);
  const canonicalPublicPath = publicSlug
    ? buildCanonicalPublicRoutePath(publicSlug, "profile")
    : asText(data.canonicalPublicPath);
  return {
    id: asText(restaurantId),
    name: asText(data.name || data.restaurantName || data.displayName),
    restaurantName: asText(data.restaurantName || data.name),
    handle: asText(data.handle || publicSlug),
    publicSlug,
    landingSlug: asText(data.landingSlug || publicSlug),
    canonicalPublicPath,
    logoUrl: asText(data.logoUrl || data.logo || data.logoURL),
    city: asText(data.city || data.address),
    ...(type ? { type, customerType: type } : {})
  };
}

function mapPublicRoutePostSeed({
  docId = "",
  data = {},
  restaurantId = ""
} = {}) {
  const source = data && typeof data === "object" ? data : {};
  const postId = asText(docId || source.id);
  const safeRestaurantId = asText(restaurantId || source.restaurantId || source.rid || source.ownerId);
  if (!postId || !safeRestaurantId) return null;
  const status = safeLowerText(source.status || "active");
  if (status && status !== "active" && status !== "live") return null;
  if (source.active === false || source.isActive === false) return null;
  const mediaRow = Array.isArray(source.media) && source.media.length
    ? source.media[0]
    : null;
  const url = asText(
    source.thumbUrl
    || source.mediaUrl
    || mediaRow?.thumbUrl
    || mediaRow?.url
    || source.imageUrl
    || source.url
  );
  if (!url) return null;
  const mediaType = safeLowerText(mediaRow?.type || source.mediaType || source.type);
  return {
    id: postId,
    restaurantId: safeRestaurantId,
    url,
    image: url,
    type: asText(source.type || source.postType, "square"),
    caption: asText(source.caption || source.captionShort),
    content: asText(source.caption || source.captionShort),
    createdAt: toMillis(source.createdAt),
    likes: Number(source.likesCount || source.likes || 0) || 0,
    comments: Number(source.commentsCount || source.comments || 0) || 0,
    isVideo: mediaType === "video",
    ownerType: "restaurant",
    ownerId: safeRestaurantId
  };
}

function mapPublicRouteFeedPost(post = {}, restaurant = {}) {
  const safeRestaurantId = asText(post.restaurantId || post.ownerId);
  if (!safeRestaurantId) return null;
  return {
    id: asText(post.id),
    restaurantId: safeRestaurantId,
    business: asText(restaurant.name || restaurant.restaurantName, "Business"),
    logo: asText(restaurant.logoUrl),
    location: asText(restaurant.city, "Prishtina"),
    content: asText(post.caption || post.content),
    image: asText(post.url || post.image),
    likes: Number(post.likes || 0) || 0,
    comments: Number(post.comments || 0) || 0,
    createdAt: Number(post.createdAt || 0) || 0,
    category: asText(post.type, "food"),
    isLive: false,
    ownerType: "restaurant",
    ownerId: safeRestaurantId
  };
}

async function resolveBootstrapRestaurantDocByRouteId(routeLookupId = "") {
  const safeLookupId = asText(routeLookupId);
  if (!safeLookupId) return null;
  try {
    const directSnap = await db.collection("restaurants").doc(safeLookupId).get();
    if (directSnap.exists) {
      const data = directSnap.data() || {};
      if (!isBootstrapRestaurantPublicRecord({ id: directSnap.id, ...data })) {
        return null;
      }
      return {
        id: asText(directSnap.id),
        data
      };
    }
  } catch {}
  const routeSlug = normalizePublicRouteSlug(safeLookupId);
  if (!routeSlug) return null;
  const queryByField = async (fieldName = "", fieldValue = "") => {
    const safeFieldName = asText(fieldName);
    const safeFieldValue = asText(fieldValue);
    if (!safeFieldName || !safeFieldValue) return null;
    try {
      const snap = await db
        .collection("restaurants")
        .where(safeFieldName, "==", safeFieldValue)
        .limit(1)
        .get();
      const first = snap.docs?.[0] || null;
      if (!first?.id) return null;
      const data = first.data() || {};
      if (!isBootstrapRestaurantPublicRecord({ id: first.id, ...data })) {
        return null;
      }
      return {
        id: asText(first.id),
        data
      };
    } catch {
      return null;
    }
  };
  const byPublicSlug = await queryByField("publicSlug", routeSlug);
  if (byPublicSlug) return byPublicSlug;
  const byLandingSlug = await queryByField("landingSlug", routeSlug);
  if (byLandingSlug) return byLandingSlug;
  const byHandle = await queryByField("handle", routeSlug);
  if (byHandle) return byHandle;
  return null;
}

function parseSocialBootstrapRouteContext(req) {
  const query = req?.query && typeof req.query === "object" ? req.query : {};
  const readQueryValue = (...keys) => {
    for (const key of keys) {
      const value = query?.[key];
      if (Array.isArray(value)) {
        const first = asText(value[0]);
        if (first) return first;
      } else {
        const text = asText(value);
        if (text) return text;
      }
    }
    return "";
  };
  const routeRestaurantId = readQueryValue("r", "restaurant", "restaurantId", "rid", "businessId");
  const routeTab = safeLowerText(readQueryValue("tab", "view"));
  const routeTopTab = safeLowerText(readQueryValue("top", "surface", "screen"));
  const routeSource = safeLowerText(readQueryValue("src", "source", "menuSource", "menuAccessSource", "access"));
  const qrFlagRaw = safeLowerText(readQueryValue("qr", "isQr", "menuQr"));
  const qrFlagEnabled = qrFlagRaw === "1" || qrFlagRaw === "true" || qrFlagRaw === "yes" || qrFlagRaw === "qr";
  const routePathname = readQueryValue("pathname", "path");
  const pathProfileRoute = routeRestaurantId
    ? { restaurantId: "", topTab: "", accessSource: "" }
    : resolvePathPublicProfileRoute(routePathname);
  const restaurantLookupId = asText(routeRestaurantId || pathProfileRoute.restaurantId);
  const accessSource = safeLowerText(routeSource || pathProfileRoute.accessSource || (qrFlagEnabled ? "qr" : ""));
  const fallbackTopTab = restaurantLookupId && isQrLikePublicAccessSource(accessSource)
    ? "menu"
    : "";
  const requestedTopTab = restaurantLookupId
    ? (routeTopTab || routeTab || pathProfileRoute.topTab || fallbackTopTab)
    : "";
  const resolvedTopTab = normalizePublicProfileTopTab(requestedTopTab || (isQrLikePublicAccessSource(accessSource) ? "menu" : "profile"), "profile");
  const explicitLanding = resolvedTopTab === "landing";
  const routeTableNumber = restaurantLookupId
    ? Math.max(
      0,
      Number(readQueryValue("table", "tableNumber", "t")) || 0
    )
    : 0;
  const surface = resolvedTopTab === "menu" ? "menu" : "profile";
  const isDirectPublicRoute = !!restaurantLookupId
    && !explicitLanding
    && (surface === "menu" || surface === "profile");
  return {
    restaurantLookupId,
    routePathname: asText(routePathname),
    topTab: resolvedTopTab,
    surface,
    accessSource: isQrLikePublicAccessSource(accessSource) ? "qr" : "",
    tableNumber: routeTableNumber,
    explicitLanding,
    isDirectPublicRoute
  };
}

async function buildPublicRouteBootstrapPayload(routeContext = {}) {
  const safeRouteContext = routeContext && typeof routeContext === "object" ? routeContext : {};
  if (!safeRouteContext.isDirectPublicRoute) return null;
  const restaurantLookupId = asText(safeRouteContext.restaurantLookupId);
  if (!restaurantLookupId) return null;
  const restaurantDoc = await resolveBootstrapRestaurantDocByRouteId(restaurantLookupId);
  if (!restaurantDoc?.id) return null;
  const restaurantId = asText(restaurantDoc.id);
  const restaurantData = restaurantDoc.data || {};
  if (!isBootstrapRestaurantPublicRecord({ id: restaurantId, ...restaurantData })) return null;
  const publicRouteMeta = await ensureBootstrapRestaurantPublicRouteMeta(restaurantId, restaurantData, {
    routeLookupId: restaurantLookupId,
    allowWrite: false
  });
  const normalizedRestaurantData = publicRouteMeta?.data || restaurantData;
  const restaurantPreview = mapPublicRestaurantPreview(restaurantId, normalizedRestaurantData);
  const surface = safeRouteContext.surface === "menu" ? "menu" : "profile";
  const postsLimit = surface === "profile" ? 14 : 8;
  const menuLimit = surface === "menu" ? 72 : 28;
  const [postsSeedData, menuSeedData, menuMeta, focusSeedData] = await Promise.all([
    queryPublicPostsForRestaurant(restaurantId, postsLimit),
    queryPublicMenuItemsForRestaurant(restaurantId, { limitCount: menuLimit }),
    surface === "menu"
      ? queryPublicMenuMetaForRestaurant(restaurantId)
      : Promise.resolve({ statusBadgeVisible: true }),
    queryPublicFocusSeedForRestaurant(restaurantId, { limitCount: 8 })
  ]);
  const postsSeed = Array.isArray(postsSeedData?.items) ? postsSeedData.items : [];
  const menuSeed = Array.isArray(menuSeedData?.items) ? menuSeedData.items : [];
  const focusSeed = Array.isArray(focusSeedData?.items) ? focusSeedData.items : [];
  const postsState = normalizePublicRouteTruthState(postsSeedData?.state || "", "unknown");
  const menuState = normalizePublicRouteTruthState(menuSeedData?.state || "", "unknown");
  const focusState = normalizePublicRouteTruthState(focusSeedData?.state || "", "unknown");
  const identityName = asText(restaurantPreview.name || restaurantPreview.restaurantName);
  const identityHandle = asText(restaurantPreview.handle || restaurantPreview.publicSlug || restaurantPreview.landingSlug);
  const identityAvatar = asText(restaurantPreview.logoUrl);
  const identityLocation = asText(restaurantPreview.city);
  const identityBio = asText(
    normalizedRestaurantData.bio
    || normalizedRestaurantData.description
    || normalizedRestaurantData.about
  );
  // Public route bootstrap should not promote mixed preview/seed counts as canonical truth.
  const identityFollowers = null;
  const identityFollowing = null;
  const layoutMenuCardColor = resolveMenuLayoutColorFromRestaurant(normalizedRestaurantData);
  const identityTruth = (identityName || identityHandle || identityAvatar || identityLocation)
    ? "seeded"
    : "unknown";
  const bioTruth = identityBio ? "seeded" : "knownEmpty";
  const avatarTruth = identityAvatar ? "seeded" : "knownEmpty";
  const countsTruth = (identityFollowers !== null || identityFollowing !== null)
    ? "seeded"
    : "unknown";
  const layoutTruth = layoutMenuCardColor ? "seeded" : "unknown";
  const routeUpdatedAt = Math.max(
    0,
    toMillis(normalizedRestaurantData.updatedAt || normalizedRestaurantData.lastUpdatedAt || normalizedRestaurantData.createdAt || 0),
    Number(postsSeedData?.updatedAt || 0) || 0,
    Number(menuSeedData?.updatedAt || 0) || 0,
    Number(focusSeedData?.updatedAt || 0) || 0
  );
  const snapshotUpdatedAt = routeUpdatedAt > 0 ? routeUpdatedAt : Date.now();
  const snapshotVersion = "business-page-v1";
  const snapshot = {
    snapshotVersion,
    version: `${restaurantId}:${snapshotUpdatedAt}:${snapshotVersion}`,
    updatedAt: snapshotUpdatedAt,
    restaurantId,
    identity: {
      name: identityName,
      handle: identityHandle,
      publicSlug: asText(restaurantPreview.publicSlug),
      canonicalPublicPath: asText(restaurantPreview.canonicalPublicPath),
      avatar: identityAvatar,
      location: identityLocation,
      bio: identityBio,
      followers: identityFollowers,
      following: identityFollowing,
      type: asText(restaurantPreview.type || restaurantPreview.customerType),
      customerType: asText(restaurantPreview.customerType || restaurantPreview.type)
    },
    posts: buildPublicRouteTruthSection({
      state: postsState,
      count: Number(postsSeedData?.count || postsSeed.length || 0) || 0,
      items: postsSeed
    }),
    menu: buildPublicRouteTruthSection({
      state: menuState,
      count: Number(menuSeedData?.count || menuSeed.length || 0) || 0,
      items: menuSeed,
      extras: {
        statusBadgeVisible: menuMeta?.statusBadgeVisible !== false
      }
    }),
    focus: buildPublicRouteTruthSection({
      state: focusState,
      count: Number(focusSeedData?.count || focusSeed.length || 0) || 0,
      items: focusSeed,
      extras: {
        enabled: focusSeedData?.enabled !== false
      }
    }),
    layout: {
      menuCardColor: layoutMenuCardColor
    },
    truth: {
      identity: normalizePublicRouteTruthState(identityTruth, "unknown"),
      bio: normalizePublicRouteTruthState(bioTruth, "unknown"),
      avatar: normalizePublicRouteTruthState(avatarTruth, "unknown"),
      counts: normalizePublicRouteTruthState(countsTruth, "unknown"),
      posts: postsState,
      menu: menuState,
      focus: focusState,
      layout: normalizePublicRouteTruthState(layoutTruth, "unknown")
    }
  };
  const routePayload = {
    owner: "web-direct",
    routeFirst: true,
    restaurantId,
    publicSlug: asText(restaurantPreview.publicSlug),
    canonicalPublicPath: asText(restaurantPreview.canonicalPublicPath),
    surface,
    topTab: surface === "menu" ? "menu" : "profile",
    contentTab: surface === "menu" ? "menu" : "posts",
    menuAccessSource: safeRouteContext.accessSource === "qr" ? "qr" : "",
    tableNumber: Math.max(0, Number(safeRouteContext.tableNumber || 0) || 0),
    phase: "ready",
    identity: {
      name: snapshot.identity.name,
      handle: snapshot.identity.handle,
      publicSlug: snapshot.identity.publicSlug,
      canonicalPublicPath: snapshot.identity.canonicalPublicPath,
      avatar: snapshot.identity.avatar,
      location: snapshot.identity.location,
      bio: snapshot.identity.bio,
      followers: snapshot.identity.followers,
      following: snapshot.identity.following,
      type: snapshot.identity.type,
      customerType: snapshot.identity.customerType
    },
    posts: {
      state: snapshot.posts.state,
      count: snapshot.posts.count,
      seeded: snapshot.posts.seeded,
      knownEmpty: snapshot.posts.knownEmpty,
      unknown: snapshot.posts.unknown
    },
    menu: {
      state: snapshot.menu.state,
      count: snapshot.menu.count,
      seeded: snapshot.menu.seeded,
      knownEmpty: snapshot.menu.knownEmpty,
      unknown: snapshot.menu.unknown,
      statusBadgeVisible: menuMeta?.statusBadgeVisible !== false
    },
    focus: {
      state: snapshot.focus.state,
      count: snapshot.focus.count,
      seeded: snapshot.focus.seeded,
      knownEmpty: snapshot.focus.knownEmpty,
      unknown: snapshot.focus.unknown,
      enabled: snapshot.focus.enabled !== false
    },
    layout: {
      menuCardColor: layoutMenuCardColor
    },
    truth: {
      identity: snapshot.truth.identity,
      bio: snapshot.truth.bio,
      avatar: snapshot.truth.avatar,
      counts: snapshot.truth.counts,
      posts: snapshot.truth.posts,
      menu: snapshot.truth.menu,
      focus: snapshot.truth.focus,
      layout: snapshot.truth.layout
    },
    snapshotVersion: snapshot.snapshotVersion,
    snapshotUpdatedAt: snapshot.updatedAt,
    snapshotVersionKey: snapshot.version,
    businessSnapshot: snapshot,
    ts: Date.now()
  };
  return {
    restaurants: [restaurantPreview],
    feedPosts: postsSeed
      .map((post) => mapPublicRouteFeedPost(post, restaurantPreview))
      .filter(Boolean),
    stories: [],
    publicRoute: routePayload
  };
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
      const routeContext = parseSocialBootstrapRouteContext(req);
      if (routeContext.isDirectPublicRoute) {
        const directPayload = await buildPublicRouteBootstrapPayload(routeContext);
        if (directPayload?.publicRoute?.restaurantId) {
          res.set("Cache-Control", "no-store, max-age=0");
          logFunctionInfo(flow, {
            ...logContext,
            status: "served_direct_route",
            routeRestaurantId: asText(directPayload.publicRoute.restaurantId),
            surface: asText(directPayload.publicRoute.surface),
            topTab: asText(directPayload.publicRoute.topTab),
            posts: Number(directPayload.publicRoute?.posts?.count || 0) || 0,
            menuItems: Number(directPayload.publicRoute?.menu?.count || 0) || 0
          });
          res.status(200).json({
            ok: true,
            ts: Date.now(),
            data: {
              restaurants: Array.isArray(directPayload.restaurants) ? directPayload.restaurants : [],
              feedPosts: Array.isArray(directPayload.feedPosts) ? directPayload.feedPosts : [],
              stories: Array.isArray(directPayload.stories) ? directPayload.stories : [],
              publicRoute: directPayload.publicRoute
            }
          });
          return;
        }
      }

      const FEED_BOOTSTRAP_LIMIT = 20;
      const [restaurantsSnap, feedSnap, storiesSnap] = await Promise.all([
        db.collection("restaurants").limit(120).get(),
        queryActiveFeed(FEED_BOOTSTRAP_LIMIT),
        queryActiveStories(16)
      ]);

      const restaurants = [];
      const restaurantMap = new Map();
      const restaurantIdSet = new Set();
      restaurantsSnap.forEach((docSnap) => {
        const data = docSnap.data() || {};
        const id = asText(docSnap.id);
        if (!id) return;
        if (!isBootstrapRestaurantPublicRecord({ id, ...data })) return;
        const rest = mapPublicRestaurantPreview(id, data);
        if (!rest?.id) return;
        restaurants.push(rest);
        restaurantMap.set(id, rest);
        restaurantIdSet.add(id);
      });

      const referencedRestaurantIds = new Set();
      feedSnap.forEach((docSnap) => {
        const data = docSnap.data() || {};
        const rid = asText(data.rid || data.restaurantId);
        if (rid) referencedRestaurantIds.add(rid);
      });
      storiesSnap.forEach((docSnap) => {
        const data = docSnap.data() || {};
        const rid = extractStoryRestaurantId(docSnap, data);
        if (rid) referencedRestaurantIds.add(rid);
      });
      const missingRestaurantIds = Array.from(referencedRestaurantIds.values())
        .filter((rid) => !restaurantMap.has(rid));
      if (missingRestaurantIds.length) {
        const resolvedMissing = await Promise.allSettled(
          missingRestaurantIds.map(async (rid) => {
            const snap = await db.collection("restaurants").doc(rid).get();
            if (!snap.exists) return null;
            const data = snap.data() || {};
            if (!isBootstrapRestaurantPublicRecord({ id: snap.id, ...data })) return null;
            return mapPublicRestaurantPreview(snap.id, data);
          })
        );
        resolvedMissing.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const rest = result.value && typeof result.value === "object" ? result.value : null;
          const id = asText(rest?.id);
          if (!id || restaurantMap.has(id)) return;
          restaurantMap.set(id, rest);
          if (!restaurantIdSet.has(id)) {
            restaurantIdSet.add(id);
            restaurants.push(rest);
          }
        });
      }

      const feedPosts = [];
      feedSnap.forEach((docSnap) => {
        const data = docSnap.data() || {};
        const rid = asText(data.rid || data.restaurantId);
        if (!rid || !restaurantMap.has(rid)) return;
        const normalizedPost = mapPublicRoutePostSeed({
          docId: docSnap.id,
          data,
          restaurantId: rid
        });
        if (!normalizedPost) return;
        const rest = restaurantMap.get(rid) || {};
        const feedRow = mapPublicRouteFeedPost(normalizedPost, rest);
        if (!feedRow) return;
        feedPosts.push({
          ...feedRow,
          business: asText(data.businessName || data.restaurantName || feedRow.business, "Business"),
          logo: asText(feedRow.logo || data.logoUrl || data.logo || data.logoURL),
          location: asText(data.city || feedRow.location, "Prishtina"),
          content: asText(feedRow.content || data.captionShort),
          category: asText(feedRow.category || data.postType, "food"),
          isLive: !!data.isLive
        });
      });

      const storiesByRestaurant = new Map();
      storiesSnap.forEach((docSnap) => {
        const data = docSnap.data() || {};
        const status = asText(data.status, "active").toLowerCase();
        if (status && status !== "active" && status !== "live") return;
        if (data.active === false || data.isActive === false) return;
        const rid = extractStoryRestaurantId(docSnap, data);
        if (!rid || storiesByRestaurant.has(rid) || !restaurantMap.has(rid)) return;
        const rest = restaurantMap.get(rid) || {};
        const canonicalName = normalizeStoryName(rest.name || rest.restaurantName || rest.displayName || "");
        const sourceName = normalizeStoryName(data.businessName || data.restaurantName || "");
        const canonicalLogo = asText(rest.logoUrl || rest.logo || rest.logoURL);
        const sourceLogo = asText(data.logoUrl || data.logo);
        const name = canonicalName || sourceName;
        const img = canonicalLogo || sourceLogo;
        if (!name) return;
        // Story-Medien mitliefern, damit die Feed-Kachel sofort Foto/Video
        // zeigt statt nur des Business-Logos (Cold-Start ohne Zweit-Query).
        storiesByRestaurant.set(rid, {
          id: rid,
          restaurantId: rid,
          name,
          img,
          isLive: data.isLive !== undefined ? !!data.isLive : true,
          mediaType: asText(data.mediaType || data.type).toLowerCase(),
          imageUrl: asText(data.imageUrl || data.thumbUrl || data.mediaImage),
          videoUrl: asText(data.videoUrl || data.playbackUrl),
          mediaUrl: asText(data.mediaUrl || data.url),
          embedUrl: asText(data.embedUrl),
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
          isLive: !!row.isLive,
          mediaType: row.mediaType,
          imageUrl: row.imageUrl,
          videoUrl: row.videoUrl,
          mediaUrl: row.mediaUrl,
          embedUrl: row.embedUrl
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
          stories,
          publicRoute: null
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

exports.writeUserNotification = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    const flow = "notification.write.callable";
    const actorUid = asText(context?.auth?.uid);
    const targetUid = asText(data?.targetUid);
    const requestedNotificationId = asText(data?.notificationId);
    const payload = data?.payload && typeof data.payload === "object" ? data.payload : {};
    const type = normalizeNotificationType(payload.type);
    const logContext = buildCallableLogContext(context, {
      endpoint: "writeUserNotification",
      actorUid,
      targetUid,
      notificationId: requestedNotificationId,
      type
    });

    if (!actorUid) {
      logFunctionWarn(flow, {
        ...logContext,
        status: "unauthenticated"
      });
      throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }

    if (!targetUid) {
      logFunctionWarn(flow, {
        ...logContext,
        status: "invalid_argument",
        reason: "target_uid_missing"
      });
      throw new functions.https.HttpsError("invalid-argument", "targetUid is required.");
    }

    if (!CLIENT_NOTIFICATION_ALLOWED_TYPES.has(type)) {
      logFunctionWarn(flow, {
        ...logContext,
        status: "invalid_argument",
        reason: "unsupported_type"
      });
      throw new functions.https.HttpsError("invalid-argument", "Unsupported notification type.");
    }

    if (asText(payload.userUid) && asText(payload.userUid) !== actorUid) {
      logFunctionWarn(flow, {
        ...logContext,
        status: "permission_denied",
        reason: "payload_actor_mismatch"
      });
      throw new functions.https.HttpsError("permission-denied", "Notification actor mismatch.");
    }

    try {
      await assertClientNotificationWriteAllowed({
        type,
        actorUid,
        targetUid,
        notificationId: requestedNotificationId,
        payload
      });

      const expectedNotificationId = buildExpectedNotificationId({
        type,
        actorUid,
        notificationId: requestedNotificationId,
        payload
      });
      if (!expectedNotificationId) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid notification identifier.");
      }
      if (requestedNotificationId) {
        const safeRequestedNotificationId = sanitizeNotificationDocId(requestedNotificationId);
        if (safeRequestedNotificationId !== expectedNotificationId) {
          throw new functions.https.HttpsError("permission-denied", "Notification identifier mismatch.");
        }
      }
      const notificationId = expectedNotificationId;

      const writePayload = buildServerAuthNotificationPayload({
        type,
        actorUid,
        targetUid,
        payload
      });

      await db
        .collection("users")
        .doc(targetUid)
        .collection("notifications")
        .doc(notificationId)
        .set(writePayload, { merge: true });

      logFunctionInfo(flow, {
        ...logContext,
        status: "written",
        notificationId
      });

      return {
        ok: true,
        notificationId
      };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        logFunctionWarn(flow, {
          ...logContext,
          status: "blocked",
          code: asText(error.code),
          reason: asText(error.message)
        });
        throw error;
      }
      logFunctionError(flow, error, {
        ...logContext,
        status: "failed"
      });
      throw new functions.https.HttpsError("internal", "Notification write failed.");
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
      if (data.serverAuth !== true) {
        logFunctionWarn("push.notification.dispatch", {
          ...logContext,
          status: "ignored_untrusted_notification"
        });
        return;
      }
      const type = normalizeNotificationType(data.type);
      if (!PUSH_NOTIFICATION_ALLOWED_TYPES.has(type)) {
        logFunctionWarn("push.notification.dispatch", {
          ...logContext,
          status: "ignored_unsupported_type",
          type
        });
        return;
      }

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
            updatedAt: FieldValue.serverTimestamp()
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

function createOrderLookupToken(prefix = "order") {
  return `${asText(prefix, "order")}_${crypto.randomBytes(24).toString("base64url")}`;
}

async function loadTrustedOrderMenuItems(restaurantRef, requestedItems = []) {
  const requestedIds = Array.from(new Set(
    (Array.isArray(requestedItems) ? requestedItems : [])
      .map((item) => asText(item?.itemId))
      .filter(Boolean)
  ));
  const snapshots = await Promise.all(
    requestedIds.map((itemId) => restaurantRef.collection("menuItems").doc(itemId).get())
  );
  return snapshots
    .filter((snapshot) => snapshot.exists)
    .map((snapshot) => ({ id: snapshot.id, ...(snapshot.data() || {}) }));
}

exports.createRestaurantOrder = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    const flow = "orders.create.callable";
    const authUid = asText(context?.auth?.uid);
    let logContext = buildCallableLogContext(context, {
      endpoint: "createRestaurantOrder",
      actorUid: authUid
    });

    try {
      const input = normalizeCreateOrderInput(data);
      logContext = buildCallableLogContext(context, {
        endpoint: "createRestaurantOrder",
        actorUid: authUid,
        restaurantId: input.restaurantId,
        itemCount: input.items.length
      });

      const restaurantRef = db.collection("restaurants").doc(input.restaurantId);
      const actorRef = authUid ? db.collection("users").doc(authUid) : null;
      const [restaurantSnapshot, actorSnapshot, menuItems] = await Promise.all([
        restaurantRef.get(),
        actorRef ? actorRef.get().catch(() => null) : Promise.resolve(null),
        loadTrustedOrderMenuItems(restaurantRef, input.items)
      ]);
      if (!restaurantSnapshot.exists) {
        throw new OrderValidationError("Restaurant was not found.", "failed-precondition");
      }

      const orderRef = restaurantRef.collection("orders").doc();
      const orderPayload = buildSecureRestaurantOrderPayload({
        input,
        authUid,
        authData: context?.auth?.token || {},
        actorData: actorSnapshot?.exists ? (actorSnapshot.data() || {}) : {},
        restaurantData: restaurantSnapshot.data() || {},
        menuItems,
        orderId: orderRef.id,
        nowIso: new Date().toISOString(),
        serverTimestampValue: FieldValue.serverTimestamp(),
        tokenFactory: createOrderLookupToken
      });

      await orderRef.set(orderPayload.writeData, { merge: false });
      logFunctionInfo(flow, {
        ...logContext,
        status: "completed",
        orderId: orderPayload.orderId,
        totalCents: orderPayload.writeData.totalCents,
        itemCount: orderPayload.writeData.itemCount
      });
      return {
        ok: true,
        orderId: orderPayload.orderId,
        restaurantId: orderPayload.restaurantId,
        guestLookupToken: orderPayload.guestLookupToken,
        order: orderPayload.clientOrder
      };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;
      if (error instanceof OrderValidationError) {
        logFunctionWarn(flow, {
          ...logContext,
          status: error.code,
          reason: error.message,
          details: error.details || {}
        });
        throw new functions.https.HttpsError(error.code, error.message, error.details);
      }
      logFunctionError(flow, error, {
        ...logContext,
        status: "failed"
      });
      throw new functions.https.HttpsError("internal", "Order could not be created.");
    }
  });

exports.syncOrderMirrorsOnRestaurantOrderWrite = functions
  .region("us-central1")
  .firestore.document("restaurants/{restaurantId}/orders/{orderId}")
  .onWrite(async (change, context) => {
    const restaurantId = asText(context.params?.restaurantId);
    const orderId = asText(context.params?.orderId);
    const logContext = buildEventLogContext(context, {
      restaurantId,
      orderId
    });
    try {
      if (!restaurantId || !orderId) return;
      const beforeData = change.before?.exists ? (change.before.data() || {}) : null;
      const afterData = change.after?.exists ? (change.after.data() || {}) : null;
      const beforeBuyerUid = asText(beforeData?.buyerUid);
      const afterBuyerUid = asText(afterData?.buyerUid);
      const beforeLookupToken = asText(beforeData?.guestLookupToken || beforeData?.orderLookupToken);
      const afterLookupToken = asText(afterData?.guestLookupToken || afterData?.orderLookupToken);
      const writes = [];

      if (beforeBuyerUid && (!afterData || beforeBuyerUid !== afterBuyerUid)) {
        writes.push(
          db.collection("users").doc(beforeBuyerUid).collection("orders").doc(orderId).delete().catch(() => null)
        );
      }
      if (beforeLookupToken && (!afterData || beforeLookupToken !== afterLookupToken)) {
        writes.push(
          db.collection("restaurants").doc(restaurantId).collection("orderLookup").doc(beforeLookupToken).delete().catch(() => null)
        );
      }

      if (afterData) {
        const projection = buildCanonicalOrderProjection({
          restaurantId,
          orderId,
          orderData: afterData
        });
        if (afterBuyerUid) {
          writes.push(
            db
              .collection("users")
              .doc(afterBuyerUid)
              .collection("orders")
              .doc(orderId)
              .set({
                ...projection,
                mirrorType: "user_order"
              }, { merge: true })
          );
        }
        if (afterLookupToken) {
          writes.push(
            db
              .collection("restaurants")
              .doc(restaurantId)
              .collection("orderLookup")
              .doc(afterLookupToken)
              .set({
                ...projection,
                lookupToken: afterLookupToken,
                mirrorType: "guest_order_lookup"
              }, { merge: true })
          );
        }
      }

      if (!writes.length) return;
      const settled = await Promise.allSettled(writes);
      const failed = settled.find((result) => result.status === "rejected");
      if (failed?.status === "rejected") {
        throw failed.reason;
      }
      logFunctionInfo("orders.mirror.sync", {
        ...logContext,
        status: "completed",
        writes: writes.length
      });
    } catch (error) {
      logFunctionError("orders.mirror.sync", error, {
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
