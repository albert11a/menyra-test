// DIE ANTWORTZEIT UND DIE NUMMER-SEITE (29.09., Wunsch Inhaber).
//
// In Heart setzt der Inhaber mit dem Uhr-Knopf, wann Dr. Gashi antwortet;
// die Nummer-Seite (/lifeskin und /lifeskinshop) und die Warteseite zeigen
// dieselbe Zeile. Die Nummer-Seite hat dazu neue Worte bekommen.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

const {
  ANTWORTZEITEN, ANTWORTZEIT_DOK, antwortzeitGueltig, antwortzeitJetzt, antwortzeitSatz, antwortzeitWahl,
  antwortzeitAusDokument, antwortzeitLaden, tagIn
} = await import("../shared/lifeskin-antwortzeit.js");
const { OBERFLAECHE, OBERFLAECHE_WEGE, t } = await import("../apps/lifeskin/lifeskin-content.js");
const { TEXTE } = await import("../apps/lifeskin-astra/astra-texte.js");

// 29.09.2026, 10:00 und 20:00 in Kosovo (UTC+2 im Sommer).
const MORGEN = new Date("2026-09-29T08:00:00Z");
const ABEND = new Date("2026-09-29T18:30:00Z");

// ---------- Die Regel ----------

test("die Liste: Auto, 10/20/30 Min, 1 Std, Heute, Heute Abend, Morgen früh, Morgen", () => {
  assert.deepEqual(ANTWORTZEITEN.map((z) => z.label),
    ["Auto", "10 Min", "20 Min", "30 Min", "1 Std", "Heute", "Heute Abend", "Morgen früh", "Morgen"]);
  assert.equal(ANTWORTZEIT_DOK, "antwortzeit");
  assert.ok(antwortzeitGueltig("20min"));
  assert.ok(!antwortzeitGueltig("gleich"));
});

test("ohne Einstellung gilt die alte Regel der Warteseite: vor 18 Uhr sot, danach nesër në mëngjes", () => {
  const vor = new Date(2026, 8, 29, 17, 59);
  const nach = new Date(2026, 8, 29, 18, 0);
  assert.equal(antwortzeitSatz(null, { jetzt: vor }), "Përgjigja sot");
  assert.equal(antwortzeitSatz(null, { jetzt: nach }), "Përgjigja nesër në mëngjes");
  assert.equal(antwortzeitSatz({ wahl: "auto", gesetztAm: vor.toISOString() }, { jetzt: nach }), "Përgjigja nesër në mëngjes");
  // Genau die Saetze, die die Warteseite schon hatte.
  assert.equal(antwortzeitSatz(null, { jetzt: vor }), t(TEXTE.pritDauerSot, "sq"));
  assert.equal(antwortzeitSatz(null, { jetzt: nach }), t(TEXTE.pritDauerNeser, "sq"));
  assert.equal(antwortzeitSatz(null, { jetzt: vor, sprache: "de" }), t(TEXTE.pritDauerSot, "de"));
});

test("jede Wahl ergibt einen Satz", () => {
  const gesetzt = MORGEN.toISOString();
  const satz = (wahl) => antwortzeitSatz({ wahl, gesetztAm: gesetzt }, { jetzt: MORGEN });
  assert.equal(satz("10min"), "Përgjigja brenda 10 minutave");
  assert.equal(satz("20min"), "Përgjigja brenda 20 minutave");
  assert.equal(satz("30min"), "Përgjigja brenda 30 minutave");
  assert.equal(satz("1h"), "Përgjigja brenda një ore");
  assert.equal(satz("heute"), "Përgjigja sot");
  assert.equal(satz("abend"), "Përgjigja sot në mbrëmje");
  assert.equal(satz("morgenfrueh"), "Përgjigja nesër në mëngjes");
  assert.equal(satz("morgen"), "Përgjigja nesër");
  assert.equal(antwortzeitSatz({ wahl: "20min", gesetztAm: gesetzt }, { jetzt: MORGEN, sprache: "de" }), "Antwort in 20 Minuten");
});

