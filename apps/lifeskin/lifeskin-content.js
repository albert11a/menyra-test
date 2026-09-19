// Alle Texte des Trichters.
//
// Zwei Sprachen nebeneinander, weil neunzig Prozent der Besucher aus Kosovo
// und Albanien kommen: `sq` ist die ausgelieferte Sprache, `de` die Fassung,
// gegen die geprueft wird. Wer einen Text aendert, aendert ihn hier - im
// Trichter steht keine einzige Zeichenkette.
//
// ACHTUNG, ehrlich gesagt: Die albanischen Texte sind sorgfaeltig, aber nicht
// von einem Muttersprachler. Vor dem ersten Werbeeuro muss jemand mit
// Albanisch als Erstsprache sie durchgehen - besonders die Befundtexte, die
// den Verkauf tragen. Ein holpriger Satz auf einer Seite, die medizinisch
// wirken soll, kostet mehr Vertrauen als jede Farbe es aufbaut.

import { ALTERSGRUPPEN } from "./lifeskin-catalog.js";

export const SPRACHEN = Object.freeze(["sq", "de"]);

export function t(baum, sprache = "sq") {
  if (baum === null || baum === undefined) return "";
  if (typeof baum === "string") return baum;
  return baum[sprache] ?? baum.sq ?? baum.de ?? "";
}

export function fuelle(text, werte = {}) {
  return String(text).replace(/\{(\w+)\}/g, (treffer, schluessel) =>
    Object.prototype.hasOwnProperty.call(werte, schluessel) ? String(werte[schluessel]) : treffer
  );
}

