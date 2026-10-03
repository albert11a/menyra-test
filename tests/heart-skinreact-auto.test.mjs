// SKINREACT AUTO-FREIGABE MIT STOPP-FENSTER (03.10., Entscheidung Inhaber):
// "Wir schauen uns alle Fotos die ganze Zeit an - 5 Sekunden Verzoegerung,
// sollte es nicht stimmen, stoppen wir. Aber es muss auto sein."

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { autoStand, autoAnzeige, AUTO_WARTEN_MS, AUTO_BEREICH } from "../apps/mnyra-heart/heart-skinreact-auto.js";
import { SKINREACT_BEREICHE } from "../shared/lifeskin-skinreact.js";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const JETZT = Date.parse("2026-10-03T09:00:10.000Z");
const AUTO_SEIT = "2026-10-03T08:00:00.000Z";
const scan = (extra = {}) => ({ id: "a".repeat(32), createdAt: "2026-10-03T09:00:00.000Z", photos: ["f"],
  source: { scanWorkflow: "skinreact", weg: "lifeskinshop" }, ...extra });
const stand = (s, bericht, o = {}) => autoStand(s, bericht, { modus: "auto", autoSeit: AUTO_SEIT, jetzt: JETZT, gesehenAm: JETZT, ...o });

test("5 Sekunden, 95-100 %", () => {
  assert.equal(AUTO_WARTEN_MS, 5000);
  assert.equal(AUTO_BEREICH, "95-100");
  assert.ok(SKINREACT_BEREICHE.includes(AUTO_BEREICH));
});

test("der Countdown laeuft ab dem Augenblick, in dem Heart den Scan sieht", () => {
  assert.deepEqual(stand(scan(), {}), { rest: 5000 });
  assert.deepEqual(stand(scan(), {}, { gesehenAm: JETZT - 2000 }), { rest: 3000 });
  assert.deepEqual(stand(scan(), {}, { gesehenAm: JETZT - 9000 }), { rest: 0 });
  assert.deepEqual(autoAnzeige({ rest: 2100 }), { sek: 3, sendet: false });
  assert.deepEqual(autoAnzeige({ rest: 0 }, true), { sek: 0, sendet: true });
});

test("keine Automatik: Manuell, kein SkinReact-Scan, schon freigegeben, aelter als Auto", () => {
  assert.equal(autoStand(scan(), {}, { modus: "hand", autoSeit: AUTO_SEIT, jetzt: JETZT }), null);
  assert.equal(stand(scan({ photos: [] }), {}), null);
  assert.equal(stand(scan({ source: { weg: "lifeskinshop" } }), {}), null);
  assert.equal(stand(scan(), { skinreact: { bereich: "80-85", freigabeAt: "x", art: "produkteignung" } }), null);
  // Das Einschalten von Auto gibt keinen alten Rueckstand frei.
  assert.equal(stand(scan({ createdAt: "2026-10-03T07:59:59.000Z" }), {}), null);
  assert.equal(stand(scan(), {}, { autoSeit: "" }), null);
});

test("Stopp - hier, auf einem anderen Geraet, oder Stufe von Hand gewaehlt", () => {
  assert.deepEqual(stand(scan(), {}, { gestoppt: true }), { gestoppt: true });
  assert.deepEqual(stand(scan(), { skinreactAuto: { gestoppt: true } }), { gestoppt: true });
  assert.deepEqual(stand(scan(), {}, { entwurf: true }), { manuell: true });
  assert.equal(autoAnzeige({ manuell: true }), null);
});

test("Heart schreibt in einer Transaktion: gestoppt oder schon freigegeben -> nichts", () => {
  const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
  const frei = adapter.slice(adapter.indexOf("export async function gibSkinreactAutoFrei"), adapter.indexOf("export async function stoppeSkinreactAuto"));
  assert.match(frei, /return runTransaction\(db, async \(t\) => \{/);
  assert.match(frei, /if \(daten\.skinreactAuto\?\.gestoppt === true\) return "gestoppt";/);
  assert.match(frei, /if \(skinreactErgebnis\(daten\)\) return "schon";/);
  assert.ok(frei.indexOf('return "gestoppt"') < frei.indexOf("t.set("), "erst pruefen, dann schreiben");
  // Der Stopp legt keinen halben Bericht an.
  const stopp = adapter.slice(adapter.indexOf("export async function stoppeSkinreactAuto"));
  assert.match(stopp, /if \(!snapshot\.exists\(\)\) return "lokal";/);
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /if \(stand\?\.rest === 0 && !\(laeuft && jetzt < laeuft\)\) skinreactAutoFreigeben\(id\);/);
  assert.match(heart, /await gibSkinreactAutoFrei\(id, AUTO_BEREICH\)/);
  assert.match(lies("apps/mnyra-heart/heart-events.js"), /action === "lifeskin-skinreact-stopp"/);
});
