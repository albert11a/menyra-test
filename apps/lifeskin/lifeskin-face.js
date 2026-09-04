// Wo im Bild das Gesicht sitzt.
//
// ZWEITE FASSUNG. Die erste suchte die dunkelste Stelle links und rechts der
// Mitte und hielt sie fuer die Augen. Im Betrieb ist sie reihenweise
// gescheitert, auch bei gutem Licht - aus einem Grund, der im Nachhinein
// offensichtlich ist:
//
//   Haare sind dunkler als Augen.
//
// Bei dunklem Haar - also bei fast jedem Besucher in Kosovo und Albanien -
// fand die Suche links und rechts Haar statt Auge. Der Abstand dazwischen war
// dann zu gross, der Hoehenunterschied zu gross, und die Seite meldete "kein
// Gesicht erkannt", waehrend der Kunde bestens ausgeleuchtet davorsass. Das
// Testgesicht hatte keine Haare, deshalb fiel es nie auf.
//
// Diese Fassung geht umgekehrt vor: Sie sucht nicht das Dunkle, sondern die
// Haut. Haut hat in einem bestimmten Farbbereich eine sehr eigene Signatur -
// Haare, Kleidung, Wand und Schatten haben sie nicht. Daraus faellt ein
// Gesichtsfeld, und erst darin werden die Augen gesucht. Haar liegt dann
// ausserhalb des Suchbereichs und kann nicht mehr stoeren.
//
// Und die zweite Lehre aus dem Ausfall: Die Augen sind eine Verfeinerung,
// keine Bedingung. Wird das Gesichtsfeld gefunden, laeuft die Analyse - auch
// wenn die Augen unsicher bleiben. Ein Verkaufstrichter, der jemanden
// wegschickt, weil eine Verfeinerung fehlt, verliert Geld an einer Stelle,
// an der er es nicht muesste.

import { PUNKT } from "./lifeskin-metrics.js";

// Raster fuer Haut und Helligkeit. Grob genug fuer Tempo, fein genug, damit
// ein Gesicht nicht in vier Kaestchen passt.
const RASTER_BREITE = 96;

function rasterMasse(bild, rasterBreite = RASTER_BREITE) {
  const faktor = bild.width / rasterBreite;
  return { faktor, breite: rasterBreite, hoehe: Math.max(1, Math.round(bild.height / faktor)) };
}

// Haut oder nicht.
//
// YCbCr trennt Helligkeit von Farbe, und Haut liegt darin - ueber alle
// Hauttoene hinweg - in einem engen Farbfenster. Genau das ist der Grund fuer
// diesen Farbraum: Ein dunkler und ein heller Teint unterscheiden sich stark
// im Y, aber kaum in Cb und Cr. Die Grenzen sind bewusst weit gefasst; lieber
// ein paar Bildpunkte zu viel als ein Gesicht zu wenig.
export function istHaut(r, g, b) {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

  // Y-Untergrenze haelt tiefe Schatten und schwarze Kleidung heraus, ohne
  // dunkle Haut auszuschliessen.
  if (y < 40) return false;
  if (cb < 74 || cb > 132) return false;
  if (cr < 130 || cr > 178) return false;
  // Haut ist immer roetlicher als gruen. Diese Zeile wirft Holz, Sand und
  // manches Beige heraus, die im Farbfenster sonst durchgehen.
  //
  // Was sie nicht heraushaelt: blondes und hellbraunes Haar. Das liegt
  // farblich mitten im Hautbereich, und ueber Farbe allein ist es nicht zu
  // trennen. Die Folge ist ein etwas groesseres Gesichtsfeld - kein Ausfall,
  // denn die Augensuche laeuft innerhalb dieses Feldes und findet die Augen
  // auch dann. Der Test "blondes Haar" haelt das fest.
  return r > g && r > b;
}

