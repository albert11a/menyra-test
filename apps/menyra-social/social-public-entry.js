const PUBLIC_ENTRY_BUILD_TOKEN = "2026-05-02-public-entry-boundary-01";

function readAppBuildToken() {
  return String(
    globalThis?.__MENYRA_SOCIAL_APP_VERSION__
    || PUBLIC_ENTRY_BUILD_TOKEN
  ).trim() || PUBLIC_ENTRY_BUILD_TOKEN;
}

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

async function loadSocialApp() {
  const appBuildToken = readAppBuildToken();
  const appUrl = `/apps/menyra-social/social-app.js?v=${encodeURIComponent(appBuildToken)}`;
  markEntryTimeline("mnyra.social.public_entry.app_import.start");
  try {
    await import(appUrl);
    setDegraded("app-entry", { active: false, message: "" });
  } catch (err) {
    setDegraded("app-entry", {
      active: true,
      message: "Website konnte nicht vollstaendig geladen werden."
    });
    console.error("[mnyra][public-entry] social app import failed", err);
    throw err;
  } finally {
    markEntryTimeline("mnyra.social.public_entry.app_import.end");
  }
}

try {
  globalThis.__MENYRA_SOCIAL_PUBLIC_ENTRY_ACTIVE__ = true;
  globalThis.__MENYRA_SOCIAL_ENTRY_MODE__ = "public";
  globalThis.__MENYRA_SOCIAL_PUBLIC_ENTRY_VERSION__ = PUBLIC_ENTRY_BUILD_TOKEN;
} catch {}

markEntryTimeline("mnyra.social.public_entry.start");
void loadSocialApp();
