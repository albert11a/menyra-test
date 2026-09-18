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
// Bildschirm 2: weg
// ---------------------------------------------------------------------------

test("die Vorbereitungsseite kommt in der kurzen Fassung nicht mehr vor", () => {
  assert.ok(!/id="ls-vorbereitung"/.test(HTML),
    "Der Bildschirm zwischen Einstieg und Kamera steht wieder im Weg");
  // In der alten Fassung steht sie weiter - sie bleibt unveraendert.
  assert.match(ALT_HTML, /id="ls-vorbereitung"/,
    "Die alte Fassung hat ihre Vorbereitungsseite verloren");
});

test("der Tipp auf den Knopf fuehrt je Fassung woanders hin", () => {
  const tippen = methode(APP, "#startTippen");
  // Gezaehlt wird weiter an derselben Stelle: der Tipp auf den Knopf.
  assert.match(tippen, /this\.sitzung\.schritt\("named"\);/,
    "Der erste Tipp wird nicht mehr gezaehlt");
  // Die kurze Fassung geht unmittelbar an die Kamera - kein Bildschirm und
  // kein Blatt dazwischen. Die Systemfrage des Browsers ist der einzige
  // Kasten, den der Besucher an dieser Stelle sieht.
  assert.match(tippen, /if \(this\.variante === "kurz"\) \{[\s\S]{0,1400}this\.#kameraStarten\(\);/,
    "Die kurze Fassung geht nicht unmittelbar an die Kamera");
  assert.ok(!/#anleitung/.test(APP), "Das Anleitungsblatt steht wieder im Weg");
  assert.ok(!/id="ls-anleitung"/.test(HTML), "Das Anleitungsblatt steht noch im Aufbau");
  // Und die alte Fassung geht weiter auf ihre Vorbereitungsseite.
  assert.match(tippen, /this\.zeige\("vorbereitung"\);/,
    "Die alte Fassung springt jetzt woanders hin");
});

test("wer tippt, bevor die Module da sind, bekommt keinen Kamerafehler", () => {
  // Der Knopf traegt seine Beschriftung im Aufbau und sieht fertig aus,
  // bevor der Horcher dranhaengt; der kurze Aufsatz in index.html merkt
  // sich den Tipp. Nachgeholt ist er fuer den Browser aber keine
  // Berührung mehr - getUserMedia() wuerde auf iOS abgewiesen, und der
  // Besucher staende vor einem Fehler, den er nicht verursacht hat.
  //
  // Dann steht auf dem Kameraschirm ein Knopf, den sonst niemand sieht.
  assert.match(methode(APP, "#frueherTippNachholen"), /this\.#startTippen\(\{ frueh: true \}\);/,
    "Der nachgeholte Tipp ist nicht mehr als solcher zu erkennen");
  const tippen = methode(APP, "#startTippen");
  assert.match(tippen, /if \(frueh\) \{[\s\S]{0,400}notknopf\.hidden = false;/,
    "Ein nachgeholter Tipp fordert die Kamera ohne Berührung an");
  assert.match(HTML, /id="ls-kameraoeffnen"[\s\S]{0,120}hidden/,
    "Der Notknopf fehlt im Aufbau oder steht von Anfang an da");
  // Und er verschwindet wieder, sobald die Kamera laeuft.
  assert.match(methode(APP, "#kameraStarten"), /if \(notknopf\) notknopf\.hidden = true;/,
    "Der Notknopf bleibt stehen, wenn die Kamera laeuft");
});

test("ein Zurueck von der Kamera fuehrt dorthin, wo der Besucher herkam", () => {
  const vorher = methode(APP, "vorherigerSchirm");
  assert.match(vorher, /if \(this\.variante === "kurz"\) \{[\s\S]{0,160}kamera: "einstieg"/,
    "Zurueck fuehrt auf einen Bildschirm, den es in dieser Fassung nicht gibt");
  // Und die Kamera steht im Verlauf des Browsers, sonst fuehrt die
  // Wischgeste nach rechts aus dem Trichter heraus.
  assert.match(APP, /const IM_VERLAUF_KURZ = Object\.freeze\(\["einstieg", "kamera"\]\);/,
    "Die kurze Fassung hat nur eine Station im Verlauf");
});

// ---------------------------------------------------------------------------
// Bildschirm 3: gefuehrt wird im Bild
// ---------------------------------------------------------------------------

test("der Pfeil steht im Bild und zeigt, wohin der Kopf soll", () => {
  assert.match(HTML, /<div class="ls-pfeil" id="ls-pfeil" aria-hidden="true">/,
    "Im Kamerabild fehlt der Zeigefinger");
  // Er liegt auf demselben Kreis wie der Ring - dieselben Zahlen wie
  // .ls-kamera__kreis und #oval() in lifeskin-app.js.
  assert.match(CSS, /\.ls-pfeil \{[\s\S]{0,260}left: 7%; top: 7%; width: 86%; height: 86%;/,
    "Der Pfeil liegt nicht auf dem Kreis des Rings");
  assert.match(APP, /#oval\(bild\) \{[\s\S]{0,160}0\.07[\s\S]{0,80}0\.86/,
    "Der Ring rechnet mit anderen Zahlen als der Pfeil steht");
  // Gedreht wird der ganze Kasten, der Zeiger sitzt oben darin.
  assert.match(CSS, /transform: rotate\(var\(--ls-pfeil-winkel, 90deg\)\);/);
  assert.match(CSS, /\.ls-pfeil__zeiger \{[\s\S]{0,320}animation: ls-pfeil-stupst/,
    "Der Pfeil bewegt sich nicht - eine ruhige Anweisung wird ueberlesen");
  // Wer Bewegung abbestellt hat, bekommt die Anweisung trotzdem: Der Pfeil
  // ist keine Verzierung.
  const ruhe = CSS.slice(CSS.indexOf("prefers-reduced-motion"));
  assert.match(ruhe, /\.ls-pfeil__zeiger \{ animation: none;/);
});

test("die Richtung des Pfeils ist die des Rings, nicht seine eigene", () => {
  const zeigen = methode(APP, "#pfeilZeigen");
  assert.match(zeigen, /stand\.zielSektor/, "Der Pfeil erfindet seine Richtung");
  assert.match(zeigen, /\/ \(stand\.sektoren \|\| SEKTOREN\)\) \* 360/,
    "Aus dem Sektor wird kein Winkel");
  // Nur wenn ueberhaupt eine Richtung bekannt ist: kein Netz, keine
  // Kalibrierung oder ein geschlossener Ring heissen kein Pfeil.
  assert.match(zeigen, /Boolean\(netz\) && stand\?\.kalibriert === true/);
  assert.match(zeigen, /stand\.anteil < 0\.999/);
  // Und er wird nicht in jedem Bild neu gesetzt - sonst laeuft der
  // Uebergang nie zu Ende.
  assert.match(zeigen, /if \(pfeil\.dataset\.grad === String\(grad\)\) return;/);

  // Im Weg ohne Gesichtsnetz und nach dem Anhalten: kein Pfeil.
  assert.match(methode(APP, "#rueckfallschleife"), /this\.#pfeilZeigen\(null, null\);/,
    "Ohne Gesichtsnetz zeigt der Pfeil trotzdem irgendwohin");
  assert.match(methode(APP, "#kameraStoppen"), /this\.#pfeilZeigen\(null, null\);/,
    "Der Pfeil bleibt nach dem Scan stehen");
  // Gezeichnet wird er in derselben Schleife wie der Ring.
  assert.match(methode(APP, "#ringschleife"), /this\.#pfeilZeigen\(netz, stand\);/);
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
// Nach dem Scan: nur noch die Nummer
// ---------------------------------------------------------------------------

test("die kurze Fassung fragt nach dem Scan nur die Nummer", () => {
  // Von 32 fertigen Analysen haben 13 ihren Befund gesehen - genau die 13,
  // die erreichbar waren. Jede Frage zwischen dem Scan und dieser einen
  // Zeile ist eine Gelegenheit, vorher wegzugehen.
  const liste = APP.slice(APP.indexOf("this.fragenListe ="), APP.indexOf("this.fragenListe =") + 240);
  assert.match(liste, /this\.variante === "kurz"/, "Beide Fassungen stellen dieselben Fragen");
  assert.match(liste, /FRAGEN\.filter\(\(frage\) => frage\.id === "numri"\)/,
    "Die kurze Fassung filtert nicht auf die Nummer");
  assert.match(liste, /: FRAGEN;/, "Die alte Fassung stellt nicht mehr alle Fragen");

  // Gefiltert, nicht abgeschrieben: Aendert sich Text oder Pruefung der
  // Nummer, aendert sie sich hier mit.
  const nummer = FRAGEN.filter((frage) => frage.id === "numri");
  assert.equal(nummer.length, 1, "Die Nummernfrage heisst nicht mehr numri");
  assert.equal(nummer[0].typ, "tel");

  // Und der Weg durch die Fragen liest dieselbe Liste - sonst zeigte er
  // die eine Frage und zaehlte die andere.
  for (const name of ["#schrittZurFrage", "#frageWeiter"]) {
    assert.match(methode(APP, name), /this\.fragenListe\[/, `${name}() liest die falsche Liste`);
  }
  assert.ok(!/FRAGEN\[this\.fragen\.i\]/.test(APP),
    "Irgendwo steht noch die ungefilterte Liste");
});

test("bei einer einzigen Frage steht kein Zaehler und keine falsche Ansage", () => {
  // "Frage 1 von 1" zaehlt nichts, und "ein paar kurze Fragen" waere eine
  // Luege im schlechtesten Augenblick: Wer gerade eine halbe Minute den
  // Kopf gedreht hat, liest dort, dass noch etwas kommt, und legt weg.
  const zeichnen = methode(APP, "#frageZeichnen");
  assert.match(zeichnen, /const einzeln = this\.fragenListe\.length === 1;/);
  assert.match(zeichnen, /einzeln \? "" : fuelle\(t\(FRAGEN_TEXTE\.zaehler/,
    "Der Zaehler steht auch bei einer einzigen Frage da");
  assert.match(zeichnen, /einzeln[\s\S]{0,120}FRAGEN_TEXTE\.einleitungEinzeln/,
    "Die Einleitung verspricht weiter mehrere Fragen");
  assert.ok(FRAGEN_TEXTE.einleitungEinzeln?.sq && FRAGEN_TEXTE.einleitungEinzeln?.de);
  assert.ok(!/pyetje/i.test(FRAGEN_TEXTE.einleitungEinzeln.sq),
    "Die Zeile spricht weiter von Fragen");
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

test("die Probeadresse geht nicht in die Suche", () => {
  // Zwei Adressen mit demselben Inhalt teilen sich sonst ihre
  // Auffindbarkeit, und ein geteilter Link zeigte auf die Probe.
  assert.match(HTML, /<meta name="robots" content="noindex,nofollow" \/>/,
    "Die Probeadresse darf indexiert werden");
  assert.match(HTML, /<link rel="canonical" href="https:\/\/www\.mnyra\.com\/lifeskin" \/>/,
    "Die Probeadresse verweist nicht auf die echte Seite");
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