// Weissabgleich nach der Grauwelt-Annahme.
//
// Der Grund ist der haeufigste Ausfall ueberhaupt: Gluehlampenlicht faerbt
// das ganze Bild orange, Leuchtstoffroehren gruenlich. Die Haut rutscht
// damit aus ihrem Farbfenster - und die Wand rutscht hinein. Ohne diese
// Korrektur haengt die Erkennung an der Lampe im Raum, und niemand versteht,
// warum es abends im Bad nicht geht und mittags am Fenster schon.
//
// Angenommen wird, dass sich alle Farben eines Bildes im Mittel zu Grau
// ausgleichen. Das stimmt nicht immer, aber die Abweichung ist klein gegen
// den Farbstich, den sie beseitigt.
export function weissabgleichFaktoren(bild, stichprobe = 8) {
  let sr = 0, sg = 0, sb = 0, n = 0;
  for (let y = 0; y < bild.height; y += stichprobe) {
    for (let x = 0; x < bild.width; x += stichprobe) {
      const q = (y * bild.width + x) * 4;
      sr += bild.data[q]; sg += bild.data[q + 1]; sb += bild.data[q + 2];
      n += 1;
    }
  }
  if (!n) return { r: 1, g: 1, b: 1 };
  const mr = sr / n, mg = sg / n, mb = sb / n;
  const mittel = (mr + mg + mb) / 3;
  if (mittel < 8) return { r: 1, g: 1, b: 1 };

  // Begrenzt, damit ein einfarbiges Bild - eine rote Wand, ein blauer
  // Vorhang - nicht in Hautfarbe verwandelt wird.
  const grenze = (f) => Math.max(0.72, Math.min(1.38, f));
  return {
    r: grenze(mittel / Math.max(1, mr)),
    g: grenze(mittel / Math.max(1, mg)),
    b: grenze(mittel / Math.max(1, mb))
  };
}

// Haut- und Helligkeitsraster in einem Durchgang.
//
// `schritt` ueberspringt Bildpunkte innerhalb eines Rasterfeldes. Bei der
// laufenden Pruefung waehrend der Vorschau steht er auf 2 und viertelt damit
// die Arbeit, ohne dass sich am Ergebnis etwas Nennenswertes aendert - das
// ist der Unterschied zwischen einer ruckelnden und einer ruhigen Vorschau.
export function bildRaster(bild, rasterBreite = RASTER_BREITE, { schritt = 1, abgleich = null } = {}) {
  const { faktor, breite, hoehe } = rasterMasse(bild, rasterBreite);
  const haut = new Uint8Array(breite * hoehe);
  const grau = new Float64Array(breite * hoehe);
  const w = abgleich || weissabgleichFaktoren(bild);

  for (let ry = 0; ry < hoehe; ry += 1) {
    for (let rx = 0; rx < breite; rx += 1) {
      const x0 = Math.floor(rx * faktor);
      const y0 = Math.floor(ry * faktor);
      const x1 = Math.min(bild.width, Math.max(x0 + 1, Math.floor((rx + 1) * faktor)));
      const y1 = Math.min(bild.height, Math.max(y0 + 1, Math.floor((ry + 1) * faktor)));

      let sr = 0, sg = 0, sb = 0, anzahl = 0;
      for (let y = y0; y < y1; y += schritt) {
        for (let x = x0; x < x1; x += schritt) {
          const q = (y * bild.width + x) * 4;
          sr += bild.data[q]; sg += bild.data[q + 1]; sb += bild.data[q + 2];
          anzahl += 1;
        }
      }
      if (!anzahl) continue;
      const r = (sr / anzahl) * w.r, g = (sg / anzahl) * w.g, b = (sb / anzahl) * w.b;
      const i = ry * breite + rx;
      // Grau aus den unkorrigierten Werten: Der Weissabgleich soll die
      // Farberkennung retten, nicht die Belichtungspruefung verfaelschen.
      grau[i] = 0.2126 * (sr / anzahl) + 0.7152 * (sg / anzahl) + 0.0722 * (sb / anzahl);
      haut[i] = istHaut(r, g, b) ? 1 : 0;
    }
  }
  return { haut, grau, breite, hoehe, faktor, weissabgleich: w };
}

