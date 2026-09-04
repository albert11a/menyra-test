import test from "node:test";
import assert from "node:assert/strict";

import { messbareWerte, AUFLOESUNG_NOETIG_MM, fasseAufnahmenZusammen, streuungUeberAufnahmen, ZONEN }
  from "../apps/lifeskin/lifeskin-metrics.js";
import { bildGuete, rechteckUmriss, SCHAERFE_GUT } from "../apps/lifeskin/lifeskin-haut.js";
import { bewerteBefunde, erstelleBefund, findeSchwerpunkt, STREUUNG_GRENZE } from "../apps/lifeskin/lifeskin-rules.js";
import { istHaut } from "../apps/lifeskin/lifeskin-face.js";

const BREITE = 120, HOEHE = 120;

function flaeche({ grund = [200, 150, 130], rauschen = 0, hell = null, dunkel = null } = {}) {
  const data = new Uint8ClampedArray(BREITE * HOEHE * 4);
  for (let y = 0; y < HOEHE; y += 1) {
    for (let x = 0; x < BREITE; x += 1) {
      const q = (y * BREITE + x) * 4;
      const n = rauschen ? ((x * 7 + y * 13) % 2 ? rauschen : -rauschen) : 0;
      data[q] = grund[0] + n; data[q + 1] = grund[1] + n; data[q + 2] = grund[2] + n; data[q + 3] = 255;
    }
  }
  const setze = (anteil, farbe) => {
    const bis = Math.round(HOEHE * anteil);
    for (let y = 0; y < bis; y += 1) for (let x = 0; x < BREITE; x += 1) {
      const q = (y * BREITE + x) * 4;
      data[q] = farbe; data[q + 1] = farbe; data[q + 2] = farbe;
    }
  };
  if (hell) setze(hell, 255);
  if (dunkel) setze(dunkel, 0);
  return { data, width: BREITE, height: HOEHE };
}

const GANZ = rechteckUmriss({ x: 2, y: 2, w: BREITE - 4, h: HOEHE - 4 });

test("was das Bild nicht hergibt, gilt als nicht messbar", () => {
  // Die unbequemste Tabelle des Projekts. Nach Nyquist braucht eine Struktur
  // der Groesse d eine Abtastung von hoechstens d/2 - darunter ist sie nicht
  // unscharf, sondern NICHT DA.
  const grob = messbareWerte(0.34);        // 720p, Gesicht fuellt den Kreis
  assert.ok(grob.roetung && grob.pigment, "Flaechiges geht auch grob");
  assert.ok(!grob.linien && !grob.poren, "Linien und Poren gehen bei 0,34 mm/px nicht");

  const fein = messbareWerte(0.17);        // 1440p
  assert.ok(fein.linien && fein.poren, "Bei 0,17 mm/px liegt beides im messbaren Bereich");

  // Ohne Massstab - der Rueckfallweg ohne Gesichtsnetz - gilt nur das
  // Flaechige: Ohne Pupillenabstand weiss niemand, wie gross ein Millimeter
  // im Bild ist.
  const ohne = messbareWerte(null);
  assert.ok(ohne.roetung && ohne.glanz);
  assert.ok(!ohne.pigment && !ohne.linien && !ohne.poren);

  for (const [wert, mm] of Object.entries(AUFLOESUNG_NOETIG_MM)) {
    assert.ok(mm > 0 && mm <= 2.5, `${wert} hat eine unplausible Grenze`);
  }
});

test("ein verwackeltes Bild wiegt weniger als ein scharfes", () => {
  const scharf = bildGuete(flaeche({ rauschen: 6 }), GANZ, { istHaut });
  const flau = bildGuete(flaeche({ rauschen: 0 }), GANZ, { istHaut });
  assert.ok(scharf.schaerfe > flau.schaerfe, "Struktur muss sich in der Schaerfe zeigen");
  assert.ok(scharf.gewicht > flau.gewicht);
  assert.ok(scharf.gewicht <= 1 && flau.gewicht >= 0);
});

