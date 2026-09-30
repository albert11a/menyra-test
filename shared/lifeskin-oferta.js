// DAS ANGEBOT IM LADEN (/lifeskinshop) UND AUF SEINER THERAPIESEITE.
//
// Ein Schalter fuer beide Seiten (30.09., Inhaber):
//   PAK_SETE  "Vetëm edhe pak sete" - Aussage des Inhabers ueber seinen
//             Bestand. Sobald wieder genug da ist: auf false setzen.
// Der Rabatt ist keine Behauptung, sondern gerechnet: Setpreis gegen die
// Summe der Einzelpreise (shared/lifeskin-preise.js).

export const PAK_SETE = true;

export function zbritjaPerqind(cmimi, vecmas) {
  const c = Number(cmimi), v = Number(vecmas);
  return v > c && c > 0 ? Math.round((1 - c / v) * 100) : 0;
}
