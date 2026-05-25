import{c as te,e as pn,f as fn,g as bt,a as gn}from"../entry/social-app.js";import"./preload-helper-C4N3jzC6.js";import"./vendor-firebase-rekF-BVt.js";function hn(u={}){const o=u.state,mt=u.resolvePostCountsFn,n=u.escapeHtmlFn,R=u.getOptimizedImageUrlFn,v=u.iconFn,xt=u.isLocalBusinessProfileFn,ht=typeof u.isCeoUserFn=="function"?u.isCeoUserFn:(()=>!1),_e=u.normalizeHandleFn,Ve=u.logoFitClassFn,z=u.formatCountFn,Re=u.renderProfileShopCartViewFn,Ee=u.renderProfileShopFavoritesViewFn,vt=typeof u.ensurePostsDataForProfileFn=="function"?u.ensurePostsDataForProfileFn:(()=>{}),wt=u.ensureMenuDataForProfileFn,yt=typeof u.ensureEditorMenuDataForProfileFn=="function"?u.ensureEditorMenuDataForProfileFn:(()=>{}),ve=u.ensureFocusDataForProfileFn,Ue=u.ensureTableQrStateForProfileFn,Z=u.isShopCatalogProfileFn,Be=u.getBusinessCatalogLabelFn,E=u.normalizeMenuTypeFn,$t=u.primeMenuItemCountsFn,kt=typeof u.hydrateMenuCardViewerLikesFn=="function"?u.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),It=u.renderShopProductListFn,St=u.getMenuLayoutThemeFn,Ft=u.menuLayoutColors,U=u.resolveMenuItemHeroFn,ne=u.isPlaceholderUrlFn,B=u.placeholderImage,Pt=u.getFirebaseStorageUrlFn,Ct=u.isDirectImageUrlFn,De=u.formatPriceFn,jt=typeof u.resolveCurrencyCodeForMenuItemFn=="function"?u.resolveCurrencyCodeForMenuItemFn:(()=>""),Ke=u.getMenuItemImagesFn,_=u.getMenuItemObjectPositionFn,se=u.getMenuItemSocialIdFn,Ne=u.menuItemMetaKeyFn,Oe=u.ensureMenuItemMetaFn,He=u.resolveMenuItemCountsFn,re=u.getFocusStateForRestaurantFn,ae=u.getTableQrStateForRestaurantFn,ie=u.getFocusItemObjectPositionFn,qe=u.getFocusCardClassFn,Mt=u.getFocusIndexFn,J=u.isRestaurantCafeProfileFn,zt=typeof u.getBusinessProfileTypeFn=="function"?u.getBusinessProfileTypeFn:(()=>""),we=u.getRestaurantMetaByIdFn,At=u.buildUrlFn,Lt=u.normalizeSearchKeyFn,Tt=u.normalizeFollowHandleFn,D={key:"",inFlightKey:""};function _t(e=null,t=null){return te(o,{profile:e,routePayload:t,webDirectEntry:o?.__webDirectEntry}).restaurantId}function Ge(e=null,t=""){if(!e||typeof e!="object")return e;const s=String(t||"").trim();if(!s)return e;const r=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===s&&r?e:{...e,restaurantId:s,...r?{canonicalRestaurantId:r}:{}}}function Vt(e=""){const t=String(e||"").trim();return t?te(o,{profile:o?.profileView?.profile||o?.userProfile,routePayload:o?.profileView?.routePayload,webDirectEntry:o?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function oe(e={}){const t=String(jt(e)||"").trim();return t?De(e?.price,t):De(e?.price)}function Rt(e=[],t="",s=""){const r=String(t||"").trim(),i=String(s||"").trim();if(!r||!i)return"";const a=Array.isArray(e)?e:[];if(!a.length)return`${r}|${i}|empty`;const c=[];return a.forEach(d=>{const l=String(se(d)||d?.id||"").trim();l&&c.push(l)}),c.length?(c.sort(),`${r}|${i}|${c.join(",")}`):`${r}|${i}|empty`}function Et(e=[],t=""){const s=String(o.user?.uid||"").trim(),r=Rt(e,t,s);r&&D.inFlightKey!==r&&D.key!==r&&(D.key=r,D.inFlightKey=r,kt(e,t).catch(i=>{console.error(i),D.key===r&&(D.key="")}).finally(()=>{D.inFlightKey===r&&(D.inFlightKey="")}))}function Ut(e={}){const t=String(e?.uid||"").trim();if(t&&o.followingTargetIds.includes(t))return!0;const s=String(e?.restaurantId||"").trim();if(s&&o.followingTargetIds.includes(s))return!0;const r=Tt(e?.handle||"");return!!(r&&o.followingHandles.includes(r))}function Qe(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const s=typeof we=="function"&&we(t)||null;return s?.specialEnabled===!0?!0:(s?.specialEnabled===!1,!1)}function Bt(e={}){return N(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function We(e,t,s=!0,{includeImageKey:r=!0}={}){const i=mt(e),a=e.id?String(e.id):"",c=a?`data-open-post="${n(a)}"`:"",d=a?`data-post-like-count="${n(a)}"`:"",l=a?`data-post-comment-count="${n(a)}"`:"",p=r&&a?`data-img-key="profile-post:${n(a)}"`:"",b=e.type==="wide"||e.type==="hero",x=t&&b?"col-span-2":"",m=t&&b?"aspect-[1.8/1]":"aspect-[4/5]",h=R(e.url,b?"large":"medium",{stableKey:a?`profile-post:${a}`:"",variantGroup:"post-detail"}),S=b?800:400,k=b?400:500;return`
    <div ${c} role="button" tabindex="0" class="${x} relative ${m} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${n(h)}" loading="lazy" decoding="async" width="${S}" height="${k}" ${p} class="w-full h-full object-cover" />
        ${e.isVideo?`<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${v("play","w-3 h-3 fill-white")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${v("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${d} class="text-[10px] font-bold tracking-wide">${n(i.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${v("message-circle","w-3 h-3 text-indigo-200")}
                <span ${l} class="text-[10px] font-bold tracking-wide">${n(i.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${a&&s?`
        <button type="button" data-profile-menu-button="${n(a)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${v("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${n(a)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${n(a)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${v(b?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${b?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${n(a)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${v("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function ye(e,t,s=!0,{includeImageKeys:r=!0}={}){const i=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${v("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">Keine Inhalte gefunden</p>
      </div>
    `;const a=e.map(d=>We(d,i,s,{includeImageKey:r})),c=e.reduce((d,l)=>{const p=l?.type==="wide"||l?.type==="hero";return d+(p?2:1)},0);return i&&c%2===1&&a.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),a.join("")}function $e(){const e=o.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const s=R(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${n(s)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${n(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${v("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${n(t.city||"Stadt")}
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
        <p class="text-slate-400 text-sm font-bold tracking-wide">Keine Check-ins gefunden</p>
      </div>
    `}function le(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}function ce(e={}){const t=String(o.profileTopTab||"").trim().toLowerCase(),s=String(o.profileContentTab||"").trim().toLowerCase();return le(e)?t==="menu"?"menu":s==="menu"||s==="posts"?s:"posts":s==="media"||s==="checkins"?s:"posts"}function ke(e={}){const t=String(o.profileTopTab||"").trim().toLowerCase();return le(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(o.user?.uid||"").trim()?"favorites":"profile"}function Ye(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function Dt(e=0,t=1){const s=Math.max(1,Number(t||0)||1),r=Math.round(Number(e||0));if(!Number.isFinite(r))return 0;const i=r%s;return i<0?i+s:i}function Kt(e=0){return Ye(e)}function Nt(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],s=Ye(o.profileLandingStep),r=Dt(o.profileLandingGreetingIndex,t.length),i=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},a=String(i.businessName||e.name||"casarita").trim()||"casarita",c=a.endsWith(".")?a:`${a}.`,d=R(i.logoUrl||e.avatar||"","avatar"),p=String(d||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",b=String(i.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),x=String(i.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),m=s>=2,h=s>=3,S=Array.isArray(o.profileView?.posts)?o.profileView.posts:Array.isArray(e?.posts)?e.posts:[],k=Kt(s),w=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${v("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(I=>{const f=k===I;return`
            <div data-landing-step-dot="${I}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${f?"1.22":"1"}); opacity: ${f?"1":"0.88"}; background: ${f?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${f?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${f?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${s===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${s===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((I,f)=>{const y=f===r,F=f===(r-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${f}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${y?"opacity: 1; transform: translateY(0) scale(1);":F?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!y&&!F?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${n(I)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${n(p)}" alt="${n(`${a} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex items-center" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;color:#111827;">
              ${n(c)}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${n(b)}<br />
            ${n(x)}
          </p>
        </div>
        ${w}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${s<1?"translate-y-full":s===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${s===1?"1":"0"}; pointer-events: ${s===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${de(e,S,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${w}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${s<2?"translate-y-full":s===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${s===2?"1":"0"}; pointer-events: ${s===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${m?de(e,S,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${w}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${s<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${s===3?"1":"0"}; pointer-events: ${s===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${h?de(e,S,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function Ie(e=o.profileView?.profile||o.userProfile,{landingPreview:t=!1,selectedTabOverride:s="",compact:r=!1}={}){const i=le(e),a=String(s||ce(e)).trim().toLowerCase()||"posts";return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${r?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${(i?[{id:"posts",label:"Beitraege"},{id:"menu",label:"Menue"}]:[{id:"posts",label:"Beitraege"},{id:"media",label:"Medien"},{id:"checkins",label:"Check-ins"}]).map(d=>`
          <button data-profile-tab="${d.id}" class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${a===d.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${d.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function Se(e=o.profileView?.profile||o.userProfile,{disabled:t=!1}={}){const s=ce(e);return s==="checkins"||s==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Ansicht</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${o.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${v("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${o.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${v("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function de(e={},t=[],{topTabOverride:s="",tutorialMode:r=!1,contentTabOverride:i="",landingHideContent:a=!1,collapseIdentity:c=!1,contentReveal:d=!1,landingMode:l=!1}={}){const p=Ut(e),b=!!e.privateAccount&&e.uid&&String(e.uid)!==String(o.user?.uid||"")&&!p,x=!!e.pendingFollowRequest&&!p,m=e.restaurantId?"Business":"User",h=String(e.handle||_e(e.name||"user")).replace(/^@/,""),k=n(e.bio||"").replace(/\n/g,"<br>")||"Noch keine Bio.",w=le(e),I=String(s||ke(e)).trim().toLowerCase()||"profile",f=String(i||ce(e)).trim().toLowerCase()||"posts",y=f==="menu",F=f==="checkins",$=t,L={...o?.profileView&&typeof o.profileView=="object"?o.profileView:{},profile:e,posts:Array.isArray($)?$:[]},T=fn(o,{profileView:L,profileTopTab:I,profileContentTab:f}),G=String(T?.header?.status||"").trim().toLowerCase()||"loading",g=String(T?.posts?.status||"").trim().toLowerCase()||"loading",P=String(e?.avatar||"").trim(),C=P?R(P,"avatar"):"",j=Ve(!!e.restaurantId),M=e.uid||e.restaurantId||h||"public",fe=l?"":`data-img-key="avatar:public:${n(M)}"`,Q=!!P,W=Te=>{if(Te==null)return!1;const gt=Number(Te);return Number.isFinite(gt)&&gt>=0},ge=Q||W(e?.followers)||W(e?.following),O=bt(G)&&!ge,Le=!!String(C||"").trim()&&Q,ee=O?"...":z(e.followers),be=O?"...":z(e.following),me=w?I==="profile"?"pt-2":"pt-4":"pt-10",xe=p?"Following":x?"Requested":b?"Request":"Follow",V=p?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":x?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",ln=r?"select-none":"app-main-content-safe",Y=r?"pointer-events-none":"",cn=!c,pt=!a,he=d?l?"transition-opacity duration-200":"animate-in fade-in duration-300":"",ft=f==="posts"&&$.length>0,dn=f!=="posts"||ft||g==="empty"||g==="error",un=f==="posts"&&!ft&&g==="error";return!r&&(f==="posts"||f==="media")&&e?.restaurantId&&bt(g)&&vt(e),`
    <div class="${ln}" ${r?'data-landing-tutorial-surface="true"':""}>
      ${I==="profile"||I==="menu"?`
      ${cn?`
        <div class="app-content-inline pb-2 ${me}">
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${Y}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${Le?`<img src="${n(C)}" decoding="async" width="100" height="100" ${fe} class="w-full h-full rounded-[1.8rem] ${j} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${O?"animate-pulse":""}">${v(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${v("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${O?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(ee)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Fans</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${O?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(be)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Folgt</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e.name||"User")}</h1>
                ${w?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${n(h)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${k}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(e.location||"-")} / ${m}</p>
                ${O?'<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">Profilkopf wird geladen...</p>':""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${n(e.handle)}" data-target-type="${n(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${n(e.restaurantId||e.uid||"")}" data-target-name="${n(e.name||"")}" data-target-avatar="${n(e.avatar||"")}" ${x?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${V} ${x?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${p?v("check","w-4 h-4"):""}
                    ${xe}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${n(e.uid||"")}" data-chat-handle="${n(e.handle||"")}" data-chat-name="${n(e.name||"")}" data-chat-avatar="${n(e.avatar||"")}" ${b?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${b?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${v("message-circle","w-5 h-5")}
                </button>
              </div>
            </div>
          </div>
        </div>
      `:""}

      ${b?`
        <div class="app-content-inline pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${v("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Privates Profil</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">Folgen muss zuerst akzeptiert werden</p>
          </div>
        </div>
      `:`
        ${Ie(e,{landingPreview:r,selectedTabOverride:f,compact:c})}
        ${pt?Se(e,{disabled:r}):""}

        ${pt?y?`
          <div class="${Y} ${he}">
            ${pe(e,{mode:l?"landing":"profile",allowAutoEnsure:!l})}
          </div>
        `:F?`
          <div class="${Y} ${he}">
            ${$e()}
          </div>
        `:`
          ${dn?`
            ${un?`
              <div class="app-content-inline ${Y}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">Inhalte konnten nicht geladen werden</p>
                </div>
              </div>
            `:`
              <div class="${o.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${Y} ${he}">
                ${ye($,o.profileViewMode,!1,{includeImageKeys:!l})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${Y}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${he}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">Beitraege werden geladen...</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${I==="cart"?Re(e):I==="favorites"?Ee(e):""}
      `}
    </div>
  `}function Ot(){const e=o.profileView;if(!e||!e.profile)return"";const t=e.profile,s=e.posts||t.posts||[],r=ke(t);return r==="landing"?Nt(t):de(t,s,{topTabOverride:r,tutorialMode:!1})}function Ze(e,{filter:t="all",query:s=""}={}){const r=Array.isArray(e)?e:[],i=Lt(s||"");return r.filter(a=>t==="all"||E(a.type)===t?i?`${a.name||""} ${a.category||""} ${a.description||""}`.toLowerCase().includes(i):!0:!1)}function Je(e,t=0){const s=Number(e);return Number.isFinite(s)?Math.max(0,Math.floor(s)):Math.max(0,Number(t)||0)}function ue(e=[]){return(Array.isArray(e)?e.slice():[]).map((s,r)=>({item:s,idx:r,order:Je(s?.orderIndex,r)})).sort((s,r)=>s.order-r.order||s.idx-r.idx).map((s,r)=>({...s.item,orderIndex:Je(s.item?.orderIndex,r)}))}function Fe(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function X(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":E(e?.type||"food")==="drink"?"drink":"food"}function Ht(e={}){return String(e?.category||"Sonstiges").trim()||"Sonstiges"}function qt(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const Gt=4,Qt={thumb:160,small:480,medium:768,large:1280};function Xe({mode:e="profile",priorityIndex:t=-1,slideIndex:s=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<Gt&&s===0}function Wt({mode:e="profile",priorityIndex:t=-1,slideIndex:s=0}={}){const r=Xe({mode:e,priorityIndex:t,slideIndex:s}),i=e==="profile"?' data-image-reveal="menu"':"";return r?`loading="eager" fetchpriority="high"${i}`:`loading="lazy" fetchpriority="low"${i}`}function Yt({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function K(e,{mode:t="profile",priorityIndex:s=-1,slideIndex:r=0,stableKey:i="",preferredSize:a="small",candidateSizes:c=["small","medium","large"],variant:d="grid"}={}){const l=String(e||"").trim(),p=t==="profile"&&i?{stableKey:i}:null,b=Xe({mode:t,priorityIndex:s,slideIndex:r}),x=t==="profile"&&!b&&d!=="thumb",m=R(l,a,p),h=ne(m)?B:m,S=Pt(l),k=Ct(l)&&l!==h?l:S,w=[],I=new Set;c.forEach(P=>{const C=Qt[P]||0;if(!C)return;const j=R(l,P,p);if(!j||ne(j))return;const M=`${j}|${C}`;I.has(M)||(I.add(M),w.push(`${j} ${C}w`))});const f=w.length>1?w.join(", "):"",y=f?Yt({variant:d}):"",F=x?"":f,$=x?"":y,A=F?` srcset="${n(F)}"`:"",L=$?` sizes="${n($)}"`:"",T=Wt({mode:t,priorityIndex:s,slideIndex:r}),G=`${T}${A}${L}`,g=x?[`data-menu-lazy-src="${n(h)}"`,`data-menu-lazy-fallback="${n(k||B)}"`,f?`data-menu-lazy-srcset="${n(f)}"`:"",y?`data-menu-lazy-sizes="${n(y)}"`:""].filter(Boolean).join(" "):"";return{safeImg:x?B:h,fallbackImg:x?B:k,imageAttrs:G,lazyAttrs:g?` ${g}`:"",srcsetValue:f,sizesValue:y,loadingAttrs:T}}function H(e=[],t,s=null){const r=s instanceof Set?s:new Set;return e.map((i,a)=>{const c=Ht(i),d=qt(c),l=!!d&&!r.has(d);return l&&r.add(d),`<div${l?` data-menu-category-anchor="${n(d)}"`:""} class="h-full">${t(i,a)}</div>`}).join("")}function Pe(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function Zt(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function et(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),s=Zt(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),r=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&s?{type:"link",url:s,productId:""}:t==="product"&&r?{type:"product",url:"",productId:r}:{type:"self",url:"",productId:""}}function tt(){const e=o.menu.filter||"all";return`
    <div class="flex gap-2 mb-5">
      ${(Z(o.userProfile)?[{id:"all",label:"Alle"},{id:"food",label:"Produkte"},{id:"drink",label:"Varianten"}]:[{id:"all",label:"Alle"},{id:"food",label:"Speisen"},{id:"drink",label:"Getraenke"}]).map(r=>`
        <button data-menu-filter="${r.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${e===r.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${r.label}
        </button>
      `).join("")}
    </div>
  `}function Jt(){const e=St().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${Ft.map(t=>{const s=t.id===e,r=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${s?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${s?v("check",`w-4 h-4 ${r}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function Ce(e,{mode:t="profile",priorityIndex:s=-1}={}){const r=U(e),i=t==="profile"?q(e,{index:0}):"",{safeImg:a,fallbackImg:c,imageAttrs:d,lazyAttrs:l}=K(r,{mode:t,priorityIndex:s,stableKey:i,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),p=oe(e),b=o.activeTab==="menu"?o.userProfile:o.profileView?.profile||o.userProfile,m=Z(b)?E(e.type)==="drink"?"Variante":"Produkt":E(e.type)==="drink"?"Getraenk":"Speise",h=e.category||"",S=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${n(a)}" data-fallback-src="${n(c)}"${l} class="w-full h-full object-cover" style="object-position:${_(e)};" ${d} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${n(e.name||"Produkt")}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${n(p)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${h?`<span>${n(h)}</span>`:""}
            <span>${n(m)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${v("more-horizontal","w-4 h-4")}
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
        <img src="${n(a)}" data-fallback-src="${n(c)}"${l} class="w-full h-full object-cover" style="object-position:${_(e)};" ${d} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${n(e.name||"Produkt")}</p>
          <span class="text-xs font-black text-slate-900">${n(p)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${h?`<span>${n(h)}</span>`:""}
          <span>${n(m)}</span>
        </div>
        ${S?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${n(S)}</p>`:""}
      </div>
    </div>
  `}function je(e,{mode:t="profile",variant:s="food",priorityIndex:r=-1}={}){const i=U(e),a=t==="profile"?q(e,{index:0}):"",c=s==="drink",{safeImg:d,fallbackImg:l,imageAttrs:p,lazyAttrs:b}=K(i,{mode:t,priorityIndex:r,stableKey:a,preferredSize:c?"small":"medium",candidateSizes:c?["small","medium"]:["small","medium","large"],variant:c?"grid":"hero"}),x=oe(e),m=o.activeTab==="menu"?o.userProfile:o.profileView?.profile||o.userProfile,S=Z(m)?E(e.type)==="drink"?"Variante":"Produkt":E(e.type)==="drink"?"Getraenk":"Speise",k=e.category||"",w=e.description||"",I=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",f=o.menu.restaurantId||o.profileView?.profile?.restaurantId||o.userProfile.restaurantId||"",y=se(e),F=Ne(f,y),$=F?Oe(F):{likes:[],comments:[],counts:{likes:0,comments:0}},A=He($),L=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${v("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${n(y)}">${n(z(A.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${v("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${n(y)}">${n(z(A.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${I} class="w-full ${c?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${c?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        <img src="${n(d)}" data-fallback-src="${n(l)}"${b} class="w-full h-full object-cover" style="object-position:${_(e)};" ${p} decoding="async" />
      </div>
      ${c?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${n(e.name||"Produkt")}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${n(x)}</p>
          ${L}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${n(e.name||"Produkt")}</p>
            <span class="text-xs font-black text-slate-900">${n(x)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${k?`<span>${n(k)}</span>`:""}
            <span>${n(S)}</span>
          </div>
          ${w?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${n(w)}</p>`:""}
          ${L}
        </div>
      `}
    </div>
  `}function Me(e={}){if(!e?.restaurantId||Z(e))return!1;const t=String(zt(e)||"").trim().toLowerCase();return t==="restaurant"||t==="cafe"||t==="fastfood"}function nt(e){const t=e?.restaurantId||o.menu.restaurantId||o.profileView?.profile?.restaurantId||o.userProfile.restaurantId||"",s=se(e),r=Ne(t,s),i=r?Oe(r):{likes:[],comments:[],counts:{likes:0,comments:0}},a=String(o.user?.uid||"").trim(),c=String(o.user?.handle||"").trim().toLowerCase(),d=!!i.likes?.some(l=>{const p=String(l?.uid||"").trim();if(a&&p&&p===a)return!0;const b=String(l?.handle||"").trim().toLowerCase();return!!c&&!!b&&b===c});return{itemId:s,meta:i,counts:He(i),isLiked:d}}function q(e,{index:t=0}={}){const s=String(e?.restaurantId||o.menu.restaurantId||o.profileView?.profile?.restaurantId||o.userProfile.restaurantId||"").trim(),r=String(e?.id||se(e)||"").trim();if(!s||!r)return"";const i=Number(t),a=Number.isFinite(i)?Math.max(0,Math.floor(i)):0;return`menu-detail:${s}:${r}:${a}`}function Xt(e){const t=typeof Ke=="function"?Ke(e):[],s=Array.isArray(t)?t.filter(Boolean):[];if(s.length)return s;const r=U(e);return r?[r]:[]}function N(e){return gn(e?.cardStyle||"",E(e?.type||"food"))}function ze(e,{menuItemId:t=""}={}){if(!e)return null;const s=String(t||e.menuItemId||e.itemId||e.productId||"").trim();return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:U(e)||e.imageUrl||"",objectPosition:e.objectPosition||_(e),menuItemId:s}}function st(e,t=[],{mode:s="profile"}={}){const r=e?.restaurantId||"";return!r||!Me(e)||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((i,a)=>{const c=i.imageUrl||"",d=String(i.menuItemId||i.id||"").trim(),{safeImg:l,fallbackImg:p,imageAttrs:b,lazyAttrs:x}=K(c,{mode:s,priorityIndex:a,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:d?`menu-focus:${r}:${d}`:""}),m=String(i.menuItemId||"").trim(),h=s==="profile"&&m?`data-menu-open="${n(m)}" role="button"`:"";return`
            <div ${h} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${h?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${n(l)}" data-fallback-src="${n(p)}"${x} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${i.objectPosition||"50% 50%"};" ${b} decoding="async" />
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${v("sparkles","w-3 h-3 text-amber-500")}
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
  `}function rt(e,{mode:t="profile",priorityIndex:s=-1}={}){const r=U(e),i=t==="profile"?q(e,{index:0}):"",{safeImg:a,fallbackImg:c,imageAttrs:d,lazyAttrs:l}=K(r,{mode:t,priorityIndex:s,stableKey:i,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),p=oe(e),b=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",{itemId:x,counts:m,isLiked:h}=nt(e);return`
    <div ${b} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${n(a)}" data-fallback-src="${n(c)}"${l} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${_(e)};" ${d} decoding="async" />
        <button
          type="button"
          data-menu-card-like="${n(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${h?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${h?"true":"false"}"
        >
          ${v("heart","w-3.5 h-3.5 fill-current opacity-80")}
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
            ${v("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${n(x)}">${n(z(m.likes))}</span>
          <span data-menu-comment-count="${n(x)}">${n(z(m.comments))}</span>
        </div>
      </div>
    </div>
  `}function en(e,t="profile"){if(t!=="profile")return"";const s=et(e);return s.type==="link"&&s.url?`data-menu-special-link="${n(s.url)}" role="button" tabindex="0"`:s.type==="product"&&s.productId?`data-menu-open="${n(s.productId)}" role="button"`:`data-menu-open="${n(e.id)}" role="button"`}function Ae(e,{mode:t="profile",size:s="default",priorityIndex:r=-1}={}){const i=U(e),a=t==="profile"?q(e,{index:0}):"",c=s==="food",{safeImg:d,fallbackImg:l,imageAttrs:p,lazyAttrs:b}=K(i,{mode:t,priorityIndex:r,stableKey:a,preferredSize:c?"medium":"small",candidateSizes:c?["small","medium","large"]:["small","medium"],variant:c?"hero":"grid"}),x=en(e,t),m=String(e.category||"Special").trim()||"Special",h=n(String(e.name||"Special")).replace(/\n/g,"<br>");return s==="food"?`
      <div ${x} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${n(d)}" data-fallback-src="${n(l)}"${b} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${_(e)};" ${p} decoding="async" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${v("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${n(m)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${h}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${x} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${n(d)}" data-fallback-src="${n(l)}"${b} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${_(e)};" ${p} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${v("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${n(m)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${h}</h4>
        </div>
      </div>
    </div>
  `}function at(e,{mode:t="profile",priorityIndex:s=-1}={}){const r=oe(e),i=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",a=Xt(e),d=(a.length?a:[U(e)||""]).filter(Boolean),l=d.length?d.slice(0,12):[""],p=l.length>1,{itemId:b,counts:x,isLiked:m}=nt(e),h=z(Math.max(0,Number(x.likes)||0)),S=z(Math.max(0,Number(x.comments)||0));return`
    <div ${i} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${p?`
          <div
            data-menu-card-gallery-track="${n(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${l.map((k,w)=>{const I=t==="profile"?q(e,{index:w}):"",f=K(k||"",{mode:t,priorityIndex:s,slideIndex:w,stableKey:I,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),y=w>0,F=y?B:f.safeImg,$=y?B:f.fallbackImg,A=y?f.loadingAttrs:f.imageAttrs,L=y?"":f.lazyAttrs||"",T=y?` data-menu-card-deferred-src="${n(f.safeImg)}"
                    data-menu-card-deferred-fallback="${n(f.fallbackImg)}"
                    ${f.srcsetValue?`data-menu-card-deferred-srcset="${n(f.srcsetValue)}"`:""}
                    ${f.sizesValue?`data-menu-card-deferred-sizes="${n(f.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${w}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${n(F)}" data-fallback-src="${n($)}"${L}${T} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${_(e)};" ${A} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${l.map((k,w)=>{const I=t==="profile"?q(e,{index:w}):"",{safeImg:f,fallbackImg:y,imageAttrs:F,lazyAttrs:$}=K(k||"",{mode:t,priorityIndex:s,slideIndex:w,stableKey:I,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${n(f)}" data-fallback-src="${n(y)}"${$} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${_(e)};" ${F} decoding="async" />
              </div>
            `}).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${n(e.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${m?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${m?"true":"false"}"
        >
          ${v("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${p?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${l.map((k,w)=>`
              <div
                data-menu-card-gallery-dot="${n(e.id)}"
                data-menu-card-gallery-index="${w}"
                class="${w===0?"w-4 h-1.5 bg-white rounded-full shadow-sm":"w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm"}"
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
          <span class="text-[17px] font-black text-slate-900 whitespace-nowrap">${n(r)}</span>
        </div>
        <p class="text-[14px] text-slate-500 line-clamp-2 leading-relaxed mb-4" style="margin-bottom:16px;">${n(e.description||"")}</p>
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div class="flex items-center gap-2">
            <div class="hidden">
              <span data-menu-like-count="${n(b)}">${n(h)}</span>
              <span data-menu-comment-count="${n(b)}">${n(S)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>Hinzufuegen</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${v("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function tn(e,t,{mode:s="profile",publicMenuSurfaceState:r=null}={}){const i=ue(Array.isArray(t)?t:[]),a=String(e?.restaurantId||"").trim(),c=s==="admin"||Vt(a),d=r?.focus?.canRenderFocus?{items:Array.isArray(r.focus.items)?r.focus.items:[],enabled:!0}:a&&c?re(a):{items:[],enabled:!1},l=d.enabled?(Array.isArray(d.items)?d.items:[]).map(g=>ze({...g,objectPosition:ie(g)})):[],p=i.filter(g=>N(g)==="testfirst_focus"&&!Fe(g)).map(g=>ze(g,{menuItemId:g.id||""})).filter(Boolean),b=new Set,x=[...l,...p].filter(g=>{const P=String(g.menuItemId||g.id||`${g.title}|${g.text}|${g.imageUrl}`);return!P||b.has(P)?!1:(b.add(P),!0)}),m=i.filter(g=>!Fe(g)),h=m.filter(g=>N(g)!=="testfirst_focus"),S=h.length?h:m,k=h.length?x:[],w=S.filter(g=>X(g)==="drink"),I=S.filter(g=>X(g)!=="drink"),f=(g=[])=>{const P=[],C=[];return g.forEach(j=>{const M=N(j);M==="testfirst_food"||M==="testfirst_special"&&Pe(j)==="food"?C.push(j):P.push(j)}),{gridItems:P,foodItems:C}},y=(g,P=-1)=>N(g)==="testfirst_special"?Ae(g,{mode:s,priorityIndex:P}):rt(g,{mode:s,priorityIndex:P});let F=0;const $=()=>{const g=F;return F+=1,g},A=new Set,L=(g,P)=>!P.gridItems.length&&!P.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${n(g)}">
        ${P.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${n(g)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${H(P.gridItems,C=>y(C,$()),A)}
            </div>
          </div>
        `:""}
        ${P.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${n(g)}">
            <div class="app-content-inline">
              ${H(P.foodItems,C=>{const j=N(C),M=$();return j==="testfirst_special"?Ae(C,{mode:s,size:"food",priorityIndex:M}):at(C,{mode:s,priorityIndex:M})},A)}
            </div>
          </div>
        `:""}
      </section>
    `,T=f(w),G=f(I);return`
    <div>
      ${st(e,k,{mode:s})}
      <div id="menu-section" class="mt-5">
        ${L("drink",T)}
        ${L("food",G)}
      </div>
    </div>
  `}function it(e,{mode:t="profile",useTestfirstCardUi:s=!1,seenCategories:r=null,priorityOffset:i=0}={}){return e.length?s?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${H(e,(a,c)=>rt(a,{mode:t,priorityIndex:i+c}),r)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${H(e,(a,c)=>je(a,{mode:t,variant:"drink",priorityIndex:i+c}),r)}
    </div>
  `:""}function ot(e,{mode:t="profile",useTestfirstCardUi:s=!1,seenCategories:r=null,priorityOffset:i=0}={}){return e.length?s?`
      <div>
        ${H(e,(a,c)=>N(a)==="testfirst_special"&&Pe(a)==="food"?Ae(a,{mode:t,size:"food",priorityIndex:i+c}):at(a,{mode:t,priorityIndex:i+c}),r)}
      </div>
    `:`
    <div class="space-y-4">
      ${H(e,(a,c)=>je(a,{mode:t,variant:"food",priorityIndex:i+c}),r)}
    </div>
  `:""}function lt(e,{mode:t="profile"}={}){if(t==="admin"){const s=String(o?.menu?.filter||"all").trim().toLowerCase(),r=e.filter(l=>E(l?.type)==="drink"),i=e.filter(l=>E(l?.type)!=="drink"),a=(l,p,{addType:b=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${n(l)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${n(l)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(z(p.length))} Eintraege</p>
          </div>
          ${b?`
            <button type="button" data-menu-add-${n(b)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${v("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${p.length?`<div class="space-y-3">${p.map(x=>Ce(x,{mode:"admin"})).join("")}</div>`:'<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Keine Eintraege</div>'}
      </div>
    `,c=[{title:"Getraenke",list:r,addType:"drink"},{title:"Speisen",list:i,addType:"food"}];if(s==="all")return`
        <div>
          ${c.map(l=>a(l.title,l.list,{addType:l.addType})).join("")}
        </div>
      `;const d=c.filter(l=>l.list.length>0);return d.length?`
      <div>
        ${d.map(l=>a(l.title,l.list,{addType:l.addType})).join("")}
      </div>
    `:s==="drink"?a("Getraenke",[],{addType:"drink"}):s==="food"?a("Speisen",[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((s,r)=>Ce(s,{mode:t,priorityIndex:r})).join("")}
    </div>
  `:`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
        Keine Produkte
      </div>
    `}function ct(e){if(!e)return"";const{items:t,enabled:s,loading:r}=re(e,{includeInactive:!0}),i=z(t.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
          <h3 class="text-xl font-black italic tracking-tighter">Highlights</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(i)} Eintraege</p>
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
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${s?"checked":""} />
      </label>

      ${r?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fokus wird geladen...</div>
      `:t.length?`
        <div class="space-y-3">
          ${t.map(a=>{const c=R(a.imageUrl||"","thumb"),d=ne(c)?B:c,l=a.active!==!1?"Aktiv":"Inaktiv",p=a.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(d)}" class="w-full h-full object-cover" style="object-position:${ie(a)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(a.title||"Sot ne Fokus")}</p>
                  ${a.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(a.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${p}">${l}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${n(a.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${n(a.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Fokus-Eintraege</div>
      `}
    </div>
  `}function nn(e){if(!Me(e)||!Qe(e))return"";const s=ue((o.menu.items||[]).filter(r=>N(r)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(z(s.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${v("plus","w-4 h-4")}
        </button>
      </div>
      ${s.length?`
        <div class="space-y-3">
          ${s.map(r=>{const i=R(U(r),"thumb"),a=ne(i)?B:i,c=et(r),d=c.type==="link"?"Link":c.type==="product"?"Produkt-Modal":"Diese Karte",l=Pe(r)==="food"?"Food-Size":"Normal",p=X(r)==="drink"?"Getraenke":"Speisen";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(a)}" class="w-full h-full object-cover" style="object-position:${_(r)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(r.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${n(p)}</span>
                    <span>${n(l)}</span>
                    <span>${n(d)}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-menu-edit="${n(r.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-menu-delete="${n(r.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Special-Karten</div>
      `}
    </div>
  `}function dt(e,{restaurantId:t="",suppressLoading:s=!1,allowAutoEnsure:r=!0,requirePublicMenuTruth:i=!0}={}){const a=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!a||!J(e))return"";const c=te(o,{profile:e,routePayload:o?.profileView?.routePayload,webDirectEntry:o?.__webDirectEntry,restaurantId:a});if(i&&c.menu.status!=="ready")return"";const d=!i||c.focus.canRenderFocus;if(r&&!o.focus.loading&&!d&&ve(Ge(e,a)),i&&!d)return"";const{items:l,loading:p}=d?{items:Array.isArray(c.focus.items)?c.focus.items:[],loading:c.focus.loading}:re(a);if(!(d?!0:re(a).enabled)||!l.length&&!p||s&&p&&!l.length)return"";if(p&&!l.length)return`
      <div class="${qe()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fokus wird geladen...</div>
      </div>
    `;const x=Mt(l),m=l[x]||l[0],{safeImg:h,fallbackImg:S,imageAttrs:k,lazyAttrs:w}=K(m.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:m?.id?`focus-carousel:${a}:${String(m.id)}`:""}),I=m.text||"";return`
    <div id="focusCarousel" class="${qe()} rounded-[2.5rem] p-6 border shadow-sm">
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
        <img data-focus-image src="${n(h)}" data-fallback-src="${n(S)}"${w} class="w-full h-56 object-cover" style="object-position:${ie(m)};" ${k} decoding="async" />
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${n(m.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${I?"":"hidden"}">${n(I)}</p>
      </div>
      ${l.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${l.map((y,F)=>`
            <button type="button" data-focus-dot="${F}" class="w-2.5 h-2.5 rounded-full ${F===x?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function sn(e,t=220){const s=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${s}`}function ut({label:e,url:t,caption:s}){if(!t)return"";const r=sn(t,240);return`
    <button type="button" data-copy-url="${n(t)}" data-copy-label="${n(e)}" class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-left active:scale-[0.98] transition-transform">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${n(r)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${n(e)}</p>
        ${s?`<p class="text-[10px] font-bold text-slate-400 mt-1">${n(s)}</p>`:""}
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2">Tippen zum Kopieren</p>
      </div>
    </button>
  `}function rn({profile:e,restaurantId:t,catalogLabel:s}){if(!t||!J(e))return"";if(typeof Ue=="function"){const a=ae?ae(t):null;(!a||a.sameRestaurant!==!0||!a.loading&&!a.loaded&&!a.error)&&Ue(e)}const r=typeof ae=="function"?ae(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},i=(r.tables||[]).map(a=>{const c=At("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:a});return ut({label:`Tisch ${a}`,url:c,caption:`${s} fuer Tisch ${a}`})}).join("");return`
    <div class="mt-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Tisch QR</span>
          <h3 class="text-xl font-black italic tracking-tighter">Tische</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gib an, wie viele Tische du hast. Bereits erzeugte Tisch-QR bleiben dauerhaft unter denselben Links.</p>
        </div>
        <label class="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
          <input id="tableQrEnabledToggle" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${r.enabled!==!1?"checked":""} />
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Aktiv</span>
        </label>
      </div>
      <div class="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
        <div class="flex-1">
          <label for="tableQrCountInput" class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Anzahl Tische</label>
          <input id="tableQrCountInput" type="number" min="0" max="200" step="1" inputmode="numeric" value="${n(String(r.count||0))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button type="button" data-table-qr-save="true" class="h-14 px-6 rounded-[1.6rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-200/60 active:scale-95" ${r.saving?"disabled":""}>
          ${r.saving?"Speichern...":"Tische speichern"}
        </button>
      </div>
      ${r.loading?'<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tisch-QR wird geladen...</p>':""}
      ${r.status?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">${n(r.status)}</p>`:""}
      ${r.error?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(r.error)}</p>`:""}
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
  `}function an(){const e=o.userProfile,t=e.restaurantId||"",s=String(o.user?.uid||"").trim(),r=String(o.__authBootstrapInFlightUid||"").trim(),i=!t&&!!s&&(!!o.__authProfileLoadPromise||r===s),a=J(e),c=o.profileView?.profile?.restaurantId?o.profileView.profile:null,d=ht()&&!!c?.restaurantId&&J(c),l=Be(e),p=t?we(t):null,b=p?.name||p?.restaurantName||e.name||"Business",x=t&&o.menu.restaurantId===t,m=String(o.menu.source||"").trim().toLowerCase(),h=!!x&&m==="collection",S=!!x&&m==="collection"&&o.menu.loading,k=!!t&&(S||!h),w=h?Ze(o.menu.items,{filter:o.menu.filter,query:o.menu.query}):[],f=Qe(e)?w:w.filter($=>!Bt($)),y=ue(f),F=z(y.length);return t&&a&&!h&&!S&&yt(e),t&&a&&!o.focus.loading&&o.focus.restaurantId!==t&&ve(e),a?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${l}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(b)}</p>
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

      ${t?ct(t):""}
      ${t&&h?nn(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${v("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${n(o.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${tt()}

        ${k?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${l} wird geladen...</div>`:lt(y,{mode:"admin"})}
        ${o.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${n(o.menu.error)}</div>`:""}
        ${rn({profile:e,restaurantId:t,catalogLabel:l})}
      `:""}

    </div>
  `:d?pe(c):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${v("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${l}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function pe(e,{mode:t="profile",allowAutoEnsure:s=!0}={}){const r=o?.profileView?.routePayload&&typeof o.profileView.routePayload=="object"?o.profileView.routePayload:null,i=o?.__webDirectEntry&&typeof o.__webDirectEntry=="object"&&o.__webDirectEntry.active===!0?o.__webDirectEntry:null;let a=te(o,{profile:e,routePayload:r,webDirectEntry:i});const c=a.restaurantId||_t(e,r);if(!c)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        Keine Restaurant-ID gefunden
      </div>
    `;const d=Ge(e,c),l=J(d);l&&(a=te(o,{profile:d,routePayload:r,webDirectEntry:i,restaurantId:c,coordinateFocusWithMenu:!0}));const p=String(i?.canonicalRestaurantId||i?.restaurantId||"").trim(),b=new Set(a.targetIds),x=pn(a.focus.truthState||""),m=a.menu.status==="ready",h=a.focus.canRenderFocus,S=m&&l,k=a.focus.matches===!0&&a.focus.loading===!0,w=t==="landing",f=String(o?.profileView?.menuAccessSource||i?.menuAccessSource||r?.menuAccessSource||"").trim().toLowerCase()==="qr",y=i?.active===!0&&i?.webPriority===!0&&i?.menuFirst===!0&&String(o?.activeTab||"").trim().toLowerCase()==="profile"&&String(o?.profileTopTab||"").trim().toLowerCase()==="menu"&&(p===c||b.has(c)),F=y&&!f,$=["ready","empty","error"].includes(a.menu.status),A=y&&$,L=y&&(!S||a.menu.status!=="ready"),T=!S||a.focus.settled===!0||x==="knownEmpty"||a.menu.status!=="ready";s&&!A&&!$&&wt(d),s&&!L&&!T&&!k&&m&&(!F||$)&&ve(d);const g=a.menu.canRenderItems?ue(Ze(a.menu.items,{filter:"all",query:""})).filter(V=>!Fe(V)):[],P=g.length>0,C=Z(e),j=Be(e),M=a.menu.error||"",fe=!!String(M||"").trim(),Q=a.menu.status==="loading"||a.menu.waitingForFocus===!0,W=g.filter(V=>X(V)==="drink"),ge=g.filter(V=>X(V)!=="drink"),O=0,Le=W.length,ee=Me(e),be=new Set;P&&c&&($t(g,c),Et(g,c));const me=c&&h?(Array.isArray(a.focus.items)?a.focus.items:[]).map(V=>ze({...V,objectPosition:ie(V)})).filter(Boolean):[],xe=me.length?st(d,me,{mode:t}):"";return w&&Q?'<div class="app-content-inline app-main-content-safe" style="min-height: 34vh;"></div>':ee?`
      <div class="app-main-content-safe">
        ${Q?`
          ${xe}
          <div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(j)} wird geladen...</div>
        `:`
          ${P?tn(d,g,{mode:t,publicMenuSurfaceState:a}):fe?'<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">Menu konnte nicht geladen werden</div>':xe||'<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">Keine Produkte</div>'}
          ${M?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(M)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5">
      ${dt(d,{restaurantId:c,suppressLoading:!0,allowAutoEnsure:m&&(!F||$),requirePublicMenuTruth:!0})}
      ${Q?`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(j)} wird geladen...</div>
        </div>
      `:`
        ${P?`
          ${C?`
            ${It(g,{profile:e})}
          `:`
            ${W.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">Getraenke</h3>
                </div>
                <div data-menu-type="drink">
                  ${it(W,{mode:t,useTestfirstCardUi:ee,seenCategories:be,priorityOffset:O})}
                </div>
              </section>
            `:""}
            ${ge.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">Speisen</h3>
                </div>
                <div data-menu-type="food">
                  ${ot(ge,{mode:t,useTestfirstCardUi:ee,seenCategories:be,priorityOffset:Le})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${fe?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                Menu konnte nicht geladen werden
              </div>
            </div>
          `:`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                Keine Produkte
              </div>
            </div>
          `}
        `}
        ${M?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(M)}</div>`:""}
      `}
    </div>
  `}function on(){const e=o.userProfile,t=xt(e),s=t?o.businessPosts:o.userPosts,r=String(o.user?.uid||e?.uid||"").trim(),i=String(e?.restaurantId||"").trim(),a=String(o.__userPostsLoadingUid||"").trim(),c=String(o.__businessPostsLoadingRestaurantId||"").trim(),d=String(o.__authBootstrapInFlightUid||"").trim(),l=!!r&&a===r,p=!!i&&c===i,b=!!r&&d===r,x=t?p||b&&!s.length:l||b&&!s.length,m=String(e.handle||_e(e.name||"user")).replace(/^@/,""),S=n(e.bio||"").replace(/\n/g,"<br>")||"Noch keine Bio.",k=ce(e),w=k==="menu",I=k==="checkins",f=s,y=R(e.avatar,"avatar"),F=Ve(t),$=ke(e);return`
    <div class="app-main-content-safe">
      ${$==="profile"||$==="menu"?`
      <div class="app-content-inline pb-2 ${t?$==="profile"?"pt-2":"pt-4":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${n(y)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${F} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${v("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(z(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Fans</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(z(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Folgt</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${n(m)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${S}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(e.location||"-")}</p>
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

      ${Ie(e)}
      ${Se(e)}

      ${w?`
        ${pe(e)}
      `:I?`
        ${$e()}
      `:`
        ${x&&!f.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">Beitraege werden geladen...</div>
            </div>
          </div>
        `:`
          <div class="${o.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${ye(f,o.profileViewMode)}
          </div>
          ${k==="posts"?`
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
        ${$==="cart"?Re(e):$==="favorites"?Ee(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:We,renderProfilePostsFancy:ye,renderProfileCheckins:$e,renderProfileTabs:Ie,renderProfileViewControls:Se,renderPublicProfileView:Ot,renderMenuFilterRow:tt,renderMenuLayoutSection:Jt,renderMenuItemCard:Ce,renderMenuItemCardStacked:je,renderMenuDrinkGrid:it,renderMenuFoodList:ot,renderMenuList:lt,renderFocusAdminSection:ct,renderFocusCarousel:dt,renderMenuQrCard:ut,renderMenuAdminView:an,renderProfileMenuView:pe,renderProfileView:on}}export{hn as createProfileMenuFocusRenderController};
