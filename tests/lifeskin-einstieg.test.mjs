import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { EINSTIEG_KARTEN, OBERFLAECHE, ARZT_BILD, t } from "../apps/lifeskin/lifeskin-content.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");
const css = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-styles.css"), "utf8");

// DER BILDSCHIRM, DER 772 VON 894 BESUCHERN VERLOR.
//
// Gemessen an einem Werbetag: 894 haben die Seite geoeffnet, 122 sind bis
// zur naechsten Stufe gekommen. Dieser Test haelt die drei Entscheidungen
// fest, mit denen darauf geantwortet wurde - eine Handlung auf dem ersten
// Bildschirm, ein Text, der nicht alles auf einmal sagen muss, und ein
// Preis, der nie weggeht.

// ---------- Die Karten ----------

test("jede Karte steht in beiden Sprachen und hat eine eigene Standzeit", () => {
  assert.ok(EINSTIEG_KARTEN.length >= 2, "Ohne zweite Karte gibt es nichts zu wechseln");
  for (const [i, karte] of EINSTIEG_KARTEN.entries()) {
    assert.ok(karte.titel?.sq && karte.titel?.de, `Karte ${i} fehlt in einer Sprache`);
    // Der Untertitel ist freiwillig - wenn er da ist, aber in beiden Sprachen.
    if (karte.unter) {
      assert.ok(karte.unter.sq && karte.unter.de, `Untertitel ${i} fehlt in einer Sprache`);
    }
    assert.ok(Number.isFinite(karte.dauerMs) && karte.dauerMs >= 2400,
      `Karte ${i} steht zu kurz, um gelesen zu werden`);
  }
});

// LANG GENUG, UM GELESEN ZU WERDEN.
//
// Die Zahl dahinter: rund 25 Zeichen je Sekunde liest jemand, der eine Seite
// nicht studiert, sondern ueberfliegt. Eine Karte, die schneller wechselt,
// als ihr Text gelesen werden kann, ist keine Botschaft, sondern Flackern -
// und Flackern auf dem ersten Bildschirm ist ein Abbruchgrund.
test("keine Karte wechselt, bevor ihr Text gelesen werden kann", () => {
  for (const sprache of ["sq", "de"]) {
    for (const [i, karte] of EINSTIEG_KARTEN.entries()) {
      const zeichen = t(karte.titel, sprache).length + t(karte.unter, sprache).length;
      const noetig = (zeichen / 25) * 1000;
      assert.ok(karte.dauerMs >= noetig,
        `Karte ${i} (${sprache}): ${zeichen} Zeichen brauchen ${Math.round(noetig)} ms, sie steht ${karte.dauerMs} ms`);
    }
  }
});

// Das Gesicht ist das staerkste Mittel auf diesem Bildschirm und stumpft ab,
// wenn es dauernd dasteht. Im Wechsel faellt es bei jedem zweiten Blick neu
// auf - und die Karten dazwischen bekommen die volle Breite fuer ihren Satz.
test("Foto und kein Foto wechseln sich ab", () => {
  const folge = EINSTIEG_KARTEN.map((k) => Boolean(k.bild));
  for (let i = 1; i < folge.length; i += 1) {
    assert.notEqual(folge[i], folge[i - 1],
      `Karte ${i} und ${i - 1} stehen beide ${folge[i] ? "mit" : "ohne"} Foto`);
  }
  assert.ok(folge.some(Boolean), "Dr. Gashi kommt auf keiner Karte vor");
});

