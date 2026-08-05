import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

// Der Landing-Adapter wird erst geladen, wenn jemand den Bereich in Heart
// oeffnet - kein Test hat ihn dadurch je angefasst, und ein Tippfehler im
// Import fiel erst im Browser auf ("Importing binding name 'db' is not
// found."). Dieser Test liest die Importe und sieht in der jeweiligen Datei
// nach, ob es den Namen dort ueberhaupt gibt.

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const GEPRUEFT = [
  "apps/mnyra-heart/heart-landing-adapter.js",
  "apps/mnyra-heart/heart-landing-render.js"
];

// import { a, b as c } from "..." - Sternchen- und Standardimporte kommen hier
// nicht vor und werden absichtlich nicht behandelt.
const IMPORT = /import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;

function aufloesen(quelle, ziel) {
  if (ziel.startsWith("/")) return path.join(ROOT, ziel.slice(1));
  if (ziel.startsWith(".")) return path.resolve(path.dirname(quelle), ziel);
  return "";
}

// Reicht fuer die Formen, die im Projekt vorkommen: "export function name",
// "export const name", "export { a, b as c }".
function exporte(datei) {
  const text = fs.readFileSync(datei, "utf8");
  const namen = new Set();
  for (const treffer of text.matchAll(/export\s+(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z0-9_$]+)/g)) {
    namen.add(treffer[1]);
  }
  for (const block of text.matchAll(/export\s*\{([^}]*)\}/g)) {
    block[1].split(",").forEach((teil) => {
      const stueck = teil.trim().split(/\s+as\s+/);
      const name = (stueck[1] || stueck[0] || "").trim();
      if (name) namen.add(name);
    });
  }
  return namen;
}

for (const datei of GEPRUEFT) {
  test(`jeder Import in ${datei} zeigt auf etwas, das es gibt`, () => {
    const quelle = path.join(ROOT, datei);
    const text = fs.readFileSync(quelle, "utf8");
    let gefunden = 0;

    for (const treffer of text.matchAll(IMPORT)) {
      const ziel = aufloesen(quelle, treffer[2]);
      if (!ziel) continue;
      assert.ok(fs.existsSync(ziel), `${datei}: ${treffer[2]} gibt es nicht`);

      const vorhanden = exporte(ziel);
      assert.ok(
        vorhanden.size > 0,
        `${datei}: aus ${treffer[2]} liessen sich keine Exporte ablesen - dann prueft dieser Test dort nichts`
      );

      treffer[1].split(",").forEach((teil) => {
        const name = teil.trim().split(/\s+as\s+/)[0].trim();
        if (!name) return;
        gefunden += 1;
        assert.ok(
          vorhanden.has(name),
          `${datei}: "${name}" wird aus ${treffer[2]} geholt, dort aber nicht exportiert`
        );
      });
    }

    assert.ok(gefunden > 0, `${datei}: keine Importe geprueft - der Test greift ins Leere`);
  });
}
