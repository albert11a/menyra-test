// SKINREACT AUTO-FREIGABE AUF DEM SERVER (03.10., Entscheidung Inhaber):
// "So als waere Heart offen" - derselbe 5-Sekunden-Timer, auch ohne Heart.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const regeln = createRequire(import.meta.url)("../functions/lifeskin-skinreact-auto-regeln.js");
const heartAuto = await import("../apps/mnyra-heart/heart-skinreact-auto.js");
const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

const AUTO = { modus: "auto", gesetztAm: "2026-10-03T08:00:00.000Z" };
const sitzung = (extra = {}) => ({ createdAt: "2026-10-03T09:00:00.000Z", photos: ["front"], source: { scanWorkflow: "skinreact", weg: "lifeskinshop" }, ...extra });

test("dieselben 5 Sekunden und dieselbe Stufe wie in Heart", () => {
  assert.equal(regeln.WARTEN_MS, heartAuto.AUTO_WARTEN_MS);
  assert.equal(regeln.BEREICH, heartAuto.AUTO_BEREICH);
});

test("faellig: Auto an, SkinReact-Scan mit Fotos, nach dem Einschalten, frei", () => {
  assert.equal(regeln.autoFaellig({ einstellung: AUTO, sitzung: sitzung(), bericht: {} }), true);
  // Fotos stehen auch als Zahl im Bericht.
  assert.equal(regeln.autoFaellig({ einstellung: AUTO, sitzung: sitzung({ photos: [] }), bericht: { photos: 3 } }), true);
});

test("nicht faellig: Manuell, kein SkinReact, ohne Fotos, alter Fall, gestoppt, schon freigegeben", () => {
  const nein = (o) => assert.equal(regeln.autoFaellig({ einstellung: AUTO, sitzung: sitzung(), bericht: {}, ...o }), false, JSON.stringify(o));
  nein({ einstellung: { modus: "hand", gesetztAm: AUTO.gesetztAm } });
  nein({ einstellung: null });
  nein({ sitzung: sitzung({ source: { weg: "lifeskinshop" } }) });
  nein({ sitzung: sitzung({ photos: [] }), bericht: { photos: 0 } });
  nein({ sitzung: sitzung({ createdAt: "2026-10-03T07:00:00.000Z" }) });
  nein({ bericht: { skinreactAuto: { gestoppt: true } } });
  nein({ bericht: { skinreact: { bereich: "80-85", freigabeAt: "x", art: "produkteignung" } } });
});

test("die Freigabe ist genau das Feld von Dërgo - die Kundenseite liest es", async () => {
  const { skinreactErgebnis } = await import("../shared/lifeskin-skinreact.js");
  const daten = regeln.freigabe("2026-10-03T09:00:05.000Z");
  assert.deepEqual(skinreactErgebnis(daten), { id: "95-100", min: 95, max: 100, text: "95–100%" });
  assert.equal(daten.skinreactAuto.art, "auto");
  assert.equal(regeln.frei(daten), false, "ein zweiter Lauf schreibt nicht noch einmal");
});

test("der Ausloeser: Bericht angelegt -> 5 s warten -> Transaktion, Stopp und Schalter geprueft", () => {
  const quelle = lies("functions/lifeskin-skinreact-auto.js");
  assert.match(quelle, /\.firestore\.document\("lifeskin\/\{tenantId\}\/reports\/\{reportId\}"\)\s*\.onCreate\(/);
  assert.ok(quelle.indexOf("await warte(WARTEN_MS)") < quelle.indexOf("db.runTransaction("), "erst warten, dann schreiben");
  const transaktion = quelle.slice(quelle.indexOf("db.runTransaction("));
  assert.ok(transaktion.indexOf("!frei(aktuell.data() || {})") < transaktion.indexOf("t.set("), "gestoppt/freigegeben vor dem Schreiben");
  assert.ok(transaktion.indexOf('modus !== "auto"') < transaktion.indexOf("t.set("), "Schalter vor dem Schreiben");
  assert.match(lies("functions/index.js"), /exports\.skinreactAutoFreigabe = require\("\.\/lifeskin-skinreact-auto"\)\.skinreactAutoFreigabe;/);
  // Nur Regeln ohne Firebase in der Regeldatei.
  assert.doesNotMatch(lies("functions/lifeskin-skinreact-auto-regeln.js"), /require\("firebase/);
});
