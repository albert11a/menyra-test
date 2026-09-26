import test from "node:test";
import assert from "node:assert/strict";

import { Sitzung } from "../apps/lifeskin/lifeskin-session.js";
import { sektorAus, SEKTOREN } from "../apps/lifeskin/lifeskin-pose.js";

// Die drei Aufnahmen entstehen ohne eigene Aufforderung: Der Ring laesst den
// Kopf ohnehin herumgehen, und dabei kommt jede Haltung von selbst vorbei.
// Was hier geprueft wird, ist die Zuordnung - dass "rechts" auch rechts ist.

// Dieselbe Rechnung wie #blickAus im Trichter. Sie steht hier noch einmal,
// weil private Methoden von aussen nicht erreichbar sind; die Zahlen kommen
// aus derselben Quelle wie dort.
const FOTO_BLICKE = [
  { blick: "rechts", winkel: Math.PI / 2 },
  { blick: "links", winkel: (Math.PI * 3) / 2 },
  // Null steht oben - und diese Richtung steht zuletzt, damit ein schraeg
  // nach oben gedrehter Kopf als Seitenansicht zaehlt.
  { blick: "oben", winkel: 0 }
];
const FOTO_TOLERANZ = Math.PI / 4;

function blickAusWinkel(winkel) {
  for (const ziel of FOTO_BLICKE) {
    let abstand = Math.abs(winkel - ziel.winkel) % (Math.PI * 2);
    if (abstand > Math.PI) abstand = Math.PI * 2 - abstand;
    if (abstand <= FOTO_TOLERANZ) return { blick: ziel.blick, abweichung: abstand };
  }
  return null;
}

// Null steht oben, gezaehlt wird im Uhrzeigersinn - x nach rechts, y nach
// unten, wie im Bild. Das Vorzeichen kommt aus der Nasenlage und ist damit
// nachpruefbar und keine Konvention.
test("die Nase rechts im Bild heisst 'rechts'", () => {
  const { winkel } = sektorAus(1, 0, SEKTOREN);
  assert.equal(blickAusWinkel(winkel)?.blick, "rechts");
});

test("die Nase links im Bild heisst 'links'", () => {
  const { winkel } = sektorAus(-1, 0, SEKTOREN);
  assert.equal(blickAusWinkel(winkel)?.blick, "links");
});

test("die Nase oben im Bild heisst 'oben'", () => {
  assert.equal(blickAusWinkel(sektorAus(0, -1, SEKTOREN).winkel)?.blick, "oben");
});

test("nach unten ergibt kein Foto", () => {
  // Von unten sieht man Nasenloecher und Kinn - fuer eine Hautbeurteilung
  // ist das die einzige Richtung, die nichts hergibt.
  assert.equal(blickAusWinkel(sektorAus(0, 1, SEKTOREN).winkel), null, "unten");
});

test("schraeg zaehlt noch, sehr schraeg nicht mehr", () => {
  // 45 Grad schraeg nach rechts oben: liegt genau am Rand und zaehlt.
  assert.equal(blickAusWinkel(sektorAus(1, -1, SEKTOREN).winkel)?.blick, "rechts");
  assert.equal(blickAusWinkel(sektorAus(1, 1, SEKTOREN).winkel)?.blick, "rechts");
  // Ein Kopf, der nach oben zeigt und dabei leicht nach rechts: Das ist
  // die Aufsicht und nicht die Seitenansicht - er liegt naeher an "oben".
  assert.equal(blickAusWinkel(sektorAus(0.2, -1, SEKTOREN).winkel)?.blick, "oben");
});

test("naeher am Ideal gewinnt", () => {
  const gerade = blickAusWinkel(sektorAus(1, 0, SEKTOREN).winkel);
  const schraeg = blickAusWinkel(sektorAus(1, -1, SEKTOREN).winkel);
  assert.ok(gerade.abweichung < schraeg.abweichung,
    "Eine waagerechte Drehung muss eine schraege schlagen");
});

