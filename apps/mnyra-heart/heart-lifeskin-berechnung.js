import { statistikTag } from "../../shared/lifeskin-statistik.js";
// Die Rechnung hinter dem Lifeskin-Bericht.
//
// Reine Funktionen, kein Firebase, kein DOM. Sie liegen getrennt vom Adapter,
// weil der sich nicht laden laesst, ohne dass eine Firebase-Verbindung
// aufgebaut wird - und was den Bericht traegt, muss pruefbar sein. Dieselbe
// Trennung wie bei der Landing-Auswertung.
//
// Hier faellt die Zahl, um die es geht: die Kaufquote je abgeschlossener
// Analyse.

// Die Stufen des Trichters in der Reihenfolge, in der sie durchlaufen werden.
// Sie muessen genau die sein, die der Trichter schreibt (lifeskin-session.js).
// Kommt dort ein Schritt dazu und hier nicht, faellt er aus der Auswertung
// heraus, ohne dass etwas kaputtgeht - aber der Trichter zeigt dann eine
// Stufe zu wenig.
//
// ZWEI SORTEN STUFEN, und der Unterschied hat einen Grund:
//
// Die einen stehen im Schritt der Sitzung - das ist der Weg durch den
// Trichter bis zum fertigen Scan. Die anderen stehen in eigenen Feldern:
// Sie passieren auf der Befundseite, und die schreibt bewusst keinen
// Schritt. Sonst koennte ein spaeter Besuch derselben Seite den Fall in
// einen anderen Zustand schieben, und der Trichter zaehlte einen Fortschritt,
// den es nicht gab.
// DER WEG DURCH DEN TRICHTER - eine Stufe je Bildschirm.
//
// Hier steht GENAU EINE ZEILE JE BILDSCHIRM. Zwischenstaende wie die
// fertige Aufnahme oder die Aufbereitung stehen nicht darin: Sie haben
// keinen eigenen Bildschirm, und als Zeile waeren sie eine Angabe, die
// keine Frage beantwortet.
//
// Sie ganz wegzulassen und nicht nur zu verstecken, ist wichtig: Der
// Verlust einer Stufe wird gegen die Stufe DAVOR gerechnet. Eine
// versteckte Stufe dazwischen haette den Verlust an sich gezogen, und er
// waere nirgends zu sehen gewesen.
//
// Gerechnet wird ueber SCHRITT_FOLGE darunter - die kennt auch die
// Zwischenstaende.
export const TRICHTER_STUFEN = Object.freeze([
  // SECHS STUFEN, EINE JE BILDSCHIRM - und zwar je Bildschirm, den es
  // WIRKLICH GIBT.
  //
  // Hier standen zwoelf: "Fillo skanimin" als Ladung, dazu vier Fragen und
  // ein Namensschirm, die der Trichter seit dem Umbau nicht mehr zeigt.
  // Stufen, die niemand mehr erreicht, sind keine Messung, sondern eine
  // Treppe, die ins Nichts faellt - und sie machen die eine Zahl unlesbar,
  // auf die es ankommt.
  //
  // WARUM DIE LADUNG NICHT MEHR OBEN STEHT: "opened" wird geschrieben,
  // sobald die Seite geladen ist - nicht, wenn jemand hinsieht. Gemessen
  // mit dem Pruefstand (tests/lifeskin-trichter-pruefstand): Eine Seite,
  // die NIE sichtbar war, schreibt eine vollstaendige Sitzung, weil die
  // Facebook-App Anzeigenziele auf Android im Voraus laedt. Als erste
  // Stufe stand damit im Nenner eine Zahl aus Seitenaufrufen und im
  // Zaehler eine aus Menschen.
  //
  // Der Trichter faengt deshalb bei den Menschen an. Die Ladungen sind
  // nicht verloren - sie stehen weiter in jeder Sitzung und in den
  // Kennzahlen daneben.
  { id: "gesehen", label: "Landingpage", feld: "gesehen" },
  // HIER STAND "Skanimi", UND DAS GEHT SEIT DER WAHL NICHT MEHR.
  //
  // Der Trichter zaehlt kumulativ: Wer Stufe vier erreicht hat, wird in
  // eins bis drei mitgezaehlt. Das ist richtig, solange es EINEN Weg
  // gibt - seit dem Wahlbildschirm gibt es zwei. Wer ohne Scan
  // weitergeht, stuende damit in "Skanimi", obwohl er die Kamera nie
  // gesehen hat: eine Zahl, die genau das Gegenteil von dem sagt, wofuer
  // dieser Bildschirm gebaut wurde.
  //
  // Der Trichter zeigt deshalb den Weg, den ALLE gehen. Die Verzweigung
  // steht darunter in ihrem eigenen Kasten (baueWege) - dort gehoert
  // sie hin, und dort verfaelscht sie nichts.
  { id: "wahl", label: "Zgjedhja" },
  // Name und Altersgruppe, ein Bildschirm nach dem Scan.
  { id: "emri", label: "Emri" },
  // Die Warteseite ist der Bildschirm, den jeder sieht, der den Scan zu
  // Ende bringt - und ab hier zaehlt ein Lauf als Analyse.
  //
  // "abSchritt" heisst: Auch ohne die Marke erreicht, wenn der Lauf
  // mindestens so weit ist. Die Marke gibt es erst, seit die Warteseite
  // sie schreibt - ein Fall von davor, der laengst bestellt hat, war
  // trotzdem dort. Ohne diese Zeile fiele er aus der Stufe heraus.
  { id: "warteseiteGeoeffnet", label: "Pritja", feld: "warteseiteGeoeffnet", abSchritt: "result" },
  // DER KONTAKT - die letzte Stufe, die der Patient selbst geht.
  //
  // Sie stand einmal als "Numri" im Trichter, weil die Nummer dort eine
  // Pflichtfrage war. Sie ist es nicht mehr: Auf der Warteseite gibt es
  // ZWEI Wege zum selben Ziel - WhatsApp schreiben oder die Nummer
  // hinterlassen -, und wer einen davon geht, ist erreichbar.
  //
  // Deshalb zaehlt hier das Ergebnis und nicht der Weg: "erreichbar" ist
  // wahr, sobald eine Nummer da ist ODER auf WhatsApp geschrieben wurde.
  //
  // UND DIE ZEILE HEISST, WAS SIE ZAEHLT. Hier stand "Kontakti" - ein
  // Wort, das alles Moegliche heissen kann, und in einer Zeile mit einer
  // Zahl daneben muss man raten, was da gezaehlt wird. Jetzt stehen die
  // zwei Wege darin, und die Zeile darunter ("WhatsApp kontaktiert")
  // sagt, wie viele davon den einen genommen haben.
  // Zwei getrennte Stufen haetten beide niedrig ausgesehen, obwohl
  // zusammen jeder erreichbar ist - und die eine Zahl, auf die es
  // ankommt, waere nirgends gestanden.
  { id: "erreichbar", label: "Nr. ose WhatsApp", feld: "erreichbar" },
  // UND HIER ENDET DER TRICHTER.
  //
  // Was danach kommt - Befund gelesen, Preis gesehen, bestellt - steht in
  // LESEMARKEN und faengt erst an, wenn Dr. Gashi freigegeben hat.
  // Dazwischen liegt kein Bildschirm, sondern ihre Arbeit; die zwei in
  // einen Trichter zu legen hiesse, ihre Bearbeitungszeit als Absprung zu
  // zaehlen.
  //
  // WhatsApp steht ganz am Ende und ist kein Bildschirm, sondern die
  // einzige Handlung, die der Patient hier von sich aus tut. Sie bleibt
  // stehen, weil sie das Ergebnis des ganzen Wegs ist.
  { id: "whatsapp", label: "WhatsApp kontaktiert", feld: "whatsapp" }
]);

