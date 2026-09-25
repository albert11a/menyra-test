// PROMPT v9 (25.09.) - Ton, Einstufung und Produkttexte nach den Kaeufen
// vom 22.-24.09.: "mittel" kaufte, "leicht" nie; die Seite muss sagen
// "ihr habt Probleme, wir wissen welche, wir beseitigen sie" - in 4 Wochen,
// ohne Dauerkauf-Gefuehl, ohne Zoegern vor dem Start.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { promptV8Fuellen } from "../apps/mnyra-heart/heart-lifeskin-prompt.js";

const lies = (p) => fs.readFileSync(p, "utf8");
const MIT = lies("docs/lifeskin-prompt-v9.txt");
const OHNE = lies("docs/lifeskin-prompt-v9-pa-foto.txt");

test("beide v9-Prompts tragen dieselben Regeln fuer Ton und Produkte", () => {
  for (const [name, p] of [["mit Foto", MIT], ["ohne Foto", OHNE]]) {
    for (const teil of [
      "PRODUKTWISSEN – DIE ZIELE JEDES PRODUKTS",
      "DIE STIMME – GILT FÜR JEDEN TEXT",
      "AKNE, NICHT „PUÇRRA\"",
      "DIE THERAPIE DAUERT 4 WOCHEN – NICHT FÜR IMMER",
      "DAS ZIEL IST DIE BESEITIGUNG – NICHT EINE VERBESSERUNG",
      "KEIN ZÖGERN VOR DEM START",
      "largimi i plotë",
      "„çdo ditë\"",
      "„rregullisht\"",
      "„ngadalë\"",
      "„më të qeta\"",
      "ju dërgojmë falas produkte shtesë më të forta",
      "NICHT abschreiben"
    ]) {
      assert.ok(p.includes(teil), `${name}: ${teil} fehlt`);
    }
    // Jedes Produkt hat mehrere Ziele im Wissen.
    for (const id of ["lf-acne", "lf-moistur", "lf-pore", "lf-pigment"]) assert.ok(p.includes(`(${id})`), `${name}: ${id}`);
    // Die Stimme steht vor Teil B, damit sie fuer alle Felder gilt.
    assert.ok(p.indexOf("DIE STIMME") < p.indexOf("TEIL B – DIE THERAPIESEITE"), name);
    // Dasselbe Schema wie v8 - Heart und Seite lesen es unveraendert.
    assert.match(p, /"schema_version": 3/, name);
    assert.match(p, /"dita_28": ""/, name);
  }
  assert.match(OHNE, /nie „pamë", „shihet", „në foto"/);
  assert.match(MIT, /Aktive Akne \(entzündet, mit Eiter\) ist IMMER mindestens Stufe 2/);
});

test("v9 hat genau die Platzhalter, die Heart fuellt", () => {
  for (const p of [MIT, OHNE]) {
    const namen = [...new Set([...p.matchAll(/\{\{([A-Z_]+)\}\}/g)].map((m) => m[1]))].sort();
    assert.deepEqual(namen, ["AGE", "ANAMNESIS", "FIXED_PRODUCTS", "GENDER", "PATIENT_NAME", "VERIFIED_PRODUCTS"]);
    const voll = promptV8Fuellen(p, { name: "A", gender: "f", ageBand: "18-24", anamnese: {} }, [{ id: "lf-acne", name: "LF ACNE" }], []);
    assert.doesNotMatch(voll, /\{\{/);
  }
});

test("die Seite sagt 4 javë, nicht 28 ditë, und laesst niemanden zoegern", () => {
  const html = lies("apps/lifeskin-verkauf/terapia.html");
  const js = lies("apps/lifeskin-verkauf/terapia.js");
  for (const [name, text] of [["html", html], ["js", js.replace(/^\s*\/\/.*$/gm, "")]]) {
    assert.doesNotMatch(text, /28 ditë|28 ditëve|Dita 28|28-ditore|ditët tuaja/, name);
    assert.doesNotMatch(text, /para se të filloni/, name);
    assert.doesNotMatch(text, /ndryshon ngadalë/, name);
  }
  assert.match(js, /kjo është terapia juaj për \$\{WOCHEN\} javë/);
  assert.match(html, /<p id="t-faq2">Brenda 4 javëve/);
});

test("Kur shoh ndryshim? nennt seine Probleme als Ziel", async () => {
  globalThis.__LIFESKIN_TEST__ = true;
  const { faqNdryshimi } = await import("../apps/lifeskin-verkauf/terapia.js");
  assert.equal(faqNdryshimi([]), "");
  assert.equal(
    faqNdryshimi([{ gjetja: "Akne aktive", ku: "në faqe" }, { gjetja: "Skuqje", ku: "në mjekër" }]),
    "Brenda 4 javëve lëkura juaj ndryshon dukshëm – synojmë t'i largojmë plotësisht: akne aktive në faqe, si dhe skuqje në mjekër. Dr. Gashi e kontrollon çdo javë me skanim."
  );
});

test("Morgen/Abend: Lucide-Sonne und -Mond, jedes Produkt ein Schritt", () => {
  const html = lies("apps/lifeskin-verkauf/terapia.html");
  assert.match(html, /rutina__tab--m[\s\S]*?<circle cx="12" cy="12" r="4"\/>/);
  assert.match(html, /rutina__tab--n[\s\S]*?M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z/);
  assert.match(html, /<ol class="rutina__liste" id="t-mengjes" role="tabpanel"/);
  const js = lies("apps/lifeskin-verkauf/terapia.js");
  assert.doesNotMatch(js, /join\(" → "\)/, "Die Produkte stehen wieder als ein langer Text");
  assert.match(js, /zeigen\(\$\("#t-tab-mengjes"\), morgens\.length > 0\)/);
  assert.match(html, /role="tablist"/);
  assert.match(js, /produktBild\(p, "rutina__foto"\)/, "Kein Produktfoto je Zeile");
});

test("was Heart im Bogen fuellt, steht auch auf der Seite", () => {
  const html = lies("apps/lifeskin-verkauf/terapia.html");
  for (const id of ["t-ndryshimet", "t-keshilla", "t-ekzaminimi", "t-termat"]) assert.ok(html.includes(`id="${id}"`), id);
  const js = lies("apps/lifeskin-verkauf/terapia.js");
  for (const feld of ["gjetjaKryesore", "gjetjaDyta", "synimi28", "keshilla", "ekzaminimi", "termat", "fotot", "zonat"]) {
    assert.ok(js.includes(`r.${feld}`), `r.${feld} wird nicht gezeigt`);
  }
  // Beide Arten (mit und ohne Foto) zeigen die Zusaetze.
  assert.equal((js.match(/this\.#bogenZusatz\(r/g) || []).length, 2);
});

test("aeltere Befunde: 28 Tage werden zu 4 Wochen", async () => {
  globalThis.__LIFESKIN_TEST__ = true;
  const { wochenStattTage } = await import("../apps/lifeskin-verkauf/terapia.js");
  assert.equal(wochenStattTage("Pas 28 ditësh, synimi. Brenda 28 ditëve, në 28 ditë."), "Pas 4 javësh, synimi. Brenda 4 javëve, në 4 javë.");
});
