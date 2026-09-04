// Ein Testgesicht, das dem echten aehnlich genug ist, um wehzutun.
//
// Das Testgesicht der ersten Fassung war eine glatte Ellipse in Hautfarbe -
// keine Haare, keine Brauen, kein Hintergrund. Es bestand jede Pruefung,
// waehrend die Erkennung im Betrieb reihenweise scheiterte, weil sie dunkles
// Haar fuer Augen hielt. Ein Testbild ohne Haare kann diesen Fehler nicht
// finden.
//
// Deshalb hat dieses hier alles, woran die erste Fassung zerbrochen ist:
// Haare ueber Stirn und Schlaefen, Augenbrauen ueber den Augen, einen
// Hintergrund, und einen Hautton, der sich einstellen laesst.

export const BREITE = 360;
export const HOEHE = 640;

export const HAUTTOENE = Object.freeze({
  hell:    [236, 199, 175],
  mittel:  [212, 168, 138],
  oliv:    [186, 142, 112],
  dunkel:  [124, 84, 62],
  sehrDunkel: [86, 58, 44]
});

export function baueGesicht({
  hautton = "mittel",
  haarFarbe = [26, 20, 18],      // dunkles Haar - der Normalfall im Zielmarkt
  hintergrund = [128, 132, 138],
  gesichtBreite = 0.42,           // Anteil der Bildbreite
  mitteX = 0.5,
  augenY = 0.36,
  helligkeit = 1.0,
  mitHaar = true,
  mitBrauen = true,
  rauschen = 3
} = {}) {
  const data = new Uint8ClampedArray(BREITE * HOEHE * 4);
  const haut = HAUTTOENE[hautton] || hautton;

  const setze = (x, y, farbe) => {
    if (x < 0 || y < 0 || x >= BREITE || y >= HOEHE) return;
    const q = (y * BREITE + x) * 4;
    data[q] = Math.max(0, Math.min(255, farbe[0] * helligkeit));
    data[q + 1] = Math.max(0, Math.min(255, farbe[1] * helligkeit));
    data[q + 2] = Math.max(0, Math.min(255, farbe[2] * helligkeit));
    data[q + 3] = 255;
  };

  const cx = BREITE * mitteX;
  const gb = BREITE * gesichtBreite;
  const rx = gb / 2;
  const ry = rx * 1.32;                    // Gesicht ist hoeher als breit
  const ay = HOEHE * augenY;
  const cy = ay + ry * 0.16;               // Augen sitzen ueber der Mitte

  for (let y = 0; y < HOEHE; y += 1) {
    for (let x = 0; x < BREITE; x += 1) setze(x, y, hintergrund);
  }

  // Haare: ein groesseres Oval hinter dem Gesicht, oben und an den Seiten
  // sichtbar. Genau das, was die erste Fassung fuer Augen hielt.
  if (mitHaar) {
    const hrx = rx * 1.30;
    const hry = ry * 1.22;
    const hcy = cy - ry * 0.22;
    for (let y = 0; y < HOEHE; y += 1) {
      for (let x = 0; x < BREITE; x += 1) {
        const dx = (x - cx) / hrx;
        const dy = (y - hcy) / hry;
        if (dx * dx + dy * dy <= 1) setze(x, y, haarFarbe);
      }
    }
  }

  // Gesicht
  for (let y = 0; y < HOEHE; y += 1) {
    for (let x = 0; x < BREITE; x += 1) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy > 1) continue;
      const stoerung = rauschen
        ? (Math.sin(x * 0.7) + Math.cos(y * 0.55)) * rauschen : 0;
      setze(x, y, [haut[0] + stoerung, haut[1] + stoerung, haut[2] + stoerung]);
    }
  }

  const augenabstand = gb * 0.45;
  const augen = [
    { x: cx - augenabstand / 2, y: ay },
    { x: cx + augenabstand / 2, y: ay }
  ];

  // Augenbrauen: dunkel, breiter als das Auge, knapp darueber.
  if (mitBrauen) {
    for (const a of augen) {
      const bw = gb * 0.17, bh = gb * 0.035;
      for (let y = -bh; y <= bh; y += 1) {
        for (let x = -bw; x <= bw; x += 1) {
          if ((x * x) / (bw * bw) + (y * y) / (bh * bh) <= 1) {
            setze(Math.round(a.x + x), Math.round(a.y - gb * 0.115 + y), haarFarbe);
          }
        }
      }
    }
  }

  // Augen: helles Weiss mit dunkler Iris - so sieht ein Auge im Graubild aus,
  // naemlich dunkler als die Haut, aber nicht so dunkel wie Haar.
  for (const a of augen) {
    const aw = gb * 0.115, ah = gb * 0.055;
    for (let y = -ah; y <= ah; y += 1) {
      for (let x = -aw; x <= aw; x += 1) {
        if ((x * x) / (aw * aw) + (y * y) / (ah * ah) > 1) continue;
        const px = Math.round(a.x + x), py = Math.round(a.y + y);
        const imAuge = (x * x) / ((aw * 0.42) ** 2) + (y * y) / ((ah * 0.82) ** 2) <= 1;
        setze(px, py, imAuge ? [42, 34, 30] : [226, 224, 220]);
      }
    }
  }

  // Lippen, etwas roetlicher als die Haut.
  const lw = gb * 0.19, lh = gb * 0.055;
  for (let y = -lh; y <= lh; y += 1) {
    for (let x = -lw; x <= lw; x += 1) {
      if ((x * x) / (lw * lw) + (y * y) / (lh * lh) <= 1) {
        setze(Math.round(cx + x), Math.round(ay + gb * 0.52 + y),
          [haut[0] * 0.94, haut[1] * 0.70, haut[2] * 0.70]);
      }
    }
  }

  return {
    bild: { data, width: BREITE, height: HOEHE },
    erwartet: { cx, augenY: ay, augenabstand, gesichtBreite: gb }
  };
}

export const OVAL = { x: BREITE * 0.16, y: HOEHE * 0.14, w: BREITE * 0.68, h: HOEHE * 0.60 };