// Die vollstaendige Schrittfolge, wie der Trichter sie schreibt.
//
// GETRENNT VON TRICHTER_STUFEN, und das ist der Punkt: Die Anzeige endet
// bei WhatsApp, die Schritte gehen weiter bis zur Bestellung. Stuenden sie
// in derselben Liste, zoege jeder spaetere Schritt die Stufen davor hoch -
// und "WhatsApp kontaktiert" saehe aus, als haette es jeder getan, der
// bestellt hat.
const SCHRITT_FOLGE = Object.freeze([
  "opened", "wahl", "named", "camera", "captured",
  "pyetja1", "pyetja2", "pyetja3", "pyetja4", "emri", "numri",
  "aufbereitung", "result", "offer", "address", "ordered"
]);

function alsZahl(wert) {
  const zahl = Number(wert);
  return Number.isFinite(zahl) ? zahl : 0;
}

// Der Geschaeftstag, nicht der UTC-Tag.
//
// Kosovo und Albanien liegen ein bis zwei Stunden vor UTC. Wer die ersten
// zehn Zeichen der ISO-Zeit nimmt, schiebt jede Bestellung zwischen
// Mitternacht und zwei Uhr auf den Vortag - "Umsatz heute" stuende dann auf
// null, waehrend das Geld schon da ist. Aufgefallen ist es erst, weil ein
// Test nachts lief.
//
// sv-SE liefert von Haus aus JJJJ-MM-TT, und genau diese Form wird hier
// verglichen und sortiert.
export const GESCHAEFTSZONE = "Europe/Belgrade";

const TAGESFORM = new Intl.DateTimeFormat("sv-SE", {
  timeZone: GESCHAEFTSZONE,
  year: "numeric", month: "2-digit", day: "2-digit"
});

export function tagesschluessel(iso) {
  const zeit = Date.parse(iso);
  if (!Number.isFinite(zeit)) return "";
  return TAGESFORM.format(new Date(zeit));
}

