import{_ as rt}from"./domain-auth-DlRF6Rfv.js";const zt={"app.title":"MNYRA"},_={de:{},en:zt},st="menyra_lang",w="de",nt={sq:()=>rt(()=>import("./sq-Ba9dksVU.js"),[]),sr:()=>rt(()=>import("./sr-Cghmj5kq.js"),[])},Y=new Map,Rt=Object.freeze([{code:"sq",label:"Shqip",shortLabel:"SQ",nativeLabel:"Shqip"},{code:"de",label:"Deutsch",shortLabel:"DE",nativeLabel:"Deutsch"},{code:"sr",label:"Srpski",shortLabel:"SR",nativeLabel:"Srpski"}]);function N(t=""){const a=String(t||"").trim().toLowerCase();if(!a)return"";if(a==="sr-latn"||a==="sr_rs"||a==="sr-rs")return"sr";const c=a.split(/[-_]/)[0]||"";return _[c]||nt[c]?c:""}function Q(t=w){const a=N(t)||w;try{typeof document<"u"&&document.documentElement&&(document.documentElement.lang=a==="sr"?"sr-Latn":a)}catch{}}function Dt(t=w){const a=N(t)||w;try{typeof window<"u"&&typeof window.dispatchEvent=="function"&&window.dispatchEvent(new CustomEvent("menyra-language-change",{detail:{lang:a}}))}catch{}}const jt=async(t=w)=>{const a=N(t)||w;if(_[a])return a;const c=nt[a];return typeof c!="function"?(_[a]={},a):(Y.has(a)||Y.set(a,c().then(d=>(_[a]=d?.default&&typeof d.default=="object"?d.default:{},a)).finally(()=>{Y.delete(a)})),Y.get(a))};function Z(t=w){const a=N(t)||w;_[a]||jt(a).then(()=>Dt(a)).catch(()=>{})}const Kt=()=>Rt,at=(t=w)=>{const a=N(t)||w;try{const c=N(localStorage.getItem(st));if(c)return Q(c),Z(c),c}catch{}return Q(a),a},Vt=t=>{const a=N(t);if(!a)return"";try{localStorage.setItem(st,a)}catch{}return Q(a),Z(a),a};function Bt(t="",a={}){return String(t||"").replace(/\{([a-zA-Z0-9_]+)\}/g,(c,d)=>Object.prototype.hasOwnProperty.call(a,d)?String(a[d]??""):c)}const Et=(t,a={})=>{const c=String(t||"").trim();if(!c)return"";const d=typeof a=="string",i=d?N(a)||at():N(a?.lang)||at(),x=d?c:String(a?.fallback??c),A=d?{}:a?.params||{};Z(i);const P=_[i]?.[c]??_[w]?.[c]??x;return Bt(P,A)};function Ot(t,{normalizeLeadTypeKeyFn:a}={}){const d=(typeof a=="function"?a:(()=>""))(t);if(d)return d;const i=String(t||"").toLowerCase().trim();return i?i.includes("cafe")||i.includes("coffee")||i.includes("coffe")?"cafe":i.includes("restaurant")||i.includes("resto")?"restaurant":i.includes("fast")?"fastfood":i.includes("hotel")||i.includes("hostel")||i.includes("resort")||i.includes("accommodation")?"hotel":i.includes("motel")?"motel":i.includes("ecom")||i.includes("online")||i.includes("shop")||i.includes("store")?"ecommerce":i.includes("tank")||i.includes("gas")||i.includes("fuel")?"tankstelle":i.includes("lebens")||i.includes("grocery")||i.includes("supermarkt")?"lebensmittel":i.includes("apothek")||i.includes("pharmacy")?"apotheken":i.includes("service")||i.includes("dienst")?"services":i:""}function Yt({state:t=null,getMenuItemImagesFn:a=()=>[],resolveMenuItemHeroFn:c=()=>"",getOptimizedImageUrlFn:d=()=>"",isPlaceholderUrlFn:i=()=>!1,placeholderImage:x="",getFirebaseStorageUrlFn:A=()=>"",isDirectImageUrlFn:P=()=>!1,formatPriceFn:m=s=>String(s??""),escapeHtmlFn:e=s=>String(s??""),getMenuItemObjectPositionFn:f=()=>"50% 50%",iconFn:$=()=>"",loadFavoriteMenuItemsFn:j=async()=>{},createEmptyFavoriteMenuItemsStateFn:ot=()=>({items:[],loading:!1,error:"",loaded:!1}),getShopCartProfileContextCoreFn:it=()=>({restaurantId:"",businessName:"",businessAvatar:""}),getRestaurantMetaByIdFn:U=()=>({}),getShopCartTotalCoreFn:ct=()=>0,parsePriceValueFn:lt=()=>0,canAddToShopCartFn:ut=()=>!1,normalizeShopCartStateFn:y=s=>s||{},buildShopVariantKeyFn:dt=s=>String(s||""),clampCropPercentFn:B=(s,O=50)=>Number.isFinite(Number(s))?Number(s):O,createEmptyShopCartFn:E=()=>({restaurantId:"",businessName:"",businessAvatar:"",tableNumber:0,tableLabel:"",serviceMode:"",items:[],checkoutOpen:!1,form:{name:"",phone:"",city:"",address:"",tableNumber:0,tableLabel:""},status:"",loading:!1}),saveShopCartToStorageFn:M=()=>{},renderFn:I=()=>{},confirmFn:ft=()=>!0}={}){if(!t)return{renderShopProductList:()=>"",renderProfileShopFavoritesView:()=>"",renderProfileShopCartView:()=>"",clearShopCart:()=>{},getCurrentShopProfile:()=>null,getShopCartProfileContext:()=>({restaurantId:"",businessName:"",businessAvatar:""}),addMenuItemToShopCart:()=>{},updateShopCartQuantity:()=>{},updateShopCartItemComment:()=>{},openShopCheckout:()=>{},updateShopCheckoutField:()=>{},getShopCartTotal:()=>0};const s=(r,u=r,o={})=>Et(r,{fallback:u,params:o}),O=()=>{try{if(globalThis?.__MENYRA_DEBUG_MENU_STATE__===!0||globalThis?.__MENYRA_DEBUG_PROFILE_RENDER__===!0)return!0;const r=new URLSearchParams(globalThis?.location?.search||"");return r.get("debug-menu-state")==="1"||r.get("debug-profile-render")==="1"}catch{return!1}},bt=()=>{try{return String(globalThis?.__MNYRA_BUILD_TOKEN__||globalThis?.__MENYRA_SOCIAL_APP_VERSION__||"").trim()}catch{return""}},mt=(r="")=>O()?` data-debug-renderer="shop-view-cart-orchestration-controller" data-debug-source="${e(String(r||"shop-product-list:no-products"))}"`:"",pt=({source:r="shop-product-list",items:u=[]}={})=>{if(!O())return;const o=t?.profileView?.profile||t?.userProfile||{},n=String(o?.canonicalRestaurantId||"").trim(),l=String(o?.restaurantId||t?.menu?.restaurantId||"").trim(),v=Array.isArray(u)?u:[];console.warn("[mnyra:no-products-render]",{component:"shop-view-cart-orchestration-controller",functionName:"renderShopProductList",slug:String(o?.publicSlug||o?.landingSlug||o?.handle||"").trim(),businessId:n||l,requestedRestaurantId:l,canonicalRestaurantId:n,restaurantIdSource:n?"profile.canonicalRestaurantId":"profile.restaurantId",menuReadPath:n||l?`restaurants/${n||l}/public/menu`:"",activeTab:String(t?.activeTab||"").trim(),profileTopTab:String(t?.profileTopTab||"").trim(),profileContentTab:String(t?.profileContentTab||"").trim(),itemsLength:v.length,rawItemsLength:v.length,filteredItemsLength:v.length,categoriesLength:new Set(v.map(g=>String(g?.category||"").trim()).filter(Boolean)).size,loading:!1,pending:!1,hydrating:!1,status:"",truthState:String(t?.menu?.truthState||"").trim(),confirmedEmpty:!1,canRenderItems:!1,renderDecision:"shop-product-list-no-products",source:r,buildToken:bt(),stack:new Error().stack})};function J(r,{source:u="menu",showRestaurantName:o=!1}={}){return r.length?`
    <div class="grid grid-cols-2 gap-4">
      ${r.map((n,l)=>{const v=a(n),g=v[0]||c(n),b=l<2,L=b?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"',k=d(g,b?"medium":"small"),S=i(k)?x:k,p=A(g),D=P(g)&&g!==S?g:p,h=["small","medium","large"].map(C=>{const V=C==="small"?480:C==="medium"?768:1280,R=d(g,C);return!R||i(R)?"":`${e(R)} ${V}w`}).filter(Boolean),T=h.length>1?h.join(", "):"",G=T?"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px":"",K=!b,Nt=K?x:S,It=K?x:D,Lt=!K&&T?` srcset="${e(T)}" sizes="${e(G)}"`:"",F=K?[`data-menu-lazy-src="${e(S)}"`,`data-menu-lazy-fallback="${e(D||x)}"`,T?`data-menu-lazy-srcset="${e(T)}"`:"",G?`data-menu-lazy-sizes="${e(G)}"`:""].filter(Boolean).join(" "):"",Tt=m(n.price),X=n.stock;typeof X=="string"&&X.trim();const tt=v.slice(1,4),et=String(n?.restaurantId||"").trim(),At=et?` data-menu-open-restaurant="${e(et)}"`:"";return`
          <article data-menu-open="${e(n.id)}" data-menu-open-source="${e(u)}"${At} role="button" tabindex="0" class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col" style="touch-action:pan-y;">
            <div class="rounded-[1.5rem] overflow-hidden bg-slate-100" style="aspect-ratio:4 / 5;">
              <img src="${e(Nt)}" data-fallback-src="${e(It)}"${F?` ${F}`:""} data-image-reveal="menu" class="w-full h-full object-cover" style="object-position:${f(n)};" width="480" height="600" ${L}${Lt} decoding="async" />
            </div>
            ${tt.length?`
              <div class="grid grid-cols-3 gap-2 mt-2">
                ${tt.map(C=>{const V=d(C,"thumb"),R=i(V)?x:V,_t=A(C),Pt=P(C)&&C!==R?C:_t,Mt=[`data-menu-lazy-src="${e(R)}"`,`data-menu-lazy-fallback="${e(Pt||x)}"`].join(" ");return`
                    <div class="rounded-xl overflow-hidden bg-slate-100 border border-slate-100" style="aspect-ratio:4 / 5;">
                      <img src="${e(x)}" data-fallback-src="${e(x)}" ${Mt} data-image-reveal="menu" class="w-full h-full object-cover" loading="lazy" fetchpriority="low" sizes="(max-width: 640px) 15vw, 110px" decoding="async" />
                    </div>
                  `}).join("")}
              </div>
            `:""}
              <div class="pt-3 flex-1 flex flex-col min-w-0">
                ${o&&n.restaurantName?`<p class="text-[9px] font-black uppercase tracking-widest text-indigo-600 truncate mb-1">${e(n.restaurantName)}</p>`:""}
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-[13px] font-black text-slate-900 leading-tight line-clamp-2">${e(n.name||"Produkt")}</p>
                  </div>
                  <span class="text-[11px] font-black text-slate-900 shrink-0">${e(Tt)}</span>
                </div>
                ${n.description?`<p class="text-[11px] text-slate-500 mt-2 line-clamp-2">${e(n.description)}</p>`:""}
              </div>
            </article>
        `}).join("")}
    </div>
  `:(pt({source:u,items:r}),`
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm"${mt(`${u}:no-products`)}>
        <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
          ${e(s("menu.noProducts","Keine Produkte"))}
        </div>
      </div>
    `)}function gt(r=t.profileView?.profile||t.userProfile){if(!String(t.user?.uid||"").trim())return`
      <div class="px-5 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm text-center">
          <div class="w-14 h-14 rounded-[1.4rem] bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            ${$("bookmark","w-6 h-6")}
          </div>
          <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">${e(s("favorites.userOnly","Favoriten nur fuer User"))}</p>
          <p class="text-sm font-medium text-slate-500 mt-3">${e(s("auth.registerOrLogin","Bitte registrieren oder einloggen."))}</p>
          <button data-auth-open class="mt-5 px-5 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
            ${e(s("auth.loginRegister","Login / Registrieren"))}
          </button>
        </div>
      </div>
    `;!t.favoriteMenuItems.loading&&!t.favoriteMenuItems.loaded&&!(t.favoriteMenuItems.items||[]).length&&j();const o=t.favoriteMenuItems||ot(),n=Array.isArray(o.items)?o.items:[],l=o.loading||!o.loaded&&!n.length;return`
    <div class="p-6 app-main-content-safe space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${e(s("favorites.title","Favoriten"))}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">${e(s("favorites.heading","Du liebst"))}</h2>
        </div>
      </div>
      ${l?`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${e(s("favorites.loading","Favoriten werden geladen..."))}</div>
        </div>
      `:o.error?`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-rose-500">${e(o.error)}</div>
        </div>
      `:n.length?`
        ${J(n,{source:"favorites",showRestaurantName:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm text-center">
          <div class="w-14 h-14 rounded-[1.4rem] bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            ${$("bookmark","w-6 h-6")}
          </div>
          <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">${e(s("favorites.empty","Noch keine Favoriten"))}</p>
          <p class="text-sm font-medium text-slate-500 mt-3">${e(s("favorites.emptyHint","Tippe im Produkt-Drawer auf das Bookmark-Icon."))}</p>
        </div>
      `}
    </div>
  `}function z(){return t.profileView?.profile||t.userProfile}function ht(r=z()){const u=q(r),o=String(u.restaurantId||t.shopCart?.restaurantId||r?.restaurantId||"").trim(),n=o?U(o)||{}:{};return Ot(n?.type||n?.customerType||r?.type||r?.customerType||t.userProfile?.type||t.userProfile?.customerType||"")}function xt(r=z()){return["restaurant","cafe","fastfood"].includes(ht(r))}function q(r=z()){const u=it(r,{getRestaurantMetaByIdFn:U}),o=String(t.profileView?.menuAccessSource||"").trim().toLowerCase(),n=Math.max(0,Number(t.profileView?.tableNumber||0)||0);return{...u,tableNumber:o==="qr"?n:0,tableLabel:o==="qr"&&n?`Tisch ${n}`:"",serviceMode:o==="qr"&&n?"table":""}}function H(){return ct(t.shopCart.items||[],{parsePriceValueFn:lt})}function vt(r,u=z()){const o=q(u),n=String(r?.restaurantId||"").trim();if(!n||n===String(o.restaurantId||"").trim())return o;const l=U(n)||{};return{...o,restaurantId:n,businessName:String(l?.name||l?.restaurantName||o.businessName||"Shop").trim()||"Shop",businessAvatar:String(l?.logoUrl||l?.logo||o.businessAvatar||"").trim(),tableNumber:0,tableLabel:"",serviceMode:""}}function St(r=t.profileView?.profile||t.userProfile){const u=q(r),o=u.restaurantId&&String(t.shopCart.restaurantId||"")===u.restaurantId,n=o?t.shopCart.items||[]:[],l=o?H():0,v=!!t.shopCart.restaurantId&&!o&&(t.shopCart.items||[]).length,g=o?Math.max(0,Number(t.shopCart.tableNumber||t.shopCart.form?.tableNumber||0)||0):0,b=o&&String(t.shopCart.serviceMode||"")==="table"&&g>0,L=xt(r),k=b||L,S=o&&!n.length&&String(t.shopCart?.confirmation?.restaurantId||"")===u.restaurantId?t.shopCart.confirmation:null;return`
    <div class="px-5 app-main-content-safe space-y-5">
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${e(s("cart.title","Warenkorb"))}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${e(u.businessName||"Shop")}</h3>
            ${b?`<p class="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-2">Tisch ${e(g)}</p>`:""}
          </div>
          <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            ${$("shopping-cart","w-5 h-5")}
          </div>
        </div>
        ${v?`
          <p class="text-[11px] font-bold text-amber-600 uppercase tracking-wider">${e(s("cart.otherShop","Dein aktueller Warenkorb gehoert zu einem anderen Shop."))}</p>
        `:S?`
          <div class="text-center py-10">
            <div class="relative w-24 h-24 mx-auto mb-6">
              <div class="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-60"></div>
              <div class="absolute inset-[10px] rounded-full bg-emerald-200/80 animate-pulse"></div>
              <div class="absolute inset-[22px] rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-300/40">
                ${$("check","w-8 h-8")}
              </div>
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">${e(s("cart.sent","Bestellung gesendet"))}</p>
            <h4 class="text-[22px] font-black italic tracking-tight text-slate-900 mt-3">${e(S.title||s("cart.order","Bestellung"))}</h4>
            <p class="text-sm font-medium text-slate-500 mt-3">${e(S.message||s("cart.orderReadySoon","Ihre Bestellung wird zubereitet und in Kuerze serviert."))}</p>
            ${S.tableNumber?`<p class="text-[10px] font-black uppercase tracking-widest text-emerald-700 mt-4">Tisch ${e(S.tableNumber)}</p>`:""}
          </div>
        `:n.length?`
          <div class="space-y-3">
            ${n.map(p=>`
              <div class="p-3 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl overflow-hidden bg-white shrink-0">
                    <img src="${e(d(p.imageUrl||"","thumb"))}" class="w-full h-full object-cover" style="object-position:${B(p.cropX??50,50)}% ${B(p.cropY??50,50)}%;" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-black text-slate-900 truncate">${e(p.name)}</p>
                    ${p.selectedSize||p.selectedColor?`<p class="text-[9px] font-bold uppercase tracking-widest text-slate-300 mt-1">${e([p.selectedSize,p.selectedColor].filter(Boolean).join(" / "))}</p>`:""}
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">${e(m(p.price))}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button data-cart-qty="${e(p.cartKey||p.itemId)}" data-cart-delta="-1" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center">${$("minus","w-3 h-3")}</button>
                    <span class="w-6 text-center text-sm font-black text-slate-900">${e(p.quantity)}</span>
                    <button data-cart-qty="${e(p.cartKey||p.itemId)}" data-cart-delta="1" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center">${$("plus","w-3 h-3")}</button>
                  </div>
                </div>
                <div>
                  <input
                    data-cart-item-comment="${e(p.cartKey||p.itemId)}"
                    type="text"
                    maxlength="180"
                    aria-label="${e(s("cart.commentForWaiter","Kommentar fuer den Kellner"))}"
                    value="${e(p.comment||"")}"
                    placeholder="${e(s("cart.commentPlaceholder","Kommentar fuer den Kellner..."))}"
                    class="w-full h-11 rounded-[1.2rem] border border-slate-200 bg-white/90 px-4 text-[13px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100/70"
                  />
                </div>
              </div>
            `).join("")}
            <div class="pt-3 flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">${e(s("cart.total","Gesamt"))}</span>
              <span class="text-lg font-black text-slate-900">${e(m(l))}</span>
            </div>
            <button data-cart-checkout="${k?"submit":"open"}" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200/60 active:scale-95 ${t.shopCart.loading?"opacity-70 pointer-events-none":""}">
              ${t.shopCart.loading?e(s("cart.sending","Bestellung wird gesendet...")):e(k?b?s("cart.tableOrderSubmit","Tischbestellung absenden"):s("cart.orderSubmit","Bestellung absenden"):s("cart.checkoutStart","Checkout starten"))}
            </button>
            ${k?`<p class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${e(b?s("cart.directTable","Direkt fuer deinen Tisch"):s("cart.directNoDetails","Direkt ohne weitere Angaben"))}</p>`:""}
            ${t.shopCart.status&&!t.shopCart.checkoutOpen?`<p class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${e(t.shopCart.status)}</p>`:""}
          </div>
        `:`
          <div class="text-center py-14">
            <div class="w-14 h-14 rounded-[1.4rem] bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
              ${$("shopping-bag","w-6 h-6")}
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">${e(s("cart.empty","Warenkorb leer"))}</p>
            <p class="text-sm font-medium text-slate-500 mt-3">${e(s("cart.emptyHint","Tippe auf das Plus bei einem Produkt."))}</p>
          </div>
        `}
      </div>
      ${o&&n.length&&t.shopCart.checkoutOpen&&!k?`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${e(s("cart.checkout","Checkout"))}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${e(b?s("cart.tableOrder","Tischbestellung"):L?s("cart.directOrder","Direkt bestellen"):s("cart.deliveryData","Lieferdaten"))}</h3>
            ${b?`<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">${e(s("cart.tableOrderFor","Bestellung fuer Tisch {table}",{table:g}))}</p>`:""}
          </div>
          <div class="grid grid-cols-1 gap-3">
            ${b?`
              <div class="rounded-[1.8rem] border border-emerald-100 bg-emerald-50 px-5 py-4">
                <p class="text-[10px] font-black uppercase tracking-widest text-emerald-700">${e(s("cart.tableDirect","Direkt am Tisch"))}</p>
                <p class="text-sm font-bold text-slate-700 mt-2">${e(s("cart.tableDirectBody","Keine Namen oder Telefonnummern noetig. Die Bestellung geht direkt an Tisch {table}.",{table:g}))}</p>
              </div>
            `:L?`
              <div class="rounded-[1.8rem] border border-indigo-100 bg-indigo-50 px-5 py-4">
                <p class="text-[10px] font-black uppercase tracking-widest text-indigo-700">${e(s("cart.fastCheckout","Schneller Checkout"))}</p>
                <p class="text-sm font-bold text-slate-700 mt-2">${e(s("cart.fastCheckoutBody","Fuer {business} sind keine Namen oder Telefonnummern noetig. Bestellung direkt absenden.",{business:u.businessName||s("common.thisBusiness","dieses Lokal")}))}</p>
              </div>
            `:`
              <input data-cart-field="name" type="text" value="${e(t.shopCart.form.name||"")}" placeholder="${e(s("common.name","Name"))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              <input data-cart-field="phone" type="text" value="${e(t.shopCart.form.phone||"")}" placeholder="${e(s("common.phone","Tel Nummer"))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              <input data-cart-field="city" type="text" value="${e(t.shopCart.form.city||"")}" placeholder="${e(s("common.city","Qyteti"))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              <textarea data-cart-field="address" rows="3" placeholder="${e(s("common.address","Adresa"))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${e(t.shopCart.form.address||"")}</textarea>
            `}
          </div>
          <button data-cart-checkout="submit" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95" ${t.shopCart.loading?"disabled":""}>
            ${t.shopCart.loading?e(s("cart.send","Senden...")):e(b?s("cart.tableOrderSubmit","Tischbestellung absenden"):s("cart.orderSubmit","Bestellung absenden"))}
          </button>
          ${t.shopCart.status?`<p class="text-center text-[10px] font-bold uppercase tracking-widest ${t.shopCart.loading?"text-slate-400":"text-slate-500"}">${e(t.shopCart.status)}</p>`:""}
        </div>
      `:""}
    </div>
  `}function W({keepForm:r=!1}={}){const u=r?{...t.shopCart?.form||E().form}:{...E().form},o=r?Math.max(0,Number(t.shopCart?.tableNumber||t.shopCart?.form?.tableNumber||0)||0):0,n=r?String(t.shopCart?.tableLabel||t.shopCart?.form?.tableLabel||"").trim():"",l=r?String(t.shopCart?.serviceMode||"").trim().toLowerCase():"";t.shopCart={...E(),form:{...u,tableNumber:o,tableLabel:n},tableNumber:o,tableLabel:n,serviceMode:l},M()}function wt(r,u=z(),o={}){const n=o?.forceAdd===!0;if(!r){const h=y(t.shopCart);return h.status=s("cart.addFailed","Produkt konnte nicht hinzugefuegt werden."),t.shopCart=h,I(),!1}if(!n&&!ut(u)){const h=y(t.shopCart);return h.status=s("cart.reopenProduct","Bitte Produkt erneut oeffnen und hinzufuegen."),t.shopCart=h,I(),!1}const l=vt(r,u);if(!l.restaurantId){const h=y(t.shopCart);return h.status=s("cart.shopMissing","Shop-Zuordnung fehlt. Bitte neu laden."),t.shopCart=h,I(),!1}const v=String(r?.id||r?.itemId||r?.menuItemId||r?.productId||"").trim();if(!v){const h=y(t.shopCart);return h.status=s("cart.productIdMissing","Produkt-ID fehlt. Bitte neu laden."),t.shopCart=h,I(),!1}const g=String(t.shopCart?.restaurantId||"").trim();if(g&&g!==l.restaurantId){if(!ft(s("cart.otherShop","Dein aktueller Warenkorb gehoert zu einem anderen Shop."))){const T=y(t.shopCart);return T.status=s("cart.otherShop","Dein aktueller Warenkorb gehoert zu einem anderen Shop."),t.shopCart=T,I(),!1}W({keepForm:!0})}const b=y(t.shopCart),L=String(o?.size||"").trim(),k=String(o?.color||"").trim(),S=dt(v,{size:L,color:k}),p=b.items.findIndex(h=>String(h.cartKey||h.itemId)===S),D={id:v,itemId:v,cartKey:S,name:String(r.name||"Produkt").trim()||"Produkt",price:String(r.price??"").trim(),quantity:1,imageUrl:String(c(r)||"").trim(),category:String(r.category||"").trim(),selectedSize:L,selectedColor:k,comment:"",cropX:B(r?.cropX??50,50),cropY:B(r?.cropY??50,50)};return p>=0?b.items[p]={...b.items[p],quantity:Math.max(1,Number(b.items[p].quantity||1)+1)}:b.items.unshift(D),b.restaurantId=l.restaurantId,b.businessName=l.businessName,b.businessAvatar=l.businessAvatar,b.tableNumber=l.tableNumber||b.tableNumber||0,b.tableLabel=l.tableLabel||b.tableLabel||"",b.serviceMode=l.serviceMode||b.serviceMode||"",b.form={...b.form||E().form,tableNumber:b.tableNumber,tableLabel:b.tableLabel},b.status=s("cart.added","{name} wurde zum Warenkorb hinzugefuegt.",{name:D.name}),t.shopCart=b,M(),I(),!0}function yt(r,u){const o=String(r||"").trim();if(!o)return;const n=y(t.shopCart);n.items=n.items.map(l=>String(l.cartKey||l.itemId)===o?{...l,quantity:Math.max(0,Number(l.quantity||1)+Number(u||0))}:l).filter(l=>l.quantity>0),n.status="",n.items.length?(t.shopCart=n,M()):W({keepForm:!0}),I()}function kt(r,u){const o=String(r||"").trim();if(!o)return;const n=y(t.shopCart),l=String(u||"").replace(/\s+/g," ").trimStart().slice(0,180);let v=!1;n.items=n.items.map(g=>String(g.cartKey||g.itemId)!==o||String(g.comment||"")===l?g:(v=!0,{...g,comment:l})),v&&(n.status="",t.shopCart=n,M())}function $t(){const r=y(t.shopCart);if(!r.items.length)return;const u=String(r.serviceMode||"").trim().toLowerCase()==="table"&&Number(r.tableNumber||0)>0;r.checkoutOpen=!0,r.status="",r.form.name||(r.form.name=String(t.userProfile?.name||t.user?.displayName||"").trim()),r.form.phone||(r.form.phone=String(t.userProfile?.phone||t.user?.phoneNumber||"").trim()),u||(r.form.city||(r.form.city=String(t.userProfile?.location||"").trim()),r.form.address||(r.form.address=String(t.userProfile?.address||"").trim())),r.form.tableNumber=Math.max(0,Number(r.tableNumber||r.form.tableNumber||0)||0),r.form.tableLabel=String(r.tableLabel||r.form.tableLabel||"").trim(),t.shopCart=r,M(),I()}function Ct(r,u){if(!r)return;const o=y(t.shopCart);r in o.form&&(o.form[r]=String(u||""),o.status="",t.shopCart=o,M())}return{renderShopProductList:J,renderProfileShopFavoritesView:gt,renderProfileShopCartView:St,clearShopCart:W,getCurrentShopProfile:z,getShopCartProfileContext:q,addMenuItemToShopCart:wt,updateShopCartQuantity:yt,updateShopCartItemComment:kt,openShopCheckout:$t,updateShopCheckoutField:Ct,getShopCartTotal:H}}function Ut(t={},{getRestaurantMetaByIdFn:a}={}){const c=typeof a=="function"?a:(()=>null),d=String(t?.restaurantId||"").trim(),i=d?c(d):null;return{restaurantId:d,businessName:String(t?.name||i?.name||i?.restaurantName||"Shop").trim()||"Shop",businessAvatar:String(t?.avatar||i?.logoUrl||i?.logo||"").trim()}}function Wt(t="",a=null){const c=String(t||"").trim();return!c||String(a?.restaurantId||"").trim()!==c?0:(a?.items||[]).reduce((d,i)=>d+Math.max(0,Number(i?.quantity||0)||0),0)}function Gt(t={},{isShopCatalogProfileFn:a,currentUserRestaurantId:c="",allowOwnRestaurantOrdering:d=!1}={}){const i=typeof a=="function"?a:(()=>!1),x=String(t?.restaurantId||"").trim();return!(!x||!i(t)||!d&&c&&String(c).trim()===x)}function Xt(t=[],{parsePriceValueFn:a}={}){const c=typeof a=="function"?a:(()=>0);return(t||[]).reduce((d,i)=>d+c(i.price)*Math.max(1,Number(i.quantity||1)||1),0)}function Qt(t,{createEmptyShopCartFn:a,buildShopVariantKeyFn:c,clampCropPercentFn:d}={}){const i=typeof a=="function"?a:(()=>({restaurantId:"",businessName:"",businessAvatar:"",items:[],checkoutOpen:!1,form:{name:"",phone:"",city:"",address:""},status:"",loading:!1})),x=typeof c=="function"?c:(()=>""),A=typeof d=="function"?d:((f,$)=>{const j=Number(f);return Number.isFinite(j)?Math.max(0,Math.min(100,Math.round(j))):$}),P=i(),m=t&&typeof t=="object"?t:{},e=(Array.isArray(m.items)?m.items:[]).map(f=>({id:String(f?.id||f?.itemId||"").trim(),itemId:String(f?.itemId||f?.id||"").trim(),cartKey:String(f?.cartKey||x(f?.itemId||f?.id||"",{size:f?.selectedSize||f?.size||"",color:f?.selectedColor||f?.color||""})).trim(),name:String(f?.name||"Produkt").trim()||"Produkt",price:String(f?.price??"").trim(),quantity:Math.max(1,Number(f?.quantity||1)||1),imageUrl:String(f?.imageUrl||"").trim(),category:String(f?.category||"").trim(),comment:String(f?.comment||f?.note||f?.message||"").trim(),selectedSize:String(f?.selectedSize||f?.size||"").trim(),selectedColor:String(f?.selectedColor||f?.color||"").trim(),cropX:A(f?.cropX??50,50),cropY:A(f?.cropY??50,50)})).filter(f=>f.id&&f.itemId&&f.cartKey);return{...P,restaurantId:String(m.restaurantId||"").trim(),businessName:String(m.businessName||"").trim(),businessAvatar:String(m.businessAvatar||"").trim(),tableNumber:Math.max(0,Number(m.tableNumber||m.form?.tableNumber||0)||0),tableLabel:String(m.tableLabel||m.form?.tableLabel||"").trim(),serviceMode:String(m.serviceMode||"").trim().toLowerCase(),items:e,checkoutOpen:!!m.checkoutOpen,form:{name:String(m.form?.name||"").trim(),phone:String(m.form?.phone||"").trim(),city:String(m.form?.city||"").trim(),address:String(m.form?.address||"").trim(),tableNumber:Math.max(0,Number(m.form?.tableNumber||m.tableNumber||0)||0),tableLabel:String(m.form?.tableLabel||m.tableLabel||"").trim()},status:String(m.status||"").trim(),loading:!!m.loading}}function Zt(t,{size:a="",color:c=""}={}){const d=String(t||"").trim(),i=String(a||"").trim().toLowerCase(),x=String(c||"").trim().toLowerCase();return`${d}::${i||"-"}::${x||"-"}`}export{Kt as a,Gt as b,Yt as c,Wt as d,Zt as e,Ot as f,at as g,Xt as h,Ut as i,jt as l,Qt as n,Vt as s,Et as t};
