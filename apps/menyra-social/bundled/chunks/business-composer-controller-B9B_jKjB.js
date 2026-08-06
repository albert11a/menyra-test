const ee="mnyraBusinessComposerStyles",ye="businessComposerOverlayRoot";const j="mnyraBusinessComposerToast",he="#f8fafc",G="#ffffff",i=Object.freeze({titlePost:"Postim i ri",titleStory:"Story e re",submit:"Posto",submitBusy:"Duke postuar…",close:"Mbyll",placeholderPost:"Shkruaj diçka për postimin tënd…",placeholderStory:"Shkruaj diçka për story-n tënde…",addPhoto:"Shto foto",changePhoto:"Ndrysho foton",tagProduct:"Etiketo produkt",removeProduct:"Hiq produktin",productOptional:"Produkti nuk është i detyrueshëm.",hintNeedBoth:"Që të postosh, duhen edhe teksti edhe fotoja.",hintReady:"Gati për t'u postuar.",previewTitle:"Parapamje",previewPost:"Si duket në Zbulo",previewStoryTile:"Në Zbulo",previewStoryFull:"Kur hapet story-a",previewEmpty:"Zgjidh një foto për ta parë parapamjen.",pickerTitle:"Zgjidh një produkt",pickerSearch:"Kërko ushqime ose pije…",pickerConfirm:"Zgjidh produktin",pickerEmpty:"Nuk u gjet asnjë produkt.",pickerLoading:"Duke ngarkuar produktet…",pickerError:"Produktet nuk u ngarkuan.",pickerRetry:"Provo përsëri",errorImageType:"Lejohet vetëm foto (JPG, PNG ose WEBP).",errorImageSize:"Fotoja duhet të jetë deri në 15MB.",errorNoBusiness:"Kjo llogari nuk është e lidhur me një biznes.",errorGeneric:"Postimi dështoi. Provo përsëri.",errorOffline:"Nuk ka lidhje me internetin. Provo përsëri.",successPost:"Postimi u publikua.",successStory:"Story u publikua.",captionFallback:"Pa tekst",businessFallback:"Biznesi im"}),v='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"',y=Object.freeze({close:`<svg ${v}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,image:`<svg ${v}><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`,tag:`<svg ${v}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>`,plus:`<svg ${v}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`,camera:`<svg ${v}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,check:`<svg ${v}><path d="M20 6 9 17l-5-5"></path></svg>`,search:`<svg ${v}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,heart:`<svg ${v}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`,comment:`<svg ${v}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>`}),xe=`
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
#${j} {
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
#${j}[data-visible="1"] { opacity: 1; }
@media (min-width: 640px) {
  .mnyra-bc__sheet { max-width: 560px; margin: 0 auto; }
  .mnyra-bc__picker { padding-bottom: 24px; }
  .mnyra-bc__picker-sheet { max-width: 520px; margin: 0 auto; }
}
`;function _e(d){if(!(!d||d.getElementById(ee)))try{const s=d.createElement("style");s.id=ee,s.textContent=xe,d.head?.appendChild(s)}catch{}}function ve(d){if(!d?.body)return null;let s=d.getElementById("overlayRoot");return s||(s=d.createElement("div"),s.id="overlayRoot",s.style.position="relative",s.style.zIndex="200",s.style.isolation="isolate",d.body.appendChild(s)),s}function we(d="",s={}){const o=s&&typeof s=="object"?s:{},n=String(d||"").trim();if(!n)return null;const m=o.imageUrl||o.image||(Array.isArray(o.images)?o.images[0]:"")||"",S=String(o.type||o.menuType||"").trim().toLowerCase(),$=["drink","drinks","beverage","getraenke","getränke"].includes(S)?"drink":"food";return{id:n,name:String(o.name||o.title||"").trim()||n,price:o.price??"",category:String(o.category||"").trim(),type:$,imageUrl:typeof m=="string"?m.trim():""}}function ke(d=[],s=""){const o=Array.isArray(d)?d:[],n=String(s||"").trim().toLowerCase();return n?o.filter(m=>`${m?.name||""} ${m?.category||""}`.toLowerCase().includes(n)):o}function te({caption:d="",hasImage:s=!1,submitting:o=!1}={}){return o||!s?!1:String(d||"").trim().length>0}function Pe({documentObj:d=null,windowObj:s=null,api:o={}}={}){const n=d||(typeof document>"u"?null:document),m=s||n?.defaultView||(typeof window>"u"?null:window),S=typeof o.getRestaurantIdFn=="function"?o.getRestaurantIdFn:(()=>""),$=typeof o.getBusinessMetaFn=="function"?o.getBusinessMetaFn:(()=>({name:"",logoUrl:""})),D=typeof o.loadProductsFn=="function"?o.loadProductsFn:null,H=typeof o.uploadImageFn=="function"?o.uploadImageFn:null,Z=typeof o.createPostFn=="function"?o.createPostFn:null,q=typeof o.createStoryFn=="function"?o.createStoryFn:null,ae=typeof o.afterPublishFn=="function"?o.afterPublishFn:(()=>{}),re=typeof o.formatPriceFn=="function"?o.formatPriceFn:(e=>String(e??"")),X=typeof o.getOptimizedImageUrlFn=="function"?o.getOptimizedImageUrlFn:(e=>String(e||"").trim()),O={post:{caption:"",file:null,previewUrl:"",product:null},story:{caption:"",file:null,previewUrl:"",product:null}},l={status:"idle",items:[],restaurantId:""};let b=null,t=null,k="post",P=!1,u=!1,g=null,K=!1,I=0;function h(){return O[k]||O.post}function V(e=""){const a=String(e||"").trim();if(a.startsWith("blob:"))try{m?.URL?.revokeObjectURL?.(a)}catch{}}function ie(){return`
      <div class="mnyra-bc__sheet">
        <header class="mnyra-bc__head">
          <button type="button" class="mnyra-bc__x" data-bc-close aria-label="${i.close}" title="${i.close}">${y.close}</button>
          <div class="mnyra-bc__title" data-bc-title></div>
          <button type="button" class="mnyra-bc__submit" data-bc-submit disabled>
            <span class="mnyra-bc__spinner"></span><span data-bc-submit-label>${i.submit}</span>
          </button>
        </header>
        <div class="mnyra-bc__body" data-bc-body>
          <div class="mnyra-bc__compose">
            <textarea class="mnyra-bc__text" data-bc-text maxlength="600" rows="5" enterkeyhint="done"></textarea>
            <div class="mnyra-bc__tools">
              <button type="button" class="mnyra-bc__tool" data-bc-photo>
                ${y.image}<span class="mnyra-bc__tool-label" data-bc-photo-label>${i.addPhoto}</span>
              </button>
              <button type="button" class="mnyra-bc__tool" data-bc-tag hidden>
                ${y.tag}<span class="mnyra-bc__tool-label" data-bc-tag-label>${i.tagProduct}</span>
              </button>
            </div>
          </div>
          <div class="mnyra-bc__product-chip" data-bc-chip>
            <img class="mnyra-bc__product-chip-thumb" data-bc-chip-img alt="" decoding="async" />
            <div class="mnyra-bc__product-chip-main">
              <div class="mnyra-bc__product-chip-name" data-bc-chip-name></div>
              <div class="mnyra-bc__product-chip-price" data-bc-chip-price></div>
            </div>
            <button type="button" class="mnyra-bc__product-chip-remove" data-bc-chip-remove>${i.removeProduct}</button>
          </div>
          <p class="mnyra-bc__hint" data-bc-hint></p>
          <div class="mnyra-bc__error" data-bc-error role="alert"></div>

          <section class="mnyra-bc__preview">
            <p class="mnyra-bc__preview-title">${i.previewTitle}</p>

            <div class="mnyra-bc__pane" data-bc-pane="post">
              <p class="mnyra-bc__preview-caption">${i.previewPost}</p>
              <div class="mnyra-bc__card">
                <div class="mnyra-bc__card-head">
                  <img class="mnyra-bc__card-logo" data-bc-logo alt="" decoding="async" />
                  <div class="mnyra-bc__card-name" data-bc-name></div>
                </div>
                <div class="mnyra-bc__media mnyra-bc__media--post" data-bc-media="post">
                  <img data-bc-media-img alt="" decoding="async" />
                  <div class="mnyra-bc__media-empty">${y.camera}<span>${i.previewEmpty}</span></div>
                  <div class="mnyra-bc__post-caption">
                    <p class="mnyra-bc__post-caption-text" data-bc-post-caption></p>
                    <div class="mnyra-bc__post-caption-row">
                      <span>${y.heart}0</span><span>${y.comment}0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mnyra-bc__pane" data-bc-pane="story">
              <div class="mnyra-bc__story-grid">
                <div>
                  <p class="mnyra-bc__preview-caption">${i.previewStoryTile}</p>
                  <div class="mnyra-bc__media mnyra-bc__media--tile" data-bc-media="tile">
                    <img data-bc-media-img alt="" decoding="async" />
                    <div class="mnyra-bc__media-empty">${y.camera}<span>${i.previewEmpty}</span></div>
                    <div class="mnyra-bc__tile-shade"></div>
                    <div class="mnyra-bc__tile-logo"><img data-bc-tile-logo alt="" decoding="async" /></div>
                    <div class="mnyra-bc__tile-name" data-bc-tile-name></div>
                  </div>
                </div>
                <div>
                  <p class="mnyra-bc__preview-caption">${i.previewStoryFull}</p>
                  <div class="mnyra-bc__media mnyra-bc__media--full" data-bc-media="full">
                    <img data-bc-media-img alt="" decoding="async" />
                    <div class="mnyra-bc__media-empty">${y.camera}<span>${i.previewEmpty}</span></div>
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
              <span class="mnyra-bc__picker-title">${i.pickerTitle}</span>
              <button type="button" class="mnyra-bc__x" data-bc-picker-close aria-label="${i.close}" title="${i.close}">${y.close}</button>
            </div>
            <div class="mnyra-bc__picker-search">
              ${y.search}
              <input type="search" data-bc-picker-search placeholder="${i.pickerSearch}" autocomplete="off" />
            </div>
            <div class="mnyra-bc__picker-list" data-bc-picker-list></div>
            <div class="mnyra-bc__picker-foot">
              <p class="mnyra-bc__picker-note">${i.productOptional}</p>
              <button type="button" class="mnyra-bc__picker-confirm" data-bc-picker-confirm disabled>${i.pickerConfirm}</button>
            </div>
          </div>
        </div>
      </div>
      <input type="file" accept="image/*" data-bc-file hidden />
    `}function ne(){if(b||!n)return b;_e(n),b=n.createElement("div"),b.id=ye,b.className="mnyra-bc modal-overlay",b.setAttribute("data-modal-surface",G),b.style.setProperty("--modal-surface",G),b.innerHTML=ie();const e=a=>b.querySelector(a);return t={title:e("[data-bc-title]"),close:e("[data-bc-close]"),submit:e("[data-bc-submit]"),submitLabel:e("[data-bc-submit-label]"),body:e("[data-bc-body]"),text:e("[data-bc-text]"),photo:e("[data-bc-photo]"),photoLabel:e("[data-bc-photo-label]"),tag:e("[data-bc-tag]"),tagLabel:e("[data-bc-tag-label]"),chip:e("[data-bc-chip]"),chipImg:e("[data-bc-chip-img]"),chipName:e("[data-bc-chip-name]"),chipPrice:e("[data-bc-chip-price]"),chipRemove:e("[data-bc-chip-remove]"),hint:e("[data-bc-hint]"),error:e("[data-bc-error]"),panePost:e('[data-bc-pane="post"]'),paneStory:e('[data-bc-pane="story"]'),logo:e("[data-bc-logo]"),name:e("[data-bc-name]"),mediaPost:e('[data-bc-media="post"]'),mediaTile:e('[data-bc-media="tile"]'),mediaFull:e('[data-bc-media="full"]'),postCaption:e("[data-bc-post-caption]"),tileLogo:e("[data-bc-tile-logo]"),tileName:e("[data-bc-tile-name]"),fullLogo:e("[data-bc-full-logo]"),fullName:e("[data-bc-full-name]"),fullCaption:e("[data-bc-full-caption]"),fullProduct:e("[data-bc-full-product]"),fullProductImg:e("[data-bc-full-product-img]"),fullProductName:e("[data-bc-full-product-name]"),fullProductPrice:e("[data-bc-full-product-price]"),picker:e("[data-bc-picker]"),pickerClose:e("[data-bc-picker-close]"),pickerSearch:e("[data-bc-picker-search]"),pickerList:e("[data-bc-picker-list]"),pickerConfirm:e("[data-bc-picker-confirm]"),file:e("[data-bc-file]")},fe(),b}function W(e=""){const a=String(e||"").trim();[t.mediaPost,t.mediaTile,t.mediaFull].forEach(r=>{if(!r)return;const c=r.querySelector("[data-bc-media-img]");c&&(a?c.getAttribute("src")!==a&&c.setAttribute("src",a):c.removeAttribute("src")),r.setAttribute("data-has-media",a?"1":"0")})}function E(e,a=""){if(!e)return;const r=String(a||"").trim();r?(e.getAttribute("src")!==r&&e.setAttribute("src",r),e.style.visibility=""):(e.removeAttribute("src"),e.style.visibility="hidden")}function oe(){let e={};try{e=$()||{}}catch{}const a=String(e.name||"").trim()||i.businessFallback,r=String(e.logoUrl||"").trim();t.name&&(t.name.textContent=a),t.tileName&&(t.tileName.textContent=a),t.fullName&&(t.fullName.textContent=a),E(t.logo,r),E(t.tileLogo,r),E(t.fullLogo,r)}function Y(){const a=String(h().caption||"").trim()||i.captionFallback;t.postCaption&&(t.postCaption.textContent=a),t.fullCaption&&(t.fullCaption.textContent=a)}function U(){const e=k==="story"?h().product:null,a=e?"1":"0";if(t.chip&&t.chip.setAttribute("data-visible",a),t.fullProduct&&t.fullProduct.setAttribute("data-visible",a),t.tag&&t.tag.setAttribute("data-active",a),t.tagLabel&&(t.tagLabel.textContent=e?e.name:i.tagProduct),!e)return;const r=J(e.price),c=e.imageUrl?X(e.imageUrl,"thumb"):"";t.chipName&&(t.chipName.textContent=e.name),t.chipPrice&&(t.chipPrice.textContent=r),E(t.chipImg,c),t.fullProductName&&(t.fullProductName.textContent=e.name),t.fullProductPrice&&(t.fullProductPrice.textContent=r),E(t.fullProductImg,c)}function J(e){if(e==null||e==="")return"";let a="";try{a=String(re(e)||"").trim()}catch{a=""}return a==="-"?"":a}function z(){const e=h(),a=te({caption:e.caption,hasImage:!!e.file,submitting:u});t.submit&&(t.submit.disabled=!a,t.submit.setAttribute("aria-disabled",a?"false":"true")),t.hint&&(u?(t.hint.textContent=i.submitBusy,t.hint.setAttribute("data-tone","busy")):a?(t.hint.textContent=i.hintReady,t.hint.setAttribute("data-tone","ready")):(t.hint.textContent=i.hintNeedBoth,t.hint.setAttribute("data-tone","idle")))}function x(e=""){if(!t.error)return;const a=String(e||"").trim();t.error.textContent=a,t.error.setAttribute("data-visible",a?"1":"0")}function ce(){const e=k==="story",a=h();t.title&&(t.title.textContent=e?i.titleStory:i.titlePost),t.text&&(t.text.placeholder=e?i.placeholderStory:i.placeholderPost,t.text.value!==a.caption&&(t.text.value=a.caption)),t.tag&&(t.tag.hidden=!e),t.photoLabel&&(t.photoLabel.textContent=a.file?i.changePhoto:i.addPhoto),t.photo&&t.photo.setAttribute("data-active",a.file?"1":"0"),t.panePost&&t.panePost.setAttribute("data-visible",e?"0":"1"),t.paneStory&&t.paneStory.setAttribute("data-visible",e?"1":"0"),W(a.previewUrl),oe(),Y(),U(),z(),x("")}function N(e){u=!!e,b&&b.setAttribute("data-busy",u?"1":"0"),t.submitLabel&&(t.submitLabel.textContent=u?i.submitBusy:i.submit),t.close&&(t.close.disabled=u),t.text&&(t.text.readOnly=u),z()}function se(e){if(!e)return;if(!String(e.type||"").toLowerCase().startsWith("image/")){x(i.errorImageType);return}if(Number(e.size||0)>15728640){x(i.errorImageSize);return}const r=h();V(r.previewUrl),r.file=e,r.previewUrl="";try{r.previewUrl=m?.URL?.createObjectURL?m.URL.createObjectURL(e):""}catch{r.previewUrl=""}x(""),W(r.previewUrl),t.photoLabel&&(t.photoLabel.textContent=i.changePhoto),t.photo&&t.photo.setAttribute("data-active","1"),z()}function M({force:e=!1}={}){const a=String(S()||"").trim();if(!a||!D){l.status="error",L();return}l.restaurantId!==a&&(l.restaurantId=a,l.status="idle",l.items=[]),!(!e&&(l.status==="loading"||l.status==="ready"))&&(l.status="loading",L(),(async()=>{try{const r=await D(a);if(l.restaurantId!==a)return;l.items=Array.isArray(r)?r:[],l.status="ready"}catch{if(l.restaurantId!==a)return;l.items=[],l.status="error"}L()})())}function B(e,a=!1){if(!t.pickerList)return;t.pickerList.textContent="";const r=n.createElement("div");if(r.className="mnyra-bc__picker-state",r.textContent=e,a){const c=n.createElement("button");c.type="button",c.textContent=i.pickerRetry,c.addEventListener("click",()=>M({force:!0})),r.appendChild(n.createElement("br")),r.appendChild(c)}t.pickerList.appendChild(r)}function L(){if(!t.pickerList)return;if(l.status==="loading"||l.status==="idle"){B(i.pickerLoading),A();return}if(l.status==="error"){B(i.pickerError,!0),A();return}const e=String(t.pickerSearch?.value||""),a=ke(l.items,e);if(!a.length){B(i.pickerEmpty),A();return}const r=n.createDocumentFragment();a.forEach(c=>{const p=n.createElement("button");p.type="button",p.className="mnyra-bc__picker-row",p.dataset.bcPickerItem=c.id,g&&g.id===c.id&&p.setAttribute("data-selected","1");const f=n.createElement("img");f.className="mnyra-bc__picker-thumb",f.alt="",f.loading="lazy",f.decoding="async",c.imageUrl&&(f.src=X(c.imageUrl,"thumb")),p.appendChild(f);const _=n.createElement("div");_.className="mnyra-bc__picker-main";const w=n.createElement("div");w.className="mnyra-bc__picker-name",w.textContent=c.name,_.appendChild(w);const F=n.createElement("div");F.className="mnyra-bc__picker-meta",F.textContent=[c.category,J(c.price)].filter(Boolean).join(" · "),_.appendChild(F),p.appendChild(_);const R=n.createElement("span");R.className="mnyra-bc__picker-mark",R.innerHTML=y.check,p.appendChild(R),r.appendChild(p)}),t.pickerList.textContent="",t.pickerList.appendChild(r),A()}function A(){t.pickerConfirm&&(t.pickerConfirm.disabled=!g)}function le(){k!=="story"||u||(g=h().product||null,t.pickerSearch&&(t.pickerSearch.value=""),t.picker&&t.picker.setAttribute("data-visible","1"),M(),L())}function C(){t.picker&&t.picker.setAttribute("data-visible","0"),g=null}function de(){return t?.picker?.getAttribute("data-visible")==="1"}function pe(e=""){if(!n?.body)return;let a=n.getElementById(j);a||(a=n.createElement("div"),a.id=j,a.setAttribute("role","status"),n.body.appendChild(a)),a.textContent=String(e||""),a.setAttribute("data-visible","1"),I&&m?.clearTimeout?.(I),I=m?.setTimeout?.(()=>{a.setAttribute("data-visible","0"),I=0},2600)||0}function Q(){if(!n)return;const e=!!n.querySelector("#overlayRoot .modal-overlay"),a=e?G:he;try{n.documentElement.style.setProperty("--active-modal-surface",a),n.documentElement.classList.toggle("modal-open",e),n.body.classList.toggle("modal-open",e);const r=n.getElementById("modalUnderlay");r&&(r.classList.toggle("hidden",!e),r.style.background=a),["safariChromeTintTop","safariChromeTintBottom"].forEach(p=>{const f=n.getElementById(p);f&&(f.style.display=e?"block":"none",f.style.background=a)});const c=n.head?.querySelector('meta[name="theme-color"]');c&&c.setAttribute("content",a)}catch{}}function be(){K||!n||(K=!0,n.addEventListener("keydown",e=>{if(!(e.key!=="Escape"||!P)){if(de()){C(),e.preventDefault();return}u||(T(),e.preventDefault())}}))}function fe(){t.close?.addEventListener("click",()=>{u||T()}),t.submit?.addEventListener("click",()=>{ue()}),t.text?.addEventListener("input",()=>{const e=h();e.caption=String(t.text.value||""),Y(),z()}),t.photo?.addEventListener("click",()=>{u||(x(""),t.file?.click())}),t.file?.addEventListener("change",()=>{const e=t.file?.files?.[0]||null;se(e),t.file&&(t.file.value="")}),t.tag?.addEventListener("click",()=>le()),t.chipRemove?.addEventListener("click",()=>{u||(h().product=null,U())}),t.pickerClose?.addEventListener("click",()=>C()),t.picker?.addEventListener("click",e=>{e.target===t.picker&&C()}),t.pickerSearch?.addEventListener("input",()=>L()),t.pickerList?.addEventListener("click",e=>{const a=e.target?.closest?.("[data-bc-picker-item]");if(!a)return;const r=String(a.dataset.bcPickerItem||"").trim(),c=l.items.find(p=>p.id===r)||null;g=g&&g.id===r?null:c,Array.from(t.pickerList.querySelectorAll("[data-bc-picker-item]")).forEach(p=>{p.setAttribute("data-selected",g&&p.dataset.bcPickerItem===g.id?"1":"0")}),A()}),t.pickerConfirm?.addEventListener("click",()=>{g&&(h().product=g,C(),U())})}function me(e){const a=O[e];a&&(V(a.previewUrl),a.caption="",a.file=null,a.previewUrl="",a.product=null)}async function ue(){if(u)return;const e=h();if(!te({caption:e.caption,hasImage:!!e.file,submitting:u}))return;const a=String(S()||"").trim();if(!a){x(i.errorNoBusiness);return}if(m&&m.navigator&&m.navigator.onLine===!1){x(i.errorOffline);return}if(!H||(k==="story"?!q:!Z)){x(i.errorGeneric);return}const r=k,c=String(e.caption||"").trim().slice(0,600),p=e.file;N(!0),x("");try{const f=await H(p,a),_=String(f?.cdnUrl||f?.url||"").trim();if(!_)throw new Error(i.errorGeneric);if(r==="story"){const w=e.product;await q({restaurantId:a,caption:c,mediaUrl:_,mediaType:"image",menuItemId:w?.id||"",menuItemName:w?.name||"",menuItemPrice:w?.price??"",menuItemImage:w?.imageUrl||""})}else await Z({restaurantId:a,caption:c,mediaUrl:_,mediaType:"image"});N(!1),T(),me(r),pe(r==="story"?i.successStory:i.successPost);try{await ae(r)}catch{}}catch(f){N(!1);const _=String(f?.message||"").trim();x(_||i.errorGeneric)}}function ge(e="post"){if(!n)return;const a=String(e||"").trim().toLowerCase()==="story"?"story":"post";if(ne(),!!b){if(be(),k=a,C(),N(!1),ce(),!P){const r=ve(n);r&&b.parentNode!==r&&r.appendChild(b),P=!0}t.body&&(t.body.scrollTop=0),Q(),k==="story"&&M()}}function T(){if(P){P=!1,C();try{b?.remove()}catch{}Q()}}return Object.freeze({open:ge,close:T,isOpen:()=>P})}export{xe as BUSINESS_COMPOSER_CSS,te as canPublishComposerDraftCore,Pe as createBusinessComposerController,ke as filterComposerProductsCore,we as normalizeComposerProductCore};
