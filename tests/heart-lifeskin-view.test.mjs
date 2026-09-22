import test from "node:test";
import assert from "node:assert/strict";

import { renderLifeskin } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import {
  baueKennzahlen,
  baueTrichter,
  baueHerkunft,
  baueVerteilung,
  normalisiere
} from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

// Der Zustand, wie ihn der Lader nach einem erfolgreichen Abgleich hinlegt.
function fertigerZustand(roh = [], produkte = []) {
  // Ueber normalisiere, weil der Lader es im Betrieb genauso macht.
  const sitzungen = roh.map((d, i) => normalisiere(d.id || `s${i}`, d));
  return {
    status: "ready",
    loadedFrom: "network",
    sitzungen,
    rohAnzahl: sitzungen.length,
    produkte,
    abdeckung: [],
    kennzahlen: baueKennzahlen(sitzungen),
    trichter: baueTrichter(sitzungen),
    herkunft: baueHerkunft(sitzungen),
    verteilung: baueVerteilung(sitzungen)
  };
}

// Der Fehler, der Heart lahmgelegt hat.
//
// Der Reiter wird gezeichnet, bevor der Lader anlaeuft - der Zustand ist
// dann ein leeres Objekt. Frueher griff die Ansicht auf kennzahlen zu, die
// es noch nicht gab, der Fehler flog bis in renderHeartApp hinauf, und weil
// die aktive Ansicht im Zustand trotzdem umgestellt war, scheiterte auch
// jedes weitere Zeichnen. Heart reagierte auf keinen Klick mehr.
test("die Ansicht ueberlebt jeden Zustand vor dem ersten Abgleich", () => {
  const halbfertig = [
    undefined,
    null,
    {},
    { status: "loading" },
    { status: "ready" },
    { status: "ready", sitzungen: [], produkte: [] },
    { status: "ready", kennzahlen: baueKennzahlen([]) },
    { status: "ready", trichter: baueTrichter([]) }
  ];
  for (const zustand of halbfertig) {
    assert.doesNotThrow(() => renderLifeskin(zustand), `Zustand: ${JSON.stringify(zustand)}`);
    assert.equal(typeof renderLifeskin(zustand), "string");
  }
});

test("ohne gerechnete Zahlen steht dort 'wird geladen', nicht nichts", () => {
  assert.match(renderLifeskin({}), /Wird geladen/);
  assert.match(renderLifeskin({ status: "ready" }), /Wird geladen/);
});

test("ein Fehler beim Laden wird benannt", () => {
  const html = renderLifeskin({ status: "error", fehler: "Missing permissions" });
  assert.match(html, /liessen sich nicht laden/);
  assert.match(html, /Missing permissions/);
});

// DIE ACHT KACHELN, IN VIER REIHEN ZU ZWEIT.
const KACHELN = ["Landing", "Analysen", "Warenkörbe", "Umsatz",
  "Analysenquote", "Kaufquote", "Abbrüche Kauf", "Abbrüche Analysen"];

test("null Analysen zeigen die Kacheln und sagen, dass es kein Fehler ist", () => {
  const html = renderLifeskin(fertigerZustand());
  assert.match(html, /Noch keine Analyse/);
  for (const marke of KACHELN) {
    assert.ok(html.includes(`kachel__marke">${marke}<`), `Die Kachel "${marke}" fehlt`);
  }
  assert.match(html, /mnyra\.com\/lifeskin/);
});

