import { resolveVisibleAppTab } from "../../../../shared/config/marketplace-tabs.js";

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
    businessaccounts: "businessAccounts",
    "ofertat-biznes": "ofertatbiznes"
  };
  const resolved = aliases[key] || key;
  const allowed = new Set([
    "feed",
    "restaurants",
    "ofertat",
    "ofertatbiznes",
    "travel",
    "shopping",
    "chat",
    "search",
    "map",
    "location",
    "profile",
    "dashboard",
    "menu",
    "orders",
    "notifications",
    "upload",
    "staff",
    "businessAccounts",
    "settings"
  ]);
  if (!allowed.has(resolved)) return "";
  // travel/shopping bleiben bekannte Ziele, werden aber auf den sichtbaren
  // Ersatztab gefuehrt, solange ihr Feature-Flag aus ist.
  return resolveVisibleAppTab(resolved);
}

export function normalizeAuthMode(value) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "register" || key === "signup") return "register";
  if (key === "login" || key === "signin") return "login";
  return "";
}
