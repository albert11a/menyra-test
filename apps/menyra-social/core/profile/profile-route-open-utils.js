import { normalizePublicBusinessTopTabCore } from "../router/public-business-route-utils.js";

export function normalizePendingProfileRestaurantIdCore(value = "") {
  return String(value || "").trim();
}

export function isPendingProfileAlreadyOpenCore({
  pendingProfileRestaurantId = "",
  currentProfileRestaurantId = "",
  currentProfileTruthState = ""
} = {}) {
  const pendingId = String(pendingProfileRestaurantId || "").trim();
  const currentId = String(currentProfileRestaurantId || "").trim();
  if (!pendingId || !currentId) return false;
  const truthState = String(currentProfileTruthState || "").trim().toLowerCase();
  if (
    truthState === "route-pending-loading"
    || truthState === "loading"
    || truthState === "pending"
  ) {
    return false;
  }
  return pendingId === currentId;
}

export function normalizeProfileTopTabFromRouteCore(value = "") {
  const key = normalizePublicBusinessTopTabCore(value, "");
  if (!key) return "";
  if (key === "landing" || key === "menu" || key === "cart" || key === "profile") return key;
  return "";
}
