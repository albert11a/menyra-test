// KARTEN ZUM AUF- UND ZUKLAPPEN - mit Gedaechtnis.
//
// Jede Karte im Lifeskin-Bereich laesst sich zuklappen, und Heart merkt
// sich das auf diesem Geraet (localStorage): Wer "Trichter" zuklappt,
// findet ihn morgen zugeklappt wieder.
//
// Zugeklappt traegt der Kopf eine kurze Live-Zahl ("2 neu", "1 Landing"),
// damit man auch ohne Aufklappen sieht, ob sich etwas tut.
//
// Das Gedaechtnis steht HIER und nicht im DOM: Heart schreibt den Bereich
// bei jeder Zustandsaenderung neu (jede Live-Zahl). Ein <details> ohne
// Gedaechtnis klappte dabei jedes Mal zurueck. heart-events.js traegt
// jedes Auf- und Zuklappen ein ("toggle", data-klapp).

import { escapeHtml } from "./heart-ui-utils.js";

const SCHLUESSEL = "heart.lifeskin.klapp";
let stand = null;

function laden() {
  if (stand) return stand;
  stand = new Map();
  try {
    const roh = JSON.parse(globalThis.localStorage?.getItem(SCHLUESSEL) || "{}");
    for (const [k, v] of Object.entries(roh || {})) if (typeof v === "boolean") stand.set(k, v);
  } catch { /* ohne Speicher: nur fuer diese Sitzung */ }
  return stand;
}

function sichern() {
  try { globalThis.localStorage?.setItem(SCHLUESSEL, JSON.stringify(Object.fromEntries(laden()))); } catch { /* egal */ }
}

export function klappSetzen(name, offen) {
  if (!name) return;
  const karte = laden();
  if (karte.get(name) === Boolean(offen)) return;
  karte.set(name, Boolean(offen));
  sichern();
}

export function klappOffen(name, standard = false) {
  const karte = laden();
  return karte.has(name) ? karte.get(name) : standard;
}

export const klappAttr = (name, standard = false) =>
  `data-klapp="${escapeHtml(name)}"${klappOffen(name, standard) ? " open" : ""}`;

// Fuer Tests: den Speicher vergessen.
export function klappZuruecksetzen() { stand = new Map(); sichern(); }

// Eine fertige Karte (<section class="heart-lifeskin-block"> mit <h3> als
// Titel) zu einer Karte zum Aufklappen machen. Der Titel wird der Kopf.
//
//   zahl       die Live-Zahl im Kopf - steht nur, wenn zugeklappt
//   blink      der Rand blinkt, solange zugeklappt (Live · Kauf)
//   standard   ob die Karte offen ist, solange niemand sie angefasst hat
export function alsKlapp(html, name, { standard = true, zahl = "", blink = false, ton = "" } = {}) {
  const auf = /<section class="heart-lifeskin-block([^"]*)"([^>]*)>/;
  const titel = /<h3 class="heart-lifeskin-block__titel">([\s\S]*?)<\/h3>/;
  if (!auf.test(html) || !titel.test(html)) return html;
  const kopfZahl = zahl
    ? `<span class="heart-klapp__zahl heart-klapp__zahl--zu${ton ? ` heart-klapp__zahl--${escapeHtml(ton)}` : ""}">${escapeHtml(zahl)}</span>`
    : "";
  const ende = html.lastIndexOf("</section>");
  return (html.slice(0, ende) + "</details>" + html.slice(ende + "</section>".length))
    .replace(auf, (_, klassen, rest) =>
      `<details class="heart-lifeskin-block${klassen} heart-klapp${blink ? " heart-klapp--blink" : ""}"${rest} ${klappAttr(name, standard)}>`)
    .replace(titel, (_, text) =>
      `<summary class="heart-klapp__kopf"><h3 class="heart-lifeskin-block__titel">${text}</h3>${kopfZahl}</summary>`);
}
