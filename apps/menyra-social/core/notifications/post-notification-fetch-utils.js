export function readNotificationPostLookupCore(notif = {}) {
  return {
    postId: String(notif?.postId || "").trim(),
    ownerType: String(notif?.ownerType || "").trim(),
    ownerId: String(notif?.ownerId || notif?.restaurantId || "").trim()
  };
}

export function shouldFetchUserNotificationPostCore({
  ownerType = "",
  ownerId = ""
} = {}) {
  return String(ownerType || "").trim() === "user" && !!String(ownerId || "").trim();
}

export function shouldFetchRestaurantNotificationPostCore({
  ownerType = "",
  ownerId = ""
} = {}) {
  return String(ownerType || "").trim() === "restaurant" && !!String(ownerId || "").trim();
}
