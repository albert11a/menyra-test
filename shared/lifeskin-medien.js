// FOTOS UND VIDEOS DER KUNDEN - fuer die Therapieseite, ohne Firebase-SDK.
//
// Die Dateien liegen im Media-CDN (Cloudflare, derselbe Weg wie in mnyra),
// hier nur die Verweise: lifeskin/{tenant}/medien/{id}
//   art      "foto" | "video"
//   bild     Foto bzw. Standbild des Videos (sofort sichtbar)
//   video    die Videodatei (nur bei art "video")
//   produkt  z. B. "Pore Control"
//   text     ein Satz dazu
//   aktiv    false = in Heart ausgeblendet
//   reihe    Reihenfolge in Heart
//   views    wie oft geoeffnet (die Seite zaehlt +1, mehr erlaubt die Regel nicht)
//   ausschnitt  { x, y, zoom } - wie das Medium im Hochformat-Rahmen sitzt
//            (in Heart zugeschnitten), null = nie eingestellt
// und darunter kommentare/{id}: name, text, createdAt, verborgen.
//
// SCHNELL: Die Seite laedt hier NUR die Eintraege, die der Befund gewaehlt
// hat (ein einziger batchGet), und Kommentare erst, wenn jemand ein Medium
// oeffnet. Nichts davon haelt die Seite auf - jeder Fehler endet leise.

import { KLIENTET } from "./lifeskin-klientet.js";

// Die vier Fotos von Anfang an - stehen auch ohne Datenbank-Eintrag da.
export const MEDIEN_STANDARD = Object.freeze(KLIENTET.map((k, i) => Object.freeze({
  id: k.id, art: "foto", bild: k.bild, video: "", produkt: k.produkt, text: k.text, aktiv: true, reihe: i, views: 0
})));

const HOECHSTENS = 12;

// Welche Medien ein Befund zeigt, in dieser Reihenfolge.
// true (die erste Fassung, ein Schalter) heisst: die vier Standardfotos.
export function medienAuswahl(wert) {
  if (wert === true) return MEDIEN_STANDARD.map((m) => m.id);
  if (!Array.isArray(wert)) return [];
  return [...new Set(wert.map((x) => String(x || "").trim()).filter((x) => /^[A-Za-z0-9_-]{1,64}$/.test(x)))].slice(0, HOECHSTENS);
}

// ---------- Ausschnitt ----------
// Alle Rahmen (Kacheln, Betrachter, Shop, Heart) sind Hochformat 9:16 und
// fuellen ihn (object-fit: cover). x und y wie object-position in Prozent,
// zoom vergroessert um genau diesen Punkt - so bleibt der Rand immer
// gefuellt, egal wohin geschoben wird.
export const AUSSCHNITT_STANDARD = Object.freeze({ x: 50, y: 25, zoom: 1 });
export const ZOOM_MAX = 4;

const grenze = (n, min, max) => Math.min(max, Math.max(min, n));

export function ausschnittNormalisieren(roh) {
  if (!roh || typeof roh !== "object") return null;
  const x = Number(roh.x), y = Number(roh.y), zoom = Number(roh.zoom);
  if (![x, y, zoom].every(Number.isFinite)) return null;
  return {
    x: Math.round(grenze(x, 0, 100) * 10) / 10,
    y: Math.round(grenze(y, 0, 100) * 10) / 10,
    zoom: Math.round(grenze(zoom, 1, ZOOM_MAX) * 100) / 100
  };
}

// Inline-Stil fuer <img> oder <video> im Rahmen. Ohne Ausschnitt: nichts -
// dann gilt, was das CSS der Seite schon immer zeigte.
export function ausschnittStil(roh) {
  const a = ausschnittNormalisieren(roh);
  if (!a) return "";
  const punkt = `${a.x}% ${a.y}%`;
  return `object-fit:cover;object-position:${punkt}` + (a.zoom > 1 ? `;transform:scale(${a.zoom});transform-origin:${punkt}` : "");
}

// ---------- Firestore-REST: Werte ein- und auspacken ----------
function wert(f) {
  if (!f || typeof f !== "object") return null;
  if ("stringValue" in f) return f.stringValue;
  if ("integerValue" in f) return Number(f.integerValue);
  if ("doubleValue" in f) return f.doubleValue;
  if ("booleanValue" in f) return f.booleanValue;
  if ("timestampValue" in f) return f.timestampValue;
  if ("nullValue" in f) return null;
  return null;
}

