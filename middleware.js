// VERCEL-MIDDLEWARE NUR FUER /lifeskinshop (Inhaber 07.10.): liefert die
// Fassung der Seite aus, die Heart gerade zeigt - 3 Produkte (index.html,
// ueber die Umleitung in vercel.json) oder 2 Produkte (index-2.html, vom
// Build erzeugt). So stimmt schon das erste Bild, ohne Umspringen.
//
// Absichtlich ohne Importe und ohne Schreibzugriff: liest dasselbe
// oeffentliche Dokument wie die Seite selbst. Der Stand wird je Instanz
// kurz gemerkt (unabhaengig von ?fbclid & Co.). Bei JEDEM Fehler oder
// Zeitueberschreitung geht der Besuch unveraendert weiter (normale Seite).

export const config = { matcher: ["/lifeskinshop", "/lifeskinshop/"] };

const SETET_URL = "https://firestore.googleapis.com/v1/projects/menyra-c0e68/databases/(default)/documents/lifeskin/lifeskin/config/shopSetet";
const SEITE_2 = "/apps/lifeskin-shop/index-2.html";
const FRISCH_MS = 15000;
const WARTEN_MS = 700;
const ERLAUBT = ["lf-clean", "lf-acne", "lf-moistur"];

let gemerkt = { anzahl: 0, zeit: 0 };
let laufend = null;

// Dieselbe Regel wie shared/lifeskin-shop-fassung.js fassungAusSetet,
// hier direkt auf der Firestore-REST-Antwort.
export function anzahlAusAntwort(daten) {
  const liste = daten?.fields?.lista?.arrayValue?.values;
  if (!Array.isArray(liste)) return 3;
  const gesehen = new Set();
  for (const eintrag of liste) {
    const f = eintrag?.mapValue?.fields || {};
    // Wie setetNormalisieren: ohne Kennung oder Namen, oder doppelt -> weg.
    const id = String(f.id?.stringValue || "").replace(/[^\w-]/g, "").slice(0, 40);
    if (!id || gesehen.has(id) || !String(f.titulli?.stringValue || "").trim()) continue;
    gesehen.add(id);
    if (f.aktiv?.booleanValue === false) continue;
    const produkte = (f.produkte?.arrayValue?.values || []).map((v) => String(v?.stringValue || "").trim()).filter(Boolean);
    if (produkte.includes("lf-acne") && produkte.includes("lf-moistur") && produkte.every((id) => ERLAUBT.includes(id))) {
      return produkte.includes("lf-clean") ? 3 : 2;
    }
  }
  return 3;
}

async function standHolen(holen) {
  const abbruch = new AbortController();
  const uhr = setTimeout(() => abbruch.abort(), WARTEN_MS);
  try {
    const antwort = await holen(SETET_URL, { signal: abbruch.signal });
    if (antwort.status === 404) return 3;
    if (!antwort.ok) return 0;
    return anzahlAusAntwort(await antwort.json());
  } catch {
    return 0;
  } finally {
    clearTimeout(uhr);
  }
}

function weiter() {
  return new Response(null, { headers: { "x-middleware-next": "1" } });
}

export default async function middleware(anfrage, kontext, holen = fetch) {
  try {
    const jetzt = Date.now();
    if (jetzt - gemerkt.zeit > FRISCH_MS) {
      laufend ||= standHolen(holen).then((anzahl) => {
        if (anzahl) gemerkt = { anzahl, zeit: Date.now() };
      }).finally(() => { laufend = null; });
      // Noch nie gelesen: kurz warten. Sonst den gemerkten Stand nehmen und
      // im Hintergrund auffrischen.
      if (!gemerkt.anzahl) await laufend;
      else kontext?.waitUntil?.(laufend);
    }
    if (gemerkt.anzahl === 2) {
      return new Response(null, { headers: { "x-middleware-rewrite": new URL(SEITE_2, anfrage.url).toString() } });
    }
  } catch {
    // weiter wie ohne Middleware
  }
  return weiter();
}

// Nur fuer Tests: gemerkten Stand zuruecksetzen.
export function _zuruecksetzen() { gemerkt = { anzahl: 0, zeit: 0 }; laufend = null; }
