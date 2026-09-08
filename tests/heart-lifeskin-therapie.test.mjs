import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { renderSitzungDetail, renderLifeskin } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { STANDARD_PRODUKTE } from "../apps/lifeskin/lifeskin-catalog.js";
import { baueKennzahlen, baueTrichter, baueHerkunft, baueVerteilung } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const heartQuelle = readFileSync(join(wurzel, "apps/mnyra-heart/heart.js"), "utf8");
const ereignisse = readFileSync(join(wurzel, "apps/mnyra-heart/heart-events.js"), "utf8");
const adapter = readFileSync(join(wurzel, "apps/mnyra-heart/heart-lifeskin-adapter.js"), "utf8");

const sitzung = { id: "s1", name: "Arta", ageBand: "25-34", createdAt: new Date().toISOString(), step: "ordered" };

// Derselbe Zustand, den die Produktansicht erwartet - die Kennzahlen werden
// gerechnet, nicht erfunden, sonst faellt das Zeichnen ueber ein fehlendes
// Feld und der Test prueft eine Fehlermeldung statt der Ansicht.
function zustand(zusatz = {}) {
  return {
    status: "ready", loadedFrom: "network", sitzungen: [], produkte: STANDARD_PRODUKTE,
    abdeckung: [], kennzahlen: baueKennzahlen([]), trichter: baueTrichter([]),
    herkunft: baueHerkunft([]), verteilung: baueVerteilung([]),
    offen: "", fotos: {}, fotosStatus: "", resetGefragt: false, resetStatus: "",
    produktOffen: "", produktStatus: "",
    ...zusatz
  };
}

// Der Arbeitsplatz von Dr. Gashi. Bei fuenfzig Faellen am Tag entscheidet
// sich hier, ob der Weg traegt: Was von Hand getippt werden muss, wird bei
// Fall dreissig nicht mehr getippt.

test("jedes Mittel bringt seine zwei Felder mit", () => {
  const html = renderSitzungDetail(sitzung, null, "", STANDARD_PRODUKTE, { status: "wartet" });
  for (const p of STANDARD_PRODUKTE) {
    assert.match(html, new RegExp(`data-produkt-wahl value="${p.id}"`), `${p.id} fehlt in der Auswahl`);
    assert.match(html, new RegExp(`data-produkt-satz="${p.id}"`), `${p.id} hat kein Feld fuer die Begruendung`);
    assert.match(html, new RegExp(`data-produkt-veprimi="${p.id}"`), `${p.id} hat kein Feld fuer die Wirkungszeilen`);
    assert.match(html, new RegExp(`data-produkt-block="${p.id}"`), `${p.id} hat keinen aufklappbaren Block`);
  }
});

test("die Begruendung ist ein mehrzeiliges Feld, keine Zeile", () => {
  // Ein Satz wie "Puqrrat aktive te ju jane te theksuara. LF ACNE vepron
  // pikerisht mbi to ..." passt nicht in ein einzeiliges Feld - man sieht
  // beim Pruefen immer nur ein Fuenftel davon.
  const html = renderSitzungDetail(sitzung, null, "", STANDARD_PRODUKTE, { status: "wartet" });
  assert.match(html, /<textarea[^>]*data-produkt-satz=/, "Die Begruendung steht in einem einzeiligen Feld");
  assert.match(html, /<textarea[^>]*data-produkt-veprimi=/, "Die Wirkungszeilen stehen in einem einzeiligen Feld");
});

// Der Klassenwert des Blocks, der zu einem Mittel gehoert. Ueber den
// Anfang des Elements gelesen, nicht ueber einen Abstand in Zeichen - ein
// Test, der an einer Zeichenzahl haengt, geht beim naechsten Umbau kaputt
// und sagt dann nichts mehr.
function blockKlasse(html, id) {
  const stelle = html.indexOf(`data-produkt-block="${id}"`);
  assert.ok(stelle > 0, `Kein Block fuer ${id}`);
  const anfang = html.lastIndexOf("<div", stelle);
  return html.slice(anfang, stelle);
}

