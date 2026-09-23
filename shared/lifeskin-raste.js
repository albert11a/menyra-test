// DIE ERGEBNISSE ANDERER - Vorher/Nachher-Faelle an EINER Stelle.
//
// Sie stehen auf der Landingpage (Abschnitt "Rezultate") und auf der
// Therapieseite jedes Befunds. Gepflegt werden sie in Heart: anlegen,
// aendern, loeschen, sortieren, und je Fall entscheiden, wo er erscheint -
// nur Landing, nur Analyseseite, beides oder nirgends.
//
// WO ES LIEGT: lifeskin/<tenant>/config
//   raste          { lista: [Fall, ...], ndryshuarAt }  - klein, nur Text
//   rasti-<id>     { para, pas }                       - die zwei Bilder
// Die Bilder liegen je Fall in einem eigenen Dokument, aus demselben Grund
// wie die Landingbilder der Produkte: ein Dokument darf 1 MiB, und zwei
// gepresste Aufnahmen passen bequem hinein, zwanzig nicht. "config" ist
// oeffentlich lesbar und nur vom CEO-Konto schreibbar - genau das, was
// hier gebraucht wird, ohne neue Regel.
//
// GIBT ES DAS DOKUMENT NICHT, gilt RASTE_STANDARD: die vier Faelle, die
// vorher fest in der Landingpage standen. Die Seiten sehen dann genau so
// aus wie vorher.
//
// Ohne Abhaengigkeit von einer App: Landing, Therapieseite und Heart holen
// sich dieses Modul, und "shared" haengt an keiner von ihnen.

export const RASTE_DOK = "raste";
export const RASTI_BILD_PRAEFIX = "rasti-";
export const RASTE_MAX = 30;
export const RASTI_PRODUKTE_MAX = 5;

const FOTOT = "/apps/lifeskin-landing/fotot/";

export const RASTE_STANDARD = Object.freeze([
  {
    id: "r1", emri: "Pacienti 1 · 26 vjeç", gjetja: "Akne inflamatore",
    produkte: ["lf-acne", "lf-moistur"], emrat: ["LF ACNE", "LF MOISTUR"], cmimi: 39,
    para: `${FOTOT}rasti-1-dita1.jpg`, pas: `${FOTOT}rasti-1-dita28.jpg`, bild: false,
    landing: true, analiza: true
  },
  {
    id: "r2", emri: "Pacienti 2 · 24 vjeç", gjetja: "Akne hormonale",
    produkte: ["lf-acne", "lf-moistur"], emrat: ["LF ACNE", "LF MOISTUR"], cmimi: 39,
    para: `${FOTOT}rasti-2-dita1.jpg`, pas: `${FOTOT}rasti-2-dita28.jpg`, bild: false,
    landing: true, analiza: false
  },
  {
    id: "r3", emri: "Pacienti 3 · 22 vjeç", gjetja: "Akne & pore të mëdha",
    produkte: ["lf-acne", "lf-moistur", "lf-pore"], emrat: ["LF ACNE", "LF MOISTUR", "LF PORE"], cmimi: 49,
    para: `${FOTOT}rasti-3-dita1.jpg`, pas: `${FOTOT}rasti-3-dita28.jpg`, bild: false,
    landing: true, analiza: true
  },
  {
    id: "r4", emri: "Pacienti 4 · 29 vjeç", gjetja: "Njolla & hiperpigmentim",
    produkte: ["lf-pigment", "lf-moistur"], emrat: ["LF PIGMENT", "LF MOISTUR"], cmimi: 39,
    para: `${FOTOT}rasti-4-dita1.jpg`, pas: `${FOTOT}rasti-4-dita28.jpg`, bild: false,
    landing: true, analiza: true
  }
].map((r) => Object.freeze(r)));

