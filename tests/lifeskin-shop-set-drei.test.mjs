// /lifeskinshop mit 2 oder 3 Mitteln (Inhaber 07.10.): Traegt das Set aus
// Heart LF CLEAN, steht die ganze Seite fuer drei Mittel da - sonst genau
// wie bisher. Am Pixel aendert sich dabei nichts (lifeskin-pixel-sperre).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { acneDuoSets, acneDuoCart } from "../apps/lifeskin-shop/shop.js";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");
const set = (produkte, cmimi = 19) => ({ id: "acne", aktiv: true, produkte, cmimi });

test("das Akne-Set gilt mit 2 Mitteln oder mit LF CLEAN als drittem", () => {
  assert.equal(acneDuoSets([set(["lf-acne", "lf-moistur"])]).length, 1);
  assert.equal(acneDuoSets([set(["lf-clean", "lf-acne", "lf-moistur"], 39)]).length, 1);
  assert.equal(acneDuoSets([set(["lf-acne", "lf-moistur", "lf-pore"])]).length, 0, "nur LF CLEAN darf dazukommen");
  assert.equal(acneDuoSets([set(["lf-clean", "lf-acne"])]).length, 0, "ohne LF MOISTUR kein Set");
  assert.equal(acneDuoSets([set(["lf-acne", "lf-acne", "lf-moistur"])]).length, 0);
});

test("der Korb traegt das ganze Set zu seinem Preis aus Heart", () => {
  const drei = acneDuoSets([set(["lf-clean", "lf-acne", "lf-moistur"], 39)]);
  assert.deepEqual(acneDuoCart({ ids: ["lf-acne", "lf-moistur", "lf-clean"] }, drei),
    { ids: ["lf-clean", "lf-acne", "lf-moistur"], set: "acne", cmimi: 39 });
  // Ein alter 2er-Korb passt nicht mehr zum 3er-Set - er wird geleert.
  assert.deepEqual(acneDuoCart({ ids: ["lf-acne", "lf-moistur"] }, drei), { ids: [], set: "" });
  const zwei = acneDuoSets([set(["lf-acne", "lf-moistur"])]);
  assert.deepEqual(acneDuoCart({ ids: ["lf-acne", "lf-moistur"] }, zwei), { ids: ["lf-acne", "lf-moistur"], set: "acne", cmimi: 19 });
});

test("jede Stelle der Seite hat beide Fassungen, ohne Merkmal steht die 2er-Fassung", () => {
  const html = lies("apps/lifeskin-shop/index.html");
  const zwei = html.match(/<ls-zwei>/g)?.length || 0;
  assert.ok(zwei >= 20, "zu wenige umschaltbare Stellen");
  assert.equal((html.match(/<ls-drei>/g) || []).length, zwei);
  assert.match(html, /html:not\(\[data-set-produkte="3"\]\) \.nur-drei,html:not\(\[data-set-produkte="3"\]\) ls-drei\{display:none!important\}/);
  assert.match(html, /html\[data-set-produkte="3"\] ls-zwei\{display:none!important\}/);
  // Ohne die Umschaltung: kein Text fuer drei Mittel sichtbar im HTML.
  const ohneDrei = html.replace(/\/\*[\s\S]*?\*\//g, "").replace(/<ls-drei>[\s\S]*?<\/ls-drei>/g, "").replace(/<(article|div) class="[^"]*nur-drei[^"]*">[\s\S]*?<\/\1>/g, "");
  assert.doesNotMatch(ohneDrei, /LF CLEAN|TRE PRODUKTET|Të trija/);
  assert.match(lies("apps/lifeskin-shop/shop.js"), /setAttribute\("data-set-produkte", drei \? "3" : "2"\)/);
});

test("Heart: das Akne-Set hat die Knoepfe Me 2 produkte · 19 € und Me 3 produkte · 39 €", async () => {
  const { ACNE_FASSUNGEN, acneFassung } = await import("../shared/lifeskin-shop-sets.js");
  const { renderShopSetet } = await import("../apps/mnyra-heart/heart-lifeskin-shopsets.js");
  assert.deepEqual({ ...ACNE_FASSUNGEN[2], produkte: [...ACNE_FASSUNGEN[2].produkte] }, { produkte: ["lf-acne", "lf-moistur"], cmimi: 19 });
  assert.deepEqual({ ...ACNE_FASSUNGEN[3], produkte: [...ACNE_FASSUNGEN[3].produkte] }, { produkte: ["lf-clean", "lf-acne", "lf-moistur"], cmimi: 39 });
  assert.equal(acneFassung(set(["lf-acne", "lf-moistur"])), 2);
  assert.equal(acneFassung(set(["lf-clean", "lf-acne", "lf-moistur"])), 3);
  assert.equal(acneFassung(set(["lf-pore", "lf-moistur"])), 0);
  const html = renderShopSetet({ shopSetet: [
    { id: "acne", titulli: "Seti kundër akneve", produkte: ["lf-acne", "lf-moistur"], cmimi: 19, aktiv: true },
    { id: "pore", titulli: "Seti për poret", produkte: ["lf-pore", "lf-moistur"], aktiv: false }] }, []);
  // Nur das Akne-Set bekommt die zwei Knoepfe; die aktuelle Fassung ist markiert.
  assert.equal(html.split('data-action="lifeskin-shopset-fassung"').length - 1, 2);
  assert.match(html, /aria-pressed="true"[^>]*>✓ Me 2 produkte · 19 €/);
  assert.match(html, /aria-pressed="false"[^>]*>Me 3 produkte · 39 €/);
  assert.match(lies("apps/mnyra-heart/heart.js"), /produkte: \[\.\.\.fassung\.produkte\], cmimi: fassung\.cmimi/);
  assert.match(lies("apps/mnyra-heart/heart-events.js"), /lifeskin-shopset-fassung/);
});
