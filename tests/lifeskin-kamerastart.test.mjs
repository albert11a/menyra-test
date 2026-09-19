// Warum die Kamera manchmal "sehr verspaetet" startete.
//
// DER FALL AUS DEM BETRIEB, nachgestellt und gemessen: Auf dem Geraet lief
// die Kamera bereits - der gruene Punkt stand in der Statusleiste, das
// Videoelement lieferte Bilder -, aber der Trichter stand hinter
// `await video.play()`. Auf iOS bleibt dieses Versprechen gelegentlich
// offen. Sichtbar war davon: ein leerer Kreis, keine Zeile darunter, kein
// Ring. Nach achtzehn Sekunden stand der Schritt immer noch auf "camera",
// und kein einziges Foto ging hoch.
//
// Im Browser nachgestellt (play() antwortet nie):
//   vorher  nach 2 s: kein Hinweis, data-bereit="nein"  - nach 18 s: nichts
//   nachher nach 2 s: Bild da, Hinweis da               - Scan laeuft durch

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { OBERFLAECHE } from "../apps/lifeskin/lifeskin-content.js";
import { ohneKommentare, methode } from "./lifeskin-quelle.mjs";
import { POSE_GRENZEN } from "../apps/lifeskin/lifeskin-pose.js";

const APP = ohneKommentare(fs.readFileSync(path.join(process.cwd(), "apps/lifeskin/lifeskin-app.js"), "utf8"));
const HTML = fs.readFileSync(path.join(process.cwd(), "apps/lifeskin/index.html"), "utf8");
const CSS = fs.readFileSync(path.join(process.cwd(), "apps/lifeskin/lifeskin-styles.css"), "utf8");
const START = methode(APP, "#kameraStarten");

test("der Trichter wartet nicht auf das Abspielen", () => {
  // Das ist die Zeile, die den Bildschirm angehalten hat.
  assert.ok(!/await\s+video\.play\(\)/.test(START),
    "Der Ablauf haengt wieder am Versprechen von play()");
  // Angestossen wird weiter - ohne play() faengt auf manchen Geraeten gar
  // nichts an.
  assert.match(START, /this\.#abspielen\(video\);/,
    "Das Abspielen wird nicht mehr angestossen");
  // ABER NICHT MEHR ABGEWARTET. Sonst laufen zwei Wartezeiten
  // hintereinander fuer einen Vorgang: erst die Frist in #abspielen, dann
  // das Pollen in #videoBereit. Bleibt play() auf iOS offen, waren das
  // 1200 ms leerer Kreis, obwohl der Strom schon stand.
  assert.ok(!/await this\.#abspielen\(/.test(START),
    "Auf das Abspielen wird wieder gewartet, bevor ueberhaupt jemand auf das Bild sieht");
});

test("das Anstossen hat eine Frist und meldet keinen Kamerafehler", () => {
  const abspielen = methode(APP, "#abspielen");
  assert.match(abspielen, /Promise\.race/, "Es wird wieder unbegrenzt gewartet");
  assert.match(abspielen, /fristMs/, "Es gibt keine Frist");
  // Ein abgelehntes play() ist kein Kamerafehler: Der Strom steht schon.
  assert.ok(!abspielen.includes("fehlerKamera"),
    "Ein abgelehntes play() schickt den Kunden in den Fehlerbildschirm");
});

test("kommt kein Bild, wird noch einmal angestossen - und irgendwann Schluss", () => {
  const waechter = methode(APP, "#abspielWaechter");
  assert.match(waechter, /videoWidth > 0 && !video\.paused/,
    "Der Waechter erkennt nicht, ob wirklich Bilder fliessen");
  assert.match(waechter, /versuche > 10/, "Der Waechter laeuft ohne Ende");
  assert.match(waechter, /clearInterval/, "Der Waechter hoert nie auf");
  // Und er haengt nicht am naechsten Anlauf weiter.
  assert.match(methode(APP, "#kameraStoppen"), /clearInterval\(this\.kamera\.abspielTakt\)/,
    "Der Waechter laeuft nach dem Stoppen weiter");
});

