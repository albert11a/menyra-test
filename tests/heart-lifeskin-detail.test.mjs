import test from "node:test";
import assert from "node:assert/strict";

import { renderLifeskin } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import {
  baueKennzahlen, baueTrichter, baueHerkunft, baueVerteilung, normalisiere
} from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { bindHeartEvents } from "../apps/mnyra-heart/heart-events.js";

function zustandMit(roh = [], zusatz = {}) {
  const sitzungen = roh.map((d, i) => normalisiere(d.id || `s${i}`, d));
  return {
    status: "ready", loadedFrom: "network", sitzungen, produkte: [], abdeckung: [],
    kennzahlen: baueKennzahlen(sitzungen), trichter: baueTrichter(sitzungen),
    herkunft: baueHerkunft(sitzungen), verteilung: baueVerteilung(sitzungen),
    offen: "", fotos: {}, fotosStatus: "", resetGefragt: false, resetStatus: "",
    ...zusatz
  };
}

const EINE = {
  id: "abc", createdAt: new Date().toISOString(), step: "ordered",
  name: "Arta", ageBand: "25-34", skinType: "mischhaut", sprache: "sq",
  findings: [{ id: "roetung", stufe: 2 }, { id: "glanz", stufe: 0 }],
  metrics: { wangeLinks: { roetung: 11.5, glanz: 0.03, textur: 0.71, hautton: -12 } },
  ringAnteil: 1, views: 9, mesh: true, mmJeBildpunkt: 0.118,
  address: { strasse: "Rr. Dëshmorët 5", ort: "Prishtinë" },
  order: { orderId: "LS-AB12", total: 53 }
};

test("die Liste zeigt jede Analyse als anklickbaren Knopf", () => {
  const html = renderLifeskin(zustandMit([EINE]));
  assert.match(html, /data-action="lifeskin-sitzung"/);
  assert.match(html, /data-id="abc"/);
});

test("aufgeklappt steht die Analyse allein da, mit Weg zurueck", () => {
  const html = renderLifeskin(zustandMit([EINE], { offen: "abc" }));
  assert.match(html, /Arta/);
  assert.match(html, /data-action="lifeskin-sitzung-zu"/);
  // Nicht die Liste daneben - sonst findet man auf dem Handy nichts.
  assert.doesNotMatch(html, /TRICHTER|Trichter/);
});

test("die drei Aufnahmen erscheinen mit Beschriftung", () => {
  const bild = "data:image/jpeg;base64,AAA";
  const html = renderLifeskin(zustandMit([EINE], {
    offen: "abc",
    fotos: { abc: { gerade: { jpeg: bild }, rechts: { jpeg: bild }, links: { jpeg: bild } } },
    fotosStatus: "ready"
  }));
  for (const wort of ["Gerade", "Kopf nach rechts", "Kopf nach links"]) {
    assert.ok(html.includes(wort), `${wort} fehlt`);
  }
  assert.equal((html.match(/<img /g) || []).length, 3);
});

test("fehlende Fotos werden benannt, nicht verschwiegen", () => {
  const laedt = renderLifeskin(zustandMit([EINE], { offen: "abc", fotosStatus: "loading" }));
  assert.match(laedt, /Fotos werden geladen/);
  const leer = renderLifeskin(zustandMit([EINE], { offen: "abc", fotosStatus: "ready" }));
  assert.match(leer, /keine Fotos/);
});

test("Messwerte, Befund, Anschrift und Bestellung stehen da", () => {
  const html = renderLifeskin(zustandMit([EINE], { offen: "abc" }));
  // Die Messwerte stehen Zone fuer Zone mit ihrem Namen da.
  assert.match(html, /wangeLinks/);
  assert.match(html, /roetung<\/small>11\.50/);
  assert.match(html, /Prishtin/);
  assert.match(html, /LS-AB12/);
  assert.match(html, /53 €/);
  assert.match(html, /9 Aufnahmen/);
  assert.match(html, /mit Gesichtsnetz/);
  assert.match(html, /0\.118 mm je Bildpunkt/);
});

// Der Knopf, der die Testdaten wegraeumt.
test("der Reset-Knopf fragt erst und loescht dann", () => {
  const zu = renderLifeskin(zustandMit([EINE]));
  assert.match(zu, /Alle 1 Analysen loeschen/);
  assert.doesNotMatch(zu, /Ja, loeschen/);

  const gefragt = renderLifeskin(zustandMit([EINE], { resetGefragt: true }));
  assert.match(gefragt, /Ja, loeschen/);
  assert.match(gefragt, /nicht rueckgaengig/);
  assert.match(gefragt, /data-action="lifeskin-reset-abbrechen"/);
});

test("ohne Analysen gibt es nichts zu loeschen", () => {
  assert.doesNotMatch(renderLifeskin(zustandMit([])), /loeschen/);
});

// Die Knoepfe standen schon im Markup - aufgefangen hat sie nie jemand.
test("jeder Lifeskin-Knopf wird auch behandelt", async () => {
  const gerufen = [];
  const knopf = (action, id = "") => ({
    getAttribute: (n) => (n === "data-action" ? action : n === "data-id" ? id : null),
    hasAttribute: (n) => n === "data-action" || (n === "data-id" && Boolean(id)),
    closest: function () { return this; },
    id: ""
  });
  const wurzel = {
    addEventListener: (art, fn) => { wurzel[art] = fn; },
    removeEventListener: () => {}
  };
  bindHeartEvents({
    root: wurzel,
    operations: {
      openLifeskinSitzung: (id) => gerufen.push(`sitzung:${id}`),
      closeLifeskinSitzung: () => gerufen.push("zu"),
      lifeskinZuruecksetzen: () => gerufen.push("reset"),
      lifeskinResetAbbrechen: () => gerufen.push("abbrechen")
    }
  });

  for (const [action, id] of [["lifeskin-sitzung", "abc"], ["lifeskin-sitzung-zu"], ["lifeskin-reset"], ["lifeskin-reset-abbrechen"]]) {
    await wurzel.click({ target: knopf(action, id), preventDefault: () => {} });
  }
  assert.deepEqual(gerufen, ["sitzung:abc", "zu", "reset", "abbrechen"]);
});
