// DER KAUFWEG AUF DER THERAPIESEITE - was gemessen wird, und wie Heart es
// je Version auswertet (Auftrag vom 26.09., Punkt 13).
//
// WAS GEMESSEN WIRD: Seite geoeffnet, Angebot gesehen, Betreuung gesehen,
// Kaufknopf getippt, Kasse geoeffnet, Eingabe begonnen, Fehler, Bestellung
// gespeichert. "gesehen" heisst: Der Abschnitt stand im Bild - nicht, dass
// er gelesen oder verstanden wurde.
//
// WOHIN: in die Sitzung unter timings.kauf.<marke> (nur das CEO-Konto
// liest sie). Keine Fotos, keine Befunde, keine Hautreaktionen, kein
// Freitext, keine Kontaktdaten - und nichts davon geht an Meta. Der
// Pixel bekommt weiter nur, was er schon bekam.
//
// WAS NICHT GEMESSEN WIRD: Klicks in der Beispielkarte. Mehr Klicks auf
// eine Vorschau sind kein Erfolg; Erfolg sind bestaetigte und zugestellte
// Bestellungen je Gruppe von Analyseempfaengern.

import { KAUFWEG_VERSION } from "./lifeskin-ndjekja.js";

export const KAUF_MARKEN = Object.freeze([
  "geoeffnet", "angebot", "betreuung", "knopf", "kasse", "eingabe", "fehler", "gespeichert"
]);

// Eine Marke als Schreibauftrag: Feld und Maske je Blatt, damit keine
// Marke eine andere ueberschreibt - und keine Scan-Dauer daneben.
export function kaufPatch(marke, { version = "", art = "" } = {}, jetzt = new Date().toISOString()) {
  if (!KAUF_MARKEN.includes(marke)) return null;
  const kauf = { [marke]: jetzt };
  const masken = [`timings.kauf.${marke}`];
  if (version) {
    kauf.v = String(version).slice(0, 20);
    masken.push("timings.kauf.v");
  }
  if (marke === "fehler" && art) {
    kauf.fehlerArt = String(art).slice(0, 20);
    masken.push("timings.kauf.fehlerArt");
  }
  return { daten: { timings: { kauf }, updatedAt: jetzt }, masken: [...masken, "updatedAt"] };
}

// ---------------------------------------------------------------------------
// Heart: die Auswertung je Version, ueber eine GRUPPE VON EMPFAENGERN
// ---------------------------------------------------------------------------

const FREIGEGEBEN = Object.freeze(["fertig", "bestellt", "versandt", "zugestellt"]);

// Welche Fassung galt fuer diesen Empfaenger?
//
// Hat er die Therapieseite geoeffnet, steht es in timings.kauf.v. Sonst
// entscheidet der Tag seiner Analyse: ab dem Tag, an dem die neue
// Fassung in den Verkauf ging (seit), die neue - davor die klassische.
// So bleibt, wer die Seite NIE geoeffnet hat, in seiner Gruppe; sonst
// saehe die neue Fassung besser aus, nur weil die Nicht-Oeffner alle
// bei der alten landen.
export function versionVon(sitzung, seit = "") {
  const v = String(sitzung?.timings?.kauf?.v || "");
  if (v) return v;
  const tag = String(sitzung?.createdAt || "").slice(0, 10);
  return seit && tag && tag >= seit ? KAUFWEG_VERSION.ndjekja : KAUFWEG_VERSION.klassisch;
}

export const KOHORTE_STUFEN = Object.freeze([
  Object.freeze({ id: "empfaenger", label: "Analyse erhalten" }),
  Object.freeze({ id: "geoeffnet", label: "Therapieseite geöffnet" }),
  Object.freeze({ id: "angebot", label: "Angebot gesehen" }),
  Object.freeze({ id: "betreuung", label: "Betreuung gesehen", nurNeu: true }),
  Object.freeze({ id: "knopf", label: "Kaufknopf getippt" }),
  Object.freeze({ id: "kasse", label: "Kasse geöffnet" }),
  Object.freeze({ id: "eingabe", label: "Eingabe begonnen" }),
  Object.freeze({ id: "fehler", label: "Fehler gesehen" }),
  Object.freeze({ id: "bestellt", label: "Bestellt" }),
  Object.freeze({ id: "bestaetigt", label: "Bestätigt" }),
  Object.freeze({ id: "zugestellt", label: "Zugestellt" }),
  Object.freeze({ id: "storniert", label: "Storniert" })
]);

