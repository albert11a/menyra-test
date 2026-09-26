// Der Trichter: zehn Bildschirme, ein Zustand, ein Weg.
//
// Hier wird nichts gerechnet und nichts entschieden. Und seit die
// Hautmessung draussen ist, wird auch anderswo im Trichter nichts mehr
// gerechnet: Er macht die Aufnahme, die Analyse macht Dr. Gashi.
//
// Zwei Regeln, die im Code auftauchen und leicht wie Nachlaessigkeit
// aussehen, aber Absicht sind:
//
// 1. Kein Schreibvorgang haelt den Trichter an. Wenn Firestore nicht
//    erreichbar ist, laeuft der Verkauf weiter - eine Bestellung, die an der
//    Zaehlung scheitert, waere der teuerste denkbare Fehler.
// 2. Es gibt keinen Weg zurueck. Wer den Befund gesehen hat, hat ihn gesehen.

// NUR NOCH DIE ZWEI TABELLENWERTE, KEINE MESSUNG MEHR.
//
// Der Trichter hat die Haut selbst vermessen: Roetung als a*, Glanz,
// Hautton als ITA-Winkel, Poren, Linien, dazu Weissabgleich aus dem
// Augenweiss und ein Millimeter-Massstab aus dem Pupillenabstand. Das ist
// vollstaendig raus. Es wird nichts mehr gemessen - der Trichter macht die
// Aufnahme, die Analyse macht Dr. Gashi.
//
// MESS_BREITE und PUNKT bleiben, weil sie keine Messung sind: die eine ist
// die Breite der Arbeitsleinwand, die andere die Nummer der Nasenspitze im
// Gesichtsnetz. Beide stehen ohnehin im Bundle, denn lifeskin-face.js holt
// PUNKT aus derselben Datei.
//
// lifeskin-haut.js faellt damit ganz weg: Niemand sonst holt etwas daraus.
import { MESS_BREITE, PUNKT } from "./lifeskin-metrics.js";
import { pruefeAufnahme, schaerfeVonBild } from "./lifeskin-face.js";
import { Ringlauf, SEKTOREN, POSE_GRENZEN, SEKTOR_RECHTS } from "./lifeskin-pose.js";
import { telefonPruefen } from "../../shared/lifeskin-telefon.js";
import { LIFESKIN_TELEFON_VORWAHL } from "./lifeskin-config.js";
import { netzVorladen, netzHolen, netzStand, netzArt, netzFehlerFolge, messeNetz, MARKE } from "./lifeskin-netz.js";
import { STANDARD_KONFIG, ALTERSGRUPPEN } from "./lifeskin-catalog.js";
import { OBERFLAECHE, EINSTIEG_HINWEIS, EINSTIEG_KARTEN, ARZT_BILD, ARZT_NAME,
  FRAGEN, FRAGEN_NACH_SCAN, FRAGEN_PA_SKANIM, FRAGEN_PA_SKANIM_NUMRI,
  FRAGEN_TEXTE, t, fuelle } from "./lifeskin-content.js";
import { besteGuete, Flaechenkamera, beiFreigabe, KAMERA_HAENGT_MS, BILD_GRENZE_MS, ausDatei as fotoAusDatei } from "./lifeskin-foto.js";
import { Sitzung } from "./lifeskin-session.js";
import { starteKlickpfad } from "../../shared/lifeskin-klickpfad.js";
import { Pixel } from "./lifeskin-pixel.js";
import { untenNachziehenStarten } from "../../shared/lifeskin-unten.js";

// Sechs Bildschirme, nicht mehr zehn.
//
// Empfehlung, Angebot, Anschrift und Danke sind weg. Sie waren die
// Verkaufsstrecke des Trichters und beruhten vollstaendig auf dem
// automatischen Befund - und den gibt es nicht mehr.
//
// Verkauft wird auf der Befundseite, die Dr. Gashi freigibt. Der Trichter
// macht den Scan und uebergibt.
// ALLE BILDSCHIRME, DIE ES GIBT - BEIDE FASSUNGEN ZUSAMMEN.
//
// Keine Fassung zeigt sie alle. Die kurze (heute /lifeskin) geht
// Einstieg, Kamera, Name+Alter, Aufbereitung; die lange, die daneben
// liegen bleibt, geht Einstieg, Vorbereitung, Kamera, Fragen,
// Aufbereitung. Die Liste ist die Vereinigung, weil dieselbe Anwendung
// beide traegt - welcher Weg gilt, entscheidet die Variante.
//
// DER NAMENSSCHIRM IST ZURUECK, ABER AN ANDERER STELLE. Er stand einmal
// VOR der Kamera und verlangte Name und Alter, bevor der Besucher
// irgendetwas bekommen hatte: Von 894 Besuchern kamen 122 an ihm vorbei.
// Jetzt steht er NACH dem Scan. Wer dort ankommt, hat eine halbe Minute
// den Kopf gedreht - er gibt zwei Angaben, weil er etwas dafuer bekommt.
//
// UND SEIT DER MENYRA SIND ES VIER WEGE DURCH DIESELBE LISTE. Kein
// Besucher sieht mehr als fuenf dieser Bildschirme; welche fuenf,
// entscheidet die Karte, die er auf dem zweiten antippt:
//
//   Me skanim  einstieg, wahl, vorbereitung, kamera, name, analyse
//   Me foto    einstieg, wahl, fotopara,     foto,   name
//   Trup       einstieg, wahl, anliegen,     tel
//   Pytje      einstieg, wahl, anliegen,     tel
//
// Eine Liste und nicht vier, weil es EIN Trichter bleibt: Was danach
// passiert - der Fall, die Warteseite, Heart - ist fuer alle vier
// dasselbe, und vier getrennte Wege waeren vier Gelegenheiten, dabei
// auseinanderzulaufen.
const SCHIRME = ["einstieg", "wahl", "vorbereitung", "kamera", "fotopara", "foto",
  "anliegen", "name", "tel", "fragen", "analyse"];

// DIE VIER WEGE, UND WIE SIE IM FALL HEISSEN.
//
// Die Kennung links steht am Knopf (data-ls-weg), die rechts im
// Dokument (typ). Sie sind fast gleich, und das ist Absicht: Ein
// Uebersetzungsschritt dazwischen waere eine Stelle, an der ein Weg
// still zum anderen wird. Nur "skanim" heisst im Dokument "scan" -
// die Auswertung in Heart und die Firestore-Regel muessen dieselben
// vier Woerter kennen, und dort steht "scan" seit jeher.
//
// "pa-skanim" fehlt hier und lebt trotzdem weiter: Die Vorlage unter
// /lifeskinlandingtemplate traegt noch die zwei alten Karten, und der
// Trichter soll sie nicht mit einer leeren Seite beantworten. Siehe
// #wegWaehlen().
// Wie die Abschnitte und Bildschirme im Klickpfad in Heart heissen.
const KLICKPFAD_NAMEN = Object.freeze({
  "ls-einstieg": "Landingpage", held: "Landing: Kopf", pse: "Landing: Warum", rezultatet: "Landing: Ergebnisse",
  produktet: "Landing: Produkte", menyrat: "Landing: Wege", mjekja: "Landing: Ärztin",
  komuniteti: "Landing: Community", garancia: "Landing: Garantie", fund: "Landing: Ende",
  "ls-wahl": "Mënyra", "ls-fotopara": "Foto: Anleitung", "ls-foto": "Foto: Kamera",
  "ls-vorbereitung": "Skanim: Anleitung", "ls-kamera": "Skanim: Kamera", "ls-name": "Emri & Mosha",
  "ls-anliegen": "Anliegen", "ls-tel": "Nummer", "ls-fragen": "Fragen", "ls-analyse": "Loading"
});

export const WEG_ZU_TYP = Object.freeze({
  skanim: "scan", foto: "foto", trup: "trup", pytje: "pytje"
});

// Welche Bildschirme in den Verlauf des Browsers kommen.
//
// Kamera und Analyse nicht: Sie sind Durchgangsstationen. Wer vom Befund aus
// zurueckgeht, will nicht mitten in eine laufende Analyse, sondern zur
// Vorbereitung - und von dort die Aufnahme neu machen.
// Wie gross das Bild fuer die laufende Pruefung ist, und wie gross fuer die
// Aufnahme. Waehrend der Vorschau zaehlt Tempo mehr als Genauigkeit: Ein
// ruckelndes Bild laesst den Besucher glauben, die Seite sei kaputt.
const GATE_BREITE = 240;

// Wie gross die drei Aufnahmen gespeichert werden.
//
// ZWEITE FASSUNG. Die erste rechnete auf 640 Bildpunkte herunter - das war
// die Breite, bei der ein JPEG sicher klein bleibt, und es war die falsche
// Ueberlegung. Die Kamera wird mit 1440 angefordert, weil erst dort feine
// Linien und Poren ueberhaupt im Bild sind; auf 640 herunterzurechnen wirft
// genau das wieder weg, was die Aufloesung teuer erkauft hat. Und diese
// Bilder sind das, worauf eine Aerztin schaut, bevor sie einen Befund
// unterschreibt.
//
// Jetzt: volle Aufloesung der Messleinwand, gedeckelt auf 1440. Was ein
// Geraet weniger liefert, bleibt weniger - hochrechnen erfindet nichts.
const FOTO_BREITE = 1440;

// DIE QUALITAETSSTUFEN UND DIE GROESSENGRENZE STEHEN IN lifeskin-foto.js.
//
// Ein Firestore-Dokument darf 1 MiB gross sein, und ein Bild steht als
// Text darin; welche Qualitaet noch passt, entscheidet besteGuete() -
// und seit es den Weg "Me foto" gibt, stellt diese Frage nicht mehr nur
// der Scan. Zwei Kopien derselben Grenze waeren zwei Zahlen, die
// auseinanderlaufen, und die zu grosse davon weist Firestore lautlos ab.
//
// Wer hier eine Stufe oder die Grenze sucht: Sie stehen dort, mit
// derselben Begruendung.

// Wohin der Kopf zeigen muss, damit eine Aufnahme als "rechts" oder "links"
// zaehlt. Null steht oben, gezaehlt wird im Uhrzeigersinn - dieselbe
// Rechnung wie in lifeskin-pose.js.
const FOTO_BLICKE = Object.freeze([
  { blick: "rechts", winkel: Math.PI / 2 },
  { blick: "links", winkel: (Math.PI * 3) / 2 },
  // Nach oben. Null steht oben, und diese Richtung steht ZULETZT: Ein Kopf,
  // der schraeg nach rechts oben zeigt, liegt genau zwischen beiden - und
  // als Seitenansicht ist er mehr wert als als Aufsicht. Wer zuerst passt,
  // gewinnt, also gewinnt dort "rechts".
  { blick: "oben", winkel: 0 }
]);

// WIE VIELE BILDER JE BLICKRICHTUNG beim Arzt landen.
//
// Drei gerade, drei rechts, drei links, eines nach oben. Mehr Material zum
// Ansehen, ohne eine einzige zusaetzliche Drehung: Die Bilder entstehen in
// derselben Runde, die der Ring ohnehin verlangt.
// ZWEITE FASSUNG: sieben Bilder statt zehn.
//
// Jedes Bild geht als Text in ein eigenes Firestore-Dokument - bei 1440
// Bildpunkten sind das rund 350 KB je Stueck. Zehn davon waren gut drei
// Megabyte, die das Telefon nach dem Scan hochlaedt, waehrend der Besucher
// schon auf seiner Warteseite steht. Auf Mobilfunk dauert das Minuten, und
// wer die Seite vorher schliesst, hat die Bilder nicht geschickt.
//
// Drei Bilder derselben Blickrichtung zeigen ausserdem fast dasselbe. Zwei
// geben der Aerztin die Wahl zwischen zwei Augenblicken - das ist der
// Zweck -, das dritte kostet nur Leitung.
const FOTOS_JE_BLICK = Object.freeze({ gerade: 2, rechts: 2, links: 2, oben: 1 });

// Und sie muessen verschiedene Augenblicke zeigen.
//
// Ohne diesen Abstand kaemen drei Bilder aus derselben Dreissigstelsekunde
// - Aufnahmen, die sich nicht unterscheiden. Dann haette der Arzt drei
// Bilder und trotzdem eine Ansicht.
//
// 150, und der Takt des Nachschlags liegt mit 160 knapp darueber: So ist
// JEDES nachgeholte Bild auch verwendbar. Lagen sie enger als der Abstand,
// waere jedes zweite umsonst geholt - und die Plaetze blieben leer, obwohl
// Kandidaten da waren. Genau daran kam "rechts" auf zwei Bilder statt drei.
//
// Nach oben ist die Grenze der Ring selbst: Er laesst zwei Aufnahmen schon
// nach 220 Millisekunden zu (POSE_GRENZEN.mindestAbstandMs).
const FOTO_ABSTAND_MS = 150;

// DIE ZUSATZBILDER SIND ZUM ANSEHEN DA, NICHT ZUM MESSEN.
//
// Gemessen wird auf dem Geraet, aus der vollen Aufloesung; was hochgeht,
// schaut sich Dr. Gashi an. 900 Punkte reichen dafuer vollauf und kosten
// ein Fuenftel: weniger Speicher auf dem Telefon waehrend der Drehung und
// weniger Upload danach. Das beste Bild je Richtung bleibt unangetastet
// bei voller Groesse.
const FOTO_BREITE_MEHR = 900;
const FOTO_STUFEN_MEHR = Object.freeze([0.86, 0.78, 0.7]);

// DIE MINIATUR FUER DIE WARTESEITE.
//
// Der Patient soll dort seine eigenen Aufnahmen sehen und nicht die Zahl
// "6 foto". Die Kachel ist auf dem Telefon 72 Punkte breit; 160 tragen sie
// auch auf einem dichten Bildschirm, ohne dass ein einziges Byte mehr
// noetig waere als dafuer.
//
// Sie geht NEBEN DEN BERICHT und nicht in die Sitzung: Die Warteseite ist
// oeffentlich lesbar, die Sitzung nicht - dort stehen Nummer und
// Anschrift. Die Fotos in voller Aufloesung bleiben unangetastet dort
// liegen, wo nur das CEO-Konto sie liest.
const MINI_BREITE = 160;
// Kraeftiger komprimiert als alles andere. Bei 160 Punkten sieht man den
// Unterschied nicht, und die Regel laesst hier nur 60.000 Zeichen zu -
// ein Vielfaches dessen, was diese Stufen brauchen.
const MINI_STUFEN = Object.freeze([0.7, 0.6, 0.5, 0.4]);
const MINI_HOECHSTZEICHEN = 60000;
// Ein Viertelkreis um die Ideallinie. Enger waere ehrlicher und ginge in der
// Praxis nie zu: Kaum jemand dreht den Kopf exakt waagerecht.
const FOTO_TOLERANZ = Math.PI / 4;

// WELCHE SEKTOREN ZU WELCHER BLICKRICHTUNG GEHOEREN - und welche zu keiner.
//
// Acht Sektoren zu je 45 Grad, drei Blickrichtungen mit je 45 Grad Toleranz:
// oben (0 Grad) deckt 7 und 0, rechts (90) deckt 1 und 2, links (270) deckt
// 5 und 6. SEKTOR 3 UND 4 - der Kopf nach unten - GEHOEREN ZU KEINER. Dort
// liefert #blickAus() nichts, und der Sektor gilt trotzdem als abgedeckt.
//
// Gerechnet aus FOTO_BLICKE und FOTO_TOLERANZ und nicht abgeschrieben: Wer
// eine Blickrichtung verschiebt oder die Toleranz aendert, verschiebt diese
// Tabelle mit. Abgeschrieben waere sie beim ersten solchen Eingriff still
// falsch - und dann forderte der Ring Bilder aus Sektoren nach, in denen es
// keine geben kann.
const BLICK_SEKTOREN = Object.freeze(Object.fromEntries(
  FOTO_BLICKE.map(({ blick, winkel }) => {
    const breite = (Math.PI * 2) / SEKTOREN;
    const sektoren = [];
    for (let s = 0; s < SEKTOREN; s += 1) {
      // Die Mitte des Sektors gegen die Ideallinie - derselbe kuerzere Weg
      // um den Kreis wie in #blickAus().
      //
      // s * breite und nicht (s + 0.5) * breite: Seit sektorAus() um die
      // MITTE teilt statt ab der Kante, liegt die Mitte von Sektor s genau
      // auf s * breite. Bliebe der halbe Sektor stehen, zeigte diese
      // Tabelle um 22,5 Grad daneben - und der Ring forderte Bilder aus
      // Sektoren nach, in denen es keine geben kann.
      let abstand = Math.abs(s * breite - winkel) % (Math.PI * 2);
      if (abstand > Math.PI) abstand = Math.PI * 2 - abstand;
      if (abstand <= FOTO_TOLERANZ) sektoren.push(s);
    }
    return [blick, Object.freeze(sektoren)];
  })
));

// Welche Bilder eine Analyse wirklich braucht. "oben" steht nicht dabei: Es
// ist eine Zugabe, keine Voraussetzung (FOTOS_JE_BLICK gibt ihm einen Platz,
// den anderen drei).
const NOETIGE_BLICKE = Object.freeze(["gerade", "rechts", "links"]);

// Wie oft der Ring hoechstens wieder aufgeht, wenn Bilder fehlen.
const NACHFORDERN_HOECHSTENS = 2;

// Und die harte Grenze. Danach wird genommen, was da ist.
//
// 40 Sekunden: Die zweite Lockerung der Schwelle greift nach 15, der Hinweis
// auf den Ausloeser nach 12 - wer bis dahin nicht herumgekommen ist, kommt
// auch in der dritten Runde nicht herum. Ein duenner Scan ist schlechter als
// ein vollstaendiger und immer noch besser als ein Kunde, der aufgibt.
const AUFNAHME_FRIST_MS = 40000;

// WIE LANGE DER RING OHNE FORTSCHRITT STEHEN DARF, BEVOR GEHOLFEN WIRD.
//
// Liegen schon Bilder vor, wird nach 15 Sekunden ohne neuen Strich das
// Blatt mit "Vazhdo kështu" geoeffnet - die Kamera laeuft weiter, nichts
// geht verloren. Frueher stand hier nur der harte Abbruch nach 45
// Sekunden: Kamera aus, Fehler, alle Bilder weg, alles von vorn. Den
// gibt es weiter, aber nur noch, wenn es gar nichts zu retten gibt.
//
// 15 UND 30 STATT 25 UND 45 - GEMESSEN AM 25.09. im Pruefstand
// (tests/lifeskin-trichter-pruefstand/lauf-wege.mjs, A1 und A9): Wer den
// Kopf nicht drehen kann, stand mit 25 Sekunden 34 Sekunden vor der
// Kamera, bis das Blatt von selbst aufging - der Hinweis nennt den
// Ausloeser schon nach 12. Und ohne erkanntes Gesicht kam der Ausweg
// (noch einmal oder Foto mit der Telefonkamera) erst nach 50 Sekunden.
// Beides ist laenger, als jemand in einem App-Fenster wartet.
const STILLSTAND_HILFE_MS = 15000;
const STILLSTAND_ABBRUCH_MS = 30000;

// Wie viele Bilder hintereinander die Erkennung mit einem Fehler beenden
// darf, bevor der Weg ohne Netz uebernimmt. Bei 25 Messungen je Sekunde
// ist das gut eine Sekunde - ein einzelner Aussetzer beim Groessenwechsel
// der Leinwand bleibt weit darunter.
const NETZ_AUSFALL_BILDER = 30;

// Wie lange nach dem Tipp auf "Fillo" das Gesichtsnetz angestossen wird.
// Die Karten der Landingpage tippen Start UND Weg im selben Zug; wer
// dort "Me foto" oder "Per trupin" waehlt, bestellt es damit sofort
// wieder ab (#wegWaehlen), bevor ein einziges Byte laeuft.
const NETZ_VORMERKEN_MS = 1500;

// WIE LANGE DER SCAN AUF DIE GESICHTSERKENNUNG WARTET, bevor er ohne sie
// aufnimmt. Hier standen neun Sekunden - neun Sekunden, in denen jemand
// mit dem Gesicht im Kreis sass und nichts zuging. Das Laden beginnt
// schon beim ersten Tipp auf der Landingpage; wer sie nach sechs
// Sekunden an der Kamera noch nicht hat, hat eine Leitung, auf der auch
// drei weitere nicht reichen. Dann nimmt der Weg ohne Netz sofort auf.
const NETZ_WARTEN_MS = 6000;

// Wie lange die Uebergabe OHNE JEDE ANTWORT des Servers wartet, bevor sie
// den Hinweis zeigt. Gezaehlt ab der letzten Antwort, nicht ab dem Tipp -
// siehe #uebergeben().
const UEBERGABE_STILL_MS = 20000;

// Wie schnell eine Kamera-Absage kommen muss, damit sie als "ohne Frage
// abgelehnt" gilt. Die Systemfrage braucht allein zum Erscheinen einige
// hundert Millisekunden, und dann muss noch jemand lesen und tippen -
// schneller als das lehnt nur die App selbst ab (siehe #kameraAusweg).
const SOFORT_VERWEIGERT_MS = 600;

// Wie lange das Bild wandern muss, bis der Hinweis dazu erscheint.
//
// Eine halbe Sekunde: kurz genug, um noch zu der Bewegung zu gehoeren, die
// ihn ausgeloest hat, und lang genug, dass ein einzelnes wackliges Bild
// nichts einblendet.
const UNRUHE_HINWEIS_AB_MS = 500;

// WIE OFT DAS GESICHTSNETZ HOECHSTENS GEFRAGT WIRD.
//
// Die Schleife haengt an requestAnimationFrame und lief damit so oft, wie
// der Bildschirm es hergibt - auf einem neuen Telefon sechzig- bis
// hundertzwanzigmal je Sekunde. messeNetz() braucht je Aufruf einige
// Millisekunden Hauptfaden; bei hundertzwanzig Aufrufen bleibt nichts mehr
// uebrig, um das Videobild fluessig anzuzeigen. Genau das ist das Ruckeln,
// das auf dem Kameraschirm zu sehen ist.
//
// Fuenfundzwanzigmal je Sekunde reichen vollauf: Ein Strich verlangt vier
// Bilder UND mindestens 160 Millisekunden (POSE_GRENZEN), und vier Bilder
// sind in diesem Takt genau diese 160. Schneller zu messen macht den Ring
// kein Stueck schneller - es nimmt nur dem Bild die Luft.
//
// Auf einem langsamen Geraet aendert die Grenze nichts: Dort dauert eine
// Messung ohnehin laenger als vierzig Millisekunden.
const MESS_TAKT_MS = 40;

// Zwei Aufloesungen, und der Unterschied ist der Punkt.
//
// VERFOLGUNG_BREITE ist, was das Gesichtsnetz je Bild zu sehen bekommt.
// Klein halten kostet nichts: Die Landmarken kommen als Anteile zurueck und
// sind auf jeder Aufloesung dieselben, und dreissig Bilder je Sekunde sind
// wichtiger als Bildpunkte.
//
// MESSUNG dagegen laeuft in voller Kameraaufloesung. Frueher wurde auch
// gemessen, was hier steht - 480 Bildpunkte -, und damit kam auf einen
// Bildpunkt rund ein halber Millimeter Haut. Poren sind kleiner als das; sie
// waren physikalisch nicht auflösbar. Siehe ABTASTUNG_MM in
// lifeskin-metrics.js.
const VERFOLGUNG_BREITE = MESS_BREITE;

// Wie weit das Bild herangeholt wird.
//
// Bei normal gehaltenem Telefon fuellt ein Gesicht nur gut vierzig Prozent
// der Bildbreite. Im Kreis sieht das verloren aus, und fuer die Messung sind
// es unnoetig wenige Bildpunkte je Millimeter Haut. Dieselbe Zahl steht in
// lifeskin-styles.css als `transform: ... scale(1.25)` am Videobild, und
// tests/lifeskin-service-worker haelt beide zusammen.
//
// SIE MUESSEN GLEICH SEIN. Laeuft der Zuschnitt der Messung dem angezeigten
// Bild davon, misst der Trichter woanders, als der Kunde hinschaut - genau
// daran ist die Kamera hier schon einmal gescheitert, und man sieht es dem
// Bildschirm nicht an.
const NAEHE = 1.25;

// Fuenf Striche je Sektor. Der Ring soll fein aussehen wie bei Face ID, aber
// er misst in acht Richtungen - alle fuenf Striche eines Sektors gehen
// gemeinsam zu.
const STRICHE_JE_SEKTOR = 5;

// Wie viele gerade Aufnahmen hoechstens. Drei reichen fuer einen stabilen
// Median der Messwerte; jede weitere kostet nur Zeit.
const FRONTAL_HOECHSTENS = 3;

// DER NACHSCHLAG: ein Fenster, keine zwei Bilder.
//
// GEMESSEN, NICHT GESCHAETZT - zweimal an derselben Stelle:
//
// ERSTENS, die Schaerfe. Ein Ausloeser traf genau ein Bild: dasjenige, in
// dem der Kopf am besten im Zielwinkel stand. Wer den Kopf dabei zuegig
// weiterschwenkt, hat in genau diesem Bild die groesste Bewegung.
//
// ZWEITENS, die Zahl. Jede Blickrichtung deckt neunzig Grad ab, ein Sektor
// fuenfundvierzig - eine Seite bekommt also HOECHSTENS ZWEI Ausloeser, und
// jeder geht nur einmal. Mit zwei Bildern unmittelbar dahinter (dreissig
// Millisekunden) waren drei Bilder je Seite rechnerisch unmoeglich: Die
// drei haetten aus demselben Sechzigstel gestammt und waeren als
// Doppelgaenger verworfen worden.
//
// Deshalb ein FENSTER: Nach jedem Ausloeser holt die Schleife eine knappe
// halbe Sekunde lang weitere Bilder, rund alle elf Hundertstel eines.
// Das sind vier bis fuenf Kandidaten je Ausloeser, ueber einen Zeitraum
// verteilt, in dem sich ein Kopf sichtbar weiterbewegt - genug fuer drei
// verschiedene Bilder, und genug Auswahl fuer das schaerfste.
//
// Am Ende verlaesst die Seite trotzdem nur, was in FOTOS_JE_BLICK steht.
const NACHSCHLAG_MS = 500;
const NACHSCHLAG_TAKT_MS = 160;

// Ab wann ein Bild "deutlich schaerfer" ist als das aufbewahrte.
//
// Fuenfzehn Prozent. Darunter ist der Unterschied Rauschen - dann
// entscheidet weiter der Winkel, wie bisher. Darueber gewinnt die
// Schaerfe: Ein verwackeltes Bild im perfekten Winkel ist fuer eine
// Hautbeurteilung wertlos, ein scharfes fuenf Grad daneben nicht.
const SCHAERFE_VORSPRUNG = 1.15;

// Kantenlaenge des Ausschnitts, an dem gemessen wird - in echten
// Bildpunkten, mitten im Gesicht. Der Hintergrund bleibt draussen: Eine
// gemusterte Tapete darf ein verwackeltes Gesicht nicht scharf rechnen.
const SCHAERFE_FELD = 256;

// Die Anleitungsschirme kommen dazu, die Kameras nicht: Wer vom
// Rueckweg in eine laufende Aufnahme faellt, steht vor einem schwarzen
// Bild ohne Strom.
//
// NAME UND NUMMER STEHEN JETZT MIT DRIN, und das musste mit der Nummer
// kommen: Sie ist seither ein eigener Bildschirm auf JEDEM Weg, und ohne
// Eintrag im Verlauf fuehrte der Zurueck-Knopf des Browsers von dort aus
// zwei Bildschirme zurueck statt einen - oder aus dem Trichter hinaus.
//
// Ob wirklich ein Eintrag faellt, entscheidet zeige(): nur, wenn es von
// diesem Bildschirm aus ueberhaupt einen Weg zurueck gibt. Auf dem Weg
// mit Scan gibt es ihn nach der Aufnahme nicht - ein Zurueck hiesse
// dort, den Scan noch einmal zu machen.
/* Wo sich das Wiederaufnehmen lohnt und wo es schadet - die Begruendung
   steht an #standMerken(). */
const WIEDER_AUFNEHMBAR = Object.freeze(["name", "anliegen", "tel"]);
const STAND_SCHLUESSEL = "lifeskin:stand";

const IM_VERLAUF = Object.freeze(["einstieg", "wahl", "vorbereitung", "fotopara",
  "name", "anliegen", "tel"]);

// Der Fortschritt startet bei 20 %. Siehe lifeskin-styles.css.
//
// Die vier Wege sind verschieden lang, und der Balken soll trotzdem auf
// jedem ehrlich sein: Auf dem kuerzesten (Pytje) liegen zwischen der
// Menyra und der Warteseite nur zwei Bildschirme, also stehen sie auch
// weiter auseinander.
const FORTSCHRITT = {
  einstieg: 15, wahl: 30,
  vorbereitung: 45, kamera: 65,
  fotopara: 45, foto: 65,
  // Nach der Aufnahme: Name und Alter, dann die Nummer.
  name: 75, anliegen: 70,
  // Die Nummer steht auf JEDEM Weg an vorletzter Stelle.
  tel: 85, fragen: 85, analyse: 100
};

// DERSELBE BILDSCHIRM LIEGT AUF ZWEI WEGEN AN VERSCHIEDENEN STELLEN.
//
// Name und Alter stehen mit Aufnahme HINTER der Kamera und auf dem Weg
// "Per trupin ose vetem pyetje" als ERSTES. Ein fester Wert waere auf
// einem der beiden Wege falsch, und ein Balken, der zurueckspringt,
// liest sich als Fehler.
const FORTSCHRITT_TRUP = { name: 45, anliegen: 65, tel: 85 };

// WELCHE FASSUNG DES TRICHTERS LAEUFT.
//
// "klassik" ist der Weg, der heute unter /lifeskin steht: Einstieg,
// Vorbereitung, Kamera, vier Fragen, Name, Nummer. "kurz" ist die Fassung
// unter /lifeskintrichter:
//
//   - ein langer, scrollbarer Einstieg,
//   - KEINE Vorbereitungsseite und kein Anleitungsblatt: Der Tipp fuehrt
//     unmittelbar an die Kamera, gefuehrt wird IM Bild (siehe Ring),
//   - nach dem Scan nur noch die Nummer, keine weiteren Fragen.
//
// Entschieden wird es am Aufbau (`<html data-ls-variante="kurz">`) und
// nicht am Pfad: So laesst sich dieselbe Fassung unter jeder Adresse
// ausprobieren, und die Umstellung von /lifeskin ist ein Austausch der
// index.html statt einer Zeile, die Adressen kennt.
//
// Als eigene Funktion, damit sie ohne Browser nachrechenbar ist.
export function varianteLesen(wurzel) {
  return wurzel?.dataset?.lsVariante === "kurz" ? "kurz" : "klassik";
}

// DER BROWSER IN EINER APP AUF ANDROID - dort gibt es womoeglich keine
// Live-Kamera.
//
// Nach Meta-Entwicklerforum und 8th Wall reichen die Android-Apps von
// Facebook und Instagram (ebenso Messenger, TikTok und andere) die
// Kamerafrage ihrer eingebauten Webansicht nicht weiter: getUserMedia()
// antwortet sofort mit NotAllowedError, ohne dass je eine Frage erscheint.
// Auf dem iPhone geben dieselben Apps die Kamera frei. DIESE QUELLEN SIND
// JAHRE ALT, und am Geraet geprueft ist es nicht - eine neuere App-Fassung
// kann die Kamera freigeben. Deshalb entscheidet diese Funktion nie
// allein: Sie wird erst gefragt, wenn die Kamera WIRKLICH abgelehnt hat,
// und nur fuer die Auswege im Fehlerkasten (#kameraAusweg).
// "; wv)" ist die Kennung jeder Android-Webansicht - auch der Apps, deren
// Namen hier nicht stehen.
export function inAppAndroid(kennzeichen = globalThis.navigator?.userAgent) {
  const ua = String(kennzeichen || "");
  return /Android/i.test(ua)
    && /FBAN|FBAV|FB_IAB|FB4A|Instagram|Messenger|musical_ly|Bytedance|TikTok|Snapchat|; wv\)/i.test(ua);
}

