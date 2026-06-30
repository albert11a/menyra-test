import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const indexHtml = readFileSync(new URL("../apps/menyra-social/index.html", import.meta.url), "utf8");
const socialSw = readFileSync(new URL("../apps/menyra-social/sw.js", import.meta.url), "utf8");

test("social index exposes the current cache-busting build token", () => {
  assert.match(indexHtml, /APP_BUILD_TOKEN = "2026-06-30-public-menu-refresh-02"/);
  assert.doesNotMatch(indexHtml, /2026-06-27-shopping-profile-editor-02/);
});

test("social sw-reset clears current and legacy Menyra service worker caches", () => {
  assert.match(indexHtml, /startsWith\("mnyra-social-cache-"\)/);
  assert.match(indexHtml, /startsWith\("menyra-cache"\)/);
});

test("social service worker public navigation falls back to cached app shell quickly", () => {
  assert.match(socialSw, /STRICT_PUBLIC_NAVIGATION_FETCH_TIMEOUT_MS = 4500/);
  assert.doesNotMatch(socialSw, /STRICT_PUBLIC_NAVIGATION_FETCH_TIMEOUT_MS = 9000/);
  assert.match(socialSw, /const cachedShell = await getCachedAppShellResponse\(\);/);
});
