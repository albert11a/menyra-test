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
// zur naechsten Stufe gekommen. Dieser Test haelt fest, was daraufhin
// entschieden wurde - ein Text, der nicht alles auf einmal sagen muss, und
// ein Weg, der nichts mehr verlangt, bevor er etwas gibt.

// ---------- Die Karten ----------

test("jede Karte steht in beiden Sprachen und hat eine eigene Standzeit", () => {
  assert.ok(EINSTIEG_KARTEN.length >= 2, "Ohne zweite Karte gibt es nichts zu wechseln");
  for (const [i, karte] of EINSTIEG_KARTEN.entries()) {
    assert.ok(karte.titel?.sq && karte.titel?.de, `Karte ${i} fehlt in einer Sprache`);
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

// Wo der Satz umbricht, entscheidet der Satz - nicht die Breite des Geraets.
test("der Zeilenumbruch steht im Text und wird auch gesetzt", () => {
  const mitUmbruch = EINSTIEG_KARTEN.filter((k) => t(k.titel, "sq").includes("\n"));
  assert.ok(mitUmbruch.length >= 2, "Keine Karte traegt ihren eigenen Umbruch");
  for (const karte of mitUmbruch) {
    assert.ok(t(karte.titel, "de").includes("\n"), "Der Umbruch fehlt auf Deutsch");
  }
  assert.match(app, /split\("\\n"\)[\s\S]{0,200}createElement\("br"\)/,
    "Der Umbruch wird nicht in einen Zeilenwechsel uebersetzt");
});

test("Foto und Zeichen wechseln sich ab und stehen auf demselben Platz", () => {
  const folge = EINSTIEG_KARTEN.map((k) => Boolean(k.bild));
  for (let i = 1; i < folge.length; i += 1) {
    assert.notEqual(folge[i], folge[i - 1],
      `Karte ${i} und ${i - 1} stehen beide ${folge[i] ? "mit" : "ohne"} Foto`);
  }
  assert.ok(folge.some(Boolean), "Dr. Gashi kommt auf keiner Karte vor");
  // Gleich gross, sonst springt der Text darunter beim Wechsel.
  const zeichen = css.match(/\.ls-karte__zeichen\s*\{[^}]*\}/s)[0];
  const bild = css.match(/\.ls-karte__bild\s*\{[^}]*\}/s)[0];
  for (const mass of ["width: 56px", "height: 56px"]) {
    assert.ok(zeichen.includes(mass) && bild.includes(mass),
      `Zeichen und Bild sind nicht gleich gross (${mass})`);
  }
});

// Ein Zeichen, das es nicht gibt, waere ein leerer Kreis - und ein leerer
// Kreis auf dem ersten Bildschirm sieht aus wie ein Ladefehler.
test("jedes Zeichen, das eine Karte anfordert, ist auch gezeichnet", () => {
  const vorhanden = new Set(
    [...app.matchAll(/"([a-z-]+)":\s*\[/g)].map((m) => m[1])
  );
  for (const karte of EINSTIEG_KARTEN) {
    for (const name of [karte.zeichen, karte.unterZeichen].filter(Boolean)) {
      assert.ok(vorhanden.has(name), `Das Zeichen "${name}" fehlt in der Tabelle`);
    }
  }
  // Und es traegt dieselbe Machart wie die Zeichen, die schon im Aufbau
  // stehen - sonst sieht eines fremd aus zwischen den anderen.
  assert.match(app, /setAttribute\("stroke-width", "2"\)/);
  assert.match(app, /setAttribute\("aria-hidden", "true"\)/);
});

test("das Portraet zeigt auf eine Datei, die es gibt", () => {
  assert.ok(ARZT_BILD.startsWith("/apps/"), "Der Pfad muss absolut sein");
  readFileSync(join(wurzel, ARZT_BILD.replace(/^\//, "")));
  assert.match(html, /rel="preload"[^>]*dr-gashi\.jpg/,
    "Ohne Vorladen steht die Vertrauenskarte einen Wimpernschlag leer");
});

// ---------- Der Bildschirm selbst ist der alte ----------

test("der Einstieg traegt denselben Aufbau wie vorher", () => {
  const einstieg = html.slice(html.indexOf('id="ls-einstieg"'), html.indexOf('id="ls-vorbereitung"'));
  assert.match(einstieg, /ls-inhalt ls-inhalt--mitte/, "Der Inhalt steht nicht mehr mittig");
  assert.match(einstieg, /id="ls-start"[^>]*data-text="einstiegKnopf"/,
    "Der Knopf heisst nicht mehr, was er tut");
  assert.match(einstieg, /id="ls-einstieghinweis"/, "Die Zeile unter dem Knopf fehlt");
  // Nichts steht mehr davor, was der Besucher erst ausfuellen muesste.
  assert.ok(!einstieg.includes("ls-alterwahl"), "Der Einstieg fragt wieder etwas ab");
  assert.ok(!einstieg.includes("disabled"), "Der Knopf ist gesperrt");
});

test("die Karten sind linksbuendig und so gross wie der Text, der dort stand", () => {
  const titel = css.match(/\.ls-karte__titel\s*\{[^}]*\}/s)[0];
  assert.match(titel, /font-size:\s*30px/, "Die Ueberschrift hat ihre Groesse verloren");
  const unter = css.match(/\.ls-karte__unter\s*\{[^}]*\}/s)[0];
  assert.match(unter, /font-size:\s*19px/, "Der Untertitel hat seine Groesse verloren");
  assert.ok(!/\.ls-karten\s*\{[^}]*text-align:\s*center/s.test(css),
    "Die Karten stehen mittig statt linksbuendig");
});

// ---------- Der Weg ----------

test("zwischen Anzeige und Kamera steht nur noch die Vorbereitung", () => {
  // Die Fragen stehen NACH der Kamera, nicht davor: Alles vor den Fotos
  // kostet Besucher, ohne ihnen etwas zu geben.
  assert.match(app, /const SCHIRME = \["einstieg", "vorbereitung", "kamera", "fragen", "analyse"\]/);
  const vorKamera = app.slice(0, app.indexOf('"kamera"'));
  assert.ok(!vorKamera.includes('"fragen"'), "Die Fragen stehen wieder vor der Aufnahme");
  assert.ok(!html.includes('id="ls-name"'), "Der Namensschirm steht noch in der Seite");
  assert.ok(!app.includes("#ls-namefeld"), "Der Trichter horcht noch auf das Namensfeld");
  // Und der Weg zurueck stimmt mit dem Weg vorwaerts ueberein.
  assert.match(app, /vorbereitung:\s*"einstieg"/);
});

// DIE ERSTE ZAHL, DIE ES VORHER NICHT GAB.
//
// Zwischen "Seite geoeffnet" und der naechsten Stufe lagen 772 Besucher und
// keine einzige Messung: Wer nie angetippt hat und wer danach umgedreht ist,
// standen in derselben Zeile.
test("wer den Knopf antippt, hinterlaesst eine Spur - mit einem Schritt, den die Regeln kennen", () => {
  const knopf = app.slice(app.indexOf('$("#ls-start")'), app.indexOf('$("#ls-kameraoeffnen")'));
  assert.match(knopf, /schritt\("named"\)/, "Der Einstieg schreibt nichts, wenn jemand weitergeht");
  assert.match(knopf, /zeige\("vorbereitung"\)/);

  const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");
  const erlaubt = regeln.slice(regeln.indexOf("lifeskinSessionShapeOk"));
  assert.match(erlaubt, /"named"/,
    "Die Regeln kennen den Schritt nicht - dann faellt JEDER Schreibvorgang der Sitzung aus");

  // Und Heart nennt die Stufe, was sie misst.
  const heart = readFileSync(join(wurzel, "apps/mnyra-heart/heart-lifeskin-berechnung.js"), "utf8");
  assert.match(heart, /\{ id: "named", label: "Para fotos" \}/,
    "Der Trichter in Heart behauptet noch, dort werde ein Name eingegeben");
});

// ---------- Der Bildschirm darf nicht springen ----------

test("beide Karten liegen in derselben Rasterzelle", () => {
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

// ---------- Schirm 2: die Vorbereitung ----------

test("die Vorbereitung steht mittig wie der Einstieg", () => {
  const schirm = html.slice(html.indexOf('id="ls-vorbereitung"'), html.indexOf('id="ls-kamera"'));
  assert.match(schirm, /ls-inhalt ls-inhalt--mitte/,
    "Drei Regeln fuellen keinen Telefonbildschirm - oben angeschlagen steht darunter ein Drittel leere Flaeche");
});

// DIE ERSTE REGEL IST EINE ANWEISUNG, KEIN VERBOT.
//
// "Kein Make-up" als erste Zeile liest sich wie eine Bedingung, die man
// erst erfuellen muss, bevor man anfangen darf - und wer gerade geschminkt
// ist, geht an dieser Stelle weg. Jetzt steht dort, was auf dem naechsten
// Bildschirm zu tun ist.
test("die erste Regel sagt, was zu tun ist", () => {
  assert.ok(!OBERFLAECHE.vorbereitungMakeup, "Die alte Verbotszeile steht noch im Verzeichnis");
  assert.ok(!/Pa grim|Make-up/.test(html), "Die alte Verbotszeile steht noch in der Seite");
  assert.ok(OBERFLAECHE.vorbereitungMitte?.sq && OBERFLAECHE.vorbereitungMitte?.de,
    "Die neue Regel fehlt in einer der beiden Sprachen");
  const schirm = html.slice(html.indexOf('id="ls-vorbereitung"'), html.indexOf('id="ls-kamera"'));
  assert.ok(schirm.indexOf('data-text="vorbereitungMitte"') < schirm.indexOf('data-text="vorbereitungLicht"'),
    "Die Regel zur Bildmitte steht nicht an erster Stelle");
});

// DASSELBE ZEICHEN WIE AUF DER ERSTEN KARTE DES EINSTIEGS.
//
// Wer es dort gesehen hat, sieht es hier wieder, und es steht fuer
// dieselbe Sache: das Gesicht im Rahmen.
//
// DREI EIGENE ENTWUERFE LIEGEN DAHINTER, und alle scheiterten an der
// Groesse: Striche, die von einem Kreis nach aussen zeigen, sind auf
// Zeichengroesse eine Sonne - und eine Zeile darunter steht die echte
// Sonne fuer "gutes Licht". Zwei Sonnen untereinander.
test("die erste Regel traegt dasselbe Zeichen wie die erste Karte", () => {
  const schirm = html.slice(html.indexOf('id="ls-vorbereitung"'), html.indexOf('data-text="vorbereitungLicht"'));
  assert.match(schirm, /data-zeichen="scan-face"/,
    "Die Regel zur Bildmitte traegt ein anderes Zeichen als die Karte, die dasselbe sagt");
  // Gesucht wird die Karte MIT dem Zeichen, nicht die erste: Welche der
  // beiden vorne steht, ist eine Frage der Wirkung und darf sich aendern,
  // ohne dass diese Pruefung faellt. Was sie festhaelt, ist, dass die
  // Regel auf Bildschirm 2 und die Karte, die dasselbe sagt, dasselbe
  // Zeichen tragen.
  const mitZeichen = EINSTIEG_KARTEN.find((k) => k.zeichen);
  assert.ok(mitZeichen, "Keine Karte traegt ein Zeichen");
  assert.equal(mitZeichen.zeichen, "scan-face");
  // Und der Fueller im Trichter setzt es auch wirklich ein.
  assert.match(app, /\[data-zeichen\][\s\S]{0,260}#zeichen\(knoten\.dataset\.zeichen/,
    "Der Aufbau fordert ein Zeichen an, das niemand einsetzt");
});

// EIN PFAD AN ZWEI ORTEN IST FRUEHER ODER SPAETER ZWEI VERSCHIEDENE PFADE.
test("kein Zeichen der Tabelle steht ausserdem noch im Aufbau", () => {
  const pfade = [...app.matchAll(/"(M[\d.]+ [^"]{20,})"/g)].map((m) => m[1]);
  assert.ok(pfade.length >= 2, "Die Zeichentabelle ist leer");
  for (const pfad of pfade) {
    assert.ok(!html.includes(pfad.slice(0, 30)),
      `Dieser Pfad steht in der Tabelle UND im Aufbau: ${pfad.slice(0, 40)}`);
  }
});
