import { istTest } from "./heart-lifeskin-berechnung.js";
// WER GERADE JETZT WO STEHT.
//
// Der Trichter darunter beantwortet "wie viele sind heute durchgekommen".
// Das hier beantwortet eine andere Frage, und zwar die, wegen der man
// abends noch einmal auf den Bildschirm sieht: Ist gerade jemand dabei?
//
// DER UNTERSCHIED ZUM TRICHTER IST NICHT DIE ZEIT, SONDERN DIE RECHNUNG.
// Der Trichter zaehlt kumulativ - wer bestellt hat, steht in jeder Stufe
// davor. Hier steht jeder in GENAU EINEM Punkt: dort, wo er gerade ist.
// Sonst leuchteten beim ersten Besucher alle Punkte gleichzeitig, und die
// Reihe saehe immer gleich aus.
//
// EIN EIGENES MODUL, weil hier reines Rechnen steht: kein DOM, kein
// Firestore, keine Zeitschaltung. Der Test gibt Sitzungen und eine Uhrzeit
// hinein und sieht nach, welche Punkte leuchten.

// Wie lange jemand als "gerade dabei" gilt.
//
// Gemessen wird am letzten Schreibvorgang, und geschrieben wird bei jedem
// Schritt. Wer die Kamera oeffnet und zwei Minuten braucht, bis der Ring
// herum ist, schreibt in dieser Zeit nichts - mit einem engen Fenster
// verschwaende er aus der Reihe, obwohl er mitten dabei ist.
//
// Drei Minuten: lang genug fuer den laengsten Bildschirm (die Aufnahme),
// kurz genug, dass "gerade" noch gerade heisst.
export const LIVE_FENSTER_MS = 3 * 60 * 1000;

// Die Punkte der Reihe "Live-Analysen" - der Weg durch den Trichter.
//
// Vier statt elf: Eine Reihe mit elf Punkten ist keine Reihe mehr, sondern
// eine Liste. Was hier beantwortet wird, ist "wo steckt er gerade", und
// dafuer reichen die vier Abschnitte, die sich wirklich unterscheiden.
//
// SIE MUESSEN ZU DEN BILDSCHIRMEN PASSEN, DIE ES GIBT. Hier stand
// "Fillo skanimin" fuer einen Ladebildschirm, den der Trichter nicht mehr
// zeigt, und "Pyetjet" fuer vier Fragen, die es nicht mehr gibt. Ein Punkt,
// der nach einem Bildschirm heisst, den niemand mehr sieht, ist schlimmer
// als kein Punkt: Man sucht den Menschen dort, wo er nicht sein kann.
//
// JEDER SCHRITT LIEGT IN GENAU EINEM PUNKT, und das ist keine Ordnungsfrage:
// Wer in keinem liegt, faellt aus der Reihe UND aus der Zahl darueber - er
// waere gerade dabei, und der Bildschirm sagte "Gerade ist niemand
// unterwegs". tests/lifeskin-live.test.mjs haelt das fest.
export const LIVE_ANALYSE_PUNKTE = Object.freeze([
  // Die Landingpage selbst - wer hier steht, liest noch.
  { id: "landing", label: "Landing", schritte: ["opened"] },
  // DER WAHLBILDSCHIRM BEKOMMT EINEN EIGENEN PUNKT.
  //
  // Er ist die Stelle, an der sich der Weg teilt, und damit die einzige,
  // an der man beim Zusehen etwas lernen kann: Wer hier steht,
  // entscheidet gerade. In "Landingpage" mitgezaehlt waere das nicht zu
  // sehen - und genau dafuer gibt es diesen Bildschirm.
  { id: "menyra", label: "Mënyra", schritte: ["wahl"] },
  // ALLES, WAS VOR EINER KAMERA PASSIERT, IN EINEM PUNKT.
  //
  // Hier standen zwei - "Skanimi" und "Fotoja" -, und das war eine
  // Trennung zu viel fuer eine Reihe, die auf einen Blick lesbar sein
  // soll: Beide heissen dasselbe, naemlich "steht gerade vor der
  // Kamera". WELCHEN Weg jemand genommen hat, steht im Trichter
  // darunter, je Weg und mit jedem Bildschirm einzeln.
  //
  // Die Anleitungen gehoeren dazu ("named" ist der Bildschirm "Tre
  // gjera para fotos", "fotopara" der Bildschirm "Para fotografise"):
  // Wer dort steht, hat den Weg gewaehlt und ist unterwegs zur Kamera.
  {
    id: "fotot", label: "Fotot",
    schritte: ["named", "camera", "captured", "fotopara", "fotokamera", "fotogati"]
  },
  // NAME UND NUMMER IN EINEM PUNKT, und der Punkt heisst nach dem zweiten.
  //
  // Es sind zwei Bildschirme, aber ein Abschnitt: die Kontaktdaten. Vier
  // Punkte sollen die vier Abschnitte zeigen, nicht jeden Bildschirm - und
  // der Name bekommt keinen eigenen, sonst waeren es fuenf. In "Skanimi"
  // gehoerte er nicht: Wer seinen Namen tippt, scannt nicht mehr.
  //
  // Die vier alten Fragen stehen weiter in der Liste, obwohl der Trichter
  // sie nicht mehr zeigt: Eine Sitzung, die noch vor dem Umbau angefangen
  // hat, kann in diesem Augenblick dort stehen, und ohne diese Namen fiele
  // sie aus der Reihe.
  //
  // TRUP UND PYTJE STEHEN HIER MIT DRIN, und zwar richtig: Auf diesen
  // zwei Wegen sind Name, Alter, der Text und die Nummer EIN Abschnitt -
  // zwei Bildschirme hintereinander, ohne etwas dazwischen. Ein eigener
  // Punkt je Weg waere eine Reihe mit acht Punkten, und acht Punkte sind
  // keine Reihe mehr, sondern eine Liste.
  {
    id: "numri", label: "Nummri",
    schritte: ["pyetja1", "pyetja2", "pyetja3", "pyetja4", "emri", "problemi", "numri", "aufbereitung"]
  },
  // DER LETZTE PUNKT IN EINER ANDEREN FARBE.
  //
  // Er heisst nicht nur anders, er bedeutet etwas anderes: In den drei
  // Punkten davor ist jemand unterwegs und man sieht ihm zu. Hier ist er
  // fertig und WARTET - auf Dr. Gashi. Das ist der einzige Punkt der Reihe,
  // bei dem jemand etwas tun muss, und deshalb ist er nicht gruen wie die
  // anderen (siehe .heart-live__punkt--warten in heart.css).
  { id: "pritja", label: "Patient", ton: "warten", schritte: ["result"] }
]);

