export function shouldSurfaceNativePushNowCore({
  documentObj,
  activeTab = ""
} = {}) {
  if (!documentObj) return true;
  return !(documentObj.visibilityState === "visible" && String(activeTab || "") === "notifications");
}

export function addNotificationItemsToSeenSetCore({
  items = [],
  seenIds
} = {}) {
  if (!(seenIds instanceof Set)) return;
  (Array.isArray(items) ? items : []).forEach((item) => {
    const id = String(item?.id || "").trim();
    if (id) seenIds.add(id);
  });
}

export function collectUnseenUnreadNotificationItemsFromChangesCore({
  changes = [],
  normalizeNotificationItem,
  seenIds
} = {}) {
  const normalizeItem = typeof normalizeNotificationItem === "function"
    ? normalizeNotificationItem
    : (() => null);
  const seen = seenIds instanceof Set ? seenIds : new Set();
  return (Array.isArray(changes) ? changes : [])
    .filter((change) => change?.type === "added" || change?.type === "modified")
    .map((change) => normalizeItem(change?.doc))
    .filter((item) => item && !item.read && !seen.has(item.id));
}
