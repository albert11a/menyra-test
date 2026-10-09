// /dergesat ALS APP (09.10., Inhaber): das gelbe Mnyra-Icon auf dem
// Home-Bildschirm (Android: Manifest, iPhone: apple-touch-icon).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("Manifest und Icons fuer /dergesat", () => {
  const html = lies("apps/lifeskin-dergesat/index.html");
  assert.match(html, /<link rel="manifest" href="\/apps\/lifeskin-dergesat\/manifest\.webmanifest">/);
  assert.match(html, /<link rel="apple-touch-icon" href="\/apps\/lifeskin-dergesat\/assets\/apple-touch-icon\.png">/);
  assert.match(html, /<meta name="apple-mobile-web-app-title" content="Dërgesat">/);
  const m = JSON.parse(lies("apps/lifeskin-dergesat/manifest.webmanifest"));
  assert.equal(m.start_url, "/dergesat");
  assert.equal(m.scope, "/dergesat");
  assert.equal(m.display, "standalone");
  assert.deepEqual(m.icons.map((i) => i.sizes), ["192x192", "512x512"]);
  for (const datei of ["icon-192.png", "icon-512.png", "apple-touch-icon.png"]) {
    const neu = readFileSync(new URL(`../apps/lifeskin-dergesat/assets/${datei}`, import.meta.url));
    const gelb = readFileSync(new URL(`../apps/waiter/assets/${datei}`, import.meta.url));
    assert.ok(neu.equals(gelb), `${datei}: das gelbe Mnyra-Icon`);
  }
  for (const i of m.icons) assert.ok(existsSync(new URL(`..${i.src}`, import.meta.url)), i.src);
});
