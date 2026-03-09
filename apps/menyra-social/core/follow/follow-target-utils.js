export function buildResolveUserByHandleCandidatesCore({
  handle = "",
  normalizeFollowHandle
} = {}) {
  const rawHandle = String(handle || "").replace(/^@/, "").trim();
  const normalizeHandle = typeof normalizeFollowHandle === "function"
    ? normalizeFollowHandle
    : ((value) => String(value || "").trim());
  const normalizedHandle = normalizeHandle(rawHandle);
  return Array.from(new Set([rawHandle, normalizedHandle].filter(Boolean)));
}

export function deriveFollowTargetIdentityCore(target = {}) {
  let targetType = target?.type || "";
  let targetId = target?.id || "";
  if (!targetType) {
    if (target?.restaurantId) {
      targetType = "restaurant";
      targetId = target.restaurantId;
    } else if (target?.uid) {
      targetType = "user";
      targetId = target.uid;
    }
  }
  return {
    targetType: String(targetType || "").trim(),
    targetId: String(targetId || "").trim()
  };
}

export function isSelfFollowTargetCore({
  targetType = "",
  targetId = "",
  safeHandle = "",
  ownRestaurantId = "",
  ownUid = "",
  ownHandle = ""
} = {}) {
  const type = String(targetType || "").trim();
  const id = String(targetId || "").trim();
  const handle = String(safeHandle || "").trim().toLowerCase();
  const ownRestaurant = String(ownRestaurantId || "").trim();
  const ownUser = String(ownUid || "").trim();
  const ownHandleKey = String(ownHandle || "").replace(/^@/, "").trim().toLowerCase();
  if (type === "restaurant" && ownRestaurant && id === ownRestaurant) return true;
  if (type === "user" && ownUser && id === ownUser) return true;
  if (!id && ownHandleKey && handle === ownHandleKey) return true;
  return false;
}
