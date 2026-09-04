// Wo im Bild das Gesicht sitzt - ohne fremde Bibliothek.
//
// Warum nicht MediaPipe: Die Sicherheitsregeln von mnyra.com erlauben Skripte
// nur vom eigenen Server (script-src 'self'). Ein Netz vom CDN faellt damit
// aus, und drei Megabyte WASM in das Repo zu legen waere fuer die erste
// Fassung ein hoher Preis - zumal sie auf aelteren iPhones ohnehin auf die
// langsamere Grafikschnittstelle zurueckfaellt.
//
// Der Weg hier kommt ohne alles aus und ist fuer diesen Zweck genau genug:
//
// 1. Der Besucher legt sein Gesicht in das Oval - das ist die grobe Lage.
// 2. Im oberen Drittel des Ovals werden die beiden Augen gesucht. Augen sind
//    die dunkelsten zusammenhaengenden Stellen dort, sie liegen waagerecht
//    nebeneinander und ungefaehr symmetrisch zur Mitte.
// 3. Aus Augenpaar und Oval werden alle Punkte aufgespannt, die der Messkern
//    braucht.
//
// Der Augenabstand ist dabei das Mass fuer alles Weitere. Genau deshalb reicht
// diese Genauigkeit: Der Messkern braucht keine 468 Punkte, er braucht eine
// verlaessliche Skala und eine verlaessliche Mitte.
//
// Wenn spaeter doch ein Netz dazukommt, ersetzt es genau eine Funktion:
// `findePunkte`. Alles andere bleibt, wie es ist.

import { PUNKT } from "./lifeskin-metrics.js";

// Graustufen aus RGBA, auf ein grobes Raster heruntergerechnet.
//
// Grob ist hier ein Vorteil: Wimpern, Sensorrauschen und einzelne dunkle
// Haare verschwinden, die Augenhoehle bleibt.
export function grauRaster(bild, rasterBreite = 64) {
  const faktor = bild.width / rasterBreite;
  const rasterHoehe = Math.max(1, Math.round(bild.height / faktor));
  const werte = new Float64Array(rasterBreite * rasterHoehe);

  for (let ry = 0; ry < rasterHoehe; ry += 1) {
    for (let rx = 0; rx < rasterBreite; rx += 1) {
      const x0 = Math.floor(rx * faktor);
      const y0 = Math.floor(ry * faktor);
      const x1 = Math.min(bild.width, Math.floor((rx + 1) * faktor));
      const y1 = Math.min(bild.height, Math.floor((ry + 1) * faktor));

      let summe = 0;
      let anzahl = 0;
      for (let y = y0; y < y1; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          const q = (y * bild.width + x) * 4;
          // Wahrgenommene Helligkeit, nicht der Mittelwert der Kanaele.
          summe += 0.2126 * bild.data[q] + 0.7152 * bild.data[q + 1] + 0.0722 * bild.data[q + 2];
          anzahl += 1;
        }
      }
      werte[ry * rasterBreite + rx] = anzahl ? summe / anzahl : 0;
    }
  }
  return { werte, breite: rasterBreite, hoehe: rasterHoehe, faktor };
}

// Die dunkelste Stelle in einem Bereich des Rasters.
function dunkelstePunkt(raster, x0, x1, y0, y1) {
  let besterWert = Infinity;
  let bestX = -1;
  let bestY = -1;
  for (let y = Math.max(0, y0); y < Math.min(raster.hoehe, y1); y += 1) {
    for (let x = Math.max(0, x0); x < Math.min(raster.breite, x1); x += 1) {
      const wert = raster.werte[y * raster.breite + x];
      if (wert < besterWert) { besterWert = wert; bestX = x; bestY = y; }
    }
  }
  return bestX < 0 ? null : { x: bestX, y: bestY, wert: besterWert };
}

