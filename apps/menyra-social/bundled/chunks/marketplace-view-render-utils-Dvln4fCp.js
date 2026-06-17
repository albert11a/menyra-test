const _=Object.freeze({restaurants:Object.freeze({key:"restaurants",title:"Restaurants",emptyTitle:"Noch keine Restaurants",emptyBody:"Keine passenden Profile gefunden.",icon:"utensils",typeKeys:Object.freeze(["restaurant","cafe","coffee","fastfood","food"])}),travel:Object.freeze({key:"travel",title:"Travel",emptyTitle:"Noch keine Travel-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"plane",typeKeys:Object.freeze(["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"])}),shopping:Object.freeze({key:"shopping",title:"Shopping",emptyTitle:"Noch keine Shopping-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"shopping-bag",typeKeys:Object.freeze(["ecommerce"])})}),V=new Map;Object.values(_).forEach(e=>{e.typeKeys.forEach(t=>{V.set(t,e.key)})});const q=8,L=24,se="#ff4f3f",ie="mnyra_social_feed_viewer_location_v1",x="#00cce5",G=35,le=Object.freeze([Object.freeze({label:"Prishtina",lat:42.6629,lng:21.1655}),Object.freeze({label:"Prizren",lat:42.2139,lng:20.7397}),Object.freeze({label:"Peja",lat:42.6591,lng:20.2883}),Object.freeze({label:"Gjakova",lat:42.3803,lng:20.4308}),Object.freeze({label:"Ferizaj",lat:42.3706,lng:21.1553}),Object.freeze({label:"Gjilan",lat:42.4635,lng:21.4699}),Object.freeze({label:"Mitrovica",lat:42.8914,lng:20.866}),Object.freeze({label:"Vushtrria",lat:42.8231,lng:20.9675}),Object.freeze({label:"Podujeva",lat:42.9106,lng:21.193}),Object.freeze({label:"Tirana",lat:41.3275,lng:19.8187}),Object.freeze({label:"Kukes",lat:42.0769,lng:20.4219}),Object.freeze({label:"Smederevo",lat:44.6644,lng:20.9276})]),oe=Object.freeze([Object.freeze(["tirana","tirane"]),Object.freeze(["durres","durresi"]),Object.freeze(["vlora","vlore"]),Object.freeze(["shkoder","shkodra"]),Object.freeze(["shengjin","shëngjin","shen gjin","shengjini"]),Object.freeze(["ksamil","ksamili"]),Object.freeze(["dhermi","dhërmi","dhermiu"]),Object.freeze(["velipoje","velipojë","velipoja"]),Object.freeze(["theth","thethi"]),Object.freeze(["valbone","valbonë","valbona"]),Object.freeze(["elbasan","elbasani"]),Object.freeze(["fier","fieri"]),Object.freeze(["korce","korca"]),Object.freeze(["sarande","saranda"]),Object.freeze(["berat","berati"]),Object.freeze(["gjirokaster","gjirokastra"]),Object.freeze(["kukes","kukesi"]),Object.freeze(["lezhe","lezha"]),Object.freeze(["pogradec","pogradeci"]),Object.freeze(["kruje","kruja"]),Object.freeze(["fushe kruje","fushë krujë","fushe-kruje","fush kruje"]),Object.freeze(["lushnje","lushnja"]),Object.freeze(["himare","himarë","himara"]),Object.freeze(["kavaje","kavajë","kavaja"]),Object.freeze(["kamze","kamëz","kamza"]),Object.freeze(["vore","vorë","vora"]),Object.freeze(["divjake","divjakë","divjaka"]),Object.freeze(["permet","përmet","permeti"]),Object.freeze(["tepelene","tepelenë","tepelena"]),Object.freeze(["delvine","delvinë","delvina"]),Object.freeze(["peshkopi","peshkopia","diber","dibër"]),Object.freeze(["burrel","burreli","mat"]),Object.freeze(["puke","pukë","puka"]),Object.freeze(["bajram curri","bajramcurri","tropoje","tropojë"]),Object.freeze(["krume","krumë","has"]),Object.freeze(["lac","laç","kurbin"]),Object.freeze(["orikum","orikumi"]),Object.freeze(["golem","golemi"]),Object.freeze(["jale","jalë","jali"]),Object.freeze(["qepare","qeparo","qeparoi"]),Object.freeze(["borsh","borshi"]),Object.freeze(["lukove","lukovë","lukova"]),Object.freeze(["palase","palasë","palasa"]),Object.freeze(["drimadhe","drymades","drimadhes"]),Object.freeze(["spille","spilleja"]),Object.freeze(["gjiri i lalzit","lalzi","lalez","lalëz"])]),re=Object.freeze([Object.freeze(["prishtina","prishtine","prishtin","pristina"]),Object.freeze(["ferizaj","ferizaji","uroshevac"]),Object.freeze(["peja","peje","pec"]),Object.freeze(["prizren","prizreni"]),Object.freeze(["gjakova","gjakove","djakova"]),Object.freeze(["gjilan","gjilani"]),Object.freeze(["mitrovica","mitrovice"]),Object.freeze(["vushtrria","vushtrri"]),Object.freeze(["podujeva","podujeve","podujevo","besiana"]),Object.freeze(["fushe kosove","fushe kosova","fush kosove","fush kosova"]),Object.freeze(["lipjan"]),Object.freeze(["suhareka","suhareke","theranda"]),Object.freeze(["rahovec","rahoveci"]),Object.freeze(["drenas","gllogoc"]),Object.freeze(["skenderaj","skenderaji"]),Object.freeze(["malisheva","malisheve"]),Object.freeze(["kamenica","kamenice","kamenica kosove"]),Object.freeze(["decan","decani"]),Object.freeze(["istog","istogu"]),Object.freeze(["klina","kline"]),Object.freeze(["vite","vitia"]),Object.freeze(["hani i elezit","hani elezit"])]),Y=Object.freeze(["city","locationCity","primaryCity","postalCity","address","primaryAddress","formattedAddress","fullAddress","addressText","streetAddress","street","locationLabel","displayLocation","locality","town","municipality","village","neighborhood","area","district","county","region","state","province","country","countryCode"]),U=Object.freeze([...Y,"label","name","title"]),ce=Object.freeze(["location","primaryLocation","businessLocation","venueLocation","addressInfo","place","geo","coords","coordinates","geoPoint"]);function D(e,t=()=>""){return typeof e=="function"?e:t}function r(e=""){return String(e||"").trim()}function m(e=""){const t=r(e).toLowerCase();return t?t.replace(/[ëèéê]/g,"e").replace(/[çćč]/g,"c").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):""}function X(e=""){const t=m(e);if(!t)return[];const a=new Set([t]);return oe.forEach(n=>{const s=n.map(m).filter(Boolean);s.includes(t)&&s.forEach(i=>a.add(i))}),Array.from(a)}function ue(e=""){const t=m(e);if(!t)return[];const a=new Set(X(e));return re.forEach(n=>{const s=n.map(m).filter(Boolean);s.includes(t)&&s.forEach(i=>a.add(i))}),Array.from(a)}function J(e=""){const t=m(e);return t==="restaurant"?"restaurants":["hotel","hotels","motel","motels"].includes(t)?"travel":["shop","ecommerce","e_commerce","shopping"].includes(t)?"shopping":_[t]?t:"restaurants"}function Q(e=""){const t=m(e);return t?t==="e_commerce"||t==="online_shop"||t==="onlineshop"||t==="shop"||t==="store"?"ecommerce":t==="coffee"||t==="coffe"||t==="coffee_shop"||t==="coffeeshop"||t==="kaffee"||t==="caffe"?"cafe":t==="fast_food"||t==="snack"||t==="imbiss"?"fastfood":t==="hotels"?"hotel":t==="motels"?"motel":t:""}function pe(e={}){return[e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType]}function C(e={},{normalizeRestaurantType:t,normalizeLeadTypeKey:a}={}){const n=typeof t=="function"?t:(o=>o),s=typeof a=="function"?a:(o=>o),i=pe(e);for(const o of i){const c=Q(n(o)||s(o)||o);if(c)return c}const l=[e.name,e.restaurantName,e.businessName,e.description,e.bio].map(o=>r(o).toLowerCase()).join(" ");return/\bhotel(s)?\b/.test(l)?"hotel":/\bmotel(s)?\b/.test(l)?"motel":/\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b/.test(l)?"cafe":/\bfast\s*food\b|\bfastfood\b/.test(l)?"fastfood":/\be-?commerce\b|\bonline\s*shop\b/.test(l)?"ecommerce":/\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b/.test(l)?"restaurant":""}function fe(e={},t={}){const a=C(e,t);return V.get(a)||""}function v(e={}){return r(e.canonicalRestaurantId||e.restaurantId||e.id||e.landingRestaurantId||"")}function h(e={}){return r(e.name||e.restaurantName||e.businessName||e.displayName||"Business")}function j(e={}){const t=r(e.city||e.locationCity||e.primaryCity),a=r(e.address||e.location||e.primaryAddress);return t&&a&&t!==a?`${t} - ${a}`:t||a||S(e)||r(e.country||e.region||"")||"Standort folgt"}function P(e={}){const t=Number(String(e?.lat??e?.latitude??"").replace(",",".")),a=Number(String(e?.lng??e?.lon??e?.longitude??"").replace(",","."));return!Number.isFinite(t)||!Number.isFinite(a)||Math.abs(t)>90||Math.abs(a)>180||Math.abs(t)<1e-6&&Math.abs(a)<1e-6?null:{lat:t,lng:a}}function W(e={},t={}){const a=Number(e.lat),n=Number(e.lng),s=Number(t.lat),i=Number(t.lng);if(![a,n,s,i].every(Number.isFinite))return Number.POSITIVE_INFINITY;const l=y=>y*Math.PI/180,o=6371,c=l(s-a),p=l(i-n),f=Math.sin(c/2),b=Math.sin(p/2),u=f*f+Math.cos(l(a))*Math.cos(l(s))*b*b;return 2*o*Math.atan2(Math.sqrt(u),Math.sqrt(Math.max(0,1-u)))}function S(e={}){const t=z(e);if(!t)return"";const a=le.map(n=>({label:n.label,distanceKm:W(t,n)})).filter(n=>Number.isFinite(n.distanceKm)).sort((n,s)=>n.distanceKm-s.distanceKm)[0];return a&&a.distanceKm<=G?a.label:"Auf Karte markiert"}function be(e={}){const t=[e.id,e.restaurantId,e.canonicalRestaurantId,e.publicSlug,e.landingSlug,e.handle,e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType,e.city,e.locationCity,e.primaryCity,e.address,e.location,e.primaryAddress,S(e),e.country,e.region,e.district,e.name,e.restaurantName,e.businessName,e.displayName,e.description,e.bio,e.about];return Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||t.push(a.city,a.address,a.country,a.region,a.name)}),t}function de(e={},t=""){const a=X(t);if(!a.length)return!0;const n=be(e).map(m).filter(Boolean).join("_");return a.some(s=>{const i=s.split("_").filter(Boolean);return n.includes(s)?!0:i.length>0&&i.every(l=>n.includes(l))})}function $(e=[],t=""){if(typeof t=="string"||typeof t=="number"){const a=r(t);a&&e.push(a)}}function M(e=[],t={},a=Y){!t||typeof t!="object"||a.forEach(n=>$(e,t[n]))}function ge(e={}){const t=[];return M(t,e),$(t,e.location),$(t,S(e)),ce.forEach(a=>{M(t,e[a],U)}),Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||(M(t,a,U),$(t,S(a)))}),t}function me(e={},t=""){const a=ue(t);if(!a.length)return!1;const n=ge(e).map(m).filter(Boolean).join("_");return n?a.some(s=>{const i=s.split("_").filter(Boolean);return n.includes(s)||i.length>0&&i.every(l=>n.includes(l))}):!1}function he(e={},t=null){if(!t)return!0;const a=r(t.city||t.label||"");if(a&&me(e,a))return!0;const n=P(t),s=z(e);return n&&s?W(n,s)<=G:!a&&!n}function z(e={}){const t=[{lat:e.lat,lng:e.lng},{lat:e.latitude,lng:e.longitude},{lat:e.latitude,lng:e.lon},{lat:e._lat,lng:e._long},{lat:e._latitude,lng:e._longitude},{lat:e.gpsLat,lng:e.gpsLng},{lat:e.mapLat,lng:e.mapLng},{lat:e.geo?.lat,lng:e.geo?.lng},{lat:e.geo?.latitude,lng:e.geo?.longitude},{lat:e.geo?.latitude,lng:e.geo?.lon},{lat:e.coords?.lat,lng:e.coords?.lng},{lat:e.coords?.latitude,lng:e.coords?.longitude},{lat:e.coordinates?.lat,lng:e.coordinates?.lng},{lat:e.coordinates?.latitude,lng:e.coordinates?.longitude},{lat:e.coordinates?._lat,lng:e.coordinates?._long},{lat:e.coordinates?._latitude,lng:e.coordinates?._longitude},{lat:e.geoPoint?.lat,lng:e.geoPoint?.lng},{lat:e.geoPoint?.latitude,lng:e.geoPoint?.longitude},{lat:e.geoPoint?._lat,lng:e.geoPoint?._long},{lat:e.geoPoint?._latitude,lng:e.geoPoint?._longitude},{lat:e.geopoint?.lat,lng:e.geopoint?.lng},{lat:e.geopoint?.latitude,lng:e.geopoint?.longitude},{lat:e.geopoint?._lat,lng:e.geopoint?._long},{lat:e.geopoint?._latitude,lng:e.geopoint?._longitude},{lat:e.location?.lat,lng:e.location?.lng},{lat:e.location?.latitude,lng:e.location?.longitude},{lat:e.primaryLocation?.lat,lng:e.primaryLocation?.lng},{lat:e.primaryLocation?.latitude,lng:e.primaryLocation?.longitude},{lat:e.businessLocation?.lat,lng:e.businessLocation?.lng},{lat:e.businessLocation?.latitude,lng:e.businessLocation?.longitude}];for(const a of t){const n=P(a);if(n)return n}if(Array.isArray(e.locations))for(const a of e.locations){const n=z(a||{});if(n)return n}return null}function Z(e={}){const t=e.openingHours||e.openHours||e.hours||e.businessHours||e.workingHours||"";if(typeof t=="string"&&r(t))return r(t);if(t&&typeof t=="object"){const a=Object.values(t).map(r).filter(Boolean);if(a.length)return a[0]}return"Oeffnungszeiten folgen"}function ve(e={}){return r(e.phone||e.telephone||e.contactPhone||e.ownerPhone||"")}function ye(e={}){return r(e.description||e.bio||e.about||e.shortDescription||"")}function A(e={}){const t=Number(e.rating??e.avgRating??e.score??e.publicRating??0);return!Number.isFinite(t)||t<=0?"":Math.min(5,Math.max(1,t)).toFixed(1)}function R(e={},{getOptimizedImageUrl:t,resolveRestaurantLogo:a,placeholderImage:n=""}={}){const s=v(e),i=r(e.logoUrl||e.logo||e.logoURL||e.heroUrl||e.coverUrl||e.imageUrl||e.img||""),o=(s&&typeof a=="function"?r(a(s,i,"medium")):i)||i||n;return(typeof t=="function"?r(t(o,"medium")):o)||n||""}function xe(e={},{getOptimizedImageUrl:t,placeholderImage:a=""}={}){const s=r(e.titleImageUrl||e.coverImageUrl||e.coverImage||e.coverUrl||e.heroImageUrl||e.heroUrl||e.imageUrl||e.bestSpotLogoUrl||e.spotLogoUrl||e.logoUrl||e.logo||"")||a;return(typeof t=="function"?r(t(s,"large")):s)||a||""}function ke(e={}){return r(e.cuisine||e.kitchen||e.foodType||e.categoryLabel||e.__marketplaceTypeLabel||e.type||e.customerType||"")}function we(e={}){return r(e.priceRange||e.priceLevel||e.priceLabel||e.budget||"")}function B(e,t=""){return typeof e=="string"?r(e):e===!0?r(t):""}function je(e={}){const t=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{},a=[B(e.gardenTerraceText||e.gardenTerrace||e.gardenOrTerrace||t.gardenTerrace,"Gastgarten"),B(e.accessibilityText||e.barrierFreeText||e.accessibleText||e.barrierefrei||e.accessible||t.accessibility,"Barrierefrei"),B(e.veganOptionsText||e.veganOptions||e.veganText||e.vegan||t.veganOptions,"Vegane Optionen")].filter(Boolean);if(a.length)return a.slice(0,3);const n=Array.isArray(e.features)?e.features.map(r).filter(Boolean):[];if(n.length)return n.slice(0,3);const s=r(e.features||e.amenities||"");return s?s.split(/[,;|]/).map(r).filter(Boolean).slice(0,3):[]}function ze(e="",t="",a={}){const n=a.icon,s=a.escapeHtml,i=r(t),o=`xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${i?` class="${s(i)}"`:""} aria-hidden="true" focusable="false"`;return e==="share-2"?`<svg ${o}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.59 13.51 6.83 3.98"></path><path d="m15.41 6.51-6.82 3.98"></path></svg>`:e==="phone"?`<svg ${o}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`:e==="book-open"?`<svg ${o}><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>`:typeof n=="function"?n(e,t):""}function Oe(e={}){const t=Number(e.rating??e.avgRating??e.publicRating??0),a=Number(e.score??e.publicScore??0),n=Number(e.followersCount??e.followerCount??0),s=Number(e.postsCount??e.postCount??0),i=Number(e.updatedAt?.seconds||e.createdAt?.seconds||0);return(Number.isFinite(t)?t*1e3:0)+(Number.isFinite(a)?a:0)+(Number.isFinite(n)?Math.min(n,500):0)+(Number.isFinite(s)?Math.min(s,200):0)+(Number.isFinite(i)?Math.min(i/1e5,100):0)}function Te(e={},t={}){const a=new Map,n=(s={})=>{if(!s||typeof s!="object")return;const i=v(s);if(!i)return;const l=a.get(i)||{};a.set(i,{...l,...s,id:i})};return(Array.isArray(e.bootstrapRestaurantPreview)?e.bootstrapRestaurantPreview:[]).forEach(n),(Array.isArray(e.restaurants)?e.restaurants:[]).forEach(n),Array.from(a.values()).map(s=>({...s,__marketplaceSection:fe(s,t),__marketplaceScore:Oe(s)})).filter(s=>s.__marketplaceSection).sort((s,i)=>i.__marketplaceScore-s.__marketplaceScore||h(s).localeCompare(h(i)))}function H(e={},t="",a={}){const n=J(t);return Te(e,a).filter(s=>s.__marketplaceSection===n)}function w(e="",t="",{escapeHtml:a,isPlaceholderUrl:n,extraClass:s=""}={}){const i=r(e),l=!i||typeof n=="function"&&n(i);return`
    <img
      src="${a(i)}"
      alt="${a(t)}"
      loading="lazy"
      class="w-full h-full object-cover bg-slate-100 ${s}"
      ${l?'data-placeholder-image="true"':""}
    />
  `}function ee(e={},t={}){const a=t.escapeHtml,n=t.icon,s=h(e),i=v(e),l=R(e,t),o=A(e),c=j(e);return`
    <button type="button" data-marketplace-open-business="${a(i)}" class="shrink-0 w-44 text-left rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <div class="h-28 bg-slate-100 overflow-hidden">
        ${w(l,s,t)}
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest line-clamp-1">${a(e.__marketplaceTypeLabel||"Top")}</span>
          ${o?`<span class="text-[10px] font-black text-amber-500 flex items-center gap-1">${n("star","w-3 h-3 fill-current")} ${a(o)}</span>`:""}
        </div>
        <h3 class="text-sm font-black text-slate-900 leading-tight line-clamp-2">${a(s)}</h3>
        <p class="mt-2 text-[10px] font-bold text-slate-400 leading-4 line-clamp-1">${a(c)}</p>
      </div>
    </button>
  `}function te(e={},t={}){const a=t.escapeHtml,n=t.icon,s=h(e),i=v(e),l=R(e,t),o=A(e),c=j(e),p=Z(e),f=ye(e),b=r(e.__marketplaceTypeLabel||e.type||e.customerType||"");return`
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <button type="button" data-marketplace-open-business="${a(i)}" class="w-full text-left active:scale-[0.99] transition-transform">
        <div class="h-48 bg-slate-100 overflow-hidden">
          ${w(l,s,t)}
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              ${b?`<p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">${a(b)}</p>`:""}
              <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight">${a(s)}</h3>
            </div>
            ${o?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${n("star","w-3 h-3 fill-current")} ${a(o)}</span>`:""}
          </div>
          ${f?`<p class="mt-3 text-xs font-semibold text-slate-500 leading-5 line-clamp-2">${a(f)}</p>`:""}
          <div class="mt-4 grid grid-cols-1 gap-2 text-[11px] font-bold text-slate-500">
            <div class="flex items-center gap-2 min-w-0">
              ${n("map-pin","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${a(c)}</span>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              ${n("clock","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${a(p)}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  `}function $e(e={},t={}){const a=t.escapeHtml,n=t.icon,s=(E,ne)=>ze(E,ne,t),i=h(e),l=v(e),o=xe(e,t),c=R(e,t),p=A(e),f=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),b=p||"0.0",u=Number.isFinite(f)&&f>0?f:0,y=ke(e),I=we(e)||"€€ - €€€",d=j(e),O=ve(e),k=Z(e),T=je(e),g=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
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
            ${n("heart",`w-4 h-4 ${g?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
          </button>
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Teilen"
            aria-label="Teilen"
          >
            ${s("share-2","w-4 h-4")}
          </button>
        </div>

        <div class="absolute bottom-3.5 right-4 bg-slate-900/90 text-white font-medium px-2.5 py-0.5 rounded-md text-[9px] tracking-wider shadow" style="bottom:0.875rem;background-color:rgba(15,23,42,0.9);">
          ${a(I)}
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
              ${n("star","w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${a(b)}</span>
            <span class="text-[11px] text-slate-400">(${a(String(u))} Bewertungen)</span>
          </div>

          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${a(i)}</h2>
          ${y?`<p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5" style="margin-top:0.125rem;">${a(y)}</p>`:""}
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${n("map-pin","w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${a(d)}</span>
          </div>
          ${O?`
            <div class="flex items-center gap-3">
              ${s("phone","w-4 h-4 text-slate-400 shrink-0")}
              <span class="text-[11px] text-slate-600">${a(O)}</span>
            </div>
          `:""}
          <div class="flex items-center gap-3">
            ${n("clock","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(k)}</span>
          </div>
        </div>

        ${T.length?`
          <div class="flex flex-wrap gap-1.5">
            ${T.map(E=>`
              <span class="text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100">${a(E)}</span>
            `).join("")}
          </div>
        `:""}

        <hr class="border-slate-100" />

        <div class="grid grid-cols-2 gap-2.5 mt-0.5">
          <button
            type="button"
            data-marketplace-open-business="${a(l)}"
            data-tab="profile"
            class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer"
          >
            ${n("user","w-3.5 h-3.5 text-slate-400")}
            Profil
          </button>

          <button
            type="button"
            data-marketplace-open-business="${a(l)}"
            data-tab="menu"
            class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            ${s("book-open","w-3.5 h-3.5 text-slate-200")}
            Menu
          </button>
        </div>
      </div>
    </article>
  `}function F(e={},t={}){const a=r(e.__marketplaceType||e.type||e.customerType||""),n=Q(a);return{...e,__marketplaceTypeLabel:{restaurant:"Restaurant",cafe:"Cafe",coffee:"Cafe",fastfood:"Fastfood",hotel:"Hotel",motel:"Motel",ecommerce:"E-Commerce"}[n]||t.title,__marketplaceType:n}}function N(e={},t={}){const a=t.escapeHtml,n=t.icon;return`
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-5 rounded-[1.5rem] bg-slate-100 text-slate-400 flex items-center justify-center">
        ${n(e.icon,"w-6 h-6")}
      </div>
      <h3 class="text-lg font-black tracking-tight text-slate-900">${a(e.emptyTitle)}</h3>
      <p class="mt-2 text-xs font-semibold text-slate-400 leading-5">${a(e.emptyBody)}</p>
    </div>
  `}function K(e={},t={}){t.escapeHtml;const a=t.icon;return`
    <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
      ${a("loader-2","w-4 h-4 animate-spin")}
      Daten werden geladen ...
    </div>
  `}function _e(){const e=globalThis?.localStorage||null;if(!e)return null;try{const t=e.getItem(ie);if(!t)return null;const a=JSON.parse(t),n=P(a);return n?{lat:n.lat,lng:n.lng,label:r(a?.label||a?.city||""),city:r(a?.city||a?.label||""),source:r(a?.source||"")}:null}catch{return null}}function Le({deps:e}={}){const t=e.icon;return`
    <div id="restaurantsSearchTop" data-restaurant-search-top style="background:${se};">
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
  `}function Se({items:e=[],bestItems:t=[],section:a={},deps:n={}}={}){return e.length?`
    <div style="margin-bottom:2rem;">
      <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
        ${t.map(s=>ee(s,n)).join("")}
      </div>
    </div>

    <div class="space-y-4">
      ${e.map(s=>$e(s,n)).join("")}
    </div>
  `:N(a,n)}function Ce({state:e,dataLoaded:t,section:a,deps:n}={}){const s=H(e,a.key,n).map(u=>F({...u,__marketplaceType:C(u,n)},a)),i=_e(),l=!!i,o=l?s.filter(u=>he(u,i)):s,c=l?o:o.slice(0,L),p=c.slice(0,q),b=t?.restaurants===!0||s.length?Se({items:c,bestItems:p,section:a,deps:n}):K(a,n);return l?`
      <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
        ${b}
      </section>
    `:`
    <section id="restaurantsView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${Le({deps:n})}
      <div id="restaurantsBenko" data-restaurants-benko class="loc-bento loc-bento--feed-content">
      </div>
    </section>
  `}function Ae(e={}){const t=e?.travelView&&typeof e.travelView=="object"?e.travelView:{},a=r(t.query||""),n=r(t.activeTab||"").toLowerCase(),s=["offers","hotels","map"].includes(n)?n:a?"hotels":"offers";return{query:a,activeTab:a?s:"offers",notice:r(t.notice||"")}}function Re({travel:e,deps:t}={}){const a=t.escapeHtml,n=t.icon;return`
    <div id="travelSearchTop" data-travel-search-top style="background:${x}; padding:4.6rem 1.5rem 6.35rem;">
      <div class="bg-white border border-white/60 shadow-sm" style="border-radius:2rem; padding:1.4rem;">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style="background:${x};">
            ${n("plane","w-5 h-5")}
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-widest" style="color:${x};">Travel</p>
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
          <button type="button" data-travel-submit="true" class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-all" style="background:${x};">
            ${n("search","w-4 h-4")}
          </button>
        </div>
        <div id="travelDestinationSuggestions" data-travel-destination-suggestions role="listbox" aria-hidden="true" class="travel-destination-suggestions"></div>
        ${e.notice?`
          <p data-travel-notice class="mt-3 text-[11px] font-black uppercase tracking-wider text-rose-500">${a(e.notice)}</p>
        `:""}
      </div>
    </div>
  `}function Ne({activeTab:e,hasDestination:t,hotelCount:a,deps:n}={}){const s=n.escapeHtml;return`
    <div class="bg-white/70 p-1.5 border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm" style="border-radius:2rem;">
      ${[{id:"offers",label:"Ofertat"},{id:"hotels",label:"Hotels"},{id:"map",label:"Karte"}].map(l=>{const o=e===l.id,c=!t&&l.id!=="offers",p=l.id==="hotels"&&t?` ${a}`:"";return`
          <button
            type="button"
            data-travel-tab="${s(l.id)}"
            class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${o?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":c?"text-slate-300":"text-slate-400 hover:text-slate-600"}"
          >
            ${s(`${l.label}${p}`)}
          </button>
        `}).join("")}
    </div>
  `}function Ie(e={},t={}){const a=t.escapeHtml,n=t.icon,s=h(e),i=v(e),l=R(e,t),o=j(e),c=A(e);return`
    <button type="button" data-marketplace-open-business="${a(i)}" class="w-full text-left bg-white border border-slate-100 shadow-sm active:scale-[0.99] transition-transform overflow-hidden" style="border-radius:2rem;">
      <div class="h-40 bg-slate-100 overflow-hidden">
        ${w(l,s,t)}
      </div>
      <div class="p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[9px] font-black uppercase tracking-widest mb-1" style="color:${x};">Ofertat</p>
            <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight line-clamp-2">${a(s)}</h3>
          </div>
          ${c?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${n("star","w-3 h-3 fill-current")} ${a(c)}</span>`:""}
        </div>
        <div class="mt-4 flex items-center gap-2 min-w-0 text-[11px] font-bold text-slate-500">
          ${n("map-pin","w-3.5 h-3.5 text-slate-400 shrink-0")}
          <span class="truncate">${a(o)}</span>
        </div>
      </div>
    </button>
  `}function Ee(e=[],t={}){const a=e.slice(0,4);return a.length?`
    <div class="space-y-4">
      ${a.map(n=>Ie(n,t)).join("")}
    </div>
  `:N({emptyTitle:"Noch keine Angebote",emptyBody:"Keine passenden Hotel-Angebote gefunden.",icon:"plane"},t)}function ae(e=[],t={}){return e.length?`
    <div class="space-y-4">
      ${e.map(a=>te(a,t)).join("")}
    </div>
  `:N({emptyTitle:"Keine Hotels gefunden",emptyBody:"Keine passenden Hotels fuer dieses Reiseziel gefunden.",icon:"plane"},t)}function Me(e={},t=0,a={}){const n=a.escapeHtml,s=z(e),i=h(e),l=v(e),o=j(e),c=18+t*23%58,p=22+t*17%46;return`
    <button
      type="button"
      data-marketplace-open-business="${n(l)}"
      class="absolute w-12 h-12 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center active:scale-95 transition-all"
      style="left:${c}%; top:${p}%; transform:translate(-50%,-50%); color:${x};"
      title="${n(`${i} - ${o}`)}"
    >
      ${a.icon("plane","w-5 h-5")}
      ${s?`<span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${n(`${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`)}</span>`:""}
    </button>
  `}function Be(e=[],t={}){if(typeof t.renderMapView=="function")return t.renderMapView();const a=e.filter(n=>z(n)).slice(0,8);return e.length?`
    <div class="space-y-4">
      <div class="relative overflow-hidden border border-slate-200 bg-slate-200 shadow-sm" style="height:24rem; border-radius:2.5rem;">
        <div class="absolute inset-0" style="background:linear-gradient(135deg,#e0f7fb 0%,#dbeafe 45%,#e2e8f0 100%);"></div>
        <div class="absolute inset-0 opacity-60" style="background-image:linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px); background-size:42px 42px;"></div>
        ${a.map((n,s)=>Me(n,s,t)).join("")}
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
  `:ae(e,t)}function Pe({state:e,dataLoaded:t,section:a,deps:n}={}){const s=H(e,a.key,n).map(u=>F({...u,__marketplaceType:C(u,n)},a)),i=Ae(e),l=!!i.query,o=l?s.filter(u=>de(u,i.query)):s.slice(0,L),c=o.slice(0,L),p=l?i.activeTab:"offers",f=t?.restaurants===!0,b=p==="map"?Be(c,n):p==="hotels"?ae(c,n):Ee(c,n);return`
    <section id="travelView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${Re({travel:i,deps:n})}
      <div id="travelBenko" data-travel-benko style="margin-top:-1.75rem; border-top-left-radius:2.5rem; border-top-right-radius:2.5rem; background:#f8fafc; padding:2rem 1.5rem 6.5rem;">
        ${Ne({activeTab:p,hasDestination:l,hotelCount:o.length,deps:n})}
        <div class="mt-5">
          ${f||s.length?b:K(a,n)}
        </div>
      </div>
    </section>
  `}function He({state:e={},dataLoaded:t=null,sectionKey:a="restaurants",escapeHtmlFn:n,iconFn:s,getOptimizedImageUrlFn:i,isPlaceholderUrlFn:l,placeholderImage:o="",normalizeRestaurantTypeFn:c,normalizeLeadTypeKeyFn:p,resolveRestaurantLogoFn:f,renderMapViewFn:b}={}){const u=_[J(a)]||_.restaurants,y=D(n,(g="")=>String(g||"")),I=D(s,()=>""),d={escapeHtml:y,icon:I,getOptimizedImageUrl:i,isPlaceholderUrl:l,placeholderImage:o,resolveRestaurantLogo:f,renderMapView:b,normalizeRestaurantType:c,normalizeLeadTypeKey:p},O=t?.restaurants===!0;if(u.key==="travel")return Pe({state:e,dataLoaded:t,section:u,deps:d});if(u.key==="restaurants")return Ce({state:e,dataLoaded:t,section:u,deps:d});const k=H(e,u.key,d).slice(0,L).map(g=>F({...g,__marketplaceType:C(g,d)},u)),T=k.slice(0,q);return`
    <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      ${k.length?`
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
            ${T.map(g=>ee(g,d)).join("")}
          </div>
        </div>

        <div class="space-y-4">
          ${k.map(g=>te(g,d)).join("")}
        </div>
      `:O?N(u,d):K(u,d)}
    </section>
  `}export{H as filterMarketplaceBusinessesCore,He as renderMarketplaceViewCore,fe as resolveMarketplaceSectionForBusinessCore};
