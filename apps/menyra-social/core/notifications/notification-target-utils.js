export function isChatNotificationTypeCore(type = "") {
  return String(type || "").trim() === "chat_message";
}

export function isFollowNotificationTypeCore(type = "") {
  const safeType = String(type || "").trim();
  return safeType === "follow" || safeType === "follow_request" || safeType === "follow_accepted";
}

export function isPostNotificationTypeCore(type = "") {
  const safeType = String(type || "").trim();
  return safeType === "like" || safeType === "comment";
}

export function buildNotificationChatTargetCore(notif = {}) {
  return {
    uid: notif?.userUid || "",
    handle: notif?.userHandle || notif?.user || "",
    name: notif?.user || "User",
    avatar: notif?.img || ""
  };
}

export function buildNotificationProfileTargetCore(notif = {}) {
  return {
    uid: notif?.userUid || "",
    handle: notif?.userHandle || notif?.user || "",
    name: notif?.user || "User",
    avatar: notif?.img || ""
  };
}