export function medienAusDokument(doc) {
  const f = doc?.fields || {};
  const id = String(doc?.name || "").split("/").pop();
  const art = wert(f.art) === "video" ? "video" : "foto";
  return {
    id, art,
    bild: url(wert(f.bild)),
    video: art === "video" ? url(wert(f.video)) : "",
    produkt: String(wert(f.produkt) || ""),
    text: String(wert(f.text) || ""),
    aktiv: wert(f.aktiv) !== false,
    reihe: Number(wert(f.reihe)) || 0,
    views: Number(wert(f.views)) || 0,
    ausschnitt: ausschnittNormalisieren(Object.fromEntries(
      Object.entries(f.ausschnitt?.mapValue?.fields || {}).map(([k, v]) => [k, wert(v)])))
  };
}

// Nur https-Adressen und eigene Pfade - nie "javascript:" oder "data:".
function url(x) {
  const s = String(x || "").trim();
  return /^(https:\/\/|\/(?!\/))[^\s"'<>]{1,600}$/.test(s) ? s : "";
}

const pfad = (tenant, id) => `lifeskin/${tenant}/medien/${id}`;

// Die gewaehlten Medien in der Reihenfolge der Auswahl. Fehlt ein Eintrag
// in der Datenbank, springt das Standardfoto gleichen Namens ein.
export async function medienLaden(ids, { basis, tenant = "lifeskin", fetchFn = globalThis.fetch } = {}) {
  const liste = medienAuswahl(ids);
  if (!liste.length) return [];
  const gefunden = new Map();
  try {
    const projekt = basis.replace(/^https:\/\/firestore\.googleapis\.com\/v1\//, "");
    const antwort = await fetchFn(`${basis}:batchGet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documents: liste.map((id) => `${projekt}/${pfad(tenant, id)}`) })
    });
    if (antwort?.ok) {
      for (const eintrag of await antwort.json()) {
        if (eintrag?.found) {
          const m = medienAusDokument(eintrag.found);
          gefunden.set(m.id, m);
        }
      }
    }
  } catch { /* ohne Datenbank: die Standardfotos */ }
  const standard = new Map(MEDIEN_STANDARD.map((m) => [m.id, m]));
  return liste
    .map((id) => gefunden.get(id) || standard.get(id))
    .filter((m) => m && m.aktiv !== false && m.bild);
}

// Die sichtbaren Kommentare eines Mediums, neueste oben.
export async function kommentareLaden(id, { basis, tenant = "lifeskin", fetchFn = globalThis.fetch } = {}) {
  try {
    const antwort = await fetchFn(`${basis}/${pfad(tenant, id)}:runQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "kommentare" }],
          // Die Regel laesst Besucher nur Unverborgenes lesen - die
          // Abfrage muss genau das verlangen.
          where: { fieldFilter: { field: { fieldPath: "verborgen" }, op: "EQUAL", value: { booleanValue: false } } },
          limit: 100
        }
      })
    });
    if (!antwort?.ok) return [];
    const zeilen = await antwort.json();
    return (Array.isArray(zeilen) ? zeilen : [])
      .filter((z) => z?.document)
      .map((z) => ({
        id: String(z.document.name || "").split("/").pop(),
        name: String(wert(z.document.fields?.name) || ""),
        text: String(wert(z.document.fields?.text) || ""),
        createdAt: String(wert(z.document.fields?.createdAt) || "")
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export function kommentarPruefen({ name, text } = {}) {
  const n = String(name || "").trim().slice(0, 40);
  const t = String(text || "").trim().slice(0, 500);
  return { ok: Boolean(n && t), name: n, text: t };
}

// VIELE KOMMENTARE AUF EINMAL (Heart): Eine Zeile ist ein Kommentar,
// "Name, Text". Aufzaehlungszeichen vorne (-, •, *, 1.) fallen weg. Der
// Name endet am ersten Komma (oder Doppelpunkt) - alles danach ist der
// Text, auch weitere Kommas. Leere Zeilen zaehlen nicht.
// Grenzen wie in firestore.rules: Name 1-40, Text 1-500 Zeichen.
// Zurueck: die guten Kommentare und je Zeile, warum sie nicht geht.
export const KOMMENTARE_JE_MAL = 100;
export function kommentareAusText(roh) {
  const kommentare = [];
  const fehler = [];
  String(roh || "").split(/\r?\n/).forEach((zeile, i) => {
    const sauber = zeile.replace(/^\s*(?:[-–—•*·]+|\d{1,3}[.)])\s*/, "").trim();
    if (!sauber) return;
    const nr = i + 1;
    const trenner = sauber.search(/[,:]/);
    if (trenner < 0) { fehler.push({ zeile: nr, grund: "kein Komma zwischen Name und Text" }); return; }
    const name = sauber.slice(0, trenner).trim();
    const text = sauber.slice(trenner + 1).trim();
    if (!name) fehler.push({ zeile: nr, grund: "der Name fehlt" });
    else if (!text) fehler.push({ zeile: nr, grund: "der Text fehlt" });
    else if (name.length > 40) fehler.push({ zeile: nr, grund: "Name länger als 40 Zeichen" });
    else if (text.length > 500) fehler.push({ zeile: nr, grund: "Text länger als 500 Zeichen" });
    else kommentare.push({ zeile: nr, name, text });
  });
  return { kommentare, fehler };
}

// Einen Kommentar schreiben - sofort sichtbar (Heart kann verbergen).
export async function kommentarSchreiben(id, eingabe, { basis, tenant = "lifeskin", fetchFn = globalThis.fetch, jetzt = new Date().toISOString() } = {}) {
  const k = kommentarPruefen(eingabe);
  if (!k.ok) return null;
  const antwort = await fetchFn(`${basis}/${pfad(tenant, id)}/kommentare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        name: { stringValue: k.name },
        text: { stringValue: k.text },
        createdAt: { stringValue: jetzt },
        verborgen: { booleanValue: false }
      }
    })
  });
  if (!antwort?.ok) throw new Error(`Kommentar ${antwort?.status}`);
  const doc = await antwort.json().catch(() => ({}));
  return { id: String(doc?.name || "").split("/").pop(), name: k.name, text: k.text, createdAt: jetzt };
}

// Ein Aufruf mehr. Die Regel erlaubt Besuchern genau +1 auf "views".
// Fuer Standardfotos ohne Datenbank-Eintrag scheitert das still.
export function viewZaehlen(id, { basis, tenant = "lifeskin", fetchFn = globalThis.fetch } = {}) {
  try {
    const projekt = basis.replace(/^https:\/\/firestore\.googleapis\.com\/v1\//, "");
    return Promise.resolve(fetchFn(`${basis}:commit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        writes: [{
          transform: {
            document: `${projekt}/${pfad(tenant, id)}`,
            fieldTransforms: [{ fieldPath: "views", increment: { integerValue: "1" } }]
          },
          currentDocument: { exists: true }
        }]
      })
    })).catch(() => null);
  } catch {
    return Promise.resolve(null);
  }
}

