import assert from "node:assert/strict";
import test from "node:test";

import { foldGoCityText, goCityKey, isSameGoCity } from "../shared/go/go-city-core.js";

// ===========================================================================
// Eine Stadt, mehrere richtige Namen.
//
// Der Gast waehlt in GO "Prishtinë", das Lokal traegt im Profil "Prishtina"
// ein, ein Geraet mit englischer Ortsbestimmung meldet "Pristina". Wer das
// nicht zusammenfuehrt, hat drei Staedte und ein leeres Ergebnis - und zwar
// ohne dass irgendwo ein Fehler im Log steht.
// ===========================================================================

test("the same city keeps the same key, however it is written", () => {
  const key = goCityKey("Prishtina");
  ["Prishtinë", "prishtine", "PRISHTINE ", "Pristina", "Priština", "Prishtin"].forEach((spelling) => {
    assert.equal(goCityKey(spelling), key, spelling);
  });
});

test("the albanian and the latin form of a city are one city", () => {
  // Genau diese Paare stehen in den zwei Auswahllisten der App: GO fragt den
  // Gast albanisch, das Restaurantprofil schreibt lateinisch.
  [
    ["Prishtinë", "Prishtina"],
    ["Pejë", "Peja"],
    ["Gjakovë", "Gjakova"],
    ["Mitrovicë", "Mitrovica"],
    ["Tiranë", "Tirana"],
    ["Shkup", "Skopje"]
  ].forEach(([guest, profile]) => {
    assert.equal(isSameGoCity(guest, profile), true, `${guest} / ${profile}`);
  });
});

test("two different cities stay two different cities", () => {
  assert.equal(isSameGoCity("Prishtinë", "Prizren"), false);
  assert.equal(isSameGoCity("Peja", "Podujeva"), false);
  assert.notEqual(goCityKey("Ferizaj"), goCityKey("Gjilan"));
});

test("a city that is not on the list still works", () => {
  // Das Verzeichnis ist ein Vorschlag, keine Schranke: Wer seinen Ort
  // hinschreibt, bekommt seinen eigenen Schluessel - nur ohne Zweitnamen.
  assert.equal(goCityKey("Vlora"), "vlora");
  assert.equal(isSameGoCity("Vlora", "vlorë "), false);
  assert.equal(isSameGoCity("Vlora", "VLORA"), true);
});

test("no city means no verdict, never a rejection", () => {
  assert.equal(goCityKey(""), "");
  assert.equal(goCityKey(null), "");
  assert.equal(isSameGoCity("Prishtinë", ""), true);
  assert.equal(isSameGoCity("", "Prizren"), true);
});

test("folding is the letters only, without the alias table", () => {
  assert.equal(foldGoCityText(" Prishtinë "), "prishtine");
  assert.equal(foldGoCityText("Kosovska Mitrovica"), "kosovskamitrovica");
});

test("a whole key matches, never a part of one", () => {
  // "Peja" darf nicht in "Pejton" hineinlesen - sonst waere ein Stadtteil
  // ploetzlich eine Stadt.
  assert.equal(isSameGoCity("Peja", "Pejton"), false);
});