// Die Fotos gehen in eine Untersammlung, nicht in die Sitzung selbst.
// Laegen sie darin, zoege jeder Aufruf des Lifeskin-Reiters in Heart alle
// Bilder aller Sitzungen mit.
test("jedes Foto geht als eigenes Dokument unter die Sitzung", async () => {
  const rufe = [];
  const sitzung = new Sitzung({
    fetchFn: async (url, optionen) => { rufe.push({ url, body: JSON.parse(optionen.body) }); return { ok: true }; }
  });
  await sitzung.fotosSpeichern({
    gerade: { jpeg: "data:image/jpeg;base64,AAA", breite: 640, hoehe: 480 },
    rechts: { jpeg: "data:image/jpeg;base64,BBB", breite: 640, hoehe: 480 }
  });

  assert.equal(rufe.length, 2);
  assert.ok(rufe[0].url.includes(`/sessions/${sitzung.id}/photos/gerade`), rufe[0].url);
  assert.ok(rufe[1].url.includes(`/sessions/${sitzung.id}/photos/rechts`), rufe[1].url);
  assert.equal(rufe[0].body.fields.blick.stringValue, "gerade");
  assert.equal(rufe[0].body.fields.jpeg.stringValue, "data:image/jpeg;base64,AAA");
  // Firestore nimmt ganze Zahlen als Zeichenkette entgegen - das ist sein
  // Format, kein Fehler.
  const breite = rufe[0].body.fields.breite;
  assert.equal(Number(breite.integerValue ?? breite.doubleValue), 640);
});

test("ein Foto ohne Bild wird nicht geschickt", async () => {
  const rufe = [];
  const sitzung = new Sitzung({ fetchFn: async () => { rufe.push(1); return { ok: true }; } });
  await sitzung.fotosSpeichern({ gerade: { jpeg: "" }, links: null });
  assert.equal(rufe.length, 0);
});

// Der teuerste denkbare Fehler waere eine Bestellung, die daran scheitert,
// dass ein Foto nicht durchkam.
test("ein gescheitertes Foto haelt die Sitzung nicht an", async () => {
  const sitzung = new Sitzung({ fetchFn: async () => ({ ok: false, status: 403 }) });
  await assert.doesNotReject(() => sitzung.fotosSpeichern({
    gerade: { jpeg: "data:image/jpeg;base64,AAA", breite: 1, hoehe: 1 }
  }));
  await sitzung.starte({ sprache: "sq" });
  assert.equal(sitzung.stand.step, "opened");
});

// ---------- Auflösung ----------
//
// Die Kamera wird mit 1440 Bildpunkten angefordert, weil erst dort feine
// Linien und Poren ueberhaupt im Bild sind. Die erste Fassung rechnete die
// Fotos auf 640 herunter und warf damit genau das wieder weg. Jetzt wird
// die volle Aufloesung behalten und stattdessen die Qualitaet so gewaehlt,
// dass das Bild noch in ein Firestore-Dokument passt.

const { besteGuete } = await import("../apps/lifeskin/lifeskin-app.js");

// Ein Kodierer, dessen Ergebnis mit der Qualitaet waechst - so wie ein
// echtes JPEG.
function kodierer(zeichenBeiVoll = 400000) {
  return (guete) => "d".repeat(Math.round(zeichenBeiVoll * guete));
}

test("die hoechste Qualitaet gewinnt, wenn sie ins Ziel passt", () => {
  const treffer = besteGuete(kodierer(300000));
  assert.equal(treffer.guete, 0.86);
  assert.ok(treffer.jpeg.length <= 280000);
});

test("ist das Bild zu gross, wird eine Stufe tiefer genommen - nicht mehr", () => {
  // Bei voller Qualitaet 340.000 Zeichen: 0,86 ergaebe 292.400 und liegt
  // ueber dem Ziel, 0,8 ergibt 272.000 und passt. Genau eine Stufe tiefer.
  const treffer = besteGuete(kodierer(340000));
  assert.equal(treffer.guete, 0.8);
  assert.ok(treffer.jpeg.length <= 280000);
});

test("passt keine Stufe, wird nichts zurueckgegeben statt etwas Kaputtes", () => {
  assert.equal(besteGuete(kodierer(5000000)), null);
});

