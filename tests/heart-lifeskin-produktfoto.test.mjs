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
    p.id === "lf-acne" ? { ...p, photoRef: "data:image/jpeg;base64,AAA" } : p);
  const html = renderLifeskin(zustand({ produkte: mitFoto, produktOffen: "lf-acne" }));
  assert.match(html, /<img src="data:image\/jpeg;base64,AAA"/);
  assert.match(html, /data-action="lifeskin-produkt-foto-weg"/);
});

test("das Bild wird verkleinert und passt in ein Dokument", () => {
  const quelle = ohneKommentare(lies("apps/mnyra-heart/heart.js"));
  const block = quelle.slice(quelle.indexOf("async function produktfotoLesen"));
  assert.ok(block.includes("FOTO_KANTE"), "Es wird nicht verkleinert");
  // Die Grenze steht am Aufrufer, nicht mehr fest im Leser: Die EINE
  // Produktaufnahme steht allein in ihrem Dokument und darf 700 KB;
  // die Bilder der Landingpage stehen zu sechst in EINEM Dokument und
  // duerfen deshalb viel weniger (siehe LANDING_BILD_MAX).
  assert.ok(/grenze = 700000/.test(block), "Es gibt keine Groessengrenze");
  assert.ok(/jpeg\.length <= grenze/.test(block), "Die Grenze wird nicht geprueft");
  // Dieselbe Leiter wie bei den Aufnahmen: die beste Guete, die noch passt.
  assert.ok(/0\.86.*0\.78.*0\.7.*0\.62/s.test(block), "Keine Guetestufen");
});