test("ausgebrannte und abgesoffene Flaeche druecken das Gewicht", () => {
  const gut = bildGuete(flaeche({ rauschen: 6 }), GANZ, { istHaut });
  const ueberbelichtet = bildGuete(flaeche({ rauschen: 6, hell: 0.5 }), GANZ, { istHaut });
  assert.ok(ueberbelichtet.verloren > 0.3, "Die Haelfte weiss muss als verloren gelten");
  assert.ok(ueberbelichtet.gewicht < gut.gewicht);

  const zuDunkel = bildGuete(flaeche({ rauschen: 6, dunkel: 0.5 }), GANZ, { istHaut });
  assert.ok(zuDunkel.gewicht < gut.gewicht);
});

test("ohne genug Hautpunkte gibt es kein Gewicht statt eines schlechten", () => {
  const wand = bildGuete(flaeche({ grund: [130, 133, 138] }), GANZ, { istHaut });
  assert.equal(wand.gewicht, 0);
  assert.ok(SCHAERFE_GUT > 0);
});

test("das Gewicht verschiebt den Median zur besseren Aufnahme", () => {
  const mach = (glanz) => Object.fromEntries(ZONEN.map((z) => [z, { glanz, roetung: 10, poren: 0.02 }]));
  const messungen = [mach(0.10), mach(0.20), mach(0.90)];

  const ohne = fasseAufnahmenZusammen(messungen);
  assert.equal(ohne.stirn.glanz, 0.20, "Ungewichtet steht der mittlere Wert");

  // Die dritte Aufnahme war verwackelt und wiegt fast nichts.
  const mit = fasseAufnahmenZusammen(messungen, { gewichte: [1, 1, 0.05] });
  assert.ok(mit.stirn.glanz <= 0.20, "Gewichtet darf die schlechte Aufnahme nicht bestimmen");
});

test("eine Aufnahme ohne Gewicht faellt ganz heraus", () => {
  const mach = (glanz) => Object.fromEntries(ZONEN.map((z) => [z, { glanz }]));
  const nur = fasseAufnahmenZusammen([mach(0.1), mach(0.9)], { gewichte: [1, 0] });
  assert.equal(nur.stirn.glanz, 0.1);
  assert.equal(fasseAufnahmenZusammen([mach(0.1)], { gewichte: [0] }), null);
});

test("die Streuung sagt, ob man dem Median glauben darf", () => {
  const mach = (roetung) => Object.fromEntries(ZONEN.map((z) => [z, { roetung }]));

  const einig = streuungUeberAufnahmen([mach(10), mach(10.2), mach(9.9)]);
  assert.ok(einig.stirn.roetung < 0.1, "Drei einige Aufnahmen streuen kaum");

  const uneinig = streuungUeberAufnahmen([mach(4), mach(10), mach(22)]);
  assert.ok(uneinig.stirn.roetung > STREUUNG_GRENZE, "Diese drei sagen nichts aus");

  // Eine einzige Aufnahme hat keine Streuung - und darf keine erfinden.
  assert.equal(streuungUeberAufnahmen([mach(10)]).stirn, null);
});

test("'nicht gemessen' ist nicht 'unauffaellig'", () => {
  // Die gefaehrlichste Verwechslung im ganzen Verfahren. Frueher ergab ein
  // fehlender Wert Stufe null, und der Kunde las "Ihre Poren sind in
  // Ordnung" ueber eine Aufnahme, in der Poren gar nicht aufloesbar waren.
  const messung = Object.fromEntries(ZONEN.map((z) => [z, {
    roetung: 20, trockenheit: 1, glanz: 0.02, poren: null, pigment: 0.01, linien: null, textur: 1.0
  }]));
  const befunde = bewerteBefunde(messung, "25-34");

  const poren = befunde.find((b) => b.id === "poren");
  assert.equal(poren.messbar, false, "Poren wurden nicht gemessen");
  assert.equal(poren.wert, null);

  const roetung = befunde.find((b) => b.id === "roetung");
  assert.equal(roetung.messbar, true);
  assert.ok(roetung.stufe > 0, "Was gemessen wurde, bekommt seine Stufe");
});