// WAS AUF DER LANDINGPAGE EINZELN HEREINKOMMT.
//
// Nicht ganze Abschnitte, sondern das, was man liest: die Ueberschrift,
// der einzelne Schritt, die Karte, das Fragenpaar. Ein Abschnitt, der als
// Block hereinfaehrt, bewegt vier Dinge auf einmal - und dann liest man
// keines davon, sondern wartet, bis es steht.
//
// Die Karten (.ls-haken, .ls-faelle) kommen dagegen als Ganzes: Sie SIND
// eine Flaeche, und eine Flaeche, deren Zeilen einzeln erscheinen, sieht
// aus, als lade sie noch.
const LANDING_TEILE = [
  ".ls-weiter",
  ".ls-block__titel",
  ".ls-schritte3 > li",
  ".ls-schutz",
  ".ls-haken",
  ".ls-faelle",
  ".ls-faelle__wisch",
  ".ls-fragenliste__paar"
].join(",");

const $ = (auswahl, wurzel = document) => wurzel.querySelector(auswahl);
const $$ = (auswahl, wurzel = document) => Array.from(wurzel.querySelectorAll(auswahl));

function schreibe(knoten, text) { if (knoten) knoten.textContent = text; }

function warte(ms) { return new Promise((fertig) => setTimeout(fertig, ms)); }

// Die beste Qualitaet nehmen, die noch in ein Firestore-Dokument passt.
//
// SIE STEHT JETZT IN lifeskin-foto.js und wird hier nur weitergereicht.
// Der Grund ist der zweite Weg mit Kamera: "Me foto" nimmt EIN Bild
// einer Stelle auf und muss dieselbe Entscheidung treffen. Zwei Kopien
// dieser Schleife waeren zwei Grenzen, die auseinanderlaufen - und die
// eine davon, die zu gross bleibt, weist Firestore lautlos ab.
//
// Weiterhin von hier exportiert, weil die Pruefungen sie dort suchen und
// weil sie zum Scan gehoert wie zur Aufnahme einer Stelle.
export { besteGuete };

// Welches von zwei Bildern derselben Blickrichtung bleibt.
//
// Bisher entschied allein der Winkel: das Bild, in dem der Kopf am besten
// in der Zielhaltung stand. Das ist richtig, solange beide Bilder scharf
// sind - und falsch in genau dem Fall, der diese Regel noetig macht.
//
// Die Schaerfe schlaegt den Winkel, aber nur wenn der Vorsprung deutlich
// ist; bei kleinen Unterschieden entscheidet weiter der Winkel. Und ein
// deutlich unschaerferes Bild gewinnt nie, auch wenn die Haltung besser
// passt.
//
// Laesst sich die Schaerfe nicht messen - kein Gesichtsnetz, kein
// Ausschnitt -, bleibt es beim alten Verhalten. Eine Regel, die ohne ihre
// Messung anders entscheidet, waere schlimmer als keine.
export function fotoBesser(vorher, neu, vorsprung = SCHAERFE_VORSPRUNG) {
  if (!neu) return false;
  if (!vorher) return true;
  const alt = Number(vorher.schaerfe);
  const frisch = Number(neu.schaerfe);
  if (Number.isFinite(alt) && alt > 0 && Number.isFinite(frisch) && frisch > 0) {
    if (frisch >= alt * vorsprung) return true;
    if (alt >= frisch * vorsprung) return false;
  }
  return Number(neu.abweichung) < Number(vorher.abweichung);
}

// Wohin ein Bild gehoert: auf den ersten Platz, auf einen der weiteren,
// oder gar nicht.
//
// Drei Bilder je Richtung sind nur dann drei Bilder, wenn sie DREI
// AUGENBLICKE zeigen. Ohne den Mindestabstand kaemen sie aus demselben
// Nachschlag - drei Aufnahmen desselben Sechzigstels, nicht zu
// unterscheiden. Der Arzt haette drei Bilder und trotzdem eine Ansicht.
//
// Der erste Platz gehoert weiter dem schaerfsten Bild der Richtung
// (fotoBesser entscheidet das). Die weiteren Plaetze fuellen sich mit dem,
// was zeitlich daneben liegt, und tauschen nur gegen Schaerferes.
export function fotoPlatzWahl(platz, kandidat, { hoechstens = 0, abstandMs = FOTO_ABSTAND_MS } = {}) {
  if (fotoBesser(platz?.erste, kandidat)) return { wohin: "erste" };
  if (hoechstens <= 0) return { wohin: "nichts" };

  const mehr = platz?.mehr || [];
  const weitGenug = (ausser) => ![platz?.erste, ...mehr]
    .some((f) => f && f !== ausser && Math.abs((f.zeit || 0) - (kandidat.zeit || 0)) < abstandMs);

  if (mehr.length < hoechstens) return weitGenug(null) ? { wohin: "mehr" } : { wohin: "nichts" };

  const schwaechstes = mehr.reduce((a, b) =>
    (Number(b.schaerfe) || 0) < (Number(a.schaerfe) || 0) ? b : a);
  if (!((Number(kandidat.schaerfe) || 0) > (Number(schwaechstes.schaerfe) || 0))) return { wohin: "nichts" };
  return weitGenug(schwaechstes) ? { wohin: "ersetzen", opfer: schwaechstes } : { wohin: "nichts" };
}

export class Trichter {
  // Produkte braucht der Trichter nicht mehr. Er macht den Scan; welche
  // Produkte jemand bekommt, entscheidet Dr. Gashi auf der Befundseite.
  constructor({ konfig = STANDARD_KONFIG, variante = null } = {}) {
    this.konfig = konfig;
    this.sprache = konfig.sprache || "sq";
    // Steht sie nicht im Aufruf, steht sie im Aufbau - und sonst gilt die
    // alte Fassung. Ein Trichter, der ohne Zutun etwas anderes tut als
    // bisher, waere genau das, was hier niemand will.
    this.variante = variante || varianteLesen(globalThis.document?.documentElement);
    this.pixel = new Pixel();
    this.sitzung = new Sitzung({ beiSchritt: (name, zusatz) => this.pixel.melde(name, zusatz) });
    /* Derselbe Speicher, in dem die Sitzung ihre Kennung haelt: Er
       gehoert dem einen Tab und ueberlebt ein Neuladen. */
    try { this.speicher = globalThis.sessionStorage || null; }
    catch { this.speicher = null; }
    this.zustand = {
      name: "",
      altersgruppe: "",
      aufnahmen: [],
      // Nichts weiter: Der Trichter nimmt weder Bestellung noch Nummer
      // entgegen. Beides gehoert auf die Befundseite, denn dort steht die
      // Fallnummer, auf die sich ein WhatsApp-Gespraech beziehen muss.
    };
    this.kamera = {
      strom: null, laeuft: false, letztesRaster: null, ring: null,
      proben: [], fotos: {},
      // DIE NUMMER DES LAUFS.
      //
      // Jeder Start bekommt eine eigene; alles, was danach aus einem
      // Versprechen zurueckkommt, prueft sie. Ohne sie ueberholen sich zwei
      // Starts: Wer "Kamera oeffnen" zweimal tippt oder nach einem Fehler
      // "nochmal" drueckt, waehrend die erste Anfrage noch laeuft, bekam
      // zwei Stroeme - der erste blieb offen, die Leuchte blieb an, und
      // zwei Schleifen zeichneten auf dieselbe Leinwand. Auf einem
      // langsamen Geraet dauert getUserMedia Sekunden; dort ist das kein
      // Randfall, sondern der Normalfall bei einem ungeduldigen Finger.
      lauf: 0,
      letzteMessung: 0,
      wegSeit: 0
    };
    // Welche Karte des Einstiegs gerade steht, und die Uhr, die weiterschaltet.
    this.karten = { i: 0, uhr: 0 };
    // Welche Frage gerade steht und was bisher geantwortet wurde.
    //
    // DAZU, WAS DIE LAUFENDE STRECKE UMGIBT: wohin es hinter der letzten
    // Frage geht (danach), auf welchen Bildschirm der Pfeil vor der ersten
    // zurueckfuehrt (zurueck) und welcher Satz darueber steht
    // (einleitung). Der Weg ohne Scan laeuft ZWEIMAL durch denselben
    // Bildschirm - vier Fragen vor Name und Alter, die Nummer danach -,
    // und ohne diese drei Angaben wuesste der zweite Durchgang nicht, dass
    // er der zweite ist.
    //
    // ANTWORTEN BLEIBEN UEBER DIE STRECKEN HINWEG STEHEN. #frageSchreiben()
    // schickt die ganze Karte als anamnese; ein Durchgang, der leer
    // anfaengt, wuerde beim ersten Schreibvorgang alles ueberschreiben,
    // was der erste gesammelt hat.
    this.fragen = { i: 0, antworten: {}, danach: "analyse", zurueck: null, einleitung: "" };

    // WELCHE FRAGEN NACH DEM SCAN UEBERHAUPT KOMMEN.
    //
    // NUR DIESE - der Weg OHNE Scan setzt seine eigene Liste, wenn er
    // anfaengt (#wegWaehlen). Hier steht, womit der Trichter startet, und
    // das ist die Strecke hinter der Aufnahme.
    //
    // Die alte Fassung stellt sechs: vier Fragen, den Namen, die Nummer.
    // Sie stehen nach der Aufnahme, weil dort der Fall schon gesichert ist
    // und die Bilder im Hintergrund hinausgehen.
    //
    // Die kurze Fassung stellt genau ZWEI: den Namen und die Nummer. Die
    // vier Fragen davor kann Dr. Gashi im Gespraech stellen - sie schreibt
    // ohnehin auf WhatsApp. Was der Trichter an dieser Stelle NICHT
    // bekommt, ist der Kontakt, und ohne den war der ganze Scan umsonst:
    // Von 32 fertigen Analysen haben 13 ihren Befund gesehen, genau die
    // 13, die erreichbar waren.
    //
    // Der Name steht VOR der Nummer, und das ist die leichtere
    // Reihenfolge: Der Vorname ist harmlos und schnell getippt, die Nummer
    // ist die Auskunft, bei der jemand zoegert. Wer gerade seinen Namen
    // geschrieben hat, ist im Schreiben - und schreibt weiter. Andersherum
    // steht die teure Frage am Anfang.
    //
    // Aus derselben Liste gefiltert und nicht abgeschrieben: Aendert sich
    // ein Text oder die Pruefung der Nummer, aendert sie sich hier mit.
    // Die Reihenfolge kommt ebenfalls von dort (emri steht vor numri).
    // DIE KURZE FASSUNG ZEIGT DEN FRAGENBILDSCHIRM GAR NICHT MEHR: Nach
    // dem Scan kommt der Bildschirm mit Name und Alter. Die Liste bleibt
    // trotzdem gefuellt, und zwar mit genau diesen zweien - sie ist der
    // Rueckfall fuer den Fall, dass eine Seite den Namensschirm nicht
    // mitbringt (#fragenZeigen prueft darauf). Dann wird dasselbe
    // gefragt, nur auf zwei Bildschirmen statt einem, statt gar nichts.
    this.fragenListe = this.variante === "kurz"
      ? FRAGEN.filter((frage) => frage.id === "emri" || frage.id === "mosha")
      : FRAGEN_NACH_SCAN;
  }

  text(schluessel, werte) {
    const roh = t(OBERFLAECHE[schluessel], this.sprache);
    return werte ? fuelle(roh, werte) : roh;
  }

