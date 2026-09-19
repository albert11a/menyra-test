// DER BILDSCHIRM, DER DEN TEUERSTEN VERLUST AUFFANGEN SOLL.
//
// GEMESSEN, NICHT GESCHAETZT: Im Anzeigenkonto standen 222 auf der
// Landingpage und 38 beim Scan - 184 gingen bei "Skanimi" weg, mehr als
// vier von fuenf. Ein Teil davon will die Kamera nicht freigeben, und fuer
// den gab es genau einen Ausgang: die Seite schliessen.
//
// Seitdem teilt sich der Weg vorher: Skanim me kamerë oder weiter ohne.
// Beide enden auf derselben Warteseite, nur traegt der zweite keine Fotos.
//
// Diese Datei haelt drei Dinge fest, die dabei leicht auseinanderlaufen:
//
//   1. DER AUFBAU. Den Wahlbildschirm gibt es nur auf der Seite, die
//      /lifeskin ausliefert - die beiden Fassungen davor laufen
//      unveraendert weiter, und die Anwendung entscheidet das am Aufbau
//      und nicht an einem Pfad.
//   2. DIE RECHNUNG. Ein Trichter zaehlt kumulativ. Bei zwei Wegen wird
//      daraus eine Zahl, die luegt - in beide Richtungen.
//   3. WAS OHNE SCAN ANDERS IST. Ein Fall ohne Aufnahmen muss als solcher
//      dastehen: in Heart, damit Dr. Gashi keine Fotos sucht, die es nicht
//      gibt, und auf der Warteseite, damit dort nicht "3 foto" steht.

import test from "node:test";
import assert from "node:assert/strict";

import { normalisiere, baueTrichter, baueWege, ohneScanGelaufen, TRICHTER_STUFEN }
  from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { OBERFLAECHE } from "../apps/lifeskin/lifeskin-content.js";
import { lies, ohneKommentare, methode } from "./lifeskin-quelle.mjs";

const APP = ohneKommentare(lies("apps/lifeskin/lifeskin-app.js"));
const LANDING = lies("apps/lifeskin-landing/index.html");
const KURZ = lies("apps/lifeskin-trichter/index.html");
const LANG = lies("apps/lifeskin/index.html");

// ---------------------------------------------------------------------------
// 1. Der Aufbau
// ---------------------------------------------------------------------------

test("die Wahl steht nur auf der Seite, die sie braucht", () => {
  assert.match(LANDING, /<section class="ls-schirm" id="ls-wahl" data-aktiv="nein">/,
    "Der Landingpage fehlt der Wahlbildschirm");
  // Und die beiden Fassungen davor bekommen ihn NICHT. Dort fuehrt der
  // Tipp weiter unmittelbar an die Kamera; ein Bildschirm dazwischen
  // kostet dort Besucher, ohne einen zweiten Weg zu eroeffnen.
  for (const [name, seite] of [["kurze Fassung", KURZ], ["lange Fassung", LANG]]) {
    assert.ok(!seite.includes('id="ls-wahl"'), `Die ${name} hat den Wahlbildschirm bekommen`);
  }
});

