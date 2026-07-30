export function resolveNativePushActorCore(notif = {}) {
  return String(notif?.user || notif?.userHandle || "").trim();
}

export function resolveNativePushBodyCore(notif = {}) {
  const type = String(notif?.type || "").trim().toLowerCase();
  const actor = resolveNativePushActorCore(notif);
  const text = String(notif?.text || "").trim();
  if (type === "chat_message") {
    if (actor && text) return `${actor} hat dir eine Nachricht geschickt: ${text}`;
    if (actor) return `${actor} hat dir eine Nachricht geschickt`;
    if (text) return `Neue Nachricht: ${text}`;
    return "Neue Nachricht";
  }
  if (actor && text) return `${actor} ${text}`;
  if (text) return text;
  return "Njoftim i ri";
}

export function buildNativePushAlertPayloadCore({
  notif = {},
  brandTitle = "",
  resolveNotificationAvatar,
  encodeURIComponentFn
} = {}) {
  const resolveAvatar = typeof resolveNotificationAvatar === "function"
    ? resolveNotificationAvatar
    : (() => "");
  const encode = typeof encodeURIComponentFn === "function"
    ? encodeURIComponentFn
    : encodeURIComponent;
  const notifId = String(notif?.id || "");
  const icon = String(resolveAvatar(notif) || "/apps/menyra-social/assets/icon-192.png");
  const deepLink = notifId
    ? `/notifications?notif=${encode(notifId)}`
    : "/notifications";
  return {
    title: String(brandTitle || "").trim() || "MNYRA",
    body: resolveNativePushBodyCore(notif),
    icon,
    tag: `menyra_notif_${notifId || Date.now()}`,
    data: {
      url: deepLink,
      notifId,
      notificationId: notifId
    }
  };
}
