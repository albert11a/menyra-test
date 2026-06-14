const v=Object.freeze({restaurants:Object.freeze({key:"restaurants",title:"Restaurants",emptyTitle:"Noch keine Restaurants",emptyBody:"Keine passenden Profile gefunden.",icon:"utensils",typeKeys:Object.freeze(["restaurant","cafe","coffee","fastfood","food"])}),travel:Object.freeze({key:"travel",title:"Travel",emptyTitle:"Noch keine Travel-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"plane",typeKeys:Object.freeze(["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"])}),shopping:Object.freeze({key:"shopping",title:"Shopping",emptyTitle:"Noch keine Shopping-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"shopping-bag",typeKeys:Object.freeze(["ecommerce"])})}),z=new Map;Object.values(v).forEach(e=>{e.typeKeys.forEach(t=>{z.set(t,e.key)})});const P=8,C=24,g="#00cce5";function S(e,t=()=>""){return typeof e=="function"?e:t}function c(e=""){return String(e||"").trim()}function x(e=""){const t=c(e).toLowerCase();return t?t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):""}function L(e=""){const t=x(e);return t==="restaurant"?"restaurants":["hotel","hotels","motel","motels"].includes(t)?"travel":["shop","ecommerce","e_commerce","shopping"].includes(t)?"shopping":v[t]?t:"restaurants"}function B(e=""){const t=x(e);return t?t==="e_commerce"||t==="online_shop"||t==="onlineshop"||t==="shop"||t==="store"?"ecommerce":t==="coffee"||t==="coffe"||t==="kaffee"?"cafe":t==="fast_food"||t==="snack"||t==="imbiss"?"fastfood":t==="hotels"?"hotel":t==="motels"?"motel":t:""}function D(e={}){return[e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType]}function $(e={},{normalizeRestaurantType:t,normalizeLeadTypeKey:n}={}){const s=typeof t=="function"?t:(l=>l),a=typeof n=="function"?n:(l=>l),i=D(e);for(const l of i){const r=B(s(l)||a(l)||l);if(r)return r}const o=[e.name,e.restaurantName,e.businessName,e.description,e.bio].map(l=>c(l).toLowerCase()).join(" ");return/\bhotel(s)?\b/.test(o)?"hotel":/\bmotel(s)?\b/.test(o)?"motel":/\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b/.test(o)?"cafe":/\bfast\s*food\b|\bfastfood\b/.test(o)?"fastfood":/\be-?commerce\b|\bonline\s*shop\b/.test(o)?"ecommerce":/\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b/.test(o)?"restaurant":""}function U(e={},t={}){const n=$(e,t);return z.get(n)||""}function y(e={}){return c(e.canonicalRestaurantId||e.restaurantId||e.id||e.landingRestaurantId||"")}function h(e={}){return c(e.name||e.restaurantName||e.businessName||e.displayName||"Business")}function w(e={}){const t=c(e.city||e.locationCity||e.primaryCity),n=c(e.address||e.location||e.primaryAddress);return t&&n&&t!==n?`${t} - ${n}`:t||n||"Standort folgt"}function q(e={}){const t=[e.city,e.locationCity,e.primaryCity,e.address,e.location,e.primaryAddress,e.country,e.region,e.district,e.name,e.restaurantName,e.businessName,e.displayName,e.description,e.bio,e.about];return Array.isArray(e.locations)&&e.locations.forEach(n=>{!n||typeof n!="object"||t.push(n.city,n.address,n.country,n.region,n.name)}),t}function Y(e={},t=""){const n=x(t);return n?q(e).map(x).filter(Boolean).join("_").includes(n):!0}function T(e={}){const t=[[e.lat,e.lng],[e.latitude,e.longitude],[e.gpsLat,e.gpsLng],[e.geo?.lat,e.geo?.lng],[e.geo?.latitude,e.geo?.longitude],[e.coords?.lat,e.coords?.lng],[e.coords?.latitude,e.coords?.longitude],[e.location?.lat,e.location?.lng]];for(const[n,s]of t){const a=Number(String(n??"").replace(",",".")),i=Number(String(s??"").replace(",","."));if(Number.isFinite(a)&&Number.isFinite(i)&&Math.abs(a)<=90&&Math.abs(i)<=180){if(Math.abs(a)<1e-6&&Math.abs(i)<1e-6)continue;return{lat:a,lng:i}}}if(Array.isArray(e.locations))for(const n of e.locations){const s=T(n||{});if(s)return s}return null}function G(e={}){const t=e.openingHours||e.openHours||e.hours||e.businessHours||e.workingHours||"";if(typeof t=="string"&&c(t))return c(t);if(t&&typeof t=="object"){const n=Object.values(t).map(c).filter(Boolean);if(n.length)return n[0]}return"Oeffnungszeiten folgen"}function J(e={}){return c(e.description||e.bio||e.about||e.shortDescription||"")}function _(e={}){const t=Number(e.rating??e.avgRating??e.score??e.publicRating??0);return!Number.isFinite(t)||t<=0?"":Math.min(5,Math.max(1,t)).toFixed(1)}function H(e={},{getOptimizedImageUrl:t,resolveRestaurantLogo:n,placeholderImage:s=""}={}){const a=y(e),i=c(e.logoUrl||e.logo||e.logoURL||e.heroUrl||e.coverUrl||e.imageUrl||e.img||""),l=(a&&typeof n=="function"?c(n(a,i,"medium")):i)||i||s;return(typeof t=="function"?c(t(l,"medium")):l)||s||""}function Q(e={}){const t=Number(e.rating??e.avgRating??e.publicRating??0),n=Number(e.score??e.publicScore??0),s=Number(e.followersCount??e.followerCount??0),a=Number(e.postsCount??e.postCount??0),i=Number(e.updatedAt?.seconds||e.createdAt?.seconds||0);return(Number.isFinite(t)?t*1e3:0)+(Number.isFinite(n)?n:0)+(Number.isFinite(s)?Math.min(s,500):0)+(Number.isFinite(a)?Math.min(a,200):0)+(Number.isFinite(i)?Math.min(i/1e5,100):0)}function W(e={},t={}){const n=new Map,s=(a={})=>{if(!a||typeof a!="object")return;const i=y(a);if(!i)return;const o=n.get(i)||{};n.set(i,{...o,...a,id:i})};return(Array.isArray(e.bootstrapRestaurantPreview)?e.bootstrapRestaurantPreview:[]).forEach(s),(Array.isArray(e.restaurants)?e.restaurants:[]).forEach(s),Array.from(n.values()).map(a=>({...a,__marketplaceSection:U(a,t),__marketplaceScore:Q(a)})).filter(a=>a.__marketplaceSection).sort((a,i)=>i.__marketplaceScore-a.__marketplaceScore||h(a).localeCompare(h(i)))}function M(e={},t="",n={}){const s=L(t);return W(e,n).filter(a=>a.__marketplaceSection===s)}function N(e="",t="",{escapeHtml:n,isPlaceholderUrl:s,extraClass:a=""}={}){const i=c(e),o=!i||typeof s=="function"&&s(i);return`
    <img
      src="${n(i)}"
      alt="${n(t)}"
      loading="lazy"
      class="w-full h-full object-cover bg-slate-100 ${a}"
      ${o?'data-placeholder-image="true"':""}
    />
  `}function X(e={},t={}){const n=t.escapeHtml,s=t.icon,a=h(e),i=y(e),o=H(e,t),l=_(e),r=w(e);return`
    <button type="button" data-marketplace-open-business="${n(i)}" class="shrink-0 w-44 text-left rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <div class="h-28 bg-slate-100 overflow-hidden">
        ${N(o,a,t)}
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest line-clamp-1">${n(e.__marketplaceTypeLabel||"Top")}</span>
          ${l?`<span class="text-[10px] font-black text-amber-500 flex items-center gap-1">${s("star","w-3 h-3 fill-current")} ${n(l)}</span>`:""}
        </div>
        <h3 class="text-sm font-black text-slate-900 leading-tight line-clamp-2">${n(a)}</h3>
        <p class="mt-2 text-[10px] font-bold text-slate-400 leading-4 line-clamp-1">${n(r)}</p>
      </div>
    </button>
  `}function R(e={},t={}){const n=t.escapeHtml,s=t.icon,a=h(e),i=y(e),o=H(e,t),l=_(e),r=w(e),u=G(e),d=J(e),p=c(e.__marketplaceTypeLabel||e.type||e.customerType||"");return`
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <button type="button" data-marketplace-open-business="${n(i)}" class="w-full text-left active:scale-[0.99] transition-transform">
        <div class="h-48 bg-slate-100 overflow-hidden">
          ${N(o,a,t)}
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              ${p?`<p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">${n(p)}</p>`:""}
              <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight">${n(a)}</h3>
            </div>
            ${l?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${s("star","w-3 h-3 fill-current")} ${n(l)}</span>`:""}
          </div>
          ${d?`<p class="mt-3 text-xs font-semibold text-slate-500 leading-5 line-clamp-2">${n(d)}</p>`:""}
          <div class="mt-4 grid grid-cols-1 gap-2 text-[11px] font-bold text-slate-500">
            <div class="flex items-center gap-2 min-w-0">
              ${s("map-pin","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${n(r)}</span>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              ${s("clock","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${n(u)}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  `}function A(e={},t={}){const n=c(e.__marketplaceType||e.type||e.customerType||""),s=B(n);return{...e,__marketplaceTypeLabel:{restaurant:"Restaurant",cafe:"Cafe",coffee:"Cafe",fastfood:"Fastfood",hotel:"Hotel",motel:"Motel",ecommerce:"E-Commerce"}[s]||t.title,__marketplaceType:s}}function j(e={},t={}){const n=t.escapeHtml,s=t.icon;return`
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-5 rounded-[1.5rem] bg-slate-100 text-slate-400 flex items-center justify-center">
        ${s(e.icon,"w-6 h-6")}
      </div>
      <h3 class="text-lg font-black tracking-tight text-slate-900">${n(e.emptyTitle)}</h3>
      <p class="mt-2 text-xs font-semibold text-slate-400 leading-5">${n(e.emptyBody)}</p>
    </div>
  `}function K(e={},t={}){t.escapeHtml;const n=t.icon;return`
    <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
      ${n("loader-2","w-4 h-4 animate-spin")}
      Daten werden geladen ...
    </div>
  `}function Z(e={}){const t=e?.travelView&&typeof e.travelView=="object"?e.travelView:{},n=c(t.query||""),s=c(t.activeTab||"").toLowerCase(),a=["offers","hotels","map"].includes(s)?s:n?"hotels":"offers";return{query:n,activeTab:n?a:"offers",notice:c(t.notice||"")}}function ee({travel:e,deps:t}={}){const n=t.escapeHtml,s=t.icon;return`
    <div id="travelSearchTop" data-travel-search-top style="background:${g}; padding:1.5rem 1.5rem 5rem;">
      <div class="bg-white border border-white/60 shadow-sm" style="border-radius:2rem; padding:1.25rem;">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style="background:${g};">
            ${s("plane","w-5 h-5")}
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
            autocomplete="off"
          />
          <button type="button" data-travel-submit="true" class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-all" style="background:${g};">
            ${s("search","w-4 h-4")}
          </button>
        </div>
        ${e.notice?`
          <p data-travel-notice class="mt-3 text-[11px] font-black uppercase tracking-wider text-rose-500">${n(e.notice)}</p>
        `:""}
      </div>
    </div>
  `}function te({activeTab:e,hasDestination:t,hotelCount:n,deps:s}={}){const a=s.escapeHtml;return`
    <div class="bg-white/70 p-1.5 border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm" style="border-radius:2rem;">
      ${[{id:"offers",label:"Ofertat"},{id:"hotels",label:"Hotels"},{id:"map",label:"Karte"}].map(o=>{const l=e===o.id,r=!t&&o.id!=="offers",u=o.id==="hotels"&&t?` ${n}`:"";return`
          <button
            type="button"
            data-travel-tab="${a(o.id)}"
            class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${l?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":r?"text-slate-300":"text-slate-400 hover:text-slate-600"}"
          >
            ${a(`${o.label}${u}`)}
          </button>
        `}).join("")}
    </div>
  `}function ne(e={},t={}){const n=t.escapeHtml,s=t.icon,a=h(e),i=y(e),o=H(e,t),l=w(e),r=_(e);return`
    <button type="button" data-marketplace-open-business="${n(i)}" class="w-full text-left bg-white border border-slate-100 shadow-sm active:scale-[0.99] transition-transform overflow-hidden" style="border-radius:2rem;">
      <div class="h-40 bg-slate-100 overflow-hidden">
        ${N(o,a,t)}
      </div>
      <div class="p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[9px] font-black uppercase tracking-widest mb-1" style="color:${g};">Ofertat</p>
            <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight line-clamp-2">${n(a)}</h3>
          </div>
          ${r?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${s("star","w-3 h-3 fill-current")} ${n(r)}</span>`:""}
        </div>
        <div class="mt-4 flex items-center gap-2 min-w-0 text-[11px] font-bold text-slate-500">
          ${s("map-pin","w-3.5 h-3.5 text-slate-400 shrink-0")}
          <span class="truncate">${n(l)}</span>
        </div>
      </div>
    </button>
  `}function se(e=[],t={}){const n=e.slice(0,4);return n.length?`
    <div class="space-y-4">
      ${n.map(s=>ne(s,t)).join("")}
    </div>
  `:j({emptyTitle:"Noch keine Angebote",emptyBody:"Keine passenden Hotel-Angebote gefunden.",icon:"plane"},t)}function I(e=[],t={}){return e.length?`
    <div class="space-y-4">
      ${e.map(n=>R(n,t)).join("")}
    </div>
  `:j({emptyTitle:"Keine Hotels gefunden",emptyBody:"Keine passenden Hotels fuer dieses Reiseziel gefunden.",icon:"plane"},t)}function ae(e={},t=0,n={}){const s=n.escapeHtml,a=T(e),i=h(e),o=y(e),l=w(e),r=18+t*23%58,u=22+t*17%46;return`
    <button
      type="button"
      data-marketplace-open-business="${s(o)}"
      class="absolute w-12 h-12 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center active:scale-95 transition-all"
      style="left:${r}%; top:${u}%; transform:translate(-50%,-50%); color:${g};"
      title="${s(`${i} - ${l}`)}"
    >
      ${n.icon("plane","w-5 h-5")}
      ${a?`<span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${s(`${a.lat.toFixed(5)}, ${a.lng.toFixed(5)}`)}</span>`:""}
    </button>
  `}function ie(e=[],t={}){if(typeof t.renderMapView=="function")return t.renderMapView();const n=e.filter(s=>T(s)).slice(0,8);return e.length?`
    <div class="space-y-4">
      <div class="relative overflow-hidden border border-slate-200 bg-slate-200 shadow-sm" style="height:24rem; border-radius:2.5rem;">
        <div class="absolute inset-0" style="background:linear-gradient(135deg,#e0f7fb 0%,#dbeafe 45%,#e2e8f0 100%);"></div>
        <div class="absolute inset-0 opacity-60" style="background-image:linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px); background-size:42px 42px;"></div>
        ${n.map((s,a)=>ae(s,a,t)).join("")}
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
  `:I(e,t)}function oe({state:e,dataLoaded:t,section:n,deps:s}={}){const a=M(e,n.key,s).slice(0,C).map(p=>A({...p,__marketplaceType:$(p,s)},n)),i=Z(e),o=!!i.query,l=o?a.filter(p=>Y(p,i.query)):a,r=o?i.activeTab:"offers",u=t?.restaurants===!0,d=r==="map"?ie(l,s):r==="hotels"?I(l,s):se(l,s);return`
    <section id="travelView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${ee({travel:i,deps:s})}
      <div id="travelBenko" data-travel-benko style="margin-top:-2.5rem; border-top-left-radius:2.5rem; border-top-right-radius:2.5rem; background:#f8fafc; padding:1.5rem 1.5rem 6rem;">
        ${te({activeTab:r,hasDestination:o,hotelCount:l.length,deps:s})}
        <div class="mt-5">
          ${u||a.length?d:K(n,s)}
        </div>
      </div>
    </section>
  `}function le({state:e={},dataLoaded:t=null,sectionKey:n="restaurants",escapeHtmlFn:s,iconFn:a,getOptimizedImageUrlFn:i,isPlaceholderUrlFn:o,placeholderImage:l="",normalizeRestaurantTypeFn:r,normalizeLeadTypeKeyFn:u,resolveRestaurantLogoFn:d,renderMapViewFn:p}={}){const b=v[L(n)]||v.restaurants,O=S(s,(f="")=>String(f||"")),E=S(a,()=>""),m={escapeHtml:O,icon:E,getOptimizedImageUrl:i,isPlaceholderUrl:o,placeholderImage:l,resolveRestaurantLogo:d,renderMapView:p,normalizeRestaurantType:r,normalizeLeadTypeKey:u},k=M(e,b.key,m).slice(0,C).map(f=>A({...f,__marketplaceType:$(f,m)},b)),F=k.slice(0,P),V=t?.restaurants===!0;return b.key==="travel"?oe({state:e,dataLoaded:t,section:b,deps:m}):`
    <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      ${k.length?`
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
            ${F.map(f=>X(f,m)).join("")}
          </div>
        </div>

        <div class="space-y-4">
          ${k.map(f=>R(f,m)).join("")}
        </div>
      `:V?j(b,m):K(b,m)}
    </section>
  `}export{M as filterMarketplaceBusinessesCore,le as renderMarketplaceViewCore,U as resolveMarketplaceSectionForBusinessCore};
