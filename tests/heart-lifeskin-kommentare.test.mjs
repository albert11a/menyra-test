// Kommentare schreiben in Heart: eine Zeile = ein Kommentar, "Name, Text".
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { kommentareAusText, KOMMENTARE_JE_MAL } from "../shared/lifeskin-medien.js";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");

test("eine Zeile wird ein Kommentar: Name bis zum ersten Komma, der Rest ist Text", () => {
  const { kommentare, fehler } = kommentareAusText("lind, mrrekulli ❤️");
  assert.deepEqual(fehler, []);
  assert.deepEqual(kommentare, [{ zeile: 1, name: "lind", text: "mrrekulli ❤️" }]);
});

test("mehrere Zeilen, Aufzaehlungen, Kommas im Text und leere Zeilen", () => {
  const { kommentare, fehler } = kommentareAusText([
    "- Arta, e kam provu, po shkon mirë, faleminderit",
    "",
    "• Blerta: super",
    "3. Dren, 👍",
    "   "
  ].join("\n"));
  assert.deepEqual(fehler, []);
  assert.deepEqual(kommentare.map((k) => [k.zeile, k.name, k.text]), [
    [1, "Arta", "e kam provu, po shkon mirë, faleminderit"],
    [3, "Blerta", "super"],
    [4, "Dren", "👍"]
  ]);
});

test("was nicht geht, sagt die Zeile und den Grund - und nichts wird geraten", () => {
  const lang = "x".repeat(41);
  const { kommentare, fehler } = kommentareAusText([
    "nur text ohne komma",
    ", text ohne name",
    "Name ohne text,",
    `${lang}, zu langer name`,
    `Ok, ${"y".repeat(501)}`,
    "Gut, geht"
  ].join("\n"));
  assert.deepEqual(kommentare.map((k) => k.name), ["Gut"]);
  assert.deepEqual(fehler.map((f) => [f.zeile, f.grund]), [
    [1, "kein Komma zwischen Name und Text"],
    [2, "der Name fehlt"],
    [3, "der Text fehlt"],
    [4, "Name länger als 40 Zeichen"],
    [5, "Text länger als 500 Zeichen"]
  ]);
});

test("die Grenzen sind die der Firestore-Regel", () => {
  const regeln = lies("firestore.rules");
  assert.match(regeln, /name\.size\(\) >= 1 && request\.resource\.data\.name\.size\(\) <= 40/);
  assert.match(regeln, /text\.size\(\) >= 1 && request\.resource\.data\.text\.size\(\) <= 500/);
  assert.equal(KOMMENTARE_JE_MAL, 100, "die Seite zeigt je Medium hoechstens 100");
});

test("Heart schreibt genau die vier erlaubten Felder, sofort sichtbar", () => {
  const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
  const block = adapter.slice(adapter.indexOf("export async function schreibeKommentare"), adapter.indexOf("export async function setzeKommentarVerborgen"));
  assert.match(block, /name: String\(k\.name\)\.slice\(0, 40\)/);
  assert.match(block, /text: String\(k\.text\)\.slice\(0, 500\)/);
  assert.match(block, /createdAt: new Date\(jetzt - i\)\.toISOString\(\)/);
  assert.match(block, /verborgen: false/);
  assert.match(block, /writeBatch\(db\)/);
});

test("das Formular steht unter Reaktionen, bleibt beim Neuzeichnen und ist verdrahtet", async () => {
  const { renderMedienReaktionen } = await import("../apps/mnyra-heart/heart-lifeskin-medien.js");
  const medien = [
    { id: "m-a", art: "foto", bild: "https://cdn/a.jpg", produkt: "LF ACNE", aktiv: true, reihe: 0, views: 1 },
    { id: "m-b", art: "video", bild: "https://cdn/b.jpg", video: "https://cdn/b.mp4", produkt: "<b>x</b>", aktiv: false, reihe: 1, views: 0 }
  ];
  const html = renderMedienReaktionen({ medien, medienKommentare: { "m-a": [], "m-b": [] } });
  assert.match(html, /Kommentare schreiben/);
  assert.match(html, /data-bewahren="kommentar-import:m-a,m-b"/, "Einfuegtes ginge beim naechsten Neuzeichnen verloren");
  assert.match(html, /<option value="m-a">LF ACNE · Foto 1<\/option>/);
  assert.match(html, /<option value="m-b">&lt;b&gt;x&lt;\/b&gt; · Video 2 \(aus\)<\/option>/, "nicht maskiert");
  assert.match(html, /data-kommentar-text/);
  assert.match(html, /data-action="lifeskin-kommentare-speichern" disabled/);
  // Ohne gespeicherte Medien gibt es nichts, worunter ein Kommentar stehen koennte.
  assert.doesNotMatch(renderMedienReaktionen({ medien: [] }), /Kommentare schreiben/);

  const ereignisse = lies("apps/mnyra-heart/heart-events.js");
  assert.match(ereignisse, /\[data-kommentar-text\][\s\S]{0,80}lifeskinKommentarVorschau/);
  assert.match(ereignisse, /lifeskin-kommentare-speichern[\s\S]{0,80}lifeskinKommentareSpeichern/);
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /lifeskinKommentareSpeichern\(\) \{ return lifeskinKommentareSpeichern\(\); \}/);
  assert.match(heart, /kommentarVorschauSetzen\(form\)/);
});
