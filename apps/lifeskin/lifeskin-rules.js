// Aus Zahlen werden Befunde, aus Befunden werden Produkte.
//
// Auch dieses Modul ist reine Rechnung ohne DOM - aus demselben Grund wie
// lifeskin-metrics.js: Was den Kunden am Ende ueberzeugen soll, muss vorher
// pruefbar gewesen sein.
//
// Zur Ehrlichkeit der Schwellen: Die Werte in SCHWELLEN sind begruendete
// Startwerte, keine Messreihe. Sie muessen an echten Aufnahmen nachgezogen
// werden - dafuer stehen sie an einer Stelle beisammen und nicht verstreut im
// Code. Bis das geschehen ist, gilt die Regel aus dem Konzept: lieber eine
// Stufe zu vorsichtig als eine zu dramatisch. Ein Befund, der schlimmer klingt
// als das Gesicht im Spiegel aussieht, kostet genau das Vertrauen, auf dem der
// ganze Verkauf steht.

import { TZONE, WANGEN } from "./lifeskin-metrics.js";

export const ALTERSGRUPPEN = Object.freeze(["18-24", "25-34", "35-44", "45-54", "55+"]);

export const STUFEN = Object.freeze(["unauffaellig", "leicht", "deutlich", "stark"]);

// Der Katalog aller Befunde, die das Verfahren erzeugen kann.
//
// Er ist die Liste, gegen die im CEO-Bereich die Produktabdeckung geprueft
// wird: Zu jedem Eintrag hier muss mindestens ein Produkt existieren, sonst
// steht am Ende eine Diagnose ohne Behandlung - der schlechteste Ausgang, den
// dieser Trichter nehmen kann.
export const BEFUNDE = Object.freeze([
  {
    id: "roetung",
    label: { de: "Rötung", sq: "Skuqje" },
    zonen: WANGEN,
    wert: "roetung",
    beschwerde: { de: "Gerötete, gereizte Haut", sq: "Lëkurë e skuqur dhe e irrituar" }
  },
  {
    id: "trockenheit",
    label: { de: "Trockenheit", sq: "Thatësi" },
    zonen: WANGEN,
    wert: "textur",
    beschwerde: { de: "Raue, spannende Haut", sq: "Lëkurë e ashpër dhe e shtrënguar" }
  },
  {
    id: "glanz",
    label: { de: "Glanz", sq: "Shkëlqim" },
    zonen: TZONE,
    wert: "glanz",
    beschwerde: { de: "Fettige T-Zone", sq: "Zonë T e yndyrshme" }
  },
  {
    id: "poren",
    label: { de: "Sichtbare Poren", sq: "Poret e dukshme" },
    zonen: ["nase", "wangeLinks", "wangeRechts"],
    wert: "poren",
    beschwerde: { de: "Vergrößerte Poren", sq: "Pore të zgjeruara" }
  },
  {
    id: "pigment",
    label: { de: "Pigmentflecken", sq: "Njolla pigmenti" },
    zonen: WANGEN,
    wert: "pigment",
    beschwerde: { de: "Ungleichmäßiger Hautton", sq: "Ngjyrë e pabarabartë e lëkurës" }
  },
  {
    id: "linien",
    label: { de: "Feine Linien", sq: "Rrudha të imëta" },
    zonen: ["stirn", "wangeLinks", "wangeRechts"],
    wert: "linien",
    beschwerde: { de: "Erste Fältchen", sq: "Rrudhat e para" }
  }
]);

export const BEFUND_IDS = Object.freeze(BEFUNDE.map((b) => b.id));

// Ab welchem Wert eine Stufe beginnt. Drei Grenzen je Befund: leicht,
// deutlich, stark. Alles darunter ist unauffaellig.
//
// Nachjustiert wird hier und nirgends sonst.
export const SCHWELLEN = Object.freeze({
  roetung:     [12.0, 15.5, 19.0],   // a* in Lab
  trockenheit: [1.10, 1.70, 2.40],   // lokale Helligkeitsschwankung
  glanz:       [0.045, 0.090, 0.150], // Anteil spekularer Punkte
  poren:       [0.030, 0.060, 0.100],
  pigment:     [0.055, 0.100, 0.160],
  linien:      [14.0, 21.0, 30.0]    // Kantenstaerke, oberes Zehntel
});

