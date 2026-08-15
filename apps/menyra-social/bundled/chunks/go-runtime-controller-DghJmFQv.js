import{G as J,b as W,d as X,e as Z}from"./domain-dashboard-Dcq0sLMI.js";import{aF as F,aG as T,aH as tt,aI as et,aJ as nt,aK as z}from"./domain-feed-social-eager-DcfYYARs.js";import{createGoApiClient as at}from"./go-api-client-BeEcnR72.js";import"./domain-auth-Bcb0uRsx.js";import"./domain-analytics-D19jvtL7.js";import"./domain-business-accounts-D8NpUhi6.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-media-eager-DAUyCk2O.js";import"./domain-menu-eager-DyfIj5gr.js";const y=Object.freeze({brand:"MNYRA GO",mark:"⚡",close:"Mbyll",partyQuestion:"Sa veta jeni?",categoryQuestion:"Çka dëshironi?",whenQuestion:"Kur?",budgetToggle:"+ Shto buxhet",budgetQuestion:"Buxheti",locationLabel:"Vendndodhja",locationChange:"Ndrysho",submit:"Shiko ofertat",searching:"Po kërkojmë...",resultsHeadline:"lokale kanë oferta për ju",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",confirming:"Po konfirmohet...",sponsored:"Sponsored",onlyGo:"Vetëm me Mnyra GO",tableIncluded:"Tavolinë",emptyTitle:"Nuk gjetëm ofertë GO që përputhet tani.",emptySubtitle:"Lokale që mund t'ju pëlqejnë",doneTitle:"U krye 🎉",reservationConfirmed:"Tavolina është konfirmuar",claimConfirmed:"Oferta është e juaja",menu:"Shiko menunë",directions:"Udhëzime",code:"Kodi",cancel:"Anulo",cancelConfirm:"Dëshiron ta anulosh?",cancelYes:"Po, anuloje",cancelNo:"Jo",saveToAccount:"Ruaje në llogarinë tënde",signIn:"Hyr",errorTitle:"Mnyra GO është përkohësisht i padisponueshëm.",errorRetry:"Provo prapë",soldOut:"Kjo ofertë sapo u plotësua.",alternatives:"alternativa për ju",peopleSuffix:"persona",now:"Tani"});function a(t=""){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function I(t,{active:e=!1,attr:i="",value:l="",disabled:g=!1}={}){return`
    <button
      type="button"
      ${i?`${i}="${a(l)}"`:""}
      aria-pressed="${e?"true":"false"}"
      ${g?"disabled":""}
      class="min-h-[44px] rounded-2xl px-4 py-2.5 text-sm font-black transition-colors ${e?"bg-slate-900 text-white":"bg-slate-100 text-slate-600"}"
    >${a(t)}</button>
  `}function K(t,{nowMs:e=Date.now()}={}){const i=Date.parse(String(t||""));if(!Number.isFinite(i))return"";if(Math.abs(i-e)<900*1e3)return y.now;const l=new Date(i);return`Rreth ${String(l.getHours()).padStart(2,"0")}:${String(l.getMinutes()).padStart(2,"0")}`}function ot(t={},e=y){const i=Math.max(1,Math.trunc(Number(t.partySize)||2)),l=String(t.category||"all"),g=String(t.when||"now"),p=String(t.budget||""),f=!!t.showBudget||!!p;return`
    <div data-go-view="search">
      <h2 class="text-xl font-black tracking-tight text-slate-900">${a(e.partyQuestion)}</h2>
      <div class="mt-3 grid grid-cols-6 gap-2" role="group" aria-label="${a(e.partyQuestion)}">
        ${J.map(c=>I(c>=6?"6+":String(c),{active:i===c,attr:"data-go-party",value:String(c)})).join("")}
      </div>

      <h3 class="mt-6 text-sm font-black text-slate-900">${a(e.categoryQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="${a(e.categoryQuestion)}">
        ${W.map(c=>I(c.label,{active:l===c.key,attr:"data-go-category",value:c.key})).join("")}
      </div>

      <h3 class="mt-6 text-sm font-black text-slate-900">${a(e.whenQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="${a(e.whenQuestion)}">
        ${X.map(c=>I(c.label,{active:g===c.key,attr:"data-go-when",value:c.key})).join("")}
      </div>
      ${g==="later"?`
        <label class="mt-3 block">
          <span class="sr-only">${a(e.whenQuestion)}</span>
          <input
            type="datetime-local"
            data-go-when-input
            value="${a(t.laterValue||"")}"
            class="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
          />
        </label>
      `:""}

      ${f?`
        <h3 class="mt-6 text-sm font-black text-slate-900">${a(e.budgetQuestion)}</h3>
        <div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="${a(e.budgetQuestion)}">
          ${Z.map(c=>I(c.label,{active:p===c.key,attr:"data-go-budget",value:c.key})).join("")}
        </div>
      `:`
        <button type="button" data-go-budget-toggle class="mt-5 text-[12px] font-black text-slate-400">
          ${a(e.budgetToggle)}
        </button>
      `}

      <div class="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
        <span class="text-sm font-black text-slate-900">📍 ${a(t.city||"")}</span>
        <button type="button" data-go-change-city class="text-[11px] font-black uppercase tracking-widest text-slate-400">
          ${a(e.locationChange)}
        </button>
      </div>

      <button
        type="button"
        data-go-submit
        class="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-black text-white"
      >${a(e.submit)}</button>
    </div>
  `}function q(t={},{texts:e=y,busyOfferId:i="",nowMs:l=Date.now()}={}){const g=i&&i===t.offerId,p=Number.isFinite(Number(t.distanceKm))&&t.distanceKm!==null?`📍 ${Number(t.distanceKm).toFixed(1)} km`:"",f=t.isNow?e.now:K(t.expectedArrivalAt,{nowMs:l});return`
    <article class="rounded-[1.75rem] border border-slate-100 bg-white p-4" data-go-result="${a(t.offerId)}">
      <div class="flex items-center gap-3">
        ${t.logoUrl?`<img src="${a(t.logoUrl)}" alt="" width="40" height="40" loading="lazy" decoding="async" class="h-10 w-10 rounded-2xl object-cover" />`:'<div class="h-10 w-10 rounded-2xl bg-slate-100"></div>'}
        <div class="min-w-0">
          <p class="truncate text-[13px] font-black text-slate-900">
            ${a(t.businessName)} <span class="font-semibold text-slate-400">${a(e.offering)}</span>
          </p>
          ${t.sponsored?`<p class="text-[10px] font-black uppercase tracking-widest text-slate-300">${a(e.sponsored)}</p>`:""}
        </div>
      </div>

      <p class="mt-3 text-2xl font-black tracking-tight text-slate-900">${a(t.benefitLabel)}</p>
      <p class="text-[13px] font-semibold text-slate-500">${a(e.forGroup)}</p>

      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-bold text-slate-500">
        <span>👥 ${a(`${t.partySize} ${e.peopleSuffix}`)}</span>
        ${f?`<span>🕐 ${a(f)}</span>`:""}
        ${p?`<span>${a(p)}</span>`:""}
        ${t.bookingType==="reservation"?`<span>🪑 ${a(e.tableIncluded)}</span>`:""}
      </div>

      <p class="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-300">${a(e.onlyGo)}</p>

      <button
        type="button"
        data-go-accept="${a(t.offerId)}"
        data-go-restaurant="${a(t.restaurantId)}"
        ${g?"disabled":""}
        class="mt-3 w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white disabled:opacity-60"
      >${a(g?e.confirming:e.accept)}</button>
    </article>
  `}function rt(t={},e=y){const i=Array.isArray(t.results)?t.results:[],l=Number(t.nowMs)||Date.now();return i.length?`
    <div data-go-view="results">
      <h2 class="text-lg font-black tracking-tight text-slate-900">
        ${i.length} ${a(e.resultsHeadline)}
      </h2>
      ${t.notice?`<p class="mt-2 rounded-2xl bg-amber-50 px-4 py-3 text-[13px] font-bold text-amber-700">${a(t.notice)}</p>`:""}
      <div class="mt-4 space-y-3">
        ${i.map(g=>q(g,{texts:e,busyOfferId:t.busyOfferId,nowMs:l})).join("")}
      </div>
      <button type="button" data-go-back class="mt-5 w-full rounded-2xl bg-slate-100 px-5 py-3.5 text-sm font-black text-slate-700">
        ${a(e.whenQuestion)} / ${a(e.partyQuestion)}
      </button>
    </div>
  `:`
      <div data-go-view="results">
        <h2 class="text-lg font-black tracking-tight text-slate-900">${a(e.emptyTitle)}</h2>
        <p class="mt-2 text-[13px] font-semibold text-slate-500">${a(e.emptySubtitle)}</p>
        <button type="button" data-go-back class="mt-5 w-full rounded-2xl bg-slate-100 px-5 py-3.5 text-sm font-black text-slate-700">
          ${a(e.submit)}
        </button>
      </div>
    `}function it(t={},e=y){const i=t.booking||{},l=i.type==="reservation",g=Number(t.nowMs)||Date.now(),p=K(i.expectedArrivalAt,{nowMs:g}),f=String(t.statusLabel||"").trim()||(l?e.reservationConfirmed:e.claimConfirmed);return t.confirmCancel?`
      <div data-go-view="booking">
        <h2 class="text-lg font-black tracking-tight text-slate-900">${a(e.cancelConfirm)}</h2>
        <div class="mt-5 grid grid-cols-2 gap-3">
          <button type="button" data-go-cancel-confirm class="rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white">
            ${a(e.cancelYes)}
          </button>
          <button type="button" data-go-cancel-dismiss class="rounded-2xl bg-slate-100 px-5 py-3.5 text-sm font-black text-slate-700">
            ${a(e.cancelNo)}
          </button>
        </div>
      </div>
    `:`
    <div data-go-view="booking">
      <p class="text-2xl font-black tracking-tight text-slate-900">${a(e.doneTitle)}</p>
      <p class="mt-4 text-lg font-black text-slate-900">${a(i.businessName||"")}</p>
      <p class="text-[15px] font-bold text-slate-600">${a(i.benefitLabel||"")}</p>

      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-bold text-slate-500">
        <span>👥 ${a(`${i.partySize||1} ${e.peopleSuffix}`)}</span>
        ${p?`<span>🕐 ${a(p)}</span>`:""}
        ${i.city?`<span>📍 ${a(i.city)}</span>`:""}
      </div>

      <p class="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-[13px] font-black text-emerald-700">
        ✅ ${a(f)}
      </p>

      ${i.shortCode?`
        <div class="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">${a(e.code)}</p>
          <p class="mt-1 text-2xl font-black tracking-[0.3em] text-slate-900">${a(i.shortCode)}</p>
        </div>
      `:""}

      <div class="mt-4 grid grid-cols-2 gap-2">
        <button type="button" data-go-menu class="rounded-2xl bg-slate-100 px-4 py-3 text-[12px] font-black text-slate-700">
          ${a(e.menu)}
        </button>
        <button type="button" data-go-directions class="rounded-2xl bg-slate-100 px-4 py-3 text-[12px] font-black text-slate-700">
          ${a(e.directions)}
        </button>
      </div>

      ${t.canSignIn?`
        <button type="button" data-go-signin class="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[12px] font-black text-slate-600">
          ${a(e.saveToAccount)} · ${a(e.signIn)}
        </button>
      `:""}

      <button type="button" data-go-cancel class="mt-4 w-full text-[12px] font-black text-slate-400">
        ${a(e.cancel)}
      </button>
    </div>
  `}function st(t={},e=y){const i=String(t.error||"").trim()||e.errorTitle;return`
    <div data-go-view="error">
      <h2 class="text-lg font-black tracking-tight text-slate-900">${a(i)}</h2>
      ${Array.isArray(t.alternatives)&&t.alternatives.length?`
        <p class="mt-4 text-[13px] font-black text-slate-500">
          ${t.alternatives.length} ${a(e.alternatives)}
        </p>
        <div class="mt-3 space-y-3">
          ${t.alternatives.map(l=>q(l,{texts:e,nowMs:t.nowMs})).join("")}
        </div>
      `:`
        <button type="button" data-go-retry class="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white">
          ${a(e.errorRetry)}
        </button>
      `}
    </div>
  `}function lt(t=y){return`
    <div data-go-view="loading" class="py-10 text-center">
      <p class="text-sm font-black text-slate-400">${a(t.searching)}</p>
    </div>
  `}function ct(t={}){if(!t||!t.open)return"";const e={...y,...t.texts||{}},i=String(t.view||"search");let l="";return i==="loading"?l=lt(e):i==="results"?l=rt(t,e):i==="booking"?l=it(t,e):i==="error"?l=st(t,e):l=ot(t.form||{},e),`
    <div class="fixed inset-0 z-[75]" data-go-modal role="dialog" aria-modal="true" aria-label="${a(e.brand)}">
      <div class="absolute inset-0 bg-slate-900/50" data-go-close></div>
      <div class="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-[2.5rem] bg-white px-5 pb-8 pt-4 md:inset-0 md:m-auto md:h-fit md:max-w-md md:rounded-[2.5rem]">
        <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 md:hidden"></div>
        <div class="mb-4 flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span aria-hidden="true">${a(e.mark)}</span>${a(e.brand)}
          </span>
          <button type="button" data-go-close class="min-h-[44px] px-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
            ${a(e.close)}
          </button>
        </div>
        ${l}
      </div>
    </div>
  `}const D="mnyraGoRoot",V="mnyraGoSticky";function dt(t,e){return typeof t=="function"?t:e}function ht({documentObj:t=null,windowObj:e=null,api:i=null,getCityFn:l=()=>"",getCoordsFn:g=()=>null,isSignedInFn:p=()=>!1,onAnalyticsFn:f=()=>{},openMenuFn:c=null,openSignInFn:j=null,nowFn:O=()=>Date.now()}={}){const b=t||(typeof document>"u"?null:document),A=e||(typeof window>"u"?null:window),k=i||at(),x=dt(f,()=>{}),n={open:!1,view:"search",form:{partySize:2,category:"all",when:"now",budget:"",showBudget:!1,laterValue:"",city:""},results:[],alternatives:[],booking:null,bookingToken:"",busyOfferId:"",confirmCancel:!1,error:"",notice:"",canSignIn:!1,nowMs:O()},w=new Map,H=new Set(["resource-exhausted","failed-precondition","not-found","invalid-argument","already-exists","permission-denied","unauthenticated"]);function N(o,s){const r=String(s?.code||"").trim();H.has(r)&&w.delete(o)}function _(){if(!b)return null;let o=b.getElementById(D);return o||(o=b.createElement("div"),o.id=D,b.body.appendChild(o)),o}function u(){const o=_();o&&(n.nowMs=O(),o.innerHTML=ct(n),B())}function B(){if(!b)return;let o=b.getElementById(V);const s=n.open?"":et({activeBookings:T()});if(!s){o&&o.remove();return}o||(o=b.createElement("div"),o.id=V,b.body.appendChild(o)),o.innerHTML=s}function C(){n.open=!1,n.busyOfferId="",n.confirmCancel=!1,u()}function $(o){n.view="error",n.error=String(o?.message||"").trim(),n.alternatives=Array.isArray(o?.alternatives)?o.alternatives:[],n.busyOfferId="",u()}function E(){const o=n.form,s={now:0,in30:30,in60:60};let r=O();if(o.when==="later"&&o.laterValue){const m=Date.parse(o.laterValue);Number.isFinite(m)&&(r=m)}else r+=(s[o.when]||0)*60*1e3;const d=g();return{city:o.city||l(),partySize:o.partySize,category:o.category,requestedAt:r,budget:o.budget,lat:d?.lat,lng:d?.lng}}async function M(){n.open=!0,n.view="search",n.error="",n.notice="",n.form.city=n.form.city||l(),n.canSignIn=!p(),u(),x("go_open",{}),k.ensureGuestSession().catch(()=>{})}async function L(){n.view="loading",n.error="",u();const o=E();x("go_search",{partySize:o.partySize,category:o.category});try{const s=await k.search(o);n.results=s.results,n.view="results",n.notice="",u(),x("go_results",{count:s.results.length})}catch(s){$(s)}}async function R(o="",s=""){if(!(!o||n.busyOfferId)){n.busyOfferId=o,n.error="",u(),w.has(o)||w.set(o,F(A?.crypto)),x("go_offer_accept",{offerId:o});try{const r=await k.createBooking({offerId:o,restaurantId:s,request:E(),idempotencyKey:w.get(o)}),d=r?.booking||null;if(!d)throw new Error("go-booking-missing");const m=String(r.bookingToken||"").trim()||T().find(S=>S.bookingId===d.id)?.bookingToken||"";tt({bookingId:d.id,bookingToken:m,shortCode:d.shortCode,restaurantId:d.restaurantId,businessName:d.businessName,benefitLabel:d.benefitLabel,type:d.type,status:d.status,partySize:d.partySize,expectedArrivalAt:d.expectedArrivalAt}),n.booking=d,n.bookingToken=m,n.view="booking",n.busyOfferId="",n.canSignIn=!p(),u(),x("go_booking_created",{offerId:o,type:d.type})}catch(r){if(r?.soldOut){n.view="error",n.error=r.message,n.alternatives=r.alternatives||[],n.busyOfferId="",N(o,r),u();return}N(o,r),$(r)}}}async function P(o=""){const s=T().find(r=>r.bookingId===o)||T()[0]||null;if(!s)return M();n.open=!0,n.view="loading",n.confirmCancel=!1,u();try{const r=await k.getBooking(s.bookingToken);if(!r)throw new Error("go-booking-missing");nt(r),n.booking={...s,...r},n.bookingToken=s.bookingToken,n.view="booking",n.canSignIn=!p(),u()}catch(r){if(r?.code==="not-found"){z(o),n.view="search",n.notice="",u();return}$(r)}}async function U(){const o=n.bookingToken;if(o){n.view="loading",u();try{const s=await k.cancelBooking(o);z(n.booking?.id||""),x("go_cancel",{bookingId:n.booking?.id||""}),n.booking=s,n.confirmCancel=!1,n.view="search",n.form.city=n.form.city||l(),u()}catch(s){$(s)}}}function h(o={}){Object.assign(n.form,o),u()}function Y(){const o=_();!o||o.dataset.goBound==="1"||(o.dataset.goBound="1",o.addEventListener("click",s=>{const r=s.target;if(!r||typeof r.closest!="function")return;if(r.closest("[data-go-close]"))return C();const d=r.closest("[data-go-party]");if(d)return h({partySize:Number(d.getAttribute("data-go-party"))||2});const m=r.closest("[data-go-category]");if(m)return h({category:m.getAttribute("data-go-category")||"all"});const S=r.closest("[data-go-when]");if(S)return h({when:S.getAttribute("data-go-when")||"now"});const Q=r.closest("[data-go-budget]");if(Q){const v=Q.getAttribute("data-go-budget")||"";return h({budget:n.form.budget===v?"":v})}if(r.closest("[data-go-budget-toggle]"))return h({showBudget:!0});if(r.closest("[data-go-submit]")||r.closest("[data-go-retry]"))return L();if(r.closest("[data-go-back]"))return n.view="search",u();const G=r.closest("[data-go-accept]");if(G)return R(G.getAttribute("data-go-accept")||"",G.getAttribute("data-go-restaurant")||"");if(r.closest("[data-go-cancel-dismiss]"))return n.confirmCancel=!1,u();if(r.closest("[data-go-cancel-confirm]"))return U();if(r.closest("[data-go-cancel]"))return n.confirmCancel=!0,u();if(r.closest("[data-go-menu]")&&c)return c(n.booking?.restaurantId||"");if(r.closest("[data-go-signin]")&&j)return j();if(r.closest("[data-go-directions]")){const v=encodeURIComponent([n.booking?.businessName,n.booking?.city].filter(Boolean).join(" "));A&&v&&A.open(`https://www.google.com/maps/search/?api=1&query=${v}`,"_blank","noopener");return}}),o.addEventListener("change",s=>{const r=s.target;r&&typeof r.matches=="function"&&r.matches("[data-go-when-input]")&&(n.form.laterValue=r.value||"")}),b&&b.addEventListener("keydown",s=>{n.open&&s.key==="Escape"&&C()}))}return{state:n,open:(o="search",s="")=>(Y(),o==="booking"?P(s):M()),close:C,refreshSticky:B,__render:u,__submitSearch:L,__acceptOffer:R}}export{ht as createGoRuntimeController};
