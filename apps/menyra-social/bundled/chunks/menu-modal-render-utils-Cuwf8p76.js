import{i as zt,a as Tt}from"../entry/social-app.js";import{t as Dt}from"./domain-app-events-CB7JFizH.js";import"./domain-auth-GDqJX7rW.js";import"./firebase-config-DgqKKOmY.js";import"./vendor-firebase-DSh1wwGb.js";import"./domain-push-BPmJ5TmW.js";import"./startup-route-runtime-context-D7ndoYKY.js";import"./domain-follow-BXoKfGG0.js";import"./domain-notifications-CLcv8atr.js";import"./domain-feed-WLta3AKi.js";import"./domain-public-profile-CfTH3Wt-.js";import"./domain-stories-BKUpSlJE.js";import"./domain-business-accounts-Czo_hlVf.js";import"./domain-leads-DKLm0wNx.js";import"./domain-map-BjqpyoLm.js";const Ft=Object.freeze(["Fruehstueck","Brunch","Vorspeise","Suppe","Salat","Pasta","Pizza","Burger","Sandwich","Wrap","Grill","Fleisch","Fisch","Vegetarisch","Vegan","Beilage","Kinder","Dessert","Kuchen","Eis","Kaffee","Tee","Softdrink","Saft","Smoothie","Bier","Wein","Cocktail","Spirituose","Sonstiges"]);function dt(o){if(o==null)return null;const g=typeof o=="string"?o.trim():o;if(g==="")return null;const I=Number(g);return Number.isFinite(I)?Math.max(0,I):null}function ct(o=""){const g=String(o||"").trim().toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(g)}function ut(o=""){const g=String(o||"").trim();return g?ct(g)?"Produkte":g:""}function Jt({state:o,isShopCatalogProfile:g,getBusinessProfileType:I,getOptimizedImageUrl:q,PLACEHOLDER_IMAGE:Q,isPlaceholderUrl:Y,normalizeMenuType:X,getMenuModalCrop:J,escapeHtml:ee,icon:te}={}){if(!o||!o.menuModal?.open)return"";const me=typeof g=="function"?g:(()=>!1),fe=typeof I=="function"?I:(()=>""),ne=typeof q=="function"?q:(e=>String(e||"")),be=typeof Y=="function"?Y:(()=>!1),ge=typeof X=="function"?X:(e=>String(e||"food")),xe=typeof J=="function"?J:(()=>({x:50,y:50})),r=typeof ee=="function"?ee:(e=>String(e||"")),P=typeof te=="function"?te:(()=>""),he=e=>{const a=Number(e);return Number.isFinite(a)?`${a.toFixed(2).replace(".",",")} EUR`:String(e||"").trim()||"0,00 EUR"},ve=(e,{excludeId:a=""}={})=>{const d=String(a||"").trim(),f=new Set,j=x=>{if(x==null)return;if(Array.isArray(x)){x.forEach(j);return}const ue=typeof x=="object"?x.id||x.itemId||x.productId||x.menuItemId||"":x,R=String(ue||"").trim();R&&R.split(",").forEach(pe=>{const B=String(pe||"").trim();!B||B===d||f.has(B)||f.add(B)})};return j(e),Array.from(f)},s=o.menuModal.item||{},oe=o.menuModal.mode==="edit",p=me(o.userProfile),we=oe?"Produkt bearbeiten":"Produkt hinzufuegen",ye=Array.isArray(o.menuModal.existingImages)?o.menuModal.existingImages:[],se=Array.isArray(o.menuModal.imagePreviews)?o.menuModal.imagePreviews:[],ke=String(o.menuModal.imageUrlDraft||"").trim(),z=[...ye.map((e,a)=>({src:e,kind:"existing",idx:a})),...se.map((e,a)=>({src:e,kind:"new",idx:a}))].filter(e=>e.src),le=z[0]?.src||ke||s.imageUrl||"",ae=le?ne(le,"large"):Q,$e=be(ae)?Q:ae,T=ge(s.type||"food"),Le=T==="food"||T==="drink",ie=s.available!==!1?"available":"unavailable",Be=o.menuModal.status||"",Ve=Array.isArray(s.sizes)?s.sizes.join(", "):"",Ne=Array.isArray(s.colors)?s.colors.join(", "):"",Se=dt(s.stock),Ke=Se===null?"":String(Se),k=xe(),We=String(fe(o.userProfile)||"").trim().toLowerCase(),K=!p&&zt(We),C=(()=>{const e=o?.userProfile?.specialEnabled;if(typeof e=="boolean")return e;const a=String(o?.userProfile?.restaurantId||"").trim();return a?(Array.isArray(o?.restaurants)?o.restaurants.find(f=>String(f?.id||"").trim()===a):null)?.specialEnabled===!0:!1})(),D=Tt(s.cardStyle||"",T),i=D==="testfirst_special"||String(s.category||"").trim().toLowerCase()==="special",Ee=K&&!i&&D==="testfirst_drink",re=(e=>{const a=Number(e);return Number.isFinite(a)?a<=33?"left":a>=67?"right":"center":"center"})(k.x),Ie=String(s.category||(p?"Produkte":"Sonstiges")).trim()||(p?"Produkte":"Sonstiges"),Ce=p?ut(Ie):Ie,t=e=>String(e||"").trim().toLowerCase()==="special",u=Array.from(new Set([Ce,...Array.isArray(o.menu?.items)?o.menu.items.map(e=>String(e?.category||"").trim()):[],...p?["Produkte"]:Ft].filter(e=>!(!e||p&&ct(e)||!C&&t(e))))),l="menuItemCategoryOptions",w=String(s.specialSize||s.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default",$=String(s.specialActionType||s.actionType||"").trim().toLowerCase()==="link"?"link":"product",A=String(s.specialActionUrl||s.linkUrl||s.actionUrl||"").trim(),Oe=String(s.specialActionProductId||s.targetProductId||"").trim(),F=String(s.ingredients||s.ingredient||s.inhaltsstoffe||"").trim(),Ae=String(s.woltUrl||s.woltLink||"").trim(),S=String(s.id||"").trim(),je=(e,a=0)=>{const d=Number(e);return Number.isFinite(d)?Math.max(0,Math.floor(d)):Math.max(0,Number(a)||0)},W=Array.isArray(o.menu?.items)?o.menu.items.slice().map((e,a)=>({entry:e,idx:a,order:je(e?.orderIndex,a)})).sort((e,a)=>e.order-a.order||e.idx-a.idx).map(e=>e.entry):[],U=W.filter(e=>String(e?.id||"").trim()!==S),E=W.findIndex(e=>String(e?.id||"").trim()===S),m=Math.max(1,U.length+1),Pe=E>=0?Math.min(m,Math.max(1,E+1)):m,O=Math.min(m,Math.max(1,Number.isFinite(Number(s.orderIndex))?je(s.orderIndex,Pe-1)+1:Pe)),de=Array.isArray(o.menu?.items)?o.menu.items.filter(e=>{const a=String(e?.id||"").trim();return!(!a||a===S)}):[],_e=ve(s.crossSellItemIds||s.crossSellIds||s.crossSell||s.crossSelling,{excludeId:S}),_=W.filter(e=>{const a=String(e?.id||"").trim();if(!a||a===S)return!1;const d=String(e?.type||"").trim().toLowerCase(),f=String(e?.menuSection||"").trim().toLowerCase();return d==="food"||d==="drink"||f==="food"||f==="drink"}),G=`
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${oe?"Bearbeiten":"Neu"}</span>
        <h3 id="menuModalTitle" class="text-xl font-black italic tracking-tighter">${we}</h3>
      </div>
      <button id="menuModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${P("x","w-4 h-4")}
      </button>
    </div>
  `,M=`
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="menuItemImageInput" class="hidden" accept="image/*" multiple />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="menuItemHeroPreview" src="${r($e)}" class="w-full h-52 object-cover" style="object-position:${k.x}% ${k.y}%;" />
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
          <span id="menuCropXValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${k.x}%</span>
        </div>
        <input id="menuItemCropX" type="range" min="0" max="100" step="1" value="${k.x}" class="w-full accent-indigo-600" />
        <div id="menuSmallCardCropControl" class="${Ee?"":"hidden"} space-y-2">
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
          <span id="menuCropYValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${k.y}%</span>
        </div>
        <input id="menuItemCropY" type="range" min="0" max="100" step="1" value="${k.y}" class="w-full accent-indigo-600" />
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
          <input id="menuItemName" type="text" value="${r(s.name||"")}" placeholder="Produktname" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis</label>
            <input id="menuItemPrice" type="text" value="${r(s.price??"")}" placeholder="z.B. 4.50" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Kategorie</label>
            <input id="menuItemCategory" list="${l}" type="text" value="${r(Ce)}" placeholder="Kategorie eingeben" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <datalist id="${l}">
              ${u.map(e=>`<option value="${r(e)}"></option>`).join("")}
            </datalist>
          </div>
        </div>
        ${p?`
          <input id="menuItemType" type="hidden" value="food" />
        `:`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
            <select id="menuItemType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="food" ${T==="food"?"selected":""}>Speise</option>
              <option value="drink" ${T==="drink"?"selected":""}>Getraenk</option>
            </select>
          </div>
        `}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
          <select id="menuItemVisibility" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="available" ${ie==="available"?"selected":""}>Verfuegbar</option>
            <option value="unavailable" ${ie==="unavailable"?"selected":""}>Ausverkauft</option>
          </select>
        </div>
        ${C&&K&&i?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Position im aktiven Menue</label>
            <select id="menuItemOrderPosition" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              ${Array.from({length:m},(e,a)=>{const d=a+1,f=U[d-1]||null,j=d>1?U[d-2]:null,x=d===1?"Ganz oben":d===m?"Ganz unten":`Nach ${String(j?.name||"Produkt").trim()||"Produkt"}`,ue=f?` (vor ${String(f?.name||"Produkt").trim()||"Produkt"})`:"";return`<option value="${d}" ${O===d?"selected":""}>Position ${d}: ${r(x)}${r(ue)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Einfach auswaehlen statt Drag and Drop.</p>
          </div>
        `:""}
        ${K&&!i?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Card Style</label>
            <select id="menuItemCardStyle" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="testfirst_drink" ${D==="testfirst_drink"?"selected":""}>Small = Drink Card</option>
              <option value="testfirst_food" ${D==="testfirst_food"?"selected":""}>Big = Food Card</option>
            </select>
          </div>
        `:""}
        ${C&&K&&i?`
          <input id="menuItemCardStyle" type="hidden" value="testfirst_special" />
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Groesse</label>
            <select id="menuItemSpecialSize" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="default" ${w==="default"?"selected":""}>Normal</option>
              <option value="food" ${w==="food"?"selected":""}>Food-Card Groesse</option>
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Nur relevant fuer Special-Card.</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Klick-Aktion</label>
            <select id="menuItemSpecialActionType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="product" ${$==="product"?"selected":""}>Produkt-Modal oeffnen</option>
              <option value="link" ${$==="link"?"selected":""}>Weiterleitung / Link oeffnen</option>
            </select>
          </div>
          <div id="menuItemSpecialActionProductField" class="${$==="product"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Ziel-Produkt</label>
            <select id="menuItemSpecialActionProductId" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="">Kein Produkt</option>
              ${de.map(e=>{const a=String(e?.id||"").trim(),d=String(e?.name||"Produkt").trim()||"Produkt";return`<option value="${r(a)}" ${Oe===a?"selected":""}>${r(d)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird genutzt, wenn Klick-Aktion = Produkt-Modal.</p>
          </div>
          <div id="menuItemSpecialActionLinkField" class="${$==="link"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Link</label>
            <input id="menuItemSpecialActionUrl" type="text" value="${r(A)}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird genutzt, wenn Klick-Aktion = Link.</p>
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Beschreibung</label>
          <textarea id="menuItemDesc" rows="3" placeholder="Beschreibung..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${r(s.description||"")}</textarea>
        </div>
        ${p?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Inhaltsstoffe</label>
            <textarea id="menuItemIngredients" rows="3" placeholder="z.B. Wasser, Zucker, Salz..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${r(F)}</textarea>
          </div>
        `}
        ${p?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Wolt Link</label>
            <input id="menuItemWoltUrl" type="url" value="${r(Ae)}" placeholder="https://wolt.com/..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Optional: wird im Produkt-Drawer angezeigt, wenn kein QR-Menuezugang aktiv ist.</p>
          </div>
        `}
        ${p?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Details</label>
            <textarea id="menuItemLongDesc" rows="4" placeholder="Material, Zustand, Lieferdetails..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${r(s.longDescription||"")}</textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Marke</label>
              <input id="menuItemBrand" type="text" value="${r(s.brand||"")}" placeholder="z.B. Nike" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">SKU</label>
              <input id="menuItemSku" type="text" value="${r(s.sku||"")}" placeholder="ART-001" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
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
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">${p?"Hinweise":"Allergene"}</label>
          <input id="menuItemAllergens" type="text" value="${r(s.allergens||"")}" placeholder="${p?"z.B. limitierte Edition, ohne Rueckgabe":"z.B. Milch, Gluten"}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        ${!p&&Le?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cross Selling (QR)</label>
            <div class="mt-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 max-h-48 overflow-y-auto no-scrollbar space-y-2">
              ${_.length?_.map(e=>{const a=String(e?.id||"").trim(),d=String(e?.name||"Produkt").trim()||"Produkt",f=String(e?.category||"").trim(),j=he(e?.price);return`
                  <label class="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                    <input type="checkbox" data-menu-cross-sell-option value="${r(a)}" ${_e.includes(a)?"checked":""} class="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" />
                    <span class="min-w-0 flex-1">
                      <span class="block text-xs font-black text-slate-800 truncate">${r(d)}</span>
                      <span class="block text-[10px] font-bold uppercase tracking-wide text-slate-400">${r(f||"Produkt")} · ${r(j)}</span>
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
      <button id="menuModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${o.menuModal.loading?"disabled":""}>
        ${o.menuModal.loading?"Speichern...":"Speichern"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${r(Be)}</div>
    </div>
  `;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="menuModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          ${G}
          ${M}
          ${L}
        </div>
      </div>
    </div>
  `}function en({state:o,getMenuItemImages:g,getOptimizedImageUrl:I,isPlaceholderUrl:q,PLACEHOLDER_IMAGE:Q,getFirebaseStorageUrl:Y,isDirectImageUrl:X,formatPrice:J,getMenuDetailRestaurantId:ee,getMenuDetailCatalogProfile:te,isShopCatalogProfile:me,normalizeMenuType:fe,canAddToShopCart:ne,getMenuItemSocialId:be,menuItemMetaKey:ge,ensureMenuItemMeta:xe,resolveMenuItemCounts:r,currentUserBadge:P,ensureCommentShape:he,getCartCountForRestaurant:ve,renderMenuDetailComments:s,formatCount:oe,getMenuItemObjectPosition:p,escapeHtml:we,icon:ye}={}){if(!o||!o.menuDetail?.open||!o.menuDetail?.item)return"";const se=typeof g=="function"?g:(()=>[]),ke=typeof I=="function"?I:(n=>String(n||"")),z=typeof q=="function"?q:(()=>!1),le=typeof Y=="function"?Y:(n=>String(n||"")),ae=typeof X=="function"?X:(()=>!1),$e=typeof J=="function"?J:(n=>String(n||"")),T=typeof ee=="function"?ee:(()=>""),Le=typeof te=="function"?te:(()=>null),Xe=typeof me=="function"?me:(()=>!1),ie=typeof fe=="function"?fe:(n=>String(n||"food")),Be=typeof ne=="function"?ne:(()=>!1),Ve=typeof be=="function"?be:(()=>""),Ne=typeof ge=="function"?ge:(()=>""),Se=typeof xe=="function"?xe:(()=>({likes:[],comments:[],counts:{likes:0,comments:0}})),Ke=typeof r=="function"?r:(()=>({likes:0,comments:0})),k=typeof P=="function"?P:(()=>({uid:"",handle:""})),We=typeof he=="function"?he:(n=>n),K=typeof ve=="function"?ve:(()=>0),Ue=typeof s=="function"?s:(()=>""),C=typeof oe=="function"?oe:(n=>String(n||"0")),D=typeof p=="function"?p:(()=>"50% 50%"),i=(n,c=n,v={})=>Dt(n,{fallback:c,params:v}),Ee=(n="")=>{const c=String(n||"").trim();return c?/^(https?:\/\/|mailto:|tel:)/i.test(c)?c:`https://${c.replace(/^\/+/,"")}`:""},Je=(n,{excludeId:c=""}={})=>{const v=String(c||"").trim(),y=new Set,b=h=>{if(h==null)return;if(Array.isArray(h)){h.forEach(b);return}const Fe=typeof h=="object"?h.id||h.itemId||h.productId||h.menuItemId||"":h,Me=String(Fe||"").trim();Me&&Me.split(",").forEach(Ye=>{const N=String(Ye||"").trim();!N||N===v||y.has(N)||y.add(N)})};return b(n),Array.from(y)},re=(n,c=[])=>{const v=String(n||"").trim();if(!v)return null;const y=Array.isArray(o?.menu?.items)?o.menu.items.find(b=>String(b?.id||"").trim()===v):null;return y||Array.isArray(c)&&c.find(b=>String(b?.id||b?.itemId||b?.productId||b?.menuItemId||"").trim()===v)||null},Ie=(n={},c=0,{showAdd:v=!1}={})=>{const b=(Array.isArray(se(n))?se(n):[])[0]||n.imageUrl||n.image||"",h=ke(b,"thumb"),Fe=z(h)?Q:h,Me=le(b),Ye=ae(b)&&b!==Fe?b:Me,N=String(n.name||`Empfehlung ${c+1}`).trim()||`Empfehlung ${c+1}`,jt=String(n.category||"Passt dazu").trim()||"Passt dazu",Pt=$e(n.price,n);return`
      <div class="group shrink-0 rounded-[1.8rem] border border-slate-100 bg-white p-2.5 text-left transition-all" style="width:132px;min-width:132px;max-width:132px;flex:0 0 132px;">
        <div class="relative overflow-hidden rounded-[1.2rem] bg-slate-100 mx-auto" style="width:92px;height:92px;">
          <img src="${t(Fe)}" data-fallback-src="${t(Ye)}" data-image-reveal="menu" alt="${t(N)}" class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" fetchpriority="low" decoding="async" />
        </div>
        <div class="pt-3 px-1">
          <div class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${t(jt)}</div>
          <div class="mt-1 text-sm font-black tracking-tight text-slate-900 line-clamp-2">${t(N)}</div>
          <div class="mt-3 flex items-center justify-between gap-3">
            <span class="text-sm font-black text-slate-900">${t(Pt)}</span>
            ${v?`
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-900 text-white">
                ${u("plus","w-4 h-4")}
              </span>
            `:""}
          </div>
        </div>
      </div>
    `},Ce=(n=[],{showAdd:c=!1}={})=>n.length?`
      <section class="space-y-3">
        <div class="flex items-end justify-between gap-3">
          <div>
            <h4 class="text-base font-black tracking-tight text-slate-900">Passt perfekt dazu</h4>
          </div>
          <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">${n.length} Vorschlaege</div>
        </div>
        <div class="overflow-x-auto no-scrollbar">
          <div class="flex gap-3 pb-1">
            ${n.map((v,y)=>Ie(v,y,{showAdd:c})).join("")}
          </div>
        </div>
      </section>
    `:"",t=typeof we=="function"?we:(n=>String(n||"")),u=typeof ye=="function"?ye:(()=>""),l=o.menuDetail.item,w=se(l),et=w.length?w.length-1:0,$=Math.max(0,Math.min(o.menuDetail.index||0,et)),A=T(l),Oe=l?.id?`menu-detail:${String(A||"")}:${String(l.id)}:${$}`:"",F=w[$]||"",Ae=ke(F,"large",{stableKey:Oe,variantGroup:"menu-detail"}),S=z(Ae)?Q:Ae,je=le(F),W=ae(F)&&F!==S?F:je,U=$e(l.price,l),E=Le(l),m=Xe(E),Pe=m?i("menu.product","Produkt"):ie(l.type)==="drink"?i("menu.drinkItem","Getraenk"):i("menu.foodItem","Speise"),O=m?ut(l.category):l.category||"",de=l.longDescription||l.description||"",_e=String(l.ingredients||l.ingredient||l.inhaltsstoffe||"").trim(),_=l.allergens||"",ce=String(l.brand||"").trim(),G=String(l.sku||"").trim(),M=Array.isArray(l.sizes)?l.sizes:[],L=Array.isArray(l.colors)?l.colors:[],tt=dt(l.stock),e=String(ie(l.type||"")||"").trim().toLowerCase(),a=e==="food"||e==="drink",d=m?l.available===!1||tt===0:l.available===!1,f=M.length?String(o.menuDetail.selectedSize||M[0]).trim()||String(M[0]):"",j=L.length?String(o.menuDetail.selectedColor||L[0]).trim()||String(L[0]):"",x=String(o.profileView?.menuAccessSource||"").trim().toLowerCase(),ue=String(o.profileTopTab||"").trim().toLowerCase()==="menu",R=!m&&a&&ue&&x==="qr",pe=m?Be(E):R,B=Ee(l.woltUrl||l.woltLink||""),H=!m&&a&&!R&&!!B,Ge=!m&&a&&!R&&!H,pt=!!pe,mt=Je(l.crossSellItemIds||l.crossSellIds||l.crossSell||l.crossSelling,{excludeId:l.id}),nt=Array.isArray(l.crossSell)?l.crossSell:[],ot=mt.map(n=>re(n,nt)).filter(Boolean),st=ot.length?ot:nt.filter(Boolean),ze=Ve(l),lt=Ne(A,ze),Re=lt?Se(lt):{likes:[],comments:[],counts:{likes:0,comments:0}},Z=Ke(Re),at=k(),Te=Re.likes?.some(n=>n.uid===at.uid||n.handle===at.handle),ft=(Array.isArray(o.favoriteMenuItems?.items)?o.favoriteMenuItems.items:[]).some(n=>{if(!n||typeof n!="object")return!1;const c=String(n.restaurantId||"").trim();if(A&&c&&c!==A)return!1;const v=[n.itemId,n.menuSocialId,n.menuItemId,n.id].map(y=>String(y||"").trim()).filter(Boolean);return!!ze&&v.includes(ze)}),it=(Re.comments||[]).map(We),V=!!A&&!!ze&&!!o.user,bt=!!String(o.user?.uid||"").trim(),gt="menuDetailTitle",He=m?K(A||E?.restaurantId||""):0,rt=(String(o.menuDetail.footerView||"cart").trim().toLowerCase()==="comment"?"comment":"cart")==="comment",Ze=i("menu.noInfo","Keine Informationen, bitte an das Lokal oder den Kellner wenden."),xt=String(de||"").trim()||Ze,ht=_e||Ze,vt=String(_||"").trim()||Ze,qe=String(o.menuDetail?.infoTab||"info").trim().toLowerCase(),De=qe==="ingredients"||qe==="allergens"?qe:"info",Qe=n=>["h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer select-none",De===n?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"].join(" "),wt=m?`
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-3 px-7 pt-7 pb-4 border-b border-slate-100 bg-white">
        <div class="flex items-center gap-2 min-w-0">
          <button type="button" id="menuDetailHeaderCartBtn" class="inline-flex items-center gap-2 px-4 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black shadow-sm active:scale-95 ${pe&&!d?"":"opacity-50 pointer-events-none"}">
            ${u("shopping-cart","w-4 h-4")}
            <span>${t(i("menu.addToCart","In den Warenkorb"))}</span>
            ${He?`<span class="inline-flex min-w-[20px] h-5 px-1.5 rounded-full bg-white/14 border border-white/20 text-white text-[9px] font-black items-center justify-center leading-none">${He>99?"99+":He}</span>`:""}
          </button>
          ${bt?`
            <button type="button" id="menuDetailHeaderFavoritesBtn" aria-label="${t(i("menu.favorite","Favoriten"))}" title="${t(i("menu.favorite","Favoriten"))}" class="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-95 ${ft?"bg-slate-900 text-white border-slate-900":"bg-slate-100 text-slate-700 border-slate-200"}">
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
            <h3 id="${gt}" class="text-[1.05rem] leading-tight font-black tracking-tight text-slate-900 truncate">${t(l.name||i("menu.product","Produkt"))}</h3>
            ${O?`<div class="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${t(O)}</div>`:""}
          </div>
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${u("x","w-4 h-4")}
        </button>
      </div>
    `,yt=m?`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 space-y-5 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div class="modal-handoff-hero relative rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y; aspect-ratio:4 / 5;">
          <img id="menuDetailHeroImage" src="${t(S)}" data-fallback-src="${t(W)}" class="absolute inset-0 w-full h-full object-cover" style="object-position:${D(l)};" loading="eager" fetchpriority="high" decoding="sync" />
          ${w.length>1?`
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${u("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${u("chevron-right","w-4 h-4")}
            </button>
          `:""}
        </div>
        <div class="modal-handoff-chrome">
        ${w.length>1?`
          <div class="flex items-center justify-center gap-2">
            ${w.map((n,c)=>`
              <button type="button" data-menu-gallery-dot="${c}" class="w-2.5 h-2.5 rounded-full ${c===$?"bg-slate-900":"bg-slate-200"}"></button>
            `).join("")}
          </div>
        `:""}
        <div class="flex items-center justify-between">
          <span class="text-lg font-black text-slate-900">${t(U)}</span>
        </div>
        <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          ${O?`<span>${t(O)}</span>`:""}
          <span>${t(Pe)}</span>
        </div>
        ${ce||G?`
          <div class="grid ${ce&&G?"grid-cols-2":"grid-cols-1"} gap-3">
            ${ce?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${t(i("menu.brand","Marke"))}</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${t(ce)}</p></div>`:""}
            ${G?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">SKU</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${t(G)}</p></div>`:""}
          </div>
        `:""}
        ${M.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${t(i("menu.sizes","Groessen"))}</p>
            <select data-menu-detail-variant="size" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${M.map(n=>`<option value="${t(n)}" ${f===String(n)?"selected":""}>${t(n)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${L.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${t(i("menu.colors","Farben"))}</p>
            <select data-menu-detail-variant="color" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${L.map(n=>`<option value="${t(n)}" ${j===String(n)?"selected":""}>${t(n)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${de?`<p class="text-sm text-slate-600 leading-relaxed">${t(de)}</p>`:""}
        ${_?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">${t(i("menu.notes","Hinweise"))}</p>
            <p class="text-sm text-slate-600">${t(_)}</p>
          </div>
        `:""}
        <div class="flex items-center justify-between" style="padding-top:1.25rem;">
          <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${Te?"text-rose-500":"text-slate-700"} ${V?"":"opacity-50 pointer-events-none"}">
            ${u("heart","w-3.5 h-3.5")} ${t(Te?i("likes.liked","Gefaellt"):i("likes.like","Like"))}
          </button>
          <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span id="menuDetailLikesCount">${t(C(Z.likes))} ${t(i("likes.count","Likes"))}</span>
            <span id="menuDetailCommentsCount">${t(C(Z.comments))} ${t(i("comments.count","Kommentare"))}</span>
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
          <img id="menuDetailHeroImage" src="${t(S)}" data-fallback-src="${t(W)}" class="absolute inset-0 w-full h-full object-cover" style="object-position:${D(l)};" loading="eager" fetchpriority="high" decoding="sync" />
          ${w.length>1?`
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${u("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${u("chevron-right","w-4 h-4")}
            </button>
          `:""}
        </div>
        <div class="modal-handoff-chrome">
        ${w.length>1?`
          <div class="flex items-center justify-center gap-2">
            ${w.map((n,c)=>`
              <button type="button" data-menu-gallery-dot="${c}" class="w-2.5 h-2.5 rounded-full ${c===$?"bg-slate-900":"bg-slate-200"}"></button>
            `).join("")}
          </div>
        `:""}
        <div class="mt-6 space-y-5">
          <div class="p-4 rounded-[1.3rem] border border-slate-100 bg-slate-50">
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">${t(i("menu.price","Preis"))}</span>
              <span class="font-black text-slate-900" style="font-size:13px;">${t(U)}</span>
            </div>
          </div>
          <div class="border-t border-slate-100"></div>

          <div class="space-y-3">
            <div class="menu-detail-info-tabs space-y-4">
              <div class="grid grid-cols-3 gap-2 menu-detail-info-controls">
                <button type="button" data-menu-detail-info-tab="info" class="${Qe("info")}">${t(i("menu.info","Info"))}</button>
                <button type="button" data-menu-detail-info-tab="ingredients" class="${Qe("ingredients")}">${t(i("menu.ingredients","Inhaltsstoffe"))}</button>
                <button type="button" data-menu-detail-info-tab="allergens" class="${Qe("allergens")}">${t(i("menu.allergens","Allergene"))}</button>
              </div>
              <div class="menu-detail-info-panels rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-3.5">
                <p data-menu-detail-info-panel="info" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${De==="info"?"":"hidden"}">${t(xt)}</p>
                <p data-menu-detail-info-panel="ingredients" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${De==="ingredients"?"":"hidden"}">${t(ht)}</p>
                <p data-menu-detail-info-panel="allergens" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${De==="allergens"?"":"hidden"}">${t(vt)}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100"></div>
          ${st.length?`<div class="pt-1">${Ce(st,{showAdd:pt})}</div><div class="border-t border-slate-100"></div>`:""}

          <div class="flex items-center justify-between" style="padding-top:1.25rem;">
            <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${Te?"text-rose-500":"text-slate-700"} ${V?"":"opacity-50 pointer-events-none"}">
              ${u("heart","w-3.5 h-3.5")} ${t(Te?i("likes.liked","Gefaellt"):i("likes.like","Like"))}
            </button>
            <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span id="menuDetailLikesCount">${t(C(Z.likes))} ${t(i("likes.count","Likes"))}</span>
              <span id="menuDetailCommentsCount">${t(C(Z.comments))} ${t(i("comments.count","Kommentare"))}</span>
            </div>
          </div>
        </div>

        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${Ue(it)}
        </div>
        </div>
      </div>
    `,kt=H?`
      <button type="button" id="menuDetailWoltBtn" data-wolt-url="${t(B)}" class="flex-1 h-[52px] rounded-[1.65rem] text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm" style="background-color:#18b9df;" title="${t(i("menu.openWolt","Bei Wolt oeffnen"))}">
        <span class="font-bold text-sm">Wolt</span>
        ${u("external-link","w-4 h-4")}
      </button>
    `:Ge?`
        <button id="menuDetailFavoriteCtaBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all">
          <span class="font-bold text-sm">${t(i("menu.toFavorites","Zu Favoriten"))}</span>
          ${u("bookmark","w-4 h-4")}
        </button>
      `:`
        <button id="menuDetailAddToCartBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all ${pe&&!d?"":"opacity-50 pointer-events-none"}">
          <span class="font-bold text-sm">${t(d?i("menu.soldOut","Ausverkauft"):i("menu.addToCart","In den Warenkorb"))}</span>
          ${u("shopping-bag","w-4 h-4")}
        </button>
      `,$t=H?i("menu.backToWolt","Zurueck zu Wolt"):Ge?i("menu.backToFavorites","Zurueck zu Favoriten"):i("menu.backToCart","Zurueck zum Warenkorb"),St=H?"text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200",It=H?'style="background-color:#18b9df;"':"",Ct=H?`
      <span class="w-5 h-5 inline-flex items-center justify-center text-white leading-none select-none" aria-hidden="true">
        <span class="block" style="font-family:'Omnes','Plus Jakarta Sans','Segoe UI',sans-serif;font-size:20px;font-weight:800;font-style:italic;line-height:1;transform:translateY(-1px);">
          w
        </span>
      </span>
    `:u(Ge?"bookmark":"shopping-bag","w-5 h-5"),At=`
    <div class="modal-handoff-chrome px-7 pb-6 pt-4 border-t border-slate-100 bg-white/98 backdrop-blur-sm modal-footer-safe relative z-10">
      <div id="footer-cart-view" class="flex gap-3 items-center w-full transition-all duration-300 ${rt?"hidden opacity-0":""}">
        <button type="button" id="menuDetailFooterCommentToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 relative" title="${t(i("menu.commentAction","Kommentare verfassen"))}">
          ${u("message-square","w-5 h-5")}
          ${Z.comments>0?`<span id="menuDetailFooterCommentsBadge" class="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">${Z.comments}</span>`:""}
        </button>
        ${kt}
      </div>

      <div id="footer-comment-view" class="flex gap-3 items-center w-full transition-all duration-300 ${rt?"":"hidden opacity-0"}">
        <button type="button" id="menuDetailFooterCartToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] ${St} flex items-center justify-center transition-all active:scale-95" ${It} title="${$t}">
          ${Ct}
        </button>

        <div class="flex-1 flex gap-2">
          <textarea id="menuDetailCommentInput" placeholder="${t(V?i("menu.commentPlaceholder","Schreib einen Kommentar..."):i("menu.loginRequired","Bitte einloggen"))}" class="flex-1 px-5 py-3.5 rounded-[1.65rem] border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none leading-relaxed ${V?"":"opacity-60"}" rows="1" ${V?"":"disabled"}>${t(o.menuDetail.commentText||"")}</textarea>
          <button id="menuDetailCommentSend" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-indigo-600 text-white flex items-center justify-center ${V?"":"opacity-60 cursor-not-allowed"}" ${V?"":"disabled"}>
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
          ${wt}
          ${yt}
          ${At}
        </div>
      </div>
    </div>
  `}export{en as renderMenuDetailModalCore,Jt as renderMenuItemModalCore};
