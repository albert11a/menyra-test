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
  { blick: "links", winkel: (Math.PI * 3) / 2 }
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

test("nach oben und nach unten ergeben kein Foto", () => {
  assert.equal(blickAusWinkel(sektorAus(0, -1, SEKTOREN).winkel), null, "oben");
  assert.equal(blickAusWinkel(sektorAus(0, 1, SEKTOREN).winkel), null, "unten");
});

test("schraeg zaehlt noch, sehr schraeg nicht mehr", () => {
  // 45 Grad schraeg nach rechts oben: liegt genau am Rand und zaehlt.
  assert.equal(blickAusWinkel(sektorAus(1, -1, SEKTOREN).winkel)?.blick, "rechts");
  assert.equal(blickAusWinkel(sektorAus(1, 1, SEKTOREN).winkel)?.blick, "rechts");
  // Ein Kopf, der fast geradeaus zeigt, aber leicht nach rechts: zaehlt nicht,
  // weil er naeher an "oben" liegt als an "rechts".
  assert.equal(blickAusWinkel(sektorAus(0.2, -1, SEKTOREN).winkel), null);
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

test("die hoechste Qualitaet gewinnt, wenn sie passt", () => {
  const treffer = besteGuete(kodierer(300000));
  assert.equal(treffer.guete, 0.94);
});

test("ist das Bild zu gross, wird eine Stufe tiefer genommen - nicht mehr", () => {
  // Bei voller Qualitaet 1.000.000 Zeichen: 0,94 ergaebe 940.000 und ist zu
  // gross, 0,88 ergibt 880.000 und passt. Genau eine Stufe tiefer.
  const treffer = besteGuete(kodierer(1000000));
  assert.equal(treffer.guete, 0.88);
  assert.ok(treffer.jpeg.length <= 900000);
});

test("passt keine Stufe, wird nichts zurueckgegeben statt etwas Kaputtes", () => {
  assert.equal(besteGuete(kodierer(5000000)), null);
});

test("die Grenze liegt unter dem, was Firestore annimmt", async () => {
  const { readFileSync } = await import("node:fs");
  const regeln = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
  const treffer = regeln.match(/data\.jpeg\.size\(\) <= (\d+)/);
  assert.ok(treffer, "Groessengrenze in firestore.rules nicht gefunden");
  const inDenRegeln = Number(treffer[1]);

  // Der Trichter darf nie etwas schicken, das die Regeln abweisen - sonst
  // faellt genau das Foto aus, das am meisten zeigt.
  const gerade = besteGuete(kodierer(900000));
  assert.ok(gerade.jpeg.length <= inDenRegeln,
    `Der Trichter erlaubt bis 900000, die Regeln nur ${inDenRegeln}`);
  // Und ein Firestore-Dokument darf 1 MiB - dazwischen muss Luft sein.
  assert.ok(inDenRegeln < 1048576 - 100000,
    "Zu wenig Abstand zur Dokumentgrenze von Firestore");
});