export const OBERFLAECHE = Object.freeze({
  // 01 Einstieg
  //
  // Titel und Untertitel stehen hier NICHT MEHR: Der Einstieg traegt
  // wechselnde Karten, und die stehen in EINSTIEG_KARTEN am Ende dieser
  // Datei - sie haben eine Reihenfolge, ein Zeichen und eine Standzeit und
  // sind damit mehr als eine Beschriftung.
  //
  // Was hier bleibt, ist der Knopf. Er heisst wieder, was er tut: Er
  // startet den Scan.
  einstiegKnopf: { sq: "Fillo skanimin", de: "Scan starten" },

  // 01b DER LANGE EINSTIEG - die Fassung unter /lifeskintrichter.
  //
  // WARUM ER LANG IST, obwohl der kurze Einstieg sorgfaeltig gebaut wurde:
  // Von 894 Besuchern kamen 122 an ihm vorbei. Ein Bildschirm, der in
  // zwei Saetzen sagt, worum es geht, beantwortet die Frage nicht, die
  // jemand aus einer Anzeige wirklich hat - wer ist das, was bekomme ich,
  // was kostet es, was passiert mit meinen Fotos. Wer sie nicht
  // beantwortet bekommt, geht weg, und zwar lautlos.
  //
  // Der Bildschirm ist deshalb scrollbar und der Knopf steht trotzdem
  // immer da: Wer ueberzeugt ist, tippt sofort; wer zweifelt, findet die
  // Antwort weiter unten, ohne den Knopf zu verlieren.
  //
  // DIESE SAETZE STEHEN AUCH IM AUFBAU (apps/lifeskin-trichter/index.html)
  // und zwar feststehend, damit sie mit der ersten Antwort des Servers da
  // sind statt erst nach elf Modulen. Dass beide dasselbe sagen, haelt
  // tests/lifeskin-trichter-variante.test.mjs fest - ohne diesen Test
  // waere es eine zweite Wahrheit, die still auseinanderlaeuft.
  langMarke: { sq: "ANALIZË E LËKURËS · ONLINE", de: "HAUTANALYSE · ONLINE" },
  langArztRolle: { sq: "Dermatologe", de: "Dermatologin" },
  langTitel: {
    sq: "Dr. Gashi ju thotë çfarë i duhet lëkurës suaj.",
    de: "Dr. Gashi sagt Ihnen, was Ihre Haut braucht."
  },
  langUnter: {
    sq: "Skanoni lëkurën me telefon për 60 sekonda. Fotot i shikon Dr. Violeta Gashi dhe ju merrni një përgjigje të qartë se çfarë t'i bëni lëkurës suaj.",
    de: "Scannen Sie Ihre Haut in 60 Sekunden mit dem Telefon. Die Aufnahmen sieht Dr. Violeta Gashi, und Sie bekommen eine klare Antwort, was Ihre Haut braucht."
  },
  langPunktFalas: { sq: "Falas", de: "Kostenlos" },
  langPunktOhneKonto: { sq: "Pa regjistrim", de: "Ohne Anmeldung" },
  langPunktZeit: { sq: "60 sekonda", de: "60 Sekunden" },
  // Der Hinweis, dass es weitergeht.
  //
  // Ein Bildschirm, der randvoll aussieht, wird nicht gescrollt - und
  // alles darunter ist dann umsonst geschrieben.
  langMehr: { sq: "Lëvizni poshtë", de: "Nach unten wischen" },

  langWieTitel: { sq: "Si funksionon", de: "Wie es läuft" },
  // OHNE NUMMER IM TEXT: Sie steht im Kreis davor, und zweimal dieselbe
  // Zahl nebeneinander liest sich wie ein Fehler.
  langSchritt1Titel: { sq: "Skanimi", de: "Der Scan" },
  langSchritt1Text: {
    sq: "Rrotulloni ngadalë kokën para kamerës. Fotot bëhen vetë — nuk shtypni asgjë.",
    de: "Drehen Sie den Kopf langsam vor der Kamera. Die Aufnahmen entstehen von selbst — Sie drücken nichts."
  },
  langSchritt2Titel: { sq: "Dr. Gashi i shikon", de: "Dr. Gashi sieht sie an" },
  langSchritt2Text: {
    sq: "Fotot i shikon vetëm Dr. Violeta Gashi, dermatologe.",
    de: "Die Aufnahmen sieht nur Dr. Violeta Gashi, Dermatologin."
  },
  langSchritt3Titel: { sq: "Përgjigjja juaj", de: "Ihre Antwort" },
  langSchritt3Text: {
    sq: "Merrni gjendjen e lëkurës suaj dhe hapat konkretë, në telefonin tuaj.",
    de: "Sie bekommen den Zustand Ihrer Haut und die konkreten Schritte, auf Ihr Telefon."
  },

  langNutzenTitel: { sq: "Çfarë merrni", de: "Was Sie bekommen" },
  langNutzen1: {
    sq: "Gjendjen e lëkurës suaj, e shkruar qartë",
    de: "Den Zustand Ihrer Haut, klar aufgeschrieben"
  },
  langNutzen2: {
    sq: "Çfarë i mungon lëkurës dhe çfarë e dëmton",
    de: "Was Ihrer Haut fehlt und was ihr schadet"
  },
  langNutzen3: {
    sq: "Një rutinë konkrete, hap pas hapi",
    de: "Eine konkrete Routine, Schritt für Schritt"
  },
  langNutzen4: {
    sq: "Mundësinë t'i shkruani Dr. Gashit në WhatsApp",
    de: "Die Möglichkeit, Dr. Gashi auf WhatsApp zu schreiben"
  },

  // DIE FAELLE, ZUM WISCHEN.
  //
  // Nicht mehr "ein Fall", sondern eine Reihe: Wer eine Karte weiterschiebt,
  // sieht, dass es nicht das eine vorzeigbare Beispiel ist. Die Ueberschrift
  // sagt deshalb genau, WER dort steht - Leute, die die Analyse gemacht UND
  // die Therapie durchgezogen haben. Das ist die ehrlichste Fassung des
  // Satzes und zugleich die staerkste: Sie nennt die Bedingung mit.
  langFaelleTitel: {
    sq: "Pacientët që kanë bërë analizën dhe kanë vazhduar me terapinë e rekomanduar",
    de: "Patientinnen, die die Analyse gemacht und die empfohlene Therapie durchgezogen haben"
  },
  langFaelleWischen: { sq: "Lëvizni anash", de: "Zur Seite wischen" },
  langFallVorher: { sq: "Dita 1", de: "Tag 1" },
  langFallNachher: { sq: "Dita 28", de: "Tag 28" },

  // Die Frage, die vor der Kamera wirklich jemand hat.
  langSchutzTitel: { sq: "Fotot i sheh vetëm Dr. Gashi", de: "Die Fotos sieht nur Dr. Gashi" },
  langSchutzText: {
    sq: "Asgjë nuk publikohet dhe asgjë nuk shitet. Pa regjistrim, pa email, pa pagesë.",
    de: "Nichts wird veröffentlicht und nichts weitergegeben. Ohne Anmeldung, ohne E-Mail, ohne Bezahlung."
  },

  langFragenTitel: { sq: "Pyetjet që bëhen më shpesh", de: "Häufige Fragen" },
  langFrage1: { sq: "A kushton diçka?", de: "Kostet das etwas?" },
  langAntwort1: {
    sq: "Jo. Analiza është falas dhe pa regjistrim.",
    de: "Nein. Die Analyse ist kostenlos und ohne Anmeldung."
  },
  langFrage2: { sq: "Sa zgjat?", de: "Wie lange dauert das?" },
  langAntwort2: {
    sq: "Skanimi zgjat rreth 60 sekonda. Përgjigjen e merrni pasi ta ketë parë Dr. Gashi.",
    de: "Der Scan dauert rund 60 Sekunden. Die Antwort kommt, sobald Dr. Gashi sie gesehen hat."
  },
  langFrage3: { sq: "Çfarë bëhet me fotot?", de: "Was passiert mit den Fotos?" },
  langAntwort3: {
    sq: "Ruhen në mënyrë të sigurt dhe i shikon vetëm Dr. Violeta Gashi.",
    de: "Sie werden sicher gespeichert und nur Dr. Violeta Gashi sieht sie an."
  },


  // 02 Name und Alter - GEPARKT, NICHT TOT.
  //
  // Der Namensschirm liegt nicht mehr im Weg: Er stand zwischen der Anzeige
  // und der Kamera und hat dort Besucher gekostet, ohne ihnen etwas zu
  // geben. Gefragt wird nach den Fotos, wenn der Fall schon gesichert ist.
  //
  // Die Texte bleiben deshalb hier stehen statt geloescht zu werden: Sie
  // werden fuer die kurzen Fragen nach der Aufnahme gebraucht, und eine
  // Uebersetzung, die es schon gibt, schreibt niemand gern zweimal.
  //
  // DER SATZ UEBER BEIDEN. Er steht da, weil der Bildschirm sonst aus dem
  // Nichts zwei Angaben verlangt: Wer gerade eine halbe Minute den Kopf
  // gedreht hat, soll zuerst lesen, dass dieser Teil vorbei ist.
  nameVorsatz: {
    sq: "Skanimi mbaroi. Edhe dy gjëra dhe keni mbaruar.",
    de: "Der Scan ist fertig. Noch zwei Angaben, dann sind Sie durch."
  },
  nameTitel: { sq: "Si ju quajnë?", de: "Wie heißen Sie?" },
  namePlatzhalter: { sq: "Emri juaj", de: "Ihr Vorname" },
  alterTitel: { sq: "Sa vjeç jeni?", de: "Wie alt sind Sie?" },
  alterGrund: {
    sq: "Që t'i krahasojmë vlerat tuaja me grupmoshën tuaj.",
    de: "Damit wir Ihre Werte mit Ihrer Altersgruppe vergleichen."
  },
  weiter: { sq: "Vazhdo", de: "Weiter" },

  // 02b DIE WAHL - mit Kamera oder ohne.
  //
  // DER TEUERSTE BILDSCHIRM DES GANZEN WEGS, und deshalb gibt es ihn.
  // Gemessen: 184 von 222 gingen bei "Skanimi" weg - mehr als vier von
  // fuenf. Ein Teil davon will die Kamera nicht freigeben, und fuer den
  // gab es bisher nur einen Ausgang: die Seite schliessen.
  //
  // ZWEI KARTEN, ABER NICHT ZWEI GLEICHE. Die erste ist empfohlen, und
  // das steht auch dran: Nur sie liefert Aufnahmen, und auf ihnen beruht
  // alles, was Dr. Gashi danach sagen kann. Zwei gleich aussehende
  // Karten waeren eine Frage ohne Rat - und eine Frage ohne Rat kostet
  // an dieser Stelle genau die Leute, die unsicher sind.
  wahlTitel: { sq: "Si dëshironi të vazhdoni?", de: "Wie möchten Sie weitermachen?" },
  wahlUnter: {
    sq: "Zgjidhni njërën. Të dyja ju çojnë te Dr. Gashi.",
    de: "Wählen Sie eine. Beide führen zu Dr. Gashi."
  },

  wahlScanMarke: { sq: "REKOMANDOJMË", de: "EMPFOHLEN" },
  wahlScanTitel: { sq: "Skanim i lëkurës me kamerë", de: "Hautscan mit der Kamera" },
  wahlScanText: {
    sq: "Rrotulloni ngadalë kokën para kamerës. Fotot bëhen vetë dhe i shikon vetëm Dr. Gashi.",
    de: "Drehen Sie den Kopf langsam vor der Kamera. Die Aufnahmen entstehen von selbst und sieht nur Dr. Gashi."
  },
  wahlScanPunkt: { sq: "60 sekonda · falas", de: "60 Sekunden · kostenlos" },

  wahlOhneTitel: { sq: "Vazhdoni pa skanim", de: "Ohne Scan weitermachen" },
  wahlOhneText: {
    sq: "Nëse nuk dëshironi të bëni skanimin e lëkurës, mund të vazhdoni këtu.",
    de: "Wenn Sie den Hautscan nicht machen möchten, können Sie hier weitermachen."
  },
  wahlOhnePunkt: { sq: "Pa foto", de: "Ohne Aufnahmen" },

  // 03 Vorbereitung
  vorbereitungTitel: { sq: "Tre gjëra para fotos", de: "Drei Dinge vor dem Foto" },
  // DIE ERSTE REGEL IST EINE ANWEISUNG, KEIN VERBOT.
  //
  // Hier stand "Pa grim" - kein Make-up. Das ist richtig und trotzdem die
  // falsche erste Zeile: Ein Verbot als Erstes liest sich wie eine
  // Bedingung, die man erst erfuellen muss, bevor man anfangen darf - und
  // wer gerade geschminkt ist, geht an dieser Stelle weg.
  //
  // Jetzt steht dort, was auf dem naechsten Bildschirm zu tun ist, und zwar
  // in seinen Worten: Das Gesicht gehoert in die Mitte des Rings. Das ist
  // dieselbe Form, die der Kameraschirm zeichnet - wer sie hier gesehen
  // hat, erkennt sie dort wieder und muss nicht erst begreifen, was der
  // Kreis von ihm will.
  vorbereitungMitte: {
    sq: "Fytyra në mes të rrumbullakut",
    de: "Gesicht in die Mitte des Kreises"
  },
  vorbereitungLicht: { sq: "Dritë e mirë", de: "Gutes Licht" },
  vorbereitungHoehe: { sq: "Telefoni në lartësi të syve", de: "Handy auf Augenhöhe" },
  // HIER STAND EIN KASTEN UEBER DEN DATENSCHUTZ, und er ist weg.
  //
  // Drei Zeilen Kleingedrucktes auf dem Bildschirm vor der Kamerafrage.
  // Sie beantworteten eine Frage, die an dieser Stelle niemand gestellt
  // hat, und stellten dafuer eine neue: Was passiert denn mit meinen
  // Fotos? Wer vor der Kamera zoegert, zoegert bei der Freigabe - und die
  // ist die teuerste Stelle im ganzen Weg.
  //
  // Der Satz war ausserdem nicht mehr wahr: "Die Messung laeuft auf Ihrem
  // Geraet" stimmte, solange der Trichter selbst gemessen hat. Er misst
  // nicht mehr.
  //
  // Wer die Aufnahmen sieht, steht weiter auf dem Einstieg ("Fotot i sheh
  // vetem Dr. Gashi") - vor der Entscheidung und in einem Satz.
  vorbereitungKnopf: { sq: "Hap kamerën", de: "Kamera öffnen" },

  // 04 Aufnahme
  //
  // Die vier Pruefungen sind Anzeigen geblieben, aber keine Tore mehr: Der
  // Ring laeuft weiter, auch wenn eine davon rot ist. Siehe lifeskin-pose.js.
  pruefungGesicht: { sq: "Fytyra", de: "Gesicht" },
  pruefungAbstand: { sq: "Distanca", de: "Abstand" },
  pruefungLicht: { sq: "Drita", de: "Licht" },
  pruefungRuhe: { sq: "Qëndroni qetë", de: "Ruhig halten" },
  aufnahmeGleich: { sq: "Mos lëvizni…", de: "Nicht bewegen…" },
  aufnahmeHinweisNah: { sq: "Pak më larg", de: "Etwas weiter weg" },
  aufnahmeHinweisFern: { sq: "Pak më afër", de: "Etwas näher" },
  aufnahmeHinweisDunkel: { sq: "Kërkoni dritë më të mirë", de: "Suchen Sie besseres Licht" },
  aufnahmeHinweisHell: { sq: "Shumë dritë e drejtpërdrejtë", de: "Zu viel direktes Licht" },
  // Der Knopf unter der Kamera.
  //
  // Er hiess "Bëj foton" und war als Rueckfallweg gemeint. Gelesen wurde er
  // als Anweisung: Wer ihn sieht, glaubt, er muesse selbst ausloesen - und
  // haelt still, statt den Kopf zu drehen. Eine Frage haelt niemanden auf.
  kameraHilfeKnopf: { sq: "Si funksionon?", de: "Wie läuft das?" },
  kameraHilfeTitel: { sq: "Si funksionon?", de: "Wie läuft das?" },
  kameraHilfeText: {
    sq: "Nuk keni nevojë të shtypni asgjë. Rrotulloni ngadalë kokën në rreth — fotot bëhen vetë, kur pozicioni është i saktë.",
    de: "Sie müssen nichts drücken. Drehen Sie den Kopf langsam im Kreis — die Aufnahmen entstehen von selbst, sobald die Haltung stimmt."
  },
  kameraHilfeNotText: {
    sq: "Nuk mund ta rrotulloni kokën? Vazhdoni me pamjet e matura deri tani.",
    de: "Sie können den Kopf nicht drehen? Machen Sie mit dem weiter, was bis jetzt vermessen wurde."
  },
  kameraHilfeNotKnopf: { sq: "Vazhdo kështu", de: "So weitermachen" },
  kameraHilfeZu: { sq: "E kuptova", de: "Verstanden" },

  // Der Satz, solange die Kamera noch aufgeht.
  //
  // GEMESSEN, NICHT GESCHAETZT: Bis das erste Bild kam, stand hier gar
  // nichts - ein leerer Kreis auf einer leeren Seite. Auf einem Geraet, das
  // mit dem Oeffnen ein paar Sekunden braucht, sieht das nicht nach
  // "laedt" aus, sondern nach kaputt, und genau dort steigt jemand aus.
  kameraOeffnet: { sq: "Po hapet kamera…", de: "Die Kamera wird geöffnet…" },

  // Quer gehalten geht der Trichter nicht.
  //
  // GEMESSEN: Die Buehne der Kamera ist so hoch wie das Fenster breit. Auf
  // einem quer gehaltenen iPhone (844x390) wird sie 804 Pixel hoch - der
  // Hinweistext liegt dann bei 865 und der Knopf bei 907, beide unterhalb
  // des Bildschirms. Zu sehen ist die obere Kappe eines riesigen Kreises,
  // und weiter geht es nicht.
  //
  // Eine Bitte und kein Fehler: Der Besucher hat nichts falsch gemacht, er
  // haelt nur das Telefon anders. Deshalb steht hier, was zu tun ist, und
  // nicht, was nicht geht.
  querTitel: { sq: "Ktheni telefonin vertikalisht", de: "Bitte das Telefon aufrecht halten" },
  querText: {
    sq: "Skanimi i lëkurës bëhet vetëm me telefonin drejt.",
    de: "Der Hautscan geht nur mit aufrecht gehaltenem Telefon."
  },

  // 04b Der Ring
  //
  // Eine Anweisung, nie eine Fehlermeldung. Der Ring kennt kein Scheitern,
  // nur "noch nicht ganz herum" - und die Texte muessen das halten.
  ringEinmessen: {
    sq: "Vendoseni fytyrën në rreth dhe qëndroni qetë.",
    de: "Bringen Sie Ihr Gesicht in den Kreis und halten Sie kurz still."
  },
  ringDrehen: {
    sq: "Rrotulloni kokën ngadalë në rreth.",
    de: "Drehen Sie den Kopf langsam im Kreis."
  },
  ringWeiter: { sq: "Vazhdoni kështu…", de: "Weiter so…" },
  ringFastFertig: { sq: "Edhe pak…", de: "Nur noch ein Stück…" },
  ringFertig: { sq: "Gati.", de: "Fertig." },
  // WENN DAS BILD WANDERT STATT DES KOPFES.
  //
  // Der haeufigste Grund, warum der Ring nicht zugeht: Das Handy wird
  // mitgefuehrt, der Kopf bleibt stehen. Aus Sicht der Kamera dreht sich
  // dann nichts - und der Satz muss beides sagen, das Lassen und das Tun.
  ringRuhig: {
    sq: "Mbajeni telefonin qetë — rrotulloni kokën",
    de: "Handy ruhig halten — den Kopf drehen"
  },
  // Der Ring ist zu, aber das gerade Bild fehlt noch. Ohne diesen Satz stand
  // dort "Gati." und der Scan wartete auf eine Haltung, die er nicht nannte.
  ringGeradeaus: {
    sq: "Edhe një herë drejt në kamerë.",
    de: "Noch einmal gerade in die Kamera schauen."
  },
  // Der Satz fuer den, bei dem sich nichts bewegt. Er nennt den Ausweg, statt
  // die Anweisung ein viertes Mal zu wiederholen.
  ringOhneBewegung: {
    sq: "Nëse nuk mund ta rrotulloni kokën, prekni «Si funksionon?».",
    de: "Wenn Sie den Kopf nicht drehen können, tippen Sie auf «Wie läuft das?»."
  },
  ringZurueck: {
    sq: "Kthejeni fytyrën te rrethi.",
    de: "Zurück in den Kreis."
  },
  ringGlanz: { sq: "Shkëlqimi", de: "Glanz" },
  ringRoetung: { sq: "Skuqja", de: "Rötung" },
  // Hautton statt Textur.
  //
  // Die drei Kacheln laufen waehrend der Aufnahme mit und muessen darum
  // Werte zeigen, die bei JEDER Aufloesung im Bild stehen. Textur braucht
  // 0,25 mm je Bildpunkt; auf einem schwaecheren Geraet blieb die Kachel
  // auf "wird gemessen" stehen, und das sieht aus, als haenge die Seite.
  // Glanz, Roetung und Hautton sind flaechig und immer da.
  ringHautton: { sq: "Toni i lëkurës", de: "Hautton" },
  ringWartet: { sq: "po matet…", de: "wird gemessen…" },

  // 05 Analyse
  // Der Ladebildschirm sagt, was WIR tun - nicht, was eine Aerztin tut.
  //
  // Hier stand "Roetung wird analysiert", "Ihre Pflegeroutine wird
  // zusammengestellt". Beides war ein Versprechen, das die Software gar
  // nicht einloesen soll: Analysiert wird von Dr. Gashi, und die Routine
  // stellt sie zusammen. Was hier laeuft, ist die Aufbereitung der
  // Aufnahmen.
  analyseZonen: { sq: "Po njihen zonat e fytyrës…", de: "Gesichtszonen werden erkannt…" },
  analyseTzone: { sq: "Po përgatiten fotot…", de: "Aufnahmen werden aufbereitet…" },
  analyseRoetung: { sq: "Po kontrollohet cilësia e fotos…", de: "Bildqualität wird geprüft…" },
  analyseTextur: { sq: "Po zgjidhen tri fotot më të mira…", de: "Die drei besten Aufnahmen werden gewählt…" },
  analyseVergleich: {
    sq: "Po ruhet skanimi juaj…",
    de: "Ihr Scan wird gespeichert…"
  },
  analyseRoutine: {
    sq: "Po dërgohet te Dr. Gashi…",
    de: "Wird an Dr. Gashi übergeben…"
  },

  // 06 Befund
  // Der Ergebnisbildschirm sagt jetzt, dass die Aufnahmen fertig sind - nicht
  // mehr, was gemessen wurde. Der Befund kommt von Dr. Gashi.
  befundTitel: { sq: "{name}, skanimi juaj është gati.", de: "{name}, Ihr Scan ist fertig." },
  akteMarke: { sq: "Numri i skanimit tuaj", de: "Ihre Fallnummer" },
  // Nach einer Rueckkehr. Kein "willkommen zurueck" - das klingt nach einer
  // App. Ein Satz, der sagt: nichts ist verloren.
  akteZurueck: {
    sq: "{name}, skanimi juaj është ende këtu.",
    de: "{name}, Ihr Scan ist noch da."
  },

  // ---- Der WhatsApp-Knopf ----
  //
  // Die drei Sekunden vor dem Tippen entscheiden alles. Wer weiss, was
  // gleich passiert, laesst sich vom Systemhinweis "In WhatsApp oeffnen?"
  // nicht stoeren. Wer es nicht weiss, bricht dort ab.
  //
  // Deshalb steht die App im Knopf ("WhatsApp oeffnen" statt "Kontakt
  // aufnehmen") und darunter der Satz, der die groesste Sorge nimmt: Er
  // muss nichts formulieren.
  waKnopf: { sq: "Hape WhatsApp-in", de: "WhatsApp öffnen" },
  waUnterKnopf: {
    sq: "Mesazhi është shkruar tashmë. Ju vetëm e dërgoni.",
    de: "Ihre Nachricht ist schon geschrieben. Sie tippen nur auf Senden."
  },
  // Wer nicht ohne Antwort klickt, bekommt sie - Ausweichen zerstoert
  // Vertrauen schneller als jede unbequeme Wahrheit.
  waWasPassiert: { sq: "Çfarë ndodh pastaj?", de: "Was passiert dann?" },
  waWasPassiertText: {
    sq: "WhatsApp hapet me mesazhin tuaj gati. Ju e dërgoni — dhe Dr. Gashi i sheh fotot tuaja. Pa pagesë. Ju mund të bllokoni bisedën në çdo moment.",
    de: "WhatsApp öffnet sich mit Ihrer fertigen Nachricht. Sie senden sie — und Dr. Gashi sieht Ihre Aufnahmen. Kostenlos. Sie können das Gespräch jederzeit beenden."
  },
  // Nach der Rueckkehr auf die Seite. Einmal, ruhig, keine Mahnung.
  waZurueckFrage: { sq: "E dërguat mesazhin?", de: "Nachricht abgeschickt?" },
  waZurueckJa: { sq: "Po, e dërgova", de: "Ja, abgeschickt" },
  waZurueckNein: { sq: "Jo — më mirë lini numrin", de: "Nein — lieber Nummer hinterlassen" },
  waDanke: {
    sq: "Faleminderit. Dr. Gashi ju përgjigjet sot.",
    de: "Danke. Dr. Gashi antwortet Ihnen heute."
  },
  // Der zweite Weg, fuer alle ohne WhatsApp oder mit zu viel Vorsicht.
  waNummerKnopf: { sq: "Nuk keni WhatsApp? Lini numrin", de: "Kein WhatsApp? Nummer hinterlassen" },
  waNummerGesendet: { sq: "Faleminderit — Dr. Gashi ju shkruan.", de: "Danke — Dr. Gashi schreibt Ihnen." },
  // Die vier Zeilen der Aktenkarte. Die ersten drei sind erledigt, die
  // vierte ist offen - und das ist keine Masche, sondern der Sachverhalt.
  akteAufnahmen: { sq: "{anzahl} foto të bëra", de: "{anzahl} Aufnahmen gemacht" },
  akteZonen: { sq: "5 zona të matura", de: "5 Zonen vermessen" },
  akteGespeichert: { sq: "Skanimi u ruajt", de: "Scan gespeichert" },
  akteOffen: { sq: "Analiza nga Dr. Gashi", de: "Die Analyse von Dr. Gashi" },
  akteOffenHinweis: {
    sq: "Ky është hapi i fundit. Dr. Gashi ende nuk ka si t'ju përgjigjet.",
    de: "Das ist der letzte Schritt. Dr. Gashi hat noch keine Möglichkeit, Ihnen zu antworten."
  },
  aufnahmenText: {
    sq: "Dr. Gashi i shikon vetë fotot tuaja dhe ju thotë çfarë ka lëkura juaj — dhe çfarë i duhet.",
    de: "Dr. Gashi sieht sich Ihre Aufnahmen selbst an und sagt Ihnen, was Ihre Haut hat — und was sie braucht."
  },
  aufnahmenGerade: { sq: "Ballë", de: "Gerade" },
  aufnahmenRechts: { sq: "Djathtas", de: "Nach rechts" },
  aufnahmenLinks: { sq: "Majtas", de: "Nach links" },
  aufnahmenKein: {
    sq: "Skanimi u krye. Dr. Gashi i shikon fotot tuaja.",
    de: "Der Scan ist fertig. Dr. Gashi sieht sich Ihre Aufnahmen an."
  },
  befundGut: { sq: "Kjo është e mirë", de: "Das ist gut" },
  befundBeachten: { sq: "Kjo kërkon vëmendje", de: "Das braucht Aufmerksamkeit" },

  // Der Schwerpunkt: der Punkt, der bei diesem Gesicht am staerksten
  // ausgepraegt ist - auch wenn er keine Stufe erreicht.
  //
  // ACHTUNG BEIM UMFORMULIEREN. Der Satz darf nicht behaupten, dass etwas
  // nicht in Ordnung sei. Er sagt, was im Vergleich zum Rest DIESES Gesichts
  // am meisten hervortritt, und das ist wahr. "Sie haben ein Problem mit X"
  // waere es nicht - und es faellt beim ersten Kunden auf, der zum Arzt geht
  // und dort das Gegenteil hoert.
  befundSchwerpunkt: {
    sq: "Këtu ia vlen të kujdeseni",
    de: "Hier lohnt sich Pflege"
  },
  befundSchwerpunktText: {
    sq: "Krahasuar me pjesën tjetër të fytyrës suaj, kjo del më shumë në pah. Nuk është problem — por është pika ku kujdesi bën ndryshimin më të madh.",
    de: "Verglichen mit dem Rest Ihres Gesichts tritt das am stärksten hervor. Kein Problem — aber der Punkt, an dem Pflege den größten Unterschied macht."
  },
  befundWhatsApp: { sq: "Merre rezultatin në WhatsApp", de: "Befund per WhatsApp erhalten" },
  befundWeiter: { sq: "Çfarë i duhet lëkurës sime", de: "Was meine Haut braucht" },

  // 07 Empfehlung
  empfehlungTitel: { sq: "Çfarë i duhet lëkurës suaj tani", de: "Was Ihre Haut jetzt braucht" },
  empfehlungWegen: { sq: "për {befund} tuaj", de: "für Ihre {befund}" },
  // Wenn kein Befund ausloest, wird nicht einer erfunden, damit der Satz
  // voller klingt. Erhaltung ist ein ehrlicher Grund - und bei guter Haut
  // der einzige richtige.
  empfehlungErhaltung: {
    sq: "për të ruajtur lëkurën tuaj",
    de: "zur Erhaltung Ihres Hautbildes"
  },
  befundOhneMangel: {
    sq: "Lëkura juaj është në gjendje të mirë. Këto dy produkte e mbajnë ashtu.",
    de: "Ihre Haut ist in gutem Zustand. Diese zwei Produkte halten sie so."
  },
  routineMorgens: { sq: "Në mëngjes", de: "Morgens" },
  routineAbends: { sq: "Në mbrëmje", de: "Abends" },

  // 08 Angebot
  angebotTitel: { sq: "Seti i {name}", de: "{name}s Set" },
  angebotEinzeln: { sq: "Veç e veç", de: "Einzeln" },
  angebotZusammen: { sq: "Së bashku", de: "Zusammen" },
  angebotSpart: { sq: "Kurseni {betrag} €", de: "Sie sparen {betrag} €" },
  angebotProTag: {
    sq: "{tage} javë kujdes — {preis} € në ditë",
    de: "{tage} Wochen Pflege — {preis} € pro Tag"
  },
  angebotNachnahme: {
    sq: "Paguani vetëm kur ta keni në dorë.",
    de: "Sie bezahlen erst, wenn Sie es in der Hand halten."
  },
  angebotRueckgabe: {
    sq: "{tage} ditë e drejtë kthimi. Nuk jeni të kënaqur? Paratë mbrapsht.",
    de: "{tage} Tage Rückgaberecht. Nicht zufrieden? Geld zurück."
  },
  angebotLieferung: { sq: "Te ju për {von}–{bis} ditë", de: "In {von}–{bis} Tagen bei Ihnen" },
  angebotKnopf: { sq: "Porosit — paguaj në dorëzim", de: "Bestellen — zahlen bei Lieferung" },
  angebotAblehnen: { sq: "Jo tani", de: "Jetzt nicht" },

  // Rückfall beim Ablehnen
  rueckfallTitel: { sq: "Vetëm një produkt?", de: "Nur ein Produkt?" },
  rueckfallText: {
    sq: "Nëse seti është shumë, filloni me atë që lëkura juaj ka më shumë nevojë.",
    de: "Wenn das Set zu viel ist, beginnen Sie mit dem, was Ihre Haut am dringendsten braucht."
  },

  // 09 Anschrift
  anschriftTitel: { sq: "Ku ta dërgojmë?", de: "Wohin sollen wir liefern?" },
  feldName: { sq: "Emri dhe mbiemri", de: "Vor- und Nachname" },
  feldStrasse: { sq: "Rruga dhe numri", de: "Straße und Hausnummer" },
  feldOrt: { sq: "Qyteti", de: "Stadt" },
  feldPlz: { sq: "Kodi postar", de: "Postleitzahl" },
  feldTelefon: { sq: "Numri i telefonit", de: "Telefonnummer" },
  telefonGrund: {
    sq: "Për të koordinuar dorëzimin.",
    de: "Für die Abstimmung der Lieferung."
  },
  bestellKnopf: { sq: "Porosit tani", de: "Jetzt bestellen" },
  bestellLaeuft: { sq: "Po dërgohet…", de: "Wird gesendet…" },

  // 10 Danke
  dankeTitel: { sq: "Faleminderit, {name}!", de: "Danke, {name}!" },
  dankeNummer: { sq: "Porosia nr. {nummer}", de: "Bestellung Nr. {nummer}" },
  dankeText: {
    sq: "Ju kontaktojmë para dorëzimit. Paguani kur ta merrni në dorë.",
    de: "Wir melden uns vor der Lieferung. Sie zahlen bei Erhalt."
  },
  dankeWiederholung: {
    sq: "Bëjeni testin sërish pas 4 javësh dhe shihni përparimin tuaj.",
    de: "Machen Sie den Test in 4 Wochen erneut und sehen Sie Ihren Fortschritt."
  },

  // Fehler - sagen, was los ist und was zu tun ist. Nie nur "Fehler".
  fehlerKamera: {
    sq: "Nuk arritëm të hapim kamerën. Lejoni qasjen në kamerë dhe provoni sërish.",
    de: "Die Kamera ließ sich nicht öffnen. Erlauben Sie den Kamerazugriff und versuchen Sie es erneut."
  },
  fehlerKameraErlaubnis: {
    sq: "Lejoni kamerën te cilësimet e kësaj faqeje dhe provoni sërish. Nëse jeni brenda Instagram, Facebook ose TikTok, hapeni këtë faqe në Safari ose Chrome nga menyja e aplikacionit.",
    de: "Erlauben Sie die Kamera in den Einstellungen dieser Website und versuchen Sie es erneut. In Instagram, Facebook oder TikTok öffnen Sie diese Seite über das App-Menü in Safari oder Chrome."
  },
  fehlerKameraBrowser: {
    sq: "Ky shfletues nuk e mundëson kamerën. Hapeni këtë faqe në Safari ose Chrome nga menyja e aplikacionit.",
    de: "Dieser Browser stellt keine Kamera bereit. Öffnen Sie diese Seite über das App-Menü in Safari oder Chrome."
  },
  fehlerKameraFehlt: {
    sq: "Nuk u gjet kamerë në këtë pajisje. Hapeni faqen në një telefon me kamerë.",
    de: "Auf diesem Gerät wurde keine Kamera gefunden. Öffnen Sie die Seite auf einem Telefon mit Kamera."
  },
  fehlerKameraBelegt: {
    sq: "Kamera nuk është e lirë. Mbyllni aplikacionet e tjera që e përdorin dhe provoni sërish.",
    de: "Die Kamera ist gerade nicht verfügbar. Schließen Sie andere Apps, die sie verwenden, und versuchen Sie es erneut."
  },
  fehlerKameraWartet: {
    sq: "Kamera nuk u përgjigj. Pranoni kërkesën për kamerën dhe provoni sërish. Nëse kërkesa nuk shfaqet, hapeni faqen në Safari ose Chrome.",
    de: "Die Kamera hat nicht geantwortet. Bestätigen Sie die Kameraanfrage und versuchen Sie es erneut. Erscheint keine Anfrage, öffnen Sie die Seite in Safari oder Chrome."
  },
  fehlerKameraBild: {
    sq: "Kamera nuk po dërgon pamje. Provoni sërish; nëse pamja mbetet e ngrirë, hapeni faqen në Safari ose Chrome.",
    de: "Die Kamera liefert kein laufendes Bild. Versuchen Sie es erneut; bleibt das Bild stehen, öffnen Sie die Seite in Safari oder Chrome."
  },
  fehlerKameraUnterbrochen: {
    sq: "Kamera u ndërpre. Shtypni «Provo sërish» për ta hapur dhe për ta përsëritur skanimin.",
    de: "Die Kamera wurde unterbrochen. Tippen Sie auf „Erneut versuchen“, um sie zu öffnen und den Scan zu wiederholen."
  },
  fehlerScanStillstand: {
    sq: "Skanimi nuk po përparon. Mbani fytyrën në rreth, kërkoni dritë të njëtrajtshme dhe provoni sërish.",
    de: "Der Scan kommt nicht weiter. Halten Sie das Gesicht in den Kreis, sorgen Sie für gleichmäßiges Licht und versuchen Sie es erneut."
  },
  fehlerKeinGesicht: {
    sq: "Nuk po dallojmë fytyrë. Kërkoni dritë më të mirë dhe mbani telefonin në lartësi të syve.",
    de: "Wir erkennen kein Gesicht. Suchen Sie besseres Licht und halten Sie das Handy auf Augenhöhe."
  },
  fehlerBestellung: {
    sq: "Porosia nuk u dërgua. Kontrolloni internetin dhe provoni sërish — të dhënat tuaja janë ruajtur.",
    de: "Die Bestellung ging nicht raus. Prüfen Sie die Verbindung und versuchen Sie es erneut — Ihre Eingaben sind gespeichert."
  },
  nochmal: { sq: "Provo sërish", de: "Erneut versuchen" }
});

