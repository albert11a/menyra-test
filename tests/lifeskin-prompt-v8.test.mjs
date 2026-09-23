import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { promptV8Fuellen } from "../apps/mnyra-heart/heart-lifeskin-prompt.js";
import { shitjaLesen, pruefeShitja } from "../shared/lifeskin-shitja.js";
import { raportLesen } from "../shared/lifeskin-analyse.js";
import { pruefeRaportV3, reportToWire } from "../shared/lifeskin-raport-v3.js";

const VORLAGE = readFileSync(new URL("../docs/lifeskin-prompt-v8.txt", import.meta.url), "utf8");

test("v8 traegt alle fuenf Platzhalter und den Block shitja", () => {
  for (const platz of ["{{PATIENT_NAME}}", "{{GENDER}}", "{{AGE}}", "{{ANAMNESIS}}", "{{VERIFIED_PRODUCTS}}"]) {
    assert.ok(VORLAGE.includes(platz), platz);
  }
  assert.match(VORLAGE, /"shitja": \{/);
  assert.match(VORLAGE, /"schema_version": 3/);
});

test("promptV8Fuellen setzt Fall und ganzen Katalog ein - kein Platzhalter bleibt", () => {
  const text = promptV8Fuellen(VORLAGE, {
    name: "Test", ageBand: "25-34", problemi: "Skuqje pas puçrrave", anamnese: {}
  }, [
    { id: "lf-acne", name: "LF ACNE", nenName: { sq: "Terapi kundër aknes" }, veprimi: [{ sq: "Ul bakterin" }], perdorimi: { koha: { sq: "mbrëmje" } } },
    { id: "lf-moistur", name: "LF MOISTUR", veprimi: { sq: ["Rindërton barrierën"] } }
  ]);
  assert.doesNotMatch(text, /\{\{[A-Z_]+\}\}/);
  assert.match(text, /"emri": "Test"/);
  assert.match(text, /"teksti_i_pacientit": "Skuqje pas puçrrave"/);
  assert.match(text, /"id": "lf-moistur"/);
  assert.match(text, /Ul bakterin/);
  assert.match(text, /Rindërton barrierën/);
});

const V3 = {
  schema_version: 3,
  vleresimi: { statusi: "i_vleresueshem" },
  raporti: { fotot: 1, parametrat_e_vleresuar: 0, parametrat_me_gjetje: 0, zonat_e_kontrolluara: 1, zonat_me_ndryshime: 0 },
  ekzaminimi: "", gjetjet: { permbledhja: "x", gjetja_kryesore: "a", gjetja_dyta: "", sipas_zonave: [] },
  parametrat: [], diagnoza: { id: "tjeter", emri: "x", latinisht: "y", niveli: 1, niveli_emri: "Kërkon kujdes parandalues" },
  shpjegimi: ["a", "b"], pa_kujdes: { zbehet: "", nuk_zbehet: "", pas_6_muajsh: "" },
  synimi_28: "", keshilla: "", termat: [],
  nevojat: [{ roli: "kryesor", produkt_id: "lf-acne", gjetja: "g", kerkon: "k", teksti: "t" }]
};

test("shitja reist durch raportLesen und reportToWire", () => {
  const shitja = {
    hyrja: "Për poret e bllokuara në ballë — dy produkte.",
    shqetesimi: "",
    problemet: [{ gjetja: "Pore të bllokuara", ku: "në ballë", produkt_id: "lf-acne", zgjidhja: "LF ACNE i hap." }],
    produktet: [{ produkt_id: "lf-acne", per_ju: ["Hap poret", "", "Qetëson skuqjen", "e katërta"] }],
    dita_28: "Synimi: më pak pore të bllokuara.", pse_tani: "x", whatsapp: "Analiza juaj është gati."
  };
  const r = raportLesen(JSON.stringify({ ...V3, shitja }));
  assert.equal(r.shitja.hyrja, shitja.hyrja);
  assert.deepEqual(r.shitja.produktet[0].per_ju, ["Hap poret", "Qetëson skuqjen", "e katërta"]);
  assert.equal(reportToWire(r).shitja.problemet[0].produkt_id, "lf-acne");
  // Kein "unbekanntes Feld" fuer shitja, keine Hinweise bei stimmigem Block.
  assert.deepEqual(pruefeRaportV3({ ...V3, shitja }).filter((h) => /shitja/.test(h)), []);
});

test("ohne shitja bleibt alles wie vorher", () => {
  const r = raportLesen(JSON.stringify(V3));
  assert.equal(r.shitja, undefined);
  assert.equal("shitja" in reportToWire(r), false);
});

test("pruefeShitja meldet Produkte, die nicht zusammenpassen", () => {
  const hinweise = pruefeShitja({
    hyrja: "x", problemet: [{ gjetja: "a", produkt_id: "lf-pore", zgjidhja: "" }], produktet: []
  }, [{ produkt_id: "lf-acne" }]);
  assert.ok(hinweise.some((h) => /lf-pore/.test(h)));
  assert.ok(hinweise.some((h) => /lf-acne fehlt/.test(h)));
  assert.ok(hinweise.some((h) => /whatsapp/.test(h)));
  assert.equal(shitjaLesen({}), null);
  assert.equal(shitjaLesen("text"), null);
});

test("Therapieseite: kurze Befundzeilen und fette Probleme", async () => {
  globalThis.__LIFESKIN_TEST__ = true;
  const { kurzUndRest, fettNachtragen } = await import("../apps/lifeskin-verkauf/terapia.js");
  assert.deepEqual(
    kurzUndRest("Pore të zgjeruara dhe mikroreliev i pabarabartë, më i dukshëm në faqet pranë hundës."),
    ["Pore të zgjeruara dhe mikroreliev i pabarabartë", "më i dukshëm në faqet pranë hundës"]);
  assert.deepEqual(
    kurzUndRest("Errësim periorbital i dukshëm me vija të holla poshtë syve"),
    ["Errësim periorbital i dukshëm", "me vija të holla poshtë syve"]);
  assert.deepEqual(kurzUndRest("Pore të bllokuara"), ["Pore të bllokuara", ""]);
  assert.equal(
    fettNachtragen("Për poret e bllokuara në ballë — dy produkte.", [{ gjetja: "Poret e bllokuara" }]),
    "Për **poret e bllokuara** në ballë — dy produkte.");
  assert.equal(fettNachtragen("Për **x** dhe y.", [{ gjetja: "y y y" }]), "Për **x** dhe y.");
});

test("festgelegte Produkte gehen in den Prompt, sonst 'keine'", () => {
  const mit = promptV8Fuellen(VORLAGE, { name: "A" }, [], [{ id: "lf-acne", name: "LF ACNE" }, { id: "lf-moistur", name: "LF MOISTUR" }]);
  assert.match(mit, /1\. lf-acne \(LF ACNE\)\n2\. lf-moistur \(LF MOISTUR\)/);
  assert.doesNotMatch(mit, /\{\{FIXED_PRODUCTS\}\}/);
  assert.match(promptV8Fuellen(VORLAGE, { name: "A" }, [], []), /FESTGELEGTE THERAPIE[\s\S]*?\n\nkeine\n/);
});

test("Therapieseite: Produktzahl und Fettdruck im Einstiegssatz", async () => {
  globalThis.__LIFESKIN_TEST__ = true;
  const { hyrjaAbgleichen, fettNachtragen } = await import("../apps/lifeskin-verkauf/terapia.js");
  const satz = "Për puçrrat aktive në faqe dhe skuqjen në mjekër — 1 produkt dhe një plan 28-ditor.";
  const neu = hyrjaAbgleichen(satz, 2, ["lf-acne"]);
  assert.equal(neu, "Për puçrrat aktive në faqe dhe skuqjen në mjekër — 2 produkte, një plan i qartë dhe Dr. Gashi pranë jush çdo javë.");
  assert.equal(hyrjaAbgleichen(satz, 1, ["lf-acne"]), satz);
  assert.match(fettNachtragen(neu, [{ gjetja: "Puçrra të kuqe" }]),
    /^Për \*\*puçrrat aktive në faqe\*\* dhe \*\*skuqjen në mjekër\*\* — 2 produkte/);
});

test("Prompt ohne Foto: dieselben Platzhalter, kein Bild-Vokabular als Anweisung verboten", async () => {
  const ohne = readFileSync(new URL("../docs/lifeskin-prompt-v8-pa-foto.txt", import.meta.url), "utf8");
  for (const platz of ["{{PATIENT_NAME}}", "{{AGE}}", "{{ANAMNESIS}}", "{{VERIFIED_PRODUCTS}}", "{{FIXED_PRODUCTS}}"]) {
    assert.ok(ohne.includes(platz), platz);
  }
  assert.match(ohne, /"shitja": \{/);
  assert.match(ohne, /"shkalla": null, "grada": "nuk vlerësohet"/);
  const text = promptV8Fuellen(ohne, { name: "Anita", ageBand: "35-44", problemi: "Lekure e yndyrshme" }, [], [{ id: "lf-acne", name: "LF ACNE" }]);
  assert.doesNotMatch(text, /\{\{[A-Z_]+\}\}/);
  assert.match(text, /Lekure e yndyrshme/);
  assert.match(text, /1\. lf-acne/);
});

test("Heart waehlt die Analyse-Art nach dem Weg - und nach dem Befund, wenn er freigegeben ist", async () => {
  const { analyseArt } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  assert.equal(analyseArt({ typ: "trup" }, null), "pa-foto");
  assert.equal(analyseArt({ typ: "pytje", photos: [] }, null), "pa-foto");
  assert.equal(analyseArt({ typ: "trup", photos: ["zona"] }, null), "foto");
  assert.equal(analyseArt({ typ: "scan" }, null), "foto");
  // Umgeschaltet und freigegeben: das gilt.
  assert.equal(analyseArt({ typ: "trup" }, { status: "fertig", ohneBild: false }), "foto");
  assert.equal(analyseArt({ typ: "scan" }, { status: "fertig", ohneBild: true }), "pa-foto");
});

test("die Zuordnung 'wofuer' geht mit dem festgelegten Produkt in den Prompt", () => {
  const text = promptV8Fuellen(VORLAGE, { name: "A" }, [], [{ id: "lf-pigment", name: "LF PIGMENT", zweck: "rrudhat rreth syve" }]);
  assert.match(text, /1\. lf-pigment \(LF PIGMENT\) → für: rrudhat rreth syve/);
  assert.match(VORLAGE, /NIEMALS über ein festgelegtes Produkt schreiben, was es NICHT tut/);
  const ohne = readFileSync(new URL("../docs/lifeskin-prompt-v8-pa-foto.txt", import.meta.url), "utf8");
  assert.match(ohne, /JEDER Hinweis, dass ein Foto die Einschätzung genauer/);
});

test("Therapieseite: keine Verneinung ueber das Produkt, ohne Foto kein Foto-Satz", async () => {
  globalThis.__LIFESKIN_TEST__ = true;
  const { ohneVerneinung, ohneFotoSaetze } = await import("../apps/lifeskin-verkauf/terapia.js");
  assert.equal(ohneVerneinung("LF PIGMENT nuk trajton rrudhat; vepron mbi njollat dhe pigmentimin."),
    "LF PIGMENT vepron mbi njollat dhe pigmentimin.");
  assert.equal(ohneVerneinung("LF PIGMENT nuk trajton rrudhat."), "");
  assert.equal(ohneVerneinung("LF ACNE i hap poret."), "LF ACNE i hap poret.");
  assert.equal(ohneFotoSaetze("Rrudhat nuk mund të vlerësohen saktë. Një foto dhe ndjekja javore mund ta bëjnë planin më të saktë. Dr. Gashi ju ndjek."),
    "Dr. Gashi ju ndjek.");
});
