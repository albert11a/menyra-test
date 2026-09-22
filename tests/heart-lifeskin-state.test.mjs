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

// DER KOPF SAGT, WO MAN IST.
//
// Er trug "heart" ueber "mnyra" - auf jeder Ansicht dasselbe, also eine
// Auskunft, die keine ist. Im Lifeskin-Bereich steht jetzt LIFESKIN
// ueber CASH: derselbe Aufbau, dieselben Klassen, also dieselbe
// Schrift und dieselbe Farbe - nur die zwei Woerter wechseln.
test("im Lifeskin-Bereich steht LIFESKIN ueber CASH", () => {
  const knoten = { innerHTML: "", querySelector: () => null, contains: () => false };
  const zustand = createHeartInitialState();
  zustand.auth = { status: "authenticated", user: { email: "a@b.c" }, profile: {},
    access: { allowed: true, reason: "" } };
  zustand.boot = { ready: true, error: "", lastUpdatedAt: "" };

  zustand.shell.activeView = "lifeskin";
  renderHeartApp(knoten, zustand, {});
  const kopf = knoten.innerHTML.slice(knoten.innerHTML.indexOf("heart-topbar"));
  assert.match(kopf, /heart-brand-lockup__eyebrow">lifeskin</);
  assert.match(kopf, /heart-brand-lockup__wordmark">cash</);

  // Und ueberall sonst bleibt es, wie es war.
  zustand.shell.activeView = "dashboard";
  renderHeartApp(knoten, zustand, {});
  const anderswo = knoten.innerHTML.slice(knoten.innerHTML.indexOf("heart-topbar"));
  assert.match(anderswo, /heart-brand-lockup__eyebrow">heart</);
  assert.match(anderswo, /heart-brand-lockup__wordmark">mnyra</);
});
