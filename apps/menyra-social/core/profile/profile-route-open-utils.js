export function normalizePendingProfileRestaurantIdCore(value = "") {
  return String(value || "").trim();
}

export function isPendingProfileAlreadyOpenCore({
  pendingProfileRestaurantId = "",
  currentProfileRestaurantId = ""
} = {}) {
  const pendingId = String(pendingProfileRestaurantId || "").trim();
  const currentId = String(currentProfileRestaurantId || "").trim();
  if (!pendingId || !currentId) return false;
  return pendingId === currentId;
}

export function normalizeProfileTopTabFromRouteCore(value = "") {
  const key = String(value || "").trim().toLowerCase();
  if (!key) return "";
  if (key === "menu" || key === "karte" || key === "speisekarte" || key === "shop") return "menu";
  if (key === "cart" || key === "basket" || key === "warenkorb") return "cart";
  if (key === "profile" || key === "home" || key === "overview") return "profile";
  return "";
}
