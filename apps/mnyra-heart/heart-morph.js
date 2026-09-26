// NUR AENDERN, WAS SICH GEAENDERT HAT.
//
// Heart schrieb bei jeder Aenderung im Zustand die ganze Seite neu
// (rootNode.innerHTML = markup): bei jeder Live-Zahl, jeder Meldung, jedem
// nachgeladenen Foto. Gemessen am 25.09. mit 4000 Sitzungen auf einem
// Telefon-Tempo (tests/lifeskin-trichter-pruefstand/lauf-heart.mjs): Eine
// neue Sitzung brauchte neun Sekunden bis in die Kachel, fuenf davon war
// der Browser nur damit beschaeftigt, hunderte Zeilen wegzuwerfen und
// wieder aufzubauen. Dazu kam, was man sieht: Bilder, die neu dekodiert
// werden, Listen, die ihre Stelle verlieren - "es springt".
//
// Hier wird das neue Markup nur GELESEN (in ein <template>, das nichts
// laedt und nichts anzeigt) und danach mit dem abgeglichen, was schon
// dasteht. Ein Knoten, der gleich bleibt, bleibt DERSELBE Knoten: mit
// seinem dekodierten Bild, seiner Scrollstelle, seinem Fokus.
//
// DIE BEDEUTUNG BLEIBT DIE VON innerHTML. Was im Markup steht, steht danach
// im DOM - auch Werte von Feldern und Haken -, mit zwei Ausnahmen, die
// innerHTML nur mit Umwegen hinbekam (heart-render.js):
//
//   - das Feld, in dem gerade getippt wird, behaelt Wert und Cursor,
//   - ein Knoten mit data-bewahren bleibt unangetastet, solange sein
//     Schluessel gleich ist (ein Formular, das nur im DOM lebt).
//
// Knoten mit data-morph-ganz werden nicht abgeglichen, sondern als Ganzes
// ersetzt, sobald sich an ihnen etwas aendert - fuer Bausteine, an die
// nach dem Zeichnen jemand Ereignisse bindet (die Diagramme in Analytics).

const TEXT = 3;
const KOMMENTAR = 8;
const ELEMENT = 1;

// Wer zu wem gehoert, wenn sich die Reihenfolge aendert: Zeilen einer Liste
// tragen ihre Kennung. Ohne Schluessel wird der Reihe nach abgeglichen.
function schluessel(knoten) {
  if (knoten.nodeType !== ELEMENT) return "";
  const id = knoten.getAttribute("id");
  if (id) return `#${id}`;
  const bewahren = knoten.getAttribute("data-bewahren");
  if (bewahren) return `b:${bewahren}`;
  const eigen = knoten.getAttribute("data-morph-key");
  if (eigen) return `k:${eigen}`;
  const kennung = knoten.getAttribute("data-id");
  if (kennung) return `d:${knoten.tagName}:${knoten.getAttribute("data-action") || ""}:${kennung}`;
  return "";
}

function gleichartig(a, b) {
  if (a.nodeType !== b.nodeType) return false;
  if (a.nodeType !== ELEMENT) return true;
  return a.tagName === b.tagName && a.namespaceURI === b.namespaceURI;
}

function attributeAngleichen(alt, neu) {
  const neueAttribute = neu.attributes;
  for (let i = 0; i < neueAttribute.length; i += 1) {
    const { name, value, namespaceURI } = neueAttribute[i];
    if (alt.getAttribute(name) === value) continue;
    if (namespaceURI) alt.setAttributeNS(namespaceURI, name, value);
    else alt.setAttribute(name, value);
  }
  const alte = alt.attributes;
  for (let i = alte.length - 1; i >= 0; i -= 1) {
    const { name } = alte[i];
    if (!neu.hasAttribute(name)) alt.removeAttribute(name);
  }
}

// Was innerHTML ueber Attribute hinaus festlegt: den Wert eines Feldes und
// ob ein Haken sitzt. Das aktive Feld behaelt, was darin getippt wird.
function eigenschaftenAngleichen(alt, neu, aktiv) {
  const tag = alt.tagName;
  if (tag === "INPUT") {
    const typ = String(alt.type || "").toLowerCase();
    if (typ === "checkbox" || typ === "radio") {
      const soll = neu.hasAttribute("checked");
      if (alt.checked !== soll) alt.checked = soll;
    } else if (typ !== "file" && alt !== aktiv) {
      const soll = neu.getAttribute("value") ?? "";
      if (alt.value !== soll) alt.value = soll;
    }
  } else if (tag === "TEXTAREA") {
    if (alt !== aktiv) {
      const soll = neu.textContent;
      if (alt.value !== soll) alt.value = soll;
    }
  } else if (tag === "OPTION") {
    const soll = neu.hasAttribute("selected");
    if (alt.selected !== soll) alt.selected = soll;
  }
}

