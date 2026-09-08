import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { baueTerapi, fuellePlatzhalter, ikoneFuer, PRODUKT_IKONA } from "../shared/lifeskin-terapia.js";
import { raportLesen } from "../shared/lifeskin-analyse.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const prompt = JSON.parse(readFileSync(join(wurzel, "docs/lifeskin-prompt.json"), "utf8"));
const katalog = JSON.parse(readFileSync(join(wurzel, "docs/lifeskin/PRODUKTET_V2.json"), "utf8")).produktet;

const raport = raportLesen(prompt.shembull_i_pergjigjes);
const hol = (...ids) => ids.map((id) => {
  const p = katalog.find((x) => x.id === id);
  assert.ok(p, `Das Produkt ${id} fehlt im Katalog`);
  return p;
});

// Die Bruecke ist der eine Abschnitt, an dem der Verkauf haengt: Die Seite
// beweist ein Problem und zeigt dann eine Flasche. Faellt der Satz
// dazwischen weg, kauft nur, wer ohnehin kaufen wollte.

// ---------- Sie kann nicht leer sein ----------

test("jedes Produkt bekommt eine Begruendung - auch ohne jede Analyse", () => {
  // GEMESSEN, NICHT GESCHAETZT: Genau das war der Fehler. Stand am Produkt
  // keine Wirkungszeile, versteckte die Seite den ganzen Abschnitt - und
  // der Patient ging von einer ausfuehrlichen Diagnose direkt auf
  // "Lifeskin Akne, 30mL". Die letzte Regel jedes Produkts hat deshalb ein
  // leeres "kur" und trifft immer.
  for (const produkt of katalog) {
    const [t] = baueTerapi({ raport: {}, produkte: [produkt] });
    assert.ok(t.arsyeja, `${produkt.id} bleibt ohne Analyse ohne Satz`);
    assert.ok(!/\{|\}/.test(t.arsyeja), `${produkt.id}: ein Platzhalter steht noch im Satz`);
    assert.ok(!/\(\s*\)/.test(t.arsyeja), `${produkt.id}: eine leere Klammer ist stehengeblieben`);
  }
});

