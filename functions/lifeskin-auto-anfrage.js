"use strict";

// AUTO-MODUS: WAS AN OPENAI GEHT UND WAS ZURUECKKOMMT.
//
// Reines Rechnen, ohne Netz und ohne firebase-functions - damit sich
// pruefen laesst, was das Haus verlaesst (wie lifeskin-capi-payload.js).
// Der Ausloeser steht in lifeskin-auto.js, die Hintergruende in
// docs/lifeskin-auto.md.

// Die Einstellungen stehen in lifeskin/<tenant>/config/ablauf und werden
// in Heart geschaltet. Fehlt etwas, gilt das hier.
const STANDARD = Object.freeze({
  autoAn: false,
  autoModell: "gpt-5.4",
  autoTagesLimit: 40,
  autoMaxFotos: 6
});

function text(wert) {
  return typeof wert === "string" ? wert.trim() : "";
}

function einstellungen(daten = {}) {
  const zahl = (wert, von, bis, sonst) => {
    const n = Math.round(Number(wert));
    return Number.isFinite(n) && n >= von && n <= bis ? n : sonst;
  };
  return {
    autoAn: daten?.autoAn === true,
    autoModell: /^[\w.-]{3,40}$/.test(text(daten?.autoModell)) ? text(daten.autoModell) : STANDARD.autoModell,
    autoTagesLimit: zahl(daten?.autoTagesLimit, 1, 500, STANDARD.autoTagesLimit),
    autoMaxFotos: zahl(daten?.autoMaxFotos, 1, 10, STANDARD.autoMaxFotos)
  };
}

// Welche Fotos mitgehen, und in welcher Reihenfolge: die Reihenfolge, in
// der Dr. Gashi sie ansieht - gerade, die Seiten, oben, dann die Stelle,
// jeweils das beste Bild zuerst ("rechts" vor "rechts-2").
const REIHE = ["gerade", "rechts", "links", "oben", "zona"];
function fotosWaehlen(fotos = [], max = STANDARD.autoMaxFotos) {
  const rang = (blick) => {
    const [name, nr] = String(blick || "").split("-");
    const i = REIHE.indexOf(name);
    return (Number(nr) || 1) * 10 + (i < 0 ? 9 : i);
  };
  return (Array.isArray(fotos) ? fotos : [])
    .filter((f) => typeof f?.jpeg === "string" && f.jpeg.startsWith("data:image/jpeg;base64,"))
    .sort((a, b) => rang(a.blick) - rang(b.blick))
    .slice(0, Math.max(1, max));
}

// Die Anfrage an die Responses API: der fertige Prompt, dahinter die Fotos,
// die Antwort als JSON-Objekt (der Prompt verlangt JSON).
function baueAnfrage({ modell, prompt, fotos = [] }) {
  return {
    model: modell,
    input: [{
      role: "user",
      content: [
        { type: "input_text", text: String(prompt || "") },
        ...fotos.map((f) => ({ type: "input_image", image_url: f.jpeg, detail: "high" }))
      ]
    }],
    text: { format: { type: "json_object" } }
  };
}

// Der Text der Antwort. Die Responses API liefert eine Liste von
// Ausgaben; der Text steht in den Nachrichten als output_text.
function antwortText(antwort) {
  if (typeof antwort?.output_text === "string" && antwort.output_text.trim()) return antwort.output_text;
  const teile = [];
  for (const eintrag of Array.isArray(antwort?.output) ? antwort.output : []) {
    if (eintrag?.type !== "message") continue;
    for (const stueck of Array.isArray(eintrag.content) ? eintrag.content : []) {
      if (stueck?.type === "output_text" && typeof stueck.text === "string") teile.push(stueck.text);
    }
  }
  return teile.join("");
}

// Der Tag fuer das Tageslimit - in der Zeit von Kosovo/Albanien.
function tagVon(datum = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Belgrade" }).format(datum);
}

// Grobe Kosten in US-Dollar, nur fuer das Protokoll (Preise je 1 Mio.
// Tokens, Stand 27.09.2026, developers.openai.com/api/docs/pricing).
const PREISE = Object.freeze({
  "gpt-5.4": [2.5, 0.25, 15],
  "gpt-5.4-mini": [0.75, 0.075, 4.5],
  "gpt-6-sol": [2, 0.2, 10],
  "gpt-4.1": [2, 0.5, 8]
});
function kostenUsd(modell, nutzung = {}) {
  const preis = PREISE[modell];
  if (!preis) return null;
  const rein = Number(nutzung?.input_tokens) || 0;
  const cache = Number(nutzung?.input_tokens_details?.cached_tokens) || 0;
  const raus = Number(nutzung?.output_tokens) || 0;
  return Math.round((((rein - cache) * preis[0]) + (cache * preis[1]) + (raus * preis[2])) / 1e3) / 1000;
}

module.exports = { STANDARD, einstellungen, fotosWaehlen, baueAnfrage, antwortText, tagVon, kostenUsd, text };
