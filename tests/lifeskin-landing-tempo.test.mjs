// Landing schneller: Faelle als WebP (JPEG als Rueckfall), Trichter/Laden/
// Faelle im Build gebuendelt, ueberfluessige modulepreload-Zeilen raus.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("jede eigene Fallaufnahme hat eine WebP daneben und steht in <picture>", () => {
  const html = fs.readFileSync("apps/lifeskin-landing/index.html", "utf8");
  const jpgs = [...html.matchAll(/<img src="\/apps\/lifeskin-landing\/fotot\/(rasti-[a-z0-9-]+)\.jpg"/g)].map((m) => m[1]);
  assert.ok(jpgs.length >= 8);
  for (const name of jpgs) {
    assert.ok(fs.existsSync(`apps/lifeskin-landing/fotot/${name}.webp`), name);
    assert.ok(html.includes(`<source srcset="/apps/lifeskin-landing/fotot/${name}.webp" type="image/webp" />`), name);
  }
});

test("Faelle aus Heart: eigene Fotos mit WebP, fremde Adressen unveraendert", () => {
  const js = fs.readFileSync("apps/lifeskin-landing/raste.js", "utf8");
  const quelle = js.slice(js.indexOf("export function rastiBild"), js.indexOf("export function rastiKarte"));
  const rastiBild = new Function("e", `${quelle.replace("export ", "")}; return rastiBild;`)((w) => String(w).replace(/"/g, "&quot;"));
  assert.match(rastiBild("/apps/lifeskin-landing/fotot/rasti-1-dita1.jpg", "Para"), /^<picture><source srcset="\/apps\/lifeskin-landing\/fotot\/rasti-1-dita1\.webp"/);
  assert.match(rastiBild("https://firebasestorage.googleapis.com/x.jpg", "Para"), /^<img src="https:/);
});

test("der Build buendelt Trichter, Laden und Faelle und raeumt das Vorladen auf", () => {
  const build = fs.readFileSync("scripts/build-vercel-static-output.mjs", "utf8");
  for (const e of ["apps/lifeskin/lifeskin-app.js", "apps/lifeskin-landing/shop.js", "apps/lifeskin-landing/raste.js"]) {
    assert.ok(build.includes(`"${e}"`), e);
  }
  assert.match(build, /metafile: true/);
  assert.match(build, /vorladenAufraeumen/);
});
