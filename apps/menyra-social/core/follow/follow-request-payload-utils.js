export function buildFollowRequestDocPayloadCore({
  actor = {},
  targetUid = "",
  targetHandle = "",
  serverTimestampValue = null
} = {}) {
  return {
    requesterUid: actor?.uid || "",
    requesterHandle: actor?.handle || "",
    requesterName: actor?.name || "",
    requesterAvatar: actor?.avatar || "",
    targetUid: String(targetUid || "").trim(),
    targetHandle: String(targetHandle || "").trim(),
    createdAt: serverTimestampValue
  };
}

export function buildFollowRequestNotificationPayloadCore({
  actor = {},
  serverTimestampValue = null
} = {}) {
  return {
    type: "follow_request",
    user: actor?.name || "",
    userHandle: actor?.handle || "",
    userUid: actor?.uid || "",
    avatar: actor?.avatar || "",
    text: "moechte dir folgen",
    read: false,
    createdAt: serverTimestampValue
  };
}

export function buildAcceptedFollowRecordPayloadCore({
  targetUid = "",
  targetHandle = "",
  profileName = "",
  profileAvatar = "",
  actor = {},
  serverTimestampValue = null
} = {}) {
  return {
    handle: String(targetHandle || "").trim(),
    targetType: "user",
    targetId: String(targetUid || "").trim(),
    name: String(profileName || actor?.name || "User"),
    avatar: String(profileAvatar || actor?.avatar || ""),
    createdAt: serverTimestampValue
  };
}

export function buildFollowAcceptedNotificationPayloadCore({
  actor = {}
} = {}) {
  return {
    type: "follow_accepted",
    user: actor?.name || "",
    userHandle: actor?.handle || "",
    userUid: actor?.uid || "",
    avatar: actor?.avatar || "",
    text: "pranoi kerkesen tende"
  };
}