test("ohne Haken ist der Block zu, mit Haken offen", () => {
  // Zugeklappt heisst wirklich weg. Ein Textfeld, das man nicht sieht, aber
  // mit der Tabulatortaste erreicht, ist eine Falle.
  const zu = renderSitzungDetail(sitzung, null, "", STANDARD_PRODUKTE, { status: "wartet" });
  assert.match(blockKlasse(zu, "lf-acne"), /heart-lifeskin-pwahl__text--zu/,
    "Ein nicht gewaehltes Mittel zeigt seine Felder trotzdem");

  const auf = renderSitzungDetail(sitzung, null, "", STANDARD_PRODUKTE, {
    status: "fertig", produkte: [{ id: "lf-acne", satz: "Weil." }]
  });
  assert.ok(!/--zu/.test(blockKlasse(auf, "lf-acne")), "Ein gewaehltes Mittel bleibt zugeklappt");
  assert.match(blockKlasse(auf, "lf-pore"), /heart-lifeskin-pwahl__text--zu/,
    "Ein nicht gewaehltes Mittel klappt mit auf");
});

test("ein freigegebener Fall zeigt wieder, was der Patient sieht", () => {
  // Wer einen Fall noch einmal oeffnet, muss dort genau das finden, was
  // freigegeben wurde - sonst aendert eine Korrektur an einer Stelle den
  // Text an einer anderen.
  const html = renderSitzungDetail(sitzung, null, "", STANDARD_PRODUKTE, {
    status: "fertig",
    produkte: [{ id: "lf-acne", satz: "Mein eigener Satz.", veprimi: ["Zeile eins", "Zeile zwei"] }]
  });
  assert.match(html, /Mein eigener Satz\./, "Der freigegebene Satz steht nicht im Feld");
  assert.match(html, /Zeile eins\nZeile zwei/, "Die freigegebenen Wirkungszeilen fehlen");
});

test("ohne eigene Zeilen stehen die des Produkts im Feld", () => {
  const html = renderSitzungDetail(sitzung, null, "", STANDARD_PRODUKTE, { status: "wartet" });
  const acne = STANDARD_PRODUKTE.find((p) => p.id === "lf-acne");
  assert.ok(html.includes(acne.veprimi.sq[0]), "Die Wirkungszeilen des Produkts fehlen als Vorbelegung");
});

// ---------- Die Verdrahtung ----------