// Das Gesichtsfeld aus der Hautmaske.
//
// Ueber Zeilen- und Spaltensummen statt ueber zusammenhaengende Flaechen: Das
// ist schneller, kommt ohne Rekursion aus und stoert sich nicht an einer
// Brille oder einem Haarstraehnchen quer ueber der Wange, das die Flaeche
// sonst in zwei Teile zerschnitte.
//
// Die Schwelle liegt bei einem Drittel des Hoechstwertes: Sie folgt damit dem
// Bild statt einer festen Zahl und funktioniert bei einem kleinen Gesicht in
// grossem Abstand genauso wie bei einem formatfuellenden.
export function gesichtsFeld(raster) {
  const { haut, breite, hoehe } = raster;

  const spalten = new Float64Array(breite);
  const zeilen = new Float64Array(hoehe);
  let gesamt = 0;
  for (let y = 0; y < hoehe; y += 1) {
    for (let x = 0; x < breite; x += 1) {
      if (!haut[y * breite + x]) continue;
      spalten[x] += 1; zeilen[y] += 1; gesamt += 1;
    }
  }
  if (gesamt < breite * hoehe * 0.012) return null;

  const spanne = (werte) => {
    let hoechst = 0;
    for (const w of werte) if (w > hoechst) hoechst = w;
    if (!hoechst) return null;
    const schwelle = hoechst * 0.33;
    let von = -1, bis = -1;
    for (let i = 0; i < werte.length; i += 1) {
      if (werte[i] >= schwelle) { if (von < 0) von = i; bis = i; }
    }
    return von < 0 ? null : { von, bis: bis + 1 };
  };

  const x = spanne(spalten);
  const y = spanne(zeilen);
  if (!x || !y) return null;

  const w = x.bis - x.von;
  const h = y.bis - y.von;
  if (w < 6 || h < 8) return null;

  // Ein Gesicht ist hoeher als breit. Ist die Flaeche viel breiter, war es
  // kein Gesicht, sondern eine Wand in Hautfarbe, ein Arm oder zwei Personen.
  //
  // Die Untergrenze war 0,85 und hat Bartgesichter verworfen: Faellt das
  // Kinn aus der Maske, bleibt ein Feld uebrig, das breiter als hoch ist.
  // 0,62 laesst das durch und haelt eine liegende Flaeche - Arm, Wand, zwei
  // Personen nebeneinander - weiterhin heraus.
  const verhaeltnis = h / w;
  if (verhaeltnis < 0.62 || verhaeltnis > 2.4) return null;

  // Wie dicht ist die Flaeche wirklich mit Haut gefuellt? Ein echtes Gesicht
  // fuellt sein Feld gut aus; ein zufaelliges Muster nicht.
  //
  // DIE SCHWELLE STAND AUF 0,42 UND WAR ZU HOCH.
  //
  // Ein Vollbart ist keine Haut. Er nimmt die untere Haelfte des Gesichts aus
  // der Maske heraus, dazu die Wangen bis fast zum Jochbein - bei einem
  // dichten Bart bleibt kaum mehr als Stirn, Augenpartie und Nase uebrig. Im
  // Zielmarkt traegt ein grosser Teil der Maenner genau das. Dieselbe Rechnung
  // gilt fuer eine tief ins Gesicht gezogene Muetze, fuer eine breite Brille
  // und fuer harte Schlagschatten von oben.
  //
  // Ein Feld zu verwerfen, weil ein Bart darin sitzt, heisst: die Haelfte der
  // maennlichen Besucher wegschicken. Die Dichte bleibt als Schutz gegen
  // zufaellige Muster - aber niedrig genug, dass ein Bart durchgeht.
  let innen = 0;
  for (let yy = y.von; yy < y.bis; yy += 1) {
    for (let xx = x.von; xx < x.bis; xx += 1) if (haut[yy * breite + xx]) innen += 1;
  }
  const dichte = innen / (w * h);
  if (dichte < 0.30) return null;

  // Der Schwerpunkt der Hautflaeche im Feld, als Anteil 0 bis 1.
  //
  // Er ist das Signal, aus dem lifeskin-pose.js die Blickrichtung ableitet,
  // wenn die Augen fehlen. Dreht sich der Kopf, verschiebt sich die
  // sichtbare Hautflaeche im Umriss - und zwar auch dann, wenn von den Augen
  // hinter Brille, Wimper oder Schatten nichts zu sehen ist.
  let sx = 0, sy = 0;
  for (let yy = y.von; yy < y.bis; yy += 1) {
    for (let xx = x.von; xx < x.bis; xx += 1) {
      if (!haut[yy * breite + xx]) continue;
      sx += xx - x.von; sy += yy - y.von;
    }
  }
  const schwerpunkt = innen
    ? { x: (sx / innen) / w, y: (sy / innen) / h }
    : { x: 0.5, y: 0.5 };

  return { x: x.von, y: y.von, w, h, dichte, schwerpunkt, hautAnteil: gesamt / (breite * hoehe) };
}