// Die Zeile unter dem Knopf.
//
// Hier stand der Haftungshinweis - drei Saetze, gesetzt wie Kleingedrucktes,
// als Erstes, was jemand nach dem Knopf liest. Auf dem ersten Bildschirm
// beantwortet er eine Frage, die noch niemand gestellt hat, und beantwortet
// dafuer nicht die, die jeder hat: Was passiert, wenn ich hier tippe?
//
// Jetzt steht genau das da. Was der Scan ist und was nicht, sagt die Seite
// weiter - im Befund und an der Stelle, an der jemand eine Aussage ueber
// seine Haut liest.
export const EINSTIEG_HINWEIS = Object.freeze({
  sq: "Shtypni butonin për të bërë skanimin e lëkurës suaj.",
  de: "Tippen Sie auf den Knopf, um Ihre Haut zu scannen."
});

// Die wechselnden Karten des Einstiegs.
//
// WARUM UEBERHAUPT WECHSELNDE KARTEN. Der Einstieg trug einen Satz, und der
// musste alles auf einmal sagen: was es ist, wer es macht, was es kostet.
// Ein Satz, der drei Dinge sagt, sagt keines davon - und genau dieser
// Bildschirm hat 772 von 894 Besuchern verloren.
//
// Zwei Karten sagen zwei Dinge nacheinander:
//
//   1. Was ist das hier?   -> Ihre Hautanalyse, online.
//   2. Wer macht das?      -> Dr. Gashi, mit Gesicht. Und was es kostet.
//
// Der Bildschirm selbst bleibt dabei ruhig: Es bewegt sich nichts, es wird
// nur weich ueberblendet. Aufbau, Schriftgroessen und der Knopf sind
// dieselben wie vorher - nur der Text darueber wechselt.
//
// DER ZEILENUMBRUCH IST TEIL DES TEXTES. "\n" trennt zwei Zeilen, die
// zusammengehoeren; wo er steht, entscheidet der Satz und nicht die Breite
// des Geraets. Ohne ihn bricht der Browser dort um, wo gerade Platz ist,
// und "Bëni analizën tuaj online" liest sich dann auf jedem Telefon anders.
//
// DIE STANDZEIT IST JE KARTE EIGEN und nicht eine Zahl fuer alle: Karte 2
// hat eine Zeile mehr und braucht laenger als Karte 1. Eine gemeinsame Zahl
// waere fuer die eine zu kurz und fuer die andere zu lang - und zu kurz
// heisst: nicht gelesen. tests/lifeskin-einstieg.test.mjs rechnet nach.
//
// LEER BEDEUTET AUS, wie ueberall hier: ohne `bild` kein Bild, ohne
// `zeichen` kein Zeichen, und bei einer einzigen Karte wird nicht
// gewechselt.
// DIE AERZTIN ZUERST.
//
// Vorher stand "Machen Sie Ihre Hautanalyse online" auf der ersten Karte
// und Dr. Gashi auf der zweiten. Das ist die falsche Reihenfolge fuer den
// ersten Blick: Wer aus einer Anzeige kommt, sieht zuerst ein Angebot -
// und Angebote gibt es viele. Ein Gesicht mit Namen und Titel ist das
// Einzige auf diesem Bildschirm, das ein anderer nicht auch behaupten
// kann.
//
// Und der Satz, der die Hemmung nimmt (kostenlos, ohne Anmeldung), steht
// damit gleich in der ersten Sekunde da statt erst nach dreieinhalb.
export const EINSTIEG_KARTEN = Object.freeze([
  {
    bild: true,
    dauerMs: 4600,
    titel: {
      sq: "Dr. Gashi ju thotë\nçfarë i duhet lëkurës suaj.",
      de: "Dr. Gashi sagt Ihnen,\nwas Ihre Haut braucht."
    },
    // Der Preis steht bei der Person, die ihn nicht verlangt - und nicht
    // als Versprechen im luftleeren Raum.
    unter: {
      sq: "Analiza është falas dhe pa regjistrim",
      de: "Die Analyse ist kostenlos und ohne Anmeldung"
    },
    unterZeichen: "badge-check"
  },
  {
    // Das Zeichen steht ueber dem Text, wo auf der Aerztinnenkarte das
    // Gesicht steht - derselbe Platz, damit beim Wechsel nichts springt.
    zeichen: "scan-face",
    bild: false,
    dauerMs: 3400,
    titel: {
      sq: "Bëni analizën tuaj\nonline të lëkurës",
      de: "Machen Sie Ihre Hautanalyse\nonline"
    }
  }
]);

