// MËNYRA - DER BILDSCHIRM, AUF DEM SICH ENTSCHEIDET, OB JEMAND BLEIBT.
//
// GEMESSEN, NICHT GESCHAETZT: Im Anzeigenkonto standen 222 auf der
// Landingpage und 38 beim Scan - 184 gingen bei "Skanimi" weg, mehr als
// vier von fuenf. Der erste Umbau stellte dem zwei Karten entgegen, mit
// Kamera oder ohne. Das war richtig gedacht und zu grob: "Ohne Scan" ist
// keine Absicht, sondern eine Verneinung, und niemand erkennt sich
// darin wieder.
//
// Jetzt sind es vier, und jede benennt ein Beduerfnis:
//
//   Me skanim  das ganze Gesicht, wie bisher
//   Me foto    nur die eine Stelle, die stoert
//   Trup       eine Hautstelle am Koerper, beschrieben und gezeigt
//   Pytje      nur eine Frage an die Dermatologin
//
// Diese Datei haelt vier Dinge fest, die dabei auseinanderlaufen
// koennen:
//
//   1. DER AUFBAU. Die Menyra gibt es nur auf der Seite, die /lifeskin
//      ausliefert - die beiden Fassungen davor laufen unveraendert
//      weiter, und die Anwendung entscheidet das am Aufbau und nicht an
//      einem Pfad.
//   2. DER WEG. Jede Karte fuehrt auf ihre eigene Strecke, und jede
//      Strecke hinterlaesst ihren Typ, bevor sie anfaengt.
//   3. DIE RECHNUNG. Ein Trichter zaehlt kumulativ. Bei vier Wegen wird
//      daraus eine Zahl, die in jede Richtung luegt.
//   4. WAS IN HEART ANKOMMT. Vier Arten, eine Liste - und an jedem Fall
//      muss stehen, welche Arbeit er bedeutet.

import test from "node:test";
import assert from "node:assert/strict";

import { normalisiere, baueTrichter, baueZweige, ZWEIGE, typVon, TYPEN,
  ohneScanGelaufen, TRICHTER_STUFEN, baueKauftrichter, baueMaintrichter, istPatient }
  from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { OBERFLAECHE } from "../apps/lifeskin/lifeskin-content.js";
import { lies, ohneKommentare, methode } from "./lifeskin-quelle.mjs";

const APP = ohneKommentare(lies("apps/lifeskin/lifeskin-app.js"));
const LANDING = lies("apps/lifeskin-landing/index.html");
const KURZ = lies("apps/lifeskin-trichter/index.html");
const LANG = lies("apps/lifeskin/index.html");

const menyraBlock = () => LANDING.slice(LANDING.indexOf('id="ls-wahl"'),
  LANDING.indexOf("</section>", LANDING.indexOf('id="ls-wahl"')));

// ---------------------------------------------------------------------------
// 1. Der Aufbau
// ---------------------------------------------------------------------------

test("die Menyra steht nur auf der Seite, die sie braucht", () => {
  assert.match(LANDING, /<section class="ls-schirm" id="ls-wahl" data-aktiv="nein">/,
    "Der Landingpage fehlt die Menyra");
  // Und die beiden Fassungen davor bekommen sie NICHT. Dort fuehrt der
  // Tipp weiter unmittelbar an die Kamera; ein Bildschirm dazwischen
  // kostet dort Besucher, ohne einen zweiten Weg zu eroeffnen.
  for (const [name, seite] of [["kurze Fassung", KURZ], ["lange Fassung", LANG]]) {
    assert.ok(!seite.includes('id="ls-wahl"'), `Die ${name} hat die Menyra bekommen`);
  }
});

