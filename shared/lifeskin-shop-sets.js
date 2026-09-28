// DIE SETS DES LADENS UNTER /lifeskinshop - Aufbau an einer Stelle.
//
// Gepflegt in Heart (Lifeskin Shop -> Mehr anzeigen -> Shop-Sets),
// gelesen vom Laden (apps/lifeskin-shop/shop.js). Ablage wie bei den
// Vorher/Nachher-Faellen (shared/lifeskin-raste.js):
//
//   lifeskin/{tenant}/config/shopSetet          { lista: [Set, ...] }
//   lifeskin/{tenant}/config/shopSetFoto-{id}   { foto: "data:image/..." }
//
// "config", weil firestore.rules dort genau das erlaubt, was gebraucht wird
// (lesen jeder, schreiben nur das CEO-Konto) - keine neue Regel. Das Bild
// je Set in einem eigenen Dokument: Ein Dokument darf 1 MiB, mehrere Bilder
// in der Liste wuerden die Grenze sprengen.
//
// Ohne gespeicherte Liste gelten die drei Sets, die heute auf der Seite
// stehen (SETET_STANDARD) - Heart zeigt sie, und die erste Aenderung
// speichert sie.

export const SETET_DOK = "shopSetet";
export const SET_FOTO_PRAEFIX = "shopSetFoto-";
export const SETET_MAX = 12;
export const SET_PRODUKTE_MAX = 4;

const ASSETS = "/apps/lifeskin-shop/assets/";

export const SETET_STANDARD = Object.freeze([
  Object.freeze({
    id: "acne", titulli: "Seti kundër akneve", nevoja: "Akne", etiketa: "AKNE + HIDRATIM",
    teksti: "Kujdes i përqendruar për aknet, i plotësuar me hidratim të përditshëm.",
    detaje: "LF ACNE për kujdesin e lëkurës me akne. LF MOISTUR për hidratimin që plotëson rutinën.",
    produkte: Object.freeze(["lf-acne", "lf-moistur"]), foto: `${ASSETS}lf-acne-3.jpg`, bild: false, aktiv: true
  }),
  Object.freeze({
    id: "pigment", titulli: "Seti për njollat", nevoja: "Njolla", etiketa: "NJOLLA + HIDRATIM",
    teksti: "Një rutinë për tonin e pabarabartë, me kujdes shtesë për hidratimin.",
    detaje: "LF PIGMENT për kujdesin e tonit të pabarabartë. LF MOISTUR për hidratimin e përditshëm.",
    produkte: Object.freeze(["lf-pigment", "lf-moistur"]), foto: `${ASSETS}lf-pigment.jpg`, bild: false, aktiv: true
  }),
  Object.freeze({
    id: "pore", titulli: "Seti për poret", nevoja: "Pore", etiketa: "PORE + HIDRATIM",
    teksti: "Kujdes për pamjen e poreve dhe teksturën, së bashku me hidratimin.",
    detaje: "LF PORE për kujdesin e pamjes së poreve. LF MOISTUR për hidratimin dhe barrierën e lëkurës.",
    produkte: Object.freeze(["lf-pore", "lf-moistur"]), foto: `${ASSETS}lf-pore.jpg`, bild: false, aktiv: true
  })
]);

// Die Bilder der Einzelmittel, solange Heart keine eigenen hat - dieselben
// Aufnahmen wie bisher auf der Seite.
export const MITTEL_FOTOS_STANDARD = Object.freeze({
  "lf-acne": `${ASSETS}lf-acne-3.jpg`,
  "lf-moistur": `${ASSETS}lf-moistur.jpg`,
  "lf-pigment": `${ASSETS}lf-pigment.jpg`,
  "lf-pore": `${ASSETS}lf-pore.jpg`
});

function text(w, max) {
  return String(w ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

// Ein eigenes Bild der Seite (/apps/...) oder nichts. Hochgeladene Bilder
// stehen im eigenen Dokument, nie in der Liste.
function ortsBild(w) {
  const s = String(w || "").trim();
  return /^\/apps\/[\w\-./]+\.(jpe?g|png|webp)$/i.test(s) && !s.includes("..") ? s : "";
}

export function neueSetId(jetzt = Date.now()) {
  return `s${jetzt.toString(36)}${Math.floor(Math.random() * 1296).toString(36).padStart(2, "0")}`;
}

// Kennung fuer den Filter oben ("Akne" -> "akne").
export function nevojaKennung(nevoja) {
  return text(nevoja, 30).toLowerCase()
    .replace(/ë/g, "e").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tjeter";
}

export function setNormalisieren(roh = {}) {
  const id = String(roh.id || "").replace(/[^\w-]/g, "").slice(0, 40);
  const produkte = [...new Set((Array.isArray(roh.produkte) ? roh.produkte : [])
    .map((p) => String(p || "").trim()).filter(Boolean))].slice(0, SET_PRODUKTE_MAX);
  return {
    id,
    titulli: text(roh.titulli, 60),
    nevoja: text(roh.nevoja, 30),
    etiketa: text(roh.etiketa, 40),
    teksti: text(roh.teksti, 200),
    detaje: text(roh.detaje, 400),
    produkte,
    foto: ortsBild(roh.foto),
    bild: roh.bild === true,
    aktiv: roh.aktiv !== false
  };
}

export function setetNormalisieren(liste) {
  const gesehen = new Set();
  const raus = [];
  for (const roh of Array.isArray(liste) ? liste : []) {
    const s = setNormalisieren(roh);
    if (!s.id || gesehen.has(s.id) || !s.titulli || s.produkte.length < 1) continue;
    gesehen.add(s.id);
    raus.push(s);
    if (raus.length >= SETET_MAX) break;
  }
  return raus;
}

export function setetOderStandard(dok) {
  return Array.isArray(dok?.lista) ? setetNormalisieren(dok.lista) : setetNormalisieren(SETET_STANDARD);
}

export function aktiveSetet(liste) {
  return (liste || []).filter((s) => s.aktiv);
}