test("Heute/Abend/Morgen gelten nur am Tag, an dem sie gesetzt wurden - Minuten bleiben", () => {
  const gestern = "2026-09-28T19:00:00Z";
  // "Morgen früh" von gestern Abend waere heute eine falsche Zusage.
  assert.equal(antwortzeitJetzt({ wahl: "morgenfrueh", gesetztAm: gestern }, { jetzt: MORGEN }), "heute");
  assert.equal(antwortzeitWahl({ wahl: "morgenfrueh", gesetztAm: gestern }, { jetzt: MORGEN }), "auto");
  assert.equal(antwortzeitJetzt({ wahl: "abend", gesetztAm: gestern }, { jetzt: ABEND }), "morgenfrueh");
  // Am selben Tag gilt sie.
  assert.equal(antwortzeitJetzt({ wahl: "morgenfrueh", gesetztAm: "2026-09-29T05:00:00Z" }, { jetzt: MORGEN }), "morgenfrueh");
  // Minuten und Stunde halten, bis Heart sie aendert.
  assert.equal(antwortzeitJetzt({ wahl: "20min", gesetztAm: "2026-09-20T08:00:00Z" }, { jetzt: MORGEN }), "20min");
  assert.equal(antwortzeitWahl({ wahl: "1h", gesetztAm: "2026-09-20T08:00:00Z" }, { jetzt: MORGEN }), "1h");
  // Der Tag ist der in Kosovo: 23:30 UTC am 28. ist dort schon der 29.
  assert.equal(tagIn("2026-09-28T23:30:00Z"), "2026-09-29");
  assert.equal(antwortzeitWahl(null), "auto");
  assert.equal(antwortzeitWahl({ wahl: "quatsch" }), "auto");
});

test("das Dokument wird gelesen - mit Frist, ohne je den Trichter anzuhalten", async () => {
  assert.deepEqual(antwortzeitAusDokument({ fields: { wahl: { stringValue: "30min" }, gesetztAm: { stringValue: "2026-09-29T08:00:00Z" } } }),
    { wahl: "30min", gesetztAm: "2026-09-29T08:00:00Z" });
  assert.equal(antwortzeitAusDokument({ fields: { wahl: { stringValue: "bald" } } }), null);
  assert.equal(antwortzeitAusDokument(null), null);
  const adressen = [];
  const gut = async (url) => { adressen.push(url); return { ok: true, json: async () => ({ fields: { wahl: { stringValue: "10min" }, gesetztAm: { stringValue: "x" } } }) }; };
  assert.deepEqual(await antwortzeitLaden({ basis: "https://f/documents", tenant: "lifeskin", fetchFn: gut }), { wahl: "10min", gesetztAm: "x" });
  assert.equal(adressen[0], "https://f/documents/lifeskin/lifeskin/config/antwortzeit");
  assert.equal(await antwortzeitLaden({ basis: "https://f/documents", fetchFn: async () => ({ ok: false, status: 404 }) }), null);
  assert.equal(await antwortzeitLaden({ basis: "https://f/documents", fetchFn: async () => { throw new Error("offline"); } }), null);
  const haengt = () => new Promise(() => {});
  const ab = Date.now();
  assert.equal(await antwortzeitLaden({ basis: "https://f/documents", fetchFn: haengt, frist: 30 }), null);
  assert.ok(Date.now() - ab < 1000);
});

