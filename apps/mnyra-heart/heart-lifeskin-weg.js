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
import { wegDerSitzung, zaehltImWeg } from "../../shared/lifeskin-weg.js";
import { stufenIndex, istPatient, istLanding, typVon } from "./heart-lifeskin-berechnung.js";
import { SHOP_ABSCHNITTE, shopTiefe, TERAPIA_ABSCHNITTE, terapiaTiefe } from "../../shared/lifeskin-shopsicht.js";

// Nur die Faelle eines Wegs. "" ist der bisherige Weg (/lifeskin) - dort
// bleiben alle Faelle ohne Merkmal, also auch jeder von vorher.
// Und nur ab dem Zaehlbeginn des Wegs (WEG_ZAEHLT_AB in
// shared/lifeskin-weg.js) - mit { alle: true } auch die davor.
export function nachWeg(sitzungen, weg = "", { alle = false } = {}) {
  const w = String(weg || "");
  return (Array.isArray(sitzungen) ? sitzungen : [])
    .filter((s) => wegDerSitzung(s) === w && (alle || zaehltImWeg(s, w)));
}

// Wie viele Besuche des Wegs vor dem Zaehlbeginn liegen - und wie viele
// davon eine Bestellung tragen. Heart sagt es, damit nichts still
// verschwindet.
export function vorDemZaehlbeginn(sitzungen, weg = "") {
  const alt = nachWeg(sitzungen, weg, { alle: true }).filter((s) => !zaehltImWeg(s, weg));
  return { anzahl: alt.length, bestellt: alt.filter((s) => s?.order || s?.hatBestellt === true || s?.bestelltAt).length };
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

// ══ LIFESKIN SHOP (/lifeskinshop) ═══════════════════════════════════════
//
// Zwei Wege auf einer Seite: direkt kaufen (Set oder Einzelmittel) und
// "Gjeni setin" in die Analyse (Lead bei der Nummer). Beide stehen hier in
// einer Reihe, dazu Umsatz, Bestellwert und was gekauft wird.
const istShopKauf = (s) => s?.hatBestellt === true;
const imKorbS = (s) => s?.imKorb === true || s?.kasseGeoeffnet === true || istShopKauf(s);

// DIE SEITE, ABSCHNITT FUER ABSCHNITT (1-9) - wie weit jemand gekommen
// ist (shared/lifeskin-shopsicht.js; die Namen hat der Inhaber vergeben).
// Wer bis 5 gescrollt hat, zaehlt auch bei 1 bis 4: Die Zahl heisst "bis
// hierher", und kein Balken kann laenger sein als der davor.
export const SHOP_SEITE = Object.freeze(SHOP_ABSCHNITTE.map((a) => Object.freeze({
  id: `s${a.nr}`,
  nr: a.nr,
  label: a.name,
  gilt: a.nr === 1 ? (s) => istLanding(s) || shopTiefe(s) > 1 : (s) => shopTiefe(s) >= a.nr
})));

// DER KAUF (10-13) - eine eigene Reihe und nicht die Fortsetzung der
// Seite: Wer oben auf "Porosit setin" tippt und kauft, war nie bei
// "Fundi". In einer Reihe gezaehlt, stuende er dort trotzdem.
export const SHOP_KAUF = Object.freeze([
  { id: "korb", nr: 10, label: "Shport", gilt: imKorbS },
  { id: "kasse", nr: 11, label: "Arka", gilt: (s) => s?.kasseGeoeffnet === true || istShopKauf(s) },
  { id: "anschrift", nr: 12, label: "Adresa", gilt: (s) => s?.adresseBegonnen === true || istShopKauf(s) },
  { id: "bestellt", nr: 13, label: "Gotat Nalt", gilt: istShopKauf }
].map((stufe) => Object.freeze(stufe)));

// ══ DIE CHIPS DER KARTE "SHOP": Scan, Foto, Analyse (29.09.) ═══════════
//
// Wunsch Inhaber: dieselbe Karte, je Chip ein Weg Bildschirm fuer
// Bildschirm - 13 Punkte. Beim Scan und beim Foto sollen 3 und 4 Fehler
// zeigen: akzeptiert, aber kein Bild; Bild, aber nicht fertig.
//
// "bildDa" und "nummerGetippt" sind Marken unter timings.weg
// (lifeskin-session.js); "Loading fertig" ist der Schritt "result", den der
// Trichter erst setzt, wenn der Bericht steht. Gezaehlt wird wie immer "bis
// hierher" (stufenZaehlen), und nur, wer diesen Weg gewaehlt hat (typVon).
const abSchritt = (schritt) => (s) => stufenIndex(s?.step) >= stufenIndex(schritt);
const wegMarke = (name) => (s) => s?.timings?.weg?.[name] === true;

function wegStufen({ anleitung, akzeptiert, gestartet, fertig, fertigSchritt }) {
  return Object.freeze([
    { nr: 1, id: "anleitung", label: "Anleitung", gilt: abSchritt(anleitung) },
    { nr: 2, id: "akzeptiert", label: akzeptiert, gilt: (s) => s?.kameraOk === true },
    { nr: 3, id: "gestartet", label: gestartet, gilt: wegMarke("bildDa") },
    { nr: 4, id: "fertig", label: fertig, gilt: abSchritt(fertigSchritt) },
    { nr: 5, id: "frage1", label: "Frage 1", gilt: abSchritt("pyetja1") },
    { nr: 6, id: "frage2", label: "Frage 2", gilt: abSchritt("pyetja2") },
    { nr: 7, id: "frage3", label: "Frage 3", gilt: abSchritt("pyetja3") },
    { nr: 8, id: "name", label: "Name +", gilt: abSchritt("emri") },
    { nr: 9, id: "nummer", label: "Nummer", gilt: abSchritt("numri") },
    // Besuche von vor der Marke: wer eine Nummer hinterlassen hat, hat getippt.
    { nr: 10, id: "nummerFeld", label: "Nummer Feld", gilt: (s) => wegMarke("nummerGetippt")(s) || Boolean(s?.phone) },
    { nr: 11, id: "loading", label: "Loading", gilt: abSchritt("aufbereitung") },
    { nr: 12, id: "loadingFertig", label: "Loading fertig", gilt: abSchritt("result") },
    { nr: 13, id: "patient", label: "Patient", gilt: istPatient }
  ].map((stufe) => Object.freeze(stufe)));
}

export const SHOP_SCAN = wegStufen({
  anleitung: "named", akzeptiert: "Scan akzeptiert", gestartet: "Scan gestartet", fertig: "Scan fertig", fertigSchritt: "captured"
});
export const SHOP_FOTO = wegStufen({
  anleitung: "fotopara", akzeptiert: "Foto akzeptiert", gestartet: "Foto gestartet", fertig: "Foto fertig", fertigSchritt: "fotogati"
});

// DIE ANALYSESEITE (1-9, TERAPIA_ABSCHNITTE) und ihr Kauf (10-13) - wie
// die Karte "Shop", nur ueber die Seite mit dem Ergebnis. Der Kauf zaehlt
// nur, was auf DIESER Seite geschah: timings.kauf (neue Fassung), sonst
// die alten Marken, aber nur ohne Korb im Laden - dessen Kasse ist nicht
// die der Analyseseite.
const ohneLadenKorb = (s) => s?.imKorb !== true;
export const SHOP_ANALYSE_SEITE = Object.freeze(TERAPIA_ABSCHNITTE.map((a) => Object.freeze({
  id: `t${a.nr}`, nr: a.nr, label: a.name, gilt: (s) => terapiaTiefe(s) >= a.nr
})));
// 10 SHPORT = EIN KAUFKNOPF DER ANALYSESEITE GEDRUECKT (29.09., Inhaber:
// "wenn er Button drueckt, dann Shport"): timings.kauf.knopf. Nur den
// Preis gesehen zaehlt nicht - das ist kein Warenkorb (Meta bekommt dafuer
// trotzdem AddToCart, Pixel gesperrt). Der Knopf oeffnet gleich die Kasse;
// wer die Kasse offen hatte, hat also gedrueckt (auch ueber das
// Medienfenster, das keine Knopf-Marke schreibt, und Besuche vor der
// Marke). Shport ueber Arka heisst: gedrueckt, aber die Kasse ging nicht auf.
const analyseKasse = (s) => Boolean(s?.timings?.kauf?.kasse) || (ohneLadenKorb(s) && s?.kasseGeoeffnet === true);
export const SHOP_ANALYSE_KAUF = Object.freeze([
  { nr: 10, id: "korb", label: "Shport", gilt: (s) => Boolean(s?.timings?.kauf?.knopf) || analyseKasse(s) },
  { nr: 11, id: "kasse", label: "Arka", gilt: analyseKasse },
  { nr: 12, id: "anschrift", label: "Adresa", gilt: (s) => Boolean(s?.timings?.kauf?.eingabe)
    || (ohneLadenKorb(s) && (s?.hatAnschrift === true || s?.adresseBegonnen === true)) },
  { nr: 13, id: "bestellt", label: "Gotat Nalt", gilt: (s) => s?.hatBestellt === true && s?.shopKauf !== true }
].map((stufe) => Object.freeze(stufe)));

// Die Analyse ueber "Gjeni setin". Ein Kauf im Laden schreibt auch eine
// Nummer (Kasse) und den Schritt "ordered" - er zaehlt hier nur, wenn
// wirklich ein Weg der Analyse gewaehlt wurde (typ) oder die Sitzung ohne
// Ladenkauf im Trichter steht.
const inAnalyse = (s) => Boolean(s?.typ) || (!s?.shopKauf && stufenIndex(s?.step) >= stufenIndex("wahl"));
export const SHOP_ANALYSE_STUFEN = Object.freeze([
  { id: "start", label: "„Gjeni setin“ gestartet", gilt: inAnalyse },
  { id: "nummer", label: "Nummer (Lead)", gilt: (s) => inAnalyse(s) && (Boolean(s?.phone) || stufenIndex(s?.step) >= stufenIndex("numri")) },
  { id: "abgabe", label: "Analyse abgegeben", gilt: (s) => inAnalyse(s) && istPatient(s) }
]);

function stufenZaehlen(liste, stufen) {
  const erreicht = liste.map((s) => {
    let weiteste = -1;
    stufen.forEach((stufe, i) => { if (stufe.gilt(s)) weiteste = i; });
    return weiteste;
  });
  const raus = stufen.map((stufe, i) => ({ id: stufe.id, nr: stufe.nr, label: stufe.label, anzahl: erreicht.filter((w) => w >= i).length }));
  raus.forEach((stufe, i) => {
    const vorher = i ? raus[i - 1].anzahl : stufe.anzahl;
    stufe.verlust = i && vorher ? (vorher - stufe.anzahl) / vorher : 0;
  });
  return raus;
}

export function baueShopWeg(sitzungen) {
  const liste = Array.isArray(sitzungen) ? sitzungen : [];
  const seite = stufenZaehlen(liste, SHOP_SEITE);
  const kauf = stufenZaehlen(liste, SHOP_KAUF);
  const kaeufe = liste.filter(istShopKauf);
  const umsatz = kaeufe.reduce((summe, s) => summe + (Number(s?.order?.total) || 0), 0);
  // Was gekauft wurde: je Set, und Einzelmittel ohne Set.
  const nachSet = new Map();
  for (const s of kaeufe) {
    const name = s?.order?.set?.titulli || (s?.order?.kind === "shop" ? "Einzelmittel" : "Über die Analyse");
    nachSet.set(name, (nachSet.get(name) || 0) + 1);
  }
  const analyse = stufenZaehlen(liste, SHOP_ANALYSE_STUFEN);
  const koerbe = liste.filter(imKorbS);
  // OHNE KAEUFE IM LADEN: Wer dort gekauft hat, steht auf "ordered" - und
  // weil schritt() nie zurueckgeht, saehe jeder Punkt dieses Wegs erreicht
  // aus. Sein Kauf steht im Chip Shop.
  const imWeg = (typ) => (s) => typVon(s) === typ && s?.shopKauf !== true;
  const scanListe = liste.filter(imWeg("scan"));
  const fotoListe = liste.filter(imWeg("foto"));
  const seitenListe = liste.filter((s) => terapiaTiefe(s) >= 1);
  const scan = stufenZaehlen(scanListe, SHOP_SCAN);
  const foto = stufenZaehlen(fotoListe, SHOP_FOTO);
  const analyseSeite = stufenZaehlen(seitenListe, SHOP_ANALYSE_SEITE);
  const analyseKauf = stufenZaehlen(seitenListe, SHOP_ANALYSE_KAUF);
  return {
    seite,
    kauf,
    analyse,
    // Die Chips: je ein Weg, Balken am ersten Punkt des Chips.
    chips: {
      scan: { stufen: scan, basis: scan[0]?.anzahl || 0 },
      foto: { stufen: foto, basis: foto[0]?.anzahl || 0 },
      analyse: { stufen: analyseSeite, kauf: analyseKauf, basis: analyseSeite[0]?.anzahl || 0 }
    },
    // Der Massstab fuer alle Balken der Karte: die Shop-Besucher (1).
    besucher: seite[0]?.anzahl || 0,
    besuche: liste.length,
    kaeufe: kaeufe.length,
    umsatz,
    bestellwert: kaeufe.length ? Math.round((umsatz / kaeufe.length) * 100) / 100 : 0,
    korbwert: koerbe.length
      ? Math.round((koerbe.reduce((summe, s) => summe + (Number(s?.korbWert) || 0), 0) / koerbe.length) * 100) / 100
      : 0,
    kaufquote: liste.length ? kaeufe.length / liste.length : 0,
    nachSet: [...nachSet.entries()].sort((a, b) => b[1] - a[1])
  };
}