// Was mit dem Alter erwartbar zunimmt, wird mit dem Alter milder bewertet.
//
// Ohne diese Anpassung bekaeme jede Frau ueber 45 bei "Linien" die hoechste
// Stufe - fachlich richtig und verkaeuferisch wertlos, weil es nichts
// unterscheidet und wie eine Beleidigung liest. Der Faktor hebt die Schwellen
// an, sodass die Stufe wieder aussagt, wie jemand *im Vergleich zur eigenen
// Altersgruppe* dasteht.
export const ALTERSFAKTOR = Object.freeze({
  "18-24": { linien: 0.72, pigment: 0.80, trockenheit: 0.92 },
  "25-34": { linien: 0.88, pigment: 0.92, trockenheit: 1.00 },
  "35-44": { linien: 1.10, pigment: 1.08, trockenheit: 1.06 },
  "45-54": { linien: 1.34, pigment: 1.22, trockenheit: 1.12 },
  "55+":   { linien: 1.60, pigment: 1.36, trockenheit: 1.18 }
});

function mittelUeberZonen(messung, zonen, wert) {
  const werte = zonen.map((z) => messung?.[z]?.[wert]).filter(Number.isFinite);
  if (!werte.length) return null;
  return werte.reduce((s, v) => s + v, 0) / werte.length;
}

function stufeFuer(wert, grenzen) {
  if (!Number.isFinite(wert)) return 0;
  if (wert >= grenzen[2]) return 3;
  if (wert >= grenzen[1]) return 2;
  if (wert >= grenzen[0]) return 1;
  return 0;
}

// Ein Befund je Katalogeintrag, mit Stufe und Rohwert.
export function bewerteBefunde(messung, altersgruppe = "25-34") {
  const faktoren = ALTERSFAKTOR[altersgruppe] || ALTERSFAKTOR["25-34"];

  return BEFUNDE.map((befund) => {
    const wert = mittelUeberZonen(messung, befund.zonen, befund.wert);
    const faktor = faktoren[befund.id] ?? 1;
    const grenzen = SCHWELLEN[befund.id].map((g) => g * faktor);
    const stufe = stufeFuer(wert, grenzen);
    return {
      id: befund.id,
      label: befund.label,
      beschwerde: befund.beschwerde,
      wert,
      stufe,
      stufeName: STUFEN[stufe],
      grenzen
    };
  });
}

// Der Hauttyp faellt aus den Verhaeltnissen, nicht aus Absolutwerten.
export function bestimmeHauttyp(verhaeltnisse, befunde) {
  const v = verhaeltnisse || {};
  const stufe = (id) => befunde?.find((b) => b.id === id)?.stufe ?? 0;

  const tzoneStaerker = Number.isFinite(v.glanzTzoneZuWange) && v.glanzTzoneZuWange >= 1.35;
  const ueberallGlaenzend = stufe("glanz") >= 2 && !tzoneStaerker;
  const wangenGereizt = Number.isFinite(v.roetungWangeMinusTzone) && v.roetungWangeMinusTzone >= 1.6;

  if (stufe("roetung") >= 2 && wangenGereizt) {
    return { id: "empfindlich", label: { de: "Empfindliche Haut", sq: "Lëkurë e ndjeshme" } };
  }
  if (ueberallGlaenzend) {
    return { id: "fettig", label: { de: "Fettige Haut", sq: "Lëkurë e yndyrshme" } };
  }
  if (tzoneStaerker) {
    return { id: "mischhaut", label: { de: "Mischhaut", sq: "Lëkurë e përzier" } };
  }
  if (stufe("trockenheit") >= 2 && stufe("glanz") === 0) {
    return { id: "trocken", label: { de: "Trockene Haut", sq: "Lëkurë e thatë" } };
  }
  return { id: "normal", label: { de: "Normale Haut", sq: "Lëkurë normale" } };
}

// Der positive Punkt, der vor den Problemen steht.
//
// Er ist keine Freundlichkeit, sondern die Bedingung dafuer, dass der Rest
// geglaubt wird: Eine reine Maengelliste loest Abwehr aus. Gesucht wird der
// Befund mit der niedrigsten Stufe - und nur wenn er wirklich unauffaellig
// ist, wird er genannt. Ein erfundenes Lob faellt sofort auf.
export function findePositives(befunde) {
  const unauffaellig = befunde.filter((b) => b.stufe === 0);
  if (!unauffaellig.length) return null;
  const reihenfolge = ["linien", "pigment", "roetung", "poren", "trockenheit", "glanz"];
  for (const id of reihenfolge) {
    const treffer = unauffaellig.find((b) => b.id === id);
    if (treffer) return treffer;
  }
  return unauffaellig[0];
}

