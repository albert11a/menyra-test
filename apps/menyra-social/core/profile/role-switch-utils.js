export function normalizeRoleListCore(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim().toLowerCase())
      .filter(Boolean);
  }
  return String(value)
    .split(/[,\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function roleLabelCore(role, {
  labels = {}
} = {}) {
  if (!role) return "";
  const key = String(role || "").toLowerCase();
  return labels[key] || (key.charAt(0).toUpperCase() + key.slice(1));
}

export function buildRoleSwitchUrlCore({
  role,
  profile,
  restaurantIdOverride = "",
  roleTabMap = {},
  buildUrlFn,
  buildPathFn
} = {}) {
  const buildUrlSafe = typeof buildUrlFn === "function" ? buildUrlFn : null;
  if (!buildUrlSafe) return "";
  const ownerRestaurantId = restaurantIdOverride || profile?.restaurantId || "";
  const tab = roleTabMap?.[role] || "";
  const buildPathSafe = typeof buildPathFn === "function" ? buildPathFn : null;
  const params = {};
  let targetPath = "";
  if (buildPathSafe && tab) {
    targetPath = String(buildPathSafe(tab) || "").trim();
  }
  if (!targetPath && tab) params.tab = tab;
  if (role === "owner" && ownerRestaurantId) params.r = ownerRestaurantId;
  return buildUrlSafe(targetPath || "apps/menyra-social/index.html", params);
}
