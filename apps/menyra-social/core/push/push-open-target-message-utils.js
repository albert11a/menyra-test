export function isPushOpenTargetMessageCore(payload = {}) {
  return String(payload?.type || "").trim() === "OPEN_NOTIFICATION_TARGET";
}

export function parsePushOpenTargetPayloadCore(payload = {}) {
  return {
    notificationId: String(payload?.notificationId || payload?.notifId || "").trim(),
    targetUrl: String(payload?.url || payload?.link || "").trim()
  };
}

export function shouldHandlePushOpenTargetCore({
  notificationId = "",
  hasRouteFromUrl = false
} = {}) {
  return !!String(notificationId || "").trim() || !!hasRouteFromUrl;
}
