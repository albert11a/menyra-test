// Was aus einem Gesichtsfoto an Zahlen herauskommt.
//
// Reine Rechnung: Hinein gehen Bildpunkte und Gesichtspunkte, heraus kommen
// Zahlen. Kein DOM, kein Netz, kein Zufall - deshalb laesst sich dieses Modul
// als einziges des Trichters vollstaendig testen, und deshalb liegt hier auch
// alles, worauf es bei der Wiederholbarkeit ankommt.
//
// Der Grundsatz, der das ganze Verfahren traegt:
//
//   Absolute Helligkeit haengt am Licht. Verhaeltnisse zwischen zwei Zonen
//   desselben Fotos haengen nicht daran - beide Zonen hatten dasselbe Licht.
//
// Wer morgens am Fenster und abends im Bad fotografiert, bekommt voellig
// andere Absolutwerte und nahezu gleiche Verhaeltnisse. Der Hauttyp und die
// Befunde werden deshalb aus Verhaeltnissen abgeleitet, nicht aus Rohwerten.
// Nur wo ein Absolutwert unvermeidlich ist, laeuft er gegen Normbereiche der
// Altersgruppe - und wird als Band ausgegeben, nicht als Punktzahl.

// Auf welche Breite das Bild zum Messen heruntergerechnet wird.
//
// 480 statt der vollen Aufloesung, aus zwei Gruenden: Die Rechnung bleibt auf
// einem Mittelklasse-Handy unter einer halben Sekunde, und das Herunterrechnen
// mittelt das Sensorrauschen weg, das sonst als "Textur" gezaehlt wuerde.
export const MESS_BREITE = 480;

// Gesichtspunkte, auf die sich die Zonen stuetzen.
//
// Bewusst nur die wenigen, die im Netz eindeutig und stabil sind. Die Zonen
// werden daraus geometrisch aufgespannt, statt Punktringe abzuzaehlen: Ein
// falsch erinnerter Ringindex faellt nicht auf und misst still die falsche
// Stelle, eine falsche Geometrie sieht man im Bild sofort.
export const PUNKT = Object.freeze({
  nasenspitze: 1,
  nasenwurzel: 168,
  stirnMitte: 10,
  kinnUnten: 152,
  augeLinksAussen: 33,
  augeRechtsAussen: 263,
  mundLinks: 61,
  mundRechts: 291,
  wangeLinksAussen: 234,
  wangeRechtsAussen: 454
});

export const ZONEN = Object.freeze([
  "stirn",
  "nase",
  "wangeLinks",
  "wangeRechts",
  "kinn"
]);

// Die T-Zone gegen die Wangen - daraus faellt der Hauttyp.
export const TZONE = Object.freeze(["stirn", "nase"]);
export const WANGEN = Object.freeze(["wangeLinks", "wangeRechts"]);

function pruefePunkte(punkte) {
  for (const [name, index] of Object.entries(PUNKT)) {
    const p = punkte?.[index];
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) {
      throw new Error(`Gesichtspunkt fehlt: ${name} (${index})`);
    }
  }
}

