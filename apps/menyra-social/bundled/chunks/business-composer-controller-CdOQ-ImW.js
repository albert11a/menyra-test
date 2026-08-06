import{au as je,av as Be,aw as He,ax as De}from"./domain-feed-social-eager-D4CES9yO.js";import{S as Ge,b as We}from"./domain-stories-L5z6TIba.js";import"./domain-auth-Aq-4Vdvh.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-media-eager-B3Bb4ghO.js";import"./domain-menu-eager-QoBEIbVZ.js";const se="mnyraBusinessComposerStyles",le=448,Ye=.29,qe=120,de=208,Ve=.4,Ze=.7,pe=9/16,ue=320,Xe=480,he=12,Ke=420,Je="businessComposerOverlayRoot",Qe=15*1024*1024,me=600,D="mnyraBusinessComposerToast",et="#f8fafc",K="#ffffff",c=Object.freeze({titlePost:"Postim i ri",titleStory:"Story e re",submit:"Posto",submitBusy:"Duke postuar…",close:"Mbyll",placeholderPost:"Shkruaj diçka për postimin tënd…",placeholderStory:"Shkruaj diçka për story-n tënde…",addPhoto:"Shto foto",changePhoto:"Ndrysho foton",tagProduct:"Etiketo produkt",removeProduct:"Hiq produktin",productOptional:"Produkti nuk është i detyrueshëm.",hintNeedBoth:"Që të postosh, duhen edhe teksti edhe fotoja.",hintReady:"Gati për t'u postuar.",previewTitle:"Parapamje",previewPost:"Si duket në Zbulo",previewStoryTile:"Në Zbulo",previewStoryFull:"Kur hapet story-a",previewEmpty:"Zgjidh një foto për ta parë parapamjen.",productMore:"Mehr",pickerTitle:"Zgjidh një produkt",pickerSearch:"Kërko ushqime ose pije…",pickerConfirm:"Zgjidh produktin",pickerEmpty:"Nuk u gjet asnjë produkt.",pickerLoading:"Duke ngarkuar produktet…",pickerError:"Produktet nuk u ngarkuan.",pickerRetry:"Provo përsëri",errorImageType:"Lejohet vetëm foto (JPG, PNG ose WEBP).",errorImageSize:"Fotoja duhet të jetë deri në 15MB.",errorNoBusiness:"Kjo llogari nuk është e lidhur me një biznes.",errorGeneric:"Postimi dështoi. Provo përsëri.",errorOffline:"Nuk ka lidhje me internetin. Provo përsëri.",successPost:"Postimi u publikua.",successStory:"Story u publikua.",captionFallback:"Pa tekst",businessFallback:"Biznesi im"}),w='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"',$=Object.freeze({close:`<svg ${w}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,image:`<svg ${w}><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`,tag:`<svg ${w}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>`,plus:`<svg ${w}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`,camera:`<svg ${w}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,check:`<svg ${w}><path d="M20 6 9 17l-5-5"></path></svg>`,search:`<svg ${w}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,heart:`<svg ${w}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`,comment:`<svg ${w}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>`}),tt=`
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
  gap: ${he}px;
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
#${D} {
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
#${D}[data-visible="1"] { opacity: 1; }
@media (min-width: 640px) {
  .mnyra-bc__sheet { max-width: 560px; margin: 0 auto; }
  .mnyra-bc__picker { padding-bottom: 24px; }
  .mnyra-bc__picker-sheet { max-width: 520px; margin: 0 auto; }
}
`;function rt(p){if(!(!p||p.getElementById(se)))try{const d=p.createElement("style");d.id=se,d.textContent=`${Ge}
${tt}`,p.head?.appendChild(d)}catch{}}function nt(p){if(!p?.body)return null;let d=p.getElementById("overlayRoot");return d||(d=p.createElement("div"),d.id="overlayRoot",d.style.position="relative",d.style.zIndex="200",d.style.isolation="isolate",p.body.appendChild(d)),d}function bt(p="",d={}){const i=d&&typeof d=="object"?d:{},a=String(p||"").trim();if(!a)return null;const l=i.imageUrl||i.image||(Array.isArray(i.images)?i.images[0]:"")||"",f=String(i.type||i.menuType||"").trim().toLowerCase(),I=["drink","drinks","beverage","getraenke","getränke"].includes(f)?"drink":"food";return{id:a,name:String(i.name||i.title||"").trim()||a,price:i.price??"",category:String(i.category||"").trim(),type:I,imageUrl:typeof l=="string"?l.trim():""}}function it(p=[],d=""){const i=Array.isArray(p)?p:[],a=String(d||"").trim().toLowerCase();return a?i.filter(l=>`${l?.name||""} ${l?.category||""}`.toLowerCase().includes(a)):i}function at(p=0,d=0){const i=Number(p)>0?Number(p):0,a=Number(d)>0?Number(d):0;if(i<=0||a<=0)return pe;const l=Math.min(i,a)/Math.max(i,a);return l<Ve||l>Ze?pe:l}function ot({screenWidth:p=0,screenHeight:d=0,viewportWidth:i=0}={}){const a=at(p,d),l=Number(i)>0?Number(i):ue,f=Math.round(Math.min(Xe,Math.max(ue,l)));return{width:f,height:Math.round(f/a)}}function be(p=0,d=0,i=0){const a=Number(p)>0?Number(p):0,l=Number(d)>0?Number(d):0;if(a<=0||l<=0)return{width:0,height:0,scale:1};const f=i/l;return{width:a*f,height:i,scale:f}}function ct({rowWidth:p=0,gap:d=he,tileWidth:i=0,tileHeight:a=0,reelWidth:l=0,reelHeight:f=0,maxHeight:I=Ke}={}){const E=Math.max(1,((Number(p)||0)-(Number(d)||0))/2),S=[];Number(I)>0&&S.push(Number(I)),i>0&&a>0&&S.push(E*(a/i)),l>0&&f>0&&S.push(E*(f/l));const L=S.length?Math.max(1,Math.min(...S)):1;return{height:L,columnWidth:E,tile:be(i,a,L),reel:be(l,f,L)}}function fe({caption:p="",hasImage:d=!1,submitting:i=!1}={}){return i||!d?!1:String(p||"").trim().length>0}function ft({documentObj:p=null,windowObj:d=null,api:i={}}={}){const a=p||(typeof document>"u"?null:document),l=d||a?.defaultView||(typeof window>"u"?null:window),f=typeof i.getRestaurantIdFn=="function"?i.getRestaurantIdFn:(()=>""),I=typeof i.getBusinessMetaFn=="function"?i.getBusinessMetaFn:(()=>({name:"",logoUrl:""})),E=typeof i.loadProductsFn=="function"?i.loadProductsFn:null,S=typeof i.uploadImageFn=="function"?i.uploadImageFn:null,L=typeof i.createPostFn=="function"?i.createPostFn:null,J=typeof i.createStoryFn=="function"?i.createStoryFn:null,ge=typeof i.afterPublishFn=="function"?i.afterPublishFn:(()=>{}),ye=typeof i.formatPriceFn=="function"?i.formatPriceFn:(e=>String(e??"")),G=typeof i.getOptimizedImageUrlFn=="function"?i.getOptimizedImageUrlFn:(e=>String(e||"").trim()),C=typeof i.escapeHtmlFn=="function"?i.escapeHtmlFn:(e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")),Q=typeof i.iconFn=="function"?i.iconFn:(()=>""),T=(e="")=>C(String(e??"")),M={post:{caption:"",file:null,previewUrl:"",product:null},story:{caption:"",file:null,previewUrl:"",product:null}},m={status:"idle",items:[],restaurantId:""};let b=null,t=null,y="post",P=!1,h=!1,v=null,ee=!1,te=!1,O=0;function x(){return M[y]||M.post}function re(e=""){const r=String(e||"").trim();if(r.startsWith("blob:"))try{l?.URL?.revokeObjectURL?.(r)}catch{}}function ve(){return`
      <div class="mnyra-bc__sheet">
        <header class="mnyra-bc__head">
          <button type="button" class="mnyra-bc__x" data-bc-close aria-label="${c.close}" title="${c.close}">${$.close}</button>
          <div class="mnyra-bc__title" data-bc-title></div>
          <button type="button" class="mnyra-bc__submit" data-bc-submit disabled>
            <span class="mnyra-bc__spinner"></span><span data-bc-submit-label>${c.submit}</span>
          </button>
        </header>
        <div class="mnyra-bc__body" data-bc-body>
          <div class="mnyra-bc__compose">
            <textarea class="mnyra-bc__text" data-bc-text maxlength="${me}" rows="5" enterkeyhint="done"></textarea>
            <div class="mnyra-bc__tools">
              <button type="button" class="mnyra-bc__tool" data-bc-photo>
                ${$.image}<span class="mnyra-bc__tool-label" data-bc-photo-label>${c.addPhoto}</span>
              </button>
              <button type="button" class="mnyra-bc__tool" data-bc-tag hidden>
                ${$.tag}<span class="mnyra-bc__tool-label" data-bc-tag-label>${c.tagProduct}</span>
              </button>
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
          <p class="mnyra-bc__hint" data-bc-hint></p>
          <div class="mnyra-bc__error" data-bc-error role="alert"></div>

          <section class="mnyra-bc__preview">
            <p class="mnyra-bc__preview-title">${c.previewTitle}</p>

            <div class="mnyra-bc__pane" data-bc-pane="post">
              <p class="mnyra-bc__preview-caption">${c.previewPost}</p>
              <div class="mnyra-bc__stage mnyra-bc__stage--bleed" data-bc-stage="post">
                <div class="mnyra-bc__stage-inner" data-bc-stage-inner="post"></div>
              </div>
            </div>

            <div class="mnyra-bc__pane" data-bc-pane="story">
              <div class="mnyra-bc__story-grid" data-bc-story-grid>
                <div class="mnyra-bc__story-col">
                  <p class="mnyra-bc__preview-caption">${c.previewStoryTile}</p>
                  <div class="mnyra-bc__stage mnyra-bc__stage--frame" data-bc-stage="tile">
                    <div class="mnyra-bc__stage-inner" data-bc-stage-inner="tile"></div>
                  </div>
                </div>
                <div class="mnyra-bc__story-col">
                  <p class="mnyra-bc__preview-caption">${c.previewStoryFull}</p>
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
              <span class="mnyra-bc__picker-title">${c.pickerTitle}</span>
              <button type="button" class="mnyra-bc__x" data-bc-picker-close aria-label="${c.close}" title="${c.close}">${$.close}</button>
            </div>
            <div class="mnyra-bc__picker-search">
              ${$.search}
              <input type="search" data-bc-picker-search placeholder="${c.pickerSearch}" autocomplete="off" />
            </div>
            <div class="mnyra-bc__picker-list" data-bc-picker-list></div>
            <div class="mnyra-bc__picker-foot">
              <p class="mnyra-bc__picker-note">${c.productOptional}</p>
              <button type="button" class="mnyra-bc__picker-confirm" data-bc-picker-confirm disabled>${c.pickerConfirm}</button>
            </div>
          </div>
        </div>
      </div>
      <input type="file" accept="image/*" data-bc-file hidden />
    `}function _e(){if(b||!a)return b;rt(a),b=a.createElement("div"),b.id=Je,b.className="mnyra-bc modal-overlay",b.setAttribute("data-modal-surface",K),b.style.setProperty("--modal-surface",K),b.innerHTML=ve();const e=r=>b.querySelector(r);return t={title:e("[data-bc-title]"),close:e("[data-bc-close]"),submit:e("[data-bc-submit]"),submitLabel:e("[data-bc-submit-label]"),body:e("[data-bc-body]"),text:e("[data-bc-text]"),photo:e("[data-bc-photo]"),photoLabel:e("[data-bc-photo-label]"),tag:e("[data-bc-tag]"),tagLabel:e("[data-bc-tag-label]"),chip:e("[data-bc-chip]"),chipImg:e("[data-bc-chip-img]"),chipName:e("[data-bc-chip-name]"),chipPrice:e("[data-bc-chip-price]"),chipRemove:e("[data-bc-chip-remove]"),hint:e("[data-bc-hint]"),error:e("[data-bc-error]"),panePost:e('[data-bc-pane="post"]'),paneStory:e('[data-bc-pane="story"]'),storyGrid:e("[data-bc-story-grid]"),stagePost:e('[data-bc-stage="post"]'),stagePostInner:e('[data-bc-stage-inner="post"]'),stageTile:e('[data-bc-stage="tile"]'),stageTileInner:e('[data-bc-stage-inner="tile"]'),stageReel:e('[data-bc-stage="reel"]'),stageReelInner:e('[data-bc-stage-inner="reel"]'),picker:e("[data-bc-picker]"),pickerClose:e("[data-bc-picker-close]"),pickerSearch:e("[data-bc-picker-search]"),pickerList:e("[data-bc-picker-list]"),pickerConfirm:e("[data-bc-picker-confirm]"),file:e("[data-bc-file]")},Ne(),b}function xe(e,r=""){if(!e)return;const n=String(r||"").trim();n?(e.getAttribute("src")!==n&&e.setAttribute("src",n),e.style.visibility=""):(e.removeAttribute("src"),e.style.visibility="hidden")}function z(){let e={};try{e=I()||{}}catch{}return{name:String(e.name||"").trim()||c.businessFallback,logoUrl:String(e.logoUrl||"").trim(),city:String(e.city||"").trim()}}function W(){const e=Number(l?.innerWidth)||le;return Math.min(e,le)}function ne(){return Math.min(W()*Ye,qe)}function ke(){return ot({screenWidth:Number(l?.screen?.width)||0,screenHeight:Number(l?.screen?.height)||0,viewportWidth:Number(l?.innerWidth)||0})}function we(){const e=Number(t?.storyGrid?.clientWidth)||0;if(e>0)return e;const r=Number(t?.body?.clientWidth)||0;return r>0?Math.max(1,r-32):Math.max(1,W()-32)}function Se(){const e=M.post,r=z(),n=String(e.previewUrl||"").trim(),s=`<span class="block w-full h-full appearance-none bg-transparent text-left" style="display:block;width:100%;height:100%;padding:0;margin:0;border:0;background:transparent;">${n?`<img src="${T(n)}" decoding="async" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`:""}</span>`,u=r.logoUrl?`<img src="${T(r.logoUrl)}" decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />`:"";return je({business:r.name,location:r.city,content:String(e.caption||"").trim(),likes:0,comments:0,isLive:!1,logoImgHtml:u,heroMediaHtml:s,heroReady:!!n,escapeHtmlFn:C,iconFn:Q})}function Ce(){const e=M.story,r=z(),n=String(e.previewUrl||"").trim(),o=ne(),s=n?`<img src="${T(n)}" decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />`:Be({iconFn:Q}),u=`<img src="${T(r.logoUrl)}" decoding="async" width="28" height="28" class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />`;return He({label:r.name,mediaHtml:s,logoImgHtml:u,shellStyle:`flex:0 0 ${o}px;width:${o}px;max-width:${o}px;`,innerStyle:De(),escapeHtmlFn:C})}function Pe(){const e=M.story,r=z(),n=String(e.previewUrl||"").trim(),o=String(e.caption||"").trim(),s=e.product,u=n?`<img class="reel-image" src="${T(n)}" decoding="async" />`:"",g=s?q(s.price):"",_=s?.imageUrl?G(s.imageUrl,"thumb"):"",F=s?`<span class="productCard">
            <div class="productCardThumb">🍽${_?`<img class="productCardThumbImg" src="${T(_)}" alt="" decoding="async" />`:""}</div>
            <div class="productCardInfo">
              <div class="productCardName">${C(s.name)}</div>
              ${g?`<div class="productCardPrice">${C(g)}</div>`:""}
            </div>
            <span class="productCardBtn">${c.productMore}</span>
          </span>`:"";return`
      <div class="reel" data-index="0">
        ${u}
        <div class="vignette"></div>
        <div class="topbar">
          <div class="topbarLeft">
            <button type="button" class="btnIcon" tabindex="-1">←</button>
            <div class="brandPill">
              <div class="brandLogo" data-bc-brand-logo></div>
              <div class="brandName">${C(r.name)}</div>
            </div>
          </div>
          <div class="topbarRight">
            <button type="button" class="btnIcon" data-story-sound-state="off" aria-pressed="false" tabindex="-1">🔇</button>
          </div>
        </div>
        <div class="content">
          ${o?`<div class="contentDesc">${C(o)}</div>`:""}
          ${F}
        </div>
        <div class="rail">
          <div class="railBtn"><div class="railIcon">1/1</div></div>
        </div>
      </div>
    `}function ie(e,r,n,o,s){!e||!r||!s||!(s.scale>0)||(r.style.width=`${n}px`,r.style.height=`${o}px`,r.style.marginLeft="0px",r.style.transform=`scale(${s.scale})`,e.style.width=`${Math.round(s.width)}px`,e.style.height=`${Math.round(s.height)}px`)}function Ie(e,r,n){if(!e||!r)return;const o=e.clientWidth||n;r.style.width=`${n}px`,r.style.height="";let s=Math.min(1,n>0?o/n:1);(!Number.isFinite(s)||s<=0)&&(s=1),r.style.transform=`scale(${s})`;const u=r.scrollHeight;e.style.height=`${Math.round(u*s)}px`,r.style.marginLeft=`${Math.max(0,(o-n*s)/2)}px`}function U(){if(!(!t||!b?.isConnected)){if(y==="story"){const e=ne(),r=ke(),n=ct({rowWidth:we(),tileWidth:e,tileHeight:de,reelWidth:r.width,reelHeight:r.height});ie(t.stageTile,t.stageTileInner,e,de,n.tile),ie(t.stageReel,t.stageReelInner,r.width,r.height,n.reel);return}Ie(t.stagePost,t.stagePostInner,W())}}function Y(){if(t){if(y==="story"){if(t.stageTileInner&&(t.stageTileInner.innerHTML=Ce()),t.stageReelInner){t.stageReelInner.className=`mnyra-bc__stage-inner ${We}`,t.stageReelInner.innerHTML=Pe();const e=t.stageReelInner.querySelector("[data-bc-brand-logo]");if(e){const r=z().logoUrl;e.style.backgroundImage=r?`url(${r})`:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}}else t.stagePostInner&&(t.stagePostInner.innerHTML=`<div class="app-content-inline py-4">${Se()}</div>`);U(),l?.requestAnimationFrame?.(()=>U())}}function Ee(){if(!t)return;const e=String(x().caption||"").trim();if(y==="story"){const n=t.stageReelInner?.querySelector(".content");if(!n)return;let o=n.querySelector(".contentDesc");if(e&&!o&&(o=a.createElement("div"),o.className="contentDesc",n.insertBefore(o,n.firstChild)),!e&&o){o.remove();return}o&&(o.textContent=e);return}const r=t.stagePostInner?.querySelector(".feed-card p.line-clamp-2");r&&(r.textContent=e),U()}function ae(){const e=y==="story"?x().product:null,r=e?"1":"0";if(t.chip&&t.chip.setAttribute("data-visible",r),t.tag&&t.tag.setAttribute("data-active",r),t.tagLabel&&(t.tagLabel.textContent=e?e.name:c.tagProduct),!e)return;const n=q(e.price),o=e.imageUrl?G(e.imageUrl,"thumb"):"";t.chipName&&(t.chipName.textContent=e.name),t.chipPrice&&(t.chipPrice.textContent=n),xe(t.chipImg,o)}function oe(){ae(),y==="story"&&Y()}function q(e){if(e==null||e==="")return"";let r="";try{r=String(ye(e)||"").trim()}catch{r=""}return r==="-"?"":r}function j(){const e=x(),r=fe({caption:e.caption,hasImage:!!e.file,submitting:h});t.submit&&(t.submit.disabled=!r,t.submit.setAttribute("aria-disabled",r?"false":"true")),t.hint&&(h?(t.hint.textContent=c.submitBusy,t.hint.setAttribute("data-tone","busy")):r?(t.hint.textContent=c.hintReady,t.hint.setAttribute("data-tone","ready")):(t.hint.textContent=c.hintNeedBoth,t.hint.setAttribute("data-tone","idle")))}function k(e=""){if(!t.error)return;const r=String(e||"").trim();t.error.textContent=r,t.error.setAttribute("data-visible",r?"1":"0")}function Le(){const e=y==="story",r=x();t.title&&(t.title.textContent=e?c.titleStory:c.titlePost),t.text&&(t.text.placeholder=e?c.placeholderStory:c.placeholderPost,t.text.value!==r.caption&&(t.text.value=r.caption)),t.tag&&(t.tag.hidden=!e),t.photoLabel&&(t.photoLabel.textContent=r.file?c.changePhoto:c.addPhoto),t.photo&&t.photo.setAttribute("data-active",r.file?"1":"0"),t.panePost&&t.panePost.setAttribute("data-visible",e?"0":"1"),t.paneStory&&t.paneStory.setAttribute("data-visible",e?"1":"0"),ae(),Y(),j(),k("")}function B(e){h=!!e,b&&b.setAttribute("data-busy",h?"1":"0"),t.submitLabel&&(t.submitLabel.textContent=h?c.submitBusy:c.submit),t.close&&(t.close.disabled=h),t.text&&(t.text.readOnly=h),j()}function Te(e){if(!e)return;if(!String(e.type||"").toLowerCase().startsWith("image/")){k(c.errorImageType);return}if(Number(e.size||0)>Qe){k(c.errorImageSize);return}const n=x();re(n.previewUrl),n.file=e,n.previewUrl="";try{n.previewUrl=l?.URL?.createObjectURL?l.URL.createObjectURL(e):""}catch{n.previewUrl=""}k(""),Y(),t.photoLabel&&(t.photoLabel.textContent=c.changePhoto),t.photo&&t.photo.setAttribute("data-active","1"),j()}function V({force:e=!1}={}){const r=String(f()||"").trim();if(!r||!E){m.status="error",R();return}m.restaurantId!==r&&(m.restaurantId=r,m.status="idle",m.items=[]),!(!e&&(m.status==="loading"||m.status==="ready"))&&(m.status="loading",R(),(async()=>{try{const n=await E(r);if(m.restaurantId!==r)return;m.items=Array.isArray(n)?n:[],m.status="ready"}catch{if(m.restaurantId!==r)return;m.items=[],m.status="error"}R()})())}function Z(e,r=!1){if(!t.pickerList)return;t.pickerList.textContent="";const n=a.createElement("div");if(n.className="mnyra-bc__picker-state",n.textContent=e,r){const o=a.createElement("button");o.type="button",o.textContent=c.pickerRetry,o.addEventListener("click",()=>V({force:!0})),n.appendChild(a.createElement("br")),n.appendChild(o)}t.pickerList.appendChild(n)}function R(){if(!t.pickerList)return;if(m.status==="loading"||m.status==="idle"){Z(c.pickerLoading),N();return}if(m.status==="error"){Z(c.pickerError,!0),N();return}const e=String(t.pickerSearch?.value||""),r=it(m.items,e);if(!r.length){Z(c.pickerEmpty),N();return}const n=a.createDocumentFragment();r.forEach(o=>{const s=a.createElement("button");s.type="button",s.className="mnyra-bc__picker-row",s.dataset.bcPickerItem=o.id,v&&v.id===o.id&&s.setAttribute("data-selected","1");const u=a.createElement("img");u.className="mnyra-bc__picker-thumb",u.alt="",u.loading="lazy",u.decoding="async",o.imageUrl&&(u.src=G(o.imageUrl,"thumb")),s.appendChild(u);const g=a.createElement("div");g.className="mnyra-bc__picker-main";const _=a.createElement("div");_.className="mnyra-bc__picker-name",_.textContent=o.name,g.appendChild(_);const F=a.createElement("div");F.className="mnyra-bc__picker-meta",F.textContent=[o.category,q(o.price)].filter(Boolean).join(" · "),g.appendChild(F),s.appendChild(g);const X=a.createElement("span");X.className="mnyra-bc__picker-mark",X.innerHTML=$.check,s.appendChild(X),n.appendChild(s)}),t.pickerList.textContent="",t.pickerList.appendChild(n),N()}function N(){t.pickerConfirm&&(t.pickerConfirm.disabled=!v)}function Me(){y!=="story"||h||(v=x().product||null,t.pickerSearch&&(t.pickerSearch.value=""),t.picker&&t.picker.setAttribute("data-visible","1"),V(),R())}function A(){t.picker&&t.picker.setAttribute("data-visible","0"),v=null}function Ae(){return t?.picker?.getAttribute("data-visible")==="1"}function $e(e=""){if(!a?.body)return;let r=a.getElementById(D);r||(r=a.createElement("div"),r.id=D,r.setAttribute("role","status"),a.body.appendChild(r)),r.textContent=String(e||""),r.setAttribute("data-visible","1"),O&&l?.clearTimeout?.(O),O=l?.setTimeout?.(()=>{r.setAttribute("data-visible","0"),O=0},2600)||0}function ce(){if(!a)return;const e=!!a.querySelector("#overlayRoot .modal-overlay"),r=e?K:et;try{a.documentElement.style.setProperty("--active-modal-surface",r),a.documentElement.classList.toggle("modal-open",e),a.body.classList.toggle("modal-open",e);const n=a.getElementById("modalUnderlay");n&&(n.classList.toggle("hidden",!e),n.style.background=r),["safariChromeTintTop","safariChromeTintBottom"].forEach(s=>{const u=a.getElementById(s);u&&(u.style.display=e?"block":"none",u.style.background=r)});const o=a.head?.querySelector('meta[name="theme-color"]');o&&o.setAttribute("content",r)}catch{}}function Re(){ee||!a||(ee=!0,a.addEventListener("keydown",e=>{if(!(e.key!=="Escape"||!P)){if(Ae()){A(),e.preventDefault();return}h||(H(),e.preventDefault())}}))}function Ne(){t.close?.addEventListener("click",()=>{h||H()}),t.submit?.addEventListener("click",()=>{Oe()}),t.text?.addEventListener("input",()=>{const e=x();e.caption=String(t.text.value||""),Ee(),j()}),t.photo?.addEventListener("click",()=>{h||(k(""),t.file?.click())}),t.file?.addEventListener("change",()=>{const e=t.file?.files?.[0]||null;Te(e),t.file&&(t.file.value="")}),t.tag?.addEventListener("click",()=>Me()),t.chipRemove?.addEventListener("click",()=>{h||(x().product=null,oe())}),t.pickerClose?.addEventListener("click",()=>A()),t.picker?.addEventListener("click",e=>{e.target===t.picker&&A()}),t.pickerSearch?.addEventListener("input",()=>R()),t.pickerList?.addEventListener("click",e=>{const r=e.target?.closest?.("[data-bc-picker-item]");if(!r)return;const n=String(r.dataset.bcPickerItem||"").trim(),o=m.items.find(s=>s.id===n)||null;v=v&&v.id===n?null:o,Array.from(t.pickerList.querySelectorAll("[data-bc-picker-item]")).forEach(s=>{s.setAttribute("data-selected",v&&s.dataset.bcPickerItem===v.id?"1":"0")}),N()}),t.pickerConfirm?.addEventListener("click",()=>{v&&(x().product=v,A(),oe())})}function Fe(e){const r=M[e];r&&(re(r.previewUrl),r.caption="",r.file=null,r.previewUrl="",r.product=null)}async function Oe(){if(h)return;const e=x();if(!fe({caption:e.caption,hasImage:!!e.file,submitting:h}))return;const r=String(f()||"").trim();if(!r){k(c.errorNoBusiness);return}if(l&&l.navigator&&l.navigator.onLine===!1){k(c.errorOffline);return}if(!S||(y==="story"?!J:!L)){k(c.errorGeneric);return}const n=y,o=String(e.caption||"").trim().slice(0,me),s=e.file;B(!0),k("");try{const u=await S(s,r),g=String(u?.cdnUrl||u?.url||"").trim();if(!g)throw new Error(c.errorGeneric);if(n==="story"){const _=e.product;await J({restaurantId:r,caption:o,mediaUrl:g,mediaType:"image",menuItemId:_?.id||"",menuItemName:_?.name||"",menuItemPrice:_?.price??"",menuItemImage:_?.imageUrl||""})}else await L({restaurantId:r,caption:o,mediaUrl:g,mediaType:"image"});B(!1),H(),Fe(n),$e(n==="story"?c.successStory:c.successPost);try{await ge(n)}catch{}}catch(u){B(!1);const g=String(u?.message||"").trim();k(g||c.errorGeneric)}}function ze(e="post"){if(!a)return;const r=String(e||"").trim().toLowerCase()==="story"?"story":"post";if(_e(),!!b){if(Re(),y=r,A(),B(!1),!P){const n=nt(a);n&&b.parentNode!==n&&n.appendChild(b),P=!0}Le(),Ue(),t.body&&(t.body.scrollTop=0),ce(),y==="story"&&V()}}function Ue(){if(te||!l?.addEventListener)return;te=!0;const e=()=>{P&&U()};l.addEventListener("resize",e,{passive:!0}),l.addEventListener("orientationchange",e,{passive:!0})}function H(){if(P){P=!1,A();try{b?.remove()}catch{}ce()}}return Object.freeze({open:ze,close:H,isOpen:()=>P})}export{tt as BUSINESS_COMPOSER_CSS,fe as canPublishComposerDraftCore,ft as createBusinessComposerController,it as filterComposerProductsCore,bt as normalizeComposerProductCore,at as resolveStoryFrameRatioCore,ot as resolveStoryFrameSizeCore,ct as resolveStoryPreviewLayoutCore};
