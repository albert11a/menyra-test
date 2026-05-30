import{i as At,a as jt}from"../entry/social-app.js";import"./startup-route-runtime-context-tfceBzkr.js";import"./vendor-firebase-V03pMX6J.js";const Pt=Object.freeze(["Fruehstueck","Brunch","Vorspeise","Suppe","Salat","Pasta","Pizza","Burger","Sandwich","Wrap","Grill","Fleisch","Fisch","Vegetarisch","Vegan","Beilage","Kinder","Dessert","Kuchen","Eis","Kaffee","Tee","Softdrink","Saft","Smoothie","Bier","Wein","Cocktail","Spirituose","Sonstiges"]);function rt(n){if(n==null)return null;const $=typeof n=="string"?n.trim():n;if($==="")return null;const S=Number($);return Number.isFinite(S)?Math.max(0,S):null}function Vt({state:n,isShopCatalogProfile:$,getBusinessProfileType:S,getOptimizedImageUrl:Y,PLACEHOLDER_IMAGE:q,isPlaceholderUrl:X,normalizeMenuType:J,getMenuModalCrop:ee,escapeHtml:te,icon:ne}={}){if(!n||!n.menuModal?.open)return"";const fe=typeof $=="function"?$:(()=>!1),be=typeof S=="function"?S:(()=>""),se=typeof Y=="function"?Y:(e=>String(e||"")),ge=typeof X=="function"?X:(()=>!1),xe=typeof J=="function"?J:(e=>String(e||"food")),he=typeof ee=="function"?ee:(()=>({x:50,y:50})),i=typeof te=="function"?te:(e=>String(e||"")),j=typeof ne=="function"?ne:(()=>""),ve=e=>{const l=Number(e);return Number.isFinite(l)?`${l.toFixed(2).replace(".",",")} EUR`:String(e||"").trim()||"0,00 EUR"},we=(e,{excludeId:l=""}={})=>{const r=String(l||"").trim(),u=new Set,A=m=>{if(m==null)return;if(Array.isArray(m)){m.forEach(A);return}const pe=typeof m=="object"?m.id||m.itemId||m.productId||m.menuItemId||"":m,R=String(pe||"").trim();R&&R.split(",").forEach(me=>{const K=String(me||"").trim();!K||K===r||u.has(K)||u.add(K)})};return A(e),Array.from(u)},s=n.menuModal.item||{},oe=n.menuModal.mode==="edit",b=fe(n.userProfile),ye=oe?"Produkt bearbeiten":"Produkt hinzufuegen",ke=Array.isArray(n.menuModal.existingImages)?n.menuModal.existingImages:[],le=Array.isArray(n.menuModal.imagePreviews)?n.menuModal.imagePreviews:[],$e=String(n.menuModal.imageUrlDraft||"").trim(),P=[...ke.map((e,l)=>({src:e,kind:"existing",idx:l})),...le.map((e,l)=>({src:e,kind:"new",idx:l}))].filter(e=>e.src),ae=P[0]?.src||$e||s.imageUrl||"",ie=ae?se(ae,"large"):q,Se=ge(ie)?q:ie,z=xe(s.type||"food"),Me=z==="food"||z==="drink",W=s.available!==!1?"available":"unavailable",Be=n.menuModal.status||"",Ve=Array.isArray(s.sizes)?s.sizes.join(", "):"",Ne=Array.isArray(s.colors)?s.colors.join(", "):"",Ie=rt(s.stock),Ke=Ie===null?"":String(Ie),v=he(),Ue=String(be(n.userProfile)||"").trim().toLowerCase(),O=!b&&At(Ue),I=(()=>{const e=n?.userProfile?.specialEnabled;if(typeof e=="boolean")return e;const l=String(n?.userProfile?.restaurantId||"").trim();return l?(Array.isArray(n?.restaurants)?n.restaurants.find(u=>String(u?.id||"").trim()===l):null)?.specialEnabled===!0:!1})(),T=jt(s.cardStyle||"",z),_=T==="testfirst_special"||String(s.category||"").trim().toLowerCase()==="special",We=O&&!_&&T==="testfirst_drink",re=(e=>{const l=Number(e);return Number.isFinite(l)?l<=33?"left":l>=67?"right":"center":"center"})(v.x),Ce=String(s.category||"Sonstiges").trim()||"Sonstiges",a=e=>String(e||"").trim().toLowerCase()==="special",c=Array.from(new Set([Ce,...Array.isArray(n.menu?.items)?n.menu.items.map(e=>String(e?.category||"").trim()):[],...Pt].filter(e=>!(!e||!I&&a(e))))),o="menuItemCategoryOptions",g=String(s.specialSize||s.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default",w=String(s.specialActionType||s.actionType||"").trim().toLowerCase()==="link"?"link":"product",C=String(s.specialActionUrl||s.linkUrl||s.actionUrl||"").trim(),Oe=String(s.specialActionProductId||s.targetProductId||"").trim(),D=String(s.ingredients||s.ingredient||s.inhaltsstoffe||"").trim(),Ae=String(s.woltUrl||s.woltLink||"").trim(),y=String(s.id||"").trim(),je=(e,l=0)=>{const r=Number(e);return Number.isFinite(r)?Math.max(0,Math.floor(r)):Math.max(0,Number(l)||0)},G=Array.isArray(n.menu?.items)?n.menu.items.slice().map((e,l)=>({entry:e,idx:l,order:je(e?.orderIndex,l)})).sort((e,l)=>e.order-l.order||e.idx-l.idx).map(e=>e.entry):[],H=G.filter(e=>String(e?.id||"").trim()!==y),F=G.findIndex(e=>String(e?.id||"").trim()===y),M=Math.max(1,H.length+1),L=F>=0?Math.min(M,Math.max(1,F+1)):M,de=Math.min(M,Math.max(1,Number.isFinite(Number(s.orderIndex))?je(s.orderIndex,L-1)+1:L)),_e=Array.isArray(n.menu?.items)?n.menu.items.filter(e=>{const l=String(e?.id||"").trim();return!(!l||l===y)}):[],ce=we(s.crossSellItemIds||s.crossSellIds||s.crossSell||s.crossSelling,{excludeId:y}),B=G.filter(e=>{const l=String(e?.id||"").trim();if(!l||l===y)return!1;const r=String(e?.type||"").trim().toLowerCase(),u=String(e?.menuSection||"").trim().toLowerCase();return r==="food"||r==="drink"||u==="food"||u==="drink"}),V=`
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${oe?"Bearbeiten":"Neu"}</span>
        <h3 id="menuModalTitle" class="text-xl font-black italic tracking-tighter">${ye}</h3>
      </div>
      <button id="menuModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${j("x","w-4 h-4")}
      </button>
    </div>
  `,N=`
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="menuItemImageInput" class="hidden" accept="image/*" multiple />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="menuItemHeroPreview" src="${i(Se)}" class="w-full h-52 object-cover" style="object-position:${v.x}% ${v.y}%;" />
        <button type="button" id="menuItemImageTrigger" aria-label="Fotos hochladen" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${j("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${j("plus","w-2.5 h-2.5")}
          </span>
        </button>
      </div>
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Horizontal</p>
          <span id="menuCropXValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${v.x}%</span>
        </div>
        <input id="menuItemCropX" type="range" min="0" max="100" step="1" value="${v.x}" class="w-full accent-indigo-600" />
        <div id="menuSmallCardCropControl" class="${We?"":"hidden"} space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Small Card Crop</p>
            <span class="text-[10px] font-bold text-slate-400">1:1</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" data-menu-small-crop="left" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${re==="left"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Links</button>
            <button type="button" data-menu-small-crop="center" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${re==="center"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Mitte</button>
            <button type="button" data-menu-small-crop="right" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${re==="right"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Rechts</button>
          </div>
          <p class="text-[10px] font-bold text-slate-400 px-1">Nur fuer Small Drink Card (Public Menue).</p>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Vertikal</p>
          <span id="menuCropYValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${v.y}%</span>
        </div>
        <input id="menuItemCropY" type="range" min="0" max="100" step="1" value="${v.y}" class="w-full accent-indigo-600" />
      </div>
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Fotos</p>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${P.length}</span>
        </div>
        ${P.length?`
          <div class="grid grid-cols-3 gap-2">
            ${P.map(e=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                <img src="${i(se(e.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-menu-image-remove="${e.idx}" data-menu-image-source="${e.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${j("x","w-3 h-3")}
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
          <input id="menuItemName" type="text" value="${i(s.name||"")}" placeholder="Produktname" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis</label>
            <input id="menuItemPrice" type="text" value="${i(s.price??"")}" placeholder="z.B. 4.50" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Kategorie</label>
            <input id="menuItemCategory" list="${o}" type="text" value="${i(Ce)}" placeholder="Kategorie eingeben" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <datalist id="${o}">
              ${c.map(e=>`<option value="${i(e)}"></option>`).join("")}
            </datalist>
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
          <select id="menuItemType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="food" ${z==="food"?"selected":""}>${b?"Produkt":"Speise"}</option>
            <option value="drink" ${z==="drink"?"selected":""}>${b?"Variante":"Getraenk"}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
          <select id="menuItemVisibility" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="available" ${W==="available"?"selected":""}>Verfuegbar</option>
            <option value="unavailable" ${W==="unavailable"?"selected":""}>Ausverkauft</option>
          </select>
        </div>
        ${I&&O&&_?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Position im aktiven Menue</label>
            <select id="menuItemOrderPosition" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              ${Array.from({length:M},(e,l)=>{const r=l+1,u=H[r-1]||null,A=r>1?H[r-2]:null,m=r===1?"Ganz oben":r===M?"Ganz unten":`Nach ${String(A?.name||"Produkt").trim()||"Produkt"}`,pe=u?` (vor ${String(u?.name||"Produkt").trim()||"Produkt"})`:"";return`<option value="${r}" ${de===r?"selected":""}>Position ${r}: ${i(m)}${i(pe)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Einfach auswaehlen statt Drag and Drop.</p>
          </div>
        `:""}
        ${O&&!_?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Card Style</label>
            <select id="menuItemCardStyle" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="testfirst_drink" ${T==="testfirst_drink"?"selected":""}>Small = Drink Card</option>
              <option value="testfirst_food" ${T==="testfirst_food"?"selected":""}>Big = Food Card</option>
            </select>
          </div>
        `:""}
        ${I&&O&&_?`
          <input id="menuItemCardStyle" type="hidden" value="testfirst_special" />
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Groesse</label>
            <select id="menuItemSpecialSize" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="default" ${g==="default"?"selected":""}>Normal</option>
              <option value="food" ${g==="food"?"selected":""}>Food-Card Groesse</option>
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Nur relevant fuer Special-Card.</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Klick-Aktion</label>
            <select id="menuItemSpecialActionType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="product" ${w==="product"?"selected":""}>Produkt-Modal oeffnen</option>
              <option value="link" ${w==="link"?"selected":""}>Weiterleitung / Link oeffnen</option>
            </select>
          </div>
          <div id="menuItemSpecialActionProductField" class="${w==="product"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Ziel-Produkt</label>
            <select id="menuItemSpecialActionProductId" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="">Kein Produkt</option>
              ${_e.map(e=>{const l=String(e?.id||"").trim(),r=String(e?.name||"Produkt").trim()||"Produkt";return`<option value="${i(l)}" ${Oe===l?"selected":""}>${i(r)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird genutzt, wenn Klick-Aktion = Produkt-Modal.</p>
          </div>
          <div id="menuItemSpecialActionLinkField" class="${w==="link"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Link</label>
            <input id="menuItemSpecialActionUrl" type="text" value="${i(C)}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird genutzt, wenn Klick-Aktion = Link.</p>
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Beschreibung</label>
          <textarea id="menuItemDesc" rows="3" placeholder="Beschreibung..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${i(s.description||"")}</textarea>
        </div>
        ${b?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Inhaltsstoffe</label>
            <textarea id="menuItemIngredients" rows="3" placeholder="z.B. Wasser, Zucker, Salz..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${i(D)}</textarea>
          </div>
        `}
        ${b?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Wolt Link</label>
            <input id="menuItemWoltUrl" type="url" value="${i(Ae)}" placeholder="https://wolt.com/..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Optional: wird im Produkt-Drawer angezeigt, wenn kein QR-Menuezugang aktiv ist.</p>
          </div>
        `}
        ${b?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Details</label>
            <textarea id="menuItemLongDesc" rows="4" placeholder="Material, Zustand, Lieferdetails..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${i(s.longDescription||"")}</textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Marke</label>
              <input id="menuItemBrand" type="text" value="${i(s.brand||"")}" placeholder="z.B. Nike" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">SKU</label>
              <input id="menuItemSku" type="text" value="${i(s.sku||"")}" placeholder="ART-001" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Groessen</label>
              <input id="menuItemSizes" type="text" value="${i(Ve)}" placeholder="XS, S, M, L" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Farben</label>
              <input id="menuItemColors" type="text" value="${i(Ne)}" placeholder="Schwarz, Weiss" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Lagerbestand</label>
            <input id="menuItemStock" type="number" min="0" inputmode="numeric" value="${i(Ke)}" placeholder="0" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">${b?"Hinweise":"Allergene"}</label>
          <input id="menuItemAllergens" type="text" value="${i(s.allergens||"")}" placeholder="${b?"z.B. limitierte Edition, ohne Rueckgabe":"z.B. Milch, Gluten"}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        ${!b&&Me?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cross Selling (QR)</label>
            <div class="mt-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 max-h-48 overflow-y-auto no-scrollbar space-y-2">
              ${B.length?B.map(e=>{const l=String(e?.id||"").trim(),r=String(e?.name||"Produkt").trim()||"Produkt",u=String(e?.category||"").trim(),A=ve(e?.price);return`
                  <label class="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                    <input type="checkbox" data-menu-cross-sell-option value="${i(l)}" ${ce.includes(l)?"checked":""} class="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" />
                    <span class="min-w-0 flex-1">
                      <span class="block text-xs font-black text-slate-800 truncate">${i(r)}</span>
                      <span class="block text-[10px] font-bold uppercase tracking-wide text-slate-400">${i(u||"Produkt")} · ${i(A)}</span>
                    </span>
                  </label>
                `}).join(""):'<p class="text-[10px] font-bold uppercase tracking-wide text-slate-400 px-2 py-1">Keine weiteren Speisen/Getraenke verfuegbar</p>'}
            </div>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird nur im Produkt-Drawer gezeigt, wenn das Menue per QR-Code geoeffnet wurde.</p>
          </div>
        `:""}
      </div>
    </div>
  `,Ge=`
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
      <button id="menuModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${n.menuModal.loading?"disabled":""}>
        ${n.menuModal.loading?"Speichern...":"Speichern"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${i(Be)}</div>
    </div>
  `;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="menuModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          ${V}
          ${N}
          ${Ge}
        </div>
      </div>
    </div>
  `}function Nt({state:n,getMenuItemImages:$,getOptimizedImageUrl:S,isPlaceholderUrl:Y,PLACEHOLDER_IMAGE:q,getFirebaseStorageUrl:X,isDirectImageUrl:J,formatPrice:ee,getMenuDetailRestaurantId:te,getMenuDetailCatalogProfile:ne,isShopCatalogProfile:fe,normalizeMenuType:be,canAddToShopCart:se,getMenuItemSocialId:ge,menuItemMetaKey:xe,ensureMenuItemMeta:he,resolveMenuItemCounts:i,currentUserBadge:j,ensureCommentShape:ve,getCartCountForRestaurant:we,renderMenuDetailComments:s,formatCount:oe,getMenuItemObjectPosition:b,escapeHtml:ye,icon:ke}={}){if(!n||!n.menuDetail?.open||!n.menuDetail?.item)return"";const le=typeof $=="function"?$:(()=>[]),$e=typeof S=="function"?S:(t=>String(t||"")),P=typeof Y=="function"?Y:(()=>!1),ae=typeof X=="function"?X:(t=>String(t||"")),ie=typeof J=="function"?J:(()=>!1),Se=typeof ee=="function"?ee:(t=>String(t||"")),z=typeof te=="function"?te:(()=>""),Me=typeof ne=="function"?ne:(()=>null),Le=typeof fe=="function"?fe:(()=>!1),W=typeof be=="function"?be:(t=>String(t||"food")),Be=typeof se=="function"?se:(()=>!1),Ve=typeof ge=="function"?ge:(()=>""),Ne=typeof xe=="function"?xe:(()=>""),Ie=typeof he=="function"?he:(()=>({likes:[],comments:[],counts:{likes:0,comments:0}})),Ke=typeof i=="function"?i:(()=>({likes:0,comments:0})),v=typeof j=="function"?j:(()=>({uid:"",handle:""})),Ue=typeof ve=="function"?ve:(t=>t),O=typeof we=="function"?we:(()=>0),Ee=typeof s=="function"?s:(()=>""),I=typeof oe=="function"?oe:(t=>String(t||"0")),T=typeof b=="function"?b:(()=>"50% 50%"),_=(t="")=>{const d=String(t||"").trim();return d?/^(https?:\/\/|mailto:|tel:)/i.test(d)?d:`https://${d.replace(/^\/+/,"")}`:""},We=(t,{excludeId:d=""}={})=>{const x=String(d||"").trim(),h=new Set,p=f=>{if(f==null)return;if(Array.isArray(f)){f.forEach(p);return}const De=typeof f=="object"?f.id||f.itemId||f.productId||f.menuItemId||"":f,Fe=String(De||"").trim();Fe&&Fe.split(",").forEach(Xe=>{const E=String(Xe||"").trim();!E||E===x||h.has(E)||h.add(E)})};return p(t),Array.from(h)},Je=(t,d=[])=>{const x=String(t||"").trim();if(!x)return null;const h=Array.isArray(n?.menu?.items)?n.menu.items.find(p=>String(p?.id||"").trim()===x):null;return h||Array.isArray(d)&&d.find(p=>String(p?.id||p?.itemId||p?.productId||p?.menuItemId||"").trim()===x)||null},re=(t={},d=0,{showAdd:x=!1}={})=>{const p=(Array.isArray(le(t))?le(t):[])[0]||t.imageUrl||t.image||"",f=$e(p,"thumb"),De=P(f)?q:f,Fe=ae(p),Xe=ie(p)&&p!==De?p:Fe,E=String(t.name||`Empfehlung ${d+1}`).trim()||`Empfehlung ${d+1}`,It=String(t.category||"Passt dazu").trim()||"Passt dazu",Ct=Se(t.price,t);return`
      <div class="group shrink-0 rounded-[1.8rem] border border-slate-100 bg-white p-2.5 text-left transition-all" style="width:132px;min-width:132px;max-width:132px;flex:0 0 132px;">
        <div class="relative overflow-hidden rounded-[1.2rem] bg-slate-100 mx-auto" style="width:92px;height:92px;">
          <img src="${a(De)}" data-fallback-src="${a(Xe)}" data-image-reveal="menu" alt="${a(E)}" class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" fetchpriority="low" decoding="async" />
        </div>
        <div class="pt-3 px-1">
          <div class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${a(It)}</div>
          <div class="mt-1 text-sm font-black tracking-tight text-slate-900 line-clamp-2">${a(E)}</div>
          <div class="mt-3 flex items-center justify-between gap-3">
            <span class="text-sm font-black text-slate-900">${a(Ct)}</span>
            ${x?`
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-900 text-white">
                ${c("plus","w-4 h-4")}
              </span>
            `:""}
          </div>
        </div>
      </div>
    `},Ce=(t=[],{showAdd:d=!1}={})=>t.length?`
      <section class="space-y-3">
        <div class="flex items-end justify-between gap-3">
          <div>
            <h4 class="text-base font-black tracking-tight text-slate-900">Passt perfekt dazu</h4>
          </div>
          <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">${t.length} Vorschlaege</div>
        </div>
        <div class="overflow-x-auto no-scrollbar">
          <div class="flex gap-3 pb-1">
            ${t.map((x,h)=>re(x,h,{showAdd:d})).join("")}
          </div>
        </div>
      </section>
    `:"",a=typeof ye=="function"?ye:(t=>String(t||"")),c=typeof ke=="function"?ke:(()=>""),o=n.menuDetail.item,g=le(o),et=g.length?g.length-1:0,w=Math.max(0,Math.min(n.menuDetail.index||0,et)),C=z(o),Oe=o?.id?`menu-detail:${String(C||"")}:${String(o.id)}:${w}`:"",D=g[w]||"",Ae=$e(D,"large",{stableKey:Oe,variantGroup:"menu-detail"}),y=P(Ae)?q:Ae,je=ae(D),G=ie(D)&&D!==y?D:je,H=Se(o.price,o),F=Me(o),M=Le(F)?W(o.type)==="drink"?"Variante":"Produkt":W(o.type)==="drink"?"Getraenk":"Speise",L=o.category||"",de=o.longDescription||o.description||"",_e=String(o.ingredients||o.ingredient||o.inhaltsstoffe||"").trim(),ce=o.allergens||"",B=String(o.brand||"").trim(),ue=String(o.sku||"").trim(),V=Array.isArray(o.sizes)?o.sizes:[],N=Array.isArray(o.colors)?o.colors:[],Ge=rt(o.stock),k=Le(F),e=String(W(o.type||"")||"").trim().toLowerCase(),l=e==="food"||e==="drink",r=k?o.available===!1||Ge===0:o.available===!1,u=V.length?String(n.menuDetail.selectedSize||V[0]).trim()||String(V[0]):"",A=N.length?String(n.menuDetail.selectedColor||N[0]).trim()||String(N[0]):"",m=String(n.profileView?.menuAccessSource||"").trim().toLowerCase(),pe=String(n.profileTopTab||"").trim().toLowerCase()==="menu",R=!k&&l&&pe&&m==="qr",me=k?Be(F):R,K=_(o.woltUrl||o.woltLink||""),Z=!k&&l&&!R&&!!K,He=!k&&l&&!R&&!Z,dt=!!me,ct=We(o.crossSellItemIds||o.crossSellIds||o.crossSell||o.crossSelling,{excludeId:o.id}),tt=Array.isArray(o.crossSell)?o.crossSell:[],nt=ct.map(t=>Je(t,tt)).filter(Boolean),st=nt.length?nt:tt.filter(Boolean),Pe=Ve(o),ot=Ne(C,Pe),Re=ot?Ie(ot):{likes:[],comments:[],counts:{likes:0,comments:0}},Q=Ke(Re),lt=v(),ze=Re.likes?.some(t=>t.uid===lt.uid||t.handle===lt.handle),ut=(Array.isArray(n.favoriteMenuItems?.items)?n.favoriteMenuItems.items:[]).some(t=>{if(!t||typeof t!="object")return!1;const d=String(t.restaurantId||"").trim();if(C&&d&&d!==C)return!1;const x=[t.itemId,t.menuSocialId,t.menuItemId,t.id].map(h=>String(h||"").trim()).filter(Boolean);return!!Pe&&x.includes(Pe)}),at=(Re.comments||[]).map(Ue),U=!!C&&!!Pe&&!!n.user,pt=!!String(n.user?.uid||"").trim(),mt="menuDetailTitle",Ze=k?O(C||F?.restaurantId||""):0,it=(String(n.menuDetail.footerView||"cart").trim().toLowerCase()==="comment"?"comment":"cart")==="comment",Qe="Keine Informationen wenden sie sich an das Lokal / Kellner",ft=String(de||"").trim()||Qe,bt=_e||Qe,gt=String(ce||"").trim()||Qe,Ye=String(n.menuDetail?.infoTab||"info").trim().toLowerCase(),Te=Ye==="ingredients"||Ye==="allergens"?Ye:"info",qe=t=>["h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer select-none",Te===t?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"].join(" "),xt=k?`
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-3 px-7 pt-7 pb-4 border-b border-slate-100 bg-white">
        <div class="flex items-center gap-2 min-w-0">
          <button type="button" id="menuDetailHeaderCartBtn" class="inline-flex items-center gap-2 px-4 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black shadow-sm active:scale-95 ${me&&!r?"":"opacity-50 pointer-events-none"}">
            ${c("shopping-cart","w-4 h-4")}
            <span>In den Warenkorb</span>
            ${Ze?`<span class="inline-flex min-w-[20px] h-5 px-1.5 rounded-full bg-white/14 border border-white/20 text-white text-[9px] font-black items-center justify-center leading-none">${Ze>99?"99+":Ze}</span>`:""}
          </button>
          ${pt?`
            <button type="button" id="menuDetailHeaderFavoritesBtn" aria-label="Favoriten" title="Favoriten" class="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-95 ${ut?"bg-slate-900 text-white border-slate-900":"bg-slate-100 text-slate-700 border-slate-200"}">
              ${c("bookmark","w-4 h-4")}
            </button>
          `:""}
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${c("x","w-4 h-4")}
        </button>
      </div>
    `:`
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-4 px-7 pt-7 pb-5 border-b border-slate-100 bg-white">
        <div class="min-w-0 flex items-center flex-1">
          <div class="min-w-0">
            <h3 id="${mt}" class="text-[1.05rem] leading-tight font-black tracking-tight text-slate-900 truncate">${a(o.name||"Produkt")}</h3>
            ${L?`<div class="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${a(L)}</div>`:""}
          </div>
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${c("x","w-4 h-4")}
        </button>
      </div>
    `,ht=k?`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 space-y-5 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div class="modal-handoff-hero relative rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y; aspect-ratio:4 / 5;">
          <img id="menuDetailHeroImage" src="${a(y)}" data-fallback-src="${a(G)}" class="absolute inset-0 w-full h-full object-cover" style="object-position:${T(o)};" loading="eager" fetchpriority="high" decoding="sync" />
          ${g.length>1?`
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${c("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${c("chevron-right","w-4 h-4")}
            </button>
          `:""}
        </div>
        <div class="modal-handoff-chrome">
        ${g.length>1?`
          <div class="flex items-center justify-center gap-2">
            ${g.map((t,d)=>`
              <button type="button" data-menu-gallery-dot="${d}" class="w-2.5 h-2.5 rounded-full ${d===w?"bg-slate-900":"bg-slate-200"}"></button>
            `).join("")}
          </div>
        `:""}
        <div class="flex items-center justify-between">
          <span class="text-lg font-black text-slate-900">${a(H)}</span>
        </div>
        <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          ${L?`<span>${a(L)}</span>`:""}
          <span>${a(M)}</span>
        </div>
        ${B||ue?`
          <div class="grid ${B&&ue?"grid-cols-2":"grid-cols-1"} gap-3">
            ${B?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">Marke</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${a(B)}</p></div>`:""}
            ${ue?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">SKU</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${a(ue)}</p></div>`:""}
          </div>
        `:""}
        ${V.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Groessen</p>
            <select data-menu-detail-variant="size" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${V.map(t=>`<option value="${a(t)}" ${u===String(t)?"selected":""}>${a(t)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${N.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Farben</p>
            <select data-menu-detail-variant="color" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${N.map(t=>`<option value="${a(t)}" ${A===String(t)?"selected":""}>${a(t)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${de?`<p class="text-sm text-slate-600 leading-relaxed">${a(de)}</p>`:""}
        ${ce?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Hinweise</p>
            <p class="text-sm text-slate-600">${a(ce)}</p>
          </div>
        `:""}
        <div class="flex items-center justify-between" style="padding-top:1.25rem;">
          <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${ze?"text-rose-500":"text-slate-700"} ${U?"":"opacity-50 pointer-events-none"}">
            ${c("heart","w-3.5 h-3.5")} ${ze?"Gefaellt":"Like"}
          </button>
          <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span id="menuDetailLikesCount">${a(I(Q.likes))} Likes</span>
            <span id="menuDetailCommentsCount">${a(I(Q.comments))} Kommentare</span>
          </div>
        </div>
        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${Ee(at)}
        </div>
        </div>
      </div>
    `:`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 bg-white/98">
        <div class="modal-handoff-hero relative h-56 rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y;">
          <img id="menuDetailHeroImage" src="${a(y)}" data-fallback-src="${a(G)}" class="absolute inset-0 w-full h-full object-cover" style="object-position:${T(o)};" loading="eager" fetchpriority="high" decoding="sync" />
          ${g.length>1?`
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${c("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${c("chevron-right","w-4 h-4")}
            </button>
          `:""}
        </div>
        <div class="modal-handoff-chrome">
        ${g.length>1?`
          <div class="flex items-center justify-center gap-2">
            ${g.map((t,d)=>`
              <button type="button" data-menu-gallery-dot="${d}" class="w-2.5 h-2.5 rounded-full ${d===w?"bg-slate-900":"bg-slate-200"}"></button>
            `).join("")}
          </div>
        `:""}
        <div class="mt-6 space-y-5">
          <div class="p-4 rounded-[1.3rem] border border-slate-100 bg-slate-50">
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Preis</span>
              <span class="font-black text-slate-900" style="font-size:13px;">${a(H)}</span>
            </div>
          </div>
          <div class="border-t border-slate-100"></div>

          <div class="space-y-3">
            <div class="menu-detail-info-tabs space-y-4">
              <div class="grid grid-cols-3 gap-2 menu-detail-info-controls">
                <button type="button" data-menu-detail-info-tab="info" class="${qe("info")}">Info</button>
                <button type="button" data-menu-detail-info-tab="ingredients" class="${qe("ingredients")}">Inhaltsstoffe</button>
                <button type="button" data-menu-detail-info-tab="allergens" class="${qe("allergens")}">Allergene</button>
              </div>
              <div class="menu-detail-info-panels rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-3.5">
                <p data-menu-detail-info-panel="info" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${Te==="info"?"":"hidden"}">${a(ft)}</p>
                <p data-menu-detail-info-panel="ingredients" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${Te==="ingredients"?"":"hidden"}">${a(bt)}</p>
                <p data-menu-detail-info-panel="allergens" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${Te==="allergens"?"":"hidden"}">${a(gt)}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100"></div>
          ${st.length?`<div class="pt-1">${Ce(st,{showAdd:dt})}</div><div class="border-t border-slate-100"></div>`:""}

          <div class="flex items-center justify-between" style="padding-top:1.25rem;">
            <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${ze?"text-rose-500":"text-slate-700"} ${U?"":"opacity-50 pointer-events-none"}">
              ${c("heart","w-3.5 h-3.5")} ${ze?"Gefaellt":"Like"}
            </button>
            <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span id="menuDetailLikesCount">${a(I(Q.likes))} Likes</span>
              <span id="menuDetailCommentsCount">${a(I(Q.comments))} Kommentare</span>
            </div>
          </div>
        </div>

        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${Ee(at)}
        </div>
        </div>
      </div>
    `,vt=Z?`
      <button type="button" id="menuDetailWoltBtn" data-wolt-url="${a(K)}" class="flex-1 h-[52px] rounded-[1.65rem] text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm" style="background-color:#18b9df;" title="Bei Wolt oeffnen">
        <span class="font-bold text-sm">Wolt</span>
        ${c("external-link","w-4 h-4")}
      </button>
    `:He?`
        <button id="menuDetailFavoriteCtaBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all">
          <span class="font-bold text-sm">Zu Favoriten</span>
          ${c("bookmark","w-4 h-4")}
        </button>
      `:`
        <button id="menuDetailAddToCartBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all ${me&&!r?"":"opacity-50 pointer-events-none"}">
          <span class="font-bold text-sm">${r?"Ausverkauft":"In den Warenkorb"}</span>
          ${c("shopping-bag","w-4 h-4")}
        </button>
      `,wt=Z?"Zurueck zu Wolt":He?"Zurueck zu Favoriten":"Zurueck zum Warenkorb",yt=Z?"text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200",kt=Z?'style="background-color:#18b9df;"':"",$t=Z?`
      <span class="w-5 h-5 inline-flex items-center justify-center text-white leading-none select-none" aria-hidden="true">
        <span class="block" style="font-family:'Omnes','Plus Jakarta Sans','Segoe UI',sans-serif;font-size:20px;font-weight:800;font-style:italic;line-height:1;transform:translateY(-1px);">
          w
        </span>
      </span>
    `:c(He?"bookmark":"shopping-bag","w-5 h-5"),St=`
    <div class="modal-handoff-chrome px-7 pb-6 pt-4 border-t border-slate-100 bg-white/98 backdrop-blur-sm modal-footer-safe relative z-10">
      <div id="footer-cart-view" class="flex gap-3 items-center w-full transition-all duration-300 ${it?"hidden opacity-0":""}">
        <button type="button" id="menuDetailFooterCommentToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 relative" title="Kommentare verfassen">
          ${c("message-square","w-5 h-5")}
          ${Q.comments>0?`<span id="menuDetailFooterCommentsBadge" class="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">${Q.comments}</span>`:""}
        </button>
        ${vt}
      </div>

      <div id="footer-comment-view" class="flex gap-3 items-center w-full transition-all duration-300 ${it?"":"hidden opacity-0"}">
        <button type="button" id="menuDetailFooterCartToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] ${yt} flex items-center justify-center transition-all active:scale-95" ${kt} title="${wt}">
          ${$t}
        </button>

        <div class="flex-1 flex gap-2">
          <textarea id="menuDetailCommentInput" placeholder="${U?"Schreib einen Kommentar...":"Bitte einloggen"}" class="flex-1 px-5 py-3.5 rounded-[1.65rem] border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none leading-relaxed ${U?"":"opacity-60"}" rows="1" ${U?"":"disabled"}>${a(n.menuDetail.commentText||"")}</textarea>
          <button id="menuDetailCommentSend" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-indigo-600 text-white flex items-center justify-center ${U?"":"opacity-60 cursor-not-allowed"}" ${U?"":"disabled"}>
            ${c("send","w-4 h-4")}
          </button>
        </div>
      </div>
    </div>
  `;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="menuDetailOverlay" data-menu-detail-close="true" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame menu-detail-modal-frame">
        <div class="bg-white rounded-t-[3.2rem] shadow-[0_-24px_80px_rgba(15,23,42,0.22)] border-x border-b border-slate-100  flex flex-col modal-sheet-88 overflow-hidden modal-sheet menu-detail-modal-sheet">
          ${xt}
          ${ht}
          ${St}
        </div>
      </div>
    </div>
  `}export{Nt as renderMenuDetailModalCore,Vt as renderMenuItemModalCore};
