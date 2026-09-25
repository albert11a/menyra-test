// 25.09. (Fall LS-2509-5SH64): Ob Kamera, Gesichtserkennung und Upload bei
// JEDEM Besucher funktionieren, steht jetzt im Klickpfad ("Technik"), und
// der Pfeil in der Foto-Vorschau macht eine neue Aufnahme statt zur Wahl
// zurueckzuspringen.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Sitzung } from "../apps/lifeskin/lifeskin-session.js";

const APP = fs.readFileSync("apps/lifeskin/lifeskin-app.js", "utf8");

test("fotosSpeichern meldet, wie viele angekommen sind, wie gross und wie lange", async () => {
  let n = 0;
  const s = new Sitzung({
    fetchFn: async () => { n += 1; return n === 2 ? { ok: false, status: 403, json: async () => ({}) } : { ok: true, status: 200, json: async () => ({}) }; },
    speicher: null
  });
  const jpeg = "data:image/jpeg;base64," + "A".repeat(4096);
  const e = await s.fotosSpeichern({ a: { jpeg }, b: { jpeg } });
  assert.equal(e.ok + e.fehler, 2);
  assert.equal(e.fehler, 1);
  assert.match(e.grund, /403/);
  assert.ok(e.kb >= 2 && typeof e.ms === "number");
});

test("Technik-Zeilen: Kamera, Gesichtserkennung, Scan verlassen, Upload", () => {
  for (const muster of [
    /Scan-Kamera bereit nach \$\{/,
    /Scan-Kamera Fehler: \$\{/,
    /Gesichtserkennung bereit nach \$\{/,
    /Gesichtserkennung NICHT geladen/,
    /Scan verlassen nach \$\{/,
    /Scan abgebrochen: \$\{schluessel\}/,
    /Foto-Kamera bereit nach \$\{/,
    /Foto-Kamera Fehler: \$\{schluessel\}/,
    /Foto-Upload FEHLGESCHLAGEN/,
    /Fotos hochgeladen: \$\{e\.ok\}/
  ]) assert.match(APP, muster);
  // Jeder Weg zurueck aus der Scan-Kamera meldet, wie weit der Ring war.
  assert.match(APP, /if \(this\.aktiv === "kamera"\) this\.#scanVerlassenMelden\(\);/);
  // Heart zeigt die Zeilen als "Technik".
  assert.match(fs.readFileSync("apps/mnyra-heart/heart-lifeskin-render.js", "utf8"), /technik: "Technik"/);
});

test("der Pfeil in der Foto-Vorschau macht eine neue Aufnahme", () => {
  const i = APP.indexOf('for (const knopf of $$("[data-zurueck]"))');
  const block = APP.slice(i, i + 900);
  assert.match(block, /this\.aktiv === "foto" && \$\("#ls-fotobuehne"\)\?\.dataset\.stand === "vorschau"/);
  assert.match(block, /this\.#fotoNochmal\(\);\s*return;/);
});