export const ARZT_BILD = "/apps/lifeskin/dr-gashi.jpg";
export const ARZT_NAME = "Dr. Violeta Gashi";


// ---------- Die kurzen Fragen nach der Aufnahme ----------
//
// WARUM SIE HIER STEHEN UND NICHT VOR DER KAMERA.
//
// Alles, was vor den Fotos steht, kostet Besucher, ohne ihnen etwas zu
// geben - der Namensschirm hat das bewiesen. Hier ist der Fall schon
// gesichert: Die Bilder gehen im Hintergrund hinaus, waehrend gefragt wird.
// Die Fragen fuellen die Wartezeit, statt sie zu verlaengern.
//
// VIER FRAGEN, NICHT MEHR. Ein frueherer Entwurf hatte sieben und
// verzweigte je nach Anliegen - eine eigene Frage, um knotige Akne von
// entzuendeter zu trennen, eine, um Melasma von Flecken nach Pickeln zu
// scheiden. Das ist medizinisch richtig und hier trotzdem falsch: Der
// Trichter stellt keine Diagnose, das tut Dr. Gashi aus Foto UND Antworten.
// Was er liefern muss, ist das Anliegen - und jede Frage darueber hinaus
// kostet Abschluesse.
//
// WAS JEDE FRAGE ENTSCHEIDET:
//
//   anliegen  welches Set (siehe _setet_e_zakonshme in PRODUKTET_V2.json)
//             und den Satz, den der Befund in synimi_28 beantwortet
//   mosha     die Vergleichsgruppe im Befund
//   lekura    ob die Therapie mit einem Wirkstoff anfangen darf
//   kujdesi   die beiden Kombinationen, bei denen es wirklich schiefgehen
//             kann: Benzoylperoxid auf Isotretinoin, Wirkstoffe in der
//             Schwangerschaft. Sie halten den Verkauf NICHT auf - sie
//             lenken ihn auf das vertraegliche Set.
//
// Jede Antwort wird sofort geschrieben. Wer bei Frage drei aufhoert,
// hinterlaesst trotzdem zwei.
export const FRAGEN = Object.freeze([
  {
    id: "anliegen",
    hoechstens: 2,
    titel: {
      sq: "Çka ju shqetëson më së shumti?",
      de: "Was stört Sie am meisten?"
    },
    unter: { sq: "Zgjidhni deri në dy", de: "Bis zu zwei auswählen" },
    antworten: [
      { id: "pucrrat", text: { sq: "Puçrrat", de: "Pickel" } },
      // Poren und Glanz getrennt, obwohl beide zum selben Set fuehren: Es
      // sind zwei verschiedene Beschwerden, und wer sie in eine Zeile
      // packt, erfaehrt nie, welche der beiden die Leute wirklich stoert.
      { id: "poret", text: { sq: "Poret e mëdha", de: "Große Poren" } },
      { id: "shkelqimi", text: { sq: "Shkëlqimi", de: "Glanz" } },
      { id: "njollat", text: { sq: "Njollat e errëta", de: "Dunkle Flecken" } },
      { id: "skuqja", text: { sq: "Skuqja edhe ndjeshmëria", de: "Rötung und Empfindlichkeit" } },
      { id: "thate", text: { sq: "Lëkura e thatë", de: "Trockene Haut" } },
      // Dafuer gibt es kein eigenes Mittel. Die Antwort bleibt trotzdem
      // stehen: Sie wegzulassen zwingt diese Leute zu einer falschen, und
      // eine falsche Antwort verdirbt den Befund. Gelenkt wird auf das
      // Barriere-Set - und der Befundtext darf dann nichts gegen
      // Hautalterung versprechen, sondern nur, was es wirklich tut.
      { id: "rrudhat", text: { sq: "Rrudhat edhe elasticiteti", de: "Falten und Elastizität" } },
      // DER AUSWEG, OHNE DEN DIESE FRAGE AUF DEM WEG OHNE SCAN NICHT
      // STEHEN DARF.
      //
      // Nach dem Scan liegen Bilder vor: Wer dort nichts anzukreuzen
      // weiss, kostet die Analyse wenig, denn Dr. Gashi sieht sein
      // Gesicht. Ohne Scan sieht sie gar nichts - und dann ist eine
      // geratene Antwort schlimmer als gar keine, weil sie in den Prompt
      // geht und dort wie eine Auskunft aussieht.
      //
      // Alleinstehend wie "Asnjëra" bei der Frage danach: "weiss nicht UND
      // dunkle Flecken" waere keine Antwort, sondern ein Widerspruch.
      // Und ZULETZT, nicht zuerst: Ein Ausweg, der oben steht, wird zum
      // schnellsten Weg durch die Frage.
      { id: "nukEdi", alleine: true, text: { sq: "Nuk e di", de: "Weiß ich nicht" } }
    ]
  },
  {
    id: "mosha",
    // Die Gruppen kommen aus dem Katalog, nicht von Hand: Der Befund
    // vergleicht gegen dieselbe Einteilung.
    titel: { sq: "Sa vjeç jeni?", de: "Wie alt sind Sie?" },
    antworten: ALTERSGRUPPEN.map((gruppe) => ({ id: gruppe, text: gruppe })),
    spalten: 3
  },
  {
    id: "lekura",
    // HIER STAND EINMAL "tërhiqet" - die Haut "zieht", woertlich aus dem
    // Deutschen. Auf Albanisch ergibt das keinen Sinn, und niemand haette
    // gewusst, was gemeint ist. Jetzt die vier Begriffe, die jeder kennt.
    titel: { sq: "Qysh e ndjeni lëkurën?", de: "Wie fühlt sich Ihre Haut an?" },
    antworten: [
      { id: "thate", text: { sq: "E thatë", de: "Trocken" } },
      { id: "normale", text: { sq: "Normale", de: "Normal" } },
      { id: "yndyrshme", text: { sq: "E yndyrshme, shkëlqen", de: "Fettig, glänzt" } },
      { id: "perzier", text: { sq: "E përzier", de: "Mischhaut" } }
    ]
  },
  {
    // WIE LANGE SCHON - die Frage, die der Blick aufs Foto nicht
    // beantwortet.
    //
    // Sie steht hier, weil sie auf dem Weg OHNE Scan gebraucht wird: Dort
    // hat Dr. Gashi kein Bild, und "seit zwei Wochen" und "seit sechs
    // Jahren" sind bei derselben Beschwerde zwei verschiedene Faelle -
    // der eine ist ein Anlass, der andere ein Verlauf.
    //
    // Vier Antworten zum Antippen, keine Zahl zum Tippen: "Sa muaj?"
    // waere ein Feld, und ein Feld ist auf dem Telefon eine Tastatur.
    id: "kohezgjatja",
    titel: { sq: "Prej sa kohe e keni?", de: "Seit wann haben Sie das?" },
    antworten: [
      { id: "jave", text: { sq: "Disa javë", de: "Einige Wochen" } },
      { id: "muaj", text: { sq: "Disa muaj", de: "Einige Monate" } },
      { id: "vit", text: { sq: "Mbi një vit", de: "Über ein Jahr" } },
      // Das ist keine Dauer, sondern ein Muster - und fuer die Therapie
      // der wichtigste der vier Faelle: Was kommt und geht, hat einen
      // Ausloeser, und danach fragt Dr. Gashi dann im Gespraech.
      { id: "vjenShkon", text: { sq: "Vjen e shkon", de: "Kommt und geht" } }
    ]
  },
  {
    id: "kujdesi",
    hoechstens: 3,
    titel: {
      sq: "A ju përket ndonjëra prej këtyre?",
      de: "Trifft etwas davon zu?"
    },
    unter: { sq: "Mund të zgjidhni disa", de: "Mehrfach möglich" },
    antworten: [
      // "Keines davon" schliesst die anderen aus und umgekehrt - sonst
      // steht im Fall "nichts davon UND schwanger", und die Aerztin muss
      // raten, was gemeint war.
      { id: "asnjera", alleine: true, text: { sq: "Asnjëra", de: "Nichts davon" } },
      { id: "shtatzeni", text: { sq: "Jam shtatzënë ose jap gji", de: "Schwanger oder stillend" } },
      {
        id: "izotretinoin",
        text: {
          sq: "Marr Roaccutane (izotretinoin), tash ose 6 muajt e fundit",
          de: "Roaccutane (Isotretinoin), jetzt oder in den letzten 6 Monaten"
        }
      },
      {
        id: "trajtim",
        text: { sq: "Jam në trajtim te mjeku për lëkurën", de: "In ärztlicher Behandlung wegen der Haut" }
      }
    ]
  },
  {
    // DER NAME STEHT ZULETZT, und das ist kein Zufall.
    //
    // Er ist das Einzige, was getippt werden muss - alles davor ist
    // Antippen. Eine Tastatur am Anfang ist eine Huerde, eine Tastatur am
    // Ende ist der letzte Schritt vor dem Ergebnis, und den geht fast
    // jeder, der bis hierhin gekommen ist.
    //
    // Und er steht hinter den Fragen, nicht davor: Wer seinen Namen
    // hinterlaesst, hat schon vier Antworten gegeben. Wer ihn vorher geben
    // soll, hat noch nichts.
    id: "emri",
    typ: "text",
    titel: { sq: "Si quheni?", de: "Wie heißen Sie?" },
    unter: {
      sq: "Që Dr. Gashi t'ju drejtohet me emër",
      de: "Damit Dr. Gashi Sie mit Namen anspricht"
    },
    platzhalter: { sq: "Emri juaj", de: "Ihr Vorname" }
  },
  {
    // DIE NUMMER, UND ZWAR HIER - nicht erst auf der Warteseite.
    //
    // Von 32 fertigen Analysen haben 13 ihren Befund gesehen: genau die
    // 13, die erreichbar waren. Auf der Warteseite war die Nummer ein
    // Angebot, und ein Angebot schlaegt man aus. Hier ist sie ein Schritt
    // im Weg, wie der Name auch - und ohne sie geht es nicht weiter, weil
    // ohne sie der ganze Scan umsonst war.
    id: "numri",
    typ: "tel",
    titel: { sq: "Numri juaj i telefonit", de: "Ihre Telefonnummer" },
    unter: {
      sq: "Që Dr. Gashi t'ju njoftojë kur analiza të jetë gati",
      de: "Damit Dr. Gashi Bescheid gibt, wenn die Analyse fertig ist"
    },
    platzhalter: { sq: "044 123 456", de: "044 123 456" }
  }
]);


