import{v as Ht,w as Et}from"./domain-menu-eager-DwtWn1Sg.js";import{a as yt}from"./domain-media-eager-DAUyCk2O.js";import{t as Ot}from"./domain-feed-social-eager-DACV_SJ5.js";import"./domain-auth-Aq-4Vdvh.js";import"./domain-public-profile-mLQti0eH.js";const Wt=Object.freeze(["Fruehstueck","Brunch","Vorspeise","Suppe","Salat","Pasta","Pizza","Burger","Sandwich","Wrap","Grill","Fleisch","Fisch","Vegetarisch","Vegan","Beilage","Kinder","Dessert","Kuchen","Eis","Kaffee","Tee","Softdrink","Saft","Smoothie","Bier","Wein","Cocktail","Spirituose","Sonstiges"]);function wt(o){if(o==null)return null;const v=typeof o=="string"?o.trim():o;if(v==="")return null;const j=Number(v);return Number.isFinite(j)?Math.max(0,j):null}function kt(o=""){const v=String(o||"").trim().toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(v)}function $t(o=""){const v=String(o||"").trim();return v?kt(v)?"Produkte":v:""}function Zt({state:o,isShopCatalogProfile:v,getBusinessProfileType:j,getOptimizedImageUrl:J,PLACEHOLDER_IMAGE:B,isPlaceholderUrl:ee,normalizeMenuType:te,getMenuModalCrop:ne,escapeHtml:oe,icon:se}={}){if(!o||!o.menuModal?.open)return"";const xe=typeof v=="function"?v:(()=>!1),ve=typeof j=="function"?j:(()=>""),L=typeof J=="function"?J:(n=>String(n||"")),he=typeof ee=="function"?ee:(()=>!1),ye=typeof te=="function"?te:(n=>String(n||"food")),we=typeof ne=="function"?ne:(()=>({x:50,y:50})),r=typeof oe=="function"?oe:(n=>String(n||"")),A=typeof se=="function"?se:(()=>""),ke=n=>{const i=Number(n);return Number.isFinite(i)?`${i.toFixed(2).replace(".",",")} EUR`:String(n||"").trim()||"0,00 EUR"},$e=(n,{excludeId:i=""}={})=>{const u=String(i||"").trim(),b=new Set,$=x=>{if(x==null)return;if(Array.isArray(x)){x.forEach($);return}const S=typeof x=="object"?x.id||x.itemId||x.productId||x.menuItemId||"":x,q=String(S||"").trim();q&&q.split(",").forEach(Ye=>{const G=String(Ye||"").trim();!G||G===u||b.has(G)||b.add(G)})};return $(n),Array.from(b)},l=o.menuModal.item||{},le=o.menuModal.mode==="edit",g=xe(o.userProfile),Se=le?"Ndrysho produktin":"Shto produkt",Ie=Array.isArray(o.menuModal.existingImages)?o.menuModal.existingImages:[],N=Array.isArray(o.menuModal.imagePreviews)?o.menuModal.imagePreviews:[],ae=String(o.menuModal.imageUrlDraft||"").trim(),P=[...Ie.map((n,i)=>({src:n,kind:"existing",idx:i})),...N.map((n,i)=>({src:n,kind:"new",idx:i}))].filter(n=>n.src),ie=P[0]?.src||ae||l.imageUrl||"",re=ie?L(ie,"large"):B,Ce=he(re)?B:re,je=String(o.menuModal.videoPreview||"").trim(),We=String(o.menuModal.videoPosterPreview||"").trim(),U=!!(o.menuModal.videoFile&&je),Ae=N.length>0,de=yt(l)&&!Ae&&!U,Pe=U||de,Ke=U?je:de?String(l.videoUrl||"").trim():"",ze=U?We:de?L(String(l.posterUrl||l.imageUrl||"").trim(),"large"):"",D=ye(l.type||"food"),Re=D==="food"||D==="drink",Te=l.available!==!1?"available":"unavailable",Me=o.menuModal.status||"",H=Array.isArray(l.sizes)?l.sizes.join(", "):"",ce=Array.isArray(l.colors)?l.colors.join(", "):"",a=wt(l.stock),_e=a===null?"":String(a),w=we(),qe=String(ve(o.userProfile)||"").trim().toLowerCase(),E=!g&&Ht(qe),t=(()=>{const n=o?.userProfile?.specialEnabled;if(typeof n=="boolean")return n;const i=String(o?.userProfile?.restaurantId||"").trim();return i?(Array.isArray(o?.restaurants)?o.restaurants.find(b=>String(b?.id||"").trim()===i):null)?.specialEnabled===!0:!1})(),p=Et(l.cardStyle||"",D),s=p==="testfirst_special"||String(l.category||"").trim().toLowerCase()==="special",k=E&&!s&&p==="testfirst_drink",O=(n=>{const i=Number(n);return Number.isFinite(i)?i<=33?"left":i>=67?"right":"center":"center"})(w.x),I=String(l.category||(g?"Produkte":"Sonstiges")).trim()||(g?"Produkte":"Sonstiges"),De=g?$t(I):I,Ve=n=>String(n||"").trim().toLowerCase()==="special",ue=Array.from(new Set([De,...Array.isArray(o.menu?.items)?o.menu.items.map(n=>String(n?.category||"").trim()):[],...g?["Produkte"]:Wt].filter(n=>!(!n||g&&kt(n)||!t&&Ve(n))))),pe="menuItemCategoryOptions",me=String(l.specialSize||l.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default",z=String(l.specialActionType||l.actionType||"").trim().toLowerCase()==="link"?"link":"product",Ge=String(l.specialActionUrl||l.linkUrl||l.actionUrl||"").trim(),Qe=String(l.specialActionProductId||l.targetProductId||"").trim(),Fe=String(l.ingredients||l.ingredient||l.inhaltsstoffe||"").trim(),Be=String(l.woltUrl||l.woltLink||"").trim(),C=String(l.id||"").trim(),y=(n,i=0)=>{const u=Number(n);return Number.isFinite(u)?Math.max(0,Math.floor(u)):Math.max(0,Number(i)||0)},fe=Array.isArray(o.menu?.items)?o.menu.items.slice().map((n,i)=>({entry:n,idx:i,order:y(n?.orderIndex,i)})).sort((n,i)=>n.order-i.order||n.idx-i.idx).map(n=>n.entry):[],T=fe.filter(n=>String(n?.id||"").trim()!==C),W=fe.findIndex(n=>String(n?.id||"").trim()===C),V=Math.max(1,T.length+1),K=W>=0?Math.min(V,Math.max(1,W+1)):V,R=Math.min(V,Math.max(1,Number.isFinite(Number(l.orderIndex))?y(l.orderIndex,K-1)+1:K)),_=Array.isArray(o.menu?.items)?o.menu.items.filter(n=>{const i=String(n?.id||"").trim();return!(!i||i===C)}):[],F=$e(l.crossSellItemIds||l.crossSellIds||l.crossSell||l.crossSelling,{excludeId:C}),M=fe.filter(n=>{const i=String(n?.id||"").trim();if(!i||i===C)return!1;const u=String(n?.type||"").trim().toLowerCase(),b=String(n?.menuSection||"").trim().toLowerCase();return u==="food"||u==="drink"||b==="food"||b==="drink"}),Le=`
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${le?"Ndrysho":"I ri"}</span>
        <h3 id="menuModalTitle" class="text-xl font-black italic tracking-tighter">${Se}</h3>
      </div>
      <button id="menuModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${A("x","w-4 h-4")}
      </button>
    </div>
  `,be=`
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="menuItemImageInput" class="hidden" accept="image/*,video/*" multiple />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${Pe?`
          <video id="menuItemHeroVideo" src="${r(Ke)}" ${ze?`poster="${r(ze)}"`:""} class="w-full h-52 object-cover" style="object-position:${w.x}% ${w.y}%;" muted loop playsinline autoplay preload="metadata"></video>
          <span class="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
            ${A("play","w-3 h-3")} Video
          </span>
        `:`
          <img id="menuItemHeroPreview" src="${r(Ce)}" class="w-full h-52 object-cover" style="object-position:${w.x}% ${w.y}%;" />
        `}
        <button type="button" id="menuItemImageTrigger" aria-label="Ngarko foto ose video" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${A("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${A("plus","w-2.5 h-2.5")}
          </span>
        </button>
      </div>
      ${Pe?`
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
            <button type="button" data-menu-small-crop="left" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${O==="left"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Links</button>
            <button type="button" data-menu-small-crop="center" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${O==="center"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Mitte</button>
            <button type="button" data-menu-small-crop="right" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${O==="right"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Rechts</button>
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
            ${P.map(n=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                <img src="${r(L(n.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-menu-image-remove="${n.idx}" data-menu-image-source="${n.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
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
          <input id="menuItemName" type="text" value="${r(l.name||"")}" placeholder="Emri i produktit" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cmimi</label>
            <input id="menuItemPrice" type="text" value="${r(l.price??"")}" placeholder="z.B. 4.50" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Kategorie</label>
            <input id="menuItemCategory" list="${pe}" type="text" value="${r(De)}" placeholder="Shkruaj kategorine" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <datalist id="${pe}">
              ${ue.map(n=>`<option value="${r(n)}"></option>`).join("")}
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
            <option value="available" ${Te==="available"?"selected":""}>E disponueshme</option>
            <option value="unavailable" ${Te==="unavailable"?"selected":""}>Ausverkauft</option>
          </select>
        </div>
        ${t&&E&&s?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Position im aktiven Menue</label>
            <select id="menuItemOrderPosition" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              ${Array.from({length:V},(n,i)=>{const u=i+1,b=T[u-1]||null,$=u>1?T[u-2]:null,x=u===1?"Ganz oben":u===V?"Ganz unten":`Nach ${String($?.name||"Produkt").trim()||"Produkt"}`,S=b?` (vor ${String(b?.name||"Produkt").trim()||"Produkt"})`:"";return`<option value="${u}" ${R===u?"selected":""}>Position ${u}: ${r(x)}${r(S)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Thjesht zgjidh ne vend te drag and drop.</p>
          </div>
        `:""}
        ${E&&!s?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Card Style</label>
            <select id="menuItemCardStyle" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="testfirst_drink" ${p==="testfirst_drink"?"selected":""}>Small = Drink Card</option>
              <option value="testfirst_food" ${p==="testfirst_food"?"selected":""}>Big = Food Card</option>
            </select>
          </div>
        `:""}
        ${t&&E&&s?`
          <input id="menuItemCardStyle" type="hidden" value="testfirst_special" />
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Madhesia Special</label>
            <select id="menuItemSpecialSize" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="default" ${me==="default"?"selected":""}>Normal</option>
              <option value="food" ${me==="food"?"selected":""}>Madhesia e Food-Card</option>
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
              ${_.map(n=>{const i=String(n?.id||"").trim(),u=String(n?.name||"Produkt").trim()||"Produkt";return`<option value="${r(i)}" ${Qe===i?"selected":""}>${r(u)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Perdoret kur veprimi i klikimit = modal i produktit.</p>
          </div>
          <div id="menuItemSpecialActionLinkField" class="${z==="link"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Link</label>
            <input id="menuItemSpecialActionUrl" type="text" value="${r(Ge)}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Perdoret kur veprimi i klikimit = link.</p>
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Pershkrimi</label>
          <textarea id="menuItemDesc" rows="3" placeholder="Pershkrimi..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${r(l.description||"")}</textarea>
        </div>
        ${g?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Inhaltsstoffe</label>
            <textarea id="menuItemIngredients" rows="3" placeholder="z.B. Wasser, Zucker, Salz..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${r(Fe)}</textarea>
          </div>
        `}
        ${g?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Wolt Link</label>
            <input id="menuItemWoltUrl" type="url" value="${r(Be)}" placeholder="https://wolt.com/..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Opsionale: shfaqet ne dritaren e produktit kur nuk ka qasje QR ne menu.</p>
          </div>
        `}
        ${g?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Details</label>
            <textarea id="menuItemLongDesc" rows="4" placeholder="Materiali, gjendja, detajet e dorezimit..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${r(l.longDescription||"")}</textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Marka</label>
              <input id="menuItemBrand" type="text" value="${r(l.brand||"")}" placeholder="z.B. Nike" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">SKU</label>
              <input id="menuItemSku" type="text" value="${r(l.sku||"")}" placeholder="ART-001" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Madhesite</label>
              <input id="menuItemSizes" type="text" value="${r(H)}" placeholder="XS, S, M, L" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Ngjyrat</label>
              <input id="menuItemColors" type="text" value="${r(ce)}" placeholder="E zeze, e bardhe" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Lagerbestand</label>
            <input id="menuItemStock" type="number" min="0" inputmode="numeric" value="${r(_e)}" placeholder="0" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">${g?"Shenime":"Alergenet"}</label>
          <input id="menuItemAllergens" type="text" value="${r(l.allergens||"")}" placeholder="${g?"p.sh. edicion i limituar, pa kthim":"z.B. Milch, Gluten"}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        ${!g&&Re?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cross Selling (QR)</label>
            <div class="mt-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 max-h-48 overflow-y-auto no-scrollbar space-y-2">
              ${M.length?M.map(n=>{const i=String(n?.id||"").trim(),u=String(n?.name||"Produkt").trim()||"Produkt",b=String(n?.category||"").trim(),$=ke(n?.price);return`
                  <label class="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                    <input type="checkbox" data-menu-cross-sell-option value="${r(i)}" ${F.includes(i)?"checked":""} class="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" />
                    <span class="min-w-0 flex-1">
                      <span class="block text-xs font-black text-slate-800 truncate">${r(u)}</span>
                      <span class="block text-[10px] font-bold uppercase tracking-wide text-slate-400">${r(b||"Produkt")} · ${r($)}</span>
                    </span>
                  </label>
                `}).join(""):'<p class="text-[10px] font-bold uppercase tracking-wide text-slate-400 px-2 py-1">Nuk ka me ushqime/pije te disponueshme</p>'}
            </div>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Shfaqet vetem ne dritaren e produktit kur menuja hapet me QR kod.</p>
          </div>
        `:""}
      </div>
    </div>
  `,ge=`
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
      <button id="menuModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${o.menuModal.loading?"disabled":""}>
        ${o.menuModal.loading?"Duke ruajtur...":"Ruaj"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${r(Me)}</div>
    </div>
  `;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="menuModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          ${Le}
          ${be}
          ${ge}
        </div>
      </div>
    </div>
  `}function Jt({state:o,getMenuItemImages:v,getOptimizedImageUrl:j,isPlaceholderUrl:J,PLACEHOLDER_IMAGE:B,getFirebaseStorageUrl:ee,isDirectImageUrl:te,formatPrice:ne,getMenuDetailRestaurantId:oe,getMenuDetailCatalogProfile:se,isShopCatalogProfile:xe,normalizeMenuType:ve,canAddToShopCart:L,getMenuItemSocialId:he,menuItemMetaKey:ye,ensureMenuItemMeta:we,resolveMenuItemCounts:r,currentUserBadge:A,ensureCommentShape:ke,getCartCountForRestaurant:$e,renderMenuDetailComments:l,formatCount:le,getMenuItemObjectPosition:g,escapeHtml:Se,icon:Ie}={}){if(!o||!o.menuDetail?.open||!o.menuDetail?.item)return"";const N=typeof v=="function"?v:(()=>[]),ae=typeof j=="function"?j:(e=>String(e||"")),P=typeof J=="function"?J:(()=>!1),ie=typeof ee=="function"?ee:(e=>String(e||"")),re=typeof te=="function"?te:(()=>!1),Ce=typeof ne=="function"?ne:(e=>String(e||"")),je=typeof oe=="function"?oe:(()=>""),We=typeof se=="function"?se:(()=>null),U=typeof xe=="function"?xe:(()=>!1),Ae=typeof ve=="function"?ve:(e=>String(e||"food")),de=typeof L=="function"?L:(()=>!1),Pe=typeof he=="function"?he:(()=>""),Ke=typeof ye=="function"?ye:(()=>""),ze=typeof we=="function"?we:(()=>({likes:[],comments:[],counts:{likes:0,comments:0}})),D=typeof r=="function"?r:(()=>({likes:0,comments:0})),Re=typeof A=="function"?A:(()=>({uid:"",handle:""})),ot=typeof ke=="function"?ke:(e=>e),Te=typeof $e=="function"?$e:(()=>0),Me=typeof l=="function"?l:(()=>""),H=typeof le=="function"?le:(e=>String(e||"0")),ce=typeof g=="function"?g:(()=>"50% 50%"),a=(e,d=e,c={})=>Ot(e,{fallback:d,params:c}),_e=(e="")=>{const d=String(e||"").trim();return d?/^(https?:\/\/|mailto:|tel:)/i.test(d)?d:`https://${d.replace(/^\/+/,"")}`:""},w=(e,{excludeId:d=""}={})=>{const c=String(d||"").trim(),h=new Set,m=f=>{if(f==null)return;if(Array.isArray(f)){f.forEach(m);return}const Y=typeof f=="object"?f.id||f.itemId||f.productId||f.menuItemId||"":f,X=String(Y||"").trim();X&&X.split(",").forEach(nt=>{const Z=String(nt||"").trim();!Z||Z===c||h.has(Z)||h.add(Z)})};return m(e),Array.from(h)},qe=(e,d=[])=>{const c=String(e||"").trim();if(!c)return null;const h=Array.isArray(o?.menu?.items)?o.menu.items.find(m=>String(m?.id||"").trim()===c):null;return h||Array.isArray(d)&&d.find(m=>String(m?.id||m?.itemId||m?.productId||m?.menuItemId||"").trim()===c)||null},E=(e={},d=0,{showAdd:c=!1}={})=>{const m=(Array.isArray(N(e))?N(e):[])[0]||e.imageUrl||e.image||"",f=ae(m,"thumb"),Y=P(f)?B:f,X=ie(m),nt=re(m)&&m!==Y?m:X,Z=a("menu.crossSellSuggestion","Empfehlung {index}",{index:d+1}),Oe=String(e.name||"").trim()||Z,Nt=String(e.category||"").trim()||a("menu.crossSellFallbackCategory","Passt dazu"),Ut=Ce(e.price,e),vt=String(e.id||e.itemId||e.productId||e.menuItemId||"").trim(),ht=a("menu.crossSellAdd","{name} in den Warenkorb",{name:Oe});return`
      <div class="group menu-cross-sell-card rounded-[1.8rem] border border-slate-100 bg-white p-2.5 text-left transition-all">
        <div class="menu-cross-sell-media relative overflow-hidden rounded-[1.2rem] bg-slate-100 mx-auto">
          <img src="${t(Y)}" data-fallback-src="${t(nt)}" data-image-reveal="menu" alt="${t(Oe)}" class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" fetchpriority="low" decoding="async" />
        </div>
        <div class="menu-cross-sell-body pt-3 px-1">
          <div class="menu-cross-sell-eyebrow">${t(Nt)}</div>
          <div class="menu-cross-sell-name" title="${t(Oe)}">${t(Oe)}</div>
          <div class="menu-cross-sell-footer">
            <span class="menu-cross-sell-price">${t(Ut)}</span>
            ${c&&vt?`
              <button type="button" class="menu-cross-sell-add" data-menu-cross-sell-add="${t(vt)}" aria-label="${t(ht)}" title="${t(ht)}">
                ${p("plus","w-4 h-4")}
              </button>
            `:""}
          </div>
        </div>
      </div>
    `},st=(e=[],{showAdd:d=!1}={})=>{if(!e.length)return"";const c=e.length===1?a("menu.crossSellCountOne","{count} Vorschlag",{count:e.length}):a("menu.crossSellCount","{count} Vorschlaege",{count:e.length});return`
      <section class="space-y-3">
        <div class="flex items-end justify-between gap-3">
          <div>
            <h4 class="text-base font-black tracking-tight text-slate-900">${t(a("menu.crossSellTitle","Passt perfekt dazu"))}</h4>
          </div>
          <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">${t(c)}</div>
        </div>
        <div class="overflow-x-auto no-scrollbar">
          <div class="menu-cross-sell-row flex gap-3 pb-1">
            ${e.map((h,m)=>E(h,m,{showAdd:d})).join("")}
          </div>
        </div>
      </section>
    `},t=typeof Se=="function"?Se:(e=>String(e||"")),p=typeof Ie=="function"?Ie:(()=>""),s=o.menuDetail.item,k=N(s),lt=k.length?k.length-1:0,O=Math.max(0,Math.min(o.menuDetail.index||0,lt)),I=je(s),De=(e,d)=>{const c=String(e||""),h=s?.id?`menu-detail:${String(I||"")}:${String(s.id)}:${d}`:"",m=ae(c,"large",{stableKey:h,variantGroup:"menu-detail"}),f=P(m)?B:m,Y=ie(c),X=re(c)&&c!==f?c:Y;return{idx:d,safe:f,fallback:X}},Ve=(k.length?k:[""]).map(De),ue=yt(s),pe=ue?String(s.videoUrl||"").trim():"",me=ue?String(s.posterUrl||"").trim()?ae(String(s.posterUrl).trim(),"large"):Ve[0]?.safe||B:"",at=`
    <button type="button" data-menu-video-toggle aria-label="Play/Pause" class="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center z-20 active:scale-95 transition">
      <svg data-video-icon-play viewBox="0 0 24 24" class="w-4 h-4 fill-white block"><path d="M8 5v14l11-7z"></path></svg>
      <svg data-video-icon-pause viewBox="0 0 24 24" class="w-4 h-4 fill-white hidden"><path d="M6 5h4v14H6zM14 5h4v14h-4z"></path></svg>
    </button>`,z=String(o.menuDetail?.previewImageSrc||"").trim(),Ge=z&&!P(z)?`background-image:url("${t(z.replace(/"/g,"%22"))}");background-size:cover;background-position:${ce(s)};background-repeat:no-repeat;`:"",Qe=(e,d="")=>{const c=e.idx===O,m=ue&&!!pe&&e.idx===0?`<video id="menuDetailHeroVideo" data-menu-detail-video src="${t(pe)}" ${me?`poster="${t(me)}"`:""} class="absolute inset-0 w-full h-full object-cover${d?` ${d}`:""}" style="object-position:${ce(s)};" muted loop autoplay playsinline preload="metadata"></video>${at}`:`<img ${c?'id="menuDetailHeroImage" ':""}data-menu-detail-hero-image ${c?`src="${t(e.safe)}"`:`data-menu-gallery-src="${t(e.safe)}"`} data-fallback-src="${t(e.fallback)}" class="absolute inset-0 w-full h-full object-cover${d?` ${d}`:""}" style="object-position:${ce(s)};" loading="eager" fetchpriority="${c?"high":"low"}" decoding="${c?"sync":"async"}" />`,f=[c?Ge:"",c?"":"opacity:0;pointer-events:none;"].join("");return`<div data-menu-gallery-slide="${e.idx}" class="absolute inset-0"${f?` style="${f}"`:""}>${m}</div>`},Fe=(e="")=>Ve.map(d=>Qe(d,e)).join(""),Be=Ce(s.price,s),C=We(s),y=U(C),fe=y?a("menu.product","Produkt"):Ae(s.type)==="drink"?a("menu.drinkItem","Pije"):a("menu.foodItem","Speise"),T=y?$t(s.category):s.category||"",W=s.longDescription||s.description||"",V=String(s.ingredients||s.ingredient||s.inhaltsstoffe||"").trim(),K=s.allergens||"",R=String(s.brand||"").trim(),_=String(s.sku||"").trim(),F=Array.isArray(s.sizes)?s.sizes:[],M=Array.isArray(s.colors)?s.colors:[],it=wt(s.stock),Le=String(Ae(s.type||"")||"").trim().toLowerCase(),be=Le==="food"||Le==="drink",ge=y?s.available===!1||it===0:s.available===!1,rt=F.length?String(o.menuDetail.selectedSize||F[0]).trim()||String(F[0]):"",n=M.length?String(o.menuDetail.selectedColor||M[0]).trim()||String(M[0]):"",i=String(o.profileView?.menuAccessSource||"").trim().toLowerCase(),u=String(o.profileTopTab||"").trim().toLowerCase()==="menu",b=!y&&be&&u&&i==="qr",$=y?de(C):b,x=_e(s.woltUrl||s.woltLink||""),S=!y&&be&&!b&&!!x,q=!y&&be&&!b&&!S,Ye=!!$,G=w(s.crossSellItemIds||s.crossSellIds||s.crossSell||s.crossSelling,{excludeId:s.id}),dt=Array.isArray(s.crossSell)?s.crossSell:[],ct=G.map(e=>qe(e,dt)).filter(Boolean),ut=ct.length?ct:dt.filter(Boolean),Ne=Pe(s),pt=Ke(I,Ne),Xe=pt?ze(pt):{likes:[],comments:[],counts:{likes:0,comments:0}},Q=D(Xe),mt=Re(),Ue=Xe.likes?.some(e=>e.uid===mt.uid||e.handle===mt.handle),St=(Array.isArray(o.favoriteMenuItems?.items)?o.favoriteMenuItems.items:[]).some(e=>{if(!e||typeof e!="object")return!1;const d=String(e.restaurantId||"").trim();if(I&&d&&d!==I)return!1;const c=[e.itemId,e.menuSocialId,e.menuItemId,e.id].map(h=>String(h||"").trim()).filter(Boolean);return!!Ne&&c.includes(Ne)}),ft=(Xe.comments||[]).map(ot),bt=!!I&&!!Ne,gt=bt&&!!o.user,He=bt,It=!!String(o.user?.uid||"").trim(),Ct="menuDetailTitle",Ze=y?Te(I||C?.restaurantId||""):0,xt=(String(o.menuDetail.footerView||"cart").trim().toLowerCase()==="comment"?"comment":"cart")==="comment",Je=a("menu.noInfo","Nuk ka informacion, ju lutem kontaktoni lokalin ose kamarierin."),jt=String(W||"").trim()||Je,At=V||Je,Pt=String(K||"").trim()||Je,et=String(o.menuDetail?.infoTab||"info").trim().toLowerCase(),Ee=et==="ingredients"||et==="allergens"?et:"info",tt=e=>["h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer select-none",Ee===e?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"].join(" "),zt=y?`
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-3 px-7 pt-7 pb-4 border-b border-slate-100 bg-white">
        <div class="flex items-center gap-2 min-w-0">
          <button type="button" id="menuDetailHeaderCartBtn" class="inline-flex items-center gap-2 px-4 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black shadow-sm active:scale-95 ${$&&!ge?"":"opacity-50 pointer-events-none"}">
            ${p("shopping-cart","w-4 h-4")}
            <span>${t(a("menu.addToCart","In den Warenkorb"))}</span>
            ${Ze?`<span class="inline-flex min-w-[20px] h-5 px-1.5 rounded-full bg-white/14 border border-white/20 text-white text-[9px] font-black items-center justify-center leading-none">${Ze>99?"99+":Ze}</span>`:""}
          </button>
          ${It?`
            <button type="button" id="menuDetailHeaderFavoritesBtn" aria-label="${t(a("menu.favorite","Favoriten"))}" title="${t(a("menu.favorite","Favoriten"))}" class="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-95 ${St?"bg-slate-900 text-white border-slate-900":"bg-slate-100 text-slate-700 border-slate-200"}">
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
            <h3 id="${Ct}" class="text-[1.05rem] leading-tight font-black tracking-tight text-slate-900 truncate">${t(s.name||a("menu.product","Produkt"))}</h3>
            ${T?`<div class="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${t(T)}</div>`:""}
          </div>
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${p("x","w-4 h-4")}
        </button>
      </div>
    `,Tt=y?`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 space-y-5 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div class="modal-handoff-hero relative rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y; aspect-ratio:4 / 5;">
          ${Fe()}
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
            ${k.map((e,d)=>`
              <button type="button" data-menu-gallery-dot="${d}" class="w-2.5 h-2.5 rounded-full ${d===O?"bg-slate-900":"bg-slate-200"}"></button>
            `).join("")}
          </div>
        `:""}
        <div class="flex items-center justify-between">
          <span class="text-lg font-black text-slate-900">${t(Be)}</span>
        </div>
        <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          ${T?`<span>${t(T)}</span>`:""}
          <span>${t(fe)}</span>
        </div>
        ${R||_?`
          <div class="grid ${R&&_?"grid-cols-2":"grid-cols-1"} gap-3">
            ${R?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${t(a("menu.brand","Marke"))}</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${t(R)}</p></div>`:""}
            ${_?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">SKU</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${t(_)}</p></div>`:""}
          </div>
        `:""}
        ${F.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${t(a("menu.sizes","Madhesite"))}</p>
            <select data-menu-detail-variant="size" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${F.map(e=>`<option value="${t(e)}" ${rt===String(e)?"selected":""}>${t(e)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${M.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${t(a("menu.colors","Ngjyrat"))}</p>
            <select data-menu-detail-variant="color" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${M.map(e=>`<option value="${t(e)}" ${n===String(e)?"selected":""}>${t(e)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${W?`<p class="text-sm text-slate-600 leading-relaxed">${t(W)}</p>`:""}
        ${K?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">${t(a("menu.notes","Hinweise"))}</p>
            <p class="text-sm text-slate-600">${t(K)}</p>
          </div>
        `:""}
        <div class="flex items-center justify-between" style="padding-top:1.25rem;">
          <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${Ue?"text-rose-500":"text-slate-700"} ${gt?"":"opacity-50 pointer-events-none"}">
            ${p("heart","w-3.5 h-3.5")} ${t(Ue?a("likes.liked","Gefaellt"):a("likes.like","Like"))}
          </button>
          <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span id="menuDetailLikesCount">${t(H(Q.likes))} ${t(a("likes.count","Likes"))}</span>
            <span id="menuDetailCommentsCount">${t(H(Q.comments))} ${t(a("comments.count","Kommentare"))}</span>
          </div>
        </div>
        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${Me(ft)}
        </div>
        </div>
      </div>
    `:`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 bg-white/98">
        <div class="modal-handoff-hero relative h-56 rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y;">
          ${Fe()}
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
              <span class="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">${t(a("menu.price","Preis"))}</span>
              <span class="font-black text-slate-900" style="font-size:13px;">${t(Be)}</span>
            </div>
          </div>
          <div class="border-t border-slate-100"></div>

          <div class="space-y-3">
            <div class="menu-detail-info-tabs space-y-4">
              <div class="grid grid-cols-3 gap-2 menu-detail-info-controls">
                <button type="button" data-menu-detail-info-tab="info" class="${tt("info")}">${t(a("menu.info","Info"))}</button>
                <button type="button" data-menu-detail-info-tab="ingredients" class="${tt("ingredients")}">${t(a("menu.ingredients","Inhaltsstoffe"))}</button>
                <button type="button" data-menu-detail-info-tab="allergens" class="${tt("allergens")}">${t(a("menu.allergens","Allergene"))}</button>
              </div>
              <div class="menu-detail-info-panels rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-3.5">
                <p data-menu-detail-info-panel="info" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${Ee==="info"?"":"hidden"}">${t(jt)}</p>
                <p data-menu-detail-info-panel="ingredients" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${Ee==="ingredients"?"":"hidden"}">${t(At)}</p>
                <p data-menu-detail-info-panel="allergens" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${Ee==="allergens"?"":"hidden"}">${t(Pt)}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100"></div>
          ${ut.length?`<div class="pt-1">${st(ut,{showAdd:Ye})}</div><div class="border-t border-slate-100"></div>`:""}

          <div class="flex items-center justify-between" style="padding-top:1.25rem;">
            <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${Ue?"text-rose-500":"text-slate-700"} ${gt?"":"opacity-50 pointer-events-none"}">
              ${p("heart","w-3.5 h-3.5")} ${t(Ue?a("likes.liked","Gefaellt"):a("likes.like","Like"))}
            </button>
            <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span id="menuDetailLikesCount">${t(H(Q.likes))} ${t(a("likes.count","Likes"))}</span>
              <span id="menuDetailCommentsCount">${t(H(Q.comments))} ${t(a("comments.count","Kommentare"))}</span>
            </div>
          </div>
        </div>

        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${Me(ft)}
        </div>
        </div>
      </div>
    `,Mt=S?`
      <button type="button" id="menuDetailWoltBtn" data-wolt-url="${t(x)}" class="flex-1 h-[52px] rounded-[1.65rem] text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm" style="background-color:#18b9df;" title="${t(a("menu.openWolt","Bei Wolt oeffnen"))}">
        <span class="font-bold text-sm">Wolt</span>
        ${p("external-link","w-4 h-4")}
      </button>
    `:q?`
        <button id="menuDetailFavoriteCtaBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all">
          <span class="font-bold text-sm">${t(a("menu.toFavorites","Zu Favoriten"))}</span>
          ${p("bookmark","w-4 h-4")}
        </button>
      `:`
        <button id="menuDetailAddToCartBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all ${$&&!ge?"":"opacity-50 pointer-events-none"}">
          <span class="font-bold text-sm">${t(ge?a("menu.soldOut","Ausverkauft"):a("menu.addToCart","In den Warenkorb"))}</span>
          <span class="menu-detail-cart-icon">
            ${p("shopping-bag","w-4 h-4")}
            <span id="menuDetailCartBadge" class="menu-detail-cart-badge" hidden></span>
          </span>
        </button>
      `,Dt=S?a("menu.backToWolt","Kthehu te Wolt"):q?a("menu.backToFavorites","Kthehu te te preferuarat"):a("menu.backToCart","Kthehu te shporta"),Vt=S?"text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200",Ft=S?'style="background-color:#18b9df;"':"",Bt=S?`
      <span class="w-5 h-5 inline-flex items-center justify-center text-white leading-none select-none" aria-hidden="true">
        <span class="block" style="font-family:'Omnes','Plus Jakarta Sans','Segoe UI',sans-serif;font-size:20px;font-weight:800;font-style:italic;line-height:1;transform:translateY(-1px);">
          w
        </span>
      </span>
    `:p(q?"bookmark":"shopping-bag","w-5 h-5"),Lt=`
    <div class="modal-handoff-chrome px-7 pb-6 pt-4 border-t border-slate-100 bg-white/98 backdrop-blur-sm modal-footer-safe relative z-10">
      <div id="footer-cart-view" class="flex gap-3 items-center w-full transition-all duration-300 ${xt?"hidden opacity-0":""}">
        <button type="button" id="menuDetailFooterCommentToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 relative" title="${t(a("menu.commentAction","Kommentare verfassen"))}">
          ${p("message-square","w-5 h-5")}
          ${Q.comments>0?`<span id="menuDetailFooterCommentsBadge" class="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">${Q.comments}</span>`:""}
        </button>
        ${Mt}
      </div>

      <div id="footer-comment-view" class="flex gap-3 items-center w-full transition-all duration-300 ${xt?"":"hidden opacity-0"}">
        <button type="button" id="menuDetailFooterCartToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] ${Vt} flex items-center justify-center transition-all active:scale-95" ${Ft} title="${Dt}">
          ${Bt}
        </button>

        <div class="flex-1 flex gap-2">
          <textarea id="menuDetailCommentInput" placeholder="${t(a("menu.commentPlaceholder","Schreib einen Kommentar..."))}" class="flex-1 px-5 py-3.5 rounded-[1.65rem] border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none leading-relaxed ${He?"":"opacity-60"}" rows="1" ${He?"":"disabled"}>${t(o.menuDetail.commentText||"")}</textarea>
          <button id="menuDetailCommentSend" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-indigo-600 text-white flex items-center justify-center ${He?"":"opacity-60 cursor-not-allowed"}" ${He?"":"disabled"}>
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
          ${zt}
          ${Tt}
          ${Lt}
        </div>
      </div>
    </div>
  `}export{Jt as renderMenuDetailModalCore,Zt as renderMenuItemModalCore};
