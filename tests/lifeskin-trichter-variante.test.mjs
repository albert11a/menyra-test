// DIE KURZE FASSUNG DES TRICHTERS - was an ihr feststehen muss.
//
// Sie laeuft unter /lifeskintrichter, waehrend /lifeskin unveraendert
// weiterlaeuft, und beide teilen sich dieselben Module. Genau darin liegt
// die Gefahr: Eine Aenderung, die fuer die eine Fassung gedacht ist, trifft
// die andere mit. Dieser Test haelt fest, was die kurze Fassung ausmacht -
// und dass die alte davon nichts abbekommt.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { OBERFLAECHE, FRAGEN, FRAGEN_TEXTE } from "../apps/lifeskin/lifeskin-content.js";
import { varianteLesen } from "../apps/lifeskin/lifeskin-app.js";
import { Ringlauf, SEKTOR_RECHTS } from "../apps/lifeskin/lifeskin-pose.js";
import { ohneKommentare, methode } from "./lifeskin-quelle.mjs";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");

// Ein Regelblock aus dem Stilblatt. Ueber die Klammer gesucht und nicht
// ueber eine Hoechstlaenge: Ein Kommentar im Block hat sonst gereicht,
// damit die Suche nichts mehr findet und der Test still gruen wurde.
function block(css, selektor) {
  const anfang = css.indexOf(`${selektor} {`);
  if (anfang < 0) throw new Error(`${selektor} steht nicht im Stilblatt`);
  const auf = css.indexOf("{", anfang);
  const zu = css.indexOf("}", auf);
  return css.slice(auf + 1, zu);
}

const HTML = lies("apps/lifeskin-trichter/index.html");
const CSS = lies("apps/lifeskin-trichter/trichter-styles.css");
const ALT_HTML = lies("apps/lifeskin/index.html");
const APP = ohneKommentare(lies("apps/lifeskin/lifeskin-app.js"));

// ---------------------------------------------------------------------------
// Der Schalter
// ---------------------------------------------------------------------------

test("die Fassung steht am Aufbau, nicht am Pfad", () => {
  assert.match(HTML, /<html lang="sq" data-ls-variante="kurz">/,
    "Der Aufbau sagt nicht, welche Fassung er ist");
  // Und die alte Seite sagt nichts - sie bleibt, was sie war.
  assert.ok(!/data-ls-variante/.test(ALT_HTML),
    "Die alte Seite traegt jetzt einen Schalter und laeuft nicht mehr wie bisher");
});

test("ohne Schalter bleibt es bei der alten Fassung", () => {
  assert.equal(varianteLesen(undefined), "klassik");
  assert.equal(varianteLesen({ dataset: {} }), "klassik");
  assert.equal(varianteLesen({ dataset: { lsVariante: "" } }), "klassik");
  assert.equal(varianteLesen({ dataset: { lsVariante: "irgendwas" } }), "klassik");
  assert.equal(varianteLesen({ dataset: { lsVariante: "kurz" } }), "kurz");
});

// ---------------------------------------------------------------------------
// Bildschirm 1: lang, scrollbar, Knopf immer sichtbar
// ---------------------------------------------------------------------------

