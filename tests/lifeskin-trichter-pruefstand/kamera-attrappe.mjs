// EINE KAMERA MIT GESICHT - fuer den Pruefstand.
//
// Chromium kann statt einer echten Kamera eine Datei abspielen
// (--use-file-for-fake-video-capture). Die eingebaute Attrappe zeigt einen
// gruenen Kreis ohne Gesicht - daran erkennt das Gesichtsnetz nichts, und
// der Scan kaeme nie ueber "Gesicht ins Oval" hinaus. Diese Datei zeigt
// ein Gesicht: eines der Vorher-Bilder der Landingpage, im Hochformat, wie
// eine Frontkamera am Telefon es liefert.
//
// Das Bild steht still, bis auf ein Wackeln von einem Bildpunkt. Einen
// Kopf, der sich im Kreis dreht, kann ein Standbild nicht spielen - der
// Ring schliesst sich damit nicht von selbst. Gemessen wird damit, was
// ein Mensch sieht, der es NICHT schafft: wann ihm der Ausloeser
// angeboten wird und ob der Weg danach weitergeht.
//
// Das Format ist YUV4MPEG2 (4:2:0): ein Kopf, dann je Bild "FRAME" und
// die drei Ebenen Y, U, V. Umgerechnet wird im Browser, der das JPEG
// ohnehin lesen kann.

import { readFileSync, writeFileSync } from "node:fs";

export async function gesichtsVideo({
  browser, bild, ziel, vorschau = "", breite = 480, hoehe = 640, bilder = 12, fps = 15,
  ausschnitt = null
}) {
  const seite = await browser.newPage();
  try {
    const daten = `data:image/jpeg;base64,${readFileSync(bild).toString("base64")}`;
    const ergebnis = await seite.evaluate(async ({ daten, breite, hoehe, bilder, ausschnitt }) => {
      const img = new Image();
      img.src = daten;
      await img.decode();
      const leinwand = document.createElement("canvas");
      leinwand.width = breite;
      leinwand.height = hoehe;
      const feld = leinwand.getContext("2d", { willReadFrequently: true });
      // Der Ausschnitt um das Gesicht, im Seitenverhaeltnis des Videos.
      const a = ausschnitt || (() => {
        const verhaeltnis = breite / hoehe;
        let h = img.naturalHeight;
        let w = h * verhaeltnis;
        if (w > img.naturalWidth) { w = img.naturalWidth; h = w / verhaeltnis; }
        return { x: (img.naturalWidth - w) / 2, y: (img.naturalHeight - h) / 2, w, h };
      })();
      const ebenen = [];
      let erstes = "";
      for (let i = 0; i < bilder; i += 1) {
        const dx = [0, 1, 0, -1][i % 4];
        const dy = [0, 0, 1, 0][i % 4];
        feld.drawImage(img, a.x + dx, a.y + dy, a.w, a.h, 0, 0, breite, hoehe);
        if (!i) erstes = leinwand.toDataURL("image/png");
        const { data } = feld.getImageData(0, 0, breite, hoehe);
        const y = new Uint8Array(breite * hoehe);
        const u = new Uint8Array((breite / 2) * (hoehe / 2));
        const v = new Uint8Array((breite / 2) * (hoehe / 2));
        for (let p = 0, q = 0; p < data.length; p += 4, q += 1) {
          y[q] = Math.max(0, Math.min(255, Math.round(0.257 * data[p] + 0.504 * data[p + 1] + 0.098 * data[p + 2] + 16)));
        }
        for (let yy = 0; yy < hoehe; yy += 2) {
          for (let xx = 0; xx < breite; xx += 2) {
            const p = (yy * breite + xx) * 4;
            const r = data[p], g = data[p + 1], b = data[p + 2];
            const k = (yy / 2) * (breite / 2) + xx / 2;
            u[k] = Math.max(0, Math.min(255, Math.round(-0.148 * r - 0.291 * g + 0.439 * b + 128)));
            v[k] = Math.max(0, Math.min(255, Math.round(0.439 * r - 0.368 * g - 0.071 * b + 128)));
          }
        }
        const alles = new Uint8Array(y.length + u.length + v.length);
        alles.set(y, 0);
        alles.set(u, y.length);
        alles.set(v, y.length + u.length);
        let s = "";
        for (let j = 0; j < alles.length; j += 0x8000) s += String.fromCharCode(...alles.subarray(j, j + 0x8000));
        ebenen.push(btoa(s));
      }
      return { ebenen, erstes };
    }, { daten, breite, hoehe, bilder, ausschnitt });
    const kopf = Buffer.from(`YUV4MPEG2 W${breite} H${hoehe} F${fps}:1 Ip A1:1 C420jpeg\n`);
    const teile = [kopf];
    for (const ebene of ergebnis.ebenen) {
      teile.push(Buffer.from("FRAME\n"), Buffer.from(ebene, "base64"));
    }
    writeFileSync(ziel, Buffer.concat(teile));
    if (vorschau) writeFileSync(vorschau, Buffer.from(ergebnis.erstes.split(",")[1], "base64"));
    return ziel;
  } finally {
    await seite.close();
  }
}
