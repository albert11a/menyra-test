export function normalizeNotificationItemCore({
  docSnap,
  formatRelative,
  toDateSafe
} = {}) {
  if (!docSnap?.id) return null;
  const data = docSnap.data() || {};
  const formatTime = typeof formatRelative === "function"
    ? formatRelative
    : ((value) => String(value || ""));
  const toDate = typeof toDateSafe === "function"
    ? toDateSafe
    : ((value) => value);
  return {
    id: docSnap.id,
    type: data.type || "system",
    user: data.user || data.userName || "User",
    text: data.text || "folgt dir jetzt",
    time: formatTime(toDate(data.createdAt)),
    img: data.avatar || data.img || "",
    read: !!data.read,
    createdAt: data.createdAt,
    postId: data.postId || "",
    commentId: data.commentId || "",
    userHandle: data.userHandle || data.handle || "",
    userUid: data.userUid || data.uid || "",
    ownerType: data.ownerType || "",
    ownerId: data.ownerId || "",
    restaurantId: data.restaurantId || ""
  };
}

export function mapNotificationSnapshotCore({
  snap,
  normalizeNotificationItem
} = {}) {
  const normalizeItem = typeof normalizeNotificationItem === "function"
    ? normalizeNotificationItem
    : (() => null);
  const items = [];
  snap?.forEach((docSnap) => {
    const item = normalizeItem(docSnap);
    if (item) items.push(item);
  });
  return items;
}
