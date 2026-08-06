// Business-Composer (Dashboard-Karte "Posto n'Zbulo").
//
// Vollbild-Modal zum Posten eines Feed-Beitrags ("Postim") oder einer Story.
// Bewusst NICHT im App-Render-Zyklus: der Composer besitzt seinen eigenen
// DOM-Knoten und aktualisiert ihn punktuell. Damit
//  - verliert das Textfeld beim Tippen nie den Fokus (die App rendert per
//    innerHTML neu),
//  - gibt es kein Flackern in der Vorschau,
//  - bleibt der Entwurf beim Schliessen erhalten (Knoten wird nur ausgehaengt).
//
// Langsame Verbindungen: Vorschau laeuft komplett lokal (Object-URL), der
// Upload startet erst beim Posten. Waehrend des Postens sind alle Bedienelemente
// gesperrt (ein Submit-Guard verhindert Doppel-Posts auch bei Doppel-Taps).
//
// Die Vorschau ist kein Nachbau: sie rendert mit denselben Bausteinen wie das
// Original (renderFeedCardMarkupCore, renderStoryTileMarkupCore) und mit den
// aus story/index.html abgeleiteten Story-Viewer-Regeln. Angezeigt wird sie in
// einer Buehne, die das Original in Originalbreite aufbaut und nur als Ganzes
// herunterskaliert - dadurch stimmt jedes Mass proportional exakt.

import {
  renderFeedCardMarkupCore
} from "../feed/feed-card-markup-utils.js";
import {
  renderStoryTileMarkupCore,
  renderStoryTileMediaFallbackCore,
  buildStoryTileInnerStyleCore
} from "../feed/story-tile-markup-utils.js";
import {
  STORY_VIEWER_SURFACE_CSS,
  STORY_VIEWER_SURFACE_CLASS
} from "../stories/story-viewer-surface-css.js";

const STYLE_ELEMENT_ID = "mnyraBusinessComposerStyles";
// Die App-Shell ist max-w-md breit; darin steht der echte Feed.
const APP_SHELL_MAX_WIDTH = 448;
const STORY_TILE_TRACK_RATIO = 0.29;
const STORY_TILE_MAX_WIDTH = 120;
const STORY_TILE_HEIGHT = 208;
// Die geoeffnete Story ist eine Vollbild-Flaeche im Hochformat des Geraets
// (.reel ist 100dvh auf einer Seite, die nichts anderes zeigt). Die Vorschau
// nimmt dieses Verhaeltnis vom BILDSCHIRM, nicht vom Browserfenster:
//  - das Fenster ist um die Safari-Leisten kuerzer und viel breiter geschnitten,
//    dadurch bekam ein Hochformat-Foto in der Vorschau dicke schwarze Balken,
//    die es in der echten Story so nie hat,
//  - und es schrumpft, sobald die Tastatur aufgeht - die Vorschau sprang dann
//    beim Tippen in ein anderes Format.
const STORY_FRAME_MIN_RATIO = 0.4;
const STORY_FRAME_MAX_RATIO = 0.7;
const STORY_FRAME_FALLBACK_RATIO = 9 / 16;
const STORY_FRAME_MIN_WIDTH = 320;
const STORY_FRAME_MAX_WIDTH = 480;
// Beide Story-Vorschauen stehen nebeneinander und sind exakt gleich hoch.
const STORY_PREVIEW_GAP = 12;
const STORY_PREVIEW_MAX_HEIGHT = 420;
const ROOT_ELEMENT_ID = "businessComposerOverlayRoot";
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const CAPTION_MAX_LENGTH = 600;
const TOAST_ELEMENT_ID = "mnyraBusinessComposerToast";
const APP_CHROME_COLOR = "#f8fafc";
const MODAL_CHROME_COLOR = "#ffffff";

const TEXT = Object.freeze({
  titlePost: "Postim i ri",
  titleStory: "Story e re",
  submit: "Posto",
  submitBusy: "Duke postuar…",
  close: "Mbyll",
  placeholderPost: "Shkruaj diçka për postimin tënd…",
  placeholderStory: "Shkruaj diçka për story-n tënde…",
  addPhoto: "Shto foto",
  changePhoto: "Ndrysho foton",
  tagProduct: "Etiketo produkt",
  removeProduct: "Hiq produktin",
  productOptional: "Produkti nuk është i detyrueshëm.",
  hintNeedBoth: "Që të postosh, duhen edhe teksti edhe fotoja.",
  hintReady: "Gati për t'u postuar.",
  previewTitle: "Parapamje",
  previewPost: "Si duket në Zbulo",
  previewStoryTile: "Në Zbulo",
  previewStoryFull: "Kur hapet story-a",
  previewEmpty: "Zgjidh një foto për ta parë parapamjen.",
  productMore: "Mehr",
  pickerTitle: "Zgjidh një produkt",
  pickerSearch: "Kërko ushqime ose pije…",
  pickerConfirm: "Zgjidh produktin",
  pickerEmpty: "Nuk u gjet asnjë produkt.",
  pickerLoading: "Duke ngarkuar produktet…",
  pickerError: "Produktet nuk u ngarkuan.",
  pickerRetry: "Provo përsëri",
  errorImageType: "Lejohet vetëm foto (JPG, PNG ose WEBP).",
  errorImageSize: "Fotoja duhet të jetë deri në 15MB.",
  errorNoBusiness: "Kjo llogari nuk është e lidhur me një biznes.",
  errorGeneric: "Postimi dështoi. Provo përsëri.",
  errorOffline: "Nuk ka lidhje me internetin. Provo përsëri.",
  successPost: "Postimi u publikua.",
  successStory: "Story u publikua.",
  captionFallback: "Pa tekst",
  businessFallback: "Biznesi im"
});

const SVG_ATTRS = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

