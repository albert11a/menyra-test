// DIE ZBRITJE IM LADEN - Anzeige ueber dem Kaufknopf (08.10., seit 09.10.
// aus Heart: Preis, Ende, Lager; shared/lifeskin-aktion.js).
//
// - shop.js laedt config/shopAktion und startet aktionStarten(); der Preis
//   selbst gilt dort (Set-Preis waehrend der Aktion). Ein abgelaufener
//   Block aus dem HTML geht schon vorher weg (kleines Skript im Block).
// - Restzeit bis zum Ende; danach verschwindet der Block, und beiEnde()
//   laesst den Laden wieder den Set-Preis aus Heart zeigen.
// - Lager aus /api/lifeskin-lager (echte Bestellungen im Laden, fuer alle
//   Besucher gleich). Ohne Antwort keine Lagerzeile - nie eine erfundene Zahl.
// - Bei 0 Sets: "Shitur", und die Kaufknoepfe sind gesperrt, damit niemand
//   ein Set bestellt, das es nicht gibt.
// Nur Darstellung und Sperre - keine Zaehlung, kein Pixel.

import { aktionLaeuft, aktionTexte } from "../../shared/lifeskin-aktion.js";

export const LAGER_ADRESSE = "/api/lifeskin-lager";
export const KAUFKNOEPFE = ".hero [data-set], #setet [data-set], #zgjedhja [data-set], .closing [data-set], #sticky-buy, #kasa-dergo, #menu [data-set]";

export function restzeit(bisMs, jetztMs) {
  const s = Math.max(0, Math.floor((bisMs - jetztMs) / 1000));
  const zwei = (n) => String(n).padStart(2, "0");
  return `${zwei(Math.floor(s / 3600))}:${zwei(Math.floor((s % 3600) / 60))}:${zwei(s % 60)}`;
}

export function lagerText(sete) {
  if (sete <= 0) return { leer: true, html: "Shitur – setet e radhës vijnë së shpejti" };
  return { leer: false, html: `Vetëm edhe <b>${sete === 1 ? "1 set" : `${sete} sete`}</b> në stok` };
}

export function aktionStarten({ dok = globalThis.document, aktion, jetzt = () => Date.now(), holen = globalThis.fetch?.bind(globalThis), beiEnde } = {}) {
  const block = dok?.getElementById?.("aktion");
  if (!block) return null;
  if (!aktionLaeuft(aktion, jetzt())) {
    block.hidden = true;
    return null;
  }
  const bis = Date.parse(aktion.bis);
  const setze = (id, wert) => { const el = dok.getElementById(id); if (el) el.textContent = wert; };
  const t = aktionTexte(aktion, jetzt());
  block.dataset.aktionBis = aktion.bis;
  setze("aktion-plakete", t.plakete);
  setze("aktion-ende", t.ende);
  setze("aktion-cmimi", `${t.cmimi} €`);
  setze("aktion-vecmas", `${t.vecmas} €`);
  setze("aktion-kursen", `−${t.kursen} €`);
  setze("aktion-normal", t.normal);
  for (const id of ["aktion-nga", "aktion-vecmas", "aktion-kursen"]) {
    const el = dok.getElementById(id);
    if (el) el.hidden = !t.kursen;
  }
  block.hidden = false;

  const uhr = dok.getElementById("aktion-mbetur");
  const stok = dok.getElementById("aktion-stok");
  const stokText = dok.getElementById("aktion-stok-tekst");
  let ausverkauft = false;
  if (aktion.sete == null && stok) stok.hidden = true;

  const knoepfe = (gesperrt) => {
    for (const k of dok.querySelectorAll(KAUFKNOEPFE)) {
      if (gesperrt) { k.disabled = true; k.dataset.ausverkauft = ""; }
      else if ("ausverkauft" in k.dataset) { k.disabled = false; delete k.dataset.ausverkauft; }
    }
  };

  let zeitgeber = null, lagerZeit = null;
  const stopp = () => { clearInterval(zeitgeber); clearInterval(lagerZeit); };

  const ticken = () => {
    if (jetzt() >= bis) {
      block.hidden = true;
      knoepfe(false);
      stopp();
      beiEnde?.();
      return;
    }
    if (uhr) uhr.textContent = restzeit(bis, jetzt());
    // shop.js zeichnet Knoepfe neu - die Sperre jede Sekunde nachziehen.
    if (ausverkauft) knoepfe(true);
  };

  const lager = async () => {
    if (aktion.sete == null || !holen || !stok || !stokText) return;
    try {
      const antwort = await holen(LAGER_ADRESSE, { cache: "no-store" });
      const daten = antwort.ok ? await antwort.json() : null;
      if (!daten?.ok || !Number.isFinite(daten.sete)) return;
      const { leer, html } = lagerText(daten.sete);
      stokText.innerHTML = html;
      stok.toggleAttribute("data-leer", leer);
      stok.hidden = false;
      ausverkauft = leer;
      knoepfe(leer);
    } catch { /* ohne Antwort keine Lagerzeile */ }
  };

  zeitgeber = setInterval(ticken, 1000);
  zeitgeber?.unref?.();
  ticken();
  if (jetzt() < bis) {
    lager();
    lagerZeit = setInterval(lager, 60000);
    lagerZeit?.unref?.();
    dok.addEventListener?.("visibilitychange", () => { if (dok.visibilityState === "visible") lager(); });
  }
  return { ticken, lager, stopp };
}