// Das Augenpaar im oberen Bereich des Ovals.
//
// Gesucht wird links und rechts der Mitte getrennt - so kann nicht zweimal
// dasselbe Auge gefunden werden, was bei einer freien Suche nach den zwei
// dunkelsten Punkten regelmaessig passiert.
export function findeAugen(bild, oval) {
  const raster = grauRaster(bild);
  const zuRaster = (wert) => wert / raster.faktor;

  const ovalX = zuRaster(oval.x);
  const ovalB = zuRaster(oval.w);
  const mitteX = ovalX + ovalB / 2;

  // Gesucht wird im Bild, nicht im Oval.
  //
  // Das Oval ist die Anweisung an den Besucher, nicht die Grenze fuer die
  // Suche: Wer viel zu nah herangeht, haette sonst gar keine Augen im
  // Suchfeld - und bekaeme "kein Gesicht erkannt" statt "etwas weiter weg".
  // Der Unterschied entscheidet, ob jemand weitermacht oder aufgibt.
  const y0 = Math.floor(raster.hoehe * 0.18);
  const y1 = Math.ceil(raster.hoehe * 0.58);

  const linkes = dunkelstePunkt(
    raster,
    Math.floor(raster.breite * 0.08), Math.ceil(raster.breite * 0.46), y0, y1
  );
  const rechtes = dunkelstePunkt(
    raster,
    Math.floor(raster.breite * 0.54), Math.ceil(raster.breite * 0.92), y0, y1
  );
  if (!linkes || !rechtes) return null;

  // Wie stark hebt sich das Auge von seiner Umgebung ab? Ist der Unterschied
  // zu klein, war es keine Augenhoehle, sondern ein Schatten oder gar nichts.
  const umgebung = [];
  for (let y = y0; y < y1; y += 1) {
    for (let x = Math.floor(raster.breite * 0.08); x < Math.ceil(raster.breite * 0.92); x += 1) {
      if (y >= 0 && y < raster.hoehe && x >= 0 && x < raster.breite) {
        umgebung.push(raster.werte[y * raster.breite + x]);
      }
    }
  }
  if (!umgebung.length) return null;
  const mittel = umgebung.reduce((s, v) => s + v, 0) / umgebung.length;
  const kontrast = Math.min(mittel - linkes.wert, mittel - rechtes.wert);

  const augeLinks = { x: linkes.x * raster.faktor, y: linkes.y * raster.faktor };
  const augeRechts = { x: rechtes.x * raster.faktor, y: rechtes.y * raster.faktor };

  const augenabstand = Math.abs(augeRechts.x - augeLinks.x);
  const hoehenversatz = Math.abs(augeRechts.y - augeLinks.y);
  const mitteAugen = (augeLinks.x + augeRechts.x) / 2;
  const versatzZurMitte = Math.abs(mitteAugen - mitteX * raster.faktor);

  return {
    augeLinks,
    augeRechts,
    augenabstand,
    kontrast,
    // Kopf gerade? Ein starker Hoehenversatz heisst schraeg gehaltenes Handy.
    schraeglage: augenabstand > 0 ? hoehenversatz / augenabstand : 1,
    // Mittig? Sonst schaut der Kopf zur Seite und die Wangen sind ungleich
    // beleuchtet - dann stimmt der Seitenvergleich nicht mehr.
    aussermittig: augenabstand > 0 ? versatzZurMitte / augenabstand : 1
  };
}

export const GRENZEN = Object.freeze({
  helligkeitMin: 55,
  helligkeitMax: 205,
  kontrastMin: 18,        // Augen muessen sich abheben
  schaerfeMin: 2.2,       // gegen verwackelte und unscharfe Bilder
  augenabstandMin: 0.22,  // Anteil der Bildbreite - zu weit weg
  augenabstandMax: 0.52,  // zu nah
  schraeglageMax: 0.13,
  aussermittigMax: 0.20,
  bewegungMax: 3.2
});

// Alle Punkte, die der Messkern braucht - aus Augenpaar und Oval.
//
// Die Faktoren sind Proportionen des menschlichen Gesichts, bezogen auf den
// Augenabstand: Nasenspitze rund 0,65 Augenabstaende unter der Augenlinie,
// Mund rund 1,10, Kinn rund 1,75. Sie schwanken von Mensch zu Mensch, aber
// die Zonen sind grosszuegig genug geschnitten, dass das nichts ausmacht -
// und sie schwanken nicht zwischen zwei Aufnahmen derselben Person, worauf
// es hier ankommt.
export function findePunkte(bild, oval) {
  const augen = findeAugen(bild, oval);
  if (!augen) return null;

  const e = augen.augenabstand;
  if (!(e > 8)) return null;
  // Ohne Kontrast keine Augen, und ohne Augen keine Punkte.
  //
  // Auf einer gleichmaessigen Flaeche findet die Suche zwangslaeufig
  // irgendeinen dunkelsten Punkt - zweimal sogar, einen je Haelfte. Ohne
  // diese Sperre entstuenden daraus Zonen mitten im Nichts, und der Messkern
  // wuerde eine Wand vermessen, ohne dass es jemandem auffaellt.
  if (!(augen.kontrast >= GRENZEN.kontrastMin)) return null;

  const augenY = (augen.augeLinks.y + augen.augeRechts.y) / 2;
  const mitteX = (augen.augeLinks.x + augen.augeRechts.x) / 2;

  const punkte = [];
  punkte[PUNKT.augeLinksAussen] = augen.augeLinks;
  punkte[PUNKT.augeRechtsAussen] = augen.augeRechts;
  punkte[PUNKT.nasenwurzel] = { x: mitteX, y: augenY - e * 0.05 };
  punkte[PUNKT.nasenspitze] = { x: mitteX, y: augenY + e * 0.65 };
  punkte[PUNKT.stirnMitte] = { x: mitteX, y: augenY - e * 0.98 };
  punkte[PUNKT.mundLinks] = { x: mitteX - e * 0.37, y: augenY + e * 1.10 };
  punkte[PUNKT.mundRechts] = { x: mitteX + e * 0.37, y: augenY + e * 1.10 };
  punkte[PUNKT.kinnUnten] = { x: mitteX, y: augenY + e * 1.75 };
  punkte[PUNKT.wangeLinksAussen] = { x: mitteX - e * 0.92, y: augenY + e * 0.34 };
  punkte[PUNKT.wangeRechtsAussen] = { x: mitteX + e * 0.92, y: augenY + e * 0.34 };

  return { punkte, augen };
}