test("uneinige Aufnahmen ergeben keinen Befund statt eines falschen", () => {
  const messung = Object.fromEntries(ZONEN.map((z) => [z, { roetung: 20, glanz: 0.2 }]));
  const streuung = Object.fromEntries(ZONEN.map((z) => [z, { roetung: STREUUNG_GRENZE + 0.4, glanz: 0.05 }]));
  const befunde = bewerteBefunde(messung, "25-34", { streuung });

  const roetung = befunde.find((b) => b.id === "roetung");
  assert.equal(roetung.sicher, false);
  assert.equal(roetung.stufe, 0, "Ein unsicherer Wert bekommt keine Stufe");

  const glanz = befunde.find((b) => b.id === "glanz");
  assert.equal(glanz.sicher, true);
});

test("weder gelobt noch angezeigt wird, was nicht gemessen wurde", () => {
  const messung = Object.fromEntries(ZONEN.map((z) => [z, {
    roetung: 5, trockenheit: 0.5, glanz: 0.01, poren: null, pigment: 0.01, linien: null, textur: 0.5
  }]));
  const befund = erstelleBefund({ messung, verhaeltnisse: {}, altersgruppe: "25-34", produkte: [] });

  assert.ok(!befund.hauptbefunde.some((b) => !b.messbar));
  assert.ok(befund.nichtGemessen.includes("poren"), "Poren gehoeren in den Bericht");
  assert.ok(befund.nichtGemessen.includes("linien"));
  if (befund.positives) {
    assert.ok(befund.positives.messbar, "Gelobt wird nur, was gemessen wurde");
    assert.ok(!["poren", "linien"].includes(befund.positives.id));
  }
});

test("auch bei ruhiger Haut gibt es einen Punkt, der am staerksten hervortritt", () => {
  // Ohne ihn endet eine ruhige Messung mit viermal "unauffaellig" - und
  // darauf kauft niemand etwas. Er ist keine erfundene Diagnose: Von vier
  // Werten ist immer einer der hoechste, und das ist zu sagen erlaubt.
  const messung = Object.fromEntries(ZONEN.map((z) => [z, {
    roetung: 9.0, textur: 0.9, glanz: 0.030, poren: 0.020, pigment: 0.050, linien: 6.0
  }]));
  const befunde = bewerteBefunde(messung, "25-34");
  assert.ok(befunde.every((b) => b.stufe === 0), "Diese Haut ist durchweg unauffaellig");

  const sp = findeSchwerpunkt(befunde);
  assert.ok(sp, "Trotzdem muss es einen Schwerpunkt geben");
  assert.equal(sp.id, "pigment", `Pigment steht bei 0,050 von 0,055 am naechsten an der Schwelle, nicht ${sp.id}`);
  assert.ok(sp.ausschoepfung > 0.8);
});

test("der Schwerpunkt kommt nie aus einem Wert, den niemand gesehen hat", () => {
  const messung = Object.fromEntries(ZONEN.map((z) => [z, {
    roetung: 6.0, textur: 0.5, glanz: 0.01, poren: null, pigment: 0.01, linien: null
  }]));
  const streuung = Object.fromEntries(ZONEN.map((z) => [z, { roetung: STREUUNG_GRENZE + 0.3 }]));
  const sp = findeSchwerpunkt(bewerteBefunde(messung, "25-34", { streuung }));
  assert.ok(!sp || (sp.messbar && sp.sicher));
  assert.ok(!sp || !["poren", "linien", "roetung"].includes(sp.id));
});

test("gelobt und hervorgehoben wird nie derselbe Punkt", () => {
  // Erst loben und dann darauf zeigen liest sich wie ein Widerspruch.
  const messung = Object.fromEntries(ZONEN.map((z) => [z, {
    roetung: 9.0, textur: 0.9, glanz: 0.030, poren: 0.020, pigment: 0.050, linien: 6.0
  }]));
  const befund = erstelleBefund({ messung, verhaeltnisse: {}, altersgruppe: "25-34", produkte: [] });
  assert.ok(befund.schwerpunkt, "Der Schwerpunkt gehoert in den Befund");
  if (befund.positives) assert.notEqual(befund.positives.id, befund.schwerpunkt.id);
});
