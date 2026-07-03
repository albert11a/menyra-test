import{_ as dt}from"./domain-auth-DlRF6Rfv.js";const pt=()=>"";function Oe(e,t=pt){return typeof e=="function"?e:t}function gt(e=""){const t=String(e||"").trim().toLowerCase();return t==="restaurant"?"restaurants":t==="hotel"||t==="hotels"||t==="motel"||t==="motels"?"travel":t==="shop"||t==="ecommerce"||t==="e-commerce"?"shopping":t}function Ja({state:e=null,dataLoaded:t=null,renderFn:a=()=>{},helperApi:n={},profileApi:s={}}={}){const i=Oe(a,()=>{});let r=null,l=null;function f(){return r?Promise.resolve(r):l||(l=dt(()=>Promise.resolve().then(()=>Ta),void 0).then(g=>(r=g,i(),g)).catch(g=>{throw l=null,g}),l)}function b(){f().catch(()=>null)}function x(){return`
      <section class="p-6 pb-24 animate-in fade-in duration-300">
        <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
          ${Oe(n.iconFn,()=>"")("loader-2","w-4 h-4 animate-spin")}
          Daten werden vorbereitet ...
        </div>
      </section>
    `}function v(g=""){const k=gt(g);return r?.renderMarketplaceViewCore?r.renderMarketplaceViewCore({state:e,dataLoaded:t,sectionKey:k,escapeHtmlFn:n.escapeHtmlFn,iconFn:n.iconFn,getOptimizedImageUrlFn:n.getOptimizedImageUrlFn,isPlaceholderUrlFn:n.isPlaceholderUrlFn,placeholderImage:n.placeholderImage,formatCountFn:n.formatCountFn,renderMapViewFn:n.renderMapViewFn,normalizeRestaurantTypeFn:s.normalizeRestaurantTypeFn,normalizeLeadTypeKeyFn:s.normalizeLeadTypeKeyFn,resolveRestaurantLogoFn:s.resolveRestaurantLogoFn}):(b(),x())}return Object.freeze({ensureRenderUtils:f,renderMarketplaceView:v,renderRestaurantsView:()=>v("restaurants"),renderTravelView:()=>v("travel"),renderShoppingView:()=>v("shopping")})}const se=Object.freeze({restaurants:Object.freeze({key:"restaurants",title:"Restaurants",emptyTitle:"Noch keine Restaurants",emptyBody:"Keine passenden Profile gefunden.",icon:"utensils",typeKeys:Object.freeze(["restaurant","cafe","coffee","fastfood","food"])}),travel:Object.freeze({key:"travel",title:"Travel",emptyTitle:"Noch keine Travel-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"plane",typeKeys:Object.freeze(["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"])}),shopping:Object.freeze({key:"shopping",title:"Shopping",emptyTitle:"Noch keine Shopping-Profile",emptyBody:"Keine passenden Profile gefunden.",icon:"shopping-bag",typeKeys:Object.freeze(["ecommerce"])})}),_e=new Map;Object.values(se).forEach(e=>{e.typeKeys.forEach(t=>{_e.set(t,e.key)})});const Ae=8,W=24,bt="#ff4f3f",ht="mnyra_social_feed_viewer_location_v1",Ee="#00cce5",mt="#005f73",vt="#4b766d",xt=Object.freeze(["FASHION","BEAUTY","SNEAKER","BABY","HOME","GROCERY","ELECTRONICS","LOCAL"]),Pe=35,yt=Object.freeze([Object.freeze({label:"Prishtina",lat:42.6629,lng:21.1655}),Object.freeze({label:"Prizren",lat:42.2139,lng:20.7397}),Object.freeze({label:"Peja",lat:42.6591,lng:20.2883}),Object.freeze({label:"Gjakova",lat:42.3803,lng:20.4308}),Object.freeze({label:"Ferizaj",lat:42.3706,lng:21.1553}),Object.freeze({label:"Gjilan",lat:42.4635,lng:21.4699}),Object.freeze({label:"Mitrovica",lat:42.8914,lng:20.866}),Object.freeze({label:"Vushtrria",lat:42.8231,lng:20.9675}),Object.freeze({label:"Podujeva",lat:42.9106,lng:21.193}),Object.freeze({label:"Tirana",lat:41.3275,lng:19.8187}),Object.freeze({label:"Kukes",lat:42.0769,lng:20.4219}),Object.freeze({label:"Smederevo",lat:44.6644,lng:20.9276})]),wt=Object.freeze([Object.freeze(["prishtina","prishtine","prishtin","pristina"]),Object.freeze(["ferizaj","ferizaji","uroshevac"]),Object.freeze(["peja","peje","pec"]),Object.freeze(["prizren","prizreni"]),Object.freeze(["gjakova","gjakove","djakova"]),Object.freeze(["gjilan","gjilani"]),Object.freeze(["mitrovica","mitrovice"]),Object.freeze(["vushtrria","vushtrri"]),Object.freeze(["podujeva","podujeve","podujevo","besiana"]),Object.freeze(["fushe kosove","fushe kosova","fush kosove","fush kosova"]),Object.freeze(["lipjan"]),Object.freeze(["suhareka","suhareke","theranda"]),Object.freeze(["rahovec","rahoveci"]),Object.freeze(["drenas","gllogoc"]),Object.freeze(["skenderaj","skenderaji"]),Object.freeze(["malisheva","malisheve"]),Object.freeze(["kamenica","kamenice","kamenica kosove"]),Object.freeze(["decan","decani"]),Object.freeze(["istog","istogu"]),Object.freeze(["klina","kline"]),Object.freeze(["vite","vitia"]),Object.freeze(["hani i elezit","hani elezit"]),Object.freeze(["tirana","tirane"]),Object.freeze(["durres","durresi"]),Object.freeze(["vlora","vlore"]),Object.freeze(["shkoder","shkodra"]),Object.freeze(["shengjin","shëngjin","shen gjin","shengjini"]),Object.freeze(["ksamil","ksamili"]),Object.freeze(["dhermi","dhërmi","dhermiu"]),Object.freeze(["velipoje","velipojë","velipoja"]),Object.freeze(["theth","thethi"]),Object.freeze(["valbone","valbonë","valbona"]),Object.freeze(["elbasan","elbasani"]),Object.freeze(["fier","fieri"]),Object.freeze(["korce","korca"]),Object.freeze(["sarande","saranda"]),Object.freeze(["berat","berati"]),Object.freeze(["gjirokaster","gjirokastra"]),Object.freeze(["kukes","kukesi"]),Object.freeze(["lezhe","lezha"]),Object.freeze(["pogradec","pogradeci"]),Object.freeze(["kruje","kruja"]),Object.freeze(["fushe kruje","fushë krujë","fushe-kruje","fush kruje"]),Object.freeze(["lushnje","lushnja"]),Object.freeze(["himare","himarë","himara"]),Object.freeze(["kavaje","kavajë","kavaja"]),Object.freeze(["kamze","kamëz","kamza"]),Object.freeze(["vore","vorë","vora"]),Object.freeze(["divjake","divjakë","divjaka"]),Object.freeze(["permet","përmet","permeti"]),Object.freeze(["tepelene","tepelenë","tepelena"]),Object.freeze(["delvine","delvinë","delvina"]),Object.freeze(["peshkopi","peshkopia","diber","dibër"]),Object.freeze(["burrel","burreli","mat"]),Object.freeze(["puke","pukë","puka"]),Object.freeze(["bajram curri","bajramcurri","tropoje","tropojë"]),Object.freeze(["krume","krumë","has"]),Object.freeze(["lac","laç","kurbin"]),Object.freeze(["orikum","orikumi"]),Object.freeze(["golem","golemi"]),Object.freeze(["jale","jalë","jali"]),Object.freeze(["qepare","qeparo","qeparoi"]),Object.freeze(["borsh","borshi"]),Object.freeze(["lukove","lukovë","lukova"]),Object.freeze(["palase","palasë","palasa"]),Object.freeze(["drimadhe","drymades","drimadhes"]),Object.freeze(["spille","spilleja"]),Object.freeze(["gjiri i lalzit","lalzi","lalez","lalëz"])]),jt=Object.freeze([Object.freeze(["prishtina","prishtine","prishtin","pristina"]),Object.freeze(["ferizaj","ferizaji","uroshevac"]),Object.freeze(["peja","peje","pec"]),Object.freeze(["prizren","prizreni"]),Object.freeze(["gjakova","gjakove","djakova"]),Object.freeze(["gjilan","gjilani"]),Object.freeze(["mitrovica","mitrovice"]),Object.freeze(["vushtrria","vushtrri"]),Object.freeze(["podujeva","podujeve","podujevo","besiana"]),Object.freeze(["fushe kosove","fushe kosova","fush kosove","fush kosova"]),Object.freeze(["lipjan"]),Object.freeze(["suhareka","suhareke","theranda"]),Object.freeze(["rahovec","rahoveci"]),Object.freeze(["drenas","gllogoc"]),Object.freeze(["skenderaj","skenderaji"]),Object.freeze(["malisheva","malisheve"]),Object.freeze(["kamenica","kamenice","kamenica kosove"]),Object.freeze(["decan","decani"]),Object.freeze(["istog","istogu"]),Object.freeze(["klina","kline"]),Object.freeze(["vite","vitia"]),Object.freeze(["hani i elezit","hani elezit"])]),Ne=Object.freeze(["city","locationCity","primaryCity","place","locationPlace","primaryPlace","postalCity","address","primaryAddress","formattedAddress","fullAddress","addressText","streetAddress","street","locationLabel","displayLocation","locality","town","municipality","village","neighborhood","area","district","county","region","state","province","country","countryCode"]),Le=Object.freeze([...Ne,"label","name","title"]),kt=Object.freeze(["location","primaryLocation","businessLocation","venueLocation","addressInfo","place","geo","coords","coordinates","geoPoint"]);function $e(e,t=()=>""){return typeof e=="function"?e:t}function c(e=""){return String(e||"").trim()}function A(e=""){const t=c(e).toLowerCase();return t?t.replace(/[ëèéê]/g,"e").replace(/[çćč]/g,"c").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):""}function Be(e=""){const t=A(e);if(!t)return[];const a=new Set([t]);return wt.forEach(n=>{const s=n.map(A).filter(Boolean);s.includes(t)&&s.forEach(i=>a.add(i))}),Array.from(a)}function zt(e=""){const t=A(e);if(!t)return[];const a=new Set(Be(e));return jt.forEach(n=>{const s=n.map(A).filter(Boolean);s.includes(t)&&s.forEach(i=>a.add(i))}),Array.from(a)}function Re(e=""){const t=A(e);return t==="restaurant"?"restaurants":["hotel","hotels","motel","motels"].includes(t)?"travel":["shop","ecommerce","e_commerce","shopping"].includes(t)?"shopping":se[t]?t:"restaurants"}function Ue(e=""){const t=A(e);return t?t==="e_commerce"||t==="online_shop"||t==="onlineshop"||t==="shop"||t==="store"?"ecommerce":t==="coffee"||t==="coffe"||t==="coffee_shop"||t==="coffeeshop"||t==="kaffee"||t==="caffe"?"cafe":t==="fast_food"||t==="snack"||t==="imbiss"?"fastfood":t==="hotels"?"hotel":t==="motels"?"motel":t:""}function Ot(e={}){return[e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType]}function Q(e={},{normalizeRestaurantType:t,normalizeLeadTypeKey:a}={}){const n=typeof t=="function"?t:(l=>l),s=typeof a=="function"?a:(l=>l),i=Ot(e);for(const l of i){const f=Ue(n(l)||s(l)||l);if(f)return f}const r=[e.name,e.restaurantName,e.businessName,e.description,e.bio].map(l=>c(l).toLowerCase()).join(" ");return/\bhotel(s)?\b/.test(r)?"hotel":/\bmotel(s)?\b/.test(r)?"motel":/\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b/.test(r)?"cafe":/\bfast\s*food\b|\bfastfood\b/.test(r)?"fastfood":/\be-?commerce\b|\bonline\s*shop\b/.test(r)?"ecommerce":/\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b/.test(r)?"restaurant":""}function De(e={},t={}){const a=Q(e,t);return _e.get(a)||""}function R(e={}){return c(e.canonicalRestaurantId||e.restaurantId||e.id||e.landingRestaurantId||"")}function B(e={}){return c(e.name||e.restaurantName||e.businessName||e.displayName||"Business")}function Lt(e={}){return c(e.place||e.locationPlace||e.locality||e.district||e.neighborhood||e.neighbourhood||e.area||e.quarter||e.cityArea||e.primaryPlace||"")}function V(e={}){const t=c(e.city||e.locationCity||e.primaryCity),a=Lt(e);if(t&&a&&A(t)!==A(a))return`${t} - ${a}`;const n=c(e.address||e.location||e.primaryAddress);return t||a||ie(e)||c(e.country||e.region||"")||n||"Standort folgt"}function me(e={}){const t=Number(String(e?.lat??e?.latitude??"").replace(",",".")),a=Number(String(e?.lng??e?.lon??e?.longitude??"").replace(",","."));return!Number.isFinite(t)||!Number.isFinite(a)||Math.abs(t)>90||Math.abs(a)>180||Math.abs(t)<1e-6&&Math.abs(a)<1e-6?null:{lat:t,lng:a}}function He(e={},t={}){const a=Number(e.lat),n=Number(e.lng),s=Number(t.lat),i=Number(t.lng);if(![a,n,s,i].every(Number.isFinite))return Number.POSITIVE_INFINITY;const r=k=>k*Math.PI/180,l=6371,f=r(s-a),b=r(i-n),x=Math.sin(f/2),v=Math.sin(b/2),g=x*x+Math.cos(r(a))*Math.cos(r(s))*v*v;return 2*l*Math.atan2(Math.sqrt(g),Math.sqrt(Math.max(0,1-g)))}function ie(e={}){const t=J(e);if(!t)return"";const a=yt.map(n=>({label:n.label,distanceKm:He(t,n)})).filter(n=>Number.isFinite(n.distanceKm)).sort((n,s)=>n.distanceKm-s.distanceKm)[0];return a&&a.distanceKm<=Pe?a.label:"Auf Karte markiert"}function $t(e={}){const t=[e.id,e.restaurantId,e.canonicalRestaurantId,e.publicSlug,e.landingSlug,e.handle,e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType,e.city,e.locationCity,e.primaryCity,e.place,e.locationPlace,e.locality,e.neighborhood,e.neighbourhood,e.address,e.location,e.primaryAddress,ie(e),e.country,e.region,e.district,e.name,e.restaurantName,e.businessName,e.displayName,e.description,e.bio,e.about];return Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||t.push(a.city,a.place,a.locationPlace,a.locality,a.district,a.address,a.country,a.region,a.name)}),t}function Tt(e={},t=""){const a=Be(t);if(!a.length)return!0;const n=$t(e).map(A).filter(Boolean).join("_");return a.some(s=>{const i=s.split("_").filter(Boolean);return n.includes(s)?!0:i.length>0&&i.every(r=>n.includes(r))})}function ne(e=[],t=""){if(typeof t=="string"||typeof t=="number"){const a=c(t);a&&e.push(a)}}function ce(e=[],t={},a=Ne){!t||typeof t!="object"||a.forEach(n=>ne(e,t[n]))}function St(e={}){const t=[];return ce(t,e),ne(t,e.location),ne(t,ie(e)),kt.forEach(a=>{ce(t,e[a],Le)}),Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||(ce(t,a,Le),ne(t,ie(a)))}),t}function It(e={},t=""){const a=zt(t);if(!a.length)return!1;const n=St(e).map(A).filter(Boolean).join("_");return n?a.some(s=>{const i=s.split("_").filter(Boolean);return n.includes(s)||i.length>0&&i.every(r=>n.includes(r))}):!1}function Ct(e={},t=null){if(!t)return!0;const a=c(t.city||t.label||"");if(a)return!!It(e,a);const n=me(t),s=J(e);return n&&s?He(n,s)<=Pe:!a&&!n}function J(e={}){const t=[{lat:e.lat,lng:e.lng},{lat:e.latitude,lng:e.longitude},{lat:e.latitude,lng:e.lon},{lat:e._lat,lng:e._long},{lat:e._latitude,lng:e._longitude},{lat:e.gpsLat,lng:e.gpsLng},{lat:e.mapLat,lng:e.mapLng},{lat:e.geo?.lat,lng:e.geo?.lng},{lat:e.geo?.latitude,lng:e.geo?.longitude},{lat:e.geo?.latitude,lng:e.geo?.lon},{lat:e.coords?.lat,lng:e.coords?.lng},{lat:e.coords?.latitude,lng:e.coords?.longitude},{lat:e.coordinates?.lat,lng:e.coordinates?.lng},{lat:e.coordinates?.latitude,lng:e.coordinates?.longitude},{lat:e.coordinates?._lat,lng:e.coordinates?._long},{lat:e.coordinates?._latitude,lng:e.coordinates?._longitude},{lat:e.geoPoint?.lat,lng:e.geoPoint?.lng},{lat:e.geoPoint?.latitude,lng:e.geoPoint?.longitude},{lat:e.geoPoint?._lat,lng:e.geoPoint?._long},{lat:e.geoPoint?._latitude,lng:e.geoPoint?._longitude},{lat:e.geopoint?.lat,lng:e.geopoint?.lng},{lat:e.geopoint?.latitude,lng:e.geopoint?.longitude},{lat:e.geopoint?._lat,lng:e.geopoint?._long},{lat:e.geopoint?._latitude,lng:e.geopoint?._longitude},{lat:e.location?.lat,lng:e.location?.lng},{lat:e.location?.latitude,lng:e.location?.longitude},{lat:e.primaryLocation?.lat,lng:e.primaryLocation?.lng},{lat:e.primaryLocation?.latitude,lng:e.primaryLocation?.longitude},{lat:e.businessLocation?.lat,lng:e.businessLocation?.lng},{lat:e.businessLocation?.latitude,lng:e.businessLocation?.longitude}];for(const a of t){const n=me(a);if(n)return n}if(Array.isArray(e.locations))for(const a of e.locations){const n=J(a||{});if(n)return n}return null}function Me(e={}){const t=e.openingHours||e.openHours||e.hours||e.businessHours||e.workingHours||"";if(typeof t=="string"&&c(t))return c(t);if(t&&typeof t=="object"){const a=Object.values(t).map(c).filter(Boolean);if(a.length)return a[0]}return"Oeffnungszeiten folgen"}function _t(e={}){return c(e.phone||e.telephone||e.contactPhone||e.ownerPhone||"")}function At(e={}){return c(e.description||e.bio||e.about||e.shortDescription||"")}function Y(e={}){const t=Number(e.rating??e.avgRating??e.score??e.publicRating??0);return!Number.isFinite(t)||t<=0?"":Math.min(5,Math.max(1,t)).toFixed(1)}function M(e={},{getOptimizedImageUrl:t,resolveRestaurantLogo:a,placeholderImage:n=""}={}){const s=R(e),i=c(e.logoUrl||e.logo||e.logoURL||e.heroUrl||e.coverUrl||e.imageUrl||e.img||""),l=(s&&typeof a=="function"?c(a(s,i,"medium")):i)||i||n;return(typeof t=="function"?c(t(l,"medium")):l)||n||""}function ve(e={},{getOptimizedImageUrl:t,placeholderImage:a=""}={}){const s=c(e.titleImageUrl||e.coverImageUrl||e.coverImage||e.coverUrl||e.heroImageUrl||e.heroUrl||e.imageUrl||e.bestSpotLogoUrl||e.spotLogoUrl||e.logoUrl||e.logo||"")||a;return(typeof t=="function"?c(t(s,"large")):s)||a||""}function E(e){if(Array.isArray(e))return e.map(c).filter(Boolean);const t=c(e);return t?t.split(/[\n,;|]/).map(c).filter(Boolean):[]}function Fe(e={},t={}){const a=[...E(e.offerCoverImages),...E(e.coverImages),...E(e.hotelCoverImages),...E(e.titleImages),e.offerImageUrl,e.titleImageUrl,e.coverImageUrl,e.coverImage,e.coverUrl,e.heroImageUrl,e.heroUrl,e.imageUrl].map(c).filter(Boolean),n=[];a.forEach(r=>{n.includes(r)||n.push(r)});const s=ve(e,t);s&&!n.includes(s)&&n.push(s);const i=n.map(r=>typeof t.getOptimizedImageUrl=="function"?c(t.getOptimizedImageUrl(r,"large")):r).filter(Boolean);return i.length?i.slice(0,5):[t.placeholderImage||""].filter(Boolean)}function Ke(e={}){return c(e.cuisine||e.kitchen||e.foodType||e.categoryLabel||e.__marketplaceTypeLabel||e.type||e.customerType||"")}function qe(e={}){return c(e.priceRange||e.priceLevel||e.priceLabel||e.budget||"")}function ue(e,t=""){return typeof e=="string"?c(e):e===!0?c(t):""}function Ve(e={}){const t=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{},a=[ue(e.gardenTerraceText||e.gardenTerrace||e.gardenOrTerrace||t.gardenTerrace,"Gastgarten"),ue(e.accessibilityText||e.barrierFreeText||e.accessibleText||e.barrierefrei||e.accessible||t.accessibility,"Barrierefrei"),ue(e.veganOptionsText||e.veganOptions||e.veganText||e.vegan||t.veganOptions,"Vegane Optionen")].filter(Boolean);if(a.length)return a.slice(0,3);const n=Array.isArray(e.features)?e.features.map(c).filter(Boolean):[];if(n.length)return n.slice(0,3);const s=c(e.features||e.amenities||"");return s?s.split(/[,;|]/).map(c).filter(Boolean).slice(0,3):[]}function Et(e={}){return c(e.hotelCategory||e.categoryLabel||e.__marketplaceTypeLabel||e.travelCategory||e.typeLabel||e.type||e.customerType||"Hotel")}function Ye(e="",{suffix:t="",directLabel:a=""}={}){const n=c(e);if(!n)return"";const s=A(n);if(s==="direkt_im_zentrum"||s==="direkt_am_zentrum"||s==="direkt_am_strand"||s==="ne_qender"||s==="ne_plazh"||s==="direkt_ne_qender"||s==="direkt_ne_plazh")return a||n;const i=A(t);if(i&&s.includes(i))return n;const r=n.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)\b/i);return!r||!t?n:`${r[1].replace(",",".")} ${r[2].toLowerCase().startsWith("k")?"km":"m"} ${t}`}function Ge(e={}){return Ye(e.distanceCenter||e.distanceToCenter||e.centerDistance||e.cityCenterDistance||e.centerDistanceLabel||e.zentrumEntfernung||e.distanceCentre||"",{suffix:"nga qendra",directLabel:"Në qendër"})}function We(e={}){return Ye(e.distanceBeach||e.distanceToBeach||e.beachDistance||e.beachDistanceLabel||e.strandEntfernung||e.lakeDistance||e.distanceToLake||"",{suffix:"nga plazhi",directLabel:"Në plazh"})}function Xe(e={}){return c(e.hotelStartingPrice||e.startingPrice||e.priceFrom||e.fromPrice||e.bestPrice||e.roomStartingPrice||"").replace(/^\s*ab\s+/i,"").replace(/\s*(eur|€)\s*$/i,"").trim()}function xe(e=""){const t=A(e);return t==="total"||t==="totali"||t==="gesamt"?"total":"per_person"}function Pt(e={}){return xe(e.priceUnit||e.hotelPriceUnit||e.offerPriceUnit||"")==="total"?"Totali":"p.P"}function Nt(e={}){return xe(e.priceUnit||e.hotelPriceUnit||e.offerPriceUnit||"")==="total"?"Totali":"Për person"}function Bt(e={}){const t=c(e.offerBadgeLabel||e.travelOfferBadgeLabel||e.badgeLabel||"Ofertë"),a=A(t);return!t||a==="oferta"||a==="oferte"?"Ofertë":t}function Rt(e={}){return c(e.offerDurationLabel||e.nightsDaysLabel||e.durationLabel||"")}function Ut(e={}){return c(e.offerDestination||e.destination||e.travelDestination||e.city||e.locationCity||e.primaryCity||V(e))}function Dt(e={}){return c(e.offerText||e.offerDescription||e.text||e.description||e.bio||e.about||"")}function Qe(e={}){const t=[e.offerDetails,e.offerDetailItems,e.includedServices,e.inclusions,e.packageIncludes,e.includes],a=[];return t.forEach(n=>{if(Array.isArray(n)){n.map(c).filter(Boolean).forEach(s=>{a.includes(s)||a.push(s)});return}typeof n=="string"&&E(n).forEach(s=>{a.includes(s)||a.push(s)})}),a.length?a.slice(0,8):ye(e).slice(0,6)}function ye(e={}){if(e.__travelOffer===!0){const r=[...E(e.offerFeatures),...E(e.features),...E(e.hotelFeatures)];if(r.length)return r.slice(0,6)}const t=[e.hotelFeatureOneText,e.hotelFeatureTwoText,e.hotelFeatureThreeText].map(c).filter(Boolean),a=[...E(e.features),...E(e.hotelFeatures)].filter(Boolean),n=[];if([...t,...a].forEach(r=>{r&&!n.includes(r)&&n.push(r)}),n.length)return n.slice(0,6);const s=Ve(e);return s.length?s.slice(0,3):E(e.hotelAmenities||e.amenities||e.facilities).slice(0,3)}function Ht(e=""){const t=A(e);return/(mengjes|gjysme|pension|inclusive|restorant|ushqim|fruehstueck|breakfast|food)/.test(t)?"utensils":/(shezlong|plazh|strand|beach|lounger)/.test(t)?"waves":/(parking|parkplatz|garage|garazh)/.test(t)?"parking":"check"}function Je(e="",t={},a=""){const n=t.escapeHtml,s=c(e);if(!s)return"";const i=a||"text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100",r=Ht(s);return`
    <span class="${i} inline-flex items-center gap-1.5">
      ${G(r,"w-3 h-3 shrink-0",t)}
      <span>${n(s)}</span>
    </span>
  `}function G(e="",t="",a={}){const n=a.icon,s=a.escapeHtml,i=c(t),l=`xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${i?` class="${s(i)}"`:""} aria-hidden="true" focusable="false"`;return e==="share-2"?`<svg ${l}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.59 13.51 6.83 3.98"></path><path d="m15.41 6.51-6.82 3.98"></path></svg>`:e==="phone"?`<svg ${l}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`:e==="book-open"?`<svg ${l}><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>`:e==="navigation"?`<svg ${l}><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`:e==="waves"?`<svg ${l}><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>`:e==="utensils"?`<svg ${l}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>`:e==="star"?`<svg ${l}><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.751a.53.53 0 0 1 .294.904l-3.738 3.644a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.393 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.155 9.79a.53.53 0 0 1 .294-.906l5.165-.75a2.12 2.12 0 0 0 1.596-1.16z"></path></svg>`:e==="user"?`<svg ${l}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`:e==="parking"||e==="square-parking"?`<svg ${l}><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 17V7h5a3 3 0 0 1 0 6H9"></path></svg>`:e==="check"?`<svg ${l}><path d="M20 6 9 17l-5-5"></path></svg>`:typeof n=="function"?n(e,t):""}function Mt(e={}){const t=Number(e.rating??e.avgRating??e.publicRating??0),a=Number(e.score??e.publicScore??0),n=Number(e.followersCount??e.followerCount??0),s=Number(e.postsCount??e.postCount??0),i=Number(e.updatedAt?.seconds||e.createdAt?.seconds||0);return(Number.isFinite(t)?t*1e3:0)+(Number.isFinite(a)?a:0)+(Number.isFinite(n)?Math.min(n,500):0)+(Number.isFinite(s)?Math.min(s,200):0)+(Number.isFinite(i)?Math.min(i/1e5,100):0)}function Ft(e={},t={}){const a=new Map,n=(s={})=>{if(!s||typeof s!="object")return;const i=R(s);if(!i)return;const r=a.get(i)||{};a.set(i,{...r,...s,id:i})};return(Array.isArray(e.bootstrapRestaurantPreview)?e.bootstrapRestaurantPreview:[]).forEach(n),(Array.isArray(e.restaurants)?e.restaurants:[]).forEach(n),Array.from(a.values()).map(s=>({...s,__marketplaceSection:De(s,t),__marketplaceScore:Mt(s)})).filter(s=>s.__marketplaceSection).sort((s,i)=>i.__marketplaceScore-s.__marketplaceScore||B(s).localeCompare(B(i)))}function Z(e={},t="",a={}){const n=Re(t);return Ft(e,a).filter(s=>s.__marketplaceSection===n)}function H(e="",t="",{escapeHtml:a,isPlaceholderUrl:n,extraClass:s=""}={}){const i=c(e),r=!i||typeof n=="function"&&n(i);return`
    <img
      src="${a(i)}"
      alt="${a(t)}"
      loading="lazy"
      class="w-full h-full object-cover bg-slate-100 ${s}"
      ${r?'data-placeholder-image="true"':""}
    />
  `}function Kt(e={},t={}){const a=t.escapeHtml,n=t.icon,s=B(e),i=R(e),r=M(e,t),l=Y(e),f=V(e);return`
    <button type="button" data-marketplace-open-business="${a(i)}" class="shrink-0 w-44 text-left rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <div class="h-28 bg-slate-100 overflow-hidden">
        ${H(r,s,t)}
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest line-clamp-1">${a(e.__marketplaceTypeLabel||"Top")}</span>
          ${l?`<span class="text-[10px] font-black text-amber-500 flex items-center gap-1">${n("star","w-3 h-3 fill-current")} ${a(l)}</span>`:""}
        </div>
        <h3 class="text-sm font-black text-slate-900 leading-tight line-clamp-2">${a(s)}</h3>
        <p class="mt-2 text-[10px] font-bold text-slate-400 leading-4 line-clamp-1">${a(f)}</p>
      </div>
    </button>
  `}function qt(e=""){const t=c(e).toLowerCase();return t==="approved"||t==="accepted"||t==="active"?"approved":t==="rejected"||t==="declined"||t==="denied"?"rejected":"pending"}function Vt(e={}){return(Array.isArray(e.publicAds)?e.publicAds:Array.isArray(e.restaurantAds)?e.restaurantAds:[]).filter(a=>a&&a.active!==!1&&qt(a.status||a.approvalStatus||"")==="approved")}function Yt(e=[]){return(Array.isArray(e)?e:[]).flatMap(t=>Vt(t).map((a,n)=>({record:t,ad:a,index:n}))).slice(0,Ae)}function Gt(e={},t="",a={}){const n=a.escapeHtml,s=M(e,a),i=c(t||B(e)||"Premium Highlight"),r=c(e.__marketplaceTypeLabel||"Restaurant");return s?`
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
      ${G("utensils","w-12 h-12 text-amber-500 mb-1.5",a)}
      <span class="text-[10px] font-black tracking-widest text-[#a37f4c] uppercase mt-1" style="font-size:10px;font-weight:900;letter-spacing:0.1em;color:#a37f4c;text-transform:uppercase;margin-top:0.25rem;">
        ${n(r)}
      </span>
    </div>
  `}function Wt(e={},t={}){const a=t.escapeHtml,n=(m,j)=>G(m,j,t),s=e.record||{},i=e.ad||{},r=R(s),l=B(s),f=c(i.title||l),b=c(i.category||Ke(s)||s.__marketplaceTypeLabel||"RESTAURANT").toUpperCase(),x=Y(s)||"0.0",v=c(i.priceSegment||qe(s)||"€€ - €€€"),g=c(i.imageUrl||ve(s,t)),k=typeof t.getOptimizedImageUrl=="function"?c(t.getOptimizedImageUrl(g,"large")):g,I=Math.max(0,Math.min(100,Number(i.cropX??50)||50)),w=Math.max(0,Math.min(100,Number(i.cropY??50)||50)),z=i.bestChoiceBadgeEnabled!==!1,L=i.deliveryBadgeEnabled!==!1,p=i.woltEnabled!==!1;return`
    <article class="w-72 h-[24rem] flex-shrink-0 bg-white rounded-[1.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden border border-slate-100 snap-start relative group" style="width:min(18rem, calc(100vw - 4.5rem));height:24rem;flex:0 0 auto;border-radius:1.5rem;border:1px solid #f1f5f9;background:#fff;">
      <div class="relative h-44 flex-shrink-0 overflow-hidden bg-slate-100" style="height:11rem;flex:0 0 auto;background:#f1f5f9;">
        ${k?`
          <img
            src="${a(k)}"
            alt="${a(f)}"
            loading="lazy"
            decoding="async"
            class="w-full h-full object-cover"
            style="width:100%;height:100%;object-fit:cover;object-position:${I}% ${w}%;"
          />
        `:Gt(s,f,t)}

        ${z||L?`
          <div class="absolute top-3 right-3 flex flex-col gap-1 w-[82px] z-10" style="top:0.75rem;right:0.75rem;width:82px;gap:0.25rem;z-index:10;">
            ${z?'<span class="bg-[#c5a059] text-white text-[6.5px] font-black uppercase tracking-wider h-[18px] flex items-center justify-center rounded-md border border-white/5 shadow-none" style="height:18px;border-radius:0.375rem;background:#c5a059;color:#fff;font-size:6.5px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;border:1px solid rgba(255,255,255,0.05);">Best Choice</span>':""}
            ${L?'<span class="bg-[#1f5f4c] text-white text-[6.5px] font-black uppercase tracking-wider h-[18px] flex items-center justify-center rounded-md border border-white/5 shadow-none" style="height:18px;border-radius:0.375rem;background:#1f5f4c;color:#fff;font-size:6.5px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;border:1px solid rgba(255,255,255,0.05);">For Delivery</span>':""}
          </div>
        `:""}

        ${p?`
          <div class="absolute bottom-4 left-4 bg-[#00b4d8] text-white h-[25px] px-3.5 rounded-md flex items-center justify-center border border-cyan-400/20 z-10 shadow-none" style="bottom:1rem;left:1rem;height:25px;padding-left:0.875rem;padding-right:0.875rem;border-radius:0.375rem;background:#00b4d8;color:#fff;border:1px solid rgba(34,211,238,0.2);z-index:10;">
            <span class="font-sans font-black tracking-widest text-[9px] uppercase" style="font-size:9px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;">WOLT</span>
          </div>
        `:""}
      </div>

      <div class="px-5 flex-1 flex flex-col bg-white" style="padding-left:1.25rem;padding-right:1.25rem;flex:1 1 0%;display:flex;flex-direction:column;background:#fff;">
        <div class="flex-1 flex flex-col justify-center pt-4 pb-4" style="flex:1 1 0%;display:flex;flex-direction:column;justify-content:center;padding-top:1rem;padding-bottom:1rem;min-height:0;">
          <span class="text-[10px] font-extrabold text-[#c5a059] tracking-widest uppercase block mb-0.5 line-clamp-1" style="font-size:10px;font-weight:800;color:#c5a059;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.125rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a(b)}</span>
          <h3 class="text-xl font-extrabold text-slate-800 line-clamp-1 group-hover:text-slate-900 transition-colors duration-200" style="font-size:1.25rem;line-height:1.75rem;font-weight:800;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a(f)}</h3>
        </div>

        <div class="flex items-center justify-between text-[10px] text-slate-600 font-semibold border-t border-slate-100 pt-3.5 pb-5" style="display:flex;align-items:center;justify-content:space-between;font-size:10px;color:#475569;font-weight:600;border-top:1px solid #f1f5f9;padding-top:0.875rem;padding-bottom:1.25rem;gap:0.625rem;">
          <div class="flex items-center justify-center gap-1 bg-slate-50 rounded-md border border-slate-100/50" style="width:88px;height:24px;border-radius:0.375rem;background:#f8fafc;border:1px solid rgba(241,245,249,0.5);display:flex;align-items:center;justify-content:center;gap:0.25rem;min-width:0;">
            ${n("star","w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0")}
            <span class="font-bold text-slate-800">${a(x)}</span>
          </div>
          <div class="flex items-center justify-center gap-1 bg-slate-50 rounded-md border border-slate-100/50" style="width:88px;height:24px;border-radius:0.375rem;background:#f8fafc;border:1px solid rgba(241,245,249,0.5);display:flex;align-items:center;justify-content:center;gap:0.25rem;min-width:0;">
            ${n("utensils","w-3 h-3 text-slate-400 flex-shrink-0")}
            <span class="font-bold text-[10px] truncate" style="font-size:10px;font-weight:700;max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a(v)}</span>
          </div>
        </div>

        <div class="pb-6" style="padding-bottom:1.5rem;">
          <button type="button" data-marketplace-open-business="${a(r)}" data-tab="profile" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]" style="width:100%;background:#0f172a;color:#fff;font-weight:700;padding-top:0.875rem;padding-bottom:0.875rem;border-radius:0.75rem;font-size:0.75rem;line-height:1rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;">
            ${n("user","w-3.5 h-3.5 text-slate-300")}
            <span>Profil ansehen</span>
          </button>
        </div>
      </div>
    </article>
  `}function Xt(e={},t={}){const a=t.escapeHtml,n=t.icon,s=B(e),i=R(e),r=M(e,t),l=Y(e),f=V(e),b=Me(e),x=At(e),v=c(e.__marketplaceTypeLabel||e.type||e.customerType||"");return`
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <button type="button" data-marketplace-open-business="${a(i)}" class="w-full text-left active:scale-[0.99] transition-transform">
        <div class="h-48 bg-slate-100 overflow-hidden">
          ${H(r,s,t)}
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              ${v?`<p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">${a(v)}</p>`:""}
              <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight">${a(s)}</h3>
            </div>
            ${l?`<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${n("star","w-3 h-3 fill-current")} ${a(l)}</span>`:""}
          </div>
          ${x?`<p class="mt-3 text-xs font-semibold text-slate-500 leading-5 line-clamp-2">${a(x)}</p>`:""}
          <div class="mt-4 grid grid-cols-1 gap-2 text-[11px] font-bold text-slate-500">
            <div class="flex items-center gap-2 min-w-0">
              ${n("map-pin","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${a(f)}</span>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              ${n("clock","w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${a(b)}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  `}function fe(e){if(Array.isArray(e))return e.map(c).filter(Boolean);const t=c(e);return t?t.split(/[\n,;|]/).map(c).filter(Boolean):[]}function Ze(e={}){return c(e.id||e.productId||e.menuItemId||e.itemId||"")}function he(e={}){return c(e.name||e.title||e.productName||"Produkt")}function et(e){return e?c(typeof e=="string"||typeof e!="object"?e:e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||""):""}function tt(e={}){const t=[...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(et).filter(Boolean);return t.filter((a,n)=>t.indexOf(a)===n)}function at(e={}){return c(e.cardImageUrl||e.shoppingCardImageUrl||e.shoppingLandingImageUrl||e.productCardImageUrl||"")}function Qt(e={},t={}){const a=at(e)||tt(e)[0]||"";return a?typeof t.getOptimizedImageUrl=="function"?c(t.getOptimizedImageUrl(a,"medium")):a:""}function Jt(e={}){const t=c(e.priceLabel||e.displayPrice||e.formattedPrice||"");if(t)return t;const a=Number(e.price??e.amount??0);if(!Number.isFinite(a)||a<=0)return"";const n=c(e.currency||e.currencyCode||"€"),s=a%1===0?String(a):a.toFixed(2).replace(".",",");return n==="EUR"||n==="€"?`${s} €`:`${s} ${n}`}function Zt(e={},t={},a=""){const n=Ze(e);if(!n)return null;const s=tt(e),i=s[0]||"";return{id:n,restaurantId:a,name:he(e),title:he(e),description:c(e.description||e.text||""),category:c(e.category||e.type||""),price:e.price??"",priceLabel:Jt(e),currency:c(e.currency||e.currencyCode||""),cardImageUrl:at(e),imageUrl:i,imageUrls:s,type:c(e.type||"food")||"food",catalogMode:"shop",restaurantType:"ecommerce",customerType:"ecommerce"}}function ea(e={},t={}){const a=[...Array.isArray(e.imageUrls)?e.imageUrls:[],e.imageUrl,...Array.isArray(t.imageUrls)?t.imageUrls:[],t.imageUrl].map(et).filter(Boolean).filter((n,s,i)=>i.indexOf(n)===s);return{...t,...e,imageUrl:a[0]||e.imageUrl||t.imageUrl||"",imageUrls:a,cardImageUrl:c(e.cardImageUrl||t.cardImageUrl||"")}}function ta(e={}){const t=e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{};return[...Array.isArray(t.products)?t.products:[],...Array.isArray(e.shoppingLandingProducts)?e.shoppingLandingProducts:[],...Array.isArray(e.landingProducts)?e.landingProducts:[],...Array.isArray(e.productPreview)?e.productPreview:[],...Array.isArray(e.productsPreview)?e.productsPreview:[],...Array.isArray(e.publicMenuItems)?e.publicMenuItems:[],...Array.isArray(e.menuItems)?e.menuItems:[]].filter(a=>a&&typeof a=="object")}function aa(e={}){const t=e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{},a=[...fe(t.productIds),...fe(e.shoppingLandingCardProductIds),...fe(e.shoppingLandingProductIds)];return a.filter((n,s)=>a.indexOf(n)===s)}function na(e={},t={}){const a=R(e),n=new Map;ta(e).forEach(l=>{const f=Zt(l,t,a);if(f?.id){if(n.has(f.id)){n.set(f.id,ea(n.get(f.id),f));return}n.set(f.id,f)}});const s=Array.from(n.values());if(!s.length)return[];const i=aa(e);if(!i.length)return s.slice(0,4);const r=i.map(l=>n.get(l)).filter(Boolean);return(r.length?r:s).slice(0,4)}function sa(e={},t={}){const a=e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{};if(a.active===!1||e.shoppingLandingCardEnabled===!1)return null;const n=B(e),s=M(e,t),i=c(a.imageUrl||a.heroImageUrl||e.shoppingLandingCardImageUrl||e.shoppingLandingImageUrl||""),r=i?typeof t.getOptimizedImageUrl=="function"?c(t.getOptimizedImageUrl(i,"large")):i:s,l=c(a.title||e.shoppingLandingCardTitle||e.landingCardTitle||n),f=c(a.subtitle||a.text||e.shoppingLandingCardSubtitle||e.categoryLabel||"");return{id:R(e),title:l,brand:n,heroImage:r,logoImage:s,mainText:f,products:na(e,t)}}function ia(e={},t={}){const a=t.escapeHtml;return e.heroImage?`
      <img
        src="${a(e.heroImage)}"
        alt="${a(e.title||e.brand)}"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 w-full h-full object-cover"
      />
    `:`
    <div class="absolute inset-0 bg-slate-100"></div>
  `}function ra(e={},t={}){const a=t.escapeHtml,n=he(e),s=Qt(e,t),i=a(JSON.stringify(e)),r=Ze(e),l=c(e.restaurantId||"");return`
    <button
      type="button"
      data-menu-open="${a(r)}"
      data-menu-open-source="marketplace"
      data-menu-open-restaurant="${a(l)}"
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
  `}function la(e={},t={}){const a=t.escapeHtml,n=t.icon,s=sa(e,t);return s?.id?`
    <article class="flex flex-col group" data-shopping-card data-shopping-search-text="${a(`${s.brand} ${s.title}`.toLowerCase())}">
      <div class="relative rounded-2xl flex flex-col items-center justify-center overflow-hidden p-3 shadow-sm hover:shadow-md transition-all duration-300 bg-slate-100" style="height:11.5rem;">
        ${ia(s,t)}
        ${s.logoImage?`
          <div class="absolute top-2 right-2 z-20 w-9 h-9 rounded-2xl bg-white border border-white/70 shadow-sm overflow-hidden" aria-hidden="true">
            <img src="${a(s.logoImage)}" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover" />
          </div>
        `:""}
      </div>

      ${s.products.length?`
        <div class="mt-2 px-2.5 overflow-hidden" style="margin-left:-0.625rem;margin-right:-0.625rem;">
          <div class="flex gap-2.5 overflow-x-auto hide-scrollbar py-1 px-0.5" style="-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-behavior:smooth;scroll-snap-type:x mandatory;">
            ${s.products.map(i=>ra(i,t)).join("")}
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
              aria-label="Shop oeffnen"
            >
              ${n("chevron-right","w-4 h-4")}
            </button>
          </div>
        </div>
      </div>
    </article>
  `:""}function oa(e={}){const t=e.escapeHtml;return`
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
      style="width:100%;min-height:12.75rem;border-radius:1rem;background:${vt};color:#ffffff;padding:1.15rem 0.75rem;"
      aria-label="Shopping Brand"
    >
      <div class="w-full" style="font-weight:900;letter-spacing:0;line-height:1.08;font-size:1.65rem;">
        <div class="text-slider-wrapper">
          ${xt.map((a,n)=>`
            <div class="text-slide-item" style="animation-delay:${n*3}s;">
              ${t(a)}
            </div>
          `).join("")}
        </div>
        <div style="font-weight:900;color:#ffffff;">SHOP</div>
      </div>
    </article>
  `}function ca({state:e,dataLoaded:t,section:a,deps:n}={}){const s=n.icon,i=Z(e,a.key,n).slice(0,W).map(x=>oe({...x,__marketplaceType:Q(x,n)},a)),r=t?.restaurants===!0;if(!i.length)return`
      <section data-shopping-view class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
        ${r?ee(a,n):X(a,n)}
      </section>
    `;const l=[],f=[];i.forEach((x,v)=>{const g=la(x,n);g&&(v%2===0?l:f).push(g)});const b=l.length+f.length>0;return`
    <section data-shopping-view class="min-h-full bg-slate-50 text-slate-900 animate-in slide-in-from-right-10 duration-500">
      <header class="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md px-4 pt-6 pb-4 h-16 flex items-center justify-between overflow-hidden">
        <div data-shopping-search-title class="transition-all duration-300 ease-in-out flex-shrink-0 opacity-100" style="max-width:80%;">
          <h1 class="text-[13px] font-black text-slate-800 tracking-tight whitespace-nowrap uppercase">Entdecke die besten shops</h1>
        </div>
        <div data-shopping-search-shell class="flex items-center transition-all duration-300 ease-in-out w-9">
          <button type="button" data-shopping-search-toggle class="p-2 hover:bg-slate-200 rounded-full text-slate-700 transition-all ml-auto active:scale-90 outline-none focus:outline-none focus-visible:outline-none focus:ring-0" style="outline:none;box-shadow:none;" aria-label="Shops suchen">
            ${s("search","w-4 h-4")}
          </button>
          <div data-shopping-search-panel class="hidden items-center w-full border-b border-slate-900 pb-1.5 outline-none focus-within:outline-none focus-within:ring-0" style="border-bottom-width:2px;box-shadow:none;">
            ${s("search","w-4 h-4 text-slate-400 flex-shrink-0 mr-2")}
            <input type="text" data-shopping-search-input placeholder="Shops suchen..." class="bg-transparent text-xs font-bold text-slate-800 w-full outline-none focus:outline-none focus-visible:outline-none focus:ring-0 placeholder-slate-400" style="box-shadow:none;" autocomplete="off" />
            <button type="button" data-shopping-search-close class="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors flex-shrink-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0" style="outline:none;box-shadow:none;" aria-label="Suche schliessen">
              ${s("x","w-3.5 h-3.5")}
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 px-2 pt-3 pb-24">
        <div class="grid grid-cols-2 gap-2 items-start" data-shopping-card-grid>
          <div class="flex flex-col gap-6">${l.join("")}</div>
          <div class="flex flex-col gap-6">${b?oa(n):""}${f.join("")}</div>
        </div>
      </main>
    </section>
  `}function ua(e={},t={}){const a=t.escapeHtml,n=t.icon,s=(j,y)=>G(j,y,t),i=B(e),r=R(e),l=ve(e,t),f=M(e,t),b=Y(e),x=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),v=b||"0.0",g=Number.isFinite(x)&&x>0?x:0,k=Ke(e),I=qe(e)||"€€ - €€€",w=V(e),z=_t(e),L=Me(e),p=Ve(e),m=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
    <article class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col" style="border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);">
      <div class="h-44 relative overflow-hidden group">
        ${H(l,i,{...t,extraClass:"transition-transform duration-700 group-hover:scale-105"})}
        <div class="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-black/20" style="background:linear-gradient(to top,#fff 0%,rgba(255,255,255,0.2) 50%,rgba(0,0,0,0.2) 100%);"></div>

        <div class="absolute top-3.5 right-3.5 flex gap-2 z-10" style="top:0.875rem;right:0.875rem;">
          <button
            type="button"
            data-marketplace-open-map="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Auf Karte anzeigen"
            aria-label="Auf Karte anzeigen"
          >
            ${n("map","w-4 h-4")}
          </button>
          <button
            type="button"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            aria-label="Favorit"
          >
            ${n("heart",`w-4 h-4 ${m?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
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
            ${H(f,`${i} Logo`,{...t,extraClass:"rounded-full"})}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-1">
            <div class="flex text-amber-500">
              ${n("star","w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${a(v)}</span>
            <span class="text-[11px] text-slate-400">(${a(String(g))} Bewertungen)</span>
          </div>

          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${a(i)}</h2>
          ${k?`<p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5" style="margin-top:0.125rem;">${a(k)}</p>`:""}
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${n("map-pin","w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${a(w)}</span>
          </div>
          ${z?`
            <div class="flex items-center gap-3">
              ${s("phone","w-4 h-4 text-slate-400 shrink-0")}
              <span class="text-[11px] text-slate-600">${a(z)}</span>
            </div>
          `:""}
          <div class="flex items-center gap-3">
            ${n("clock","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(L)}</span>
          </div>
        </div>

        ${p.length?`
          <div class="flex flex-wrap gap-1.5">
            ${p.map(j=>`
              <span class="text-[9px] font-semibold bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-md border border-slate-100">${a(j)}</span>
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
            Profil
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
  `}function oe(e={},t={}){const a=c(e.__marketplaceType||e.type||e.customerType||""),n=Ue(a);return{...e,__marketplaceTypeLabel:{restaurant:"Restaurant",cafe:"Cafe",coffee:"Cafe",fastfood:"Fastfood",hotel:"Hotel",motel:"Motel",ecommerce:"E-Commerce"}[n]||t.title,__marketplaceType:n}}function ee(e={},t={}){const a=t.escapeHtml,n=t.icon;return`
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-5 rounded-[1.5rem] bg-slate-100 text-slate-400 flex items-center justify-center">
        ${n(e.icon,"w-6 h-6")}
      </div>
      <h3 class="text-lg font-black tracking-tight text-slate-900">${a(e.emptyTitle)}</h3>
      <p class="mt-2 text-xs font-semibold text-slate-400 leading-5">${a(e.emptyBody)}</p>
    </div>
  `}function X(e={},t={}){t.escapeHtml;const a=t.icon;return`
    <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
      ${a("loader-2","w-4 h-4 animate-spin")}
      Daten werden geladen ...
    </div>
  `}function fa(){const e=globalThis?.localStorage||null;if(!e)return null;try{const t=e.getItem(ht);if(!t)return null;const a=JSON.parse(t),n=me(a);if(!n)return null;const s=c(a?.source||""),i=c(a?.label||a?.city||""),r=c(a?.city||""),l=A(i),f=l==="current_location"||l==="currentlocation"||l==="standort"||l==="aktueller_standort";return{lat:n.lat,lng:n.lng,label:i,city:r||(f?"":i),source:s}}catch{return null}}function da({deps:e}={}){const t=e.icon;return`
    <div id="restaurantsSearchTop" data-restaurant-search-top style="background:${bt};">
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
  `}function pa({items:e=[],adItems:t=[],section:a={},deps:n={}}={}){const s=n.escapeHtml,i=n.icon;return e.length?`
    ${t.length?`
      <div class="w-full space-y-5 mb-6" style="width:100%;margin-bottom:1.5rem;">
        <div class="flex items-center justify-between px-0" style="padding-left:0;padding-right:0;">
          <div>
            <h2 class="text-xl font-black tracking-tight text-slate-900 md:text-2xl">Highlights</h2>
            <p class="text-[11px] text-slate-400 font-semibold mt-0.5">${s("Premium Partner in deiner Umgebung")}</p>
          </div>
          <div class="hidden md:flex items-center gap-1.5">
            <button type="button" data-restaurant-ads-scroll="left" class="bg-white hover:bg-slate-50 text-slate-800 p-2 rounded-full shadow-sm border border-slate-100 transition-all active:scale-95" aria-label="Nach links scrollen">
              ${i("chevron-left","w-3.5 h-3.5")}
            </button>
            <button type="button" data-restaurant-ads-scroll="right" class="bg-white hover:bg-slate-50 text-slate-800 p-2 rounded-full shadow-sm border border-slate-100 transition-all active:scale-95" aria-label="Nach rechts scrollen">
              ${i("chevron-right","w-3.5 h-3.5")}
            </button>
          </div>
        </div>
        <div class="relative">
          <div data-restaurant-ads-track class="flex gap-6 overflow-x-auto hide-scrollbar pb-5 pt-2 px-0 snap-x snap-mandatory scroll-smooth" style="-webkit-overflow-scrolling:touch;scrollbar-width:none;display:flex;gap:1.5rem;overflow-x:auto;padding:0.5rem 0 1.25rem;scroll-snap-type:x mandatory;scroll-behavior:smooth;">
            ${t.map(r=>Wt(r,n)).join("")}
          </div>
        </div>
      </div>
    `:""}

    <div class="space-y-4">
      ${e.map(r=>ua(r,n)).join("")}
    </div>
  `:ee(a,n)}function ga({state:e,dataLoaded:t,section:a,deps:n}={}){const s=Z(e,a.key,n).map(g=>oe({...g,__marketplaceType:Q(g,n)},a)),i=fa(),r=!!i,l=r?s.filter(g=>Ct(g,i)):s,f=r?l:l.slice(0,W),b=Yt(f),v=t?.restaurants===!0||s.length?pa({items:f,adItems:b,section:a,deps:n}):X(a,n);return r?`
      <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
        ${v}
      </section>
    `:`
    <section id="restaurantsView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${da({deps:n})}
      <div id="restaurantsBenko" data-restaurants-benko class="loc-bento loc-bento--feed-content">
      </div>
    </section>
  `}function ba(e={}){const t=e?.travelView&&typeof e.travelView=="object"?e.travelView:{},a=c(t.query||""),n=c(t.activeTab||"").toLowerCase(),s=["offers","hotels","map"].includes(n)?n:a?"hotels":"offers";return{query:a,activeTab:a?s:"offers",notice:c(t.notice||"")}}function ha({travel:e,deps:t}={}){const a=t.escapeHtml,n=t.icon;return`
    <div id="travelSearchTop" data-travel-search-top style="background:${mt};">
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
  `}function ma({activeTab:e,hasDestination:t,hotelCount:a,deps:n}={}){const s=n.escapeHtml;return`
    <div class="bg-white/70 p-1.5 border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm" style="border-radius:2rem;">
      ${[{id:"offers",label:"Ofertat"},{id:"hotels",label:"Hotels"},{id:"map",label:"Karte"}].map(r=>{const l=e===r.id,f=!t&&r.id!=="offers",b=r.id==="hotels"&&t?` ${a}`:"";return`
          <button
            type="button"
            data-travel-tab="${s(r.id)}"
            class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${l?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":f?"text-slate-300":"text-slate-400 hover:text-slate-600"}"
          >
            ${s(`${r.label}${b}`)}
          </button>
        `}).join("")}
    </div>
  `}function va(e={},t={}){const a=t.escapeHtml,n=t.icon,s=(o,u)=>G(o,u,t),i=B(e),r=R(e),l=Fe(e,t),f=l[0]||t.placeholderImage||"",b=M(e,t),x=Y(e)||"0.0",v=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),g=Number.isFinite(v)&&v>0?v:0,k=Et(e),I=V(e),w=Ge(e),z=We(e),L=ye(e),p=Xe(e),m=Pt(e),j=c(e.offerBadgeLabel||e.travelOfferBadgeLabel||e.badgeLabel||""),y=c(e.offerDurationLabel||e.nightsDaysLabel||e.durationLabel||""),N=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
    <article
      data-travel-hotel-card="${a(r)}"
      data-travel-hotel-image-index="0"
      class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col"
      style="border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);"
    >
      <div data-travel-hotel-gallery class="h-44 relative overflow-hidden group select-none touch-pan-y" style="touch-action:pan-y;">
        <img
          data-travel-hotel-main-image
          src="${a(f)}"
          alt="${a(`${i} Ansicht 1`)}"
          loading="lazy"
          class="w-full h-full object-cover transition-all duration-500 bg-slate-100"
        />
        <div class="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/30 to-transparent pointer-events-none"></div>

        ${j||y?`
          <div class="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
            ${j?`<span class="px-3 py-1.5 rounded-full bg-white/95 text-[9px] font-black uppercase tracking-widest shadow-sm border border-white/70" style="color:${Ee};">${a(j)}</span>`:""}
            ${y?`<span class="px-3 py-1.5 rounded-full bg-slate-900/85 text-white text-[9px] font-black uppercase tracking-widest shadow-sm border border-white/20">${a(y)}</span>`:""}
          </div>
        `:""}

        ${l.length>1?`
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
            ${l.map((o,u)=>`
              <button
                type="button"
                data-travel-hotel-dot="${u}"
                data-travel-hotel-image-src="${a(o)}"
                class="${u===0?"w-4 bg-white shadow-sm":"w-1.5 bg-white/50"} h-1.5 rounded-full transition-all duration-300"
                aria-label="Hotelbild ${u+1}"
              ></button>
            `).join("")}
          </div>
        `:`
          <span data-travel-hotel-dot="0" data-travel-hotel-image-src="${a(f)}" class="hidden"></span>
        `}

        <div class="absolute top-3.5 right-3.5 flex gap-2 z-10" style="position:absolute;top:0.875rem;right:0.875rem;z-index:30;display:flex;gap:0.5rem;">
          <button
            type="button"
            data-marketplace-open-map="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            title="Auf Karte anzeigen"
            aria-label="Auf Karte anzeigen"
          >
            ${n("map","w-4 h-4")}
          </button>
          <button
            type="button"
            data-travel-hotel-like="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 border border-slate-200/50 shadow-sm cursor-pointer"
            aria-label="Zu Favoriten hinzufuegen"
          >
            ${n("heart",`w-4 h-4 ${N?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
          </button>
          <button
            type="button"
            data-travel-hotel-share="${a(r)}"
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
            ${H(b,`${i} Logo`,{...t,extraClass:"rounded-full"})}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-2" style="margin-bottom:0.5rem;">
            <div class="flex text-amber-500">
              ${n("star","w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${a(x)}</span>
            <span class="text-[11px] text-slate-400">(${a(String(g))} vlerësime)</span>
          </div>

          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${a(i)}</h2>
          <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-2" style="margin-top:0.5rem;">${a(k)}</p>
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${n("map-pin","w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${a(I)}</span>
          </div>
          <div class="flex items-center gap-3">
            ${s("navigation","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(w||"Qendra mungon")}</span>
          </div>
          <div class="flex items-center gap-3">
            ${s("waves","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${a(z||"Plazhi mungon")}</span>
          </div>
        </div>

        ${L.length?`
          <div class="flex flex-wrap gap-1.5">
            ${L.map(o=>Je(o,t)).join("")}
          </div>
        `:""}

        <hr class="border-slate-100" />

        <div class="flex items-center justify-between mt-0.5 gap-4">
          <div class="flex flex-col">
            <span class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Bestpreis</span>
            <div class="flex items-baseline gap-1">
              ${p?`
                <span class="text-base font-black text-slate-900">ab ${a(p)} €</span>
                <span class="text-[9px] text-slate-500 font-bold">${a(m)}</span>
              `:`
                <span class="text-base font-black text-slate-900">Preis folgt</span>
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
            <span>Mehr</span>
            ${n("chevron-right","w-3.5 h-3.5")}
          </button>
        </div>
      </div>
    </article>
  `}function xa(e={},t={}){const a=t.escapeHtml,n=t.icon,s=(d,h)=>G(d,h,t),i=B(e),r=R(e),l=Fe(e,t),f=l[0]||t.placeholderImage||"",b=M(e,t),x=Y(e)||"0.0",v=Number(e.reviewsCount??e.reviewCount??e.ratingsCount??0),g=Number.isFinite(v)&&v>0?v:0,k=Ut(e),I=Ge(e),w=We(e),z=ye(e).slice(0,3),L=Qe(e),p=Dt(e)||`${i} - ${k||e.address||""}`,m=Xe(e),j=Nt(e),y=Bt(e),N=Rt(e),o=N||y||"Ofertë",u=e.isLiked===!0||e.liked===!0||e.favorite===!0||e.favorited===!0;return`
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
          src="${a(f)}"
          alt="${a(`${i} Bild 1`)}"
          loading="lazy"
          class="w-full h-full object-cover transition-all duration-500 bg-slate-100"
        />
        <div class="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-black/25 to-transparent pointer-events-none"></div>

        ${l.length>1?`
          <button
            type="button"
            data-travel-hotel-image-nav="prev"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="left:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Vorheriges Bild"
          >
            ${n("chevron-left","w-4 h-4")}
          </button>

          <button
            type="button"
            data-travel-hotel-image-nav="next"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-sm transition-all active:scale-90 cursor-pointer"
            style="right:0.75rem;top:50%;transform:translateY(-50%);z-index:20;"
            aria-label="Naechstes Bild"
          >
            ${n("chevron-right","w-4 h-4")}
          </button>

          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            ${l.map((d,h)=>`
              <button
                type="button"
                data-travel-hotel-dot="${h}"
                data-travel-hotel-image-src="${a(d)}"
                class="${h===0?"w-[18px] bg-white shadow-sm":"w-1.5 bg-white/60"} h-1.5 rounded-full transition-all duration-300"
                aria-label="Hotelbild ${h+1}"
              ></button>
            `).join("")}
          </div>
        `:`
          <span data-travel-hotel-dot="0" data-travel-hotel-image-src="${a(f)}" class="hidden"></span>
        `}

        <div
          class="absolute top-3.5 left-3.5 bg-red-600 text-white shadow-md px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase z-10 border border-red-500"
          style="position:absolute;top:0.875rem;left:0.875rem;z-index:25;display:inline-flex;align-items:center;justify-content:center;background:#dc2626;color:#fff;border:1px solid #ef4444;border-radius:9999px;padding:0.25rem 0.75rem;font-size:10px;line-height:1rem;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;box-shadow:0 4px 6px -1px rgba(15,23,42,0.18),0 2px 4px -2px rgba(15,23,42,0.18);"
        >
          <span>${a(y)}</span>
        </div>

        <div class="absolute top-3 right-3 flex gap-1.5 z-10" style="position:absolute;top:0.75rem;right:0.75rem;z-index:30;display:flex;gap:0.375rem;">
          <button
            type="button"
            data-marketplace-open-map="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 shadow-sm cursor-pointer"
            title="Auf Karte anzeigen"
            aria-label="Auf Karte anzeigen"
          >
            ${n("map","w-3.5 h-3.5")}
          </button>
          <button
            type="button"
            data-travel-hotel-like="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all active:scale-95 shadow-sm cursor-pointer"
            aria-label="Zu Favoriten hinzufuegen"
          >
            ${n("heart",`w-4 h-4 ${u?"fill-rose-500 text-rose-500":"text-slate-600"}`)}
          </button>
          <button
            type="button"
            data-travel-hotel-share="${a(r)}"
            class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all active:scale-95 shadow-sm cursor-pointer"
            title="Teilen"
            aria-label="Teilen"
          >
            ${n("share-2","w-3.5 h-3.5")}
          </button>
        </div>
      </div>

      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${H(b,`${i} Logo`,{...t,extraClass:"rounded-full"})}
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1.5 mb-2" style="margin-bottom:0.5rem;">
            <div class="flex text-amber-500">
              ${n("star","w-3.5 h-3.5 fill-amber-500 text-amber-500")}
            </div>
            <span class="text-[11px] font-bold text-slate-800">${a(x)}</span>
            <span class="text-[11px] text-slate-400">(${a(String(g))} vlerësime)</span>
          </div>
          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${a(i)}</h2>
          <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-2 flex items-center gap-1.5" style="margin-top:0.5rem;color:#d97706;">
            ${n("map-pin","w-3 h-3 text-amber-600 shrink-0")}
            <span>${a(k)}</span>
          </p>
        </div>

        <hr class="border-slate-100" />

        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-center gap-3">
            ${s("navigation","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600 font-semibold">${a(I||"Qendra mungon")}</span>
          </div>
          <div class="flex items-center gap-3">
            ${s("waves","w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600 font-semibold">${a(w||"Plazhi mungon")}</span>
          </div>
        </div>

        ${z.length?`
          <div class="flex flex-wrap gap-1.5 pt-0.5">
            ${z.map(d=>Je(d,t,"text-[9px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100/80")).join("")}
          </div>
        `:""}

        <hr class="border-slate-100" />

        <div class="flex items-center justify-between mt-0.5 gap-4">
          <div class="flex flex-col min-w-0">
            <span class="text-[9px] uppercase tracking-wider text-rose-600 font-black">${a(o)}</span>
            <div class="flex items-baseline gap-0.5">
              ${m?`
                <span class="text-xl font-black text-slate-900 leading-none">${a(m)}€</span>
                <span class="text-[9px] text-slate-400 font-bold ml-1 uppercase">${a(j)}</span>
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
            aria-label="Schliessen"
          >
            ${n("x","w-3.5 h-3.5")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 no-scrollbar">
          <div class="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div class="w-10 h-10 rounded-full border border-slate-100 shadow-sm overflow-hidden bg-white shrink-0">
              ${H(b,`${i} Logo`,{...t,extraClass:"rounded-full"})}
            </div>
            <div class="min-w-0">
              <h3 class="font-extrabold text-xs text-slate-900 truncate">${a(i)}</h3>
              <p class="text-[9px] text-amber-600 font-semibold uppercase truncate">${a(k)}</p>
            </div>
          </div>

          <div class="text-[11px] text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <p class="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider mb-1">Përshkrimi (Beschreibung)</p>
            ${a(p)}
          </div>

          ${L.length?`
            <div class="flex flex-col gap-2">
              <h4 class="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Çfarë përfshihet (Inklusive):</h4>
              <div class="flex flex-col gap-1.5 pl-1">
                ${L.map(d=>`
                  <div class="flex items-start gap-2 text-[10px] text-slate-700">
                    ${n("check-circle-2","w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5")}
                    <span>${a(d)}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          `:""}

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mt-1">
            <h4 class="text-[10px] font-extrabold uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-1">
              ${n("calendar","w-3.5 h-3.5 text-rose-500")}
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
                ${n("send","w-3 h-3")}
                Dërgo Kërkesën (Anfrage senden)
              </button>
            </form>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-2 gap-3">
          <div class="flex flex-col min-w-0">
            <span class="text-[8px] uppercase tracking-wider text-slate-400 font-bold">${j==="Totali"?"Total":"Total për person"}</span>
            <span class="text-sm font-black text-slate-900 truncate">${m?`${a(m)} €`:"Preis folgt"}${N?` (${a(N)})`:""}</span>
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
  `}function ya(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],a=new Set;return t.filter(n=>n&&typeof n=="object"&&n.active!==!1).filter((n,s)=>{const i=c(n.id||n.offerId||n._id||`idx_${s}`);return a.has(i)?!1:(a.add(i),!0)})}function wa(e={}){return[...E(e.features),...E(e.offerFeatures),...E(e.hotelFeatures),c(e.hotelFeatureOneText),c(e.hotelFeatureTwoText),c(e.hotelFeatureThreeText)].filter(Boolean).filter((t,a,n)=>n.indexOf(t)===a)}function ja(e={},t={},a=0){const n=wa(t),s=Qe(t),i=c(t.imageUrl||t.offerImageUrl||t.titleImageUrl||t.coverImageUrl||""),r=c(t.id||t.offerId||t._id||`offer_${a}`);return{...e,__travelOffer:!0,__travelOfferId:r,offerId:r,offerTitle:c(t.title||t.name||""),offerText:c(t.text||t.description||""),offerDescription:c(t.offerDescription||t.description||t.text||""),offerDestination:c(t.offerDestination||t.destination||t.travelDestination||"")||e.offerDestination||e.destination,offerDetails:s,includedServices:s,offerBadgeLabel:c(t.offerBadgeLabel||t.travelOfferBadgeLabel||t.badgeLabel||"OFERTA"),offerDurationLabel:c(t.offerDurationLabel||t.nightsDaysLabel||t.durationLabel||""),offerImageUrl:i,titleImageUrl:i||e.titleImageUrl,coverImageUrl:i||e.coverImageUrl,offerCoverImages:i?[i]:E(t.coverImages||t.hotelCoverImages),distanceCenter:c(t.distanceCenter||t.distanceToCenter||t.centerDistance||"")||e.distanceCenter,distanceToCenter:c(t.distanceToCenter||t.distanceCenter||t.centerDistance||"")||e.distanceToCenter,centerDistance:c(t.centerDistance||t.distanceCenter||t.distanceToCenter||"")||e.centerDistance,distanceBeach:c(t.distanceBeach||t.distanceToBeach||t.beachDistance||"")||e.distanceBeach,distanceToBeach:c(t.distanceToBeach||t.distanceBeach||t.beachDistance||"")||e.distanceToBeach,beachDistance:c(t.beachDistance||t.distanceBeach||t.distanceToBeach||"")||e.beachDistance,hotelStartingPrice:c(t.hotelStartingPrice||t.startingPrice||t.priceFrom||t.fromPrice||t.bestPrice||"")||e.hotelStartingPrice,startingPrice:c(t.startingPrice||t.hotelStartingPrice||t.priceFrom||t.fromPrice||t.bestPrice||"")||e.startingPrice,priceFrom:c(t.priceFrom||t.startingPrice||t.hotelStartingPrice||"")||e.priceFrom,priceUnit:xe(t.priceUnit||t.hotelPriceUnit||t.offerPriceUnit||e.priceUnit||""),features:n.length?n:e.features}}function nt(e=[]){return(Array.isArray(e)?e:[]).flatMap(t=>ya(t).map((a,n)=>ja(t,a,n)))}function ka(e=[],t={}){const a=nt(e).slice(0,12);return a.length?`
    <div class="space-y-4">
      ${a.map(n=>xa(n,t)).join("")}
    </div>
  `:ee({emptyTitle:"Noch keine Angebote",emptyBody:"Keine passenden Hotel-Angebote gefunden.",icon:"plane"},t)}function st(e=[],t={}){return e.length?`
    <div class="space-y-4">
      ${e.map(a=>va(a,t)).join("")}
    </div>
  `:ee({emptyTitle:"Keine Hotels gefunden",emptyBody:"Keine passenden Hotels fuer dieses Reiseziel gefunden.",icon:"plane"},t)}function za(e={},t=0,a={}){const n=a.escapeHtml,s=J(e),i=B(e),r=R(e),l=V(e),f=18+t*23%58,b=22+t*17%46;return`
    <button
      type="button"
      data-marketplace-open-business="${n(r)}"
      class="absolute w-12 h-12 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center active:scale-95 transition-all"
      style="left:${f}%; top:${b}%; transform:translate(-50%,-50%); color:${Ee};"
      title="${n(`${i} - ${l}`)}"
    >
      ${a.icon("plane","w-5 h-5")}
      ${s?`<span style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">${n(`${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`)}</span>`:""}
    </button>
  `}function Oa(e=[],t={}){if(typeof t.renderMapView=="function")return t.renderMapView();const a=e.filter(n=>J(n)).slice(0,8);return e.length?`
    <div class="space-y-4">
      <div class="relative overflow-hidden border border-slate-200 bg-slate-200 shadow-sm" style="height:24rem; border-radius:2.5rem;">
        <div class="absolute inset-0" style="background:linear-gradient(135deg,#e0f7fb 0%,#dbeafe 45%,#e2e8f0 100%);"></div>
        <div class="absolute inset-0 opacity-60" style="background-image:linear-gradient(rgba(255,255,255,.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.65) 1px, transparent 1px); background-size:42px 42px;"></div>
        ${a.map((n,s)=>za(n,s,t)).join("")}
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
  `:st(e,t)}function La({state:e,dataLoaded:t,section:a,deps:n}={}){const s=Z(e,a.key,n).map(z=>oe({...z,__marketplaceType:Q(z,n)},a)),i=ba(e),r=!!i.query,l=r?s.filter(z=>Tt(z,i.query)):s.slice(0,W),f=l.slice(0,W),b=r?i.activeTab:"offers",x=t?.restaurants===!0,v=e?.__restaurantsLoading===!0||e?.__restaurantsMetaHydrating===!0,g=b!=="map"&&b!=="hotels",k=g&&nt(f).length>0,I=g&&v&&!k,w=b==="map"?Oa(f,n):b==="hotels"?st(f,n):ka(f,n);return`
    <section id="travelView" class="animate-in slide-in-from-right-10 duration-500" style="background:#f8fafc; min-height:100%;">
      ${ha({travel:i,deps:n})}
      <div id="travelBenko" data-travel-benko style="position:relative; z-index:3; margin-top:-2.5rem; border-top-left-radius:2.5rem; border-top-right-radius:2.5rem; background:#f8fafc; padding:2rem 1.5rem 6.5rem; box-shadow:0 -18px 34px -18px rgb(15 23 42 / 0.2);">
        ${ma({activeTab:b,hasDestination:r,hotelCount:l.length,deps:n})}
        <div class="mt-5">
          ${I?X(a,n):x||s.length?w:X(a,n)}
        </div>
      </div>
    </section>
  `}function $a({state:e={},dataLoaded:t=null,sectionKey:a="restaurants",escapeHtmlFn:n,iconFn:s,getOptimizedImageUrlFn:i,isPlaceholderUrlFn:r,placeholderImage:l="",normalizeRestaurantTypeFn:f,normalizeLeadTypeKeyFn:b,resolveRestaurantLogoFn:x,renderMapViewFn:v}={}){const g=se[Re(a)]||se.restaurants,k=$e(n,(m="")=>String(m||"")),I=$e(s,()=>""),w={escapeHtml:k,icon:I,getOptimizedImageUrl:i,isPlaceholderUrl:r,placeholderImage:l,resolveRestaurantLogo:x,renderMapView:v,normalizeRestaurantType:f,normalizeLeadTypeKey:b},z=t?.restaurants===!0;if(g.key==="travel")return La({state:e,dataLoaded:t,section:g,deps:w});if(g.key==="restaurants")return ga({state:e,dataLoaded:t,section:g,deps:w});if(g.key==="shopping")return ca({state:e,dataLoaded:t,section:g,deps:w});const L=Z(e,g.key,w).slice(0,W).map(m=>oe({...m,__marketplaceType:Q(m,w)},g)),p=L.slice(0,Ae);return`
    <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      ${L.length?`
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
            ${p.map(m=>Kt(m,w)).join("")}
          </div>
        </div>

        <div class="space-y-4">
          ${L.map(m=>Xt(m,w)).join("")}
        </div>
      `:z?ee(g,w):X(g,w)}
    </section>
  `}const Ta=Object.freeze(Object.defineProperty({__proto__:null,filterMarketplaceBusinessesCore:Z,renderMarketplaceViewCore:$a,resolveMarketplaceSectionForBusinessCore:De},Symbol.toStringTag,{value:"Module"})),Sa="mnyra_social_feed_viewer_location_v1",it=2,rt=Object.freeze([Object.freeze({id:"prishtina",label:"Prishtina",lat:42.6629,lng:21.1655,aliases:Object.freeze(["prishtine","prishtin"]),country:"Kosove",countryCode:"xk"}),Object.freeze({id:"prizren",label:"Prizren",lat:42.2139,lng:20.7397,aliases:Object.freeze(["prizr"]),country:"Kosove",countryCode:"xk"}),Object.freeze({id:"peja",label:"Peja",lat:42.6591,lng:20.2883,aliases:Object.freeze(["peje"]),country:"Kosove",countryCode:"xk"}),Object.freeze({id:"gjakova",label:"Gjakova",lat:42.3803,lng:20.4308,aliases:Object.freeze(["gjakove"]),country:"Kosove",countryCode:"xk"}),Object.freeze({id:"ferizaj",label:"Ferizaj",lat:42.3706,lng:21.1553,aliases:Object.freeze(["feri"]),country:"Kosove",countryCode:"xk"}),Object.freeze({id:"gjilan",label:"Gjilan",lat:42.4635,lng:21.4699,aliases:Object.freeze(["gjilani"]),country:"Kosove",countryCode:"xk"}),Object.freeze({id:"mitrovica",label:"Mitrovica",lat:42.8914,lng:20.866,aliases:Object.freeze(["mitrovice","mitro"]),country:"Kosove",countryCode:"xk"}),Object.freeze({id:"vushtrria",label:"Vushtrria",lat:42.8231,lng:20.9675,aliases:Object.freeze(["vushtrri"]),country:"Kosove",countryCode:"xk"}),Object.freeze({id:"podujeva",label:"Podujeva",lat:42.9106,lng:21.193,aliases:Object.freeze(["podujeve","podu"]),country:"Kosove",countryCode:"xk"}),Object.freeze({id:"tirana",label:"Tirana",lat:41.3275,lng:19.8187,aliases:Object.freeze(["tirane"]),country:"Shqiperi",countryCode:"al"}),Object.freeze({id:"kukes",label:"Kukes",lat:42.0769,lng:20.4219,aliases:Object.freeze(["kukes albania"]),country:"Shqiperi",countryCode:"al"}),Object.freeze({id:"smederevo",label:"Smederevo",lat:44.6644,lng:20.9276,aliases:Object.freeze(["smederevo serbia"]),country:"Serbi",countryCode:"rs"})]);function te(e,t="default"){if(!e?.dataset)return!0;const a=`restaurant${t}Bound`;return e.dataset[a]==="1"?!1:(e.dataset[a]="1",!0)}function U(e=""){return String(e||"").trim()}function de(e=""){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function re(e=""){return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s-]/g," ").replace(/\s+/g," ").trim()}function lt(e=null){const t=Number(e?.lat??e?.latitude),a=Number(e?.lng??e?.lon??e?.longitude);return!Number.isFinite(t)||!Number.isFinite(a)?null:{lat:t,lng:a}}function Ia(e={}){const t=lt(e);if(!t)return null;const a=U(e.label||e.city||"Current location"),n=U(e.city||a);return{lat:t.lat,lng:t.lng,label:a,city:n,country:U(e.country||""),countryCode:U(e.countryCode||""),source:U(e.source||"city-search"),savedAt:Date.now()}}function Ca(e=null){const t=Ia(e);if(!t)return!1;try{return globalThis?.localStorage?.setItem?.(Sa,JSON.stringify(t)),!0}catch{return!1}}function _a(e={},t=""){const a=re(t),n=[e.label,e.country,e.countryCode,...Array.isArray(e.aliases)?e.aliases:[]].map(re).filter(Boolean);if(!a)return-1;let s=-1;return n.forEach(i=>{i===a?s=Math.max(s,400):i.startsWith(a)?s=Math.max(s,260-Math.max(0,i.length-a.length)):i.includes(a)&&(s=Math.max(s,160))}),s}function Te(e="",t=6){return re(e).length<it?[]:rt.map(n=>({...n,score:_a(n,e)})).filter(n=>Number(n.score)>=0).sort((n,s)=>Number(s.score||0)-Number(n.score||0)||String(n.label||"").localeCompare(String(s.label||""))).slice(0,Math.max(1,Number(t)||6))}function Aa(e={}){return`
    <button
      type="button"
      role="option"
      aria-selected="false"
      data-restaurant-location-suggestion="${de(e.id)}"
      class="feed-location-suggestion"
    >
      <span class="feed-location-suggestion__label">${de(e.label)}</span>
      <span class="feed-location-suggestion__meta">${de(e.country||"City")}</span>
    </button>
  `}function Ea({documentObj:e,windowObj:t,renderFn:a}={}){const n=e||null;if(!n)return;const s=t||n.defaultView||globalThis,i=typeof a=="function"?a:(()=>{}),r=n.getElementById("restaurantLocationCityInput"),l=n.getElementById("restaurantLocationCitySuggestions"),f=n.getElementById("restaurantLocationStatus"),b=n.getElementById("btnRestaurantLocateMe"),x=n.getElementById("restaurantLocatePulse"),v=n.querySelector("[data-restaurant-ads-track]"),g=(p="")=>{f&&(f.textContent=U(p),f.classList.toggle("hidden",!U(p)))},k=(p=!1)=>{b instanceof HTMLButtonElement&&(b.disabled=!!p,b.classList.toggle("opacity-60",!!p),b.classList.toggle("cursor-not-allowed",!!p),b.classList.toggle("is-loading",!!p)),x&&(x.classList.toggle("opacity-100",!!p),x.classList.toggle("opacity-0",!p))},I=({clearContent:p=!0}={})=>{l&&(l.classList.remove("feed-location-suggestions--open"),l.setAttribute("aria-hidden","true"),p&&(l.innerHTML="")),r?.setAttribute?.("aria-expanded","false")},w=(p="")=>{if(!l||!r)return;const m=Te(p);if(!m.length){I({clearContent:re(p).length<it});return}l.innerHTML=m.map(Aa).join(""),l.classList.add("feed-location-suggestions--open"),l.setAttribute("aria-hidden","false"),r.setAttribute("aria-expanded","true")},z=(p={})=>{if(!Ca(p)){g("Location could not be saved.");return}I(),g(""),i()},L=(p=null)=>{p&&(r&&(r.value=p.label),z({lat:p.lat,lng:p.lng,label:p.label,city:p.label,country:p.country,countryCode:p.countryCode,source:"city-search"}))};r&&te(r,"Input")&&(r.addEventListener("input",()=>{g(""),w(r.value||"")}),r.addEventListener("focus",()=>{w(r.value||"")}),r.addEventListener("blur",()=>{s.setTimeout?.(()=>{const p=n.activeElement;p&&typeof p.closest=="function"&&p.closest("[data-restaurant-location-suggestion]")||I()},120)}),r.addEventListener("keydown",p=>{if(p.key==="Escape"){I();return}if(p.key!=="Enter")return;const m=Te(r.value||"",1)[0];m&&(p.preventDefault(),L(m))})),l&&te(l,"Suggestion")&&(l.addEventListener("pointerdown",p=>{const m=p.target;!m||typeof m.closest!="function"||m.closest("[data-restaurant-location-suggestion]")&&p.preventDefault()}),l.addEventListener("click",p=>{const m=p.target;if(!m||typeof m.closest!="function")return;const j=m.closest("[data-restaurant-location-suggestion]");if(!j)return;p.preventDefault(),p.stopPropagation();const y=U(j.getAttribute("data-restaurant-location-suggestion")||"").toLowerCase();L(rt.find(N=>N.id===y)||null)})),b&&te(b,"Locate")&&b.addEventListener("click",()=>{const p=s?.navigator?.geolocation;if(!p||typeof p.getCurrentPosition!="function"){g("Location access is not supported on this device.");return}k(!0),g("Requesting location...");const m=U(r?.value||"");p.getCurrentPosition(j=>{k(!1);const y=lt({lat:j?.coords?.latitude,lng:j?.coords?.longitude});if(!y){g("Location could not be determined.");return}z({...y,label:m||"Current location",city:m||"",source:"gps"})},j=>{k(!1);const y=Number(j?.code);g(y===1?"Location access was denied.":y===3?"Location did not load in time. Please try again.":"Location could not be determined.")},{enableHighAccuracy:!0,timeout:1e4,maximumAge:0})}),n.querySelectorAll("[data-restaurant-ads-scroll]").forEach(p=>{te(p,"AdsScroll")&&p.addEventListener("click",()=>{if(!v)return;const j=U(p.getAttribute("data-restaurant-ads-scroll"))==="left"?-1:1,y=Math.max(220,Number(v.clientWidth||0)*.7);v.scrollTo({left:Number(v.scrollLeft||0)+y*j,behavior:"smooth"})})})}const Pa="Ju lutem shkruani destinacionin e udhëtimit.",we=2,q=6,Na=28,Ba=44,ot=Object.freeze([Object.freeze({id:"prishtina",label:"Prishtina",aliases:Object.freeze(["prishtine","prishtin","pristina"]),countryLabel:"Kosovo"}),Object.freeze({id:"ferizaj",label:"Ferizaj",aliases:Object.freeze(["ferizaji","uroshevac"]),countryLabel:"Kosovo"}),Object.freeze({id:"peja",label:"Peja",aliases:Object.freeze(["peje","pec"]),countryLabel:"Kosovo"}),Object.freeze({id:"prizren",label:"Prizren",aliases:Object.freeze(["prizreni"]),countryLabel:"Kosovo"}),Object.freeze({id:"gjakova",label:"Gjakova",aliases:Object.freeze(["gjakove","djakova"]),countryLabel:"Kosovo"}),Object.freeze({id:"gjilan",label:"Gjilan",aliases:Object.freeze(["gjilani"]),countryLabel:"Kosovo"}),Object.freeze({id:"mitrovica",label:"Mitrovica",aliases:Object.freeze(["mitrovice"]),countryLabel:"Kosovo"}),Object.freeze({id:"vushtrria",label:"Vushtrria",aliases:Object.freeze(["vushtrri"]),countryLabel:"Kosovo"}),Object.freeze({id:"podujeva",label:"Podujeva",aliases:Object.freeze(["podujeve","podujevo","besiana"]),countryLabel:"Kosovo"}),Object.freeze({id:"fushe kosove",label:"Fushe Kosove",aliases:Object.freeze(["fushë kosovë","fushe kosova","fush kosove","fush kosova"]),countryLabel:"Kosovo"}),Object.freeze({id:"lipjan",label:"Lipjan",aliases:Object.freeze(["lipjani"]),countryLabel:"Kosovo"}),Object.freeze({id:"suhareka",label:"Suhareka",aliases:Object.freeze(["suhareke","theranda"]),countryLabel:"Kosovo"}),Object.freeze({id:"rahovec",label:"Rahovec",aliases:Object.freeze(["rahoveci"]),countryLabel:"Kosovo"}),Object.freeze({id:"drenas",label:"Drenas",aliases:Object.freeze(["gllogoc"]),countryLabel:"Kosovo"}),Object.freeze({id:"skenderaj",label:"Skenderaj",aliases:Object.freeze(["skenderaji"]),countryLabel:"Kosovo"}),Object.freeze({id:"malisheva",label:"Malisheva",aliases:Object.freeze(["malisheve"]),countryLabel:"Kosovo"}),Object.freeze({id:"kamenica",label:"Kamenica",aliases:Object.freeze(["kamenice","kamenica kosove"]),countryLabel:"Kosovo"}),Object.freeze({id:"decan",label:"Decan",aliases:Object.freeze(["decani"]),countryLabel:"Kosovo"}),Object.freeze({id:"istog",label:"Istog",aliases:Object.freeze(["istogu"]),countryLabel:"Kosovo"}),Object.freeze({id:"klina",label:"Klina",aliases:Object.freeze(["kline"]),countryLabel:"Kosovo"}),Object.freeze({id:"vite",label:"Viti",aliases:Object.freeze(["vitia","vite"]),countryLabel:"Kosovo"}),Object.freeze({id:"hani i elezit",label:"Hani i Elezit",aliases:Object.freeze(["hani elezit"]),countryLabel:"Kosovo"}),Object.freeze({id:"tirana",label:"Tirana",aliases:Object.freeze(["tirane"])}),Object.freeze({id:"durres",label:"Durres",aliases:Object.freeze(["durresi"])}),Object.freeze({id:"vlora",label:"Vlora",aliases:Object.freeze(["vlore"])}),Object.freeze({id:"shkoder",label:"Shkoder",aliases:Object.freeze(["shkodra"])}),Object.freeze({id:"shengjin",label:"Shengjin",aliases:Object.freeze(["shëngjin","shen gjin","shengjini"])}),Object.freeze({id:"ksamil",label:"Ksamil",aliases:Object.freeze(["ksamili"])}),Object.freeze({id:"dhermi",label:"Dhermi",aliases:Object.freeze(["dhërmi","dhermiu"])}),Object.freeze({id:"velipoje",label:"Velipoje",aliases:Object.freeze(["velipojë","velipoja"])}),Object.freeze({id:"theth",label:"Theth",aliases:Object.freeze(["thethi"])}),Object.freeze({id:"valbone",label:"Valbone",aliases:Object.freeze(["valbonë","valbona"])}),Object.freeze({id:"elbasan",label:"Elbasan",aliases:Object.freeze(["elbasani"])}),Object.freeze({id:"fier",label:"Fier",aliases:Object.freeze(["fieri"])}),Object.freeze({id:"korce",label:"Korce",aliases:Object.freeze(["korca"])}),Object.freeze({id:"sarande",label:"Sarande",aliases:Object.freeze(["saranda"])}),Object.freeze({id:"berat",label:"Berat",aliases:Object.freeze(["berati"])}),Object.freeze({id:"gjirokaster",label:"Gjirokaster",aliases:Object.freeze(["gjirokastra"])}),Object.freeze({id:"kukes",label:"Kukes",aliases:Object.freeze(["kukesi"])}),Object.freeze({id:"lezhe",label:"Lezhe",aliases:Object.freeze(["lezha"])}),Object.freeze({id:"pogradec",label:"Pogradec",aliases:Object.freeze(["pogradeci"])}),Object.freeze({id:"kruje",label:"Kruje",aliases:Object.freeze(["kruja"])}),Object.freeze({id:"fushe kruje",label:"Fushe Kruje",aliases:Object.freeze(["fushë krujë","fushe-kruje","fush kruje"])}),Object.freeze({id:"lushnje",label:"Lushnje",aliases:Object.freeze(["lushnja"])}),Object.freeze({id:"himare",label:"Himare",aliases:Object.freeze(["himarë","himara"])}),Object.freeze({id:"kavaje",label:"Kavaje",aliases:Object.freeze(["kavajë","kavaja"])}),Object.freeze({id:"kamze",label:"Kamze",aliases:Object.freeze(["kamëz","kamza"])}),Object.freeze({id:"vore",label:"Vore",aliases:Object.freeze(["vorë","vora"])}),Object.freeze({id:"divjake",label:"Divjake",aliases:Object.freeze(["divjakë","divjaka"])}),Object.freeze({id:"permet",label:"Permet",aliases:Object.freeze(["përmet","permeti"])}),Object.freeze({id:"tepelene",label:"Tepelene",aliases:Object.freeze(["tepelenë","tepelena"])}),Object.freeze({id:"delvine",label:"Delvine",aliases:Object.freeze(["delvinë","delvina"])}),Object.freeze({id:"peshkopi",label:"Peshkopi",aliases:Object.freeze(["peshkopia","diber","dibër"])}),Object.freeze({id:"burrel",label:"Burrel",aliases:Object.freeze(["burreli","mat"])}),Object.freeze({id:"puke",label:"Puke",aliases:Object.freeze(["pukë","puka"])}),Object.freeze({id:"bajram curri",label:"Bajram Curri",aliases:Object.freeze(["bajramcurri","tropoje","tropojë"])}),Object.freeze({id:"krume",label:"Krume",aliases:Object.freeze(["krumë","has"])}),Object.freeze({id:"lac",label:"Lac",aliases:Object.freeze(["laç","kurbin"])}),Object.freeze({id:"orikum",label:"Orikum",aliases:Object.freeze(["orikumi"])}),Object.freeze({id:"golem",label:"Golem",aliases:Object.freeze(["golemi"])}),Object.freeze({id:"jale",label:"Jale",aliases:Object.freeze(["jalë","jali"])}),Object.freeze({id:"qepare",label:"Qeparo",aliases:Object.freeze(["qeparo","qeparoi"])}),Object.freeze({id:"borsh",label:"Borsh",aliases:Object.freeze(["borshi"])}),Object.freeze({id:"lukove",label:"Lukove",aliases:Object.freeze(["lukovë","lukova"])}),Object.freeze({id:"palase",label:"Palase",aliases:Object.freeze(["palasë","palasa"])}),Object.freeze({id:"drimadhe",label:"Drimadhe",aliases:Object.freeze(["drymades","drimadhes"])}),Object.freeze({id:"spille",label:"Spille",aliases:Object.freeze(["spilleja"])}),Object.freeze({id:"gjiri i lalzit",label:"Gjiri i Lalzit",aliases:Object.freeze(["lalzi","lalez","lalëz"])})]);function D(e,t="default"){if(!e?.dataset)return!0;const a=`travel${t}Bound`;return e.dataset[a]==="1"?!1:(e.dataset[a]="1",!0)}function T(e=""){return String(e||"").trim()}function pe(e=""){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function _(e=""){const t=T(e).toLowerCase();return t?t.replace(/[ëèéê]/g,"e").replace(/[çćč]/g,"c").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):""}function Ra(e=""){const t=_(e);if(!t)return[];const a=new Set([t]);return ot.forEach(n=>{const s=[n.id,n.label,...Array.isArray(n.aliases)?n.aliases:[]].map(_).filter(Boolean);s.includes(t)&&s.forEach(i=>a.add(i))}),Array.from(a)}function Ua(e=""){const t=_(e);return t?t==="hotels"?"hotel":t==="motels"?"motel":t==="unterkunft"?"accommodation":t:""}function je(e={}){return T(e.canonicalRestaurantId||e.restaurantId||e.id||e.landingRestaurantId||"")}function K(e={}){return T(e.name||e.restaurantName||e.businessName||e.displayName||"Hotel")}function Da(e={}){return T(e.place||e.locationPlace||e.locality||e.district||e.neighborhood||e.neighbourhood||e.area||e.quarter||e.cityArea||e.primaryPlace||"")}function le(e={}){const t=T(e.city||e.locationCity||e.primaryCity),a=Da(e);if(t&&a&&_(t)!==_(a))return`${t} - ${a}`;const n=T(e.address||e.location||e.primaryAddress);return t||a||T(e.country||e.region||"")||n||"Standort folgt"}function ct(e={}){return[e.type,e.customerType,e.restaurantType,e.businessProfileType,e.profileType,e.catalogMode,e.category,e.kind,e.vertical,e.leadType]}function Ha(e={}){const t=new Set(["hotel","motel","travel","hostel","resort","accommodation"]);if(ct(e).some(n=>t.has(Ua(n))))return!0;const a=[e.name,e.restaurantName,e.businessName,e.description,e.bio,e.about].map(n=>T(n).toLowerCase()).join(" ");return/\bhotel(s)?\b|\bmotel(s)?\b|\bhostel\b|\bresort\b|\baccommodation\b|\bunterkunft\b/.test(a)}function Ma(e={}){const t=[je(e),e.publicSlug,e.landingSlug,e.handle,...ct(e),e.city,e.locationCity,e.primaryCity,e.place,e.locationPlace,e.locality,e.neighborhood,e.neighbourhood,e.address,e.location,e.primaryAddress,e.country,e.region,e.district,e.name,e.restaurantName,e.businessName,e.displayName,e.description,e.bio,e.about];return Array.isArray(e.locations)&&e.locations.forEach(a=>{!a||typeof a!="object"||t.push(a.city,a.place,a.locationPlace,a.locality,a.district,a.address,a.country,a.region,a.name)}),t}function Fa(e={},t=""){const a=Ra(t);if(!a.length)return!0;const n=Ma(e).map(_).filter(Boolean).join("_");return a.some(s=>{const i=s.split("_").filter(Boolean);return n.includes(s)?!0:i.length>0&&i.every(r=>n.includes(r))})}function ut(e={}){const t=new Map,a=(n={})=>{if(!n||typeof n!="object"||!Ha(n))return;const s=je(n),i=K(n),r=le(n),l=s||`${_(i)}:${_(r)}`;if(!l)return;const f=t.get(l)||{};t.set(l,{...f,...n,id:s||f.id||""})};return(Array.isArray(e.bootstrapRestaurantPreview)?e.bootstrapRestaurantPreview:[]).forEach(a),(Array.isArray(e.restaurants)?e.restaurants:[]).forEach(a),Array.from(t.values())}function Se(e={},t=""){const a=_(t),n=_(K(e)),s=_(le(e));return a?n===a?0:n.startsWith(a)?1:s.startsWith(a)?2:n.includes(a)?3:s.includes(a)?4:5:100}function Ka(e={},t=""){const a=_(t);return a?[e.id,e.label,...Array.isArray(e.aliases)?e.aliases:[]].map(_).filter(Boolean).some(s=>s.startsWith(a)||s.includes(a)):!1}function Ie(e={},t=""){const a=_(t),n=[e.id,e.label,...Array.isArray(e.aliases)?e.aliases:[]].map(_).filter(Boolean);return n.includes(a)?0:n.some(s=>s.startsWith(a))?1:2}function qa(e="",t=q){return _(e).length<we?[]:ot.filter(n=>Ka(n,e)).sort((n,s)=>Ie(n,e)-Ie(s,e)||String(n.label||"").localeCompare(String(s.label||""))).slice(0,Math.max(1,Number(t)||q)).map(n=>({type:"city",value:T(n.label),label:T(n.label),meta:T(n.countryLabel||"Albanien")}))}function Va(e={},t="",a=q){return _(t).length<we?[]:ut(e).filter(s=>Fa(s,t)).sort((s,i)=>Se(s,t)-Se(i,t)||K(s).localeCompare(K(i))).slice(0,Math.max(1,Number(a)||q)).map(s=>{const i=K(s);return{type:"hotel",value:i||le(s),label:i,meta:le(s)}})}function Ya(e={},t="",a=q){const n=qa(t,a);return n.length?n:Va(e,t,a).slice(0,Math.max(1,Number(a)||q))}function Ga(e={}){const t=T(e.value||e.label||""),a=T(e.label||t),n=T(e.meta||(e.type==="city"?"Albanien":"Hotel"));return`
    <button
      type="button"
      role="option"
      aria-selected="false"
      data-travel-destination-suggestion="true"
      data-travel-suggestion-value="${pe(t)}"
      class="travel-destination-suggestion"
    >
      <span class="travel-destination-suggestion__label">${pe(a)}</span>
      <span class="travel-destination-suggestion__meta">${pe(n)}</span>
    </button>
  `}function Wa({documentObj:e,state:t,windowObj:a,renderFn:n}={}){const s=e||null;if(!s||!t)return;const i=a||s.defaultView||globalThis,r=typeof n=="function"?n:(()=>{});s.getElementById("restaurantLocationCityInput")&&Ea({documentObj:s,windowObj:i,renderFn:r});const l=({clearContent:o=!0}={})=>{const u=s.getElementById("travelDestinationSuggestions"),d=s.getElementById("travelDestinationInput");u&&(u.classList.remove("travel-destination-suggestions--open"),u.setAttribute("aria-hidden","true"),o&&(u.innerHTML="")),d&&d.setAttribute("aria-expanded","false")},f=(o="")=>{const u=s.getElementById("travelDestinationSuggestions"),d=s.getElementById("travelDestinationInput");if(!u||!d)return;const h=Ya(t,o);if(!h.length){l({clearContent:_(o).length<we});return}u.innerHTML=h.map(Ga).join(""),u.classList.add("travel-destination-suggestions--open"),u.setAttribute("aria-hidden","false"),d.setAttribute("aria-expanded","true")},b=()=>((!t.travelView||typeof t.travelView!="object")&&(t.travelView={}),t.travelView),x=()=>{s.querySelectorAll("[data-travel-notice]").forEach(o=>o.remove())},v=o=>{if(!o||typeof o.querySelectorAll!="function")return[];const u=[];return o.querySelectorAll("[data-travel-hotel-image-src]").forEach(d=>{const h=String(d.getAttribute("data-travel-hotel-image-src")||"").trim();h&&!u.includes(h)&&u.push(h)}),u},g=(o,u=0)=>{if(!o)return;const d=v(o);if(!d.length)return;const h=d.length,O=((Number(u)||0)%h+h)%h;o.setAttribute("data-travel-hotel-image-index",String(O));const C=o.querySelector("[data-travel-hotel-main-image]");C&&(C.setAttribute("src",d[O]),C.setAttribute("alt",`${K({name:o.getAttribute("aria-label")||""})||"Hotel"} Ansicht ${O+1}`)),o.querySelectorAll("[data-travel-hotel-dot]").forEach((S,F)=>{String(S.tagName||"").toLowerCase()==="button"&&(S.className=F===O?"w-4 bg-white shadow-sm h-1.5 rounded-full transition-all duration-300":"w-1.5 bg-white/50 h-1.5 rounded-full transition-all duration-300")})},k=o=>{const u=Number(o?.getAttribute?.("data-travel-hotel-image-index")||"0");return Number.isFinite(u)?u:0},I=async(o="")=>{const u=T(o);if(!u)return!1;const d=ut(t).find(S=>je(S)===u)||{},h=T(d.publicSlug||d.landingSlug||d.handle||""),O=T(d.canonicalPublicPath)||(h?`/${encodeURIComponent(h)}`:""),C=O&&i?.location?.origin?new URL(O,i.location.origin).href:String(i?.location?.href||"");if(!C)return!1;try{if(i?.navigator?.clipboard?.writeText)return await i.navigator.clipboard.writeText(C),!0}catch{}try{const S=s.createElement("input");S.value=C,S.setAttribute("readonly","readonly"),S.style.position="fixed",S.style.left="-9999px",S.style.opacity="0",s.body?.appendChild(S),S.select();const F=s.execCommand?.("copy")===!0;return S.remove(),F}catch{}return!1},w=(o,u="")=>{const d=o?.querySelector?.("[data-travel-offer-toast]"),h=T(u);if(!(!d||!h)){if(d.textContent=h,d.classList.remove("hidden"),d.classList.add("flex"),o.__travelOfferToastTimer)try{i.clearTimeout(o.__travelOfferToastTimer)}catch{}o.__travelOfferToastTimer=i.setTimeout?.(()=>{d.classList.add("hidden"),d.classList.remove("flex"),o.__travelOfferToastTimer=null},2500)}},z=(o,u=!1)=>{const d=o?.querySelector?.("[data-travel-offer-modal]");if(!d||(d.classList.toggle("hidden",!u),d.classList.toggle("flex",!!u),d.setAttribute("aria-hidden",u?"false":"true"),!u))return;const h=o.querySelector("[data-travel-offer-booking-form]"),O=o.querySelector("[data-travel-offer-booking-success]");h&&h.classList.remove("hidden"),O&&O.classList.add("hidden");const C=o.querySelector("[data-travel-offer-booking-name]");typeof i?.setTimeout=="function"&&i.setTimeout(()=>{try{C?.focus?.({preventScroll:!0})}catch{}},0)},L=()=>{const o=s.getElementById("travelDestinationInput");if(o){try{o.scrollIntoView({behavior:"smooth",block:"center"})}catch{o.scrollIntoView()}if(typeof o.focus=="function")try{o.focus({preventScroll:!0})}catch{o.focus()}}},p=()=>{const o=s.getElementById("travelBenko");if(o)try{o.scrollIntoView({behavior:"smooth",block:"start"})}catch{o.scrollIntoView()}},m=()=>{t.travelView={...b(),activeTab:"offers",notice:Pa},l(),r(),typeof i?.setTimeout=="function"?i.setTimeout(L,0):L()},j=({value:o="",immediateScroll:u=!0}={})=>{const d=String(o||"").trim(),h=String(b().query||"").trim();if(!d){t.travelView={...b(),query:"",activeTab:"offers",notice:""},l(),r();return}t.travelView={...b(),query:d,activeTab:"hotels",notice:""},l(),r(),(u||!h)&&(typeof i?.setTimeout=="function"?i.setTimeout(p,0):p())},y=s.getElementById("travelDestinationInput");y&&D(y,"Input")&&(y.addEventListener("input",()=>{const o=String(y.value||"");t.travelView={...b(),notice:""},x(),f(o)}),y.addEventListener("focus",()=>{f(y.value||b().query||"")}),y.addEventListener("blur",()=>{typeof i?.setTimeout=="function"?i.setTimeout(()=>{const o=s.activeElement;o&&typeof o.closest=="function"&&o.closest("[data-travel-destination-suggestion]")||l()},120):l()}),y.addEventListener("keydown",o=>{if(o.key==="Escape"){l();return}o.key==="Enter"&&(o.preventDefault(),j({value:y.value||"",immediateScroll:!0}))}));const N=s.getElementById("travelDestinationSuggestions");N&&D(N,"Suggestion")&&(N.addEventListener("pointerdown",o=>{const u=o.target;!u||typeof u.closest!="function"||u.closest("[data-travel-destination-suggestion]")&&o.preventDefault()}),N.addEventListener("click",o=>{const u=o.target;if(!u||typeof u.closest!="function")return;const d=u.closest("[data-travel-destination-suggestion]");if(!d)return;o.preventDefault(),o.stopPropagation();const h=String(d.getAttribute("data-travel-suggestion-value")||"").trim(),O=s.getElementById("travelDestinationInput");O&&(O.value=h),j({value:h,immediateScroll:!0})})),s.querySelectorAll("[data-travel-submit]").forEach(o=>{D(o,"Submit")&&o.addEventListener("click",()=>{const u=s.getElementById("travelDestinationInput"),d=String(u?.value||b().query||"");if(!d.trim()){m();return}j({value:d,immediateScroll:!0})})}),s.querySelectorAll("[data-travel-tab]").forEach(o=>{D(o,"Tab")&&o.addEventListener("click",()=>{const u=String(o.dataset.travelTab||"").trim().toLowerCase();if(!u)return;const d=String(b().query||"").trim();if((u==="hotels"||u==="map")&&!d){m();return}t.travelView={...b(),activeTab:u==="map"?"map":u==="hotels"?"hotels":"offers",notice:""},l(),r(),(u==="hotels"||u==="map")&&(typeof i?.setTimeout=="function"?i.setTimeout(p,0):p())})}),s.querySelectorAll("[data-travel-hotel-card]").forEach(o=>{if(!D(o,"HotelCard"))return;let u=!1,d=0,h=0,O=0,C=0;const S=o.querySelector("[data-travel-hotel-gallery]"),F=(P="next")=>{const $=k(o);g(o,P==="prev"?$-1:$+1)},ke=()=>{u=!1,d=0,h=0,O=0,C=0};o.querySelectorAll("[data-travel-hotel-image-nav]").forEach(P=>{P.addEventListener("click",$=>{$.preventDefault(),$.stopPropagation(),F(String(P.getAttribute("data-travel-hotel-image-nav")||"")==="prev"?"prev":"next")})}),o.querySelectorAll("[data-travel-hotel-dot]").forEach(P=>{P.addEventListener("click",$=>{$.preventDefault(),$.stopPropagation(),g(o,Number(P.getAttribute("data-travel-hotel-dot")||"0"))})}),S&&(S.addEventListener("touchstart",P=>{const $=P.touches?.[0];$&&(u=!0,d=Number($.clientX||0),h=Number($.clientY||0),O=d,C=h)},{passive:!0}),S.addEventListener("touchmove",P=>{const $=P.touches?.[0];$&&(O=Number($.clientX||0),C=Number($.clientY||0))},{passive:!0}),S.addEventListener("touchend",P=>{if(!u)return;const $=P.changedTouches?.[0];$&&(O=Number($.clientX||0),C=Number($.clientY||0));const ze=d-O,ft=Math.abs(h-C);Math.abs(ze)>=Na&&ft<=Ba&&F(ze>0?"next":"prev"),ke()},{passive:!0}),S.addEventListener("touchcancel",ke,{passive:!0}))}),s.querySelectorAll("[data-travel-hotel-like]").forEach(o=>{D(o,"HotelLike")&&o.addEventListener("click",u=>{u.preventDefault(),u.stopPropagation();const d=o.querySelector("svg");d&&(d.classList.toggle("fill-rose-500"),d.classList.toggle("text-rose-500"),d.classList.toggle("text-slate-600"))})}),s.querySelectorAll("[data-travel-hotel-share]").forEach(o=>{D(o,"HotelShare")&&o.addEventListener("click",u=>{u.preventDefault(),u.stopPropagation(),I(o.getAttribute("data-travel-hotel-share")||"").then(d=>{const h=o.closest?.("[data-travel-offer-card]");h&&w(h,d?"Angebots-Link kopiert! Ideal fuer Instagram.":"Link konnte nicht kopiert werden.")})})}),s.querySelectorAll("[data-travel-offer-card]").forEach(o=>{if(!D(o,"OfferCard"))return;o.querySelectorAll("[data-travel-offer-details]").forEach(d=>{d.addEventListener("click",h=>{h.preventDefault(),h.stopPropagation(),z(o,!0)})}),o.querySelectorAll("[data-travel-offer-close]").forEach(d=>{d.addEventListener("click",h=>{h.preventDefault(),h.stopPropagation(),z(o,!1)})});const u=o.querySelector("[data-travel-offer-booking-form]");u&&u.addEventListener("submit",d=>{d.preventDefault(),d.stopPropagation();const h=T(o.querySelector("[data-travel-offer-booking-name]")?.value||""),O=T(o.querySelector("[data-travel-offer-booking-phone]")?.value||"");if(!h||!O){w(o,"Ju lutem plotësoni të gjitha fushat.");return}const C=o.querySelector("[data-travel-offer-booking-success]");u.classList.add("hidden"),C&&C.classList.remove("hidden"),w(o,"Kërkesa u dërgua me sukses!")})})}const Za=Object.freeze(Object.defineProperty({__proto__:null,bindTravelViewEvents:Wa},Symbol.toStringTag,{value:"Module"}));function ae(e,t="default"){if(!e?.dataset)return!0;const a=`shopping${t}Bound`;return e.dataset[a]==="1"?!1:(e.dataset[a]="1",!0)}function Ce(e=""){return String(e||"").trim()}function ge(e,t=!1){const a=e.querySelector("[data-shopping-search-title]"),n=e.querySelector("[data-shopping-search-shell]"),s=e.querySelector("[data-shopping-search-toggle]"),i=e.querySelector("[data-shopping-search-panel]"),r=e.querySelector("[data-shopping-search-input]");if(a?.style&&(a.style.maxWidth=t?"0":"80%"),a?.classList.toggle("opacity-0",!!t),a?.classList.toggle("opacity-100",!t),a?.classList.toggle("pointer-events-none",!!t),n?.classList.toggle("w-full",!!t),n?.classList.toggle("w-9",!t),s?.classList.toggle("hidden",!!t),i?.classList.toggle("hidden",!t),i?.classList.toggle("flex",!!t),t&&r&&typeof r.focus=="function")try{r.focus({preventScroll:!0})}catch{r.focus()}}function be(e,t=""){const a=Ce(t).toLowerCase();e.querySelectorAll("[data-shopping-card]").forEach(n=>{const s=Ce(n.getAttribute("data-shopping-search-text")||""),i=!a||s.includes(a);n.classList.toggle("hidden",!i)})}function Xa({documentObj:e}={}){const t=e||null;if(!t)return;const a=t.querySelector("[data-shopping-view]");if(!a)return;const n=a.querySelector("[data-shopping-search-toggle]"),s=a.querySelector("[data-shopping-search-close]"),i=a.querySelector("[data-shopping-search-input]");n&&ae(n,"SearchToggle")&&n.addEventListener("click",()=>ge(a,!0)),s&&ae(s,"SearchClose")&&s.addEventListener("click",()=>{i&&(i.value=""),be(a,""),ge(a,!1)}),i&&ae(i,"SearchInput")&&(i.addEventListener("input",()=>be(a,i.value||"")),i.addEventListener("keydown",r=>{r.key==="Escape"&&(i.value="",be(a,""),ge(a,!1))})),a.querySelectorAll("[data-shopping-like]").forEach(r=>{ae(r,"Like")&&r.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation();const f=r.querySelector("svg, i");f&&(f.classList.toggle("fill-rose-500"),f.classList.toggle("text-rose-500"),f.classList.toggle("text-slate-700"))})})}const en=Object.freeze(Object.defineProperty({__proto__:null,bindShoppingViewEvents:Xa},Symbol.toStringTag,{value:"Module"}));export{Ja as c,en as s,Za as t};
