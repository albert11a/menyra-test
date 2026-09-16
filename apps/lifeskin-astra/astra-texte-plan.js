// DIE TEXTKARTE DER PATIENTENSEITE.
//
// Jeder Satz, den ein Patient auf seiner Analyse liest, steht in
// astra-texte.js - und jeder einzelne laesst sich in Heart fuer EINEN Fall
// ueberschreiben. Diese Datei sagt, welche es sind und in welcher
// Reihenfolge sie auf der Seite vorkommen: Sie ist die Landkarte zwischen
// den Zeichenketten im Code und dem Formular, in dem jemand sie aendert.
//
// WARUM EINE EIGENE DATEI und nicht ein paar Felder mehr im Befundbogen:
// Es sind ueber hundertsiebzig Texte. Ohne Abschnitte und ohne feste
// Reihenfolge waere das Formular eine Wand, in der niemand etwas findet.
// Hier steht die Ordnung der Seite selbst - von der Warteseite bis zum
// letzten Strich.
//
// WAS HIER NICHT STEHT, IST NICHT AENDERBAR. Deshalb haelt
// tests/lifeskin-textkarte.test.mjs beide Seiten zusammen: Kommt in
// astra-texte.js ein Text dazu, ohne dass er hier auftaucht, faellt der
// Test - und nicht erst jemandem auf, der ihn vergeblich sucht.
//
// Die Schluessel der Listen (Fragen, Begleitschritte) sind flach gemacht:
// pyetje1Pyetja, ndjekja2Titel. Eine flache Karte laesst sich speichern,
// vergleichen und anzeigen; eine verschachtelte waere an jeder dieser drei
// Stellen ein Sonderfall.

import { TEXTE, NDJEKJA, NDJEKJA_KONTAKT, PYETJET, t } from "./astra-texte.js";

