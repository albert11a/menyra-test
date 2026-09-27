"use strict";

// DIE ABSCHRIFTEN FUER DEN AUTO-MODUS (functions/lifeskin-auto.js).
//
// Deployt wird nur functions/ - shared/ und docs/ kommen nicht mit. Die
// Function braucht aber genau das, was Heart von Hand benutzt: den Prompt
// (docs/lifeskin-prompt-v9*.txt), die Fragen des Trichters (fuer die
// Anamnese im Prompt) und die reinen Rechnungen aus shared/ (Prompt
// einsetzen, Antwort lesen, Bericht bauen). Dieses Skript legt davon eine
// Abschrift nach functions/lifeskin-auto/generated/:
//
//   *.mjs          shared/<name>.js und alles, was es importiert (ESM,
//                  von der Function mit import() geladen)
//   fragen.json    FRAGEN aus apps/lifeskin/lifeskin-content.js, nur Kennung,
//                  Titel und Antworten (shared/lifeskin-prompt.js
//                  fragenFuerPrompt) - Daten, kein Browser-Code
//   prompt-*.txt   die zwei Vorlagen
//
// Laeuft vor jedem Functions-Deploy (firebase.json predeploy).
// tests/lifeskin-auto.test.mjs faellt, wenn eine Abschrift veraltet ist.

const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const repoRoot = path.resolve(__dirname, "../..");
const sharedDir = path.join(repoRoot, "shared");
const outputDir = path.resolve(__dirname, "../lifeskin-auto/generated");

const EINSTIEGE = ["lifeskin-auto-befund.js", "lifeskin-prompt.js"];
const VORLAGEN = {
  "prompt-foto.txt": "docs/lifeskin-prompt-v9.txt",
  "prompt-pa-foto.txt": "docs/lifeskin-prompt-v9-pa-foto.txt"
};

function normal(text) {
  return String(text || "").replace(/\r\n/g, "\n");
}

// Alle relativen Importe einer Datei in shared/.
function importeVon(text) {
  return [...text.matchAll(/from\s+["']\.\/([\w.-]+\.js)["']/g)].map((m) => m[1]);
}

function sharedHuelle() {
  const gesehen = new Set();
  const offen = [...EINSTIEGE];
  while (offen.length) {
    const name = offen.shift();
    if (gesehen.has(name)) continue;
    gesehen.add(name);
    const text = fs.readFileSync(path.join(sharedDir, name), "utf8");
    for (const dep of importeVon(text)) offen.push(dep);
  }
  return [...gesehen].sort();
}

async function generate() {
  const files = [];
  for (const name of sharedHuelle()) {
    const text = normal(fs.readFileSync(path.join(sharedDir, name), "utf8"))
      .replace(/(from\s+["']\.\/[\w.-]+)\.js(["'])/g, "$1.mjs$2");
    files.push({
      fileName: name.replace(/\.js$/, ".mjs"),
      contents: `// Abschrift von shared/${name} - nicht von Hand aendern.\n// node functions/scripts/sync-lifeskin-auto.cjs\n${text}`
    });
  }
  const inhalt = await import(pathToFileURL(path.join(repoRoot, "apps/lifeskin/lifeskin-content.js")).href);
  const prompt = await import(pathToFileURL(path.join(sharedDir, "lifeskin-prompt.js")).href);
  files.push({
    fileName: "fragen.json",
    contents: `${JSON.stringify(prompt.fragenFuerPrompt(inhalt.FRAGEN), null, 2)}\n`
  });
  for (const [ziel, quelle] of Object.entries(VORLAGEN)) {
    files.push({ fileName: ziel, contents: normal(fs.readFileSync(path.join(repoRoot, quelle), "utf8")) });
  }
  return files;
}

async function write() {
  fs.mkdirSync(outputDir, { recursive: true });
  const files = await generate();
  for (const file of files) fs.writeFileSync(path.join(outputDir, file.fileName), file.contents, "utf8");
  return files;
}

if (require.main === module) {
  write().then((files) => {
    for (const file of files) process.stdout.write(`Generated functions/lifeskin-auto/generated/${file.fileName}\n`);
  }).catch((fehler) => {
    process.stderr.write(`${fehler?.stack || fehler}\n`);
    process.exitCode = 1;
  });
}

module.exports = { generate, write, outputDir, EINSTIEGE };
