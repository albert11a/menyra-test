export function canUseNativeNotificationsCore({ windowObj } = {}) {
  return typeof windowObj !== "undefined" && !!windowObj && "Notification" in windowObj;
}

export function buildPushActivationIssueCore({
  reason = "",
  err = null
} = {}) {
  const base = String(reason || "").trim();
  const code = String(err?.code || "").trim();
  const message = String(err?.message || "").trim();
  const parts = [base];
  if (code) parts.push(`[${code}]`);
  if (message) parts.push(message);
  return parts.filter(Boolean).join(" ").trim();
}

export function getPushActivationIssueMessageCore(issue = "") {
  return String(issue || "").trim();
}

export function mapPushActivationErrorCore(stage = "", err = null) {
  const code = String(err?.code || "").trim();
  const message = String(err?.message || "").trim();
  if (code === "permission-denied" && stage === "firestore-write") {
    return "Rregullat e Firestore bllokojne users/{uid}/devices. Ju lutem kontrolloni rules.";
  }
  if (code === "messaging/permission-blocked") {
    return "Leja e shfletuesit per njoftime eshte e bllokuar.";
  }
  if (code === "messaging/unsupported-browser") {
    return "Ky shfletues nuk mbeshtet FCM Web Push.";
  }
  if (code === "messaging/failed-service-worker-registration") {
    return "Service Worker nuk mund te perdorej per FCM.";
  }
  if (code === "messaging/invalid-sw-registration") {
    return "Regjistrimi i Service Worker eshte i pavlefshem per FCM.";
  }
  if (code === "messaging/token-subscribe-failed") {
    return "Abonimi i FCM token deshtoi. Kontrolloni VAPID-Key dhe Push-Service.";
  }
  if (code) return `${stage || "push"} deshtoi (${code}).`;
  if (message) return `${stage || "push"} deshtoi: ${message}`;
  return `${stage || "push"} deshtoi.`;
}

export function canEmitNativePushAlertsCore({
  settings = {},
  canUseNativeNotifications = false,
  notificationPermission = ""
} = {}) {
  return !!settings?.pushNotifs
    && !!canUseNativeNotifications
    && String(notificationPermission || "").trim() === "granted";
}