test("das Portraet zeigt auf eine Datei, die es gibt", () => {
  assert.ok(ARZT_BILD.startsWith("/apps/"), "Der Pfad muss absolut sein");
  readFileSync(join(wurzel, ARZT_BILD.replace(/^\//, "")));
  // Und der Browser holt es, bevor die zweite Karte es braucht.
  assert.match(html, /rel="preload"[^>]*dr-gashi\.jpg/,
    "Ohne Vorladen steht die Vertrauenskarte einen Wimpernschlag leer");
});

// ---------- Was stehen bleibt ----------

// Der Preis ist das einzige Argument, das auf diesem Bildschirm keine
// Sekunde fehlen darf: Wer beim zweiten Wechsel dazukommt, soll "falas"
// trotzdem gelesen haben. Deshalb steht es in der Kopfzeile und in keiner
// Karte.
test("kostenlos steht in der Kopfzeile und wechselt nie mit", () => {
  assert.equal(OBERFLAECHE.falas.sq, "FALAS");
  assert.ok(OBERFLAECHE.falas.de, "Das Wort fehlt auf Deutsch");
  const kopf = html.slice(html.indexOf('id="ls-einstieg"'), html.indexOf('id="ls-karten"'));
  assert.match(kopf, /data-text="falas"/,
    "Das Wort steht nicht ueber den Karten, sondern in ihnen");
  for (const karte of EINSTIEG_KARTEN) {
    assert.ok(!/falas/i.test(t(karte.titel, "sq")), "Eine Karte traegt den Preis - dann ist er wechselhaft");
  }
});

// ---------- Die erste Handlung ----------

test("der Einstieg verlangt eine Handlung, nicht nur einen Knopf", () => {
  const einstieg = html.slice(html.indexOf('id="ls-einstieg"'), html.indexOf('id="ls-name"'));
  assert.match(einstieg, /id="ls-alterwahl"/, "Die Altersfrage steht nicht auf dem Einstieg");
  assert.match(einstieg, /id="ls-start"[^>]*disabled/,
    "Der Knopf ist offen, bevor etwas gewaehlt wurde");
  assert.match(einstieg, /data-text="vazhdo"/, "Der Knopf heisst nicht Vazhdo");
});

test("das Alter steht nur noch an einer Stelle", () => {
  assert.equal(html.split('id="ls-alterwahl"').length - 1, 1,
    "Die Altersfrage steht zweimal in der Seite");
  const name = html.slice(html.indexOf('id="ls-name"'), html.indexOf('id="ls-vorbereitung"'));
  assert.ok(!name.includes("ls-alterwahl"), "Der Namensschirm fragt das Alter noch einmal");
  // Und der Namensknopf haengt nicht mehr an einer Antwort, die eine Seite
  // frueher schon gegeben wurde.
  assert.match(app, /#nameWeiterPruefen\(\)\s*\{[^}]*name\.length < 2/s);
});

// DIE ERSTE ZAHL, DIE ES VORHER NICHT GAB.
//
// Zwischen "Seite geoeffnet" (894) und "Name eingegeben" (122) lagen 772
// Besucher und keine einzige Messung: Wer nie angetippt hat und wer im
// Formular umgedreht ist, standen in derselben Zeile. Das Alter beim
// Weitergehen zu schreiben trennt beide.
test("wer weitergeht, hinterlaesst eine Spur - mit einem Feld, das die Regeln kennen", () => {
  assert.match(app, /ergaenze\(\{\s*ageBand:/,
    "Der Einstieg schreibt nichts, wenn jemand weitergeht");
  const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");
  const erlaubt = regeln.slice(regeln.indexOf("lifeskinSessionShapeOk"));
  assert.match(erlaubt, /"ageBand"/,
    "hasOnly() kennt das Feld nicht - dann faellt JEDER Schreibvorgang der Sitzung aus");
});

// ---------- Der Bildschirm darf nicht springen ----------

// Laegen die Karten hintereinander, spraenge bei jedem Wechsel alles
// darunter: die Altersknoepfe und der Knopf. Auf dem Telefon ist das der
// Moment, in dem jemand danebentippt - und Danebentippen ist ein Abbruch.
test("alle Karten liegen in derselben Rasterzelle", () => {
  assert.match(css, /\.ls-karten\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.ls-karte\s*\{[^}]*grid-area:\s*1\s*\/\s*1/s);
  assert.match(css, /\.ls-karte\[data-aktiv="ja"\]\s*\{[^}]*opacity:\s*1/s);
});

test("die Uhr laeuft nicht hinter einem anderen Bildschirm weiter", () => {
  assert.match(app, /name === "einstieg"\)\s*this\.#kartenLaufen\(\);\s*else this\.#kartenAnhalten\(\)/s,
    "Der Wechsel haengt nicht am Bildschirmwechsel");
  assert.match(app, /#kartenAnhalten\(\)\s*\{[^}]*clearTimeout/s);
  // Und im Hintergrund wird nicht weitergezaehlt: Wer aus WhatsApp
  // zurueckkommt, soll nicht die letzte Karte vorfinden.
  assert.match(app, /document\?\.hidden/);
});