// ---------- Welche Fragen auf welchem Weg gestellt werden ----------
//
// FRAGEN ist seit dem zweiten Weg der VORRAT und nicht mehr die Strecke.
// Gestellt wird je Weg eine eigene Auswahl daraus - und zwar gegriffen und
// nicht abgeschrieben: Aendert sich ein Text, eine Antwort oder die
// Pruefung der Nummer, aendert sie sich in jeder Strecke mit. Eine zweite
// Liste mit eigenen Texten waere eine Frage der Zeit, bis eine davon
// stehen bleibt.
//
// VIER FRAGEN JE STRECKE, NICHT MEHR - und das ist keine Vorliebe,
// sondern die Schrittfolge: Die Sitzung kennt pyetja1 bis pyetja4 (siehe
// lifeskin-session.js und firestore.rules). Eine fuenfte Frage braucht
// erst eine fuenfte Stufe in ALLEN vier Kopien der Schrittfolge, und bis
// die ausgerollt ist, weist hasOnly() den GANZEN Schreibvorgang ab -
// lautlos. Genau so sind hier schon dreimal Daten verschwunden.
const ausVorrat = (id) => FRAGEN.find((frage) => frage.id === id);

// DER WEG MIT SCAN, wie bisher: vier Fragen, der Name, die Nummer. Die
// lange Fassung (apps/lifeskin/) stellt sie nach der Aufnahme.
export const FRAGEN_NACH_SCAN = Object.freeze(
  ["anliegen", "mosha", "lekura", "kujdesi", "emri", "numri"].map(ausVorrat));