// Die Punkte der Reihe "Live-Bestellungen".
//
// Sie faengt dort an, wo Geld ins Spiel kommt. Wer hier steht, hat seinen
// Befund gelesen und ueberlegt - das sind die drei Minuten, in denen sich
// entscheidet, ob heute etwas verkauft wird.
export const LIVE_BESTELL_PUNKTE = Object.freeze([
  // ZWEI LAEDEN, EINE REIHE.
  //
  // Es gibt den Laden auf der Landingpage (imKorb) und die Kasse auf
  // der Befundseite (kasseGeoeffnet). Beide heissen fuer den, der
  // zusieht, dasselbe: Da liegt etwas im Korb. Zwei Reihen nebeneinander
  // waeren zweimal dieselbe Frage mit zwei Antworten.
  { id: "kasse", label: "N'shport", schritte: ["offer"], marken: ["kasseGeoeffnet", "imKorb"] },
  { id: "anschrift", label: "Adresa", schritte: ["address"], marken: ["adresseBegonnen"] },
  { id: "bestellt", label: "Cash", schritte: ["ordered"] }
]);

function zeitAus(wert) {
  const zahl = Date.parse(String(wert || ""));
  return Number.isFinite(zahl) ? zahl : 0;
}

// Ist diese Sitzung gerade aktiv?
export function istGeradeAktiv(sitzung, jetzt = Date.now(), fenster = LIVE_FENSTER_MS) {
  const zuletzt = zeitAus(sitzung?.updatedAt || sitzung?.createdAt);
  if (!zuletzt) return false;
  const alter = jetzt - zuletzt;
  // Auch die Zukunft faellt heraus: Eine Uhr, die vorgeht, machte sonst
  // aus einer alten Sitzung eine ewig aktive.
  return alter >= -60000 && alter <= fenster;
}

// In welchem Punkt einer Reihe diese Sitzung steht - oder null.
//
// GENAU EINER, und der letzte, der passt: Wer bei "numri" steht, steht
// nicht auch bei "camera". Das ist der ganze Unterschied zum Trichter.
function schrittVon(sitzung) {
  const live = sitzung?.timings?.live;
  return live ? ({ prit: "result", porosia: "offer", fertig: "report" }[live] || live)
    : String(sitzung?.step || "");
}

