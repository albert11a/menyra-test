const x=Object.freeze({restaurants:Object.freeze({key:"restaurants",title:"Restaurants",emptyTitle:"Noch keine Restaurants",emptyBody:"Keine passenden Profile gefunden.",icon:"utensils",typeKeys:Object.freeze(["restaurant","cafe","coffee","fastfood","food"])}),travel:Object.freeze({key:"travel",title:"Travel",emptyTitle:"Noch keine Travel-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"plane",typeKeys:Object.freeze(["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"])}),shopping:Object.freeze({key:"shopping",title:"Shopping",emptyTitle:"Noch keine Shopping-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"shopping-bag",typeKeys:Object.freeze(["ecommerce"])})}),H=new Map;Object.values(x).forEach(e=>{e.typeKeys.forEach(t=>{H.set(t,e.key)})});const V=8,$=24,g="#00cce5",D=Object.freeze([Object.freeze(["tirana","tirane"]),Object.freeze(["durres","durresi"]),Object.freeze(["vlora","vlore"]),Object.freeze(["shkoder","shkodra"]),Object.freeze(["elbasan","elbasani"]),Object.freeze(["fier","fieri"]),Object.freeze(["korce","korca"]),Object.freeze(["sarande","saranda"]),Object.freeze(["berat","berati"]),Object.freeze(["gjirokaster","gjirokastra"]),Object.freeze(["kukes","kukesi"]),Object.freeze(["lezhe","lezha"]),Object.freeze(["pogradec","pogradeci"]),Object.freeze(["kruje","kruja"]),Object.freeze(["lushnje","lushnja"]),Object.freeze(["himare","himara"])]);function N(e,t=()=>""){return typeof e=="function"?e:t}function c(e=""){return String(e||"").trim()}function v(e=""){const t=c(e).toLowerCase();return t?t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):""}function U(e=""){const t=v(e);if(!t)return[];const n=new Set([t]);return D.forEach(a=>{const s=a.map(v).filter(Boolean);s.includes(t)&&s.forEach(i=>n.add(i))}),Array.from(n)}function L(e=""){const t=v(e);return t==="restaurant"?"restaurants":["hotel","hotels","motel","motels"].includes(t)?"travel":["shop","ecommerce","e_commerce","shopping"].includes(t)?"shopping":x[t]?t:"restaurants"}function B(e=""){const t=v(e);return t?t==="e_commerce"||t==="online_shop"||t==="onlineshop"||t==="shop"||t==="store"?"ecommerce":t==="coffee"||t==="coffe"||t==="kaffee"?"cafe":t==="fast_food"||t==="snack"||t==="imbiss"?"fastfood":t==="hotels"?"hotel":t==="motels"?"motel":t:""}function q(e={}){return[e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType]}function T(e={},{normalizeRestaurantType:t,normalizeLeadTypeKey:n}={}){const a=typeof t=="function"?t:(l=>l),s=typeof n=="function"?n:(l=>l),i=q(e);for(const l of i){const r=B(a(l)||s(l)||l);if(r)return r}const o=[e.name,e.restaurantName,e.businessName,e.description,e.bio].map(l=>c(l).toLowerCase()).join(" ");return/\bhotel(s)?\b/.test(o)?"hotel":/\bmotel(s)?\b/.test(o)?"motel":/\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b/.test(o)?"cafe":/\bfast\s*food\b|\bfastfood\b/.test(o)?"fastfood":/\be-?commerce\b|\bonline\s*shop\b/.test(o)?"ecommerce":/\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b/.test(o)?"restaurant":""}function G(e={},t={}){const n=T(e,t);return H.get(n)||""}function y(e={}){return c(e.canonicalRestaurantId||e.restaurantId||e.id||e.landingRestaurantId||"")}function h(e={}){return c(e.name||e.restaurantName||e.businessName||e.displayName||"Business")}function w(e={}){const t=c(e.city||e.locationCity||e.primaryCity),n=c(e.address||e.location||e.primaryAddress);return t&&n&&t!==n?`${t} - ${n}`:t||n||"Standort folgt"}function Y(e={}){const t=[e.id,e.restaurantId,e.canonicalRestaurantId,e.publicSlug,e.landingSlug,e.handle,e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType,e.city,e.locationCity,e.primaryCity,e.address,e.location,e.primaryAddress,e.country,e.region,e.district,e.name,e.restaurantName,e.businessName,e.displayName,e.description,e.bio,e.about];return Array.isArray(e.locations)&&e.locations.forEach(n=>{!n||typeof n!="object"||t.push(n.city,n.address,n.country,n.region,n.name)}),t}function J(e={},t=""){const n=U(t);if(!n.length)return!0;const a=Y(e).map(v).filter(Boolean).join("_");return n.some(s=>{const i=s.split("_").filter(Boolean);return a.includes(s)?!0:i.length>0&&i.every(o=>a.includes(o))})}function j(e={}){const t=[[e.lat,e.lng],[e.latitude,e.longitude],[e.gpsLat,e.gpsLng],[e.geo?.lat,e.geo?.lng],[e.geo?.latitude,e.geo?.longitude],[e.coords?.lat,e.coords?.lng],[e.coords?.latitude,e.coords?.longitude],[e.location?.lat,e.location?.lng]];for(const[n,a]of t){const s=Number(String(n??"").replace(",",".")),i=Number(String(a??"").replace(",","."));if(Number.isFinite(s)&&Number.isFinite(i)&&Math.abs(s)<=90&&Math.abs(i)<=180){if(Math.abs(s)<1e-6&&Math.abs(i)<1e-6)continue;return{lat:s,lng:i}}}if(Array.isArray(e.locations))for(const n of e.locations){const a=j(n||{});if(a)return a}return null}function Q(e={}){const t=e.openingHours||e.openHours||e.hours||e.businessHours||e.workingHours||"";if(typeof t=="string"&&c(t))return c(t);if(t&&typeof t=="object"){const n=Object.values(t).map(c).filter(Boolean);if(n.length)return n[0]}return"Oeffnungszeiten folgen"}function W(e={}){return c(e.description||e.bio||e.about||e.shortDescription||"")}function _(e={}){const t=Number(e.rating??e.avgRating??e.score??e.publicRating??0);return!Number.isFinite(t)||t<=0?"":Math.min(5,Math.max(1,t)).toFixed(1)}function z(e={},{getOptimizedImageUrl:t,resolveRestaurantLogo:n,placeholderImage:a=""}={}){const s=y(e),i=c(e.logoUrl||e.logo||e.logoURL||e.heroUrl||e.coverUrl||e.imageUrl||e.img||""),l=(s&&typeof n=="function"?c(n(s,i,"medium")):i)||i||a;return(typeof t=="function"?c(t(l,"medium")):l)||a||""}function X(e={}){const t=Number(e.rating??e.avgRating??e.publicRating??0),n=Number(e.score??e.publicScore??0),a=Number(e.followersCount??e.followerCount??0),s=Number(e.postsCount??e.postCount??0),i=Number(e.updatedAt?.seconds||e.createdAt?.seconds||0);return(Number.isFinite(t)?t*1e3:0)+(Number.isFinite(n)?n:0)+(Number.isFinite(a)?Math.min(a,500):0)+(Number.isFinite(s)?Math.min(s,200):0)+(Number.isFinite(i)?Math.min(i/1e5,100):0)}function Z(e={},t={}){const n=new Map,a=(s={})=>{if(!s||typeof s!="object")return;const i=y(s);if(!i)return;const o=n.get(i)||{};n.set(i,{...o,...s,id:i})};return(Array.isArray(e.bootstrapRestaurantPreview)?e.bootstrapRestaurantPreview:[]).forEach(a),(Array.isArray(e.restaurants)?e.restaurants:[]).forEach(a),Array.from(n.values()).map(s=>({...s,__marketplaceSection:G(s,t),__marketplaceScore:X(s)})).filter(s=>s.__marketplaceSection).sort((s,i)=>i.__marketplaceScore-s.__marketplaceScore||h(s).localeCompare(h(i)))}function C(e={},t="",n={}){const a=L(t);return Z(e,n).filter(s=>s.__marketplaceSection===a)}function S(e="",t="",{escapeHtml:n,isPlaceholderUrl:a,extraClass:s=""}={}){const i=c(e),o=!i||typeof a=="function"&&a(i);return`
    <img
      src="${n(i)}"
      alt="${n(t)}"
      loading="lazy"
      class="w-full h-full object-cover bg-slate-100 ${s}"
      ${o?'data-placeholder-image="true"':""}
    />
  `}function ee(e={},t={}){const n=t.escapeHtml,a=t.icon,s=h(e),i=y(e),o=z(e,t),l=_(e),r=w(e);return`
    <button type="button" data-marketplace-open-business="${n(i)}" class="shrink-0 w-44 text-left rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <div class="h-28 bg-slate-100 overflow-hidden">
        ${S(o,s,t)}
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest line-clamp-1">${n(e.__marketplaceTypeLabel||"Top")}</span>
          ${l?`<span class="text-[10px] font-black text-amber-500 flex items-center gap-1">${a("star","w-3 h-3 fill-current")} ${n(l)}</span>`:""}
        </div>
        <h3 class="text-sm font-black text-slate-900 leading-tight line-clamp-2">${n(s)}</h3>
        <p class="mt-2 text-[10px] font-bold text-slate-400 leading-4 line-clamp-1">${n(r)}</p>
      </div>
    </button>
  `}function M(e={},t={}){const n=t.escapeHtml,a=t.icon,s=h(e),i=y(e),o=z(e,t),l=_(e),r=w(e),u=Q(e),m=W(e),b=c(e.__marketplaceTypeLabel||e.type||e.customerType||"");return`
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <button type="button" data-marketplace-open-business="${n(i)}" class="w-full text-left active:scale-[0.99] transition-transform">
        <div class="h-48 bg-slate-100 overflow-hidden">
          ${S(o,s,t)}
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              ${b?`<p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">${n(b)}</p>`:""}
              <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight">${n(s)}</h3>
            </div>
            ${l?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${a("star","w-3 h-3 fill-current")} ${n(l)}</span>`:""}
          </div>
          ${m?`<p class="mt-3 text-xs font-semibold text-slate-500 leading-5 line-clamp-2">${n(m)}</p>`:""}
          <div class="mt-4 grid grid-cols-1 gap-2 text-[11px] font-bold text-slate-500">
            <div class="flex items-center gap-2 min-w-0">
              ${a("map-pin","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${n(r)}</span>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              ${a("clock","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${n(u)}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  `}function A(e={},t={}){const n=c(e.__marketplaceType||e.type||e.customerType||""),a=B(n);return{...e,__marketplaceTypeLabel:{restaurant:"Restaurant",cafe:"Cafe",coffee:"Cafe",fastfood:"Fastfood",hotel:"Hotel",motel:"Motel",ecommerce:"E-Commerce"}[a]||t.title,__marketplaceType:a}}function O(e={},t={}){const n=t.escapeHtml,a=t.icon;return`
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-5 rounded-[1.5rem] bg-slate-100 text-slate-400 flex items-center justify-center">
        ${a(e.icon,"w-6 h-6")}
      </div>
      <h3 class="text-lg font-black tracking-tight text-slate-900">${n(e.emptyTitle)}</h3>
      <p class="mt-2 text-xs font-semibold text-slate-400 leading-5">${n(e.emptyBody)}</p>
    </div>
  `}function I(e={},t={}){t.escapeHtml;const n=t.icon;return`
    <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
      ${n("loader-2","w-4 h-4 animate-spin")}
      Daten werden geladen ...
    </div>
  `}function te(e={}){const t=e?.travelView&&typeof e.travelView=="object"?e.travelView:{},n=c(t.query||""),a=c(t.activeTab||"").toLowerCase(),s=["offers","hotels","map"].includes(a)?a:n?"hotels":"offers";return{query:n,activeTab:n?s:"offers",notice:c(t.notice||"")}}function ne({travel:e,deps:t}={}){const n=t.escapeHtml,a=t.icon;return`
    <div id="travelSearchTop" data-travel-search-top style="background:${g}; padding:2.65rem 1.5rem 6.35rem;">
      <div class="bg-white border border-white/60 shadow-sm" style="border-radius:2rem; padding:1.4rem;">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style="background:${g};">
            ${a("plane","w-5 h-5")}
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-widest" style="color:${g};">Travel</p>
            <h2 class="text-xl font-black tracking-tight text-slate-900 leading-tight">Schreibe dein Reiseziel</h2>
          </div>
        </div>
        <div class="relative">
          <input
            id="travelDestinationInput"
            data-travel-destination-input="true"
            type="text"
            value="${n(e.query)}"
            placeholder="Prishtina, Vlora, Tirana"
            class="w-full h-14 rounded-[2rem] border border-slate-100 bg-slate-50 px-5 pr-14 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100"
            inputmode="search"
            autocomplete="off"
            autocapitalize="words"
            spellcheck="false"
            aria-autocomplete="list"
            aria-controls="travelDestinationSuggestions"
            aria-expanded="false"
          />
          <button type="button" data-travel-submit="true" class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-all" style="background:${g};">
            ${a("search","w-4 h-4")}
          </button>
        </div>
        <div id="travelDestinationSuggestions" data-travel-destination-suggestions role="listbox" aria-hidden="true" class="travel-destination-suggestions"></div>
        ${e.notice?`
          <p data-travel-notice class="mt-3 text-[11px] font-black uppercase tracking-wider text-rose-500">${n(e.notice)}</p>
        `:""}
      </div>
    </div>
  `}function ae({activeTab:e,hasDestination:t,hotelCount:n,deps:a}={}){const s=a.escapeHtml;return`
    <div class="bg-white/70 p-1.5 border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm" style="border-radius:2rem;">
      ${[{id:"offers",label:"Ofertat"},{id:"hotels",label:"Hotels"},{id:"map",label:"Karte"}].map(o=>{const l=e===o.id,r=!t&&o.id!=="offers",u=o.id==="hotels"&&t?` ${n}`:"";return`
          <button
            type="button"
            data-travel-tab="${s(o.id)}"
            class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${l?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":r?"text-slate-300":"text-slate-400 hover:text-slate-600"}"
          >
            ${s(`${o.label}${u}`)}
          </button>
        `}).join("")}
    </div>
  `}function se(e={},t={}){const n=t.escapeHtml,a=t.icon,s=h(e),i=y(e),o=z(e,t),l=w(e),r=_(e);return`
    <button type="button" data-marketplace-open-business="${n(i)}" class="w-full text-left bg-white border border-slate-100 shadow-sm active:scale-[0.99] transition-transform overflow-hidden" style="border-radius:2rem;">
      <div class="h-40 bg-slate-100 overflow-hidden">
        ${S(o,s,t)}
      </div>
      <div class="p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[9px] font-black uppercase tracking-widest mb-1" style="color:${g};">Ofertat</p>
            <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight line-clamp-2">${n(s)}</h3>
          </div>
          ${r?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${a("star","w-3 h-3 fill-current")} ${n(r)}</span>`:""}
        </div>
        <div class="mt-4 flex items-center gap-2 min-w-0 text-[11px] font-bold text-slate-500">
          ${a("map-pin","w-3.5 h-3.5 text-slate-400 shrink-0")}
          <span class="truncate">${n(l)}</span>
        </div>
      </div>
    </button>
  `}function ie(e=[],t={}){const n=e.slice(0,4);return n.length?`
    <div class="space-y-4">
      ${n.map(a=>se(a,t)).join("")}
    </div>
  `:O({emptyTitle:"Noch keine Angebote",emptyBody:"Keine passenden Hotel-Angebote gefunden.",icon:"plane"},t)}function R(e=[],t={}){return e.length?`
    <div class="space-y-4">
      ${e.map(n=>M(n,t)).join("")}
    </div>
  `:O({emptyTitle:"Keine Hotels gefunden",emptyBody:"Keine passenden Hotels fuer dieses Reiseziel gefunden.",icon:"plane"},t)}function oe(e={},t=0,n={}){const a=n.escapeHtml,s=j(e),i=h(e),o=y(e),l=w(e),r=18+t*23%58,u=22+t*17%46;return`
    <button
      type="button"
      data-marketplace-open-business="${a(o)}"
      class="absolute w-12 h-12 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center active:scale-95 transition-all"
      style="left:${r}%; top:${u}%; transform:translate(-50%,-50%); color:${g};"
      title="${a(`${i} - ${l}`)}"
    >
      ${n.icon("plane","w-5 h-5")}
      ${s?`<span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${a(`${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`)}</span>`:""}
    </button>
  `}function le(e=[],t={}){if(typeof t.renderMapView=="function")return t.renderMapView();const n=e.filter(a=>j(a)).slice(0,8);return e.length?`
    <div class="space-y-4">
      <div class="relative overflow-hidden border border-slate-200 bg-slate-200 shadow-sm" style="height:24rem; border-radius:2.5rem;">
        <div class="absolute inset-0" style="background:linear-gradient(135deg,#e0f7fb 0%,#dbeafe 45%,#e2e8f0 100%);"></div>
        <div class="absolute inset-0 opacity-60" style="background-image:linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px); background-size:42px 42px;"></div>
        ${n.map((a,s)=>oe(a,s,t)).join("")}
        <div class="absolute left-4 right-4 bottom-4">
          <div class="bg-white/95 backdrop-blur-xl border border-white/50 shadow-lg p-4" style="border-radius:1.75rem;">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Hotels</p>
            <p class="mt-1 text-sm font-black text-slate-900">${t.escapeHtml(String(e.length))} ${e.length===1?"Hotel":"Hotels"}</p>
          </div>
        </div>
      </div>
      ${n.length?"":`
        <div class="bg-white border border-slate-100 shadow-sm p-5 text-[11px] font-bold text-slate-400" style="border-radius:2rem;">
          Keine Hotel-Koordinaten fuer dieses Reiseziel gefunden.
        </div>
      `}
    </div>
  `:R(e,t)}function re({state:e,dataLoaded:t,section:n,deps:a}={}){const s=C(e,n.key,a).map(p=>A({...p,__marketplaceType:T(p,a)},n)),i=te(e),o=!!i.query,l=o?s.filter(p=>J(p,i.query)):s.slice(0,$),r=l.slice(0,$),u=o?i.activeTab:"offers",m=t?.restaurants===!0,b=u==="map"?le(r,a):u==="hotels"?R(r,a):ie(r,a);return`
    <section id="travelView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${ne({travel:i,deps:a})}
      <div id="travelBenko" data-travel-benko style="margin-top:-1.75rem; border-top-left-radius:2.5rem; border-top-right-radius:2.5rem; background:#f8fafc; padding:2rem 1.5rem 6.5rem;">
        ${ae({activeTab:u,hasDestination:o,hotelCount:l.length,deps:a})}
        <div class="mt-5">
          ${m||s.length?b:I(n,a)}
        </div>
      </div>
    </section>
  `}function ce({state:e={},dataLoaded:t=null,sectionKey:n="restaurants",escapeHtmlFn:a,iconFn:s,getOptimizedImageUrlFn:i,isPlaceholderUrlFn:o,placeholderImage:l="",normalizeRestaurantTypeFn:r,normalizeLeadTypeKeyFn:u,resolveRestaurantLogoFn:m,renderMapViewFn:b}={}){const p=x[L(n)]||x.restaurants,E=N(a,(f="")=>String(f||"")),K=N(s,()=>""),d={escapeHtml:E,icon:K,getOptimizedImageUrl:i,isPlaceholderUrl:o,placeholderImage:l,resolveRestaurantLogo:m,renderMapView:b,normalizeRestaurantType:r,normalizeLeadTypeKey:u},k=C(e,p.key,d).slice(0,$).map(f=>A({...f,__marketplaceType:T(f,d)},p)),F=k.slice(0,V),P=t?.restaurants===!0;return p.key==="travel"?re({state:e,dataLoaded:t,section:p,deps:d}):`
    <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      ${k.length?`
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
            ${F.map(f=>ee(f,d)).join("")}
          </div>
        </div>

        <div class="space-y-4">
          ${k.map(f=>M(f,d)).join("")}
        </div>
      `:P?O(p,d):I(p,d)}
    </section>
  `}export{C as filterMarketplaceBusinessesCore,ce as renderMarketplaceViewCore,G as resolveMarketplaceSectionForBusinessCore};
