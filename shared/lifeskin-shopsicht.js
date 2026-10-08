// WIE WEIT IM LADEN GESCROLLT WURDE (/lifeskinshop) - Abschnitt fuer
// Abschnitt, von oben nach unten.
//
// Gewuenscht am 29.09. (Inhaber), neu geordnet am 04.10.: In Heart die
// Karte "Shop" Schritt fuer Schritt bis ganz unten, mit kurzen Namen. Die Namen hat er selbst
// vergeben; sie stehen hier, damit Laden (misst) und Heart (zaehlt)
// dieselbe Liste benutzen.
//
// WO ES STEHT: in der Sitzung unter timings.shop, je Abschnitt ein Feld
// (Version 2: je Kennung, siehe unten). timings ist in firestore.rules eine offene Karte - es braucht
// keine neue Regel (wie timings.landing auf /lifeskin,
// shared/lifeskin-landingtiefe.js). Es gibt KEIN Feld "tiefe": Mehrere
// Seitenaufrufe desselben Besuchs schreiben in dieselbe Sitzung, und eine
// Tiefe aus einem spaeteren, kuerzeren Aufruf wuerde die weitere
// ueberschreiben. Die Tiefe liest Heart aus den Feldern (shopTiefe).
//
// Kein Pixel: Hier wird nur in die eigene Sitzung geschrieben.
//
// Ohne Abhaengigkeit von einer App: Der Laden schreibt damit, Heart liest
// damit.

// Die Analyseseite (TERAPIA_ABSCHNITTE unten) schreibt weiter Version 1.
export const SHOP_SICHT_VERSION = 1;

// VERSION 2 (04.10., Inhaber): acht Abschnitte in der Reihenfolge der
// Seite, mit neuen Namen. "Dërgesa" und "Fundi" zaehlen nicht mehr,
// "Mesazhe" und "Garancioni" stehen jetzt fuer sich.
//
// GESPEICHERT UNTER DER KENNUNG (id), NICHT UNTER DER NUMMER: Version 1
// schrieb s1 ... s9 mit anderer Bedeutung (s3 war "Informata", heute ist
// 3 "Mesazhe"). Ein Besuch, der eine alte und eine neue Fassung der Seite
// sah, schreibt in dieselbe Karte - mit Nummern waere nicht mehr zu
// sagen, was gemeint war. Die alten Felder liest shopTiefe() um (V1_NACH_V2).
export const SHOP_LADEN_VERSION = 3;

// wahl: wo der Abschnitt auf der Seite steht (apps/lifeskin-shop/index.html).
export const SHOP_ABSCHNITTE = Object.freeze([
  { nr: 1, id: "pucrrat", wahl: "main > .hero", name: "Puçrrat" },
  { nr: 2, id: "paraPas", wahl: "#rezultate", name: "Para - Pas" },
  { nr: 3, id: "mesazhe", wahl: "#klientet", name: "Mesazhe" },
  { nr: 4, id: "produkte", wahl: "#setet", name: "Dy produkte" },
  // VERSION 3 (08.10., Inhaber): Garantie und F.A.Q stehen direkt unter
  // den zwei Produkten, SkinReact danach. Besuche der Version 2 rechnet
  // shopTiefe() auf diese Reihenfolge um (V2_NACH_V3).
  { nr: 5, id: "garancia", wahl: "#garancia", name: "Garancioni" },
  { nr: 6, id: "faq", wahl: "main > .faq", name: "F.A.Q" },
  { nr: 7, id: "skinreact", wahl: "#zgjedhja", name: "SkinReact" }
].map((a) => Object.freeze(a)));
// Version 2 stand: ... 4 Dy produkte, 5 SkinReact, 6 Garancioni, 7 F.A.Q.
// "Bis hierher" in der neuen Reihenfolge: Wer frueher bis SkinReact kam,
// hatte Garantie und F.A.Q noch nicht gesehen (4); bis Garancioni = ohne
// F.A.Q (5); bis F.A.Q = alles (7).
const V2_TIEFE = Object.freeze({ pucrrat: 1, paraPas: 2, mesazhe: 3, produkte: 4, skinreact: 5, garancia: 6, faq: 7 });
const V2_NACH_V3 = Object.freeze({ 1: 1, 2: 2, 3: 3, 4: 4, 5: 4, 6: 5, 7: 7 });

// Version 1 (s1 ... s9) in die Nummern von heute. Alt 6 ("Dërgesa",
// #rutina) traegt die Garantie in sich, alt 9 ("Fundi") liegt unter der
// F.A.Q - wer dort war, war an ihr vorbei.
const V1_NACH_V2 = Object.freeze({ 1: 1, 2: 2, 3: 4, 4: 5, 5: 3, 6: 6, 7: 6, 8: 7, 9: 7 });

