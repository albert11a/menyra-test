import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

// Landing 2 wird auf dem Handy geoeffnet, oft im schwachen Netz und meistens
// aus einer Nachricht heraus - also kalt, ohne irgendetwas im Zwischenspeicher.
//
// Ein Modul, das der Browser erst entdeckt, wenn er ein anderes gelesen hat,
// kostet dort eine volle Rundreise. Landing 2 hat drei solche Ebenen:
// index.html -> app -> data/sections -> preview/format/icons/config. Ohne
// Vorladen laeuft das nacheinander ab, bevor die erste Zeile Inhalt angefragt
// wird.
//
// Die modulepreload-Zeilen muessen deshalb vollstaendig bleiben. Was fehlt,
// faellt niemandem auf - die Seite funktioniert ja, sie ist nur langsamer.

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const ORDNER = "apps/menyra-social/lead-landing-2";
const HTML = path.join(ROOT, ORDNER, "index.html");
const EINSTIEG = "landing2-app.js";

function gelesen(datei) {
  return fs.readFileSync(path.join(ROOT, ORDNER, datei), "utf8");
}

function moduleGraph() {
  const gesehen = new Set();
  const offen = [EINSTIEG];
  while (offen.length) {
    const datei = offen.shift();
    if (gesehen.has(datei)) continue;
    gesehen.add(datei);
    for (const treffer of gelesen(datei).matchAll(/from\s*["']\.\/([^"']+)["']/g)) {
      offen.push(treffer[1]);
    }
  }
  return gesehen;
}

function vorgeladen(html) {
  return Array.from(html.matchAll(/rel="modulepreload"\s+href="[^"]*\/([^"/]+\.js)"/g)).map((t) => t[1]);
}

test("jedes Modul von Landing 2 wird vorgeladen", () => {
  const html = fs.readFileSync(HTML, "utf8");
  const liste = new Set(vorgeladen(html));
  // Der Einstieg steht als <script type="module"> da und braucht keine eigene
  // Zeile - der Browser kennt ihn vom ersten Moment an.
  liste.add(EINSTIEG);

  const fehlen = Array.from(moduleGraph()).filter((datei) => !liste.has(datei));
  assert.deepEqual(
    fehlen,
    [],
    `Diese Module werden geladen, aber nicht vorgeladen: ${fehlen.join(", ")}.`
    + ` Je eine <link rel="modulepreload">-Zeile in ${ORDNER}/index.html nachtragen.`
  );
});

test("es wird nichts vorgeladen, was gar nicht gebraucht wird", () => {
  const html = fs.readFileSync(HTML, "utf8");
  const gebraucht = moduleGraph();
  const ueberfluessig = vorgeladen(html).filter((datei) => !gebraucht.has(datei));
  assert.deepEqual(
    ueberfluessig,
    [],
    `Vorgeladen, aber nie benutzt: ${ueberfluessig.join(", ")} - das kostet im schwachen Netz Bandbreite fuer nichts.`
  );
});

test("der Einstieg steht als Modul in der Seite", () => {
  const html = fs.readFileSync(HTML, "utf8");
  assert.match(html, new RegExp(`<script type="module" src="[^"]*${EINSTIEG}"`));
});

test("die Verbindungen zu Firestore und zum Bilder-Dienst werden vorbereitet", () => {
  const html = fs.readFileSync(HTML, "utf8");
  assert.match(html, /rel="preconnect"\s+href="https:\/\/firestore\.googleapis\.com"/);
  assert.match(html, /rel="preconnect"\s+href="https:\/\/menyra-media\.[^"]+"/);
});

test("Landing 2 laedt genau drei Blaetter, in dieser Reihenfolge", () => {
  // Erst die App, dann die Spiegelung ihrer JavaScript-Blaetter, dann die
  // Landing selbst. Ein viertes waere eine zweite Fassung von etwas, das es
  // schon gibt - und genau daran laufen Vorschau und Vorbild auseinander.
  const html = fs.readFileSync(HTML, "utf8");
  const styles = Array.from(html.matchAll(/rel="stylesheet"\s+href="([^"]+)"/g)).map((t) => t[1]);
  assert.deepEqual(styles, [
    "/apps/menyra-social/styles/tailwind.generated.css",
    "/apps/menyra-social/lead-landing-2/landing2-app-mirror.css",
    "/apps/menyra-social/lead-landing-2/landing2-styles.css"
  ]);
});

test("Landing 2 wird nicht von Suchmaschinen aufgenommen", () => {
  // Die Seite ist an eine Person gerichtet, nicht an das Netz.
  const html = fs.readFileSync(HTML, "utf8");
  assert.match(html, /name="robots"\s+content="noindex, nofollow"/);
});
