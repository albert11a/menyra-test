// KEIN LINKS, KEIN RECHTS.
//
// Die Fotos sind oft gespiegelt (Frontkamera), und niemand weiss sicher,
// ob "faqja e majtë" die linke Wange des Patienten ist oder die linke
// Seite des Bildes. Ein Befund, der die falsche Seite nennt, kostet mehr
// Vertrauen als einer, der gar keine nennt. Also steht nur "në faqe",
// "në tëmth", "në nofull" - nie welche Seite.
//
// Der Prompt verbietet es; dieser Filter faengt, was trotzdem kommt, und
// auch alte Befunde, die es noch enthalten. Er fasst nur Text an, in dem
// eines der vier Seitenwoerter steht - alles andere bleibt Zeichen fuer
// Zeichen gleich.

// Mit Endungen: majtë, majta, majtën, majtës, djathtin ...
const SEITE = "(?:majt|djatht)(?:ën|ës|in|it|ë|e|a)?";
const ADV = "(?:majtas|djathtas)";
const ENDE = "(?![\\p{L}])";

const REGELN = [
  // beide Seiten genannt -> "të dy faqet"
  [new RegExp(`\\bfaqen\\s+e\\s+${SEITE}\\s+(?:dhe|e)\\s+(?:në\\s+)?(?:faqen\\s+)?e\\s+${SEITE}${ENDE}`, "gu"), "të dy faqet"],
  // "në faqen e majtë" -> "në faqe"
  [new RegExp(`\\bfaqen\\s+(?:e|së|të)\\s+${SEITE}${ENDE}`, "gu"), "faqe"],
  [new RegExp(`\\bFaqen\\s+(?:e|së|të)\\s+${SEITE}${ENDE}`, "gu"), "Faqe"],
  // "në anën e majtë (të fytyrës)" -> "në njërën anë (të fytyrës)"
  [new RegExp(`\\banën\\s+(?:e|së|të)\\s+${SEITE}${ENDE}`, "giu"), "njërën anë"],
  [new RegExp(`\\bana\\s+(?:e|së|të)\\s+${SEITE}${ENDE}`, "giu"), "njëra anë"],
  // "në të majtë" / "nga e djathta" allein -> "në njërën anë"
  [new RegExp(`\\b(në|nga)\\s+(?:e|të)\\s+${SEITE}${ENDE}`, "giu"), "$1 njërën anë"],
  // "(majtas)", "(e djathtë)" in Klammern
  [new RegExp(`\\s*\\(\\s*(?:(?:e|së|të)\\s+)?(?:${SEITE}|${ADV})\\s*\\)`, "giu"), ""],
  // "faqja e majtë", "tëmthi i djathtë", "syrit të majtë" -> nur das Nomen
  [new RegExp(`\\s+(?:e|i|së|të)\\s+${SEITE}${ENDE}`, "giu"), ""],
  // "faqja majtas" -> "faqja"
  [new RegExp(`\\s+${ADV}${ENDE}`, "giu"), ""],
  // was allein uebrig bleibt (Satzanfang)
  [new RegExp(`(^|[\\s(])${ADV}${ENDE}\\s*`, "giu"), "$1"],
  // "në faqe dhe në faqe" nach dem Entfernen -> einmal
  [/\b(në faqe)(?:\s+(?:dhe|e)\s+në faqe)+/giu, "$1"]
];

const HAT_SEITE = new RegExp(`${SEITE}|${ADV}`, "iu");

// KEIN WORT UEBER LICHT UND FOTO.
//
// Die KI haengte gern Vorbehalte an: "..., ndërsa ndriçimi ndikon në
// intensitetin e tyre." oder "Ndriçimi i ngrohtë kufizon vlerësimin e
// saktë të ngjyrës." Die Bildqualitaet beurteilt sie INTERN; dem Patienten
// sagt so ein Satz nur: "wir sind uns nicht sicher". Der Prompt verbietet
// es, dieser Filter faengt den Rest: Ein Nebensatz mit dem Vorbehalt
// faellt weg (ab ", ndërsa" / ", por" / ", megjithëse" / ";" / " – "),
// ein Satz, der nur aus dem Vorbehalt besteht, ganz. "Drita e diellit"
// (Sonnenschutz) bleibt stehen.
const LICHT = /(ndriçim|ndricim|drit[aëe]\s+(?:e|i)\s+(?:ngrohtë|ftohtë|fortë|dobët|verdhë|ambientit|dhomës)|cilësi\p{L}*\s+e\s+foto|qartësi\p{L}*\s+e\s+foto|balanc\p{L}*\s+e\s+bardhë|kamer[aëe]|filt[ëe]r|reflektim|hijet?\s+(?:në|e)\s+foto)/iu;
const NEBENSATZ = /(?:,\s*(?:ndërsa|ndersa|por|megjithëse|megjithese|edhe pse|sepse|pasi|ku)\s|;\s*|\s[–—-]\s|,\s*)/giu;

function satzOhneLicht(satz) {
  const treffer = LICHT.exec(satz);
  if (!treffer) return satz;
  const vorher = satz.slice(0, treffer.index);
  let schnitt = -1;
  for (const m of vorher.matchAll(NEBENSATZ)) schnitt = m.index;
  if (schnitt > 0) {
    const rest = satz.slice(0, schnitt).trim();
    if (rest.split(/\s+/).length >= 3) return satzOhneLicht(`${rest.replace(/[,;:–—-]+$/, "")}.`);
  }
  return "";
}

export function ohneLicht(text) {
  const s = String(text ?? "");
  if (!LICHT.test(s)) return text;
  return s.split(/(?<=[.!?])\s+/).map(satzOhneLicht).filter(Boolean).join(" ").trim();
}

export function ohneSeite(text) {
  const s = String(ohneLicht(text) ?? "");
  if (!HAT_SEITE.test(s)) return s === String(text ?? "") ? text : s;
  let raus = s;
  for (const [muster, ersatz] of REGELN) raus = raus.replace(muster, ersatz);
  return raus.replace(/[ \t]{2,}/g, " ").replace(/\s+([,.;:)])/g, "$1").replace(/\(\s*\)/g, "").trim().replace(/^[,:;]\s*/, "");
}

// Ueber ein ganzes Objekt: jeder Text darin, Kennungen und Zahlen
// bleiben, wie sie sind.
export function ohneSeiteTief(wert) {
  if (typeof wert === "string") return ohneSeite(wert);
  if (Array.isArray(wert)) return wert.map(ohneSeiteTief);
  if (wert && typeof wert === "object") {
    const raus = {};
    for (const [k, v] of Object.entries(wert)) raus[k] = ohneSeiteTief(v);
    return raus;
  }
  return wert;
}
