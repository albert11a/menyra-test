const HEART_PACKS = Object.freeze([
  {
    key: "smoke",
    label: "Start Smoke",
    title: "Smoke Test",
    mode: "smoke",
    workflowMode: "smoke",
    level: "level_1",
    personas: ["ceo"],
    areas: ["auth", "feed", "profile", "business", "menu", "cart", "orders", "chat", "crm", "pwa"],
    summary: "Fast critical-path health checks with guarded writes only."
  },
  {
    key: "ceo-pack",
    label: "Start CEO Test",
    title: "CEO Pack",
    mode: "persona",
    workflowMode: "smoke",
    level: "level_2",
    personas: ["ceo"],
    areas: ["auth", "feed", "profile", "business", "menu", "chat", "crm", "pwa"],
    summary: "CEO command-surface flow across social and CRM."
  },
  {
    key: "business-pack",
    label: "Start Business Test",
    title: "Business Pack",
    mode: "persona",
    workflowMode: "synthetic",
    level: "level_2",
    personas: ["business"],
    areas: ["auth", "business", "menu", "orders", "crm", "pwa"],
    summary: "Business-owner read paths plus guarded business mutations."
  },
  {
    key: "staff-pack",
    label: "Start Staff Test",
    title: "Staff Pack",
    mode: "persona",
    workflowMode: "smoke",
    level: "level_2",
    personas: ["staff"],
    areas: ["auth", "orders", "business", "pwa"],
    summary: "Waiter or staff surface verification."
  },
  {
    key: "user-pack",
    label: "Start User Test",
    title: "User Pack",
    mode: "persona",
    workflowMode: "synthetic",
    level: "level_2",
    personas: ["user"],
    areas: ["auth", "feed", "profile", "business", "menu", "cart", "orders", "chat", "pwa"],
    summary: "Normal-user browsing and social interaction coverage."
  },
  {
    key: "guest-pack",
    label: "Start Guest Test",
    title: "Guest / QR Pack",
    mode: "persona",
    workflowMode: "smoke",
    level: "level_2",
    personas: ["guest"],
    areas: ["business", "menu", "cart", "orders", "pwa"],
    summary: "Guest and QR menu journey without privileged access."
  },
  {
    key: "mutation-pack",
    label: "Start Mutation Test",
    title: "Mutation Pack",
    mode: "mutation",
    workflowMode: "synthetic",
    level: "level_3",
    personas: ["business", "user", "ceo"],
    areas: ["feed", "profile", "business", "menu", "cart", "orders", "chat", "crm"],
    summary: "Create, edit, delete and interaction mutations in isolated mode only."
  },
  {
    key: "journey-pack",
    label: "Start Journey Test",
    title: "Journey Pack",
    mode: "journey",
    workflowMode: "smoke",
    level: "level_4",
    personas: ["ceo", "guest"],
    areas: ["feed", "profile", "business", "menu", "orders", "chat", "crm", "pwa"],
    summary: "Navigation, scrolling, modals and repeated interaction journeys."
  },
  {
    key: "full-platform-pack",
    label: "Start Full Platform Test",
    title: "Full Platform Test",
    mode: "synthetic",
    workflowMode: "synthetic",
    level: "level_4",
    personas: ["ceo", "business", "staff", "user", "guest"],
    areas: ["auth", "feed", "profile", "business", "menu", "cart", "orders", "chat", "crm", "pwa"],
    summary: "Multi-role platform run with persona packs, guarded mutations and cleanup reporting."
  }
]);

const HEART_PACK_ALIASES = Object.freeze({
  synthetic: "full-platform-pack",
  full: "full-platform-pack",
  "full-platform": "full-platform-pack",
  ceo: "ceo-pack",
  business: "business-pack",
  staff: "staff-pack",
  user: "user-pack",
  guest: "guest-pack",
  mutation: "mutation-pack",
  journey: "journey-pack"
});

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function clonePack(pack) {
  return pack ? JSON.parse(JSON.stringify(pack)) : null;
}

export function getHeartPackCatalog() {
  return HEART_PACKS.map((pack) => clonePack(pack));
}

export function resolveHeartPackKey(input = "") {
  const safeKey = asText(input, "smoke").toLowerCase();
  return HEART_PACK_ALIASES[safeKey] || safeKey;
}

export function getHeartPack(input = "") {
  const safeKey = resolveHeartPackKey(input);
  const match = HEART_PACKS.find((pack) => pack.key === safeKey);
  return clonePack(match || HEART_PACKS[0]);
}

export function listHeartPackQuickActions() {
  return HEART_PACKS.map((pack) => ({
    id: pack.key,
    label: pack.label,
    action: "start-pack",
    packKey: pack.key,
    mode: pack.mode,
    workflowMode: pack.workflowMode,
    note: pack.summary
  }));
}

export {
  HEART_PACKS,
  HEART_PACK_ALIASES
};