test("drei Karten, in dieser Reihenfolge - und die empfohlene ist erkennbar", () => {
  const wahl = menyraBlock();

  const wege = [...wahl.matchAll(/data-ls-weg="([a-z-]+)"/g)].map((m) => m[1]);
  assert.deepEqual(wege, ["skanim", "foto", "trup"],
    "Die drei Wege stehen nicht in dieser Reihenfolge im Aufbau");

  // DER NIEDRIGSTE EINSTIEG STEHT UNTEN. Eine Karte, die oben steht,
  // wird zum schnellsten Weg durch den Bildschirm - und dann waehlt auch
  // der sie, der eigentlich eine Analyse wollte.
  assert.ok(wege.indexOf("trup") > wege.indexOf("skanim"));

  // DREI GLEICH AUSSEHENDE KARTEN WAEREN EINE FRAGE OHNE RAT - und eine
  // Frage ohne Rat kostet genau die Leute, die unsicher sind. SEIT DEM
  // 26.09. IST NUR NOCH DAS FOTO EMPFOHLEN: Es traegt das Schild und die
  // eigene Klasse, an der das Stilblatt Rahmen und Farbe aufzieht.
  assert.match(wahl, /class="ls-wahlkarte" data-ls-weg="skanim"/,
    "Der Scan ist wieder als empfohlen ausgezeichnet");
  assert.ok(!wahl.includes('data-text="wahlScanMarke"'), "Der Scan traegt noch ein Schild");
  assert.match(wahl, /class="ls-wahlkarte ls-wahlkarte--rat" data-ls-weg="foto">\s*(?:<!--[\s\S]*?-->\s*)?<span class="ls-wahlkarte__marke" data-text="wahlFotoMarke"/,
    "Das Foto traegt kein Schild");
  assert.match(wahl, /class="ls-wahlkarte" data-ls-weg="trup"/, "Auch Trup ist jetzt empfohlen");
  assert.equal(OBERFLAECHE.wahlFotoMarke.sq, OBERFLAECHE.wahlScanMarke.sq);
  const css = lies("apps/lifeskin-landing/landing.css");
  assert.match(css, /\.ls-wahlkarte--rat \{[^}]*border-color: var\(--basis\);/,
    "Die empfohlene Karte hebt sich nicht ab");

  // GANZE KARTEN SIND DER KNOPF, nicht ein Knopf darin: Auf einem Telefon
  // ist die Karte das Ziel, das der Daumen sucht. <button> und nicht
  // <div>, damit Tastatur und Vorleseprogramm dasselbe bekommen.
  assert.equal(wahl.match(/<button type="button" class="ls-wahlkarte/g)?.length, 3,
    "Die Karten sind keine Knoepfe - mit dem Finger ginge es, mit der Tastatur nicht");

  // DREI KARTEN BRAUCHEN EINEN ANDEREN ZUSCHNITT als zwei: Auf einem 667
  // Punkte hohen Bildschirm im Fenster von Instagram bleiben keine 560
  // uebrig, und die letzte laege darunter - also die, die den
  // niedrigsten Einstieg anbietet.
  assert.match(wahl, /class="ls-wahl ls-wahl--drei"/);
  assert.match(css, /\.ls-wahl--drei \.ls-wahlkarte \{[^}]*grid-template-columns: auto 1fr;/s,
    "Drei Karten stehen im Zuschnitt von zweien - die letzte faellt aus dem Bild");

  // Und das Zeichen des Scans ist dasselbe wie auf der Anleitung danach:
  // Wer es hier gesehen hat, erkennt es dort wieder.
  assert.match(wahl, /data-zeichen="scan-face"/, "Der Karte fehlt das Zeichen des Scans");
});

test("jeder Text der Menyra steht im Verzeichnis, in beiden Sprachen", () => {
  const schluessel = [...menyraBlock().matchAll(/data-text="([A-Za-z0-9]+)"/g)].map((m) => m[1]);
  assert.ok(schluessel.length >= 11, `Nur ${schluessel.length} Texte gefunden - die Suche greift nicht`);
  for (const name of schluessel) {
    assert.ok(OBERFLAECHE[name], `${name} steht nicht im Verzeichnis`);
    assert.ok(OBERFLAECHE[name].sq && OBERFLAECHE[name].de, `${name} fehlt in einer Sprache`);
  }
  // Jede Karte sagt, was sie ist, wofuer sie da ist und was sie kostet.
  // DREI KARTEN, NICHT VIER: "Per trupin" und "Vetem pyetje" fuehrten
  // auf denselben Bildschirm, und der Unterschied bestand aus zwei
  // Saetzen. Sie sind zusammengefuehrt.
  for (const weg of ["Scan", "Foto", "Trup"]) {
    for (const teil of ["Titel", "Text", "Punkt"]) {
      assert.ok(OBERFLAECHE[`wahl${weg}${teil}`], `wahl${weg}${teil} fehlt`);
    }
  }
});

test("kein Text der Menyra traegt das Wort, das ihn ueberschreiben wuerde", () => {
  // #texteSetzen() schreibt jeden Knoten mit data-text neu. Die Karten
  // tragen ihre Saetze in EIGENEN Kindern - stuende data-text am Knopf
  // selbst, wischte ein textContent Zeichen, Titel und Zeile darunter weg.
  assert.ok(!/<button[^>]*data-ls-weg="[a-z-]+"[^>]*data-text=/.test(menyraBlock()),
    "Eine Karte traegt data-text an sich selbst - das loescht ihren Inhalt");
});

// ---------------------------------------------------------------------------
// 2. Der Weg
// ---------------------------------------------------------------------------

test("der Tipp fuehrt an die Menyra - aber nur, wo es sie gibt", () => {
  const tippen = methode(APP, "#startTippen");
  // Geprueft wird am Aufbau und nicht an der Fassung: So laufen die
  // beiden Seiten ohne diesen Bildschirm unveraendert weiter.
  assert.match(tippen, /if \(\$\("#ls-wahl"\)\) \{/,
    "Der Tipp sucht die Menyra nicht am Aufbau");
  assert.match(tippen, /this\.sitzung\.schritt\("wahl"\);/,
    "Die Menyra hinterlaesst keine Spur - dann steht sie in keiner Zahl");
  // Und die Abkuerzung der kurzen Fassung steht DAHINTER, sonst kaeme
  // niemand je an der Menyra an.
  assert.ok(tippen.indexOf('$("#ls-wahl")') < tippen.indexOf('this.variante === "kurz"'),
    "Die kurze Fassung greift, bevor die Menyra geprueft wird");
});

test("jeder der drei Wege fuehrt auf seine eigene Strecke", () => {
  const waehlen = methode(APP, "#wegWaehlen");

  // Mit Foto: erst die eigene Anleitung, dann die Kamera dieses Wegs.
  assert.match(waehlen, /if \(weg === "foto"\) \{[\s\S]{0,200}this\.#fotoParaZeigen\(\);/,
    "Der Weg mit Foto fuehrt nicht auf seine Anleitung");
  // "Per trupin ose vetem pyetje" ist EIN Weg. Er faengt mit Name und
  // Alter an - demselben Bildschirm, den auch die zwei Wege mit
  // Aufnahme zeigen -, und das Anliegen steht danach fuer sich.
  // "pytje" bleibt als Kennung stehen: Die Vorlage traegt die alte
  // Karte, und jeder Fall von vorher traegt die alte Kennung.
  assert.match(waehlen, /if \(weg === "trup" \|\| weg === "pytje"\) \{[\s\S]{0,200}this\.#nameZeigen\(\);/,
    "Der zusammengefuehrte Weg faengt nicht bei Name und Alter an");
  // Mit Scan: die Anleitung, wenn es sie gibt - sonst unmittelbar die
  // Kamera. Am Aufbau geprueft, nicht an der Fassung.
  assert.match(waehlen, /if \(\$\("#ls-vorbereitung"\)\) \{/);
  assert.match(waehlen, /this\.sitzung\.schritt\("named"\);/);
  assert.match(waehlen, /this\.#kameraStarten\(\);/);

  // Die alte Karte der Vorlage lebt weiter: Eine Seite, die es noch
  // gibt, darf nicht in eine leere Anzeige laufen.
  assert.match(waehlen, /if \(weg === "pa-skanim"\) \{/);
});

test("der Typ wird geschrieben, bevor es weitergeht", () => {
  // Ohne ihn steht in Heart ein Fall, und niemand weiss, was er ist: ein
  // misslungener Scan, ein Foto einer Wange oder eine Frage ohne Bild -
  // drei Faelle, die drei verschiedene Antworten brauchen.
  const merken = methode(APP, "#wegMerken");
  // ZWEI SCHREIBVORGAENGE, NICHT EINER.
  //
  // GESEHEN, NICHT BEFUERCHTET: hasOnly() weist das GANZE Dokument ab,
  // sobald ein Feld darin steht, das die Regel nicht kennt. Ein
  // brandneues Feld, das mit einem alten zusammen hinausgeht, nimmt das
  // alte mit in den Abgrund - lautlos, denn der Trichter wartet auf kein
  // Ja. Getrennt kostet eine Regel, die noch nicht deployt ist, genau
  // das neue Feld und nichts sonst.
  assert.match(merken, /this\.sitzung\.ergaenze\(\{ paSkanim: this\.zustand\.paSkanim \}\);/,
    "Die alte Marke reist mit dem neuen Feld zusammen");
  assert.match(merken, /this\.sitzung\.ergaenze\(\{ typ \}\);/,
    "Der Weg hinterlaesst keinen Typ");
  // paSkanim BLEIBT: Jede Zahl von vor der Menyra haengt daran, und ein
  // Fall mit Foto hat trotzdem keinen Gesichtsscan gemacht.
  assert.match(merken, /this\.zustand\.paSkanim = typ !== "scan";/);
  assert.match(merken, /this\.pixel\.meldeWeg\(typ\);/,
    "Der gewaehlte Weg wird nicht gemeldet - dann steht im Anzeigenkonto eine Zahl fuer alle vier");

  // EINE STELLE FUER ALLE VIER. An vier Stellen geschrieben waere die
  // dritte davon frueher oder spaeter nur an dreien.
  const waehlen = methode(APP, "#wegWaehlen");
  assert.equal((waehlen.match(/#wegMerken\(/g) || []).length, 4,
    "Nicht jeder Weg hinterlaesst seinen Typ ueber dieselbe Stelle");
});

test("die Karten haengen an einem Merkmal, nicht an vier Kennungen", () => {
  // So kostet eine fuenfte Karte keine fuenfte Zeile in der Anwendung.
  assert.match(APP, /for \(const karte of \$\$\("\[data-ls-weg\]"\)\) \{/,
    "Die Karten sind einzeln angebunden");
  assert.match(APP, /this\.#wegWaehlen\(karte\.dataset\.lsWeg\)/);
});

test("Me foto: Anleitung, Aufnahme, Vorschau - und erst dann Name und Alter", () => {
  assert.match(methode(APP, "#fotoParaZeigen"), /this\.sitzung\.schritt\("fotopara"\);/);
  const starten = methode(APP, "#fotoStarten");
  assert.match(starten, /this\.sitzung\.schritt\("fotokamera"\);/);
  assert.match(starten, /new Flaechenkamera\(/,
    "Der Weg mit Foto benutzt die Kamera des Scans");

  // Das Bild bleibt nach dem Ausloesen STEHEN, und der Strom geht aus:
  // Eine Kamera, die hinter einer Vorschau weiterlaeuft, leert den Akku
  // und laesst die Leuchte an.
  const ausloesen = methode(APP, "#fotoAusloesen");
  assert.match(ausloesen, /this\.flaeche\?\.stoppe\(\);/);
  assert.match(ausloesen, /this\.#fotoVorschauZeigen\(aufnahme\.vorschau\);/);

  // Erst "Përdor foton" macht den Fall daraus.
  const nehmen = methode(APP, "#fotoNehmen");
  assert.match(nehmen, /this\.sitzung\.schritt\("fotogati"\);/);
  assert.match(nehmen, /this\.sitzung\.fotosSpeichern\(\{ zona: aufnahme\.foto \}\)/);
  assert.match(nehmen, /this\.#nameZeigen\(\);/);
  // Und "Bëje përsëri" wirft die alte Aufnahme weg - sonst ginge sie
  // mit hinaus, wenn der zweite Versuch scheitert.
  assert.match(methode(APP, "#fotoNochmal"), /this\.zustand\.stelleFoto = null;/);
});

test("Per trupin ose vetem pyetje: Name und Alter, dann das Anliegen", () => {
  const zeigen = methode(APP, "#anliegenZeigen");
  assert.match(zeigen, /const pytje = this\.zustand\.typ === "pytje";/);
  assert.match(zeigen, /anliegenPytjeTitel" : "anliegenTrupTitel/);
  assert.match(zeigen, /anliegenPytjePlatzhalter" : "anliegenTrupPlatzhalter/);
  // EIGENER SCHRITT, EIGENER BILDSCHIRM. Er hiess einmal "emri", weil
  // Name und Alter mit darauf standen; sie stehen jetzt davor, und was
  // hier gezaehlt wird, ist allein das Anliegen.
  assert.match(zeigen, /this\.sitzung\.schritt\("problemi"\);/);

  // Der Knopf bleibt zu, bis der Text dasteht: Ein Fall ohne Text ist
  // auf diesem Weg eine leere Akte. Name und Alter prueft der
  // Bildschirm davor.
  const pruefen = methode(APP, "#anliegenPruefen");
  assert.match(pruefen, /this\.#anliegenLesen\(\)\.length >= 5/);
  assert.ok(!/altersgruppe/.test(pruefen),
    "Der Anliegenschirm prueft die Altersgruppe - die steht auf dem Bildschirm davor");

  // Der Text geht in das Feld, das zu seinem Weg gehoert - und in einem
  // EIGENEN Schreibvorgang. Stuenden Name, Alter und Anamnese daneben,
  // waere der Fall bei einer nachhinkenden Regel vollstaendig leer.
  const weiter = methode(APP, "#anliegenWeiter");
  assert.match(weiter, /this\.sitzung\.ergaenze\(pytje \? \{ pyetja: kurz \} : \{ problemi: kurz \}\);/);
  // Und der Knopf fuehrt weiter, was auch immer beim Schreiben
  // schiefgeht: Ein Knopf, der wegen einer Zaehlung stehenbleibt, ist
  // der teuerste Fehler, den dieser Trichter machen kann.
  assert.match(weiter, /this\.#telZeigen\(\)/);
  assert.ok(weiter.indexOf("catch") < weiter.indexOf("this.#telZeigen()"),
    "Der Schritt nach vorn steht innerhalb des Versuchs");

  // Name und Alter gehen auf dem Bildschirm DAVOR hinaus - zusammen mit
  // der Anamnese, die der Bogen in Heart liest.
  const name = methode(APP, "#nameWeiter");
  assert.match(name, /anamnese: this\.fragen\.antworten/);
  assert.match(name, /if \(this\.#trupWeg\(\)\) \{ this\.#anliegenZeigen\(\); return; \}/);

  // Und das Foto bleibt freiwillig: Genau an einer Pflicht zum Foto
  // geht der verloren, der diesen Weg gewaehlt hat, weil er keines
  // machen wollte.
  assert.ok(!/stelleFoto/.test(pruefen), "Ohne Foto geht es nicht weiter");
});

test("die Nummer steht zuletzt und auf einem eigenen Bildschirm", () => {
  const zeigen = methode(APP, "#telZeigen");
  assert.match(zeigen, /this\.sitzung\.schritt\("numri"\);/);
  const weiter = methode(APP, "#telWeiter");
  // Gelesen wird IM FELD und nicht im mitgefuehrten Zustand: Was der
  // Browser selbst einsetzt (Autofill, Einfuegen ueber das
  // Kontextmenue), loest kein input-Ereignis aus - der Besucher sah
  // seine Nummer stehen und einen Knopf, der nichts tat.
  // Seit Viber dazukam (24.09.) prueft #nummernPruefen beide Felder -
  // WhatsApp weiter direkt aus dem Feld gelesen.
  assert.match(weiter, /this\.#nummernPruefen\(\)/);
  const pruefen = methode(APP, "#nummernPruefen");
  assert.match(pruefen, /const wa = this\.#telLesen\(\);/);
  assert.match(pruefen, /telefonPruefen\(wa, LIFESKIN_TELEFON_VORWAHL\)/);
  // Die Einwilligung geht mit, wie auf dem Weg mit Scan: Er hat die
  // Nummer selbst und ausdruecklich dafuer hinterlassen, dass sich
  // jemand meldet. Ohne sie stuende jeder Fall dieser zwei Wege in Heart
  // als "nicht eingewilligt", und niemand duerfte anrufen.
  assert.match(weiter, /this\.sitzung\.ergaenze\(\{ phone: geprueft\.nummer, phoneConsent: true \}\);/);
  assert.match(weiter, /this\.pixel\.meldeLead\(\);/,
    "Die Nummer meldet kein Lead - darauf optimieren die Anzeigen");
  // WOHIN ES VON HIER AUS GEHT, HAENGT AM WEG: Mit Aufnahme kommt die
  // Ladeseite, auf dem zusammengefuehrten Weg die Uebergabe.
  assert.match(weiter, /if \(this\.#trupWeg\(\)\) \{ this\.#uebergeben\(\); return; \}/);
  assert.match(weiter, /this\.#analyseZeigen\(\);/);
});

// DIE NUMMER GILT JETZT FUER JEDEN WEG.
//
// Sie stand auf zwei von vier Wegen; wer mit Scan oder Foto kam, wurde
// nie danach gefragt. Sein Befund konnte ihn danach nicht erreichen -
// von 32 fertigen Analysen haben 13 ihre je geoeffnet, genau die 13,
// die erreichbar waren.
test("die Nummer steht auf jedem Weg vor dem Abschluss", () => {
  const name = methode(APP, "#nameWeiter");
  assert.ok(!/this\.#uebergeben\(\)/.test(name),
    "Ein Weg springt an der Nummer vorbei in die Uebergabe");
  assert.match(name, /if \(!this\.#telZeigen\(\)\) this\.#analyseZeigen\(\);/,
    "Nach Name und Alter kommt nicht die Nummer");

  // Und der Bildschirm steht in beiden Fassungen, die ihn brauchen.
  for (const [name2, seite] of [["Landingpage", LANDING], ["kurze Fassung", KURZ]]) {
    assert.ok(seite.includes('id="ls-tel"'), `Der ${name2} fehlt der Nummernbildschirm`);
  }
});

// ---------------------------------------------------------------------------
// 3. Die Rechnung
// ---------------------------------------------------------------------------

// EIN TRICHTER ZAEHLT KUMULATIV - und genau daran waere er hier kaputt
// gegangen. Wer nur eine Frage stellt, ist weiter als "camera" in der
// Schrittfolge; eine Stufe "Skanimi" haette ihn also mitgezaehlt,
// obwohl er die Kamera nie gesehen hat.
test("die Wege stehen in keiner Stufe des gemeinsamen Trichters", () => {
  const ids = TRICHTER_STUFEN.map((s) => s.id);
  for (const weg of ["camera", "captured", "fotopara", "fotogati"]) {
    assert.ok(!ids.includes(weg), `${weg} steht im gemeinsamen Trichter und zaehlt die anderen Wege mit`);
  }
  assert.ok(ids.includes("wahl"), "Die Menyra steht nicht im Trichter");
  assert.ok(ids.indexOf("wahl") < ids.indexOf("emri"),
    "Die Menyra steht hinter Name und Alter - sie kommt aber davor");
});

test("der Trichter wird nie breiter, egal welche Wege gegangen werden", () => {
  const sitzungen = [
    ...Array.from({ length: 10 }, (_, i) =>
      normalisiere(`o${i}`, { step: "result", typ: "pytje", warteseiteGeoeffnet: true })),
    ...Array.from({ length: 2 }, (_, i) =>
      normalisiere(`m${i}`, { step: "result", typ: "scan", photos: ["gerade"], warteseiteGeoeffnet: true })),
    ...Array.from({ length: 8 }, (_, i) => normalisiere(`a${i}`, { step: "opened" }))
  ];
  const trichter = baueTrichter(sitzungen);
  for (let i = 1; i < trichter.length; i += 1) {
    assert.ok(trichter[i].anzahl <= trichter[i - 1].anzahl,
      `Stufe ${trichter[i].id} (${trichter[i].anzahl}) ist breiter als ${trichter[i - 1].id} (${trichter[i - 1].anzahl})`);
  }
  const nach = (id) => trichter.find((s) => s.id === id).anzahl;
  assert.equal(nach("gesehen"), 20);
  assert.equal(nach("wahl"), 12, "Die Menyra haben zwoelf gesehen - alle Wege zusammen");
  assert.equal(nach("emri"), 12);
});

test("jeder Zweig zaehlt fuer sich, mit den Bildschirmen, die es dort gibt", () => {
  // DREI TRICHTER, NICHT VIER: "Trup" und "Pytje" sind ein Weg. Beide
  // Kennungen stehen darin, weil jeder Fall von vorher eine der beiden
  // traegt - eine Auswertung, die die Vergangenheit wegwirft, ist keine.
  assert.deepEqual(ZWEIGE.map((z) => z.id), ["scan", "foto", "trup"]);
  assert.deepEqual(ZWEIGE.find((z) => z.id === "trup").typen, ["trup", "pytje"]);

  // Jeder Zweig endet beim Patienten - der Warteseite, ab der ein Fall
  // vollstaendig abgegeben ist.
  for (const zweig of ZWEIGE) {
    assert.equal(zweig.stufen.at(-1).patient, true, `${zweig.id} endet nicht beim Patienten`);
    assert.equal(zweig.stufen.at(-1).label, "Patient");
  }
  // DIE NUMMER STEHT AUF JEDEM WEG - sie ist seit dieser Aenderung
  // Pflicht, und ohne sie erreicht der Befund niemanden.
  for (const zweig of ZWEIGE) {
    assert.ok(zweig.stufen.some((s) => s.id === "numri"),
      `${zweig.id} fragt nicht nach der Nummer`);
  }
  // Die zwei Wege mit Aufnahme fragen die Systemfrage der Kamera ab -
  // dort liegt ihr groesster einzelner Verlust.
  for (const id of ["scan", "foto"]) {
    const stufen = ZWEIGE.find((z) => z.id === id).stufen.map((s) => s.id);
    assert.deepEqual(stufen.slice(1, 3), ["kameraOk", id === "scan" ? "captured" : "fotogati"]);
    assert.ok(stufen.includes("aufbereitung"), `${id} hat keine Ladeseite`);
  }
  assert.ok(ZWEIGE.find((z) => z.id === "trup").stufen.every((s) => s.ab !== "captured"),
    "Der Weg ohne Kamera traegt eine Stufe des Scans");

  const zweige = baueZweige([
    // Zehn sehen die Anleitung, sechs geben die Kamera frei, vier kommen an.
    ...Array.from({ length: 10 }, (_, i) => normalisiere(`s${i}`, { step: "named", typ: "scan" })),
    ...Array.from({ length: 6 }, (_, i) =>
      normalisiere(`sf${i}`, { step: "captured", typ: "scan", kameraOk: true })),
    ...Array.from({ length: 4 }, (_, i) => normalisiere(`sa${i}`,
      { step: "result", typ: "scan", kameraOk: true, photos: ["gerade"], warteseiteGeoeffnet: true })),
    // Fuenf mit Foto, zwei kommen an.
    ...Array.from({ length: 3 }, (_, i) => normalisiere(`f${i}`, { step: "fotopara", typ: "foto" })),
    ...Array.from({ length: 2 }, (_, i) =>
      normalisiere(`fa${i}`, { step: "result", typ: "foto", warteseiteGeoeffnet: true })),
    // Einer waehlt und tut nichts mehr - er zaehlt im Nenner, in keinem
    // Zweig weiter als bei der Menyra.
    normalisiere("x", { step: "wahl" })
  ]);
  const nach = (id) => zweige.find((z) => z.id === id);

  assert.equal(nach("scan").anzahl, 20);
  assert.equal(nach("scan").fertig, 4);
  assert.equal(nach("foto").anzahl, 5);
  assert.equal(nach("foto").fertig, 2);
  assert.equal(nach("trup").anzahl, 0);

  // DER UEBERGANG, NICHT DER ANTEIL AM ANFANG. "Anleitung 20 -> Kamera
  // akzeptiert 10" heisst 50 %, und das ist die Zahl, die sagt, wo die
  // Leute weggehen - hier an der Systemfrage des Browsers, die der
  // Trichter bis dahin nicht kannte.
  const kamera = nach("scan").stufen.find((s) => s.id === "kameraOk");
  assert.equal(kamera.anzahl, 10);
  assert.equal(Number(kamera.uebergang.toFixed(4)), 0.5);
  assert.equal(Number(kamera.verlust.toFixed(4)), 0.5);
  // Und wer sie freigegeben hat, bringt den Scan auch zu Ende.
  const skanimi = nach("scan").stufen.find((s) => s.id === "captured");
  assert.equal(skanimi.anzahl, 10);
  assert.equal(Number(skanimi.uebergang.toFixed(4)), 1);
  // Die erste Stufe hat keinen Uebergang - es gibt nichts davor.
  assert.equal(nach("scan").stufen[0].uebergang, 1);
  assert.equal(nach("scan").stufen[0].verlust, 0);

  // Der Durchsatz des ganzen Wegs: von der Anleitung bis zum Patienten.
  assert.equal(Number(nach("scan").durchsatz.toFixed(4)), 0.2);
  assert.equal(Number(nach("foto").durchsatz.toFixed(4)), 0.4);

  // Und der Anteil an der Menyra sagt, ob eine Karte gebraucht wird.
  assert.equal(Number(nach("foto").anteil.toFixed(4)), Number((5 / 26).toFixed(4)));

  // EIN TRICHTER WIRD NIE BREITER. Kumulativ gezaehlt, wie jeder
  // Trichter - sonst waere eine Stufe groesser als die davor, und das
  // liest sich als Fehler.
  for (const zweig of zweige) {
    for (let i = 1; i < zweig.stufen.length; i += 1) {
      assert.ok(zweig.stufen[i].anzahl <= zweig.stufen[i - 1].anzahl,
        `${zweig.id}: ${zweig.stufen[i].id} ist breiter als ${zweig.stufen[i - 1].id}`);
    }
  }
});

// DER KAUFWEG - der zweite Weg durch dieselbe Seite.
test("der Kauftrichter zaehlt den Laden, nicht den Analyseweg", () => {
  const trichter = baueKauftrichter([
    // Zehn auf der Landingpage, sechs sehen die Mittel, drei legen etwas
    // in den Korb, zwei fangen die Anschrift an, einer bestellt.
    ...Array.from({ length: 4 }, (_, i) => normalisiere(`l${i}`, { step: "opened" })),
    ...Array.from({ length: 3 }, (_, i) =>
      normalisiere(`p${i}`, { step: "opened", produkteGesehen: true })),
    normalisiere("k1", { step: "opened", produkteGesehen: true, imKorb: true, korbWert: 33 }),
    normalisiere("a1", { step: "opened", imKorb: true, adresseBegonnen: true }),
    normalisiere("b1", { step: "ordered", shopKauf: true, imKorb: true,
      order: { orderId: "x", total: 66, createdAt: new Date().toISOString() } })
  ]);
  const nach = (id) => trichter.find((s) => s.id === id).anzahl;
  assert.deepEqual(trichter.map((s) => s.label),
    ["Landing", "Produkte", "Warenkorb", "Anschrift", "Kauf"]);
  assert.equal(nach("landing"), 10);
  assert.equal(nach("produkte"), 6);
  assert.equal(nach("warenkorb"), 3);
  assert.equal(nach("anschrift"), 2);
  assert.equal(nach("kauf"), 1);
});

// EIN EINKAUF IM LADEN IST KEINE ANALYSE.
test("wer nur eingekauft hat, steht in keinem Analysetrichter", () => {
  const kauf = normalisiere("b", { step: "ordered", shopKauf: true, imKorb: true,
    order: { orderId: "x", total: 53, createdAt: new Date().toISOString() } });
  assert.equal(typVon(kauf), "", "Der Direktkauf bekommt einen Analyseweg zugeschrieben");
  assert.equal(istPatient(kauf), false, "Der Direktkauf zaehlt als abgeschlossene Analyse");
  const main = baueMaintrichter([kauf]);
  assert.equal(main.find((s) => s.id === "landing").anzahl, 1);
  assert.equal(main.find((s) => s.id === "patient").anzahl, 0);
});

// ---------------------------------------------------------------------------
// 4. Was in Heart ankommt
// ---------------------------------------------------------------------------

test("die vier Arten sind dieselben vier wie im Trichter", () => {
  assert.deepEqual(TYPEN.map((t) => t.id), ["scan", "foto", "trup", "pytje"]);
  // Die Kennung am Knopf und die im Dokument sind gleich - ein
  // Uebersetzungsschritt dazwischen waere eine Stelle, an der ein Weg
  // still zum anderen wird.
  assert.match(APP, /export const WEG_ZU_TYP = Object\.freeze\(\{\s*skanim: "scan", foto: "foto", trup: "trup", pytje: "pytje"/);
});

test("der Typ kommt bis nach Heart durch - und die Vergangenheit bleibt lesbar", () => {
  assert.equal(normalisiere("a", { step: "emri", typ: "foto" }).typ, "foto");
  assert.equal(typVon(normalisiere("a", { step: "emri", typ: "pytje" })), "pytje");

  // OHNE TYP UND NOCH NICHT GEWAEHLT: kein Weg. Ihn einem zuzuschlagen
  // hiesse, eine Entscheidung zu erfinden - und der Zweig, in dem er
  // landet, saehe breiter aus als er ist.
  assert.equal(typVon(normalisiere("b", { step: "wahl" })), "");
  assert.equal(typVon(normalisiere("c", { step: "opened" })), "");

  // Ohne Typ und schon weiter: ein Fall von vor der Menyra. Mit
  // Aufnahmen war es ein Scan, ohne war es der alte Weg "pa skanim".
  assert.equal(typVon(normalisiere("d", { step: "camera" })), "scan");
  assert.equal(typVon(normalisiere("e", { step: "result", photos: ["gerade"] })), "scan");
  assert.equal(typVon(normalisiere("f", { step: "result" })), "trup");

  // Und die Regeln lassen das Feld durch. Ohne diese Zeile weist hasOnly
  // das GANZE Dokument ab - der Schreibvorgang ginge still verloren, und
  // nach aussen saehe alles richtig aus.
  const regeln = lies("firestore.rules");
  const form = regeln.slice(regeln.indexOf("function lifeskinSessionShapeOk()"));
  assert.match(form.slice(0, form.indexOf("])")), /"typ"/,
    "Die Regeln kennen das Feld nicht - dann faellt jeder Schreibvorgang der Sitzung aus");
  assert.match(form, /data\.typ in \["scan", "foto", "trup", "pytje"\]/,
    "Das Feld ist in den Regeln nicht auf seine vier Werte geprueft");
  // Und der Text, den Trup und Pytje schreiben, ebenfalls.
  for (const feld of ["problemi", "pyetja"]) {
    assert.match(form.slice(0, form.indexOf("])")), new RegExp(`"${feld}"`), `${feld} fehlt in den Regeln`);
  }
});

// DER SCHREIBVORGANG, DER STILL SCHEITERT.
//
// GESEHEN, NICHT BEFUERCHTET: Nach dem ersten Livegang standen 55 an der
// Wahl, "Pa skanim" auf null - und der Betreiber hatte den Weg selbst
// mehrmals genommen. hasOnly() in den Firestore-Regeln weist das GANZE
// Dokument ab, sobald ein Feld darin steht, das die Regel nicht kennt.
// Solange "paSkanim" nicht deployt war, ging die Marke jedes Mal
// verloren - lautlos, denn der naechste Schritt kam wieder durch.
test("ein Fall ohne Aufnahmen zaehlt als Fall ohne Scan, auch ohne Marke", () => {
  assert.equal(ohneScanGelaufen(normalisiere("a", { step: "result" })), true,
    "Ein Fall ohne Aufnahmen wird nur an der Marke erkannt");
  assert.equal(ohneScanGelaufen(normalisiere("b", { step: "result", paSkanim: true })), true);
  assert.equal(ohneScanGelaufen(normalisiere("c", { step: "result", photos: ["gerade"] })), false,
    "Ein Fall MIT Aufnahmen gilt als Fall ohne Scan");

  // UND DIE GRENZE: Wer die Kamera geoeffnet und dann abgebrochen hat,
  // hat ebenfalls keine Bilder - der hat den Scan aber GEWAEHLT und ist
  // an ihm gescheitert. Zwei verschiedene Dinge, zwei verschiedene
  // Zahlen.
  assert.equal(ohneScanGelaufen(normalisiere("d", { step: "camera" })), false,
    "Der Abbruch an der Kamera zaehlt als Weg ohne Scan");
  assert.equal(ohneScanGelaufen(normalisiere("e", { step: "captured" })), false);
});

test("dieselbe Frage wird an beiden Stellen gleich beantwortet", () => {
  // Der Rueckfall in typVon() und die Marke an der einzelnen Fallzeile
  // muessen dasselbe sagen. Zwei Kopien dieser Regel liefen frueher oder
  // spaeter auseinander - deshalb EINE Funktion.
  // Ohne Kommentarzeilen gelesen: Die Erklaerung ueber der Zeile nennt
  // das Feld, das hier gerade NICHT gelesen werden soll, und darauf
  // schluege jede Suche an.
  const render = ohneKommentare(lies("apps/mnyra-heart/heart-lifeskin-render.js"));
  assert.match(render, /ohneScanGelaufen/, "Die Marke fragt nicht dieselbe Funktion");
  const marken = render.slice(render.indexOf("function fallMarken("),
    render.indexOf("function fallZeile("));
  // UND SIE STEHT NUR NOCH AN EINEM FALL OHNE TYP.
  //
  // An einem Fotofall waere sie falsch: Er hat eine Aufnahme, nur keinen
  // Scan. Wer sie dort liest, macht den Fall nicht auf und sieht das
  // Bild nie. Was der Fall ist, sagt seit der Menyra die Art daneben -
  // genauer, als eine Marke es koennte.
  assert.match(marken, /if \(sitzung\.typ \|\| !ohneScanGelaufen\(sitzung\)\) return reihe;/,
    "Die Marke haengt wieder allein am Feld, das verloren gehen kann");
  assert.ok(!/sitzung\.paSkanim/.test(marken),
    "Die Marke liest das Feld wieder unmittelbar");
});

test("Heart zeigt an jedem Fall, welche Arbeit er bedeutet", () => {
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  const marke = render.slice(render.indexOf("function artMarke("),
    render.indexOf("function vorschauFeld("));
  assert.match(marke, /typVon\(sitzung\)/, "Die Art wird nicht aus dem Fall gelesen");
  // Seit 24.09. ein Chip in derselben Schrift wie die anderen.
  assert.match(marke, /heart-lifeskin-art--/, "Die Art hat keine eigene Klasse");
  assert.match(lies("apps/mnyra-heart/heart.css"), /\.heart-lifeskin-art \{/,
    "Die Art hat keine eigene Form - dann liest sie sich wie ein Teil der Fallnummer");

  // BEI TRUP UND PYTJE STEHT SEIN TEXT IN DER ZEILE, nicht die drei
  // Marken: Bei einem Scan sieht man auf das Bild, bei einer Frage auf
  // den Satz.
  const zeile = render.slice(render.indexOf("function fallZeile("),
    render.indexOf("function renderAnalysen("));
  assert.match(zeile, /typ === "trup" \|\| typ === "pytje"/);
  assert.match(zeile, /sitzung\.pyetja \|\| sitzung\.problemi/);
});

// ---------------------------------------------------------------------------
// 5. Die Warteseite
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
  // Und die ersten beiden Punkte heissen anders, sobald es KEIN Scan
  // war: Was abgeschlossen ist, ist die Anfrage.
  assert.match(astra, /typ && typ !== "scan" \|\| ohneScan \? "pritHapi1Ohne" : "pritHapi1"/);
  assert.match(astra, /typ && typ !== "scan" \|\| ohneScan \? "pritHapi2Ohne" : "pritHapi2"/);

  const texte = lies("apps/lifeskin-astra/astra-texte.js");
  for (const name of ["pritOhneFoto", "pritHapi1Ohne", "pritHapi2Ohne"]) {
    assert.match(texte, new RegExp(`${name}: \\{ sq: "[^"]+", de: "[^"]+" \\}`),
      `${name} fehlt oder steht nicht in beiden Sprachen`);
  }
});

test("der Typ geht in den Bericht - die Warteseite darf die Sitzung nicht lesen", () => {
  // In der Sitzung stehen Telefonnummer und Anschrift; die Warteseite
  // liest deshalb nur den Bericht. Ohne den Typ dort stuende auf ihr
  // "Ihre Analyse wird vorbereitet" auch fuer den, der nur eine Frage
  // gestellt hat - und der wartet dann auf etwas, das nie kommt.
  const uebergeben = methode(APP, "#uebergeben");
  assert.match(uebergeben, /typ: this\.zustand\.typ \|\| "scan",/);
  assert.match(lies("apps/lifeskin/lifeskin-session.js"),
    /typ: \["scan", "foto", "trup", "pytje"\]\.includes\(typ\) \? typ : "scan",/);

  const regeln = lies("firestore.rules");
  const bericht = regeln.slice(regeln.indexOf("function lifeskinBerichtNeu()"));
  assert.match(bericht.slice(0, bericht.indexOf("])")), /"typ"/,
    "Die Regeln lassen den Typ im Bericht nicht durch - dann scheitert das Anlegen ganz");
});

test("der Weg ohne Aufnahmen uebergibt null Aufnahmen", () => {
  // Daran erkennt die Warteseite ihn zusaetzlich zum Typ - ohne ein
  // weiteres Feld im Berichtsdokument.
  const uebergeben = methode(APP, "#uebergeben");
  assert.match(uebergeben, /photos: this\.zustand\.fotoAnzahl \|\| \(this\.zustand\.aufnahmen \|\| \[\]\)\.length/,
    "Die Zahl der Aufnahmen kommt nicht mehr aus dem Zustand");
});

// ---------------------------------------------------------------------------
// 5. Die Warteseite fragt nicht noch einmal nach der Nummer
// ---------------------------------------------------------------------------

test("wer die Nummer im Trichter gegeben hat, wird auf der Warteseite nicht erneut gefragt", () => {
  // GESEHEN, NICHT BEFUERCHTET: Auf Trup und Pytje verlangt der Trichter
  // die Nummer auf einem eigenen Bildschirm - ohne gueltige Nummer geht
  // er nicht weiter. Einen Bildschirm spaeter stand auf der Warteseite
  // "Ku t'ju njoftojmë?" und darueber "Rezultati juaj — nuk niset dot pa
  // kontakt": das Gegenteil dessen, was gerade passiert war.
  //
  // Der Grund ist der Aufbau und kein Versehen: Die Nummer steht in der
  // SITZUNG, und die darf diese Seite nicht lesen - dort stehen Nummer
  // und Anschrift, und der Link zur Analyse ist zum Weitergeben gemacht.
  // Der Bericht traegt sie nicht und soll sie nicht tragen.
  //
  // SEIT DIE NUMMER AUF JEDEM WEG GEFRAGT WIRD, reicht der Typ nicht
  // mehr: Auch mit Scan und mit Foto steht sie laengst da. Der Trichter
  // schreibt deshalb eine Marke in den Bericht - nicht die Nummer
  // selbst, sondern nur, DASS eine da ist.
  //
  // Der Typ bleibt als Netz darunter: Jeder Fall von vor dieser
  // Aenderung traegt die Marke nicht, und auf Trup und Pytje wurde die
  // Nummer schon damals im Trichter genommen.
  const astra = ohneKommentare(lies("apps/lifeskin-astra/astra.js"));
  const sitzung = ohneKommentare(lies("apps/lifeskin/lifeskin-session.js"));

  assert.match(astra, /if \(this\.daten\?\.numri === true\) return true;/,
    "Die Warteseite liest die Marke des Trichters nicht");
  assert.match(astra, /return \["trup", "pytje"\]\.includes\(String\(this\.daten\?\.typ \|\| ""\)\);/,
    "Die Faelle von vorher fallen aus der Erkennung");
  // Und die Marke reist im Bericht mit - als Wahrheitswert, nicht als
  // Nummer: Der Link zur Analyse ist zum Weitergeben gemacht.
  assert.match(sitzung, /numri: numri === true/);
  assert.match(APP, /numri: this\.zustand\.nummerGegeben === true/);
  // Ein brandneues Feld reist nie mit Daten, die ankommen muessen: Der
  // zweite Versuch laesst es weg, wie den Typ daneben.
  assert.match(sitzung, /delete ohneTyp\.numri;/);
  assert.match(astra, /get erreichbar\(\) \{[\s\S]{0,160}\|\| this\.nummerImTrichter;/,
    "Erreichbarkeit haengt weiter allein an Feldern, die im Bericht stehen");

  // Sperre, vierter Punkt und Ueberschrift haengen alle an erreichbar -
  // eine Stelle, damit nicht eine davon stehen bleibt.
  const sperre = methode(astra, "#pritSperre");
  assert.match(sperre, /const offen = !this\.erreichbar;/);

  const tor = methode(astra, "#pritTorPruefen");
  assert.match(tor, /const ausTrichter = !nummer && !wa && this\.nummerImTrichter;/,
    "Das Tor kennt den dritten Fall nicht");
  assert.match(tor, /if \(!nummer && !wa && !ausTrichter\) \{/,
    "Das Tor geht trotz gegebener Nummer auf");

  // Und der Satz darunter nennt keine Nummer, die diese Seite nicht hat:
  // "... te ." mit leerer Stelle waere schlimmer als der allgemeinere Satz.
  assert.match(tor, /this\.text\(ausTrichter \? "pritGatiNumriLene" : "pritGatiWa"\)/,
    "Die Bestaetigung setzt eine Nummer ein, die hier niemand kennt");
  const texte = lies("apps/lifeskin-astra/astra-texte.js");
  assert.match(texte, /pritGatiNumriLene: \{\s*sq: "[^"]+",\s*de: "[^"]+"/,
    "pritGatiNumriLene fehlt oder steht nicht in beiden Sprachen");
  assert.ok(!/pritGatiNumriLene: \{[\s\S]{0,200}\{numri\}/.test(texte),
    "Der Satz setzt eine Nummer ein, die auf dieser Seite nicht vorliegt");
});
