// "LIVE BLEIBT VIEL LAENGER ALS LIVE" (30.09., Inhaber): Wer die Seite
// verlaesst (Tab zu, App gewechselt), meldet timings.weg - Heart nimmt ihn
// sofort aus Live, nicht erst nach drei Minuten.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { istGeradeAktiv } from "../apps/mnyra-heart/heart-lifeskin-live.js";

const jetzt = Date.parse("2026-09-30T12:00:00.000Z");
const vor = (s) => new Date(jetzt - s * 1000).toISOString();

test("wer 'weg' gemeldet hat, ist sofort nicht mehr live", () => {
  assert.equal(istGeradeAktiv({ updatedAt: vor(20) }, jetzt), true, "ohne weg: drei Minuten wie bisher");
  assert.equal(istGeradeAktiv({ updatedAt: vor(20), timings: { weg: vor(10) } }, jetzt), false);
  // Therapieseite: updatedAt kommt mit derselben Meldung, einen Augenblick spaeter.
  assert.equal(istGeradeAktiv({ updatedAt: vor(10), timings: { weg: vor(10.5) } }, jetzt), false);
  // Wieder da: updatedAt nach dem weg - wieder live.
  assert.equal(istGeradeAktiv({ updatedAt: vor(5), timings: { weg: vor(30) } }, jetzt), true);
  assert.equal(istGeradeAktiv({ updatedAt: vor(400) }, jetzt), false, "nach drei Minuten ohnehin nicht mehr");
});

test("Trichter/Laden und Therapieseite melden weg und wieder da", () => {
  const sitzung = readFileSync(new URL("../apps/lifeskin/lifeskin-session.js", import.meta.url), "utf8");
  assert.match(sitzung, /this\.#anwesenheitMelden\(dokument\);/);
  assert.match(sitzung, /timings: \{ weg: jetzt\(\) \} \}, \["timings\.weg"\]/);
  const terapia = readFileSync(new URL("../apps/lifeskin-verkauf/terapia.js", import.meta.url), "utf8");
  assert.match(terapia, /timings: \{ weg: new Date\(\)\.toISOString\(\) \}/);
});

test("die Sitzung meldet weg und wieder da - einmal je Wechsel", async () => {
  const { Sitzung } = await import("../apps/lifeskin/lifeskin-session.js");
  const rufe = [];
  const fetchFn = async (url, o = {}) => { rufe.push({ url: String(url), koerper: o.body ? JSON.parse(o.body) : null }); return { ok: true, status: 200, json: async () => ({}) }; };
  const horcher = {};
  const fenster = { addEventListener: (n, f) => { horcher[n] = f; } };
  const dokument = { visibilityState: "visible", defaultView: fenster, addEventListener() {}, removeEventListener() {}, referrer: "" };
  const speicher = { getItem: () => null, setItem() {}, removeItem() {} };
  const sitzung = new Sitzung({ fetchFn, speicher });
  await sitzung.starte({ dokument });
  await sitzung.kette;
  const vorher = rufe.length;
  dokument.visibilityState = "hidden"; horcher.visibilitychange(); horcher.pagehide();
  await sitzung.kette;
  assert.equal(rufe.length, vorher + 1, "weg genau einmal");
  assert.match(rufe.at(-1).url, /updateMask\.fieldPaths=timings\.weg/);
  dokument.visibilityState = "visible"; horcher.visibilitychange();
  await sitzung.kette;
  assert.match(rufe.at(-1).url, /updateMask\.fieldPaths=updatedAt/);
  assert.ok(!/createdAt/.test(rufe.at(-1).url), "der Anlegezeitpunkt bleibt stehen");
});
