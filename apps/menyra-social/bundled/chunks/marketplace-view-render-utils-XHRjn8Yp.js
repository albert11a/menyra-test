const z=Object.freeze({restaurants:Object.freeze({key:"restaurants",title:"Restaurants",emptyTitle:"Noch keine Restaurants",emptyBody:"Keine passenden Profile gefunden.",icon:"utensils",typeKeys:Object.freeze(["restaurant","cafe","coffee","fastfood","food"])}),travel:Object.freeze({key:"travel",title:"Travel",emptyTitle:"Noch keine Travel-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"plane",typeKeys:Object.freeze(["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"])}),shopping:Object.freeze({key:"shopping",title:"Shopping",emptyTitle:"Noch keine Shopping-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"shopping-bag",typeKeys:Object.freeze(["ecommerce"])})}),F=new Map;Object.values(z).forEach(e=>{e.typeKeys.forEach(t=>{F.set(t,e.key)})});const P=8,O=24,J="#ff4f3f",Q="mnyra_social_feed_viewer_location_v1",v="#00cce5",W=Object.freeze([Object.freeze(["tirana","tirane"]),Object.freeze(["durres","durresi"]),Object.freeze(["vlora","vlore"]),Object.freeze(["shkoder","shkodra"]),Object.freeze(["shengjin","shëngjin","shen gjin","shengjini"]),Object.freeze(["ksamil","ksamili"]),Object.freeze(["dhermi","dhërmi","dhermiu"]),Object.freeze(["velipoje","velipojë","velipoja"]),Object.freeze(["theth","thethi"]),Object.freeze(["valbone","valbonë","valbona"]),Object.freeze(["elbasan","elbasani"]),Object.freeze(["fier","fieri"]),Object.freeze(["korce","korca"]),Object.freeze(["sarande","saranda"]),Object.freeze(["berat","berati"]),Object.freeze(["gjirokaster","gjirokastra"]),Object.freeze(["kukes","kukesi"]),Object.freeze(["lezhe","lezha"]),Object.freeze(["pogradec","pogradeci"]),Object.freeze(["kruje","kruja"]),Object.freeze(["fushe kruje","fushë krujë","fushe-kruje","fush kruje"]),Object.freeze(["lushnje","lushnja"]),Object.freeze(["himare","himarë","himara"]),Object.freeze(["kavaje","kavajë","kavaja"]),Object.freeze(["kamze","kamëz","kamza"]),Object.freeze(["vore","vorë","vora"]),Object.freeze(["divjake","divjakë","divjaka"]),Object.freeze(["permet","përmet","permeti"]),Object.freeze(["tepelene","tepelenë","tepelena"]),Object.freeze(["delvine","delvinë","delvina"]),Object.freeze(["peshkopi","peshkopia","diber","dibër"]),Object.freeze(["burrel","burreli","mat"]),Object.freeze(["puke","pukë","puka"]),Object.freeze(["bajram curri","bajramcurri","tropoje","tropojë"]),Object.freeze(["krume","krumë","has"]),Object.freeze(["lac","laç","kurbin"]),Object.freeze(["orikum","orikumi"]),Object.freeze(["golem","golemi"]),Object.freeze(["jale","jalë","jali"]),Object.freeze(["qepare","qeparo","qeparoi"]),Object.freeze(["borsh","borshi"]),Object.freeze(["lukove","lukovë","lukova"]),Object.freeze(["palase","palasë","palasa"]),Object.freeze(["drimadhe","drymades","drimadhes"]),Object.freeze(["spille","spilleja"]),Object.freeze(["gjiri i lalzit","lalzi","lalez","lalëz"])]);function M(e,t=()=>""){return typeof e=="function"?e:t}function l(e=""){return String(e||"").trim()}function y(e=""){const t=l(e).toLowerCase();return t?t.replace(/[ëèéê]/g,"e").replace(/[çćč]/g,"c").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):""}function X(e=""){const t=y(e);if(!t)return[];const a=new Set([t]);return W.forEach(s=>{const n=s.map(y).filter(Boolean);n.includes(t)&&n.forEach(i=>a.add(i))}),Array.from(a)}function K(e=""){const t=y(e);return t==="restaurant"?"restaurants":["hotel","hotels","motel","motels"].includes(t)?"travel":["shop","ecommerce","e_commerce","shopping"].includes(t)?"shopping":z[t]?t:"restaurants"}function U(e=""){const t=y(e);return t?t==="e_commerce"||t==="online_shop"||t==="onlineshop"||t==="shop"||t==="store"?"ecommerce":t==="coffee"||t==="coffe"||t==="kaffee"?"cafe":t==="fast_food"||t==="snack"||t==="imbiss"?"fastfood":t==="hotels"?"hotel":t==="motels"?"motel":t:""}function Z(e={}){return[e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType]}function _(e={},{normalizeRestaurantType:t,normalizeLeadTypeKey:a}={}){const s=typeof t=="function"?t:(o=>o),n=typeof a=="function"?a:(o=>o),i=Z(e);for(const o of i){const c=U(s(o)||n(o)||o);if(c)return c}const r=[e.name,e.restaurantName,e.businessName,e.description,e.bio].map(o=>l(o).toLowerCase()).join(" ");return/\bhotel(s)?\b/.test(r)?"hotel":/\bmotel(s)?\b/.test(r)?"motel":/\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b/.test(r)?"cafe":/\bfast\s*food\b|\bfastfood\b/.test(r)?"fastfood":/\be-?commerce\b|\bonline\s*shop\b/.test(r)?"ecommerce":/\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b/.test(r)?"restaurant":""}function ee(e={},t={}){const a=_(e,t);return F.get(a)||""}function h(e={}){return l(e.canonicalRestaurantId||e.restaurantId||e.id||e.landingRestaurantId||"")}function g(e={}){return l(e.name||e.restaurantName||e.businessName||e.displayName||"Business")}function k(e={}){const t=l(e.city||e.locationCity||e.primaryCity),a=l(e.address||e.location||e.primaryAddress);return t&&a&&t!==a?`${t} - ${a}`:t||a||"Standort folgt"}function te(e={}){const t=[e.id,e.restaurantId,e.canonicalRestaurantId,e.publicSlug,e.landingSlug,e.handle,e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType,e.city,e.locationCity,e.primaryCity,e.address,e.location,e.primaryAddress,e.country,e.region,e.district,e.name,e.restaurantName,e.businessName,e.displayName,e.description,e.bio,e.about];return Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||t.push(a.city,a.address,a.country,a.region,a.name)}),t}function ae(e={},t=""){const a=X(t);if(!a.length)return!0;const s=te(e).map(y).filter(Boolean).join("_");return a.some(n=>{const i=n.split("_").filter(Boolean);return s.includes(n)?!0:i.length>0&&i.every(r=>s.includes(r))})}function B(e={}){const t=[[e.lat,e.lng],[e.latitude,e.longitude],[e.gpsLat,e.gpsLng],[e.geo?.lat,e.geo?.lng],[e.geo?.latitude,e.geo?.longitude],[e.coords?.lat,e.coords?.lng],[e.coords?.latitude,e.coords?.longitude],[e.location?.lat,e.location?.lng]];for(const[a,s]of t){const n=Number(String(a??"").replace(",",".")),i=Number(String(s??"").replace(",","."));if(Number.isFinite(n)&&Number.isFinite(i)&&Math.abs(n)<=90&&Math.abs(i)<=180){if(Math.abs(n)<1e-6&&Math.abs(i)<1e-6)continue;return{lat:n,lng:i}}}if(Array.isArray(e.locations))for(const a of e.locations){const s=B(a||{});if(s)return s}return null}function V(e={}){const t=e.openingHours||e.openHours||e.hours||e.businessHours||e.workingHours||"";if(typeof t=="string"&&l(t))return l(t);if(t&&typeof t=="object"){const a=Object.values(t).map(l).filter(Boolean);if(a.length)return a[0]}return"Oeffnungszeiten folgen"}function se(e={}){return l(e.phone||e.telephone||e.contactPhone||e.ownerPhone||"")}function ne(e={}){return l(e.description||e.bio||e.about||e.shortDescription||"")}function S(e={}){const t=Number(e.rating??e.avgRating??e.score??e.publicRating??0);return!Number.isFinite(t)||t<=0?"":Math.min(5,Math.max(1,t)).toFixed(1)}function L(e={},{getOptimizedImageUrl:t,resolveRestaurantLogo:a,placeholderImage:s=""}={}){const n=h(e),i=l(e.logoUrl||e.logo||e.logoURL||e.heroUrl||e.coverUrl||e.imageUrl||e.img||""),o=(n&&typeof a=="function"?l(a(n,i,"medium")):i)||i||s;return(typeof t=="function"?l(t(o,"medium")):o)||s||""}function ie(e={},{getOptimizedImageUrl:t,placeholderImage:a=""}={}){const n=l(e.titleImageUrl||e.coverImageUrl||e.coverImage||e.coverUrl||e.heroImageUrl||e.heroUrl||e.imageUrl||e.bestSpotLogoUrl||e.spotLogoUrl||e.logoUrl||e.logo||"")||a;return(typeof t=="function"?l(t(n,"large")):n)||a||""}function re(e={}){return l(e.cuisine||e.kitchen||e.foodType||e.categoryLabel||e.__marketplaceTypeLabel||e.type||e.customerType||"")}function oe(e={}){return l(e.priceRange||e.priceLevel||e.priceLabel||e.budget||"")}function A(e,t=""){return typeof e=="string"?l(e):e===!0?l(t):""}function le(e={}){const t=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{},a=[A(e.gardenTerraceText||e.gardenTerrace||e.gardenOrTerrace||t.gardenTerrace,"Gastgarten"),A(e.accessibilityText||e.barrierFreeText||e.accessibleText||e.barrierefrei||e.accessible||t.accessibility,"Barrierefrei"),A(e.veganOptionsText||e.veganOptions||e.veganText||e.vegan||t.veganOptions,"Vegane Optionen")].filter(Boolean);if(a.length)return a.slice(0,3);const s=Array.isArray(e.features)?e.features.map(l).filter(Boolean):[];if(s.length)return s.slice(0,3);const n=l(e.features||e.amenities||"");return n?n.split(/[,;|]/).map(l).filter(Boolean).slice(0,3):[]}function ce(e="",t="",a={}){const s=a.icon,n=a.escapeHtml,i=l(t),o=`xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${i?` class="${n(i)}"`:""} aria-hidden="true" focusable="false"`;return e==="share-2"?`<svg ${o}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.59 13.51 6.83 3.98"></path><path d="m15.41 6.51-6.82 3.98"></path></svg>`:e==="phone"?`<svg ${o}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`:e==="book-open"?`<svg ${o}><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>`:typeof s=="function"?s(e,t):""}function ue(e={}){const t=Number(e.rating??e.avgRating??e.publicRating??0),a=Number(e.score??e.publicScore??0),s=Number(e.followersCount??e.followerCount??0),n=Number(e.postsCount??e.postCount??0),i=Number(e.updatedAt?.seconds||e.createdAt?.seconds||0);return(Number.isFinite(t)?t*1e3:0)+(Number.isFinite(a)?a:0)+(Number.isFinite(s)?Math.min(s,500):0)+(Number.isFinite(n)?Math.min(n,200):0)+(Number.isFinite(i)?Math.min(i/1e5,100):0)}function pe(e={},t={}){const a=new Map,s=(n={})=>{if(!n||typeof n!="object")return;const i=h(n);if(!i)return;const r=a.get(i)||{};a.set(i,{...r,...n,id:i})};return(Array.isArray(e.bootstrapRestaurantPreview)?e.bootstrapRestaurantPreview:[]).forEach(s),(Array.isArray(e.restaurants)?e.restaurants:[]).forEach(s),Array.from(a.values()).map(n=>({...n,__marketplaceSection:ee(n,t),__marketplaceScore:ue(n)})).filter(n=>n.__marketplaceSection).sort((n,i)=>i.__marketplaceScore-n.__marketplaceScore||g(n).localeCompare(g(i)))}function I(e={},t="",a={}){const s=K(t);return pe(e,a).filter(n=>n.__marketplaceSection===s)}function w(e="",t="",{escapeHtml:a,isPlaceholderUrl:s,extraClass:n=""}={}){const i=l(e),r=!i||typeof s=="function"&&s(i);return`
    <img
      src="${a(i)}"
      alt="${a(t)}"
      loading="lazy"
      class="w-full h-full object-cover bg-slate-100 ${n}"
      ${r?'data-placeholder-image="true"':""}
    />
  `}function q(e={},t={}){const a=t.escapeHtml,s=t.icon,n=g(e),i=h(e),r=L(e,t),o=S(e),c=k(e);return`
    <button type="button" data-marketplace-open-business="${a(i)}" class="shrink-0 w-44 text-left rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <div class="h-28 bg-slate-100 overflow-hidden">
        ${w(r,n,t)}
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest line-clamp-1">${a(e.__marketplaceTypeLabel||"Top")}</span>
          ${o?`<span class="text-[10px] font-black text-amber-500 flex items-center gap-1">${s("star","w-3 h-3 fill-current")} ${a(o)}</span>`:""}
        </div>
        <h3 class="text-sm font-black text-slate-900 leading-tight line-clamp-2">${a(n)}</h3>
        <p class="mt-2 text-[10px] font-bold text-slate-400 leading-4 line-clamp-1">${a(c)}</p>
      </div>
    </button>
  `}function D(e={},t={}){const a=t.escapeHtml,s=t.icon,n=g(e),i=h(e),r=L(e,t),o=S(e),c=k(e),p=V(e),f=ne(e),d=l(e.__marketplaceTypeLabel||e.type||e.customerType||"");return`
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <button type="button" data-marketplace-open-business="${a(i)}" class="w-full text-left active:scale-[0.99] transition-transform">
        <div class="h-48 bg-slate-100 overflow-hidden">
          ${w(r,n,t)}
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              ${d?`<p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">${a(d)}</p>`:""}
              <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight">${a(n)}</h3>
            </div>
            ${o?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${s("star","w-3 h-3 fill-current")} ${a(o)}</span>`:""}
          </div>
          ${f?`<p class="mt-3 text-xs font-semibold text-slate-500 leading-5 line-clamp-2">${a(f)}</p>`:""}
          <div class="mt-4 grid grid-cols-1 gap-2 text-[11px] font-bold text-slate-500">
            <div class="flex items-center gap-2 min-w-0">
              ${s("map-pin","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${a(c)}</span>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              ${s("clock","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${a(p)}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  `}function fe(e={},t={}){const a=t.escapeHtml,s=t.icon,n=(N,Y)=>ce(N,Y,t),i=g(e),r=h(e),o=ie(e,t),c=L(e,t),p=S(e),f=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),d=p||"0.0",u=Number.isFinite(f)&&f>0?f:0,$=re(e),R=oe(e)||"€€ - €€€",b=k(e),j=se(e),x=V(e),T=le(e),m=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
    <article class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col" style="border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);">
      <div class="h-44 relative overflow-hidden group">
        ${w(o,i,{...t,extraClass:"transition-transform duration-700 group-hover:scale-105"})}
        <div class="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-black/20" style="background:linear-gradient(to top,#fff 0%,rgba(255,255,255,0.2) 50%,rgba(0,0,0,0.2) 100%);"></div>

        <div class="absolute top-3.5 right-3.5 flex gap-2 z-10" style="top:0.875rem;right:0.875rem;">
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            aria-label="Favorit"
          >
            ${s("heart",`w-4 h-4 ${m?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
          </button>
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Teilen"
            aria-label="Teilen"
          >
            ${n("share-2","w-4 h-4")}
          </button>
        </div>

        <div class="absolute bottom-3.5 right-4 bg-slate-900/90 text-white font-medium px-2.5 py-0.5 rounded-md text-[9px] tracking-wider shadow" style="bottom:0.875rem;background-color:rgba(15,23,42,0.9);">
          ${a(R)}
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${w(c,`${i} Logo`,{...t,extraClass:"rounded-full"})}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-1">
            <div class="flex text-amber-500">
              ${s("star","w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${a(d)}</span>
            <span class="text-[11px] text-slate-400">(${a(String(u))} Bewertungen)</span>
          </div>

          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${a(i)}</h2>
          ${$?`<p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5" style="margin-top:0.125rem;">${a($)}</p>`:""}
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${s("map-pin","w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${a(b)}</span>
          </div>
          ${j?`
            <div class="flex items-center gap-3">
              ${n("phone","w-4 h-4 text-slate-400 shrink-0")}
              <span class="text-[11px] text-slate-600">${a(j)}</span>
            </div>
          `:""}
          <div class="flex items-center gap-3">
            ${s("clock","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(x)}</span>
          </div>
        </div>

        ${T.length?`
          <div class="flex flex-wrap gap-1.5">
            ${T.map(N=>`
              <span class="text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100">${a(N)}</span>
            `).join("")}
          </div>
        `:""}

        <hr class="border-slate-100" />

        <div class="grid grid-cols-2 gap-2.5 mt-0.5">
          <button
            type="button"
            data-marketplace-open-business="${a(r)}"
            data-tab="profile"
            class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer"
          >
            ${s("user","w-3.5 h-3.5 text-slate-400")}
            Profil
          </button>

          <button
            type="button"
            data-marketplace-open-business="${a(r)}"
            data-tab="menu"
            class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            ${n("book-open","w-3.5 h-3.5 text-slate-200")}
            Menu
          </button>
        </div>
      </div>
    </article>
  `}function H(e={},t={}){const a=l(e.__marketplaceType||e.type||e.customerType||""),s=U(a);return{...e,__marketplaceTypeLabel:{restaurant:"Restaurant",cafe:"Cafe",coffee:"Cafe",fastfood:"Fastfood",hotel:"Hotel",motel:"Motel",ecommerce:"E-Commerce"}[s]||t.title,__marketplaceType:s}}function C(e={},t={}){const a=t.escapeHtml,s=t.icon;return`
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-5 rounded-[1.5rem] bg-slate-100 text-slate-400 flex items-center justify-center">
        ${s(e.icon,"w-6 h-6")}
      </div>
      <h3 class="text-lg font-black tracking-tight text-slate-900">${a(e.emptyTitle)}</h3>
      <p class="mt-2 text-xs font-semibold text-slate-400 leading-5">${a(e.emptyBody)}</p>
    </div>
  `}function E(e={},t={}){t.escapeHtml;const a=t.icon;return`
    <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
      ${a("loader-2","w-4 h-4 animate-spin")}
      Daten werden geladen ...
    </div>
  `}function de(){const e=globalThis?.localStorage||null;if(!e)return null;try{const t=e.getItem(Q);if(!t)return null;const a=JSON.parse(t),s=Number(a?.lat??a?.latitude),n=Number(a?.lng??a?.lon??a?.longitude);return!Number.isFinite(s)||!Number.isFinite(n)?null:{lat:s,lng:n,label:l(a?.label||a?.city||""),city:l(a?.city||a?.label||""),source:l(a?.source||"")}}catch{return null}}function be({deps:e}={}){const t=e.icon;return`
    <div id="restaurantsSearchTop" data-restaurant-search-top style="background:${J};">
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
  `}function me({items:e=[],bestItems:t=[],section:a={},deps:s={}}={}){return e.length?`
    <div style="margin-bottom:2rem;">
      <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
        ${t.map(n=>q(n,s)).join("")}
      </div>
    </div>

    <div class="space-y-4">
      ${e.map(n=>fe(n,s)).join("")}
    </div>
  `:C(a,s)}function ge({state:e,dataLoaded:t,section:a,deps:s}={}){const n=I(e,a.key,s).map(d=>H({...d,__marketplaceType:_(d,s)},a)),r=!!de(),o=n.slice(0,O),c=o.slice(0,P),f=t?.restaurants===!0||n.length?me({items:o,bestItems:c,section:a,deps:s}):E(a,s);return r?`
      <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
        ${f}
      </section>
    `:`
    <section id="restaurantsView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${be({deps:s})}
      <div id="restaurantsBenko" data-restaurants-benko class="loc-bento loc-bento--feed-content">
      </div>
    </section>
  `}function he(e={}){const t=e?.travelView&&typeof e.travelView=="object"?e.travelView:{},a=l(t.query||""),s=l(t.activeTab||"").toLowerCase(),n=["offers","hotels","map"].includes(s)?s:a?"hotels":"offers";return{query:a,activeTab:a?n:"offers",notice:l(t.notice||"")}}function ve({travel:e,deps:t}={}){const a=t.escapeHtml,s=t.icon;return`
    <div id="travelSearchTop" data-travel-search-top style="background:${v}; padding:4.6rem 1.5rem 6.35rem;">
      <div class="bg-white border border-white/60 shadow-sm" style="border-radius:2rem; padding:1.4rem;">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style="background:${v};">
            ${s("plane","w-5 h-5")}
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
            ${s("search","w-4 h-4")}
          </button>
        </div>
        <div id="travelDestinationSuggestions" data-travel-destination-suggestions role="listbox" aria-hidden="true" class="travel-destination-suggestions"></div>
        ${e.notice?`
          <p data-travel-notice class="mt-3 text-[11px] font-black uppercase tracking-wider text-rose-500">${a(e.notice)}</p>
        `:""}
      </div>
    </div>
  `}function xe({activeTab:e,hasDestination:t,hotelCount:a,deps:s}={}){const n=s.escapeHtml;return`
    <div class="bg-white/70 p-1.5 border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm" style="border-radius:2rem;">
      ${[{id:"offers",label:"Ofertat"},{id:"hotels",label:"Hotels"},{id:"map",label:"Karte"}].map(r=>{const o=e===r.id,c=!t&&r.id!=="offers",p=r.id==="hotels"&&t?` ${a}`:"";return`
          <button
            type="button"
            data-travel-tab="${n(r.id)}"
            class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${o?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":c?"text-slate-300":"text-slate-400 hover:text-slate-600"}"
          >
            ${n(`${r.label}${p}`)}
          </button>
        `}).join("")}
    </div>
  `}function ye(e={},t={}){const a=t.escapeHtml,s=t.icon,n=g(e),i=h(e),r=L(e,t),o=k(e),c=S(e);return`
    <button type="button" data-marketplace-open-business="${a(i)}" class="w-full text-left bg-white border border-slate-100 shadow-sm active:scale-[0.99] transition-transform overflow-hidden" style="border-radius:2rem;">
      <div class="h-40 bg-slate-100 overflow-hidden">
        ${w(r,n,t)}
      </div>
      <div class="p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[9px] font-black uppercase tracking-widest mb-1" style="color:${v};">Ofertat</p>
            <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight line-clamp-2">${a(n)}</h3>
          </div>
          ${c?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${s("star","w-3 h-3 fill-current")} ${a(c)}</span>`:""}
        </div>
        <div class="mt-4 flex items-center gap-2 min-w-0 text-[11px] font-bold text-slate-500">
          ${s("map-pin","w-3.5 h-3.5 text-slate-400 shrink-0")}
          <span class="truncate">${a(o)}</span>
        </div>
      </div>
    </button>
  `}function we(e=[],t={}){const a=e.slice(0,4);return a.length?`
    <div class="space-y-4">
      ${a.map(s=>ye(s,t)).join("")}
    </div>
  `:C({emptyTitle:"Noch keine Angebote",emptyBody:"Keine passenden Hotel-Angebote gefunden.",icon:"plane"},t)}function G(e=[],t={}){return e.length?`
    <div class="space-y-4">
      ${e.map(a=>D(a,t)).join("")}
    </div>
  `:C({emptyTitle:"Keine Hotels gefunden",emptyBody:"Keine passenden Hotels fuer dieses Reiseziel gefunden.",icon:"plane"},t)}function ke(e={},t=0,a={}){const s=a.escapeHtml,n=B(e),i=g(e),r=h(e),o=k(e),c=18+t*23%58,p=22+t*17%46;return`
    <button
      type="button"
      data-marketplace-open-business="${s(r)}"
      class="absolute w-12 h-12 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center active:scale-95 transition-all"
      style="left:${c}%; top:${p}%; transform:translate(-50%,-50%); color:${v};"
      title="${s(`${i} - ${o}`)}"
    >
      ${a.icon("plane","w-5 h-5")}
      ${n?`<span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${s(`${n.lat.toFixed(5)}, ${n.lng.toFixed(5)}`)}</span>`:""}
    </button>
  `}function $e(e=[],t={}){if(typeof t.renderMapView=="function")return t.renderMapView();const a=e.filter(s=>B(s)).slice(0,8);return e.length?`
    <div class="space-y-4">
      <div class="relative overflow-hidden border border-slate-200 bg-slate-200 shadow-sm" style="height:24rem; border-radius:2.5rem;">
        <div class="absolute inset-0" style="background:linear-gradient(135deg,#e0f7fb 0%,#dbeafe 45%,#e2e8f0 100%);"></div>
        <div class="absolute inset-0 opacity-60" style="background-image:linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px); background-size:42px 42px;"></div>
        ${a.map((s,n)=>ke(s,n,t)).join("")}
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
  `:G(e,t)}function je({state:e,dataLoaded:t,section:a,deps:s}={}){const n=I(e,a.key,s).map(u=>H({...u,__marketplaceType:_(u,s)},a)),i=he(e),r=!!i.query,o=r?n.filter(u=>ae(u,i.query)):n.slice(0,O),c=o.slice(0,O),p=r?i.activeTab:"offers",f=t?.restaurants===!0,d=p==="map"?$e(c,s):p==="hotels"?G(c,s):we(c,s);return`
    <section id="travelView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${ve({travel:i,deps:s})}
      <div id="travelBenko" data-travel-benko style="margin-top:-1.75rem; border-top-left-radius:2.5rem; border-top-right-radius:2.5rem; background:#f8fafc; padding:2rem 1.5rem 6.5rem;">
        ${xe({activeTab:p,hasDestination:r,hotelCount:o.length,deps:s})}
        <div class="mt-5">
          ${f||n.length?d:E(a,s)}
        </div>
      </div>
    </section>
  `}function Te({state:e={},dataLoaded:t=null,sectionKey:a="restaurants",escapeHtmlFn:s,iconFn:n,getOptimizedImageUrlFn:i,isPlaceholderUrlFn:r,placeholderImage:o="",normalizeRestaurantTypeFn:c,normalizeLeadTypeKeyFn:p,resolveRestaurantLogoFn:f,renderMapViewFn:d}={}){const u=z[K(a)]||z.restaurants,$=M(s,(m="")=>String(m||"")),R=M(n,()=>""),b={escapeHtml:$,icon:R,getOptimizedImageUrl:i,isPlaceholderUrl:r,placeholderImage:o,resolveRestaurantLogo:f,renderMapView:d,normalizeRestaurantType:c,normalizeLeadTypeKey:p},j=t?.restaurants===!0;if(u.key==="travel")return je({state:e,dataLoaded:t,section:u,deps:b});if(u.key==="restaurants")return ge({state:e,dataLoaded:t,section:u,deps:b});const x=I(e,u.key,b).slice(0,O).map(m=>H({...m,__marketplaceType:_(m,b)},u)),T=x.slice(0,P);return`
    <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      ${x.length?`
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
            ${T.map(m=>q(m,b)).join("")}
          </div>
        </div>

        <div class="space-y-4">
          ${x.map(m=>D(m,b)).join("")}
        </div>
      `:j?C(u,b):E(u,b)}
    </section>
  `}export{I as filterMarketplaceBusinessesCore,Te as renderMarketplaceViewCore,ee as resolveMarketplaceSectionForBusinessCore};
