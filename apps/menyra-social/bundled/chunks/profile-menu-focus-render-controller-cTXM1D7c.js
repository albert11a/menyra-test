import{e as ie,f as Qs,t as Ys,g as Zs,h as At,a as Js}from"../entry/social-app.js";import"./startup-route-runtime-context-Ba2-q0Mg.js";import"./vendor-firebase-V03pMX6J.js";function sn(f={}){const l=f.state,Tt=f.resolvePostCountsFn,n=f.escapeHtmlFn,E=f.getOptimizedImageUrlFn,m=f.iconFn,Lt=f.isLocalBusinessProfileFn,zt=typeof f.isCeoUserFn=="function"?f.isCeoUserFn:(()=>!1),Ke=f.normalizeHandleFn,qe=f.logoFitClassFn,_=f.formatCountFn,Ge=f.renderProfileShopCartViewFn,We=f.renderProfileShopFavoritesViewFn,_t=typeof f.ensurePostsDataForProfileFn=="function"?f.ensurePostsDataForProfileFn:(()=>{}),Mt=f.ensureMenuDataForProfileFn,Et=typeof f.ensureEditorMenuDataForProfileFn=="function"?f.ensureEditorMenuDataForProfileFn:(()=>{}),oe=f.ensureFocusDataForProfileFn,Rt=typeof f.ensureAdsDataForProfileFn=="function"?f.ensureAdsDataForProfileFn:(()=>{}),Qe=f.ensureTableQrStateForProfileFn,G=f.isShopCatalogProfileFn,Ye=f.getBusinessCatalogLabelFn,W=f.normalizeMenuTypeFn,Dt=f.primeMenuItemCountsFn,Ut=typeof f.hydrateMenuCardViewerLikesFn=="function"?f.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),Bt=f.renderShopProductListFn,Ht=f.getMenuLayoutThemeFn,Ot=f.menuLayoutColors,H=f.resolveMenuItemHeroFn,se=f.isPlaceholderUrlFn,R=f.placeholderImage,Vt=f.getFirebaseStorageUrlFn,Nt=f.isDirectImageUrlFn,Ze=f.formatPriceFn,Kt=typeof f.resolveCurrencyCodeForMenuItemFn=="function"?f.resolveCurrencyCodeForMenuItemFn:(()=>""),Je=f.getMenuItemImagesFn,U=f.getMenuItemObjectPositionFn,le=f.getMenuItemSocialIdFn,Xe=f.menuItemMetaKeyFn,et=f.ensureMenuItemMetaFn,tt=f.resolveMenuItemCountsFn,ce=f.getFocusStateForRestaurantFn,qt=typeof f.getAdsStateForRestaurantFn=="function"?f.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),de=f.getTableQrStateForRestaurantFn,ne=f.getFocusItemObjectPositionFn,st=f.getFocusCardClassFn,Gt=f.getFocusIndexFn,Q=f.isRestaurantCafeProfileFn,Ce=typeof f.getBusinessProfileTypeFn=="function"?f.getBusinessProfileTypeFn:(()=>""),ue=f.getRestaurantMetaByIdFn,Wt=f.buildUrlFn,Qt=f.normalizeSearchKeyFn,Yt=f.normalizeFollowHandleFn,O={key:"",inFlightKey:""},u=(e,t=e,s={})=>Ys(e,{fallback:t,params:s}),nt=(e="")=>{const t=String(e||"").trim();if(!t)return u("nav.menu","Menue");const s=t.toLowerCase();return s==="menue"||s==="menu"||s==="menü"?u("nav.menu",t):s==="shop"?"Shop":t},Zt=(e="food")=>String(e||"").trim().toLowerCase()==="drink"?u("menu.drinks","Getraenke"):u("menu.food","Speisen"),at=(e={},t=!1)=>{const s=W(e?.type||"food");return t?s==="drink"?u("menu.variant","Variante"):u("menu.product","Produkt"):s==="drink"?u("menu.drinkItem","Getraenk"):u("menu.foodItem","Speise")};function Jt(e=null,t=null){return ie(l,{profile:e,routePayload:t,webDirectEntry:l?.__webDirectEntry}).restaurantId}function rt(e=null,t=""){if(!e||typeof e!="object")return e;const s=String(t||"").trim();if(!s)return e;const a=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===s&&a?e:{...e,restaurantId:s,...a?{canonicalRestaurantId:a}:{}}}function Xt(e=""){const t=String(e||"").trim();return t?ie(l,{profile:l?.profileView?.profile||l?.userProfile,routePayload:l?.profileView?.routePayload,webDirectEntry:l?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function pe(e={}){const t=String(Kt(e)||"").trim();return t?Ze(e?.price,t):Ze(e?.price)}function es(e=[],t="",s=""){const a=String(t||"").trim(),i=String(s||"").trim();if(!a||!i)return"";const r=Array.isArray(e)?e:[];if(!r.length)return`${a}|${i}|empty`;const o=[];return r.forEach(d=>{const c=String(le(d)||d?.id||"").trim();c&&o.push(c)}),o.length?(o.sort(),`${a}|${i}|${o.join(",")}`):`${a}|${i}|empty`}function ts(e=[],t=""){const s=String(l.user?.uid||"").trim(),a=es(e,t,s);a&&O.inFlightKey!==a&&O.key!==a&&(O.key=a,O.inFlightKey=a,Ut(e,t).catch(i=>{console.error(i),O.key===a&&(O.key="")}).finally(()=>{O.inFlightKey===a&&(O.inFlightKey="")}))}function ss(e={}){const t=String(e?.uid||"").trim();if(t&&l.followingTargetIds.includes(t))return!0;const s=String(e?.restaurantId||"").trim();if(s&&l.followingTargetIds.includes(s))return!0;const a=Yt(e?.handle||"");return!!(a&&l.followingHandles.includes(a))}function it(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const s=typeof ue=="function"&&ue(t)||null;return s?.specialEnabled===!0?!0:(s?.specialEnabled===!1,!1)}function ns(e={}){return K(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function ot(e,t,s=!0,{includeImageKey:a=!0}={}){const i=Tt(e),r=e.id?String(e.id):"",o=r?`data-open-post="${n(r)}"`:"",d=r?`data-post-like-count="${n(r)}"`:"",c=r?`data-post-comment-count="${n(r)}"`:"",p=a&&r?`data-img-key="profile-post:${n(r)}"`:"",g=e.type==="wide"||e.type==="hero",h=t&&g?"col-span-2":"",w=t&&g?"aspect-[1.8/1]":"aspect-[4/5]",x=E(e.url,g?"large":"medium",{stableKey:r?`profile-post:${r}`:"",variantGroup:"post-detail"}),k=g?800:400,S=g?400:500;return`
    <div ${o} role="button" tabindex="0" class="${h} relative ${w} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${n(x)}" loading="lazy" decoding="async" width="${k}" height="${S}" ${p} class="w-full h-full object-cover" />
        ${e.isVideo?`<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${m("play","w-3 h-3 fill-white")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${m("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${d} class="text-[10px] font-bold tracking-wide">${n(i.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${m("message-circle","w-3 h-3 text-indigo-200")}
                <span ${c} class="text-[10px] font-bold tracking-wide">${n(i.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${r&&s?`
        <button type="button" data-profile-menu-button="${n(r)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${m("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${n(r)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${n(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${m(g?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${g?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${n(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${m("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function Pe(e,t,s=!0,{includeImageKeys:a=!0}={}){const i=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${m("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${n(u("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const r=e.map(d=>ot(d,i,s,{includeImageKey:a})),o=e.reduce((d,c)=>{const p=c?.type==="wide"||c?.type==="hero";return d+(p?2:1)},0);return i&&o%2===1&&r.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),r.join("")}function je(){const e=l.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const s=E(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${n(s)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${n(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${m("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${n(t.city||"Stadt")}
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
        <p class="text-slate-400 text-sm font-bold tracking-wide">${n(u("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function fe(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}function ge(e={}){const t=String(Ce(e)||"").trim().toLowerCase();return t==="hotel"||t==="motel"}function Ae(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),s=t?ue(t):null;return{...s&&typeof s=="object"?s:{},...e&&typeof e=="object"?e:{}}}function as(e={},t=""){const s=e&&typeof e=="object"?e:{},a=String(s.id||s._id||s.offerId||s.menuItemId||t||"offer").trim();return{...s,id:a,menuItemId:String(s.menuItemId||s.targetMenuItemId||s.itemId||s.targetItemId||"").trim(),title:s.title||s.name||"Oferta",text:s.text||s.desc||s.description||"",imageUrl:s.imageUrl||s.image||s.photoUrl||"",active:s.active!==!1}}function rs(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],s=new Set;return t.map((a,i)=>as(a,`offer_${i}`)).filter(a=>{const i=String(a.id||`${a.title}|${a.text}|${a.imageUrl}`).trim();return!i||s.has(i)?!1:(s.add(i),!0)})}function is(e={}){const t=Ae(e),s=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!s)return!1;const a=l.focus&&typeof l.focus=="object"?l.focus:{},i=String(a.restaurantId||"").trim()===s,r=String(a.truthSource||"").trim().toLowerCase();if(i&&r==="public-menu"||(i&&Array.isArray(a.items)?a.items:[]).length)return!1;const d=rs(t);return d.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(l.focus={...a,restaurantId:s,items:d,enabled:a.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:d.length?"seeded":"knownEmpty"},!0):!1}function os(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const s of t){if(!s||typeof s!="object")continue;const a=Number(s.lat??s.latitude),i=Number(s.lng??s.lon??s.longitude);if(Number.isFinite(a)&&Number.isFinite(i))return{lat:a,lng:i}}return null}function D(e={},t=[]){for(const s of t){const a=String(e?.[s]||"").trim();if(a)return a}return""}function be(e){if(Array.isArray(e))return e.map(s=>String(s||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(s=>s.trim()).filter(Boolean):[]}function ls(e={}){const t=[...be(e.coverImages),...be(e.hotelCoverImages),...be(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(a=>String(a||"").trim()).filter(Boolean),s=[];return t.forEach(a=>{s.includes(a)||s.push(a)}),s.slice(0,8)}function cs(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function ds(e=""){const t=String(e||"").trim(),s=l.hotelCardEditor&&typeof l.hotelCardEditor=="object"?l.hotelCardEditor:{},a=String(s.restaurantId||"").trim();return a?a===t?s:{}:cs(s)?{}:s}function us(e={}){const t=Array.isArray(e.features)?e.features.map(a=>String(a||"").trim()).filter(Boolean):[],s=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[D(e,["hotelFeatureOneText","gardenTerraceText"])||String(s.gardenTerrace||"").trim()||t[0]||"",D(e,["hotelFeatureTwoText","accessibilityText"])||String(s.accessibility||"").trim()||t[1]||"",D(e,["hotelFeatureThreeText","veganOptionsText"])||String(s.veganOptions||"").trim()||t[2]||""]}function ps(e={}){const t=[],s=(a="")=>{const i=String(a||"").trim();i&&!t.includes(i)&&t.push(i)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(a=>{Array.isArray(a)&&a.forEach(i=>{typeof i=="string"?s(i):i&&typeof i=="object"&&s(i.label||i.name||i.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&s("Në plazh"),(e.restaurant||e.hasRestaurant)&&s("Restaurant"),(e.breakfast||e.breakfastIncluded)&&s("Mëngjes"),(e.pool||e.hasPool)&&s("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&s("WLAN"),(e.parking||e.freeParking||e.hasParking)&&s("Parking"),(e.spa||e.wellness)&&s("Wellness"),t.slice(0,8)}const fs=[{value:"m",label:"m"},{value:"km",label:"km"}],gs="Në qendër",lt="Në plazh",bs=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],ms=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],xs=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function V(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function hs(e="",{direct:t=!1}={}){const s=String(e||"").trim(),a=V(s),i=t||a==="ne_qender"||a==="ne_plazh"||a==="direkt_ne_qender"||a==="direkt_ne_plazh"||a.includes("direkt")&&(a.includes("strand")||a.includes("zentrum")||a.includes("center"))||a.includes("am_strand")||a.includes("im_zentrum"),r=s.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),o=r?r[1].replace(",","."):"",c=(r?String(r[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:o,unit:c,isDirect:i}}function ct({idPrefix:e="",iconName:t="navigation",label:s="",value:a="",directLabel:i="",direct:r=!1}={}){const o=hs(a,{direct:r});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${m(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${n(s)}</p>
          <p class="text-[10px] font-bold text-slate-400">${n(i)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${n(e)}Value" type="number" min="0" step="0.1" value="${n(o.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${n(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${fs.map(d=>`<option value="${n(d.value)}" ${o.unit===d.value?"selected":""}>${n(d.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${n(i)}</span>
        <input id="${n(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${o.isDirect?"checked":""} />
      </label>
    </div>
  `}function vs(e=[],t=""){const s=String(t||"").trim(),a=new Set(e.map(V));return`
    <option value="">Zgjidh</option>
    ${e.map(i=>`<option value="${n(i)}" ${V(i)===V(s)?"selected":""}>${n(i)}</option>`).join("")}
    ${s&&!a.has(V(s))?`<option value="${n(s)}" selected>Aktuale: ${n(s)}</option>`:""}
  `}function Te({id:e="",iconName:t="badge-check",label:s="",value:a="",options:i=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${m(t,"w-4 h-4")}
        </div>
        <label for="${n(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${n(s)}</label>
      </div>
      <select id="${n(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${vs(i,a)}
      </select>
    </div>
  `}function ws(e={},t=[]){const s=new Set(t.map(V).filter(Boolean)),a=[],i=(r="")=>{const o=String(r||"").trim();if(!o)return;const d=V(o);s.has(d)||a.some(c=>V(c)===d)||a.push(o)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(r=>be(r).forEach(i)),a}function ys({existingImages:e=[],newPreviews:t=[],imageUrlDraft:s=""}={}){const a=[...t.map((o,d)=>({src:o,kind:"new",idx:d})),...e.map((o,d)=>({src:o,kind:"existing",idx:d}))].filter(o=>o.src),i=a[0]?.src||s||"",r=i?E(i,"large"):R;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${n(r||R)}" class="w-full h-52 object-cover bg-white" />
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
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${a.length}</span>
        </div>
        ${a.length?`
          <div class="grid grid-cols-3 gap-2">
            ${a.map(o=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                ${o.kind==="existing"?`<span data-hotel-card-existing-image="${n(o.src)}" hidden></span>`:""}
                <img src="${n(E(o.src,"thumb"))}" class="w-full h-full object-cover" />
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

      <input id="hotelCardCoverImageUrl" type="hidden" value="${n(s)}" />
    </div>
  `}function me({iconName:e="info",label:t="",value:s="",helper:a=""}={}){return`
    <div class="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm">
      <div class="flex items-start gap-4">
        <div class="w-11 h-11 rounded-[1.25rem] bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          ${m(e,"w-5 h-5")}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">${n(t)}</p>
          <p class="text-sm font-black text-slate-900 leading-snug">${n(s||"Shto detajet")}</p>
          ${a?`<p class="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">${n(a)}</p>`:""}
        </div>
      </div>
    </div>
  `}function dt(e={}){const t=Ae(e),s=os(t),a=D(t,["address","primaryAddress","location","formattedAddress","street"]),i=D(t,["city","locationCity","primaryCity","region","country"]),r=D(t,["beachDistance","distanceToBeach","beachDistanceLabel","strandEntfernung"]),o=D(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),d=D(t,["rating","reviewRating","stars","hotelStars"]),c=D(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),p=ps(t),g=s?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.lat},${s.lng}`)}`:a||i?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a} ${i}`.trim())}`:"";return`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm overflow-hidden">
        <div class="h-40 rounded-[1.6rem] bg-cyan-50 border border-cyan-100 relative overflow-hidden mb-4">
          <div class="absolute inset-0 opacity-80" style="background-image: linear-gradient(135deg, rgba(0,204,229,0.18), rgba(15,23,42,0.04));"></div>
          <div class="absolute inset-0 flex items-center justify-center text-cyan-600">
            ${m("map-pin","w-10 h-10")}
          </div>
          <div class="absolute left-4 right-4 bottom-4 bg-white/90 backdrop-blur rounded-2xl p-3 border border-white/70">
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Lokacioni</p>
            <p class="text-xs font-black text-slate-900 leading-snug">${n(a||i||"Shto lokacionin")}</p>
          </div>
        </div>
        ${g?`
          <a href="${n(g)}" target="_blank" rel="noopener noreferrer" class="w-full h-12 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            ${m("navigation","w-4 h-4")} Hap hartën
          </a>
        `:""}
      </div>

      <div class="grid grid-cols-1 gap-4">
        ${me({iconName:"map-pin",label:"Adresa",value:[a,i].filter(Boolean).join(", ")||"Shto lokacionin",helper:s?`${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`:""})}
        ${me({iconName:"navigation",label:"Qendra",value:o||"Shto detajet"})}
        ${me({iconName:"waves",label:"Plazhi",value:r||(t.beachfront||t.onBeach?lt:"Shto detajet")})}
        ${me({iconName:"star",label:"Vlerësime",value:d?`${d}${c?` / ${c} vlerësime`:""}`:"Pa vlerësime",helper:D(t,["reviewSummary","ratingSummary","commentsSummary"])})}
      </div>

      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Të përfshira</p>
        ${p.length?`
          <div class="flex flex-wrap gap-2">
            ${p.map(h=>`<span class="px-3 py-2 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600">${n(h)}</span>`).join("")}
          </div>
        `:`
          <p class="text-sm font-bold text-slate-400">Shto pajisjet dhe detajet e dhomave.</p>
        `}
      </div>
    </div>
  `}function $s(e={}){const t=Ae(e),s=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),a=t?.name||t?.restaurantName||e?.name||"Hotel",i=ds(s),r=String(i.status||"").trim(),o=i.saving===!0,d=Array.isArray(i.existingImages)?i.existingImages.map(M=>String(M||"").trim()).filter(Boolean):ls(t),c=Array.isArray(i.imagePreviews)?i.imagePreviews.map(M=>String(M||"").trim()).filter(Boolean):[],p=String(i.imageUrlDraft||"").trim(),[g,h,w]=us(t),x=ws(t,[g,h,w]),k=D(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),S=D(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),y=D(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),I=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,b=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,$=i.detailsOpen===!0||o,C=c[0]||d[0]||"",F=C?E(C,"thumb"):R,j=[k,S,y?`${y} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",L=r.includes("fehl")||r.includes("Bitte")||r.includes("Nuk");return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel Card</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(a)}</p>
        </div>
      </div>

      ${s?`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
              <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hotel & Ofertat</p>
            </div>
            <button type="button" data-hotel-card-details-open aria-expanded="${$?"true":"false"}" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
              ${m("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${$?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${n(F||R)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${n(a)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(j)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${$?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${m("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${r&&!$?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${L?"text-rose-500":"text-slate-500"}">${n(r)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${n(s)}" data-hotel-card-details-panel class="${$?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
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
              ${ys({existingImages:d,newPreviews:c,imageUrlDraft:p})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${ct({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:k,directLabel:gs,direct:I})}
              ${ct({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:S,directLabel:lt,direct:b})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${n(y)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Te({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:g,options:bs})}
              ${Te({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:h,options:ms})}
              ${Te({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:w,options:xs})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${n(x.join(`
`))}</textarea>
              </div>
            </div>

            ${r?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${L?"text-rose-500":"text-slate-500"}">${n(r)}</div>`:""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${o?"disabled":""}>
              ${o?"Po ruhet...":"Ruaj Hotel Details"}
            </button>
        </div>
        ${Oe(s,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function xe(e={}){const t=String(l.profileTopTab||"").trim().toLowerCase(),s=String(l.profileContentTab||"").trim().toLowerCase();return fe(e)?t==="menu"?"menu":s==="menu"||s==="posts"?s:"posts":s==="media"||s==="checkins"?s:"posts"}function Le(e={}){const t=String(l.profileTopTab||"").trim().toLowerCase();return fe(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(l.user?.uid||"").trim()?"favorites":"profile"}function ut(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function ks(e=0,t=1){const s=Math.max(1,Number(t||0)||1),a=Math.round(Number(e||0));if(!Number.isFinite(a))return 0;const i=a%s;return i<0?i+s:i}function Ss(e=0){return ut(e)}function Is(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],s=ut(l.profileLandingStep),a=ks(l.profileLandingGreetingIndex,t.length),i=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},r=String(i.businessName||e.name||"casarita").trim()||"casarita",o=r.endsWith(".")?r:`${r}.`,d=E(i.logoUrl||e.avatar||"","avatar"),p=String(d||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",g=String(i.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),h=String(i.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),w=s>=2,x=s>=3,k=Array.isArray(l.profileView?.posts)?l.profileView.posts:Array.isArray(e?.posts)?e.posts:[],S=Ss(s),y=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${m("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(I=>{const b=S===I;return`
            <div data-landing-step-dot="${I}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${b?"1.22":"1"}); opacity: ${b?"1":"0.88"}; background: ${b?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${b?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${b?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${s===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${s===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((I,b)=>{const $=b===a,C=b===(a-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${b}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${$?"opacity: 1; transform: translateY(0) scale(1);":C?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!$&&!C?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${n(I)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${n(p)}" alt="${n(`${r} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex items-center" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;color:#111827;">
              ${n(o)}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${n(g)}<br />
            ${n(h)}
          </p>
        </div>
        ${y}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${s<1?"translate-y-full":s===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${s===1?"1":"0"}; pointer-events: ${s===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${he(e,k,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${y}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${s<2?"translate-y-full":s===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${s===2?"1":"0"}; pointer-events: ${s===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${w?he(e,k,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${y}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${s<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${s===3?"1":"0"}; pointer-events: ${s===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${x?he(e,k,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function ze(e=l.profileView?.profile||l.userProfile,{landingPreview:t=!1,selectedTabOverride:s="",compact:a=!1}={}){const i=fe(e),r=String(s||xe(e)).trim().toLowerCase()||"posts",o=ge(e),d=i?[{id:"posts",label:u("profile.posts","Beitraege")},{id:"menu",label:o?"Details":u("nav.menu","Menue"),surface:o?"hotel-details":"menu"}]:[{id:"posts",label:u("profile.posts","Beitraege")},{id:"media",label:u("profile.media","Medien")},{id:"checkins",label:u("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${a?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${d.map(c=>`
          <button data-profile-tab="${c.id}" ${c.surface?`data-profile-tab-surface="${n(c.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${r===c.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${c.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function _e(e=l.profileView?.profile||l.userProfile,{disabled:t=!1}={}){const s=xe(e);return s==="checkins"||s==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${n(u("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${l.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${m("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${l.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${m("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function he(e={},t=[],{topTabOverride:s="",tutorialMode:a=!1,contentTabOverride:i="",landingHideContent:r=!1,collapseIdentity:o=!1,contentReveal:d=!1,landingMode:c=!1}={}){const p=ss(e),g=!!e.privateAccount&&e.uid&&String(e.uid)!==String(l.user?.uid||"")&&!p,h=!!e.pendingFollowRequest&&!p,w=e.restaurantId?"Business":u("nav.user","User"),x=String(e.handle||Ke(e.name||"user")).replace(/^@/,""),S=n(e.bio||"").replace(/\n/g,"<br>")||n(u("profile.noBio","Noch keine Bio.")),y=fe(e),I=String(s||Le(e)).trim().toLowerCase()||"profile",b=String(i||xe(e)).trim().toLowerCase()||"posts",$=b==="menu",C=b==="checkins",F=t,L={...l?.profileView&&typeof l.profileView=="object"?l.profileView:{},profile:e,posts:Array.isArray(F)?F:[]},M=Zs(l,{profileView:L,profileTopTab:I,profileContentTab:b}),J=String(M?.header?.status||"").trim().toLowerCase()||"loading",v=String(M?.posts?.status||"").trim().toLowerCase()||"loading",P=String(e?.avatar||"").trim(),A=P?E(P,"avatar"):"",T=qe(!!e.restaurantId),z=e.uid||e.restaurantId||x||"public",ye=c?"":`data-img-key="avatar:public:${n(z)}"`,X=!!P,ee=Ne=>{if(Ne==null)return!1;const jt=Number(Ne);return Number.isFinite(jt)&&jt>=0},$e=X||ee(e?.followers)||ee(e?.following),q=At(J)&&!$e,Ve=!!String(A||"").trim()&&X,re=q?"...":_(e.followers),ke=q?"...":_(e.following),Se=y?I==="profile"?"pt-2":"pt-4":"pt-10",Ie=p?u("profile.following","Following"):h?u("profile.requested","Requested"):g?u("profile.request","Request"):u("profile.follow","Follow"),B=p?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":h?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",Ks=a?"select-none":"app-main-content-safe",te=a?"pointer-events-none":"",qs=!o,Ct=!r,Fe=d?c?"transition-opacity duration-200":"animate-in fade-in duration-300":"",Pt=b==="posts"&&F.length>0,Gs=b!=="posts"||Pt||v==="empty"||v==="error",Ws=b==="posts"&&!Pt&&v==="error";return!a&&(b==="posts"||b==="media")&&e?.restaurantId&&At(v)&&_t(e),`
    <div class="${Ks}" ${a?'data-landing-tutorial-surface="true"':""}>
      ${I==="profile"||I==="menu"?`
      ${qs?`
        <div class="app-content-inline pb-2 ${Se}">
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${te}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${Ve?`<img src="${n(A)}" decoding="async" width="100" height="100" ${ye} class="w-full h-full rounded-[1.8rem] ${T} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${q?"animate-pulse":""}">${m(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${m("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${q?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(re)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(u("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${q?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(ke)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(u("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e.name||"User")}</h1>
                ${y?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${n(x)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${S}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(e.location||"-")} / ${w}</p>
                ${q?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(u("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${n(e.handle)}" data-target-type="${n(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${n(e.restaurantId||e.uid||"")}" data-target-name="${n(e.name||"")}" data-target-avatar="${n(e.avatar||"")}" ${h?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${B} ${h?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${p?m("check","w-4 h-4"):""}
                    ${Ie}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${n(e.uid||"")}" data-chat-handle="${n(e.handle||"")}" data-chat-name="${n(e.name||"")}" data-chat-avatar="${n(e.avatar||"")}" ${g?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${g?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${m("message-circle","w-5 h-5")}
                </button>
              </div>
            </div>
          </div>
        </div>
      `:""}

      ${g?`
        <div class="app-content-inline pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${m("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${n(u("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${n(u("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${ze(e,{landingPreview:a,selectedTabOverride:b,compact:o})}
        ${Ct?_e(e,{disabled:a}):""}

        ${Ct?$?`
          <div class="${te} ${Fe}">
            ${ge(e)?dt(e):we(e,{mode:c?"landing":"profile",allowAutoEnsure:!c})}
          </div>
        `:C?`
          <div class="${te} ${Fe}">
            ${je()}
          </div>
        `:`
          ${Gs?`
            ${Ws?`
              <div class="app-content-inline ${te}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${n(u("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${l.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${te} ${Fe}">
                ${Pe(F,l.profileViewMode,!1,{includeImageKeys:!c})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${te}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${Fe}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(u("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${I==="cart"?Ge(e):I==="favorites"?We(e):""}
      `}
    </div>
  `}function Fs(){const e=l.profileView;if(!e||!e.profile)return"";const t=e.profile,s=e.posts||t.posts||[],a=Le(t);return a==="landing"?Is(t):he(t,s,{topTabOverride:a,tutorialMode:!1})}function pt(e,{filter:t="all",query:s=""}={}){const a=Array.isArray(e)?e:[],i=Qt(s||"");return a.filter(r=>t==="all"||W(r.type)===t?i?`${r.name||""} ${r.category||""} ${r.description||""}`.toLowerCase().includes(i):!0:!1)}function ft(e,t=0){const s=Number(e);return Number.isFinite(s)?Math.max(0,Math.floor(s)):Math.max(0,Number(t)||0)}function ve(e=[]){return(Array.isArray(e)?e.slice():[]).map((s,a)=>({item:s,idx:a,order:ft(s?.orderIndex,a)})).sort((s,a)=>s.order-a.order||s.idx-a.idx).map((s,a)=>({...s.item,orderIndex:ft(s.item?.orderIndex,a)}))}function Me(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function ae(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":W(e?.type||"food")==="drink"?"drink":"food"}function Cs(e={}){return String(e?.category||u("menu.other","Sonstiges")).trim()||u("menu.other","Sonstiges")}function Ps(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const js=4,As={thumb:160,small:480,medium:768,large:1280};function gt({mode:e="profile",priorityIndex:t=-1,slideIndex:s=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<js&&s===0}function Ts({mode:e="profile",priorityIndex:t=-1,slideIndex:s=0}={}){const a=gt({mode:e,priorityIndex:t,slideIndex:s}),i=e==="profile"?' data-image-reveal="menu"':"";return a?`loading="eager" fetchpriority="high"${i}`:`loading="lazy" fetchpriority="low"${i}`}function Ls({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function N(e,{mode:t="profile",priorityIndex:s=-1,slideIndex:a=0,stableKey:i="",preferredSize:r="small",candidateSizes:o=["small","medium","large"],variant:d="grid"}={}){const c=String(e||"").trim(),p=t==="profile"&&i?{stableKey:i}:null,g=gt({mode:t,priorityIndex:s,slideIndex:a}),h=t==="profile"&&!g&&d!=="thumb",w=E(c,r,p),x=se(w)?R:w,k=Vt(c),S=Nt(c)&&c!==x?c:k,y=[],I=new Set;o.forEach(P=>{const A=As[P]||0;if(!A)return;const T=E(c,P,p);if(!T||se(T))return;const z=`${T}|${A}`;I.has(z)||(I.add(z),y.push(`${T} ${A}w`))});const b=y.length>1?y.join(", "):"",$=b?Ls({variant:d}):"",C=h?"":b,F=h?"":$,j=C?` srcset="${n(C)}"`:"",L=F?` sizes="${n(F)}"`:"",M=Ts({mode:t,priorityIndex:s,slideIndex:a}),J=`${M}${j}${L}`,v=h?[`data-menu-lazy-src="${n(x)}"`,`data-menu-lazy-fallback="${n(S||R)}"`,b?`data-menu-lazy-srcset="${n(b)}"`:"",$?`data-menu-lazy-sizes="${n($)}"`:""].filter(Boolean).join(" "):"";return{safeImg:h?R:x,fallbackImg:h?R:S,imageAttrs:J,lazyAttrs:v?` ${v}`:"",srcsetValue:b,sizesValue:$,loadingAttrs:M}}function Y(e=[],t,s=null){const a=s instanceof Set?s:new Set;return e.map((i,r)=>{const o=Cs(i),d=Ps(o),c=!!d&&!a.has(d);return c&&a.add(d),`<div${c?` data-menu-category-anchor="${n(d)}"`:""} class="h-full">${t(i,r)}</div>`}).join("")}function Ee(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function zs(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function bt(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),s=zs(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),a=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&s?{type:"link",url:s,productId:""}:t==="product"&&a?{type:"product",url:"",productId:a}:{type:"self",url:"",productId:""}}function mt(){const e=l.menu.filter||"all";return`
    <div class="flex gap-2 mb-5">
      ${(G(l.userProfile)?[{id:"all",label:u("menu.all","Alle")},{id:"food",label:u("menu.products","Produkte")},{id:"drink",label:u("menu.variants","Varianten")}]:[{id:"all",label:u("menu.all","Alle")},{id:"food",label:u("menu.food","Speisen")},{id:"drink",label:u("menu.drinks","Getraenke")}]).map(a=>`
        <button data-menu-filter="${a.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${e===a.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${a.label}
        </button>
      `).join("")}
    </div>
  `}function _s(){const e=Ht().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${Ot.map(t=>{const s=t.id===e,a=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${s?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${s?m("check",`w-4 h-4 ${a}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function Re(e,{mode:t="profile",priorityIndex:s=-1}={}){const a=H(e),i=t==="profile"?Z(e,{index:0}):"",{safeImg:r,fallbackImg:o,imageAttrs:d,lazyAttrs:c}=N(a,{mode:t,priorityIndex:s,stableKey:i,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),p=pe(e),g=l.activeTab==="menu"?l.userProfile:l.profileView?.profile||l.userProfile,h=G(g),w=at(e,h),x=e.category||"",k=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${n(r)}" data-fallback-src="${n(o)}"${c} class="w-full h-full object-cover" style="object-position:${U(e)};" ${d} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${n(e.name||u("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${n(p)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${x?`<span>${n(x)}</span>`:""}
            <span>${n(w)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${m("more-horizontal","w-4 h-4")}
          </summary>
          <div class="absolute right-0 top-12 w-40 bg-white border border-slate-100 rounded-2xl shadow-lg p-2 z-20">
            <button data-menu-edit="${n(e.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Bearbeiten</button>
            <button data-menu-delete="${n(e.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50">Loeschen</button>
          </div>
        </details>
      </div>
    `:`
    <div ${t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:""} class="w-full p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${t==="profile"?"cursor-pointer":""}">
      <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
        <img src="${n(r)}" data-fallback-src="${n(o)}"${c} class="w-full h-full object-cover" style="object-position:${U(e)};" ${d} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${n(e.name||u("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${n(p)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${x?`<span>${n(x)}</span>`:""}
          <span>${n(w)}</span>
        </div>
        ${k?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${n(k)}</p>`:""}
      </div>
    </div>
  `}function De(e,{mode:t="profile",variant:s="food",priorityIndex:a=-1}={}){const i=H(e),r=t==="profile"?Z(e,{index:0}):"",o=s==="drink",{safeImg:d,fallbackImg:c,imageAttrs:p,lazyAttrs:g}=N(i,{mode:t,priorityIndex:a,stableKey:r,preferredSize:o?"small":"medium",candidateSizes:o?["small","medium"]:["small","medium","large"],variant:o?"grid":"hero"}),h=pe(e),w=l.activeTab==="menu"?l.userProfile:l.profileView?.profile||l.userProfile,x=G(w),k=at(e,x),S=e.category||"",y=e.description||"",I=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",b=l.menu.restaurantId||l.profileView?.profile?.restaurantId||l.userProfile.restaurantId||"",$=le(e),C=Xe(b,$),F=C?et(C):{likes:[],comments:[],counts:{likes:0,comments:0}},j=tt(F),L=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${m("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${n($)}">${n(_(j.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${m("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${n($)}">${n(_(j.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${I} class="w-full ${o?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${o?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        <img src="${n(d)}" data-fallback-src="${n(c)}"${g} class="w-full h-full object-cover" style="object-position:${U(e)};" ${p} decoding="async" />
      </div>
      ${o?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${n(e.name||u("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${n(h)}</p>
          ${L}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${n(e.name||u("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${n(h)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${S?`<span>${n(S)}</span>`:""}
            <span>${n(k)}</span>
          </div>
          ${y?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${n(y)}</p>`:""}
          ${L}
        </div>
      `}
    </div>
  `}function Ue(e={}){if(!e?.restaurantId||G(e))return!1;const t=String(Ce(e)||"").trim().toLowerCase();return t==="restaurant"||t==="cafe"||t==="fastfood"}function xt(e){const t=e?.restaurantId||l.menu.restaurantId||l.profileView?.profile?.restaurantId||l.userProfile.restaurantId||"",s=le(e),a=Xe(t,s),i=a?et(a):{likes:[],comments:[],counts:{likes:0,comments:0}},r=String(l.user?.uid||"").trim(),o=String(l.user?.handle||"").trim().toLowerCase(),d=!!i.likes?.some(c=>{const p=String(c?.uid||"").trim();if(r&&p&&p===r)return!0;const g=String(c?.handle||"").trim().toLowerCase();return!!o&&!!g&&g===o});return{itemId:s,meta:i,counts:tt(i),isLiked:d}}function Z(e,{index:t=0}={}){const s=String(e?.restaurantId||l.menu.restaurantId||l.profileView?.profile?.restaurantId||l.userProfile.restaurantId||"").trim(),a=String(e?.id||le(e)||"").trim();if(!s||!a)return"";const i=Number(t),r=Number.isFinite(i)?Math.max(0,Math.floor(i)):0;return`menu-detail:${s}:${a}:${r}`}function Ms(e){const t=typeof Je=="function"?Je(e):[],s=Array.isArray(t)?t.filter(Boolean):[];if(s.length)return s;const a=H(e);return a?[a]:[]}function K(e){return Js(e?.cardStyle||"",W(e?.type||"food"))}function Be(e,{menuItemId:t=""}={}){if(!e)return null;const s=String(t||e.menuItemId||e.itemId||e.productId||"").trim();return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:H(e)||e.imageUrl||"",objectPosition:e.objectPosition||U(e),menuItemId:s}}function ht(e,t=[],{mode:s="profile"}={}){const a=e?.restaurantId||"";return!a||!Ue(e)||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((i,r)=>{const o=i.imageUrl||"",d=String(i.menuItemId||i.id||"").trim(),{safeImg:c,fallbackImg:p,imageAttrs:g,lazyAttrs:h}=N(o,{mode:s,priorityIndex:r,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:d?`menu-focus:${a}:${d}`:""}),w=String(i.menuItemId||"").trim(),x=s==="profile"&&w?`data-menu-open="${n(w)}" role="button"`:"";return`
            <div ${x} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${x?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${n(c)}" data-fallback-src="${n(p)}"${h} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${i.objectPosition||"50% 50%"};" ${g} decoding="async" />
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${m("sparkles","w-3 h-3 text-amber-500")}
                  <span class="text-[10px] font-black text-slate-900 uppercase tracking-widest pt-[1px]">Tipp</span>
                </div>
              </div>
              <div class="px-2 py-4">
                <h3 class="text-[17px] font-black text-slate-900 leading-tight">${n(i.title||"")}</h3>
                <p class="text-[13px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">${n(i.text||"")}</p>
              </div>
            </div>
          `}).join("")}
      </div>
    </div>
  `}function vt(e,{mode:t="profile",priorityIndex:s=-1}={}){const a=H(e),i=t==="profile"?Z(e,{index:0}):"",{safeImg:r,fallbackImg:o,imageAttrs:d,lazyAttrs:c}=N(a,{mode:t,priorityIndex:s,stableKey:i,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),p=pe(e),g=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",{itemId:h,counts:w,isLiked:x}=xt(e);return`
    <div ${g} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${n(r)}" data-fallback-src="${n(o)}"${c} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${U(e)};" ${d} decoding="async" />
        <button
          type="button"
          data-menu-card-like="${n(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${x?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${x?"true":"false"}"
        >
          ${m("heart","w-3.5 h-3.5 fill-current opacity-80")}
        </button>
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-[14px] font-black text-slate-900 leading-tight">${n(e.name||"")}</h4>
        </div>
        <p class="text-[12px] text-slate-500 leading-relaxed mb-3">${n(e.description||"")}</p>
        <div class="mt-auto pt-2 flex items-center justify-between">
          <span class="text-[14px] font-black text-slate-900">${n(p)}</span>
          <button type="button" class="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors active:scale-95">
            ${m("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${n(h)}">${n(_(w.likes))}</span>
          <span data-menu-comment-count="${n(h)}">${n(_(w.comments))}</span>
        </div>
      </div>
    </div>
  `}function Es(e,t="profile"){if(t!=="profile")return"";const s=bt(e);return s.type==="link"&&s.url?`data-menu-special-link="${n(s.url)}" role="button" tabindex="0"`:s.type==="product"&&s.productId?`data-menu-open="${n(s.productId)}" role="button"`:`data-menu-open="${n(e.id)}" role="button"`}function He(e,{mode:t="profile",size:s="default",priorityIndex:a=-1}={}){const i=H(e),r=t==="profile"?Z(e,{index:0}):"",o=s==="food",{safeImg:d,fallbackImg:c,imageAttrs:p,lazyAttrs:g}=N(i,{mode:t,priorityIndex:a,stableKey:r,preferredSize:o?"medium":"small",candidateSizes:o?["small","medium","large"]:["small","medium"],variant:o?"hero":"grid"}),h=Es(e,t),w=String(e.category||"Special").trim()||"Special",x=n(String(e.name||"Special")).replace(/\n/g,"<br>");return s==="food"?`
      <div ${h} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${n(d)}" data-fallback-src="${n(c)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${U(e)};" ${p} decoding="async" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${m("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${n(w)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${x}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${h} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${n(d)}" data-fallback-src="${n(c)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${U(e)};" ${p} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${m("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${n(w)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${x}</h4>
        </div>
      </div>
    </div>
  `}function wt(e,{mode:t="profile",priorityIndex:s=-1}={}){const a=pe(e),i=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",r=Ms(e),d=(r.length?r:[H(e)||""]).filter(Boolean),c=d.length?d.slice(0,12):[""],p=c.length>1,{itemId:g,counts:h,isLiked:w}=xt(e),x=_(Math.max(0,Number(h.likes)||0)),k=_(Math.max(0,Number(h.comments)||0));return`
    <div ${i} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${p?`
          <div
            data-menu-card-gallery-track="${n(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${c.map((S,y)=>{const I=t==="profile"?Z(e,{index:y}):"",b=N(S||"",{mode:t,priorityIndex:s,slideIndex:y,stableKey:I,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),$=y>0,C=$?R:b.safeImg,F=$?R:b.fallbackImg,j=$?b.loadingAttrs:b.imageAttrs,L=$?"":b.lazyAttrs||"",M=$?` data-menu-card-deferred-src="${n(b.safeImg)}"
                    data-menu-card-deferred-fallback="${n(b.fallbackImg)}"
                    ${b.srcsetValue?`data-menu-card-deferred-srcset="${n(b.srcsetValue)}"`:""}
                    ${b.sizesValue?`data-menu-card-deferred-sizes="${n(b.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${y}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${n(C)}" data-fallback-src="${n(F)}"${L}${M} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${U(e)};" ${j} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${c.map((S,y)=>{const I=t==="profile"?Z(e,{index:y}):"",{safeImg:b,fallbackImg:$,imageAttrs:C,lazyAttrs:F}=N(S||"",{mode:t,priorityIndex:s,slideIndex:y,stableKey:I,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${n(b)}" data-fallback-src="${n($)}"${F} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${U(e)};" ${C} decoding="async" />
              </div>
            `}).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${n(e.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${w?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${w?"true":"false"}"
        >
          ${m("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${p?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${c.map((S,y)=>`
              <div
                data-menu-card-gallery-dot="${n(e.id)}"
                data-menu-card-gallery-index="${y}"
                class="${y===0?"w-4 h-1.5 bg-white rounded-full shadow-sm":"w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm"}"
              ></div>
            `).join("")}
          </div>
        `:""}
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div>
            <h4 class="text-[18px] font-black text-slate-900 leading-snug">${n(e.name||"")}</h4>
          </div>
          <span class="text-[17px] font-black text-slate-900 whitespace-nowrap">${n(a)}</span>
        </div>
        <p class="text-[14px] text-slate-500 line-clamp-2 leading-relaxed mb-4" style="margin-bottom:16px;">${n(e.description||"")}</p>
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div class="flex items-center gap-2">
            <div class="hidden">
              <span data-menu-like-count="${n(g)}">${n(x)}</span>
              <span data-menu-comment-count="${n(g)}">${n(k)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${n(u("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${m("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function Rs(e,t,{mode:s="profile",publicMenuSurfaceState:a=null}={}){const i=ve(Array.isArray(t)?t:[]),r=String(e?.restaurantId||"").trim(),o=s==="admin"||Xt(r),d=a?.focus?.canRenderFocus?{items:Array.isArray(a.focus.items)?a.focus.items:[],enabled:!0}:r&&o?ce(r):{items:[],enabled:!1},c=d.enabled?(Array.isArray(d.items)?d.items:[]).map(v=>Be({...v,objectPosition:ne(v)})):[],p=i.filter(v=>K(v)==="testfirst_focus"&&!Me(v)).map(v=>Be(v,{menuItemId:v.id||""})).filter(Boolean),g=new Set,h=[...c,...p].filter(v=>{const P=String(v.menuItemId||v.id||`${v.title}|${v.text}|${v.imageUrl}`);return!P||g.has(P)?!1:(g.add(P),!0)}),w=i.filter(v=>!Me(v)),x=w.filter(v=>K(v)!=="testfirst_focus"),k=x.length?x:w,S=x.length?h:[],y=k.filter(v=>ae(v)==="drink"),I=k.filter(v=>ae(v)!=="drink"),b=(v=[])=>{const P=[],A=[];return v.forEach(T=>{const z=K(T);z==="testfirst_food"||z==="testfirst_special"&&Ee(T)==="food"?A.push(T):P.push(T)}),{gridItems:P,foodItems:A}},$=(v,P=-1)=>K(v)==="testfirst_special"?He(v,{mode:s,priorityIndex:P}):vt(v,{mode:s,priorityIndex:P});let C=0;const F=()=>{const v=C;return C+=1,v},j=new Set,L=(v,P)=>!P.gridItems.length&&!P.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${n(v)}">
        ${P.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${n(v)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${Y(P.gridItems,A=>$(A,F()),j)}
            </div>
          </div>
        `:""}
        ${P.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${n(v)}">
            <div class="app-content-inline">
              ${Y(P.foodItems,A=>{const T=K(A),z=F();return T==="testfirst_special"?He(A,{mode:s,size:"food",priorityIndex:z}):wt(A,{mode:s,priorityIndex:z})},j)}
            </div>
          </div>
        `:""}
      </section>
    `,M=b(y),J=b(I);return`
    <div>
      ${ht(e,S,{mode:s})}
      <div id="menu-section" class="mt-5">
        ${L("drink",M)}
        ${L("food",J)}
      </div>
    </div>
  `}function yt(e,{mode:t="profile",useTestfirstCardUi:s=!1,seenCategories:a=null,priorityOffset:i=0}={}){return e.length?s?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${Y(e,(r,o)=>vt(r,{mode:t,priorityIndex:i+o}),a)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${Y(e,(r,o)=>De(r,{mode:t,variant:"drink",priorityIndex:i+o}),a)}
    </div>
  `:""}function $t(e,{mode:t="profile",useTestfirstCardUi:s=!1,seenCategories:a=null,priorityOffset:i=0}={}){return e.length?s?`
      <div>
        ${Y(e,(r,o)=>K(r)==="testfirst_special"&&Ee(r)==="food"?He(r,{mode:t,size:"food",priorityIndex:i+o}):wt(r,{mode:t,priorityIndex:i+o}),a)}
      </div>
    `:`
    <div class="space-y-4">
      ${Y(e,(r,o)=>De(r,{mode:t,variant:"food",priorityIndex:i+o}),a)}
    </div>
  `:""}function kt(e,{mode:t="profile"}={}){if(t==="admin"){const s=String(l?.menu?.filter||"all").trim().toLowerCase(),a=e.filter(c=>W(c?.type)==="drink"),i=e.filter(c=>W(c?.type)!=="drink"),r=(c,p,{addType:g=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${n(c)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${n(c)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(_(p.length))} Eintraege</p>
          </div>
          ${g?`
            <button type="button" data-menu-add-${n(g)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${m("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${p.length?`<div class="space-y-3">${p.map(h=>Re(h,{mode:"admin"})).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${n(u("menu.noProducts","Keine Produkte"))}</div>`}
      </div>
    `,o=[{title:u("menu.drinks","Getraenke"),list:a,addType:"drink"},{title:u("menu.food","Speisen"),list:i,addType:"food"}];if(s==="all")return`
        <div>
          ${o.map(c=>r(c.title,c.list,{addType:c.addType})).join("")}
        </div>
      `;const d=o.filter(c=>c.list.length>0);return d.length?`
      <div>
        ${d.map(c=>r(c.title,c.list,{addType:c.addType})).join("")}
      </div>
    `:s==="drink"?r(u("menu.drinks","Getraenke"),[],{addType:"drink"}):s==="food"?r(u("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((s,a)=>Re(s,{mode:t,priorityIndex:a})).join("")}
    </div>
  `:`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
        ${n(u("menu.noProducts","Keine Produkte"))}
      </div>
    `}function Oe(e,{variant:t="focus",suppressLoading:s=!1}={}){if(!e)return"";const{items:a,enabled:i,loading:r}=ce(e,{includeInactive:!0}),o=_(a.length),d=String(t||"").trim().toLowerCase()==="travel-offers",c=d?"Ofertat":"Sot ne Fokus",p=d?"Oferta":"Highlights",g=d?"Im Travel und Profil sichtbar":"Im Profil sichtbar",h=d?"Ofertat werden geladen...":u("focus.loading","Fokus wird geladen..."),w=d?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${n(c)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${n(p)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(o)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${m("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${d?"Oferta anzeigen":"Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${n(g)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${i?"checked":""} />
      </label>

      ${a.length?`
        <div class="space-y-3">
          ${a.map(x=>{const k=E(x.imageUrl||"","thumb"),S=se(k)?R:k,y=x.active!==!1?"Aktiv":"Inaktiv",I=x.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(S)}" class="w-full h-full object-cover" style="object-position:${ne(x)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(x.title||"Sot ne Fokus")}</p>
                  ${x.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(x.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${I}">${y}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${n(x.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${n(x.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:r&&!s?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(h)}</div>
      `:r?"":`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${n(w)}</div>
      `}
    </div>
  `}function St(e={}){if(!e?.restaurantId)return!1;const t=String(Ce(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)?!1:G(e)||Q(e)||["restaurant","cafe","coffee","fastfood","food","ecommerce"].includes(t)||!t}function Ds(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Freigegeben",className:"text-emerald-600"}:t==="rejected"?{label:"Abgelehnt",className:"text-rose-600"}:{label:"Wartet auf Heart",className:"text-amber-600"}}function Us(e,t){if(!t||!St(e))return"";const{items:s,loading:a}=qt(t,{includeInactive:!0}),i=_(s.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(i)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${m("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${s.length?`
        <div class="space-y-3">
          ${s.map(r=>{const o=E(r.imageUrl||"","thumb"),d=se(o)?R:o,c=Ds(r),p=r.category||"RESTAURANT",g=r.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(d)}" class="w-full h-full object-cover" style="object-position:${ne(r)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(r.title||"Ad")}</p>
                  ${r.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(r.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${n(p)} · ${n(g)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${c.className}">${n(c.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-ad-edit="${n(r.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-ad-delete="${n(r.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:a?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ads werden geladen...</div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Ads</div>
      `}
    </div>
  `}function Bs(e){if(!Ue(e)||!it(e))return"";const s=ve((l.menu.items||[]).filter(a=>K(a)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(_(s.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${m("plus","w-4 h-4")}
        </button>
      </div>
      ${s.length?`
        <div class="space-y-3">
          ${s.map(a=>{const i=E(H(a),"thumb"),r=se(i)?R:i,o=bt(a),d=o.type==="link"?"Link":o.type==="product"?"Produkt-Modal":"Diese Karte",c=Ee(a)==="food"?"Food-Size":"Normal",p=Zt(ae(a));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(r)}" class="w-full h-full object-cover" style="object-position:${U(a)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(a.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${n(p)}</span>
                    <span>${n(c)}</span>
                    <span>${n(d)}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-menu-edit="${n(a.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-menu-delete="${n(a.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Special-Karten</div>
      `}
    </div>
  `}function It(e,{restaurantId:t="",suppressLoading:s=!1,allowAutoEnsure:a=!0,requirePublicMenuTruth:i=!0}={}){const r=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!r||!Q(e))return"";const o=ie(l,{profile:e,routePayload:l?.profileView?.routePayload,webDirectEntry:l?.__webDirectEntry,restaurantId:r});if(i&&o.menu.status!=="ready")return"";const d=!i||o.focus.canRenderFocus;if(a&&!l.focus.loading&&!d&&oe(rt(e,r)),i&&!d)return"";const{items:c,loading:p}=d?{items:Array.isArray(o.focus.items)?o.focus.items:[],loading:o.focus.loading}:ce(r);if(!(d?!0:ce(r).enabled)||!c.length&&!p||s&&p&&!c.length)return"";if(p&&!c.length)return`
      <div class="${st()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(u("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const h=Gt(c),w=c[h]||c[0],{safeImg:x,fallbackImg:k,imageAttrs:S,lazyAttrs:y}=N(w.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:w?.id?`focus-carousel:${r}:${String(w.id)}`:""}),I=w.text||"";return`
    <div id="focusCarousel" class="${st()} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${c.length>1?`
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
        <img data-focus-image src="${n(x)}" data-fallback-src="${n(k)}"${y} class="w-full h-56 object-cover" style="object-position:${ne(w)};" ${S} decoding="async" />
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${n(w.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${I?"":"hidden"}">${n(I)}</p>
      </div>
      ${c.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${c.map(($,C)=>`
            <button type="button" data-focus-dot="${C}" class="w-2.5 h-2.5 rounded-full ${C===h?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function Hs(e,t=220){const s=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${s}`}function Ft({label:e,url:t,caption:s}){if(!t)return"";const a=Hs(t,240);return`
    <button type="button" data-copy-url="${n(t)}" data-copy-label="${n(e)}" class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-left active:scale-[0.98] transition-transform">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${n(a)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${n(e)}</p>
        ${s?`<p class="text-[10px] font-bold text-slate-400 mt-1">${n(s)}</p>`:""}
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2">Tippen zum Kopieren</p>
      </div>
    </button>
  `}function Os({profile:e,restaurantId:t,catalogLabel:s}){if(!t||!Q(e))return"";if(typeof Qe=="function"){const r=de?de(t):null;(!r||r.sameRestaurant!==!0||!r.loading&&!r.loaded&&!r.error)&&Qe(e)}const a=typeof de=="function"?de(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},i=(a.tables||[]).map(r=>{const o=Wt("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:r});return Ft({label:`Tisch ${r}`,url:o,caption:`${s} fuer Tisch ${r}`})}).join("");return`
    <div class="mt-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Tisch QR</span>
          <h3 class="text-xl font-black italic tracking-tighter">Tische</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gib an, wie viele Tische du hast. Bereits erzeugte Tisch-QR bleiben dauerhaft unter denselben Links.</p>
        </div>
        <label class="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
          <input id="tableQrEnabledToggle" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${a.enabled!==!1?"checked":""} />
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Aktiv</span>
        </label>
      </div>
      <div class="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
        <div class="flex-1">
          <label for="tableQrCountInput" class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Anzahl Tische</label>
          <input id="tableQrCountInput" type="number" min="0" max="200" step="1" inputmode="numeric" value="${n(String(a.count||0))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button type="button" data-table-qr-save="true" class="h-14 px-6 rounded-[1.6rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-200/60 active:scale-95" ${a.saving?"disabled":""}>
          ${a.saving?"Speichern...":"Tische speichern"}
        </button>
      </div>
      ${a.loading?'<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tisch-QR wird geladen...</p>':""}
      ${a.status?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">${n(a.status)}</p>`:""}
      ${a.error?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(a.error)}</p>`:""}
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
  `}function Vs(){const e=l.userProfile,t=e.restaurantId||"",s=String(l.user?.uid||"").trim(),a=String(l.__authBootstrapInFlightUid||"").trim(),i=!t&&!!s&&(!!l.__authProfileLoadPromise||a===s),r=ge(e),o=Q(e),d=l.profileView?.profile?.restaurantId?l.profileView.profile:null,c=zt()&&!!d?.restaurantId&&Q(d),p=nt(Ye(e)),g=t?ue(t):null,h=g?.name||g?.restaurantName||e.name||"Business",w=t&&l.menu.restaurantId===t,x=String(l.menu.source||"").trim().toLowerCase(),k=!!w&&x==="collection",S=!!w&&x==="collection"&&l.menu.loading,y=!!t&&(S||!k),I=k?pt(l.menu.items,{filter:l.menu.filter,query:l.menu.query}):[],$=it(e)?I:I.filter(j=>!ns(j)),C=ve($),F=_(C.length);if(t&&r){is(e);const j=String(l.focus?.truthSource||"").trim().toLowerCase();return!l.focus.loading&&(l.focus.restaurantId!==t||j!=="public-menu")&&oe(e),$s(e)}return t&&o&&!k&&!S&&Et(e),t&&o&&!l.focus.loading&&l.focus.restaurantId!==t&&oe(e),t&&St(e)&&Rt(e),o?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${p}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(h)}</p>
        </div>
      </div>

      ${t?`
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${n(F)}</p>
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

      ${t?Oe(t):""}
      ${t?Us(e,t):""}
      ${t&&k?Bs(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${m("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${n(l.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${mt()}

        ${y?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(u("menu.loading",`${p} wird geladen...`,{label:p}))}</div>`:kt(C,{mode:"admin"})}
        ${l.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${n(l.menu.error)}</div>`:""}
        ${Os({profile:e,restaurantId:t,catalogLabel:p})}
      `:""}

    </div>
  `:c?we(d):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${m("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${p}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function we(e,{mode:t="profile",allowAutoEnsure:s=!0}={}){const a=l?.profileView?.routePayload&&typeof l.profileView.routePayload=="object"?l.profileView.routePayload:null,i=l?.__webDirectEntry&&typeof l.__webDirectEntry=="object"&&l.__webDirectEntry.active===!0?l.__webDirectEntry:null;let r=ie(l,{profile:e,routePayload:a,webDirectEntry:i});const o=r.restaurantId||Jt(e,a);if(!o)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${n(u("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const d=rt(e,o),c=Q(d);c&&(r=ie(l,{profile:d,routePayload:a,webDirectEntry:i,restaurantId:o,coordinateFocusWithMenu:!0}));const p=String(i?.canonicalRestaurantId||i?.restaurantId||"").trim(),g=new Set(r.targetIds),h=Qs(r.focus.truthState||""),w=r.menu.status==="ready",x=r.focus.canRenderFocus,k=w&&c,S=r.focus.matches===!0&&r.focus.loading===!0,y=t==="landing",b=String(l?.profileView?.menuAccessSource||i?.menuAccessSource||a?.menuAccessSource||"").trim().toLowerCase()==="qr",$=i?.active===!0&&i?.webPriority===!0&&i?.menuFirst===!0&&String(l?.activeTab||"").trim().toLowerCase()==="profile"&&String(l?.profileTopTab||"").trim().toLowerCase()==="menu"&&(p===o||g.has(o)),C=$&&!b,F=["ready","empty","error"].includes(r.menu.status),j=$&&F,L=$&&(!k||r.menu.status!=="ready"),M=!k||r.focus.settled===!0||h==="knownEmpty"||r.menu.status!=="ready";s&&!j&&!F&&Mt(d),s&&!L&&!M&&!S&&w&&(!C||F)&&oe(d);const v=r.menu.canRenderItems?ve(pt(r.menu.items,{filter:"all",query:""})).filter(B=>!Me(B)):[],P=v.length>0,A=G(e),T=nt(Ye(e)),z=r.menu.error||"",ye=!!String(z||"").trim(),X=r.menu.status==="loading"||r.menu.waitingForFocus===!0,ee=v.filter(B=>ae(B)==="drink"),$e=v.filter(B=>ae(B)!=="drink"),q=0,Ve=ee.length,re=Ue(e),ke=new Set;P&&o&&(Dt(v,o),ts(v,o));const Se=o&&x?(Array.isArray(r.focus.items)?r.focus.items:[]).map(B=>Be({...B,objectPosition:ne(B)})).filter(Boolean):[],Ie=Se.length?ht(d,Se,{mode:t}):"";return y&&X?'<div class="app-content-inline app-main-content-safe" style="min-height: 34vh;"></div>':re?`
      <div class="app-main-content-safe">
        ${X?`
          ${Ie}
          <div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(u("menu.loading",`${T} wird geladen...`,{label:T}))}</div>
        `:`
          ${P?Rs(d,v,{mode:t,publicMenuSurfaceState:r}):ye?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(u("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:Ie||`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">${n(u("menu.noProducts","Keine Produkte"))}</div>`}
          ${z?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(z)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5">
      ${It(d,{restaurantId:o,suppressLoading:!0,allowAutoEnsure:w&&(!C||F),requirePublicMenuTruth:!0})}
      ${X?`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(u("menu.loading",`${T} wird geladen...`,{label:T}))}</div>
        </div>
      `:`
        ${P?`
          ${A?`
            ${Bt(v,{profile:e})}
          `:`
            ${ee.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${n(u("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${yt(ee,{mode:t,useTestfirstCardUi:re,seenCategories:ke,priorityOffset:q})}
                </div>
              </section>
            `:""}
            ${$e.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${n(u("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${$t($e,{mode:t,useTestfirstCardUi:re,seenCategories:ke,priorityOffset:Ve})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${ye?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                ${n(u("menu.loadError","Menu konnte nicht geladen werden"))}
              </div>
            </div>
          `:`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${n(u("menu.noProducts","Keine Produkte"))}
              </div>
            </div>
          `}
        `}
        ${z?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(z)}</div>`:""}
      `}
    </div>
  `}function Ns(){const e=l.userProfile,t=Lt(e),s=t?l.businessPosts:l.userPosts,a=String(l.user?.uid||e?.uid||"").trim(),i=String(e?.restaurantId||"").trim(),r=String(l.__userPostsLoadingUid||"").trim(),o=String(l.__businessPostsLoadingRestaurantId||"").trim(),d=String(l.__authBootstrapInFlightUid||"").trim(),c=!!a&&r===a,p=!!i&&o===i,g=!!a&&d===a,h=t?p||g&&!s.length:c||g&&!s.length,w=String(e.handle||Ke(e.name||"user")).replace(/^@/,""),k=n(e.bio||"").replace(/\n/g,"<br>")||n(u("profile.noBio","Noch keine Bio.")),S=xe(e),y=S==="menu",I=S==="checkins",b=s,$=E(e.avatar,"avatar"),C=qe(t),F=Le(e);return`
    <div class="app-main-content-safe">
      ${F==="profile"||F==="menu"?`
      <div class="app-content-inline pb-2 ${t?F==="profile"?"pt-2":"pt-4":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${n($)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${C} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${m("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(_(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(u("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(_(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(u("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${n(w)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${k}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(e.location||"-")}</p>
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
      </div>

      ${ze(e)}
      ${_e(e)}

      ${y?`
        ${ge(e)?dt(e):we(e)}
      `:I?`
        ${je()}
      `:`
        ${h&&!b.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(u("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${l.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${Pe(b,l.profileViewMode)}
          </div>
          ${S==="posts"?`
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
        ${F==="cart"?Ge(e):F==="favorites"?We(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:ot,renderProfilePostsFancy:Pe,renderProfileCheckins:je,renderProfileTabs:ze,renderProfileViewControls:_e,renderPublicProfileView:Fs,renderMenuFilterRow:mt,renderMenuLayoutSection:_s,renderMenuItemCard:Re,renderMenuItemCardStacked:De,renderMenuDrinkGrid:yt,renderMenuFoodList:$t,renderMenuList:kt,renderFocusAdminSection:Oe,renderFocusCarousel:It,renderMenuQrCard:Ft,renderMenuAdminView:Vs,renderProfileMenuView:we,renderProfileView:Ns}}export{sn as createProfileMenuFocusRenderController};
