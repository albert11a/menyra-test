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
import { netzVorladen, netzHolen, netzStand, messeNetz, MARKE } from "./lifeskin-netz.js";
import { STANDARD_KONFIG } from "./lifeskin-catalog.js";
import { OBERFLAECHE, EINSTIEG_HINWEIS, EINSTIEG_KARTEN, ARZT_BILD, ARZT_NAME,
  FRAGEN, FRAGEN_TEXTE, t, fuelle } from "./lifeskin-content.js";
import { Sitzung } from "./lifeskin-session.js";
import { Pixel } from "./lifeskin-pixel.js";

// Sechs Bildschirme, nicht mehr zehn.
//
// Empfehlung, Angebot, Anschrift und Danke sind weg. Sie waren die
// Verkaufsstrecke des Trichters und beruhten vollstaendig auf dem
// automatischen Befund - und den gibt es nicht mehr.
//
// Verkauft wird auf der Befundseite, die Dr. Gashi freigibt. Der Trichter
// macht den Scan und uebergibt.
// VIER BILDSCHIRME, NICHT MEHR FUENF.
//
// Der Namensschirm ist raus. Er stand zwischen der Anzeige und der Kamera
// und verlangte Name UND Alter, bevor der Besucher irgendetwas bekommen
// hatte - gemessen: von 894 Besuchern kamen 122 an ihm vorbei.
//
// Gefragt wird nach den Fotos. Dann ist der Fall gesichert, die Bilder
// gehen im Hintergrund hinaus, und die Fragen fuellen die Wartezeit, statt
// vor dem Nutzen zu stehen.
const SCHIRME = ["einstieg", "vorbereitung", "kamera", "fragen", "analyse"];

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

// Die Qualitaetsstufen, von oben nach unten durchprobiert.
//
// Ein Firestore-Dokument darf 1 MiB gross sein, und ein Bild steht als Text
// darin - Base64 macht aus drei Byte vier Zeichen. Statt eine feste
// Qualitaet zu raten, die mal zu gross und mal zu schlecht ist, wird die
// beste genommen, die noch passt. Bei einem gleichmaessig ausgeleuchteten
// Gesicht reicht dafuer fast immer die erste.
const FOTO_STUFEN = Object.freeze([0.94, 0.88, 0.82, 0.74, 0.64]);

// Wieviel Text ein Bild hoechstens werden darf. Der Rest des Dokuments -
// Blickrichtung, Zeitstempel, Masse - liegt bei wenigen hundert Byte; der
// Abstand zur Millionengrenze ist Absicht und kein Geiz.
const FOTO_HOECHSTZEICHEN = 900000;

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

const IM_VERLAUF = Object.freeze(["einstieg", "vorbereitung"]);