export const TEXT_ABSCHNITTE = Object.freeze([
  {
    id: "zustaende",
    titel: "Laden und Fehler",
    fuss: "Was dasteht, solange nichts da ist - und wenn der Link ins Leere geht.",
    schluessel: Object.freeze([
      "laedt",
      "wegTitel",
      "wegText",
    ])
  },
  {
    id: "warten",
    titel: "Die Warteseite",
    fuss: "Der Bildschirm, den fast jeder sieht: Stunden vor dem Befund, oft als einziger.",
    schluessel: Object.freeze([
      "pritTitel",
      "pritTitelOhne",
      "pritWarum",
      "pritDauerSot",
      "pritDauerNeser",
      "pritNumri",
      "pritFotoMarke",
      "pritHapi1",
      "pritHapi2",
      "pritHapi3",
      "pritHapi4",
      "pritNjofto",
      "pritWaKnopf",
      "pritWaUnter",
      "pritWaRueck",
      "pritWaRueckJa",
      "pritWaDanke",
      "pritSi",
      "pritSiText",
      "pritKopjo",
      "pritKopjuar",
      "pritKopjoUnder",
      "pritBlattMbyll",
    ])
  },
  {
    id: "kopf",
    titel: "Kopf der Analyse",
    fuss: "Die ersten Zeilen, die er nach dem Befund liest - und wer den Befund gestellt hat.",
    schluessel: Object.freeze([
      "faqjaTitull",
      "pyetje",
      "analizaJuaj",
      "heroTitel",
      "heroTitelOhne",
      "heroIntro",
      "arztName",
      "arztRolle",
      "arztRolleDatum",
      "vleresuarNga",
    ])
  },
  {
    id: "einordnung",
    titel: "Einordnung",
    fuss: "Die kurze Antwort oben: worauf es ankommt und was als Naechstes kommt.",
    schluessel: Object.freeze([
      "rezultatiMarke",
      "vleresimiOrientues",
      "hapiRadhes",
      "hapiRadhesPlan",
      "hapiRadhesKontroll",
      "metodaNote",
      "metodaLink",
      "abklaerungNote",
      "drejtPlanit",
    ])
  },
  {
    id: "gjetjet",
    titel: "Was zu sehen ist",
    fuss: "Ueber dem Befundtext, den Dr. Gashi schreibt.",
    schluessel: Object.freeze([
      "gjetjetMarke",
      "gjetjetTitel",
      "gjetjetNote",
      "fokusiKryesor",
    ])
  },
  {
    id: "plan",
    titel: "Der Plan",
    fuss: "Die Mittel, was sie tun, wie sie angewendet werden, und die Routine.",
    schluessel: Object.freeze([
      "planiMarke",
      "planiTitel",
      "planiIntro",
      "objektiviMarke",
      "objektiviStandard",
      "pseNePlan",
      "roliPerdorimi",
      "veprimiMarke",
      "perberesitMarke",
      "perdorimiMarke",
      "perdorimiHapi",
      "perdorimiSasia",
      "perdorimiKujdes",
      "synimiMarke",
      "rutinaMarke",
      "rutinaTitel",
      "rutinaMengjes",
      "rutinaMbremje",
      "rutinaBosh",
    ])
  },
  {
    id: "angebot",
    titel: "Das Angebot",
    fuss: "Set, Preis, Lieferung, Garantie - alles, was zwischen Plan und Bestellung steht.",
    schluessel: Object.freeze([
      "paketaMarke",
      "paketaTitel",
      "paketaIntro",
      "setiMarke",
      "setiTitel",
      "setiNumri",
      "perfshiPlan",
      "perfshiMbeshtetje",
      "perfshiRishikim",
      "cmimiMarke",
      "pagesaNjehere",
      "pagesaKurMerrni",
      "knopfStart",
      "dorezimSatz",
      "faktDergesa",
      "faktDite",
      "faktTransporti",
      "faktFalas",
      "faktPaParapagim",
      "garanciaTitel",
      "garanciaText",
    ])
  },
  {
    id: "fragen",
    titel: "Fragen vor der Entscheidung",
    fuss: "Die sechs Fragen und ihre Antworten. Keine wird in ein Kaufargument umgedreht.",
    schluessel: Object.freeze([
      "pyetjeParaVendimit",
      "pyetjetMarke",
      "pyetjetTitel",
      "pyetje1Pyetja",
      "pyetje1Pergjigja",
      "pyetje2Pyetja",
      "pyetje2Pergjigja",
      "pyetje3Pyetja",
      "pyetje3Pergjigja",
      "pyetje4Pyetja",
      "pyetje4Pergjigja",
      "pyetje5Pyetja",
      "pyetje5Pergjigja",
    ])
  },
  {
    id: "begleitung",
    titel: "Begleitung",
    fuss: "Die drei Zeitpunkte - Tag 1, jede Woche, Tag 28 - und der Weg zur Frage.",
    schluessel: Object.freeze([
      "ndjekjaMarke",
      "ndjekjaTitel",
      "ndjekjaIntro",
      "ndjekja1Marke",
      "ndjekja1Titel",
      "ndjekja1Text",
      "ndjekja2Marke",
      "ndjekja2Titel",
      "ndjekja2Text",
      "ndjekja3Marke",
      "ndjekja3Titel",
      "ndjekja3Text",
      "kontaktTitel",
      "kontaktText",
      "kontaktKnopf",
    ])
  },
  {
    id: "plote",
    titel: "Die vollstaendige Analyse",
    fuss: "Der Aufklapper: Zonen, Messwerte, Begriffe, Prognose ohne Pflege.",
    schluessel: Object.freeze([
      "ploteMarke",
      "ploteTitel",
      "ploteIntro",
      "zonatAuf",
      "ekzaminimiAuf",
      "parametratAuf",
      "parametratNote",
      "kuptimiAuf",
      "termatAuf",
      "termatTeJu",
      "paKujdesAuf",
      "paKujdesZbehet",
      "paKujdesNuk",
      "paKujdesPas6",
    ])
  },
  {
    id: "grenze",
    titel: "Die Grenze der Methode",
    fuss: "Was diese Analyse nicht leisten kann. Der Satz, der sie glaubwuerdig macht.",
    schluessel: Object.freeze([
      "kufijteAuf",
      "kufijteText",
    ])
  },
  {
    id: "bestellung",
    titel: "Bestellung",
    fuss: "Formular, Bestaetigung und der Stand der Lieferung.",
    schluessel: Object.freeze([
      "porosiaMarke",
      "porosiaTitel",
      "porosiaIntro",
      "porosiaEmri",
      "porosiaTelefon",
      "porosiaAdresa",
      "porosiaQyteti",
      "porosiaKonfirmo",
      "porosiaDergohet",
      "porosiaPflicht",
      "porosiaFehler",
      "porosiaGjithsej",
      "porosiaZahlung",
      "siguriaPagesa",
      "siguriaGaranci",
      "siguriaDergesa",
      "dankeTitel",
      "dankeText",
      "dankeKthehu",
      "statusMarke",
      "statusPranuar",
      "statusNisur",
      "statusDorezuar",
      "statusPritet",
      "statusTeDera",
    ])
  },
  {
    id: "fuss",
    titel: "Hilfe und Fuss",
    fuss: "Der Hilfe-Kasten und alles unter dem letzten Strich.",
    schluessel: Object.freeze([
      "ndihmaTitel",
      "ndihmaText",
      "ndihmaWhatsapp",
      "ndihmaMbyll",
      "fusnotaSlogan",
      "anbieterMarke",
      "kontakt",
    ])
  }
]);

