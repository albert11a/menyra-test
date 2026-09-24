// DIE KUNDENBILDER ("Nga klientët tanë") - an EINER Stelle.
//
// Heart zeigt sie im Befund zum Auswaehlen, die Therapieseite zeigt die
// gewaehlten vor dem Preis. Die Bilder liegen fest im Repo; die Texte sind
// Saetze ueber das Produkt, keine erfundenen Zitate.
//
// Im Befund steht reports/{id}.klientet: eine Liste der gewaehlten
// Kennungen. true (die erste Fassung, ein einziger Schalter) heisst: alle.

export const KLIENTET = Object.freeze([
  { id: "klienti-1", bild: "/apps/lifeskin-landing/fotot/klienti-1.jpg", produkt: "Pore Control",
    text: "Për poret e zgjeruara dhe lëkurën që shkëlqen nga yndyra." },
  { id: "klienti-2", bild: "/apps/lifeskin-landing/fotot/klienti-2.jpg", produkt: "Pore Control",
    text: "Me acid lipo-hidroksi (LHA) – pastron poret pa e tharë lëkurën." },
  { id: "klienti-3", bild: "/apps/lifeskin-landing/fotot/klienti-3.jpg", produkt: "Pore Control",
    text: "Hyn në rutinën e mbrëmjes, pas pastrimit të fytyrës." },
  { id: "klienti-4", bild: "/apps/lifeskin-landing/fotot/klienti-4.jpg", produkt: "Pore Control",
    text: "Lëkurë më e lëmuar, pore më pak të dukshme." }
]);

// Welche Bilder ein Befund zeigt, in dieser Reihenfolge. Unbekanntes faellt raus.
export function klientetFuerBericht(wert) {
  if (wert === true) return KLIENTET.map((k) => k.id);
  if (!Array.isArray(wert)) return [];
  const bekannt = new Set(KLIENTET.map((k) => k.id));
  return [...new Set(wert.map(String))].filter((id) => bekannt.has(id));
}