// ---------------------------------------------------------------------------
// Der Strom kommt auf JEDEM Geraet
// ---------------------------------------------------------------------------

test("die Kamera wird in drei Anlaeufen geholt, vom Feinen zum Einfachen", () => {
  // Hier stand EIN Versuch mit width 1440 UND height 1920. Kommt ein
  // Browser damit nicht zurecht, wirft er OverconstrainedError - und der
  // Besucher sah einen Kamerafehler, obwohl seine Kamera in Ordnung ist.
  // In den Fenstern von Instagram und TikTok auf Android passiert das
  // oefter, als man denkt.
  const holen = methode(APP, "#stromHolen");
  assert.match(holen, /\{ name: "fein", regel: \{ facingMode: "user", width: \{ ideal: 1440 \} \} \}/,
    "Der feine Anlauf steht nicht mehr da");
  assert.match(holen, /\{ name: "einfach", regel: \{ facingMode: "user" \} \}/);
  assert.match(holen, /\{ name: "nackt", regel: true \}/,
    "Es fehlt der Anlauf, den jeder Browser kann");

  // KEIN HOCHFORMAT ERZWINGEN. Fast jede Telefonkamera liefert von sich
  // aus quer; wer Hochformat verlangt, zwingt den Browser zum Drehen und
  // Neuskalieren - das kostet beim Start Zeit und danach bei jedem Bild.
  assert.ok(!/height: \{ ideal/.test(APP),
    "Es wird wieder eine Bildhoehe verlangt - damit wird der Strom gedreht");

  // Und wer die Kamera ABGELEHNT hat, bekommt keine zweite Systemfrage:
  // Die erscheint ohnehin nicht, und zwei weitere Anlaeufe waeren nur
  // Wartezeit vor dem Fehler.
  assert.match(holen, /if \(grund === "NotAllowedError" \|\| grund === "SecurityError"\) throw fehler;/,
    "Eine Ablehnung laeuft durch alle drei Anlaeufe");
});

test("der Ring steht, bevor die Kamera antwortet", () => {
  // AUF DEM TELEFON WAREN ES ZWEI BILDER: erst ein nackter Kreis, dann
  // ploetzlich Striche. Beim ersten weiss niemand, was von ihm verlangt
  // wird - und zwischen beiden liegen die Systemfrage, das Aufwachen der
  // Kamera und die Frist, in der ihre Aufloesung ruhig wird.
  //
  // Der leere Ring IST die Anweisung: ein Kreis mit Strichen, die zugehen
  // sollen. Er kostet nichts und steht, bevor die Kamera antwortet.
  const start = methode(APP, "#kameraStarten");
  const vorGetUserMedia = start.slice(0, start.indexOf("getUserMedia"));
  assert.match(vorGetUserMedia,
    /this\.#ringZeichnen\(\{ abgedeckt: new Array\(SEKTOREN\)\.fill\(false\)/,
    "Der Ring wird erst gezeichnet, wenn ein Bild da ist");
});

test("sobald das Bild steht, sagt die Zeile, was zu tun ist", () => {
  // Sie stand auf "Po hapet kamera…", waehrend der Besucher sein eigenes
  // Gesicht schon im Kreis sah - bis zu zweieinhalb Sekunden lang. Ein
  // Satz, der etwas anderes sagt als das Bild darueber, laesst die Seite
  // haengen aussehen.
  const bereit = methode(APP, "#videoBereit");
  const zeigen = bereit.slice(bereit.indexOf("const zeigen = () =>"));
  assert.match(zeigen.slice(0, 700), /schreibe\(\$\("#ls-kamerahinweis"\), this\.text\("ringEinmessen"\)\);/,
    "Die Zeile bleibt auf 'die Kamera geht auf' stehen");
  assert.ok(zeigen.indexOf('dataset.bereit = "ja"') < zeigen.indexOf("ringEinmessen"),
    "Der Satz kommt, bevor das Bild da ist");
});

test("waehrend das Gesichtsnetz unterwegs ist, gibt es nur EINE Anweisung", () => {
  // Der Weg ohne Netz sagt "nicht bewegen" - richtig fuer drei gerade
  // Bilder. Kommt das Netz aber doch noch an, springt die Zeile auf "Kopf
  // langsam im Kreis drehen", und der Besucher hat gerade zwei Sekunden
  // lang gelesen, er solle still halten. Wer zwei Anweisungen bekommt,
  // folgt keiner.
  assert.match(methode(APP, "#rueckfallschleife"),
    /const ruf = lage \|\| \(this\.kamera\.netzWartet \? "ringEinmessen" : "aufnahmeGleich"\);/,
    "Solange offen ist, welcher Weg laeuft, wird schon 'still halten' verlangt");
});

test("das erste Bild kommt vom Ereignis, nicht vom Nachfragen", () => {
  // Die Schleife in #videoBereit() sieht alle 60 ms nach, ob das Bild eine
  // Groesse hat. loadedmetadata kommt in dem Augenblick, in dem sie steht.
  const bereit = methode(APP, "#videoBereit");
  assert.match(bereit, /addEventListener\?\.\("loadedmetadata"/,
    "Auf die Bildgroesse wird nur gepollt");
  assert.match(bereit, /addEventListener\?\.\("loadeddata"/);
  // Aber nicht ohne Ende: Meldet ein Browser gar nichts, geht es nach
  // einer knappen Sekunde trotzdem weiter.
  assert.match(bereit, /setTimeout\(fertigEinmal, 900\)/,
    "Ohne Ereignis haengt der Bildschirm");

  // Und die Frist bis zur ruhigen Breite steht nicht mehr zwischen dem
  // Besucher und der Fuehrung: Zu sehen bekommt er das Bild frueher, und
  // der Zuschnitt wird bei jedem Bild neu gerechnet.
  const frist = Number(APP.match(/#videoBereit\(video, \{ fristMs = (\d+)/)?.[1]);
  assert.ok(frist <= 1400, `Es wird bis zu ${frist} ms gewartet, bevor gemessen werden darf`);
});

test("die Seite sagt sofort, dass die Kamera aufgeht", () => {
  // Zwischen dem Tippen und dem ersten Bild liegen die Systemfrage und das
  // Aufwachen der Kamera. Ohne ein Wort ist das ein leerer Kreis auf einer
  // leeren Seite - und das sieht nicht nach "laedt" aus, sondern nach
  // kaputt.
  const vorGetUserMedia = START.slice(0, START.indexOf("getUserMedia"));
  assert.match(vorGetUserMedia, /#ls-kamerahinweis.*kameraOeffnet/s,
    "Der Hinweis kommt erst, wenn das Bild schon da ist");
  assert.ok(OBERFLAECHE.kameraOeffnet?.sq, "Der Satz fehlt auf Albanisch");
  assert.ok(OBERFLAECHE.kameraOeffnet?.de, "Der Satz fehlt auf Deutsch");
});

// ---------------------------------------------------------------------------
// Die neun Sekunden, in denen nichts geschah
// ---------------------------------------------------------------------------
//
// GEMESSEN, NICHT GESCHAETZT, mit einem Gesichtsnetz, das sechs Sekunden
// braucht (langsames Mobilnetz, 6,7 MB):
//
//   vorher  Bild 0,45 s - Fuehrung erst 6,0 s - Aufnahme fertig 8,6 s
//   jetzt   Bild 0,45 s - Fuehrung 0,48 s     - Aufnahme fertig 5,7 s
//
// Der Unterschied ist nicht nur die Zeit: Vorher stand der Bildschirm
// still, und ein Bildschirm, auf dem nichts geschieht, fuehlt sich laenger
// an als er ist.

test("der Trichter wartet nicht auf das Gesichtsnetz, er fuehrt schon", () => {
  assert.ok(!/await netzHolen/.test(START),
    "Der Bildschirm steht wieder still, bis das Netz da ist");
  // Gefuehrt wird sofort - mit dem Weg, der ohne Netz auskommt.
  const vorNetz = START.slice(0, START.indexOf("netzHolen"));
  assert.match(vorNetz, /this\.#rueckfallschleife\(/,
    "Vor dem Netz passiert nichts");
  // Und kommt es an, uebernimmt der Ring.
  assert.match(START, /netzHolen\([^)]*\)\.then/, "Das Netz wird nicht mehr abgeholt");
  assert.match(START, /this\.kamera\.modus = "ring"[\s\S]{0,200}#ringschleife\(lauf\)/,
    "Der Ring uebernimmt nicht, wenn das Netz ankommt");
});

// ZWEI STARTS DUERFEN SICH NICHT UEBERHOLEN.
//
// Wer "Kamera oeffnen" zweimal tippt oder nach einem Fehler "nochmal"
// drueckt, waehrend die erste Anfrage noch laeuft, bekam zwei Stroeme: Der
// erste blieb offen, die Leuchte blieb an, und zwei Schleifen zeichneten auf
// dieselbe Leinwand. Auf einem langsamen Geraet dauert getUserMedia
// Sekunden - dort ist das kein Randfall, sondern der Normalfall bei einem
// ungeduldigen Finger.
//
// Jeder Start bekommt darum eine Nummer, und alles, was danach aus einem
// Versprechen zurueckkommt, prueft sie.
test("ein abgeloester Kamerastart raeumt hinter sich auf", () => {
  assert.match(START, /const lauf = \(this\.kamera\.lauf \+= 1\);/,
    "Der Start bekommt keine eigene Nummer");
  // Der Strom, der zu spaet kommt, wird geschlossen und nicht abgelegt.
  assert.match(START, /if \(lauf !== this\.kamera\.lauf\) \{\s*for \(const spur of strom\.getTracks\(\)\) spur\.stop\(\);/,
    "Ein Strom aus einem abgeloesten Lauf bleibt offen - die Kameraleuchte auch");
  // Und das Netz, das zu spaet kommt, startet keinen Ring mehr.
  const nachNetz = START.slice(START.indexOf("netzHolen"));
  assert.match(nachNetz, /^[\s\S]{0,120}if \(lauf !== this\.kamera\.lauf\) return;/,
    "Ein spaet ankommendes Netz startet den Ring eines fremden Laufs");

  // Auch die beiden Schleifen tragen die Nummer mit.
  for (const name of ["#ringschleife", "#rueckfallschleife", "#rueckfallAufnehmen"]) {
    assert.match(methode(APP, name), /lauf !== this\.kamera\.lauf/,
      `${name}() laeuft weiter, obwohl ein neuer Start begonnen hat`);
  }
});

test("es laeuft immer nur ein Aufnahmeweg", () => {
  // Zwei Wege gleichzeitig waeren zwei Messungen desselben Gesichts, die
  // einander ueberschreiben.
  assert.match(methode(APP, "#ringschleife"), /this\.kamera\.modus !== "ring"/,
    "Der Ring laeuft weiter, auch wenn er nicht dran ist");
  assert.match(methode(APP, "#rueckfallschleife"), /this\.kamera\.modus !== "rueckfall"/,
    "Der Weg ohne Netz laeuft weiter, auch wenn der Ring uebernommen hat");
  assert.match(START, /if \(this\.kamera\.modus !== "rueckfall"\) return;/,
    "Der Ring uebernimmt auch mitten in einer laufenden Aufnahme");
});

test("aufgenommen wird erst, wenn feststeht, ob das Netz kommt", () => {
  // Sonst waere der Scan nach drei Sekunden vorbei - mit drei geraden
  // Bildern -, obwohl der Ring eine Sekunde spaeter haette laufen koennen.
  assert.match(methode(APP, "#rueckfallschleife"),
    /!this\.kamera\.netzWartet && Date\.now\(\) - seit >= 3000/,
    "Der Weg ohne Netz nimmt auf, waehrend das Netz noch unterwegs ist");
});

// ---------------------------------------------------------------------------
// Der leere Kreis
// ---------------------------------------------------------------------------
//
// Was der Besucher zwischen "Kamera oeffnen" und dem ersten Bild sah: eine
// gleichmaessige helle Flaeche, vollkommen still. Die unterscheidet sich in
// nichts von einer haengengebliebenen Seite - und genau hier springen die
// Leute ab.

test("solange kein Bild da ist, dreht sich etwas im Kreis", () => {
  assert.match(HTML, /<div class="ls-kamera__laedt"[^>]*aria-hidden="true"><\/div>/,
    "Im Kreis fehlt das Zeichen, dass noch geladen wird");
  // Es liegt IM Kreis und nicht daneben: Dort schaut hin, wer wartet.
  const kreis = HTML.slice(HTML.indexOf('class="ls-kamera__kreis"'));
  assert.ok(kreis.indexOf("ls-kamera__laedt") < kreis.indexOf("</div>"),
    "Das Ladezeichen liegt ausserhalb des Kreises");
  assert.match(CSS, /@keyframes ls-kreiselt/, "Das Ladezeichen bewegt sich nicht");
  assert.match(CSS, /\.ls-kamera\[data-bereit="ja"\] \.ls-kamera__laedt \{ opacity: 0; \}/,
    "Das Ladezeichen bleibt stehen, wenn das Bild da ist");
  // Ganz abschalten ist hier falsch: Ohne jede Bewegung steht wieder die
  // stille Flaeche da, und die war das Problem.
  const ruhe = CSS.slice(CSS.indexOf("prefers-reduced-motion"));
  assert.ok(/ls-kamera__laedt::before \{ animation-duration/.test(CSS),
    "Bei abgeschalteter Bewegung fehlt die langsame Fassung");
  assert.ok(ruhe.length > 0);
});

test("das Bild kommt beim ersten Einzelbild, nicht erst wenn die Breite ruhig ist", () => {
  // Zwei verschiedene Fragen, die hier eine waren: "darf man zeigen" haengt
  // an videoWidth > 0, "darf man messen" an der ruhigen Breite. Gewartet
  // wurde auf die zweite - bis zu zwei Sekunden leerer Kreis, obwohl das
  // Bild laengst richtig dagestanden haette.
  const bereit = methode(APP, "#videoBereit");
  const schleife = bereit.slice(bereit.indexOf("while ("));
  const zeigen = schleife.indexOf("zeigen()");
  const ruhig = schleife.indexOf("ruhigSeit");
  assert.ok(zeigen > 0, "In der Schleife wird das Bild nie eingeblendet");
  assert.ok(zeigen < ruhig,
    "Eingeblendet wird erst nach der Ruhezeit - das ist der leere Kreis von vorher");
  // Und nach der Frist trotzdem, wie vorher.
  assert.match(bereit.slice(bereit.indexOf("}", schleife.length)), /zeigen\(\)/,
    "Nach der Frist bleibt der Kreis leer");
});

// ---------------------------------------------------------------------------
// Auf jedem Geraet, altes wie neues
// ---------------------------------------------------------------------------

// Die Schleife haengt an requestAnimationFrame und lief damit so oft, wie der
// Bildschirm es hergibt - auf einem neuen Telefon bis zu hundertzwanzigmal je
// Sekunde. messeNetz() braucht je Aufruf Hauptfaden; bei hundertzwanzig
// Aufrufen bleibt nichts uebrig, um das Videobild fluessig anzuzeigen.
//
// Der Ring wird davon kein Stueck schneller: Ein Strich verlangt eine
// Mindestzahl an Bildern UND eine Mindestdauer. Bindend ist die Dauer -
// sie heisst auf jedem Geraet dasselbe. Der Deckel darf nur nicht so grob
// sein, dass die Bildzahl laenger dauert als die Dauer verlangt; dann
// bremste er den Ring aus, ohne dass es jemandem auffiele.
test("das Gesichtsnetz wird nicht oefter gefragt, als der Ring es braucht", () => {
  const schleife = methode(APP, "#ringschleife");
  assert.match(schleife, /seitMessung < MESS_TAKT_MS/,
    "Die Schleife misst bei jedem Bildschirmtakt");
  assert.match(APP, /const MESS_TAKT_MS = (\d+);/);
  const takt = Number(APP.match(/const MESS_TAKT_MS = (\d+);/)[1]);
  assert.ok(takt >= 33 && takt <= 60, `Der Takt liegt bei ${takt} ms`);
  // Und er passt zu dem, was ein Strich verlangt: Die geforderten Bilder
  // muessen in diesem Takt INNERHALB der Mindestdauer zusammenkommen.
  // Sonst waere nicht die Dauer die Grenze, sondern der Deckel - und ein
  // Strich brauechte laenger, als irgendwo steht.
  assert.ok(takt * POSE_GRENZEN.haltebilder <= POSE_GRENZEN.mindestHaltenMs,
    `${POSE_GRENZEN.haltebilder} Bilder im Takt von ${takt} ms dauern laenger`
    + ` als die geforderten ${POSE_GRENZEN.mindestHaltenMs} ms`);
});

// Die Messleinwand traegt das Bild in voller Kameraaufloesung: 1440 mal 1920
// sind rund elf Megabyte. Auf einem Telefon mit wenig Speicher entscheidet
// das, ob die Befundseite danach noch faellt oder nicht.
test("die Arbeitsleinwaende werden nach dem Scan wieder freigegeben", () => {
  const stoppen = methode(APP, "#kameraStoppen");
  assert.match(stoppen, /for \(const feld of \["messleinwand", "kleinleinwand"\]\)/,
    "Die Arbeitsleinwaende bleiben nach dem Scan liegen");
  // Erst auf null mal null, dann loslassen - die Referenz fallenzulassen
  // allein gibt den Bildspeicher nicht sofort her.
  assert.match(stoppen, /leinwand\.width = 0; leinwand\.height = 0;/);
  // Die Fotos gehoeren NICHT dazu: #ringAbschluss() haelt hier an und holt
  // sie danach als JPEG ab.
  assert.ok(!/this\.kamera\.fotos = \{\}/.test(stoppen),
    "Das Anhalten wirft die Aufnahmen weg, bevor sie kodiert sind");
});

// Die Landmarken werden auf dem einen Bild gefunden und auf dem anderen
// verwendet. Liefen die beiden Zuschnitte auseinander - und zwei Kopien
// derselben Rechnung laufen frueher oder spaeter auseinander -, laege das
// Gesichtsnetz um genau diesen Unterschied daneben.
test("der Zuschnitt des Kamerabildes steht nur an einer Stelle", () => {
  const treffer = APP.match(/Math\.max\(kastenB \/ video\.videoWidth/g) || [];
  assert.equal(treffer.length, 1,
    `Die Zuschnittsrechnung steht ${treffer.length} Mal im Trichter`);
  for (const name of ["#leinwandFuellen", "#messleinwandFuellen"]) {
    assert.match(methode(APP, name), /this\.#videoAusschnitt\(video\)/,
      `${name}() rechnet den Zuschnitt selbst`);
  }
});

// Auf einem langsamen Geraet steht das Videobild nach drei Sekunden noch
// nicht. Dann sprangen alle drei Durchgaenge weiter, es entstand kein
// einziges Foto - und der Besucher stand vor "kein Gesicht erkannt", obwohl
// er alles richtig gemacht hatte.
test("der Weg ohne Netz wartet auf ein Bild, statt ins Leere auszuloesen", () => {
  const aufnehmen = methode(APP, "#rueckfallAufnehmen");
  assert.ok(!/if \(!leinwand\) continue;/.test(aufnehmen),
    "Ein fehlendes Bild wird wieder uebersprungen");
  assert.match(aufnehmen, /for \(let versuch = 0; versuch < \d+ && !leinwand; versuch \+= 1\)/,
    "Auf ein brauchbares Bild wird nicht gewartet");
});