test("die acht Kacheln stehen in der Reihenfolge, in der gefragt wird", () => {
  const html = renderLifeskin(fertigerZustand());
  const marken = [...html.matchAll(/kachel__marke">([^<]+)</g)].map((m) => m[1]);
  assert.deepEqual(marken, KACHELN);
});

test("mit Sitzungen verschwindet der Hinweis wieder", () => {
  const heute = new Date().toISOString();
  const html = renderLifeskin(fertigerZustand([
    { id: "a", createdAt: heute, step: "ordered", order: { total: 53, orderId: "LS-1" } }
  ]));
  assert.doesNotMatch(html, /Noch keine Analyse/);
  assert.match(html, /kachel__marke">Landing</);
});

// ---------- Der Anbieter ----------
//
// Die Befundseite nimmt Namen, Telefonnummer und Anschrift entgegen und
// schliesst einen Kauf ab. Wer dafuer geradesteht, stand bisher als
// Konstante im Quelltext - und deshalb jahrelang gar nicht da: Eintragen
// hiess Datei aendern und neu aufsetzen. Jetzt in Heart.

test("der Anbieter laesst sich in Heart eintragen", () => {
  const html = renderLifeskin(fertigerZustand());
  for (const feld of ["name", "anschrift", "email"]) {
    assert.match(html, new RegExp(`data-anbieterfeld="${feld}"`), `Das Feld ${feld} fehlt`);
  }
  assert.match(html, /data-action="lifeskin-anbieter-speichern"/, "Es gibt keinen Speichern-Knopf");
});

test("solange nichts eingetragen ist, sagt Heart genau das", () => {
  const leer = renderLifeskin(fertigerZustand());
  assert.match(leer, /erscheint der Block auf der Seite gar nicht/,
    "Ein leeres Formular ohne Hinweis sieht aus wie ein ausgefuelltes");

  const gefuellt = renderLifeskin({
    ...fertigerZustand(),
    konfig: { anbieter: { name: "Lifeskin", anschrift: "", email: "hallo@example.com" } }
  });
  assert.match(gefuellt, /value="Lifeskin"/, "Der eingetragene Name steht nicht im Feld");
  assert.match(gefuellt, /2 von 3 Feldern gefuellt/, "Heart sagt nicht, wie viel schon steht");
});

test("das Formular haelt jeden halbfertigen Zustand aus", () => {
  for (const konfig of [undefined, null, {}, { anbieter: null }, { anbieter: {} }]) {
    assert.doesNotThrow(() => renderLifeskin({ ...fertigerZustand(), konfig }),
      `konfig: ${JSON.stringify(konfig)}`);
  }
});

test("neun Analysen bleiben trotz offer/address in den Fallfaechern sichtbar", () => {
  const zustand = fertigerZustand(Array.from({ length: 9 }, (_, i) => ({
    id: `fall-${i}`, step: i === 7 ? "offer" : i === 8 ? "address" : "result",
    name: `Fall ${i}`, createdAt: new Date().toISOString()
  })));
  assert.equal(zustand.kennzahlen.analysen, 9);
  const html = renderLifeskin(zustand);
  assert.equal((html.match(/data-action="lifeskin-sitzung"/g) || []).length, 9);
});

test("neun gesamt und sieben offen: zwei beantwortete Faelle bleiben im Ready-Fach", () => {
  const zustand = fertigerZustand(Array.from({ length: 9 }, (_, i) => ({
    id: `fall-${i}`, step: "result", name: `Fall ${i}`, createdAt: new Date().toISOString()
  })));
  zustand.berichte = { 'fall-7': { status: 'fertig' }, 'fall-8': { status: 'fertig' } };
  assert.equal(zustand.kennzahlen.analysen, 9);
  assert.equal((renderLifeskin(zustand).match(/data-action="lifeskin-sitzung"/g) || []).length, 7);
  assert.equal((renderLifeskin({ ...zustand, fach: 'ready' }).match(/data-action="lifeskin-sitzung"/g) || []).length, 2);
});

test("Warteseitenmarke zaehlt auch in der Liste; reiner Shopkauf bleibt draussen", () => {
  const zustand = fertigerZustand([
    { id: 'patient', step: 'numri', warteseiteGeoeffnet: true },
    { id: 'shop', step: 'ordered', shopKauf: true }
  ]);
  const html = renderLifeskin(zustand);
  assert.match(html, /data-action="lifeskin-sitzung" data-id="patient"/);
  assert.doesNotMatch(renderLifeskin({ ...zustand, fach: 'bestellt' }), /data-action="lifeskin-sitzung" data-id="shop"/);
});

test("tatsaechliche Warteseite zaehlt trotz noch fehlender zweiter Statistikmarke", () => {
  const zustand = fertigerZustand([
    { id: 'wartet', step: 'aufbereitung', timings: { live: 'prit' }, createdAt: new Date().toISOString() }
  ]);
  assert.equal(zustand.kennzahlen.analysen, 1);
  assert.match(renderLifeskin(zustand), /data-action="lifeskin-sitzung" data-id="wartet"/);
});
