export function buildNotificationWritePayloadCore({
  payload = {},
  serverTimestampValue = null
} = {}) {
  return {
    ...(payload && typeof payload === "object" ? payload : {}),
    read: false,
    createdAt: serverTimestampValue
  };
}

export function normalizeNotificationWriteIdsCore({
  targetUid = "",
  notificationId = ""
} = {}) {
  return {
    targetUid: String(targetUid || "").trim(),
    notificationId: String(notificationId || "").trim()
  };
}
