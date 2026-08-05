import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

// Die Lead-Landing wird auf dem Handy geoeffnet, oft im schwachen Netz.
//
// Ein Modul, das der Browser erst entdeckt, wenn er ein anderes gelesen hat,
// kostet dort eine volle Rundreise - und die Landing hat drei solche Ebenen:
// index.html -> app -> data/sections -> format/icons/config. Ohne Vorladen
// laeuft das nacheinander ab, bevor die erste Zeile Inhalt angefragt wird.
//
// Deshalb stehen in index.html modulepreload-Zeilen. Sie muessen vollstaendig
// bleiben: Was fehlt, wird wieder nachgeladen statt mitgeladen, und niemand
// sieht es - die Seite funktioniert ja, sie ist nur langsamer.

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const ORDNER = "apps/menyra-social/lead-landing";
const HTML = path.join(ROOT, ORDNER, "index.html");
const EINSTIEG = "lead-landing-app.js";

function gelesen(datei) {
  return fs.readFileSync(path.join(ROOT, ORDNER, datei), "utf8");
}

// Alle Module, die beim Aufruf der Seite wirklich geladen werden - vom
// Einstieg aus verfolgt. Dynamische Importe kaemen hier nicht vor; es gibt
// in diesem Ordner keine.
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

test("jedes Modul der Landing wird vorgeladen", () => {
  const html = fs.readFileSync(HTML, "utf8");
  const vorgeladen = new Set(
    Array.from(html.matchAll(/rel="modulepreload"\s+href="[^"]*\/([^"/]+\.js)"/g)).map((t) => t[1])
  );
  // Der Einstieg selbst steht als <script type="module"> da und braucht keine
  // eigene Zeile - der Browser kennt ihn vom ersten Moment an.
  vorgeladen.add(EINSTIEG);

  const gebraucht = moduleGraph();
  const fehlen = Array.from(gebraucht).filter((datei) => !vorgeladen.has(datei));

  assert.deepEqual(
    fehlen,
    [],
    `Diese Module werden geladen, aber nicht vorgeladen: ${fehlen.join(", ")}.`
    + ` Je eine <link rel="modulepreload">-Zeile in ${ORDNER}/index.html nachtragen.`
  );
});

test("es wird nichts vorgeladen, was gar nicht gebraucht wird", () => {
  const html = fs.readFileSync(HTML, "utf8");
  const vorgeladen = Array.from(html.matchAll(/rel="modulepreload"\s+href="[^"]*\/([^"/]+\.js)"/g)).map((t) => t[1]);
  const gebraucht = moduleGraph();
  const ueberfluessig = vorgeladen.filter((datei) => !gebraucht.has(datei));

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
  // Ohne das faengt DNS, TCP und TLS erst an, wenn das Skript schon laeuft.
  assert.match(html, /rel="preconnect"\s+href="https:\/\/firestore\.googleapis\.com"/);
  assert.match(html, /rel="preconnect"\s+href="https:\/\/menyra-media\.[^"]+"/);
});

test("die Aufnahmen der App werden dauerhaft zwischengespeichert", () => {
  // Sie aendern sich nie - eine andere Aufnahme bekommt einen anderen
  // Dateinamen. Unter der allgemeinen no-cache-Regel des Ordners fragte der
  // Browser sie bei jedem Aufruf neu nach.
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
  const regel = vercel.headers.find((eintrag) => eintrag.source === `/${ORDNER}/media/:path*`);
  assert.ok(regel, "es gibt keine eigene Regel fuer die Aufnahmen");
  const cache = regel.headers.find((kopf) => kopf.key === "Cache-Control");
  assert.match(cache.value, /immutable/);
  assert.match(cache.value, /max-age=\d{7,}/, "die Frist ist zu kurz, um etwas zu bringen");
});
