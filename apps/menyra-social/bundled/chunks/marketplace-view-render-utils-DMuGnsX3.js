const R=Object.freeze({restaurants:Object.freeze({key:"restaurants",title:"Restaurants",emptyTitle:"Noch keine Restaurants",emptyBody:"Keine passenden Profile gefunden.",icon:"utensils",typeKeys:Object.freeze(["restaurant","cafe","coffee","fastfood","food"])}),travel:Object.freeze({key:"travel",title:"Travel",emptyTitle:"Noch keine Travel-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"plane",typeKeys:Object.freeze(["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"])}),shopping:Object.freeze({key:"shopping",title:"Shopping",emptyTitle:"Noch keine Shopping-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"shopping-bag",typeKeys:Object.freeze(["ecommerce"])})}),G=new Map;Object.values(R).forEach(e=>{e.typeKeys.forEach(t=>{G.set(t,e.key)})});const Y=8,N=24,oe="#ff4f3f",re="mnyra_social_feed_viewer_location_v1",z="#00cce5",X=35,ce=Object.freeze([Object.freeze({label:"Prishtina",lat:42.6629,lng:21.1655}),Object.freeze({label:"Prizren",lat:42.2139,lng:20.7397}),Object.freeze({label:"Peja",lat:42.6591,lng:20.2883}),Object.freeze({label:"Gjakova",lat:42.3803,lng:20.4308}),Object.freeze({label:"Ferizaj",lat:42.3706,lng:21.1553}),Object.freeze({label:"Gjilan",lat:42.4635,lng:21.4699}),Object.freeze({label:"Mitrovica",lat:42.8914,lng:20.866}),Object.freeze({label:"Vushtrria",lat:42.8231,lng:20.9675}),Object.freeze({label:"Podujeva",lat:42.9106,lng:21.193}),Object.freeze({label:"Tirana",lat:41.3275,lng:19.8187}),Object.freeze({label:"Kukes",lat:42.0769,lng:20.4219}),Object.freeze({label:"Smederevo",lat:44.6644,lng:20.9276})]),ue=Object.freeze([Object.freeze(["tirana","tirane"]),Object.freeze(["durres","durresi"]),Object.freeze(["vlora","vlore"]),Object.freeze(["shkoder","shkodra"]),Object.freeze(["shengjin","shëngjin","shen gjin","shengjini"]),Object.freeze(["ksamil","ksamili"]),Object.freeze(["dhermi","dhërmi","dhermiu"]),Object.freeze(["velipoje","velipojë","velipoja"]),Object.freeze(["theth","thethi"]),Object.freeze(["valbone","valbonë","valbona"]),Object.freeze(["elbasan","elbasani"]),Object.freeze(["fier","fieri"]),Object.freeze(["korce","korca"]),Object.freeze(["sarande","saranda"]),Object.freeze(["berat","berati"]),Object.freeze(["gjirokaster","gjirokastra"]),Object.freeze(["kukes","kukesi"]),Object.freeze(["lezhe","lezha"]),Object.freeze(["pogradec","pogradeci"]),Object.freeze(["kruje","kruja"]),Object.freeze(["fushe kruje","fushë krujë","fushe-kruje","fush kruje"]),Object.freeze(["lushnje","lushnja"]),Object.freeze(["himare","himarë","himara"]),Object.freeze(["kavaje","kavajë","kavaja"]),Object.freeze(["kamze","kamëz","kamza"]),Object.freeze(["vore","vorë","vora"]),Object.freeze(["divjake","divjakë","divjaka"]),Object.freeze(["permet","përmet","permeti"]),Object.freeze(["tepelene","tepelenë","tepelena"]),Object.freeze(["delvine","delvinë","delvina"]),Object.freeze(["peshkopi","peshkopia","diber","dibër"]),Object.freeze(["burrel","burreli","mat"]),Object.freeze(["puke","pukë","puka"]),Object.freeze(["bajram curri","bajramcurri","tropoje","tropojë"]),Object.freeze(["krume","krumë","has"]),Object.freeze(["lac","laç","kurbin"]),Object.freeze(["orikum","orikumi"]),Object.freeze(["golem","golemi"]),Object.freeze(["jale","jalë","jali"]),Object.freeze(["qepare","qeparo","qeparoi"]),Object.freeze(["borsh","borshi"]),Object.freeze(["lukove","lukovë","lukova"]),Object.freeze(["palase","palasë","palasa"]),Object.freeze(["drimadhe","drymades","drimadhes"]),Object.freeze(["spille","spilleja"]),Object.freeze(["gjiri i lalzit","lalzi","lalez","lalëz"])]),pe=Object.freeze([Object.freeze(["prishtina","prishtine","prishtin","pristina"]),Object.freeze(["ferizaj","ferizaji","uroshevac"]),Object.freeze(["peja","peje","pec"]),Object.freeze(["prizren","prizreni"]),Object.freeze(["gjakova","gjakove","djakova"]),Object.freeze(["gjilan","gjilani"]),Object.freeze(["mitrovica","mitrovice"]),Object.freeze(["vushtrria","vushtrri"]),Object.freeze(["podujeva","podujeve","podujevo","besiana"]),Object.freeze(["fushe kosove","fushe kosova","fush kosove","fush kosova"]),Object.freeze(["lipjan"]),Object.freeze(["suhareka","suhareke","theranda"]),Object.freeze(["rahovec","rahoveci"]),Object.freeze(["drenas","gllogoc"]),Object.freeze(["skenderaj","skenderaji"]),Object.freeze(["malisheva","malisheve"]),Object.freeze(["kamenica","kamenice","kamenica kosove"]),Object.freeze(["decan","decani"]),Object.freeze(["istog","istogu"]),Object.freeze(["klina","kline"]),Object.freeze(["vite","vitia"]),Object.freeze(["hani i elezit","hani elezit"])]),Z=Object.freeze(["city","locationCity","primaryCity","postalCity","address","primaryAddress","formattedAddress","fullAddress","addressText","streetAddress","street","locationLabel","displayLocation","locality","town","municipality","village","neighborhood","area","district","county","region","state","province","country","countryCode"]),V=Object.freeze([...Z,"label","name","title"]),fe=Object.freeze(["location","primaryLocation","businessLocation","venueLocation","addressInfo","place","geo","coords","coordinates","geoPoint"]);function q(e,t=()=>""){return typeof e=="function"?e:t}function r(e=""){return String(e||"").trim()}function x(e=""){const t=r(e).toLowerCase();return t?t.replace(/[ëèéê]/g,"e").replace(/[çćč]/g,"c").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):""}function J(e=""){const t=x(e);if(!t)return[];const a=new Set([t]);return ue.forEach(n=>{const s=n.map(x).filter(Boolean);s.includes(t)&&s.forEach(i=>a.add(i))}),Array.from(a)}function be(e=""){const t=x(e);if(!t)return[];const a=new Set(J(e));return pe.forEach(n=>{const s=n.map(x).filter(Boolean);s.includes(t)&&s.forEach(i=>a.add(i))}),Array.from(a)}function Q(e=""){const t=x(e);return t==="restaurant"?"restaurants":["hotel","hotels","motel","motels"].includes(t)?"travel":["shop","ecommerce","e_commerce","shopping"].includes(t)?"shopping":R[t]?t:"restaurants"}function W(e=""){const t=x(e);return t?t==="e_commerce"||t==="online_shop"||t==="onlineshop"||t==="shop"||t==="store"?"ecommerce":t==="coffee"||t==="coffe"||t==="coffee_shop"||t==="coffeeshop"||t==="kaffee"||t==="caffe"?"cafe":t==="fast_food"||t==="snack"||t==="imbiss"?"fastfood":t==="hotels"?"hotel":t==="motels"?"motel":t:""}function ge(e={}){return[e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType]}function E(e={},{normalizeRestaurantType:t,normalizeLeadTypeKey:a}={}){const n=typeof t=="function"?t:(o=>o),s=typeof a=="function"?a:(o=>o),i=ge(e);for(const o of i){const c=W(n(o)||s(o)||o);if(c)return c}const l=[e.name,e.restaurantName,e.businessName,e.description,e.bio].map(o=>r(o).toLowerCase()).join(" ");return/\bhotel(s)?\b/.test(l)?"hotel":/\bmotel(s)?\b/.test(l)?"motel":/\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b/.test(l)?"cafe":/\bfast\s*food\b|\bfastfood\b/.test(l)?"fastfood":/\be-?commerce\b|\bonline\s*shop\b/.test(l)?"ecommerce":/\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b/.test(l)?"restaurant":""}function de(e={},t={}){const a=E(e,t);return G.get(a)||""}function w(e={}){return r(e.canonicalRestaurantId||e.restaurantId||e.id||e.landingRestaurantId||"")}function y(e={}){return r(e.name||e.restaurantName||e.businessName||e.displayName||"Business")}function O(e={}){const t=r(e.city||e.locationCity||e.primaryCity),a=r(e.address||e.location||e.primaryAddress);return t&&a&&t!==a?`${t} - ${a}`:t||a||B(e)||r(e.country||e.region||"")||"Standort folgt"}function F(e={}){const t=Number(String(e?.lat??e?.latitude??"").replace(",",".")),a=Number(String(e?.lng??e?.lon??e?.longitude??"").replace(",","."));return!Number.isFinite(t)||!Number.isFinite(a)||Math.abs(t)>90||Math.abs(a)>180||Math.abs(t)<1e-6&&Math.abs(a)<1e-6?null:{lat:t,lng:a}}function ee(e={},t={}){const a=Number(e.lat),n=Number(e.lng),s=Number(t.lat),i=Number(t.lng);if(![a,n,s,i].every(Number.isFinite))return Number.POSITIVE_INFINITY;const l=h=>h*Math.PI/180,o=6371,c=l(s-a),p=l(i-n),b=Math.sin(c/2),f=Math.sin(p/2),u=b*b+Math.cos(l(a))*Math.cos(l(s))*f*f;return 2*o*Math.atan2(Math.sqrt(u),Math.sqrt(Math.max(0,1-u)))}function B(e={}){const t=L(e);if(!t)return"";const a=ce.map(n=>({label:n.label,distanceKm:ee(t,n)})).filter(n=>Number.isFinite(n.distanceKm)).sort((n,s)=>n.distanceKm-s.distanceKm)[0];return a&&a.distanceKm<=X?a.label:"Auf Karte markiert"}function me(e={}){const t=[e.id,e.restaurantId,e.canonicalRestaurantId,e.publicSlug,e.landingSlug,e.handle,e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType,e.city,e.locationCity,e.primaryCity,e.address,e.location,e.primaryAddress,B(e),e.country,e.region,e.district,e.name,e.restaurantName,e.businessName,e.displayName,e.description,e.bio,e.about];return Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||t.push(a.city,a.address,a.country,a.region,a.name)}),t}function he(e={},t=""){const a=J(t);if(!a.length)return!0;const n=me(e).map(x).filter(Boolean).join("_");return a.some(s=>{const i=s.split("_").filter(Boolean);return n.includes(s)?!0:i.length>0&&i.every(l=>n.includes(l))})}function I(e=[],t=""){if(typeof t=="string"||typeof t=="number"){const a=r(t);a&&e.push(a)}}function P(e=[],t={},a=Z){!t||typeof t!="object"||a.forEach(n=>I(e,t[n]))}function ve(e={}){const t=[];return P(t,e),I(t,e.location),I(t,B(e)),fe.forEach(a=>{P(t,e[a],V)}),Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||(P(t,a,V),I(t,B(a)))}),t}function xe(e={},t=""){const a=be(t);if(!a.length)return!1;const n=ve(e).map(x).filter(Boolean).join("_");return n?a.some(s=>{const i=s.split("_").filter(Boolean);return n.includes(s)||i.length>0&&i.every(l=>n.includes(l))}):!1}function ye(e={},t=null){if(!t)return!0;const a=r(t.city||t.label||"");if(a&&xe(e,a))return!0;const n=F(t),s=L(e);return n&&s?ee(n,s)<=X:!a&&!n}function L(e={}){const t=[{lat:e.lat,lng:e.lng},{lat:e.latitude,lng:e.longitude},{lat:e.latitude,lng:e.lon},{lat:e._lat,lng:e._long},{lat:e._latitude,lng:e._longitude},{lat:e.gpsLat,lng:e.gpsLng},{lat:e.mapLat,lng:e.mapLng},{lat:e.geo?.lat,lng:e.geo?.lng},{lat:e.geo?.latitude,lng:e.geo?.longitude},{lat:e.geo?.latitude,lng:e.geo?.lon},{lat:e.coords?.lat,lng:e.coords?.lng},{lat:e.coords?.latitude,lng:e.coords?.longitude},{lat:e.coordinates?.lat,lng:e.coordinates?.lng},{lat:e.coordinates?.latitude,lng:e.coordinates?.longitude},{lat:e.coordinates?._lat,lng:e.coordinates?._long},{lat:e.coordinates?._latitude,lng:e.coordinates?._longitude},{lat:e.geoPoint?.lat,lng:e.geoPoint?.lng},{lat:e.geoPoint?.latitude,lng:e.geoPoint?.longitude},{lat:e.geoPoint?._lat,lng:e.geoPoint?._long},{lat:e.geoPoint?._latitude,lng:e.geoPoint?._longitude},{lat:e.geopoint?.lat,lng:e.geopoint?.lng},{lat:e.geopoint?.latitude,lng:e.geopoint?.longitude},{lat:e.geopoint?._lat,lng:e.geopoint?._long},{lat:e.geopoint?._latitude,lng:e.geopoint?._longitude},{lat:e.location?.lat,lng:e.location?.lng},{lat:e.location?.latitude,lng:e.location?.longitude},{lat:e.primaryLocation?.lat,lng:e.primaryLocation?.lng},{lat:e.primaryLocation?.latitude,lng:e.primaryLocation?.longitude},{lat:e.businessLocation?.lat,lng:e.businessLocation?.lng},{lat:e.businessLocation?.latitude,lng:e.businessLocation?.longitude}];for(const a of t){const n=F(a);if(n)return n}if(Array.isArray(e.locations))for(const a of e.locations){const n=L(a||{});if(n)return n}return null}function te(e={}){const t=e.openingHours||e.openHours||e.hours||e.businessHours||e.workingHours||"";if(typeof t=="string"&&r(t))return r(t);if(t&&typeof t=="object"){const a=Object.values(t).map(r).filter(Boolean);if(a.length)return a[0]}return"Oeffnungszeiten folgen"}function we(e={}){return r(e.phone||e.telephone||e.contactPhone||e.ownerPhone||"")}function ke(e={}){return r(e.description||e.bio||e.about||e.shortDescription||"")}function C(e={}){const t=Number(e.rating??e.avgRating??e.score??e.publicRating??0);return!Number.isFinite(t)||t<=0?"":Math.min(5,Math.max(1,t)).toFixed(1)}function S(e={},{getOptimizedImageUrl:t,resolveRestaurantLogo:a,placeholderImage:n=""}={}){const s=w(e),i=r(e.logoUrl||e.logo||e.logoURL||e.heroUrl||e.coverUrl||e.imageUrl||e.img||""),o=(s&&typeof a=="function"?r(a(s,i,"medium")):i)||i||n;return(typeof t=="function"?r(t(o,"medium")):o)||n||""}function ae(e={},{getOptimizedImageUrl:t,placeholderImage:a=""}={}){const s=r(e.titleImageUrl||e.coverImageUrl||e.coverImage||e.coverUrl||e.heroImageUrl||e.heroUrl||e.imageUrl||e.bestSpotLogoUrl||e.spotLogoUrl||e.logoUrl||e.logo||"")||a;return(typeof t=="function"?r(t(s,"large")):s)||a||""}function A(e){if(Array.isArray(e))return e.map(r).filter(Boolean);const t=r(e);return t?t.split(/[\n,;|]/).map(r).filter(Boolean):[]}function je(e={},t={}){const a=[...A(e.coverImages),...A(e.hotelCoverImages),...A(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverImage,e.coverUrl,e.heroImageUrl,e.heroUrl,e.imageUrl].map(r).filter(Boolean),n=[];a.forEach(l=>{n.includes(l)||n.push(l)});const s=ae(e,t);s&&!n.includes(s)&&n.push(s);const i=n.map(l=>typeof t.getOptimizedImageUrl=="function"?r(t.getOptimizedImageUrl(l,"large")):l).filter(Boolean);return i.length?i.slice(0,5):[t.placeholderImage||""].filter(Boolean)}function $e(e={}){return r(e.cuisine||e.kitchen||e.foodType||e.categoryLabel||e.__marketplaceTypeLabel||e.type||e.customerType||"")}function ze(e={}){return r(e.priceRange||e.priceLevel||e.priceLabel||e.budget||"")}function H(e,t=""){return typeof e=="string"?r(e):e===!0?r(t):""}function ne(e={}){const t=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{},a=[H(e.gardenTerraceText||e.gardenTerrace||e.gardenOrTerrace||t.gardenTerrace,"Gastgarten"),H(e.accessibilityText||e.barrierFreeText||e.accessibleText||e.barrierefrei||e.accessible||t.accessibility,"Barrierefrei"),H(e.veganOptionsText||e.veganOptions||e.veganText||e.vegan||t.veganOptions,"Vegane Optionen")].filter(Boolean);if(a.length)return a.slice(0,3);const n=Array.isArray(e.features)?e.features.map(r).filter(Boolean):[];if(n.length)return n.slice(0,3);const s=r(e.features||e.amenities||"");return s?s.split(/[,;|]/).map(r).filter(Boolean).slice(0,3):[]}function Te(e={}){return r(e.hotelCategory||e.categoryLabel||e.__marketplaceTypeLabel||e.travelCategory||e.typeLabel||e.type||e.customerType||"Hotel")}function Oe(e={}){return r(e.distanceCenter||e.distanceToCenter||e.centerDistance||e.cityCenterDistance||e.centerDistanceLabel||e.zentrumEntfernung||e.distanceCentre||"")}function _e(e={}){return r(e.distanceBeach||e.distanceToBeach||e.beachDistance||e.beachDistanceLabel||e.strandEntfernung||e.lakeDistance||e.distanceToLake||"")}function Le(e={}){return r(e.hotelStartingPrice||e.startingPrice||e.priceFrom||e.fromPrice||e.bestPrice||e.roomStartingPrice||"").replace(/^\s*ab\s+/i,"").replace(/\s*(eur|€)\s*$/i,"").trim()}function Ce(e={}){const t=[e.hotelFeatureOneText,e.hotelFeatureTwoText,e.hotelFeatureThreeText].map(r).filter(Boolean);if(t.length)return t.slice(0,3);const a=ne(e);return a.length?a.slice(0,3):A(e.hotelAmenities||e.amenities||e.facilities).slice(0,3)}function se(e="",t="",a={}){const n=a.icon,s=a.escapeHtml,i=r(t),o=`xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${i?` class="${s(i)}"`:""} aria-hidden="true" focusable="false"`;return e==="share-2"?`<svg ${o}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.59 13.51 6.83 3.98"></path><path d="m15.41 6.51-6.82 3.98"></path></svg>`:e==="phone"?`<svg ${o}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`:e==="book-open"?`<svg ${o}><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>`:e==="navigation"?`<svg ${o}><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`:e==="waves"?`<svg ${o}><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>`:typeof n=="function"?n(e,t):""}function Se(e={}){const t=Number(e.rating??e.avgRating??e.publicRating??0),a=Number(e.score??e.publicScore??0),n=Number(e.followersCount??e.followerCount??0),s=Number(e.postsCount??e.postCount??0),i=Number(e.updatedAt?.seconds||e.createdAt?.seconds||0);return(Number.isFinite(t)?t*1e3:0)+(Number.isFinite(a)?a:0)+(Number.isFinite(n)?Math.min(n,500):0)+(Number.isFinite(s)?Math.min(s,200):0)+(Number.isFinite(i)?Math.min(i/1e5,100):0)}function Ie(e={},t={}){const a=new Map,n=(s={})=>{if(!s||typeof s!="object")return;const i=w(s);if(!i)return;const l=a.get(i)||{};a.set(i,{...l,...s,id:i})};return(Array.isArray(e.bootstrapRestaurantPreview)?e.bootstrapRestaurantPreview:[]).forEach(n),(Array.isArray(e.restaurants)?e.restaurants:[]).forEach(n),Array.from(a.values()).map(s=>({...s,__marketplaceSection:de(s,t),__marketplaceScore:Se(s)})).filter(s=>s.__marketplaceSection).sort((s,i)=>i.__marketplaceScore-s.__marketplaceScore||y(s).localeCompare(y(i)))}function U(e={},t="",a={}){const n=Q(t);return Ie(e,a).filter(s=>s.__marketplaceSection===n)}function T(e="",t="",{escapeHtml:a,isPlaceholderUrl:n,extraClass:s=""}={}){const i=r(e),l=!i||typeof n=="function"&&n(i);return`
    <img
      src="${a(i)}"
      alt="${a(t)}"
      loading="lazy"
      class="w-full h-full object-cover bg-slate-100 ${s}"
      ${l?'data-placeholder-image="true"':""}
    />
  `}function ie(e={},t={}){const a=t.escapeHtml,n=t.icon,s=y(e),i=w(e),l=S(e,t),o=C(e),c=O(e);return`
    <button type="button" data-marketplace-open-business="${a(i)}" class="shrink-0 w-44 text-left rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <div class="h-28 bg-slate-100 overflow-hidden">
        ${T(l,s,t)}
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
  `}function Ae(e={},t={}){const a=t.escapeHtml,n=t.icon,s=y(e),i=w(e),l=S(e,t),o=C(e),c=O(e),p=te(e),b=ke(e),f=r(e.__marketplaceTypeLabel||e.type||e.customerType||"");return`
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <button type="button" data-marketplace-open-business="${a(i)}" class="w-full text-left active:scale-[0.99] transition-transform">
        <div class="h-48 bg-slate-100 overflow-hidden">
          ${T(l,s,t)}
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              ${f?`<p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">${a(f)}</p>`:""}
              <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight">${a(s)}</h3>
            </div>
            ${o?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${n("star","w-3 h-3 fill-current")} ${a(o)}</span>`:""}
          </div>
          ${b?`<p class="mt-3 text-xs font-semibold text-slate-500 leading-5 line-clamp-2">${a(b)}</p>`:""}
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
  `}function Re(e={},t={}){const a=t.escapeHtml,n=t.icon,s=(m,j)=>se(m,j,t),i=y(e),l=w(e),o=ae(e,t),c=S(e,t),p=C(e),b=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),f=p||"0.0",u=Number.isFinite(b)&&b>0?b:0,h=$e(e),_=ze(e)||"€€ - €€€",g=O(e),$=we(e),v=te(e),k=ne(e),d=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
    <article class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col" style="border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);">
      <div class="h-44 relative overflow-hidden group">
        ${T(o,i,{...t,extraClass:"transition-transform duration-700 group-hover:scale-105"})}
        <div class="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-black/20" style="background:linear-gradient(to top,#fff 0%,rgba(255,255,255,0.2) 50%,rgba(0,0,0,0.2) 100%);"></div>

        <div class="absolute top-3.5 right-3.5 flex gap-2 z-10" style="top:0.875rem;right:0.875rem;">
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            aria-label="Favorit"
          >
            ${n("heart",`w-4 h-4 ${d?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
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
          ${a(_)}
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${T(c,`${i} Logo`,{...t,extraClass:"rounded-full"})}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-1">
            <div class="flex text-amber-500">
              ${n("star","w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${a(f)}</span>
            <span class="text-[11px] text-slate-400">(${a(String(u))} Bewertungen)</span>
          </div>

          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${a(i)}</h2>
          ${h?`<p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5" style="margin-top:0.125rem;">${a(h)}</p>`:""}
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${n("map-pin","w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${a(g)}</span>
          </div>
          ${$?`
            <div class="flex items-center gap-3">
              ${s("phone","w-4 h-4 text-slate-400 shrink-0")}
              <span class="text-[11px] text-slate-600">${a($)}</span>
            </div>
          `:""}
          <div class="flex items-center gap-3">
            ${n("clock","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(v)}</span>
          </div>
        </div>

        ${k.length?`
          <div class="flex flex-wrap gap-1.5">
            ${k.map(m=>`
              <span class="text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100">${a(m)}</span>
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
  `}function K(e={},t={}){const a=r(e.__marketplaceType||e.type||e.customerType||""),n=W(a);return{...e,__marketplaceTypeLabel:{restaurant:"Restaurant",cafe:"Cafe",coffee:"Cafe",fastfood:"Fastfood",hotel:"Hotel",motel:"Motel",ecommerce:"E-Commerce"}[n]||t.title,__marketplaceType:n}}function M(e={},t={}){const a=t.escapeHtml,n=t.icon;return`
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-5 rounded-[1.5rem] bg-slate-100 text-slate-400 flex items-center justify-center">
        ${n(e.icon,"w-6 h-6")}
      </div>
      <h3 class="text-lg font-black tracking-tight text-slate-900">${a(e.emptyTitle)}</h3>
      <p class="mt-2 text-xs font-semibold text-slate-400 leading-5">${a(e.emptyBody)}</p>
    </div>
  `}function D(e={},t={}){t.escapeHtml;const a=t.icon;return`
    <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
      ${a("loader-2","w-4 h-4 animate-spin")}
      Daten werden geladen ...
    </div>
  `}function Ne(){const e=globalThis?.localStorage||null;if(!e)return null;try{const t=e.getItem(re);if(!t)return null;const a=JSON.parse(t),n=F(a);return n?{lat:n.lat,lng:n.lng,label:r(a?.label||a?.city||""),city:r(a?.city||a?.label||""),source:r(a?.source||"")}:null}catch{return null}}function Be({deps:e}={}){const t=e.icon;return`
    <div id="restaurantsSearchTop" data-restaurant-search-top style="background:${oe};">
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
  `}function Ee({items:e=[],bestItems:t=[],section:a={},deps:n={}}={}){return e.length?`
    <div style="margin-bottom:2rem;">
      <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
        ${t.map(s=>ie(s,n)).join("")}
      </div>
    </div>

    <div class="space-y-4">
      ${e.map(s=>Re(s,n)).join("")}
    </div>
  `:M(a,n)}function Me({state:e,dataLoaded:t,section:a,deps:n}={}){const s=U(e,a.key,n).map(u=>K({...u,__marketplaceType:E(u,n)},a)),i=Ne(),l=!!i,o=l?s.filter(u=>ye(u,i)):s,c=l?o:o.slice(0,N),p=c.slice(0,Y),f=t?.restaurants===!0||s.length?Ee({items:c,bestItems:p,section:a,deps:n}):D(a,n);return l?`
      <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
        ${f}
      </section>
    `:`
    <section id="restaurantsView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${Be({deps:n})}
      <div id="restaurantsBenko" data-restaurants-benko class="loc-bento loc-bento--feed-content">
      </div>
    </section>
  `}function Pe(e={}){const t=e?.travelView&&typeof e.travelView=="object"?e.travelView:{},a=r(t.query||""),n=r(t.activeTab||"").toLowerCase(),s=["offers","hotels","map"].includes(n)?n:a?"hotels":"offers";return{query:a,activeTab:a?s:"offers",notice:r(t.notice||"")}}function He({travel:e,deps:t}={}){const a=t.escapeHtml,n=t.icon;return`
    <div id="travelSearchTop" data-travel-search-top style="background:${z}; padding:4.6rem 1.5rem 6.35rem;">
      <div class="bg-white border border-white/60 shadow-sm" style="border-radius:2rem; padding:1.4rem;">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style="background:${z};">
            ${n("plane","w-5 h-5")}
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-widest" style="color:${z};">Travel</p>
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
          <button type="button" data-travel-submit="true" class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-95 transition-all" style="background:${z};">
            ${n("search","w-4 h-4")}
          </button>
        </div>
        <div id="travelDestinationSuggestions" data-travel-destination-suggestions role="listbox" aria-hidden="true" class="travel-destination-suggestions"></div>
        ${e.notice?`
          <p data-travel-notice class="mt-3 text-[11px] font-black uppercase tracking-wider text-rose-500">${a(e.notice)}</p>
        `:""}
      </div>
    </div>
  `}function Fe({activeTab:e,hasDestination:t,hotelCount:a,deps:n}={}){const s=n.escapeHtml;return`
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
  `}function Ue(e={},t={}){const a=t.escapeHtml,n=t.icon,s=y(e),i=w(e),l=S(e,t),o=O(e),c=C(e);return`
    <button type="button" data-marketplace-open-business="${a(i)}" class="w-full text-left bg-white border border-slate-100 shadow-sm active:scale-[0.99] transition-transform overflow-hidden" style="border-radius:2rem;">
      <div class="h-40 bg-slate-100 overflow-hidden">
        ${T(l,s,t)}
      </div>
      <div class="p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[9px] font-black uppercase tracking-widest mb-1" style="color:${z};">Ofertat</p>
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
  `}function Ke(e={},t={}){const a=t.escapeHtml,n=t.icon,s=(m,j)=>se(m,j,t),i=y(e),l=w(e),o=je(e,t),c=o[0]||t.placeholderImage||"",p=S(e,t),b=C(e)||"0.0",f=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),u=Number.isFinite(f)&&f>0?f:0,h=Te(e),_=O(e),g=Oe(e),$=_e(e),v=Ce(e),k=Le(e),d=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
    <article
      data-travel-hotel-card="${a(l)}"
      data-travel-hotel-image-index="0"
      class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col"
      style="border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);"
    >
      <div data-travel-hotel-gallery class="h-44 relative overflow-hidden group select-none touch-pan-y" style="touch-action:pan-y;">
        <img
          data-travel-hotel-main-image
          src="${a(c)}"
          alt="${a(`${i} Ansicht 1`)}"
          loading="lazy"
          class="w-full h-full object-cover transition-all duration-500 bg-slate-100"
        />
        <div class="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/30 to-transparent pointer-events-none"></div>

        ${o.length>1?`
          <button
            type="button"
            data-travel-hotel-image-nav="prev"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="left:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Vorheriges Bild"
          >
            ${n("chevron-left","w-4 h-4")}
          </button>

          <button
            type="button"
            data-travel-hotel-image-nav="next"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="right:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Naechstes Bild"
          >
            ${n("chevron-right","w-4 h-4")}
          </button>

          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            ${o.map((m,j)=>`
              <button
                type="button"
                data-travel-hotel-dot="${j}"
                data-travel-hotel-image-src="${a(m)}"
                class="${j===0?"w-4 bg-white shadow-sm":"w-1.5 bg-white/50"} h-1.5 rounded-full transition-all duration-300"
                aria-label="Hotelbild ${j+1}"
              ></button>
            `).join("")}
          </div>
        `:`
          <span data-travel-hotel-dot="0" data-travel-hotel-image-src="${a(c)}" class="hidden"></span>
        `}

        <div class="absolute top-3.5 right-3.5 flex gap-2 z-10">
          <button
            type="button"
            data-travel-hotel-like="${a(l)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            aria-label="Zu Favoriten hinzufuegen"
          >
            ${n("heart",`w-4 h-4 ${d?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
          </button>
          <button
            type="button"
            data-travel-hotel-share="${a(l)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Teilen"
            aria-label="Teilen"
          >
            ${n("share-2","w-4 h-4")}
          </button>
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${T(p,`${i} Logo`,{...t,extraClass:"rounded-full"})}
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
          <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5" style="margin-top:0.125rem;">${a(h)}</p>
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${n("map-pin","w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${a(_)}</span>
          </div>
          <div class="flex items-center gap-3">
            ${s("navigation","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(g||"Zentrum folgt")}</span>
          </div>
          <div class="flex items-center gap-3">
            ${s("waves","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a($||"Strand / See folgt")}</span>
          </div>
        </div>

        ${v.length?`
          <div class="flex flex-wrap gap-1.5">
            ${v.map(m=>`
              <span class="text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100">${a(m)}</span>
            `).join("")}
          </div>
        `:""}

        <hr class="border-slate-100" />

        <div class="flex items-center justify-between mt-0.5 gap-4">
          <div class="flex flex-col">
            <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Bestpreis</span>
            <div class="flex items-baseline gap-1">
              ${k?`
                <span class="text-base font-black text-slate-900">ab ${a(k)} €</span>
                <span class="text-[9px] text-slate-500 font-bold">p.P.</span>
              `:`
                <span class="text-base font-black text-slate-900">Preis folgt</span>
              `}
            </div>
          </div>

          <button
            type="button"
            data-marketplace-open-business="${a(l)}"
            data-tab="profile"
            class="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150 active:scale-95 cursor-pointer max-w-[140px]"
            style="max-width:140px;"
          >
            <span>Mehr</span>
            ${n("chevron-right","w-3.5 h-3.5")}
          </button>
        </div>
      </div>
    </article>
  `}function De(e=[],t={}){const a=e.slice(0,4);return a.length?`
    <div class="space-y-4">
      ${a.map(n=>Ue(n,t)).join("")}
    </div>
  `:M({emptyTitle:"Noch keine Angebote",emptyBody:"Keine passenden Hotel-Angebote gefunden.",icon:"plane"},t)}function le(e=[],t={}){return e.length?`
    <div class="space-y-4">
      ${e.map(a=>Ke(a,t)).join("")}
    </div>
  `:M({emptyTitle:"Keine Hotels gefunden",emptyBody:"Keine passenden Hotels fuer dieses Reiseziel gefunden.",icon:"plane"},t)}function Ve(e={},t=0,a={}){const n=a.escapeHtml,s=L(e),i=y(e),l=w(e),o=O(e),c=18+t*23%58,p=22+t*17%46;return`
    <button
      type="button"
      data-marketplace-open-business="${n(l)}"
      class="absolute w-12 h-12 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center active:scale-95 transition-all"
      style="left:${c}%; top:${p}%; transform:translate(-50%,-50%); color:${z};"
      title="${n(`${i} - ${o}`)}"
    >
      ${a.icon("plane","w-5 h-5")}
      ${s?`<span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${n(`${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`)}</span>`:""}
    </button>
  `}function qe(e=[],t={}){if(typeof t.renderMapView=="function")return t.renderMapView();const a=e.filter(n=>L(n)).slice(0,8);return e.length?`
    <div class="space-y-4">
      <div class="relative overflow-hidden border border-slate-200 bg-slate-200 shadow-sm" style="height:24rem; border-radius:2.5rem;">
        <div class="absolute inset-0" style="background:linear-gradient(135deg,#e0f7fb 0%,#dbeafe 45%,#e2e8f0 100%);"></div>
        <div class="absolute inset-0 opacity-60" style="background-image:linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px); background-size:42px 42px;"></div>
        ${a.map((n,s)=>Ve(n,s,t)).join("")}
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
  `:le(e,t)}function Ge({state:e,dataLoaded:t,section:a,deps:n}={}){const s=U(e,a.key,n).map(u=>K({...u,__marketplaceType:E(u,n)},a)),i=Pe(e),l=!!i.query,o=l?s.filter(u=>he(u,i.query)):s.slice(0,N),c=o.slice(0,N),p=l?i.activeTab:"offers",b=t?.restaurants===!0,f=p==="map"?qe(c,n):p==="hotels"?le(c,n):De(c,n);return`
    <section id="travelView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${He({travel:i,deps:n})}
      <div id="travelBenko" data-travel-benko style="margin-top:-1.75rem; border-top-left-radius:2.5rem; border-top-right-radius:2.5rem; background:#f8fafc; padding:2rem 1.5rem 6.5rem;">
        ${Fe({activeTab:p,hasDestination:l,hotelCount:o.length,deps:n})}
        <div class="mt-5">
          ${b||s.length?f:D(a,n)}
        </div>
      </div>
    </section>
  `}function Ye({state:e={},dataLoaded:t=null,sectionKey:a="restaurants",escapeHtmlFn:n,iconFn:s,getOptimizedImageUrlFn:i,isPlaceholderUrlFn:l,placeholderImage:o="",normalizeRestaurantTypeFn:c,normalizeLeadTypeKeyFn:p,resolveRestaurantLogoFn:b,renderMapViewFn:f}={}){const u=R[Q(a)]||R.restaurants,h=q(n,(d="")=>String(d||"")),_=q(s,()=>""),g={escapeHtml:h,icon:_,getOptimizedImageUrl:i,isPlaceholderUrl:l,placeholderImage:o,resolveRestaurantLogo:b,renderMapView:f,normalizeRestaurantType:c,normalizeLeadTypeKey:p},$=t?.restaurants===!0;if(u.key==="travel")return Ge({state:e,dataLoaded:t,section:u,deps:g});if(u.key==="restaurants")return Me({state:e,dataLoaded:t,section:u,deps:g});const v=U(e,u.key,g).slice(0,N).map(d=>K({...d,__marketplaceType:E(d,g)},u)),k=v.slice(0,Y);return`
    <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      ${v.length?`
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
            ${k.map(d=>ie(d,g)).join("")}
          </div>
        </div>

        <div class="space-y-4">
          ${v.map(d=>Ae(d,g)).join("")}
        </div>
      `:$?M(u,g):D(u,g)}
    </section>
  `}export{U as filterMarketplaceBusinessesCore,Ye as renderMarketplaceViewCore,de as resolveMarketplaceSectionForBusinessCore};