// DER WEG OHNE SCAN - und er ist der Grund, warum es diese Liste gibt.
//
// Wer die Kamera nicht freigibt, liefert KEIN Bild. Dr. Gashi hat auf
// diesem Weg nichts als das, was hier steht: was ihn stoert, wie sich
// seine Haut anfuehlt, seit wann, und ob einer der zwei Faelle vorliegt,
// bei denen eine Therapie schiefgehen kann. Alles zum Antippen, keine
// Tastatur - die kommt erst beim Namen.
//
// Die Altersgruppe fehlt hier mit Absicht: Sie steht auf dem
// Bildschirm danach, zusammen mit dem Namen, und zweimal gefragt waere
// sie eine Frage zu viel.
export const FRAGEN_PA_SKANIM = Object.freeze(
  ["anliegen", "lekura", "kohezgjatja", "kujdesi"].map(ausVorrat));

// UND ZULETZT DIE NUMMER, hinter Name und Alter.
//
// Dieselbe Frage wie im Vorrat - dieselbe Pruefung, dieselbe Tastatur,
// dieselbe Kennung in der Anamnese -, nur mit einem anderen Satz
// darunter: Auf diesem Weg wird keine Analyse fertig, auf die man
// hingewiesen werden koennte. Es gibt Dr. Gashi, und sie schreibt.
//
// Die Nummer wird hier NUR eingesammelt. Kein Wechsel nach WhatsApp,
// keine App, die sich oeffnet: Wer den Trichter verlaesst, kommt nicht
// zurueck, und der Fall stuende ohne Kontakt da.
export const FRAGEN_PA_SKANIM_NUMRI = Object.freeze([Object.freeze({
  ...ausVorrat("numri"),
  unter: {
    sq: "Dr. Gashi ju shkruan në WhatsApp te ky numër",
    de: "Dr. Gashi schreibt Ihnen auf WhatsApp an diese Nummer"
  }
})]);

