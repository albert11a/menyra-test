import test from "node:test";
import assert from "node:assert/strict";
import { pfadPatch, pfadLesen, pfadKennung } from "../shared/lifeskin-klickpfad.js";
import { ohnePfad } from "../apps/mnyra-heart/heart-lifeskin-live.js";
import { klickpfadInteressen, renderSitzungDetail } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { normalisiere } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

test("der Klickpfad schreibt je Eintrag eine eigene Maske unter timings.pfad", () => {
  const { daten, masken } = pfadPatch([
    { id: "eabc01", t: "2026-09-23T10:00:00.000Z", s: "Therapieseite", e: "klick", d: "Fillo terapinë" },
    { id: "eabc02", t: "2026-09-23T10:00:05.000Z", s: "Therapieseite", e: "gesehen", d: "Fragen · 12 s" }
  ]);
  // Ohne updatedAt - sonst zieht jeder Stapel Heart in eine Neuberechnung.
  assert.deepEqual(masken, ["timings.pfad.eabc01", "timings.pfad.eabc02"]);
  assert.equal(daten.updatedAt, undefined);
  // Nie "timings" oder "timings.pfad" als Ganzes - das loeschte alles andere.
  assert.ok(!masken.includes("timings") && !masken.includes("timings.pfad"));
  assert.equal(daten.timings.pfad.eabc02.d, "Fragen · 12 s");
  assert.match(pfadKennung(), /^e[0-9a-z]+$/);
});

test("Heart liest den Pfad zeitlich und fasst die Interessen zusammen", () => {
  const sitzung = normalisiere("abcdef12", {
    step: "result",
    timings: { pfad: {
      e2: { t: "2026-09-23T10:00:09Z", s: "Therapieseite", e: "gesehen", d: "Was drin ist · 40 s" },
      e1: { t: "2026-09-23T10:00:01Z", s: "Therapieseite", e: "aufgeklappt", d: "Kur shoh ndryshim? · Fragen" },
      e3: { t: "2026-09-23T10:01:00Z", s: "Therapieseite", e: "gesehen", d: "Was drin ist · 30 s" },
      e4: { t: "2026-09-23T10:02:00Z", s: "Therapieseite", e: "klick", d: "Fillo terapinë — 53 €" }
    } }
  });
  const pfad = pfadLesen(sitzung);
  assert.deepEqual(pfad.map((e) => e.id), ["e1", "e2", "e3", "e4"]);
  const { oben, auf, klicks } = klickpfadInteressen(pfad);
  assert.deepEqual(oben[0], ["Was drin ist", 70]);
  assert.deepEqual(auf, ["Kur shoh ndryshim?"]);
  assert.equal(klicks, 1);
  const html = renderSitzungDetail(sitzung, {}, "", [], null);
  assert.match(html, /Klickpfad · 4 Ereignisse · 1 Klicks/);
  assert.match(html, /Am längsten gelesen/);
  assert.match(html, /1 min 10 s/);
});

test("Heart erkennt Aenderungen, die nur den Klickpfad betreffen", () => {
  const a = { step: "result", timings: { live: "fertig", pfad: { e1: { t: "x" } } } };
  const b = { step: "result", timings: { live: "fertig", pfad: { e1: { t: "x" }, e2: { t: "y" } } } };
  assert.equal(JSON.stringify(ohnePfad(a)), JSON.stringify(ohnePfad(b)));
  assert.notEqual(JSON.stringify(ohnePfad(a)), JSON.stringify(ohnePfad({ ...b, step: "ordered" })));
  assert.equal(a.timings.pfad.e1.t, "x", "das Original bleibt unveraendert");
});
