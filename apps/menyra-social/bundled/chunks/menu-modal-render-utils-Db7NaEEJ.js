import{v as Ft,w as Bt}from"./domain-menu-eager-B1ej_9B5.js";import{a as bt}from"./domain-media-eager-B3Bb4ghO.js";import{t as Lt}from"./domain-feed-social-eager-DnqMTgRm.js";import"./domain-auth-QKHsxlWr.js";import"./domain-public-profile-mLQti0eH.js";const Ut=Object.freeze(["Fruehstueck","Brunch","Vorspeise","Suppe","Salat","Pasta","Pizza","Burger","Sandwich","Wrap","Grill","Fleisch","Fisch","Vegetarisch","Vegan","Beilage","Kinder","Dessert","Kuchen","Eis","Kaffee","Tee","Softdrink","Saft","Smoothie","Bier","Wein","Cocktail","Spirituose","Sonstiges"]);function gt(o){if(o==null)return null;const v=typeof o=="string"?o.trim():o;if(v==="")return null;const j=Number(v);return Number.isFinite(j)?Math.max(0,j):null}function xt(o=""){const v=String(o||"").trim().toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(v)}function vt(o=""){const v=String(o||"").trim();return v?xt(v)?"Produkte":v:""}function Gt({state:o,isShopCatalogProfile:v,getBusinessProfileType:j,getOptimizedImageUrl:ee,PLACEHOLDER_IMAGE:U,isPlaceholderUrl:te,normalizeMenuType:ne,getMenuModalCrop:oe,escapeHtml:se,icon:le}={}){if(!o||!o.menuModal?.open)return"";const ve=typeof v=="function"?v:(()=>!1),he=typeof j=="function"?j:(()=>""),N=typeof ee=="function"?ee:(t=>String(t||"")),ye=typeof te=="function"?te:(()=>!1),we=typeof ne=="function"?ne:(t=>String(t||"food")),ke=typeof oe=="function"?oe:(()=>({x:50,y:50})),d=typeof se=="function"?se:(t=>String(t||"")),A=typeof le=="function"?le:(()=>""),$e=t=>{const i=Number(t);return Number.isFinite(i)?`${i.toFixed(2).replace(".",",")} EUR`:String(t||"").trim()||"0,00 EUR"},Se=(t,{excludeId:i=""}={})=>{const u=String(i||"").trim(),b=new Set,$=x=>{if(x==null)return;if(Array.isArray(x)){x.forEach($);return}const S=typeof x=="object"?x.id||x.itemId||x.productId||x.menuItemId||"":x,Q=String(S||"").trim();Q&&Q.split(",").forEach(Qe=>{const Y=String(Qe||"").trim();!Y||Y===u||b.has(Y)||b.add(Y)})};return $(t),Array.from(b)},l=o.menuModal.item||{},ie=o.menuModal.mode==="edit",g=ve(o.userProfile),Ie=ie?"Ndrysho produktin":"Shto produkt",Ce=Array.isArray(o.menuModal.existingImages)?o.menuModal.existingImages:[],H=Array.isArray(o.menuModal.imagePreviews)?o.menuModal.imagePreviews:[],ae=String(o.menuModal.imageUrlDraft||"").trim(),P=[...Ce.map((t,i)=>({src:t,kind:"existing",idx:i})),...H.map((t,i)=>({src:t,kind:"new",idx:i}))].filter(t=>t.src),re=P[0]?.src||ae||l.imageUrl||"",de=re?N(re,"large"):U,je=ye(de)?U:de,Ae=String(o.menuModal.videoPreview||"").trim(),Ke=String(o.menuModal.videoPosterPreview||"").trim(),E=!!(o.menuModal.videoFile&&Ae),Pe=H.length>0,ce=bt(l)&&!Pe&&!E,ze=E||ce,Oe=E?Ae:ce?String(l.videoUrl||"").trim():"",Te=E?Ke:ce?N(String(l.posterUrl||l.imageUrl||"").trim(),"large"):"",D=we(l.type||"food"),We=D==="food"||D==="drink",Me=l.available!==!1?"available":"unavailable",De=o.menuModal.status||"",K=Array.isArray(l.sizes)?l.sizes.join(", "):"",ue=Array.isArray(l.colors)?l.colors.join(", "):"",a=gt(l.stock),Re=a===null?"":String(a),w=ke(),_e=String(he(o.userProfile)||"").trim().toLowerCase(),O=!g&&Ft(_e),n=(()=>{const t=o?.userProfile?.specialEnabled;if(typeof t=="boolean")return t;const i=String(o?.userProfile?.restaurantId||"").trim();return i?(Array.isArray(o?.restaurants)?o.restaurants.find(b=>String(b?.id||"").trim()===i):null)?.specialEnabled===!0:!1})(),p=Bt(l.cardStyle||"",D),s=p==="testfirst_special"||String(l.category||"").trim().toLowerCase()==="special",k=O&&!s&&p==="testfirst_drink",W=(t=>{const i=Number(t);return Number.isFinite(i)?i<=33?"left":i>=67?"right":"center":"center"})(w.x),I=String(l.category||(g?"Produkte":"Sonstiges")).trim()||(g?"Produkte":"Sonstiges"),Ve=g?vt(I):I,Fe=t=>String(t||"").trim().toLowerCase()==="special",pe=Array.from(new Set([Ve,...Array.isArray(o.menu?.items)?o.menu.items.map(t=>String(t?.category||"").trim()):[],...g?["Produkte"]:Ut].filter(t=>!(!t||g&&xt(t)||!n&&Fe(t))))),me="menuItemCategoryOptions",fe=String(l.specialSize||l.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default",z=String(l.specialActionType||l.actionType||"").trim().toLowerCase()==="link"?"link":"product",qe=String(l.specialActionUrl||l.linkUrl||l.actionUrl||"").trim(),Ge=String(l.specialActionProductId||l.targetProductId||"").trim(),Be=String(l.ingredients||l.ingredient||l.inhaltsstoffe||"").trim(),Le=String(l.woltUrl||l.woltLink||"").trim(),C=String(l.id||"").trim(),y=(t,i=0)=>{const u=Number(t);return Number.isFinite(u)?Math.max(0,Math.floor(u)):Math.max(0,Number(i)||0)},be=Array.isArray(o.menu?.items)?o.menu.items.slice().map((t,i)=>({entry:t,idx:i,order:y(t?.orderIndex,i)})).sort((t,i)=>t.order-i.order||t.idx-i.idx).map(t=>t.entry):[],T=be.filter(t=>String(t?.id||"").trim()!==C),R=be.findIndex(t=>String(t?.id||"").trim()===C),V=Math.max(1,T.length+1),_=R>=0?Math.min(V,Math.max(1,R+1)):V,q=Math.min(V,Math.max(1,Number.isFinite(Number(l.orderIndex))?y(l.orderIndex,_-1)+1:_)),G=Array.isArray(o.menu?.items)?o.menu.items.filter(t=>{const i=String(t?.id||"").trim();return!(!i||i===C)}):[],F=Se(l.crossSellItemIds||l.crossSellIds||l.crossSell||l.crossSelling,{excludeId:C}),M=be.filter(t=>{const i=String(t?.id||"").trim();if(!i||i===C)return!1;const u=String(t?.type||"").trim().toLowerCase(),b=String(t?.menuSection||"").trim().toLowerCase();return u==="food"||u==="drink"||b==="food"||b==="drink"}),Ue=`
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${ie?"Ndrysho":"I ri"}</span>
        <h3 id="menuModalTitle" class="text-xl font-black italic tracking-tighter">${Ie}</h3>
      </div>
      <button id="menuModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${A("x","w-4 h-4")}
      </button>
    </div>
  `,ge=`
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="menuItemImageInput" class="hidden" accept="image/*,video/*" multiple />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${ze?`
          <video id="menuItemHeroVideo" src="${d(Oe)}" ${Te?`poster="${d(Te)}"`:""} class="w-full h-52 object-cover" style="object-position:${w.x}% ${w.y}%;" muted loop playsinline autoplay preload="metadata"></video>
          <span class="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
            ${A("play","w-3 h-3")} Video
          </span>
        `:`
          <img id="menuItemHeroPreview" src="${d(je)}" class="w-full h-52 object-cover" style="object-position:${w.x}% ${w.y}%;" />
        `}
        <button type="button" id="menuItemImageTrigger" aria-label="Ngarko foto ose video" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${A("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${A("plus","w-2.5 h-2.5")}
          </span>
        </button>
      </div>
      ${ze?`
        <button type="button" id="menuItemVideoRemove" class="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">
          Hiq videon
        </button>
      `:""}
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Horizontal</p>
          <span id="menuCropXValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${w.x}%</span>
        </div>
        <input id="menuItemCropX" type="range" min="0" max="100" step="1" value="${w.x}" class="w-full accent-indigo-600" />
        <div id="menuSmallCardCropControl" class="${k?"":"hidden"} space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Small Card Crop</p>
            <span class="text-[10px] font-bold text-slate-400">1:1</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" data-menu-small-crop="left" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${W==="left"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Links</button>
            <button type="button" data-menu-small-crop="center" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${W==="center"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Mitte</button>
            <button type="button" data-menu-small-crop="right" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${W==="right"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Rechts</button>
          </div>
          <p class="text-[10px] font-bold text-slate-400 px-1">Vetem per Small Drink Card (menuja publike).</p>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Vertikal</p>
          <span id="menuCropYValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${w.y}%</span>
        </div>
        <input id="menuItemCropY" type="range" min="0" max="100" step="1" value="${w.y}" class="w-full accent-indigo-600" />
      </div>
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Fotos</p>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${P.length}</span>
        </div>
        ${P.length?`
          <div class="grid grid-cols-3 gap-2">
            ${P.map(t=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                <img src="${d(N(t.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-menu-image-remove="${t.idx}" data-menu-image-source="${t.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${A("x","w-3 h-3")}
                </button>
              </div>
            `).join("")}
          </div>
        `:`
          <div class="h-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">
            Ende nuk ka foto
          </div>
        `}
      </div>

      <div class="p-5 rounded-[2rem] border border-slate-100 bg-white space-y-4">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Name</label>
          <input id="menuItemName" type="text" value="${d(l.name||"")}" placeholder="Emri i produktit" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cmimi</label>
            <input id="menuItemPrice" type="text" value="${d(l.price??"")}" placeholder="z.B. 4.50" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Kategorie</label>
            <input id="menuItemCategory" list="${me}" type="text" value="${d(Ve)}" placeholder="Shkruaj kategorine" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <datalist id="${me}">
              ${pe.map(t=>`<option value="${d(t)}"></option>`).join("")}
            </datalist>
          </div>
        </div>
        ${g?`
          <input id="menuItemType" type="hidden" value="food" />
        `:`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
            <select id="menuItemType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="food" ${D==="food"?"selected":""}>Speise</option>
              <option value="drink" ${D==="drink"?"selected":""}>Getraenk</option>
            </select>
          </div>
        `}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
          <select id="menuItemVisibility" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="available" ${Me==="available"?"selected":""}>E disponueshme</option>
            <option value="unavailable" ${Me==="unavailable"?"selected":""}>Ausverkauft</option>
          </select>
        </div>
        ${n&&O&&s?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Position im aktiven Menue</label>
            <select id="menuItemOrderPosition" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              ${Array.from({length:V},(t,i)=>{const u=i+1,b=T[u-1]||null,$=u>1?T[u-2]:null,x=u===1?"Ganz oben":u===V?"Ganz unten":`Nach ${String($?.name||"Produkt").trim()||"Produkt"}`,S=b?` (vor ${String(b?.name||"Produkt").trim()||"Produkt"})`:"";return`<option value="${u}" ${q===u?"selected":""}>Position ${u}: ${d(x)}${d(S)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Thjesht zgjidh ne vend te drag and drop.</p>
          </div>
        `:""}
        ${O&&!s?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Card Style</label>
            <select id="menuItemCardStyle" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="testfirst_drink" ${p==="testfirst_drink"?"selected":""}>Small = Drink Card</option>
              <option value="testfirst_food" ${p==="testfirst_food"?"selected":""}>Big = Food Card</option>
            </select>
          </div>
        `:""}
        ${n&&O&&s?`
          <input id="menuItemCardStyle" type="hidden" value="testfirst_special" />
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Madhesia Special</label>
            <select id="menuItemSpecialSize" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="default" ${fe==="default"?"selected":""}>Normal</option>
              <option value="food" ${fe==="food"?"selected":""}>Madhesia e Food-Card</option>
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Relevante vetem per Special-Card.</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Veprimi i klikimit Special</label>
            <select id="menuItemSpecialActionType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="product" ${z==="product"?"selected":""}>Hap modalin e produktit</option>
              <option value="link" ${z==="link"?"selected":""}>Hap ridrejtimin / linkun</option>
            </select>
          </div>
          <div id="menuItemSpecialActionProductField" class="${z==="product"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Ziel-Produkt</label>
            <select id="menuItemSpecialActionProductId" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="">Pa produkt</option>
              ${G.map(t=>{const i=String(t?.id||"").trim(),u=String(t?.name||"Produkt").trim()||"Produkt";return`<option value="${d(i)}" ${Ge===i?"selected":""}>${d(u)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Perdoret kur veprimi i klikimit = modal i produktit.</p>
          </div>
          <div id="menuItemSpecialActionLinkField" class="${z==="link"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Link</label>
            <input id="menuItemSpecialActionUrl" type="text" value="${d(qe)}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Perdoret kur veprimi i klikimit = link.</p>
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Pershkrimi</label>
          <textarea id="menuItemDesc" rows="3" placeholder="Pershkrimi..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${d(l.description||"")}</textarea>
        </div>
        ${g?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Inhaltsstoffe</label>
            <textarea id="menuItemIngredients" rows="3" placeholder="z.B. Wasser, Zucker, Salz..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${d(Be)}</textarea>
          </div>
        `}
        ${g?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Wolt Link</label>
            <input id="menuItemWoltUrl" type="url" value="${d(Le)}" placeholder="https://wolt.com/..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Opsionale: shfaqet ne dritaren e produktit kur nuk ka qasje QR ne menu.</p>
          </div>
        `}
        ${g?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Details</label>
            <textarea id="menuItemLongDesc" rows="4" placeholder="Materiali, gjendja, detajet e dorezimit..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${d(l.longDescription||"")}</textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Marka</label>
              <input id="menuItemBrand" type="text" value="${d(l.brand||"")}" placeholder="z.B. Nike" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">SKU</label>
              <input id="menuItemSku" type="text" value="${d(l.sku||"")}" placeholder="ART-001" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Madhesite</label>
              <input id="menuItemSizes" type="text" value="${d(K)}" placeholder="XS, S, M, L" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Ngjyrat</label>
              <input id="menuItemColors" type="text" value="${d(ue)}" placeholder="E zeze, e bardhe" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Lagerbestand</label>
            <input id="menuItemStock" type="number" min="0" inputmode="numeric" value="${d(Re)}" placeholder="0" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">${g?"Shenime":"Alergenet"}</label>
          <input id="menuItemAllergens" type="text" value="${d(l.allergens||"")}" placeholder="${g?"p.sh. edicion i limituar, pa kthim":"z.B. Milch, Gluten"}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        ${!g&&We?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cross Selling (QR)</label>
            <div class="mt-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 max-h-48 overflow-y-auto no-scrollbar space-y-2">
              ${M.length?M.map(t=>{const i=String(t?.id||"").trim(),u=String(t?.name||"Produkt").trim()||"Produkt",b=String(t?.category||"").trim(),$=$e(t?.price);return`
                  <label class="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                    <input type="checkbox" data-menu-cross-sell-option value="${d(i)}" ${F.includes(i)?"checked":""} class="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" />
                    <span class="min-w-0 flex-1">
                      <span class="block text-xs font-black text-slate-800 truncate">${d(u)}</span>
                      <span class="block text-[10px] font-bold uppercase tracking-wide text-slate-400">${d(b||"Produkt")} · ${d($)}</span>
                    </span>
                  </label>
                `}).join(""):'<p class="text-[10px] font-bold uppercase tracking-wide text-slate-400 px-2 py-1">Nuk ka me ushqime/pije te disponueshme</p>'}
            </div>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Shfaqet vetem ne dritaren e produktit kur menuja hapet me QR kod.</p>
          </div>
        `:""}
      </div>
    </div>
  `,xe=`
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
      <button id="menuModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${o.menuModal.loading?"disabled":""}>
        ${o.menuModal.loading?"Duke ruajtur...":"Ruaj"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${d(De)}</div>
    </div>
  `;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="menuModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          ${Ue}
          ${ge}
          ${xe}
        </div>
      </div>
    </div>
  `}function Qt({state:o,getMenuItemImages:v,getOptimizedImageUrl:j,isPlaceholderUrl:ee,PLACEHOLDER_IMAGE:U,getFirebaseStorageUrl:te,isDirectImageUrl:ne,formatPrice:oe,getMenuDetailRestaurantId:se,getMenuDetailCatalogProfile:le,isShopCatalogProfile:ve,normalizeMenuType:he,canAddToShopCart:N,getMenuItemSocialId:ye,menuItemMetaKey:we,ensureMenuItemMeta:ke,resolveMenuItemCounts:d,currentUserBadge:A,ensureCommentShape:$e,getCartCountForRestaurant:Se,renderMenuDetailComments:l,formatCount:ie,getMenuItemObjectPosition:g,escapeHtml:Ie,icon:Ce}={}){if(!o||!o.menuDetail?.open||!o.menuDetail?.item)return"";const H=typeof v=="function"?v:(()=>[]),ae=typeof j=="function"?j:(e=>String(e||"")),P=typeof ee=="function"?ee:(()=>!1),re=typeof te=="function"?te:(e=>String(e||"")),de=typeof ne=="function"?ne:(()=>!1),je=typeof oe=="function"?oe:(e=>String(e||"")),Ae=typeof se=="function"?se:(()=>""),Ke=typeof le=="function"?le:(()=>null),E=typeof ve=="function"?ve:(()=>!1),Pe=typeof he=="function"?he:(e=>String(e||"food")),ce=typeof N=="function"?N:(()=>!1),ze=typeof ye=="function"?ye:(()=>""),Oe=typeof we=="function"?we:(()=>""),Te=typeof ke=="function"?ke:(()=>({likes:[],comments:[],counts:{likes:0,comments:0}})),D=typeof d=="function"?d:(()=>({likes:0,comments:0})),We=typeof A=="function"?A:(()=>({uid:"",handle:""})),nt=typeof $e=="function"?$e:(e=>e),Me=typeof Se=="function"?Se:(()=>0),De=typeof l=="function"?l:(()=>""),K=typeof ie=="function"?ie:(e=>String(e||"0")),ue=typeof g=="function"?g:(()=>"50% 50%"),a=(e,r=e,c={})=>Lt(e,{fallback:r,params:c}),Re=(e="")=>{const r=String(e||"").trim();return r?/^(https?:\/\/|mailto:|tel:)/i.test(r)?r:`https://${r.replace(/^\/+/,"")}`:""},w=(e,{excludeId:r=""}={})=>{const c=String(r||"").trim(),h=new Set,m=f=>{if(f==null)return;if(Array.isArray(f)){f.forEach(m);return}const Z=typeof f=="object"?f.id||f.itemId||f.productId||f.menuItemId||"":f,J=String(Z||"").trim();J&&J.split(",").forEach(tt=>{const L=String(tt||"").trim();!L||L===c||h.has(L)||h.add(L)})};return m(e),Array.from(h)},_e=(e,r=[])=>{const c=String(e||"").trim();if(!c)return null;const h=Array.isArray(o?.menu?.items)?o.menu.items.find(m=>String(m?.id||"").trim()===c):null;return h||Array.isArray(r)&&r.find(m=>String(m?.id||m?.itemId||m?.productId||m?.menuItemId||"").trim()===c)||null},O=(e={},r=0,{showAdd:c=!1}={})=>{const m=(Array.isArray(H(e))?H(e):[])[0]||e.imageUrl||e.image||"",f=ae(m,"thumb"),Z=P(f)?U:f,J=re(m),tt=de(m)&&m!==Z?m:J,L=String(e.name||`Empfehlung ${r+1}`).trim()||`Empfehlung ${r+1}`,Dt=String(e.category||"Passt dazu").trim()||"Passt dazu",Vt=je(e.price,e);return`
      <div class="group shrink-0 rounded-[1.8rem] border border-slate-100 bg-white p-2.5 text-left transition-all" style="width:132px;min-width:132px;max-width:132px;flex:0 0 132px;">
        <div class="relative overflow-hidden rounded-[1.2rem] bg-slate-100 mx-auto" style="width:92px;height:92px;">
          <img src="${n(Z)}" data-fallback-src="${n(tt)}" data-image-reveal="menu" alt="${n(L)}" class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" fetchpriority="low" decoding="async" />
        </div>
        <div class="pt-3 px-1">
          <div class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${n(Dt)}</div>
          <div class="mt-1 text-sm font-black tracking-tight text-slate-900 line-clamp-2">${n(L)}</div>
          <div class="mt-3 flex items-center justify-between gap-3">
            <span class="text-sm font-black text-slate-900">${n(Vt)}</span>
            ${c?`
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-900 text-white">
                ${p("plus","w-4 h-4")}
              </span>
            `:""}
          </div>
        </div>
      </div>
    `},ot=(e=[],{showAdd:r=!1}={})=>e.length?`
      <section class="space-y-3">
        <div class="flex items-end justify-between gap-3">
          <div>
            <h4 class="text-base font-black tracking-tight text-slate-900">Passt perfekt dazu</h4>
          </div>
          <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">${e.length} Vorschlaege</div>
        </div>
        <div class="overflow-x-auto no-scrollbar">
          <div class="flex gap-3 pb-1">
            ${e.map((c,h)=>O(c,h,{showAdd:r})).join("")}
          </div>
        </div>
      </section>
    `:"",n=typeof Ie=="function"?Ie:(e=>String(e||"")),p=typeof Ce=="function"?Ce:(()=>""),s=o.menuDetail.item,k=H(s),st=k.length?k.length-1:0,W=Math.max(0,Math.min(o.menuDetail.index||0,st)),I=Ae(s),Ve=(e,r)=>{const c=String(e||""),h=s?.id?`menu-detail:${String(I||"")}:${String(s.id)}:${r}`:"",m=ae(c,"large",{stableKey:h,variantGroup:"menu-detail"}),f=P(m)?U:m,Z=re(c),J=de(c)&&c!==f?c:Z;return{idx:r,safe:f,fallback:J}},Fe=(k.length?k:[""]).map(Ve),pe=bt(s),me=pe?String(s.videoUrl||"").trim():"",fe=pe?String(s.posterUrl||"").trim()?ae(String(s.posterUrl).trim(),"large"):Fe[0]?.safe||U:"",lt=`
    <button type="button" data-menu-video-toggle aria-label="Play/Pause" class="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center z-20 active:scale-95 transition">
      <svg data-video-icon-play viewBox="0 0 24 24" class="w-4 h-4 fill-white block"><path d="M8 5v14l11-7z"></path></svg>
      <svg data-video-icon-pause viewBox="0 0 24 24" class="w-4 h-4 fill-white hidden"><path d="M6 5h4v14H6zM14 5h4v14h-4z"></path></svg>
    </button>`,z=String(o.menuDetail?.previewImageSrc||"").trim(),qe=z&&!P(z)?`background-image:url("${n(z.replace(/"/g,"%22"))}");background-size:cover;background-position:${ue(s)};background-repeat:no-repeat;`:"",Ge=(e,r="")=>{const c=e.idx===W,m=pe&&!!me&&e.idx===0?`<video id="menuDetailHeroVideo" data-menu-detail-video src="${n(me)}" ${fe?`poster="${n(fe)}"`:""} class="absolute inset-0 w-full h-full object-cover${r?` ${r}`:""}" style="object-position:${ue(s)};" muted loop autoplay playsinline preload="metadata"></video>${lt}`:`<img ${c?'id="menuDetailHeroImage" ':""}data-menu-detail-hero-image ${c?`src="${n(e.safe)}"`:`data-menu-gallery-src="${n(e.safe)}"`} data-fallback-src="${n(e.fallback)}" class="absolute inset-0 w-full h-full object-cover${r?` ${r}`:""}" style="object-position:${ue(s)};" loading="eager" fetchpriority="${c?"high":"low"}" decoding="${c?"sync":"async"}" />`,f=[c?qe:"",c?"":"opacity:0;pointer-events:none;"].join("");return`<div data-menu-gallery-slide="${e.idx}" class="absolute inset-0"${f?` style="${f}"`:""}>${m}</div>`},Be=(e="")=>Fe.map(r=>Ge(r,e)).join(""),Le=je(s.price,s),C=Ke(s),y=E(C),be=y?a("menu.product","Produkt"):Pe(s.type)==="drink"?a("menu.drinkItem","Pije"):a("menu.foodItem","Speise"),T=y?vt(s.category):s.category||"",R=s.longDescription||s.description||"",V=String(s.ingredients||s.ingredient||s.inhaltsstoffe||"").trim(),_=s.allergens||"",q=String(s.brand||"").trim(),G=String(s.sku||"").trim(),F=Array.isArray(s.sizes)?s.sizes:[],M=Array.isArray(s.colors)?s.colors:[],it=gt(s.stock),Ue=String(Pe(s.type||"")||"").trim().toLowerCase(),ge=Ue==="food"||Ue==="drink",xe=y?s.available===!1||it===0:s.available===!1,at=F.length?String(o.menuDetail.selectedSize||F[0]).trim()||String(F[0]):"",t=M.length?String(o.menuDetail.selectedColor||M[0]).trim()||String(M[0]):"",i=String(o.profileView?.menuAccessSource||"").trim().toLowerCase(),u=String(o.profileTopTab||"").trim().toLowerCase()==="menu",b=!y&&ge&&u&&i==="qr",$=y?ce(C):b,x=Re(s.woltUrl||s.woltLink||""),S=!y&&ge&&!b&&!!x,Q=!y&&ge&&!b&&!S,Qe=!!$,Y=w(s.crossSellItemIds||s.crossSellIds||s.crossSell||s.crossSelling,{excludeId:s.id}),rt=Array.isArray(s.crossSell)?s.crossSell:[],dt=Y.map(e=>_e(e,rt)).filter(Boolean),ct=dt.length?dt:rt.filter(Boolean),Ne=ze(s),ut=Oe(I,Ne),Ye=ut?Te(ut):{likes:[],comments:[],counts:{likes:0,comments:0}},X=D(Ye),pt=We(),He=Ye.likes?.some(e=>e.uid===pt.uid||e.handle===pt.handle),ht=(Array.isArray(o.favoriteMenuItems?.items)?o.favoriteMenuItems.items:[]).some(e=>{if(!e||typeof e!="object")return!1;const r=String(e.restaurantId||"").trim();if(I&&r&&r!==I)return!1;const c=[e.itemId,e.menuSocialId,e.menuItemId,e.id].map(h=>String(h||"").trim()).filter(Boolean);return!!Ne&&c.includes(Ne)}),mt=(Ye.comments||[]).map(nt),B=!!I&&!!Ne&&!!o.user,yt=!!String(o.user?.uid||"").trim(),wt="menuDetailTitle",Xe=y?Me(I||C?.restaurantId||""):0,ft=(String(o.menuDetail.footerView||"cart").trim().toLowerCase()==="comment"?"comment":"cart")==="comment",Ze=a("menu.noInfo","Nuk ka informacion, ju lutem kontaktoni lokalin ose kamarierin."),kt=String(R||"").trim()||Ze,$t=V||Ze,St=String(_||"").trim()||Ze,Je=String(o.menuDetail?.infoTab||"info").trim().toLowerCase(),Ee=Je==="ingredients"||Je==="allergens"?Je:"info",et=e=>["h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer select-none",Ee===e?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"].join(" "),It=y?`
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-3 px-7 pt-7 pb-4 border-b border-slate-100 bg-white">
        <div class="flex items-center gap-2 min-w-0">
          <button type="button" id="menuDetailHeaderCartBtn" class="inline-flex items-center gap-2 px-4 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black shadow-sm active:scale-95 ${$&&!xe?"":"opacity-50 pointer-events-none"}">
            ${p("shopping-cart","w-4 h-4")}
            <span>${n(a("menu.addToCart","In den Warenkorb"))}</span>
            ${Xe?`<span class="inline-flex min-w-[20px] h-5 px-1.5 rounded-full bg-white/14 border border-white/20 text-white text-[9px] font-black items-center justify-center leading-none">${Xe>99?"99+":Xe}</span>`:""}
          </button>
          ${yt?`
            <button type="button" id="menuDetailHeaderFavoritesBtn" aria-label="${n(a("menu.favorite","Favoriten"))}" title="${n(a("menu.favorite","Favoriten"))}" class="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-95 ${ht?"bg-slate-900 text-white border-slate-900":"bg-slate-100 text-slate-700 border-slate-200"}">
              ${p("bookmark","w-4 h-4")}
            </button>
          `:""}
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${p("x","w-4 h-4")}
        </button>
      </div>
    `:`
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-4 px-7 pt-7 pb-5 border-b border-slate-100 bg-white">
        <div class="min-w-0 flex items-center flex-1">
          <div class="min-w-0">
            <h3 id="${wt}" class="text-[1.05rem] leading-tight font-black tracking-tight text-slate-900 truncate">${n(s.name||a("menu.product","Produkt"))}</h3>
            ${T?`<div class="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${n(T)}</div>`:""}
          </div>
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${p("x","w-4 h-4")}
        </button>
      </div>
    `,Ct=y?`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 space-y-5 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div class="modal-handoff-hero relative rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y; aspect-ratio:4 / 5;">
          ${Be()}
          ${k.length>1?`
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center" style="z-index:30;">
              ${p("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center" style="z-index:30;">
              ${p("chevron-right","w-4 h-4")}
            </button>
          `:""}
        </div>
        <div class="modal-handoff-chrome">
        ${k.length>1?`
          <div class="flex items-center justify-center gap-2">
            ${k.map((e,r)=>`
              <button type="button" data-menu-gallery-dot="${r}" class="w-2.5 h-2.5 rounded-full ${r===W?"bg-slate-900":"bg-slate-200"}"></button>
            `).join("")}
          </div>
        `:""}
        <div class="flex items-center justify-between">
          <span class="text-lg font-black text-slate-900">${n(Le)}</span>
        </div>
        <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          ${T?`<span>${n(T)}</span>`:""}
          <span>${n(be)}</span>
        </div>
        ${q||G?`
          <div class="grid ${q&&G?"grid-cols-2":"grid-cols-1"} gap-3">
            ${q?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${n(a("menu.brand","Marke"))}</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${n(q)}</p></div>`:""}
            ${G?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">SKU</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${n(G)}</p></div>`:""}
          </div>
        `:""}
        ${F.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${n(a("menu.sizes","Madhesite"))}</p>
            <select data-menu-detail-variant="size" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${F.map(e=>`<option value="${n(e)}" ${at===String(e)?"selected":""}>${n(e)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${M.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${n(a("menu.colors","Ngjyrat"))}</p>
            <select data-menu-detail-variant="color" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${M.map(e=>`<option value="${n(e)}" ${t===String(e)?"selected":""}>${n(e)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${R?`<p class="text-sm text-slate-600 leading-relaxed">${n(R)}</p>`:""}
        ${_?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">${n(a("menu.notes","Hinweise"))}</p>
            <p class="text-sm text-slate-600">${n(_)}</p>
          </div>
        `:""}
        <div class="flex items-center justify-between" style="padding-top:1.25rem;">
          <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${He?"text-rose-500":"text-slate-700"} ${B?"":"opacity-50 pointer-events-none"}">
            ${p("heart","w-3.5 h-3.5")} ${n(He?a("likes.liked","Gefaellt"):a("likes.like","Like"))}
          </button>
          <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span id="menuDetailLikesCount">${n(K(X.likes))} ${n(a("likes.count","Likes"))}</span>
            <span id="menuDetailCommentsCount">${n(K(X.comments))} ${n(a("comments.count","Kommentare"))}</span>
          </div>
        </div>
        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${De(mt)}
        </div>
        </div>
      </div>
    `:`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 bg-white/98">
        <div class="modal-handoff-hero relative h-56 rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y;">
          ${Be()}
          ${k.length>1?`
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center" style="z-index:30;">
              ${p("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center" style="z-index:30;">
              ${p("chevron-right","w-4 h-4")}
            </button>
          `:""}
        </div>
        <div class="modal-handoff-chrome">
        <div class="mt-6 space-y-5">
          <div class="p-4 rounded-[1.3rem] border border-slate-100 bg-slate-50">
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">${n(a("menu.price","Preis"))}</span>
              <span class="font-black text-slate-900" style="font-size:13px;">${n(Le)}</span>
            </div>
          </div>
          <div class="border-t border-slate-100"></div>

          <div class="space-y-3">
            <div class="menu-detail-info-tabs space-y-4">
              <div class="grid grid-cols-3 gap-2 menu-detail-info-controls">
                <button type="button" data-menu-detail-info-tab="info" class="${et("info")}">${n(a("menu.info","Info"))}</button>
                <button type="button" data-menu-detail-info-tab="ingredients" class="${et("ingredients")}">${n(a("menu.ingredients","Inhaltsstoffe"))}</button>
                <button type="button" data-menu-detail-info-tab="allergens" class="${et("allergens")}">${n(a("menu.allergens","Allergene"))}</button>
              </div>
              <div class="menu-detail-info-panels rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-3.5">
                <p data-menu-detail-info-panel="info" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${Ee==="info"?"":"hidden"}">${n(kt)}</p>
                <p data-menu-detail-info-panel="ingredients" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${Ee==="ingredients"?"":"hidden"}">${n($t)}</p>
                <p data-menu-detail-info-panel="allergens" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${Ee==="allergens"?"":"hidden"}">${n(St)}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100"></div>
          ${ct.length?`<div class="pt-1">${ot(ct,{showAdd:Qe})}</div><div class="border-t border-slate-100"></div>`:""}

          <div class="flex items-center justify-between" style="padding-top:1.25rem;">
            <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${He?"text-rose-500":"text-slate-700"} ${B?"":"opacity-50 pointer-events-none"}">
              ${p("heart","w-3.5 h-3.5")} ${n(He?a("likes.liked","Gefaellt"):a("likes.like","Like"))}
            </button>
            <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span id="menuDetailLikesCount">${n(K(X.likes))} ${n(a("likes.count","Likes"))}</span>
              <span id="menuDetailCommentsCount">${n(K(X.comments))} ${n(a("comments.count","Kommentare"))}</span>
            </div>
          </div>
        </div>

        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${De(mt)}
        </div>
        </div>
      </div>
    `,jt=S?`
      <button type="button" id="menuDetailWoltBtn" data-wolt-url="${n(x)}" class="flex-1 h-[52px] rounded-[1.65rem] text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm" style="background-color:#18b9df;" title="${n(a("menu.openWolt","Bei Wolt oeffnen"))}">
        <span class="font-bold text-sm">Wolt</span>
        ${p("external-link","w-4 h-4")}
      </button>
    `:Q?`
        <button id="menuDetailFavoriteCtaBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all">
          <span class="font-bold text-sm">${n(a("menu.toFavorites","Zu Favoriten"))}</span>
          ${p("bookmark","w-4 h-4")}
        </button>
      `:`
        <button id="menuDetailAddToCartBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all ${$&&!xe?"":"opacity-50 pointer-events-none"}">
          <span class="font-bold text-sm">${n(xe?a("menu.soldOut","Ausverkauft"):a("menu.addToCart","In den Warenkorb"))}</span>
          ${p("shopping-bag","w-4 h-4")}
        </button>
      `,At=S?a("menu.backToWolt","Kthehu te Wolt"):Q?a("menu.backToFavorites","Kthehu te te preferuarat"):a("menu.backToCart","Kthehu te shporta"),Pt=S?"text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200",zt=S?'style="background-color:#18b9df;"':"",Tt=S?`
      <span class="w-5 h-5 inline-flex items-center justify-center text-white leading-none select-none" aria-hidden="true">
        <span class="block" style="font-family:'Omnes','Plus Jakarta Sans','Segoe UI',sans-serif;font-size:20px;font-weight:800;font-style:italic;line-height:1;transform:translateY(-1px);">
          w
        </span>
      </span>
    `:p(Q?"bookmark":"shopping-bag","w-5 h-5"),Mt=`
    <div class="modal-handoff-chrome px-7 pb-6 pt-4 border-t border-slate-100 bg-white/98 backdrop-blur-sm modal-footer-safe relative z-10">
      <div id="footer-cart-view" class="flex gap-3 items-center w-full transition-all duration-300 ${ft?"hidden opacity-0":""}">
        <button type="button" id="menuDetailFooterCommentToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 relative" title="${n(a("menu.commentAction","Kommentare verfassen"))}">
          ${p("message-square","w-5 h-5")}
          ${X.comments>0?`<span id="menuDetailFooterCommentsBadge" class="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">${X.comments}</span>`:""}
        </button>
        ${jt}
      </div>

      <div id="footer-comment-view" class="flex gap-3 items-center w-full transition-all duration-300 ${ft?"":"hidden opacity-0"}">
        <button type="button" id="menuDetailFooterCartToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] ${Pt} flex items-center justify-center transition-all active:scale-95" ${zt} title="${At}">
          ${Tt}
        </button>

        <div class="flex-1 flex gap-2">
          <textarea id="menuDetailCommentInput" placeholder="${n(B?a("menu.commentPlaceholder","Schreib einen Kommentar..."):a("menu.loginRequired","Ju lutem hyni"))}" class="flex-1 px-5 py-3.5 rounded-[1.65rem] border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none leading-relaxed ${B?"":"opacity-60"}" rows="1" ${B?"":"disabled"}>${n(o.menuDetail.commentText||"")}</textarea>
          <button id="menuDetailCommentSend" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-indigo-600 text-white flex items-center justify-center ${B?"":"opacity-60 cursor-not-allowed"}" ${B?"":"disabled"}>
            ${p("send","w-4 h-4")}
          </button>
        </div>
      </div>
    </div>
  `;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="menuDetailOverlay" data-menu-detail-close="true" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame menu-detail-modal-frame">
        <div class="bg-white rounded-t-[3.2rem] shadow-[0_-24px_80px_rgba(15,23,42,0.22)] border-x border-b border-slate-100  flex flex-col modal-sheet-88 overflow-hidden modal-sheet menu-detail-modal-sheet">
          ${It}
          ${Ct}
          ${Mt}
        </div>
      </div>
    </div>
  `}export{Qt as renderMenuDetailModalCore,Gt as renderMenuItemModalCore};
