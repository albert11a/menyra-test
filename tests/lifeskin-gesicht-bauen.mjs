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
//
// DAZUGEKOMMEN, nachdem die zweite Fassung im Betrieb ebenfalls "kein
// Gesicht" gemeldet hat, obwohl eines davorsass:
//
//   `bart`   - ein Vollbart nimmt die untere Gesichtshaelfte aus der
//              Hautmaske. Genau daran ist die zweite Fassung gescheitert,
//              und ein glattrasiertes Testgesicht kann das nicht finden.
//   `blickX` - der Kopf dreht sich zur Seite. Die abgewandte Haelfte wird
//              schmaler, die zugewandte breiter, und die Augen wandern mit.
//   `blickY` - dasselbe fuer oben und unten.
//
// Die beiden Blickwinkel sind keine echte 3D-Ansicht. Sie bilden die zwei
// Dinge nach, die eine Drehung im flachen Bild ueberhaupt ausmachen - und die
// leicht falsch herum gebaut sind:
//
//   1. Der Kopfumriss bleibt, wo er ist. Der Kopf sitzt auf einem Hals; er
//      dreht sich, er wandert nicht durchs Bild. Wandert der Umriss mit den
//      Augen mit, hebt sich beides auf und kein Signal bleibt uebrig.
//   2. Augen, Nase und Mund wandern in diesem stehenden Umriss zur
//      zugewandten Seite, und auf der abgewandten Seite verschwindet ein
//      Streifen Haut hinter Wange und Haar.
//
// Auf einem gedachten Zylinderkopf sind das rund 0,37 Radien Verschiebung
// gegen 0,16 Radien Verdeckung bei etwa 25 Grad - dieses Verhaeltnis steht
// unten in den beiden Faktoren.

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
  bart = false,
  bartFarbe = [34, 27, 24],
  blickX = 0,
  blickY = 0,
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

  // Gesicht: ein stehender Umriss, aus dem auf der abgewandten Seite ein
  // Streifen herausfaellt.
  const verdecktX = Math.abs(blickX) * rx * 0.35;
  const verdecktY = Math.abs(blickY) * ry * 0.35;
  const imGesicht = (x, y) => {
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    if (dx * dx + dy * dy > 1) return false;
    // Bei einer Drehung nach rechts liegt die abgewandte Seite links.
    if (blickX > 0 && x < cx - rx + verdecktX) return false;
    if (blickX < 0 && x > cx + rx - verdecktX) return false;
    if (blickY > 0 && y > cy + ry - verdecktY) return false;
    if (blickY < 0 && y < cy - ry + verdecktY) return false;
    return true;
  };

  for (let y = 0; y < HOEHE; y += 1) {
    for (let x = 0; x < BREITE; x += 1) {
      if (!imGesicht(x, y)) continue;
      const stoerung = rauschen
        ? (Math.sin(x * 0.7) + Math.cos(y * 0.55)) * rauschen : 0;
      setze(x, y, [haut[0] + stoerung, haut[1] + stoerung, haut[2] + stoerung]);
    }
  }

  // Die Augen wandern im stehenden Umriss zur zugewandten Seite und ruecken
  // dabei zusammen: Aus dem Winkel gesehen steht der Augenabstand verkuerzt.
  const augenMitteX = cx + blickX * rx * 0.80;
  const augenMitteY = ay + blickY * ry * 0.80;
  const augenabstand = gb * 0.45 * (1 - Math.abs(blickX) * 0.30);
  const augen = [
    { x: augenMitteX - augenabstand / 2, y: augenMitteY },
    { x: augenMitteX + augenabstand / 2, y: augenMitteY }
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

  const mundX = augenMitteX;
  const mundY = augenMitteY + gb * 0.52;

  // Vollbart: alles ab knapp unter den Augen, der Mund bleibt frei.
  //
  // Das ist keine Ausschmueckung. Ein dichter Bart loescht Kinn, Kiefer und
  // die halben Wangen aus der Hautmaske - genau die Flaeche, ueber die die
  // Erkennung ihr Gesichtsfeld aufspannt.
  if (bart) {
    for (let y = 0; y < HOEHE; y += 1) {
      for (let x = 0; x < BREITE; x += 1) {
        if (!imGesicht(x, y)) continue;
        if (y < augenMitteY + gb * 0.20) continue;
        const mx = (x - mundX) / (gb * 0.21), my = (y - mundY) / (gb * 0.065);
        if (mx * mx + my * my <= 1) continue;
        setze(x, y, bartFarbe);
      }
    }
  }

  // Lippen, etwas roetlicher als die Haut.
  const lw = gb * 0.19, lh = gb * 0.055;
  for (let y = -lh; y <= lh; y += 1) {
    for (let x = -lw; x <= lw; x += 1) {
      if ((x * x) / (lw * lw) + (y * y) / (lh * lh) <= 1) {
        setze(Math.round(mundX + x), Math.round(mundY + y),
          [haut[0] * 0.94, haut[1] * 0.70, haut[2] * 0.70]);
      }
    }
  }

  return {
    bild: { data, width: BREITE, height: HOEHE },
    erwartet: { cx, augenY: augenMitteY, augenMitteX, augenabstand, gesichtBreite: gb }
  };
}

export const OVAL = { x: BREITE * 0.16, y: HOEHE * 0.14, w: BREITE * 0.68, h: HOEHE * 0.60 };
