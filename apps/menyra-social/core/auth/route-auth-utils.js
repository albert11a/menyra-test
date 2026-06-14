export function normalizeInitialTab(value) {
  const key = String(value || "").trim().toLowerCase();
  if (!key) return "";
  const aliases = {
    home: "feed",
    start: "feed",
    startseite: "feed",
    landing: "feed",
    discover: "search",
    owner: "profile",
    kitchen: "menu",
    login: "feed",
    register: "feed",
    "business-accounts": "businessAccounts",
    businessaccounts: "businessAccounts"
  };
  const resolved = aliases[key] || key;
  const allowed = new Set([
    "feed",
    "restaurants",
    "travel",
    "shopping",
    "chat",
    "search",
    "map",
    "location",
    "profile",
    "menu",
    "orders",
    "notifications",
    "upload",
    "staff",
    "businessAccounts",
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
