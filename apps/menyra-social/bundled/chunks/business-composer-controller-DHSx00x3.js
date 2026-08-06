import{au as Me,av as je,aw as Fe,ax as Ne,ay as Ue}from"./domain-feed-social-eager-CAMxL9w6.js";import"./domain-auth-Aq-4Vdvh.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-media-eager-B3Bb4ghO.js";import"./domain-menu-eager-Ca3mC5Kt.js";const se="mnyraBusinessComposerStyles",le=448,Be=10,de=Object.freeze(["linear-gradient(150deg,#94a3b8 0%,#475569 55%,#1e293b 100%)","linear-gradient(150deg,#a5b4fc 0%,#6366f1 55%,#312e81 100%)"]),Oe="businessComposerOverlayRoot",Re=15*1024*1024,pe=600,F="mnyraBusinessComposerToast",He="#f8fafc",G="#ffffff",i=Object.freeze({titlePost:"Postim i ri",titleStory:"Story e re",submit:"Posto",submitBusy:"Duke postuar…",close:"Mbyll",placeholderPost:"Shkruaj diçka për postimin tënd…",placeholderStory:"Shkruaj diçka për story-n tënde…",addPhoto:"Shto foto",changePhoto:"Ndrysho foton",tagProduct:"Etiketo produkt",removeProduct:"Hiq produktin",productOptional:"Produkti nuk është i detyrueshëm.",hintNeedBoth:"Që të postosh, duhen edhe teksti edhe fotoja.",hintReady:"Gati për t'u postuar.",previewTitle:"Parapamje",previewPost:"Si duket në Zbulo",previewStory:"Në rreshtin e story-ve",previewEmpty:"Zgjidh një foto për ta parë parapamjen.",pickerTitle:"Zgjidh një produkt",pickerSearch:"Kërko ushqime ose pije…",pickerConfirm:"Zgjidh produktin",pickerEmpty:"Nuk u gjet asnjë produkt.",pickerLoading:"Duke ngarkuar produktet…",pickerError:"Produktet nuk u ngarkuan.",pickerRetry:"Provo përsëri",errorImageType:"Lejohet vetëm foto (JPG, PNG ose WEBP).",errorImageSize:"Fotoja duhet të jetë deri në 15MB.",errorNoBusiness:"Kjo llogari nuk është e lidhur me një biznes.",errorGeneric:"Postimi dështoi. Provo përsëri.",errorOffline:"Nuk ka lidhje me internetin. Provo përsëri.",successPost:"Postimi u publikua.",successStory:"Story u publikua.",captionFallback:"Pa tekst",businessFallback:"Biznesi im"}),_='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"',P=Object.freeze({close:`<svg ${_}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,image:`<svg ${_}><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`,tag:`<svg ${_}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>`,plus:`<svg ${_}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`,camera:`<svg ${_}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,check:`<svg ${_}><path d="M20 6 9 17l-5-5"></path></svg>`,search:`<svg ${_}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,heart:`<svg ${_}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`,comment:`<svg ${_}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>`}),De=`
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
  gap: ${Be}px;
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
.mnyra-bc[data-busy="1"] .mnyra-bc__x { opacity: 0.55; pointer-events: none; }
#${F} {
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
#${F}[data-visible="1"] { opacity: 1; }
@media (min-width: 640px) {
  .mnyra-bc__sheet { max-width: 560px; margin: 0 auto; }
  .mnyra-bc__picker { padding-bottom: 24px; }
  .mnyra-bc__picker-sheet { max-width: 520px; margin: 0 auto; }
}
`;function Ge(u){if(!(!u||u.getElementById(se)))try{const l=u.createElement("style");l.id=se,l.textContent=De,u.head?.appendChild(l)}catch{}}function qe(u){if(!u?.body)return null;let l=u.getElementById("overlayRoot");return l||(l=u.createElement("div"),l.id="overlayRoot",l.style.position="relative",l.style.zIndex="200",l.style.isolation="isolate",u.body.appendChild(l)),l}function Je(u="",l={}){const a=l&&typeof l=="object"?l:{},o=String(u||"").trim();if(!o)return null;const d=a.imageUrl||a.image||(Array.isArray(a.images)?a.images[0]:"")||"",C=String(a.type||a.menuType||"").trim().toLowerCase(),N=["drink","drinks","beverage","getraenke","getränke"].includes(C)?"drink":"food";return{id:o,name:String(a.name||a.title||"").trim()||o,price:a.price??"",category:String(a.category||"").trim(),type:N,imageUrl:typeof d=="string"?d.trim():""}}function Ke(u=[],l=""){const a=Array.isArray(u)?u:[],o=String(l||"").trim().toLowerCase();return o?a.filter(d=>`${d?.name||""} ${d?.category||""}`.toLowerCase().includes(o)):a}function be({caption:u="",hasImage:l=!1,submitting:a=!1}={}){return a||!l?!1:String(u||"").trim().length>0}function Qe({documentObj:u=null,windowObj:l=null,api:a={}}={}){const o=u||(typeof document>"u"?null:document),d=l||o?.defaultView||(typeof window>"u"?null:window),C=typeof a.getRestaurantIdFn=="function"?a.getRestaurantIdFn:(()=>""),N=typeof a.getBusinessMetaFn=="function"?a.getBusinessMetaFn:(()=>({name:"",logoUrl:""})),q=typeof a.loadProductsFn=="function"?a.loadProductsFn:null,K=typeof a.uploadImageFn=="function"?a.uploadImageFn:null,Z=typeof a.createPostFn=="function"?a.createPostFn:null,V=typeof a.createStoryFn=="function"?a.createStoryFn:null,ue=typeof a.afterPublishFn=="function"?a.afterPublishFn:(()=>{}),fe=typeof a.formatPriceFn=="function"?a.formatPriceFn:(e=>String(e??"")),X=typeof a.getOptimizedImageUrlFn=="function"?a.getOptimizedImageUrlFn:(e=>String(e||"").trim()),U=typeof a.escapeHtmlFn=="function"?a.escapeHtmlFn:(e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")),W=typeof a.iconFn=="function"?a.iconFn:(()=>""),A=(e="")=>U(String(e??"")),L={post:{caption:"",file:null,previewUrl:"",product:null},story:{caption:"",file:null,previewUrl:"",product:null}},p={status:"idle",items:[],restaurantId:""};let f=null,t=null,h="post",w=!1,m=!1,y=null,Y=!1,J=!1,T=0;function g(){return L[h]||L.post}function Q(e=""){const r=String(e||"").trim();if(r.startsWith("blob:"))try{d?.URL?.revokeObjectURL?.(r)}catch{}}function me(){return`
      <div class="mnyra-bc__sheet">
        <header class="mnyra-bc__head">
          <button type="button" class="mnyra-bc__x" data-bc-close aria-label="${i.close}" title="${i.close}">${P.close}</button>
          <div class="mnyra-bc__title" data-bc-title></div>
          <button type="button" class="mnyra-bc__submit" data-bc-submit disabled>
            <span class="mnyra-bc__spinner"></span><span data-bc-submit-label>${i.submit}</span>
          </button>
        </header>
        <div class="mnyra-bc__body" data-bc-body>
          <div class="mnyra-bc__compose">
            <textarea class="mnyra-bc__text" data-bc-text maxlength="${pe}" rows="5" enterkeyhint="done"></textarea>
            <div class="mnyra-bc__tools">
              <button type="button" class="mnyra-bc__tool" data-bc-photo>
                ${P.image}<span class="mnyra-bc__tool-label" data-bc-photo-label>${i.addPhoto}</span>
              </button>
              <button type="button" class="mnyra-bc__tool" data-bc-tag hidden>
                ${P.tag}<span class="mnyra-bc__tool-label" data-bc-tag-label>${i.tagProduct}</span>
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
              <div class="mnyra-bc__stage mnyra-bc__stage--bleed" data-bc-stage="post">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="post"></div>
              </div>
            </div>

            <div class="mnyra-bc__pane" data-bc-pane="story">
              <p class="mnyra-bc__preview-caption">${i.previewStory}</p>
              <div class="mnyra-bc__stage mnyra-bc__stage--bleed" data-bc-stage="story">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="story"></div>
              </div>
            </div>
          </section>
        </div>

        <div class="mnyra-bc__picker" data-bc-picker>
          <div class="mnyra-bc__picker-sheet">
            <div class="mnyra-bc__picker-head">
              <span class="mnyra-bc__picker-title">${i.pickerTitle}</span>
              <button type="button" class="mnyra-bc__x" data-bc-picker-close aria-label="${i.close}" title="${i.close}">${P.close}</button>
            </div>
            <div class="mnyra-bc__picker-search">
              ${P.search}
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
    `}function he(){if(f||!o)return f;Ge(o),f=o.createElement("div"),f.id=Oe,f.className="mnyra-bc modal-overlay",f.setAttribute("data-modal-surface",G),f.style.setProperty("--modal-surface",G),f.innerHTML=me();const e=r=>f.querySelector(r);return t={title:e("[data-bc-title]"),close:e("[data-bc-close]"),submit:e("[data-bc-submit]"),submitLabel:e("[data-bc-submit-label]"),body:e("[data-bc-body]"),text:e("[data-bc-text]"),photo:e("[data-bc-photo]"),photoLabel:e("[data-bc-photo-label]"),tag:e("[data-bc-tag]"),tagLabel:e("[data-bc-tag-label]"),chip:e("[data-bc-chip]"),chipImg:e("[data-bc-chip-img]"),chipName:e("[data-bc-chip-name]"),chipPrice:e("[data-bc-chip-price]"),chipRemove:e("[data-bc-chip-remove]"),hint:e("[data-bc-hint]"),error:e("[data-bc-error]"),panePost:e('[data-bc-pane="post"]'),paneStory:e('[data-bc-pane="story"]'),stagePost:e('[data-bc-stage="post"]'),stagePostInner:e('[data-bc-stage-inner="post"]'),stageStory:e('[data-bc-stage="story"]'),stageStoryInner:e('[data-bc-stage-inner="story"]'),picker:e("[data-bc-picker]"),pickerClose:e("[data-bc-picker-close]"),pickerSearch:e("[data-bc-picker-search]"),pickerList:e("[data-bc-picker-list]"),pickerConfirm:e("[data-bc-picker-confirm]"),file:e("[data-bc-file]")},Ie(),f}function ye(e,r=""){if(!e)return;const n=String(r||"").trim();n?(e.getAttribute("src")!==n&&e.setAttribute("src",n),e.style.visibility=""):(e.removeAttribute("src"),e.style.visibility="hidden")}function ee(){let e={};try{e=N()||{}}catch{}return{name:String(e.name||"").trim()||i.businessFallback,logoUrl:String(e.logoUrl||"").trim(),city:String(e.city||"").trim()}}function ge(){const e=Number(d?.innerWidth)||le;return Math.min(e,le)}function xe(){const e=L.post,r=ee(),n=String(e.previewUrl||"").trim(),s=`<span class="block w-full h-full appearance-none bg-transparent text-left" style="display:block;width:100%;height:100%;padding:0;margin:0;border:0;background:transparent;">${n?`<img src="${A(n)}" decoding="async" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`:""}</span>`,b=r.logoUrl?`<img src="${A(r.logoUrl)}" decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />`:"";return Me({business:r.name,location:r.city,content:String(e.caption||"").trim(),likes:0,comments:0,isLive:!1,logoImgHtml:b,heroMediaHtml:s,heroReady:!!n,escapeHtmlFn:U,iconFn:W})}function te({label:e,mediaHtml:r,logoImgHtml:n,first:c=!1,shellAttrs:s=""}){return Fe({label:e,mediaHtml:r,logoImgHtml:n,shellAttrs:s,shellStyle:Ne({withMarginLeft:c}),innerStyle:Ue(),escapeHtmlFn:U})}function ve(){const e=L.story,r=ee(),n=String(e.previewUrl||"").trim(),c=n?`<img src="${A(n)}" decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />`:je({iconFn:W}),s=`<img src="${A(r.logoUrl)}" decoding="async" width="28" height="28" class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />`;return te({label:r.name,mediaHtml:c,logoImgHtml:s,first:!0,shellAttrs:"data-bc-story-own"})}function re(e=0){const r=de[e%de.length];return te({label:"",mediaHtml:`<div class="absolute inset-0" style="position:absolute;inset:0;background:${r};"></div>`,logoImgHtml:"",shellAttrs:`data-bc-story-blur="${e}" aria-hidden="true"`})}function _e(){return`
      <div class="mnyra-bc__story-track">
        ${ve()}
        ${re(0)}
        ${re(1)}
      </div>
    `}function ne(e,r,n){if(!e||!r)return;const c=e.clientWidth||n;r.style.width=`${n}px`,r.style.height="";let s=Math.min(1,n>0?c/n:1);(!Number.isFinite(s)||s<=0)&&(s=1),r.style.transform=`scale(${s})`;const b=r.scrollHeight;e.style.height=`${Math.round(b*s)}px`,r.style.marginLeft=`${Math.max(0,(c-n*s)/2)}px`}function z(){if(!t||!f?.isConnected)return;const e=ge();if(h==="story"){ne(t.stageStory,t.stageStoryInner,e);return}ne(t.stagePost,t.stagePostInner,e)}function B(){t&&(h==="story"?t.stageStoryInner&&(t.stageStoryInner.innerHTML=_e()):t.stagePostInner&&(t.stagePostInner.innerHTML=`<div class="app-content-inline py-4">${xe()}</div>`),z(),d?.requestAnimationFrame?.(()=>z()))}function ke(){if(!t||h==="story")return;const e=String(g().caption||"").trim(),r=t.stagePostInner?.querySelector(".feed-card p.line-clamp-2");r&&(r.textContent=e),z()}function ie(){const e=h==="story"?g().product:null,r=e?"1":"0";if(t.chip&&t.chip.setAttribute("data-visible",r),t.tag&&t.tag.setAttribute("data-active",r),t.tagLabel&&(t.tagLabel.textContent=e?e.name:i.tagProduct),!e)return;const n=oe(e.price),c=e.imageUrl?X(e.imageUrl,"thumb"):"";t.chipName&&(t.chipName.textContent=e.name),t.chipPrice&&(t.chipPrice.textContent=n),ye(t.chipImg,c)}function ae(){ie(),h==="story"&&B()}function oe(e){if(e==null||e==="")return"";let r="";try{r=String(fe(e)||"").trim()}catch{r=""}return r==="-"?"":r}function $(){const e=g(),r=be({caption:e.caption,hasImage:!!e.file,submitting:m});t.submit&&(t.submit.disabled=!r,t.submit.setAttribute("aria-disabled",r?"false":"true")),t.hint&&(m?(t.hint.textContent=i.submitBusy,t.hint.setAttribute("data-tone","busy")):r?(t.hint.textContent=i.hintReady,t.hint.setAttribute("data-tone","ready")):(t.hint.textContent=i.hintNeedBoth,t.hint.setAttribute("data-tone","idle")))}function x(e=""){if(!t.error)return;const r=String(e||"").trim();t.error.textContent=r,t.error.setAttribute("data-visible",r?"1":"0")}function we(){const e=h==="story",r=g();t.title&&(t.title.textContent=e?i.titleStory:i.titlePost),t.text&&(t.text.placeholder=e?i.placeholderStory:i.placeholderPost,t.text.value!==r.caption&&(t.text.value=r.caption)),t.tag&&(t.tag.hidden=!e),t.photoLabel&&(t.photoLabel.textContent=r.file?i.changePhoto:i.addPhoto),t.photo&&t.photo.setAttribute("data-active",r.file?"1":"0"),t.panePost&&t.panePost.setAttribute("data-visible",e?"0":"1"),t.paneStory&&t.paneStory.setAttribute("data-visible",e?"1":"0"),ie(),B(),$(),x("")}function M(e){m=!!e,f&&f.setAttribute("data-busy",m?"1":"0"),t.submitLabel&&(t.submitLabel.textContent=m?i.submitBusy:i.submit),t.close&&(t.close.disabled=m),t.text&&(t.text.readOnly=m),$()}function Se(e){if(!e)return;if(!String(e.type||"").toLowerCase().startsWith("image/")){x(i.errorImageType);return}if(Number(e.size||0)>Re){x(i.errorImageSize);return}const n=g();Q(n.previewUrl),n.file=e,n.previewUrl="";try{n.previewUrl=d?.URL?.createObjectURL?d.URL.createObjectURL(e):""}catch{n.previewUrl=""}x(""),B(),t.photoLabel&&(t.photoLabel.textContent=i.changePhoto),t.photo&&t.photo.setAttribute("data-active","1"),$()}function O({force:e=!1}={}){const r=String(C()||"").trim();if(!r||!q){p.status="error",E();return}p.restaurantId!==r&&(p.restaurantId=r,p.status="idle",p.items=[]),!(!e&&(p.status==="loading"||p.status==="ready"))&&(p.status="loading",E(),(async()=>{try{const n=await q(r);if(p.restaurantId!==r)return;p.items=Array.isArray(n)?n:[],p.status="ready"}catch{if(p.restaurantId!==r)return;p.items=[],p.status="error"}E()})())}function R(e,r=!1){if(!t.pickerList)return;t.pickerList.textContent="";const n=o.createElement("div");if(n.className="mnyra-bc__picker-state",n.textContent=e,r){const c=o.createElement("button");c.type="button",c.textContent=i.pickerRetry,c.addEventListener("click",()=>O({force:!0})),n.appendChild(o.createElement("br")),n.appendChild(c)}t.pickerList.appendChild(n)}function E(){if(!t.pickerList)return;if(p.status==="loading"||p.status==="idle"){R(i.pickerLoading),I();return}if(p.status==="error"){R(i.pickerError,!0),I();return}const e=String(t.pickerSearch?.value||""),r=Ke(p.items,e);if(!r.length){R(i.pickerEmpty),I();return}const n=o.createDocumentFragment();r.forEach(c=>{const s=o.createElement("button");s.type="button",s.className="mnyra-bc__picker-row",s.dataset.bcPickerItem=c.id,y&&y.id===c.id&&s.setAttribute("data-selected","1");const b=o.createElement("img");b.className="mnyra-bc__picker-thumb",b.alt="",b.loading="lazy",b.decoding="async",c.imageUrl&&(b.src=X(c.imageUrl,"thumb")),s.appendChild(b);const v=o.createElement("div");v.className="mnyra-bc__picker-main";const k=o.createElement("div");k.className="mnyra-bc__picker-name",k.textContent=c.name,v.appendChild(k);const H=o.createElement("div");H.className="mnyra-bc__picker-meta",H.textContent=[c.category,oe(c.price)].filter(Boolean).join(" · "),v.appendChild(H),s.appendChild(v);const D=o.createElement("span");D.className="mnyra-bc__picker-mark",D.innerHTML=P.check,s.appendChild(D),n.appendChild(s)}),t.pickerList.textContent="",t.pickerList.appendChild(n),I()}function I(){t.pickerConfirm&&(t.pickerConfirm.disabled=!y)}function Pe(){h!=="story"||m||(y=g().product||null,t.pickerSearch&&(t.pickerSearch.value=""),t.picker&&t.picker.setAttribute("data-visible","1"),O(),E())}function S(){t.picker&&t.picker.setAttribute("data-visible","0"),y=null}function Ce(){return t?.picker?.getAttribute("data-visible")==="1"}function Le(e=""){if(!o?.body)return;let r=o.getElementById(F);r||(r=o.createElement("div"),r.id=F,r.setAttribute("role","status"),o.body.appendChild(r)),r.textContent=String(e||""),r.setAttribute("data-visible","1"),T&&d?.clearTimeout?.(T),T=d?.setTimeout?.(()=>{r.setAttribute("data-visible","0"),T=0},2600)||0}function ce(){if(!o)return;const e=!!o.querySelector("#overlayRoot .modal-overlay"),r=e?G:He;try{o.documentElement.style.setProperty("--active-modal-surface",r),o.documentElement.classList.toggle("modal-open",e),o.body.classList.toggle("modal-open",e);const n=o.getElementById("modalUnderlay");n&&(n.classList.toggle("hidden",!e),n.style.background=r),["safariChromeTintTop","safariChromeTintBottom"].forEach(s=>{const b=o.getElementById(s);b&&(b.style.display=e?"block":"none",b.style.background=r)});const c=o.head?.querySelector('meta[name="theme-color"]');c&&c.setAttribute("content",r)}catch{}}function Ee(){Y||!o||(Y=!0,o.addEventListener("keydown",e=>{if(!(e.key!=="Escape"||!w)){if(Ce()){S(),e.preventDefault();return}m||(j(),e.preventDefault())}}))}function Ie(){t.close?.addEventListener("click",()=>{m||j()}),t.submit?.addEventListener("click",()=>{Te()}),t.text?.addEventListener("input",()=>{const e=g();e.caption=String(t.text.value||""),ke(),$()}),t.photo?.addEventListener("click",()=>{m||(x(""),t.file?.click())}),t.file?.addEventListener("change",()=>{const e=t.file?.files?.[0]||null;Se(e),t.file&&(t.file.value="")}),t.tag?.addEventListener("click",()=>Pe()),t.chipRemove?.addEventListener("click",()=>{m||(g().product=null,ae())}),t.pickerClose?.addEventListener("click",()=>S()),t.picker?.addEventListener("click",e=>{e.target===t.picker&&S()}),t.pickerSearch?.addEventListener("input",()=>E()),t.pickerList?.addEventListener("click",e=>{const r=e.target?.closest?.("[data-bc-picker-item]");if(!r)return;const n=String(r.dataset.bcPickerItem||"").trim(),c=p.items.find(s=>s.id===n)||null;y=y&&y.id===n?null:c,Array.from(t.pickerList.querySelectorAll("[data-bc-picker-item]")).forEach(s=>{s.setAttribute("data-selected",y&&s.dataset.bcPickerItem===y.id?"1":"0")}),I()}),t.pickerConfirm?.addEventListener("click",()=>{y&&(g().product=y,S(),ae())})}function Ae(e){const r=L[e];r&&(Q(r.previewUrl),r.caption="",r.file=null,r.previewUrl="",r.product=null)}async function Te(){if(m)return;const e=g();if(!be({caption:e.caption,hasImage:!!e.file,submitting:m}))return;const r=String(C()||"").trim();if(!r){x(i.errorNoBusiness);return}if(d&&d.navigator&&d.navigator.onLine===!1){x(i.errorOffline);return}if(!K||(h==="story"?!V:!Z)){x(i.errorGeneric);return}const n=h,c=String(e.caption||"").trim().slice(0,pe),s=e.file;M(!0),x("");try{const b=await K(s,r),v=String(b?.cdnUrl||b?.url||"").trim();if(!v)throw new Error(i.errorGeneric);if(n==="story"){const k=e.product;await V({restaurantId:r,caption:c,mediaUrl:v,mediaType:"image",menuItemId:k?.id||"",menuItemName:k?.name||"",menuItemPrice:k?.price??"",menuItemImage:k?.imageUrl||""})}else await Z({restaurantId:r,caption:c,mediaUrl:v,mediaType:"image"});M(!1),j(),Ae(n),Le(n==="story"?i.successStory:i.successPost);try{await ue(n)}catch{}}catch(b){M(!1);const v=String(b?.message||"").trim();x(v||i.errorGeneric)}}function ze(e="post"){if(!o)return;const r=String(e||"").trim().toLowerCase()==="story"?"story":"post";if(he(),!!f){if(Ee(),h=r,S(),M(!1),!w){const n=qe(o);n&&f.parentNode!==n&&n.appendChild(f),w=!0}we(),$e(),t.body&&(t.body.scrollTop=0),ce(),h==="story"&&O()}}function $e(){if(J||!d?.addEventListener)return;J=!0;const e=()=>{w&&z()};d.addEventListener("resize",e,{passive:!0}),d.addEventListener("orientationchange",e,{passive:!0})}function j(){if(w){w=!1,S();try{f?.remove()}catch{}ce()}}return Object.freeze({open:ze,close:j,isOpen:()=>w})}export{De as BUSINESS_COMPOSER_CSS,be as canPublishComposerDraftCore,Qe as createBusinessComposerController,Ke as filterComposerProductsCore,Je as normalizeComposerProductCore};
