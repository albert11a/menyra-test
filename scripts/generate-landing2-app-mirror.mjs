// Spiegelt die echten Stilblaetter der App nach Landing 2.
//
// Landing 2 zeigt echte Mnyra-Bildschirme. "Echt" heisst hier nicht
// "nachgezeichnet": Die Vorschau traegt dieselben Klassennamen wie die App,
// und die Regeln dahinter kommen aus derselben Quelle.
//
// Fuer die Tailwind-Klassen genuegt das Stylesheet der App selbst - Landing 2
// laedt es (styles/tailwind.generated.css). Die uebrigen Flaechen (Karte,
// Paneli, Mnyra GO) tragen eigene, von Hand geschriebene Blaetter, die in der
// App als JavaScript-Zeichenketten liegen und zur Laufzeit eingesetzt werden.
// Ein Stylesheet kann keine JavaScript-Zeichenkette laden - also werden sie
// hier herausgeschnitten und als Datei abgelegt.
//
// Abgeschrieben, nicht importiert: Landing 2 zieht keine Zeile Code aus der
// App (der Grund steht in landing2-config.js). Damit die Kopie nicht
// auseinanderlaeuft, laesst tests/landing2-parity.test.mjs dieses Skript
// erneut laufen und vergleicht das Ergebnis mit der abgelegten Datei. Wer
// eine Flaeche in der App aendert und Landing 2 vergisst, faellt im Test.
//
// Aufruf: node scripts/generate-landing2-app-mirror.mjs
//         node scripts/generate-landing2-app-mirror.mjs --check

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

export const MIRROR_TARGET = "apps/menyra-social/lead-landing-2/landing2-app-mirror.css";

function read(relativePath) {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

// Eine exportierte CSS-Zeichenkette aus einem Modul der App.
function cssConstant(relativePath, name) {
  const source = read(relativePath);
  const opener = `export const ${name} = \``;
  const start = source.indexOf(opener);
  if (start < 0) throw new Error(`${name} nicht in ${relativePath} gefunden`);
  const from = start + opener.length;
  const end = source.indexOf("`;", from);
  if (end < 0) throw new Error(`${name} in ${relativePath} ist nicht abgeschlossen`);
  return source.slice(from, end).trim();
}

// Ein Stueck aus dem <style> von index.html - von der ersten Zeile bis
// einschliesslich der letzten. Beide Marken muessen eindeutig sein.
function htmlCssRange(relativePath, startMarker, endMarker) {
  const source = read(relativePath);
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`Anfang "${startMarker}" nicht in ${relativePath} gefunden`);
  const end = source.indexOf(endMarker, start);
  if (end < 0) throw new Error(`Ende "${endMarker}" nicht in ${relativePath} gefunden`);
  return source.slice(start, end + endMarker.length)
    .split("\n")
    .map((line) => (line.startsWith("    ") ? line.slice(4) : line))
    .join("\n")
    .trim();
}

// Eine einzelne Regel aus einer CSS-Zeichenkette, ueber die geschweiften
// Klammern gezaehlt - Kommentare darin koennen Klammern enthalten.
function cssRule(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`Regel "${selector}" nicht gefunden`);
  let depth = 0;
  for (let index = css.indexOf("{", start); index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    else if (css[index] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(start, index + 1);
    }
  }
  throw new Error(`Regel "${selector}" ist nicht abgeschlossen`);
}