// ALLE BILDER EINES MITTELS STEHEN IN EINEM DOKUMENT.
//
// GEMELDET, NICHT BEFUERCHTET: "Ich kann nicht mehrere gleichzeitig, und
// bei LF PORE wird es, sobald ich das zweite Bild hochlade, gar nicht
// mehr auf der Landingpage gezeigt." Ein Firestore-Dokument darf 1 MiB -
// zwei Bilder zu je 700 KB sind zu viel, und Firestore weist dann das
// GANZE Dokument ab. Fuer den, der gerade ein Bild gewaehlt hat, sieht
// das aus wie "manchmal geht es, manchmal nicht".
test("die Bilder der Landingpage haben ihre eigene, engere Grenze", () => {
  const quelle = ohneKommentare(lies("apps/mnyra-heart/heart.js"));
  assert.match(quelle, /const LANDING_BILD_MAX = (\d+);/);
  assert.match(quelle, /const LANDING_DOKUMENT_MAX = (\d+);/);
  const jeBild = Number(quelle.match(/const LANDING_BILD_MAX = (\d+);/)[1]);
  const jeDokument = Number(quelle.match(/const LANDING_DOKUMENT_MAX = (\d+);/)[1]);
  // Sechs Bilder sind das Hoechste - sie muessen zusammen hineinpassen,
  // und unter der harten Grenze von 1 MiB muss Luft bleiben.
  assert.ok(jeBild * 6 <= jeDokument, `Sechs Bilder zu ${jeBild} passen nicht in ${jeDokument}`);
  assert.ok(jeDokument < 1048576, "Die Grenze liegt ueber dem, was ein Dokument traegt");
  // Der Leser bekommt sie mit - sonst gilt weiter die weite Grenze.
  assert.match(quelle, /produktfotoLesen\(datei, LANDING_KANTE, LANDING_BILD_MAX\)/);
  // Und gerechnet wird VOR dem Schreiben: Eine Meldung, die sagt "ein
  // Bild weniger", ist etwas anderes als ein Schreibvorgang, der stumm
  // scheitert und alles zuruecksetzt.
  const block = quelle.slice(quelle.indexOf("async function lifeskinLandingbilder"));
  assert.match(block, /gewicht \+ bild\.length > LANDING_DOKUMENT_MAX/);
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
  const html = renderLifeskin(zustand({ produktOffen: "lf-acne" }));
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

// ---------------------------------------------------------------------------
// Das getauschte Foto muss ein Neuzeichnen ueberleben
// ---------------------------------------------------------------------------
//
// GEMESSEN, NICHT GESCHAETZT: Das gewaehlte Bild stand nur im versteckten
// Feld des Formulars. Die Erfolgsmeldung danach ist eine
// Zustandsaenderung, Heart zeichnet bei jeder neu und schreibt den ganzen
// Bereich neu - mit dem ALTEN Bild darin. "Speichern" schrieb danach, was
// schon dastand: Auf dem Telefon liess sich ein Produktfoto nicht
// tauschen, und es sah nach einem toten Knopf aus.

test("das gewaehlte Foto steht im Entwurf, nicht nur im Formular", () => {
  const mitFoto = STANDARD_PRODUKTE.map((p) =>
    p.id === "lf-acne" ? { ...p, photoRef: "data:image/jpeg;base64,ALT" } : p);
  const html = renderLifeskin(zustand({
    produkte: mitFoto,
    produktOffen: "lf-acne",
    produktEntwurf: { photoRef: "data:image/jpeg;base64,NEU" }
  }));
  assert.match(html, /<img src="data:image\/jpeg;base64,NEU"/,
    "Die Vorschau zeigt weiter das alte Bild");
  assert.match(html, /data-produktfeld="photoRef" value="data:image\/jpeg;base64,NEU"/,
    "Gespeichert wuerde das alte Bild");
  assert.doesNotMatch(html, /base64,ALT/, "Das alte Bild steht noch irgendwo");
});

test("ein entferntes Foto bleibt entfernt, auch nach dem Neuzeichnen", () => {
  const mitFoto = STANDARD_PRODUKTE.map((p) =>
    p.id === "lf-acne" ? { ...p, photoRef: "data:image/jpeg;base64,ALT" } : p);
  const html = renderLifeskin(zustand({
    produkte: mitFoto,
    produktOffen: "lf-acne",
    produktEntwurf: { photoRef: "" }
  }));
  assert.doesNotMatch(html, /base64,ALT/, "Das entfernte Bild steht wieder da");
  assert.match(html, /heart-lifeskin-fotoleer/, "Es fehlt der leere Platz");
});

test("auch das Getippte ueberlebt die Fotowahl", () => {
  // Wer einen Satz getippt hat und dann ein Foto waehlt, soll den Satz
  // wiederfinden - deshalb wandert das GANZE Formular in den Entwurf.
  const html = renderLifeskin(zustand({
    produktOffen: "lf-acne",
    produktEntwurf: { name: "LF ACNE PRO", persoenlich_sq: "{emri}, ky serum …" }
  }));
  assert.match(html, /value="LF ACNE PRO"/, "Der getippte Name ist weg");
  assert.match(html, /\{emri\}, ky serum …/, "Der getippte Satz ist weg");
});

test("der Entwurf wird gelesen, bevor etwas neu gezeichnet wird", () => {
  const quelle = ohneKommentare(lies("apps/mnyra-heart/heart.js"));
  const block = funktion(quelle, "lifeskinProduktfoto");
  assert.ok(block.includes("produktEntwurfLesen"),
    "Das Foto landet wieder nur im Formular");
  assert.ok(block.includes("patchLifeskin"),
    "Das Foto steht nirgends, was ein Neuzeichnen ueberlebt");
  // Und der Entwurf gilt nur, solange dieses Produkt offen ist.
  assert.ok(/produktOffen: "", produktEntwurf: null/.test(quelle),
    "Der Entwurf ueberlebt das Schliessen des Formulars");
});

test("die Fotoauswahl haengt an einem Knopf, nicht an einem <label>", () => {
  // Ein <label> um ein Feld mit display:none herum oeffnet die
  // Fotoauswahl nicht auf jedem Telefon. Ueberall sonst in Heart klickt
  // ein Knopf das versteckte Feld an - hier jetzt auch.
  const html = renderLifeskin(zustand({ produktOffen: "lf-acne" }));
  assert.match(html, /data-action="trigger-crm-file" data-crm-file-input="heartLifeskinFotoInput"/);
  assert.match(html, /id="heartLifeskinFotoInput"/);
  assert.doesNotMatch(html, /<label class="heart-lifeskin-fotoknopf"/,
    "Die Auswahl haengt wieder am <label>");
});

test("dasselbe Bild laesst sich zweimal waehlen", () => {
  // Ohne Leeren meldet die zweite Wahl derselben Datei keine Aenderung,
  // und der Knopf sieht kaputt aus.
  const events = ohneKommentare(lies("apps/mnyra-heart/heart-events.js"));
  const block = events.slice(events.indexOf('closest?.("[data-produktfoto]")'));
  assert.match(block.slice(0, 400), /foto\.value = ""/);
});
