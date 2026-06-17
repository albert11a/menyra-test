const $=Object.freeze({restaurants:Object.freeze({key:"restaurants",title:"Restaurants",emptyTitle:"Noch keine Restaurants",emptyBody:"Keine passenden Profile gefunden.",icon:"utensils",typeKeys:Object.freeze(["restaurant","cafe","coffee","fastfood","food"])}),travel:Object.freeze({key:"travel",title:"Travel",emptyTitle:"Noch keine Travel-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"plane",typeKeys:Object.freeze(["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"])}),shopping:Object.freeze({key:"shopping",title:"Shopping",emptyTitle:"Noch keine Shopping-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"shopping-bag",typeKeys:Object.freeze(["ecommerce"])})}),E=new Map;Object.values($).forEach(e=>{e.typeKeys.forEach(t=>{E.set(t,e.key)})});const M=8,j=24,G="#ff4f3f",Y="mnyra_social_feed_viewer_location_v1",v="#00cce5",J=Object.freeze([Object.freeze(["tirana","tirane"]),Object.freeze(["durres","durresi"]),Object.freeze(["vlora","vlore"]),Object.freeze(["shkoder","shkodra"]),Object.freeze(["shengjin","shëngjin","shen gjin","shengjini"]),Object.freeze(["ksamil","ksamili"]),Object.freeze(["dhermi","dhërmi","dhermiu"]),Object.freeze(["velipoje","velipojë","velipoja"]),Object.freeze(["theth","thethi"]),Object.freeze(["valbone","valbonë","valbona"]),Object.freeze(["elbasan","elbasani"]),Object.freeze(["fier","fieri"]),Object.freeze(["korce","korca"]),Object.freeze(["sarande","saranda"]),Object.freeze(["berat","berati"]),Object.freeze(["gjirokaster","gjirokastra"]),Object.freeze(["kukes","kukesi"]),Object.freeze(["lezhe","lezha"]),Object.freeze(["pogradec","pogradeci"]),Object.freeze(["kruje","kruja"]),Object.freeze(["fushe kruje","fushë krujë","fushe-kruje","fush kruje"]),Object.freeze(["lushnje","lushnja"]),Object.freeze(["himare","himarë","himara"]),Object.freeze(["kavaje","kavajë","kavaja"]),Object.freeze(["kamze","kamëz","kamza"]),Object.freeze(["vore","vorë","vora"]),Object.freeze(["divjake","divjakë","divjaka"]),Object.freeze(["permet","përmet","permeti"]),Object.freeze(["tepelene","tepelenë","tepelena"]),Object.freeze(["delvine","delvinë","delvina"]),Object.freeze(["peshkopi","peshkopia","diber","dibër"]),Object.freeze(["burrel","burreli","mat"]),Object.freeze(["puke","pukë","puka"]),Object.freeze(["bajram curri","bajramcurri","tropoje","tropojë"]),Object.freeze(["krume","krumë","has"]),Object.freeze(["lac","laç","kurbin"]),Object.freeze(["orikum","orikumi"]),Object.freeze(["golem","golemi"]),Object.freeze(["jale","jalë","jali"]),Object.freeze(["qepare","qeparo","qeparoi"]),Object.freeze(["borsh","borshi"]),Object.freeze(["lukove","lukovë","lukova"]),Object.freeze(["palase","palasë","palasa"]),Object.freeze(["drimadhe","drymades","drimadhes"]),Object.freeze(["spille","spilleja"]),Object.freeze(["gjiri i lalzit","lalzi","lalez","lalëz"])]);function H(e,t=()=>""){return typeof e=="function"?e:t}function o(e=""){return String(e||"").trim()}function x(e=""){const t=o(e).toLowerCase();return t?t.replace(/[ëèéê]/g,"e").replace(/[çćč]/g,"c").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):""}function Q(e=""){const t=x(e);if(!t)return[];const a=new Set([t]);return J.forEach(n=>{const s=n.map(x).filter(Boolean);s.includes(t)&&s.forEach(i=>a.add(i))}),Array.from(a)}function F(e=""){const t=x(e);return t==="restaurant"?"restaurants":["hotel","hotels","motel","motels"].includes(t)?"travel":["shop","ecommerce","e_commerce","shopping"].includes(t)?"shopping":$[t]?t:"restaurants"}function P(e=""){const t=x(e);return t?t==="e_commerce"||t==="online_shop"||t==="onlineshop"||t==="shop"||t==="store"?"ecommerce":t==="coffee"||t==="coffe"||t==="kaffee"?"cafe":t==="fast_food"||t==="snack"||t==="imbiss"?"fastfood":t==="hotels"?"hotel":t==="motels"?"motel":t:""}function W(e={}){return[e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType]}function T(e={},{normalizeRestaurantType:t,normalizeLeadTypeKey:a}={}){const n=typeof t=="function"?t:(r=>r),s=typeof a=="function"?a:(r=>r),i=W(e);for(const r of i){const c=P(n(r)||s(r)||r);if(c)return c}const l=[e.name,e.restaurantName,e.businessName,e.description,e.bio].map(r=>o(r).toLowerCase()).join(" ");return/\bhotel(s)?\b/.test(l)?"hotel":/\bmotel(s)?\b/.test(l)?"motel":/\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b/.test(l)?"cafe":/\bfast\s*food\b|\bfastfood\b/.test(l)?"fastfood":/\be-?commerce\b|\bonline\s*shop\b/.test(l)?"ecommerce":/\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b/.test(l)?"restaurant":""}function X(e={},t={}){const a=T(e,t);return E.get(a)||""}function h(e={}){return o(e.canonicalRestaurantId||e.restaurantId||e.id||e.landingRestaurantId||"")}function g(e={}){return o(e.name||e.restaurantName||e.businessName||e.displayName||"Business")}function w(e={}){const t=o(e.city||e.locationCity||e.primaryCity),a=o(e.address||e.location||e.primaryAddress);return t&&a&&t!==a?`${t} - ${a}`:t||a||"Standort folgt"}function Z(e={}){const t=[e.id,e.restaurantId,e.canonicalRestaurantId,e.publicSlug,e.landingSlug,e.handle,e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType,e.city,e.locationCity,e.primaryCity,e.address,e.location,e.primaryAddress,e.country,e.region,e.district,e.name,e.restaurantName,e.businessName,e.displayName,e.description,e.bio,e.about];return Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||t.push(a.city,a.address,a.country,a.region,a.name)}),t}function ee(e={},t=""){const a=Q(t);if(!a.length)return!0;const n=Z(e).map(x).filter(Boolean).join("_");return a.some(s=>{const i=s.split("_").filter(Boolean);return n.includes(s)?!0:i.length>0&&i.every(l=>n.includes(l))})}function R(e={}){const t=[[e.lat,e.lng],[e.latitude,e.longitude],[e.gpsLat,e.gpsLng],[e.geo?.lat,e.geo?.lng],[e.geo?.latitude,e.geo?.longitude],[e.coords?.lat,e.coords?.lng],[e.coords?.latitude,e.coords?.longitude],[e.location?.lat,e.location?.lng]];for(const[a,n]of t){const s=Number(String(a??"").replace(",",".")),i=Number(String(n??"").replace(",","."));if(Number.isFinite(s)&&Number.isFinite(i)&&Math.abs(s)<=90&&Math.abs(i)<=180){if(Math.abs(s)<1e-6&&Math.abs(i)<1e-6)continue;return{lat:s,lng:i}}}if(Array.isArray(e.locations))for(const a of e.locations){const n=R(a||{});if(n)return n}return null}function K(e={}){const t=e.openingHours||e.openHours||e.hours||e.businessHours||e.workingHours||"";if(typeof t=="string"&&o(t))return o(t);if(t&&typeof t=="object"){const a=Object.values(t).map(o).filter(Boolean);if(a.length)return a[0]}return"Oeffnungszeiten folgen"}function te(e={}){return o(e.phone||e.telephone||e.contactPhone||e.ownerPhone||"")}function ae(e={}){return o(e.description||e.bio||e.about||e.shortDescription||"")}function z(e={}){const t=Number(e.rating??e.avgRating??e.score??e.publicRating??0);return!Number.isFinite(t)||t<=0?"":Math.min(5,Math.max(1,t)).toFixed(1)}function O(e={},{getOptimizedImageUrl:t,resolveRestaurantLogo:a,placeholderImage:n=""}={}){const s=h(e),i=o(e.logoUrl||e.logo||e.logoURL||e.heroUrl||e.coverUrl||e.imageUrl||e.img||""),r=(s&&typeof a=="function"?o(a(s,i,"medium")):i)||i||n;return(typeof t=="function"?o(t(r,"medium")):r)||n||""}function ne(e={},{getOptimizedImageUrl:t,placeholderImage:a=""}={}){const s=o(e.titleImageUrl||e.coverImageUrl||e.coverImage||e.coverUrl||e.heroImageUrl||e.heroUrl||e.imageUrl||e.bestSpotLogoUrl||e.spotLogoUrl||e.logoUrl||e.logo||"")||a;return(typeof t=="function"?o(t(s,"large")):s)||a||""}function se(e={}){return o(e.cuisine||e.kitchen||e.foodType||e.categoryLabel||e.__marketplaceTypeLabel||e.type||e.customerType||"")}function ie(e={}){return o(e.priceRange||e.priceLevel||e.priceLabel||e.budget||"")}function N(e,t=""){return typeof e=="string"?o(e):e===!0?o(t):""}function le(e={}){const t=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{},a=[N(e.gardenTerraceText||e.gardenTerrace||e.gardenOrTerrace||t.gardenTerrace,"Garten / Terrasse"),N(e.accessibilityText||e.barrierFreeText||e.accessibleText||e.barrierefrei||e.accessible||t.accessibility,"Barrierefrei"),N(e.veganOptionsText||e.veganOptions||e.veganText||e.vegan||t.veganOptions,"Vegane Optionen")].filter(Boolean);if(a.length)return a.slice(0,3);const n=Array.isArray(e.features)?e.features.map(o).filter(Boolean):[];if(n.length)return n.slice(0,3);const s=o(e.features||e.amenities||"");return s?s.split(/[,;|]/).map(o).filter(Boolean).slice(0,3):[]}function re(e={}){const t=Number(e.rating??e.avgRating??e.publicRating??0),a=Number(e.score??e.publicScore??0),n=Number(e.followersCount??e.followerCount??0),s=Number(e.postsCount??e.postCount??0),i=Number(e.updatedAt?.seconds||e.createdAt?.seconds||0);return(Number.isFinite(t)?t*1e3:0)+(Number.isFinite(a)?a:0)+(Number.isFinite(n)?Math.min(n,500):0)+(Number.isFinite(s)?Math.min(s,200):0)+(Number.isFinite(i)?Math.min(i/1e5,100):0)}function oe(e={},t={}){const a=new Map,n=(s={})=>{if(!s||typeof s!="object")return;const i=h(s);if(!i)return;const l=a.get(i)||{};a.set(i,{...l,...s,id:i})};return(Array.isArray(e.bootstrapRestaurantPreview)?e.bootstrapRestaurantPreview:[]).forEach(n),(Array.isArray(e.restaurants)?e.restaurants:[]).forEach(n),Array.from(a.values()).map(s=>({...s,__marketplaceSection:X(s,t),__marketplaceScore:re(s)})).filter(s=>s.__marketplaceSection).sort((s,i)=>i.__marketplaceScore-s.__marketplaceScore||g(s).localeCompare(g(i)))}function B(e={},t="",a={}){const n=F(t);return oe(e,a).filter(s=>s.__marketplaceSection===n)}function y(e="",t="",{escapeHtml:a,isPlaceholderUrl:n,extraClass:s=""}={}){const i=o(e),l=!i||typeof n=="function"&&n(i);return`
    <img
      src="${a(i)}"
      alt="${a(t)}"
      loading="lazy"
      class="w-full h-full object-cover bg-slate-100 ${s}"
      ${l?'data-placeholder-image="true"':""}
    />
  `}function U(e={},t={}){const a=t.escapeHtml,n=t.icon,s=g(e),i=h(e),l=O(e,t),r=z(e),c=w(e);return`
    <button type="button" data-marketplace-open-business="${a(i)}" class="shrink-0 w-44 text-left rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <div class="h-28 bg-slate-100 overflow-hidden">
        ${y(l,s,t)}
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest line-clamp-1">${a(e.__marketplaceTypeLabel||"Top")}</span>
          ${r?`<span class="text-[10px] font-black text-amber-500 flex items-center gap-1">${n("star","w-3 h-3 fill-current")} ${a(r)}</span>`:""}
        </div>
        <h3 class="text-sm font-black text-slate-900 leading-tight line-clamp-2">${a(s)}</h3>
        <p class="mt-2 text-[10px] font-bold text-slate-400 leading-4 line-clamp-1">${a(c)}</p>
      </div>
    </button>
  `}function V(e={},t={}){const a=t.escapeHtml,n=t.icon,s=g(e),i=h(e),l=O(e,t),r=z(e),c=w(e),u=K(e),d=ae(e),f=o(e.__marketplaceTypeLabel||e.type||e.customerType||"");return`
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <button type="button" data-marketplace-open-business="${a(i)}" class="w-full text-left active:scale-[0.99] transition-transform">
        <div class="h-48 bg-slate-100 overflow-hidden">
          ${y(l,s,t)}
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              ${f?`<p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">${a(f)}</p>`:""}
              <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight">${a(s)}</h3>
            </div>
            ${r?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${n("star","w-3 h-3 fill-current")} ${a(r)}</span>`:""}
          </div>
          ${d?`<p class="mt-3 text-xs font-semibold text-slate-500 leading-5 line-clamp-2">${a(d)}</p>`:""}
          <div class="mt-4 grid grid-cols-1 gap-2 text-[11px] font-bold text-slate-500">
            <div class="flex items-center gap-2 min-w-0">
              ${n("map-pin","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${a(c)}</span>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              ${n("clock","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${a(u)}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  `}function ce(e={},t={}){const a=t.escapeHtml,n=t.icon,s=g(e),i=h(e),l=ne(e,t),r=O(e,t),c=z(e),u=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),d=se(e),f=ie(e),p=w(e),k=te(e),S=K(e),b=le(e);return`
    <article class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col">
      <div class="h-44 relative overflow-hidden group bg-slate-100">
        ${y(l,s,{...t,extraClass:"transition-transform duration-700 group-hover:scale-105"})}
        <div class="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-black/20"></div>
        ${f?`
          <div class="absolute bottom-3.5 right-4 bg-slate-900/90 text-white font-medium px-2.5 py-0.5 rounded-md text-[9px] tracking-wider shadow">
            ${a(f)}
          </div>
        `:""}
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5">
        <div class="absolute -top-10 left-5 z-10">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden">
            ${y(r,`${s} Logo`,{...t,extraClass:"rounded-full"})}
          </div>
        </div>

        <div>
          ${c?`
            <div class="flex items-center gap-1.5 mb-1">
              <span class="flex text-amber-500">${n("star","w-3.5 h-3.5 fill-current")}</span>
              <span class="text-[11px] font-bold text-slate-800">${a(c)}</span>
              ${u>0?`<span class="text-[11px] text-slate-400">(${a(String(u))} Bewertungen)</span>`:""}
            </div>
          `:""}
          <h3 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${a(s)}</h3>
          ${d?`<p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5">${a(d)}</p>`:""}
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${n("map-pin","w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${a(p)}</span>
          </div>
          ${k?`
            <div class="flex items-center gap-3">
              ${n("phone","w-4 h-4 text-slate-400 shrink-0")}
              <span class="text-[11px] text-slate-600">${a(k)}</span>
            </div>
          `:""}
          <div class="flex items-center gap-3">
            ${n("clock","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(S)}</span>
          </div>
        </div>

        ${b.length?`
          <div class="flex flex-wrap gap-1.5">
            ${b.map(L=>`
              <span class="text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100">${a(L)}</span>
            `).join("")}
          </div>
        `:""}

        <hr class="border-slate-100" />

        <div class="grid grid-cols-2 gap-2.5 mt-0.5">
          <button
            type="button"
            data-marketplace-open-business="${a(i)}"
            data-tab="profile"
            class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all duration-150 active:scale-95"
          >
            ${n("user","w-3.5 h-3.5 text-slate-400")}
            Profil
          </button>

          <button
            type="button"
            data-marketplace-open-business="${a(i)}"
            data-tab="menu"
            class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150 active:scale-95"
          >
            ${n("book-open","w-3.5 h-3.5 text-slate-200")}
            Menu
          </button>
        </div>
      </div>
    </article>
  `}function I(e={},t={}){const a=o(e.__marketplaceType||e.type||e.customerType||""),n=P(a);return{...e,__marketplaceTypeLabel:{restaurant:"Restaurant",cafe:"Cafe",coffee:"Cafe",fastfood:"Fastfood",hotel:"Hotel",motel:"Motel",ecommerce:"E-Commerce"}[n]||t.title,__marketplaceType:n}}function _(e={},t={}){const a=t.escapeHtml,n=t.icon;return`
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-5 rounded-[1.5rem] bg-slate-100 text-slate-400 flex items-center justify-center">
        ${n(e.icon,"w-6 h-6")}
      </div>
      <h3 class="text-lg font-black tracking-tight text-slate-900">${a(e.emptyTitle)}</h3>
      <p class="mt-2 text-xs font-semibold text-slate-400 leading-5">${a(e.emptyBody)}</p>
    </div>
  `}function A(e={},t={}){t.escapeHtml;const a=t.icon;return`
    <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
      ${a("loader-2","w-4 h-4 animate-spin")}
      Daten werden geladen ...
    </div>
  `}function ue(){const e=globalThis?.localStorage||null;if(!e)return null;try{const t=e.getItem(Y);if(!t)return null;const a=JSON.parse(t),n=Number(a?.lat??a?.latitude),s=Number(a?.lng??a?.lon??a?.longitude);return!Number.isFinite(n)||!Number.isFinite(s)?null:{lat:n,lng:s,label:o(a?.label||a?.city||""),city:o(a?.city||a?.label||""),source:o(a?.source||"")}}catch{return null}}function pe({deps:e}={}){const t=e.icon;return`
    <div id="restaurantsSearchTop" data-restaurant-search-top style="background:${G};">
      <div class="loc-top">
        <div class="loc-title">
          <div class="text-slider-wrapper">
            <div class="text-slide-item">BEST RESTAURANTS.</div>
            <div class="text-slide-item">BEST COFFEES.</div>
          </div>
          <div>IN YOUR CITY.</div>
        </div>

        <div class="loc-search-wrap">
          <div class="loc-input-row">
            <span class="loc-pin">${t("map-pin","w-5 h-5")}</span>
            <input
              id="restaurantLocationCityInput"
              data-restaurant-location-city-input="true"
              type="text"
              placeholder="Enter your city..."
              class="loc-input"
              inputmode="search"
              autocomplete="off"
              autocapitalize="words"
              spellcheck="false"
              aria-autocomplete="list"
              aria-controls="restaurantLocationCitySuggestions"
              aria-expanded="false"
            />
            <div class="loc-request-wrap">
              <button id="btnRestaurantLocateMe" type="button" data-restaurant-location-request class="loc-request-btn" aria-label="Use location">
                ${t("crosshair","w-5 h-5 relative z-10")}
                <span id="restaurantLocatePulse" class="loc-request-pulse opacity-0"></span>
              </button>
            </div>
          </div>
          <div id="restaurantLocationCitySuggestions" data-restaurant-location-city-suggestions role="listbox" aria-hidden="true" class="feed-location-suggestions"></div>
          <p id="restaurantLocationStatus" class="loc-status hidden"></p>
        </div>
      </div>
      <span data-travel-tab="" hidden aria-hidden="true"></span>
    </div>
  `}function fe({items:e=[],bestItems:t=[],section:a={},deps:n={}}={}){return e.length?`
    <div style="margin-bottom:2rem;">
      <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
        ${t.map(s=>U(s,n)).join("")}
      </div>
    </div>

    <div class="space-y-4">
      ${e.map(s=>ce(s,n)).join("")}
    </div>
  `:_(a,n)}function de({state:e,dataLoaded:t,section:a,deps:n}={}){const s=B(e,a.key,n).map(f=>I({...f,__marketplaceType:T(f,n)},a)),l=!!ue(),r=s.slice(0,j),c=r.slice(0,M),d=t?.restaurants===!0||s.length?fe({items:r,bestItems:c,section:a,deps:n}):A(a,n);return l?`
      <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
        ${d}
      </section>
    `:`
    <section id="restaurantsView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${pe({deps:n})}
      <div id="restaurantsBenko" data-restaurants-benko class="loc-bento loc-bento--feed-content">
      </div>
    </section>
  `}function be(e={}){const t=e?.travelView&&typeof e.travelView=="object"?e.travelView:{},a=o(t.query||""),n=o(t.activeTab||"").toLowerCase(),s=["offers","hotels","map"].includes(n)?n:a?"hotels":"offers";return{query:a,activeTab:a?s:"offers",notice:o(t.notice||"")}}function me({travel:e,deps:t}={}){const a=t.escapeHtml,n=t.icon;return`
    <div id="travelSearchTop" data-travel-search-top style="background:${v}; padding:4.6rem 1.5rem 6.35rem;">
      <div class="bg-white border border-white/60 shadow-sm" style="border-radius:2rem; padding:1.4rem;">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style="background:${v};">
            ${n("plane","w-5 h-5")}
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-widest" style="color:${v};">Travel</p>
            <h2 class="text-lg font-black tracking-tight text-slate-900 leading-tight">Schreibe dein Reiseziel</h2>
          </div>
        </div>
        <div class="relative">
          <input
            id="travelDestinationInput"
            data-travel-destination-input="true"
            type="text"
            value="${a(e.query)}"
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
          <button type="button" data-travel-submit="true" class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-all" style="background:${v};">
            ${n("search","w-4 h-4")}
          </button>
        </div>
        <div id="travelDestinationSuggestions" data-travel-destination-suggestions role="listbox" aria-hidden="true" class="travel-destination-suggestions"></div>
        ${e.notice?`
          <p data-travel-notice class="mt-3 text-[11px] font-black uppercase tracking-wider text-rose-500">${a(e.notice)}</p>
        `:""}
      </div>
    </div>
  `}function ge({activeTab:e,hasDestination:t,hotelCount:a,deps:n}={}){const s=n.escapeHtml;return`
    <div class="bg-white/70 p-1.5 border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm" style="border-radius:2rem;">
      ${[{id:"offers",label:"Ofertat"},{id:"hotels",label:"Hotels"},{id:"map",label:"Karte"}].map(l=>{const r=e===l.id,c=!t&&l.id!=="offers",u=l.id==="hotels"&&t?` ${a}`:"";return`
          <button
            type="button"
            data-travel-tab="${s(l.id)}"
            class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${r?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":c?"text-slate-300":"text-slate-400 hover:text-slate-600"}"
          >
            ${s(`${l.label}${u}`)}
          </button>
        `}).join("")}
    </div>
  `}function he(e={},t={}){const a=t.escapeHtml,n=t.icon,s=g(e),i=h(e),l=O(e,t),r=w(e),c=z(e);return`
    <button type="button" data-marketplace-open-business="${a(i)}" class="w-full text-left bg-white border border-slate-100 shadow-sm active:scale-[0.99] transition-transform overflow-hidden" style="border-radius:2rem;">
      <div class="h-40 bg-slate-100 overflow-hidden">
        ${y(l,s,t)}
      </div>
      <div class="p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[9px] font-black uppercase tracking-widest mb-1" style="color:${v};">Ofertat</p>
            <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight line-clamp-2">${a(s)}</h3>
          </div>
          ${c?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${n("star","w-3 h-3 fill-current")} ${a(c)}</span>`:""}
        </div>
        <div class="mt-4 flex items-center gap-2 min-w-0 text-[11px] font-bold text-slate-500">
          ${n("map-pin","w-3.5 h-3.5 text-slate-400 shrink-0")}
          <span class="truncate">${a(r)}</span>
        </div>
      </div>
    </button>
  `}function ve(e=[],t={}){const a=e.slice(0,4);return a.length?`
    <div class="space-y-4">
      ${a.map(n=>he(n,t)).join("")}
    </div>
  `:_({emptyTitle:"Noch keine Angebote",emptyBody:"Keine passenden Hotel-Angebote gefunden.",icon:"plane"},t)}function q(e=[],t={}){return e.length?`
    <div class="space-y-4">
      ${e.map(a=>V(a,t)).join("")}
    </div>
  `:_({emptyTitle:"Keine Hotels gefunden",emptyBody:"Keine passenden Hotels fuer dieses Reiseziel gefunden.",icon:"plane"},t)}function xe(e={},t=0,a={}){const n=a.escapeHtml,s=R(e),i=g(e),l=h(e),r=w(e),c=18+t*23%58,u=22+t*17%46;return`
    <button
      type="button"
      data-marketplace-open-business="${n(l)}"
      class="absolute w-12 h-12 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center active:scale-95 transition-all"
      style="left:${c}%; top:${u}%; transform:translate(-50%,-50%); color:${v};"
      title="${n(`${i} - ${r}`)}"
    >
      ${a.icon("plane","w-5 h-5")}
      ${s?`<span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${n(`${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`)}</span>`:""}
    </button>
  `}function ye(e=[],t={}){if(typeof t.renderMapView=="function")return t.renderMapView();const a=e.filter(n=>R(n)).slice(0,8);return e.length?`
    <div class="space-y-4">
      <div class="relative overflow-hidden border border-slate-200 bg-slate-200 shadow-sm" style="height:24rem; border-radius:2.5rem;">
        <div class="absolute inset-0" style="background:linear-gradient(135deg,#e0f7fb 0%,#dbeafe 45%,#e2e8f0 100%);"></div>
        <div class="absolute inset-0 opacity-60" style="background-image:linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px); background-size:42px 42px;"></div>
        ${a.map((n,s)=>xe(n,s,t)).join("")}
        <div class="absolute left-4 right-4 bottom-4">
          <div class="bg-white/95 backdrop-blur-xl border border-white/50 shadow-lg p-4" style="border-radius:1.75rem;">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Hotels</p>
            <p class="mt-1 text-sm font-black text-slate-900">${t.escapeHtml(String(e.length))} ${e.length===1?"Hotel":"Hotels"}</p>
          </div>
        </div>
      </div>
      ${a.length?"":`
        <div class="bg-white border border-slate-100 shadow-sm p-5 text-[11px] font-bold text-slate-400" style="border-radius:2rem;">
          Keine Hotel-Koordinaten fuer dieses Reiseziel gefunden.
        </div>
      `}
    </div>
  `:q(e,t)}function we({state:e,dataLoaded:t,section:a,deps:n}={}){const s=B(e,a.key,n).map(p=>I({...p,__marketplaceType:T(p,n)},a)),i=be(e),l=!!i.query,r=l?s.filter(p=>ee(p,i.query)):s.slice(0,j),c=r.slice(0,j),u=l?i.activeTab:"offers",d=t?.restaurants===!0,f=u==="map"?ye(c,n):u==="hotels"?q(c,n):ve(c,n);return`
    <section id="travelView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${me({travel:i,deps:n})}
      <div id="travelBenko" data-travel-benko style="margin-top:-1.75rem; border-top-left-radius:2.5rem; border-top-right-radius:2.5rem; background:#f8fafc; padding:2rem 1.5rem 6.5rem;">
        ${ge({activeTab:u,hasDestination:l,hotelCount:r.length,deps:n})}
        <div class="mt-5">
          ${d||s.length?f:A(a,n)}
        </div>
      </div>
    </section>
  `}function ke({state:e={},dataLoaded:t=null,sectionKey:a="restaurants",escapeHtmlFn:n,iconFn:s,getOptimizedImageUrlFn:i,isPlaceholderUrlFn:l,placeholderImage:r="",normalizeRestaurantTypeFn:c,normalizeLeadTypeKeyFn:u,resolveRestaurantLogoFn:d,renderMapViewFn:f}={}){const p=$[F(a)]||$.restaurants,k=H(n,(m="")=>String(m||"")),S=H(s,()=>""),b={escapeHtml:k,icon:S,getOptimizedImageUrl:i,isPlaceholderUrl:l,placeholderImage:r,resolveRestaurantLogo:d,renderMapView:f,normalizeRestaurantType:c,normalizeLeadTypeKey:u},L=t?.restaurants===!0;if(p.key==="travel")return we({state:e,dataLoaded:t,section:p,deps:b});if(p.key==="restaurants")return de({state:e,dataLoaded:t,section:p,deps:b});const C=B(e,p.key,b).slice(0,j).map(m=>I({...m,__marketplaceType:T(m,b)},p)),D=C.slice(0,M);return`
    <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      ${C.length?`
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
            ${D.map(m=>U(m,b)).join("")}
          </div>
        </div>

        <div class="space-y-4">
          ${C.map(m=>V(m,b)).join("")}
        </div>
      `:L?_(p,b):A(p,b)}
    </section>
  `}export{B as filterMarketplaceBusinessesCore,ke as renderMarketplaceViewCore,X as resolveMarketplaceSectionForBusinessCore};