// ZWEI GRENZEN, ZWEI REGELN - und beide muessen zu ihrem Kodierer passen.
//
// Der Test las die erste Zahl, die er in den Regeln fand. Das ging gut,
// solange es eine gab. Seit die Warteseite Miniaturen zeigt, stehen dort
// zwei - die der Fotos (900.000, in der Sitzung) und die der Miniaturen
// (60.000, neben dem Bericht) -, und die erste Zahl war auf einmal die
// falsche: Der Test verglich den Kodierer der vollen Aufnahme mit der
// Grenze der Miniatur und schlug fehl, obwohl nichts kaputt war.
//
// Jetzt wird jede Grenze an IHRER Regel gesucht und gegen IHREN Kodierer
// gehalten. Eine dritte Grenze faellt damit auf, statt still die erste zu
// verdecken.
function grenzeAus(regeln, funktion) {
  const anfang = regeln.indexOf(`function ${funktion}()`);
  assert.ok(anfang >= 0, `${funktion} steht nicht in firestore.rules`);
  const treffer = regeln.slice(anfang).match(/data\.jpeg\.size\(\) <= (\d+)/);
  assert.ok(treffer, `Groessengrenze in ${funktion} nicht gefunden`);
  return Number(treffer[1]);
}

test("die Grenze liegt unter dem, was Firestore annimmt", async () => {
  const { readFileSync } = await import("node:fs");
  const regeln = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
  const inDenRegeln = grenzeAus(regeln, "lifeskinFotoOk");

  // Der Trichter darf nie etwas schicken, das die Regeln abweisen - sonst
  // faellt genau das Foto aus, das am meisten zeigt.
  const gerade = besteGuete(kodierer(900000));
  assert.ok(gerade.jpeg.length <= inDenRegeln,
    `Der Trichter erlaubt bis 900000, die Regeln nur ${inDenRegeln}`);
  // Und ein Firestore-Dokument darf 1 MiB - dazwischen muss Luft sein.
  assert.ok(inDenRegeln < 1048576 - 100000,
    "Zu wenig Abstand zur Dokumentgrenze von Firestore");
});

test("die Miniatur bleibt unter ihrer eigenen, viel engeren Grenze", async () => {
  const { readFileSync } = await import("node:fs");
  const regeln = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
  const app = readFileSync(new URL("../apps/lifeskin/lifeskin-app.js", import.meta.url), "utf8");

  const inDenRegeln = grenzeAus(regeln, "lifeskinMiniaturOk");
  const imTrichter = Number(app.match(/const MINI_HOECHSTZEICHEN = (\d+)/)?.[1]);
  assert.ok(Number.isFinite(imTrichter), "MINI_HOECHSTZEICHEN steht nicht im Trichter");
  assert.ok(imTrichter <= inDenRegeln,
    `Der Trichter erlaubt bis ${imTrichter}, die Regeln nur ${inDenRegeln}`);

  // UND SIE MUSS DEUTLICH ENGER SEIN ALS DIE DER FOTOS. Das ist der ganze
  // Grund, warum es zwei Grenzen gibt: Die Miniaturen liegen neben dem
  // Bericht und sind damit oeffentlich lesbar. Waere die Grenze dort
  // dieselbe, koennte an dieser Stelle ein Bild in voller Aufloesung
  // landen - nur eben dort, wo jeder es liest, der den Link bekommt.
  assert.ok(inDenRegeln * 4 < grenzeAus(regeln, "lifeskinFotoOk"),
    "Die oeffentliche Grenze naehert sich der der vollen Aufnahmen");

  // Der Kodierer haelt sie ein: 160 Punkte breit, kraeftig komprimiert.
  const stufen = app.match(/const MINI_STUFEN = Object\.freeze\(\[([\d., ]+)\]\)/)?.[1];
  assert.ok(stufen, "MINI_STUFEN steht nicht im Trichter");
  const kleinste = Math.min(...stufen.split(",").map(Number));
  assert.ok(kleinste <= 0.5,
    "Ohne eine wirklich niedrige Stufe faellt die Miniatur bei unruhigen Bildern aus");
});
