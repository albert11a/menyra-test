import{k as ge,l as js,t as Ls,g as As,j as ze,a as Ts}from"../entry/social-app.js";import"./startup-route-runtime-context-Cj3OM4Wx.js";import"./vendor-firebase-D0kNzhPF.js";function Ms(h={}){const c=h.state,Gt=h.resolvePostCountsFn,s=h.escapeHtmlFn,U=h.getOptimizedImageUrlFn,m=h.iconFn,Qt=h.isLocalBusinessProfileFn,Wt=typeof h.isCeoUserFn=="function"?h.isCeoUserFn:(()=>!1),at=h.normalizeHandleFn,_e=h.logoFitClassFn,M=h.formatCountFn,st=h.renderProfileShopCartViewFn,nt=h.renderProfileShopFavoritesViewFn,Yt=typeof h.ensurePostsDataForProfileFn=="function"?h.ensurePostsDataForProfileFn:(()=>{}),Zt=h.ensureMenuDataForProfileFn,Jt=typeof h.ensureEditorMenuDataForProfileFn=="function"?h.ensureEditorMenuDataForProfileFn:(()=>{}),me=h.ensureFocusDataForProfileFn,Xt=typeof h.ensureAdsDataForProfileFn=="function"?h.ensureAdsDataForProfileFn:(()=>{}),rt=h.ensureTableQrStateForProfileFn,O=h.isShopCatalogProfileFn,it=h.getBusinessCatalogLabelFn,se=h.normalizeMenuTypeFn,ea=h.primeMenuItemCountsFn,ta=typeof h.hydrateMenuCardViewerLikesFn=="function"?h.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),aa=h.renderShopProductListFn,sa=h.getMenuLayoutThemeFn,na=h.menuLayoutColors,W=h.resolveMenuItemHeroFn,D=h.isPlaceholderUrlFn,N=h.placeholderImage,ra=h.getFirebaseStorageUrlFn,ia=h.isDirectImageUrlFn,ot=h.formatPriceFn,oa=typeof h.resolveCurrencyCodeForMenuItemFn=="function"?h.resolveCurrencyCodeForMenuItemFn:(()=>""),lt=h.getMenuItemImagesFn,q=h.getMenuItemObjectPositionFn,be=h.getMenuItemSocialIdFn,ct=h.menuItemMetaKeyFn,dt=h.ensureMenuItemMetaFn,ut=h.resolveMenuItemCountsFn,he=h.getFocusStateForRestaurantFn,la=typeof h.getAdsStateForRestaurantFn=="function"?h.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),xe=h.getTableQrStateForRestaurantFn,oe=h.getFocusItemObjectPositionFn,pt=h.getFocusCardClassFn,ca=h.getFocusIndexFn,ae=h.isRestaurantCafeProfileFn,Ue=typeof h.getBusinessProfileTypeFn=="function"?h.getBusinessProfileTypeFn:(()=>""),le=h.getRestaurantMetaByIdFn,da=h.buildUrlFn,ua=h.normalizeSearchKeyFn,pa=h.normalizeFollowHandleFn,Z={key:"",inFlightKey:""},p=(e,t=e,a={})=>Ls(e,{fallback:t,params:a}),ft=(e="")=>{const t=String(e||"").trim();if(!t)return p("nav.menu","Menue");const a=t.toLowerCase();return a==="menue"||a==="menu"||a==="menü"?p("nav.menu",t):a==="shop"?"Shop":t},gt=(e="")=>{const t=String(e||"").trim();if(!t)return"";const a=t.toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(a)?p("menu.products","Produkte"):t},fa=(e="food",t=!1)=>t?p("menu.products","Produkte"):String(e||"").trim().toLowerCase()==="drink"?p("menu.drinks","Getraenke"):p("menu.food","Speisen"),mt=(e={},t=!1)=>{const a=se(e?.type||"food");return t?p("menu.product","Produkt"):a==="drink"?p("menu.drinkItem","Getraenk"):p("menu.foodItem","Speise")},Me=(e="",t="#111827")=>{const a=String(e||"").trim();return/^#[0-9a-fA-F]{6}$/.test(a)?a:t};function ga(e=null,t=null){return ge(c,{profile:e,routePayload:t,webDirectEntry:c?.__webDirectEntry}).restaurantId}function bt(e=null,t=""){if(!e||typeof e!="object")return e;const a=String(t||"").trim();if(!a)return e;const n=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===a&&n?e:{...e,restaurantId:a,...n?{canonicalRestaurantId:n}:{}}}function ma(e=""){const t=String(e||"").trim();return t?ge(c,{profile:c?.profileView?.profile||c?.userProfile,routePayload:c?.profileView?.routePayload,webDirectEntry:c?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function ce(e={}){const t=String(oa(e)||"").trim();return t?ot(e?.price,t):ot(e?.price)}function ba(e=[],t="",a=""){const n=String(t||"").trim(),i=String(a||"").trim();if(!n||!i)return"";const r=Array.isArray(e)?e:[];if(!r.length)return`${n}|${i}|empty`;const o=[];return r.forEach(l=>{const d=String(be(l)||l?.id||"").trim();d&&o.push(d)}),o.length?(o.sort(),`${n}|${i}|${o.join(",")}`):`${n}|${i}|empty`}function ha(e=[],t=""){const a=String(c.user?.uid||"").trim(),n=ba(e,t,a);n&&Z.inFlightKey!==n&&Z.key!==n&&(Z.key=n,Z.inFlightKey=n,ta(e,t).catch(i=>{console.error(i),Z.key===n&&(Z.key="")}).finally(()=>{Z.inFlightKey===n&&(Z.inFlightKey="")}))}function xa(e={}){const t=String(e?.uid||"").trim();if(t&&c.followingTargetIds.includes(t))return!0;const a=String(e?.restaurantId||"").trim();if(a&&c.followingTargetIds.includes(a))return!0;const n=pa(e?.handle||"");return!!(n&&c.followingHandles.includes(n))}function ht(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const a=typeof le=="function"&&le(t)||null;return a?.specialEnabled===!0?!0:(a?.specialEnabled===!1,!1)}function va(e={}){return ee(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function xt(e,t,a=!0,{includeImageKey:n=!0}={}){const i=Gt(e),r=e.id?String(e.id):"",o=r?`data-open-post="${s(r)}"`:"",l=r?`data-post-like-count="${s(r)}"`:"",d=r?`data-post-comment-count="${s(r)}"`:"",f=n&&r?`data-img-key="profile-post:${s(r)}"`:"",u=e.type==="wide"||e.type==="hero",b=t&&u?"col-span-2":"",x=t&&u?"aspect-[1.8/1]":"aspect-[4/5]",g=U(e.url,u?"large":"medium",{stableKey:r?`profile-post:${r}`:"",variantGroup:"post-detail"}),S=u?800:400,k=u?400:500;return`
    <div ${o} role="button" tabindex="0" class="${b} relative ${x} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${s(g)}" loading="lazy" decoding="async" width="${S}" height="${k}" ${f} class="w-full h-full object-cover" />
        ${e.isVideo?`<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${m("play","w-3 h-3 fill-white")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${m("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${l} class="text-[10px] font-bold tracking-wide">${s(i.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${m("message-circle","w-3 h-3 text-indigo-200")}
                <span ${d} class="text-[10px] font-bold tracking-wide">${s(i.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${r&&a?`
        <button type="button" data-profile-menu-button="${s(r)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${m("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${s(r)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${s(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${m(u?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${u?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${s(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${m("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function Ee(e,t,a=!0,{includeImageKeys:n=!0}={}){const i=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${m("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${s(p("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const r=e.map(l=>xt(l,i,a,{includeImageKey:n})),o=e.reduce((l,d)=>{const f=d?.type==="wide"||d?.type==="hero";return l+(f?2:1)},0);return i&&o%2===1&&r.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),r.join("")}function Re(){const e=c.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const a=U(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${s(a)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${s(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${m("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${s(t.city||"Stadt")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${m("arrow-right","w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `:`
      <div class="app-content-inline app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${m("map-pin","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${s(p("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function ve(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}function we(e={}){const t=String(Ue(e)||"").trim().toLowerCase();return t==="hotel"||t==="motel"}function Be(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),a=t?le(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{}}}function wa(e={},t=""){const a=e&&typeof e=="object"?e:{},n=String(a.id||a._id||a.offerId||a.menuItemId||t||"offer").trim();return{...a,id:n,menuItemId:String(a.menuItemId||a.targetMenuItemId||a.itemId||a.targetItemId||"").trim(),title:a.title||a.name||"Oferta",text:a.text||a.desc||a.description||"",imageUrl:a.imageUrl||a.image||a.photoUrl||"",active:a.active!==!1}}function ya(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],a=new Set;return t.map((n,i)=>wa(n,`offer_${i}`)).filter(n=>{const i=String(n.id||`${n.title}|${n.text}|${n.imageUrl}`).trim();return!i||a.has(i)?!1:(a.add(i),!0)})}function $a(e={}){const t=Be(e),a=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!a)return!1;const n=c.focus&&typeof c.focus=="object"?c.focus:{},i=String(n.restaurantId||"").trim()===a,r=String(n.truthSource||"").trim().toLowerCase();if(i&&r==="public-menu"||(i&&Array.isArray(n.items)?n.items:[]).length)return!1;const l=ya(t);return l.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(c.focus={...n,restaurantId:a,items:l,enabled:n.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:l.length?"seeded":"knownEmpty"},!0):!1}function ka(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const a of t){if(!a||typeof a!="object")continue;const n=Number(a.lat??a.latitude),i=Number(a.lng??a.lon??a.longitude);if(Number.isFinite(n)&&Number.isFinite(i))return{lat:n,lng:i}}return null}function H(e={},t=[]){for(const a of t){const n=String(e?.[a]||"").trim();if(n)return n}return""}function ye(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function Ia(e={}){const t=[...ye(e.coverImages),...ye(e.hotelCoverImages),...ye(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(n=>String(n||"").trim()).filter(Boolean),a=[];return t.forEach(n=>{a.includes(n)||a.push(n)}),a.slice(0,8)}function Sa(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function Ca(e=""){const t=String(e||"").trim(),a=c.hotelCardEditor&&typeof c.hotelCardEditor=="object"?c.hotelCardEditor:{},n=String(a.restaurantId||"").trim();return n?n===t?a:{}:Sa(a)?{}:a}function Pa(e={}){const t=Array.isArray(e.features)?e.features.map(n=>String(n||"").trim()).filter(Boolean):[],a=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[H(e,["hotelFeatureOneText","gardenTerraceText"])||String(a.gardenTerrace||"").trim()||t[0]||"",H(e,["hotelFeatureTwoText","accessibilityText"])||String(a.accessibility||"").trim()||t[1]||"",H(e,["hotelFeatureThreeText","veganOptionsText"])||String(a.veganOptions||"").trim()||t[2]||""]}function Fa(e={}){const t=[],a=(n="")=>{const i=String(n||"").trim();i&&!t.includes(i)&&t.push(i)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(n=>{Array.isArray(n)&&n.forEach(i=>{typeof i=="string"?a(i):i&&typeof i=="object"&&a(i.label||i.name||i.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&a("Në plazh"),(e.restaurant||e.hasRestaurant)&&a("Restaurant"),(e.breakfast||e.breakfastIncluded)&&a("Mëngjes"),(e.pool||e.hasPool)&&a("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&a("WLAN"),(e.parking||e.freeParking||e.hasParking)&&a("Parking"),(e.spa||e.wellness)&&a("Wellness"),t.slice(0,8)}const ja=[{value:"m",label:"m"},{value:"km",label:"km"}],La="Në qendër",vt="Në plazh",Aa=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],Ta=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],za=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function J(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function _a(e="",{direct:t=!1}={}){const a=String(e||"").trim(),n=J(a),i=t||n==="ne_qender"||n==="ne_plazh"||n==="direkt_ne_qender"||n==="direkt_ne_plazh"||n.includes("direkt")&&(n.includes("strand")||n.includes("zentrum")||n.includes("center"))||n.includes("am_strand")||n.includes("im_zentrum"),r=a.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),o=r?r[1].replace(",","."):"",d=(r?String(r[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:o,unit:d,isDirect:i}}function wt({idPrefix:e="",iconName:t="navigation",label:a="",value:n="",directLabel:i="",direct:r=!1}={}){const o=_a(n,{direct:r});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${m(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${s(a)}</p>
          <p class="text-[10px] font-bold text-slate-400">${s(i)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${s(e)}Value" type="number" min="0" step="0.1" value="${s(o.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${s(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${ja.map(l=>`<option value="${s(l.value)}" ${o.unit===l.value?"selected":""}>${s(l.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${s(i)}</span>
        <input id="${s(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${o.isDirect?"checked":""} />
      </label>
    </div>
  `}function Ua(e=[],t=""){const a=String(t||"").trim(),n=new Set(e.map(J));return`
    <option value="">Zgjidh</option>
    ${e.map(i=>`<option value="${s(i)}" ${J(i)===J(a)?"selected":""}>${s(i)}</option>`).join("")}
    ${a&&!n.has(J(a))?`<option value="${s(a)}" selected>Aktuale: ${s(a)}</option>`:""}
  `}function Ne({id:e="",iconName:t="badge-check",label:a="",value:n="",options:i=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${m(t,"w-4 h-4")}
        </div>
        <label for="${s(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${s(a)}</label>
      </div>
      <select id="${s(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${Ua(i,n)}
      </select>
    </div>
  `}function Ma(e={},t=[]){const a=new Set(t.map(J).filter(Boolean)),n=[],i=(r="")=>{const o=String(r||"").trim();if(!o)return;const l=J(o);a.has(l)||n.some(d=>J(d)===l)||n.push(o)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(r=>ye(r).forEach(i)),n}function Ea({existingImages:e=[],newPreviews:t=[],imageUrlDraft:a=""}={}){const n=[...t.map((o,l)=>({src:o,kind:"new",idx:l})),...e.map((o,l)=>({src:o,kind:"existing",idx:l}))].filter(o=>o.src),i=n[0]?.src||a||"",r=i?U(i,"large"):N;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${s(r||N)}" class="w-full h-52 object-cover bg-white" />
        <button type="button" id="hotelCardCoverImagesTrigger" aria-label="Ngarko foto" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${m("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${m("plus","w-2.5 h-2.5")}
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
                <img src="${s(U(o.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-hotel-card-image-remove="${o.idx}" data-hotel-card-image-source="${o.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${m("x","w-3 h-3")}
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
          ${m(e,"w-5 h-5")}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">${s(t)}</p>
          <p class="text-sm font-black text-slate-900 leading-snug">${s(a||"Shto detajet")}</p>
          ${n?`<p class="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">${s(n)}</p>`:""}
        </div>
      </div>
    </div>
  `}function yt(e={}){const t=Be(e),a=ka(t),n=H(t,["address","primaryAddress","location","formattedAddress","street"]),i=H(t,["city","locationCity","primaryCity","region","country"]),r=H(t,["beachDistance","distanceToBeach","beachDistanceLabel","strandEntfernung"]),o=H(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),l=H(t,["rating","reviewRating","stars","hotelStars"]),d=H(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),f=Fa(t),u=a?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.lat},${a.lng}`)}`:n||i?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${n} ${i}`.trim())}`:"";return`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm overflow-hidden">
        <div class="h-40 rounded-[1.6rem] bg-cyan-50 border border-cyan-100 relative overflow-hidden mb-4">
          <div class="absolute inset-0 opacity-80" style="background-image: linear-gradient(135deg, rgba(0,204,229,0.18), rgba(15,23,42,0.04));"></div>
          <div class="absolute inset-0 flex items-center justify-center text-cyan-600">
            ${m("map-pin","w-10 h-10")}
          </div>
          <div class="absolute left-4 right-4 bottom-4 bg-white/90 backdrop-blur rounded-2xl p-3 border border-white/70">
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Lokacioni</p>
            <p class="text-xs font-black text-slate-900 leading-snug">${s(n||i||"Shto lokacionin")}</p>
          </div>
        </div>
        ${u?`
          <a href="${s(u)}" target="_blank" rel="noopener noreferrer" class="w-full h-12 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            ${m("navigation","w-4 h-4")} Hap hartën
          </a>
        `:""}
      </div>

      <div class="grid grid-cols-1 gap-4">
        ${$e({iconName:"map-pin",label:"Adresa",value:[n,i].filter(Boolean).join(", ")||"Shto lokacionin",helper:a?`${a.lat.toFixed(5)}, ${a.lng.toFixed(5)}`:""})}
        ${$e({iconName:"navigation",label:"Qendra",value:o||"Shto detajet"})}
        ${$e({iconName:"waves",label:"Plazhi",value:r||(t.beachfront||t.onBeach?vt:"Shto detajet")})}
        ${$e({iconName:"star",label:"Vlerësime",value:l?`${l}${d?` / ${d} vlerësime`:""}`:"Pa vlerësime",helper:H(t,["reviewSummary","ratingSummary","commentsSummary"])})}
      </div>

      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Të përfshira</p>
        ${f.length?`
          <div class="flex flex-wrap gap-2">
            ${f.map(b=>`<span class="px-3 py-2 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600">${s(b)}</span>`).join("")}
          </div>
        `:`
          <p class="text-sm font-bold text-slate-400">Shto pajisjet dhe detajet e dhomave.</p>
        `}
      </div>
    </div>
  `}function Ra(e={}){const t=Be(e),a=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),n=t?.name||t?.restaurantName||e?.name||"Hotel",i=Ca(a),r=String(i.status||"").trim(),o=i.saving===!0,l=Array.isArray(i.existingImages)?i.existingImages.map(T=>String(T||"").trim()).filter(Boolean):Ia(t),d=Array.isArray(i.imagePreviews)?i.imagePreviews.map(T=>String(T||"").trim()).filter(Boolean):[],f=String(i.imageUrlDraft||"").trim(),[u,b,x]=Pa(t),g=Ma(t,[u,b,x]),S=H(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),k=H(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),$=H(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),F=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,y=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,C=i.detailsOpen===!0||o,j=d[0]||l[0]||"",P=j?U(j,"thumb"):N,A=[S,k,$?`${$} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",w=r.includes("fehl")||r.includes("Bitte")||r.includes("Nuk");return`
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
            <button type="button" data-hotel-card-details-open aria-expanded="${C?"true":"false"}" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
              ${m("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${C?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${s(P||N)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${s(n)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(A)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${C?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${m("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${r&&!C?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${w?"text-rose-500":"text-slate-500"}">${s(r)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${s(a)}" data-hotel-card-details-panel class="${C?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
                <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              </div>
              <button type="button" data-hotel-card-details-close class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                ${m("x","w-4 h-4")}
              </button>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fotot</p>
              ${Ea({existingImages:l,newPreviews:d,imageUrlDraft:f})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${wt({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:S,directLabel:La,direct:F})}
              ${wt({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:k,directLabel:vt,direct:y})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${s($)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Ne({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:u,options:Aa})}
              ${Ne({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:b,options:Ta})}
              ${Ne({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:x,options:za})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${s(g.join(`
`))}</textarea>
              </div>
            </div>

            ${r?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${w?"text-rose-500":"text-slate-500"}">${s(r)}</div>`:""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${o?"disabled":""}>
              ${o?"Po ruhet...":"Ruaj Hotel Details"}
            </button>
        </div>
        ${Ye(a,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function ke(e={}){const t=String(c.profileTopTab||"").trim().toLowerCase(),a=String(c.profileContentTab||"").trim().toLowerCase();return ve(e)?t==="menu"?"menu":a==="menu"||a==="posts"?a:"posts":a==="media"||a==="checkins"?a:"posts"}function He(e={}){const t=String(c.profileTopTab||"").trim().toLowerCase();return ve(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(c.user?.uid||"").trim()?"favorites":"profile"}function $t(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function Ba(e=0,t=1){const a=Math.max(1,Number(t||0)||1),n=Math.round(Number(e||0));if(!Number.isFinite(n))return 0;const i=n%a;return i<0?i+a:i}function Na(e=0){return $t(e)}function Ha(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],a=$t(c.profileLandingStep),n=Ba(c.profileLandingGreetingIndex,t.length),i=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},r=String(i.businessName||e.name||"casarita").trim()||"casarita",o=Me(i.businessNameColor||e.businessNameColor||e.landingBusinessNameColor||"","#111827"),l=o&&o.toLowerCase()!=="#111827"?o:"",d=Me(i.businessNameColorPart1||e.businessNameColorPart1||e.landingBusinessNameColorPart1||o||"","#111827"),f=Me(i.businessNameColorPart2||e.businessNameColorPart2||e.landingBusinessNameColorPart2||l||"","#4f46e5"),u=r.replace(/\.+$/g,"").trim()||r,b=u.split(/\s+/).filter(Boolean),x=b.length>1?b.slice(0,-1).join(" "):u,g=b.length>1?b[b.length-1]:"",S=g?x:`${x}.`,k=g?`${g}.`:"",$=U(i.logoUrl||e.avatar||"","avatar"),y=String($||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",C=String(i.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),j=String(i.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),P=a>=2,A=a>=3,w=Array.isArray(c.profileView?.posts)?c.profileView.posts:Array.isArray(e?.posts)?e.posts:[],T=Na(a),R=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${m("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(v=>{const I=T===v;return`
            <div data-landing-step-dot="${v}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${I?"1.22":"1"}); opacity: ${I?"1":"0.88"}; background: ${I?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${I?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${I?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${a===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${a===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((v,I)=>{const L=I===n,z=I===(n-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${I}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${L?"opacity: 1; transform: translateY(0) scale(1);":z?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!L&&!z?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${s(v)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${s(y)}" alt="${s(`${r} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${s(d)};">${s(S)}</span>${k?`<span style="color:${s(f)};">${s(k)}</span>`:""}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${s(C)}<br />
            ${s(j)}
          </p>
        </div>
        ${R}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${a<1?"translate-y-full":a===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===1?"1":"0"}; pointer-events: ${a===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${Ce(e,w,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${R}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${a<2?"translate-y-full":a===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===2?"1":"0"}; pointer-events: ${a===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${P?Ce(e,w,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${R}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${a<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${a===3?"1":"0"}; pointer-events: ${a===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${A?Ce(e,w,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function Oe(e=c.profileView?.profile||c.userProfile,{landingPreview:t=!1,selectedTabOverride:a="",compact:n=!1}={}){const i=ve(e),r=String(a||ke(e)).trim().toLowerCase()||"posts",o=we(e),l=O(e),d=o?"Details":l?"Shop":p("nav.menu","Menue"),f=i?[{id:"posts",label:p("profile.posts","Beitraege")},{id:"menu",label:d,surface:o?"hotel-details":"menu"}]:[{id:"posts",label:p("profile.posts","Beitraege")},{id:"media",label:p("profile.media","Medien")},{id:"checkins",label:p("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${n?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${f.map(u=>`
          <button data-profile-tab="${u.id}" ${u.surface?`data-profile-tab-surface="${s(u.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${r===u.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${u.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function De(e=c.profileView?.profile||c.userProfile,{disabled:t=!1}={}){const a=ke(e);return a==="checkins"||a==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${s(p("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${c.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${m("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${c.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${m("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function E(e=""){return String(e||"").trim()}const kt="mnyra_business_title_image_cache_v1",It=80;function St(){if(!c)return{};const e=c.businessTitleImageCache&&typeof c.businessTitleImageCache=="object"?c.businessTitleImageCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const n=(typeof window<"u"?window.localStorage:null)?.getItem?.(kt)||"",i=n?JSON.parse(n):{};i&&typeof i=="object"&&Object.entries(i).forEach(([r,o])=>{const l=E(r),d=E(o);l&&d&&!D(d)&&(t[l]=d)})}catch{}return c.businessTitleImageCache={loaded:!0,items:t},t}function Oa(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem(kt,JSON.stringify(e))}catch{}}function Da(e={},t="business"){const a=[e?.restaurantId,e?.canonicalRestaurantId,e?.uid,e?.handle,e?.publicSlug,e?.landingSlug,e?.name,t].map(n=>E(n)).filter(Boolean);return[...new Set(a)]}function Va(e=[],t=""){const a=E(t);if(!a||D(a))return;const n=St();let i=!1;e.forEach(o=>{const l=E(o);!l||n[l]===a||(n[l]=a,i=!0)});const r=Object.entries(n);if(r.length>It){const o=r.slice(r.length-It);Object.keys(n).forEach(l=>delete n[l]),o.forEach(([l,d])=>{n[l]=d}),i=!0}i&&Oa(n)}function Ka(e=[]){const t=St();for(const a of e){const n=E(a),i=n?E(t[n]):"";if(i&&!D(i))return i}return""}function qa(e={},t="business"){return String(e?.restaurantId||e?.canonicalRestaurantId||e?.uid||e?.handle||e?.name||t).trim()||t}function Ga(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.id||e?.landingRestaurantId||e?.documentId||"").trim()}function Qa(e={}){const a=(Array.isArray(e?.coverImages)?e.coverImages:Array.isArray(e?.titleImages)?e.titleImages:[]).map(n=>String(n||"").trim()).find(Boolean)||"";return String(e?.titleImageUrl||e?.coverImageUrl||e?.coverUrl||e?.heroUrl||a||"").trim()}function Wa(e={},t={}){const a=Qa(e),n=Array.isArray(t.cacheKeys)?t.cacheKeys:[],i=E(t.stableKey||n[0]||"");if(!a){if(t.allowCacheFallback===!0){const o=Ka(n);if(o)return o;const l=i?U("","medium",{stableKey:i}):"";return l&&!D(l)?l:""}return""}const r=U(a,"medium",i?{stableKey:i}:void 0);return r&&!D(r)?(Va(n,r),r):""}function Ct(e="",t=""){const a=E(e);if(!a)return"";if(/^https?:\/\//i.test(a))return a;const n=a.replace(/^@+/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/^tiktok\.com\/@?/i,"").replace(/^www\.tiktok\.com\/@?/i,"").replace(/^\/+/,"").trim();return n?t==="tiktok"?`https://www.tiktok.com/@${encodeURIComponent(n)}`:t==="instagram"?`https://www.instagram.com/${encodeURIComponent(n)}`:"":""}function Ya(e=""){const t=E(e);if(!t)return"";const a=t.replace(/[^\d+]/g,"");return a?`tel:${a}`:""}function Za(e={}){const t=Number(e?.gpsLat??e?.lat),a=Number(e?.gpsLng??e?.lng);if(Number.isFinite(t)&&Number.isFinite(a))return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t},${a}`)}`;const n=[e?.address,e?.locationPlace||e?.place,e?.location,e?.city,e?.country].map(i=>E(i)).filter(Boolean).join(", ");return n?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(n)}`:""}function Ie({href:e="",label:t="",iconName:a="",body:n="",buttonAttrs:i=""}={}){const r=E(e),o=String(i||"").trim();if(!r&&!o)return"";const l=n||m(a,"w-4 h-4"),d="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform";return o?`
    <button type="button" ${o} title="${s(t)}" aria-label="${s(t)}" class="${d}">
      ${l}
    </button>
  `:`
    <a href="${s(r)}" target="_blank" rel="noreferrer" title="${s(t)}" class="${d}">
      ${l}
    </a>
  `}function Se({href:e="",buttonAttrs:t="",iconName:a="",eyebrow:n="",value:i=""}={}){const r=E(i);if(!r)return"";const o=`
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${m(a,"w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${s(n)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s(r)}</span>
    </div>
  `;return e?`<a href="${s(e)}" target="${e.startsWith("tel:")?"_self":"_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${o}</a>`:`<button type="button" ${t} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${o}</button>`}function Ja({profileName:e="",safeBio:t="",metaLine:a="",identityPending:n=!1,followersLabel:i=""}={}){return`
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
  `}function Pt(e={},t={}){const a=t.mode==="self"?"self":"public",n=t.disabledBlockClass||"",i=t.avatarUrl||U(e.avatar||"","avatar"),r=t.avatarFit||_e(!!e.restaurantId),o=qa(e,a),l=String(c?.profileCardInfoOpen||"")===o,d=Number(c?.profileCardInfoHeights?.[o]||0),f=l&&Number.isFinite(d)&&d>0?`height:${Math.ceil(d)}px;`:"",u=t.avatarImgKeyAttr||(a==="self"?'data-img-key="avatar:self"':`data-img-key="avatar:public:${s(o)}"`),b=t.renderAvatarImage!==!1&&!!String(i||"").trim()&&!!String(e?.avatar||"").trim(),x=!!t.identityPending,g=t.followersLabel??M(e.followers),S=E(e?.name)||"User",k=E(t.typeLabel||e?.customerType||e?.type||"Business"),$=E(e?.location||"-"),F=a==="public"?`${$} / ${k}`:$,y=t.bioHtml||s(e?.bio||"").replace(/\n/g,"<br>")||s(p("profile.noBio","Noch keine Bio.")),C=`business-cover:${o}`,j=Da(e,o),P=Wa(e,{cacheKeys:j,stableKey:C,allowCacheFallback:t.allowTitleImageCacheFallback===!0}),A=Za(e),w=Ga(e),T=Ie(w?{buttonAttrs:`data-marketplace-open-map="${s(w)}"`,label:p("profile.openMap","Karte oeffnen"),iconName:"map"}:{href:A,label:p("profile.openMap","Karte oeffnen"),iconName:"map"}),R=Ct(e?.instagramUrl||e?.instagram||e?.insta||"","instagram"),v=Ct(e?.tiktokUrl||e?.tiktok||e?.tikTok||"","tiktok"),I=E(e?.phone||e?.telephone||e?.contactPhone||""),L=Ya(I),z=E(e?.address||e?.locationLabel||[e?.place||e?.locationPlace,e?.location||e?.city].map(V=>E(V)).filter(Boolean).join(", ")),_=[Se({href:R,iconName:"instagram",eyebrow:"Instagram",value:e?.instagram||e?.instagramUrl||e?.insta||""}),Se({href:v,iconName:"music-2",eyebrow:"TikTok",value:e?.tiktok||e?.tiktokUrl||e?.tikTok||""})].filter(Boolean).join(""),B=a==="self"?`
      <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
        <span class="relative z-10 flex items-center gap-2">${m("plus","w-4 h-4")} Status</span>
        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
      <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${m("settings","w-5 h-5")}
      </button>
    `:`
      <button data-landing-tutorial-target="follow" data-public-profile-follow="${s(e.handle||"")}" data-target-type="${s(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${s(e.restaurantId||e.uid||"")}" data-target-name="${s(e.name||"")}" data-target-avatar="${s(e.avatar||"")}" ${t.hasPendingFollowRequest?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${t.followTone||"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"} ${t.hasPendingFollowRequest?"opacity-90 cursor-default":""}">
        <span class="relative z-10 flex items-center gap-2">
          ${t.isFollowing?m("check","w-4 h-4"):""}
          ${s(t.followLabel||p("profile.follow","Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${s(e.uid||"")}" data-chat-handle="${s(e.handle||"")}" data-chat-name="${s(e.name||"")}" data-chat-avatar="${s(e.avatar||"")}" ${t.isLocked?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${t.isLocked?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${m("message-circle","w-5 h-5")}
      </button>
    `;if(l){const V=[Se({href:L,iconName:"phone",eyebrow:p("profile.call","Anrufen"),value:I}),Se({href:A,iconName:"map-pin",eyebrow:p("profile.address","Adresse"),value:z||$}),_].filter(Boolean).join("");return`
      <div data-landing-tutorial-target="identity" data-business-profile-card="${s(o)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${n}" style="${f}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${Ja({profileName:S,safeBio:y,metaLine:F,identityPending:x,followersLabel:g})}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${s(o)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${m("x","w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(p("profile.contactInfo","Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s($)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${V||`<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(p("profile.noContactInfo","Noch keine Kontaktdaten"))}</div>`}
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
        ${P?`<img src="${s(P)}" data-img-key="${s(C)}" alt="${s(S)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`:`<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${m("store","w-7 h-7")}</div>`}
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${T}
          ${Ie({href:v,label:"TikTok",iconName:"music-2"})}
          ${Ie({href:R,label:"Instagram",iconName:"instagram"})}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${a==="self"?'id="profileAvatarTrigger"':""} class="relative ${a==="self"?"cursor-pointer group":""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${b?`<img src="${s(i)}" decoding="async" width="100" height="100" ${u} class="w-full h-full rounded-[1.8rem] ${r} border-2 border-white bg-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${x?"animate-pulse":""}">${m("store","w-8 h-8 text-slate-300")}</div>`}
            </div>
            ${e.isPremium?`
              <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                ${m("badge-check","w-4 h-4 fill-blue-500 text-white")}
              </div>
            `:""}
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div data-landing-tutorial-target="fans" class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl ${x?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(String(g))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <button type="button" data-profile-card-info-open="${s(o)}" class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${m("info","w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.info","Info"))}</span>
            </button>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(S)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${y}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(F)}</p>
          ${x?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${s(p("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          ${B}
        </div>
      </div>
    </div>
  `}function Ce(e={},t=[],{topTabOverride:a="",tutorialMode:n=!1,contentTabOverride:i="",landingHideContent:r=!1,collapseIdentity:o=!1,contentReveal:l=!1,landingMode:d=!1}={}){const f=xa(e),u=!!e.privateAccount&&e.uid&&String(e.uid)!==String(c.user?.uid||"")&&!f,b=!!e.pendingFollowRequest&&!f,x=e.restaurantId?"Business":p("nav.user","User"),g=String(e.handle||at(e.name||"user")).replace(/^@/,""),k=s(e.bio||"").replace(/\n/g,"<br>")||s(p("profile.noBio","Noch keine Bio.")),$=ve(e),F=String(a||He(e)).trim().toLowerCase()||"profile",y=String(i||ke(e)).trim().toLowerCase()||"posts",C=y==="menu",j=y==="checkins",P=t,w={...c?.profileView&&typeof c.profileView=="object"?c.profileView:{},profile:e,posts:Array.isArray(P)?P:[]},T=As(c,{profileView:w,profileTopTab:F,profileContentTab:y}),R=String(T?.header?.status||"").trim().toLowerCase()||"loading",v=String(T?.posts?.status||"").trim().toLowerCase()||"loading",I=String(e?.avatar||"").trim(),L=I?U(I,"avatar"):"",z=_e(!!e.restaurantId),_=e.uid||e.restaurantId||g||"public",B=d?"":`data-img-key="avatar:public:${s(_)}"`,V=!!I,Y=tt=>{if(tt==null)return!1;const qt=Number(tt);return Number.isFinite(qt)&&qt>=0},te=V||Y(e?.followers)||Y(e?.following),Q=ze(R)&&!te,Le=!!String(L||"").trim()&&V,Ae=Q?"...":M(e.followers),ie=Q?"...":M(e.following),et=$?"pt-2":"pt-10",ue=f?p("profile.following","Following"):b?p("profile.requested","Requested"):u?p("profile.request","Request"):p("profile.follow","Follow"),pe=f?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":b?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",fe=n?"select-none":"app-main-content-safe",K=n?"pointer-events-none":"",Vt=!o,G=!r,Te=l?d?"transition-opacity duration-200":"animate-in fade-in duration-300":"",Kt=y==="posts"&&P.length>0,Ps=y!=="posts"||Kt||v==="empty"||v==="error",Fs=y==="posts"&&!Kt&&v==="error";return!n&&(y==="posts"||y==="media")&&e?.restaurantId&&ze(v)&&Yt(e),`
    <div class="${fe}" ${n?'data-landing-tutorial-surface="true"':""}>
      ${F==="profile"||F==="menu"?`
      ${Vt?`
        <div class="app-content-inline pb-2 ${et}">
          ${$?Pt(e,{mode:"public",disabledBlockClass:K,avatarUrl:L,avatarFit:z,avatarImgKeyAttr:B,renderAvatarImage:Le,identityPending:Q,followersLabel:Ae,followLabel:ue,followTone:pe,isFollowing:f,hasPendingFollowRequest:b,isLocked:u,bioHtml:k,typeLabel:x,allowTitleImageCacheFallback:ze(R)||ze(v)}):`
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${K}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${Le?`<img src="${s(L)}" decoding="async" width="100" height="100" ${B} class="w-full h-full rounded-[1.8rem] ${z} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${Q?"animate-pulse":""}">${m(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${m("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${Q?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(Ae)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${Q?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(ie)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e.name||"User")}</h1>
                ${$?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${s(g)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${k}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(e.location||"-")} / ${x}</p>
                ${Q?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${s(p("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${s(e.handle)}" data-target-type="${s(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${s(e.restaurantId||e.uid||"")}" data-target-name="${s(e.name||"")}" data-target-avatar="${s(e.avatar||"")}" ${b?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${pe} ${b?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${f?m("check","w-4 h-4"):""}
                    ${ue}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${s(e.uid||"")}" data-chat-handle="${s(e.handle||"")}" data-chat-name="${s(e.name||"")}" data-chat-avatar="${s(e.avatar||"")}" ${u?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${u?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${m("message-circle","w-5 h-5")}
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
              ${m("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${s(p("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${s(p("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${Oe(e,{landingPreview:n,selectedTabOverride:y,compact:o})}
        ${G?De(e,{disabled:n}):""}

        ${G?C?`
          <div class="${K} ${Te}">
            ${we(e)?yt(e):je(e,{mode:d?"landing":"profile",allowAutoEnsure:!d})}
          </div>
        `:j?`
          <div class="${K} ${Te}">
            ${Re()}
          </div>
        `:`
          ${Ps?`
            ${Fs?`
              <div class="app-content-inline ${K}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${s(p("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${c.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${K} ${Te}">
                ${Ee(P,c.profileViewMode,!1,{includeImageKeys:!d})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${K}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${Te}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(p("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${F==="cart"?st(e):F==="favorites"?nt(e):""}
      `}
    </div>
  `}function Xa(){const e=c.profileView;if(!e||!e.profile)return"";const t=e.profile,a=e.posts||t.posts||[],n=He(t);return n==="landing"?Ha(t):Ce(t,a,{topTabOverride:n,tutorialMode:!1})}function Ft(e,{filter:t="all",query:a=""}={}){const n=Array.isArray(e)?e:[],i=ua(a||"");return n.filter(r=>t==="all"||se(r.type)===t?i?`${r.name||""} ${r.category||""} ${r.description||""}`.toLowerCase().includes(i):!0:!1)}function jt(e,t=0){const a=Number(e);return Number.isFinite(a)?Math.max(0,Math.floor(a)):Math.max(0,Number(t)||0)}function Pe(e=[]){return(Array.isArray(e)?e.slice():[]).map((a,n)=>({item:a,idx:n,order:jt(a?.orderIndex,n)})).sort((a,n)=>a.order-n.order||a.idx-n.idx).map((a,n)=>({...a.item,orderIndex:jt(a.item?.orderIndex,n)}))}function Ve(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function de(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":se(e?.type||"food")==="drink"?"drink":"food"}function es(e={}){return String(e?.category||p("menu.other","Sonstiges")).trim()||p("menu.other","Sonstiges")}function ts(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const as=4,ss={thumb:160,small:480,medium:768,large:1280};function Lt({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<as&&a===0}function ns({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){const n=Lt({mode:e,priorityIndex:t,slideIndex:a}),i=e==="profile"?' data-image-reveal="menu"':"";return n?`loading="eager" fetchpriority="high"${i}`:`loading="lazy" fetchpriority="low"${i}`}function rs({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function X(e,{mode:t="profile",priorityIndex:a=-1,slideIndex:n=0,stableKey:i="",preferredSize:r="small",candidateSizes:o=["small","medium","large"],variant:l="grid"}={}){const d=String(e||"").trim(),f=t==="profile"&&i?{stableKey:i}:null,u=Lt({mode:t,priorityIndex:a,slideIndex:n}),b=t==="profile"&&!u&&l!=="thumb",x=U(d,r,f),g=D(x)?N:x,S=ra(d),k=ia(d)&&d!==g?d:S,$=[],F=new Set;o.forEach(I=>{const L=ss[I]||0;if(!L)return;const z=U(d,I,f);if(!z||D(z))return;const _=`${z}|${L}`;F.has(_)||(F.add(_),$.push(`${z} ${L}w`))});const y=$.length>1?$.join(", "):"",C=y?rs({variant:l}):"",j=b?"":y,P=b?"":C,A=j?` srcset="${s(j)}"`:"",w=P?` sizes="${s(P)}"`:"",T=ns({mode:t,priorityIndex:a,slideIndex:n}),R=`${T}${A}${w}`,v=b?[`data-menu-lazy-src="${s(g)}"`,`data-menu-lazy-fallback="${s(k||N)}"`,y?`data-menu-lazy-srcset="${s(y)}"`:"",C?`data-menu-lazy-sizes="${s(C)}"`:""].filter(Boolean).join(" "):"";return{safeImg:b?N:g,fallbackImg:b?N:k,imageAttrs:R,lazyAttrs:v?` ${v}`:"",srcsetValue:y,sizesValue:C,loadingAttrs:T}}function ne(e=[],t,a=null){const n=a instanceof Set?a:new Set;return e.map((i,r)=>{const o=es(i),l=ts(o),d=!!l&&!n.has(l);return d&&n.add(l),`<div${d?` data-menu-category-anchor="${s(l)}"`:""} class="h-full">${t(i,r)}</div>`}).join("")}function Ke(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function is(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function At(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),a=is(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),n=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&a?{type:"link",url:a,productId:""}:t==="product"&&n?{type:"product",url:"",productId:n}:{type:"self",url:"",productId:""}}function Tt(){const e=O(c.userProfile),t=String(c.menu.filter||"all").trim().toLowerCase()||"all",a=e&&t==="drink"?"all":t;return`
    <div class="flex gap-2 mb-5">
      ${(e?[{id:"all",label:p("menu.all","Alle")},{id:"food",label:p("menu.products","Produkte")}]:[{id:"all",label:p("menu.all","Alle")},{id:"food",label:p("menu.food","Speisen")},{id:"drink",label:p("menu.drinks","Getraenke")}]).map(i=>`
        <button data-menu-filter="${i.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${a===i.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${i.label}
        </button>
      `).join("")}
    </div>
  `}function os(){const e=sa().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${na.map(t=>{const a=t.id===e,n=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${a?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${a?m("check",`w-4 h-4 ${n}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function qe(e,{mode:t="profile",priorityIndex:a=-1}={}){const n=W(e),i=t==="profile"?re(e,{index:0}):"",{safeImg:r,fallbackImg:o,imageAttrs:l,lazyAttrs:d}=X(n,{mode:t,priorityIndex:a,stableKey:i,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),f=ce(e),u=c.activeTab==="menu"?c.userProfile:c.profileView?.profile||c.userProfile,b=O(u),x=mt(e,b),g=b?gt(e.category):e.category||"",S=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${s(r)}" data-fallback-src="${s(o)}"${d} class="w-full h-full object-cover" style="object-position:${q(e)};" ${l} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${s(e.name||p("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${s(f)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${g?`<span>${s(g)}</span>`:""}
            <span>${s(x)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${m("more-horizontal","w-4 h-4")}
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
        <img src="${s(r)}" data-fallback-src="${s(o)}"${d} class="w-full h-full object-cover" style="object-position:${q(e)};" ${l} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${s(e.name||p("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${s(f)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${g?`<span>${s(g)}</span>`:""}
          <span>${s(x)}</span>
        </div>
        ${S?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${s(S)}</p>`:""}
      </div>
    </div>
  `}function Ge(e,{mode:t="profile",variant:a="food",priorityIndex:n=-1}={}){const i=W(e),r=t==="profile"?re(e,{index:0}):"",o=a==="drink",{safeImg:l,fallbackImg:d,imageAttrs:f,lazyAttrs:u}=X(i,{mode:t,priorityIndex:n,stableKey:r,preferredSize:o?"small":"medium",candidateSizes:o?["small","medium"]:["small","medium","large"],variant:o?"grid":"hero"}),b=ce(e),x=c.activeTab==="menu"?c.userProfile:c.profileView?.profile||c.userProfile,g=O(x),S=mt(e,g),k=g?gt(e.category):e.category||"",$=e.description||"",F=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",y=c.menu.restaurantId||c.profileView?.profile?.restaurantId||c.userProfile.restaurantId||"",C=be(e),j=ct(y,C),P=j?dt(j):{likes:[],comments:[],counts:{likes:0,comments:0}},A=ut(P),w=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${m("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${s(C)}">${s(M(A.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${m("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${s(C)}">${s(M(A.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${F} class="w-full ${o?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${o?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        <img src="${s(l)}" data-fallback-src="${s(d)}"${u} class="w-full h-full object-cover" style="object-position:${q(e)};" ${f} decoding="async" />
      </div>
      ${o?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${s(e.name||p("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${s(b)}</p>
          ${w}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${s(e.name||p("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${s(b)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${k?`<span>${s(k)}</span>`:""}
            <span>${s(S)}</span>
          </div>
          ${$?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${s($)}</p>`:""}
          ${w}
        </div>
      `}
    </div>
  `}function Fe(e={}){if(!e?.restaurantId||O(e))return!1;const t=String(Ue(e)||"").trim().toLowerCase();return t==="restaurant"||t==="cafe"||t==="fastfood"}function zt(e){const t=e?.restaurantId||c.menu.restaurantId||c.profileView?.profile?.restaurantId||c.userProfile.restaurantId||"",a=be(e),n=ct(t,a),i=n?dt(n):{likes:[],comments:[],counts:{likes:0,comments:0}},r=String(c.user?.uid||"").trim(),o=String(c.user?.handle||"").trim().toLowerCase(),l=!!i.likes?.some(d=>{const f=String(d?.uid||"").trim();if(r&&f&&f===r)return!0;const u=String(d?.handle||"").trim().toLowerCase();return!!o&&!!u&&u===o});return{itemId:a,meta:i,counts:ut(i),isLiked:l}}function re(e,{index:t=0}={}){const a=String(e?.restaurantId||c.menu.restaurantId||c.profileView?.profile?.restaurantId||c.userProfile.restaurantId||"").trim(),n=String(e?.id||be(e)||"").trim();if(!a||!n)return"";const i=Number(t),r=Number.isFinite(i)?Math.max(0,Math.floor(i)):0;return`menu-detail:${a}:${n}:${r}`}function ls(e){const t=typeof lt=="function"?lt(e):[],a=Array.isArray(t)?t.filter(Boolean):[];if(a.length)return a;const n=W(e);return n?[n]:[]}function ee(e){return Ts(e?.cardStyle||"",se(e?.type||"food"))}function Qe(e,{menuItemId:t=""}={}){if(!e)return null;const a=String(t||e.menuItemId||e.itemId||e.productId||"").trim();return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:W(e)||e.imageUrl||"",objectPosition:e.objectPosition||q(e),menuItemId:a}}function _t(e,t=[],{mode:a="profile"}={}){const n=e?.restaurantId||"",i=Fe(e)||O(e);return!n||!i||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((r,o)=>{const l=r.imageUrl||"",d=String(r.menuItemId||r.id||"").trim(),{safeImg:f,fallbackImg:u,imageAttrs:b,lazyAttrs:x}=X(l,{mode:a,priorityIndex:o,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:d?`menu-focus:${n}:${d}`:""}),g=String(r.menuItemId||"").trim(),S=a==="profile"&&g?`data-menu-open="${s(g)}" role="button"`:"";return`
            <div ${S} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${S?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${s(f)}" data-fallback-src="${s(u)}"${x} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${r.objectPosition||"50% 50%"};" ${b} decoding="async" />
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${m("sparkles","w-3 h-3 text-amber-500")}
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
  `}function cs(e,{count:t=2}={}){const a=e?.restaurantId||"",n=Fe(e)||O(e);if(!a||!n)return"";const i=Math.max(1,Math.min(2,Number(t)||2));return`
    <div data-focus-skeleton="true" aria-hidden="true" class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${Array.from({length:i}).map(()=>`
          <div class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col relative mb-2" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
            <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative animate-pulse" style="aspect-ratio:16 / 9;"></div>
            <div class="px-2 py-4">
              <div class="h-4 w-2/3 rounded-full bg-slate-200 animate-pulse"></div>
              <div class="mt-3 h-3 w-5/6 rounded-full bg-slate-100 animate-pulse"></div>
              <div class="mt-2 h-3 w-1/2 rounded-full bg-slate-100 animate-pulse"></div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `}function Ut(e,{mode:t="profile",priorityIndex:a=-1}={}){const n=W(e),i=t==="profile"?re(e,{index:0}):"",{safeImg:r,fallbackImg:o,imageAttrs:l,lazyAttrs:d}=X(n,{mode:t,priorityIndex:a,stableKey:i,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),f=ce(e),u=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",{itemId:b,counts:x,isLiked:g}=zt(e);return`
    <div ${u} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${s(r)}" data-fallback-src="${s(o)}"${d} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${q(e)};" ${l} decoding="async" />
        <button
          type="button"
          data-menu-card-like="${s(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${g?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${g?"true":"false"}"
        >
          ${m("heart","w-3.5 h-3.5 fill-current opacity-80")}
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
            ${m("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${s(b)}">${s(M(x.likes))}</span>
          <span data-menu-comment-count="${s(b)}">${s(M(x.comments))}</span>
        </div>
      </div>
    </div>
  `}function ds(e,t="profile"){if(t!=="profile")return"";const a=At(e);return a.type==="link"&&a.url?`data-menu-special-link="${s(a.url)}" role="button" tabindex="0"`:a.type==="product"&&a.productId?`data-menu-open="${s(a.productId)}" role="button"`:`data-menu-open="${s(e.id)}" role="button"`}function We(e,{mode:t="profile",size:a="default",priorityIndex:n=-1}={}){const i=W(e),r=t==="profile"?re(e,{index:0}):"",o=a==="food",{safeImg:l,fallbackImg:d,imageAttrs:f,lazyAttrs:u}=X(i,{mode:t,priorityIndex:n,stableKey:r,preferredSize:o?"medium":"small",candidateSizes:o?["small","medium","large"]:["small","medium"],variant:o?"hero":"grid"}),b=ds(e,t),x=String(e.category||"Special").trim()||"Special",g=s(String(e.name||"Special")).replace(/\n/g,"<br>");return a==="food"?`
      <div ${b} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${s(l)}" data-fallback-src="${s(d)}"${u} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${q(e)};" ${f} decoding="async" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${m("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${s(x)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${g}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${b} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${s(l)}" data-fallback-src="${s(d)}"${u} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${q(e)};" ${f} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${m("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${s(x)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${g}</h4>
        </div>
      </div>
    </div>
  `}function Mt(e,{mode:t="profile",priorityIndex:a=-1}={}){const n=ce(e),i=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",r=ls(e),l=(r.length?r:[W(e)||""]).filter(Boolean),d=l.length?l.slice(0,12):[""],f=d.length>1,{itemId:u,counts:b,isLiked:x}=zt(e),g=M(Math.max(0,Number(b.likes)||0)),S=M(Math.max(0,Number(b.comments)||0));return`
    <div ${i} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${f?`
          <div
            data-menu-card-gallery-track="${s(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${d.map((k,$)=>{const F=t==="profile"?re(e,{index:$}):"",y=X(k||"",{mode:t,priorityIndex:a,slideIndex:$,stableKey:F,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),C=$>0,j=C?N:y.safeImg,P=C?N:y.fallbackImg,A=C?y.loadingAttrs:y.imageAttrs,w=C?"":y.lazyAttrs||"",T=C?` data-menu-card-deferred-src="${s(y.safeImg)}"
                    data-menu-card-deferred-fallback="${s(y.fallbackImg)}"
                    ${y.srcsetValue?`data-menu-card-deferred-srcset="${s(y.srcsetValue)}"`:""}
                    ${y.sizesValue?`data-menu-card-deferred-sizes="${s(y.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${$}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${s(j)}" data-fallback-src="${s(P)}"${w}${T} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${q(e)};" ${A} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${d.map((k,$)=>{const F=t==="profile"?re(e,{index:$}):"",{safeImg:y,fallbackImg:C,imageAttrs:j,lazyAttrs:P}=X(k||"",{mode:t,priorityIndex:a,slideIndex:$,stableKey:F,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${s(y)}" data-fallback-src="${s(C)}"${P} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${q(e)};" ${j} decoding="async" />
              </div>
            `}).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${s(e.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${x?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${x?"true":"false"}"
        >
          ${m("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${f?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${d.map((k,$)=>`
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
              <span data-menu-like-count="${s(u)}">${s(g)}</span>
              <span data-menu-comment-count="${s(u)}">${s(S)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${s(p("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${m("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function us(e,t,{mode:a="profile",publicMenuSurfaceState:n=null}={}){const i=Pe(Array.isArray(t)?t:[]),r=String(e?.restaurantId||"").trim(),o=a==="admin"||ma(r),l=n?.focus?.canRenderFocus?{items:Array.isArray(n.focus.items)?n.focus.items:[],enabled:!0}:r&&o?he(r):{items:[],enabled:!1},d=l.enabled?(Array.isArray(l.items)?l.items:[]).map(v=>Qe({...v,objectPosition:oe(v)})):[],f=i.filter(v=>ee(v)==="testfirst_focus"&&!Ve(v)).map(v=>Qe(v,{menuItemId:v.id||""})).filter(Boolean),u=new Set,b=[...d,...f].filter(v=>{const I=String(v.menuItemId||v.id||`${v.title}|${v.text}|${v.imageUrl}`);return!I||u.has(I)?!1:(u.add(I),!0)}),x=i.filter(v=>!Ve(v)),g=x.filter(v=>ee(v)!=="testfirst_focus"),S=g.length?g:x,k=g.length?b:[],$=S.filter(v=>de(v)==="drink"),F=S.filter(v=>de(v)!=="drink"),y=(v=[])=>{const I=[],L=[];return v.forEach(z=>{const _=ee(z);_==="testfirst_food"||_==="testfirst_special"&&Ke(z)==="food"?L.push(z):I.push(z)}),{gridItems:I,foodItems:L}},C=(v,I=-1)=>ee(v)==="testfirst_special"?We(v,{mode:a,priorityIndex:I}):Ut(v,{mode:a,priorityIndex:I});let j=0;const P=()=>{const v=j;return j+=1,v},A=new Set,w=(v,I)=>!I.gridItems.length&&!I.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${s(v)}">
        ${I.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${s(v)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${ne(I.gridItems,L=>C(L,P()),A)}
            </div>
          </div>
        `:""}
        ${I.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${s(v)}">
            <div class="app-content-inline">
              ${ne(I.foodItems,L=>{const z=ee(L),_=P();return z==="testfirst_special"?We(L,{mode:a,size:"food",priorityIndex:_}):Mt(L,{mode:a,priorityIndex:_})},A)}
            </div>
          </div>
        `:""}
      </section>
    `,T=y($),R=y(F);return`
    <div>
      ${_t(e,k,{mode:a})}
      <div id="menu-section" class="mt-5">
        ${w("drink",T)}
        ${w("food",R)}
      </div>
    </div>
  `}function Et(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:n=null,priorityOffset:i=0}={}){return e.length?a?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${ne(e,(r,o)=>Ut(r,{mode:t,priorityIndex:i+o}),n)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${ne(e,(r,o)=>Ge(r,{mode:t,variant:"drink",priorityIndex:i+o}),n)}
    </div>
  `:""}function Rt(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:n=null,priorityOffset:i=0}={}){return e.length?a?`
      <div>
        ${ne(e,(r,o)=>ee(r)==="testfirst_special"&&Ke(r)==="food"?We(r,{mode:t,size:"food",priorityIndex:i+o}):Mt(r,{mode:t,priorityIndex:i+o}),n)}
      </div>
    `:`
    <div class="space-y-4">
      ${ne(e,(r,o)=>Ge(r,{mode:t,variant:"food",priorityIndex:i+o}),n)}
    </div>
  `:""}function Bt(e,{mode:t="profile"}={}){if(t==="admin"){const a=String(c?.menu?.filter||"all").trim().toLowerCase(),n=O(c.userProfile),i=p("menu.products","Produkte"),r=e.filter(u=>se(u?.type)==="drink"),o=e.filter(u=>se(u?.type)!=="drink"),l=(u,b,{addType:x=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${s(u)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${s(u)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(M(b.length))} Eintraege</p>
          </div>
          ${x?`
            <button type="button" data-menu-add-${s(x)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${m("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${b.length?`<div class="space-y-3">${b.map(g=>qe(g,{mode:"admin"})).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(p("menu.noProducts","Keine Produkte"))}</div>`}
      </div>
    `;if(n)return l(i,e,{addType:"food"});const d=[{title:p("menu.drinks","Getraenke"),list:r,addType:"drink"},{title:p("menu.food","Speisen"),list:o,addType:"food"}];if(a==="all")return`
        <div>
          ${d.map(u=>l(u.title,u.list,{addType:u.addType})).join("")}
        </div>
      `;const f=d.filter(u=>u.list.length>0);return f.length?`
      <div>
        ${f.map(u=>l(u.title,u.list,{addType:u.addType})).join("")}
      </div>
    `:a==="drink"?l(p("menu.drinks","Getraenke"),[],{addType:"drink"}):a==="food"?l(p("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((a,n)=>qe(a,{mode:t,priorityIndex:n})).join("")}
    </div>
  `:`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
        ${s(p("menu.noProducts","Keine Produkte"))}
      </div>
    `}function Ye(e,{variant:t="focus",suppressLoading:a=!1}={}){if(!e)return"";const{items:n,enabled:i,loading:r}=he(e,{includeInactive:!0}),o=M(n.length),l=String(t||"").trim().toLowerCase()==="travel-offers",d=l?"Ofertat":"Sot ne Fokus",f=l?"Oferta":"Highlights",u=l?"Im Travel und Profil sichtbar":"Im Profil sichtbar",b=l?"Ofertat werden geladen...":p("focus.loading","Fokus wird geladen..."),x=l?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${s(d)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${s(f)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(o)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${m("plus","w-4 h-4")}
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
          ${n.map(g=>{const S=U(g.imageUrl||"","thumb"),k=D(S)?N:S,$=g.active!==!1?"Aktiv":"Inaktiv",F=g.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(k)}" class="w-full h-full object-cover" style="object-position:${oe(g)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(g.title||"Sot ne Fokus")}</p>
                  ${g.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(g.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${F}">${$}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${s(g.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${s(g.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:r&&!a?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(b)}</div>
      `:r?"":`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(x)}</div>
      `}
    </div>
  `}function Nt(e={}){if(!e?.restaurantId)return!1;const t=String(Ue(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)||t==="ecommerce"||O(e)?!1:ae(e)||["restaurant","cafe","coffee","fastfood","food"].includes(t)||!t}function ps(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Freigegeben",className:"text-emerald-600"}:t==="rejected"?{label:"Abgelehnt",className:"text-rose-600"}:{label:"Wartet auf Heart",className:"text-amber-600"}}function fs(e,t){if(!t||!Nt(e))return"";const{items:a,loading:n}=la(t,{includeInactive:!0}),i=M(a.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(i)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${m("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${a.length?`
        <div class="space-y-3">
          ${a.map(r=>{const o=U(r.imageUrl||"","thumb"),l=D(o)?N:o,d=ps(r),f=r.category||"RESTAURANT",u=r.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(l)}" class="w-full h-full object-cover" style="object-position:${oe(r)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(r.title||"Ad")}</p>
                  ${r.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(r.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${s(f)} · ${s(u)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${d.className}">${s(d.label)}</p>
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
  `}function Ze(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function gs(e={}){const t=String(e?.restaurantId||"").trim(),a=t?le(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{},...t?{restaurantId:t}:{}}}function Je(e={}){return e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{}}function ms(e={}){const t=Je(e);return[...Ze(t.productIds),...Ze(e.shoppingLandingCardProductIds),...Ze(e.shoppingLandingProductIds)].filter(Boolean)}function Xe(e={}){return!e||typeof e!="object"?{}:Object.entries(e).reduce((t,[a,n])=>{const i=String(a||"").trim(),r=String(n||"").trim();return i&&r&&(t[i]=r),t},{})}function bs(e={}){const t=Je(e);return{...Xe(e.shoppingLandingProductImageOverrides),...Xe(t.productImageOverrides)}}function hs(e=""){const t=String(e||"").trim(),a=c.shoppingLandingCardEditor&&typeof c.shoppingLandingCardEditor=="object"?c.shoppingLandingCardEditor:{},n=String(a.restaurantId||"").trim();return n&&n!==t?{}:a}function xs(e){return e?typeof e=="string"?e.trim():typeof e!="object"?String(e||"").trim():String(e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||"").trim():""}function vs(e={}){const a=[W(e),...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(xs).filter(Boolean);return a.filter((n,i)=>a.indexOf(n)===i)}function ws(e={},t={},a={}){const n=String(e?.id||e?.productId||e?.menuItemId||"").trim();if(!n)return null;const i=vs(e).map(u=>({rawUrl:u,imageUrl:U(u,"thumb")})).filter(u=>u.rawUrl&&!D(u.imageUrl)),r=i[0]?.rawUrl||"",o=String(t?.[n]||"").trim(),l=String(a?.[n]||"").trim(),d=l||o||r,f=d?U(d,"thumb"):"";return{id:n,name:String(e.name||e.title||"Produkt").trim(),price:ce(e),imageUrl:f&&!D(f)?f:"",defaultImageRaw:r,cardImageUrl:o,previewImageUrl:l,imageCandidates:i,objectPosition:q(e)}}function ys(e={},t="",a=[]){if(!t||!O(e))return"";const n=gs(e),i=Je(n),r=hs(t),o=r.saving===!0,l=String(r.status||"").trim(),d=/fehl|error|nicht|nuk|kein/i.test(l),f=String(i.imageUrl||n.shoppingLandingCardImageUrl||n.shoppingLandingImageUrl||"").trim(),u=String(n.logoUrl||n.logo||n.logoURL||n.avatar||e.avatar||"").trim(),b=String(r.imageUrlDraft??f).trim(),x=String(r.imagePreview||b||u||"").trim(),g=x?U(x,"large"):N,S=String(r.titleDraft??(i.title||n.shoppingLandingCardTitle||e.name||"")).trim(),k=r.active!==void 0?r.active!==!1:i.active!==!1&&n.shoppingLandingCardEnabled!==!1,$=ms(n),F=Array.isArray(r.productIds)?r.productIds.map(w=>String(w||"").trim()).filter(Boolean):null,y=new Set(F||$),C={...bs(n),...Xe(r.productImageOverrides)},j=r.productImagePreviews&&typeof r.productImagePreviews=="object"?r.productImagePreviews:{},P=(Array.isArray(a)?a:[]).filter(w=>w&&String(w.id||"").trim()&&w.hidden!==!0&&w.available!==!1).map(w=>ws(w,C,j)).filter(Boolean),A=y.size?`${M(y.size)} ausgewaehlt`:"Keine Auswahl = alle Produkte";return`
    <div data-shopping-landing-card-editor="${s(t)}" class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Landing Card</span>
          <h3 class="text-xl font-black italic tracking-tighter">Shopping Card</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(A)}</p>
        </div>
        <button type="button" id="shoppingLandingImageTrigger" class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95" aria-label="Bild hochladen">
          ${m("plus","w-4 h-4")}
        </button>
      </div>

      <input id="shoppingLandingImageInput" type="file" accept="image/*" class="hidden" />
      <input id="shoppingLandingImageUrl" type="hidden" value="${s(b)}" />

      <div class="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-4">
        <img src="${s(g||N)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div class="absolute inset-x-0 top-0 h-16 pointer-events-none" style="background:linear-gradient(to bottom, rgba(255,255,255,0.7), transparent);"></div>
        <div class="absolute left-4 bottom-4 right-4">
          <span class="inline-flex max-w-full truncate text-[10px] uppercase tracking-wider font-extrabold text-slate-800 bg-white backdrop-blur-sm py-1 px-2.5 rounded-full" style="background:rgba(255,255,255,0.8);">
            ${s(S||"Shop Picks")}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label for="shoppingLandingTitleInput" class="text-[10px] font-black text-slate-400 uppercase ml-2">Titel</label>
          <input id="shoppingLandingTitleInput" type="text" value="${s(S)}" placeholder="Summer Picks" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-amber-100" />
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
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${s(M(P.length))}</span>
          </div>
          ${P.length?`
            <div class="grid grid-cols-1 gap-2">
              ${P.map(w=>{const T=y.has(w.id),R=w.imageUrl||N,v=String(w.defaultImageRaw||w.imageCandidates[0]?.rawUrl||"").trim(),I=String(w.cardImageUrl||"").trim(),L=String(w.previewImageUrl||"").trim(),z=!!(L||I&&I!==v),_=L||(I&&!w.imageCandidates.some(B=>B.rawUrl===I)?I:"");return`
                  <div class="rounded-2xl bg-white border border-slate-100 p-3">
                    <label class="flex items-center gap-3">
                      <input type="checkbox" data-shopping-landing-product="${s(w.id)}" class="w-4 h-4 accent-amber-500" style="accent-color:#f97316;" ${T?"checked":""} />
                      <span class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src="${s(R)}" class="w-full h-full object-cover" style="object-position:${s(w.objectPosition||"50% 50%")};" loading="lazy" decoding="async" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-xs font-black text-slate-900 truncate">${s(w.name)}</span>
                        ${w.price?`<span class="block text-[10px] font-bold text-slate-400 mt-0.5">${s(w.price)}</span>`:""}
                      </span>
                    </label>
                    ${T?`
                      <div class="mt-3 pt-3 border-t border-slate-100">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Card-Bild</span>
                          <div class="flex items-center gap-2">
                            ${z?`
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
                          ${w.imageCandidates.map((B,V)=>{const Y=V===0,te=L?!1:Y?!z:I===B.rawUrl;return`
                              <label class="shrink-0 w-16">
                                <input type="radio" name="shoppingLandingProductImage_${s(w.id)}" data-shopping-landing-product-image-choice="${s(w.id)}" value="${Y?"":s(B.rawUrl)}" class="hidden" ${te?"checked":""} />
                                <span class="block h-16 rounded-2xl overflow-hidden border ${te?"border-slate-900":"border-slate-100"} bg-slate-100">
                                  <img src="${s(B.imageUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </span>
                                <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">${V+1}</span>
                              </label>
                            `}).join("")}
                          ${_?`
                            <label class="shrink-0 w-16">
                              <input type="radio" name="shoppingLandingProductImage_${s(w.id)}" data-shopping-landing-product-image-choice="${s(w.id)}" value="${s(_)}" class="hidden" checked />
                              <span class="block h-16 rounded-2xl overflow-hidden border border-slate-900 bg-slate-100">
                                <img src="${s(U(_,"thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
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

        ${l?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${d?"text-rose-500":"text-slate-500"}">${s(l)}</div>`:""}

        <button id="shoppingLandingSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${o?"disabled":""}>
          ${o?"Speichern...":"Landing Card speichern"}
        </button>
      </div>
    </div>
  `}function $s(e){if(!Fe(e)||!ht(e))return"";const a=Pe((c.menu.items||[]).filter(n=>ee(n)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(M(a.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${m("plus","w-4 h-4")}
        </button>
      </div>
      ${a.length?`
        <div class="space-y-3">
          ${a.map(n=>{const i=U(W(n),"thumb"),r=D(i)?N:i,o=At(n),l=o.type==="link"?"Link":o.type==="product"?"Produkt-Modal":"Diese Karte",d=Ke(n)==="food"?"Food-Size":"Normal",f=fa(de(n));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(r)}" class="w-full h-full object-cover" style="object-position:${q(n)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(n.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${s(f)}</span>
                    <span>${s(d)}</span>
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
  `}function Ht(e,{count:t=2}={}){if(!ae(e))return"";const a=pt(),n=Math.max(1,Math.min(2,Number(t)||2));return`
    <div data-focus-skeleton="true" aria-hidden="true" class="overflow-hidden">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-1">
        ${Array.from({length:n}).map(()=>`
          <div class="min-w-[85%] sm:min-w-[300px] snap-center ${a} rounded-[2.5rem] p-6 border shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <div class="h-3 w-24 rounded-full bg-slate-200 animate-pulse"></div>
              <div class="flex items-center gap-2">
                <div class="w-9 h-9 rounded-full bg-slate-100 border border-slate-100 animate-pulse"></div>
                <div class="w-9 h-9 rounded-full bg-slate-100 border border-slate-100 animate-pulse"></div>
              </div>
            </div>
            <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
              <div class="w-full h-56 bg-slate-100 animate-pulse"></div>
            </div>
            <div class="mt-4">
              <div class="h-5 w-2/3 rounded-full bg-slate-200 animate-pulse"></div>
              <div class="mt-3 h-3 w-5/6 rounded-full bg-slate-100 animate-pulse"></div>
              <div class="mt-2 h-3 w-1/2 rounded-full bg-slate-100 animate-pulse"></div>
            </div>
            <div class="flex items-center justify-center gap-2 mt-4">
              <div class="w-2.5 h-2.5 rounded-full bg-slate-200 animate-pulse"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-slate-100 animate-pulse"></div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `}function Ot(e,{restaurantId:t="",suppressLoading:a=!1,allowAutoEnsure:n=!0,requirePublicMenuTruth:i=!0}={}){const r=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!r||!ae(e))return"";const o=ge(c,{profile:e,routePayload:c?.profileView?.routePayload,webDirectEntry:c?.__webDirectEntry,restaurantId:r});if(i&&o.menu.status!=="ready")return"";const l=!i||o.focus.canRenderFocus;if(n&&!c.focus.loading&&!l&&me(bt(e,r)),i&&!l)return"";const{items:d,loading:f}=l?{items:Array.isArray(o.focus.items)?o.focus.items:[],loading:o.focus.loading}:he(r);if(!(l?!0:he(r).enabled)||!d.length&&!f||a&&f&&!d.length)return"";if(f&&!d.length)return Ht(e,{count:2});const b=ca(d),x=d[b]||d[0],{safeImg:g,fallbackImg:S,imageAttrs:k,lazyAttrs:$}=X(x.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:x?.id?`focus-carousel:${r}:${String(x.id)}`:""}),F=x.text||"";return`
    <div id="focusCarousel" class="${pt()} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${d.length>1?`
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${m("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${m("chevron-right","w-4 h-4")}
            </button>
          </div>
        `:""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img data-focus-image src="${s(g)}" data-fallback-src="${s(S)}"${$} class="w-full h-56 object-cover" style="object-position:${oe(x)};" ${k} decoding="async" />
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${s(x.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${F?"":"hidden"}">${s(F)}</p>
      </div>
      ${d.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${d.map((C,j)=>`
            <button type="button" data-focus-dot="${j}" class="w-2.5 h-2.5 rounded-full ${j===b?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function ks(e,t=220){const a=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${a}`}function Dt({label:e,url:t,caption:a}){if(!t)return"";const n=ks(t,240);return`
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
  `}function Is({profile:e,restaurantId:t,catalogLabel:a}){if(!t||!ae(e))return"";if(typeof rt=="function"){const r=xe?xe(t):null;(!r||r.sameRestaurant!==!0||!r.loading&&!r.loaded&&!r.error)&&rt(e)}const n=typeof xe=="function"?xe(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},i=(n.tables||[]).map(r=>{const o=da("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:r});return Dt({label:`Tisch ${r}`,url:o,caption:`${a} fuer Tisch ${r}`})}).join("");return`
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
  `}function Ss(){const e=c.userProfile,t=e.restaurantId||"",a=String(c.user?.uid||"").trim(),n=String(c.__authBootstrapInFlightUid||"").trim(),i=!t&&!!a&&(!!c.__authProfileLoadPromise||n===a),r=we(e),o=ae(e),l=c.profileView?.profile?.restaurantId?c.profileView.profile:null,d=Wt()&&!!l?.restaurantId&&ae(l),f=O(e),u=ft(it(e)),b=t?le(t):null,x=b?.name||b?.restaurantName||e.name||"Business",g=t&&c.menu.restaurantId===t,S=String(c.menu.source||"").trim().toLowerCase(),k=!!g&&S==="collection",$=!!g&&S==="collection"&&c.menu.loading,F=!!t&&($||!k),y=f?"all":c.menu.filter,C=k?Ft(c.menu.items,{filter:y,query:c.menu.query}):[],P=ht(e)?C:C.filter(T=>!va(T)),A=Pe(P),w=M(A.length);if(t&&r){$a(e);const T=String(c.focus?.truthSource||"").trim().toLowerCase();return!c.focus.loading&&(c.focus.restaurantId!==t||T!=="public-menu")&&me(e),Ra(e)}return t&&o&&!k&&!$&&Jt(e),t&&o&&!c.focus.loading&&c.focus.restaurantId!==t&&me(e),t&&Nt(e)&&Xt(e),o?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${u}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(x)}</p>
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

      ${t?Ye(t):""}
      ${t?fs(e,t):""}
      ${t?ys(e,t,k?c.menu.items:[]):""}
      ${t&&k?$s(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${m("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${s(c.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${Tt()}

        ${F?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(p("menu.loading",`${u} wird geladen...`,{label:u}))}</div>`:Bt(A,{mode:"admin"})}
        ${c.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${s(c.menu.error)}</div>`:""}
        ${Is({profile:e,restaurantId:t,catalogLabel:u})}
      `:""}

    </div>
  `:d?je(l):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${m("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${u}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function je(e,{mode:t="profile",allowAutoEnsure:a=!0}={}){const n=c?.profileView?.routePayload&&typeof c.profileView.routePayload=="object"?c.profileView.routePayload:null,i=c?.__webDirectEntry&&typeof c.__webDirectEntry=="object"&&c.__webDirectEntry.active===!0?c.__webDirectEntry:null;let r=ge(c,{profile:e,routePayload:n,webDirectEntry:i});const o=r.restaurantId||ga(e,n);if(!o)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${s(p("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const l=bt(e,o),d=O(l),f=ae(l)&&!d;f&&(r=ge(c,{profile:l,routePayload:n,webDirectEntry:i,restaurantId:o,coordinateFocusWithMenu:!0}));const u=String(i?.canonicalRestaurantId||i?.restaurantId||"").trim(),b=new Set(r.targetIds),x=js(r.focus.truthState||""),g=r.menu.status==="ready",S=r.focus.canRenderFocus,k=g&&f,$=r.focus.matches===!0&&r.focus.loading===!0,F=t==="landing",C=String(c?.profileView?.menuAccessSource||i?.menuAccessSource||n?.menuAccessSource||"").trim().toLowerCase()==="qr",j=i?.active===!0&&i?.webPriority===!0&&i?.menuFirst===!0&&String(c?.activeTab||"").trim().toLowerCase()==="profile"&&String(c?.profileTopTab||"").trim().toLowerCase()==="menu"&&(u===o||b.has(o)),P=j&&!C,A=["ready","empty","error"].includes(r.menu.status),w=j&&A,T=j&&(!k||r.menu.status!=="ready"),R=!k||r.focus.settled===!0||x==="knownEmpty"||r.menu.status!=="ready",v=k&&g&&!S&&r.focus.settled!==!0&&(r.focus.status==="loading"||r.focus.status==="unknown");a&&!w&&!A&&Zt(l),a&&!T&&!R&&!$&&g&&(!P||A)&&me(l);const L=r.menu.canRenderItems?Pe(Ft(r.menu.items,{filter:"all",query:""})).filter(G=>!Ve(G)):[],z=L.length>0,_=ft(it(e)),B=r.menu.error||"",V=!!String(B||"").trim(),Y=r.menu.status==="loading",te=L.filter(G=>de(G)==="drink"),Q=L.filter(G=>de(G)!=="drink"),Le=0,Ae=te.length,ie=Fe(e),et=ie||d,ue=new Set;z&&o&&(ea(L,o),ha(L,o));const pe=o&&S?(Array.isArray(r.focus.items)?r.focus.items:[]).map(G=>Qe({...G,objectPosition:oe(G)})).filter(Boolean):[],fe=pe.length?_t(l,pe,{mode:t}):"",K=v?cs(l,{count:2}):"";return F&&Y?'<div class="app-content-inline app-main-content-safe" style="min-height: 34vh;"></div>':ie?`
      <div class="app-main-content-safe">
        ${Y?`
          ${fe||K}
          <div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(p("menu.loading",`${_} wird geladen...`,{label:_}))}</div>
        `:`
          ${z?`${K}${us(l,L,{mode:t,publicMenuSurfaceState:r})}`:V?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(p("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:fe||K||`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">${s(p("menu.noProducts","Keine Produkte"))}</div>`}
          ${B?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(B)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5">
      ${et?fe||K:v?Ht(l,{count:2}):Ot(l,{restaurantId:o,suppressLoading:!0,allowAutoEnsure:g&&(!P||A),requirePublicMenuTruth:!0})}
      ${Y?`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(p("menu.loading",`${_} wird geladen...`,{label:_}))}</div>
        </div>
      `:`
        ${z?`
          ${d?`
            ${aa(L,{profile:e})}
          `:`
            ${te.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${s(p("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${Et(te,{mode:t,useTestfirstCardUi:ie,seenCategories:ue,priorityOffset:Le})}
                </div>
              </section>
            `:""}
            ${Q.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${s(p("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${Rt(Q,{mode:t,useTestfirstCardUi:ie,seenCategories:ue,priorityOffset:Ae})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${V?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                ${s(p("menu.loadError","Menu konnte nicht geladen werden"))}
              </div>
            </div>
          `:`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${s(p("menu.noProducts","Keine Produkte"))}
              </div>
            </div>
          `}
        `}
        ${B?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(B)}</div>`:""}
      `}
    </div>
  `}function Cs(){const e=c.userProfile,t=Qt(e),a=t?c.businessPosts:c.userPosts,n=String(c.user?.uid||e?.uid||"").trim(),i=String(e?.restaurantId||"").trim(),r=String(c.__userPostsLoadingUid||"").trim(),o=String(c.__businessPostsLoadingRestaurantId||"").trim(),l=String(c.__authBootstrapInFlightUid||"").trim(),d=!!n&&r===n,f=!!i&&o===i,u=!!n&&l===n,b=t?f||u&&!a.length:d||u&&!a.length,x=String(e.handle||at(e.name||"user")).replace(/^@/,""),S=s(e.bio||"").replace(/\n/g,"<br>")||s(p("profile.noBio","Noch keine Bio.")),k=ke(e),$=k==="menu",F=k==="checkins",y=a,C=U(e.avatar,"avatar"),j=_e(t),P=He(e);return`
    <div class="app-main-content-safe">
      ${P==="profile"||P==="menu"?`
      <div class="app-content-inline pb-2 ${t?"pt-2":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${t?Pt(e,{mode:"self",avatarUrl:C,avatarFit:j,followersLabel:M(e.followers),bioHtml:S}):`
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${s(C)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${j} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${m("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${s(M(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${s(M(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(p("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${s(x)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${S}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(e.location||"-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${m("plus","w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${m("settings","w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
        `}
      </div>

      ${Oe(e)}
      ${De(e)}

      ${$?`
        ${we(e)?yt(e):je(e)}
      `:F?`
        ${Re()}
      `:`
        ${b&&!y.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(p("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${c.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${Ee(y,c.profileViewMode)}
          </div>
          ${k==="posts"?`
            <div class="app-content-inline mt-8 mb-4">
              <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  ${m("plus","w-4 h-4")} Neuen Beitrag
                </span>
                <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          `:""}
        `}
      `}
      `:`
        ${P==="cart"?st(e):P==="favorites"?nt(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:xt,renderProfilePostsFancy:Ee,renderProfileCheckins:Re,renderProfileTabs:Oe,renderProfileViewControls:De,renderPublicProfileView:Xa,renderMenuFilterRow:Tt,renderMenuLayoutSection:os,renderMenuItemCard:qe,renderMenuItemCardStacked:Ge,renderMenuDrinkGrid:Et,renderMenuFoodList:Rt,renderMenuList:Bt,renderFocusAdminSection:Ye,renderFocusCarousel:Ot,renderMenuQrCard:Dt,renderMenuAdminView:Ss,renderProfileMenuView:je,renderProfileView:Cs}}export{Ms as createProfileMenuFocusRenderController};