const SOURCES = [
  {
    key: "app-root",
    note: "Die Marken der App: Seitenpolster, Flaechen, Schutzraender. apps/menyra-social/index.html",
    build: () => htmlCssRange(
      "apps/menyra-social/index.html",
      ":root {\n      --safe-area-top: 0px;",
      "@supports (padding: constant(safe-area-inset-top)) {\n      :root {\n        --safe-area-top: constant(safe-area-inset-top);\n        --safe-area-right: constant(safe-area-inset-right);\n        --safe-area-bottom: constant(safe-area-inset-bottom);\n        --safe-area-left: constant(safe-area-inset-left);\n      }\n    }"
    )
  },
  {
    key: "app-content-inline",
    note: "Das Seitenpolster als Klasse. apps/menyra-social/index.html",
    build: () => htmlCssRange(
      "apps/menyra-social/index.html",
      ".app-content-inline {",
      "padding-right: var(--app-content-inline) !important;\n    }"
    )
  },
  {
    key: "menu-detail",
    note: "Die Kopfzeile des Produktfensters. apps/menyra-social/index.html",
    build: () => htmlCssRange(
      "apps/menyra-social/index.html",
      ".menu-detail-modal-header {",
      "backdrop-filter: none !important;\n    }"
    )
  },
  {
    key: "scroll-and-fallbacks",
    note: "Die Scroll-Helfer und die Tailwind-Klassen, die der statische Build nicht kennt. apps/menyra-social/index.html",
    build: () => htmlCssRange(
      "apps/menyra-social/index.html",
      ".no-scrollbar::-webkit-scrollbar { display: none; }",
      ".line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }"
    )
  },
  {
    key: "header-pills",
    note: "Die Pill-Zeile der Kopfzeile: Qyteti, Lokalet, Mnyra GO. apps/menyra-social/index.html",
    build: () => htmlCssRange(
      "apps/menyra-social/index.html",
      ".smart-header-tabs-row {",
      ".smart-header-pill--active {\n      background: transparent;\n      border-color: #0f172a;\n      color: #0f172a;\n      box-shadow: none;\n    }"
    )
  },
  {
    key: "map-view",
    note: "Die Kartenansicht. apps/menyra-social/index.html",
    build: () => htmlCssRange(
      "apps/menyra-social/index.html",
      ".map-view-root {",
      ".map-view-sheet-slot {\n        left: 0.75rem;\n        right: 0.75rem;\n        bottom: 0.75rem;\n      }\n    }"
    )
  },
  {
    key: "work-surface",
    note: "Die gemeinsame Geometrie der Arbeitsseiten. core/ui/work-surface-render-utils.js",
    build: () => cssConstant("apps/menyra-social/core/ui/work-surface-render-utils.js", "WORK_SURFACE_CSS")
  },
  {
    key: "dashboard",
    note: "Das Paneli (Biznesi). core/dashboard/dashboard-render-utils.js",
    build: () => cssConstant("apps/menyra-social/core/dashboard/dashboard-render-utils.js", "DASHBOARD_CSS")
  },
  {
    key: "go-tokens",
    note: "Die Marken von Mnyra GO. core/go/go-page-render-utils.js",
    build: () => cssRule(
      cssConstant("apps/menyra-social/core/go/go-page-render-utils.js", "GO_PAGE_CSS"),
      ".mnyra-go-page"
    )
  },
  {
    key: "go-offer-card",
    note: "Die Ergebniskarte von Mnyra GO. core/go/go-offer-card-render-utils.js",
    build: () => cssConstant("apps/menyra-social/core/go/go-offer-card-render-utils.js", "GO_OFFER_CARD_CSS")
  }
];

export function buildMirrorCss() {
  const parts = SOURCES.map(({ key, note, build }) => [
    `/* >>> ${key} */`,
    `/* ${note} */`,
    build(),
    `/* <<< ${key} */`
  ].join("\n"));

  return [
    "/* ERZEUGT - NICHT VON HAND AENDERN.",
    " *",
    " * Erzeugt von scripts/generate-landing2-app-mirror.mjs aus den echten",
    " * Stilblaettern der App. Landing 2 zeigt Mnyra-Bildschirme, keine",
    " * Nachzeichnungen davon: Die Vorschau traegt dieselben Klassennamen wie die",
    " * App, und die Regeln dahinter stehen hier Zeichen fuer Zeichen so, wie sie",
    " * in der App stehen.",
    " *",
    " * Wer hier etwas aendern will, aendert es in der App und laesst das Skript",
    " * neu laufen. tests/landing2-parity.test.mjs prueft beides gegeneinander.",
    " */",
    "",
    ...parts,
    ""
  ].join("\n");
}

const isMain = process.argv[1] && process.argv[1].endsWith("generate-landing2-app-mirror.mjs");
if (isMain) {
  const css = buildMirrorCss();
  const target = join(ROOT, MIRROR_TARGET);
  if (process.argv.includes("--check")) {
    const current = readFileSync(target, "utf8");
    if (current !== css) {
      console.error(`${MIRROR_TARGET} ist nicht mehr auf dem Stand der App.`);
      console.error("Bitte 'node scripts/generate-landing2-app-mirror.mjs' laufen lassen.");
      process.exit(1);
    }
    console.log(`${MIRROR_TARGET} ist auf dem Stand der App.`);
  } else {
    writeFileSync(target, css, "utf8");
    console.log(`${MIRROR_TARGET} geschrieben (${css.length} Zeichen).`);
  }
}