// Das Augenpaar - gesucht innerhalb des Gesichtsfeldes.
//
// Zwei Aenderungen gegenueber der ersten Fassung, und beide sind der Grund,
// warum es jetzt traegt:
//
// 1. Gesucht wird nur im Gesichtsfeld. Haar liegt ausserhalb und kann nicht
//    mehr gewinnen.
// 2. Gesucht wird ein Paar, nicht zweimal ein Punkt. Bewertet wird die
//    Kombination: beide aehnlich dunkel, ungefaehr auf einer Hoehe,
//    symmetrisch zur Gesichtsmitte, mit plausiblem Abstand. Ein einzelner
//    dunkler Fleck - eine Brillenfassung, ein Schatten - gewinnt so nicht
//    mehr gegen ein echtes Paar.
export function findeAugenPaar(raster, feld) {
  const { grau, breite } = raster;

  // Augen sitzen im oberen Drittel bis zur Mitte des Gesichts.
  const y0 = Math.floor(feld.y + feld.h * 0.20);
  const y1 = Math.ceil(feld.y + feld.h * 0.52);
  const fensterX = Math.max(1, Math.round(feld.w * 0.10));
  const fensterY = Math.max(1, Math.round(feld.h * 0.05));

  // Mittlere Helligkeit des Gesichts als Bezug: Ein Auge ist dunkler als die
  // Haut daneben - unabhaengig davon, wie hell insgesamt belichtet wurde.
  let summe = 0, anzahl = 0;
  for (let y = feld.y; y < feld.y + feld.h; y += 1) {
    for (let x = feld.x; x < feld.x + feld.w; x += 1) {
      if (!raster.haut[y * breite + x]) continue;
      summe += grau[y * breite + x]; anzahl += 1;
    }
  }
  if (!anzahl) return null;
  const hautHell = summe / anzahl;

  // Dunkelheit eines Fensters, gemittelt.
  const dunkel = (mx, my) => {
    let s = 0, n = 0;
    for (let y = my - fensterY; y <= my + fensterY; y += 1) {
      for (let x = mx - fensterX; x <= mx + fensterX; x += 1) {
        if (y < 0 || x < 0 || y >= raster.hoehe || x >= breite) continue;
        s += grau[y * breite + x]; n += 1;
      }
    }
    return n ? s / n : 255;
  };

  const mitteX = feld.x + feld.w / 2;
  const linksVon = Math.round(feld.x + feld.w * 0.12);
  const linksBis = Math.round(feld.x + feld.w * 0.44);
  const rechtsVon = Math.round(feld.x + feld.w * 0.56);
  const rechtsBis = Math.round(feld.x + feld.w * 0.88);

  let bestes = null;
  // Schrittweite zwei: Die Augen sind mehrere Rasterfelder breit, ein
  // feineres Raster findet nichts Besseres und kostet das Vierfache.
  for (let ly = y0; ly < y1; ly += 2) {
    for (let lx = linksVon; lx <= linksBis; lx += 2) {
      const dl = dunkel(lx, ly);
      if (dl > hautHell - 6) continue;   // nicht dunkel genug fuer ein Auge

      for (let ry = Math.max(y0, ly - fensterY * 2); ry <= Math.min(y1 - 1, ly + fensterY * 2); ry += 2) {
        for (let rx = rechtsVon; rx <= rechtsBis; rx += 2) {
          const dr = dunkel(rx, ry);
          if (dr > hautHell - 6) continue;

          const abstand = rx - lx;
          const anteil = abstand / feld.w;
          if (anteil < 0.26 || anteil > 0.62) continue;

          const versatz = Math.abs(ry - ly) / Math.max(1, abstand);
          if (versatz > 0.22) continue;

          const symmetrie = Math.abs(((lx + rx) / 2) - mitteX) / feld.w;
          if (symmetrie > 0.14) continue;

          // Bewertung: dunkel sein zaehlt am meisten, danach Aehnlichkeit
          // beider Augen, Geradheit und Symmetrie.
          const tiefe = (hautHell - dl) + (hautHell - dr);
          const unterschied = Math.abs(dl - dr);
          const punkte = tiefe - unterschied * 1.6 - versatz * 90 - symmetrie * 120;

          if (!bestes || punkte > bestes.punkte) {
            bestes = { lx, ly, rx, ry, punkte, tiefe, dl, dr, abstand, versatz, symmetrie };
          }
        }
      }
    }
  }
  if (!bestes) return null;

  const f = raster.faktor;
  return {
    augeLinks: { x: bestes.lx * f, y: bestes.ly * f },
    augeRechts: { x: bestes.rx * f, y: bestes.ry * f },
    augenabstand: bestes.abstand * f,
    // Wie deutlich heben sich die Augen von der Haut ab.
    kontrast: bestes.tiefe / 2,
    schraeglage: bestes.versatz,
    aussermittig: bestes.symmetrie
  };
}

