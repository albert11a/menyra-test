// JEDE ANALYSE, ANSCHRIFT UND BESTELLUNG MUSS ANKOMMEN.
//
// 1. Jedes Feld, das Warteseite, Therapieseite, alte Befundseite und der
//    Laden in die Sitzung schreiben, steht in den Firestore-Regeln.
//    (tests/lifeskin-felder.test.mjs prueft dasselbe fuer den Trichter;
//    tests/rules/lifeskin-schreibwege.test.mjs schickt den echten Code
//    gegen den Emulator.)
// 2. Der stille Modus verschluckt Statistik - aber nie eine Bestellung.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");
const ohneKommentare = (q) => q.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");

function erlaubteFelder() {
  const regeln = lies("firestore.rules");
  const anfang = regeln.indexOf("function lifeskinSessionShapeOk()");
  const block = regeln.slice(regeln.indexOf("hasOnly([", anfang), regeln.indexOf("])", regeln.indexOf("hasOnly([", anfang)));
  return new Set([...ohneKommentare(block).matchAll(/"([a-zA-Z][a-zA-Z0-9_]*)"/g)].map((m) => m[1]));
}

// Die Schluessel der obersten Ebene eines Objektliterals ab Position i ("{").
function schluesselAb(quelle, i) {
  const raus = [];
  let tiefe = 0;
  let wort = "";
  let inText = "";
  let wert = false; // schon hinter dem Doppelpunkt dieses Eintrags
  for (let j = i; j < quelle.length; j += 1) {
    const z = quelle[j];
    if (inText) { if (z === inText && quelle[j - 1] !== "\\") inText = ""; continue; }
    if (z === '"' || z === "'" || z === "`") { inText = z; continue; }
    if (z === "{" || z === "[" || z === "(") { tiefe += 1; wort = ""; continue; }
    if (z === "}" || z === "]" || z === ")") {
      tiefe -= 1;
      if (tiefe === 0) { if (wort && !wert) raus.push(wort); break; }
      wort = "";
      continue;
    }
    if (tiefe !== 1) continue;
    if (/[A-Za-z0-9_$]/.test(z)) { wort += z; continue; }
    if (z === ":" && wort && !wert) { raus.push(wort); wert = true; }
    else if (z === ",") { if (wort && !wert) raus.push(wort); wert = false; } // Kurzschreibweise { address }
    else if (z === "." && quelle.slice(j, j + 3) === "..." && !wert) { raus.push("..."); wert = true; }
    wort = "";
  }
  return raus;
}

const DATEIEN = [
  "apps/lifeskin-astra/astra.js",
  "apps/lifeskin-verkauf/terapia.js",
  "apps/lifeskin-bericht/bericht.js",
  "apps/lifeskin-landing/shop.js"
];