test("gespeichert wird in config - keine neue Firestore-Regel noetig", () => {
  const regeln = lies("firestore.rules");
  assert.match(regeln, /match \/config\/\{documentId\} \{\s*allow read: if true;\s*allow write: if isCeoActor\(\);/);
  const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
  assert.match(adapter, /export async function speichereAntwortzeit\(wahl\) \{\s*if \(!antwortzeitGueltig\(wahl\)\) throw/);
  assert.match(adapter, /setDoc\(doc\(db, "lifeskin", TENANT, "config", ANTWORTZEIT_DOK\), einstellung\)/);
  // Nicht in die Konfiguration eingeruehrt (dort steht der Setpreis).
  assert.match(adapter, /\.filter\(\(d\) => d\.id !== ANTWORTZEIT_DOK\)/);
});

// ---------- Heart: der Uhr-Knopf ----------

test("Heart: Uhr-Knopf links neben dem Datum, dieselbe Chipreihe im Kopf", async () => {
  const kopf = lies("apps/mnyra-heart/heart-render.js");
  const uhr = kopf.indexOf('data-action="lifeskin-uhrwahl"\n');
  const datum = kopf.indexOf('heart-icon-button--zeit" data-action="lifeskin-zeitwahl"');
  assert.ok(uhr > 0 && datum > uhr, "der Uhr-Knopf steht links vom Datum-Knopf");
  assert.match(kopf, /heart-icon-button heart-icon-button--uhr" data-action="lifeskin-uhrwahl"\s+aria-label="Antwortzeit: \$\{escapeHtml\(antwortzeitName\(antwortzeit\)\)\}">\$\{renderHeartIcon\("clock"\)\}/);
  assert.match(kopf, /\$\{renderUhrwahl\(antwortzeit\)\}\s*<button class="heart-icon-button heart-zeitwahl__zu" data-action="lifeskin-uhrwahl"/);
  const { renderUhrwahl, antwortzeitName } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const reihe = renderUhrwahl({ wahl: "20min", gesetztAm: new Date().toISOString() });
  assert.deepEqual([...reihe.matchAll(/data-action="lifeskin-antwortzeit" data-wert="([a-z0-9]+)"/g)].map((m) => m[1]),
    ["auto", "10min", "20min", "30min", "1h", "heute", "abend", "morgenfrueh", "morgen"]);
  assert.match(reihe, /heart-zeitwahl__chip heart-zeitwahl__chip--an"\s+data-action="lifeskin-antwortzeit" data-wert="20min" aria-pressed="true">20 Min</);
  assert.match(reihe, /^<div class="heart-zeitwahl heart-zeitwahl--uhr" role="group" aria-label="Antwortzeit">/);
  assert.match(renderUhrwahl(null), /data-wert="auto" aria-pressed="true">Auto</);
  assert.equal(antwortzeitName({ wahl: "1h", gesetztAm: "" }), "1 Std");
  const ereignisse = lies("apps/mnyra-heart/heart-events.js");
  assert.match(ereignisse, /action === "lifeskin-uhrwahl"\) \{\s*operations\.lifeskinUhrwahl\?\.\(\);/);
  assert.match(ereignisse, /action === "lifeskin-antwortzeit"\) \{\s*await operations\.setLifeskinAntwortzeit\?\.\(target\.getAttribute\("data-wert"\)\);/);
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /async setLifeskinAntwortzeit\(id\) \{[\s\S]*?const antwortzeit = await speichereAntwortzeit\(wahl\);\s*actions\.patchLifeskin\(\{ antwortzeit \}\);/);
  // Nur eine Reihe zur Zeit.
  assert.match(heart, /actions\.patchLifeskin\(\{ zeitWahl: stand\.zeitWahl !== true, uhrWahl: false \}\);/);
  assert.match(heart, /actions\.patchLifeskin\(\{ uhrWahl: auf, zeitWahl: false \}\);/);
});

// ---------- Die Nummer-Seite ----------

const SEITEN = ["apps/lifeskin-landing/index.html", "apps/lifeskin-shop/index.html"];
const nummerSeite = (p) => {
  const html = lies(p);
  const auf = html.indexOf('<section class="ls-schirm" id="ls-tel"');
  return html.slice(auf, html.indexOf("</section>", auf));
};

test("die Nummer-Seite auf /lifeskin und im Laden: Hapi i fundit, Titel mit Name, gespeichert, Antwortzeit, Feld, Haken, Përfundo", () => {
  for (const p of SEITEN) {
    const s = nummerSeite(p);
    const reihe = [...s.matchAll(/(?:data-text|id)="(telSchritt|ls-telziel|ls-telgespeichert|telPersoenlich|ls-telantwortzeit|ls-teltitel|ls-telfeld|ls-telhaken|ls-telweiter)"/g)].map((m) => m[1]);
    assert.deepEqual([...new Set(reihe)], ["telSchritt", "ls-telziel", "ls-telgespeichert", "telPersoenlich", "ls-telantwortzeit",
      "ls-teltitel", "ls-telfeld", "ls-telhaken", "ls-telweiter"], p);
    assert.match(s, /<label class="ls-feldtitel" id="ls-teltitel" for="ls-telfeld" data-text="telTitel"><\/label>/, p);
    assert.deepEqual([...s.slice(s.indexOf('id="ls-telhaken"')).matchAll(/<span data-text="(tel[A-Za-z]+)"><\/span><\/li>/g)].map((m) => m[1]),
      ["telTelefonata", "telHakenZweck", "telHakenPrivat"], p);
    assert.match(s, /<button type="button" class="ls-knopf ls-knopf--fertig" id="ls-telweiter" data-text="telFertig" data-kanalfest aria-disabled="true"><\/button>/, p);
    assert.doesNotMatch(s, /ls-vertrauen|ls-telinfo|ls-gesicherttitel/, p);
  }
  // Die alten Seiten behalten ihre Fassung.
  for (const p of ["apps/lifeskin-2/index.html", "apps/lifeskin-trichter/index.html"]) {
    assert.match(lies(p), /id="ls-gesicherttitel"/, p);
    assert.doesNotMatch(lies(p), /id="ls-telziel"/, p);
  }
});

test("die Worte der Nummer-Seite - wie der Inhaber sie geschrieben hat; der Laden ohne Analyse", () => {
  const sq = (k, weg = "") => t(OBERFLAECHE_WEGE[weg]?.[k] || OBERFLAECHE[k], "sq");
  assert.equal(sq("telSchritt"), "Hapi i fundit");
  assert.equal(sq("telZiel"), "Merrni rezultatin tuaj nga Dr. Violeta Gashi");
  assert.equal(sq("telZielName"), "{name}, merrni rezultatin tuaj nga Dr. Violeta Gashi");
  assert.equal(sq("telGespeichertFoto"), "Fotoja dhe përgjigjet tuaja janë ruajtur.");
  assert.equal(sq("telGespeichertScan"), "Fotot dhe përgjigjet tuaja janë ruajtur.");
  assert.equal(sq("telPersoenlich"), "Dr. Violeta Gashi do t’i shqyrtojë personalisht dhe do t’jua dërgojë analizën në WhatsApp.");
  assert.equal(sq("telTitel"), "Numri juaj i WhatsApp-it");
  assert.deepEqual(["telTelefonata", "telHakenZweck", "telHakenPrivat"].map((k) => sq(k)),
    ["Pa telefonata", "Vetëm për analizën tuaj", "Numri juaj mbetet privat"]);
  assert.equal(sq("telFertig"), "Përfundo");
  // Im Laden verspricht die Seite keine Analyse, sondern die Prozentzahl.
  assert.equal(sq("telPersoenlich", "lifeskinshop"),
    "Dr. Violeta Gashi do t’i shqyrtojë personalisht dhe do t’jua dërgojë përqindjen e përputhjes në WhatsApp.");
  assert.equal(sq("telHakenZweck", "lifeskinshop"), "Vetëm për rezultatin tuaj");
  for (const k of ["telSchritt", "telZiel", "telZielName", "telGespeichertFoto", "telGespeichertScan", "telGespeichertOhne",
    "telPersoenlich", "telTitel", "telTelefonata", "telHakenZweck", "telHakenPrivat", "telFertig"]) {
    assert.doesNotMatch(sq(k, "lifeskinshop"), /analiz/i, k);
  }
});

test("der Namensschirm verspricht nicht mehr 'Edhe dy gjëra dhe keni mbaruar'", () => {
  const sq = (k) => t(OBERFLAECHE[k], "sq");
  assert.equal(sq("nameVorsatzNachFragen"), "Faleminderit! Pothuajse keni mbaruar.");
  assert.equal(sq("nameVorsatzFoto"), "Fotoja u ruajt. Pothuajse keni mbaruar.");
  assert.equal(sq("nameVorsatz"), "Skanimi mbaroi. Pothuajse keni mbaruar.");
  for (const k of Object.keys(OBERFLAECHE)) assert.doesNotMatch(sq(k), /Edhe dy gjëra dhe keni mbaruar/, k);
});

test("der Trichter fuellt die Nummer-Seite: Name im Titel, gespeichert je Weg, Antwortzeit, Përfundo", () => {
  const app = lies("apps/lifeskin/lifeskin-app.js");
  assert.match(app, /const ziel = \$\("#ls-telziel"\);\s*if \(ziel\) schreibe\(ziel, name \? this\.text\("telZielName", \{ name \}\) : this\.text\("telZiel"\)\);/);
  assert.match(app, /if \(titel && !ziel\) schreibe\(titel, name \? this\.text\("telTitelName"/);
  assert.match(app, /this\.zustand\.typ === "scan" \? "telGespeichertScan"\s*: mitFoto \? "telGespeichertFoto" : "telGespeichertOhne"/);
  assert.match(app, /const knopfText = knopf\?\.hasAttribute\?\.\("data-kanalfest"\)\s*\? this\.text\(knopf\.dataset\.text\)/);
  // Die Antwortzeit wird geholt, sobald die Fragen beginnen - und spaetestens bei der Nummer.
  assert.match(app, /#aufnahmeFragen\(weg\) \{\s*this\.#antwortzeitHolen\(\);/);
  assert.match(app, /this\.#telFehler\(null\);\s*this\.#antwortzeitHolen\(\);\s*this\.#telKopfFuellen\(\);/);
  assert.match(app, /antwortzeitLaden\(\{ basis: LIFESKIN_FIRESTORE_BASE, tenant: LIFESKIN_TENANT \}\)/);
  assert.match(app, /schreibe\(el, antwortzeitSatz\(this\.antwortzeit, \{ sprache: this\.sprache \}\)\)/);
});

test("die Warteseite zeigt dieselbe Antwortzeit", () => {
  const astra = lies("apps/lifeskin-astra/astra.js");
  assert.match(astra, /#dauerZeigen\(\) \{\s*const el = \$\("#an-pritdauer"\);\s*if \(el\) schreibe\(el, antwortzeitSatz\(this\.antwortzeit, \{ sprache: this\.sprache \}\)\);/);
  assert.match(astra, /const zeitHolen = this\.quelle\.antwortzeit\?\.\(\)\.then/);
  assert.doesNotMatch(astra, /schreibe\(\$\("#an-pritdauer"\), t\(wartetext/);
  assert.match(lies("apps/lifeskin-astra/astra-daten.js"), /antwortzeit\(\) \{\s*return antwortzeitLaden\(\{ basis: LIFESKIN_FIRESTORE_BASE, tenant: LIFESKIN_TENANT, fetchFn: this\.fetchFn, frist: 3000 \}\);/);
});
