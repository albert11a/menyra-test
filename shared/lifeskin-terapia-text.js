// DIE TEXTREGELN DER THERAPIESEITE - an EINER Stelle.
//
// Die Therapieseite (apps/lifeskin-verkauf/terapia.js) und die Vorschau im
// Befund in Heart (heart-lifeskin-vorschau.js) setzen denselben Text auf
// dieselbe Weise: fett, Produktname vorn, keine Verneinung, richtige
// Produktzahl. Zwei Abschriften waeren zwei Seiten, die auseinanderlaufen -
// und eine Vorschau, die etwas anderes zeigt als die Seite, ist schlimmer
// als keine. Nur reine Funktionen, kein DOM.

// "Poret e bllokuara në ballë." -> "poret e bllokuara në ballë"
export function satzteil(text) {
  const t = String(text || "").trim().replace(/[.!]+$/, "");
  return t ? t.charAt(0).toLowerCase() + t.slice(1) : "";
}

// EIN LANGER BEFUNDSATZ, ZWEI ZEILEN: das Problem und wo es ist.
//
// "Pore të zgjeruara dhe mikroreliev i pabarabartë, më i dukshëm në faqet
// pranë hundës" -> ["Pore të zgjeruara dhe mikroreliev i pabarabartë",
// "më i dukshëm në faqet pranë hundës"]. Getrennt wird am ersten Komma,
// Gedankenstrich oder " me " nach mindestens zwei Woertern. Nur fuer
// Befunde ohne den Block "shitja" (Prompt vor v8) - v8 liefert beides
// schon getrennt.
export function kurzUndRest(text) {
  const satz = String(text || "").trim().replace(/[.!]+$/, "");
  let schnitt = -1;
  let laenge = 0;
  for (const trenner of [", ", " — ", " - ", " me "]) {
    const i = satz.indexOf(trenner);
    if (i > 0 && satz.slice(0, i).split(/\s+/).length >= 2 && (schnitt < 0 || i < schnitt)) {
      schnitt = i;
      laenge = trenner === " me " ? 1 : trenner.length;
    }
  }
  if (schnitt < 0) return [satz, ""];
  return [satz.slice(0, schnitt).trim(), satz.slice(schnitt + laenge).trim()];
}

// Vergisst die Analyse die Sterne, werden die Probleme aus den Karten
// fett gesetzt, wo sie im Satz wortgleich vorkommen.
export function fettNachtragen(text, problemet = []) {
  let satz = String(text || "");
  if (satz.includes("**")) return satz;
  for (const p of problemet || []) {
    const wort = String(p?.gjetja || "").trim();
    if (wort.length < 4) continue;
    const i = satz.toLowerCase().indexOf(wort.toLowerCase());
    if (i >= 0) satz = `${satz.slice(0, i)}**${satz.slice(i, i + wort.length)}**${satz.slice(i + wort.length)}`;
  }
  if (satz.includes("**")) return satz;
  // Nichts wortgleich gefunden: Der Satz hat die Form "Për X dhe Y — ...",
  // also sind X und Y die Probleme.
  const form = /^(Për )(.+?)( — .*)$/.exec(satz);
  if (!form) return satz;
  const teile = form[2].split(" dhe ");
  const probleme = teile.length >= 2
    ? [teile[0], teile.slice(1).join(" dhe ")]
    : [form[2]];
  return `${form[1]}${probleme.map((x) => `**${x.trim()}**`).join(" dhe ")}${form[3]}`;
}

// Nennt der Satz eine andere Produktzahl, als die Seite zeigt (in Heart
// wurde nach der Analyse etwas an- oder abgehakt), wird sein Schluss
// ersetzt - "1 produkt" ueber zwei Produkten ist ein Widerspruch, den
// jeder sieht.
export function hyrjaAbgleichen(text, anzahl, imText = []) {
  const satz = String(text || "");
  if (!anzahl || imText.length === anzahl || !satz.includes(" — ")) return satz;
  const vorne = satz.slice(0, satz.indexOf(" — "));
  const rest = `${anzahl === 1 ? "një produkt" : `${anzahl} produkte`}, një plan i qartë dhe Dr. Gashi pranë jush çdo javë.`;
  return `${vorne} — ${rest}`;
}

// SICHERHEITSNETZE FUER DIE TEXTE DER ANALYSE.
//
// "LF PIGMENT nuk trajton rrudhat; vepron mbi njollat" - ein Satz, der
// sagt, was das Produkt NICHT tut, verkauft es nicht. Der verneinte Teil
// faellt weg; bleibt nichts uebrig, nimmt die Seite den Katalogsatz.
export function ohneVerneinung(text) {
  const satz = String(text || "");
  const ohne = satz.replace(/\bnuk (trajton|vepron|ndihmon|ndikon|lufton|heq|shëron|zgjidh)[^;.,]*[;,]\s*/gi, "").trim();
  if (/\bnuk (trajton|vepron|ndihmon|ndikon|lufton|heq|shëron|zgjidh)\b/i.test(ohne)) return "";
  return ohne;
}

// Ohne Foto: kein Satz, der ein Foto erwaehnt ("me foto do të ishte më
// e saktë") - er hat den Weg ohne Foto gewaehlt, und der Plan ist seiner.
export function ohneFotoSaetze(text) {
  return String(text || "").split(/(?<=[.!?])\s+/).filter((x) => !/foto|vetëm nga përshkrimi|nuk mund të vlerësoh/i.test(x)).join(" ").trim();
}

// **fett** in Teile zerlegt: [{ text, fett }]. Kein HTML aus der
// Modellantwort erreicht eine Seite - der Aufrufer baut die Knoten.
export function fettTeile(text) {
  return String(text || "").split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((teil) => {
    const fett = /^\*\*([^*]+)\*\*$/.exec(teil);
    return fett ? { text: fett[1], fett: true } : { text: teil, fett: false };
  });
}

// Der Produktname steht vorn und gruen - wie in der Vorlage. Steht er
// schon im Satz, wird er dort herausgenommen, damit er nicht zweimal
// dasteht. Liefert den Rest des Satzes nach dem Namen.
export function produktVornRest(name, satz) {
  const text = String(satz || "").trim();
  const i = text.toUpperCase().indexOf(String(name).toUpperCase());
  let rest = text;
  if (i === 0) rest = text.slice(name.length).trim();
  else if (i > 0) rest = `${text.slice(0, i)}${text.slice(i + name.length)}`.replace(/\s{2,}/g, " ").trim();
  if (rest && i !== 0) rest = rest.charAt(0).toLowerCase() + rest.slice(1);
  return rest;
}