test("jedes Feld, das Warteseite, Therapieseite und Laden in die Sitzung schreiben, kennen die Regeln", () => {
  const erlaubt = erlaubteFelder();
  const fehlt = [];
  let gezaehlt = 0;
  for (const datei of DATEIEN) {
    const quelle = ohneKommentare(lies(datei));
    for (const m of quelle.matchAll(/\b(?:merken|ergaenze|#merke|schritt)\(\s*(?:"[a-z]+",\s*)?\{/g)) {
      const start = m.index + m[0].length - 1;
      for (const feld of schluesselAb(quelle, start)) {
        gezaehlt += 1;
        // Berechnete Schluessel ({ [feld]: true }) und Spreads prueft der
        // naechste Test ueber die Liste der Marken.
        if (feld === "..." ) continue;
        if (!erlaubt.has(feld)) fehlt.push(`${datei}: ${feld}`);
      }
    }
  }
  assert.ok(gezaehlt > 20, `Zu wenig gefunden (${gezaehlt}) - die Suche greift nicht`);
  assert.deepEqual(fehlt, [], "Diese Felder weist Firestore ab - der ganze Schreibvorgang ginge verloren");
});

test("jede Marke, die als [feld]: true geschrieben wird, kennen die Regeln", () => {
  const erlaubt = erlaubteFelder();
  for (const datei of ["apps/lifeskin-verkauf/terapia.js"]) {
    const quelle = ohneKommentare(lies(datei));
    const marken = [...quelle.matchAll(/#marke\("([a-zA-Z]+)"\)/g)].map((m) => m[1]);
    assert.ok(marken.length, `${datei}: keine Marken gefunden`);
    for (const m of marken) assert.ok(erlaubt.has(m), `${datei}: ${m} fehlt in den Regeln`);
  }
});

test("die Telefonnummer einer Bestellung passt immer in die Regel (hoechstens 40 Zeichen)", () => {
  for (const datei of DATEIEN) {
    const quelle = ohneKommentare(lies(datei));
    for (const m of quelle.matchAll(/phone:\s*werte\.telefon[^\n]*/g)) {
      assert.match(m[0], /\.slice\(0, 40\)/, `${datei}: ${m[0]}`);
    }
  }
});

function stillFenster(fetchEcht) {
  const speicher = new Map([["mnyra:still", "1"]]);
  const fenster = {
    fetch: fetchEcht,
    location: { search: "", pathname: "/terapia/x" },
    navigator: {},
    document: { readyState: "complete", body: null, getElementById: () => null, addEventListener() {} },
    localStorage: { getItem: (k) => speicher.get(k) ?? null, setItem: (k, v) => speicher.set(k, v), removeItem: (k) => speicher.delete(k) },
    URLSearchParams, Response, JSON, Promise
  };
  fenster.window = fenster;
  vm.runInNewContext(lies("shared/lifeskin-still.js"), fenster);
  return fenster;
}

test("stiller Modus: Statistik wird verschluckt, eine Bestellung geht durch (mit still-Marke)", async () => {
  const gesendet = [];
  const fenster = stillFenster(async (url, optionen) => { gesendet.push({ url, optionen }); return { ok: true, status: 200 }; });
  assert.equal(fenster.__mnyraStill, true);
  const basis = "https://firestore.googleapis.com/v1/projects/p/databases/(default)/documents/lifeskin/lifeskin";

  // Statistik: kommt nie beim Server an.
  await fenster.fetch(`${basis}/sessions/abc?updateMask.fieldPaths=sahPreis&updateMask.fieldPaths=updatedAt`,
    { method: "PATCH", body: JSON.stringify({ fields: { sahPreis: { booleanValue: true } } }) });
  assert.equal(gesendet.length, 0);

  // Bestellung: geht durch, mit order.still.
  await fenster.fetch(`${basis}/sessions/abc?updateMask.fieldPaths=address&updateMask.fieldPaths=order&updateMask.fieldPaths=step`, {
    method: "PATCH",
    body: JSON.stringify({ fields: { order: { mapValue: { fields: { orderId: { stringValue: "LS-1" } } } } } })
  });
  assert.equal(gesendet.length, 1, "Die Bestellung wurde verschluckt");
  assert.equal(JSON.parse(gesendet[0].optionen.body).fields.order.mapValue.fields.still.booleanValue, true);

  // Der Status "bestellt" im Bericht geht ebenfalls durch.
  await fenster.fetch(`${basis}/reports/abc?updateMask.fieldPaths=status&updateMask.fieldPaths=bestelltAt`,
    { method: "PATCH", body: JSON.stringify({ fields: { status: { stringValue: "bestellt" } } }) });
  assert.equal(gesendet.length, 2);
});

test("Heart zeigt Faelle, von denen nur der Bericht ankam, und schneidet 'Offen' nie ab", () => {
  const adapter = ohneKommentare(lies("apps/mnyra-heart/heart-lifeskin-adapter.js"));
  assert.match(adapter, /nurBericht: true/);
  const render = ohneKommentare(lies("apps/mnyra-heart/heart-lifeskin-render.js"));
  assert.match(render, /fach === "alle" \? imGewaehltenFach/);
  assert.doesNotMatch(render, /gewaehlt\.slice\(0, 40\)/);
});

test("die feste Kaufleiste verdeckt nie den letzten Knopf der Therapieseite", () => {
  const css = lies("apps/lifeskin-verkauf/verkauf.css");
  assert.match(css, /body:has\(#leiste:not\(\[hidden\]\)\) \{ padding-bottom: calc\(110px/);
  // Und die Bestellformulare lassen den Browser nichts abweisen.
  assert.match(lies("apps/lifeskin-verkauf/terapia.html"), /<form class="porosia__forma" id="forma" novalidate>/);
  assert.match(lies("apps/lifeskin-landing/index.html"), /<form class="shporta__forme" id="shportaforme" novalidate>/);
});

test("der Klickpfad der Warte-/Therapieseite legt nie eine leere Sitzung an", () => {
  const quelle = ohneKommentare(lies("apps/lifeskin-astra/astra-daten.js"));
  const teil = quelle.slice(quelle.indexOf("async klickpfadSchreiben"), quelle.indexOf("async zustandSchreiben"));
  assert.match(teil, /currentDocument\.exists=true/);
  // Eine Bestellung dagegen darf nie an einer Bedingung scheitern.
  const merken = quelle.slice(quelle.indexOf("  merken(daten)"), quelle.indexOf("async klickpfadSchreiben"));
  assert.doesNotMatch(merken, /currentDocument/);
});