// Welche Produkte zu diesem Gesicht passen.
//
// Ein Produkt traegt Ausloeser: Befund-Kennung plus Mindeststufe. Passt
// mindestens einer, kommt es in Frage. Sortiert wird nach der Schwere des
// Befunds, den es abdeckt - was am staerksten auffaellt, wird zuerst
// behandelt.
export function waehleProdukte(befunde, produkte, maximal = 2) {
  const stufeVon = new Map(befunde.map((b) => [b.id, b.stufe]));

  const passend = (produkte || [])
    .filter((p) => p && p.availability !== "hidden")
    .map((produkt) => {
      let bestePunktzahl = 0;
      let gedecktErsteId = null;
      for (const ausloeser of produkt.triggers || []) {
        const stufe = stufeVon.get(ausloeser.befund) ?? 0;
        const mindest = Number.isFinite(ausloeser.abStufe) ? ausloeser.abStufe : 1;
        if (stufe >= mindest && stufe > bestePunktzahl) {
          bestePunktzahl = stufe;
          gedecktErsteId = ausloeser.befund;
        }
      }
      return { produkt, punktzahl: bestePunktzahl, wegen: gedecktErsteId };
    })
    .filter((e) => e.punktzahl > 0)
    .sort((a, b) => b.punktzahl - a.punktzahl || (a.produkt.order ?? 99) - (b.produkt.order ?? 99));

  // Zwei Produkte, die denselben Befund abdecken, sind eine Wiederholung -
  // das Set soll zwei Dinge koennen, nicht zweimal dasselbe.
  const gewaehlt = [];
  const schonGedeckt = new Set();
  for (const eintrag of passend) {
    if (gewaehlt.length >= maximal) break;
    if (schonGedeckt.has(eintrag.wegen)) continue;
    gewaehlt.push(eintrag);
    schonGedeckt.add(eintrag.wegen);
  }

  // Aufgefuellt wird immer bis zur vollen Setgroesse.
  //
  // Zwei Faelle, und beide sind der Normalfall, nicht der Rand:
  //
  // Ein einziger Befund - so sieht die Mehrheit aus. Ohne Auffuellen kaeme
  // ein "Set" aus einem Produkt heraus, der Ankerpreis waere der Einzelpreis,
  // und die Ersparnis rechnerisch null oder negativ. Der ganze Preisaufbau
  // aus dem Angebot bricht damit zusammen.
  //
  // Gar kein Befund - junge, gesunde Haut. Ohne Auffuellen stuende unter dem
  // Befund nichts zum Bestellen.
  //
  // Was aufgefuellt wird, traegt `grundpflege` und bekommt darum im Text die
  // Erhaltung als Grund statt eines erfundenen Befunds.
  if (gewaehlt.length < maximal) {
    const schonDrin = new Set(gewaehlt.map((e) => e.produkt.id));
    const rest = (produkte || [])
      .filter((p) => p && p.availability !== "hidden" && !schonDrin.has(p.id))
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

    for (const produkt of rest) {
      if (gewaehlt.length >= maximal) break;
      gewaehlt.push({ produkt, punktzahl: 0, wegen: null, grundpflege: true });
    }
  }

  return gewaehlt;
}

// Fuer den CEO-Bereich: Welcher Befund hat kein Produkt?
//
// Das ist die Ansicht, die verhindert, dass jemand eine Diagnose bekommt und
// darunter nichts steht. Geprueft wird je Befund und je Stufe ab "leicht" -
// denn ein Produkt, das erst ab "stark" ausloest, hilft der Mehrheit nicht.
export function pruefeAbdeckung(produkte) {
  const sichtbar = (produkte || []).filter((p) => p && p.availability !== "hidden");

  return BEFUNDE.map((befund) => {
    const treffer = sichtbar.filter((p) =>
      (p.triggers || []).some((t) => t.befund === befund.id)
    );
    const abStufe = treffer.length
      ? Math.min(...treffer.flatMap((p) =>
          (p.triggers || []).filter((t) => t.befund === befund.id)
            .map((t) => (Number.isFinite(t.abStufe) ? t.abStufe : 1))))
      : null;

    let luecke = null;
    if (!treffer.length) luecke = "kein Produkt";
    else if (abStufe > 1) luecke = `erst ab Stufe ${abStufe} (${STUFEN[abStufe]})`;

    return {
      befund: befund.id,
      label: befund.label,
      beschwerde: befund.beschwerde,
      produkte: treffer.map((p) => ({ id: p.id, name: p.name })),
      abStufe,
      luecke,
      vollstaendig: !luecke
    };
  });
}

// Der ganze Befund in einem Aufruf.
export function erstelleBefund({ messung, verhaeltnisse, altersgruppe, produkte, setGroesse = 2 }) {
  const befunde = bewerteBefunde(messung, altersgruppe);
  const hauttyp = bestimmeHauttyp(verhaeltnisse, befunde);
  const positives = findePositives(befunde);
  const empfehlung = waehleProdukte(befunde, produkte, setGroesse);

  return {
    hauttyp,
    befunde,
    positives,
    // Absteigend nach Stufe - der Befund, der am meisten auffaellt, steht oben.
    hauptbefunde: befunde.filter((b) => b.stufe > 0).sort((a, b) => b.stufe - a.stufe),
    empfehlung
  };
}
