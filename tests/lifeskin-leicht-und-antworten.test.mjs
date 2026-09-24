// 24.09.: Auswertung 22.-24.09. - "mittel" kaufte jeder dritte, "leicht"
// niemand; Kaeufer lasen die vier Fragen vor dem Kauf.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const lies = (p) => fs.readFileSync(p, "utf8");

test("beide Prompts verbieten das Kleinreden leichter Befunde", () => {
  for (const datei of ["docs/lifeskin-prompt-v8.txt", "docs/lifeskin-prompt-v8-pa-foto.txt"]) {
    const p = lies(datei);
    const i = p.indexOf("TON BEI LEICHTEN BEFUNDEN – NICHT VERHARMLOSEN");
    assert.ok(i > 0, `${datei}: Regel fehlt`);
    assert.ok(i < p.indexOf("TEIL B – DIE THERAPIESEITE"), `${datei}: Regel steht nicht vor Teil B`);
    const regel = p.slice(i, p.indexOf("TEIL B – DIE THERAPIESEITE"));
    for (const wort of ["VERBOTEN", "e lehtë", "një numër i vogël", "fazë të hershme", "Nichts übertreiben"]) {
      assert.ok(regel.includes(wort), `${datei}: ${wort} fehlt`);
    }
    // Die Skala selbst bleibt unangetastet (nur der Prompt mit Foto hat eine).
    if (datei.endsWith("v8.txt")) assert.match(p, /1 → "e lehtë"/);
  }
});

test("die vier Antworten stehen oben und unten direkt unter dem Preis-Knopf", () => {
  const html = lies("apps/lifeskin-verkauf/terapia.html");
  assert.match(html, /id="hero-knopf"><\/button>\s*<div class="pergjigjet" id="t-siguria"><\/div>/);
  assert.match(html, /<button class="knopf" type="button" data-porosi><\/button>\s*<div class="pergjigjet" id="t-premtimet"><\/div>/);
  const js = lies("apps/lifeskin-verkauf/terapia.js");
  const i = js.indexOf("  #zusagen() {");
  const zusagen = js.slice(i, js.indexOf("\n  }\n", i));
  for (const s of ["Për lëkurën tuaj", "Ndryshimi", "Pagesa", "Garancia", "${tage} ditë – ose ju kthejmë paratë."]) {
    assert.ok(zusagen.includes(s), `Antwort fehlt: ${s}`);
  }
  // Aus der Konfiguration, nicht fest im Text.
  assert.match(zusagen, /nachnahme \? \["Pagesa"/);
  assert.match(zusagen, /tage \? \["Garancia"/);
});
