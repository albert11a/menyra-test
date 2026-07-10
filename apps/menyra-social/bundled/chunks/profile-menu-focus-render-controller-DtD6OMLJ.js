import{w as Jn}from"./domain-menu-eager-Bned7aXu.js";import{a as ft}from"./domain-media-eager-B90n_Ot7.js";import{am as he,an as Xn,t as es,ao as ts,k as as,ap as xe}from"./domain-feed-social-eager-BQSYD6Kh.js";import"./domain-auth-BL21ERPm.js";import"./domain-public-profile-BW4dw-Ab.js";function ls(y={}){const d=y.state,ia=y.resolvePostCountsFn,n=y.escapeHtmlFn,E=y.getOptimizedImageUrlFn,x=y.iconFn,oa=y.isLocalBusinessProfileFn,la=typeof y.isCeoUserFn=="function"?y.isCeoUserFn:(()=>!1),gt=y.normalizeHandleFn,He=y.logoFitClassFn,B=y.formatCountFn,mt=y.renderProfileShopCartViewFn,bt=y.renderProfileShopFavoritesViewFn,da=typeof y.ensurePostsDataForProfileFn=="function"?y.ensurePostsDataForProfileFn:(()=>{}),ca=y.ensureMenuDataForProfileFn,ua=typeof y.ensureEditorMenuDataForProfileFn=="function"?y.ensureEditorMenuDataForProfileFn:(()=>{}),ve=y.ensureFocusDataForProfileFn,pa=typeof y.ensureAdsDataForProfileFn=="function"?y.ensureAdsDataForProfileFn:(()=>{}),ht=y.ensureTableQrStateForProfileFn,Q=y.isShopCatalogProfileFn,fa=y.getBusinessCatalogLabelFn,oe=y.normalizeMenuTypeFn,ga=y.primeMenuItemCountsFn,ma=typeof y.hydrateMenuCardViewerLikesFn=="function"?y.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),ba=y.renderShopProductListFn,ha=y.getMenuLayoutThemeFn,xa=y.menuLayoutColors,Z=y.resolveMenuItemHeroFn,O=y.isPlaceholderUrlFn,N=y.placeholderImage,va=y.getFirebaseStorageUrlFn,wa=y.isDirectImageUrlFn,xt=y.formatPriceFn,ya=typeof y.resolveCurrencyCodeForMenuItemFn=="function"?y.resolveCurrencyCodeForMenuItemFn:(()=>""),vt=y.getMenuItemImagesFn,V=y.getMenuItemObjectPositionFn,we=y.getMenuItemSocialIdFn,wt=y.menuItemMetaKeyFn,yt=y.ensureMenuItemMetaFn,$t=y.resolveMenuItemCountsFn,ye=y.getFocusStateForRestaurantFn,$a=typeof y.getAdsStateForRestaurantFn=="function"?y.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),$e=y.getTableQrStateForRestaurantFn,le=y.getFocusItemObjectPositionFn,Oe=y.getFocusCardClassFn,ka=y.getFocusIndexFn,se=y.isRestaurantCafeProfileFn,Ve=typeof y.getBusinessProfileTypeFn=="function"?y.getBusinessProfileTypeFn:(()=>""),pe=y.getRestaurantMetaByIdFn,Sa=y.buildUrlFn,Ia=y.normalizeSearchKeyFn,Ca=y.normalizeFollowHandleFn,ee={key:"",inFlightKey:""},kt=new Set,ke=()=>{try{if(globalThis?.__MENYRA_DEBUG_MENU_STATE__===!0||globalThis?.__MENYRA_DEBUG_PROFILE_RENDER__===!0)return!0;const e=new URLSearchParams(globalThis?.location?.search||"");return e.get("debug-menu-state")==="1"||e.get("debug-profile-render")==="1"}catch{return!1}},Pa=({profile:e=null,routePayload:t=null,surface:a=null,decision:s=null}={})=>{if(!ke())return;const i=a&&typeof a=="object"?a:{},r=i.menu&&typeof i.menu=="object"?i.menu:{},o=e&&typeof e=="object"?e:{},l=t&&typeof t=="object"?t:{},c=l?.businessSnapshot?.identity||l?.identity||{},p=String(i.authoritativeRestaurantId||i.restaurantId||r.restaurantId||"").trim(),u=String(o.publicSlug||o.landingSlug||o.handle||c.publicSlug||c.landingSlug||c.handle||"").trim(),f=`${p||"pending"}::${u||"no-slug"}`;if(kt.has(f))return;kt.add(f);const m=Array.isArray(r.items)?r.items:[],b=new Set(m.map(v=>String(v?.category||"").trim()).filter(Boolean)).size,k=String(r.rawTruthState||r.truthState||"").trim();console.debug("[mnyra][public-menu.first-render]",{businessId:p,slug:u,itemsLength:m.length,categoriesLength:b,menuStatus:String(r.status||"loading"),truthState:k,isLoading:s?.isLoading===!0,isHydrating:r.hydrating===!0||k.toLowerCase()==="hydrating",confirmedEmpty:r.confirmedEmpty===!0,canRenderItems:r.canRenderItems===!0,shouldRenderNoProducts:s?.shouldRenderNoProducts===!0,source:String(r.source||"")})},ja=()=>{try{return String(globalThis?.__MNYRA_BUILD_TOKEN__||globalThis?.__MENYRA_SOCIAL_APP_VERSION__||"").trim()}catch{return""}},Ke=(e="")=>n(String(e||"")),de=(e="")=>n(String(e??"")),W=({renderer:e="profile-menu-focus-render-controller",skeleton:t="",source:a=""}={})=>{if(!ke())return"";const s=[e?`data-debug-renderer="${Ke(e)}"`:"",t?`data-debug-skeleton="${Ke(t)}"`:"",a?`data-debug-source="${Ke(a)}"`:""].filter(Boolean);return s.length?` ${s.join(" ")}`:""},Fa=(e={},t=[])=>{const a=ts(e,t);return` ${[`data-menu-state="${de(a.menuState)}"`,`data-menu-item-count="${de(a.menuItemCount)}"`,`data-focus-state="${de(a.focusState)}"`,`data-focus-business-id="${de(a.focusBusinessId)}"`,`data-focus-item-count="${de(a.focusItemCount)}"`,`data-focus-source="${de(a.focusSource)}"`,`data-focus-stale="${a.focusStale?"true":"false"}"`].join(" ")}`},St=({component:e="profile-menu-focus-render-controller",functionName:t="",profile:a=null,routePayload:s=null,surface:i=null,decision:r=null,items:o=null,rawItems:l=null,filteredItems:c=null,renderDecision:p="",source:u=""}={})=>{const f=i&&typeof i=="object"?i:{},m=f.menu&&typeof f.menu=="object"?f.menu:{},b=f.focus&&typeof f.focus=="object"?f.focus:{},k=a&&typeof a=="object"?a:d?.profileView?.profile&&typeof d.profileView.profile=="object"?d.profileView.profile:{},v=s&&typeof s=="object"?s:d?.profileView?.routePayload&&typeof d.profileView.routePayload=="object"?d.profileView.routePayload:{},S=v?.businessSnapshot&&typeof v.businessSnapshot=="object"?v.businessSnapshot:{},P=S?.identity&&typeof S.identity=="object"?S.identity:v?.identity&&typeof v.identity=="object"?v.identity:{},w=d?.__webDirectEntry&&typeof d.__webDirectEntry=="object"?d.__webDirectEntry:{},I=String(k.publicSlug||k.landingSlug||k.handle||P.publicSlug||P.landingSlug||P.handle||w.publicSlug||"").trim(),F=String(k.restaurantId||v.restaurantId||w.restaurantId||"").trim(),A=String(k.canonicalRestaurantId||v.canonicalRestaurantId||f.authoritativeRestaurantId||w.canonicalRestaurantId||S.restaurantId||"").trim();let L="";k.canonicalRestaurantId?L="profile.canonicalRestaurantId":v.canonicalRestaurantId?L="routePayload.canonicalRestaurantId":f.authoritativeRestaurantId?L="surface.authoritativeRestaurantId":w.canonicalRestaurantId?L="webDirectEntry.canonicalRestaurantId":S.restaurantId?L="routeSnapshot.restaurantId":k.restaurantId?L="profile.restaurantId":v.restaurantId?L="routePayload.restaurantId":w.restaurantId&&(L="webDirectEntry.restaurantId");const $=String(A||f.restaurantId||m.restaurantId||F||"").trim(),_=Array.isArray(l)?l:Array.isArray(m.items)?m.items:[],z=Array.isArray(o)?o:_,R=Array.isArray(c)?c:z,h=new Set(R.map(re=>String(re?.category||"").trim()).filter(Boolean)).size,j=String(m.status||(r?.isLoading?"loading":"")||"").trim(),T=String(m.rawTruthState||m.truthState||"").trim(),U=m.confirmedEmpty===!0||r?.confirmedEmpty===!0,M=r?.hasError===!0||j==="error"||!!String(m.error||"").trim(),q=!(R.length>0||r?.hasItems===!0)&&!U&&!M,G=A||F||$||"";return{component:e,functionName:t,slug:I,businessId:$,requestedRestaurantId:F,canonicalRestaurantId:A,restaurantIdSource:L,menuReadPath:G?`restaurants/${G}/public/menu`:"",activeTab:String(d?.activeTab||"").trim(),profileTopTab:String(d?.profileTopTab||"").trim(),profileContentTab:String(d?.profileContentTab||"").trim(),itemsLength:z.length,rawItemsLength:_.length,filteredItemsLength:R.length,categoriesLength:h,focusItemsLength:Array.isArray(b.items)?b.items.length:0,loading:m.loading===!0||r?.isLoading===!0||j==="loading",pending:q,hydrating:m.hydrating===!0||T.toLowerCase()==="hydrating",status:j,truthState:T,confirmedEmpty:U,canRenderItems:m.canRenderItems===!0,renderDecision:p||(r?.shouldRenderNoProducts?"no-products":r?.isLoading?"loading":""),source:u||String(m.source||""),buildToken:ja()}},Se=(e={})=>{ke()&&console.warn("[mnyra:no-products-render]",{...St(e),stack:new Error().stack})},Ie=(e="",t={})=>{ke()&&console.info("[mnyra:skeleton-render]",{skeletonName:e,...St({...t,renderDecision:t.renderDecision||"skeleton"}),reason:String(t.reason||"").trim()})},g=(e,t=e,a={})=>es(e,{fallback:t,params:a}),Aa=(e="")=>{const t=String(e||"").trim();if(!t)return g("nav.menu","Menue");const a=t.toLowerCase();return a==="menue"||a==="menu"||a==="menü"?g("nav.menu",t):a==="shop"?"Shop":t},It=(e="")=>{const t=String(e||"").trim();if(!t)return"";const a=t.toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(a)?g("menu.products","Produkte"):t},La=(e="food",t=!1)=>t?g("menu.products","Produkte"):String(e||"").trim().toLowerCase()==="drink"?g("menu.drinks","Getraenke"):g("menu.food","Speisen"),Ct=(e={},t=!1)=>{const a=oe(e?.type||"food");return t?g("menu.product","Produkt"):a==="drink"?g("menu.drinkItem","Getraenk"):g("menu.foodItem","Speise")},qe=(e="",t="#111827")=>{const a=String(e||"").trim();return/^#[0-9a-fA-F]{6}$/.test(a)?a:t};function Ta(e=null,t=null){return he(d,{profile:e,routePayload:t,webDirectEntry:d?.__webDirectEntry}).restaurantId}function Pt(e=null,t=""){if(!e||typeof e!="object")return e;const a=String(t||"").trim();if(!a)return e;const s=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===a&&s?e:{...e,restaurantId:a,...s?{canonicalRestaurantId:s}:{}}}function _a(e=""){const t=String(e||"").trim();return t?he(d,{profile:d?.profileView?.profile||d?.userProfile,routePayload:d?.profileView?.routePayload,webDirectEntry:d?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function fe(e={}){const t=String(ya(e)||"").trim();return t?xt(e?.price,t):xt(e?.price)}function za(e=[],t="",a=""){const s=String(t||"").trim(),i=String(a||"").trim();if(!s||!i)return"";const r=Array.isArray(e)?e:[];if(!r.length)return`${s}|${i}|empty`;const o=[];return r.forEach(l=>{const c=String(we(l)||l?.id||"").trim();c&&o.push(c)}),o.length?(o.sort(),`${s}|${i}|${o.join(",")}`):`${s}|${i}|empty`}function Ra(e=[],t=""){const a=String(d.user?.uid||"").trim(),s=za(e,t,a);s&&ee.inFlightKey!==s&&ee.key!==s&&(ee.key=s,ee.inFlightKey=s,ma(e,t).catch(i=>{console.error(i),ee.key===s&&(ee.key="")}).finally(()=>{ee.inFlightKey===s&&(ee.inFlightKey="")}))}function Ua(e={}){const t=String(e?.uid||"").trim();if(t&&d.followingTargetIds.includes(t))return!0;const a=String(e?.restaurantId||"").trim();if(a&&d.followingTargetIds.includes(a))return!0;const s=Ca(e?.handle||"");return!!(s&&d.followingHandles.includes(s))}function jt(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const a=typeof pe=="function"&&pe(t)||null;return a?.specialEnabled===!0?!0:(a?.specialEnabled===!1,!1)}function Ma(e={}){return ne(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function Ft(e,t,a=!0,{includeImageKey:s=!0}={}){const i=ia(e),r=e.id?String(e.id):"",o=r?`data-open-post="${n(r)}"`:"",l=r?`data-post-like-count="${n(r)}"`:"",c=r?`data-post-comment-count="${n(r)}"`:"",p=s&&r?`data-img-key="profile-post:${n(r)}"`:"",u=e.type==="wide"||e.type==="hero",f=t&&u?"col-span-2":"",m=t&&u?"aspect-[1.8/1]":"aspect-[4/5]",b=u?800:400,k=u?400:500,v=String(e.posterUrl||e.thumbUrl||e.poster||"").trim(),S=e.isVideo===!0,P=S&&v?v:e.url,w=E(P,u?"large":"medium",{stableKey:r?`profile-post:${r}`:"",variantGroup:"post-detail"}),I=S&&!v&&e.url?`<video src="${n(String(e.url))}" preload="metadata" muted playsinline width="${b}" height="${k}" ${p} class="w-full h-full object-cover pointer-events-none"></video>`:`<img src="${n(w)}" loading="lazy" decoding="async" width="${b}" height="${k}" ${p} class="w-full h-full object-cover" />`;return`
    <div ${o} role="button" tabindex="0" class="${f} relative ${m} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        ${I}
        ${e.isVideo?`<div class="absolute top-3 left-3 w-7 h-7 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">${x("play","w-3.5 h-3.5 fill-white block")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${x("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${l} class="text-[10px] font-bold tracking-wide">${n(i.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${x("message-circle","w-3 h-3 text-indigo-200")}
                <span ${c} class="text-[10px] font-bold tracking-wide">${n(i.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${r&&a?`
        <button type="button" data-profile-menu-button="${n(r)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${x("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${n(r)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${n(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${x(u?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${u?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${n(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${x("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function Ge(e,t,a=!0,{includeImageKeys:s=!0}={}){const i=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${x("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${n(g("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const r=e.map(l=>Ft(l,i,a,{includeImageKey:s})),o=e.reduce((l,c)=>{const p=c?.type==="wide"||c?.type==="hero";return l+(p?2:1)},0);return i&&o%2===1&&r.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),r.join("")}function Qe(){const e=d.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const a=E(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${n(a)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${n(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${x("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${n(t.city||"Stadt")}
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
        <p class="text-slate-400 text-sm font-bold tracking-wide">${n(g("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function Ce(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}function Pe(e={}){const t=String(Ve(e)||"").trim().toLowerCase();return t==="hotel"||t==="motel"}function We(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),a=t?pe(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{}}}function Ea(e={},t=""){const a=e&&typeof e=="object"?e:{},s=String(a.id||a._id||a.offerId||a.menuItemId||t||"offer").trim();return{...a,id:s,menuItemId:String(a.menuItemId||a.targetMenuItemId||a.itemId||a.targetItemId||"").trim(),title:a.title||a.name||"Oferta",text:a.text||a.desc||a.description||"",imageUrl:a.imageUrl||a.image||a.photoUrl||"",active:a.active!==!1}}function Ba(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],a=new Set;return t.map((s,i)=>Ea(s,`offer_${i}`)).filter(s=>{const i=String(s.id||`${s.title}|${s.text}|${s.imageUrl}`).trim();return!i||a.has(i)?!1:(a.add(i),!0)})}function Na(e={}){const t=We(e),a=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!a)return!1;const s=d.focus&&typeof d.focus=="object"?d.focus:{},i=String(s.restaurantId||"").trim()===a,r=String(s.truthSource||"").trim().toLowerCase();if(i&&r==="public-menu"||(i&&Array.isArray(s.items)?s.items:[]).length)return!1;const l=Ba(t);return l.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(d.focus={...s,restaurantId:a,items:l,enabled:s.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:l.length?"seeded":"knownEmpty"},!0):!1}function Da(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const a of t){if(!a||typeof a!="object")continue;const s=Number(a.lat??a.latitude),i=Number(a.lng??a.lon??a.longitude);if(Number.isFinite(s)&&Number.isFinite(i))return{lat:s,lng:i}}return null}function K(e={},t=[]){for(const a of t){const s=String(e?.[a]||"").trim();if(s)return s}return""}function je(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function Ha(e={}){const t=[...je(e.coverImages),...je(e.hotelCoverImages),...je(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(s=>String(s||"").trim()).filter(Boolean),a=[];return t.forEach(s=>{a.includes(s)||a.push(s)}),a.slice(0,8)}function Oa(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function Va(e=""){const t=String(e||"").trim(),a=d.hotelCardEditor&&typeof d.hotelCardEditor=="object"?d.hotelCardEditor:{},s=String(a.restaurantId||"").trim();return s?s===t?a:{}:Oa(a)?{}:a}function Ka(e={}){const t=Array.isArray(e.features)?e.features.map(s=>String(s||"").trim()).filter(Boolean):[],a=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[K(e,["hotelFeatureOneText","gardenTerraceText"])||String(a.gardenTerrace||"").trim()||t[0]||"",K(e,["hotelFeatureTwoText","accessibilityText"])||String(a.accessibility||"").trim()||t[1]||"",K(e,["hotelFeatureThreeText","veganOptionsText"])||String(a.veganOptions||"").trim()||t[2]||""]}function qa(e={}){const t=[],a=(s="")=>{const i=String(s||"").trim();i&&!t.includes(i)&&t.push(i)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(s=>{Array.isArray(s)&&s.forEach(i=>{typeof i=="string"?a(i):i&&typeof i=="object"&&a(i.label||i.name||i.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&a("Në plazh"),(e.restaurant||e.hasRestaurant)&&a("Restaurant"),(e.breakfast||e.breakfastIncluded)&&a("Mëngjes"),(e.pool||e.hasPool)&&a("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&a("WLAN"),(e.parking||e.freeParking||e.hasParking)&&a("Parking"),(e.spa||e.wellness)&&a("Wellness"),t.slice(0,8)}const Ga=[{value:"m",label:"m"},{value:"km",label:"km"}],Qa="Në qendër",At="Në plazh",Wa=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],Ya=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],Za=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function te(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function Ja(e="",{direct:t=!1}={}){const a=String(e||"").trim(),s=te(a),i=t||s==="ne_qender"||s==="ne_plazh"||s==="direkt_ne_qender"||s==="direkt_ne_plazh"||s.includes("direkt")&&(s.includes("strand")||s.includes("zentrum")||s.includes("center"))||s.includes("am_strand")||s.includes("im_zentrum"),r=a.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),o=r?r[1].replace(",","."):"",c=(r?String(r[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:o,unit:c,isDirect:i}}function Lt({idPrefix:e="",iconName:t="navigation",label:a="",value:s="",directLabel:i="",direct:r=!1}={}){const o=Ja(s,{direct:r});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${x(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${n(a)}</p>
          <p class="text-[10px] font-bold text-slate-400">${n(i)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${n(e)}Value" type="number" min="0" step="0.1" value="${n(o.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${n(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${Ga.map(l=>`<option value="${n(l.value)}" ${o.unit===l.value?"selected":""}>${n(l.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${n(i)}</span>
        <input id="${n(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${o.isDirect?"checked":""} />
      </label>
    </div>
  `}function Xa(e=[],t=""){const a=String(t||"").trim(),s=new Set(e.map(te));return`
    <option value="">Zgjidh</option>
    ${e.map(i=>`<option value="${n(i)}" ${te(i)===te(a)?"selected":""}>${n(i)}</option>`).join("")}
    ${a&&!s.has(te(a))?`<option value="${n(a)}" selected>Aktuale: ${n(a)}</option>`:""}
  `}function Ye({id:e="",iconName:t="badge-check",label:a="",value:s="",options:i=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${x(t,"w-4 h-4")}
        </div>
        <label for="${n(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${n(a)}</label>
      </div>
      <select id="${n(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${Xa(i,s)}
      </select>
    </div>
  `}function en(e={},t=[]){const a=new Set(t.map(te).filter(Boolean)),s=[],i=(r="")=>{const o=String(r||"").trim();if(!o)return;const l=te(o);a.has(l)||s.some(c=>te(c)===l)||s.push(o)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(r=>je(r).forEach(i)),s}function tn({existingImages:e=[],newPreviews:t=[],imageUrlDraft:a=""}={}){const s=[...t.map((o,l)=>({src:o,kind:"new",idx:l})),...e.map((o,l)=>({src:o,kind:"existing",idx:l}))].filter(o=>o.src),i=s[0]?.src||a||"",r=i?E(i,"large"):N;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${n(r||N)}" class="w-full h-52 object-cover bg-white" />
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
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${s.length}</span>
        </div>
        ${s.length?`
          <div class="grid grid-cols-3 gap-2">
            ${s.map(o=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                ${o.kind==="existing"?`<span data-hotel-card-existing-image="${n(o.src)}" hidden></span>`:""}
                <img src="${n(E(o.src,"thumb"))}" class="w-full h-full object-cover" />
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

      <input id="hotelCardCoverImageUrl" type="hidden" value="${n(a)}" />
    </div>
  `}function Fe({iconName:e="info",label:t="",value:a="",helper:s=""}={}){return`
    <div class="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm">
      <div class="flex items-start gap-4">
        <div class="w-11 h-11 rounded-[1.25rem] bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          ${x(e,"w-5 h-5")}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">${n(t)}</p>
          <p class="text-sm font-black text-slate-900 leading-snug">${n(a||"Shto detajet")}</p>
          ${s?`<p class="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">${n(s)}</p>`:""}
        </div>
      </div>
    </div>
  `}function Tt(e={}){const t=We(e),a=Da(t),s=K(t,["address","primaryAddress","location","formattedAddress","street"]),i=K(t,["city","locationCity","primaryCity","region","country"]),r=K(t,["beachDistance","distanceToBeach","beachDistanceLabel","strandEntfernung"]),o=K(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),l=K(t,["rating","reviewRating","stars","hotelStars"]),c=K(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),p=qa(t),u=a?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.lat},${a.lng}`)}`:s||i?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s} ${i}`.trim())}`:"";return`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm overflow-hidden">
        <div class="h-40 rounded-[1.6rem] bg-cyan-50 border border-cyan-100 relative overflow-hidden mb-4">
          <div class="absolute inset-0 opacity-80" style="background-image: linear-gradient(135deg, rgba(0,204,229,0.18), rgba(15,23,42,0.04));"></div>
          <div class="absolute inset-0 flex items-center justify-center text-cyan-600">
            ${x("map-pin","w-10 h-10")}
          </div>
          <div class="absolute left-4 right-4 bottom-4 bg-white/90 backdrop-blur rounded-2xl p-3 border border-white/70">
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Lokacioni</p>
            <p class="text-xs font-black text-slate-900 leading-snug">${n(s||i||"Shto lokacionin")}</p>
          </div>
        </div>
        ${u?`
          <a href="${n(u)}" target="_blank" rel="noopener noreferrer" class="w-full h-12 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            ${x("navigation","w-4 h-4")} Hap hartën
          </a>
        `:""}
      </div>

      <div class="grid grid-cols-1 gap-4">
        ${Fe({iconName:"map-pin",label:"Adresa",value:[s,i].filter(Boolean).join(", ")||"Shto lokacionin",helper:a?`${a.lat.toFixed(5)}, ${a.lng.toFixed(5)}`:""})}
        ${Fe({iconName:"navigation",label:"Qendra",value:o||"Shto detajet"})}
        ${Fe({iconName:"waves",label:"Plazhi",value:r||(t.beachfront||t.onBeach?At:"Shto detajet")})}
        ${Fe({iconName:"star",label:"Vlerësime",value:l?`${l}${c?` / ${c} vlerësime`:""}`:"Pa vlerësime",helper:K(t,["reviewSummary","ratingSummary","commentsSummary"])})}
      </div>

      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Të përfshira</p>
        ${p.length?`
          <div class="flex flex-wrap gap-2">
            ${p.map(f=>`<span class="px-3 py-2 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600">${n(f)}</span>`).join("")}
          </div>
        `:`
          <p class="text-sm font-bold text-slate-400">Shto pajisjet dhe detajet e dhomave.</p>
        `}
      </div>
    </div>
  `}function an(e={}){const t=We(e),a=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),s=t?.name||t?.restaurantName||e?.name||"Hotel",i=Va(a),r=String(i.status||"").trim(),o=i.saving===!0,l=Array.isArray(i.existingImages)?i.existingImages.map(_=>String(_||"").trim()).filter(Boolean):Ha(t),c=Array.isArray(i.imagePreviews)?i.imagePreviews.map(_=>String(_||"").trim()).filter(Boolean):[],p=String(i.imageUrlDraft||"").trim(),[u,f,m]=Ka(t),b=en(t,[u,f,m]),k=K(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),v=K(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),S=K(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),P=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,w=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,I=i.detailsOpen===!0||o,F=c[0]||l[0]||"",A=F?E(F,"thumb"):N,L=[k,v,S?`${S} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",$=r.includes("fehl")||r.includes("Bitte")||r.includes("Nuk");return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel Card</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(s)}</p>
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
            <button type="button" data-hotel-card-details-open aria-expanded="${I?"true":"false"}" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
              ${x("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${I?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${n(A||N)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${n(s)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(L)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${I?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${x("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${r&&!I?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${$?"text-rose-500":"text-slate-500"}">${n(r)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${n(a)}" data-hotel-card-details-panel class="${I?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
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
              ${tn({existingImages:l,newPreviews:c,imageUrlDraft:p})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Lt({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:k,directLabel:Qa,direct:P})}
              ${Lt({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:v,directLabel:At,direct:w})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${n(S)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Ye({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:u,options:Wa})}
              ${Ye({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:f,options:Ya})}
              ${Ye({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:m,options:Za})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${n(b.join(`
`))}</textarea>
              </div>
            </div>

            ${r?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${$?"text-rose-500":"text-slate-500"}">${n(r)}</div>`:""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${o?"disabled":""}>
              ${o?"Po ruhet...":"Ruaj Hotel Details"}
            </button>
        </div>
        ${ot(a,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function Ae(e={}){const t=String(d.profileTopTab||"").trim().toLowerCase(),a=String(d.profileContentTab||"").trim().toLowerCase();return Ce(e)?t==="menu"?"menu":a==="menu"||a==="posts"?a:"posts":a==="media"||a==="checkins"?a:"posts"}function Ze(e={}){const t=String(d.profileTopTab||"").trim().toLowerCase();return Ce(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(d.user?.uid||"").trim()?"favorites":"profile"}function _t(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function nn(e=0,t=1){const a=Math.max(1,Number(t||0)||1),s=Math.round(Number(e||0));if(!Number.isFinite(s))return 0;const i=s%a;return i<0?i+a:i}function sn(e=0){return _t(e)}function rn(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],a=_t(d.profileLandingStep),s=nn(d.profileLandingGreetingIndex,t.length),i=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},r=String(i.businessName||e.name||"casarita").trim()||"casarita",o=qe(i.businessNameColor||e.businessNameColor||e.landingBusinessNameColor||"","#111827"),l=o&&o.toLowerCase()!=="#111827"?o:"",c=qe(i.businessNameColorPart1||e.businessNameColorPart1||e.landingBusinessNameColorPart1||o||"","#111827"),p=qe(i.businessNameColorPart2||e.businessNameColorPart2||e.landingBusinessNameColorPart2||l||"","#4f46e5"),u=r.replace(/\.+$/g,"").trim()||r,f=u.split(/\s+/).filter(Boolean),m=f.length>1?f.slice(0,-1).join(" "):u,b=f.length>1?f[f.length-1]:"",k=b?m:`${m}.`,v=b?`${b}.`:"",S=E(i.logoUrl||e.avatar||"","avatar"),w=String(S||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",I=String(i.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),F=String(i.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),A=a>=2,L=a>=3,$=Array.isArray(d.profileView?.posts)?d.profileView.posts:Array.isArray(e?.posts)?e.posts:[],_=sn(a),z=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${x("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(R=>{const h=_===R;return`
            <div data-landing-step-dot="${R}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${h?"1.22":"1"}); opacity: ${h?"1":"0.88"}; background: ${h?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${h?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${h?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${a===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${a===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((R,h)=>{const j=h===s,T=h===(s-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${h}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${j?"opacity: 1; transform: translateY(0) scale(1);":T?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!j&&!T?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${n(R)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${n(w)}" alt="${n(`${r} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${n(c)};">${n(k)}</span>${v?`<span style="color:${n(p)};">${n(v)}</span>`:""}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${n(I)}<br />
            ${n(F)}
          </p>
        </div>
        ${z}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${a<1?"translate-y-full":a===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===1?"1":"0"}; pointer-events: ${a===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${_e(e,$,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${z}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${a<2?"translate-y-full":a===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===2?"1":"0"}; pointer-events: ${a===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${A?_e(e,$,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${z}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${a<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${a===3?"1":"0"}; pointer-events: ${a===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${L?_e(e,$,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function Je(e=d.profileView?.profile||d.userProfile,{landingPreview:t=!1,selectedTabOverride:a="",compact:s=!1}={}){const i=Ce(e),r=String(a||Ae(e)).trim().toLowerCase()||"posts",o=Pe(e),l=Q(e),c=o?"Details":l?"Shop":g("nav.menu","Menue"),p=i?[{id:"posts",label:g("profile.posts","Beitraege")},{id:"menu",label:c,surface:o?"hotel-details":"menu"}]:[{id:"posts",label:g("profile.posts","Beitraege")},{id:"media",label:g("profile.media","Medien")},{id:"checkins",label:g("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${s?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${p.map(u=>`
          <button data-profile-tab="${u.id}" ${u.surface?`data-profile-tab-surface="${n(u.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${r===u.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${u.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function Xe(e=d.profileView?.profile||d.userProfile,{disabled:t=!1}={}){const a=Ae(e);return a==="checkins"||a==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${n(g("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${d.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${x("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${d.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${x("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function D(e=""){return String(e||"").trim()}const zt="mnyra_business_title_image_cache_v1",Rt=80;function Ut(){if(!d)return{};const e=d.businessTitleImageCache&&typeof d.businessTitleImageCache=="object"?d.businessTitleImageCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const s=(typeof window<"u"?window.localStorage:null)?.getItem?.(zt)||"",i=s?JSON.parse(s):{};i&&typeof i=="object"&&Object.entries(i).forEach(([r,o])=>{const l=D(r),c=D(o);l&&c&&!O(c)&&(t[l]=c)})}catch{}return d.businessTitleImageCache={loaded:!0,items:t},t}function on(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem(zt,JSON.stringify(e))}catch{}}function ln(e={},t="business"){const a=[e?.restaurantId,e?.canonicalRestaurantId,e?.uid,e?.handle,e?.publicSlug,e?.landingSlug,e?.name,t].map(s=>D(s)).filter(Boolean);return[...new Set(a)]}function dn(e=[],t=""){const a=D(t);if(!a||O(a))return;const s=Ut();let i=!1;e.forEach(o=>{const l=D(o);!l||s[l]===a||(s[l]=a,i=!0)});const r=Object.entries(s);if(r.length>Rt){const o=r.slice(r.length-Rt);Object.keys(s).forEach(l=>delete s[l]),o.forEach(([l,c])=>{s[l]=c}),i=!0}i&&on(s)}function cn(e=[]){const t=Ut();for(const a of e){const s=D(a),i=s?D(t[s]):"";if(i&&!O(i))return i}return""}function un(e={},t="business"){return String(e?.restaurantId||e?.canonicalRestaurantId||e?.uid||e?.handle||e?.name||t).trim()||t}function pn(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.id||e?.landingRestaurantId||e?.documentId||"").trim()}function fn(e={}){const a=(Array.isArray(e?.coverImages)?e.coverImages:Array.isArray(e?.titleImages)?e.titleImages:[]).map(s=>String(s||"").trim()).find(Boolean)||"";return String(e?.titleImageUrl||e?.coverImageUrl||e?.coverUrl||e?.heroUrl||a||"").trim()}function gn(e={},t={}){const a=fn(e),s=Array.isArray(t.cacheKeys)?t.cacheKeys:[],i=D(t.stableKey||s[0]||"");if(!a){if(t.allowCacheFallback===!0){const o=cn(s);if(o)return o;const l=i?E("","medium",{stableKey:i}):"";return l&&!O(l)?l:""}return""}const r=E(a,"medium",i?{stableKey:i}:void 0);return r&&!O(r)?(dn(s,r),r):""}function Mt(e="",t=""){const a=D(e);if(!a)return"";if(/^https?:\/\//i.test(a))return a;const s=a.replace(/^@+/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/^tiktok\.com\/@?/i,"").replace(/^www\.tiktok\.com\/@?/i,"").replace(/^\/+/,"").trim();return s?t==="tiktok"?`https://www.tiktok.com/@${encodeURIComponent(s)}`:t==="instagram"?`https://www.instagram.com/${encodeURIComponent(s)}`:"":""}function mn(e=""){const t=D(e);if(!t)return"";const a=t.replace(/[^\d+]/g,"");return a?`tel:${a}`:""}function bn(e={}){const t=Number(e?.gpsLat??e?.lat),a=Number(e?.gpsLng??e?.lng);if(Number.isFinite(t)&&Number.isFinite(a))return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t},${a}`)}`;const s=[e?.address,e?.locationPlace||e?.place,e?.location,e?.city,e?.country].map(i=>D(i)).filter(Boolean).join(", ");return s?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s)}`:""}function Le({href:e="",label:t="",iconName:a="",body:s="",buttonAttrs:i=""}={}){const r=D(e),o=String(i||"").trim();if(!r&&!o)return"";const l=s||x(a,"w-4 h-4"),c="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform";return o?`
    <button type="button" ${o} title="${n(t)}" aria-label="${n(t)}" class="${c}">
      ${l}
    </button>
  `:`
    <a href="${n(r)}" target="_blank" rel="noreferrer" title="${n(t)}" class="${c}">
      ${l}
    </a>
  `}function Te({href:e="",buttonAttrs:t="",iconName:a="",eyebrow:s="",value:i=""}={}){const r=D(i);if(!r)return"";const o=`
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${x(a,"w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${n(s)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n(r)}</span>
    </div>
  `;return e?`<a href="${n(e)}" target="${e.startsWith("tel:")?"_self":"_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${o}</a>`:`<button type="button" ${t} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${o}</button>`}function hn({profileName:e="",safeBio:t="",metaLine:a="",identityPending:s=!1,followersLabel:i=""}={}){return`
    <div aria-hidden="true" style="grid-area:1/1;visibility:hidden;pointer-events:none;min-width:0;max-width:100%;overflow:hidden;">
      <div class="h-40 w-full"></div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div class="relative">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px]"></div>
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(String(i))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(g("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <div class="flex flex-col items-center min-w-0">
              <span class="h-7 flex items-center justify-center text-slate-900"></span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(g("profile.info","Info"))}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${t}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(a)}</p>
          ${s?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(g("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-[56px] rounded-[1.2rem]"></div>
          <div class="w-[56px] h-[56px] rounded-[1.2rem]"></div>
        </div>
      </div>
    </div>
  `}function Et(e={},t={}){const a=t.mode==="self"?"self":"public",s=t.disabledBlockClass||"",i=un(e,a),r=a==="self"?"avatar:self":`avatar:public:${i}`,o=t.avatarUrl||E(e.avatar||"","avatar",{stableKey:r}),l=t.avatarFit||He(!!e.restaurantId),c=String(d?.profileCardInfoOpen||"")===i,p=Number(d?.profileCardInfoHeights?.[i]||0),u=c&&Number.isFinite(p)&&p>0?`height:${Math.ceil(p)}px;`:"",f=t.avatarImgKeyAttr||(a==="self"?'data-img-key="avatar:self"':`data-img-key="avatar:public:${n(i)}"`),m=t.renderAvatarImage===!0?!!String(o||"").trim()&&!O(o):t.renderAvatarImage!==!1&&!!String(o||"").trim()&&!O(o)&&!!String(e?.avatar||"").trim(),b=!!t.identityPending,k=t.followersLabel??B(e.followers),v=D(e?.name)||"User",S=D(t.typeLabel||e?.customerType||e?.type||"Business"),P=D(e?.location||"-"),w=a==="public"?`${P} / ${S}`:P,I=t.bioHtml||n(e?.bio||"").replace(/\n/g,"<br>")||n(g("profile.noBio","Noch keine Bio.")),F=`business-cover:${i}`,A=ln(e,i),L=gn(e,{cacheKeys:A,stableKey:F,allowCacheFallback:t.allowTitleImageCacheFallback===!0}),$=bn(e),_=pn(e),z=Le(_?{buttonAttrs:`data-marketplace-open-map="${n(_)}"`,label:g("profile.openMap","Karte oeffnen"),iconName:"map"}:{href:$,label:g("profile.openMap","Karte oeffnen"),iconName:"map"}),R=Mt(e?.instagramUrl||e?.instagram||e?.insta||"","instagram"),h=Mt(e?.tiktokUrl||e?.tiktok||e?.tikTok||"","tiktok"),j=D(e?.phone||e?.telephone||e?.contactPhone||""),T=mn(j),U=D(e?.address||e?.locationLabel||[e?.place||e?.locationPlace,e?.location||e?.city].map(q=>D(q)).filter(Boolean).join(", ")),M=[Te({href:R,iconName:"instagram",eyebrow:"Instagram",value:e?.instagram||e?.instagramUrl||e?.insta||""}),Te({href:h,iconName:"music-2",eyebrow:"TikTok",value:e?.tiktok||e?.tiktokUrl||e?.tikTok||""})].filter(Boolean).join(""),H=a==="self"?`
      <button data-nav="upload" data-upload-intent="chooser" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
        <span class="relative z-10 flex items-center gap-2">${x("plus","w-4 h-4")} Status</span>
        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
      <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${x("settings","w-5 h-5")}
      </button>
    `:`
      <button data-landing-tutorial-target="follow" data-public-profile-follow="${n(e.handle||"")}" data-target-type="${n(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${n(e.restaurantId||e.uid||"")}" data-target-name="${n(e.name||"")}" data-target-avatar="${n(e.avatar||"")}" ${t.hasPendingFollowRequest?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${t.followTone||"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"} ${t.hasPendingFollowRequest?"opacity-90 cursor-default":""}">
        <span class="relative z-10 flex items-center gap-2">
          ${t.isFollowing?x("check","w-4 h-4"):""}
          ${n(t.followLabel||g("profile.follow","Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${n(e.uid||"")}" data-chat-handle="${n(e.handle||"")}" data-chat-name="${n(e.name||"")}" data-chat-avatar="${n(e.avatar||"")}" ${t.isLocked?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${t.isLocked?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${x("message-circle","w-5 h-5")}
      </button>
    `;if(c){const q=[Te({href:T,iconName:"phone",eyebrow:g("profile.call","Anrufen"),value:j}),Te({href:$,iconName:"map-pin",eyebrow:g("profile.address","Adresse"),value:U||P}),M].filter(Boolean).join("");return`
      <div data-landing-tutorial-target="identity" data-business-profile-card="${n(i)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${s}" style="${u}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${hn({profileName:v,safeBio:I,metaLine:w,identityPending:b,followersLabel:k})}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${n(i)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${x("x","w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(g("profile.contactInfo","Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(P)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${q||`<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${n(g("profile.noContactInfo","Noch keine Kontaktdaten"))}</div>`}
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 min-w-0 max-w-full overflow-hidden">
            <button type="button" data-profile-card-info-close="${n(i)}" class="w-full h-[56px] rounded-[1.2rem] border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center" style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;">
              ${n(g("profile.backToProfile","Zurueck zum Profil"))}
            </button>
          </div>
        </div>
      </div>
    `}return`
    <div data-landing-tutorial-target="identity" data-business-profile-card="${n(i)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${s}" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${L?`<img src="${n(L)}" data-img-key="${n(F)}" alt="${n(v)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`:`<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${x("store","w-7 h-7")}</div>`}
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${z}
          ${Le({href:h,label:"TikTok",iconName:"music-2"})}
          ${Le({href:R,label:"Instagram",iconName:"instagram"})}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${a==="self"?'id="profileAvatarTrigger"':""} class="relative ${a==="self"?"cursor-pointer group":""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${m?`<img src="${n(o)}" data-fallback-src="${n(N)}" decoding="async" width="100" height="100" ${f} class="w-full h-full rounded-[1.8rem] ${l} border-2 border-white bg-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${b?"animate-pulse":""}">${x("store","w-8 h-8 text-slate-300")}</div>`}
            </div>
            ${e.isPremium?`
              <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                ${x("badge-check","w-4 h-4 fill-blue-500 text-white")}
              </div>
            `:""}
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div data-landing-tutorial-target="fans" class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl ${b?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(String(k))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(g("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <button type="button" data-profile-card-info-open="${n(i)}" class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${x("info","w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(g("profile.info","Info"))}</span>
            </button>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(v)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${I}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(w)}</p>
          ${b?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(g("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          ${H}
        </div>
      </div>
    </div>
  `}function _e(e={},t=[],{topTabOverride:a="",tutorialMode:s=!1,contentTabOverride:i="",landingHideContent:r=!1,collapseIdentity:o=!1,contentReveal:l=!1,landingMode:c=!1}={}){const p=Ua(e),u=!!e.privateAccount&&e.uid&&String(e.uid)!==String(d.user?.uid||"")&&!p,f=!!e.pendingFollowRequest&&!p,m=e.restaurantId?"Business":g("nav.user","User"),b=String(e.handle||gt(e.name||"user")).replace(/^@/,""),v=n(e.bio||"").replace(/\n/g,"<br>")||n(g("profile.noBio","Noch keine Bio.")),S=Ce(e),P=String(a||Ze(e)).trim().toLowerCase()||"profile",w=String(i||Ae(e)).trim().toLowerCase()||"posts",I=w==="menu",F=w==="checkins",A=t,$={...d?.profileView&&typeof d.profileView=="object"?d.profileView:{},profile:e,posts:Array.isArray(A)?A:[]},_=as(d,{profileView:$,profileTopTab:P,profileContentTab:w}),z=String(_?.header?.status||"").trim().toLowerCase()||"loading",R=String(_?.posts?.status||"").trim().toLowerCase()||"loading",h=e.uid||e.restaurantId||b||"public",j=`avatar:public:${h}`,T=String(e?.avatar||"").trim(),U=E(T,"avatar",{stableKey:j}),M=He(!!e.restaurantId),H=c?"":`data-img-key="avatar:public:${n(h)}"`,q=!T&&!!String(U||"").trim()&&!O(U),G=!!T||q&&xe(z),re=pt=>{if(pt==null)return!1;const ra=Number(pt);return Number.isFinite(ra)&&ra>=0},ut=G||re(e?.followers)||re(e?.following),J=xe(z)&&!ut,ie=!!String(U||"").trim()&&!O(U)&&G,Me=J?"...":B(e.followers),Ee=J?"...":B(e.following),Be=S?"pt-2":"pt-10",Ne=p?g("profile.following","Following"):f?g("profile.requested","Requested"):u?g("profile.request","Request"):g("profile.follow","Follow"),me=p?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":f?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",be=s?"select-none":"app-main-content-safe",X=s?"pointer-events-none":"",Y=!o,na=!r,De=l?c?"transition-opacity duration-200":"animate-in fade-in duration-300":"",sa=w==="posts"&&A.length>0,Yn=w!=="posts"||sa||R==="empty"||R==="error",Zn=w==="posts"&&!sa&&R==="error";return!s&&(w==="posts"||w==="media")&&e?.restaurantId&&xe(R)&&da(e),`
    <div class="${be}" ${s?'data-landing-tutorial-surface="true"':""}>
      ${P==="profile"||P==="menu"?`
      ${Y?`
        <div class="app-content-inline pb-2 ${Be}">
          ${S?Et(e,{mode:"public",disabledBlockClass:X,avatarUrl:U,avatarFit:M,avatarImgKeyAttr:H,renderAvatarImage:ie,identityPending:J,followersLabel:Me,followLabel:Ne,followTone:me,isFollowing:p,hasPendingFollowRequest:f,isLocked:u,bioHtml:v,typeLabel:m,allowTitleImageCacheFallback:xe(z)||xe(R)}):`
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${X}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${ie?`<img src="${n(U)}" data-fallback-src="${n(N)}" decoding="async" width="100" height="100" ${H} class="w-full h-full rounded-[1.8rem] ${M} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${J?"animate-pulse":""}">${x(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${x("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${J?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(Me)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(g("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${J?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(Ee)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(g("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e.name||"User")}</h1>
                ${S?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${n(b)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${v}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(e.location||"-")} / ${m}</p>
                ${J?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(g("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${n(e.handle)}" data-target-type="${n(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${n(e.restaurantId||e.uid||"")}" data-target-name="${n(e.name||"")}" data-target-avatar="${n(e.avatar||"")}" ${f?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${me} ${f?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${p?x("check","w-4 h-4"):""}
                    ${Ne}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${n(e.uid||"")}" data-chat-handle="${n(e.handle||"")}" data-chat-name="${n(e.name||"")}" data-chat-avatar="${n(e.avatar||"")}" ${u?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${u?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${x("message-circle","w-5 h-5")}
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
              ${x("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${n(g("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${n(g("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${Je(e,{landingPreview:s,selectedTabOverride:w,compact:o})}
        ${na?Xe(e,{disabled:s}):""}

        ${na?I?`
          <div class="${X} ${De}">
            ${Pe(e)?Tt(e):Ue(e,{mode:c?"landing":"profile",allowAutoEnsure:!c})}
          </div>
        `:F?`
          <div class="${X} ${De}">
            ${Qe()}
          </div>
        `:`
          ${Yn?`
            ${Zn?`
              <div class="app-content-inline ${X}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${n(g("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${d.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${X} ${De}">
                ${Ge(A,d.profileViewMode,!1,{includeImageKeys:!c})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${X}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${De}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(g("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${P==="cart"?mt(e):P==="favorites"?bt(e):""}
      `}
    </div>
  `}function xn(){const e=d.profileView;if(!e||!e.profile)return"";const t=e.profile,a=e.posts||t.posts||[],s=Ze(t);return s==="landing"?rn(t):_e(t,a,{topTabOverride:s,tutorialMode:!1})}function Bt(e,{filter:t="all",query:a=""}={}){const s=Array.isArray(e)?e:[],i=Ia(a||"");return s.filter(r=>t==="all"||oe(r.type)===t?i?`${r.name||""} ${r.category||""} ${r.description||""}`.toLowerCase().includes(i):!0:!1)}function Nt(e,t=0){const a=Number(e);return Number.isFinite(a)?Math.max(0,Math.floor(a)):Math.max(0,Number(t)||0)}function ze(e=[]){return(Array.isArray(e)?e.slice():[]).map((a,s)=>({item:a,idx:s,order:Nt(a?.orderIndex,s)})).sort((a,s)=>a.order-s.order||a.idx-s.idx).map((a,s)=>({...a.item,orderIndex:Nt(a.item?.orderIndex,s)}))}function et(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function ge(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":oe(e?.type||"food")==="drink"?"drink":"food"}function vn(e={}){return String(e?.category||g("menu.other","Sonstiges")).trim()||g("menu.other","Sonstiges")}function wn(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const yn=4,$n={thumb:160,small:480,medium:768,large:1280};function Dt({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<yn&&a===0}function kn({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){const s=Dt({mode:e,priorityIndex:t,slideIndex:a}),i=e==="profile"?' data-image-reveal="menu"':"";return s?`loading="eager" fetchpriority="high"${i}`:`loading="lazy" fetchpriority="low"${i}`}function Sn({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function ae(e,{mode:t="profile",priorityIndex:a=-1,slideIndex:s=0,stableKey:i="",preferredSize:r="small",candidateSizes:o=["small","medium","large"],variant:l="grid"}={}){const c=String(e||"").trim(),p=t==="profile"&&i?{stableKey:i}:null,u=Dt({mode:t,priorityIndex:a,slideIndex:s}),f=t==="profile"&&!u&&l!=="thumb",m=E(c,r,p),b=O(m)?N:m,k=va(c),v=wa(c)&&c!==b?c:k,S=[],P=new Set;o.forEach(h=>{const j=$n[h]||0;if(!j)return;const T=E(c,h,p);if(!T||O(T))return;const U=`${T}|${j}`;P.has(U)||(P.add(U),S.push(`${T} ${j}w`))});const w=S.length>1?S.join(", "):"",I=w?Sn({variant:l}):"",F=f?"":w,A=f?"":I,L=F?` srcset="${n(F)}"`:"",$=A?` sizes="${n(A)}"`:"",_=kn({mode:t,priorityIndex:a,slideIndex:s}),z=`${_}${L}${$}`,R=f?[`data-menu-lazy-src="${n(b)}"`,`data-menu-lazy-fallback="${n(v||N)}"`,w?`data-menu-lazy-srcset="${n(w)}"`:"",I?`data-menu-lazy-sizes="${n(I)}"`:""].filter(Boolean).join(" "):"";return{safeImg:f?N:b,fallbackImg:f?N:v,imageAttrs:z,lazyAttrs:R?` ${R}`:"",srcsetValue:w,sizesValue:I,loadingAttrs:_}}function ce(e=[],t,a=null){const s=a instanceof Set?a:new Set;return e.map((i,r)=>{const o=vn(i),l=wn(o),c=!!l&&!s.has(l);return c&&s.add(l),`<div${c?` data-menu-category-anchor="${n(l)}"`:""} class="h-full">${t(i,r)}</div>`}).join("")}function tt(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function In(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function Ht(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),a=In(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),s=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&a?{type:"link",url:a,productId:""}:t==="product"&&s?{type:"product",url:"",productId:s}:{type:"self",url:"",productId:""}}function Ot(){const e=Q(d.userProfile),t=String(d.menu.filter||"all").trim().toLowerCase()||"all",a=e&&t==="drink"?"all":t;return`
    <div class="flex gap-2 mb-5">
      ${(e?[{id:"all",label:g("menu.all","Alle")},{id:"food",label:g("menu.products","Produkte")}]:[{id:"all",label:g("menu.all","Alle")},{id:"food",label:g("menu.food","Speisen")},{id:"drink",label:g("menu.drinks","Getraenke")}]).map(i=>`
        <button data-menu-filter="${i.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${a===i.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${i.label}
        </button>
      `).join("")}
    </div>
  `}function Cn(){const e=ha().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${xa.map(t=>{const a=t.id===e,s=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${a?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${a?x("check",`w-4 h-4 ${s}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function Re(e,{poster:t="",objectPosition:a="50% 50%",badge:s=!0}={}){if(!ft(e))return"";const i=String(e.videoUrl||"").trim();if(!i)return"";const r=t?` poster="${n(t)}"`:"";return`<video data-autoplay-video src="${n(i)}"${r} class="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]" style="object-position:${a};" muted loop playsinline autoplay preload="metadata"></video>`+(s?'<div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none z-10"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5 fill-white block"><path d="M8 5v14l11-7z"></path></svg></div>':"")}function at(e,{mode:t="profile",priorityIndex:a=-1}={}){const s=Z(e),i=t==="profile"?ue(e,{index:0}):"",{safeImg:r,fallbackImg:o,imageAttrs:l,lazyAttrs:c}=ae(s,{mode:t,priorityIndex:a,stableKey:i,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),p=fe(e),u=d.activeTab==="menu"?d.userProfile:d.profileView?.profile||d.userProfile,f=Q(u),m=Ct(e,f),b=f?It(e.category):e.category||"",k=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${n(r)}" data-fallback-src="${n(o)}"${c} class="w-full h-full object-cover" style="object-position:${V(e)};" ${l} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${n(e.name||g("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${n(p)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${b?`<span>${n(b)}</span>`:""}
            <span>${n(m)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${x("more-horizontal","w-4 h-4")}
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
        <img src="${n(r)}" data-fallback-src="${n(o)}"${c} class="w-full h-full object-cover" style="object-position:${V(e)};" ${l} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${n(e.name||g("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${n(p)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${b?`<span>${n(b)}</span>`:""}
          <span>${n(m)}</span>
        </div>
        ${k?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${n(k)}</p>`:""}
      </div>
    </div>
  `}function nt(e,{mode:t="profile",variant:a="food",priorityIndex:s=-1}={}){const i=Z(e),r=t==="profile"?ue(e,{index:0}):"",o=a==="drink",{safeImg:l,fallbackImg:c,imageAttrs:p,lazyAttrs:u}=ae(i,{mode:t,priorityIndex:s,stableKey:r,preferredSize:o?"small":"medium",candidateSizes:o?["small","medium"]:["small","medium","large"],variant:o?"grid":"hero"}),f=fe(e),m=d.activeTab==="menu"?d.userProfile:d.profileView?.profile||d.userProfile,b=Q(m),k=Ct(e,b),v=b?It(e.category):e.category||"",S=e.description||"",P=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",w=d.menu.restaurantId||d.profileView?.profile?.restaurantId||d.userProfile.restaurantId||"",I=we(e),F=wt(w,I),A=F?yt(F):{likes:[],comments:[],counts:{likes:0,comments:0}},L=$t(A),$=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${x("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${n(I)}">${n(B(L.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${x("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${n(I)}">${n(B(L.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${P} class="w-full ${o?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${o?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100 relative">
        <img src="${n(l)}" data-fallback-src="${n(c)}"${u} class="w-full h-full object-cover" style="object-position:${V(e)};" ${p} decoding="async" />
        ${Re(e,{poster:l,objectPosition:V(e)})}
      </div>
      ${o?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${n(e.name||g("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${n(f)}</p>
          ${$}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${n(e.name||g("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${n(f)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${v?`<span>${n(v)}</span>`:""}
            <span>${n(k)}</span>
          </div>
          ${S?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${n(S)}</p>`:""}
          ${$}
        </div>
      `}
    </div>
  `}function st(e={}){if(!e?.restaurantId||Q(e))return!1;const t=String(Ve(e)||"").trim().toLowerCase();return t?t==="restaurant"||t==="cafe"||t==="fastfood":se(e)}function Vt(e){const t=e?.restaurantId||d.menu.restaurantId||d.profileView?.profile?.restaurantId||d.userProfile.restaurantId||"",a=we(e),s=wt(t,a),i=s?yt(s):{likes:[],comments:[],counts:{likes:0,comments:0}},r=String(d.user?.uid||"").trim(),o=String(d.user?.handle||"").trim().toLowerCase(),l=!!i.likes?.some(c=>{const p=String(c?.uid||"").trim();if(r&&p&&p===r)return!0;const u=String(c?.handle||"").trim().toLowerCase();return!!o&&!!u&&u===o});return{itemId:a,meta:i,counts:$t(i),isLiked:l}}function ue(e,{index:t=0}={}){const a=String(e?.restaurantId||d.menu.restaurantId||d.profileView?.profile?.restaurantId||d.userProfile.restaurantId||"").trim(),s=String(e?.id||we(e)||"").trim();if(!a||!s)return"";const i=Number(t),r=Number.isFinite(i)?Math.max(0,Math.floor(i)):0;return`menu-detail:${a}:${s}:${r}`}function Pn(e){const t=typeof vt=="function"?vt(e):[],a=Array.isArray(t)?t.filter(Boolean):[];if(a.length)return a;const s=Z(e);return s?[s]:[]}function ne(e){return Jn(e?.cardStyle||"",oe(e?.type||"food"))}function rt(e,{menuItemId:t=""}={}){if(!e)return null;const a=String(t||e.menuItemId||e.itemId||e.productId||"").trim(),s=ft(e),i=String(e.videoUrl||"").trim(),r=String(e.posterUrl||"").trim(),o=Z(e)||e.imageUrl||(s?r:"")||"";return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:o,objectPosition:e.objectPosition||V(e),menuItemId:a,mediaType:s?"video":"image",videoUrl:s?i:"",posterUrl:s?r||o:""}}function C(e=""){return`<div aria-hidden="true" class="${e} bg-slate-100 animate-pulse"></div>`}function jn(e={}){return Ie("focus-carousel-skeleton",{...e,functionName:"renderFocusCarouselSkeleton",source:e?.source||"public-focus"}),`
      <div class="${Oe()} rounded-[2.5rem] p-6 border shadow-sm" data-focus-skeleton="true"${W({skeleton:"focus-carousel-skeleton",source:"public-focus"})} aria-hidden="true">
        <div class="flex items-center justify-between mb-4">
          ${C("h-3 w-24 rounded-full")}
        <div class="flex items-center gap-2">
          ${C("w-9 h-9 rounded-full")}
          ${C("w-9 h-9 rounded-full")}
        </div>
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${C("w-full h-56")}
      </div>
      <div class="mt-4 space-y-2">
        ${C("h-5 w-2/3 rounded-full")}
        ${C("h-4 w-full rounded-full")}
        ${C("h-4 w-3/5 rounded-full")}
      </div>
    </div>
  `}function Fn(e={}){return Ie("testfirst-focus-skeleton",{...e,functionName:"renderTestfirstFocusSkeleton",source:e?.source||"public-focus"}),`
      <div class="pt-2 pb-4" data-focus-skeleton="true"${W({skeleton:"testfirst-focus-skeleton",source:"public-focus"})} aria-hidden="true">
        <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        <div class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col mb-2" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
            ${C("w-full h-full")}
          </div>
          <div class="px-2 py-4 space-y-2">
            ${C("h-5 w-2/3 rounded-full")}
            ${C("h-4 w-full rounded-full")}
            ${C("h-4 w-1/2 rounded-full")}
          </div>
        </div>
      </div>
    </div>
  `}function An(){return`
    <div class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col relative" aria-hidden="true">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        ${C("w-full h-full")}
        ${C("absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90")}
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="mb-1 space-y-2">
          ${C("h-4 w-4/5 rounded-full")}
          ${C("h-3 w-3/5 rounded-full")}
        </div>
        ${C("h-3 w-full rounded-full mb-1")}
        ${C("h-3 w-2/3 rounded-full mb-3")}
        <div class="mt-auto pt-2 flex items-center justify-between">
          ${C("h-4 w-14 rounded-full")}
          ${C("w-8 h-8 rounded-full bg-slate-900/10")}
        </div>
      </div>
    </div>
  `}function Ln(){return`
    <div class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 relative" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;" aria-hidden="true">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${C("w-full h-full")}
        ${C("absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90")}
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div class="min-w-0 flex-1">
            ${C("h-5 w-4/5 rounded-full")}
          </div>
          ${C("h-5 w-14 rounded-full shrink-0")}
        </div>
        ${C("h-4 w-full rounded-full mb-2")}
        ${C("h-4 w-2/3 rounded-full mb-4")}
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div></div>
          <div class="h-11 w-32 rounded-2xl bg-slate-100 animate-pulse"></div>
        </div>
      </div>
    </div>
  `}function Kt(e={}){return Ie("testfirst-menu-skeleton",{...e,functionName:"renderTestfirstMenuSkeleton",source:e?.source||"public-menu"}),`
      <div id="menu-section" class="mt-5" data-menu-skeleton="true"${W({skeleton:"testfirst-menu-skeleton",source:"public-menu"})}>
        <section class="menu-type-block relative" data-menu-type-block="drink">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
            ${Array.from({length:4},()=>An()).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block relative" data-menu-type-block="food">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="food">
          <div class="app-content-inline">
            ${Array.from({length:2},()=>Ln()).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function qt(e="food"){const t=e==="drink";return`
    <div class="w-full ${t?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm" aria-hidden="true">
      <div class="w-full ${t?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        ${C("w-full h-full")}
      </div>
      ${t?`
        <div class="mt-3 flex flex-1 flex-col space-y-2">
          ${C("h-4 w-4/5 rounded-full")}
          ${C("h-3 w-1/2 rounded-full")}
          <div class="mt-2 flex items-center gap-3">
            ${C("h-3 w-10 rounded-full")}
            ${C("h-3 w-10 rounded-full")}
          </div>
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            ${C("h-4 w-3/5 rounded-full")}
            ${C("h-4 w-14 rounded-full")}
          </div>
          ${C("h-3 w-2/5 rounded-full mt-2")}
          ${C("h-3 w-full rounded-full mt-3")}
          ${C("h-3 w-2/3 rounded-full mt-2")}
          <div class="mt-3 flex items-center gap-3">
            ${C("h-3 w-10 rounded-full")}
            ${C("h-3 w-10 rounded-full")}
          </div>
        </div>
      `}
    </div>
  `}function Tn(){return`
      <article class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col"${W({skeleton:"shop-product-card-skeleton",source:"public-menu"})} aria-hidden="true">
        <div class="rounded-[1.5rem] overflow-hidden bg-slate-100" style="aspect-ratio:4 / 5;">
        ${C("w-full h-full")}
      </div>
      <div class="pt-3 flex-1 flex flex-col min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1 space-y-2">
            ${C("h-4 w-full rounded-full")}
            ${C("h-4 w-3/5 rounded-full")}
          </div>
          ${C("h-3 w-10 rounded-full shrink-0")}
        </div>
        ${C("h-3 w-full rounded-full mt-3")}
        ${C("h-3 w-2/3 rounded-full mt-2")}
      </div>
    </article>
  `}function Gt({isShop:e=!1,debugContext:t={}}={}){return Ie(e?"standard-shop-product-skeleton":"standard-menu-skeleton",{...t,functionName:"renderStandardMenuSkeleton",source:t?.source||"public-menu",reason:t?.reason||(e?"shop-products-loading":"menu-loading")}),e?`
        <div class="grid grid-cols-2 gap-4" data-menu-skeleton="true"${W({skeleton:"standard-shop-product-skeleton",source:"public-menu"})}>
          ${Array.from({length:4},()=>Tn()).join("")}
        </div>
      `:`
      <div data-menu-skeleton="true"${W({skeleton:"standard-menu-skeleton",source:"public-menu"})} class="space-y-5">
        <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
        <div class="flex items-center justify-between mb-4">
          ${C("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-4">
            ${Array.from({length:4},()=>qt("drink")).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
        <div class="flex items-center justify-between mb-4">
          ${C("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="food">
          <div class="space-y-4">
            ${Array.from({length:2},()=>qt("food")).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Qt(e,t=[],{mode:a="profile"}={}){const s=e?.restaurantId||"",i=st(e)||Q(e);return!s||!i||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((r,o)=>{const l=r.imageUrl||"",c=String(r.menuItemId||r.id||"").trim(),{safeImg:p,fallbackImg:u,imageAttrs:f,lazyAttrs:m}=ae(l,{mode:a,priorityIndex:o,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:c?`menu-focus:${s}:${c}`:""}),b=String(r.menuItemId||"").trim(),k=a==="profile"&&b?`data-menu-open="${n(b)}" role="button"`:"";return`
            <div ${k} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${k?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${n(p)}" data-fallback-src="${n(u)}"${m} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${r.objectPosition||"50% 50%"};" ${f} decoding="async" />
                ${Re(r,{poster:p,objectPosition:r.objectPosition||"50% 50%",badge:!1})}
                <div class="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${x("sparkles","w-3 h-3 text-amber-500")}
                  <span class="text-[10px] font-black text-slate-900 uppercase tracking-widest pt-[1px]">Tipp</span>
                </div>
              </div>
              <div class="px-2 py-4">
                <h3 class="text-[17px] font-black text-slate-900 leading-tight">${n(r.title||"")}</h3>
                <p class="text-[13px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">${n(r.text||"")}</p>
              </div>
            </div>
          `}).join("")}
      </div>
    </div>
  `}function Wt(e,{mode:t="profile",priorityIndex:a=-1}={}){const s=Z(e),i=t==="profile"?ue(e,{index:0}):"",{safeImg:r,fallbackImg:o,imageAttrs:l,lazyAttrs:c}=ae(s,{mode:t,priorityIndex:a,stableKey:i,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),p=fe(e),u=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",{itemId:f,counts:m,isLiked:b}=Vt(e);return`
    <div ${u} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${n(r)}" data-fallback-src="${n(o)}"${c} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${V(e)};" ${l} decoding="async" />
        ${Re(e,{poster:r,objectPosition:V(e)})}
        <button
          type="button"
          data-menu-card-like="${n(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${b?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${b?"true":"false"}"
        >
          ${x("heart","w-3.5 h-3.5 fill-current opacity-80")}
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
            ${x("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${n(f)}">${n(B(m.likes))}</span>
          <span data-menu-comment-count="${n(f)}">${n(B(m.comments))}</span>
        </div>
      </div>
    </div>
  `}function _n(e,t="profile"){if(t!=="profile")return"";const a=Ht(e);return a.type==="link"&&a.url?`data-menu-special-link="${n(a.url)}" role="button" tabindex="0"`:a.type==="product"&&a.productId?`data-menu-open="${n(a.productId)}" role="button"`:`data-menu-open="${n(e.id)}" role="button"`}function it(e,{mode:t="profile",size:a="default",priorityIndex:s=-1}={}){const i=Z(e),r=t==="profile"?ue(e,{index:0}):"",o=a==="food",{safeImg:l,fallbackImg:c,imageAttrs:p,lazyAttrs:u}=ae(i,{mode:t,priorityIndex:s,stableKey:r,preferredSize:o?"medium":"small",candidateSizes:o?["small","medium","large"]:["small","medium"],variant:o?"hero":"grid"}),f=_n(e,t),m=String(e.category||"Special").trim()||"Special",b=n(String(e.name||"Special")).replace(/\n/g,"<br>");return a==="food"?`
      <div ${f} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${n(l)}" data-fallback-src="${n(c)}"${u} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${V(e)};" ${p} decoding="async" />
        ${Re(e,{poster:l,objectPosition:V(e)})}
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${x("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${n(m)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${b}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${f} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${n(l)}" data-fallback-src="${n(c)}"${u} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${V(e)};" ${p} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${x("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${n(m)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${b}</h4>
        </div>
      </div>
    </div>
  `}function Yt(e,{mode:t="profile",priorityIndex:a=-1}={}){const s=fe(e),i=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",r=Pn(e),l=(r.length?r:[Z(e)||""]).filter(Boolean),c=l.length?l.slice(0,12):[""],p=c.length>1,{itemId:u,counts:f,isLiked:m}=Vt(e),b=B(Math.max(0,Number(f.likes)||0)),k=B(Math.max(0,Number(f.comments)||0));return`
    <div ${i} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${p?`
          <div
            data-menu-card-gallery-track="${n(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${c.map((v,S)=>{const P=t==="profile"?ue(e,{index:S}):"",w=ae(v||"",{mode:t,priorityIndex:a,slideIndex:S,stableKey:P,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),I=S>0,F=I?N:w.safeImg,A=I?N:w.fallbackImg,L=I?w.loadingAttrs:w.imageAttrs,$=I?"":w.lazyAttrs||"",_=I?` data-menu-card-deferred-src="${n(w.safeImg)}"
                    data-menu-card-deferred-fallback="${n(w.fallbackImg)}"
                    ${w.srcsetValue?`data-menu-card-deferred-srcset="${n(w.srcsetValue)}"`:""}
                    ${w.sizesValue?`data-menu-card-deferred-sizes="${n(w.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${S}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${n(F)}" data-fallback-src="${n(A)}"${$}${_} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${V(e)};" ${L} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${c.map((v,S)=>{const P=t==="profile"?ue(e,{index:S}):"",{safeImg:w,fallbackImg:I,imageAttrs:F,lazyAttrs:A}=ae(v||"",{mode:t,priorityIndex:a,slideIndex:S,stableKey:P,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${n(w)}" data-fallback-src="${n(I)}"${A} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${V(e)};" ${F} decoding="async" />
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
          ${x("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${p?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${c.map((v,S)=>`
              <div
                data-menu-card-gallery-dot="${n(e.id)}"
                data-menu-card-gallery-index="${S}"
                class="${S===0?"w-4 h-1.5 bg-white rounded-full shadow-sm":"w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm"}"
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
          <span class="text-[17px] font-black text-slate-900 whitespace-nowrap">${n(s)}</span>
        </div>
        <p class="text-[14px] text-slate-500 line-clamp-2 leading-relaxed mb-4" style="margin-bottom:16px;">${n(e.description||"")}</p>
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div class="flex items-center gap-2">
            <div class="hidden">
              <span data-menu-like-count="${n(u)}">${n(b)}</span>
              <span data-menu-comment-count="${n(u)}">${n(k)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${n(g("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${x("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function zn(e,t,{mode:a="profile",publicMenuSurfaceState:s=null,focusFallbackHtml:i=""}={}){const r=ze(Array.isArray(t)?t:[]),o=String(e?.restaurantId||"").trim(),l=a==="admin"||_a(o),c=s?.focus?.canRenderFocus?{items:Array.isArray(s.focus.items)?s.focus.items:[],enabled:!0}:o&&l?ye(o):{items:[],enabled:!1},p=c.enabled?(Array.isArray(c.items)?c.items:[]).map(h=>rt({...h,objectPosition:le(h)})):[],u=r.filter(h=>ne(h)==="testfirst_focus"&&!et(h)).map(h=>rt(h,{menuItemId:h.id||""})).filter(Boolean),f=new Set,m=[...p,...u].filter(h=>{const j=String(h.menuItemId||h.id||`${h.title}|${h.text}|${h.imageUrl}`);return!j||f.has(j)?!1:(f.add(j),!0)}),b=r.filter(h=>!et(h)),k=b.filter(h=>ne(h)!=="testfirst_focus"),v=k.length?k:b,S=k.length?m:[],P=v.filter(h=>ge(h)==="drink"),w=v.filter(h=>ge(h)!=="drink"),I=(h=[])=>{const j=[],T=[];return h.forEach(U=>{const M=ne(U);M==="testfirst_food"||M==="testfirst_special"&&tt(U)==="food"?T.push(U):j.push(U)}),{gridItems:j,foodItems:T}},F=(h,j=-1)=>ne(h)==="testfirst_special"?it(h,{mode:a,priorityIndex:j}):Wt(h,{mode:a,priorityIndex:j});let A=0;const L=()=>{const h=A;return A+=1,h},$=new Set,_=(h,j)=>!j.gridItems.length&&!j.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${n(h)}">
        ${j.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${n(h)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${ce(j.gridItems,T=>F(T,L()),$)}
            </div>
          </div>
        `:""}
        ${j.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${n(h)}">
            <div class="app-content-inline">
              ${ce(j.foodItems,T=>{const U=ne(T),M=L();return U==="testfirst_special"?it(T,{mode:a,size:"food",priorityIndex:M}):Yt(T,{mode:a,priorityIndex:M})},$)}
            </div>
          </div>
        `:""}
      </section>
    `,z=I(P),R=I(w);return`
    <div>
      ${Qt(e,S,{mode:a})||i}
      <div id="menu-section" class="mt-5">
        ${_("drink",z)}
        ${_("food",R)}
      </div>
    </div>
  `}function Zt(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:s=null,priorityOffset:i=0}={}){return e.length?a?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${ce(e,(r,o)=>Wt(r,{mode:t,priorityIndex:i+o}),s)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${ce(e,(r,o)=>nt(r,{mode:t,variant:"drink",priorityIndex:i+o}),s)}
    </div>
  `:""}function Jt(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:s=null,priorityOffset:i=0}={}){return e.length?a?`
      <div>
        ${ce(e,(r,o)=>ne(r)==="testfirst_special"&&tt(r)==="food"?it(r,{mode:t,size:"food",priorityIndex:i+o}):Yt(r,{mode:t,priorityIndex:i+o}),s)}
      </div>
    `:`
    <div class="space-y-4">
      ${ce(e,(r,o)=>nt(r,{mode:t,variant:"food",priorityIndex:i+o}),s)}
    </div>
  `:""}function Xt(e,{mode:t="profile"}={}){if(t==="admin"){const a=String(d?.menu?.filter||"all").trim().toLowerCase(),s=Q(d.userProfile),i=g("menu.products","Produkte"),r=e.filter(u=>oe(u?.type)==="drink"),o=e.filter(u=>oe(u?.type)!=="drink"),l=(u,f,{addType:m=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${n(u)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${n(u)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(B(f.length))} Eintraege</p>
          </div>
          ${m?`
            <button type="button" data-menu-add-${n(m)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${x("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${f.length?`<div class="space-y-3">${f.map(b=>at(b,{mode:"admin"})).join("")}</div>`:(Se({functionName:"renderMenuList.adminSection",items:f,rawItems:f,filteredItems:f,renderDecision:"admin-section-no-products",source:"admin-menu"}),`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300"${W({source:"admin-menu:no-products"})}>${n(g("menu.noProducts","Keine Produkte"))}</div>`)}
      </div>
    `;if(s)return l(i,e,{addType:"food"});const c=[{title:g("menu.drinks","Getraenke"),list:r,addType:"drink"},{title:g("menu.food","Speisen"),list:o,addType:"food"}];if(a==="all")return`
        <div>
          ${c.map(u=>l(u.title,u.list,{addType:u.addType})).join("")}
        </div>
      `;const p=c.filter(u=>u.list.length>0);return p.length?`
      <div>
        ${p.map(u=>l(u.title,u.list,{addType:u.addType})).join("")}
      </div>
    `:a==="drink"?l(g("menu.drinks","Getraenke"),[],{addType:"drink"}):a==="food"?l(g("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((a,s)=>at(a,{mode:t,priorityIndex:s})).join("")}
    </div>
  `:(Se({functionName:"renderMenuList",items:e,rawItems:e,filteredItems:e,renderDecision:"menu-list-no-products",source:t}),`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]"${W({source:`${t}:no-products`})}>
        ${n(g("menu.noProducts","Keine Produkte"))}
      </div>
    `)}function ot(e,{variant:t="focus",suppressLoading:a=!1}={}){if(!e)return"";const{items:s,enabled:i,loading:r}=ye(e,{includeInactive:!0}),o=B(s.length),l=String(t||"").trim().toLowerCase()==="travel-offers",c=l?"Ofertat":"Sot ne Fokus",p=l?"Oferta":"Highlights",u=l?"Im Travel und Profil sichtbar":"Im Profil sichtbar",f=l?"Ofertat werden geladen...":g("focus.loading","Fokus wird geladen..."),m=l?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${n(c)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${n(p)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(o)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${x("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${l?"Oferta anzeigen":"Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${n(u)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${i?"checked":""} />
      </label>

      ${s.length?`
        <div class="space-y-3">
          ${s.map(b=>{const k=E(b.imageUrl||"","thumb"),v=O(k)?N:k,S=b.active!==!1?"Aktiv":"Inaktiv",P=b.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(v)}" class="w-full h-full object-cover" style="object-position:${le(b)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(b.title||"Sot ne Fokus")}</p>
                  ${b.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(b.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${P}">${S}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${n(b.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${n(b.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:r&&!a?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(f)}</div>
      `:r?"":`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${n(m)}</div>
      `}
    </div>
  `}function ea(e={}){if(!e?.restaurantId)return!1;const t=String(Ve(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)||t==="ecommerce"||Q(e)?!1:se(e)||["restaurant","cafe","coffee","fastfood","food"].includes(t)||!t}function Rn(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Freigegeben",className:"text-emerald-600"}:t==="rejected"?{label:"Abgelehnt",className:"text-rose-600"}:{label:"Wartet auf Heart",className:"text-amber-600"}}function Un(e,t){if(!t||!ea(e))return"";const{items:a,loading:s}=$a(t,{includeInactive:!0}),i=B(a.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(i)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${x("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${a.length?`
        <div class="space-y-3">
          ${a.map(r=>{const o=E(r.imageUrl||"","thumb"),l=O(o)?N:o,c=Rn(r),p=r.category||"RESTAURANT",u=r.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(l)}" class="w-full h-full object-cover" style="object-position:${le(r)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(r.title||"Ad")}</p>
                  ${r.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(r.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${n(p)} · ${n(u)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${c.className}">${n(c.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-ad-edit="${n(r.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-ad-delete="${n(r.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:s?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ads werden geladen...</div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Ads</div>
      `}
    </div>
  `}function lt(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function Mn(e={}){const t=String(e?.restaurantId||"").trim(),a=t?pe(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{},...t?{restaurantId:t}:{}}}function dt(e={}){return e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{}}function En(e={}){const t=dt(e);return[...lt(t.productIds),...lt(e.shoppingLandingCardProductIds),...lt(e.shoppingLandingProductIds)].filter(Boolean)}function ct(e={}){return!e||typeof e!="object"?{}:Object.entries(e).reduce((t,[a,s])=>{const i=String(a||"").trim(),r=String(s||"").trim();return i&&r&&(t[i]=r),t},{})}function Bn(e={}){const t=dt(e);return{...ct(e.shoppingLandingProductImageOverrides),...ct(t.productImageOverrides)}}function Nn(e=""){const t=String(e||"").trim(),a=d.shoppingLandingCardEditor&&typeof d.shoppingLandingCardEditor=="object"?d.shoppingLandingCardEditor:{},s=String(a.restaurantId||"").trim();return s&&s!==t?{}:a}function Dn(e){return e?typeof e=="string"?e.trim():typeof e!="object"?String(e||"").trim():String(e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||"").trim():""}function Hn(e={}){const a=[Z(e),...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(Dn).filter(Boolean);return a.filter((s,i)=>a.indexOf(s)===i)}function On(e={},t={},a={}){const s=String(e?.id||e?.productId||e?.menuItemId||"").trim();if(!s)return null;const i=Hn(e).map(u=>({rawUrl:u,imageUrl:E(u,"thumb")})).filter(u=>u.rawUrl&&!O(u.imageUrl)),r=i[0]?.rawUrl||"",o=String(t?.[s]||"").trim(),l=String(a?.[s]||"").trim(),c=l||o||r,p=c?E(c,"thumb"):"";return{id:s,name:String(e.name||e.title||"Produkt").trim(),price:fe(e),imageUrl:p&&!O(p)?p:"",defaultImageRaw:r,cardImageUrl:o,previewImageUrl:l,imageCandidates:i,objectPosition:V(e)}}function Vn(e={},t="",a=[]){if(!t||!Q(e))return"";const s=Mn(e),i=dt(s),r=Nn(t),o=r.saving===!0,l=String(r.status||"").trim(),c=/fehl|error|nicht|nuk|kein/i.test(l),p=String(i.imageUrl||s.shoppingLandingCardImageUrl||s.shoppingLandingImageUrl||"").trim(),u=String(s.logoUrl||s.logo||s.logoURL||s.avatar||e.avatar||"").trim(),f=String(r.imageUrlDraft??p).trim(),m=String(r.imagePreview||f||u||"").trim(),b=m?E(m,"large"):N,k=String(r.titleDraft??(i.title||s.shoppingLandingCardTitle||e.name||"")).trim(),v=r.active!==void 0?r.active!==!1:i.active!==!1&&s.shoppingLandingCardEnabled!==!1,S=En(s),P=Array.isArray(r.productIds)?r.productIds.map($=>String($||"").trim()).filter(Boolean):null,w=new Set(P||S),I={...Bn(s),...ct(r.productImageOverrides)},F=r.productImagePreviews&&typeof r.productImagePreviews=="object"?r.productImagePreviews:{},A=(Array.isArray(a)?a:[]).filter($=>$&&String($.id||"").trim()&&$.hidden!==!0&&$.available!==!1).map($=>On($,I,F)).filter(Boolean),L=w.size?`${B(w.size)} ausgewaehlt`:"Keine Auswahl = alle Produkte";return`
    <div data-shopping-landing-card-editor="${n(t)}" class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Landing Card</span>
          <h3 class="text-xl font-black italic tracking-tighter">Shopping Card</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(L)}</p>
        </div>
        <button type="button" id="shoppingLandingImageTrigger" class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95" aria-label="Bild hochladen">
          ${x("plus","w-4 h-4")}
        </button>
      </div>

      <input id="shoppingLandingImageInput" type="file" accept="image/*" class="hidden" />
      <input id="shoppingLandingImageUrl" type="hidden" value="${n(f)}" />

      <div class="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-4">
        <img src="${n(b||N)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div class="absolute inset-x-0 top-0 h-16 pointer-events-none" style="background:linear-gradient(to bottom, rgba(255,255,255,0.7), transparent);"></div>
        <div class="absolute left-4 bottom-4 right-4">
          <span class="inline-flex max-w-full truncate text-[10px] uppercase tracking-wider font-extrabold text-slate-800 bg-white backdrop-blur-sm py-1 px-2.5 rounded-full" style="background:rgba(255,255,255,0.8);">
            ${n(k||"Shop Picks")}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label for="shoppingLandingTitleInput" class="text-[10px] font-black text-slate-400 uppercase ml-2">Titel</label>
          <input id="shoppingLandingTitleInput" type="text" value="${n(k)}" placeholder="Summer Picks" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-amber-100" />
        </div>

        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">Shopping-Tab anzeigen</p>
            <p class="text-[10px] font-bold text-slate-400">Diese Card erscheint im Tab Shopping.</p>
          </div>
          <input id="shoppingLandingActiveToggle" type="checkbox" class="w-5 h-5 accent-amber-500" style="accent-color:#f97316;" ${v?"checked":""} />
        </label>

        <div class="rounded-[1.8rem] border border-slate-100 bg-slate-50 p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produkte</p>
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${n(B(A.length))}</span>
          </div>
          ${A.length?`
            <div class="grid grid-cols-1 gap-2">
              ${A.map($=>{const _=w.has($.id),z=$.imageUrl||N,R=String($.defaultImageRaw||$.imageCandidates[0]?.rawUrl||"").trim(),h=String($.cardImageUrl||"").trim(),j=String($.previewImageUrl||"").trim(),T=!!(j||h&&h!==R),U=j||(h&&!$.imageCandidates.some(M=>M.rawUrl===h)?h:"");return`
                  <div class="rounded-2xl bg-white border border-slate-100 p-3">
                    <label class="flex items-center gap-3">
                      <input type="checkbox" data-shopping-landing-product="${n($.id)}" class="w-4 h-4 accent-amber-500" style="accent-color:#f97316;" ${_?"checked":""} />
                      <span class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src="${n(z)}" class="w-full h-full object-cover" style="object-position:${n($.objectPosition||"50% 50%")};" loading="lazy" decoding="async" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-xs font-black text-slate-900 truncate">${n($.name)}</span>
                        ${$.price?`<span class="block text-[10px] font-bold text-slate-400 mt-0.5">${n($.price)}</span>`:""}
                      </span>
                    </label>
                    ${_?`
                      <div class="mt-3 pt-3 border-t border-slate-100">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Card-Bild</span>
                          <div class="flex items-center gap-2">
                            ${T?`
                              <button type="button" data-shopping-landing-product-image-reset="${n($.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 active:scale-95">
                                Standard
                              </button>
                            `:""}
                            <button type="button" data-shopping-landing-product-image-upload="${n($.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest active:scale-95">
                              Upload
                            </button>
                            <input type="file" accept="image/*" data-shopping-landing-product-image-input="${n($.id)}" class="hidden" />
                          </div>
                        </div>
                        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                          ${$.imageCandidates.map((M,H)=>{const q=H===0,G=j?!1:q?!T:h===M.rawUrl;return`
                              <label class="shrink-0 w-16">
                                <input type="radio" name="shoppingLandingProductImage_${n($.id)}" data-shopping-landing-product-image-choice="${n($.id)}" value="${q?"":n(M.rawUrl)}" class="hidden" ${G?"checked":""} />
                                <span class="block h-16 rounded-2xl overflow-hidden border ${G?"border-slate-900":"border-slate-100"} bg-slate-100">
                                  <img src="${n(M.imageUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </span>
                                <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">${H+1}</span>
                              </label>
                            `}).join("")}
                          ${U?`
                            <label class="shrink-0 w-16">
                              <input type="radio" name="shoppingLandingProductImage_${n($.id)}" data-shopping-landing-product-image-choice="${n($.id)}" value="${n(U)}" class="hidden" checked />
                              <span class="block h-16 rounded-2xl overflow-hidden border border-slate-900 bg-slate-100">
                                <img src="${n(E(U,"thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
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

        ${l?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${c?"text-rose-500":"text-slate-500"}">${n(l)}</div>`:""}

        <button id="shoppingLandingSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${o?"disabled":""}>
          ${o?"Speichern...":"Landing Card speichern"}
        </button>
      </div>
    </div>
  `}function Kn(e){if(!st(e)||!jt(e))return"";const a=ze((d.menu.items||[]).filter(s=>ne(s)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(B(a.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${x("plus","w-4 h-4")}
        </button>
      </div>
      ${a.length?`
        <div class="space-y-3">
          ${a.map(s=>{const i=E(Z(s),"thumb"),r=O(i)?N:i,o=Ht(s),l=o.type==="link"?"Link":o.type==="product"?"Produkt-Modal":"Diese Karte",c=tt(s)==="food"?"Food-Size":"Normal",p=La(ge(s));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(r)}" class="w-full h-full object-cover" style="object-position:${V(s)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(s.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${n(p)}</span>
                    <span>${n(c)}</span>
                    <span>${n(l)}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-menu-edit="${n(s.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-menu-delete="${n(s.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Special-Karten</div>
      `}
    </div>
  `}function ta(e,{restaurantId:t="",suppressLoading:a=!1,allowAutoEnsure:s=!0,requirePublicMenuTruth:i=!0}={}){const r=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!r||!se(e))return"";const o=he(d,{profile:e,routePayload:d?.profileView?.routePayload,webDirectEntry:d?.__webDirectEntry,restaurantId:r});if(i&&o.menu.status!=="ready")return"";const l=!i||o.focus.canRenderFocus;if(s&&!d.focus.loading&&!l&&ve(Pt(e,r)),i&&!l)return"";const{items:c,loading:p}=l?{items:Array.isArray(o.focus.items)?o.focus.items:[],loading:o.focus.loading}:ye(r);if(!(l?!0:ye(r).enabled)||!c.length&&!p||a&&p&&!c.length)return"";if(p&&!c.length)return`
      <div class="${Oe()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(g("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const f=ka(c),m=c[f]||c[0],{safeImg:b,fallbackImg:k,imageAttrs:v,lazyAttrs:S}=ae(m.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:m?.id?`focus-carousel:${r}:${String(m.id)}`:""}),P=m.text||"";return`
    <div id="focusCarousel" class="${Oe()} rounded-[2.5rem] p-6 border shadow-sm">
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
        ${ft(m)&&String(m.videoUrl||"").trim()?`
          <video data-focus-media="video" data-focus-video data-autoplay-video src="${n(String(m.videoUrl||"").trim())}" ${b?`poster="${n(b)}"`:""} class="w-full h-56 object-cover" style="object-position:${le(m)};" muted loop playsinline autoplay preload="metadata"></video>
          <div class="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-white block"><path d="M8 5v14l11-7z"></path></svg>
          </div>
        `:`
          <img data-focus-media="image" data-focus-image src="${n(b)}" data-fallback-src="${n(k)}"${S} class="w-full h-56 object-cover" style="object-position:${le(m)};" ${v} decoding="async" />
        `}
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${n(m.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${P?"":"hidden"}">${n(P)}</p>
      </div>
      ${c.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${c.map((I,F)=>`
            <button type="button" data-focus-dot="${F}" class="w-2.5 h-2.5 rounded-full ${F===f?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function qn(e,t=220){const a=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${a}`}function aa({label:e,url:t,caption:a}){if(!t)return"";const s=qn(t,240);return`
    <button type="button" data-copy-url="${n(t)}" data-copy-label="${n(e)}" class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-left active:scale-[0.98] transition-transform">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${n(s)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${n(e)}</p>
        ${a?`<p class="text-[10px] font-bold text-slate-400 mt-1">${n(a)}</p>`:""}
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2">Tippen zum Kopieren</p>
      </div>
    </button>
  `}function Gn({profile:e,restaurantId:t,catalogLabel:a}){if(!t||!se(e))return"";if(typeof ht=="function"){const r=$e?$e(t):null;(!r||r.sameRestaurant!==!0||!r.loading&&!r.loaded&&!r.error)&&ht(e)}const s=typeof $e=="function"?$e(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},i=(s.tables||[]).map(r=>{const o=Sa("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:r});return aa({label:`Tisch ${r}`,url:o,caption:`${a} fuer Tisch ${r}`})}).join("");return`
    <div class="mt-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Tisch QR</span>
          <h3 class="text-xl font-black italic tracking-tighter">Tische</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gib an, wie viele Tische du hast. Bereits erzeugte Tisch-QR bleiben dauerhaft unter denselben Links.</p>
        </div>
        <label class="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
          <input id="tableQrEnabledToggle" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${s.enabled!==!1?"checked":""} />
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Aktiv</span>
        </label>
      </div>
      <div class="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
        <div class="flex-1">
          <label for="tableQrCountInput" class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Anzahl Tische</label>
          <input id="tableQrCountInput" type="number" min="0" max="200" step="1" inputmode="numeric" value="${n(String(s.count||0))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button type="button" data-table-qr-save="true" class="h-14 px-6 rounded-[1.6rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-200/60 active:scale-95" ${s.saving?"disabled":""}>
          ${s.saving?"Speichern...":"Tische speichern"}
        </button>
      </div>
      ${s.loading?'<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tisch-QR wird geladen...</p>':""}
      ${s.status?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">${n(s.status)}</p>`:""}
      ${s.error?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(s.error)}</p>`:""}
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
  `}function Qn(){const e=d.userProfile,t=e.restaurantId||"",a=String(d.user?.uid||"").trim(),s=String(d.__authBootstrapInFlightUid||"").trim(),i=!t&&!!a&&(!!d.__authProfileLoadPromise||s===a),r=Pe(e),o=se(e),l=d.profileView?.profile?.restaurantId?d.profileView.profile:null,c=la()&&!!l?.restaurantId&&se(l),p=Q(e),u=Aa(fa(e)),f=t?pe(t):null,m=f?.name||f?.restaurantName||e.name||"Business",b=t&&d.menu.restaurantId===t,k=String(d.menu.source||"").trim().toLowerCase(),v=!!b&&k==="collection",S=!!b&&k==="collection"&&d.menu.loading,P=!!t&&(S||!v),w=p?"all":d.menu.filter,I=v?Bt(d.menu.items,{filter:w,query:d.menu.query}):[],A=jt(e)?I:I.filter(_=>!Ma(_)),L=ze(A),$=B(L.length);if(t&&r){Na(e);const _=String(d.focus?.truthSource||"").trim().toLowerCase();return!d.focus.loading&&(d.focus.restaurantId!==t||_!=="public-menu")&&ve(e),an(e)}return t&&o&&!v&&!S&&ua(e),t&&o&&!d.focus.loading&&d.focus.restaurantId!==t&&ve(e),t&&ea(e)&&pa(e),o?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${u}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(m)}</p>
        </div>
      </div>

      ${t?`
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${n($)}</p>
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

      ${t?ot(t):""}
      ${t?Un(e,t):""}
      ${t?Vn(e,t,v?d.menu.items:[]):""}
      ${t&&v?Kn(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${x("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${n(d.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${Ot()}

        ${P?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(g("menu.loading",`${u} wird geladen...`,{label:u}))}</div>`:Xt(L,{mode:"admin"})}
        ${d.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${n(d.menu.error)}</div>`:""}
        ${Gn({profile:e,restaurantId:t,catalogLabel:u})}
      `:""}

    </div>
  `:c?Ue(l):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${x("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${u}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function Ue(e,{mode:t="profile",allowAutoEnsure:a=!0}={}){const s=d?.profileView?.routePayload&&typeof d.profileView.routePayload=="object"?d.profileView.routePayload:null,i=d?.__webDirectEntry&&typeof d.__webDirectEntry=="object"&&d.__webDirectEntry.active===!0?d.__webDirectEntry:null;let r=he(d,{profile:e,routePayload:s,webDirectEntry:i});const o=r.restaurantId||Ta(e,s);if(!o)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${n(g("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const l=Pt(e,o),c=Q(l),p=se(l)&&!c;p&&(r=he(d,{profile:l,routePayload:s,webDirectEntry:i,restaurantId:o}));const u=String(i?.canonicalRestaurantId||i?.restaurantId||"").trim(),f=new Set(r.targetIds),m=r.menu.status==="ready",b=r.focus.canRenderFocus,k=m&&p,v=r.focus.matches===!0&&r.focus.loading===!0,P=String(d?.profileView?.menuAccessSource||i?.menuAccessSource||s?.menuAccessSource||"").trim().toLowerCase()==="qr",w=i?.active===!0&&i?.webPriority===!0&&i?.menuFirst===!0&&String(d?.activeTab||"").trim().toLowerCase()==="profile"&&String(d?.profileTopTab||"").trim().toLowerCase()==="menu"&&(u===o||f.has(o)),I=w&&!P,F=["ready","empty","error"].includes(r.menu.status),A=w&&F,L=w&&(!k||r.menu.status!=="ready"),$=!k||r.focus.settled===!0||r.focus.confirmedEmpty===!0||r.menu.status!=="ready";a&&!A&&!F&&ca(l),a&&!L&&!$&&!v&&m&&(!I||F)&&ve(l);const z=r.menu.canRenderItems?ze(Bt(r.menu.items,{filter:"all",query:""})).filter(Y=>!et(Y)):[],R=r.menu.error||"",h=Xn(r.menu,z),{hasItems:j,hasError:T,isLoading:U,shouldRenderNoProducts:M}=h;Pa({profile:l,routePayload:s,surface:r,decision:h});const H={profile:l,routePayload:s,surface:r,decision:h,rawItems:r.menu.items,items:z,filteredItems:z,source:"public-menu"},q=Fa(r,z),G=z.filter(Y=>ge(Y)==="drink"),re=z.filter(Y=>ge(Y)!=="drink"),ut=0,J=G.length,ie=st(e),Me=ie||c,Ee=new Set;j&&o&&(ga(z,o),Ra(z,o));const Be=o&&b?(Array.isArray(r.focus.items)?r.focus.items:[]).map(Y=>rt({...Y,objectPosition:le(Y)})).filter(Boolean):[],Ne=r.focus.status==="empty"||r.focus.status==="error",me=p&&!b&&!Ne&&r.menu.status!=="empty"&&r.menu.status!=="error",be=Be.length?Qt(l,Be,{mode:t}):me?Fn({...H,reason:"focus-truth-pending"}):"",X=Me?be:ta(l,{restaurantId:o,suppressLoading:!0,allowAutoEnsure:m&&(!I||F),requirePublicMenuTruth:!0})||(me?jn({...H,reason:"focus-truth-pending"}):"");return ie?`
      <div class="app-main-content-safe"${q}>
        ${U?`
          ${be}
          ${Kt({...H,reason:"menu-loading"})}
        `:`
          ${j?zn(l,z,{mode:t,publicMenuSurfaceState:r,focusFallbackHtml:be}):T?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(g("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:M?(Se({...H,functionName:"renderProfileMenuView",renderDecision:"testfirst-no-products"}),`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300"${W({source:"public-menu:no-products"})}>${n(g("menu.noProducts","Keine Produkte"))}</div>`):Kt({...H,reason:"menu-not-confirmed-empty"})}
          ${R?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(R)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5"${q}>
      ${X}
      ${U?`
        ${Gt({isShop:c,debugContext:{...H,reason:"menu-loading"}})}
      `:`
        ${j?`
          ${c?`
            ${ba(z,{profile:e})}
          `:`
            ${G.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${n(g("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${Zt(G,{mode:t,useTestfirstCardUi:ie,seenCategories:Ee,priorityOffset:ut})}
                </div>
              </section>
            `:""}
            ${re.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${n(g("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${Jt(re,{mode:t,useTestfirstCardUi:ie,seenCategories:Ee,priorityOffset:J})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${T?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                ${n(g("menu.loadError","Menu konnte nicht geladen werden"))}
              </div>
            </div>
          `:M?`
            ${Se({...H,functionName:"renderProfileMenuView",renderDecision:c?"shop-no-products":"standard-no-products"}),`<div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm"${W({source:"public-menu:no-products"})}>
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${n(g("menu.noProducts","Keine Produkte"))}
              </div>
            </div>`}
          `:`
            ${Gt({isShop:c,debugContext:{...H,reason:"menu-not-confirmed-empty"}})}
          `}
        `}
        ${R?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(R)}</div>`:""}
      `}
    </div>
  `}function Wn(){const e=d.userProfile,t=oa(e),a=t?d.businessPosts:d.userPosts,s=String(d.user?.uid||e?.uid||"").trim(),i=String(e?.restaurantId||"").trim(),r=String(d.__userPostsLoadingUid||"").trim(),o=String(d.__businessPostsLoadingRestaurantId||"").trim(),l=String(d.__authBootstrapInFlightUid||"").trim(),c=!!s&&r===s,p=!!i&&o===i,u=!!s&&l===s,f=t?p||u&&!a.length:c||u&&!a.length,m=String(e.handle||gt(e.name||"user")).replace(/^@/,""),k=n(e.bio||"").replace(/\n/g,"<br>")||n(g("profile.noBio","Noch keine Bio.")),v=Ae(e),S=v==="menu",P=v==="checkins",w=a,I=E(e.avatar,"avatar"),F=He(t),A=Ze(e);return`
    <div class="app-main-content-safe">
      ${A==="profile"||A==="menu"?`
      <div class="app-content-inline pb-2 ${t?"pt-2":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${t?Et(e,{mode:"self",avatarUrl:I,avatarFit:F,followersLabel:B(e.followers),bioHtml:k}):`
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${n(I)}" data-fallback-src="${n(N)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${F} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${x("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(B(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(g("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(B(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(g("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${n(m)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${k}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(e.location||"-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" data-upload-intent="chooser" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${x("plus","w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${x("settings","w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
        `}
      </div>

      ${Je(e)}
      ${Xe(e)}

      ${S?`
        ${Pe(e)?Tt(e):Ue(e)}
      `:P?`
        ${Qe()}
      `:`
        ${f&&!w.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(g("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${d.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${Ge(w,d.profileViewMode)}
          </div>
          ${v==="posts"?`
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
        ${A==="cart"?mt(e):A==="favorites"?bt(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:Ft,renderProfilePostsFancy:Ge,renderProfileCheckins:Qe,renderProfileTabs:Je,renderProfileViewControls:Xe,renderPublicProfileView:xn,renderMenuFilterRow:Ot,renderMenuLayoutSection:Cn,renderMenuItemCard:at,renderMenuItemCardStacked:nt,renderMenuDrinkGrid:Zt,renderMenuFoodList:Jt,renderMenuList:Xt,renderFocusAdminSection:ot,renderFocusCarousel:ta,renderMenuQrCard:aa,renderMenuAdminView:Qn,renderProfileMenuView:Ue,renderProfileView:Wn}}export{ls as createProfileMenuFocusRenderController};
