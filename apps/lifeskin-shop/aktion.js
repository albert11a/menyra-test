// DIE AKTION HEUTE (08.10., Inhaber): echter Normalpreis 2 x 29 = 58 EUR,
// heute bis 24:00 (Kosovo) fuer 25 EUR, echtes Lager von 2 Sets.
//
// - Restzeit bis zum Ende aus data-aktion-bis; danach verschwindet der
//   Block, und alles ist wie vor der Aktion.
// - Lager aus /api/lifeskin-lager (echte Bestellungen im Laden, fuer alle
//   Besucher gleich). Ohne Antwort keine Lagerzeile - nie eine erfundene Zahl.
// - Bei 0 Sets: "Shitur", und die Kaufknoepfe sind gesperrt, damit niemand
//   ein Set bestellt, das es nicht gibt.
// Nur Darstellung und Sperre - keine Zaehlung, kein Pixel.

export const LAGER_ADRESSE = "/api/lifeskin-lager";
export const KAUFKNOEPFE = ".hero [data-set], #setet [data-set], #zgjedhja [data-set], .closing [data-set], #sticky-buy, #kasa-dergo";

export function restzeit(bisMs, jetztMs) {
  const s = Math.max(0, Math.floor((bisMs - jetztMs) / 1000));
  const zwei = (n) => String(n).padStart(2, "0");
  return `${zwei(Math.floor(s / 3600))}:${zwei(Math.floor((s % 3600) / 60))}:${zwei(s % 60)}`;
}

export function lagerText(sete) {
  if (sete <= 0) return { leer: true, html: "Shitur – setet e radhës vijnë së shpejti" };
  return { leer: false, html: `Vetëm edhe <b>${sete === 1 ? "1 set" : `${sete} sete`}</b> në stok` };
}

export function aktionStarten({ dok = globalThis.document, jetzt = () => Date.now(), holen = globalThis.fetch?.bind(globalThis) } = {}) {
  const block = dok?.getElementById?.("aktion");
  if (!block) return null;
  const bis = Date.parse(block.dataset.aktionBis || "");
  if (!Number.isFinite(bis) || jetzt() >= bis) {
    block.hidden = true;
    return null;
  }
  const uhr = dok.getElementById("aktion-mbetur");
  const stok = dok.getElementById("aktion-stok");
  const stokText = dok.getElementById("aktion-stok-tekst");
  let ausverkauft = false;

  const knoepfe = (gesperrt) => {
    for (const k of dok.querySelectorAll(KAUFKNOEPFE)) {
      if (gesperrt) { k.disabled = true; k.dataset.ausverkauft = ""; }
      else if ("ausverkauft" in k.dataset) { k.disabled = false; delete k.dataset.ausverkauft; }
    }
  };

  const ticken = () => {
    if (jetzt() >= bis) {
      block.hidden = true;
      knoepfe(false);
      clearInterval(zeitgeber);
      return;
    }
    if (uhr) uhr.textContent = restzeit(bis, jetzt());
    // shop.js zeichnet Knoepfe neu - die Sperre jede Sekunde nachziehen.
    if (ausverkauft) knoepfe(true);
  };

  const lager = async () => {
    if (!holen || !stok || !stokText) return;
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

  const zeitgeber = setInterval(ticken, 1000);
  ticken();
  lager();
  const lagerZeit = setInterval(lager, 60000);
  dok.addEventListener?.("visibilitychange", () => { if (dok.visibilityState === "visible") lager(); });
  return { ticken, lager, stopp: () => { clearInterval(zeitgeber); clearInterval(lagerZeit); } };
}

if (globalThis.document?.getElementById?.("aktion")) aktionStarten();
