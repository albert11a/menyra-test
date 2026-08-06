import{au as Ye,av as We,aw as Je,ax as Qe,ay as et}from"./domain-feed-social-eager-CMbSdEAJ.js";import{r as tt}from"./profile-post-card-markup-utils-HwqIiXgP.js";import{o as rt}from"./domain-media-eager-B3Bb4ghO.js";import"./domain-auth-Aq-4Vdvh.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-menu-eager-CVOHOeWR.js";const ve="mnyraBusinessComposerStyles",_e=448,it=24,at=10,xe=Object.freeze(["linear-gradient(150deg,#94a3b8 0%,#475569 55%,#1e293b 100%)","linear-gradient(150deg,#a5b4fc 0%,#6366f1 55%,#312e81 100%)"]),nt="businessComposerOverlayRoot",ot=15*1024*1024,ct=50*1024*1024,z=600,Z="mnyraBusinessComposerToast",st="#f8fafc",Q="#ffffff",o=Object.freeze({titlePost:"Postim i ri",titleStory:"Story e re",titleProfile:"Postim për profilin",submit:"Posto",submitBusy:"Duke postuar…",close:"Mbyll",placeholderPost:"Shkruaj diçka për postimin tënd…",placeholderStory:"Shkruaj diçka për story-n tënde…",placeholderProfile:"Shkruaj diçka për profilin tënd…",addPhoto:"Foto ose video",changeImage:"Ndrysho foton",changeVideo:"Ndrysho videon",removeMedia:"Hiq median",removeProduct:"Hiq produktin",switchPost:"Postim",switchStory:"Story",switchProfile:"Profil",switchLabel:"Zgjidh llojin e postimit",previewTitle:"Parapamje",previewPost:"Si duket në Zbulo",previewStory:"Në rreshtin e story-ve",previewProfile:"Si duket në profilin tënd",pickerConfirm:"Zgjidh",pickerLoading:"Duke ngarkuar…",pickerError:"Lista nuk u ngarkua.",pickerRetry:"Provo përsëri",errorMediaType:"Lejohen vetëm foto ose video.",errorImageSize:"Fotoja duhet të jetë deri në 15MB.",errorVideoSize:"Videoja duhet të jetë deri në 50MB.",errorNoBusiness:"Kjo llogari nuk është e lidhur me një biznes.",errorGeneric:"Postimi dështoi. Provo përsëri.",errorOffline:"Nuk ka lidhje me internetin. Provo përsëri.",successPost:"Postimi u publikua.",successStory:"Story u publikua.",successProfile:"Postimi u publikua në profil.",businessFallback:"Biznesi im"}),ke=Object.freeze({restaurant:Object.freeze({tag:"Etiketo nga menuja",pickerTitle:"Zgjidh nga menuja",pickerSearch:"Kërko ushqime ose pije…",pickerEmpty:"Nuk u gjet asnjë produkt.",optional:"Produkti nuk është i detyrueshëm."}),shop:Object.freeze({tag:"Etiketo nga produktet",pickerTitle:"Zgjidh nga produktet",pickerSearch:"Kërko produkte…",pickerEmpty:"Nuk u gjet asnjë produkt.",optional:"Produkti nuk është i detyrueshëm."}),hotel:Object.freeze({tag:"Etiketo nga dhomat",pickerTitle:"Zgjidh nga dhomat",pickerSearch:"Kërko dhoma…",pickerEmpty:"Nuk u gjet asnjë dhomë.",optional:"Dhoma nuk është e detyrueshme."})});function lt(d=""){const l=String(d||"").trim().toLowerCase();return ke[l]||ke.restaurant}const w='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"',x=Object.freeze({close:`<svg ${w}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,image:`<svg ${w}><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`,tag:`<svg ${w}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>`,plus:`<svg ${w}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`,camera:`<svg ${w}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,check:`<svg ${w}><path d="M20 6 9 17l-5-5"></path></svg>`,search:`<svg ${w}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,heart:`<svg ${w}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`,comment:`<svg ${w}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>`,user:`<svg ${w}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`}),dt=`
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
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--bc-line);
}
/* Die hochgeladene Datei sitzt als Miniatur in derselben Leiste; das x
   darauf wirft sie wieder heraus. */
