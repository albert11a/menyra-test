// Der Befund: gemerkte Auswahl vor dem Prompt, ein Block je gewaehltem
// Produkt (kein drittes Phantom-Produkt), Schritte in Arbeitsreihenfolge.
import test from "node:test";
import assert from "node:assert/strict";

import { renderSitzungDetail } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { normalisiere } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { STANDARD_PRODUKTE } from "../apps/lifeskin/lifeskin-catalog.js";
import { entwurfLesen, entwurfSchreiben, entwurfLoeschen } from "../apps/mnyra-heart/heart-lifeskin-entwurf.js";

const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k)
};

const sitzung = normalisiere("fall1", { createdAt: "2026-09-23T09:00:00.000Z", step: "done", name: "Test" });
const gehakt = (html) => [...html.matchAll(/data-produkt-wahl value="([^"]+)" checked/g)].map((m) => m[1]);
const bloecke = (html) => [...html.matchAll(/data-shitja-pblock="([^"]+)"(?! hidden)>/g)].map((m) => m[1]);

test("gemerkte Auswahl steht wieder da, solange nicht freigegeben ist", () => {
  entwurfSchreiben("fall1", { produkte: ["lf-acne", "lf-moistur"], zweck: { "lf-acne": "puçrrat" }, art: "pa-foto", preis: 60 });
  const html = renderSitzungDetail(sitzung, null, "", STANDARD_PRODUKTE, { status: "wartet" });
  assert.deepEqual(gehakt(html).sort(), ["lf-acne", "lf-moistur"]);
  assert.match(html, /data-produkt-zweck="lf-acne"[^>]*value="puçrrat"/);
  assert.match(html, /<option value="pa-foto" selected>/);
  assert.match(html, /id="lifeskin-preis"[^>]*value="60"/);
  // Genau zwei Bloecke "Çfarë merrni" sichtbar - kein drittes Produkt.
  assert.deepEqual(bloecke(html).sort(), ["lf-acne", "lf-moistur"]);
});

test("nach der Freigabe gilt der gespeicherte Befund, nicht der Entwurf", () => {
  entwurfSchreiben("fall1", { produkte: ["lf-pore"] });
  const html = renderSitzungDetail(sitzung, null, "", STANDARD_PRODUKTE,
    { status: "fertig", freigabeAt: "x", produkte: [{ id: "lf-acne", satz: "" }] });
  assert.deepEqual(gehakt(html), ["lf-acne"]);
  entwurfLoeschen("fall1");
  assert.equal(entwurfLesen("fall1"), null);
});

test("der Bogen steht in Schritten: waehlen, Prompt, JSON, pruefen, freigeben", () => {
  const html = renderSitzungDetail(sitzung, null, "", STANDARD_PRODUKTE, { status: "wartet" });
  const stellen = ["Therapie wählen", "Prompt für diesen Fall kopieren", "lifeskin-json-uebernehmen",
    "Therapieseite prüfen", "Befund freigeben"].map((t) => html.indexOf(t));
  assert.ok(stellen.every((x) => x > 0), JSON.stringify(stellen));
  assert.deepEqual([...stellen].sort((a, b) => a - b), stellen, "Reihenfolge stimmt nicht");
  // Die aerztliche Bestaetigung steht direkt ueber dem Freigabeknopf.
  assert.ok(html.indexOf("data-raport-reviewed") > html.indexOf("Therapieseite prüfen"));
});

test("Befund-Karte ist zugeklappt, unter den Texten steht die Vorschau wie auf der Seite", async () => {
  const { vorschauInhalt } = await import("../apps/mnyra-heart/heart-lifeskin-vorschau.js");
  const html = renderSitzungDetail(sitzung, null, "", STANDARD_PRODUKTE, { status: "wartet", raport: { shitja: {
    hyrja: "Për **puçrrat në faqe** — 2 produkte, një plan i qartë.",
    problemet: [{ gjetja: "Puçrra", ku: "në faqe", produkt_id: "lf-acne", zgjidhja: "LF ACNE nuk trajton rrudhat; qetëson puçrrat." }]
  } } });
  assert.match(html, /<details class="heart-lifeskin-editor heart-befund" data-bewahren/);
  assert.doesNotMatch(html, /<details class="heart-lifeskin-editor heart-befund"[^>]* open/);
  for (const k of ["hyrja", "shqetesimi", "karte:0", "dita_28", "pse_tani", "whatsapp"]) assert.match(html, new RegExp(`data-tv="${k}"`));
  // Dieselben Regeln wie die Seite: fett, Produktname vorn, keine Verneinung.
  assert.match(vorschauInhalt("hyrja", { text: "Për **puçrrat** — ok" }), /<b>puçrrat<\/b>/);
  const karte = vorschauInhalt("karte", { gjetja: "Puçrra", name: "LF ACNE", zgjidhja: "LF ACNE nuk trajton rrudhat; qetëson puçrrat." });
  assert.match(karte, /<b>LF ACNE<\/b> qetëson puçrrat/);
  assert.doesNotMatch(karte, /nuk trajton/);
  assert.match(vorschauInhalt("karte", { nichtImSet: true }), /nicht gewählt/);
  // Kein HTML aus dem Text erreicht die Vorschau.
  assert.doesNotMatch(vorschauInhalt("shqetesimi", { text: "<img src=x onerror=alert(1)>" }), /<img/);
});
