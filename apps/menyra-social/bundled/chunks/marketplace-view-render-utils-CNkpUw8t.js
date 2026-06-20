const F=Object.freeze({restaurants:Object.freeze({key:"restaurants",title:"Restaurants",emptyTitle:"Noch keine Restaurants",emptyBody:"Keine passenden Profile gefunden.",icon:"utensils",typeKeys:Object.freeze(["restaurant","cafe","coffee","fastfood","food"])}),travel:Object.freeze({key:"travel",title:"Travel",emptyTitle:"Noch keine Travel-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"plane",typeKeys:Object.freeze(["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"])}),shopping:Object.freeze({key:"shopping",title:"Shopping",emptyTitle:"Noch keine Shopping-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"shopping-bag",typeKeys:Object.freeze(["ecommerce"])})}),ee=new Map;Object.values(F).forEach(e=>{e.typeKeys.forEach(t=>{ee.set(t,e.key)})});const te=8,D=24,ke="#ff4f3f",$e="mnyra_social_feed_viewer_location_v1",ae="#00cce5",je="#005f73",se=35,Te=Object.freeze([Object.freeze({label:"Prishtina",lat:42.6629,lng:21.1655}),Object.freeze({label:"Prizren",lat:42.2139,lng:20.7397}),Object.freeze({label:"Peja",lat:42.6591,lng:20.2883}),Object.freeze({label:"Gjakova",lat:42.3803,lng:20.4308}),Object.freeze({label:"Ferizaj",lat:42.3706,lng:21.1553}),Object.freeze({label:"Gjilan",lat:42.4635,lng:21.4699}),Object.freeze({label:"Mitrovica",lat:42.8914,lng:20.866}),Object.freeze({label:"Vushtrria",lat:42.8231,lng:20.9675}),Object.freeze({label:"Podujeva",lat:42.9106,lng:21.193}),Object.freeze({label:"Tirana",lat:41.3275,lng:19.8187}),Object.freeze({label:"Kukes",lat:42.0769,lng:20.4219}),Object.freeze({label:"Smederevo",lat:44.6644,lng:20.9276})]),ze=Object.freeze([Object.freeze(["tirana","tirane"]),Object.freeze(["durres","durresi"]),Object.freeze(["vlora","vlore"]),Object.freeze(["shkoder","shkodra"]),Object.freeze(["shengjin","shëngjin","shen gjin","shengjini"]),Object.freeze(["ksamil","ksamili"]),Object.freeze(["dhermi","dhërmi","dhermiu"]),Object.freeze(["velipoje","velipojë","velipoja"]),Object.freeze(["theth","thethi"]),Object.freeze(["valbone","valbonë","valbona"]),Object.freeze(["elbasan","elbasani"]),Object.freeze(["fier","fieri"]),Object.freeze(["korce","korca"]),Object.freeze(["sarande","saranda"]),Object.freeze(["berat","berati"]),Object.freeze(["gjirokaster","gjirokastra"]),Object.freeze(["kukes","kukesi"]),Object.freeze(["lezhe","lezha"]),Object.freeze(["pogradec","pogradeci"]),Object.freeze(["kruje","kruja"]),Object.freeze(["fushe kruje","fushë krujë","fushe-kruje","fush kruje"]),Object.freeze(["lushnje","lushnja"]),Object.freeze(["himare","himarë","himara"]),Object.freeze(["kavaje","kavajë","kavaja"]),Object.freeze(["kamze","kamëz","kamza"]),Object.freeze(["vore","vorë","vora"]),Object.freeze(["divjake","divjakë","divjaka"]),Object.freeze(["permet","përmet","permeti"]),Object.freeze(["tepelene","tepelenë","tepelena"]),Object.freeze(["delvine","delvinë","delvina"]),Object.freeze(["peshkopi","peshkopia","diber","dibër"]),Object.freeze(["burrel","burreli","mat"]),Object.freeze(["puke","pukë","puka"]),Object.freeze(["bajram curri","bajramcurri","tropoje","tropojë"]),Object.freeze(["krume","krumë","has"]),Object.freeze(["lac","laç","kurbin"]),Object.freeze(["orikum","orikumi"]),Object.freeze(["golem","golemi"]),Object.freeze(["jale","jalë","jali"]),Object.freeze(["qepare","qeparo","qeparoi"]),Object.freeze(["borsh","borshi"]),Object.freeze(["lukove","lukovë","lukova"]),Object.freeze(["palase","palasë","palasa"]),Object.freeze(["drimadhe","drymades","drimadhes"]),Object.freeze(["spille","spilleja"]),Object.freeze(["gjiri i lalzit","lalzi","lalez","lalëz"])]),Oe=Object.freeze([Object.freeze(["prishtina","prishtine","prishtin","pristina"]),Object.freeze(["ferizaj","ferizaji","uroshevac"]),Object.freeze(["peja","peje","pec"]),Object.freeze(["prizren","prizreni"]),Object.freeze(["gjakova","gjakove","djakova"]),Object.freeze(["gjilan","gjilani"]),Object.freeze(["mitrovica","mitrovice"]),Object.freeze(["vushtrria","vushtrri"]),Object.freeze(["podujeva","podujeve","podujevo","besiana"]),Object.freeze(["fushe kosove","fushe kosova","fush kosove","fush kosova"]),Object.freeze(["lipjan"]),Object.freeze(["suhareka","suhareke","theranda"]),Object.freeze(["rahovec","rahoveci"]),Object.freeze(["drenas","gllogoc"]),Object.freeze(["skenderaj","skenderaji"]),Object.freeze(["malisheva","malisheve"]),Object.freeze(["kamenica","kamenice","kamenica kosove"]),Object.freeze(["decan","decani"]),Object.freeze(["istog","istogu"]),Object.freeze(["klina","kline"]),Object.freeze(["vite","vitia"]),Object.freeze(["hani i elezit","hani elezit"])]),ne=Object.freeze(["city","locationCity","primaryCity","postalCity","address","primaryAddress","formattedAddress","fullAddress","addressText","streetAddress","street","locationLabel","displayLocation","locality","town","municipality","village","neighborhood","area","district","county","region","state","province","country","countryCode"]),Q=Object.freeze([...ne,"label","name","title"]),Le=Object.freeze(["location","primaryLocation","businessLocation","venueLocation","addressInfo","place","geo","coords","coordinates","geoPoint"]);function W(e,t=()=>""){return typeof e=="function"?e:t}function r(e=""){return String(e||"").trim()}function x(e=""){const t=r(e).toLowerCase();return t?t.replace(/[ëèéê]/g,"e").replace(/[çćč]/g,"c").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):""}function ie(e=""){const t=x(e);if(!t)return[];const a=new Set([t]);return ze.forEach(s=>{const n=s.map(x).filter(Boolean);n.includes(t)&&n.forEach(i=>a.add(i))}),Array.from(a)}function _e(e=""){const t=x(e);if(!t)return[];const a=new Set(ie(e));return Oe.forEach(s=>{const n=s.map(x).filter(Boolean);n.includes(t)&&n.forEach(i=>a.add(i))}),Array.from(a)}function le(e=""){const t=x(e);return t==="restaurant"?"restaurants":["hotel","hotels","motel","motels"].includes(t)?"travel":["shop","ecommerce","e_commerce","shopping"].includes(t)?"shopping":F[t]?t:"restaurants"}function re(e=""){const t=x(e);return t?t==="e_commerce"||t==="online_shop"||t==="onlineshop"||t==="shop"||t==="store"?"ecommerce":t==="coffee"||t==="coffe"||t==="coffee_shop"||t==="coffeeshop"||t==="kaffee"||t==="caffe"?"cafe":t==="fast_food"||t==="snack"||t==="imbiss"?"fastfood":t==="hotels"?"hotel":t==="motels"?"motel":t:""}function Ce(e={}){return[e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType]}function H(e={},{normalizeRestaurantType:t,normalizeLeadTypeKey:a}={}){const s=typeof t=="function"?t:(o=>o),n=typeof a=="function"?a:(o=>o),i=Ce(e);for(const o of i){const c=re(s(o)||n(o)||o);if(c)return c}const l=[e.name,e.restaurantName,e.businessName,e.description,e.bio].map(o=>r(o).toLowerCase()).join(" ");return/\bhotel(s)?\b/.test(l)?"hotel":/\bmotel(s)?\b/.test(l)?"motel":/\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b/.test(l)?"cafe":/\bfast\s*food\b|\bfastfood\b/.test(l)?"fastfood":/\be-?commerce\b|\bonline\s*shop\b/.test(l)?"ecommerce":/\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b/.test(l)?"restaurant":""}function Ie(e={},t={}){const a=H(e,t);return ee.get(a)||""}function z(e={}){return r(e.canonicalRestaurantId||e.restaurantId||e.id||e.landingRestaurantId||"")}function T(e={}){return r(e.name||e.restaurantName||e.businessName||e.displayName||"Business")}function I(e={}){const t=r(e.city||e.locationCity||e.primaryCity),a=r(e.address||e.location||e.primaryAddress);return t&&a&&t!==a?`${t} - ${a}`:t||a||E(e)||r(e.country||e.region||"")||"Standort folgt"}function Y(e={}){const t=Number(String(e?.lat??e?.latitude??"").replace(",",".")),a=Number(String(e?.lng??e?.lon??e?.longitude??"").replace(",","."));return!Number.isFinite(t)||!Number.isFinite(a)||Math.abs(t)>90||Math.abs(a)>180||Math.abs(t)<1e-6&&Math.abs(a)<1e-6?null:{lat:t,lng:a}}function oe(e={},t={}){const a=Number(e.lat),s=Number(e.lng),n=Number(t.lat),i=Number(t.lng);if(![a,s,n,i].every(Number.isFinite))return Number.POSITIVE_INFINITY;const l=h=>h*Math.PI/180,o=6371,c=l(n-a),p=l(i-s),d=Math.sin(c/2),f=Math.sin(p/2),u=d*d+Math.cos(l(a))*Math.cos(l(n))*f*f;return 2*o*Math.atan2(Math.sqrt(u),Math.sqrt(Math.max(0,1-u)))}function E(e={}){const t=B(e);if(!t)return"";const a=Te.map(s=>({label:s.label,distanceKm:oe(t,s)})).filter(s=>Number.isFinite(s.distanceKm)).sort((s,n)=>s.distanceKm-n.distanceKm)[0];return a&&a.distanceKm<=se?a.label:"Auf Karte markiert"}function Se(e={}){const t=[e.id,e.restaurantId,e.canonicalRestaurantId,e.publicSlug,e.landingSlug,e.handle,e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType,e.city,e.locationCity,e.primaryCity,e.address,e.location,e.primaryAddress,E(e),e.country,e.region,e.district,e.name,e.restaurantName,e.businessName,e.displayName,e.description,e.bio,e.about];return Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||t.push(a.city,a.address,a.country,a.region,a.name)}),t}function Ae(e={},t=""){const a=ie(t);if(!a.length)return!0;const s=Se(e).map(x).filter(Boolean).join("_");return a.some(n=>{const i=n.split("_").filter(Boolean);return s.includes(n)?!0:i.length>0&&i.every(l=>s.includes(l))})}function N(e=[],t=""){if(typeof t=="string"||typeof t=="number"){const a=r(t);a&&e.push(a)}}function V(e=[],t={},a=ne){!t||typeof t!="object"||a.forEach(s=>N(e,t[s]))}function Be(e={}){const t=[];return V(t,e),N(t,e.location),N(t,E(e)),Le.forEach(a=>{V(t,e[a],Q)}),Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||(V(t,a,Q),N(t,E(a)))}),t}function Pe(e={},t=""){const a=_e(t);if(!a.length)return!1;const s=Be(e).map(x).filter(Boolean).join("_");return s?a.some(n=>{const i=n.split("_").filter(Boolean);return s.includes(n)||i.length>0&&i.every(l=>s.includes(l))}):!1}function Re(e={},t=null){if(!t)return!0;const a=r(t.city||t.label||"");if(a&&Pe(e,a))return!0;const s=Y(t),n=B(e);return s&&n?oe(s,n)<=se:!a&&!s}function B(e={}){const t=[{lat:e.lat,lng:e.lng},{lat:e.latitude,lng:e.longitude},{lat:e.latitude,lng:e.lon},{lat:e._lat,lng:e._long},{lat:e._latitude,lng:e._longitude},{lat:e.gpsLat,lng:e.gpsLng},{lat:e.mapLat,lng:e.mapLng},{lat:e.geo?.lat,lng:e.geo?.lng},{lat:e.geo?.latitude,lng:e.geo?.longitude},{lat:e.geo?.latitude,lng:e.geo?.lon},{lat:e.coords?.lat,lng:e.coords?.lng},{lat:e.coords?.latitude,lng:e.coords?.longitude},{lat:e.coordinates?.lat,lng:e.coordinates?.lng},{lat:e.coordinates?.latitude,lng:e.coordinates?.longitude},{lat:e.coordinates?._lat,lng:e.coordinates?._long},{lat:e.coordinates?._latitude,lng:e.coordinates?._longitude},{lat:e.geoPoint?.lat,lng:e.geoPoint?.lng},{lat:e.geoPoint?.latitude,lng:e.geoPoint?.longitude},{lat:e.geoPoint?._lat,lng:e.geoPoint?._long},{lat:e.geoPoint?._latitude,lng:e.geoPoint?._longitude},{lat:e.geopoint?.lat,lng:e.geopoint?.lng},{lat:e.geopoint?.latitude,lng:e.geopoint?.longitude},{lat:e.geopoint?._lat,lng:e.geopoint?._long},{lat:e.geopoint?._latitude,lng:e.geopoint?._longitude},{lat:e.location?.lat,lng:e.location?.lng},{lat:e.location?.latitude,lng:e.location?.longitude},{lat:e.primaryLocation?.lat,lng:e.primaryLocation?.lng},{lat:e.primaryLocation?.latitude,lng:e.primaryLocation?.longitude},{lat:e.businessLocation?.lat,lng:e.businessLocation?.lng},{lat:e.businessLocation?.latitude,lng:e.businessLocation?.longitude}];for(const a of t){const s=Y(a);if(s)return s}if(Array.isArray(e.locations))for(const a of e.locations){const s=B(a||{});if(s)return s}return null}function ce(e={}){const t=e.openingHours||e.openHours||e.hours||e.businessHours||e.workingHours||"";if(typeof t=="string"&&r(t))return r(t);if(t&&typeof t=="object"){const a=Object.values(t).map(r).filter(Boolean);if(a.length)return a[0]}return"Oeffnungszeiten folgen"}function Ne(e={}){return r(e.phone||e.telephone||e.contactPhone||e.ownerPhone||"")}function Fe(e={}){return r(e.description||e.bio||e.about||e.shortDescription||"")}function P(e={}){const t=Number(e.rating??e.avgRating??e.score??e.publicRating??0);return!Number.isFinite(t)||t<=0?"":Math.min(5,Math.max(1,t)).toFixed(1)}function R(e={},{getOptimizedImageUrl:t,resolveRestaurantLogo:a,placeholderImage:s=""}={}){const n=z(e),i=r(e.logoUrl||e.logo||e.logoURL||e.heroUrl||e.coverUrl||e.imageUrl||e.img||""),o=(n&&typeof a=="function"?r(a(n,i,"medium")):i)||i||s;return(typeof t=="function"?r(t(o,"medium")):o)||s||""}function ue(e={},{getOptimizedImageUrl:t,placeholderImage:a=""}={}){const n=r(e.titleImageUrl||e.coverImageUrl||e.coverImage||e.coverUrl||e.heroImageUrl||e.heroUrl||e.imageUrl||e.bestSpotLogoUrl||e.spotLogoUrl||e.logoUrl||e.logo||"")||a;return(typeof t=="function"?r(t(n,"large")):n)||a||""}function m(e){if(Array.isArray(e))return e.map(r).filter(Boolean);const t=r(e);return t?t.split(/[\n,;|]/).map(r).filter(Boolean):[]}function pe(e={},t={}){const a=[...m(e.offerCoverImages),...m(e.coverImages),...m(e.hotelCoverImages),...m(e.titleImages),e.offerImageUrl,e.titleImageUrl,e.coverImageUrl,e.coverImage,e.coverUrl,e.heroImageUrl,e.heroUrl,e.imageUrl].map(r).filter(Boolean),s=[];a.forEach(l=>{s.includes(l)||s.push(l)});const n=ue(e,t);n&&!s.includes(n)&&s.push(n);const i=s.map(l=>typeof t.getOptimizedImageUrl=="function"?r(t.getOptimizedImageUrl(l,"large")):l).filter(Boolean);return i.length?i.slice(0,5):[t.placeholderImage||""].filter(Boolean)}function De(e={}){return r(e.cuisine||e.kitchen||e.foodType||e.categoryLabel||e.__marketplaceTypeLabel||e.type||e.customerType||"")}function Ee(e={}){return r(e.priceRange||e.priceLevel||e.priceLabel||e.budget||"")}function q(e,t=""){return typeof e=="string"?r(e):e===!0?r(t):""}function fe(e={}){const t=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{},a=[q(e.gardenTerraceText||e.gardenTerrace||e.gardenOrTerrace||t.gardenTerrace,"Gastgarten"),q(e.accessibilityText||e.barrierFreeText||e.accessibleText||e.barrierefrei||e.accessible||t.accessibility,"Barrierefrei"),q(e.veganOptionsText||e.veganOptions||e.veganText||e.vegan||t.veganOptions,"Vegane Optionen")].filter(Boolean);if(a.length)return a.slice(0,3);const s=Array.isArray(e.features)?e.features.map(r).filter(Boolean):[];if(s.length)return s.slice(0,3);const n=r(e.features||e.amenities||"");return n?n.split(/[,;|]/).map(r).filter(Boolean).slice(0,3):[]}function Ue(e={}){return r(e.hotelCategory||e.categoryLabel||e.__marketplaceTypeLabel||e.travelCategory||e.typeLabel||e.type||e.customerType||"Hotel")}function de(e="",{suffix:t="",directLabel:a=""}={}){const s=r(e);if(!s)return"";const n=x(s);if(n==="direkt_im_zentrum"||n==="direkt_am_zentrum"||n==="direkt_am_strand"||n==="ne_qender"||n==="ne_plazh"||n==="direkt_ne_qender"||n==="direkt_ne_plazh")return a||s;const i=x(t);if(i&&n.includes(i))return s;const l=s.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)\b/i);return!l||!t?s:`${l[1].replace(",",".")} ${l[2].toLowerCase().startsWith("k")?"km":"m"} ${t}`}function be(e={}){return de(e.distanceCenter||e.distanceToCenter||e.centerDistance||e.cityCenterDistance||e.centerDistanceLabel||e.zentrumEntfernung||e.distanceCentre||"",{suffix:"nga qendra",directLabel:"Në qendër"})}function ge(e={}){return de(e.distanceBeach||e.distanceToBeach||e.beachDistance||e.beachDistanceLabel||e.strandEntfernung||e.lakeDistance||e.distanceToLake||"",{suffix:"nga plazhi",directLabel:"Në plazh"})}function me(e={}){return r(e.hotelStartingPrice||e.startingPrice||e.priceFrom||e.fromPrice||e.bestPrice||e.roomStartingPrice||"").replace(/^\s*ab\s+/i,"").replace(/\s*(eur|€)\s*$/i,"").trim()}function G(e=""){const t=x(e);return t==="total"||t==="totali"||t==="gesamt"?"total":"per_person"}function He(e={}){return G(e.priceUnit||e.hotelPriceUnit||e.offerPriceUnit||"")==="total"?"Totali":"p.P"}function Me(e={}){return G(e.priceUnit||e.hotelPriceUnit||e.offerPriceUnit||"")==="total"?"Totali":"Për person"}function Ke(e={}){const t=r(e.offerBadgeLabel||e.travelOfferBadgeLabel||e.badgeLabel||"Ofertë"),a=x(t);return!t||a==="oferta"||a==="oferte"?"Ofertë":t}function Ve(e={}){return r(e.offerDurationLabel||e.nightsDaysLabel||e.durationLabel||"")}function qe(e={}){return r(e.offerDestination||e.destination||e.travelDestination||e.city||e.locationCity||e.primaryCity||I(e))}function Ye(e={}){return r(e.offerText||e.offerDescription||e.text||e.description||e.bio||e.about||"")}function he(e={}){const t=[e.offerDetails,e.offerDetailItems,e.includedServices,e.inclusions,e.packageIncludes,e.includes],a=[];return t.forEach(s=>{if(Array.isArray(s)){s.map(r).filter(Boolean).forEach(n=>{a.includes(n)||a.push(n)});return}typeof s=="string"&&m(s).forEach(n=>{a.includes(n)||a.push(n)})}),a.length?a.slice(0,8):X(e).slice(0,6)}function X(e={}){if(e.__travelOffer===!0){const l=[...m(e.offerFeatures),...m(e.features),...m(e.hotelFeatures)];if(l.length)return l.slice(0,6)}const t=[e.hotelFeatureOneText,e.hotelFeatureTwoText,e.hotelFeatureThreeText].map(r).filter(Boolean),a=[...m(e.features),...m(e.hotelFeatures)].filter(Boolean),s=[];if([...t,...a].forEach(l=>{l&&!s.includes(l)&&s.push(l)}),s.length)return s.slice(0,6);const n=fe(e);return n.length?n.slice(0,3):m(e.hotelAmenities||e.amenities||e.facilities).slice(0,3)}function Ge(e=""){const t=x(e);return/(mengjes|gjysme|pension|inclusive|restorant|ushqim|fruehstueck|breakfast|food)/.test(t)?"utensils":/(shezlong|plazh|strand|beach|lounger)/.test(t)?"waves":/(parking|parkplatz|garage|garazh)/.test(t)?"parking":"check"}function ve(e="",t={},a=""){const s=t.escapeHtml,n=r(e);if(!n)return"";const i=a||"text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100",l=Ge(n);return`
    <span class="${i} inline-flex items-center gap-1.5">
      ${M(l,"w-3 h-3 shrink-0",t)}
      <span>${s(n)}</span>
    </span>
  `}function M(e="",t="",a={}){const s=a.icon,n=a.escapeHtml,i=r(t),o=`xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${i?` class="${n(i)}"`:""} aria-hidden="true" focusable="false"`;return e==="share-2"?`<svg ${o}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.59 13.51 6.83 3.98"></path><path d="m15.41 6.51-6.82 3.98"></path></svg>`:e==="phone"?`<svg ${o}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`:e==="book-open"?`<svg ${o}><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>`:e==="navigation"?`<svg ${o}><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`:e==="waves"?`<svg ${o}><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>`:e==="utensils"?`<svg ${o}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>`:e==="parking"||e==="square-parking"?`<svg ${o}><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 17V7h5a3 3 0 0 1 0 6H9"></path></svg>`:e==="check"?`<svg ${o}><path d="M20 6 9 17l-5-5"></path></svg>`:typeof s=="function"?s(e,t):""}function Xe(e={}){const t=Number(e.rating??e.avgRating??e.publicRating??0),a=Number(e.score??e.publicScore??0),s=Number(e.followersCount??e.followerCount??0),n=Number(e.postsCount??e.postCount??0),i=Number(e.updatedAt?.seconds||e.createdAt?.seconds||0);return(Number.isFinite(t)?t*1e3:0)+(Number.isFinite(a)?a:0)+(Number.isFinite(s)?Math.min(s,500):0)+(Number.isFinite(n)?Math.min(n,200):0)+(Number.isFinite(i)?Math.min(i/1e5,100):0)}function Ze(e={},t={}){const a=new Map,s=(n={})=>{if(!n||typeof n!="object")return;const i=z(n);if(!i)return;const l=a.get(i)||{};a.set(i,{...l,...n,id:i})};return(Array.isArray(e.bootstrapRestaurantPreview)?e.bootstrapRestaurantPreview:[]).forEach(s),(Array.isArray(e.restaurants)?e.restaurants:[]).forEach(s),Array.from(a.values()).map(n=>({...n,__marketplaceSection:Ie(n,t),__marketplaceScore:Xe(n)})).filter(n=>n.__marketplaceSection).sort((n,i)=>i.__marketplaceScore-n.__marketplaceScore||T(n).localeCompare(T(i)))}function Z(e={},t="",a={}){const s=le(t);return Ze(e,a).filter(n=>n.__marketplaceSection===s)}function C(e="",t="",{escapeHtml:a,isPlaceholderUrl:s,extraClass:n=""}={}){const i=r(e),l=!i||typeof s=="function"&&s(i);return`
    <img
      src="${a(i)}"
      alt="${a(t)}"
      loading="lazy"
      class="w-full h-full object-cover bg-slate-100 ${n}"
      ${l?'data-placeholder-image="true"':""}
    />
  `}function xe(e={},t={}){const a=t.escapeHtml,s=t.icon,n=T(e),i=z(e),l=R(e,t),o=P(e),c=I(e);return`
    <button type="button" data-marketplace-open-business="${a(i)}" class="shrink-0 w-44 text-left rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <div class="h-28 bg-slate-100 overflow-hidden">
        ${C(l,n,t)}
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
  `}function Je(e={},t={}){const a=t.escapeHtml,s=t.icon,n=T(e),i=z(e),l=R(e,t),o=P(e),c=I(e),p=ce(e),d=Fe(e),f=r(e.__marketplaceTypeLabel||e.type||e.customerType||"");return`
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <button type="button" data-marketplace-open-business="${a(i)}" class="w-full text-left active:scale-[0.99] transition-transform">
        <div class="h-48 bg-slate-100 overflow-hidden">
          ${C(l,n,t)}
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              ${f?`<p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">${a(f)}</p>`:""}
              <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight">${a(n)}</h3>
            </div>
            ${o?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${s("star","w-3 h-3 fill-current")} ${a(o)}</span>`:""}
          </div>
          ${d?`<p class="mt-3 text-xs font-semibold text-slate-500 leading-5 line-clamp-2">${a(d)}</p>`:""}
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
  `}function Qe(e={},t={}){const a=t.escapeHtml,s=t.icon,n=(w,j)=>M(w,j,t),i=T(e),l=z(e),o=ue(e,t),c=R(e,t),p=P(e),d=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),f=p||"0.0",u=Number.isFinite(d)&&d>0?d:0,h=De(e),k=Ee(e)||"€€ - €€€",g=I(e),v=Ne(e),y=ce(e),$=fe(e),b=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
    <article class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col" style="border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);">
      <div class="h-44 relative overflow-hidden group">
        ${C(o,i,{...t,extraClass:"transition-transform duration-700 group-hover:scale-105"})}
        <div class="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-black/20" style="background:linear-gradient(to top,#fff 0%,rgba(255,255,255,0.2) 50%,rgba(0,0,0,0.2) 100%);"></div>

        <div class="absolute top-3.5 right-3.5 flex gap-2 z-10" style="top:0.875rem;right:0.875rem;">
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            aria-label="Favorit"
          >
            ${s("heart",`w-4 h-4 ${b?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
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
          ${a(k)}
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${C(c,`${i} Logo`,{...t,extraClass:"rounded-full"})}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-1">
            <div class="flex text-amber-500">
              ${s("star","w-3.5 h-3.5 fill-amber-500 text-amber-500")}
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
            ${s("map-pin","w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${a(g)}</span>
          </div>
          ${v?`
            <div class="flex items-center gap-3">
              ${n("phone","w-4 h-4 text-slate-400 shrink-0")}
              <span class="text-[11px] text-slate-600">${a(v)}</span>
            </div>
          `:""}
          <div class="flex items-center gap-3">
            ${s("clock","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(y)}</span>
          </div>
        </div>

        ${$.length?`
          <div class="flex flex-wrap gap-1.5">
            ${$.map(w=>`
              <span class="text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100">${a(w)}</span>
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
            ${s("user","w-3.5 h-3.5 text-slate-400")}
            Profil
          </button>

          <button
            type="button"
            data-marketplace-open-business="${a(l)}"
            data-tab="menu"
            class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            ${n("book-open","w-3.5 h-3.5 text-slate-200")}
            Menu
          </button>
        </div>
      </div>
    </article>
  `}function J(e={},t={}){const a=r(e.__marketplaceType||e.type||e.customerType||""),s=re(a);return{...e,__marketplaceTypeLabel:{restaurant:"Restaurant",cafe:"Cafe",coffee:"Cafe",fastfood:"Fastfood",hotel:"Hotel",motel:"Motel",ecommerce:"E-Commerce"}[s]||t.title,__marketplaceType:s}}function K(e={},t={}){const a=t.escapeHtml,s=t.icon;return`
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-5 rounded-[1.5rem] bg-slate-100 text-slate-400 flex items-center justify-center">
        ${s(e.icon,"w-6 h-6")}
      </div>
      <h3 class="text-lg font-black tracking-tight text-slate-900">${a(e.emptyTitle)}</h3>
      <p class="mt-2 text-xs font-semibold text-slate-400 leading-5">${a(e.emptyBody)}</p>
    </div>
  `}function U(e={},t={}){t.escapeHtml;const a=t.icon;return`
    <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
      ${a("loader-2","w-4 h-4 animate-spin")}
      Daten werden geladen ...
    </div>
  `}function We(){const e=globalThis?.localStorage||null;if(!e)return null;try{const t=e.getItem($e);if(!t)return null;const a=JSON.parse(t),s=Y(a);return s?{lat:s.lat,lng:s.lng,label:r(a?.label||a?.city||""),city:r(a?.city||a?.label||""),source:r(a?.source||"")}:null}catch{return null}}function et({deps:e}={}){const t=e.icon;return`
    <div id="restaurantsSearchTop" data-restaurant-search-top style="background:${ke};">
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
  `}function tt({items:e=[],bestItems:t=[],section:a={},deps:s={}}={}){return e.length?`
    <div style="margin-bottom:2rem;">
      <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
        ${t.map(n=>xe(n,s)).join("")}
      </div>
    </div>

    <div class="space-y-4">
      ${e.map(n=>Qe(n,s)).join("")}
    </div>
  `:K(a,s)}function at({state:e,dataLoaded:t,section:a,deps:s}={}){const n=Z(e,a.key,s).map(u=>J({...u,__marketplaceType:H(u,s)},a)),i=We(),l=!!i,o=l?n.filter(u=>Re(u,i)):n,c=l?o:o.slice(0,D),p=c.slice(0,te),f=t?.restaurants===!0||n.length?tt({items:c,bestItems:p,section:a,deps:s}):U(a,s);return l?`
      <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
        ${f}
      </section>
    `:`
    <section id="restaurantsView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${et({deps:s})}
      <div id="restaurantsBenko" data-restaurants-benko class="loc-bento loc-bento--feed-content">
      </div>
    </section>
  `}function st(e={}){const t=e?.travelView&&typeof e.travelView=="object"?e.travelView:{},a=r(t.query||""),s=r(t.activeTab||"").toLowerCase(),n=["offers","hotels","map"].includes(s)?s:a?"hotels":"offers";return{query:a,activeTab:a?n:"offers",notice:r(t.notice||"")}}function nt({travel:e,deps:t}={}){const a=t.escapeHtml,s=t.icon;return`
    <div id="travelSearchTop" data-travel-search-top style="background:${je};">
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
            <span class="loc-pin">${s("map-pin","w-5 h-5")}</span>
            <input
              id="travelDestinationInput"
              data-travel-destination-input="true"
              type="text"
              value="${a(e.query)}"
              placeholder="Enter your destination"
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
                ${s("search","w-5 h-5")}
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
  `}function it({activeTab:e,hasDestination:t,hotelCount:a,deps:s}={}){const n=s.escapeHtml;return`
    <div class="bg-white/70 p-1.5 border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm" style="border-radius:2rem;">
      ${[{id:"offers",label:"Ofertat"},{id:"hotels",label:"Hotels"},{id:"map",label:"Karte"}].map(l=>{const o=e===l.id,c=!t&&l.id!=="offers",p=l.id==="hotels"&&t?` ${a}`:"";return`
          <button
            type="button"
            data-travel-tab="${n(l.id)}"
            class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${o?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":c?"text-slate-300":"text-slate-400 hover:text-slate-600"}"
          >
            ${n(`${l.label}${p}`)}
          </button>
        `}).join("")}
    </div>
  `}function lt(e={},t={}){const a=t.escapeHtml,s=t.icon,n=(O,L)=>M(O,L,t),i=T(e),l=z(e),o=pe(e,t),c=o[0]||t.placeholderImage||"",p=R(e,t),d=P(e)||"0.0",f=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),u=Number.isFinite(f)&&f>0?f:0,h=Ue(e),k=I(e),g=be(e),v=ge(e),y=X(e),$=me(e),b=He(e),w=r(e.offerBadgeLabel||e.travelOfferBadgeLabel||e.badgeLabel||""),j=r(e.offerDurationLabel||e.nightsDaysLabel||e.durationLabel||""),S=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
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

        ${w||j?`
          <div class="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
            ${w?`<span class="px-3 py-1.5 rounded-full bg-white/95 text-[9px] font-black uppercase tracking-widest shadow-sm border border-white/70" style="color:${ae};">${a(w)}</span>`:""}
            ${j?`<span class="px-3 py-1.5 rounded-full bg-slate-900/85 text-white text-[9px] font-black uppercase tracking-widest shadow-sm border border-white/20">${a(j)}</span>`:""}
          </div>
        `:""}

        ${o.length>1?`
          <button
            type="button"
            data-travel-hotel-image-nav="prev"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="left:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Vorheriges Bild"
          >
            ${s("chevron-left","w-4 h-4")}
          </button>

          <button
            type="button"
            data-travel-hotel-image-nav="next"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="right:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Naechstes Bild"
          >
            ${s("chevron-right","w-4 h-4")}
          </button>

          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            ${o.map((O,L)=>`
              <button
                type="button"
                data-travel-hotel-dot="${L}"
                data-travel-hotel-image-src="${a(O)}"
                class="${L===0?"w-4 bg-white shadow-sm":"w-1.5 bg-white/50"} h-1.5 rounded-full transition-all duration-300"
                aria-label="Hotelbild ${L+1}"
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
            ${s("heart",`w-4 h-4 ${S?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
          </button>
          <button
            type="button"
            data-travel-hotel-share="${a(l)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Teilen"
            aria-label="Teilen"
          >
            ${s("share-2","w-4 h-4")}
          </button>
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${C(p,`${i} Logo`,{...t,extraClass:"rounded-full"})}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-2" style="margin-bottom:0.5rem;">
            <div class="flex text-amber-500">
              ${s("star","w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${a(d)}</span>
            <span class="text-[11px] text-slate-400">(${a(String(u))} vlerësime)</span>
          </div>

          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${a(i)}</h2>
          <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-2" style="margin-top:0.5rem;">${a(h)}</p>
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${s("map-pin","w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${a(k)}</span>
          </div>
          <div class="flex items-center gap-3">
            ${n("navigation","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(g||"Qendra mungon")}</span>
          </div>
          <div class="flex items-center gap-3">
            ${n("waves","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(v||"Plazhi mungon")}</span>
          </div>
        </div>

        ${y.length?`
          <div class="flex flex-wrap gap-1.5">
            ${y.map(O=>ve(O,t)).join("")}
          </div>
        `:""}

        <hr class="border-slate-100" />

        <div class="flex items-center justify-between mt-0.5 gap-4">
          <div class="flex flex-col">
            <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Bestpreis</span>
            <div class="flex items-baseline gap-1">
              ${$?`
                <span class="text-base font-black text-slate-900">ab ${a($)} €</span>
                <span class="text-[9px] text-slate-500 font-bold">${a(b)}</span>
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
            ${s("chevron-right","w-3.5 h-3.5")}
          </button>
        </div>
      </div>
    </article>
  `}function rt(e={},t={}){const a=t.escapeHtml,s=t.icon,n=(_,A)=>M(_,A,t),i=T(e),l=z(e),o=pe(e,t),c=o[0]||t.placeholderImage||"",p=R(e,t),d=P(e)||"0.0",f=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),u=Number.isFinite(f)&&f>0?f:0,h=qe(e),k=be(e),g=ge(e),v=X(e).slice(0,3),y=he(e),$=Ye(e)||`${i} - ${h||address}`,b=me(e),w=Me(e),j=Ke(e),S=Ve(e),O=S||j||"Ofertë",L=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
    <article
      data-travel-hotel-card="${a(l)}"
      data-travel-offer-card="${a(e.__travelOfferId||e.offerId||l)}"
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
          alt="${a(`${i} Bild 1`)}"
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
            aria-label="Vorheriges Bild"
          >
            ${s("chevron-left","w-4 h-4")}
          </button>

          <button
            type="button"
            data-travel-hotel-image-nav="next"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="right:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Naechstes Bild"
          >
            ${s("chevron-right","w-4 h-4")}
          </button>

          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            ${o.map((_,A)=>`
              <button
                type="button"
                data-travel-hotel-dot="${A}"
                data-travel-hotel-image-src="${a(_)}"
                class="${A===0?"w-[18px] bg-white shadow-sm":"w-1.5 bg-white/60"} h-1.5 rounded-full transition-all duration-300"
                aria-label="Hotelbild ${A+1}"
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
          <span>${a(j)}</span>
        </div>

        <div class="absolute top-3 right-3 flex gap-1.5 z-10">
          <button
            type="button"
            data-travel-hotel-like="${a(l)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 shadow-sm cursor-pointer"
            aria-label="Zu Favoriten hinzufuegen"
          >
            ${s("heart",`w-4 h-4 ${L?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
          </button>
          <button
            type="button"
            data-travel-hotel-share="${a(l)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 shadow-sm cursor-pointer"
            title="Teilen"
            aria-label="Teilen"
          >
            ${s("share-2","w-3.5 h-3.5")}
          </button>
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${C(p,`${i} Logo`,{...t,extraClass:"rounded-full"})}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-2" style="margin-bottom:0.5rem;">
            <div class="flex text-amber-500">
              ${s("star","w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${a(d)}</span>
            <span class="text-[11px] text-slate-400">(${a(String(u))} vlerësime)</span>
          </div>
          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${a(i)}</h2>
          <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-2 flex items-center gap-1.5" style="margin-top:0.5rem;color:#d97706;">
            ${s("map-pin","w-3 h-3 text-amber-600 shrink-0")}
            <span>${a(h)}</span>
          </p>
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-center gap-3">
            ${n("navigation","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600 font-semibold">${a(k||"Qendra mungon")}</span>
          </div>
          <div class="flex items-center gap-3">
            ${n("waves","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600 font-semibold">${a(g||"Plazhi mungon")}</span>
          </div>
        </div>

        ${v.length?`
          <div class="flex flex-wrap gap-1.5 pt-0.5">
            ${v.map(_=>ve(_,t,"text-[9px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100/80")).join("")}
          </div>
        `:""}

        <hr class="border-slate-100" />

        <div class="flex items-center justify-between mt-0.5 gap-4">
          <div class="flex flex-col min-w-0">
            <span class="text-[9px] uppercase tracking-wider text-rose-600 font-black">${a(O)}</span>
            <div class="flex items-baseline gap-0.5">
              ${b?`
                <span class="text-xl font-black text-slate-900 leading-none">${a(b)}€</span>
                <span class="text-[9px] text-slate-400 font-bold ml-1 uppercase">${a(w)}</span>
              `:`
                <span class="text-base font-black text-slate-900 leading-none">Preis folgt</span>
              `}
            </div>
          </div>

          <button
            type="button"
            data-travel-offer-details="true"
            class="flex-1 flex items-center justify-center gap-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150 active:scale-95 cursor-pointer max-w-[130px]"
            style="max-width:130px;"
          >
            <span>Mehr Details</span>
            ${s("chevron-right","w-3.5 h-3.5")}
          </button>
        </div>
      </div>

      <div data-travel-offer-modal class="hidden absolute inset-0 bg-white/98 backdrop-blur-md z-30 flex-col p-4" aria-hidden="true">
        <div class="flex justify-between items-center mb-3.5">
          <div class="flex items-center gap-1.5">
            ${s("compass","w-4 h-4 text-slate-900")}
            <span class="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Detajet e Ofertës</span>
          </div>
          <button
            type="button"
            data-travel-offer-close="true"
            class="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Schliessen"
          >
            ${s("x","w-3.5 h-3.5")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 no-scrollbar">
          <div class="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div class="w-10 h-10 rounded-full border border-slate-100 shadow-sm overflow-hidden bg-white shrink-0">
              ${C(p,`${i} Logo`,{...t,extraClass:"rounded-full"})}
            </div>
            <div class="min-w-0">
              <h3 class="font-extrabold text-xs text-slate-900 truncate">${a(i)}</h3>
              <p class="text-[9px] text-amber-600 font-semibold uppercase truncate">${a(h)}</p>
            </div>
          </div>

          <div class="text-[11px] text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <p class="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider mb-1">Përshkrimi (Beschreibung)</p>
            ${a($)}
          </div>

          ${y.length?`
            <div class="flex flex-col gap-2">
              <h4 class="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Çfarë përfshihet (Inklusive):</h4>
              <div class="flex flex-col gap-1.5 pl-1">
                ${y.map(_=>`
                  <div class="flex items-start gap-2 text-[10px] text-slate-700">
                    ${s("check-circle-2","w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5")}
                    <span>${a(_)}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          `:""}

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mt-1">
            <h4 class="text-[10px] font-extrabold uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-1">
              ${s("calendar","w-3.5 h-3.5 text-rose-500")}
              Rezervo Online (Anfragen)
            </h4>

            <div data-travel-offer-booking-success class="hidden bg-emerald-50 text-emerald-800 text-center p-3 rounded-lg border border-emerald-200 text-[10px] font-semibold">
              Sukses! Kërkesa juaj u dërgua. Ju faleminderit!
            </div>

            <form data-travel-offer-booking-form class="flex flex-col gap-2">
              <input
                type="text"
                data-travel-offer-booking-name
                placeholder="Emri e Mbiemri (Name)"
                class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-slate-900 transition-colors"
              />
              <input
                type="tel"
                data-travel-offer-booking-phone
                placeholder="Numri i telefonit (Telefonnummer)"
                class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-slate-900 transition-colors"
              />
              <button
                type="submit"
                class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                ${s("send","w-3 h-3")}
                Dërgo Kërkesën (Anfrage senden)
              </button>
            </form>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-2 gap-3">
          <div class="flex flex-col min-w-0">
            <span class="text-[8px] uppercase tracking-wider text-slate-400 font-bold">${w==="Totali"?"Total":"Total për person"}</span>
            <span class="text-sm font-black text-slate-900 truncate">${b?`${a(b)} €`:"Preis folgt"}${S?` (${a(S)})`:""}</span>
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
  `}function ot(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],a=new Set;return t.filter(s=>s&&typeof s=="object"&&s.active!==!1).filter((s,n)=>{const i=r(s.id||s.offerId||s._id||`idx_${n}`);return a.has(i)?!1:(a.add(i),!0)})}function ct(e={}){return[...m(e.features),...m(e.offerFeatures),...m(e.hotelFeatures),r(e.hotelFeatureOneText),r(e.hotelFeatureTwoText),r(e.hotelFeatureThreeText)].filter(Boolean).filter((t,a,s)=>s.indexOf(t)===a)}function ut(e={},t={},a=0){const s=ct(t),n=he(t),i=r(t.imageUrl||t.offerImageUrl||t.titleImageUrl||t.coverImageUrl||""),l=r(t.id||t.offerId||t._id||`offer_${a}`);return{...e,__travelOffer:!0,__travelOfferId:l,offerId:l,offerTitle:r(t.title||t.name||""),offerText:r(t.text||t.description||""),offerDescription:r(t.offerDescription||t.description||t.text||""),offerDestination:r(t.offerDestination||t.destination||t.travelDestination||"")||e.offerDestination||e.destination,offerDetails:n,includedServices:n,offerBadgeLabel:r(t.offerBadgeLabel||t.travelOfferBadgeLabel||t.badgeLabel||"OFERTA"),offerDurationLabel:r(t.offerDurationLabel||t.nightsDaysLabel||t.durationLabel||""),offerImageUrl:i,titleImageUrl:i||e.titleImageUrl,coverImageUrl:i||e.coverImageUrl,offerCoverImages:i?[i]:m(t.coverImages||t.hotelCoverImages),distanceCenter:r(t.distanceCenter||t.distanceToCenter||t.centerDistance||"")||e.distanceCenter,distanceToCenter:r(t.distanceToCenter||t.distanceCenter||t.centerDistance||"")||e.distanceToCenter,centerDistance:r(t.centerDistance||t.distanceCenter||t.distanceToCenter||"")||e.centerDistance,distanceBeach:r(t.distanceBeach||t.distanceToBeach||t.beachDistance||"")||e.distanceBeach,distanceToBeach:r(t.distanceToBeach||t.distanceBeach||t.beachDistance||"")||e.distanceToBeach,beachDistance:r(t.beachDistance||t.distanceBeach||t.distanceToBeach||"")||e.beachDistance,hotelStartingPrice:r(t.hotelStartingPrice||t.startingPrice||t.priceFrom||t.fromPrice||t.bestPrice||"")||e.hotelStartingPrice,startingPrice:r(t.startingPrice||t.hotelStartingPrice||t.priceFrom||t.fromPrice||t.bestPrice||"")||e.startingPrice,priceFrom:r(t.priceFrom||t.startingPrice||t.hotelStartingPrice||"")||e.priceFrom,priceUnit:G(t.priceUnit||t.hotelPriceUnit||t.offerPriceUnit||e.priceUnit||""),features:s.length?s:e.features}}function ye(e=[]){return(Array.isArray(e)?e:[]).flatMap(t=>ot(t).map((a,s)=>ut(t,a,s)))}function pt(e=[],t={}){const a=ye(e).slice(0,12);return a.length?`
    <div class="space-y-4">
      ${a.map(s=>rt(s,t)).join("")}
    </div>
  `:K({emptyTitle:"Noch keine Angebote",emptyBody:"Keine passenden Hotel-Angebote gefunden.",icon:"plane"},t)}function we(e=[],t={}){return e.length?`
    <div class="space-y-4">
      ${e.map(a=>lt(a,t)).join("")}
    </div>
  `:K({emptyTitle:"Keine Hotels gefunden",emptyBody:"Keine passenden Hotels fuer dieses Reiseziel gefunden.",icon:"plane"},t)}function ft(e={},t=0,a={}){const s=a.escapeHtml,n=B(e),i=T(e),l=z(e),o=I(e),c=18+t*23%58,p=22+t*17%46;return`
    <button
      type="button"
      data-marketplace-open-business="${s(l)}"
      class="absolute w-12 h-12 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center active:scale-95 transition-all"
      style="left:${c}%; top:${p}%; transform:translate(-50%,-50%); color:${ae};"
      title="${s(`${i} - ${o}`)}"
    >
      ${a.icon("plane","w-5 h-5")}
      ${n?`<span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${s(`${n.lat.toFixed(5)}, ${n.lng.toFixed(5)}`)}</span>`:""}
    </button>
  `}function dt(e=[],t={}){if(typeof t.renderMapView=="function")return t.renderMapView();const a=e.filter(s=>B(s)).slice(0,8);return e.length?`
    <div class="space-y-4">
      <div class="relative overflow-hidden border border-slate-200 bg-slate-200 shadow-sm" style="height:24rem; border-radius:2.5rem;">
        <div class="absolute inset-0" style="background:linear-gradient(135deg,#e0f7fb 0%,#dbeafe 45%,#e2e8f0 100%);"></div>
        <div class="absolute inset-0 opacity-60" style="background-image:linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px); background-size:42px 42px;"></div>
        ${a.map((s,n)=>ft(s,n,t)).join("")}
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
  `:we(e,t)}function bt({state:e,dataLoaded:t,section:a,deps:s}={}){const n=Z(e,a.key,s).map(v=>J({...v,__marketplaceType:H(v,s)},a)),i=st(e),l=!!i.query,o=l?n.filter(v=>Ae(v,i.query)):n.slice(0,D),c=o.slice(0,D),p=l?i.activeTab:"offers",d=t?.restaurants===!0,f=e?.__restaurantsLoading===!0||e?.__restaurantsMetaHydrating===!0,u=p!=="map"&&p!=="hotels",h=u&&ye(c).length>0,k=u&&f&&!h,g=p==="map"?dt(c,s):p==="hotels"?we(c,s):pt(c,s);return`
    <section id="travelView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${nt({travel:i,deps:s})}
      <div id="travelBenko" data-travel-benko style="position:relative; z-index:3; margin-top:-2.5rem; border-top-left-radius:2.5rem; border-top-right-radius:2.5rem; background:#f8fafc; padding:2rem 1.5rem 6.5rem; box-shadow:0 -18px 34px -18px rgb(15 23 42 / 0.2);">
        ${it({activeTab:p,hasDestination:l,hotelCount:o.length,deps:s})}
        <div class="mt-5">
          ${k?U(a,s):d||n.length?g:U(a,s)}
        </div>
      </div>
    </section>
  `}function gt({state:e={},dataLoaded:t=null,sectionKey:a="restaurants",escapeHtmlFn:s,iconFn:n,getOptimizedImageUrlFn:i,isPlaceholderUrlFn:l,placeholderImage:o="",normalizeRestaurantTypeFn:c,normalizeLeadTypeKeyFn:p,resolveRestaurantLogoFn:d,renderMapViewFn:f}={}){const u=F[le(a)]||F.restaurants,h=W(s,(b="")=>String(b||"")),k=W(n,()=>""),g={escapeHtml:h,icon:k,getOptimizedImageUrl:i,isPlaceholderUrl:l,placeholderImage:o,resolveRestaurantLogo:d,renderMapView:f,normalizeRestaurantType:c,normalizeLeadTypeKey:p},v=t?.restaurants===!0;if(u.key==="travel")return bt({state:e,dataLoaded:t,section:u,deps:g});if(u.key==="restaurants")return at({state:e,dataLoaded:t,section:u,deps:g});const y=Z(e,u.key,g).slice(0,D).map(b=>J({...b,__marketplaceType:H(b,g)},u)),$=y.slice(0,te);return`
    <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      ${y.length?`
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
            ${$.map(b=>xe(b,g)).join("")}
          </div>
        </div>

        <div class="space-y-4">
          ${y.map(b=>Je(b,g)).join("")}
        </div>
      `:v?K(u,g):U(u,g)}
    </section>
  `}export{Z as filterMarketplaceBusinessesCore,gt as renderMarketplaceViewCore,Ie as resolveMarketplaceSectionForBusinessCore};
