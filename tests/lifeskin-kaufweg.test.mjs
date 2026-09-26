// DER KAUFWEG - Messmarken ohne Inhalte, Auswertung je Gruppe von
// Analyseempfaengern (Auftrag vom 26.09., Punkt 13).

import test from "node:test";
import assert from "node:assert/strict";

import { KAUF_MARKEN, kaufPatch, versionVon, kaufStand, kaufwegKohorten } from "../shared/lifeskin-kaufweg.js";

test("eine Marke ist ein Blatt unter timings.kauf - mit Maske je Blatt", () => {
  const p = kaufPatch("angebot", { version: "ndjekja-1" }, "2026-09-26T10:00:00Z");
  assert.deepEqual(p.daten, { timings: { kauf: { angebot: "2026-09-26T10:00:00Z", v: "ndjekja-1" } }, updatedAt: "2026-09-26T10:00:00Z" });
  assert.deepEqual(p.masken, ["timings.kauf.angebot", "timings.kauf.v", "updatedAt"]);
  const f = kaufPatch("fehler", { version: "ndjekja-1", art: "telefon" }, "t");
  assert.equal(f.daten.timings.kauf.fehlerArt, "telefon");
  assert.ok(f.masken.includes("timings.kauf.fehlerArt"));
  assert.equal(kaufPatch("hautreaktion"), null, "Nur die festen Marken");
  assert.deepEqual(KAUF_MARKEN, ["geoeffnet", "angebot", "betreuung", "knopf", "kasse", "eingabe", "fehler", "gespeichert"]);
});

test("die Fassung eines Empfaengers: gesehen - oder nach dem Tag seiner Analyse", () => {
  assert.equal(versionVon({ timings: { kauf: { v: "ndjekja-1" } } }), "ndjekja-1");
  assert.equal(versionVon({ createdAt: "2026-10-05T10:00:00Z" }), "klassisch");
  assert.equal(versionVon({ createdAt: "2026-10-05T10:00:00Z" }, "2026-10-01"), "ndjekja-1");
  assert.equal(versionVon({ createdAt: "2026-09-25T10:00:00Z" }, "2026-10-01"), "klassisch");
});

test("der Stand eines Falls - storniert zaehlt nie als bestaetigt oder zugestellt", () => {
  const s = { hatBestellt: true, order: { orderId: "LS-1", status: "bestaetigt" }, timings: { kauf: { geoeffnet: "t" } } };
  assert.equal(kaufStand(s, { status: "bestellt" }).bestaetigt, true);
  assert.equal(kaufStand(s, { status: "zugestellt" }).zugestellt, true);
  const storno = { ...s, order: { ...s.order, status: "storniert" } };
  assert.deepEqual([kaufStand(storno, { status: "zugestellt" }).bestaetigt, kaufStand(storno, { status: "zugestellt" }).zugestellt, kaufStand(storno, {}).storniert], [false, false, true]);
  // Klassische Seite: ihre eigenen Marken.
  const alt = kaufStand({ berichtGeoeffnet: true, sahPreis: true, kasseGeoeffnet: true, hatAnschrift: true }, { status: "fertig" });
  assert.deepEqual([alt.geoeffnet, alt.angebot, alt.kasse, alt.eingabe, alt.bestellt, alt.betreuung], [true, true, true, true, false, false]);
});

test("die Gruppen: nur freigegebene Analysen, ohne Testbestellungen, je Fassung", () => {
  const sitzungen = [
    { id: "a", createdAt: "2026-09-20T10:00:00Z", berichtGeoeffnet: true },
    { id: "b", createdAt: "2026-09-21T10:00:00Z", hatBestellt: true, order: { orderId: "B", status: "bestaetigt" }, berichtGeoeffnet: true },
    { id: "c", createdAt: "2026-10-03T10:00:00Z", timings: { kauf: { v: "ndjekja-1", geoeffnet: "t", betreuung: "t" } } },
    { id: "d", createdAt: "2026-10-04T10:00:00Z" },
    { id: "e", createdAt: "2026-10-04T10:00:00Z", hatBestellt: true, order: { orderId: "E", still: true } },
    { id: "f", createdAt: "2026-10-04T10:00:00Z" }
  ];
  const berichte = {
    a: { status: "fertig" }, b: { status: "zugestellt" }, c: { status: "fertig" }, d: { status: "fertig" },
    e: { status: "bestellt" }, f: { status: "wartet" }
  };
  const gruppen = kaufwegKohorten(sitzungen, berichte, { seit: "2026-10-01" });
  assert.deepEqual(gruppen.map((g) => [g.version, g.faelle]), [["klassisch", 2], ["ndjekja-1", 2]]);
  const [alt, neu] = gruppen;
  const zahl = (g, id) => g.stufen.find((x) => x.id === id)?.anzahl;
  assert.deepEqual([zahl(alt, "bestellt"), zahl(alt, "bestaetigt"), zahl(alt, "zugestellt")], [1, 1, 1]);
  assert.equal(alt.stufen.some((x) => x.id === "betreuung"), false, "Die klassische Seite hat keine Begleitung");
  assert.equal(zahl(neu, "betreuung"), 1);
  assert.equal(zahl(neu, "geoeffnet"), 1, "d hat nie geoeffnet - bleibt trotzdem in der neuen Gruppe");
  assert.equal(neu.stufen.find((x) => x.id === "empfaenger").anteil, 1);
  // Zeitraum.
  assert.equal(kaufwegKohorten(sitzungen, berichte, { von: "2026-10-01" }).reduce((n, g) => n + g.faelle, 0), 2);
});