// Was dieser eine Fall erreicht hat. Die klassische Seite schreibt keine
// timings.kauf - dort gelten ihre eigenen Marken (sahPreis, Kasse,
// Anschrift), damit beide Gruppen dieselbe Frage beantworten.
export function kaufStand(sitzung, bericht) {
  const k = sitzung?.timings?.kauf || {};
  const status = String(bericht?.status || "");
  const order = sitzung?.order || {};
  const storniert = order.status === "storniert";
  const bestellt = Boolean(sitzung?.hatBestellt || order.orderId) || ["bestellt", "versandt", "zugestellt"].includes(status);
  const bestaetigt = !storniert && (order.status === "bestaetigt" || Boolean(order.bestaetigtAt)
    || ["versandt", "zugestellt"].includes(status));
  return {
    empfaenger: true,
    geoeffnet: Boolean(k.geoeffnet) || sitzung?.berichtGeoeffnet === true,
    angebot: Boolean(k.angebot) || sitzung?.sahPreis === true,
    betreuung: Boolean(k.betreuung),
    knopf: Boolean(k.knopf) || sitzung?.kasseGeoeffnet === true,
    kasse: Boolean(k.kasse) || sitzung?.kasseGeoeffnet === true,
    eingabe: Boolean(k.eingabe) || sitzung?.hatAnschrift === true,
    fehler: Boolean(k.fehler),
    bestellt,
    bestaetigt,
    zugestellt: !storniert && status === "zugestellt",
    storniert
  };
}

// Die Gruppen. Grundmenge: freigegebene Analysen im Zeitraum (Tag der
// Analyse), deren Sitzung noch da ist - geloeschte Faelle fallen damit
// ganz heraus und nicht nur aus einer Stufe. Eigene Testbestellungen
// (order.still) zaehlen nicht.
export function kaufwegKohorten(sitzungen = [], berichte = {}, { von = "", bis = "", seit = "" } = {}) {
  const gruppen = new Map();
  for (const s of Array.isArray(sitzungen) ? sitzungen : []) {
    const bericht = berichte?.[s?.id];
    if (!bericht || !FREIGEGEBEN.includes(String(bericht.status || ""))) continue;
    if (s?.order?.still === true) continue;
    const tag = String(s.createdAt || "").slice(0, 10);
    if ((von && tag < von) || (bis && tag > bis)) continue;
    const v = versionVon(s, seit);
    if (!gruppen.has(v)) gruppen.set(v, { version: v, faelle: 0, zahlen: Object.fromEntries(KOHORTE_STUFEN.map((x) => [x.id, 0])), von: tag, bis: tag });
    const g = gruppen.get(v);
    g.faelle += 1;
    if (tag && tag < g.von) g.von = tag;
    if (tag && tag > g.bis) g.bis = tag;
    const stand = kaufStand(s, bericht);
    for (const { id } of KOHORTE_STUFEN) if (stand[id]) g.zahlen[id] += 1;
  }
  return [...gruppen.values()]
    .sort((a, b) => (a.version === KAUFWEG_VERSION.klassisch ? -1 : b.version === KAUFWEG_VERSION.klassisch ? 1 : a.version.localeCompare(b.version)))
    .map((g) => ({
      ...g,
      stufen: KOHORTE_STUFEN
        .filter((x) => !(x.nurNeu && g.version === KAUFWEG_VERSION.klassisch))
        .map((x) => ({ ...x, anzahl: g.zahlen[x.id], anteil: g.faelle ? g.zahlen[x.id] / g.faelle : 0 }))
    }));
}
