export function markNotificationReadInListCore({
  notifications = [],
  id = ""
} = {}) {
  const safeId = String(id || "").trim();
  const list = Array.isArray(notifications) ? notifications : [];
  if (!safeId) return { nextNotifications: list, changed: false };
  const idx = list.findIndex((item) => String(item?.id || "") === safeId);
  if (idx < 0) return { nextNotifications: list, changed: false };
  if (list[idx]?.read) return { nextNotifications: list, changed: false };
  const next = list.slice();
  next[idx] = { ...(next[idx] || {}), read: true };
  return { nextNotifications: next, changed: true };
}

export function markAllNotificationsReadInListCore({
  notifications = []
} = {}) {
  const list = Array.isArray(notifications) ? notifications : [];
  const unread = list.filter((item) => !item?.read);
  if (!unread.length) {
    return {
      nextNotifications: list,
      unreadIds: [],
      changed: false
    };
  }
  return {
    nextNotifications: list.map((item) => ({ ...(item || {}), read: true })),
    unreadIds: unread.map((item) => String(item?.id || "").trim()).filter(Boolean),
    changed: true
  };
}