// Ist das Bild ueberhaupt brauchbar?
//
// Diese Pruefungen sind der wichtigste Hebel fuer die Wiederholbarkeit. Sie
// sind streng, und das ist Absicht: Eine abgelehnte Aufnahme kostet drei
// Sekunden, eine angenommene schlechte kostet den Befund.

function mittlereHelligkeit(raster) {
  let summe = 0;
  for (let i = 0; i < raster.werte.length; i += 1) summe += raster.werte[i];
  return summe / raster.werte.length;
}

// Schaerfe ueber die mittlere Kantenstaerke. Ein verwackeltes Bild hat weiche
// Kanten, ein scharfes harte.
function schaerfe(raster) {
  let summe = 0;
  let anzahl = 0;
  for (let y = 1; y < raster.hoehe - 1; y += 1) {
    for (let x = 1; x < raster.breite - 1; x += 1) {
      const i = y * raster.breite + x;
      const laplace =
        4 * raster.werte[i] -
        raster.werte[i - 1] - raster.werte[i + 1] -
        raster.werte[i - raster.breite] - raster.werte[i + raster.breite];
      summe += Math.abs(laplace);
      anzahl += 1;
    }
  }
  return anzahl ? summe / anzahl : 0;
}

// Bewegung zwischen zwei Bildern - dafuer reicht das grobe Raster.
export function bewegungZwischen(rasterA, rasterB) {
  if (!rasterA || !rasterB || rasterA.werte.length !== rasterB.werte.length) return Infinity;
  let summe = 0;
  for (let i = 0; i < rasterA.werte.length; i += 1) {
    summe += Math.abs(rasterA.werte[i] - rasterB.werte[i]);
  }
  return summe / rasterA.werte.length;
}

// Die vier Anzeigen unter dem Oval.
//
// Jede sagt nicht nur ob, sondern was zu tun ist - "zu dunkel" hilft, "Fehler"
// nicht.
export function pruefeAufnahme(bild, oval, vorherigesRaster = null) {
  const raster = grauRaster(bild);
  const helligkeit = mittlereHelligkeit(raster);
  const treffer = findePunkte(bild, oval);
  const bewegung = vorherigesRaster ? bewegungZwischen(raster, vorherigesRaster) : 0;
  const scharf = schaerfe(raster);

  const augen = treffer?.augen || null;
  const abstandAnteil = augen ? augen.augenabstand / bild.width : 0;

  const pruefungen = {
    gesicht: Boolean(augen) && augen.kontrast >= GRENZEN.kontrastMin
      && augen.schraeglage <= GRENZEN.schraeglageMax
      && augen.aussermittig <= GRENZEN.aussermittigMax,
    abstand: abstandAnteil >= GRENZEN.augenabstandMin && abstandAnteil <= GRENZEN.augenabstandMax,
    licht: helligkeit >= GRENZEN.helligkeitMin && helligkeit <= GRENZEN.helligkeitMax
      && scharf >= GRENZEN.schaerfeMin,
    ruhe: bewegung <= GRENZEN.bewegungMax
  };

  let hinweis = null;
  if (!pruefungen.gesicht) hinweis = "keinGesicht";
  else if (!pruefungen.abstand) hinweis = abstandAnteil < GRENZEN.augenabstandMin ? "zuFern" : "zuNah";
  else if (!pruefungen.licht) hinweis = helligkeit < GRENZEN.helligkeitMin ? "zuDunkel" : "zuHell";

  return {
    pruefungen,
    bereit: Object.values(pruefungen).every(Boolean),
    hinweis,
    punkte: treffer?.punkte || null,
    messwerte: { helligkeit, schaerfe: scharf, bewegung, abstandAnteil, augen },
    raster
  };
}