// Die Beschriftungen um die Fragen herum.
export const FRAGEN_TEXTE = Object.freeze({
  zaehler: { sq: "Pyetja {nr} nga {gesamt}", de: "Frage {nr} von {gesamt}" },
  weiter: { sq: "Vazhdo", de: "Weiter" },
  // Der Satz ueber der ersten Frage. Er sagt, wofuer das gut ist - ohne ihn
  // sieht es aus wie ein Formular, das nach dem Scan noch hinterherkommt.
  einleitung: {
    sq: "Disa pyetje të shkurtra, që Dr. Gashi ta dijë çka ju nevojitet.",
    de: "Ein paar kurze Fragen, damit Dr. Gashi weiß, was Sie brauchen."
  },
  // Und der Satz, wenn nur EINE Frage kommt - die Nummer.
  //
  // "Ein paar kurze Fragen" waere dort eine Luege, und eine im
  // schlechtesten Augenblick: Wer gerade eine halbe Minute lang den Kopf
  // gedreht hat, liest, dass jetzt noch etwas kommt, und legt weg. Hier
  // steht stattdessen, was wirklich stimmt.
  einleitungEinzeln: {
    sq: "Skanimi mbaroi. Mbeten vetëm dy hapa të shkurtër.",
    de: "Der Scan ist fertig. Es fehlen nur noch zwei kurze Schritte."
  },
  // OHNE SCAN STEHT HIER EIN ANDERER SATZ, und er muss einen anderen
  // Zweck erfuellen.
  //
  // Nach dem Scan sind die Fragen eine Zugabe: Der Fall ist gesichert,
  // die Bilder gehen im Hintergrund hinaus. Ohne Scan sind sie ALLES, was
  // Dr. Gashi bekommt - und der Besucher hat dafuer noch nichts geliefert
  // und nichts erhalten. Der Satz sagt deshalb, wofuer die vier Fragen da
  // sind, und dass es vier kurze sind.
  einleitungPaSkanim: {
    sq: "Katër pyetje të shkurtra — pa to Dr. Gashi nuk ka çka të shikojë.",
    de: "Vier kurze Fragen — ohne sie hat Dr. Gashi nichts, was sie ansehen kann."
  },
  // Und der Satz ueber der Nummer auf demselben Weg.
  //
  // "Der Scan ist fertig" waere hier schlicht falsch, und "ein paar kurze
  // Fragen" eine Luege vor der letzten: Wer bis hierhin gekommen ist, hat
  // vier Fragen, seinen Namen und sein Alter hinterlassen. Was er wissen
  // will, ist, dass es der letzte Schritt ist.
  einleitungNumri: {
    sq: "Hapi i fundit.",
    de: "Der letzte Schritt."
  },
  // Was schiefgehen kann, wenn die Nummer getippt wird. Jeder Grund sagt,
  // was zu tun ist - "ungueltig" sagt das nicht, und ein Feld, das rot
  // wird, ohne zu sagen warum, wird nicht korrigiert, sondern verlassen.
  telLeer: {
    sq: "Shkruani numrin tuaj që Dr. Gashi t'ju gjejë.",
    de: "Bitte die Nummer eintragen, damit Dr. Gashi Sie erreicht."
  },
  telKurz: { sq: "Numri është shumë i shkurtër.", de: "Die Nummer ist zu kurz." },
  telLang: { sq: "Numri është shumë i gjatë.", de: "Die Nummer ist zu lang." },
  telZeichen: { sq: "Shkruani vetëm numra, p.sh. 044 123 456.", de: "Bitte nur Ziffern, z. B. 044 123 456." }
});
