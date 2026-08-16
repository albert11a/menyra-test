"use strict";

// Generated from ../../../shared/go/go-city-core.js. Do not edit manually.
// Run: node functions/scripts/sync-go-shared.cjs

// Mnyra GO - die Stadt auf einen Schluessel bringen.
//
// Eine Stadt hat hier mehrere richtige Namen. Der Gast waehlt in GO
// "Prishtinë", das Lokal traegt im Profil "Prishtina" ein, ein Geraet mit
// englischer Ortsbestimmung meldet "Pristina" - gemeint ist dreimal derselbe
// Ort. Wer nur die Akzente abschneidet, sieht davon drei verschiedene Staedte
// und laesst den Gast vor einer leeren Liste stehen.
//
// Deshalb steht hier zwischen dem geschriebenen Namen und dem Vergleich ein
// Schluessel: Alle Schreibweisen einer Stadt fallen auf denselben Wert. Der
// Vergleich ist danach wieder das, was er sein soll - ein Gleichheitszeichen.
//
// Zwei Dinge sind dabei Absicht:
//
//  1. Die Liste ist ein Verzeichnis, keine Schranke. Eine Stadt, die nicht
//     darin steht, bekommt ihren gefalteten Namen als Schluessel und
//     funktioniert damit genauso - nur eben ohne Zweitnamen.
//  2. Verglichen wird immer der ganze Schluessel, nie ein Teil davon. So wird
//     aus "Peja" nicht versehentlich ein Treffer in "Pejton".

// Jede Zeile ist eine Stadt. Der erste Eintrag ist der Schluessel, die
// uebrigen sind die Schreibweisen, die auf ihn zeigen - albanisch bestimmt und
// unbestimmt, die englische und die serbische Form.
const GO_CITY_ALIAS_GROUPS = Object.freeze([
  Object.freeze(["prishtina", "prishtine", "prishtin", "pristina"]),
  Object.freeze(["prizren", "prizreni"]),
  Object.freeze(["peja", "peje", "pec"]),
  Object.freeze(["gjakova", "gjakove", "djakovica"]),
  Object.freeze(["ferizaj", "ferizaji", "urosevac"]),
  Object.freeze(["gjilan", "gjilani", "gnjilane"]),
  Object.freeze(["mitrovica", "mitrovice", "kosovskamitrovica"]),
  Object.freeze(["vushtrria", "vushtrri", "vucitrn"]),
  Object.freeze(["podujeva", "podujeve", "podujevo"]),
  Object.freeze(["tirana", "tirane", "tirona"]),
  Object.freeze(["durres", "durresi", "durazzo"]),
  Object.freeze(["shkup", "shkupi", "skopje", "skopja"]),
  Object.freeze(["kukes", "kukesi"]),
  Object.freeze(["smederevo"])
]);

// Einmal aufgebaut, danach nur noch nachgeschlagen: Schreibweise -> Schluessel.
const GO_CITY_KEY_BY_ALIAS = (() => {
  const map = new Map();
  GO_CITY_ALIAS_GROUPS.forEach((group) => {
    const canonical = group[0];
    group.forEach((alias) => map.set(alias, canonical));
  });
  return map;
})();

/**
 * Den geschriebenen Namen auf seine Buchstaben bringen.
 *
 * Kleinbuchstaben, Akzente weg, alles was kein Buchstabe und keine Ziffer ist
 * weg. "Prishtinë" und "PRISHTINE " sind danach dasselbe, "Prishtina" noch
 * nicht - dafuer ist die Liste oben da.
 */
function foldGoCityText(value = "") {
  let text = String(value ?? "").toLowerCase().trim();
  try {
    text = text.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  } catch {
    // Ohne Normalisierung vergleicht sich weniger, aber nichts falsch.
  }
  return text.replace(/[^a-z0-9]+/g, "");
}

/**
 * Der Schluessel einer Stadt - der Wert, der verglichen und gespeichert wird.
 *
 * Leere Eingabe ergibt einen leeren Schluessel. Das ist kein Fehler, sondern
 * die Aussage "keine Stadt angegeben" - und die darf niemanden aussortieren.
 */
function goCityKey(value = "") {
  const folded = foldGoCityText(value);
  if (!folded) return "";
  return GO_CITY_KEY_BY_ALIAS.get(folded) || folded;
}

/**
 * Meinen zwei geschriebene Namen dieselbe Stadt?
 *
 * Fehlt eine der beiden Seiten, lautet die Antwort ja: Ein Lokal ohne
 * Stadtangabe soll nicht unsichtbar werden.
 */
function isSameGoCity(left = "", right = "") {
  const a = goCityKey(left);
  const b = goCityKey(right);
  if (!a || !b) return true;
  return a === b;
}

module.exports = {
  foldGoCityText,
  goCityKey,
  isSameGoCity
};
