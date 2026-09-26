// DIE GARANTIE - EIN WORTLAUT FUER LANDING, THERAPIESEITE UND KASSE.
//
// Auftrag vom 26.09., Punkt 10: Die kurze Aussage darf keinen anderen
// Ablauf versprechen als die ausfuehrlichen Bedingungen. Auf der
// Landingpage steht seit jeher "erst sehen wir, wie die Haut reagiert, und
// passen die Routine an; hilft auch das nicht, gibt es das Geld zurueck".
// Die Therapieseite sagte dagegen "45 ditë – ose ju kthejmë paratë" und
// die Frage darunter "na shkruani dhe ju kthejmë shumën" - das klingt
// nach Geld sofort, und genau das ist nicht der Ablauf.
//
// Deshalb EINE Quelle, und die Landingpage wird dagegen geprueft
// (tests/lifeskin-garancia.test.mjs). Die Tage kommen aus der
// Konfiguration (STANDARD_KONFIG.rueckgabeTage) - der Aufrufer reicht sie
// herein, damit dieses Modul nichts aus einer App importiert.
//
// Die Frist beginnt an EINEM klaren Tag: dem, an dem das Paket ankommt.

export const GARANCIA_START = "nga dita kur merrni pakon";

export function garancia(tage, { nachnahme = true } = {}) {
  const t = Math.max(0, Math.round(Number(tage) || 0));
  if (!t) return null;
  return Object.freeze({
    tage: t,
    // Fuer Leiste, Kasse und Kacheln: nur die Zahl, kein Ablauf.
    kurz: `${t} ditë garanci`,
    // Die Zusammenfassung - kurz, aber mit demselben Ablauf wie unten.
    permbledhje: `${t} ditë nga marrja e pakos. Së pari e përshtatim rutinën; nëse nuk shihni ndryshim, ju kthejmë paratë.`,
    // Die vollstaendigen Bedingungen.
    kushtet: Object.freeze([
      `Afati është ${t} ditë ${GARANCIA_START}.`,
      "Mjafton një mesazh te ne brenda afatit – pa formularë.",
      "Së pari shohim si ka reaguar lëkura dhe e përshtatim rutinën pa pagesë. Nëse edhe pas kësaj nuk shihni ndryshim, ju kthejmë shumën e paguar.",
      "Garancia mbulon shumën e paguar; nuk është garanci për një rezultat mjekësor.",
      ...(nachnahme ? ["Pagesa bëhet te dera, kur e merrni pakon – sot nuk jepni asnjë kartë."] : [])
    ])
  });
}