// ---------- Fuer Heart ----------

// Ein Eintrag, wie Heart ihn schreibt - nur diese Felder, sauber begrenzt.
export function mediumNormalisieren(roh = {}, id = roh.id) {
  const art = roh.art === "video" ? "video" : "foto";
  return {
    id: String(id || "").trim(),
    art,
    bild: url(roh.bild),
    video: art === "video" ? url(roh.video) : "",
    produkt: String(roh.produkt || "").trim().slice(0, 60),
    text: String(roh.text || "").trim().slice(0, 240),
    aktiv: roh.aktiv !== false,
    reihe: Number.isFinite(Number(roh.reihe)) ? Number(roh.reihe) : 0,
    views: Math.max(0, Math.round(Number(roh.views) || 0)),
    ausschnitt: ausschnittNormalisieren(roh.ausschnitt),
    createdAt: String(roh.createdAt || "")
  };
}

// Die Liste in Heart: gespeichert, sonst die vier Standardfotos (so steht
// da, was die Seiten wirklich zeigen). "standard" heisst: noch nie
// gespeichert - die erste Aenderung legt sie in der Datenbank an.
export function medienListe(roh) {
  if (Array.isArray(roh) && roh.length) {
    return roh.map((m) => ({ ...mediumNormalisieren(m), standard: false }))
      .filter((m) => m.id)
      .sort((a, b) => a.reihe - b.reihe || a.id.localeCompare(b.id));
  }
  return MEDIEN_STANDARD.map((m) => ({ ...mediumNormalisieren(m), standard: true }));
}

export function neueMediumId(jetzt = Date.now(), zufall = Math.random) {
  return `m-${jetzt.toString(36)}${Math.floor(zufall() * 1296).toString(36).padStart(2, "0")}`;
}
