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
//   - Vorne "Pranoj" und der Link "Cilësimet"; abwaehlen dort (siehe
//     VORNE/HINTEN). Ablehnen aendert nichts an Seite und Bestellung.

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
.ls-cookie__karte{pointer-events:auto;width:100%;max-width:456px;background:#fff;color:#123b3e;border:1px solid #dce5e3;border-radius:16px;box-shadow:0 10px 40px #062e3233;padding:14px 16px 10px}
.ls-cookie__karte h2{margin:0 0 4px;font-size:15px;line-height:1.3;font-weight:700;letter-spacing:0}
.ls-cookie__karte p{margin:0;font-size:12.5px;line-height:1.5;color:#3d5a5c}
.ls-cookie__karte a{color:#123b3e;text-decoration:underline;text-underline-offset:2px}
.ls-cookie__ja{display:block;width:100%;min-height:48px;margin-top:12px;border-radius:10px;font:700 15px/1.2 Arial,Helvetica,sans-serif;cursor:pointer;border:0;background:#123b3e;color:#fff;-webkit-tap-highlight-color:transparent}
.ls-cookie__mehr{display:block;margin:6px auto 0;min-height:36px;padding:0 10px;border:0;background:none;font:12px/1.2 Arial,Helvetica,sans-serif;color:#5d7577;text-decoration:underline;text-underline-offset:2px;cursor:pointer}
.ls-cookie__zeile{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid #e6eeec;font-size:13px}
.ls-cookie__zeile:first-of-type{margin-top:10px}
.ls-cookie__zeile small{display:block;color:#5d7577;font-size:11.5px;margin-top:2px}
.ls-cookie__zeile input{width:22px;height:22px;accent-color:#123b3e;flex-shrink:0}
.ls-cookie__knoepfe{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.ls-cookie__knoepfe button{min-height:46px;border-radius:10px;font:600 14px/1.2 Arial,Helvetica,sans-serif;cursor:pointer;border:1px solid #123b3e;background:#fff;color:#123b3e}
.ls-cookie__knoepfe button[data-zustimmung="ja"]{background:#123b3e;color:#fff}
.ls-cookie button:focus-visible{outline:3px solid #087f86;outline-offset:2px}
`;

// WIE DIE MEISTEN SHOPS (07.10., Inhaber: "mach das wie alle anderen
// Shops"): vorne nur "Pranoj" und ein kleiner Link "Cilësimet"; erst dort
// laesst sich Meta abwaehlen ("Ruaj zgjedhjen"). Hinweis an den Inhaber
// gegeben: In der EU gilt Ablehnen erst auf der zweiten Ebene als
// angreifbar. Wer nichts waehlt, wird nicht gemessen.
const VORNE = `<h2 id="ls-cookie-titel">Ne përdorim cookie</h2>`
  + `<p id="ls-cookie-text">Për t’ju shfaqur oferta që ju interesojnë dhe për ta përmirësuar faqen, përdorim cookie dhe Meta Pixel. `
  + `<a href="${DATENSCHUTZ}">Më shumë</a></p>`
  + `<button type="button" class="ls-cookie__ja" data-zustimmung="ja">Pranoj</button>`
  + `<button type="button" class="ls-cookie__mehr" data-cookie-mehr>Cilësimet</button>`;
const HINTEN = `<h2 id="ls-cookie-titel">Cilësimet e cookie-ve</h2>`
  + `<p id="ls-cookie-text">Zgjidhni çka lejoni. <a href="${DATENSCHUTZ}">Politika e privatësisë</a></p>`
  + `<label class="ls-cookie__zeile"><span>Të nevojshme<small>Shporta dhe porosia. Gjithmonë aktive.</small></span><input type="checkbox" checked disabled></label>`
  + `<label class="ls-cookie__zeile"><span>Reklama dhe matje (Meta)<small>Meta Pixel dhe Conversions API.</small></span><input type="checkbox" data-cookie-meta></label>`
  + `<div class="ls-cookie__knoepfe"><button type="button" data-cookie-ruaj>Ruaj zgjedhjen</button>`
  + `<button type="button" data-zustimmung="ja">Pranoj të gjitha</button></div>`;

// Das Fenster unten. Blockiert nichts: Die Seite bleibt bedienbar, auch
// wer es nicht beantwortet, kann bestellen.
export function zustimmungZeigen(dokument = globalThis.document, { einstellungen = false } = {}) {
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
  huelle.innerHTML = `<section class="ls-cookie__karte" role="dialog" aria-labelledby="ls-cookie-titel" aria-describedby="ls-cookie-text"></section>`;
  const karte = huelle.firstElementChild;
  karte.innerHTML = einstellungen ? HINTEN : VORNE;
  // PLATZ DARUNTER: Das Fenster liegt fest unten. Ohne Polster verdeckte es
  // das Ende jeder Seite - in der Kasse den Bestellknopf. Solange es
  // steht, waechst der Seitenfuss um seine Hoehe; danach wie vorher.
  const koerper = dokument.body;
  const polsterVorher = koerper.style.paddingBottom;
  const polstern = () => { koerper.style.paddingBottom = `${huelle.offsetHeight + 16}px`; };
  huelle.addEventListener("click", (ereignis) => {
    const ziel = ereignis.target;
    if (ziel?.closest?.("[data-cookie-mehr]")) {
      karte.innerHTML = HINTEN;
      const meta = karte.querySelector("[data-cookie-meta]");
      if (meta) meta.checked = zustimmungJetzt() === "ja";
      polstern();
      return;
    }
    let wahl = ziel?.closest?.("[data-zustimmung]")?.dataset?.zustimmung;
    if (ziel?.closest?.("[data-cookie-ruaj]")) wahl = karte.querySelector("[data-cookie-meta]")?.checked ? "ja" : "nein";
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
  globalThis.lifeskinZustimmungZeigen = () => zustimmungZeigen(undefined, { einstellungen: true });
}
