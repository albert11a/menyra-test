import{au as Ke,av as Ge,aw as qe,ax as Ze,ay as Xe}from"./domain-feed-social-eager-CSzqAfRb.js";import{r as Ye}from"./profile-post-card-markup-utils-HwqIiXgP.js";import{o as We}from"./domain-media-eager-B3Bb4ghO.js";import"./domain-auth-Aq-4Vdvh.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-menu-eager-BUdqOprI.js";const he="mnyraBusinessComposerStyles",ye=448,Qe=10,ge=Object.freeze(["linear-gradient(150deg,#94a3b8 0%,#475569 55%,#1e293b 100%)","linear-gradient(150deg,#a5b4fc 0%,#6366f1 55%,#312e81 100%)"]),Je="businessComposerOverlayRoot",et=15*1024*1024,tt=50*1024*1024,M=600,K="mnyraBusinessComposerToast",rt="#f8fafc",Y="#ffffff",a=Object.freeze({titlePost:"Postim i ri",titleStory:"Story e re",titleProfile:"Postim për profilin",submit:"Posto",submitBusy:"Duke postuar…",close:"Mbyll",placeholderPost:"Shkruaj diçka për postimin tënd…",placeholderStory:"Shkruaj diçka për story-n tënde…",placeholderProfile:"Shkruaj diçka për profilin tënd…",addPhoto:"Foto / Video",changePhoto:"Ndrysho median",removeProduct:"Hiq produktin",hintNeedBoth:"Që të postosh, duhen edhe teksti edhe fotoja ose videoja.",hintReady:"Gati për t'u postuar.",switchPost:"Postim",switchStory:"Story",switchProfile:"Profil",switchLabel:"Zgjidh llojin e postimit",previewTitle:"Parapamje",previewPost:"Si duket në Zbulo",previewStory:"Në rreshtin e story-ve",previewProfile:"Si duket në profilin tënd",pickerConfirm:"Zgjidh",pickerLoading:"Duke ngarkuar…",pickerError:"Lista nuk u ngarkua.",pickerRetry:"Provo përsëri",errorMediaType:"Lejohen vetëm foto ose video.",errorImageSize:"Fotoja duhet të jetë deri në 15MB.",errorVideoSize:"Videoja duhet të jetë deri në 50MB.",errorNoBusiness:"Kjo llogari nuk është e lidhur me një biznes.",errorGeneric:"Postimi dështoi. Provo përsëri.",errorOffline:"Nuk ka lidhje me internetin. Provo përsëri.",successPost:"Postimi u publikua.",successStory:"Story u publikua.",successProfile:"Postimi u publikua në profil.",businessFallback:"Biznesi im"}),ve=Object.freeze({restaurant:Object.freeze({tag:"Tag nga meny",pickerTitle:"Zgjidh nga meny",pickerSearch:"Kërko ushqime ose pije…",pickerEmpty:"Nuk u gjet asnjë produkt.",optional:"Produkti nuk është i detyrueshëm."}),shop:Object.freeze({tag:"Tag nga produktet",pickerTitle:"Zgjidh nga produktet",pickerSearch:"Kërko produkte…",pickerEmpty:"Nuk u gjet asnjë produkt.",optional:"Produkti nuk është i detyrueshëm."}),hotel:Object.freeze({tag:"Tag nga dhomat",pickerTitle:"Zgjidh nga dhomat",pickerSearch:"Kërko dhoma…",pickerEmpty:"Nuk u gjet asnjë dhomë.",optional:"Dhoma nuk është e detyrueshme."})});function it(d=""){const l=String(d||"").trim().toLowerCase();return ve[l]||ve.restaurant}const _='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"',k=Object.freeze({close:`<svg ${_}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,image:`<svg ${_}><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`,tag:`<svg ${_}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>`,plus:`<svg ${_}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`,camera:`<svg ${_}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,check:`<svg ${_}><path d="M20 6 9 17l-5-5"></path></svg>`,search:`<svg ${_}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,heart:`<svg ${_}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`,comment:`<svg ${_}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>`,user:`<svg ${_}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`}),at=`
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
/* Ein Feld: Textflaeche, duenne Trennlinie, darunter die Knoepfe und der
   Zaehler. Der Rahmen sitzt nur aussen, damit es wie ein Stueck wirkt. */
.mnyra-bc__compose {
  border: 1px solid var(--bc-line);
  border-radius: 24px;
  background: #ffffff;
  overflow: hidden;
}
.mnyra-bc__compose[data-focus="1"] { border-color: var(--bc-accent); }
.mnyra-bc__text {
  display: block;
  width: 100%;
  min-height: 128px;
  resize: none;
  border: 0;
  border-radius: 0;
  padding: 16px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
  color: var(--bc-ink);
  background: transparent;
  outline: none;
}
.mnyra-bc__text::placeholder { color: var(--bc-muted); font-weight: 600; }
.mnyra-bc__compose-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--bc-line);
}
.mnyra-bc__tools {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.mnyra-bc__tool {
  min-width: 0;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border: 1px solid var(--bc-line);
  border-radius: 999px;
  background: var(--bc-plane);
  color: var(--bc-ink-2);
  cursor: pointer;
  font-family: inherit;
}
.mnyra-bc__tool svg { width: 16px; height: 16px; flex: 0 0 auto; }
.mnyra-bc__tool[hidden] { display: none; }
.mnyra-bc__tool:active { transform: scale(0.97); }
.mnyra-bc__tool[data-active="1"] {
  border-color: var(--bc-accent);
  background: var(--bc-accent-soft);
  color: var(--bc-accent);
}
/* Lange Produktnamen kuerzen statt die Zeile zu sprengen. */
.mnyra-bc__tool-label {
  font-size: 11px;
  font-weight: 800;
  line-height: 1.2;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-bc__count {
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 800;
  color: var(--bc-muted);
  font-variant-numeric: tabular-nums;
}
.mnyra-bc__count[data-tone="full"] { color: var(--bc-accent); }
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
  gap: ${Qe}px;
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
#${K} {
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
#${K}[data-visible="1"] { opacity: 1; }
@media (min-width: 640px) {
  .mnyra-bc__sheet { max-width: 560px; margin: 0 auto; }
  .mnyra-bc__picker { padding-bottom: 24px; }
  .mnyra-bc__picker-sheet { max-width: 520px; margin: 0 auto; }
}
`;function nt(d){if(!(!d||d.getElementById(he)))try{const l=d.createElement("style");l.id=he,l.textContent=at,d.head?.appendChild(l)}catch{}}function ot(d){if(!d?.body)return null;let l=d.getElementById("overlayRoot");return l||(l=d.createElement("div"),l.id="overlayRoot",l.style.position="relative",l.style.zIndex="200",l.style.isolation="isolate",d.body.appendChild(l)),l}function ft(d="",l={}){const n=l&&typeof l=="object"?l:{},c=String(d||"").trim();if(!c)return null;const p=n.imageUrl||n.image||(Array.isArray(n.images)?n.images[0]:"")||"",I=String(n.type||n.menuType||"").trim().toLowerCase(),G=["drink","drinks","beverage","getraenke","getränke"].includes(I)?"drink":"food";return{id:c,name:String(n.name||n.title||"").trim()||c,price:n.price??"",category:String(n.category||"").trim(),type:G,imageUrl:typeof p=="string"?p.trim():""}}function ct(d=[],l=""){const n=Array.isArray(d)?d:[],c=String(l||"").trim().toLowerCase();return c?n.filter(p=>`${p?.name||""} ${p?.category||""}`.toLowerCase().includes(c)):n}function _e(d=""){const l=String(d||"").trim().toLowerCase();return l==="story"?"story":l==="profile"?"profile":"post"}function xe({caption:d="",hasImage:l=!1,submitting:n=!1}={}){return n||!l?!1:String(d||"").trim().length>0}function mt({documentObj:d=null,windowObj:l=null,api:n={}}={}){const c=d||(typeof document>"u"?null:document),p=l||c?.defaultView||(typeof window>"u"?null:window),I=typeof n.getRestaurantIdFn=="function"?n.getRestaurantIdFn:(()=>""),G=typeof n.getBusinessMetaFn=="function"?n.getBusinessMetaFn:(()=>({name:"",logoUrl:""})),W=typeof n.loadProductsFn=="function"?n.loadProductsFn:null,ke=typeof n.getBusinessKindFn=="function"?n.getBusinessKindFn:(()=>""),j=typeof n.uploadImageFn=="function"?n.uploadImageFn:null,Q=typeof n.uploadVideoFn=="function"?n.uploadVideoFn:null,J=typeof n.captureVideoPosterFn=="function"?n.captureVideoPosterFn:null,ee=typeof n.createPostFn=="function"?n.createPostFn:null,te=typeof n.createStoryFn=="function"?n.createStoryFn:null,we=typeof n.afterPublishFn=="function"?n.afterPublishFn:(()=>{}),Se=typeof n.formatPriceFn=="function"?n.formatPriceFn:(e=>String(e??"")),re=typeof n.getOptimizedImageUrlFn=="function"?n.getOptimizedImageUrlFn:(e=>String(e||"").trim()),F=typeof n.escapeHtmlFn=="function"?n.escapeHtmlFn:(e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")),A=typeof n.iconFn=="function"?n.iconFn:(()=>""),w=(e="")=>F(String(e??"")),E={post:{caption:"",file:null,previewUrl:"",mediaType:"",product:null},story:{caption:"",file:null,previewUrl:"",mediaType:"",product:null},profile:{caption:"",file:null,previewUrl:"",mediaType:"",product:null}},u={status:"idle",items:[],restaurantId:""};let f=null,t=null,m="post",C=!1,h=!1,y=null,ie=!1,ae=!1,U=0;function g(){return E[m]||E.post}function B(){let e="";try{e=String(ke()||"")}catch{e=""}return it(e)}function ne(e=""){const r=String(e||"").trim();if(r.startsWith("blob:"))try{p?.URL?.revokeObjectURL?.(r)}catch{}}function Pe(){const e=B();return`
      <div class="mnyra-bc__sheet">
        <header class="mnyra-bc__head">
          <button type="button" class="mnyra-bc__x" data-bc-close aria-label="${a.close}" title="${a.close}">${k.close}</button>
          <div class="mnyra-bc__title" data-bc-title></div>
          <button type="button" class="mnyra-bc__submit" data-bc-submit disabled>
            <span class="mnyra-bc__spinner"></span><span data-bc-submit-label>${a.submit}</span>
          </button>
        </header>
        <div class="mnyra-bc__body" data-bc-body>
          <div class="mnyra-bc__compose" data-bc-compose>
            <textarea class="mnyra-bc__text" data-bc-text maxlength="${M}" rows="5" enterkeyhint="done"></textarea>
            <div class="mnyra-bc__compose-bar">
              <div class="mnyra-bc__tools">
                <button type="button" class="mnyra-bc__tool" data-bc-photo>
                  ${k.image}<span class="mnyra-bc__tool-label" data-bc-photo-label>${a.addPhoto}</span>
                </button>
                <button type="button" class="mnyra-bc__tool" data-bc-tag>
                  ${k.tag}<span class="mnyra-bc__tool-label" data-bc-tag-label>${e.tag}</span>
                </button>
              </div>
              <span class="mnyra-bc__count" data-bc-count>0/${M}</span>
            </div>
          </div>
          <div class="mnyra-bc__product-chip" data-bc-chip>
            <img class="mnyra-bc__product-chip-thumb" data-bc-chip-img alt="" decoding="async" />
            <div class="mnyra-bc__product-chip-main">
              <div class="mnyra-bc__product-chip-name" data-bc-chip-name></div>
              <div class="mnyra-bc__product-chip-price" data-bc-chip-price></div>
            </div>
            <button type="button" class="mnyra-bc__product-chip-remove" data-bc-chip-remove>${a.removeProduct}</button>
          </div>
          <p class="mnyra-bc__hint" data-bc-hint></p>
          <div class="mnyra-bc__error" data-bc-error role="alert"></div>

          <section class="mnyra-bc__preview">
            <p class="mnyra-bc__preview-title">${a.previewTitle}</p>

            <div class="mnyra-bc__pane" data-bc-pane="post">
              <p class="mnyra-bc__preview-caption">${a.previewPost}</p>
              <div class="mnyra-bc__stage mnyra-bc__stage--bleed" data-bc-stage="post">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="post"></div>
              </div>
            </div>

            <div class="mnyra-bc__pane" data-bc-pane="profile">
              <p class="mnyra-bc__preview-caption">${a.previewProfile}</p>
              <div class="mnyra-bc__stage" data-bc-stage="profile">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="profile"></div>
              </div>
            </div>

            <div class="mnyra-bc__pane" data-bc-pane="story">
              <p class="mnyra-bc__preview-caption">${a.previewStory}</p>
              <div class="mnyra-bc__stage mnyra-bc__stage--bleed" data-bc-stage="story">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="story"></div>
              </div>
            </div>
          </section>
        </div>

        <footer class="mnyra-bc__foot">
          <div class="mnyra-bc__switch" role="tablist" aria-label="${a.switchLabel}">
            <button type="button" class="mnyra-bc__switch-btn" role="tab" data-bc-mode="post" aria-selected="true">
              ${k.image}<span>${a.switchPost}</span>
            </button>
            <button type="button" class="mnyra-bc__switch-btn" role="tab" data-bc-mode="story" aria-selected="false">
              ${k.camera}<span>${a.switchStory}</span>
            </button>
            <button type="button" class="mnyra-bc__switch-btn" role="tab" data-bc-mode="profile" aria-selected="false">
              ${k.user}<span>${a.switchProfile}</span>
            </button>
          </div>
        </footer>

        <div class="mnyra-bc__picker" data-bc-picker>
          <div class="mnyra-bc__picker-sheet">
            <div class="mnyra-bc__picker-head">
              <span class="mnyra-bc__picker-title" data-bc-picker-title>${e.pickerTitle}</span>
              <button type="button" class="mnyra-bc__x" data-bc-picker-close aria-label="${a.close}" title="${a.close}">${k.close}</button>
            </div>
            <div class="mnyra-bc__picker-search">
              ${k.search}
              <input type="search" data-bc-picker-search placeholder="${e.pickerSearch}" autocomplete="off" />
            </div>
            <div class="mnyra-bc__picker-list" data-bc-picker-list></div>
            <div class="mnyra-bc__picker-foot">
              <p class="mnyra-bc__picker-note" data-bc-picker-note>${e.optional}</p>
              <button type="button" class="mnyra-bc__picker-confirm" data-bc-picker-confirm disabled>${a.pickerConfirm}</button>
            </div>
          </div>
        </div>
      </div>
      <input type="file" accept="image/*,video/*" data-bc-file hidden />
    `}function Ce(){if(f||!c)return f;nt(c),f=c.createElement("div"),f.id=Je,f.className="mnyra-bc modal-overlay",f.setAttribute("data-modal-surface",Y),f.style.setProperty("--modal-surface",Y),f.innerHTML=Pe();const e=r=>f.querySelector(r);return t={title:e("[data-bc-title]"),close:e("[data-bc-close]"),submit:e("[data-bc-submit]"),submitLabel:e("[data-bc-submit-label]"),body:e("[data-bc-body]"),compose:e("[data-bc-compose]"),text:e("[data-bc-text]"),count:e("[data-bc-count]"),photo:e("[data-bc-photo]"),photoLabel:e("[data-bc-photo-label]"),tag:e("[data-bc-tag]"),tagLabel:e("[data-bc-tag-label]"),chip:e("[data-bc-chip]"),chipImg:e("[data-bc-chip-img]"),chipName:e("[data-bc-chip-name]"),chipPrice:e("[data-bc-chip-price]"),chipRemove:e("[data-bc-chip-remove]"),hint:e("[data-bc-hint]"),error:e("[data-bc-error]"),panePost:e('[data-bc-pane="post"]'),paneStory:e('[data-bc-pane="story"]'),paneProfile:e('[data-bc-pane="profile"]'),stageProfile:e('[data-bc-stage="profile"]'),stageProfileInner:e('[data-bc-stage-inner="profile"]'),stagePost:e('[data-bc-stage="post"]'),stagePostInner:e('[data-bc-stage-inner="post"]'),stageStory:e('[data-bc-stage="story"]'),stageStoryInner:e('[data-bc-stage-inner="story"]'),switchButtons:Array.from(f.querySelectorAll("[data-bc-mode]")),picker:e("[data-bc-picker]"),pickerTitle:e("[data-bc-picker-title]"),pickerNote:e("[data-bc-picker-note]"),pickerClose:e("[data-bc-picker-close]"),pickerSearch:e("[data-bc-picker-search]"),pickerList:e("[data-bc-picker-list]"),pickerConfirm:e("[data-bc-picker-confirm]"),file:e("[data-bc-file]")},Ne(),f}function Le(e,r=""){if(!e)return;const i=String(r||"").trim();i?(e.getAttribute("src")!==i&&e.setAttribute("src",i),e.style.visibility=""):(e.removeAttribute("src"),e.style.visibility="hidden")}function oe(){let e={};try{e=G()||{}}catch{}return{name:String(e.name||"").trim()||a.businessFallback,logoUrl:String(e.logoUrl||"").trim(),city:String(e.city||"").trim()}}function Ee(){const e=Number(p?.innerWidth)||ye;return Math.min(e,ye)}function Te(){const e=E.post,r=oe(),i=String(e.previewUrl||"").trim(),s=`<span class="block w-full h-full appearance-none bg-transparent text-left" style="display:block;width:100%;height:100%;padding:0;margin:0;border:0;background:transparent;">${i?e.mediaType==="video"?`<video src="${w(i)}" autoplay muted loop playsinline preload="metadata" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000"></video>`:`<img src="${w(i)}" decoding="async" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`:""}</span>`,b=r.logoUrl?`<img src="${w(r.logoUrl)}" decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />`:"";return Ke({business:r.name,location:r.city,content:String(e.caption||"").trim(),likes:0,comments:0,isLive:!1,logoImgHtml:b,heroMediaHtml:s,heroReady:!!i,escapeHtmlFn:F,iconFn:A})}function Ie(){const e=E.profile,r=String(e.previewUrl||"").trim(),i=r?e.mediaType==="video"?`<video src="${w(r)}" preload="metadata" muted playsinline width="400" height="500" class="w-full h-full object-cover pointer-events-none"></video>`:`<img src="${w(r)}" decoding="async" width="400" height="500" class="w-full h-full object-cover" />`:'<div class="w-full h-full bg-slate-200"></div>';return`<div class="grid grid-cols-2 gap-3" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0.75rem;">${Ye({mediaHtml:i,isVideo:e.mediaType==="video",playIconHtml:A("play","w-3.5 h-3.5 fill-white block"),likeLabel:"0",commentLabel:"0",heartIconHtml:A("heart","w-3 h-3 fill-rose-500 text-rose-500"),commentIconHtml:A("message-circle","w-3 h-3 text-indigo-200"),escapeHtmlFn:F})}</div>`}function ce({label:e,mediaHtml:r,logoImgHtml:i,first:o=!1,shellAttrs:s=""}){return qe({label:e,mediaHtml:r,logoImgHtml:i,shellAttrs:s,shellStyle:Ze({withMarginLeft:o}),innerStyle:Xe(),escapeHtmlFn:F})}function Ae(){const e=E.story,r=oe(),i=String(e.previewUrl||"").trim(),o=i?e.mediaType==="video"?`<video src="${w(i)}" autoplay muted loop playsinline preload="metadata" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;"></video>`:`<img src="${w(i)}" decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />`:Ge({iconFn:A}),s=`<img src="${w(r.logoUrl)}" decoding="async" width="28" height="28" class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />`;return ce({label:r.name,mediaHtml:o,logoImgHtml:s,first:!0,shellAttrs:"data-bc-story-own"})}function se(e=0){const r=ge[e%ge.length];return ce({label:"",mediaHtml:`<div class="absolute inset-0" style="position:absolute;inset:0;background:${r};"></div>`,logoImgHtml:"",shellAttrs:`data-bc-story-blur="${e}" aria-hidden="true"`})}function $e(){return`
      <div class="mnyra-bc__story-track">
        ${Ae()}
        ${se(0)}
        ${se(1)}
      </div>
    `}function q(e,r,i){if(!e||!r)return;const o=e.clientWidth||i;r.style.width=`${i}px`,r.style.height="";let s=Math.min(1,i>0?o/i:1);(!Number.isFinite(s)||s<=0)&&(s=1),r.style.transform=`scale(${s})`;const b=r.scrollHeight;e.style.height=`${Math.round(b*s)}px`,r.style.marginLeft=`${Math.max(0,(o-i*s)/2)}px`}function N(){if(!t||!f?.isConnected)return;const e=Ee();if(m==="story"){q(t.stageStory,t.stageStoryInner,e);return}if(m==="profile"){q(t.stageProfile,t.stageProfileInner,e);return}q(t.stagePost,t.stagePostInner,e)}function Z(){t&&(m==="story"?t.stageStoryInner&&(t.stageStoryInner.innerHTML=$e()):m==="profile"?t.stageProfileInner&&(t.stageProfileInner.innerHTML=`<div class="app-content-inline py-4">${Ie()}</div>`):t.stagePostInner&&(t.stagePostInner.innerHTML=`<div class="app-content-inline py-4">${Te()}</div>`),N(),p?.requestAnimationFrame?.(()=>N()))}function ze(){if(!t||m==="story"||m==="profile")return;const e=String(g().caption||"").trim(),r=t.stagePostInner?.querySelector(".feed-card p.line-clamp-2");r&&(r.textContent=e),N()}function le(){const e=g().product,r=e?"1":"0";if(t.chip&&t.chip.setAttribute("data-visible",r),t.tag&&t.tag.setAttribute("data-active",r),t.tagLabel&&(t.tagLabel.textContent=e?e.name:B().tag),!e)return;const i=ue(e.price),o=e.imageUrl?re(e.imageUrl,"thumb"):"";t.chipName&&(t.chipName.textContent=e.name),t.chipPrice&&(t.chipPrice.textContent=i),Le(t.chipImg,o)}function de(){le(),m==="story"&&Z()}function pe(){if(!t.count)return;const e=String(g().caption||"").length;t.count.textContent=`${e}/${M}`,t.count.setAttribute("data-tone",e>=M?"full":"idle")}function ue(e){if(e==null||e==="")return"";let r="";try{r=String(Se(e)||"").trim()}catch{r=""}return r==="-"?"":r}function O(){const e=g(),r=xe({caption:e.caption,hasImage:!!e.file,submitting:h});t.submit&&(t.submit.disabled=!r,t.submit.setAttribute("aria-disabled",r?"false":"true")),t.hint&&(h?(t.hint.textContent=a.submitBusy,t.hint.setAttribute("data-tone","busy")):r?(t.hint.textContent=a.hintReady,t.hint.setAttribute("data-tone","ready")):(t.hint.textContent=a.hintNeedBoth,t.hint.setAttribute("data-tone","idle")))}function v(e=""){if(!t.error)return;const r=String(e||"").trim();t.error.textContent=r,t.error.setAttribute("data-visible",r?"1":"0")}function be(){const e=m==="story",r=m==="profile",i=g();t.title&&(t.title.textContent=e?a.titleStory:r?a.titleProfile:a.titlePost),t.text&&(t.text.placeholder=e?a.placeholderStory:r?a.placeholderProfile:a.placeholderPost,t.text.value!==i.caption&&(t.text.value=i.caption));const o=B();t.pickerTitle&&(t.pickerTitle.textContent=o.pickerTitle),t.pickerNote&&(t.pickerNote.textContent=o.optional),t.pickerSearch&&(t.pickerSearch.placeholder=o.pickerSearch),t.photoLabel&&(t.photoLabel.textContent=i.file?a.changePhoto:a.addPhoto),t.photo&&t.photo.setAttribute("data-active",i.file?"1":"0"),t.panePost&&t.panePost.setAttribute("data-visible",m==="post"?"1":"0"),t.paneStory&&t.paneStory.setAttribute("data-visible",e?"1":"0"),t.paneProfile&&t.paneProfile.setAttribute("data-visible",r?"1":"0"),(t.switchButtons||[]).forEach(s=>{const b=s.getAttribute("data-bc-mode")===m;s.setAttribute("aria-selected",b?"true":"false")}),le(),pe(),Z(),O(),v("")}function R(e){h=!!e,f&&f.setAttribute("data-busy",h?"1":"0"),t.submitLabel&&(t.submitLabel.textContent=h?a.submitBusy:a.submit),t.close&&(t.close.disabled=h),t.text&&(t.text.readOnly=h),(t.switchButtons||[]).forEach(r=>{r.disabled=h}),O()}function Me(e){if(!e)return;const r=We(e);if(!r){v(a.errorMediaType);return}const i=r==="video";if(Number(e.size||0)>(i?tt:et)){v(i?a.errorVideoSize:a.errorImageSize);return}const o=g();ne(o.previewUrl),o.file=e,o.mediaType=r,o.previewUrl="";try{o.previewUrl=p?.URL?.createObjectURL?p.URL.createObjectURL(e):""}catch{o.previewUrl=""}v(""),Z(),t.photoLabel&&(t.photoLabel.textContent=a.changePhoto),t.photo&&t.photo.setAttribute("data-active","1"),O()}function H({force:e=!1}={}){const r=String(I()||"").trim();if(!r||!W){u.status="error",$();return}u.restaurantId!==r&&(u.restaurantId=r,u.status="idle",u.items=[]),!(!e&&(u.status==="loading"||u.status==="ready"))&&(u.status="loading",$(),(async()=>{try{const i=await W(r);if(u.restaurantId!==r)return;u.items=Array.isArray(i)?i:[],u.status="ready"}catch{if(u.restaurantId!==r)return;u.items=[],u.status="error"}$()})())}function X(e,r=!1){if(!t.pickerList)return;t.pickerList.textContent="";const i=c.createElement("div");if(i.className="mnyra-bc__picker-state",i.textContent=e,r){const o=c.createElement("button");o.type="button",o.textContent=a.pickerRetry,o.addEventListener("click",()=>H({force:!0})),i.appendChild(c.createElement("br")),i.appendChild(o)}t.pickerList.appendChild(i)}function $(){if(!t.pickerList)return;if(u.status==="loading"||u.status==="idle"){X(a.pickerLoading),z();return}if(u.status==="error"){X(a.pickerError,!0),z();return}const e=String(t.pickerSearch?.value||""),r=ct(u.items,e);if(!r.length){X(B().pickerEmpty),z();return}const i=c.createDocumentFragment();r.forEach(o=>{const s=c.createElement("button");s.type="button",s.className="mnyra-bc__picker-row",s.dataset.bcPickerItem=o.id,y&&y.id===o.id&&s.setAttribute("data-selected","1");const b=c.createElement("img");b.className="mnyra-bc__picker-thumb",b.alt="",b.loading="lazy",b.decoding="async",o.imageUrl&&(b.src=re(o.imageUrl,"thumb")),s.appendChild(b);const S=c.createElement("div");S.className="mnyra-bc__picker-main";const P=c.createElement("div");P.className="mnyra-bc__picker-name",P.textContent=o.name,S.appendChild(P);const x=c.createElement("div");x.className="mnyra-bc__picker-meta",x.textContent=[o.category,ue(o.price)].filter(Boolean).join(" · "),S.appendChild(x),s.appendChild(S);const T=c.createElement("span");T.className="mnyra-bc__picker-mark",T.innerHTML=k.check,s.appendChild(T),i.appendChild(s)}),t.pickerList.textContent="",t.pickerList.appendChild(i),z()}function z(){t.pickerConfirm&&(t.pickerConfirm.disabled=!y)}function je(){h||(y=g().product||null,t.pickerSearch&&(t.pickerSearch.value=""),t.picker&&t.picker.setAttribute("data-visible","1"),H(),$())}function L(){t.picker&&t.picker.setAttribute("data-visible","0"),y=null}function Fe(){return t?.picker?.getAttribute("data-visible")==="1"}function Ue(e=""){if(!c?.body)return;let r=c.getElementById(K);r||(r=c.createElement("div"),r.id=K,r.setAttribute("role","status"),c.body.appendChild(r)),r.textContent=String(e||""),r.setAttribute("data-visible","1"),U&&p?.clearTimeout?.(U),U=p?.setTimeout?.(()=>{r.setAttribute("data-visible","0"),U=0},2600)||0}function fe(){if(!c)return;const e=!!c.querySelector("#overlayRoot .modal-overlay"),r=e?Y:rt;try{c.documentElement.style.setProperty("--active-modal-surface",r),c.documentElement.classList.toggle("modal-open",e),c.body.classList.toggle("modal-open",e);const i=c.getElementById("modalUnderlay");i&&(i.classList.toggle("hidden",!e),i.style.background=r),["safariChromeTintTop","safariChromeTintBottom"].forEach(s=>{const b=c.getElementById(s);b&&(b.style.display=e?"block":"none",b.style.background=r)});const o=c.head?.querySelector('meta[name="theme-color"]');o&&o.setAttribute("content",r)}catch{}}function Be(){ie||!c||(ie=!0,c.addEventListener("keydown",e=>{if(!(e.key!=="Escape"||!C)){if(Fe()){L(),e.preventDefault();return}h||(D(),e.preventDefault())}}))}function Ne(){t.close?.addEventListener("click",()=>{h||D()}),t.submit?.addEventListener("click",()=>{He()}),t.text?.addEventListener("input",()=>{const e=g();e.caption=String(t.text.value||""),pe(),ze(),O()}),t.text?.addEventListener("focus",()=>{t.compose?.setAttribute("data-focus","1")}),t.text?.addEventListener("blur",()=>{t.compose?.setAttribute("data-focus","0")}),t.photo?.addEventListener("click",()=>{h||(v(""),t.file?.click())}),t.file?.addEventListener("change",()=>{const e=t.file?.files?.[0]||null;Me(e),t.file&&(t.file.value="")}),(t.switchButtons||[]).forEach(e=>{e.addEventListener("click",()=>{if(h)return;const r=_e(e.getAttribute("data-bc-mode"));r!==m&&(L(),m=r,be(),t.body&&(t.body.scrollTop=0),H())})}),t.tag?.addEventListener("click",()=>je()),t.chipRemove?.addEventListener("click",()=>{h||(g().product=null,de())}),t.pickerClose?.addEventListener("click",()=>L()),t.picker?.addEventListener("click",e=>{e.target===t.picker&&L()}),t.pickerSearch?.addEventListener("input",()=>$()),t.pickerList?.addEventListener("click",e=>{const r=e.target?.closest?.("[data-bc-picker-item]");if(!r)return;const i=String(r.dataset.bcPickerItem||"").trim(),o=u.items.find(s=>s.id===i)||null;y=y&&y.id===i?null:o,Array.from(t.pickerList.querySelectorAll("[data-bc-picker-item]")).forEach(s=>{s.setAttribute("data-selected",y&&s.dataset.bcPickerItem===y.id?"1":"0")}),z()}),t.pickerConfirm?.addEventListener("click",()=>{y&&(g().product=y,L(),de())})}function Oe(e){const r=E[e];r&&(ne(r.previewUrl),r.caption="",r.file=null,r.previewUrl="",r.mediaType="",r.product=null)}async function Re(e,r){if(!J||!j)return"";try{const i=await J(e);if(!i)return"";const o=await j(i,r);return String(o?.cdnUrl||o?.url||"").trim()}catch{return""}}async function He(){if(h)return;const e=g();if(!xe({caption:e.caption,hasImage:!!e.file,submitting:h}))return;const r=String(I()||"").trim();if(!r){v(a.errorNoBusiness);return}if(p&&p.navigator&&p.navigator.onLine===!1){v(a.errorOffline);return}const i=e.mediaType==="video"?"video":"image";if(!(i==="video"?Q:j)||(m==="story"?!te:!ee)){v(a.errorGeneric);return}const s=m,b=String(e.caption||"").trim().slice(0,M),S=e.file;R(!0),v("");try{const P=i==="video"?await Q(S,r):await j(S,r),x=String(P?.cdnUrl||P?.url||"").trim();if(!x)throw new Error(a.errorGeneric);const T=i==="video"?await Re(S,r):"",V=e.product,me={menuItemId:V?.id||"",menuItemName:V?.name||"",menuItemPrice:V?.price??"",menuItemImage:V?.imageUrl||""};s==="story"?await te({restaurantId:r,caption:b,mediaUrl:x,mediaType:i,posterUrl:T,...me}):await ee({restaurantId:r,caption:b,mediaUrl:x,mediaType:i,posterUrl:T,...me}),R(!1),D(),Oe(s),Ue(s==="story"?a.successStory:s==="profile"?a.successProfile:a.successPost);try{await we(s)}catch{}}catch(P){R(!1);const x=String(P?.message||"").trim();v(x||a.errorGeneric)}}function De(e="post"){if(!c)return;const r=_e(e);if(Ce(),!!f){if(Be(),m=r,L(),R(!1),!C){const i=ot(c);i&&f.parentNode!==i&&i.appendChild(f),C=!0}be(),Ve(),t.body&&(t.body.scrollTop=0),fe(),H()}}function Ve(){if(ae||!p?.addEventListener)return;ae=!0;const e=()=>{C&&N()};p.addEventListener("resize",e,{passive:!0}),p.addEventListener("orientationchange",e,{passive:!0})}function D(){if(C){C=!1,L();try{f?.remove()}catch{}fe()}}return Object.freeze({open:De,close:D,isOpen:()=>C})}export{at as BUSINESS_COMPOSER_CSS,xe as canPublishComposerDraftCore,mt as createBusinessComposerController,ct as filterComposerProductsCore,_e as normalizeComposerModeCore,ft as normalizeComposerProductCore,it as resolveComposerProductTextCore};
