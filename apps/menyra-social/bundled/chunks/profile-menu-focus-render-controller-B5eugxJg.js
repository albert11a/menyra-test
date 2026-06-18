import{e as se,f as Pn,t as jn,g as Tn,h as It,a as Ln}from"../entry/social-app.js";import"./startup-route-runtime-context-Ba2-q0Mg.js";import"./vendor-firebase-V03pMX6J.js";function _n(f={}){const l=f.state,Ft=f.resolvePostCountsFn,s=f.escapeHtmlFn,B=f.getOptimizedImageUrlFn,h=f.iconFn,Ct=f.isLocalBusinessProfileFn,Pt=typeof f.isCeoUserFn=="function"?f.isCeoUserFn:(()=>!1),Ve=f.normalizeHandleFn,Ue=f.logoFitClassFn,M=f.formatCountFn,He=f.renderProfileShopCartViewFn,Ke=f.renderProfileShopFavoritesViewFn,jt=typeof f.ensurePostsDataForProfileFn=="function"?f.ensurePostsDataForProfileFn:(()=>{}),Tt=f.ensureMenuDataForProfileFn,Lt=typeof f.ensureEditorMenuDataForProfileFn=="function"?f.ensureEditorMenuDataForProfileFn:(()=>{}),Se=f.ensureFocusDataForProfileFn,Ne=f.ensureTableQrStateForProfileFn,X=f.isShopCatalogProfileFn,Oe=f.getBusinessCatalogLabelFn,q=f.normalizeMenuTypeFn,At=f.primeMenuItemCountsFn,Mt=typeof f.hydrateMenuCardViewerLikesFn=="function"?f.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),zt=f.renderShopProductListFn,_t=f.getMenuLayoutThemeFn,Bt=f.menuLayoutColors,U=f.resolveMenuItemHeroFn,ae=f.isPlaceholderUrlFn,D=f.placeholderImage,Et=f.getFirebaseStorageUrlFn,Dt=f.isDirectImageUrlFn,qe=f.formatPriceFn,Rt=typeof f.resolveCurrencyCodeForMenuItemFn=="function"?f.resolveCurrencyCodeForMenuItemFn:(()=>""),Ge=f.getMenuItemImagesFn,R=f.getMenuItemObjectPositionFn,re=f.getMenuItemSocialIdFn,We=f.menuItemMetaKeyFn,Qe=f.ensureMenuItemMetaFn,Ye=f.resolveMenuItemCountsFn,ie=f.getFocusStateForRestaurantFn,oe=f.getTableQrStateForRestaurantFn,le=f.getFocusItemObjectPositionFn,Ze=f.getFocusCardClassFn,Vt=f.getFocusIndexFn,ee=f.isRestaurantCafeProfileFn,Je=typeof f.getBusinessProfileTypeFn=="function"?f.getBusinessProfileTypeFn:(()=>""),ce=f.getRestaurantMetaByIdFn,Ut=f.buildUrlFn,Ht=f.normalizeSearchKeyFn,Kt=f.normalizeFollowHandleFn,H={key:"",inFlightKey:""},u=(e,t=e,n={})=>jn(e,{fallback:t,params:n}),Xe=(e="")=>{const t=String(e||"").trim();if(!t)return u("nav.menu","Menue");const n=t.toLowerCase();return n==="menue"||n==="menu"||n==="menü"?u("nav.menu",t):n==="shop"?"Shop":t},Nt=(e="food")=>String(e||"").trim().toLowerCase()==="drink"?u("menu.drinks","Getraenke"):u("menu.food","Speisen"),et=(e={},t=!1)=>{const n=q(e?.type||"food");return t?n==="drink"?u("menu.variant","Variante"):u("menu.product","Produkt"):n==="drink"?u("menu.drinkItem","Getraenk"):u("menu.foodItem","Speise")};function Ot(e=null,t=null){return se(l,{profile:e,routePayload:t,webDirectEntry:l?.__webDirectEntry}).restaurantId}function tt(e=null,t=""){if(!e||typeof e!="object")return e;const n=String(t||"").trim();if(!n)return e;const a=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===n&&a?e:{...e,restaurantId:n,...a?{canonicalRestaurantId:a}:{}}}function qt(e=""){const t=String(e||"").trim();return t?se(l,{profile:l?.profileView?.profile||l?.userProfile,routePayload:l?.profileView?.routePayload,webDirectEntry:l?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function de(e={}){const t=String(Rt(e)||"").trim();return t?qe(e?.price,t):qe(e?.price)}function Gt(e=[],t="",n=""){const a=String(t||"").trim(),i=String(n||"").trim();if(!a||!i)return"";const r=Array.isArray(e)?e:[];if(!r.length)return`${a}|${i}|empty`;const o=[];return r.forEach(d=>{const c=String(re(d)||d?.id||"").trim();c&&o.push(c)}),o.length?(o.sort(),`${a}|${i}|${o.join(",")}`):`${a}|${i}|empty`}function Wt(e=[],t=""){const n=String(l.user?.uid||"").trim(),a=Gt(e,t,n);a&&H.inFlightKey!==a&&H.key!==a&&(H.key=a,H.inFlightKey=a,Mt(e,t).catch(i=>{console.error(i),H.key===a&&(H.key="")}).finally(()=>{H.inFlightKey===a&&(H.inFlightKey="")}))}function Qt(e={}){const t=String(e?.uid||"").trim();if(t&&l.followingTargetIds.includes(t))return!0;const n=String(e?.restaurantId||"").trim();if(n&&l.followingTargetIds.includes(n))return!0;const a=Kt(e?.handle||"");return!!(a&&l.followingHandles.includes(a))}function nt(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const n=typeof ce=="function"&&ce(t)||null;return n?.specialEnabled===!0?!0:(n?.specialEnabled===!1,!1)}function Yt(e={}){return N(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function st(e,t,n=!0,{includeImageKey:a=!0}={}){const i=Ft(e),r=e.id?String(e.id):"",o=r?`data-open-post="${s(r)}"`:"",d=r?`data-post-like-count="${s(r)}"`:"",c=r?`data-post-comment-count="${s(r)}"`:"",p=a&&r?`data-img-key="profile-post:${s(r)}"`:"",g=e.type==="wide"||e.type==="hero",x=t&&g?"col-span-2":"",v=t&&g?"aspect-[1.8/1]":"aspect-[4/5]",w=B(e.url,g?"large":"medium",{stableKey:r?`profile-post:${r}`:"",variantGroup:"post-detail"}),k=g?800:400,S=g?400:500;return`
    <div ${o} role="button" tabindex="0" class="${x} relative ${v} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${s(w)}" loading="lazy" decoding="async" width="${k}" height="${S}" ${p} class="w-full h-full object-cover" />
        ${e.isVideo?`<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${h("play","w-3 h-3 fill-white")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${h("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${d} class="text-[10px] font-bold tracking-wide">${s(i.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${h("message-circle","w-3 h-3 text-indigo-200")}
                <span ${c} class="text-[10px] font-bold tracking-wide">${s(i.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${r&&n?`
        <button type="button" data-profile-menu-button="${s(r)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${h("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${s(r)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${s(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${h(g?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${g?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${s(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${h("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function Ie(e,t,n=!0,{includeImageKeys:a=!0}={}){const i=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${h("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${s(u("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const r=e.map(d=>st(d,i,n,{includeImageKey:a})),o=e.reduce((d,c)=>{const p=c?.type==="wide"||c?.type==="hero";return d+(p?2:1)},0);return i&&o%2===1&&r.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),r.join("")}function Fe(){const e=l.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const n=B(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${s(n)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${s(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${h("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${s(t.city||"Stadt")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${h("arrow-right","w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `:`
      <div class="app-content-inline app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${h("map-pin","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${s(u("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function ue(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}function pe(e={}){const t=String(Je(e)||"").trim().toLowerCase();return t==="hotel"||t==="motel"}function at(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),n=t?ce(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{}}}function Zt(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const n of t){if(!n||typeof n!="object")continue;const a=Number(n.lat??n.latitude),i=Number(n.lng??n.lon??n.longitude);if(Number.isFinite(a)&&Number.isFinite(i))return{lat:a,lng:i}}return null}function z(e={},t=[]){for(const n of t){const a=String(e?.[n]||"").trim();if(a)return a}return""}function Ce(e){if(Array.isArray(e))return e.map(n=>String(n||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(n=>n.trim()).filter(Boolean):[]}function Jt(e={}){const t=[...Ce(e.coverImages),...Ce(e.hotelCoverImages),...Ce(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(a=>String(a||"").trim()).filter(Boolean),n=[];return t.forEach(a=>{n.includes(a)||n.push(a)}),n.slice(0,8)}function Xt(e={}){const t=Array.isArray(e.features)?e.features.map(a=>String(a||"").trim()).filter(Boolean):[],n=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[z(e,["hotelFeatureOneText","gardenTerraceText"])||String(n.gardenTerrace||"").trim()||t[0]||"",z(e,["hotelFeatureTwoText","accessibilityText"])||String(n.accessibility||"").trim()||t[1]||"",z(e,["hotelFeatureThreeText","veganOptionsText"])||String(n.veganOptions||"").trim()||t[2]||""]}function en(e={}){const t=[],n=(a="")=>{const i=String(a||"").trim();i&&!t.includes(i)&&t.push(i)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(a=>{Array.isArray(a)&&a.forEach(i=>{typeof i=="string"?n(i):i&&typeof i=="object"&&n(i.label||i.name||i.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&n("Am Strand"),(e.restaurant||e.hasRestaurant)&&n("Restaurant"),(e.breakfast||e.breakfastIncluded)&&n("Fruehstueck"),(e.pool||e.hasPool)&&n("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&n("WLAN"),(e.parking||e.freeParking||e.hasParking)&&n("Parkplatz"),(e.spa||e.wellness)&&n("Wellness"),t.slice(0,8)}function tn({existingImages:e=[],newPreviews:t=[],imageUrlDraft:n=""}={}){const a=[...t.map((o,d)=>({src:o,kind:"new",idx:d})),...e.map((o,d)=>({src:o,kind:"existing",idx:d}))].filter(o=>o.src),i=a[0]?.src||n||"",r=i?B(i,"large"):D;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${s(r||D)}" class="w-full h-52 object-cover bg-white" />
        <button type="button" id="hotelCardCoverImagesTrigger" aria-label="Titelbilder hochladen" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${h("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${h("plus","w-2.5 h-2.5")}
          </span>
        </button>
      </div>

      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Titelbilder</p>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${a.length}</span>
        </div>
        ${a.length?`
          <div class="grid grid-cols-3 gap-2">
            ${a.map(o=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                ${o.kind==="existing"?`<span data-hotel-card-existing-image="${s(o.src)}" hidden></span>`:""}
                <img src="${s(B(o.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-hotel-card-image-remove="${o.idx}" data-hotel-card-image-source="${o.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${h("x","w-3 h-3")}
                </button>
              </div>
            `).join("")}
          </div>
        `:`
          <div class="h-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">
            Noch keine Titelbilder
          </div>
        `}
      </div>

      <div>
        <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Titelbild URL</label>
        <input id="hotelCardCoverImageUrl" type="text" value="${s(n)}" placeholder="https://..." class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
      </div>
    </div>
  `}function fe({iconName:e="info",label:t="",value:n="",helper:a=""}={}){return`
    <div class="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm">
      <div class="flex items-start gap-4">
        <div class="w-11 h-11 rounded-[1.25rem] bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          ${h(e,"w-5 h-5")}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">${s(t)}</p>
          <p class="text-sm font-black text-slate-900 leading-snug">${s(n||"Details folgen")}</p>
          ${a?`<p class="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">${s(a)}</p>`:""}
        </div>
      </div>
    </div>
  `}function rt(e={}){const t=at(e),n=Zt(t),a=z(t,["address","primaryAddress","location","formattedAddress","street"]),i=z(t,["city","locationCity","primaryCity","region","country"]),r=z(t,["beachDistance","distanceToBeach","beachDistanceLabel","strandEntfernung"]),o=z(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),d=z(t,["rating","reviewRating","stars","hotelStars"]),c=z(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),p=en(t),g=n?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${n.lat},${n.lng}`)}`:a||i?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a} ${i}`.trim())}`:"";return`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm overflow-hidden">
        <div class="h-40 rounded-[1.6rem] bg-cyan-50 border border-cyan-100 relative overflow-hidden mb-4">
          <div class="absolute inset-0 opacity-80" style="background-image: linear-gradient(135deg, rgba(0,204,229,0.18), rgba(15,23,42,0.04));"></div>
          <div class="absolute inset-0 flex items-center justify-center text-cyan-600">
            ${h("map-pin","w-10 h-10")}
          </div>
          <div class="absolute left-4 right-4 bottom-4 bg-white/90 backdrop-blur rounded-2xl p-3 border border-white/70">
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Standort</p>
            <p class="text-xs font-black text-slate-900 leading-snug">${s(a||i||"Standort folgt")}</p>
          </div>
        </div>
        ${g?`
          <a href="${s(g)}" target="_blank" rel="noopener noreferrer" class="w-full h-12 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            ${h("navigation","w-4 h-4")} Karte oeffnen
          </a>
        `:""}
      </div>

      <div class="grid grid-cols-1 gap-4">
        ${fe({iconName:"map-pin",label:"Adresse",value:[a,i].filter(Boolean).join(", ")||"Standort folgt",helper:n?`${n.lat.toFixed(5)}, ${n.lng.toFixed(5)}`:""})}
        ${fe({iconName:"navigation",label:"Zentrum",value:o||"Details folgen"})}
        ${fe({iconName:"waves",label:"Strand",value:r||(t.beachfront||t.onBeach?"Direkt am Strand":"Details folgen")})}
        ${fe({iconName:"star",label:"Bewertungen",value:d?`${d}${c?` / ${c} Bewertungen`:""}`:"Bewertungen folgen",helper:z(t,["reviewSummary","ratingSummary","commentsSummary"])})}
      </div>

      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Inbegriffen</p>
        ${p.length?`
          <div class="flex flex-wrap gap-2">
            ${p.map(x=>`<span class="px-3 py-2 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600">${s(x)}</span>`).join("")}
          </div>
        `:`
          <p class="text-sm font-bold text-slate-400">Ausstattung und Zimmerdetails folgen.</p>
        `}
      </div>
    </div>
  `}function nn(e={}){const t=at(e),n=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),a=t?.name||t?.restaurantName||e?.name||"Hotel",i=String(l.hotelCardEditor?.status||"").trim(),r=l.hotelCardEditor?.saving===!0,o=l.hotelCardEditor&&typeof l.hotelCardEditor=="object"?l.hotelCardEditor:{},d=Array.isArray(o.existingImages)?o.existingImages.map(y=>String(y||"").trim()).filter(Boolean):Jt(t),c=Array.isArray(o.imagePreviews)?o.imagePreviews.map(y=>String(y||"").trim()).filter(Boolean):[],p=String(o.imageUrlDraft||"").trim(),[g,x,v]=Xt(t),w=z(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),k=z(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),S=z(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]);return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel Card</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(a)}</p>
        </div>
      </div>

      ${n?`
        <div data-hotel-card-editor="${s(n)}" class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Titelbilder</p>
            ${tn({existingImages:d,newPreviews:c,imageUrlDraft:p})}
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Entfernung Zentrum</label>
              <input id="hotelCardDistanceCenter" type="text" value="${s(w)}" placeholder="450 m zum Zentrum" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Entfernung Strand / See</label>
              <input id="hotelCardDistanceBeach" type="text" value="${s(k)}" placeholder="150 m zum See / Strand" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Bestpreis p.P.</label>
              <input id="hotelCardStartingPrice" type="text" value="${s(S)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Feature 1</label>
              <input id="hotelCardFeatureOneText" type="text" value="${s(g)}" placeholder="Infinity Pool" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Feature 2</label>
              <input id="hotelCardFeatureTwoText" type="text" value="${s(x)}" placeholder="Wellness & Spa" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Feature 3</label>
              <input id="hotelCardFeatureThreeText" type="text" value="${s(v)}" placeholder="Gourmet Pension" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>

          ${i?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${i.includes("fehl")||i.includes("Bitte")?"text-rose-500":"text-slate-500"}">${s(i)}</div>`:""}

          <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${r?"disabled":""}>
            ${r?"Speichern...":"Hotel Card speichern"}
          </button>
        </div>
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function ge(e={}){const t=String(l.profileTopTab||"").trim().toLowerCase(),n=String(l.profileContentTab||"").trim().toLowerCase();return ue(e)?t==="menu"?"menu":n==="menu"||n==="posts"?n:"posts":n==="media"||n==="checkins"?n:"posts"}function Pe(e={}){const t=String(l.profileTopTab||"").trim().toLowerCase();return ue(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(l.user?.uid||"").trim()?"favorites":"profile"}function it(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function sn(e=0,t=1){const n=Math.max(1,Number(t||0)||1),a=Math.round(Number(e||0));if(!Number.isFinite(a))return 0;const i=a%n;return i<0?i+n:i}function an(e=0){return it(e)}function rn(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],n=it(l.profileLandingStep),a=sn(l.profileLandingGreetingIndex,t.length),i=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},r=String(i.businessName||e.name||"casarita").trim()||"casarita",o=r.endsWith(".")?r:`${r}.`,d=B(i.logoUrl||e.avatar||"","avatar"),p=String(d||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",g=String(i.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),x=String(i.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),v=n>=2,w=n>=3,k=Array.isArray(l.profileView?.posts)?l.profileView.posts:Array.isArray(e?.posts)?e.posts:[],S=an(n),y=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${h("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(I=>{const b=S===I;return`
            <div data-landing-step-dot="${I}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${b?"1.22":"1"}); opacity: ${b?"1":"0.88"}; background: ${b?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${b?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${b?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${n===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${n===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((I,b)=>{const $=b===a,C=b===(a-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${b}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${$?"opacity: 1; transform: translateY(0) scale(1);":C?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!$&&!C?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${s(I)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${s(p)}" alt="${s(`${r} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex items-center" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;color:#111827;">
              ${s(o)}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${s(g)}<br />
            ${s(x)}
          </p>
        </div>
        ${y}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${n<1?"translate-y-full":n===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===1?"1":"0"}; pointer-events: ${n===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${be(e,k,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${y}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${n<2?"translate-y-full":n===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===2?"1":"0"}; pointer-events: ${n===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${v?be(e,k,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${y}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${n<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${n===3?"1":"0"}; pointer-events: ${n===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${w?be(e,k,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function je(e=l.profileView?.profile||l.userProfile,{landingPreview:t=!1,selectedTabOverride:n="",compact:a=!1}={}){const i=ue(e),r=String(n||ge(e)).trim().toLowerCase()||"posts",o=pe(e),d=i?[{id:"posts",label:u("profile.posts","Beitraege")},{id:"menu",label:o?"Details":u("nav.menu","Menue"),surface:o?"hotel-details":"menu"}]:[{id:"posts",label:u("profile.posts","Beitraege")},{id:"media",label:u("profile.media","Medien")},{id:"checkins",label:u("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${a?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${d.map(c=>`
          <button data-profile-tab="${c.id}" ${c.surface?`data-profile-tab-surface="${s(c.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${r===c.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${c.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function Te(e=l.profileView?.profile||l.userProfile,{disabled:t=!1}={}){const n=ge(e);return n==="checkins"||n==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${s(u("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${l.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${h("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${l.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${h("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function be(e={},t=[],{topTabOverride:n="",tutorialMode:a=!1,contentTabOverride:i="",landingHideContent:r=!1,collapseIdentity:o=!1,contentReveal:d=!1,landingMode:c=!1}={}){const p=Qt(e),g=!!e.privateAccount&&e.uid&&String(e.uid)!==String(l.user?.uid||"")&&!p,x=!!e.pendingFollowRequest&&!p,v=e.restaurantId?"Business":u("nav.user","User"),w=String(e.handle||Ve(e.name||"user")).replace(/^@/,""),S=s(e.bio||"").replace(/\n/g,"<br>")||s(u("profile.noBio","Noch keine Bio.")),y=ue(e),I=String(n||Pe(e)).trim().toLowerCase()||"profile",b=String(i||ge(e)).trim().toLowerCase()||"posts",$=b==="menu",C=b==="checkins",F=t,_={...l?.profileView&&typeof l.profileView=="object"?l.profileView:{},profile:e,posts:Array.isArray(F)?F:[]},E=Tn(l,{profileView:_,profileTopTab:I,profileContentTab:b}),Q=String(E?.header?.status||"").trim().toLowerCase()||"loading",m=String(E?.posts?.status||"").trim().toLowerCase()||"loading",P=String(e?.avatar||"").trim(),j=P?B(P,"avatar"):"",T=Ue(!!e.restaurantId),A=e.uid||e.restaurantId||w||"public",he=c?"":`data-img-key="avatar:public:${s(A)}"`,Y=!!P,Z=Re=>{if(Re==null)return!1;const St=Number(Re);return Number.isFinite(St)&&St>=0},ve=Y||Z(e?.followers)||Z(e?.following),O=It(Q)&&!ve,De=!!String(j||"").trim()&&Y,ne=O?"...":M(e.followers),we=O?"...":M(e.following),ye=y?I==="profile"?"pt-2":"pt-4":"pt-10",$e=p?u("profile.following","Following"):x?u("profile.requested","Requested"):g?u("profile.request","Request"):u("profile.follow","Follow"),V=p?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":x?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",Sn=a?"select-none":"app-main-content-safe",J=a?"pointer-events-none":"",In=!o,$t=!r,ke=d?c?"transition-opacity duration-200":"animate-in fade-in duration-300":"",kt=b==="posts"&&F.length>0,Fn=b!=="posts"||kt||m==="empty"||m==="error",Cn=b==="posts"&&!kt&&m==="error";return!a&&(b==="posts"||b==="media")&&e?.restaurantId&&It(m)&&jt(e),`
    <div class="${Sn}" ${a?'data-landing-tutorial-surface="true"':""}>
      ${I==="profile"||I==="menu"?`
      ${In?`
        <div class="app-content-inline pb-2 ${ye}">
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${J}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${De?`<img src="${s(j)}" decoding="async" width="100" height="100" ${he} class="w-full h-full rounded-[1.8rem] ${T} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${O?"animate-pulse":""}">${h(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${h("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${O?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(ne)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${O?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(we)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e.name||"User")}</h1>
                ${y?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${s(w)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${S}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(e.location||"-")} / ${v}</p>
                ${O?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${s(u("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${s(e.handle)}" data-target-type="${s(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${s(e.restaurantId||e.uid||"")}" data-target-name="${s(e.name||"")}" data-target-avatar="${s(e.avatar||"")}" ${x?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${V} ${x?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${p?h("check","w-4 h-4"):""}
                    ${$e}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${s(e.uid||"")}" data-chat-handle="${s(e.handle||"")}" data-chat-name="${s(e.name||"")}" data-chat-avatar="${s(e.avatar||"")}" ${g?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${g?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${h("message-circle","w-5 h-5")}
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
              ${h("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${s(u("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${s(u("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${je(e,{landingPreview:a,selectedTabOverride:b,compact:o})}
        ${$t?Te(e,{disabled:a}):""}

        ${$t?$?`
          <div class="${J} ${ke}">
            ${pe(e)?rt(e):xe(e,{mode:c?"landing":"profile",allowAutoEnsure:!c})}
          </div>
        `:C?`
          <div class="${J} ${ke}">
            ${Fe()}
          </div>
        `:`
          ${Fn?`
            ${Cn?`
              <div class="app-content-inline ${J}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${s(u("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${l.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${J} ${ke}">
                ${Ie(F,l.profileViewMode,!1,{includeImageKeys:!c})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${J}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${ke}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${I==="cart"?He(e):I==="favorites"?Ke(e):""}
      `}
    </div>
  `}function on(){const e=l.profileView;if(!e||!e.profile)return"";const t=e.profile,n=e.posts||t.posts||[],a=Pe(t);return a==="landing"?rn(t):be(t,n,{topTabOverride:a,tutorialMode:!1})}function ot(e,{filter:t="all",query:n=""}={}){const a=Array.isArray(e)?e:[],i=Ht(n||"");return a.filter(r=>t==="all"||q(r.type)===t?i?`${r.name||""} ${r.category||""} ${r.description||""}`.toLowerCase().includes(i):!0:!1)}function lt(e,t=0){const n=Number(e);return Number.isFinite(n)?Math.max(0,Math.floor(n)):Math.max(0,Number(t)||0)}function me(e=[]){return(Array.isArray(e)?e.slice():[]).map((n,a)=>({item:n,idx:a,order:lt(n?.orderIndex,a)})).sort((n,a)=>n.order-a.order||n.idx-a.idx).map((n,a)=>({...n.item,orderIndex:lt(n.item?.orderIndex,a)}))}function Le(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function te(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":q(e?.type||"food")==="drink"?"drink":"food"}function ln(e={}){return String(e?.category||u("menu.other","Sonstiges")).trim()||u("menu.other","Sonstiges")}function cn(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const dn=4,un={thumb:160,small:480,medium:768,large:1280};function ct({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<dn&&n===0}function pn({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){const a=ct({mode:e,priorityIndex:t,slideIndex:n}),i=e==="profile"?' data-image-reveal="menu"':"";return a?`loading="eager" fetchpriority="high"${i}`:`loading="lazy" fetchpriority="low"${i}`}function fn({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function K(e,{mode:t="profile",priorityIndex:n=-1,slideIndex:a=0,stableKey:i="",preferredSize:r="small",candidateSizes:o=["small","medium","large"],variant:d="grid"}={}){const c=String(e||"").trim(),p=t==="profile"&&i?{stableKey:i}:null,g=ct({mode:t,priorityIndex:n,slideIndex:a}),x=t==="profile"&&!g&&d!=="thumb",v=B(c,r,p),w=ae(v)?D:v,k=Et(c),S=Dt(c)&&c!==w?c:k,y=[],I=new Set;o.forEach(P=>{const j=un[P]||0;if(!j)return;const T=B(c,P,p);if(!T||ae(T))return;const A=`${T}|${j}`;I.has(A)||(I.add(A),y.push(`${T} ${j}w`))});const b=y.length>1?y.join(", "):"",$=b?fn({variant:d}):"",C=x?"":b,F=x?"":$,L=C?` srcset="${s(C)}"`:"",_=F?` sizes="${s(F)}"`:"",E=pn({mode:t,priorityIndex:n,slideIndex:a}),Q=`${E}${L}${_}`,m=x?[`data-menu-lazy-src="${s(w)}"`,`data-menu-lazy-fallback="${s(S||D)}"`,b?`data-menu-lazy-srcset="${s(b)}"`:"",$?`data-menu-lazy-sizes="${s($)}"`:""].filter(Boolean).join(" "):"";return{safeImg:x?D:w,fallbackImg:x?D:S,imageAttrs:Q,lazyAttrs:m?` ${m}`:"",srcsetValue:b,sizesValue:$,loadingAttrs:E}}function G(e=[],t,n=null){const a=n instanceof Set?n:new Set;return e.map((i,r)=>{const o=ln(i),d=cn(o),c=!!d&&!a.has(d);return c&&a.add(d),`<div${c?` data-menu-category-anchor="${s(d)}"`:""} class="h-full">${t(i,r)}</div>`}).join("")}function Ae(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function gn(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function dt(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),n=gn(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),a=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&n?{type:"link",url:n,productId:""}:t==="product"&&a?{type:"product",url:"",productId:a}:{type:"self",url:"",productId:""}}function ut(){const e=l.menu.filter||"all";return`
    <div class="flex gap-2 mb-5">
      ${(X(l.userProfile)?[{id:"all",label:u("menu.all","Alle")},{id:"food",label:u("menu.products","Produkte")},{id:"drink",label:u("menu.variants","Varianten")}]:[{id:"all",label:u("menu.all","Alle")},{id:"food",label:u("menu.food","Speisen")},{id:"drink",label:u("menu.drinks","Getraenke")}]).map(a=>`
        <button data-menu-filter="${a.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${e===a.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${a.label}
        </button>
      `).join("")}
    </div>
  `}function bn(){const e=_t().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${Bt.map(t=>{const n=t.id===e,a=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${n?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${n?h("check",`w-4 h-4 ${a}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function Me(e,{mode:t="profile",priorityIndex:n=-1}={}){const a=U(e),i=t==="profile"?W(e,{index:0}):"",{safeImg:r,fallbackImg:o,imageAttrs:d,lazyAttrs:c}=K(a,{mode:t,priorityIndex:n,stableKey:i,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),p=de(e),g=l.activeTab==="menu"?l.userProfile:l.profileView?.profile||l.userProfile,x=X(g),v=et(e,x),w=e.category||"",k=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${s(r)}" data-fallback-src="${s(o)}"${c} class="w-full h-full object-cover" style="object-position:${R(e)};" ${d} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${s(e.name||u("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${s(p)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${w?`<span>${s(w)}</span>`:""}
            <span>${s(v)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${h("more-horizontal","w-4 h-4")}
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
        <img src="${s(r)}" data-fallback-src="${s(o)}"${c} class="w-full h-full object-cover" style="object-position:${R(e)};" ${d} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${s(e.name||u("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${s(p)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${w?`<span>${s(w)}</span>`:""}
          <span>${s(v)}</span>
        </div>
        ${k?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${s(k)}</p>`:""}
      </div>
    </div>
  `}function ze(e,{mode:t="profile",variant:n="food",priorityIndex:a=-1}={}){const i=U(e),r=t==="profile"?W(e,{index:0}):"",o=n==="drink",{safeImg:d,fallbackImg:c,imageAttrs:p,lazyAttrs:g}=K(i,{mode:t,priorityIndex:a,stableKey:r,preferredSize:o?"small":"medium",candidateSizes:o?["small","medium"]:["small","medium","large"],variant:o?"grid":"hero"}),x=de(e),v=l.activeTab==="menu"?l.userProfile:l.profileView?.profile||l.userProfile,w=X(v),k=et(e,w),S=e.category||"",y=e.description||"",I=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",b=l.menu.restaurantId||l.profileView?.profile?.restaurantId||l.userProfile.restaurantId||"",$=re(e),C=We(b,$),F=C?Qe(C):{likes:[],comments:[],counts:{likes:0,comments:0}},L=Ye(F),_=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${h("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${s($)}">${s(M(L.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${h("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${s($)}">${s(M(L.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${I} class="w-full ${o?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${o?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        <img src="${s(d)}" data-fallback-src="${s(c)}"${g} class="w-full h-full object-cover" style="object-position:${R(e)};" ${p} decoding="async" />
      </div>
      ${o?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${s(e.name||u("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${s(x)}</p>
          ${_}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${s(e.name||u("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${s(x)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${S?`<span>${s(S)}</span>`:""}
            <span>${s(k)}</span>
          </div>
          ${y?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${s(y)}</p>`:""}
          ${_}
        </div>
      `}
    </div>
  `}function _e(e={}){if(!e?.restaurantId||X(e))return!1;const t=String(Je(e)||"").trim().toLowerCase();return t==="restaurant"||t==="cafe"||t==="fastfood"}function pt(e){const t=e?.restaurantId||l.menu.restaurantId||l.profileView?.profile?.restaurantId||l.userProfile.restaurantId||"",n=re(e),a=We(t,n),i=a?Qe(a):{likes:[],comments:[],counts:{likes:0,comments:0}},r=String(l.user?.uid||"").trim(),o=String(l.user?.handle||"").trim().toLowerCase(),d=!!i.likes?.some(c=>{const p=String(c?.uid||"").trim();if(r&&p&&p===r)return!0;const g=String(c?.handle||"").trim().toLowerCase();return!!o&&!!g&&g===o});return{itemId:n,meta:i,counts:Ye(i),isLiked:d}}function W(e,{index:t=0}={}){const n=String(e?.restaurantId||l.menu.restaurantId||l.profileView?.profile?.restaurantId||l.userProfile.restaurantId||"").trim(),a=String(e?.id||re(e)||"").trim();if(!n||!a)return"";const i=Number(t),r=Number.isFinite(i)?Math.max(0,Math.floor(i)):0;return`menu-detail:${n}:${a}:${r}`}function mn(e){const t=typeof Ge=="function"?Ge(e):[],n=Array.isArray(t)?t.filter(Boolean):[];if(n.length)return n;const a=U(e);return a?[a]:[]}function N(e){return Ln(e?.cardStyle||"",q(e?.type||"food"))}function Be(e,{menuItemId:t=""}={}){if(!e)return null;const n=String(t||e.menuItemId||e.itemId||e.productId||"").trim();return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:U(e)||e.imageUrl||"",objectPosition:e.objectPosition||R(e),menuItemId:n}}function ft(e,t=[],{mode:n="profile"}={}){const a=e?.restaurantId||"";return!a||!_e(e)||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((i,r)=>{const o=i.imageUrl||"",d=String(i.menuItemId||i.id||"").trim(),{safeImg:c,fallbackImg:p,imageAttrs:g,lazyAttrs:x}=K(o,{mode:n,priorityIndex:r,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:d?`menu-focus:${a}:${d}`:""}),v=String(i.menuItemId||"").trim(),w=n==="profile"&&v?`data-menu-open="${s(v)}" role="button"`:"";return`
            <div ${w} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${w?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${s(c)}" data-fallback-src="${s(p)}"${x} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${i.objectPosition||"50% 50%"};" ${g} decoding="async" />
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${h("sparkles","w-3 h-3 text-amber-500")}
                  <span class="text-[10px] font-black text-slate-900 uppercase tracking-widest pt-[1px]">Tipp</span>
                </div>
              </div>
              <div class="px-2 py-4">
                <h3 class="text-[17px] font-black text-slate-900 leading-tight">${s(i.title||"")}</h3>
                <p class="text-[13px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">${s(i.text||"")}</p>
              </div>
            </div>
          `}).join("")}
      </div>
    </div>
  `}function gt(e,{mode:t="profile",priorityIndex:n=-1}={}){const a=U(e),i=t==="profile"?W(e,{index:0}):"",{safeImg:r,fallbackImg:o,imageAttrs:d,lazyAttrs:c}=K(a,{mode:t,priorityIndex:n,stableKey:i,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),p=de(e),g=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",{itemId:x,counts:v,isLiked:w}=pt(e);return`
    <div ${g} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${s(r)}" data-fallback-src="${s(o)}"${c} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${R(e)};" ${d} decoding="async" />
        <button
          type="button"
          data-menu-card-like="${s(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${w?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${w?"true":"false"}"
        >
          ${h("heart","w-3.5 h-3.5 fill-current opacity-80")}
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
            ${h("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${s(x)}">${s(M(v.likes))}</span>
          <span data-menu-comment-count="${s(x)}">${s(M(v.comments))}</span>
        </div>
      </div>
    </div>
  `}function xn(e,t="profile"){if(t!=="profile")return"";const n=dt(e);return n.type==="link"&&n.url?`data-menu-special-link="${s(n.url)}" role="button" tabindex="0"`:n.type==="product"&&n.productId?`data-menu-open="${s(n.productId)}" role="button"`:`data-menu-open="${s(e.id)}" role="button"`}function Ee(e,{mode:t="profile",size:n="default",priorityIndex:a=-1}={}){const i=U(e),r=t==="profile"?W(e,{index:0}):"",o=n==="food",{safeImg:d,fallbackImg:c,imageAttrs:p,lazyAttrs:g}=K(i,{mode:t,priorityIndex:a,stableKey:r,preferredSize:o?"medium":"small",candidateSizes:o?["small","medium","large"]:["small","medium"],variant:o?"hero":"grid"}),x=xn(e,t),v=String(e.category||"Special").trim()||"Special",w=s(String(e.name||"Special")).replace(/\n/g,"<br>");return n==="food"?`
      <div ${x} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${s(d)}" data-fallback-src="${s(c)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${R(e)};" ${p} decoding="async" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${h("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${s(v)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${x} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${s(d)}" data-fallback-src="${s(c)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${R(e)};" ${p} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${h("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${s(v)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
        </div>
      </div>
    </div>
  `}function bt(e,{mode:t="profile",priorityIndex:n=-1}={}){const a=de(e),i=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",r=mn(e),d=(r.length?r:[U(e)||""]).filter(Boolean),c=d.length?d.slice(0,12):[""],p=c.length>1,{itemId:g,counts:x,isLiked:v}=pt(e),w=M(Math.max(0,Number(x.likes)||0)),k=M(Math.max(0,Number(x.comments)||0));return`
    <div ${i} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${p?`
          <div
            data-menu-card-gallery-track="${s(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${c.map((S,y)=>{const I=t==="profile"?W(e,{index:y}):"",b=K(S||"",{mode:t,priorityIndex:n,slideIndex:y,stableKey:I,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),$=y>0,C=$?D:b.safeImg,F=$?D:b.fallbackImg,L=$?b.loadingAttrs:b.imageAttrs,_=$?"":b.lazyAttrs||"",E=$?` data-menu-card-deferred-src="${s(b.safeImg)}"
                    data-menu-card-deferred-fallback="${s(b.fallbackImg)}"
                    ${b.srcsetValue?`data-menu-card-deferred-srcset="${s(b.srcsetValue)}"`:""}
                    ${b.sizesValue?`data-menu-card-deferred-sizes="${s(b.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${y}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${s(C)}" data-fallback-src="${s(F)}"${_}${E} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${R(e)};" ${L} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${c.map((S,y)=>{const I=t==="profile"?W(e,{index:y}):"",{safeImg:b,fallbackImg:$,imageAttrs:C,lazyAttrs:F}=K(S||"",{mode:t,priorityIndex:n,slideIndex:y,stableKey:I,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${s(b)}" data-fallback-src="${s($)}"${F} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${R(e)};" ${C} decoding="async" />
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
          ${h("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${p?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${c.map((S,y)=>`
              <div
                data-menu-card-gallery-dot="${s(e.id)}"
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
              ${h("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function hn(e,t,{mode:n="profile",publicMenuSurfaceState:a=null}={}){const i=me(Array.isArray(t)?t:[]),r=String(e?.restaurantId||"").trim(),o=n==="admin"||qt(r),d=a?.focus?.canRenderFocus?{items:Array.isArray(a.focus.items)?a.focus.items:[],enabled:!0}:r&&o?ie(r):{items:[],enabled:!1},c=d.enabled?(Array.isArray(d.items)?d.items:[]).map(m=>Be({...m,objectPosition:le(m)})):[],p=i.filter(m=>N(m)==="testfirst_focus"&&!Le(m)).map(m=>Be(m,{menuItemId:m.id||""})).filter(Boolean),g=new Set,x=[...c,...p].filter(m=>{const P=String(m.menuItemId||m.id||`${m.title}|${m.text}|${m.imageUrl}`);return!P||g.has(P)?!1:(g.add(P),!0)}),v=i.filter(m=>!Le(m)),w=v.filter(m=>N(m)!=="testfirst_focus"),k=w.length?w:v,S=w.length?x:[],y=k.filter(m=>te(m)==="drink"),I=k.filter(m=>te(m)!=="drink"),b=(m=[])=>{const P=[],j=[];return m.forEach(T=>{const A=N(T);A==="testfirst_food"||A==="testfirst_special"&&Ae(T)==="food"?j.push(T):P.push(T)}),{gridItems:P,foodItems:j}},$=(m,P=-1)=>N(m)==="testfirst_special"?Ee(m,{mode:n,priorityIndex:P}):gt(m,{mode:n,priorityIndex:P});let C=0;const F=()=>{const m=C;return C+=1,m},L=new Set,_=(m,P)=>!P.gridItems.length&&!P.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${s(m)}">
        ${P.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${s(m)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${G(P.gridItems,j=>$(j,F()),L)}
            </div>
          </div>
        `:""}
        ${P.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${s(m)}">
            <div class="app-content-inline">
              ${G(P.foodItems,j=>{const T=N(j),A=F();return T==="testfirst_special"?Ee(j,{mode:n,size:"food",priorityIndex:A}):bt(j,{mode:n,priorityIndex:A})},L)}
            </div>
          </div>
        `:""}
      </section>
    `,E=b(y),Q=b(I);return`
    <div>
      ${ft(e,S,{mode:n})}
      <div id="menu-section" class="mt-5">
        ${_("drink",E)}
        ${_("food",Q)}
      </div>
    </div>
  `}function mt(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:a=null,priorityOffset:i=0}={}){return e.length?n?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${G(e,(r,o)=>gt(r,{mode:t,priorityIndex:i+o}),a)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${G(e,(r,o)=>ze(r,{mode:t,variant:"drink",priorityIndex:i+o}),a)}
    </div>
  `:""}function xt(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:a=null,priorityOffset:i=0}={}){return e.length?n?`
      <div>
        ${G(e,(r,o)=>N(r)==="testfirst_special"&&Ae(r)==="food"?Ee(r,{mode:t,size:"food",priorityIndex:i+o}):bt(r,{mode:t,priorityIndex:i+o}),a)}
      </div>
    `:`
    <div class="space-y-4">
      ${G(e,(r,o)=>ze(r,{mode:t,variant:"food",priorityIndex:i+o}),a)}
    </div>
  `:""}function ht(e,{mode:t="profile"}={}){if(t==="admin"){const n=String(l?.menu?.filter||"all").trim().toLowerCase(),a=e.filter(c=>q(c?.type)==="drink"),i=e.filter(c=>q(c?.type)!=="drink"),r=(c,p,{addType:g=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${s(c)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${s(c)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(M(p.length))} Eintraege</p>
          </div>
          ${g?`
            <button type="button" data-menu-add-${s(g)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${h("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${p.length?`<div class="space-y-3">${p.map(x=>Me(x,{mode:"admin"})).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(u("menu.noProducts","Keine Produkte"))}</div>`}
      </div>
    `,o=[{title:u("menu.drinks","Getraenke"),list:a,addType:"drink"},{title:u("menu.food","Speisen"),list:i,addType:"food"}];if(n==="all")return`
        <div>
          ${o.map(c=>r(c.title,c.list,{addType:c.addType})).join("")}
        </div>
      `;const d=o.filter(c=>c.list.length>0);return d.length?`
      <div>
        ${d.map(c=>r(c.title,c.list,{addType:c.addType})).join("")}
      </div>
    `:n==="drink"?r(u("menu.drinks","Getraenke"),[],{addType:"drink"}):n==="food"?r(u("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((n,a)=>Me(n,{mode:t,priorityIndex:a})).join("")}
    </div>
  `:`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
        ${s(u("menu.noProducts","Keine Produkte"))}
      </div>
    `}function vt(e){if(!e)return"";const{items:t,enabled:n,loading:a}=ie(e,{includeInactive:!0}),i=M(t.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
          <h3 class="text-xl font-black italic tracking-tighter">Highlights</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(i)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${h("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">Im Fokus anzeigen</p>
          <p class="text-[10px] font-bold text-slate-400">Im Profil sichtbar</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${n?"checked":""} />
      </label>

      ${a?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("focus.loading","Fokus wird geladen..."))}</div>
      `:t.length?`
        <div class="space-y-3">
          ${t.map(r=>{const o=B(r.imageUrl||"","thumb"),d=ae(o)?D:o,c=r.active!==!1?"Aktiv":"Inaktiv",p=r.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(d)}" class="w-full h-full object-cover" style="object-position:${le(r)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(r.title||"Sot ne Fokus")}</p>
                  ${r.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(r.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${p}">${c}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${s(r.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${s(r.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Fokus-Eintraege</div>
      `}
    </div>
  `}function vn(e){if(!_e(e)||!nt(e))return"";const n=me((l.menu.items||[]).filter(a=>N(a)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(M(n.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${h("plus","w-4 h-4")}
        </button>
      </div>
      ${n.length?`
        <div class="space-y-3">
          ${n.map(a=>{const i=B(U(a),"thumb"),r=ae(i)?D:i,o=dt(a),d=o.type==="link"?"Link":o.type==="product"?"Produkt-Modal":"Diese Karte",c=Ae(a)==="food"?"Food-Size":"Normal",p=Nt(te(a));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(r)}" class="w-full h-full object-cover" style="object-position:${R(a)};" loading="lazy" decoding="async" />
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
  `}function wt(e,{restaurantId:t="",suppressLoading:n=!1,allowAutoEnsure:a=!0,requirePublicMenuTruth:i=!0}={}){const r=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!r||!ee(e))return"";const o=se(l,{profile:e,routePayload:l?.profileView?.routePayload,webDirectEntry:l?.__webDirectEntry,restaurantId:r});if(i&&o.menu.status!=="ready")return"";const d=!i||o.focus.canRenderFocus;if(a&&!l.focus.loading&&!d&&Se(tt(e,r)),i&&!d)return"";const{items:c,loading:p}=d?{items:Array.isArray(o.focus.items)?o.focus.items:[],loading:o.focus.loading}:ie(r);if(!(d?!0:ie(r).enabled)||!c.length&&!p||n&&p&&!c.length)return"";if(p&&!c.length)return`
      <div class="${Ze()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const x=Vt(c),v=c[x]||c[0],{safeImg:w,fallbackImg:k,imageAttrs:S,lazyAttrs:y}=K(v.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:v?.id?`focus-carousel:${r}:${String(v.id)}`:""}),I=v.text||"";return`
    <div id="focusCarousel" class="${Ze()} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${c.length>1?`
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${h("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${h("chevron-right","w-4 h-4")}
            </button>
          </div>
        `:""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img data-focus-image src="${s(w)}" data-fallback-src="${s(k)}"${y} class="w-full h-56 object-cover" style="object-position:${le(v)};" ${S} decoding="async" />
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${s(v.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${I?"":"hidden"}">${s(I)}</p>
      </div>
      ${c.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${c.map(($,C)=>`
            <button type="button" data-focus-dot="${C}" class="w-2.5 h-2.5 rounded-full ${C===x?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function wn(e,t=220){const n=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${n}`}function yt({label:e,url:t,caption:n}){if(!t)return"";const a=wn(t,240);return`
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
  `}function yn({profile:e,restaurantId:t,catalogLabel:n}){if(!t||!ee(e))return"";if(typeof Ne=="function"){const r=oe?oe(t):null;(!r||r.sameRestaurant!==!0||!r.loading&&!r.loaded&&!r.error)&&Ne(e)}const a=typeof oe=="function"?oe(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},i=(a.tables||[]).map(r=>{const o=Ut("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:r});return yt({label:`Tisch ${r}`,url:o,caption:`${n} fuer Tisch ${r}`})}).join("");return`
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
  `}function $n(){const e=l.userProfile,t=e.restaurantId||"",n=String(l.user?.uid||"").trim(),a=String(l.__authBootstrapInFlightUid||"").trim(),i=!t&&!!n&&(!!l.__authProfileLoadPromise||a===n),r=pe(e),o=ee(e),d=l.profileView?.profile?.restaurantId?l.profileView.profile:null,c=Pt()&&!!d?.restaurantId&&ee(d),p=Xe(Oe(e)),g=t?ce(t):null,x=g?.name||g?.restaurantName||e.name||"Business",v=t&&l.menu.restaurantId===t,w=String(l.menu.source||"").trim().toLowerCase(),k=!!v&&w==="collection",S=!!v&&w==="collection"&&l.menu.loading,y=!!t&&(S||!k),I=k?ot(l.menu.items,{filter:l.menu.filter,query:l.menu.query}):[],$=nt(e)?I:I.filter(L=>!Yt(L)),C=me($),F=M(C.length);return t&&r?nn(e):(t&&o&&!k&&!S&&Lt(e),t&&o&&!l.focus.loading&&l.focus.restaurantId!==t&&Se(e),o?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${p}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(x)}</p>
        </div>
      </div>

      ${t?`
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${s(F)}</p>
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

      ${t?vt(t):""}
      ${t&&k?vn(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${h("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${s(l.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${ut()}

        ${y?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("menu.loading",`${p} wird geladen...`,{label:p}))}</div>`:ht(C,{mode:"admin"})}
        ${l.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${s(l.menu.error)}</div>`:""}
        ${yn({profile:e,restaurantId:t,catalogLabel:p})}
      `:""}

    </div>
  `:c?xe(d):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${h("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${p}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `)}function xe(e,{mode:t="profile",allowAutoEnsure:n=!0}={}){const a=l?.profileView?.routePayload&&typeof l.profileView.routePayload=="object"?l.profileView.routePayload:null,i=l?.__webDirectEntry&&typeof l.__webDirectEntry=="object"&&l.__webDirectEntry.active===!0?l.__webDirectEntry:null;let r=se(l,{profile:e,routePayload:a,webDirectEntry:i});const o=r.restaurantId||Ot(e,a);if(!o)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${s(u("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const d=tt(e,o),c=ee(d);c&&(r=se(l,{profile:d,routePayload:a,webDirectEntry:i,restaurantId:o,coordinateFocusWithMenu:!0}));const p=String(i?.canonicalRestaurantId||i?.restaurantId||"").trim(),g=new Set(r.targetIds),x=Pn(r.focus.truthState||""),v=r.menu.status==="ready",w=r.focus.canRenderFocus,k=v&&c,S=r.focus.matches===!0&&r.focus.loading===!0,y=t==="landing",b=String(l?.profileView?.menuAccessSource||i?.menuAccessSource||a?.menuAccessSource||"").trim().toLowerCase()==="qr",$=i?.active===!0&&i?.webPriority===!0&&i?.menuFirst===!0&&String(l?.activeTab||"").trim().toLowerCase()==="profile"&&String(l?.profileTopTab||"").trim().toLowerCase()==="menu"&&(p===o||g.has(o)),C=$&&!b,F=["ready","empty","error"].includes(r.menu.status),L=$&&F,_=$&&(!k||r.menu.status!=="ready"),E=!k||r.focus.settled===!0||x==="knownEmpty"||r.menu.status!=="ready";n&&!L&&!F&&Tt(d),n&&!_&&!E&&!S&&v&&(!C||F)&&Se(d);const m=r.menu.canRenderItems?me(ot(r.menu.items,{filter:"all",query:""})).filter(V=>!Le(V)):[],P=m.length>0,j=X(e),T=Xe(Oe(e)),A=r.menu.error||"",he=!!String(A||"").trim(),Y=r.menu.status==="loading"||r.menu.waitingForFocus===!0,Z=m.filter(V=>te(V)==="drink"),ve=m.filter(V=>te(V)!=="drink"),O=0,De=Z.length,ne=_e(e),we=new Set;P&&o&&(At(m,o),Wt(m,o));const ye=o&&w?(Array.isArray(r.focus.items)?r.focus.items:[]).map(V=>Be({...V,objectPosition:le(V)})).filter(Boolean):[],$e=ye.length?ft(d,ye,{mode:t}):"";return y&&Y?'<div class="app-content-inline app-main-content-safe" style="min-height: 34vh;"></div>':ne?`
      <div class="app-main-content-safe">
        ${Y?`
          ${$e}
          <div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("menu.loading",`${T} wird geladen...`,{label:T}))}</div>
        `:`
          ${P?hn(d,m,{mode:t,publicMenuSurfaceState:r}):he?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(u("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:$e||`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">${s(u("menu.noProducts","Keine Produkte"))}</div>`}
          ${A?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(A)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5">
      ${wt(d,{restaurantId:o,suppressLoading:!0,allowAutoEnsure:v&&(!C||F),requirePublicMenuTruth:!0})}
      ${Y?`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("menu.loading",`${T} wird geladen...`,{label:T}))}</div>
        </div>
      `:`
        ${P?`
          ${j?`
            ${zt(m,{profile:e})}
          `:`
            ${Z.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${s(u("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${mt(Z,{mode:t,useTestfirstCardUi:ne,seenCategories:we,priorityOffset:O})}
                </div>
              </section>
            `:""}
            ${ve.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${s(u("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${xt(ve,{mode:t,useTestfirstCardUi:ne,seenCategories:we,priorityOffset:De})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${he?`
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
        ${A?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(A)}</div>`:""}
      `}
    </div>
  `}function kn(){const e=l.userProfile,t=Ct(e),n=t?l.businessPosts:l.userPosts,a=String(l.user?.uid||e?.uid||"").trim(),i=String(e?.restaurantId||"").trim(),r=String(l.__userPostsLoadingUid||"").trim(),o=String(l.__businessPostsLoadingRestaurantId||"").trim(),d=String(l.__authBootstrapInFlightUid||"").trim(),c=!!a&&r===a,p=!!i&&o===i,g=!!a&&d===a,x=t?p||g&&!n.length:c||g&&!n.length,v=String(e.handle||Ve(e.name||"user")).replace(/^@/,""),k=s(e.bio||"").replace(/\n/g,"<br>")||s(u("profile.noBio","Noch keine Bio.")),S=ge(e),y=S==="menu",I=S==="checkins",b=n,$=B(e.avatar,"avatar"),C=Ue(t),F=Pe(e);return`
    <div class="app-main-content-safe">
      ${F==="profile"||F==="menu"?`
      <div class="app-content-inline pb-2 ${t?F==="profile"?"pt-2":"pt-4":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${s($)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${C} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${h("badge-check","w-4 h-4 fill-blue-500 text-white")}
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
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${s(v)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${k}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(e.location||"-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${h("plus","w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${h("settings","w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
      </div>

      ${je(e)}
      ${Te(e)}

      ${y?`
        ${pe(e)?rt(e):xe(e)}
      `:I?`
        ${Fe()}
      `:`
        ${x&&!b.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${l.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${Ie(b,l.profileViewMode)}
          </div>
          ${S==="posts"?`
            <div class="app-content-inline mt-8 mb-4">
              <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  ${h("plus","w-4 h-4")} Neuen Beitrag
                </span>
                <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          `:""}
        `}
      `}
      `:`
        ${F==="cart"?He(e):F==="favorites"?Ke(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:st,renderProfilePostsFancy:Ie,renderProfileCheckins:Fe,renderProfileTabs:je,renderProfileViewControls:Te,renderPublicProfileView:on,renderMenuFilterRow:ut,renderMenuLayoutSection:bn,renderMenuItemCard:Me,renderMenuItemCardStacked:ze,renderMenuDrinkGrid:mt,renderMenuFoodList:xt,renderMenuList:ht,renderFocusAdminSection:vt,renderFocusCarousel:wt,renderMenuQrCard:yt,renderMenuAdminView:$n,renderProfileMenuView:xe,renderProfileView:kn}}export{_n as createProfileMenuFocusRenderController};
