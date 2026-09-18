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
  { id: "opened", label: "Fillo skanimin" },
  // WER DIE SEITE NICHT NUR GELADEN, SONDERN AUCH GESEHEN HAT.
  //
  // Die Stufe darueber wird geschrieben, sobald die Seite fertig geladen
  // ist - nicht, wenn jemand hinsieht. Gemessen mit dem Pruefstand
  // (tests/lifeskin-trichter-pruefstand): Eine Seite, die NIE sichtbar
  // war, schreibt eine vollstaendige Sitzung. Die Facebook-App laedt
  // Anzeigenziele auf Android im Voraus, bevor jemand tippt.
  //
  // Damit war der Sprung von "Fillo skanimin" auf "Para fotos" nicht zu
  // lesen: Im Zaehler standen Menschen, im Nenner Seitenaufrufe. Diese
  // Zeile dazwischen trennt beides, und der Verlust darunter wird gegen
  // sie gerechnet statt gegen die Ladungen.
  //
  // Deutsch und nicht Albanisch, anders als die Stufen darunter: Die sind
  // nach den Bildschirmen benannt, die der Patient sieht. Dies ist keiner -
  // es ist eine Messung fuer den, der den Bericht liest.
  //
  // KEIN "feld" mit === true, sondern die Umkehrung in normalisiere():
  // Sitzungen von vor dieser Aenderung haben das Merkmal nicht. Wuerde
  // Fehlen als "nicht gesehen" zaehlen, faellt der ganze Trichter der
  // Vergangenheit hier auf null - und das waere eine erfundene Zahl.
  { id: "gesehen", label: "Seite gesehen", feld: "gesehen" },
  { id: "named", label: "Para fotos" },
  { id: "camera", label: "Skanimi" },
  { id: "pyetja1", label: "Pyetja 1" },
  { id: "pyetja2", label: "Pyetja 2" },
  { id: "pyetja3", label: "Pyetja 3" },
  { id: "pyetja4", label: "Pyetja 4" },
  { id: "emri", label: "Emri" },
  { id: "numri", label: "Numri" },
  // Die Warteseite ist der Bildschirm, den jeder sieht, der den Scan zu
  // Ende bringt - und ab hier zaehlt ein Lauf als Analyse.
  // "abSchritt" heisst: Auch ohne die Marke erreicht, wenn der Lauf
  // mindestens so weit ist. Die Marke gibt es erst, seit die Warteseite
  // sie schreibt - ein Fall von davor, der laengst bestellt hat, war
  // trotzdem dort. Ohne diese Zeile fiele er aus der Stufe heraus, und
  // der Trichter saehe aus wie eine Treppe.
  //
  // Fuer WhatsApp gilt das ausdruecklich NICHT: Das ist eine Handlung,
  // die jemand tut oder nicht. Sie aus einem spaeteren Schritt zu
  // schliessen hiesse, sie zu erfinden.
  { id: "warteseiteGeoeffnet", label: "Pritja", feld: "warteseiteGeoeffnet", abSchritt: "result" },
  // UND HIER ENDET DER TRICHTER.
  //
  // Was danach kommt - Befund gelesen, Preis gesehen, bestellt - steht in
  // LESEMARKEN und faengt erst an, wenn Dr. Gashi freigegeben hat.
  // Dazwischen liegt kein Bildschirm, sondern ihre Arbeit; die zwei in
  // einen Trichter zu legen hiesse, ihre Bearbeitungszeit als Absprung zu
  // zaehlen.
  //
  // WhatsApp steht ganz am Ende und nicht mitten drin: Es ist der einzige
  // Schritt hier, den der Patient von sich aus tut, und er tut ihn von der
  // Warteseite aus. Stuende danach noch etwas, wuerde es ihn hochziehen -
  // der Trichter rechnet kumulativ, und wer seinen Befund liest, hat
  // deshalb nicht auf WhatsApp geschrieben.
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
  "opened", "named", "camera", "captured",
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
    linkKopiert: daten.linkKopiert === true,
    // Die drei Zustaende, um die es im Bericht geht.
    hatBestellt: Boolean(bestellung?.orderId),
    hatAnschrift: Boolean(daten.address && (daten.address.strasse || daten.address.ort)),
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

