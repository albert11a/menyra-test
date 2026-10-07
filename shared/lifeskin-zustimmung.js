// DIE ZUSTIMMUNG ZU COOKIES UND META-PIXEL - fuer alle LifeSkin-Seiten.
//
// Pixel-Aenderung erlaubt von Albert am 07.10.2026: Meta-Pixel und
// Conversions API melden nur noch nach "Pranoj". Anlass: Meta hat
// lifeskin.ks am 07.10. eingeschraenkt; ohne Abfrage war der Pixel fuer
// Besucher aus der EU (Diaspora) und nach dem Gesetz 06/L-082 in Kosovo
// angreifbar.
//
// WIE ES ZUSAMMENHAENGT:
//   - Die Wahl liegt auf dem Geraet (localStorage), damit niemand auf jeder
//     Seite neu gefragt wird: "ja", "nein" oder leer (noch nicht gefragt).
//   - Der Pixel (apps/lifeskin/lifeskin-pixel.js) liest sie beim Anlegen
//     und fragt hier nach, wenn noch nichts gewaehlt ist.
//   - Die Sitzung (lifeskin-session.js) schreibt sie nach device.zustimmung,
//     und die Conversions API auf dem Server meldet nur bei "ja"
//     (functions/lifeskin-capi-payload.js, metaErlaubt).
//   - Beide Knoepfe sind gleich gross und gleich auffaellig. Ablehnen
//     aendert nichts an der Seite und nichts an der Bestellung.

const SCHLUESSEL = "lifeskin:zustimmung";
export const ZUSTIMMUNG_EREIGNIS = "lifeskin:zustimmung";
const DATENSCHUTZ = "/apps/lifeskin-shop/privatesia.html";

function speicherVon(speicher) {
  if (speicher !== undefined) return speicher;
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function zustimmungLesen(speicher) {
  try {
    const wert = speicherVon(speicher)?.getItem?.(SCHLUESSEL);
    return wert === "ja" || wert === "nein" ? wert : "";
  } catch { return ""; }
}

export function zustimmungSetzen(wert, speicher) {
  const neu = wert === "ja" ? "ja" : "nein";
  try { speicherVon(speicher)?.setItem?.(SCHLUESSEL, neu); } catch { /* dann gilt sie nur fuer diesen Aufruf */ }
  globalThis.__lifeskinZustimmung = neu;
  try {
    globalThis.dispatchEvent?.(new CustomEvent(ZUSTIMMUNG_EREIGNIS, { detail: neu }));
  } catch { /* ohne Ereignis: der naechste Seitenaufruf liest sie */ }
  return neu;
}

// Was gilt: die gespeicherte Wahl oder, bei gesperrtem Speicher, die Wahl
// dieses Aufrufs.
export function zustimmungJetzt(speicher) {
  return zustimmungLesen(speicher) || globalThis.__lifeskinZustimmung || "";
}

const STIL = `
.ls-cookie{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;display:flex;justify-content:center;padding:0 12px calc(12px + env(safe-area-inset-bottom));pointer-events:none;font-family:Arial,Helvetica,sans-serif}
.ls-cookie__karte{pointer-events:auto;width:100%;max-width:456px;background:#fff;color:#123b3e;border:1px solid #dce5e3;border-radius:16px;box-shadow:0 10px 40px #062e3233;padding:16px 16px 14px}
.ls-cookie__karte h2{margin:0 0 6px;font-size:16px;line-height:1.3;font-weight:700;letter-spacing:0}
.ls-cookie__karte p{margin:0;font-size:13px;line-height:1.5;color:#3d5a5c}
.ls-cookie__karte a{color:#123b3e;text-decoration:underline;text-underline-offset:2px}
.ls-cookie__knoepfe{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.ls-cookie__knoepfe button{min-height:48px;border-radius:10px;font:600 15px/1.2 Arial,Helvetica,sans-serif;cursor:pointer;border:1px solid #123b3e;background:#123b3e;color:#fff;-webkit-tap-highlight-color:transparent}
.ls-cookie__knoepfe button:focus-visible{outline:3px solid #087f86;outline-offset:2px}
`;

// Das Fenster unten. Blockiert nichts: Die Seite bleibt bedienbar, auch
// wer es nicht beantwortet, kann bestellen.
export function zustimmungZeigen(dokument = globalThis.document) {
  if (!dokument?.body || dokument.getElementById("ls-cookie")) return null;
  if (!dokument.getElementById("ls-cookie-stil")) {
    const stil = dokument.createElement("style");
    stil.id = "ls-cookie-stil";
    stil.textContent = STIL;
    (dokument.head || dokument.body).appendChild(stil);
  }
  const huelle = dokument.createElement("div");
  huelle.className = "ls-cookie";
  huelle.id = "ls-cookie";
  huelle.innerHTML = `<section class="ls-cookie__karte" role="dialog" aria-labelledby="ls-cookie-titel" aria-describedby="ls-cookie-text">`
    + `<h2 id="ls-cookie-titel">Cookie dhe matja e reklamave</h2>`
    + `<p id="ls-cookie-text">Me pëlqimin tuaj përdorim cookie dhe Meta Pixel për të matur cilat reklama funksionojnë. `
    + `Pa pëlqim nuk i dërgojmë asgjë Metës – faqja dhe porosia funksionojnë njësoj. `
    + `<a href="${DATENSCHUTZ}">Politika e privatësisë</a></p>`
    + `<div class="ls-cookie__knoepfe"><button type="button" data-zustimmung="nein">Refuzo</button>`
    + `<button type="button" data-zustimmung="ja">Pranoj</button></div></section>`;
  // PLATZ DARUNTER: Das Fenster liegt fest unten. Ohne Polster verdeckte es
  // das Ende jeder Seite - in der Kasse den Bestellknopf. Solange es
  // steht, waechst der Seitenfuss um seine Hoehe; danach wie vorher.
  const koerper = dokument.body;
  const polsterVorher = koerper.style.paddingBottom;
  const polstern = () => { koerper.style.paddingBottom = `${huelle.offsetHeight + 16}px`; };
  huelle.addEventListener("click", (ereignis) => {
    const wahl = ereignis.target?.closest?.("[data-zustimmung]")?.dataset?.zustimmung;
    if (!wahl) return;
    huelle.remove();
    koerper.style.paddingBottom = polsterVorher;
    globalThis.removeEventListener?.("resize", polstern);
    zustimmungSetzen(wahl);
  });
  koerper.appendChild(huelle);
  polstern();
  globalThis.addEventListener?.("resize", polstern);
  return huelle;
}

// Nur fragen, wenn noch nicht gewaehlt wurde - und nie im stillen Modus
// (eigene Besuche, shared/lifeskin-still.js).
export function zustimmungAbfragen(dokument = globalThis.document) {
  if (globalThis.__mnyraStill === true || zustimmungJetzt()) return null;
  const zeigen = () => zustimmungZeigen(dokument);
  if (dokument?.readyState === "loading") {
    dokument.addEventListener("DOMContentLoaded", zeigen, { once: true });
    return null;
  }
  return zeigen();
}

// Fuer den Link "Cookie" in der Fusszeile und auf den Rechtsseiten: die
// Wahl jederzeit aendern.
if (typeof globalThis.window !== "undefined") {
  globalThis.lifeskinZustimmungZeigen = () => zustimmungZeigen();
}
