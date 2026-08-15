import{G as F,h as X,i as Z,j as ee}from"./domain-dashboard-Dvwb0RDE.js";import{aH as oe,aI as O,aJ as ne,aK as te,aL as ae,aM as D}from"./domain-feed-social-eager-C9v92EnI.js";import{createGoApiClient as re}from"./go-api-client-DdAUyAtu.js";import"./domain-auth-t0x0ToSL.js";import"./domain-analytics-OTr4ugX-.js";import"./domain-business-accounts-D8NpUhi6.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-media-eager-DAUyCk2O.js";import"./domain-menu-eager-C5d-zQNJ.js";const Q="mnyraGoModalStyles",ie="mnyraGoOverlayRoot",P="#ffffff",se=`
.mnyra-go {
  position: fixed;
  inset: 0;
  z-index: 90;
  --go-ink: #0f172a;
  --go-ink-2: #475569;
  --go-muted: #94a3b8;
  --go-line: rgba(15, 23, 42, 0.08);
  --go-plane: #f8fafc;
  --go-accent: #4f46e5;
  --go-accent-soft: #eef2ff;
  --modal-surface: #ffffff;
  background: #ffffff;
  color: var(--go-ink);
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}
.mnyra-go * { box-sizing: border-box; }
.mnyra-go__sheet {
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
.mnyra-go__head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--go-line);
  background: #ffffff;
}
.mnyra-go__x {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border: none;
  border-radius: 14px;
  background: var(--go-plane);
  color: var(--go-ink);
  font-size: 18px;
  font-weight: 900;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.mnyra-go__x:active { transform: scale(0.94); }
.mnyra-go__title {
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
.mnyra-go__action {
  flex: 0 0 auto;
  min-width: 88px;
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: var(--go-accent);
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.mnyra-go__action:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }
.mnyra-go__action:not(:disabled):active { transform: scale(0.96); }
.mnyra-go__action--ghost { min-width: 40px; background: transparent; color: var(--go-muted); }
.mnyra-go__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 16px 16px calc(var(--safe-area-bottom, 0px) + 24px);
}
.mnyra-go__q {
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.02em;
}
.mnyra-go__q--sub { margin-top: 22px; font-size: 13px; }
.mnyra-go__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.mnyra-go__chips--party { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); }
/* Die Auswahlflaechen sind Pillen, keine Dropdowns - GO wird mit dem Daumen
   bedient, und 44px sind die kleinste Flaeche, die sicher zu treffen ist
   (Punkt 143). */
.mnyra-go__chip {
  min-height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 16px;
  background: var(--go-plane);
  color: var(--go-ink-2);
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.mnyra-go__chip[aria-pressed="true"] { background: var(--go-ink); color: #ffffff; }
.mnyra-go__chip:active { transform: scale(0.97); }
.mnyra-go__field {
  width: 100%;
  min-height: 48px;
  margin-top: 10px;
  padding: 0 14px;
  border: none;
  border-radius: 16px;
  background: var(--go-plane);
  color: var(--go-ink);
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
}
.mnyra-go__ghost {
  margin-top: 18px;
  border: none;
  background: transparent;
  color: var(--go-muted);
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  padding: 0;
}
.mnyra-go__place {
  margin-top: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 18px;
  background: var(--go-plane);
  font-size: 14px;
  font-weight: 900;
}
.mnyra-go__place-change {
  border: none;
  background: transparent;
  color: var(--go-muted);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}
.mnyra-go__cta {
  width: 100%;
  min-height: 52px;
  margin-top: 22px;
  border: none;
  border-radius: 18px;
  background: var(--go-ink);
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}
.mnyra-go__cta--quiet { background: var(--go-plane); color: var(--go-ink-2); }
.mnyra-go__cta:disabled { opacity: 0.6; cursor: not-allowed; }
.mnyra-go__hint { margin: 8px 0 0; font-size: 13px; font-weight: 700; color: var(--go-ink-2); }
.mnyra-go__note {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #fffbeb;
  color: #b45309;
  font-size: 13px;
  font-weight: 700;
}
/* Die Ergebniskarte. Sie darf nicht aussehen wie eine gewoehnliche Oferta:
   oben steht, WER anbietet, darunter, was DIESER Gruppe angeboten wird
   (Punkt 19). */
.mnyra-go__card {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid var(--go-line);
  border-radius: 28px;
  background: #ffffff;
}
.mnyra-go__card-head { display: flex; align-items: center; gap: 10px; }
.mnyra-go__card-logo { width: 40px; height: 40px; border-radius: 14px; object-fit: cover; background: var(--go-plane); flex: 0 0 auto; }
.mnyra-go__card-who { min-width: 0; font-size: 13px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mnyra-go__card-who span { color: var(--go-muted); font-weight: 700; }
.mnyra-go__card-sponsored { font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: #cbd5e1; }
.mnyra-go__card-benefit { margin: 12px 0 0; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
.mnyra-go__card-for { margin: 2px 0 0; font-size: 13px; font-weight: 700; color: var(--go-ink-2); }
.mnyra-go__card-meta { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12px; font-weight: 700; color: var(--go-ink-2); }
.mnyra-go__card-only { margin: 12px 0 0; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: #cbd5e1; }
.mnyra-go__done { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
.mnyra-go__done-name { margin: 16px 0 0; font-size: 19px; font-weight: 900; letter-spacing: -0.02em; }
.mnyra-go__ok {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #ecfdf5;
  color: #047857;
  font-size: 13px;
  font-weight: 900;
}
.mnyra-go__code {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--go-plane);
}
.mnyra-go__code-label { margin: 0; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted); }
.mnyra-go__code-value { margin: 4px 0 0; font-size: 26px; font-weight: 900; letter-spacing: 0.3em; }
.mnyra-go__row { margin-top: 16px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.mnyra-go__row .mnyra-go__cta { margin-top: 0; min-height: 48px; font-size: 13px; }
.mnyra-go__empty { padding: 32px 0; text-align: center; font-size: 14px; font-weight: 900; color: var(--go-muted); }
@media (min-width: 768px) {
  .mnyra-go__sheet { max-width: 560px; margin: 0 auto; }
}
@media (prefers-reduced-motion: reduce) {
  .mnyra-go__chip, .mnyra-go__action, .mnyra-go__x { transition: none; }
}
`,b=Object.freeze({brand:"Mnyra GO",mark:"⚡",close:"Mbyll",titleSearch:"Mnyra GO",titleResults:"Ofertat për ju",titleBooking:"Rezervimi juaj",partyQuestion:"Sa veta jeni?",categoryQuestion:"Çka dëshironi?",whenQuestion:"Kur?",budgetToggle:"+ Shto buxhet",budgetQuestion:"Buxheti",locationChange:"Ndrysho",submit:"Shiko ofertat",searching:"Po kërkojmë...",resultsHeadline:"lokale kanë oferta për ju",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",confirming:"Po konfirmohet...",sponsored:"Sponsored",onlyGo:"Vetëm me Mnyra GO",tableIncluded:"Tavolinë",emptyTitle:"Nuk gjetëm ofertë GO që përputhet tani.",emptySubtitle:"Lokale që mund t'ju pëlqejnë",doneTitle:"U krye 🎉",reservationConfirmed:"Tavolina është konfirmuar",claimConfirmed:"Oferta është e juaja",menu:"Shiko menunë",directions:"Udhëzime",code:"Kodi",cancel:"Anulo",cancelConfirm:"Dëshiron ta anulosh?",cancelYes:"Po, anuloje",cancelNo:"Jo",saveToAccount:"Ruaje në llogarinë tënde",signIn:"Hyr",errorTitle:"Mnyra GO është përkohësisht i padisponueshëm.",errorRetry:"Provo prapë",alternatives:"alternativa për ju",peopleSuffix:"persona",now:"Tani",back:"Ndrysho kërkimin"});function t(o=""){return String(o??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function z(o,{active:e=!1,attr:i="",value:c="",disabled:p=!1}={}){return`
    <button
      type="button"
      class="mnyra-go__chip"
      ${i?`${i}="${t(c)}"`:""}
      aria-pressed="${e?"true":"false"}"
      ${p?"disabled":""}
    >${t(o)}</button>
  `}function K(o,{nowMs:e=Date.now()}={}){const i=Date.parse(String(o||""));if(!Number.isFinite(i))return"";if(Math.abs(i-e)<900*1e3)return b.now;const c=new Date(i);return`Rreth ${String(c.getHours()).padStart(2,"0")}:${String(c.getMinutes()).padStart(2,"0")}`}function ce(o={},e=b){const i=Math.max(1,Math.trunc(Number(o.partySize)||2)),c=String(o.category||"all"),p=String(o.when||"now"),u=String(o.budget||""),y=!!o.showBudget||!!u;return`
    <div data-go-view="search">
      <h2 class="mnyra-go__q">${t(e.partyQuestion)}</h2>
      <div class="mnyra-go__chips mnyra-go__chips--party" role="group" aria-label="${t(e.partyQuestion)}">
        ${F.map(g=>z(g>=6?"6+":String(g),{active:i===g,attr:"data-go-party",value:String(g)})).join("")}
      </div>

      <h3 class="mnyra-go__q mnyra-go__q--sub">${t(e.categoryQuestion)}</h3>
      <div class="mnyra-go__chips" role="group" aria-label="${t(e.categoryQuestion)}">
        ${X.map(g=>z(g.label,{active:c===g.key,attr:"data-go-category",value:g.key})).join("")}
      </div>

      <h3 class="mnyra-go__q mnyra-go__q--sub">${t(e.whenQuestion)}</h3>
      <div class="mnyra-go__chips" role="group" aria-label="${t(e.whenQuestion)}">
        ${Z.map(g=>z(g.label,{active:p===g.key,attr:"data-go-when",value:g.key})).join("")}
      </div>
      ${p==="later"?`
        <input
          type="datetime-local"
          class="mnyra-go__field"
          data-go-when-input
          value="${t(o.laterValue||"")}"
          aria-label="${t(e.whenQuestion)}"
        />
      `:""}

      ${y?`
        <h3 class="mnyra-go__q mnyra-go__q--sub">${t(e.budgetQuestion)}</h3>
        <div class="mnyra-go__chips" role="group" aria-label="${t(e.budgetQuestion)}">
          ${ee.map(g=>z(g.label,{active:u===g.key,attr:"data-go-budget",value:g.key})).join("")}
        </div>
      `:`
        <button type="button" class="mnyra-go__ghost" data-go-budget-toggle>${t(e.budgetToggle)}</button>
      `}

      <div class="mnyra-go__place">
        <span>📍 ${t(o.city||"")}</span>
        <button type="button" class="mnyra-go__place-change" data-go-change-city>${t(e.locationChange)}</button>
      </div>

      <button type="button" class="mnyra-go__cta" data-go-submit>${t(e.submit)}</button>
    </div>
  `}function U(o={},{texts:e=b,busyOfferId:i="",nowMs:c=Date.now()}={}){const p=i&&i===o.offerId,u=Number.isFinite(Number(o.distanceKm))&&o.distanceKm!==null?`📍 ${Number(o.distanceKm).toFixed(1)} km`:"",y=o.isNow?e.now:K(o.expectedArrivalAt,{nowMs:c});return`
    <article class="mnyra-go__card" data-go-result="${t(o.offerId)}">
      <div class="mnyra-go__card-head">
        ${o.logoUrl?`<img class="mnyra-go__card-logo" src="${t(o.logoUrl)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`:'<div class="mnyra-go__card-logo"></div>'}
        <div class="min-w-0">
          <p class="mnyra-go__card-who">${t(o.businessName)} <span>${t(e.offering)}</span></p>
          ${o.sponsored?`<p class="mnyra-go__card-sponsored">${t(e.sponsored)}</p>`:""}
        </div>
      </div>

      <p class="mnyra-go__card-benefit">${t(o.benefitLabel)}</p>
      <p class="mnyra-go__card-for">${t(e.forGroup)}</p>

      <div class="mnyra-go__card-meta">
        <span>👥 ${t(`${o.partySize} ${e.peopleSuffix}`)}</span>
        ${y?`<span>🕐 ${t(y)}</span>`:""}
        ${u?`<span>${t(u)}</span>`:""}
        ${o.bookingType==="reservation"?`<span>🪑 ${t(e.tableIncluded)}</span>`:""}
      </div>

      <p class="mnyra-go__card-only">${t(e.onlyGo)}</p>

      <button
        type="button"
        class="mnyra-go__cta"
        data-go-accept="${t(o.offerId)}"
        data-go-restaurant="${t(o.restaurantId)}"
        ${p?"disabled":""}
      >${t(p?e.confirming:e.accept)}</button>
    </article>
  `}function ge(o={},e=b){const i=Array.isArray(o.results)?o.results:[],c=Number(o.nowMs)||Date.now();return i.length?`
    <div data-go-view="results">
      <h2 class="mnyra-go__q">${i.length} ${t(e.resultsHeadline)}</h2>
      ${o.notice?`<p class="mnyra-go__note">${t(o.notice)}</p>`:""}
      ${i.map(p=>U(p,{texts:e,busyOfferId:o.busyOfferId,nowMs:c})).join("")}
      <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-back>${t(e.back)}</button>
    </div>
  `:`
      <div data-go-view="results">
        <h2 class="mnyra-go__q">${t(e.emptyTitle)}</h2>
        <p class="mnyra-go__hint">${t(e.emptySubtitle)}</p>
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-back>${t(e.back)}</button>
      </div>
    `}function le(o={},e=b){const i=o.booking||{},c=i.type==="reservation",p=Number(o.nowMs)||Date.now(),u=K(i.expectedArrivalAt,{nowMs:p}),y=String(o.statusLabel||"").trim()||(c?e.reservationConfirmed:e.claimConfirmed);return o.confirmCancel?`
      <div data-go-view="booking">
        <h2 class="mnyra-go__q">${t(e.cancelConfirm)}</h2>
        <div class="mnyra-go__row">
          <button type="button" class="mnyra-go__cta" data-go-cancel-confirm>${t(e.cancelYes)}</button>
          <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-cancel-dismiss>${t(e.cancelNo)}</button>
        </div>
      </div>
    `:`
    <div data-go-view="booking">
      <p class="mnyra-go__done">${t(e.doneTitle)}</p>
      <p class="mnyra-go__done-name">${t(i.businessName||"")}</p>
      <p class="mnyra-go__card-for">${t(i.benefitLabel||"")}</p>

      <div class="mnyra-go__card-meta">
        <span>👥 ${t(`${i.partySize||1} ${e.peopleSuffix}`)}</span>
        ${u?`<span>🕐 ${t(u)}</span>`:""}
        ${i.city?`<span>📍 ${t(i.city)}</span>`:""}
      </div>

      <p class="mnyra-go__ok">✅ ${t(y)}</p>

      ${i.shortCode?`
        <div class="mnyra-go__code">
          <p class="mnyra-go__code-label">${t(e.code)}</p>
          <p class="mnyra-go__code-value">${t(i.shortCode)}</p>
        </div>
      `:""}

      <div class="mnyra-go__row">
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-menu>${t(e.menu)}</button>
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-directions>${t(e.directions)}</button>
      </div>

      ${o.canSignIn?`
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-signin>
          ${t(e.saveToAccount)} · ${t(e.signIn)}
        </button>
      `:""}

      <button type="button" class="mnyra-go__ghost" data-go-cancel>${t(e.cancel)}</button>
    </div>
  `}function de(o={},e=b){const i=String(o.error||"").trim()||e.errorTitle;return`
    <div data-go-view="error">
      <h2 class="mnyra-go__q">${t(i)}</h2>
      ${Array.isArray(o.alternatives)&&o.alternatives.length?`
        <p class="mnyra-go__hint">${o.alternatives.length} ${t(e.alternatives)}</p>
        ${o.alternatives.map(c=>U(c,{texts:e,nowMs:o.nowMs})).join("")}
      `:`
        <button type="button" class="mnyra-go__cta" data-go-retry>${t(e.errorRetry)}</button>
      `}
    </div>
  `}function pe(o={},e=b){const i=String(o.view||"search"),c=i==="results"?e.titleResults:i==="booking"?e.titleBooking:e.titleSearch,p=i==="search"?`<button type="button" class="mnyra-go__action" data-go-submit>${t(e.submit)}</button>`:'<span class="mnyra-go__action mnyra-go__action--ghost" aria-hidden="true"></span>';return`
    <header class="mnyra-go__head">
      <button type="button" class="mnyra-go__x" data-go-close aria-label="${t(e.close)}" title="${t(e.close)}">×</button>
      <div class="mnyra-go__title">${t(e.mark)} ${t(c)}</div>
      ${p}
    </header>
  `}function ue(o={}){const e={...b,...o.texts||{}},i=String(o.view||"search");let c="";return i==="loading"?c=`<div class="mnyra-go__empty">${t(e.searching)}</div>`:i==="results"?c=ge(o,e):i==="booking"?c=le(o,e):i==="error"?c=de(o,e):c=ce(o.form||{},e),`
    <div class="mnyra-go__sheet">
      ${pe(o,e)}
      <div class="mnyra-go__body" data-go-body>${c}</div>
    </div>
  `}const H="mnyraGoSticky";function fe(o,e){return typeof o=="function"?o:e}function me(o){if(!o?.body)return null;let e=o.getElementById("overlayRoot");return e||(e=o.createElement("div"),e.id="overlayRoot",e.style.position="relative",e.style.zIndex="200",e.style.isolation="isolate",o.body.appendChild(e)),e}function ye(o){if(!(!o||o.getElementById(Q)))try{const e=o.createElement("style");e.id=Q,e.textContent=se,o.head?.appendChild(e)}catch{}}function Oe({documentObj:o=null,windowObj:e=null,api:i=null,getCityFn:c=()=>"",getCoordsFn:p=()=>null,isSignedInFn:u=()=>!1,onAnalyticsFn:y=()=>{},openMenuFn:g=null,openSignInFn:C=null,nowFn:A=()=>Date.now()}={}){const m=o||(typeof document>"u"?null:document),T=e||(typeof window>"u"?null:window),v=i||re(),h=fe(y,()=>{}),n={open:!1,view:"search",form:{partySize:2,category:"all",when:"now",budget:"",showBudget:!1,laterValue:"",city:""},results:[],alternatives:[],booking:null,bookingToken:"",busyOfferId:"",confirmCancel:!1,error:"",notice:"",canSignIn:!1,nowMs:A()},x=new Map,V=new Set(["resource-exhausted","failed-precondition","not-found","invalid-argument","already-exists","permission-denied","unauthenticated"]);function j(a,s){const r=String(s?.code||"").trim();V.has(r)&&x.delete(a)}let f=null;function B(){if(!m)return null;if(f)return f;ye(m),f=m.createElement("div"),f.id=ie,f.className="mnyra-go modal-overlay",f.setAttribute("data-go-modal",""),f.setAttribute("role","dialog"),f.setAttribute("aria-modal","true"),f.setAttribute("aria-label","Mnyra GO"),f.setAttribute("data-modal-surface",P);try{f.style.setProperty("--modal-surface",P)}catch{}return f}function d(){const a=B();if(!a)return;if(n.nowMs=A(),!n.open){try{a.remove()}catch{}E();return}const s=me(m);s&&a.parentNode!==s&&s.appendChild(a),a.innerHTML=ue(n),E()}function E(){if(!m)return;let a=m.getElementById(H);const s=n.open?"":te({activeBookings:O()});if(!s){a&&a.remove();return}a||(a=m.createElement("div"),a.id=H,m.body.appendChild(a)),a.innerHTML=s}function G(){n.open=!1,n.busyOfferId="",n.confirmCancel=!1,d()}function $(a){n.view="error",n.error=String(a?.message||"").trim(),n.alternatives=Array.isArray(a?.alternatives)?a.alternatives:[],n.busyOfferId="",d()}function q(){const a=n.form,s={now:0,in30:30,in60:60};let r=A();if(a.when==="later"&&a.laterValue){const _=Date.parse(a.laterValue);Number.isFinite(_)&&(r=_)}else r+=(s[a.when]||0)*60*1e3;const l=p();return{city:a.city||c(),partySize:a.partySize,category:a.category,requestedAt:r,budget:a.budget,lat:l?.lat,lng:l?.lng}}async function M(){n.open=!0,n.view="search",n.error="",n.notice="",n.form.city=n.form.city||c(),n.canSignIn=!u(),d(),h("go_open",{}),v.ensureGuestSession().catch(()=>{})}async function N(){n.view="loading",n.error="",d();const a=q();h("go_search",{partySize:a.partySize,category:a.category});try{const s=await v.search(a);n.results=s.results,n.view="results",n.notice="",d(),h("go_results",{count:s.results.length})}catch(s){$(s)}}async function L(a="",s=""){if(!(!a||n.busyOfferId)){n.busyOfferId=a,n.error="",d(),x.has(a)||x.set(a,oe(T?.crypto)),h("go_offer_accept",{offerId:a});try{const r=await v.createBooking({offerId:a,restaurantId:s,request:q(),idempotencyKey:x.get(a)}),l=r?.booking||null;if(!l)throw new Error("go-booking-missing");const _=String(r.bookingToken||"").trim()||O().find(S=>S.bookingId===l.id)?.bookingToken||"";ne({bookingId:l.id,bookingToken:_,shortCode:l.shortCode,restaurantId:l.restaurantId,businessName:l.businessName,benefitLabel:l.benefitLabel,type:l.type,status:l.status,partySize:l.partySize,expectedArrivalAt:l.expectedArrivalAt}),n.booking=l,n.bookingToken=_,n.view="booking",n.busyOfferId="",n.canSignIn=!u(),d(),h("go_booking_created",{offerId:a,type:l.type})}catch(r){if(r?.soldOut){n.view="error",n.error=r.message,n.alternatives=r.alternatives||[],n.busyOfferId="",j(a,r),d();return}j(a,r),$(r)}}}async function Y(a=""){const s=O().find(r=>r.bookingId===a)||O()[0]||null;if(!s)return M();n.open=!0,n.view="loading",n.confirmCancel=!1,d();try{const r=await v.getBooking(s.bookingToken);if(!r)throw new Error("go-booking-missing");ae(r),n.booking={...s,...r},n.bookingToken=s.bookingToken,n.view="booking",n.canSignIn=!u(),d()}catch(r){if(r?.code==="not-found"){D(a),n.view="search",n.notice="",d();return}$(r)}}async function J(){const a=n.bookingToken;if(a){n.view="loading",d();try{const s=await v.cancelBooking(a);D(n.booking?.id||""),h("go_cancel",{bookingId:n.booking?.id||""}),n.booking=s,n.confirmCancel=!1,n.view="search",n.form.city=n.form.city||c(),d()}catch(s){$(s)}}}function w(a={}){Object.assign(n.form,a),d()}function W(){const a=B();!a||a.dataset.goBound==="1"||(a.dataset.goBound="1",a.addEventListener("click",s=>{const r=s.target;if(!r||typeof r.closest!="function")return;if(r.closest("[data-go-close]"))return G();const l=r.closest("[data-go-party]");if(l)return w({partySize:Number(l.getAttribute("data-go-party"))||2});const _=r.closest("[data-go-category]");if(_)return w({category:_.getAttribute("data-go-category")||"all"});const S=r.closest("[data-go-when]");if(S)return w({when:S.getAttribute("data-go-when")||"now"});const R=r.closest("[data-go-budget]");if(R){const k=R.getAttribute("data-go-budget")||"";return w({budget:n.form.budget===k?"":k})}if(r.closest("[data-go-budget-toggle]"))return w({showBudget:!0});if(r.closest("[data-go-submit]")||r.closest("[data-go-retry]"))return N();if(r.closest("[data-go-back]"))return n.view="search",d();const I=r.closest("[data-go-accept]");if(I)return L(I.getAttribute("data-go-accept")||"",I.getAttribute("data-go-restaurant")||"");if(r.closest("[data-go-cancel-dismiss]"))return n.confirmCancel=!1,d();if(r.closest("[data-go-cancel-confirm]"))return J();if(r.closest("[data-go-cancel]"))return n.confirmCancel=!0,d();if(r.closest("[data-go-menu]")&&g)return g(n.booking?.restaurantId||"");if(r.closest("[data-go-signin]")&&C)return C();if(r.closest("[data-go-directions]")){const k=encodeURIComponent([n.booking?.businessName,n.booking?.city].filter(Boolean).join(" "));T&&k&&T.open(`https://www.google.com/maps/search/?api=1&query=${k}`,"_blank","noopener");return}}),a.addEventListener("change",s=>{const r=s.target;r&&typeof r.matches=="function"&&r.matches("[data-go-when-input]")&&(n.form.laterValue=r.value||"")}),m&&m.addEventListener("keydown",s=>{n.open&&s.key==="Escape"&&G()}))}return{state:n,open:(a="search",s="")=>(W(),a==="booking"?Y(s):M()),close:G,refreshSticky:E,__render:d,__submitSearch:N,__acceptOffer:L}}export{Oe as createGoRuntimeController};
