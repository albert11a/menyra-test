// Der Deploy-Knopf in Heart.
//
// WARUM ES IHN GIBT. Das Frontend faehrt mit Vercel von selbst hoch, sobald
// etwas auf main liegt. Die Cloud Functions tun das nicht - sie gehen erst
// live, wenn jemand "firebase deploy" laeuft. Wer keinen Rechner mit der
// Firebase-CLI vor sich hat, kann einen fertigen Stand also nicht live
// bringen, und die neue Seite sieht dabei aus wie immer. Genau so stand die
// LifeSkin-Meldung wochenlang fertig im Code und nie in der Produktion.
//
// VIER TEILE, DIE ZUSAMMENPASSEN MUESSEN:
//
//   1. Der Workflow, der wirklich deployt (er haelt den Schluessel).
//   2. github.js, das ihn anstoesst.
//   3. Die beiden Endpunkte in Heart - anstossen und nachsehen.
//   4. Die Karte in der Einrichtung mit dem Knopf.
//
// Faellt einer aus, passiert nichts - und zwar still. Deshalb haelt diese
// Datei die Nahtstellen fest.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const WORKFLOW = lies(".github/workflows/mnyra-deploy-functions.yml");
const GITHUB = lies("functions/heart/github.js");
const HANDLERS = lies("functions/heart/handlers.js");
const SETTINGS = lies("apps/mnyra-heart/heart-settings-render.js");
const EVENTS = lies("apps/mnyra-heart/heart-events.js");
const HEART = lies("apps/mnyra-heart/heart.js");

// ---------------------------------------------------------------------------
// 1. Der Workflow
// ---------------------------------------------------------------------------

// SEIT DEM 01.10. AUCH VON SELBST - ABER NUR, WENN ES NOETIG IST (Freigabe
// Inhaber: "Ja, Punkt 3"). Vorher lief er nur von Hand - und lief deshalb zwei
// Wochen nie. Ein Deploy bei JEDEM Push waere einer, den niemand bestellt hat:
// Er laeuft nur auf main und nur, wenn Functions, Regeln oder Indizes sich
// aendern. Der Knopf (von Hand, aus GitHub oder Heart) bleibt.
test("der Deploy laeuft von Hand und nur bei Pushes, die ihn brauchen", () => {
  assert.match(WORKFLOW, /\n\s*workflow_dispatch:/,
    "Der Deploy haengt nicht mehr an einem Knopf");
  const ausloeser = WORKFLOW.slice(WORKFLOW.indexOf("\non:"), WORKFLOW.indexOf("\n  workflow_dispatch:"));
  assert.match(ausloeser, /push:\s*\n\s*branches: \[main\]\s*\n\s*paths:/,
    "Der Deploy laeuft bei Pushes ohne Einschraenkung auf main und auf bestimmte Pfade");
  const pfade = [...ausloeser.matchAll(/^\s*- "([^"]+)"$/gm)].map((m) => m[1]).sort();
  assert.deepEqual(pfade, ["firestore.indexes.json", "firestore.rules", "functions/**"],
    "Der Deploy haengt an Dateien, die ihn nicht brauchen");
  // Was live geht, rechnet ein eigener Schritt aus - sonst nichts.
  assert.match(WORKFLOW, /- name: Ziele bestimmen[\s\S]*?id: ziele/);
  assert.match(WORKFLOW, /- name: Deploy\s*\n\s*if: steps\.ziele\.outputs\.only != ''/,
    "Der Deploy laeuft auch, wenn nichts zu deployen ist");
  // Regeln nur nach bestandenem Test, ein Fehlschlag faellt als Issue auf.
  assert.match(WORKFLOW, /emulators:exec --only firestore --project mnyra-local "npm run test:rules"/);
  assert.match(WORKFLOW, /- name: Issue bei Fehlschlag\s*\n\s*if: failure\(\)/);
  // Zwei Deploys gleichzeitig sind einer zu viel - und abgebrochen werden
  // darf keiner, sonst steht die Haelfte der Funktionen in der alten Fassung.
  assert.match(WORKFLOW, /concurrency:/, "Zwei Deploys koennen sich ueberholen");
  assert.match(WORKFLOW, /cancel-in-progress:\s*false/,
    "Ein laufender Deploy wird abgebrochen - das hinterlaesst einen halben Stand");
});

