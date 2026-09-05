import test from "node:test";
import assert from "node:assert/strict";

import { renderLifeskin, fuellePlatzhalter, PLATZHALTER } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { baueKennzahlen, baueTrichter, baueHerkunft, baueVerteilung } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { STANDARD_PRODUKTE } from "../apps/lifeskin/lifeskin-catalog.js";
import { funktion, lies, ohneKommentare } from "./lifeskin-quelle.mjs";

function zustand(zusatz = {}) {
  return {
    status: "ready", loadedFrom: "network", sitzungen: [], produkte: STANDARD_PRODUKTE,
    abdeckung: [], kennzahlen: baueKennzahlen([]), trichter: baueTrichter([]),
    herkunft: baueHerkunft([]), verteilung: baueVerteilung([]),
    offen: "", fotos: {}, fotosStatus: "", resetGefragt: false, resetStatus: "",
    produktOffen: "", produktStatus: "", ...zusatz
  };
}

// Das Produktfoto kommt vom Handy, ohne Umweg ueber einen Bilddienst.
//
// Vorher stand dort ein Feld "Bildadresse": Man haette das Foto erst
// irgendwo hochladen und die Adresse hineinkopieren muessen. Das ist der
// haeufigste Grund, warum jemand ein Produkt nie fertig anlegt.

test("das Foto wird vom Geraet gewaehlt, nicht als Adresse eingetippt", () => {
  const html = renderLifeskin(zustand({ produktOffen: "__neu" }));
  assert.match(html, /type="file"[^>]*accept="image\/\*"/);
  assert.match(html, /data-produktfoto/);
  // Die Adresse bleibt als verstecktes Feld - dort landet das fertige Bild.
  assert.match(html, /type="hidden" data-produktfeld="photoRef"/);
});

test("ein vorhandenes Foto wird gezeigt und laesst sich entfernen", () => {
  const mitFoto = STANDARD_PRODUKTE.map((p) =>
    p.id === "serum-01" ? { ...p, photoRef: "data:image/jpeg;base64,AAA" } : p);
  const html = renderLifeskin(zustand({ produkte: mitFoto, produktOffen: "serum-01" }));
  assert.match(html, /<img src="data:image\/jpeg;base64,AAA"/);
  assert.match(html, /data-action="lifeskin-produkt-foto-weg"/);
});

test("das Bild wird verkleinert und passt in ein Dokument", () => {
  const quelle = ohneKommentare(lies("apps/mnyra-heart/heart.js"));
  const block = quelle.slice(quelle.indexOf("async function produktfotoLesen"));
  assert.ok(block.includes("FOTO_KANTE"), "Es wird nicht verkleinert");
  assert.ok(/<= 700000/.test(block), "Es gibt keine Groessengrenze");
  // Dieselbe Leiter wie bei den Aufnahmen: die beste Guete, die noch passt.
  assert.ok(/0\.86.*0\.78.*0\.7.*0\.6/s.test(block), "Keine Guetestufen");
});

// Der persoenliche Satz: einmal je Produkt, nicht je Patientin.
//
// Ein Satz je Patientin von Hand waeren Minuten - und Minuten sind die
// Obergrenze dieses Geschaefts.

test("die Platzhalter werden gefuellt, nicht abgetippt", () => {
  assert.deepEqual([...PLATZHALTER], ["emri", "gjetja", "mosha"]);
  assert.equal(
    fuellePlatzhalter("{emri}, ky serum eshte per {gjetja}.", { emri: "Arta", gjetja: "skuqjen" }),
    "Arta, ky serum eshte per skuqjen."
  );
});

test("ein fehlender Wert laesst keine geschweiften Klammern stehen", () => {
  const text = fuellePlatzhalter("{emri}, per {gjetja} dhe {mosha}.", { emri: "Arta" });
  assert.doesNotMatch(text, /[{}]/, "In der Nachricht steht noch ein Platzhalter");
});

test("beide Sprachen haben ein Feld, und eine Vorschau steht daneben", () => {
  const html = renderLifeskin(zustand({ produktOffen: "serum-01" }));
  assert.match(html, /data-produktfeld="persoenlich_sq"/);
  assert.match(html, /data-produktfeld="persoenlich_de"/);
  assert.match(html, /So liest es eine Patientin/);
  // Und die Platzhalter werden erklaert, sonst benutzt sie niemand.
  for (const name of PLATZHALTER) assert.ok(html.includes(`{${name}}`), `${name} nicht erklaert`);
});

test("der persoenliche Satz wird mitgespeichert", () => {
  const block = funktion(ohneKommentare(lies("apps/mnyra-heart/heart.js")), "produktAusFormular");
  assert.ok(block.includes("persoenlich"), "Der Satz wird nicht gespeichert");
  assert.ok(block.includes("persoenlich_sq") && block.includes("persoenlich_de"));
});

test("Foto waehlen und Foto entfernen sind beide verdrahtet", () => {
  const events = lies("apps/mnyra-heart/heart-events.js");
  assert.ok(events.includes("data-produktfoto"), "Die Dateiwahl wird nicht aufgefangen");
  assert.ok(events.includes("lifeskin-produkt-foto-weg"), "Das Entfernen wird nicht aufgefangen");
});
