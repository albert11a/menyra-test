import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

// Kommentare gehoeren in den Quelltext, nicht auf den Server.
//
// Diese Dateien gehen an jeden Browser. Wer sie oeffnet, liest sonst nicht
// nur, WIE die Befundseite gebaut ist, sondern auch, welche Ueberlegung
// hinter jeder Entscheidung steht - warum ein Absatz gerade deshalb wirkt,
// weil ihn niemand zu Ende liest, oder warum eine wachsende Messung nicht
// angezweifelt wird. Im Verzeichnis ist das wertvoll. Auf dem Telefon
// eines Patienten, eines Mitbewerbers oder eines Journalisten ist es ein
// Vertrauensproblem, das niemand braucht.

test("der Quelltext bleibt kommentiert - das ist Absicht", () => {
  // Die Gegenrichtung ist genauso wichtig: Wer die Kommentare aus dem
  // Quelltext entfernt, statt aus dem Ausgelieferten, macht die
  // Begruendungen kaputt, ohne das Problem zu loesen.
  for (const datei of ["apps/lifeskin-bericht/bericht.js", "apps/lifeskin-astra/astra.js"]) {
    const seite = readFileSync(join(wurzel, datei), "utf8");
    const zeilen = seite.split("\n").filter((z) => z.trim().startsWith("//")).length;
    assert.ok(zeilen > 100, `${datei}: nur ${zeilen} Kommentarzeilen - da ist etwas verlorengegangen`);
  }
});

test("der Bau entfernt die Kommentare aus dem, was ausgeliefert wird", () => {
  const bau = readFileSync(join(wurzel, "scripts/build-vercel-static-output.mjs"), "utf8");
  assert.match(bau, /async function kommentareEntfernen\(\)/,
    "Der Bau entfernt keine Kommentare mehr");
  assert.match(bau, /await kommentareEntfernen\(\)/,
    "Der Schritt steht da, wird aber nicht ausgefuehrt");

  for (const bereich of ["apps/lifeskin", "apps/lifeskin-astra", "apps/lifeskin-bericht",
    "apps/mnyra-heart", "shared"]) {
    assert.ok(bau.includes(`"${bereich}"`), `${bereich} wird nicht mitgeputzt`);
  }
  // Nur Kommentare und Leerraum - keine Namen kuerzen, keine Syntax
  // umschreiben. Was laeuft, muss danach unveraendert laufen.
  assert.match(bau, /minifyWhitespace: true/);
  assert.ok(!/minifyIdentifiers:\s*true/.test(bau),
    "Es werden Namen gekuerzt - das ist ein anderes Risiko als Kommentare entfernen");
});

test("im gebauten Verzeichnis steht keine Strategie mehr", { skip: !existsSync(join(wurzel, "dist")) }, () => {
  // Laeuft nur, wenn schon gebaut wurde. Dann aber scharf.
  const verraeter = /ueberflogen|ueberliest|Skeptiker|glaubt niemand|hinterfragt|Zoegernd|wirkt er/i;
  const treffer = [];
  const gehen = (ordner) => {
    for (const name of readdirSync(ordner)) {
      const voll = join(ordner, name);
      if (statSync(voll).isDirectory()) { gehen(voll); continue; }
      if (!/\.(js|mjs|css|html)$/i.test(name)) continue;
      if (verraeter.test(readFileSync(voll, "utf8"))) treffer.push(voll.slice(wurzel.length + 1));
    }
  };
  for (const bereich of ["dist/apps/lifeskin", "dist/apps/lifeskin-astra",
    "dist/apps/lifeskin-bericht", "dist/shared"]) {
    const pfad = join(wurzel, bereich);
    if (existsSync(pfad)) gehen(pfad);
  }
  assert.deepEqual(treffer, [], "Diese ausgelieferten Dateien tragen noch Strategie-Kommentare");
});
