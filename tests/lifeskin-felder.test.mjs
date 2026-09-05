import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

// Der Trichter und die Firestore-Regeln muessen dasselbe Dokument meinen.
//
// Sie taten es nicht, und der Fehler war unsichtbar: hasOnly weist das GANZE
// Dokument ab, sobald ein einziges unbekanntes Feld darin steht. Der Schritt
// "captured" schrieb neun Felder, die die Liste nicht kannte - also ging er
// jedes Mal verloren, mitsamt metrics und ratios.
//
// Nach aussen sah nichts kaputt aus. Der Trichter zaehlte weiter, weil der
// naechste Schritt wieder durchkam und den Stand mitzog. Nur die Messwerte,
// um die es bei einer Hautanalyse geht, kamen nie an.
//
// Ein Fehler, den niemand sieht, wird nicht bemerkt, sondern gefunden -
// deshalb dieser Test.

// Kommentarzeilen weg, bevor gesucht wird.
//
// Ohne das findet die Suche nur Schluessel, vor denen unmittelbar ein Komma
// steht - und in dieser Datei steht vor fast jedem Schluessel eine Erklaerung.
// Genau daran hat der Test beim ersten Versuch vorbeigeschaut: Er war gruen,
// obwohl ringAnteil in den Regeln fehlte. Ein Test, der den Fehler nicht
// findet, den er sucht, ist schlimmer als keiner.
function ohneKommentare(quelle) {
  return quelle.replace(/^[ \t]*\/\/.*$/gm, "");
}

const app = ohneKommentare(readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8"));
const session = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-session.js"), "utf8");
const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");

// Die Feldliste aus lifeskinSessionShapeOk.
function erlaubteFelder() {
  const anfang = regeln.indexOf("function lifeskinSessionShapeOk()");
  assert.notEqual(anfang, -1, "lifeskinSessionShapeOk nicht gefunden");
  const hasOnly = regeln.indexOf("hasOnly([", anfang);
  const ende = regeln.indexOf("])", hasOnly);
  const block = regeln.slice(hasOnly, ende);
  return new Set([...block.matchAll(/"([a-zA-Z][a-zA-Z0-9_]*)"/g)].map((m) => m[1]));
}

// Alles, was schritt() und ergaenze() als Feld mitgeben.
function geschriebeneFelder() {
  const felder = new Set();
  // Was Sitzung.starte() immer selbst setzt.
  for (const fest of ["createdAt", "updatedAt", "step", "sprache", "source", "device"]) felder.add(fest);

  const aufrufe = [...app.matchAll(/sitzung\.(?:schritt|ergaenze)\(/g)];
  for (const treffer of aufrufe) {
    // Vom Aufruf bis zur schliessenden Klammer der Ebene - grob, aber es
    // reicht: gesucht sind nur Schluessel auf der obersten Ebene.
    let i = treffer.index + treffer[0].length;
    let tiefe = 1;
    let objekttiefe = 0;
    let stueck = "";
    while (i < app.length && tiefe > 0) {
      const z = app[i];
      if (z === "(") tiefe += 1;
      else if (z === ")") tiefe -= 1;
      else if (z === "{") { objekttiefe += 1; if (objekttiefe === 1) { i += 1; continue; } }
      else if (z === "}") objekttiefe -= 1;
      if (objekttiefe === 1) stueck += z;
      i += 1;
    }
    for (const m of stueck.matchAll(/(?:^|[,{\n])\s*([a-zA-Z][a-zA-Z0-9_]*)\s*:/g)) felder.add(m[1]);
  }
  return felder;
}

test("die Regeln kennen jedes Feld, das der Trichter schreibt", () => {
  const erlaubt = erlaubteFelder();
  const geschrieben = geschriebeneFelder();
  assert.ok(geschrieben.size > 10, `Zu wenige Felder gefunden (${geschrieben.size}) - die Suche greift nicht mehr`);

  const fehlend = [...geschrieben].filter((f) => !erlaubt.has(f)).sort();
  assert.deepEqual(
    fehlend,
    [],
    `Diese Felder schreibt der Trichter, aber firestore.rules weist sie ab.\n`
    + `hasOnly verwirft das ganze Dokument - der Schritt geht komplett verloren:\n  ${fehlend.join(", ")}`
  );
});

test("die Felder, um die es geht, sind wirklich dabei", () => {
  const erlaubt = erlaubteFelder();
  // Ohne diese beiden ist eine Hautanalyse keine.
  for (const feld of ["metrics", "ratios", "skinType", "findings", "photos"]) {
    assert.ok(erlaubt.has(feld), `${feld} fehlt in den Regeln`);
  }
});

test("jeder Schritt, den der Trichter kennt, ist in den Regeln erlaubt", () => {
  const ausSession = session.match(/const SCHRITTE = Object\.freeze\(\[([^\]]+)\]/);
  assert.ok(ausSession, "SCHRITTE nicht gefunden");
  const schritte = [...ausSession[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1]);

  const anfang = regeln.indexOf("function lifeskinSessionShapeOk()");
  const stelle = regeln.indexOf("data.step in [", anfang);
  const ende = regeln.indexOf("]", stelle);
  const erlaubt = [...regeln.slice(stelle, ende).matchAll(/"([a-z]+)"/g)].map((m) => m[1]);

  assert.deepEqual(schritte, erlaubt, "Trichter und Regeln kennen nicht dieselben Schritte");
});