test("auch eine Analyse alter Bauart traegt einen Satz", () => {
  // Keine Diagnosekennung, keine Nominalphrase - so sieht ein von Hand
  // ausgefuellter Bogen aus. Der Satz wird hoelzerner, aber er kommt.
  const alt = { parametrat: [{ id: "poret", emri: "Poret dhe folikulet", shkalla: 2, grada: "e moderuar", vlera: "në ballë" }] };
  const [t] = baueTerapi({ raport: alt, produkte: hol("lf-pore") });
  assert.ok(t.arsyeja.length > 20, "Der Satz ist leer oder ein Fragment");
  assert.ok(!/\{/.test(t.arsyeja), "Ein Platzhalter blieb ungefuellt");
});

// ---------- Die erste passende Regel gewinnt ----------

test("die Reihenfolge der Regeln ist die Rangfolge", () => {
  // Nicht die beste Regel, sondern die erste. Ein Punktesystem waere
  // klueger und nicht nachvollziehbar; Dr. Gashi soll eine Regel nach oben
  // schieben koennen und wissen, dass sie dann gilt.
  const produkt = {
    id: "p", name: "P", roli: "baze",
    lidhja: [
      { kur: { parametri: "poret", nga: 4 }, teksti: { sq: "ZU HOCH" } },
      { kur: { parametri: "poret", nga: 2 }, teksti: { sq: "TRIFFT" } },
      { kur: {}, teksti: { sq: "RUECKFALL" } }
    ]
  };
  const [t] = baueTerapi({ raport, produkte: [produkt] });
  assert.equal(t.arsyeja, "TRIFFT");
  assert.equal(t.regulli, 2, "Die Nummer der getroffenen Regel wird nicht gemeldet");
});

test("Grad und Wert kommen aus dem Parameter, den die Regel nennt", () => {
  // Sonst steht unter einer Regel ueber die Barriere der Wert der Poren -
  // der Satz ist dann persoenlich und falsch. Das ist schlimmer als
  // allgemein und richtig.
  const produkt = {
    id: "p", name: "P",
    lidhja: [{ kur: { parametri: "barriera", nga: 1 }, teksti: { sq: "Barriera: {grada} ({vlera})" } }]
  };
  const [t] = baueTerapi({ raport, produkte: [produkt] });
  const barriere = raport.parametrat.find((w) => w.id === "barriera");
  assert.equal(t.arsyeja, `Barriera: ${barriere.grada} (${barriere.vlera})`);
});

// ---------- Set oder einzeln entscheidet der Haken ----------

test("{partner} greift nur, wenn ein wirkendes Mittel dabei ist", () => {
  // Ob ein Set oder ein einzelnes Mittel verkauft wird, entscheidet Dr.
  // Gashi mit dem Haken - nicht dieses Modul. Ohne Partner faellt die
  // Regel aus, und der Satz spricht nicht von einem Produkt, das gar
  // nicht verkauft wird.
  const [imSet] = baueTerapi({ raport, produkte: hol("lf-acne", "lf-moistur") })
    .filter((t) => t.id === "lf-moistur");
  assert.match(imSet.arsyeja, /LF ACNE/, "Im Set fehlt der Bezug auf das wirkende Mittel");

  const [allein] = baueTerapi({ raport, produkte: hol("lf-moistur") });
  assert.ok(!/LF ACNE/.test(allein.arsyeja), "Allein verkauft nennt der Satz ein zweites Produkt");
  assert.ok(allein.arsyeja, "Allein verkauft bleibt der Satz leer");
});

test("ein Mittel ist nie sein eigener Partner", () => {
  // Zwei wirkende Mittel im Set: Jedes verweist auf das andere, keines auf
  // sich selbst. Sonst stuende "LF PIGMENT ... dhe forcon efektin e LF
  // PIGMENT".
  for (const t of baueTerapi({ raport, produkte: hol("lf-acne", "lf-pigment") })) {
    const wieOft = (t.arsyeja.match(new RegExp(t.name, "g")) || []).length;
    const nenntSichSelbstAlsPartner = new RegExp(`efektin e ${t.name}`).test(t.arsyeja);
    assert.ok(!nenntSichSelbstAlsPartner, `${t.name} verweist auf sich selbst`);
    assert.ok(wieOft <= 2, `${t.name} steht zu oft im eigenen Satz`);
  }
});

// ---------- Platzhalter ----------

test("ein fehlender Wert hinterlaesst keine Luecke und keine leere Klammer", () => {
  // "Poret te ju jane te moderuara ()" sieht nach kaputter Software aus -
  // und zwar auf einem Befund.
  assert.equal(fuellePlatzhalter("Poret: {grada} ({vlera})", { grada: "e lehtë" }), "Poret: e lehtë");
  assert.equal(fuellePlatzhalter("Poret: {grada} ({vlera})", { grada: "e lehtë", vlera: "në ballë" }),
    "Poret: e lehtë (në ballë)");
  assert.equal(fuellePlatzhalter("{emri}, kjo terapi.", { emri: "Arta" }), "Arta, kjo terapi.");
  // Ein Patient ohne Namen ist der haeufigste Fall - und ein Satz, der mit
  // einem Komma anfaengt, sieht nach kaputter Software aus.
  assert.equal(fuellePlatzhalter("{emri}, kjo terapi.", {}), "kjo terapi.");
  assert.equal(fuellePlatzhalter("{emri} — kjo terapi.", {}), "kjo terapi.");
});

// ---------- Was mitkommt ----------

test("Wirkstoffe, Anwendung und Ziel kommen mit - und die Reihenfolge ist die der Anwendung", () => {
  const set = baueTerapi({ raport, produkte: hol("lf-moistur", "lf-clean", "lf-acne") });
  assert.deepEqual(set.map((t) => t.id), ["lf-clean", "lf-acne", "lf-moistur"],
    "Nicht in der Reihenfolge, in der es angewendet wird");

  const acne = set.find((t) => t.id === "lf-acne");
  assert.ok(acne.perberesit.length >= 2, "Die Wirkstoffe fehlen");
  assert.ok(acne.perberesit.every((p) => p.emri && p.roli), "Ein Wirkstoff ohne Aufgabe sagt nichts");
  assert.ok(acne.perdorimi.koha && acne.perdorimi.si, "Die Anwendung fehlt");
  assert.ok(acne.synimi, "Das Ziel bis Tag 28 fehlt");
  assert.equal(acne.veprimi.length, 3, "Es sind nicht drei Wirkungszeilen");
});

test("jede Produktart hat ihr Zeichen, und eine unbekannte faellt weich", () => {
  for (const art of ["gel", "krem", "serum", "pastrues", "tonik"]) {
    assert.ok(PRODUKT_IKONA[art], `Fuer ${art} fehlt das Zeichen`);
    assert.match(PRODUKT_IKONA[art], /^<svg viewBox="0 0 24 24"/, `${art} faellt aus der Reihe`);
  }
  assert.equal(ikoneFuer("gibtsnicht"), PRODUKT_IKONA.tonik, "Eine unbekannte Art hat kein Zeichen");
  assert.equal(ikoneFuer(""), PRODUKT_IKONA.tonik);
  for (const produkt of katalog) {
    assert.ok(PRODUKT_IKONA[produkt.lloji], `${produkt.id} traegt die unbekannte Art "${produkt.lloji}"`);
  }
});

// ---------- Der Katalog selbst ----------

test("jedes Produkt hat eine Regel, die immer trifft", () => {
  for (const produkt of katalog) {
    const letzte = produkt.lidhja[produkt.lidhja.length - 1];
    assert.ok(letzte, `${produkt.id} hat keine Regeln`);
    assert.deepEqual(letzte.kur, {}, `${produkt.id}: die letzte Regel hat eine Bedingung - dann kann der Abschnitt leer bleiben`);
  }
});

test("keine Wirkungszeile ist laenger als eine Zeile auf dem Telefon", () => {
  for (const produkt of katalog) {
    for (const sprache of ["sq", "de"]) {
      for (const zeile of produkt.veprimi[sprache]) {
        assert.ok(zeile.length <= 70, `${produkt.id}/${sprache}: "${zeile}" ist ${zeile.length} Zeichen`);
      }
      assert.ok(produkt.veprimi[sprache].length <= 3,
        `${produkt.id}/${sprache}: mehr als drei Zeilen lesen sich wie eine Merkmalsliste`);
    }
  }
});

test("ein Mittel, das sich auf einen Partner beruft, ist nicht selbst die Stuetze fuer sich", () => {
  // Wer "{partner}" benutzt, muss die Bedingung "partner": true tragen -
  // sonst steht der Platzhalter da, wenn kein Partner gewaehlt ist, und
  // faellt ersatzlos weg. Der Satz waere dann grammatisch kaputt.
  for (const produkt of katalog) {
    for (const [i, regel] of produkt.lidhja.entries()) {
      const text = `${regel.teksti.sq} ${regel.teksti.de}`;
      if (!text.includes("{partner}")) continue;
      assert.equal(regel.kur.partner, true,
        `${produkt.id}, Regel ${i + 1}: nennt {partner}, verlangt ihn aber nicht`);
    }
  }
});

test("der Grad steht nur hinter einem weiblichen Hauptwort in der Einzahl", () => {
  // GEMESSEN, NICHT GESCHAETZT: "Poret te ju janë e moderuar" stand so auf
  // der Seite. Der Grad kommt aus der Analyse in weiblicher Einzahl - "e
  // moderuar", "e lehtë" -, und hinter "poret ... janë" oder "aktiviteti
  // ... është" steht er falsch. Ein Muttersprachler liest das sofort als
  // kaputte Software, und zwar auf einem Befund.
  //
  // "Shkalla e ..." traegt jeden Fall: weiblich, Einzahl, und es stimmt
  // auch dann, wenn der Grad ein freier Text aus der Analyse ist.
  const traegerinnen = /(shkalla|shtresa mbrojtëse|sipërfaqja|ngjyra|skuqja|tekstura)[^.]*është $/i;
  for (const produkt of katalog) {
    for (const [i, regel] of produkt.lidhja.entries()) {
      if (!regel.teksti.sq.includes("{grada}")) continue;
      const davor = regel.teksti.sq.split("{grada}")[0];
      assert.match(davor, traegerinnen,
        `${produkt.id}, Regel ${i + 1}: "{grada}" steht hinter "${davor.trim().split(" ").slice(-3).join(" ")}" — dort passt die weibliche Einzahl nicht`);
    }
  }
});

test("der Katalog in der App ist derselbe wie die Stammdaten", () => {
  // Zwei Kataloge waeren zwei Wahrheiten, und die zweite faellt beim ersten
  // geaenderten Satz auseinander - ohne dass es jemandem auffaellt.
  const quelle = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-catalog.js"), "utf8");
  for (const produkt of katalog) {
    assert.ok(quelle.includes(`id: "${produkt.id}"`), `${produkt.id} fehlt im Katalog der App`);
    for (const regel of produkt.lidhja) {
      assert.ok(quelle.includes(JSON.stringify(regel.teksti.sq).slice(1, -1)),
        `${produkt.id}: eine Regel steht in den Stammdaten anders als in der App`);
    }
  }
});