  /* ══ WER KURZ HINAUSGEHT, FAENGT NICHT VON VORNE AN ════════════════
   *
   * WO DIE LEUTE AUFHOEREN: bei der Nummer. Und der Grund liegt nicht
   * an der Nummer, sondern daran, was man tun muss, um sie zu haben.
   *
   * Die wenigsten wissen ihre eigene Nummer auswendig. Sie holen sie
   * sich - aus den Kontakten, aus WhatsApp, aus dem eigenen Profil. Das
   * heisst: kurz aus der Seite heraus. Und die Fenster von Instagram,
   * Facebook und TikTok laden den Tab neu, sobald man aus ihm heraus
   * und wieder hinein wechselt. Genau diese Leute kommen aus den
   * Anzeigen.
   *
   * Zurueck kamen sie dann auf den Einstieg. Name weg, Alter weg,
   * Anliegen weg - und der Scan, den sie eben gemacht haben, war fuer
   * sie verloren. Ein zweites Mal macht das niemand.
   *
   * Die Seite merkt sich deshalb, wo jemand stand und was er
   * geschrieben hatte. In sessionStorage: Das gehoert dem einen Tab,
   * ueberlebt ein Neuladen und ist beim naechsten Besuch von selbst
   * wieder weg - genau die Grenze, die "ein Besuch" meint.
   *
   * NUR DIE DREI BILDSCHIRME, AUF DENEN MAN ETWAS SCHREIBT. Das ist
   * kein Sparen, das sind drei Gruende:
   *
   *  - Dort geht wirklich etwas verloren. Eine angetippte Karte ist in
   *    einer Sekunde wieder angetippt; ein Anliegen nicht.
   *  - Kamera und Aufnahme lassen sich nicht wiederherstellen: Der
   *    Browser gibt die Kamera nur auf einen frischen Fingerdruck frei.
   *    Ein Bildschirm mit totem Bild waere schlimmer als der Einstieg.
   *  - Und es faellt kein einziges Pixel-Ereignis doppelt: Zu "emri",
   *    "problemi" und "numri" gehoert keines (siehe PIXEL_SCHRITTE).
   *    Bei "wahl" oder "fotopara" waere das anders - die stehen
   *    deshalb nicht in dieser Liste.
   *
   * Die Aufnahmen selbst liegen laengst in Firestore (fotosSpeichern),
   * nicht im Speicher der Seite. Mitzunehmen ist nur ihre Anzahl. */
  #standMerken() {
    if (!WIEDER_AUFNEHMBAR.includes(this.aktiv)) {
      // Kein Bildschirm zum Wiederaufnehmen - dann soll auch kein alter
      // Stand herumliegen, der beim naechsten Laden zurueckspringt.
      this.#standVergessen();
      return;
    }
    try {
      this.speicher?.setItem?.(STAND_SCHLUESSEL, JSON.stringify({
        schirm: this.aktiv,
        typ: this.zustand.typ || "",
        altWeg: this.zustand.altWeg === true,
        fotoAnzahl: Number(this.zustand.fotoAnzahl) || 0,
        nummerGegeben: this.zustand.nummerGegeben === true,
        // Aus den Feldern und nicht aus dem Zustand: Was der Browser
        // selbst eingesetzt hat (Autofill, eine Einfuegung ueber das
        // Kontextmenue) loest kein input-Ereignis aus und stand deshalb
        // nie im Zustand - im Feld aber schon.
        name: $("#ls-namefeld")?.value || "",
        alter: $$("#ls-alterwahl [data-gruppe]")
          .find((knopf) => knopf.getAttribute("aria-pressed") === "true")?.dataset.gruppe || "",
        anliegen: $("#ls-anliegenfeld")?.value || "",
        tel: $("#ls-telfeld")?.value || "",
        viber: $("#ls-viberfeld")?.value || "",
        viberOffen: $("#ls-viberbox")?.hidden === false
      }));
    } catch {
      // Ohne Speicher laeuft der Trichter wie bisher. Kein Grund,
      // deshalb etwas abzubrechen.
    }
  }

  #standHolen() {
    try {
      const roh = this.speicher?.getItem?.(STAND_SCHLUESSEL);
      if (typeof roh !== "string" || !roh) return null;
      const stand = JSON.parse(roh);
      if (!stand || !WIEDER_AUFNEHMBAR.includes(stand.schirm)) return null;
      return stand;
    } catch { return null; }
  }

  /* DIREKT AUF EINEN BILDSCHIRM - nur im stillen Modus.
     Heart verlinkt jeden Bildschirm einzeln (?still=1&schirm=tel&weg=foto),
     damit er sich ansehen laesst, ohne den ganzen Weg zu gehen. Ohne den
     stillen Modus gibt es das nicht: Ein Besucher, der mitten im Weg
     einsteigt, waere eine Zahl, die es nicht gab. Gemeldet wird deshalb
     auch hier nichts - die Anzeigen rufen ohne Schrittmeldung auf. */
  #stillSprung() {
    if (globalThis.__mnyraStill !== true) return false;
    let suche;
    try { suche = new URLSearchParams(globalThis.location?.search || ""); } catch { return false; }
    const schirm = suche.get("schirm") || "";
    if (!SCHIRME.includes(schirm) || schirm === "einstieg" || !$(`#ls-${schirm}`)) return false;
    const typ = WEG_ZU_TYP[suche.get("weg") || ""];
    if (typ) {
      this.zustand.typ = typ;
      this.zustand.paSkanim = typ !== "scan";
    }
    if (schirm === "kamera") this.#kameraStarten();
    else if (schirm === "foto") this.#fotoStarten();
    else if (schirm === "name") this.#nameZeigen(false);
    else if (schirm === "anliegen") this.#anliegenZeigen(false);
    else if (schirm === "tel") { if (!this.#telZeigen(false)) return false; }
    else this.zeige(schirm);
    return true;
  }

  #standVergessen() {
    try { this.speicher?.removeItem?.(STAND_SCHLUESSEL); } catch { /* egal */ }
  }

  /* Zurueck auf den Bildschirm, auf dem jemand stand - mit dem, was er
     geschrieben hatte. Gibt false zurueck, wenn nichts aufzunehmen ist;
     dann laeuft der Einstieg wie immer. */
  #standAufnehmen() {
    const stand = this.#standHolen();
    if (!stand) return false;

    this.zustand.typ = stand.typ || this.zustand.typ;
    this.zustand.altWeg = stand.altWeg === true;
    this.zustand.fotoAnzahl = Number(stand.fotoAnzahl) || 0;
    this.zustand.nummerGegeben = stand.nummerGegeben === true;

    const setzen = (wahl, wert) => {
      const feld = $(wahl);
      if (feld && typeof wert === "string" && wert) feld.value = wert;
    };
    setzen("#ls-namefeld", stand.name);
    setzen("#ls-anliegenfeld", stand.anliegen);
    setzen("#ls-telfeld", stand.tel);
    setzen("#ls-viberfeld", stand.viber);
    if (stand.viberOffen === true) this.#viberOeffnen(false);
    if (stand.alter) {
      for (const knopf of $$("#ls-alterwahl [data-gruppe]")) {
        knopf.setAttribute("aria-pressed",
          knopf.dataset.gruppe === stand.alter ? "true" : "false");
      }
      this.zustand.altersgruppe = stand.alter;
    }

    /* Der Bildschirm wird OHNE Schrittmeldung aufgebaut: Der Schritt
       steht laengst in der Sitzung (sie liegt im selben Speicher), und
       ihn erneut zu melden hiesse, denselben Besuch zweimal zu zaehlen,
       sobald ein Fenster den Tab neu laedt - und das tut es oft. */
    if (stand.schirm === "name") this.#nameZeigen(false);
    else if (stand.schirm === "anliegen") this.#anliegenZeigen(false);
    else if (stand.schirm === "tel") { if (!this.#telZeigen(false)) return false; }
    else return false;
    return true;
  }

  starte() {
    // HIER WURDE DAS GESICHTSNETZ GEHOLT - fuer JEDEN Besucher, beim
    // Oeffnen der Landingpage: rund 6,9 MB, dazu WebAssembly uebersetzen
    // und die Grafikkarte einrichten. Die meisten, die aus einer Anzeige
    // kommen, tippen nie auf "Fillo"; sie bezahlten es trotzdem - mit
    // Datenvolumen, mit einer Leitung, die in genau diesen Sekunden die
    // Seite selbst laden sollte, und mit Speicher in den knappen Fenstern
    // von Instagram und Facebook. Jetzt wird es erst geholt, wenn jemand
    // den Scan will: siehe #netzVormerken() und #wegWaehlen().
    // Vor allem anderen: Wer sofort wieder weggeht, soll trotzdem gezaehlt
    // sein. Ohne Pixel-Kennung tut die Zeile nichts.
    if (this.pixel.starte()) this.pixel.melde("opened");
    this.#texteSetzen();
    this.#ereignisse();

    // Kommt jemand zurueck, faengt er nicht von vorne an.
    //
    // Der WhatsApp-Link ersetzt in den Fenstern von Instagram, TikTok und
    // Facebook unsere Seite. Wer danach auf Zurueck drueckt, laedt sie neu -
    // und stuende ohne diese Zeilen wieder bei der Namenseingabe, mit allem
    // Gedrehten und Gemessenen verloren. Das ist genau die Zielgruppe, aus
    // der die Besucher kommen.
    // Wer den Scan schon hinter sich hat, gehoert nicht in den Trichter,
    // sondern auf seine Seite. Das trifft jeden, der aus dem Fenster von
    // Instagram oder TikTok zurueckkommt: Dort ersetzt der WhatsApp-Link
    // unsere Seite, und "Zurueck" laedt sie neu.
    if (this.sitzung.fortsetzbar()) {
      globalThis.location.replace(this.sitzung.berichtPfad);
      return;
    }
    /* Und wer mitten im Weg war, kommt dorthin zurueck - mit dem, was
       er geschrieben hatte. Geht das nicht, faengt der Einstieg an wie
       immer; #standAufnehmen() sagt es mit false. */
    const aufgenommen = this.#stillSprung() || this.#standAufnehmen();
    const direkt = aufgenommen ? null : this.#direktWegLesen();
    if (!aufgenommen) this.zeige("einstieg");
    // Erst jetzt, mit stehendem Aufbau: Vorher waeren die Stuecke noch
    // ohne Platz und jedes gaelte als "schon im Bild".
    this.#einblenden();

    this.sitzung.starte({ sprache: this.sprache });

    // ZULETZT, und das ist die Reihenfolge, auf die es ankommt: Erst steht
    // die Sitzung, dann wird der Tipp nachgeholt, der waehrend des Ladens
    // kam. Andersherum zaehlte #startTippen() einen Schritt auf einer
    // Sitzung, die es noch nicht gibt.
    this.#frueherTippNachholen();

    // Der Klickpfad (shared/lifeskin-klickpfad.js): Landingpage und
    // Trichter - welche Abschnitte gelesen, welche Karten getippt, welche
    // Bildschirme erreicht. Hinter dem Anlegen der Sitzung, damit er in
    // derselben Kette danach schreibt.
    this.klickpfad = starteKlickpfad({
      seite: "Landing/Trichter",
      schreiben: (stapel) => this.sitzung.klickpfadSchreiben(stapel),
      namen: KLICKPFAD_NAMEN
    });
    this.klickpfad.melde("bildschirm", KLICKPFAD_NAMEN[`ls-${this.aktiv}`] || this.aktiv || "");

    // Aus dem Chrome-Link (#chromeAdresse): gleich auf den Weg, den der
    // Besucher in der App schon gewaehlt hatte - es sei denn, er hat
    // inzwischen selbst getippt.
    if (direkt && this.aktiv === "einstieg") {
      this.#technik(`Aus dem Chrome-Link geöffnet: ${direkt}`);
      this.#startTippen();
      if (this.aktiv === "wahl") this.#wegWaehlen(direkt);
    }
  }

  // Der Weg aus dem Chrome-Link (?ls_weg=skanim|foto) - nur, wo es den
  // Wahlbildschirm gibt; die Kamera selbst geht erst auf einen Tipp auf.
  //
  // Die Angabe verlaesst die Adresse sofort wieder: Ein Neuladen soll
  // nicht noch einmal springen, und wer die Adresse weitergibt, schickt
  // die Landingpage und nicht die Mitte des Trichters.
  #direktWegLesen() {
    let suche;
    try { suche = new URLSearchParams(globalThis.location?.search || ""); } catch { return null; }
    const weg = suche.get("ls_weg");
    if (!["skanim", "foto"].includes(weg) || !$("#ls-wahl")) return null;
    try {
      suche.delete("ls_weg");
      const rest = suche.toString();
      globalThis.history?.replaceState?.(globalThis.history.state, "",
        `${globalThis.location.pathname}${rest ? `?${rest}` : ""}`);
    } catch { /* Dann bleibt die Angabe stehen - sie schadet nicht. */ }
    return weg;
  }

  zeige(name, { verlauf = "vor" } = {}) {
    if (name !== this.aktiv) this.klickpfad?.melde("bildschirm", KLICKPFAD_NAMEN[`ls-${name}`] || name);
    for (const schirm of SCHIRME) {
      const knoten = $(`#ls-${schirm}`);
      if (knoten) knoten.dataset.aktiv = schirm === name ? "ja" : "nein";
    }
    const vorher = this.aktiv;
    this.aktiv = name;

    const balken = $(".ls-fortschritt__balken");
    if (balken) balken.style.width = `${this.#fortschritt(name)}%`;

    // Die Karten laufen nur auf ihrem eigenen Bildschirm.
    if (name === "einstieg") this.#kartenLaufen();
    else this.#kartenAnhalten();

    // Der Zurueck-Pfeil erscheint nur, wo es etwas zurueckzugehen gibt -
    // und das wird gefragt statt geraten. Nach der Aufnahme gibt es
    // keinen Weg zurueck (er hiesse: noch einmal scannen), und ein Pfeil,
    // der nichts tut, ist schlimmer als keiner.
    const zurueck = $(`#ls-${name} [data-zurueck]`);
    if (zurueck) {
      zurueck.hidden = name === "einstieg" || name === "danke"
        || !this.vorherigerSchirm(name);
    }

    // JEDER BILDSCHIRM FAENGT OBEN AN - AUSSER DEM ERSTEN BEIM LADEN.
    //
    // Fuer die Bildschirme des Trichters ist diese Zeile richtig: Jeder ist
    // eine eigene Seite, und wer von der dritten Frage zur vierten geht,
    // soll deren Ueberschrift sehen und nicht deren Mitte.
    //
    // Beim ALLERERSTEN Aufruf (this.aktiv ist noch ungesetzt) tut sie etwas
    // anderes: Sie
    // nimmt dem Browser die Wiederherstellung der Scrollstellung weg. Der
    // Einstieg ist seit dem Umbau eine lange, selbst scrollende Seite - wer
    // sie neu laedt, stand danach wieder ganz oben, obwohl er bei den Fragen
    // war. Auf normalen Seiten passiert das nicht, und im Browser von
    // Instagram passiert Neuladen oft: Die App laedt den Tab neu, sobald man
    // aus ihm heraus und wieder hinein wechselt.
    //
    // Nichts am Trichter aendert sich dadurch. Der erste Aufruf gilt immer
    // dem Bildschirm, der ohnehin gerade dasteht; gescrollt wuerde also auf
    // eine Stelle, an der noch niemand etwas getan hat.
    if (vorher) window.scrollTo(0, 0);

    // Wo jemand steht, wird bei jedem Wechsel festgehalten - auch bei
    // denen ohne Verlaufseintrag. Sonst bliebe beim Weitergehen von
    // "tel" der alte Stand liegen und ein Neuladen spraenge zurueck.
    this.#standMerken();

    if (verlauf === "nein" || !IM_VERLAUF.includes(name)) return;
    // KEIN EINTRAG OHNE RUECKWEG. Ein Eintrag, von dem aus zurueckZu()
    // nichts zu tun hat, kostet einen Druck auf den Zurueck-Knopf, ohne
    // dass sich etwas bewegt - und auf dem Weg mit Scan waere der Weg
    // zurueck die Aufnahme selbst, die niemand zweimal macht.
    if (vorher && !this.vorherigerSchirm(name)) return;
    try {
      if (!vorher) {
        history.replaceState({ ls: name }, "");
      } else if (name === "danke") {
        history.replaceState({ ls: name }, "");
      } else {
        history.pushState({ ls: name }, "");
      }
    } catch {
      // Ohne Verlauf laeuft der Trichter weiter. Nur der Zurueck-Knopf des
      // Browsers verhaelt sich dann wie vorher.
    }
  }

  // Ein Schritt zurueck, egal ob per Pfeil oder per Browser-Knopf.
  //
  // Die Kamera wird dabei immer abgeschaltet: Ein weiterlaufender Kamerastrom
  // hinter einem anderen Bildschirm leert den Akku, laesst die Leuchte an und
  // ist auf dem Handy das Erste, was auffaellt.
  zurueckZu(ziel) {
    if (!SCHIRME.includes(ziel)) return;
    if (this.aktiv === "kamera") this.#scanVerlassenMelden();
    this.#kameraStoppen();
    this.zeige(ziel, { verlauf: "nein" });
  }

  // TECHNIK IM KLICKPFAD - damit sich pro Besucher zeigt, ob Kamera,
  // Gesichtserkennung und Upload wirklich funktionieren, und wo es hakt
  // (Heart: Fall -> Klickpfad, Zeilen "Technik").
  #technik(text) {
    try { this.klickpfad?.melde("technik", text); } catch { /* nie den Trichter stoeren */ }
  }

  // Nimmt das Versprechen von fotosSpeichern() - der Upload laeuft im
  // Hintergrund weiter, die Zeile kommt, wenn er fertig ist.
  #uploadMelden(versprechen) {
    Promise.resolve(versprechen).then((e) => this.#uploadZeile(e), () => {});
  }

  #uploadZeile(e) {
    if (!e || typeof e !== "object") return;
    this.#technik(e.fehler
      ? `Foto-Upload FEHLGESCHLAGEN: ${e.fehler} von ${e.ok + e.fehler} · ${e.grund}`
      : `Fotos hochgeladen: ${e.ok} · ${e.kb} KB · ${(e.ms / 1000).toFixed(1)} s`);
  }

  #scanVerlassenMelden() {
    const ab = this.kamera.startAb || Date.now();
    const anteil = Math.round((this.kamera.ring?.anteil || 0) * 100);
    const modus = this.kamera.modus === "ring" ? "Ring" : (this.kamera.netzWartet ? "Erkennung lädt noch" : "einfache Erkennung");
    this.#technik(`Scan verlassen nach ${Math.round((Date.now() - ab) / 1000)} s · ${modus} · Ring ${anteil} % · Gesicht ${this.zustand.erkannt ? "erkannt" : "nicht erkannt"}`);
  }

  // Wohin ein Zurueck von hier fuehrt.
  // WOHIN DER PFEIL ZURUECK FUEHRT - und zwar nur auf Bildschirme, die
  // diese Seite WIRKLICH ENTHAELT. Stuende hier ein Name, den der Aufbau
  // nicht kennt, waere danach gar keiner sichtbar: eine weisse Seite.
  //
  // Deshalb wird jeder Vorschlag am Aufbau geprueft und auf den naechsten
  // zurueckgefallen, den es gibt. Die drei Fassungen haben verschiedene
  // Wege: die lange mit Vorbereitung, die kurze ohne, die Landingpage mit
  // Wahlbildschirm UND Vorbereitung.
  vorherigerSchirm(von = this.aktiv) {
    const gibtEs = (name) => Boolean($(`#ls-${name}`));
    const ersterVon = (...namen) => namen.find(gibtEs) || null;
    // Vor der Kamera liegt die Anleitung, davor die Wahl, davor der
    // Einstieg - und was davon fehlt, wird uebersprungen.
    const vorDerKamera = ersterVon("vorbereitung", "wahl", "einstieg");
    return {
      wahl: "einstieg",
      vorbereitung: ersterVon("wahl", "einstieg"),
      kamera: vorDerKamera,
      // Der Weg mit Foto hat seine eigene Anleitung, und hinter der
      // Aufnahme liegt sie und nicht die des Scans: Wer von dort
      // zurueckgeht, will das Foto neu machen, nicht den Ring.
      fotopara: ersterVon("wahl", "einstieg"),
      foto: ersterVon("fotopara", "wahl", "einstieg"),
      // "Sqaroni problemet" ist ein eigener Bildschirm, seit Name und
      // Alter davor stehen. Der Weg zurueck fuehrt deshalb dorthin und
      // nicht mehr auf die Menyra.
      anliegen: ersterVon("name", "wahl", "einstieg"),
      // DIE NUMMER LIEGT AUF DREI WEGEN AN DREI VERSCHIEDENEN STELLEN.
      //
      // Auf "Per trupin ose vetem pyetje" hinter dem Anliegen, mit
      // Aufnahme hinter Name und Alter. Ein fester Vorgaenger waere auf
      // zwei von drei Wegen der falsche Bildschirm.
      tel: this.#trupWeg()
        ? ersterVon("anliegen", "name", "wahl", "einstieg")
        : ersterVon("name", "wahl", "einstieg"),
      // Vor dem Namensschirm liegt das, was der jeweilige Weg davor
      // hatte: auf "Per trupin ose vetem pyetje" unmittelbar die Menyra,
      // mit Foto die Aufnahme - die laesst sich wiederholen, der Scan
      // nicht. Dorthin zurueckzuspringen hiesse beim Scan, ihn noch
      // einmal zu machen; deshalb steht dort null.
      name: this.zustand.typ === "foto"
        ? ersterVon("fotopara", "wahl", "einstieg")
        : (this.#trupWeg() ? ersterVon("wahl", "einstieg")
          : (this.zustand.altWeg ? ersterVon("fragen", "wahl", "einstieg") : null)),
      analyse: vorDerKamera
    }[von] || null;
  }

  // EIN KNOPF, DER NOCH NICHT SO WEIT IST, BLEIBT EIN KNOPF.
  //
  // Er trug das Merkmal disabled, und ein Element mit disabled bekommt
  // ueberhaupt kein Klickereignis - der Tipp lief ins Leere, und die
  // Seite konnte auch nicht sagen, was fehlt. Wer seinen Text ueber das
  // Kontextmenue eingefuegt hatte (kein input-Ereignis, also kein
  // Zustand), sah ein volles Feld und einen Knopf, der nichts tut.
  //
  // Jetzt sagt aria-disabled dem Vorleseprogramm dasselbe, der Tipp
  // kommt aber an - und der Knopf sieht selbst im Feld nach.
  #knopfBereit(knopf, bereit) {
    if (!knopf) return;
    knopf.setAttribute("aria-disabled", bereit ? "false" : "true");
    // Sicherheitshalber: Kam der Knopf mit disabled aus dem Aufbau,
    // wird er hier zum ersten Mal wieder klickbar.
    knopf.disabled = false;
  }

  // Laeuft gerade der zusammengefuehrte Weg?
  //
  // EINE STELLE FUER DIE FRAGE, und das ist seit der Zusammenfuehrung
  // wichtiger als vorher: "Trup" und "Pytje" sind ein Weg, tragen aber
  // weiter zwei Kennungen - die alte Karte der Vorlage schreibt "pytje",
  // und jeder Fall von vorher traegt eine der beiden. Wer die Frage an
  // fuenf Stellen einzeln stellt, vergisst eine davon.
  #trupWeg() {
    return this.zustand.typ === "trup" || this.zustand.typ === "pytje";
  }

  // Wie weit der Balken steht. Wegabhaengig, weil derselbe Bildschirm
  // auf zwei Wegen an verschiedenen Stellen liegt.
  #fortschritt(schirm) {
    if (this.#trupWeg() && FORTSCHRITT_TRUP[schirm] !== undefined) {
      return FORTSCHRITT_TRUP[schirm];
    }
    return FORTSCHRITT[schirm] ?? 20;
  }

  // Alle Beschriftungen aus lifeskin-content.js. Im Aufbau steht keine
  // einzige Zeichenkette - sonst waere die zweite Sprache nachtraeglich
  // nicht mehr einzuziehen.
  #texteSetzen() {
    this.#kartenBauen();
    this.#alterBauen();
    for (const knoten of $$("[data-text]")) {
      const wert = this.text(knoten.dataset.text);
      // EIN UNBEKANNTER SCHLUESSEL LOESCHT KEINEN FESTSTEHENDEN TEXT.
      //
      // t() gibt fuer alles, was nicht in OBERFLAECHE steht, eine leere
      // Zeichenkette zurueck - und die stand hier bisher ungeprueft im
      // Knoten. Auf dem langen Einstieg, dessen Saetze im Aufbau stehen,
      // waere aus einem Tippfehler im Schluessel eine leere Zeile
      // geworden: sichtbar erst im Browser, und dort auf genau dem
      // Bildschirm, der die Besucher halten soll.
      if (!wert) continue;
      schreibe(knoten, wert);
    }
    for (const knoten of $$("[data-platzhalter]")) {
      knoten.placeholder = this.text(knoten.dataset.platzhalter);
    }
    // Knoepfe, die nur ein Zeichen tragen.
    //
    // Der Ausloeser der Flaechenkamera und der Umschalter daneben sind
    // rund und leer - so sieht jede Kamera-App aus, und mit Beschriftung
    // saehe dieser Bildschirm aus wie ein Formular. Wer nicht sieht,
    // bekommt dann aber "Schaltflaeche" und sonst nichts; deshalb steht
    // der Name im aria-label, aus demselben Verzeichnis wie alles andere.
    for (const knoten of $$("[data-marke]")) {
      const wert = this.text(knoten.dataset.marke);
      if (wert) knoten.setAttribute("aria-label", wert);
    }
    schreibe($("#ls-einstieghinweis"), t(EINSTIEG_HINWEIS, this.sprache));

    // Die Zeichen im Aufbau, aus derselben Tabelle wie die der Karten.
    //
    // Der Aufbau traegt sie als Huelle mit data-zeichen. So steht jeder
    // Pfad genau einmal - und wer ihn aendert, aendert ihn ueberall, wo er
    // steht.
    //
    // VORANGESTELLT, NICHT ANGEHAENGT, und geprueft wird auf ein
    // vorhandenes SVG statt auf irgendein Kindelement. Beides haengt am
    // feststehenden Text des Einstiegs: Dort traegt der Satz unter der
    // ersten Karte sein Zeichen selbst, mit Text daneben. Angehaengt
    // stuende das Siegel hinter dem Satz statt davor, und die Pruefung auf
    // firstElementChild haette es bei einem Kasten mit Text ueberhaupt
    // nicht bemerkt.
    for (const knoten of $$("[data-zeichen]")) {
      if (knoten.querySelector("svg")) continue;
      const svg = this.#zeichen(knoten.dataset.zeichen, Number(knoten.dataset.groesse) || 22);
      if (svg) knoten.prepend(svg);
    }
  }

  // ---------- Der Inhalt kommt beim Scrollen herein ----------
  //
  // Dieselbe Bewegung wie auf der Befundseite (apps/lifeskin-astra): ein
  // Stueck von unten, weich eingeblendet. Sie sagt beim Wischen, dass
  // gerade etwas Neues anfaengt - und genau deshalb wird es gelesen statt
  // ueberflogen.
  //
  // Drei Regeln, aus derselben Erfahrung wie dort:
  //
  //   1. ALLES BEGINNT SICHTBAR. Ohne data-kommt gilt im Stilblatt keine
  //      einzige Regel dazu. Gesetzt wird es erst hier, und erst, wenn der
  //      Weg zum Wiedereinblenden steht. Faellt das Skript aus, steht die
  //      ganze Seite da.
  //   2. GERECHNET, NICHT BEOBACHTET. Ein IntersectionObserver meldet nur
  //      Wechsel: Springt die Seite in einem Satz ueber ein Stueck hinweg -
  //      was ein Telefon beim schnellen Wischen tut -, gibt es keinen
  //      Wechsel, und das Stueck bliebe fuer immer unsichtbar.
  //   3. WAS BEIM OEFFNEN SCHON IM BILD STEHT, WIRD NIE VERSTECKT.
  //
  // Gescrollt wird hier der Inhaltskasten und nicht das Fenster - die
  // Grenze wird deshalb an SEINER Hoehe gemessen, nicht an der des
  // Bildschirms.
  #einblenden() {
    const kasten = $("#ls-einstieg .ls-inhalt");
    if (!kasten) return;
    // Wer Bewegung abbestellt hat, bekommt keine - und zwar so, dass gar
    // nichts erst versteckt wird.
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const kante = (anteil) => {
      const k = kasten.getBoundingClientRect();
      return k.top + k.height * anteil;
    };

    // Erst ab der Kante, nicht knapp darunter: Eine Bewegung, die
    // ausserhalb des Bildes ablaeuft, ist da und sieht sie niemand.
    const schonSichtbar = kante(0.95);
    let offen = $$(LANDING_TEILE, kasten)
      .filter((el) => el.getBoundingClientRect().top >= schonSichtbar);
    if (!offen.length) return;
    for (const el of offen) el.dataset.kommt = "warte";

    const pruefen = () => {
      if (!offen.length) return;
      const grenze = kante(0.90);
      const bleibt = [];
      let i = 0;
      for (const el of offen) {
        if (el.getBoundingClientRect().top >= grenze) { bleibt.push(el); continue; }
        // WAS ZUSAMMEN ANKOMMT, KOMMT NACHEINANDER. Drei Schritte, die in
        // derselben Messung ueber die Kante rutschen, sollen sich
        // staffeln; ein einzelnes Stueck wartet auf niemanden. Gedeckelt,
        // sonst wartet das letzte laenger, als die Bewegung dauert.
        el.style.setProperty("--nach", String(Math.min(i, 5)));
        el.dataset.kommt = "da";
        i += 1;
      }
      offen = bleibt;
    };

    // WARUM HIER EIN NACHLAUF STEHT UND NICHT NUR EIN HORCHER.
    //
    // Auf iOS wird waehrend des Schwungs nach dem Loslassen gescrollt,
    // ohne dass dabei verlaesslich Scrollereignisse kommen: Safari fasst
    // sie zusammen oder liefert sie erst am Ende. Genau in dieser Zeit
    // legt ein Wisch die halbe Seite zurueck - die Stuecke waeren also
    // schon oben, wenn das erste Ereignis eintrifft, und stuenden
    // einfach da. Die Bewegung lief nie vor den Augen ab, und auf dem
    // Telefon sah es aus, als gaebe es sie nicht.
    //
    // Der Nachlauf misst deshalb nach jeder Beruehrung eine Weile lang
    // bei jedem Bild weiter. Er haelt von selbst an: wenn nichts mehr
    // offen ist, oder wenn sich der Stand eine halbe Sekunde nicht mehr
    // bewegt hat. Damit laeuft er waehrend des Schwungs und sonst nie.
    let laeuft = false;
    let ruheSeit = 0;
    let letzterStand = -1;
    const takt = globalThis.requestAnimationFrame || ((f) => setTimeout(f, 16));
    const nachlaufen = () => {
      if (!offen.length) { laeuft = false; return; }
      pruefen();
      const jetzt = Date.now();
      if (kasten.scrollTop !== letzterStand) {
        letzterStand = kasten.scrollTop;
        ruheSeit = jetzt;
      }
      // Eine halbe Sekunde ohne Bewegung heisst: Der Schwung ist vorbei.
      if (jetzt - ruheSeit > 500) { laeuft = false; return; }
      takt(nachlaufen);
    };
    const anstossen = () => {
      if (!offen.length) return;
      ruheSeit = Date.now();
      if (laeuft) return;
      laeuft = true;
      takt(nachlaufen);
    };

    kasten.addEventListener("scroll", anstossen, { passive: true });
    // Und am Finger selbst: Waehrend des Ziehens kommen touchmove-
    // Ereignisse auch dort, wo Scrollereignisse zusammengefasst werden.
    kasten.addEventListener("touchmove", anstossen, { passive: true });
    kasten.addEventListener("touchend", anstossen, { passive: true });
    // Ein gedrehtes Telefon bringt Stuecke ins Bild, ohne dass jemand
    // scrollt.
    globalThis.addEventListener?.("resize", anstossen, { passive: true });
    pruefen();
  }

  // ---------- Die wechselnden Karten des Einstiegs ----------
  //
  // Sie stehen in EINSTIEG_KARTEN (lifeskin-content.js) - Reihenfolge,
  // Standzeit und ob ein Bild dazugehoert. Hier wird nur vorgefuehrt.

  // Die Zeichen, die auf den Karten stehen koennen.
  //
  // AN EINER STELLE und als reine Pfaddaten: Lucide liefert sie als
  // fertige Bausteine, aber dafuer muesste eine Seite, die in einer
  // Sekunde stehen muss, ein Paket nachladen. Die beiden Pfade hier wiegen
  // zusammen weniger als die Anfrage danach.
  //
  // Dieselbe Machart wie die Zeichen im Aufbau (Strichstaerke 2, 24er
  // Raster, runde Enden) - sonst sieht ein Zeichen fremd aus zwischen
  // denen, die schon da sind.
  static ZEICHEN = Object.freeze({
    // Ein Gesicht in einem Suchrahmen. Genau das, was der Knopf startet.
    "scan-face": [
      "M3 7V5a2 2 0 0 1 2-2h2", "M17 3h2a2 2 0 0 1 2 2v2",
      "M21 17v2a2 2 0 0 1-2 2h-2", "M7 21H5a2 2 0 0 1-2-2v-2",
      "M8 14s1.5 2 4 2 4-2 4-2", "M9 9h.01", "M15 9h.01"
    ],
    // Ein Haken im Siegel: "das gilt" - fuer den Satz ueber den Preis.
    "badge-check": [
      "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
      "m9 12 2 2 4-4"
    ]
  });

  #zeichen(name, groesse = 24) {
    const pfade = Trichter.ZEICHEN[name];
    if (!pfade) return null;
    const raum = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(raum, "svg");
    svg.setAttribute("width", String(groesse));
    svg.setAttribute("height", String(groesse));
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    // Das Zeichen sagt nichts, was der Satz daneben nicht schon sagt.
    svg.setAttribute("aria-hidden", "true");
    for (const d of pfade) {
      const pfad = document.createElementNS(raum, "path");
      pfad.setAttribute("d", d);
      svg.appendChild(pfad);
    }
    return svg;
  }

  // Die Altersgruppen als Knoepfe - aus dem Katalog und nicht von Hand.
  //
  // Der Befund vergleicht gegen dieselbe Einteilung. Stuenden sie hier
  // noch einmal getippt, liefen die beiden Listen irgendwann auseinander,
  // und die Aufbereitung verglichen gegen eine Gruppe, die es nicht gibt.
  //
  // Nur einmal: #texteSetzen() laeuft bei jedem Sprachwechsel erneut.
  // Die Altersgruppen zum Antippen.
  //
  // ZWEI KAESTEN, NICHT EINER: Der Namensschirm (nach Scan und Foto) und
  // der Anliegenschirm (Trup und Pytje) fragen dasselbe an zwei Stellen
  // im Weg. Ein gemeinsamer Kasten muesste zwischen den Bildschirmen
  // umziehen - und ein Element, das umzieht, verliert unterwegs seinen
  // Zustand.
  //
  // Die Gruppen kommen aus dem Katalog, nicht von Hand: Der Befund
  // vergleicht gegen dieselbe Einteilung.
  #alterBauen() {
    // EIN KASTEN, nicht mehr zwei. Der Anliegenschirm fragt Name und
    // Alter nicht mehr - sie stehen auf dem Bildschirm davor, und der
    // ist auf jedem Weg derselbe.
    for (const kennung of ["#ls-alterwahl"]) {
      const kasten = $(kennung);
      if (!kasten || kasten.children.length) continue;
      for (const gruppe of ALTERSGRUPPEN) {
        const knopf = document.createElement("button");
        knopf.type = "button";
        knopf.className = "ls-alter__wahl";
        knopf.textContent = gruppe;
        knopf.setAttribute("aria-pressed", "false");
        knopf.dataset.gruppe = gruppe;
        kasten.appendChild(knopf);
      }
    }
  }

  #kartenBauen() {
    const kasten = $("#ls-karten");
    if (!kasten) return;
    const punkte = $("#ls-punkte");

    // DIE KARTEN STEHEN SCHON IM AUFBAU - in der Sprache, die dort
    // vermerkt ist.
    //
    // Der Grund steht in index.html: Feststehender Text ist da, sobald die
    // erste Antwort des Servers da ist, und nicht erst nach elf Modulen.
    // Auf 3G waren das 4,7 Sekunden Unterschied.
    //
    // Stimmt die Sprache, bleibt alles stehen und es wird nichts gebaut.
    // Stimmt sie nicht - also fuer jeden Besucher, der nicht Albanisch
    // bekommt -, wird geraeumt und neu gebaut. Damit bleibt die zweite
    // Sprache einziehbar, was der Grund fuer die alte Regel war.
    if (kasten.children.length) {
      if (kasten.dataset.sprache === this.sprache) return;
      kasten.textContent = "";
      if (punkte) punkte.textContent = "";
    }
    kasten.dataset.sprache = this.sprache;

    for (const [i, karte] of EINSTIEG_KARTEN.entries()) {
      const el = document.createElement("div");
      el.className = "ls-karte";
      el.dataset.aktiv = i === 0 ? "ja" : "nein";

      // LEER BEDEUTET AUS: ohne Bild ein Zeichen, ohne beides nichts - und
      // die Karte steht trotzdem.
      if (karte.bild && ARZT_BILD) {
        const bild = document.createElement("img");
        bild.className = "ls-karte__bild";
        bild.src = ARZT_BILD;
        bild.alt = ARZT_NAME;
        bild.width = 56;
        bild.height = 56;
        bild.decoding = "async";
        el.appendChild(bild);
      } else if (karte.zeichen) {
        const kreis = document.createElement("span");
        kreis.className = "ls-karte__zeichen";
        const svg = this.#zeichen(karte.zeichen, 28);
        if (svg) kreis.appendChild(svg);
        el.appendChild(kreis);
      }

      // EIN h1 auf der Seite, nicht zwei.
      //
      // Die erste Karte traegt die Ueberschrift, die zweite ist ein Absatz
      // in derselben Schrift. Zwei Ueberschriften uebereinander waeren fuer
      // ein Vorleseprogramm zwei Kapitel, wo eines steht - und fuer eine
      // Suchmaschine eine Seite ohne Thema.
      const titel = document.createElement(i === 0 ? "h1" : "p");
      titel.className = "ls-karte__titel";
      // DER ZEILENUMBRUCH IST TEIL DES TEXTES, nicht des Geraets: Wo er
      // steht, entscheidet der Satz. Ohne ihn bricht der Browser dort um,
      // wo gerade Platz ist, und derselbe Satz liest sich auf jedem Telefon
      // anders.
      for (const [z, zeile] of t(karte.titel, this.sprache).split("\n").entries()) {
        if (z > 0) titel.appendChild(document.createElement("br"));
        titel.appendChild(document.createTextNode(zeile));
      }
      el.appendChild(titel);

      const unter = t(karte.unter, this.sprache);
      if (unter) {
        const zeile = document.createElement("p");
        zeile.className = "ls-karte__unter";
        const svg = karte.unterZeichen ? this.#zeichen(karte.unterZeichen, 21) : null;
        if (svg) zeile.appendChild(svg);
        zeile.appendChild(document.createTextNode(unter));
        el.appendChild(zeile);
      }

      kasten.appendChild(el);

      if (punkte) {
        const punkt = document.createElement("span");
        punkt.className = "ls-punkt";
        punkt.dataset.aktiv = i === 0 ? "ja" : "nein";
        punkte.appendChild(punkt);
      }
    }
  }

  #karteZeigen(index) {
    const karten = $$("#ls-karten .ls-karte");
    if (!karten.length) return;
    this.karten.i = ((index % karten.length) + karten.length) % karten.length;
    for (const [i, el] of karten.entries()) {
      el.dataset.aktiv = i === this.karten.i ? "ja" : "nein";
    }
    for (const [i, el] of $$("#ls-punkte .ls-punkt").entries()) {
      el.dataset.aktiv = i === this.karten.i ? "ja" : "nein";
    }
  }

  // Die Standzeit der Karte, die GERADE steht - nicht eine Zahl fuer alle.
  // Eine Karte mit zwei Zeilen braucht laenger als eine mit vier Woertern,
  // und zu kurz heisst: nicht gelesen.
  #karteDauer() {
    return Number(EINSTIEG_KARTEN[this.karten.i]?.dauerMs) || 3600;
  }

  #kartenLaufen() {
    // Ohne Kartenkasten gibt es nichts zu wechseln. Der lange Einstieg der
    // kurzen Fassung hat keinen - ohne diese Pruefung liefe dort eine Uhr,
    // die alle paar Sekunden aufwacht und nichts tut.
    if (this.karten.uhr || EINSTIEG_KARTEN.length < 2 || !$("#ls-karten")) return;
    const weiter = () => {
      // WER DIE SEITE GERADE NICHT ANSIEHT, BEKOMMT KEINEN WECHSEL.
      //
      // Ohne diese Zeile laufen im Hintergrund alle vier Karten durch -
      // und wer aus WhatsApp oder aus einer Benachrichtigung zurueckkommt,
      // findet die letzte vor und hat die erste nie gesehen. Die Uhr laeuft
      // trotzdem weiter, sie zaehlt nur nicht hoch.
      if (!globalThis.document?.hidden) this.#karteZeigen(this.karten.i + 1);
      this.karten.uhr = setTimeout(weiter, this.#karteDauer());
    };
    this.karten.uhr = setTimeout(weiter, this.#karteDauer());
  }

  // Eine Uhr, die hinter einem anderen Bildschirm weiterlaeuft, ist ein
  // Fehler, den man erst am Akku merkt.
  #kartenAnhalten() {
    if (!this.karten.uhr) return;
    clearTimeout(this.karten.uhr);
    this.karten.uhr = 0;
  }

  #ereignisse() {
    // Der Zurueck-Knopf des Browsers.
    //
    // Ohne diese Behandlung verliess er den Trichter ganz und der Besucher
    // landete irgendwo anders - bei jemandem, der aus einer Anzeige kommt,
    // heisst das: weg. Auf dem Handy ist die Wischgeste nach rechts derselbe
    // Weg, also trifft es mehr Leute, als man denkt.
    window.addEventListener("popstate", (ereignis) => {
      const ziel = ereignis.state?.ls;
      // Kein eigener Zustand: Der Besucher ist vor dem Trichter angekommen
      // und darf gehen.
      if (!ziel || !SCHIRME.includes(ziel)) return;
      this.zurueckZu(ziel);
    });

    // Der sichtbare Pfeil. Viele benutzen den Browser-Knopf nie.
    for (const knopf of $$("[data-zurueck]")) {
      knopf.addEventListener("click", () => {
        // IN DER FOTO-VORSCHAU HEISST ZURUECK "NOCH EINMAL". Gemessen: Jede
        // Vierte tippte nach "Bëj foton" auf den Pfeil statt auf "Bëje
        // përsëri" - und landete ganz vorne bei der Wahl (LS-2509-5SH64
        // fuenfmal hintereinander). Jetzt geht es zurueck in die Kamera.
        if (this.aktiv === "foto" && $("#ls-fotobuehne")?.dataset.stand === "vorschau") {
          this.klickpfad?.melde("technik", "Pfeil zurück in der Foto-Vorschau → neue Aufnahme");
          this.#fotoNochmal();
          return;
        }
        const ziel = this.vorherigerSchirm();
        if (!ziel) return;
        // ueber den Verlauf zurueck, damit beide Wege dieselbe Kette teilen
        // und der Vorwaerts-Knopf danach noch stimmt.
        if (history.state?.ls && history.length > 1) history.back();
        else this.zurueckZu(ziel);
      });
    }

    $("#ls-start")?.addEventListener("click", () => this.#startTippen());

    // Die zwei Karten des Wahlbildschirms. Ueber ein Merkmal und nicht
    // ueber zwei Kennungen: So kostet eine dritte Karte keine dritte
    // Zeile hier.
    for (const karte of $$("[data-ls-weg]")) {
      karte.addEventListener("click", () => this.#wegWaehlen(karte.dataset.lsWeg));
    }

    // Name und Alter. Beide Horcher pruefen denselben Knopf - er geht auf,
    // sobald BEIDES dasteht, und nicht bei einem von beiden.
    //
    // Drei Ereignisse statt einem: change und blur fangen, was der
    // Browser selbst einsetzt - Autofill und Einfuegen ueber das
    // Kontextmenue loesen input nicht zuverlaessig aus.
    for (const ereignisName of ["input", "change", "blur"]) {
      $("#ls-namefeld")?.addEventListener(ereignisName, () => {
        this.#nameWeiterPruefen();
        this.#nameFehler(null);
      });
    }
    $("#ls-alterwahl")?.addEventListener("click", (ereignis) => {
      const knopf = ereignis.target.closest("[data-gruppe]");
      if (!knopf) return;
      for (const anderer of $$("#ls-alterwahl .ls-alter__wahl")) {
        anderer.setAttribute("aria-pressed", anderer === knopf ? "true" : "false");
      }
      this.zustand.altersgruppe = knopf.dataset.gruppe;
      this.#nameWeiterPruefen();
      this.#nameFehler(null);
    });
    $("#ls-nameweiter")?.addEventListener("click", () => this.#nameWeiter());

    // ── Me foto ──────────────────────────────────────────────────────
    $("#ls-fotoweiter")?.addEventListener("click", () => this.#fotoStarten());
    $("#ls-fotoausloeser")?.addEventListener("click", () => this.#fotoAusloesen());
    $("#ls-fotowechseln")?.addEventListener("click", async () => {
      if (!this.flaeche || this.aktiv !== "foto") return;
      const buehne = $("#ls-fotobuehne");
      if (buehne) buehne.dataset.bereit = "nein";
      const auf = await this.flaeche?.wechsle();
      if (this.aktiv !== "foto" || !auf) return;
      if (buehne && this.flaeche) {
        buehne.dataset.bereit = auf ? "ja" : "nein";
        buehne.dataset.richtung = this.flaeche.richtung;
      }
    });
    $("#ls-fotonochmal")?.addEventListener("click", () => this.#fotoNochmal());
    $("#ls-fotonehmen")?.addEventListener("click", () => this.#fotoNehmen());

    // ── Sqaroni problemet ────────────────────────────────────────────
    //
    // Name und Alter standen auf diesem Bildschirm ein zweites Mal, mit
    // eigenen Kennungen. Sie stehen jetzt davor, auf demselben
    // Bildschirm wie nach einer Aufnahme - ein Wert, zwei Felder waeren
    // eine Gelegenheit, dass eines davon leer bleibt.
    //
    // Mehr als input: change faengt, was der Browser selbst einsetzt
    // (Autofill, Einfuegen ueber das Kontextmenue), und blur faengt den
    // Rest. Der Knopf liest ohnehin im Feld nach - diese drei halten
    // nur seinen Zustand aktuell, damit er nicht gesperrt aussieht,
    // waehrend das Feld voll ist.
    for (const ereignisName of ["input", "change", "blur"]) {
      $("#ls-anliegenfeld")?.addEventListener(ereignisName, () => {
        this.#anliegenPruefen();
        this.#anliegenFehler(null);
      });
    }
    $("#ls-anliegendatei")?.addEventListener("change", (ereignis) => {
      this.#anliegenFoto(ereignis.target.files?.[0]);
    });
    $("#ls-anliegenfotoweg")?.addEventListener("click", () => this.#anliegenFotoWeg());
    $("#ls-anliegenweiter")?.addEventListener("click", () => this.#anliegenWeiter());

    // ── Die Nummer ───────────────────────────────────────────────────
    for (const ereignisName of ["input", "change", "blur"]) {
      $("#ls-telfeld")?.addEventListener(ereignisName, () => {
        this.#telPruefen();
        // Der rote Satz verschwindet, sobald getippt wird: Er hat gesagt,
        // was fehlt, und soll nicht stehenbleiben, waehrend es behoben wird.
        this.#telFehler(null);
      });
    }
    $("#ls-telweiter")?.addEventListener("click", () => this.#telWeiter());
    // Kein WhatsApp? Der Link klappt das Feld fuer Viber auf.
    $("#ls-viberlink")?.addEventListener("click", () => this.#viberOeffnen(true));
    for (const ereignisName of ["input", "change", "blur"]) {
      $("#ls-viberfeld")?.addEventListener(ereignisName, () => {
        this.#telPruefen();
        this.#telFehler(null);
      });
    }

    $("#ls-frageweiter")?.addEventListener("click", () => this.#frageWeiter());
    $("#ls-fragefeld")?.addEventListener("input", (ereignis) => {
      const frage = this.fragenListe[this.fragen.i];
      if (frage?.typ !== "text" && frage?.typ !== "tel") return;
      this.fragen.antworten[frage.id] = ereignis.target.value.trim();
      const weiter = $("#ls-frageweiter");
      if (weiter) weiter.disabled = !this.#antwortTaugt(frage, this.fragen.antworten[frage.id]);
      // Der rote Satz verschwindet, sobald getippt wird: Er hat gesagt,
      // was fehlt, und soll nicht stehenbleiben, waehrend es behoben wird.
      this.#frageFehler(null);
    });
    $("#ls-fragenzurueck")?.addEventListener("click", () => this.#frageZurueck());

    $("#ls-kameraoeffnen")?.addEventListener("click", () => this.#kameraStarten());
    $("#ls-hilfe")?.addEventListener("click", () => this.#blatt(true));
    for (const knoten of $$("[data-blatt-zu]")) {
      knoten.addEventListener("click", () => this.#blatt(false));
    }
    document.addEventListener("keydown", (ereignis) => {
      if (ereignis.key === "Escape") this.#blatt(false);
    });

    // WER MITTEN IM SCAN EINE NACHRICHT BEKOMMT.
    //
    // Kein Randfall: Die Besucher kommen aus Instagram und WhatsApp, und
    // dort klingelt es. Zwei Dinge gehen dabei schief, und beide sieht man
    // dem Bildschirm nicht an.
    //
    // ERSTENS DIE UHREN. Der Ringlauf lockert seine Schwelle, je laenger es
    // dauert - nach fuenfzehn Sekunden deutlich. Wer zwanzig Sekunden weg
    // war, kommt in einen Ring zurueck, der glaubt, er habe zwanzig Sekunden
    // lang vergeblich gewartet, und der dann von allein zulaeuft. Die Pause
    // wird deshalb auf die Uhren aufgeschlagen.
    //
    // ZWEITENS DAS BILD. Manche Geraete halten das Video an, wenn die Seite
    // in den Hintergrund geht, und starten es nicht von selbst wieder. Der
    // Waechter, der genau das abfaengt, hat sich beim Start laengst
    // abgeschaltet - also wird er neu gestellt.
    document.addEventListener("visibilitychange", () => this.#kameraSichtbarkeit());
    // BFCache/Seitenwechsel duerfen weder offene Freigaben noch Kameras
    // zuruecklassen. Nach Zurueck ist ein neuer, bewusster Tipp erforderlich.
    window.addEventListener("pagehide", () => this.#kameraStoppen());

    /* ══ DER AUGENBLICK, IN DEM ES DARAUF ANKOMMT ══════════════════
     *
     * Wer seine Nummer aus den Kontakten holt, geht genau hier hinaus -
     * und in diesem Augenblick steht sie vielleicht schon halb im Feld.
     * Das Fenster von Instagram laedt den Tab beim Zurueckkommen neu;
     * was nicht vorher gemerkt wurde, gibt es dann nicht mehr.
     *
     * ZWEI EREIGNISSE UND NICHT EINES. "pagehide" kommt nicht auf jedem
     * Geraet verlaesslich, wenn eine App in den Hintergrund geht -
     * "visibilitychange" auf hidden schon. Zusammen decken sie beide
     * Wege ab, und zweimal zu merken kostet nichts: Es ist derselbe
     * kurze Satz an dieselbe Stelle. */
    const standSichern = () => this.#standMerken();
    window.addEventListener("pagehide", standSichern);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") standSichern();
    });
    /* Und waehrend getippt wird. Wird eine App hart weggeraeumt, kommt
       gar kein Ereignis mehr - dann zaehlt nur, was schon dasteht. Ein
       kurzer Satz JSON je Tastendruck faellt neben dem, was diese Seite
       ohnehin tut, nicht auf. */
    for (const feld of ["#ls-namefeld", "#ls-anliegenfeld", "#ls-telfeld"]) {
      $(feld)?.addEventListener("input", standSichern);
    }
    window.addEventListener("pageshow", () => {
      if (this.aktiv === "kamera" && !this.kamera.laeuft) {
        this.#kameraFehlerZeigen("fehlerKameraUnterbrochen", "skanim", () => this.#kameraStarten());
      }
      if (this.aktiv === "foto" && !this.flaeche?.laeuft
        && $("#ls-fotobuehne")?.dataset.stand === "kamera") {
        this.#kameraFehlerZeigen("fehlerKameraUnterbrochen", "foto", () => this.#fotoStarten());
      }
    });
    const kameraAnpassen = () => { this.#kameraGroesse(); this.#kameraSichtbarkeit(); };
    window.addEventListener("resize", kameraAnpassen);
    window.visualViewport?.addEventListener("resize", kameraAnpassen);
    // Der Ausloeser von Hand liegt im Blatt. Wer ihn drueckt, hat gelesen,
    // was er tut - und wird nicht mehr von ihm aufgehalten.
    $("#ls-manuell")?.addEventListener("click", () => {
      this.#blatt(false);
      this.#ringAbschluss({ vonHand: true });
    });
  }

  // DIE ERSTE HANDLUNG - UND DIE ERSTE ZAHL.
  //
  // GEMESSEN, NICHT GESCHAETZT: Zwischen "Seite geoeffnet" (894) und der
  // naechsten Stufe (122) lagen 772 Besucher und KEINE einzige Messung. Wer
  // den Knopf nie angetippt hat und wer danach umgedreht ist, standen in
  // derselben Zeile - zwei gegensaetzliche Probleme mit einer Zahl.
  //
  // Der Schritt heisst weiter "named", obwohl hier niemand mehr einen Namen
  // eingibt: Die Firestore-Regeln lassen genau acht Schrittnamen zu, und ein
  // neunter waere still abgewiesen worden - mitsamt dem ganzen Dokument,
  // denn hasOnly() prueft alles oder nichts.
  //
  // EIGENE METHODE UND NICHT MEHR IM HORCHER: Sie wird von zwei Stellen
  // gerufen. Die zweite ist der Tipp, der VOR dem JavaScript kam - siehe
  // #frueherTippNachholen().
  #startTippen() {
    const knopf = $("#ls-start");
    if (knopf) delete knopf.dataset.wartet;
    this.#netzVormerken();

    // DIE KURZE FASSUNG GEHT UNMITTELBAR AN DIE KAMERA.
    //
    // Dazwischen lag ein Anleitungsschirm mit drei Karten. Er war gegen
    // die Systemfrage des Browsers gedacht ("moechte auf deine Kamera
    // zugreifen") - und er war ein Bildschirm, der nichts liefert. Jeder
    // solche Bildschirm kostet Besucher; gefuehrt wird jetzt IM Bild, wo
    // der Ring zeigt, wohin der Kopf soll.
    //
    // KEIN SCHRITT "named" MEHR. Er hing an genau diesem Bildschirm. Was
    // der Tipp ausloest, ist die Kamera - und die schreibt "camera",
    // sobald sie da ist. Eine Stufe, die niemand mehr erreicht, ist keine
    // Messung.

    // ES SEI DENN, DIE SEITE HAT EINEN WAHLBILDSCHIRM.
    //
    // Das ist der Weg auf /lifeskin: Dort teilt sich der Weg, bevor die
    // Kamera gefragt wird - Scan mit der Kamera oder weiter ohne. Der
    // Grund steht in den Zahlen: 184 von 222 gingen bei "Skanimi" weg.
    // Wer die Kamera nicht freigeben will, soll trotzdem bei Dr. Gashi
    // ankommen, statt die Seite zu schliessen.
    //
    // Geprueft wird am Aufbau und nicht an der Fassung: Die beiden
    // Seiten ohne diesen Bildschirm laufen unveraendert weiter.
    if ($("#ls-wahl")) {
      this.sitzung.schritt("wahl");
      this.zeige("wahl");
      return;
    }

    if (this.variante === "kurz") { this.#kameraStarten(); return; }

    this.sitzung.schritt("named");
    this.zeige("vorbereitung");
  }

  // ── DIE MENYRA: vier Wege, ein System ─────────────────────────────────
  //
  // Hier standen zwei Karten: mit Kamera oder ohne. Das war die richtige
  // Erkenntnis (184 von 222 gingen bei "Skanimi" weg) in der falschen
  // Form - "ohne Scan" ist keine Absicht, sondern eine Verneinung, und
  // niemand erkennt sich darin wieder.
  //
  // Jetzt sind es vier, und jede benennt ein Beduerfnis:
  //
  //   skanim  das ganze Gesicht, wie bisher
  //   foto    nur die eine Stelle, die stoert
  //   trup    eine Hautstelle am Koerper, beschrieben und gezeigt
  //   pytje   nur eine Frage an die Dermatologin
  //
  // DER TYP WIRD GESCHRIEBEN, BEVOR ES WEITERGEHT. Ohne ihn steht in
  // Heart ein Fall, und niemand weiss, was er ist: ein misslungener
  // Scan, ein Foto einer Wange oder eine Frage ohne Bild - drei Faelle,
  // die drei verschiedene Antworten brauchen.
  #wegWaehlen(weg) {
    // Das Gesichtsnetz braucht nur der Scan. Mit ihm geht es sofort los,
    // jeder andere Weg bestellt das vorgemerkte Laden ab. (Was keiner der
    // vier bekannten Namen ist, endet unten beim Scan.)
    if (["pa-skanim", "foto", "trup", "pytje"].includes(weg)) this.#netzAbbestellen();
    else this.#netzJetzt();

    // Die alte Karte der Vorlage. Sie fuehrt weiter dorthin, wo sie
    // immer hinfuehrte - eine Seite, die es noch gibt, darf nicht in
    // eine leere Anzeige laufen.
    if (weg === "pa-skanim") {
      this.#wegMerken("trup");
      // Die alte Vorlage behaelt ihren alten Weg: vier Fragen, dann Name
      // und Alter, dann die Nummer. Die Marke sagt #nameWeiter(), dass
      // hier nicht der neue Anliegenschirm folgt.
      this.zustand.altWeg = true;
      this.#fragenStarten(FRAGEN_PA_SKANIM, {
        danach: "name", zurueck: "wahl", einleitung: "einleitungPaSkanim"
      });
      return;
    }

    if (weg === "foto") {
      this.#wegMerken("foto");
      this.#fotoParaZeigen();
      return;
    }

    // EIN WEG STATT ZWEIER.
    //
    // "Trup" und "Pytje" waren zwei Karten mit demselben Bildschirm
    // dahinter - der Unterschied bestand aus zwei Saetzen, und in jeder
    // Zahl standen sie getrennt, obwohl sie dieselbe Arbeit sind. Die
    // Menyra zeigt jetzt EINE Karte ("Per trupin ose vetem pyetje").
    //
    // "pytje" bleibt trotzdem stehen: Die Vorlage unter
    // /lifeskinlandingtemplate traegt die alte Karte, und jeder Fall von
    // vorher traegt die alte Kennung. Beide fuehren hier auf denselben
    // Weg - erst Name und Alter, dann das Anliegen, dann die Nummer.
    if (weg === "trup" || weg === "pytje") {
      this.#wegMerken(weg);
      this.#nameZeigen();
      return;
    }

    // Mit Scan: die Anleitung, wenn es sie gibt, sonst unmittelbar die
    // Kamera.
    this.#wegMerken("skanim");
    if ($("#ls-vorbereitung")) {
      this.sitzung.schritt("named");
      this.zeige("vorbereitung");
      return;
    }
    this.#kameraStarten();
  }

  // ---------- Das Gesichtsnetz: erst laden, wenn es gebraucht wird ----------

  // Gibt es hier ueberhaupt eine Kamera-Schnittstelle? Ohne sie waeren die
  // 6,9 MB umsonst.
  //
  // BEWUSST NICHT NACH DER APP GEFRAGT. Dass die Android-Fenster von
  // Facebook und Instagram keine Kamera freigeben, sagen Quellen, die
  // Jahre alt sind - am Geraet geprueft ist es nicht. Gibt eine neuere
  // App-Fassung die Kamera doch frei, bekaemen genau diese Besucher sonst
  // den Ring ohne vorgeladenes Netz. Ob die Kamera geht, zeigt allein ihr
  // Start (#kameraAusweg).
  #liveKameraMoeglich() {
    return Boolean(globalThis.navigator?.mediaDevices?.getUserMedia);
  }

  // Nach dem Tipp auf den Startknopf: gleich laden, aber erst nach einem
  // Wimpernschlag - so kann ein Weg ohne Scan es noch abbestellen.
  #netzVormerken() {
    if (this.netzUhr || !this.#liveKameraMoeglich()) return;
    this.netzUhr = setTimeout(() => {
      this.netzUhr = 0;
      netzVorladen();
    }, NETZ_VORMERKEN_MS);
  }

  #netzJetzt() {
    this.#netzAbbestellen();
    if (this.#liveKameraMoeglich()) netzVorladen();
  }

  #netzAbbestellen() {
    if (this.netzUhr) clearTimeout(this.netzUhr);
    this.netzUhr = 0;
  }

  // Was an einem gewaehlten Weg festgehalten wird.
  //
  // EINE STELLE FUER ALLE VIER. Der Typ, die alte Marke und die Meldung
  // an den Pixel gehoeren zusammen; an vier Stellen geschrieben waere
  // die dritte davon frueher oder spaeter nur an dreien.
  //
  // paSkanim BLEIBT STEHEN, obwohl es den Typ jetzt gibt: Jede Zahl von
  // vor dieser Aenderung haengt daran, und ein Fall mit Foto hat trotzdem
  // keinen Gesichtsscan gemacht. Der Typ sagt, WAS es ist; die Marke
  // sagt weiterhin, dass keine Scan-Aufnahmen zu erwarten sind.
  #wegMerken(weg) {
    const typ = WEG_ZU_TYP[weg] || "scan";
    // WER DEN WEG WECHSELT, FAENGT IHN VON VORNE AN.
    //
    // Die vier Wege teilen sich eine Schrittfolge, und schritt() geht
    // nie zurueck. Wer auf Trup den Anliegenschirm gesehen hat (emri)
    // und dann Me foto waehlt, koennte dessen Bildschirme sonst nicht
    // mehr zaehlen - sie liegen davor. In der Auswertung stuende er als
    // jemand, der den Fotoweg bis Name und Alter gegangen ist, ohne je
    // die Kamera gesehen zu haben.
    //
    // Nur beim WECHSEL: Wer denselben Weg zweimal waehlt, hat nichts
    // zurueckzusetzen.
    if (this.zustand.typ && this.zustand.typ !== typ) this.sitzung.zurueckAuf("wahl");
    this.zustand.typ = typ;
    this.zustand.paSkanim = typ !== "scan";
    // EINE ANGEFANGENE AUFNAHME GEHOERT ZU IHREM WEG.
    //
    // Wer auf "Trup" ein Bild anhaengt, zurueckgeht und dann "Me foto"
    // waehlt, haette sonst das alte Bild im Zustand - und der neue Weg
    // schickte es mit, ohne dass es jemand noch einmal gesehen hat. Der
    // Weg faengt bei null an, so oft er gewaehlt wird.
    this.zustand.stelleFoto = null;
    this.zustand.fotoAnzahl = 0;
    this.zustand.telBild = "";
    // Der neue Weg faengt auch im Kopf bei null an: Ein Anliegen, das
    // auf "Per trupin" getippt und dann auf "Me foto" gewechselt wurde,
    // ginge sonst als Text eines Falls hinaus, den niemand geschrieben
    // hat.
    this.zustand.anliegenText = "";
    const anliegenFeld = $("#ls-anliegenfeld");
    if (anliegenFeld) anliegenFeld.value = "";
    this.zustand.altWeg = false;
    this.#anliegenFotoWeg();
    // ZWEI SCHREIBVORGAENGE, NICHT EINER - und das ist keine Umstaendlichkeit.
    //
    // hasOnly() in den Firestore-Regeln weist das GANZE Dokument ab, sobald
    // ein Feld darin steht, das die Regel nicht kennt. Ein brandneues Feld,
    // das mit einem alten zusammen hinausgeht, nimmt das alte also mit in
    // den Abgrund - lautlos, denn der Trichter wartet auf kein Ja.
    //
    // paSkanim ist seit Monaten ausgerollt, typ ist neu. Getrennt kostet
    // eine Regel, die noch nicht deployt ist, genau das neue Feld und
    // nichts sonst.
    this.sitzung.ergaenze({ paSkanim: this.zustand.paSkanim });
    this.sitzung.ergaenze({ typ });
    this.pixel.meldeWeg(typ);
  }

  // ---------- Me foto: eine Stelle statt eines Gesichts ----------

  #fotoParaZeigen() {
    this.sitzung.schritt("fotopara");
    this.zeige("fotopara");
  }

  // Die Kamera dieses Wegs ist nicht die des Scans.
  //
  // Sie misst nichts, sie erkennt nichts und sie loest nicht von selbst
  // aus - siehe lifeskin-foto.js. Was hier steht, ist die Verdrahtung:
  // Strom auf, Bild zeigen, Ausloeser scharf.
  async #fotoStarten() {
    this.zustand.fotoQuelle = "live";
    this.sitzung.schritt("fotokamera");
    this.zeige("foto");
    this.#fotoVorschauZeigen(null);
    this.flaeche ||= new Flaechenkamera({
      video: $("#ls-fotovideo"),
      beiBereit: (bereit) => {
        const buehne = $("#ls-fotobuehne");
        if (buehne) buehne.dataset.bereit = bereit ? "ja" : "nein";
      },
      beiFehler: (schluessel) => {
        const dauerMs = Date.now() - (this.fotoStartAb || 0);
        this.#technik(`Foto-Kamera Fehler: ${schluessel} nach ${dauerMs} ms`);
        this.#kameraFehlerZeigen(schluessel, "foto", () => this.#fotoStarten(), { dauerMs });
      }
    });
    const fotoAb = Date.now();
    this.fotoStartAb = fotoAb;
    const auf = await this.flaeche.starte();
    if (this.aktiv !== "foto" || !auf) return;
    this.#technik(`Foto-Kamera bereit nach ${Date.now() - fotoAb} ms · ${this.flaeche.richtung === "user" ? "vorne" : "hinten"}`);
    // Dieselbe Marke wie beim Scan, aus demselben Grund: Der Schritt
    // davor sagt "hat getippt", diese Marke sagt "hat erlaubt".
    if (auf) this.#kameraOkMerken();
    const buehne = $("#ls-fotobuehne");
    if (buehne) buehne.dataset.bereit = auf ? "ja" : "nein";
    // Gespiegelt nur, solange die Kamera nach vorne sieht: Wer sich
    // selbst fotografiert, erwartet einen Spiegel; wer seinen Arm
    // fotografiert, erwartet seinen Arm.
    if (buehne) buehne.dataset.richtung = this.flaeche.richtung;
  }

  // Der Ausloeser. Das Bild bleibt danach STEHEN, und zwar als Bild und
  // nicht als angehaltenes Video: Wer es ansieht, soll dieselbe Aufnahme
  // sehen, die hinausgeht.
  #fotoAusloesen() {
    if ($("#ls-fotobuehne")?.dataset.bereit !== "ja") return;
    const aufnahme = this.flaeche?.aufnehmen();
    if (!aufnahme) {
      this.#kameraFehlerZeigen("fehlerKameraBild", "foto", () => this.#fotoStarten());
      return;
    }
    this.zustand.stelleFoto = aufnahme;
    this.#fotoVorschauZeigen(aufnahme.vorschau);
    // Der Strom geht aus, sobald das Bild steht: Eine Kamera, die hinter
    // einer Vorschau weiterlaeuft, leert den Akku und laesst die Leuchte
    // an - auf dem Telefon das Erste, was auffaellt.
    this.flaeche?.stoppe();
  }

  #fotoVorschauZeigen(jpeg) {
    const buehne = $("#ls-fotobuehne");
    if (buehne) buehne.dataset.stand = jpeg ? "vorschau" : "kamera";
    if (buehne && !jpeg) buehne.dataset.bereit = "nein";
    const bild = $("#ls-fotobild");
    if (bild) bild.src = jpeg || "";
  }

  // Noch einmal. Die alte Aufnahme wird dabei weggeworfen - sonst ginge
  // sie mit hinaus, wenn der zweite Versuch scheitert.
  //
  // KAM DAS BILD AUS DER KAMERA DES TELEFONS, geht die wieder auf und
  // nicht die Live-Kamera: Die gibt es an dieser Stelle meistens gar nicht
  // (siehe #kameraAusweg). Das alte Bild bleibt stehen, bis ein neues da
  // ist - wer die Kamera ohne Aufnahme schliesst, hat sonst gar keines.
  #fotoNochmal() {
    if (this.zustand.fotoQuelle === "system") { this.#systemFotoWaehlen("foto"); return; }
    this.zustand.stelleFoto = null;
    this.#fotoStarten();
  }

  // Das Bild ist gut. Ab hier ist dieser Weg derselbe wie der des Scans:
  // Name und Alter, dann die Uebergabe.
  #fotoNehmen() {
    const aufnahme = this.zustand.stelleFoto;
    if (!aufnahme) return;
    this.sitzung.schritt("fotogati");
    this.zustand.fotoAnzahl = 1;
    this.zustand.telBild = aufnahme.mini?.jpeg || aufnahme.vorschau || "";
    // Im Hintergrund hinaus, wie beim Scan: Der Besucher wartet nicht
    // darauf, dass ein Bild ankommt.
    this.#uploadMelden(this.sitzung.fotosSpeichern({ zona: aufnahme.foto }));
    if (aufnahme.mini) this.sitzung.miniaturenSpeichern({ zona: aufnahme.mini });
    this.sitzung.ergaenze({ photos: ["zona"] });
    this.#nameZeigen();
  }

  // ---------- Sqaroni problemet: ein Text statt eines Bildes ----------
  //
  // EIN EIGENER BILDSCHIRM, und das ist die Aenderung.
  //
  // Hier standen Name, Alter UND der Text zusammen. Drei Fragen auf
  // einem Bildschirm heissen drei Gelegenheiten wegzugehen in EINER
  // Zahl - welche davon es kostet, war nicht zu sehen. Name und Alter
  // stehen jetzt davor (derselbe Bildschirm wie nach einer Aufnahme),
  // hier steht nur noch, worum es geht.
  //
  // Was sich zwischen Koerperproblem und blosser Frage unterscheidet,
  // sind weiter zwei Saetze. Der Weg ist EINER.
  #anliegenZeigen(melden = true) {
    const pytje = this.zustand.typ === "pytje";
    schreibe($("#ls-anliegentitel"), this.text(pytje ? "anliegenPytjeTitel" : "anliegenTrupTitel"));
    schreibe($("#ls-anliegenvorsatz"),
      this.text(pytje ? "anliegenPytjeVorsatz" : "anliegenTrupVorsatz"));
    const feld = $("#ls-anliegenfeld");
    if (feld) {
      feld.placeholder = this.text(pytje ? "anliegenPytjePlatzhalter" : "anliegenTrupPlatzhalter");
    }
    // Der Satz ueber dem Fotoknopf steht nur bei der Frage: Dort ist ein
    // Bild wirklich die Ausnahme, waehrend es beim Koerperproblem fast
    // immer hilft.
    const fotoHinweis = $("#ls-anliegenfotohinweis");
    if (fotoHinweis) fotoHinweis.hidden = !pytje;
    // Der Schritt faellt beim ZEIGEN: Wer diesen Bildschirm sieht und
    // weggeht, ist HIER weggegangen und nicht eine Stufe davor.
    if (melden) this.sitzung.schritt("problemi");
    this.zeige("anliegen");
    $("#ls-anliegenfeld")?.focus?.({ preventScroll: true });
    this.#anliegenPruefen();
  }

  // WAS IM FELD STEHT, WIRD IM FELD GELESEN.
  //
  // Der Zustand wurde ueber input-Ereignisse mitgefuehrt, und das ist
  // genau eine Quelle zu viel: Was der Browser selbst einsetzt -
  // Autofill, eine wiederhergestellte Seite, eine Einfuegung ueber das
  // Kontextmenue, manche Tastaturen auf Android - loest dieses Ereignis
  // nicht zuverlaessig aus. Der Besucher sah seinen Text im Feld stehen
  // und einen Knopf, der nichts tat: genau der Fehler, der hier gemeldet
  // wurde.
  //
  // Jetzt ist das Feld die Wahrheit, und der Zustand nur noch die Kopie.
  #anliegenLesen() {
    const text = $("#ls-anliegenfeld")?.value;
    if (typeof text === "string") this.zustand.anliegenText = text;
    return String(this.zustand.anliegenText || "").trim();
  }

  // Der Knopf geht auf, wenn der Text dasteht. Ein Fall ohne Text ist
  // auf diesem Weg eine leere Akte, und eine leere Akte ist nicht zu
  // beantworten.
  #anliegenPruefen() {
    this.#knopfBereit($("#ls-anliegenweiter"), this.#anliegenLesen().length >= 5);
  }

  // Das freiwillige Foto.
  //
  // EIN DATEIFELD UND KEINE KAMERA: Auf dem Telefon bietet es beides an,
  // aufnehmen oder aus der Galerie nehmen. Wer ein Bild von gestern hat,
  // auf dem der Ausschlag deutlicher war, soll genau das schicken
  // duerfen.
  async #anliegenFoto(datei) {
    const aufnahme = await fotoAusDatei(datei).catch(() => null);
    if (!aufnahme) return;
    this.zustand.stelleFoto = aufnahme;
    const bild = $("#ls-anliegenbild");
    if (bild) bild.src = aufnahme.vorschau;
    const kasten = $("#ls-anliegenfoto");
    if (kasten) kasten.dataset.stand = "da";
  }

  #anliegenFotoWeg() {
    this.zustand.stelleFoto = null;
    const bild = $("#ls-anliegenbild");
    if (bild) bild.src = "";
    const kasten = $("#ls-anliegenfoto");
    if (kasten) kasten.dataset.stand = "leer";
    const feld = $("#ls-anliegendatei");
    if (feld) feld.value = "";
  }

  // Abgeschickt. Der Text geht hinaus, und das Bild, wenn eines dabei
  // ist. Name und Alter stehen schon dort - sie sind der Bildschirm
  // davor.
  //
  // DER KNOPF FUEHRT IMMER WEITER, und das ist die zweite Haelfte der
  // Fehlerbehebung: Stolpert hier ein Schreibvorgang, eine Meldung oder
  // ein Bild, darf der Besucher davon nichts merken. Ein Knopf, der
  // wegen einer Zaehlung stehenbleibt, ist der teuerste Fehler, den
  // dieser Trichter machen kann - deshalb steht der Schritt nach vorn
  // ausserhalb jedes Versuchs.
  #anliegenWeiter() {
    const text = this.#anliegenLesen();
    if (text.length < 5) {
      this.#anliegenFehler("anliegenFehlt");
      return;
    }
    this.#anliegenFehler(null);
    try {
      const pytje = this.zustand.typ === "pytje";
      const kurz = text.slice(0, 1200);
      // Der Text steht in seinem EIGENEN Schreibvorgang, aus demselben
      // Grund wie in #wegMerken(): Ein Feld, das die Regeln noch nicht
      // kennen, weist das ganze Dokument ab. Zusammen mit Name und Alter
      // waere der Fall bei einer nachhinkenden Regel vollstaendig leer.
      this.sitzung.ergaenze(pytje ? { pyetja: kurz } : { problemi: kurz });
      this.pixel.meldeAbgabe(pytje ? "pyetja" : "problemi");

      const aufnahme = this.zustand.stelleFoto;
      if (aufnahme) {
        this.zustand.fotoAnzahl = 1;
        this.zustand.telBild = aufnahme.mini?.jpeg || aufnahme.vorschau || "";
        this.#uploadMelden(this.sitzung.fotosSpeichern({ zona: aufnahme.foto }));
        if (aufnahme.mini) this.sitzung.miniaturenSpeichern({ zona: aufnahme.mini });
        this.sitzung.ergaenze({ photos: ["zona"] });
      }
    } catch (fehler) {
      globalThis.console?.warn?.("[lifeskin] Anliegen nicht gespeichert:", fehler?.message);
    }
    if (!this.#telZeigen()) this.#uebergeben();
  }

  // Der rote Satz unter dem Feld. Er sagt, WAS fehlt - ein Knopf, der
  // stumm nichts tut, wird nicht erfuellt, sondern verlassen.
  #anliegenFehler(schluessel) {
    const zeile = $("#ls-anliegenfehler");
    $("#ls-anliegenfeld")?.setAttribute("aria-invalid", schluessel ? "true" : "false");
    if (!zeile) return;
    zeile.hidden = !schluessel;
    schreibe(zeile, schluessel ? t(FRAGEN_TEXTE[schluessel], this.sprache) : "");
  }

  // ---------- Die Nummer ----------
  //
  // Sie steht zuletzt und auf einem eigenen Bildschirm: Sie ist die
  // einzige Angabe, bei der jemand zoegert, und wer sie zuerst geben
  // soll, hat noch nichts investiert. Wer bis hierhin seinen Namen, sein
  // Alter und sein Anliegen geschrieben hat, gibt sie.
  // NUR, WENN ES DEN BILDSCHIRM GIBT.
  //
  // Drei Aufbauten laden dieselbe Anwendung, und nicht jeder traegt
  // jeden Bildschirm. zeige() schaltet alle anderen ab - auf eine
  // Kennung zu schalten, die es nicht gibt, hiesse: eine weisse Seite
  // mitten im Trichter. Der Aufrufer entscheidet mit dem Rueckgabewert,
  // was stattdessen kommt.
  #telZeigen(melden = true) {
    if (!$("#ls-tel")) return false;
    if (melden) this.sitzung.schritt("numri");
    this.#telFehler(null);
    this.#telKopfFuellen();
    this.zeige("tel");
    // Kein Autofokus: erst Zweck und WhatsApp-Hinweis lesen, dann tippen.
    this.#telPruefen();
    return true;
  }

  // Variante B: beim Namen gefragt, und oben das eigene Foto - "gespeichert".
  // Ohne Foto (Frage ohne Bild) steht nur die Aerztin da.
  #telKopfFuellen() {
    const name = String(this.zustand.name || "").trim().split(/\s+/)[0];
    const titel = $("#ls-teltitel");
    if (titel) schreibe(titel, name ? this.text("telTitelName", { name }) : this.text("telTitel"));
    const bild = this.zustand.telBild || "";
    const el = $("#ls-gesichertbild");
    if (el) {
      if (bild) el.src = bild;
      el.hidden = !bild;
    }
    const ueber = $("#ls-gesicherttitel");
    // Nach dem Neuladen ist das Bild weg, das Foto aber gespeichert.
    const mitFoto = Boolean(bild) || Number(this.zustand.fotoAnzahl) > 0;
    if (ueber) schreibe(ueber, this.text(mitFoto ? "telGesichert" : "telGesichertOhne"));
  }

  // Dasselbe wie beim Anliegen: Das Feld ist die Wahrheit, nicht der
  // mitgefuehrte Zustand. Eine Nummer, die der Browser selbst einsetzt,
  // loest kein input-Ereignis aus - und stand damit in keinem Zustand,
  // obwohl sie im Feld zu lesen war.
  #telLesen() {
    const wert = $("#ls-telfeld")?.value;
    if (typeof wert === "string") this.zustand.telefon = wert.trim();
    return String(this.zustand.telefon || "");
  }

  // VIBER - nur, wenn jemand "Nuk keni WhatsApp?" angetippt hat.
  #viberOffen() {
    return $("#ls-viberbox")?.hidden === false;
  }

  #viberLesen() {
    return this.#viberOffen() ? String($("#ls-viberfeld")?.value || "").trim() : "";
  }

  #viberOeffnen(fokus = true) {
    const box = $("#ls-viberbox");
    if (!box) return;
    box.hidden = false;
    $("#ls-viberlink")?.setAttribute("aria-expanded", "true");
    if (fokus) $("#ls-viberfeld")?.focus({ preventScroll: true });
    this.#telPruefen();
  }

  // Welche Nummer gilt: WhatsApp, wenn eingetragen - sonst Viber. Steht
  // WhatsApp da, aber falsch, gilt der Fehler dort (kein stilles
  // Ausweichen auf Viber).
  #nummernPruefen() {
    const wa = this.#telLesen();
    const vb = this.#viberLesen();
    const waGeprueft = telefonPruefen(wa, LIFESKIN_TELEFON_VORWAHL);
    const vbGeprueft = vb ? telefonPruefen(vb, LIFESKIN_TELEFON_VORWAHL) : null;
    if (wa) {
      return { ok: waGeprueft.ok, grund: waGeprueft.grund, nummer: waGeprueft.nummer, feld: "#ls-telfeld",
        viber: vbGeprueft?.ok ? vbGeprueft.nummer : "", nurViber: false };
    }
    if (vbGeprueft) {
      return { ok: vbGeprueft.ok, grund: vbGeprueft.grund, nummer: vbGeprueft.nummer, feld: "#ls-viberfeld",
        viber: vbGeprueft.ok ? vbGeprueft.nummer : "", nurViber: true };
    }
    return { ok: false, grund: waGeprueft.grund || "leer", nummer: "", feld: this.#viberOffen() ? "#ls-viberfeld" : "#ls-telfeld", viber: "", nurViber: false };
  }

  #telPruefen() {
    const geprueft = this.#nummernPruefen();
    this.#knopfBereit($("#ls-telweiter"), geprueft.ok);
    // Nur Viber: Hinweis und Knopf sprechen von Viber.
    const viber = geprueft.nurViber;
    const knopf = $("#ls-telweiter");
    const knopfText = this.text(viber ? "telKnopfViber" : "telKnopf");
    if (knopf && knopfText) schreibe(knopf, knopfText);
    if (knopf) knopf.dataset.kanal = viber ? "viber" : "whatsapp";
    const info = $("#ls-telinfo");
    const infoText = this.text(viber ? "telInfoViber" : "telInfo");
    if (info && infoText) schreibe(info, infoText);
  }

  #telWeiter() {
    const geprueft = this.#nummernPruefen();
    if (!geprueft.ok) {
      this.#telFehler(geprueft.grund, geprueft.feld);
      return;
    }
    this.#telFehler(null);
    // Die Einwilligung geht mit, wie auf dem Weg mit Scan.
    //
    // Sie steht an derselben Stelle wie dort und bedeutet dasselbe: Er
    // hat die Nummer selbst und ausdruecklich dafuer hinterlassen, dass
    // Dr. Gashi sich meldet - der Satz darueber sagt genau das. Ohne
    // diese Zeile stuende jeder Fall dieser zwei Wege in Heart als
    // "nicht eingewilligt", und niemand duerfte anrufen.
    // Die Warteseite liest den Bericht und nicht die Sitzung; diese
    // Marke reist im Bericht mit (siehe #uebergeben).
    this.zustand.nummerGegeben = true;
    try {
      this.sitzung.ergaenze({ phone: geprueft.nummer, phoneConsent: true });
      // DIE VIBER-NUMMER IN EINEM EIGENEN SCHREIBVORGANG. Kennt die
      // Firestore-Regel das Feld (noch) nicht, weist sie nur diesen
      // Vorgang ab - die Nummer oben steht trotzdem. Ohne WhatsApp ist
      // "phone" dieselbe Nummer, und daran erkennt Heart den Viber-Fall.
      if (geprueft.viber) this.sitzung.ergaenze({ viber: geprueft.viber });
      this.pixel.meldeAbgabe("telefon");
      // Das Ereignis, auf das die Anzeigen optimieren. Es faellt auf
      // JEDEM Weg genau einmal - der Pixel sperrt jedes Ereignis nach
      // der ersten Meldung, und die Nummer gibt es je Besuch nur
      // einmal. Ein zweites meldeLead() daneben gibt es nicht.
      this.pixel.meldeLead();
    } catch (fehler) {
      globalThis.console?.warn?.("[lifeskin] Nummer nicht gespeichert:", fehler?.message);
    }

    // WOHIN ES VON HIER AUS GEHT, HAENGT AM WEG.
    //
    // Mit Aufnahme kommt die Ladeseite - sie ist die Zeit, in der die
    // Bilder im Hintergrund hinausgehen, und ohne sie stuende der
    // Besucher vor einem Sprung, den er nicht versteht. Auf dem Weg
    // "Per trupin ose vetem pyetje" gibt es nichts aufzubereiten: Dort
    // ist der Fall mit der Nummer fertig.
    if (this.#trupWeg()) { this.#uebergeben(); return; }
    this.#analyseZeigen();
  }

  // Jeder Grund sagt, was zu tun ist. "Ungueltig" sagt das nicht, und ein
  // Feld, das rot wird, ohne zu sagen warum, wird nicht korrigiert,
  // sondern verlassen.
  #telFehler(grund, feld = "#ls-telfeld") {
    const schluessel = grund
      ? ({ leer: "telLeer", kurz: "telKurz", lang: "telLang", zeichen: "telZeichen" }[grund]
        || "telLeer")
      : null;
    const zeile = $("#ls-telfehler");
    $("#ls-telfeld")?.setAttribute("aria-invalid", schluessel && feld === "#ls-telfeld" ? "true" : "false");
    $("#ls-viberfeld")?.setAttribute("aria-invalid", schluessel && feld === "#ls-viberfeld" ? "true" : "false");
    if (!zeile) return;
    zeile.hidden = !schluessel;
    schreibe(zeile, schluessel ? t(FRAGEN_TEXTE[schluessel], this.sprache) : "");
  }

  // ---------- Name und Alter ----------
  //
  // Ein Bildschirm, zwei Angaben, und beide brauchen wir wirklich: den
  // Namen, damit der Befund bei Dr. Gashi nicht "Fall 47" heisst, und die
  // Altersgruppe, weil die Aufbereitung dagegen vergleicht.
  //
  // Er steht auf beiden Wegen an derselben Stelle im Kopf des Besuchers
  // und an zwei verschiedenen im Weg: mit Scan hinter der Aufnahme, ohne
  // Scan hinter den vier Fragen.

  // Den Bildschirm aufziehen. EINE Stelle, weil ihn zwei Wege aufrufen.
  // Zwei Abschriften waeren zwei Gelegenheiten, den Knopf ungeprueft
  // offen stehen zu lassen.
  #nameZeigen(melden = true) {
    // DER SCHRITT FAELLT BEIM ZEIGEN, nicht beim Weitergehen.
    //
    // Er fiel einmal in #nameWeiter(), also erst, wenn Name und Alter
    // dastanden - und damit stand der Verlust dieses Bildschirms bei dem
    // davor. Seit es vier Wege gibt, ist genau das die Frage, die der
    // Trichter beantworten soll: WO gehen sie weg? Jeder Bildschirm
    // zaehlt deshalb, sobald er zu sehen ist, und die Angaben selbst
    // schreibt #nameWeiter() nach - siehe dort.
    if (melden) this.sitzung.schritt("emri");
    // Der Satz oben sagt, was gerade vorbei ist - und das ist auf jedem
    // Weg etwas anderes. "Der Scan ist fertig" ueber einem Weg ohne
    // Scan liest sich als Fehler.
    schreibe($("#ls-namevorsatz"), this.text(
      this.zustand.typ === "foto" ? "nameVorsatzFoto"
        : this.#trupWeg() ? "nameVorsatzTrup" : "nameVorsatz"));
    this.#nameFehler(null);
    this.zeige("name");
    $("#ls-namefeld")?.focus?.({ preventScroll: true });
    this.#nameWeiterPruefen();
  }

  // Der Knopf bleibt zu, bis beides dasteht. Ein Knopf, der stumm nicht
  // reagiert, waere schlimmer - deshalb ist er sichtbar gesperrt.
  // WAS IM FELD STEHT, WIRD IM FELD GELESEN - siehe #anliegenLesen().
  // Die angetippte Altersgruppe steht am Knopf und nicht nur im
  // Zustand: Ein Neuzeichnen zwischendurch liesse sie sonst still
  // auseinanderlaufen.
  #nameLesen() {
    const wert = $("#ls-namefeld")?.value;
    if (typeof wert === "string") this.zustand.name = wert.trim();
    const gewaehlt = $$("#ls-alterwahl [data-gruppe]")
      .find((knopf) => knopf.getAttribute("aria-pressed") === "true");
    if (gewaehlt) this.zustand.altersgruppe = gewaehlt.dataset.gruppe;
    return {
      name: String(this.zustand.name || "").trim(),
      altersgruppe: String(this.zustand.altersgruppe || "")
    };
  }

  #nameWeiterPruefen() {
    const { name, altersgruppe } = this.#nameLesen();
    this.#knopfBereit($("#ls-nameweiter"), name.length >= 2 && Boolean(altersgruppe));
  }

  #nameWeiter() {
    const { name, altersgruppe } = this.#nameLesen();
    if (name.length < 2 || !altersgruppe) {
      this.#nameFehler(name.length < 2 ? "nameFehlt" : "alterFehlt");
      return;
    }
    this.#nameFehler(null);

    // Der Schritt steht schon (siehe #nameZeigen); hier gehen die zwei
    // Angaben hinaus, die er nicht mitnehmen konnte. Und sie gehoeren
    // AUSSERDEM in die Anamnese: Der Bogen in Heart liest sie dort, und
    // eine Akte ohne Altersgruppe hat ihre Luecke an der
    // auffaelligsten Stelle.
    //
    // In einem Versuch, damit kein Schreibvorgang den Knopf anhaelt.
    try {
      this.fragen.antworten.emri = name;
      this.fragen.antworten.mosha = altersgruppe;
      this.sitzung.ergaenze({ name, ageBand: altersgruppe, anamnese: this.fragen.antworten });
      this.pixel.meldeAbgabe("details");
    } catch (fehler) {
      globalThis.console?.warn?.("[lifeskin] Angaben nicht gespeichert:", fehler?.message);
    }

    // Die alte Vorlage behaelt ihren alten Weg: vier Fragen, Name und
    // Alter, dann die Nummer als Frage.
    if (this.zustand.altWeg) {
      this.#fragenStarten(FRAGEN_PA_SKANIM_NUMRI, {
        danach: "uebergeben", zurueck: "name", einleitung: "einleitungNumri"
      });
      return;
    }

    // "Per trupin ose vetem pyetje": jetzt kommt, worum es geht.
    if (this.#trupWeg()) { this.#anliegenZeigen(); return; }

    // MIT AUFNAHME FEHLT NUR NOCH DIE NUMMER - und zwar auf BEIDEN
    // Wegen mit Aufnahme.
    //
    // Der Weg mit Foto sprang hier unmittelbar in die Uebergabe: Er
    // hatte keinen Nummernbildschirm, und der Befund konnte danach
    // niemanden erreichen. Jetzt gilt fuer jeden Weg dasselbe - ohne
    // Nummer keine Nachricht, wenn das Ergebnis fertig ist.
    if (!this.#telZeigen()) this.#analyseZeigen();
  }

  // Der rote Satz unter den zwei Feldern.
  #nameFehler(schluessel) {
    const zeile = $("#ls-namefehler");
    if (!zeile) return;
    zeile.hidden = !schluessel;
    schreibe(zeile, schluessel ? t(FRAGEN_TEXTE[schluessel], this.sprache) : "");
  }

  // WER GETIPPT HAT, BEVOR DER GRIFF DRANHING.
  //
  // Der Knopf traegt seine Beschriftung im Aufbau und sieht deshalb fertig
  // aus, sobald die erste Antwort des Servers da ist. Der Horcher haengt
  // aber erst dran, wenn elf Module geladen sind - auf 3G lagen dazwischen
  // im Prueflauf ueber drei Sekunden. Ein Knopf, der in dieser Zeit nicht
  // reagiert, ist fuer den Besucher eine kaputte Seite.
  //
  // Der kurze Aufsatz in index.html merkt sich den Tipp; hier wird er
  // nachgeholt. Von dort kommt genau ein Wahrheitswert und sonst nichts:
  // Was er ausloest, entscheidet diese Datei.
  #frueherTippNachholen() {
    globalThis.__lifeskinBereit = true;
    if (globalThis.__lifeskinFrueherTipp !== true) return;
    globalThis.__lifeskinFrueherTipp = false;
    this.#startTippen();
  }

  // ---------- Kamera ----------

  async #kameraStarten({ zweiterAnlauf = false } = {}) {
    // Wer die Vorbereitung zweimal durchlaeuft, soll keinen zweiten Strom
    // aufmachen.
    this.#kameraStoppen();
    const lauf = (this.kamera.lauf += 1);
    this.kamera.letztesRaster = null;
    this.kamera.proben = [];
    this.kamera.fotos = {};
    this.kamera.ring = this.#neuerRing();
    this.kamera.netz = null;
    this.kamera.messleinwand = null;
    this.kamera.nachschlag = null;
    this.kamera.modus = "";
    this.kamera.netzWartet = false;
    this.kamera.nachgefordert = 0;
    this.kamera.uhr = 0;
    this.zustand.erkannt = false;
    const video = $("#ls-video");
    this.zeige("kamera");
    this.#kameraGroesse();
    // DER RING STEHT AB DEM ERSTEN AUGENBLICK.
    //
    // Er wurde erst gezeichnet, wenn das erste Kamerabild da war - und
    // zwischen dem Tippen und diesem Bild liegen die Systemfrage, das
    // Aufwachen der Kamera und die Frist, in der ihre Aufloesung ruhig
    // wird. Auf dem Telefon sah man in dieser Zeit einen nackten Kreis und
    // danach ploetzlich Striche: zwei Bilder statt einem, und beim ersten
    // weiss niemand, was von ihm verlangt wird.
    //
    // Der leere Ring IST die Anweisung: ein Kreis mit Strichen, die
    // zugehen sollen. Er kostet nichts und steht, bevor die Kamera
    // ueberhaupt antwortet.
    this.#ringZeichnen({ abgedeckt: new Array(SEKTOREN).fill(false), zielSektor: null, kalibriert: false });
    // Sofort, nicht erst wenn das Bild da ist: Zwischen dem Tippen und dem
    // ersten Bild liegen die Systemfrage und das Aufwachen der Kamera. Ohne
    // ein Wort ist das ein leerer Kreis auf einer leeren Seite.
    schreibe($("#ls-kamerahinweis"), this.text("kameraOeffnet"));
    // Der stille zweite Anlauf ist KEIN neuer Tipp: Er zaehlt nicht noch
    // einmal im Trichter, und seine Zeit laeuft ab dem ersten Tippen.
    if (!zweiterAnlauf) {
      this.sitzung.schritt("camera");
      this.kamera.startAb = Date.now();
    }

    try {
      // Nur nach einer Berührung - iOS erlaubt es nicht anders.
      const strom = await this.#stromHolen(lauf);
      if (lauf !== this.kamera.lauf) {
        for (const spur of strom.getTracks()) spur.stop();
        return;
      }
      // DIE SYSTEMFRAGE IST BEANTWORTET - und zwar mit Ja.
      //
      // Der Schritt darueber ("camera") faellt, BEVOR der Browser
      // fragt; er sagt "hat getippt". Zwischen ihm und der ersten
      // Aufnahme liegt die groesste einzelne Luecke dieses Wegs, und
      // ohne diese Marke stand sie in keiner Zahl.
      this.#kameraOkMerken();
      this.kamera.strom = strom;
      // playsinline steht auch im Aufbau. Ohne beides springt Safari in den
      // Vollbildmodus und der Trichter bricht ab.
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = strom;
      this.kamera.laeuft = true;
      // NICHT AWAIT, und das ist der Unterschied zwischen 1,2 Sekunden und
      // keiner.
      //
      // #abspielen() rennt play() gegen eine Frist von 1200 ms - fuer den
      // Fall, dass das Versprechen auf iOS offen bleibt. Danach lief
      // #videoBereit() los und pollte dieselbe Sache noch einmal. Zwei
      // Wartezeiten hintereinander fuer EINEN Vorgang: Bleibt play()
      // haengen, standen 1,2 Sekunden vor dem ersten Blick auf
      // videoWidth - obwohl der Strom da war und das Bild haette stehen
      // koennen.
      //
      // Angestossen wird weiter (ohne play() faengt auf manchen Geraeten
      // gar nichts an), und der Waechter darunter stoesst nach. Gewartet
      // wird nur noch an EINER Stelle: in #videoBereit(), das ohnehin auf
      // die Bildgroesse pollt.
      this.#abspielen(video);
      this.#abspielWaechter(video);
      const bereit = await this.#videoBereit(video, { lauf, grenzeMs: BILD_GRENZE_MS });
      if (lauf !== this.kamera.lauf) return;
      if (!bereit) {
        // EIN STROM OHNE BILD WIRD EINMAL NEU GEHOLT, still und ohne
        // Fehlerkasten. Die Kamera ist freigegeben, der zweite Anlauf
        // braucht keine Frage und steht meist nach einer Sekunde. Erst wenn
        // auch er schwarz bleibt, kommt der Fehler.
        if (!zweiterAnlauf && this.kamera.laeuft) {
          this.#technik(`Scan-Kamera ohne Bild nach ${Date.now() - this.kamera.startAb} ms – neuer Anlauf`);
          this.#kameraStarten({ zweiterAnlauf: true });
          return;
        }
        this.#kameraFehler("fehlerKameraBild");
        return;
      }
      this.#technik(`Scan-Kamera bereit nach ${Date.now() - this.kamera.startAb} ms · ${video.videoWidth}×${video.videoHeight}`);
    } catch (fehler) {
      // Ein abgeloester Lauf zeigt keinen Fehler an: Der neue ist gerade
      // dabei, und zwei Meldungen uebereinander verwirren nur.
      if (lauf === this.kamera.lauf) {
        const grund = String(fehler?.name || "");
        this.#technik(`Scan-Kamera Fehler: ${grund || String(fehler?.message || "").slice(0, 40)} nach ${Date.now() - this.kamera.startAb} ms`);
        const text = {
          NotAllowedError: "fehlerKameraErlaubnis", SecurityError: "fehlerKameraErlaubnis",
          NotSupportedError: "fehlerKameraBrowser", NotFoundError: "fehlerKameraFehlt",
          NotReadableError: "fehlerKameraBelegt", TimeoutError: "fehlerKameraWartet"
        }[grund] || "fehlerKamera";
        // Wie schnell die Absage kam, entscheidet, ob "Provo sërish" etwas
        // bringt (siehe #kameraAusweg).
        this.#kameraFehler(text, { dauerMs: Date.now() - this.kamera.startAb });
      }
      return;
    }

    // AUF DAS GESICHTSNETZ WIRD NICHT MEHR GEWARTET.
    //
    // GEMESSEN, NICHT GESCHAETZT: Hier stand ein await auf netzHolen() mit
    // neun Sekunden Frist. Wer das Netz nicht schon geladen hatte - ein
    // langsames Mobilnetz, 6,7 MB -, sah bis zu neun Sekunden lang einen
    // Bildschirm, auf dem NICHTS geschah: sein Bild, ein leerer Ring, ein
    // Satz. Danach erst begann die Fuehrung. Das ist die Wartezeit, die man
    // als "es dauert zu lange" erlebt, und sie war ganz umsonst.
    //
    // Jetzt fuehrt der Trichter sofort - mit dem Weg ohne Netz: Oval,
    // Abstand, Licht, "still halten". Diese Sekunden sind nicht mehr
    // verloren, der Besucher bringt sich in dieser Zeit in Stellung.
    //
    // Kommt das Netz an, UEBERNIMMT DER RING - und zwar mit jemandem, der
    // schon richtig sitzt. Kommt es nicht, macht der Weg ohne Netz fertig,
    // was er ohnehin getan haette.
    this.kamera.modus = "rueckfall";
    this.kamera.netzWartet = true;
    this.#rueckfallschleife(Date.now(), lauf);

    netzHolen({ zeitgrenzeMs: NETZ_WARTEN_MS }).then((netz) => {
      if (lauf !== this.kamera.lauf) return;
      this.kamera.netzWartet = false;
      if (!this.kamera.laeuft) return;
      this.#technik(netz
        ? `Gesichtserkennung bereit nach ${Date.now() - this.kamera.startAb} ms (ab Kamera) · ${netzArt() || "?"}`
        : "Gesichtserkennung NICHT geladen – einfache Erkennung");
      this.kamera.netz = netz;
      if (!netz) {
        this.sitzung.ergaenze({ meshFallback: true, meshState: netzStand() });
        return;
      }
      // Nimmt der Weg ohne Netz gerade seine Bilder auf, bleibt es dabei.
      // Zwei Aufnahmewege gleichzeitig waeren zwei Messungen desselben
      // Gesichts, die einander ueberschreiben.
      if (this.kamera.modus !== "rueckfall") return;
      this.kamera.modus = "ring";
      this.kamera.ring = this.#neuerRing();
      schreibe($("#ls-kamerahinweis"), this.text("ringEinmessen"));
      this.#ringschleife(lauf);
    });
  }

  // DEN KAMERASTROM HOLEN - UND ZWAR SO, DASS ER AUF JEDEM GERAET KOMMT.
  //
  // Hier stand EIN Versuch mit `width: 1440, height: 1920`. Zwei Dinge
  // gingen damit schief, und beide auf genau den Geraeten, die wir nicht
  // in der Hand haben:
  //
  // ERSTENS DAS HOCHFORMAT. Fast jede Telefonkamera liefert von sich aus
  // QUER (1920 breit, 1440 hoch). Wer Hochformat verlangt, zwingt den
  // Browser, den Strom zu drehen und neu zu skalieren - das kostet beim
  // Start Zeit und danach bei jedem einzelnen Bild. Verlangt wird jetzt
  // nur noch die FEINHEIT (1440 auf der langen Seite); welche Seite das
  // ist, entscheidet das Geraet, und der Zuschnitt auf den Kreis macht
  // ohnehin ein Quadrat daraus.
  //
  // ZWEITENS DAS ALLES-ODER-NICHTS. Kommt ein Browser mit der Bitte nicht
  // zurecht, wirft er OverconstrainedError - und der Besucher sah einen
  // Kamerafehler, obwohl seine Kamera in Ordnung ist. Das passiert in den
  // Fenstern von Instagram und TikTok auf Android oefter, als man denkt.
  //
  // Deshalb drei Anlaeufe, vom Feinen zum Einfachen. Der letzte ist das,
  // was jeder Browser kann, der ueberhaupt eine Kamera hat. Welcher Anlauf
  // gegriffen hat, geht in die Sitzung - sonst raten wir beim naechsten
  // Mal wieder.
  async #stromHolen(lauf = this.kamera.lauf) {
    const fehlerMitName = (name) => Object.assign(new Error(name), { name });
    if (!navigator.mediaDevices?.getUserMedia) throw fehlerMitName("NotSupportedError");
    const anlaeufe = [
      { name: "fein", regel: { facingMode: "user", width: { ideal: 1440 } } },
      { name: "einfach", regel: { facingMode: "user" } },
      { name: "nackt", regel: true }
    ];
    let vorbei = false;
    let frist;
    let abbrechen;
    let fristEnde = Date.now() + 30000;
    let freigabeAus = () => {};
    const abbruch = new Promise((_, ablehnen) => {
      abbrechen = () => { vorbei = true; ablehnen(fehlerMitName("AbortError")); };
      const ablaufen = () => {
        vorbei = true;
        ablehnen(fehlerMitName("TimeoutError"));
      };
      frist = setTimeout(ablaufen, 30000);
      // 30 Sekunden gelten nur, solange die Systemfrage offen sein kann.
      // Ist die Kamera freigegeben, haengt ein getUserMedia, das nach
      // KAMERA_HAENGT_MS noch nicht geantwortet hat (lifeskin-foto.js).
      freigabeAus = beiFreigabe(() => {
        const bis = Date.now() + KAMERA_HAENGT_MS;
        if (vorbei || bis >= fristEnde) return;
        fristEnde = bis;
        clearTimeout(frist);
        frist = setTimeout(ablaufen, KAMERA_HAENGT_MS);
      });
    });
    this.kamera.anfrageAbbrechen = abbrechen;
    const holen = async () => {
      let letzter = null;
      for (const anlauf of anlaeufe) {
        if (vorbei || lauf !== this.kamera.lauf) throw fehlerMitName("AbortError");
        try {
          const strom = await navigator.mediaDevices.getUserMedia({ video: anlauf.regel, audio: false });
          // getUserMedia ist nicht abbrechbar. Auch eine NACH Frist/Zurueck
          // erteilte Erlaubnis muss deshalb den gelieferten Strom schliessen.
          if (vorbei || lauf !== this.kamera.lauf) {
            for (const spur of strom.getTracks()) spur.stop();
            throw fehlerMitName("AbortError");
          }
          // HIER STAND EIN VERMERK IN DER SITZUNG, welcher Anlauf gegriffen
          // hat - und er haette den ganzen Schreibvorgang gekostet: Die
          // Firestore-Regeln pruefen mit hasOnly gegen das GANZE Dokument,
          // ein unbekanntes Feld weist alles ab, still, mit 403. Ein neues
          // Feld braucht erst die ausgerollte Regel.
          // tests/lifeskin-felder.test.mjs hat es sofort gefunden.
          return strom;
        } catch (fehler) {
          letzter = fehler;
          // Wer die Kamera ABGELEHNT hat, lehnt sie auch beim zweiten Anlauf
          // ab - und jeder weitere Versuch waere eine zweite Systemfrage, die
          // gar nicht erst erscheint. Das ist der eine Fall, in dem sofort
          // Schluss ist.
          const grund = String(fehler?.name || "");
          if (grund === "NotAllowedError" || grund === "SecurityError") throw fehler;
          if (vorbei || lauf !== this.kamera.lauf) throw fehler;
        }
      }
      throw letzter || new Error("Kamera nicht erreichbar");
    };
    try {
      return await Promise.race([holen(), abbruch]);
    } finally {
      clearTimeout(frist);
      freigabeAus();
      if (this.kamera.anfrageAbbrechen === abbrechen) this.kamera.anfrageAbbrechen = null;
    }
  }

  // Das Abspielen ANSTOSSEN, aber nicht darauf warten.
  //
  // GEMESSEN, NICHT GESCHAETZT: Hier stand `await video.play()`. Auf iOS
  // bleibt dieses Versprechen gelegentlich offen - die Kamera laeuft dann
  // wirklich (der gruene Punkt steht in der Statusleiste), aber der
  // Trichter stand hinter dem await: kein Bild, kein Hinweis, kein Ring.
  // Ein stiller Kreis, bis irgendwann doch etwas zurueckkam. Genau das
  // sieht von aussen aus wie "die Kamera startet sehr verspaetet".
  //
  // Angestossen wird es weiter - ohne play() faengt auf manchen Geraeten
  // gar nichts an. Nur gewartet wird hoechstens kurz, und ein abgelehntes
  // play() ist KEIN Kamerafehler: Der Strom steht schon, sonst waeren wir
  // nicht hier.
  async #abspielen(video, { fristMs = 1200 } = {}) {
    let frist;
    try {
      const laeuft = video?.play?.();
      if (laeuft && typeof laeuft.then === "function") {
        await Promise.race([Promise.resolve(laeuft).catch(() => {}),
          new Promise((fertig) => { frist = setTimeout(fertig, fristMs); })]);
      }
    } catch { /* siehe oben */ }
    finally { clearTimeout(frist); }
  }

  // Metadaten allein sind kein Bild. Auch ein stummer/beendeter Track
  // kann noch seine alte Breite und das letzte Einzelbild liefern.
  #kameraPausiert() {
    // Dieselbe Bedingung wie der vorhandene Hinweis .ls-quer. Unter ihm
    // weiter zu fotografieren wuerde Aufnahmen ohne sichtbare Fuehrung machen.
    return document.hidden || Boolean(window.matchMedia?.("(orientation: landscape) and (max-height: 560px)").matches);
  }

  #kameraSichtbarkeit() {
    if (this.#kameraPausiert()) {
      if (!this.kamera.wegSeit) this.kamera.wegSeit = Date.now();
      return;
    }
    const weg = this.kamera.wegSeit ? Date.now() - this.kamera.wegSeit : 0;
    this.kamera.wegSeit = 0;
    if (!this.kamera.laeuft || weg < 400) return;
    this.kamera.ring?.pauseEinrechnen(weg);
    this.kamera.letzteMessung = 0;
    this.kamera.letztesBild = Date.now();
    this.kamera.fortschrittSeit = Date.now();
    const video = $("#ls-video");
    this.#abspielen(video);
    this.#abspielWaechter(video);
  }

  #kamerabildBereit(video) {
    const spur = video?.srcObject?.getVideoTracks?.()[0];
    return !this.#kameraPausiert() && video?.readyState >= 2
      && video.videoWidth > 0 && video.videoHeight > 0
      && !video.paused && !video.ended && spur?.readyState === "live"
      && !spur.muted && spur.enabled !== false;
  }

  #kameraFehler(schluessel, { dauerMs } = {}) {
    this.#technik(`Scan abgebrochen: ${schluessel}`);
    this.#kameraStoppen();
    this.#blatt(false);
    this.#kameraFehlerZeigen(schluessel, "skanim", () => this.#kameraStarten(), { dauerMs });
  }

  // Bleibt auch WAEHREND des Scans aktiv: Breite > 0 erkennt weder ein
  // eingefrorenes Bild noch den Verlust der Kamera nach einem Anruf.
  #abspielWaechter(video) {
    if (!video || this.kamera.abspielTakt) return;
    const lauf = this.kamera.lauf;
    let bildzeit = video.currentTime;
    let fortschritt = "";
    this.kamera.letztesBild = Date.now();
    this.kamera.fortschrittSeit = Date.now();
    this.kamera.abspielTakt = setInterval(() => {
      if (lauf !== this.kamera.lauf || !this.kamera.laeuft) return;
      const jetzt = Date.now();
      if (this.#kameraPausiert()) {
        this.kamera.letztesBild = jetzt;
        this.kamera.fortschrittSeit = jetzt;
        return;
      }
      this.#kameraGroesse();
      const spur = this.kamera.strom?.getVideoTracks?.()[0];
      if (!spur || spur.readyState === "ended") {
        this.#kameraFehler("fehlerKameraUnterbrochen");
        return;
      }
      if (this.#kamerabildBereit(video) && video.currentTime !== bildzeit) {
        bildzeit = video.currentTime;
        this.kamera.letztesBild = jetzt;
      } else if (video.paused || video.readyState < 2) {
        this.#abspielen(video);
      }
      if (jetzt - this.kamera.letztesBild >= 10000) {
        this.#kameraFehler("fehlerKameraBild");
        return;
      }
      const stand = `${this.kamera.modus}:${this.kamera.proben.length}:${this.kamera.ring?.anteil || 0}`;
      if (stand !== fortschritt) {
        fortschritt = stand;
        this.kamera.fortschrittSeit = jetzt;
      }
      if (this.kamera.modus === "ring") this.#stillstandPruefen(jetzt);
    }, 800);
  }

  // DER RING STEHT - UND WAS SCHON DA IST, BLEIBT DA.
  //
  // Wer sechs von acht Strichen geschlossen hat und an den letzten zwei
  // haengt, bekam nach 45 Sekunden einen Fehler: Kamera aus, Bilder weg,
  // alles von vorn. Das macht niemand ein zweites Mal. Liegen Bilder vor,
  // geht jetzt nach STILLSTAND_HILFE_MS das Blatt auf - mit "Vazhdo
  // kështu", das mit dem Vorhandenen weitermacht. Die Kamera laeuft
  // weiter; wer es schliesst und weiterdreht, dreht weiter.
  //
  // Nur wenn es gar nichts zu retten gibt (kein einziges Bild), bleibt es
  // beim Abbruch - dann ist "noch einmal" wirklich der einzige Weg.
  #stillstandPruefen(jetzt) {
    const steht = jetzt - this.kamera.fortschrittSeit;
    const etwasDa = this.#fehlendeBlicke().length < NOETIGE_BLICKE.length;
    if (etwasDa && steht >= STILLSTAND_HILFE_MS) {
      this.kamera.fortschrittSeit = jetzt;
      this.#technik(`Scan ohne Fortschritt seit ${Math.round(steht / 1000)} s – Hilfe mit »Vazhdo kështu« geöffnet`);
      this.#blatt(true);
      return;
    }
    if (!etwasDa && steht >= STILLSTAND_ABBRUCH_MS) this.#kameraFehler("fehlerScanStillstand");
  }

  // Auf ein dekodiertes, laufendes Bild warten. Schnelle Geraete behalten
  // die kurze Beruhigungszeit; langsame bekommen bis zu zehn sichtbare
  // Sekunden. Abbruch entfernt alle Listener und Timer des alten Laufs.
  //
  // KUERZER ALS FRUEHER: 200 ms ruhige Groesse, hoechstens 700 ms ab dem
  // ersten Bild (vorher 450 / 1400). Der Kreis ist nur so lange
  // verborgen, bis das Bild ein Seitenverhaeltnis hat - das hat es mit
  // dem ersten dekodierten Bild. Die restliche Wartezeit war Spinner vor
  // einem Bild, das laengst da war; auf einem alten Android, dessen
  // Kamera beim Anlaufen ein- oder zweimal die Aufloesung wechselt, lag
  // hier bis zu anderthalb Sekunden nichts. Wechselt sie danach noch
  // einmal, rechnet `object-fit: cover` neu - verzerrt wird nichts.
  // Dieselben Zahlen stehen in #bildBereit() in lifeskin-foto.js.
  async #videoBereit(video, { fristMs = 700, ruheMs = 200, grenzeMs = 10000, lauf = this.kamera.lauf } = {}) {
    const kasten = $(".ls-kamera");
    if (kasten) kasten.dataset.bereit = "nein";
    return new Promise((aufloesen) => {
      let takt;
      let vorbei = false;
      let sichtbarMs = 0;
      let zuletzt = Date.now();
      let verborgen = this.#kameraPausiert();
      let groesse = "";
      let ruhigSeit = 0;
      let erstesBild = null;
      let gezeigt = false;
      const ereignisse = ["loadedmetadata", "loadeddata", "playing", "resize"];
      const fertig = (bereit) => {
        if (vorbei) return;
        vorbei = true;
        clearInterval(takt);
        for (const name of ereignisse) video.removeEventListener(name, pruefen);
        document.removeEventListener("visibilitychange", pruefen);
        if (this.kamera.bereitAbbrechen === abbrechen) this.kamera.bereitAbbrechen = null;
        aufloesen(bereit);
      };
      const abbrechen = () => fertig(false);
      const zeigen = () => {
        if (gezeigt) return;
        gezeigt = true;
        if (kasten) kasten.dataset.bereit = "ja";
        schreibe($("#ls-kamerahinweis"), this.text("ringEinmessen"));
      };
      const pruefen = () => {
        if (lauf !== this.kamera.lauf || !this.kamera.laeuft) { fertig(false); return; }
        const jetzt = Date.now();
        if (!verborgen) sichtbarMs += jetzt - zuletzt;
        zuletzt = jetzt;
        verborgen = this.#kameraPausiert();
        if (verborgen) return;
        if (this.#kamerabildBereit(video)) {
          if (erstesBild === null) erstesBild = sichtbarMs;
          const masse = `${video.videoWidth}x${video.videoHeight}`;
          if (masse !== groesse) { groesse = masse; ruhigSeit = sichtbarMs; }
          if (sichtbarMs - ruhigSeit >= ruheMs || sichtbarMs - erstesBild >= fristMs) {
            this.#kameraGroesse();
            zeigen();
            fertig(true);
            return;
          }
        } else {
          groesse = "";
          erstesBild = null;
        }
        if (sichtbarMs >= grenzeMs) fertig(false);
      };
      this.kamera.bereitAbbrechen = abbrechen;
      for (const name of ereignisse) video.addEventListener(name, pruefen);
      document.addEventListener("visibilitychange", pruefen);
      takt = setInterval(pruefen, 60);
      pruefen();
    });
  }

  // Das Quadrat muss zwischen Kopf, Anleitung und Hilfe passen, auch quer
  // und mit sichtbarer Browserleiste. Der Bildzuschnitt liest diese Masse
  // ohnehin bei jedem Frame; an der Fotoaufloesung aendert sich nichts.
  #kameraGroesse() {
    if (this.aktiv !== "kamera") return;
    const schirm = $("#ls-kamera");
    const buehne = $(".ls-kamera");
    if (!schirm || !buehne) return;
    const hoehe = window.visualViewport?.height || window.innerHeight;
    if (hoehe > 0) schirm.style.height = `${Math.floor(hoehe)}px`;
    const stil = getComputedStyle(schirm);
    const zahl = (wert) => parseFloat(wert) || 0;
    let frei = schirm.clientHeight - zahl(stil.paddingTop) - zahl(stil.paddingBottom);
    for (const kind of schirm.children) {
      if (kind === buehne) continue;
      const kindStil = getComputedStyle(kind);
      frei -= kind.getBoundingClientRect().height + zahl(kindStil.marginTop) + zahl(kindStil.marginBottom);
    }
    const breite = schirm.clientWidth - zahl(stil.paddingLeft) - zahl(stil.paddingRight);
    const mass = `${Math.max(0, Math.floor(Math.min(breite, frei)))}px`;
    if (buehne.style.width !== mass) buehne.style.width = mass;
  }

  // Die zugeschnittene, gespiegelte Leinwand.
  //
  // HIER LAG EINER DER FEHLER, an denen die Kamera im Betrieb gescheitert
  // ist. Das Video wird mit `object-fit: cover` angezeigt: Der Browser
  // schneidet es zu und zeigt nur den mittleren Ausschnitt. Vermessen wurde
  // aber das *ganze* Kamerabild. Der Besucher legte sein Gesicht sauber in
  // den Kreis - und in dem Bild, das gemessen wurde, war dasselbe Gesicht
  // viel kleiner.
  //
  // Und genau diese Leinwand bekommt auch das Gesichtsnetz zu sehen, nicht
  // das Videobild. Dann stehen die Landmarken in denselben Bildpunkten, die
  // gemessen werden, und es gibt nichts zurueckzurechnen. Gespiegelt wie die
  // Vorschau: Damit ist "rechts im Bild" dasselbe wie "rechts im Spiegel",
  // und der Ring folgt dem Kopf so, wie der Besucher ihn sieht.
  // WELCHER TEIL DES KAMERABILDES IM KREIS LANDET.
  //
  // EINMAL gerechnet, nicht zweimal. Dieselben acht Zeilen standen in
  // #leinwandFuellen() und in #messleinwandFuellen(), und die beiden MUESSEN
  // deckungsgleich bleiben: Die Landmarken werden auf dem einen Bild
  // gefunden und auf dem anderen verwendet. Liefen sie auseinander - und
  // zwei Kopien laufen frueher oder spaeter auseinander -, laege das
  // Gesichtsnetz um genau diesen Unterschied daneben, und niemand saehe,
  // woher es kommt.
  #videoAusschnitt(video) {
    if (!this.#kamerabildBereit(video) || !video.clientWidth || !video.clientHeight
      || Date.now() - this.kamera.letztesBild > 2000) return null;
    const kastenB = video.clientWidth;
    const kastenH = video.clientHeight;
    const massstab = Math.max(kastenB / video.videoWidth, kastenH / video.videoHeight) * NAEHE;
    const breite = Math.min(video.videoWidth, kastenB / massstab);
    const hoehe = Math.min(video.videoHeight, kastenH / massstab);
    return {
      x: (video.videoWidth - breite) / 2,
      y: (video.videoHeight - hoehe) / 2,
      breite, hoehe, kastenB, kastenH
    };
  }

  // Das Bild spiegeln und auf die Leinwand legen.
  //
  // Gespiegelt, weil ein Selfie aussehen muss wie ein Blick in den Spiegel:
  // Wer den Kopf nach rechts dreht, will das Bild nach rechts gehen sehen.
  // Auch diese Zeilen standen zweimal da.
  #spiegelnAuf(leinwand, video, aus, breite, hoehe) {
    if (leinwand.width !== breite || leinwand.height !== hoehe) {
      leinwand.width = breite;
      leinwand.height = hoehe;
    }
    const stift = leinwand.getContext("2d", { willReadFrequently: true });
    if (!stift) return null;
    stift.save();
    try {
      stift.translate(breite, 0);
      stift.scale(-1, 1);
      stift.drawImage(video, aus.x, aus.y, aus.breite, aus.hoehe, 0, 0, breite, hoehe);
    } catch {
      // Der Stream kann zwischen Bereitschaftspruefung und drawImage
      // aussetzen. Ein fehlendes Bild darf die Schleife nicht abbrechen.
      return null;
    } finally {
      stift.restore();
    }
    return leinwand;
  }

  #leinwandFuellen({ breite = VERFOLGUNG_BREITE } = {}) {
    const video = $("#ls-video");
    const leinwand = $("#ls-leinwand");
    const aus = this.#videoAusschnitt(video);
    if (!aus || !leinwand) return null;
    const hoehe = Math.max(1, Math.round((aus.kastenH / aus.kastenB) * breite));
    return this.#spiegelnAuf(leinwand, video, aus, breite, hoehe);
  }

  // Dasselbe in voller Kameraaufloesung und auf einer eigenen Leinwand.
  //
  // Eigene Leinwand, weil die andere dem Gesichtsnetz gehoert: Wechselte sie
  // je Aufnahme die Groesse, muesste MediaPipe seinen Bildstrom neu aufsetzen
  // und die Verfolgung wuerde sichtbar stocken.
  //
  // EINE einzige fuer den ganzen Scan, und in #kameraStoppen() wieder
  // freigegeben: In voller Aufloesung sind das rund elf Megabyte.
  #messleinwandFuellen() {
    const video = $("#ls-video");
    const aus = this.#videoAusschnitt(video);
    if (!aus) return null;
    const breite = Math.round(aus.breite);
    const hoehe = Math.round(aus.hoehe);
    if (!(breite > 0 && hoehe > 0)) return null;
    const leinwand = (this.kamera.messleinwand ||= document.createElement("canvas"));
    return this.#spiegelnAuf(leinwand, video, aus, breite, hoehe);
  }

  #bildHolen({ breite = GATE_BREITE } = {}) {
    const leinwand = this.#leinwandFuellen({ breite });
    if (!leinwand) return null;
    return leinwand.getContext("2d", { willReadFrequently: true })
      .getImageData(0, 0, leinwand.width, leinwand.height);
  }

  // Das Oval in Bildkoordinaten. Deckt sich Zahl fuer Zahl mit
  // .ls-oval__ring im CSS - und weil das Bild derselbe Ausschnitt ist,
  // meint es auch dieselbe Stelle.
  // Der Kreis in Buehnenkoordinaten.
  //
  // Deckt sich Zahl fuer Zahl mit .ls-kamera__kreis und .ls-oval__ring im
  // CSS; tests/lifeskin-service-worker haelt beide zusammen. Ueber diese
  // Umrechnung liegen Ring und Netz genau auf dem Bild, das im Kreis steht.
  #oval(bild) {
    return { x: bild.width * 0.07, y: bild.height * 0.07, w: bild.width * 0.86, h: bild.height * 0.86 };
  }

  // Die Buehne: der quadratische Kasten, in dem der Kreis sitzt.
  //
  // Nicht das Videobild fragen - das steht seit dem runden Ausschnitt im
  // Kreis-Kasten und ist damit kleiner als die Buehne. Wer hier das Video
  // misst, zeichnet Ring und Netz um sieben Prozent verschoben, und das
  // sieht aus wie eine schlechte Erkennung, obwohl die Erkennung stimmt.
  #buehne() {
    const kasten = $(".ls-kamera");
    if (!kasten?.clientWidth) return null;
    return { width: kasten.clientWidth, height: kasten.clientHeight };
  }

  // Das Gesichtsoval INNERHALB des zugeschnittenen Bildes.
  //
  // Etwas anderes als #oval(): Jenes beschreibt, wo der Kreis auf der Buehne
  // liegt. Dieses beschreibt, wo im Kreisbild ein Gesicht zu erwarten ist -
  // und das Kreisbild ist ja bereits der Kreis. Gebraucht wird es nur vom
  // Rueckfallweg ohne Gesichtsnetz.
  #gesichtsOval(bild) {
    return { x: bild.width * 0.12, y: bild.height * 0.08, w: bild.width * 0.76, h: bild.height * 0.84 };
  }

  #ringschleife(lauf = this.kamera.lauf) {
    if (lauf !== this.kamera.lauf || !this.kamera.laeuft || this.kamera.modus !== "ring") return;
    if (this.#kameraPausiert()) { requestAnimationFrame(() => this.#ringschleife(lauf)); return; }

    // NICHT BEI JEDEM BILDSCHIRMTAKT MESSEN - siehe MESS_TAKT_MS.
    //
    // Der Rueckgriff auf requestAnimationFrame bleibt: So haelt die Schleife
    // von selbst an, wenn die Seite in den Hintergrund geht, und der Browser
    // entscheidet, wann er Luft hat. Nur die Messung darin ist gedeckelt.
    const seitMessung = Date.now() - this.kamera.letzteMessung;
    if (seitMessung < MESS_TAKT_MS) {
      requestAnimationFrame(() => this.#ringschleife(lauf));
      return;
    }
    this.kamera.letzteMessung = Date.now();

    const leinwand = this.#leinwandFuellen({ breite: VERFOLGUNG_BREITE });
    if (!leinwand) { setTimeout(() => this.#ringschleife(lauf), 160); return; }

    // Der Zeitstempel muss streng wachsen, sonst verwirft MediaPipe das Bild.
    this.kamera.uhr = Math.max(this.kamera.uhr + 1, Math.round(performance.now()));
    const netz = messeNetz(leinwand, this.kamera.uhr);

    // DIE ERKENNUNG IST WEG, NICHT DAS GESICHT.
    //
    // Wirft sie Bild um Bild einen Fehler (NETZ_AUSFALL_BILDER), ist sie
    // selbst ausgefallen - etwa ein verlorener Grafikkontext. Der Ring
    // stuende dann still und sagte "zurueck in den Kreis" zu jemandem, der
    // laengst darin sitzt. Der Weg ohne Netz macht fertig, und was der Ring
    // schon aufgenommen hat, bleibt.
    if (!netz && netzFehlerFolge() >= NETZ_AUSFALL_BILDER) {
      this.#technik(`Gesichtserkennung ausgefallen (${netzFehlerFolge()} Fehler in Folge) – einfache Erkennung übernimmt`);
      this.kamera.netz = null;
      this.kamera.modus = "rueckfall";
      this.#rueckfallschleife(Date.now(), lauf);
      return;
    }

    const jetzt = Date.now();
    const stand = this.kamera.ring.schritt(netz, jetzt);

    this.#ringZeichnen(stand);
    this.#ringHinweisZeigen(netz, stand);

    // Der Nachschlag. Er laeuft VOR den Ausloesern: Was dieser Durchgang
    // gerade ausloest, bekommt seine Nachschlagbilder in den folgenden
    // Durchgaengen und nicht schon in diesem.
    //
    // Er misst nur und kopiert; er vermisst nichts. Eine zweite Messung je
    // Aufnahme kostet Zehntelsekunden und wuerde den Ring stocken lassen -
    // und der Befund haengt an der Messung, nicht am Foto.
    this.#fotoNachschlag(netz, stand);

    if (stand.frontalFaellig) {
      this.#ringAufnahme(netz, leinwand, { frontal: true, stand });
      this.kamera.ring.aufnahmeVermerkt(jetzt, { frontal: true });
    } else if (stand.neuerSektor !== null) {
      this.#ringAufnahme(netz, leinwand, { sektor: stand.neuerSektor, stand });
    } else if (stand.mitte && this.#frontalNoetig()
      && jetzt - this.kamera.ring.letzteAufnahme >= 900) {
      this.#ringAufnahme(netz, leinwand, { frontal: true, stand });
      this.kamera.ring.aufnahmeVermerkt(jetzt, { frontal: true });
    }

    if (this.#abschlussFaellig(stand, jetzt)) { this.#ringAbschluss(); return; }

    // So schnell, wie das Geraet es hergibt. Auf einem Handy mit GPU sind das
    // gut dreissig Bilder je Sekunde - und daran haengt das Gefuehl, verfolgt
    // zu werden.
    requestAnimationFrame(() => this.#ringschleife(lauf));
  }

  // Der Weg ohne Gesichtsnetz.
  //
  // Kein Ring, kein Tor: kurz stillhalten, drei Aufnahmen, weiter. Die alte
  // Erkennung liefert dabei nur noch den Hinweistext, sie haelt nichts mehr
  // an - genau das war der Fehler, den der Ring loesen sollte.
  #rueckfallschleife(seit = Date.now(), lauf = this.kamera.lauf) {
    if (lauf !== this.kamera.lauf || !this.kamera.laeuft || this.kamera.modus !== "rueckfall") return;
    if (this.#kameraPausiert()) { setTimeout(() => this.#rueckfallschleife(Date.now(), lauf), 170); return; }
    const bild = this.#bildHolen({ breite: GATE_BREITE });
    if (bild) {
      const ergebnis = pruefeAufnahme(bild, this.#gesichtsOval(bild), this.kamera.letztesRaster,
        { rasterBreite: 64, schritt: 2 });
      this.kamera.letztesRaster = ergebnis.raster;
      this.#ringZeichnen({ abgedeckt: new Array(SEKTOREN).fill(false), zielSektor: null, kalibriert: false });
      const lage = {
        zuNah: "aufnahmeHinweisNah", zuFern: "aufnahmeHinweisFern",
        zuDunkel: "aufnahmeHinweisDunkel", zuHell: "aufnahmeHinweisHell"
      }[ergebnis.hinweis];
      // ZWEI ANWEISUNGEN, DIE EINANDER WIDERSPRACHEN.
      //
      // Hier stand immer "Mos lëvizni…" - nicht bewegen. Das ist richtig
      // fuer den Weg OHNE Gesichtsnetz, wo drei gerade Bilder entstehen.
      // Solange das Netz aber noch unterwegs ist, ist es die falsche
      // Auskunft: Kommt es an, springt die Zeile auf "Kopf langsam im
      // Kreis drehen" - und der Besucher hat gerade zwei Sekunden lang
      // gelesen, er solle still halten. Wer zwei Anweisungen bekommt,
      // folgt keiner.
      //
      // Solange offen ist, welcher Weg laeuft, steht deshalb der Satz da,
      // der fuer BEIDE stimmt: Gesicht in den Kreis, kurz ruhig halten.
      const ruf = lage || (this.kamera.netzWartet ? "ringEinmessen" : "aufnahmeGleich");
      schreibe($("#ls-kamerahinweis"), this.text(ruf));
    }
    // Aufgenommen wird erst, wenn feststeht, ob das Netz kommt. Sonst waere
    // der Scan nach drei Sekunden vorbei - mit drei geraden Bildern -,
    // obwohl der Ring eine Sekunde spaeter haette laufen koennen.
    if (!this.kamera.netzWartet && Date.now() - seit >= 3000) {
      this.kamera.modus = "aufnahme";
      this.#rueckfallAufnehmen(lauf);
      return;
    }
    setTimeout(() => this.#rueckfallschleife(seit, lauf), 170);
  }

  // Drei Aufnahmen ohne Ring - und SIE WERDEN AUCH ALS FOTO AUFBEWAHRT.
  //
  // GEMESSEN, NICHT GESCHAETZT: Bisher entstanden hier nur Messwerte. Das
  // Foto wurde ausschliesslich im Ringweg zurueckgelegt - wer also das
  // Gesichtsnetz nicht geladen bekam (langsames Netz, altes Geraet), kam
  // beim Arzt ohne ein einziges Bild an. Eine Hautanalyse ohne Aufnahme
  // ist keine, und gemerkt haette man es erst am Befund.
  //
  // Die drei Bilder liegen 400 Millisekunden auseinander, also weit genug
  // fuer echte Auswahl: Das schaerfste bleibt.
  async #rueckfallAufnehmen(lauf = this.kamera.lauf) {
    // Ohne Netz gibt es keine Nasenspitze. Die Mitte des Suchovals ist der
    // beste Anhaltspunkt, den dieser Weg hat - und dort sitzt das Gesicht,
    // weil der Kreis darum herum gezeichnet ist.
    const mitte = { x: 0.5, y: 0.46 };
    for (let i = 0; i < 3; i += 1) {
      if (lauf !== this.kamera.lauf || !this.kamera.laeuft) return;

      // AUF EIN BRAUCHBARES BILD WARTEN, statt ins Leere auszuloesen.
      //
      // Hier stand `continue`. Auf einem langsamen Geraet steht das
      // Videobild nach drei Sekunden noch nicht - dann sprangen alle drei
      // Durchgaenge weiter, es entstand kein einziges Foto und keine
      // einzige Probe, und #ringAbschluss() meldete "kein Gesicht
      // erkannt". Der Besucher hatte alles richtig gemacht und stand vor
      // einem Fehler, der nichts mit ihm zu tun hatte.
      //
      // Bis zu zehn Sekunden wie der Streamwaechter: Eine kurze
      // Unterbrechung ist kein fehlendes Gesicht.
      let leinwand = null;
      for (let versuch = 0; versuch < 100 && !leinwand; versuch += 1) {
        while (this.#kameraPausiert() && lauf === this.kamera.lauf && this.kamera.laeuft) await warte(170);
        if (lauf !== this.kamera.lauf || !this.kamera.laeuft) return;
        leinwand = this.#leinwandFuellen({ breite: VERFOLGUNG_BREITE });
        if (!leinwand) await warte(100);
        if (lauf !== this.kamera.lauf || !this.kamera.laeuft) return;
      }
      if (!leinwand) { this.#kameraFehler("fehlerKameraBild"); return; }
      const bild = leinwand.getContext("2d", { willReadFrequently: true })
        .getImageData(0, 0, leinwand.width, leinwand.height);
      const geprueft = pruefeAufnahme(bild, this.#gesichtsOval(bild));
      this.kamera.proben.push({ frontal: true, sektor: null, erkannt: Boolean(geprueft.punkte) });
      this.zustand.erkannt = this.zustand.erkannt || Boolean(geprueft.punkte);
      const messleinwand = this.#messleinwandFuellen();
      if (messleinwand) this.#fotoMerken(messleinwand, { frontal: true, mitte });
      if (i < 2) await warte(400);
    }
    this.#ringAbschluss();
  }

  #frontalAnzahl() {
    return this.kamera.proben.filter((p) => p.frontal).length;
  }

  // Der Ring mit den Strichen, eingeschrieben in denselben Kasten, den
  // #oval() misst. Ein echter Kreis: Der kleinere der beiden Kastenmasse
  // gibt den Radius.
  #ringZeichnen(stand) {
    const leinwand = $("#ls-ring");
    const buehne = this.#buehne();
    if (!leinwand || !buehne) return;

    const b = buehne.width;
    const h = buehne.height;
    if (leinwand.width !== b || leinwand.height !== h) { leinwand.width = b; leinwand.height = h; }
    const stift = leinwand.getContext("2d");
    stift.clearRect(0, 0, b, h);

    const kasten = this.#oval(buehne);
    const mx = kasten.x + kasten.w / 2;
    const my = kasten.y + kasten.h / 2;
    const radius = Math.min(kasten.w, kasten.h) / 2;

    // Die Farben des Rings sind fuer HELLEN Grund gesetzt.
    //
    // Sie waren weiss, weil die Buehne schwarz war. Auf dem Hausgrund waere
    // Weiss auf Weiss - der Ring waere unsichtbar, und mit ihm die einzige
    // Rueckmeldung, die dem Besucher sagt, ob er richtig steht.
    stift.strokeStyle = "rgba(26,31,30,0.12)";
    stift.lineWidth = 1;
    stift.beginPath();
    stift.arc(mx, my, radius, 0, Math.PI * 2);
    stift.stroke();

    const striche = SEKTOREN * STRICHE_JE_SEKTOR;
    const puls = 0.5 + 0.5 * Math.sin(Date.now() / 320);

    // DER ZEIGER: WO DER KOPF GERADE HINSCHAUT.
    //
    // So macht es Face ID, und das ist der Grund, warum dort niemand eine
    // Anleitung braucht: Der Ring antwortet auf die Bewegung, WAEHREND sie
    // passiert. Man dreht ein Stueck, sieht etwas aufleuchten, dreht
    // weiter - und hat in zwei Sekunden begriffen, was verlangt wird, ohne
    // ein Wort gelesen zu haben.
    //
    // Ein Pfeil kann das nicht. Er sagt, wohin man soll, aber nicht, ob
    // man gerade etwas richtig macht - und genau diese Antwort fehlte.
    //
    // stand.winkel ist die Richtung, in die die Nase zeigt; stand.ausschlag
    // die Staerke der Drehung (eins heisst: reicht fuer einen Strich).
    // Unter drei Zehnteln wird nichts angezeigt - dort ist der Kopf
    // praktisch gerade, und die Richtung waere geraten.
    const zeiger = stand.kalibriert && typeof stand.winkel === "number"
      && stand.ausschlag >= 0.3 ? stand.winkel : null;
    const staerke = Math.min(1, stand.ausschlag || 0);

    for (let i = 0; i < striche; i += 1) {
      const sektor = Math.floor(i / STRICHE_JE_SEKTOR);
      // Eine halbe Sektorbreite zurueck, damit Strich und Sektor dasselbe
      // meinen: Seit sektorAus() um die Mitte teilt, liegt die Mitte von
      // Sektor 0 oben - und nicht mehr seine linke Kante. Ohne diese
      // Drehung leuchtete der Strich neben der Richtung, in die der
      // Besucher gerade schaut.
      const winkel = -Math.PI / 2 - Math.PI / SEKTOREN + (i / striche) * Math.PI * 2;
      const zu = stand.abgedeckt[sektor];
      const ziel = !zu && sektor === stand.zielSektor && stand.kalibriert;

      // WIE NAH DIESER STRICH AM ZEIGER LIEGT: eins genau darunter, null
      // einen halben Sektor daneben. Der kuerzere der beiden Wege um den
      // Kreis - sonst leuchtet oben nichts, wenn der Zeiger knapp darunter
      // steht.
      let leuchten = 0;
      if (zeiger !== null) {
        const strichRichtung = winkel + Math.PI / 2;
        const ab = Math.abs(((strichRichtung - zeiger + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        leuchten = Math.max(0, 1 - ab / (Math.PI / SEKTOREN)) * staerke;
      }

      const innen = radius + 6;
      const aussen = innen + (zu ? 13 : ziel ? 11 : 7) + leuchten * 7;
      // Dunkel, bis der Sektor zugeht - dann gruen. Dazwischen der Zeiger:
      // Er waechst mit der Drehung in die Markenfarbe hinein, und wenn er
      // ganz hell steht, geht der Strich im naechsten Augenblick zu.
      stift.strokeStyle = zu
        ? "rgba(14,124,104,0.95)"
        : leuchten > 0.05
          ? `rgba(14,124,104,${0.25 + leuchten * 0.7})`
          : ziel
            ? `rgba(26,31,30,${0.42 + puls * 0.5})`
            : "rgba(26,31,30,0.26)";
      stift.lineWidth = zu || ziel || leuchten > 0.05 ? 3.5 : 2.5;
      stift.lineCap = "round";
      stift.beginPath();
      stift.moveTo(mx + Math.cos(winkel) * innen, my + Math.sin(winkel) * innen);
      stift.lineTo(mx + Math.cos(winkel) * aussen, my + Math.sin(winkel) * aussen);
      stift.stroke();
    }
  }

  // DER PUNKTSCHLEIER UEBER DEM GESICHT IST WEG.
  //
  // Er zeichnete bei JEDEM Bild rund 240 Punkte auf eine bildschirmgrosse
  // Leinwand - auf einem schwachen Telefon genug, um den Ring stocken zu
  // lassen, und das ausgerechnet waehrend der Drehung.
  //
  // Er sollte sagen "du wirst erkannt". Das sagt der Ring jetzt besser:
  // Sein heller Zeiger wandert mit dem Kopf mit, in dem Augenblick, in dem
  // der sich bewegt. Face ID macht es genauso - dort liegt ueber dem
  // Gesicht nichts, und trotzdem weiss jeder sofort, dass er gemeint ist.

  // Der Ring dieses Laufs.
  //
  // In der kurzen Fassung faengt der vorgeschlagene Strich RECHTS an statt
  // oben: "nach rechts schauen" ist die bequemste erste Bewegung. Nach
  // oben schauen geht gegen den Hals, und dabei verliert der Besucher sein
  // eigenes Bild aus den Augen - als erste Aufforderung die schlechteste.
  //
  // Angenommen wird weiter jede Richtung. Das hier aendert nur, was
  // ANGEBOTEN wird.
  #neuerRing() {
    return this.variante === "kurz"
      ? new Ringlauf({ startSektor: SEKTOR_RECHTS })
      : new Ringlauf();
  }

  #ringHinweisZeigen(netz, stand) {
    const oval = $("#ls-oval");
    if (oval) oval.dataset.stand = !netz ? "rot" : stand.kalibriert ? "gruen" : "gelb";

    let text;
    if (!netz) {
      text = this.text("ringZurueck");
    } else if (!stand.kalibriert) {
      // Der Abstand, in echten Zahlen: Der Pupillenabstand am Kreis sagt
      // genau, wie gross das Gesicht im Bild steht. Frueher kam derselbe
      // Hinweis aus der Breite eines geschaetzten Rechtecks - und lag
      // entsprechend oft daneben.
      text = this.#abstandHinweis(netz) || this.text("ringEinmessen");
    } else if (stand.anteil >= 0.999 && stand.frontalGenommen === false) {
      // DER RING IST ZU UND ES FEHLT DAS GERADE BILD.
      //
      // Hier stand "Gati." - und darunter geschah nichts, weil fertigBei()
      // das gerade Bild verlangt und der Ring es gerade nachfordert. Der
      // Kunde sieht einen geschlossenen Ring, liest "fertig" und wartet auf
      // etwas, das ohne ihn nicht kommt. Ein Scan, der auf eine Haltung
      // wartet, muss sie nennen.
      text = this.text("ringGeradeaus");
    } else if (stand.anteil >= 0.999) {
      text = this.text("ringFertig");
    } else if (this.#wandertAnhaltend(stand)) {
      // Erst wenn es anhaelt, nicht beim ersten wackligen Bild: Ein Hinweis,
      // der im Bildtakt an- und ausgeht, ist nicht zu lesen und sieht aus
      // wie ein Fehler.
      text = this.text("ringRuhig");
    } else if (stand.anteil >= 0.6) {
      text = this.text("ringFastFertig");
    } else if (stand.anteil > 0) {
      text = this.text("ringWeiter");
    } else if (stand.dauerMs >= POSE_GRENZEN.ausloeserHinweisAbMs) {
      // Nichts geht - dann nicht die Anweisung zum vierten Mal wiederholen,
      // sondern den Ausweg zeigen. Seit alle Striche zugehen muessen, ist der
      // Ausloeser unter dem Bild der einzige, und er gehoert darum genannt.
      // Beendet wird dadurch nichts.
      text = this.text("ringOhneBewegung");
    } else {
      text = this.text("ringDrehen");
    }
    schreibe($("#ls-kamerahinweis"), text);
  }

  // Wandert das Bild laenger als einen Wimpernschlag?
  //
  // stand.unruhig gilt je Bild. Ein einzelnes wackliges Bild ist normal und
  // darf keinen Hinweis ausloesen; ein halbe Sekunde langes Mitfuehren des
  // Handys schon - das ist genau der Fall, in dem jemand glaubt, er drehe
  // den Kopf, und in Wahrheit das Handy bewegt.
  #wandertAnhaltend(stand, jetzt = Date.now()) {
    if (!stand.unruhig) { this.kamera.unruhigSeit = 0; return false; }
    if (!this.kamera.unruhigSeit) this.kamera.unruhigSeit = jetzt;
    return jetzt - this.kamera.unruhigSeit >= UNRUHE_HINWEIS_AB_MS;
  }

  // Steht das Gesicht gut im Kreis?
  //
  // Gemessen am Pupillenabstand, als Anteil der Kreisbreite. Ein Gesicht
  // fuellt den Kreis gut, wenn dieser Anteil um ein Viertel liegt: Der
  // Pupillenabstand betraegt rund 43 Prozent der Gesichtsbreite, und ein
  // Gesicht soll etwa drei Fuenftel des Kreises einnehmen.
  //
  // Ein Hinweis, keine Sperre. Wer ihn nicht befolgt, wird trotzdem
  // eingemessen - notfalls nach der Frist in lifeskin-pose.js.
  #abstandHinweis(netz) {
    const l = netz.punkte[MARKE.irisLinks];
    const r = netz.punkte[MARKE.irisRechts];
    if (!l || !r) return null;
    const anteil = Math.hypot(r.x - l.x, r.y - l.y);
    if (anteil < 0.20) return this.text("aufnahmeHinweisFern");
    if (anteil > 0.34) return this.text("aufnahmeHinweisNah");
    return null;
  }

  // Eine Aufnahme, sofort vermessen.
  //
  // Die Zahlen, die der Besucher waehrend der Drehung wachsen sieht, kommen
  // aus diesen Messungen - nicht aus einem Zaehler, der die Zeit abzaehlt.
  #ringAufnahme(netz, leinwand, { frontal = false, sektor = null, stand = null } = {}) {
    if (!netz?.punkte || !leinwand) return;
    // Ein Blinzeln oder ein offener Mund verdirbt die Messung: geschlossene
    // Lider geben kein Augenweiss fuer den Weissabgleich her, ein offener
    // Mund zieht die Wangenhaut straff. Ein Bild auszulassen kostet nichts -
    // es kommen genug.
    const mimik = netz.mimik;
    if (mimik && (mimik.augeZuLinks > 0.55 || mimik.augeZuRechts > 0.55 || mimik.mundOffen > 0.4)) return;

    // Gemessen wird auf der grossen Leinwand, nicht auf der, die das Netz
    // gesehen hat. Die Landmarken kommen als Anteile und passen auf beide.
    const messleinwand = this.#messleinwandFuellen() || leinwand;

    // Das Foto wird hier nur umkopiert, nicht kodiert: drawImage auf eine
    // kleine Leinwand kostet unter einer Millisekunde. Das Kodieren zu JPEG
    // kostet ein Vielfaches und passiert deshalb erst am Ende, wenn die
    // Kamera ohnehin steht - im Bildtakt wuerde man es als Ruckeln sehen.
    this.#fotoMerken(messleinwand, { frontal, stand, netz });
    // Und eine knappe halbe Sekunde lang weitere Bilder hinterher. Das
    // schaerfste bleibt, die anderen fuellen die weiteren Plaetze.
    const jetztMs = Date.now();
    this.kamera.nachschlag = { frontal, bis: jetztMs + NACHSCHLAG_MS, naechste: jetztMs + NACHSCHLAG_TAKT_MS };

    // WAS HIER FRUEHER STAND, WAR DIE TEUERSTE ZEILE DES GANZEN SCANS.
    //
    // Ein getImageData ueber die volle Kameraaufloesung, je Aufnahme, nur
    // damit ein paar Dutzend Millisekunden spaeter die Haut vermessen
    // werden konnte. Deshalb lief die Messung auch ausserhalb des
    // Bildtakts: Im Takt haette der Ring genau dann gestockt, wenn ein
    // Strich zugeht.
    //
    // Es wird nicht mehr gemessen, also wird auch nichts mehr geholt und
    // nichts mehr verschoben. Was bleibt, ist die Notiz, DASS an dieser
    // Stelle ein Gesicht im Bild war - drei Felder, sofort geschrieben.
    this.kamera.proben.push({ frontal, sektor, erkannt: true, pose: netz.pose });
    this.zustand.erkannt = true;
  }

  // Drei Aufnahmen behalten: gerade, nach rechts, nach links.
  //
  // Ohne eigene Aufforderung und ohne eigene Animation. Der Ring laesst den
  // Kopf ohnehin einmal herumgehen; dabei kommt jede der drei Haltungen von
  // selbst vorbei. Eine zusaetzliche Anweisung waere ein zusaetzlicher
  // Schritt, an dem Leute abspringen - und sie brauechte niemand.
  //
  // Behalten wird jeweils die BESTE Aufnahme je Richtung, nicht die erste:
  // Wer den Kopf dreht, laeuft am Ideal vorbei, und die Aufnahme kurz davor
  // oder danach ist schiefer als die mittendrin. Also wird ersetzt, solange
  // etwas Genaueres kommt.
  // Welche der noetigen Blickrichtungen wirklich ein Bild hat.
  //
  // Nicht ueber Object.keys(this.kamera.fotos): Den Platz legt #fotoMerken()
  // an, BEVOR feststeht, ob das Bild genommen wird - ein Schluessel ohne
  // Bild darin ist also moeglich, und der zaehlte sonst mit.
  #fehlendeBlicke() {
    const hat = (blick) => {
      const platz = this.kamera.fotos?.[blick];
      return Boolean(platz && (platz.erste || (platz.mehr || []).length));
    };
    return NOETIGE_BLICKE.filter((blick) => !hat(blick));
  }

  // Noch ein gerades Bild?
  //
  // Drei reichen fuer einen stabilen Median, jedes weitere kostet nur Zeit -
  // ABER: Fehlt das gerade Bild ganz (der Ring hat es nachgefordert, dabei
  // faellt frontalGenommen zurueck auf false), dann ist dieses eine noetig,
  // und die Obergrenze darf es nicht verhindern. Genau daran hing der Scan
  // fest: drei gerade Proben genommen, keine davon als Bild abgelegt, der
  // Ring fordert nach - und der einzige Ausloeser, der ihn erfuellen kann,
  // ist durch seinen eigenen Zaehler gesperrt.
  #frontalNoetig() {
    if (!this.kamera.ring?.frontalGenommen) return true;
    return this.#frontalAnzahl() < FRONTAL_HOECHSTENS;
  }

  // Ist die Frist um?
  //
  // Gerechnet ab dem Beginn des Rings und nicht ab dem Nachfordern - sonst
  // verlaengerte jede Runde die Frist.
  #fristAbgelaufen(jetzt) {
    const seit = this.kamera.ring?.begonnen ?? jetzt;
    return jetzt - seit >= AUFNAHME_FRIST_MS;
  }

  // FERTIG IST ERST, WENN DER RING ZU IST.
  //
  // Hier stand eine Frist, die den Scan nach vierzig Sekunden auch bei
  // offenem Ring beendete. Das war als Notbremse gedacht und war in
  // Wahrheit dasselbe wie frueher die Zwei-Drittel-Regel: Der Kunde sah
  // einen halb offenen Ring und wurde trotzdem weitergeschickt - also
  // hiess der Ring nichts. Und die Aerztin bekam, was zufaellig dalag.
  //
  // Wer nicht herumkommt, hat weiter einen Ausweg, und zwar einen
  // sichtbaren: den Ausloeser im Blatt unter dem Bild. Ab zwoelf Sekunden
  // ohne Fortschritt nennt ihn der Hinweis von selbst.
  //
  // Die Frist gilt nur noch DAHINTER - in #abschlussReif(), wenn der Ring
  // schon zu ist und nur noch ein fehlendes Foto nachgefordert wird. Dort
  // ist sie richtig: Der Ring hat seine Arbeit getan, und es waere
  // sinnlos, den Kunden auf ein Bild warten zu lassen, das nicht kommt.
  #abschlussFaellig(stand, jetzt) {
    // DER RING MUSS ZU SEIN - daran und an nichts anderem haengt es.
    //
    // Nicht an stand.fertig: Das verlangt zusaetzlich das gerade Bild, und
    // genau daran hing der Fall vom 16.09. um 09:34 - geschlossener Ring,
    // "Gati." darunter, kein Weitergang, weil das Nachfordern
    // frontalGenommen zurueckgesetzt hatte. Laege die Frist wieder dahinter,
    // haette derselbe Fall wieder kein Ende.
    //
    // Ein zugegangener Ring mit fehlendem Bild ist kein offener Ring. Was
    // dann zu tun ist - nachfordern, und nach der Frist nehmen, was da ist -
    // steht in #abschlussReif().
    if (!(stand.anteil >= 0.999)) return false;
    return this.#abschlussReif(jetzt);
  }

  // DARF DER SCAN JETZT ENDEN?
  //
  // Der Ring sagt nur, wohin der Kopf gedreht wurde. Ob daraus ein Bild
  // geworden ist, steht auf einem anderen Blatt - und genau daran ist es im
  // Betrieb auseinandergelaufen: zwei Faelle mit geschlossenem Ring und
  // einem einzigen Foto, ohne frontales. Der Kunde hatte alles richtig
  // gemacht, die Aerztin bekam ein Bild.
  //
  // Fehlt etwas, geht der Ring dort wieder auf und fuehrt weiter. Zweimal,
  // dann ist Schluss - und nach der Frist ohnehin.
  #abschlussReif(jetzt) {
    const fehlend = this.#fehlendeBlicke();
    if (!fehlend.length) return true;
    if (this.#fristAbgelaufen(jetzt)) return true;
    if ((this.kamera.nachgefordert || 0) >= NACHFORDERN_HOECHSTENS) return true;
    this.kamera.nachgefordert = (this.kamera.nachgefordert || 0) + 1;
    this.#blickeNachfordern(fehlend);
    return false;
  }

  #blickeNachfordern(fehlend) {
    const ring = this.kamera.ring;
    if (!ring) return;
    const sektoren = [];
    let frontal = false;
    for (const blick of fehlend) {
      if (blick === "gerade") { frontal = true; continue; }
      sektoren.push(...(BLICK_SEKTOREN[blick] || []));
    }
    ring.wiederOeffnen(sektoren, { frontal });
  }

  #blickAus({ frontal, stand }) {
    if (frontal) return { blick: "gerade", abweichung: Math.abs(stand?.betrag ?? 0) };
    const winkel = stand?.winkel;
    if (!Number.isFinite(winkel)) return null;
    for (const ziel of FOTO_BLICKE) {
      // Der kuerzere Weg um den Kreis, damit 350 Grad nicht als weit weg
      // von 10 Grad gilt.
      let abstand = Math.abs(winkel - ziel.winkel) % (Math.PI * 2);
      if (abstand > Math.PI) abstand = Math.PI * 2 - abstand;
      if (abstand <= FOTO_TOLERANZ) return { blick: ziel.blick, abweichung: abstand };
    }
    return null;
  }

  // Weitere Bilder derselben Blickrichtung, ohne neuen Ausloeser.
  //
  // Dreht der Kopf inzwischen aus der Blickrichtung heraus, liefert
  // #blickAus() nichts und das Bild faellt weg - der Nachschlag kann also
  // nie ein Bild aus einer anderen Haltung unterschieben.
  #fotoNachschlag(netz, stand) {
    const nach = this.kamera.nachschlag;
    if (!nach) return;
    const jetztMs = Date.now();
    if (jetztMs > nach.bis) { this.kamera.nachschlag = null; return; }
    if (jetztMs < nach.naechste) return;
    nach.naechste = jetztMs + NACHSCHLAG_TAKT_MS;
    if (!netz?.punkte) return;
    const messleinwand = this.#messleinwandFuellen();
    if (!messleinwand) return;
    this.#fotoMerken(messleinwand, { frontal: nach.frontal, stand, netz });
  }

  // Wie scharf das Bild an der Stelle ist, auf die es ankommt.
  //
  // Ein Ausschnitt mitten im Gesicht, in echten Bildpunkten - nicht das
  // ganze, heruntergerechnete Bild: Herunterrechnen mittelt genau die
  // Bewegungsunschaerfe weg, die hier gesucht wird, und der Hintergrund
  // gehoert ohnehin nicht dazu.
  #schaerfeAus(leinwand, { netz = null, mitte = null } = {}) {
    if (!leinwand?.width || !leinwand.height) return null;
    const punkt = netz?.punkte?.[PUNKT.nasenspitze] || mitte;
    if (!punkt) return null;
    const kante = Math.min(SCHAERFE_FELD, leinwand.width, leinwand.height);
    const x = Math.max(0, Math.min(leinwand.width - kante,
      Math.round(punkt.x * leinwand.width - kante / 2)));
    const y = Math.max(0, Math.min(leinwand.height - kante,
      Math.round(punkt.y * leinwand.height - kante / 2)));
    try {
      const bild = leinwand.getContext("2d", { willReadFrequently: true })
        .getImageData(x, y, kante, kante);
      return schaerfeVonBild(bild);
    } catch {
      // Manche Geraete verweigern getImageData bei ungluecklichen Massen.
      // Dann entscheidet weiter der Winkel - wie vorher auch.
      return null;
    }
  }

  #fotoMerken(messleinwand, { frontal = false, stand = null, netz = null, mitte = null } = {}) {
    if (!messleinwand?.width) return;
    const ziel = this.#blickAus({ frontal, stand });
    if (!ziel) return;

    const schaerfe = this.#schaerfeAus(messleinwand, { netz, mitte });
    const kandidat = { abweichung: ziel.abweichung, schaerfe, zeit: Date.now() };
    const platz = (this.kamera.fotos[ziel.blick] ||= { erste: null, mehr: [] });
    const wahl = fotoPlatzWahl(platz, kandidat, {
      hoechstens: (FOTOS_JE_BLICK[ziel.blick] || 1) - 1
    });
    if (wahl.wohin === "nichts") return;

    // Das beste Bild der Richtung bleibt in voller Aufloesung liegen und
    // wird erst am Ende kodiert - wie bisher.
    if (wahl.wohin === "erste") {
      const breite = Math.min(FOTO_BREITE, messleinwand.width);
      const hoehe = Math.max(1, Math.round(messleinwand.height * (breite / messleinwand.width)));
      // Dieselbe Leinwand wiederverwenden, wenn es schon eine gibt: Bei
      // jedem besseren Bild eine neue anzulegen, laesst den Speicher
      // waehrend der Drehung mitwachsen.
      const leinwand = platz.erste?.leinwand || document.createElement("canvas");
      leinwand.width = breite;
      leinwand.height = hoehe;
      leinwand.getContext("2d").drawImage(messleinwand, 0, 0, breite, hoehe);
      platz.erste = { leinwand, ...kandidat, breite, hoehe };
      return;
    }

    const klein = this.#kleinesFoto(messleinwand);
    if (!klein) return;
    if (wahl.wohin === "mehr") platz.mehr.push({ ...kandidat, ...klein });
    else Object.assign(wahl.opfer, kandidat, klein);
  }

  // Ein Zusatzbild - SOFORT kodiert, nicht erst am Ende.
  //
  // GEMESSEN, NICHT GESCHAETZT: Zehn Leinwaende in voller Aufloesung sind
  // rund hundert Megabyte, und auf einem aelteren Telefon ist das kein
  // Rundungsfehler - drei waren es schon dreissig. Als JPEG kostet dasselbe
  // Bild zweihundert Kilobyte. Das Kodieren von 900 Punkten dauert rund
  // zehn Millisekunden; es faellt hoechstens siebenmal im ganzen Scan an
  // und trifft nie den Augenblick, in dem ein Strich am Ring zugeht.
  //
  // Eine einzige Arbeitsleinwand fuer alle: Sie wird jedes Mal neu
  // beschrieben und waechst nicht mit.
  #kleinesFoto(messleinwand) {
    try {
      const breite = Math.min(FOTO_BREITE_MEHR, messleinwand.width);
      const hoehe = Math.max(1, Math.round(messleinwand.height * (breite / messleinwand.width)));
      const leinwand = (this.kamera.kleinleinwand ||= document.createElement("canvas"));
      leinwand.width = breite;
      leinwand.height = hoehe;
      leinwand.getContext("2d").drawImage(messleinwand, 0, 0, breite, hoehe);
      const treffer = besteGuete((guete) => leinwand.toDataURL("image/jpeg", guete), FOTO_STUFEN_MEHR);
      return treffer ? { jpeg: treffer.jpeg, guete: treffer.guete, breite, hoehe } : null;
    } catch {
      // Kein Kodierer, kein Zusatzbild. Das beste Bild der Richtung steht
      // davon unberuehrt.
      return null;
    }
  }

  // DIE MINIATUREN FUER DIE WARTESEITE - nach dem Scan, neben dem Weg.
  //
  // Warum ueberhaupt: Auf der Warteseite stand bisher "6 foto". Das ist
  // eine Zahl. Sein eigenes Gesicht ist eine Akte, die ihm gehoert - und
  // auf diesem Bildschirm entscheidet sich, ob er eine Nummer
  // hinterlaesst. Von 32 fertigen Analysen haben 13 ihren Befund gesehen:
  // genau die 13, die erreichbar waren.
  //
  // WARUM AUS DEM FERTIGEN JPEG UND NICHT AUS DER LEINWAND. Die Leinwand
  // waere billiger - sie steht in #fotosAlsJpeg noch. Aber dort liegt der
  // Weg zum naechsten Bildschirm, und dieser Bildschirm darf auf nichts
  // warten, was er nicht braucht. Hier laeuft alles NACH dem Uebergang,
  // waehrend der Kunde seinen Namen tippt: Das Dekodieren von 160 Punkten
  // kostet wenige Millisekunden je Bild und faellt in eine Zeit, in der
  // ohnehin nichts passiert.
  //
  // Nichts davon wird abgewartet und nichts davon darf etwas anhalten:
  // Schlaegt es fehl, zeigt die Warteseite ihre Ersatzkacheln und steht
  // trotzdem.
  async #miniaturenSchicken(fotos) {
    const minis = {};
    for (const [blick, foto] of Object.entries(fotos || {})) {
      const mini = await this.#miniaturBauen(foto?.jpeg);
      if (mini) minis[blick] = mini;
    }
    if (Object.keys(minis).length) this.sitzung.miniaturenSpeichern(minis);
    // Das Bild von vorn fuer den Nummern-Schirm ("Fotoja juaj u ruajt").
    const vorn = minis.gerade || Object.values(minis)[0];
    if (vorn?.jpeg) {
      this.zustand.telBild = vorn.jpeg;
      if (this.aktiv === "tel") this.#telKopfFuellen();
    }
  }

  #miniaturBauen(jpeg) {
    if (typeof jpeg !== "string" || !jpeg.startsWith("data:image")) return Promise.resolve(null);
    return new Promise((fertig) => {
      try {
        const bild = new Image();
        bild.onload = () => {
          try {
            const breite = Math.min(MINI_BREITE, bild.naturalWidth || MINI_BREITE);
            const hoehe = Math.max(1, Math.round((bild.naturalHeight || breite) * (breite / (bild.naturalWidth || breite))));
            const leinwand = document.createElement("canvas");
            leinwand.width = breite;
            leinwand.height = hoehe;
            leinwand.getContext("2d").drawImage(bild, 0, 0, breite, hoehe);
            const treffer = besteGuete((guete) => leinwand.toDataURL("image/jpeg", guete),
              MINI_STUFEN, MINI_HOECHSTZEICHEN);
            fertig(treffer ? { jpeg: treffer.jpeg, breite, hoehe } : null);
          } catch { fertig(null); }
        };
        bild.onerror = () => fertig(null);
        bild.src = jpeg;
      } catch { fertig(null); }
    });
  }

  // Erst jetzt kodieren - die Kamera steht bereits.
  //
  // In voller Aufloesung dauert das je Bild ein paar Dutzend Millisekunden.
  // Zwischen den Bildern wird deshalb einmal losgelassen, damit der Wechsel
  // zum Analysebildschirm nicht in drei Rucken passiert.
  async #fotosAlsJpeg() {
    const fertig = {};
    // Die Kodierung gibt zwischen Bildern den Hauptfaden frei. Ein neuer
    // Start darf dabei weder alte Fotos uebernehmen noch seine verlieren.
    const quelle = this.kamera.fotos;
    this.kamera.fotos = {};
    // Die Reihenfolge ist die, in der Dr. Gashi sie ansieht: erst gerade,
    // dann die Seiten, zuletzt die Aufsicht. Das beste Bild einer Richtung
    // traegt ihren Namen, die weiteren zaehlen dahinter.
    for (const blick of ["gerade", "rechts", "links", "oben"]) {
      const platz = quelle?.[blick];
      if (!platz) continue;
      if (platz.erste) {
        const fest = this.#kodiereSoGutWieMoeglich(platz.erste);
        if (fest) fertig[blick] = fest;
        // Die Leinwand wird nicht mehr gebraucht. Ein Bild in voller
        // Aufloesung sind rund zehn Megabyte - auf einem aelteren Handy ist
        // das kein Rundungsfehler.
        try { platz.erste.leinwand.width = 0; platz.erste.leinwand.height = 0; } catch { /* egal */ }
        await warte(0);
      }
      // Die Zusatzbilder liegen schon als JPEG da - sie wurden kodiert, als
      // sie entstanden.
      for (const [i, foto] of (platz.mehr || []).entries()) {
        if (foto?.jpeg) fertig[`${blick}-${i + 2}`] = { jpeg: foto.jpeg, guete: foto.guete, breite: foto.breite, hoehe: foto.hoehe };
      }
    }
    return fertig;
  }

  // Die beste Qualitaet nehmen, die noch in ein Dokument passt.
  //
  // Reicht die niedrigste Stufe nicht, wird die Breite halbiert und von
  // vorne begonnen. Das trifft nur sehr grosse, sehr unruhige Bilder -
  // und ein kleineres Foto ist immer noch besser als gar keines.
  #kodiereSoGutWieMoeglich(foto) {
    let leinwand = foto.leinwand;
    let breite = foto.breite;
    let hoehe = foto.hoehe;

    for (let versuch = 0; versuch < 3; versuch += 1) {
      let treffer = null;
      try {
        const bild = leinwand;
        treffer = besteGuete((guete) => bild.toDataURL("image/jpeg", guete));
      } catch {
        // Kein Kodierer, keine Aufnahme. Die anderen beiden gehen trotzdem.
        return null;
      }
      if (treffer) return { ...treffer, breite, hoehe };
      breite = Math.max(320, Math.round(breite / 2));
      hoehe = Math.max(1, Math.round((hoehe * breite) / (foto.breite || breite)));
      try {
        const kleiner = document.createElement("canvas");
        kleiner.width = breite;
        kleiner.height = hoehe;
        kleiner.getContext("2d").drawImage(leinwand, 0, 0, breite, hoehe);
        leinwand = kleiner;
      } catch {
        return null;
      }
    }
    return null;
  }

  // HIER STAND #probeVermessen(), und mit ihr die halbe Messtechnik.
  //
  // Sklera-Weissabgleich, Millimeter-Massstab aus dem Pupillenabstand,
  // messeBild() ueber die Hautzonen, bildGuete() ueber ein Rechteck um die
  // Wange - je Aufnahme, ausserhalb des Bildtakts, damit der Ring nicht
  // stockt. Alles weg.
  //
  // Der Grund ist derselbe, aus dem auch die Zahlen unter dem Bild
  // verschwunden sind: Keine dieser Messungen ist je gegen einen echten
  // Fall geprueft worden, und niemand liest sie. Was gebraucht wird, sind
  // die Fotos und ein zugegangener Ring.

  // Die drei Zahlen unter dem Bild - gemessen, nicht erfunden.
  // Waehrend der Aufnahme: zeigen, dass gearbeitet wird - nicht, was
  // herauskommt.
  //
  // Hier standen drei gemessene Werte: Glanz, Roetung als a*, Hautton als
  // ITA-Winkel. Sie sind ersatzlos weg, und das ist Absicht.
  //
  // Zwei Gruende. Der erste: Keine dieser Zahlen ist je gegen einen echten
  // Fall geprueft worden. Sie werden richtig aus den Bildpunkten gerechnet -
  // ob "a* 11,5" das ist, was eine Dermatologin bei DIESEM Menschen Roetung
  // nennt, weiss niemand. Eine falsche Zahl auf dem Bildschirm ist nicht ein
  // Fehler, sie ist das Ende: Wer bei reiner Haut "Pigmentflecken" liest,
  // glaubt danach kein Wort mehr - auch nicht das der Aerztin.
  //
  // Der Zaehler ist weg.
  //
  // Er stand als "7 von 9 Ansichten vermessen" unter dem Bild - und das ist
  // unsere Sprache, nicht seine. Wie weit die Aufnahme ist, sieht er am
  // Ring, ohne ein Wort zu lesen; was eine "Ansicht" sein soll, muesste man
  // ihm erklaeren. Zahlen, die niemand braucht, sind auf einem
  // Handybildschirm nicht neutral, sondern im Weg.
  //
  // Vorher standen hier ausserdem Messwerte. Die sind aus einem anderen
  // Grund weg und kommen nicht zurueck: WIR MACHEN DEN SCAN, DIE ANALYSE
  // MACHT DR. GASHI.

  async #ringAbschluss({ vonHand = false } = {}) {
    if (!this.kamera.laeuft) return;
    this.kamera.laeuft = false;

    const proben = this.kamera.proben;
    const frontale = proben.filter((p) => p.frontal);
    const basis = frontale.length >= 2 ? frontale : proben;

    this.#kameraStoppen();

    if (!basis.length) {
      this.#kameraFehlerZeigen("fehlerKeinGesicht", "skanim", () => this.#kameraStarten());
      return;
    }
    const lauf = this.kamera.lauf;

    this.zustand.aufnahmen = proben.map((p) => ({
      frontal: p.frontal, sektor: p.sektor, erkannt: p.erkannt
    }));

    // DIE EINZIGE ZAHL, DIE NOCH GERECHNET WIRD - und sie sagt etwas ueber
    // das MATERIAL, nicht ueber die Haut.
    //
    // Die Schaerfe je behaltenem Bild. Sie faellt ohnehin an, weil #fotoMerken
    // damit entscheidet, welches Bild einer Richtung bleibt; hier wird sie
    // nur eingesammelt. Steht sie im Bericht durchweg niedrig, liegt es
    // nicht am einzelnen Kunden - dann ist etwas am Weg kaputt, und das
    // sieht man sonst erst, wenn die Aerztin sich ueber unscharfe Bilder
    // wundert.
    const schaerfen = Object.values(this.kamera.fotos || {})
      .flatMap((platz) => [platz?.erste, ...(platz?.mehr || [])])
      .map((foto) => Number(foto?.schaerfe))
      .filter(Number.isFinite)
      .map((zahl) => Math.round(zahl * 100) / 100)
      .slice(0, 64);

    const fotos = await this.#fotosAlsJpeg();
    if (lauf !== this.kamera.lauf) return;
    if (!Object.keys(fotos).length) {
      this.#kameraFehlerZeigen("fehlerKameraBild", "skanim", () => this.#kameraStarten());
      return;
    }
    // Was auf der Warteseite als "{anzahl} foto" steht, sind die Bilder -
    // nicht die Messungen. Hier standen die Messungen, und das waren nie
    // dieselben Zahlen.
    this.zustand.fotoAnzahl = Object.keys(fotos).length;
    this.#uploadMelden(this.sitzung.fotosSpeichern(fotos));
    // Und die kleine Fassung fuer die Warteseite. Bewusst OHNE await: Sie
    // laeuft neben dem Weg, waehrend der Kunde seinen Namen tippt, und
    // haelt den Uebergang zum naechsten Bildschirm um keine Millisekunde
    // auf. Was sie schreibt, liegt neben dem Bericht - nicht in der
    // Sitzung, die nur das CEO-Konto lesen darf.
    this.#miniaturenSchicken(fotos);


    this.sitzung.schritt("captured", {
      // Welche Blickrichtungen als Foto danebenliegen. Steht hier weniger
      // als drei, ist der Ring nicht herumgekommen - und das sieht die
      // Aerztin, bevor sie sich ueber ein fehlendes Bild wundert.
      photos: Object.keys(fotos),
      // metrics und ratios stehen hier nicht mehr: Es wird nichts gemessen.
      // Wie weit der Ring kam, und ob das Netz ueberhaupt da war. Steht das
      // im Bericht durchweg schlecht, liegt es nicht am einzelnen Kunden.
      ringAnteil: this.kamera.ring ? this.kamera.ring.anteil : 0,
      ringAusschlag: this.kamera.ring ? Number(this.kamera.ring.hoechsterAusschlag.toFixed(2)) : 0,
      // Die Schaerfe der behaltenen Bilder. Frueher stand hier ein Gewicht
      // aus der Bildguete-Messung; die gibt es nicht mehr, und die Schaerfe
      // sagt an dieser Stelle dasselbe: War das Material brauchbar?
      guete: schaerfen,
      mesh: Boolean(this.kamera.netz),
      views: proben.length,
      byHand: vonHand
    });
    this.#fragenZeigen();
  }

  #kameraStoppen() {
    // Auch eine NOCH offene Kameraanfrage gehoert zum gestoppten Lauf.
    this.kamera.lauf += 1;
    this.kamera.laeuft = false;
    this.kamera.anfrageAbbrechen?.();
    this.kamera.bereitAbbrechen?.();
    this.kamera.wegSeit = 0;
    $("#ls-fehler")?.classList.add("ls-verstecken");
    if (this.kamera.abspielTakt) {
      clearInterval(this.kamera.abspielTakt);
      this.kamera.abspielTakt = null;
    }
    const buehne = $(".ls-kamera");
    if (buehne) buehne.dataset.bereit = "nein";

    // DIE ARBEITSLEINWAENDE FREIGEBEN.
    //
    // Die Messleinwand traegt das Bild in voller Kameraaufloesung: 1440 mal
    // 1920 sind rund elf Megabyte, und sie blieb nach dem Scan liegen. Auf
    // einem Telefon mit wenig Speicher ist das kein Rundungsfehler - dort
    // entscheidet es, ob die Befundseite danach noch faellt oder nicht.
    //
    // Erst auf null mal null setzen, dann loslassen: Das ist der Weg, auf
    // dem der Browser den Bildspeicher wirklich hergibt; die Referenz
    // fallenzulassen allein tut es nicht sofort.
    for (const feld of ["messleinwand", "kleinleinwand"]) {
      const leinwand = this.kamera[feld];
      if (leinwand) {
        try { leinwand.width = 0; leinwand.height = 0; } catch { /* egal */ }
        this.kamera[feld] = null;
      }
    }
    // Beide Leinwaende leeren. Bleibt der Ring stehen, liegt er beim
    // naechsten Anlauf halb gefuellt ueber einem frischen Kamerabild.
    for (const kennung of ["#ls-netz", "#ls-ring"]) {
      const leinwand = $(kennung);
      if (leinwand) leinwand.getContext("2d")?.clearRect(0, 0, leinwand.width, leinwand.height);
    }
    // Und die Kamera des Fotowegs mit: Sie haengt an einem anderen Video,
    // aber an derselben Leuchte. Ein Strom, der hinter einem anderen
    // Bildschirm weiterlaeuft, ist auf dem Telefon das Erste, was
    // auffaellt.
    this.flaeche?.stoppe();
    for (const spur of this.kamera.strom?.getTracks() || []) spur.stop();
    this.kamera.strom = null;
    const video = $("#ls-video");
    if (video) {
      try { video.pause(); } catch { /* aeltere Webansichten */ }
      video.srcObject = null;
    }
  }

  // EINMAL JE SITZUNG. Zwei Wege koennen sie schreiben, und wer die
  // Kamera wechselt oder es noch einmal versucht, kommt mehrfach
  // hierher - ein zweiter Schreibvorgang fuer denselben Wahrheitswert
  // waere eine Anfrage fuer nichts.
  #kameraOkMerken() {
    if (this.zustand.kameraOk) return;
    this.zustand.kameraOk = true;
    // In einem eigenen Schreibvorgang: hasOnly() in den Firestore-Regeln
    // weist das GANZE Dokument ab, sobald ein Feld darin steht, das die
    // Regel nicht kennt. Ein brandneues Feld reist deshalb nie mit
    // Daten, die ankommen muessen.
    try { this.sitzung.ergaenze({ kameraOk: true }); }
    catch (fehler) { globalThis.console?.warn?.("[lifeskin] Kameramarke:", fehler?.message); }
  }

  // ---------- Analyse: die sichtbare Arbeit ----------

  async #analyseZeigen() {
    this.sitzung.schritt("aufbereitung");
    // Keine kuenstliche Prozentanimation: nur die tatsaechliche Uebertragung.
    return this.#uebergeben();
  }

  // ---------- Die kurzen Fragen ----------
  //
  // Sie stehen zwischen der Aufnahme und der Aufbereitung, und das ist
  // Absicht: Die Bilder gehen waehrenddessen im Hintergrund hinaus, und die
  // Altersgruppe ist beantwortet, bevor die Aufbereitung sie nennt. Vorher
  // stand dort "Vergleich mit Altersgruppe " - mit leerer Stelle, seit der
  // Namensschirm aus dem Weg ist.

  // Welcher Schritt zu welcher Frage gehoert. Aus der Reihenfolge der
  // Fragen gelesen und nicht abgeschrieben: Wer eine Frage dazunimmt,
  // bekommt hier nichts Falsches, sondern nichts - und das faellt auf.
  #schrittZurFrage(i) {
    const frage = this.fragenListe[i];
    if (!frage) return null;
    if (frage.id === "emri") return "emri";
    if (frage.id === "numri") return "numri";
    return i < 4 ? `pyetja${i + 1}` : null;
  }

  // NACH DEM SCAN: ZWEI WEGE, EINER JE FASSUNG.
  //
  // Die kurze geht auf einen Bildschirm mit Name und Alter - zwei Zeilen,
  // kein Fragebogen. Die lange behaelt ihre Fragen.
  //
  // DER WEG OHNE SCAN KOMMT HIER NICHT VORBEI: Er faengt seine Fragen auf
  // dem Wahlbildschirm an (#wegWaehlen) und stellt andere. Diese Methode
  // ist der Anschluss AN DIE AUFNAHME, und wer keine gemacht hat, hat
  // hier nichts verloren.
  #fragenZeigen() {
    if (this.variante === "kurz" && $("#ls-name")) {
      this.#nameZeigen();
      return;
    }
    this.#fragenStarten(this.fragenListe, { danach: "analyse" });
  }

  // EINE STRECKE FRAGEN ANFANGEN.
  //
  // Der Fragenbildschirm ist seit dem zweiten Weg kein Durchgang mehr,
  // sondern ein Werkzeug, das mehrmals benutzt wird: vier Fragen vor Name
  // und Alter, die Nummer danach. Was sich je Strecke unterscheidet, steht
  // deshalb nicht mehr im Bildschirm, sondern wird ihm mitgegeben.
  //
  // DIE ANTWORTEN WERDEN UEBERNOMMEN UND NICHT GELEERT. #frageSchreiben()
  // schickt die ganze Karte als anamnese; faengt der zweite Durchgang leer
  // an, loescht sein erster Schreibvorgang alles, was der erste Durchgang
  // gesammelt hat - und zwar genau dann, wenn der Fall sonst fertig waere.
  #fragenStarten(liste, { danach = "analyse", zurueck = null, einleitung = "" } = {}) {
    this.fragenListe = liste;
    this.fragen = { i: 0, antworten: this.fragen.antworten || {}, danach, zurueck, einleitung };
    this.zeige("fragen");
    this.#frageZeichnen({ richtung: "vor" });
  }

  // Und was hinter der letzten Frage einer Strecke kommt.
  //
  // Ein Name und keine Funktion: Der Zustand der Strecke wird geschrieben,
  // bevor der Bildschirm steht, und eine gespeicherte Funktion waere beim
  // Lesen an dieser Stelle nicht zu sehen.
  #fragenFertig() {
    if (this.fragen.danach === "name") { this.#nameZeigen(); return; }
    if (this.fragen.danach === "uebergeben") { this.#uebergeben(); return; }
    this.#analyseZeigen();
  }

  // DER WECHSEL ZWISCHEN DEN FRAGEN.
  //
  // Vorher wurde der Inhalt ausgetauscht und fertig. Wer eine Antwort
  // antippt, sieht dann im selben Augenblick eine andere Frage an
  // derselben Stelle - und merkt kaum, dass er weiter ist. Ein Wechsel,
  // den man nicht sieht, fuehlt sich an wie ein Fehler.
  //
  // Die neue Frage kommt von der Seite herein, in der Richtung, in die es
  // geht: vorwaerts von rechts, zurueck von links. Bewegt wird nur das
  // Blatt mit der Frage - Kopfzeile und Knopf bleiben stehen, damit der
  // Daumen sie nicht sucht, waehrend die Frage wandert.
  //
  // Die Animation haengt an einem Merkmal, das bei jedem Zeichnen neu
  // gesetzt wird. Damit sie auch beim zweiten Mal in dieselbe Richtung
  // wieder anlaeuft, wird sie vorher abgeraeumt und ein Bild abgewartet.
  #frageBlattBewegen(richtung) {
    const blatt = $("#ls-frageblatt");
    if (!blatt || !richtung) return;
    blatt.removeAttribute("data-rein");
    // Ein erzwungenes Nachrechnen: Ohne das fasst der Browser Entfernen
    // und Setzen zusammen, und die Animation liefe kein zweites Mal.
    void blatt.offsetWidth;
    blatt.dataset.rein = richtung;
  }

  #frageZeichnen({ richtung = null } = {}) {
    this.#frageBlattBewegen(richtung);
    const frage = this.fragenListe[this.fragen.i];
    // JEDE FRAGE ZAEHLT, SOBALD SIE DA IST - nicht erst, wenn sie
    // beantwortet ist. Sonst stuende der Verlust bei der Frage davor, und
    // die Zahl zeigte auf die falsche Stelle.
    //
    // schritt() geht nie zurueck, also kostet ein Blick zurueck nichts.
    const schritt = this.#schrittZurFrage(this.fragen.i);
    if (schritt) this.sitzung.schritt(schritt);
    if (!frage) return;
    const wahl = $("#ls-fragewahl");
    const weiter = $("#ls-frageweiter");
    if (!wahl) return;

    // Die Einleitung steht nur ueber der ersten Frage. Ab der zweiten weiss
    // er, worum es geht, und sie waere nur eine Zeile, die den Blick vom
    // Knopf wegzieht.
    const einleitung = $("#ls-frageneinleitung");
    // BLEIBEN NUR NAME UND NUMMER, IST "ein paar kurze Fragen" EINE LUEGE -
    // und eine, die im schlechtesten Augenblick faellt: Wer gerade
    // dreissig Sekunden lang den Kopf gedreht hat, liest dort, dass jetzt
    // ein Fragebogen kommt, und legt weg. Dann sagt die Zeile, was
    // wirklich stimmt: Der Scan ist vorbei, es fehlen zwei kurze Schritte.
    //
    // Und gezaehlt wird dann auch nicht: "Frage 1 von 2" macht aus zwei
    // Zeilen ein Formular. Die Grenze liegt bei zwei, weil genau so viele
    // uebrig sind - Name und Nummer.
    const knapp = this.fragenListe.length <= 2;
    if (einleitung) {
      // Der Satz steht nur ueber der ERSTEN Frage: Ab der zweiten weiss
      // der Besucher, woran er ist, und eine Zeile, die sich wiederholt,
      // zieht den Blick vom Feld weg.
      // Traegt die Strecke einen eigenen Satz, gewinnt er: Der Weg ohne
      // Scan hat vier Fragen (nicht zwei) und danach eine einzelne
      // Nummer, und beide Male waere die Ansage nach der Laenge der Liste
      // falsch - "Skanimi mbaroi" vor einer Frage, die kein Scan je
      // gesehen hat, ist die schlechteste Sorte Satz: eine, die der
      // Besucher als Fehler liest.
      const eigener = FRAGEN_TEXTE[this.fragen.einleitung];
      const satz = this.fragen.i !== 0
        ? ""
        : t(eigener || (knapp ? FRAGEN_TEXTE.einleitungEinzeln : FRAGEN_TEXTE.einleitung), this.sprache);
      einleitung.textContent = satz;
      einleitung.hidden = !satz;
    }
    // Und "Frage 1 von 2" zaehlt nichts - der Zaehler bleibt dann leer.
    schreibe($("#ls-fragenzaehler"), knapp ? "" : fuelle(t(FRAGEN_TEXTE.zaehler, this.sprache),
      { nr: this.fragen.i + 1, gesamt: this.fragenListe.length }));
    schreibe($("#ls-fragetitel"), t(frage.titel, this.sprache));
    const unter = $("#ls-frageunter");
    const unterText = t(frage.unter, this.sprache);
    schreibe(unter, unterText);
    if (unter) unter.hidden = !unterText;

    // Der Pfeil steht auch vor der ERSTEN Frage, wenn die Strecke weiss,
    // wohin er dort fuehrt. Auf dem Weg ohne Scan liegt davor ein
    // Bildschirm, den es wirklich gibt - die Wahl, spaeter Name und Alter
    // -, und ein Weg ohne Rueckweg kostet genau die Leute, die sich
    // vertippt haben.
    const zurueck = $("#ls-fragenzurueck");
    if (zurueck) zurueck.hidden = this.fragen.i === 0 && !this.fragen.zurueck;

    // Die getippte Frage: ein Feld statt Knoepfen.
    // Zwei Fragen haben ein Eingabefeld statt Knoepfen: der Name und die
    // Nummer. Sie unterscheiden sich nur in der Tastatur und darin, was
    // als Antwort durchgeht.
    const getippt = frage.typ === "text" || frage.typ === "tel";
    const feld = $("#ls-fragefeld");
    if (feld) {
      feld.hidden = !getippt;
      if (getippt) {
        feld.placeholder = t(frage.platzhalter, this.sprache);
        feld.value = this.fragen.antworten[frage.id] || "";
        // Bei der Nummer die Zifferntastatur - das ist der Unterschied
        // zwischen "kurz eintippen" und "aufgeben".
        feld.type = frage.typ === "tel" ? "tel" : "text";
        feld.inputMode = frage.typ === "tel" ? "tel" : "text";
        feld.autocomplete = frage.typ === "tel" ? "tel" : "given-name";
      }
    }
    wahl.hidden = getippt;

    wahl.innerHTML = "";
    if (frage.spalten) wahl.dataset.spalten = String(frage.spalten);
    else delete wahl.dataset.spalten;

    if (getippt) {
      if (weiter) {
        weiter.hidden = false;
        schreibe(weiter, t(FRAGEN_TEXTE.weiter, this.sprache));
        weiter.disabled = !this.#antwortTaugt(frage, this.fragen.antworten[frage.id]);
      }
      this.#frageFehler(null);
      // KEIN Fokus von Hand: Die Tastatur spraenge auf und verdeckte die
      // Zeile, die erklaert, wofuer die Angabe gut ist.
      return;
    }

    const gewaehlt = this.#frageAntwort(frage);
    for (const antwort of frage.antworten) {
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.className = "ls-wahl__knopf";
      knopf.textContent = t(antwort.text, this.sprache);
      knopf.dataset.antwort = antwort.id;
      knopf.setAttribute("aria-pressed", gewaehlt.includes(antwort.id) ? "true" : "false");
      knopf.addEventListener("click", () => this.#frageGetippt(frage, antwort));
      wahl.appendChild(knopf);
    }

    if (weiter) {
      // Der Knopf erscheint nur bei Mehrfachwahl. Wo eine Antwort genuegt,
      // geht es von selbst weiter.
      weiter.hidden = !frage.hoechstens;
      schreibe(weiter, t(FRAGEN_TEXTE.weiter, this.sprache));
      weiter.disabled = frage.hoechstens ? gewaehlt.length === 0 : false;
    }
  }

  #frageAntwort(frage) {
    const wert = this.fragen.antworten[frage.id];
    if (Array.isArray(wert)) return wert;
    return wert ? [wert] : [];
  }

  #frageGetippt(frage, antwort) {
    if (!frage.hoechstens) {
      this.fragen.antworten[frage.id] = antwort.id;
      this.#frageSchreiben();
      this.#frageMarkieren(frage);
      // Ein Augenblick, damit die Wahl zu sehen ist, bevor der Bildschirm
      // wechselt. Ohne ihn wirkt der Wechsel wie ein Fehlgriff.
      setTimeout(() => this.#frageWeiter(), 220);
      return;
    }

    const bisher = this.#frageAntwort(frage);
    const drin = bisher.includes(antwort.id);
    let neu;
    if (drin) {
      neu = bisher.filter((id) => id !== antwort.id);
    } else if (antwort.alleine) {
      // "Keines davon" raeumt die anderen weg.
      neu = [antwort.id];
    } else {
      // Und umgekehrt: Wer etwas anderes waehlt, meint nicht mehr "keines".
      const ohneAlleine = bisher.filter((id) =>
        !frage.antworten.find((a) => a.id === id)?.alleine);
      neu = [...ohneAlleine, antwort.id].slice(-frage.hoechstens);
    }
    this.fragen.antworten[frage.id] = neu;
    this.#frageSchreiben();
    this.#frageMarkieren(frage);
  }

  #frageMarkieren(frage) {
    const gewaehlt = this.#frageAntwort(frage);
    for (const knopf of $$("#ls-fragewahl .ls-wahl__knopf")) {
      knopf.setAttribute("aria-pressed", gewaehlt.includes(knopf.dataset.antwort) ? "true" : "false");
    }
    const weiter = $("#ls-frageweiter");
    if (weiter && frage.hoechstens) weiter.disabled = gewaehlt.length === 0;
  }

  // JEDE ANTWORT SOFORT, nicht erst am Ende.
  //
  // Wer bei der dritten Frage aufhoert, hinterlaesst trotzdem zwei - und
  // genau die Faelle sind es, aus denen man lernt, welche Frage zu viel war.
  #frageSchreiben() {
    // ZWEI SCHREIBVORGAENGE, NICHT EINER - und das ist keine Umstaendlichkeit.
    //
    // Die Regeln pruefen mit hasOnly gegen das GANZE Dokument: Ein einziges
    // Feld, das die Liste nicht kennt, weist den ganzen Schreibvorgang ab,
    // still, mit 403. Genau das geschah hier. `anamnese` stand zwar in
    // firestore.rules, aber die Regeln waren noch nicht ausgerollt - und
    // weil Anamnese, Altersgruppe und Name in EINEM Vorgang gingen, nahm
    // das abgewiesene Feld die zwei mit, die laengst erlaubt waren. Im
    // Prompt stand danach weder Name noch Alter noch eine Antwort.
    //
    // Getrennt kostet ein unbekanntes Feld nur sich selbst. Das ist die
    // Lehre aus demselben Fehler zum dritten Mal: erst die Messwerte, dann
    // zehn Fotos, jetzt die Anamnese.
    const einzeln = {};
    // Die Altersgruppe geht AUSSERDEM in ihr eigenes Feld: Der Bericht und
    // Heart lesen sie dort, und ageBand steht in den Firestore-Regeln
    // laengst auf der erlaubten Liste.
    const mosha = this.fragen.antworten.mosha;
    if (mosha) {
      einzeln.ageBand = mosha;
      this.zustand.altersgruppe = mosha;
    }
    // Der Name geht ebenfalls in sein eigenes Feld: Der Bericht redet den
    // Patienten damit an, und Heart ordnet den Fall zu. Auch `name` steht
    // in den Regeln laengst auf der erlaubten Liste.
    const emri = this.fragen.antworten.emri;
    if (emri) {
      einzeln.name = emri.slice(0, 80);
      this.zustand.name = einzeln.name;
    }
    // Die Nummer geht in ihr eigenes Feld - Heart liest sie dort, und die
    // Regeln kennen es laengst. In der Anamnese steht sie ausserdem, aber
    // dort sucht sie niemand, wenn er anrufen will.
    //
    // Vereinheitlicht, nicht roh: "00383..." und "+383..." sind dieselbe
    // Nummer, und wer sie in Heart antippt, soll nicht zweimal nachdenken.
    const numri = this.fragen.antworten.numri;
    if (numri) {
      const geprueft = telefonPruefen(numri, LIFESKIN_TELEFON_VORWAHL);
      if (geprueft.ok) {
        einzeln.phone = geprueft.nummer;
        // Er hat sie selbst und ausdruecklich dafuer hinterlassen, dass
        // Dr. Gashi sich meldet. Das ist die Einwilligung.
        einzeln.phoneConsent = true;
        // Dieselbe Marke wie auf dem Nummernbildschirm: Sie reist im
        // Bericht mit, damit die Warteseite nicht noch einmal fragt.
        this.zustand.nummerGegeben = true;
        // UND DASSELBE EREIGNIS WIE DORT.
        //
        // Hier stand es nicht. Die alte Vorlage fragt die Nummer als
        // Frage und nicht auf dem Nummernbildschirm - der Schreibweg
        // ist ein anderer, die Handlung ist dieselbe. Wer ueber den
        // alten Link "pa-skanim" hereinkam, gab seine Nummer ab, ohne
        // dass Meta davon erfuhr: ein Lead, der in keiner Anzeige
        // ankommt, auf die genau darauf optimiert wird.
        //
        // Doppelt feuern kann es nicht: Der Pixel sperrt jedes Ereignis
        // nach der ersten Meldung, und die Nummer gibt es je Besuch nur
        // einmal.
        this.pixel.meldeAbgabe("telefon");
        this.pixel.meldeLead();
      }
    }
    if (Object.keys(einzeln).length) this.sitzung.ergaenze(einzeln);
    this.sitzung.ergaenze({ anamnese: { ...this.fragen.antworten } });
  }

  // Taugt die Antwort, um weiterzugehen?
  //
  // Bei der Nummer ist das mehr als "nicht leer": Eine Nummer, die niemand
  // anrufen kann, ist dasselbe wie keine - und der ganze Scan war dann
  // umsonst, weil dieser Mensch seinen Befund nie zu sehen bekommt.
  #antwortTaugt(frage, wert) {
    if (frage?.typ === "tel") return telefonPruefen(wert, LIFESKIN_TELEFON_VORWAHL).ok;
    if (frage?.typ === "text") return String(wert || "").trim().length >= 2;
    return true;
  }

  // Der Satz unter dem Feld, wenn etwas nicht stimmt. Ein Knopf, der nicht
  // reagiert, sagt nicht warum - und wer nicht weiss, was fehlt, hoert auf.
  #frageFehler(schluessel) {
    const kasten = $("#ls-fragefehler");
    if (!kasten) return;
    schreibe(kasten, schluessel ? t(FRAGEN_TEXTE[schluessel], this.sprache) : "");
    kasten.hidden = !schluessel;
    $("#ls-fragefeld")?.setAttribute("aria-invalid", schluessel ? "true" : "false");
  }

  #frageWeiter() {
    const frage = this.fragenListe[this.fragen.i];
    const getippt = frage?.typ === "text" || frage?.typ === "tel";
    if (getippt) {
      const wert = this.fragen.antworten[frage.id];
      if (!this.#antwortTaugt(frage, wert)) {
        // Bei der Nummer sagt der Grund, was zu tun ist. "Ungueltig" sagt
        // das nicht, und ein Feld, das rot wird ohne zu sagen warum, wird
        // nicht korrigiert, sondern verlassen.
        if (frage.typ === "tel") {
          const grund = telefonPruefen(wert, LIFESKIN_TELEFON_VORWAHL).grund;
          this.#frageFehler({ leer: "telLeer", kurz: "telKurz", lang: "telLang",
            zeichen: "telZeichen" }[grund] || "telLeer");
        }
        return;
      }
      // Das Feld schreibt beim Tippen nicht mit - sonst stuende je
      // Buchstabe ein Schreibvorgang in der Leitung. Hier also einmal.
      this.#frageSchreiben();
    }
    if (this.fragen.i + 1 >= this.fragenListe.length) { this.#fragenFertig(); return; }
    this.fragen.i += 1;
    this.#frageZeichnen({ richtung: "vor" });
  }

  #frageZurueck() {
    if (this.fragen.i === 0) {
      // Vor der ersten Frage fuehrt der Pfeil aus der Strecke heraus -
      // dorthin, wo diese Strecke angefangen hat. Kennt sie die Stelle
      // nicht, tut er nichts: Ein Pfeil, der auf einen Bildschirm
      // springt, den die Seite gar nicht hat, waere eine weisse Seite.
      if (this.fragen.zurueck === "name") { this.#nameZeigen(); return; }
      if (this.fragen.zurueck) this.zurueckZu(this.fragen.zurueck);
      return;
    }
    this.fragen.i -= 1;
    this.#frageZeichnen({ richtung: "zurueck" });
  }

  // Nach der Aufbereitung: auf die eigene Seite.
  //
  // Der Trichter zeigt kein Ergebnis mehr. Er uebergibt - an
  // mnyra.com/analiza/<kennung>, die Seite, die dem Patienten gehoert. Dort
  // steht seine Fallnummer, dort wartet er auf Dr. Gashi, dort bekommt er
  // spaeter ihren Befund, und dort kauft er.
  //
  // WARUM EINE EIGENE ADRESSE und nicht ein weiterer Bildschirm hier: Sie
  // laesst sich aufheben, kopieren und weiterschicken. Ein Bildschirm im
  // Trichter ist weg, sobald der Tab weg ist.
  //
  // Der Bericht wird angelegt, bevor umgeleitet wird - sonst kaeme der
  // Patient auf eine Seite, die es noch nicht gibt. Warten muss er darauf
  // nicht: Der Schreibvorgang laeuft, waehrend die Aufbereitung noch
  // angezeigt wird.
  // DER LADEBILDSCHIRM NACH DER NUMMER.
  //
  // Am 22.09. wurde er auf einen leeren Ring mit "…" gekuerzt, als das
  // Speichern abgesichert wurde - seither sah er aus wie haengengeblieben.
  // Die Zeilen mit Haken und der Ring laufen wieder, und zwar NEBEN dem
  // echten Speichern: Weiter geht es erst, wenn beides fertig ist. Die
  // Zeilen gehoeren zum Weg - Scan, Foto oder nur Text.
  #aufbereitungZeilen() {
    const typ = this.zustand.typ || "scan";
    if (typ === "foto") {
      return [
        this.text("fotoAnalyseAufnahme"),
        this.text("fotoAnalyseZone"),
        this.zustand.altersgruppe ? this.text("fotoAnalyseVergleich", { gruppe: this.zustand.altersgruppe }) : "",
        this.text("fotoAnalyseAkte")
      ].filter(Boolean);
    }
    if (typ === "scan") {
      return [
        this.text("analyseZonen"),
        this.text("analyseTzone"),
        this.text("analyseRoetung"),
        this.text("analyseTextur"),
        this.text("analyseVergleich"),
        this.text("analyseRoutine")
      ];
    }
    return [this.text("textAnalyseAngaben"), this.text("textAnalyseSpeichern"), this.text("fotoAnalyseAkte")];
  }

  async #aufbereitungZeigen() {
    const liste = $("#ls-analyseschritte");
    const kreis = $("#ls-analysekreis");
    const zahl = $("#ls-analysezahl");
    const fortschritt = (anteil) => {
      kreis?.style?.setProperty?.("--anteil", String(anteil));
      schreibe(zahl, `${Math.round(anteil * 100)} %`);
    };
    // Ein zweiter Versuch nach einem Fehler: nicht noch einmal von vorn.
    if (this.aufbereitungGezeigt || !liste) { fortschritt(1); return; }
    const zeilen = this.#aufbereitungZeilen();
    liste.innerHTML = "";
    const knoten = zeilen.map((zeile) => {
      const el = document.createElement("div");
      el.className = "ls-schrittzeile";
      el.dataset.stand = "wartet";
      el.innerHTML = `<span class="ls-schrittzeile__haken" aria-hidden="true"></span><span></span>`;
      el.lastElementChild.textContent = zeile;
      liste.appendChild(el);
      return el;
    });
    fortschritt(0);
    const mitScan = (this.zustand.typ || "scan") === "scan";
    const dauer = Math.round((this.konfig.analyseAnzeigeMs || 4200) * (mitScan ? 1 : 0.5));
    const proSchritt = Math.round(dauer / Math.max(1, knoten.length));
    // DIE LETZTE ZEILE ("geht an Dr. Gashi") LAEUFT, BIS WIRKLICH
    // GESPEICHERT IST - erst dann Haken und 100 %, und sofort weiter.
    // Vorher stand der Ring auf 100 %, waehrend noch gespeichert wurde,
    // und sah aus wie haengengeblieben.
    const letzte = knoten.length - 1;
    for (const [i, el] of knoten.entries()) {
      el.dataset.stand = "laeuft";
      if (i === letzte) break;
      await warte(proSchritt);
      el.dataset.stand = "fertig";
      el.firstElementChild.textContent = "✓";
      fortschritt((i + 1) / knoten.length);
    }
    this.aufbereitungLetzte = knoten[letzte] || null;
    this.aufbereitungGezeigt = true;
  }

  #aufbereitungFertig() {
    const el = this.aufbereitungLetzte;
    if (el) { el.dataset.stand = "fertig"; el.firstElementChild.textContent = "✓"; }
    $("#ls-analysekreis")?.style?.setProperty?.("--anteil", "1");
    schreibe($("#ls-analysezahl"), "100 %");
  }

  async #uebergeben() {
    if (this.uebergabeAktiv) return;
    this.uebergabeAktiv = true;
    this.zeige("analyse");
    // Waehrend gespeichert wird, fuehrt kein Pfeil zurueck.
    $("#ls-analyse [data-zurueck]")?.setAttribute("hidden", "");
    const anzeige = this.#aufbereitungZeigen().catch(() => {});
    let frist;
    let vorgang = null;
    try {
      // Ein erneuter Tipp nutzt den laufenden Versand, statt ihn zu duplizieren.
      if (!this.uebergabeVorgang) {
        this.uebergabeVorgang = this.sitzung.berichtAnlegen({
          name: this.zustand.name,
          sprache: this.sprache,
          typ: this.zustand.typ || "scan",
          numri: this.zustand.nummerGegeben === true,
          photos: this.zustand.fotoAnzahl || (this.zustand.aufnahmen || []).length
        }).catch((fehler) => {
          this.uebergabeVorgang = null;
          throw fehler;
        });
      }
      vorgang = this.uebergabeVorgang;
      // WARTEN, SOLANGE SICH ETWAS BEWEGT - nicht bis zu einer festen Uhrzeit.
      //
      // Hier stand eine Frist von zwanzig Sekunden ab dem Tipp. Auf einer
      // schmalen Leitung (Mobilfunk im Fenster von Instagram) sind die
      // Fotos dann oft noch unterwegs: Der Schirm meldete "nicht
      // bestaetigt", waehrend alles sauber hochging - und wer das liest,
      // geht. Jetzt zaehlt die Frist ab der LETZTEN Antwort des Servers
      // (sitzung.letzteAntwort). Nur wer so lange gar nichts mehr hoert,
      // bekommt den Hinweis; die Zeile darunter zeigt bis dahin, wie viele
      // Fotos schon angekommen sind.
      const ab = Date.now();
      const ok = await Promise.race([
        vorgang,
        new Promise((_, nein) => {
          const pruefen = () => {
            this.#uebergabeFortschritt();
            const zuletzt = Math.max(ab, Number(this.sitzung.letzteAntwort) || 0);
            if (Date.now() - zuletzt >= UEBERGABE_STILL_MS) { nein(new Error("pending")); return; }
            frist = setTimeout(pruefen, 1000);
          };
          frist = setTimeout(pruefen, 1000);
        })
      ]);
      this.uebergabeVorgang = null;
      if (!ok) throw new Error("save failed");
      // Die Zeilen zu Ende laufen lassen - dann erst weiter.
      await anzeige;
      // Erst ein bestaetigter Bericht darf als abgegeben gelten.
      // Nicht darauf warten: Die Meldung an Dr. Gashi stoesst die
      // Warteseite an (astra.js), sobald sie steht.
      this.sitzung.schritt("result");
      this.#aufbereitungFertig();
      this.#standVergessen();
      globalThis.location.assign(this.sitzung.berichtPfad);
    } catch (fehler) {
      this.#fehlerZeigen("uebergabeFehler", () => this.#uebergeben());
      // UND KOMMT DER VERSAND DANACH DOCH NOCH AN, GEHT ES VON SELBST WEITER.
      //
      // Der Hinweis sagt "diese Seite offen lassen" - wer das tut, soll
      // nicht zusaetzlich einen Knopf finden muessen, wenn die Leitung
      // zurueckkommt und der Bericht steht.
      if (fehler?.message === "pending" && vorgang) {
        vorgang.then((ok) => {
          // Endgueltig gescheitert: Der naechste Tipp auf "Provo sërish"
          // soll neu senden und nicht dieses Ergebnis noch einmal lesen.
          if (!ok) { if (this.uebergabeVorgang === vorgang) this.uebergabeVorgang = null; return; }
          if (this.aktiv !== "analyse" || this.uebergabeAktiv) return;
          $("#ls-fehler")?.classList.add("ls-verstecken");
          this.#uebergeben();
        }, () => {});
      }
    } finally {
      clearTimeout(frist);
      this.uebergabeAktiv = false;
    }
  }

  // Die letzte Zeile der Aufbereitung sagt, wie viele Fotos schon oben
  // sind - solange noch welche unterwegs sind. Eine Zahl, die waechst,
  // haelt Menschen auf der Seite; ein Kreis, der steht, nicht.
  #uebergabeFortschritt() {
    const zeile = this.aufbereitungLetzte?.lastElementChild;
    if (!zeile) return;
    const offen = Number(this.sitzung.offeneFotos?.size) || 0;
    const gesamt = Number(this.zustand.fotoAnzahl) || 0;
    if (offen && gesamt) {
      if (this.aufbereitungText == null) this.aufbereitungText = zeile.textContent;
      schreibe(zeile, this.text("uebergabeFotos", { fertig: Math.max(0, gesamt - offen), gesamt }));
    } else if (this.aufbereitungText != null) {
      // Alle oben: wieder der Satz, der dort stand ("geht an Dr. Gashi").
      schreibe(zeile, this.aufbereitungText);
      this.aufbereitungText = null;
    }
  }



  // Das Blatt auf und zu.
  //
  // Ueber der Seite und nicht darin: Ein Kasten, der sich im Fluss
  // aufklappt, macht den Bildschirm laenger als das Fenster - und dann
  // scrollt die Seite wieder.
  #blatt(auf) {
    const blatt = $("#ls-blatt");
    if (!blatt) return;
    blatt.classList.toggle("ls-verstecken", !auf);
    $("#ls-hilfe")?.setAttribute("aria-expanded", auf ? "true" : "false");
    if (auf) $("#ls-blattzu")?.focus();
  }

  // Der Fehlerkasten. Mit `ausweg` (siehe #kameraAusweg) traegt er unter
  // "Provo sërish" noch die Kamera des Telefons und - auf Android in einer
  // App - den Weg nach Chrome. Ohne `ausweg` sind beide weg: Der Kasten
  // wird fuer jeden Fehler wiederverwendet, und ein Knopf aus dem
  // vorigen Fehler darf nicht unter dem naechsten stehen bleiben.
  #fehlerZeigen(schluessel, nochmal, { ausweg = null } = {}) {
    const kasten = $("#ls-fehler");
    if (!kasten) return;
    kasten.classList.remove("ls-verstecken");
    schreibe($("#ls-fehlertext"), this.text(schluessel));
    const knopf = $("#ls-fehlernochmal");
    schreibe(knopf, this.text("nochmal"));
    knopf.onclick = () => { kasten.classList.add("ls-verstecken"); nochmal?.(); };
    // Wo nochmal versuchen nie hilft (die gesperrte Kamera einer App),
    // steht der Knopf gar nicht erst da.
    knopf.hidden = Boolean(ausweg?.ohneNochmal);

    const foto = $("#ls-fehlerfoto");
    if (foto) {
      foto.hidden = !ausweg?.systemFoto;
      // Der Tipp selbst oeffnet die Kamera des Telefons: Ein Dateifeld
      // geht nur aus einem Fingerdruck heraus auf.
      foto.onclick = ausweg?.systemFoto
        ? () => { kasten.classList.add("ls-verstecken"); this.#systemFotoWaehlen(ausweg.weg); }
        : null;
    }
    const chrome = $("#ls-fehlerchrome");
    if (chrome) {
      const adresse = ausweg?.chrome ? this.#chromeAdresse(ausweg.weg) : "";
      chrome.hidden = !adresse;
      if (adresse) chrome.setAttribute("href", adresse);
      else chrome.removeAttribute?.("href");
      chrome.onclick = adresse ? () => this.#technik(`Chrome-Link getippt (${ausweg.weg})`) : null;
    }
  }

  // ---------- Wenn die Live-Kamera nicht geht ----------

  // WELCHE AUSWEGE EIN KAMERAFEHLER ANBIETET.
  //
  // JEDER Kamerafehler bekommt die Kamera des Telefons dazu - nicht nur
  // die gesperrte App: Wer die Freigabe abgelehnt hat, wessen Kamera kein
  // Bild liefert oder dessen Scan stehen bleibt, macht mit einem Foto
  // weiter, statt zu gehen. Ein Dateifeld braucht keine Freigabe der
  // Seite; es oeffnet die Kamera-App des Telefons.
  //
  // Und wo "Provo sërish" sicher nichts aendert - Android in einer App,
  // die ohne Frage abgelehnt hat oder gar keine Kamera-Schnittstelle
  // kennt -, steht es nicht da, und der Satz sagt, was los ist.
  //
  // Nur, wenn die Seite den Fotobildschirm traegt: Das Foto landet dort
  // zur Pruefung. Ohne ihn gaebe es nur den Weg nach Chrome.
  //
  // GESPERRT HEISST: OHNE FRAGE ABGELEHNT. Eine Ablehnung innerhalb von
  // SOFORT_VERWEIGERT_MS kann kein Mensch getippt haben - dann hat die App
  // die Kamera verweigert, ohne je zu fragen, und "Provo sërish" aendert
  // daran nichts. Kam die Ablehnung spaeter, hat der Besucher selbst
  // "Blockieren" getippt; dann bleibt "Provo sërish" stehen, denn eine App,
  // die fragt, fragt vielleicht auch ein zweites Mal.
  #kameraAusweg(grund, weg, { dauerMs = Infinity } = {}) {
    const inApp = inAppAndroid();
    const gesperrt = inApp && (grund === "fehlerKameraBrowser"
      || (grund === "fehlerKameraErlaubnis" && dauerMs < SOFORT_VERWEIGERT_MS));
    return {
      weg,
      text: gesperrt ? "fehlerKameraInApp" : grund,
      systemFoto: Boolean($("#ls-foto")),
      chrome: inApp,
      ohneNochmal: gesperrt
    };
  }

  #kameraFehlerZeigen(grund, weg, nochmal, { dauerMs } = {}) {
    const ausweg = this.#kameraAusweg(grund, weg, { dauerMs });
    if (ausweg.text !== grund) this.#technik(`Live-Kamera in der App gesperrt (${grund}) – Handykamera und Chrome angeboten`);
    this.#fehlerZeigen(ausweg.text, nochmal, { ausweg });
  }

  // Die Kamera des Telefons: ein Dateifeld, einmal angelegt.
  //
  // capture="user" oeffnet, wo das Geraet es kann, gleich die vordere
  // Kamera; wo nicht, bietet es Kamera und Galerie an - beides ist recht.
  #systemFotoFeld() {
    if (this.systemFeld) return this.systemFeld;
    const dokument = globalThis.document;
    if (!dokument?.createElement) return null;
    const feld = dokument.createElement("input");
    feld.type = "file";
    feld.accept = "image/*";
    feld.setAttribute("capture", "user");
    feld.hidden = true;
    feld.addEventListener?.("change", () => this.#systemFotoErhalten(feld.files?.[0]));
    (dokument.body || dokument.documentElement)?.appendChild?.(feld);
    this.systemFeld = feld;
    return feld;
  }

  #systemFotoWaehlen(weg = "foto") {
    const feld = this.#systemFotoFeld();
    if (!feld) return;
    this.systemFotoWeg = weg;
    this.#technik(`Handykamera geöffnet (${weg})`);
    // Dasselbe Bild zweimal hintereinander loest sonst kein change aus.
    try { feld.value = ""; } catch { /* aeltere Webansichten */ }
    feld.click();
  }

  // DAS FOTO AUS DER KAMERA DES TELEFONS - ab hier der Weg "Me foto".
  //
  // Auch wenn der Besucher den Scan gewaehlt hatte: Was jetzt vorliegt,
  // ist EIN Bild, und damit ist es fuer Dr. Gashi und fuer die Zahlen ein
  // Fall mit Foto. Der Weg wechselt deshalb sichtbar (#wegMerken), und das
  // Bild steht zur Pruefung da wie nach dem Ausloeser - mit "Përdor foton"
  // und "Bëje përsëri".
  async #systemFotoErhalten(datei) {
    if (!datei) return;
    const aufnahme = await fotoAusDatei(datei).catch(() => null);
    if (!aufnahme) {
      this.#technik("Handykamera: Foto nicht lesbar");
      this.#fehlerZeigen("fehlerSystemFoto", () => this.#systemFotoWaehlen(this.systemFotoWeg || "foto"));
      return;
    }
    if (!$("#ls-foto")) return;
    this.#kameraStoppen();
    if (this.zustand.typ !== "foto") this.#wegMerken("foto");
    this.zustand.stelleFoto = aufnahme;
    this.zustand.fotoQuelle = "system";
    this.sitzung.schritt("fotokamera");
    const kb = Math.round(String(aufnahme.foto?.jpeg || "").length * 0.75 / 1024);
    this.#technik(`Handykamera: Foto erhalten · ${aufnahme.foto?.breite || 0}×${aufnahme.foto?.hoehe || 0} · ${kb} KB`);
    this.zeige("foto");
    this.#fotoVorschauZeigen(aufnahme.vorschau);
  }

  // DER WEG NACH CHROME - nur auf Android, nur aus einer App.
  //
  // Ein intent://-Link oeffnet dieselbe Adresse in Chrome; fehlt Chrome,
  // bleibt es bei der Adresse im selben Fenster (browser_fallback_url).
  // ls_weg nimmt den gewaehlten Weg mit: Dort geht es direkt zur Anleitung
  // dieses Wegs, statt die Landingpage noch einmal zu lesen (#direktWeg).
  #chromeAdresse(weg) {
    let ziel;
    try { ziel = new URL(globalThis.location?.href); } catch { return ""; }
    if (!/^https?:$/.test(ziel.protocol)) return "";
    ziel.hash = "";
    ziel.searchParams.set("ls_weg", weg === "foto" ? "foto" : "skanim");
    return `intent://${ziel.host}${ziel.pathname}${ziel.search}#Intent;scheme=https;package=com.android.chrome;`
      + `S.browser_fallback_url=${encodeURIComponent(ziel.href)};end`;
  }
}

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__) {
  // DER TRICHTER WIRD ABGELEGT, DAMIT DER LADEN IHN FINDET.
  //
  // shop.js auf der Landingpage bestellt in DIESELBE Sitzung, die dieser
  // Besuch ohnehin angelegt hat - ein Besucher ist eine Zeile in Heart,
  // auch wenn er ohne Analyse kauft. Dafuer braucht der Laden die
  // Sitzung, und die gehoert dem Trichter.
  //
  // Es ist eine Ablage und kein zweiter Einstieg: Gelesen wird
  // ausschliesslich .sitzung und .pixel, und nichts hier ruft etwas am
  // Trichter auf, was der Trichter nicht selbst auch ruft.
  const start = () => {
    const trichter = new Trichter();
    globalThis.__lifeskinTrichter = trichter;
    trichter.starte();
    // iOS: Leiste unten nach Tastatur (Name, Nummer, Kasse) wieder an
    // die Unterkante - siehe shared/lifeskin-unten.js.
    untenNachziehenStarten();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
