// SKINREACT AUTO-FREIGABE MIT STOPP-FENSTER (03.10., Entscheidung Inhaber).
//
// "Wir schauen uns alle Fotos die ganze Zeit an - deswegen 5 Sekunden
// Verzoegerung; sollte es nicht stimmen, stoppen wir. Aber es muss auto
// sein."
//
// Steht der Schalter Përputhja auf Auto, gibt Heart einen neuen
// SkinReact-Fall nach AUTO_WARTEN_MS mit 95-100 % frei - ueber denselben
// Bericht wie "Dërgo" (skinreactFreigabe). Bis dahin laeuft in der Zeile
// und unten in Heart ein Countdown mit "Stopp". Gestoppt wird der Fall
// manuell: Stufe waehlen, Dërgo. Wer im Countdown die Stufe von Hand
// aendert, hat damit ebenfalls uebernommen.
//
// IN HEART UND AUF DEM SERVER: Ist Heart offen, laeuft hier der Countdown
// mit Stopp. Denselben Timer gibt es auf dem Server, damit es auch ohne
// offenes Heart freigibt (functions/lifeskin-skinreact-auto.js, Wunsch
// Inhaber: "so als waere Heart offen"). Beide lesen den Bericht vor dem
// Schreiben in einer Transaktion - nichts doppelt, ein Stopp gilt ueberall
// (gibSkinreactAutoFrei, heart-lifeskin-adapter.js).
//
// Nur Faelle, die NACH dem Einschalten von Auto kamen - das Einschalten
// gibt keinen alten Rueckstand frei.
//
// Dieses Modul rechnet nur; Takt und Schreiben stehen in heart.js.
import { istSkinreact, skinreactErgebnis } from "../../shared/lifeskin-skinreact.js";

export const AUTO_WARTEN_MS = 5000;
export const AUTO_BEREICH = "95-100";

// Der Stand eines Falls: null (keine Automatik), { gestoppt: true },
// { manuell: true } (jemand hat von Hand gewaehlt) oder { rest } in ms.
export function autoStand(sitzung, bericht, {
  modus = "hand", autoSeit = "", gesehenAm = 0, jetzt = Date.now(), gestoppt = false, entwurf = false
} = {}) {
  if (modus !== "auto" || !istSkinreact(sitzung)) return null;
  if (skinreactErgebnis(bericht)) return null;
  const seit = Date.parse(String(autoSeit || ""));
  const angelegt = Date.parse(String(sitzung?.createdAt || ""));
  if (!Number.isFinite(seit) || !Number.isFinite(angelegt) || angelegt < seit) return null;
  if (gestoppt || bericht?.skinreactAuto?.gestoppt === true) return { gestoppt: true };
  if (entwurf) return { manuell: true };
  const ab = Number(gesehenAm) || jetzt;
  return { rest: Math.max(0, ab + AUTO_WARTEN_MS - jetzt) };
}

// Was Heart pro Fall anzeigt (state.lifeskin.skinreactAuto[id]).
export function autoAnzeige(stand, sendet = false) {
  if (!stand) return null;
  if (stand.gestoppt) return { gestoppt: true };
  if (stand.manuell) return null;
  return { sek: Math.ceil(stand.rest / 1000), sendet: Boolean(sendet) };
}
