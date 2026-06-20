import{e as ae,f as Vn,t as Un,g as Hn,h as jt,a as Nn}from"../entry/social-app.js";import"./startup-route-runtime-context-Ba2-q0Mg.js";import"./vendor-firebase-V03pMX6J.js";function Gn(b={}){const l=b.state,Tt=b.resolvePostCountsFn,s=b.escapeHtmlFn,R=b.getOptimizedImageUrlFn,x=b.iconFn,Lt=b.isLocalBusinessProfileFn,At=typeof b.isCeoUserFn=="function"?b.isCeoUserFn:(()=>!1),Ne=b.normalizeHandleFn,Oe=b.logoFitClassFn,M=b.formatCountFn,Ke=b.renderProfileShopCartViewFn,qe=b.renderProfileShopFavoritesViewFn,zt=typeof b.ensurePostsDataForProfileFn=="function"?b.ensurePostsDataForProfileFn:(()=>{}),_t=b.ensureMenuDataForProfileFn,Mt=typeof b.ensureEditorMenuDataForProfileFn=="function"?b.ensureEditorMenuDataForProfileFn:(()=>{}),re=b.ensureFocusDataForProfileFn,Ge=b.ensureTableQrStateForProfileFn,ee=b.isShopCatalogProfileFn,Qe=b.getBusinessCatalogLabelFn,G=b.normalizeMenuTypeFn,Et=b.primeMenuItemCountsFn,Rt=typeof b.hydrateMenuCardViewerLikesFn=="function"?b.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),Bt=b.renderShopProductListFn,Dt=b.getMenuLayoutThemeFn,Vt=b.menuLayoutColors,U=b.resolveMenuItemHeroFn,ie=b.isPlaceholderUrlFn,B=b.placeholderImage,Ut=b.getFirebaseStorageUrlFn,Ht=b.isDirectImageUrlFn,We=b.formatPriceFn,Nt=typeof b.resolveCurrencyCodeForMenuItemFn=="function"?b.resolveCurrencyCodeForMenuItemFn:(()=>""),Ye=b.getMenuItemImagesFn,D=b.getMenuItemObjectPositionFn,oe=b.getMenuItemSocialIdFn,Ze=b.menuItemMetaKeyFn,Je=b.ensureMenuItemMetaFn,Xe=b.resolveMenuItemCountsFn,le=b.getFocusStateForRestaurantFn,ce=b.getTableQrStateForRestaurantFn,de=b.getFocusItemObjectPositionFn,et=b.getFocusCardClassFn,Ot=b.getFocusIndexFn,te=b.isRestaurantCafeProfileFn,tt=typeof b.getBusinessProfileTypeFn=="function"?b.getBusinessProfileTypeFn:(()=>""),ue=b.getRestaurantMetaByIdFn,Kt=b.buildUrlFn,qt=b.normalizeSearchKeyFn,Gt=b.normalizeFollowHandleFn,H={key:"",inFlightKey:""},u=(e,t=e,n={})=>Un(e,{fallback:t,params:n}),nt=(e="")=>{const t=String(e||"").trim();if(!t)return u("nav.menu","Menue");const n=t.toLowerCase();return n==="menue"||n==="menu"||n==="menü"?u("nav.menu",t):n==="shop"?"Shop":t},Qt=(e="food")=>String(e||"").trim().toLowerCase()==="drink"?u("menu.drinks","Getraenke"):u("menu.food","Speisen"),st=(e={},t=!1)=>{const n=G(e?.type||"food");return t?n==="drink"?u("menu.variant","Variante"):u("menu.product","Produkt"):n==="drink"?u("menu.drinkItem","Getraenk"):u("menu.foodItem","Speise")};function Wt(e=null,t=null){return ae(l,{profile:e,routePayload:t,webDirectEntry:l?.__webDirectEntry}).restaurantId}function at(e=null,t=""){if(!e||typeof e!="object")return e;const n=String(t||"").trim();if(!n)return e;const a=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===n&&a?e:{...e,restaurantId:n,...a?{canonicalRestaurantId:a}:{}}}function Yt(e=""){const t=String(e||"").trim();return t?ae(l,{profile:l?.profileView?.profile||l?.userProfile,routePayload:l?.profileView?.routePayload,webDirectEntry:l?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function pe(e={}){const t=String(Nt(e)||"").trim();return t?We(e?.price,t):We(e?.price)}function Zt(e=[],t="",n=""){const a=String(t||"").trim(),r=String(n||"").trim();if(!a||!r)return"";const i=Array.isArray(e)?e:[];if(!i.length)return`${a}|${r}|empty`;const o=[];return i.forEach(d=>{const c=String(oe(d)||d?.id||"").trim();c&&o.push(c)}),o.length?(o.sort(),`${a}|${r}|${o.join(",")}`):`${a}|${r}|empty`}function Jt(e=[],t=""){const n=String(l.user?.uid||"").trim(),a=Zt(e,t,n);a&&H.inFlightKey!==a&&H.key!==a&&(H.key=a,H.inFlightKey=a,Rt(e,t).catch(r=>{console.error(r),H.key===a&&(H.key="")}).finally(()=>{H.inFlightKey===a&&(H.inFlightKey="")}))}function Xt(e={}){const t=String(e?.uid||"").trim();if(t&&l.followingTargetIds.includes(t))return!0;const n=String(e?.restaurantId||"").trim();if(n&&l.followingTargetIds.includes(n))return!0;const a=Gt(e?.handle||"");return!!(a&&l.followingHandles.includes(a))}function rt(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const n=typeof ue=="function"&&ue(t)||null;return n?.specialEnabled===!0?!0:(n?.specialEnabled===!1,!1)}function en(e={}){return K(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function it(e,t,n=!0,{includeImageKey:a=!0}={}){const r=Tt(e),i=e.id?String(e.id):"",o=i?`data-open-post="${s(i)}"`:"",d=i?`data-post-like-count="${s(i)}"`:"",c=i?`data-post-comment-count="${s(i)}"`:"",p=a&&i?`data-img-key="profile-post:${s(i)}"`:"",g=e.type==="wide"||e.type==="hero",h=t&&g?"col-span-2":"",f=t&&g?"aspect-[1.8/1]":"aspect-[4/5]",w=R(e.url,g?"large":"medium",{stableKey:i?`profile-post:${i}`:"",variantGroup:"post-detail"}),k=g?800:400,S=g?400:500;return`
    <div ${o} role="button" tabindex="0" class="${h} relative ${f} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${s(w)}" loading="lazy" decoding="async" width="${k}" height="${S}" ${p} class="w-full h-full object-cover" />
        ${e.isVideo?`<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${x("play","w-3 h-3 fill-white")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${x("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${d} class="text-[10px] font-bold tracking-wide">${s(r.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${x("message-circle","w-3 h-3 text-indigo-200")}
                <span ${c} class="text-[10px] font-bold tracking-wide">${s(r.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${i&&n?`
        <button type="button" data-profile-menu-button="${s(i)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${x("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${s(i)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${s(i)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${x(g?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${g?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${s(i)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${x("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function Fe(e,t,n=!0,{includeImageKeys:a=!0}={}){const r=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${x("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${s(u("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const i=e.map(d=>it(d,r,n,{includeImageKey:a})),o=e.reduce((d,c)=>{const p=c?.type==="wide"||c?.type==="hero";return d+(p?2:1)},0);return r&&o%2===1&&i.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),i.join("")}function Pe(){const e=l.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const n=R(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${s(n)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${s(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${x("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${s(t.city||"Stadt")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${x("arrow-right","w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `:`
      <div class="app-content-inline app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${x("map-pin","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${s(u("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function fe(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}function ge(e={}){const t=String(tt(e)||"").trim().toLowerCase();return t==="hotel"||t==="motel"}function ot(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),n=t?ue(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{}}}function tn(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const n of t){if(!n||typeof n!="object")continue;const a=Number(n.lat??n.latitude),r=Number(n.lng??n.lon??n.longitude);if(Number.isFinite(a)&&Number.isFinite(r))return{lat:a,lng:r}}return null}function E(e={},t=[]){for(const n of t){const a=String(e?.[n]||"").trim();if(a)return a}return""}function be(e){if(Array.isArray(e))return e.map(n=>String(n||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(n=>n.trim()).filter(Boolean):[]}function nn(e={}){const t=[...be(e.coverImages),...be(e.hotelCoverImages),...be(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(a=>String(a||"").trim()).filter(Boolean),n=[];return t.forEach(a=>{n.includes(a)||n.push(a)}),n.slice(0,8)}function sn(e={}){const t=Array.isArray(e.features)?e.features.map(a=>String(a||"").trim()).filter(Boolean):[],n=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[E(e,["hotelFeatureOneText","gardenTerraceText"])||String(n.gardenTerrace||"").trim()||t[0]||"",E(e,["hotelFeatureTwoText","accessibilityText"])||String(n.accessibility||"").trim()||t[1]||"",E(e,["hotelFeatureThreeText","veganOptionsText"])||String(n.veganOptions||"").trim()||t[2]||""]}function an(e={}){const t=[],n=(a="")=>{const r=String(a||"").trim();r&&!t.includes(r)&&t.push(r)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(a=>{Array.isArray(a)&&a.forEach(r=>{typeof r=="string"?n(r):r&&typeof r=="object"&&n(r.label||r.name||r.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&n("Në plazh"),(e.restaurant||e.hasRestaurant)&&n("Restaurant"),(e.breakfast||e.breakfastIncluded)&&n("Mëngjes"),(e.pool||e.hasPool)&&n("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&n("WLAN"),(e.parking||e.freeParking||e.hasParking)&&n("Parking"),(e.spa||e.wellness)&&n("Wellness"),t.slice(0,8)}const rn=[{value:"m",label:"m"},{value:"km",label:"km"}],on="Në qendër",lt="Në plazh",ln=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],cn=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],dn=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function N(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function un(e="",{direct:t=!1}={}){const n=String(e||"").trim(),a=N(n),r=t||a==="ne_qender"||a==="ne_plazh"||a==="direkt_ne_qender"||a==="direkt_ne_plazh"||a.includes("direkt")&&(a.includes("strand")||a.includes("zentrum")||a.includes("center"))||a.includes("am_strand")||a.includes("im_zentrum"),i=n.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),o=i?i[1].replace(",","."):"",c=(i?String(i[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:o,unit:c,isDirect:r}}function ct({idPrefix:e="",iconName:t="navigation",label:n="",value:a="",directLabel:r="",direct:i=!1}={}){const o=un(a,{direct:i});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${x(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${s(n)}</p>
          <p class="text-[10px] font-bold text-slate-400">${s(r)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${s(e)}Value" type="number" min="0" step="0.1" value="${s(o.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${s(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${rn.map(d=>`<option value="${s(d.value)}" ${o.unit===d.value?"selected":""}>${s(d.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${s(r)}</span>
        <input id="${s(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${o.isDirect?"checked":""} />
      </label>
    </div>
  `}function pn(e=[],t=""){const n=String(t||"").trim(),a=new Set(e.map(N));return`
    <option value="">Zgjidh</option>
    ${e.map(r=>`<option value="${s(r)}" ${N(r)===N(n)?"selected":""}>${s(r)}</option>`).join("")}
    ${n&&!a.has(N(n))?`<option value="${s(n)}" selected>Aktuale: ${s(n)}</option>`:""}
  `}function je({id:e="",iconName:t="badge-check",label:n="",value:a="",options:r=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${x(t,"w-4 h-4")}
        </div>
        <label for="${s(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${s(n)}</label>
      </div>
      <select id="${s(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${pn(r,a)}
      </select>
    </div>
  `}function fn(e={},t=[]){const n=new Set(t.map(N).filter(Boolean)),a=[],r=(i="")=>{const o=String(i||"").trim();if(!o)return;const d=N(o);n.has(d)||a.some(c=>N(c)===d)||a.push(o)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(i=>be(i).forEach(r)),a}function gn({existingImages:e=[],newPreviews:t=[],imageUrlDraft:n=""}={}){const a=[...t.map((o,d)=>({src:o,kind:"new",idx:d})),...e.map((o,d)=>({src:o,kind:"existing",idx:d}))].filter(o=>o.src),r=a[0]?.src||n||"",i=r?R(r,"large"):B;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${s(i||B)}" class="w-full h-52 object-cover bg-white" />
        <button type="button" id="hotelCardCoverImagesTrigger" aria-label="Ngarko foto" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${x("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${x("plus","w-2.5 h-2.5")}
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
                ${o.kind==="existing"?`<span data-hotel-card-existing-image="${s(o.src)}" hidden></span>`:""}
                <img src="${s(R(o.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-hotel-card-image-remove="${o.idx}" data-hotel-card-image-source="${o.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${x("x","w-3 h-3")}
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

      <input id="hotelCardCoverImageUrl" type="hidden" value="${s(n)}" />
    </div>
  `}function me({iconName:e="info",label:t="",value:n="",helper:a=""}={}){return`
    <div class="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm">
      <div class="flex items-start gap-4">
        <div class="w-11 h-11 rounded-[1.25rem] bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          ${x(e,"w-5 h-5")}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">${s(t)}</p>
          <p class="text-sm font-black text-slate-900 leading-snug">${s(n||"Shto detajet")}</p>
          ${a?`<p class="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">${s(a)}</p>`:""}
        </div>
      </div>
    </div>
  `}function dt(e={}){const t=ot(e),n=tn(t),a=E(t,["address","primaryAddress","location","formattedAddress","street"]),r=E(t,["city","locationCity","primaryCity","region","country"]),i=E(t,["beachDistance","distanceToBeach","beachDistanceLabel","strandEntfernung"]),o=E(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),d=E(t,["rating","reviewRating","stars","hotelStars"]),c=E(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),p=an(t),g=n?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${n.lat},${n.lng}`)}`:a||r?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a} ${r}`.trim())}`:"";return`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm overflow-hidden">
        <div class="h-40 rounded-[1.6rem] bg-cyan-50 border border-cyan-100 relative overflow-hidden mb-4">
          <div class="absolute inset-0 opacity-80" style="background-image: linear-gradient(135deg, rgba(0,204,229,0.18), rgba(15,23,42,0.04));"></div>
          <div class="absolute inset-0 flex items-center justify-center text-cyan-600">
            ${x("map-pin","w-10 h-10")}
          </div>
          <div class="absolute left-4 right-4 bottom-4 bg-white/90 backdrop-blur rounded-2xl p-3 border border-white/70">
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Lokacioni</p>
            <p class="text-xs font-black text-slate-900 leading-snug">${s(a||r||"Shto lokacionin")}</p>
          </div>
        </div>
        ${g?`
          <a href="${s(g)}" target="_blank" rel="noopener noreferrer" class="w-full h-12 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            ${x("navigation","w-4 h-4")} Hap hartën
          </a>
        `:""}
      </div>

      <div class="grid grid-cols-1 gap-4">
        ${me({iconName:"map-pin",label:"Adresa",value:[a,r].filter(Boolean).join(", ")||"Shto lokacionin",helper:n?`${n.lat.toFixed(5)}, ${n.lng.toFixed(5)}`:""})}
        ${me({iconName:"navigation",label:"Qendra",value:o||"Shto detajet"})}
        ${me({iconName:"waves",label:"Plazhi",value:i||(t.beachfront||t.onBeach?lt:"Shto detajet")})}
        ${me({iconName:"star",label:"Vlerësime",value:d?`${d}${c?` / ${c} vlerësime`:""}`:"Pa vlerësime",helper:E(t,["reviewSummary","ratingSummary","commentsSummary"])})}
      </div>

      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Të përfshira</p>
        ${p.length?`
          <div class="flex flex-wrap gap-2">
            ${p.map(h=>`<span class="px-3 py-2 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600">${s(h)}</span>`).join("")}
          </div>
        `:`
          <p class="text-sm font-bold text-slate-400">Shto pajisjet dhe detajet e dhomave.</p>
        `}
      </div>
    </div>
  `}function bn(e={}){const t=ot(e),n=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),a=t?.name||t?.restaurantName||e?.name||"Hotel",r=String(l.hotelCardEditor?.status||"").trim(),i=l.hotelCardEditor?.saving===!0,o=l.hotelCardEditor&&typeof l.hotelCardEditor=="object"?l.hotelCardEditor:{},d=Array.isArray(o.existingImages)?o.existingImages.map(_=>String(_||"").trim()).filter(Boolean):nn(t),c=Array.isArray(o.imagePreviews)?o.imagePreviews.map(_=>String(_||"").trim()).filter(Boolean):[],p=String(o.imageUrlDraft||"").trim(),[g,h,f]=sn(t),w=fn(t,[g,h,f]),k=E(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),S=E(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),$=E(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),I=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,m=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,y=o.detailsOpen===!0||i,F=c[0]||d[0]||"",C=F?R(F,"thumb"):B,j=[k,S,$?`${$} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",A=r.includes("fehl")||r.includes("Bitte")||r.includes("Nuk");return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel Card</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(a)}</p>
        </div>
      </div>

      ${n?`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
              <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hotel & Ofertat</p>
            </div>
            <button type="button" data-hotel-card-details-open aria-expanded="${y?"true":"false"}" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
              ${x("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${y?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${s(C||B)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${s(a)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(j)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${y?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${x("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${r&&!y?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${A?"text-rose-500":"text-slate-500"}">${s(r)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${s(n)}" data-hotel-card-details-panel class="${y?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
                <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              </div>
              <button type="button" data-hotel-card-details-close class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                ${x("x","w-4 h-4")}
              </button>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fotot</p>
              ${gn({existingImages:d,newPreviews:c,imageUrlDraft:p})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${ct({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:k,directLabel:on,direct:I})}
              ${ct({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:S,directLabel:lt,direct:m})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${s($)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${je({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:g,options:ln})}
              ${je({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:h,options:cn})}
              ${je({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:f,options:dn})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${s(w.join(`
`))}</textarea>
              </div>
            </div>

            ${r?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${A?"text-rose-500":"text-slate-500"}">${s(r)}</div>`:""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${i?"disabled":""}>
              ${i?"Po ruhet...":"Ruaj Hotel Details"}
            </button>
        </div>
        ${Ve(n,{variant:"travel-offers"})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function xe(e={}){const t=String(l.profileTopTab||"").trim().toLowerCase(),n=String(l.profileContentTab||"").trim().toLowerCase();return fe(e)?t==="menu"?"menu":n==="menu"||n==="posts"?n:"posts":n==="media"||n==="checkins"?n:"posts"}function Te(e={}){const t=String(l.profileTopTab||"").trim().toLowerCase();return fe(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(l.user?.uid||"").trim()?"favorites":"profile"}function ut(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function mn(e=0,t=1){const n=Math.max(1,Number(t||0)||1),a=Math.round(Number(e||0));if(!Number.isFinite(a))return 0;const r=a%n;return r<0?r+n:r}function xn(e=0){return ut(e)}function hn(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],n=ut(l.profileLandingStep),a=mn(l.profileLandingGreetingIndex,t.length),r=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},i=String(r.businessName||e.name||"casarita").trim()||"casarita",o=i.endsWith(".")?i:`${i}.`,d=R(r.logoUrl||e.avatar||"","avatar"),p=String(d||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",g=String(r.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),h=String(r.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),f=n>=2,w=n>=3,k=Array.isArray(l.profileView?.posts)?l.profileView.posts:Array.isArray(e?.posts)?e.posts:[],S=xn(n),$=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${x("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(I=>{const m=S===I;return`
            <div data-landing-step-dot="${I}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${m?"1.22":"1"}); opacity: ${m?"1":"0.88"}; background: ${m?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${m?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${m?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${n===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${n===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((I,m)=>{const y=m===a,F=m===(a-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${m}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${y?"opacity: 1; transform: translateY(0) scale(1);":F?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!y&&!F?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${s(I)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${s(p)}" alt="${s(`${i} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex items-center" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;color:#111827;">
              ${s(o)}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${s(g)}<br />
            ${s(h)}
          </p>
        </div>
        ${$}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${n<1?"translate-y-full":n===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===1?"1":"0"}; pointer-events: ${n===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${he(e,k,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${$}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${n<2?"translate-y-full":n===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===2?"1":"0"}; pointer-events: ${n===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${f?he(e,k,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${$}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${n<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${n===3?"1":"0"}; pointer-events: ${n===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${w?he(e,k,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function Le(e=l.profileView?.profile||l.userProfile,{landingPreview:t=!1,selectedTabOverride:n="",compact:a=!1}={}){const r=fe(e),i=String(n||xe(e)).trim().toLowerCase()||"posts",o=ge(e),d=r?[{id:"posts",label:u("profile.posts","Beitraege")},{id:"menu",label:o?"Details":u("nav.menu","Menue"),surface:o?"hotel-details":"menu"}]:[{id:"posts",label:u("profile.posts","Beitraege")},{id:"media",label:u("profile.media","Medien")},{id:"checkins",label:u("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${a?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${d.map(c=>`
          <button data-profile-tab="${c.id}" ${c.surface?`data-profile-tab-surface="${s(c.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${i===c.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${c.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function Ae(e=l.profileView?.profile||l.userProfile,{disabled:t=!1}={}){const n=xe(e);return n==="checkins"||n==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${s(u("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${l.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${x("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${l.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${x("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function he(e={},t=[],{topTabOverride:n="",tutorialMode:a=!1,contentTabOverride:r="",landingHideContent:i=!1,collapseIdentity:o=!1,contentReveal:d=!1,landingMode:c=!1}={}){const p=Xt(e),g=!!e.privateAccount&&e.uid&&String(e.uid)!==String(l.user?.uid||"")&&!p,h=!!e.pendingFollowRequest&&!p,f=e.restaurantId?"Business":u("nav.user","User"),w=String(e.handle||Ne(e.name||"user")).replace(/^@/,""),S=s(e.bio||"").replace(/\n/g,"<br>")||s(u("profile.noBio","Noch keine Bio.")),$=fe(e),I=String(n||Te(e)).trim().toLowerCase()||"profile",m=String(r||xe(e)).trim().toLowerCase()||"posts",y=m==="menu",F=m==="checkins",C=t,A={...l?.profileView&&typeof l.profileView=="object"?l.profileView:{},profile:e,posts:Array.isArray(C)?C:[]},_=Hn(l,{profileView:A,profileTopTab:I,profileContentTab:m}),Y=String(_?.header?.status||"").trim().toLowerCase()||"loading",v=String(_?.posts?.status||"").trim().toLowerCase()||"loading",P=String(e?.avatar||"").trim(),T=P?R(P,"avatar"):"",L=Oe(!!e.restaurantId),z=e.uid||e.restaurantId||w||"public",$e=c?"":`data-img-key="avatar:public:${s(z)}"`,Z=!!P,J=He=>{if(He==null)return!1;const Pt=Number(He);return Number.isFinite(Pt)&&Pt>=0},ye=Z||J(e?.followers)||J(e?.following),q=jt(Y)&&!ye,Ue=!!String(T||"").trim()&&Z,se=q?"...":M(e.followers),ke=q?"...":M(e.following),Se=$?I==="profile"?"pt-2":"pt-4":"pt-10",Ie=p?u("profile.following","Following"):h?u("profile.requested","Requested"):g?u("profile.request","Request"):u("profile.follow","Follow"),V=p?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":h?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",En=a?"select-none":"app-main-content-safe",X=a?"pointer-events-none":"",Rn=!o,Ct=!i,Ce=d?c?"transition-opacity duration-200":"animate-in fade-in duration-300":"",Ft=m==="posts"&&C.length>0,Bn=m!=="posts"||Ft||v==="empty"||v==="error",Dn=m==="posts"&&!Ft&&v==="error";return!a&&(m==="posts"||m==="media")&&e?.restaurantId&&jt(v)&&zt(e),`
    <div class="${En}" ${a?'data-landing-tutorial-surface="true"':""}>
      ${I==="profile"||I==="menu"?`
      ${Rn?`
        <div class="app-content-inline pb-2 ${Se}">
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${X}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${Ue?`<img src="${s(T)}" decoding="async" width="100" height="100" ${$e} class="w-full h-full rounded-[1.8rem] ${L} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${q?"animate-pulse":""}">${x(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${x("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${q?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(se)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${q?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(ke)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e.name||"User")}</h1>
                ${$?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${s(w)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${S}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(e.location||"-")} / ${f}</p>
                ${q?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${s(u("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${s(e.handle)}" data-target-type="${s(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${s(e.restaurantId||e.uid||"")}" data-target-name="${s(e.name||"")}" data-target-avatar="${s(e.avatar||"")}" ${h?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${V} ${h?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${p?x("check","w-4 h-4"):""}
                    ${Ie}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${s(e.uid||"")}" data-chat-handle="${s(e.handle||"")}" data-chat-name="${s(e.name||"")}" data-chat-avatar="${s(e.avatar||"")}" ${g?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${g?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${x("message-circle","w-5 h-5")}
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
              ${x("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${s(u("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${s(u("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${Le(e,{landingPreview:a,selectedTabOverride:m,compact:o})}
        ${Ct?Ae(e,{disabled:a}):""}

        ${Ct?y?`
          <div class="${X} ${Ce}">
            ${ge(e)?dt(e):we(e,{mode:c?"landing":"profile",allowAutoEnsure:!c})}
          </div>
        `:F?`
          <div class="${X} ${Ce}">
            ${Pe()}
          </div>
        `:`
          ${Bn?`
            ${Dn?`
              <div class="app-content-inline ${X}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${s(u("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${l.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${X} ${Ce}">
                ${Fe(C,l.profileViewMode,!1,{includeImageKeys:!c})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${X}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${Ce}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${I==="cart"?Ke(e):I==="favorites"?qe(e):""}
      `}
    </div>
  `}function vn(){const e=l.profileView;if(!e||!e.profile)return"";const t=e.profile,n=e.posts||t.posts||[],a=Te(t);return a==="landing"?hn(t):he(t,n,{topTabOverride:a,tutorialMode:!1})}function pt(e,{filter:t="all",query:n=""}={}){const a=Array.isArray(e)?e:[],r=qt(n||"");return a.filter(i=>t==="all"||G(i.type)===t?r?`${i.name||""} ${i.category||""} ${i.description||""}`.toLowerCase().includes(r):!0:!1)}function ft(e,t=0){const n=Number(e);return Number.isFinite(n)?Math.max(0,Math.floor(n)):Math.max(0,Number(t)||0)}function ve(e=[]){return(Array.isArray(e)?e.slice():[]).map((n,a)=>({item:n,idx:a,order:ft(n?.orderIndex,a)})).sort((n,a)=>n.order-a.order||n.idx-a.idx).map((n,a)=>({...n.item,orderIndex:ft(n.item?.orderIndex,a)}))}function ze(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function ne(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":G(e?.type||"food")==="drink"?"drink":"food"}function wn(e={}){return String(e?.category||u("menu.other","Sonstiges")).trim()||u("menu.other","Sonstiges")}function $n(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const yn=4,kn={thumb:160,small:480,medium:768,large:1280};function gt({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<yn&&n===0}function Sn({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){const a=gt({mode:e,priorityIndex:t,slideIndex:n}),r=e==="profile"?' data-image-reveal="menu"':"";return a?`loading="eager" fetchpriority="high"${r}`:`loading="lazy" fetchpriority="low"${r}`}function In({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function O(e,{mode:t="profile",priorityIndex:n=-1,slideIndex:a=0,stableKey:r="",preferredSize:i="small",candidateSizes:o=["small","medium","large"],variant:d="grid"}={}){const c=String(e||"").trim(),p=t==="profile"&&r?{stableKey:r}:null,g=gt({mode:t,priorityIndex:n,slideIndex:a}),h=t==="profile"&&!g&&d!=="thumb",f=R(c,i,p),w=ie(f)?B:f,k=Ut(c),S=Ht(c)&&c!==w?c:k,$=[],I=new Set;o.forEach(P=>{const T=kn[P]||0;if(!T)return;const L=R(c,P,p);if(!L||ie(L))return;const z=`${L}|${T}`;I.has(z)||(I.add(z),$.push(`${L} ${T}w`))});const m=$.length>1?$.join(", "):"",y=m?In({variant:d}):"",F=h?"":m,C=h?"":y,j=F?` srcset="${s(F)}"`:"",A=C?` sizes="${s(C)}"`:"",_=Sn({mode:t,priorityIndex:n,slideIndex:a}),Y=`${_}${j}${A}`,v=h?[`data-menu-lazy-src="${s(w)}"`,`data-menu-lazy-fallback="${s(S||B)}"`,m?`data-menu-lazy-srcset="${s(m)}"`:"",y?`data-menu-lazy-sizes="${s(y)}"`:""].filter(Boolean).join(" "):"";return{safeImg:h?B:w,fallbackImg:h?B:S,imageAttrs:Y,lazyAttrs:v?` ${v}`:"",srcsetValue:m,sizesValue:y,loadingAttrs:_}}function Q(e=[],t,n=null){const a=n instanceof Set?n:new Set;return e.map((r,i)=>{const o=wn(r),d=$n(o),c=!!d&&!a.has(d);return c&&a.add(d),`<div${c?` data-menu-category-anchor="${s(d)}"`:""} class="h-full">${t(r,i)}</div>`}).join("")}function _e(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function Cn(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function bt(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),n=Cn(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),a=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&n?{type:"link",url:n,productId:""}:t==="product"&&a?{type:"product",url:"",productId:a}:{type:"self",url:"",productId:""}}function mt(){const e=l.menu.filter||"all";return`
    <div class="flex gap-2 mb-5">
      ${(ee(l.userProfile)?[{id:"all",label:u("menu.all","Alle")},{id:"food",label:u("menu.products","Produkte")},{id:"drink",label:u("menu.variants","Varianten")}]:[{id:"all",label:u("menu.all","Alle")},{id:"food",label:u("menu.food","Speisen")},{id:"drink",label:u("menu.drinks","Getraenke")}]).map(a=>`
        <button data-menu-filter="${a.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${e===a.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${a.label}
        </button>
      `).join("")}
    </div>
  `}function Fn(){const e=Dt().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${Vt.map(t=>{const n=t.id===e,a=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${n?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${n?x("check",`w-4 h-4 ${a}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function Me(e,{mode:t="profile",priorityIndex:n=-1}={}){const a=U(e),r=t==="profile"?W(e,{index:0}):"",{safeImg:i,fallbackImg:o,imageAttrs:d,lazyAttrs:c}=O(a,{mode:t,priorityIndex:n,stableKey:r,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),p=pe(e),g=l.activeTab==="menu"?l.userProfile:l.profileView?.profile||l.userProfile,h=ee(g),f=st(e,h),w=e.category||"",k=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${s(i)}" data-fallback-src="${s(o)}"${c} class="w-full h-full object-cover" style="object-position:${D(e)};" ${d} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${s(e.name||u("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${s(p)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${w?`<span>${s(w)}</span>`:""}
            <span>${s(f)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${x("more-horizontal","w-4 h-4")}
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
        <img src="${s(i)}" data-fallback-src="${s(o)}"${c} class="w-full h-full object-cover" style="object-position:${D(e)};" ${d} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${s(e.name||u("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${s(p)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${w?`<span>${s(w)}</span>`:""}
          <span>${s(f)}</span>
        </div>
        ${k?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${s(k)}</p>`:""}
      </div>
    </div>
  `}function Ee(e,{mode:t="profile",variant:n="food",priorityIndex:a=-1}={}){const r=U(e),i=t==="profile"?W(e,{index:0}):"",o=n==="drink",{safeImg:d,fallbackImg:c,imageAttrs:p,lazyAttrs:g}=O(r,{mode:t,priorityIndex:a,stableKey:i,preferredSize:o?"small":"medium",candidateSizes:o?["small","medium"]:["small","medium","large"],variant:o?"grid":"hero"}),h=pe(e),f=l.activeTab==="menu"?l.userProfile:l.profileView?.profile||l.userProfile,w=ee(f),k=st(e,w),S=e.category||"",$=e.description||"",I=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",m=l.menu.restaurantId||l.profileView?.profile?.restaurantId||l.userProfile.restaurantId||"",y=oe(e),F=Ze(m,y),C=F?Je(F):{likes:[],comments:[],counts:{likes:0,comments:0}},j=Xe(C),A=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${x("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${s(y)}">${s(M(j.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${x("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${s(y)}">${s(M(j.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${I} class="w-full ${o?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${o?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        <img src="${s(d)}" data-fallback-src="${s(c)}"${g} class="w-full h-full object-cover" style="object-position:${D(e)};" ${p} decoding="async" />
      </div>
      ${o?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${s(e.name||u("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${s(h)}</p>
          ${A}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${s(e.name||u("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${s(h)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${S?`<span>${s(S)}</span>`:""}
            <span>${s(k)}</span>
          </div>
          ${$?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${s($)}</p>`:""}
          ${A}
        </div>
      `}
    </div>
  `}function Re(e={}){if(!e?.restaurantId||ee(e))return!1;const t=String(tt(e)||"").trim().toLowerCase();return t==="restaurant"||t==="cafe"||t==="fastfood"}function xt(e){const t=e?.restaurantId||l.menu.restaurantId||l.profileView?.profile?.restaurantId||l.userProfile.restaurantId||"",n=oe(e),a=Ze(t,n),r=a?Je(a):{likes:[],comments:[],counts:{likes:0,comments:0}},i=String(l.user?.uid||"").trim(),o=String(l.user?.handle||"").trim().toLowerCase(),d=!!r.likes?.some(c=>{const p=String(c?.uid||"").trim();if(i&&p&&p===i)return!0;const g=String(c?.handle||"").trim().toLowerCase();return!!o&&!!g&&g===o});return{itemId:n,meta:r,counts:Xe(r),isLiked:d}}function W(e,{index:t=0}={}){const n=String(e?.restaurantId||l.menu.restaurantId||l.profileView?.profile?.restaurantId||l.userProfile.restaurantId||"").trim(),a=String(e?.id||oe(e)||"").trim();if(!n||!a)return"";const r=Number(t),i=Number.isFinite(r)?Math.max(0,Math.floor(r)):0;return`menu-detail:${n}:${a}:${i}`}function Pn(e){const t=typeof Ye=="function"?Ye(e):[],n=Array.isArray(t)?t.filter(Boolean):[];if(n.length)return n;const a=U(e);return a?[a]:[]}function K(e){return Nn(e?.cardStyle||"",G(e?.type||"food"))}function Be(e,{menuItemId:t=""}={}){if(!e)return null;const n=String(t||e.menuItemId||e.itemId||e.productId||"").trim();return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:U(e)||e.imageUrl||"",objectPosition:e.objectPosition||D(e),menuItemId:n}}function ht(e,t=[],{mode:n="profile"}={}){const a=e?.restaurantId||"";return!a||!Re(e)||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((r,i)=>{const o=r.imageUrl||"",d=String(r.menuItemId||r.id||"").trim(),{safeImg:c,fallbackImg:p,imageAttrs:g,lazyAttrs:h}=O(o,{mode:n,priorityIndex:i,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:d?`menu-focus:${a}:${d}`:""}),f=String(r.menuItemId||"").trim(),w=n==="profile"&&f?`data-menu-open="${s(f)}" role="button"`:"";return`
            <div ${w} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${w?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${s(c)}" data-fallback-src="${s(p)}"${h} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${r.objectPosition||"50% 50%"};" ${g} decoding="async" />
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${x("sparkles","w-3 h-3 text-amber-500")}
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
  `}function vt(e,{mode:t="profile",priorityIndex:n=-1}={}){const a=U(e),r=t==="profile"?W(e,{index:0}):"",{safeImg:i,fallbackImg:o,imageAttrs:d,lazyAttrs:c}=O(a,{mode:t,priorityIndex:n,stableKey:r,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),p=pe(e),g=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",{itemId:h,counts:f,isLiked:w}=xt(e);return`
    <div ${g} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${s(i)}" data-fallback-src="${s(o)}"${c} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${D(e)};" ${d} decoding="async" />
        <button
          type="button"
          data-menu-card-like="${s(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${w?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${w?"true":"false"}"
        >
          ${x("heart","w-3.5 h-3.5 fill-current opacity-80")}
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
            ${x("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${s(h)}">${s(M(f.likes))}</span>
          <span data-menu-comment-count="${s(h)}">${s(M(f.comments))}</span>
        </div>
      </div>
    </div>
  `}function jn(e,t="profile"){if(t!=="profile")return"";const n=bt(e);return n.type==="link"&&n.url?`data-menu-special-link="${s(n.url)}" role="button" tabindex="0"`:n.type==="product"&&n.productId?`data-menu-open="${s(n.productId)}" role="button"`:`data-menu-open="${s(e.id)}" role="button"`}function De(e,{mode:t="profile",size:n="default",priorityIndex:a=-1}={}){const r=U(e),i=t==="profile"?W(e,{index:0}):"",o=n==="food",{safeImg:d,fallbackImg:c,imageAttrs:p,lazyAttrs:g}=O(r,{mode:t,priorityIndex:a,stableKey:i,preferredSize:o?"medium":"small",candidateSizes:o?["small","medium","large"]:["small","medium"],variant:o?"hero":"grid"}),h=jn(e,t),f=String(e.category||"Special").trim()||"Special",w=s(String(e.name||"Special")).replace(/\n/g,"<br>");return n==="food"?`
      <div ${h} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${s(d)}" data-fallback-src="${s(c)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${D(e)};" ${p} decoding="async" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${x("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${s(f)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${h} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${s(d)}" data-fallback-src="${s(c)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${D(e)};" ${p} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${x("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${s(f)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
        </div>
      </div>
    </div>
  `}function wt(e,{mode:t="profile",priorityIndex:n=-1}={}){const a=pe(e),r=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",i=Pn(e),d=(i.length?i:[U(e)||""]).filter(Boolean),c=d.length?d.slice(0,12):[""],p=c.length>1,{itemId:g,counts:h,isLiked:f}=xt(e),w=M(Math.max(0,Number(h.likes)||0)),k=M(Math.max(0,Number(h.comments)||0));return`
    <div ${r} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${p?`
          <div
            data-menu-card-gallery-track="${s(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${c.map((S,$)=>{const I=t==="profile"?W(e,{index:$}):"",m=O(S||"",{mode:t,priorityIndex:n,slideIndex:$,stableKey:I,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),y=$>0,F=y?B:m.safeImg,C=y?B:m.fallbackImg,j=y?m.loadingAttrs:m.imageAttrs,A=y?"":m.lazyAttrs||"",_=y?` data-menu-card-deferred-src="${s(m.safeImg)}"
                    data-menu-card-deferred-fallback="${s(m.fallbackImg)}"
                    ${m.srcsetValue?`data-menu-card-deferred-srcset="${s(m.srcsetValue)}"`:""}
                    ${m.sizesValue?`data-menu-card-deferred-sizes="${s(m.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${$}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${s(F)}" data-fallback-src="${s(C)}"${A}${_} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${D(e)};" ${j} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${c.map((S,$)=>{const I=t==="profile"?W(e,{index:$}):"",{safeImg:m,fallbackImg:y,imageAttrs:F,lazyAttrs:C}=O(S||"",{mode:t,priorityIndex:n,slideIndex:$,stableKey:I,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${s(m)}" data-fallback-src="${s(y)}"${C} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${D(e)};" ${F} decoding="async" />
              </div>
            `}).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${s(e.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${f?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${f?"true":"false"}"
        >
          ${x("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${p?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${c.map((S,$)=>`
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
          <span class="text-[17px] font-black text-slate-900 whitespace-nowrap">${s(a)}</span>
        </div>
        <p class="text-[14px] text-slate-500 line-clamp-2 leading-relaxed mb-4" style="margin-bottom:16px;">${s(e.description||"")}</p>
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div class="flex items-center gap-2">
            <div class="hidden">
              <span data-menu-like-count="${s(g)}">${s(w)}</span>
              <span data-menu-comment-count="${s(g)}">${s(k)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${s(u("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${x("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function Tn(e,t,{mode:n="profile",publicMenuSurfaceState:a=null}={}){const r=ve(Array.isArray(t)?t:[]),i=String(e?.restaurantId||"").trim(),o=n==="admin"||Yt(i),d=a?.focus?.canRenderFocus?{items:Array.isArray(a.focus.items)?a.focus.items:[],enabled:!0}:i&&o?le(i):{items:[],enabled:!1},c=d.enabled?(Array.isArray(d.items)?d.items:[]).map(v=>Be({...v,objectPosition:de(v)})):[],p=r.filter(v=>K(v)==="testfirst_focus"&&!ze(v)).map(v=>Be(v,{menuItemId:v.id||""})).filter(Boolean),g=new Set,h=[...c,...p].filter(v=>{const P=String(v.menuItemId||v.id||`${v.title}|${v.text}|${v.imageUrl}`);return!P||g.has(P)?!1:(g.add(P),!0)}),f=r.filter(v=>!ze(v)),w=f.filter(v=>K(v)!=="testfirst_focus"),k=w.length?w:f,S=w.length?h:[],$=k.filter(v=>ne(v)==="drink"),I=k.filter(v=>ne(v)!=="drink"),m=(v=[])=>{const P=[],T=[];return v.forEach(L=>{const z=K(L);z==="testfirst_food"||z==="testfirst_special"&&_e(L)==="food"?T.push(L):P.push(L)}),{gridItems:P,foodItems:T}},y=(v,P=-1)=>K(v)==="testfirst_special"?De(v,{mode:n,priorityIndex:P}):vt(v,{mode:n,priorityIndex:P});let F=0;const C=()=>{const v=F;return F+=1,v},j=new Set,A=(v,P)=>!P.gridItems.length&&!P.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${s(v)}">
        ${P.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${s(v)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${Q(P.gridItems,T=>y(T,C()),j)}
            </div>
          </div>
        `:""}
        ${P.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${s(v)}">
            <div class="app-content-inline">
              ${Q(P.foodItems,T=>{const L=K(T),z=C();return L==="testfirst_special"?De(T,{mode:n,size:"food",priorityIndex:z}):wt(T,{mode:n,priorityIndex:z})},j)}
            </div>
          </div>
        `:""}
      </section>
    `,_=m($),Y=m(I);return`
    <div>
      ${ht(e,S,{mode:n})}
      <div id="menu-section" class="mt-5">
        ${A("drink",_)}
        ${A("food",Y)}
      </div>
    </div>
  `}function $t(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:a=null,priorityOffset:r=0}={}){return e.length?n?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${Q(e,(i,o)=>vt(i,{mode:t,priorityIndex:r+o}),a)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${Q(e,(i,o)=>Ee(i,{mode:t,variant:"drink",priorityIndex:r+o}),a)}
    </div>
  `:""}function yt(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:a=null,priorityOffset:r=0}={}){return e.length?n?`
      <div>
        ${Q(e,(i,o)=>K(i)==="testfirst_special"&&_e(i)==="food"?De(i,{mode:t,size:"food",priorityIndex:r+o}):wt(i,{mode:t,priorityIndex:r+o}),a)}
      </div>
    `:`
    <div class="space-y-4">
      ${Q(e,(i,o)=>Ee(i,{mode:t,variant:"food",priorityIndex:r+o}),a)}
    </div>
  `:""}function kt(e,{mode:t="profile"}={}){if(t==="admin"){const n=String(l?.menu?.filter||"all").trim().toLowerCase(),a=e.filter(c=>G(c?.type)==="drink"),r=e.filter(c=>G(c?.type)!=="drink"),i=(c,p,{addType:g=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${s(c)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${s(c)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(M(p.length))} Eintraege</p>
          </div>
          ${g?`
            <button type="button" data-menu-add-${s(g)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${x("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${p.length?`<div class="space-y-3">${p.map(h=>Me(h,{mode:"admin"})).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(u("menu.noProducts","Keine Produkte"))}</div>`}
      </div>
    `,o=[{title:u("menu.drinks","Getraenke"),list:a,addType:"drink"},{title:u("menu.food","Speisen"),list:r,addType:"food"}];if(n==="all")return`
        <div>
          ${o.map(c=>i(c.title,c.list,{addType:c.addType})).join("")}
        </div>
      `;const d=o.filter(c=>c.list.length>0);return d.length?`
      <div>
        ${d.map(c=>i(c.title,c.list,{addType:c.addType})).join("")}
      </div>
    `:n==="drink"?i(u("menu.drinks","Getraenke"),[],{addType:"drink"}):n==="food"?i(u("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((n,a)=>Me(n,{mode:t,priorityIndex:a})).join("")}
    </div>
  `:`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
        ${s(u("menu.noProducts","Keine Produkte"))}
      </div>
    `}function Ve(e,{variant:t="focus"}={}){if(!e)return"";const{items:n,enabled:a,loading:r}=le(e,{includeInactive:!0}),i=M(n.length),o=String(t||"").trim().toLowerCase()==="travel-offers",d=o?"Ofertat":"Sot ne Fokus",c=o?"Oferta":"Highlights",p=o?"Im Travel und Profil sichtbar":"Im Profil sichtbar",g=o?"Ofertat werden geladen...":u("focus.loading","Fokus wird geladen..."),h=o?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${s(d)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${s(c)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(i)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${x("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${o?"Oferta anzeigen":"Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${s(p)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${a?"checked":""} />
      </label>

      ${n.length?`
        <div class="space-y-3">
          ${n.map(f=>{const w=R(f.imageUrl||"","thumb"),k=ie(w)?B:w,S=f.active!==!1?"Aktiv":"Inaktiv",$=f.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(k)}" class="w-full h-full object-cover" style="object-position:${de(f)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(f.title||"Sot ne Fokus")}</p>
                  ${f.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(f.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${$}">${S}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${s(f.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${s(f.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:r?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(g)}</div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(h)}</div>
      `}
    </div>
  `}function Ln(e){if(!Re(e)||!rt(e))return"";const n=ve((l.menu.items||[]).filter(a=>K(a)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(M(n.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${x("plus","w-4 h-4")}
        </button>
      </div>
      ${n.length?`
        <div class="space-y-3">
          ${n.map(a=>{const r=R(U(a),"thumb"),i=ie(r)?B:r,o=bt(a),d=o.type==="link"?"Link":o.type==="product"?"Produkt-Modal":"Diese Karte",c=_e(a)==="food"?"Food-Size":"Normal",p=Qt(ne(a));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(i)}" class="w-full h-full object-cover" style="object-position:${D(a)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(a.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${s(p)}</span>
                    <span>${s(c)}</span>
                    <span>${s(d)}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-menu-edit="${s(a.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-menu-delete="${s(a.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Special-Karten</div>
      `}
    </div>
  `}function St(e,{restaurantId:t="",suppressLoading:n=!1,allowAutoEnsure:a=!0,requirePublicMenuTruth:r=!0}={}){const i=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!i||!te(e))return"";const o=ae(l,{profile:e,routePayload:l?.profileView?.routePayload,webDirectEntry:l?.__webDirectEntry,restaurantId:i});if(r&&o.menu.status!=="ready")return"";const d=!r||o.focus.canRenderFocus;if(a&&!l.focus.loading&&!d&&re(at(e,i)),r&&!d)return"";const{items:c,loading:p}=d?{items:Array.isArray(o.focus.items)?o.focus.items:[],loading:o.focus.loading}:le(i);if(!(d?!0:le(i).enabled)||!c.length&&!p||n&&p&&!c.length)return"";if(p&&!c.length)return`
      <div class="${et()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const h=Ot(c),f=c[h]||c[0],{safeImg:w,fallbackImg:k,imageAttrs:S,lazyAttrs:$}=O(f.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:f?.id?`focus-carousel:${i}:${String(f.id)}`:""}),I=f.text||"";return`
    <div id="focusCarousel" class="${et()} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${c.length>1?`
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${x("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${x("chevron-right","w-4 h-4")}
            </button>
          </div>
        `:""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img data-focus-image src="${s(w)}" data-fallback-src="${s(k)}"${$} class="w-full h-56 object-cover" style="object-position:${de(f)};" ${S} decoding="async" />
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${s(f.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${I?"":"hidden"}">${s(I)}</p>
      </div>
      ${c.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${c.map((y,F)=>`
            <button type="button" data-focus-dot="${F}" class="w-2.5 h-2.5 rounded-full ${F===h?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function An(e,t=220){const n=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${n}`}function It({label:e,url:t,caption:n}){if(!t)return"";const a=An(t,240);return`
    <button type="button" data-copy-url="${s(t)}" data-copy-label="${s(e)}" class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-left active:scale-[0.98] transition-transform">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${s(a)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${s(e)}</p>
        ${n?`<p class="text-[10px] font-bold text-slate-400 mt-1">${s(n)}</p>`:""}
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2">Tippen zum Kopieren</p>
      </div>
    </button>
  `}function zn({profile:e,restaurantId:t,catalogLabel:n}){if(!t||!te(e))return"";if(typeof Ge=="function"){const i=ce?ce(t):null;(!i||i.sameRestaurant!==!0||!i.loading&&!i.loaded&&!i.error)&&Ge(e)}const a=typeof ce=="function"?ce(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},r=(a.tables||[]).map(i=>{const o=Kt("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:i});return It({label:`Tisch ${i}`,url:o,caption:`${n} fuer Tisch ${i}`})}).join("");return`
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
          <input id="tableQrCountInput" type="number" min="0" max="200" step="1" inputmode="numeric" value="${s(String(a.count||0))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button type="button" data-table-qr-save="true" class="h-14 px-6 rounded-[1.6rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-200/60 active:scale-95" ${a.saving?"disabled":""}>
          ${a.saving?"Speichern...":"Tische speichern"}
        </button>
      </div>
      ${a.loading?'<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tisch-QR wird geladen...</p>':""}
      ${a.status?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">${s(a.status)}</p>`:""}
      ${a.error?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(a.error)}</p>`:""}
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
  `}function _n(){const e=l.userProfile,t=e.restaurantId||"",n=String(l.user?.uid||"").trim(),a=String(l.__authBootstrapInFlightUid||"").trim(),r=!t&&!!n&&(!!l.__authProfileLoadPromise||a===n),i=ge(e),o=te(e),d=l.profileView?.profile?.restaurantId?l.profileView.profile:null,c=At()&&!!d?.restaurantId&&te(d),p=nt(Qe(e)),g=t?ue(t):null,h=g?.name||g?.restaurantName||e.name||"Business",f=t&&l.menu.restaurantId===t,w=String(l.menu.source||"").trim().toLowerCase(),k=!!f&&w==="collection",S=!!f&&w==="collection"&&l.menu.loading,$=!!t&&(S||!k),I=k?pt(l.menu.items,{filter:l.menu.filter,query:l.menu.query}):[],y=rt(e)?I:I.filter(j=>!en(j)),F=ve(y),C=M(F.length);return t&&i?(!l.focus.loading&&l.focus.restaurantId!==t&&re(e),bn(e)):(t&&o&&!k&&!S&&Mt(e),t&&o&&!l.focus.loading&&l.focus.restaurantId!==t&&re(e),o?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${p}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(h)}</p>
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

      ${t?Ve(t):""}
      ${t&&k?Ln(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${x("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${s(l.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${mt()}

        ${$?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("menu.loading",`${p} wird geladen...`,{label:p}))}</div>`:kt(F,{mode:"admin"})}
        ${l.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${s(l.menu.error)}</div>`:""}
        ${zn({profile:e,restaurantId:t,catalogLabel:p})}
      `:""}

    </div>
  `:c?we(d):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${x("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${p}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `)}function we(e,{mode:t="profile",allowAutoEnsure:n=!0}={}){const a=l?.profileView?.routePayload&&typeof l.profileView.routePayload=="object"?l.profileView.routePayload:null,r=l?.__webDirectEntry&&typeof l.__webDirectEntry=="object"&&l.__webDirectEntry.active===!0?l.__webDirectEntry:null;let i=ae(l,{profile:e,routePayload:a,webDirectEntry:r});const o=i.restaurantId||Wt(e,a);if(!o)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${s(u("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const d=at(e,o),c=te(d);c&&(i=ae(l,{profile:d,routePayload:a,webDirectEntry:r,restaurantId:o,coordinateFocusWithMenu:!0}));const p=String(r?.canonicalRestaurantId||r?.restaurantId||"").trim(),g=new Set(i.targetIds),h=Vn(i.focus.truthState||""),f=i.menu.status==="ready",w=i.focus.canRenderFocus,k=f&&c,S=i.focus.matches===!0&&i.focus.loading===!0,$=t==="landing",m=String(l?.profileView?.menuAccessSource||r?.menuAccessSource||a?.menuAccessSource||"").trim().toLowerCase()==="qr",y=r?.active===!0&&r?.webPriority===!0&&r?.menuFirst===!0&&String(l?.activeTab||"").trim().toLowerCase()==="profile"&&String(l?.profileTopTab||"").trim().toLowerCase()==="menu"&&(p===o||g.has(o)),F=y&&!m,C=["ready","empty","error"].includes(i.menu.status),j=y&&C,A=y&&(!k||i.menu.status!=="ready"),_=!k||i.focus.settled===!0||h==="knownEmpty"||i.menu.status!=="ready";n&&!j&&!C&&_t(d),n&&!A&&!_&&!S&&f&&(!F||C)&&re(d);const v=i.menu.canRenderItems?ve(pt(i.menu.items,{filter:"all",query:""})).filter(V=>!ze(V)):[],P=v.length>0,T=ee(e),L=nt(Qe(e)),z=i.menu.error||"",$e=!!String(z||"").trim(),Z=i.menu.status==="loading"||i.menu.waitingForFocus===!0,J=v.filter(V=>ne(V)==="drink"),ye=v.filter(V=>ne(V)!=="drink"),q=0,Ue=J.length,se=Re(e),ke=new Set;P&&o&&(Et(v,o),Jt(v,o));const Se=o&&w?(Array.isArray(i.focus.items)?i.focus.items:[]).map(V=>Be({...V,objectPosition:de(V)})).filter(Boolean):[],Ie=Se.length?ht(d,Se,{mode:t}):"";return $&&Z?'<div class="app-content-inline app-main-content-safe" style="min-height: 34vh;"></div>':se?`
      <div class="app-main-content-safe">
        ${Z?`
          ${Ie}
          <div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("menu.loading",`${L} wird geladen...`,{label:L}))}</div>
        `:`
          ${P?Tn(d,v,{mode:t,publicMenuSurfaceState:i}):$e?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(u("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:Ie||`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">${s(u("menu.noProducts","Keine Produkte"))}</div>`}
          ${z?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(z)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5">
      ${St(d,{restaurantId:o,suppressLoading:!0,allowAutoEnsure:f&&(!F||C),requirePublicMenuTruth:!0})}
      ${Z?`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("menu.loading",`${L} wird geladen...`,{label:L}))}</div>
        </div>
      `:`
        ${P?`
          ${T?`
            ${Bt(v,{profile:e})}
          `:`
            ${J.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${s(u("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${$t(J,{mode:t,useTestfirstCardUi:se,seenCategories:ke,priorityOffset:q})}
                </div>
              </section>
            `:""}
            ${ye.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${s(u("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${yt(ye,{mode:t,useTestfirstCardUi:se,seenCategories:ke,priorityOffset:Ue})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${$e?`
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
        ${z?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(z)}</div>`:""}
      `}
    </div>
  `}function Mn(){const e=l.userProfile,t=Lt(e),n=t?l.businessPosts:l.userPosts,a=String(l.user?.uid||e?.uid||"").trim(),r=String(e?.restaurantId||"").trim(),i=String(l.__userPostsLoadingUid||"").trim(),o=String(l.__businessPostsLoadingRestaurantId||"").trim(),d=String(l.__authBootstrapInFlightUid||"").trim(),c=!!a&&i===a,p=!!r&&o===r,g=!!a&&d===a,h=t?p||g&&!n.length:c||g&&!n.length,f=String(e.handle||Ne(e.name||"user")).replace(/^@/,""),k=s(e.bio||"").replace(/\n/g,"<br>")||s(u("profile.noBio","Noch keine Bio.")),S=xe(e),$=S==="menu",I=S==="checkins",m=n,y=R(e.avatar,"avatar"),F=Oe(t),C=Te(e);return`
    <div class="app-main-content-safe">
      ${C==="profile"||C==="menu"?`
      <div class="app-content-inline pb-2 ${t?C==="profile"?"pt-2":"pt-4":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${s(y)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${F} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${x("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${s(M(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${s(M(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${s(f)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${k}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(e.location||"-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${x("plus","w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${x("settings","w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
      </div>

      ${Le(e)}
      ${Ae(e)}

      ${$?`
        ${ge(e)?dt(e):we(e)}
      `:I?`
        ${Pe()}
      `:`
        ${h&&!m.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${l.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${Fe(m,l.profileViewMode)}
          </div>
          ${S==="posts"?`
            <div class="app-content-inline mt-8 mb-4">
              <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  ${x("plus","w-4 h-4")} Neuen Beitrag
                </span>
                <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          `:""}
        `}
      `}
      `:`
        ${C==="cart"?Ke(e):C==="favorites"?qe(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:it,renderProfilePostsFancy:Fe,renderProfileCheckins:Pe,renderProfileTabs:Le,renderProfileViewControls:Ae,renderPublicProfileView:vn,renderMenuFilterRow:mt,renderMenuLayoutSection:Fn,renderMenuItemCard:Me,renderMenuItemCardStacked:Ee,renderMenuDrinkGrid:$t,renderMenuFoodList:yt,renderMenuList:kt,renderFocusAdminSection:Ve,renderFocusCarousel:St,renderMenuQrCard:It,renderMenuAdminView:_n,renderProfileMenuView:we,renderProfileView:Mn}}export{Gn as createProfileMenuFocusRenderController};