// Ein Tag zurueck heisst ein Kalendertag zurueck, nicht 86.400.000
// Millisekunden.
//
// Belgrad stellt zweimal im Jahr die Uhr um. An diesen beiden Tagen hat der
// Tag 23 oder 25 Stunden, und ein fester Millisekundenabzug landet dann im
// falschen Tag: "gestern" waere entweder noch heute oder schon vorgestern.
// Der Vergleich "heute gegen gestern" stuende an diesem Tag auf Unsinn, und
// niemand wuerde es merken.
//
// Gerechnet wird deshalb auf dem Kalender: heutiges Datum in Belgrad
// nehmen, davon Tage abziehen. Mittag als Uhrzeit, damit auch der Abzug
// selbst keine Zeitzone mehr beruehrt.
export function heuteSchluessel(versatzTage = 0) {
  const heute = TAGESFORM.format(new Date());
  if (!versatzTage) return heute;
  const [jahr, monat, tag] = heute.split("-").map(Number);
  const punkt = Date.UTC(jahr, monat - 1, tag, 12) - versatzTage * 86400000;
  const d = new Date(punkt);
  const zwei = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${zwei(d.getUTCMonth() + 1)}-${zwei(d.getUTCDate())}`;
}

// Eine Sitzung, wie der Bericht sie braucht.
//
// Nimmt Kennung und Rohdaten, nicht das Firestore-Dokument: So laesst sich
// die Aufbereitung im Test mit einem einfachen Objekt pruefen.
export function normalisiere(id, rohdaten) {
  const daten = rohdaten || {};
  const bestellung = daten.order || null;
  return {
    id,
    // Fehlt der Anlegezeitpunkt, wird der letzte Schreibzeitpunkt genommen.
    //
    // Ein Netz unter einem behobenen Fehler: Eine Sitzung ohne createdAt
    // bekam den Tag "" und fiel damit aus jeder Tageszahl heraus - der
    // Trichter zeigte sie, "Analysen heute" nicht. Still zu verschwinden
    // ist das Schlimmste, was eine Zahl tun kann. Lieber der etwas spaetere
    // Zeitpunkt als gar keiner.
    createdAt: daten.createdAt || daten.updatedAt || "",
    updatedAt: daten.updatedAt || "",
    tag: tagesschluessel(daten.createdAt || daten.updatedAt),
    step: daten.step || "opened",
    name: daten.name || "",
    // Die Fallnummer, die der Patient sieht und in WhatsApp schickt. Ohne
    // sie kann die Aerztin eine Nachricht keinem Fall zuordnen.
    code: daten.code || "",
    ageBand: daten.ageBand || "",
    // Die vier kurzen Antworten nach der Aufnahme. Ohne sie steht im
    // Prompt nichts ueber den Menschen, dessen Gesicht er beurteilt.
    anamnese: daten.anamnese || null,
    sprache: daten.sprache || "",
    device: daten.device || {},
    // Ob die Seite sichtbar war. Siehe TRICHTER_STUFEN.
    //
    // FEHLT DAS MERKMAL, GILT "gesehen" - und das ist Absicht. Jede
    // Sitzung von vor dieser Aenderung hat es nicht; als "nicht gesehen"
    // gelesen, faellt der Trichter der Vergangenheit hier auf null. Nur
    // ein ausdrueckliches false ist eine Ladung, die niemand angesehen hat.
    gesehen: daten.device?.gesehen !== false,
    source: daten.source || {},
    metrics: daten.metrics || null,
    ratios: daten.ratios || null,
    skinType: daten.skinType || "",
    findings: Array.isArray(daten.findings) ? daten.findings : [],
    recommended: Array.isArray(daten.recommended) ? daten.recommended : [],
    photoRefs: Array.isArray(daten.photoRefs) ? daten.photoRefs : [],
    phone: daten.phone || "",
    phoneConsent: daten.phoneConsent === true,
    address: daten.address || null,
    order: bestellung,
    timings: daten.timings || {},
    bestelltAt: daten.order?.createdAt || daten.bestelltAt || "",
    // Wie die Aufnahme zustande kam. Ohne diese vier steht in der
    // Einzelansicht nicht, worauf der Befund beruht - und ob man ihm
    // glauben darf.
    ringAnteil: Number.isFinite(Number(daten.ringAnteil)) ? Number(daten.ringAnteil) : null,
    views: Number.isFinite(Number(daten.views)) ? Number(daten.views) : null,
    mesh: daten.mesh === true,
    mmJeBildpunkt: Number.isFinite(Number(daten.mmJeBildpunkt)) ? Number(daten.mmJeBildpunkt) : null,
    // Welche Blickrichtungen als Foto vorliegen. Steht hier weniger als drei,
    // ist der Ring nicht herumgekommen.
    photos: Array.isArray(daten.photos) ? daten.photos : [],
    // Was auf der Befundseite passiert ist.
    //
    // Der Scan endet mit der Uebergabe an mnyra.com/analiza/<kennung>. Ohne
    // diese vier endete der Bericht genau dort - und die Frage, ob dieser
    // Weg traegt, waere nicht zu beantworten: Wer nie ankommt, ist auf dem
    // Weg dorthin verloren gegangen, und das liegt dann nicht am Befund.
    warteseiteGeoeffnet: daten.warteseiteGeoeffnet === true,
    berichtGeoeffnet: daten.berichtGeoeffnet === true,
    sahSchnitt: daten.sahSchnitt === true,
    sahTherapie: daten.sahTherapie === true,
    sahPreis: daten.sahPreis === true,
    kasseGeoeffnet: daten.kasseGeoeffnet === true,
    waClick: daten.waClick === true,
    waSent: daten.waSent === true,
    // Ob dieser Fall OHNE Scan angelegt wurde.
    //
    // Sie fehlt bei jedem Fall von vor dem Wahlbildschirm, und das ist
    // richtig: Damals gab es nur den einen Weg, und der ging durch die
    // Kamera. Ein fehlendes Merkmal heisst deshalb "mit Scan".
    paSkanim: daten.paSkanim === true,
    linkKopiert: daten.linkKopiert === true,
    // Die drei Zustaende, um die es im Bericht geht.
    hatBestellt: Boolean(bestellung?.orderId),
    hatAnschrift: Boolean(daten.address && (daten.address.strasse || daten.address.ort))
      || Object.values(daten.timings?.ereignisse || {}).some((tag) => Boolean(tag.hatAnschrift)),
    hatTelefon: Boolean(daten.phone),
    // Ob wir diesen Menschen benachrichtigen koennen, wenn sein Befund
    // fertig ist. Beide Wege zaehlen gleich: Wer die Nummer hinterlaesst,
    // ist so erreichbar wie der, der auf WhatsApp geschrieben hat.
    erreichbar: Boolean(daten.phone) || daten.waClick === true || daten.waSent === true,
    // Ob er von sich aus auf WhatsApp geschrieben hat. Antippen und
    // Bestaetigen sind zwei Marken; fuer den Trichter zaehlt beides gleich
    // - die Nachricht ist da oder sie ist es nicht.
    whatsapp: daten.waClick === true || daten.waSent === true
  };
}

// Wie weit ist eine Sitzung gekommen?
// Wie weit ein Lauf gekommen ist - gemessen an der vollen Schrittfolge.
function stufenIndex(step) {
  const i = SCHRITT_FOLGE.indexOf(step);
  return i < 0 ? 0 : i;
}

export function baueTrichter(sitzungen) {
  const erreicht = TRICHTER_STUFEN.map(() => 0);
  // Wo jede angezeigte Stufe in der vollen Schrittfolge liegt. Die Stufen
  // mit einem eigenen Feld stehen in keinem Schritt - fuer sie gilt das
  // Feld, nicht die Folge.
  const inFolge = TRICHTER_STUFEN.map((s) => (s.feld ? -1 : SCHRITT_FOLGE.indexOf(s.id)));
  for (const sitzung of sitzungen) {
    const weit = stufenIndex(sitzung.step);
    let bis = -1;
    for (const [i, stufe] of TRICHTER_STUFEN.entries()) {
      const erreichtHier = stufe.feld
        ? sitzung[stufe.feld] === true
          || (stufe.abSchritt && weit >= stufenIndex(stufe.abSchritt))
        : inFolge[i] >= 0 && weit >= inFolge[i];
      if (erreichtHier && i > bis) bis = i;
    }
    // Wer Schritt vier erreicht hat, hat auch eins bis drei gesehen. Ohne
    // diese Zeile zaehlte der Trichter nur den letzten Schritt und saehe aus
    // wie eine Treppe statt wie ein Trichter.
    for (let i = 0; i <= bis; i += 1) erreicht[i] += 1;
  }
  const start = erreicht[0] || 0;
  return TRICHTER_STUFEN.map((stufe, i) => ({
    ...stufe,
    anzahl: erreicht[i],
    anteil: start ? erreicht[i] / start : 0,
    // Der Verlust in genau diesem Schritt - die Zahl, die sagt, wo Geld
    // liegen bleibt.
    verlust: i === 0 ? 0 : (erreicht[i - 1] ? (erreicht[i - 1] - erreicht[i]) / erreicht[i - 1] : 0)
  }));
}

// DIE VERZWEIGUNG: mit Kamera oder ohne.
//
// SIE STEHT NEBEN DEM TRICHTER UND NICHT DARIN, und das ist keine
// Geschmacksfrage. Ein Trichter zaehlt kumulativ - wer Stufe vier
// erreicht hat, steht auch in eins bis drei. Bei zwei Wegen ist das
// falsch in beide Richtungen: Der Weg ohne Scan wuerde in "Skanimi"
// mitgezaehlt (obwohl niemand dort war), und stuende "Skanimi" mit der
// eigenen Zahl darin, waere die Stufe DANACH groesser als die davor -
// ein Trichter, der nach unten breiter wird, liest sich als Fehler.
//
// Hier zaehlt deshalb jeder Weg fuer sich, und die Grundmenge sind die,
// die die Wahl ueberhaupt gesehen haben.
//
// WAS "mit Scan" HEISST: die Kamera wurde wirklich geoeffnet (Schritt
// "camera"). Nicht die Karte angetippt - zwischen dem Tipp und dem
// laufenden Bild liegt die Systemfrage des Browsers, und genau dort
// geht ein Teil weg. Faelle von vor dem Wahlbildschirm haben kein
// paSkanim und gingen alle durch die Kamera; sie zaehlen deshalb hier
// mit, sobald sie so weit waren.
export function baueWege(sitzungen) {
  const ander = SCHRITT_FOLGE.indexOf("wahl");
  const kamera = SCHRITT_FOLGE.indexOf("camera");
  let anDerWahl = 0;
  let mitScan = 0;
  let ohneScan = 0;
  let scanFertig = 0;
  for (const sitzung of sitzungen) {
    const weit = stufenIndex(sitzung.step);
    if (weit < ander) continue;
    anDerWahl += 1;
    if (sitzung.paSkanim) { ohneScan += 1; continue; }
    if (weit >= kamera) mitScan += 1;
    // Der Scan gilt als durch, sobald die Aufnahmen liegen.
    if (weit >= SCHRITT_FOLGE.indexOf("captured")) scanFertig += 1;
  }
  const anteil = (n) => (anDerWahl ? n / anDerWahl : 0);
  return {
    anDerWahl,
    scanFertig,
    // Wer die Wahl gesehen und danach NICHTS getan hat. Er steht in
    // keinem der beiden Wege - und ohne diese Zeile fehlte er in der
    // Summe, ohne dass jemand merkt, wo er geblieben ist.
    ohneWahl: Math.max(0, anDerWahl - mitScan - ohneScan),
    wege: [
      { id: "mitScan", label: "Me skanim", anzahl: mitScan, anteil: anteil(mitScan) },
      { id: "ohneScan", label: "Pa skanim", anzahl: ohneScan, anteil: anteil(ohneScan) }
    ]
  };
}

// Wie weit im Bericht wirklich gelesen wurde.
//
// NICHT im Trichter, und das ist wichtig: Der rechnet "am weitesten
// gekommen" und zaehlt jede fruehere Stufe mit. Waeren diese Marken dort
// eingehaengt, wuerde jeder, der auf der Warteseite WhatsApp antippt,
// automatisch als "Preis gesehen" gezaehlt - eine Zahl, die schoen
// aussieht und nichts bedeutet.
//
// Hier zaehlt jede Marke fuer sich, und die Grundmenge sind die, die die
// Befundseite ueberhaupt geoeffnet haben. Der Abstand zwischen zwei
// Marken sagt jeweils etwas anderes:
//
//   geoeffnet -> Befund gelesen : ein Textproblem
//   Befund    -> Therapie       : der Uebergang traegt nicht
//   Therapie  -> Preis          : der Wert kommt nicht an
//   Preis     -> Kasse          : der Preis ist das Problem
//   Kasse     -> bestellt       : der Bestellschirm ist das Problem
// DIE FREIGEGEBENE ANALYSE - der zweite Weg, und er faengt erst an, wenn
// Dr. Gashi den Befund freigegeben hat.
//
// Getrennt vom Trichter, weil dazwischen etwas liegt, das kein Bildschirm
// ist: ihre Arbeit. Und weil jede Marke hier fuer sich zaehlt statt
// kumulativ - wer den Preis sieht, ohne den Befund zu Ende gelesen zu
// haben, soll genau so dastehen.
export const LESEMARKEN = Object.freeze([
  { id: "berichtGeoeffnet", label: "Analyse geoeffnet" },
  { id: "sahSchnitt", label: "Analyse gelesen" },
  { id: "sahTherapie", label: "Therapie gelesen" },
  { id: "sahPreis", label: "Preis gelesen" },
  { id: "kasseGeoeffnet", label: "Kasse geoeffnet" },
  { id: "hatAnschrift", label: "Anschrift begonnen" },
  { id: "hatBestellt", label: "Bestellt" }
]);

// "Wie sie erreichbar wurden" gibt es nicht mehr.
//
// Die Aufstellung beantwortete die Frage, ob dieser Mensch ueberhaupt zu
// erreichen ist - und das war eine Frage, solange die Nummer ein Angebot
// auf der Warteseite war. Sie ist jetzt eine Pflichtfrage im Trichter:
// Wer die Warteseite sieht, hat eine hinterlassen. Eine Zahl, die immer
// dasselbe sagt, sagt nichts.

// Zaehlt dieser Lauf als Analyse?
//
// Erst ab der Warteseite: Dort ist der Fall vollstaendig - Aufnahmen,
// Anliegen, Name und Nummer. Alles davor ist ein angefangener Scan.
//
// Die Marke ODER der Schritt: Die Warteseite schreibt ihre eigene Marke,
// aber ein Lauf, der laengst weiter ist (bestellt), traegt sie
// moeglicherweise aus einer Zeit, in der es sie noch nicht gab.
export function istAnalyse(sitzung) {
  return sitzung?.warteseiteGeoeffnet === true
    || stufenIndex(sitzung?.step) >= stufenIndex("result");
}

// Report activity belongs to its event day, not to the original scan day.
// Legacy flags have no event time: explicitly expose the estimated allocation.
export function ereignisImZeitraum(sitzung, marke, zeitraum = "max") {
  if (sitzung?.[marke] !== true) return false;
  if (!zeitraum || zeitraum === "max") return true;
  const tage = Object.entries(sitzung.timings?.ereignisse || {})
    .filter(([, events]) => Boolean(events?.[marke])).map(([tag]) => ({ tag }));
  if (tage.length) return imZeitraum(tage, zeitraum).length > 0;
  const zeit = marke === "hatBestellt" ? sitzung.bestelltAt : "";
  return imZeitraum([{ tag: statistikTag(zeit || sitzung.updatedAt) || sitzung.tag }], zeitraum).length > 0;
}

export function baueLesetiefe(sitzungen, zeitraum = "max") {
  const alle = Array.isArray(sitzungen) ? sitzungen : [];
  const mengen = LESEMARKEN.map((marke) => alle.filter((s) => ereignisImZeitraum(s, marke.id, zeitraum)));
  // Reading marks are independent; the percentage is the share of active reports,
  // including return visits which need not open every section again that day.
  const basis = new Set(mengen.flat().map((s) => s.id)).size;
  return LESEMARKEN.map((marke, i) => {
    const anzahl = mengen[i].length;
    const vorher = i ? mengen[i - 1].length : anzahl;
    const geschaetzt = mengen[i].filter((s) =>
      !Object.values(s.timings?.ereignisse || {}).some((e) => e?.[marke.id])
      && !(marke.id === "hatBestellt" && s.bestelltAt)).length;
    return {
      ...marke, anzahl, geschaetzt: zeitraum && zeitraum !== "max" ? geschaetzt : 0,
      anteil: basis ? anzahl / basis : 0,
      verlust: i === 0 || !vorher ? 0 : Math.max(0, (vorher - anzahl) / vorher)
    };
  });
}

// Only identical session IDs can be deduplicated safely.
export function entdopple(sitzungen) {
  // A name/device is not an identity. Distinct report IDs must remain visible.
  const ids = new Map();
  for (const sitzung of sitzungen) {
    const key = sitzung.id || sitzung;
    const alt = ids.get(key);
    if (!alt || String(sitzung.updatedAt) >= String(alt.updatedAt)) ids.set(key, sitzung);
  }
  return [...ids.values()];
}

// Der Preis, an dem der offene Betrag haengt.
//
// Stand als 43 fest im Code, waehrend das Set 53 kostet - jede Zahl "offen"
// war um ein Fuenftel zu niedrig. Jetzt ein Wert mit Namen, den der Adapter
// aus der Konfiguration setzen kann, und ein Test haelt ihn mit dem Preis
// im Trichter zusammen.
export const SET_PREIS = 53;

// Ein einzelnes Mittel. Verkauft wird ueberwiegend als Set - aber wenn nur
// eines passt, kostet es 33 und nicht die Haelfte des Sets. Der Rueckfall,
// wenn in der Konfiguration keine Preistabelle steht.
export const EINZELPREIS = 33;

// Die Zeitraeume, zwischen denen die Kacheln umschalten.
//
// Eine Zahl ohne Zeitraum ist keine Zahl: "17 %" heisst etwas anderes, wenn
// es fuenf Analysen sind als wenn es fuenfhundert sind. Deshalb steht der
// Zeitraum ueber den Kacheln und gilt fuer ALLES darunter - Kacheln,
// Trichter und Lesetiefe zeigen denselben Ausschnitt. Zwei Bloecke mit
// verschiedenen Zeitraeumen nebeneinander liest niemand richtig.
export const ZEITRAEUME = Object.freeze([
  { id: "heute", label: "Heute", tage: 0 },
  { id: "gestern", label: "Gestern" },
  { id: "woche", label: "7 Tage", tage: 6 },
  { id: "monat", label: "30 Tage", tage: 29 },
  { id: "max", label: "Max" }
]);

export function imZeitraum(sitzungen, zeitraum = "heute") {
  const liste = Array.isArray(sitzungen) ? sitzungen : [];
  if (zeitraum === "max") return liste;
  if (zeitraum === "gestern") {
    const gestern = heuteSchluessel(1);
    return liste.filter((s) => s.tag === gestern);
  }
  const eintrag = ZEITRAEUME.find((z) => z.id === zeitraum);
  const ab = heuteSchluessel(Number.isFinite(eintrag?.tage) ? eintrag.tage : 0);
  return liste.filter((s) => s.tag >= ab && s.tag <= heuteSchluessel());
}

// Der Zeitraum davor, gleich lang. Er traegt den Vergleich unter der ersten
// Kachel ("+1 ggue. gestern") - ohne ihn ist eine Zahl nur eine Zahl.
export function davorZeitraum(sitzungen, zeitraum = "heute") {
  const liste = Array.isArray(sitzungen) ? sitzungen : [];
  if (zeitraum === "max") return [];
  if (zeitraum === "heute") { const g = heuteSchluessel(1); return liste.filter((s) => s.tag === g); }
  if (zeitraum === "gestern") { const v = heuteSchluessel(2); return liste.filter((s) => s.tag === v); }
  const tage = (ZEITRAEUME.find((z) => z.id === zeitraum)?.tage ?? 0) + 1;
  const ab = heuteSchluessel(tage * 2 - 1);
  const bis = heuteSchluessel(tage);
  return liste.filter((s) => s.tag >= ab && s.tag <= bis);
}

// EINE SITZUNG NACH IHRER KENNUNG - IN BEIDEN LISTEN.
//
// Seit die eigenen Testlaeufe getrennt gefuehrt werden, liegt eine Sitzung
// entweder in sitzungen oder in tests. Wer einen Testlauf antippte, landete
// bei "Diese Analyse gibt es nicht mehr": Gesucht wurde nur in der einen
// Liste, und die eigene Analyse, die es gerade eben noch gab, war
// scheinbar weg. Wer eine Analyse aufschlaegt, will sie sehen - egal, in
// welcher der beiden Listen sie steht.
export function findeSitzung(zustand, kennung) {
  const id = String(kennung || "").trim();
  if (!id) return null;
  return (zustand?.sitzungen || []).find((s) => s.id === id)
    || (zustand?.tests || []).find((s) => s.id === id)
    || null;
}

// EIGENE TESTS SIND KEINE BESUCHER.
//
// Wer seinen eigenen Trichter zwanzigmal am Tag durchlaeuft, steht in jeder
// Zahl: "Seite geoeffnet" waechst, die Abschlussquote faellt, und die
// Kaufquote sieht schlechter aus als sie ist. Solche Laeufe gehoeren
// gezaehlt - aber getrennt.
//
// Zwei Wege, einen Lauf als Test zu kennzeichnen:
//
//   VORHER  mnyra.com/lifeskin?test=1 - der Trichter schreibt die Kampagne
//           "test" in die Herkunft. Das ist der saubere Weg, weil auch ein
//           abgebrochener Lauf markiert ist.
//   NACHHER in Heart antippen. Das setzt eine Marke am Bericht und geht
//           nur bei Laeufen, die bis zum Befund gekommen sind.
export function istTest(sitzung, bericht = null) {
  const kampagne = String(sitzung?.source?.utmCampaign || "").trim().toLowerCase();
  return kampagne === "test" || bericht?.test === true;
}

export function teileTests(sitzungen, berichte = {}) {
  const echte = [];
  const tests = [];
  for (const sitzung of Array.isArray(sitzungen) ? sitzungen : []) {
    (istTest(sitzung, (berichte || {})[sitzung.id]) ? tests : echte).push(sitzung);
  }
  return { echte, tests };
}

// In welchem der drei Faecher eine Analyse liegt.
//
//   neu         Der Scan ist da, Dr. Gashi hat ihn noch nicht freigegeben.
//               Das ist das Fach, das Arbeit bedeutet.
//   fertig      Freigegeben - der Patient sieht seinen Befund.
//   archiviert  Abgehakt. Liegt nicht mehr im Weg, ist aber nicht geloescht.
export function zustandVon(sitzung, bericht = null) {
  if (bericht?.archiviert === true) return "archiviert";
  const status = String(bericht?.status || "").trim();
  if (["fertig", "bestellt", "versandt", "zugestellt"].includes(status)) return "fertig";
  return "neu";
}

export function baueKennzahlen(sitzungen, { setPreis = SET_PREIS, zeitraum = "" } = {}) {
  const heute = heuteSchluessel();
  const gestern = heuteSchluessel(1);

  // EINE ANALYSE IST EINE, WENN ER AUF DER WARTESEITE STEHT.
  //
  // Gezaehlt wurde ab der fertigen Aufnahme. Das war zu frueh: Zwischen
  // Aufnahme und Warteseite liegen sechs Fragen, und wer dort weggeht,
  // hinterlaesst keinen Fall, den Dr. Gashi befunden koennte - keinen
  // Namen, keine Nummer, kein Anliegen. Eine Analyse, die niemand
  // befunden kann, ist keine.
  const analysen = (liste) => liste.filter(istAnalyse);
  const abgeschlossen = analysen;
  const bestellungen = (liste) => liste.filter((s) => s.hatBestellt);

  const heutige = sitzungen.filter((s) => s.tag === heute);
  const gestrige = sitzungen.filter((s) => s.tag === gestern);
  // OHNE GEWAEHLTEN ZEITRAUM BLEIBT ES BEIM ALTEN: heute gegen gestern,
  // Quoten ueber sieben Tage. Mit gewaehltem Zeitraum gilt er fuer alles -
  // Kacheln, Quoten, Umsatz -, und der Vergleich darunter nimmt den
  // gleich langen Zeitraum davor.
  const gewaehlt = zeitraum ? imZeitraum(sitzungen, zeitraum) : null;
  const davor = zeitraum ? davorZeitraum(sitzungen, zeitraum) : null;
  const woche = gewaehlt || imZeitraum(sitzungen, "woche");

  // Die Quoten gelten fuer denselben Zeitraum wie die Kacheln daneben.
  //
  // Vorher rechneten sie ueber die gesamte Zeit. Das klingt harmlos und ist
  // es nicht: Je laenger es laeuft, desto traeger wird die Zahl, bis eine
  // schlechte Woche gar nicht mehr auffaellt - und die eigenen Testaufrufe
  // stecken auf Dauer mit drin. Eine Quote, die sich nicht mehr bewegt,
  // beantwortet keine Frage.
  const abgeschlossenWoche = abgeschlossen(woche);
  const bestelltWoche = bestellungen(woche);

  // Anschrift begonnen, aber nicht bestellt, und aelter als eine halbe
  // Stunde - vorher koennte jemand noch tippen.
  const jetzt = Date.now();
  const abbrecher = sitzungen.filter((s) =>
    s.hatAnschrift && !s.hatBestellt
    && (jetzt - (Date.parse(s.updatedAt) || 0)) > 30 * 60 * 1000
  );

  const kontakte = sitzungen.filter((s) => s.hatTelefon && !s.hatBestellt);

  const umsatz = (liste) => liste.reduce((summe, s) => summe + alsZahl(s.order?.total), 0);

  // Sitzungen, denen jedes Datum fehlt. Sie zaehlen in keiner Tageszahl mit
  // und sollen deshalb wenigstens benannt sein - eine Zahl, die lautlos
  // kleiner wird, faellt niemandem auf.
  const ohneDatum = sitzungen.filter((s) => !s.tag).length;

  const imBlick = gewaehlt || heutige;
  return {
    ohneDatum,
    zeitraum: zeitraum || "",
    // Was in den Kacheln steht: im gewaehlten Zeitraum, und darunter der
    // gleich lange davor.
    analysen: analysen(imBlick).length,
    analysenDavor: analysen(davor || gestrige).length,
    analysenHeute: analysen(heutige).length,
    analysenGestern: analysen(gestrige).length,
    analysenWoche: analysen(woche).length,
    abschlussQuote: woche.length ? abgeschlossenWoche.length / woche.length : 0,
    // Die Leitzahl: Bestellungen je abgeschlossener Analyse, sieben Tage.
    kaufQuote: abgeschlossenWoche.length ? bestelltWoche.length / abgeschlossenWoche.length : 0,
    // Damit im Bericht steht, worauf die Quoten beruhen. Eine Quote aus drei
    // Analysen ist keine Quote, und das muss man sehen koennen.
    quotenBasis: woche.length,
    umsatzHeute: umsatz(bestellungenImZeitraum(sitzungen, zeitraum || "heute")),
    umsatzWoche: umsatz(bestellungenImZeitraum(sitzungen, zeitraum || "woche")),
    bestellungenHeute: bestellungenImZeitraum(sitzungen, zeitraum || "heute").length,
    abbrecher,
    kontakte,
    offenerBetrag: abbrecher.length * setPreis
  };
}

// Kaufquote je Anzeige. Die Antwort auf die Frage, welche Werbung wirklich
// verkauft - und nicht nur Klicks bringt.
export function baueHerkunft(sitzungen) {
  const nachKampagne = new Map();
  for (const sitzung of sitzungen) {
    const schluessel = sitzung.source?.utmCampaign || sitzung.source?.utmSource || "(ohne Kennzeichnung)";
    const eintrag = nachKampagne.get(schluessel) || { kampagne: schluessel, sitzungen: 0, abgeschlossen: 0, bestellt: 0, umsatz: 0 };
    eintrag.sitzungen += 1;
    if (istAnalyse(sitzung)) eintrag.abgeschlossen += 1;
    if (sitzung.hatBestellt) { eintrag.bestellt += 1; eintrag.umsatz += alsZahl(sitzung.order?.total); }
    nachKampagne.set(schluessel, eintrag);
  }
  return Array.from(nachKampagne.values())
    .map((e) => ({ ...e, kaufQuote: e.abgeschlossen ? e.bestellt / e.abgeschlossen : 0 }))
    .sort((a, b) => b.umsatz - a.umsatz || b.sitzungen - a.sitzungen);
}

export function baueVerteilung(sitzungen) {
  const hauttypen = new Map();
  const altersgruppen = new Map();
  const befunde = new Map();

  for (const sitzung of sitzungen) {
    if (sitzung.skinType) hauttypen.set(sitzung.skinType, (hauttypen.get(sitzung.skinType) || 0) + 1);
    if (sitzung.ageBand) altersgruppen.set(sitzung.ageBand, (altersgruppen.get(sitzung.ageBand) || 0) + 1);
    // Der Gang durch normalisiere() setzt findings immer auf eine Liste.
    // Die Absicherung hier steht trotzdem: Wer die Rechnung spaeter einmal
    // auf rohe Daten loslaesst, soll keine leere Ansicht bekommen.
    for (const befund of sitzung.findings || []) {
      if (!befund || alsZahl(befund.stufe) < 1) continue;
      befunde.set(befund.id, (befunde.get(befund.id) || 0) + 1);
    }
  }
  const sortiert = (karte) => Array.from(karte.entries())
    .map(([id, anzahl]) => ({ id, anzahl }))
    .sort((a, b) => b.anzahl - a.anzahl);

  return { hauttypen: sortiert(hauttypen), altersgruppen: sortiert(altersgruppen), befunde: sortiert(befunde) };
}

export function baueTagesverlauf(sitzungen, tage = 30) {
  const nachTag = new Map();
  for (let i = tage - 1; i >= 0; i -= 1) {
    nachTag.set(heuteSchluessel(i), { tag: heuteSchluessel(i), analysen: 0, bestellungen: 0, umsatz: 0 });
  }
  for (const sitzung of sitzungen) {
    const eintrag = nachTag.get(sitzung.tag);
    if (eintrag && istAnalyse(sitzung)) eintrag.analysen += 1;
    const bestellt = nachTag.get(bestellTag(sitzung));
    if (bestellt && sitzung.hatBestellt) { bestellt.bestellungen += 1; bestellt.umsatz += alsZahl(sitzung.order?.total); }
  }
  return Array.from(nachTag.values());
}

export function bestellTag(sitzung) {
  return statistikTag(sitzung.bestelltAt || sitzung.order?.createdAt) || sitzung.tag;
}

export function bestellungenImZeitraum(sitzungen, zeitraum) {
  return imZeitraum((sitzungen || []).filter((s) => s.hatBestellt)
    .map((s) => ({ ...s, tag: bestellTag(s) })), zeitraum);
}

export function aktualisiereLifeskinSitzungen(zustand, aenderungen) {
  const alle = entdopple([...(zustand.sitzungen || []), ...(zustand.tests || []), ...aenderungen])
    .map((s) => ({ ...s, bestelltAt: s.bestelltAt || zustand.berichte?.[s.id]?.bestelltAt || "" }));
  const { echte: sitzungen, tests } = teileTests(alle, zustand.berichte);
  sitzungen.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  tests.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return { sitzungen, tests };
}