const ICON = Object.freeze({
  close: `<svg ${SVG_ATTRS}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
  image: `<svg ${SVG_ATTRS}><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`,
  tag: `<svg ${SVG_ATTRS}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>`,
  plus: `<svg ${SVG_ATTRS}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`,
  camera: `<svg ${SVG_ATTRS}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,
  check: `<svg ${SVG_ATTRS}><path d="M20 6 9 17l-5-5"></path></svg>`,
  search: `<svg ${SVG_ATTRS}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,
  heart: `<svg ${SVG_ATTRS}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`,
  comment: `<svg ${SVG_ATTRS}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>`
});

export const BUSINESS_COMPOSER_CSS = `
.mnyra-bc {
  position: fixed;
  inset: 0;
  z-index: 90;
  --bc-ink: #0f172a;
  --bc-ink-2: #475569;
  --bc-muted: #94a3b8;
  --bc-line: rgba(15, 23, 42, 0.08);
  --bc-plane: #f8fafc;
  --bc-accent: #4f46e5;
  --bc-accent-soft: #eef2ff;
  --modal-surface: #ffffff;
  background: #ffffff;
  color: var(--bc-ink);
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}
.mnyra-bc * { box-sizing: border-box; }
.mnyra-bc__sheet {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  padding-top: var(--safe-area-top, 0px);
  padding-left: var(--safe-area-left, 0px);
  padding-right: var(--safe-area-right, 0px);
  overflow: hidden;
}
.mnyra-bc__head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--bc-line);
  background: #ffffff;
}
.mnyra-bc__x {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border: none;
  border-radius: 14px;
  background: var(--bc-plane);
  color: var(--bc-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.mnyra-bc__x svg { width: 20px; height: 20px; }
.mnyra-bc__x:active { transform: scale(0.94); }
.mnyra-bc__x:disabled { opacity: 0.4; cursor: not-allowed; }
.mnyra-bc__title {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-bc__submit {
  flex: 0 0 auto;
  min-width: 88px;
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: var(--bc-accent);
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.mnyra-bc__submit:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}
.mnyra-bc__submit:not(:disabled):active { transform: scale(0.96); }
.mnyra-bc__spinner {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #ffffff;
  animation: mnyraBcSpin 0.7s linear infinite;
  display: none;
}
.mnyra-bc[data-busy="1"] .mnyra-bc__spinner { display: block; }
@keyframes mnyraBcSpin { to { transform: rotate(360deg); } }
.mnyra-bc__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 16px 16px calc(var(--safe-area-bottom, 0px) + 32px);
}
.mnyra-bc__compose {
  display: flex;
  align-items: stretch;
  gap: 10px;
}
.mnyra-bc__text {
  flex: 1;
  min-width: 0;
  min-height: 132px;
  resize: none;
  border: 1px solid var(--bc-line);
  border-radius: 20px;
  padding: 14px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
  color: var(--bc-ink);
  background: #ffffff;
  outline: none;
}
.mnyra-bc__text::placeholder { color: var(--bc-muted); font-weight: 600; }
.mnyra-bc__text:focus { border-color: var(--bc-accent); }
.mnyra-bc__tools {
  flex: 0 0 100px;
  width: 100px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mnyra-bc__tool {
  flex: 1;
  min-height: 61px;
  border: 1px solid var(--bc-line);
  border-radius: 20px;
  background: #ffffff;
  color: var(--bc-ink-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 6px;
  cursor: pointer;
  text-align: center;
  overflow: hidden;
}
.mnyra-bc__tool svg { width: 20px; height: 20px; flex: 0 0 auto; }
.mnyra-bc__tool[hidden] { display: none; }
.mnyra-bc__tool:active { transform: scale(0.97); }
.mnyra-bc__tool[data-active="1"] {
  border-color: var(--bc-accent);
  background: var(--bc-accent-soft);
  color: var(--bc-accent);
}
/* Zwei Zeilen statt Abschneiden: "Ndrysho foton" und lange Produktnamen
   bleiben lesbar, die Kachelhoehe aendert sich dadurch nicht. */
.mnyra-bc__tool-label {
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.25;
  max-width: 100%;
  overflow: hidden;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.mnyra-bc__product-chip {
  display: none;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 8px 10px;
  border: 1px solid var(--bc-accent);
  background: var(--bc-accent-soft);
  border-radius: 16px;
}
.mnyra-bc__product-chip[data-visible="1"] { display: flex; }
.mnyra-bc__product-chip-thumb {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  object-fit: cover;
  background: #ffffff;
  flex: 0 0 auto;
}
.mnyra-bc__product-chip-main { flex: 1; min-width: 0; }
.mnyra-bc__product-chip-name {
  font-size: 12px;
  font-weight: 900;
  color: var(--bc-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-bc__product-chip-price {
  font-size: 11px;
  font-weight: 700;
  color: var(--bc-accent);
  margin-top: 1px;
}
.mnyra-bc__product-chip-remove {
  flex: 0 0 auto;
  border: none;
  background: #ffffff;
  color: var(--bc-ink-2);
  border-radius: 999px;
  height: 30px;
  padding: 0 12px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.mnyra-bc__hint {
  margin: 12px 0 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--bc-muted);
  line-height: 1.5;
}
.mnyra-bc__hint[data-tone="ready"] { color: #059669; }
.mnyra-bc__error {
  display: none;
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 16px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.45;
}
.mnyra-bc__error[data-visible="1"] { display: block; }
.mnyra-bc__preview { margin-top: 22px; }
.mnyra-bc__preview-title {
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--bc-ink-2);
}
.mnyra-bc__preview-caption {
  margin: 0 0 8px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--bc-muted);
}
.mnyra-bc__pane { display: none; }
.mnyra-bc__pane[data-visible="1"] { display: block; }
/* Zwei gleich grosse Spalten: die Kachel und die geoeffnete Story stehen
   nebeneinander und sind exakt gleich hoch - es ist eine Vorschau, keine
   Gegenueberstellung von gross und klein. */
.mnyra-bc__story-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${STORY_PREVIEW_GAP}px;
  align-items: start;
}
.mnyra-bc__story-col { min-width: 0; }
/* Buehne: das Original steht darin in Originalbreite und wird als Ganzes
   skaliert. Nichts im Inneren wird umgerechnet - alle Verhaeltnisse bleiben
   exakt so, wie der Nutzer sie spaeter sieht. */
.mnyra-bc__stage {
  position: relative;
  overflow: hidden;
  width: 100%;
}
/* Die beiden Story-Buehnen bekommen ihre Masse aus der Geometrie (gleiche
   Hoehe, eigenes Seitenverhaeltnis) und stehen mittig in ihrer Spalte. */
.mnyra-bc__stage--frame {
  margin-left: auto;
  margin-right: auto;
}
.mnyra-bc__stage--reel {
  border-radius: 18px;
  background: #000;
}
.mnyra-bc__stage-inner {
  transform-origin: top left;
  will-change: transform;
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
}
/* Der Feed-Beitrag steht im echten Feed randlos in der App-Shell. Die Buehne
   hebt darum die Innenabstaende des Modals auf und zeigt ihn 1:1. */
.mnyra-bc__stage--bleed {
  margin-left: -16px;
  margin-right: -16px;
  width: calc(100% + 32px);
}
.mnyra-bc__picker {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: none;
  background: rgba(15, 23, 42, 0.45);
  padding: 24px 12px calc(var(--safe-area-bottom, 0px) + 12px);
}
.mnyra-bc__picker[data-visible="1"] { display: flex; align-items: flex-end; }
.mnyra-bc__picker-sheet {
  width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 -24px 80px rgba(15, 23, 42, 0.28);
}
.mnyra-bc__picker-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px 10px;
}
.mnyra-bc__picker-title { font-size: 14px; font-weight: 900; color: var(--bc-ink); }
.mnyra-bc__picker-search {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px 10px;
  padding: 0 12px;
  height: 42px;
  border-radius: 14px;
  background: var(--bc-plane);
  color: var(--bc-muted);
}
.mnyra-bc__picker-search svg { width: 16px; height: 16px; flex: 0 0 auto; }
.mnyra-bc__picker-search input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--bc-ink);
}
.mnyra-bc__picker-list {
  flex: 1;
  min-height: 96px;
  max-height: 46vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 0 10px;
}
.mnyra-bc__picker-row {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 18px;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.mnyra-bc__picker-row[data-selected="1"] {
  border-color: var(--bc-accent);
  background: var(--bc-accent-soft);
}
.mnyra-bc__picker-thumb {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  object-fit: cover;
  background: var(--bc-plane);
  flex: 0 0 auto;
}
.mnyra-bc__picker-main { flex: 1; min-width: 0; }
.mnyra-bc__picker-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--bc-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-bc__picker-meta {
  font-size: 11px;
  font-weight: 700;
  color: var(--bc-muted);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-bc__picker-mark {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: var(--bc-accent);
  color: #ffffff;
  display: none;
  align-items: center;
  justify-content: center;
}
.mnyra-bc__picker-mark svg { width: 14px; height: 14px; }
.mnyra-bc__picker-row[data-selected="1"] .mnyra-bc__picker-mark { display: flex; }
.mnyra-bc__picker-state {
  padding: 26px 16px;
  text-align: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--bc-muted);
  line-height: 1.5;
}
.mnyra-bc__picker-state button {
  margin-top: 12px;
  border: none;
  border-radius: 999px;
  background: var(--bc-ink);
  color: #ffffff;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 9px 18px;
  cursor: pointer;
}
.mnyra-bc__picker-foot {
  flex: 0 0 auto;
  padding: 10px 16px 16px;
  border-top: 1px solid var(--bc-line);
}
.mnyra-bc__picker-note {
  margin: 0 0 8px;
  font-size: 10px;
  font-weight: 700;
  color: var(--bc-muted);
  text-align: center;
}
.mnyra-bc__picker-confirm {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 16px;
  background: var(--bc-accent);
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
}
.mnyra-bc__picker-confirm:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }
.mnyra-bc[data-busy="1"] .mnyra-bc__body,
.mnyra-bc[data-busy="1"] .mnyra-bc__x { opacity: 0.55; pointer-events: none; }
#${TOAST_ELEMENT_ID} {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(var(--safe-area-bottom, 0px) + 92px);
  z-index: 2147483001;
  max-width: min(88vw, 380px);
  padding: 12px 18px;
  border-radius: 999px;
  background: #0f172a;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.28);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}
#${TOAST_ELEMENT_ID}[data-visible="1"] { opacity: 1; }
@media (min-width: 640px) {
  .mnyra-bc__sheet { max-width: 560px; margin: 0 auto; }
  .mnyra-bc__picker { padding-bottom: 24px; }
  .mnyra-bc__picker-sheet { max-width: 520px; margin: 0 auto; }
}
`;

function ensureStylesInjected(doc) {
  if (!doc || doc.getElementById(STYLE_ELEMENT_ID)) return;
  try {
    const style = doc.createElement("style");
    style.id = STYLE_ELEMENT_ID;
    // Zuerst die Story-Viewer-Regeln (aus story/index.html abgeleitet), dann
    // die Composer-Regeln - so kann die Buehne einzelne Werte gezielt setzen.
    style.textContent = `${STORY_VIEWER_SURFACE_CSS}\n${BUSINESS_COMPOSER_CSS}`;
    doc.head?.appendChild(style);
  } catch {}
}

function ensureOverlayHost(doc) {
  if (!doc?.body) return null;
  let host = doc.getElementById("overlayRoot");
  if (!host) {
    host = doc.createElement("div");
    host.id = "overlayRoot";
    host.style.position = "relative";
    host.style.zIndex = "200";
    host.style.isolation = "isolate";
    doc.body.appendChild(host);
  }
  return host;
}

// Reine Normalisierung eines Menue-Dokuments fuer die Produkt-Auswahl.
export function normalizeComposerProductCore(id = "", raw = {}) {
  const row = raw && typeof raw === "object" ? raw : {};
  const safeId = String(id || "").trim();
  if (!safeId) return null;
  const imageCandidate = row.imageUrl
    || row.image
    || (Array.isArray(row.images) ? row.images[0] : "")
    || "";
  const rawType = String(row.type || row.menuType || "").trim().toLowerCase();
  const type = ["drink", "drinks", "beverage", "getraenke", "getränke"].includes(rawType) ? "drink" : "food";
  return {
    id: safeId,
    name: String(row.name || row.title || "").trim() || safeId,
    price: row.price ?? "",
    category: String(row.category || "").trim(),
    type,
    imageUrl: typeof imageCandidate === "string" ? imageCandidate.trim() : ""
  };
}

// Reiner Filter fuer das Suchfeld der Produkt-Auswahl.
export function filterComposerProductsCore(products = [], term = "") {
  const list = Array.isArray(products) ? products : [];
  const needle = String(term || "").trim().toLowerCase();
  if (!needle) return list;
  return list.filter((product) => {
    const haystack = `${product?.name || ""} ${product?.category || ""}`.toLowerCase();
    return haystack.includes(needle);
  });
}

// Das Seitenverhaeltnis der geoeffneten Story: das Hochformat des Geraets.
// Bewusst aus screen.width/screen.height - die Browserleisten und die Tastatur
// aendern daran nichts, die Vorschau steht also still und zeigt dasselbe
// Format wie die Story-Seite, die den ganzen Bildschirm fuellt.
export function resolveStoryFrameRatioCore(screenWidth = 0, screenHeight = 0) {
  const width = Number(screenWidth) > 0 ? Number(screenWidth) : 0;
  const height = Number(screenHeight) > 0 ? Number(screenHeight) : 0;
  if (width <= 0 || height <= 0) return STORY_FRAME_FALLBACK_RATIO;
  const ratio = Math.min(width, height) / Math.max(width, height);
  if (ratio < STORY_FRAME_MIN_RATIO || ratio > STORY_FRAME_MAX_RATIO) return STORY_FRAME_FALLBACK_RATIO;
  return ratio;
}

// Die Buehne der geoeffneten Story in Originalmassen: so breit wie das Geraet
// im Hochformat (auf dem Desktop auf Telefonbreite begrenzt), so hoch, wie es
// das Seitenverhaeltnis verlangt.
export function resolveStoryFrameSizeCore({ screenWidth = 0, screenHeight = 0, viewportWidth = 0 } = {}) {
  const ratio = resolveStoryFrameRatioCore(screenWidth, screenHeight);
  const raw = Number(viewportWidth) > 0 ? Number(viewportWidth) : STORY_FRAME_MIN_WIDTH;
  const width = Math.round(Math.min(STORY_FRAME_MAX_WIDTH, Math.max(STORY_FRAME_MIN_WIDTH, raw)));
  return { width, height: Math.round(width / ratio) };
}

function scalePreviewBoxCore(width = 0, height = 0, targetHeight = 0) {
  const safeWidth = Number(width) > 0 ? Number(width) : 0;
  const safeHeight = Number(height) > 0 ? Number(height) : 0;
  if (safeWidth <= 0 || safeHeight <= 0) return { width: 0, height: 0, scale: 1 };
  const scale = targetHeight / safeHeight;
  return { width: safeWidth * scale, height: targetHeight, scale };
}

// Beide Story-Vorschauen sind exakt gleich hoch. Die Hoehe ist die groesste,
// bei der BEIDE noch in ihre halbe Spalte passen - dadurch behaelt jede ihr
// eigenes Seitenverhaeltnis und trotzdem ist keine kleiner als die andere.
export function resolveStoryPreviewLayoutCore({
  rowWidth = 0,
  gap = STORY_PREVIEW_GAP,
  tileWidth = 0,
  tileHeight = 0,
  reelWidth = 0,
  reelHeight = 0,
  maxHeight = STORY_PREVIEW_MAX_HEIGHT
} = {}) {
  const columnWidth = Math.max(1, ((Number(rowWidth) || 0) - (Number(gap) || 0)) / 2);
  const limits = [];
  if (Number(maxHeight) > 0) limits.push(Number(maxHeight));
  if (tileWidth > 0 && tileHeight > 0) limits.push(columnWidth * (tileHeight / tileWidth));
  if (reelWidth > 0 && reelHeight > 0) limits.push(columnWidth * (reelHeight / reelWidth));
  const height = limits.length ? Math.max(1, Math.min(...limits)) : 1;
  return {
    height,
    columnWidth,
    tile: scalePreviewBoxCore(tileWidth, tileHeight, height),
    reel: scalePreviewBoxCore(reelWidth, reelHeight, height)
  };
}

// Einzige Wahrheit fuer den "Posto"-Knopf: Text UND Foto muessen da sein.
export function canPublishComposerDraftCore({ caption = "", hasImage = false, submitting = false } = {}) {
  if (submitting) return false;
  if (!hasImage) return false;
  return String(caption || "").trim().length > 0;
}

export function createBusinessComposerController({
  documentObj = null,
  windowObj = null,
  api = {}
} = {}) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const win = windowObj || doc?.defaultView || (typeof window === "undefined" ? null : window);
  const getRestaurantId = typeof api.getRestaurantIdFn === "function" ? api.getRestaurantIdFn : (() => "");
  const getBusinessMeta = typeof api.getBusinessMetaFn === "function"
    ? api.getBusinessMetaFn
    : (() => ({ name: "", logoUrl: "" }));
  const loadProducts = typeof api.loadProductsFn === "function" ? api.loadProductsFn : null;
  const uploadImage = typeof api.uploadImageFn === "function" ? api.uploadImageFn : null;
  const createPost = typeof api.createPostFn === "function" ? api.createPostFn : null;
  const createStory = typeof api.createStoryFn === "function" ? api.createStoryFn : null;
  const afterPublish = typeof api.afterPublishFn === "function" ? api.afterPublishFn : (() => {});
  const formatPrice = typeof api.formatPriceFn === "function" ? api.formatPriceFn : ((value) => String(value ?? ""));
  const optimizeImageUrl = typeof api.getOptimizedImageUrlFn === "function"
    ? api.getOptimizedImageUrlFn
    : ((value) => String(value || "").trim());
  // Escape und Icons kommen aus der App: die Vorschau soll dieselben Symbole
  // zeichnen wie der echte Feed, nicht nachgemalte.
  const escapeHtml = typeof api.escapeHtmlFn === "function"
    ? api.escapeHtmlFn
    : ((value) => String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;"));
  const appIcon = typeof api.iconFn === "function" ? api.iconFn : (() => "");
  const escapeAttr = (value = "") => escapeHtml(String(value ?? ""));

  const drafts = {
    post: { caption: "", file: null, previewUrl: "", product: null },
    story: { caption: "", file: null, previewUrl: "", product: null }
  };
  const productState = { status: "idle", items: [], restaurantId: "" };

  let root = null;
  let nodes = null;
  let mode = "post";
  let open = false;
  let submitting = false;
  let pickerSelection = null;
  let keydownBound = false;
  let viewportSyncBound = false;
  let toastTimer = 0;

  function currentDraft() {
    return drafts[mode] || drafts.post;
  }

  function releasePreviewUrl(url = "") {
    const safe = String(url || "").trim();
    if (!safe.startsWith("blob:")) return;
    try {
      win?.URL?.revokeObjectURL?.(safe);
    } catch {}
  }

  function buildMarkup() {
    return `
      <div class="mnyra-bc__sheet">
        <header class="mnyra-bc__head">
          <button type="button" class="mnyra-bc__x" data-bc-close aria-label="${TEXT.close}" title="${TEXT.close}">${ICON.close}</button>
          <div class="mnyra-bc__title" data-bc-title></div>
          <button type="button" class="mnyra-bc__submit" data-bc-submit disabled>
            <span class="mnyra-bc__spinner"></span><span data-bc-submit-label>${TEXT.submit}</span>
          </button>
        </header>
        <div class="mnyra-bc__body" data-bc-body>
          <div class="mnyra-bc__compose">
            <textarea class="mnyra-bc__text" data-bc-text maxlength="${CAPTION_MAX_LENGTH}" rows="5" enterkeyhint="done"></textarea>
            <div class="mnyra-bc__tools">
              <button type="button" class="mnyra-bc__tool" data-bc-photo>
                ${ICON.image}<span class="mnyra-bc__tool-label" data-bc-photo-label>${TEXT.addPhoto}</span>
              </button>
              <button type="button" class="mnyra-bc__tool" data-bc-tag hidden>
                ${ICON.tag}<span class="mnyra-bc__tool-label" data-bc-tag-label>${TEXT.tagProduct}</span>
              </button>
            </div>
          </div>
          <div class="mnyra-bc__product-chip" data-bc-chip>
            <img class="mnyra-bc__product-chip-thumb" data-bc-chip-img alt="" decoding="async" />
            <div class="mnyra-bc__product-chip-main">
              <div class="mnyra-bc__product-chip-name" data-bc-chip-name></div>
              <div class="mnyra-bc__product-chip-price" data-bc-chip-price></div>
            </div>
            <button type="button" class="mnyra-bc__product-chip-remove" data-bc-chip-remove>${TEXT.removeProduct}</button>
          </div>
          <p class="mnyra-bc__hint" data-bc-hint></p>
          <div class="mnyra-bc__error" data-bc-error role="alert"></div>

          <section class="mnyra-bc__preview">
            <p class="mnyra-bc__preview-title">${TEXT.previewTitle}</p>

            <div class="mnyra-bc__pane" data-bc-pane="post">
              <p class="mnyra-bc__preview-caption">${TEXT.previewPost}</p>
              <div class="mnyra-bc__stage mnyra-bc__stage--bleed" data-bc-stage="post">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="post"></div>
              </div>
            </div>

            <div class="mnyra-bc__pane" data-bc-pane="story">
              <div class="mnyra-bc__story-grid" data-bc-story-grid>
                <div class="mnyra-bc__story-col">
                  <p class="mnyra-bc__preview-caption">${TEXT.previewStoryTile}</p>
                  <div class="mnyra-bc__stage mnyra-bc__stage--frame" data-bc-stage="tile">
                    <div class="mnyra-bc__stage-inner" data-bc-stage-inner="tile"></div>
                  </div>
                </div>
                <div class="mnyra-bc__story-col">
                  <p class="mnyra-bc__preview-caption">${TEXT.previewStoryFull}</p>
                  <div class="mnyra-bc__stage mnyra-bc__stage--frame mnyra-bc__stage--reel" data-bc-stage="reel">
                    <div class="mnyra-bc__stage-inner" data-bc-stage-inner="reel"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="mnyra-bc__picker" data-bc-picker>
          <div class="mnyra-bc__picker-sheet">
            <div class="mnyra-bc__picker-head">
              <span class="mnyra-bc__picker-title">${TEXT.pickerTitle}</span>
              <button type="button" class="mnyra-bc__x" data-bc-picker-close aria-label="${TEXT.close}" title="${TEXT.close}">${ICON.close}</button>
            </div>
            <div class="mnyra-bc__picker-search">
              ${ICON.search}
              <input type="search" data-bc-picker-search placeholder="${TEXT.pickerSearch}" autocomplete="off" />
            </div>
            <div class="mnyra-bc__picker-list" data-bc-picker-list></div>
            <div class="mnyra-bc__picker-foot">
              <p class="mnyra-bc__picker-note">${TEXT.productOptional}</p>
              <button type="button" class="mnyra-bc__picker-confirm" data-bc-picker-confirm disabled>${TEXT.pickerConfirm}</button>
            </div>
          </div>
        </div>
      </div>
      <input type="file" accept="image/*" data-bc-file hidden />
    `;
  }

  function ensureNode() {
    if (root || !doc) return root;
    ensureStylesInjected(doc);
    root = doc.createElement("div");
    root.id = ROOT_ELEMENT_ID;
    root.className = "mnyra-bc modal-overlay";
    root.setAttribute("data-modal-surface", MODAL_CHROME_COLOR);
    root.style.setProperty("--modal-surface", MODAL_CHROME_COLOR);
    root.innerHTML = buildMarkup();
    const q = (selector) => root.querySelector(selector);
    nodes = {
      title: q("[data-bc-title]"),
      close: q("[data-bc-close]"),
      submit: q("[data-bc-submit]"),
      submitLabel: q("[data-bc-submit-label]"),
      body: q("[data-bc-body]"),
      text: q("[data-bc-text]"),
      photo: q("[data-bc-photo]"),
      photoLabel: q("[data-bc-photo-label]"),
      tag: q("[data-bc-tag]"),
      tagLabel: q("[data-bc-tag-label]"),
      chip: q("[data-bc-chip]"),
      chipImg: q("[data-bc-chip-img]"),
      chipName: q("[data-bc-chip-name]"),
      chipPrice: q("[data-bc-chip-price]"),
      chipRemove: q("[data-bc-chip-remove]"),
      hint: q("[data-bc-hint]"),
      error: q("[data-bc-error]"),
      panePost: q('[data-bc-pane="post"]'),
      paneStory: q('[data-bc-pane="story"]'),
      storyGrid: q("[data-bc-story-grid]"),
      stagePost: q('[data-bc-stage="post"]'),
      stagePostInner: q('[data-bc-stage-inner="post"]'),
      stageTile: q('[data-bc-stage="tile"]'),
      stageTileInner: q('[data-bc-stage-inner="tile"]'),
      stageReel: q('[data-bc-stage="reel"]'),
      stageReelInner: q('[data-bc-stage-inner="reel"]'),
      picker: q("[data-bc-picker]"),
      pickerClose: q("[data-bc-picker-close]"),
      pickerSearch: q("[data-bc-picker-search]"),
      pickerList: q("[data-bc-picker-list]"),
      pickerConfirm: q("[data-bc-picker-confirm]"),
      file: q("[data-bc-file]")
    };
    bindNodeEvents();
    return root;
  }

  function setImageNode(node, url = "") {
    if (!node) return;
    const safe = String(url || "").trim();
    if (safe) {
      if (node.getAttribute("src") !== safe) node.setAttribute("src", safe);
      node.style.visibility = "";
    } else {
      node.removeAttribute("src");
      node.style.visibility = "hidden";
    }
  }

  function resolveBusinessMeta() {
    let meta = {};
    try {
      meta = getBusinessMeta() || {};
    } catch {}
    return {
      name: String(meta.name || "").trim() || TEXT.businessFallback,
      logoUrl: String(meta.logoUrl || "").trim(),
      city: String(meta.city || "").trim()
    };
  }

  function resolveShellWidth() {
    const viewport = Number(win?.innerWidth) || APP_SHELL_MAX_WIDTH;
    return Math.min(viewport, APP_SHELL_MAX_WIDTH);
  }

  function resolveStoryTileWidth() {
    return Math.min(resolveShellWidth() * STORY_TILE_TRACK_RATIO, STORY_TILE_MAX_WIDTH);
  }

  function resolveStoryFrameSize() {
    return resolveStoryFrameSizeCore({
      screenWidth: Number(win?.screen?.width) || 0,
      screenHeight: Number(win?.screen?.height) || 0,
      viewportWidth: Number(win?.innerWidth) || 0
    });
  }

  // Breite der Vorschau-Zeile. Solange die Story-Seite eingeblendet ist, misst
  // sie sich selbst; ist sie es (noch) nicht, rechnet die Breite aus dem Body.
  function resolvePreviewRowWidth() {
    const gridWidth = Number(nodes?.storyGrid?.clientWidth) || 0;
    if (gridWidth > 0) return gridWidth;
    const bodyWidth = Number(nodes?.body?.clientWidth) || 0;
    if (bodyWidth > 0) return Math.max(1, bodyWidth - 32);
    return Math.max(1, resolveShellWidth() - 32);
  }

  // --- Vorschau 1: der echte Feed-Beitrag ------------------------------------
  // Gleicher Baustein wie im Feed, gleiche Klassen, gleiche Masse. Nur die
  // Datenattribute fehlen, damit die Vorschau keine App-Handler ausloest.
  function buildPostPreviewMarkup() {
    const draft = drafts.post;
    const meta = resolveBusinessMeta();
    const previewUrl = String(draft.previewUrl || "").trim();
    const heroInner = previewUrl
      ? `<img src="${escapeAttr(previewUrl)}" decoding="async" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`
      : "";
    const heroMediaHtml = `<span class="block w-full h-full appearance-none bg-transparent text-left" style="display:block;width:100%;height:100%;padding:0;margin:0;border:0;background:transparent;">${heroInner}</span>`;
    const logoImgHtml = meta.logoUrl
      ? `<img src="${escapeAttr(meta.logoUrl)}" decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />`
      : "";
    return renderFeedCardMarkupCore({
      business: meta.name,
      location: meta.city,
      content: String(draft.caption || "").trim(),
      likes: 0,
      comments: 0,
      isLive: false,
      logoImgHtml,
      heroMediaHtml,
      heroReady: !!previewUrl,
      escapeHtmlFn: escapeHtml,
      iconFn: appIcon
    });
  }

  // --- Vorschau 2: die Story-Kachel im Zbulo-Track ---------------------------
  function buildStoryTilePreviewMarkup() {
    const draft = drafts.story;
    const meta = resolveBusinessMeta();
    const previewUrl = String(draft.previewUrl || "").trim();
    const tileWidth = resolveStoryTileWidth();
    const mediaHtml = previewUrl
      ? `<img src="${escapeAttr(previewUrl)}" decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />`
      : renderStoryTileMediaFallbackCore({ iconFn: appIcon });
    const logoImgHtml = `<img src="${escapeAttr(meta.logoUrl)}" decoding="async" width="28" height="28" class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />`;
    return renderStoryTileMarkupCore({
      label: meta.name,
      mediaHtml,
      logoImgHtml,
      // Die im Feed prozentual berechnete Breite hier als fester Wert: die
      // Buehne ist genau so breit wie die echte Kachel auf diesem Geraet.
      shellStyle: `flex:0 0 ${tileWidth}px;width:${tileWidth}px;max-width:${tileWidth}px;`,
      innerStyle: buildStoryTileInnerStyleCore(),
      escapeHtmlFn: escapeHtml
    });
  }

  // --- Vorschau 3: die geoeffnete Story -------------------------------------
  // Gleiche Knoten, gleiche Reihenfolge und gleiche Klassen wie der echte
  // Story-Viewer sie baut (createTopbarElement/renderReels/mountMedia), dazu
  // die aus story/index.html abgeleiteten Regeln.
  function buildStoryReelPreviewMarkup() {
    const draft = drafts.story;
    const meta = resolveBusinessMeta();
    const previewUrl = String(draft.previewUrl || "").trim();
    const caption = String(draft.caption || "").trim();
    const product = draft.product;
    const mediaHtml = previewUrl
      ? `<img class="reel-image" src="${escapeAttr(previewUrl)}" decoding="async" />`
      : "";
    const priceLabel = product ? formatComposerPrice(product.price) : "";
    const productThumb = product?.imageUrl ? optimizeImageUrl(product.imageUrl, "thumb") : "";
    const productHtml = product
      ? `<span class="productCard">
            <div class="productCardThumb">🍽${productThumb ? `<img class="productCardThumbImg" src="${escapeAttr(productThumb)}" alt="" decoding="async" />` : ""}</div>
            <div class="productCardInfo">
              <div class="productCardName">${escapeHtml(product.name)}</div>
              ${priceLabel ? `<div class="productCardPrice">${escapeHtml(priceLabel)}</div>` : ""}
            </div>
            <span class="productCardBtn">${TEXT.productMore}</span>
          </span>`
      : "";
    return `
      <div class="reel" data-index="0">
        ${mediaHtml}
        <div class="vignette"></div>
        <div class="topbar">
          <div class="topbarLeft">
            <button type="button" class="btnIcon" tabindex="-1">←</button>
            <div class="brandPill">
              <div class="brandLogo" data-bc-brand-logo></div>
              <div class="brandName">${escapeHtml(meta.name)}</div>
            </div>
          </div>
          <div class="topbarRight">
            <button type="button" class="btnIcon" data-story-sound-state="off" aria-pressed="false" tabindex="-1">🔇</button>
          </div>
        </div>
        <div class="content">
          ${caption ? `<div class="contentDesc">${escapeHtml(caption)}</div>` : ""}
          ${productHtml}
        </div>
        <div class="rail">
          <div class="railBtn"><div class="railIcon">1/1</div></div>
        </div>
      </div>
    `;
  }

  // Buehne mit fester Zielhoehe: das Original steht darin in Originalmassen und
  // wird als Ganzes skaliert. Nichts im Inneren wird umgerechnet, deshalb
  // stimmen alle Verhaeltnisse exakt. Die Buehne ist danach genau so gross wie
  // das skalierte Original - kein Rand, nichts abgeschnitten.
  function applyFrameStage(stage, inner, naturalWidth, naturalHeight, box) {
    if (!stage || !inner || !box || !(box.scale > 0)) return;
    inner.style.width = `${naturalWidth}px`;
    inner.style.height = `${naturalHeight}px`;
    inner.style.marginLeft = "0px";
    inner.style.transform = `scale(${box.scale})`;
    stage.style.width = `${Math.round(box.width)}px`;
    stage.style.height = `${Math.round(box.height)}px`;
  }

  // Der Feed-Beitrag steht randlos in der App-Shell: Originalbreite, nur
  // herunterskaliert, wenn das Modal schmaler ist als die Shell.
  function applyPostStage(stage, inner, naturalWidth) {
    if (!stage || !inner) return;
    const available = stage.clientWidth || naturalWidth;
    inner.style.width = `${naturalWidth}px`;
    inner.style.height = "";
    let scale = Math.min(1, naturalWidth > 0 ? available / naturalWidth : 1);
    if (!Number.isFinite(scale) || scale <= 0) scale = 1;
    inner.style.transform = `scale(${scale})`;
    const height = inner.scrollHeight;
    stage.style.height = `${Math.round(height * scale)}px`;
    inner.style.marginLeft = `${Math.max(0, (available - naturalWidth * scale) / 2)}px`;
  }

  function syncPreviewGeometry() {
    if (!nodes || !root?.isConnected) return;
    if (mode === "story") {
      const tileWidth = resolveStoryTileWidth();
      const frame = resolveStoryFrameSize();
      const layout = resolveStoryPreviewLayoutCore({
        rowWidth: resolvePreviewRowWidth(),
        tileWidth,
        tileHeight: STORY_TILE_HEIGHT,
        reelWidth: frame.width,
        reelHeight: frame.height
      });
      applyFrameStage(nodes.stageTile, nodes.stageTileInner, tileWidth, STORY_TILE_HEIGHT, layout.tile);
      applyFrameStage(nodes.stageReel, nodes.stageReelInner, frame.width, frame.height, layout.reel);
      return;
    }
    applyPostStage(nodes.stagePost, nodes.stagePostInner, resolveShellWidth());
  }

  function buildPreview() {
    if (!nodes) return;
    if (mode === "story") {
      if (nodes.stageTileInner) nodes.stageTileInner.innerHTML = buildStoryTilePreviewMarkup();
      if (nodes.stageReelInner) {
        nodes.stageReelInner.className = `mnyra-bc__stage-inner ${STORY_VIEWER_SURFACE_CLASS}`;
        nodes.stageReelInner.innerHTML = buildStoryReelPreviewMarkup();
        // Logo genauso setzen wie applyTopbarMeta im echten Story-Viewer.
        const brandLogo = nodes.stageReelInner.querySelector("[data-bc-brand-logo]");
        if (brandLogo) {
          const logoUrl = resolveBusinessMeta().logoUrl;
          brandLogo.style.backgroundImage = logoUrl
            ? `url(${logoUrl})`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
        }
      }
    } else if (nodes.stagePostInner) {
      nodes.stagePostInner.innerHTML = `<div class="app-content-inline py-4">${buildPostPreviewMarkup()}</div>`;
    }
    // Erst nach dem Layout messen; ein zweiter Durchgang faengt spaet
    // geladene Schriften und Bilder ab.
    syncPreviewGeometry();
    win?.requestAnimationFrame?.(() => syncPreviewGeometry());
  }

  function syncCaptionPreview() {
    if (!nodes) return;
    const caption = String(currentDraft().caption || "").trim();
    if (mode === "story") {
      const content = nodes.stageReelInner?.querySelector(".content");
      if (!content) return;
      let desc = content.querySelector(".contentDesc");
      if (caption && !desc) {
        desc = doc.createElement("div");
        desc.className = "contentDesc";
        content.insertBefore(desc, content.firstChild);
      }
      if (!caption && desc) {
        desc.remove();
        return;
      }
      if (desc) desc.textContent = caption;
      return;
    }
    const captionNode = nodes.stagePostInner?.querySelector(".feed-card p.line-clamp-2");
    if (captionNode) captionNode.textContent = caption;
    syncPreviewGeometry();
  }

  // Die Produkt-Zeile im Bedienteil (nicht in der Vorschau).
  function syncProductChip() {
    const product = mode === "story" ? currentDraft().product : null;
    const visible = product ? "1" : "0";
    if (nodes.chip) nodes.chip.setAttribute("data-visible", visible);
    if (nodes.tag) nodes.tag.setAttribute("data-active", visible);
    if (nodes.tagLabel) nodes.tagLabel.textContent = product ? product.name : TEXT.tagProduct;
    if (!product) return;
    const priceLabel = formatComposerPrice(product.price);
    const thumb = product.imageUrl ? optimizeImageUrl(product.imageUrl, "thumb") : "";
    if (nodes.chipName) nodes.chipName.textContent = product.name;
    if (nodes.chipPrice) nodes.chipPrice.textContent = priceLabel;
    setImageNode(nodes.chipImg, thumb);
  }

  function syncProductPreview() {
    syncProductChip();
    if (mode === "story") buildPreview();
  }

  function formatComposerPrice(value) {
    if (value === null || value === undefined || value === "") return "";
    let label = "";
    try {
      label = String(formatPrice(value) || "").trim();
    } catch {
      label = "";
    }
    return label === "-" ? "" : label;
  }

  function syncSubmitState() {
    const draft = currentDraft();
    const ready = canPublishComposerDraftCore({
      caption: draft.caption,
      hasImage: !!draft.file,
      submitting
    });
    if (nodes.submit) {
      nodes.submit.disabled = !ready;
      nodes.submit.setAttribute("aria-disabled", ready ? "false" : "true");
    }
    if (nodes.hint) {
      if (submitting) {
        nodes.hint.textContent = TEXT.submitBusy;
        nodes.hint.setAttribute("data-tone", "busy");
      } else if (ready) {
        nodes.hint.textContent = TEXT.hintReady;
        nodes.hint.setAttribute("data-tone", "ready");
      } else {
        nodes.hint.textContent = TEXT.hintNeedBoth;
        nodes.hint.setAttribute("data-tone", "idle");
      }
    }
  }

  function showError(message = "") {
    if (!nodes.error) return;
    const safe = String(message || "").trim();
    nodes.error.textContent = safe;
    nodes.error.setAttribute("data-visible", safe ? "1" : "0");
  }

  function syncMode() {
    const isStory = mode === "story";
    const draft = currentDraft();
    if (nodes.title) nodes.title.textContent = isStory ? TEXT.titleStory : TEXT.titlePost;
    if (nodes.text) {
      nodes.text.placeholder = isStory ? TEXT.placeholderStory : TEXT.placeholderPost;
      if (nodes.text.value !== draft.caption) nodes.text.value = draft.caption;
    }
    if (nodes.tag) nodes.tag.hidden = !isStory;
    if (nodes.photoLabel) nodes.photoLabel.textContent = draft.file ? TEXT.changePhoto : TEXT.addPhoto;
    if (nodes.photo) nodes.photo.setAttribute("data-active", draft.file ? "1" : "0");
    if (nodes.panePost) nodes.panePost.setAttribute("data-visible", isStory ? "0" : "1");
    if (nodes.paneStory) nodes.paneStory.setAttribute("data-visible", isStory ? "1" : "0");
    syncProductChip();
    buildPreview();
    syncSubmitState();
    showError("");
  }

  function setBusy(nextBusy) {
    submitting = !!nextBusy;
    if (root) root.setAttribute("data-busy", submitting ? "1" : "0");
    if (nodes.submitLabel) nodes.submitLabel.textContent = submitting ? TEXT.submitBusy : TEXT.submit;
    if (nodes.close) nodes.close.disabled = submitting;
    if (nodes.text) nodes.text.readOnly = submitting;
    syncSubmitState();
  }

  function handleFileSelection(file) {
    if (!file) return;
    const type = String(file.type || "").toLowerCase();
    if (!type.startsWith("image/")) {
      showError(TEXT.errorImageType);
      return;
    }
    if (Number(file.size || 0) > MAX_IMAGE_BYTES) {
      showError(TEXT.errorImageSize);
      return;
    }
    const draft = currentDraft();
    releasePreviewUrl(draft.previewUrl);
    draft.file = file;
    draft.previewUrl = "";
    try {
      draft.previewUrl = win?.URL?.createObjectURL ? win.URL.createObjectURL(file) : "";
    } catch {
      draft.previewUrl = "";
    }
    showError("");
    buildPreview();
    if (nodes.photoLabel) nodes.photoLabel.textContent = TEXT.changePhoto;
    if (nodes.photo) nodes.photo.setAttribute("data-active", "1");
    syncSubmitState();
  }

  // Produkte einmal pro Restaurant laden und im Speicher halten: das Popup
  // oeffnet danach sofort, auch bei langsamer Verbindung.
  function ensureProductsLoaded({ force = false } = {}) {
    const rid = String(getRestaurantId() || "").trim();
    if (!rid || !loadProducts) {
      productState.status = "error";
      renderPickerList();
      return;
    }
    if (productState.restaurantId !== rid) {
      productState.restaurantId = rid;
      productState.status = "idle";
      productState.items = [];
    }
    if (!force && (productState.status === "loading" || productState.status === "ready")) return;
    productState.status = "loading";
    renderPickerList();
    void (async () => {
      try {
        const items = await loadProducts(rid);
        if (productState.restaurantId !== rid) return;
        productState.items = Array.isArray(items) ? items : [];
        productState.status = "ready";
      } catch {
        if (productState.restaurantId !== rid) return;
        productState.items = [];
        productState.status = "error";
      }
      renderPickerList();
    })();
  }

  function renderPickerState(message, withRetry = false) {
    if (!nodes.pickerList) return;
    nodes.pickerList.textContent = "";
    const wrap = doc.createElement("div");
    wrap.className = "mnyra-bc__picker-state";
    wrap.textContent = message;
    if (withRetry) {
      const retry = doc.createElement("button");
      retry.type = "button";
      retry.textContent = TEXT.pickerRetry;
      retry.addEventListener("click", () => ensureProductsLoaded({ force: true }));
      wrap.appendChild(doc.createElement("br"));
      wrap.appendChild(retry);
    }
    nodes.pickerList.appendChild(wrap);
  }

  function renderPickerList() {
    if (!nodes.pickerList) return;
    if (productState.status === "loading" || productState.status === "idle") {
      renderPickerState(TEXT.pickerLoading);
      syncPickerConfirm();
      return;
    }
    if (productState.status === "error") {
      renderPickerState(TEXT.pickerError, true);
      syncPickerConfirm();
      return;
    }
    const term = String(nodes.pickerSearch?.value || "");
    const list = filterComposerProductsCore(productState.items, term);
    if (!list.length) {
      renderPickerState(TEXT.pickerEmpty);
      syncPickerConfirm();
      return;
    }
    const frag = doc.createDocumentFragment();
    list.forEach((product) => {
      const row = doc.createElement("button");
      row.type = "button";
      row.className = "mnyra-bc__picker-row";
      row.dataset.bcPickerItem = product.id;
      if (pickerSelection && pickerSelection.id === product.id) row.setAttribute("data-selected", "1");

      const thumb = doc.createElement("img");
      thumb.className = "mnyra-bc__picker-thumb";
      thumb.alt = "";
      thumb.loading = "lazy";
      thumb.decoding = "async";
      if (product.imageUrl) thumb.src = optimizeImageUrl(product.imageUrl, "thumb");
      row.appendChild(thumb);

      const main = doc.createElement("div");
      main.className = "mnyra-bc__picker-main";
      const name = doc.createElement("div");
      name.className = "mnyra-bc__picker-name";
      name.textContent = product.name;
      main.appendChild(name);
      const meta = doc.createElement("div");
      meta.className = "mnyra-bc__picker-meta";
      meta.textContent = [product.category, formatComposerPrice(product.price)].filter(Boolean).join(" · ");
      main.appendChild(meta);
      row.appendChild(main);

      const mark = doc.createElement("span");
      mark.className = "mnyra-bc__picker-mark";
      mark.innerHTML = ICON.check;
      row.appendChild(mark);

      frag.appendChild(row);
    });
    nodes.pickerList.textContent = "";
    nodes.pickerList.appendChild(frag);
    syncPickerConfirm();
  }

  function syncPickerConfirm() {
    if (nodes.pickerConfirm) nodes.pickerConfirm.disabled = !pickerSelection;
  }

  function openPicker() {
    if (mode !== "story" || submitting) return;
    pickerSelection = currentDraft().product || null;
    if (nodes.pickerSearch) nodes.pickerSearch.value = "";
    if (nodes.picker) nodes.picker.setAttribute("data-visible", "1");
    ensureProductsLoaded();
    renderPickerList();
  }

  function closePicker() {
    if (nodes.picker) nodes.picker.setAttribute("data-visible", "0");
    pickerSelection = null;
  }

  function isPickerOpen() {
    return nodes?.picker?.getAttribute("data-visible") === "1";
  }

  function showToast(message = "") {
    if (!doc?.body) return;
    let toast = doc.getElementById(TOAST_ELEMENT_ID);
    if (!toast) {
      toast = doc.createElement("div");
      toast.id = TOAST_ELEMENT_ID;
      toast.setAttribute("role", "status");
      doc.body.appendChild(toast);
    }
    toast.textContent = String(message || "");
    toast.setAttribute("data-visible", "1");
    if (toastTimer) win?.clearTimeout?.(toastTimer);
    toastTimer = win?.setTimeout?.(() => {
      toast.setAttribute("data-visible", "0");
      toastTimer = 0;
    }, 2600) || 0;
  }

  function syncChrome() {
    if (!doc) return;
    const anyOverlay = !!doc.querySelector("#overlayRoot .modal-overlay");
    const surface = anyOverlay ? MODAL_CHROME_COLOR : APP_CHROME_COLOR;
    try {
      doc.documentElement.style.setProperty("--active-modal-surface", surface);
      doc.documentElement.classList.toggle("modal-open", anyOverlay);
      doc.body.classList.toggle("modal-open", anyOverlay);
      const underlay = doc.getElementById("modalUnderlay");
      if (underlay) {
        underlay.classList.toggle("hidden", !anyOverlay);
        underlay.style.background = surface;
      }
      ["safariChromeTintTop", "safariChromeTintBottom"].forEach((id) => {
        const tint = doc.getElementById(id);
        if (!tint) return;
        tint.style.display = anyOverlay ? "block" : "none";
        tint.style.background = surface;
      });
      const meta = doc.head?.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", surface);
    } catch {}
  }

  function bindEscape() {
    if (keydownBound || !doc) return;
    keydownBound = true;
    doc.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !open) return;
      if (isPickerOpen()) {
        closePicker();
        event.preventDefault();
        return;
      }
      if (submitting) return;
      closeComposer();
      event.preventDefault();
    });
  }

  function bindNodeEvents() {
    nodes.close?.addEventListener("click", () => {
      if (submitting) return;
      closeComposer();
    });
    nodes.submit?.addEventListener("click", () => {
      void publish();
    });
    nodes.text?.addEventListener("input", () => {
      const draft = currentDraft();
      draft.caption = String(nodes.text.value || "");
      syncCaptionPreview();
      syncSubmitState();
    });
    nodes.photo?.addEventListener("click", () => {
      if (submitting) return;
      showError("");
      nodes.file?.click();
    });
    nodes.file?.addEventListener("change", () => {
      const file = nodes.file?.files?.[0] || null;
      handleFileSelection(file);
      // Zuruecksetzen, damit dieselbe Datei erneut waehlbar bleibt.
      if (nodes.file) nodes.file.value = "";
    });
    nodes.tag?.addEventListener("click", () => openPicker());
    nodes.chipRemove?.addEventListener("click", () => {
      if (submitting) return;
      currentDraft().product = null;
      syncProductPreview();
    });
    nodes.pickerClose?.addEventListener("click", () => closePicker());
    nodes.picker?.addEventListener("click", (event) => {
      if (event.target === nodes.picker) closePicker();
    });
    nodes.pickerSearch?.addEventListener("input", () => renderPickerList());
    nodes.pickerList?.addEventListener("click", (event) => {
      const row = event.target?.closest?.("[data-bc-picker-item]");
      if (!row) return;
      const id = String(row.dataset.bcPickerItem || "").trim();
      const product = productState.items.find((entry) => entry.id === id) || null;
      pickerSelection = pickerSelection && pickerSelection.id === id ? null : product;
      Array.from(nodes.pickerList.querySelectorAll("[data-bc-picker-item]")).forEach((node) => {
        node.setAttribute("data-selected", pickerSelection && node.dataset.bcPickerItem === pickerSelection.id ? "1" : "0");
      });
      syncPickerConfirm();
    });
    nodes.pickerConfirm?.addEventListener("click", () => {
      if (!pickerSelection) return;
      currentDraft().product = pickerSelection;
      closePicker();
      syncProductPreview();
    });
  }

  function clearDraft(target) {
    const draft = drafts[target];
    if (!draft) return;
    releasePreviewUrl(draft.previewUrl);
    draft.caption = "";
    draft.file = null;
    draft.previewUrl = "";
    draft.product = null;
  }

  // Ein Guard, eine Wahrheit: der zweite Tap auf "Posto" faellt hier heraus,
  // bevor irgendein await laeuft.
  async function publish() {
    if (submitting) return;
    const draft = currentDraft();
    if (!canPublishComposerDraftCore({ caption: draft.caption, hasImage: !!draft.file, submitting })) return;
    const restaurantId = String(getRestaurantId() || "").trim();
    if (!restaurantId) {
      showError(TEXT.errorNoBusiness);
      return;
    }
    if (win && win.navigator && win.navigator.onLine === false) {
      showError(TEXT.errorOffline);
      return;
    }
    if (!uploadImage || (mode === "story" ? !createStory : !createPost)) {
      showError(TEXT.errorGeneric);
      return;
    }

    const publishMode = mode;
    const caption = String(draft.caption || "").trim().slice(0, CAPTION_MAX_LENGTH);
    const file = draft.file;
    setBusy(true);
    showError("");
    try {
      const uploaded = await uploadImage(file, restaurantId);
      const mediaUrl = String(uploaded?.cdnUrl || uploaded?.url || "").trim();
      if (!mediaUrl) throw new Error(TEXT.errorGeneric);

      if (publishMode === "story") {
        const product = draft.product;
        await createStory({
          restaurantId,
          caption,
          mediaUrl,
          mediaType: "image",
          menuItemId: product?.id || "",
          menuItemName: product?.name || "",
          menuItemPrice: product?.price ?? "",
          menuItemImage: product?.imageUrl || ""
        });
      } else {
        await createPost({
          restaurantId,
          caption,
          mediaUrl,
          mediaType: "image"
        });
      }

      // Erst schliessen, dann den Entwurf freigeben: die Object-URL wird nie
      // widerrufen, solange die Vorschau noch im Dokument haengt.
      setBusy(false);
      closeComposer();
      clearDraft(publishMode);
      showToast(publishMode === "story" ? TEXT.successStory : TEXT.successPost);
      try {
        await afterPublish(publishMode);
      } catch {}
    } catch (err) {
      setBusy(false);
      const message = String(err?.message || "").trim();
      showError(message || TEXT.errorGeneric);
    }
  }

  function openComposer(nextMode = "post") {
    if (!doc) return;
    const normalized = String(nextMode || "").trim().toLowerCase() === "story" ? "story" : "post";
    ensureNode();
    if (!root) return;
    bindEscape();
    mode = normalized;
    closePicker();
    setBusy(false);
    // Erst einhaengen, dann aufbauen: die Buehne kann ihre Breite nur messen,
    // wenn sie im Dokument steht.
    if (!open) {
      const host = ensureOverlayHost(doc);
      if (host && root.parentNode !== host) host.appendChild(root);
      open = true;
    }
    syncMode();
    bindViewportSync();
    if (nodes.body) nodes.body.scrollTop = 0;
    syncChrome();
    // Produkte im Hintergrund vorladen, damit das Produkt-Popup sofort steht.
    if (mode === "story") ensureProductsLoaded();
  }

  // Drehen oder Fenstergroesse aendern: die Buehne rechnet ihren Massstab neu,
  // damit die Vorschau weiter exakt der echten Ansicht entspricht.
  function bindViewportSync() {
    if (viewportSyncBound || !win?.addEventListener) return;
    viewportSyncBound = true;
    const onViewportChange = () => {
      if (!open) return;
      syncPreviewGeometry();
    };
    win.addEventListener("resize", onViewportChange, { passive: true });
    win.addEventListener("orientationchange", onViewportChange, { passive: true });
  }

  function closeComposer() {
    if (!open) return;
    open = false;
    closePicker();
    try {
      root?.remove();
    } catch {}
    syncChrome();
  }

  return Object.freeze({
    open: openComposer,
    close: closeComposer,
    isOpen: () => open
  });
}
