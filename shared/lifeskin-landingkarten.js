// WIE WEIT AUF DER LANDINGPAGE /lifeskin GESCROLLT WURDE - Karte fuer
// Karte, von oben nach unten (04.10., Wunsch Inhaber).
//
// Die Seite unter /lifeskin (apps/lifeskin-landing/index.html) hat die
// neun Bildschirme von shared/lifeskin-landingtiefe.js nicht mehr - die
// gelten weiter fuer /lifeskin2. Hier stehen ihre acht Karten, mit den
// Namen, die der Inhaber vergeben hat. Dieselbe Liste benutzen die Seite
// (misst) und Heart (zaehlt, Chip "Landing" im Trichter).
//
// WO ES STEHT: in der Sitzung unter timings.lpKarten, je Karte ein Feld
// mit ihrer Kennung (id). timings ist in firestore.rules eine offene Karte
// - es braucht keine neue Regel. Kennungen statt Nummern: Aendert sich
// spaeter die Reihenfolge, bleibt jedes alte Feld eindeutig. Es gibt KEIN
// Feld "tiefe" (wie timings.shop): Die Tiefe liest Heart aus den Feldern.
//
// Kein Pixel: Hier wird nur in die eigene Sitzung geschrieben.
//
// Ohne Abhaengigkeit von einer App: Die Seite schreibt damit, Heart liest
// damit.

export const LANDING_KARTEN_VERSION = 1;

// wahl: wo die Karte auf der Seite steht.
export const LANDING_KARTEN = Object.freeze([
  { nr: 1, id: "analiza", wahl: ".lf-entry-card", name: "Analiza online" },
  { nr: 2, id: "terapi", wahl: ".lf-benefit--therapy", name: "01 Terapi" },
  { nr: 3, id: "analizaDetaj", wahl: ".lf-benefit--analysis", name: "02 Analiza" },
  { nr: 4, id: "skanim", wahl: ".lf-benefit--scan", name: "03 Skanim" },
  { nr: 5, id: "paraPas", wahl: "#rezultatet", name: "Para - Pas" },
  { nr: 6, id: "instagram", wahl: ".lf-community", name: "Instagram" },
  { nr: 7, id: "tashEDin", wahl: ".lf-warm-result", name: "Tash e din" },
  { nr: 8, id: "faq", wahl: ".lf-faq", name: "F.A.Q" }
].map((k) => Object.freeze(k)));

// Die Felder, die eine neu gesehene Karte schreibt.
export function landingKartePatch(nr) {
  const k = LANDING_KARTEN.find((x) => x.nr === Number(nr));
  return k ? { v: LANDING_KARTEN_VERSION, [k.id]: true } : null;
}

// Ob dieser Besuch gemessen ist (mindestens ein Feld steht).
export function landingKartenGemessen(sitzung) {
  const sicht = sitzung?.timings?.lpKarten;
  return Boolean(sicht && typeof sicht === "object" && LANDING_KARTEN.some((k) => sicht[k.id] === true));
}

// Wie weit dieser Besuch gekommen ist: die tiefste gesehene Karte
// (0 = keine gemessen, 1 ... 8).
export function landingKartenTiefe(sitzung) {
  const sicht = sitzung?.timings?.lpKarten;
  if (!sicht || typeof sicht !== "object") return 0;
  let tiefe = 0;
  for (const k of LANDING_KARTEN) if (sicht[k.id] === true) tiefe = Math.max(tiefe, k.nr);
  return tiefe;
}
