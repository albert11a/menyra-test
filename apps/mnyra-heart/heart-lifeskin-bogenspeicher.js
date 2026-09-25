// DER BEFUNDBOGEN AUF DEM GERAET - fuer den Fall, dass Heart neu laedt.
//
// Wer zur Fallliste geht und zurueckkommt, bekommt den Bogen aus dem
// Archiv in heart-render.js zurueck, als denselben Knoten. Laedt Heart
// aber neu - das Telefon hat es schlafen gelegt, oder jemand zieht die
// Seite herunter -, ist auch das Archiv weg. Dafuer steht hier, was im
// Bogen GEAENDERT wurde: nur Felder, deren Wert vom gezeichneten Stand
// abweicht, je Fall, und nur gueltig fuer genau den gespeicherten Stand,
// auf dem gearbeitet wurde (der data-bewahren-Schluessel). Wurde der
// Befund inzwischen gespeichert - hier oder auf einem anderen Geraet -,
// passt der Schluessel nicht mehr, und nichts wird ueberschrieben.

const PRAEFIX = "heart.lifeskin.bogen.";
const HALTBAR_MS = 14 * 24 * 60 * 60 * 1000;

function speicher() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function fallVonSchluessel(schluessel) {
  return String(schluessel || "").split(":")[1] || "";
}

// Ein Name je Feld, der beim naechsten Zeichnen wieder derselbe ist: die
// data-Attribute und die Kennung, bei Haken auch ihr Wert - dazu die
// Stelle unter gleichnamigen.
function felderMitNamen(knoten) {
  const gezaehlt = new Map();
  const raus = [];
  for (const el of knoten.querySelectorAll("input, textarea, select")) {
    const typ = String(el.type || "").toLowerCase();
    if (["file", "button", "submit"].includes(typ) || el.readOnly) continue;
    const attrs = [...el.attributes]
      .filter((a) => a.name.startsWith("data-") && !a.name.startsWith("data-tv"))
      .map((a) => `${a.name}=${a.value}`).sort().join("&");
    const haken = typ === "checkbox" || typ === "radio";
    const basis = `${el.tagName}|${el.id || ""}|${attrs}${haken ? `|${el.value}` : ""}`;
    if (!el.id && !attrs) continue;
    const n = gezaehlt.get(basis) || 0;
    gezaehlt.set(basis, n + 1);
    raus.push([`${basis}#${n}`, el, haken]);
  }
  return raus;
}

function standVon(el, haken) {
  if (haken) return el.checked;
  return el.value;
}

function ursprung(el, haken) {
  if (haken) return el.defaultChecked;
  if (el.tagName === "SELECT") {
    const opt = [...el.options].find((o) => o.defaultSelected) || el.options[0];
    return opt ? opt.value : "";
  }
  return el.defaultValue;
}

export function bogenAenderungen(knoten) {
  const werte = {};
  for (const [name, el, haken] of felderMitNamen(knoten)) {
    const jetzt = standVon(el, haken);
    if (jetzt !== ursprung(el, haken)) werte[name] = jetzt;
  }
  return werte;
}

export function bogenMerken(knoten) {
  const s = speicher();
  const schluessel = knoten?.getAttribute?.("data-bewahren") || "";
  const fall = fallVonSchluessel(schluessel);
  if (!s || !fall) return;
  const werte = bogenAenderungen(knoten);
  try {
    if (!Object.keys(werte).length) s.removeItem(PRAEFIX + fall);
    else s.setItem(PRAEFIX + fall, JSON.stringify({ schluessel, am: Date.now(), werte }));
  } catch { /* voll oder gesperrt */ }
}

export function bogenVergessen(fall) {
  const s = speicher();
  if (!s || !fall) return;
  try { s.removeItem(PRAEFIX + fall); } catch { /* egal */ }
}

function gemerkt(fall) {
  const s = speicher();
  if (!s || !fall) return null;
  try {
    const roh = JSON.parse(s.getItem(PRAEFIX + fall) || "null");
    if (!roh || typeof roh !== "object" || !roh.werte) return null;
    if (Date.now() - Number(roh.am || 0) > HALTBAR_MS) { s.removeItem(PRAEFIX + fall); return null; }
    return roh;
  } catch { return null; }
}

// Einmal je frisch gezeichnetem Bogen. Ein Bogen aus dem Archiv traegt
// die Marke schon und bleibt, wie er ist. Gibt die Zahl der gesetzten
// Felder zurueck.
export function bogenWiederherstellen(wurzel = globalThis.document) {
  let gesetzt = 0;
  for (const knoten of wurzel?.querySelectorAll?.(".heart-befund[data-bewahren]") || []) {
    if (knoten.dataset.bogenGeprueft === "ja") continue;
    knoten.dataset.bogenGeprueft = "ja";
    const schluessel = knoten.getAttribute("data-bewahren");
    const alt = gemerkt(fallVonSchluessel(schluessel));
    if (!alt || alt.schluessel !== schluessel) continue;
    const geaendert = [];
    for (const [name, el, haken] of felderMitNamen(knoten)) {
      if (!(name in alt.werte)) continue;
      const wert = alt.werte[name];
      if (haken) el.checked = wert === true;
      else el.value = String(wert ?? "");
      geaendert.push(el);
      gesetzt += 1;
    }
    // Erst alle Werte, dann melden - so zieht die Oberflaeche nach (Produkt-
    // bloecke, Vorschau, Zeichen), und die Automatik findet den Text von
    // Hand schon vor und laesst ihn stehen.
    for (const el of geaendert) {
      const art = el.type === "checkbox" || el.type === "radio" || el.tagName === "SELECT" ? "change" : "input";
      el.dispatchEvent(new Event(art, { bubbles: true }));
    }
  }
  return gesetzt;
}
