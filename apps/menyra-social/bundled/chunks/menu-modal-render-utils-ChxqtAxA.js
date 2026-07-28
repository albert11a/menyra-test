import{v as Dt,w as Vt}from"./domain-menu-eager-Cz3D-kr5.js";import{a as mt}from"./domain-media-eager-B90n_Ot7.js";import{t as Ft}from"./domain-feed-social-eager-BUv1hCx4.js";import"./domain-auth-DQDx_hFk.js";import"./domain-public-profile-mLQti0eH.js";const Bt=Object.freeze(["Fruehstueck","Brunch","Vorspeise","Suppe","Salat","Pasta","Pizza","Burger","Sandwich","Wrap","Grill","Fleisch","Fisch","Vegetarisch","Vegan","Beilage","Kinder","Dessert","Kuchen","Eis","Kaffee","Tee","Softdrink","Saft","Smoothie","Bier","Wein","Cocktail","Spirituose","Sonstiges"]);function ft(o){if(o==null)return null;const v=typeof o=="string"?o.trim():o;if(v==="")return null;const C=Number(v);return Number.isFinite(C)?Math.max(0,C):null}function bt(o=""){const v=String(o||"").trim().toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(v)}function gt(o=""){const v=String(o||"").trim();return v?bt(v)?"Produkte":v:""}function Rt({state:o,isShopCatalogProfile:v,getBusinessProfileType:C,getOptimizedImageUrl:Y,PLACEHOLDER_IMAGE:N,isPlaceholderUrl:X,normalizeMenuType:J,getMenuModalCrop:ee,escapeHtml:te,icon:ne}={}){if(!o||!o.menuModal?.open)return"";const ge=typeof v=="function"?v:(()=>!1),xe=typeof C=="function"?C:(()=>""),K=typeof Y=="function"?Y:(t=>String(t||"")),ve=typeof X=="function"?X:(()=>!1),he=typeof J=="function"?J:(t=>String(t||"food")),we=typeof ee=="function"?ee:(()=>({x:50,y:50})),d=typeof te=="function"?te:(t=>String(t||"")),A=typeof ne=="function"?ne:(()=>""),ye=t=>{const i=Number(t);return Number.isFinite(i)?`${i.toFixed(2).replace(".",",")} EUR`:String(t||"").trim()||"0,00 EUR"},ke=(t,{excludeId:i=""}={})=>{const c=String(i||"").trim(),g=new Set,w=x=>{if(x==null)return;if(Array.isArray(x)){x.forEach(w);return}const be=typeof x=="object"?x.id||x.itemId||x.productId||x.menuItemId||"":x,Ue=String(be||"").trim();Ue&&Ue.split(",").forEach(Ne=>{const B=String(Ne||"").trim();!B||B===c||g.has(B)||g.add(B)})};return w(t),Array.from(g)},l=o.menuModal.item||{},oe=o.menuModal.mode==="edit",b=ge(o.userProfile),$e=oe?"Produkt bearbeiten":"Produkt hinzufuegen",Se=Array.isArray(o.menuModal.existingImages)?o.menuModal.existingImages:[],W=Array.isArray(o.menuModal.imagePreviews)?o.menuModal.imagePreviews:[],se=String(o.menuModal.imageUrlDraft||"").trim(),j=[...Se.map((t,i)=>({src:t,kind:"existing",idx:i})),...W.map((t,i)=>({src:t,kind:"new",idx:i}))].filter(t=>t.src),le=j[0]?.src||se||l.imageUrl||"",ie=le?K(le,"large"):N,Ie=ve(ie)?N:ie,Ce=String(o.menuModal.videoPreview||"").trim(),Ee=String(o.menuModal.videoPosterPreview||"").trim(),H=!!(o.menuModal.videoFile&&Ce),Ae=W.length>0,ae=mt(l)&&!Ae&&!H,je=H||ae,Oe=H?Ce:ae?String(l.videoUrl||"").trim():"",Pe=H?Ee:ae?K(String(l.posterUrl||l.imageUrl||"").trim(),"large"):"",P=he(l.type||"food"),Ge=P==="food"||P==="drink",ze=l.available!==!1?"available":"unavailable",Te=o.menuModal.status||"",E=Array.isArray(l.sizes)?l.sizes.join(", "):"",Me=Array.isArray(l.colors)?l.colors.join(", "):"",a=ft(l.stock),Re=a===null?"":String(a),k=we(),_e=String(xe(o.userProfile)||"").trim().toLowerCase(),O=!b&&Dt(_e),n=(()=>{const t=o?.userProfile?.specialEnabled;if(typeof t=="boolean")return t;const i=String(o?.userProfile?.restaurantId||"").trim();return i?(Array.isArray(o?.restaurants)?o.restaurants.find(g=>String(g?.id||"").trim()===i):null)?.specialEnabled===!0:!1})(),p=Vt(l.cardStyle||"",P),s=p==="testfirst_special"||String(l.category||"").trim().toLowerCase()==="special",$=O&&!s&&p==="testfirst_drink",G=(t=>{const i=Number(t);return Number.isFinite(i)?i<=33?"left":i>=67?"right":"center":"center"})(k.x),I=String(l.category||(b?"Produkte":"Sonstiges")).trim()||(b?"Produkte":"Sonstiges"),De=b?gt(I):I,Ve=t=>String(t||"").trim().toLowerCase()==="special",re=Array.from(new Set([De,...Array.isArray(o.menu?.items)?o.menu.items.map(t=>String(t?.category||"").trim()):[],...b?["Produkte"]:Bt].filter(t=>!(!t||b&&bt(t)||!n&&Ve(t))))),de="menuItemCategoryOptions",ce=String(l.specialSize||l.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default",R=String(l.specialActionType||l.actionType||"").trim().toLowerCase()==="link"?"link":"product",Fe=String(l.specialActionUrl||l.linkUrl||l.actionUrl||"").trim(),Be=String(l.specialActionProductId||l.targetProductId||"").trim(),ue=String(l.ingredients||l.ingredient||l.inhaltsstoffe||"").trim(),y=String(l.woltUrl||l.woltLink||"").trim(),z=String(l.id||"").trim(),T=(t,i=0)=>{const c=Number(t);return Number.isFinite(c)?Math.max(0,Math.floor(c)):Math.max(0,Number(i)||0)},M=Array.isArray(o.menu?.items)?o.menu.items.slice().map((t,i)=>({entry:t,idx:i,order:T(t?.orderIndex,i)})).sort((t,i)=>t.order-i.order||t.idx-i.idx).map(t=>t.entry):[],pe=M.filter(t=>String(t?.id||"").trim()!==z),_=M.findIndex(t=>String(t?.id||"").trim()===z),S=Math.max(1,pe.length+1),D=_>=0?Math.min(S,Math.max(1,_+1)):S,V=Math.min(S,Math.max(1,Number.isFinite(Number(l.orderIndex))?T(l.orderIndex,D-1)+1:D)),F=Array.isArray(o.menu?.items)?o.menu.items.filter(t=>{const i=String(t?.id||"").trim();return!(!i||i===z)}):[],Ze=ke(l.crossSellItemIds||l.crossSellIds||l.crossSell||l.crossSelling,{excludeId:z}),me=M.filter(t=>{const i=String(t?.id||"").trim();if(!i||i===z)return!1;const c=String(t?.type||"").trim().toLowerCase(),g=String(t?.menuSection||"").trim().toLowerCase();return c==="food"||c==="drink"||g==="food"||g==="drink"}),fe=`
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${oe?"Bearbeiten":"Neu"}</span>
        <h3 id="menuModalTitle" class="text-xl font-black italic tracking-tighter">${$e}</h3>
      </div>
      <button id="menuModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${A("x","w-4 h-4")}
      </button>
    </div>
  `,qe=`
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="menuItemImageInput" class="hidden" accept="image/*,video/*" multiple />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${je?`
          <video id="menuItemHeroVideo" src="${d(Oe)}" ${Pe?`poster="${d(Pe)}"`:""} class="w-full h-52 object-cover" style="object-position:${k.x}% ${k.y}%;" muted loop playsinline autoplay preload="metadata"></video>
          <span class="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
            ${A("play","w-3 h-3")} Video
          </span>
        `:`
          <img id="menuItemHeroPreview" src="${d(Ie)}" class="w-full h-52 object-cover" style="object-position:${k.x}% ${k.y}%;" />
        `}
        <button type="button" id="menuItemImageTrigger" aria-label="Foto oder Video hochladen" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${A("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${A("plus","w-2.5 h-2.5")}
          </span>
        </button>
      </div>
      ${je?`
        <button type="button" id="menuItemVideoRemove" class="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">
          Video entfernen
        </button>
      `:""}
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Horizontal</p>
          <span id="menuCropXValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${k.x}%</span>
        </div>
        <input id="menuItemCropX" type="range" min="0" max="100" step="1" value="${k.x}" class="w-full accent-indigo-600" />
        <div id="menuSmallCardCropControl" class="${$?"":"hidden"} space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Small Card Crop</p>
            <span class="text-[10px] font-bold text-slate-400">1:1</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" data-menu-small-crop="left" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${G==="left"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Links</button>
            <button type="button" data-menu-small-crop="center" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${G==="center"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Mitte</button>
            <button type="button" data-menu-small-crop="right" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${G==="right"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Rechts</button>
          </div>
          <p class="text-[10px] font-bold text-slate-400 px-1">Nur fuer Small Drink Card (Public Menue).</p>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Vertikal</p>
          <span id="menuCropYValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${k.y}%</span>
        </div>
        <input id="menuItemCropY" type="range" min="0" max="100" step="1" value="${k.y}" class="w-full accent-indigo-600" />
      </div>
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Fotos</p>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${j.length}</span>
        </div>
        ${j.length?`
          <div class="grid grid-cols-3 gap-2">
            ${j.map(t=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                <img src="${d(K(t.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-menu-image-remove="${t.idx}" data-menu-image-source="${t.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${A("x","w-3 h-3")}
                </button>
              </div>
            `).join("")}
          </div>
        `:`
          <div class="h-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">
            Noch keine Fotos
          </div>
        `}
      </div>

      <div class="p-5 rounded-[2rem] border border-slate-100 bg-white space-y-4">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Name</label>
          <input id="menuItemName" type="text" value="${d(l.name||"")}" placeholder="Produktname" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis</label>
            <input id="menuItemPrice" type="text" value="${d(l.price??"")}" placeholder="z.B. 4.50" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Kategorie</label>
            <input id="menuItemCategory" list="${de}" type="text" value="${d(De)}" placeholder="Kategorie eingeben" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <datalist id="${de}">
              ${re.map(t=>`<option value="${d(t)}"></option>`).join("")}
            </datalist>
          </div>
        </div>
        ${b?`
          <input id="menuItemType" type="hidden" value="food" />
        `:`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
            <select id="menuItemType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="food" ${P==="food"?"selected":""}>Speise</option>
              <option value="drink" ${P==="drink"?"selected":""}>Getraenk</option>
            </select>
          </div>
        `}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
          <select id="menuItemVisibility" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="available" ${ze==="available"?"selected":""}>Verfuegbar</option>
            <option value="unavailable" ${ze==="unavailable"?"selected":""}>Ausverkauft</option>
          </select>
        </div>
        ${n&&O&&s?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Position im aktiven Menue</label>
            <select id="menuItemOrderPosition" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              ${Array.from({length:S},(t,i)=>{const c=i+1,g=pe[c-1]||null,w=c>1?pe[c-2]:null,x=c===1?"Ganz oben":c===S?"Ganz unten":`Nach ${String(w?.name||"Produkt").trim()||"Produkt"}`,be=g?` (vor ${String(g?.name||"Produkt").trim()||"Produkt"})`:"";return`<option value="${c}" ${V===c?"selected":""}>Position ${c}: ${d(x)}${d(be)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Einfach auswaehlen statt Drag and Drop.</p>
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
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Groesse</label>
            <select id="menuItemSpecialSize" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="default" ${ce==="default"?"selected":""}>Normal</option>
              <option value="food" ${ce==="food"?"selected":""}>Food-Card Groesse</option>
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Nur relevant fuer Special-Card.</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Klick-Aktion</label>
            <select id="menuItemSpecialActionType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="product" ${R==="product"?"selected":""}>Produkt-Modal oeffnen</option>
              <option value="link" ${R==="link"?"selected":""}>Weiterleitung / Link oeffnen</option>
            </select>
          </div>
          <div id="menuItemSpecialActionProductField" class="${R==="product"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Ziel-Produkt</label>
            <select id="menuItemSpecialActionProductId" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="">Kein Produkt</option>
              ${F.map(t=>{const i=String(t?.id||"").trim(),c=String(t?.name||"Produkt").trim()||"Produkt";return`<option value="${d(i)}" ${Be===i?"selected":""}>${d(c)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird genutzt, wenn Klick-Aktion = Produkt-Modal.</p>
          </div>
          <div id="menuItemSpecialActionLinkField" class="${R==="link"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Link</label>
            <input id="menuItemSpecialActionUrl" type="text" value="${d(Fe)}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird genutzt, wenn Klick-Aktion = Link.</p>
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Beschreibung</label>
          <textarea id="menuItemDesc" rows="3" placeholder="Beschreibung..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${d(l.description||"")}</textarea>
        </div>
        ${b?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Inhaltsstoffe</label>
            <textarea id="menuItemIngredients" rows="3" placeholder="z.B. Wasser, Zucker, Salz..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${d(ue)}</textarea>
          </div>
        `}
        ${b?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Wolt Link</label>
            <input id="menuItemWoltUrl" type="url" value="${d(y)}" placeholder="https://wolt.com/..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Optional: wird im Produkt-Drawer angezeigt, wenn kein QR-Menuezugang aktiv ist.</p>
          </div>
        `}
        ${b?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Details</label>
            <textarea id="menuItemLongDesc" rows="4" placeholder="Material, Zustand, Lieferdetails..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${d(l.longDescription||"")}</textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Marke</label>
              <input id="menuItemBrand" type="text" value="${d(l.brand||"")}" placeholder="z.B. Nike" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">SKU</label>
              <input id="menuItemSku" type="text" value="${d(l.sku||"")}" placeholder="ART-001" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Groessen</label>
              <input id="menuItemSizes" type="text" value="${d(E)}" placeholder="XS, S, M, L" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Farben</label>
              <input id="menuItemColors" type="text" value="${d(Me)}" placeholder="Schwarz, Weiss" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Lagerbestand</label>
            <input id="menuItemStock" type="number" min="0" inputmode="numeric" value="${d(Re)}" placeholder="0" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">${b?"Hinweise":"Allergene"}</label>
          <input id="menuItemAllergens" type="text" value="${d(l.allergens||"")}" placeholder="${b?"z.B. limitierte Edition, ohne Rueckgabe":"z.B. Milch, Gluten"}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        ${!b&&Ge?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cross Selling (QR)</label>
            <div class="mt-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 max-h-48 overflow-y-auto no-scrollbar space-y-2">
              ${me.length?me.map(t=>{const i=String(t?.id||"").trim(),c=String(t?.name||"Produkt").trim()||"Produkt",g=String(t?.category||"").trim(),w=ye(t?.price);return`
                  <label class="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                    <input type="checkbox" data-menu-cross-sell-option value="${d(i)}" ${Ze.includes(i)?"checked":""} class="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" />
                    <span class="min-w-0 flex-1">
                      <span class="block text-xs font-black text-slate-800 truncate">${d(c)}</span>
                      <span class="block text-[10px] font-bold uppercase tracking-wide text-slate-400">${d(g||"Produkt")} · ${d(w)}</span>
                    </span>
                  </label>
                `}).join(""):'<p class="text-[10px] font-bold uppercase tracking-wide text-slate-400 px-2 py-1">Keine weiteren Speisen/Getraenke verfuegbar</p>'}
            </div>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird nur im Produkt-Drawer gezeigt, wenn das Menue per QR-Code geoeffnet wurde.</p>
          </div>
        `:""}
      </div>
    </div>
  `,Qe=`
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
      <button id="menuModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${o.menuModal.loading?"disabled":""}>
        ${o.menuModal.loading?"Speichern...":"Speichern"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${d(Te)}</div>
    </div>
  `;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="menuModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          ${fe}
          ${qe}
          ${Qe}
        </div>
      </div>
    </div>
  `}function _t({state:o,getMenuItemImages:v,getOptimizedImageUrl:C,isPlaceholderUrl:Y,PLACEHOLDER_IMAGE:N,getFirebaseStorageUrl:X,isDirectImageUrl:J,formatPrice:ee,getMenuDetailRestaurantId:te,getMenuDetailCatalogProfile:ne,isShopCatalogProfile:ge,normalizeMenuType:xe,canAddToShopCart:K,getMenuItemSocialId:ve,menuItemMetaKey:he,ensureMenuItemMeta:we,resolveMenuItemCounts:d,currentUserBadge:A,ensureCommentShape:ye,getCartCountForRestaurant:ke,renderMenuDetailComments:l,formatCount:oe,getMenuItemObjectPosition:b,escapeHtml:$e,icon:Se}={}){if(!o||!o.menuDetail?.open||!o.menuDetail?.item)return"";const W=typeof v=="function"?v:(()=>[]),se=typeof C=="function"?C:(e=>String(e||"")),j=typeof Y=="function"?Y:(()=>!1),le=typeof X=="function"?X:(e=>String(e||"")),ie=typeof J=="function"?J:(()=>!1),Ie=typeof ee=="function"?ee:(e=>String(e||"")),Ce=typeof te=="function"?te:(()=>""),Ee=typeof ne=="function"?ne:(()=>null),H=typeof ge=="function"?ge:(()=>!1),Ae=typeof xe=="function"?xe:(e=>String(e||"food")),ae=typeof K=="function"?K:(()=>!1),je=typeof ve=="function"?ve:(()=>""),Oe=typeof he=="function"?he:(()=>""),Pe=typeof we=="function"?we:(()=>({likes:[],comments:[],counts:{likes:0,comments:0}})),P=typeof d=="function"?d:(()=>({likes:0,comments:0})),Ge=typeof A=="function"?A:(()=>({uid:"",handle:""})),ot=typeof ye=="function"?ye:(e=>e),ze=typeof ke=="function"?ke:(()=>0),Te=typeof l=="function"?l:(()=>""),E=typeof oe=="function"?oe:(e=>String(e||"0")),Me=typeof b=="function"?b:(()=>"50% 50%"),a=(e,r=e,u={})=>Ft(e,{fallback:r,params:u}),Re=(e="")=>{const r=String(e||"").trim();return r?/^(https?:\/\/|mailto:|tel:)/i.test(r)?r:`https://${r.replace(/^\/+/,"")}`:""},k=(e,{excludeId:r=""}={})=>{const u=String(r||"").trim(),h=new Set,m=f=>{if(f==null)return;if(Array.isArray(f)){f.forEach(m);return}const q=typeof f=="object"?f.id||f.itemId||f.productId||f.menuItemId||"":f,Q=String(q||"").trim();Q&&Q.split(",").forEach(nt=>{const U=String(nt||"").trim();!U||U===u||h.has(U)||h.add(U)})};return m(e),Array.from(h)},_e=(e,r=[])=>{const u=String(e||"").trim();if(!u)return null;const h=Array.isArray(o?.menu?.items)?o.menu.items.find(m=>String(m?.id||"").trim()===u):null;return h||Array.isArray(r)&&r.find(m=>String(m?.id||m?.itemId||m?.productId||m?.menuItemId||"").trim()===u)||null},O=(e={},r=0,{showAdd:u=!1}={})=>{const m=(Array.isArray(W(e))?W(e):[])[0]||e.imageUrl||e.image||"",f=se(m,"thumb"),q=j(f)?N:f,Q=le(m),nt=ie(m)&&m!==q?m:Q,U=String(e.name||`Empfehlung ${r+1}`).trim()||`Empfehlung ${r+1}`,Tt=String(e.category||"Passt dazu").trim()||"Passt dazu",Mt=Ie(e.price,e);return`
      <div class="group shrink-0 rounded-[1.8rem] border border-slate-100 bg-white p-2.5 text-left transition-all" style="width:132px;min-width:132px;max-width:132px;flex:0 0 132px;">
        <div class="relative overflow-hidden rounded-[1.2rem] bg-slate-100 mx-auto" style="width:92px;height:92px;">
          <img src="${n(q)}" data-fallback-src="${n(nt)}" data-image-reveal="menu" alt="${n(U)}" class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" fetchpriority="low" decoding="async" />
        </div>
        <div class="pt-3 px-1">
          <div class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${n(Tt)}</div>
          <div class="mt-1 text-sm font-black tracking-tight text-slate-900 line-clamp-2">${n(U)}</div>
          <div class="mt-3 flex items-center justify-between gap-3">
            <span class="text-sm font-black text-slate-900">${n(Mt)}</span>
            ${u?`
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-900 text-white">
                ${p("plus","w-4 h-4")}
              </span>
            `:""}
          </div>
        </div>
      </div>
    `},st=(e=[],{showAdd:r=!1}={})=>e.length?`
      <section class="space-y-3">
        <div class="flex items-end justify-between gap-3">
          <div>
            <h4 class="text-base font-black tracking-tight text-slate-900">Passt perfekt dazu</h4>
          </div>
          <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">${e.length} Vorschlaege</div>
        </div>
        <div class="overflow-x-auto no-scrollbar">
          <div class="flex gap-3 pb-1">
            ${e.map((u,h)=>O(u,h,{showAdd:r})).join("")}
          </div>
        </div>
      </section>
    `:"",n=typeof $e=="function"?$e:(e=>String(e||"")),p=typeof Se=="function"?Se:(()=>""),s=o.menuDetail.item,$=W(s),lt=$.length?$.length-1:0,G=Math.max(0,Math.min(o.menuDetail.index||0,lt)),I=Ce(s),De=(e,r)=>{const u=String(e||""),h=s?.id?`menu-detail:${String(I||"")}:${String(s.id)}:${r}`:"",m=se(u,"large",{stableKey:h,variantGroup:"menu-detail"}),f=j(m)?N:m,q=le(u),Q=ie(u)&&u!==f?u:q;return{idx:r,safe:f,fallback:Q}},Ve=($.length?$:[""]).map(De),re=mt(s),de=re?String(s.videoUrl||"").trim():"",ce=re?String(s.posterUrl||"").trim()?se(String(s.posterUrl).trim(),"large"):Ve[0]?.safe||N:"",it=`
    <button type="button" data-menu-video-toggle aria-label="Play/Pause" class="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center z-20 active:scale-95 transition">
      <svg data-video-icon-play viewBox="0 0 24 24" class="w-4 h-4 fill-white block"><path d="M8 5v14l11-7z"></path></svg>
      <svg data-video-icon-pause viewBox="0 0 24 24" class="w-4 h-4 fill-white hidden"><path d="M6 5h4v14H6zM14 5h4v14h-4z"></path></svg>
    </button>`,R=(e,r="")=>{const u=e.idx===G,m=re&&!!de&&e.idx===0?`<video id="menuDetailHeroVideo" data-menu-detail-video src="${n(de)}" ${ce?`poster="${n(ce)}"`:""} class="absolute inset-0 w-full h-full object-cover${r?` ${r}`:""}" style="object-position:${Me(s)};" muted loop autoplay playsinline preload="metadata"></video>${it}`:`<img ${u?'id="menuDetailHeroImage" ':""}data-menu-detail-hero-image src="${n(e.safe)}" data-fallback-src="${n(e.fallback)}" class="absolute inset-0 w-full h-full object-cover${r?` ${r}`:""}" style="object-position:${Me(s)};" loading="eager" fetchpriority="${u?"high":"low"}" decoding="${u?"sync":"async"}" />`;return`<div data-menu-gallery-slide="${e.idx}" class="absolute inset-0"${u?"":' style="opacity:0;pointer-events:none;"'}>${m}</div>`},Fe=(e="")=>Ve.map(r=>R(r,e)).join(""),Be=Ie(s.price,s),ue=Ee(s),y=H(ue),z=y?a("menu.product","Produkt"):Ae(s.type)==="drink"?a("menu.drinkItem","Getraenk"):a("menu.foodItem","Speise"),T=y?gt(s.category):s.category||"",M=s.longDescription||s.description||"",pe=String(s.ingredients||s.ingredient||s.inhaltsstoffe||"").trim(),_=s.allergens||"",S=String(s.brand||"").trim(),D=String(s.sku||"").trim(),V=Array.isArray(s.sizes)?s.sizes:[],F=Array.isArray(s.colors)?s.colors:[],Ze=ft(s.stock),me=String(Ae(s.type||"")||"").trim().toLowerCase(),Le=me==="food"||me==="drink",fe=y?s.available===!1||Ze===0:s.available===!1,qe=V.length?String(o.menuDetail.selectedSize||V[0]).trim()||String(V[0]):"",Qe=F.length?String(o.menuDetail.selectedColor||F[0]).trim()||String(F[0]):"",at=String(o.profileView?.menuAccessSource||"").trim().toLowerCase(),t=String(o.profileTopTab||"").trim().toLowerCase()==="menu",i=!y&&Le&&t&&at==="qr",c=y?ae(ue):i,g=Re(s.woltUrl||s.woltLink||""),w=!y&&Le&&!i&&!!g,x=!y&&Le&&!i&&!w,be=!!c,Ue=k(s.crossSellItemIds||s.crossSellIds||s.crossSell||s.crossSelling,{excludeId:s.id}),Ne=Array.isArray(s.crossSell)?s.crossSell:[],B=Ue.map(e=>_e(e,Ne)).filter(Boolean),rt=B.length?B:Ne.filter(Boolean),Ke=je(s),dt=Oe(I,Ke),Ye=dt?Pe(dt):{likes:[],comments:[],counts:{likes:0,comments:0}},Z=P(Ye),ct=Ge(),We=Ye.likes?.some(e=>e.uid===ct.uid||e.handle===ct.handle),xt=(Array.isArray(o.favoriteMenuItems?.items)?o.favoriteMenuItems.items:[]).some(e=>{if(!e||typeof e!="object")return!1;const r=String(e.restaurantId||"").trim();if(I&&r&&r!==I)return!1;const u=[e.itemId,e.menuSocialId,e.menuItemId,e.id].map(h=>String(h||"").trim()).filter(Boolean);return!!Ke&&u.includes(Ke)}),ut=(Ye.comments||[]).map(ot),L=!!I&&!!Ke&&!!o.user,vt=!!String(o.user?.uid||"").trim(),ht="menuDetailTitle",Xe=y?ze(I||ue?.restaurantId||""):0,pt=(String(o.menuDetail.footerView||"cart").trim().toLowerCase()==="comment"?"comment":"cart")==="comment",Je=a("menu.noInfo","Keine Informationen, bitte an das Lokal oder den Kellner wenden."),wt=String(M||"").trim()||Je,yt=pe||Je,kt=String(_||"").trim()||Je,et=String(o.menuDetail?.infoTab||"info").trim().toLowerCase(),He=et==="ingredients"||et==="allergens"?et:"info",tt=e=>["h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer select-none",He===e?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"].join(" "),$t=y?`
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-3 px-7 pt-7 pb-4 border-b border-slate-100 bg-white">
        <div class="flex items-center gap-2 min-w-0">
          <button type="button" id="menuDetailHeaderCartBtn" class="inline-flex items-center gap-2 px-4 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black shadow-sm active:scale-95 ${c&&!fe?"":"opacity-50 pointer-events-none"}">
            ${p("shopping-cart","w-4 h-4")}
            <span>${n(a("menu.addToCart","In den Warenkorb"))}</span>
            ${Xe?`<span class="inline-flex min-w-[20px] h-5 px-1.5 rounded-full bg-white/14 border border-white/20 text-white text-[9px] font-black items-center justify-center leading-none">${Xe>99?"99+":Xe}</span>`:""}
          </button>
          ${vt?`
            <button type="button" id="menuDetailHeaderFavoritesBtn" aria-label="${n(a("menu.favorite","Favoriten"))}" title="${n(a("menu.favorite","Favoriten"))}" class="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-95 ${xt?"bg-slate-900 text-white border-slate-900":"bg-slate-100 text-slate-700 border-slate-200"}">
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
            <h3 id="${ht}" class="text-[1.05rem] leading-tight font-black tracking-tight text-slate-900 truncate">${n(s.name||a("menu.product","Produkt"))}</h3>
            ${T?`<div class="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${n(T)}</div>`:""}
          </div>
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${p("x","w-4 h-4")}
        </button>
      </div>
    `,St=y?`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 space-y-5 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div class="modal-handoff-hero relative rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y; aspect-ratio:4 / 5;">
          ${Fe()}
          ${$.length>1?`
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${p("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${p("chevron-right","w-4 h-4")}
            </button>
          `:""}
        </div>
        <div class="modal-handoff-chrome">
        ${$.length>1?`
          <div class="flex items-center justify-center gap-2">
            ${$.map((e,r)=>`
              <button type="button" data-menu-gallery-dot="${r}" class="w-2.5 h-2.5 rounded-full ${r===G?"bg-slate-900":"bg-slate-200"}"></button>
            `).join("")}
          </div>
        `:""}
        <div class="flex items-center justify-between">
          <span class="text-lg font-black text-slate-900">${n(Be)}</span>
        </div>
        <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          ${T?`<span>${n(T)}</span>`:""}
          <span>${n(z)}</span>
        </div>
        ${S||D?`
          <div class="grid ${S&&D?"grid-cols-2":"grid-cols-1"} gap-3">
            ${S?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${n(a("menu.brand","Marke"))}</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${n(S)}</p></div>`:""}
            ${D?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">SKU</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${n(D)}</p></div>`:""}
          </div>
        `:""}
        ${V.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${n(a("menu.sizes","Groessen"))}</p>
            <select data-menu-detail-variant="size" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${V.map(e=>`<option value="${n(e)}" ${qe===String(e)?"selected":""}>${n(e)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${F.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${n(a("menu.colors","Farben"))}</p>
            <select data-menu-detail-variant="color" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${F.map(e=>`<option value="${n(e)}" ${Qe===String(e)?"selected":""}>${n(e)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${M?`<p class="text-sm text-slate-600 leading-relaxed">${n(M)}</p>`:""}
        ${_?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">${n(a("menu.notes","Hinweise"))}</p>
            <p class="text-sm text-slate-600">${n(_)}</p>
          </div>
        `:""}
        <div class="flex items-center justify-between" style="padding-top:1.25rem;">
          <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${We?"text-rose-500":"text-slate-700"} ${L?"":"opacity-50 pointer-events-none"}">
            ${p("heart","w-3.5 h-3.5")} ${n(We?a("likes.liked","Gefaellt"):a("likes.like","Like"))}
          </button>
          <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span id="menuDetailLikesCount">${n(E(Z.likes))} ${n(a("likes.count","Likes"))}</span>
            <span id="menuDetailCommentsCount">${n(E(Z.comments))} ${n(a("comments.count","Kommentare"))}</span>
          </div>
        </div>
        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${Te(ut)}
        </div>
        </div>
      </div>
    `:`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 bg-white/98">
        <div class="modal-handoff-hero relative h-56 rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y;">
          ${Fe()}
          ${$.length>1?`
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${p("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${p("chevron-right","w-4 h-4")}
            </button>
          `:""}
        </div>
        <div class="modal-handoff-chrome">
        <div class="mt-6 space-y-5">
          <div class="p-4 rounded-[1.3rem] border border-slate-100 bg-slate-50">
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">${n(a("menu.price","Preis"))}</span>
              <span class="font-black text-slate-900" style="font-size:13px;">${n(Be)}</span>
            </div>
          </div>
          <div class="border-t border-slate-100"></div>

          <div class="space-y-3">
            <div class="menu-detail-info-tabs space-y-4">
              <div class="grid grid-cols-3 gap-2 menu-detail-info-controls">
                <button type="button" data-menu-detail-info-tab="info" class="${tt("info")}">${n(a("menu.info","Info"))}</button>
                <button type="button" data-menu-detail-info-tab="ingredients" class="${tt("ingredients")}">${n(a("menu.ingredients","Inhaltsstoffe"))}</button>
                <button type="button" data-menu-detail-info-tab="allergens" class="${tt("allergens")}">${n(a("menu.allergens","Allergene"))}</button>
              </div>
              <div class="menu-detail-info-panels rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-3.5">
                <p data-menu-detail-info-panel="info" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${He==="info"?"":"hidden"}">${n(wt)}</p>
                <p data-menu-detail-info-panel="ingredients" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${He==="ingredients"?"":"hidden"}">${n(yt)}</p>
                <p data-menu-detail-info-panel="allergens" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${He==="allergens"?"":"hidden"}">${n(kt)}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100"></div>
          ${rt.length?`<div class="pt-1">${st(rt,{showAdd:be})}</div><div class="border-t border-slate-100"></div>`:""}

          <div class="flex items-center justify-between" style="padding-top:1.25rem;">
            <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${We?"text-rose-500":"text-slate-700"} ${L?"":"opacity-50 pointer-events-none"}">
              ${p("heart","w-3.5 h-3.5")} ${n(We?a("likes.liked","Gefaellt"):a("likes.like","Like"))}
            </button>
            <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span id="menuDetailLikesCount">${n(E(Z.likes))} ${n(a("likes.count","Likes"))}</span>
              <span id="menuDetailCommentsCount">${n(E(Z.comments))} ${n(a("comments.count","Kommentare"))}</span>
            </div>
          </div>
        </div>

        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${Te(ut)}
        </div>
        </div>
      </div>
    `,It=w?`
      <button type="button" id="menuDetailWoltBtn" data-wolt-url="${n(g)}" class="flex-1 h-[52px] rounded-[1.65rem] text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm" style="background-color:#18b9df;" title="${n(a("menu.openWolt","Bei Wolt oeffnen"))}">
        <span class="font-bold text-sm">Wolt</span>
        ${p("external-link","w-4 h-4")}
      </button>
    `:x?`
        <button id="menuDetailFavoriteCtaBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all">
          <span class="font-bold text-sm">${n(a("menu.toFavorites","Zu Favoriten"))}</span>
          ${p("bookmark","w-4 h-4")}
        </button>
      `:`
        <button id="menuDetailAddToCartBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all ${c&&!fe?"":"opacity-50 pointer-events-none"}">
          <span class="font-bold text-sm">${n(fe?a("menu.soldOut","Ausverkauft"):a("menu.addToCart","In den Warenkorb"))}</span>
          ${p("shopping-bag","w-4 h-4")}
        </button>
      `,Ct=w?a("menu.backToWolt","Zurueck zu Wolt"):x?a("menu.backToFavorites","Zurueck zu Favoriten"):a("menu.backToCart","Zurueck zum Warenkorb"),At=w?"text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200",jt=w?'style="background-color:#18b9df;"':"",Pt=w?`
      <span class="w-5 h-5 inline-flex items-center justify-center text-white leading-none select-none" aria-hidden="true">
        <span class="block" style="font-family:'Omnes','Plus Jakarta Sans','Segoe UI',sans-serif;font-size:20px;font-weight:800;font-style:italic;line-height:1;transform:translateY(-1px);">
          w
        </span>
      </span>
    `:p(x?"bookmark":"shopping-bag","w-5 h-5"),zt=`
    <div class="modal-handoff-chrome px-7 pb-6 pt-4 border-t border-slate-100 bg-white/98 backdrop-blur-sm modal-footer-safe relative z-10">
      <div id="footer-cart-view" class="flex gap-3 items-center w-full transition-all duration-300 ${pt?"hidden opacity-0":""}">
        <button type="button" id="menuDetailFooterCommentToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 relative" title="${n(a("menu.commentAction","Kommentare verfassen"))}">
          ${p("message-square","w-5 h-5")}
          ${Z.comments>0?`<span id="menuDetailFooterCommentsBadge" class="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">${Z.comments}</span>`:""}
        </button>
        ${It}
      </div>

      <div id="footer-comment-view" class="flex gap-3 items-center w-full transition-all duration-300 ${pt?"":"hidden opacity-0"}">
        <button type="button" id="menuDetailFooterCartToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] ${At} flex items-center justify-center transition-all active:scale-95" ${jt} title="${Ct}">
          ${Pt}
        </button>

        <div class="flex-1 flex gap-2">
          <textarea id="menuDetailCommentInput" placeholder="${n(L?a("menu.commentPlaceholder","Schreib einen Kommentar..."):a("menu.loginRequired","Bitte einloggen"))}" class="flex-1 px-5 py-3.5 rounded-[1.65rem] border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none leading-relaxed ${L?"":"opacity-60"}" rows="1" ${L?"":"disabled"}>${n(o.menuDetail.commentText||"")}</textarea>
          <button id="menuDetailCommentSend" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-indigo-600 text-white flex items-center justify-center ${L?"":"opacity-60 cursor-not-allowed"}" ${L?"":"disabled"}>
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
          ${$t}
          ${St}
          ${zt}
        </div>
      </div>
    </div>
  `}export{_t as renderMenuDetailModalCore,Rt as renderMenuItemModalCore};