// Der Fortschritt startet bei 20 %. Siehe lifeskin-styles.css.
const FORTSCHRITT = { einstieg: 20, vorbereitung: 40, kamera: 65, fragen: 85, analyse: 100 };

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
// Als eigene Funktion und nicht als Methode, damit sie ohne Browser
// nachrechenbar ist: `kodiere(guete)` gibt die fertige Zeichenkette zurueck,
// mehr braucht die Entscheidung nicht. Getestet in
// tests/lifeskin-fotos.test.mjs.
export function besteGuete(kodiere, stufen = FOTO_STUFEN, grenze = FOTO_HOECHSTZEICHEN) {
  for (const guete of stufen) {
    const jpeg = kodiere(guete);
    if (typeof jpeg === "string" && jpeg.length <= grenze) return { jpeg, guete };
  }
  return null;
}

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
    this.fragen = { i: 0, antworten: {} };

    // WELCHE FRAGEN NACH DEM SCAN UEBERHAUPT KOMMEN.
    //
    // Die alte Fassung stellt sechs: vier Fragen, den Namen, die Nummer.
    // Sie stehen nach der Aufnahme, weil dort der Fall schon gesichert ist
    // und die Bilder im Hintergrund hinausgehen.
    //
    // Die kurze Fassung stellt genau EINE: die Nummer. Alles andere kann
    // Dr. Gashi im Gespraech fragen - sie schreibt ohnehin auf WhatsApp.
    // Was der Trichter an dieser Stelle NICHT bekommt, ist der Kontakt,
    // und ohne den war der ganze Scan umsonst: Von 32 fertigen Analysen
    // haben 13 ihren Befund gesehen, genau die 13, die erreichbar waren.
    // Fuenf Bildschirme zwischen dem Scan und dieser einen Zeile sind
    // fuenf Gelegenheiten, vorher wegzugehen.
    //
    // Aus derselben Liste gefiltert und nicht abgeschrieben: Aendert sich
    // der Text oder die Pruefung der Nummer, aendert sie sich hier mit.
    this.fragenListe = this.variante === "kurz"
      ? FRAGEN.filter((frage) => frage.id === "numri")
      : FRAGEN;
  }

  text(schluessel, werte) {
    const roh = t(OBERFLAECHE[schluessel], this.sprache);
    return werte ? fuelle(roh, werte) : roh;
  }

  starte() {
    // Das Gesichtsnetz wiegt rund 6,7 MB und wird ab hier im Hintergrund
    // geholt. Bis der Kunde Namen und Alter eingegeben und die drei Hinweise
    // gelesen hat, vergehen zwanzig Sekunden - die Ladezeit liegt darin und
    // nicht vor der Kamera. Der Rueckgabewert interessiert hier niemanden:
    // Kommt es nicht, laeuft der Trichter mit der alten Erkennung weiter.
    netzVorladen();
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
    this.zeige("einstieg");
    // Erst jetzt, mit stehendem Aufbau: Vorher waeren die Stuecke noch
    // ohne Platz und jedes gaelte als "schon im Bild".
    this.#einblenden();

    this.sitzung.starte({ sprache: this.sprache });

    // ZULETZT, und das ist die Reihenfolge, auf die es ankommt: Erst steht
    // die Sitzung, dann wird der Tipp nachgeholt, der waehrend des Ladens
    // kam. Andersherum zaehlte #startTippen() einen Schritt auf einer
    // Sitzung, die es noch nicht gibt.
    this.#frueherTippNachholen();
  }

  zeige(name, { verlauf = "vor" } = {}) {
    for (const schirm of SCHIRME) {
      const knoten = $(`#ls-${schirm}`);
      if (knoten) knoten.dataset.aktiv = schirm === name ? "ja" : "nein";
    }
    const vorher = this.aktiv;
    this.aktiv = name;

    const balken = $(".ls-fortschritt__balken");
    if (balken) balken.style.width = `${FORTSCHRITT[name] ?? 20}%`;

    // Die Karten laufen nur auf ihrem eigenen Bildschirm.
    if (name === "einstieg") this.#kartenLaufen();
    else this.#kartenAnhalten();

    // Der Zurueck-Pfeil erscheint nur, wo es etwas zurueckzugehen gibt.
    const zurueck = $(`#ls-${name} [data-zurueck]`);
    if (zurueck) zurueck.hidden = name === "einstieg" || name === "danke";

    window.scrollTo(0, 0);

    if (verlauf === "nein" || !IM_VERLAUF.includes(name)) return;
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
    this.#kameraStoppen();
    this.zeige(ziel, { verlauf: "nein" });
  }

  // Wohin ein Zurueck von hier fuehrt.
  vorherigerSchirm(von = this.aktiv) {
    return {
      vorbereitung: "einstieg",
      kamera: "vorbereitung",
      analyse: "vorbereitung"
    }[von] || null;
  }

  // Alle Beschriftungen aus lifeskin-content.js. Im Aufbau steht keine
  // einzige Zeichenkette - sonst waere die zweite Sprache nachtraeglich
  // nicht mehr einzuziehen.
  #texteSetzen() {
    this.#kartenBauen();
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
        const ziel = this.vorherigerSchirm();
        if (!ziel) return;
        // ueber den Verlauf zurueck, damit beide Wege dieselbe Kette teilen
        // und der Vorwaerts-Knopf danach noch stimmt.
        if (history.state?.ls && history.length > 1) history.back();
        else this.zurueckZu(ziel);
      });
    }

    $("#ls-start")?.addEventListener("click", () => this.#startTippen());

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
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { this.kamera.wegSeit = Date.now(); return; }
      const weg = this.kamera.wegSeit ? Date.now() - this.kamera.wegSeit : 0;
      this.kamera.wegSeit = 0;
      // Ein kurzes Flackern ist kein Weggehen.
      if (!this.kamera.laeuft || weg < 400) return;
      this.kamera.ring?.pauseEinrechnen(weg);
      // Und der naechste Takt darf sofort messen, statt eine Frist
      // abzuwarten, die waehrend der Abwesenheit ohnehin verstrichen ist.
      this.kamera.letzteMessung = 0;
      const video = $("#ls-video");
      this.#abspielen(video);
      this.#abspielWaechter(video);
    });
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
    this.sitzung.schritt("named");

    // BEIDE FASSUNGEN GEHEN JETZT AUF DIE ANLEITUNG.
    //
    // Die kurze ging eine Weile unmittelbar an die Kamera, und das war
    // gegen die Systemfrage des Browsers gedacht: zwei Kaesten
    // uebereinander, die beide etwas wollen, sind einer zu viel.
    //
    // Der Bildschirm davor ist trotzdem zurueck, und zwar mit einer
    // anderen Aufgabe als frueher. Er zaehlt keine drei Regeln mehr auf,
    // sondern nimmt der SYSTEMFRAGE die Ueberraschung: Wer weiss, dass
    // gleich "moechte auf deine Kamera zugreifen" kommt und warum,
    // tippt auf "Erlauben". Wer es nicht weiss, tippt auf "Nicht
    // erlauben" - und dieser Besucher ist vollstaendig verloren, denn
    // auf iOS kommt die Frage kein zweites Mal; er muesste sie in den
    // Einstellungen des Geraets zuruecknehmen.
    //
    // Nebenbei faellt damit der ganze Sonderweg fuer den Tipp weg, der
    // vor den Modulen kam: Die Kamera wird jetzt vom Knopf DIESES
    // Bildschirms angefordert, und das ist immer eine echte Berührung.
    this.zeige("vorbereitung");
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

  async #kameraStarten() {
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
    // Sofort, nicht erst wenn das Bild da ist: Zwischen dem Tippen und dem
    // ersten Bild liegen die Systemfrage und das Aufwachen der Kamera. Ohne
    // ein Wort ist das ein leerer Kreis auf einer leeren Seite.
    schreibe($("#ls-kamerahinweis"), this.text("kameraOeffnet"));
    this.sitzung.schritt("camera");

    try {
      // Nur nach einer Berührung - iOS erlaubt es nicht anders.
      const strom = await this.#stromHolen();
      if (lauf !== this.kamera.lauf) {
        for (const spur of strom.getTracks()) spur.stop();
        return;
      }
      this.kamera.strom = strom;
      video.srcObject = strom;
      // playsinline steht auch im Aufbau. Ohne beides springt Safari in den
      // Vollbildmodus und der Trichter bricht ab.
      video.setAttribute("playsinline", "");
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
      await this.#videoBereit(video);
      if (lauf !== this.kamera.lauf) return;
    } catch {
      // Ein abgeloester Lauf zeigt keinen Fehler an: Der neue ist gerade
      // dabei, und zwei Meldungen uebereinander verwirren nur.
      if (lauf === this.kamera.lauf) {
        this.#fehlerZeigen("fehlerKamera", () => this.#kameraStarten());
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

    netzHolen({ zeitgrenzeMs: 9000 }).then((netz) => {
      if (lauf !== this.kamera.lauf) return;
      this.kamera.netzWartet = false;
      if (!this.kamera.laeuft) return;
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
  async #stromHolen() {
    const anlaeufe = [
      { name: "fein", regel: { facingMode: "user", width: { ideal: 1440 } } },
      { name: "einfach", regel: { facingMode: "user" } },
      { name: "nackt", regel: true }
    ];
    let letzter = null;
    for (const anlauf of anlaeufe) {
      try {
        const strom = await navigator.mediaDevices.getUserMedia({ video: anlauf.regel, audio: false });
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
      }
    }
    throw letzter || new Error("Kamera nicht erreichbar");
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
    try {
      const laeuft = video?.play?.();
      if (laeuft && typeof laeuft.then === "function") {
        await Promise.race([Promise.resolve(laeuft).catch(() => {}), warte(fristMs)]);
      }
    } catch { /* siehe oben */ }
  }

  // Und falls doch kein Bild kommt: noch einmal anstossen, ein paar Mal.
  //
  // Ein pausiertes Video liefert keine Bildpunkte - der Ring haette nichts
  // zu messen und der Kreis bliebe leer. Der Waechter hoert von selbst auf,
  // sobald Bilder fliessen, und spaetestens nach acht Sekunden.
  #abspielWaechter(video) {
    if (!video || this.kamera.abspielTakt) return;
    let versuche = 0;
    this.kamera.abspielTakt = setInterval(() => {
      versuche += 1;
      const laeuftBild = video.videoWidth > 0 && !video.paused;
      if (!this.kamera.laeuft || laeuftBild || versuche > 10) {
        clearInterval(this.kamera.abspielTakt);
        this.kamera.abspielTakt = null;
        return;
      }
      try { Promise.resolve(video.play?.()).catch(() => {}); } catch { /* egal */ }
    }, 800);
  }

  // Warten, bis das Kamerabild seine Groesse gefunden hat.
  //
  // WARUM DAS BILD BEIM START VERZERRT WAR - und es war kein Zufall:
  //
  // Ein frisch geoeffneter <video>-Knoten hat noch kein Seitenverhaeltnis.
  // `object-fit: cover` braucht aber genau das, um zu wissen, was es
  // beschneiden soll. Bis die Metadaten da sind, zieht der Browser das erste
  // Bild also auf den ganzen quadratischen Kasten - und weil der Kasten
  // quadratisch ist und die Kamera hochkant liefert, ist die Verzerrung
  // maximal sichtbar.
  //
  // Dazu kommt ein zweiter Schub: iOS liefert oft erst einen Strom in einer
  // Aufloesung und schaltet dann auf die angeforderte um. `videoWidth`
  // aendert sich damit nach dem Start noch einmal, und mit ihr der
  // Zuschnitt, den #leinwandFuellen() rechnet. Das ist das "und dann
  // stabilisiert es sich".
  //
  // Hier wird gewartet, bis die Breite zweimal hintereinander dieselbe ist,
  // und erst dann das Bild eingeblendet. Bis dahin bleibt der Kreis schwarz -
  // schwarz und ruhig ist besser als sichtbar und falsch.
  async #videoBereit(video, { fristMs = 2500, ruheMs = 220 } = {}) {
    const kasten = $(".ls-kamera");
    if (kasten) kasten.dataset.bereit = "nein";

    // ERST FRAGEN, WENN ES ETWAS ZU FRAGEN GIBT.
    //
    // Die Schleife darunter sieht alle 60 ms nach, ob das Bild schon eine
    // Groesse hat - im schlechtesten Fall liegen damit 60 ms zwischen dem
    // ersten Einzelbild und dem Augenblick, in dem der Kreis es zeigt, und
    // auf einem langsamen Geraet ist der Takt unregelmaessig.
    // loadedmetadata kommt genau dann, wenn die Groesse steht.
    //
    // Kein Ersatz fuer die Schleife: Die wartet auf die RUHIGE Breite
    // (iOS schaltet nach dem Start noch einmal um). Nur der erste Blick
    // wird ihr abgenommen. Meldet ein Browser gar nichts, geht es nach
    // einer knappen Sekunde trotzdem weiter.
    await new Promise((fertig) => {
      if (video?.videoWidth > 0) { fertig(); return; }
      let vorbei = false;
      const fertigEinmal = () => { if (vorbei) return; vorbei = true; fertig(); };
      video?.addEventListener?.("loadedmetadata", fertigEinmal, { once: true });
      video?.addEventListener?.("loadeddata", fertigEinmal, { once: true });
      setTimeout(fertigEinmal, 900);
    });

    const seit = Date.now();
    let letzte = 0;
    let ruhigSeit = 0;
    let gezeigt = false;

    // ZWEI FRAGEN, DIE HIER FRUEHER EINE WAREN - und das hat bis zu zwei
    // Sekunden leeren Kreis gekostet.
    //
    //   "Darf man das Bild zeigen?"  -> sobald videoWidth > 0. Vorher hat
    //   der Knoten kein Seitenverhaeltnis und `object-fit: cover` zieht das
    //   Bild auf das Quadrat; ab dem ersten Einzelbild ist es richtig
    //   zugeschnitten.
    //
    //   "Darf man anfangen zu messen?" -> erst wenn die Breite ruhig ist.
    //   iOS liefert oft erst einen Strom in einer Aufloesung und schaltet
    //   dann um; #leinwandFuellen() rechnet mit der Breite, und die darf
    //   sich unter der Messung nicht mehr aendern.
    //
    // Gewartet wurde auf die zweite - und solange blieb der Kreis leer,
    // obwohl das Bild laengst richtig dagestanden haette. Die iOS-Umschaltung
    // aendert den Zuschnitt, nicht die Richtigkeit: Sie ist ein kurzes
    // Nachruecken und kein verzerrtes Bild. Ein Nachruecken sieht niemand,
    // zwei Sekunden leerer Kreis sieht jeder.
    const zeigen = () => {
      if (gezeigt || !kasten) return;
      gezeigt = true;
      kasten.dataset.bereit = "ja";
    };

    while (Date.now() - seit < fristMs) {
      const breite = video.videoWidth;
      if (breite > 0) {
        zeigen();
        if (breite === letzte) {
          if (!ruhigSeit) ruhigSeit = Date.now();
          if (Date.now() - ruhigSeit >= ruheMs) break;
        } else {
          letzte = breite;
          ruhigSeit = 0;
        }
      }
      await warte(60);
    }

    // Nach der Frist wird trotzdem eingeblendet. Ein Kunde vor einem leeren
    // Kreis ist schlimmer als einer vor einem kurz verzerrten - und auf
    // einem langsamen Geraet kann das laenger dauern, als hier gewartet
    // wird.
    zeigen();
    // Der Rueckgabewert sagt, ob ueberhaupt ein Bild kam. Wer ihn nicht
    // prueft, faehrt blind weiter - siehe #rueckfallAufnehmen(), das genau
    // deshalb auf ein brauchbares Bild wartet, statt ins Leere auszuloesen.
    return video.videoWidth > 0;
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
    if (!video?.videoWidth || !video.clientWidth) return null;
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
    stift.save();
    stift.translate(breite, 0);
    stift.scale(-1, 1);
    stift.drawImage(video, aus.x, aus.y, aus.breite, aus.hoehe, 0, 0, breite, hoehe);
    stift.restore();
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
      schreibe($("#ls-kamerahinweis"), lage ? this.text(lage) : this.text("aufnahmeGleich"));
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
      // Zwei Sekunden in Zehnteln: Das ist die Zeitspanne, in der ein
      // Kamerabild kommt, wenn es ueberhaupt kommt.
      let leinwand = null;
      for (let versuch = 0; versuch < 20 && !leinwand; versuch += 1) {
        leinwand = this.#leinwandFuellen({ breite: VERFOLGUNG_BREITE });
        if (!leinwand) await warte(100);
        if (lauf !== this.kamera.lauf || !this.kamera.laeuft) return;
      }
      if (!leinwand) break;
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

  // Erst jetzt kodieren - die Kamera steht bereits.
  //
  // In voller Aufloesung dauert das je Bild ein paar Dutzend Millisekunden.
  // Zwischen den Bildern wird deshalb einmal losgelassen, damit der Wechsel
  // zum Analysebildschirm nicht in drei Rucken passiert.
  async #fotosAlsJpeg() {
    const fertig = {};
    // Die Reihenfolge ist die, in der Dr. Gashi sie ansieht: erst gerade,
    // dann die Seiten, zuletzt die Aufsicht. Das beste Bild einer Richtung
    // traegt ihren Namen, die weiteren zaehlen dahinter.
    for (const blick of ["gerade", "rechts", "links", "oben"]) {
      const platz = this.kamera.fotos?.[blick];
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
    this.kamera.fotos = {};
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
      this.#fehlerZeigen("fehlerKeinGesicht", () => this.#kameraStarten());
      return;
    }

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
    // Was auf der Warteseite als "{anzahl} foto" steht, sind die Bilder -
    // nicht die Messungen. Hier standen die Messungen, und das waren nie
    // dieselben Zahlen.
    this.zustand.fotoAnzahl = Object.keys(fotos).length;
    this.sitzung.fotosSpeichern(fotos);


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
    this.kamera.laeuft = false;
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
    for (const spur of this.kamera.strom?.getTracks() || []) spur.stop();
    this.kamera.strom = null;
    const video = $("#ls-video");
    if (video) video.srcObject = null;
  }

  // ---------- Analyse: die sichtbare Arbeit ----------

  async #analyseZeigen() {
    // Der zweite bisher ungezaehlte Bildschirm. Er dauert sieben Sekunden,
    // und wer hier weggeht, hat alles getan und kommt trotzdem nie an.
    this.sitzung.schritt("aufbereitung");
    this.zeige("analyse");


    // Hier wurde einmal der Befund gerechnet: Hauttyp, sechs Befunde mit
    // Stufen, dazu die Produktauswahl. Das ist ersatzlos weg.
    //
    // WIR MACHEN DEN SCAN. DIE ANALYSE MACHT DR. GASHI.
    //
    // Was hier laeuft, ist Aufbereitung: Die Aufnahmen sind vermessen, die
    // drei besten sind gewaehlt, der Fall wird gespeichert. Die Zeilen
    // darunter benennen genau das und nichts darueber hinaus.

    const zeilen = [
      this.text("analyseZonen"),
      this.text("analyseTzone"),
      this.text("analyseRoetung"),
      this.text("analyseTextur"),
      this.text("analyseVergleich", { gruppe: this.zustand.altersgruppe }),
      this.text("analyseRoutine")
    ];

    const liste = $("#ls-analyseschritte");
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

    const kreis = $("#ls-analysekreis");
    const zahl = $("#ls-analysezahl");
    const fortschritt = (anteil) => {
      if (kreis) kreis.style.setProperty("--anteil", String(anteil));
      schreibe(zahl, `${Math.round(anteil * 100)} %`);
    };
    fortschritt(0);

    const proSchritt = Math.round((this.konfig.analyseAnzeigeMs || 7000) / zeilen.length);
    for (const [i, el] of knoten.entries()) {
      el.dataset.stand = "laeuft";
      await warte(proSchritt);
      el.dataset.stand = "fertig";
      el.firstElementChild.textContent = "✓";
      fortschritt((i + 1) / knoten.length);
    }

    await this.#uebergeben();
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

  #fragenZeigen() {
    this.fragen = { i: 0, antworten: {} };
    this.zeige("fragen");
    this.#frageZeichnen({ richtung: "vor" });
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
    // STEHT NUR EINE FRAGE DA, IST "ein paar kurze Fragen" EINE LUEGE -
    // und eine, die im schlechtesten Augenblick faellt: Wer gerade
    // dreissig Sekunden lang den Kopf gedreht hat, liest dort, dass jetzt
    // noch etwas kommt, und legt weg. Dann sagt die Zeile, was wirklich
    // stimmt: Der Scan ist vorbei, das hier ist der letzte Schritt.
    const einzeln = this.fragenListe.length === 1;
    if (einleitung) {
      const satz = einzeln
        ? t(FRAGEN_TEXTE.einleitungEinzeln, this.sprache)
        : (this.fragen.i === 0 ? t(FRAGEN_TEXTE.einleitung, this.sprache) : "");
      einleitung.textContent = satz;
      einleitung.hidden = !satz;
    }
    // Und "Frage 1 von 1" zaehlt nichts - der Zaehler bleibt dann leer.
    schreibe($("#ls-fragenzaehler"), einzeln ? "" : fuelle(t(FRAGEN_TEXTE.zaehler, this.sprache),
      { nr: this.fragen.i + 1, gesamt: this.fragenListe.length }));
    schreibe($("#ls-fragetitel"), t(frage.titel, this.sprache));
    const unter = $("#ls-frageunter");
    const unterText = t(frage.unter, this.sprache);
    schreibe(unter, unterText);
    if (unter) unter.hidden = !unterText;

    const zurueck = $("#ls-fragenzurueck");
    if (zurueck) zurueck.hidden = this.fragen.i === 0;

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
    if (this.fragen.i + 1 >= this.fragenListe.length) { this.#analyseZeigen(); return; }
    this.fragen.i += 1;
    this.#frageZeichnen({ richtung: "vor" });
  }

  #frageZurueck() {
    if (this.fragen.i === 0) return;
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
  async #uebergeben() {
    // Der Schritt zuerst, und zwar VOR der Umleitung.
    //
    // Er ist es, an dem der Trichter einen abgeschlossenen Scan erkennt:
    // Ohne ihn stuende im Speicher weiter "captured", und wer aus dem
    // Fenster von Instagram oder TikTok zurueckkommt, faende nicht seine
    // Seite, sondern noch einmal die Namensfrage - mit allem Gedrehten und
    // Gemessenen verloren. Genau die Leute kommen aus den Anzeigen.
    //
    // Er traegt nichts ueber die Haut. "result" heisst hier: Der Fall ist
    // vollstaendig und liegt bei Dr. Gashi.
    this.sitzung.schritt("result");
    await this.sitzung.berichtAnlegen({
      name: this.zustand.name,
      sprache: this.sprache,
      photos: this.zustand.fotoAnzahl || (this.zustand.aufnahmen || []).length
    });
    globalThis.location.assign(this.sitzung.berichtPfad);
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

  #fehlerZeigen(schluessel, nochmal) {
    const kasten = $("#ls-fehler");
    if (!kasten) return;
    kasten.classList.remove("ls-verstecken");
    schreibe($("#ls-fehlertext"), this.text(schluessel));
    const knopf = $("#ls-fehlernochmal");
    schreibe(knopf, this.text("nochmal"));
    knopf.onclick = () => { kasten.classList.add("ls-verstecken"); nochmal?.(); };
  }
}

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__) {
  const start = () => new Trichter().starte();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