.mnyra-bc__thumb {
  position: relative;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--bc-line);
  background: var(--bc-plane);
}
.mnyra-bc__thumb[hidden] { display: none; }
.mnyra-bc__thumb-img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 11px;
  object-fit: cover;
}
.mnyra-bc__thumb-fallback {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  color: var(--bc-muted);
}
.mnyra-bc__thumb-fallback svg { width: 18px; height: 18px; }
.mnyra-bc__thumb[data-empty="1"] .mnyra-bc__thumb-fallback { display: flex; }
.mnyra-bc__thumb-x {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: var(--bc-ink);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.mnyra-bc__thumb-x svg { width: 10px; height: 10px; stroke-width: 3; }
.mnyra-bc__thumb-x:active { transform: scale(0.92); }
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
  margin-left: auto;
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
  gap: ${at}px;
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
  padding: 0;
}
.mnyra-bc__picker[data-visible="1"] { display: flex; align-items: flex-end; }
.mnyra-bc__picker-sheet {
  width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 28px 28px 0 0;
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
  padding: 10px 16px calc(var(--safe-area-bottom, 0px) + 16px);
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
#${Z} {
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
#${Z}[data-visible="1"] { opacity: 1; }
@media (min-width: 640px) {
  .mnyra-bc__sheet { max-width: 560px; margin: 0 auto; }
  .mnyra-bc__picker-sheet { max-width: 520px; margin: 0 auto; }
}
`;function pt(d){if(!(!d||d.getElementById(ve)))try{const l=d.createElement("style");l.id=ve,l.textContent=dt,d.head?.appendChild(l)}catch{}}function ut(d){if(!d?.body)return null;let l=d.getElementById("overlayRoot");return l||(l=d.createElement("div"),l.id="overlayRoot",l.style.position="relative",l.style.zIndex="200",l.style.isolation="isolate",d.body.appendChild(l)),l}function xt(d="",l={}){const n=l&&typeof l=="object"?l:{},c=String(d||"").trim();if(!c)return null;const b=n.imageUrl||n.image||(Array.isArray(n.images)?n.images[0]:"")||"",$=String(n.type||n.menuType||"").trim().toLowerCase(),X=["drink","drinks","beverage","getraenke","getränke"].includes($)?"drink":"food";return{id:c,name:String(n.name||n.title||"").trim()||c,price:n.price??"",category:String(n.category||"").trim(),type:X,imageUrl:typeof b=="string"?b.trim():""}}function bt(d=[]){const l=new Set,n=[];return(Array.isArray(d)?d:[]).forEach(c=>{const b=String(c?.id||"").trim();!b||l.has(b)||(l.add(b),n.push(c))}),n}function we(d=[]){return(Array.isArray(d)?d:[]).map(l=>`${l?.id||""}|${l?.name||""}|${l?.price??""}|${l?.imageUrl||""}`).join("~")}function ft(d=[],l=""){const n=Array.isArray(d)?d:[],c=String(l||"").trim().toLowerCase();return c?n.filter(b=>`${b?.name||""} ${b?.category||""}`.toLowerCase().includes(c)):n}function Se(d=""){const l=String(d||"").trim().toLowerCase();return l==="story"?"story":l==="profile"?"profile":"post"}function Pe({caption:d="",hasImage:l=!1,submitting:n=!1}={}){return n||!l?!1:String(d||"").trim().length>0}function kt({documentObj:d=null,windowObj:l=null,api:n={}}={}){const c=d||(typeof document>"u"?null:document),b=l||c?.defaultView||(typeof window>"u"?null:window),$=typeof n.getRestaurantIdFn=="function"?n.getRestaurantIdFn:(()=>""),X=typeof n.getBusinessMetaFn=="function"?n.getBusinessMetaFn:(()=>({name:"",logoUrl:""})),ee=typeof n.loadProductsFn=="function"?n.loadProductsFn:null,Ce=typeof n.getBusinessKindFn=="function"?n.getBusinessKindFn:(()=>""),j=typeof n.uploadImageFn=="function"?n.uploadImageFn:null,te=typeof n.uploadVideoFn=="function"?n.uploadVideoFn:null,F=typeof n.captureVideoPosterFn=="function"?n.captureVideoPosterFn:null,re=typeof n.createPostFn=="function"?n.createPostFn:null,ie=typeof n.createStoryFn=="function"?n.createStoryFn:null,Le=typeof n.afterPublishFn=="function"?n.afterPublishFn:(()=>{}),Ee=typeof n.formatPriceFn=="function"?n.formatPriceFn:(e=>String(e??"")),ae=typeof n.getOptimizedImageUrlFn=="function"?n.getOptimizedImageUrlFn:(e=>String(e||"").trim()),N=typeof n.escapeHtmlFn=="function"?n.escapeHtmlFn:(e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")),U=typeof n.iconFn=="function"?n.iconFn:(()=>""),P=(e="")=>N(String(e??"")),E={post:{caption:"",file:null,previewUrl:"",thumbUrl:"",mediaType:"",product:null},story:{caption:"",file:null,previewUrl:"",thumbUrl:"",mediaType:"",product:null},profile:{caption:"",file:null,previewUrl:"",thumbUrl:"",mediaType:"",product:null}},u={status:"idle",items:[],restaurantId:"",fresh:!1};let f=null,r=null,m="post",C=!1,h=!1,g=null,ne=!1,oe=!1,O=0;function y(){return E[m]||E.post}function B(){let e="";try{e=String(Ce()||"")}catch{e=""}return lt(e)}function ce(e=""){const t=String(e||"").trim();if(t.startsWith("blob:"))try{b?.URL?.revokeObjectURL?.(t)}catch{}}function Y(e){e&&(ce(e.previewUrl),e.thumbUrl&&e.thumbUrl!==e.previewUrl&&ce(e.thumbUrl))}function Te(){const e=B();return`
      <div class="mnyra-bc__sheet">
        <header class="mnyra-bc__head">
          <button type="button" class="mnyra-bc__x" data-bc-close aria-label="${o.close}" title="${o.close}">${x.close}</button>
          <div class="mnyra-bc__title" data-bc-title></div>
          <button type="button" class="mnyra-bc__submit" data-bc-submit disabled>
            <span class="mnyra-bc__spinner"></span><span data-bc-submit-label>${o.submit}</span>
          </button>
        </header>
        <div class="mnyra-bc__body" data-bc-body>
          <div class="mnyra-bc__compose" data-bc-compose>
            <textarea class="mnyra-bc__text" data-bc-text maxlength="${z}" rows="5" enterkeyhint="done"></textarea>
            <div class="mnyra-bc__compose-bar">
              <div class="mnyra-bc__thumb" data-bc-thumb data-empty="1" hidden>
                <img class="mnyra-bc__thumb-img" data-bc-thumb-img alt="" decoding="async" />
                <span class="mnyra-bc__thumb-fallback">${x.image}</span>
                <button type="button" class="mnyra-bc__thumb-x" data-bc-thumb-remove aria-label="${o.removeMedia}" title="${o.removeMedia}">${x.close}</button>
              </div>
              <button type="button" class="mnyra-bc__tool" data-bc-photo>
                ${x.image}<span class="mnyra-bc__tool-label" data-bc-photo-label>${o.addPhoto}</span>
              </button>
              <button type="button" class="mnyra-bc__tool" data-bc-tag>
                ${x.tag}<span class="mnyra-bc__tool-label" data-bc-tag-label>${e.tag}</span>
              </button>
              <span class="mnyra-bc__count" data-bc-count>0/${z}</span>
            </div>
          </div>
          <div class="mnyra-bc__product-chip" data-bc-chip>
            <img class="mnyra-bc__product-chip-thumb" data-bc-chip-img alt="" decoding="async" />
            <div class="mnyra-bc__product-chip-main">
              <div class="mnyra-bc__product-chip-name" data-bc-chip-name></div>
              <div class="mnyra-bc__product-chip-price" data-bc-chip-price></div>
            </div>
            <button type="button" class="mnyra-bc__product-chip-remove" data-bc-chip-remove>${o.removeProduct}</button>
          </div>
          <div class="mnyra-bc__error" data-bc-error role="alert"></div>

          <section class="mnyra-bc__preview">
            <p class="mnyra-bc__preview-title">${o.previewTitle}</p>

            <div class="mnyra-bc__pane" data-bc-pane="post">
              <p class="mnyra-bc__preview-caption">${o.previewPost}</p>
              <div class="mnyra-bc__stage" data-bc-stage="post">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="post"></div>
              </div>
            </div>

            <div class="mnyra-bc__pane" data-bc-pane="profile">
              <p class="mnyra-bc__preview-caption">${o.previewProfile}</p>
              <div class="mnyra-bc__stage" data-bc-stage="profile">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="profile"></div>
              </div>
            </div>

            <div class="mnyra-bc__pane" data-bc-pane="story">
              <p class="mnyra-bc__preview-caption">${o.previewStory}</p>
              <div class="mnyra-bc__stage mnyra-bc__stage--bleed" data-bc-stage="story">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="story"></div>
              </div>
            </div>
          </section>
        </div>

        <footer class="mnyra-bc__foot">
          <div class="mnyra-bc__switch" role="tablist" aria-label="${o.switchLabel}">
            <button type="button" class="mnyra-bc__switch-btn" role="tab" data-bc-mode="post" aria-selected="true">
              ${x.image}<span>${o.switchPost}</span>
            </button>
            <button type="button" class="mnyra-bc__switch-btn" role="tab" data-bc-mode="story" aria-selected="false">
              ${x.camera}<span>${o.switchStory}</span>
            </button>
            <button type="button" class="mnyra-bc__switch-btn" role="tab" data-bc-mode="profile" aria-selected="false">
              ${x.user}<span>${o.switchProfile}</span>
            </button>
          </div>
        </footer>

        <div class="mnyra-bc__picker" data-bc-picker>
          <div class="mnyra-bc__picker-sheet">
            <div class="mnyra-bc__picker-head">
              <span class="mnyra-bc__picker-title" data-bc-picker-title>${e.pickerTitle}</span>
              <button type="button" class="mnyra-bc__x" data-bc-picker-close aria-label="${o.close}" title="${o.close}">${x.close}</button>
            </div>
            <div class="mnyra-bc__picker-search">
              ${x.search}
              <input type="search" data-bc-picker-search placeholder="${e.pickerSearch}" autocomplete="off" />
            </div>
            <div class="mnyra-bc__picker-list" data-bc-picker-list></div>
            <div class="mnyra-bc__picker-foot">
              <p class="mnyra-bc__picker-note" data-bc-picker-note>${e.optional}</p>
              <button type="button" class="mnyra-bc__picker-confirm" data-bc-picker-confirm disabled>${o.pickerConfirm}</button>
            </div>
          </div>
        </div>
      </div>
      <input type="file" accept="image/*,video/*" data-bc-file hidden />
    `}function Ie(){if(f||!c)return f;pt(c),f=c.createElement("div"),f.id=nt,f.className="mnyra-bc modal-overlay",f.setAttribute("data-modal-surface",Q),f.style.setProperty("--modal-surface",Q),f.innerHTML=Te();const e=t=>f.querySelector(t);return r={title:e("[data-bc-title]"),close:e("[data-bc-close]"),submit:e("[data-bc-submit]"),submitLabel:e("[data-bc-submit-label]"),body:e("[data-bc-body]"),compose:e("[data-bc-compose]"),text:e("[data-bc-text]"),count:e("[data-bc-count]"),photo:e("[data-bc-photo]"),photoLabel:e("[data-bc-photo-label]"),thumb:e("[data-bc-thumb]"),thumbImg:e("[data-bc-thumb-img]"),thumbRemove:e("[data-bc-thumb-remove]"),tag:e("[data-bc-tag]"),tagLabel:e("[data-bc-tag-label]"),chip:e("[data-bc-chip]"),chipImg:e("[data-bc-chip-img]"),chipName:e("[data-bc-chip-name]"),chipPrice:e("[data-bc-chip-price]"),chipRemove:e("[data-bc-chip-remove]"),error:e("[data-bc-error]"),panePost:e('[data-bc-pane="post"]'),paneStory:e('[data-bc-pane="story"]'),paneProfile:e('[data-bc-pane="profile"]'),stageProfile:e('[data-bc-stage="profile"]'),stageProfileInner:e('[data-bc-stage-inner="profile"]'),stagePost:e('[data-bc-stage="post"]'),stagePostInner:e('[data-bc-stage-inner="post"]'),stageStory:e('[data-bc-stage="story"]'),stageStoryInner:e('[data-bc-stage-inner="story"]'),switchButtons:Array.from(f.querySelectorAll("[data-bc-mode]")),picker:e("[data-bc-picker]"),pickerTitle:e("[data-bc-picker-title]"),pickerNote:e("[data-bc-picker-note]"),pickerClose:e("[data-bc-picker-close]"),pickerSearch:e("[data-bc-picker-search]"),pickerList:e("[data-bc-picker-list]"),pickerConfirm:e("[data-bc-picker-confirm]"),file:e("[data-bc-file]")},Ve(),f}function se(e,t=""){if(!e)return;const i=String(t||"").trim();i?(e.getAttribute("src")!==i&&e.setAttribute("src",i),e.style.visibility=""):(e.removeAttribute("src"),e.style.visibility="hidden")}function le(){let e={};try{e=X()||{}}catch{}return{name:String(e.name||"").trim()||o.businessFallback,logoUrl:String(e.logoUrl||"").trim(),city:String(e.city||"").trim()}}function $e(){const e=Number(b?.innerWidth)||_e;return Math.min(e,_e)}function Ue(){const e=E.post,t=le(),i=String(e.previewUrl||"").trim(),s=`<span class="block w-full h-full appearance-none bg-transparent text-left" style="display:block;width:100%;height:100%;padding:0;margin:0;border:0;background:transparent;">${i?e.mediaType==="video"?`<video src="${P(i)}" autoplay muted loop playsinline preload="metadata" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000"></video>`:`<img src="${P(i)}" decoding="async" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`:""}</span>`,p=t.logoUrl?`<img src="${P(t.logoUrl)}" decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />`:"";return Ye({business:t.name,location:t.city,content:String(e.caption||"").trim(),likes:0,comments:0,isLive:!1,logoImgHtml:p,heroMediaHtml:s,heroReady:!!i,escapeHtmlFn:N,iconFn:U})}function Ae(){const e=E.profile,t=String(e.previewUrl||"").trim(),i=t?e.mediaType==="video"?`<video src="${P(t)}" preload="metadata" muted playsinline width="400" height="500" class="w-full h-full object-cover pointer-events-none"></video>`:`<img src="${P(t)}" decoding="async" width="400" height="500" class="w-full h-full object-cover" />`:'<div class="w-full h-full bg-slate-200"></div>';return`<div class="grid grid-cols-2 gap-3" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0.75rem;">${tt({mediaHtml:i,isVideo:e.mediaType==="video",playIconHtml:U("play","w-3.5 h-3.5 fill-white block"),likeLabel:"0",commentLabel:"0",heartIconHtml:U("heart","w-3 h-3 fill-rose-500 text-rose-500"),commentIconHtml:U("message-circle","w-3 h-3 text-indigo-200"),escapeHtmlFn:N})}</div>`}function de({label:e,mediaHtml:t,logoImgHtml:i,first:a=!1,shellAttrs:s=""}){return Je({label:e,mediaHtml:t,logoImgHtml:i,shellAttrs:s,shellStyle:Qe({withMarginLeft:a}),innerStyle:et(),escapeHtmlFn:N})}function Me(){const e=E.story,t=le(),i=String(e.previewUrl||"").trim(),a=i?e.mediaType==="video"?`<video src="${P(i)}" autoplay muted loop playsinline preload="metadata" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;"></video>`:`<img src="${P(i)}" decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />`:We({iconFn:U}),s=`<img src="${P(t.logoUrl)}" decoding="async" width="28" height="28" class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />`;return de({label:t.name,mediaHtml:a,logoImgHtml:s,first:!0,shellAttrs:"data-bc-story-own"})}function pe(e=0){const t=xe[e%xe.length];return de({label:"",mediaHtml:`<div class="absolute inset-0" style="position:absolute;inset:0;background:${t};"></div>`,logoImgHtml:"",shellAttrs:`data-bc-story-blur="${e}" aria-hidden="true"`})}function ze(){return`
      <div class="mnyra-bc__story-track">
        ${Me()}
        ${pe(0)}
        ${pe(1)}
      </div>
    `}function W(e,t,i,{centered:a=!0}={}){if(!e||!t)return;const s=e.clientWidth||i;t.style.width=`${i}px`,t.style.height="";let p=Math.min(1,i>0?s/i:1);(!Number.isFinite(p)||p<=0)&&(p=1),t.style.transform=`scale(${p})`;const v=t.scrollHeight;e.style.height=`${Math.round(v*p)}px`,t.style.marginLeft=a?`${Math.max(0,(s-i*p)/2)}px`:"0px"}function R(){if(!r||!f?.isConnected)return;const e=$e();if(m==="story"){W(r.stageStory,r.stageStoryInner,e);return}const t=Math.max(1,e-it*2);if(m==="profile"){W(r.stageProfile,r.stageProfileInner,t,{centered:!1});return}W(r.stagePost,r.stagePostInner,t,{centered:!1})}function H(){r&&(m==="story"?r.stageStoryInner&&(r.stageStoryInner.innerHTML=ze()):m==="profile"?r.stageProfileInner&&(r.stageProfileInner.innerHTML=`<div class="py-4">${Ae()}</div>`):r.stagePostInner&&(r.stagePostInner.innerHTML=`<div class="py-4">${Ue()}</div>`),R(),b?.requestAnimationFrame?.(()=>R()))}function je(){if(!r||m==="story"||m==="profile")return;const e=String(y().caption||"").trim(),t=r.stagePostInner?.querySelector(".feed-card p.line-clamp-2");t&&(t.textContent=e),R()}function ue(){const e=y().product,t=e?"1":"0";if(r.chip&&r.chip.setAttribute("data-visible",t),r.tag&&r.tag.setAttribute("data-active",t),r.tagLabel&&(r.tagLabel.textContent=e?e.name:B().tag),!e)return;const i=me(e.price),a=e.imageUrl?ae(e.imageUrl,"thumb"):"";r.chipName&&(r.chipName.textContent=e.name),r.chipPrice&&(r.chipPrice.textContent=i),se(r.chipImg,a)}function be(){ue(),m==="story"&&H()}function fe(){if(!r.count)return;const e=String(y().caption||"").length;r.count.textContent=`${e}/${z}`,r.count.setAttribute("data-tone",e>=z?"full":"idle")}function me(e){if(e==null||e==="")return"";let t="";try{t=String(Ee(e)||"").trim()}catch{t=""}return t==="-"?"":t}function A(){const e=y(),t=Pe({caption:e.caption,hasImage:!!e.file,submitting:h});r.submit&&(r.submit.disabled=!t,r.submit.setAttribute("aria-disabled",t?"false":"true"))}function _(e=""){if(!r.error)return;const t=String(e||"").trim();r.error.textContent=t,r.error.setAttribute("data-visible",t?"1":"0")}function he(){const e=m==="story",t=m==="profile",i=y();r.title&&(r.title.textContent=e?o.titleStory:t?o.titleProfile:o.titlePost),r.text&&(r.text.placeholder=e?o.placeholderStory:t?o.placeholderProfile:o.placeholderPost,r.text.value!==i.caption&&(r.text.value=i.caption));const a=B();r.pickerTitle&&(r.pickerTitle.textContent=a.pickerTitle),r.pickerNote&&(r.pickerNote.textContent=a.optional),r.pickerSearch&&(r.pickerSearch.placeholder=a.pickerSearch),V(),r.panePost&&r.panePost.setAttribute("data-visible",m==="post"?"1":"0"),r.paneStory&&r.paneStory.setAttribute("data-visible",e?"1":"0"),r.paneProfile&&r.paneProfile.setAttribute("data-visible",t?"1":"0"),(r.switchButtons||[]).forEach(s=>{const p=s.getAttribute("data-bc-mode")===m;s.setAttribute("aria-selected",p?"true":"false")}),ue(),fe(),H(),A(),_("")}function D(e){h=!!e,f&&f.setAttribute("data-busy",h?"1":"0"),r.submitLabel&&(r.submitLabel.textContent=h?o.submitBusy:o.submit),r.close&&(r.close.disabled=h),r.text&&(r.text.readOnly=h),(r.switchButtons||[]).forEach(t=>{t.disabled=h}),A()}function Fe(e){if(!e)return;const t=rt(e);if(!t){_(o.errorMediaType);return}const i=t==="video";if(Number(e.size||0)>(i?ct:ot)){_(i?o.errorVideoSize:o.errorImageSize);return}const a=y();Y(a),a.file=e,a.mediaType=t,a.previewUrl="",a.thumbUrl="";try{a.previewUrl=b?.URL?.createObjectURL?b.URL.createObjectURL(e):""}catch{a.previewUrl=""}i?Ne(a,e):a.thumbUrl=a.previewUrl,_(""),H(),V(),A()}function V(){const e=y(),t=!!e.file,i=e.mediaType==="video";r.photoLabel&&(r.photoLabel.textContent=t?i?o.changeVideo:o.changeImage:o.addPhoto),r.photo&&r.photo.setAttribute("data-active",t?"1":"0");const a=t?String(e.thumbUrl||"").trim():"";r.thumb&&(r.thumb.hidden=!t,r.thumb.setAttribute("data-empty",a?"0":"1")),se(r.thumbImg,a)}function Ne(e,t){!F||!b?.URL?.createObjectURL||(async()=>{try{const i=await F(t);if(!i||e.file!==t)return;e.thumbUrl=b.URL.createObjectURL(i),y()===e&&V()}catch{}})()}function Oe(){if(h)return;const e=y();e.file&&(Y(e),e.file=null,e.previewUrl="",e.thumbUrl="",e.mediaType="",_(""),V(),H(),A())}function K({force:e=!1}={}){const t=String($()||"").trim();if(!t||!ee){u.status="error",T();return}if(u.restaurantId!==t&&(u.restaurantId=t,u.status="idle",u.items=[],u.fresh=!1),!e&&(u.status==="loading"||u.status==="ready"))return;u.status="loading",T();const i=(a,s=!1)=>{if(u.restaurantId!==t||!s&&u.fresh)return;u.fresh=u.fresh||s;const p=bt(a),v=we(p)!==we(u.items),k=u.status!=="ready";u.items=p,u.status="ready",(v||k)&&T()};(async()=>{try{const a=await ee(t,s=>i(s,!0));i(a)}catch{if(u.restaurantId!==t||u.status==="ready")return;u.items=[],u.status="error",T()}})()}function J(e,t=!1){if(!r.pickerList)return;r.pickerList.textContent="";const i=c.createElement("div");if(i.className="mnyra-bc__picker-state",i.textContent=e,t){const a=c.createElement("button");a.type="button",a.textContent=o.pickerRetry,a.addEventListener("click",()=>K({force:!0})),i.appendChild(c.createElement("br")),i.appendChild(a)}r.pickerList.appendChild(i)}function T(){if(!r.pickerList)return;if(u.status==="loading"||u.status==="idle"){J(o.pickerLoading),M();return}if(u.status==="error"){J(o.pickerError,!0),M();return}const e=String(r.pickerSearch?.value||""),t=ft(u.items,e);if(!t.length){J(B().pickerEmpty),M();return}const i=c.createDocumentFragment();t.forEach(a=>{const s=c.createElement("button");s.type="button",s.className="mnyra-bc__picker-row",s.dataset.bcPickerItem=a.id,g&&g.id===a.id&&s.setAttribute("data-selected","1");const p=c.createElement("img");p.className="mnyra-bc__picker-thumb",p.alt="",p.loading="lazy",p.decoding="async",a.imageUrl&&(p.src=ae(a.imageUrl,"thumb")),s.appendChild(p);const v=c.createElement("div");v.className="mnyra-bc__picker-main";const k=c.createElement("div");k.className="mnyra-bc__picker-name",k.textContent=a.name,v.appendChild(k);const S=c.createElement("div");S.className="mnyra-bc__picker-meta",S.textContent=[a.category,me(a.price)].filter(Boolean).join(" · "),v.appendChild(S),s.appendChild(v);const I=c.createElement("span");I.className="mnyra-bc__picker-mark",I.innerHTML=x.check,s.appendChild(I),i.appendChild(s)}),r.pickerList.textContent="",r.pickerList.appendChild(i),M()}function M(){r.pickerConfirm&&(r.pickerConfirm.disabled=!g)}function Be(){h||(g=y().product||null,r.pickerSearch&&(r.pickerSearch.value=""),r.picker&&r.picker.setAttribute("data-visible","1"),K(),T())}function L(){r.picker&&r.picker.setAttribute("data-visible","0"),g=null}function Re(){return r?.picker?.getAttribute("data-visible")==="1"}function He(e=""){if(!c?.body)return;let t=c.getElementById(Z);t||(t=c.createElement("div"),t.id=Z,t.setAttribute("role","status"),c.body.appendChild(t)),t.textContent=String(e||""),t.setAttribute("data-visible","1"),O&&b?.clearTimeout?.(O),O=b?.setTimeout?.(()=>{t.setAttribute("data-visible","0"),O=0},2600)||0}function ye(){if(!c)return;const e=!!c.querySelector("#overlayRoot .modal-overlay"),t=e?Q:st;try{c.documentElement.style.setProperty("--active-modal-surface",t),c.documentElement.classList.toggle("modal-open",e),c.body.classList.toggle("modal-open",e);const i=c.getElementById("modalUnderlay");i&&(i.classList.toggle("hidden",!e),i.style.background=t),["safariChromeTintTop","safariChromeTintBottom"].forEach(s=>{const p=c.getElementById(s);p&&(p.style.display=e?"block":"none",p.style.background=t)});const a=c.head?.querySelector('meta[name="theme-color"]');a&&a.setAttribute("content",t)}catch{}}function De(){ne||!c||(ne=!0,c.addEventListener("keydown",e=>{if(!(e.key!=="Escape"||!C)){if(Re()){L(),e.preventDefault();return}h||(q(),e.preventDefault())}}))}function Ve(){r.close?.addEventListener("click",()=>{h||q()}),r.submit?.addEventListener("click",()=>{Ge()}),r.text?.addEventListener("input",()=>{const e=y();e.caption=String(r.text.value||""),fe(),je(),A()}),r.text?.addEventListener("focus",()=>{r.compose?.setAttribute("data-focus","1")}),r.text?.addEventListener("blur",()=>{r.compose?.setAttribute("data-focus","0")}),r.photo?.addEventListener("click",()=>{h||(_(""),r.file?.click())}),r.thumbRemove?.addEventListener("click",()=>Oe()),r.file?.addEventListener("change",()=>{const e=r.file?.files?.[0]||null;Fe(e),r.file&&(r.file.value="")}),(r.switchButtons||[]).forEach(e=>{e.addEventListener("click",()=>{if(h)return;const t=Se(e.getAttribute("data-bc-mode"));t!==m&&(L(),m=t,he(),r.body&&(r.body.scrollTop=0),K())})}),r.tag?.addEventListener("click",()=>Be()),r.chipRemove?.addEventListener("click",()=>{h||(y().product=null,be())}),r.pickerClose?.addEventListener("click",()=>L()),r.picker?.addEventListener("click",e=>{e.target===r.picker&&L()}),r.pickerSearch?.addEventListener("input",()=>T()),r.pickerList?.addEventListener("click",e=>{const t=e.target?.closest?.("[data-bc-picker-item]");if(!t)return;const i=String(t.dataset.bcPickerItem||"").trim(),a=u.items.find(s=>s.id===i)||null;g=g&&g.id===i?null:a,Array.from(r.pickerList.querySelectorAll("[data-bc-picker-item]")).forEach(s=>{s.setAttribute("data-selected",g&&s.dataset.bcPickerItem===g.id?"1":"0")}),M()}),r.pickerConfirm?.addEventListener("click",()=>{g&&(y().product=g,L(),be())})}function Ke(e){const t=E[e];t&&(Y(t),t.caption="",t.file=null,t.previewUrl="",t.thumbUrl="",t.mediaType="",t.product=null)}async function qe(e,t){if(!F||!j)return"";try{const i=await F(e);if(!i)return"";const a=await j(i,t);return String(a?.cdnUrl||a?.url||"").trim()}catch{return""}}async function Ge(){if(h)return;const e=y();if(!Pe({caption:e.caption,hasImage:!!e.file,submitting:h}))return;const t=String($()||"").trim();if(!t){_(o.errorNoBusiness);return}if(b&&b.navigator&&b.navigator.onLine===!1){_(o.errorOffline);return}const i=e.mediaType==="video"?"video":"image";if(!(i==="video"?te:j)||(m==="story"?!ie:!re)){_(o.errorGeneric);return}const s=m,p=String(e.caption||"").trim().slice(0,z),v=e.file;D(!0),_("");try{const k=i==="video"?await te(v,t):await j(v,t),S=String(k?.cdnUrl||k?.url||"").trim();if(!S)throw new Error(o.errorGeneric);const I=i==="video"?await qe(v,t):"",G=e.product,ge={menuItemId:G?.id||"",menuItemName:G?.name||"",menuItemPrice:G?.price??"",menuItemImage:G?.imageUrl||""};s==="story"?await ie({restaurantId:t,caption:p,mediaUrl:S,mediaType:i,posterUrl:I,...ge}):await re({restaurantId:t,caption:p,mediaUrl:S,mediaType:i,posterUrl:I,...ge}),D(!1),q(),Ke(s),He(s==="story"?o.successStory:s==="profile"?o.successProfile:o.successPost);try{await Le(s)}catch{}}catch(k){D(!1);const S=String(k?.message||"").trim();_(S||o.errorGeneric)}}function Ze(e="post"){if(!c)return;const t=Se(e);if(Ie(),!!f){if(De(),m=t,L(),D(!1),!C){const i=ut(c);i&&f.parentNode!==i&&i.appendChild(f),C=!0}he(),Xe(),r.body&&(r.body.scrollTop=0),ye(),K()}}function Xe(){if(oe||!b?.addEventListener)return;oe=!0;const e=()=>{C&&R()};b.addEventListener("resize",e,{passive:!0}),b.addEventListener("orientationchange",e,{passive:!0})}function q(){if(C){C=!1,L();try{f?.remove()}catch{}ye()}}return Object.freeze({open:Ze,close:q,isOpen:()=>C})}export{dt as BUSINESS_COMPOSER_CSS,we as buildComposerProductsSignatureCore,Pe as canPublishComposerDraftCore,kt as createBusinessComposerController,bt as dedupeComposerProductsCore,ft as filterComposerProductsCore,Se as normalizeComposerModeCore,xt as normalizeComposerProductCore,lt as resolveComposerProductTextCore};
