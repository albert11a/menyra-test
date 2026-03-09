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
  return String(issue || "").trim() || "Unbekannter Fehler bei der Push-Initialisierung.";
}

export function mapPushActivationErrorCore(stage = "", err = null) {
  const code = String(err?.code || "").trim();
  const message = String(err?.message || "").trim();
  if (code === "permission-denied" && stage === "firestore-write") {
    return "Firestore-Regeln blockieren users/{uid}/devices. Bitte Rules pruefen.";
  }
  if (code === "messaging/permission-blocked") {
    return "Browser-Permission fuer Benachrichtigungen ist blockiert.";
  }
  if (code === "messaging/unsupported-browser") {
    return "Dieser Browser unterstuetzt FCM Web Push nicht.";
  }
  if (code === "messaging/failed-service-worker-registration") {
    return "Service Worker konnte fuer FCM nicht verwendet werden.";
  }
  if (code === "messaging/invalid-sw-registration") {
    return "Service Worker Registrierung ist fuer FCM ungueltig.";
  }
  if (code === "messaging/token-subscribe-failed") {
    return "FCM Token-Abonnement fehlgeschlagen. VAPID-Key und Push-Service pruefen.";
  }
  if (code) return `${stage || "push"} fehlgeschlagen (${code}).`;
  if (message) return `${stage || "push"} fehlgeschlagen: ${message}`;
  return `${stage || "push"} fehlgeschlagen.`;
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