export const GRENZEN = Object.freeze({
  // Nur noch als Messwert im Bericht - als Sperre diente er nicht, weil er
  // ein weit entferntes Gesicht faelschlich zu "kein Gesicht" machte.
  hautAnteilMin: 0.045,
  // Breite des Gesichtsfeldes am Bild - das ist die Abstandspruefung.
  gesichtBreiteMin: 0.26,
  gesichtBreiteMax: 0.86,
  // Helligkeit, gemessen auf der Haut und nicht auf dem ganzen Bild: Eine
  // dunkle Wand hinter einem gut ausgeleuchteten Gesicht darf die Aufnahme
  // nicht mehr blockieren. Genau daran ist die erste Fassung mit
  // gescheitert.
  hautHellMin: 48,
  hautHellMax: 232,
  schaerfeMin: 0.9,
  bewegungMax: 4.5,
  // Wie weit das Gesicht aus der Bildmitte stehen darf.
  versatzMax: 0.22
});

// Alle Punkte, die der Messkern braucht.
//
// Zwei Wege, und der zweite ist der Grund, warum jetzt viel mehr Aufnahmen
// durchgehen: Sind die Augen sicher, ankern die Punkte daran. Sind sie es
// nicht, werden sie aus dem Gesichtsfeld abgeleitet - ein Feld, das nur aus
// Haut entsteht und darum viel seltener fehlt als ein Augenpaar.
export function findePunkte(bild, oval, vorgerechnet = null) {
  const raster = vorgerechnet || bildRaster(bild);
  const feld = gesichtsFeld(raster);
  if (!feld) return null;

  const f = raster.faktor;
  const felR = { x: feld.x * f, y: feld.y * f, w: feld.w * f, h: feld.h * f };

  const augen = findeAugenPaar(raster, feld);

  // Augenabstand: gemessen, wenn moeglich - sonst aus der Gesichtsbreite.
  // Das Verhaeltnis Augenabstand zu Gesichtsbreite liegt beim Menschen sehr
  // eng um 0,45.
  const e = augen ? augen.augenabstand : felR.w * 0.45;
  if (!(e > 8)) return null;

  const mitteX = augen
    ? (augen.augeLinks.x + augen.augeRechts.x) / 2
    : felR.x + felR.w / 2;
  // Die Augenlinie liegt bei etwa 42 % der Gesichtshoehe von oben.
  const augenY = augen
    ? (augen.augeLinks.y + augen.augeRechts.y) / 2
    : felR.y + felR.h * 0.42;

  const punkte = [];
  punkte[PUNKT.augeLinksAussen] = augen ? augen.augeLinks : { x: mitteX - e / 2, y: augenY };
  punkte[PUNKT.augeRechtsAussen] = augen ? augen.augeRechts : { x: mitteX + e / 2, y: augenY };
  punkte[PUNKT.nasenwurzel] = { x: mitteX, y: augenY - e * 0.05 };
  punkte[PUNKT.nasenspitze] = { x: mitteX, y: augenY + e * 0.65 };
  punkte[PUNKT.stirnMitte] = { x: mitteX, y: augenY - e * 0.98 };
  punkte[PUNKT.mundLinks] = { x: mitteX - e * 0.37, y: augenY + e * 1.10 };
  punkte[PUNKT.mundRechts] = { x: mitteX + e * 0.37, y: augenY + e * 1.10 };
  punkte[PUNKT.kinnUnten] = { x: mitteX, y: augenY + e * 1.75 };
  punkte[PUNKT.wangeLinksAussen] = { x: mitteX - e * 0.92, y: augenY + e * 0.34 };
  punkte[PUNKT.wangeRechtsAussen] = { x: mitteX + e * 0.92, y: augenY + e * 0.34 };

  return { punkte, feld: felR, augen, ausAugen: Boolean(augen), raster };
}

