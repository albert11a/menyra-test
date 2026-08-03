const B=Object.freeze({restaurants:Object.freeze({key:"restaurants",title:"Restaurants",emptyTitle:"Ende nuk ka restorante",emptyBody:"Nuk u gjeten profile te pershtatshme.",icon:"utensils",typeKeys:Object.freeze(["restaurant","cafe","coffee","fastfood","food"])}),travel:Object.freeze({key:"travel",title:"Travel",emptyTitle:"Ende nuk ka profile Travel",emptyBody:"Nuk u gjeten profile te pershtatshme.",icon:"plane",typeKeys:Object.freeze(["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"])}),shopping:Object.freeze({key:"shopping",title:"Shopping",emptyTitle:"Ende nuk ka profile Shopping",emptyBody:"Nuk u gjeten profile te pershtatshme.",icon:"shopping-bag",typeKeys:Object.freeze(["ecommerce"])})}),ne=new Map;Object.values(B).forEach(e=>{e.typeKeys.forEach(t=>{ne.set(t,e.key)})});const se=8,R=24,_e="#ff4f3f",Se="mnyra_social_feed_viewer_location_v1",ie="#00cce5",Ae="#005f73",Pe="#4b766d",Ue=Object.freeze(["FASHION","BEAUTY","SNEAKER","BABY","HOME","GROCERY","ELECTRONICS","LOCAL"]),le=35,Ne=Object.freeze([Object.freeze({label:"Prishtina",lat:42.6629,lng:21.1655}),Object.freeze({label:"Prizren",lat:42.2139,lng:20.7397}),Object.freeze({label:"Peja",lat:42.6591,lng:20.2883}),Object.freeze({label:"Gjakova",lat:42.3803,lng:20.4308}),Object.freeze({label:"Ferizaj",lat:42.3706,lng:21.1553}),Object.freeze({label:"Gjilan",lat:42.4635,lng:21.4699}),Object.freeze({label:"Mitrovica",lat:42.8914,lng:20.866}),Object.freeze({label:"Vushtrria",lat:42.8231,lng:20.9675}),Object.freeze({label:"Podujeva",lat:42.9106,lng:21.193}),Object.freeze({label:"Tirana",lat:41.3275,lng:19.8187}),Object.freeze({label:"Kukes",lat:42.0769,lng:20.4219}),Object.freeze({label:"Smederevo",lat:44.6644,lng:20.9276})]),Be=Object.freeze([Object.freeze(["prishtina","prishtine","prishtin","pristina"]),Object.freeze(["ferizaj","ferizaji","uroshevac"]),Object.freeze(["peja","peje","pec"]),Object.freeze(["prizren","prizreni"]),Object.freeze(["gjakova","gjakove","djakova"]),Object.freeze(["gjilan","gjilani"]),Object.freeze(["mitrovica","mitrovice"]),Object.freeze(["vushtrria","vushtrri"]),Object.freeze(["podujeva","podujeve","podujevo","besiana"]),Object.freeze(["fushe kosove","fushe kosova","fush kosove","fush kosova"]),Object.freeze(["lipjan"]),Object.freeze(["suhareka","suhareke","theranda"]),Object.freeze(["rahovec","rahoveci"]),Object.freeze(["drenas","gllogoc"]),Object.freeze(["skenderaj","skenderaji"]),Object.freeze(["malisheva","malisheve"]),Object.freeze(["kamenica","kamenice","kamenica kosove"]),Object.freeze(["decan","decani"]),Object.freeze(["istog","istogu"]),Object.freeze(["klina","kline"]),Object.freeze(["vite","vitia"]),Object.freeze(["hani i elezit","hani elezit"]),Object.freeze(["tirana","tirane"]),Object.freeze(["durres","durresi"]),Object.freeze(["vlora","vlore"]),Object.freeze(["shkoder","shkodra"]),Object.freeze(["shengjin","shëngjin","shen gjin","shengjini"]),Object.freeze(["ksamil","ksamili"]),Object.freeze(["dhermi","dhërmi","dhermiu"]),Object.freeze(["velipoje","velipojë","velipoja"]),Object.freeze(["theth","thethi"]),Object.freeze(["valbone","valbonë","valbona"]),Object.freeze(["elbasan","elbasani"]),Object.freeze(["fier","fieri"]),Object.freeze(["korce","korca"]),Object.freeze(["sarande","saranda"]),Object.freeze(["berat","berati"]),Object.freeze(["gjirokaster","gjirokastra"]),Object.freeze(["kukes","kukesi"]),Object.freeze(["lezhe","lezha"]),Object.freeze(["pogradec","pogradeci"]),Object.freeze(["kruje","kruja"]),Object.freeze(["fushe kruje","fushë krujë","fushe-kruje","fush kruje"]),Object.freeze(["lushnje","lushnja"]),Object.freeze(["himare","himarë","himara"]),Object.freeze(["kavaje","kavajë","kavaja"]),Object.freeze(["kamze","kamëz","kamza"]),Object.freeze(["vore","vorë","vora"]),Object.freeze(["divjake","divjakë","divjaka"]),Object.freeze(["permet","përmet","permeti"]),Object.freeze(["tepelene","tepelenë","tepelena"]),Object.freeze(["delvine","delvinë","delvina"]),Object.freeze(["peshkopi","peshkopia","diber","dibër"]),Object.freeze(["burrel","burreli","mat"]),Object.freeze(["puke","pukë","puka"]),Object.freeze(["bajram curri","bajramcurri","tropoje","tropojë"]),Object.freeze(["krume","krumë","has"]),Object.freeze(["lac","laç","kurbin"]),Object.freeze(["orikum","orikumi"]),Object.freeze(["golem","golemi"]),Object.freeze(["jale","jalë","jali"]),Object.freeze(["qepare","qeparo","qeparoi"]),Object.freeze(["borsh","borshi"]),Object.freeze(["lukove","lukovë","lukova"]),Object.freeze(["palase","palasë","palasa"]),Object.freeze(["drimadhe","drymades","drimadhes"]),Object.freeze(["spille","spilleja"]),Object.freeze(["gjiri i lalzit","lalzi","lalez","lalëz"])]),Re=Object.freeze([Object.freeze(["prishtina","prishtine","prishtin","pristina"]),Object.freeze(["ferizaj","ferizaji","uroshevac"]),Object.freeze(["peja","peje","pec"]),Object.freeze(["prizren","prizreni"]),Object.freeze(["gjakova","gjakove","djakova"]),Object.freeze(["gjilan","gjilani"]),Object.freeze(["mitrovica","mitrovice"]),Object.freeze(["vushtrria","vushtrri"]),Object.freeze(["podujeva","podujeve","podujevo","besiana"]),Object.freeze(["fushe kosove","fushe kosova","fush kosove","fush kosova"]),Object.freeze(["lipjan"]),Object.freeze(["suhareka","suhareke","theranda"]),Object.freeze(["rahovec","rahoveci"]),Object.freeze(["drenas","gllogoc"]),Object.freeze(["skenderaj","skenderaji"]),Object.freeze(["malisheva","malisheve"]),Object.freeze(["kamenica","kamenice","kamenica kosove"]),Object.freeze(["decan","decani"]),Object.freeze(["istog","istogu"]),Object.freeze(["klina","kline"]),Object.freeze(["vite","vitia"]),Object.freeze(["hani i elezit","hani elezit"])]),re=Object.freeze(["city","locationCity","primaryCity","place","locationPlace","primaryPlace","postalCity","address","primaryAddress","formattedAddress","fullAddress","addressText","streetAddress","street","locationLabel","displayLocation","locality","town","municipality","village","neighborhood","area","district","county","region","state","province","country","countryCode"]),te=Object.freeze([...re,"label","name","title"]),Ee=Object.freeze(["location","primaryLocation","businessLocation","venueLocation","addressInfo","place","geo","coords","coordinates","geoPoint"]);function ae(e,t=()=>""){return typeof e=="function"?e:t}function l(e=""){return String(e||"").trim()}function x(e=""){const t=l(e).toLowerCase();return t?t.replace(/[ëèéê]/g,"e").replace(/[çćč]/g,"c").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):""}function oe(e=""){const t=x(e);if(!t)return[];const a=new Set([t]);return Be.forEach(n=>{const s=n.map(x).filter(Boolean);s.includes(t)&&s.forEach(i=>a.add(i))}),Array.from(a)}function He(e=""){const t=x(e);if(!t)return[];const a=new Set(oe(e));return Re.forEach(n=>{const s=n.map(x).filter(Boolean);s.includes(t)&&s.forEach(i=>a.add(i))}),Array.from(a)}function ce(e=""){const t=x(e);return t==="restaurant"?"restaurants":["hotel","hotels","motel","motels"].includes(t)?"travel":["shop","ecommerce","e_commerce","shopping"].includes(t)?"shopping":B[t]?t:"restaurants"}function pe(e=""){const t=x(e);return t?t==="e_commerce"||t==="online_shop"||t==="onlineshop"||t==="shop"||t==="store"?"ecommerce":t==="coffee"||t==="coffe"||t==="coffee_shop"||t==="coffeeshop"||t==="kaffee"||t==="caffe"?"cafe":t==="fast_food"||t==="snack"||t==="imbiss"?"fastfood":t==="hotels"?"hotel":t==="motels"?"motel":t:""}function Fe(e={}){return[e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType]}function H(e={},{normalizeRestaurantType:t,normalizeLeadTypeKey:a}={}){const n=typeof t=="function"?t:(o=>o),s=typeof a=="function"?a:(o=>o),i=Fe(e);for(const o of i){const c=pe(n(o)||s(o)||o);if(c)return c}const r=[e.name,e.restaurantName,e.businessName,e.description,e.bio].map(o=>l(o).toLowerCase()).join(" ");return/\bhotel(s)?\b/.test(r)?"hotel":/\bmotel(s)?\b/.test(r)?"motel":/\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b/.test(r)?"cafe":/\bfast\s*food\b|\bfastfood\b/.test(r)?"fastfood":/\be-?commerce\b|\bonline\s*shop\b/.test(r)?"ecommerce":/\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b/.test(r)?"restaurant":""}function Me(e={},t={}){const a=H(e,t);return ne.get(a)||""}function j(e={}){return l(e.canonicalRestaurantId||e.restaurantId||e.id||e.landingRestaurantId||"")}function k(e={}){return l(e.name||e.restaurantName||e.businessName||e.displayName||"Business")}function De(e={}){return l(e.place||e.locationPlace||e.locality||e.district||e.neighborhood||e.neighbourhood||e.area||e.quarter||e.cityArea||e.primaryPlace||"")}function S(e={}){const t=l(e.city||e.locationCity||e.primaryCity),a=De(e);if(t&&a&&x(t)!==x(a))return`${t} - ${a}`;const n=l(e.address||e.location||e.primaryAddress);return t||a||K(e)||l(e.country||e.region||"")||n||"Vendndodhja se shpejti"}function Q(e={}){const t=Number(String(e?.lat??e?.latitude??"").replace(",",".")),a=Number(String(e?.lng??e?.lon??e?.longitude??"").replace(",","."));return!Number.isFinite(t)||!Number.isFinite(a)||Math.abs(t)>90||Math.abs(a)>180||Math.abs(t)<1e-6&&Math.abs(a)<1e-6?null:{lat:t,lng:a}}function ue(e={},t={}){const a=Number(e.lat),n=Number(e.lng),s=Number(t.lat),i=Number(t.lng);if(![a,n,s,i].every(Number.isFinite))return Number.POSITIVE_INFINITY;const r=h=>h*Math.PI/180,o=6371,c=r(s-a),u=r(i-n),d=Math.sin(c/2),f=Math.sin(u/2),p=d*d+Math.cos(r(a))*Math.cos(r(s))*f*f;return 2*o*Math.atan2(Math.sqrt(p),Math.sqrt(Math.max(0,1-p)))}function K(e={}){const t=F(e);if(!t)return"";const a=Ne.map(n=>({label:n.label,distanceKm:ue(t,n)})).filter(n=>Number.isFinite(n.distanceKm)).sort((n,s)=>n.distanceKm-s.distanceKm)[0];return a&&a.distanceKm<=le?a.label:"E shenuar ne harte"}function qe(e={}){const t=[e.id,e.restaurantId,e.canonicalRestaurantId,e.publicSlug,e.landingSlug,e.handle,e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType,e.city,e.locationCity,e.primaryCity,e.place,e.locationPlace,e.locality,e.neighborhood,e.neighbourhood,e.address,e.location,e.primaryAddress,K(e),e.country,e.region,e.district,e.name,e.restaurantName,e.businessName,e.displayName,e.description,e.bio,e.about];return Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||t.push(a.city,a.place,a.locationPlace,a.locality,a.district,a.address,a.country,a.region,a.name)}),t}function Ke(e={},t=""){const a=oe(t);if(!a.length)return!0;const n=qe(e).map(x).filter(Boolean).join("_");return a.some(s=>{const i=s.split("_").filter(Boolean);return n.includes(s)?!0:i.length>0&&i.every(r=>n.includes(r))})}function q(e=[],t=""){if(typeof t=="string"||typeof t=="number"){const a=l(t);a&&e.push(a)}}function G(e=[],t={},a=re){!t||typeof t!="object"||a.forEach(n=>q(e,t[n]))}function Ve(e={}){const t=[];return G(t,e),q(t,e.location),q(t,K(e)),Ee.forEach(a=>{G(t,e[a],te)}),Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||(G(t,a,te),q(t,K(a)))}),t}function Ye(e={},t=""){const a=He(t);if(!a.length)return!1;const n=Ve(e).map(x).filter(Boolean).join("_");return n?a.some(s=>{const i=s.split("_").filter(Boolean);return n.includes(s)||i.length>0&&i.every(r=>n.includes(r))}):!1}function de(e={},t=null){if(!t)return!0;const a=l(t.city||t.label||"");if(a)return!!Ye(e,a);const n=Q(t),s=F(e);return n&&s?ue(n,s)<=le:!a&&!n}function F(e={}){const t=[{lat:e.lat,lng:e.lng},{lat:e.latitude,lng:e.longitude},{lat:e.latitude,lng:e.lon},{lat:e._lat,lng:e._long},{lat:e._latitude,lng:e._longitude},{lat:e.gpsLat,lng:e.gpsLng},{lat:e.mapLat,lng:e.mapLng},{lat:e.geo?.lat,lng:e.geo?.lng},{lat:e.geo?.latitude,lng:e.geo?.longitude},{lat:e.geo?.latitude,lng:e.geo?.lon},{lat:e.coords?.lat,lng:e.coords?.lng},{lat:e.coords?.latitude,lng:e.coords?.longitude},{lat:e.coordinates?.lat,lng:e.coordinates?.lng},{lat:e.coordinates?.latitude,lng:e.coordinates?.longitude},{lat:e.coordinates?._lat,lng:e.coordinates?._long},{lat:e.coordinates?._latitude,lng:e.coordinates?._longitude},{lat:e.geoPoint?.lat,lng:e.geoPoint?.lng},{lat:e.geoPoint?.latitude,lng:e.geoPoint?.longitude},{lat:e.geoPoint?._lat,lng:e.geoPoint?._long},{lat:e.geoPoint?._latitude,lng:e.geoPoint?._longitude},{lat:e.geopoint?.lat,lng:e.geopoint?.lng},{lat:e.geopoint?.latitude,lng:e.geopoint?.longitude},{lat:e.geopoint?._lat,lng:e.geopoint?._long},{lat:e.geopoint?._latitude,lng:e.geopoint?._longitude},{lat:e.location?.lat,lng:e.location?.lng},{lat:e.location?.latitude,lng:e.location?.longitude},{lat:e.primaryLocation?.lat,lng:e.primaryLocation?.lng},{lat:e.primaryLocation?.latitude,lng:e.primaryLocation?.longitude},{lat:e.businessLocation?.lat,lng:e.businessLocation?.lng},{lat:e.businessLocation?.latitude,lng:e.businessLocation?.longitude}];for(const a of t){const n=Q(a);if(n)return n}if(Array.isArray(e.locations))for(const a of e.locations){const n=F(a||{});if(n)return n}return null}function fe(e={}){const t=e.openingHours||e.openHours||e.hours||e.businessHours||e.workingHours||"";if(typeof t=="string"&&l(t))return l(t);if(t&&typeof t=="object"){const a=Object.values(t).map(l).filter(Boolean);if(a.length)return a[0]}return"Orari se shpejti"}function Ge(e={}){return l(e.phone||e.telephone||e.contactPhone||e.ownerPhone||"")}function Xe(e={}){return l(e.description||e.bio||e.about||e.shortDescription||"")}function A(e={}){const t=Number(e.rating??e.avgRating??e.score??e.publicRating??0);return!Number.isFinite(t)||t<=0?"":Math.min(5,Math.max(1,t)).toFixed(1)}function T(e={},{getOptimizedImageUrl:t,resolveRestaurantLogo:a,placeholderImage:n=""}={}){const s=j(e),i=l(e.logoUrl||e.logo||e.logoURL||e.heroUrl||e.coverUrl||e.imageUrl||e.img||""),o=(s&&typeof a=="function"?l(a(s,i,"medium")):i)||i||n;return(typeof t=="function"?l(t(o,"medium")):o)||n||""}function V(e={},{getOptimizedImageUrl:t,placeholderImage:a=""}={}){const s=l(e.titleImageUrl||e.coverImageUrl||e.coverImage||e.coverUrl||e.heroImageUrl||e.heroUrl||e.imageUrl||e.bestSpotLogoUrl||e.spotLogoUrl||e.logoUrl||e.logo||"")||a;return(typeof t=="function"?l(t(s,"large")):s)||a||""}function v(e){if(Array.isArray(e))return e.map(l).filter(Boolean);const t=l(e);return t?t.split(/[\n,;|]/).map(l).filter(Boolean):[]}function ge(e={},t={}){const a=[...v(e.offerCoverImages),...v(e.coverImages),...v(e.hotelCoverImages),...v(e.titleImages),e.offerImageUrl,e.titleImageUrl,e.coverImageUrl,e.coverImage,e.coverUrl,e.heroImageUrl,e.heroUrl,e.imageUrl].map(l).filter(Boolean),n=[];a.forEach(r=>{n.includes(r)||n.push(r)});const s=V(e,t);s&&!n.includes(s)&&n.push(s);const i=n.map(r=>typeof t.getOptimizedImageUrl=="function"?l(t.getOptimizedImageUrl(r,"large")):r).filter(Boolean);return i.length?i.slice(0,5):[t.placeholderImage||""].filter(Boolean)}function be(e={}){return l(e.cuisine||e.kitchen||e.foodType||e.categoryLabel||e.__marketplaceTypeLabel||e.type||e.customerType||"")}function he(e={}){return l(e.priceRange||e.priceLevel||e.priceLabel||e.budget||"")}function X(e,t=""){return typeof e=="string"?l(e):e===!0?l(t):""}function me(e={}){const t=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{},a=[X(e.gardenTerraceText||e.gardenTerrace||e.gardenOrTerrace||t.gardenTerrace,"Gastgarten"),X(e.accessibilityText||e.barrierFreeText||e.accessibleText||e.barrierefrei||e.accessible||t.accessibility,"Barrierefrei"),X(e.veganOptionsText||e.veganOptions||e.veganText||e.vegan||t.veganOptions,"Vegane Optionen")].filter(Boolean);if(a.length)return a.slice(0,3);const n=Array.isArray(e.features)?e.features.map(l).filter(Boolean):[];if(n.length)return n.slice(0,3);const s=l(e.features||e.amenities||"");return s?s.split(/[,;|]/).map(l).filter(Boolean).slice(0,3):[]}function Je(e={}){return l(e.hotelCategory||e.categoryLabel||e.__marketplaceTypeLabel||e.travelCategory||e.typeLabel||e.type||e.customerType||"Hotel")}function xe(e="",{suffix:t="",directLabel:a=""}={}){const n=l(e);if(!n)return"";const s=x(n);if(s==="direkt_im_zentrum"||s==="direkt_am_zentrum"||s==="direkt_am_strand"||s==="ne_qender"||s==="ne_plazh"||s==="direkt_ne_qender"||s==="direkt_ne_plazh")return a||n;const i=x(t);if(i&&s.includes(i))return n;const r=n.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)\b/i);return!r||!t?n:`${r[1].replace(",",".")} ${r[2].toLowerCase().startsWith("k")?"km":"m"} ${t}`}function ve(e={}){return xe(e.distanceCenter||e.distanceToCenter||e.centerDistance||e.cityCenterDistance||e.centerDistanceLabel||e.zentrumEntfernung||e.distanceCentre||"",{suffix:"nga qendra",directLabel:"Në qendër"})}function ye(e={}){return xe(e.distanceBeach||e.distanceToBeach||e.beachDistance||e.beachDistanceLabel||e.strandEntfernung||e.lakeDistance||e.distanceToLake||"",{suffix:"nga plazhi",directLabel:"Në plazh"})}function we(e={}){return l(e.hotelStartingPrice||e.startingPrice||e.priceFrom||e.fromPrice||e.bestPrice||e.roomStartingPrice||"").replace(/^\s*ab\s+/i,"").replace(/\s*(eur|€)\s*$/i,"").trim()}function Z(e=""){const t=x(e);return t==="total"||t==="totali"||t==="gesamt"?"total":"per_person"}function We(e={}){return Z(e.priceUnit||e.hotelPriceUnit||e.offerPriceUnit||"")==="total"?"Totali":"p.P"}function Qe(e={}){return Z(e.priceUnit||e.hotelPriceUnit||e.offerPriceUnit||"")==="total"?"Totali":"Për person"}function Ze(e={}){const t=l(e.offerBadgeLabel||e.travelOfferBadgeLabel||e.badgeLabel||"Ofertë"),a=x(t);return!t||a==="oferta"||a==="oferte"?"Ofertë":t}function et(e={}){return l(e.offerDurationLabel||e.nightsDaysLabel||e.durationLabel||"")}function tt(e={}){return l(e.offerDestination||e.destination||e.travelDestination||e.city||e.locationCity||e.primaryCity||S(e))}function at(e={}){return l(e.offerText||e.offerDescription||e.text||e.description||e.bio||e.about||"")}function ke(e={}){const t=[e.offerDetails,e.offerDetailItems,e.includedServices,e.inclusions,e.packageIncludes,e.includes],a=[];return t.forEach(n=>{if(Array.isArray(n)){n.map(l).filter(Boolean).forEach(s=>{a.includes(s)||a.push(s)});return}typeof n=="string"&&v(n).forEach(s=>{a.includes(s)||a.push(s)})}),a.length?a.slice(0,8):ee(e).slice(0,6)}function ee(e={}){if(e.__travelOffer===!0){const r=[...v(e.offerFeatures),...v(e.features),...v(e.hotelFeatures)];if(r.length)return r.slice(0,6)}const t=[e.hotelFeatureOneText,e.hotelFeatureTwoText,e.hotelFeatureThreeText].map(l).filter(Boolean),a=[...v(e.features),...v(e.hotelFeatures)].filter(Boolean),n=[];if([...t,...a].forEach(r=>{r&&!n.includes(r)&&n.push(r)}),n.length)return n.slice(0,6);const s=me(e);return s.length?s.slice(0,3):v(e.hotelAmenities||e.amenities||e.facilities).slice(0,3)}function nt(e=""){const t=x(e);return/(mengjes|gjysme|pension|inclusive|restorant|ushqim|fruehstueck|breakfast|food)/.test(t)?"utensils":/(shezlong|plazh|strand|beach|lounger)/.test(t)?"waves":/(parking|parkplatz|garage|garazh)/.test(t)?"parking":"check"}function je(e="",t={},a=""){const n=t.escapeHtml,s=l(e);if(!s)return"";const i=a||"text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100",r=nt(s);return`
    <span class="${i} inline-flex items-center gap-1.5">
      ${P(r,"w-3 h-3 shrink-0",t)}
      <span>${n(s)}</span>
    </span>
  `}function P(e="",t="",a={}){const n=a.icon,s=a.escapeHtml,i=l(t),o=`xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${i?` class="${s(i)}"`:""} aria-hidden="true" focusable="false"`;return e==="share-2"?`<svg ${o}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.59 13.51 6.83 3.98"></path><path d="m15.41 6.51-6.82 3.98"></path></svg>`:e==="phone"?`<svg ${o}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`:e==="book-open"?`<svg ${o}><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>`:e==="navigation"?`<svg ${o}><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`:e==="waves"?`<svg ${o}><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>`:e==="utensils"?`<svg ${o}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>`:e==="star"?`<svg ${o}><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.751a.53.53 0 0 1 .294.904l-3.738 3.644a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.393 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.155 9.79a.53.53 0 0 1 .294-.906l5.165-.75a2.12 2.12 0 0 0 1.596-1.16z"></path></svg>`:e==="user"?`<svg ${o}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`:e==="parking"||e==="square-parking"?`<svg ${o}><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 17V7h5a3 3 0 0 1 0 6H9"></path></svg>`:e==="check"?`<svg ${o}><path d="M20 6 9 17l-5-5"></path></svg>`:typeof n=="function"?n(e,t):""}function st(e={}){const t=Number(e.rating??e.avgRating??e.publicRating??0),a=Number(e.score??e.publicScore??0),n=Number(e.followersCount??e.followerCount??0),s=Number(e.postsCount??e.postCount??0),i=Number(e.updatedAt?.seconds||e.createdAt?.seconds||0);return(Number.isFinite(t)?t*1e3:0)+(Number.isFinite(a)?a:0)+(Number.isFinite(n)?Math.min(n,500):0)+(Number.isFinite(s)?Math.min(s,200):0)+(Number.isFinite(i)?Math.min(i/1e5,100):0)}function it(e={},t={}){const a=new Map,n=(s={})=>{if(!s||typeof s!="object")return;const i=j(s);if(!i)return;const r=a.get(i)||{};a.set(i,{...r,...s,id:i})};return(Array.isArray(e.bootstrapRestaurantPreview)?e.bootstrapRestaurantPreview:[]).forEach(n),(Array.isArray(e.restaurants)?e.restaurants:[]).forEach(n),Array.from(a.values()).map(s=>({...s,__marketplaceSection:Me(s,t),__marketplaceScore:st(s)})).filter(s=>s.__marketplaceSection).sort((s,i)=>i.__marketplaceScore-s.__marketplaceScore||k(s).localeCompare(k(i)))}function M(e={},t="",a={}){const n=ce(t);return it(e,a).filter(s=>s.__marketplaceSection===n)}function _(e="",t="",{escapeHtml:a,isPlaceholderUrl:n,extraClass:s=""}={}){const i=l(e),r=!i||typeof n=="function"&&n(i);return`
    <img
      src="${a(i)}"
      alt="${a(t)}"
      loading="lazy"
      class="w-full h-full object-cover bg-slate-100 ${s}"
      ${r?'data-placeholder-image="true"':""}
    />
  `}function lt(e={},t={}){const a=t.escapeHtml,n=t.icon,s=k(e),i=j(e),r=T(e,t),o=A(e),c=S(e);return`
    <button type="button" data-marketplace-open-business="${a(i)}" class="shrink-0 w-44 text-left rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <div class="h-28 bg-slate-100 overflow-hidden">
        ${_(r,s,t)}
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
  `}function rt(e=""){const t=l(e).toLowerCase();return t==="approved"||t==="accepted"||t==="active"?"approved":t==="rejected"||t==="declined"||t==="denied"?"rejected":"pending"}function ot(e={}){return(Array.isArray(e.publicAds)?e.publicAds:Array.isArray(e.restaurantAds)?e.restaurantAds:[]).filter(a=>a&&a.active!==!1&&rt(a.status||a.approvalStatus||"")==="approved")}function ct(e=[]){return(Array.isArray(e)?e:[]).flatMap(t=>ot(t).map((a,n)=>({record:t,ad:a,index:n}))).slice(0,se)}function pt(e={},t="",a={}){const n=a.escapeHtml,s=T(e,a),i=l(t||k(e)||"Premium Highlight"),r=l(e.__marketplaceTypeLabel||"Restaurant");return s?`
      <div class="w-full h-full bg-[#fdfdfd] flex flex-col items-center justify-center p-4 border-b border-slate-100" style="background:#fdfdfd;padding:1rem;border-bottom:1px solid #f1f5f9;">
        <img
          src="${n(s)}"
          alt="${n(`${i} Logo`)}"
          loading="lazy"
          decoding="async"
          class="w-28 h-28 rounded-full border border-slate-100 bg-white object-contain"
          style="width:7rem;height:7rem;border-radius:9999px;border:1px solid #f1f5f9;background:#fff;object-fit:contain;padding:0.65rem;"
        />
        <span class="text-[10px] font-black tracking-widest text-[#a37f4c] uppercase mt-2 line-clamp-1" style="font-size:10px;font-weight:900;letter-spacing:0.1em;color:#a37f4c;text-transform:uppercase;margin-top:0.5rem;max-width:80%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${n(i)}
        </span>
      </div>
    `:`
    <div class="w-full h-full bg-[#fdfdfd] flex flex-col items-center justify-center p-4 border-b border-slate-100" style="background:#fdfdfd;padding:1rem;border-bottom:1px solid #f1f5f9;">
      ${P("utensils","w-12 h-12 text-amber-500 mb-1.5",a)}
      <span class="text-[10px] font-black tracking-widest text-[#a37f4c] uppercase mt-1" style="font-size:10px;font-weight:900;letter-spacing:0.1em;color:#a37f4c;text-transform:uppercase;margin-top:0.25rem;">
        ${n(r)}
      </span>
    </div>
  `}function ut(e={},t={}){const a=t.escapeHtml,n=(b,w)=>P(b,w,t),s=e.record||{},i=e.ad||{},r=j(s),o=k(s),c=l(i.title||o),u=l(i.category||be(s)||s.__marketplaceTypeLabel||"RESTAURANT").toUpperCase(),d=A(s)||"0.0",f=l(i.priceSegment||he(s)||"€€ - €€€"),p=l(i.imageUrl||V(s,t)),h=typeof t.getOptimizedImageUrl=="function"?l(t.getOptimizedImageUrl(p,"large")):p,$=Math.max(0,Math.min(100,Number(i.cropX??50)||50)),g=Math.max(0,Math.min(100,Number(i.cropY??50)||50)),m=i.bestChoiceBadgeEnabled!==!1,y=i.deliveryBadgeEnabled!==!1,z=i.woltEnabled!==!1;return`
    <article class="w-72 h-[24rem] flex-shrink-0 bg-white rounded-[1.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden border border-slate-100 snap-start relative group" style="width:min(18rem, calc(100vw - 4.5rem));height:24rem;flex:0 0 auto;border-radius:1.5rem;border:1px solid #f1f5f9;background:#fff;">
      <div class="relative h-44 flex-shrink-0 overflow-hidden bg-slate-100" style="height:11rem;flex:0 0 auto;background:#f1f5f9;">
        ${h?`
          <img
            src="${a(h)}"
            alt="${a(c)}"
            loading="lazy"
            decoding="async"
            class="w-full h-full object-cover"
            style="width:100%;height:100%;object-fit:cover;object-position:${$}% ${g}%;"
          />
        `:pt(s,c,t)}

        ${m||y?`
          <div class="absolute top-3 right-3 flex flex-col gap-1 w-[82px] z-10" style="top:0.75rem;right:0.75rem;width:82px;gap:0.25rem;z-index:10;">
            ${m?'<span class="bg-[#c5a059] text-white text-[6.5px] font-black uppercase tracking-wider h-[18px] flex items-center justify-center rounded-md border border-white/5 shadow-none" style="height:18px;border-radius:0.375rem;background:#c5a059;color:#fff;font-size:6.5px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;border:1px solid rgba(255,255,255,0.05);">Best Choice</span>':""}
            ${y?'<span class="bg-[#1f5f4c] text-white text-[6.5px] font-black uppercase tracking-wider h-[18px] flex items-center justify-center rounded-md border border-white/5 shadow-none" style="height:18px;border-radius:0.375rem;background:#1f5f4c;color:#fff;font-size:6.5px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;border:1px solid rgba(255,255,255,0.05);">For Delivery</span>':""}
          </div>
        `:""}

        ${z?`
          <div class="absolute bottom-4 left-4 bg-[#00b4d8] text-white h-[25px] px-3.5 rounded-md flex items-center justify-center border border-cyan-400/20 z-10 shadow-none" style="bottom:1rem;left:1rem;height:25px;padding-left:0.875rem;padding-right:0.875rem;border-radius:0.375rem;background:#00b4d8;color:#fff;border:1px solid rgba(34,211,238,0.2);z-index:10;">
            <span class="font-sans font-black tracking-widest text-[9px] uppercase" style="font-size:9px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;">WOLT</span>
          </div>
        `:""}
      </div>

      <div class="px-5 flex-1 flex flex-col bg-white" style="padding-left:1.25rem;padding-right:1.25rem;flex:1 1 0%;display:flex;flex-direction:column;background:#fff;">
        <div class="flex-1 flex flex-col justify-center pt-4 pb-4" style="flex:1 1 0%;display:flex;flex-direction:column;justify-content:center;padding-top:1rem;padding-bottom:1rem;min-height:0;">
          <span class="text-[10px] font-extrabold text-[#c5a059] tracking-widest uppercase block mb-0.5 line-clamp-1" style="font-size:10px;font-weight:800;color:#c5a059;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.125rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a(u)}</span>
          <h3 class="text-xl font-extrabold text-slate-800 line-clamp-1 group-hover:text-slate-900 transition-colors duration-200" style="font-size:1.25rem;line-height:1.75rem;font-weight:800;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a(c)}</h3>
        </div>

        <div class="flex items-center justify-between text-[10px] text-slate-600 font-semibold border-t border-slate-100 pt-3.5 pb-5" style="display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#475569;font-weight:600;border-top:1px solid #f1f5f9;padding-top:0.875rem;padding-bottom:1.25rem;gap:0.625rem;">
          <div class="flex items-center justify-center gap-1 bg-slate-50 rounded-md border border-slate-100/50" style="width:88px;height:24px;border-radius:0.375rem;background:#f8fafc;border:1px solid rgba(241,245,249,0.5);display:flex;align-items:center;justify-content:center;gap:0.25rem;min-width:0;">
            ${n("star","w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0")}
            <span class="font-bold text-slate-800">${a(d)}</span>
          </div>
          <div class="flex items-center justify-center gap-1 bg-slate-50 rounded-md border border-slate-100/50" style="width:88px;height:24px;border-radius:0.375rem;background:#f8fafc;border:1px solid rgba(241,245,249,0.5);display:flex;align-items:center;justify-content:center;gap:0.25rem;min-width:0;">
            ${n("utensils","w-3 h-3 text-slate-400 flex-shrink-0")}
            <span class="font-bold text-[10px] truncate" style="font-size:10px;font-weight:700;max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a(f)}</span>
          </div>
        </div>

        <div class="pb-6" style="padding-bottom:1.5rem;">
          <button type="button" data-marketplace-open-business="${a(r)}" data-tab="profile" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]" style="width:100%;background:#0f172a;color:#fff;font-weight:700;padding-top:0.875rem;padding-bottom:0.875rem;border-radius:0.75rem;font-size:0.75rem;line-height:1rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;">
            ${n("user","w-3.5 h-3.5 text-slate-300")}
            <span>Shiko profilin</span>
          </button>
        </div>
      </div>
    </article>
  `}function dt(e={},t={}){const a=t.escapeHtml,n=t.icon,s=k(e),i=j(e),r=T(e,t),o=A(e),c=S(e),u=fe(e),d=Xe(e),f=l(e.__marketplaceTypeLabel||e.type||e.customerType||"");return`
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <button type="button" data-marketplace-open-business="${a(i)}" class="w-full text-left active:scale-[0.99] transition-transform">
        <div class="h-48 bg-slate-100 overflow-hidden">
          ${_(r,s,t)}
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              ${f?`<p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">${a(f)}</p>`:""}
              <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight">${a(s)}</h3>
            </div>
            ${o?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${n("star","w-3 h-3 fill-current")} ${a(o)}</span>`:""}
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
  `}function J(e){if(Array.isArray(e))return e.map(l).filter(Boolean);const t=l(e);return t?t.split(/[\n,;|]/).map(l).filter(Boolean):[]}function $e(e={}){return l(e.id||e.productId||e.menuItemId||e.itemId||"")}function W(e={}){return l(e.name||e.title||e.productName||"Produkt")}function ze(e){return e?l(typeof e=="string"||typeof e!="object"?e:e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||""):""}function Oe(e={}){const t=[...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(ze).filter(Boolean);return t.filter((a,n)=>t.indexOf(a)===n)}function Te(e={}){return l(e.cardImageUrl||e.shoppingCardImageUrl||e.shoppingLandingImageUrl||e.productCardImageUrl||"")}function ft(e={},t={}){const a=Te(e)||Oe(e)[0]||"";return a?typeof t.getOptimizedImageUrl=="function"?l(t.getOptimizedImageUrl(a,"medium")):a:""}function gt(e={}){const t=l(e.priceLabel||e.displayPrice||e.formattedPrice||"");if(t)return t;const a=Number(e.price??e.amount??0);if(!Number.isFinite(a)||a<=0)return"";const n=l(e.currency||e.currencyCode||"€"),s=a%1===0?String(a):a.toFixed(2).replace(".",",");return n==="EUR"||n==="€"?`${s} €`:`${s} ${n}`}function bt(e={},t={},a=""){const n=$e(e);if(!n)return null;const s=Oe(e),i=s[0]||"";return{id:n,restaurantId:a,name:W(e),title:W(e),description:l(e.description||e.text||""),category:l(e.category||e.type||""),price:e.price??"",priceLabel:gt(e),currency:l(e.currency||e.currencyCode||""),cardImageUrl:Te(e),imageUrl:i,imageUrls:s,type:l(e.type||"food")||"food",catalogMode:"shop",restaurantType:"ecommerce",customerType:"ecommerce"}}function ht(e={},t={}){const a=[...Array.isArray(e.imageUrls)?e.imageUrls:[],e.imageUrl,...Array.isArray(t.imageUrls)?t.imageUrls:[],t.imageUrl].map(ze).filter(Boolean).filter((n,s,i)=>i.indexOf(n)===s);return{...t,...e,imageUrl:a[0]||e.imageUrl||t.imageUrl||"",imageUrls:a,cardImageUrl:l(e.cardImageUrl||t.cardImageUrl||"")}}function mt(e={}){const t=e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{};return[...Array.isArray(t.products)?t.products:[],...Array.isArray(e.shoppingLandingProducts)?e.shoppingLandingProducts:[],...Array.isArray(e.landingProducts)?e.landingProducts:[],...Array.isArray(e.productPreview)?e.productPreview:[],...Array.isArray(e.productsPreview)?e.productsPreview:[],...Array.isArray(e.publicMenuItems)?e.publicMenuItems:[],...Array.isArray(e.menuItems)?e.menuItems:[]].filter(a=>a&&typeof a=="object")}function xt(e={}){const t=e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{},a=[...J(t.productIds),...J(e.shoppingLandingCardProductIds),...J(e.shoppingLandingProductIds)];return a.filter((n,s)=>a.indexOf(n)===s)}function vt(e={},t={}){const a=j(e),n=new Map;mt(e).forEach(o=>{const c=bt(o,t,a);if(c?.id){if(n.has(c.id)){n.set(c.id,ht(n.get(c.id),c));return}n.set(c.id,c)}});const s=Array.from(n.values());if(!s.length)return[];const i=xt(e);if(!i.length)return s.slice(0,4);const r=i.map(o=>n.get(o)).filter(Boolean);return(r.length?r:s).slice(0,4)}function yt(e={},t={}){const a=e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{};if(a.active===!1||e.shoppingLandingCardEnabled===!1)return null;const n=k(e),s=T(e,t),i=l(a.imageUrl||a.heroImageUrl||e.shoppingLandingCardImageUrl||e.shoppingLandingImageUrl||""),r=i?typeof t.getOptimizedImageUrl=="function"?l(t.getOptimizedImageUrl(i,"large")):i:s,o=l(a.title||e.shoppingLandingCardTitle||e.landingCardTitle||n),c=l(a.subtitle||a.text||e.shoppingLandingCardSubtitle||e.categoryLabel||"");return{id:j(e),title:o,brand:n,heroImage:r,logoImage:s,mainText:c,products:vt(e,t)}}function wt(e={},t={}){const a=t.escapeHtml;return e.heroImage?`
      <img
        src="${a(e.heroImage)}"
        alt="${a(e.title||e.brand)}"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 w-full h-full object-cover"
      />
    `:`
    <div class="absolute inset-0 bg-slate-100"></div>
  `}function kt(e={},t={}){const a=t.escapeHtml,n=W(e),s=ft(e,t),i=a(JSON.stringify(e)),r=$e(e),o=l(e.restaurantId||"");return`
    <button
      type="button"
      data-menu-open="${a(r)}"
      data-menu-open-source="marketplace"
      data-menu-open-restaurant="${a(o)}"
      data-menu-open-product="${i}"
      class="flex-shrink-0 rounded-2xl shadow-sm border border-slate-100 cursor-pointer flex items-center justify-center relative overflow-hidden bg-white outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
      style="width:62%;height:12.25rem;scroll-snap-align:start;outline:none;-webkit-tap-highlight-color:transparent;"
      aria-label="${a(n)}"
    >
      ${s?`
        <img src="${a(s)}" alt="${a(n)}" loading="lazy" decoding="async" class="w-full h-full object-cover" />
      `:`
        <span class="text-4xl font-black text-slate-300">${a(n.slice(0,1).toUpperCase()||"S")}</span>
      `}
      ${e.oldPrice||e.compareAtPrice?`
        <span class="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg leading-none shadow-sm">%</span>
      `:""}
    </button>
  `}function jt(e={},t={}){const a=t.escapeHtml,n=t.icon,s=yt(e,t);return s?.id?`
    <article class="flex flex-col group" data-shopping-card data-shopping-search-text="${a(`${s.brand} ${s.title}`.toLowerCase())}">
      <div class="relative rounded-2xl flex flex-col items-center justify-center overflow-hidden p-3 shadow-sm hover:shadow-md transition-all duration-300 bg-slate-100" style="height:11.5rem;">
        ${wt(s,t)}
        ${s.logoImage?`
          <div class="absolute top-2 right-2 z-20 w-9 h-9 rounded-2xl bg-white border border-white/70 shadow-sm overflow-hidden" aria-hidden="true">
            <img src="${a(s.logoImage)}" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover" />
          </div>
        `:""}
      </div>

      ${s.products.length?`
        <div class="mt-2 px-2.5 overflow-hidden" style="margin-left:-0.625rem;margin-right:-0.625rem;">
          <div class="flex gap-2.5 overflow-x-auto hide-scrollbar py-1 px-0.5" style="-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-behavior:smooth;scroll-snap-type:x mandatory;">
            ${s.products.map(i=>kt(i,t)).join("")}
          </div>
        </div>
      `:""}

      <div class="mt-2 px-0.5 flex flex-col">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate leading-tight">${a(s.brand)}</span>
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-[12px] font-bold text-slate-800 leading-tight">Më shumë</span>
            <button
              type="button"
              data-marketplace-open-business="${a(s.id)}"
              data-tab="profile"
              class="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all duration-300 active:scale-95 flex-shrink-0"
              aria-label="Hap dyqanin"
            >
              ${n("chevron-right","w-4 h-4")}
            </button>
          </div>
        </div>
      </div>
    </article>
  `:""}function $t(e={}){const t=e.escapeHtml;return`
    <style>
      .shopping-brand-intro-card .text-slider-wrapper {
        position: relative;
        height: 1.08em;
        width: 100%;
        overflow: hidden;
        margin-bottom: 0.04rem;
      }
      .shopping-brand-intro-card .text-slide-item {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        opacity: 0;
        animation: shoppingBrandIntroTextFadeSlide 24s ease-in-out infinite;
        will-change: transform, opacity;
      }
      @keyframes shoppingBrandIntroTextFadeSlide {
        0% { opacity: 0; transform: translateY(100%); }
        2%, 10.5% { opacity: 1; transform: translateY(0); }
        12.5%, 100% { opacity: 0; transform: translateY(-100%); }
      }
    </style>
    <article
      class="shopping-brand-intro-card flex items-center justify-center text-center shadow-sm overflow-hidden"
      style="width:100%;min-height:12.75rem;border-radius:1rem;background:${Pe};color:#ffffff;padding:1.15rem 0.75rem;"
      aria-label="Shopping Brand"
    >
      <div class="w-full" style="font-weight:900;letter-spacing:0;line-height:1.08;font-size:1.65rem;">
        <div class="text-slider-wrapper">
          ${Ue.map((a,n)=>`
            <div class="text-slide-item" style="animation-delay:${n*3}s;">
              ${t(a)}
            </div>
          `).join("")}
        </div>
        <div style="font-weight:900;color:#ffffff;">SHOP</div>
      </div>
    </article>
  `}function zt({state:e,dataLoaded:t,section:a,deps:n}={}){const s=n.icon,i=M(e,a.key,n).slice(0,R).map(d=>Y({...d,__marketplaceType:H(d,n)},a)),r=t?.restaurants===!0;if(!i.length)return`
      <section data-shopping-view class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
        ${r?D(a,n):E(a,n)}
      </section>
    `;const o=[],c=[];i.forEach((d,f)=>{const p=jt(d,n);p&&(f%2===0?o:c).push(p)});const u=o.length+c.length>0;return`
    <section data-shopping-view class="min-h-full bg-slate-50 text-slate-900 animate-in slide-in-from-right-10 duration-500">
      <header class="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md px-4 pt-6 pb-4 h-16 flex items-center justify-between overflow-hidden">
        <div data-shopping-search-title class="transition-all duration-300 ease-in-out flex-shrink-0 opacity-100" style="max-width:80%;">
          <h1 class="text-[13px] font-black text-slate-800 tracking-tight whitespace-nowrap uppercase">Zbulo dyqanet me te mira</h1>
        </div>
        <div data-shopping-search-shell class="flex items-center transition-all duration-300 ease-in-out w-9">
          <button type="button" data-shopping-search-toggle class="p-2 hover:bg-slate-200 rounded-full text-slate-700 transition-all ml-auto active:scale-90 outline-none focus:outline-none focus-visible:outline-none focus:ring-0" style="outline:none;box-shadow:none;" aria-label="Kerko dyqane">
            ${s("search","w-4 h-4")}
          </button>
          <div data-shopping-search-panel class="hidden items-center w-full border-b border-slate-900 pb-1.5 outline-none focus-within:outline-none focus-within:ring-0" style="border-bottom-width:2px;box-shadow:none;">
            ${s("search","w-4 h-4 text-slate-400 flex-shrink-0 mr-2")}
            <input type="text" data-shopping-search-input placeholder="Kerko dyqane..." class="bg-transparent text-xs font-bold text-slate-800 w-full outline-none focus:outline-none focus-visible:outline-none focus:ring-0 placeholder-slate-400" style="box-shadow:none;" autocomplete="off" />
            <button type="button" data-shopping-search-close class="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors flex-shrink-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0" style="outline:none;box-shadow:none;" aria-label="Mbyll kerkimin">
              ${s("x","w-3.5 h-3.5")}
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 px-2 pt-3 pb-24">
        <div class="grid grid-cols-2 gap-2 items-start" data-shopping-card-grid>
          <div class="flex flex-col gap-6">${o.join("")}</div>
          <div class="flex flex-col gap-6">${u?$t(n):""}${c.join("")}</div>
        </div>
      </main>
    </section>
  `}function Ot(e={},t={}){const a=t.escapeHtml,n=t.icon,s=(w,O)=>P(w,O,t),i=k(e),r=j(e),o=V(e,t),c=T(e,t),u=A(e),d=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),f=u||"0.0",p=Number.isFinite(d)&&d>0?d:0,h=be(e),$=he(e)||"€€ - €€€",g=S(e),m=Ge(e),y=fe(e),z=me(e),b=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
    <article class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col" style="border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);">
      <div class="h-44 relative overflow-hidden group">
        ${_(o,i,{...t,extraClass:"transition-transform duration-700 group-hover:scale-105"})}
        <div class="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-black/20" style="background:linear-gradient(to top,#fff 0%,rgba(255,255,255,0.2) 50%,rgba(0,0,0,0.2) 100%);"></div>

        <div class="absolute top-3.5 right-3.5 flex gap-2 z-10" style="top:0.875rem;right:0.875rem;">
          <button
            type="button"
            data-marketplace-open-map="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Shfaq ne harte"
            aria-label="Shfaq ne harte"
          >
            ${n("map","w-4 h-4")}
          </button>
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            aria-label="Favorit"
          >
            ${n("heart",`w-4 h-4 ${b?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
          </button>
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Ndaj"
            aria-label="Ndaj"
          >
            ${s("share-2","w-4 h-4")}
          </button>
        </div>

        <div class="absolute bottom-3.5 right-4 bg-slate-900/90 text-white font-medium px-2.5 py-0.5 rounded-md text-[9px] tracking-wider shadow" style="bottom:0.875rem;background-color:rgba(15,23,42,0.9);">
          ${a($)}
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${_(c,`${i} Logo`,{...t,extraClass:"rounded-full"})}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-1">
            <div class="flex text-amber-500">
              ${n("star","w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${a(f)}</span>
            <span class="text-[11px] text-slate-400">(${a(String(p))} vleresime)</span>
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
          ${m?`
            <div class="flex items-center gap-3">
              ${s("phone","w-4 h-4 text-slate-400 shrink-0")}
              <span class="text-[11px] text-slate-600">${a(m)}</span>
            </div>
          `:""}
          <div class="flex items-center gap-3">
            ${n("clock","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(y)}</span>
          </div>
        </div>

        ${z.length?`
          <div class="flex flex-wrap gap-1.5">
            ${z.map(w=>`
              <span class="text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100">${a(w)}</span>
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
            ${n("user","w-3.5 h-3.5 text-slate-400")}
            Profili
          </button>

          <button
            type="button"
            data-marketplace-open-business="${a(r)}"
            data-tab="menu"
            class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            ${s("book-open","w-3.5 h-3.5 text-slate-200")}
            Menu
          </button>
        </div>
      </div>
    </article>
  `}function Y(e={},t={}){const a=l(e.__marketplaceType||e.type||e.customerType||""),n=pe(a);return{...e,__marketplaceTypeLabel:{restaurant:"Restaurant",cafe:"Cafe",coffee:"Cafe",fastfood:"Fastfood",hotel:"Hotel",motel:"Motel",ecommerce:"E-Commerce"}[n]||t.title,__marketplaceType:n}}function D(e={},t={}){const a=t.escapeHtml,n=t.icon;return`
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-5 rounded-[1.5rem] bg-slate-100 text-slate-400 flex items-center justify-center">
        ${n(e.icon,"w-6 h-6")}
      </div>
      <h3 class="text-lg font-black tracking-tight text-slate-900">${a(e.emptyTitle)}</h3>
      <p class="mt-2 text-xs font-semibold text-slate-400 leading-5">${a(e.emptyBody)}</p>
    </div>
  `}function E(e={},t={}){t.escapeHtml;const a=t.icon;return`
    <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
      ${a("loader-2","w-4 h-4 animate-spin")}
      Te dhenat po ngarkohen ...
    </div>
  `}function Le(){const e=globalThis?.localStorage||null;if(!e)return null;try{const t=e.getItem(Se);if(!t)return null;const a=JSON.parse(t),n=Q(a);if(!n)return null;const s=l(a?.source||""),i=l(a?.label||a?.city||""),r=l(a?.city||""),o=x(i),c=o==="current_location"||o==="currentlocation"||o==="standort"||o==="aktueller_standort";return{lat:n.lat,lng:n.lng,label:i,city:r||(c?"":i),source:s}}catch{return null}}function Mt(e={},t={}){const a=B.restaurants,n=Le(),s=M(e,a.key,t).filter(i=>!n||de(i,n));return{hasLocation:!!n,cityLabel:l(n?.city||n?.label||""),businesses:s.map(i=>({id:j(i),name:k(i),logoImage:T(i,t),coverImage:V(i,t),locationLabel:S(i)})).filter(i=>i.id)}}function Tt({deps:e}={}){const t=e.icon;return`
    <div id="restaurantsSearchTop" data-restaurant-search-top style="background:${_e};">
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
              placeholder="Shkruaj qytetin tend..."
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
              <button id="btnRestaurantLocateMe" type="button" data-restaurant-location-request class="loc-request-btn" aria-label="Perdor vendndodhjen">
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
  `}function Lt({items:e=[],adItems:t=[],section:a={},deps:n={}}={}){const s=n.escapeHtml,i=n.icon;return e.length?`
    ${t.length?`
      <div class="w-full space-y-5 mb-6" style="width:100%;margin-bottom:1.5rem;">
        <div class="flex items-center justify-between px-0" style="padding-left:0;padding-right:0;">
          <div>
            <h2 class="text-xl font-black tracking-tight text-slate-900 md:text-2xl">Highlights</h2>
            <p class="text-[11px] text-slate-400 font-semibold mt-0.5">${s("Partner premium ne afersine tende")}</p>
          </div>
          <div class="hidden md:flex items-center gap-1.5">
            <button type="button" data-restaurant-ads-scroll="left" class="bg-white hover:bg-slate-50 text-slate-800 p-2 rounded-full shadow-sm border border-slate-100 transition-all active:scale-95" aria-label="Levize majtas">
              ${i("chevron-left","w-3.5 h-3.5")}
            </button>
            <button type="button" data-restaurant-ads-scroll="right" class="bg-white hover:bg-slate-50 text-slate-800 p-2 rounded-full shadow-sm border border-slate-100 transition-all active:scale-95" aria-label="Levize djathtas">
              ${i("chevron-right","w-3.5 h-3.5")}
            </button>
          </div>
        </div>
        <div class="relative">
          <div data-restaurant-ads-track class="flex gap-6 overflow-x-auto hide-scrollbar pb-5 pt-2 px-0 snap-x snap-mandatory scroll-smooth" style="-webkit-overflow-scrolling:touch;scrollbar-width:none;display:flex;gap:1.5rem;overflow-x:auto;padding:0.5rem 0 1.25rem;scroll-snap-type:x mandatory;scroll-behavior:smooth;">
            ${t.map(r=>ut(r,n)).join("")}
          </div>
        </div>
      </div>
    `:""}

    <div class="space-y-4">
      ${e.map(r=>Ot(r,n)).join("")}
    </div>
  `:D(a,n)}function It({state:e,dataLoaded:t,section:a,deps:n}={}){const s=M(e,a.key,n).map(p=>Y({...p,__marketplaceType:H(p,n)},a)),i=Le(),r=!!i,o=r?s.filter(p=>de(p,i)):s,c=r?o:o.slice(0,R),u=ct(c),f=t?.restaurants===!0||s.length?Lt({items:c,adItems:u,section:a,deps:n}):E(a,n);return r?`
      <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
        ${f}
      </section>
    `:`
    <section id="restaurantsView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${Tt({deps:n})}
      <div id="restaurantsBenko" data-restaurants-benko class="loc-bento loc-bento--feed-content">
      </div>
    </section>
  `}function Ct(e={}){const t=e?.travelView&&typeof e.travelView=="object"?e.travelView:{},a=l(t.query||""),n=l(t.activeTab||"").toLowerCase(),s=["offers","hotels","map"].includes(n)?n:a?"hotels":"offers";return{query:a,activeTab:a?s:"offers",notice:l(t.notice||"")}}function _t({travel:e,deps:t}={}){const a=t.escapeHtml,n=t.icon;return`
    <div id="travelSearchTop" data-travel-search-top style="background:${Ae};">
      <div class="loc-top">
        <div class="loc-title">
          <div class="text-slider-wrapper">
            <div class="text-slide-item">Find Hotels.</div>
            <div class="text-slide-item">Find Motels.</div>
            <div class="text-slide-item">Best Offers.</div>
          </div>
          <div>For your Travel.</div>
        </div>

        <div class="loc-search-wrap">
          <div class="loc-input-row">
            <span class="loc-pin">${n("map-pin","w-5 h-5")}</span>
            <input
              id="travelDestinationInput"
              data-travel-destination-input="true"
              type="text"
              value="${a(e.query)}"
              placeholder="Shkruaj destinacionin tend"
              class="loc-input"
              inputmode="search"
              autocomplete="off"
              autocapitalize="words"
              spellcheck="false"
              aria-autocomplete="list"
              aria-controls="travelDestinationSuggestions"
              aria-expanded="false"
            />
            <div class="loc-request-wrap">
              <button type="button" data-travel-submit="true" class="loc-request-btn" aria-label="Search destination">
                ${n("search","w-5 h-5")}
              </button>
            </div>
          </div>
          <div id="travelDestinationSuggestions" data-travel-destination-suggestions role="listbox" aria-hidden="true" class="travel-destination-suggestions"></div>
          ${e.notice?`
            <p data-travel-notice class="loc-status">${a(e.notice)}</p>
          `:""}
        </div>
      </div>
    </div>
  `}function St({activeTab:e,hasDestination:t,hotelCount:a,deps:n}={}){const s=n.escapeHtml;return`
    <div class="bg-white/70 p-1.5 border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm" style="border-radius:2rem;">
      ${[{id:"offers",label:"Ofertat"},{id:"hotels",label:"Hotels"},{id:"map",label:"Harta"}].map(r=>{const o=e===r.id,c=!t&&r.id!=="offers",u=r.id==="hotels"&&t?` ${a}`:"";return`
          <button
            type="button"
            data-travel-tab="${s(r.id)}"
            class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${o?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":c?"text-slate-300":"text-slate-400 hover:text-slate-600"}"
          >
            ${s(`${r.label}${u}`)}
          </button>
        `}).join("")}
    </div>
  `}function At(e={},t={}){const a=t.escapeHtml,n=t.icon,s=(L,I)=>P(L,I,t),i=k(e),r=j(e),o=ge(e,t),c=o[0]||t.placeholderImage||"",u=T(e,t),d=A(e)||"0.0",f=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),p=Number.isFinite(f)&&f>0?f:0,h=Je(e),$=S(e),g=ve(e),m=ye(e),y=ee(e),z=we(e),b=We(e),w=l(e.offerBadgeLabel||e.travelOfferBadgeLabel||e.badgeLabel||""),O=l(e.offerDurationLabel||e.nightsDaysLabel||e.durationLabel||""),U=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
    <article
      data-travel-hotel-card="${a(r)}"
      data-travel-hotel-image-index="0"
      class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col"
      style="border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);"
    >
      <div data-travel-hotel-gallery class="h-44 relative overflow-hidden group select-none touch-pan-y" style="touch-action:pan-y;">
        <img
          data-travel-hotel-main-image
          src="${a(c)}"
          alt="${a(`${i} pamja 1`)}"
          loading="lazy"
          class="w-full h-full object-cover transition-all duration-500 bg-slate-100"
        />
        <div class="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/30 to-transparent pointer-events-none"></div>

        ${w||O?`
          <div class="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
            ${w?`<span class="px-3 py-1.5 rounded-full bg-white/95 text-[9px] font-black uppercase tracking-widest shadow-sm border border-white/70" style="color:${ie};">${a(w)}</span>`:""}
            ${O?`<span class="px-3 py-1.5 rounded-full bg-slate-900/85 text-white text-[9px] font-black uppercase tracking-widest shadow-sm border border-white/20">${a(O)}</span>`:""}
          </div>
        `:""}

        ${o.length>1?`
          <button
            type="button"
            data-travel-hotel-image-nav="prev"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="left:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Fotoja e meparshme"
          >
            ${n("chevron-left","w-4 h-4")}
          </button>

          <button
            type="button"
            data-travel-hotel-image-nav="next"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="right:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Fotoja tjeter"
          >
            ${n("chevron-right","w-4 h-4")}
          </button>

          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            ${o.map((L,I)=>`
              <button
                type="button"
                data-travel-hotel-dot="${I}"
                data-travel-hotel-image-src="${a(L)}"
                class="${I===0?"w-4 bg-white shadow-sm":"w-1.5 bg-white/50"} h-1.5 rounded-full transition-all duration-300"
                aria-label="Hotelbild ${I+1}"
              ></button>
            `).join("")}
          </div>
        `:`
          <span data-travel-hotel-dot="0" data-travel-hotel-image-src="${a(c)}" class="hidden"></span>
        `}

        <div class="absolute top-3.5 right-3.5 flex gap-2 z-10" style="position:absolute;top:0.875rem;right:0.875rem;z-index:30;display:flex;gap:0.5rem;">
          <button
            type="button"
            data-marketplace-open-map="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Shfaq ne harte"
            aria-label="Shfaq ne harte"
          >
            ${n("map","w-4 h-4")}
          </button>
          <button
            type="button"
            data-travel-hotel-like="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            aria-label="Shto te te preferuarat"
          >
            ${n("heart",`w-4 h-4 ${U?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
          </button>
          <button
            type="button"
            data-travel-hotel-share="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Ndaj"
            aria-label="Ndaj"
          >
            ${n("share-2","w-4 h-4")}
          </button>
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${_(u,`${i} Logo`,{...t,extraClass:"rounded-full"})}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-2" style="margin-bottom:0.5rem;">
            <div class="flex text-amber-500">
              ${n("star","w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${a(d)}</span>
            <span class="text-[11px] text-slate-400">(${a(String(p))} vlerësime)</span>
          </div>

          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${a(i)}</h2>
          <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-2" style="margin-top:0.5rem;">${a(h)}</p>
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${n("map-pin","w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${a($)}</span>
          </div>
          <div class="flex items-center gap-3">
            ${s("navigation","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(g||"Qendra mungon")}</span>
          </div>
          <div class="flex items-center gap-3">
            ${s("waves","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(m||"Plazhi mungon")}</span>
          </div>
        </div>

        ${y.length?`
          <div class="flex flex-wrap gap-1.5">
            ${y.map(L=>je(L,t)).join("")}
          </div>
        `:""}

        <hr class="border-slate-100" />

        <div class="flex items-center justify-between mt-0.5 gap-4">
          <div class="flex flex-col">
            <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Cmimi me i mire</span>
            <div class="flex items-baseline gap-1">
              ${z?`
                <span class="text-base font-black text-slate-900">ab ${a(z)} €</span>
                <span class="text-[9px] text-slate-500 font-bold">${a(b)}</span>
              `:`
                <span class="text-base font-black text-slate-900">Cmimi se shpejti</span>
              `}
            </div>
          </div>

          <button
            type="button"
            data-marketplace-open-business="${a(r)}"
            data-tab="profile"
            class="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150 active:scale-95 cursor-pointer max-w-[140px]"
            style="max-width:140px;"
          >
            <span>Me shume</span>
            ${n("chevron-right","w-3.5 h-3.5")}
          </button>
        </div>
      </div>
    </article>
  `}function Pt(e={},t={}){const a=t.escapeHtml,n=t.icon,s=(C,N)=>P(C,N,t),i=k(e),r=j(e),o=ge(e,t),c=o[0]||t.placeholderImage||"",u=T(e,t),d=A(e)||"0.0",f=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),p=Number.isFinite(f)&&f>0?f:0,h=tt(e),$=ve(e),g=ye(e),m=ee(e).slice(0,3),y=ke(e),z=at(e)||`${i} - ${h||e.address||""}`,b=we(e),w=Qe(e),O=Ze(e),U=et(e),L=U||O||"Ofertë",I=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
    <article
      data-travel-hotel-card="${a(r)}"
      data-travel-offer-card="${a(e.__travelOfferId||e.offerId||r)}"
      data-travel-hotel-image-index="0"
      aria-label="${a(i)}"
      class="w-full max-w-[340px] mx-auto bg-white rounded-[28px] overflow-hidden shadow-xl shadow-slate-200 border border-slate-100/60 relative flex flex-col"
      style="border-radius:28px;border-color:rgba(241,245,249,0.6);"
    >
      <div data-travel-offer-toast class="hidden absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-full text-[10px] font-semibold shadow-xl z-40 items-center gap-2 max-w-[92%] text-center"></div>

      <div data-travel-hotel-gallery class="h-44 relative overflow-hidden group select-none touch-pan-y" style="touch-action:pan-y;">
        <img
          data-travel-hotel-main-image
          src="${a(c)}"
          alt="${a(`${i} foto 1`)}"
          loading="lazy"
          class="w-full h-full object-cover transition-all duration-500 bg-slate-100"
        />
        <div class="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-black/25 to-transparent pointer-events-none"></div>

        ${o.length>1?`
          <button
            type="button"
            data-travel-hotel-image-nav="prev"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="left:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Fotoja e meparshme"
          >
            ${n("chevron-left","w-4 h-4")}
          </button>

          <button
            type="button"
            data-travel-hotel-image-nav="next"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="right:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Fotoja tjeter"
          >
            ${n("chevron-right","w-4 h-4")}
          </button>

          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            ${o.map((C,N)=>`
              <button
                type="button"
                data-travel-hotel-dot="${N}"
                data-travel-hotel-image-src="${a(C)}"
                class="${N===0?"w-[18px] bg-white shadow-sm":"w-1.5 bg-white/60"} h-1.5 rounded-full transition-all duration-300"
                aria-label="Hotelbild ${N+1}"
              ></button>
            `).join("")}
          </div>
        `:`
          <span data-travel-hotel-dot="0" data-travel-hotel-image-src="${a(c)}" class="hidden"></span>
        `}

        <div
          class="absolute top-3.5 left-3.5 bg-red-600 text-white shadow-md px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase z-10 border border-red-500"
          style="position:absolute;top:0.875rem;left:0.875rem;z-index:25;display:inline-flex;align-items:center;justify-content:center;background:#dc2626;color:#fff;border:1px solid #ef4444;border-radius:9999px;padding:0.25rem 0.75rem;font-size:10px;line-height:1rem;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;box-shadow:0 4px 6px -1px rgba(15,23,42,0.18),0 2px 4px -2px rgba(15,23,42,0.18);"
        >
          <span>${a(O)}</span>
        </div>

        <div class="absolute top-3 right-3 flex gap-1.5 z-10" style="position:absolute;top:0.75rem;right:0.75rem;z-index:30;display:flex;gap:0.375rem;">
          <button
            type="button"
            data-marketplace-open-map="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 shadow-sm cursor-pointer"
            title="Shfaq ne harte"
            aria-label="Shfaq ne harte"
          >
            ${n("map","w-3.5 h-3.5")}
          </button>
          <button
            type="button"
            data-travel-hotel-like="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 shadow-sm cursor-pointer"
            aria-label="Shto te te preferuarat"
          >
            ${n("heart",`w-4 h-4 ${I?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
          </button>
          <button
            type="button"
            data-travel-hotel-share="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 shadow-sm cursor-pointer"
            title="Ndaj"
            aria-label="Ndaj"
          >
            ${n("share-2","w-3.5 h-3.5")}
          </button>
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${_(u,`${i} Logo`,{...t,extraClass:"rounded-full"})}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-2" style="margin-bottom:0.5rem;">
            <div class="flex text-amber-500">
              ${n("star","w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${a(d)}</span>
            <span class="text-[11px] text-slate-400">(${a(String(p))} vlerësime)</span>
          </div>
          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${a(i)}</h2>
          <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-2 flex items-center gap-1.5" style="margin-top:0.5rem;color:#d97706;">
            ${n("map-pin","w-3 h-3 text-amber-600 shrink-0")}
            <span>${a(h)}</span>
          </p>
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-center gap-3">
            ${s("navigation","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600 font-semibold">${a($||"Qendra mungon")}</span>
          </div>
          <div class="flex items-center gap-3">
            ${s("waves","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600 font-semibold">${a(g||"Plazhi mungon")}</span>
          </div>
        </div>

        ${m.length?`
          <div class="flex flex-wrap gap-1.5 pt-0.5">
            ${m.map(C=>je(C,t,"text-[9px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100/80")).join("")}
          </div>
        `:""}

        <hr class="border-slate-100" />

        <div class="flex items-center justify-between mt-0.5 gap-4">
          <div class="flex flex-col min-w-0">
            <span class="text-[9px] uppercase tracking-wider text-rose-600 font-black">${a(L)}</span>
            <div class="flex items-baseline gap-0.5">
              ${b?`
                <span class="text-xl font-black text-slate-900 leading-none">${a(b)}€</span>
                <span class="text-[9px] text-slate-400 font-bold ml-1 uppercase">${a(w)}</span>
              `:`
                <span class="text-base font-black text-slate-900 leading-none">Cmimi se shpejti</span>
              `}
            </div>
          </div>

          <button
            type="button"
            data-travel-offer-details="true"
            class="flex-1 flex items-center justify-center gap-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150 active:scale-95 cursor-pointer max-w-[130px]"
            style="max-width:130px;"
          >
            <span>Me shume detaje</span>
            ${n("chevron-right","w-3.5 h-3.5")}
          </button>
        </div>
      </div>

      <div data-travel-offer-modal class="hidden absolute inset-0 bg-white/98 backdrop-blur-md z-30 flex-col p-4" aria-hidden="true">
        <div class="flex justify-between items-center mb-3.5">
          <div class="flex items-center gap-1.5">
            ${n("compass","w-4 h-4 text-slate-900")}
            <span class="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Detajet e Ofertës</span>
          </div>
          <button
            type="button"
            data-travel-offer-close="true"
            class="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Mbyll"
          >
            ${n("x","w-3.5 h-3.5")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 no-scrollbar">
          <div class="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div class="w-10 h-10 rounded-full border border-slate-100 shadow-sm overflow-hidden bg-white shrink-0">
              ${_(u,`${i} Logo`,{...t,extraClass:"rounded-full"})}
            </div>
            <div class="min-w-0">
              <h3 class="font-extrabold text-xs text-slate-900 truncate">${a(i)}</h3>
              <p class="text-[9px] text-amber-600 font-semibold uppercase truncate">${a(h)}</p>
            </div>
          </div>

          <div class="text-[11px] text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <p class="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider mb-1">Përshkrimi</p>
            ${a(z)}
          </div>

          ${y.length?`
            <div class="flex flex-col gap-2">
              <h4 class="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Çfarë përfshihet:</h4>
              <div class="flex flex-col gap-1.5 pl-1">
                ${y.map(C=>`
                  <div class="flex items-start gap-2 text-[10px] text-slate-700">
                    ${n("check-circle-2","w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5")}
                    <span>${a(C)}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          `:""}

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mt-1">
            <h4 class="text-[10px] font-extrabold uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-1">
              ${n("calendar","w-3.5 h-3.5 text-rose-500")}
              Rezervo Online
            </h4>

            <div data-travel-offer-booking-success class="hidden bg-emerald-50 text-emerald-800 text-center p-3 rounded-lg border border-emerald-200 text-[10px] font-semibold">
              Sukses! Kërkesa juaj u dërgua. Ju faleminderit!
            </div>

            <form data-travel-offer-booking-form class="flex flex-col gap-2">
              <input
                type="text"
                data-travel-offer-booking-name
                placeholder="Emri dhe Mbiemri"
                class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-slate-900 transition-colors"
              />
              <input
                type="tel"
                data-travel-offer-booking-phone
                placeholder="Numri i telefonit"
                class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-slate-900 transition-colors"
              />
              <button
                type="submit"
                class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                ${n("send","w-3 h-3")}
                Dërgo Kërkesën
              </button>
            </form>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-2 gap-3">
          <div class="flex flex-col min-w-0">
            <span class="text-[8px] uppercase tracking-wider text-slate-400 font-bold">${w==="Totali"?"Total":"Total për person"}</span>
            <span class="text-sm font-black text-slate-900 truncate">${b?`${a(b)} €`:"Cmimi se shpejti"}${U?` (${a(U)})`:""}</span>
          </div>
          <button
            type="button"
            data-travel-offer-close="true"
            class="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-3 py-1.5 rounded-lg transition-all shrink-0"
          >
            Mbyll (Schließen)
          </button>
        </div>
      </div>
    </article>
  `}function Ut(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],a=new Set;return t.filter(n=>n&&typeof n=="object"&&n.active!==!1).filter((n,s)=>{const i=l(n.id||n.offerId||n._id||`idx_${s}`);return a.has(i)?!1:(a.add(i),!0)})}function Nt(e={}){return[...v(e.features),...v(e.offerFeatures),...v(e.hotelFeatures),l(e.hotelFeatureOneText),l(e.hotelFeatureTwoText),l(e.hotelFeatureThreeText)].filter(Boolean).filter((t,a,n)=>n.indexOf(t)===a)}function Bt(e={},t={},a=0){const n=Nt(t),s=ke(t),i=l(t.imageUrl||t.offerImageUrl||t.titleImageUrl||t.coverImageUrl||""),r=l(t.id||t.offerId||t._id||`offer_${a}`);return{...e,__travelOffer:!0,__travelOfferId:r,offerId:r,offerTitle:l(t.title||t.name||""),offerText:l(t.text||t.description||""),offerDescription:l(t.offerDescription||t.description||t.text||""),offerDestination:l(t.offerDestination||t.destination||t.travelDestination||"")||e.offerDestination||e.destination,offerDetails:s,includedServices:s,offerBadgeLabel:l(t.offerBadgeLabel||t.travelOfferBadgeLabel||t.badgeLabel||"OFERTA"),offerDurationLabel:l(t.offerDurationLabel||t.nightsDaysLabel||t.durationLabel||""),offerImageUrl:i,titleImageUrl:i||e.titleImageUrl,coverImageUrl:i||e.coverImageUrl,offerCoverImages:i?[i]:v(t.coverImages||t.hotelCoverImages),distanceCenter:l(t.distanceCenter||t.distanceToCenter||t.centerDistance||"")||e.distanceCenter,distanceToCenter:l(t.distanceToCenter||t.distanceCenter||t.centerDistance||"")||e.distanceToCenter,centerDistance:l(t.centerDistance||t.distanceCenter||t.distanceToCenter||"")||e.centerDistance,distanceBeach:l(t.distanceBeach||t.distanceToBeach||t.beachDistance||"")||e.distanceBeach,distanceToBeach:l(t.distanceToBeach||t.distanceBeach||t.beachDistance||"")||e.distanceToBeach,beachDistance:l(t.beachDistance||t.distanceBeach||t.distanceToBeach||"")||e.beachDistance,hotelStartingPrice:l(t.hotelStartingPrice||t.startingPrice||t.priceFrom||t.fromPrice||t.bestPrice||"")||e.hotelStartingPrice,startingPrice:l(t.startingPrice||t.hotelStartingPrice||t.priceFrom||t.fromPrice||t.bestPrice||"")||e.startingPrice,priceFrom:l(t.priceFrom||t.startingPrice||t.hotelStartingPrice||"")||e.priceFrom,priceUnit:Z(t.priceUnit||t.hotelPriceUnit||t.offerPriceUnit||e.priceUnit||""),features:n.length?n:e.features}}function Ie(e=[]){return(Array.isArray(e)?e:[]).flatMap(t=>Ut(t).map((a,n)=>Bt(t,a,n)))}function Rt(e=[],t={}){const a=Ie(e).slice(0,12);return a.length?`
    <div class="space-y-4">
      ${a.map(n=>Pt(n,t)).join("")}
    </div>
  `:D({emptyTitle:"Ende nuk ka oferta",emptyBody:"Nuk u gjeten oferta hoteli te pershtatshme.",icon:"plane"},t)}function Ce(e=[],t={}){return e.length?`
    <div class="space-y-4">
      ${e.map(a=>At(a,t)).join("")}
    </div>
  `:D({emptyTitle:"Nuk u gjeten hotele",emptyBody:"Nuk u gjeten hotele te pershtatshme per kete destinacion.",icon:"plane"},t)}function Et(e={},t=0,a={}){const n=a.escapeHtml,s=F(e),i=k(e),r=j(e),o=S(e),c=18+t*23%58,u=22+t*17%46;return`
    <button
      type="button"
      data-marketplace-open-business="${n(r)}"
      class="absolute w-12 h-12 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center active:scale-95 transition-all"
      style="left:${c}%; top:${u}%; transform:translate(-50%,-50%); color:${ie};"
      title="${n(`${i} - ${o}`)}"
    >
      ${a.icon("plane","w-5 h-5")}
      ${s?`<span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${n(`${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`)}</span>`:""}
    </button>
  `}function Ht(e=[],t={}){if(typeof t.renderMapView=="function")return t.renderMapView();const a=e.filter(n=>F(n)).slice(0,8);return e.length?`
    <div class="space-y-4">
      <div class="relative overflow-hidden border border-slate-200 bg-slate-200 shadow-sm" style="height:24rem; border-radius:2.5rem;">
        <div class="absolute inset-0" style="background:linear-gradient(135deg,#e0f7fb 0%,#dbeafe 45%,#e2e8f0 100%);"></div>
        <div class="absolute inset-0 opacity-60" style="background-image:linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px); background-size:42px 42px;"></div>
        ${a.map((n,s)=>Et(n,s,t)).join("")}
        <div class="absolute left-4 right-4 bottom-4">
          <div class="bg-white/95 backdrop-blur-xl border border-white/50 shadow-lg p-4" style="border-radius:1.75rem;">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Hotels</p>
            <p class="mt-1 text-sm font-black text-slate-900">${t.escapeHtml(String(e.length))} ${e.length===1?"Hotel":"Hotels"}</p>
          </div>
        </div>
      </div>
      ${a.length?"":`
        <div class="bg-white border border-slate-100 shadow-sm p-5 text-[11px] font-bold text-slate-400" style="border-radius:2rem;">
          Nuk u gjeten koordinata hoteli per kete destinacion.
        </div>
      `}
    </div>
  `:Ce(e,t)}function Ft({state:e,dataLoaded:t,section:a,deps:n}={}){const s=M(e,a.key,n).map(m=>Y({...m,__marketplaceType:H(m,n)},a)),i=Ct(e),r=!!i.query,o=r?s.filter(m=>Ke(m,i.query)):s.slice(0,R),c=o.slice(0,R),u=r?i.activeTab:"offers",d=t?.restaurants===!0,f=e?.__restaurantsLoading===!0||e?.__restaurantsMetaHydrating===!0,p=u!=="map"&&u!=="hotels",h=p&&Ie(c).length>0,$=p&&f&&!h,g=u==="map"?Ht(c,n):u==="hotels"?Ce(c,n):Rt(c,n);return`
    <section id="travelView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${_t({travel:i,deps:n})}
      <div id="travelBenko" data-travel-benko style="position:relative; z-index:3; margin-top:-2.5rem; border-top-left-radius:2.5rem; border-top-right-radius:2.5rem; background:#f8fafc; padding:2rem 1.5rem 6.5rem; box-shadow:0 -18px 34px -18px rgb(15 23 42 / 0.2);">
        ${St({activeTab:u,hasDestination:r,hotelCount:o.length,deps:n})}
        <div class="mt-5">
          ${$?E(a,n):d||s.length?g:E(a,n)}
        </div>
      </div>
    </section>
  `}function Dt({state:e={},dataLoaded:t=null,sectionKey:a="restaurants",escapeHtmlFn:n,iconFn:s,getOptimizedImageUrlFn:i,isPlaceholderUrlFn:r,placeholderImage:o="",normalizeRestaurantTypeFn:c,normalizeLeadTypeKeyFn:u,resolveRestaurantLogoFn:d,renderMapViewFn:f}={}){const p=B[ce(a)]||B.restaurants,h=ae(n,(b="")=>String(b||"")),$=ae(s,()=>""),g={escapeHtml:h,icon:$,getOptimizedImageUrl:i,isPlaceholderUrl:r,placeholderImage:o,resolveRestaurantLogo:d,renderMapView:f,normalizeRestaurantType:c,normalizeLeadTypeKey:u},m=t?.restaurants===!0;if(p.key==="travel")return Ft({state:e,dataLoaded:t,section:p,deps:g});if(p.key==="restaurants")return It({state:e,dataLoaded:t,section:p,deps:g});if(p.key==="shopping")return zt({state:e,dataLoaded:t,section:p,deps:g});const y=M(e,p.key,g).slice(0,R).map(b=>Y({...b,__marketplaceType:H(b,g)},p)),z=y.slice(0,se);return`
    <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      ${y.length?`
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
            ${z.map(b=>lt(b,g)).join("")}
          </div>
        </div>

        <div class="space-y-4">
          ${y.map(b=>dt(b,g)).join("")}
        </div>
      `:m?D(p,g):E(p,g)}
    </section>
  `}export{Mt as collectVoucherScopeBusinessesCore,M as filterMarketplaceBusinessesCore,Dt as renderMarketplaceViewCore,Me as resolveMarketplaceSectionForBusinessCore};