function knotenAngleichen(alt, neu, aktiv) {
  if (alt.nodeType === TEXT || alt.nodeType === KOMMENTAR) {
    if (alt.nodeValue !== neu.nodeValue) alt.nodeValue = neu.nodeValue;
    return;
  }
  if (alt.nodeType !== ELEMENT) return;
  // Gleicher Fingerabdruck, gleicher Inhalt: Der Knoten wird gar nicht erst
  // durchsucht (siehe mitFingerabdruck). So kostet eine Liste mit hunderten
  // Zeilen, von denen sich eine geaendert hat, eine Zeile und nicht alle.
  const abdruck = neu.getAttribute("data-morph-hash");
  if (abdruck && abdruck === alt.getAttribute("data-morph-hash")) return;
  const bewahren = alt.getAttribute("data-bewahren");
  if (bewahren && bewahren === neu.getAttribute("data-bewahren")) return;
  if (alt.hasAttribute("data-morph-ganz") || neu.hasAttribute("data-morph-ganz")) {
    if (alt.outerHTML !== neu.outerHTML) alt.replaceWith(neu);
    return;
  }
  attributeAngleichen(alt, neu);
  eigenschaftenAngleichen(alt, neu, aktiv);
  // Der Inhalt eines Textfeldes ist sein Anfangswert; der Wert selbst steht
  // oben. Ein aktives Feld wird nicht angefasst.
  if (alt.tagName === "TEXTAREA") {
    if (alt !== aktiv && alt.textContent !== neu.textContent) alt.textContent = neu.textContent;
    return;
  }
  kinderAngleichen(alt, neu, aktiv);
  if (alt.tagName === "SELECT" && alt !== aktiv && !neu.querySelector("option[selected]") && alt.options.length) {
    // Ohne ausdruecklich gewaehlte Option zeigt innerHTML die erste.
    if (alt.selectedIndex !== 0) alt.selectedIndex = 0;
  }
}

function kinderAngleichen(altEltern, neuEltern, aktiv) {
  const neuKinder = Array.from(neuEltern.childNodes);
  // Nur eindeutige Schluessel taugen zum Zuordnen.
  const neuZahl = new Map();
  for (const kind of neuKinder) {
    const s = schluessel(kind);
    if (s) neuZahl.set(s, (neuZahl.get(s) || 0) + 1);
  }
  const altNachSchluessel = new Map();
  const altDoppelt = new Set();
  for (let kind = altEltern.firstChild; kind; kind = kind.nextSibling) {
    const s = schluessel(kind);
    if (!s) continue;
    if (altNachSchluessel.has(s)) altDoppelt.add(s);
    else altNachSchluessel.set(s, kind);
  }
  const taugt = (s) => Boolean(s) && neuZahl.get(s) === 1 && !altDoppelt.has(s);

  let zeiger = altEltern.firstChild;
  for (const neu of neuKinder) {
    const s = schluessel(neu);
    let passend = null;
    if (taugt(s)) {
      const kandidat = altNachSchluessel.get(s);
      if (kandidat && gleichartig(kandidat, neu)) {
        passend = kandidat;
        altNachSchluessel.delete(s);
      }
    } else {
      // Der Reihe nach: der naechste alte Knoten ohne (brauchbaren)
      // Schluessel. Alte Knoten, deren Schluessel nicht mehr vorkommt,
      // werden uebersprungen - sie fallen am Ende weg.
      let kandidat = zeiger;
      while (kandidat && taugt(schluessel(kandidat)) && !neuZahl.has(schluessel(kandidat))) {
        kandidat = kandidat.nextSibling;
      }
      if (kandidat && !taugt(schluessel(kandidat)) && gleichartig(kandidat, neu)) passend = kandidat;
    }
    if (passend) {
      if (passend === zeiger) zeiger = zeiger.nextSibling;
      else altEltern.insertBefore(passend, zeiger);
      knotenAngleichen(passend, neu, aktiv);
    } else {
      altEltern.insertBefore(neu, zeiger);
    }
  }
  while (zeiger) {
    const weiter = zeiger.nextSibling;
    altEltern.removeChild(zeiger);
    zeiger = weiter;
  }
}

// Den Inhalt von wurzel auf markup bringen - so, als stuende dort
// wurzel.innerHTML = markup, nur ohne alles wegzuwerfen.
export function morphInhalt(wurzel, markup) {
  const dokument = wurzel.ownerDocument || globalThis.document;
  const vorlage = dokument.createElement("template");
  vorlage.innerHTML = markup;
  kinderAngleichen(wurzel, vorlage.content, dokument.activeElement || null);
}

// EIN FINGERABDRUCK FUER EIN STUECK MARKUP.
//
// Setzt data-morph-hash in das erste Element von html, gerechnet ueber das
// ganze Stueck. Steht beim naechsten Zeichnen derselbe Abdruck da, laesst
// morphInhalt den Knoten samt Inhalt in Ruhe. Nur fuer Stuecke mit genau
// EINEM aeusseren Element - eine Zeile, eine Karte.
export function mitFingerabdruck(html) {
  const text = String(html || "");
  // FNV-1a, 32 Bit: schnell, und fuer "hat sich etwas geaendert" genug.
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const abdruck = (h >>> 0).toString(36) + text.length.toString(36);
  return text.replace(/^(\s*<[a-zA-Z][\w-]*)/, `$1 data-morph-hash="${abdruck}"`);
}