// Punkte allein aus dem Oval.
//
// Der letzte Rueckfall, wenn die Erkennung nichts findet und der Besucher
// trotzdem von Hand ausloest. Das Oval ist die Anweisung gewesen, an die er
// sich gehalten hat - also wird angenommen, dass sein Gesicht darin liegt.
// Das Ergebnis ist ungenauer, aber es ist ein Ergebnis. Ein Trichter, der an
// dieser Stelle nichts liefert, hat den Kunden verloren.
export function punkteAusOval(oval) {
  const mitteX = oval.x + oval.w / 2;
  // Die Augenlinie liegt bei etwa 38 % der Ovalhoehe, der Augenabstand bei
  // etwa 45 % der Ovalbreite - dieselben Verhaeltnisse wie beim erkannten
  // Gesicht.
  const augenY = oval.y + oval.h * 0.38;
  const e = oval.w * 0.45;

  const punkte = [];
  punkte[PUNKT.augeLinksAussen] = { x: mitteX - e / 2, y: augenY };
  punkte[PUNKT.augeRechtsAussen] = { x: mitteX + e / 2, y: augenY };
  punkte[PUNKT.nasenwurzel] = { x: mitteX, y: augenY - e * 0.05 };
  punkte[PUNKT.nasenspitze] = { x: mitteX, y: augenY + e * 0.65 };
  punkte[PUNKT.stirnMitte] = { x: mitteX, y: augenY - e * 0.98 };
  punkte[PUNKT.mundLinks] = { x: mitteX - e * 0.37, y: augenY + e * 1.10 };
  punkte[PUNKT.mundRechts] = { x: mitteX + e * 0.37, y: augenY + e * 1.10 };
  punkte[PUNKT.kinnUnten] = { x: mitteX, y: augenY + e * 1.75 };
  punkte[PUNKT.wangeLinksAussen] = { x: mitteX - e * 0.92, y: augenY + e * 0.34 };
  punkte[PUNKT.wangeRechtsAussen] = { x: mitteX + e * 0.92, y: augenY + e * 0.34 };
  return punkte;
}

function hautHelligkeit(raster, feld) {
  let summe = 0, anzahl = 0;
  for (let y = feld.y; y < feld.y + feld.h; y += 1) {
    for (let x = feld.x; x < feld.x + feld.w; x += 1) {
      const i = y * raster.breite + x;
      if (!raster.haut[i]) continue;
      summe += raster.grau[i]; anzahl += 1;
    }
  }
  return anzahl ? summe / anzahl : 0;
}

// Schaerfe im Gesichtsfeld, nicht im ganzen Bild: Eine gemusterte Tapete im
// Hintergrund darf ein verwackeltes Gesicht nicht scharf rechnen.
function schaerfeImFeld(raster, feld) {
  let summe = 0, anzahl = 0;
  const x1 = Math.min(raster.breite - 1, feld.x + feld.w);
  const y1 = Math.min(raster.hoehe - 1, feld.y + feld.h);
  for (let y = Math.max(1, feld.y); y < y1; y += 1) {
    for (let x = Math.max(1, feld.x); x < x1; x += 1) {
      const i = y * raster.breite + x;
      const laplace = 4 * raster.grau[i]
        - raster.grau[i - 1] - raster.grau[i + 1]
        - raster.grau[i - raster.breite] - raster.grau[i + raster.breite];
      summe += Math.abs(laplace); anzahl += 1;
    }
  }
  return anzahl ? summe / anzahl : 0;
}

export function bewegungZwischen(rasterA, rasterB) {
  if (!rasterA || !rasterB || rasterA.grau.length !== rasterB.grau.length) return Infinity;
  let summe = 0;
  for (let i = 0; i < rasterA.grau.length; i += 1) {
    summe += Math.abs(rasterA.grau[i] - rasterB.grau[i]);
  }
  return summe / rasterA.grau.length;
}

// Die Lage des Kopfes im Bild, so wie lifeskin-pose.js sie braucht.
//
// Alles als Anteil, nichts in Bildpunkten: Die Blickrichtung darf nicht davon
// abhaengen, wie gross das Gesicht im Bild steht - sonst waere jeder Schritt
// nach vorn eine scheinbare Kopfdrehung.
export function lageAusFeld(bild, raster, feld, augen) {
  if (!feld) return null;
  const f = raster.faktor;
  const kasten = {
    x: (feld.x * f) / bild.width,
    y: (feld.y * f) / bild.height,
    w: (feld.w * f) / bild.width,
    h: (feld.h * f) / bild.height
  };

  let augenRelativ = null;
  if (augen && kasten.w > 0 && kasten.h > 0) {
    const mx = (augen.augeLinks.x + augen.augeRechts.x) / 2 / bild.width;
    const my = (augen.augeLinks.y + augen.augeRechts.y) / 2 / bild.height;
    augenRelativ = { x: (mx - kasten.x) / kasten.w, y: (my - kasten.y) / kasten.h };
  }

  return {
    feld: kasten,
    augen: augenRelativ,
    schwerpunkt: feld.schwerpunkt || { x: 0.5, y: 0.5 },
    schraeglage: augen ? augen.schraeglage : null
  };
}

