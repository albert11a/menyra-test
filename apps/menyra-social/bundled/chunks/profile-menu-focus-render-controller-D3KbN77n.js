import{e as ge,f as Ms,t as Es,g as Bs,h as _e,a as Rs}from"../entry/social-app.js";import"./startup-route-runtime-context-6Co7bthZ.js";import"./vendor-firebase-V03pMX6J.js";function Os(x={}){const d=x.state,Qt=x.resolvePostCountsFn,s=x.escapeHtmlFn,M=x.getOptimizedImageUrlFn,b=x.iconFn,Wt=x.isLocalBusinessProfileFn,Yt=typeof x.isCeoUserFn=="function"?x.isCeoUserFn:(()=>!1),nt=x.normalizeHandleFn,Ue=x.logoFitClassFn,B=x.formatCountFn,rt=x.renderProfileShopCartViewFn,it=x.renderProfileShopFavoritesViewFn,Zt=typeof x.ensurePostsDataForProfileFn=="function"?x.ensurePostsDataForProfileFn:(()=>{}),Jt=x.ensureMenuDataForProfileFn,Xt=typeof x.ensureEditorMenuDataForProfileFn=="function"?x.ensureEditorMenuDataForProfileFn:(()=>{}),me=x.ensureFocusDataForProfileFn,ea=typeof x.ensureAdsDataForProfileFn=="function"?x.ensureAdsDataForProfileFn:(()=>{}),ot=x.ensureTableQrStateForProfileFn,K=x.isShopCatalogProfileFn,ta=x.getBusinessCatalogLabelFn,se=x.normalizeMenuTypeFn,aa=x.primeMenuItemCountsFn,sa=typeof x.hydrateMenuCardViewerLikesFn=="function"?x.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),na=x.renderShopProductListFn,ra=x.getMenuLayoutThemeFn,ia=x.menuLayoutColors,Q=x.resolveMenuItemHeroFn,V=x.isPlaceholderUrlFn,N=x.placeholderImage,oa=x.getFirebaseStorageUrlFn,la=x.isDirectImageUrlFn,lt=x.formatPriceFn,da=typeof x.resolveCurrencyCodeForMenuItemFn=="function"?x.resolveCurrencyCodeForMenuItemFn:(()=>""),dt=x.getMenuItemImagesFn,q=x.getMenuItemObjectPositionFn,be=x.getMenuItemSocialIdFn,ct=x.menuItemMetaKeyFn,ut=x.ensureMenuItemMetaFn,pt=x.resolveMenuItemCountsFn,he=x.getFocusStateForRestaurantFn,ca=typeof x.getAdsStateForRestaurantFn=="function"?x.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),xe=x.getTableQrStateForRestaurantFn,le=x.getFocusItemObjectPositionFn,Me=x.getFocusCardClassFn,ua=x.getFocusIndexFn,ne=x.isRestaurantCafeProfileFn,Ee=typeof x.getBusinessProfileTypeFn=="function"?x.getBusinessProfileTypeFn:(()=>""),de=x.getRestaurantMetaByIdFn,pa=x.buildUrlFn,fa=x.normalizeSearchKeyFn,ga=x.normalizeFollowHandleFn,Z={key:"",inFlightKey:""},p=(e,t=e,a={})=>Es(e,{fallback:t,params:a}),ma=(e="")=>{const t=String(e||"").trim();if(!t)return p("nav.menu","Menue");const a=t.toLowerCase();return a==="menue"||a==="menu"||a==="menü"?p("nav.menu",t):a==="shop"?"Shop":t},ft=(e="")=>{const t=String(e||"").trim();if(!t)return"";const a=t.toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(a)?p("menu.products","Produkte"):t},ba=(e="food",t=!1)=>t?p("menu.products","Produkte"):String(e||"").trim().toLowerCase()==="drink"?p("menu.drinks","Getraenke"):p("menu.food","Speisen"),gt=(e={},t=!1)=>{const a=se(e?.type||"food");return t?p("menu.product","Produkt"):a==="drink"?p("menu.drinkItem","Getraenk"):p("menu.foodItem","Speise")},Be=(e="",t="#111827")=>{const a=String(e||"").trim();return/^#[0-9a-fA-F]{6}$/.test(a)?a:t};function ha(e=null,t=null){return ge(d,{profile:e,routePayload:t,webDirectEntry:d?.__webDirectEntry}).restaurantId}function mt(e=null,t=""){if(!e||typeof e!="object")return e;const a=String(t||"").trim();if(!a)return e;const n=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===a&&n?e:{...e,restaurantId:a,...n?{canonicalRestaurantId:n}:{}}}function xa(e=""){const t=String(e||"").trim();return t?ge(d,{profile:d?.profileView?.profile||d?.userProfile,routePayload:d?.profileView?.routePayload,webDirectEntry:d?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function ce(e={}){const t=String(da(e)||"").trim();return t?lt(e?.price,t):lt(e?.price)}function va(e=[],t="",a=""){const n=String(t||"").trim(),i=String(a||"").trim();if(!n||!i)return"";const r=Array.isArray(e)?e:[];if(!r.length)return`${n}|${i}|empty`;const o=[];return r.forEach(l=>{const c=String(be(l)||l?.id||"").trim();c&&o.push(c)}),o.length?(o.sort(),`${n}|${i}|${o.join(",")}`):`${n}|${i}|empty`}function wa(e=[],t=""){const a=String(d.user?.uid||"").trim(),n=va(e,t,a);n&&Z.inFlightKey!==n&&Z.key!==n&&(Z.key=n,Z.inFlightKey=n,sa(e,t).catch(i=>{console.error(i),Z.key===n&&(Z.key="")}).finally(()=>{Z.inFlightKey===n&&(Z.inFlightKey="")}))}function ya(e={}){const t=String(e?.uid||"").trim();if(t&&d.followingTargetIds.includes(t))return!0;const a=String(e?.restaurantId||"").trim();if(a&&d.followingTargetIds.includes(a))return!0;const n=ga(e?.handle||"");return!!(n&&d.followingHandles.includes(n))}function bt(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const a=typeof de=="function"&&de(t)||null;return a?.specialEnabled===!0?!0:(a?.specialEnabled===!1,!1)}function $a(e={}){return ee(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function ht(e,t,a=!0,{includeImageKey:n=!0}={}){const i=Qt(e),r=e.id?String(e.id):"",o=r?`data-open-post="${s(r)}"`:"",l=r?`data-post-like-count="${s(r)}"`:"",c=r?`data-post-comment-count="${s(r)}"`:"",f=n&&r?`data-img-key="profile-post:${s(r)}"`:"",u=e.type==="wide"||e.type==="hero",m=t&&u?"col-span-2":"",v=t&&u?"aspect-[1.8/1]":"aspect-[4/5]",h=M(e.url,u?"large":"medium",{stableKey:r?`profile-post:${r}`:"",variantGroup:"post-detail"}),C=u?800:400,k=u?400:500;return`
    <div ${o} role="button" tabindex="0" class="${m} relative ${v} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${s(h)}" loading="lazy" decoding="async" width="${C}" height="${k}" ${f} class="w-full h-full object-cover" />
        ${e.isVideo?`<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${b("play","w-3 h-3 fill-white")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${b("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${l} class="text-[10px] font-bold tracking-wide">${s(i.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${b("message-circle","w-3 h-3 text-indigo-200")}
                <span ${c} class="text-[10px] font-bold tracking-wide">${s(i.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${r&&a?`
        <button type="button" data-profile-menu-button="${s(r)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${b("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${s(r)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${s(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${b(u?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${u?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${s(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${b("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function Re(e,t,a=!0,{includeImageKeys:n=!0}={}){const i=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${b("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${s(p("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const r=e.map(l=>ht(l,i,a,{includeImageKey:n})),o=e.reduce((l,c)=>{const f=c?.type==="wide"||c?.type==="hero";return l+(f?2:1)},0);return i&&o%2===1&&r.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),r.join("")}function Ne(){const e=d.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const a=M(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${s(a)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${s(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${b("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${s(t.city||"Stadt")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${b("arrow-right","w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `:`
      <div class="app-content-inline app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${b("map-pin","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${s(p("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function ve(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}function we(e={}){const t=String(Ee(e)||"").trim().toLowerCase();return t==="hotel"||t==="motel"}function He(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),a=t?de(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{}}}function ka(e={},t=""){const a=e&&typeof e=="object"?e:{},n=String(a.id||a._id||a.offerId||a.menuItemId||t||"offer").trim();return{...a,id:n,menuItemId:String(a.menuItemId||a.targetMenuItemId||a.itemId||a.targetItemId||"").trim(),title:a.title||a.name||"Oferta",text:a.text||a.desc||a.description||"",imageUrl:a.imageUrl||a.image||a.photoUrl||"",active:a.active!==!1}}function Sa(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],a=new Set;return t.map((n,i)=>ka(n,`offer_${i}`)).filter(n=>{const i=String(n.id||`${n.title}|${n.text}|${n.imageUrl}`).trim();return!i||a.has(i)?!1:(a.add(i),!0)})}function Ia(e={}){const t=He(e),a=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!a)return!1;const n=d.focus&&typeof d.focus=="object"?d.focus:{},i=String(n.restaurantId||"").trim()===a,r=String(n.truthSource||"").trim().toLowerCase();if(i&&r==="public-menu"||(i&&Array.isArray(n.items)?n.items:[]).length)return!1;const l=Sa(t);return l.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(d.focus={...n,restaurantId:a,items:l,enabled:n.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:l.length?"seeded":"knownEmpty"},!0):!1}function Ca(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const a of t){if(!a||typeof a!="object")continue;const n=Number(a.lat??a.latitude),i=Number(a.lng??a.lon??a.longitude);if(Number.isFinite(n)&&Number.isFinite(i))return{lat:n,lng:i}}return null}function D(e={},t=[]){for(const a of t){const n=String(e?.[a]||"").trim();if(n)return n}return""}function ye(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function Pa(e={}){const t=[...ye(e.coverImages),...ye(e.hotelCoverImages),...ye(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(n=>String(n||"").trim()).filter(Boolean),a=[];return t.forEach(n=>{a.includes(n)||a.push(n)}),a.slice(0,8)}function Fa(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function ja(e=""){const t=String(e||"").trim(),a=d.hotelCardEditor&&typeof d.hotelCardEditor=="object"?d.hotelCardEditor:{},n=String(a.restaurantId||"").trim();return n?n===t?a:{}:Fa(a)?{}:a}function Aa(e={}){const t=Array.isArray(e.features)?e.features.map(n=>String(n||"").trim()).filter(Boolean):[],a=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[D(e,["hotelFeatureOneText","gardenTerraceText"])||String(a.gardenTerrace||"").trim()||t[0]||"",D(e,["hotelFeatureTwoText","accessibilityText"])||String(a.accessibility||"").trim()||t[1]||"",D(e,["hotelFeatureThreeText","veganOptionsText"])||String(a.veganOptions||"").trim()||t[2]||""]}function La(e={}){const t=[],a=(n="")=>{const i=String(n||"").trim();i&&!t.includes(i)&&t.push(i)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(n=>{Array.isArray(n)&&n.forEach(i=>{typeof i=="string"?a(i):i&&typeof i=="object"&&a(i.label||i.name||i.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&a("Në plazh"),(e.restaurant||e.hasRestaurant)&&a("Restaurant"),(e.breakfast||e.breakfastIncluded)&&a("Mëngjes"),(e.pool||e.hasPool)&&a("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&a("WLAN"),(e.parking||e.freeParking||e.hasParking)&&a("Parking"),(e.spa||e.wellness)&&a("Wellness"),t.slice(0,8)}const Ta=[{value:"m",label:"m"},{value:"km",label:"km"}],za="Në qendër",xt="Në plazh",_a=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],Ua=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],Ma=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function J(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function Ea(e="",{direct:t=!1}={}){const a=String(e||"").trim(),n=J(a),i=t||n==="ne_qender"||n==="ne_plazh"||n==="direkt_ne_qender"||n==="direkt_ne_plazh"||n.includes("direkt")&&(n.includes("strand")||n.includes("zentrum")||n.includes("center"))||n.includes("am_strand")||n.includes("im_zentrum"),r=a.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),o=r?r[1].replace(",","."):"",c=(r?String(r[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:o,unit:c,isDirect:i}}function vt({idPrefix:e="",iconName:t="navigation",label:a="",value:n="",directLabel:i="",direct:r=!1}={}){const o=Ea(n,{direct:r});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${b(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${s(a)}</p>
          <p class="text-[10px] font-bold text-slate-400">${s(i)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${s(e)}Value" type="number" min="0" step="0.1" value="${s(o.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${s(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${Ta.map(l=>`<option value="${s(l.value)}" ${o.unit===l.value?"selected":""}>${s(l.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${s(i)}</span>
        <input id="${s(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${o.isDirect?"checked":""} />
      </label>
    </div>
  `}function Ba(e=[],t=""){const a=String(t||"").trim(),n=new Set(e.map(J));return`
    <option value="">Zgjidh</option>
    ${e.map(i=>`<option value="${s(i)}" ${J(i)===J(a)?"selected":""}>${s(i)}</option>`).join("")}
    ${a&&!n.has(J(a))?`<option value="${s(a)}" selected>Aktuale: ${s(a)}</option>`:""}
  `}function De({id:e="",iconName:t="badge-check",label:a="",value:n="",options:i=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${b(t,"w-4 h-4")}
        </div>
        <label for="${s(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${s(a)}</label>
      </div>
      <select id="${s(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${Ba(i,n)}
      </select>
    </div>
  `}function Ra(e={},t=[]){const a=new Set(t.map(J).filter(Boolean)),n=[],i=(r="")=>{const o=String(r||"").trim();if(!o)return;const l=J(o);a.has(l)||n.some(c=>J(c)===l)||n.push(o)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(r=>ye(r).forEach(i)),n}function Na({existingImages:e=[],newPreviews:t=[],imageUrlDraft:a=""}={}){const n=[...t.map((o,l)=>({src:o,kind:"new",idx:l})),...e.map((o,l)=>({src:o,kind:"existing",idx:l}))].filter(o=>o.src),i=n[0]?.src||a||"",r=i?M(i,"large"):N;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${s(r||N)}" class="w-full h-52 object-cover bg-white" />
        <button type="button" id="hotelCardCoverImagesTrigger" aria-label="Ngarko foto" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${b("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${b("plus","w-2.5 h-2.5")}
          </span>
        </button>
      </div>

      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Fotot</p>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${n.length}</span>
        </div>
        ${n.length?`
          <div class="grid grid-cols-3 gap-2">
            ${n.map(o=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                ${o.kind==="existing"?`<span data-hotel-card-existing-image="${s(o.src)}" hidden></span>`:""}
                <img src="${s(M(o.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-hotel-card-image-remove="${o.idx}" data-hotel-card-image-source="${o.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${b("x","w-3 h-3")}
                </button>
              </div>
            `).join("")}
          </div>
        `:`
          <div class="h-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">
            Pa foto
          </div>
        `}
      </div>

      <input id="hotelCardCoverImageUrl" type="hidden" value="${s(a)}" />
    </div>
  `}function $e({iconName:e="info",label:t="",value:a="",helper:n=""}={}){return`
    <div class="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm">
      <div class="flex items-start gap-4">
        <div class="w-11 h-11 rounded-[1.25rem] bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          ${b(e,"w-5 h-5")}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">${s(t)}</p>
          <p class="text-sm font-black text-slate-900 leading-snug">${s(a||"Shto detajet")}</p>
          ${n?`<p class="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">${s(n)}</p>`:""}
        </div>
      </div>
    </div>
  `}function wt(e={}){const t=He(e),a=Ca(t),n=D(t,["address","primaryAddress","location","formattedAddress","street"]),i=D(t,["city","locationCity","primaryCity","region","country"]),r=D(t,["beachDistance","distanceToBeach","beachDistanceLabel","strandEntfernung"]),o=D(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),l=D(t,["rating","reviewRating","stars","hotelStars"]),c=D(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),f=La(t),u=a?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.lat},${a.lng}`)}`:n||i?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${n} ${i}`.trim())}`:"";return`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm overflow-hidden">
        <div class="h-40 rounded-[1.6rem] bg-cyan-50 border border-cyan-100 relative overflow-hidden mb-4">
          <div class="absolute inset-0 opacity-80" style="background-image: linear-gradient(135deg, rgba(0,204,229,0.18), rgba(15,23,42,0.04));"></div>
          <div class="absolute inset-0 flex items-center justify-center text-cyan-600">
            ${b("map-pin","w-10 h-10")}
          </div>
          <div class="absolute left-4 right-4 bottom-4 bg-white/90 backdrop-blur rounded-2xl p-3 border border-white/70">
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Lokacioni</p>
            <p class="text-xs font-black text-slate-900 leading-snug">${s(n||i||"Shto lokacionin")}</p>
          </div>
        </div>
        ${u?`
          <a href="${s(u)}" target="_blank" rel="noopener noreferrer" class="w-full h-12 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            ${b("navigation","w-4 h-4")} Hap hartën
          </a>
        `:""}
      </div>

      <div class="grid grid-cols-1 gap-4">
        ${$e({iconName:"map-pin",label:"Adresa",value:[n,i].filter(Boolean).join(", ")||"Shto lokacionin",helper:a?`${a.lat.toFixed(5)}, ${a.lng.toFixed(5)}`:""})}
        ${$e({iconName:"navigation",label:"Qendra",value:o||"Shto detajet"})}
        ${$e({iconName:"waves",label:"Plazhi",value:r||(t.beachfront||t.onBeach?xt:"Shto detajet")})}
        ${$e({iconName:"star",label:"Vlerësime",value:l?`${l}${c?` / ${c} vlerësime`:""}`:"Pa vlerësime",helper:D(t,["reviewSummary","ratingSummary","commentsSummary"])})}
      </div>

      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Të përfshira</p>
        ${f.length?`
          <div class="flex flex-wrap gap-2">
            ${f.map(m=>`<span class="px-3 py-2 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600">${s(m)}</span>`).join("")}
          </div>
        `:`
          <p class="text-sm font-bold text-slate-400">Shto pajisjet dhe detajet e dhomave.</p>
        `}
      </div>
    </div>
  `}function Ha(e={}){const t=He(e),a=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),n=t?.name||t?.restaurantName||e?.name||"Hotel",i=ja(a),r=String(i.status||"").trim(),o=i.saving===!0,l=Array.isArray(i.existingImages)?i.existingImages.map(z=>String(z||"").trim()).filter(Boolean):Pa(t),c=Array.isArray(i.imagePreviews)?i.imagePreviews.map(z=>String(z||"").trim()).filter(Boolean):[],f=String(i.imageUrlDraft||"").trim(),[u,m,v]=Aa(t),h=Ra(t,[u,m,v]),C=D(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),k=D(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),$=D(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),j=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,y=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,S=i.detailsOpen===!0||o,A=c[0]||l[0]||"",P=A?M(A,"thumb"):N,_=[C,k,$?`${$} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",w=r.includes("fehl")||r.includes("Bitte")||r.includes("Nuk");return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel Card</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(n)}</p>
        </div>
      </div>

      ${a?`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
              <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hotel & Ofertat</p>
            </div>
            <button type="button" data-hotel-card-details-open aria-expanded="${S?"true":"false"}" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
              ${b("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${S?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${s(P||N)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${s(n)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(_)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${S?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${b("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${r&&!S?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${w?"text-rose-500":"text-slate-500"}">${s(r)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${s(a)}" data-hotel-card-details-panel class="${S?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
                <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              </div>
              <button type="button" data-hotel-card-details-close class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                ${b("x","w-4 h-4")}
              </button>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fotot</p>
              ${Na({existingImages:l,newPreviews:c,imageUrlDraft:f})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${vt({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:C,directLabel:za,direct:j})}
              ${vt({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:k,directLabel:xt,direct:y})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${s($)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${De({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:u,options:_a})}
              ${De({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:m,options:Ua})}
              ${De({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:v,options:Ma})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${s(h.join(`
`))}</textarea>
              </div>
            </div>

            ${r?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${w?"text-rose-500":"text-slate-500"}">${s(r)}</div>`:""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${o?"disabled":""}>
              ${o?"Po ruhet...":"Ruaj Hotel Details"}
            </button>
        </div>
        ${Xe(a,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function ke(e={}){const t=String(d.profileTopTab||"").trim().toLowerCase(),a=String(d.profileContentTab||"").trim().toLowerCase();return ve(e)?t==="menu"?"menu":a==="menu"||a==="posts"?a:"posts":a==="media"||a==="checkins"?a:"posts"}function Oe(e={}){const t=String(d.profileTopTab||"").trim().toLowerCase();return ve(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(d.user?.uid||"").trim()?"favorites":"profile"}function yt(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function Da(e=0,t=1){const a=Math.max(1,Number(t||0)||1),n=Math.round(Number(e||0));if(!Number.isFinite(n))return 0;const i=n%a;return i<0?i+a:i}function Oa(e=0){return yt(e)}function Va(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],a=yt(d.profileLandingStep),n=Da(d.profileLandingGreetingIndex,t.length),i=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},r=String(i.businessName||e.name||"casarita").trim()||"casarita",o=Be(i.businessNameColor||e.businessNameColor||e.landingBusinessNameColor||"","#111827"),l=o&&o.toLowerCase()!=="#111827"?o:"",c=Be(i.businessNameColorPart1||e.businessNameColorPart1||e.landingBusinessNameColorPart1||o||"","#111827"),f=Be(i.businessNameColorPart2||e.businessNameColorPart2||e.landingBusinessNameColorPart2||l||"","#4f46e5"),u=r.replace(/\.+$/g,"").trim()||r,m=u.split(/\s+/).filter(Boolean),v=m.length>1?m.slice(0,-1).join(" "):u,h=m.length>1?m[m.length-1]:"",C=h?v:`${v}.`,k=h?`${h}.`:"",$=M(i.logoUrl||e.avatar||"","avatar"),y=String($||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",S=String(i.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),A=String(i.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),P=a>=2,_=a>=3,w=Array.isArray(d.profileView?.posts)?d.profileView.posts:Array.isArray(e?.posts)?e.posts:[],z=Oa(a),H=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${b("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(T=>{const g=z===T;return`
            <div data-landing-step-dot="${T}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${g?"1.22":"1"}); opacity: ${g?"1":"0.88"}; background: ${g?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${g?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${g?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${a===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${a===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((T,g)=>{const F=g===n,L=g===(n-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${g}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${F?"opacity: 1; transform: translateY(0) scale(1);":L?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!F&&!L?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${s(T)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${s(y)}" alt="${s(`${r} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${s(c)};">${s(C)}</span>${k?`<span style="color:${s(f)};">${s(k)}</span>`:""}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${s(S)}<br />
            ${s(A)}
          </p>
        </div>
        ${H}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${a<1?"translate-y-full":a===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===1?"1":"0"}; pointer-events: ${a===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${Ce(e,w,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${H}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${a<2?"translate-y-full":a===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===2?"1":"0"}; pointer-events: ${a===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${P?Ce(e,w,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${H}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${a<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${a===3?"1":"0"}; pointer-events: ${a===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${_?Ce(e,w,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function Ve(e=d.profileView?.profile||d.userProfile,{landingPreview:t=!1,selectedTabOverride:a="",compact:n=!1}={}){const i=ve(e),r=String(a||ke(e)).trim().toLowerCase()||"posts",o=we(e),l=K(e),c=o?"Details":l?"Shop":p("nav.menu","Menue"),f=i?[{id:"posts",label:p("profile.posts","Beitraege")},{id:"menu",label:c,surface:o?"hotel-details":"menu"}]:[{id:"posts",label:p("profile.posts","Beitraege")},{id:"media",label:p("profile.media","Medien")},{id:"checkins",label:p("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${n?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${f.map(u=>`
          <button data-profile-tab="${u.id}" ${u.surface?`data-profile-tab-surface="${s(u.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${r===u.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${u.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function Ke(e=d.profileView?.profile||d.userProfile,{disabled:t=!1}={}){const a=ke(e);return a==="checkins"||a==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${s(p("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${d.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${b("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${d.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${b("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function R(e=""){return String(e||"").trim()}const $t="mnyra_business_title_image_cache_v1",kt=80;function St(){if(!d)return{};const e=d.businessTitleImageCache&&typeof d.businessTitleImageCache=="object"?d.businessTitleImageCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const n=(typeof window<"u"?window.localStorage:null)?.getItem?.($t)||"",i=n?JSON.parse(n):{};i&&typeof i=="object"&&Object.entries(i).forEach(([r,o])=>{const l=R(r),c=R(o);l&&c&&!V(c)&&(t[l]=c)})}catch{}return d.businessTitleImageCache={loaded:!0,items:t},t}function Ka(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem($t,JSON.stringify(e))}catch{}}function qa(e={},t="business"){const a=[e?.restaurantId,e?.canonicalRestaurantId,e?.uid,e?.handle,e?.publicSlug,e?.landingSlug,e?.name,t].map(n=>R(n)).filter(Boolean);return[...new Set(a)]}function Ga(e=[],t=""){const a=R(t);if(!a||V(a))return;const n=St();let i=!1;e.forEach(o=>{const l=R(o);!l||n[l]===a||(n[l]=a,i=!0)});const r=Object.entries(n);if(r.length>kt){const o=r.slice(r.length-kt);Object.keys(n).forEach(l=>delete n[l]),o.forEach(([l,c])=>{n[l]=c}),i=!0}i&&Ka(n)}function Qa(e=[]){const t=St();for(const a of e){const n=R(a),i=n?R(t[n]):"";if(i&&!V(i))return i}return""}function Wa(e={},t="business"){return String(e?.restaurantId||e?.canonicalRestaurantId||e?.uid||e?.handle||e?.name||t).trim()||t}function Ya(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.id||e?.landingRestaurantId||e?.documentId||"").trim()}function Za(e={}){const a=(Array.isArray(e?.coverImages)?e.coverImages:Array.isArray(e?.titleImages)?e.titleImages:[]).map(n=>String(n||"").trim()).find(Boolean)||"";return String(e?.titleImageUrl||e?.coverImageUrl||e?.coverUrl||e?.heroUrl||a||"").trim()}function Ja(e={},t={}){const a=Za(e),n=Array.isArray(t.cacheKeys)?t.cacheKeys:[],i=R(t.stableKey||n[0]||"");if(!a){if(t.allowCacheFallback===!0){const o=Qa(n);if(o)return o;const l=i?M("","medium",{stableKey:i}):"";return l&&!V(l)?l:""}return""}const r=M(a,"medium",i?{stableKey:i}:void 0);return r&&!V(r)?(Ga(n,r),r):""}function It(e="",t=""){const a=R(e);if(!a)return"";if(/^https?:\/\//i.test(a))return a;const n=a.replace(/^@+/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/^tiktok\.com\/@?/i,"").replace(/^www\.tiktok\.com\/@?/i,"").replace(/^\/+/,"").trim();return n?t==="tiktok"?`https://www.tiktok.com/@${encodeURIComponent(n)}`:t==="instagram"?`https://www.instagram.com/${encodeURIComponent(n)}`:"":""}function Xa(e=""){const t=R(e);if(!t)return"";const a=t.replace(/[^\d+]/g,"");return a?`tel:${a}`:""}function es(e={}){const t=Number(e?.gpsLat??e?.lat),a=Number(e?.gpsLng??e?.lng);if(Number.isFinite(t)&&Number.isFinite(a))return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t},${a}`)}`;const n=[e?.address,e?.locationPlace||e?.place,e?.location,e?.city,e?.country].map(i=>R(i)).filter(Boolean).join(", ");return n?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(n)}`:""}function Se({href:e="",label:t="",iconName:a="",body:n="",buttonAttrs:i=""}={}){const r=R(e),o=String(i||"").trim();if(!r&&!o)return"";const l=n||b(a,"w-4 h-4"),c="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform";return o?`
    <button type="button" ${o} title="${s(t)}" aria-label="${s(t)}" class="${c}">
      ${l}
    </button>
  `:`
    <a href="${s(r)}" target="_blank" rel="noreferrer" title="${s(t)}" class="${c}">
      ${l}
    </a>
  `}function Ie({href:e="",buttonAttrs:t="",iconName:a="",eyebrow:n="",value:i=""}={}){const r=R(i);if(!r)return"";const o=`
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${b(a,"w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${s(n)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s(r)}</span>
    </div>
  `;return e?`<a href="${s(e)}" target="${e.startsWith("tel:")?"_self":"_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${o}</a>`:`<button type="button" ${t} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${o}</button>`}function ts({profileName:e="",safeBio:t="",metaLine:a="",identityPending:n=!1,followersLabel:i=""}={}){return`
    <div aria-hidden="true" style="grid-area:1/1;visibility:hidden;pointer-events:none;min-width:0;max-width:100%;overflow:hidden;">
      <div class="h-40 w-full"></div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div class="relative">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px]"></div>
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl text-slate-900 leading-none mb-1">${s(String(i))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <div class="flex flex-col items-center min-w-0">
              <span class="h-7 flex items-center justify-center text-slate-900"></span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.info","Info"))}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${t}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(a)}</p>
          ${n?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${s(p("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-[56px] rounded-[1.2rem]"></div>
          <div class="w-[56px] h-[56px] rounded-[1.2rem]"></div>
        </div>
      </div>
    </div>
  `}function Ct(e={},t={}){const a=t.mode==="self"?"self":"public",n=t.disabledBlockClass||"",i=t.avatarUrl||M(e.avatar||"","avatar"),r=t.avatarFit||Ue(!!e.restaurantId),o=Wa(e,a),l=String(d?.profileCardInfoOpen||"")===o,c=Number(d?.profileCardInfoHeights?.[o]||0),f=l&&Number.isFinite(c)&&c>0?`height:${Math.ceil(c)}px;`:"",u=t.avatarImgKeyAttr||(a==="self"?'data-img-key="avatar:self"':`data-img-key="avatar:public:${s(o)}"`),m=t.renderAvatarImage!==!1&&!!String(i||"").trim()&&!!String(e?.avatar||"").trim(),v=!!t.identityPending,h=t.followersLabel??B(e.followers),C=R(e?.name)||"User",k=R(t.typeLabel||e?.customerType||e?.type||"Business"),$=R(e?.location||"-"),j=a==="public"?`${$} / ${k}`:$,y=t.bioHtml||s(e?.bio||"").replace(/\n/g,"<br>")||s(p("profile.noBio","Noch keine Bio.")),S=`business-cover:${o}`,A=qa(e,o),P=Ja(e,{cacheKeys:A,stableKey:S,allowCacheFallback:t.allowTitleImageCacheFallback===!0}),_=es(e),w=Ya(e),z=Se(w?{buttonAttrs:`data-marketplace-open-map="${s(w)}"`,label:p("profile.openMap","Karte oeffnen"),iconName:"map"}:{href:_,label:p("profile.openMap","Karte oeffnen"),iconName:"map"}),H=It(e?.instagramUrl||e?.instagram||e?.insta||"","instagram"),T=It(e?.tiktokUrl||e?.tiktok||e?.tikTok||"","tiktok"),g=R(e?.phone||e?.telephone||e?.contactPhone||""),F=Xa(g),L=R(e?.address||e?.locationLabel||[e?.place||e?.locationPlace,e?.location||e?.city].map(O=>R(O)).filter(Boolean).join(", ")),U=[Ie({href:H,iconName:"instagram",eyebrow:"Instagram",value:e?.instagram||e?.instagramUrl||e?.insta||""}),Ie({href:T,iconName:"music-2",eyebrow:"TikTok",value:e?.tiktok||e?.tiktokUrl||e?.tikTok||""})].filter(Boolean).join(""),E=a==="self"?`
      <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
        <span class="relative z-10 flex items-center gap-2">${b("plus","w-4 h-4")} Status</span>
        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
      <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${b("settings","w-5 h-5")}
      </button>
    `:`
      <button data-landing-tutorial-target="follow" data-public-profile-follow="${s(e.handle||"")}" data-target-type="${s(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${s(e.restaurantId||e.uid||"")}" data-target-name="${s(e.name||"")}" data-target-avatar="${s(e.avatar||"")}" ${t.hasPendingFollowRequest?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${t.followTone||"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"} ${t.hasPendingFollowRequest?"opacity-90 cursor-default":""}">
        <span class="relative z-10 flex items-center gap-2">
          ${t.isFollowing?b("check","w-4 h-4"):""}
          ${s(t.followLabel||p("profile.follow","Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${s(e.uid||"")}" data-chat-handle="${s(e.handle||"")}" data-chat-name="${s(e.name||"")}" data-chat-avatar="${s(e.avatar||"")}" ${t.isLocked?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${t.isLocked?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${b("message-circle","w-5 h-5")}
      </button>
    `;if(l){const O=[Ie({href:F,iconName:"phone",eyebrow:p("profile.call","Anrufen"),value:g}),Ie({href:_,iconName:"map-pin",eyebrow:p("profile.address","Adresse"),value:L||$}),U].filter(Boolean).join("");return`
      <div data-landing-tutorial-target="identity" data-business-profile-card="${s(o)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${n}" style="${f}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${ts({profileName:C,safeBio:y,metaLine:j,identityPending:v,followersLabel:h})}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${s(o)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${b("x","w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(p("profile.contactInfo","Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s($)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${O||`<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(p("profile.noContactInfo","Noch keine Kontaktdaten"))}</div>`}
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 min-w-0 max-w-full overflow-hidden">
            <button type="button" data-profile-card-info-close="${s(o)}" class="w-full h-[56px] rounded-[1.2rem] border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center" style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;">
              ${s(p("profile.backToProfile","Zurueck zum Profil"))}
            </button>
          </div>
        </div>
      </div>
    `}return`
    <div data-landing-tutorial-target="identity" data-business-profile-card="${s(o)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${n}" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${P?`<img src="${s(P)}" data-img-key="${s(S)}" alt="${s(C)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`:`<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${b("store","w-7 h-7")}</div>`}
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${z}
          ${Se({href:T,label:"TikTok",iconName:"music-2"})}
          ${Se({href:H,label:"Instagram",iconName:"instagram"})}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${a==="self"?'id="profileAvatarTrigger"':""} class="relative ${a==="self"?"cursor-pointer group":""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${m?`<img src="${s(i)}" decoding="async" width="100" height="100" ${u} class="w-full h-full rounded-[1.8rem] ${r} border-2 border-white bg-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${v?"animate-pulse":""}">${b("store","w-8 h-8 text-slate-300")}</div>`}
            </div>
            ${e.isPremium?`
              <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                ${b("badge-check","w-4 h-4 fill-blue-500 text-white")}
              </div>
            `:""}
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div data-landing-tutorial-target="fans" class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl ${v?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(String(h))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <button type="button" data-profile-card-info-open="${s(o)}" class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${b("info","w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.info","Info"))}</span>
            </button>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(C)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${y}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(j)}</p>
          ${v?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${s(p("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          ${E}
        </div>
      </div>
    </div>
  `}function Ce(e={},t=[],{topTabOverride:a="",tutorialMode:n=!1,contentTabOverride:i="",landingHideContent:r=!1,collapseIdentity:o=!1,contentReveal:l=!1,landingMode:c=!1}={}){const f=ya(e),u=!!e.privateAccount&&e.uid&&String(e.uid)!==String(d.user?.uid||"")&&!f,m=!!e.pendingFollowRequest&&!f,v=e.restaurantId?"Business":p("nav.user","User"),h=String(e.handle||nt(e.name||"user")).replace(/^@/,""),k=s(e.bio||"").replace(/\n/g,"<br>")||s(p("profile.noBio","Noch keine Bio.")),$=ve(e),j=String(a||Oe(e)).trim().toLowerCase()||"profile",y=String(i||ke(e)).trim().toLowerCase()||"posts",S=y==="menu",A=y==="checkins",P=t,w={...d?.profileView&&typeof d.profileView=="object"?d.profileView:{},profile:e,posts:Array.isArray(P)?P:[]},z=Bs(d,{profileView:w,profileTopTab:j,profileContentTab:y}),H=String(z?.header?.status||"").trim().toLowerCase()||"loading",T=String(z?.posts?.status||"").trim().toLowerCase()||"loading",g=String(e?.avatar||"").trim(),F=g?M(g,"avatar"):"",L=Ue(!!e.restaurantId),U=e.uid||e.restaurantId||h||"public",E=c?"":`data-img-key="avatar:public:${s(U)}"`,O=!!g,te=st=>{if(st==null)return!1;const Gt=Number(st);return Number.isFinite(Gt)&&Gt>=0},oe=O||te(e?.followers)||te(e?.following),W=_e(H)&&!oe,ae=!!String(F||"").trim()&&O,je=W?"...":B(e.followers),Ae=W?"...":B(e.following),Le=$?"pt-2":"pt-10",Te=f?p("profile.following","Following"):m?p("profile.requested","Requested"):u?p("profile.request","Request"):p("profile.follow","Follow"),pe=f?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":m?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",fe=n?"select-none":"app-main-content-safe",Y=n?"pointer-events-none":"",G=!o,Kt=!r,ze=l?c?"transition-opacity duration-200":"animate-in fade-in duration-300":"",qt=y==="posts"&&P.length>0,_s=y!=="posts"||qt||T==="empty"||T==="error",Us=y==="posts"&&!qt&&T==="error";return!n&&(y==="posts"||y==="media")&&e?.restaurantId&&_e(T)&&Zt(e),`
    <div class="${fe}" ${n?'data-landing-tutorial-surface="true"':""}>
      ${j==="profile"||j==="menu"?`
      ${G?`
        <div class="app-content-inline pb-2 ${Le}">
          ${$?Ct(e,{mode:"public",disabledBlockClass:Y,avatarUrl:F,avatarFit:L,avatarImgKeyAttr:E,renderAvatarImage:ae,identityPending:W,followersLabel:je,followLabel:Te,followTone:pe,isFollowing:f,hasPendingFollowRequest:m,isLocked:u,bioHtml:k,typeLabel:v,allowTitleImageCacheFallback:_e(H)||_e(T)}):`
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${Y}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${ae?`<img src="${s(F)}" decoding="async" width="100" height="100" ${E} class="w-full h-full rounded-[1.8rem] ${L} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${W?"animate-pulse":""}">${b(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${b("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${W?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(je)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${W?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(Ae)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e.name||"User")}</h1>
                ${$?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${s(h)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${k}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(e.location||"-")} / ${v}</p>
                ${W?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${s(p("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${s(e.handle)}" data-target-type="${s(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${s(e.restaurantId||e.uid||"")}" data-target-name="${s(e.name||"")}" data-target-avatar="${s(e.avatar||"")}" ${m?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${pe} ${m?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${f?b("check","w-4 h-4"):""}
                    ${Te}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${s(e.uid||"")}" data-chat-handle="${s(e.handle||"")}" data-chat-name="${s(e.name||"")}" data-chat-avatar="${s(e.avatar||"")}" ${u?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${u?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${b("message-circle","w-5 h-5")}
                </button>
              </div>
            </div>
          </div>
          `}
        </div>
      `:""}

      ${u?`
        <div class="app-content-inline pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${b("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${s(p("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${s(p("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${Ve(e,{landingPreview:n,selectedTabOverride:y,compact:o})}
        ${Kt?Ke(e,{disabled:n}):""}

        ${Kt?S?`
          <div class="${Y} ${ze}">
            ${we(e)?wt(e):Fe(e,{mode:c?"landing":"profile",allowAutoEnsure:!c})}
          </div>
        `:A?`
          <div class="${Y} ${ze}">
            ${Ne()}
          </div>
        `:`
          ${_s?`
            ${Us?`
              <div class="app-content-inline ${Y}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${s(p("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${d.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${Y} ${ze}">
                ${Re(P,d.profileViewMode,!1,{includeImageKeys:!c})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${Y}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${ze}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(p("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${j==="cart"?rt(e):j==="favorites"?it(e):""}
      `}
    </div>
  `}function as(){const e=d.profileView;if(!e||!e.profile)return"";const t=e.profile,a=e.posts||t.posts||[],n=Oe(t);return n==="landing"?Va(t):Ce(t,a,{topTabOverride:n,tutorialMode:!1})}function Pt(e,{filter:t="all",query:a=""}={}){const n=Array.isArray(e)?e:[],i=fa(a||"");return n.filter(r=>t==="all"||se(r.type)===t?i?`${r.name||""} ${r.category||""} ${r.description||""}`.toLowerCase().includes(i):!0:!1)}function Ft(e,t=0){const a=Number(e);return Number.isFinite(a)?Math.max(0,Math.floor(a)):Math.max(0,Number(t)||0)}function Pe(e=[]){return(Array.isArray(e)?e.slice():[]).map((a,n)=>({item:a,idx:n,order:Ft(a?.orderIndex,n)})).sort((a,n)=>a.order-n.order||a.idx-n.idx).map((a,n)=>({...a.item,orderIndex:Ft(a.item?.orderIndex,n)}))}function qe(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function ue(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":se(e?.type||"food")==="drink"?"drink":"food"}function ss(e={}){return String(e?.category||p("menu.other","Sonstiges")).trim()||p("menu.other","Sonstiges")}function ns(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const rs=4,is={thumb:160,small:480,medium:768,large:1280};function jt({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<rs&&a===0}function os({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){const n=jt({mode:e,priorityIndex:t,slideIndex:a}),i=e==="profile"?' data-image-reveal="menu"':"";return n?`loading="eager" fetchpriority="high"${i}`:`loading="lazy" fetchpriority="low"${i}`}function ls({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function X(e,{mode:t="profile",priorityIndex:a=-1,slideIndex:n=0,stableKey:i="",preferredSize:r="small",candidateSizes:o=["small","medium","large"],variant:l="grid"}={}){const c=String(e||"").trim(),f=t==="profile"&&i?{stableKey:i}:null,u=jt({mode:t,priorityIndex:a,slideIndex:n}),m=t==="profile"&&!u&&l!=="thumb",v=M(c,r,f),h=V(v)?N:v,C=oa(c),k=la(c)&&c!==h?c:C,$=[],j=new Set;o.forEach(g=>{const F=is[g]||0;if(!F)return;const L=M(c,g,f);if(!L||V(L))return;const U=`${L}|${F}`;j.has(U)||(j.add(U),$.push(`${L} ${F}w`))});const y=$.length>1?$.join(", "):"",S=y?ls({variant:l}):"",A=m?"":y,P=m?"":S,_=A?` srcset="${s(A)}"`:"",w=P?` sizes="${s(P)}"`:"",z=os({mode:t,priorityIndex:a,slideIndex:n}),H=`${z}${_}${w}`,T=m?[`data-menu-lazy-src="${s(h)}"`,`data-menu-lazy-fallback="${s(k||N)}"`,y?`data-menu-lazy-srcset="${s(y)}"`:"",S?`data-menu-lazy-sizes="${s(S)}"`:""].filter(Boolean).join(" "):"";return{safeImg:m?N:h,fallbackImg:m?N:k,imageAttrs:H,lazyAttrs:T?` ${T}`:"",srcsetValue:y,sizesValue:S,loadingAttrs:z}}function re(e=[],t,a=null){const n=a instanceof Set?a:new Set;return e.map((i,r)=>{const o=ss(i),l=ns(o),c=!!l&&!n.has(l);return c&&n.add(l),`<div${c?` data-menu-category-anchor="${s(l)}"`:""} class="h-full">${t(i,r)}</div>`}).join("")}function Ge(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function ds(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function At(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),a=ds(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),n=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&a?{type:"link",url:a,productId:""}:t==="product"&&n?{type:"product",url:"",productId:n}:{type:"self",url:"",productId:""}}function Lt(){const e=K(d.userProfile),t=String(d.menu.filter||"all").trim().toLowerCase()||"all",a=e&&t==="drink"?"all":t;return`
    <div class="flex gap-2 mb-5">
      ${(e?[{id:"all",label:p("menu.all","Alle")},{id:"food",label:p("menu.products","Produkte")}]:[{id:"all",label:p("menu.all","Alle")},{id:"food",label:p("menu.food","Speisen")},{id:"drink",label:p("menu.drinks","Getraenke")}]).map(i=>`
        <button data-menu-filter="${i.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${a===i.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${i.label}
        </button>
      `).join("")}
    </div>
  `}function cs(){const e=ra().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${ia.map(t=>{const a=t.id===e,n=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${a?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${a?b("check",`w-4 h-4 ${n}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function Qe(e,{mode:t="profile",priorityIndex:a=-1}={}){const n=Q(e),i=t==="profile"?ie(e,{index:0}):"",{safeImg:r,fallbackImg:o,imageAttrs:l,lazyAttrs:c}=X(n,{mode:t,priorityIndex:a,stableKey:i,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),f=ce(e),u=d.activeTab==="menu"?d.userProfile:d.profileView?.profile||d.userProfile,m=K(u),v=gt(e,m),h=m?ft(e.category):e.category||"",C=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${s(r)}" data-fallback-src="${s(o)}"${c} class="w-full h-full object-cover" style="object-position:${q(e)};" ${l} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${s(e.name||p("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${s(f)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${h?`<span>${s(h)}</span>`:""}
            <span>${s(v)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${b("more-horizontal","w-4 h-4")}
          </summary>
          <div class="absolute right-0 top-12 w-40 bg-white border border-slate-100 rounded-2xl shadow-lg p-2 z-20">
            <button data-menu-edit="${s(e.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Bearbeiten</button>
            <button data-menu-delete="${s(e.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50">Loeschen</button>
          </div>
        </details>
      </div>
    `:`
    <div ${t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:""} class="w-full p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${t==="profile"?"cursor-pointer":""}">
      <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
        <img src="${s(r)}" data-fallback-src="${s(o)}"${c} class="w-full h-full object-cover" style="object-position:${q(e)};" ${l} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${s(e.name||p("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${s(f)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${h?`<span>${s(h)}</span>`:""}
          <span>${s(v)}</span>
        </div>
        ${C?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${s(C)}</p>`:""}
      </div>
    </div>
  `}function We(e,{mode:t="profile",variant:a="food",priorityIndex:n=-1}={}){const i=Q(e),r=t==="profile"?ie(e,{index:0}):"",o=a==="drink",{safeImg:l,fallbackImg:c,imageAttrs:f,lazyAttrs:u}=X(i,{mode:t,priorityIndex:n,stableKey:r,preferredSize:o?"small":"medium",candidateSizes:o?["small","medium"]:["small","medium","large"],variant:o?"grid":"hero"}),m=ce(e),v=d.activeTab==="menu"?d.userProfile:d.profileView?.profile||d.userProfile,h=K(v),C=gt(e,h),k=h?ft(e.category):e.category||"",$=e.description||"",j=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",y=d.menu.restaurantId||d.profileView?.profile?.restaurantId||d.userProfile.restaurantId||"",S=be(e),A=ct(y,S),P=A?ut(A):{likes:[],comments:[],counts:{likes:0,comments:0}},_=pt(P),w=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${b("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${s(S)}">${s(B(_.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${b("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${s(S)}">${s(B(_.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${j} class="w-full ${o?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${o?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        <img src="${s(l)}" data-fallback-src="${s(c)}"${u} class="w-full h-full object-cover" style="object-position:${q(e)};" ${f} decoding="async" />
      </div>
      ${o?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${s(e.name||p("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${s(m)}</p>
          ${w}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${s(e.name||p("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${s(m)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${k?`<span>${s(k)}</span>`:""}
            <span>${s(C)}</span>
          </div>
          ${$?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${s($)}</p>`:""}
          ${w}
        </div>
      `}
    </div>
  `}function Ye(e={}){if(!e?.restaurantId||K(e))return!1;const t=String(Ee(e)||"").trim().toLowerCase();return t==="restaurant"||t==="cafe"||t==="fastfood"}function Tt(e){const t=e?.restaurantId||d.menu.restaurantId||d.profileView?.profile?.restaurantId||d.userProfile.restaurantId||"",a=be(e),n=ct(t,a),i=n?ut(n):{likes:[],comments:[],counts:{likes:0,comments:0}},r=String(d.user?.uid||"").trim(),o=String(d.user?.handle||"").trim().toLowerCase(),l=!!i.likes?.some(c=>{const f=String(c?.uid||"").trim();if(r&&f&&f===r)return!0;const u=String(c?.handle||"").trim().toLowerCase();return!!o&&!!u&&u===o});return{itemId:a,meta:i,counts:pt(i),isLiked:l}}function ie(e,{index:t=0}={}){const a=String(e?.restaurantId||d.menu.restaurantId||d.profileView?.profile?.restaurantId||d.userProfile.restaurantId||"").trim(),n=String(e?.id||be(e)||"").trim();if(!a||!n)return"";const i=Number(t),r=Number.isFinite(i)?Math.max(0,Math.floor(i)):0;return`menu-detail:${a}:${n}:${r}`}function us(e){const t=typeof dt=="function"?dt(e):[],a=Array.isArray(t)?t.filter(Boolean):[];if(a.length)return a;const n=Q(e);return n?[n]:[]}function ee(e){return Rs(e?.cardStyle||"",se(e?.type||"food"))}function Ze(e,{menuItemId:t=""}={}){if(!e)return null;const a=String(t||e.menuItemId||e.itemId||e.productId||"").trim();return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:Q(e)||e.imageUrl||"",objectPosition:e.objectPosition||q(e),menuItemId:a}}function I(e=""){return`<div aria-hidden="true" class="${e} bg-slate-100 animate-pulse"></div>`}function ps(){return`
    <div class="${Me()} rounded-[2.5rem] p-6 border shadow-sm" data-focus-skeleton="true" aria-hidden="true">
      <div class="flex items-center justify-between mb-4">
        ${I("h-3 w-24 rounded-full")}
        <div class="flex items-center gap-2">
          ${I("w-9 h-9 rounded-full")}
          ${I("w-9 h-9 rounded-full")}
        </div>
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${I("w-full h-56")}
      </div>
      <div class="mt-4 space-y-2">
        ${I("h-5 w-2/3 rounded-full")}
        ${I("h-4 w-full rounded-full")}
        ${I("h-4 w-3/5 rounded-full")}
      </div>
    </div>
  `}function fs(){return`
    <div class="pt-2 pb-4" data-focus-skeleton="true" aria-hidden="true">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        <div class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col mb-2" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
            ${I("w-full h-full")}
          </div>
          <div class="px-2 py-4 space-y-2">
            ${I("h-5 w-2/3 rounded-full")}
            ${I("h-4 w-full rounded-full")}
            ${I("h-4 w-1/2 rounded-full")}
          </div>
        </div>
      </div>
    </div>
  `}function gs(){return`
    <div class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col relative" aria-hidden="true">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        ${I("w-full h-full")}
        ${I("absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90")}
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="mb-1 space-y-2">
          ${I("h-4 w-4/5 rounded-full")}
          ${I("h-3 w-3/5 rounded-full")}
        </div>
        ${I("h-3 w-full rounded-full mb-1")}
        ${I("h-3 w-2/3 rounded-full mb-3")}
        <div class="mt-auto pt-2 flex items-center justify-between">
          ${I("h-4 w-14 rounded-full")}
          ${I("w-8 h-8 rounded-full bg-slate-900/10")}
        </div>
      </div>
    </div>
  `}function ms(){return`
    <div class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 relative" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;" aria-hidden="true">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${I("w-full h-full")}
        ${I("absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90")}
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div class="min-w-0 flex-1">
            ${I("h-5 w-4/5 rounded-full")}
          </div>
          ${I("h-5 w-14 rounded-full shrink-0")}
        </div>
        ${I("h-4 w-full rounded-full mb-2")}
        ${I("h-4 w-2/3 rounded-full mb-4")}
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div></div>
          <div class="h-11 w-32 rounded-2xl bg-slate-100 animate-pulse"></div>
        </div>
      </div>
    </div>
  `}function zt(){return`
    <div id="menu-section" class="mt-5" data-menu-skeleton="true">
      <section class="menu-type-block relative" data-menu-type-block="drink">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
            ${Array.from({length:4},()=>gs()).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block relative" data-menu-type-block="food">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="food">
          <div class="app-content-inline">
            ${Array.from({length:2},()=>ms()).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function _t(e="food"){const t=e==="drink";return`
    <div class="w-full ${t?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm" aria-hidden="true">
      <div class="w-full ${t?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        ${I("w-full h-full")}
      </div>
      ${t?`
        <div class="mt-3 flex flex-1 flex-col space-y-2">
          ${I("h-4 w-4/5 rounded-full")}
          ${I("h-3 w-1/2 rounded-full")}
          <div class="mt-2 flex items-center gap-3">
            ${I("h-3 w-10 rounded-full")}
            ${I("h-3 w-10 rounded-full")}
          </div>
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            ${I("h-4 w-3/5 rounded-full")}
            ${I("h-4 w-14 rounded-full")}
          </div>
          ${I("h-3 w-2/5 rounded-full mt-2")}
          ${I("h-3 w-full rounded-full mt-3")}
          ${I("h-3 w-2/3 rounded-full mt-2")}
          <div class="mt-3 flex items-center gap-3">
            ${I("h-3 w-10 rounded-full")}
            ${I("h-3 w-10 rounded-full")}
          </div>
        </div>
      `}
    </div>
  `}function bs(){return`
    <article class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col" aria-hidden="true">
      <div class="rounded-[1.5rem] overflow-hidden bg-slate-100" style="aspect-ratio:4 / 5;">
        ${I("w-full h-full")}
      </div>
      <div class="pt-3 flex-1 flex flex-col min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1 space-y-2">
            ${I("h-4 w-full rounded-full")}
            ${I("h-4 w-3/5 rounded-full")}
          </div>
          ${I("h-3 w-10 rounded-full shrink-0")}
        </div>
        ${I("h-3 w-full rounded-full mt-3")}
        ${I("h-3 w-2/3 rounded-full mt-2")}
      </div>
    </article>
  `}function Ut({isShop:e=!1}={}){return e?`
      <div class="grid grid-cols-2 gap-4" data-menu-skeleton="true">
        ${Array.from({length:4},()=>bs()).join("")}
      </div>
    `:`
    <div data-menu-skeleton="true" class="space-y-5">
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
        <div class="flex items-center justify-between mb-4">
          ${I("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-4">
            ${Array.from({length:4},()=>_t("drink")).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
        <div class="flex items-center justify-between mb-4">
          ${I("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="food">
          <div class="space-y-4">
            ${Array.from({length:2},()=>_t("food")).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Mt(e,t=[],{mode:a="profile"}={}){const n=e?.restaurantId||"",i=Ye(e)||K(e);return!n||!i||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((r,o)=>{const l=r.imageUrl||"",c=String(r.menuItemId||r.id||"").trim(),{safeImg:f,fallbackImg:u,imageAttrs:m,lazyAttrs:v}=X(l,{mode:a,priorityIndex:o,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:c?`menu-focus:${n}:${c}`:""}),h=String(r.menuItemId||"").trim(),C=a==="profile"&&h?`data-menu-open="${s(h)}" role="button"`:"";return`
            <div ${C} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${C?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${s(f)}" data-fallback-src="${s(u)}"${v} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${r.objectPosition||"50% 50%"};" ${m} decoding="async" />
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${b("sparkles","w-3 h-3 text-amber-500")}
                  <span class="text-[10px] font-black text-slate-900 uppercase tracking-widest pt-[1px]">Tipp</span>
                </div>
              </div>
              <div class="px-2 py-4">
                <h3 class="text-[17px] font-black text-slate-900 leading-tight">${s(r.title||"")}</h3>
                <p class="text-[13px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">${s(r.text||"")}</p>
              </div>
            </div>
          `}).join("")}
      </div>
    </div>
  `}function Et(e,{mode:t="profile",priorityIndex:a=-1}={}){const n=Q(e),i=t==="profile"?ie(e,{index:0}):"",{safeImg:r,fallbackImg:o,imageAttrs:l,lazyAttrs:c}=X(n,{mode:t,priorityIndex:a,stableKey:i,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),f=ce(e),u=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",{itemId:m,counts:v,isLiked:h}=Tt(e);return`
    <div ${u} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${s(r)}" data-fallback-src="${s(o)}"${c} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${q(e)};" ${l} decoding="async" />
        <button
          type="button"
          data-menu-card-like="${s(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${h?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${h?"true":"false"}"
        >
          ${b("heart","w-3.5 h-3.5 fill-current opacity-80")}
        </button>
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-[14px] font-black text-slate-900 leading-tight">${s(e.name||"")}</h4>
        </div>
        <p class="text-[12px] text-slate-500 leading-relaxed mb-3">${s(e.description||"")}</p>
        <div class="mt-auto pt-2 flex items-center justify-between">
          <span class="text-[14px] font-black text-slate-900">${s(f)}</span>
          <button type="button" class="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors active:scale-95">
            ${b("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${s(m)}">${s(B(v.likes))}</span>
          <span data-menu-comment-count="${s(m)}">${s(B(v.comments))}</span>
        </div>
      </div>
    </div>
  `}function hs(e,t="profile"){if(t!=="profile")return"";const a=At(e);return a.type==="link"&&a.url?`data-menu-special-link="${s(a.url)}" role="button" tabindex="0"`:a.type==="product"&&a.productId?`data-menu-open="${s(a.productId)}" role="button"`:`data-menu-open="${s(e.id)}" role="button"`}function Je(e,{mode:t="profile",size:a="default",priorityIndex:n=-1}={}){const i=Q(e),r=t==="profile"?ie(e,{index:0}):"",o=a==="food",{safeImg:l,fallbackImg:c,imageAttrs:f,lazyAttrs:u}=X(i,{mode:t,priorityIndex:n,stableKey:r,preferredSize:o?"medium":"small",candidateSizes:o?["small","medium","large"]:["small","medium"],variant:o?"hero":"grid"}),m=hs(e,t),v=String(e.category||"Special").trim()||"Special",h=s(String(e.name||"Special")).replace(/\n/g,"<br>");return a==="food"?`
      <div ${m} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${s(l)}" data-fallback-src="${s(c)}"${u} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${q(e)};" ${f} decoding="async" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${b("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${s(v)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${h}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${m} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${s(l)}" data-fallback-src="${s(c)}"${u} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${q(e)};" ${f} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${b("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${s(v)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${h}</h4>
        </div>
      </div>
    </div>
  `}function Bt(e,{mode:t="profile",priorityIndex:a=-1}={}){const n=ce(e),i=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",r=us(e),l=(r.length?r:[Q(e)||""]).filter(Boolean),c=l.length?l.slice(0,12):[""],f=c.length>1,{itemId:u,counts:m,isLiked:v}=Tt(e),h=B(Math.max(0,Number(m.likes)||0)),C=B(Math.max(0,Number(m.comments)||0));return`
    <div ${i} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${f?`
          <div
            data-menu-card-gallery-track="${s(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${c.map((k,$)=>{const j=t==="profile"?ie(e,{index:$}):"",y=X(k||"",{mode:t,priorityIndex:a,slideIndex:$,stableKey:j,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),S=$>0,A=S?N:y.safeImg,P=S?N:y.fallbackImg,_=S?y.loadingAttrs:y.imageAttrs,w=S?"":y.lazyAttrs||"",z=S?` data-menu-card-deferred-src="${s(y.safeImg)}"
                    data-menu-card-deferred-fallback="${s(y.fallbackImg)}"
                    ${y.srcsetValue?`data-menu-card-deferred-srcset="${s(y.srcsetValue)}"`:""}
                    ${y.sizesValue?`data-menu-card-deferred-sizes="${s(y.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${$}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${s(A)}" data-fallback-src="${s(P)}"${w}${z} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${q(e)};" ${_} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${c.map((k,$)=>{const j=t==="profile"?ie(e,{index:$}):"",{safeImg:y,fallbackImg:S,imageAttrs:A,lazyAttrs:P}=X(k||"",{mode:t,priorityIndex:a,slideIndex:$,stableKey:j,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${s(y)}" data-fallback-src="${s(S)}"${P} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${q(e)};" ${A} decoding="async" />
              </div>
            `}).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${s(e.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${v?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${v?"true":"false"}"
        >
          ${b("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${f?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${c.map((k,$)=>`
              <div
                data-menu-card-gallery-dot="${s(e.id)}"
                data-menu-card-gallery-index="${$}"
                class="${$===0?"w-4 h-1.5 bg-white rounded-full shadow-sm":"w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm"}"
              ></div>
            `).join("")}
          </div>
        `:""}
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div>
            <h4 class="text-[18px] font-black text-slate-900 leading-snug">${s(e.name||"")}</h4>
          </div>
          <span class="text-[17px] font-black text-slate-900 whitespace-nowrap">${s(n)}</span>
        </div>
        <p class="text-[14px] text-slate-500 line-clamp-2 leading-relaxed mb-4" style="margin-bottom:16px;">${s(e.description||"")}</p>
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div class="flex items-center gap-2">
            <div class="hidden">
              <span data-menu-like-count="${s(u)}">${s(h)}</span>
              <span data-menu-comment-count="${s(u)}">${s(C)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${s(p("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${b("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function xs(e,t,{mode:a="profile",publicMenuSurfaceState:n=null,focusFallbackHtml:i=""}={}){const r=Pe(Array.isArray(t)?t:[]),o=String(e?.restaurantId||"").trim(),l=a==="admin"||xa(o),c=n?.focus?.canRenderFocus?{items:Array.isArray(n.focus.items)?n.focus.items:[],enabled:!0}:o&&l?he(o):{items:[],enabled:!1},f=c.enabled?(Array.isArray(c.items)?c.items:[]).map(g=>Ze({...g,objectPosition:le(g)})):[],u=r.filter(g=>ee(g)==="testfirst_focus"&&!qe(g)).map(g=>Ze(g,{menuItemId:g.id||""})).filter(Boolean),m=new Set,v=[...f,...u].filter(g=>{const F=String(g.menuItemId||g.id||`${g.title}|${g.text}|${g.imageUrl}`);return!F||m.has(F)?!1:(m.add(F),!0)}),h=r.filter(g=>!qe(g)),C=h.filter(g=>ee(g)!=="testfirst_focus"),k=C.length?C:h,$=C.length?v:[],j=k.filter(g=>ue(g)==="drink"),y=k.filter(g=>ue(g)!=="drink"),S=(g=[])=>{const F=[],L=[];return g.forEach(U=>{const E=ee(U);E==="testfirst_food"||E==="testfirst_special"&&Ge(U)==="food"?L.push(U):F.push(U)}),{gridItems:F,foodItems:L}},A=(g,F=-1)=>ee(g)==="testfirst_special"?Je(g,{mode:a,priorityIndex:F}):Et(g,{mode:a,priorityIndex:F});let P=0;const _=()=>{const g=P;return P+=1,g},w=new Set,z=(g,F)=>!F.gridItems.length&&!F.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${s(g)}">
        ${F.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${s(g)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${re(F.gridItems,L=>A(L,_()),w)}
            </div>
          </div>
        `:""}
        ${F.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${s(g)}">
            <div class="app-content-inline">
              ${re(F.foodItems,L=>{const U=ee(L),E=_();return U==="testfirst_special"?Je(L,{mode:a,size:"food",priorityIndex:E}):Bt(L,{mode:a,priorityIndex:E})},w)}
            </div>
          </div>
        `:""}
      </section>
    `,H=S(j),T=S(y);return`
    <div>
      ${Mt(e,$,{mode:a})||i}
      <div id="menu-section" class="mt-5">
        ${z("drink",H)}
        ${z("food",T)}
      </div>
    </div>
  `}function Rt(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:n=null,priorityOffset:i=0}={}){return e.length?a?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${re(e,(r,o)=>Et(r,{mode:t,priorityIndex:i+o}),n)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${re(e,(r,o)=>We(r,{mode:t,variant:"drink",priorityIndex:i+o}),n)}
    </div>
  `:""}function Nt(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:n=null,priorityOffset:i=0}={}){return e.length?a?`
      <div>
        ${re(e,(r,o)=>ee(r)==="testfirst_special"&&Ge(r)==="food"?Je(r,{mode:t,size:"food",priorityIndex:i+o}):Bt(r,{mode:t,priorityIndex:i+o}),n)}
      </div>
    `:`
    <div class="space-y-4">
      ${re(e,(r,o)=>We(r,{mode:t,variant:"food",priorityIndex:i+o}),n)}
    </div>
  `:""}function Ht(e,{mode:t="profile"}={}){if(t==="admin"){const a=String(d?.menu?.filter||"all").trim().toLowerCase(),n=K(d.userProfile),i=p("menu.products","Produkte"),r=e.filter(u=>se(u?.type)==="drink"),o=e.filter(u=>se(u?.type)!=="drink"),l=(u,m,{addType:v=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${s(u)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${s(u)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(B(m.length))} Eintraege</p>
          </div>
          ${v?`
            <button type="button" data-menu-add-${s(v)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${b("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${m.length?`<div class="space-y-3">${m.map(h=>Qe(h,{mode:"admin"})).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(p("menu.noProducts","Keine Produkte"))}</div>`}
      </div>
    `;if(n)return l(i,e,{addType:"food"});const c=[{title:p("menu.drinks","Getraenke"),list:r,addType:"drink"},{title:p("menu.food","Speisen"),list:o,addType:"food"}];if(a==="all")return`
        <div>
          ${c.map(u=>l(u.title,u.list,{addType:u.addType})).join("")}
        </div>
      `;const f=c.filter(u=>u.list.length>0);return f.length?`
      <div>
        ${f.map(u=>l(u.title,u.list,{addType:u.addType})).join("")}
      </div>
    `:a==="drink"?l(p("menu.drinks","Getraenke"),[],{addType:"drink"}):a==="food"?l(p("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((a,n)=>Qe(a,{mode:t,priorityIndex:n})).join("")}
    </div>
  `:`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
        ${s(p("menu.noProducts","Keine Produkte"))}
      </div>
    `}function Xe(e,{variant:t="focus",suppressLoading:a=!1}={}){if(!e)return"";const{items:n,enabled:i,loading:r}=he(e,{includeInactive:!0}),o=B(n.length),l=String(t||"").trim().toLowerCase()==="travel-offers",c=l?"Ofertat":"Sot ne Fokus",f=l?"Oferta":"Highlights",u=l?"Im Travel und Profil sichtbar":"Im Profil sichtbar",m=l?"Ofertat werden geladen...":p("focus.loading","Fokus wird geladen..."),v=l?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${s(c)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${s(f)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(o)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${b("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${l?"Oferta anzeigen":"Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${s(u)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${i?"checked":""} />
      </label>

      ${n.length?`
        <div class="space-y-3">
          ${n.map(h=>{const C=M(h.imageUrl||"","thumb"),k=V(C)?N:C,$=h.active!==!1?"Aktiv":"Inaktiv",j=h.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(k)}" class="w-full h-full object-cover" style="object-position:${le(h)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(h.title||"Sot ne Fokus")}</p>
                  ${h.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(h.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${j}">${$}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${s(h.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${s(h.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:r&&!a?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(m)}</div>
      `:r?"":`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(v)}</div>
      `}
    </div>
  `}function Dt(e={}){if(!e?.restaurantId)return!1;const t=String(Ee(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)||t==="ecommerce"||K(e)?!1:ne(e)||["restaurant","cafe","coffee","fastfood","food"].includes(t)||!t}function vs(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Freigegeben",className:"text-emerald-600"}:t==="rejected"?{label:"Abgelehnt",className:"text-rose-600"}:{label:"Wartet auf Heart",className:"text-amber-600"}}function ws(e,t){if(!t||!Dt(e))return"";const{items:a,loading:n}=ca(t,{includeInactive:!0}),i=B(a.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(i)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${b("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${a.length?`
        <div class="space-y-3">
          ${a.map(r=>{const o=M(r.imageUrl||"","thumb"),l=V(o)?N:o,c=vs(r),f=r.category||"RESTAURANT",u=r.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(l)}" class="w-full h-full object-cover" style="object-position:${le(r)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(r.title||"Ad")}</p>
                  ${r.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(r.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${s(f)} · ${s(u)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${c.className}">${s(c.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-ad-edit="${s(r.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-ad-delete="${s(r.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:n?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ads werden geladen...</div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Ads</div>
      `}
    </div>
  `}function et(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function ys(e={}){const t=String(e?.restaurantId||"").trim(),a=t?de(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{},...t?{restaurantId:t}:{}}}function tt(e={}){return e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{}}function $s(e={}){const t=tt(e);return[...et(t.productIds),...et(e.shoppingLandingCardProductIds),...et(e.shoppingLandingProductIds)].filter(Boolean)}function at(e={}){return!e||typeof e!="object"?{}:Object.entries(e).reduce((t,[a,n])=>{const i=String(a||"").trim(),r=String(n||"").trim();return i&&r&&(t[i]=r),t},{})}function ks(e={}){const t=tt(e);return{...at(e.shoppingLandingProductImageOverrides),...at(t.productImageOverrides)}}function Ss(e=""){const t=String(e||"").trim(),a=d.shoppingLandingCardEditor&&typeof d.shoppingLandingCardEditor=="object"?d.shoppingLandingCardEditor:{},n=String(a.restaurantId||"").trim();return n&&n!==t?{}:a}function Is(e){return e?typeof e=="string"?e.trim():typeof e!="object"?String(e||"").trim():String(e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||"").trim():""}function Cs(e={}){const a=[Q(e),...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(Is).filter(Boolean);return a.filter((n,i)=>a.indexOf(n)===i)}function Ps(e={},t={},a={}){const n=String(e?.id||e?.productId||e?.menuItemId||"").trim();if(!n)return null;const i=Cs(e).map(u=>({rawUrl:u,imageUrl:M(u,"thumb")})).filter(u=>u.rawUrl&&!V(u.imageUrl)),r=i[0]?.rawUrl||"",o=String(t?.[n]||"").trim(),l=String(a?.[n]||"").trim(),c=l||o||r,f=c?M(c,"thumb"):"";return{id:n,name:String(e.name||e.title||"Produkt").trim(),price:ce(e),imageUrl:f&&!V(f)?f:"",defaultImageRaw:r,cardImageUrl:o,previewImageUrl:l,imageCandidates:i,objectPosition:q(e)}}function Fs(e={},t="",a=[]){if(!t||!K(e))return"";const n=ys(e),i=tt(n),r=Ss(t),o=r.saving===!0,l=String(r.status||"").trim(),c=/fehl|error|nicht|nuk|kein/i.test(l),f=String(i.imageUrl||n.shoppingLandingCardImageUrl||n.shoppingLandingImageUrl||"").trim(),u=String(n.logoUrl||n.logo||n.logoURL||n.avatar||e.avatar||"").trim(),m=String(r.imageUrlDraft??f).trim(),v=String(r.imagePreview||m||u||"").trim(),h=v?M(v,"large"):N,C=String(r.titleDraft??(i.title||n.shoppingLandingCardTitle||e.name||"")).trim(),k=r.active!==void 0?r.active!==!1:i.active!==!1&&n.shoppingLandingCardEnabled!==!1,$=$s(n),j=Array.isArray(r.productIds)?r.productIds.map(w=>String(w||"").trim()).filter(Boolean):null,y=new Set(j||$),S={...ks(n),...at(r.productImageOverrides)},A=r.productImagePreviews&&typeof r.productImagePreviews=="object"?r.productImagePreviews:{},P=(Array.isArray(a)?a:[]).filter(w=>w&&String(w.id||"").trim()&&w.hidden!==!0&&w.available!==!1).map(w=>Ps(w,S,A)).filter(Boolean),_=y.size?`${B(y.size)} ausgewaehlt`:"Keine Auswahl = alle Produkte";return`
    <div data-shopping-landing-card-editor="${s(t)}" class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Landing Card</span>
          <h3 class="text-xl font-black italic tracking-tighter">Shopping Card</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(_)}</p>
        </div>
        <button type="button" id="shoppingLandingImageTrigger" class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95" aria-label="Bild hochladen">
          ${b("plus","w-4 h-4")}
        </button>
      </div>

      <input id="shoppingLandingImageInput" type="file" accept="image/*" class="hidden" />
      <input id="shoppingLandingImageUrl" type="hidden" value="${s(m)}" />

      <div class="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-4">
        <img src="${s(h||N)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div class="absolute inset-x-0 top-0 h-16 pointer-events-none" style="background:linear-gradient(to bottom, rgba(255,255,255,0.7), transparent);"></div>
        <div class="absolute left-4 bottom-4 right-4">
          <span class="inline-flex max-w-full truncate text-[10px] uppercase tracking-wider font-extrabold text-slate-800 bg-white backdrop-blur-sm py-1 px-2.5 rounded-full" style="background:rgba(255,255,255,0.8);">
            ${s(C||"Shop Picks")}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label for="shoppingLandingTitleInput" class="text-[10px] font-black text-slate-400 uppercase ml-2">Titel</label>
          <input id="shoppingLandingTitleInput" type="text" value="${s(C)}" placeholder="Summer Picks" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-amber-100" />
        </div>

        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">Shopping-Tab anzeigen</p>
            <p class="text-[10px] font-bold text-slate-400">Diese Card erscheint im Tab Shopping.</p>
          </div>
          <input id="shoppingLandingActiveToggle" type="checkbox" class="w-5 h-5 accent-amber-500" style="accent-color:#f97316;" ${k?"checked":""} />
        </label>

        <div class="rounded-[1.8rem] border border-slate-100 bg-slate-50 p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produkte</p>
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${s(B(P.length))}</span>
          </div>
          ${P.length?`
            <div class="grid grid-cols-1 gap-2">
              ${P.map(w=>{const z=y.has(w.id),H=w.imageUrl||N,T=String(w.defaultImageRaw||w.imageCandidates[0]?.rawUrl||"").trim(),g=String(w.cardImageUrl||"").trim(),F=String(w.previewImageUrl||"").trim(),L=!!(F||g&&g!==T),U=F||(g&&!w.imageCandidates.some(E=>E.rawUrl===g)?g:"");return`
                  <div class="rounded-2xl bg-white border border-slate-100 p-3">
                    <label class="flex items-center gap-3">
                      <input type="checkbox" data-shopping-landing-product="${s(w.id)}" class="w-4 h-4 accent-amber-500" style="accent-color:#f97316;" ${z?"checked":""} />
                      <span class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src="${s(H)}" class="w-full h-full object-cover" style="object-position:${s(w.objectPosition||"50% 50%")};" loading="lazy" decoding="async" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-xs font-black text-slate-900 truncate">${s(w.name)}</span>
                        ${w.price?`<span class="block text-[10px] font-bold text-slate-400 mt-0.5">${s(w.price)}</span>`:""}
                      </span>
                    </label>
                    ${z?`
                      <div class="mt-3 pt-3 border-t border-slate-100">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Card-Bild</span>
                          <div class="flex items-center gap-2">
                            ${L?`
                              <button type="button" data-shopping-landing-product-image-reset="${s(w.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 active:scale-95">
                                Standard
                              </button>
                            `:""}
                            <button type="button" data-shopping-landing-product-image-upload="${s(w.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest active:scale-95">
                              Upload
                            </button>
                            <input type="file" accept="image/*" data-shopping-landing-product-image-input="${s(w.id)}" class="hidden" />
                          </div>
                        </div>
                        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                          ${w.imageCandidates.map((E,O)=>{const te=O===0,oe=F?!1:te?!L:g===E.rawUrl;return`
                              <label class="shrink-0 w-16">
                                <input type="radio" name="shoppingLandingProductImage_${s(w.id)}" data-shopping-landing-product-image-choice="${s(w.id)}" value="${te?"":s(E.rawUrl)}" class="hidden" ${oe?"checked":""} />
                                <span class="block h-16 rounded-2xl overflow-hidden border ${oe?"border-slate-900":"border-slate-100"} bg-slate-100">
                                  <img src="${s(E.imageUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </span>
                                <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">${O+1}</span>
                              </label>
                            `}).join("")}
                          ${U?`
                            <label class="shrink-0 w-16">
                              <input type="radio" name="shoppingLandingProductImage_${s(w.id)}" data-shopping-landing-product-image-choice="${s(w.id)}" value="${s(U)}" class="hidden" checked />
                              <span class="block h-16 rounded-2xl overflow-hidden border border-slate-900 bg-slate-100">
                                <img src="${s(M(U,"thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                              </span>
                              <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">Upload</span>
                            </label>
                          `:""}
                        </div>
                      </div>
                    `:""}
                  </div>
                `}).join("")}
            </div>
          `:`
            <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Produkte</div>
          `}
        </div>

        ${l?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${c?"text-rose-500":"text-slate-500"}">${s(l)}</div>`:""}

        <button id="shoppingLandingSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${o?"disabled":""}>
          ${o?"Speichern...":"Landing Card speichern"}
        </button>
      </div>
    </div>
  `}function js(e){if(!Ye(e)||!bt(e))return"";const a=Pe((d.menu.items||[]).filter(n=>ee(n)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(B(a.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${b("plus","w-4 h-4")}
        </button>
      </div>
      ${a.length?`
        <div class="space-y-3">
          ${a.map(n=>{const i=M(Q(n),"thumb"),r=V(i)?N:i,o=At(n),l=o.type==="link"?"Link":o.type==="product"?"Produkt-Modal":"Diese Karte",c=Ge(n)==="food"?"Food-Size":"Normal",f=ba(ue(n));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(r)}" class="w-full h-full object-cover" style="object-position:${q(n)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(n.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${s(f)}</span>
                    <span>${s(c)}</span>
                    <span>${s(l)}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-menu-edit="${s(n.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-menu-delete="${s(n.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Special-Karten</div>
      `}
    </div>
  `}function Ot(e,{restaurantId:t="",suppressLoading:a=!1,allowAutoEnsure:n=!0,requirePublicMenuTruth:i=!0}={}){const r=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!r||!ne(e))return"";const o=ge(d,{profile:e,routePayload:d?.profileView?.routePayload,webDirectEntry:d?.__webDirectEntry,restaurantId:r});if(i&&o.menu.status!=="ready")return"";const l=!i||o.focus.canRenderFocus;if(n&&!d.focus.loading&&!l&&me(mt(e,r)),i&&!l)return"";const{items:c,loading:f}=l?{items:Array.isArray(o.focus.items)?o.focus.items:[],loading:o.focus.loading}:he(r);if(!(l?!0:he(r).enabled)||!c.length&&!f||a&&f&&!c.length)return"";if(f&&!c.length)return`
      <div class="${Me()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(p("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const m=ua(c),v=c[m]||c[0],{safeImg:h,fallbackImg:C,imageAttrs:k,lazyAttrs:$}=X(v.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:v?.id?`focus-carousel:${r}:${String(v.id)}`:""}),j=v.text||"";return`
    <div id="focusCarousel" class="${Me()} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${c.length>1?`
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${b("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${b("chevron-right","w-4 h-4")}
            </button>
          </div>
        `:""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img data-focus-image src="${s(h)}" data-fallback-src="${s(C)}"${$} class="w-full h-56 object-cover" style="object-position:${le(v)};" ${k} decoding="async" />
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${s(v.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${j?"":"hidden"}">${s(j)}</p>
      </div>
      ${c.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${c.map((S,A)=>`
            <button type="button" data-focus-dot="${A}" class="w-2.5 h-2.5 rounded-full ${A===m?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function As(e,t=220){const a=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${a}`}function Vt({label:e,url:t,caption:a}){if(!t)return"";const n=As(t,240);return`
    <button type="button" data-copy-url="${s(t)}" data-copy-label="${s(e)}" class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-left active:scale-[0.98] transition-transform">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${s(n)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${s(e)}</p>
        ${a?`<p class="text-[10px] font-bold text-slate-400 mt-1">${s(a)}</p>`:""}
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2">Tippen zum Kopieren</p>
      </div>
    </button>
  `}function Ls({profile:e,restaurantId:t,catalogLabel:a}){if(!t||!ne(e))return"";if(typeof ot=="function"){const r=xe?xe(t):null;(!r||r.sameRestaurant!==!0||!r.loading&&!r.loaded&&!r.error)&&ot(e)}const n=typeof xe=="function"?xe(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},i=(n.tables||[]).map(r=>{const o=pa("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:r});return Vt({label:`Tisch ${r}`,url:o,caption:`${a} fuer Tisch ${r}`})}).join("");return`
    <div class="mt-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Tisch QR</span>
          <h3 class="text-xl font-black italic tracking-tighter">Tische</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gib an, wie viele Tische du hast. Bereits erzeugte Tisch-QR bleiben dauerhaft unter denselben Links.</p>
        </div>
        <label class="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
          <input id="tableQrEnabledToggle" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${n.enabled!==!1?"checked":""} />
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Aktiv</span>
        </label>
      </div>
      <div class="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
        <div class="flex-1">
          <label for="tableQrCountInput" class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Anzahl Tische</label>
          <input id="tableQrCountInput" type="number" min="0" max="200" step="1" inputmode="numeric" value="${s(String(n.count||0))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button type="button" data-table-qr-save="true" class="h-14 px-6 rounded-[1.6rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-200/60 active:scale-95" ${n.saving?"disabled":""}>
          ${n.saving?"Speichern...":"Tische speichern"}
        </button>
      </div>
      ${n.loading?'<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tisch-QR wird geladen...</p>':""}
      ${n.status?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">${s(n.status)}</p>`:""}
      ${n.error?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(n.error)}</p>`:""}
      ${i?`
        <div class="grid grid-cols-2 gap-4 mt-6">
          ${i}
        </div>
      `:`
        <div class="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-300">Noch keine Tisch-QR-Codes</p>
        </div>
      `}
    </div>
  `}function Ts(){const e=d.userProfile,t=e.restaurantId||"",a=String(d.user?.uid||"").trim(),n=String(d.__authBootstrapInFlightUid||"").trim(),i=!t&&!!a&&(!!d.__authProfileLoadPromise||n===a),r=we(e),o=ne(e),l=d.profileView?.profile?.restaurantId?d.profileView.profile:null,c=Yt()&&!!l?.restaurantId&&ne(l),f=K(e),u=ma(ta(e)),m=t?de(t):null,v=m?.name||m?.restaurantName||e.name||"Business",h=t&&d.menu.restaurantId===t,C=String(d.menu.source||"").trim().toLowerCase(),k=!!h&&C==="collection",$=!!h&&C==="collection"&&d.menu.loading,j=!!t&&($||!k),y=f?"all":d.menu.filter,S=k?Pt(d.menu.items,{filter:y,query:d.menu.query}):[],P=bt(e)?S:S.filter(z=>!$a(z)),_=Pe(P),w=B(_.length);if(t&&r){Ia(e);const z=String(d.focus?.truthSource||"").trim().toLowerCase();return!d.focus.loading&&(d.focus.restaurantId!==t||z!=="public-menu")&&me(e),Ha(e)}return t&&o&&!k&&!$&&Xt(e),t&&o&&!d.focus.loading&&d.focus.restaurantId!==t&&me(e),t&&Dt(e)&&ea(e),o?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${u}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(v)}</p>
        </div>
      </div>

      ${t?`
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${s(w)}</p>
          </div>
        </div>
      `:i?`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Business wird geladen...</p>
        </div>
      `:`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500 mb-4">Bitte zuerst dein Business im Account auswaehlen.</p>
          <button data-nav="settings" class="px-5 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Zu den Einstellungen</button>
        </div>
      `}

      ${t?Xe(t):""}
      ${t?ws(e,t):""}
      ${t?Fs(e,t,k?d.menu.items:[]):""}
      ${t&&k?js(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${b("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${s(d.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${Lt()}

        ${j?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(p("menu.loading",`${u} wird geladen...`,{label:u}))}</div>`:Ht(_,{mode:"admin"})}
        ${d.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${s(d.menu.error)}</div>`:""}
        ${Ls({profile:e,restaurantId:t,catalogLabel:u})}
      `:""}

    </div>
  `:c?Fe(l):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${b("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${u}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function Fe(e,{mode:t="profile",allowAutoEnsure:a=!0}={}){const n=d?.profileView?.routePayload&&typeof d.profileView.routePayload=="object"?d.profileView.routePayload:null,i=d?.__webDirectEntry&&typeof d.__webDirectEntry=="object"&&d.__webDirectEntry.active===!0?d.__webDirectEntry:null;let r=ge(d,{profile:e,routePayload:n,webDirectEntry:i});const o=r.restaurantId||ha(e,n);if(!o)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${s(p("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const l=mt(e,o),c=K(l),f=ne(l)&&!c;f&&(r=ge(d,{profile:l,routePayload:n,webDirectEntry:i,restaurantId:o}));const u=String(i?.canonicalRestaurantId||i?.restaurantId||"").trim(),m=new Set(r.targetIds),v=Ms(r.focus.truthState||""),h=r.menu.status==="ready",C=r.focus.canRenderFocus,k=h&&f,$=r.focus.matches===!0&&r.focus.loading===!0,y=String(d?.profileView?.menuAccessSource||i?.menuAccessSource||n?.menuAccessSource||"").trim().toLowerCase()==="qr",S=i?.active===!0&&i?.webPriority===!0&&i?.menuFirst===!0&&String(d?.activeTab||"").trim().toLowerCase()==="profile"&&String(d?.profileTopTab||"").trim().toLowerCase()==="menu"&&(u===o||m.has(o)),A=S&&!y,P=["ready","empty","error"].includes(r.menu.status),_=S&&P,w=S&&(!k||r.menu.status!=="ready"),z=!k||r.focus.settled===!0||v==="knownEmpty"||r.menu.status!=="ready";a&&!_&&!P&&Jt(l),a&&!w&&!z&&!$&&h&&(!A||P)&&me(l);const T=r.menu.canRenderItems?Pe(Pt(r.menu.items,{filter:"all",query:""})).filter(G=>!qe(G)):[],g=T.length>0,F=r.menu.error||"",L=r.menu.status==="empty"||r.menu.status==="ready"&&!g,U=r.menu.status==="error"||!!String(F||"").trim(),E=!g&&!L&&!U,O=T.filter(G=>ue(G)==="drink"),te=T.filter(G=>ue(G)!=="drink"),oe=0,W=O.length,ae=Ye(e),je=ae||c,Ae=new Set;g&&o&&(aa(T,o),wa(T,o));const Le=o&&C?(Array.isArray(r.focus.items)?r.focus.items:[]).map(G=>Ze({...G,objectPosition:le(G)})).filter(Boolean):[],Te=v==="knownEmpty"||r.focus.status==="empty"||r.focus.status==="error",pe=f&&!C&&!Te&&r.menu.status!=="empty"&&r.menu.status!=="error",fe=Le.length?Mt(l,Le,{mode:t}):pe?fs():"",Y=je?fe:Ot(l,{restaurantId:o,suppressLoading:!0,allowAutoEnsure:h&&(!A||P),requirePublicMenuTruth:!0})||(pe?ps():"");return ae?`
      <div class="app-main-content-safe">
        ${E?`
          ${fe}
          ${zt()}
        `:`
          ${g?xs(l,T,{mode:t,publicMenuSurfaceState:r,focusFallbackHtml:fe}):U?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(p("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:L?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">${s(p("menu.noProducts","Keine Produkte"))}</div>`:zt()}
          ${F?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(F)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5">
      ${Y}
      ${E?`
        ${Ut({isShop:c})}
      `:`
        ${g?`
          ${c?`
            ${na(T,{profile:e})}
          `:`
            ${O.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${s(p("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${Rt(O,{mode:t,useTestfirstCardUi:ae,seenCategories:Ae,priorityOffset:oe})}
                </div>
              </section>
            `:""}
            ${te.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${s(p("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${Nt(te,{mode:t,useTestfirstCardUi:ae,seenCategories:Ae,priorityOffset:W})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${U?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                ${s(p("menu.loadError","Menu konnte nicht geladen werden"))}
              </div>
            </div>
          `:L?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${s(p("menu.noProducts","Keine Produkte"))}
              </div>
            </div>
          `:`
            ${Ut({isShop:c})}
          `}
        `}
        ${F?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(F)}</div>`:""}
      `}
    </div>
  `}function zs(){const e=d.userProfile,t=Wt(e),a=t?d.businessPosts:d.userPosts,n=String(d.user?.uid||e?.uid||"").trim(),i=String(e?.restaurantId||"").trim(),r=String(d.__userPostsLoadingUid||"").trim(),o=String(d.__businessPostsLoadingRestaurantId||"").trim(),l=String(d.__authBootstrapInFlightUid||"").trim(),c=!!n&&r===n,f=!!i&&o===i,u=!!n&&l===n,m=t?f||u&&!a.length:c||u&&!a.length,v=String(e.handle||nt(e.name||"user")).replace(/^@/,""),C=s(e.bio||"").replace(/\n/g,"<br>")||s(p("profile.noBio","Noch keine Bio.")),k=ke(e),$=k==="menu",j=k==="checkins",y=a,S=M(e.avatar,"avatar"),A=Ue(t),P=Oe(e);return`
    <div class="app-main-content-safe">
      ${P==="profile"||P==="menu"?`
      <div class="app-content-inline pb-2 ${t?"pt-2":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${t?Ct(e,{mode:"self",avatarUrl:S,avatarFit:A,followersLabel:B(e.followers),bioHtml:C}):`
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${s(S)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${A} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${b("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${s(B(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${s(B(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${s(v)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${C}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(e.location||"-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${b("plus","w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${b("settings","w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
        `}
      </div>

      ${Ve(e)}
      ${Ke(e)}

      ${$?`
        ${we(e)?wt(e):Fe(e)}
      `:j?`
        ${Ne()}
      `:`
        ${m&&!y.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(p("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${d.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${Re(y,d.profileViewMode)}
          </div>
          ${k==="posts"?`
            <div class="app-content-inline mt-8 mb-4">
              <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  ${b("plus","w-4 h-4")} Neuen Beitrag
                </span>
                <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          `:""}
        `}
      `}
      `:`
        ${P==="cart"?rt(e):P==="favorites"?it(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:ht,renderProfilePostsFancy:Re,renderProfileCheckins:Ne,renderProfileTabs:Ve,renderProfileViewControls:Ke,renderPublicProfileView:as,renderMenuFilterRow:Lt,renderMenuLayoutSection:cs,renderMenuItemCard:Qe,renderMenuItemCardStacked:We,renderMenuDrinkGrid:Rt,renderMenuFoodList:Nt,renderMenuList:Ht,renderFocusAdminSection:Xe,renderFocusCarousel:Ot,renderMenuQrCard:Vt,renderMenuAdminView:Ts,renderProfileMenuView:Fe,renderProfileView:zs}}export{Os as createProfileMenuFocusRenderController};
