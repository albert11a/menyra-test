// Was gemessen wird, bevor gemessen wird.
//
// Der Trichter hat die Zahlen von Anfang an sauber gerechnet - Lab statt RGB,
// Median statt Mittelwert, Verhaeltnisse statt absoluter Grenzen. Nur hat er
// sie an der falschen Stelle, im falschen Massstab und in ungeeichter Farbe
// erhoben. Drei Fehler, die keine Rechnung hinterher wieder einfaengt:
//
// 1. DIE STELLE. Die Wangenzone lag bei einem baertigen Gesicht im Bart.
//    Gemessen wurde dann Barthaar: dunkel, hochkontrastig, ohne Poren. Das
//    ergibt "trockene, grobe, dunkle Haut" bei jemandem, dessen Wange man gar
//    nicht gesehen hat. Im Zielmarkt betrifft das einen grossen Teil der
//    Maenner.
//
// 2. DER MASSSTAB. Textur und Poren wurden in Bildpunkten gezaehlt. Wer das
//    Handy naeher haelt, bekam mehr Poren - nicht weil er welche hat, sondern
//    weil eine Pore mehr Bildpunkte belegt. Derselbe Mensch bekam damit an
//    zwei Tagen zwei Befunde, und das ist der sicherste Weg, einen Kunden zu
//    verlieren, der wiederkommt.
//
// 3. DIE FARBE. Der Weissabgleich kam aus der Grauwelt-Annahme: Alle Farben
//    eines Bildes gleichen sich im Mittel zu Grau aus. Vor einer gelben Wand
//    stimmt das nicht, und die Roetung verschiebt sich. Auf iOS laesst sich
//    der Weissabgleich der Kamera auch nicht sperren - Safari kennt die
//    Einstellung nicht -, es muss also eine Referenz aus dem Bild kommen.
//
// Alle drei sind loesbar, seit das Gesichtsnetz da ist: Es weiss, wo die
// Wange liegt, wie weit die Pupillen auseinanderstehen und wo das Augenweiss
// ist.

import { MARKE, LIDSPALTE_LINKS, LIDSPALTE_RECHTS } from "./lifeskin-netz.js";

// Der mittlere Pupillenabstand des erwachsenen Menschen.
//
// 63 mm ist der Wert, auf den sich die Anthropometrie einig ist; die Spanne
// reicht etwa von 54 bis 74 mm. Er ist der einzige bekannte Massstab in einem
// Selbstportraet - kein Lineal im Bild, keine Brennweite, keine Tiefe. Ueber
// ihn wird aus "so viele Bildpunkte" ein "so viele Millimeter", und erst
// damit heisst eine Pore bei jedem Besucher dasselbe.
//
// Die Streuung von rund 15 Prozent geht als Messfehler in Textur und Poren
// ein. Das ist viel weniger als der Fehler, den sie ersetzt: Zwischen
// ausgestrecktem Arm und zwanzig Zentimetern liegt ein Faktor drei.
export const PUPILLENABSTAND_MM = 63;

export function massstabAusNetz(punkte) {
  const l = punkte?.[MARKE.irisLinks];
  const r = punkte?.[MARKE.irisRechts];
  if (!l || !r) return null;
  const bildpunkte = Math.hypot(r.x - l.x, r.y - l.y);
  if (!(bildpunkte > 1)) return null;
  return { mmJeBildpunkt: PUPILLENABSTAND_MM / bildpunkte, pupillenabstandPx: bildpunkte };
}

// Weissabgleich aus dem Augenweiss.
//
// Die Sklera ist die einzige Flaeche in einem Gesicht, von der bekannt ist,
// dass sie eigentlich neutral sein muesste. Faerbt die Lampe das Bild
// orange, faerbt sie das Augenweiss mit - und der Faktor, der es wieder grau
// macht, macht auch die Haut wieder richtig. Das Verfahren ist nicht neu;
// es steht so in der Patentschrift US 10984281 zur Farbkorrektur ueber
// Sklera und Pupille.
//
// Genommen wird nur das obere Zehntel der Helligkeit innerhalb der
// Lidspalte. Der Rest der Lidspalte ist Wimper, Lidschatten, Iris und die
// feinen Gefaesse am Rand - alles nicht neutral. Erst dieser Schnitt macht
// aus "irgendwo im Auge" eine Weissreferenz.
export function sklerAbgleich(bild, punkte, { mindestPunkte = 40 } = {}) {
  const proben = [];
  for (const spalte of [LIDSPALTE_LINKS, LIDSPALTE_RECHTS]) {
    const umriss = spalte.map((i) => punkte[i]).filter(Boolean);
    if (umriss.length < spalte.length) continue;
    fuerJedenPunktImPolygon(bild, umriss, (q) => {
      const r = bild.data[q], g = bild.data[q + 1], b = bild.data[q + 2];
      proben.push({ r, g, b, hell: 0.2126 * r + 0.7152 * g + 0.0722 * b });
    });
  }
  if (proben.length < mindestPunkte) return null;

  proben.sort((a, b) => b.hell - a.hell);
  const hellste = proben.slice(0, Math.max(8, Math.round(proben.length * 0.10)));

  let sr = 0, sg = 0, sb = 0;
  for (const p of hellste) {
    // Ausgebrannte Punkte tragen keine Farbe mehr: Wo alle drei Kanaele
    // anschlagen, steht 255 fuer "mindestens 255" und nicht fuer weiss.
    if (p.r >= 250 && p.g >= 250 && p.b >= 250) continue;
    sr += p.r; sg += p.g; sb += p.b;
  }
  const n = hellste.length;
  if (!n || !(sr > 0) || !(sg > 0) || !(sb > 0)) return null;

  const mr = sr / n, mg = sg / n, mb = sb / n;
  const mittel = (mr + mg + mb) / 3;
  // Dieselbe Begrenzung wie bei der Grauwelt: Ein Faktor jenseits davon
  // stammt nicht mehr von der Lampe, sondern von einer Fehlmessung - eine
  // geschlossene Lidspalte, eine Sonnenbrille, ein Reflex.
  const grenze = (f) => Math.max(0.72, Math.min(1.38, f));
  return {
    r: grenze(mittel / mr), g: grenze(mittel / mg), b: grenze(mittel / mb),
    quelle: "sklera", proben: proben.length
  };
}