function mitte(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function abstand(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Die Zonen als Rechtecke im Bildkoordinatensystem.
//
// Alle Masse haengen am Augenabstand, nicht an Pixeln: Damit misst dieselbe
// Person auf einem kleinen und einem grossen Handy dieselbe Hautstelle, und
// der Abstand zur Kamera faellt aus der Rechnung heraus.
export function zonenAusPunkten(punkte) {
  pruefePunkte(punkte);

  const augeL = punkte[PUNKT.augeLinksAussen];
  const augeR = punkte[PUNKT.augeRechtsAussen];
  const nasenwurzel = punkte[PUNKT.nasenwurzel];
  const nasenspitze = punkte[PUNKT.nasenspitze];
  const stirnOben = punkte[PUNKT.stirnMitte];
  const kinnUnten = punkte[PUNKT.kinnUnten];
  const mundL = punkte[PUNKT.mundLinks];
  const mundR = punkte[PUNKT.mundRechts];
  const seiteL = punkte[PUNKT.wangeLinksAussen];
  const seiteR = punkte[PUNKT.wangeRechtsAussen];

  const augenabstand = abstand(augeL, augeR);
  if (!(augenabstand > 0)) throw new Error("Augenabstand ist null");

  const e = augenabstand;
  const mundMitte = mitte(mundL, mundR);

  return {
    // Zwischen Augenbrauen und Haaransatz, mittig - dort ist die Stirn frei
    // von Haaren und Brauen, wenn der Kopf gerade steht.
    stirn: {
      x: nasenwurzel.x - e * 0.34,
      y: stirnOben.y + (nasenwurzel.y - stirnOben.y) * 0.30,
      w: e * 0.68,
      h: (nasenwurzel.y - stirnOben.y) * 0.45
    },
    // Nasenruecken. Schmal gehalten, damit die Nasenfluegel-Schatten nicht
    // als Textur zaehlen.
    nase: {
      x: nasenwurzel.x - e * 0.11,
      y: nasenwurzel.y + (nasenspitze.y - nasenwurzel.y) * 0.25,
      w: e * 0.22,
      h: (nasenspitze.y - nasenwurzel.y) * 0.55
    },
    // Unterhalb des Auges, innerhalb der Gesichtskante, oberhalb des
    // Mundwinkels: die Flaeche, auf der Roetung und Poren am aussagekraeftigsten
    // sind.
    wangeLinks: {
      x: seiteL.x + e * 0.10,
      y: augeL.y + e * 0.22,
      w: Math.max(e * 0.16, (nasenspitze.x - seiteL.x) - e * 0.32),
      h: Math.max(e * 0.16, (mundMitte.y - augeL.y) - e * 0.24)
    },
    wangeRechts: {
      x: nasenspitze.x + e * 0.22,
      y: augeR.y + e * 0.22,
      w: Math.max(e * 0.16, (seiteR.x - nasenspitze.x) - e * 0.32),
      h: Math.max(e * 0.16, (mundMitte.y - augeR.y) - e * 0.24)
    },
    kinn: {
      x: mundMitte.x - e * 0.26,
      y: mundMitte.y + (kinnUnten.y - mundMitte.y) * 0.30,
      w: e * 0.52,
      h: (kinnUnten.y - mundMitte.y) * 0.45
    }
  };
}

// sRGB -> CIELAB.
//
// Warum nicht einfach der Rotkanal fuer Roetung: Rot steigt auch, wenn es
// heller wird. Der a*-Kanal in Lab trennt Farbe von Helligkeit, und genau
// diese Trennung ist der Unterschied zwischen "die Wange ist gereizt" und
// "auf die Wange faellt mehr Licht".
export function rgbZuLab(r, g, b) {
  const linear = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const rl = linear(r), gl = linear(g), bl = linear(b);

  // D65
  const X = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047;
  const Y = (rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750) / 1.00000;
  const Z = (rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041) / 1.08883;

  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(X), fy = f(Y), fz = f(Z);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

function median(werte) {
  if (!werte.length) return 0;
  const s = Float64Array.from(werte).sort();
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function perzentil(sortiert, anteil) {
  if (!sortiert.length) return 0;
  const i = Math.min(sortiert.length - 1, Math.max(0, Math.round((sortiert.length - 1) * anteil)));
  return sortiert[i];
}

// Liest ein Rechteck aus dem Bild und wandelt es nach Lab.
function zoneLesen(bild, rechteck) {
  const x0 = Math.max(0, Math.round(rechteck.x));
  const y0 = Math.max(0, Math.round(rechteck.y));
  const x1 = Math.min(bild.width, Math.round(rechteck.x + rechteck.w));
  const y1 = Math.min(bild.height, Math.round(rechteck.y + rechteck.h));

  const breite = x1 - x0;
  const hoehe = y1 - y0;
  if (breite < 4 || hoehe < 4) return null;

  const L = new Float64Array(breite * hoehe);
  const a = new Float64Array(breite * hoehe);
  const bb = new Float64Array(breite * hoehe);

  for (let y = 0; y < hoehe; y += 1) {
    for (let x = 0; x < breite; x += 1) {
      const q = ((y0 + y) * bild.width + (x0 + x)) * 4;
      const lab = rgbZuLab(bild.data[q], bild.data[q + 1], bild.data[q + 2]);
      const i = y * breite + x;
      L[i] = lab.L; a[i] = lab.a; bb[i] = lab.b;
    }
  }
  return { L, a, b: bb, breite, hoehe };
}

// Wie stark die Helligkeit auf kurzer Strecke schwankt.
//
// Das ist die Textur: Eine glatte Flaeche aendert sich langsam, eine raue
// springt von Punkt zu Punkt. Gemessen wird gegen den lokalen Mittelwert,
// nicht gegen den der ganzen Zone - sonst wuerde eine gleichmaessige
// Helligkeitsneigung ueber die Wange als Rauheit gezaehlt.
function texturVarianz(L, breite, hoehe) {
  const werte = [];
  for (let y = 1; y < hoehe - 1; y += 1) {
    for (let x = 1; x < breite - 1; x += 1) {
      const i = y * breite + x;
      const umgebung = (
        L[i - breite - 1] + L[i - breite] + L[i - breite + 1] +
        L[i - 1] + L[i] + L[i + 1] +
        L[i + breite - 1] + L[i + breite] + L[i + breite + 1]
      ) / 9;
      werte.push(Math.abs(L[i] - umgebung));
    }
  }
  return median(werte);
}

// Kantenstaerke ueber Sobel - Linien und Falten.
function kantenStaerke(L, breite, hoehe) {
  const werte = [];
  for (let y = 1; y < hoehe - 1; y += 1) {
    for (let x = 1; x < breite - 1; x += 1) {
      const i = y * breite + x;
      const gx =
        -L[i - breite - 1] + L[i - breite + 1] +
        -2 * L[i - 1] + 2 * L[i + 1] +
        -L[i + breite - 1] + L[i + breite + 1];
      const gy =
        -L[i - breite - 1] - 2 * L[i - breite] - L[i - breite + 1] +
        L[i + breite - 1] + 2 * L[i + breite] + L[i + breite + 1];
      werte.push(Math.hypot(gx, gy));
    }
  }
  const sortiert = Float64Array.from(werte).sort();
  // Das obere Zehntel, nicht der Mittelwert: Falten sind wenige starke
  // Kanten, kein flaechiger Effekt. Ein Mittelwert wuerde sie im Rauschen
  // der glatten Flaeche ertraenken.
  return perzentil(sortiert, 0.9);
}

// Glanz: Anteil sehr heller Punkte mit geringer Farbigkeit.
//
// Talgglanz spiegelt die Lichtquelle - er ist hell und nahezu farblos.
// Helle Haut allein ist hell und behaelt ihre Farbe. Die Bedingung auf die
// Farbigkeit trennt beides.
function glanzAnteil(L, a, b) {
  const sortiertL = Float64Array.from(L).sort();
  const schwelle = perzentil(sortiertL, 0.5) + 12;
  let treffer = 0;
  for (let i = 0; i < L.length; i += 1) {
    if (L[i] > schwelle && Math.hypot(a[i], b[i]) < 14) treffer += 1;
  }
  return treffer / L.length;
}

// Pigment: Anteil deutlich dunklerer Punkte als der Zonenmedian.
function pigmentAnteil(L) {
  const sortiert = Float64Array.from(L).sort();
  const mitte = perzentil(sortiert, 0.5);
  let treffer = 0;
  for (let i = 0; i < L.length; i += 1) {
    if (L[i] < mitte - 9) treffer += 1;
  }
  return treffer / L.length;
}

// Poren: kleine, punktfoermige Dunkelstellen.
//
// Unterschied zu Pigment: Poren sind einzeln und klein, Flecken sind
// zusammenhaengend und gross. Getrennt wird das ueber die Nachbarschaft -
// ein dunkler Punkt, dessen Nachbarn hell sind, ist eine Pore.
function porenDichte(L, breite, hoehe) {
  let treffer = 0;
  let geprueft = 0;
  for (let y = 2; y < hoehe - 2; y += 1) {
    for (let x = 2; x < breite - 2; x += 1) {
      const i = y * breite + x;
      const ring = (
        L[i - 2 * breite] + L[i + 2 * breite] +
        L[i - 2] + L[i + 2]
      ) / 4;
      geprueft += 1;
      if (ring - L[i] > 6) treffer += 1;
    }
  }
  return geprueft ? treffer / geprueft : 0;
}

// ITA-Grad - der uebliche Hauttonwert der Dermatologie.
function itaGrad(L, b) {
  const Lm = median(Array.from(L));
  const bm = median(Array.from(b));
  if (Math.abs(bm) < 1e-6) return 90;
  return (Math.atan((Lm - 50) / bm) * 180) / Math.PI;
}

// Ein Bild, alle Zonen.
//
// `bild` ist ein ImageData-artiges Objekt: { data, width, height }. Damit
// laeuft dieselbe Funktion im Browser auf einem Canvas und im Test auf einem
// von Hand gebauten Feld.
export function messeBild(bild, punkte) {
  const rechtecke = zonenAusPunkten(punkte);
  const ergebnis = {};

  for (const zone of ZONEN) {
    const daten = zoneLesen(bild, rechtecke[zone]);
    if (!daten) {
      ergebnis[zone] = null;
      continue;
    }
    const { L, a, b, breite, hoehe } = daten;
    ergebnis[zone] = {
      helligkeit: median(Array.from(L)),
      roetung: median(Array.from(a)),
      hautton: itaGrad(L, b),
      textur: texturVarianz(L, breite, hoehe),
      linien: kantenStaerke(L, breite, hoehe),
      glanz: glanzAnteil(L, a, b),
      pigment: pigmentAnteil(L),
      poren: porenDichte(L, breite, hoehe)
    };
  }
  return ergebnis;
}

// Mehrere Aufnahmen zu einer Messung zusammenfassen.
//
// Drei Bilder in anderthalb Sekunden, davon je Wert der Median: Ein
// Wimpernschlag, ein Lichtflackern oder ein Autoscheinwerfer trifft nie alle
// drei gleich. Der Median wirft ihn heraus, ein Mittelwert wuerde ihn
// einrechnen.
export function fasseAufnahmenZusammen(messungen) {
  const gueltige = messungen.filter(Boolean);
  if (!gueltige.length) return null;

  const ergebnis = {};
  for (const zone of ZONEN) {
    const proWert = {};
    const vorhanden = gueltige.map((m) => m[zone]).filter(Boolean);
    if (!vorhanden.length) { ergebnis[zone] = null; continue; }
    for (const schluessel of Object.keys(vorhanden[0])) {
      proWert[schluessel] = median(vorhanden.map((v) => v[schluessel]));
    }
    ergebnis[zone] = proWert;
  }
  return ergebnis;
}

function mittelUeber(messung, zonen, schluessel) {
  const werte = zonen.map((z) => messung?.[z]?.[schluessel]).filter(Number.isFinite);
  if (!werte.length) return null;
  return werte.reduce((s, v) => s + v, 0) / werte.length;
}

// Der Kern des Verfahrens: Zonen gegeneinander statt gegen absolute Grenzen.
//
// Ein Verhaeltnis um 1,0 heisst "beide Zonen gleich". Groesser als 1 heisst,
// die T-Zone ist staerker betroffen. Das bleibt stabil, wenn sich das Licht
// aendert - und genau darum geht es.
export function berechneVerhaeltnisse(messung) {
  const sicher = (zaehler, nenner) => {
    if (!Number.isFinite(zaehler) || !Number.isFinite(nenner)) return null;
    if (Math.abs(nenner) < 1e-6) return null;
    return zaehler / nenner;
  };

  const tGlanz = mittelUeber(messung, TZONE, "glanz");
  const wGlanz = mittelUeber(messung, WANGEN, "glanz");
  const tTextur = mittelUeber(messung, TZONE, "textur");
  const wTextur = mittelUeber(messung, WANGEN, "textur");
  const tRoetung = mittelUeber(messung, TZONE, "roetung");
  const wRoetung = mittelUeber(messung, WANGEN, "roetung");

  return {
    // Der Hauttyp-Wert. Ueber ~1,35: klassische Mischhaut.
    glanzTzoneZuWange: sicher(tGlanz, wGlanz),
    texturTzoneZuWange: sicher(tTextur, wTextur),
    // Roetung ist ein a*-Wert und kann um null liegen; hier zaehlt die
    // Differenz, nicht der Quotient.
    roetungWangeMinusTzone: (Number.isFinite(wRoetung) && Number.isFinite(tRoetung))
      ? wRoetung - tRoetung
      : null,
    glanzGesamt: (Number.isFinite(tGlanz) && Number.isFinite(wGlanz)) ? (tGlanz + wGlanz) / 2 : null,
    texturGesamt: (Number.isFinite(tTextur) && Number.isFinite(wTextur)) ? (tTextur + wTextur) / 2 : null,
    roetungGesamt: (Number.isFinite(tRoetung) && Number.isFinite(wRoetung)) ? (tRoetung + wRoetung) / 2 : null,
    seitenUnterschiedRoetung: sicher(
      Math.abs((messung?.wangeLinks?.roetung ?? 0) - (messung?.wangeRechts?.roetung ?? 0)),
      1
    )
  };
}

export const __test__ = { median, perzentil, texturVarianz, kantenStaerke, glanzAnteil, pigmentAnteil, porenDichte, itaGrad };
