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
export const LIVE_ANALYSE_PUNKTE = Object.freeze([
  { id: "start", label: "Fillo skanimin", schritte: ["opened", "named"] },
  { id: "skanimi", label: "Skanimi", schritte: ["camera", "captured"] },
  { id: "pyetjet", label: "Pyetjet", schritte: ["pyetja1", "pyetja2", "pyetja3", "pyetja4", "emri", "numri"] },
  { id: "pritja", label: "Pritja", schritte: ["aufbereitung", "result"] }
]);

// Die Punkte der Reihe "Live-Bestellungen".
//
// Sie faengt dort an, wo Geld ins Spiel kommt. Wer hier steht, hat seinen
// Befund gelesen und ueberlegt - das sind die drei Minuten, in denen sich
// entscheidet, ob heute etwas verkauft wird.
export const LIVE_BESTELL_PUNKTE = Object.freeze([
  { id: "kasse", label: "Kasse geoeffnet", schritte: ["offer"], marke: "kasseGeoeffnet" },
  { id: "anschrift", label: "Anschrift begonnen", schritte: ["address"] },
  { id: "bestellt", label: "Bestellt", schritte: ["ordered"] }
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
function punktFuer(punkte, sitzung) {
  const live = sitzung?.timings?.live;
  const step = live ? ({ prit: "result", porosia: "offer", fertig: "report" }[live] || live)
    : String(sitzung?.step || "");
  for (let i = punkte.length - 1; i >= 0; i -= 1) {
    const punkt = punkte[i];
    if (punkt.schritte.includes(step)) return punkt.id;
    // Eine Marke zaehlt genauso - der Bestellschirm schreibt keinen
    // Schritt, sondern kasseGeoeffnet.
    if (!live && punkt.marke && sitzung?.[punkt.marke] === true) return punkt.id;
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