test("zwei Karten, und die empfohlene ist als solche erkennbar", () => {
  const wahl = LANDING.slice(LANDING.indexOf('id="ls-wahl"'),
    LANDING.indexOf("</section>", LANDING.indexOf('id="ls-wahl"')));

  const wege = [...wahl.matchAll(/data-ls-weg="([a-z-]+)"/g)].map((m) => m[1]);
  assert.deepEqual(wege, ["skanim", "pa-skanim"],
    "Die zwei Wege stehen nicht in dieser Reihenfolge im Aufbau");

  // ZWEI GLEICH AUSSEHENDE KARTEN WAEREN EINE FRAGE OHNE RAT - und eine
  // Frage ohne Rat kostet genau die Leute, die unsicher sind. Die erste
  // traegt deshalb ein Schild und eine eigene Klasse, an der das
  // Stilblatt Rahmen und Farbe aufzieht.
  assert.match(wahl, /class="ls-wahlkarte ls-wahlkarte--rat" data-ls-weg="skanim"/,
    "Die empfohlene Karte ist nicht als solche ausgezeichnet");
  assert.match(wahl, /class="ls-wahlkarte__marke" data-text="wahlScanMarke"/,
    "Der empfohlenen Karte fehlt ihr Schild");
  const css = lies("apps/lifeskin-landing/landing.css");
  assert.match(css, /\.ls-wahlkarte--rat \{[^}]*border-color: var\(--basis\);/,
    "Die empfohlene Karte hebt sich nicht ab");

  // GANZE KARTEN SIND DER KNOPF, nicht ein Knopf darin: Auf einem Telefon
  // ist die Karte das Ziel, das der Daumen sucht. <button> und nicht
  // <div>, damit Tastatur und Vorleseprogramm dasselbe bekommen.
  assert.equal(wahl.match(/<button type="button" class="ls-wahlkarte/g)?.length, 2,
    "Die Karten sind keine Knoepfe - mit dem Finger ginge es, mit der Tastatur nicht");

  // Und das Zeichen des Scans ist dasselbe wie auf der Anleitung danach:
  // Wer es hier gesehen hat, erkennt es dort wieder.
  assert.match(wahl, /data-zeichen="scan-face"/, "Der Karte fehlt das Zeichen des Scans");
});

test("jeder Text der Wahl steht im Verzeichnis, in beiden Sprachen", () => {
  const wahl = LANDING.slice(LANDING.indexOf('id="ls-wahl"'),
    LANDING.indexOf("</section>", LANDING.indexOf('id="ls-wahl"')));
  const schluessel = [...wahl.matchAll(/data-text="([A-Za-z0-9]+)"/g)].map((m) => m[1]);
  assert.ok(schluessel.length >= 7, `Nur ${schluessel.length} Texte gefunden - die Suche greift nicht`);
  for (const name of schluessel) {
    assert.ok(OBERFLAECHE[name], `${name} steht nicht im Verzeichnis`);
    assert.ok(OBERFLAECHE[name].sq && OBERFLAECHE[name].de,
      `${name} fehlt in einer Sprache`);
  }
});

test("kein Text der Wahl traegt das Wort, das ihn ueberschreiben wuerde", () => {
  // #texteSetzen() schreibt jeden Knoten mit data-text neu. Die Karten
  // tragen ihre Saetze in EIGENEN Kindern - stuende data-text am Knopf
  // selbst, wischte ein textContent Zeichen, Titel und Zeile darunter weg.
  const wahl = LANDING.slice(LANDING.indexOf('id="ls-wahl"'),
    LANDING.indexOf("</section>", LANDING.indexOf('id="ls-wahl"')));
  assert.ok(!/<button[^>]*data-ls-weg="[a-z-]+"[^>]*data-text=/.test(wahl),
    "Eine Karte traegt data-text an sich selbst - das loescht ihren Inhalt");
});

// ---------------------------------------------------------------------------
// 2. Der Weg
// ---------------------------------------------------------------------------

test("der Tipp fuehrt an die Wahl - aber nur, wo es sie gibt", () => {
  const tippen = methode(APP, "#startTippen");
  // Geprueft wird am Aufbau und nicht an der Fassung: So laufen die
  // beiden Seiten ohne diesen Bildschirm unveraendert weiter.
  assert.match(tippen, /if \(\$\("#ls-wahl"\)\) \{/,
    "Der Tipp sucht den Wahlbildschirm nicht am Aufbau");
  assert.match(tippen, /this\.sitzung\.schritt\("wahl"\);/,
    "Die Wahl hinterlaesst keine Spur - dann steht sie in keiner Zahl");
  // Und die Abkuerzung der kurzen Fassung steht DAHINTER, sonst kaeme
  // niemand je an der Wahl an.
  assert.ok(tippen.indexOf('$("#ls-wahl")') < tippen.indexOf('this.variante === "kurz"'),
    "Die kurze Fassung greift, bevor die Wahl geprueft wird");
});

test("mit Scan geht es ueber die Anleitung, ohne Scan an Name und Alter", () => {
  const waehlen = methode(APP, "#wegWaehlen");

  // Ohne Scan: die Marke zuerst, dann der Namensschirm. Ohne die Marke
  // stuende in Heart ein Fall ohne Aufnahmen, und niemand wuesste, ob der
  // Scan misslungen oder gar nicht gewollt war.
  assert.match(waehlen, /if \(weg === "pa-skanim"\) \{/);
  assert.match(waehlen, /this\.sitzung\.ergaenze\(\{ paSkanim: true \}\);/,
    "Der Weg ohne Scan hinterlaesst keine Marke");
  assert.ok(waehlen.indexOf('ergaenze({ paSkanim: true })') < waehlen.indexOf('this.zeige("name")'),
    "Die Marke faellt erst, nachdem der Bildschirm gewechselt hat");

  // Mit Scan: die Anleitung, wenn es sie gibt - sonst unmittelbar die
  // Kamera. Wieder am Aufbau geprueft, nicht an der Fassung.
  assert.match(waehlen, /if \(\$\("#ls-vorbereitung"\)\) \{/);
  assert.match(waehlen, /this\.sitzung\.schritt\("named"\);/);
  assert.match(waehlen, /this\.#kameraStarten\(\);/);
});

test("ohne Scan gibt es nichts aufzubereiten", () => {
  // Der Aufbereitungsschirm zaehlt sieben Sekunden lang Aufnahmen durch,
  // die es auf diesem Weg nicht gibt - sieben Sekunden Warten auf nichts,
  // und jede davon ist eine Gelegenheit wegzugehen.
  const weiter = methode(APP, "#nameWeiter");
  assert.match(weiter, /if \(this\.zustand\.paSkanim\) \{ this\.#uebergeben\(\); return; \}/,
    "Der Weg ohne Scan laeuft durch die Aufbereitung");
  assert.ok(weiter.indexOf('schritt("emri"') < weiter.indexOf("paSkanim"),
    "Name und Alter fallen nicht mehr, bevor abgekuerzt wird");
});

test("die zwei Karten haengen an einem Merkmal, nicht an zwei Kennungen", () => {
  // So kostet eine dritte Karte keine dritte Zeile in der Anwendung.
  assert.match(APP, /for \(const karte of \$\$\("\[data-ls-weg\]"\)\) \{/,
    "Die Karten sind einzeln angebunden");
  assert.match(APP, /this\.#wegWaehlen\(karte\.dataset\.lsWeg\)/);
});

// ---------------------------------------------------------------------------
// 3. Die Rechnung
// ---------------------------------------------------------------------------

// EIN TRICHTER ZAEHLT KUMULATIV - und genau daran waere er hier kaputt
// gegangen. Wer ohne Scan bis zur Warteseite kommt, ist weiter als
// "camera" in der Schrittfolge; eine Stufe "Skanimi" haette ihn also
// mitgezaehlt, obwohl er die Kamera nie gesehen hat.
test("der Weg ohne Scan steht in keiner Scan-Stufe", () => {
  const ids = TRICHTER_STUFEN.map((s) => s.id);
  assert.ok(!ids.includes("camera"),
    "Der Scan steht wieder als Stufe im Trichter und zaehlt den anderen Weg mit");
  assert.ok(ids.includes("wahl"), "Die Wahl steht nicht im Trichter");
  assert.ok(ids.indexOf("wahl") < ids.indexOf("emri"),
    "Die Wahl steht hinter Name und Alter - sie kommt aber davor");
});

test("der Trichter wird nie breiter, auch wenn beide Wege gegangen werden", () => {
  // Der Fall, der eine Stufe groesser gemacht haette als die davor: viele
  // ohne Scan, wenige mit. Ein Trichter, der nach unten breiter wird,
  // liest sich als Fehler - und niemand glaubt der Zahl danach noch.
  const sitzungen = [
    ...Array.from({ length: 10 }, (_, i) =>
      normalisiere(`o${i}`, { step: "result", paSkanim: true, warteseiteGeoeffnet: true })),
    ...Array.from({ length: 2 }, (_, i) =>
      normalisiere(`m${i}`, { step: "result", warteseiteGeoeffnet: true })),
    ...Array.from({ length: 8 }, (_, i) => normalisiere(`a${i}`, { step: "opened" }))
  ];
  const trichter = baueTrichter(sitzungen);
  for (let i = 1; i < trichter.length; i += 1) {
    assert.ok(trichter[i].anzahl <= trichter[i - 1].anzahl,
      `Stufe ${trichter[i].id} (${trichter[i].anzahl}) ist breiter als ${trichter[i - 1].id} (${trichter[i - 1].anzahl})`);
  }
  const nach = (id) => trichter.find((s) => s.id === id).anzahl;
  assert.equal(nach("gesehen"), 20);
  assert.equal(nach("wahl"), 12, "Die Wahl haben zwoelf gesehen - beide Wege zusammen");
  assert.equal(nach("emri"), 12);
});

test("die Verzweigung zaehlt jeden Weg fuer sich", () => {
  const wege = baueWege([
    ...Array.from({ length: 10 }, (_, i) =>
      normalisiere(`o${i}`, { step: "result", paSkanim: true })),
    ...Array.from({ length: 6 }, (_, i) => normalisiere(`m${i}`, { step: "captured" })),
    // Zwei, die die Wahl gesehen und nichts gewaehlt haben.
    ...Array.from({ length: 2 }, (_, i) => normalisiere(`w${i}`, { step: "wahl" })),
    // Und drei, die es nie bis dorthin geschafft haben - sie gehoeren in
    // keine der beiden Zahlen, auch nicht in den Nenner.
    ...Array.from({ length: 3 }, (_, i) => normalisiere(`v${i}`, { step: "opened" }))
  ]);

  assert.equal(wege.anDerWahl, 18, "Der Nenner sind die, die die Wahl gesehen haben");
  const nach = (id) => wege.wege.find((w) => w.id === id);
  assert.equal(nach("mitScan").anzahl, 6);
  assert.equal(nach("ohneScan").anzahl, 10);
  assert.equal(wege.ohneWahl, 2, "Die zwei Unentschiedenen fallen aus der Rechnung");
  assert.equal(Number(nach("ohneScan").anteil.toFixed(4)), Number((10 / 18).toFixed(4)));
  assert.equal(wege.scanFertig, 6, "Alle sechs haben den Scan zu Ende gebracht");
});

// DER SCHREIBVORGANG, DER STILL SCHEITERT.
//
// GESEHEN, NICHT BEFUERCHTET: Nach dem ersten Livegang standen 55 an der
// Wahl, "Pa skanim" auf null - und der Betreiber hatte den Weg selbst
// mehrmals genommen. Die Ursache lag nicht im Trichter: hasOnly() in den
// Firestore-Regeln weist das GANZE Dokument ab, sobald ein Feld darin
// steht, das die Regel nicht kennt. Solange "paSkanim" nicht deployt
// war, ging die Marke jedes Mal verloren - lautlos, denn der naechste
// Schritt kam wieder durch.
//
// Diese Seite hat denselben Fehler zweimal gehabt (der Schritt
// "captured" und das Feld ringAnteil, beide wochenlang unbemerkt). Also
// haengt die Zahl jetzt nicht mehr an der Marke allein.
test("ein Fall ohne Aufnahmen zaehlt als Fall ohne Scan, auch ohne Marke", () => {
  // Ein abgeschlossener Scan schreibt IMMER, welche Blickrichtungen
  // danebenliegen. Wer auf der Warteseite ankommt, ohne eine einzige
  // Aufnahme mitzubringen, hat nicht gescannt - was auch immer die Marke
  // sagt.
  assert.equal(ohneScanGelaufen(normalisiere("a", { step: "result" })), true,
    "Ein Fall ohne Aufnahmen wird nur an der Marke erkannt");
  assert.equal(ohneScanGelaufen(normalisiere("b", { step: "result", paSkanim: true })), true);
  assert.equal(ohneScanGelaufen(normalisiere("c", { step: "result", photos: ["gerade"] })), false,
    "Ein Fall MIT Aufnahmen gilt als Fall ohne Scan");

  // UND DIE GRENZE: Wer die Kamera geoeffnet und dann abgebrochen hat,
  // hat ebenfalls keine Bilder - der hat den Scan aber GEWAEHLT und ist
  // an ihm gescheitert. Zwei verschiedene Dinge, zwei verschiedene
  // Zahlen; in einer Zahl waere der Wahlbildschirm nicht mehr zu
  // bewerten.
  assert.equal(ohneScanGelaufen(normalisiere("d", { step: "camera" })), false,
    "Der Abbruch an der Kamera zaehlt als Weg ohne Scan");
  assert.equal(ohneScanGelaufen(normalisiere("e", { step: "captured" })), false);
});

test("die Verzweigung sagt es, wenn die Marke nicht ankommt", () => {
  const wege = baueWege([
    ...Array.from({ length: 4 }, (_, i) => normalisiere(`v${i}`, { step: "result" })),
    ...Array.from({ length: 3 }, (_, i) =>
      normalisiere(`m${i}`, { step: "result", photos: ["gerade", "rechts"] }))
  ]);
  assert.equal(wege.wege.find((w) => w.id === "ohneScan").anzahl, 4,
    "Die vier ohne Aufnahmen fehlen in der Zahl");
  assert.equal(wege.ohneMarke, 4,
    "Es steht nicht da, dass die Zahl aus den Bildern kommt und nicht aus der Marke");

  // Mit Marke ist nichts zu melden.
  const sauber = baueWege([normalisiere("x", { step: "result", paSkanim: true })]);
  assert.equal(sauber.ohneMarke, 0);
});

test("dieselbe Frage wird an beiden Stellen gleich beantwortet", () => {
  // Die Verzweigung unter dem Trichter und die Marke an der einzelnen
  // Analyse muessen dasselbe sagen. Zwei Kopien dieser Regel liefen
  // frueher oder spaeter auseinander - deshalb EINE Funktion.
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  assert.match(render, /ohneScanGelaufen/, "Die Marke fragt nicht dieselbe Funktion");
  const marken = render.slice(render.indexOf("function fallMarken("),
    render.indexOf("function renderAnalysen("));
  assert.match(marken, /if \(!ohneScanGelaufen\(sitzung\)\) return reihe;/,
    "Die Marke haengt wieder allein am Feld, das verloren gehen kann");
  assert.ok(!/sitzung\.paSkanim/.test(marken),
    "Die Marke liest das Feld wieder unmittelbar");
});

test("ein Fall von vor der Wahl zaehlt als Fall mit Scan", () => {
  // Er traegt kein paSkanim - damals gab es nur den einen Weg. Als "ohne
  // Scan" gelesen, saehe die Verzweigung der Vergangenheit aus, als haette
  // niemand je die Kamera benutzt.
  //
  // SEINE AUFNAHMEN STEHEN HIER, und das ist keine Verzierung des
  // Pruefstands: Damals kam auf der Warteseite nur an, wer gescannt hat,
  // also traegt JEDER Fall von damals seine Blickrichtungen. Genau daran
  // erkennt ihn die Rechnung, ohne die Marke zu brauchen.
  const wege = baueWege([
    normalisiere("alt", { step: "result", photos: ["gerade", "rechts", "links"] })
  ]);
  assert.equal(wege.wege.find((w) => w.id === "mitScan").anzahl, 1);
  assert.equal(wege.wege.find((w) => w.id === "ohneScan").anzahl, 0);
});

test("die Marke kommt bis nach Heart durch", () => {
  assert.equal(normalisiere("a", { step: "emri", paSkanim: true }).paSkanim, true);
  // Ein fehlendes Merkmal heisst "mit Scan" und nicht "unbekannt": So
  // bleibt jeder Fall von vor der Wahl lesbar.
  assert.equal(normalisiere("b", { step: "emri" }).paSkanim, false);

  // Und die Regeln lassen das Feld durch. Ohne diese Zeile weist hasOnly
  // das GANZE Dokument ab - der Schreibvorgang ginge still verloren, und
  // nach aussen saehe alles richtig aus.
  const regeln = lies("firestore.rules");
  const form = regeln.slice(regeln.indexOf("function lifeskinSessionShapeOk()"));
  assert.match(form.slice(0, form.indexOf("])")), /"paSkanim"/,
    "Die Regeln kennen das Feld nicht - dann faellt jeder Schreibvorgang der Sitzung aus");
  assert.match(form, /\(!\("paSkanim" in data\) \|\| data\.paSkanim is bool\)/,
    "Das Feld ist in den Regeln nicht auf seinen Typ geprueft");
});

test("Heart zeigt an der Analyse, dass keine Aufnahmen dabei sind", () => {
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  // fallMarken ist eine Funktion auf oberster Ebene, keine Methode -
  // deshalb von Hand ausgeschnitten und nicht ueber methode().
  const marken = render.slice(render.indexOf("function fallMarken("),
    render.indexOf("function renderAnalysen("));
  assert.ok(marken.length > 200, "Der Ausschnitt greift nicht mehr");
  assert.match(marken, /ohneScanGelaufen/,
    "Die Liste der Analysen unterscheidet die beiden Wege nicht");
  assert.match(marken, /pa skanim/,
    "Der Fall ohne Aufnahmen traegt keine Marke");
  // Sie steht VORNE: Wer sie sieht, macht den Fall nicht auf, um Fotos zu
  // suchen, die es nicht gibt.
  assert.match(marken, /heart-lifeskin-pill--paskanim[^`]*\$\{reihe\}/,
    "Die Marke steht hinter den anderen statt davor");
  assert.match(lies("apps/mnyra-heart/heart.css"), /\.heart-lifeskin-pill--paskanim/,
    "Die Marke hat keine eigene Farbe - dann liest sie sich wie eine erreichte Stufe");
});

// ---------------------------------------------------------------------------
// 4. Die Warteseite
// ---------------------------------------------------------------------------

test("ohne Scan steht auf der Warteseite keine Fotozahl", () => {
  const astra = lies("apps/lifeskin-astra/astra.js");
  // "0 foto" sieht aus wie ein Fehler, "3 foto" waere schlicht falsch -
  // und genau das haette der alte Ersatzwert (|| 3) daraus gemacht. Eine
  // ausdrueckliche Null ist etwas anderes als eine fehlende Zahl.
  assert.match(astra, /const ohneScan = this\.daten\.photos === 0;/,
    "Die Warteseite unterscheidet null Aufnahmen nicht von fehlenden");
  assert.match(astra, /ohneScan\s*\n?\s*\? this\.text\("pritOhneFoto"\)/,
    "Ohne Aufnahmen steht dort weiter eine Zahl");
  // Und die ersten beiden Punkte heissen anders: Was abgeschlossen ist,
  // ist die Anfrage, nicht ein Scan, den niemand gemacht hat.
  assert.match(astra, /ohneScan \? "pritHapi1Ohne" : "pritHapi1"/);
  assert.match(astra, /ohneScan \? "pritHapi2Ohne" : "pritHapi2"/);

  const texte = lies("apps/lifeskin-astra/astra-texte.js");
  for (const name of ["pritOhneFoto", "pritHapi1Ohne", "pritHapi2Ohne"]) {
    assert.match(texte, new RegExp(`${name}: \\{ sq: "[^"]+", de: "[^"]+" \\}`),
      `${name} fehlt oder steht nicht in beiden Sprachen`);
  }
});

test("der Weg ohne Scan uebergibt null Aufnahmen", () => {
  // Daran erkennt die Warteseite ihn - ohne ein zusaetzliches Feld im
  // Berichtsdokument, dessen Regel sonst mitgeaendert werden muesste.
  const uebergeben = methode(APP, "#uebergeben");
  assert.match(uebergeben, /photos: this\.zustand\.fotoAnzahl \|\| \(this\.zustand\.aufnahmen \|\| \[\]\)\.length/,
    "Die Zahl der Aufnahmen kommt nicht mehr aus dem Zustand");
});
