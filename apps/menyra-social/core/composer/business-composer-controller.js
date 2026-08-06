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
// Original (renderFeedCardMarkupCore, renderStoryTileMarkupCore). Angezeigt
// wird sie in einer Buehne, die das Original in Originalbreite aufbaut und nur
// als Ganzes herunterskaliert - dadurch stimmt jedes Mass proportional exakt.
//
// Die Story-Vorschau zeigt genau das, was der Nutzer nachher sieht: die
// Story-Reihe von Zbulo. Die eigene Story steht vorne scharf, dahinter stehen
// zwei weitere Kacheln unscharf - dieselbe Reihe, dieselben Masse, nur der
// Blick liegt auf der eigenen.

import {
  renderFeedCardMarkupCore
} from "../feed/feed-card-markup-utils.js";
import {
  renderStoryTileMarkupCore,
  renderStoryTileMediaFallbackCore,
  buildStoryTileShellStyleCore,
  buildStoryTileInnerStyleCore
} from "../feed/story-tile-markup-utils.js";
// Foto oder Video wird ueberall in der App mit derselben Regel erkannt.
import { detectUploadMediaTypeCore } from "../media/media-upload-view-render-utils.js";

const STYLE_ELEMENT_ID = "mnyraBusinessComposerStyles";
// Die App-Shell ist max-w-md breit; darin steht der echte Feed.
const APP_SHELL_MAX_WIDTH = 448;
// Die Story-Reihe im Feed haelt ihre Kacheln mit gap-2.5 auseinander; die
// Kachelmasse selbst kommen aus story-tile-markup-utils.
const STORY_TRACK_GAP = 10;
// Die beiden unscharfen Nachbarkacheln tragen kein fremdes Bild, sondern zwei
// ruhige Flaechen - unscharf sieht man ohnehin nur, dass da noch etwas steht.
const STORY_TRACK_NEIGHBOUR_SHADES = Object.freeze([
  "linear-gradient(150deg,#94a3b8 0%,#475569 55%,#1e293b 100%)",
  "linear-gradient(150deg,#a5b4fc 0%,#6366f1 55%,#312e81 100%)"
]);
const ROOT_ELEMENT_ID = "businessComposerOverlayRoot";
// Dieselben Grenzen wie im Upload-Screen: Fotos werden komprimiert, Videos
// gehen roh zum Media-Worker.
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
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
  addPhoto: "Shto foto/video",
  changePhoto: "Ndrysho median",
  tagProduct: "Etiketo produkt",
  removeProduct: "Hiq produktin",
  productOptional: "Produkti nuk është i detyrueshëm.",
  hintNeedBoth: "Që të postosh, duhen edhe teksti edhe fotoja ose videoja.",
  hintReady: "Gati për t'u postuar.",
  switchPost: "Postim",
  switchStory: "Story",
  switchLabel: "Zgjidh llojin e postimit",
  previewTitle: "Parapamje",
  previewPost: "Si duket në Zbulo",
  previewStory: "Në rreshtin e story-ve",
  pickerTitle: "Zgjidh një produkt",
  pickerSearch: "Kërko ushqime ose pije…",
  pickerConfirm: "Zgjidh produktin",
  pickerEmpty: "Nuk u gjet asnjë produkt.",
  pickerLoading: "Duke ngarkuar produktet…",
  pickerError: "Produktet nuk u ngarkuan.",
  pickerRetry: "Provo përsëri",
  errorMediaType: "Lejohen vetëm foto ose video.",
  errorImageSize: "Fotoja duhet të jetë deri në 15MB.",
  errorVideoSize: "Videoja duhet të jetë deri në 50MB.",
  errorNoBusiness: "Kjo llogari nuk është e lidhur me një biznes.",
  errorGeneric: "Postimi dështoi. Provo përsëri.",
  errorOffline: "Nuk ka lidhje me internetin. Provo përsëri.",
  successPost: "Postimi u publikua.",
  successStory: "Story u publikua.",
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
  padding: 16px 16px 24px;
}
/* Eigene Leiste am unteren Rand des Modals: hier wird zwischen Postim und
   Story umgeschaltet, ohne das Modal zu schliessen. Sie sitzt ueber der
   Browserleiste des Telefons, darum der Sicherheitsabstand unten. */
