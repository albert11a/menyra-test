export function hasPushDeviceRegistrationPrerequisitesCore({
  uid = "",
  enabled = false,
  isSecureContext = false,
  vapidKey = "",
  hasServiceWorker = false,
  setPushActivationIssue
} = {}) {
  const setIssue = typeof setPushActivationIssue === "function"
    ? setPushActivationIssue
    : (() => {});
  const safeUid = String(uid || "").trim();
  if (!safeUid || !enabled) return false;
  if (!isSecureContext) {
    setIssue("Push kerkon HTTPS ose localhost (secure context).");
    return false;
  }
  if (!String(vapidKey || "").trim()) {
    setIssue("Mungon FCM VAPID-Key.");
    return false;
  }
  if (!hasServiceWorker) {
    setIssue("Service Worker nuk mbeshtetet nga shfletuesi.");
    return false;
  }
  return true;
}

export function isPushTokenSyncFreshCore({
  meta = null,
  token = "",
  nowTs = Date.now(),
  intervalMs = 0
} = {}) {
  if (!meta || typeof meta !== "object") return false;
  const safeToken = String(token || "").trim();
  if (!safeToken) return false;
  const metaToken = String(meta.token || "").trim();
  const metaTs = Math.max(0, Number(meta.ts || 0) || 0);
  const maxAgeMs = Math.max(0, Number(intervalMs || 0) || 0);
  return !!metaToken && metaToken === safeToken && (Math.max(0, Number(nowTs || 0) || 0) - metaTs) < maxAgeMs;
}

export function buildPushDeviceRegistrationPayloadCore({
  token = "",
  userAgent = "",
  locale = "",
  serverTimestampValue = null
} = {}) {
  return {
    token: String(token || "").trim(),
    enabled: true,
    platform: "web",
    app: "menyra-social",
    userAgent: String(userAgent || "").slice(0, 190),
    locale: String(locale || "").slice(0, 24),
    updatedAt: serverTimestampValue,
    lastSeenAt: serverTimestampValue
  };
}

export function buildPushDeviceDisablePayloadCore({
  serverTimestampValue = null
} = {}) {
  return {
    enabled: false,
    updatedAt: serverTimestampValue
  };
}