// Die vier Anzeigen unter dem Oval.
//
// Jede sagt, was zu tun ist. "Zu dunkel" hilft, "Fehler" nicht.
export function pruefeAufnahme(bild, oval, vorherigesRaster = null, { rasterBreite = RASTER_BREITE, schritt = 1 } = {}) {
  const raster = bildRaster(bild, rasterBreite, { schritt });
  const treffer = findePunkte(bild, oval, raster);
  const feld = treffer ? gesichtsFeld(raster) : null;
  const bewegung = vorherigesRaster ? bewegungZwischen(raster, vorherigesRaster) : 0;

  if (!feld) {
    let hautPunkte = 0;
    let summe = 0;
    for (let i = 0; i < raster.haut.length; i += 1) {
      hautPunkte += raster.haut[i];
      summe += raster.grau[i];
    }
    const anteil = hautPunkte / raster.haut.length;
    const bildHell = summe / raster.grau.length;
    return {
      pruefungen: { gesicht: false, abstand: false, licht: false, ruhe: bewegung <= GRENZEN.bewegungMax },
      bereit: false,
      // "Zu dunkel" nur, wenn es wirklich dunkel ist. Eine helle graue Wand
      // enthaelt ebenfalls keine Haut - wer dort "suchen Sie besseres Licht"
      // liest, dreht die Lampe auf und wundert sich, dass nichts passiert.
      hinweis: bildHell < GRENZEN.hautHellMin ? "zuDunkel" : "keinGesicht",
      punkte: null,
      lage: null,
      messwerte: { hautAnteil: anteil, bildHelligkeit: bildHell, bewegung },
      raster
    };
  }

  const breiteAnteil = (feld.w * raster.faktor) / bild.width;
  const hell = hautHelligkeit(raster, feld);
  const scharf = schaerfeImFeld(raster, feld);
  const mitteFeld = (feld.x + feld.w / 2) / raster.breite;
  const versatz = Math.abs(mitteFeld - 0.5);

  // Ist ein Gesichtsfeld da, gilt das Gesicht als erkannt - auch ein kleines.
  //
  // Die Groesse ist ausschliesslich Sache der Abstandspruefung. Sonst bekaeme
  // jemand, der zu weit weg steht, die Auskunft "kein Gesicht erkannt" und
  // wuesste nicht, dass er nur naeher herangehen muss.
  const pruefungen = {
    gesicht: Boolean(treffer) && versatz <= GRENZEN.versatzMax,
    abstand: breiteAnteil >= GRENZEN.gesichtBreiteMin && breiteAnteil <= GRENZEN.gesichtBreiteMax,
    licht: hell >= GRENZEN.hautHellMin && hell <= GRENZEN.hautHellMax && scharf >= GRENZEN.schaerfeMin,
    ruhe: bewegung <= GRENZEN.bewegungMax
  };

  let hinweis = null;
  if (!pruefungen.gesicht) hinweis = "keinGesicht";
  else if (!pruefungen.abstand) hinweis = breiteAnteil < GRENZEN.gesichtBreiteMin ? "zuFern" : "zuNah";
  else if (!pruefungen.licht) {
    hinweis = hell < GRENZEN.hautHellMin ? "zuDunkel"
      : hell > GRENZEN.hautHellMax ? "zuHell" : "unscharf";
  }

  return {
    pruefungen,
    bereit: Object.values(pruefungen).every(Boolean),
    hinweis,
    punkte: treffer?.punkte || null,
    ausAugen: treffer?.ausAugen || false,
    lage: lageAusFeld(bild, raster, feld, treffer?.augen || null),
    messwerte: {
      hautAnteil: feld.hautAnteil, dichte: feld.dichte, breiteAnteil,
      hautHelligkeit: hell, schaerfe: scharf, bewegung, versatz,
      augen: treffer?.augen || null
    },
    raster
  };
}