.mnyra-bc__foot {
  flex: 0 0 auto;
  padding: 10px 16px calc(var(--safe-area-bottom, 0px) + 10px);
  border-top: 1px solid var(--bc-line);
  background: #ffffff;
}
.mnyra-bc__switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: var(--bc-plane);
}
.mnyra-bc__switch-btn {
  min-height: 40px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--bc-ink-2);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.mnyra-bc__switch-btn svg { width: 16px; height: 16px; flex: 0 0 auto; }
.mnyra-bc__switch-btn[aria-selected="true"] {
  background: #ffffff;
  color: var(--bc-accent);
}
.mnyra-bc__switch-btn:disabled { cursor: not-allowed; }
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
/* Buehne: das Original steht darin in Originalbreite und wird als Ganzes
   skaliert. Nichts im Inneren wird umgerechnet - alle Verhaeltnisse bleiben
   exakt so, wie der Nutzer sie spaeter sieht. */
.mnyra-bc__stage {
  position: relative;
  overflow: hidden;
  width: 100%;
}
/* Die Story-Reihe von Zbulo: dieselbe Flex-Reihe, derselbe Abstand, derselbe
   Einzug. Sie scrollt hier nicht - es sind genau die drei Kacheln zu sehen,
   die auch im Feed nebeneinander stehen. */
.mnyra-bc__story-track {
  display: flex;
  align-items: flex-start;
  gap: ${STORY_TRACK_GAP}px;
  padding: 8px 0;
  overflow: hidden;
}
/* Die fremden Kacheln stehen unscharf daneben: die Reihe bleibt vollstaendig,
   der Blick liegt auf der eigenen Story. Unscharf gestellt wird der INHALT der
   Kachel, nicht die Kachel selbst - so bleibt ihre abgerundete Form scharf.
   Das leichte Vergroessern haelt den weichen Rand des Blurs ausserhalb des
   Ausschnitts, sonst wuerde die Flaeche zum Rand hin durchsichtig. */
