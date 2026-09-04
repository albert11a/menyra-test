import test from "node:test";
import assert from "node:assert/strict";

import {
  rgbZuLab,
  zonenAusPunkten,
  messeBild,
  fasseAufnahmenZusammen,
  berechneVerhaeltnisse,
  PUNKT,
  ZONEN
} from "../apps/lifeskin/lifeskin-metrics.js";

// Ein Gesicht, wie das Netz es liefert: nur die Punkte, auf die sich die
// Zonen stuetzen. Die Werte sind ein aufrecht stehender Kopf in einem
// 480x640-Bild.
function testGesicht({ augenabstand = 120, mitteX = 240, augenY = 240 } = {}) {
  const punkte = [];
  const setze = (index, x, y) => { punkte[index] = { x, y }; };

  setze(PUNKT.augeLinksAussen, mitteX - augenabstand / 2, augenY);
  setze(PUNKT.augeRechtsAussen, mitteX + augenabstand / 2, augenY);
  setze(PUNKT.nasenwurzel, mitteX, augenY - 6);
  setze(PUNKT.nasenspitze, mitteX, augenY + 78);
  setze(PUNKT.stirnMitte, mitteX, augenY - 118);
  setze(PUNKT.kinnUnten, mitteX, augenY + 230);
  setze(PUNKT.mundLinks, mitteX - 44, augenY + 140);
  setze(PUNKT.mundRechts, mitteX + 44, augenY + 140);
  setze(PUNKT.wangeLinksAussen, mitteX - 108, augenY + 40);
  setze(PUNKT.wangeRechtsAussen, mitteX + 108, augenY + 40);
  return punkte;
}

// Ein Bild bauen, in dem jede Zone eine gewuenschte Farbe traegt.
function bildMit(punkte, farbeJeZone, { breite = 480, hoehe = 640, grund = [200, 170, 158] } = {}) {
  const data = new Uint8ClampedArray(breite * hoehe * 4);
  for (let i = 0; i < breite * hoehe; i += 1) {
    data[i * 4] = grund[0];
    data[i * 4 + 1] = grund[1];
    data[i * 4 + 2] = grund[2];
    data[i * 4 + 3] = 255;
  }
  const rechtecke = zonenAusPunkten(punkte);
  for (const [zone, farbe] of Object.entries(farbeJeZone)) {
    const r = rechtecke[zone];
    for (let y = Math.round(r.y); y < Math.round(r.y + r.h); y += 1) {
      for (let x = Math.round(r.x); x < Math.round(r.x + r.w); x += 1) {
        if (x < 0 || y < 0 || x >= breite || y >= hoehe) continue;
        const q = (y * breite + x) * 4;
        data[q] = farbe[0]; data[q + 1] = farbe[1]; data[q + 2] = farbe[2]; data[q + 3] = 255;
      }
    }
  }
  return { data, width: breite, height: hoehe };
}

test("Lab-Wandlung trifft die bekannten Eckpunkte", () => {
  assert.ok(Math.abs(rgbZuLab(255, 255, 255).L - 100) < 0.01, "Weiss muss L=100 sein");
  assert.ok(Math.abs(rgbZuLab(0, 0, 0).L) < 0.01, "Schwarz muss L=0 sein");

  const grau = rgbZuLab(128, 128, 128);
  assert.ok(Math.abs(grau.a) < 0.01 && Math.abs(grau.b) < 0.01, "Grau darf keine Farbigkeit haben");

  // Roeter heisst hoeheres a* - darauf beruht die gesamte Roetungsmessung.
  assert.ok(rgbZuLab(210, 150, 140).a > rgbZuLab(190, 170, 160).a);
});

test("die Zonen liegen im Gesicht und ueberlappen einander nicht", () => {
  const punkte = testGesicht();
  const zonen = zonenAusPunkten(punkte);

  for (const name of ZONEN) {
    const r = zonen[name];
    assert.ok(r, `Zone fehlt: ${name}`);
    assert.ok(r.w > 4 && r.h > 4, `Zone zu klein: ${name}`);
    assert.ok(r.x >= 0 && r.y >= 0, `Zone ausserhalb des Bildes: ${name}`);
  }

  // Die Wangen duerfen sich nicht beruehren, sonst misst die eine die andere.
  const links = zonen.wangeLinks;
  const rechts = zonen.wangeRechts;
  assert.ok(links.x + links.w <= rechts.x, "Die Wangenzonen ueberlappen");

  // Die Stirn liegt ueber der Nase.
  assert.ok(zonen.stirn.y + zonen.stirn.h <= zonen.nase.y + 1, "Stirn und Nase ueberlappen");
});

