import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { raportLesen } from "../shared/lifeskin-analyse.js";
import { renderSitzungDetail, RAPORT_BOGEN, RAPORT_ZONEN, RAPORT_MESSWERTE }
  from "../apps/mnyra-heart/heart-lifeskin-render.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const heartQuelle = readFileSync(join(wurzel, "apps/mnyra-heart/heart.js"), "utf8");

const raport = raportLesen(
  (() => {
    const md = readFileSync(join(wurzel, "docs/lifeskin-raport-schema.md"), "utf8");
    const roh = md.slice(md.indexOf("```json") + 7);
    return roh.slice(0, roh.indexOf("```"));
  })()
);

const sitzung = { id: "s1", code: "LS-0509-K7M2P", name: "Arlinda",
                  createdAt: new Date().toISOString() };
const produkte = [{ id: "lifeskin-akne", name: "Lifeskin Akne", inhalt: "30 ml", einzelpreis: 62 }];

// Der Bogen in Heart ist die eine Wahrheit.
//
// Eingefuegtes JSON fuellt ihn, von Hand getippt wird in dieselben Felder,
// und freigegeben wird, was darin steht. Wenn ein Feld der Patientenseite
// im Bogen fehlt, kann es niemand von Hand ausfuellen - und die Seite
// bleibt an dieser Stelle leer, ohne dass jemand sieht warum.

test("der Bogen traegt jedes Feld, das die Patientenseite zeigt", () => {
  const ids = new Set(RAPORT_BOGEN.map((f) => f.id));
  for (const pflicht of ["fotot", "zonat", "ekzaminimi", "gjetjet", "diagnoza",
                         "diagnozaLat", "niveli", "shpjegimi1", "shpjegimi2",
                         "zbehet", "nukZbehet", "pas6Muajsh", "keshilla"]) {
    assert.ok(ids.has(pflicht), `Im Bogen fehlt ${pflicht}`);
  }
  assert.equal(RAPORT_ZONEN, 5, "Die Seite zeigt fuenf Zonen");
  assert.equal(RAPORT_MESSWERTE, 5, "Die Seite zeigt fuenf Messwerte");
});

test("oben steht nur noch das Einfuegen - kein Hochladen mehr", () => {
  const html = renderSitzungDetail(sitzung, null, "", produkte, { status: "wartet" });
  assert.ok(!/id="lifeskin-vorlage"/.test(html), "Der Dateiweg steht wieder da");
  assert.ok(!/Analyse hochladen/.test(html), "Der Knopf zum Hochladen steht wieder da");
  assert.ok(!/Leere Tabelle/.test(html), "Die Vorlagen stehen wieder da");
  assert.match(html, /id="lifeskin-json"/, "Es gibt kein Feld zum Einfuegen");
  assert.match(html, /data-action="lifeskin-json-uebernehmen"/, "Es gibt keinen Uebernehmen-Knopf");
});

test("jedes Feld des Bogens steht wirklich im Formular", () => {
  const html = renderSitzungDetail(sitzung, null, "", produkte, { status: "wartet" });
  for (const f of RAPORT_BOGEN) {
    assert.match(html, new RegExp(`data-raport="${f.id}"`), `Das Feld ${f.id} fehlt`);
  }
  for (let i = 0; i < RAPORT_ZONEN; i += 1) {
    assert.match(html, new RegExp(`data-zona-ort="${i}"`), `Zone ${i} fehlt`);
    assert.match(html, new RegExp(`data-zona-text="${i}"`), `Zonentext ${i} fehlt`);
  }
  for (let i = 0; i < RAPORT_MESSWERTE; i += 1) {
    for (const teil of ["emri", "vlera", "grada", "shkalla", "thjeshte"]) {
      assert.match(html, new RegExp(`data-par-${teil}="${i}"`), `Messwert ${i}.${teil} fehlt`);
    }
  }
  // Und die vier Wochen, die die Seite unter der Therapie zeigt.
  for (const n of [1, 2, 3, 4]) {
    assert.match(html, new RegExp(`data-zusatz="java_${n}"`), `Woche ${n} fehlt`);
  }
});

test("ein freigegebener Fall zeigt im Bogen genau das, was der Patient sieht", () => {
  // Sonst muesste jede Aenderung neu getippt werden - und was man nicht
  // sieht, kann man auch nicht nachsehen.
  const html = renderSitzungDetail(sitzung, null, "", produkte,
    { status: "fertig", befund: raport.gjetjet, preis: 53, raport });

  assert.ok(html.includes(raport.diagnoza), "Die Diagnose steht nicht im Bogen");
  assert.ok(html.includes(raport.parametrat[0].emri), "Der erste Messwert fehlt");
  assert.ok(html.includes(raport.zonaLista[0].zona), "Die erste Zone fehlt");
  assert.ok(html.includes(raport.paKujdes.nukZbehet), "Die Prognose fehlt");
  assert.match(html, /<details class="heart-lifeskin-bogen" id="lifeskin-bogen" open>/,
    "Der Bogen ist zugeklappt, obwohl etwas darin steht");
});

