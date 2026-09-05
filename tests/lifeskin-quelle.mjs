// Quelltext lesen, um Dinge zu pruefen, die kein Funktionsaufruf zeigt.
//
// Manche Fehler stecken nicht im Verhalten einer Funktion, sondern darin,
// dass zwei Stellen nicht zusammenpassen: ein Knopf ohne Behandler, ein Feld
// ohne Regel, eine Methode, die etwas nicht mehr tut. Solche Pruefungen
// lesen den Quelltext - und dabei sind mir zweimal dieselben zwei Fehler
// unterlaufen, deshalb steht das hier an einer Stelle statt in jeder Datei.
//
// Fehler eins: Der Ausschnitt endete an einer Kommentarmarke, die der
// Kommentarfilter zwei Zeilen darueber entfernt. indexOf gab -1, slice(a,-1)
// lieferte die halbe Datei, und der Test prueft etwas ganz anderes als er
// behauptet - gruen, aber wertlos.
//
// Fehler zwei: Die Methode wurde ueber ihre erste Erwaehnung gesucht. Das
// traf den AUFRUF ("this.#befundZeigen();"), der weiter oben steht, und der
// Ausschnitt war sechzehn Zeichen lang.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

export function lies(pfad) {
  return readFileSync(join(wurzel, pfad), "utf8");
}

// Ohne Kommentarzeilen. Sonst schlaegt jede Suche auf den Erklaerungen an,
// die gerade beschreiben, was entfernt wurde.
export function ohneKommentare(quelle) {
  return quelle.replace(/^[ \t]*\/\/.*$/gm, "");
}

// Der Rumpf einer Methode: von ihrer DEFINITION bis zur naechsten Methode.
export function methode(quelle, name) {
  const anfang = quelle.search(new RegExp(`\\n  (?:async )?${name}\\s*\\(`));
  if (anfang < 0) throw new Error(`Methode ${name} nicht gefunden`);
  const rest = quelle.slice(anfang + name.length + 3);
  const naechste = rest.search(/\n  (?:async )?#?[A-Za-zÄÖÜäöü][A-Za-z0-9]*\s*\(/);
  return naechste < 0 ? rest : rest.slice(0, naechste);
}
