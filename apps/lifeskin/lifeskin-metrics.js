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

// Wie fein die Messung die Haut abtastet, in Millimetern.
//
// HIER LAG DER GROESSTE MESSFEHLER DES VERFAHRENS, und er ist keiner der
// Rechnung, sondern der Physik: Bei 480 Bildpunkten Breite kommt auf einen
// Bildpunkt rund ein halber bis ein ganzer Millimeter Haut. Eine Pore misst
// 0,05 bis 0,5 mm. Sie war also kleiner als ein Bildpunkt - was porenDichte()
// zaehlte, konnten keine Poren sein.
//
// Zweitens standen die Nachbarschaftsabstaende in Bildpunkten fest: einer fuer
// die Kanten, zwei fuer die Poren. Wer das Handy naeher hielt, mass damit eine
// andere Hautfrequenz - derselbe Mensch bekam an zwei Tagen zwei Befunde. Fuer
// einen Trichter, der Vertrauen verkauft, ist das der teuerste Fehler von
// allen.
//
// Beides ist behoben, seit der Pupillenabstand den Massstab liefert (siehe
// lifeskin-haut.js): Gemessen wird in voller Kameraaufloesung, und die
// Abstaende stehen in Millimetern und werden je Aufnahme in Bildpunkte
// umgerechnet.
export const ABTASTUNG_MM = Object.freeze({
  kante: 0.30,   // feine Linien und Faltenkanten
  pore: 0.40,    // der Ring um eine Pore, groesser als die Pore selbst
  textur: 0.35   // die Nachbarschaft fuer die Texturschwankung
});

// Was bei welcher Abtastung ueberhaupt im Bild steht.
//
// DIE UNBEQUEMSTE ZAHLENTABELLE DES PROJEKTS, und die ehrlichste.
//
// Nach Nyquist braucht eine Struktur der Groesse d eine Abtastung von
// hoechstens d/2, um im Bild zu erscheinen. Darunter ist sie nicht "unscharf",
// sie ist NICHT DA - kein Filter und kein Modell holt sie zurueck. Was ein
// Kantendetektor dann noch zaehlt, ist Rauschen und Kompressionsartefakt.
//
// Daraus folgt fuer eine Frontkamera, wenn das Gesicht den Kreis fuellt:
//
//   720p   0,34 mm/px  ->  Roetung, Glanz, Pigment.  Linien und Poren NICHT.
//   1080p  0,22 mm/px  ->  dazu Linien.              Poren NICHT.
//   1440p  0,17 mm/px  ->  alles davon.
//
// Der Trichter hat bis hierher bei 720p Poren und Linien gemeldet. Diese
// Zahlen konnten nicht stimmen; sie kamen aus Bildrauschen. Jetzt wird die
// Kamera um 1440 gebeten - und was das Geraet nicht liefert, wird nicht
// behauptet, sondern als "nicht messbar" zurueckgegeben.
//
// Feine Poren (0,05 bis 0,1 mm) braeuchten 0,05 mm/px. Das sind rund 2900
// Bildpunkte auf die Gesichtsbreite. Keine Frontkamera der Welt liefert das
// im Videostrom; dafuer gibt es Makrooptik und polarisiertes Blitzlicht.
// Gemessen wird also die erweiterte, sichtbare Pore - und nichts anderes
// soll der Befund behaupten.
export const AUFLOESUNG_NOETIG_MM = Object.freeze({
  helligkeit: 2.50,
  roetung: 2.50,
  hautton: 2.50,
  glanz: 1.50,
  pigment: 0.75,
  textur: 0.25,
  linien: 0.25,
  poren: 0.20
});

