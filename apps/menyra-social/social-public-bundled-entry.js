const PUBLIC_ENTRY_BUILD_TOKEN = "2026-05-07-public-menu-focus-lockstep-01";

function setDegraded(kind, payload = {}) {
  const setter = typeof globalThis?.__MENYRA_SOCIAL_SET_DEGRADED__ === "function"
    ? globalThis.__MENYRA_SOCIAL_SET_DEGRADED__
    : null;
  if (!setter) return;
  try {
    setter(kind, payload);
  } catch {}
}

function markEntryTimeline(name) {
  try {
    globalThis?.performance?.mark?.(name);
  } catch {}
}

async function loadBundledSocialApp() {
  markEntryTimeline("mnyra.social.public_entry.app_import.start");
  try {
    await import("./social-app.js");
    setDegraded("app-entry", { active: false, message: "" });
  } catch (err) {
    setDegraded("app-entry", {
      active: true,
      message: "Website konnte nicht vollstaendig geladen werden."
    });
    console.error("[mnyra][public-entry] bundled social app import failed", err);
    throw err;
  } finally {
    markEntryTimeline("mnyra.social.public_entry.app_import.end");
  }
}

try {
  globalThis.__MENYRA_SOCIAL_PUBLIC_ENTRY_ACTIVE__ = true;
  globalThis.__MENYRA_SOCIAL_ENTRY_MODE__ = "public";
  globalThis.__MENYRA_SOCIAL_PUBLIC_ENTRY_VERSION__ = PUBLIC_ENTRY_BUILD_TOKEN;
  globalThis.__MENYRA_SOCIAL_BUNDLED_ENTRY_PREPARED__ = true;
} catch {}

markEntryTimeline("mnyra.social.public_entry.start");
await loadBundledSocialApp();