// WAEHREND EINER LAUFENDEN ANALYSE GILT KEINE KAUFMARKE.
//
// Die Marken des Kaufwegs bleiben stehen, sobald sie einmal gefallen
// sind - ein Korb von vorhin, eine Kasse von gestern. Wer danach einen
// Scan anfaengt, stuende damit in der Kaufreihe und nicht dort, wo er
// wirklich ist: vor der Kamera.
//
// Diese Schritte heissen "ist gerade mitten in einer Analyse". Die
// Warteseite gehoert NICHT dazu: Dort ist er fertig, und wenn seine
// Kasse offensteht, ist das die frischere Auskunft.
const LAUFENDE_ANALYSE = new Set([
  "named", "camera", "captured", "fotopara", "fotokamera", "fotogati",
  "pyetja1", "pyetja2", "pyetja3", "pyetja4", "emri", "problemi", "numri", "aufbereitung"
]);

function punktFuer(punkte, sitzung) {
  const live = sitzung?.timings?.live;
  const step = schrittVon(sitzung);
  for (let i = punkte.length - 1; i >= 0; i -= 1) {
    const punkt = punkte[i];
    if (punkt.schritte.includes(step)) return punkt.id;
    // Eine Marke zaehlt genauso - der Bestellschirm und der Laden auf
    // der Landingpage schreiben keinen Schritt, sondern kasseGeoeffnet
    // beziehungsweise imKorb.
    if (!live && !LAUFENDE_ANALYSE.has(step)
      && (punkt.marken || []).some((marke) => sitzung?.[marke] === true)) return punkt.id;
  }
  return null;
}

// Eine Reihe von Punkten, mit der Zahl derer, die gerade dort stehen.
//
// `gesamt` ist die Zahl aller gerade Aktiven in dieser Reihe - sie steht im
// Chip darueber. Steht dort eine Eins, tut sich gerade etwas; steht dort
// eine Null, ist es ruhig. Genau das ist die Frage, die diese Ansicht
// beantwortet.
export function baueLiveReihe(punkte, sitzungen, jetzt = Date.now(), fenster = LIVE_FENSTER_MS) {
  const zahl = new Map(punkte.map((p) => [p.id, 0]));
  let gesamt = 0;
  for (const sitzung of Array.isArray(sitzungen) ? sitzungen : []) {
    if (istTest(sitzung) || !istGeradeAktiv(sitzung, jetzt, fenster)) continue;
    // WER IM KAUFWEG STEHT, STEHT NICHT AUCH IM ANALYSEWEG. Ein Mensch
    // an zwei Stellen gleichzeitig waere keine Auskunft, sondern eine
    // doppelte Zaehlung. Was dabei als Kaufweg gilt, entscheidet
    // punktFuer() - eine alte Marke gilt waehrend einer laufenden
    // Analyse nicht (siehe LAUFENDE_ANALYSE).
    if (punkte === LIVE_ANALYSE_PUNKTE && punktFuer(LIVE_BESTELL_PUNKTE, sitzung)) continue;
    const wo = punktFuer(punkte, sitzung);
    if (!wo) continue;
    zahl.set(wo, zahl.get(wo) + 1);
    gesamt += 1;
  }
  return {
    gesamt,
    punkte: punkte.map((p) => ({
      id: p.id,
      label: p.label,
      // Welche Farbe dieser Punkt traegt, wenn er leuchtet. Steht hier
      // nichts, ist er gruen wie die anderen. Die Farbe gehoert an die
      // Bedeutung des Punktes und nicht in den Zeichner: Sonst stuende
      // dort eine Abfrage auf einen Namen, und der naechste Umbau
      // veraendert den Namen und nicht die Farbe.
      ton: p.ton || "",
      anzahl: zahl.get(p.id),
      // Ein Punkt leuchtet, wenn dort jemand steht. Nur dann - ein Punkt,
      // der immer pulsiert, sagt nichts.
      aktiv: zahl.get(p.id) > 0
    }))
  };
}

// Beide Reihen auf einmal.
export function baueLive(sitzungen, jetzt = Date.now(), fenster = LIVE_FENSTER_MS, berichte = {}) {
  sitzungen = (Array.isArray(sitzungen) ? sitzungen : []).filter((s) => !istTest(s, berichte[s.id]));
  return {
    analysen: baueLiveReihe(LIVE_ANALYSE_PUNKTE, sitzungen, jetzt, fenster),
    bestellungen: baueLiveReihe(LIVE_BESTELL_PUNKTE, sitzungen, jetzt, fenster),
    stand: jetzt
  };
}

// Heart: eine Sitzung ohne ihren Klickpfad - fuer den Vergleich, ob sich
// ausser dem Pfad etwas geaendert hat.
export function ohnePfad(daten) {
  if (!daten || typeof daten !== "object") return daten;
  const timings = daten.timings && typeof daten.timings === "object" ? { ...daten.timings } : daten.timings;
  if (timings && typeof timings === "object") delete timings.pfad;
  return { ...daten, timings };
}