test("der fehlende Schluessel faellt sofort auf, nicht nach vier Minuten", () => {
  const schritte = WORKFLOW.slice(WORKFLOW.indexOf("steps:"));
  const pruefung = schritte.indexOf("FIREBASE_SERVICE_ACCOUNT");
  const install = schritte.indexOf("npm ci");
  assert.ok(pruefung > 0, "Der Schluessel wird nirgends geprueft");
  assert.ok(pruefung < install,
    "Erst wird installiert und dann gemerkt, dass der Schluessel fehlt");
  assert.match(WORKFLOW, /Settings -> Secrets and variables -> Actions/,
    "Die Fehlermeldung sagt nicht, wo der Schluessel eingetragen wird");
});

test("die Auswahl von aussen kommt nicht ungeprueft in die Kommandozeile", () => {
  // inputs.only geht in "firebase deploy --only". Direkt eingesetzt waere
  // das eine offene Kommandozeile fuer jeden, der den Workflow starten darf.
  assert.match(WORKFLOW, /grep -Eq '\^\[A-Za-z0-9_\.:,-\]\{1,200\}\$'/,
    "Die Auswahl wird nicht geprueft");
  assert.match(WORKFLOW, /--only "\$ONLY"/,
    "Die Auswahl wird eingesetzt statt als Umgebungsvariable uebergeben");
  assert.ok(!/--only "\$\{\{/.test(WORKFLOW),
    "Der Wert aus inputs steht direkt in der Kommandozeile");
});

test("ein Deploy raeumt keine Funktionen ab", () => {
  // Ohne --force bricht die CLI ab, wenn der Deploy eine Funktion LOESCHEN
  // wuerde. Genau so soll es sein: Ein Deploy aus einem halben Stand darf
  // nicht stillschweigend Funktionen aus der Produktion nehmen.
  assert.match(WORKFLOW, /npx firebase deploy/, "Es wird gar nicht deployt");
  // Albert erlaubt am 02.10.2026 automatische LifeSkin-Wiederholungen.
  // Firebase verlangt --force fuer diese erste Richtlinien-Aktivierung;
  // der Gesamt-Deploy darf es weiterhin niemals verwenden.
  const forced = WORKFLOW.split("\n").filter(line => /firebase deploy.*--force/.test(line));
  assert.equal(forced.length, 1);
  assert.match(forced[0], /--only functions:lifeskinCapiPurchase,functions:lifeskinCapiWaiting --project menyra-c0e68 --non-interactive --force$/);
  assert.ok(!/firebase deploy --only "\$ONLY"[^\n]*--force/.test(WORKFLOW), "Globales --force waere eine Loeschfreigabe");
  assert.match(WORKFLOW, /typeof funcs\[name\] !== "function"/, "Fehlende LifeSkin-Exporte muessen vor --force abbrechen");
  const deploy = WORKFLOW.slice(WORKFLOW.indexOf("- name: Deploy"));
  assert.ok(deploy.indexOf("Missing LifeSkin export") < deploy.indexOf("npx firebase deploy"));
  assert.match(WORKFLOW, /--project menyra-c0e68/, "Der Deploy trifft kein bestimmtes Projekt");
  // Die CLI liest functions/index.js, um zu sehen, was darin steht. Ohne die
  // Abhaengigkeiten der Functions scheitert dieses Lesen.
  assert.match(WORKFLOW, /npm ci --prefix functions/,
    "Ohne die Pakete der Functions findet die CLI keine einzige Funktion");
  assert.match(WORKFLOW, /rm -f "\$RUNNER_TEMP\/firebase-key\.json"/,
    "Der Schluessel bleibt auf dem Laeufer liegen");
});

// ---------------------------------------------------------------------------
// 2. Wer ihn anstoesst
// ---------------------------------------------------------------------------

