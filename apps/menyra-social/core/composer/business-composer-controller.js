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

const STYLE_ELEMENT_ID = "mnyraBusinessComposerStyles";
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
.mnyra-bc__story-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}
.mnyra-bc__card {
  border: 1px solid var(--bc-line);
  border-radius: 26px;
  background: #ffffff;
  padding: 10px;
}
.mnyra-bc__card-head {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 2px 4px 10px;
}
.mnyra-bc__card-logo {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  object-fit: cover;
  background: var(--bc-plane);
  flex: 0 0 auto;
}
.mnyra-bc__card-name {
  font-size: 12px;
  font-weight: 900;
  color: var(--bc-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.mnyra-bc__media {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  background: #e2e8f0;
}
.mnyra-bc__media--post { aspect-ratio: 4 / 5; }
.mnyra-bc__media--tile { aspect-ratio: 5 / 8; border-radius: 18px; }
.mnyra-bc__media--full { aspect-ratio: 9 / 16; }
.mnyra-bc__media > img[data-bc-media-img] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: none;
}
.mnyra-bc__media[data-has-media="1"] > img[data-bc-media-img] { display: block; }
.mnyra-bc__media-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  text-align: center;
  color: #94a3b8;
  background: linear-gradient(150deg, #f1f5f9 0%, #e2e8f0 100%);
}
.mnyra-bc__media[data-has-media="1"] .mnyra-bc__media-empty { display: none; }
.mnyra-bc__media-empty svg { width: 26px; height: 26px; }
.mnyra-bc__media-empty span {
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.35;
}
.mnyra-bc__post-caption {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  padding: 12px 14px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.55);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #ffffff;
}
.mnyra-bc__post-caption-text {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.45;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}
.mnyra-bc__post-caption-row {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 9px;
  font-weight: 900;
}
.mnyra-bc__post-caption-row span { display: inline-flex; align-items: center; gap: 5px; }
.mnyra-bc__post-caption-row svg { width: 13px; height: 13px; }
.mnyra-bc__tile-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.1) 45%, rgba(0, 0, 0, 0.2) 100%);
  pointer-events: none;
}
.mnyra-bc__tile-logo {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  padding: 2px;
  background: linear-gradient(135deg, #f59e0b 0%, #db2777 100%);
}
.mnyra-bc__tile-logo img {
  position: static;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
  background: #ffffff;
  border: 1.5px solid rgba(0, 0, 0, 0.6);
}
.mnyra-bc__tile-name {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-bc__full-top {
  position: absolute;
  left: 10px;
  right: 10px;
  top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mnyra-bc__full-bar {
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
}
.mnyra-bc__full-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  max-width: 100%;
  padding: 6px 10px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.28);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.14);
}
.mnyra-bc__full-brand img {
  position: static;
  display: block;
  width: 22px;
  height: 22px;
  border-radius: 8px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.12);
  flex: 0 0 auto;
}
.mnyra-bc__full-brand-name {
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.mnyra-bc__full-bottom {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mnyra-bc__full-caption {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.94);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}
.mnyra-bc__full-product {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 7px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.55);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.16);
}
.mnyra-bc__full-product[data-visible="1"] { display: flex; }
.mnyra-bc__full-product img {
  position: static;
  display: block;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.1);
  flex: 0 0 auto;
}
.mnyra-bc__full-product-main { flex: 1; min-width: 0; }
.mnyra-bc__full-product-name {
  font-size: 11px;
  font-weight: 900;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-bc__full-product-price {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 1px;
}
.mnyra-bc__full-product-btn {
  flex: 0 0 auto;
  padding: 6px 10px;
  border-radius: 11px;
  background: #ffffff;
  color: #0f172a;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.04em;
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
  const createPost = typeof api.createPostFn === "function" ? api.createPostFn : null;
  const createStory = typeof api.createStoryFn === "function" ? api.createStoryFn : null;
  const afterPublish = typeof api.afterPublishFn === "function" ? api.afterPublishFn : (() => {});
  const formatPrice = typeof api.formatPriceFn === "function" ? api.formatPriceFn : ((value) => String(value ?? ""));
  const optimizeImageUrl = typeof api.getOptimizedImageUrlFn === "function"
    ? api.getOptimizedImageUrlFn
    : ((value) => String(value || "").trim());

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
              <div class="mnyra-bc__card">
                <div class="mnyra-bc__card-head">
                  <img class="mnyra-bc__card-logo" data-bc-logo alt="" decoding="async" />
                  <div class="mnyra-bc__card-name" data-bc-name></div>
                </div>
                <div class="mnyra-bc__media mnyra-bc__media--post" data-bc-media="post">
                  <img data-bc-media-img alt="" decoding="async" />
                  <div class="mnyra-bc__media-empty">${ICON.camera}<span>${TEXT.previewEmpty}</span></div>
                  <div class="mnyra-bc__post-caption">
                    <p class="mnyra-bc__post-caption-text" data-bc-post-caption></p>
                    <div class="mnyra-bc__post-caption-row">
                      <span>${ICON.heart}0</span><span>${ICON.comment}0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mnyra-bc__pane" data-bc-pane="story">
              <div class="mnyra-bc__story-grid">
                <div>
                  <p class="mnyra-bc__preview-caption">${TEXT.previewStoryTile}</p>
                  <div class="mnyra-bc__media mnyra-bc__media--tile" data-bc-media="tile">
                    <img data-bc-media-img alt="" decoding="async" />
                    <div class="mnyra-bc__media-empty">${ICON.camera}<span>${TEXT.previewEmpty}</span></div>
                    <div class="mnyra-bc__tile-shade"></div>
                    <div class="mnyra-bc__tile-logo"><img data-bc-tile-logo alt="" decoding="async" /></div>
                    <div class="mnyra-bc__tile-name" data-bc-tile-name></div>
                  </div>
                </div>
                <div>
                  <p class="mnyra-bc__preview-caption">${TEXT.previewStoryFull}</p>
                  <div class="mnyra-bc__media mnyra-bc__media--full" data-bc-media="full">
                    <img data-bc-media-img alt="" decoding="async" />
                    <div class="mnyra-bc__media-empty">${ICON.camera}<span>${TEXT.previewEmpty}</span></div>
                    <div class="mnyra-bc__full-top">
                      <div class="mnyra-bc__full-bar"></div>
                      <div class="mnyra-bc__full-brand">
                        <img data-bc-full-logo alt="" decoding="async" />
                        <div class="mnyra-bc__full-brand-name" data-bc-full-name></div>
                      </div>
                    </div>
                    <div class="mnyra-bc__full-bottom">
                      <div class="mnyra-bc__full-caption" data-bc-full-caption></div>
                      <div class="mnyra-bc__full-product" data-bc-full-product>
                        <img data-bc-full-product-img alt="" decoding="async" />
                        <div class="mnyra-bc__full-product-main">
                          <div class="mnyra-bc__full-product-name" data-bc-full-product-name></div>
                          <div class="mnyra-bc__full-product-price" data-bc-full-product-price></div>
                        </div>
                        <span class="mnyra-bc__full-product-btn">Shiko</span>
                      </div>
                    </div>
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
      logo: q("[data-bc-logo]"),
      name: q("[data-bc-name]"),
      mediaPost: q('[data-bc-media="post"]'),
      mediaTile: q('[data-bc-media="tile"]'),
      mediaFull: q('[data-bc-media="full"]'),
      postCaption: q("[data-bc-post-caption]"),
      tileLogo: q("[data-bc-tile-logo]"),
      tileName: q("[data-bc-tile-name]"),
      fullLogo: q("[data-bc-full-logo]"),
      fullName: q("[data-bc-full-name]"),
      fullCaption: q("[data-bc-full-caption]"),
      fullProduct: q("[data-bc-full-product]"),
      fullProductImg: q("[data-bc-full-product-img]"),
      fullProductName: q("[data-bc-full-product-name]"),
      fullProductPrice: q("[data-bc-full-product-price]"),
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

  function setMediaSource(url = "") {
    const safe = String(url || "").trim();
    [nodes.mediaPost, nodes.mediaTile, nodes.mediaFull].forEach((wrap) => {
      if (!wrap) return;
      const img = wrap.querySelector("[data-bc-media-img]");
      if (img) {
        if (safe) {
          if (img.getAttribute("src") !== safe) img.setAttribute("src", safe);
        } else {
          img.removeAttribute("src");
        }
      }
      wrap.setAttribute("data-has-media", safe ? "1" : "0");
    });
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

  function syncBusinessIdentity() {
    let meta = {};
    try {
      meta = getBusinessMeta() || {};
    } catch {}
    const name = String(meta.name || "").trim() || TEXT.businessFallback;
    const logoUrl = String(meta.logoUrl || "").trim();
    if (nodes.name) nodes.name.textContent = name;
    if (nodes.tileName) nodes.tileName.textContent = name;
    if (nodes.fullName) nodes.fullName.textContent = name;
    setImageNode(nodes.logo, logoUrl);
    setImageNode(nodes.tileLogo, logoUrl);
    setImageNode(nodes.fullLogo, logoUrl);
  }

  function syncCaptionPreview() {
    const caption = String(currentDraft().caption || "").trim();
    const shown = caption || TEXT.captionFallback;
    if (nodes.postCaption) nodes.postCaption.textContent = shown;
    if (nodes.fullCaption) nodes.fullCaption.textContent = shown;
  }

  function syncProductPreview() {
    const product = mode === "story" ? currentDraft().product : null;
    const visible = product ? "1" : "0";
    if (nodes.chip) nodes.chip.setAttribute("data-visible", visible);
    if (nodes.fullProduct) nodes.fullProduct.setAttribute("data-visible", visible);
    if (nodes.tag) nodes.tag.setAttribute("data-active", visible);
    if (nodes.tagLabel) nodes.tagLabel.textContent = product ? product.name : TEXT.tagProduct;
    if (!product) return;
    const priceLabel = formatComposerPrice(product.price);
    const thumb = product.imageUrl ? optimizeImageUrl(product.imageUrl, "thumb") : "";
    if (nodes.chipName) nodes.chipName.textContent = product.name;
    if (nodes.chipPrice) nodes.chipPrice.textContent = priceLabel;
    setImageNode(nodes.chipImg, thumb);
    if (nodes.fullProductName) nodes.fullProductName.textContent = product.name;
    if (nodes.fullProductPrice) nodes.fullProductPrice.textContent = priceLabel;
    setImageNode(nodes.fullProductImg, thumb);
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
    setMediaSource(draft.previewUrl);
    syncBusinessIdentity();
    syncCaptionPreview();
    syncProductPreview();
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
    setMediaSource(draft.previewUrl);
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
    syncMode();
    if (!open) {
      const host = ensureOverlayHost(doc);
      if (host && root.parentNode !== host) host.appendChild(root);
      open = true;
    }
    if (nodes.body) nodes.body.scrollTop = 0;
    syncChrome();
    // Produkte im Hintergrund vorladen, damit das Produkt-Popup sofort steht.
    if (mode === "story") ensureProductsLoaded();
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
