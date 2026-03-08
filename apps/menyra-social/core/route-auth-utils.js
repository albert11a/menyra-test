export function normalizeInitialTab(value) {
  const key = String(value || "").trim().toLowerCase();
  if (!key) return "";
  const aliases = {
    discover: "search",
    login: "feed",
    register: "feed"
  };
  const resolved = aliases[key] || key;
  const allowed = new Set([
    "feed",
    "chat",
    "search",
    "map",
    "profile",
    "menu",
    "orders",
    "leads",
    "staff",
    "customers",
    "settings"
  ]);
  return allowed.has(resolved) ? resolved : "";
}

export function normalizeAuthMode(value) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "register" || key === "signup") return "register";
  if (key === "login" || key === "signin") return "login";
  return "";
}