// Alle Schluessel der Karte, flach - fuer das Lesen des Formulars und fuer
// die Pruefung beim Speichern. Was nicht in dieser Liste steht, wird nicht
// gespeichert: Ein Feld, das jemand von aussen dazuschreibt, hat auf der
// Patientenseite nichts zu suchen.
export const TEXT_SCHLUESSEL = Object.freeze(
  TEXT_ABSCHNITTE.flatMap((a) => a.schluessel)
);

const LISTEN_TEIL = Object.freeze({ Marke: "marke", Titel: "titel", Text: "text" });

// Der Text, der ohne eigenen Eintrag auf der Seite steht.
//
// Er ist dreierlei zugleich: der Platzhalter im Formular, die Erklaerung,
// worum es bei diesem Schluessel ueberhaupt geht, und der Wert, den die
// Seite nimmt, wenn das Feld leer bleibt. Genau deshalb steht im Formular
// keine erfundene deutsche Beschriftung daneben - der Satz selbst sagt
// besser, was er ist.
export function standardText(schluessel, sprache = "sq") {
  const name = String(schluessel || "");
  if (TEXTE[name]) return t(TEXTE[name], sprache);

  const schritt = /^ndjekja([1-9])(Marke|Titel|Text)$/.exec(name);
  if (schritt) {
    const eintrag = NDJEKJA[Number(schritt[1]) - 1];
    return eintrag ? t(eintrag[LISTEN_TEIL[schritt[2]]], sprache) : "";
  }

  const kontakt = /^kontakt(Titel|Text|Knopf)$/.exec(name);
  if (kontakt) {
    return t(NDJEKJA_KONTAKT[{ Titel: "titel", Text: "text", Knopf: "knopf" }[kontakt[1]]], sprache);
  }

  const frage = /^pyetje([1-9])(Pyetja|Pergjigja)$/.exec(name);
  if (frage) {
    const eintrag = PYETJET[Number(frage[1]) - 1];
    return eintrag ? t(eintrag[frage[2].toLowerCase()], sprache) : "";
  }

  return "";
}

// Was von aussen als eigener Text hereinkommt, auf das Erlaubte gestutzt.
//
// Drei Grenzen: nur bekannte Schluessel, nur Zeichenketten, und keine, die
// laenger ist als der laengste Text der Seite je war. Ein Befunddokument
// hat ein Megabyte; hundertsiebzig freie Textfelder ohne Grenze sind der
// einfachste Weg, es zu sprengen - und danach laesst sich der Fall gar
// nicht mehr speichern.
export const TEXT_HOECHSTLAENGE = 1200;

export function texteSaeubern(roh) {
  const raus = {};
  if (!roh || typeof roh !== "object") return raus;
  for (const schluessel of TEXT_SCHLUESSEL) {
    const wert = roh[schluessel];
    if (typeof wert !== "string") continue;
    const sauber = wert.trim();
    // LEER HEISST STANDARD. Ein leeres Feld loescht den eigenen Text und
    // stellt den der Seite wieder her - es speichert keine Leerzeile.
    if (!sauber) continue;
    raus[schluessel] = sauber.slice(0, TEXT_HOECHSTLAENGE);
  }
  return raus;
}