// Ueber alle Bildpunkte innerhalb eines Polygons.
//
// Scanline mit gerader/ungerader Regel. Bewusst ohne Bibliothek: Es sind
// zwanzig Zeilen, und jede fremde Zeile in diesem Trichter muss der Kunde
// mitladen.
export function fuerJedenPunktImPolygon(bild, umriss, tun) {
  let yMin = Infinity, yMax = -Infinity;
  for (const p of umriss) {
    if (p.y < yMin) yMin = p.y;
    if (p.y > yMax) yMax = p.y;
  }
  const von = Math.max(0, Math.floor(yMin));
  const bis = Math.min(bild.height - 1, Math.ceil(yMax));

  for (let y = von; y <= bis; y += 1) {
    const kreuzungen = [];
    for (let i = 0, j = umriss.length - 1; i < umriss.length; j = i, i += 1) {
      const a = umriss[j], b = umriss[i];
      if ((a.y > y) === (b.y > y)) continue;
      kreuzungen.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
    }
    kreuzungen.sort((p, q) => p - q);
    for (let k = 0; k + 1 < kreuzungen.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(kreuzungen[k]));
      const x1 = Math.min(bild.width - 1, Math.floor(kreuzungen[k + 1]));
      for (let x = x0; x <= x1; x += 1) tun((y * bild.width + x) * 4, x, y);
    }
  }
}

// Welche Bildpunkte einer Zone wirklich Haut sind.
//
// Zwei Durchgaenge, und der zweite ist der wichtige:
//
// Zuerst faellt alles heraus, was farblich keine Haut ist - dunkles Haar,
// Kleidung, Hintergrund. Das allein reicht nicht: Ein mittelbrauner Bart
// liegt farblich mitten im Hautbereich und kaeme durch.
//
// Darum der zweite Durchgang gegen die eigene Helligkeit der Zone. Barthaar
// ist 30 bis 60 Helligkeitsstufen dunkler als die Haut daneben; ein
// Pigmentfleck, den wir ja messen wollen, ist 3 bis 10 dunkler. Ein Schnitt
// bei 20 trennt beides sauber. Nach oben schneidet 25 den Glanzreflex weg -
// den zaehlt glanzAnteil() ohnehin gesondert, und als Helligkeit wuerde er
// die Textur aufblasen.
export const HAUT_BAND = Object.freeze({ dunkler: 20, heller: 25 });

export function hautPunkteInZone(bild, umriss, { istHaut, band = HAUT_BAND }) {
  const roh = [];
  fuerJedenPunktImPolygon(bild, umriss, (q) => {
    const r = bild.data[q], g = bild.data[q + 1], b = bild.data[q + 2];
    if (!istHaut(r, g, b)) return;
    roh.push({ q, hell: 0.2126 * r + 0.7152 * g + 0.0722 * b });
  });
  if (roh.length < 12) return { stellen: [], anteilHaut: 0, roh: roh.length };

  const hellwerte = roh.map((p) => p.hell).sort((a, b) => a - b);
  const mitte = hellwerte[Math.floor(hellwerte.length / 2)];

  const stellen = [];
  for (const p of roh) {
    if (p.hell < mitte - band.dunkler) continue;
    if (p.hell > mitte + band.heller) continue;
    stellen.push(p.q);
  }
  return { stellen, anteilHaut: stellen.length / roh.length, roh: roh.length, mittelHell: mitte };
}

// Ein Rechteck als Umriss - fuer die Zonen, die weiter als Rechteck
// beschrieben sind.
export function rechteckUmriss(r) {
  return [
    { x: r.x, y: r.y },
    { x: r.x + r.w, y: r.y },
    { x: r.x + r.w, y: r.y + r.h },
    { x: r.x, y: r.y + r.h }
  ];
}

// Wie viele Bildpunkte eine Zone mindestens braucht.
//
// Darunter wird nicht geschaetzt, sondern null gemeldet. Ein baertiges Kinn
// hat keine messbare Haut - dann steht im Befund kein Kinnwert, und das ist
// die richtige Antwort. Eine erfundene Zahl waere schlimmer als eine
// fehlende: Sie geht in den Mittelwert ein, und niemand sieht es ihr an.
export const MINDEST_HAUTPUNKTE = 90;
