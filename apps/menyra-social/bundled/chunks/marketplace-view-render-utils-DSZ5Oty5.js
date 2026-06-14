const b=Object.freeze({restaurants:Object.freeze({key:"restaurants",title:"Restaurants",emptyTitle:"Noch keine Restaurants",emptyBody:"Keine passenden Profile gefunden.",icon:"utensils",typeKeys:Object.freeze(["restaurant","cafe","coffee","fastfood","food"])}),travel:Object.freeze({key:"travel",title:"Travel",emptyTitle:"Noch keine Travel-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"plane",typeKeys:Object.freeze(["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"])}),shopping:Object.freeze({key:"shopping",title:"Shopping",emptyTitle:"Noch keine Shopping-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"shopping-bag",typeKeys:Object.freeze(["ecommerce"])})}),x=new Map;Object.values(b).forEach(e=>{e.typeKeys.forEach(t=>{x.set(t,e.key)})});const M=8,R=24;function v(e,t=()=>""){return typeof e=="function"?e:t}function r(e=""){return String(e||"").trim()}function k(e=""){const t=r(e).toLowerCase();return t?t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):""}function w(e=""){const t=k(e);return t==="restaurant"?"restaurants":["hotel","hotels","motel","motels"].includes(t)?"travel":["shop","ecommerce","e_commerce","shopping"].includes(t)?"shopping":b[t]?t:"restaurants"}function _(e=""){const t=k(e);return t?t==="e_commerce"||t==="online_shop"||t==="onlineshop"||t==="shop"||t==="store"?"ecommerce":t==="coffee"||t==="coffe"||t==="kaffee"?"cafe":t==="fast_food"||t==="snack"||t==="imbiss"?"fastfood":t==="hotels"?"hotel":t==="motels"?"motel":t:""}function I(e={}){return[e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType]}function $(e={},{normalizeRestaurantType:t,normalizeLeadTypeKey:n}={}){const a=typeof t=="function"?t:(o=>o),s=typeof n=="function"?n:(o=>o),i=I(e);for(const o of i){const c=_(a(o)||s(o)||o);if(c)return c}const l=[e.name,e.restaurantName,e.businessName,e.description,e.bio].map(o=>r(o).toLowerCase()).join(" ");return/\bhotel(s)?\b/.test(l)?"hotel":/\bmotel(s)?\b/.test(l)?"motel":/\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b/.test(l)?"cafe":/\bfast\s*food\b|\bfastfood\b/.test(l)?"fastfood":/\be-?commerce\b|\bonline\s*shop\b/.test(l)?"ecommerce":/\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b/.test(l)?"restaurant":""}function H(e={},t={}){const n=$(e,t);return x.get(n)||""}function d(e={}){return r(e.canonicalRestaurantId||e.restaurantId||e.id||e.landingRestaurantId||"")}function g(e={}){return r(e.name||e.restaurantName||e.businessName||e.displayName||"Business")}function T(e={}){const t=r(e.city||e.locationCity||e.primaryCity),n=r(e.address||e.location||e.primaryAddress);return t&&n&&t!==n?`${t} - ${n}`:t||n||"Standort folgt"}function E(e={}){const t=e.openingHours||e.openHours||e.hours||e.businessHours||e.workingHours||"";if(typeof t=="string"&&r(t))return r(t);if(t&&typeof t=="object"){const n=Object.values(t).map(r).filter(Boolean);if(n.length)return n[0]}return"Oeffnungszeiten folgen"}function K(e={}){return r(e.description||e.bio||e.about||e.shortDescription||"")}function z(e={}){const t=Number(e.rating??e.avgRating??e.score??e.publicRating??0);return!Number.isFinite(t)||t<=0?"":Math.min(5,Math.max(1,t)).toFixed(1)}function N(e={},{getOptimizedImageUrl:t,resolveRestaurantLogo:n,placeholderImage:a=""}={}){const s=d(e),i=r(e.logoUrl||e.logo||e.logoURL||e.heroUrl||e.coverUrl||e.imageUrl||e.img||""),o=(s&&typeof n=="function"?r(n(s,i,"medium")):i)||i||a;return(typeof t=="function"?r(t(o,"medium")):o)||a||""}function O(e={}){const t=Number(e.rating??e.avgRating??e.publicRating??0),n=Number(e.score??e.publicScore??0),a=Number(e.followersCount??e.followerCount??0),s=Number(e.postsCount??e.postCount??0),i=Number(e.updatedAt?.seconds||e.createdAt?.seconds||0);return(Number.isFinite(t)?t*1e3:0)+(Number.isFinite(n)?n:0)+(Number.isFinite(a)?Math.min(a,500):0)+(Number.isFinite(s)?Math.min(s,200):0)+(Number.isFinite(i)?Math.min(i/1e5,100):0)}function A(e={},t={}){const n=new Map,a=(s={})=>{if(!s||typeof s!="object")return;const i=d(s);if(!i)return;const l=n.get(i)||{};n.set(i,{...l,...s,id:i})};return(Array.isArray(e.bootstrapRestaurantPreview)?e.bootstrapRestaurantPreview:[]).forEach(a),(Array.isArray(e.restaurants)?e.restaurants:[]).forEach(a),Array.from(n.values()).map(s=>({...s,__marketplaceSection:H(s,t),__marketplaceScore:O(s)})).filter(s=>s.__marketplaceSection).sort((s,i)=>i.__marketplaceScore-s.__marketplaceScore||g(s).localeCompare(g(i)))}function F(e={},t="",n={}){const a=w(t);return A(e,n).filter(s=>s.__marketplaceSection===a)}function S(e="",t="",{escapeHtml:n,isPlaceholderUrl:a,extraClass:s=""}={}){const i=r(e),l=!i||typeof a=="function"&&a(i);return`
    <img
      src="${n(i)}"
      alt="${n(t)}"
      loading="lazy"
      class="w-full h-full object-cover bg-slate-100 ${s}"
      ${l?'data-placeholder-image="true"':""}
    />
  `}function P(e={},t={}){const n=t.escapeHtml,a=t.icon,s=g(e),i=d(e),l=N(e,t),o=z(e),c=T(e);return`
    <button type="button" data-marketplace-open-business="${n(i)}" class="shrink-0 w-44 text-left rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <div class="h-28 bg-slate-100 overflow-hidden">
        ${S(l,s,t)}
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest line-clamp-1">${n(e.__marketplaceTypeLabel||"Top")}</span>
          ${o?`<span class="text-[10px] font-black text-amber-500 flex items-center gap-1">${a("star","w-3 h-3 fill-current")} ${n(o)}</span>`:""}
        </div>
        <h3 class="text-sm font-black text-slate-900 leading-tight line-clamp-2">${n(s)}</h3>
        <p class="mt-2 text-[10px] font-bold text-slate-400 leading-4 line-clamp-1">${n(c)}</p>
      </div>
    </button>
  `}function U(e={},t={}){const n=t.escapeHtml,a=t.icon,s=g(e),i=d(e),l=N(e,t),o=z(e),c=T(e),y=E(e),m=K(e),p=r(e.__marketplaceTypeLabel||e.type||e.customerType||"");return`
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <button type="button" data-marketplace-open-business="${n(i)}" class="w-full text-left active:scale-[0.99] transition-transform">
        <div class="h-48 bg-slate-100 overflow-hidden">
          ${S(l,s,t)}
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              ${p?`<p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">${n(p)}</p>`:""}
              <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight">${n(s)}</h3>
            </div>
            ${o?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${a("star","w-3 h-3 fill-current")} ${n(o)}</span>`:""}
          </div>
          ${m?`<p class="mt-3 text-xs font-semibold text-slate-500 leading-5 line-clamp-2">${n(m)}</p>`:""}
          <div class="mt-4 grid grid-cols-1 gap-2 text-[11px] font-bold text-slate-500">
            <div class="flex items-center gap-2 min-w-0">
              ${a("map-pin","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${n(c)}</span>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              ${a("clock","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${n(y)}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  `}function D(e={},t={}){const n=r(e.__marketplaceType||e.type||e.customerType||""),a=_(n);return{...e,__marketplaceTypeLabel:{restaurant:"Restaurant",cafe:"Cafe",coffee:"Cafe",fastfood:"Fastfood",hotel:"Hotel",motel:"Motel",ecommerce:"E-Commerce"}[a]||t.title,__marketplaceType:a}}function Y(e={},t={}){const n=t.escapeHtml,a=t.icon;return`
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-5 rounded-[1.5rem] bg-slate-100 text-slate-400 flex items-center justify-center">
        ${a(e.icon,"w-6 h-6")}
      </div>
      <h3 class="text-lg font-black tracking-tight text-slate-900">${n(e.emptyTitle)}</h3>
      <p class="mt-2 text-xs font-semibold text-slate-400 leading-5">${n(e.emptyBody)}</p>
    </div>
  `}function V(e={},t={}){t.escapeHtml;const n=t.icon;return`
    <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
      ${n("loader-2","w-4 h-4 animate-spin")}
      Daten werden geladen ...
    </div>
  `}function q({state:e={},dataLoaded:t=null,sectionKey:n="restaurants",escapeHtmlFn:a,iconFn:s,getOptimizedImageUrlFn:i,isPlaceholderUrlFn:l,placeholderImage:o="",normalizeRestaurantTypeFn:c,normalizeLeadTypeKeyFn:y,resolveRestaurantLogoFn:m}={}){const p=b[w(n)]||b.restaurants,B=v(a,(u="")=>String(u||"")),C=v(s,()=>""),f={escapeHtml:B,icon:C,getOptimizedImageUrl:i,isPlaceholderUrl:l,placeholderImage:o,resolveRestaurantLogo:m,normalizeRestaurantType:c,normalizeLeadTypeKey:y},h=F(e,p.key,f).slice(0,R).map(u=>D({...u,__marketplaceType:$(u,f)},p)),L=h.slice(0,M),j=t?.restaurants===!0;return`
    <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      ${h.length?`
        <div style="margin-bottom:10rem;">
          <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
            ${L.map(u=>P(u,f)).join("")}
          </div>
        </div>

        <div class="space-y-4">
          ${h.map(u=>U(u,f)).join("")}
        </div>
      `:j?Y(p,f):V(p,f)}
    </section>
  `}export{F as filterMarketplaceBusinessesCore,q as renderMarketplaceViewCore,H as resolveMarketplaceSectionForBusinessCore};