test("die Zonen haengen am Augenabstand, nicht an der Bildgroesse", () => {
  // Dieselbe Person naeher an der Kamera: alle Masse skalieren mit, die
  // Verhaeltnisse bleiben. Das ist die Grundlage dafuer, dass der Abstand
  // zur Kamera das Ergebnis nicht veraendert.
  const nah = zonenAusPunkten(testGesicht({ augenabstand: 180 }));
  const fern = zonenAusPunkten(testGesicht({ augenabstand: 90 }));

  const verhaeltnisNah = nah.stirn.w / nah.nase.w;
  const verhaeltnisFern = fern.stirn.w / fern.nase.w;
  assert.ok(
    Math.abs(verhaeltnisNah - verhaeltnisFern) < 0.01,
    "Das Groessenverhaeltnis der Zonen darf nicht am Abstand haengen"
  );
});

test("eine geroetete Wange wird als geroetet gemessen", () => {
  const punkte = testGesicht();
  const bild = bildMit(punkte, {
    wangeLinks: [225, 145, 138],
    wangeRechts: [225, 145, 138]
  });
  const messung = messeBild(bild, punkte);

  assert.ok(messung.wangeLinks.roetung > messung.stirn.roetung + 2,
    "Die geroetete Wange muss deutlich ueber der Stirn liegen");

  const v = berechneVerhaeltnisse(messung);
  assert.ok(v.roetungWangeMinusTzone > 1.6,
    "Der Wangen-Ueberschuss muss die Schwelle fuer empfindliche Haut reissen");
});

test("Licht aendert die Rohwerte, aber nicht die Verhaeltnisse", () => {
  // Das ist der Kern des ganzen Verfahrens. Dasselbe Gesicht, einmal hell
  // und einmal dunkel aufgenommen: Die Absolutwerte muessen sich
  // unterscheiden, das Verhaeltnis der Zonen zueinander darf es nicht.
  const punkte = testGesicht();

  const hell = bildMit(punkte, { wangeLinks: [228, 150, 142], wangeRechts: [228, 150, 142] },
    { grund: [205, 175, 163] });
  const dunkel = bildMit(punkte, { wangeLinks: [160, 105, 99], wangeRechts: [160, 105, 99] },
    { grund: [144, 123, 114] });

  const mHell = messeBild(hell, punkte);
  const mDunkel = messeBild(dunkel, punkte);

  assert.ok(mHell.wangeLinks.helligkeit > mDunkel.wangeLinks.helligkeit + 10,
    "Die Aufnahmen muessen sich in der Helligkeit klar unterscheiden");

  const vHell = berechneVerhaeltnisse(mHell);
  const vDunkel = berechneVerhaeltnisse(mDunkel);

  // Beide zeigen: Wange roeter als T-Zone. Die Groesse darf wandern, das
  // Vorzeichen und die Aussage nicht.
  assert.ok(vHell.roetungWangeMinusTzone > 0 && vDunkel.roetungWangeMinusTzone > 0,
    "Die Aussage 'Wange roeter als T-Zone' muss in beiden Lichtern gelten");
});

test("dieselbe Aufnahme ergibt dieselbe Messung", () => {
  const punkte = testGesicht();
  const bild = bildMit(punkte, { wangeLinks: [220, 150, 140] });

  const a = messeBild(bild, punkte);
  const b = messeBild(bild, punkte);
  assert.deepEqual(a, b, "Die Messung muss bei gleichem Bild Zeichen fuer Zeichen gleich sein");
});

test("der Median wirft den Ausreisser unter drei Aufnahmen heraus", () => {
  const punkte = testGesicht();
  const normal = messeBild(bildMit(punkte, { wangeLinks: [215, 152, 143] }), punkte);
  // Ein Scheinwerfer trifft die zweite Aufnahme.
  const stoerung = messeBild(bildMit(punkte, { wangeLinks: [255, 250, 248] }), punkte);

  const zusammen = fasseAufnahmenZusammen([normal, stoerung, normal]);
  assert.ok(
    Math.abs(zusammen.wangeLinks.helligkeit - normal.wangeLinks.helligkeit) < 0.01,
    "Der Median muss die gestoerte Aufnahme verwerfen"
  );
});

test("fehlende Gesichtspunkte werden benannt, nicht verschwiegen", () => {
  const punkte = testGesicht();
  delete punkte[PUNKT.nasenwurzel];
  assert.throws(() => zonenAusPunkten(punkte), /nasenwurzel/);
});
