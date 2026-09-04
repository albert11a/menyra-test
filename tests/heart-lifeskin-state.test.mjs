import test from "node:test";
import assert from "node:assert/strict";

import { createHeartStore, createHeartInitialState } from "../apps/mnyra-heart/heart-state.js";
import { renderHeartApp } from "../apps/mnyra-heart/heart-render.js";

// Warum es diese Datei gibt.
//
// Der Lifeskin-Bereich hat seinen Stand mit store.setState geschrieben.
// setState ersetzt den Zustand aber, es ergaenzt ihn nicht. Nach dem ersten
// Klick auf den Reiter bestand der gesamte Heart-Zustand nur noch aus
// { lifeskin: ... } - keine Anmeldung, keine Huelle, kein Menue mehr.
//
// Das naechste Zeichnen griff auf state.auth.status zu, das es nicht mehr
// gab, und warf. Weil jeder weitere Versuch am selben kaputten Zustand
// scheiterte, wurde nie wieder etwas gezeichnet: Der Bildschirm blieb auf
// "Wird geladen ..." stehen und kein einziger Knopf reagierte noch.

test("setState ersetzt den Zustand - deshalb darf kein Bereich es benutzen", () => {
  const store = createHeartStore();
  assert.ok(store.getState().auth, "Voraussetzung: am Anfang gibt es auth");
  store.setState({ lifeskin: { status: "loading" } });
  // Das ist kein Fehler von setState, das ist sein Wesen. Der Test haelt es
  // fest, damit klar bleibt, warum die Aktionen unten noetig sind.
  assert.equal(store.getState().auth, undefined);
});

test("die Lifeskin-Aktionen lassen den uebrigen Zustand in Ruhe", () => {
  const store = createHeartStore();
  const { actions } = store;

  actions.setLifeskinLoading();
  assert.ok(store.getState().auth, "auth ist nach setLifeskinLoading verschwunden");
  assert.ok(store.getState().shell, "shell ist nach setLifeskinLoading verschwunden");
  assert.equal(store.getState().lifeskin.status, "loading");

  actions.setLifeskinData({ sitzungen: [], produkte: [], kennzahlen: { analysenHeute: 0 } }, "network");
  assert.ok(store.getState().auth, "auth ist nach setLifeskinData verschwunden");
  assert.equal(store.getState().lifeskin.status, "ready");
  assert.equal(store.getState().lifeskin.loadedFrom, "network");

  actions.setLifeskinError("Missing or insufficient permissions.");
  assert.ok(store.getState().auth, "auth ist nach setLifeskinError verschwunden");
  assert.equal(store.getState().lifeskin.status, "error");
  assert.match(store.getState().lifeskin.fehler, /permissions/);
});

test("der Bereich ist von Anfang an da und nicht undefined", () => {
  const zustand = createHeartInitialState();
  assert.ok(zustand.lifeskin, "lifeskin fehlt im Anfangszustand");
  assert.equal(zustand.lifeskin.status, "idle");
  assert.deepEqual(zustand.lifeskin.sitzungen, []);
  assert.equal(zustand.lifeskin.kennzahlen, null);
});

test("ein unvollstaendiger Zustand haelt Heart nicht stumm an", () => {
  const knoten = { innerHTML: "", querySelector: () => null, contains: () => false };
  const alt = globalThis.console.error;
  globalThis.console.error = () => {};
  try {
    assert.doesNotThrow(() => renderHeartApp(knoten, { lifeskin: {} }, {}));
  } finally {
    globalThis.console.error = alt;
  }
  assert.match(knoten.innerHTML, /Faden verloren/);
});