test("ein Haken fuellt die Texte und laesst den Preis folgen", () => {
  assert.match(ereignisse, /data-produkt-wahl/, "Der Haken loest nichts aus");
  assert.match(ereignisse, /lifeskinProduktWahl\?\./, "Der Haken ruft nichts auf");
  assert.match(heartQuelle, /function lifeskinProduktWahlGeaendert\(/, "Es gibt keinen Handler fuer den Haken");
  assert.match(heartQuelle, /lifeskinTherapieFuellen\(\);\s*\n\s*lifeskinPreisFolgen\(\);/,
    "Der Haken fuellt nicht beides");
});

test("Handschrift wird nie ueberschrieben - und laesst sich zuruecksetzen", () => {
  // Ein Feld, das ungefragt zurueckspringt, wird beim zweiten Mal nicht
  // mehr benutzt. Dann tippt sie wieder alles selbst, und der ganze Umbau
  // war umsonst.
  assert.match(heartQuelle, /function lifeskinFeldFuellen\(/, "Es gibt keinen Schutz vor dem Ueberschreiben");
  assert.match(heartQuelle, /const vonHand = jetzt && jetzt !== \(zuletzt \|\| ""\)\.trim\(\);/,
    "Handschrift wird nicht am zuletzt erzeugten Text erkannt");
  assert.match(heartQuelle, /if \(vonHand && !erzwingen\) return false;/,
    "Handschrift wird ueberschrieben");
  assert.match(heartQuelle, /function lifeskinTherapieNeu\(/, "Es gibt keinen Weg zurueck zur Automatik");
  assert.match(ereignisse, /lifeskin-produkt-satz-neu/, "Der Knopf zum Zuruecksetzen ist nicht verdrahtet");
});

test("ein neues JSON zieht die Therapietexte nach", () => {
  // Wer erst anhakt und dann das JSON einfuegt, bekaeme sonst die Saetze zu
  // einer Analyse, die es nicht mehr gibt.
  const stelle = heartQuelle.indexOf("async function lifeskinJsonUebernehmen");
  const koerper = heartQuelle.slice(stelle, stelle + 4000);
  assert.match(koerper, /lifeskinTherapieFuellen\(\)/, "Nach dem Einfuegen bleiben die alten Saetze stehen");
});

test("die Begruendung wird aus demselben Modul gebaut wie auf der Patientenseite", () => {
  // Eine zweite Rechnung in Heart waere eine zweite Wahrheit, und die
  // erste Abweichung faellt niemandem auf.
  assert.match(heartQuelle, /import \{ baueTerapi \} from "\.\.\/\.\.\/shared\/lifeskin-terapia\.js"/,
    "Heart rechnet die Begruendung selbst");
});

test("freigegeben wird, was in den Feldern steht", () => {
  const stelle = heartQuelle.indexOf("async function gibLifeskinBerichtFrei");
  const koerper = heartQuelle.slice(stelle, stelle + 3000);
  assert.match(koerper, /data-produkt-\$\{feld\}/, "Die Felder werden nicht gelesen");
  assert.match(koerper, /produkte\.push\(\{ id: pid, satz, veprimi \}\)/,
    "Die Wirkungszeilen gehen bei der Freigabe verloren");
  // Und der Adapter friert sie ein.
  assert.match(adapter, /veprimi: \(Array\.isArray\(p\.veprimi\)/,
    "Der Bericht speichert die Wirkungszeilen nicht");
  assert.match(adapter, /\.slice\(0, 3\)/, "Mehr als drei Zeilen kaemen durch");
});

// ---------- Der Produkt-Editor ----------

test("der Editor hat ein Feld fuer jede Angabe, die die Begruendung braucht", () => {
  // GEMESSEN, NICHT GESCHAETZT: Die Automatik lief, fand an den
  // Firestore-Produkten weder Regeln noch Wirkungszeilen und schrieb
  // nichts - richtig, aber unbehebbar: Es gab schlicht keine Felder, in
  // die man sie haette eintragen koennen.
  const html = renderLifeskin(zustand({ produktOffen: "lf-acne" }));
  for (const name of ["lloji", "roli", "nenName_sq", "perberesit", "perdorimi_hapi",
                      "perdorimi_koha_sq", "perdorimi_si_sq", "synimi_sq", "lidhja"]) {
    assert.ok(html.includes(`data-produktfeld="${name}"`), `Im Editor fehlt ${name}`);
  }
  // Und die Werte des Mittels stehen darin, nicht nur leere Felder.
  assert.match(html, /Benzoyl Peroxide \| 4%/, "Die Wirkstoffe kommen nicht ins Feld");
  // Das JSON steht maskiert im Markup - so, wie der Browser es zurueckgibt.
  assert.match(html, /&quot;parametri&quot;: &quot;lezionet&quot;/, "Die Regeln kommen nicht ins Feld");
});

test("eine kaputte Regel wird beim Speichern nicht still geschluckt", () => {
  // Eine Regel, die nicht greift, laesst den Abschnitt beim Patienten leer -
  // und niemand wuesste warum. Genau dieser Fehler hat den Umbau ausgeloest.
  const quelle = heartQuelle;
  assert.match(quelle, /function regelnLesen\(/, "Die Regeln werden nicht geprueft");
  for (const [was, muster] of [
    ["kein gueltiges JSON", /kein gueltiges JSON/],
    ["kein albanischer Satz", /hat keinen albanischen Satz/],
    ["{partner} ohne Bedingung", /nennt \{partner\}, verlangt ihn aber nicht/],
    ["{grada} in falscher Form", /weiblicher Einzahl/],
    ["letzte Regel ohne leere Bedingung", /letzte Regel braucht eine leere Bedingung/]
  ]) assert.match(quelle, muster, `Nicht geprueft: ${was}`);
});

test("die fuenf vorbereiteten Mittel lassen sich in einem Zug anlegen", () => {
  // Fuenf Formulare mit Wirkstoffen, Anwendung und Regeln von Hand
  // auszufuellen dauert einen Abend - und ohne sie bleibt die Begruendung
  // beim Patienten leer, weil es nichts zu verbinden gibt.
  const ohne = renderLifeskin(zustand({ produkte: [] }));
  assert.match(ohne, /data-action="lifeskin-produkte-anlegen"/, "Es gibt keinen Knopf zum Anlegen");
  assert.match(ohne, /5 Mittel anlegen/, "Der Knopf nennt nicht, wie viele fehlen");

  // Sind alle da, verschwindet der Knopf.
  const alle = renderLifeskin(zustand());
  assert.ok(!/lifeskin-produkte-anlegen/.test(alle), "Der Knopf bleibt stehen, obwohl nichts fehlt");

  // Und ein vorhandenes Mittel wird nie ueberschrieben.
  assert.match(heartQuelle, /const \{ photoRef, \.\.\.felder \} = produkt;/,
    "Ein leeres photoRef wuerde ein hochgeladenes Foto ueberschreiben");
  assert.match(heartQuelle, /STANDARD_PRODUKTE\.filter\(\(p\) => !da\.has\(String\(p\.id\)\)\)/,
    "Es wuerden auch vorhandene Mittel neu geschrieben");
  assert.match(ereignisse, /lifeskin-produkte-anlegen/, "Der Knopf ist nicht verdrahtet");
});