test("jede Zone und jeder Messwert ist eine eigene Gruppe mit Trennlinie", () => {
  // GEMESSEN, NICHT GESCHAETZT: Ort und Satz standen nebeneinander. Der
  // Satz quetschte den Ort auf ein paar Zeichen zusammen - ein Feld, in
  // das drei Buchstaben passen, ist kein Feld. Und ohne Linie dazwischen
  // stehen fuenf Zonen als ein einziger Block da.
  const html = renderSitzungDetail(sitzung, null, "", produkte, { status: "wartet" });
  const gruppen = (html.match(/class="heart-lifeskin-bogen__gruppe"/g) || []).length;
  assert.equal(gruppen, RAPORT_ZONEN + RAPORT_MESSWERTE,
    "Nicht jede Zone und jeder Messwert ist eine eigene Gruppe");

  // Ort und Satz stehen NICHT mehr in derselben Zeile.
  assert.ok(!/heart-lifeskin-bogen__reihe">\s*<input[^>]*data-zona-ort/.test(html),
    "Der Ort steht wieder neben dem Satz - dann bleibt fuer ihn kein Platz");

  const css = readFileSync(join(wurzel, "apps/mnyra-heart/heart.css"), "utf8");
  assert.match(css, /\.heart-lifeskin-bogen__gruppe \{[^}]*border-bottom/,
    "Die Gruppen haben keine Trennlinie");
  assert.match(css, /\.heart-lifeskin-bogen__gruppe:last-child \{[^}]*border-bottom: 0/,
    "Auch die letzte Gruppe traegt eine Linie - eine Linie ins Leere");
});

test("ein leerer Fall klappt den Bogen zu", () => {
  const html = renderSitzungDetail(sitzung, null, "", produkte, { status: "wartet" });
  assert.ok(!/id="lifeskin-bogen" open/.test(html), "Der leere Bogen steht offen");
});

// ---------- Der Weg vom Bogen zur Seite ----------

test("Heart liest den Bogen und gibt ihn frei - nicht die Zwischenablage", () => {
  assert.match(heartQuelle, /function lifeskinBogenLesen\(\)/, "Es gibt keinen Leser fuer den Bogen");
  assert.match(heartQuelle, /function lifeskinBogenFuellen\(raport\)/, "Es gibt keinen Fueller");

  const stelle = heartQuelle.indexOf("function lifeskinBogenLesen()");
  const koerper = heartQuelle.slice(stelle, heartQuelle.indexOf("\n}\n", stelle));
  // Genau die Form, die die Patientenseite liest.
  for (const feld of ["fotot", "zonat", "ekzaminimi", "gjetjet", "zonaLista",
                      "parametrat", "diagnoza", "diagnozaLat", "niveli",
                      "shpjegimi", "paKujdes", "keshilla"]) {
    assert.match(koerper, new RegExp(`\\b${feld}\\b`), `Der Bogen liefert kein ${feld}`);
  }
  // Absteigend sortiert, wie auf der Seite.
  assert.match(koerper, /sort\(\(a, b\) => b\.shkalla - a\.shkalla\)/,
    "Die Messwerte werden nicht absteigend sortiert");
  assert.match(koerper, /slice\(0, 5\)/, "Es kaemen mehr als fuenf Messwerte durch");
});

test("die Eingabefelder sind dunkel, nicht weiss", () => {
  // GEMESSEN, NICHT GESCHAETZT: --heart-surface-2 war nirgends definiert.
  // Sieben Regeln griffen darauf zu, sechs davon mit dem hellen Ersatzwert
  // aus einem frueheren Entwurf - im dunklen Heart wurden daraus weisse
  // Kaesten mit weisser Schrift. Unlesbar, und zwar genau dort, wo der
  // Befund getippt wird.
  const css = readFileSync(join(wurzel, "apps/mnyra-heart/heart.css"), "utf8");
  assert.match(css, /--heart-surface-2:\s*#[0-9a-fA-F]{6}/,
    "--heart-surface-2 ist wieder undefiniert - die Felder werden weiss");
  const wert = css.match(/--heart-surface-2:\s*(#[0-9a-fA-F]{6})/)[1];
  const helligkeit = parseInt(wert.slice(1, 3), 16) + parseInt(wert.slice(3, 5), 16)
    + parseInt(wert.slice(5, 7), 16);
  assert.ok(helligkeit < 200, `--heart-surface-2 ist hell (${wert}) - weisse Schrift darauf ist unlesbar`);
});
