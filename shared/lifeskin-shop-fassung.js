// /lifeskinshop IN ZWEI FERTIGEN FASSUNGEN (Inhaber 07.10.).
//
// Das Akne-Set steht in Heart auf 2 oder 3 Produkten. Damit beim ersten
// Laden nichts umspringt, gibt es die Seite zweimal fertig: index.html
// (3 Produkte, Quelle) und index-2.html (2 Produkte, vom Build erzeugt).
// Welche ausgeliefert wird, entscheidet middleware.js nach dem Stand in
// Heart - mit derselben Regel wie hier (fassungAusSetet).

import { ACNE_FASSUNGEN, setetOderStandard, aktiveSetet, setPreis } from "./lifeskin-shop-sets.js";
import { preisFuer } from "./lifeskin-preise.js";

// 2 oder 3: das erste aktive Akne-Set (wie shop.js acneDuoSets).
export function fassungAusSetet(setDok) {
  const erlaubt = ACNE_FASSUNGEN[3].produkte;
  const set = aktiveSetet(setetOderStandard(setDok)).find((s) => s.produkte.includes("lf-acne")
    && s.produkte.includes("lf-moistur") && s.produkte.every((id) => erlaubt.includes(id)));
  return set ? { anzahl: set.produkte.includes("lf-clean") ? 3 : 2, cmimi: setPreis(set) } : null;
}

// Die Preise der Fassung - dieselbe Rechnung wie shop.js #preiseZeigen.
export function fassungPreise(anzahl, cmimi = ACNE_FASSUNGEN[anzahl].cmimi) {
  const vecmas = anzahl * preisFuer(1);
  const zbritje = vecmas > cmimi ? Math.round((1 - cmimi / vecmas) * 100) : 0;
  return { cmimi, vecmas, zbritje };
}

// Aus der 3er-Seite die Seite fuer `anzahl` Produkte: Merkmal am <html>
// und jede Preisstelle (data-preis). Texte und Bilder schaltet das CSS
// ueber das Merkmal (ls-zwei/ls-drei, .nur-drei).
export function shopHtmlFuerFassung(html, anzahl) {
  const { cmimi, vecmas, zbritje } = fassungPreise(anzahl);
  const text = { cmimi: `${cmimi} €`, vecmas: `${vecmas} €`, zbritje: `−${zbritje}%`, "zbritje-fjale": `ZBRITJE −${zbritje} %` };
  const merkmal = html.replace(/(<html\b[^>]*\sdata-set-produkte=")[23](")/, `$1${anzahl}$2`);
  if (merkmal === html && anzahl !== 3) throw new Error("data-set-produkte fehlt im <html> von /lifeskinshop");
  return merkmal.replace(/(<(\w+)\b[^>]*\sdata-preis="(cmimi|vecmas|zbritje|zbritje-fjale)"[^>]*>)[^<]*(<\/\2>)/g,
    (_, auf, _tag, art, zu) => `${auf}${text[art]}${zu}`);
}
