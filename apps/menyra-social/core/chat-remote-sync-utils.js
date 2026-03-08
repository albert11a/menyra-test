export function buildChatMessageSyncContextCore({
  message = {},
  sanitizeChatAttachmentsForSync,
  buildChatPreviewText,
  createdAtClientFallback = ""
} = {}) {
  const sanitizeAttachments = typeof sanitizeChatAttachmentsForSync === "function"
    ? sanitizeChatAttachmentsForSync
    : ((items) => (Array.isArray(items) ? items : []));
  const buildPreview = typeof buildChatPreviewText === "function"
    ? buildChatPreviewText
    : (() => "");
  const safeAttachments = sanitizeAttachments(message?.attachments);
  const preview = buildPreview({
    text: String(message?.text || ""),
    attachments: safeAttachments
  });
  const createdAtClient = String(
    message?.createdAt
      || createdAtClientFallback
      || new Date().toISOString()
  );
  return {
    safeAttachments,
    preview,
    createdAtClient
  };
}

export function buildChatRemotePayloadBundleCore({
  message = {},
  safeAttachments = [],
  preview = "",
  createdAtClient = "",
  senderProfile = {},
  partnerProfile = {},
  senderUid = "",
  partnerUid = "",
  serverTimestampFn
} = {}) {
  const ts = typeof serverTimestampFn === "function" ? serverTimestampFn : (() => null);
  const safeSenderUid = String(senderUid || senderProfile?.uid || "").trim();
  const safePartnerUid = String(partnerUid || partnerProfile?.uid || "").trim();
  const safeMessageId = String(message?.id || "").trim();
  const safeText = String(message?.text || "");
  const senderThreadPayload = {
    uid: safePartnerUid,
    restaurantId: String(partnerProfile?.restaurantId || "").trim(),
    handle: String(partnerProfile?.handle || "").replace(/^@/, "").trim(),
    name: String(partnerProfile?.name || "User").trim() || "User",
    avatar: String(partnerProfile?.avatar || "").trim(),
    lastMessage: preview,
    unreadCount: 0,
    updatedAt: ts(),
    updatedAtClient: createdAtClient
  };
  const senderMessagePayload = {
    id: safeMessageId,
    from: "self",
    text: safeText,
    attachments: safeAttachments,
    liked: !!message?.liked,
    saved: !!message?.saved,
    read: true,
    senderUid: safeSenderUid,
    createdAt: ts(),
    createdAtClient
  };
  const recipientThreadPayloadBase = {
    uid: safeSenderUid,
    restaurantId: "",
    handle: String(senderProfile?.handle || "").trim(),
    name: String(senderProfile?.name || "User").trim() || "User",
    avatar: String(senderProfile?.avatar || "").trim(),
    lastMessage: preview,
    updatedAt: ts(),
    updatedAtClient: createdAtClient
  };
  const recipientMessagePayload = {
    id: safeMessageId,
    from: "other",
    text: safeText,
    attachments: safeAttachments,
    liked: false,
    saved: false,
    read: false,
    senderUid: safeSenderUid,
    senderHandle: String(senderProfile?.handle || "").trim(),
    senderName: String(senderProfile?.name || "User").trim() || "User",
    senderAvatar: String(senderProfile?.avatar || "").trim(),
    createdAt: ts(),
    createdAtClient
  };
  return {
    senderThreadPayload,
    senderMessagePayload,
    recipientThreadPayloadBase,
    recipientMessagePayload
  };
}

export function buildChatMessageNotificationCore({
  messageId = "",
  senderUid = "",
  senderProfile = {},
  preview = "",
  nowMs = Date.now(),
  encodeURIComponentFn
} = {}) {
  const safeSenderUid = String(senderUid || "").trim();
  const encode = typeof encodeURIComponentFn === "function"
    ? encodeURIComponentFn
    : encodeURIComponent;
  const safeMessageId = String(messageId || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 90);
  const notificationId = `chat_${safeSenderUid}_${safeMessageId || nowMs}`;
  return {
    notificationId,
    payload: {
      type: "chat_message",
      user: String(senderProfile?.name || senderProfile?.handle || "User").trim() || "User",
      userHandle: String(senderProfile?.handle || "").trim(),
      userUid: safeSenderUid,
      avatar: String(senderProfile?.avatar || "").trim(),
      text: String(preview || "Neue Nachricht"),
      ownerType: "chat",
      ownerId: safeSenderUid,
      link: `/apps/menyra-social/?tab=chat&chat=${encode(safeSenderUid)}`
    }
  };
}
