// DIE AUSWAHL VOR DEM PROMPT - auf dem Geraet gemerkt.
//
// Der Weg ist: Produkte anhaken, "Wofuer" eintragen, Prompt kopieren,
// zur KI wechseln, zurueckkommen, JSON einfuegen. Auf dem Telefon legt das
// System Heart waehrenddessen oft schlafen oder laedt es neu - und die
// Haken, die nur im Formular standen, waren weg. Man musste dieselben zwei
// Produkte noch einmal waehlen.
//
// Deshalb geht jede Aenderung an Produkten, "Wofuer", Analyse-Art und
// Preis sofort hierher (localStorage, je Fall). Beim Zeichnen eines noch
// nicht freigegebenen Falls steht die gemerkte Auswahl wieder da. Nach der
// Freigabe gilt der gespeicherte Befund, und der Entwurf wird geloescht.

const PRAEFIX = "heart.lifeskin.entwurf.";
const HALTBAR_MS = 14 * 24 * 60 * 60 * 1000;

function speicher() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function entwurfLesen(fallId) {
  const s = speicher();
  if (!s || !fallId) return null;
  try {
    const roh = JSON.parse(s.getItem(PRAEFIX + fallId) || "null");
    if (!roh || typeof roh !== "object") return null;
    if (Date.now() - Number(roh.am || 0) > HALTBAR_MS) { s.removeItem(PRAEFIX + fallId); return null; }
    return {
      produkte: Array.isArray(roh.produkte) ? roh.produkte.map(String).filter(Boolean) : [],
      zweck: roh.zweck && typeof roh.zweck === "object" ? roh.zweck : {},
      art: roh.art === "pa-foto" ? "pa-foto" : roh.art === "foto" ? "foto" : "",
      weg: ["skanim", "foto", "trup", "pytje"].includes(roh.weg) ? roh.weg : "",
      preis: Number(roh.preis) > 0 ? Number(roh.preis) : 0
    };
  } catch {
    return null;
  }
}

export function entwurfSchreiben(fallId, werte = {}) {
  const s = speicher();
  if (!s || !fallId) return;
  try { s.setItem(PRAEFIX + fallId, JSON.stringify({ ...werte, am: Date.now() })); } catch { /* voll oder gesperrt */ }
}

export function entwurfLoeschen(fallId) {
  const s = speicher();
  if (!s || !fallId) return;
  try { s.removeItem(PRAEFIX + fallId); } catch { /* egal */ }
}

// Was gerade im Bogen steht - aus dem DOM gelesen.
export function entwurfAusBogen(wurzel = globalThis.document) {
  const produkte = [...wurzel.querySelectorAll("[data-produkt-wahl]:checked")].map((k) => String(k.value));
  const zweck = {};
  for (const feld of wurzel.querySelectorAll("[data-produkt-zweck]")) {
    const wert = String(feld.value || "").trim();
    if (wert) zweck[feld.getAttribute("data-produkt-zweck")] = wert;
  }
  return {
    produkte,
    zweck,
    art: wurzel.querySelector("[data-bogen-art]")?.value || "",
    weg: wurzel.querySelector("[data-bogen-weg]")?.value || "",
    preis: Number(wurzel.querySelector("#lifeskin-preis")?.value) || 0
  };
}

// PROMPT GEMACHT - je Fall auf dem Geraet gemerkt. Gesetzt, sobald der
// Prompt kopiert oder eine Antwort eingefuegt wurde. Die Fallliste zeigt
// daran im Fach "Offen" den Chip "Prompt" farbig.
const PROMPT_SCHLUESSEL = "heart.lifeskin.prompt";

function promptListe() {
  const s = speicher();
  if (!s) return {};
  try {
    const roh = JSON.parse(s.getItem(PROMPT_SCHLUESSEL) || "{}");
    return roh && typeof roh === "object" ? roh : {};
  } catch {
    return {};
  }
}

export function promptMerken(fallId) {
  const s = speicher();
  if (!s || !fallId) return;
  const liste = promptListe();
  if (liste[fallId]) return;
  liste[fallId] = Date.now();
  // Nicht endlos wachsen: Aelter als die Haltbarkeit eines Entwurfs faellt raus.
  for (const [id, am] of Object.entries(liste)) if (Date.now() - Number(am || 0) > HALTBAR_MS) delete liste[id];
  try { s.setItem(PROMPT_SCHLUESSEL, JSON.stringify(liste)); } catch { /* voll oder gesperrt */ }
}

export function promptGemacht(fallId) {
  return Boolean(fallId && promptListe()[fallId]);
}
