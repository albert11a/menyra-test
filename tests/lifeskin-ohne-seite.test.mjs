// Kein links/rechts (gespiegelte Fotos) und die persoenlichen
// Produkttexte aus der Analyse.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { ohneSeite, ohneSeiteTief } from "../shared/lifeskin-ohne-seite.js";
import { raportLesen } from "../shared/lifeskin-analyse.js";
import { ausAnalyse } from "../shared/lifeskin-terapia.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");

test("links und rechts fallen weg, die Zone bleibt", () => {
  const faelle = [
    ["Puçrra aktive kryesisht në faqen e majtë dhe më pak drejt temthit.", "Puçrra aktive kryesisht në faqe dhe më pak drejt temthit."],
    ["Pore të zgjeruara në faqen e djathtë dhe në faqen e majtë.", "Pore të zgjeruara në të dy faqet."],
    ["faqja majtas", "faqja"],
    ["Njolla në tëmthin e djathtë.", "Njolla në tëmthin."],
    ["Skuqje në anën e majtë të fytyrës.", "Skuqje në njërën anë të fytyrës."],
    ["Mjekra (majtas) ka puçrra.", "Mjekra ka puçrra."],
    ["Vija e nofullës djathtas: komedone.", "Vija e nofullës: komedone."]
  ];
  for (const [vorher, nachher] of faelle) assert.equal(ohneSeite(vorher), nachher);
  for (const text of faelle.map(([, n]) => n)) assert.doesNotMatch(text, /majt|djatht/i);
});

test("Text ohne Seitenwort bleibt Zeichen fuer Zeichen gleich", () => {
  const text = "  Poret e bllokuara në ballë (T-zona).  ";
  assert.equal(ohneSeite(text), text);
  assert.deepEqual(ohneSeiteTief({ a: [1, "x", { b: null }] }), { a: [1, "x", { b: null }] });
});

test("das JSON der Analyse kommt ohne Seitenangabe in Heart an", () => {
  const raport = raportLesen(JSON.stringify({
    schema_version: 3,
    gjetjet: { permbledhja: "Puçrra në faqen e majtë.", gjetja_kryesore: "Puçrra në faqen e djathtë", sipas_zonave: [
      { zona: "faqja majtas", teksti: "Puçrra aktive." },
      { zona: "faqja djathtas", teksti: "Pak skuqje." }
    ] },
    nevojat: [{ roli: "kryesor", produkt_id: "lf-acne", gjetja: "puçrra", teksti: "Në faqen e majtë ka puçrra; LF ACNE i qetëson." }]
  }));
  assert.doesNotMatch(JSON.stringify(raport), /majt|djatht/i);
  // Zwei Zonen, die jetzt gleich heissen, werden eine.
  assert.deepEqual(raport.zonaLista, [{ zona: "faqja", teksti: "Puçrra aktive. Pak skuqje." }]);
});

test("persoenliche Produkttexte aus der Analyse - immer drei Zeilen", () => {
  const raport = {
    nevojat: [{ produkt_id: "lf-acne", gjetja: "puçrrat në faqe", teksti: "Puçrrat në faqe janë gjetja kryesore. LF ACNE i qetëson çdo mbrëmje." }],
    shitja: { produktet: [{ produkt_id: "lf-acne", per_ju: ["Qetëson puçrrat e kuqe në faqe", "Hap poret e bllokuara"] }] }
  };
  const katalog = ["Hap poret e bllokuara", "Ul bakterin", "Qetëson skuqjen"];
  const eigen = ausAnalyse(raport, "lf-acne", katalog);
  assert.equal(eigen.satz, "Puçrrat në faqe janë gjetja kryesore. LF ACNE i qetëson çdo mbrëmje.");
  assert.deepEqual(eigen.veprimi, ["Qetëson puçrrat e kuqe në faqe", "Hap poret e bllokuara", "Ul bakterin"]);
  assert.equal(eigen.zweck, "puçrrat në faqe");
  assert.equal(ausAnalyse(raport, "lf-pore", katalog), null, "ohne eigene Texte bleibt die Automatik");
});

test("Heart nimmt die Texte der Analyse vor dem Regelsatz", () => {
  const heart = lies("apps/mnyra-heart/heart.js");
  const stelle = heart.indexOf("function lifeskinTherapieFuellen");
  const koerper = heart.slice(stelle, stelle + 3500);
  assert.match(koerper, /ausAnalyse\(raport, t\.id, t\.veprimi\)/);
  assert.match(koerper, /eigen\?\.satz \|\| t\.arsyeja/);
  assert.match(koerper, /nuk \(lufton\|trajton/);
});

test("die Prompts verbieten links/rechts und verlangen drei per_ju-Punkte", () => {
  for (const datei of ["docs/lifeskin-prompt-v8.txt", "docs/lifeskin-prompt-v8-pa-foto.txt"]) {
    const prompt = lies(datei);
    assert.match(prompt, /„majtë", „djathtë", „majtas", „djathtas"/, datei);
    assert.match(prompt, /GENAU 3 Punkte/, datei);
    assert.match(prompt, /nuk lufton/, datei);
  }
  assert.doesNotMatch(lies("docs/lifeskin-prompt-v8.txt"), /faqja djathtas|temthi majtas/);
});

test("der Katalog sagt nicht, was LF MOISTUR nicht tut", () => {
  assert.doesNotMatch(lies("apps/lifeskin/lifeskin-catalog.js"), /nuk lufton/);
});
