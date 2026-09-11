// Die Zeichen der Analyse - echte Lucide-Icons, inline.
//
// WARUM INLINE UND NICHT DAS PAKET: apps/menyra-social/vendor/lucide.min.js
// sind 352 KB. Diese Seite oeffnet ein Patient direkt nach dem Scan, meist
// im Mobilfunk und oft im Fenster von Instagram. Ein Drittel Megabyte
// Zeichensatz vor dem ersten Wort ist auf genau diesen Geraeten der
// Unterschied zwischen "die Analyse ist da" und "die Seite laedt noch".
//
// Und es ist nicht nur das Gewicht: Haengt ein Zeichen an einem extern
// geladenen Script, ist es LEER, wenn das Script nicht kommt. Genau das
// ist im Ofertat-Tab passiert (tests/voucher-icon-coverage.test.mjs). Ein
// leerer Rahmen neben "45 ditë garanci" sieht nicht nach Zeichen aus,
// sondern nach Panne - und eine Panne neben einer Zusage kostet die
// Zusage.
//
// DIE PFADE SIND NICHT ABGEZEICHNET. Sie stammen unveraendert aus dem
// Paket, das ohnehin im Baum liegt; tests/lifeskin-astra-ikonen.test.mjs
// vergleicht jeden einzelnen damit. Wer ein Zeichen ergaenzen will, holt
// es von dort und nicht aus dem Gedaechtnis - ein von Hand nachgemaltes
// Lucide-Icon steht neben den echten wie ein Fremdkoerper.

// Die Attribute des Rahmens. Lucide zeichnet in einem 24er Kasten mit
// Strichstaerke 2 und runden Enden; wer daran dreht, bekommt Zeichen, die
// neben den uebrigen zu duenn oder zu fett stehen.
export const IKONE_RAHMEN = Object.freeze({
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
});

export const IKONEN = Object.freeze({
  "arrow-down": Object.freeze([["path", { "d": "M12 5v14" }], ["path", { "d": "m19 12-7 7-7-7" }]]),
  "arrow-right": Object.freeze([["path", { "d": "M5 12h14" }], ["path", { "d": "m12 5 7 7-7 7" }]]),
  "arrow-up-right": Object.freeze([["path", { "d": "M7 7h10v10" }], ["path", { "d": "M7 17 17 7" }]]),
  "camera": Object.freeze([["path", { "d": "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" }], ["circle", { "cx": "12", "cy": "13", "r": "3" }]]),
  "check": Object.freeze([["path", { "d": "M20 6 9 17l-5-5" }]]),
  "circle": Object.freeze([["circle", { "cx": "12", "cy": "12", "r": "10" }]]),
  "circle-alert": Object.freeze([["circle", { "cx": "12", "cy": "12", "r": "10" }], ["line", { "x1": "12", "x2": "12", "y1": "8", "y2": "12" }], ["line", { "x1": "12", "x2": "12.01", "y1": "16", "y2": "16" }]]),
  "circle-check": Object.freeze([["circle", { "cx": "12", "cy": "12", "r": "10" }], ["path", { "d": "m9 12 2 2 4-4" }]]),
  "clock": Object.freeze([["circle", { "cx": "12", "cy": "12", "r": "10" }], ["polyline", { "points": "12 6 12 12 16 14" }]]),
  "copy": Object.freeze([["rect", { "width": "14", "height": "14", "x": "8", "y": "8", "rx": "2", "ry": "2" }], ["path", { "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]]),
  "hand-coins": Object.freeze([["path", { "d": "M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" }], ["path", { "d": "m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" }], ["path", { "d": "m2 16 6 6" }], ["circle", { "cx": "16", "cy": "9", "r": "2.9" }], ["circle", { "cx": "6", "cy": "5", "r": "3" }]]),
  "hash": Object.freeze([["line", { "x1": "4", "x2": "20", "y1": "9", "y2": "9" }], ["line", { "x1": "4", "x2": "20", "y1": "15", "y2": "15" }], ["line", { "x1": "10", "x2": "8", "y1": "3", "y2": "21" }], ["line", { "x1": "16", "x2": "14", "y1": "3", "y2": "21" }]]),
  "loader-circle": Object.freeze([["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]]),
  "message-circle": Object.freeze([["path", { "d": "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" }]]),
  "moon": Object.freeze([["path", { "d": "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }]]),
  "package": Object.freeze([["path", { "d": "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" }], ["path", { "d": "M12 22V12" }], ["path", { "d": "m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" }], ["path", { "d": "m7.5 4.27 9 5.15" }]]),
  "plus": Object.freeze([["path", { "d": "M5 12h14" }], ["path", { "d": "M12 5v14" }]]),
  "shield-check": Object.freeze([["path", { "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }], ["path", { "d": "m9 12 2 2 4-4" }]]),
  "sun": Object.freeze([["circle", { "cx": "12", "cy": "12", "r": "4" }], ["path", { "d": "M12 2v2" }], ["path", { "d": "M12 20v2" }], ["path", { "d": "m4.93 4.93 1.41 1.41" }], ["path", { "d": "m17.66 17.66 1.41 1.41" }], ["path", { "d": "M2 12h2" }], ["path", { "d": "M20 12h2" }], ["path", { "d": "m6.34 17.66-1.41 1.41" }], ["path", { "d": "m19.07 4.93-1.41 1.41" }]]),
  "truck": Object.freeze([["path", { "d": "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" }], ["path", { "d": "M15 18H9" }], ["path", { "d": "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" }], ["circle", { "cx": "17", "cy": "18", "r": "2" }], ["circle", { "cx": "7", "cy": "18", "r": "2" }]]),
  "x": Object.freeze([["path", { "d": "M18 6 6 18" }], ["path", { "d": "m6 6 12 12" }]]),
});

// Ein Zeichen als Knoten.
//
// IMMER aria-hidden: Jedes Zeichen auf dieser Seite steht neben einem
// Wort, das dasselbe sagt. Ein Vorleseprogramm, das "Pfeil nach rechts"
// zwischen "Vazhdo me setin" und "53 €" einwirft, liest den Knopf
// schlechter vor, nicht besser.
//
// Ein unbekannter Name gibt null und keinen leeren Rahmen: Ein leeres
// Kaestchen ist schlimmer als kein Zeichen, und der Test unten faengt
// den Tippfehler ohnehin ab, bevor er hier ankommt.
export function ikona(name, klasse = "ikona") {
  const knoten = IKONEN[String(name || "")];
  if (!knoten) return null;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const [merkmal, wert] of Object.entries(IKONE_RAHMEN)) svg.setAttribute(merkmal, wert);
  if (klasse) svg.setAttribute("class", klasse);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  for (const [name_, merkmale] of knoten) {
    const teil = document.createElementNS("http://www.w3.org/2000/svg", name_);
    for (const [merkmal, wert] of Object.entries(merkmale)) teil.setAttribute(merkmal, wert);
    svg.append(teil);
  }
  return svg;
}

// Die Zeichen, die schon im Aufbau stehen. Ein Platzhalter traegt seinen
// Namen als data-ikona und wird hier einmal gefuellt - so steht im HTML
// der Name und nicht ein Pfad von zweihundert Zeichen.
export function ikonenSetzen(wurzel = document) {
  for (const platz of wurzel.querySelectorAll("[data-ikona]")) {
    if (platz.firstElementChild) continue;
    const zeichen = ikona(platz.dataset.ikona);
    if (zeichen) platz.append(zeichen);
  }
}
