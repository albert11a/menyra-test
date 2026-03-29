"use strict";

// Generated from ../../shared/heart-pack-catalog.js. Do not edit manually.
const HEART_PACKS = Object.freeze([
  {
    key: "guard-pack",
    label: "Aenderungs-Guard starten",
    title: "Aenderungs-Guard",
    mode: "guard",
    workflowMode: "smoke",
    level: "level_1",
    personas: ["ceo", "business", "user", "guest"],
    areas: ["auth", "feed", "profile", "business", "menu", "chat", "search", "map", "pwa", "ui"],
    summary: "Schneller Vor-Commit-Lauf fuer CEO, Business, User und Gast. Prueft Kernpfade, Discovery und mobiles Layout ohne unnötige Tiefe."
  },
  {
    key: "release-pack",
    label: "Release-Gate starten",
    title: "Release-Gate",
    mode: "release",
    workflowMode: "synthetic",
    level: "level_2",
    personas: ["ceo", "business", "user", "guest"],
    areas: ["auth", "feed", "profile", "business", "menu", "cart", "orders", "chat", "search", "map", "pwa", "ui"],
    summary: "Breiter Vor-Push-Lauf fuer CEO, Business, User und Gast mit Kernpfaden, Schreibaktionen, Discovery und Bestellung."
  },
  {
    key: "health-pack",
    label: "Tageslauf starten",
    title: "Tageslauf",
    mode: "health",
    workflowMode: "synthetic",
    level: "level_3",
    personas: ["business", "user", "guest", "ceo"],
    areas: ["auth", "feed", "profile", "business", "menu", "cart", "orders", "chat", "search", "map", "pwa", "ui"],
    summary: "Regelmaessiger Gesundheitscheck fuer Business, User, Gast und CEO. Gedacht fuer wiederkehrende pruefende Laeufe pro Tag."
  },
  {
    key: "smoke",
    label: "CEO-Kontrolllauf starten",
    title: "CEO-Kontrolllauf",
    mode: "smoke",
    workflowMode: "smoke",
    level: "level_1",
    personas: ["ceo"],
    areas: ["auth", "feed", "profile", "business", "menu", "chat", "search", "map", "pwa", "ui"],
    summary: "Prueft die CEO-Steuerflaechen, Navigation, Karte, Suche, Chat und das mobile Layout."
  },
  {
    key: "ceo-pack",
    hidden: true,
    label: "CEO-Test starten",
    title: "CEO-Test",
    mode: "persona",
    workflowMode: "smoke",
    level: "level_2",
    personas: ["ceo"],
    areas: ["auth", "feed", "profile", "business", "menu", "chat", "search", "map", "pwa", "ui"],
    summary: "Prueft die CEO-Steuerflaechen in Social."
  },
  {
    key: "business-pack",
    label: "Business-Volltest starten",
    title: "Business-Volltest",
    mode: "persona",
    workflowMode: "synthetic",
    level: "level_2",
    personas: ["business"],
    areas: ["auth", "feed", "profile", "business", "menu", "chat", "search", "map", "pwa", "ui"],
    summary: "Prueft Business-Oberflaechen, Social-Interaktionen, Produkte, Chat, Karte und Suche."
  },
  {
    key: "staff-pack",
    hidden: true,
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
    label: "User-Volltest starten",
    title: "User-Volltest",
    mode: "persona",
    workflowMode: "synthetic",
    level: "level_2",
    personas: ["user"],
    areas: ["auth", "feed", "profile", "business", "menu", "cart", "orders", "chat", "search", "map", "pwa", "ui"],
    summary: "Prueft Feed, Profil, Foto-Posts, Likes, Kommentare, Folgen, Chat, Karte, Suche und Bestellung."
  },
  {
    key: "guest-pack",
    label: "Gast- / QR-Volltest starten",
    title: "Gast- / QR-Volltest",
    mode: "persona",
    workflowMode: "synthetic",
    level: "level_2",
    personas: ["guest"],
    areas: ["business", "menu", "cart", "orders", "search", "map", "pwa", "ui"],
    summary: "Prueft Karte, Suche, Menue, Warenkorb, Checkout und den oeffentlichen QR-Bestellweg."
  },
  {
    key: "mutation-pack",
    hidden: true,
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
    hidden: true,
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
    hidden: true,
    label: "Kompletttest starten",
    title: "Kompletttest",
    mode: "synthetic",
    workflowMode: "synthetic",
    level: "level_4",
    personas: ["ceo", "business", "user", "guest"],
    areas: ["auth", "feed", "profile", "business", "menu", "cart", "orders", "chat", "search", "map", "pwa", "ui"],
    summary: "Prueft CEO, Business, User und Gast in getrennten Sitzungen."
  }
]);

const HEART_PACK_ALIASES = Object.freeze({
  guard: "guard-pack",
  "change-guard": "guard-pack",
  release: "release-pack",
  gate: "release-pack",
  health: "health-pack",
  daily: "health-pack",
  synthetic: "full-platform-pack",
  full: "full-platform-pack",
  "full-platform": "full-platform-pack",
  ceo: "smoke",
  "ceo-pack": "smoke",
  business: "business-pack",
  staff: "staff-pack",
  user: "user-pack",
  guest: "guest-pack",
  mutation: "mutation-pack",
  journey: "journey-pack"
});

const HEART_VISIBLE_PACK_ORDER = Object.freeze([
  "guard-pack",
  "release-pack",
  "health-pack"
]);

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function clonePack(pack) {
  return pack ? JSON.parse(JSON.stringify(pack)) : null;
}

function getHeartPackCatalog() {
  return HEART_VISIBLE_PACK_ORDER
    .map((key) => HEART_PACKS.find((pack) => pack.key === key))
    .filter(Boolean)
    .map((pack) => clonePack(pack));
}

function resolveHeartPackKey(input = "") {
  const safeKey = asText(input, "smoke").toLowerCase();
  return HEART_PACK_ALIASES[safeKey] || safeKey;
}

function getHeartPack(input = "") {
  const safeKey = resolveHeartPackKey(input);
  const match = HEART_PACKS.find((pack) => pack.key === safeKey);
  return clonePack(match || HEART_PACKS[0]);
}

function listHeartPackQuickActions() {
  return HEART_VISIBLE_PACK_ORDER
    .map((key) => HEART_PACKS.find((pack) => pack.key === key))
    .filter(Boolean)
    .map((pack) => ({
      id: pack.key,
      label: pack.label,
      action: "start-pack",
      packKey: pack.key,
      mode: pack.mode,
      workflowMode: pack.workflowMode,
      note: pack.summary
    }));
}

module.exports = {
  HEART_PACKS,
  HEART_PACK_ALIASES,
  getHeartPackCatalog,
  resolveHeartPackKey,
  getHeartPack,
  listHeartPackQuickActions
};