test("der Einstieg ist scrollbar und der Knopf bleibt trotzdem stehen", () => {
  const einstieg = HTML.slice(HTML.indexOf('id="ls-einstieg"'),
    HTML.indexOf("</section>", HTML.indexOf('id="ls-einstieg"')));

  // Gescrollt wird der Inhaltskasten - nicht die Seite und nicht der
  // Bildschirm. Das Stilblatt gibt ihm dafuer overflow-y: auto.
  assert.match(einstieg, /class="ls-inhalt ls-lang"/,
    "Der lange Einstieg benutzt den scrollbaren Kasten nicht");
  assert.match(lies("apps/lifeskin/lifeskin-styles.css"), /\.ls-inhalt \{[\s\S]{0,600}overflow-y: auto;/,
    "Der Inhaltskasten scrollt nicht mehr - dann scrollt der lange Einstieg gar nicht");
  assert.match(block(CSS, ".ls-lang"), /justify-content: flex-start;/,
    "Der lange Einstieg beginnt nicht oben");

  // Und der Knopf liegt AUSSERHALB dieses Kastens, also hinter seinem
  // schliessenden </div> - sonst scrollt er mit weg, und wer nicht bis
  // unten liest, findet ihn nie.
  const kasten = einstieg.indexOf('class="ls-inhalt ls-lang"');
  const fuss = einstieg.indexOf('class="ls-fuss ls-fuss--fest"');
  const knopf = einstieg.indexOf('id="ls-start"');
  assert.ok(kasten > 0 && fuss > kasten, "Der Fuss steht nicht hinter dem Inhalt");
  assert.ok(knopf > fuss, "Der Knopf liegt nicht im Fuss, sondern im gescrollten Text");
  assert.match(CSS, /\.ls-fuss--fest::before \{[\s\S]{0,320}linear-gradient/,
    "Ueber dem Knopf fehlt der Verlauf - der Text bricht dort hart ab und sieht zu Ende aus");
});

// KEIN SCROLLBALKEN AN DER INNENKANTE.
//
// Der Inhaltskasten sieht aus wie die Seite selbst - ein Balken an seinem
// Rand sieht deshalb nicht nach "hier geht es weiter" aus, sondern nach
// einer kaputten Seite. Auf dem iPhone war er beim Scrollen wieder da:
// Dort stand nur das alte ::-webkit-scrollbar, und neuere WebKit-Fassungen
// richten sich nach der Standardangabe scrollbar-width. Die Karussells
// weiter unten hatten sie laengst und blieben still.
//
// Geprueft werden ALLE scrollenden Kaesten der beiden Stilblaetter: Der
// naechste, den jemand anlegt, faellt hier auf und nicht auf dem Telefon.
test("jeder scrollende Kasten des Trichters versteckt seinen Balken", () => {
  const blaetter = [
    ["apps/lifeskin/lifeskin-styles.css", lies("apps/lifeskin/lifeskin-styles.css")],
    ["apps/lifeskin-trichter/trichter-styles.css", CSS]
  ];
  for (const [name, blatt] of blaetter) {
    // Jeder Selektor, der eine eigene Scrollachse aufmacht. Das Blatt von
    // unten (.ls-blatt__leib) steht bewusst nicht darin: Dort SOLL ein
    // Balken sagen, dass noch etwas kommt.
    const scroller = [...blatt.matchAll(/^(\.[\w-]+)[^{]*\{[^}]*overflow(?:-[xy])?: auto;/gm)]
      .map((t) => t[1])
      .filter((sel) => sel !== ".ls-blatt__leib");
    for (const sel of scroller) {
      assert.match(blatt, new RegExp(`\\${sel}[^{]*\\{[^}]*overflow(?:-[xy])?: auto;[\\s\\S]*?\\}`),
        `${name}: ${sel} wurde als Scroller erkannt, hat aber keinen Block`);
      // Die Standardangabe steht IM Block des Kastens und nicht in einem
      // zweiten daneben: Zwei Bloecke fuer denselben Namen laufen mit der
      // Zeit auseinander, und tests/lifeskin-css-namen.test.mjs verbietet
      // sie ohnehin.
      assert.match(blatt, new RegExp(`\\${sel}[^{]*\\{[^}]*scrollbar-width: none`),
        `${name}: ${sel} scrollt, versteckt den Balken aber nicht (scrollbar-width)`);
      assert.match(blatt, new RegExp(`\\${sel}::-webkit-scrollbar`),
        `${name}: ${sel} versteckt den Balken nicht auf aelteren Androids`);
    }
    assert.ok(scroller.length, `${name}: kein scrollender Kasten gefunden - die Pruefung greift ins Leere`);
  }
});

test("der Einstieg passt auf ein schmales Telefon und auf einen Rechner", () => {
  // Auf 320 Punkten (iPhone SE, altes Android) waere die Ueberschrift
  // sonst vier Zeilen hoch und schoebe alles andere aus dem ersten Blick;
  // auf einem Rechner liefen dieselben Saetze ueber die volle Breite.
  assert.match(block(CSS, ".ls-lang h1"), /font-size: clamp\(/,
    "Die Ueberschrift haengt an einer festen Groesse");
  assert.match(CSS, /@media \(min-width: 620px\) \{\s*\.ls-schirm \{ max-width:/,
    "Auf grossen Bildschirmen zieht sich der Trichter auseinander");

  // Und die Teile stehen nicht aneinandergeklebt: Ein Bildschirm, auf dem
  // acht Dinge gleich dicht stehen, hat keine acht Dinge, sondern eine Wand.
  // Die Abstaende stehen als Mass an einer Stelle (--luft) und werden
  // unten nur noch aufgerufen. Zwei Kanten, die um drei Punkte
  // auseinanderliegen, sieht niemand bewusst - und genau daran erkennt
  // das Auge, ob eine Seite sorgfaeltig gesetzt ist.
  const lang = block(CSS, ".ls-lang");
  assert.match(lang, /gap: var\(--luft\);/, "Die Abstaende haengen nicht mehr am Mass");
  const abstand = Number(lang.match(/--luft: (\d+)px/)?.[1]);
  assert.ok(abstand >= 22, `Zwischen den Bloecken liegen nur ${abstand} Punkte`);
  // Oben ein eigener Abstand - sonst steht die erste Karte halb unter dem
  // Verlauf der Kopfzeile, und genau das war auf dem Telefon zu sehen.
  const oben = Number(lang.match(/padding-top: (\d+)px/)?.[1]);
  assert.ok(oben >= 12, `Oben bleiben nur ${oben} Punkte - die erste Karte wird angeschnitten`);
});

test("der Einstieg laesst sich nicht seitlich schieben", () => {
  // GEMESSEN, NICHT GESCHAETZT: .ls-inhalt traegt overflow-y: auto, und
  // nach den CSS-Regeln wird die andere Achse damit von selbst zu "auto".
  // Das Karussell stand 14 Punkte ueber den Kasten hinaus (negative
  // Aussenkanten, damit es bis an den Bildschirmrand laeuft) - und damit
  // liess sich der GANZE Bildschirm um diese 14 Punkte wischen: Der Text
  // rutschte unter der Kopfzeile weg, Ueberschriften standen halb
  // ausserhalb. Auf dem Telefon sah das aus wie eine kaputte Seite.
  const faelle = block(CSS, ".ls-faelle");
  assert.ok(!/margin-(left|right): calc\(var\(--rand\) \* -1\)/.test(faelle),
    "Das Karussell steht wieder ueber den Inhaltskasten hinaus");
  assert.ok(!/margin/.test(faelle),
    "Das Karussell hat wieder eine Aussenkante - jede davon kann es breiter machen als den Kasten");

  // Und der Riegel dahinter: Auch ein spaeterer Ueberhang darf den
  // Bildschirm nicht wischbar machen.
  assert.match(block(CSS, ".ls-lang"), /overflow-x: hidden;/,
    "Die Querachse ist nicht verriegelt");

  // Die Spur selbst bleibt wischbar - sonst waere das Karussell keines.
  assert.match(faelle, /overflow-x: auto;/, "Das Karussell laesst sich nicht mehr wischen");
  // Die naechste Karte schaut ueber ihre Breite herein, nicht ueber einen
  // Ueberhang: Das ist der Teil, der ohne die Aussenkanten bleiben muss.
  const breite = Number(block(CSS, ".ls-fall").match(/flex: 0 0 (\d+)%/)?.[1]);
  assert.ok(breite > 0 && breite < 95,
    `Die Karte ist ${breite} % breit - dann sieht niemand, dass daneben noch eine liegt`);
  assert.match(block(CSS, ".ls-fall"), /scroll-snap-align: start;/,
    "Ohne Ueberhang muss die erste Karte links einrasten, sonst steht sie eingerueckt da");
});

// ---------------------------------------------------------------------------
// Die Landingpage: was an ihrer Gestaltung feststehen muss
// ---------------------------------------------------------------------------

test("der erste Blick ist eine Flaeche, nicht eine Reihe loser Zeilen", () => {
  // Augenbraue, Ueberschrift, Satz, Aerztin und die drei Auskuenfte
  // gehoeren zu EINEM Gedanken: was das ist, wer es macht, was es kostet.
  // Auf dem nackten Seitengrund standen sie als fuenf einzelne Dinge
  // untereinander.
  assert.match(HTML, /<header class="ls-held">/, "Der erste Blick hat keine eigene Flaeche");
  const held = block(CSS, ".ls-held");
  assert.match(held, /background:\s*\n?\s*radial-gradient/,
    "Die Flaeche traegt keinen Verlauf - dann ist sie nur ein Kasten");
  // Die Aerztin steht IM ersten Blick, nicht darunter: Ihr Gesicht ist das
  // Einzige auf dieser Seite, das ein anderer nicht auch behaupten kann.
  const heldMarkup = HTML.slice(HTML.indexOf('<header class="ls-held">'),
    HTML.indexOf("</header>"));
  assert.match(heldMarkup, /class="ls-arzt"/, "Die Aerztin steht ausserhalb des ersten Blicks");
  assert.match(heldMarkup, /dr-gashi\.jpg/);
  assert.match(heldMarkup, /class="ls-siegel"/, "Die drei Auskuenfte stehen woanders");

  // Der gestrichelte Ring ist dieselbe Form, die der Scan zeichnet - und
  // er liegt HINTER allem. Ohne das :not() gewinnt die Regel fuer die
  // Geschwister gegen seine eigene (gleiche Staerke, spaeter im Blatt),
  // und er stellte sich als 190 Punkte breiter Block mitten in den Text.
  assert.match(block(CSS, ".ls-held__ring"), /position: absolute;/);
  assert.match(CSS, /\.ls-held > \*:not\(\.ls-held__ring\) \{ position: relative; \}/,
    "Der Ring stellt sich wieder in den Textfluss");
});

test("nichts im gescrollten Kasten wird zusammengedrueckt", () => {
  // GESEHEN, NICHT BEFUERCHTET: .ls-lang ist eine Flexspalte, und ein
  // Flexkind schrumpft von sich aus, wenn der Platz knapp wird. Sein
  // eigener Inhalt schuetzt es davor - ausser bei einem Kasten mit
  // overflow: hidden, der keine Mindestgroesse mehr hat. Der erste Blick
  // (.ls-held traegt overflow: hidden, damit der Ring darin bleibt) war
  // damit statt 360 Punkten noch 44 hoch: eine leere Flaeche, in der
  // Ueberschrift, Aerztin und Schilder uebereinanderlagen.
  assert.match(CSS, /\.ls-lang > \* \{ flex: none; \}/,
    "Die Abschnitte koennen wieder zusammenfallen");
  assert.match(block(CSS, ".ls-held"), /overflow: hidden;/,
    "Der erste Blick haelt den Ring nicht mehr fest");
});

test("die drei Schritte sind ein Weg, und die Nummer steht nur einmal", () => {
  // Die Linie zwischen den Zahlen macht aus drei Zeilen einen Weg mit
  // Anfang und Ende - das beantwortet "wie lange geht das eigentlich",
  // bevor es jemand fragt.
  assert.match(HTML, /<span class="ls-schritt3__nr" aria-hidden="true">1<\/span>/,
    "Die Schritte tragen keine Nummer");
  assert.match(CSS, /\.ls-schritte3 > li::before \{/,
    "Zwischen den Schritten fehlt die Linie");
  assert.match(CSS, /\.ls-schritte3 > li:last-child::before \{ display: none; \}/,
    "Die Linie laeuft ueber den letzten Schritt hinaus");
  // Und die Zahl steht NICHT noch einmal im Text.
  for (const schluessel of ["langSchritt1Titel", "langSchritt2Titel", "langSchritt3Titel"]) {
    assert.ok(!/^\d/.test(OBERFLAECHE[schluessel].sq),
      `${schluessel} traegt die Nummer ein zweites Mal`);
    assert.ok(!/^\d/.test(OBERFLAECHE[schluessel].de));
  }
});

test("die drei Auskuenfte stehen in einer Zeile, auf jeder Breite", () => {
  // Als drei Schilder brachen sie in "zwei und eins" um - ein Umbruch
  // mitten in einer Dreierreihe sieht nicht nach Gestaltung aus, sondern
  // nach Versehen.
  const streifen = block(CSS, ".ls-siegel");
  assert.match(streifen, /justify-content: space-between;/);
  const punkt = block(CSS, ".ls-siegel__punkt");
  assert.match(punkt, /white-space: nowrap;/, "Die Auskuenfte duerfen in sich umbrechen");
  assert.match(punkt, /font-size: clamp\(/,
    "Die Schrift waechst nicht mit der Breite - auf dem 320er passt der Streifen dann nicht");
  // Nach dem Inhalt breit, nicht zu Dritteln: Drei gleiche Faecher geben
  // dem laengsten Wort zu wenig, und es lief in den Trennstrich daneben.
  assert.match(punkt, /flex: 0 1 auto;/);
});

test("die Seite atmet - die Abstaende stehen, wo der Blick sie braucht", () => {
  // Nachgemessen im Browser (390x844): Kopfzeile -> Karte 24, Karte ->
  // Hinweis 42, Hinweis -> erster Abschnitt 42, Ueberschrift -> Inhalt
  // 24, zwischen den Abschnitten 38.
  const lang = block(CSS, ".ls-lang");
  const luft = Number(lang.match(/--luft: (\d+)px/)?.[1]);
  const innen = Number(lang.match(/--luft-innen: (\d+)px/)?.[1]);
  const oben = Number(lang.match(/padding-top: (\d+)px/)?.[1]);
  assert.ok(luft >= 34, `Zwischen den Abschnitten liegen nur ${luft} Punkte`);
  assert.ok(innen >= 20, `Zwischen Ueberschrift und Inhalt liegen nur ${innen} Punkte`);
  assert.ok(oben >= 24, `Ueber der ersten Karte liegen nur ${oben} Punkte`);
  // UND VOR EINER NEUEN UEBERSCHRIFT NOCH EINMAL MEHR. Eine Karte hat
  // Rand, Grund und Schatten - sie wirkt schwerer als Text und schiebt
  // sich optisch an die naechste Ueberschrift heran. Nachgemessen: 38
  // Punkte zwischen Abschnitten, 50 vor einer Ueberschrift, die auf eine
  // Karte folgt.
  const vorUeberschrift = CSS.match(
    /\.ls-block \+ \.ls-block,\s*\n\.ls-schutz \+ \.ls-block \{ margin-top: (\d+)px; \}/);
  assert.ok(vorUeberschrift, "Vor einer neuen Ueberschrift steht kein eigener Abstand");
  assert.ok(Number(vorUeberschrift[1]) >= 10,
    `Nur ${vorUeberschrift[1]} Punkte mehr - das sieht niemand`);

  // Der Hinweis nach unten steht FREI zwischen Karte und Abschnitt -
  // nicht an beide herangezogen, sonst liest er sich wie eine Fusszeile
  // der Karte.
  assert.ok(!/margin: calc\(var\(--luft\)/.test(block(CSS, ".ls-weiter")),
    "Der Hinweis klebt wieder an der Karte");
});

test("die Seite traegt nur leise Schatten", () => {
  // Eine Karte muss nicht schweben, sie muss sich abheben. Dafuer genuegt
  // eine Kante und ein Hauch Tiefe darunter; alles darueber sieht nach
  // Baukasten aus und macht eine helle Seite unruhig.
  //
  // Geprueft wird die Deckkraft JEDES Schattens im Stilblatt - eine
  // einzelne zu kraeftige Zeile faellt sonst erst auf dem Telefon auf.
  const schatten = [...CSS.matchAll(/box-shadow:([^;]+);/g)].map((m) => m[1]);
  assert.ok(schatten.length >= 5, `Nur ${schatten.length} Schatten gefunden - die Suche greift nicht`);
  for (const zeile of schatten) {
    for (const farbe of zeile.matchAll(/rgba\([^)]*?([\d.]+)\s*\)/g)) {
      const deckkraft = Number(farbe[1]);
      assert.ok(deckkraft <= 0.5,
        `Ein Schatten steht auf ${deckkraft} Deckkraft: ${zeile.trim()}`);
    }
  }
  // Und die Karten haengen alle am selben Mass.
  assert.match(block(CSS, ".ls-haken"), /box-shadow: var\(--hebung\);/);
  assert.match(block(CSS, ".ls-fall"), /box-shadow: var\(--hebung\);/);
});

test("unter dem Knopf bleibt nur der sichere Rand", () => {
  // Der Bildschirm traegt unten "safe-area-inset + 18px". Auf einem
  // iPhone sind das 34 + 18 = 52 Punkte unter dem letzten Wort - eine
  // Handbreit Nichts, und der Knopf sitzt sichtbar zu hoch. Der Einschub
  // muss bleiben (darunter liegt die Streifenleiste des Geraets), die 18
  // Punkte obendrauf nicht.
  const fuss = block(CSS, ".ls-schirm--lang");
  const treffer = fuss.match(/padding-bottom: calc\(env\(safe-area-inset-bottom\) \+ (\d+)px\)/);
  assert.ok(treffer, "Der lange Einstieg raeumt unten nicht auf");
  assert.ok(Number(treffer[1]) <= 10, `Unter der Zeile bleiben ${treffer[1]} Punkte zu viel`);
  assert.match(HTML, /class="ls-schirm ls-schirm--lang" id="ls-einstieg"/,
    "Der Einstieg traegt die Kennzeichnung nicht, an der die Regel haengt");
});

// ---------------------------------------------------------------------------
// Der Inhalt kommt beim Scrollen herein
// ---------------------------------------------------------------------------

test("der Inhalt kommt beim Scrollen herein - Stueck fuer Stueck", () => {
  // Dieselbe Bewegung wie auf der Befundseite, aber NICHT je Abschnitt:
  // Ein Abschnitt, der als Block hereinfaehrt, bewegt vier Dinge auf
  // einmal, und dann liest man keines davon.
  assert.match(APP, /const LANDING_TEILE = \[/, "Es gibt keine Liste der Stuecke");
  for (const teil of [".ls-block__titel", ".ls-schritte3 > li", ".ls-fragenliste__paar"]) {
    assert.ok(APP.includes(`"${teil}"`), `${teil} kommt nicht einzeln herein`);
  }
  // Die Karten dagegen als Ganzes: Eine Flaeche, deren Zeilen einzeln
  // erscheinen, sieht aus, als lade sie noch.
  assert.ok(APP.includes('".ls-haken"') && !APP.includes('".ls-haken > li"'),
    "Die Karte zerfaellt in einzelne Zeilen");

  const einblenden = methode(APP, "#einblenden");
  // 1. Alles beginnt sichtbar: Faellt das Skript aus, steht die Seite da.
  assert.ok(!/data-kommt/.test(HTML), "Der Aufbau versteckt schon selbst etwas");
  assert.match(einblenden, /el\.dataset\.kommt = "warte"/);
  // 2. Gerechnet, nicht beobachtet: Ein IntersectionObserver meldet nur
  //    Wechsel - wer schnell wischt, springt ueber ein Stueck hinweg, und
  //    es bliebe fuer immer unsichtbar.
  assert.ok(!/IntersectionObserver/.test(einblenden),
    "Das Einblenden haengt an einem Beobachter, der jeden Sprung verschlaeft");
  assert.match(einblenden, /getBoundingClientRect\(\)\.top/);
  // 3. Was beim Oeffnen schon im Bild steht, wird nie versteckt.
  assert.match(einblenden, /\.filter\(\(el\) => el\.getBoundingClientRect\(\)\.top >= schonSichtbar\)/);
  // Gescrollt wird der Inhaltskasten, nicht das Fenster.
  assert.match(einblenden, /kasten\.addEventListener\("scroll", anstossen, \{ passive: true \}\)/,
    "Gehorcht wird dem Fenster - das scrollt hier aber nie");
  assert.match(einblenden, /requestAnimationFrame/, "Es wird bei jedem Scrollereignis gemessen");
  // Wer Bewegung abbestellt hat, bekommt gar nichts erst versteckt.
  assert.match(einblenden, /prefers-reduced-motion: reduce/);
});

test("die Bewegung ueberlebt den Schwung nach dem Loslassen", () => {
  // AUF DEM TELEFON WAR KEINE BEWEGUNG ZU SEHEN, und das war kein
  // Zufall: Auf iOS wird waehrend des Schwungs gescrollt, ohne dass
  // dabei verlaesslich Scrollereignisse kommen - Safari fasst sie
  // zusammen oder liefert sie erst am Ende. In dieser Zeit legt ein
  // Wisch die halbe Seite zurueck; die Stuecke waren also schon oben,
  // wenn das erste Ereignis eintraf, und standen einfach da.
  const einblenden = methode(APP, "#einblenden");
  assert.match(einblenden, /kasten\.addEventListener\("touchmove", anstossen, \{ passive: true \}\)/,
    "Am Finger selbst wird nicht gemessen");
  assert.match(einblenden, /const nachlaufen = \(\) => \{/,
    "Es gibt keinen Nachlauf - waehrend des Schwungs misst dann niemand");
  // Und er haelt von selbst an: sonst laeuft auf jedem Telefon dauerhaft
  // eine Messung je Bild mit.
  assert.match(einblenden, /if \(!offen\.length\) \{ laeuft = false; return; \}/,
    "Der Nachlauf hoert nicht auf, wenn nichts mehr offen ist");
  assert.match(einblenden, /if \(jetzt - ruheSeit > 500\) \{ laeuft = false; return; \}/,
    "Der Nachlauf hoert nicht auf, wenn der Schwung vorbei ist");
});

test("die Bewegung ist dieselbe wie auf der Befundseite", () => {
  // 30 Punkte und 0,44s - dort nachgemessen: kuerzer sieht man nicht,
  // laenger wartet man darauf.
  assert.match(block(CSS, '[data-kommt="warte"]'), /transform: translateY\(30px\);/);
  const da = block(CSS, '[data-kommt="da"]');
  assert.match(da, /transition:\s*\n?\s*opacity 0\.44s/);
  assert.match(da, /transition-delay: calc\(var\(--nach, 0\) \* 55ms\);/,
    "Was zusammen ankommt, kommt nicht nacheinander");
  // Und die eigene Zeichenebene wird wieder zurueckgegeben.
  assert.match(block(CSS, '[data-kommt="warte"]'), /will-change: transform, opacity;/);
  assert.match(da, /will-change: auto;/);
  const ruhe = CSS.slice(CSS.indexOf("prefers-reduced-motion"));
  assert.match(ruhe, /\[data-kommt\] \{ opacity: 1; transform: none; transition: none; \}/,
    "Bei abbestellter Bewegung bliebe etwas versteckt");
});

test("der Einstieg sagt, dass es weitergeht", () => {
  // Ein Bildschirm, der randvoll aussieht, wird nicht gescrollt - und
  // alles darunter ist dann umsonst geschrieben.
  assert.match(HTML, /class="ls-weiter"/, "Es fehlt der Hinweis nach unten");
  assert.ok(OBERFLAECHE.langMehr?.sq && OBERFLAECHE.langMehr?.de);
});

test("der lange Einstieg beantwortet die Fragen, an denen er verloren hat", () => {
  // Wer ist das, was bekomme ich, was kostet es, was passiert mit meinen
  // Fotos. Jede fehlende Antwort ist ein Grund wegzugehen.
  for (const [was, muster] of [
    ["die Aerztin mit Gesicht", /class="ls-arzt"[\s\S]{0,400}dr-gashi\.jpg/],
    ["kostenlos und ohne Anmeldung", /data-text="langPunktFalas"[\s\S]{0,300}data-text="langPunktOhneKonto"/],
    ["wie es laeuft", /data-text="langWieTitel"/],
    ["was dabei herauskommt", /data-text="langNutzenTitel"/],
    ["Faelle mit Zeitraum", /fall-vorher\.jpg[\s\S]{0,600}fall-nachher\.jpg/],
    ["wer die Fotos sieht", /data-text="langSchutzTitel"/],
    ["die haeufigen Fragen", /data-text="langFragenTitel"/]
  ]) {
    assert.match(HTML, muster, `Auf dem Einstieg fehlt: ${was}`);
  }
});

// ---------------------------------------------------------------------------
// Die Faelle, zum Wischen
// ---------------------------------------------------------------------------

test("die Faelle liegen in einem Karussell, das der Browser selbst scrollt", () => {
  // Ohne JavaScript: Was der Browser selbst scrollt, ruckelt nicht, haengt
  // nicht und laeuft auch auf einem Telefon von 2017.
  assert.match(HTML, /<div class="ls-faelle" id="ls-faelle">/, "Es gibt kein Karussell");
  assert.match(block(CSS, ".ls-faelle"), /scroll-snap-type: x mandatory;/,
    "Die Karten rasten nicht ein - dann bleibt das Wischen auf halbem Weg stehen");
  assert.match(block(CSS, ".ls-fall"), /scroll-snap-align: start;/);

  // DIE NAECHSTE KARTE SCHAUT HEREIN. Ein Kasten in voller Breite sieht
  // aus wie ein Bild; erst der angeschnittene Rand sagt, dass es
  // weitergeht.
  const breite = Number(block(CSS, ".ls-fall").match(/flex: 0 0 (\d+)%/)?.[1]);
  assert.ok(breite > 0 && breite < 95,
    `Die Karte ist ${breite} % breit - dann sieht niemand, dass daneben noch eine liegt`);
  // Bei einer einzigen Karte waere der angeschnittene Rand eine leere
  // Verheissung.
  assert.match(CSS, /\.ls-fall:only-child \{ flex-basis: 100%; \}/);
  // Und der Hinweis zum Wischen kommt erst, wenn es etwas zu wischen gibt.
  assert.match(CSS, /\.ls-faelle__wisch \{ display: none; \}/);
  assert.match(CSS, /\.ls-block:has\(\.ls-fall \+ \.ls-fall\) \.ls-faelle__wisch/,
    "Der Wischhinweis haengt nicht an der Zahl der Karten");
});

test("die Ueberschrift sagt, wer dort steht", () => {
  assert.match(HTML, /data-text="langFaelleTitel"/, "Die Faelle stehen ohne Ueberschrift da");
  // Die Bedingung steht mit im Satz: Analyse gemacht UND Therapie
  // durchgezogen. Das ist die ehrlichste Fassung - und die staerkste.
  assert.match(OBERFLAECHE.langFaelleTitel.sq,
    /^Pacientët që kanë bërë analizën dhe kanë vazhduar me terapinë e rekomanduar$/);
  assert.ok(OBERFLAECHE.langFaelleTitel.de);
  // Jede Karte traegt beide Tage, und zwar im Bild.
  assert.match(HTML, /data-text="langFallVorher"[\s\S]{0,400}data-text="langFallNachher"/);
  assert.match(CSS, /\.ls-fall__tag \{[\s\S]{0,200}position: absolute;/,
    "Die Tage stehen nicht im Bild - dann muss das Auge erst zuordnen");
});

// ---------------------------------------------------------------------------
// Der Text steht fest UND an einer Stelle
// ---------------------------------------------------------------------------

test("jeder feststehende Satz sagt dasselbe wie sein Schluessel", () => {
  // Feststehend, damit er mit der ersten Antwort des Servers da ist statt
  // erst nach elf Modulen. Mit Schluessel, damit eine zweite Sprache ihn
  // umschreiben kann. Ohne diesen Test waeren das zwei Wahrheiten, die
  // still auseinanderlaufen - sichtbar erst im Browser.
  const gefunden = [...HTML.matchAll(/<[a-z0-9]+[^>]*\sdata-text="([a-zA-Z0-9]+)"[^>]*>([^<]*)</g)];
  assert.ok(gefunden.length > 20, `Nur ${gefunden.length} Schluessel gefunden - die Suche greift nicht`);

  for (const [, schluessel, text] of gefunden) {
    assert.ok(OBERFLAECHE[schluessel], `Der Schluessel ${schluessel} steht in keiner Tabelle`);
    const roh = text.trim();
    if (!roh) continue;
    assert.equal(roh, OBERFLAECHE[schluessel].sq,
      `Der feststehende Text und OBERFLAECHE.${schluessel} sagen etwas anderes`);
    assert.ok(OBERFLAECHE[schluessel].de, `${schluessel} fehlt auf Deutsch`);
  }
});

test("ein unbekannter Schluessel loescht keinen feststehenden Text", () => {
  // t() gibt fuer alles, was nicht in OBERFLAECHE steht, eine leere
  // Zeichenkette zurueck. Ungeprueft stuende die im Knoten - aus einem
  // Tippfehler im Schluessel wuerde eine leere Zeile auf genau dem
  // Bildschirm, der die Besucher halten soll.
  const setzen = methode(APP, "#texteSetzen");
  assert.match(setzen, /const wert = this\.text\(knoten\.dataset\.text\);[\s\S]{0,80}if \(!wert\) continue;/,
    "Ein leerer Wert wird wieder ungeprueft geschrieben");
});

// ---------------------------------------------------------------------------
// Zwischen Anzeige und Kamera steht nichts mehr
// ---------------------------------------------------------------------------

// HIER LAG EIN BILDSCHIRM, DER NICHTS GELIEFERT HAT.
//
// Er sollte der Systemfrage des Browsers die Ueberraschung nehmen ("moechte
// auf deine Kamera zugreifen") - drei Karten zum Wischen, die erste ueber
// die Kameraerlaubnis. Die Absicht war richtig, der Preis war es nicht:
// Jeder Bildschirm zwischen Anzeige und Nutzen kostet Besucher, und
// gefuehrt wird ohnehin IM Bild, wo der Ring zeigt, wohin der Kopf soll.
test("der Tipp auf den Knopf fuehrt unmittelbar an die Kamera", () => {
  const tippen = methode(APP, "#startTippen");
  assert.match(tippen, /if \(this\.variante === "kurz"\) \{ this\.#kameraStarten\(\); return; \}/,
    "Der Tipp fuehrt wieder auf einen Bildschirm dazwischen");
  // Der nachgeholte Tipp nimmt denselben Weg - sonst gaebe es zwei.
  assert.match(methode(APP, "#frueherTippNachholen"), /this\.#startTippen\(\);/);

  // KEIN SCHRITT "named" IN DER KURZEN FASSUNG. Er hing an genau diesem
  // Bildschirm. Was der Tipp ausloest, ist die Kamera, und die schreibt
  // "camera", sobald sie da ist - eine Stufe, die niemand mehr erreicht,
  // ist keine Messung. Die lange Fassung hat ihre Anleitung noch und
  // schreibt ihn weiter; der Ast davor kommt ihr zuvor.
  const kurzerAst = tippen.slice(0, tippen.indexOf("return; }") + 9);
  assert.ok(!/schritt\("named"\)/.test(kurzerAst),
    "Die kurze Fassung schreibt einen Schritt fuer einen Bildschirm, den es nicht gibt");
  assert.ok(tippen.indexOf('variante === "kurz"') < tippen.indexOf('schritt("named")'),
    "Der Schritt der langen Fassung faellt auch in der kurzen");
});

test("die Anleitung ist aus der Seite heraus - Aufbau, Stil und Texte", () => {
  assert.ok(!/id="ls-vorbereitung"/.test(HTML), "Der Bildschirm steht wieder in der Seite");
  assert.ok(!/ls-hapa|ls-hap\b/.test(HTML), "Die Kartenspur steht noch im Aufbau");
  assert.ok(!/ls-hapa|\.ls-hap\b/.test(CSS), "Die Regeln der Kartenspur stehen noch im Stilblatt");
  // Und die Texte gehen mit: Ein Schluessel ohne Bildschirm ist eine
  // Uebersetzung, die niemand mehr liest, und beim naechsten Umbau raet
  // jemand, wo sie hingehoert.
  const inhalt = lies("apps/lifeskin/lifeskin-content.js");
  assert.ok(!/anleitungKarte/.test(inhalt), "Die Texte der Karten stehen noch im Inhalt");
});

test("der Weg zurueck kennt den Bildschirm, den es nicht mehr gibt, nicht", () => {
  // Stuende hier ein fester Name, landete der Besucher der kurzen Fassung
  // auf einem Bildschirm, den seine Seite gar nicht enthaelt - sichtbar
  // waere dann gar keiner.
  //
  // GEPRUEFT WIRD AM AUFBAU, NICHT AN DER FASSUNG. Hier stand
  // "variante === kurz ? einstieg : vorbereitung" - zwei Wege, fest
  // verdrahtet. Seit es drei Aufbauten gibt (die Landingpage hat Wahl UND
  // Vorbereitung), waere jede solche Zeile bei einem davon falsch. Jetzt
  // sucht der Rueckweg den naechsten Bildschirm, den es wirklich gibt,
  // und die Frage "welche Fassung?" stellt sich nicht mehr.
  const vorher = methode(APP, "vorherigerSchirm");
  assert.match(vorher, /const gibtEs = \(name\) => Boolean\(\$\(`#ls-\$\{name\}`\)\);/,
    "Der Weg zurueck prueft nicht, ob es den Bildschirm ueberhaupt gibt");
  assert.match(vorher, /const vorDerKamera = ersterVon\("vorbereitung", "wahl", "einstieg"\);/,
    "Vor der Kamera liegt nicht mehr die Kette Anleitung - Wahl - Einstieg");
  assert.match(vorher, /kamera: vorDerKamera/);
  // Und aus der Wahl fuehrt er an den Einstieg zurueck - den gibt es in
  // jeder Fassung, die sie ueberhaupt hat.
  assert.match(vorher, /wahl: "einstieg"/);
});

// ---------------------------------------------------------------------------
// Nach dem Scan: Name und Alter auf einem Bildschirm
// ---------------------------------------------------------------------------

// ZWEI ANGABEN, EIN BILDSCHIRM - und beide brauchen wir wirklich: den
// Namen, damit der Befund bei Dr. Gashi nicht "Fall 47" heisst, und die
// Altersgruppe, weil die Aufbereitung dagegen vergleicht.
//
// Und sie stehen NACH dem Scan, nicht davor. Davor verlangten sie zwei
// Angaben, bevor der Besucher irgendetwas bekommen hatte: Von 894
// Besuchern kamen 122 an ihnen vorbei.
test("nach dem Scan kommen Name und Alter, beide auf einem Bildschirm", () => {
  const schirm = HTML.slice(HTML.indexOf('id="ls-name"'),
    HTML.indexOf("</section>", HTML.indexOf('id="ls-name"')));
  assert.ok(schirm.length > 100, "Den Bildschirm gibt es nicht");
  assert.match(schirm, /id="ls-namefeld"/, "Das Namensfeld fehlt");
  assert.match(schirm, /id="ls-alterwahl"/, "Die Altersgruppen fehlen");
  assert.match(schirm, /id="ls-nameweiter"/, "Der Knopf fehlt");
  // Der Name oben: Er ist das Einzige, was getippt wird. So geht die
  // Tastatur einmal auf und bleibt unten, waehrend darueber gelesen wird.
  assert.ok(schirm.indexOf('id="ls-namefeld"') < schirm.indexOf('id="ls-alterwahl"'),
    "Das Alter steht ueber dem Namen - dann schiebt die Tastatur es weg");

  // Der Weg dorthin: nach dem Scan, und nur in der kurzen Fassung.
  const zeigen = methode(APP, "#fragenZeigen");
  assert.match(zeigen, /if \(this\.variante === "kurz" && \$\("#ls-name"\)\) \{/,
    "Die kurze Fassung geht nicht auf den Namensschirm");
  assert.match(zeigen, /this\.#nameZeigen\(\);/);
  // Und die lange behaelt ihre Fragen. Aufgezogen werden sie ueber
  // dieselbe Stelle, die auch der Weg ohne Scan benutzt - der
  // Bildschirm wird dort zweimal gebraucht, und zwei Abschriften
  // waeren zwei Gelegenheiten, den Zustand der Strecke zu vergessen.
  assert.match(zeigen, /this\.#fragenStarten\(this\.fragenListe, \{ danach: "analyse" \}\);/);
  assert.match(methode(APP, "#fragenStarten"), /this\.zeige\("fragen"\);/);
});

test("der Knopf geht erst auf, wenn BEIDES dasteht", () => {
  // Ein Knopf, der stumm nicht reagiert, ist fuer den Besucher eine
  // kaputte Seite - er ist deshalb sichtbar gesperrt und nicht still.
  const pruefen = methode(APP, "#nameWeiterPruefen");
  assert.match(pruefen, /String\(this\.zustand\.name \|\| ""\)\.trim\(\)\.length >= 2/);
  assert.match(pruefen, /&& this\.zustand\.altersgruppe/);
  assert.match(HTML, /id="ls-nameweiter"[^>]*disabled/,
    "Der Knopf steht von Anfang an offen");

  // DER SCHRITT FAELLT BEIM ZEIGEN, NICHT BEIM WEITERGEHEN.
  //
  // Er fiel einmal hier, also erst, wenn Name und Alter dastanden - und
  // damit stand der Verlust dieses Bildschirms bei dem davor. Seit es
  // vier Wege gibt, ist genau das die Frage, die der Trichter
  // beantworten soll: WO gehen sie weg?
  assert.match(methode(APP, "#nameZeigen"), /this\.sitzung\.schritt\("emri"\);/,
    "Der Namensschirm zaehlt nicht, sobald er zu sehen ist");

  // Und was der Knopf ausloest: die zwei Angaben hinaus, dann die
  // Aufbereitung.
  const weiter = methode(APP, "#nameWeiter");
  assert.match(weiter, /this\.sitzung\.ergaenze\(\{/);
  assert.match(weiter, /name: this\.zustand\.name/);
  assert.match(weiter, /ageBand: this\.zustand\.altersgruppe/);
  assert.match(weiter, /this\.#analyseZeigen\(\);/);
  // Und nur DIESER Weg geht in die Aufbereitung. Ohne Scan fehlt danach
  // noch die Nummer; mit Foto gibt es sieben Sekunden lang nichts
  // aufzubereiten, was der Text dieses Bildschirms behauptet.
  assert.ok(weiter.indexOf('this.zustand.typ === "foto"') < weiter.indexOf("this.#analyseZeigen();"),
    "Der Weg mit Foto laeuft durch die Aufbereitung des Scans");
  assert.ok(weiter.indexOf("paSkanim") < weiter.indexOf("this.#analyseZeigen();"),
    "Die Aufbereitung faellt, bevor der Weg ohne Scan abzweigt");
});

test("die Altersgruppen kommen aus dem Katalog, nicht von Hand", () => {
  // Der Befund vergleicht gegen dieselbe Einteilung. Stuenden sie hier
  // noch einmal getippt, liefen die beiden Listen auseinander - und die
  // Aufbereitung verglichen gegen eine Gruppe, die es nicht gibt.
  const bauen = methode(APP, "#alterBauen");
  assert.match(bauen, /for \(const gruppe of ALTERSGRUPPEN\)/);
  assert.match(bauen, /knopf\.dataset\.gruppe = gruppe;/);
  // Nur einmal je Kasten: #texteSetzen() laeuft bei jedem Sprachwechsel
  // erneut.
  assert.match(bauen, /if \(!kasten \|\| kasten\.children\.length\) continue;/,
    "Die Knoepfe werden bei jedem Zeichnen noch einmal angebaut");
  // ZWEI KAESTEN, NICHT EINER: Der Namensschirm (nach Scan und Foto) und
  // der Anliegenschirm (Trup und Pytje) fragen dasselbe an zwei Stellen
  // im Weg. Ein gemeinsamer Kasten muesste zwischen den Bildschirmen
  // umziehen - und ein Element, das umzieht, verliert seinen Zustand.
  assert.match(bauen, /\["#ls-alterwahl", "#ls-anliegenalter"\]/,
    "Der zweite Bildschirm mit Altersfrage bekommt keine Knoepfe");
  assert.match(APP, /import \{ STANDARD_KONFIG, ALTERSGRUPPEN \}/);
});

// ---------------------------------------------------------------------------
// Bildschirm 3: gefuehrt wird im Bild
// ---------------------------------------------------------------------------

test("der Ring antwortet auf die Bewegung, waehrend sie passiert", () => {
  // SO MACHT ES FACE ID, und das ist der Grund, warum dort niemand eine
  // Anleitung braucht: Man dreht ein Stueck, sieht etwas aufleuchten,
  // dreht weiter - und hat in zwei Sekunden begriffen, was verlangt wird,
  // ohne ein Wort gelesen zu haben.
  //
  // Ein Pfeil kann das nicht: Er sagt, wohin man soll, aber nicht, ob man
  // gerade etwas richtig macht. Genau diese Antwort fehlte, und deshalb
  // ist er weg.
  assert.ok(!/id="ls-pfeil"/.test(HTML), "Der Pfeil steht wieder im Bild");
  assert.ok(!/ls-pfeil/.test(CSS), "Die Regeln fuer den Pfeil stehen noch im Stilblatt");
  assert.ok(!/#pfeilZeigen/.test(APP), "Der Trichter zeichnet wieder einen Pfeil");

  const zeichnen = methode(APP, "#ringZeichnen");
  // Der Zeiger kommt aus der GEMESSENEN Richtung, nicht aus einer eigenen
  // Rechnung: stand.winkel ist, wohin die Nase zeigt.
  assert.match(zeichnen, /const zeiger = stand\.kalibriert && typeof stand\.winkel === "number"/,
    "Der Ring zeigt die Kopfrichtung nicht an");
  assert.match(zeichnen, /stand\.ausschlag >= 0\.3/,
    "Auch ein praktisch gerader Kopf bekaeme eine Richtung - die waere geraten");
  // Je weiter gedreht, desto heller und laenger der Strich: Das ist die
  // Rueckmeldung, die sagt "gleich hast du ihn".
  assert.match(zeichnen, /const staerke = Math\.min\(1, stand\.ausschlag \|\| 0\);/);
  assert.match(zeichnen, /leuchten = Math\.max\(0, 1 - ab \/ \(Math\.PI \/ SEKTOREN\)\) \* staerke;/,
    "Die Naehe zum Zeiger entscheidet nicht ueber das Leuchten");
  assert.match(zeichnen, /rgba\(14,124,104,\$\{0\.25 \+ leuchten \* 0\.7\}\)/,
    "Der Zeiger waechst nicht in die Markenfarbe hinein");
});

test("ueber dem Gesicht liegt nichts mehr", () => {
  // Der Punktschleier zeichnete bei jedem Bild rund 240 Rechtecke auf eine
  // bildschirmgrosse Leinwand - auf einem schwachen Telefon genug, um den
  // Ring stocken zu lassen, und das ausgerechnet waehrend der Drehung.
  assert.ok(!/id="ls-netz"/.test(HTML), "Die Leinwand fuer die Punkte ist zurueck");
  assert.ok(!/#netzZeichnen/.test(APP), "Der Punktschleier wird wieder gezeichnet");
});

test("der erste Strich, den die kurze Fassung anbietet, liegt rechts", () => {
  // Nach oben schauen geht gegen den Hals, und dabei verliert der
  // Besucher sein eigenes Bild aus den Augen - als erste Aufforderung die
  // schlechteste.
  assert.equal(SEKTOR_RECHTS, 2, "Rechts ist nicht mehr der zweite Sektor");
  const ring = new Ringlauf({ startSektor: SEKTOR_RECHTS });
  assert.equal(ring.zielSektor(ring.startSektor), SEKTOR_RECHTS);
  // Die alte Fassung faengt weiter oben an - sie soll sich nicht aendern.
  assert.equal(new Ringlauf().startSektor, 0);
  assert.equal(new Ringlauf().zielSektor(0), 0);
  // Und angenommen wird weiter jede Richtung: Der Startwert aendert nur,
  // was ANGEBOTEN wird.
  assert.match(methode(APP, "#neuerRing"),
    /this\.variante === "kurz"[\s\S]{0,160}new Ringlauf\(\{ startSektor: SEKTOR_RECHTS \}\)/,
    "Die kurze Fassung faengt nicht rechts an");
});

// ---------------------------------------------------------------------------
// Der Rueckfall hinter dem Namensschirm
// ---------------------------------------------------------------------------

// DIE KURZE FASSUNG ZEIGT DEN FRAGENBILDSCHIRM GAR NICHT MEHR: Nach dem
// Scan kommt der Bildschirm mit Name und Alter. Die Liste bleibt trotzdem
// gefuellt, und zwar mit genau diesen zweien - #fragenZeigen() prueft, ob
// die Seite den Namensschirm ueberhaupt mitbringt, und ohne ihn wird
// dasselbe gefragt, nur auf zwei Bildschirmen statt einem. Ohne diese
// Zeile stuende dort gar nichts.
test("ohne Namensschirm fragt die kurze Fassung dasselbe - nur einzeln", () => {
  const liste = APP.slice(APP.indexOf("this.fragenListe ="), APP.indexOf("this.fragenListe =") + 240);
  assert.match(liste, /this\.variante === "kurz"/, "Beide Fassungen stellen dieselben Fragen");
  assert.match(liste, /FRAGEN\.filter\(\(frage\) => frage\.id === "emri" \|\| frage\.id === "mosha"\)/,
    "Der Rueckfall fragt etwas anderes als der Bildschirm, den er ersetzt");
  assert.match(liste, /: FRAGEN_NACH_SCAN;/,
    "Die alte Fassung stellt nicht mehr die Strecke nach dem Scan");

  // Gefiltert, nicht abgeschrieben: Aendert sich Text oder Pruefung einer
  // der beiden, aendert sie sich hier mit.
  const kurz = FRAGEN.filter((frage) => frage.id === "emri" || frage.id === "mosha");
  assert.deepEqual(kurz.map((frage) => frage.id).sort(), ["emri", "mosha"],
    "Name und Alter gibt es nicht beide in FRAGEN");
  assert.equal(kurz.find((f) => f.id === "emri").typ, "text",
    "Der Name bekommt nicht die Schreibtastatur");
  assert.ok(kurz.find((f) => f.id === "mosha").antworten?.length,
    "Das Alter wird getippt statt angetippt");

  // Und der Weg durch die Fragen liest dieselbe Liste - sonst zeigte er
  // die eine Frage und zaehlte die andere.
  for (const name of ["#schrittZurFrage", "#frageWeiter"]) {
    assert.match(methode(APP, name), /this\.fragenListe\[/, `${name}() liest die falsche Liste`);
  }
  assert.ok(!/FRAGEN\[this\.fragen\.i\]/.test(APP),
    "Irgendwo steht noch die ungefilterte Liste");
});

test("bei der kurzen Liste steht kein Zaehler und keine falsche Ansage", () => {
  // "Frage 1 von 2" macht aus zwei Zeilen ein Formular, und "ein paar
  // kurze Fragen" waere eine Luege im schlechtesten Augenblick: Wer gerade
  // eine halbe Minute den Kopf gedreht hat, liest dort, dass noch ein
  // Fragebogen kommt, und legt weg.
  const zeichnen = methode(APP, "#frageZeichnen");
  assert.match(zeichnen, /const knapp = this\.fragenListe\.length <= 2;/);
  assert.match(zeichnen, /knapp \? "" : fuelle\(t\(FRAGEN_TEXTE\.zaehler/,
    "Der Zaehler steht auch bei der kurzen Liste da");
  assert.match(zeichnen, /knapp[\s\S]{0,120}FRAGEN_TEXTE\.einleitungEinzeln/,
    "Die Einleitung verspricht weiter mehrere Fragen");
  assert.ok(FRAGEN_TEXTE.einleitungEinzeln?.sq && FRAGEN_TEXTE.einleitungEinzeln?.de);
  assert.ok(!/pyetje/i.test(FRAGEN_TEXTE.einleitungEinzeln.sq),
    "Die Zeile spricht weiter von Fragen");
  // Und der Satz steht nur ueber der ERSTEN der beiden: Ueber der Nummer
  // waere er eine Wiederholung, die den Blick vom Feld wegzieht.
  assert.match(zeichnen, /this\.fragen\.i !== 0\s*\?\s*""/,
    "Die Einleitung steht ueber jeder Frage");
});

// ---------------------------------------------------------------------------
// Der Aufbau drumherum
// ---------------------------------------------------------------------------

test("die festen Kaesten liegen ausserhalb der Bildschirme", () => {
  // Ein transform bindet position:fixed an sich: Lagen sie in einem
  // Bildschirm, verschoeben sie sich waehrend des Wechsels mit.
  for (const fest of ["ls-fortschritt", "ls-blatt", "ls-fehler"]) {
    const mitId = HTML.indexOf(`id="${fest}"`);
    const stelle = mitId !== -1 ? mitId : HTML.indexOf(`class="${fest}"`);
    assert.notEqual(stelle, -1, `${fest} nicht gefunden`);
    const davor = HTML.slice(0, stelle);
    const offen = (davor.match(/<section class="ls-schirm/g) || []).length;
    const zu = (davor.match(/<\/section>/g) || []).length;
    assert.equal(offen, zu, `${fest} liegt in einem Bildschirm und wuerde mitbewegt`);
  }
});

test("die kurze Fassung laedt dieselben Module wie die alte", () => {
  // Keine Kopie: Ein zweiter Ort waere ein zweiter Ort, an dem jeder
  // spaetere Fehler noch einmal behoben werden muesste.
  assert.match(HTML, /<script type="module" src="\/apps\/lifeskin\/lifeskin-app\.js">/,
    "Die kurze Fassung laedt eine eigene Kopie des Trichters");
  assert.match(HTML, /<link rel="stylesheet" href="\/apps\/lifeskin\/lifeskin-styles\.css" \/>/,
    "Die kurze Fassung bringt ein eigenes Grundstilblatt mit");
  assert.ok(!/id="ls-karten"/.test(HTML),
    "Der lange Einstieg traegt noch die wechselnden Karten des kurzen");
});

test("die Seite ist unter zwei Adressen erreichbar und zaehlt nur unter einer", () => {
  // /lifeskintrichter zeigt weiter auf dieselbe Datei, damit die Links aus
  // dem Prueflauf nicht ins Leere gehen. Ohne canonical teilten sich beide
  // Adressen ihre Auffindbarkeit, und ein geteilter Link zeigte auf die
  // Probe statt auf die Seite.
  assert.match(HTML, /<link rel="canonical" href="https:\/\/www\.mnyra\.com\/lifeskin" \/>/,
    "Die Seite verweist nicht auf ihre eine gueltige Adresse");
  // Und "nicht in die Suche" gilt nicht mehr: Diese Datei IST jetzt
  // /lifeskin. Ein noindex haette die Seite selbst aus der Suche genommen.
  assert.ok(!/name="robots"/.test(HTML),
    "Die ausgelieferte Seite sperrt sich selbst aus der Suche aus");
});

test("die Adresse ist verdrahtet - im Betrieb, lokal und im Service Worker", () => {
  const vercel = JSON.parse(lies("vercel.json"));
  const eigene = vercel.rewrites.findIndex((r) => r.source === "/lifeskintrichter");
  const auffang = vercel.rewrites.findIndex((r) => String(r.source).includes(":landingSlug"));
  assert.ok(eigene >= 0, "Die Route /lifeskintrichter fehlt in vercel.json");
  assert.ok(eigene < auffang, "Die Auffangregel faengt /lifeskintrichter ab");
  assert.equal(vercel.rewrites[eigene].destination, "/apps/lifeskin-trichter/index.html");

  // Der Service Worker haelt sie fuer eine eigene Seite - sonst liefert er
  // bei jedem Netzaussetzer die Social-Shell aus. Geprueft wird auf genaue
  // Gleichheit oder Pfad mit Schraegstrich; '/lifeskin' deckt
  // '/lifeskintrichter' also NICHT ab.
  const sw = lies("sw.js");
  const liste = sw.match(/const NON_SOCIAL_NAVIGATION_PREFIXES = \[([\s\S]*?)\];/)[1];
  for (const pfad of ["/lifeskintrichter", "/apps/lifeskin-trichter"]) {
    assert.ok(liste.includes(`'${pfad}'`), `${pfad} fehlt im Service Worker`);
  }

  // Lokal ebenso, sonst liefert der Entwicklungsserver die Social-App.
  const dev = lies("scripts/local-dev-server.mjs");
  assert.match(dev, /path === "\/lifeskintrichter"/, "Lokal gibt es die Adresse nicht");
  assert.match(dev, /path === "\/lifeskin"/, "Lokal gibt es die alte Adresse nicht");

  // Und die Kommentare gehen nicht mit hinaus.
  assert.match(lies("scripts/build-vercel-static-output.mjs"), /"apps\/lifeskin-trichter"/,
    "Die Begruendungen im Aufbau werden mit ausgeliefert");
});

// DIE UMSTELLUNG SELBST.
//
// /lifeskin liefert die Landingpage aus (apps/lifeskin-landing/). Sie ist
// dieselbe Anwendung: derselbe Schalter, dieselben Module, die
// Bildschirme 2 bis 5 wortgleich - nur Bildschirm 1 ist die lange Seite
// mit Faellen, Weg, Aerztin und Fragen statt des kurzen Einstiegs.
//
// Das ist die eine Zeile, an der alles haengt, und sie steht an drei
// Stellen - im Betrieb, lokal und im Service Worker. Laufen sie
// auseinander, zeigt die lokale Pruefung eine andere Seite als der
// Besucher sieht, und der Fehler faellt erst im Anzeigenkonto auf.
test("/lifeskin liefert die Landingpage aus - im Betrieb wie lokal", () => {
  const vercel = JSON.parse(lies("vercel.json"));
  for (const quelle of ["/lifeskin", "/lifeskin/"]) {
    const regel = vercel.rewrites.find((r) => r.source === quelle);
    assert.ok(regel, `Die Route ${quelle} fehlt in vercel.json`);
    assert.equal(regel.destination, "/apps/lifeskin-landing/index.html",
      `${quelle} liefert nicht die Landingpage aus`);
  }

  // Lokal dieselbe Datei - sonst pruefe ich hier etwas anderes, als
  // ausgeliefert wird.
  const dev = lies("scripts/local-dev-server.mjs");
  const ziel = dev.match(/const LANDING_INDEX = "([^"]+)"/);
  assert.ok(ziel, "LANDING_INDEX steht nicht im Entwicklungsserver");
  assert.equal(ziel[1], "/apps/lifeskin-landing/index.html",
    "Der Entwicklungsserver liefert unter /lifeskin etwas anderes aus");

  // Und sie ist wirklich derselbe Trichter und keine zweite Anwendung:
  // derselbe Schalter am Aufbau, dieselben Module, dieselben Bildschirme.
  const landing = lies("apps/lifeskin-landing/index.html");
  assert.match(landing, /<html lang="sq" data-ls-variante="kurz">/,
    "Die Landingpage sagt nicht, welche Fassung sie ist");
  assert.match(landing, /src="\/apps\/lifeskin\/lifeskin-app\.js"/,
    "Die Landingpage laedt eine eigene Anwendung statt der einen");
  for (const name of ["einstieg", "kamera", "name", "analyse"]) {
    assert.ok(landing.includes(`id="ls-${name}"`),
      `Der Bildschirm ls-${name} fehlt - der Weg bricht nach der Landingpage ab`);
  }
  // Der Knopf, den lifeskin-app.js anspricht, gibt es genau einmal; die
  // anderen beiden Knoepfe mit demselben Wort reichen ihren Tipp weiter.
  assert.equal(landing.split('id="ls-start"').length - 1, 1,
    "Die Kennung ls-start steht nicht genau einmal");
  assert.ok(landing.split("data-ls-start>").length - 1 >= 2,
    "Die uebrigen Knoepfe tragen die Marke nicht, an der der Tipp weitergereicht wird");

  // DIE BEIDEN FASSUNGEN DAVOR BLEIBEN LIEGEN: Der Weg zurueck ist ein
  // Austausch dieser Zeile, kein Wiederherstellen einer geloeschten Datei.
  assert.ok(HTML.includes('id="ls-start"'),
    "Die kurze Fassung ist weg - dann gibt es keinen Weg zurueck");
  assert.ok(ALT_HTML.includes('id="ls-start"'),
    "Die lange Fassung ist weg - dann gibt es keinen Weg zurueck");
});

// WAS DIE LANDINGPAGE AUS DEM TRICHTER MITBRINGT UND WAS NICHT.
//
// Sie liegt IM Bildschirm 1 und nicht auf einer eigenen Seite - und sie
// bringt ein zweites Stilblatt mit, das dieselben Namen vergibt wie das
// des Trichters (--grund, --kauf, --text-3, --linie ...), nur mit anderen
// Werten. Stuenden sie an :root, faerbte die Landingpage Kamera, Name und
// Aufbereitung mit um; die Werte liegen nah beieinander, es faellt
// niemandem auf, und es waere trotzdem falsch.
test("die Landingpage faerbt die Bildschirme dahinter nicht um", () => {
  const blatt = lies("apps/lifeskin-landing/landing.css");
  assert.ok(!/^:root \{/m.test(blatt),
    "Das Blatt der Landingpage vergibt wieder Namen an :root");
  assert.match(blatt, /^#ls-einstieg \{/m,
    "Die Masse und Farben der Landingpage haengen an keiner Kennung");
  // UND WAS ES AN html UND body SETZT, GILT NUR AUF DIESER SEITE.
  //
  // Hier stand: das Blatt darf html und body ueberhaupt nicht anfassen.
  // Das galt, solange die Landingpage in einem Kasten scrollte. Sie
  // scrollt jetzt selbst - ein Dokument mit fester Hoehe und
  // abgeschaltetem Ueberlauf kann nicht mitwachsen, wenn der Browser
  // von Instagram seine Leiste einklappt, und der Streifen, der dabei
  // frei wird, gehoert dann niemandem.
  //
  // Der Trichter braucht seine Sperre trotzdem: Auf der Kamera und in
  // den Blaettern darf nichts wegrutschen. Also darf jede Regel an html
  // und body genau eine Form haben - gebunden an den aktiven Einstieg.
  // Eine ungebundene Regel wuerde die Sperre auch auf der Kamera
  // aufheben, und das faellt erst auf, wenn jemand dort scrollt.
  for (const treffer of blatt.matchAll(/^(html|body|\*)([^{]*)\{/gm)) {
    const [, tag, rest] = treffer;
    assert.ok(rest.includes(':has(#ls-einstieg[data-aktiv="ja"])'),
      `Die Regel an <${tag}> gilt auch in den Bildschirmen des Trichters: ${tag}${rest.trim()}`);
  }
});

// GESCROLLT WIRD EIN KASTEN, NICHT DIE SEITE.
//
// html und body stehen auf overflow: hidden - ein Bildschirm IST die
// Fensterhoehe. Wer auf dieser Seite etwas am Scrollen festmacht, muss
// #lp meinen; am Fenster gemessen loest nichts je aus.
//
// HIER STAND EINE ZEILE MEHR: dass landing.js an #lp horcht. Das tat es
// fuer die klebende Kopfzeile, die beim Scrollen eine Flaeche bekam -
// und die klebt nicht mehr (siehe den Test darunter). Damit gibt es
// nichts mehr zu messen, und ein Test, der einen Horcher verlangt, den
// es aus gutem Grund nicht gibt, zwingt zu totem Code.
//
// Was BLEIBT, ist die Falle selbst: Wer hier je wieder etwas am Scrollen
// festmacht, darf nicht das Fenster nehmen.
test("die Landingpage misst nie das Fenster", () => {
  const skript = lies("apps/lifeskin-landing/landing.js");
  assert.ok(!/pageYOffset|documentElement\.scrollTop|window\.scrollY/.test(skript),
    "Das Skript misst das Fenster - das scrollt hier aber nie");
  assert.ok(!/window\.addEventListener\("scroll"/.test(skript),
    "Gehorcht wird dem Fenster - auf dieser Seite scrollt es nie");
  assert.match(lies("apps/lifeskin-landing/index.html"), /<div class="lp" id="lp">/,
    "Den Kasten gibt es im Aufbau nicht");

  // Und er versteckt seinen Balken - aus demselben Grund wie jeder andere
  // scrollende Kasten des Trichters: Der Kasten sieht aus wie die Seite
  // selbst, ein Balken an seiner Innenkante nach einer kaputten Seite.
  const blatt = lies("apps/lifeskin-landing/landing.css");
  assert.match(blatt, /\.lp \{[^}]*scrollbar-width: none/,
    "Der Kasten versteckt seinen Balken nicht");
  assert.match(blatt, /\.lp::-webkit-scrollbar/,
    "Der Kasten versteckt seinen Balken nicht auf aelteren Androids");
});

// DIE KOPFZEILE KLEBT NICHT UND DER FESTE KNOPF GIBT ES NUR AUF DEM
// TELEFON.
//
// Beide zusammen nahmen dem Inhalt von oben und unten Platz weg - auf
// einem 936 Punkte hohen Fenster rund 150. Auf einer Seite, die gelesen
// und nicht bedient wird, traegt eine dauerhafte Kopfzeile nichts als das
// Wortzeichen; wer es wiedersehen will, scrollt nach oben.
test("die Landingpage klebt weder oben noch auf dem Schreibtisch unten", () => {
  const blatt = lies("apps/lifeskin-landing/landing.css");
  const kopf = blatt.slice(blatt.indexOf("\n.kopf {"), blatt.indexOf("}", blatt.indexOf("\n.kopf {")));
  assert.ok(kopf.length > 40, "Die Kopfzeile ist nicht mehr zu finden");
  assert.ok(!/position:\s*sticky|position:\s*fixed/.test(kopf),
    "Die Kopfzeile klebt wieder oben");
  // Und der feste Knopf verschwindet, sobald Platz da ist.
  assert.match(blatt, /@media \(min-width: 720px\) \{[^@]*\.dock \{ display: none; \}/s,
    "Der feste Knopf steht auf dem Schreibtisch weiter im Bild");
});