// Die Felder, die ein neu gesehener Abschnitt schreibt.
export function shopSichtPatch(nr) {
  const a = SHOP_ABSCHNITTE.find((x) => x.nr === Number(nr));
  return a ? { v: SHOP_LADEN_VERSION, [a.id]: true } : null;
}

// "Fillo skanimin" im Abschnitt SkinReact gedrueckt: Der Knopf schreibt
// source.scanWorkflow = "skinreact" (lifeskin-session.js
// skinreactMarkieren) - auch wer danach die Kamera nicht freigibt.
export function skanimGedrueckt(sitzung) {
  return sitzung?.source?.scanWorkflow === "skinreact";
}

// Wie weit dieser Besuch gekommen ist: der tiefste gesehene Abschnitt
// (1 ... 7). Wer die Seite geoeffnet hat, stand mindestens bei 1.
//
// BESUCHE VON VOR DER MESSUNG haben kein timings.shop. Fuer sie gilt, was
// es schon gab: produkteGesehen (der Set-Abschnitt stand im Bild oder die
// Set-Details waren offen) heisst mindestens 4 ("Dy produkte").
export function shopTiefe(sitzung) {
  const sicht = sitzung?.timings?.shop;
  if (!sicht || typeof sicht !== "object") return sitzung?.produkteGesehen === true ? 4 : 1;
  // Version 1 und 2: erst in der alten Reihenfolge (2), dann umgerechnet.
  if (sicht.v !== SHOP_LADEN_VERSION) {
    let alt = 1;
    for (const [id, nr] of Object.entries(V2_TIEFE)) if (sicht[id] === true) alt = Math.max(alt, nr);
    if (sicht.instagram === true) alt = Math.max(alt, 6);
    for (const [v1, v2] of Object.entries(V1_NACH_V2)) if (sicht[`s${v1}`] === true) alt = Math.max(alt, v2);
    return V2_NACH_V3[alt];
  }
  let tiefe = 1;
  for (const a of SHOP_ABSCHNITTE) if (sicht[a.id] === true) tiefe = Math.max(tiefe, a.nr);
  return tiefe;
}

// DIE ANALYSESEITE IM LADEN (/terapia/<id>?weg=lifeskinshop) - fuer den
// Chip "Analyse" in Heart (29.09.). Neun Punkte in der Reihenfolge, in der
// sie im Kleid des Ladens stehen (gemessen im Pruefstand): oben die
// Prozentzahl, unten Teilen und Instagram als "Fundi". Zwei Abschnitte
// sagen dasselbe ("Nuk mbeteni vetëm": #ndjekja oder #ditet, je nach Fall) -
// einer von beiden zaehlt als Punkt 4.
//
// Unter timings.terapia, je Punkt ein Feld (s1 ... s9), wie timings.shop.
export const TERAPIA_ABSCHNITTE = Object.freeze([
  { nr: 1, wahl: "#terapia", name: "Përputhja" },
  { nr: 2, wahl: "#pse", name: "Gjetjet" },
  { nr: 3, wahl: "#merrni", name: "Pakoja" },
  { nr: 4, wahl: "#ndjekja, #ditet", name: "Ndjekja" },
  { nr: 5, wahl: "#rezultate", name: "Para - Pas" },
  { nr: 6, wahl: "#vendimi", name: "Oferta" },
  { nr: 7, wahl: "#pyetjet", name: "F.A.Q" },
  { nr: 8, wahl: "#analiza", name: "Detajet" },
  { nr: 9, wahl: "#ndaje, #instagram", name: "Fundi" }
].map((a) => Object.freeze(a)));

export function terapiaSichtPatch(nr) {
  const n = Number(nr);
  if (!Number.isInteger(n) || n < 1 || n > TERAPIA_ABSCHNITTE.length) return null;
  return { v: SHOP_SICHT_VERSION, [`s${n}`]: true };
}

// Wie weit die Analyseseite gelesen wurde: 0 = nie geoeffnet, 1 ... 9.
// Besuche von vor der Messung: die Lesemarken, die es schon gab
// (berichtGeoeffnet = 1, sahSchnitt #pse = 2, sahTherapie #merrni = 3).
export function terapiaTiefe(sitzung) {
  const sicht = sitzung?.timings?.terapia;
  let tiefe = 0;
  if (sicht && typeof sicht === "object") {
    for (const a of TERAPIA_ABSCHNITTE) if (sicht[`s${a.nr}`] === true) tiefe = Math.max(tiefe, a.nr);
  }
  if (sitzung?.sahTherapie === true) tiefe = Math.max(tiefe, 3);
  else if (sitzung?.sahSchnitt === true) tiefe = Math.max(tiefe, 2);
  if (sitzung?.berichtGeoeffnet === true) tiefe = Math.max(tiefe, 1);
  return tiefe;
}
