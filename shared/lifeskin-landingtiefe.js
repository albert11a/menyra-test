// WAS AUF DER LANDINGPAGE GESEHEN WURDE - bevor jemand zur Mënyra ging.
//
// Die Landingpage (/lifeskin) hat neun Bildschirme. Je Besuch wird
// festgehalten, welche davon wirklich im Bild standen, und - beim ersten
// Tipp auf einen Startknopf - ob er vorher gelesen hat:
//
//   direkt   er hat nur Bildschirm 1 gesehen und ist sofort weiter
//            ("Mënyra ohne Scroll")
//   scroll   er hat mindestens einen weiteren Bildschirm gesehen und ist
//            danach weiter ("Mënyra mit Scroll")
//
// Damit laesst sich spaeter sagen, ob Leser oder Direkteinsteiger eher
// bestellen.
//
// WO ES STEHT: in der Sitzung unter timings.landing. timings ist in
// firestore.rules eine offene Karte (wie timings.pfad, der Klickpfad) -
// es braucht keine neue Regel, und nichts muss zuerst ausgespielt werden.
// Je Bildschirm ein eigenes Feld (s1 ... s9): So laesst sich jeder einzeln
// ergaenzen, ohne vorher zu lesen, und zwei Schreibvorgaenge ueberschreiben
// sich nie gegenseitig.
//
// Ohne Abhaengigkeit: Der Trichter (lifeskin-app.js) schreibt damit, Heart
// liest damit - dieselben Namen, dieselbe Regel.

export const LANDING_SCHIRME = Object.freeze([
  { nr: 1, id: "held", label: "Keni provuar shumë produkte" },
  { nr: 2, id: "rezultatet", label: "Raste reale · para dhe pas" },
  { nr: 3, id: "pse", label: "Si funksionon" },
  { nr: 4, id: "produktet", label: "Produktet LifeSkin" },
  { nr: 5, id: "menyrat", label: "Hapi i parë · zgjedhja" },
  { nr: 6, id: "mjekja", label: "Ekspertiza" },
  { nr: 7, id: "komuniteti", label: "Komuniteti" },
  { nr: 8, id: "garancia", label: "Pyetjet" },
  { nr: 9, id: "fund", label: "Hapi i parë është falas" }
].map((s) => Object.freeze(s)));

// VERSION 2 (28.09.): Die Faelle stehen jetzt gleich unter dem ersten
// Blick, "Si funksionon" danach. Die Nummern folgen der Seite, also
// tauschen 2 und 3. Messungen der Version 1 liest landingLesen() in die
// neuen Nummern um (V1_NACH_V2) - so zaehlt Heart alte und neue Besuche
// in derselben Stufe.
export const LANDING_VERSION = 2;
const V1_NACH_V2 = Object.freeze({ 2: 3, 3: 2 });

// Version 1 in die Nummern von heute. Die Tiefe ist das Hoechste, was
// jemand gesehen hat: Alt 2 (bis "Si funksionon") ist heute 3; alt 3
// (bis zu den Faellen, also auch an "Si funksionon" vorbei) bleibt 3.
function ausV1(roh) {
  const um = (n) => V1_NACH_V2[n] || n;
  const tiefe = (n) => (Number(n) === 2 ? 3 : Number(n) || 0);
  const neu = { ...roh, tiefe: tiefe(roh.tiefe), bisDahin: tiefe(roh.bisDahin), ab: um(Number(roh.ab) || 0) };
  for (const n of [2, 3]) delete neu[`s${n}`];
  for (const n of [2, 3]) if (roh[`s${n}`] === true) neu[`s${um(n)}`] = true;
  return neu;
}

// Gilt ein Bildschirm als gesehen? Er muss wirklich im Bild gestanden
// haben, nicht nur mit einer Kante: mindestens 40 % des Fensters - oder,
// bei einem kurzen Bildschirm, mindestens die Haelfte von ihm selbst.
export function schirmGesehen(sichtbar, hoehe, fenster) {
  const s = Number(sichtbar) || 0;
  const h = Number(hoehe) || 0;
  const f = Number(fenster) || 0;
  if (s <= 0 || h <= 0 || f <= 0) return false;
  return s >= Math.min(f * 0.4, h * 0.5);
}

// Die Felder, die ein neu gesehener Bildschirm schreibt.
export function landingSichtPatch(nr, tiefeBisher = 0) {
  const n = Number(nr);
  if (!Number.isInteger(n) || n < 1 || n > LANDING_SCHIRME.length) return null;
  const daten = { v: LANDING_VERSION, [`s${n}`]: true };
  if (n > tiefeBisher) daten.tiefe = n;
  return daten;
}

// Die Felder beim ersten Tipp auf einen Startknopf.
//   gesehen  die Nummern der bis dahin gesehenen Bildschirme
//   ab       auf welchem Bildschirm der Knopf lag (0 = unbekannt)
export function landingWeiterPatch(gesehen, ab = 0) {
  const nummern = [...new Set([...(gesehen || [])].map(Number))].filter((n) => n >= 1 && n <= LANDING_SCHIRME.length);
  const weg = nummern.some((n) => n > 1) ? "scroll" : "direkt";
  return { v: LANDING_VERSION, weg, ab: Number(ab) || 0, bisDahin: Math.max(1, ...nummern, 0) };
}

// Heart: der Stand einer Sitzung, einheitlich gelesen.
export function landingLesen(sitzung) {
  const roh = sitzung?.timings?.landing;
  if (!roh || typeof roh !== "object" || !Number(roh.v)) {
    return { gemessen: false, gesehen: [], tiefe: 0, weg: "", ab: 0, bisDahin: 0 };
  }
  if (Number(roh.v) === 1) return landingLesen({ timings: { landing: { ...ausV1(roh), v: LANDING_VERSION } } });
  const gesehen = LANDING_SCHIRME.filter((s) => roh[`s${s.nr}`] === true).map((s) => s.nr);
  const tiefe = Math.max(Number(roh.tiefe) || 0, ...gesehen, 0);
  const weg = roh.weg === "scroll" || roh.weg === "direkt" ? roh.weg : "";
  return { gemessen: true, gesehen, tiefe, weg, ab: Number(roh.ab) || 0, bisDahin: Number(roh.bisDahin) || 0 };
}