// Welche Werte bei dieser Abtastung Bestand haben.
//
// Ohne bekannten Massstab - der Rueckfallweg ohne Gesichtsnetz - gilt nur
// das Flaechige. Dort fehlt der Pupillenabstand, also weiss niemand, wie
// gross ein Millimeter im Bild ist, und dann laesst sich ueber Poren nichts
// sagen.
export function messbareWerte(mmJeBildpunkt) {
  const messbar = {};
  for (const [wert, grenze] of Object.entries(AUFLOESUNG_NOETIG_MM)) {
    messbar[wert] = Number.isFinite(mmJeBildpunkt) && mmJeBildpunkt > 0
      ? mmJeBildpunkt <= grenze
      : grenze >= 1.5;
  }
  return messbar;
}

// Ohne bekannten Massstab wird gerechnet wie frueher. Das trifft nur den
// Rueckfallweg ohne Gesichtsnetz: keine Iris, kein Pupillenabstand, kein
// Massstab. Besser als nichts, und im Bericht steht, dass es der Rueckfall war.
const ERSATZ_SCHRITT = Object.freeze({ kante: 1, pore: 2, textur: 1 });

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
    // Die obere Wange ueber dem Jochbein - und ABSICHTLICH HOEHER als frueher.
    //
    // Vorher reichte die Zone bis zum Mundwinkel hinunter. Bei einem
    // baertigen Gesicht liegt das mitten im Bart, und gemessen wurde
    // Barthaar: dunkel, hochkontrastig, ohne Poren. Der Befund lautete dann
    // "trockene, grobe, dunkle Haut" bei jemandem, dessen Wange man gar nicht
    // gesehen hatte. Im Zielmarkt betrifft das einen grossen Teil der Maenner.
    //
    // Ueber dem Jochbein ist auch bei Vollbart Haut zu sehen, und es ist
    // ausserdem die Flaeche, auf der Roetung und Poren am
    // aussagekraeftigsten sind. Was trotzdem kein Hautpunkt ist, faellt in
    // zoneLesen() heraus.
    wangeLinks: {
      x: seiteL.x + e * 0.12,
      y: augeL.y + e * 0.18,
      w: Math.max(e * 0.16, (nasenspitze.x - seiteL.x) - e * 0.34),
      h: e * 0.48
    },
    wangeRechts: {
      x: nasenspitze.x + e * 0.22,
      y: augeR.y + e * 0.18,
      w: Math.max(e * 0.16, (seiteR.x - nasenspitze.x) - e * 0.34),
      h: e * 0.48
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

// Nur die Zahlen. Was ausserhalb der Hautmaske liegt, steht als NaN im
// Gitter und darf in keine Statistik eingehen.
function nurZahlen(feld) {
  const raus = [];
  for (let i = 0; i < feld.length; i += 1) if (Number.isFinite(feld[i])) raus.push(feld[i]);
  return raus;
}

// Aus Millimetern werden Bildpunkte.
function schrittFuer(mmJeBildpunkt, mm, ersatz) {
  if (!Number.isFinite(mmJeBildpunkt) || !(mmJeBildpunkt > 0)) return ersatz;
  return Math.max(1, Math.round(mm / mmJeBildpunkt));
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
function zoneLesen(bild, rechteck, { abgleich = null, istHaut = null } = {}) {
  const x0 = Math.max(0, Math.round(rechteck.x));
  const y0 = Math.max(0, Math.round(rechteck.y));
  const x1 = Math.min(bild.width, Math.round(rechteck.x + rechteck.w));
  const y1 = Math.min(bild.height, Math.round(rechteck.y + rechteck.h));

  const breite = x1 - x0;
  const hoehe = y1 - y0;
  if (breite < 4 || hoehe < 4) return null;

  const w = abgleich || { r: 1, g: 1, b: 1 };
  const L = new Float64Array(breite * hoehe);
  const a = new Float64Array(breite * hoehe);
  const bb = new Float64Array(breite * hoehe);
  const hell = new Float64Array(breite * hoehe);
  const hautPunkt = new Uint8Array(breite * hoehe);
  let hautZahl = 0;

  for (let y = 0; y < hoehe; y += 1) {
    for (let x = 0; x < breite; x += 1) {
      const q = ((y0 + y) * bild.width + (x0 + x)) * 4;
      const r0 = bild.data[q], g0 = bild.data[q + 1], b0 = bild.data[q + 2];
      const r = Math.min(255, r0 * w.r), g = Math.min(255, g0 * w.g), b = Math.min(255, b0 * w.b);
      const lab = rgbZuLab(r, g, b);
      const i = y * breite + x;
      L[i] = lab.L; a[i] = lab.a; bb[i] = lab.b;
      hell[i] = 0.2126 * r0 + 0.7152 * g0 + 0.0722 * b0;
      if (!istHaut || istHaut(r, g, b)) { hautPunkt[i] = 1; hautZahl += 1; }
    }
  }

  // Zweiter Durchgang gegen die eigene Helligkeit der Zone: Ein mittelbrauner
  // Bart liegt farblich mitten im Hautbereich und kaeme sonst durch. Barthaar
  // ist 30 bis 60 Stufen dunkler als die Haut daneben, ein Pigmentfleck - den
  // wir ja messen wollen - nur 3 bis 10. Der Schnitt bei 20 trennt beides.
  // Nach oben schneidet 25 den Glanzreflex weg; den zaehlt glanzAnteil()
  // ohnehin gesondert, und als Helligkeit blaehte er die Textur auf.
  if (istHaut && hautZahl >= 12) {
    const werte = [];
    for (let i = 0; i < hautPunkt.length; i += 1) if (hautPunkt[i]) werte.push(hell[i]);
    werte.sort((p, q) => p - q);
    const mitte = werte[Math.floor(werte.length / 2)];
    hautZahl = 0;
    for (let i = 0; i < hautPunkt.length; i += 1) {
      if (!hautPunkt[i]) continue;
      if (hell[i] < mitte - 20 || hell[i] > mitte + 25) { hautPunkt[i] = 0; continue; }
      hautZahl += 1;
    }
  }

  // Zu wenig Haut heisst: kein Wert.
  //
  // Zwei Bedingungen, und die zweite ist die wichtige. Eine Mindestzahl von
  // Bildpunkten allein reicht nicht: Ein baertiges Kinn hatte in der Messung
  // an der Betriebsaufnahme noch 48 Prozent "Haut", und in diesen 48 Prozent
  // steckte genug Bart, um Textur und Linien fast zu verdoppeln. Bleibt
  // weniger als die Haelfte der Zone uebrig, ist das keine Hautflaeche mehr,
  // sondern ein Rest davon - und ein Rest misst nicht dasselbe.
  //
  // Kein Kinnwert ist die richtige Antwort. Eine erfundene Zahl waere
  // schlimmer: Sie ginge in den Mittelwert ein, und niemand saehe es ihr an.
  const anteil = hautZahl / (breite * hoehe);
  if (istHaut && (hautZahl < 90 || anteil < 0.5)) return null;

  for (let i = 0; i < hautPunkt.length; i += 1) {
    if (hautPunkt[i]) continue;
    L[i] = NaN; a[i] = NaN; bb[i] = NaN;
  }
  return { L, a, b: bb, breite, hoehe, hautZahl, hautAnteil: anteil };
}

// Wie stark die Helligkeit auf kurzer Strecke schwankt.
//
// Das ist die Textur: Eine glatte Flaeche aendert sich langsam, eine raue
// springt von Punkt zu Punkt. Gemessen wird gegen den lokalen Mittelwert,
// nicht gegen den der ganzen Zone - sonst wuerde eine gleichmaessige
// Helligkeitsneigung ueber die Wange als Rauheit gezaehlt.
function texturVarianz(L, breite, hoehe, schritt = 1) {
  const werte = [];
  const s = schritt;
  for (let y = s; y < hoehe - s; y += 1) {
    for (let x = s; x < breite - s; x += 1) {
      const i = y * breite + x;
      if (!Number.isFinite(L[i])) continue;
      let summe = 0, n = 0, luecke = false;
      for (let dy = -1; dy <= 1 && !luecke; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const v = L[i + dy * s * breite + dx * s];
          if (!Number.isFinite(v)) { luecke = true; break; }
          summe += v; n += 1;
        }
      }
      if (luecke || !n) continue;
      werte.push(Math.abs(L[i] - summe / n));
    }
  }
  return werte.length ? median(werte) : NaN;
}

// Kantenstaerke ueber Sobel - Linien und Falten.
function kantenStaerke(L, breite, hoehe, schritt = 1) {
  const werte = [];
  const s = schritt;
  for (let y = s; y < hoehe - s; y += 1) {
    for (let x = s; x < breite - s; x += 1) {
      const i = y * breite + x;
      const hole = (dx, dy) => L[i + dy * s * breite + dx * s];
      const p = [hole(-1, -1), hole(0, -1), hole(1, -1), hole(-1, 0),
        hole(1, 0), hole(-1, 1), hole(0, 1), hole(1, 1)];
      if (p.some((v) => !Number.isFinite(v))) continue;
      const gx = -p[0] + p[2] - 2 * p[3] + 2 * p[4] - p[5] + p[7];
      const gy = -p[0] - 2 * p[1] - p[2] + p[5] + 2 * p[6] + p[7];
      // Durch die Schrittweite teilen: Sonst misst ein groesserer Schritt
      // allein deswegen eine staerkere Kante.
      werte.push(Math.hypot(gx, gy) / s);
    }
  }
  if (!werte.length) return NaN;
  const sortiert = Float64Array.from(werte).sort();
  // Das obere Zehntel, nicht der Mittelwert: Falten sind wenige starke
  // Kanten, kein flaechiger Effekt.
  return perzentil(sortiert, 0.9);
}

// Glanz: Anteil sehr heller Punkte mit geringer Farbigkeit.
//
// Talgglanz spiegelt die Lichtquelle - er ist hell und nahezu farblos.
// Helle Haut allein ist hell und behaelt ihre Farbe. Die Bedingung auf die
// Farbigkeit trennt beides.
function glanzAnteil(L, a, b) {
  const werte = nurZahlen(L);
  if (!werte.length) return NaN;
  const sortiertL = Float64Array.from(werte).sort();
  const schwelle = perzentil(sortiertL, 0.5) + 12;
  let treffer = 0, geprueft = 0;
  for (let i = 0; i < L.length; i += 1) {
    if (!Number.isFinite(L[i])) continue;
    geprueft += 1;
    if (L[i] > schwelle && Math.hypot(a[i], b[i]) < 14) treffer += 1;
  }
  return geprueft ? treffer / geprueft : NaN;
}

// Pigment: Anteil deutlich dunklerer Punkte als der Zonenmedian.
function pigmentAnteil(L) {
  const werte = nurZahlen(L);
  if (!werte.length) return NaN;
  const sortiert = Float64Array.from(werte).sort();
  const mitte = perzentil(sortiert, 0.5);
  let treffer = 0;
  for (const v of werte) if (v < mitte - 9) treffer += 1;
  return treffer / werte.length;
}

// Poren: kleine, punktfoermige Dunkelstellen.
//
// Unterschied zu Pigment: Poren sind einzeln und klein, Flecken sind
// zusammenhaengend und gross. Getrennt wird das ueber die Nachbarschaft -
// ein dunkler Punkt, dessen Nachbarn hell sind, ist eine Pore.
function porenDichte(L, breite, hoehe, schritt = 2) {
  let treffer = 0, geprueft = 0;
  const s = schritt;
  for (let y = s; y < hoehe - s; y += 1) {
    for (let x = s; x < breite - s; x += 1) {
      const i = y * breite + x;
      const mitte = L[i];
      if (!Number.isFinite(mitte)) continue;
      const ringPunkte = [L[i - s * breite], L[i + s * breite], L[i - s], L[i + s]];
      if (!ringPunkte.every(Number.isFinite)) continue;
      const ring = (ringPunkte[0] + ringPunkte[1] + ringPunkte[2] + ringPunkte[3]) / 4;
      geprueft += 1;
      if (ring - mitte > 6) treffer += 1;
    }
  }
  return geprueft ? treffer / geprueft : NaN;
}

// ITA-Grad - der uebliche Hauttonwert der Dermatologie.
function itaGrad(L, b) {
  const Lm = median(nurZahlen(L));
  const bm = median(nurZahlen(b));
  if (Math.abs(bm) < 1e-6) return 90;
  return (Math.atan((Lm - 50) / bm) * 180) / Math.PI;
}

// Ein Bild, alle Zonen.
//
// `bild` ist ein ImageData-artiges Objekt: { data, width, height }. Damit
// laeuft dieselbe Funktion im Browser auf einem Canvas und im Test auf einem
// von Hand gebauten Feld.
export function messeBild(bild, punkte, { abgleich = null, istHaut = null, mmJeBildpunkt = null } = {}) {
  const rechtecke = zonenAusPunkten(punkte);
  const ergebnis = {};

  // Die Abtastabstaende einmal je Aufnahme, nicht je Zone: Der Massstab gilt
  // fuer das ganze Bild.
  const schritt = {
    kante: schrittFuer(mmJeBildpunkt, ABTASTUNG_MM.kante, ERSATZ_SCHRITT.kante),
    pore: schrittFuer(mmJeBildpunkt, ABTASTUNG_MM.pore, ERSATZ_SCHRITT.pore),
    textur: schrittFuer(mmJeBildpunkt, ABTASTUNG_MM.textur, ERSATZ_SCHRITT.textur)
  };
  const messbar = messbareWerte(mmJeBildpunkt);

  for (const zone of ZONEN) {
    const daten = zoneLesen(bild, rechtecke[zone], { abgleich, istHaut });
    if (!daten) {
      ergebnis[zone] = null;
      continue;
    }
    const { L, a, b, breite, hoehe } = daten;
    // Was das Bild nicht enthaelt, wird nicht gemeldet.
    //
    // Nicht "unauffaellig" und nicht null-als-Zahl, sondern null als
    // "nicht messbar". Der Unterschied entscheidet: Eine Pore, die bei
    // dieser Abtastung gar nicht im Bild stehen kann, darf im Befund weder
    // als vorhanden noch als abwesend auftauchen.
    const roh = {
      helligkeit: median(nurZahlen(L)),
      roetung: median(nurZahlen(a)),
      hautton: itaGrad(L, b),
      textur: texturVarianz(L, breite, hoehe, schritt.textur),
      linien: kantenStaerke(L, breite, hoehe, schritt.kante),
      glanz: glanzAnteil(L, a, b),
      pigment: pigmentAnteil(L),
      poren: porenDichte(L, breite, hoehe, schritt.pore)
    };

    const gefiltert = {};
    for (const [name, wert] of Object.entries(roh)) {
      gefiltert[name] = messbar[name] === false ? null : wert;
    }
    // Damit im Bericht sichtbar wird, wie viel Haut ueberhaupt zu sehen war.
    // Steht das bei den Wangen durchweg niedrig, sitzt die Zone im Bart und
    // gehoert verschoben - ohne diese Zahl faellt das nie auf.
    gefiltert.hautAnteil = daten.hautAnteil;
    ergebnis[zone] = gefiltert;
  }
  return ergebnis;
}

// Wie einig sich die Aufnahmen sind.
//
// Der Median sagt, welcher Wert herauskommt. Er sagt nicht, ob man ihm
// glauben darf. Streuen fuenf Aufnahmen derselben Wange um die Haelfte
// auseinander, ist der Median davon zwar eine Zahl, aber keine Aussage -
// und ein Befund, der auf so etwas beruht, faellt beim zweiten Anlauf
// anders aus. Genau das merkt sich ein Kunde.
//
// Zurueck kommt je Zone und Wert die Streuung, bezogen auf den Betrag des
// Medians. Klein heisst einig, gross heisst: lieber nichts behaupten.
export function streuungUeberAufnahmen(messungen) {
  const gueltige = messungen.filter(Boolean);
  const ergebnis = {};
  for (const zone of ZONEN) {
    const vorhanden = gueltige.map((m) => m[zone]).filter(Boolean);
    if (vorhanden.length < 2) { ergebnis[zone] = null; continue; }
    const proWert = {};
    for (const schluessel of Object.keys(vorhanden[0])) {
      const werte = vorhanden.map((v) => v[schluessel]).filter(Number.isFinite);
      if (werte.length < 2) { proWert[schluessel] = null; continue; }
      const mitte = median(werte);
      const spanne = Math.max(...werte) - Math.min(...werte);
      const bezug = Math.max(Math.abs(mitte), 1e-3);
      proWert[schluessel] = spanne / bezug;
    }
    ergebnis[zone] = proWert;
  }
  return ergebnis;
}

// Mehrere Aufnahmen zu einer Messung zusammenfassen.
//
// Je Wert der Median: Ein Wimpernschlag, ein Lichtflackern oder ein
// Autoscheinwerfer trifft nie alle Aufnahmen gleich. Der Median wirft ihn
// heraus, ein Mittelwert wuerde ihn einrechnen.
//
// Und gewichtet, seit die Bildguete gemessen wird (lifeskin-haut.js): Ein
// verwackeltes oder halb ausgebranntes Bild soll den Wert nicht bestimmen
// duerfen. Ganz herauswerfen waere falsch - dafuer sind es zu wenige
// Aufnahmen -, aber gleich viel wiegen darf es auch nicht.
export function fasseAufnahmenZusammen(messungen, { gewichte = null } = {}) {
  const paare = messungen
    .map((m, i) => ({ m, g: gewichte ? (gewichte[i] ?? 0) : 1 }))
    .filter((p) => p.m && p.g > 0);
  if (!paare.length) return null;

  const ergebnis = {};
  for (const zone of ZONEN) {
    const proWert = {};
    const vorhanden = paare.map((p) => ({ v: p.m[zone], g: p.g })).filter((p) => p.v);
    if (!vorhanden.length) { ergebnis[zone] = null; continue; }
    for (const schluessel of Object.keys(vorhanden[0].v)) {
      const werte = vorhanden
        .map((p) => ({ wert: p.v[schluessel], gewicht: p.g }))
        .filter((p) => Number.isFinite(p.wert));
      // Kein einziger brauchbarer Wert heisst null - "nicht messbar" und
      // nicht "null gemessen".
      proWert[schluessel] = werte.length ? gewichteterMedian(werte) : null;
    }
    ergebnis[zone] = proWert;
  }
  return ergebnis;
}

// Der Median, aber jede Aufnahme zaehlt so viel, wie sie taugt.
//
// Ein verwackeltes oder halb ausgebranntes Bild soll den Wert nicht
// bestimmen duerfen, aber es soll auch nicht ganz herausfallen - dafuer sind
// es zu wenige Aufnahmen. Gesucht wird der Wert, bei dem die Haelfte des
// Gesamtgewichts ueberschritten ist.
function gewichteterMedian(werte) {
  const sortiert = [...werte].sort((a, b) => a.wert - b.wert);
  const gesamt = sortiert.reduce((s, p) => s + p.gewicht, 0);
  if (!(gesamt > 0)) return median(sortiert.map((p) => p.wert));
  let bis = 0;
  for (const p of sortiert) {
    bis += p.gewicht;
    if (bis >= gesamt / 2) return p.wert;
  }
  return sortiert[sortiert.length - 1].wert;
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