.mnyra-bc__story-track > [data-bc-story-blur] { opacity: 0.6; }
.mnyra-bc__story-track > [data-bc-story-blur] > div > * {
  filter: blur(4px) saturate(0.85);
  transform: scale(1.12);
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
.mnyra-bc[data-busy="1"] .mnyra-bc__foot,
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
    style.textContent = BUSINESS_COMPOSER_CSS;
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
  // Videos gehen roh zum Media-Worker; das Poster ist das erste Bild daraus.
  const uploadVideo = typeof api.uploadVideoFn === "function" ? api.uploadVideoFn : null;
  const captureVideoPoster = typeof api.captureVideoPosterFn === "function" ? api.captureVideoPosterFn : null;
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
    post: { caption: "", file: null, previewUrl: "", mediaType: "", product: null },
    story: { caption: "", file: null, previewUrl: "", mediaType: "", product: null }
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
              <p class="mnyra-bc__preview-caption">${TEXT.previewStory}</p>
              <div class="mnyra-bc__stage mnyra-bc__stage--bleed" data-bc-stage="story">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="story"></div>
              </div>
            </div>
          </section>
        </div>

        <footer class="mnyra-bc__foot">
          <div class="mnyra-bc__switch" role="tablist" aria-label="${TEXT.switchLabel}">
            <button type="button" class="mnyra-bc__switch-btn" role="tab" data-bc-mode="post" aria-selected="true">
              ${ICON.image}<span>${TEXT.switchPost}</span>
            </button>
            <button type="button" class="mnyra-bc__switch-btn" role="tab" data-bc-mode="story" aria-selected="false">
              ${ICON.camera}<span>${TEXT.switchStory}</span>
            </button>
          </div>
        </footer>

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
      <input type="file" accept="image/*,video/*" data-bc-file hidden />
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
      stagePost: q('[data-bc-stage="post"]'),
      stagePostInner: q('[data-bc-stage-inner="post"]'),
      stageStory: q('[data-bc-stage="story"]'),
      stageStoryInner: q('[data-bc-stage-inner="story"]'),
      switchButtons: Array.from(root.querySelectorAll("[data-bc-mode]")),
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

  // --- Vorschau 1: der echte Feed-Beitrag ------------------------------------
  // Gleicher Baustein wie im Feed, gleiche Klassen, gleiche Masse. Nur die
  // Datenattribute fehlen, damit die Vorschau keine App-Handler ausloest.
  function buildPostPreviewMarkup() {
    const draft = drafts.post;
    const meta = resolveBusinessMeta();
    const previewUrl = String(draft.previewUrl || "").trim();
    // Videos genau wie im Feed: stumm, in Schleife, ohne Bedienelemente.
    const heroInner = previewUrl
      ? (draft.mediaType === "video"
        ? `<video src="${escapeAttr(previewUrl)}" autoplay muted loop playsinline preload="metadata" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000"></video>`
        : `<img src="${escapeAttr(previewUrl)}" decoding="async" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`)
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

  // --- Vorschau 2: die Story-Reihe von Zbulo --------------------------------
  // Eine Kachel gehoert dem Nutzer, zwei stehen unscharf daneben. Alle drei
  // kommen aus demselben Baustein wie die echten Kacheln im Feed und tragen
  // dieselben Masse - die Reihe ist damit 1:1 die aus Zbulo.
  function buildStoryTileMarkup({ label, mediaHtml, logoImgHtml, first = false, shellAttrs = "" }) {
    return renderStoryTileMarkupCore({
      label,
      mediaHtml,
      logoImgHtml,
      shellAttrs,
      // Exakt die Masse aus dem Feed - inklusive des Einzugs, mit dem die
      // erste Kachel der Reihe steht (ml-5).
      shellStyle: buildStoryTileShellStyleCore({ withMarginLeft: first }),
      innerStyle: buildStoryTileInnerStyleCore(),
      escapeHtmlFn: escapeHtml
    });
  }

  // Die eigene Story: vorne in der Reihe, scharf, mit Foto, Logo und Namen.
  function buildOwnStoryTileMarkup() {
    const draft = drafts.story;
    const meta = resolveBusinessMeta();
    const previewUrl = String(draft.previewUrl || "").trim();
    const mediaHtml = previewUrl
      ? (draft.mediaType === "video"
        ? `<video src="${escapeAttr(previewUrl)}" autoplay muted loop playsinline preload="metadata" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;"></video>`
        : `<img src="${escapeAttr(previewUrl)}" decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />`)
      : renderStoryTileMediaFallbackCore({ iconFn: appIcon });
    const logoImgHtml = `<img src="${escapeAttr(meta.logoUrl)}" decoding="async" width="28" height="28" class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />`;
    return buildStoryTileMarkup({
      label: meta.name,
      mediaHtml,
      logoImgHtml,
      first: true,
      shellAttrs: "data-bc-story-own"
    });
  }

  // Die Nachbarn in der Reihe: dieselbe Kachel, aber ohne fremde Daten - sie
  // stehen unscharf da und zeigen nur, dass die eigene Story in einer Reihe
  // steht. Ohne Namen, ohne Logo, ohne Vorlesen.
  function buildNeighbourStoryTileMarkup(index = 0) {
    const shade = STORY_TRACK_NEIGHBOUR_SHADES[index % STORY_TRACK_NEIGHBOUR_SHADES.length];
    return buildStoryTileMarkup({
      label: "",
      mediaHtml: `<div class="absolute inset-0" style="position:absolute;inset:0;background:${shade};"></div>`,
      logoImgHtml: "",
      shellAttrs: `data-bc-story-blur="${index}" aria-hidden="true"`
    });
  }

  // Die Reihe: eigene Story vorne, zwei unscharfe Nachbarn dahinter.
  function buildStoryTrackPreviewMarkup() {
    return `
      <div class="mnyra-bc__story-track">
        ${buildOwnStoryTileMarkup()}
        ${buildNeighbourStoryTileMarkup(0)}
        ${buildNeighbourStoryTileMarkup(1)}
      </div>
    `;
  }

  // Feed-Beitrag und Story-Reihe stehen beide randlos in der App-Shell:
  // Originalbreite, nur herunterskaliert, wenn das Modal schmaler ist.
  function applyBleedStage(stage, inner, naturalWidth) {
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
    const shellWidth = resolveShellWidth();
    if (mode === "story") {
      applyBleedStage(nodes.stageStory, nodes.stageStoryInner, shellWidth);
      return;
    }
    applyBleedStage(nodes.stagePost, nodes.stagePostInner, shellWidth);
  }

  function buildPreview() {
    if (!nodes) return;
    if (mode === "story") {
      if (nodes.stageStoryInner) nodes.stageStoryInner.innerHTML = buildStoryTrackPreviewMarkup();
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
    // Die Story-Reihe zeigt den Namen des Betriebs, nicht den Text der Story -
    // beim Tippen aendert sich an ihr nichts.
    if (mode === "story") return;
    const caption = String(currentDraft().caption || "").trim();
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
    (nodes.switchButtons || []).forEach((button) => {
      const selected = button.getAttribute("data-bc-mode") === mode;
      button.setAttribute("aria-selected", selected ? "true" : "false");
    });
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
    (nodes.switchButtons || []).forEach((button) => { button.disabled = submitting; });
    syncSubmitState();
  }

  function handleFileSelection(file) {
    if (!file) return;
    // Foto oder Video - erkannt mit derselben Regel wie im Upload-Screen.
    const mediaType = detectUploadMediaTypeCore(file);
    if (!mediaType) {
      showError(TEXT.errorMediaType);
      return;
    }
    const isVideo = mediaType === "video";
    if (Number(file.size || 0) > (isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) {
      showError(isVideo ? TEXT.errorVideoSize : TEXT.errorImageSize);
      return;
    }
    const draft = currentDraft();
    releasePreviewUrl(draft.previewUrl);
    draft.file = file;
    draft.mediaType = mediaType;
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
    // Umschalten in der Leiste: der Entwurf der anderen Seite bleibt stehen -
    // Text, Foto und Produkt liegen je Modus getrennt im Speicher.
    (nodes.switchButtons || []).forEach((button) => {
      button.addEventListener("click", () => {
        if (submitting) return;
        const next = button.getAttribute("data-bc-mode") === "story" ? "story" : "post";
        if (next === mode) return;
        closePicker();
        mode = next;
        syncMode();
        if (nodes.body) nodes.body.scrollTop = 0;
        if (mode === "story") ensureProductsLoaded();
      });
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
    draft.mediaType = "";
    draft.product = null;
  }

  // Poster fuer Video-Uploads: erstes Bild des Videos, hochgeladen wie ein
  // Foto. Die Feed-Karte und die Story-Kachel zeigen damit sofort ein
  // Standbild, auch wenn Autoplay blockiert ist. Fehler blockieren nie das
  // Posten - dann bleibt das Poster eben leer.
  async function uploadVideoPoster(file, restaurantId) {
    if (!captureVideoPoster || !uploadImage) return "";
    try {
      const posterFile = await captureVideoPoster(file);
      if (!posterFile) return "";
      const uploaded = await uploadImage(posterFile, restaurantId);
      return String(uploaded?.cdnUrl || uploaded?.url || "").trim();
    } catch {
      return "";
    }
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
    const mediaType = draft.mediaType === "video" ? "video" : "image";
    const needsUploader = mediaType === "video" ? uploadVideo : uploadImage;
    if (!needsUploader || (mode === "story" ? !createStory : !createPost)) {
      showError(TEXT.errorGeneric);
      return;
    }

    const publishMode = mode;
    const caption = String(draft.caption || "").trim().slice(0, CAPTION_MAX_LENGTH);
    const file = draft.file;
    setBusy(true);
    showError("");
    try {
      const uploaded = mediaType === "video"
        ? await uploadVideo(file, restaurantId)
        : await uploadImage(file, restaurantId);
      const mediaUrl = String(uploaded?.cdnUrl || uploaded?.url || "").trim();
      if (!mediaUrl) throw new Error(TEXT.errorGeneric);
      const posterUrl = mediaType === "video" ? await uploadVideoPoster(file, restaurantId) : "";

      if (publishMode === "story") {
        const product = draft.product;
        await createStory({
          restaurantId,
          caption,
          mediaUrl,
          mediaType,
          posterUrl,
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
          mediaType,
          posterUrl
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
