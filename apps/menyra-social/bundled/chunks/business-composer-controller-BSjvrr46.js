import{au as Ae,av as Re,aw as Me,ax as Ne}from"./domain-feed-social-eager-D4CES9yO.js";import{S as Ue,b as ze}from"./domain-stories-L5z6TIba.js";import"./domain-auth-Aq-4Vdvh.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-media-eager-B3Bb4ghO.js";import"./domain-menu-eager-QoBEIbVZ.js";const se="mnyraBusinessComposerStyles",le=448,Fe=.29,je=120,Oe=208,Be=440,He="businessComposerOverlayRoot",De=15*1024*1024,de=600,j="mnyraBusinessComposerToast",Ge="#f8fafc",Z="#ffffff",i=Object.freeze({titlePost:"Postim i ri",titleStory:"Story e re",submit:"Posto",submitBusy:"Duke postuar…",close:"Mbyll",placeholderPost:"Shkruaj diçka për postimin tënd…",placeholderStory:"Shkruaj diçka për story-n tënde…",addPhoto:"Shto foto",changePhoto:"Ndrysho foton",tagProduct:"Etiketo produkt",removeProduct:"Hiq produktin",productOptional:"Produkti nuk është i detyrueshëm.",hintNeedBoth:"Që të postosh, duhen edhe teksti edhe fotoja.",hintReady:"Gati për t'u postuar.",previewTitle:"Parapamje",previewPost:"Si duket në Zbulo",previewStoryTile:"Në Zbulo",previewStoryFull:"Kur hapet story-a",previewEmpty:"Zgjidh një foto për ta parë parapamjen.",productMore:"Mehr",pickerTitle:"Zgjidh një produkt",pickerSearch:"Kërko ushqime ose pije…",pickerConfirm:"Zgjidh produktin",pickerEmpty:"Nuk u gjet asnjë produkt.",pickerLoading:"Duke ngarkuar produktet…",pickerError:"Produktet nuk u ngarkuan.",pickerRetry:"Provo përsëri",errorImageType:"Lejohet vetëm foto (JPG, PNG ose WEBP).",errorImageSize:"Fotoja duhet të jetë deri në 15MB.",errorNoBusiness:"Kjo llogari nuk është e lidhur me një biznes.",errorGeneric:"Postimi dështoi. Provo përsëri.",errorOffline:"Nuk ka lidhje me internetin. Provo përsëri.",successPost:"Postimi u publikua.",successStory:"Story u publikua.",captionFallback:"Pa tekst",businessFallback:"Biznesi im"}),k='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"',E=Object.freeze({close:`<svg ${k}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,image:`<svg ${k}><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`,tag:`<svg ${k}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>`,plus:`<svg ${k}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`,camera:`<svg ${k}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,check:`<svg ${k}><path d="M20 6 9 17l-5-5"></path></svg>`,search:`<svg ${k}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,heart:`<svg ${k}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`,comment:`<svg ${k}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>`}),qe=`
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
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 14px;
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
`;function We(m){if(!(!m||m.getElementById(se)))try{const d=m.createElement("style");d.id=se,d.textContent=`${Ue}
${qe}`,m.head?.appendChild(d)}catch{}}function Ve(m){if(!m?.body)return null;let d=m.getElementById("overlayRoot");return d||(d=m.createElement("div"),d.id="overlayRoot",d.style.position="relative",d.style.zIndex="200",d.style.isolation="isolate",m.body.appendChild(d)),d}function tt(m="",d={}){const o=d&&typeof d=="object"?d:{},c=String(m||"").trim();if(!c)return null;const p=o.imageUrl||o.image||(Array.isArray(o.images)?o.images[0]:"")||"",L=String(o.type||o.menuType||"").trim().toLowerCase(),O=["drink","drinks","beverage","getraenke","getränke"].includes(L)?"drink":"food";return{id:c,name:String(o.name||o.title||"").trim()||c,price:o.price??"",category:String(o.category||"").trim(),type:O,imageUrl:typeof p=="string"?p.trim():""}}function Ze(m=[],d=""){const o=Array.isArray(m)?m:[],c=String(d||"").trim().toLowerCase();return c?o.filter(p=>`${p?.name||""} ${p?.category||""}`.toLowerCase().includes(c)):o}function pe({caption:m="",hasImage:d=!1,submitting:o=!1}={}){return o||!d?!1:String(m||"").trim().length>0}function rt({documentObj:m=null,windowObj:d=null,api:o={}}={}){const c=m||(typeof document>"u"?null:document),p=d||c?.defaultView||(typeof window>"u"?null:window),L=typeof o.getRestaurantIdFn=="function"?o.getRestaurantIdFn:(()=>""),O=typeof o.getBusinessMetaFn=="function"?o.getBusinessMetaFn:(()=>({name:"",logoUrl:""})),Y=typeof o.loadProductsFn=="function"?o.loadProductsFn:null,X=typeof o.uploadImageFn=="function"?o.uploadImageFn:null,K=typeof o.createPostFn=="function"?o.createPostFn:null,J=typeof o.createStoryFn=="function"?o.createStoryFn:null,ue=typeof o.afterPublishFn=="function"?o.afterPublishFn:(()=>{}),be=typeof o.formatPriceFn=="function"?o.formatPriceFn:(e=>String(e??"")),B=typeof o.getOptimizedImageUrlFn=="function"?o.getOptimizedImageUrlFn:(e=>String(e||"").trim()),w=typeof o.escapeHtmlFn=="function"?o.escapeHtmlFn:(e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")),Q=typeof o.iconFn=="function"?o.iconFn:(()=>""),C=(e="")=>w(String(e??"")),P={post:{caption:"",file:null,previewUrl:"",product:null},story:{caption:"",file:null,previewUrl:"",product:null}},b={status:"idle",items:[],restaurantId:""};let f=null,t=null,y="post",S=!1,h=!1,v=null,ee=!1,te=!1,R=0;function _(){return P[y]||P.post}function re(e=""){const r=String(e||"").trim();if(r.startsWith("blob:"))try{p?.URL?.revokeObjectURL?.(r)}catch{}}function me(){return`
      <div class="mnyra-bc__sheet">
        <header class="mnyra-bc__head">
          <button type="button" class="mnyra-bc__x" data-bc-close aria-label="${i.close}" title="${i.close}">${E.close}</button>
          <div class="mnyra-bc__title" data-bc-title></div>
          <button type="button" class="mnyra-bc__submit" data-bc-submit disabled>
            <span class="mnyra-bc__spinner"></span><span data-bc-submit-label>${i.submit}</span>
          </button>
        </header>
        <div class="mnyra-bc__body" data-bc-body>
          <div class="mnyra-bc__compose">
            <textarea class="mnyra-bc__text" data-bc-text maxlength="${de}" rows="5" enterkeyhint="done"></textarea>
            <div class="mnyra-bc__tools">
              <button type="button" class="mnyra-bc__tool" data-bc-photo>
                ${E.image}<span class="mnyra-bc__tool-label" data-bc-photo-label>${i.addPhoto}</span>
              </button>
              <button type="button" class="mnyra-bc__tool" data-bc-tag hidden>
                ${E.tag}<span class="mnyra-bc__tool-label" data-bc-tag-label>${i.tagProduct}</span>
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
              <div class="mnyra-bc__story-grid">
                <div class="mnyra-bc__story-col">
                  <p class="mnyra-bc__preview-caption">${i.previewStoryTile}</p>
                  <div class="mnyra-bc__stage" data-bc-stage="tile">
                    <div class="mnyra-bc__stage-inner" data-bc-stage-inner="tile"></div>
                  </div>
                </div>
                <div class="mnyra-bc__story-col">
                  <p class="mnyra-bc__preview-caption">${i.previewStoryFull}</p>
                  <div class="mnyra-bc__stage" data-bc-stage="reel">
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
              <span class="mnyra-bc__picker-title">${i.pickerTitle}</span>
              <button type="button" class="mnyra-bc__x" data-bc-picker-close aria-label="${i.close}" title="${i.close}">${E.close}</button>
            </div>
            <div class="mnyra-bc__picker-search">
              ${E.search}
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
    `}function fe(){if(f||!c)return f;We(c),f=c.createElement("div"),f.id=He,f.className="mnyra-bc modal-overlay",f.setAttribute("data-modal-surface",Z),f.style.setProperty("--modal-surface",Z),f.innerHTML=me();const e=r=>f.querySelector(r);return t={title:e("[data-bc-title]"),close:e("[data-bc-close]"),submit:e("[data-bc-submit]"),submitLabel:e("[data-bc-submit-label]"),body:e("[data-bc-body]"),text:e("[data-bc-text]"),photo:e("[data-bc-photo]"),photoLabel:e("[data-bc-photo-label]"),tag:e("[data-bc-tag]"),tagLabel:e("[data-bc-tag-label]"),chip:e("[data-bc-chip]"),chipImg:e("[data-bc-chip-img]"),chipName:e("[data-bc-chip-name]"),chipPrice:e("[data-bc-chip-price]"),chipRemove:e("[data-bc-chip-remove]"),hint:e("[data-bc-hint]"),error:e("[data-bc-error]"),panePost:e('[data-bc-pane="post"]'),paneStory:e('[data-bc-pane="story"]'),stagePost:e('[data-bc-stage="post"]'),stagePostInner:e('[data-bc-stage-inner="post"]'),stageTile:e('[data-bc-stage="tile"]'),stageTileInner:e('[data-bc-stage-inner="tile"]'),stageReel:e('[data-bc-stage="reel"]'),stageReelInner:e('[data-bc-stage-inner="reel"]'),picker:e("[data-bc-picker]"),pickerClose:e("[data-bc-picker-close]"),pickerSearch:e("[data-bc-picker-search]"),pickerList:e("[data-bc-picker-list]"),pickerConfirm:e("[data-bc-picker-confirm]"),file:e("[data-bc-file]")},Ie(),f}function ge(e,r=""){if(!e)return;const n=String(r||"").trim();n?(e.getAttribute("src")!==n&&e.setAttribute("src",n),e.style.visibility=""):(e.removeAttribute("src"),e.style.visibility="hidden")}function M(){let e={};try{e=O()||{}}catch{}return{name:String(e.name||"").trim()||i.businessFallback,logoUrl:String(e.logoUrl||"").trim(),city:String(e.city||"").trim()}}function ne(){const e=Number(p?.innerWidth)||le;return Math.min(e,le)}function ie(){return Math.min(ne()*Fe,je)}function he(){const e=P.post,r=M(),n=String(e.previewUrl||"").trim(),s=`<span class="block w-full h-full appearance-none bg-transparent text-left" style="display:block;width:100%;height:100%;padding:0;margin:0;border:0;background:transparent;">${n?`<img src="${C(n)}" decoding="async" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`:""}</span>`,l=r.logoUrl?`<img src="${C(r.logoUrl)}" decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />`:"";return Ae({business:r.name,location:r.city,content:String(e.caption||"").trim(),likes:0,comments:0,isLive:!1,logoImgHtml:l,heroMediaHtml:s,heroReady:!!n,escapeHtmlFn:w,iconFn:Q})}function ye(){const e=P.story,r=M(),n=String(e.previewUrl||"").trim(),a=ie(),s=n?`<img src="${C(n)}" decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />`:Re({iconFn:Q}),l=`<img src="${C(r.logoUrl)}" decoding="async" width="28" height="28" class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />`;return Me({label:r.name,mediaHtml:s,logoImgHtml:l,shellStyle:`flex:0 0 ${a}px;width:${a}px;max-width:${a}px;`,innerStyle:Ne(),escapeHtmlFn:w})}function ve(){const e=P.story,r=M(),n=String(e.previewUrl||"").trim(),a=String(e.caption||"").trim(),s=e.product,l=n?`<img class="reel-image" src="${C(n)}" decoding="async" />`:"",g=s?G(s.price):"",u=s?.imageUrl?B(s.imageUrl,"thumb"):"",A=s?`<span class="productCard">
            <div class="productCardThumb">🍽${u?`<img class="productCardThumbImg" src="${C(u)}" alt="" decoding="async" />`:""}</div>
            <div class="productCardInfo">
              <div class="productCardName">${w(s.name)}</div>
              ${g?`<div class="productCardPrice">${w(g)}</div>`:""}
            </div>
            <span class="productCardBtn">${i.productMore}</span>
          </span>`:"";return`
      <div class="reel" data-index="0">
        ${l}
        <div class="vignette"></div>
        <div class="topbar">
          <div class="topbarLeft">
            <button type="button" class="btnIcon" tabindex="-1">←</button>
            <div class="brandPill">
              <div class="brandLogo" data-bc-brand-logo></div>
              <div class="brandName">${w(r.name)}</div>
            </div>
          </div>
          <div class="topbarRight">
            <button type="button" class="btnIcon" data-story-sound-state="off" aria-pressed="false" tabindex="-1">🔇</button>
          </div>
        </div>
        <div class="content">
          ${a?`<div class="contentDesc">${w(a)}</div>`:""}
          ${A}
        </div>
        <div class="rail">
          <div class="railBtn"><div class="railIcon">1/1</div></div>
        </div>
      </div>
    `}function H(e,r,n,a,{maxHeight:s=0}={}){if(!e||!r)return;const l=e.clientWidth||n,g=Number(a)>0?Number(a):r.scrollHeight;let u=Math.min(1,n>0?l/n:1);s>0&&g>0&&(u=Math.min(u,s/g)),(!Number.isFinite(u)||u<=0)&&(u=1),r.style.width=`${n}px`,r.style.transform=`scale(${u})`,e.style.height=`${Math.round(g*u)}px`,r.style.marginLeft=`${Math.max(0,(l-n*u)/2)}px`}function N(){if(!t||!f?.isConnected)return;const e=ne();if(y==="story"){H(t.stageTile,t.stageTileInner,ie(),Oe);const r=Number(p?.innerWidth)||e,n=Number(p?.innerHeight)||Math.round(r*16/9);t.stageReelInner&&(t.stageReelInner.style.height=`${n}px`),H(t.stageReel,t.stageReelInner,r,n,{maxHeight:Be});return}t.stagePostInner&&(t.stagePostInner.style.height=""),H(t.stagePost,t.stagePostInner,e,t.stagePostInner?.scrollHeight||0)}function D(){if(t){if(y==="story"){if(t.stageTileInner&&(t.stageTileInner.innerHTML=ye()),t.stageReelInner){t.stageReelInner.className=`mnyra-bc__stage-inner ${ze}`,t.stageReelInner.innerHTML=ve();const e=t.stageReelInner.querySelector("[data-bc-brand-logo]");if(e){const r=M().logoUrl;e.style.backgroundImage=r?`url(${r})`:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}}else t.stagePostInner&&(t.stagePostInner.innerHTML=`<div class="app-content-inline py-4">${he()}</div>`);N(),p?.requestAnimationFrame?.(()=>N())}}function _e(){if(!t)return;const e=String(_().caption||"").trim();if(y==="story"){const n=t.stageReelInner?.querySelector(".content");if(!n)return;let a=n.querySelector(".contentDesc");if(e&&!a&&(a=c.createElement("div"),a.className="contentDesc",n.insertBefore(a,n.firstChild)),!e&&a){a.remove();return}a&&(a.textContent=e);return}const r=t.stagePostInner?.querySelector(".feed-card p.line-clamp-2");r&&(r.textContent=e),N()}function ae(){const e=y==="story"?_().product:null,r=e?"1":"0";if(t.chip&&t.chip.setAttribute("data-visible",r),t.tag&&t.tag.setAttribute("data-active",r),t.tagLabel&&(t.tagLabel.textContent=e?e.name:i.tagProduct),!e)return;const n=G(e.price),a=e.imageUrl?B(e.imageUrl,"thumb"):"";t.chipName&&(t.chipName.textContent=e.name),t.chipPrice&&(t.chipPrice.textContent=n),ge(t.chipImg,a)}function oe(){ae(),y==="story"&&D()}function G(e){if(e==null||e==="")return"";let r="";try{r=String(be(e)||"").trim()}catch{r=""}return r==="-"?"":r}function U(){const e=_(),r=pe({caption:e.caption,hasImage:!!e.file,submitting:h});t.submit&&(t.submit.disabled=!r,t.submit.setAttribute("aria-disabled",r?"false":"true")),t.hint&&(h?(t.hint.textContent=i.submitBusy,t.hint.setAttribute("data-tone","busy")):r?(t.hint.textContent=i.hintReady,t.hint.setAttribute("data-tone","ready")):(t.hint.textContent=i.hintNeedBoth,t.hint.setAttribute("data-tone","idle")))}function x(e=""){if(!t.error)return;const r=String(e||"").trim();t.error.textContent=r,t.error.setAttribute("data-visible",r?"1":"0")}function xe(){const e=y==="story",r=_();t.title&&(t.title.textContent=e?i.titleStory:i.titlePost),t.text&&(t.text.placeholder=e?i.placeholderStory:i.placeholderPost,t.text.value!==r.caption&&(t.text.value=r.caption)),t.tag&&(t.tag.hidden=!e),t.photoLabel&&(t.photoLabel.textContent=r.file?i.changePhoto:i.addPhoto),t.photo&&t.photo.setAttribute("data-active",r.file?"1":"0"),t.panePost&&t.panePost.setAttribute("data-visible",e?"0":"1"),t.paneStory&&t.paneStory.setAttribute("data-visible",e?"1":"0"),ae(),D(),U(),x("")}function z(e){h=!!e,f&&f.setAttribute("data-busy",h?"1":"0"),t.submitLabel&&(t.submitLabel.textContent=h?i.submitBusy:i.submit),t.close&&(t.close.disabled=h),t.text&&(t.text.readOnly=h),U()}function ke(e){if(!e)return;if(!String(e.type||"").toLowerCase().startsWith("image/")){x(i.errorImageType);return}if(Number(e.size||0)>De){x(i.errorImageSize);return}const n=_();re(n.previewUrl),n.file=e,n.previewUrl="";try{n.previewUrl=p?.URL?.createObjectURL?p.URL.createObjectURL(e):""}catch{n.previewUrl=""}x(""),D(),t.photoLabel&&(t.photoLabel.textContent=i.changePhoto),t.photo&&t.photo.setAttribute("data-active","1"),U()}function q({force:e=!1}={}){const r=String(L()||"").trim();if(!r||!Y){b.status="error",T();return}b.restaurantId!==r&&(b.restaurantId=r,b.status="idle",b.items=[]),!(!e&&(b.status==="loading"||b.status==="ready"))&&(b.status="loading",T(),(async()=>{try{const n=await Y(r);if(b.restaurantId!==r)return;b.items=Array.isArray(n)?n:[],b.status="ready"}catch{if(b.restaurantId!==r)return;b.items=[],b.status="error"}T()})())}function W(e,r=!1){if(!t.pickerList)return;t.pickerList.textContent="";const n=c.createElement("div");if(n.className="mnyra-bc__picker-state",n.textContent=e,r){const a=c.createElement("button");a.type="button",a.textContent=i.pickerRetry,a.addEventListener("click",()=>q({force:!0})),n.appendChild(c.createElement("br")),n.appendChild(a)}t.pickerList.appendChild(n)}function T(){if(!t.pickerList)return;if(b.status==="loading"||b.status==="idle"){W(i.pickerLoading),$();return}if(b.status==="error"){W(i.pickerError,!0),$();return}const e=String(t.pickerSearch?.value||""),r=Ze(b.items,e);if(!r.length){W(i.pickerEmpty),$();return}const n=c.createDocumentFragment();r.forEach(a=>{const s=c.createElement("button");s.type="button",s.className="mnyra-bc__picker-row",s.dataset.bcPickerItem=a.id,v&&v.id===a.id&&s.setAttribute("data-selected","1");const l=c.createElement("img");l.className="mnyra-bc__picker-thumb",l.alt="",l.loading="lazy",l.decoding="async",a.imageUrl&&(l.src=B(a.imageUrl,"thumb")),s.appendChild(l);const g=c.createElement("div");g.className="mnyra-bc__picker-main";const u=c.createElement("div");u.className="mnyra-bc__picker-name",u.textContent=a.name,g.appendChild(u);const A=c.createElement("div");A.className="mnyra-bc__picker-meta",A.textContent=[a.category,G(a.price)].filter(Boolean).join(" · "),g.appendChild(A),s.appendChild(g);const V=c.createElement("span");V.className="mnyra-bc__picker-mark",V.innerHTML=E.check,s.appendChild(V),n.appendChild(s)}),t.pickerList.textContent="",t.pickerList.appendChild(n),$()}function $(){t.pickerConfirm&&(t.pickerConfirm.disabled=!v)}function we(){y!=="story"||h||(v=_().product||null,t.pickerSearch&&(t.pickerSearch.value=""),t.picker&&t.picker.setAttribute("data-visible","1"),q(),T())}function I(){t.picker&&t.picker.setAttribute("data-visible","0"),v=null}function Se(){return t?.picker?.getAttribute("data-visible")==="1"}function Ce(e=""){if(!c?.body)return;let r=c.getElementById(j);r||(r=c.createElement("div"),r.id=j,r.setAttribute("role","status"),c.body.appendChild(r)),r.textContent=String(e||""),r.setAttribute("data-visible","1"),R&&p?.clearTimeout?.(R),R=p?.setTimeout?.(()=>{r.setAttribute("data-visible","0"),R=0},2600)||0}function ce(){if(!c)return;const e=!!c.querySelector("#overlayRoot .modal-overlay"),r=e?Z:Ge;try{c.documentElement.style.setProperty("--active-modal-surface",r),c.documentElement.classList.toggle("modal-open",e),c.body.classList.toggle("modal-open",e);const n=c.getElementById("modalUnderlay");n&&(n.classList.toggle("hidden",!e),n.style.background=r),["safariChromeTintTop","safariChromeTintBottom"].forEach(s=>{const l=c.getElementById(s);l&&(l.style.display=e?"block":"none",l.style.background=r)});const a=c.head?.querySelector('meta[name="theme-color"]');a&&a.setAttribute("content",r)}catch{}}function Pe(){ee||!c||(ee=!0,c.addEventListener("keydown",e=>{if(!(e.key!=="Escape"||!S)){if(Se()){I(),e.preventDefault();return}h||(F(),e.preventDefault())}}))}function Ie(){t.close?.addEventListener("click",()=>{h||F()}),t.submit?.addEventListener("click",()=>{Le()}),t.text?.addEventListener("input",()=>{const e=_();e.caption=String(t.text.value||""),_e(),U()}),t.photo?.addEventListener("click",()=>{h||(x(""),t.file?.click())}),t.file?.addEventListener("change",()=>{const e=t.file?.files?.[0]||null;ke(e),t.file&&(t.file.value="")}),t.tag?.addEventListener("click",()=>we()),t.chipRemove?.addEventListener("click",()=>{h||(_().product=null,oe())}),t.pickerClose?.addEventListener("click",()=>I()),t.picker?.addEventListener("click",e=>{e.target===t.picker&&I()}),t.pickerSearch?.addEventListener("input",()=>T()),t.pickerList?.addEventListener("click",e=>{const r=e.target?.closest?.("[data-bc-picker-item]");if(!r)return;const n=String(r.dataset.bcPickerItem||"").trim(),a=b.items.find(s=>s.id===n)||null;v=v&&v.id===n?null:a,Array.from(t.pickerList.querySelectorAll("[data-bc-picker-item]")).forEach(s=>{s.setAttribute("data-selected",v&&s.dataset.bcPickerItem===v.id?"1":"0")}),$()}),t.pickerConfirm?.addEventListener("click",()=>{v&&(_().product=v,I(),oe())})}function Ee(e){const r=P[e];r&&(re(r.previewUrl),r.caption="",r.file=null,r.previewUrl="",r.product=null)}async function Le(){if(h)return;const e=_();if(!pe({caption:e.caption,hasImage:!!e.file,submitting:h}))return;const r=String(L()||"").trim();if(!r){x(i.errorNoBusiness);return}if(p&&p.navigator&&p.navigator.onLine===!1){x(i.errorOffline);return}if(!X||(y==="story"?!J:!K)){x(i.errorGeneric);return}const n=y,a=String(e.caption||"").trim().slice(0,de),s=e.file;z(!0),x("");try{const l=await X(s,r),g=String(l?.cdnUrl||l?.url||"").trim();if(!g)throw new Error(i.errorGeneric);if(n==="story"){const u=e.product;await J({restaurantId:r,caption:a,mediaUrl:g,mediaType:"image",menuItemId:u?.id||"",menuItemName:u?.name||"",menuItemPrice:u?.price??"",menuItemImage:u?.imageUrl||""})}else await K({restaurantId:r,caption:a,mediaUrl:g,mediaType:"image"});z(!1),F(),Ee(n),Ce(n==="story"?i.successStory:i.successPost);try{await ue(n)}catch{}}catch(l){z(!1);const g=String(l?.message||"").trim();x(g||i.errorGeneric)}}function Te(e="post"){if(!c)return;const r=String(e||"").trim().toLowerCase()==="story"?"story":"post";if(fe(),!!f){if(Pe(),y=r,I(),z(!1),!S){const n=Ve(c);n&&f.parentNode!==n&&n.appendChild(f),S=!0}xe(),$e(),t.body&&(t.body.scrollTop=0),ce(),y==="story"&&q()}}function $e(){if(te||!p?.addEventListener)return;te=!0;const e=()=>{S&&N()};p.addEventListener("resize",e,{passive:!0}),p.addEventListener("orientationchange",e,{passive:!0})}function F(){if(S){S=!1,I();try{f?.remove()}catch{}ce()}}return Object.freeze({open:Te,close:F,isOpen:()=>S})}export{qe as BUSINESS_COMPOSER_CSS,pe as canPublishComposerDraftCore,rt as createBusinessComposerController,Ze as filterComposerProductsCore,tt as normalizeComposerProductCore};
