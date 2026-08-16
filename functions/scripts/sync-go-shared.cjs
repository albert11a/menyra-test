"use strict";

// Die GO-Domaene fuer die Functions uebersetzen.
//
// Warum es diesen Schritt gibt: Die Regeln von Mnyra GO - wann ein Angebot
// passt, wann eine Buchung endet, wer der Gast ist - duerfen es nur einmal
// geben. Erschiene dieselbe Regel ein zweites Mal im Servercode, waere der
// Tag absehbar, an dem beide Fassungen verschieden antworten und die Suche
// etwas zeigt, was das Buchen ablehnt.
//
// Die Quelle liegt deshalb in `shared/go/` als ESM. Die Functions laufen als
// CommonJS auf Node 20 und koennen ESM nicht per `require` laden; ausserdem
// wird beim Deploy nur der Ordner `functions/` hochgeladen - `shared/` waere
// dort gar nicht vorhanden. Also wird die Quelle hierher uebersetzt.
//
// Dasselbe Verfahren benutzt Heart bereits (`sync-heart-shared.cjs`). Neu ist
// nur, dass die Namen nicht von Hand gepflegt werden, sondern aus der Quelle
// gelesen - eine Liste, die man vergessen kann, waere derselbe Fehler in
// klein. `tests/go-shared-sync.test.mjs` vergleicht das Ergebnis mit der
// Quelle und faellt, wenn jemand die Uebersetzung vergisst.

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "../..");
const sourceDir = path.join(repoRoot, "shared", "go");
const outputDir = path.resolve(__dirname, "../go/generated");

const SOURCE_FILES = [
  "go-feature-config.js",
  "go-time-core.js",
  "go-opening-hours-core.js",
  "go-city-core.js",
  "go-offer-core.js",
  "go-matching-core.js",
  "go-booking-core.js",
  "go-guest-identity-core.js",
  "go-analytics-core.js"
];

function readExportedNames(sourceText) {
  const names = [];
  const pattern = /^export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z0-9_$]+)/gm;
  let match = pattern.exec(sourceText);
  while (match) {
    if (!names.includes(match[1])) names.push(match[1]);
    match = pattern.exec(sourceText);
  }
  return names;
}

function buildCommonJsModule(fileName, sourceText) {
  const normalized = String(sourceText || "").replace(/\r\n/g, "\n");
  const names = readExportedNames(normalized);
  if (!names.length) {
    throw new Error(`No exports found in shared/go/${fileName}`);
  }

  const body = normalized
    // import { a, b } from "./x.js";  ->  const { a, b } = require("./x.cjs");
    .replace(
      /import\s*\{([\s\S]*?)\}\s*from\s*["']\.\/([A-Za-z0-9_.-]+)\.js["'];?/g,
      (whole, bindings, moduleName) => `const {${bindings}} = require("./${moduleName}.cjs");`
    )
    .replace(/^export\s+/gm, "")
    .trim();

  if (/^\s*(import|export)\s/m.test(body)) {
    // Lieber ein lauter Fehler beim Uebersetzen als eine Datei, die erst in
    // der Cloud beim Laden zerbricht.
    throw new Error(`Unsupported module syntax left in shared/go/${fileName}`);
  }

  return [
    "\"use strict\";",
    "",
    `// Generated from ../../../shared/go/${fileName}. Do not edit manually.`,
    "// Run: node functions/scripts/sync-go-shared.cjs",
    "",
    body,
    "",
    "module.exports = {",
    names.map((name) => `  ${name}`).join(",\n"),
    "};",
    ""
  ].join("\n");
}

function generate() {
  const files = [];
  SOURCE_FILES.forEach((fileName) => {
    const sourcePath = path.join(sourceDir, fileName);
    const sourceText = fs.readFileSync(sourcePath, "utf8");
    files.push({
      fileName: fileName.replace(/\.js$/, ".cjs"),
      contents: buildCommonJsModule(fileName, sourceText)
    });
  });
  return files;
}

function write() {
  fs.mkdirSync(outputDir, { recursive: true });
  const files = generate();
  files.forEach((file) => {
    fs.writeFileSync(path.join(outputDir, file.fileName), file.contents, "utf8");
  });
  return files;
}

if (require.main === module) {
  const files = write();
  files.forEach((file) => {
    process.stdout.write(`Generated functions/go/generated/${file.fileName}\n`);
  });
}

module.exports = { generate, write, outputDir, SOURCE_FILES };