export function baueLesetiefe(sitzungen) {
  const alle = Array.isArray(sitzungen) ? sitzungen : [];
  const basis = alle.filter((s) => s.berichtGeoeffnet === true).length;
  return LESEMARKEN.map((marke, i) => {
    const anzahl = alle.filter((s) => s[marke.id] === true).length;
    const vorher = i === 0
      ? anzahl
      : alle.filter((s) => s[LESEMARKEN[i - 1].id] === true).length;
    return {
      ...marke,
      anzahl,
      anteil: basis ? anzahl / basis : 0,
      // Der Verlust an genau dieser Stelle - die Zahl, die sagt, wo im
      // Bericht Geld liegen bleibt.
      verlust: i === 0 || !vorher ? 0 : Math.max(0, (vorher - anzahl) / vorher)
    };
  });
}

// Zwei Eintraege, die derselbe Besuch sind, zu einem machen.
//
// ZWEITE FASSUNG, und die erste war gefaehrlich. Sie fasste alles zusammen,
// was in einer halben Stunde dasselbe Betriebssystem, dieselbe
// Bildschirmgroesse, dieselbe Kampagne und denselben Namen hatte - und ein
// Besucher, der noch keinen Namen eingegeben hat, hat den Namen "".
//
// In einer Werbekampagne kommen fast alle mit demselben Handymodell aus
// derselben Anzeige. Nachgerechnet: 60 echte Besucher wurden zu 14. Die
// Zahl "Seite geoeffnet" stand damit auf einem Viertel des wahren Werts,
// und die Kaufquote sah viermal besser aus als sie war. Das ist die
// teuerste Sorte falscher Zahl - man dreht das Werbebudget auf, weil eine
// Anzeige zu funktionieren scheint.
//
// Jetzt wird nur noch zusammengelegt, was einen NAMEN hat. Zwei Menschen
// mit demselben Vornamen auf demselben Handymodell in derselben halben
// Stunde gibt es; sie sind selten genug, um dafuer die Neuladen-Faelle
// loszuwerden. Ohne Namen wird nie zusammengelegt.
//
// Der eigentliche Grund fuer Doppeleintraege ist ohnehin behoben: Die
// Sitzungskennung liegt jetzt im sessionStorage des Tabs, ein Neuladen
// schreibt also in dasselbe Dokument weiter (lifeskin-session.js).
export function entdopple(sitzungen, fensterMs = 30 * 60 * 1000) {
  const nachSchluessel = new Map();
  const einzeln = [];
  for (const sitzung of sitzungen) {
    const name = String(sitzung.name || "").trim().toLowerCase();
    // Kein Name, kein Zusammenlegen. Ein leeres Feld ist kein Merkmal.
    if (!name) { einzeln.push(sitzung); continue; }

    const kennung = [
      sitzung.device?.os || "",
      sitzung.device?.screen || "",
      sitzung.source?.utmCampaign || "",
      name
    ].join("|");
    const zeit = Date.parse(sitzung.createdAt) || 0;

    const vorhandene = nachSchluessel.get(kennung) || [];
    // Eine Sitzung, die im selben Fenster liegt: die weiter fortgeschrittene
    // gewinnt, denn sie ist der echte Versuch.
    const treffer = vorhandene.find((v) => Math.abs((Date.parse(v.createdAt) || 0) - zeit) < fensterMs);
    if (!treffer) {
      vorhandene.push(sitzung);
      nachSchluessel.set(kennung, vorhandene);
      continue;
    }
    if (stufenIndex(sitzung.step) > stufenIndex(treffer.step)) {
      vorhandene[vorhandene.indexOf(treffer)] = sitzung;
    }
  }
  return [...einzeln, ...Array.from(nachSchluessel.values()).flat()];
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
  return liste.filter((s) => s.tag >= ab);
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
  return liste.filter((s) => s.tag >= ab && s.tag < bis);
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
  const abgeschlossen = (liste) => liste.filter((s) => stufenIndex(s.step) >= stufenIndex("result"));
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
    umsatzHeute: umsatz(bestellungen(imBlick)),
    umsatzWoche: umsatz(bestellungen(woche)),
    bestellungenHeute: bestellungen(imBlick).length,
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
    if (stufenIndex(sitzung.step) >= stufenIndex("result")) eintrag.abgeschlossen += 1;
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
    if (!eintrag) continue;
    if (istAnalyse(sitzung)) eintrag.analysen += 1;
    if (sitzung.hatBestellt) { eintrag.bestellungen += 1; eintrag.umsatz += alsZahl(sitzung.order?.total); }
  }
  return Array.from(nachTag.values());
}
