// Fotos fuer den Chat verkleinern - Laden (apps/lifeskin-shop/chat.js) und
// Heart (apps/mnyra-heart/heart-chat.js) nutzen dieselbe Rechnung.
import { CHAT_BILD_MAX } from "./lifeskin-chat.js";

// ── Fotos: verkleinern, bevor sie hinausgehen ─────────────────────────
// 1280 px Kante, JPEG; wird es zu gross, sinkt die Qualitaet stufenweise.
export async function bildVerkleinern(datei, { kante = 1280, max = CHAT_BILD_MAX - 20000 } = {}) {
  const url = URL.createObjectURL(datei);
  try {
    const bild = await new Promise((fertig, fehler) => {
      const img = new Image();
      img.onload = () => fertig(img);
      img.onerror = () => fehler(new Error("Bild nicht lesbar"));
      img.src = url;
    });
    const f = Math.min(1, kante / Math.max(bild.naturalWidth, bild.naturalHeight));
    const leinwand = document.createElement("canvas");
    leinwand.width = Math.max(1, Math.round(bild.naturalWidth * f));
    leinwand.height = Math.max(1, Math.round(bild.naturalHeight * f));
    const ctx = leinwand.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, leinwand.width, leinwand.height);
    ctx.drawImage(bild, 0, 0, leinwand.width, leinwand.height);
    for (const q of [0.8, 0.68, 0.55, 0.42, 0.3]) {
      const daten = leinwand.toDataURL("image/jpeg", q);
      if (daten.length <= max) return daten;
    }
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