const text = (w, max) => String(w ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Ein Bildweg ist entweder eine eigene Datei der Seite (/apps/...) oder
// ein Datenbild. Alles andere - fremde Adressen, javascript: - faellt weg.
export function bildWeg(w) {
  const s = String(w || "").trim();
  if (s.startsWith("data:image/")) return s;
  if (/^\/apps\/[\w\-./]+\.(jpe?g|png|webp)$/i.test(s) && !s.includes("..")) return s;
  return "";
}

export function neueRastiId(jetzt = Date.now()) {
  return `r${jetzt.toString(36)}${Math.floor(Math.random() * 1296).toString(36).padStart(2, "0")}`;
}

// Ein Fall in sauberer Form. Datenbilder gehoeren NIE in den Index - die
// stehen im eigenen Dokument; im Index steht nur, dass es welche gibt.
export function rastiNormalisieren(roh = {}) {
  const id = String(roh.id || "").replace(/[^\w-]/g, "").slice(0, 40);
  const produkte = (Array.isArray(roh.produkte) ? roh.produkte : [])
    .map((p) => String(p || "").trim()).filter(Boolean).slice(0, RASTI_PRODUKTE_MAX);
  const emrat = (Array.isArray(roh.emrat) ? roh.emrat : [])
    .map((p) => text(p, 40)).slice(0, produkte.length);
  const cmimi = Number(roh.cmimi);
  const para = bildWeg(roh.para);
  const pas = bildWeg(roh.pas);
  return {
    id,
    emri: text(roh.emri, 80),
    gjetja: text(roh.gjetja, 90),
    produkte,
    emrat,
    cmimi: Number.isFinite(cmimi) && cmimi > 0 ? Math.round(cmimi * 100) / 100 : 0,
    para: para.startsWith("data:") ? "" : para,
    pas: pas.startsWith("data:") ? "" : pas,
    bild: roh.bild === true,
    landing: roh.landing === true,
    analiza: roh.analiza === true
  };
}

export function rasteNormalisieren(liste) {
  const gesehen = new Set();
  const raus = [];
  for (const roh of Array.isArray(liste) ? liste : []) {
    const r = rastiNormalisieren(roh);
    if (!r.id || gesehen.has(r.id)) continue;
    gesehen.add(r.id);
    raus.push(r);
    if (raus.length >= RASTE_MAX) break;
  }
  return raus;
}

// Die Liste, mit der gerechnet wird: die gespeicherte, sonst der Standard.
export function rasteOderStandard(dok) {
  return Array.isArray(dok?.lista) ? rasteNormalisieren(dok.lista) : rasteNormalisieren(RASTE_STANDARD);
}

export function rasteFuer(liste, ort) {
  return (liste || []).filter((r) => (ort === "landing" ? r.landing : r.analiza));
}

// Der Standardfall einer Analyse: der Fall mit den meisten gleichen
// Produkten, bei Gleichstand der weiter oben stehende. So zeigt eine
// Seite, die nur LF PIGMENT verschreibt, den Pigmentfall und nicht den
// ersten Aknefall.
export function rastiStandard(liste, produktIds = []) {
  const kandidaten = rasteFuer(liste, "analiza");
  if (!kandidaten.length) return null;
  const set = new Set((produktIds || []).map(String));
  let bester = kandidaten[0];
  let punkte = -1;
  for (const r of kandidaten) {
    const gleich = r.produkte.filter((p) => set.has(p)).length;
    // Gleich viele Treffer: der Fall ohne fremde Produkte gewinnt.
    const wert = gleich * 10 - (r.produkte.length - gleich);
    if (wert > punkte) { punkte = wert; bester = r; }
  }
  return bester;
}

// Die Faelle EINER Analyseseite: die in Heart gewaehlten, in dieser
// Reihenfolge - solange es sie noch gibt und sie fuer die Analyseseite
// eingeschaltet sind. Bleibt nichts uebrig, steht der Standardfall da:
// weniger als einer ist es nie, solange ueberhaupt einer freigegeben ist.
export function rasteFuerBericht(liste, gewaehlt, produktIds = []) {
  const erlaubt = new Map(rasteFuer(liste, "analiza").map((r) => [r.id, r]));
  const raus = [];
  for (const id of Array.isArray(gewaehlt) ? gewaehlt : []) {
    const r = erlaubt.get(String(id));
    if (r && !raus.includes(r)) raus.push(r);
  }
  if (raus.length) return raus;
  const standard = rastiStandard(liste, produktIds);
  return standard ? [standard] : [];
}

export function rastiProdukteText(r) {
  const namen = r.emrat?.length === r.produkte.length && r.emrat.every(Boolean)
    ? r.emrat
    : r.produkte.map((p) => String(p).replace(/^lf-/i, "LF ").toUpperCase());
  return namen.join(" + ");
}

// ── Lesen ohne Firebase-App (Landing, Therapieseite) ──────────────────
function wertAus(feld) {
  if (!feld || typeof feld !== "object") return null;
  if ("stringValue" in feld) return feld.stringValue;
  if ("integerValue" in feld) return Number(feld.integerValue);
  if ("doubleValue" in feld) return Number(feld.doubleValue);
  if ("booleanValue" in feld) return feld.booleanValue;
  if ("arrayValue" in feld) return (feld.arrayValue.values || []).map(wertAus);
  if ("mapValue" in feld) {
    const raus = {};
    for (const [k, v] of Object.entries(feld.mapValue.fields || {})) raus[k] = wertAus(v);
    return raus;
  }
  return null;
}

async function dokHolen(adresse, holen) {
  const antwort = await holen(adresse);
  if (antwort.status === 404) return null;
  if (!antwort.ok) throw new Error(`Firestore ${antwort.status}`);
  const roh = await antwort.json();
  const raus = {};
  for (const [k, v] of Object.entries(roh?.fields || {})) raus[k] = wertAus(v);
  return raus;
}

// Die Liste aus Firestore. null heisst: Es gibt noch keine gespeicherte -
// die Seite laesst dann stehen, was sie hat.
export async function rasteLaden(basis, holen = (...a) => globalThis.fetch(...a)) {
  const dok = await dokHolen(`${basis}/${RASTE_DOK}`, holen);
  return dok && Array.isArray(dok.lista) ? rasteNormalisieren(dok.lista) : null;
}

// Die Bilder der Faelle, die sie brauchen - parallel, und ein Fall, dessen
// Bilder nicht kommen, faellt weg statt als graue Kachel dazustehen.
export async function rasteMitBildern(faelle, basis, holen = (...a) => globalThis.fetch(...a)) {
  const fertig = await Promise.all((faelle || []).map(async (r) => {
    if (!r.bild) return r.para && r.pas ? r : null;
    try {
      const b = await dokHolen(`${basis}/${RASTI_BILD_PRAEFIX}${r.id}`, holen);
      // Ein Bild im eigenen Dokument geht vor; die andere Seite darf
      // weiter eine Datei der Seite sein (nur eines ausgetauscht).
      const para = bildWeg(b?.para) || r.para;
      const pas = bildWeg(b?.pas) || r.pas;
      return para && pas ? { ...r, para, pas } : null;
    } catch {
      return null;
    }
  }));
  return fertig.filter(Boolean);
}

export function escapeRasti(w) {
  return String(w ?? "").replace(/[&<>"']/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z]));
}
