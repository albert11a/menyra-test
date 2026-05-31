import{i as jt,a as Pt,t as zt}from"../entry/social-app.js";import"./startup-route-runtime-context-DeJItfeS.js";import"./vendor-firebase-V03pMX6J.js";const Tt=Object.freeze(["Fruehstueck","Brunch","Vorspeise","Suppe","Salat","Pasta","Pizza","Burger","Sandwich","Wrap","Grill","Fleisch","Fisch","Vegetarisch","Vegan","Beilage","Kinder","Dessert","Kuchen","Eis","Kaffee","Tee","Softdrink","Saft","Smoothie","Bier","Wein","Cocktail","Spirituose","Sonstiges"]);function dt(s){if(s==null)return null;const k=typeof s=="string"?s.trim():s;if(k==="")return null;const $=Number(k);return Number.isFinite($)?Math.max(0,$):null}function Kt({state:s,isShopCatalogProfile:k,getBusinessProfileType:$,getOptimizedImageUrl:q,PLACEHOLDER_IMAGE:Q,isPlaceholderUrl:Y,normalizeMenuType:X,getMenuModalCrop:J,escapeHtml:ee,icon:te}={}){if(!s||!s.menuModal?.open)return"";const fe=typeof k=="function"?k:(()=>!1),be=typeof $=="function"?$:(()=>""),ne=typeof q=="function"?q:(e=>String(e||"")),ge=typeof Y=="function"?Y:(()=>!1),xe=typeof X=="function"?X:(e=>String(e||"food")),he=typeof J=="function"?J:(()=>({x:50,y:50})),r=typeof ee=="function"?ee:(e=>String(e||"")),P=typeof te=="function"?te:(()=>""),ve=e=>{const i=Number(e);return Number.isFinite(i)?`${i.toFixed(2).replace(".",",")} EUR`:String(e||"").trim()||"0,00 EUR"},we=(e,{excludeId:i=""}={})=>{const d=String(i||"").trim(),p=new Set,A=f=>{if(f==null)return;if(Array.isArray(f)){f.forEach(A);return}const pe=typeof f=="object"?f.id||f.itemId||f.productId||f.menuItemId||"":f,je=String(pe||"").trim();je&&je.split(",").forEach(me=>{const j=String(me||"").trim();!j||j===d||p.has(j)||p.add(j)})};return A(e),Array.from(p)},o=s.menuModal.item||{},se=s.menuModal.mode==="edit",x=fe(s.userProfile),ye=se?"Produkt bearbeiten":"Produkt hinzufuegen",ke=Array.isArray(s.menuModal.existingImages)?s.menuModal.existingImages:[],oe=Array.isArray(s.menuModal.imagePreviews)?s.menuModal.imagePreviews:[],$e=String(s.menuModal.imageUrlDraft||"").trim(),z=[...ke.map((e,i)=>({src:e,kind:"existing",idx:i})),...oe.map((e,i)=>({src:e,kind:"new",idx:i}))].filter(e=>e.src),le=z[0]?.src||$e||o.imageUrl||"",ae=le?ne(le,"large"):Q,Se=ge(ae)?Q:ae,T=xe(o.type||"food"),Me=T==="food"||T==="drink",N=o.available!==!1?"available":"unavailable",Be=s.menuModal.status||"",Ve=Array.isArray(o.sizes)?o.sizes.join(", "):"",Ne=Array.isArray(o.colors)?o.colors.join(", "):"",Ie=dt(o.stock),Ke=Ie===null?"":String(Ie),y=he(),We=String(be(s.userProfile)||"").trim().toLowerCase(),K=!x&&jt(We),S=(()=>{const e=s?.userProfile?.specialEnabled;if(typeof e=="boolean")return e;const i=String(s?.userProfile?.restaurantId||"").trim();return i?(Array.isArray(s?.restaurants)?s.restaurants.find(p=>String(p?.id||"").trim()===i):null)?.specialEnabled===!0:!1})(),D=Pt(o.cardStyle||"",T),a=D==="testfirst_special"||String(o.category||"").trim().toLowerCase()==="special",Ee=K&&!a&&D==="testfirst_drink",ie=(e=>{const i=Number(e);return Number.isFinite(i)?i<=33?"left":i>=67?"right":"center":"center"})(y.x),Ce=String(o.category||"Sonstiges").trim()||"Sonstiges",Oe=e=>String(e||"").trim().toLowerCase()==="special",t=Array.from(new Set([Ce,...Array.isArray(s.menu?.items)?s.menu.items.map(e=>String(e?.category||"").trim()):[],...Tt].filter(e=>!(!e||!S&&Oe(e))))),u="menuItemCategoryOptions",l=String(o.specialSize||o.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default",W=String(o.specialActionType||o.actionType||"").trim().toLowerCase()==="link"?"link":"product",U=String(o.specialActionUrl||o.linkUrl||o.actionUrl||"").trim(),I=String(o.specialActionProductId||o.targetProductId||"").trim(),_e=String(o.ingredients||o.ingredient||o.inhaltsstoffe||"").trim(),F=String(o.woltUrl||o.woltLink||"").trim(),C=String(o.id||"").trim(),E=(e,i=0)=>{const d=Number(e);return Number.isFinite(d)?Math.max(0,Math.floor(d)):Math.max(0,Number(i)||0)},re=Array.isArray(s.menu?.items)?s.menu.items.slice().map((e,i)=>({entry:e,idx:i,order:E(e?.orderIndex,i)})).sort((e,i)=>e.order-i.order||e.idx-i.idx).map(e=>e.entry):[],O=re.filter(e=>String(e?.id||"").trim()!==C),de=re.findIndex(e=>String(e?.id||"").trim()===C),w=Math.max(1,O.length+1),Ae=de>=0?Math.min(w,Math.max(1,de+1)):w,_=Math.min(w,Math.max(1,Number.isFinite(Number(o.orderIndex))?E(o.orderIndex,Ae-1)+1:Ae)),ce=Array.isArray(s.menu?.items)?s.menu.items.filter(e=>{const i=String(e?.id||"").trim();return!(!i||i===C)}):[],Ge=we(o.crossSellItemIds||o.crossSellIds||o.crossSell||o.crossSelling,{excludeId:C}),G=re.filter(e=>{const i=String(e?.id||"").trim();if(!i||i===C)return!1;const d=String(e?.type||"").trim().toLowerCase(),p=String(e?.menuSection||"").trim().toLowerCase();return d==="food"||d==="drink"||p==="food"||p==="drink"}),R=`
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${se?"Bearbeiten":"Neu"}</span>
        <h3 id="menuModalTitle" class="text-xl font-black italic tracking-tighter">${ye}</h3>
      </div>
      <button id="menuModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${P("x","w-4 h-4")}
      </button>
    </div>
  `,M=`
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="menuItemImageInput" class="hidden" accept="image/*" multiple />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="menuItemHeroPreview" src="${r(Se)}" class="w-full h-52 object-cover" style="object-position:${y.x}% ${y.y}%;" />
        <button type="button" id="menuItemImageTrigger" aria-label="Fotos hochladen" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${P("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${P("plus","w-2.5 h-2.5")}
          </span>
        </button>
      </div>
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Horizontal</p>
          <span id="menuCropXValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${y.x}%</span>
        </div>
        <input id="menuItemCropX" type="range" min="0" max="100" step="1" value="${y.x}" class="w-full accent-indigo-600" />
        <div id="menuSmallCardCropControl" class="${Ee?"":"hidden"} space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Small Card Crop</p>
            <span class="text-[10px] font-bold text-slate-400">1:1</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" data-menu-small-crop="left" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${ie==="left"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Links</button>
            <button type="button" data-menu-small-crop="center" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${ie==="center"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Mitte</button>
            <button type="button" data-menu-small-crop="right" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${ie==="right"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Rechts</button>
          </div>
          <p class="text-[10px] font-bold text-slate-400 px-1">Nur fuer Small Drink Card (Public Menue).</p>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Vertikal</p>
          <span id="menuCropYValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${y.y}%</span>
        </div>
        <input id="menuItemCropY" type="range" min="0" max="100" step="1" value="${y.y}" class="w-full accent-indigo-600" />
      </div>
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Fotos</p>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${z.length}</span>
        </div>
        ${z.length?`
          <div class="grid grid-cols-3 gap-2">
            ${z.map(e=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                <img src="${r(ne(e.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-menu-image-remove="${e.idx}" data-menu-image-source="${e.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${P("x","w-3 h-3")}
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
          <input id="menuItemName" type="text" value="${r(o.name||"")}" placeholder="Produktname" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis</label>
            <input id="menuItemPrice" type="text" value="${r(o.price??"")}" placeholder="z.B. 4.50" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Kategorie</label>
            <input id="menuItemCategory" list="${u}" type="text" value="${r(Ce)}" placeholder="Kategorie eingeben" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <datalist id="${u}">
              ${t.map(e=>`<option value="${r(e)}"></option>`).join("")}
            </datalist>
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
          <select id="menuItemType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="food" ${T==="food"?"selected":""}>${x?"Produkt":"Speise"}</option>
            <option value="drink" ${T==="drink"?"selected":""}>${x?"Variante":"Getraenk"}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
          <select id="menuItemVisibility" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="available" ${N==="available"?"selected":""}>Verfuegbar</option>
            <option value="unavailable" ${N==="unavailable"?"selected":""}>Ausverkauft</option>
          </select>
        </div>
        ${S&&K&&a?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Position im aktiven Menue</label>
            <select id="menuItemOrderPosition" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              ${Array.from({length:w},(e,i)=>{const d=i+1,p=O[d-1]||null,A=d>1?O[d-2]:null,f=d===1?"Ganz oben":d===w?"Ganz unten":`Nach ${String(A?.name||"Produkt").trim()||"Produkt"}`,pe=p?` (vor ${String(p?.name||"Produkt").trim()||"Produkt"})`:"";return`<option value="${d}" ${_===d?"selected":""}>Position ${d}: ${r(f)}${r(pe)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Einfach auswaehlen statt Drag and Drop.</p>
          </div>
        `:""}
        ${K&&!a?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Card Style</label>
            <select id="menuItemCardStyle" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="testfirst_drink" ${D==="testfirst_drink"?"selected":""}>Small = Drink Card</option>
              <option value="testfirst_food" ${D==="testfirst_food"?"selected":""}>Big = Food Card</option>
            </select>
          </div>
        `:""}
        ${S&&K&&a?`
          <input id="menuItemCardStyle" type="hidden" value="testfirst_special" />
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Groesse</label>
            <select id="menuItemSpecialSize" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="default" ${l==="default"?"selected":""}>Normal</option>
              <option value="food" ${l==="food"?"selected":""}>Food-Card Groesse</option>
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Nur relevant fuer Special-Card.</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Klick-Aktion</label>
            <select id="menuItemSpecialActionType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="product" ${W==="product"?"selected":""}>Produkt-Modal oeffnen</option>
              <option value="link" ${W==="link"?"selected":""}>Weiterleitung / Link oeffnen</option>
            </select>
          </div>
          <div id="menuItemSpecialActionProductField" class="${W==="product"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Ziel-Produkt</label>
            <select id="menuItemSpecialActionProductId" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="">Kein Produkt</option>
              ${ce.map(e=>{const i=String(e?.id||"").trim(),d=String(e?.name||"Produkt").trim()||"Produkt";return`<option value="${r(i)}" ${I===i?"selected":""}>${r(d)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird genutzt, wenn Klick-Aktion = Produkt-Modal.</p>
          </div>
          <div id="menuItemSpecialActionLinkField" class="${W==="link"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Link</label>
            <input id="menuItemSpecialActionUrl" type="text" value="${r(U)}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird genutzt, wenn Klick-Aktion = Link.</p>
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Beschreibung</label>
          <textarea id="menuItemDesc" rows="3" placeholder="Beschreibung..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${r(o.description||"")}</textarea>
        </div>
        ${x?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Inhaltsstoffe</label>
            <textarea id="menuItemIngredients" rows="3" placeholder="z.B. Wasser, Zucker, Salz..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${r(_e)}</textarea>
          </div>
        `}
        ${x?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Wolt Link</label>
            <input id="menuItemWoltUrl" type="url" value="${r(F)}" placeholder="https://wolt.com/..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Optional: wird im Produkt-Drawer angezeigt, wenn kein QR-Menuezugang aktiv ist.</p>
          </div>
        `}
        ${x?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Details</label>
            <textarea id="menuItemLongDesc" rows="4" placeholder="Material, Zustand, Lieferdetails..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${r(o.longDescription||"")}</textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Marke</label>
              <input id="menuItemBrand" type="text" value="${r(o.brand||"")}" placeholder="z.B. Nike" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">SKU</label>
              <input id="menuItemSku" type="text" value="${r(o.sku||"")}" placeholder="ART-001" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Groessen</label>
              <input id="menuItemSizes" type="text" value="${r(Ve)}" placeholder="XS, S, M, L" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Farben</label>
              <input id="menuItemColors" type="text" value="${r(Ne)}" placeholder="Schwarz, Weiss" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Lagerbestand</label>
            <input id="menuItemStock" type="number" min="0" inputmode="numeric" value="${r(Ke)}" placeholder="0" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">${x?"Hinweise":"Allergene"}</label>
          <input id="menuItemAllergens" type="text" value="${r(o.allergens||"")}" placeholder="${x?"z.B. limitierte Edition, ohne Rueckgabe":"z.B. Milch, Gluten"}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        ${!x&&Me?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cross Selling (QR)</label>
            <div class="mt-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 max-h-48 overflow-y-auto no-scrollbar space-y-2">
              ${G.length?G.map(e=>{const i=String(e?.id||"").trim(),d=String(e?.name||"Produkt").trim()||"Produkt",p=String(e?.category||"").trim(),A=ve(e?.price);return`
                  <label class="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                    <input type="checkbox" data-menu-cross-sell-option value="${r(i)}" ${Ge.includes(i)?"checked":""} class="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" />
                    <span class="min-w-0 flex-1">
                      <span class="block text-xs font-black text-slate-800 truncate">${r(d)}</span>
                      <span class="block text-[10px] font-bold uppercase tracking-wide text-slate-400">${r(p||"Produkt")} · ${r(A)}</span>
                    </span>
                  </label>
                `}).join(""):'<p class="text-[10px] font-bold uppercase tracking-wide text-slate-400 px-2 py-1">Keine weiteren Speisen/Getraenke verfuegbar</p>'}
            </div>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird nur im Produkt-Drawer gezeigt, wenn das Menue per QR-Code geoeffnet wurde.</p>
          </div>
        `:""}
      </div>
    </div>
  `,L=`
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
      <button id="menuModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${s.menuModal.loading?"disabled":""}>
        ${s.menuModal.loading?"Speichern...":"Speichern"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${r(Be)}</div>
    </div>
  `;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="menuModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          ${R}
          ${M}
          ${L}
        </div>
      </div>
    </div>
  `}function Wt({state:s,getMenuItemImages:k,getOptimizedImageUrl:$,isPlaceholderUrl:q,PLACEHOLDER_IMAGE:Q,getFirebaseStorageUrl:Y,isDirectImageUrl:X,formatPrice:J,getMenuDetailRestaurantId:ee,getMenuDetailCatalogProfile:te,isShopCatalogProfile:fe,normalizeMenuType:be,canAddToShopCart:ne,getMenuItemSocialId:ge,menuItemMetaKey:xe,ensureMenuItemMeta:he,resolveMenuItemCounts:r,currentUserBadge:P,ensureCommentShape:ve,getCartCountForRestaurant:we,renderMenuDetailComments:o,formatCount:se,getMenuItemObjectPosition:x,escapeHtml:ye,icon:ke}={}){if(!s||!s.menuDetail?.open||!s.menuDetail?.item)return"";const oe=typeof k=="function"?k:(()=>[]),$e=typeof $=="function"?$:(n=>String(n||"")),z=typeof q=="function"?q:(()=>!1),le=typeof Y=="function"?Y:(n=>String(n||"")),ae=typeof X=="function"?X:(()=>!1),Se=typeof J=="function"?J:(n=>String(n||"")),T=typeof ee=="function"?ee:(()=>""),Me=typeof te=="function"?te:(()=>null),Le=typeof fe=="function"?fe:(()=>!1),N=typeof be=="function"?be:(n=>String(n||"food")),Be=typeof ne=="function"?ne:(()=>!1),Ve=typeof ge=="function"?ge:(()=>""),Ne=typeof xe=="function"?xe:(()=>""),Ie=typeof he=="function"?he:(()=>({likes:[],comments:[],counts:{likes:0,comments:0}})),Ke=typeof r=="function"?r:(()=>({likes:0,comments:0})),y=typeof P=="function"?P:(()=>({uid:"",handle:""})),We=typeof ve=="function"?ve:(n=>n),K=typeof we=="function"?we:(()=>0),Ue=typeof o=="function"?o:(()=>""),S=typeof se=="function"?se:(n=>String(n||"0")),D=typeof x=="function"?x:(()=>"50% 50%"),a=(n,c=n,g={})=>zt(n,{fallback:c,params:g}),Ee=(n="")=>{const c=String(n||"").trim();return c?/^(https?:\/\/|mailto:|tel:)/i.test(c)?c:`https://${c.replace(/^\/+/,"")}`:""},Je=(n,{excludeId:c=""}={})=>{const g=String(c||"").trim(),h=new Set,m=b=>{if(b==null)return;if(Array.isArray(b)){b.forEach(m);return}const De=typeof b=="object"?b.id||b.itemId||b.productId||b.menuItemId||"":b,Fe=String(De||"").trim();Fe&&Fe.split(",").forEach(Xe=>{const V=String(Xe||"").trim();!V||V===g||h.has(V)||h.add(V)})};return m(n),Array.from(h)},ie=(n,c=[])=>{const g=String(n||"").trim();if(!g)return null;const h=Array.isArray(s?.menu?.items)?s.menu.items.find(m=>String(m?.id||"").trim()===g):null;return h||Array.isArray(c)&&c.find(m=>String(m?.id||m?.itemId||m?.productId||m?.menuItemId||"").trim()===g)||null},Ce=(n={},c=0,{showAdd:g=!1}={})=>{const m=(Array.isArray(oe(n))?oe(n):[])[0]||n.imageUrl||n.image||"",b=$e(m,"thumb"),De=z(b)?Q:b,Fe=le(m),Xe=ae(m)&&m!==De?m:Fe,V=String(n.name||`Empfehlung ${c+1}`).trim()||`Empfehlung ${c+1}`,Ct=String(n.category||"Passt dazu").trim()||"Passt dazu",At=Se(n.price,n);return`
      <div class="group shrink-0 rounded-[1.8rem] border border-slate-100 bg-white p-2.5 text-left transition-all" style="width:132px;min-width:132px;max-width:132px;flex:0 0 132px;">
        <div class="relative overflow-hidden rounded-[1.2rem] bg-slate-100 mx-auto" style="width:92px;height:92px;">
          <img src="${t(De)}" data-fallback-src="${t(Xe)}" data-image-reveal="menu" alt="${t(V)}" class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" fetchpriority="low" decoding="async" />
        </div>
        <div class="pt-3 px-1">
          <div class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${t(Ct)}</div>
          <div class="mt-1 text-sm font-black tracking-tight text-slate-900 line-clamp-2">${t(V)}</div>
          <div class="mt-3 flex items-center justify-between gap-3">
            <span class="text-sm font-black text-slate-900">${t(At)}</span>
            ${g?`
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-900 text-white">
                ${u("plus","w-4 h-4")}
              </span>
            `:""}
          </div>
        </div>
      </div>
    `},Oe=(n=[],{showAdd:c=!1}={})=>n.length?`
      <section class="space-y-3">
        <div class="flex items-end justify-between gap-3">
          <div>
            <h4 class="text-base font-black tracking-tight text-slate-900">Passt perfekt dazu</h4>
          </div>
          <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">${n.length} Vorschlaege</div>
        </div>
        <div class="overflow-x-auto no-scrollbar">
          <div class="flex gap-3 pb-1">
            ${n.map((g,h)=>Ce(g,h,{showAdd:c})).join("")}
          </div>
        </div>
      </section>
    `:"",t=typeof ye=="function"?ye:(n=>String(n||"")),u=typeof ke=="function"?ke:(()=>""),l=s.menuDetail.item,v=oe(l),W=v.length?v.length-1:0,U=Math.max(0,Math.min(s.menuDetail.index||0,W)),I=T(l),_e=l?.id?`menu-detail:${String(I||"")}:${String(l.id)}:${U}`:"",F=v[U]||"",C=$e(F,"large",{stableKey:_e,variantGroup:"menu-detail"}),E=z(C)?Q:C,re=le(F),O=ae(F)&&F!==E?F:re,de=Se(l.price,l),w=Me(l),Ae=Le(w)?N(l.type)==="drink"?a("menu.variant","Variante"):a("menu.product","Produkt"):N(l.type)==="drink"?a("menu.drinkItem","Getraenk"):a("menu.foodItem","Speise"),_=l.category||"",ce=l.longDescription||l.description||"",Ge=String(l.ingredients||l.ingredient||l.inhaltsstoffe||"").trim(),G=l.allergens||"",ue=String(l.brand||"").trim(),R=String(l.sku||"").trim(),M=Array.isArray(l.sizes)?l.sizes:[],L=Array.isArray(l.colors)?l.colors:[],et=dt(l.stock),e=Le(w),i=String(N(l.type||"")||"").trim().toLowerCase(),d=i==="food"||i==="drink",p=e?l.available===!1||et===0:l.available===!1,A=M.length?String(s.menuDetail.selectedSize||M[0]).trim()||String(M[0]):"",f=L.length?String(s.menuDetail.selectedColor||L[0]).trim()||String(L[0]):"",pe=String(s.profileView?.menuAccessSource||"").trim().toLowerCase(),je=String(s.profileTopTab||"").trim().toLowerCase()==="menu",me=!e&&d&&je&&pe==="qr",j=e?Be(w):me,tt=Ee(l.woltUrl||l.woltLink||""),H=!e&&d&&!me&&!!tt,Re=!e&&d&&!me&&!H,ct=!!j,ut=Je(l.crossSellItemIds||l.crossSellIds||l.crossSell||l.crossSelling,{excludeId:l.id}),nt=Array.isArray(l.crossSell)?l.crossSell:[],st=ut.map(n=>ie(n,nt)).filter(Boolean),ot=st.length?st:nt.filter(Boolean),Pe=Ve(l),lt=Ne(I,Pe),He=lt?Ie(lt):{likes:[],comments:[],counts:{likes:0,comments:0}},Z=Ke(He),at=y(),ze=He.likes?.some(n=>n.uid===at.uid||n.handle===at.handle),pt=(Array.isArray(s.favoriteMenuItems?.items)?s.favoriteMenuItems.items:[]).some(n=>{if(!n||typeof n!="object")return!1;const c=String(n.restaurantId||"").trim();if(I&&c&&c!==I)return!1;const g=[n.itemId,n.menuSocialId,n.menuItemId,n.id].map(h=>String(h||"").trim()).filter(Boolean);return!!Pe&&g.includes(Pe)}),it=(He.comments||[]).map(We),B=!!I&&!!Pe&&!!s.user,mt=!!String(s.user?.uid||"").trim(),ft="menuDetailTitle",Ze=e?K(I||w?.restaurantId||""):0,rt=(String(s.menuDetail.footerView||"cart").trim().toLowerCase()==="comment"?"comment":"cart")==="comment",qe=a("menu.noInfo","Keine Informationen, bitte an das Lokal oder den Kellner wenden."),bt=String(ce||"").trim()||qe,gt=Ge||qe,xt=String(G||"").trim()||qe,Qe=String(s.menuDetail?.infoTab||"info").trim().toLowerCase(),Te=Qe==="ingredients"||Qe==="allergens"?Qe:"info",Ye=n=>["h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer select-none",Te===n?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"].join(" "),ht=e?`
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-3 px-7 pt-7 pb-4 border-b border-slate-100 bg-white">
        <div class="flex items-center gap-2 min-w-0">
          <button type="button" id="menuDetailHeaderCartBtn" class="inline-flex items-center gap-2 px-4 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black shadow-sm active:scale-95 ${j&&!p?"":"opacity-50 pointer-events-none"}">
            ${u("shopping-cart","w-4 h-4")}
            <span>${t(a("menu.addToCart","In den Warenkorb"))}</span>
            ${Ze?`<span class="inline-flex min-w-[20px] h-5 px-1.5 rounded-full bg-white/14 border border-white/20 text-white text-[9px] font-black items-center justify-center leading-none">${Ze>99?"99+":Ze}</span>`:""}
          </button>
          ${mt?`
            <button type="button" id="menuDetailHeaderFavoritesBtn" aria-label="${t(a("menu.favorite","Favoriten"))}" title="${t(a("menu.favorite","Favoriten"))}" class="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-95 ${pt?"bg-slate-900 text-white border-slate-900":"bg-slate-100 text-slate-700 border-slate-200"}">
              ${u("bookmark","w-4 h-4")}
            </button>
          `:""}
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${u("x","w-4 h-4")}
        </button>
      </div>
    `:`
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-4 px-7 pt-7 pb-5 border-b border-slate-100 bg-white">
        <div class="min-w-0 flex items-center flex-1">
          <div class="min-w-0">
            <h3 id="${ft}" class="text-[1.05rem] leading-tight font-black tracking-tight text-slate-900 truncate">${t(l.name||a("menu.product","Produkt"))}</h3>
            ${_?`<div class="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${t(_)}</div>`:""}
          </div>
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${u("x","w-4 h-4")}
        </button>
      </div>
    `,vt=e?`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 space-y-5 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div class="modal-handoff-hero relative rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y; aspect-ratio:4 / 5;">
          <img id="menuDetailHeroImage" src="${t(E)}" data-fallback-src="${t(O)}" class="absolute inset-0 w-full h-full object-cover" style="object-position:${D(l)};" loading="eager" fetchpriority="high" decoding="sync" />
          ${v.length>1?`
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${u("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${u("chevron-right","w-4 h-4")}
            </button>
          `:""}
        </div>
        <div class="modal-handoff-chrome">
        ${v.length>1?`
          <div class="flex items-center justify-center gap-2">
            ${v.map((n,c)=>`
              <button type="button" data-menu-gallery-dot="${c}" class="w-2.5 h-2.5 rounded-full ${c===U?"bg-slate-900":"bg-slate-200"}"></button>
            `).join("")}
          </div>
        `:""}
        <div class="flex items-center justify-between">
          <span class="text-lg font-black text-slate-900">${t(de)}</span>
        </div>
        <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          ${_?`<span>${t(_)}</span>`:""}
          <span>${t(Ae)}</span>
        </div>
        ${ue||R?`
          <div class="grid ${ue&&R?"grid-cols-2":"grid-cols-1"} gap-3">
            ${ue?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${t(a("menu.brand","Marke"))}</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${t(ue)}</p></div>`:""}
            ${R?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">SKU</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${t(R)}</p></div>`:""}
          </div>
        `:""}
        ${M.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${t(a("menu.sizes","Groessen"))}</p>
            <select data-menu-detail-variant="size" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${M.map(n=>`<option value="${t(n)}" ${A===String(n)?"selected":""}>${t(n)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${L.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${t(a("menu.colors","Farben"))}</p>
            <select data-menu-detail-variant="color" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${L.map(n=>`<option value="${t(n)}" ${f===String(n)?"selected":""}>${t(n)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${ce?`<p class="text-sm text-slate-600 leading-relaxed">${t(ce)}</p>`:""}
        ${G?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">${t(a("menu.notes","Hinweise"))}</p>
            <p class="text-sm text-slate-600">${t(G)}</p>
          </div>
        `:""}
        <div class="flex items-center justify-between" style="padding-top:1.25rem;">
          <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${ze?"text-rose-500":"text-slate-700"} ${B?"":"opacity-50 pointer-events-none"}">
            ${u("heart","w-3.5 h-3.5")} ${t(ze?a("likes.liked","Gefaellt"):a("likes.like","Like"))}
          </button>
          <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span id="menuDetailLikesCount">${t(S(Z.likes))} ${t(a("likes.count","Likes"))}</span>
            <span id="menuDetailCommentsCount">${t(S(Z.comments))} ${t(a("comments.count","Kommentare"))}</span>
          </div>
        </div>
        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${Ue(it)}
        </div>
        </div>
      </div>
    `:`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 bg-white/98">
        <div class="modal-handoff-hero relative h-56 rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y;">
          <img id="menuDetailHeroImage" src="${t(E)}" data-fallback-src="${t(O)}" class="absolute inset-0 w-full h-full object-cover" style="object-position:${D(l)};" loading="eager" fetchpriority="high" decoding="sync" />
          ${v.length>1?`
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${u("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${u("chevron-right","w-4 h-4")}
            </button>
          `:""}
        </div>
        <div class="modal-handoff-chrome">
        ${v.length>1?`
          <div class="flex items-center justify-center gap-2">
            ${v.map((n,c)=>`
              <button type="button" data-menu-gallery-dot="${c}" class="w-2.5 h-2.5 rounded-full ${c===U?"bg-slate-900":"bg-slate-200"}"></button>
            `).join("")}
          </div>
        `:""}
        <div class="mt-6 space-y-5">
          <div class="p-4 rounded-[1.3rem] border border-slate-100 bg-slate-50">
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">${t(a("menu.price","Preis"))}</span>
              <span class="font-black text-slate-900" style="font-size:13px;">${t(de)}</span>
            </div>
          </div>
          <div class="border-t border-slate-100"></div>

          <div class="space-y-3">
            <div class="menu-detail-info-tabs space-y-4">
              <div class="grid grid-cols-3 gap-2 menu-detail-info-controls">
                <button type="button" data-menu-detail-info-tab="info" class="${Ye("info")}">${t(a("menu.info","Info"))}</button>
                <button type="button" data-menu-detail-info-tab="ingredients" class="${Ye("ingredients")}">${t(a("menu.ingredients","Inhaltsstoffe"))}</button>
                <button type="button" data-menu-detail-info-tab="allergens" class="${Ye("allergens")}">${t(a("menu.allergens","Allergene"))}</button>
              </div>
              <div class="menu-detail-info-panels rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-3.5">
                <p data-menu-detail-info-panel="info" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${Te==="info"?"":"hidden"}">${t(bt)}</p>
                <p data-menu-detail-info-panel="ingredients" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${Te==="ingredients"?"":"hidden"}">${t(gt)}</p>
                <p data-menu-detail-info-panel="allergens" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${Te==="allergens"?"":"hidden"}">${t(xt)}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100"></div>
          ${ot.length?`<div class="pt-1">${Oe(ot,{showAdd:ct})}</div><div class="border-t border-slate-100"></div>`:""}

          <div class="flex items-center justify-between" style="padding-top:1.25rem;">
            <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${ze?"text-rose-500":"text-slate-700"} ${B?"":"opacity-50 pointer-events-none"}">
              ${u("heart","w-3.5 h-3.5")} ${t(ze?a("likes.liked","Gefaellt"):a("likes.like","Like"))}
            </button>
            <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span id="menuDetailLikesCount">${t(S(Z.likes))} ${t(a("likes.count","Likes"))}</span>
              <span id="menuDetailCommentsCount">${t(S(Z.comments))} ${t(a("comments.count","Kommentare"))}</span>
            </div>
          </div>
        </div>

        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${Ue(it)}
        </div>
        </div>
      </div>
    `,wt=H?`
      <button type="button" id="menuDetailWoltBtn" data-wolt-url="${t(tt)}" class="flex-1 h-[52px] rounded-[1.65rem] text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm" style="background-color:#18b9df;" title="${t(a("menu.openWolt","Bei Wolt oeffnen"))}">
        <span class="font-bold text-sm">Wolt</span>
        ${u("external-link","w-4 h-4")}
      </button>
    `:Re?`
        <button id="menuDetailFavoriteCtaBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all">
          <span class="font-bold text-sm">${t(a("menu.toFavorites","Zu Favoriten"))}</span>
          ${u("bookmark","w-4 h-4")}
        </button>
      `:`
        <button id="menuDetailAddToCartBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all ${j&&!p?"":"opacity-50 pointer-events-none"}">
          <span class="font-bold text-sm">${t(p?a("menu.soldOut","Ausverkauft"):a("menu.addToCart","In den Warenkorb"))}</span>
          ${u("shopping-bag","w-4 h-4")}
        </button>
      `,yt=H?a("menu.backToWolt","Zurueck zu Wolt"):Re?a("menu.backToFavorites","Zurueck zu Favoriten"):a("menu.backToCart","Zurueck zum Warenkorb"),kt=H?"text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200",$t=H?'style="background-color:#18b9df;"':"",St=H?`
      <span class="w-5 h-5 inline-flex items-center justify-center text-white leading-none select-none" aria-hidden="true">
        <span class="block" style="font-family:'Omnes','Plus Jakarta Sans','Segoe UI',sans-serif;font-size:20px;font-weight:800;font-style:italic;line-height:1;transform:translateY(-1px);">
          w
        </span>
      </span>
    `:u(Re?"bookmark":"shopping-bag","w-5 h-5"),It=`
    <div class="modal-handoff-chrome px-7 pb-6 pt-4 border-t border-slate-100 bg-white/98 backdrop-blur-sm modal-footer-safe relative z-10">
      <div id="footer-cart-view" class="flex gap-3 items-center w-full transition-all duration-300 ${rt?"hidden opacity-0":""}">
        <button type="button" id="menuDetailFooterCommentToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 relative" title="${t(a("menu.commentAction","Kommentare verfassen"))}">
          ${u("message-square","w-5 h-5")}
          ${Z.comments>0?`<span id="menuDetailFooterCommentsBadge" class="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">${Z.comments}</span>`:""}
        </button>
        ${wt}
      </div>

      <div id="footer-comment-view" class="flex gap-3 items-center w-full transition-all duration-300 ${rt?"":"hidden opacity-0"}">
        <button type="button" id="menuDetailFooterCartToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] ${kt} flex items-center justify-center transition-all active:scale-95" ${$t} title="${yt}">
          ${St}
        </button>

        <div class="flex-1 flex gap-2">
          <textarea id="menuDetailCommentInput" placeholder="${t(B?a("menu.commentPlaceholder","Schreib einen Kommentar..."):a("menu.loginRequired","Bitte einloggen"))}" class="flex-1 px-5 py-3.5 rounded-[1.65rem] border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none leading-relaxed ${B?"":"opacity-60"}" rows="1" ${B?"":"disabled"}>${t(s.menuDetail.commentText||"")}</textarea>
          <button id="menuDetailCommentSend" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-indigo-600 text-white flex items-center justify-center ${B?"":"opacity-60 cursor-not-allowed"}" ${B?"":"disabled"}>
            ${u("send","w-4 h-4")}
          </button>
        </div>
      </div>
    </div>
  `;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="menuDetailOverlay" data-menu-detail-close="true" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame menu-detail-modal-frame">
        <div class="bg-white rounded-t-[3.2rem] shadow-[0_-24px_80px_rgba(15,23,42,0.22)] border-x border-b border-slate-100  flex flex-col modal-sheet-88 overflow-hidden modal-sheet menu-detail-modal-sheet">
          ${ht}
          ${vt}
          ${It}
        </div>
      </div>
    </div>
  `}export{Wt as renderMenuDetailModalCore,Kt as renderMenuItemModalCore};
