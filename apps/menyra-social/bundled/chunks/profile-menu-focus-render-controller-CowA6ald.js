import{e as se,f as kn,t as Sn,g as In,h as kt,a as Fn}from"../entry/social-app.js";import"./startup-route-runtime-context-Ba2-q0Mg.js";import"./vendor-firebase-V03pMX6J.js";function Ln(f={}){const o=f.state,St=f.resolvePostCountsFn,s=f.escapeHtmlFn,B=f.getOptimizedImageUrlFn,v=f.iconFn,It=f.isLocalBusinessProfileFn,Ft=typeof f.isCeoUserFn=="function"?f.isCeoUserFn:(()=>!1),Ee=f.normalizeHandleFn,Ue=f.logoFitClassFn,A=f.formatCountFn,De=f.renderProfileShopCartViewFn,Ke=f.renderProfileShopFavoritesViewFn,Pt=typeof f.ensurePostsDataForProfileFn=="function"?f.ensurePostsDataForProfileFn:(()=>{}),Ct=f.ensureMenuDataForProfileFn,jt=typeof f.ensureEditorMenuDataForProfileFn=="function"?f.ensureEditorMenuDataForProfileFn:(()=>{}),$e=f.ensureFocusDataForProfileFn,Ne=f.ensureTableQrStateForProfileFn,X=f.isShopCatalogProfileFn,He=f.getBusinessCatalogLabelFn,O=f.normalizeMenuTypeFn,Lt=f.primeMenuItemCountsFn,Mt=typeof f.hydrateMenuCardViewerLikesFn=="function"?f.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),At=f.renderShopProductListFn,zt=f.getMenuLayoutThemeFn,Tt=f.menuLayoutColors,E=f.resolveMenuItemHeroFn,ae=f.isPlaceholderUrlFn,U=f.placeholderImage,_t=f.getFirebaseStorageUrlFn,Rt=f.isDirectImageUrlFn,Oe=f.formatPriceFn,Vt=typeof f.resolveCurrencyCodeForMenuItemFn=="function"?f.resolveCurrencyCodeForMenuItemFn:(()=>""),qe=f.getMenuItemImagesFn,R=f.getMenuItemObjectPositionFn,re=f.getMenuItemSocialIdFn,Ge=f.menuItemMetaKeyFn,We=f.ensureMenuItemMetaFn,Qe=f.resolveMenuItemCountsFn,ie=f.getFocusStateForRestaurantFn,oe=f.getTableQrStateForRestaurantFn,le=f.getFocusItemObjectPositionFn,Ye=f.getFocusCardClassFn,Bt=f.getFocusIndexFn,ee=f.isRestaurantCafeProfileFn,Ze=typeof f.getBusinessProfileTypeFn=="function"?f.getBusinessProfileTypeFn:(()=>""),ce=f.getRestaurantMetaByIdFn,Et=f.buildUrlFn,Ut=f.normalizeSearchKeyFn,Dt=f.normalizeFollowHandleFn,D={key:"",inFlightKey:""},u=(e,t=e,n={})=>Sn(e,{fallback:t,params:n}),Je=(e="")=>{const t=String(e||"").trim();if(!t)return u("nav.menu","Menue");const n=t.toLowerCase();return n==="menue"||n==="menu"||n==="menü"?u("nav.menu",t):n==="shop"?"Shop":t},Kt=(e="food")=>String(e||"").trim().toLowerCase()==="drink"?u("menu.drinks","Getraenke"):u("menu.food","Speisen"),Xe=(e={},t=!1)=>{const n=O(e?.type||"food");return t?n==="drink"?u("menu.variant","Variante"):u("menu.product","Produkt"):n==="drink"?u("menu.drinkItem","Getraenk"):u("menu.foodItem","Speise")};function Nt(e=null,t=null){return se(o,{profile:e,routePayload:t,webDirectEntry:o?.__webDirectEntry}).restaurantId}function et(e=null,t=""){if(!e||typeof e!="object")return e;const n=String(t||"").trim();if(!n)return e;const a=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===n&&a?e:{...e,restaurantId:n,...a?{canonicalRestaurantId:a}:{}}}function Ht(e=""){const t=String(e||"").trim();return t?se(o,{profile:o?.profileView?.profile||o?.userProfile,routePayload:o?.profileView?.routePayload,webDirectEntry:o?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function de(e={}){const t=String(Vt(e)||"").trim();return t?Oe(e?.price,t):Oe(e?.price)}function Ot(e=[],t="",n=""){const a=String(t||"").trim(),i=String(n||"").trim();if(!a||!i)return"";const r=Array.isArray(e)?e:[];if(!r.length)return`${a}|${i}|empty`;const c=[];return r.forEach(d=>{const l=String(re(d)||d?.id||"").trim();l&&c.push(l)}),c.length?(c.sort(),`${a}|${i}|${c.join(",")}`):`${a}|${i}|empty`}function qt(e=[],t=""){const n=String(o.user?.uid||"").trim(),a=Ot(e,t,n);a&&D.inFlightKey!==a&&D.key!==a&&(D.key=a,D.inFlightKey=a,Mt(e,t).catch(i=>{console.error(i),D.key===a&&(D.key="")}).finally(()=>{D.inFlightKey===a&&(D.inFlightKey="")}))}function Gt(e={}){const t=String(e?.uid||"").trim();if(t&&o.followingTargetIds.includes(t))return!0;const n=String(e?.restaurantId||"").trim();if(n&&o.followingTargetIds.includes(n))return!0;const a=Dt(e?.handle||"");return!!(a&&o.followingHandles.includes(a))}function tt(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const n=typeof ce=="function"&&ce(t)||null;return n?.specialEnabled===!0?!0:(n?.specialEnabled===!1,!1)}function Wt(e={}){return N(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function nt(e,t,n=!0,{includeImageKey:a=!0}={}){const i=St(e),r=e.id?String(e.id):"",c=r?`data-open-post="${s(r)}"`:"",d=r?`data-post-like-count="${s(r)}"`:"",l=r?`data-post-comment-count="${s(r)}"`:"",p=a&&r?`data-img-key="profile-post:${s(r)}"`:"",m=e.type==="wide"||e.type==="hero",x=t&&m?"col-span-2":"",h=t&&m?"aspect-[1.8/1]":"aspect-[4/5]",w=B(e.url,m?"large":"medium",{stableKey:r?`profile-post:${r}`:"",variantGroup:"post-detail"}),F=m?800:400,S=m?400:500;return`
    <div ${c} role="button" tabindex="0" class="${x} relative ${h} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${s(w)}" loading="lazy" decoding="async" width="${F}" height="${S}" ${p} class="w-full h-full object-cover" />
        ${e.isVideo?`<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${v("play","w-3 h-3 fill-white")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${v("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${d} class="text-[10px] font-bold tracking-wide">${s(i.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${v("message-circle","w-3 h-3 text-indigo-200")}
                <span ${l} class="text-[10px] font-bold tracking-wide">${s(i.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${r&&n?`
        <button type="button" data-profile-menu-button="${s(r)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${v("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${s(r)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${s(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${v(m?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${m?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${s(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${v("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function ke(e,t,n=!0,{includeImageKeys:a=!0}={}){const i=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${v("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${s(u("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const r=e.map(d=>nt(d,i,n,{includeImageKey:a})),c=e.reduce((d,l)=>{const p=l?.type==="wide"||l?.type==="hero";return d+(p?2:1)},0);return i&&c%2===1&&r.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),r.join("")}function Se(){const e=o.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const n=B(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${s(n)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${s(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${v("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${s(t.city||"Stadt")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${v("arrow-right","w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `:`
      <div class="app-content-inline app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${v("map-pin","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${s(u("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function ue(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}function Ie(e={}){const t=String(Ze(e)||"").trim().toLowerCase();return t==="hotel"||t==="motel"}function Qt(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),n=t?ce(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{}}}function Yt(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const n of t){if(!n||typeof n!="object")continue;const a=Number(n.lat??n.latitude),i=Number(n.lng??n.lon??n.longitude);if(Number.isFinite(a)&&Number.isFinite(i))return{lat:a,lng:i}}return null}function q(e={},t=[]){for(const n of t){const a=String(e?.[n]||"").trim();if(a)return a}return""}function Zt(e={}){const t=[],n=(a="")=>{const i=String(a||"").trim();i&&!t.includes(i)&&t.push(i)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(a=>{Array.isArray(a)&&a.forEach(i=>{typeof i=="string"?n(i):i&&typeof i=="object"&&n(i.label||i.name||i.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&n("Am Strand"),(e.restaurant||e.hasRestaurant)&&n("Restaurant"),(e.breakfast||e.breakfastIncluded)&&n("Fruehstueck"),(e.pool||e.hasPool)&&n("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&n("WLAN"),(e.parking||e.freeParking||e.hasParking)&&n("Parkplatz"),(e.spa||e.wellness)&&n("Wellness"),t.slice(0,8)}function Fe({iconName:e="info",label:t="",value:n="",helper:a=""}={}){return`
    <div class="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm">
      <div class="flex items-start gap-4">
        <div class="w-11 h-11 rounded-[1.25rem] bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          ${v(e,"w-5 h-5")}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">${s(t)}</p>
          <p class="text-sm font-black text-slate-900 leading-snug">${s(n||"Details folgen")}</p>
          ${a?`<p class="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">${s(a)}</p>`:""}
        </div>
      </div>
    </div>
  `}function st(e={}){const t=Qt(e),n=Yt(t),a=q(t,["address","primaryAddress","location","formattedAddress","street"]),i=q(t,["city","locationCity","primaryCity","region","country"]),r=q(t,["beachDistance","distanceToBeach","beachDistanceLabel","strandEntfernung"]),c=q(t,["rating","reviewRating","stars","hotelStars"]),d=q(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),l=Zt(t),p=n?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${n.lat},${n.lng}`)}`:a||i?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a} ${i}`.trim())}`:"";return`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm overflow-hidden">
        <div class="h-40 rounded-[1.6rem] bg-cyan-50 border border-cyan-100 relative overflow-hidden mb-4">
          <div class="absolute inset-0 opacity-80" style="background-image: linear-gradient(135deg, rgba(0,204,229,0.18), rgba(15,23,42,0.04));"></div>
          <div class="absolute inset-0 flex items-center justify-center text-cyan-600">
            ${v("map-pin","w-10 h-10")}
          </div>
          <div class="absolute left-4 right-4 bottom-4 bg-white/90 backdrop-blur rounded-2xl p-3 border border-white/70">
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Standort</p>
            <p class="text-xs font-black text-slate-900 leading-snug">${s(a||i||"Standort folgt")}</p>
          </div>
        </div>
        ${p?`
          <a href="${s(p)}" target="_blank" rel="noopener noreferrer" class="w-full h-12 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            ${v("navigation","w-4 h-4")} Karte oeffnen
          </a>
        `:""}
      </div>

      <div class="grid grid-cols-1 gap-4">
        ${Fe({iconName:"map-pin",label:"Adresse",value:[a,i].filter(Boolean).join(", ")||"Standort folgt",helper:n?`${n.lat.toFixed(5)}, ${n.lng.toFixed(5)}`:""})}
        ${Fe({iconName:"waves",label:"Strand",value:r||(t.beachfront||t.onBeach?"Direkt am Strand":"Details folgen")})}
        ${Fe({iconName:"star",label:"Bewertungen",value:c?`${c}${d?` / ${d} Bewertungen`:""}`:"Bewertungen folgen",helper:q(t,["reviewSummary","ratingSummary","commentsSummary"])})}
      </div>

      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Inbegriffen</p>
        ${l.length?`
          <div class="flex flex-wrap gap-2">
            ${l.map(m=>`<span class="px-3 py-2 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600">${s(m)}</span>`).join("")}
          </div>
        `:`
          <p class="text-sm font-bold text-slate-400">Ausstattung und Zimmerdetails folgen.</p>
        `}
      </div>
    </div>
  `}function pe(e={}){const t=String(o.profileTopTab||"").trim().toLowerCase(),n=String(o.profileContentTab||"").trim().toLowerCase();return ue(e)?t==="menu"?"menu":n==="menu"||n==="posts"?n:"posts":n==="media"||n==="checkins"?n:"posts"}function Pe(e={}){const t=String(o.profileTopTab||"").trim().toLowerCase();return ue(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(o.user?.uid||"").trim()?"favorites":"profile"}function at(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function Jt(e=0,t=1){const n=Math.max(1,Number(t||0)||1),a=Math.round(Number(e||0));if(!Number.isFinite(a))return 0;const i=a%n;return i<0?i+n:i}function Xt(e=0){return at(e)}function en(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],n=at(o.profileLandingStep),a=Jt(o.profileLandingGreetingIndex,t.length),i=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},r=String(i.businessName||e.name||"casarita").trim()||"casarita",c=r.endsWith(".")?r:`${r}.`,d=B(i.logoUrl||e.avatar||"","avatar"),p=String(d||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",m=String(i.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),x=String(i.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),h=n>=2,w=n>=3,F=Array.isArray(o.profileView?.posts)?o.profileView.posts:Array.isArray(e?.posts)?e.posts:[],S=Xt(n),y=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${v("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(I=>{const g=S===I;return`
            <div data-landing-step-dot="${I}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${g?"1.22":"1"}); opacity: ${g?"1":"0.88"}; background: ${g?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${g?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${g?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${n===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${n===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((I,g)=>{const $=g===a,P=g===(a-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${g}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${$?"opacity: 1; transform: translateY(0) scale(1);":P?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!$&&!P?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${s(I)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${s(p)}" alt="${s(`${r} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex items-center" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;color:#111827;">
              ${s(c)}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${s(m)}<br />
            ${s(x)}
          </p>
        </div>
        ${y}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${n<1?"translate-y-full":n===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===1?"1":"0"}; pointer-events: ${n===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${fe(e,F,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${y}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${n<2?"translate-y-full":n===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===2?"1":"0"}; pointer-events: ${n===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${h?fe(e,F,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${y}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${n<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${n===3?"1":"0"}; pointer-events: ${n===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${w?fe(e,F,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function Ce(e=o.profileView?.profile||o.userProfile,{landingPreview:t=!1,selectedTabOverride:n="",compact:a=!1}={}){const i=ue(e),r=String(n||pe(e)).trim().toLowerCase()||"posts",c=Ie(e),d=i?[{id:"posts",label:u("profile.posts","Beitraege")},{id:"menu",label:c?"Details":u("nav.menu","Menue"),surface:c?"hotel-details":"menu"}]:[{id:"posts",label:u("profile.posts","Beitraege")},{id:"media",label:u("profile.media","Medien")},{id:"checkins",label:u("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${a?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${d.map(l=>`
          <button data-profile-tab="${l.id}" ${l.surface?`data-profile-tab-surface="${s(l.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${r===l.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${l.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function je(e=o.profileView?.profile||o.userProfile,{disabled:t=!1}={}){const n=pe(e);return n==="checkins"||n==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${s(u("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${o.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${v("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${o.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${v("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function fe(e={},t=[],{topTabOverride:n="",tutorialMode:a=!1,contentTabOverride:i="",landingHideContent:r=!1,collapseIdentity:c=!1,contentReveal:d=!1,landingMode:l=!1}={}){const p=Gt(e),m=!!e.privateAccount&&e.uid&&String(e.uid)!==String(o.user?.uid||"")&&!p,x=!!e.pendingFollowRequest&&!p,h=e.restaurantId?"Business":u("nav.user","User"),w=String(e.handle||Ee(e.name||"user")).replace(/^@/,""),S=s(e.bio||"").replace(/\n/g,"<br>")||s(u("profile.noBio","Noch keine Bio.")),y=ue(e),I=String(n||Pe(e)).trim().toLowerCase()||"profile",g=String(i||pe(e)).trim().toLowerCase()||"posts",$=g==="menu",P=g==="checkins",k=t,T={...o?.profileView&&typeof o.profileView=="object"?o.profileView:{},profile:e,posts:Array.isArray(k)?k:[]},_=In(o,{profileView:T,profileTopTab:I,profileContentTab:g}),Q=String(_?.header?.status||"").trim().toLowerCase()||"loading",b=String(_?.posts?.status||"").trim().toLowerCase()||"loading",C=String(e?.avatar||"").trim(),j=C?B(C,"avatar"):"",L=Ue(!!e.restaurantId),M=e.uid||e.restaurantId||w||"public",me=l?"":`data-img-key="avatar:public:${s(M)}"`,Y=!!C,Z=Be=>{if(Be==null)return!1;const $t=Number(Be);return Number.isFinite($t)&&$t>=0},xe=Y||Z(e?.followers)||Z(e?.following),H=kt(Q)&&!xe,Ve=!!String(j||"").trim()&&Y,ne=H?"...":A(e.followers),he=H?"...":A(e.following),ve=y?I==="profile"?"pt-2":"pt-4":"pt-10",we=p?u("profile.following","Following"):x?u("profile.requested","Requested"):m?u("profile.request","Request"):u("profile.follow","Follow"),V=p?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":x?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",vn=a?"select-none":"app-main-content-safe",J=a?"pointer-events-none":"",wn=!c,wt=!r,ye=d?l?"transition-opacity duration-200":"animate-in fade-in duration-300":"",yt=g==="posts"&&k.length>0,yn=g!=="posts"||yt||b==="empty"||b==="error",$n=g==="posts"&&!yt&&b==="error";return!a&&(g==="posts"||g==="media")&&e?.restaurantId&&kt(b)&&Pt(e),`
    <div class="${vn}" ${a?'data-landing-tutorial-surface="true"':""}>
      ${I==="profile"||I==="menu"?`
      ${wn?`
        <div class="app-content-inline pb-2 ${ve}">
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${J}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${Ve?`<img src="${s(j)}" decoding="async" width="100" height="100" ${me} class="w-full h-full rounded-[1.8rem] ${L} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${H?"animate-pulse":""}">${v(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${v("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${H?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(ne)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${H?"text-slate-300":"text-slate-900"} leading-none mb-1">${s(he)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e.name||"User")}</h1>
                ${y?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${s(w)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${S}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(e.location||"-")} / ${h}</p>
                ${H?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${s(u("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${s(e.handle)}" data-target-type="${s(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${s(e.restaurantId||e.uid||"")}" data-target-name="${s(e.name||"")}" data-target-avatar="${s(e.avatar||"")}" ${x?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${V} ${x?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${p?v("check","w-4 h-4"):""}
                    ${we}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${s(e.uid||"")}" data-chat-handle="${s(e.handle||"")}" data-chat-name="${s(e.name||"")}" data-chat-avatar="${s(e.avatar||"")}" ${m?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${m?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${v("message-circle","w-5 h-5")}
                </button>
              </div>
            </div>
          </div>
        </div>
      `:""}

      ${m?`
        <div class="app-content-inline pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${v("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${s(u("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${s(u("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${Ce(e,{landingPreview:a,selectedTabOverride:g,compact:c})}
        ${wt?je(e,{disabled:a}):""}

        ${wt?$?`
          <div class="${J} ${ye}">
            ${Ie(e)?st(e):be(e,{mode:l?"landing":"profile",allowAutoEnsure:!l})}
          </div>
        `:P?`
          <div class="${J} ${ye}">
            ${Se()}
          </div>
        `:`
          ${yn?`
            ${$n?`
              <div class="app-content-inline ${J}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${s(u("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${o.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${J} ${ye}">
                ${ke(k,o.profileViewMode,!1,{includeImageKeys:!l})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${J}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${ye}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${I==="cart"?De(e):I==="favorites"?Ke(e):""}
      `}
    </div>
  `}function tn(){const e=o.profileView;if(!e||!e.profile)return"";const t=e.profile,n=e.posts||t.posts||[],a=Pe(t);return a==="landing"?en(t):fe(t,n,{topTabOverride:a,tutorialMode:!1})}function rt(e,{filter:t="all",query:n=""}={}){const a=Array.isArray(e)?e:[],i=Ut(n||"");return a.filter(r=>t==="all"||O(r.type)===t?i?`${r.name||""} ${r.category||""} ${r.description||""}`.toLowerCase().includes(i):!0:!1)}function it(e,t=0){const n=Number(e);return Number.isFinite(n)?Math.max(0,Math.floor(n)):Math.max(0,Number(t)||0)}function ge(e=[]){return(Array.isArray(e)?e.slice():[]).map((n,a)=>({item:n,idx:a,order:it(n?.orderIndex,a)})).sort((n,a)=>n.order-a.order||n.idx-a.idx).map((n,a)=>({...n.item,orderIndex:it(n.item?.orderIndex,a)}))}function Le(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function te(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":O(e?.type||"food")==="drink"?"drink":"food"}function nn(e={}){return String(e?.category||u("menu.other","Sonstiges")).trim()||u("menu.other","Sonstiges")}function sn(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const an=4,rn={thumb:160,small:480,medium:768,large:1280};function ot({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<an&&n===0}function on({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){const a=ot({mode:e,priorityIndex:t,slideIndex:n}),i=e==="profile"?' data-image-reveal="menu"':"";return a?`loading="eager" fetchpriority="high"${i}`:`loading="lazy" fetchpriority="low"${i}`}function ln({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function K(e,{mode:t="profile",priorityIndex:n=-1,slideIndex:a=0,stableKey:i="",preferredSize:r="small",candidateSizes:c=["small","medium","large"],variant:d="grid"}={}){const l=String(e||"").trim(),p=t==="profile"&&i?{stableKey:i}:null,m=ot({mode:t,priorityIndex:n,slideIndex:a}),x=t==="profile"&&!m&&d!=="thumb",h=B(l,r,p),w=ae(h)?U:h,F=_t(l),S=Rt(l)&&l!==w?l:F,y=[],I=new Set;c.forEach(C=>{const j=rn[C]||0;if(!j)return;const L=B(l,C,p);if(!L||ae(L))return;const M=`${L}|${j}`;I.has(M)||(I.add(M),y.push(`${L} ${j}w`))});const g=y.length>1?y.join(", "):"",$=g?ln({variant:d}):"",P=x?"":g,k=x?"":$,z=P?` srcset="${s(P)}"`:"",T=k?` sizes="${s(k)}"`:"",_=on({mode:t,priorityIndex:n,slideIndex:a}),Q=`${_}${z}${T}`,b=x?[`data-menu-lazy-src="${s(w)}"`,`data-menu-lazy-fallback="${s(S||U)}"`,g?`data-menu-lazy-srcset="${s(g)}"`:"",$?`data-menu-lazy-sizes="${s($)}"`:""].filter(Boolean).join(" "):"";return{safeImg:x?U:w,fallbackImg:x?U:S,imageAttrs:Q,lazyAttrs:b?` ${b}`:"",srcsetValue:g,sizesValue:$,loadingAttrs:_}}function G(e=[],t,n=null){const a=n instanceof Set?n:new Set;return e.map((i,r)=>{const c=nn(i),d=sn(c),l=!!d&&!a.has(d);return l&&a.add(d),`<div${l?` data-menu-category-anchor="${s(d)}"`:""} class="h-full">${t(i,r)}</div>`}).join("")}function Me(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function cn(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function lt(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),n=cn(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),a=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&n?{type:"link",url:n,productId:""}:t==="product"&&a?{type:"product",url:"",productId:a}:{type:"self",url:"",productId:""}}function ct(){const e=o.menu.filter||"all";return`
    <div class="flex gap-2 mb-5">
      ${(X(o.userProfile)?[{id:"all",label:u("menu.all","Alle")},{id:"food",label:u("menu.products","Produkte")},{id:"drink",label:u("menu.variants","Varianten")}]:[{id:"all",label:u("menu.all","Alle")},{id:"food",label:u("menu.food","Speisen")},{id:"drink",label:u("menu.drinks","Getraenke")}]).map(a=>`
        <button data-menu-filter="${a.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${e===a.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${a.label}
        </button>
      `).join("")}
    </div>
  `}function dn(){const e=zt().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${Tt.map(t=>{const n=t.id===e,a=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${n?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${n?v("check",`w-4 h-4 ${a}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function Ae(e,{mode:t="profile",priorityIndex:n=-1}={}){const a=E(e),i=t==="profile"?W(e,{index:0}):"",{safeImg:r,fallbackImg:c,imageAttrs:d,lazyAttrs:l}=K(a,{mode:t,priorityIndex:n,stableKey:i,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),p=de(e),m=o.activeTab==="menu"?o.userProfile:o.profileView?.profile||o.userProfile,x=X(m),h=Xe(e,x),w=e.category||"",F=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${s(r)}" data-fallback-src="${s(c)}"${l} class="w-full h-full object-cover" style="object-position:${R(e)};" ${d} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${s(e.name||u("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${s(p)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${w?`<span>${s(w)}</span>`:""}
            <span>${s(h)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${v("more-horizontal","w-4 h-4")}
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
        <img src="${s(r)}" data-fallback-src="${s(c)}"${l} class="w-full h-full object-cover" style="object-position:${R(e)};" ${d} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${s(e.name||u("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${s(p)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${w?`<span>${s(w)}</span>`:""}
          <span>${s(h)}</span>
        </div>
        ${F?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${s(F)}</p>`:""}
      </div>
    </div>
  `}function ze(e,{mode:t="profile",variant:n="food",priorityIndex:a=-1}={}){const i=E(e),r=t==="profile"?W(e,{index:0}):"",c=n==="drink",{safeImg:d,fallbackImg:l,imageAttrs:p,lazyAttrs:m}=K(i,{mode:t,priorityIndex:a,stableKey:r,preferredSize:c?"small":"medium",candidateSizes:c?["small","medium"]:["small","medium","large"],variant:c?"grid":"hero"}),x=de(e),h=o.activeTab==="menu"?o.userProfile:o.profileView?.profile||o.userProfile,w=X(h),F=Xe(e,w),S=e.category||"",y=e.description||"",I=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",g=o.menu.restaurantId||o.profileView?.profile?.restaurantId||o.userProfile.restaurantId||"",$=re(e),P=Ge(g,$),k=P?We(P):{likes:[],comments:[],counts:{likes:0,comments:0}},z=Qe(k),T=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${v("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${s($)}">${s(A(z.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${v("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${s($)}">${s(A(z.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${I} class="w-full ${c?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${c?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        <img src="${s(d)}" data-fallback-src="${s(l)}"${m} class="w-full h-full object-cover" style="object-position:${R(e)};" ${p} decoding="async" />
      </div>
      ${c?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${s(e.name||u("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${s(x)}</p>
          ${T}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${s(e.name||u("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${s(x)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${S?`<span>${s(S)}</span>`:""}
            <span>${s(F)}</span>
          </div>
          ${y?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${s(y)}</p>`:""}
          ${T}
        </div>
      `}
    </div>
  `}function Te(e={}){if(!e?.restaurantId||X(e))return!1;const t=String(Ze(e)||"").trim().toLowerCase();return t==="restaurant"||t==="cafe"||t==="fastfood"}function dt(e){const t=e?.restaurantId||o.menu.restaurantId||o.profileView?.profile?.restaurantId||o.userProfile.restaurantId||"",n=re(e),a=Ge(t,n),i=a?We(a):{likes:[],comments:[],counts:{likes:0,comments:0}},r=String(o.user?.uid||"").trim(),c=String(o.user?.handle||"").trim().toLowerCase(),d=!!i.likes?.some(l=>{const p=String(l?.uid||"").trim();if(r&&p&&p===r)return!0;const m=String(l?.handle||"").trim().toLowerCase();return!!c&&!!m&&m===c});return{itemId:n,meta:i,counts:Qe(i),isLiked:d}}function W(e,{index:t=0}={}){const n=String(e?.restaurantId||o.menu.restaurantId||o.profileView?.profile?.restaurantId||o.userProfile.restaurantId||"").trim(),a=String(e?.id||re(e)||"").trim();if(!n||!a)return"";const i=Number(t),r=Number.isFinite(i)?Math.max(0,Math.floor(i)):0;return`menu-detail:${n}:${a}:${r}`}function un(e){const t=typeof qe=="function"?qe(e):[],n=Array.isArray(t)?t.filter(Boolean):[];if(n.length)return n;const a=E(e);return a?[a]:[]}function N(e){return Fn(e?.cardStyle||"",O(e?.type||"food"))}function _e(e,{menuItemId:t=""}={}){if(!e)return null;const n=String(t||e.menuItemId||e.itemId||e.productId||"").trim();return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:E(e)||e.imageUrl||"",objectPosition:e.objectPosition||R(e),menuItemId:n}}function ut(e,t=[],{mode:n="profile"}={}){const a=e?.restaurantId||"";return!a||!Te(e)||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((i,r)=>{const c=i.imageUrl||"",d=String(i.menuItemId||i.id||"").trim(),{safeImg:l,fallbackImg:p,imageAttrs:m,lazyAttrs:x}=K(c,{mode:n,priorityIndex:r,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:d?`menu-focus:${a}:${d}`:""}),h=String(i.menuItemId||"").trim(),w=n==="profile"&&h?`data-menu-open="${s(h)}" role="button"`:"";return`
            <div ${w} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${w?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${s(l)}" data-fallback-src="${s(p)}"${x} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${i.objectPosition||"50% 50%"};" ${m} decoding="async" />
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${v("sparkles","w-3 h-3 text-amber-500")}
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
  `}function pt(e,{mode:t="profile",priorityIndex:n=-1}={}){const a=E(e),i=t==="profile"?W(e,{index:0}):"",{safeImg:r,fallbackImg:c,imageAttrs:d,lazyAttrs:l}=K(a,{mode:t,priorityIndex:n,stableKey:i,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),p=de(e),m=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",{itemId:x,counts:h,isLiked:w}=dt(e);return`
    <div ${m} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${s(r)}" data-fallback-src="${s(c)}"${l} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${R(e)};" ${d} decoding="async" />
        <button
          type="button"
          data-menu-card-like="${s(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${w?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${w?"true":"false"}"
        >
          ${v("heart","w-3.5 h-3.5 fill-current opacity-80")}
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
            ${v("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${s(x)}">${s(A(h.likes))}</span>
          <span data-menu-comment-count="${s(x)}">${s(A(h.comments))}</span>
        </div>
      </div>
    </div>
  `}function pn(e,t="profile"){if(t!=="profile")return"";const n=lt(e);return n.type==="link"&&n.url?`data-menu-special-link="${s(n.url)}" role="button" tabindex="0"`:n.type==="product"&&n.productId?`data-menu-open="${s(n.productId)}" role="button"`:`data-menu-open="${s(e.id)}" role="button"`}function Re(e,{mode:t="profile",size:n="default",priorityIndex:a=-1}={}){const i=E(e),r=t==="profile"?W(e,{index:0}):"",c=n==="food",{safeImg:d,fallbackImg:l,imageAttrs:p,lazyAttrs:m}=K(i,{mode:t,priorityIndex:a,stableKey:r,preferredSize:c?"medium":"small",candidateSizes:c?["small","medium","large"]:["small","medium"],variant:c?"hero":"grid"}),x=pn(e,t),h=String(e.category||"Special").trim()||"Special",w=s(String(e.name||"Special")).replace(/\n/g,"<br>");return n==="food"?`
      <div ${x} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${s(d)}" data-fallback-src="${s(l)}"${m} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${R(e)};" ${p} decoding="async" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${v("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${s(h)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${x} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${s(d)}" data-fallback-src="${s(l)}"${m} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${R(e)};" ${p} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${v("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${s(h)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
        </div>
      </div>
    </div>
  `}function ft(e,{mode:t="profile",priorityIndex:n=-1}={}){const a=de(e),i=t==="profile"?`data-menu-open="${s(e.id)}" role="button"`:"",r=un(e),d=(r.length?r:[E(e)||""]).filter(Boolean),l=d.length?d.slice(0,12):[""],p=l.length>1,{itemId:m,counts:x,isLiked:h}=dt(e),w=A(Math.max(0,Number(x.likes)||0)),F=A(Math.max(0,Number(x.comments)||0));return`
    <div ${i} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${p?`
          <div
            data-menu-card-gallery-track="${s(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${l.map((S,y)=>{const I=t==="profile"?W(e,{index:y}):"",g=K(S||"",{mode:t,priorityIndex:n,slideIndex:y,stableKey:I,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),$=y>0,P=$?U:g.safeImg,k=$?U:g.fallbackImg,z=$?g.loadingAttrs:g.imageAttrs,T=$?"":g.lazyAttrs||"",_=$?` data-menu-card-deferred-src="${s(g.safeImg)}"
                    data-menu-card-deferred-fallback="${s(g.fallbackImg)}"
                    ${g.srcsetValue?`data-menu-card-deferred-srcset="${s(g.srcsetValue)}"`:""}
                    ${g.sizesValue?`data-menu-card-deferred-sizes="${s(g.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${y}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${s(P)}" data-fallback-src="${s(k)}"${T}${_} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${R(e)};" ${z} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${l.map((S,y)=>{const I=t==="profile"?W(e,{index:y}):"",{safeImg:g,fallbackImg:$,imageAttrs:P,lazyAttrs:k}=K(S||"",{mode:t,priorityIndex:n,slideIndex:y,stableKey:I,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${s(g)}" data-fallback-src="${s($)}"${k} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${R(e)};" ${P} decoding="async" />
              </div>
            `}).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${s(e.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${h?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${h?"true":"false"}"
        >
          ${v("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${p?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${l.map((S,y)=>`
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
              <span data-menu-like-count="${s(m)}">${s(w)}</span>
              <span data-menu-comment-count="${s(m)}">${s(F)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${s(u("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${v("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function fn(e,t,{mode:n="profile",publicMenuSurfaceState:a=null}={}){const i=ge(Array.isArray(t)?t:[]),r=String(e?.restaurantId||"").trim(),c=n==="admin"||Ht(r),d=a?.focus?.canRenderFocus?{items:Array.isArray(a.focus.items)?a.focus.items:[],enabled:!0}:r&&c?ie(r):{items:[],enabled:!1},l=d.enabled?(Array.isArray(d.items)?d.items:[]).map(b=>_e({...b,objectPosition:le(b)})):[],p=i.filter(b=>N(b)==="testfirst_focus"&&!Le(b)).map(b=>_e(b,{menuItemId:b.id||""})).filter(Boolean),m=new Set,x=[...l,...p].filter(b=>{const C=String(b.menuItemId||b.id||`${b.title}|${b.text}|${b.imageUrl}`);return!C||m.has(C)?!1:(m.add(C),!0)}),h=i.filter(b=>!Le(b)),w=h.filter(b=>N(b)!=="testfirst_focus"),F=w.length?w:h,S=w.length?x:[],y=F.filter(b=>te(b)==="drink"),I=F.filter(b=>te(b)!=="drink"),g=(b=[])=>{const C=[],j=[];return b.forEach(L=>{const M=N(L);M==="testfirst_food"||M==="testfirst_special"&&Me(L)==="food"?j.push(L):C.push(L)}),{gridItems:C,foodItems:j}},$=(b,C=-1)=>N(b)==="testfirst_special"?Re(b,{mode:n,priorityIndex:C}):pt(b,{mode:n,priorityIndex:C});let P=0;const k=()=>{const b=P;return P+=1,b},z=new Set,T=(b,C)=>!C.gridItems.length&&!C.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${s(b)}">
        ${C.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${s(b)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${G(C.gridItems,j=>$(j,k()),z)}
            </div>
          </div>
        `:""}
        ${C.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${s(b)}">
            <div class="app-content-inline">
              ${G(C.foodItems,j=>{const L=N(j),M=k();return L==="testfirst_special"?Re(j,{mode:n,size:"food",priorityIndex:M}):ft(j,{mode:n,priorityIndex:M})},z)}
            </div>
          </div>
        `:""}
      </section>
    `,_=g(y),Q=g(I);return`
    <div>
      ${ut(e,S,{mode:n})}
      <div id="menu-section" class="mt-5">
        ${T("drink",_)}
        ${T("food",Q)}
      </div>
    </div>
  `}function gt(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:a=null,priorityOffset:i=0}={}){return e.length?n?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${G(e,(r,c)=>pt(r,{mode:t,priorityIndex:i+c}),a)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${G(e,(r,c)=>ze(r,{mode:t,variant:"drink",priorityIndex:i+c}),a)}
    </div>
  `:""}function bt(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:a=null,priorityOffset:i=0}={}){return e.length?n?`
      <div>
        ${G(e,(r,c)=>N(r)==="testfirst_special"&&Me(r)==="food"?Re(r,{mode:t,size:"food",priorityIndex:i+c}):ft(r,{mode:t,priorityIndex:i+c}),a)}
      </div>
    `:`
    <div class="space-y-4">
      ${G(e,(r,c)=>ze(r,{mode:t,variant:"food",priorityIndex:i+c}),a)}
    </div>
  `:""}function mt(e,{mode:t="profile"}={}){if(t==="admin"){const n=String(o?.menu?.filter||"all").trim().toLowerCase(),a=e.filter(l=>O(l?.type)==="drink"),i=e.filter(l=>O(l?.type)!=="drink"),r=(l,p,{addType:m=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${s(l)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${s(l)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(A(p.length))} Eintraege</p>
          </div>
          ${m?`
            <button type="button" data-menu-add-${s(m)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${v("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${p.length?`<div class="space-y-3">${p.map(x=>Ae(x,{mode:"admin"})).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(u("menu.noProducts","Keine Produkte"))}</div>`}
      </div>
    `,c=[{title:u("menu.drinks","Getraenke"),list:a,addType:"drink"},{title:u("menu.food","Speisen"),list:i,addType:"food"}];if(n==="all")return`
        <div>
          ${c.map(l=>r(l.title,l.list,{addType:l.addType})).join("")}
        </div>
      `;const d=c.filter(l=>l.list.length>0);return d.length?`
      <div>
        ${d.map(l=>r(l.title,l.list,{addType:l.addType})).join("")}
      </div>
    `:n==="drink"?r(u("menu.drinks","Getraenke"),[],{addType:"drink"}):n==="food"?r(u("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((n,a)=>Ae(n,{mode:t,priorityIndex:a})).join("")}
    </div>
  `:`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
        ${s(u("menu.noProducts","Keine Produkte"))}
      </div>
    `}function xt(e){if(!e)return"";const{items:t,enabled:n,loading:a}=ie(e,{includeInactive:!0}),i=A(t.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
          <h3 class="text-xl font-black italic tracking-tighter">Highlights</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(i)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${v("plus","w-4 h-4")}
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
          ${t.map(r=>{const c=B(r.imageUrl||"","thumb"),d=ae(c)?U:c,l=r.active!==!1?"Aktiv":"Inaktiv",p=r.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(d)}" class="w-full h-full object-cover" style="object-position:${le(r)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(r.title||"Sot ne Fokus")}</p>
                  ${r.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${s(r.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${p}">${l}</p>
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
  `}function gn(e){if(!Te(e)||!tt(e))return"";const n=ge((o.menu.items||[]).filter(a=>N(a)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(A(n.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${v("plus","w-4 h-4")}
        </button>
      </div>
      ${n.length?`
        <div class="space-y-3">
          ${n.map(a=>{const i=B(E(a),"thumb"),r=ae(i)?U:i,c=lt(a),d=c.type==="link"?"Link":c.type==="product"?"Produkt-Modal":"Diese Karte",l=Me(a)==="food"?"Food-Size":"Normal",p=Kt(te(a));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${s(r)}" class="w-full h-full object-cover" style="object-position:${R(a)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${s(a.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${s(p)}</span>
                    <span>${s(l)}</span>
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
  `}function ht(e,{restaurantId:t="",suppressLoading:n=!1,allowAutoEnsure:a=!0,requirePublicMenuTruth:i=!0}={}){const r=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!r||!ee(e))return"";const c=se(o,{profile:e,routePayload:o?.profileView?.routePayload,webDirectEntry:o?.__webDirectEntry,restaurantId:r});if(i&&c.menu.status!=="ready")return"";const d=!i||c.focus.canRenderFocus;if(a&&!o.focus.loading&&!d&&$e(et(e,r)),i&&!d)return"";const{items:l,loading:p}=d?{items:Array.isArray(c.focus.items)?c.focus.items:[],loading:c.focus.loading}:ie(r);if(!(d?!0:ie(r).enabled)||!l.length&&!p||n&&p&&!l.length)return"";if(p&&!l.length)return`
      <div class="${Ye()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const x=Bt(l),h=l[x]||l[0],{safeImg:w,fallbackImg:F,imageAttrs:S,lazyAttrs:y}=K(h.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:h?.id?`focus-carousel:${r}:${String(h.id)}`:""}),I=h.text||"";return`
    <div id="focusCarousel" class="${Ye()} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${l.length>1?`
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${v("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${v("chevron-right","w-4 h-4")}
            </button>
          </div>
        `:""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img data-focus-image src="${s(w)}" data-fallback-src="${s(F)}"${y} class="w-full h-56 object-cover" style="object-position:${le(h)};" ${S} decoding="async" />
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${s(h.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${I?"":"hidden"}">${s(I)}</p>
      </div>
      ${l.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${l.map(($,P)=>`
            <button type="button" data-focus-dot="${P}" class="w-2.5 h-2.5 rounded-full ${P===x?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function bn(e,t=220){const n=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${n}`}function vt({label:e,url:t,caption:n}){if(!t)return"";const a=bn(t,240);return`
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
  `}function mn({profile:e,restaurantId:t,catalogLabel:n}){if(!t||!ee(e))return"";if(typeof Ne=="function"){const r=oe?oe(t):null;(!r||r.sameRestaurant!==!0||!r.loading&&!r.loaded&&!r.error)&&Ne(e)}const a=typeof oe=="function"?oe(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},i=(a.tables||[]).map(r=>{const c=Et("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:r});return vt({label:`Tisch ${r}`,url:c,caption:`${n} fuer Tisch ${r}`})}).join("");return`
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
  `}function xn(){const e=o.userProfile,t=e.restaurantId||"",n=String(o.user?.uid||"").trim(),a=String(o.__authBootstrapInFlightUid||"").trim(),i=!t&&!!n&&(!!o.__authProfileLoadPromise||a===n),r=ee(e),c=o.profileView?.profile?.restaurantId?o.profileView.profile:null,d=Ft()&&!!c?.restaurantId&&ee(c),l=Je(He(e)),p=t?ce(t):null,m=p?.name||p?.restaurantName||e.name||"Business",x=t&&o.menu.restaurantId===t,h=String(o.menu.source||"").trim().toLowerCase(),w=!!x&&h==="collection",F=!!x&&h==="collection"&&o.menu.loading,S=!!t&&(F||!w),y=w?rt(o.menu.items,{filter:o.menu.filter,query:o.menu.query}):[],g=tt(e)?y:y.filter(k=>!Wt(k)),$=ge(g),P=A($.length);return t&&r&&!w&&!F&&jt(e),t&&r&&!o.focus.loading&&o.focus.restaurantId!==t&&$e(e),r?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${l}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(m)}</p>
        </div>
      </div>

      ${t?`
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${s(P)}</p>
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

      ${t?xt(t):""}
      ${t&&w?gn(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${v("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${s(o.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${ct()}

        ${S?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("menu.loading",`${l} wird geladen...`,{label:l}))}</div>`:mt($,{mode:"admin"})}
        ${o.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${s(o.menu.error)}</div>`:""}
        ${mn({profile:e,restaurantId:t,catalogLabel:l})}
      `:""}

    </div>
  `:d?be(c):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${v("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${l}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function be(e,{mode:t="profile",allowAutoEnsure:n=!0}={}){const a=o?.profileView?.routePayload&&typeof o.profileView.routePayload=="object"?o.profileView.routePayload:null,i=o?.__webDirectEntry&&typeof o.__webDirectEntry=="object"&&o.__webDirectEntry.active===!0?o.__webDirectEntry:null;let r=se(o,{profile:e,routePayload:a,webDirectEntry:i});const c=r.restaurantId||Nt(e,a);if(!c)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${s(u("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const d=et(e,c),l=ee(d);l&&(r=se(o,{profile:d,routePayload:a,webDirectEntry:i,restaurantId:c,coordinateFocusWithMenu:!0}));const p=String(i?.canonicalRestaurantId||i?.restaurantId||"").trim(),m=new Set(r.targetIds),x=kn(r.focus.truthState||""),h=r.menu.status==="ready",w=r.focus.canRenderFocus,F=h&&l,S=r.focus.matches===!0&&r.focus.loading===!0,y=t==="landing",g=String(o?.profileView?.menuAccessSource||i?.menuAccessSource||a?.menuAccessSource||"").trim().toLowerCase()==="qr",$=i?.active===!0&&i?.webPriority===!0&&i?.menuFirst===!0&&String(o?.activeTab||"").trim().toLowerCase()==="profile"&&String(o?.profileTopTab||"").trim().toLowerCase()==="menu"&&(p===c||m.has(c)),P=$&&!g,k=["ready","empty","error"].includes(r.menu.status),z=$&&k,T=$&&(!F||r.menu.status!=="ready"),_=!F||r.focus.settled===!0||x==="knownEmpty"||r.menu.status!=="ready";n&&!z&&!k&&Ct(d),n&&!T&&!_&&!S&&h&&(!P||k)&&$e(d);const b=r.menu.canRenderItems?ge(rt(r.menu.items,{filter:"all",query:""})).filter(V=>!Le(V)):[],C=b.length>0,j=X(e),L=Je(He(e)),M=r.menu.error||"",me=!!String(M||"").trim(),Y=r.menu.status==="loading"||r.menu.waitingForFocus===!0,Z=b.filter(V=>te(V)==="drink"),xe=b.filter(V=>te(V)!=="drink"),H=0,Ve=Z.length,ne=Te(e),he=new Set;C&&c&&(Lt(b,c),qt(b,c));const ve=c&&w?(Array.isArray(r.focus.items)?r.focus.items:[]).map(V=>_e({...V,objectPosition:le(V)})).filter(Boolean):[],we=ve.length?ut(d,ve,{mode:t}):"";return y&&Y?'<div class="app-content-inline app-main-content-safe" style="min-height: 34vh;"></div>':ne?`
      <div class="app-main-content-safe">
        ${Y?`
          ${we}
          <div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("menu.loading",`${L} wird geladen...`,{label:L}))}</div>
        `:`
          ${C?fn(d,b,{mode:t,publicMenuSurfaceState:r}):me?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(u("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:we||`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">${s(u("menu.noProducts","Keine Produkte"))}</div>`}
          ${M?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(M)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5">
      ${ht(d,{restaurantId:c,suppressLoading:!0,allowAutoEnsure:h&&(!P||k),requirePublicMenuTruth:!0})}
      ${Y?`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("menu.loading",`${L} wird geladen...`,{label:L}))}</div>
        </div>
      `:`
        ${C?`
          ${j?`
            ${At(b,{profile:e})}
          `:`
            ${Z.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${s(u("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${gt(Z,{mode:t,useTestfirstCardUi:ne,seenCategories:he,priorityOffset:H})}
                </div>
              </section>
            `:""}
            ${xe.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${s(u("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${bt(xe,{mode:t,useTestfirstCardUi:ne,seenCategories:he,priorityOffset:Ve})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${me?`
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
        ${M?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(M)}</div>`:""}
      `}
    </div>
  `}function hn(){const e=o.userProfile,t=It(e),n=t?o.businessPosts:o.userPosts,a=String(o.user?.uid||e?.uid||"").trim(),i=String(e?.restaurantId||"").trim(),r=String(o.__userPostsLoadingUid||"").trim(),c=String(o.__businessPostsLoadingRestaurantId||"").trim(),d=String(o.__authBootstrapInFlightUid||"").trim(),l=!!a&&r===a,p=!!i&&c===i,m=!!a&&d===a,x=t?p||m&&!n.length:l||m&&!n.length,h=String(e.handle||Ee(e.name||"user")).replace(/^@/,""),F=s(e.bio||"").replace(/\n/g,"<br>")||s(u("profile.noBio","Noch keine Bio.")),S=pe(e),y=S==="menu",I=S==="checkins",g=n,$=B(e.avatar,"avatar"),P=Ue(t),k=Pe(e);return`
    <div class="app-main-content-safe">
      ${k==="profile"||k==="menu"?`
      <div class="app-content-inline pb-2 ${t?k==="profile"?"pt-2":"pt-4":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${s($)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${P} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${v("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${s(A(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${s(A(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${s(u("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${s(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${s(h)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${F}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${s(e.location||"-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${v("plus","w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${v("settings","w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
      </div>

      ${Ce(e)}
      ${je(e)}

      ${y?`
        ${Ie(e)?st(e):be(e)}
      `:I?`
        ${Se()}
      `:`
        ${x&&!g.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${o.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${ke(g,o.profileViewMode)}
          </div>
          ${S==="posts"?`
            <div class="app-content-inline mt-8 mb-4">
              <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  ${v("plus","w-4 h-4")} Neuen Beitrag
                </span>
                <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          `:""}
        `}
      `}
      `:`
        ${k==="cart"?De(e):k==="favorites"?Ke(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:nt,renderProfilePostsFancy:ke,renderProfileCheckins:Se,renderProfileTabs:Ce,renderProfileViewControls:je,renderPublicProfileView:tn,renderMenuFilterRow:ct,renderMenuLayoutSection:dn,renderMenuItemCard:Ae,renderMenuItemCardStacked:ze,renderMenuDrinkGrid:gt,renderMenuFoodList:bt,renderMenuList:mt,renderFocusAdminSection:xt,renderFocusCarousel:ht,renderMenuQrCard:vt,renderMenuAdminView:xn,renderProfileMenuView:be,renderProfileView:hn}}export{Ln as createProfileMenuFocusRenderController};
