import{e as de,f as ys,t as $s,g as ks,h as je,a as Is}from"../entry/social-app.js";import"./startup-route-runtime-context-6Co7bthZ.js";import"./vendor-firebase-V03pMX6J.js";function Ps(m={}){const d=m.state,Vt=m.resolvePostCountsFn,s=m.escapeHtmlFn,B=m.getOptimizedImageUrlFn,f=m.iconFn,qt=m.isLocalBusinessProfileFn,Gt=typeof m.isCeoUserFn=="function"?m.isCeoUserFn:(()=>!1),Je=m.normalizeHandleFn,Te=m.logoFitClassFn,R=m.formatCountFn,Ze=m.renderProfileShopCartViewFn,Xe=m.renderProfileShopFavoritesViewFn,Qt=typeof m.ensurePostsDataForProfileFn=="function"?m.ensurePostsDataForProfileFn:(()=>{}),Wt=m.ensureMenuDataForProfileFn,Yt=typeof m.ensureEditorMenuDataForProfileFn=="function"?m.ensureEditorMenuDataForProfileFn:(()=>{}),ue=m.ensureFocusDataForProfileFn,Jt=typeof m.ensureAdsDataForProfileFn=="function"?m.ensureAdsDataForProfileFn:(()=>{}),et=m.ensureTableQrStateForProfileFn,ee=m.isShopCatalogProfileFn,tt=m.getBusinessCatalogLabelFn,te=m.normalizeMenuTypeFn,Zt=m.primeMenuItemCountsFn,Xt=typeof m.hydrateMenuCardViewerLikesFn=="function"?m.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),ea=m.renderShopProductListFn,ta=m.getMenuLayoutThemeFn,aa=m.menuLayoutColors,V=m.resolveMenuItemHeroFn,M=m.isPlaceholderUrlFn,N=m.placeholderImage,sa=m.getFirebaseStorageUrlFn,na=m.isDirectImageUrlFn,at=m.formatPriceFn,ra=typeof m.resolveCurrencyCodeForMenuItemFn=="function"?m.resolveCurrencyCodeForMenuItemFn:(()=>""),st=m.getMenuItemImagesFn,K=m.getMenuItemObjectPositionFn,pe=m.getMenuItemSocialIdFn,nt=m.menuItemMetaKeyFn,rt=m.ensureMenuItemMetaFn,it=m.resolveMenuItemCountsFn,fe=m.getFocusStateForRestaurantFn,ia=typeof m.getAdsStateForRestaurantFn=="function"?m.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),ge=m.getTableQrStateForRestaurantFn,oe=m.getFocusItemObjectPositionFn,ot=m.getFocusCardClassFn,oa=m.getFocusIndexFn,ae=m.isRestaurantCafeProfileFn,Le=typeof m.getBusinessProfileTypeFn=="function"?m.getBusinessProfileTypeFn:(()=>""),me=m.getRestaurantMetaByIdFn,la=m.buildUrlFn,ca=m.normalizeSearchKeyFn,da=m.normalizeFollowHandleFn,q={key:"",inFlightKey:""},u=(e,t=e,a={})=>$s(e,{fallback:t,params:a}),lt=(e="")=>{const t=String(e||"").trim();if(!t)return u("nav.menu","Menue");const a=t.toLowerCase();return a==="menue"||a==="menu"||a==="menü"?u("nav.menu",t):a==="shop"?"Shop":t},ua=(e="food")=>String(e||"").trim().toLowerCase()==="drink"?u("menu.drinks","Getraenke"):u("menu.food","Speisen"),ct=(e={},t=!1)=>{const a=te(e?.type||"food");return t?a==="drink"?u("menu.variant","Variante"):u("menu.product","Produkt"):a==="drink"?u("menu.drinkItem","Getraenk"):u("menu.foodItem","Speise")},_e=(e="",t="#111827")=>{const a=String(e||"").trim();return/^#[0-9a-fA-F]{6}$/.test(a)?a:t};function pa(e=null,t=null){return de(d,{profile:e,routePayload:t,webDirectEntry:d?.__webDirectEntry}).restaurantId}function dt(e=null,t=""){if(!e||typeof e!="object")return e;const a=String(t||"").trim();if(!a)return e;const n=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===a&&n?e:{...e,restaurantId:a,...n?{canonicalRestaurantId:n}:{}}}function fa(e=""){const t=String(e||"").trim();return t?de(d,{profile:d?.profileView?.profile||d?.userProfile,routePayload:d?.profileView?.routePayload,webDirectEntry:d?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function be(e={}){const t=String(ra(e)||"").trim();return t?at(e?.price,t):at(e?.price)}function ga(e=[],t="",a=""){const n=String(t||"").trim(),r=String(a||"").trim();if(!n||!r)return"";const i=Array.isArray(e)?e:[];if(!i.length)return`${n}|${r}|empty`;const o=[];return i.forEach(l=>{const c=String(pe(l)||l?.id||"").trim();c&&o.push(c)}),o.length?(o.sort(),`${n}|${r}|${o.join(",")}`):`${n}|${r}|empty`}function ma(e=[],t=""){const a=String(d.user?.uid||"").trim(),n=ga(e,t,a);n&&q.inFlightKey!==n&&q.key!==n&&(q.key=n,q.inFlightKey=n,Xt(e,t).catch(r=>{console.error(r),q.key===n&&(q.key="")}).finally(()=>{q.inFlightKey===n&&(q.inFlightKey="")}))}function ba(e={}){const t=String(e?.uid||"").trim();if(t&&d.followingTargetIds.includes(t))return!0;const a=String(e?.restaurantId||"").trim();if(a&&d.followingTargetIds.includes(a))return!0;const n=da(e?.handle||"");return!!(n&&d.followingHandles.includes(n))}function ut(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const a=typeof me=="function"&&me(t)||null;return a?.specialEnabled===!0?!0:(a?.specialEnabled===!1,!1)}function xa(e={}){return W(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function pt(e,t,a=!0,{includeImageKey:n=!0}={}){const r=Vt(e),i=e.id?String(e.id):"",o=i?`data-open-post="${s(i)}"`:"",l=i?`data-post-like-count="${s(i)}"`:"",c=i?`data-post-comment-count="${s(i)}"`:"",p=n&&i?`data-img-key="profile-post:${s(i)}"`:"",g=e.type==="wide"||e.type==="hero",b=t&&g?"col-span-2":"",v=t&&g?"aspect-[1.8/1]":"aspect-[4/5]",h=B(e.url,g?"large":"medium",{stableKey:i?`profile-post:${i}`:"",variantGroup:"post-detail"}),S=g?800:400,I=g?400:500;return`
    <div ${o} role="button" tabindex="0" class="${b} relative ${v} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${s(h)}" loading="lazy" decoding="async" width="${S}" height="${I}" ${p} class="w-full h-full object-cover" />
        ${e.isVideo?`<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${f("play","w-3 h-3 fill-white")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${f("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${l} class="text-[10px] font-bold tracking-wide">${s(r.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${f("message-circle","w-3 h-3 text-indigo-200")}
                <span ${c} class="text-[10px] font-bold tracking-wide">${s(r.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${i&&a?`
        <button type="button" data-profile-menu-button="${s(i)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${f("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${s(i)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${s(i)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${f(g?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${g?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${s(i)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${f("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function ze(e,t,a=!0,{includeImageKeys:n=!0}={}){const r=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${f("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${s(u("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const i=e.map(l=>pt(l,r,a,{includeImageKey:n})),o=e.reduce((l,c)=>{const p=c?.type==="wide"||c?.type==="hero";return l+(p?2:1)},0);return r&&o%2===1&&i.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),i.join("")}function Ee(){const e=d.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const a=B(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${s(a)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${s(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${f("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${s(t.city||"Stadt")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${f("arrow-right","w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `:`
      <div class="app-content-inline app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${f("map-pin","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${s(u("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function xe(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}function he(e={}){const t=String(Le(e)||"").trim().toLowerCase();return t==="hotel"||t==="motel"}function Me(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),a=t?me(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{}}}function ha(e={},t=""){const a=e&&typeof e=="object"?e:{},n=String(a.id||a._id||a.offerId||a.menuItemId||t||"offer").trim();return{...a,id:n,menuItemId:String(a.menuItemId||a.targetMenuItemId||a.itemId||a.targetItemId||"").trim(),title:a.title||a.name||"Oferta",text:a.text||a.desc||a.description||"",imageUrl:a.imageUrl||a.image||a.photoUrl||"",active:a.active!==!1}}function va(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],a=new Set;return t.map((n,r)=>ha(n,`offer_${r}`)).filter(n=>{const r=String(n.id||`${n.title}|${n.text}|${n.imageUrl}`).trim();return!r||a.has(r)?!1:(a.add(r),!0)})}function wa(e={}){const t=Me(e),a=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!a)return!1;const n=d.focus&&typeof d.focus=="object"?d.focus:{},r=String(n.restaurantId||"").trim()===a,i=String(n.truthSource||"").trim().toLowerCase();if(r&&i==="public-menu"||(r&&Array.isArray(n.items)?n.items:[]).length)return!1;const l=va(t);return l.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(d.focus={...n,restaurantId:a,items:l,enabled:n.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:l.length?"seeded":"knownEmpty"},!0):!1}function ya(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const a of t){if(!a||typeof a!="object")continue;const n=Number(a.lat??a.latitude),r=Number(a.lng??a.lon??a.longitude);if(Number.isFinite(n)&&Number.isFinite(r))return{lat:n,lng:r}}return null}function U(e={},t=[]){for(const a of t){const n=String(e?.[a]||"").trim();if(n)return n}return""}function ve(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function $a(e={}){const t=[...ve(e.coverImages),...ve(e.hotelCoverImages),...ve(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(n=>String(n||"").trim()).filter(Boolean),a=[];return t.forEach(n=>{a.includes(n)||a.push(n)}),a.slice(0,8)}function ka(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function Ia(e=""){const t=String(e||"").trim(),a=d.hotelCardEditor&&typeof d.hotelCardEditor=="object"?d.hotelCardEditor:{},n=String(a.restaurantId||"").trim();return n?n===t?a:{}:ka(a)?{}:a}function Sa(e={}){const t=Array.isArray(e.features)?e.features.map(n=>String(n||"").trim()).filter(Boolean):[],a=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[U(e,["hotelFeatureOneText","gardenTerraceText"])||String(a.gardenTerrace||"").trim()||t[0]||"",U(e,["hotelFeatureTwoText","accessibilityText"])||String(a.accessibility||"").trim()||t[1]||"",U(e,["hotelFeatureThreeText","veganOptionsText"])||String(a.veganOptions||"").trim()||t[2]||""]}function Ca(e={}){const t=[],a=(n="")=>{const r=String(n||"").trim();r&&!t.includes(r)&&t.push(r)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(n=>{Array.isArray(n)&&n.forEach(r=>{typeof r=="string"?a(r):r&&typeof r=="object"&&a(r.label||r.name||r.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&a("Në plazh"),(e.restaurant||e.hasRestaurant)&&a("Restaurant"),(e.breakfast||e.breakfastIncluded)&&a("Mëngjes"),(e.pool||e.hasPool)&&a("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&a("WLAN"),(e.parking||e.freeParking||e.hasParking)&&a("Parking"),(e.spa||e.wellness)&&a("Wellness"),t.slice(0,8)}const Fa=[{value:"m",label:"m"},{value:"km",label:"km"}],Pa="Në qendër",ft="Në plazh",Aa=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],ja=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],Ta=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function G(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function La(e="",{direct:t=!1}={}){const a=String(e||"").trim(),n=G(a),r=t||n==="ne_qender"||n==="ne_plazh"||n==="direkt_ne_qender"||n==="direkt_ne_plazh"||n.includes("direkt")&&(n.includes("strand")||n.includes("zentrum")||n.includes("center"))||n.includes("am_strand")||n.includes("im_zentrum"),i=a.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),o=i?i[1].replace(",","."):"",c=(i?String(i[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:o,unit:c,isDirect:r}}function gt({idPrefix:e="",iconName:t="navigation",label:a="",value:n="",directLabel:r="",direct:i=!1}={}){const o=La(n,{direct:i});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${f(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${s(a)}</p>
          <p class="text-[10px] font-bold text-slate-400">${s(r)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${s(e)}Value" type="number" min="0" step="0.1" value="${s(o.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${s(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${Fa.map(l=>`<option value="${s(l.value)}" ${o.unit===l.value?"selected":""}>${s(l.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${s(r)}</span>
        <input id="${s(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${o.isDirect?"checked":""} />
      </label>
    </div>
  `}function _a(e=[],t=""){const a=String(t||"").trim(),n=new Set(e.map(G));return`
    <option value="">Zgjidh</option>
    ${e.map(r=>`<option value="${s(r)}" ${G(r)===G(a)?"selected":""}>${s(r)}</option>`).join("")}
    ${a&&!n.has(G(a))?`<option value="${s(a)}" selected>Aktuale: ${s(a)}</option>`:""}
  `}function Be({id:e="",iconName:t="badge-check",label:a="",value:n="",options:r=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${f(t,"w-4 h-4")}
        </div>
        <label for="${s(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${s(a)}</label>
      </div>
      <select id="${s(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${_a(r,n)}
      </select>
    </div>
  `}function za(e={},t=[]){const a=new Set(t.map(G).filter(Boolean)),n=[],r=(i="")=>{const o=String(i||"").trim();if(!o)return;const l=G(o);a.has(l)||n.some(c=>G(c)===l)||n.push(o)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(i=>ve(i).forEach(r)),n}function Ea({existingImages:e=[],newPreviews:t=[],imageUrlDraft:a=""}={}){const n=[...t.map((o,l)=>({src:o,kind:"new",idx:l})),...e.map((o,l)=>({src:o,kind:"existing",idx:l}))].filter(o=>o.src),r=n[0]?.src||a||"",i=r?B(r,"large"):N;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${s(i||N)}" class="w-full h-52 object-cover bg-white" />
        <button type="button" id="hotelCardCoverImagesTrigger" aria-label="Ngarko foto" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${f("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${f("plus","w-2.5 h-2.5")}
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
                <img src="${s(B(o.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-hotel-card-image-remove="${o.idx}" data-hotel-card-image-source="${o.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${f("x","w-3 h-3")}
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
  `}function we({iconName:e="info",label:t="",value:a="",helper:n=""}={}){return`
    <div class="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm">
      <div class="flex items-start gap-4">
        <div class="w-11 h-11 rounded-[1.25rem] bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          ${f(e,"w-5 h-5")}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">${s(t)}</p>
          <p class="text-sm font-black text-slate-900 leading-snug">${s(a||"Shto detajet")}</p>
          ${n?`<p class="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">${s(n)}</p>`:""}
        </div>
      </div>
    </div>
  `}function mt(e={}){const t=Me(e),a=ya(t),n=U(t,["address","primaryAddress","location","formattedAddress","street"]),r=U(t,["city","locationCity","primaryCity","region","country"]),i=U(t,["beachDistance","distanceToBeach","beachDistanceLabel","strandEntfernung"]),o=U(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),l=U(t,["rating","reviewRating","stars","hotelStars"]),c=U(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),p=Ca(t),g=a?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.lat},${a.lng}`)}`:n||r?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${n} ${r}`.trim())}`:"";return`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm overflow-hidden">
        <div class="h-40 rounded-[1.6rem] bg-cyan-50 border border-cyan-100 relative overflow-hidden mb-4">
          <div class="absolute inset-0 opacity-80" style="background-image: linear-gradient(135deg, rgba(0,204,229,0.18), rgba(15,23,42,0.04));"></div>
          <div class="absolute inset-0 flex items-center justify-center text-cyan-600">
            ${f("map-pin","w-10 h-10")}
          </div>
          <div class="absolute left-4 right-4 bottom-4 bg-white/90 backdrop-blur rounded-2xl p-3 border border-white/70">
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Lokacioni</p>
            <p class="text-xs font-black text-slate-900 leading-snug">${s(n||r||"Shto lokacionin")}</p>
          </div>
        </div>
        ${g?`
          <a href="${s(g)}" target="_blank" rel="noopener noreferrer" class="w-full h-12 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            ${f("navigation","w-4 h-4")} Hap hartën
          </a>
        `:""}
      </div>

      <div class="grid grid-cols-1 gap-4">
        ${we({iconName:"map-pin",label:"Adresa",value:[n,r].filter(Boolean).join(", ")||"Shto lokacionin",helper:a?`${a.lat.toFixed(5)}, ${a.lng.toFixed(5)}`:""})}
        ${we({iconName:"navigation",label:"Qendra",value:o||"Shto detajet"})}
        ${we({iconName:"waves",label:"Plazhi",value:i||(t.beachfront||t.onBeach?ft:"Shto detajet")})}
        ${we({iconName:"star",label:"Vlerësime",value:l?`${l}${c?` / ${c} vlerësime`:""}`:"Pa vlerësime",helper:U(t,["reviewSummary","ratingSummary","commentsSummary"])})}
      </div>

      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Të përfshira</p>
        ${p.length?`
          <div class="flex flex-wrap gap-2">
            ${p.map(b=>`<span class="px-3 py-2 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600">${s(b)}</span>`).join("")}
          </div>
        `:`
          <p class="text-sm font-bold text-slate-400">Shto pajisjet dhe detajet e dhomave.</p>
        `}
      </div>
    </div>
  `}function Ma(e={}){const t=Me(e),a=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),n=t?.name||t?.restaurantName||e?.name||"Hotel",r=Ia(a),i=String(r.status||"").trim(),o=r.saving===!0,l=Array.isArray(r.existingImages)?r.existingImages.map(z=>String(z||"").trim()).filter(Boolean):$a(t),c=Array.isArray(r.imagePreviews)?r.imagePreviews.map(z=>String(z||"").trim()).filter(Boolean):[],p=String(r.imageUrlDraft||"").trim(),[g,b,v]=Sa(t),h=za(t,[g,b,v]),S=U(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),I=U(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),$=U(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),F=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,w=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,y=r.detailsOpen===!0||o,P=c[0]||l[0]||"",C=P?B(P,"thumb"):N,L=[S,I,$?`${$} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",_=i.includes("fehl")||i.includes("Bitte")||i.includes("Nuk");return`
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
            <button type="button" data-hotel-card-details-open aria-expanded="${y?"true":"false"}" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
              ${f("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${y?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${s(C||N)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${s(n)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(L)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${y?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${f("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${i&&!y?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${_?"text-rose-500":"text-slate-500"}">${s(i)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${s(a)}" data-hotel-card-details-panel class="${y?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
                <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              </div>
              <button type="button" data-hotel-card-details-close class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                ${f("x","w-4 h-4")}
              </button>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fotot</p>
              ${Ea({existingImages:l,newPreviews:c,imageUrlDraft:p})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${gt({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:S,directLabel:Pa,direct:F})}
              ${gt({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:I,directLabel:ft,direct:w})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${s($)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Be({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:g,options:Aa})}
              ${Be({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:b,options:ja})}
              ${Be({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:v,options:Ta})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${s(h.join(`
`))}</textarea>
              </div>
            </div>

            ${i?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${_?"text-rose-500":"text-slate-500"}">${s(i)}</div>`:""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${o?"disabled":""}>
              ${o?"Po ruhet...":"Ruaj Hotel Details"}
            </button>
        </div>
        ${We(a,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function ye(e={}){const t=String(d.profileTopTab||"").trim().toLowerCase(),a=String(d.profileContentTab||"").trim().toLowerCase();return xe(e)?t==="menu"?"menu":a==="menu"||a==="posts"?a:"posts":a==="media"||a==="checkins"?a:"posts"}function Re(e={}){const t=String(d.profileTopTab||"").trim().toLowerCase();return xe(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(d.user?.uid||"").trim()?"favorites":"profile"}function bt(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function Ba(e=0,t=1){const a=Math.max(1,Number(t||0)||1),n=Math.round(Number(e||0));if(!Number.isFinite(n))return 0;const r=n%a;return r<0?r+a:r}function Ra(e=0){return bt(e)}function Na(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],a=bt(d.profileLandingStep),n=Ba(d.profileLandingGreetingIndex,t.length),r=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},i=String(r.businessName||e.name||"casarita").trim()||"casarita",o=_e(r.businessNameColor||e.businessNameColor||e.landingBusinessNameColor||"","#111827"),l=o&&o.toLowerCase()!=="#111827"?o:"",c=_e(r.businessNameColorPart1||e.businessNameColorPart1||e.landingBusinessNameColorPart1||o||"","#111827"),p=_e(r.businessNameColorPart2||e.businessNameColorPart2||e.landingBusinessNameColorPart2||l||"","#4f46e5"),g=i.replace(/\.+$/g,"").trim()||i,b=g.split(/\s+/).filter(Boolean),v=b.length>1?b.slice(0,-1).join(" "):g,h=b.length>1?b[b.length-1]:"",S=h?v:`${v}.`,I=h?`${h}.`:"",$=B(r.logoUrl||e.avatar||"","avatar"),w=String($||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",y=String(r.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),P=String(r.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),C=a>=2,L=a>=3,_=Array.isArray(d.profileView?.posts)?d.profileView.posts:Array.isArray(e?.posts)?e.posts:[],z=Ra(a),H=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${f("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(x=>{const k=z===x;return`
            <div data-landing-step-dot="${x}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${k?"1.22":"1"}); opacity: ${k?"1":"0.88"}; background: ${k?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${k?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${k?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${a===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${a===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((x,k)=>{const j=k===n,T=k===(n-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${k}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${j?"opacity: 1; transform: translateY(0) scale(1);":T?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!j&&!T?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${s(x)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${s(w)}" alt="${s(`${i} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${s(c)};">${s(S)}</span>${I?`<span style="color:${s(p)};">${s(I)}</span>`:""}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${s(y)}<br />
            ${s(P)}
          </p>
        </div>
        ${H}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${a<1?"translate-y-full":a===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===1?"1":"0"}; pointer-events: ${a===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${ke(e,_,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${H}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${a<2?"translate-y-full":a===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===2?"1":"0"}; pointer-events: ${a===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${C?ke(e,_,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${H}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${a<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${a===3?"1":"0"}; pointer-events: ${a===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${L?ke(e,_,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function Ne(e=d.profileView?.profile||d.userProfile,{landingPreview:t=!1,selectedTabOverride:a="",compact:n=!1}={}){const r=xe(e),i=String(a||ye(e)).trim().toLowerCase()||"posts",o=he(e),l=r?[{id:"posts",label:u("profile.posts","Beitraege")},{id:"menu",label:o?"Details":u("nav.menu","Menue"),surface:o?"hotel-details":"menu"}]:[{id:"posts",label:u("profile.posts","Beitraege")},{id:"media",label:u("profile.media","Medien")},{id:"checkins",label:u("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${n?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${l.map(c=>`
          <button data-profile-tab="${c.id}" ${c.surface?`data-profile-tab-surface="${s(c.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${i===c.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${c.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function Ue(e=d.profileView?.profile||d.userProfile,{disabled:t=!1}={}){const a=ye(e);return a==="checkins"||a==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${s(u("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${d.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${f("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${d.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${f("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function A(e=""){return String(e||"").trim()}const xt="mnyra_business_title_image_cache_v1",ht=80,vt="mnyra_business_avatar_cache_v1",wt=120;function yt(){if(!d)return{};const e=d.businessTitleImageCache&&typeof d.businessTitleImageCache=="object"?d.businessTitleImageCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const n=(typeof window<"u"?window.localStorage:null)?.getItem?.(xt)||"",r=n?JSON.parse(n):{};r&&typeof r=="object"&&Object.entries(r).forEach(([i,o])=>{const l=A(i),c=A(o);l&&c&&!M(c)&&(t[l]=c)})}catch{}return d.businessTitleImageCache={loaded:!0,items:t},t}function Ua(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem(xt,JSON.stringify(e))}catch{}}function $t(e={},t="business"){const a=[e?.restaurantId,e?.canonicalRestaurantId,e?.uid,e?.handle,e?.publicSlug,e?.landingSlug,e?.name,t].map(n=>A(n)).filter(Boolean);return[...new Set(a)]}function Ha(e=[],t=""){const a=A(t);if(!a||M(a))return;const n=yt();let r=!1;e.forEach(o=>{const l=A(o);!l||n[l]===a||(n[l]=a,r=!0)});const i=Object.entries(n);if(i.length>ht){const o=i.slice(i.length-ht);Object.keys(n).forEach(l=>delete n[l]),o.forEach(([l,c])=>{n[l]=c}),r=!0}r&&Ua(n)}function Oa(e=[]){const t=yt();for(const a of e){const n=A(a),r=n?A(t[n]):"";if(r&&!M(r))return r}return""}function kt(){if(!d)return{};const e=d.businessAvatarCache&&typeof d.businessAvatarCache=="object"?d.businessAvatarCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const n=(typeof window<"u"?window.localStorage:null)?.getItem?.(vt)||"",r=n?JSON.parse(n):{};r&&typeof r=="object"&&Object.entries(r).forEach(([i,o])=>{const l=A(i),c=A(o);l&&c&&!M(c)&&(t[l]=c)})}catch{}return d.businessAvatarCache={loaded:!0,items:t},t}function Da(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem(vt,JSON.stringify(e))}catch{}}function It(e=[],t=""){const a=A(t);if(!a||M(a))return;const n=kt();let r=!1;e.forEach(o=>{const l=A(o);!l||n[l]===a||(n[l]=a,r=!0)});const i=Object.entries(n);if(i.length>wt){const o=i.slice(i.length-wt);Object.keys(n).forEach(l=>delete n[l]),o.forEach(([l,c])=>{n[l]=c}),r=!0}r&&Da(n)}function Ka(e=[]){const t=kt();for(const a of e){const n=A(a),r=n?A(t[n]):"";if(r&&!M(r))return r}return""}function Va(e={},t="business"){return String(e?.restaurantId||e?.canonicalRestaurantId||e?.uid||e?.handle||e?.name||t).trim()||t}function qa(e={}){const a=(Array.isArray(e?.coverImages)?e.coverImages:Array.isArray(e?.titleImages)?e.titleImages:[]).map(n=>String(n||"").trim()).find(Boolean)||"";return String(e?.titleImageUrl||e?.coverImageUrl||e?.coverUrl||e?.heroUrl||a||"").trim()}function Ga(e={},t={}){const a=qa(e),n=Array.isArray(t.cacheKeys)?t.cacheKeys:[],r=A(t.stableKey||n[0]||"");if(!a){if(t.allowCacheFallback===!0){const o=Oa(n);if(o)return o;const l=r?B("","medium",{stableKey:r}):"";return l&&!M(l)?l:""}return""}const i=B(a,"medium",r?{stableKey:r}:void 0);return i&&!M(i)?(Ha(n,i),i):""}function Qa(e={},t={}){const a=A(e?.avatar||""),n=Array.isArray(t.cacheKeys)?t.cacheKeys:[],r=A(t.stableKey||n[0]||"");if(!a){const o=Ka(n);if(o)return o;const l=r?B("","avatar",{stableKey:r}):"";return l&&!M(l)?l:""}const i=B(a,"avatar",r?{stableKey:r}:void 0);return i&&!M(i)?(It(n,i),i):""}function St(e="",t=""){const a=A(e);if(!a)return"";if(/^https?:\/\//i.test(a))return a;const n=a.replace(/^@+/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/^tiktok\.com\/@?/i,"").replace(/^www\.tiktok\.com\/@?/i,"").replace(/^\/+/,"").trim();return n?t==="tiktok"?`https://www.tiktok.com/@${encodeURIComponent(n)}`:t==="instagram"?`https://www.instagram.com/${encodeURIComponent(n)}`:"":""}function Wa(e=""){const t=A(e);if(!t)return"";const a=t.replace(/[^\d+]/g,"");return a?`tel:${a}`:""}function Ya(e={}){const t=Number(e?.gpsLat??e?.lat),a=Number(e?.gpsLng??e?.lng);if(Number.isFinite(t)&&Number.isFinite(a))return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t},${a}`)}`;const n=[e?.address,e?.locationPlace||e?.place,e?.location,e?.city,e?.country].map(r=>A(r)).filter(Boolean).join(", ");return n?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(n)}`:""}function He({href:e="",label:t="",iconName:a="",body:n=""}={}){const r=A(e);return r?`
    <a href="${s(r)}" target="_blank" rel="noreferrer" title="${s(t)}" class="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform">
      ${n||f(a,"w-4 h-4")}
    </a>
  `:""}function $e({href:e="",buttonAttrs:t="",iconName:a="",eyebrow:n="",value:r=""}={}){const i=A(r);if(!i)return"";const o=`
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${f(a,"w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${s(n)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s(i)}</span>
    </div>
  `;return e?`<a href="${s(e)}" target="${e.startsWith("tel:")?"_self":"_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${o}</a>`:`<button type="button" ${t} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${o}</button>`}function Ja({profileName:e="",safeBio:t="",metaLine:a="",identityPending:n=!1,followersLabel:r=""}={}){return`
    <div aria-hidden="true" style="grid-area:1/1;visibility:hidden;pointer-events:none;min-width:0;max-width:100%;overflow:hidden;">
      <div class="h-40 w-full"></div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div class="relative">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px]"></div>
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl text-slate-900 leading-none mb-1">${s(String(r))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <div class="flex flex-col items-center min-w-0">
              <span class="h-7 flex items-center justify-center text-slate-900"></span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.info","Info"))}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${t}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(a)}</p>
          ${n?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${s(u("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-[56px] rounded-[1.2rem]"></div>
          <div class="w-[56px] h-[56px] rounded-[1.2rem]"></div>
        </div>
      </div>
    </div>
  `}function Ct(e={},t={}){const a=t.mode==="self"?"self":"public",n=t.disabledBlockClass||"",r=Va(e,a),i=$t(e,r),o=`business-avatar:${r}`,l=A(t.avatarUrl||""),c=l&&!M(l)?l:Qa(e,{cacheKeys:i,stableKey:o});A(e?.avatar||"")&&c&&!M(c)&&It(i,c);const p=t.avatarFit||Te(!!e.restaurantId),g=String(d?.profileCardInfoOpen||"")===r,b=Number(d?.profileCardInfoHeights?.[r]||0),v=g&&Number.isFinite(b)&&b>0?`height:${Math.ceil(b)}px;`:"",h=t.avatarImgKeyAttr||(a==="self"?'data-img-key="avatar:self"':`data-img-key="avatar:public:${s(r)}"`),S=!!A(e?.avatar||""),$=!!A(c)&&!M(c)&&(t.renderAvatarImage!==!1||!S),F=!!t.identityPending,w=t.followersLabel??R(e.followers),y=A(e?.name)||"User",P=A(t.typeLabel||e?.customerType||e?.type||"Business"),C=A(e?.location||"-"),L=a==="public"?`${C} / ${P}`:C,_=t.bioHtml||s(e?.bio||"").replace(/\n/g,"<br>")||s(u("profile.noBio","Noch keine Bio.")),z=`business-cover:${r}`,H=$t(e,r),x=Ga(e,{cacheKeys:H,stableKey:z,allowCacheFallback:t.allowTitleImageCacheFallback===!0}),k=Ya(e),j=St(e?.instagramUrl||e?.instagram||e?.insta||"","instagram"),T=St(e?.tiktokUrl||e?.tiktok||e?.tikTok||"","tiktok"),E=A(e?.phone||e?.telephone||e?.contactPhone||""),Y=Wa(E),J=A(e?.address||e?.locationLabel||[e?.place||e?.locationPlace,e?.location||e?.city].map(O=>A(O)).filter(Boolean).join(", ")),Z=[$e({href:j,iconName:"instagram",eyebrow:"Instagram",value:e?.instagram||e?.instagramUrl||e?.insta||""}),$e({href:T,iconName:"music-2",eyebrow:"TikTok",value:e?.tiktok||e?.tiktokUrl||e?.tikTok||""})].filter(Boolean).join(""),re=a==="self"?`
      <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
        <span class="relative z-10 flex items-center gap-2">${f("plus","w-4 h-4")} Status</span>
        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
      <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${f("settings","w-5 h-5")}
      </button>
    `:`
      <button data-landing-tutorial-target="follow" data-public-profile-follow="${s(e.handle||"")}" data-target-type="${s(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${s(e.restaurantId||e.uid||"")}" data-target-name="${s(e.name||"")}" data-target-avatar="${s(e.avatar||"")}" ${t.hasPendingFollowRequest?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${t.followTone||"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"} ${t.hasPendingFollowRequest?"opacity-90 cursor-default":""}">
        <span class="relative z-10 flex items-center gap-2">
          ${t.isFollowing?f("check","w-4 h-4"):""}
          ${s(t.followLabel||u("profile.follow","Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${s(e.uid||"")}" data-chat-handle="${s(e.handle||"")}" data-chat-name="${s(e.name||"")}" data-chat-avatar="${s(e.avatar||"")}" ${t.isLocked?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${t.isLocked?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${f("message-circle","w-5 h-5")}
      </button>
    `;if(g){const O=[$e({href:Y,iconName:"phone",eyebrow:u("profile.call","Anrufen"),value:E}),$e({href:k,iconName:"map-pin",eyebrow:u("profile.address","Adresse"),value:J||C}),Z].filter(Boolean).join("");return`
      <div data-landing-tutorial-target="identity" data-business-profile-card="${s(r)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${n}" style="${v}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${Ja({profileName:y,safeBio:_,metaLine:L,identityPending:F,followersLabel:w})}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${s(r)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${f("x","w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(u("profile.contactInfo","Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(C)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${O||`<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(u("profile.noContactInfo","Noch keine Kontaktdaten"))}</div>`}
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 min-w-0 max-w-full overflow-hidden">
            <button type="button" data-profile-card-info-close="${s(r)}" class="w-full h-[56px] rounded-[1.2rem] border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center" style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;">
              ${s(u("profile.backToProfile","Zurueck zum Profil"))}
            </button>
          </div>
        </div>
      </div>
    `}return`
    <div data-landing-tutorial-target="identity" data-business-profile-card="${s(r)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${n}" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${x?`<img src="${s(x)}" data-img-key="${s(z)}" alt="${s(y)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`:`<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${f("store","w-7 h-7")}</div>`}
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${He({href:k,label:u("profile.openMap","Karte oeffnen"),iconName:"map"})}
          ${He({href:T,label:"TikTok",iconName:"music-2"})}
          ${He({href:j,label:"Instagram",iconName:"instagram"})}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${a==="self"?'id="profileAvatarTrigger"':""} class="relative ${a==="self"?"cursor-pointer group":""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${$?`<img src="${s(c)}" decoding="async" width="100" height="100" ${h} class="w-full h-full rounded-[1.8rem] ${p} border-2 border-white bg-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${F?"animate-pulse":""}">${f("store","w-8 h-8 text-slate-300")}</div>`}
            </div>
            ${e.isPremium?`
              <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                ${f("badge-check","w-4 h-4 fill-blue-500 text-white")}
              </div>
            `:""}
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div data-landing-tutorial-target="fans" class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl ${F?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(String(w))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <button type="button" data-profile-card-info-open="${s(r)}" class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${f("info","w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.info","Info"))}</span>
            </button>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(y)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${_}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(L)}</p>
          ${F?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${s(u("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          ${re}
        </div>
      </div>
    </div>
  `}function ke(e={},t=[],{topTabOverride:a="",tutorialMode:n=!1,contentTabOverride:r="",landingHideContent:i=!1,collapseIdentity:o=!1,contentReveal:l=!1,landingMode:c=!1}={}){const p=ba(e),g=!!e.privateAccount&&e.uid&&String(e.uid)!==String(d.user?.uid||"")&&!p,b=!!e.pendingFollowRequest&&!p,v=e.restaurantId?"Business":u("nav.user","User"),h=String(e.handle||Je(e.name||"user")).replace(/^@/,""),I=s(e.bio||"").replace(/\n/g,"<br>")||s(u("profile.noBio","Noch keine Bio.")),$=xe(e),F=String(a||Re(e)).trim().toLowerCase()||"profile",w=String(r||ye(e)).trim().toLowerCase()||"posts",y=w==="menu",P=w==="checkins",C=t,_={...d?.profileView&&typeof d.profileView=="object"?d.profileView:{},profile:e,posts:Array.isArray(C)?C:[]},z=ks(d,{profileView:_,profileTopTab:F,profileContentTab:w}),H=String(z?.header?.status||"").trim().toLowerCase()||"loading",x=String(z?.posts?.status||"").trim().toLowerCase()||"loading",k=String(e?.avatar||"").trim(),j=k?B(k,"avatar"):"",T=Te(!!e.restaurantId),E=e.uid||e.restaurantId||h||"public",Y=c?"":`data-img-key="avatar:public:${s(E)}"`,J=!!k,Z=Ye=>{if(Ye==null)return!1;const Kt=Number(Ye);return Number.isFinite(Kt)&&Kt>=0},re=J||Z(e?.followers)||Z(e?.following),O=je(H)&&!re,Ce=!!String(j||"").trim()&&J,ie=O?"...":R(e.followers),Fe=O?"...":R(e.following),Pe=$?"pt-2":"pt-10",ce=p?u("profile.following","Following"):b?u("profile.requested","Requested"):g?u("profile.request","Request"):u("profile.follow","Follow"),D=p?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":b?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",xs=n?"select-none":"app-main-content-safe",X=n?"pointer-events-none":"",hs=!o,Ot=!i,Ae=l?c?"transition-opacity duration-200":"animate-in fade-in duration-300":"",Dt=w==="posts"&&C.length>0,vs=w!=="posts"||Dt||x==="empty"||x==="error",ws=w==="posts"&&!Dt&&x==="error";return!n&&(w==="posts"||w==="media")&&e?.restaurantId&&je(x)&&Qt(e),`
    <div class="${xs}" ${n?'data-landing-tutorial-surface="true"':""}>
      ${F==="profile"||F==="menu"?`
      ${hs?`
        <div class="app-content-inline pb-2 ${Pe}">
          ${$?Ct(e,{mode:"public",disabledBlockClass:X,avatarUrl:j,avatarFit:T,avatarImgKeyAttr:Y,renderAvatarImage:Ce,identityPending:O,followersLabel:ie,followLabel:ce,followTone:D,isFollowing:p,hasPendingFollowRequest:b,isLocked:g,bioHtml:I,typeLabel:v,allowTitleImageCacheFallback:je(H)||je(x)}):`
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${X}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${Ce?`<img src="${s(j)}" decoding="async" width="100" height="100" ${Y} class="w-full h-full rounded-[1.8rem] ${T} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${O?"animate-pulse":""}">${f(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${f("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${O?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(ie)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${O?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(Fe)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e.name||"User")}</h1>
                ${$?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${s(h)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${I}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(e.location||"-")} / ${v}</p>
                ${O?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${s(u("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${s(e.handle)}" data-target-type="${s(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${s(e.restaurantId||e.uid||"")}" data-target-name="${s(e.name||"")}" data-target-avatar="${s(e.avatar||"")}" ${b?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${D} ${b?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${p?f("check","w-4 h-4"):""}
                    ${ce}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${s(e.uid||"")}" data-chat-handle="${s(e.handle||"")}" data-chat-name="${s(e.name||"")}" data-chat-avatar="${s(e.avatar||"")}" ${g?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${g?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${f("message-circle","w-5 h-5")}
                </button>
              </div>
            </div>
          </div>
          `}
        </div>
      `:""}

      ${g?`
        <div class="app-content-inline pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${f("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${s(u("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${s(u("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${Ne(e,{landingPreview:n,selectedTabOverride:w,compact:o})}
        ${Ot?Ue(e,{disabled:n}):""}

        ${Ot?y?`
          <div class="${X} ${Ae}">
            ${he(e)?mt(e):Se(e,{mode:c?"landing":"profile",allowAutoEnsure:!c})}
          </div>
        `:P?`
          <div class="${X} ${Ae}">
            ${Ee()}
          </div>
        `:`
          ${vs?`
            ${ws?`
              <div class="app-content-inline ${X}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${s(u("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${d.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${X} ${Ae}">
                ${ze(C,d.profileViewMode,!1,{includeImageKeys:!c})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${X}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${Ae}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${F==="cart"?Ze(e):F==="favorites"?Xe(e):""}
      `}
    </div>
  `}function Za(){const e=d.profileView;if(!e||!e.profile)return"";const t=e.profile,a=e.posts||t.posts||[],n=Re(t);return n==="landing"?Na(t):ke(t,a,{topTabOverride:n,tutorialMode:!1})}function Ft(e,{filter:t="all",query:a=""}={}){const n=Array.isArray(e)?e:[],r=ca(a||"");return n.filter(i=>t==="all"||te(i.type)===t?r?`${i.name||""} ${i.category||""} ${i.description||""}`.toLowerCase().includes(r):!0:!1)}function Pt(e,t=0){const a=Number(e);return Number.isFinite(a)?Math.max(0,Math.floor(a)):Math.max(0,Number(t)||0)}function Ie(e=[]){return(Array.isArray(e)?e.slice():[]).map((a,n)=>({item:a,idx:n,order:Pt(a?.orderIndex,n)})).sort((a,n)=>a.order-n.order||a.idx-n.idx).map((a,n)=>({...a.item,orderIndex:Pt(a.item?.orderIndex,n)}))}function Oe(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function le(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":te(e?.type||"food")==="drink"?"drink":"food"}function Xa(e={}){return String(e?.category||u("menu.other","Sonstiges")).trim()||u("menu.other","Sonstiges")}function es(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const ts=4,as={thumb:160,small:480,medium:768,large:1280};function At({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<ts&&a===0}function ss({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){const n=At({mode:e,priorityIndex:t,slideIndex:a}),r=e==="profile"?' data-image-reveal="menu"':"";return n?`loading="eager" fetchpriority="high"${r}`:`loading="lazy" fetchpriority="low"${r}`}function ns({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function Q(e,{mode:t="profile",priorityIndex:a=-1,slideIndex:n=0,stableKey:r="",preferredSize:i="small",candidateSizes:o=["small","medium","large"],variant:l="grid"}={}){const c=String(e||"").trim(),p=t==="profile"&&r?{stableKey:r}:null,g=At({mode:t,priorityIndex:a,slideIndex:n}),b=t==="profile"&&!g&&l!=="thumb",v=B(c,i,p),h=M(v)?N:v,S=sa(c),I=na(c)&&c!==h?c:S,$=[],F=new Set;o.forEach(k=>{const j=as[k]||0;if(!j)return;const T=B(c,k,p);if(!T||M(T))return;const E=`${T}|${j}`;F.has(E)||(F.add(E),$.push(`${T} ${j}w`))});const w=$.length>1?$.join(", "):"",y=w?ns({variant:l}):"",P=b?"":w,C=b?"":y,L=P?` srcset="${s(P)}"`:"",_=C?` sizes="${s(C)}"`:"",z=ss({mode:t,priorityIndex:a,slideIndex:n}),H=`${z}${L}${_}`,x=b?[`data-menu-lazy-src="${s(h)}"`,`data-menu-lazy-fallback="${s(I||N)}"`,w?`data-menu-lazy-srcset="${s(w)}"`:"",y?`data-menu-lazy-sizes="${s(y)}"`:""].filter(Boolean).join(" "):"";return{safeImg:b?N:h,fallbackImg:b?N:I,imageAttrs:H,lazyAttrs:x?` ${x}`:"",srcsetValue:w,sizesValue:y,loadingAttrs:z}}function se(e=[],t,a=null){const n=a instanceof Set?a:new Set;return e.map((r,i)=>{const o=Xa(r),l=es(o),c=!!l&&!n.has(l);return c&&n.add(l),`<div${c?` data-menu-category-anchor="${s(l)}"`:""} class="h-full">${t(r,i)}</div>`}).join("")}function De(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function rs(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function jt(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),a=rs(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),n=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&a?{type:"link",url:a,productId:""}:t==="product"&&n?{type:"product",url:"",productId:n}:{type:"self",url:"",productId:""}}function Tt(){const e=d.menu.filter||"all";return`
    <div class="flex gap-2 mb-5">
      ${(ee(d.userProfile)?[{id:"all",label:u("menu.all","Alle")},{id:"food",label:u("menu.products","Produkte")},{id:"drink",label:u("menu.variants","Varianten")}]:[{id:"all",label:u("menu.all","Alle")},{id:"food",label:u("menu.food","Speisen")},{id:"drink",label:u("menu.drinks","Getraenke")}]).map(n=>`
        <button data-menu-filter="${n.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${e===n.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${n.label}
        </button>
      `).join("")}
    </div>
  `}function is(){const e=ta().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${aa.map(t=>{const a=t.id===e,n=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${a?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${a?f("check",`w-4 h-4 ${n}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function Ke(e,{mode:t="profile",priorityIndex:a=-1}={}){const n=V(e),r=t==="profile"?ne(e,{index:0}):"",{safeImg:i,fallbackImg:o,imageAttrs:l,lazyAttrs:c}=Q(n,{mode:t,priorityIndex:a,stableKey:r,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),p=be(e),g=d.activeTab==="menu"?d.userProfile:d.profileView?.profile||d.userProfile,b=ee(g),v=ct(e,b),h=e.category||"",S=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${s(i)}" data-fallback-src="${s(o)}"${c} class="w-full h-full object-cover" style="object-position:${K(e)};" ${l} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${s(e.name||u("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${s(p)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${h?`<span>${s(h)}</span>`:""}
            <span>${s(v)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${f("more-horizontal","w-4 h-4")}
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
        <img src="${s(i)}" data-fallback-src="${s(o)}"${c} class="w-full h-full object-cover" style="object-position:${K(e)};" ${l} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${s(e.name||u("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${s(p)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${h?`<span>${s(h)}</span>`:""}
          <span>${s(v)}</span>
        </div>
        ${S?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${s(S)}</p>`:""}
      </div>
    </div>
  `}function Ve(e,{mode:t="profile",variant:a="food",priorityIndex:n=-1}={}){const r=V(e),i=t==="profile"?ne(e,{index:0}):"",o=a==="drink",{safeImg:l,fallbackImg:c,imageAttrs:p,lazyAttrs:g}=Q(r,{mode:t,priorityIndex:n,stableKey:i,preferredSize:o?"small":"medium",candidateSizes:o?["small","medium"]:["small","medium","large"],variant:o?"grid":"hero"}),b=be(e),v=d.activeTab==="menu"?d.userProfile:d.profileView?.profile||d.userProfile,h=ee(v),S=ct(e,h),I=e.category||"",$=e.description||"",F=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",w=d.menu.restaurantId||d.profileView?.profile?.restaurantId||d.userProfile.restaurantId||"",y=pe(e),P=nt(w,y),C=P?rt(P):{likes:[],comments:[],counts:{likes:0,comments:0}},L=it(C),_=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${f("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${s(y)}">${s(R(L.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${f("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${s(y)}">${s(R(L.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${F} class="w-full ${o?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${o?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        <img src="${s(l)}" data-fallback-src="${s(c)}"${g} class="w-full h-full object-cover" style="object-position:${K(e)};" ${p} decoding="async" />
      </div>
      ${o?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${s(e.name||u("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${s(b)}</p>
          ${_}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${s(e.name||u("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${s(b)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${I?`<span>${s(I)}</span>`:""}
            <span>${s(S)}</span>
          </div>
          ${$?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${s($)}</p>`:""}
          ${_}
        </div>
      `}
    </div>
  `}function qe(e={}){if(!e?.restaurantId||ee(e))return!1;const t=String(Le(e)||"").trim().toLowerCase();return t==="restaurant"||t==="cafe"||t==="fastfood"}function Lt(e){const t=e?.restaurantId||d.menu.restaurantId||d.profileView?.profile?.restaurantId||d.userProfile.restaurantId||"",a=pe(e),n=nt(t,a),r=n?rt(n):{likes:[],comments:[],counts:{likes:0,comments:0}},i=String(d.user?.uid||"").trim(),o=String(d.user?.handle||"").trim().toLowerCase(),l=!!r.likes?.some(c=>{const p=String(c?.uid||"").trim();if(i&&p&&p===i)return!0;const g=String(c?.handle||"").trim().toLowerCase();return!!o&&!!g&&g===o});return{itemId:a,meta:r,counts:it(r),isLiked:l}}function ne(e,{index:t=0}={}){const a=String(e?.restaurantId||d.menu.restaurantId||d.profileView?.profile?.restaurantId||d.userProfile.restaurantId||"").trim(),n=String(e?.id||pe(e)||"").trim();if(!a||!n)return"";const r=Number(t),i=Number.isFinite(r)?Math.max(0,Math.floor(r)):0;return`menu-detail:${a}:${n}:${i}`}function os(e){const t=typeof st=="function"?st(e):[],a=Array.isArray(t)?t.filter(Boolean):[];if(a.length)return a;const n=V(e);return n?[n]:[]}function W(e){return Is(e?.cardStyle||"",te(e?.type||"food"))}function Ge(e,{menuItemId:t=""}={}){if(!e)return null;const a=String(t||e.menuItemId||e.itemId||e.productId||"").trim();return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:V(e)||e.imageUrl||"",objectPosition:e.objectPosition||K(e),menuItemId:a}}function _t(e,t=[],{mode:a="profile"}={}){const n=e?.restaurantId||"";return!n||!qe(e)||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((r,i)=>{const o=r.imageUrl||"",l=String(r.menuItemId||r.id||"").trim(),{safeImg:c,fallbackImg:p,imageAttrs:g,lazyAttrs:b}=Q(o,{mode:a,priorityIndex:i,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:l?`menu-focus:${n}:${l}`:""}),v=String(r.menuItemId||"").trim(),h=a==="profile"&&v?`data-menu-open="${s(v)}" role="button"`:"";return`
            <div ${h} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${h?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${s(c)}" data-fallback-src="${s(p)}"${b} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${r.objectPosition||"50% 50%"};" ${g} decoding="async" />
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${f("sparkles","w-3 h-3 text-amber-500")}
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
  `}function zt(e,{mode:t="profile",priorityIndex:a=-1}={}){const n=V(e),r=t==="profile"?ne(e,{index:0}):"",{safeImg:i,fallbackImg:o,imageAttrs:l,lazyAttrs:c}=Q(n,{mode:t,priorityIndex:a,stableKey:r,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),p=be(e),g=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",{itemId:b,counts:v,isLiked:h}=Lt(e);return`
    <div ${g} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${s(i)}" data-fallback-src="${s(o)}"${c} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${K(e)};" ${l} decoding="async" />
        <button
          type="button"
          data-menu-card-like="${s(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${h?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${h?"true":"false"}"
        >
          ${f("heart","w-3.5 h-3.5 fill-current opacity-80")}
        </button>
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-[14px] font-black text-slate-900 leading-tight">${s(e.name||"")}</h4>
        </div>
        <p class="text-[12px] text-slate-500 leading-relaxed mb-3">${s(e.description||"")}</p>
        <div class="mt-auto pt-2 flex items-center justify-between">
          <span class="text-[14px] font-black text-slate-900">${s(p)}</span>
          <button type="button" class="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors active:scale-95">
            ${f("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${s(b)}">${s(R(v.likes))}</span>
          <span data-menu-comment-count="${s(b)}">${s(R(v.comments))}</span>
        </div>
      </div>
    </div>
  `}function ls(e,t="profile"){if(t!=="profile")return"";const a=jt(e);return a.type==="link"&&a.url?`data-menu-special-link="${s(a.url)}" role="button" tabindex="0"`:a.type==="product"&&a.productId?`data-menu-open="${s(a.productId)}" role="button"`:`data-menu-open="${s(e.id)}" role="button"`}function Qe(e,{mode:t="profile",size:a="default",priorityIndex:n=-1}={}){const r=V(e),i=t==="profile"?ne(e,{index:0}):"",o=a==="food",{safeImg:l,fallbackImg:c,imageAttrs:p,lazyAttrs:g}=Q(r,{mode:t,priorityIndex:n,stableKey:i,preferredSize:o?"medium":"small",candidateSizes:o?["small","medium","large"]:["small","medium"],variant:o?"hero":"grid"}),b=ls(e,t),v=String(e.category||"Special").trim()||"Special",h=s(String(e.name||"Special")).replace(/\n/g,"<br>");return a==="food"?`
      <div ${b} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${s(l)}" data-fallback-src="${s(c)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${K(e)};" ${p} decoding="async" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${f("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${s(v)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${h}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${b} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${s(l)}" data-fallback-src="${s(c)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${K(e)};" ${p} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${f("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${s(v)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${h}</h4>
        </div>
      </div>
    </div>
  `}function Et(e,{mode:t="profile",priorityIndex:a=-1}={}){const n=be(e),r=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",i=os(e),l=(i.length?i:[V(e)||""]).filter(Boolean),c=l.length?l.slice(0,12):[""],p=c.length>1,{itemId:g,counts:b,isLiked:v}=Lt(e),h=R(Math.max(0,Number(b.likes)||0)),S=R(Math.max(0,Number(b.comments)||0));return`
    <div ${r} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${p?`
          <div
            data-menu-card-gallery-track="${s(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${c.map((I,$)=>{const F=t==="profile"?ne(e,{index:$}):"",w=Q(I||"",{mode:t,priorityIndex:a,slideIndex:$,stableKey:F,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),y=$>0,P=y?N:w.safeImg,C=y?N:w.fallbackImg,L=y?w.loadingAttrs:w.imageAttrs,_=y?"":w.lazyAttrs||"",z=y?` data-menu-card-deferred-src="${s(w.safeImg)}"
                    data-menu-card-deferred-fallback="${s(w.fallbackImg)}"
                    ${w.srcsetValue?`data-menu-card-deferred-srcset="${s(w.srcsetValue)}"`:""}
                    ${w.sizesValue?`data-menu-card-deferred-sizes="${s(w.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${$}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${s(P)}" data-fallback-src="${s(C)}"${_}${z} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${K(e)};" ${L} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${c.map((I,$)=>{const F=t==="profile"?ne(e,{index:$}):"",{safeImg:w,fallbackImg:y,imageAttrs:P,lazyAttrs:C}=Q(I||"",{mode:t,priorityIndex:a,slideIndex:$,stableKey:F,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${s(w)}" data-fallback-src="${s(y)}"${C} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${K(e)};" ${P} decoding="async" />
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
          ${f("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${p?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${c.map((I,$)=>`
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
              <span data-menu-like-count="${s(g)}">${s(h)}</span>
              <span data-menu-comment-count="${s(g)}">${s(S)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${s(u("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${f("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function cs(e,t,{mode:a="profile",publicMenuSurfaceState:n=null}={}){const r=Ie(Array.isArray(t)?t:[]),i=String(e?.restaurantId||"").trim(),o=a==="admin"||fa(i),l=n?.focus?.canRenderFocus?{items:Array.isArray(n.focus.items)?n.focus.items:[],enabled:!0}:i&&o?fe(i):{items:[],enabled:!1},c=l.enabled?(Array.isArray(l.items)?l.items:[]).map(x=>Ge({...x,objectPosition:oe(x)})):[],p=r.filter(x=>W(x)==="testfirst_focus"&&!Oe(x)).map(x=>Ge(x,{menuItemId:x.id||""})).filter(Boolean),g=new Set,b=[...c,...p].filter(x=>{const k=String(x.menuItemId||x.id||`${x.title}|${x.text}|${x.imageUrl}`);return!k||g.has(k)?!1:(g.add(k),!0)}),v=r.filter(x=>!Oe(x)),h=v.filter(x=>W(x)!=="testfirst_focus"),S=h.length?h:v,I=h.length?b:[],$=S.filter(x=>le(x)==="drink"),F=S.filter(x=>le(x)!=="drink"),w=(x=[])=>{const k=[],j=[];return x.forEach(T=>{const E=W(T);E==="testfirst_food"||E==="testfirst_special"&&De(T)==="food"?j.push(T):k.push(T)}),{gridItems:k,foodItems:j}},y=(x,k=-1)=>W(x)==="testfirst_special"?Qe(x,{mode:a,priorityIndex:k}):zt(x,{mode:a,priorityIndex:k});let P=0;const C=()=>{const x=P;return P+=1,x},L=new Set,_=(x,k)=>!k.gridItems.length&&!k.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${s(x)}">
        ${k.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${s(x)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${se(k.gridItems,j=>y(j,C()),L)}
            </div>
          </div>
        `:""}
        ${k.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${s(x)}">
            <div class="app-content-inline">
              ${se(k.foodItems,j=>{const T=W(j),E=C();return T==="testfirst_special"?Qe(j,{mode:a,size:"food",priorityIndex:E}):Et(j,{mode:a,priorityIndex:E})},L)}
            </div>
          </div>
        `:""}
      </section>
    `,z=w($),H=w(F);return`
    <div>
      ${_t(e,I,{mode:a})}
      <div id="menu-section" class="mt-5">
        ${_("drink",z)}
        ${_("food",H)}
      </div>
    </div>
  `}function Mt(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:n=null,priorityOffset:r=0}={}){return e.length?a?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${se(e,(i,o)=>zt(i,{mode:t,priorityIndex:r+o}),n)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${se(e,(i,o)=>Ve(i,{mode:t,variant:"drink",priorityIndex:r+o}),n)}
    </div>
  `:""}function Bt(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:n=null,priorityOffset:r=0}={}){return e.length?a?`
      <div>
        ${se(e,(i,o)=>W(i)==="testfirst_special"&&De(i)==="food"?Qe(i,{mode:t,size:"food",priorityIndex:r+o}):Et(i,{mode:t,priorityIndex:r+o}),n)}
      </div>
    `:`
    <div class="space-y-4">
      ${se(e,(i,o)=>Ve(i,{mode:t,variant:"food",priorityIndex:r+o}),n)}
    </div>
  `:""}function Rt(e,{mode:t="profile"}={}){if(t==="admin"){const a=String(d?.menu?.filter||"all").trim().toLowerCase(),n=e.filter(c=>te(c?.type)==="drink"),r=e.filter(c=>te(c?.type)!=="drink"),i=(c,p,{addType:g=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${s(c)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${s(c)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(R(p.length))} Eintraege</p>
          </div>
          ${g?`
            <button type="button" data-menu-add-${s(g)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${f("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${p.length?`<div class="space-y-3">${p.map(b=>Ke(b,{mode:"admin"})).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(u("menu.noProducts","Keine Produkte"))}</div>`}
      </div>
    `,o=[{title:u("menu.drinks","Getraenke"),list:n,addType:"drink"},{title:u("menu.food","Speisen"),list:r,addType:"food"}];if(a==="all")return`
        <div>
          ${o.map(c=>i(c.title,c.list,{addType:c.addType})).join("")}
        </div>
      `;const l=o.filter(c=>c.list.length>0);return l.length?`
      <div>
        ${l.map(c=>i(c.title,c.list,{addType:c.addType})).join("")}
      </div>
    `:a==="drink"?i(u("menu.drinks","Getraenke"),[],{addType:"drink"}):a==="food"?i(u("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((a,n)=>Ke(a,{mode:t,priorityIndex:n})).join("")}
    </div>
  `:`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
        ${s(u("menu.noProducts","Keine Produkte"))}
      </div>
    `}function We(e,{variant:t="focus",suppressLoading:a=!1}={}){if(!e)return"";const{items:n,enabled:r,loading:i}=fe(e,{includeInactive:!0}),o=R(n.length),l=String(t||"").trim().toLowerCase()==="travel-offers",c=l?"Ofertat":"Sot ne Fokus",p=l?"Oferta":"Highlights",g=l?"Im Travel und Profil sichtbar":"Im Profil sichtbar",b=l?"Ofertat werden geladen...":u("focus.loading","Fokus wird geladen..."),v=l?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${s(c)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${s(p)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(o)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${f("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${l?"Oferta anzeigen":"Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${s(g)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${r?"checked":""} />
      </label>

      ${n.length?`
        <div class="space-y-3">
          ${n.map(h=>{const S=B(h.imageUrl||"","thumb"),I=M(S)?N:S,$=h.active!==!1?"Aktiv":"Inaktiv",F=h.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(I)}" class="w-full h-full object-cover" style="object-position:${oe(h)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(h.title||"Sot ne Fokus")}</p>
                  ${h.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(h.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${F}">${$}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${s(h.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${s(h.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:i&&!a?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(b)}</div>
      `:i?"":`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(v)}</div>
      `}
    </div>
  `}function Nt(e={}){if(!e?.restaurantId)return!1;const t=String(Le(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)?!1:ee(e)||ae(e)||["restaurant","cafe","coffee","fastfood","food","ecommerce"].includes(t)||!t}function ds(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Freigegeben",className:"text-emerald-600"}:t==="rejected"?{label:"Abgelehnt",className:"text-rose-600"}:{label:"Wartet auf Heart",className:"text-amber-600"}}function us(e,t){if(!t||!Nt(e))return"";const{items:a,loading:n}=ia(t,{includeInactive:!0}),r=R(a.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(r)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${f("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${a.length?`
        <div class="space-y-3">
          ${a.map(i=>{const o=B(i.imageUrl||"","thumb"),l=M(o)?N:o,c=ds(i),p=i.category||"RESTAURANT",g=i.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(l)}" class="w-full h-full object-cover" style="object-position:${oe(i)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(i.title||"Ad")}</p>
                  ${i.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(i.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${s(p)} · ${s(g)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${c.className}">${s(c.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-ad-edit="${s(i.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-ad-delete="${s(i.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
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
  `}function ps(e){if(!qe(e)||!ut(e))return"";const a=Ie((d.menu.items||[]).filter(n=>W(n)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(R(a.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${f("plus","w-4 h-4")}
        </button>
      </div>
      ${a.length?`
        <div class="space-y-3">
          ${a.map(n=>{const r=B(V(n),"thumb"),i=M(r)?N:r,o=jt(n),l=o.type==="link"?"Link":o.type==="product"?"Produkt-Modal":"Diese Karte",c=De(n)==="food"?"Food-Size":"Normal",p=ua(le(n));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(i)}" class="w-full h-full object-cover" style="object-position:${K(n)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(n.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${s(p)}</span>
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
  `}function Ut(e,{restaurantId:t="",suppressLoading:a=!1,allowAutoEnsure:n=!0,requirePublicMenuTruth:r=!0}={}){const i=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!i||!ae(e))return"";const o=de(d,{profile:e,routePayload:d?.profileView?.routePayload,webDirectEntry:d?.__webDirectEntry,restaurantId:i});if(r&&o.menu.status!=="ready")return"";const l=!r||o.focus.canRenderFocus;if(n&&!d.focus.loading&&!l&&ue(dt(e,i)),r&&!l)return"";const{items:c,loading:p}=l?{items:Array.isArray(o.focus.items)?o.focus.items:[],loading:o.focus.loading}:fe(i);if(!(l?!0:fe(i).enabled)||!c.length&&!p||a&&p&&!c.length)return"";if(p&&!c.length)return`
      <div class="${ot()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const b=oa(c),v=c[b]||c[0],{safeImg:h,fallbackImg:S,imageAttrs:I,lazyAttrs:$}=Q(v.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:v?.id?`focus-carousel:${i}:${String(v.id)}`:""}),F=v.text||"";return`
    <div id="focusCarousel" class="${ot()} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${c.length>1?`
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${f("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${f("chevron-right","w-4 h-4")}
            </button>
          </div>
        `:""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img data-focus-image src="${s(h)}" data-fallback-src="${s(S)}"${$} class="w-full h-56 object-cover" style="object-position:${oe(v)};" ${I} decoding="async" />
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${s(v.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${F?"":"hidden"}">${s(F)}</p>
      </div>
      ${c.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${c.map((y,P)=>`
            <button type="button" data-focus-dot="${P}" class="w-2.5 h-2.5 rounded-full ${P===b?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function fs(e,t=220){const a=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${a}`}function Ht({label:e,url:t,caption:a}){if(!t)return"";const n=fs(t,240);return`
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
  `}function gs({profile:e,restaurantId:t,catalogLabel:a}){if(!t||!ae(e))return"";if(typeof et=="function"){const i=ge?ge(t):null;(!i||i.sameRestaurant!==!0||!i.loading&&!i.loaded&&!i.error)&&et(e)}const n=typeof ge=="function"?ge(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},r=(n.tables||[]).map(i=>{const o=la("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:i});return Ht({label:`Tisch ${i}`,url:o,caption:`${a} fuer Tisch ${i}`})}).join("");return`
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
      ${r?`
        <div class="grid grid-cols-2 gap-4 mt-6">
          ${r}
        </div>
      `:`
        <div class="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-300">Noch keine Tisch-QR-Codes</p>
        </div>
      `}
    </div>
  `}function ms(){const e=d.userProfile,t=e.restaurantId||"",a=String(d.user?.uid||"").trim(),n=String(d.__authBootstrapInFlightUid||"").trim(),r=!t&&!!a&&(!!d.__authProfileLoadPromise||n===a),i=he(e),o=ae(e),l=d.profileView?.profile?.restaurantId?d.profileView.profile:null,c=Gt()&&!!l?.restaurantId&&ae(l),p=lt(tt(e)),g=t?me(t):null,b=g?.name||g?.restaurantName||e.name||"Business",v=t&&d.menu.restaurantId===t,h=String(d.menu.source||"").trim().toLowerCase(),S=!!v&&h==="collection",I=!!v&&h==="collection"&&d.menu.loading,$=!!t&&(I||!S),F=S?Ft(d.menu.items,{filter:d.menu.filter,query:d.menu.query}):[],y=ut(e)?F:F.filter(L=>!xa(L)),P=Ie(y),C=R(P.length);if(t&&i){wa(e);const L=String(d.focus?.truthSource||"").trim().toLowerCase();return!d.focus.loading&&(d.focus.restaurantId!==t||L!=="public-menu")&&ue(e),Ma(e)}return t&&o&&!S&&!I&&Yt(e),t&&o&&!d.focus.loading&&d.focus.restaurantId!==t&&ue(e),t&&Nt(e)&&Jt(e),o?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${p}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(b)}</p>
        </div>
      </div>

      ${t?`
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${s(C)}</p>
          </div>
        </div>
      `:r?`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Business wird geladen...</p>
        </div>
      `:`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500 mb-4">Bitte zuerst dein Business im Account auswaehlen.</p>
          <button data-nav="settings" class="px-5 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Zu den Einstellungen</button>
        </div>
      `}

      ${t?We(t):""}
      ${t?us(e,t):""}
      ${t&&S?ps(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${f("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${s(d.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${Tt()}

        ${$?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("menu.loading",`${p} wird geladen...`,{label:p}))}</div>`:Rt(P,{mode:"admin"})}
        ${d.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${s(d.menu.error)}</div>`:""}
        ${gs({profile:e,restaurantId:t,catalogLabel:p})}
      `:""}

    </div>
  `:c?Se(l):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${f("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${p}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function Se(e,{mode:t="profile",allowAutoEnsure:a=!0}={}){const n=d?.profileView?.routePayload&&typeof d.profileView.routePayload=="object"?d.profileView.routePayload:null,r=d?.__webDirectEntry&&typeof d.__webDirectEntry=="object"&&d.__webDirectEntry.active===!0?d.__webDirectEntry:null;let i=de(d,{profile:e,routePayload:n,webDirectEntry:r});const o=i.restaurantId||pa(e,n);if(!o)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${s(u("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const l=dt(e,o),c=ae(l);c&&(i=de(d,{profile:l,routePayload:n,webDirectEntry:r,restaurantId:o,coordinateFocusWithMenu:!0}));const p=String(r?.canonicalRestaurantId||r?.restaurantId||"").trim(),g=new Set(i.targetIds),b=ys(i.focus.truthState||""),v=i.menu.status==="ready",h=i.focus.canRenderFocus,S=v&&c,I=i.focus.matches===!0&&i.focus.loading===!0,$=t==="landing",w=String(d?.profileView?.menuAccessSource||r?.menuAccessSource||n?.menuAccessSource||"").trim().toLowerCase()==="qr",y=r?.active===!0&&r?.webPriority===!0&&r?.menuFirst===!0&&String(d?.activeTab||"").trim().toLowerCase()==="profile"&&String(d?.profileTopTab||"").trim().toLowerCase()==="menu"&&(p===o||g.has(o)),P=y&&!w,C=["ready","empty","error"].includes(i.menu.status),L=y&&C,_=y&&(!S||i.menu.status!=="ready"),z=!S||i.focus.settled===!0||b==="knownEmpty"||i.menu.status!=="ready";a&&!L&&!C&&Wt(l),a&&!_&&!z&&!I&&v&&(!P||C)&&ue(l);const x=i.menu.canRenderItems?Ie(Ft(i.menu.items,{filter:"all",query:""})).filter(D=>!Oe(D)):[],k=x.length>0,j=ee(e),T=lt(tt(e)),E=i.menu.error||"",Y=!!String(E||"").trim(),J=i.menu.status==="loading"||i.menu.waitingForFocus===!0,Z=x.filter(D=>le(D)==="drink"),re=x.filter(D=>le(D)!=="drink"),O=0,Ce=Z.length,ie=qe(e),Fe=new Set;k&&o&&(Zt(x,o),ma(x,o));const Pe=o&&h?(Array.isArray(i.focus.items)?i.focus.items:[]).map(D=>Ge({...D,objectPosition:oe(D)})).filter(Boolean):[],ce=Pe.length?_t(l,Pe,{mode:t}):"";return $&&J?'<div class="app-content-inline app-main-content-safe" style="min-height: 34vh;"></div>':ie?`
      <div class="app-main-content-safe">
        ${J?`
          ${ce}
          <div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("menu.loading",`${T} wird geladen...`,{label:T}))}</div>
        `:`
          ${k?cs(l,x,{mode:t,publicMenuSurfaceState:i}):Y?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(u("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:ce||`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">${s(u("menu.noProducts","Keine Produkte"))}</div>`}
          ${E?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(E)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5">
      ${Ut(l,{restaurantId:o,suppressLoading:!0,allowAutoEnsure:v&&(!P||C),requirePublicMenuTruth:!0})}
      ${J?`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("menu.loading",`${T} wird geladen...`,{label:T}))}</div>
        </div>
      `:`
        ${k?`
          ${j?`
            ${ea(x,{profile:e})}
          `:`
            ${Z.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${s(u("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${Mt(Z,{mode:t,useTestfirstCardUi:ie,seenCategories:Fe,priorityOffset:O})}
                </div>
              </section>
            `:""}
            ${re.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${s(u("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${Bt(re,{mode:t,useTestfirstCardUi:ie,seenCategories:Fe,priorityOffset:Ce})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${Y?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                ${s(u("menu.loadError","Menu konnte nicht geladen werden"))}
              </div>
            </div>
          `:`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${s(u("menu.noProducts","Keine Produkte"))}
              </div>
            </div>
          `}
        `}
        ${E?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(E)}</div>`:""}
      `}
    </div>
  `}function bs(){const e=d.userProfile,t=qt(e),a=t?d.businessPosts:d.userPosts,n=String(d.user?.uid||e?.uid||"").trim(),r=String(e?.restaurantId||"").trim(),i=String(d.__userPostsLoadingUid||"").trim(),o=String(d.__businessPostsLoadingRestaurantId||"").trim(),l=String(d.__authBootstrapInFlightUid||"").trim(),c=!!n&&i===n,p=!!r&&o===r,g=!!n&&l===n,b=t?p||g&&!a.length:c||g&&!a.length,v=String(e.handle||Je(e.name||"user")).replace(/^@/,""),S=s(e.bio||"").replace(/\n/g,"<br>")||s(u("profile.noBio","Noch keine Bio.")),I=ye(e),$=I==="menu",F=I==="checkins",w=a,y=B(e.avatar,"avatar"),P=Te(t),C=Re(e);return`
    <div class="app-main-content-safe">
      ${C==="profile"||C==="menu"?`
      <div class="app-content-inline pb-2 ${t?"pt-2":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${t?Ct(e,{mode:"self",avatarUrl:y,avatarFit:P,followersLabel:R(e.followers),bioHtml:S}):`
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${s(y)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${P} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${f("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${s(R(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${s(R(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${s(v)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${S}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(e.location||"-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${f("plus","w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${f("settings","w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
        `}
      </div>

      ${Ne(e)}
      ${Ue(e)}

      ${$?`
        ${he(e)?mt(e):Se(e)}
      `:F?`
        ${Ee()}
      `:`
        ${b&&!w.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${d.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${ze(w,d.profileViewMode)}
          </div>
          ${I==="posts"?`
            <div class="app-content-inline mt-8 mb-4">
              <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  ${f("plus","w-4 h-4")} Neuen Beitrag
                </span>
                <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          `:""}
        `}
      `}
      `:`
        ${C==="cart"?Ze(e):C==="favorites"?Xe(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:pt,renderProfilePostsFancy:ze,renderProfileCheckins:Ee,renderProfileTabs:Ne,renderProfileViewControls:Ue,renderPublicProfileView:Za,renderMenuFilterRow:Tt,renderMenuLayoutSection:is,renderMenuItemCard:Ke,renderMenuItemCardStacked:Ve,renderMenuDrinkGrid:Mt,renderMenuFoodList:Bt,renderMenuList:Rt,renderFocusAdminSection:We,renderFocusCarousel:Ut,renderMenuQrCard:Ht,renderMenuAdminView:ms,renderProfileMenuView:Se,renderProfileView:bs}}export{Ps as createProfileMenuFocusRenderController};
