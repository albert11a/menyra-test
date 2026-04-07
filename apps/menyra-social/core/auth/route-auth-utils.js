export function normalizeInitialTab(value) {
  const key = String(value || "").trim().toLowerCase();
  if (!key) return "";
  const aliases = {
    home: "home",
    start: "home",
    startseite: "home",
    landing: "home",
    discover: "search",
    login: "feed",
    register: "feed",
    "business-accounts": "businessAccounts",
    businessaccounts: "businessAccounts"
  };
  const resolved = aliases[key] || key;
  const allowed = new Set([
    "home",
    "feed",
    "chat",
    "search",
    "map",
    "location",
    "profile",
    "menu",
    "orders",
    "leads",
    "staff",
    "customers",
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
