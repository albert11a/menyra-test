// Was der Trichter an Sprache und Schnittstellen voraussetzt - und ab
// welchem Browser es das gibt.
//
// Statisch, weil kein Testrechner einen Safari 14 mehr anbietet. Gesucht
// wird nach dem, was aeltere Fenster von Facebook, Instagram und TikTok
// wirklich noch mitbringen.

import { readFileSync, readdirSync } from "node:fs";

const ORDNER = new URL("../../apps/lifeskin", import.meta.url).pathname;
const dateien = readdirSync(ORDNER).filter(
  (d) => d.endsWith(".js") || d.endsWith(".css") || d.endsWith(".html"),
);

// Muster -> ab wann es das gibt.
const MERKMALE = [
  {
    name: "ES-Module (<script type=module>)",
    muster: /type="module"/,
    chrome: 61,
    safari: 11,
    android: 61,
  },
  {
    name: "optionale Verkettung  ?.",
    muster: /\?\./,
    chrome: 80,
    safari: 13.4,
    android: 80,
  },
  {
    name: "Nullwert-Vereinigung  ??",
    muster: /[^?]\?\?[^?]/,
    chrome: 80,
    safari: 13.4,
    android: 80,
  },
  {
    name: "logische Zuweisung  ??=  ||=",
    muster: /(\?\?=|\|\|=|&&=)/,
    chrome: 85,
    safari: 14,
    android: 85,
  },
  {
    name: "private Felder/Methoden  #name",
    muster: /(^|\s)#[a-zA-Z]\w*\s*[(=]/m,
    chrome: 84,
    safari: 14.1,
    android: 84,
  },
  {
    name: "statische Klassenfelder",
    muster: /static\s+[A-Z_]+\s*=/,
    chrome: 72,
    safari: 14.1,
    android: 72,
  },
  {
    name: "String.replaceAll",
    muster: /\.replaceAll\(/,
    chrome: 85,
    safari: 13.1,
    android: 85,
  },
  {
    name: "Array.at",
    muster: /\.at\(-?\d/,
    chrome: 92,
    safari: 15.4,
    android: 92,
  },
  {
    name: "Object.hasOwn",
    muster: /Object\.hasOwn/,
    chrome: 93,
    safari: 15.4,
    android: 93,
  },
  {
    name: "structuredClone",
    muster: /structuredClone/,
    chrome: 98,
    safari: 15.4,
    android: 98,
  },
  {
    name: "Array.prototype.flatMap",
    muster: /\.flatMap\(/,
    chrome: 69,
    safari: 12,
    android: 69,
  },
  {
    name: "dynamisches import()",
    muster: /\bimport\s*\(/,
    chrome: 63,
    safari: 11.1,
    android: 63,
  },
  {
    name: "Top-Level await",
    muster: /^await\s/m,
    chrome: 89,
    safari: 15,
    android: 89,
  },
  {
    name: "AbortController",
    muster: /AbortController/,
    chrome: 66,
    safari: 12.1,
    android: 66,
  },
  {
    name: "ResizeObserver",
    muster: /ResizeObserver/,
    chrome: 64,
    safari: 13.1,
    android: 64,
  },
  {
    name: "OffscreenCanvas",
    muster: /OffscreenCanvas/,
    chrome: 69,
    safari: 16.4,
    android: 69,
  },
  {
    name: "createImageBitmap",
    muster: /createImageBitmap/,
    chrome: 50,
    safari: 15,
    android: 50,
  },
  {
    name: "navigator.mediaDevices",
    muster: /mediaDevices/,
    chrome: 53,
    safari: 11,
    android: 53,
  },
  {
    name: "WebGL2 / WASM (MediaPipe)",
    muster: /tasks-vision|FaceLandmarker/,
    chrome: 84,
    safari: 15,
    android: 84,
  },
  {
    name: "CSS  aspect-ratio",
    muster: /aspect-ratio\s*:/,
    chrome: 88,
    safari: 15,
    android: 88,
  },
  {
    name: "CSS  100dvh",
    muster: /100dvh/,
    chrome: 108,
    safari: 15.4,
    android: 108,
  },
  {
    name: "CSS  env(safe-area-inset)",
    muster: /env\(safe-area/,
    chrome: 69,
    safari: 11.1,
    android: 69,
  },
  {
    name: "CSS  inset:",
    muster: /\binset\s*:/,
    chrome: 87,
    safari: 14.1,
    android: 87,
  },
  {
    name: "CSS  gap in flexbox",
    muster: /gap\s*:/,
    chrome: 84,
    safari: 14.1,
    android: 84,
  },
  {
    name: "CSS  text-wrap: balance",
    muster: /text-wrap\s*:\s*balance/,
    chrome: 114,
    safari: 17.5,
    android: 114,
  },
  {
    name: "CSS  :focus-visible",
    muster: /:focus-visible/,
    chrome: 86,
    safari: 15.4,
    android: 86,
  },
  {
    name: "CSS  :has()",
    muster: /:has\(/,
    chrome: 105,
    safari: 15.4,
    android: 105,
  },
  {
    name: "CSS  color-scheme",
    muster: /color-scheme\s*:/,
    chrome: 81,
    safari: 13,
    android: 81,
  },
];

const inhalt = {};
for (const d of dateien) inhalt[d] = readFileSync(`${ORDNER}/${d}`, "utf8");

console.log("\n═══ Was der Trichter voraussetzt ═══\n");
console.log(
  "Merkmal                                  ab Chrome  ab Safari   gefunden in",
);
console.log("─".repeat(96));
let hoechstesChrome = 0,
  hoechstesSafari = 0;
for (const m of MERKMALE) {
  const treffer = dateien.filter((d) => m.muster.test(inhalt[d]));
  if (!treffer.length) continue;
  if (m.chrome > hoechstesChrome) hoechstesChrome = m.chrome;
  if (m.safari > hoechstesSafari) hoechstesSafari = m.safari;
  console.log(
    `${m.name.padEnd(40)} ${String(m.chrome).padStart(8)}  ${String(m.safari).padStart(9)}   ${treffer.slice(0, 3).join(", ")}${treffer.length > 3 ? ` +${treffer.length - 3}` : ""}`,
  );
}
console.log("─".repeat(96));
// ZWEI SORTEN GRENZE, und nur die eine tut weh.
//
// Ein CSS-Merkmal, das der Browser nicht kennt, ueberliest er: Die Seite
// sieht etwas anders aus und steht trotzdem. Ein JavaScript-Merkmal, das er
// nicht kennt, ist ein Parserfehler - und ein Modul mit Parserfehler wird
// GAR NICHT ausgefuehrt. Dann steht da nur noch "LIFESKIN".
const jsMerkmale = MERKMALE.filter(
  (m) =>
    !m.name.startsWith("CSS") &&
    dateien.some((d) => d.endsWith(".js") && m.muster.test(inhalt[d])),
);
const jsChrome = Math.max(...jsMerkmale.map((m) => m.chrome));
const jsSafari = Math.max(...jsMerkmale.map((m) => m.safari));
const cssMerkmale = MERKMALE.filter(
  (m) =>
    m.name.startsWith("CSS") &&
    m.muster.test(inhalt["lifeskin-styles.css"] || ""),
);
console.log(
  `\nHARTE GRENZE (JavaScript - darunter bleibt der Bildschirm leer):`,
);
console.log(
  `   Chrome / Android-WebView ab ${jsChrome}   (${jsMerkmale
    .filter((m) => m.chrome === jsChrome)
    .map((m) => m.name)
    .join(", ")})`,
);
console.log(
  `   Safari / iOS             ab ${jsSafari}  (${jsMerkmale
    .filter((m) => m.safari === jsSafari)
    .map((m) => m.name)
    .join(", ")})`,
);
console.log(
  `   Kein <script nomodule> und kein Ersatztext: ${/nomodule|<noscript/.test(inhalt["index.html"]) ? "DOCH, vorhanden" : "nicht vorhanden"}.`,
);
console.log(`\nWEICHE GRENZE (CSS - sieht anders aus, steht aber):`);
console.log(
  `   Chrome ab ${Math.max(...cssMerkmale.map((m) => m.chrome))} / Safari ab ${Math.max(...cssMerkmale.map((m) => m.safari))} fuer das volle Bild.`,
);
for (const m of cssMerkmale.filter((m) => m.chrome >= 105)) {
  console.log(`   · ${m.name}: darunter nur kosmetisch anders`);
}
