export function normalizePendingNotificationIdCore(value = "") {
  return String(value || "").trim();
}

export function findNotificationByIdCore({
  notifications = [],
  notificationId = ""
} = {}) {
  const safeId = String(notificationId || "").trim();
  if (!safeId) return null;
  return (Array.isArray(notifications) ? notifications : [])
    .find((item) => String(item?.id || "") === safeId) || null;
}

export function prependNotificationByIdCore({
  notifications = [],
  notificationItem = null,
  notificationId = ""
} = {}) {
  if (!notificationItem) return Array.isArray(notifications) ? notifications : [];
  const safeId = String(notificationId || notificationItem?.id || "").trim();
  const list = Array.isArray(notifications) ? notifications : [];
  return [
    notificationItem,
    ...list.filter((item) => String(item?.id || "") !== safeId)
  ];
}
