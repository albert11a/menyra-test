// DIE GARANTIE - kurz und lang derselbe Ablauf, auf Landing, Therapieseite
// und in der Kasse (Auftrag vom 26.09., Punkt 10).

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { garancia, GARANCIA_START } from "../shared/lifeskin-garancia.js";
import { STANDARD_KONFIG } from "../apps/lifeskin/lifeskin-catalog.js";

const TAGE = STANDARD_KONFIG.rueckgabeTage;

test("die Garantie: 45 Tage ab Erhalt des Pakets, erst anpassen, dann Geld", () => {
  const g = garancia(TAGE);
  assert.equal(g.tage, 45);
  assert.equal(g.kurz, "45 ditë garanci");
  assert.match(g.permbledhje, /nga marrja e pakos/);
  assert.match(g.permbledhje, /Së pari e përshtatim rutinën/);
  assert.equal(g.kushtet[0], `Afati është 45 ditë ${GARANCIA_START}.`);
  assert.ok(g.kushtet.some((k) => /Së pari shohim si ka reaguar lëkura/.test(k)));
  assert.ok(g.kushtet.some((k) => /nuk është garanci për një rezultat mjekësor/.test(k)));
  assert.equal(garancia(0), null);
  assert.equal(garancia(TAGE, { nachnahme: false }).kushtet.some((k) => /te dera/.test(k)), false);
});

test("die kurze Zusage verspricht keinen anderen Ablauf als die Bedingungen", () => {
  const g = garancia(TAGE);
  // Kein "Geld sofort": Wo Geld steht, steht auch die Anpassung davor.
  for (const text of [g.permbledhje, ...g.kushtet]) {
    if (/kthejmë|kthehen/.test(text)) assert.match(text, /Së pari|pas kësaj|nuk shihni ndryshim/, text);
  }
});

test("die Landingpage beschreibt denselben Ablauf - dieselbe Frist, derselbe Startpunkt", () => {
  const html = readFileSync(new URL("../apps/lifeskin-landing/index.html", import.meta.url), "utf8");
  const abschnitt = html.slice(html.indexOf('id="garancia"'), html.indexOf("PYETJET"));
  assert.match(abschnitt, new RegExp(`Afati është ${TAGE} ditë ${GARANCIA_START}`));
  assert.match(abschnitt, /Së pari/);
  assert.match(abschnitt, /rutin/);
  assert.match(abschnitt, /Nëse edhe pas kësaj nuk shihni ndryshim/);
});

test("die neue Fassung der Therapieseite nimmt Garantie aus dieser einen Quelle", () => {
  const js = readFileSync(new URL("../apps/lifeskin-verkauf/terapia.js", import.meta.url), "utf8");
  assert.match(js, /import \{ garancia \} from "\.\.\/\.\.\/shared\/lifeskin-garancia\.js"/);
  assert.match(js, /const g = this\.neu \? garancia\(tage, \{ nachnahme \}\) : null;/);
  // Die klassische Fassung bleibt wortgleich (Vorschau zuerst).
  assert.match(js, /`\$\{tage\} ditë – ose ju kthejmë paratë\.`/);
});
