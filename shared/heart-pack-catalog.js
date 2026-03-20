const HEART_PACKS = Object.freeze([
  {
    key: "smoke",
    label: "Schnelltest starten",
    title: "Schnelltest",
    mode: "smoke",
    workflowMode: "smoke",
    level: "level_1",
    personas: ["ceo"],
    areas: ["auth", "feed", "profile", "business", "menu", "cart", "orders", "chat", "crm", "pwa"],
    summary: "Prueft die wichtigsten Lesepfade schnell und sicher."
  },
  {
    key: "ceo-pack",
    label: "CEO-Test starten",
    title: "CEO-Test",
    mode: "persona",
    workflowMode: "smoke",
    level: "level_2",
    personas: ["ceo"],
    areas: ["auth", "feed", "profile", "business", "menu", "chat", "crm", "pwa"],
    summary: "Prueft die CEO-Steuerflaechen in Social und CRM."
  },
  {
    key: "business-pack",
    label: "Business-Test starten",
    title: "Business-Test",
    mode: "persona",
    workflowMode: "synthetic",
    level: "level_2",
    personas: ["business"],
    areas: ["auth", "business", "menu", "orders", "crm", "pwa"],
    summary: "Prueft Business-Lesepfade und zeigt Schreibpfade klar als sicher oder noch fehlend an."
  },
  {
    key: "staff-pack",
    label: "Service-Test starten",
    title: "Service-Test",
    mode: "persona",
    workflowMode: "smoke",
    level: "level_2",
    personas: ["staff"],
    areas: ["auth", "orders", "business", "pwa"],
    summary: "Prueft die Waiter- und Service-Oberflaeche."
  },
  {
    key: "user-pack",
    label: "Nutzer-Test starten",
    title: "Nutzer-Test",
    mode: "persona",
    workflowMode: "synthetic",
    level: "level_2",
    personas: ["user"],
    areas: ["auth", "feed", "profile", "business", "menu", "cart", "orders", "chat", "pwa"],
    summary: "Prueft Nutzerwege, Feed, Profil, Chat und Commerce."
  },
  {
    key: "guest-pack",
    label: "Gast- / QR-Test starten",
    title: "Gast- / QR-Test",
    mode: "persona",
    workflowMode: "smoke",
    level: "level_2",
    personas: ["guest"],
    areas: ["business", "menu", "cart", "orders", "pwa"],
    summary: "Prueft Menue, Warenkorb und QR-Wege ohne geschuetzte Rechte."
  },
  {
    key: "mutation-pack",
    label: "Schreibtest starten",
    title: "Schreibtest",
    mode: "mutation",
    workflowMode: "synthetic",
    level: "level_3",
    personas: ["business", "user", "ceo"],
    areas: ["feed", "profile", "business", "menu", "cart", "orders", "chat", "crm"],
    summary: "Fuehrt echte Erstellen-, Bearbeiten- und Loesch-Schritte nur im isolierten Modus aus."
  },
  {
    key: "journey-pack",
    label: "Journey-Test starten",
    title: "Journey-Test",
    mode: "journey",
    workflowMode: "smoke",
    level: "level_4",
    personas: ["ceo", "guest"],
    areas: ["feed", "profile", "business", "menu", "orders", "chat", "crm", "pwa"],
    summary: "Prueft Navigation, Scrollen, Modals und wiederholte Wege."
  },
  {
    key: "full-platform-pack",
    label: "Kompletttest starten",
    title: "Kompletttest",
    mode: "synthetic",
    workflowMode: "synthetic",
    level: "level_4",
    personas: ["ceo", "business", "staff", "user", "guest"],
    areas: ["auth", "feed", "profile", "business", "menu", "cart", "orders", "chat", "crm", "pwa"],
    summary: "Prueft alle Rollen, sammelt Nachweise und zeigt klar, was erstellt und aufgeraeumt wurde."
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
