import{e as be,f as qa,g as Ga,t as Qa,h as Wa,j as Me,a as Ya}from"../entry/social-app.js";import"./startup-route-runtime-context-6Co7bthZ.js";import"./vendor-firebase-V03pMX6J.js";function es(v={}){const d=v.state,tn=v.resolvePostCountsFn,a=v.escapeHtmlFn,M=v.getOptimizedImageUrlFn,x=v.iconFn,nn=v.isLocalBusinessProfileFn,an=typeof v.isCeoUserFn=="function"?v.isCeoUserFn:(()=>!1),ct=v.normalizeHandleFn,Ue=v.logoFitClassFn,U=v.formatCountFn,ut=v.renderProfileShopCartViewFn,pt=v.renderProfileShopFavoritesViewFn,sn=typeof v.ensurePostsDataForProfileFn=="function"?v.ensurePostsDataForProfileFn:(()=>{}),rn=v.ensureMenuDataForProfileFn,on=typeof v.ensureEditorMenuDataForProfileFn=="function"?v.ensureEditorMenuDataForProfileFn:(()=>{}),he=v.ensureFocusDataForProfileFn,ln=typeof v.ensureAdsDataForProfileFn=="function"?v.ensureAdsDataForProfileFn:(()=>{}),ft=v.ensureTableQrStateForProfileFn,Q=v.isShopCatalogProfileFn,dn=v.getBusinessCatalogLabelFn,re=v.normalizeMenuTypeFn,cn=v.primeMenuItemCountsFn,un=typeof v.hydrateMenuCardViewerLikesFn=="function"?v.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),pn=v.renderShopProductListFn,fn=v.getMenuLayoutThemeFn,gn=v.menuLayoutColors,X=v.resolveMenuItemHeroFn,q=v.isPlaceholderUrlFn,D=v.placeholderImage,mn=v.getFirebaseStorageUrlFn,bn=v.isDirectImageUrlFn,gt=v.formatPriceFn,hn=typeof v.resolveCurrencyCodeForMenuItemFn=="function"?v.resolveCurrencyCodeForMenuItemFn:(()=>""),mt=v.getMenuItemImagesFn,W=v.getMenuItemObjectPositionFn,xe=v.getMenuItemSocialIdFn,bt=v.menuItemMetaKeyFn,ht=v.ensureMenuItemMetaFn,xt=v.resolveMenuItemCountsFn,ve=v.getFocusStateForRestaurantFn,xn=typeof v.getAdsStateForRestaurantFn=="function"?v.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),we=v.getTableQrStateForRestaurantFn,de=v.getFocusItemObjectPositionFn,Be=v.getFocusCardClassFn,vn=v.getFocusIndexFn,se=v.isRestaurantCafeProfileFn,Ne=typeof v.getBusinessProfileTypeFn=="function"?v.getBusinessProfileTypeFn:(()=>""),ce=v.getRestaurantMetaByIdFn,wn=v.buildUrlFn,yn=v.normalizeSearchKeyFn,$n=v.normalizeFollowHandleFn,ee={key:"",inFlightKey:""},vt=new Set,ye=()=>{try{if(globalThis?.__MENYRA_DEBUG_MENU_STATE__===!0||globalThis?.__MENYRA_DEBUG_PROFILE_RENDER__===!0)return!0;const e=new URLSearchParams(globalThis?.location?.search||"");return e.get("debug-menu-state")==="1"||e.get("debug-profile-render")==="1"}catch{return!1}},kn=({profile:e=null,routePayload:t=null,surface:n=null,decision:s=null}={})=>{if(!ye())return;const i=n&&typeof n=="object"?n:{},r=i.menu&&typeof i.menu=="object"?i.menu:{},o=e&&typeof e=="object"?e:{},l=t&&typeof t=="object"?t:{},c=l?.businessSnapshot?.identity||l?.identity||{},g=String(i.authoritativeRestaurantId||i.restaurantId||r.restaurantId||"").trim(),u=String(o.publicSlug||o.landingSlug||o.handle||c.publicSlug||c.landingSlug||c.handle||"").trim(),p=`${g||"pending"}::${u||"no-slug"}`;if(vt.has(p))return;vt.add(p);const m=Array.isArray(r.items)?r.items:[],b=new Set(m.map(w=>String(w?.category||"").trim()).filter(Boolean)).size,k=String(r.rawTruthState||r.truthState||"").trim();console.debug("[mnyra][public-menu.first-render]",{businessId:g,slug:u,itemsLength:m.length,categoriesLength:b,menuStatus:String(r.status||"loading"),truthState:k,isLoading:s?.isLoading===!0,isHydrating:r.hydrating===!0||k.toLowerCase()==="hydrating",confirmedEmpty:r.confirmedEmpty===!0,canRenderItems:r.canRenderItems===!0,shouldRenderNoProducts:s?.shouldRenderNoProducts===!0,source:String(r.source||"")})},Sn=()=>{try{return String(globalThis?.__MNYRA_BUILD_TOKEN__||globalThis?.__MENYRA_SOCIAL_APP_VERSION__||"").trim()}catch{return""}},De=(e="")=>a(String(e||"")),Z=({renderer:e="profile-menu-focus-render-controller",skeleton:t="",source:n=""}={})=>{if(!ye())return"";const s=[e?`data-debug-renderer="${De(e)}"`:"",t?`data-debug-skeleton="${De(t)}"`:"",n?`data-debug-source="${De(n)}"`:""].filter(Boolean);return s.length?` ${s.join(" ")}`:""},wt=({component:e="profile-menu-focus-render-controller",functionName:t="",profile:n=null,routePayload:s=null,surface:i=null,decision:r=null,items:o=null,rawItems:l=null,filteredItems:c=null,renderDecision:g="",source:u=""}={})=>{const p=i&&typeof i=="object"?i:{},m=p.menu&&typeof p.menu=="object"?p.menu:{},b=p.focus&&typeof p.focus=="object"?p.focus:{},k=n&&typeof n=="object"?n:d?.profileView?.profile&&typeof d.profileView.profile=="object"?d.profileView.profile:{},w=s&&typeof s=="object"?s:d?.profileView?.routePayload&&typeof d.profileView.routePayload=="object"?d.profileView.routePayload:{},S=w?.businessSnapshot&&typeof w.businessSnapshot=="object"?w.businessSnapshot:{},j=S?.identity&&typeof S.identity=="object"?S.identity:w?.identity&&typeof w.identity=="object"?w.identity:{},y=d?.__webDirectEntry&&typeof d.__webDirectEntry=="object"?d.__webDirectEntry:{},I=String(k.publicSlug||k.landingSlug||k.handle||j.publicSlug||j.landingSlug||j.handle||y.publicSlug||"").trim(),A=String(k.restaurantId||w.restaurantId||y.restaurantId||"").trim(),P=String(k.canonicalRestaurantId||w.canonicalRestaurantId||p.authoritativeRestaurantId||y.canonicalRestaurantId||S.restaurantId||"").trim();let L="";k.canonicalRestaurantId?L="profile.canonicalRestaurantId":w.canonicalRestaurantId?L="routePayload.canonicalRestaurantId":p.authoritativeRestaurantId?L="surface.authoritativeRestaurantId":y.canonicalRestaurantId?L="webDirectEntry.canonicalRestaurantId":S.restaurantId?L="routeSnapshot.restaurantId":k.restaurantId?L="profile.restaurantId":w.restaurantId?L="routePayload.restaurantId":y.restaurantId&&(L="webDirectEntry.restaurantId");const $=String(P||p.restaurantId||m.restaurantId||A||"").trim(),R=Array.isArray(l)?l:Array.isArray(m.items)?m.items:[],N=Array.isArray(o)?o:R,T=Array.isArray(c)?c:N,h=new Set(T.map(G=>String(G?.category||"").trim()).filter(Boolean)).size,F=String(m.status||(r?.isLoading?"loading":"")||"").trim(),_=String(m.rawTruthState||m.truthState||"").trim(),z=m.confirmedEmpty===!0||r?.confirmedEmpty===!0,E=r?.hasError===!0||F==="error"||!!String(m.error||"").trim(),H=!(T.length>0||r?.hasItems===!0)&&!z&&!E,Y=P||A||$||"";return{component:e,functionName:t,slug:I,businessId:$,requestedRestaurantId:A,canonicalRestaurantId:P,restaurantIdSource:L,menuReadPath:Y?`restaurants/${Y}/public/menu`:"",activeTab:String(d?.activeTab||"").trim(),profileTopTab:String(d?.profileTopTab||"").trim(),profileContentTab:String(d?.profileContentTab||"").trim(),itemsLength:N.length,rawItemsLength:R.length,filteredItemsLength:T.length,categoriesLength:h,focusItemsLength:Array.isArray(b.items)?b.items.length:0,loading:m.loading===!0||r?.isLoading===!0||F==="loading",pending:H,hydrating:m.hydrating===!0||_.toLowerCase()==="hydrating",status:F,truthState:_,confirmedEmpty:z,canRenderItems:m.canRenderItems===!0,renderDecision:g||(r?.shouldRenderNoProducts?"no-products":r?.isLoading?"loading":""),source:u||String(m.source||""),buildToken:Sn()}},$e=(e={})=>{ye()&&console.warn("[mnyra:no-products-render]",{...wt(e),stack:new Error().stack})},ke=(e="",t={})=>{ye()&&console.info("[mnyra:skeleton-render]",{skeletonName:e,...wt({...t,renderDecision:t.renderDecision||"skeleton"}),reason:String(t.reason||"").trim()})},f=(e,t=e,n={})=>Qa(e,{fallback:t,params:n}),In=(e="")=>{const t=String(e||"").trim();if(!t)return f("nav.menu","Menue");const n=t.toLowerCase();return n==="menue"||n==="menu"||n==="menü"?f("nav.menu",t):n==="shop"?"Shop":t},yt=(e="")=>{const t=String(e||"").trim();if(!t)return"";const n=t.toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(n)?f("menu.products","Produkte"):t},Cn=(e="food",t=!1)=>t?f("menu.products","Produkte"):String(e||"").trim().toLowerCase()==="drink"?f("menu.drinks","Getraenke"):f("menu.food","Speisen"),$t=(e={},t=!1)=>{const n=re(e?.type||"food");return t?f("menu.product","Produkt"):n==="drink"?f("menu.drinkItem","Getraenk"):f("menu.foodItem","Speise")},He=(e="",t="#111827")=>{const n=String(e||"").trim();return/^#[0-9a-fA-F]{6}$/.test(n)?n:t};function Pn(e=null,t=null){return be(d,{profile:e,routePayload:t,webDirectEntry:d?.__webDirectEntry}).restaurantId}function kt(e=null,t=""){if(!e||typeof e!="object")return e;const n=String(t||"").trim();if(!n)return e;const s=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===n&&s?e:{...e,restaurantId:n,...s?{canonicalRestaurantId:s}:{}}}function Fn(e=""){const t=String(e||"").trim();return t?be(d,{profile:d?.profileView?.profile||d?.userProfile,routePayload:d?.profileView?.routePayload,webDirectEntry:d?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function ue(e={}){const t=String(hn(e)||"").trim();return t?gt(e?.price,t):gt(e?.price)}function jn(e=[],t="",n=""){const s=String(t||"").trim(),i=String(n||"").trim();if(!s||!i)return"";const r=Array.isArray(e)?e:[];if(!r.length)return`${s}|${i}|empty`;const o=[];return r.forEach(l=>{const c=String(xe(l)||l?.id||"").trim();c&&o.push(c)}),o.length?(o.sort(),`${s}|${i}|${o.join(",")}`):`${s}|${i}|empty`}function An(e=[],t=""){const n=String(d.user?.uid||"").trim(),s=jn(e,t,n);s&&ee.inFlightKey!==s&&ee.key!==s&&(ee.key=s,ee.inFlightKey=s,un(e,t).catch(i=>{console.error(i),ee.key===s&&(ee.key="")}).finally(()=>{ee.inFlightKey===s&&(ee.inFlightKey="")}))}function Ln(e={}){const t=String(e?.uid||"").trim();if(t&&d.followingTargetIds.includes(t))return!0;const n=String(e?.restaurantId||"").trim();if(n&&d.followingTargetIds.includes(n))return!0;const s=$n(e?.handle||"");return!!(s&&d.followingHandles.includes(s))}function St(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const n=typeof ce=="function"&&ce(t)||null;return n?.specialEnabled===!0?!0:(n?.specialEnabled===!1,!1)}function Tn(e={}){return ae(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function It(e,t,n=!0,{includeImageKey:s=!0}={}){const i=tn(e),r=e.id?String(e.id):"",o=r?`data-open-post="${a(r)}"`:"",l=r?`data-post-like-count="${a(r)}"`:"",c=r?`data-post-comment-count="${a(r)}"`:"",g=s&&r?`data-img-key="profile-post:${a(r)}"`:"",u=e.type==="wide"||e.type==="hero",p=t&&u?"col-span-2":"",m=t&&u?"aspect-[1.8/1]":"aspect-[4/5]",b=M(e.url,u?"large":"medium",{stableKey:r?`profile-post:${r}`:"",variantGroup:"post-detail"}),k=u?800:400,w=u?400:500;return`
    <div ${o} role="button" tabindex="0" class="${p} relative ${m} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${a(b)}" loading="lazy" decoding="async" width="${k}" height="${w}" ${g} class="w-full h-full object-cover" />
        ${e.isVideo?`<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${x("play","w-3 h-3 fill-white")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${x("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${l} class="text-[10px] font-bold tracking-wide">${a(i.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${x("message-circle","w-3 h-3 text-indigo-200")}
                <span ${c} class="text-[10px] font-bold tracking-wide">${a(i.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${r&&n?`
        <button type="button" data-profile-menu-button="${a(r)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${x("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${a(r)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${a(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${x(u?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${u?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${a(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${x("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function Oe(e,t,n=!0,{includeImageKeys:s=!0}={}){const i=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${x("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${a(f("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const r=e.map(l=>It(l,i,n,{includeImageKey:s})),o=e.reduce((l,c)=>{const g=c?.type==="wide"||c?.type==="hero";return l+(g?2:1)},0);return i&&o%2===1&&r.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),r.join("")}function Ve(){const e=d.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const n=M(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${a(n)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${a(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${x("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${a(t.city||"Stadt")}
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
        <p class="text-slate-400 text-sm font-bold tracking-wide">${a(f("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function Se(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}function Ie(e={}){const t=String(Ne(e)||"").trim().toLowerCase();return t==="hotel"||t==="motel"}function Ke(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),n=t?ce(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{}}}function _n(e={},t=""){const n=e&&typeof e=="object"?e:{},s=String(n.id||n._id||n.offerId||n.menuItemId||t||"offer").trim();return{...n,id:s,menuItemId:String(n.menuItemId||n.targetMenuItemId||n.itemId||n.targetItemId||"").trim(),title:n.title||n.name||"Oferta",text:n.text||n.desc||n.description||"",imageUrl:n.imageUrl||n.image||n.photoUrl||"",active:n.active!==!1}}function Rn(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],n=new Set;return t.map((s,i)=>_n(s,`offer_${i}`)).filter(s=>{const i=String(s.id||`${s.title}|${s.text}|${s.imageUrl}`).trim();return!i||n.has(i)?!1:(n.add(i),!0)})}function zn(e={}){const t=Ke(e),n=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!n)return!1;const s=d.focus&&typeof d.focus=="object"?d.focus:{},i=String(s.restaurantId||"").trim()===n,r=String(s.truthSource||"").trim().toLowerCase();if(i&&r==="public-menu"||(i&&Array.isArray(s.items)?s.items:[]).length)return!1;const l=Rn(t);return l.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(d.focus={...s,restaurantId:n,items:l,enabled:s.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:l.length?"seeded":"knownEmpty"},!0):!1}function En(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const n of t){if(!n||typeof n!="object")continue;const s=Number(n.lat??n.latitude),i=Number(n.lng??n.lon??n.longitude);if(Number.isFinite(s)&&Number.isFinite(i))return{lat:s,lng:i}}return null}function O(e={},t=[]){for(const n of t){const s=String(e?.[n]||"").trim();if(s)return s}return""}function Ce(e){if(Array.isArray(e))return e.map(n=>String(n||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(n=>n.trim()).filter(Boolean):[]}function Mn(e={}){const t=[...Ce(e.coverImages),...Ce(e.hotelCoverImages),...Ce(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(s=>String(s||"").trim()).filter(Boolean),n=[];return t.forEach(s=>{n.includes(s)||n.push(s)}),n.slice(0,8)}function Un(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function Bn(e=""){const t=String(e||"").trim(),n=d.hotelCardEditor&&typeof d.hotelCardEditor=="object"?d.hotelCardEditor:{},s=String(n.restaurantId||"").trim();return s?s===t?n:{}:Un(n)?{}:n}function Nn(e={}){const t=Array.isArray(e.features)?e.features.map(s=>String(s||"").trim()).filter(Boolean):[],n=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[O(e,["hotelFeatureOneText","gardenTerraceText"])||String(n.gardenTerrace||"").trim()||t[0]||"",O(e,["hotelFeatureTwoText","accessibilityText"])||String(n.accessibility||"").trim()||t[1]||"",O(e,["hotelFeatureThreeText","veganOptionsText"])||String(n.veganOptions||"").trim()||t[2]||""]}function Dn(e={}){const t=[],n=(s="")=>{const i=String(s||"").trim();i&&!t.includes(i)&&t.push(i)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(s=>{Array.isArray(s)&&s.forEach(i=>{typeof i=="string"?n(i):i&&typeof i=="object"&&n(i.label||i.name||i.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&n("Në plazh"),(e.restaurant||e.hasRestaurant)&&n("Restaurant"),(e.breakfast||e.breakfastIncluded)&&n("Mëngjes"),(e.pool||e.hasPool)&&n("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&n("WLAN"),(e.parking||e.freeParking||e.hasParking)&&n("Parking"),(e.spa||e.wellness)&&n("Wellness"),t.slice(0,8)}const Hn=[{value:"m",label:"m"},{value:"km",label:"km"}],On="Në qendër",Ct="Në plazh",Vn=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],Kn=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],qn=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function te(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function Gn(e="",{direct:t=!1}={}){const n=String(e||"").trim(),s=te(n),i=t||s==="ne_qender"||s==="ne_plazh"||s==="direkt_ne_qender"||s==="direkt_ne_plazh"||s.includes("direkt")&&(s.includes("strand")||s.includes("zentrum")||s.includes("center"))||s.includes("am_strand")||s.includes("im_zentrum"),r=n.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),o=r?r[1].replace(",","."):"",c=(r?String(r[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:o,unit:c,isDirect:i}}function Pt({idPrefix:e="",iconName:t="navigation",label:n="",value:s="",directLabel:i="",direct:r=!1}={}){const o=Gn(s,{direct:r});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${x(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${a(n)}</p>
          <p class="text-[10px] font-bold text-slate-400">${a(i)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${a(e)}Value" type="number" min="0" step="0.1" value="${a(o.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${a(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${Hn.map(l=>`<option value="${a(l.value)}" ${o.unit===l.value?"selected":""}>${a(l.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${a(i)}</span>
        <input id="${a(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${o.isDirect?"checked":""} />
      </label>
    </div>
  `}function Qn(e=[],t=""){const n=String(t||"").trim(),s=new Set(e.map(te));return`
    <option value="">Zgjidh</option>
    ${e.map(i=>`<option value="${a(i)}" ${te(i)===te(n)?"selected":""}>${a(i)}</option>`).join("")}
    ${n&&!s.has(te(n))?`<option value="${a(n)}" selected>Aktuale: ${a(n)}</option>`:""}
  `}function qe({id:e="",iconName:t="badge-check",label:n="",value:s="",options:i=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${x(t,"w-4 h-4")}
        </div>
        <label for="${a(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${a(n)}</label>
      </div>
      <select id="${a(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${Qn(i,s)}
      </select>
    </div>
  `}function Wn(e={},t=[]){const n=new Set(t.map(te).filter(Boolean)),s=[],i=(r="")=>{const o=String(r||"").trim();if(!o)return;const l=te(o);n.has(l)||s.some(c=>te(c)===l)||s.push(o)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(r=>Ce(r).forEach(i)),s}function Yn({existingImages:e=[],newPreviews:t=[],imageUrlDraft:n=""}={}){const s=[...t.map((o,l)=>({src:o,kind:"new",idx:l})),...e.map((o,l)=>({src:o,kind:"existing",idx:l}))].filter(o=>o.src),i=s[0]?.src||n||"",r=i?M(i,"large"):D;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${a(r||D)}" class="w-full h-52 object-cover bg-white" />
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
                ${o.kind==="existing"?`<span data-hotel-card-existing-image="${a(o.src)}" hidden></span>`:""}
                <img src="${a(M(o.src,"thumb"))}" class="w-full h-full object-cover" />
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

      <input id="hotelCardCoverImageUrl" type="hidden" value="${a(n)}" />
    </div>
  `}function Pe({iconName:e="info",label:t="",value:n="",helper:s=""}={}){return`
    <div class="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm">
      <div class="flex items-start gap-4">
        <div class="w-11 h-11 rounded-[1.25rem] bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          ${x(e,"w-5 h-5")}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">${a(t)}</p>
          <p class="text-sm font-black text-slate-900 leading-snug">${a(n||"Shto detajet")}</p>
          ${s?`<p class="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">${a(s)}</p>`:""}
        </div>
      </div>
    </div>
  `}function Ft(e={}){const t=Ke(e),n=En(t),s=O(t,["address","primaryAddress","location","formattedAddress","street"]),i=O(t,["city","locationCity","primaryCity","region","country"]),r=O(t,["beachDistance","distanceToBeach","beachDistanceLabel","strandEntfernung"]),o=O(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),l=O(t,["rating","reviewRating","stars","hotelStars"]),c=O(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),g=Dn(t),u=n?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${n.lat},${n.lng}`)}`:s||i?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s} ${i}`.trim())}`:"";return`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm overflow-hidden">
        <div class="h-40 rounded-[1.6rem] bg-cyan-50 border border-cyan-100 relative overflow-hidden mb-4">
          <div class="absolute inset-0 opacity-80" style="background-image: linear-gradient(135deg, rgba(0,204,229,0.18), rgba(15,23,42,0.04));"></div>
          <div class="absolute inset-0 flex items-center justify-center text-cyan-600">
            ${x("map-pin","w-10 h-10")}
          </div>
          <div class="absolute left-4 right-4 bottom-4 bg-white/90 backdrop-blur rounded-2xl p-3 border border-white/70">
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Lokacioni</p>
            <p class="text-xs font-black text-slate-900 leading-snug">${a(s||i||"Shto lokacionin")}</p>
          </div>
        </div>
        ${u?`
          <a href="${a(u)}" target="_blank" rel="noopener noreferrer" class="w-full h-12 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            ${x("navigation","w-4 h-4")} Hap hartën
          </a>
        `:""}
      </div>

      <div class="grid grid-cols-1 gap-4">
        ${Pe({iconName:"map-pin",label:"Adresa",value:[s,i].filter(Boolean).join(", ")||"Shto lokacionin",helper:n?`${n.lat.toFixed(5)}, ${n.lng.toFixed(5)}`:""})}
        ${Pe({iconName:"navigation",label:"Qendra",value:o||"Shto detajet"})}
        ${Pe({iconName:"waves",label:"Plazhi",value:r||(t.beachfront||t.onBeach?Ct:"Shto detajet")})}
        ${Pe({iconName:"star",label:"Vlerësime",value:l?`${l}${c?` / ${c} vlerësime`:""}`:"Pa vlerësime",helper:O(t,["reviewSummary","ratingSummary","commentsSummary"])})}
      </div>

      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Të përfshira</p>
        ${g.length?`
          <div class="flex flex-wrap gap-2">
            ${g.map(p=>`<span class="px-3 py-2 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600">${a(p)}</span>`).join("")}
          </div>
        `:`
          <p class="text-sm font-bold text-slate-400">Shto pajisjet dhe detajet e dhomave.</p>
        `}
      </div>
    </div>
  `}function Zn(e={}){const t=Ke(e),n=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),s=t?.name||t?.restaurantName||e?.name||"Hotel",i=Bn(n),r=String(i.status||"").trim(),o=i.saving===!0,l=Array.isArray(i.existingImages)?i.existingImages.map(R=>String(R||"").trim()).filter(Boolean):Mn(t),c=Array.isArray(i.imagePreviews)?i.imagePreviews.map(R=>String(R||"").trim()).filter(Boolean):[],g=String(i.imageUrlDraft||"").trim(),[u,p,m]=Nn(t),b=Wn(t,[u,p,m]),k=O(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),w=O(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),S=O(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),j=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,y=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,I=i.detailsOpen===!0||o,A=c[0]||l[0]||"",P=A?M(A,"thumb"):D,L=[k,w,S?`${S} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",$=r.includes("fehl")||r.includes("Bitte")||r.includes("Nuk");return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel Card</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(s)}</p>
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
            <button type="button" data-hotel-card-details-open aria-expanded="${I?"true":"false"}" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
              ${x("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${I?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${a(P||D)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${a(s)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(L)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${I?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${x("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${r&&!I?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${$?"text-rose-500":"text-slate-500"}">${a(r)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${a(n)}" data-hotel-card-details-panel class="${I?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
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
              ${Yn({existingImages:l,newPreviews:c,imageUrlDraft:g})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Pt({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:k,directLabel:On,direct:j})}
              ${Pt({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:w,directLabel:Ct,direct:y})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${a(S)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${qe({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:u,options:Vn})}
              ${qe({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:p,options:Kn})}
              ${qe({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:m,options:qn})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${a(b.join(`
`))}</textarea>
              </div>
            </div>

            ${r?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${$?"text-rose-500":"text-slate-500"}">${a(r)}</div>`:""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${o?"disabled":""}>
              ${o?"Po ruhet...":"Ruaj Hotel Details"}
            </button>
        </div>
        ${at(n,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function Fe(e={}){const t=String(d.profileTopTab||"").trim().toLowerCase(),n=String(d.profileContentTab||"").trim().toLowerCase();return Se(e)?t==="menu"?"menu":n==="menu"||n==="posts"?n:"posts":n==="media"||n==="checkins"?n:"posts"}function Ge(e={}){const t=String(d.profileTopTab||"").trim().toLowerCase();return Se(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(d.user?.uid||"").trim()?"favorites":"profile"}function jt(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function Jn(e=0,t=1){const n=Math.max(1,Number(t||0)||1),s=Math.round(Number(e||0));if(!Number.isFinite(s))return 0;const i=s%n;return i<0?i+n:i}function Xn(e=0){return jt(e)}function ea(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],n=jt(d.profileLandingStep),s=Jn(d.profileLandingGreetingIndex,t.length),i=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},r=String(i.businessName||e.name||"casarita").trim()||"casarita",o=He(i.businessNameColor||e.businessNameColor||e.landingBusinessNameColor||"","#111827"),l=o&&o.toLowerCase()!=="#111827"?o:"",c=He(i.businessNameColorPart1||e.businessNameColorPart1||e.landingBusinessNameColorPart1||o||"","#111827"),g=He(i.businessNameColorPart2||e.businessNameColorPart2||e.landingBusinessNameColorPart2||l||"","#4f46e5"),u=r.replace(/\.+$/g,"").trim()||r,p=u.split(/\s+/).filter(Boolean),m=p.length>1?p.slice(0,-1).join(" "):u,b=p.length>1?p[p.length-1]:"",k=b?m:`${m}.`,w=b?`${b}.`:"",S=M(i.logoUrl||e.avatar||"","avatar"),y=String(S||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",I=String(i.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),A=String(i.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),P=n>=2,L=n>=3,$=Array.isArray(d.profileView?.posts)?d.profileView.posts:Array.isArray(e?.posts)?e.posts:[],R=Xn(n),N=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${x("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(T=>{const h=R===T;return`
            <div data-landing-step-dot="${T}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${h?"1.22":"1"}); opacity: ${h?"1":"0.88"}; background: ${h?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${h?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${h?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${n===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${n===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((T,h)=>{const F=h===s,_=h===(s-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${h}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${F?"opacity: 1; transform: translateY(0) scale(1);":_?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!F&&!_?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${a(T)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${a(y)}" alt="${a(`${r} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${a(c)};">${a(k)}</span>${w?`<span style="color:${a(g)};">${a(w)}</span>`:""}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${a(I)}<br />
            ${a(A)}
          </p>
        </div>
        ${N}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${n<1?"translate-y-full":n===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===1?"1":"0"}; pointer-events: ${n===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${Le(e,$,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${N}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${n<2?"translate-y-full":n===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===2?"1":"0"}; pointer-events: ${n===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${P?Le(e,$,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${N}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${n<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${n===3?"1":"0"}; pointer-events: ${n===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${L?Le(e,$,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function Qe(e=d.profileView?.profile||d.userProfile,{landingPreview:t=!1,selectedTabOverride:n="",compact:s=!1}={}){const i=Se(e),r=String(n||Fe(e)).trim().toLowerCase()||"posts",o=Ie(e),l=Q(e),c=o?"Details":l?"Shop":f("nav.menu","Menue"),g=i?[{id:"posts",label:f("profile.posts","Beitraege")},{id:"menu",label:c,surface:o?"hotel-details":"menu"}]:[{id:"posts",label:f("profile.posts","Beitraege")},{id:"media",label:f("profile.media","Medien")},{id:"checkins",label:f("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${s?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${g.map(u=>`
          <button data-profile-tab="${u.id}" ${u.surface?`data-profile-tab-surface="${a(u.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${r===u.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${u.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function We(e=d.profileView?.profile||d.userProfile,{disabled:t=!1}={}){const n=Fe(e);return n==="checkins"||n==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${a(f("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${d.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${x("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${d.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${x("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function B(e=""){return String(e||"").trim()}const At="mnyra_business_title_image_cache_v1",Lt=80;function Tt(){if(!d)return{};const e=d.businessTitleImageCache&&typeof d.businessTitleImageCache=="object"?d.businessTitleImageCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const s=(typeof window<"u"?window.localStorage:null)?.getItem?.(At)||"",i=s?JSON.parse(s):{};i&&typeof i=="object"&&Object.entries(i).forEach(([r,o])=>{const l=B(r),c=B(o);l&&c&&!q(c)&&(t[l]=c)})}catch{}return d.businessTitleImageCache={loaded:!0,items:t},t}function ta(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem(At,JSON.stringify(e))}catch{}}function na(e={},t="business"){const n=[e?.restaurantId,e?.canonicalRestaurantId,e?.uid,e?.handle,e?.publicSlug,e?.landingSlug,e?.name,t].map(s=>B(s)).filter(Boolean);return[...new Set(n)]}function aa(e=[],t=""){const n=B(t);if(!n||q(n))return;const s=Tt();let i=!1;e.forEach(o=>{const l=B(o);!l||s[l]===n||(s[l]=n,i=!0)});const r=Object.entries(s);if(r.length>Lt){const o=r.slice(r.length-Lt);Object.keys(s).forEach(l=>delete s[l]),o.forEach(([l,c])=>{s[l]=c}),i=!0}i&&ta(s)}function sa(e=[]){const t=Tt();for(const n of e){const s=B(n),i=s?B(t[s]):"";if(i&&!q(i))return i}return""}function ra(e={},t="business"){return String(e?.restaurantId||e?.canonicalRestaurantId||e?.uid||e?.handle||e?.name||t).trim()||t}function ia(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.id||e?.landingRestaurantId||e?.documentId||"").trim()}function oa(e={}){const n=(Array.isArray(e?.coverImages)?e.coverImages:Array.isArray(e?.titleImages)?e.titleImages:[]).map(s=>String(s||"").trim()).find(Boolean)||"";return String(e?.titleImageUrl||e?.coverImageUrl||e?.coverUrl||e?.heroUrl||n||"").trim()}function la(e={},t={}){const n=oa(e),s=Array.isArray(t.cacheKeys)?t.cacheKeys:[],i=B(t.stableKey||s[0]||"");if(!n){if(t.allowCacheFallback===!0){const o=sa(s);if(o)return o;const l=i?M("","medium",{stableKey:i}):"";return l&&!q(l)?l:""}return""}const r=M(n,"medium",i?{stableKey:i}:void 0);return r&&!q(r)?(aa(s,r),r):""}function _t(e="",t=""){const n=B(e);if(!n)return"";if(/^https?:\/\//i.test(n))return n;const s=n.replace(/^@+/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/^tiktok\.com\/@?/i,"").replace(/^www\.tiktok\.com\/@?/i,"").replace(/^\/+/,"").trim();return s?t==="tiktok"?`https://www.tiktok.com/@${encodeURIComponent(s)}`:t==="instagram"?`https://www.instagram.com/${encodeURIComponent(s)}`:"":""}function da(e=""){const t=B(e);if(!t)return"";const n=t.replace(/[^\d+]/g,"");return n?`tel:${n}`:""}function ca(e={}){const t=Number(e?.gpsLat??e?.lat),n=Number(e?.gpsLng??e?.lng);if(Number.isFinite(t)&&Number.isFinite(n))return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t},${n}`)}`;const s=[e?.address,e?.locationPlace||e?.place,e?.location,e?.city,e?.country].map(i=>B(i)).filter(Boolean).join(", ");return s?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s)}`:""}function je({href:e="",label:t="",iconName:n="",body:s="",buttonAttrs:i=""}={}){const r=B(e),o=String(i||"").trim();if(!r&&!o)return"";const l=s||x(n,"w-4 h-4"),c="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform";return o?`
    <button type="button" ${o} title="${a(t)}" aria-label="${a(t)}" class="${c}">
      ${l}
    </button>
  `:`
    <a href="${a(r)}" target="_blank" rel="noreferrer" title="${a(t)}" class="${c}">
      ${l}
    </a>
  `}function Ae({href:e="",buttonAttrs:t="",iconName:n="",eyebrow:s="",value:i=""}={}){const r=B(i);if(!r)return"";const o=`
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${x(n,"w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${a(s)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a(r)}</span>
    </div>
  `;return e?`<a href="${a(e)}" target="${e.startsWith("tel:")?"_self":"_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${o}</a>`:`<button type="button" ${t} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${o}</button>`}function ua({profileName:e="",safeBio:t="",metaLine:n="",identityPending:s=!1,followersLabel:i=""}={}){return`
    <div aria-hidden="true" style="grid-area:1/1;visibility:hidden;pointer-events:none;min-width:0;max-width:100%;overflow:hidden;">
      <div class="h-40 w-full"></div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div class="relative">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px]"></div>
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl text-slate-900 leading-none mb-1">${a(String(i))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(f("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <div class="flex flex-col items-center min-w-0">
              <span class="h-7 flex items-center justify-center text-slate-900"></span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(f("profile.info","Info"))}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(e)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${t}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(n)}</p>
          ${s?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(f("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-[56px] rounded-[1.2rem]"></div>
          <div class="w-[56px] h-[56px] rounded-[1.2rem]"></div>
        </div>
      </div>
    </div>
  `}function Rt(e={},t={}){const n=t.mode==="self"?"self":"public",s=t.disabledBlockClass||"",i=t.avatarUrl||M(e.avatar||"","avatar"),r=t.avatarFit||Ue(!!e.restaurantId),o=ra(e,n),l=String(d?.profileCardInfoOpen||"")===o,c=Number(d?.profileCardInfoHeights?.[o]||0),g=l&&Number.isFinite(c)&&c>0?`height:${Math.ceil(c)}px;`:"",u=t.avatarImgKeyAttr||(n==="self"?'data-img-key="avatar:self"':`data-img-key="avatar:public:${a(o)}"`),p=t.renderAvatarImage!==!1&&!!String(i||"").trim()&&!!String(e?.avatar||"").trim(),m=!!t.identityPending,b=t.followersLabel??U(e.followers),k=B(e?.name)||"User",w=B(t.typeLabel||e?.customerType||e?.type||"Business"),S=B(e?.location||"-"),j=n==="public"?`${S} / ${w}`:S,y=t.bioHtml||a(e?.bio||"").replace(/\n/g,"<br>")||a(f("profile.noBio","Noch keine Bio.")),I=`business-cover:${o}`,A=na(e,o),P=la(e,{cacheKeys:A,stableKey:I,allowCacheFallback:t.allowTitleImageCacheFallback===!0}),L=ca(e),$=ia(e),R=je($?{buttonAttrs:`data-marketplace-open-map="${a($)}"`,label:f("profile.openMap","Karte oeffnen"),iconName:"map"}:{href:L,label:f("profile.openMap","Karte oeffnen"),iconName:"map"}),N=_t(e?.instagramUrl||e?.instagram||e?.insta||"","instagram"),T=_t(e?.tiktokUrl||e?.tiktok||e?.tikTok||"","tiktok"),h=B(e?.phone||e?.telephone||e?.contactPhone||""),F=da(h),_=B(e?.address||e?.locationLabel||[e?.place||e?.locationPlace,e?.location||e?.city].map(V=>B(V)).filter(Boolean).join(", ")),z=[Ae({href:N,iconName:"instagram",eyebrow:"Instagram",value:e?.instagram||e?.instagramUrl||e?.insta||""}),Ae({href:T,iconName:"music-2",eyebrow:"TikTok",value:e?.tiktok||e?.tiktokUrl||e?.tikTok||""})].filter(Boolean).join(""),E=n==="self"?`
      <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
        <span class="relative z-10 flex items-center gap-2">${x("plus","w-4 h-4")} Status</span>
        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
      <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${x("settings","w-5 h-5")}
      </button>
    `:`
      <button data-landing-tutorial-target="follow" data-public-profile-follow="${a(e.handle||"")}" data-target-type="${a(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${a(e.restaurantId||e.uid||"")}" data-target-name="${a(e.name||"")}" data-target-avatar="${a(e.avatar||"")}" ${t.hasPendingFollowRequest?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${t.followTone||"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"} ${t.hasPendingFollowRequest?"opacity-90 cursor-default":""}">
        <span class="relative z-10 flex items-center gap-2">
          ${t.isFollowing?x("check","w-4 h-4"):""}
          ${a(t.followLabel||f("profile.follow","Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${a(e.uid||"")}" data-chat-handle="${a(e.handle||"")}" data-chat-name="${a(e.name||"")}" data-chat-avatar="${a(e.avatar||"")}" ${t.isLocked?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${t.isLocked?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${x("message-circle","w-5 h-5")}
      </button>
    `;if(l){const V=[Ae({href:F,iconName:"phone",eyebrow:f("profile.call","Anrufen"),value:h}),Ae({href:L,iconName:"map-pin",eyebrow:f("profile.address","Adresse"),value:_||S}),z].filter(Boolean).join("");return`
      <div data-landing-tutorial-target="identity" data-business-profile-card="${a(o)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${s}" style="${g}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${ua({profileName:k,safeBio:y,metaLine:j,identityPending:m,followersLabel:b})}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${a(o)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${x("x","w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(f("profile.contactInfo","Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(S)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${V||`<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${a(f("profile.noContactInfo","Noch keine Kontaktdaten"))}</div>`}
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 min-w-0 max-w-full overflow-hidden">
            <button type="button" data-profile-card-info-close="${a(o)}" class="w-full h-[56px] rounded-[1.2rem] border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center" style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;">
              ${a(f("profile.backToProfile","Zurueck zum Profil"))}
            </button>
          </div>
        </div>
      </div>
    `}return`
    <div data-landing-tutorial-target="identity" data-business-profile-card="${a(o)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${s}" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${P?`<img src="${a(P)}" data-img-key="${a(I)}" alt="${a(k)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`:`<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${x("store","w-7 h-7")}</div>`}
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${R}
          ${je({href:T,label:"TikTok",iconName:"music-2"})}
          ${je({href:N,label:"Instagram",iconName:"instagram"})}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${n==="self"?'id="profileAvatarTrigger"':""} class="relative ${n==="self"?"cursor-pointer group":""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${p?`<img src="${a(i)}" decoding="async" width="100" height="100" ${u} class="w-full h-full rounded-[1.8rem] ${r} border-2 border-white bg-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${m?"animate-pulse":""}">${x("store","w-8 h-8 text-slate-300")}</div>`}
            </div>
            ${e.isPremium?`
              <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                ${x("badge-check","w-4 h-4 fill-blue-500 text-white")}
              </div>
            `:""}
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div data-landing-tutorial-target="fans" class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl ${m?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(String(b))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(f("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <button type="button" data-profile-card-info-open="${a(o)}" class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${x("info","w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(f("profile.info","Info"))}</span>
            </button>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(k)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${y}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(j)}</p>
          ${m?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(f("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          ${E}
        </div>
      </div>
    </div>
  `}function Le(e={},t=[],{topTabOverride:n="",tutorialMode:s=!1,contentTabOverride:i="",landingHideContent:r=!1,collapseIdentity:o=!1,contentReveal:l=!1,landingMode:c=!1}={}){const g=Ln(e),u=!!e.privateAccount&&e.uid&&String(e.uid)!==String(d.user?.uid||"")&&!g,p=!!e.pendingFollowRequest&&!g,m=e.restaurantId?"Business":f("nav.user","User"),b=String(e.handle||ct(e.name||"user")).replace(/^@/,""),w=a(e.bio||"").replace(/\n/g,"<br>")||a(f("profile.noBio","Noch keine Bio.")),S=Se(e),j=String(n||Ge(e)).trim().toLowerCase()||"profile",y=String(i||Fe(e)).trim().toLowerCase()||"posts",I=y==="menu",A=y==="checkins",P=t,$={...d?.profileView&&typeof d.profileView=="object"?d.profileView:{},profile:e,posts:Array.isArray(P)?P:[]},R=Wa(d,{profileView:$,profileTopTab:j,profileContentTab:y}),N=String(R?.header?.status||"").trim().toLowerCase()||"loading",T=String(R?.posts?.status||"").trim().toLowerCase()||"loading",h=String(e?.avatar||"").trim(),F=h?M(h,"avatar"):"",_=Ue(!!e.restaurantId),z=e.uid||e.restaurantId||b||"public",E=c?"":`data-img-key="avatar:public:${a(z)}"`,V=!!h,H=dt=>{if(dt==null)return!1;const en=Number(dt);return Number.isFinite(en)&&en>=0},Y=V||H(e?.followers)||H(e?.following),G=Me(N)&&!Y,Re=!!String(F||"").trim()&&V,ze=G?"...":U(e.followers),le=G?"...":U(e.following),ot=S?"pt-2":"pt-10",fe=g?f("profile.following","Following"):p?f("profile.requested","Requested"):u?f("profile.request","Request"):f("profile.follow","Follow"),ge=g?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":p?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",lt=s?"select-none":"app-main-content-safe",J=s?"pointer-events-none":"",me=!o,Ee=!r,K=l?c?"transition-opacity duration-200":"animate-in fade-in duration-300":"",Xt=y==="posts"&&P.length>0,Va=y!=="posts"||Xt||T==="empty"||T==="error",Ka=y==="posts"&&!Xt&&T==="error";return!s&&(y==="posts"||y==="media")&&e?.restaurantId&&Me(T)&&sn(e),`
    <div class="${lt}" ${s?'data-landing-tutorial-surface="true"':""}>
      ${j==="profile"||j==="menu"?`
      ${me?`
        <div class="app-content-inline pb-2 ${ot}">
          ${S?Rt(e,{mode:"public",disabledBlockClass:J,avatarUrl:F,avatarFit:_,avatarImgKeyAttr:E,renderAvatarImage:Re,identityPending:G,followersLabel:ze,followLabel:fe,followTone:ge,isFollowing:g,hasPendingFollowRequest:p,isLocked:u,bioHtml:w,typeLabel:m,allowTitleImageCacheFallback:Me(N)||Me(T)}):`
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${J}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${Re?`<img src="${a(F)}" decoding="async" width="100" height="100" ${E} class="w-full h-full rounded-[1.8rem] ${_} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${G?"animate-pulse":""}">${x(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${x("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${G?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(ze)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(f("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${G?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(le)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(f("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(e.name||"User")}</h1>
                ${S?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${a(b)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${w}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(e.location||"-")} / ${m}</p>
                ${G?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(f("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${a(e.handle)}" data-target-type="${a(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${a(e.restaurantId||e.uid||"")}" data-target-name="${a(e.name||"")}" data-target-avatar="${a(e.avatar||"")}" ${p?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${ge} ${p?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${g?x("check","w-4 h-4"):""}
                    ${fe}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${a(e.uid||"")}" data-chat-handle="${a(e.handle||"")}" data-chat-name="${a(e.name||"")}" data-chat-avatar="${a(e.avatar||"")}" ${u?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${u?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
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
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${a(f("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${a(f("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${Qe(e,{landingPreview:s,selectedTabOverride:y,compact:o})}
        ${Ee?We(e,{disabled:s}):""}

        ${Ee?I?`
          <div class="${J} ${K}">
            ${Ie(e)?Ft(e):_e(e,{mode:c?"landing":"profile",allowAutoEnsure:!c})}
          </div>
        `:A?`
          <div class="${J} ${K}">
            ${Ve()}
          </div>
        `:`
          ${Va?`
            ${Ka?`
              <div class="app-content-inline ${J}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${a(f("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${d.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${J} ${K}">
                ${Oe(P,d.profileViewMode,!1,{includeImageKeys:!c})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${J}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${K}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(f("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${j==="cart"?ut(e):j==="favorites"?pt(e):""}
      `}
    </div>
  `}function pa(){const e=d.profileView;if(!e||!e.profile)return"";const t=e.profile,n=e.posts||t.posts||[],s=Ge(t);return s==="landing"?ea(t):Le(t,n,{topTabOverride:s,tutorialMode:!1})}function zt(e,{filter:t="all",query:n=""}={}){const s=Array.isArray(e)?e:[],i=yn(n||"");return s.filter(r=>t==="all"||re(r.type)===t?i?`${r.name||""} ${r.category||""} ${r.description||""}`.toLowerCase().includes(i):!0:!1)}function Et(e,t=0){const n=Number(e);return Number.isFinite(n)?Math.max(0,Math.floor(n)):Math.max(0,Number(t)||0)}function Te(e=[]){return(Array.isArray(e)?e.slice():[]).map((n,s)=>({item:n,idx:s,order:Et(n?.orderIndex,s)})).sort((n,s)=>n.order-s.order||n.idx-s.idx).map((n,s)=>({...n.item,orderIndex:Et(n.item?.orderIndex,s)}))}function Ye(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function pe(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":re(e?.type||"food")==="drink"?"drink":"food"}function fa(e={}){return String(e?.category||f("menu.other","Sonstiges")).trim()||f("menu.other","Sonstiges")}function ga(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const ma=4,ba={thumb:160,small:480,medium:768,large:1280};function Mt({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<ma&&n===0}function ha({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){const s=Mt({mode:e,priorityIndex:t,slideIndex:n}),i=e==="profile"?' data-image-reveal="menu"':"";return s?`loading="eager" fetchpriority="high"${i}`:`loading="lazy" fetchpriority="low"${i}`}function xa({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function ne(e,{mode:t="profile",priorityIndex:n=-1,slideIndex:s=0,stableKey:i="",preferredSize:r="small",candidateSizes:o=["small","medium","large"],variant:l="grid"}={}){const c=String(e||"").trim(),g=t==="profile"&&i?{stableKey:i}:null,u=Mt({mode:t,priorityIndex:n,slideIndex:s}),p=t==="profile"&&!u&&l!=="thumb",m=M(c,r,g),b=q(m)?D:m,k=mn(c),w=bn(c)&&c!==b?c:k,S=[],j=new Set;o.forEach(h=>{const F=ba[h]||0;if(!F)return;const _=M(c,h,g);if(!_||q(_))return;const z=`${_}|${F}`;j.has(z)||(j.add(z),S.push(`${_} ${F}w`))});const y=S.length>1?S.join(", "):"",I=y?xa({variant:l}):"",A=p?"":y,P=p?"":I,L=A?` srcset="${a(A)}"`:"",$=P?` sizes="${a(P)}"`:"",R=ha({mode:t,priorityIndex:n,slideIndex:s}),N=`${R}${L}${$}`,T=p?[`data-menu-lazy-src="${a(b)}"`,`data-menu-lazy-fallback="${a(w||D)}"`,y?`data-menu-lazy-srcset="${a(y)}"`:"",I?`data-menu-lazy-sizes="${a(I)}"`:""].filter(Boolean).join(" "):"";return{safeImg:p?D:b,fallbackImg:p?D:w,imageAttrs:N,lazyAttrs:T?` ${T}`:"",srcsetValue:y,sizesValue:I,loadingAttrs:R}}function ie(e=[],t,n=null){const s=n instanceof Set?n:new Set;return e.map((i,r)=>{const o=fa(i),l=ga(o),c=!!l&&!s.has(l);return c&&s.add(l),`<div${c?` data-menu-category-anchor="${a(l)}"`:""} class="h-full">${t(i,r)}</div>`}).join("")}function Ze(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function va(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function Ut(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),n=va(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),s=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&n?{type:"link",url:n,productId:""}:t==="product"&&s?{type:"product",url:"",productId:s}:{type:"self",url:"",productId:""}}function Bt(){const e=Q(d.userProfile),t=String(d.menu.filter||"all").trim().toLowerCase()||"all",n=e&&t==="drink"?"all":t;return`
    <div class="flex gap-2 mb-5">
      ${(e?[{id:"all",label:f("menu.all","Alle")},{id:"food",label:f("menu.products","Produkte")}]:[{id:"all",label:f("menu.all","Alle")},{id:"food",label:f("menu.food","Speisen")},{id:"drink",label:f("menu.drinks","Getraenke")}]).map(i=>`
        <button data-menu-filter="${i.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${n===i.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${i.label}
        </button>
      `).join("")}
    </div>
  `}function wa(){const e=fn().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${gn.map(t=>{const n=t.id===e,s=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${n?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${n?x("check",`w-4 h-4 ${s}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function Je(e,{mode:t="profile",priorityIndex:n=-1}={}){const s=X(e),i=t==="profile"?oe(e,{index:0}):"",{safeImg:r,fallbackImg:o,imageAttrs:l,lazyAttrs:c}=ne(s,{mode:t,priorityIndex:n,stableKey:i,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),g=ue(e),u=d.activeTab==="menu"?d.userProfile:d.profileView?.profile||d.userProfile,p=Q(u),m=$t(e,p),b=p?yt(e.category):e.category||"",k=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${a(r)}" data-fallback-src="${a(o)}"${c} class="w-full h-full object-cover" style="object-position:${W(e)};" ${l} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${a(e.name||f("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${a(g)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${b?`<span>${a(b)}</span>`:""}
            <span>${a(m)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${x("more-horizontal","w-4 h-4")}
          </summary>
          <div class="absolute right-0 top-12 w-40 bg-white border border-slate-100 rounded-2xl shadow-lg p-2 z-20">
            <button data-menu-edit="${a(e.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Bearbeiten</button>
            <button data-menu-delete="${a(e.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50">Loeschen</button>
          </div>
        </details>
      </div>
    `:`
    <div ${t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:""} class="w-full p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${t==="profile"?"cursor-pointer":""}">
      <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
        <img src="${a(r)}" data-fallback-src="${a(o)}"${c} class="w-full h-full object-cover" style="object-position:${W(e)};" ${l} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${a(e.name||f("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${a(g)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${b?`<span>${a(b)}</span>`:""}
          <span>${a(m)}</span>
        </div>
        ${k?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${a(k)}</p>`:""}
      </div>
    </div>
  `}function Xe(e,{mode:t="profile",variant:n="food",priorityIndex:s=-1}={}){const i=X(e),r=t==="profile"?oe(e,{index:0}):"",o=n==="drink",{safeImg:l,fallbackImg:c,imageAttrs:g,lazyAttrs:u}=ne(i,{mode:t,priorityIndex:s,stableKey:r,preferredSize:o?"small":"medium",candidateSizes:o?["small","medium"]:["small","medium","large"],variant:o?"grid":"hero"}),p=ue(e),m=d.activeTab==="menu"?d.userProfile:d.profileView?.profile||d.userProfile,b=Q(m),k=$t(e,b),w=b?yt(e.category):e.category||"",S=e.description||"",j=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",y=d.menu.restaurantId||d.profileView?.profile?.restaurantId||d.userProfile.restaurantId||"",I=xe(e),A=bt(y,I),P=A?ht(A):{likes:[],comments:[],counts:{likes:0,comments:0}},L=xt(P),$=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${x("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${a(I)}">${a(U(L.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${x("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${a(I)}">${a(U(L.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${j} class="w-full ${o?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${o?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        <img src="${a(l)}" data-fallback-src="${a(c)}"${u} class="w-full h-full object-cover" style="object-position:${W(e)};" ${g} decoding="async" />
      </div>
      ${o?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${a(e.name||f("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${a(p)}</p>
          ${$}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${a(e.name||f("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${a(p)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${w?`<span>${a(w)}</span>`:""}
            <span>${a(k)}</span>
          </div>
          ${S?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${a(S)}</p>`:""}
          ${$}
        </div>
      `}
    </div>
  `}function et(e={}){if(!e?.restaurantId||Q(e))return!1;const t=String(Ne(e)||"").trim().toLowerCase();return t?t==="restaurant"||t==="cafe"||t==="fastfood":se(e)}function Nt(e){const t=e?.restaurantId||d.menu.restaurantId||d.profileView?.profile?.restaurantId||d.userProfile.restaurantId||"",n=xe(e),s=bt(t,n),i=s?ht(s):{likes:[],comments:[],counts:{likes:0,comments:0}},r=String(d.user?.uid||"").trim(),o=String(d.user?.handle||"").trim().toLowerCase(),l=!!i.likes?.some(c=>{const g=String(c?.uid||"").trim();if(r&&g&&g===r)return!0;const u=String(c?.handle||"").trim().toLowerCase();return!!o&&!!u&&u===o});return{itemId:n,meta:i,counts:xt(i),isLiked:l}}function oe(e,{index:t=0}={}){const n=String(e?.restaurantId||d.menu.restaurantId||d.profileView?.profile?.restaurantId||d.userProfile.restaurantId||"").trim(),s=String(e?.id||xe(e)||"").trim();if(!n||!s)return"";const i=Number(t),r=Number.isFinite(i)?Math.max(0,Math.floor(i)):0;return`menu-detail:${n}:${s}:${r}`}function ya(e){const t=typeof mt=="function"?mt(e):[],n=Array.isArray(t)?t.filter(Boolean):[];if(n.length)return n;const s=X(e);return s?[s]:[]}function ae(e){return Ya(e?.cardStyle||"",re(e?.type||"food"))}function tt(e,{menuItemId:t=""}={}){if(!e)return null;const n=String(t||e.menuItemId||e.itemId||e.productId||"").trim();return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:X(e)||e.imageUrl||"",objectPosition:e.objectPosition||W(e),menuItemId:n}}function C(e=""){return`<div aria-hidden="true" class="${e} bg-slate-100 animate-pulse"></div>`}function $a(e={}){return ke("focus-carousel-skeleton",{...e,functionName:"renderFocusCarouselSkeleton",source:e?.source||"public-focus"}),`
      <div class="${Be()} rounded-[2.5rem] p-6 border shadow-sm" data-focus-skeleton="true"${Z({skeleton:"focus-carousel-skeleton",source:"public-focus"})} aria-hidden="true">
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
  `}function ka(e={}){return ke("testfirst-focus-skeleton",{...e,functionName:"renderTestfirstFocusSkeleton",source:e?.source||"public-focus"}),`
      <div class="pt-2 pb-4" data-focus-skeleton="true"${Z({skeleton:"testfirst-focus-skeleton",source:"public-focus"})} aria-hidden="true">
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
  `}function Sa(){return`
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
  `}function Ia(){return`
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
  `}function Dt(e={}){return ke("testfirst-menu-skeleton",{...e,functionName:"renderTestfirstMenuSkeleton",source:e?.source||"public-menu"}),`
      <div id="menu-section" class="mt-5" data-menu-skeleton="true"${Z({skeleton:"testfirst-menu-skeleton",source:"public-menu"})}>
        <section class="menu-type-block relative" data-menu-type-block="drink">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
            ${Array.from({length:4},()=>Sa()).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block relative" data-menu-type-block="food">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="food">
          <div class="app-content-inline">
            ${Array.from({length:2},()=>Ia()).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Ht(e="food"){const t=e==="drink";return`
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
  `}function Ca(){return`
      <article class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col"${Z({skeleton:"shop-product-card-skeleton",source:"public-menu"})} aria-hidden="true">
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
  `}function Ot({isShop:e=!1,debugContext:t={}}={}){return ke(e?"standard-shop-product-skeleton":"standard-menu-skeleton",{...t,functionName:"renderStandardMenuSkeleton",source:t?.source||"public-menu",reason:t?.reason||(e?"shop-products-loading":"menu-loading")}),e?`
        <div class="grid grid-cols-2 gap-4" data-menu-skeleton="true"${Z({skeleton:"standard-shop-product-skeleton",source:"public-menu"})}>
          ${Array.from({length:4},()=>Ca()).join("")}
        </div>
      `:`
      <div data-menu-skeleton="true"${Z({skeleton:"standard-menu-skeleton",source:"public-menu"})} class="space-y-5">
        <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
        <div class="flex items-center justify-between mb-4">
          ${C("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-4">
            ${Array.from({length:4},()=>Ht("drink")).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
        <div class="flex items-center justify-between mb-4">
          ${C("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="food">
          <div class="space-y-4">
            ${Array.from({length:2},()=>Ht("food")).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Vt(e,t=[],{mode:n="profile"}={}){const s=e?.restaurantId||"",i=et(e)||Q(e);return!s||!i||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((r,o)=>{const l=r.imageUrl||"",c=String(r.menuItemId||r.id||"").trim(),{safeImg:g,fallbackImg:u,imageAttrs:p,lazyAttrs:m}=ne(l,{mode:n,priorityIndex:o,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:c?`menu-focus:${s}:${c}`:""}),b=String(r.menuItemId||"").trim(),k=n==="profile"&&b?`data-menu-open="${a(b)}" role="button"`:"";return`
            <div ${k} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${k?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${a(g)}" data-fallback-src="${a(u)}"${m} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${r.objectPosition||"50% 50%"};" ${p} decoding="async" />
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${x("sparkles","w-3 h-3 text-amber-500")}
                  <span class="text-[10px] font-black text-slate-900 uppercase tracking-widest pt-[1px]">Tipp</span>
                </div>
              </div>
              <div class="px-2 py-4">
                <h3 class="text-[17px] font-black text-slate-900 leading-tight">${a(r.title||"")}</h3>
                <p class="text-[13px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">${a(r.text||"")}</p>
              </div>
            </div>
          `}).join("")}
      </div>
    </div>
  `}function Kt(e,{mode:t="profile",priorityIndex:n=-1}={}){const s=X(e),i=t==="profile"?oe(e,{index:0}):"",{safeImg:r,fallbackImg:o,imageAttrs:l,lazyAttrs:c}=ne(s,{mode:t,priorityIndex:n,stableKey:i,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),g=ue(e),u=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",{itemId:p,counts:m,isLiked:b}=Nt(e);return`
    <div ${u} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${a(r)}" data-fallback-src="${a(o)}"${c} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${W(e)};" ${l} decoding="async" />
        <button
          type="button"
          data-menu-card-like="${a(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${b?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${b?"true":"false"}"
        >
          ${x("heart","w-3.5 h-3.5 fill-current opacity-80")}
        </button>
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-[14px] font-black text-slate-900 leading-tight">${a(e.name||"")}</h4>
        </div>
        <p class="text-[12px] text-slate-500 leading-relaxed mb-3">${a(e.description||"")}</p>
        <div class="mt-auto pt-2 flex items-center justify-between">
          <span class="text-[14px] font-black text-slate-900">${a(g)}</span>
          <button type="button" class="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors active:scale-95">
            ${x("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${a(p)}">${a(U(m.likes))}</span>
          <span data-menu-comment-count="${a(p)}">${a(U(m.comments))}</span>
        </div>
      </div>
    </div>
  `}function Pa(e,t="profile"){if(t!=="profile")return"";const n=Ut(e);return n.type==="link"&&n.url?`data-menu-special-link="${a(n.url)}" role="button" tabindex="0"`:n.type==="product"&&n.productId?`data-menu-open="${a(n.productId)}" role="button"`:`data-menu-open="${a(e.id)}" role="button"`}function nt(e,{mode:t="profile",size:n="default",priorityIndex:s=-1}={}){const i=X(e),r=t==="profile"?oe(e,{index:0}):"",o=n==="food",{safeImg:l,fallbackImg:c,imageAttrs:g,lazyAttrs:u}=ne(i,{mode:t,priorityIndex:s,stableKey:r,preferredSize:o?"medium":"small",candidateSizes:o?["small","medium","large"]:["small","medium"],variant:o?"hero":"grid"}),p=Pa(e,t),m=String(e.category||"Special").trim()||"Special",b=a(String(e.name||"Special")).replace(/\n/g,"<br>");return n==="food"?`
      <div ${p} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${a(l)}" data-fallback-src="${a(c)}"${u} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${W(e)};" ${g} decoding="async" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${x("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${a(m)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${b}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${p} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${a(l)}" data-fallback-src="${a(c)}"${u} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${W(e)};" ${g} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${x("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${a(m)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${b}</h4>
        </div>
      </div>
    </div>
  `}function qt(e,{mode:t="profile",priorityIndex:n=-1}={}){const s=ue(e),i=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",r=ya(e),l=(r.length?r:[X(e)||""]).filter(Boolean),c=l.length?l.slice(0,12):[""],g=c.length>1,{itemId:u,counts:p,isLiked:m}=Nt(e),b=U(Math.max(0,Number(p.likes)||0)),k=U(Math.max(0,Number(p.comments)||0));return`
    <div ${i} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${g?`
          <div
            data-menu-card-gallery-track="${a(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${c.map((w,S)=>{const j=t==="profile"?oe(e,{index:S}):"",y=ne(w||"",{mode:t,priorityIndex:n,slideIndex:S,stableKey:j,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),I=S>0,A=I?D:y.safeImg,P=I?D:y.fallbackImg,L=I?y.loadingAttrs:y.imageAttrs,$=I?"":y.lazyAttrs||"",R=I?` data-menu-card-deferred-src="${a(y.safeImg)}"
                    data-menu-card-deferred-fallback="${a(y.fallbackImg)}"
                    ${y.srcsetValue?`data-menu-card-deferred-srcset="${a(y.srcsetValue)}"`:""}
                    ${y.sizesValue?`data-menu-card-deferred-sizes="${a(y.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${S}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${a(A)}" data-fallback-src="${a(P)}"${$}${R} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${W(e)};" ${L} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${c.map((w,S)=>{const j=t==="profile"?oe(e,{index:S}):"",{safeImg:y,fallbackImg:I,imageAttrs:A,lazyAttrs:P}=ne(w||"",{mode:t,priorityIndex:n,slideIndex:S,stableKey:j,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${a(y)}" data-fallback-src="${a(I)}"${P} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${W(e)};" ${A} decoding="async" />
              </div>
            `}).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${a(e.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${m?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${m?"true":"false"}"
        >
          ${x("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${g?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${c.map((w,S)=>`
              <div
                data-menu-card-gallery-dot="${a(e.id)}"
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
            <h4 class="text-[18px] font-black text-slate-900 leading-snug">${a(e.name||"")}</h4>
          </div>
          <span class="text-[17px] font-black text-slate-900 whitespace-nowrap">${a(s)}</span>
        </div>
        <p class="text-[14px] text-slate-500 line-clamp-2 leading-relaxed mb-4" style="margin-bottom:16px;">${a(e.description||"")}</p>
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div class="flex items-center gap-2">
            <div class="hidden">
              <span data-menu-like-count="${a(u)}">${a(b)}</span>
              <span data-menu-comment-count="${a(u)}">${a(k)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${a(f("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${x("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function Fa(e,t,{mode:n="profile",publicMenuSurfaceState:s=null,focusFallbackHtml:i=""}={}){const r=Te(Array.isArray(t)?t:[]),o=String(e?.restaurantId||"").trim(),l=n==="admin"||Fn(o),c=s?.focus?.canRenderFocus?{items:Array.isArray(s.focus.items)?s.focus.items:[],enabled:!0}:o&&l?ve(o):{items:[],enabled:!1},g=c.enabled?(Array.isArray(c.items)?c.items:[]).map(h=>tt({...h,objectPosition:de(h)})):[],u=r.filter(h=>ae(h)==="testfirst_focus"&&!Ye(h)).map(h=>tt(h,{menuItemId:h.id||""})).filter(Boolean),p=new Set,m=[...g,...u].filter(h=>{const F=String(h.menuItemId||h.id||`${h.title}|${h.text}|${h.imageUrl}`);return!F||p.has(F)?!1:(p.add(F),!0)}),b=r.filter(h=>!Ye(h)),k=b.filter(h=>ae(h)!=="testfirst_focus"),w=k.length?k:b,S=k.length?m:[],j=w.filter(h=>pe(h)==="drink"),y=w.filter(h=>pe(h)!=="drink"),I=(h=[])=>{const F=[],_=[];return h.forEach(z=>{const E=ae(z);E==="testfirst_food"||E==="testfirst_special"&&Ze(z)==="food"?_.push(z):F.push(z)}),{gridItems:F,foodItems:_}},A=(h,F=-1)=>ae(h)==="testfirst_special"?nt(h,{mode:n,priorityIndex:F}):Kt(h,{mode:n,priorityIndex:F});let P=0;const L=()=>{const h=P;return P+=1,h},$=new Set,R=(h,F)=>!F.gridItems.length&&!F.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${a(h)}">
        ${F.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${a(h)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${ie(F.gridItems,_=>A(_,L()),$)}
            </div>
          </div>
        `:""}
        ${F.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${a(h)}">
            <div class="app-content-inline">
              ${ie(F.foodItems,_=>{const z=ae(_),E=L();return z==="testfirst_special"?nt(_,{mode:n,size:"food",priorityIndex:E}):qt(_,{mode:n,priorityIndex:E})},$)}
            </div>
          </div>
        `:""}
      </section>
    `,N=I(j),T=I(y);return`
    <div>
      ${Vt(e,S,{mode:n})||i}
      <div id="menu-section" class="mt-5">
        ${R("drink",N)}
        ${R("food",T)}
      </div>
    </div>
  `}function Gt(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:s=null,priorityOffset:i=0}={}){return e.length?n?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${ie(e,(r,o)=>Kt(r,{mode:t,priorityIndex:i+o}),s)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${ie(e,(r,o)=>Xe(r,{mode:t,variant:"drink",priorityIndex:i+o}),s)}
    </div>
  `:""}function Qt(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:s=null,priorityOffset:i=0}={}){return e.length?n?`
      <div>
        ${ie(e,(r,o)=>ae(r)==="testfirst_special"&&Ze(r)==="food"?nt(r,{mode:t,size:"food",priorityIndex:i+o}):qt(r,{mode:t,priorityIndex:i+o}),s)}
      </div>
    `:`
    <div class="space-y-4">
      ${ie(e,(r,o)=>Xe(r,{mode:t,variant:"food",priorityIndex:i+o}),s)}
    </div>
  `:""}function Wt(e,{mode:t="profile"}={}){if(t==="admin"){const n=String(d?.menu?.filter||"all").trim().toLowerCase(),s=Q(d.userProfile),i=f("menu.products","Produkte"),r=e.filter(u=>re(u?.type)==="drink"),o=e.filter(u=>re(u?.type)!=="drink"),l=(u,p,{addType:m=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${a(u)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${a(u)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(U(p.length))} Eintraege</p>
          </div>
          ${m?`
            <button type="button" data-menu-add-${a(m)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${x("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${p.length?`<div class="space-y-3">${p.map(b=>Je(b,{mode:"admin"})).join("")}</div>`:($e({functionName:"renderMenuList.adminSection",items:p,rawItems:p,filteredItems:p,renderDecision:"admin-section-no-products",source:"admin-menu"}),`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300"${Z({source:"admin-menu:no-products"})}>${a(f("menu.noProducts","Keine Produkte"))}</div>`)}
      </div>
    `;if(s)return l(i,e,{addType:"food"});const c=[{title:f("menu.drinks","Getraenke"),list:r,addType:"drink"},{title:f("menu.food","Speisen"),list:o,addType:"food"}];if(n==="all")return`
        <div>
          ${c.map(u=>l(u.title,u.list,{addType:u.addType})).join("")}
        </div>
      `;const g=c.filter(u=>u.list.length>0);return g.length?`
      <div>
        ${g.map(u=>l(u.title,u.list,{addType:u.addType})).join("")}
      </div>
    `:n==="drink"?l(f("menu.drinks","Getraenke"),[],{addType:"drink"}):n==="food"?l(f("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((n,s)=>Je(n,{mode:t,priorityIndex:s})).join("")}
    </div>
  `:($e({functionName:"renderMenuList",items:e,rawItems:e,filteredItems:e,renderDecision:"menu-list-no-products",source:t}),`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]"${Z({source:`${t}:no-products`})}>
        ${a(f("menu.noProducts","Keine Produkte"))}
      </div>
    `)}function at(e,{variant:t="focus",suppressLoading:n=!1}={}){if(!e)return"";const{items:s,enabled:i,loading:r}=ve(e,{includeInactive:!0}),o=U(s.length),l=String(t||"").trim().toLowerCase()==="travel-offers",c=l?"Ofertat":"Sot ne Fokus",g=l?"Oferta":"Highlights",u=l?"Im Travel und Profil sichtbar":"Im Profil sichtbar",p=l?"Ofertat werden geladen...":f("focus.loading","Fokus wird geladen..."),m=l?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${a(c)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${a(g)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(o)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${x("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${l?"Oferta anzeigen":"Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${a(u)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${i?"checked":""} />
      </label>

      ${s.length?`
        <div class="space-y-3">
          ${s.map(b=>{const k=M(b.imageUrl||"","thumb"),w=q(k)?D:k,S=b.active!==!1?"Aktiv":"Inaktiv",j=b.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(w)}" class="w-full h-full object-cover" style="object-position:${de(b)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(b.title||"Sot ne Fokus")}</p>
                  ${b.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(b.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${j}">${S}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${a(b.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${a(b.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:r&&!n?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(p)}</div>
      `:r?"":`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${a(m)}</div>
      `}
    </div>
  `}function Yt(e={}){if(!e?.restaurantId)return!1;const t=String(Ne(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)||t==="ecommerce"||Q(e)?!1:se(e)||["restaurant","cafe","coffee","fastfood","food"].includes(t)||!t}function ja(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Freigegeben",className:"text-emerald-600"}:t==="rejected"?{label:"Abgelehnt",className:"text-rose-600"}:{label:"Wartet auf Heart",className:"text-amber-600"}}function Aa(e,t){if(!t||!Yt(e))return"";const{items:n,loading:s}=xn(t,{includeInactive:!0}),i=U(n.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(i)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${x("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${n.length?`
        <div class="space-y-3">
          ${n.map(r=>{const o=M(r.imageUrl||"","thumb"),l=q(o)?D:o,c=ja(r),g=r.category||"RESTAURANT",u=r.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(l)}" class="w-full h-full object-cover" style="object-position:${de(r)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(r.title||"Ad")}</p>
                  ${r.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(r.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${a(g)} · ${a(u)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${c.className}">${a(c.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-ad-edit="${a(r.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-ad-delete="${a(r.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
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
  `}function st(e){if(Array.isArray(e))return e.map(n=>String(n||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(n=>n.trim()).filter(Boolean):[]}function La(e={}){const t=String(e?.restaurantId||"").trim(),n=t?ce(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{},...t?{restaurantId:t}:{}}}function rt(e={}){return e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{}}function Ta(e={}){const t=rt(e);return[...st(t.productIds),...st(e.shoppingLandingCardProductIds),...st(e.shoppingLandingProductIds)].filter(Boolean)}function it(e={}){return!e||typeof e!="object"?{}:Object.entries(e).reduce((t,[n,s])=>{const i=String(n||"").trim(),r=String(s||"").trim();return i&&r&&(t[i]=r),t},{})}function _a(e={}){const t=rt(e);return{...it(e.shoppingLandingProductImageOverrides),...it(t.productImageOverrides)}}function Ra(e=""){const t=String(e||"").trim(),n=d.shoppingLandingCardEditor&&typeof d.shoppingLandingCardEditor=="object"?d.shoppingLandingCardEditor:{},s=String(n.restaurantId||"").trim();return s&&s!==t?{}:n}function za(e){return e?typeof e=="string"?e.trim():typeof e!="object"?String(e||"").trim():String(e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||"").trim():""}function Ea(e={}){const n=[X(e),...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(za).filter(Boolean);return n.filter((s,i)=>n.indexOf(s)===i)}function Ma(e={},t={},n={}){const s=String(e?.id||e?.productId||e?.menuItemId||"").trim();if(!s)return null;const i=Ea(e).map(u=>({rawUrl:u,imageUrl:M(u,"thumb")})).filter(u=>u.rawUrl&&!q(u.imageUrl)),r=i[0]?.rawUrl||"",o=String(t?.[s]||"").trim(),l=String(n?.[s]||"").trim(),c=l||o||r,g=c?M(c,"thumb"):"";return{id:s,name:String(e.name||e.title||"Produkt").trim(),price:ue(e),imageUrl:g&&!q(g)?g:"",defaultImageRaw:r,cardImageUrl:o,previewImageUrl:l,imageCandidates:i,objectPosition:W(e)}}function Ua(e={},t="",n=[]){if(!t||!Q(e))return"";const s=La(e),i=rt(s),r=Ra(t),o=r.saving===!0,l=String(r.status||"").trim(),c=/fehl|error|nicht|nuk|kein/i.test(l),g=String(i.imageUrl||s.shoppingLandingCardImageUrl||s.shoppingLandingImageUrl||"").trim(),u=String(s.logoUrl||s.logo||s.logoURL||s.avatar||e.avatar||"").trim(),p=String(r.imageUrlDraft??g).trim(),m=String(r.imagePreview||p||u||"").trim(),b=m?M(m,"large"):D,k=String(r.titleDraft??(i.title||s.shoppingLandingCardTitle||e.name||"")).trim(),w=r.active!==void 0?r.active!==!1:i.active!==!1&&s.shoppingLandingCardEnabled!==!1,S=Ta(s),j=Array.isArray(r.productIds)?r.productIds.map($=>String($||"").trim()).filter(Boolean):null,y=new Set(j||S),I={..._a(s),...it(r.productImageOverrides)},A=r.productImagePreviews&&typeof r.productImagePreviews=="object"?r.productImagePreviews:{},P=(Array.isArray(n)?n:[]).filter($=>$&&String($.id||"").trim()&&$.hidden!==!0&&$.available!==!1).map($=>Ma($,I,A)).filter(Boolean),L=y.size?`${U(y.size)} ausgewaehlt`:"Keine Auswahl = alle Produkte";return`
    <div data-shopping-landing-card-editor="${a(t)}" class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Landing Card</span>
          <h3 class="text-xl font-black italic tracking-tighter">Shopping Card</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(L)}</p>
        </div>
        <button type="button" id="shoppingLandingImageTrigger" class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95" aria-label="Bild hochladen">
          ${x("plus","w-4 h-4")}
        </button>
      </div>

      <input id="shoppingLandingImageInput" type="file" accept="image/*" class="hidden" />
      <input id="shoppingLandingImageUrl" type="hidden" value="${a(p)}" />

      <div class="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-4">
        <img src="${a(b||D)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div class="absolute inset-x-0 top-0 h-16 pointer-events-none" style="background:linear-gradient(to bottom, rgba(255,255,255,0.7), transparent);"></div>
        <div class="absolute left-4 bottom-4 right-4">
          <span class="inline-flex max-w-full truncate text-[10px] uppercase tracking-wider font-extrabold text-slate-800 bg-white backdrop-blur-sm py-1 px-2.5 rounded-full" style="background:rgba(255,255,255,0.8);">
            ${a(k||"Shop Picks")}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label for="shoppingLandingTitleInput" class="text-[10px] font-black text-slate-400 uppercase ml-2">Titel</label>
          <input id="shoppingLandingTitleInput" type="text" value="${a(k)}" placeholder="Summer Picks" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-amber-100" />
        </div>

        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">Shopping-Tab anzeigen</p>
            <p class="text-[10px] font-bold text-slate-400">Diese Card erscheint im Tab Shopping.</p>
          </div>
          <input id="shoppingLandingActiveToggle" type="checkbox" class="w-5 h-5 accent-amber-500" style="accent-color:#f97316;" ${w?"checked":""} />
        </label>

        <div class="rounded-[1.8rem] border border-slate-100 bg-slate-50 p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produkte</p>
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${a(U(P.length))}</span>
          </div>
          ${P.length?`
            <div class="grid grid-cols-1 gap-2">
              ${P.map($=>{const R=y.has($.id),N=$.imageUrl||D,T=String($.defaultImageRaw||$.imageCandidates[0]?.rawUrl||"").trim(),h=String($.cardImageUrl||"").trim(),F=String($.previewImageUrl||"").trim(),_=!!(F||h&&h!==T),z=F||(h&&!$.imageCandidates.some(E=>E.rawUrl===h)?h:"");return`
                  <div class="rounded-2xl bg-white border border-slate-100 p-3">
                    <label class="flex items-center gap-3">
                      <input type="checkbox" data-shopping-landing-product="${a($.id)}" class="w-4 h-4 accent-amber-500" style="accent-color:#f97316;" ${R?"checked":""} />
                      <span class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src="${a(N)}" class="w-full h-full object-cover" style="object-position:${a($.objectPosition||"50% 50%")};" loading="lazy" decoding="async" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-xs font-black text-slate-900 truncate">${a($.name)}</span>
                        ${$.price?`<span class="block text-[10px] font-bold text-slate-400 mt-0.5">${a($.price)}</span>`:""}
                      </span>
                    </label>
                    ${R?`
                      <div class="mt-3 pt-3 border-t border-slate-100">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Card-Bild</span>
                          <div class="flex items-center gap-2">
                            ${_?`
                              <button type="button" data-shopping-landing-product-image-reset="${a($.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 active:scale-95">
                                Standard
                              </button>
                            `:""}
                            <button type="button" data-shopping-landing-product-image-upload="${a($.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest active:scale-95">
                              Upload
                            </button>
                            <input type="file" accept="image/*" data-shopping-landing-product-image-input="${a($.id)}" class="hidden" />
                          </div>
                        </div>
                        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                          ${$.imageCandidates.map((E,V)=>{const H=V===0,Y=F?!1:H?!_:h===E.rawUrl;return`
                              <label class="shrink-0 w-16">
                                <input type="radio" name="shoppingLandingProductImage_${a($.id)}" data-shopping-landing-product-image-choice="${a($.id)}" value="${H?"":a(E.rawUrl)}" class="hidden" ${Y?"checked":""} />
                                <span class="block h-16 rounded-2xl overflow-hidden border ${Y?"border-slate-900":"border-slate-100"} bg-slate-100">
                                  <img src="${a(E.imageUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </span>
                                <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">${V+1}</span>
                              </label>
                            `}).join("")}
                          ${z?`
                            <label class="shrink-0 w-16">
                              <input type="radio" name="shoppingLandingProductImage_${a($.id)}" data-shopping-landing-product-image-choice="${a($.id)}" value="${a(z)}" class="hidden" checked />
                              <span class="block h-16 rounded-2xl overflow-hidden border border-slate-900 bg-slate-100">
                                <img src="${a(M(z,"thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
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

        ${l?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${c?"text-rose-500":"text-slate-500"}">${a(l)}</div>`:""}

        <button id="shoppingLandingSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${o?"disabled":""}>
          ${o?"Speichern...":"Landing Card speichern"}
        </button>
      </div>
    </div>
  `}function Ba(e){if(!et(e)||!St(e))return"";const n=Te((d.menu.items||[]).filter(s=>ae(s)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(U(n.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${x("plus","w-4 h-4")}
        </button>
      </div>
      ${n.length?`
        <div class="space-y-3">
          ${n.map(s=>{const i=M(X(s),"thumb"),r=q(i)?D:i,o=Ut(s),l=o.type==="link"?"Link":o.type==="product"?"Produkt-Modal":"Diese Karte",c=Ze(s)==="food"?"Food-Size":"Normal",g=Cn(pe(s));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(r)}" class="w-full h-full object-cover" style="object-position:${W(s)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(s.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${a(g)}</span>
                    <span>${a(c)}</span>
                    <span>${a(l)}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-menu-edit="${a(s.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-menu-delete="${a(s.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Special-Karten</div>
      `}
    </div>
  `}function Zt(e,{restaurantId:t="",suppressLoading:n=!1,allowAutoEnsure:s=!0,requirePublicMenuTruth:i=!0}={}){const r=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!r||!se(e))return"";const o=be(d,{profile:e,routePayload:d?.profileView?.routePayload,webDirectEntry:d?.__webDirectEntry,restaurantId:r});if(i&&o.menu.status!=="ready")return"";const l=!i||o.focus.canRenderFocus;if(s&&!d.focus.loading&&!l&&he(kt(e,r)),i&&!l)return"";const{items:c,loading:g}=l?{items:Array.isArray(o.focus.items)?o.focus.items:[],loading:o.focus.loading}:ve(r);if(!(l?!0:ve(r).enabled)||!c.length&&!g||n&&g&&!c.length)return"";if(g&&!c.length)return`
      <div class="${Be()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(f("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const p=vn(c),m=c[p]||c[0],{safeImg:b,fallbackImg:k,imageAttrs:w,lazyAttrs:S}=ne(m.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:m?.id?`focus-carousel:${r}:${String(m.id)}`:""}),j=m.text||"";return`
    <div id="focusCarousel" class="${Be()} rounded-[2.5rem] p-6 border shadow-sm">
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
        <img data-focus-image src="${a(b)}" data-fallback-src="${a(k)}"${S} class="w-full h-56 object-cover" style="object-position:${de(m)};" ${w} decoding="async" />
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${a(m.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${j?"":"hidden"}">${a(j)}</p>
      </div>
      ${c.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${c.map((I,A)=>`
            <button type="button" data-focus-dot="${A}" class="w-2.5 h-2.5 rounded-full ${A===p?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function Na(e,t=220){const n=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${n}`}function Jt({label:e,url:t,caption:n}){if(!t)return"";const s=Na(t,240);return`
    <button type="button" data-copy-url="${a(t)}" data-copy-label="${a(e)}" class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-left active:scale-[0.98] transition-transform">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${a(s)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${a(e)}</p>
        ${n?`<p class="text-[10px] font-bold text-slate-400 mt-1">${a(n)}</p>`:""}
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2">Tippen zum Kopieren</p>
      </div>
    </button>
  `}function Da({profile:e,restaurantId:t,catalogLabel:n}){if(!t||!se(e))return"";if(typeof ft=="function"){const r=we?we(t):null;(!r||r.sameRestaurant!==!0||!r.loading&&!r.loaded&&!r.error)&&ft(e)}const s=typeof we=="function"?we(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},i=(s.tables||[]).map(r=>{const o=wn("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:r});return Jt({label:`Tisch ${r}`,url:o,caption:`${n} fuer Tisch ${r}`})}).join("");return`
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
          <input id="tableQrCountInput" type="number" min="0" max="200" step="1" inputmode="numeric" value="${a(String(s.count||0))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button type="button" data-table-qr-save="true" class="h-14 px-6 rounded-[1.6rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-200/60 active:scale-95" ${s.saving?"disabled":""}>
          ${s.saving?"Speichern...":"Tische speichern"}
        </button>
      </div>
      ${s.loading?'<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tisch-QR wird geladen...</p>':""}
      ${s.status?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">${a(s.status)}</p>`:""}
      ${s.error?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(s.error)}</p>`:""}
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
  `}function Ha(){const e=d.userProfile,t=e.restaurantId||"",n=String(d.user?.uid||"").trim(),s=String(d.__authBootstrapInFlightUid||"").trim(),i=!t&&!!n&&(!!d.__authProfileLoadPromise||s===n),r=Ie(e),o=se(e),l=d.profileView?.profile?.restaurantId?d.profileView.profile:null,c=an()&&!!l?.restaurantId&&se(l),g=Q(e),u=In(dn(e)),p=t?ce(t):null,m=p?.name||p?.restaurantName||e.name||"Business",b=t&&d.menu.restaurantId===t,k=String(d.menu.source||"").trim().toLowerCase(),w=!!b&&k==="collection",S=!!b&&k==="collection"&&d.menu.loading,j=!!t&&(S||!w),y=g?"all":d.menu.filter,I=w?zt(d.menu.items,{filter:y,query:d.menu.query}):[],P=St(e)?I:I.filter(R=>!Tn(R)),L=Te(P),$=U(L.length);if(t&&r){zn(e);const R=String(d.focus?.truthSource||"").trim().toLowerCase();return!d.focus.loading&&(d.focus.restaurantId!==t||R!=="public-menu")&&he(e),Zn(e)}return t&&o&&!w&&!S&&on(e),t&&o&&!d.focus.loading&&d.focus.restaurantId!==t&&he(e),t&&Yt(e)&&ln(e),o?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${u}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(m)}</p>
        </div>
      </div>

      ${t?`
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${a($)}</p>
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

      ${t?at(t):""}
      ${t?Aa(e,t):""}
      ${t?Ua(e,t,w?d.menu.items:[]):""}
      ${t&&w?Ba(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${x("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${a(d.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${Bt()}

        ${j?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(f("menu.loading",`${u} wird geladen...`,{label:u}))}</div>`:Wt(L,{mode:"admin"})}
        ${d.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${a(d.menu.error)}</div>`:""}
        ${Da({profile:e,restaurantId:t,catalogLabel:u})}
      `:""}

    </div>
  `:c?_e(l):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${x("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${u}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function _e(e,{mode:t="profile",allowAutoEnsure:n=!0}={}){const s=d?.profileView?.routePayload&&typeof d.profileView.routePayload=="object"?d.profileView.routePayload:null,i=d?.__webDirectEntry&&typeof d.__webDirectEntry=="object"&&d.__webDirectEntry.active===!0?d.__webDirectEntry:null;let r=be(d,{profile:e,routePayload:s,webDirectEntry:i});const o=r.restaurantId||Pn(e,s);if(!o)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${a(f("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const l=kt(e,o),c=Q(l),g=se(l)&&!c;g&&(r=be(d,{profile:l,routePayload:s,webDirectEntry:i,restaurantId:o}));const u=String(i?.canonicalRestaurantId||i?.restaurantId||"").trim(),p=new Set(r.targetIds),m=qa(r.focus.truthState||""),b=r.menu.status==="ready",k=r.focus.canRenderFocus,w=b&&g,S=r.focus.matches===!0&&r.focus.loading===!0,y=String(d?.profileView?.menuAccessSource||i?.menuAccessSource||s?.menuAccessSource||"").trim().toLowerCase()==="qr",I=i?.active===!0&&i?.webPriority===!0&&i?.menuFirst===!0&&String(d?.activeTab||"").trim().toLowerCase()==="profile"&&String(d?.profileTopTab||"").trim().toLowerCase()==="menu"&&(u===o||p.has(o)),A=I&&!y,P=["ready","empty","error"].includes(r.menu.status),L=I&&P,$=I&&(!w||r.menu.status!=="ready"),R=!w||r.focus.settled===!0||m==="knownEmpty"||r.menu.status!=="ready";n&&!L&&!P&&rn(l),n&&!$&&!R&&!S&&b&&(!A||P)&&he(l);const T=r.menu.canRenderItems?Te(zt(r.menu.items,{filter:"all",query:""})).filter(K=>!Ye(K)):[],h=r.menu.error||"",F=Ga(r.menu,T),{hasItems:_,hasError:z,isLoading:E,shouldRenderNoProducts:V}=F;kn({profile:l,routePayload:s,surface:r,decision:F});const H={profile:l,routePayload:s,surface:r,decision:F,rawItems:r.menu.items,items:T,filteredItems:T,source:"public-menu"},Y=T.filter(K=>pe(K)==="drink"),G=T.filter(K=>pe(K)!=="drink"),Re=0,ze=Y.length,le=et(e),ot=le||c,fe=new Set;_&&o&&(cn(T,o),An(T,o));const ge=o&&k?(Array.isArray(r.focus.items)?r.focus.items:[]).map(K=>tt({...K,objectPosition:de(K)})).filter(Boolean):[],lt=m==="knownEmpty"||r.focus.status==="empty"||r.focus.status==="error",J=g&&!k&&!lt&&r.menu.status!=="empty"&&r.menu.status!=="error",me=ge.length?Vt(l,ge,{mode:t}):J?ka({...H,reason:"focus-truth-pending"}):"",Ee=ot?me:Zt(l,{restaurantId:o,suppressLoading:!0,allowAutoEnsure:b&&(!A||P),requirePublicMenuTruth:!0})||(J?$a({...H,reason:"focus-truth-pending"}):"");return le?`
      <div class="app-main-content-safe">
        ${E?`
          ${me}
          ${Dt({...H,reason:"menu-loading"})}
        `:`
          ${_?Fa(l,T,{mode:t,publicMenuSurfaceState:r,focusFallbackHtml:me}):z?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(f("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:V?($e({...H,functionName:"renderProfileMenuView",renderDecision:"testfirst-no-products"}),`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300"${Z({source:"public-menu:no-products"})}>${a(f("menu.noProducts","Keine Produkte"))}</div>`):Dt({...H,reason:"menu-not-confirmed-empty"})}
          ${h?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(h)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5">
      ${Ee}
      ${E?`
        ${Ot({isShop:c,debugContext:{...H,reason:"menu-loading"}})}
      `:`
        ${_?`
          ${c?`
            ${pn(T,{profile:e})}
          `:`
            ${Y.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${a(f("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${Gt(Y,{mode:t,useTestfirstCardUi:le,seenCategories:fe,priorityOffset:Re})}
                </div>
              </section>
            `:""}
            ${G.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${a(f("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${Qt(G,{mode:t,useTestfirstCardUi:le,seenCategories:fe,priorityOffset:ze})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${z?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                ${a(f("menu.loadError","Menu konnte nicht geladen werden"))}
              </div>
            </div>
          `:V?`
            ${$e({...H,functionName:"renderProfileMenuView",renderDecision:c?"shop-no-products":"standard-no-products"}),`<div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm"${Z({source:"public-menu:no-products"})}>
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${a(f("menu.noProducts","Keine Produkte"))}
              </div>
            </div>`}
          `:`
            ${Ot({isShop:c,debugContext:{...H,reason:"menu-not-confirmed-empty"}})}
          `}
        `}
        ${h?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(h)}</div>`:""}
      `}
    </div>
  `}function Oa(){const e=d.userProfile,t=nn(e),n=t?d.businessPosts:d.userPosts,s=String(d.user?.uid||e?.uid||"").trim(),i=String(e?.restaurantId||"").trim(),r=String(d.__userPostsLoadingUid||"").trim(),o=String(d.__businessPostsLoadingRestaurantId||"").trim(),l=String(d.__authBootstrapInFlightUid||"").trim(),c=!!s&&r===s,g=!!i&&o===i,u=!!s&&l===s,p=t?g||u&&!n.length:c||u&&!n.length,m=String(e.handle||ct(e.name||"user")).replace(/^@/,""),k=a(e.bio||"").replace(/\n/g,"<br>")||a(f("profile.noBio","Noch keine Bio.")),w=Fe(e),S=w==="menu",j=w==="checkins",y=n,I=M(e.avatar,"avatar"),A=Ue(t),P=Ge(e);return`
    <div class="app-main-content-safe">
      ${P==="profile"||P==="menu"?`
      <div class="app-content-inline pb-2 ${t?"pt-2":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${t?Rt(e,{mode:"self",avatarUrl:I,avatarFit:A,followersLabel:U(e.followers),bioHtml:k}):`
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${a(I)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${A} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${x("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${a(U(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(f("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${a(U(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(f("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${a(m)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${k}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(e.location||"-")}</p>
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
        `}
      </div>

      ${Qe(e)}
      ${We(e)}

      ${S?`
        ${Ie(e)?Ft(e):_e(e)}
      `:j?`
        ${Ve()}
      `:`
        ${p&&!y.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(f("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${d.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${Oe(y,d.profileViewMode)}
          </div>
          ${w==="posts"?`
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
        ${P==="cart"?ut(e):P==="favorites"?pt(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:It,renderProfilePostsFancy:Oe,renderProfileCheckins:Ve,renderProfileTabs:Qe,renderProfileViewControls:We,renderPublicProfileView:pa,renderMenuFilterRow:Bt,renderMenuLayoutSection:wa,renderMenuItemCard:Je,renderMenuItemCardStacked:Xe,renderMenuDrinkGrid:Gt,renderMenuFoodList:Qt,renderMenuList:Wt,renderFocusAdminSection:at,renderFocusCarousel:Zt,renderMenuQrCard:Jt,renderMenuAdminView:Ha,renderProfileMenuView:_e,renderProfileView:Oa}}export{es as createProfileMenuFocusRenderController};
