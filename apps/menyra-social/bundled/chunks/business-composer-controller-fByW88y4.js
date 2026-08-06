import{au as Be,av as Ne,aw as Oe,ax as Re,ay as He}from"./domain-feed-social-eager-CAMxL9w6.js";import{o as De}from"./domain-media-eager-B3Bb4ghO.js";import"./domain-auth-Aq-4Vdvh.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-menu-eager-Ca3mC5Kt.js";const ue="mnyraBusinessComposerStyles",be=448,Ve=10,fe=Object.freeze(["linear-gradient(150deg,#94a3b8 0%,#475569 55%,#1e293b 100%)","linear-gradient(150deg,#a5b4fc 0%,#6366f1 55%,#312e81 100%)"]),Ge="businessComposerOverlayRoot",qe=15*1024*1024,Ke=50*1024*1024,me=600,R="mnyraBusinessComposerToast",Ze="#f8fafc",q="#ffffff",a=Object.freeze({titlePost:"Postim i ri",titleStory:"Story e re",submit:"Posto",submitBusy:"Duke postuar…",close:"Mbyll",placeholderPost:"Shkruaj diçka për postimin tënd…",placeholderStory:"Shkruaj diçka për story-n tënde…",addPhoto:"Shto foto/video",changePhoto:"Ndrysho median",tagProduct:"Etiketo produkt",removeProduct:"Hiq produktin",productOptional:"Produkti nuk është i detyrueshëm.",hintNeedBoth:"Që të postosh, duhen edhe teksti edhe fotoja ose videoja.",hintReady:"Gati për t'u postuar.",switchPost:"Postim",switchStory:"Story",switchLabel:"Zgjidh llojin e postimit",previewTitle:"Parapamje",previewPost:"Si duket në Zbulo",previewStory:"Në rreshtin e story-ve",pickerTitle:"Zgjidh një produkt",pickerSearch:"Kërko ushqime ose pije…",pickerConfirm:"Zgjidh produktin",pickerEmpty:"Nuk u gjet asnjë produkt.",pickerLoading:"Duke ngarkuar produktet…",pickerError:"Produktet nuk u ngarkuan.",pickerRetry:"Provo përsëri",errorMediaType:"Lejohen vetëm foto ose video.",errorImageSize:"Fotoja duhet të jetë deri në 15MB.",errorVideoSize:"Videoja duhet të jetë deri në 50MB.",errorNoBusiness:"Kjo llogari nuk është e lidhur me një biznes.",errorGeneric:"Postimi dështoi. Provo përsëri.",errorOffline:"Nuk ka lidhje me internetin. Provo përsëri.",successPost:"Postimi u publikua.",successStory:"Story u publikua.",businessFallback:"Biznesi im"}),_='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"',S=Object.freeze({close:`<svg ${_}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,image:`<svg ${_}><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`,tag:`<svg ${_}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>`,plus:`<svg ${_}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`,camera:`<svg ${_}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,check:`<svg ${_}><path d="M20 6 9 17l-5-5"></path></svg>`,search:`<svg ${_}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,heart:`<svg ${_}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`,comment:`<svg ${_}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>`}),Xe=`
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
  gap: ${Ve}px;
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
#${R} {
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
#${R}[data-visible="1"] { opacity: 1; }
@media (min-width: 640px) {
  .mnyra-bc__sheet { max-width: 560px; margin: 0 auto; }
  .mnyra-bc__picker { padding-bottom: 24px; }
  .mnyra-bc__picker-sheet { max-width: 520px; margin: 0 auto; }
}
`;function Ye(u){if(!(!u||u.getElementById(ue)))try{const l=u.createElement("style");l.id=ue,l.textContent=Xe,u.head?.appendChild(l)}catch{}}function We(u){if(!u?.body)return null;let l=u.getElementById("overlayRoot");return l||(l=u.createElement("div"),l.id="overlayRoot",l.style.position="relative",l.style.zIndex="200",l.style.isolation="isolate",u.body.appendChild(l)),l}function at(u="",l={}){const n=l&&typeof l=="object"?l:{},c=String(u||"").trim();if(!c)return null;const d=n.imageUrl||n.image||(Array.isArray(n.images)?n.images[0]:"")||"",I=String(n.type||n.menuType||"").trim().toLowerCase(),H=["drink","drinks","beverage","getraenke","getränke"].includes(I)?"drink":"food";return{id:c,name:String(n.name||n.title||"").trim()||c,price:n.price??"",category:String(n.category||"").trim(),type:H,imageUrl:typeof d=="string"?d.trim():""}}function Qe(u=[],l=""){const n=Array.isArray(u)?u:[],c=String(l||"").trim().toLowerCase();return c?n.filter(d=>`${d?.name||""} ${d?.category||""}`.toLowerCase().includes(c)):n}function he({caption:u="",hasImage:l=!1,submitting:n=!1}={}){return n||!l?!1:String(u||"").trim().length>0}function nt({documentObj:u=null,windowObj:l=null,api:n={}}={}){const c=u||(typeof document>"u"?null:document),d=l||c?.defaultView||(typeof window>"u"?null:window),I=typeof n.getRestaurantIdFn=="function"?n.getRestaurantIdFn:(()=>""),H=typeof n.getBusinessMetaFn=="function"?n.getBusinessMetaFn:(()=>({name:"",logoUrl:""})),K=typeof n.loadProductsFn=="function"?n.loadProductsFn:null,z=typeof n.uploadImageFn=="function"?n.uploadImageFn:null,Z=typeof n.uploadVideoFn=="function"?n.uploadVideoFn:null,X=typeof n.captureVideoPosterFn=="function"?n.captureVideoPosterFn:null,Y=typeof n.createPostFn=="function"?n.createPostFn:null,W=typeof n.createStoryFn=="function"?n.createStoryFn:null,ye=typeof n.afterPublishFn=="function"?n.afterPublishFn:(()=>{}),ge=typeof n.formatPriceFn=="function"?n.formatPriceFn:(e=>String(e??"")),Q=typeof n.getOptimizedImageUrlFn=="function"?n.getOptimizedImageUrlFn:(e=>String(e||"").trim()),D=typeof n.escapeHtmlFn=="function"?n.escapeHtmlFn:(e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")),J=typeof n.iconFn=="function"?n.iconFn:(()=>""),L=(e="")=>D(String(e??"")),A={post:{caption:"",file:null,previewUrl:"",mediaType:"",product:null},story:{caption:"",file:null,previewUrl:"",mediaType:"",product:null}},p={status:"idle",items:[],restaurantId:""};let b=null,t=null,m="post",P=!1,h=!1,y=null,ee=!1,te=!1,M=0;function g(){return A[m]||A.post}function re(e=""){const r=String(e||"").trim();if(r.startsWith("blob:"))try{d?.URL?.revokeObjectURL?.(r)}catch{}}function ve(){return`
      <div class="mnyra-bc__sheet">
        <header class="mnyra-bc__head">
          <button type="button" class="mnyra-bc__x" data-bc-close aria-label="${a.close}" title="${a.close}">${S.close}</button>
          <div class="mnyra-bc__title" data-bc-title></div>
          <button type="button" class="mnyra-bc__submit" data-bc-submit disabled>
            <span class="mnyra-bc__spinner"></span><span data-bc-submit-label>${a.submit}</span>
          </button>
        </header>
        <div class="mnyra-bc__body" data-bc-body>
          <div class="mnyra-bc__compose">
            <textarea class="mnyra-bc__text" data-bc-text maxlength="${me}" rows="5" enterkeyhint="done"></textarea>
            <div class="mnyra-bc__tools">
              <button type="button" class="mnyra-bc__tool" data-bc-photo>
                ${S.image}<span class="mnyra-bc__tool-label" data-bc-photo-label>${a.addPhoto}</span>
              </button>
              <button type="button" class="mnyra-bc__tool" data-bc-tag hidden>
                ${S.tag}<span class="mnyra-bc__tool-label" data-bc-tag-label>${a.tagProduct}</span>
              </button>
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
              ${S.image}<span>${a.switchPost}</span>
            </button>
            <button type="button" class="mnyra-bc__switch-btn" role="tab" data-bc-mode="story" aria-selected="false">
              ${S.camera}<span>${a.switchStory}</span>
            </button>
          </div>
        </footer>

        <div class="mnyra-bc__picker" data-bc-picker>
          <div class="mnyra-bc__picker-sheet">
            <div class="mnyra-bc__picker-head">
              <span class="mnyra-bc__picker-title">${a.pickerTitle}</span>
              <button type="button" class="mnyra-bc__x" data-bc-picker-close aria-label="${a.close}" title="${a.close}">${S.close}</button>
            </div>
            <div class="mnyra-bc__picker-search">
              ${S.search}
              <input type="search" data-bc-picker-search placeholder="${a.pickerSearch}" autocomplete="off" />
            </div>
            <div class="mnyra-bc__picker-list" data-bc-picker-list></div>
            <div class="mnyra-bc__picker-foot">
              <p class="mnyra-bc__picker-note">${a.productOptional}</p>
              <button type="button" class="mnyra-bc__picker-confirm" data-bc-picker-confirm disabled>${a.pickerConfirm}</button>
            </div>
          </div>
        </div>
      </div>
      <input type="file" accept="image/*,video/*" data-bc-file hidden />
    `}function xe(){if(b||!c)return b;Ye(c),b=c.createElement("div"),b.id=Ge,b.className="mnyra-bc modal-overlay",b.setAttribute("data-modal-surface",q),b.style.setProperty("--modal-surface",q),b.innerHTML=ve();const e=r=>b.querySelector(r);return t={title:e("[data-bc-title]"),close:e("[data-bc-close]"),submit:e("[data-bc-submit]"),submitLabel:e("[data-bc-submit-label]"),body:e("[data-bc-body]"),text:e("[data-bc-text]"),photo:e("[data-bc-photo]"),photoLabel:e("[data-bc-photo-label]"),tag:e("[data-bc-tag]"),tagLabel:e("[data-bc-tag-label]"),chip:e("[data-bc-chip]"),chipImg:e("[data-bc-chip-img]"),chipName:e("[data-bc-chip-name]"),chipPrice:e("[data-bc-chip-price]"),chipRemove:e("[data-bc-chip-remove]"),hint:e("[data-bc-hint]"),error:e("[data-bc-error]"),panePost:e('[data-bc-pane="post"]'),paneStory:e('[data-bc-pane="story"]'),stagePost:e('[data-bc-stage="post"]'),stagePostInner:e('[data-bc-stage-inner="post"]'),stageStory:e('[data-bc-stage="story"]'),stageStoryInner:e('[data-bc-stage-inner="story"]'),switchButtons:Array.from(b.querySelectorAll("[data-bc-mode]")),picker:e("[data-bc-picker]"),pickerClose:e("[data-bc-picker-close]"),pickerSearch:e("[data-bc-picker-search]"),pickerList:e("[data-bc-picker-list]"),pickerConfirm:e("[data-bc-picker-confirm]"),file:e("[data-bc-file]")},$e(),b}function _e(e,r=""){if(!e)return;const i=String(r||"").trim();i?(e.getAttribute("src")!==i&&e.setAttribute("src",i),e.style.visibility=""):(e.removeAttribute("src"),e.style.visibility="hidden")}function ie(){let e={};try{e=H()||{}}catch{}return{name:String(e.name||"").trim()||a.businessFallback,logoUrl:String(e.logoUrl||"").trim(),city:String(e.city||"").trim()}}function ke(){const e=Number(d?.innerWidth)||be;return Math.min(e,be)}function we(){const e=A.post,r=ie(),i=String(e.previewUrl||"").trim(),s=`<span class="block w-full h-full appearance-none bg-transparent text-left" style="display:block;width:100%;height:100%;padding:0;margin:0;border:0;background:transparent;">${i?e.mediaType==="video"?`<video src="${L(i)}" autoplay muted loop playsinline preload="metadata" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000"></video>`:`<img src="${L(i)}" decoding="async" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`:""}</span>`,f=r.logoUrl?`<img src="${L(r.logoUrl)}" decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />`:"";return Be({business:r.name,location:r.city,content:String(e.caption||"").trim(),likes:0,comments:0,isLive:!1,logoImgHtml:f,heroMediaHtml:s,heroReady:!!i,escapeHtmlFn:D,iconFn:J})}function ae({label:e,mediaHtml:r,logoImgHtml:i,first:o=!1,shellAttrs:s=""}){return Oe({label:e,mediaHtml:r,logoImgHtml:i,shellAttrs:s,shellStyle:Re({withMarginLeft:o}),innerStyle:He(),escapeHtmlFn:D})}function Se(){const e=A.story,r=ie(),i=String(e.previewUrl||"").trim(),o=i?e.mediaType==="video"?`<video src="${L(i)}" autoplay muted loop playsinline preload="metadata" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;"></video>`:`<img src="${L(i)}" decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />`:Ne({iconFn:J}),s=`<img src="${L(r.logoUrl)}" decoding="async" width="28" height="28" class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />`;return ae({label:r.name,mediaHtml:o,logoImgHtml:s,first:!0,shellAttrs:"data-bc-story-own"})}function ne(e=0){const r=fe[e%fe.length];return ae({label:"",mediaHtml:`<div class="absolute inset-0" style="position:absolute;inset:0;background:${r};"></div>`,logoImgHtml:"",shellAttrs:`data-bc-story-blur="${e}" aria-hidden="true"`})}function Pe(){return`
      <div class="mnyra-bc__story-track">
        ${Se()}
        ${ne(0)}
        ${ne(1)}
      </div>
    `}function oe(e,r,i){if(!e||!r)return;const o=e.clientWidth||i;r.style.width=`${i}px`,r.style.height="";let s=Math.min(1,i>0?o/i:1);(!Number.isFinite(s)||s<=0)&&(s=1),r.style.transform=`scale(${s})`;const f=r.scrollHeight;e.style.height=`${Math.round(f*s)}px`,r.style.marginLeft=`${Math.max(0,(o-i*s)/2)}px`}function j(){if(!t||!b?.isConnected)return;const e=ke();if(m==="story"){oe(t.stageStory,t.stageStoryInner,e);return}oe(t.stagePost,t.stagePostInner,e)}function V(){t&&(m==="story"?t.stageStoryInner&&(t.stageStoryInner.innerHTML=Pe()):t.stagePostInner&&(t.stagePostInner.innerHTML=`<div class="app-content-inline py-4">${we()}</div>`),j(),d?.requestAnimationFrame?.(()=>j()))}function Ce(){if(!t||m==="story")return;const e=String(g().caption||"").trim(),r=t.stagePostInner?.querySelector(".feed-card p.line-clamp-2");r&&(r.textContent=e),j()}function ce(){const e=m==="story"?g().product:null,r=e?"1":"0";if(t.chip&&t.chip.setAttribute("data-visible",r),t.tag&&t.tag.setAttribute("data-active",r),t.tagLabel&&(t.tagLabel.textContent=e?e.name:a.tagProduct),!e)return;const i=le(e.price),o=e.imageUrl?Q(e.imageUrl,"thumb"):"";t.chipName&&(t.chipName.textContent=e.name),t.chipPrice&&(t.chipPrice.textContent=i),_e(t.chipImg,o)}function se(){ce(),m==="story"&&V()}function le(e){if(e==null||e==="")return"";let r="";try{r=String(ge(e)||"").trim()}catch{r=""}return r==="-"?"":r}function F(){const e=g(),r=he({caption:e.caption,hasImage:!!e.file,submitting:h});t.submit&&(t.submit.disabled=!r,t.submit.setAttribute("aria-disabled",r?"false":"true")),t.hint&&(h?(t.hint.textContent=a.submitBusy,t.hint.setAttribute("data-tone","busy")):r?(t.hint.textContent=a.hintReady,t.hint.setAttribute("data-tone","ready")):(t.hint.textContent=a.hintNeedBoth,t.hint.setAttribute("data-tone","idle")))}function v(e=""){if(!t.error)return;const r=String(e||"").trim();t.error.textContent=r,t.error.setAttribute("data-visible",r?"1":"0")}function de(){const e=m==="story",r=g();t.title&&(t.title.textContent=e?a.titleStory:a.titlePost),t.text&&(t.text.placeholder=e?a.placeholderStory:a.placeholderPost,t.text.value!==r.caption&&(t.text.value=r.caption)),t.tag&&(t.tag.hidden=!e),t.photoLabel&&(t.photoLabel.textContent=r.file?a.changePhoto:a.addPhoto),t.photo&&t.photo.setAttribute("data-active",r.file?"1":"0"),t.panePost&&t.panePost.setAttribute("data-visible",e?"0":"1"),t.paneStory&&t.paneStory.setAttribute("data-visible",e?"1":"0"),(t.switchButtons||[]).forEach(i=>{const o=i.getAttribute("data-bc-mode")===m;i.setAttribute("aria-selected",o?"true":"false")}),ce(),V(),F(),v("")}function U(e){h=!!e,b&&b.setAttribute("data-busy",h?"1":"0"),t.submitLabel&&(t.submitLabel.textContent=h?a.submitBusy:a.submit),t.close&&(t.close.disabled=h),t.text&&(t.text.readOnly=h),(t.switchButtons||[]).forEach(r=>{r.disabled=h}),F()}function Le(e){if(!e)return;const r=De(e);if(!r){v(a.errorMediaType);return}const i=r==="video";if(Number(e.size||0)>(i?Ke:qe)){v(i?a.errorVideoSize:a.errorImageSize);return}const o=g();re(o.previewUrl),o.file=e,o.mediaType=r,o.previewUrl="";try{o.previewUrl=d?.URL?.createObjectURL?d.URL.createObjectURL(e):""}catch{o.previewUrl=""}v(""),V(),t.photoLabel&&(t.photoLabel.textContent=a.changePhoto),t.photo&&t.photo.setAttribute("data-active","1"),F()}function B({force:e=!1}={}){const r=String(I()||"").trim();if(!r||!K){p.status="error",T();return}p.restaurantId!==r&&(p.restaurantId=r,p.status="idle",p.items=[]),!(!e&&(p.status==="loading"||p.status==="ready"))&&(p.status="loading",T(),(async()=>{try{const i=await K(r);if(p.restaurantId!==r)return;p.items=Array.isArray(i)?i:[],p.status="ready"}catch{if(p.restaurantId!==r)return;p.items=[],p.status="error"}T()})())}function G(e,r=!1){if(!t.pickerList)return;t.pickerList.textContent="";const i=c.createElement("div");if(i.className="mnyra-bc__picker-state",i.textContent=e,r){const o=c.createElement("button");o.type="button",o.textContent=a.pickerRetry,o.addEventListener("click",()=>B({force:!0})),i.appendChild(c.createElement("br")),i.appendChild(o)}t.pickerList.appendChild(i)}function T(){if(!t.pickerList)return;if(p.status==="loading"||p.status==="idle"){G(a.pickerLoading),$();return}if(p.status==="error"){G(a.pickerError,!0),$();return}const e=String(t.pickerSearch?.value||""),r=Qe(p.items,e);if(!r.length){G(a.pickerEmpty),$();return}const i=c.createDocumentFragment();r.forEach(o=>{const s=c.createElement("button");s.type="button",s.className="mnyra-bc__picker-row",s.dataset.bcPickerItem=o.id,y&&y.id===o.id&&s.setAttribute("data-selected","1");const f=c.createElement("img");f.className="mnyra-bc__picker-thumb",f.alt="",f.loading="lazy",f.decoding="async",o.imageUrl&&(f.src=Q(o.imageUrl,"thumb")),s.appendChild(f);const k=c.createElement("div");k.className="mnyra-bc__picker-main";const w=c.createElement("div");w.className="mnyra-bc__picker-name",w.textContent=o.name,k.appendChild(w);const x=c.createElement("div");x.className="mnyra-bc__picker-meta",x.textContent=[o.category,le(o.price)].filter(Boolean).join(" · "),k.appendChild(x),s.appendChild(k);const E=c.createElement("span");E.className="mnyra-bc__picker-mark",E.innerHTML=S.check,s.appendChild(E),i.appendChild(s)}),t.pickerList.textContent="",t.pickerList.appendChild(i),$()}function $(){t.pickerConfirm&&(t.pickerConfirm.disabled=!y)}function Ee(){m!=="story"||h||(y=g().product||null,t.pickerSearch&&(t.pickerSearch.value=""),t.picker&&t.picker.setAttribute("data-visible","1"),B(),T())}function C(){t.picker&&t.picker.setAttribute("data-visible","0"),y=null}function Ie(){return t?.picker?.getAttribute("data-visible")==="1"}function Ae(e=""){if(!c?.body)return;let r=c.getElementById(R);r||(r=c.createElement("div"),r.id=R,r.setAttribute("role","status"),c.body.appendChild(r)),r.textContent=String(e||""),r.setAttribute("data-visible","1"),M&&d?.clearTimeout?.(M),M=d?.setTimeout?.(()=>{r.setAttribute("data-visible","0"),M=0},2600)||0}function pe(){if(!c)return;const e=!!c.querySelector("#overlayRoot .modal-overlay"),r=e?q:Ze;try{c.documentElement.style.setProperty("--active-modal-surface",r),c.documentElement.classList.toggle("modal-open",e),c.body.classList.toggle("modal-open",e);const i=c.getElementById("modalUnderlay");i&&(i.classList.toggle("hidden",!e),i.style.background=r),["safariChromeTintTop","safariChromeTintBottom"].forEach(s=>{const f=c.getElementById(s);f&&(f.style.display=e?"block":"none",f.style.background=r)});const o=c.head?.querySelector('meta[name="theme-color"]');o&&o.setAttribute("content",r)}catch{}}function Te(){ee||!c||(ee=!0,c.addEventListener("keydown",e=>{if(!(e.key!=="Escape"||!P)){if(Ie()){C(),e.preventDefault();return}h||(N(),e.preventDefault())}}))}function $e(){t.close?.addEventListener("click",()=>{h||N()}),t.submit?.addEventListener("click",()=>{je()}),t.text?.addEventListener("input",()=>{const e=g();e.caption=String(t.text.value||""),Ce(),F()}),t.photo?.addEventListener("click",()=>{h||(v(""),t.file?.click())}),t.file?.addEventListener("change",()=>{const e=t.file?.files?.[0]||null;Le(e),t.file&&(t.file.value="")}),(t.switchButtons||[]).forEach(e=>{e.addEventListener("click",()=>{if(h)return;const r=e.getAttribute("data-bc-mode")==="story"?"story":"post";r!==m&&(C(),m=r,de(),t.body&&(t.body.scrollTop=0),m==="story"&&B())})}),t.tag?.addEventListener("click",()=>Ee()),t.chipRemove?.addEventListener("click",()=>{h||(g().product=null,se())}),t.pickerClose?.addEventListener("click",()=>C()),t.picker?.addEventListener("click",e=>{e.target===t.picker&&C()}),t.pickerSearch?.addEventListener("input",()=>T()),t.pickerList?.addEventListener("click",e=>{const r=e.target?.closest?.("[data-bc-picker-item]");if(!r)return;const i=String(r.dataset.bcPickerItem||"").trim(),o=p.items.find(s=>s.id===i)||null;y=y&&y.id===i?null:o,Array.from(t.pickerList.querySelectorAll("[data-bc-picker-item]")).forEach(s=>{s.setAttribute("data-selected",y&&s.dataset.bcPickerItem===y.id?"1":"0")}),$()}),t.pickerConfirm?.addEventListener("click",()=>{y&&(g().product=y,C(),se())})}function ze(e){const r=A[e];r&&(re(r.previewUrl),r.caption="",r.file=null,r.previewUrl="",r.mediaType="",r.product=null)}async function Me(e,r){if(!X||!z)return"";try{const i=await X(e);if(!i)return"";const o=await z(i,r);return String(o?.cdnUrl||o?.url||"").trim()}catch{return""}}async function je(){if(h)return;const e=g();if(!he({caption:e.caption,hasImage:!!e.file,submitting:h}))return;const r=String(I()||"").trim();if(!r){v(a.errorNoBusiness);return}if(d&&d.navigator&&d.navigator.onLine===!1){v(a.errorOffline);return}const i=e.mediaType==="video"?"video":"image";if(!(i==="video"?Z:z)||(m==="story"?!W:!Y)){v(a.errorGeneric);return}const s=m,f=String(e.caption||"").trim().slice(0,me),k=e.file;U(!0),v("");try{const w=i==="video"?await Z(k,r):await z(k,r),x=String(w?.cdnUrl||w?.url||"").trim();if(!x)throw new Error(a.errorGeneric);const E=i==="video"?await Me(k,r):"";if(s==="story"){const O=e.product;await W({restaurantId:r,caption:f,mediaUrl:x,mediaType:i,posterUrl:E,menuItemId:O?.id||"",menuItemName:O?.name||"",menuItemPrice:O?.price??"",menuItemImage:O?.imageUrl||""})}else await Y({restaurantId:r,caption:f,mediaUrl:x,mediaType:i,posterUrl:E});U(!1),N(),ze(s),Ae(s==="story"?a.successStory:a.successPost);try{await ye(s)}catch{}}catch(w){U(!1);const x=String(w?.message||"").trim();v(x||a.errorGeneric)}}function Fe(e="post"){if(!c)return;const r=String(e||"").trim().toLowerCase()==="story"?"story":"post";if(xe(),!!b){if(Te(),m=r,C(),U(!1),!P){const i=We(c);i&&b.parentNode!==i&&i.appendChild(b),P=!0}de(),Ue(),t.body&&(t.body.scrollTop=0),pe(),m==="story"&&B()}}function Ue(){if(te||!d?.addEventListener)return;te=!0;const e=()=>{P&&j()};d.addEventListener("resize",e,{passive:!0}),d.addEventListener("orientationchange",e,{passive:!0})}function N(){if(P){P=!1,C();try{b?.remove()}catch{}pe()}}return Object.freeze({open:Fe,close:N,isOpen:()=>P})}export{Xe as BUSINESS_COMPOSER_CSS,he as canPublishComposerDraftCore,nt as createBusinessComposerController,Qe as filterComposerProductsCore,at as normalizeComposerProductCore};