test("Heart stoesst den Deploy an, es deployt nicht selbst", () => {
  // Ein Deploy-Schluessel in den Functions waere ein Schluessel, der sich
  // selbst ueberschreiben kann.
  assert.match(GITHUB, /async function dispatchDeployWorkflow\(/,
    "Es gibt keinen Weg, den Deploy-Workflow zu starten");
  assert.match(GITHUB, /deployWorkflow,/, "Der Workflow steht nicht in der Konfiguration");
  assert.match(GITHUB, /\|\| "mnyra-deploy-functions\.yml"/,
    "Ohne Einrichtung weiss Heart nicht, welchen Workflow es starten soll");
  assert.ok(!/private_key|GOOGLE_APPLICATION_CREDENTIALS/.test(HANDLERS),
    "In den Functions liegt ein Deploy-Schluessel");
});

test("deployen darf nur der CEO", () => {
  const block = HANDLERS.slice(
    HANDLERS.indexOf("async function heartDeployFunctions"),
    HANDLERS.indexOf("async function heartGetDeployState")
  );
  assert.match(block, /verifyCeoRequest\(req, res, db, \{ methods: \["POST"\] \}\)/,
    "Der Deploy-Endpunkt prueft die Anmeldung nicht");
  assert.match(block, /if \(!authResult\.ok\) return;/, "Ein abgelehnter Aufruf laeuft weiter");
  // Und dieselbe Pruefung wie im Workflow, eine Ebene frueher.
  assert.match(block, /DEPLOY_AUSWAHL_MUSTER\.test\(auswahl\)/,
    "Die Auswahl geht ungeprueft an GitHub");
  assert.match(HANDLERS, /const DEPLOY_AUSWAHL_MUSTER = \/\^\[A-Za-z0-9_\.:,-\]\{1,200\}\$\//,
    "Das Muster fuer die Auswahl fehlt");
});

test("der Zustand ist lesbar, ohne etwas anzustossen", () => {
  const block = HANDLERS.slice(HANDLERS.indexOf("async function heartGetDeployState"));
  assert.match(block.slice(0, 900), /verifyCeoRequest\(req, res, db, \{ methods: \["GET"\] \}\)/,
    "Der Zustand laesst sich per POST abfragen - oder gar nicht");
  assert.match(block.slice(0, 900), /listWorkflowRuns\(githubConfig, githubConfig\.deployWorkflow/,
    "Es wird der falsche Workflow gelesen");
  // Beide Endpunkte muessen auch wirklich ausgeliefert werden.
  for (const name of ["heartDeployFunctions", "heartGetDeployState"]) {
    assert.match(HANDLERS, new RegExp(`${name}: functions\\.region\\(HEART_DEFAULT_REGION\\)\\.https\\.onRequest`),
      `${name} wird nicht exportiert - der Endpunkt entsteht nie`);
  }
});

// ---------------------------------------------------------------------------
// 3. Der Knopf
// ---------------------------------------------------------------------------

test("der Knopf steht in der Einrichtung und ist verdrahtet", () => {
  assert.match(SETTINGS, /data-action="heart-deploy"/, "Es gibt keinen Knopf");
  assert.match(SETTINGS, /data-deploy-karte/, "Die Karte hat keine Kennung zum Auffrischen");
  assert.match(SETTINGS, /renderDeployKarte\(\)/, "Die Karte wird nicht gezeichnet");
  assert.match(EVENTS, /action === "heart-deploy"/, "Der Knopf ist nicht verdrahtet");
  assert.match(HEART, /async starteDeploy\(/, "Es gibt keinen Handler fuer den Knopf");
  assert.match(HEART, /apiClient\.request\("heartDeployFunctions", \{\s*\n\s*method: "POST"/,
    "Der Knopf ruft den Endpunkt nicht auf");
});

test("zwei Tipps, nicht einer", () => {
  // Ein Deploy geht in die Produktion. Ein versehentlich gestreifter Knopf
  // auf einem Telefon darf das nicht ausloesen.
  const handler = HEART.slice(HEART.indexOf("async starteDeploy("), HEART.indexOf("async login({"));
  assert.match(handler, /data-bestaetigen/, "Ein einziger Tipp deployt in die Produktion");
  assert.match(handler, /Wirklich deployen\?/, "Der erste Tipp fragt nichts");
  assert.match(handler, /schalter\.disabled = true;/,
    "Waehrend des Startens laesst sich zweimal deployen");
});

test("nachgesehen wird nur, solange etwas laeuft", () => {
  // Ein Takt, der auch im Leerlauf weiterlaeuft, fragt GitHub den ganzen Tag -
  // und GitHub zaehlt mit.
  assert.match(HEART, /if \(nachschauen && deployLaeuft\(lauf\)\) \{/,
    "Der Nachschau-Takt laeuft auch ohne laufenden Deploy weiter");
  assert.match(HEART, /deployGeladenFuer === "connections"/,
    "Die Karte fragt bei jedem Neuzeichnen von vorne");
  assert.match(HEART, /clearTimeout\(deployNachschauTakt\);/,
    "Der Takt wird beim Verlassen der Ansicht nicht abgeraeumt");
});
