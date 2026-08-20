import{aS as et,aT as tt,aU as rt,aV as it,aW as nt,aX as at}from"./domain-feed-social-eager-CJvmlNIC.js";import{r as ot}from"./profile-post-card-markup-utils-HwqIiXgP.js";import{o as ct,p as st}from"./domain-media-eager-DAUyCk2O.js";import"./domain-auth-B1kS5TG-.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-menu-eager-D6nRxLnQ.js";const xe="mnyraBusinessComposerStyles",ke=448,lt=24,dt=10,we=Object.freeze(["linear-gradient(150deg,#94a3b8 0%,#475569 55%,#1e293b 100%)","linear-gradient(150deg,#a5b4fc 0%,#6366f1 55%,#312e81 100%)"]),pt="businessComposerOverlayRoot",ut=15*1024*1024,bt=50*1024*1024,j=600,ft=8,mt=140,Z="mnyraBusinessComposerToast",ht="#f8fafc",Q="#ffffff",c=Object.freeze({titlePost:"Postim i ri",titleStory:"Story e re",titleProfile:"Postim për profilin",submit:"Posto",submitBusy:"Duke postuar…",close:"Mbyll",placeholderPost:"Shkruaj diçka për postimin tënd…",placeholderStory:"Shkruaj diçka për story-n tënde…",placeholderProfile:"Shkruaj diçka për profilin tënd…",addPhoto:"Foto ose video",changeImage:"Ndrysho foton",changeVideo:"Ndrysho videon",removeMedia:"Hiq median",removeProduct:"Hiq produktin",switchPost:"Postim",switchStory:"Story",switchProfile:"Profil",switchLabel:"Zgjidh llojin e postimit",previewTitle:"Parapamje",previewPost:"Si duket në Zbulo",previewStory:"Në rreshtin e story-ve",previewProfile:"Si duket në profilin tënd",pickerConfirm:"Zgjidh",pickerLoading:"Duke ngarkuar…",pickerError:"Lista nuk u ngarkua.",pickerRetry:"Provo përsëri",errorMediaType:"Lejohen vetëm foto ose video.",errorImageSize:"Fotoja duhet të jetë deri në 15MB.",errorVideoSize:"Videoja duhet të jetë deri në 50MB.",errorNoBusiness:"Kjo llogari nuk është e lidhur me një biznes.",errorGeneric:"Postimi dështoi. Provo përsëri.",errorOffline:"Nuk ka lidhje me internetin. Provo përsëri.",successPost:"Postimi u publikua.",successStory:"Story u publikua.",successProfile:"Postimi u publikua në profil.",businessFallback:"Biznesi im"}),Se=Object.freeze({restaurant:Object.freeze({tag:"Etiketo nga menuja",pickerTitle:"Zgjidh nga menuja",pickerSearch:"Kërko ushqime ose pije…",pickerEmpty:"Nuk u gjet asnjë produkt.",optional:"Produkti nuk është i detyrueshëm."}),shop:Object.freeze({tag:"Etiketo nga produktet",pickerTitle:"Zgjidh nga produktet",pickerSearch:"Kërko produkte…",pickerEmpty:"Nuk u gjet asnjë produkt.",optional:"Produkti nuk është i detyrueshëm."}),hotel:Object.freeze({tag:"Etiketo nga dhomat",pickerTitle:"Zgjidh nga dhomat",pickerSearch:"Kërko dhoma…",pickerEmpty:"Nuk u gjet asnjë dhomë.",optional:"Dhoma nuk është e detyrueshme."})});function yt(p=""){const l=String(p||"").trim().toLowerCase();return Se[l]||Se.restaurant}const w='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"',x=Object.freeze({close:`<svg ${w}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,image:`<svg ${w}><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`,tag:`<svg ${w}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>`,plus:`<svg ${w}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`,camera:`<svg ${w}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,check:`<svg ${w}><path d="M20 6 9 17l-5-5"></path></svg>`,search:`<svg ${w}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,heart:`<svg ${w}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`,comment:`<svg ${w}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>`,user:`<svg ${w}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`}),gt=`
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
  /* Der weiche Schatten gehoert zur Kachel. Die Buehne ist genau so hoch wie
     ihr Inhalt - schnitte sie ab, endete der Schatten unten mit einer harten
     Kante statt auszulaufen. Er darf deshalb ueberstehen; am Layout aendert
     das nichts, ein Schatten nimmt keinen Platz ein.
     Nur die randlose Story-Reihe schneidet weiter ab: die steht absichtlich
     breiter als die Buehne. */
  overflow: visible;
  width: 100%;
}
/* Die Story-Reihe von Zbulo: dieselbe Flex-Reihe, derselbe Abstand, derselbe
   Einzug. Sie scrollt hier nicht - es sind genau die drei Kacheln zu sehen,
   die auch im Feed nebeneinander stehen. */
.mnyra-bc__story-track {
  display: flex;
  align-items: flex-start;
  gap: ${dt}px;
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
  overflow: hidden;
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
`;function vt(p){if(!(!p||p.getElementById(xe)))try{const l=p.createElement("style");l.id=xe,l.textContent=gt,p.head?.appendChild(l)}catch{}}function _t(p){if(!p?.body)return null;let l=p.getElementById("overlayRoot");return l||(l=p.createElement("div"),l.id="overlayRoot",l.style.position="relative",l.style.zIndex="200",l.style.isolation="isolate",p.body.appendChild(l)),l}function Tt(p="",l={}){const a=l&&typeof l=="object"?l:{},s=String(p||"").trim();if(!s)return null;const u=a.imageUrl||a.image||(Array.isArray(a.images)?a.images[0]:"")||"",U=String(a.type||a.menuType||"").trim().toLowerCase(),X=["drink","drinks","beverage","getraenke","getränke"].includes(U)?"drink":"food";return{id:s,name:String(a.name||a.title||"").trim()||s,price:a.price??"",category:String(a.category||"").trim(),type:X,imageUrl:typeof u=="string"?u.trim():""}}function xt(p=[]){const l=new Set,a=[];return(Array.isArray(p)?p:[]).forEach(s=>{const u=String(s?.id||"").trim();!u||l.has(u)||(l.add(u),a.push(s))}),a}function Pe(p=[]){return(Array.isArray(p)?p:[]).map(l=>`${l?.id||""}|${l?.name||""}|${l?.price??""}|${l?.imageUrl||""}`).join("~")}function kt(p=[],l=""){const a=Array.isArray(p)?p:[],s=String(l||"").trim().toLowerCase();return s?a.filter(u=>`${u?.name||""} ${u?.category||""}`.toLowerCase().includes(s)):a}function Ce(p=""){const l=String(p||"").trim().toLowerCase();return l==="story"?"story":l==="profile"?"profile":"post"}function Ee({caption:p="",hasImage:l=!1,submitting:a=!1}={}){return a||!l?!1:String(p||"").trim().length>0}function It({documentObj:p=null,windowObj:l=null,api:a={}}={}){const s=p||(typeof document>"u"?null:document),u=l||s?.defaultView||(typeof window>"u"?null:window),U=typeof a.getRestaurantIdFn=="function"?a.getRestaurantIdFn:(()=>""),X=typeof a.getBusinessMetaFn=="function"?a.getBusinessMetaFn:(()=>({name:"",logoUrl:""})),ee=typeof a.loadProductsFn=="function"?a.loadProductsFn:null,Le=typeof a.getBusinessKindFn=="function"?a.getBusinessKindFn:(()=>""),F=typeof a.uploadImageFn=="function"?a.uploadImageFn:null,te=typeof a.uploadVideoFn=="function"?a.uploadVideoFn:null,N=typeof a.captureVideoPosterFn=="function"?a.captureVideoPosterFn:null,re=typeof a.createPostFn=="function"?a.createPostFn:null,ie=typeof a.createStoryFn=="function"?a.createStoryFn:null,Te=typeof a.afterPublishFn=="function"?a.afterPublishFn:(()=>{}),Ie=typeof a.formatPriceFn=="function"?a.formatPriceFn:(e=>String(e??"")),ne=typeof a.getOptimizedImageUrlFn=="function"?a.getOptimizedImageUrlFn:(e=>String(e||"").trim()),O=typeof a.escapeHtmlFn=="function"?a.escapeHtmlFn:(e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")),A=typeof a.iconFn=="function"?a.iconFn:(()=>""),S=(e="")=>O(String(e??"")),L={post:{caption:"",file:null,previewUrl:"",thumbUrl:"",posterFile:null,mediaType:"",product:null},story:{caption:"",file:null,previewUrl:"",thumbUrl:"",posterFile:null,mediaType:"",product:null},profile:{caption:"",file:null,previewUrl:"",thumbUrl:"",posterFile:null,mediaType:"",product:null}},b={status:"idle",items:[],restaurantId:"",fresh:!1};let m=null,r=null,f="post",C=!1,h=!1,v=null,ae=!1,oe=!1,R=0;function g(){return L[f]||L.post}function B(){let e="";try{e=String(Le()||"")}catch{e=""}return yt(e)}function ce(e=""){const t=String(e||"").trim();if(t.startsWith("blob:"))try{u?.URL?.revokeObjectURL?.(t)}catch{}}function W(e){e&&(ce(e.previewUrl),e.thumbUrl&&e.thumbUrl!==e.previewUrl&&ce(e.thumbUrl))}function $e(){const e=B();return`
      <div class="mnyra-bc__sheet">
        <header class="mnyra-bc__head">
          <button type="button" class="mnyra-bc__x" data-bc-close aria-label="${c.close}" title="${c.close}">${x.close}</button>
          <div class="mnyra-bc__title" data-bc-title></div>
          <button type="button" class="mnyra-bc__submit" data-bc-submit disabled>
            <span class="mnyra-bc__spinner"></span><span data-bc-submit-label>${c.submit}</span>
          </button>
        </header>
        <div class="mnyra-bc__body" data-bc-body>
          <div class="mnyra-bc__compose" data-bc-compose>
            <textarea class="mnyra-bc__text" data-bc-text maxlength="${j}" rows="5" enterkeyhint="done"></textarea>
            <div class="mnyra-bc__compose-bar">
              <div class="mnyra-bc__thumb" data-bc-thumb data-empty="1" hidden>
                <img class="mnyra-bc__thumb-img" data-bc-thumb-img alt="" decoding="async" />
                <span class="mnyra-bc__thumb-fallback">${x.image}</span>
                <button type="button" class="mnyra-bc__thumb-x" data-bc-thumb-remove aria-label="${c.removeMedia}" title="${c.removeMedia}">${x.close}</button>
              </div>
              <button type="button" class="mnyra-bc__tool" data-bc-photo>
                ${x.image}<span class="mnyra-bc__tool-label" data-bc-photo-label>${c.addPhoto}</span>
              </button>
              <button type="button" class="mnyra-bc__tool" data-bc-tag>
                ${x.tag}<span class="mnyra-bc__tool-label" data-bc-tag-label>${e.tag}</span>
              </button>
              <span class="mnyra-bc__count" data-bc-count>0/${j}</span>
            </div>
          </div>
          <div class="mnyra-bc__product-chip" data-bc-chip>
            <img class="mnyra-bc__product-chip-thumb" data-bc-chip-img alt="" decoding="async" />
            <div class="mnyra-bc__product-chip-main">
              <div class="mnyra-bc__product-chip-name" data-bc-chip-name></div>
              <div class="mnyra-bc__product-chip-price" data-bc-chip-price></div>
            </div>
            <button type="button" class="mnyra-bc__product-chip-remove" data-bc-chip-remove>${c.removeProduct}</button>
          </div>
          <div class="mnyra-bc__error" data-bc-error role="alert"></div>

          <section class="mnyra-bc__preview">
            <p class="mnyra-bc__preview-title">${c.previewTitle}</p>

            <div class="mnyra-bc__pane" data-bc-pane="post">
              <p class="mnyra-bc__preview-caption">${c.previewPost}</p>
              <div class="mnyra-bc__stage" data-bc-stage="post">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="post"></div>
              </div>
            </div>

            <div class="mnyra-bc__pane" data-bc-pane="profile">
              <p class="mnyra-bc__preview-caption">${c.previewProfile}</p>
              <div class="mnyra-bc__stage" data-bc-stage="profile">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="profile"></div>
              </div>
            </div>

            <div class="mnyra-bc__pane" data-bc-pane="story">
              <p class="mnyra-bc__preview-caption">${c.previewStory}</p>
              <div class="mnyra-bc__stage mnyra-bc__stage--bleed" data-bc-stage="story">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="story"></div>
              </div>
            </div>
          </section>
        </div>

        <footer class="mnyra-bc__foot">
          <div class="mnyra-bc__switch" role="tablist" aria-label="${c.switchLabel}">
            <button type="button" class="mnyra-bc__switch-btn" role="tab" data-bc-mode="post" aria-selected="true">
              ${x.image}<span>${c.switchPost}</span>
            </button>
            <button type="button" class="mnyra-bc__switch-btn" role="tab" data-bc-mode="story" aria-selected="false">
              ${x.camera}<span>${c.switchStory}</span>
            </button>
            <button type="button" class="mnyra-bc__switch-btn" role="tab" data-bc-mode="profile" aria-selected="false">
              ${x.user}<span>${c.switchProfile}</span>
            </button>
          </div>
        </footer>

        <div class="mnyra-bc__picker" data-bc-picker>
          <div class="mnyra-bc__picker-sheet">
            <div class="mnyra-bc__picker-head">
              <span class="mnyra-bc__picker-title" data-bc-picker-title>${e.pickerTitle}</span>
              <button type="button" class="mnyra-bc__x" data-bc-picker-close aria-label="${c.close}" title="${c.close}">${x.close}</button>
            </div>
            <div class="mnyra-bc__picker-search">
              ${x.search}
              <input type="search" data-bc-picker-search placeholder="${e.pickerSearch}" autocomplete="off" />
            </div>
            <div class="mnyra-bc__picker-list" data-bc-picker-list></div>
            <div class="mnyra-bc__picker-foot">
              <p class="mnyra-bc__picker-note" data-bc-picker-note>${e.optional}</p>
              <button type="button" class="mnyra-bc__picker-confirm" data-bc-picker-confirm disabled>${c.pickerConfirm}</button>
            </div>
          </div>
        </div>
      </div>
      <input type="file" accept="image/*,video/*" data-bc-file hidden />
    `}function Ue(){if(m||!s)return m;vt(s),m=s.createElement("div"),m.id=pt,m.className="mnyra-bc modal-overlay",m.setAttribute("data-modal-surface",Q),m.style.setProperty("--modal-surface",Q),m.innerHTML=$e();const e=t=>m.querySelector(t);return r={title:e("[data-bc-title]"),close:e("[data-bc-close]"),submit:e("[data-bc-submit]"),submitLabel:e("[data-bc-submit-label]"),body:e("[data-bc-body]"),compose:e("[data-bc-compose]"),text:e("[data-bc-text]"),count:e("[data-bc-count]"),photo:e("[data-bc-photo]"),photoLabel:e("[data-bc-photo-label]"),thumb:e("[data-bc-thumb]"),thumbImg:e("[data-bc-thumb-img]"),thumbRemove:e("[data-bc-thumb-remove]"),tag:e("[data-bc-tag]"),tagLabel:e("[data-bc-tag-label]"),chip:e("[data-bc-chip]"),chipImg:e("[data-bc-chip-img]"),chipName:e("[data-bc-chip-name]"),chipPrice:e("[data-bc-chip-price]"),chipRemove:e("[data-bc-chip-remove]"),error:e("[data-bc-error]"),panePost:e('[data-bc-pane="post"]'),paneStory:e('[data-bc-pane="story"]'),paneProfile:e('[data-bc-pane="profile"]'),stageProfile:e('[data-bc-stage="profile"]'),stageProfileInner:e('[data-bc-stage-inner="profile"]'),stagePost:e('[data-bc-stage="post"]'),stagePostInner:e('[data-bc-stage-inner="post"]'),stageStory:e('[data-bc-stage="story"]'),stageStoryInner:e('[data-bc-stage-inner="story"]'),switchButtons:Array.from(m.querySelectorAll("[data-bc-mode]")),picker:e("[data-bc-picker]"),pickerTitle:e("[data-bc-picker-title]"),pickerNote:e("[data-bc-picker-note]"),pickerClose:e("[data-bc-picker-close]"),pickerSearch:e("[data-bc-picker-search]"),pickerList:e("[data-bc-picker-list]"),pickerConfirm:e("[data-bc-picker-confirm]"),file:e("[data-bc-file]")},Ze(),m}function se(e,t=""){if(!e)return;const i=String(t||"").trim();i?(e.getAttribute("src")!==i&&e.setAttribute("src",i),e.style.visibility=""):(e.removeAttribute("src"),e.style.visibility="hidden")}function le(){let e={};try{e=X()||{}}catch{}return{name:String(e.name||"").trim()||c.businessFallback,logoUrl:String(e.logoUrl||"").trim(),city:String(e.city||"").trim()}}function Ae(){const e=Number(u?.innerWidth)||ke;return Math.min(e,ke)}function de(e){const t=e?.mediaType==="video"?String(e?.thumbUrl||"").trim():"";return t?`poster="${S(t)}"`:""}function Me(){const e=L.post,t=le(),i=String(e.previewUrl||"").trim(),n=de(e),d=`<span class="block w-full h-full appearance-none bg-transparent text-left" style="display:block;width:100%;height:100%;padding:0;margin:0;border:0;background:transparent;">${i?e.mediaType==="video"?`<video src="${S(i)}" ${n} autoplay muted loop playsinline preload="metadata" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000"></video>`:`<img src="${S(i)}" decoding="async" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`:""}</span>`,y=t.logoUrl?`<img src="${S(t.logoUrl)}" decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />`:"";return tt({business:t.name,location:t.city,content:String(e.caption||"").trim(),likes:0,comments:0,isLive:!1,logoImgHtml:y,heroMediaHtml:d,heroReady:!!i,escapeHtmlFn:O,iconFn:A})}function ze(){const e=L.profile,t=String(e.previewUrl||"").trim(),i=String(e.thumbUrl||"").trim(),n=e.mediaType==="video",o=t&&!t.includes("#")?`${t}#t=0.001`:t;let d='<div class="w-full h-full bg-slate-200"></div>';return t&&n&&!i?d=`<video src="${S(o)}" preload="metadata" muted playsinline webkit-playsinline width="400" height="500" class="w-full h-full object-cover pointer-events-none"></video>`:t&&(d=`<img src="${S(n?i:t)}" decoding="async" width="400" height="500" class="w-full h-full object-cover" />`),`<div class="grid grid-cols-2 gap-3" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0.75rem;">${ot({mediaHtml:d,isVideo:e.mediaType==="video",playIconHtml:A("play","w-3.5 h-3.5 fill-white block"),likeLabel:"0",commentLabel:"0",heartIconHtml:A("heart","w-3 h-3 fill-rose-500 text-rose-500"),commentIconHtml:A("message-circle","w-3 h-3 text-indigo-200"),escapeHtmlFn:O})}</div>`}function pe({label:e,mediaHtml:t,logoImgHtml:i,first:n=!1,shellAttrs:o=""}){return it({label:e,mediaHtml:t,logoImgHtml:i,shellAttrs:o,shellStyle:nt({withMarginLeft:n}),innerStyle:at(),escapeHtmlFn:O})}function je(){const e=L.story,t=le(),i=String(e.previewUrl||"").trim(),n=i?e.mediaType==="video"?`<video src="${S(i)}" ${de(e)} autoplay muted loop playsinline preload="metadata" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;"></video>`:`<img src="${S(i)}" decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />`:rt({iconFn:A}),o=`<img src="${S(t.logoUrl)}" decoding="async" width="28" height="28" class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />`;return pe({label:t.name,mediaHtml:n,logoImgHtml:o,first:!0,shellAttrs:"data-bc-story-own"})}function ue(e=0){const t=we[e%we.length];return pe({label:"",mediaHtml:`<div class="absolute inset-0" style="position:absolute;inset:0;background:${t};"></div>`,logoImgHtml:"",shellAttrs:`data-bc-story-blur="${e}" aria-hidden="true"`})}function Fe(){return`
      <div class="mnyra-bc__story-track">
        ${je()}
        ${ue(0)}
        ${ue(1)}
      </div>
    `}function Y(e,t,i,{centered:n=!0}={}){if(!e||!t)return;const o=e.clientWidth||i;t.style.width=`${i}px`,t.style.height="";let d=Math.min(1,i>0?o/i:1);(!Number.isFinite(d)||d<=0)&&(d=1),t.style.transform=`scale(${d})`;const y=t.scrollHeight;e.style.height=`${Math.round(y*d)}px`,t.style.marginLeft=n?`${Math.max(0,(o-i*d)/2)}px`:"0px"}function H(){if(!r||!m?.isConnected)return;const e=Ae();if(f==="story"){Y(r.stageStory,r.stageStoryInner,e);return}const t=Math.max(1,e-lt*2);if(f==="profile"){Y(r.stageProfile,r.stageProfileInner,t,{centered:!1});return}Y(r.stagePost,r.stagePostInner,t,{centered:!1})}function T(){r&&(f==="story"?r.stageStoryInner&&(r.stageStoryInner.innerHTML=Fe()):f==="profile"?r.stageProfileInner&&(r.stageProfileInner.innerHTML=`<div class="py-4">${ze()}</div>`):r.stagePostInner&&(r.stagePostInner.innerHTML=`<div class="py-4">${Me()}</div>`),H(),u?.requestAnimationFrame?.(()=>H()))}function Ne(){if(!r||f==="story"||f==="profile")return;const e=String(g().caption||"").trim(),t=r.stagePostInner?.querySelector(".feed-card p.line-clamp-2");t&&(t.textContent=e),H()}function be(){const e=g().product,t=e?"1":"0";if(r.chip&&r.chip.setAttribute("data-visible",t),r.tag&&r.tag.setAttribute("data-active",t),r.tagLabel&&(r.tagLabel.textContent=e?e.name:B().tag),!e)return;const i=he(e.price),n=e.imageUrl?ne(e.imageUrl,"thumb"):"";r.chipName&&(r.chipName.textContent=e.name),r.chipPrice&&(r.chipPrice.textContent=i),se(r.chipImg,n)}function fe(){be(),f==="story"&&T()}function me(){if(!r.count)return;const e=String(g().caption||"").length;r.count.textContent=`${e}/${j}`,r.count.setAttribute("data-tone",e>=j?"full":"idle")}function he(e){if(e==null||e==="")return"";let t="";try{t=String(Ie(e)||"").trim()}catch{t=""}return t==="-"?"":t}function M(){const e=g(),t=Ee({caption:e.caption,hasImage:!!e.file,submitting:h});r.submit&&(r.submit.disabled=!t,r.submit.setAttribute("aria-disabled",t?"false":"true"))}function _(e=""){if(!r.error)return;const t=String(e||"").trim();r.error.textContent=t,r.error.setAttribute("data-visible",t?"1":"0")}function ye(){const e=f==="story",t=f==="profile",i=g();r.title&&(r.title.textContent=e?c.titleStory:t?c.titleProfile:c.titlePost),r.text&&(r.text.placeholder=e?c.placeholderStory:t?c.placeholderProfile:c.placeholderPost,r.text.value!==i.caption&&(r.text.value=i.caption));const n=B();r.pickerTitle&&(r.pickerTitle.textContent=n.pickerTitle),r.pickerNote&&(r.pickerNote.textContent=n.optional),r.pickerSearch&&(r.pickerSearch.placeholder=n.pickerSearch),D(),r.panePost&&r.panePost.setAttribute("data-visible",f==="post"?"1":"0"),r.paneStory&&r.paneStory.setAttribute("data-visible",e?"1":"0"),r.paneProfile&&r.paneProfile.setAttribute("data-visible",t?"1":"0"),(r.switchButtons||[]).forEach(o=>{const d=o.getAttribute("data-bc-mode")===f;o.setAttribute("aria-selected",d?"true":"false")}),be(),me(),T(),M(),_("")}function V(e){h=!!e,m&&m.setAttribute("data-busy",h?"1":"0"),r.submitLabel&&(r.submitLabel.textContent=h?c.submitBusy:c.submit),r.close&&(r.close.disabled=h),r.text&&(r.text.readOnly=h),(r.switchButtons||[]).forEach(t=>{t.disabled=h}),M()}async function Oe(e){if(!e)return;const t=ct(e);if(!t){_(c.errorMediaType);return}const i=t==="video";if(Number(e.size||0)>(i?bt:ut)){_(i?c.errorVideoSize:c.errorImageSize);return}const n=g();W(n),n.file=e,n.mediaType=t,n.previewUrl="",n.thumbUrl="",n.posterFile=null;try{n.previewUrl=u?.URL?.createObjectURL?u.URL.createObjectURL(e):""}catch{n.previewUrl=""}i||(n.thumbUrl=n.previewUrl),_(""),D(),M(),T(),i&&Be(n,e)}function D(){const e=g(),t=!!e.file,i=e.mediaType==="video";r.photoLabel&&(r.photoLabel.textContent=t?i?c.changeVideo:c.changeImage:c.addPhoto),r.photo&&r.photo.setAttribute("data-active",t?"1":"0");const n=t?String(e.thumbUrl||"").trim():"";r.thumb&&(r.thumb.hidden=!t,r.thumb.setAttribute("data-empty",n?"0":"1")),se(r.thumbImg,n)}function ge(){return r&&(f==="story"?r.stageStoryInner:f==="profile"?r.stageProfileInner:r.stagePostInner)?.querySelector?.("video")||null}async function Re(e,t){for(let i=0;i<ft;i+=1){if(await new Promise(d=>{typeof u?.setTimeout=="function"?u.setTimeout(d,mt):d()}),e.file!==t)return null;const n=ge();if(!n)continue;const o=await st(n,{documentObj:s});if(o)return o}return null}async function Be(e,t){if(!u?.URL?.createObjectURL)return;let i=null;try{N&&(i=await N(t))}catch{}if(e.file===t){if(!i)try{i=await Re(e,t)}catch{}!i||e.file!==t||(e.posterFile=i,e.thumbUrl=u.URL.createObjectURL(i),D(),He(e))}}function He(e){if(!r)return;const t=String(e.thumbUrl||"").trim();if(!t||e!==g())return;if(f==="profile"){T();return}const i=ge();if(!i){T();return}i.setAttribute("poster",t)}function Ve(){if(h)return;const e=g();e.file&&(W(e),e.file=null,e.previewUrl="",e.thumbUrl="",e.posterFile=null,e.mediaType="",_(""),D(),T(),M())}function K({force:e=!1}={}){const t=String(U()||"").trim();if(!t||!ee){b.status="error",I();return}if(b.restaurantId!==t&&(b.restaurantId=t,b.status="idle",b.items=[],b.fresh=!1),!e&&(b.status==="loading"||b.status==="ready"))return;b.status="loading",I();const i=(n,o=!1)=>{if(b.restaurantId!==t||!o&&b.fresh)return;b.fresh=b.fresh||o;const d=xt(n),y=Pe(d)!==Pe(b.items),k=b.status!=="ready";b.items=d,b.status="ready",(y||k)&&I()};(async()=>{try{const n=await ee(t,o=>i(o,!0));i(n)}catch{if(b.restaurantId!==t||b.status==="ready")return;b.items=[],b.status="error",I()}})()}function J(e,t=!1){if(!r.pickerList)return;r.pickerList.textContent="";const i=s.createElement("div");if(i.className="mnyra-bc__picker-state",i.textContent=e,t){const n=s.createElement("button");n.type="button",n.textContent=c.pickerRetry,n.addEventListener("click",()=>K({force:!0})),i.appendChild(s.createElement("br")),i.appendChild(n)}r.pickerList.appendChild(i)}function I(){if(!r.pickerList)return;if(b.status==="loading"||b.status==="idle"){J(c.pickerLoading),z();return}if(b.status==="error"){J(c.pickerError,!0),z();return}const e=String(r.pickerSearch?.value||""),t=kt(b.items,e);if(!t.length){J(B().pickerEmpty),z();return}const i=s.createDocumentFragment();t.forEach(n=>{const o=s.createElement("button");o.type="button",o.className="mnyra-bc__picker-row",o.dataset.bcPickerItem=n.id,v&&v.id===n.id&&o.setAttribute("data-selected","1");const d=s.createElement("img");d.className="mnyra-bc__picker-thumb",d.alt="",d.loading="lazy",d.decoding="async",n.imageUrl&&(d.src=ne(n.imageUrl,"thumb")),o.appendChild(d);const y=s.createElement("div");y.className="mnyra-bc__picker-main";const k=s.createElement("div");k.className="mnyra-bc__picker-name",k.textContent=n.name,y.appendChild(k);const P=s.createElement("div");P.className="mnyra-bc__picker-meta",P.textContent=[n.category,he(n.price)].filter(Boolean).join(" · "),y.appendChild(P),o.appendChild(y);const $=s.createElement("span");$.className="mnyra-bc__picker-mark",$.innerHTML=x.check,o.appendChild($),i.appendChild(o)}),r.pickerList.textContent="",r.pickerList.appendChild(i),z()}function z(){r.pickerConfirm&&(r.pickerConfirm.disabled=!v)}function De(){h||(v=g().product||null,r.pickerSearch&&(r.pickerSearch.value=""),r.picker&&r.picker.setAttribute("data-visible","1"),K(),I())}function E(){r.picker&&r.picker.setAttribute("data-visible","0"),v=null}function Ke(){return r?.picker?.getAttribute("data-visible")==="1"}function qe(e=""){if(!s?.body)return;let t=s.getElementById(Z);t||(t=s.createElement("div"),t.id=Z,t.setAttribute("role","status"),s.body.appendChild(t)),t.textContent=String(e||""),t.setAttribute("data-visible","1"),R&&u?.clearTimeout?.(R),R=u?.setTimeout?.(()=>{t.setAttribute("data-visible","0"),R=0},2600)||0}function ve(){if(!s)return;const e=!!s.querySelector("#overlayRoot .modal-overlay"),t=e?Q:ht;try{s.documentElement.style.setProperty("--active-modal-surface",t),s.documentElement.classList.toggle("modal-open",e),s.body.classList.toggle("modal-open",e);const i=s.getElementById("modalUnderlay");i&&(i.classList.toggle("hidden",!e),i.style.background=t),["safariChromeTintTop","safariChromeTintBottom"].forEach(o=>{const d=s.getElementById(o);d&&(d.style.display=e?"block":"none",d.style.background=t)});const n=s.head?.querySelector('meta[name="theme-color"]');n&&n.setAttribute("content",t)}catch{}}function Ge(){ae||!s||(ae=!0,s.addEventListener("keydown",e=>{if(!(e.key!=="Escape"||!C)){if(Ke()){E(),e.preventDefault();return}h||(q(),e.preventDefault())}}))}function Ze(){r.close?.addEventListener("click",()=>{h||q()}),r.submit?.addEventListener("click",()=>{Ye()}),r.text?.addEventListener("input",()=>{const e=g();e.caption=String(r.text.value||""),me(),Ne(),M()}),r.text?.addEventListener("focus",()=>{r.compose?.setAttribute("data-focus","1")}),r.text?.addEventListener("blur",()=>{r.compose?.setAttribute("data-focus","0")}),r.photo?.addEventListener("click",()=>{h||(_(""),r.file?.click())}),r.thumbRemove?.addEventListener("click",()=>Ve()),r.file?.addEventListener("change",()=>{const e=r.file?.files?.[0]||null;Oe(e),r.file&&(r.file.value="")}),(r.switchButtons||[]).forEach(e=>{e.addEventListener("click",()=>{if(h)return;const t=Ce(e.getAttribute("data-bc-mode"));t!==f&&(E(),f=t,ye(),r.body&&(r.body.scrollTop=0),K())})}),r.tag?.addEventListener("click",()=>De()),r.chipRemove?.addEventListener("click",()=>{h||(g().product=null,fe())}),r.pickerClose?.addEventListener("click",()=>E()),r.picker?.addEventListener("click",e=>{e.target===r.picker&&E()}),r.pickerSearch?.addEventListener("input",()=>I()),r.pickerList?.addEventListener("click",e=>{const t=e.target?.closest?.("[data-bc-picker-item]");if(!t)return;const i=String(t.dataset.bcPickerItem||"").trim(),n=b.items.find(o=>o.id===i)||null;v=v&&v.id===i?null:n,Array.from(r.pickerList.querySelectorAll("[data-bc-picker-item]")).forEach(o=>{o.setAttribute("data-selected",v&&o.dataset.bcPickerItem===v.id?"1":"0")}),z()}),r.pickerConfirm?.addEventListener("click",()=>{v&&(g().product=v,E(),fe())})}function Xe(e){const t=L[e];t&&(W(t),t.caption="",t.file=null,t.previewUrl="",t.thumbUrl="",t.posterFile=null,t.mediaType="",t.product=null)}async function We(e,t,i=null){if(!F)return"";try{const n=i||(N?await N(e):null);if(!n)return"";const o=await F(n,t);return String(o?.cdnUrl||o?.url||"").trim()}catch{return""}}async function Ye(){if(h)return;const e=g();if(!Ee({caption:e.caption,hasImage:!!e.file,submitting:h}))return;const t=String(U()||"").trim();if(!t){_(c.errorNoBusiness);return}if(u&&u.navigator&&u.navigator.onLine===!1){_(c.errorOffline);return}const i=e.mediaType==="video"?"video":"image";if(!(i==="video"?te:F)||(f==="story"?!ie:!re)){_(c.errorGeneric);return}const o=f,d=String(e.caption||"").trim().slice(0,j),y=e.file;V(!0),_("");try{const k=i==="video"?await te(y,t):await F(y,t),P=String(k?.cdnUrl||k?.url||"").trim();if(!P)throw new Error(c.errorGeneric);const $=i==="video"?await We(y,t,e.posterFile):"",G=e.product,_e={menuItemId:G?.id||"",menuItemName:G?.name||"",menuItemPrice:G?.price??"",menuItemImage:G?.imageUrl||""};o==="story"?await ie({restaurantId:t,caption:d,mediaUrl:P,mediaType:i,posterUrl:$,..._e}):await re({restaurantId:t,caption:d,mediaUrl:P,mediaType:i,posterUrl:$,surface:et(o),..._e}),V(!1),q(),Xe(o),qe(o==="story"?c.successStory:o==="profile"?c.successProfile:c.successPost);try{await Te(o)}catch{}}catch(k){V(!1);const P=String(k?.message||"").trim();_(P||c.errorGeneric)}}function Je(e="post"){if(!s)return;const t=Ce(e);if(Ue(),!!m){if(Ge(),f=t,E(),V(!1),!C){const i=_t(s);i&&m.parentNode!==i&&i.appendChild(m),C=!0}ye(),Qe(),r.body&&(r.body.scrollTop=0),ve(),K()}}function Qe(){if(oe||!u?.addEventListener)return;oe=!0;const e=()=>{C&&H()};u.addEventListener("resize",e,{passive:!0}),u.addEventListener("orientationchange",e,{passive:!0})}function q(){if(C){C=!1,E();try{m?.remove()}catch{}ve()}}return Object.freeze({open:Je,close:q,isOpen:()=>C})}export{gt as BUSINESS_COMPOSER_CSS,Pe as buildComposerProductsSignatureCore,Ee as canPublishComposerDraftCore,It as createBusinessComposerController,xt as dedupeComposerProductsCore,kt as filterComposerProductsCore,Ce as normalizeComposerModeCore,Tt as normalizeComposerProductCore,yt as resolveComposerProductTextCore};
