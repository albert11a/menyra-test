import{w as Ss}from"./domain-menu-eager-DmToG0y0.js";import{a as jt}from"./domain-media-eager-B90n_Ot7.js";import{db as Pn}from"./firebase-config-BOk6-WYE.js";import{b as jn,d as An}from"./vendor-firebase-D7Ks7H8l.js";import{am as Ae,an as Is,t as Cs,ao as Ps,k as js,ap as Fe}from"./domain-feed-social-eager-CEaFyONW.js";import"./domain-auth-BL21ERPm.js";import"./domain-public-profile-BW4dw-Ab.js";const Fn=Object.freeze([Object.freeze({key:"city",label:"Qyteti",labelDe:"Stadt"}),Object.freeze({key:"beach",label:"Plazha",labelDe:"Straende"}),Object.freeze({key:"sights",label:"Vende per te pare",labelDe:"Sehenswuerdigkeiten"}),Object.freeze({key:"activities",label:"Aktivitete",labelDe:"Aktivitaeten"}),Object.freeze({key:"nature",label:"Natyre",labelDe:"Natur"}),Object.freeze({key:"food",label:"Restorante & Kafene",labelDe:"Restaurants & Cafes"}),Object.freeze({key:"nearby",label:"Vende te rendesishme",labelDe:"Wichtige Orte"})]),As=Object.freeze(Fn.map(d=>d.key)),Fs=Object.freeze([Object.freeze({key:"all",labelDe:"Ganzjaehrig"}),Object.freeze({key:"summer",labelDe:"Saisonal Sommer"}),Object.freeze({key:"winter",labelDe:"Saisonal Winter"})]),Ls=Object.freeze(Fs.map(d=>d.key)),Ts=12;function fe(d=""){return d==null?"":String(d).trim()}function At(d){const o=Number(d);return Number.isFinite(o)?o:null}function _s(d=""){const o=fe(d).toLowerCase();return As.includes(o)?o:{qyteti:"city",stadt:"city",plazha:"beach",plazhi:"beach",strand:"beach",straende:"beach",sehenswuerdigkeiten:"sights",sehenswurdigkeiten:"sights",aktivitete:"activities",aktivitaeten:"activities",natyre:"nature",natur:"nature",restorante:"food",restaurants:"food",cafes:"food",kafene:"food",umgebung:"nearby",rrethina:"nearby"}[o]||"nearby"}function zs(d=""){const o=fe(d).toLowerCase();return Ls.includes(o)?o:"all"}function Rs(d=Date.now(),o=Math.random()){const $=Math.max(0,Number(d)||0).toString(36),B=Math.floor(Math.max(0,Math.min(.999999,Number(o)||0))*36**6).toString(36).padStart(6,"0");return`place_${$}_${B}`}function Ms(d){return Array.isArray(d)?d.map(o=>fe(o)).filter(Boolean).slice(0,Ts):[]}function Es(d={},{index:o=0}={}){const $=d&&typeof d=="object"?d:{},B=At($.lat??$.latitude??$.coords?.lat),a=At($.lng??$.lon??$.longitude??$.coords?.lng),T=At($.priority);return{id:fe($.id)||Rs(Date.now()+o),name:fe($.name),category:_s($.category),description:fe($.description??$.text).slice(0,600),lat:B,lng:a,coverImageUrl:fe($.coverImageUrl??$.imageUrl??$.coverUrl),gallery:Ms($.gallery),priority:T==null?0:Math.max(0,Math.min(100,Math.round(T))),pinned:$.pinned===!0,season:zs($.season??$.seasonal),active:$.active!==!1}}const Ns=6371e3,Us=80,Ds=600,Bs=1600;function nt(d=0){return(Number(d)||0)*(Math.PI/180)}function ve(d){return d==null||d===""?NaN:Number(d)}function kn(d={}){return Number.isFinite(ve(d?.lat))&&Number.isFinite(ve(d?.lng))}function Os(d,o,$,B){const a=ve(d),T=ve(o),g=ve($),Q=ve(B);if(![a,T,g,Q].every(Number.isFinite))return null;const Te=nt(g-a),_=nt(Q-T),H=Math.sin(Te/2)**2+Math.cos(nt(a))*Math.cos(nt(g))*Math.sin(_/2)**2;return Math.round(2*Ns*Math.asin(Math.min(1,Math.sqrt(H))))}function Hs(d){const o=Number(d);return!Number.isFinite(o)||o<0?"":o<1e3?`${Math.max(10,Math.round(o/10)*10)} m`:o<1e4?`${(o/1e3).toFixed(1).replace(/\.0$/,"")} km`:`${Math.round(o/1e3)} km`}function Vs(d){const o=Number(d);return!Number.isFinite(o)||o<0?null:o<=Bs?{mode:"walk",minutes:Math.max(1,Math.round(o/Us))}:{mode:"drive",minutes:Math.max(1,Math.round(o/Ds))}}function Ks(d,o={}){const $=Vs(d);if(!$)return"";const B=String(o.walk||"min in Gehweite"),a=String(o.drive||"min mit dem Auto");return`${$.minutes} ${$.mode==="walk"?B:a}`}const Ln=200;function ce(d=""){return d==null?"":String(d).trim()}function Sn(d){return Array.isArray(d)?Array.from(new Set(d.map(o=>ce(o)).filter(Boolean))).slice(0,Ln):[]}function Tn(d={}){const o=d&&typeof d=="object"?d:{},$=o.placePatches&&typeof o.placePatches=="object"?o.placePatches:{},B={};return Object.entries($).slice(0,Ln).forEach(([a,T])=>{const g=ce(a);if(!g||!T||typeof T!="object")return;const Q={};ce(T.name)&&(Q.name=ce(T.name)),ce(T.description)&&(Q.description=ce(T.description).slice(0,600)),ce(T.coverImageUrl)&&(Q.coverImageUrl=ce(T.coverImageUrl)),Object.keys(Q).length&&(B[g]=Q)}),{hidden:Sn(o.hidden),pinned:Sn(o.pinned),placePatches:B}}function qs({places:d=[],overrides:o={},hotelCoords:$=null,includeHidden:B=!1}={}){const a=Tn(o),T=new Set(a.hidden),g=new Map(a.pinned.map((_,H)=>[_,H])),Q=kn($)?$:null;return(Array.isArray(d)?d:[]).map((_,H)=>Es(_,{index:H})).filter(_=>_.name&&_.active).map(_=>{const H=a.placePatches[_.id]||{},D=Q&&kn(_)?Os(Q.lat,Q.lng,_.lat,_.lng):null;return{..._,...H,hidden:T.has(_.id),pinned:g.has(_.id)||_.pinned,pinnedRank:g.has(_.id)?g.get(_.id):null,distanceMeters:D}}).filter(_=>B||!_.hidden).sort((_,H)=>{const D=_.pinnedRank!=null,ye=H.pinnedRank!=null;if(D!==ye)return D?-1:1;if(D&&ye&&_.pinnedRank!==H.pinnedRank)return _.pinnedRank-H.pinnedRank;if(_.pinned!==H.pinned)return _.pinned?-1:1;if(_.priority!==H.priority)return H.priority-_.priority;const $e=Number.isFinite(_.distanceMeters)?_.distanceMeters:1/0,_e=Number.isFinite(H.distanceMeters)?H.distanceMeters:1/0;return $e!==_e?$e-_e:String(_.name).localeCompare(String(H.name))})}function Gs(d=[]){const o=Array.isArray(d)?d:[];return Fn.map($=>({...$,places:o.filter(B=>B.category===$.key)})).filter($=>$.places.length)}function In(d=""){return d==null?"":String(d).trim()}const Cn=Object.freeze({city:Object.freeze({eyebrow:"Përreth teje",icon:"building-2"}),beach:Object.freeze({eyebrow:"Deti afër",icon:"waves"}),sights:Object.freeze({eyebrow:"Vlen të shihet",icon:"landmark"}),activities:Object.freeze({eyebrow:"Koha e lirë",icon:"compass"}),nature:Object.freeze({eyebrow:"Natyra afër",icon:"trees"}),food:Object.freeze({eyebrow:"Shije lokale",icon:"utensils"}),nearby:Object.freeze({eyebrow:"Afër teje",icon:"map-pin"})});function _n(d={}){const o=d&&typeof d=="object"?d:{};return{destinationId:In(o.destinationId),destinationName:In(o.destinationName),overrides:Tn(o.destinationOverrides||{})}}function Qs({places:d=[],overrides:o={},hotelCoords:$=null}={}){const B=qs({places:d,overrides:o,hotelCoords:$,includeHidden:!1});return Gs(B).map(a=>({...a,meta:Cn[a.key]||Cn.nearby}))}function Ws(d){return d==null||!Number.isFinite(Number(d))?{distance:"",travel:""}:{distance:Hs(d),travel:Ks(d,{walk:"min në këmbë",drive:"min me makinë"})}}const we=new Map,Le=new Map;function Ys(d="",o=()=>{}){const $=String(d||"").trim();!$||Le.has($)||(Le.set($,{status:"loading",context:null}),jn(An(Pn,"restaurants",$)).then(B=>{const a=B.exists()?B.data()||{}:{};Le.set($,{status:"ready",context:_n(a)})}).catch(()=>{Le.set($,{status:"error",context:null})}).finally(()=>{try{o()}catch{}}))}function Zs(d="",o=()=>{}){const $=String(d||"").trim();!$||we.has($)||(we.set($,{status:"loading",name:"",places:[]}),jn(An(Pn,"destinationsPublic",$)).then(B=>{const a=B.exists()?B.data()||{}:{};we.set($,{status:"ready",name:String(a.name||"").trim(),places:Array.isArray(a.places)?a.places:[]})}).catch(()=>{we.set($,{status:"error",name:"",places:[]})}).finally(()=>{try{o()}catch{}}))}function rr(d={}){const o=d.state,$=typeof d.requestRenderFn=="function"?d.requestRenderFn:(()=>{}),B=d.resolvePostCountsFn,a=d.escapeHtmlFn,T=d.getOptimizedImageUrlFn,g=d.iconFn,Q=d.isLocalBusinessProfileFn,Te=typeof d.isCeoUserFn=="function"?d.isCeoUserFn:(()=>!1),_=d.normalizeHandleFn,H=d.logoFitClassFn,D=d.formatCountFn,ye=d.renderProfileShopCartViewFn,$e=d.renderProfileShopFavoritesViewFn,_e=typeof d.ensurePostsDataForProfileFn=="function"?d.ensurePostsDataForProfileFn:(()=>{}),zn=d.ensureMenuDataForProfileFn,Rn=typeof d.ensureEditorMenuDataForProfileFn=="function"?d.ensureEditorMenuDataForProfileFn:(()=>{}),ze=d.ensureFocusDataForProfileFn,Mn=typeof d.ensureAdsDataForProfileFn=="function"?d.ensureAdsDataForProfileFn:(()=>{}),Ft=d.ensureTableQrStateForProfileFn,J=d.isShopCatalogProfileFn,En=d.getBusinessCatalogLabelFn,ge=d.normalizeMenuTypeFn,Nn=d.primeMenuItemCountsFn,Un=typeof d.hydrateMenuCardViewerLikesFn=="function"?d.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),Dn=d.renderShopProductListFn,Bn=d.getMenuLayoutThemeFn,On=d.menuLayoutColors,ne=d.resolveMenuItemHeroFn,G=d.isPlaceholderUrlFn,V=d.placeholderImage,Hn=d.getFirebaseStorageUrlFn,Vn=d.isDirectImageUrlFn,Lt=d.formatPriceFn,Kn=typeof d.resolveCurrencyCodeForMenuItemFn=="function"?d.resolveCurrencyCodeForMenuItemFn:(()=>""),Tt=d.getMenuItemImagesFn,W=d.getMenuItemObjectPositionFn,Re=d.getMenuItemSocialIdFn,_t=d.menuItemMetaKeyFn,zt=d.ensureMenuItemMetaFn,Rt=d.resolveMenuItemCountsFn,Me=d.getFocusStateForRestaurantFn,qn=typeof d.getAdsStateForRestaurantFn=="function"?d.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),Ee=d.getTableQrStateForRestaurantFn,me=d.getFocusItemObjectPositionFn,at=d.getFocusCardClassFn,Gn=d.getFocusIndexFn,de=d.isRestaurantCafeProfileFn,st=typeof d.getBusinessProfileTypeFn=="function"?d.getBusinessProfileTypeFn:(()=>""),ke=d.getRestaurantMetaByIdFn,Qn=d.buildUrlFn,Wn=d.normalizeSearchKeyFn,Yn=d.normalizeFollowHandleFn,re={key:"",inFlightKey:""},Mt=new Set,Ne=()=>{try{if(globalThis?.__MENYRA_DEBUG_MENU_STATE__===!0||globalThis?.__MENYRA_DEBUG_PROFILE_RENDER__===!0)return!0;const e=new URLSearchParams(globalThis?.location?.search||"");return e.get("debug-menu-state")==="1"||e.get("debug-profile-render")==="1"}catch{return!1}},Zn=({profile:e=null,routePayload:t=null,surface:n=null,decision:s=null}={})=>{if(!Ne())return;const i=n&&typeof n=="object"?n:{},r=i.menu&&typeof i.menu=="object"?i.menu:{},l=e&&typeof e=="object"?e:{},c=t&&typeof t=="object"?t:{},u=c?.businessSnapshot?.identity||c?.identity||{},b=String(i.authoritativeRestaurantId||i.restaurantId||r.restaurantId||"").trim(),p=String(l.publicSlug||l.landingSlug||l.handle||u.publicSlug||u.landingSlug||u.handle||"").trim(),m=`${b||"pending"}::${p||"no-slug"}`;if(Mt.has(m))return;Mt.add(m);const x=Array.isArray(r.items)?r.items:[],f=new Set(x.map(w=>String(w?.category||"").trim()).filter(Boolean)).size,S=String(r.rawTruthState||r.truthState||"").trim();console.debug("[mnyra][public-menu.first-render]",{businessId:b,slug:p,itemsLength:x.length,categoriesLength:f,menuStatus:String(r.status||"loading"),truthState:S,isLoading:s?.isLoading===!0,isHydrating:r.hydrating===!0||S.toLowerCase()==="hydrating",confirmedEmpty:r.confirmedEmpty===!0,canRenderItems:r.canRenderItems===!0,shouldRenderNoProducts:s?.shouldRenderNoProducts===!0,source:String(r.source||"")})},Xn=()=>{try{return String(globalThis?.__MNYRA_BUILD_TOKEN__||globalThis?.__MENYRA_SOCIAL_APP_VERSION__||"").trim()}catch{return""}},rt=(e="")=>a(String(e||"")),be=(e="")=>a(String(e??"")),ee=({renderer:e="profile-menu-focus-render-controller",skeleton:t="",source:n=""}={})=>{if(!Ne())return"";const s=[e?`data-debug-renderer="${rt(e)}"`:"",t?`data-debug-skeleton="${rt(t)}"`:"",n?`data-debug-source="${rt(n)}"`:""].filter(Boolean);return s.length?` ${s.join(" ")}`:""},Jn=(e={},t=[])=>{const n=Ps(e,t);return` ${[`data-menu-state="${be(n.menuState)}"`,`data-menu-item-count="${be(n.menuItemCount)}"`,`data-focus-state="${be(n.focusState)}"`,`data-focus-business-id="${be(n.focusBusinessId)}"`,`data-focus-item-count="${be(n.focusItemCount)}"`,`data-focus-source="${be(n.focusSource)}"`,`data-focus-stale="${n.focusStale?"true":"false"}"`].join(" ")}`},Et=({component:e="profile-menu-focus-render-controller",functionName:t="",profile:n=null,routePayload:s=null,surface:i=null,decision:r=null,items:l=null,rawItems:c=null,filteredItems:u=null,renderDecision:b="",source:p=""}={})=>{const m=i&&typeof i=="object"?i:{},x=m.menu&&typeof m.menu=="object"?m.menu:{},f=m.focus&&typeof m.focus=="object"?m.focus:{},S=n&&typeof n=="object"?n:o?.profileView?.profile&&typeof o.profileView.profile=="object"?o.profileView.profile:{},w=s&&typeof s=="object"?s:o?.profileView?.routePayload&&typeof o.profileView.routePayload=="object"?o.profileView.routePayload:{},C=w?.businessSnapshot&&typeof w.businessSnapshot=="object"?w.businessSnapshot:{},j=C?.identity&&typeof C.identity=="object"?C.identity:w?.identity&&typeof w.identity=="object"?w.identity:{},y=o?.__webDirectEntry&&typeof o.__webDirectEntry=="object"?o.__webDirectEntry:{},I=String(S.publicSlug||S.landingSlug||S.handle||j.publicSlug||j.landingSlug||j.handle||y.publicSlug||"").trim(),A=String(S.restaurantId||w.restaurantId||y.restaurantId||"").trim(),F=String(S.canonicalRestaurantId||w.canonicalRestaurantId||m.authoritativeRestaurantId||y.canonicalRestaurantId||C.restaurantId||"").trim();let z="";S.canonicalRestaurantId?z="profile.canonicalRestaurantId":w.canonicalRestaurantId?z="routePayload.canonicalRestaurantId":m.authoritativeRestaurantId?z="surface.authoritativeRestaurantId":y.canonicalRestaurantId?z="webDirectEntry.canonicalRestaurantId":C.restaurantId?z="routeSnapshot.restaurantId":S.restaurantId?z="profile.restaurantId":w.restaurantId?z="routePayload.restaurantId":y.restaurantId&&(z="webDirectEntry.restaurantId");const k=String(F||m.restaurantId||x.restaurantId||A||"").trim(),M=Array.isArray(c)?c:Array.isArray(x.items)?x.items:[],E=Array.isArray(l)?l:M,N=Array.isArray(u)?u:E,v=new Set(N.map(ue=>String(ue?.category||"").trim()).filter(Boolean)).size,L=String(x.status||(r?.isLoading?"loading":"")||"").trim(),R=String(x.rawTruthState||x.truthState||"").trim(),U=x.confirmedEmpty===!0||r?.confirmedEmpty===!0,O=r?.hasError===!0||L==="error"||!!String(x.error||"").trim(),Y=!(N.length>0||r?.hasItems===!0)&&!U&&!O,X=F||A||k||"";return{component:e,functionName:t,slug:I,businessId:k,requestedRestaurantId:A,canonicalRestaurantId:F,restaurantIdSource:z,menuReadPath:X?`restaurants/${X}/public/menu`:"",activeTab:String(o?.activeTab||"").trim(),profileTopTab:String(o?.profileTopTab||"").trim(),profileContentTab:String(o?.profileContentTab||"").trim(),itemsLength:E.length,rawItemsLength:M.length,filteredItemsLength:N.length,categoriesLength:v,focusItemsLength:Array.isArray(f.items)?f.items.length:0,loading:x.loading===!0||r?.isLoading===!0||L==="loading",pending:Y,hydrating:x.hydrating===!0||R.toLowerCase()==="hydrating",status:L,truthState:R,confirmedEmpty:U,canRenderItems:x.canRenderItems===!0,renderDecision:b||(r?.shouldRenderNoProducts?"no-products":r?.isLoading?"loading":""),source:p||String(x.source||""),buildToken:Xn()}},Ue=(e={})=>{Ne()&&console.warn("[mnyra:no-products-render]",{...Et(e),stack:new Error().stack})},De=(e="",t={})=>{Ne()&&console.info("[mnyra:skeleton-render]",{skeletonName:e,...Et({...t,renderDecision:t.renderDecision||"skeleton"}),reason:String(t.reason||"").trim()})},h=(e,t=e,n={})=>Cs(e,{fallback:t,params:n}),ea=(e="")=>{const t=String(e||"").trim();if(!t)return h("nav.menu","Menue");const n=t.toLowerCase();return n==="menue"||n==="menu"||n==="menü"?h("nav.menu",t):n==="shop"?"Shop":t},Nt=(e="")=>{const t=String(e||"").trim();if(!t)return"";const n=t.toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(n)?h("menu.products","Produkte"):t},ta=(e="food",t=!1)=>t?h("menu.products","Produkte"):String(e||"").trim().toLowerCase()==="drink"?h("menu.drinks","Getraenke"):h("menu.food","Speisen"),Ut=(e={},t=!1)=>{const n=ge(e?.type||"food");return t?h("menu.product","Produkt"):n==="drink"?h("menu.drinkItem","Getraenk"):h("menu.foodItem","Speise")},it=(e="",t="#111827")=>{const n=String(e||"").trim();return/^#[0-9a-fA-F]{6}$/.test(n)?n:t};function na(e=null,t=null){return Ae(o,{profile:e,routePayload:t,webDirectEntry:o?.__webDirectEntry}).restaurantId}function Dt(e=null,t=""){if(!e||typeof e!="object")return e;const n=String(t||"").trim();if(!n)return e;const s=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===n&&s?e:{...e,restaurantId:n,...s?{canonicalRestaurantId:s}:{}}}function aa(e=""){const t=String(e||"").trim();return t?Ae(o,{profile:o?.profileView?.profile||o?.userProfile,routePayload:o?.profileView?.routePayload,webDirectEntry:o?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function Se(e={}){const t=String(Kn(e)||"").trim();return t?Lt(e?.price,t):Lt(e?.price)}function sa(e=[],t="",n=""){const s=String(t||"").trim(),i=String(n||"").trim();if(!s||!i)return"";const r=Array.isArray(e)?e:[];if(!r.length)return`${s}|${i}|empty`;const l=[];return r.forEach(c=>{const u=String(Re(c)||c?.id||"").trim();u&&l.push(u)}),l.length?(l.sort(),`${s}|${i}|${l.join(",")}`):`${s}|${i}|empty`}function ra(e=[],t=""){const n=String(o.user?.uid||"").trim(),s=sa(e,t,n);s&&re.inFlightKey!==s&&re.key!==s&&(re.key=s,re.inFlightKey=s,Un(e,t).catch(i=>{console.error(i),re.key===s&&(re.key="")}).finally(()=>{re.inFlightKey===s&&(re.inFlightKey="")}))}function ia(e={}){const t=String(e?.uid||"").trim();if(t&&o.followingTargetIds.includes(t))return!0;const n=String(e?.restaurantId||"").trim();if(n&&o.followingTargetIds.includes(n))return!0;const s=Yn(e?.handle||"");return!!(s&&o.followingHandles.includes(s))}function Bt(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const n=typeof ke=="function"&&ke(t)||null;return n?.specialEnabled===!0?!0:(n?.specialEnabled===!1,!1)}function oa(e={}){return le(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function Ot(e,t,n=!0,{includeImageKey:s=!0}={}){const i=B(e),r=e.id?String(e.id):"",l=r?`data-open-post="${a(r)}"`:"",c=r?`data-post-like-count="${a(r)}"`:"",u=r?`data-post-comment-count="${a(r)}"`:"",b=s&&r?`data-img-key="profile-post:${a(r)}"`:"",p=e.type==="wide"||e.type==="hero",m=t&&p?"col-span-2":"",x=t&&p?"aspect-[1.8/1]":"aspect-[4/5]",f=p?800:400,S=p?400:500,w=String(e.posterUrl||e.thumbUrl||e.poster||"").trim(),C=e.isVideo===!0,j=C&&w?w:e.url,y=T(j,p?"large":"medium",{stableKey:r?`profile-post:${r}`:"",variantGroup:"post-detail"}),I=String(e.url||"").trim(),A=I&&!I.includes("#")?`${I}#t=0.001`:I,F=C&&!w&&I?`<video src="${a(A)}" preload="metadata" muted playsinline webkit-playsinline width="${f}" height="${S}" ${b} class="w-full h-full object-cover pointer-events-none"></video>`:`<img src="${a(y)}" loading="lazy" decoding="async" width="${f}" height="${S}" ${b} class="w-full h-full object-cover" />`;return`
    <div ${l} role="button" tabindex="0" class="${m} relative ${x} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        ${F}
        ${e.isVideo?`<div class="absolute top-3 left-3 w-7 h-7 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">${g("play","w-3.5 h-3.5 fill-white block")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${g("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${c} class="text-[10px] font-bold tracking-wide">${a(i.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${g("message-circle","w-3 h-3 text-indigo-200")}
                <span ${u} class="text-[10px] font-bold tracking-wide">${a(i.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${r&&n?`
        <button type="button" data-profile-menu-button="${a(r)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${g("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${a(r)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${a(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${g(p?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${p?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${a(r)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${g("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function ot(e,t,n=!0,{includeImageKeys:s=!0}={}){const i=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${g("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${a(h("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const r=e.map(c=>Ot(c,i,n,{includeImageKey:s})),l=e.reduce((c,u)=>{const b=u?.type==="wide"||u?.type==="hero";return c+(b?2:1)},0);return i&&l%2===1&&r.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),r.join("")}function lt(){const e=o.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const n=T(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${a(n)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${a(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${g("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${a(t.city||"Stadt")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${g("arrow-right","w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `:`
      <div class="app-content-inline app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${g("map-pin","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${a(h("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function Be(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}function Oe(e={}){const t=String(st(e)||"").trim().toLowerCase();return t==="hotel"||t==="motel"||t==="travel"}function ct(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),n=t?ke(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{}}}function la(e={},t=""){const n=e&&typeof e=="object"?e:{},s=String(n.id||n._id||n.offerId||n.menuItemId||t||"offer").trim();return{...n,id:s,menuItemId:String(n.menuItemId||n.targetMenuItemId||n.itemId||n.targetItemId||"").trim(),title:n.title||n.name||"Oferta",text:n.text||n.desc||n.description||"",imageUrl:n.imageUrl||n.image||n.photoUrl||"",active:n.active!==!1}}function Ht(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],n=new Set;return t.map((s,i)=>la(s,`offer_${i}`)).filter(s=>{const i=String(s.id||`${s.title}|${s.text}|${s.imageUrl}`).trim();return!i||n.has(i)?!1:(n.add(i),!0)})}function ca(e={}){const t=ct(e),n=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!n)return!1;const s=o.focus&&typeof o.focus=="object"?o.focus:{},i=String(s.restaurantId||"").trim()===n,r=String(s.truthSource||"").trim().toLowerCase();if(i&&r==="public-menu"||(i&&Array.isArray(s.items)?s.items:[]).length)return!1;const c=Ht(t);return c.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(o.focus={...s,restaurantId:n,items:c,enabled:s.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:c.length?"seeded":"knownEmpty"},!0):!1}function da(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const n of t){if(!n||typeof n!="object")continue;const s=Number(n.lat??n.latitude),i=Number(n.lng??n.lon??n.longitude);if(Number.isFinite(s)&&Number.isFinite(i))return{lat:s,lng:i}}return null}function Z(e={},t=[]){for(const n of t){const s=String(e?.[n]||"").trim();if(s)return s}return""}function He(e){if(Array.isArray(e))return e.map(n=>String(n||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(n=>n.trim()).filter(Boolean):[]}function ua(e={}){const t=[...He(e.coverImages),...He(e.hotelCoverImages),...He(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(s=>String(s||"").trim()).filter(Boolean),n=[];return t.forEach(s=>{n.includes(s)||n.push(s)}),n.slice(0,8)}function pa(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function fa(e=""){const t=String(e||"").trim(),n=o.hotelCardEditor&&typeof o.hotelCardEditor=="object"?o.hotelCardEditor:{},s=String(n.restaurantId||"").trim();return s?s===t?n:{}:pa(n)?{}:n}function ga(e={}){const t=Array.isArray(e.features)?e.features.map(s=>String(s||"").trim()).filter(Boolean):[],n=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[Z(e,["hotelFeatureOneText","gardenTerraceText"])||String(n.gardenTerrace||"").trim()||t[0]||"",Z(e,["hotelFeatureTwoText","accessibilityText"])||String(n.accessibility||"").trim()||t[1]||"",Z(e,["hotelFeatureThreeText","veganOptionsText"])||String(n.veganOptions||"").trim()||t[2]||""]}function ma(e={}){const t=[],n=(s="")=>{const i=String(s||"").trim();i&&!t.includes(i)&&t.push(i)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(s=>{Array.isArray(s)&&s.forEach(i=>{typeof i=="string"?n(i):i&&typeof i=="object"&&n(i.label||i.name||i.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&n("Në plazh"),(e.restaurant||e.hasRestaurant)&&n("Restaurant"),(e.breakfast||e.breakfastIncluded)&&n("Mëngjes"),(e.pool||e.hasPool)&&n("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&n("WLAN"),(e.parking||e.freeParking||e.hasParking)&&n("Parking"),(e.spa||e.wellness)&&n("Wellness"),t.slice(0,8)}const ba=[{value:"m",label:"m"},{value:"km",label:"km"}],ha="Në qendër",Vt="Në plazh",xa=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],va=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],wa=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function ie(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function ya(e="",{direct:t=!1}={}){const n=String(e||"").trim(),s=ie(n),i=t||s==="ne_qender"||s==="ne_plazh"||s==="direkt_ne_qender"||s==="direkt_ne_plazh"||s.includes("direkt")&&(s.includes("strand")||s.includes("zentrum")||s.includes("center"))||s.includes("am_strand")||s.includes("im_zentrum"),r=n.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),l=r?r[1].replace(",","."):"",u=(r?String(r[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:l,unit:u,isDirect:i}}function Kt({idPrefix:e="",iconName:t="navigation",label:n="",value:s="",directLabel:i="",direct:r=!1}={}){const l=ya(s,{direct:r});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${g(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${a(n)}</p>
          <p class="text-[10px] font-bold text-slate-400">${a(i)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${a(e)}Value" type="number" min="0" step="0.1" value="${a(l.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${a(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${ba.map(c=>`<option value="${a(c.value)}" ${l.unit===c.value?"selected":""}>${a(c.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${a(i)}</span>
        <input id="${a(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${l.isDirect?"checked":""} />
      </label>
    </div>
  `}function $a(e=[],t=""){const n=String(t||"").trim(),s=new Set(e.map(ie));return`
    <option value="">Zgjidh</option>
    ${e.map(i=>`<option value="${a(i)}" ${ie(i)===ie(n)?"selected":""}>${a(i)}</option>`).join("")}
    ${n&&!s.has(ie(n))?`<option value="${a(n)}" selected>Aktuale: ${a(n)}</option>`:""}
  `}function dt({id:e="",iconName:t="badge-check",label:n="",value:s="",options:i=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${g(t,"w-4 h-4")}
        </div>
        <label for="${a(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${a(n)}</label>
      </div>
      <select id="${a(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${$a(i,s)}
      </select>
    </div>
  `}function ka(e={},t=[]){const n=new Set(t.map(ie).filter(Boolean)),s=[],i=(r="")=>{const l=String(r||"").trim();if(!l)return;const c=ie(l);n.has(c)||s.some(u=>ie(u)===c)||s.push(l)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(r=>He(r).forEach(i)),s}function Sa({existingImages:e=[],newPreviews:t=[],imageUrlDraft:n=""}={}){const s=[...t.map((l,c)=>({src:l,kind:"new",idx:c})),...e.map((l,c)=>({src:l,kind:"existing",idx:c}))].filter(l=>l.src),i=s[0]?.src||n||"",r=i?T(i,"large"):V;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${a(r||V)}" class="w-full h-52 object-cover bg-white" />
        <button type="button" id="hotelCardCoverImagesTrigger" aria-label="Ngarko foto" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${g("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${g("plus","w-2.5 h-2.5")}
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
            ${s.map(l=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                ${l.kind==="existing"?`<span data-hotel-card-existing-image="${a(l.src)}" hidden></span>`:""}
                <img src="${a(T(l.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-hotel-card-image-remove="${l.idx}" data-hotel-card-image-source="${l.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${g("x","w-3 h-3")}
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
  `}function Ie({iconName:e="map-pin",eyebrow:t="",title:n=""}={}){return`
    <div class="flex items-center gap-3 mb-4">
      <div class="w-11 h-11 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-900 shrink-0">
        ${g(e,"w-5 h-5")}
      </div>
      <div>
        ${t?`<p class="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400 mb-0.5">${a(t)}</p>`:""}
        <h2 class="text-[24px] font-black text-slate-900 leading-none tracking-tight">${a(n)}</h2>
      </div>
    </div>
  `}function qt(e="",t="",n="h-40"){const s=String(e||"").trim();return`
    <div class="relative ${n} bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
      ${s?`<img src="${a(T(s))}" alt="${a(t)}" loading="lazy" class="w-full h-full object-cover" />`:`<div class="w-full h-full flex items-center justify-center text-slate-300">${g("image","w-8 h-8")}</div>`}
      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent via-white/40 to-white pointer-events-none"></div>
    </div>
  `}function Ia(e={}){const t=String(e.price??e.priceLabel??"").trim();return`
    <article class="flex-none w-[min(70vw,300px)] snap-start bg-white rounded-[1.4rem] border border-slate-100 shadow-sm overflow-hidden">
      ${qt(e.imageUrl,e.title,"h-44")}
      <div class="relative -mt-8 px-4 pb-4 z-[1]">
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-[17px] font-black text-slate-900 leading-tight">${a(e.title||"Oferta")}</h3>
          ${t?`<span class="shrink-0 text-right"><strong class="block text-[18px] font-black text-slate-900 leading-none">${a(t)}</strong><small class="text-[10px] font-bold text-slate-400">/ natë</small></span>`:""}
        </div>
        ${e.text?`<p class="mt-2 text-[12px] text-slate-500 leading-relaxed">${a(String(e.text).slice(0,220))}</p>`:""}
      </div>
    </article>
  `}function Ca(e={}){const{distance:t,travel:n}=Ws(e.distanceMeters);return`
    <article class="flex-none w-[min(70vw,300px)] snap-start bg-white rounded-[1.4rem] border border-slate-100 shadow-sm overflow-hidden">
      ${qt(e.coverImageUrl,e.name)}
      <div class="relative -mt-8 px-4 pb-4 z-[1]">
        ${e.pinned?`<span class="inline-flex items-center gap-1 min-h-[24px] px-2.5 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider mb-2">${g("map-pin","w-3 h-3")} E zgjedhur</span>`:""}
        <h3 class="text-[17px] font-black text-slate-900 leading-tight">${a(e.name)}</h3>
        ${t||n?`
          <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] font-bold text-slate-600">
            ${t?`<span class="inline-flex items-center gap-1.5">${g("navigation","w-3.5 h-3.5")}${a(t)}</span>`:""}
            ${n?`<span class="inline-flex items-center gap-1.5">${g("clock","w-3.5 h-3.5")}${a(n)}</span>`:""}
          </div>
        `:""}
        ${e.description?`<p class="mt-2 text-[12px] text-slate-500 leading-relaxed">${a(String(e.description).slice(0,220))}</p>`:""}
      </div>
    </article>
  `}function ut(e=""){return`
    <div class="flex gap-4 overflow-x-auto snap-x pb-2 -mx-1 px-1" style="scrollbar-width:none;">
      ${e}
    </div>
  `}function Gt(){return`
    <section>
      <div class="flex items-center gap-3 mb-4">
        <div class="w-11 h-11 rounded-2xl bg-slate-100 animate-pulse"></div>
        <div class="h-6 w-36 rounded-lg bg-slate-100 animate-pulse"></div>
      </div>
      ${ut([0,1].map(()=>`
        <div class="flex-none w-[min(70vw,300px)] rounded-[1.4rem] bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div class="h-40 bg-slate-100 animate-pulse"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 w-2/3 rounded bg-slate-100 animate-pulse"></div>
            <div class="h-3 w-1/2 rounded bg-slate-100 animate-pulse"></div>
          </div>
        </div>
      `).join(""))}
    </section>
  `}function Pa(e=""){const t=String(e||"").toLowerCase();return/(wifi|wlan|internet)/.test(t)?"wifi":/(parking|parkim|garage)/.test(t)?"car":/(mengjes|mëngjes|breakfast|fruehstueck|frühstück)/.test(t)?"coffee":/(pool|pishin)/.test(t)?"waves":/(plazh|strand|beach|det )/.test(t)?"umbrella":/(klim|kondicion|air.?con)/.test(t)?"snowflake":/(restaurant|restorant|bar)/.test(t)?"utensils":/(spa|wellness|sauna)/.test(t)?"sparkles":/(recep|24)/.test(t)?"shield":/(pastrim|clean|housekeeping)/.test(t)?"sparkles":"check"}function ja(e={},t=null){let n=_n(e);if(!n.destinationId){const r=String(e.canonicalRestaurantId||e.restaurantId||e.id||"").trim();if(!r)return"";const l=Le.get(r)||null;if(!l||l.status==="loading")return Ys(r,$),Gt();if(l.status!=="ready"||!l.context?.destinationId)return"";n=l.context}we.has(n.destinationId)||Zs(n.destinationId,$);const s=we.get(n.destinationId)||null;return!s||s.status==="loading"?Gt():s.status!=="ready"||!s.places.length?"":Qs({places:s.places,overrides:n.overrides,hotelCoords:t}).map(r=>`
    <section>
      ${Ie({iconName:r.meta.icon,eyebrow:r.meta.eyebrow,title:r.label})}
      ${ut(r.places.map(l=>Ca(l)).join(""))}
    </section>
  `).join("")}function Qt(e={}){const t=ct(e),n=da(t),s=Z(t,["address","primaryAddress","location","formattedAddress","street"]),i=Z(t,["city","locationCity","primaryCity","region","country"]),r=Z(t,["beachDistance","distanceToBeach","beachDistanceLabel","strandEntfernung"]),l=Z(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),c=Z(t,["rating","reviewRating","stars","hotelStars"]),u=Z(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),b=ma(t),p=Ht(t).filter(f=>f.active!==!1&&(String(f.title||"").trim()||String(f.imageUrl||"").trim())).slice(0,12),m=n?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${n.lat},${n.lng}`)}`:s||i?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s} ${i}`.trim())}`:"",x=[r||t.beachfront||t.onBeach?{iconName:"waves",label:"PLAZHI MË I AFËRT",value:r||Vt}:null,l?{iconName:"car",label:"QENDRA",value:l}:null].filter(Boolean);return`
    <div class="app-content-inline flex flex-col gap-10 app-main-content-safe animate-in fade-in duration-300">
      ${p.length?`
        <section>
          ${Ie({iconName:"bed",eyebrow:"Qëndrimi yt",title:"Dhoma & Oferta"})}
          ${ut(p.map(f=>Ia(f)).join(""))}
        </section>
      `:""}

      ${ja(t,n)}

      ${b.length?`
        <section>
          ${Ie({iconName:"check",eyebrow:"Pa pagesë shtesë",title:"Përfshihet"})}
          <div class="grid grid-cols-2 gap-2.5">
            ${b.map(f=>`
              <div class="min-h-[72px] flex items-center gap-3 p-3 bg-white rounded-[1.1rem] border border-slate-100 shadow-sm">
                <span class="w-9 h-9 rounded-xl bg-slate-50 text-slate-900 flex items-center justify-center shrink-0">${g(Pa(f),"w-4 h-4")}</span>
                <p class="text-[12px] font-black text-slate-900 leading-tight">${a(f)}</p>
              </div>
            `).join("")}
          </div>
        </section>
      `:""}

      <section>
        ${Ie({iconName:"compass",eyebrow:"Zbulo zonën",title:"Lokacioni"})}
        <div class="bg-white rounded-[1.8rem] border border-slate-100 p-3 shadow-sm">
          <div class="h-40 rounded-[1.3rem] bg-cyan-50 border border-cyan-100 relative overflow-hidden">
            <div class="absolute inset-0 opacity-80" style="background-image: linear-gradient(135deg, rgba(0,204,229,0.18), rgba(15,23,42,0.04));"></div>
            <div class="absolute inset-0 flex items-center justify-center text-cyan-600">${g("map-pin","w-10 h-10")}</div>
          </div>
          <div class="p-3 pt-4">
            <div class="flex items-start gap-3">
              <span class="w-10 h-10 rounded-xl bg-slate-50 text-slate-900 flex items-center justify-center shrink-0">${g("map-pin","w-4 h-4")}</span>
              <div class="min-w-0">
                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Lokacioni</p>
                <p class="text-[14px] font-black text-slate-900 leading-snug">${a([s,i].filter(Boolean).join(", ")||"Shto lokacionin")}</p>
              </div>
            </div>
            ${x.map(f=>`
              <div class="min-h-[64px] flex items-center gap-3 mt-2.5 p-3 bg-slate-50 rounded-[1.1rem]">
                <span class="w-9 h-9 rounded-xl bg-white text-slate-900 flex items-center justify-center shrink-0">${g(f.iconName,"w-4 h-4")}</span>
                <div class="min-w-0 flex-1">
                  <p class="text-[8.5px] font-black uppercase tracking-widest text-slate-400 mb-0.5">${a(f.label)}</p>
                  <p class="text-[12.5px] font-black text-slate-900">${a(f.value)}</p>
                </div>
              </div>
            `).join("")}
            ${m?`
              <a href="${a(m)}" target="_blank" rel="noopener noreferrer" class="mt-4 w-full h-12 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                ${g("navigation","w-4 h-4")} Hap hartën
              </a>
            `:""}
          </div>
        </div>
      </section>

      ${c?`
        <section>
          ${Ie({iconName:"star",eyebrow:"Nga vizitorët",title:"Vlerësimet"})}
          <div class="bg-slate-900 text-white rounded-[1.8rem] p-6 shadow-lg flex items-center gap-4">
            <strong class="text-[46px] font-black leading-none tracking-tighter">${a(c)}</strong>
            <div class="min-w-0">
              <div class="flex gap-0.5 text-amber-400">${[0,1,2,3,4].map(()=>g("star","w-4 h-4 fill-current")).join("")}</div>
              <p class="mt-1.5 text-[11px] font-bold text-slate-400">${a(u?`${u} vlerësime`:"Vlerësime nga vizitorët")}</p>
            </div>
          </div>
        </section>
      `:""}
    </div>
  `}function Aa(e={}){const t=ct(e),n=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),s=t?.name||t?.restaurantName||e?.name||"Hotel",i=fa(n),r=String(i.status||"").trim(),l=i.saving===!0,c=Array.isArray(i.existingImages)?i.existingImages.map(M=>String(M||"").trim()).filter(Boolean):ua(t),u=Array.isArray(i.imagePreviews)?i.imagePreviews.map(M=>String(M||"").trim()).filter(Boolean):[],b=String(i.imageUrlDraft||"").trim(),[p,m,x]=ga(t),f=ka(t,[p,m,x]),S=Z(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),w=Z(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),C=Z(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),j=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,y=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,I=i.detailsOpen===!0||l,A=u[0]||c[0]||"",F=A?T(A,"thumb"):V,z=[S,w,C?`${C} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",k=r.includes("fehl")||r.includes("Bitte")||r.includes("Nuk");return`
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
              ${g("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${I?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${a(F||V)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${a(s)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(z)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${I?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${g("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${r&&!I?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${k?"text-rose-500":"text-slate-500"}">${a(r)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${a(n)}" data-hotel-card-details-panel class="${I?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
                <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              </div>
              <button type="button" data-hotel-card-details-close class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                ${g("x","w-4 h-4")}
              </button>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fotot</p>
              ${Sa({existingImages:c,newPreviews:u,imageUrlDraft:b})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Kt({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:S,directLabel:ha,direct:j})}
              ${Kt({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:w,directLabel:Vt,direct:y})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${a(C)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${dt({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:p,options:xa})}
              ${dt({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:m,options:va})}
              ${dt({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:x,options:wa})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${a(f.join(`
`))}</textarea>
              </div>
            </div>

            ${r?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${k?"text-rose-500":"text-slate-500"}">${a(r)}</div>`:""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${l?"disabled":""}>
              ${l?"Po ruhet...":"Ruaj Hotel Details"}
            </button>
        </div>
        ${$t(n,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function Ve(e={}){const t=String(o.profileTopTab||"").trim().toLowerCase(),n=String(o.profileContentTab||"").trim().toLowerCase();return Be(e)?t==="menu"?"menu":n==="menu"||n==="posts"?n:"posts":n==="media"||n==="checkins"?n:"posts"}function pt(e={}){const t=String(o.profileTopTab||"").trim().toLowerCase();return Be(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(o.user?.uid||"").trim()?"favorites":"profile"}function Wt(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function Fa(e=0,t=1){const n=Math.max(1,Number(t||0)||1),s=Math.round(Number(e||0));if(!Number.isFinite(s))return 0;const i=s%n;return i<0?i+n:i}function La(e=0){return Wt(e)}function Ta(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],n=Wt(o.profileLandingStep),s=Fa(o.profileLandingGreetingIndex,t.length),i=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},r=String(i.businessName||e.name||"casarita").trim()||"casarita",l=it(i.businessNameColor||e.businessNameColor||e.landingBusinessNameColor||"","#111827"),c=l&&l.toLowerCase()!=="#111827"?l:"",u=it(i.businessNameColorPart1||e.businessNameColorPart1||e.landingBusinessNameColorPart1||l||"","#111827"),b=it(i.businessNameColorPart2||e.businessNameColorPart2||e.landingBusinessNameColorPart2||c||"","#4f46e5"),p=r.replace(/\.+$/g,"").trim()||r,m=p.split(/\s+/).filter(Boolean),x=m.length>1?m.slice(0,-1).join(" "):p,f=m.length>1?m[m.length-1]:"",S=f?x:`${x}.`,w=f?`${f}.`:"",C=T(i.logoUrl||e.avatar||"","avatar"),y=String(C||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",I=String(i.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),A=String(i.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),F=n>=2,z=n>=3,k=Array.isArray(o.profileView?.posts)?o.profileView.posts:Array.isArray(e?.posts)?e.posts:[],M=La(n),E=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${g("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(N=>{const v=M===N;return`
            <div data-landing-step-dot="${N}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${v?"1.22":"1"}); opacity: ${v?"1":"0.88"}; background: ${v?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${v?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${v?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${n===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${n===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((N,v)=>{const L=v===s,R=v===(s-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${v}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${L?"opacity: 1; transform: translateY(0) scale(1);":R?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!L&&!R?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${a(N)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${a(y)}" alt="${a(`${r} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${a(u)};">${a(S)}</span>${w?`<span style="color:${a(b)};">${a(w)}</span>`:""}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${a(I)}<br />
            ${a(A)}
          </p>
        </div>
        ${E}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${n<1?"translate-y-full":n===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===1?"1":"0"}; pointer-events: ${n===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${Ge(e,k,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${E}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${n<2?"translate-y-full":n===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===2?"1":"0"}; pointer-events: ${n===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${F?Ge(e,k,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${E}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${n<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${n===3?"1":"0"}; pointer-events: ${n===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${z?Ge(e,k,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function ft(e=o.profileView?.profile||o.userProfile,{landingPreview:t=!1,selectedTabOverride:n="",compact:s=!1}={}){const i=Be(e),r=String(n||Ve(e)).trim().toLowerCase()||"posts",l=Oe(e),c=J(e),u=l?"Details":c?"Shop":h("nav.menu","Menue"),b=i?[{id:"posts",label:h("profile.posts","Beitraege")},{id:"menu",label:u,surface:l?"hotel-details":"menu"}]:[{id:"posts",label:h("profile.posts","Beitraege")},{id:"media",label:h("profile.media","Medien")},{id:"checkins",label:h("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${s?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${b.map(p=>`
          <button data-profile-tab="${p.id}" ${p.surface?`data-profile-tab-surface="${a(p.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${r===p.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${p.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function gt(e=o.profileView?.profile||o.userProfile,{disabled:t=!1}={}){const n=Ve(e);return n==="checkins"||n==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${a(h("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${o.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${g("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${o.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${g("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function K(e=""){return String(e||"").trim()}const Yt="mnyra_business_title_image_cache_v1",Zt=80;function Xt(){if(!o)return{};const e=o.businessTitleImageCache&&typeof o.businessTitleImageCache=="object"?o.businessTitleImageCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const s=(typeof window<"u"?window.localStorage:null)?.getItem?.(Yt)||"",i=s?JSON.parse(s):{};i&&typeof i=="object"&&Object.entries(i).forEach(([r,l])=>{const c=K(r),u=K(l);c&&u&&!G(u)&&(t[c]=u)})}catch{}return o.businessTitleImageCache={loaded:!0,items:t},t}function _a(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem(Yt,JSON.stringify(e))}catch{}}function za(e={},t="business"){const n=[e?.restaurantId,e?.canonicalRestaurantId,e?.uid,e?.handle,e?.publicSlug,e?.landingSlug,e?.name,t].map(s=>K(s)).filter(Boolean);return[...new Set(n)]}function Ra(e=[],t=""){const n=K(t);if(!n||G(n))return;const s=Xt();let i=!1;e.forEach(l=>{const c=K(l);!c||s[c]===n||(s[c]=n,i=!0)});const r=Object.entries(s);if(r.length>Zt){const l=r.slice(r.length-Zt);Object.keys(s).forEach(c=>delete s[c]),l.forEach(([c,u])=>{s[c]=u}),i=!0}i&&_a(s)}function Ma(e=[]){const t=Xt();for(const n of e){const s=K(n),i=s?K(t[s]):"";if(i&&!G(i))return i}return""}function Ea(e={},t="business"){return String(e?.restaurantId||e?.canonicalRestaurantId||e?.uid||e?.handle||e?.name||t).trim()||t}function Na(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.id||e?.landingRestaurantId||e?.documentId||"").trim()}function Ua(e={}){const n=(Array.isArray(e?.coverImages)?e.coverImages:Array.isArray(e?.titleImages)?e.titleImages:[]).map(s=>String(s||"").trim()).find(Boolean)||"";return String(e?.titleImageUrl||e?.coverImageUrl||e?.coverUrl||e?.heroUrl||n||"").trim()}function Da(e={},t={}){const n=Ua(e),s=Array.isArray(t.cacheKeys)?t.cacheKeys:[],i=K(t.stableKey||s[0]||"");if(!n){if(t.allowCacheFallback===!0){const l=Ma(s);if(l)return l;const c=i?T("","medium",{stableKey:i}):"";return c&&!G(c)?c:""}return""}const r=T(n,"medium",i?{stableKey:i}:void 0);return r&&!G(r)?(Ra(s,r),r):""}function Jt(e="",t=""){const n=K(e);if(!n)return"";if(/^https?:\/\//i.test(n))return n;const s=n.replace(/^@+/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/^tiktok\.com\/@?/i,"").replace(/^www\.tiktok\.com\/@?/i,"").replace(/^\/+/,"").trim();return s?t==="tiktok"?`https://www.tiktok.com/@${encodeURIComponent(s)}`:t==="instagram"?`https://www.instagram.com/${encodeURIComponent(s)}`:"":""}function Ba(e=""){const t=K(e);if(!t)return"";const n=t.replace(/[^\d+]/g,"");return n?`tel:${n}`:""}function Oa(e={}){const t=Number(e?.gpsLat??e?.lat),n=Number(e?.gpsLng??e?.lng);if(Number.isFinite(t)&&Number.isFinite(n))return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t},${n}`)}`;const s=[e?.address,e?.locationPlace||e?.place,e?.location,e?.city,e?.country].map(i=>K(i)).filter(Boolean).join(", ");return s?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s)}`:""}function Ke({href:e="",label:t="",iconName:n="",body:s="",buttonAttrs:i=""}={}){const r=K(e),l=String(i||"").trim();if(!r&&!l)return"";const c=s||g(n,"w-4 h-4"),u="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform";return l?`
    <button type="button" ${l} title="${a(t)}" aria-label="${a(t)}" class="${u}">
      ${c}
    </button>
  `:`
    <a href="${a(r)}" target="_blank" rel="noreferrer" title="${a(t)}" class="${u}">
      ${c}
    </a>
  `}function qe({href:e="",buttonAttrs:t="",iconName:n="",eyebrow:s="",value:i=""}={}){const r=K(i);if(!r)return"";const l=`
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${g(n,"w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${a(s)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a(r)}</span>
    </div>
  `;return e?`<a href="${a(e)}" target="${e.startsWith("tel:")?"_self":"_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${l}</a>`:`<button type="button" ${t} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${l}</button>`}function Ha({profileName:e="",safeBio:t="",metaLine:n="",identityPending:s=!1,followersLabel:i=""}={}){return`
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
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(h("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <div class="flex flex-col items-center min-w-0">
              <span class="h-7 flex items-center justify-center text-slate-900"></span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(h("profile.info","Info"))}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(e)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${t}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(n)}</p>
          ${s?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(h("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-[56px] rounded-[1.2rem]"></div>
          <div class="w-[56px] h-[56px] rounded-[1.2rem]"></div>
        </div>
      </div>
    </div>
  `}function en(e={},t={}){const n=t.mode==="self"?"self":"public",s=t.disabledBlockClass||"",i=Ea(e,n),r=n==="self"?"avatar:self":`avatar:public:${i}`,l=t.avatarUrl||T(e.avatar||"","avatar",{stableKey:r}),c=t.avatarFit||H(!!e.restaurantId),u=String(o?.profileCardInfoOpen||"")===i,b=Number(o?.profileCardInfoHeights?.[i]||0),p=u&&Number.isFinite(b)&&b>0?`height:${Math.ceil(b)}px;`:"",m=t.avatarImgKeyAttr||(n==="self"?'data-img-key="avatar:self"':`data-img-key="avatar:public:${a(i)}"`),x=t.renderAvatarImage===!0?!!String(l||"").trim()&&!G(l):t.renderAvatarImage!==!1&&!!String(l||"").trim()&&!G(l)&&!!String(e?.avatar||"").trim(),f=!!t.identityPending,S=t.followersLabel??D(e.followers),w=K(e?.name)||"User",C=K(t.typeLabel||e?.customerType||e?.type||"Business"),j=K(e?.location||"-"),y=n==="public"?`${j} / ${C}`:j,I=t.bioHtml||a(e?.bio||"").replace(/\n/g,"<br>")||a(h("profile.noBio","Noch keine Bio.")),A=`business-cover:${i}`,F=za(e,i),z=Da(e,{cacheKeys:F,stableKey:A,allowCacheFallback:t.allowTitleImageCacheFallback===!0}),k=Oa(e),M=Na(e),E=Ke(M?{buttonAttrs:`data-marketplace-open-map="${a(M)}"`,label:h("profile.openMap","Karte oeffnen"),iconName:"map"}:{href:k,label:h("profile.openMap","Karte oeffnen"),iconName:"map"}),N=Jt(e?.instagramUrl||e?.instagram||e?.insta||"","instagram"),v=Jt(e?.tiktokUrl||e?.tiktok||e?.tikTok||"","tiktok"),L=K(e?.phone||e?.telephone||e?.contactPhone||""),R=Ba(L),U=K(e?.address||e?.locationLabel||[e?.place||e?.locationPlace,e?.location||e?.city].map(Y=>K(Y)).filter(Boolean).join(", ")),O=[qe({href:N,iconName:"instagram",eyebrow:"Instagram",value:e?.instagram||e?.instagramUrl||e?.insta||""}),qe({href:v,iconName:"music-2",eyebrow:"TikTok",value:e?.tiktok||e?.tiktokUrl||e?.tikTok||""})].filter(Boolean).join(""),q=n==="self"?`
      <button data-nav="upload" data-upload-intent="chooser" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
        <span class="relative z-10 flex items-center gap-2">${g("plus","w-4 h-4")} Status</span>
        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
      <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${g("settings","w-5 h-5")}
      </button>
    `:`
      <button data-landing-tutorial-target="follow" data-public-profile-follow="${a(e.handle||"")}" data-target-type="${a(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${a(e.restaurantId||e.uid||"")}" data-target-name="${a(e.name||"")}" data-target-avatar="${a(e.avatar||"")}" ${t.hasPendingFollowRequest?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${t.followTone||"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"} ${t.hasPendingFollowRequest?"opacity-90 cursor-default":""}">
        <span class="relative z-10 flex items-center gap-2">
          ${t.isFollowing?g("check","w-4 h-4"):""}
          ${a(t.followLabel||h("profile.follow","Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${a(e.uid||"")}" data-chat-handle="${a(e.handle||"")}" data-chat-name="${a(e.name||"")}" data-chat-avatar="${a(e.avatar||"")}" ${t.isLocked?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${t.isLocked?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${g("message-circle","w-5 h-5")}
      </button>
    `;if(u){const Y=[qe({href:R,iconName:"phone",eyebrow:h("profile.call","Anrufen"),value:L}),qe({href:k,iconName:"map-pin",eyebrow:h("profile.address","Adresse"),value:U||j}),O].filter(Boolean).join("");return`
      <div data-landing-tutorial-target="identity" data-business-profile-card="${a(i)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${s}" style="${p}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${Ha({profileName:w,safeBio:I,metaLine:y,identityPending:f,followersLabel:S})}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${a(i)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${g("x","w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(h("profile.contactInfo","Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(j)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${Y||`<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${a(h("profile.noContactInfo","Noch keine Kontaktdaten"))}</div>`}
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 min-w-0 max-w-full overflow-hidden">
            <button type="button" data-profile-card-info-close="${a(i)}" class="w-full h-[56px] rounded-[1.2rem] border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center" style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;">
              ${a(h("profile.backToProfile","Zurueck zum Profil"))}
            </button>
          </div>
        </div>
      </div>
    `}return`
    <div data-landing-tutorial-target="identity" data-business-profile-card="${a(i)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${s}" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${z?`<img src="${a(z)}" data-img-key="${a(A)}" alt="${a(w)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`:`<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${g("store","w-7 h-7")}</div>`}
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${E}
          ${Ke({href:v,label:"TikTok",iconName:"music-2"})}
          ${Ke({href:N,label:"Instagram",iconName:"instagram"})}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${n==="self"?'id="profileAvatarTrigger"':""} class="relative ${n==="self"?"cursor-pointer group":""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${x?`<img src="${a(l)}" data-fallback-src="${a(V)}" decoding="async" width="100" height="100" ${m} class="w-full h-full rounded-[1.8rem] ${c} border-2 border-white bg-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${f?"animate-pulse":""}">${g("store","w-8 h-8 text-slate-300")}</div>`}
            </div>
            ${e.isPremium?`
              <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                ${g("badge-check","w-4 h-4 fill-blue-500 text-white")}
              </div>
            `:""}
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div data-landing-tutorial-target="fans" class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl ${f?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(String(S))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(h("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <button type="button" data-profile-card-info-open="${a(i)}" class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${g("info","w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(h("profile.info","Info"))}</span>
            </button>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(w)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${I}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(y)}</p>
          ${f?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(h("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          ${q}
        </div>
      </div>
    </div>
  `}function Ge(e={},t=[],{topTabOverride:n="",tutorialMode:s=!1,contentTabOverride:i="",landingHideContent:r=!1,collapseIdentity:l=!1,contentReveal:c=!1,landingMode:u=!1}={}){const b=ia(e),p=!!e.privateAccount&&e.uid&&String(e.uid)!==String(o.user?.uid||"")&&!b,m=!!e.pendingFollowRequest&&!b,x=e.restaurantId?"Business":h("nav.user","User"),f=String(e.handle||_(e.name||"user")).replace(/^@/,""),w=a(e.bio||"").replace(/\n/g,"<br>")||a(h("profile.noBio","Noch keine Bio.")),C=Be(e),j=String(n||pt(e)).trim().toLowerCase()||"profile",y=String(i||Ve(e)).trim().toLowerCase()||"posts",I=y==="menu",A=y==="checkins",F=t,k={...o?.profileView&&typeof o.profileView=="object"?o.profileView:{},profile:e,posts:Array.isArray(F)?F:[]},M=js(o,{profileView:k,profileTopTab:j,profileContentTab:y}),E=String(M?.header?.status||"").trim().toLowerCase()||"loading",N=String(M?.posts?.status||"").trim().toLowerCase()||"loading",v=e.uid||e.restaurantId||f||"public",L=`avatar:public:${v}`,R=String(e?.avatar||"").trim(),U=T(R,"avatar",{stableKey:L}),O=H(!!e.restaurantId),q=u?"":`data-img-key="avatar:public:${a(v)}"`,Y=!R&&!!String(U||"").trim()&&!G(U),X=!!R||Y&&Fe(E),ue=Pt=>{if(Pt==null)return!1;const $n=Number(Pt);return Number.isFinite($n)&&$n>=0},Ct=X||ue(e?.followers)||ue(e?.following),ae=Fe(E)&&!Ct,pe=!!String(U||"").trim()&&!G(U)&&X,Ze=ae?"...":D(e.followers),Xe=ae?"...":D(e.following),Je=C?"pt-2":"pt-10",et=b?h("profile.following","Following"):m?h("profile.requested","Requested"):p?h("profile.request","Request"):h("profile.follow","Follow"),Pe=b?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":m?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",je=s?"select-none":"app-main-content-safe",se=s?"pointer-events-none":"",te=!l,wn=!r,tt=c?u?"transition-opacity duration-200":"animate-in fade-in duration-300":"",yn=y==="posts"&&F.length>0,$s=y!=="posts"||yn||N==="empty"||N==="error",ks=y==="posts"&&!yn&&N==="error";return!s&&(y==="posts"||y==="media")&&e?.restaurantId&&Fe(N)&&_e(e),`
    <div class="${je}" ${s?'data-landing-tutorial-surface="true"':""}>
      ${j==="profile"||j==="menu"?`
      ${te?`
        <div class="app-content-inline pb-2 ${Je}">
          ${C?en(e,{mode:"public",disabledBlockClass:se,avatarUrl:U,avatarFit:O,avatarImgKeyAttr:q,renderAvatarImage:pe,identityPending:ae,followersLabel:Ze,followLabel:et,followTone:Pe,isFollowing:b,hasPendingFollowRequest:m,isLocked:p,bioHtml:w,typeLabel:x,allowTitleImageCacheFallback:Fe(E)||Fe(N)}):`
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${se}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${pe?`<img src="${a(U)}" data-fallback-src="${a(V)}" decoding="async" width="100" height="100" ${q} class="w-full h-full rounded-[1.8rem] ${O} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${ae?"animate-pulse":""}">${g(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${g("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${ae?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(Ze)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(h("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${ae?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(Xe)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(h("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(e.name||"User")}</h1>
                ${C?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${a(f)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${w}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(e.location||"-")} / ${x}</p>
                ${ae?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(h("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${a(e.handle)}" data-target-type="${a(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${a(e.restaurantId||e.uid||"")}" data-target-name="${a(e.name||"")}" data-target-avatar="${a(e.avatar||"")}" ${m?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${Pe} ${m?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${b?g("check","w-4 h-4"):""}
                    ${et}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${a(e.uid||"")}" data-chat-handle="${a(e.handle||"")}" data-chat-name="${a(e.name||"")}" data-chat-avatar="${a(e.avatar||"")}" ${p?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${p?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${g("message-circle","w-5 h-5")}
                </button>
              </div>
            </div>
          </div>
          `}
        </div>
      `:""}

      ${p?`
        <div class="app-content-inline pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${g("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${a(h("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${a(h("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${ft(e,{landingPreview:s,selectedTabOverride:y,compact:l})}
        ${wn?gt(e,{disabled:s}):""}

        ${wn?I?`
          <div class="${se} ${tt}">
            ${Oe(e)?Qt(e):Ye(e,{mode:u?"landing":"profile",allowAutoEnsure:!u})}
          </div>
        `:A?`
          <div class="${se} ${tt}">
            ${lt()}
          </div>
        `:`
          ${$s?`
            ${ks?`
              <div class="app-content-inline ${se}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${a(h("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${o.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${se} ${tt}">
                ${ot(F,o.profileViewMode,!1,{includeImageKeys:!u})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${se}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${tt}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(h("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${j==="cart"?ye(e):j==="favorites"?$e(e):""}
      `}
    </div>
  `}function Va(){const e=o.profileView;if(!e||!e.profile)return"";const t=e.profile,n=e.posts||t.posts||[],s=pt(t);return s==="landing"?Ta(t):Ge(t,n,{topTabOverride:s,tutorialMode:!1})}function tn(e,{filter:t="all",query:n=""}={}){const s=Array.isArray(e)?e:[],i=Wn(n||"");return s.filter(r=>t==="all"||ge(r.type)===t?i?`${r.name||""} ${r.category||""} ${r.description||""}`.toLowerCase().includes(i):!0:!1)}function nn(e,t=0){const n=Number(e);return Number.isFinite(n)?Math.max(0,Math.floor(n)):Math.max(0,Number(t)||0)}function Qe(e=[]){return(Array.isArray(e)?e.slice():[]).map((n,s)=>({item:n,idx:s,order:nn(n?.orderIndex,s)})).sort((n,s)=>n.order-s.order||n.idx-s.idx).map((n,s)=>({...n.item,orderIndex:nn(n.item?.orderIndex,s)}))}function mt(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function Ce(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":ge(e?.type||"food")==="drink"?"drink":"food"}function Ka(e={}){return String(e?.category||h("menu.other","Sonstiges")).trim()||h("menu.other","Sonstiges")}function qa(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const Ga=4,Qa={thumb:160,small:480,medium:768,large:1280};function an({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<Ga&&n===0}function Wa({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){const s=an({mode:e,priorityIndex:t,slideIndex:n}),i=e==="profile"?' data-image-reveal="menu"':"";return s?`loading="eager" fetchpriority="high"${i}`:`loading="lazy" fetchpriority="low"${i}`}function Ya({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function oe(e,{mode:t="profile",priorityIndex:n=-1,slideIndex:s=0,stableKey:i="",preferredSize:r="small",candidateSizes:l=["small","medium","large"],variant:c="grid"}={}){const u=String(e||"").trim(),b=t==="profile"&&i?{stableKey:i}:null,p=an({mode:t,priorityIndex:n,slideIndex:s}),m=t==="profile"&&!p&&c!=="thumb",x=T(u,r,b),f=G(x)?V:x,S=Hn(u),w=Vn(u)&&u!==f?u:S,C=[],j=new Set;l.forEach(v=>{const L=Qa[v]||0;if(!L)return;const R=T(u,v,b);if(!R||G(R))return;const U=`${R}|${L}`;j.has(U)||(j.add(U),C.push(`${R} ${L}w`))});const y=C.length>1?C.join(", "):"",I=y?Ya({variant:c}):"",A=m?"":y,F=m?"":I,z=A?` srcset="${a(A)}"`:"",k=F?` sizes="${a(F)}"`:"",M=Wa({mode:t,priorityIndex:n,slideIndex:s}),E=`${M}${z}${k}`,N=m?[`data-menu-lazy-src="${a(f)}"`,`data-menu-lazy-fallback="${a(w||V)}"`,y?`data-menu-lazy-srcset="${a(y)}"`:"",I?`data-menu-lazy-sizes="${a(I)}"`:""].filter(Boolean).join(" "):"";return{safeImg:m?V:f,fallbackImg:m?V:w,imageAttrs:E,lazyAttrs:N?` ${N}`:"",srcsetValue:y,sizesValue:I,loadingAttrs:M}}function he(e=[],t,n=null){const s=n instanceof Set?n:new Set;return e.map((i,r)=>{const l=Ka(i),c=qa(l),u=!!c&&!s.has(c);return u&&s.add(c),`<div${u?` data-menu-category-anchor="${a(c)}"`:""} class="h-full">${t(i,r)}</div>`}).join("")}function bt(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function Za(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function sn(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),n=Za(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),s=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&n?{type:"link",url:n,productId:""}:t==="product"&&s?{type:"product",url:"",productId:s}:{type:"self",url:"",productId:""}}function rn(){const e=J(o.userProfile),t=String(o.menu.filter||"all").trim().toLowerCase()||"all",n=e&&t==="drink"?"all":t;return`
    <div class="flex gap-2 mb-5">
      ${(e?[{id:"all",label:h("menu.all","Alle")},{id:"food",label:h("menu.products","Produkte")}]:[{id:"all",label:h("menu.all","Alle")},{id:"food",label:h("menu.food","Speisen")},{id:"drink",label:h("menu.drinks","Getraenke")}]).map(i=>`
        <button data-menu-filter="${i.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${n===i.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${i.label}
        </button>
      `).join("")}
    </div>
  `}function Xa(){const e=Bn().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${On.map(t=>{const n=t.id===e,s=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${n?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${n?g("check",`w-4 h-4 ${s}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function We(e,{poster:t="",objectPosition:n="50% 50%",badge:s=!0}={}){if(!jt(e))return"";const i=String(e.videoUrl||"").trim();if(!i)return"";const r=t?` poster="${a(t)}"`:"";return`<video data-autoplay-video src="${a(i)}"${r} class="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]" style="object-position:${n};" muted loop playsinline autoplay preload="metadata"></video>`+(s?'<div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none z-10"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5 fill-white block"><path d="M8 5v14l11-7z"></path></svg></div>':"")}function ht(e,{mode:t="profile",priorityIndex:n=-1}={}){const s=ne(e),i=t==="profile"?xe(e,{index:0}):"",{safeImg:r,fallbackImg:l,imageAttrs:c,lazyAttrs:u}=oe(s,{mode:t,priorityIndex:n,stableKey:i,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),b=Se(e),p=o.activeTab==="menu"?o.userProfile:o.profileView?.profile||o.userProfile,m=J(p),x=Ut(e,m),f=m?Nt(e.category):e.category||"",S=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${a(r)}" data-fallback-src="${a(l)}"${u} class="w-full h-full object-cover" style="object-position:${W(e)};" ${c} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${a(e.name||h("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${a(b)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${f?`<span>${a(f)}</span>`:""}
            <span>${a(x)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${g("more-horizontal","w-4 h-4")}
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
        <img src="${a(r)}" data-fallback-src="${a(l)}"${u} class="w-full h-full object-cover" style="object-position:${W(e)};" ${c} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${a(e.name||h("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${a(b)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${f?`<span>${a(f)}</span>`:""}
          <span>${a(x)}</span>
        </div>
        ${S?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${a(S)}</p>`:""}
      </div>
    </div>
  `}function xt(e,{mode:t="profile",variant:n="food",priorityIndex:s=-1}={}){const i=ne(e),r=t==="profile"?xe(e,{index:0}):"",l=n==="drink",{safeImg:c,fallbackImg:u,imageAttrs:b,lazyAttrs:p}=oe(i,{mode:t,priorityIndex:s,stableKey:r,preferredSize:l?"small":"medium",candidateSizes:l?["small","medium"]:["small","medium","large"],variant:l?"grid":"hero"}),m=Se(e),x=o.activeTab==="menu"?o.userProfile:o.profileView?.profile||o.userProfile,f=J(x),S=Ut(e,f),w=f?Nt(e.category):e.category||"",C=e.description||"",j=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",y=o.menu.restaurantId||o.profileView?.profile?.restaurantId||o.userProfile.restaurantId||"",I=Re(e),A=_t(y,I),F=A?zt(A):{likes:[],comments:[],counts:{likes:0,comments:0}},z=Rt(F),k=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${g("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${a(I)}">${a(D(z.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${g("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${a(I)}">${a(D(z.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${j} class="w-full ${l?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${l?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100 relative">
        <img src="${a(c)}" data-fallback-src="${a(u)}"${p} class="w-full h-full object-cover" style="object-position:${W(e)};" ${b} decoding="async" />
        ${We(e,{poster:c,objectPosition:W(e)})}
      </div>
      ${l?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${a(e.name||h("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${a(m)}</p>
          ${k}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${a(e.name||h("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${a(m)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${w?`<span>${a(w)}</span>`:""}
            <span>${a(S)}</span>
          </div>
          ${C?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${a(C)}</p>`:""}
          ${k}
        </div>
      `}
    </div>
  `}function vt(e={}){if(!e?.restaurantId||J(e))return!1;const t=String(st(e)||"").trim().toLowerCase();return t?t==="restaurant"||t==="cafe"||t==="fastfood":de(e)}function on(e){const t=e?.restaurantId||o.menu.restaurantId||o.profileView?.profile?.restaurantId||o.userProfile.restaurantId||"",n=Re(e),s=_t(t,n),i=s?zt(s):{likes:[],comments:[],counts:{likes:0,comments:0}},r=String(o.user?.uid||"").trim(),l=String(o.user?.handle||"").trim().toLowerCase(),c=!!i.likes?.some(u=>{const b=String(u?.uid||"").trim();if(r&&b&&b===r)return!0;const p=String(u?.handle||"").trim().toLowerCase();return!!l&&!!p&&p===l});return{itemId:n,meta:i,counts:Rt(i),isLiked:c}}function xe(e,{index:t=0}={}){const n=String(e?.restaurantId||o.menu.restaurantId||o.profileView?.profile?.restaurantId||o.userProfile.restaurantId||"").trim(),s=String(e?.id||Re(e)||"").trim();if(!n||!s)return"";const i=Number(t),r=Number.isFinite(i)?Math.max(0,Math.floor(i)):0;return`menu-detail:${n}:${s}:${r}`}function Ja(e){const t=typeof Tt=="function"?Tt(e):[],n=Array.isArray(t)?t.filter(Boolean):[];if(n.length)return n;const s=ne(e);return s?[s]:[]}function le(e){return Ss(e?.cardStyle||"",ge(e?.type||"food"))}function wt(e,{menuItemId:t=""}={}){if(!e)return null;const n=String(t||e.menuItemId||e.itemId||e.productId||"").trim(),s=jt(e),i=String(e.videoUrl||"").trim(),r=String(e.posterUrl||"").trim(),l=ne(e)||e.imageUrl||(s?r:"")||"";return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:l,objectPosition:e.objectPosition||W(e),menuItemId:n,mediaType:s?"video":"image",videoUrl:s?i:"",posterUrl:s?r||l:""}}function P(e=""){return`<div aria-hidden="true" class="${e} bg-slate-100 animate-pulse"></div>`}function es(e={}){return De("focus-carousel-skeleton",{...e,functionName:"renderFocusCarouselSkeleton",source:e?.source||"public-focus"}),`
      <div class="${at()} rounded-[2.5rem] p-6 border shadow-sm" data-focus-skeleton="true"${ee({skeleton:"focus-carousel-skeleton",source:"public-focus"})} aria-hidden="true">
        <div class="flex items-center justify-between mb-4">
          ${P("h-3 w-24 rounded-full")}
        <div class="flex items-center gap-2">
          ${P("w-9 h-9 rounded-full")}
          ${P("w-9 h-9 rounded-full")}
        </div>
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${P("w-full h-56")}
      </div>
      <div class="mt-4 space-y-2">
        ${P("h-5 w-2/3 rounded-full")}
        ${P("h-4 w-full rounded-full")}
        ${P("h-4 w-3/5 rounded-full")}
      </div>
    </div>
  `}function ts(e={}){return De("testfirst-focus-skeleton",{...e,functionName:"renderTestfirstFocusSkeleton",source:e?.source||"public-focus"}),`
      <div class="pt-2 pb-4" data-focus-skeleton="true"${ee({skeleton:"testfirst-focus-skeleton",source:"public-focus"})} aria-hidden="true">
        <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        <div class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col mb-2" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
            ${P("w-full h-full")}
          </div>
          <div class="px-2 py-4 space-y-2">
            ${P("h-5 w-2/3 rounded-full")}
            ${P("h-4 w-full rounded-full")}
            ${P("h-4 w-1/2 rounded-full")}
          </div>
        </div>
      </div>
    </div>
  `}function ns(){return`
    <div class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col relative" aria-hidden="true">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        ${P("w-full h-full")}
        ${P("absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90")}
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="mb-1 space-y-2">
          ${P("h-4 w-4/5 rounded-full")}
          ${P("h-3 w-3/5 rounded-full")}
        </div>
        ${P("h-3 w-full rounded-full mb-1")}
        ${P("h-3 w-2/3 rounded-full mb-3")}
        <div class="mt-auto pt-2 flex items-center justify-between">
          ${P("h-4 w-14 rounded-full")}
          ${P("w-8 h-8 rounded-full bg-slate-900/10")}
        </div>
      </div>
    </div>
  `}function as(){return`
    <div class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 relative" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;" aria-hidden="true">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${P("w-full h-full")}
        ${P("absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90")}
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div class="min-w-0 flex-1">
            ${P("h-5 w-4/5 rounded-full")}
          </div>
          ${P("h-5 w-14 rounded-full shrink-0")}
        </div>
        ${P("h-4 w-full rounded-full mb-2")}
        ${P("h-4 w-2/3 rounded-full mb-4")}
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div></div>
          <div class="h-11 w-32 rounded-2xl bg-slate-100 animate-pulse"></div>
        </div>
      </div>
    </div>
  `}function ln(e={}){return De("testfirst-menu-skeleton",{...e,functionName:"renderTestfirstMenuSkeleton",source:e?.source||"public-menu"}),`
      <div id="menu-section" class="mt-5" data-menu-skeleton="true"${ee({skeleton:"testfirst-menu-skeleton",source:"public-menu"})}>
        <section class="menu-type-block relative" data-menu-type-block="drink">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
            ${Array.from({length:4},()=>ns()).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block relative" data-menu-type-block="food">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="food">
          <div class="app-content-inline">
            ${Array.from({length:2},()=>as()).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function cn(e="food"){const t=e==="drink";return`
    <div class="w-full ${t?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm" aria-hidden="true">
      <div class="w-full ${t?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        ${P("w-full h-full")}
      </div>
      ${t?`
        <div class="mt-3 flex flex-1 flex-col space-y-2">
          ${P("h-4 w-4/5 rounded-full")}
          ${P("h-3 w-1/2 rounded-full")}
          <div class="mt-2 flex items-center gap-3">
            ${P("h-3 w-10 rounded-full")}
            ${P("h-3 w-10 rounded-full")}
          </div>
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            ${P("h-4 w-3/5 rounded-full")}
            ${P("h-4 w-14 rounded-full")}
          </div>
          ${P("h-3 w-2/5 rounded-full mt-2")}
          ${P("h-3 w-full rounded-full mt-3")}
          ${P("h-3 w-2/3 rounded-full mt-2")}
          <div class="mt-3 flex items-center gap-3">
            ${P("h-3 w-10 rounded-full")}
            ${P("h-3 w-10 rounded-full")}
          </div>
        </div>
      `}
    </div>
  `}function ss(){return`
      <article class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col"${ee({skeleton:"shop-product-card-skeleton",source:"public-menu"})} aria-hidden="true">
        <div class="rounded-[1.5rem] overflow-hidden bg-slate-100" style="aspect-ratio:4 / 5;">
        ${P("w-full h-full")}
      </div>
      <div class="pt-3 flex-1 flex flex-col min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1 space-y-2">
            ${P("h-4 w-full rounded-full")}
            ${P("h-4 w-3/5 rounded-full")}
          </div>
          ${P("h-3 w-10 rounded-full shrink-0")}
        </div>
        ${P("h-3 w-full rounded-full mt-3")}
        ${P("h-3 w-2/3 rounded-full mt-2")}
      </div>
    </article>
  `}function dn({isShop:e=!1,debugContext:t={}}={}){return De(e?"standard-shop-product-skeleton":"standard-menu-skeleton",{...t,functionName:"renderStandardMenuSkeleton",source:t?.source||"public-menu",reason:t?.reason||(e?"shop-products-loading":"menu-loading")}),e?`
        <div class="grid grid-cols-2 gap-4" data-menu-skeleton="true"${ee({skeleton:"standard-shop-product-skeleton",source:"public-menu"})}>
          ${Array.from({length:4},()=>ss()).join("")}
        </div>
      `:`
      <div data-menu-skeleton="true"${ee({skeleton:"standard-menu-skeleton",source:"public-menu"})} class="space-y-5">
        <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
        <div class="flex items-center justify-between mb-4">
          ${P("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-4">
            ${Array.from({length:4},()=>cn("drink")).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
        <div class="flex items-center justify-between mb-4">
          ${P("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="food">
          <div class="space-y-4">
            ${Array.from({length:2},()=>cn("food")).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function un(e,t=[],{mode:n="profile"}={}){const s=e?.restaurantId||"",i=vt(e)||J(e);return!s||!i||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((r,l)=>{const c=r.imageUrl||"",u=String(r.menuItemId||r.id||"").trim(),{safeImg:b,fallbackImg:p,imageAttrs:m,lazyAttrs:x}=oe(c,{mode:n,priorityIndex:l,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:u?`menu-focus:${s}:${u}`:""}),f=String(r.menuItemId||"").trim(),S=n==="profile"&&f?`data-menu-open="${a(f)}" role="button"`:"";return`
            <div ${S} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${S?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${a(b)}" data-fallback-src="${a(p)}"${x} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${r.objectPosition||"50% 50%"};" ${m} decoding="async" />
                ${We(r,{poster:b,objectPosition:r.objectPosition||"50% 50%",badge:!1})}
                <div class="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${g("sparkles","w-3 h-3 text-amber-500")}
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
  `}function pn(e,{mode:t="profile",priorityIndex:n=-1}={}){const s=ne(e),i=t==="profile"?xe(e,{index:0}):"",{safeImg:r,fallbackImg:l,imageAttrs:c,lazyAttrs:u}=oe(s,{mode:t,priorityIndex:n,stableKey:i,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),b=Se(e),p=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",{itemId:m,counts:x,isLiked:f}=on(e);return`
    <div ${p} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${a(r)}" data-fallback-src="${a(l)}"${u} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${W(e)};" ${c} decoding="async" />
        ${We(e,{poster:r,objectPosition:W(e)})}
        <button
          type="button"
          data-menu-card-like="${a(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${f?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${f?"true":"false"}"
        >
          ${g("heart","w-3.5 h-3.5 fill-current opacity-80")}
        </button>
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-[14px] font-black text-slate-900 leading-tight">${a(e.name||"")}</h4>
        </div>
        <p class="text-[12px] text-slate-500 leading-relaxed mb-3">${a(e.description||"")}</p>
        <div class="mt-auto pt-2 flex items-center justify-between">
          <span class="text-[14px] font-black text-slate-900">${a(b)}</span>
          <button type="button" class="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors active:scale-95">
            ${g("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${a(m)}">${a(D(x.likes))}</span>
          <span data-menu-comment-count="${a(m)}">${a(D(x.comments))}</span>
        </div>
      </div>
    </div>
  `}function rs(e,t="profile"){if(t!=="profile")return"";const n=sn(e);return n.type==="link"&&n.url?`data-menu-special-link="${a(n.url)}" role="button" tabindex="0"`:n.type==="product"&&n.productId?`data-menu-open="${a(n.productId)}" role="button"`:`data-menu-open="${a(e.id)}" role="button"`}function yt(e,{mode:t="profile",size:n="default",priorityIndex:s=-1}={}){const i=ne(e),r=t==="profile"?xe(e,{index:0}):"",l=n==="food",{safeImg:c,fallbackImg:u,imageAttrs:b,lazyAttrs:p}=oe(i,{mode:t,priorityIndex:s,stableKey:r,preferredSize:l?"medium":"small",candidateSizes:l?["small","medium","large"]:["small","medium"],variant:l?"hero":"grid"}),m=rs(e,t),x=String(e.category||"Special").trim()||"Special",f=a(String(e.name||"Special")).replace(/\n/g,"<br>");return n==="food"?`
      <div ${m} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${a(c)}" data-fallback-src="${a(u)}"${p} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${W(e)};" ${b} decoding="async" />
        ${We(e,{poster:c,objectPosition:W(e)})}
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${g("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${a(x)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${f}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${m} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${a(c)}" data-fallback-src="${a(u)}"${p} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${W(e)};" ${b} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${g("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${a(x)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${f}</h4>
        </div>
      </div>
    </div>
  `}function fn(e,{mode:t="profile",priorityIndex:n=-1}={}){const s=Se(e),i=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",r=Ja(e),c=(r.length?r:[ne(e)||""]).filter(Boolean),u=c.length?c.slice(0,12):[""],b=u.length>1,{itemId:p,counts:m,isLiked:x}=on(e),f=D(Math.max(0,Number(m.likes)||0)),S=D(Math.max(0,Number(m.comments)||0));return`
    <div ${i} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${b?`
          <div
            data-menu-card-gallery-track="${a(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${u.map((w,C)=>{const j=t==="profile"?xe(e,{index:C}):"",y=oe(w||"",{mode:t,priorityIndex:n,slideIndex:C,stableKey:j,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),I=C>0,A=I?V:y.safeImg,F=I?V:y.fallbackImg,z=I?y.loadingAttrs:y.imageAttrs,k=I?"":y.lazyAttrs||"",M=I?` data-menu-card-deferred-src="${a(y.safeImg)}"
                    data-menu-card-deferred-fallback="${a(y.fallbackImg)}"
                    ${y.srcsetValue?`data-menu-card-deferred-srcset="${a(y.srcsetValue)}"`:""}
                    ${y.sizesValue?`data-menu-card-deferred-sizes="${a(y.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${C}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${a(A)}" data-fallback-src="${a(F)}"${k}${M} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${W(e)};" ${z} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${u.map((w,C)=>{const j=t==="profile"?xe(e,{index:C}):"",{safeImg:y,fallbackImg:I,imageAttrs:A,lazyAttrs:F}=oe(w||"",{mode:t,priorityIndex:n,slideIndex:C,stableKey:j,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${a(y)}" data-fallback-src="${a(I)}"${F} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${W(e)};" ${A} decoding="async" />
              </div>
            `}).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${a(e.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${x?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${x?"true":"false"}"
        >
          ${g("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${b?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${u.map((w,C)=>`
              <div
                data-menu-card-gallery-dot="${a(e.id)}"
                data-menu-card-gallery-index="${C}"
                class="${C===0?"w-4 h-1.5 bg-white rounded-full shadow-sm":"w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm"}"
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
              <span data-menu-like-count="${a(p)}">${a(f)}</span>
              <span data-menu-comment-count="${a(p)}">${a(S)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${a(h("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${g("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function is(e,t,{mode:n="profile",publicMenuSurfaceState:s=null,focusFallbackHtml:i=""}={}){const r=Qe(Array.isArray(t)?t:[]),l=String(e?.restaurantId||"").trim(),c=n==="admin"||aa(l),u=s?.focus?.canRenderFocus?{items:Array.isArray(s.focus.items)?s.focus.items:[],enabled:!0}:l&&c?Me(l):{items:[],enabled:!1},b=u.enabled?(Array.isArray(u.items)?u.items:[]).map(v=>wt({...v,objectPosition:me(v)})):[],p=r.filter(v=>le(v)==="testfirst_focus"&&!mt(v)).map(v=>wt(v,{menuItemId:v.id||""})).filter(Boolean),m=new Set,x=[...b,...p].filter(v=>{const L=String(v.menuItemId||v.id||`${v.title}|${v.text}|${v.imageUrl}`);return!L||m.has(L)?!1:(m.add(L),!0)}),f=r.filter(v=>!mt(v)),S=f.filter(v=>le(v)!=="testfirst_focus"),w=S.length?S:f,C=S.length?x:[],j=w.filter(v=>Ce(v)==="drink"),y=w.filter(v=>Ce(v)!=="drink"),I=(v=[])=>{const L=[],R=[];return v.forEach(U=>{const O=le(U);O==="testfirst_food"||O==="testfirst_special"&&bt(U)==="food"?R.push(U):L.push(U)}),{gridItems:L,foodItems:R}},A=(v,L=-1)=>le(v)==="testfirst_special"?yt(v,{mode:n,priorityIndex:L}):pn(v,{mode:n,priorityIndex:L});let F=0;const z=()=>{const v=F;return F+=1,v},k=new Set,M=(v,L)=>!L.gridItems.length&&!L.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${a(v)}">
        ${L.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${a(v)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${he(L.gridItems,R=>A(R,z()),k)}
            </div>
          </div>
        `:""}
        ${L.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${a(v)}">
            <div class="app-content-inline">
              ${he(L.foodItems,R=>{const U=le(R),O=z();return U==="testfirst_special"?yt(R,{mode:n,size:"food",priorityIndex:O}):fn(R,{mode:n,priorityIndex:O})},k)}
            </div>
          </div>
        `:""}
      </section>
    `,E=I(j),N=I(y);return`
    <div>
      ${un(e,C,{mode:n})||i}
      <div id="menu-section" class="mt-5">
        ${M("drink",E)}
        ${M("food",N)}
      </div>
    </div>
  `}function gn(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:s=null,priorityOffset:i=0}={}){return e.length?n?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${he(e,(r,l)=>pn(r,{mode:t,priorityIndex:i+l}),s)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${he(e,(r,l)=>xt(r,{mode:t,variant:"drink",priorityIndex:i+l}),s)}
    </div>
  `:""}function mn(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:s=null,priorityOffset:i=0}={}){return e.length?n?`
      <div>
        ${he(e,(r,l)=>le(r)==="testfirst_special"&&bt(r)==="food"?yt(r,{mode:t,size:"food",priorityIndex:i+l}):fn(r,{mode:t,priorityIndex:i+l}),s)}
      </div>
    `:`
    <div class="space-y-4">
      ${he(e,(r,l)=>xt(r,{mode:t,variant:"food",priorityIndex:i+l}),s)}
    </div>
  `:""}function bn(e,{mode:t="profile"}={}){if(t==="admin"){const n=String(o?.menu?.filter||"all").trim().toLowerCase(),s=J(o.userProfile),i=h("menu.products","Produkte"),r=e.filter(p=>ge(p?.type)==="drink"),l=e.filter(p=>ge(p?.type)!=="drink"),c=(p,m,{addType:x=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${a(p)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${a(p)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(D(m.length))} Eintraege</p>
          </div>
          ${x?`
            <button type="button" data-menu-add-${a(x)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${g("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${m.length?`<div class="space-y-3">${m.map(f=>ht(f,{mode:"admin"})).join("")}</div>`:(Ue({functionName:"renderMenuList.adminSection",items:m,rawItems:m,filteredItems:m,renderDecision:"admin-section-no-products",source:"admin-menu"}),`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300"${ee({source:"admin-menu:no-products"})}>${a(h("menu.noProducts","Keine Produkte"))}</div>`)}
      </div>
    `;if(s)return c(i,e,{addType:"food"});const u=[{title:h("menu.drinks","Getraenke"),list:r,addType:"drink"},{title:h("menu.food","Speisen"),list:l,addType:"food"}];if(n==="all")return`
        <div>
          ${u.map(p=>c(p.title,p.list,{addType:p.addType})).join("")}
        </div>
      `;const b=u.filter(p=>p.list.length>0);return b.length?`
      <div>
        ${b.map(p=>c(p.title,p.list,{addType:p.addType})).join("")}
      </div>
    `:n==="drink"?c(h("menu.drinks","Getraenke"),[],{addType:"drink"}):n==="food"?c(h("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((n,s)=>ht(n,{mode:t,priorityIndex:s})).join("")}
    </div>
  `:(Ue({functionName:"renderMenuList",items:e,rawItems:e,filteredItems:e,renderDecision:"menu-list-no-products",source:t}),`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]"${ee({source:`${t}:no-products`})}>
        ${a(h("menu.noProducts","Keine Produkte"))}
      </div>
    `)}function $t(e,{variant:t="focus",suppressLoading:n=!1}={}){if(!e)return"";const{items:s,enabled:i,loading:r}=Me(e,{includeInactive:!0}),l=D(s.length),c=String(t||"").trim().toLowerCase()==="travel-offers",u=c?"Ofertat":"Sot ne Fokus",b=c?"Oferta":"Highlights",p=c?"Im Travel und Profil sichtbar":"Im Profil sichtbar",m=c?"Ofertat werden geladen...":h("focus.loading","Fokus wird geladen..."),x=c?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${a(u)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${a(b)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(l)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${g("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${c?"Oferta anzeigen":"Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${a(p)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${i?"checked":""} />
      </label>

      ${s.length?`
        <div class="space-y-3">
          ${s.map(f=>{const S=T(f.imageUrl||"","thumb"),w=G(S)?V:S,C=f.active!==!1?"Aktiv":"Inaktiv",j=f.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(w)}" class="w-full h-full object-cover" style="object-position:${me(f)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(f.title||"Sot ne Fokus")}</p>
                  ${f.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(f.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${j}">${C}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${a(f.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${a(f.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:r&&!n?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(m)}</div>
      `:r?"":`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${a(x)}</div>
      `}
    </div>
  `}function hn(e={}){if(!e?.restaurantId)return!1;const t=String(st(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)||t==="ecommerce"||J(e)?!1:de(e)||["restaurant","cafe","coffee","fastfood","food"].includes(t)||!t}function os(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Freigegeben",className:"text-emerald-600"}:t==="rejected"?{label:"Abgelehnt",className:"text-rose-600"}:{label:"Wartet auf Heart",className:"text-amber-600"}}function ls(e,t){if(!t||!hn(e))return"";const{items:n,loading:s}=qn(t,{includeInactive:!0}),i=D(n.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(i)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${g("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${n.length?`
        <div class="space-y-3">
          ${n.map(r=>{const l=T(r.imageUrl||"","thumb"),c=G(l)?V:l,u=os(r),b=r.category||"RESTAURANT",p=r.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(c)}" class="w-full h-full object-cover" style="object-position:${me(r)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(r.title||"Ad")}</p>
                  ${r.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(r.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${a(b)} · ${a(p)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${u.className}">${a(u.label)}</p>
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
  `}function kt(e){if(Array.isArray(e))return e.map(n=>String(n||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(n=>n.trim()).filter(Boolean):[]}function cs(e={}){const t=String(e?.restaurantId||"").trim(),n=t?ke(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{},...t?{restaurantId:t}:{}}}function St(e={}){return e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{}}function ds(e={}){const t=St(e);return[...kt(t.productIds),...kt(e.shoppingLandingCardProductIds),...kt(e.shoppingLandingProductIds)].filter(Boolean)}function It(e={}){return!e||typeof e!="object"?{}:Object.entries(e).reduce((t,[n,s])=>{const i=String(n||"").trim(),r=String(s||"").trim();return i&&r&&(t[i]=r),t},{})}function us(e={}){const t=St(e);return{...It(e.shoppingLandingProductImageOverrides),...It(t.productImageOverrides)}}function ps(e=""){const t=String(e||"").trim(),n=o.shoppingLandingCardEditor&&typeof o.shoppingLandingCardEditor=="object"?o.shoppingLandingCardEditor:{},s=String(n.restaurantId||"").trim();return s&&s!==t?{}:n}function fs(e){return e?typeof e=="string"?e.trim():typeof e!="object"?String(e||"").trim():String(e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||"").trim():""}function gs(e={}){const n=[ne(e),...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(fs).filter(Boolean);return n.filter((s,i)=>n.indexOf(s)===i)}function ms(e={},t={},n={}){const s=String(e?.id||e?.productId||e?.menuItemId||"").trim();if(!s)return null;const i=gs(e).map(p=>({rawUrl:p,imageUrl:T(p,"thumb")})).filter(p=>p.rawUrl&&!G(p.imageUrl)),r=i[0]?.rawUrl||"",l=String(t?.[s]||"").trim(),c=String(n?.[s]||"").trim(),u=c||l||r,b=u?T(u,"thumb"):"";return{id:s,name:String(e.name||e.title||"Produkt").trim(),price:Se(e),imageUrl:b&&!G(b)?b:"",defaultImageRaw:r,cardImageUrl:l,previewImageUrl:c,imageCandidates:i,objectPosition:W(e)}}function bs(e={},t="",n=[]){if(!t||!J(e))return"";const s=cs(e),i=St(s),r=ps(t),l=r.saving===!0,c=String(r.status||"").trim(),u=/fehl|error|nicht|nuk|kein/i.test(c),b=String(i.imageUrl||s.shoppingLandingCardImageUrl||s.shoppingLandingImageUrl||"").trim(),p=String(s.logoUrl||s.logo||s.logoURL||s.avatar||e.avatar||"").trim(),m=String(r.imageUrlDraft??b).trim(),x=String(r.imagePreview||m||p||"").trim(),f=x?T(x,"large"):V,S=String(r.titleDraft??(i.title||s.shoppingLandingCardTitle||e.name||"")).trim(),w=r.active!==void 0?r.active!==!1:i.active!==!1&&s.shoppingLandingCardEnabled!==!1,C=ds(s),j=Array.isArray(r.productIds)?r.productIds.map(k=>String(k||"").trim()).filter(Boolean):null,y=new Set(j||C),I={...us(s),...It(r.productImageOverrides)},A=r.productImagePreviews&&typeof r.productImagePreviews=="object"?r.productImagePreviews:{},F=(Array.isArray(n)?n:[]).filter(k=>k&&String(k.id||"").trim()&&k.hidden!==!0&&k.available!==!1).map(k=>ms(k,I,A)).filter(Boolean),z=y.size?`${D(y.size)} ausgewaehlt`:"Keine Auswahl = alle Produkte";return`
    <div data-shopping-landing-card-editor="${a(t)}" class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Landing Card</span>
          <h3 class="text-xl font-black italic tracking-tighter">Shopping Card</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(z)}</p>
        </div>
        <button type="button" id="shoppingLandingImageTrigger" class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95" aria-label="Bild hochladen">
          ${g("plus","w-4 h-4")}
        </button>
      </div>

      <input id="shoppingLandingImageInput" type="file" accept="image/*" class="hidden" />
      <input id="shoppingLandingImageUrl" type="hidden" value="${a(m)}" />

      <div class="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-4">
        <img src="${a(f||V)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div class="absolute inset-x-0 top-0 h-16 pointer-events-none" style="background:linear-gradient(to bottom, rgba(255,255,255,0.7), transparent);"></div>
        <div class="absolute left-4 bottom-4 right-4">
          <span class="inline-flex max-w-full truncate text-[10px] uppercase tracking-wider font-extrabold text-slate-800 bg-white backdrop-blur-sm py-1 px-2.5 rounded-full" style="background:rgba(255,255,255,0.8);">
            ${a(S||"Shop Picks")}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label for="shoppingLandingTitleInput" class="text-[10px] font-black text-slate-400 uppercase ml-2">Titel</label>
          <input id="shoppingLandingTitleInput" type="text" value="${a(S)}" placeholder="Summer Picks" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-amber-100" />
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
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${a(D(F.length))}</span>
          </div>
          ${F.length?`
            <div class="grid grid-cols-1 gap-2">
              ${F.map(k=>{const M=y.has(k.id),E=k.imageUrl||V,N=String(k.defaultImageRaw||k.imageCandidates[0]?.rawUrl||"").trim(),v=String(k.cardImageUrl||"").trim(),L=String(k.previewImageUrl||"").trim(),R=!!(L||v&&v!==N),U=L||(v&&!k.imageCandidates.some(O=>O.rawUrl===v)?v:"");return`
                  <div class="rounded-2xl bg-white border border-slate-100 p-3">
                    <label class="flex items-center gap-3">
                      <input type="checkbox" data-shopping-landing-product="${a(k.id)}" class="w-4 h-4 accent-amber-500" style="accent-color:#f97316;" ${M?"checked":""} />
                      <span class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src="${a(E)}" class="w-full h-full object-cover" style="object-position:${a(k.objectPosition||"50% 50%")};" loading="lazy" decoding="async" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-xs font-black text-slate-900 truncate">${a(k.name)}</span>
                        ${k.price?`<span class="block text-[10px] font-bold text-slate-400 mt-0.5">${a(k.price)}</span>`:""}
                      </span>
                    </label>
                    ${M?`
                      <div class="mt-3 pt-3 border-t border-slate-100">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Card-Bild</span>
                          <div class="flex items-center gap-2">
                            ${R?`
                              <button type="button" data-shopping-landing-product-image-reset="${a(k.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 active:scale-95">
                                Standard
                              </button>
                            `:""}
                            <button type="button" data-shopping-landing-product-image-upload="${a(k.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest active:scale-95">
                              Upload
                            </button>
                            <input type="file" accept="image/*" data-shopping-landing-product-image-input="${a(k.id)}" class="hidden" />
                          </div>
                        </div>
                        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                          ${k.imageCandidates.map((O,q)=>{const Y=q===0,X=L?!1:Y?!R:v===O.rawUrl;return`
                              <label class="shrink-0 w-16">
                                <input type="radio" name="shoppingLandingProductImage_${a(k.id)}" data-shopping-landing-product-image-choice="${a(k.id)}" value="${Y?"":a(O.rawUrl)}" class="hidden" ${X?"checked":""} />
                                <span class="block h-16 rounded-2xl overflow-hidden border ${X?"border-slate-900":"border-slate-100"} bg-slate-100">
                                  <img src="${a(O.imageUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </span>
                                <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">${q+1}</span>
                              </label>
                            `}).join("")}
                          ${U?`
                            <label class="shrink-0 w-16">
                              <input type="radio" name="shoppingLandingProductImage_${a(k.id)}" data-shopping-landing-product-image-choice="${a(k.id)}" value="${a(U)}" class="hidden" checked />
                              <span class="block h-16 rounded-2xl overflow-hidden border border-slate-900 bg-slate-100">
                                <img src="${a(T(U,"thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
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

        ${c?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${u?"text-rose-500":"text-slate-500"}">${a(c)}</div>`:""}

        <button id="shoppingLandingSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${l?"disabled":""}>
          ${l?"Speichern...":"Landing Card speichern"}
        </button>
      </div>
    </div>
  `}function hs(e){if(!vt(e)||!Bt(e))return"";const n=Qe((o.menu.items||[]).filter(s=>le(s)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(D(n.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${g("plus","w-4 h-4")}
        </button>
      </div>
      ${n.length?`
        <div class="space-y-3">
          ${n.map(s=>{const i=T(ne(s),"thumb"),r=G(i)?V:i,l=sn(s),c=l.type==="link"?"Link":l.type==="product"?"Produkt-Modal":"Diese Karte",u=bt(s)==="food"?"Food-Size":"Normal",b=ta(Ce(s));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(r)}" class="w-full h-full object-cover" style="object-position:${W(s)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(s.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${a(b)}</span>
                    <span>${a(u)}</span>
                    <span>${a(c)}</span>
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
  `}function xn(e,{restaurantId:t="",suppressLoading:n=!1,allowAutoEnsure:s=!0,requirePublicMenuTruth:i=!0}={}){const r=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!r||!de(e))return"";const l=Ae(o,{profile:e,routePayload:o?.profileView?.routePayload,webDirectEntry:o?.__webDirectEntry,restaurantId:r});if(i&&l.menu.status!=="ready")return"";const c=!i||l.focus.canRenderFocus;if(s&&!o.focus.loading&&!c&&ze(Dt(e,r)),i&&!c)return"";const{items:u,loading:b}=c?{items:Array.isArray(l.focus.items)?l.focus.items:[],loading:l.focus.loading}:Me(r);if(!(c?!0:Me(r).enabled)||!u.length&&!b||n&&b&&!u.length)return"";if(b&&!u.length)return`
      <div class="${at()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(h("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const m=Gn(u),x=u[m]||u[0],{safeImg:f,fallbackImg:S,imageAttrs:w,lazyAttrs:C}=oe(x.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:x?.id?`focus-carousel:${r}:${String(x.id)}`:""}),j=x.text||"";return`
    <div id="focusCarousel" class="${at()} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${u.length>1?`
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${g("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${g("chevron-right","w-4 h-4")}
            </button>
          </div>
        `:""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${jt(x)&&String(x.videoUrl||"").trim()?`
          <video data-focus-media="video" data-focus-video data-autoplay-video src="${a(String(x.videoUrl||"").trim())}" ${f?`poster="${a(f)}"`:""} class="w-full h-56 object-cover" style="object-position:${me(x)};" muted loop playsinline autoplay preload="metadata"></video>
          <div class="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-white block"><path d="M8 5v14l11-7z"></path></svg>
          </div>
        `:`
          <img data-focus-media="image" data-focus-image src="${a(f)}" data-fallback-src="${a(S)}"${C} class="w-full h-56 object-cover" style="object-position:${me(x)};" ${w} decoding="async" />
        `}
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${a(x.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${j?"":"hidden"}">${a(j)}</p>
      </div>
      ${u.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${u.map((I,A)=>`
            <button type="button" data-focus-dot="${A}" class="w-2.5 h-2.5 rounded-full ${A===m?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function xs(e,t=220){const n=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${n}`}function vn({label:e,url:t,caption:n}){if(!t)return"";const s=xs(t,240);return`
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
  `}function vs({profile:e,restaurantId:t,catalogLabel:n}){if(!t||!de(e))return"";if(typeof Ft=="function"){const r=Ee?Ee(t):null;(!r||r.sameRestaurant!==!0||!r.loading&&!r.loaded&&!r.error)&&Ft(e)}const s=typeof Ee=="function"?Ee(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},i=(s.tables||[]).map(r=>{const l=Qn("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:r});return vn({label:`Tisch ${r}`,url:l,caption:`${n} fuer Tisch ${r}`})}).join("");return`
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
  `}function ws(){const e=o.userProfile,t=e.restaurantId||"",n=String(o.user?.uid||"").trim(),s=String(o.__authBootstrapInFlightUid||"").trim(),i=!t&&!!n&&(!!o.__authProfileLoadPromise||s===n),r=Oe(e),l=de(e),c=o.profileView?.profile?.restaurantId?o.profileView.profile:null,u=Te()&&!!c?.restaurantId&&de(c),b=J(e),p=ea(En(e)),m=t?ke(t):null,x=m?.name||m?.restaurantName||e.name||"Business",f=t&&o.menu.restaurantId===t,S=String(o.menu.source||"").trim().toLowerCase(),w=!!f&&S==="collection",C=!!f&&S==="collection"&&o.menu.loading,j=!!t&&(C||!w),y=b?"all":o.menu.filter,I=w?tn(o.menu.items,{filter:y,query:o.menu.query}):[],F=Bt(e)?I:I.filter(M=>!oa(M)),z=Qe(F),k=D(z.length);if(t&&r){ca(e);const M=String(o.focus?.truthSource||"").trim().toLowerCase();return!o.focus.loading&&(o.focus.restaurantId!==t||M!=="public-menu")&&ze(e),Aa(e)}return t&&l&&!w&&!C&&Rn(e),t&&l&&!o.focus.loading&&o.focus.restaurantId!==t&&ze(e),t&&hn(e)&&Mn(e),l?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${p}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(x)}</p>
        </div>
      </div>

      ${t?`
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${a(k)}</p>
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

      ${t?$t(t):""}
      ${t?ls(e,t):""}
      ${t?bs(e,t,w?o.menu.items:[]):""}
      ${t&&w?hs(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${g("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${a(o.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${rn()}

        ${j?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(h("menu.loading",`${p} wird geladen...`,{label:p}))}</div>`:bn(z,{mode:"admin"})}
        ${o.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${a(o.menu.error)}</div>`:""}
        ${vs({profile:e,restaurantId:t,catalogLabel:p})}
      `:""}

    </div>
  `:u?Ye(c):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${g("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${p}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function Ye(e,{mode:t="profile",allowAutoEnsure:n=!0}={}){const s=o?.profileView?.routePayload&&typeof o.profileView.routePayload=="object"?o.profileView.routePayload:null,i=o?.__webDirectEntry&&typeof o.__webDirectEntry=="object"&&o.__webDirectEntry.active===!0?o.__webDirectEntry:null;let r=Ae(o,{profile:e,routePayload:s,webDirectEntry:i});const l=r.restaurantId||na(e,s);if(!l)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${a(h("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const c=Dt(e,l),u=J(c),b=de(c)&&!u;b&&(r=Ae(o,{profile:c,routePayload:s,webDirectEntry:i,restaurantId:l}));const p=String(i?.canonicalRestaurantId||i?.restaurantId||"").trim(),m=new Set(r.targetIds),x=r.menu.status==="ready",f=r.focus.canRenderFocus,S=x&&b,w=r.focus.matches===!0&&r.focus.loading===!0,j=String(o?.profileView?.menuAccessSource||i?.menuAccessSource||s?.menuAccessSource||"").trim().toLowerCase()==="qr",y=i?.active===!0&&i?.webPriority===!0&&i?.menuFirst===!0&&String(o?.activeTab||"").trim().toLowerCase()==="profile"&&String(o?.profileTopTab||"").trim().toLowerCase()==="menu"&&(p===l||m.has(l)),I=y&&!j,A=["ready","empty","error"].includes(r.menu.status),F=y&&A,z=y&&(!S||r.menu.status!=="ready"),k=!S||r.focus.settled===!0||r.focus.confirmedEmpty===!0||r.menu.status!=="ready";n&&!F&&!A&&zn(c),n&&!z&&!k&&!w&&x&&(!I||A)&&ze(c);const E=r.menu.canRenderItems?Qe(tn(r.menu.items,{filter:"all",query:""})).filter(te=>!mt(te)):[],N=r.menu.error||"",v=Is(r.menu,E),{hasItems:L,hasError:R,isLoading:U,shouldRenderNoProducts:O}=v;Zn({profile:c,routePayload:s,surface:r,decision:v});const q={profile:c,routePayload:s,surface:r,decision:v,rawItems:r.menu.items,items:E,filteredItems:E,source:"public-menu"},Y=Jn(r,E),X=E.filter(te=>Ce(te)==="drink"),ue=E.filter(te=>Ce(te)!=="drink"),Ct=0,ae=X.length,pe=vt(e),Ze=pe||u,Xe=new Set;L&&l&&(Nn(E,l),ra(E,l));const Je=l&&f?(Array.isArray(r.focus.items)?r.focus.items:[]).map(te=>wt({...te,objectPosition:me(te)})).filter(Boolean):[],et=r.focus.status==="empty"||r.focus.status==="error",Pe=b&&!f&&!et&&r.menu.status!=="empty"&&r.menu.status!=="error",je=Je.length?un(c,Je,{mode:t}):Pe?ts({...q,reason:"focus-truth-pending"}):"",se=Ze?je:xn(c,{restaurantId:l,suppressLoading:!0,allowAutoEnsure:x&&(!I||A),requirePublicMenuTruth:!0})||(Pe?es({...q,reason:"focus-truth-pending"}):"");return pe?`
      <div class="app-main-content-safe"${Y}>
        ${U?`
          ${je}
          ${ln({...q,reason:"menu-loading"})}
        `:`
          ${L?is(c,E,{mode:t,publicMenuSurfaceState:r,focusFallbackHtml:je}):R?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(h("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:O?(Ue({...q,functionName:"renderProfileMenuView",renderDecision:"testfirst-no-products"}),`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300"${ee({source:"public-menu:no-products"})}>${a(h("menu.noProducts","Keine Produkte"))}</div>`):ln({...q,reason:"menu-not-confirmed-empty"})}
          ${N?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(N)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5"${Y}>
      ${se}
      ${U?`
        ${dn({isShop:u,debugContext:{...q,reason:"menu-loading"}})}
      `:`
        ${L?`
          ${u?`
            ${Dn(E,{profile:e})}
          `:`
            ${X.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${a(h("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${gn(X,{mode:t,useTestfirstCardUi:pe,seenCategories:Xe,priorityOffset:Ct})}
                </div>
              </section>
            `:""}
            ${ue.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${a(h("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${mn(ue,{mode:t,useTestfirstCardUi:pe,seenCategories:Xe,priorityOffset:ae})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${R?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                ${a(h("menu.loadError","Menu konnte nicht geladen werden"))}
              </div>
            </div>
          `:O?`
            ${Ue({...q,functionName:"renderProfileMenuView",renderDecision:u?"shop-no-products":"standard-no-products"}),`<div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm"${ee({source:"public-menu:no-products"})}>
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${a(h("menu.noProducts","Keine Produkte"))}
              </div>
            </div>`}
          `:`
            ${dn({isShop:u,debugContext:{...q,reason:"menu-not-confirmed-empty"}})}
          `}
        `}
        ${N?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(N)}</div>`:""}
      `}
    </div>
  `}function ys(){const e=o.userProfile,t=Q(e),n=t?o.businessPosts:o.userPosts,s=String(o.user?.uid||e?.uid||"").trim(),i=String(e?.restaurantId||"").trim(),r=String(o.__userPostsLoadingUid||"").trim(),l=String(o.__businessPostsLoadingRestaurantId||"").trim(),c=String(o.__authBootstrapInFlightUid||"").trim(),u=!!s&&r===s,b=!!i&&l===i,p=!!s&&c===s,m=t?b||p&&!n.length:u||p&&!n.length,x=String(e.handle||_(e.name||"user")).replace(/^@/,""),S=a(e.bio||"").replace(/\n/g,"<br>")||a(h("profile.noBio","Noch keine Bio.")),w=Ve(e),C=w==="menu",j=w==="checkins",y=n,I=T(e.avatar,"avatar"),A=H(t),F=pt(e);return`
    <div class="app-main-content-safe">
      ${F==="profile"||F==="menu"?`
      <div class="app-content-inline pb-2 ${t?"pt-2":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${t?en(e,{mode:"self",avatarUrl:I,avatarFit:A,followersLabel:D(e.followers),bioHtml:S}):`
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${a(I)}" data-fallback-src="${a(V)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${A} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${g("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${a(D(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(h("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${a(D(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(h("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${a(x)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${S}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(e.location||"-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" data-upload-intent="chooser" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${g("plus","w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${g("settings","w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
        `}
      </div>

      ${ft(e)}
      ${gt(e)}

      ${C?`
        ${Oe(e)?Qt(e):Ye(e)}
      `:j?`
        ${lt()}
      `:`
        ${m&&!y.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(h("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${o.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${ot(y,o.profileViewMode)}
          </div>
          ${w==="posts"?`
            <div class="app-content-inline mt-8 mb-4">
              <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  ${g("plus","w-4 h-4")} Neuen Beitrag
                </span>
                <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          `:""}
        `}
      `}
      `:`
        ${F==="cart"?ye(e):F==="favorites"?$e(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:Ot,renderProfilePostsFancy:ot,renderProfileCheckins:lt,renderProfileTabs:ft,renderProfileViewControls:gt,renderPublicProfileView:Va,renderMenuFilterRow:rn,renderMenuLayoutSection:Xa,renderMenuItemCard:ht,renderMenuItemCardStacked:xt,renderMenuDrinkGrid:gn,renderMenuFoodList:mn,renderMenuList:bn,renderFocusAdminSection:$t,renderFocusCarousel:xn,renderMenuQrCard:vn,renderMenuAdminView:ws,renderProfileMenuView:Ye,renderProfileView:ys}}export{rr as createProfileMenuFocusRenderController};
