import test from "node:test";
import assert from "node:assert/strict";

import { renderLifeskin } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { baueKennzahlen, baueTrichter, baueHerkunft, baueVerteilung } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { STANDARD_PRODUKTE } from "../apps/lifeskin/lifeskin-catalog.js";

// Die Produktpflege. Der Knopf dafuer stand von Anfang an im Markup und tat
// nichts - ohne Produkte zeigt die Abdeckung ueberall "kein Produkt", die
// Empfehlung greift auf Platzhalter zurueck, und verkauft werden kann gar
// nichts.

function zustand(zusatz = {}) {
  return {
    status: "ready", loadedFrom: "network", sitzungen: [], produkte: STANDARD_PRODUKTE,
    abdeckung: [], kennzahlen: baueKennzahlen([]), trichter: baueTrichter([]),
    herkunft: baueHerkunft([]), verteilung: baueVerteilung([]),
    offen: "", fotos: {}, fotosStatus: "", resetGefragt: false, resetStatus: "",
    produktOffen: "", produktStatus: "",
    ...zusatz
  };
}

test("die Produktliste fuehrt in den Editor", () => {
  const html = renderLifeskin(zustand());
  assert.match(html, /data-action="lifeskin-produkt"/);
  assert.match(html, /data-id="serum-01"/);
  assert.match(html, /data-action="lifeskin-produkt-neu"/);
});

test("ein vorhandenes Produkt kommt mit seinen Werten in das Formular", () => {
  const html = renderLifeskin(zustand({ produktOffen: "serum-01" }));
  assert.match(html, /data-produktfeld="name"[^>]*value="Serum"/);
  assert.match(html, /data-produktfeld="einzelpreis"[^>]*value="34"/);
  assert.match(html, /data-produktfeld="inhalt"[^>]*value="30 ml"/);
  // Die Ausloeser des Serums: Roetung ab 1, Pigment ab 1, Linien ab 2.
  assert.match(html, /data-produktausloeser="roetung"[\s\S]*?<option value="1" selected/);
  assert.match(html, /data-produktausloeser="linien"[\s\S]*?<option value="2" selected/);
  // Und ein Befund ohne Ausloeser steht auf "aus".
  assert.match(html, /data-produktausloeser="trockenheit"[\s\S]*?<option value="0" selected/);
});

test("ein neues Produkt hat ein leeres Formular und keinen Loeschknopf", () => {
  const html = renderLifeskin(zustand({ produktOffen: "__neu" }));
  assert.match(html, /Neues Produkt/);
  assert.match(html, /data-action="lifeskin-produkt-speichern"/);
  assert.doesNotMatch(html, /data-action="lifeskin-produkt-loeschen"/);
  assert.match(html, /data-produktfeld="id"[^>]*value=""/);
});

test("beim Speichern ist der Knopf gesperrt, damit nichts doppelt anlegt", () => {
  const html = renderLifeskin(zustand({ produktOffen: "__neu", produktStatus: "laeuft" }));
  assert.match(html, /Wird gespeichert/);
  assert.match(html, /data-action="lifeskin-produkt-speichern"[^>]*disabled/);
});

test("ein geloeschtes Produkt oeffnet ein leeres Formular statt zu stuerzen", () => {
  const html = renderLifeskin(zustand({ produktOffen: "gibtsnicht" }));
  assert.match(html, /Neues Produkt/);
  assert.match(html, /data-action="lifeskin-produkt-zu"/);
});

test("beide Sprachen haben ein eigenes Feld", () => {
  const html = renderLifeskin(zustand({ produktOffen: "serum-01" }));
  for (const name of ["kurztext_sq", "kurztext_de", "beschreibung_sq", "beschreibung_de"]) {
    assert.ok(html.includes(`data-produktfeld="${name}"`), `${name} fehlt`);
  }
  // Albanisch steht oben - das ist die Sprache der Kunden.
  assert.ok(html.indexOf("kurztext_sq") < html.indexOf("kurztext_de"));
});
