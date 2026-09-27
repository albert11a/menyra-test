// LIFESKIN 2 IN HEART - welcher Fall zu welchem Tab gehoert, und der
// Trichter des neuen Wegs vom Anzeigenklick bis zur Bestellung.
//
// Reines Rechnen: kein DOM, kein Firestore. Der Test gibt Sitzungen und
// Berichte hinein und sieht nach, was herauskommt.
//
// WARUM EIN EIGENER TRICHTER. Die sechs Trichter darunter zaehlen den Weg
// durch die Bildschirme. LifeSkin 2 verspricht aber etwas, das NACH dem
// Trichter passiert: Dr. Gashi prueft und antwortet auf WhatsApp, dann
// kommt das Urteil, dann der Kauf. Genau diese Strecke entscheidet, ob der
// neue Weg besser verkauft - also steht sie hier in einer Reihe, mit der
// Zeit bis zur Antwort daneben.
import { wegDerSitzung } from "../../shared/lifeskin-weg.js";
import { stufenIndex, istPatient } from "./heart-lifeskin-berechnung.js";

// Nur die Faelle eines Wegs. "" ist der bisherige Weg (/lifeskin) - dort
// bleiben alle Faelle ohne Merkmal, also auch jeder von vorher.
export function nachWeg(sitzungen, weg = "") {
  const w = String(weg || "");
  return (Array.isArray(sitzungen) ? sitzungen : []).filter((s) => wegDerSitzung(s) === w);
}

const FREI = ["fertig", "bestellt", "versandt", "zugestellt"];
const BESTELLT = ["bestellt", "versandt", "zugestellt"];

export function hatGeantwortet(bericht) {
  return FREI.includes(String(bericht?.status || ""));
}

export function hatBestellt(sitzung, bericht) {
  return sitzung?.hatBestellt === true || BESTELLT.includes(String(bericht?.status || ""));
}

// Minuten von der Abgabe (Bericht angelegt) bis zur Freigabe durch
// Dr. Gashi - oder null, solange sie nicht freigegeben hat.
export function antwortMinuten(bericht) {
  const ab = Date.parse(bericht?.createdAt || "");
  const bis = Date.parse(bericht?.freigabeAt || "");
  if (!Number.isFinite(ab) || !Number.isFinite(bis) || bis < ab) return null;
  return Math.round((bis - ab) / 60000);
}

function median(werte) {
  const liste = werte.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!liste.length) return null;
  const mitte = Math.floor(liste.length / 2);
  return liste.length % 2 ? liste[mitte] : Math.round((liste[mitte - 1] + liste[mitte]) / 2);
}

// "12 min", "2 h 5 min", "1 T 3 h".
export function dauerText(minuten) {
  if (!Number.isFinite(minuten)) return "—";
  if (minuten < 60) return `${minuten} min`;
  const h = Math.floor(minuten / 60);
  if (h < 24) return `${h} h${minuten % 60 ? ` ${minuten % 60} min` : ""}`;
  return `${Math.floor(h / 24)} T${h % 24 ? ` ${h % 24} h` : ""}`;
}

// DIE STUFEN - kumulativ wie die Trichter darunter: Wer bestellt hat, steht
// in jeder Stufe davor. Die Reihenfolge ist die des Kunden (docs/lifeskin-2.md).
export const LS2_STUFEN = Object.freeze([
  { id: "landing", label: "Landing gesehen", gilt: (s) => s?.gesehen !== false },
  { id: "start", label: "„Shiko nëse më përshtatet“", gilt: (s) => stufenIndex(s?.step) >= stufenIndex("wahl") },
  { id: "fragen", label: "4 Fragen fertig", gilt: (s) => stufenIndex(s?.step) >= stufenIndex("emri") },
  { id: "nummer", label: "Nummer (Lead)", gilt: (s) => stufenIndex(s?.step) >= stufenIndex("numri") || Boolean(s?.phone) },
  { id: "abgabe", label: "Abgegeben", gilt: (s) => istPatient(s) },
  { id: "antwort", label: "Dr. Gashi hat geantwortet", gilt: (s, b) => hatGeantwortet(b) },
  { id: "gesehen", label: "Urteil geöffnet", gilt: (s, b) => s?.berichtGeoeffnet === true || hatBestellt(s, b) },
  { id: "kasse", label: "Kasse geöffnet", gilt: (s, b) => s?.kasseGeoeffnet === true || hatBestellt(s, b) },
  { id: "bestellt", label: "Bestellt", gilt: (s, b) => hatBestellt(s, b) }
]);

// Der Trichter von LifeSkin 2 fuer eine Liste Sitzungen (schon auf den Weg
// und den Zeitraum gefiltert). Stufen im Format von renderStufen.
export function baueLs2Weg(sitzungen, berichte = {}) {
  const liste = Array.isArray(sitzungen) ? sitzungen : [];
  const bericht = (s) => berichte?.[s?.id] || null;
  // Kumulativ erzwingen: Wer eine spaetere Stufe erreicht hat, zaehlt in
  // jeder davor - auch wenn eine Marke dazwischen fehlt (altes Geraet,
  // abgebrochener Schreibvorgang).
  const erreicht = liste.map((s) => {
    let weiteste = -1;
    LS2_STUFEN.forEach((stufe, i) => { if (stufe.gilt(s, bericht(s))) weiteste = i; });
    return weiteste;
  });
  const stufen = LS2_STUFEN.map((stufe, i) => ({
    id: stufe.id,
    label: stufe.label,
    anzahl: erreicht.filter((w) => w >= i).length
  }));
  stufen.forEach((stufe, i) => {
    const vorher = i ? stufen[i - 1].anzahl : stufe.anzahl;
    stufe.verlust = i && vorher ? (vorher - stufe.anzahl) / vorher : 0;
  });

  // Die Zeit bis zur Antwort - die wichtigste Zahl nach dem Kauf selbst:
  // Wer innerhalb einer Stunde hoert, kauft deutlich oefter.
  const minuten = liste.map((s) => antwortMinuten(bericht(s))).filter((m) => m !== null);
  const wartend = liste.filter((s) => istPatient(s) && !hatGeantwortet(bericht(s)));
  const leads = stufen.find((s) => s.id === "nummer")?.anzahl || 0;
  const kaeufe = stufen.at(-1)?.anzahl || 0;
  return {
    stufen,
    antwortMedian: median(minuten),
    antwortUnterStunde: minuten.filter((m) => m <= 60).length,
    beantwortet: minuten.length,
    wartend: wartend.length,
    // Der Satz, den man fuer die 5 € am Tag braucht: Wie viele der Leads
    // kaufen am Ende?
    kaufProLead: leads ? kaeufe / leads : 0
  };
}
