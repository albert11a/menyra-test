// LIFESKIN SHOP - DIE ZWEI PRODUKTBILDER "DY PRODUKTET" (08.10., Inhaber):
// neue Standardbilder, in Heart je Produkt austauschbar (3:4); Pfeile und
// Punkte im Set-Bild schwarz.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("Shop: beide Bilder mit Standardbild und Kennung fuer Heart", async () => {
  const { SHOP_PRODUKT_FOTOS, SHOP_PRODUKT_FOTO_PRAEFIX } = await import("../shared/lifeskin-shop-sets.js");
  assert.deepEqual(SHOP_PRODUKT_FOTOS.map((p) => p.id), ["lf-acne", "lf-moistur"]);
  assert.equal(SHOP_PRODUKT_FOTO_PRAEFIX, "shopProduktFoto-");
  const html = lies("apps/lifeskin-shop/index.html");
  for (const p of SHOP_PRODUKT_FOTOS) {
    assert.match(html, new RegExp(`<img src="${p.standard}"[^>]*data-produkt-foto="${p.id}"`));
    assert.ok(existsSync(new URL(`..${p.standard}`, import.meta.url)), p.standard);
  }
  const js = lies("apps/lifeskin-shop/shop.js");
  assert.match(js, /async #produktFotosLaden\(\)/);
  assert.match(js, /holeDok\(`\$\{SHOP_PRODUKT_FOTO_PRAEFIX\}\$\{id\}`, this\.holen\)/);
  assert.match(js, /shopBeiSicht\(\$\("#setet", this\.dok\), \(\) => \{ void this\.#produktDatenLaden\(\); void this\.#produktFotosLaden\(\); \}\);/);
});

test("Heart: Block 'Shop-Produktbilder' und Zuschnitt 3:4", async () => {
  const { renderShopProduktFotos, renderShopProduktFotoEditor } = await import("../apps/mnyra-heart/heart-lifeskin-shopsets.js");
  const leer = renderShopProduktFotos({});
  assert.match(leer, /Shop-Produktbilder/);
  assert.match(leer, /src="\/apps\/lifeskin-shop\/assets\/produkt-lf-acne\.jpg"/);
  assert.equal((leer.match(/data-action="lifeskin-produktfoto-waehlen"/g) || []).length, 2);
  assert.doesNotMatch(leer, /lifeskin-produktfoto-weg/, "ohne eigenes Bild kein 'Standardbild'-Knopf");
  const eigen = renderShopProduktFotos({ shopProduktFotos: { "lf-moistur": "data:image/jpeg;base64,AA" } });
  assert.match(eigen, /src="data:image\/jpeg;base64,AA"/);
  assert.match(eigen, /data-action="lifeskin-produktfoto-weg" data-id="lf-moistur"/);
  const editor = renderShopProduktFotoEditor({ produktFotoId: "lf-acne", produktFotoRoh: "data:image/jpeg;base64,AA" });
  assert.match(editor, /LF ACNE zuschneiden/);
  assert.match(editor, /aspect-ratio:0\.75/);
  assert.match(editor, /data-action="lifeskin-produktfoto-speichern"/);
  const events = lies("apps/mnyra-heart/heart-events.js");
  for (const a of ["waehlen", "zu", "speichern", "weg"]) assert.match(events, new RegExp(`"lifeskin-produktfoto-${a}"`));
  const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
  assert.match(adapter, /export async function speichereShopProduktFoto\(id, foto\)/);
  assert.match(adapter, /\.filter\(\(d\) => !String\(d\.id\)\.startsWith\(SHOP_PRODUKT_FOTO_PRAEFIX\)\)/, "nicht in die Konfiguration einruehren");
});

test("Pfeile und Punkte im Set-Bild schwarz", () => {
  const css = lies("apps/lifeskin-shop/shop-youth.css");
  assert.match(css, /#ls-einstieg \.page \.hero-pfeil\{background:var\(--ink\);color:#fff;/);
  assert.match(css, /#ls-einstieg \.page \.hero-pikat i\[data-an="ja"\]\{background:var\(--ink\)\}/);
});
