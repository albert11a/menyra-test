import{i as bt,a as Vt,b as Lt}from"../entry/social-app.js";import{t as Bt}from"./domain-app-events-rkgdN7NR.js";import"./domain-auth-GDqJX7rW.js";import"./firebase-config-DgqKKOmY.js";import"./vendor-firebase-DSh1wwGb.js";import"./domain-push-BPmJ5TmW.js";import"./startup-route-runtime-context-D7ndoYKY.js";import"./domain-follow-BXoKfGG0.js";import"./domain-notifications-CLcv8atr.js";import"./domain-feed-Ul-n5cS_.js";import"./domain-public-profile-BW4dw-Ab.js";import"./domain-stories-Bn5yWiQS.js";import"./domain-business-accounts-Czo_hlVf.js";import"./domain-leads-DKLm0wNx.js";import"./domain-map-BjqpyoLm.js";const Ut=Object.freeze(["Fruehstueck","Brunch","Vorspeise","Suppe","Salat","Pasta","Pizza","Burger","Sandwich","Wrap","Grill","Fleisch","Fisch","Vegetarisch","Vegan","Beilage","Kinder","Dessert","Kuchen","Eis","Kaffee","Tee","Softdrink","Saft","Smoothie","Bier","Wein","Cocktail","Spirituose","Sonstiges"]);function gt(o){if(o==null)return null;const g=typeof o=="string"?o.trim():o;if(g==="")return null;const j=Number(g);return Number.isFinite(j)?Math.max(0,j):null}function xt(o=""){const g=String(o||"").trim().toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(g)}function vt(o=""){const g=String(o||"").trim();return g?xt(g)?"Produkte":g:""}function sn({state:o,isShopCatalogProfile:g,getBusinessProfileType:j,getOptimizedImageUrl:J,PLACEHOLDER_IMAGE:ee,isPlaceholderUrl:te,normalizeMenuType:ne,getMenuModalCrop:oe,escapeHtml:se,icon:le}={}){if(!o||!o.menuModal?.open)return"";const fe=typeof g=="function"?g:(()=>!1),be=typeof j=="function"?j:(()=>""),K=typeof J=="function"?J:(e=>String(e||"")),ge=typeof te=="function"?te:(()=>!1),xe=typeof ne=="function"?ne:(e=>String(e||"food")),ve=typeof oe=="function"?oe:(()=>({x:50,y:50})),r=typeof se=="function"?se:(e=>String(e||"")),P=typeof le=="function"?le:(()=>""),he=e=>{const i=Number(e);return Number.isFinite(i)?`${i.toFixed(2).replace(".",",")} EUR`:String(e||"").trim()||"0,00 EUR"},we=(e,{excludeId:i=""}={})=>{const c=String(i||"").trim(),p=new Set,$=f=>{if(f==null)return;if(Array.isArray(f)){f.forEach($);return}const S=typeof f=="object"?f.id||f.itemId||f.productId||f.menuItemId||"":f,Q=String(S||"").trim();Q&&Q.split(",").forEach(qe=>{const Y=String(qe||"").trim();!Y||Y===c||p.has(Y)||p.add(Y)})};return $(e),Array.from(p)},l=o.menuModal.item||{},ie=o.menuModal.mode==="edit",m=fe(o.userProfile),ye=ie?"Produkt bearbeiten":"Produkt hinzufuegen",ke=Array.isArray(o.menuModal.existingImages)?o.menuModal.existingImages:[],W=Array.isArray(o.menuModal.imagePreviews)?o.menuModal.imagePreviews:[],ae=String(o.menuModal.imageUrlDraft||"").trim(),M=[...ke.map((e,i)=>({src:e,kind:"existing",idx:i})),...W.map((e,i)=>({src:e,kind:"new",idx:i}))].filter(e=>e.src),re=M[0]?.src||ae||l.imageUrl||"",de=re?K(re,"large"):ee,$e=ge(de)?ee:de,Se=String(o.menuModal.videoPreview||"").trim(),He=String(o.menuModal.videoPosterPreview||"").trim(),E=!!(o.menuModal.videoFile&&Se),Ie=W.length>0,ce=bt(l)&&!Ie&&!E,Ce=E||ce,_e=E?Se:ce?String(l.videoUrl||"").trim():"",Ae=E?He:ce?K(String(l.posterUrl||l.imageUrl||"").trim(),"large"):"",F=xe(l.type||"food"),Ge=F==="food"||F==="drink",je=l.available!==!1?"available":"unavailable",Pe=o.menuModal.status||"",O=Array.isArray(l.sizes)?l.sizes.join(", "):"",ze=Array.isArray(l.colors)?l.colors.join(", "):"",a=gt(l.stock),Re=a===null?"":String(a),w=ve(),Ze=String(be(o.userProfile)||"").trim().toLowerCase(),H=!m&&Vt(Ze),n=(()=>{const e=o?.userProfile?.specialEnabled;if(typeof e=="boolean")return e;const i=String(o?.userProfile?.restaurantId||"").trim();return i?(Array.isArray(o?.restaurants)?o.restaurants.find(p=>String(p?.id||"").trim()===i):null)?.specialEnabled===!0:!1})(),u=Lt(l.cardStyle||"",F),s=u==="testfirst_special"||String(l.category||"").trim().toLowerCase()==="special",y=H&&!s&&u==="testfirst_drink",I=(e=>{const i=Number(e);return Number.isFinite(i)?i<=33?"left":i>=67?"right":"center":"center"})(w.x),C=String(l.category||(m?"Produkte":"Sonstiges")).trim()||(m?"Produkte":"Sonstiges"),Te=m?vt(C):C,V=e=>String(e||"").trim().toLowerCase()==="special",De=Array.from(new Set([Te,...Array.isArray(o.menu?.items)?o.menu.items.map(e=>String(e?.category||"").trim()):[],...m?["Produkte"]:Ut].filter(e=>!(!e||m&&xt(e)||!n&&V(e))))),_="menuItemCategoryOptions",Me=String(l.specialSize||l.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default",z=String(l.specialActionType||l.actionType||"").trim().toLowerCase()==="link"?"link":"product",Fe=String(l.specialActionUrl||l.linkUrl||l.actionUrl||"").trim(),Ve=String(l.specialActionProductId||l.targetProductId||"").trim(),Le=String(l.ingredients||l.ingredient||l.inhaltsstoffe||"").trim(),Be=String(l.woltUrl||l.woltLink||"").trim(),A=String(l.id||"").trim(),v=(e,i=0)=>{const c=Number(e);return Number.isFinite(c)?Math.max(0,Math.floor(c)):Math.max(0,Number(i)||0)},ue=Array.isArray(o.menu?.items)?o.menu.items.slice().map((e,i)=>({entry:e,idx:i,order:v(e?.orderIndex,i)})).sort((e,i)=>e.order-i.order||e.idx-i.idx).map(e=>e.entry):[],T=ue.filter(e=>String(e?.id||"").trim()!==A),G=ue.findIndex(e=>String(e?.id||"").trim()===A),L=Math.max(1,T.length+1),R=G>=0?Math.min(L,Math.max(1,G+1)):L,Z=Math.min(L,Math.max(1,Number.isFinite(Number(l.orderIndex))?v(l.orderIndex,R-1)+1:R)),q=Array.isArray(o.menu?.items)?o.menu.items.filter(e=>{const i=String(e?.id||"").trim();return!(!i||i===A)}):[],B=we(l.crossSellItemIds||l.crossSellIds||l.crossSell||l.crossSelling,{excludeId:A}),D=ue.filter(e=>{const i=String(e?.id||"").trim();if(!i||i===A)return!1;const c=String(e?.type||"").trim().toLowerCase(),p=String(e?.menuSection||"").trim().toLowerCase();return c==="food"||c==="drink"||p==="food"||p==="drink"}),Ue=`
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${ie?"Bearbeiten":"Neu"}</span>
        <h3 id="menuModalTitle" class="text-xl font-black italic tracking-tighter">${ye}</h3>
      </div>
      <button id="menuModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${P("x","w-4 h-4")}
      </button>
    </div>
  `,pe=`
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="menuItemImageInput" class="hidden" accept="image/*,video/*" multiple />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${Ce?`
          <video id="menuItemHeroVideo" src="${r(_e)}" ${Ae?`poster="${r(Ae)}"`:""} class="w-full h-52 object-cover" style="object-position:${w.x}% ${w.y}%;" controls muted loop playsinline autoplay preload="metadata"></video>
          <span class="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
            ${P("play","w-3 h-3")} Video
          </span>
        `:`
          <img id="menuItemHeroPreview" src="${r($e)}" class="w-full h-52 object-cover" style="object-position:${w.x}% ${w.y}%;" />
        `}
        <button type="button" id="menuItemImageTrigger" aria-label="Foto oder Video hochladen" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${P("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${P("plus","w-2.5 h-2.5")}
          </span>
        </button>
      </div>
      ${Ce?`
        <button type="button" id="menuItemVideoRemove" class="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">
          Video entfernen
        </button>
      `:""}
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Horizontal</p>
          <span id="menuCropXValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${w.x}%</span>
        </div>
        <input id="menuItemCropX" type="range" min="0" max="100" step="1" value="${w.x}" class="w-full accent-indigo-600" />
        <div id="menuSmallCardCropControl" class="${y?"":"hidden"} space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Small Card Crop</p>
            <span class="text-[10px] font-bold text-slate-400">1:1</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" data-menu-small-crop="left" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${I==="left"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Links</button>
            <button type="button" data-menu-small-crop="center" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${I==="center"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Mitte</button>
            <button type="button" data-menu-small-crop="right" class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${I==="right"?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"}">Rechts</button>
          </div>
          <p class="text-[10px] font-bold text-slate-400 px-1">Nur fuer Small Drink Card (Public Menue).</p>
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
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${M.length}</span>
        </div>
        ${M.length?`
          <div class="grid grid-cols-3 gap-2">
            ${M.map(e=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                <img src="${r(K(e.src,"thumb"))}" class="w-full h-full object-cover" />
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
          <input id="menuItemName" type="text" value="${r(l.name||"")}" placeholder="Produktname" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis</label>
            <input id="menuItemPrice" type="text" value="${r(l.price??"")}" placeholder="z.B. 4.50" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Kategorie</label>
            <input id="menuItemCategory" list="${_}" type="text" value="${r(Te)}" placeholder="Kategorie eingeben" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <datalist id="${_}">
              ${De.map(e=>`<option value="${r(e)}"></option>`).join("")}
            </datalist>
          </div>
        </div>
        ${m?`
          <input id="menuItemType" type="hidden" value="food" />
        `:`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
            <select id="menuItemType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="food" ${F==="food"?"selected":""}>Speise</option>
              <option value="drink" ${F==="drink"?"selected":""}>Getraenk</option>
            </select>
          </div>
        `}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
          <select id="menuItemVisibility" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="available" ${je==="available"?"selected":""}>Verfuegbar</option>
            <option value="unavailable" ${je==="unavailable"?"selected":""}>Ausverkauft</option>
          </select>
        </div>
        ${n&&H&&s?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Position im aktiven Menue</label>
            <select id="menuItemOrderPosition" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              ${Array.from({length:L},(e,i)=>{const c=i+1,p=T[c-1]||null,$=c>1?T[c-2]:null,f=c===1?"Ganz oben":c===L?"Ganz unten":`Nach ${String($?.name||"Produkt").trim()||"Produkt"}`,S=p?` (vor ${String(p?.name||"Produkt").trim()||"Produkt"})`:"";return`<option value="${c}" ${Z===c?"selected":""}>Position ${c}: ${r(f)}${r(S)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Einfach auswaehlen statt Drag and Drop.</p>
          </div>
        `:""}
        ${H&&!s?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Card Style</label>
            <select id="menuItemCardStyle" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="testfirst_drink" ${u==="testfirst_drink"?"selected":""}>Small = Drink Card</option>
              <option value="testfirst_food" ${u==="testfirst_food"?"selected":""}>Big = Food Card</option>
            </select>
          </div>
        `:""}
        ${n&&H&&s?`
          <input id="menuItemCardStyle" type="hidden" value="testfirst_special" />
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Groesse</label>
            <select id="menuItemSpecialSize" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="default" ${Me==="default"?"selected":""}>Normal</option>
              <option value="food" ${Me==="food"?"selected":""}>Food-Card Groesse</option>
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Nur relevant fuer Special-Card.</p>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Klick-Aktion</label>
            <select id="menuItemSpecialActionType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="product" ${z==="product"?"selected":""}>Produkt-Modal oeffnen</option>
              <option value="link" ${z==="link"?"selected":""}>Weiterleitung / Link oeffnen</option>
            </select>
          </div>
          <div id="menuItemSpecialActionProductField" class="${z==="product"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Ziel-Produkt</label>
            <select id="menuItemSpecialActionProductId" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="">Kein Produkt</option>
              ${q.map(e=>{const i=String(e?.id||"").trim(),c=String(e?.name||"Produkt").trim()||"Produkt";return`<option value="${r(i)}" ${Ve===i?"selected":""}>${r(c)}</option>`}).join("")}
            </select>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird genutzt, wenn Klick-Aktion = Produkt-Modal.</p>
          </div>
          <div id="menuItemSpecialActionLinkField" class="${z==="link"?"":"hidden"}">
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Special Link</label>
            <input id="menuItemSpecialActionUrl" type="text" value="${r(Fe)}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird genutzt, wenn Klick-Aktion = Link.</p>
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Beschreibung</label>
          <textarea id="menuItemDesc" rows="3" placeholder="Beschreibung..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${r(l.description||"")}</textarea>
        </div>
        ${m?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Inhaltsstoffe</label>
            <textarea id="menuItemIngredients" rows="3" placeholder="z.B. Wasser, Zucker, Salz..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${r(Le)}</textarea>
          </div>
        `}
        ${m?"":`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Wolt Link</label>
            <input id="menuItemWoltUrl" type="url" value="${r(Be)}" placeholder="https://wolt.com/..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Optional: wird im Produkt-Drawer angezeigt, wenn kein QR-Menuezugang aktiv ist.</p>
          </div>
        `}
        ${m?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Details</label>
            <textarea id="menuItemLongDesc" rows="4" placeholder="Material, Zustand, Lieferdetails..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${r(l.longDescription||"")}</textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Marke</label>
              <input id="menuItemBrand" type="text" value="${r(l.brand||"")}" placeholder="z.B. Nike" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">SKU</label>
              <input id="menuItemSku" type="text" value="${r(l.sku||"")}" placeholder="ART-001" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Groessen</label>
              <input id="menuItemSizes" type="text" value="${r(O)}" placeholder="XS, S, M, L" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Farben</label>
              <input id="menuItemColors" type="text" value="${r(ze)}" placeholder="Schwarz, Weiss" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Lagerbestand</label>
            <input id="menuItemStock" type="number" min="0" inputmode="numeric" value="${r(Re)}" placeholder="0" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        `:""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">${m?"Hinweise":"Allergene"}</label>
          <input id="menuItemAllergens" type="text" value="${r(l.allergens||"")}" placeholder="${m?"z.B. limitierte Edition, ohne Rueckgabe":"z.B. Milch, Gluten"}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        ${!m&&Ge?`
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cross Selling (QR)</label>
            <div class="mt-2 p-3 rounded-2xl border border-slate-200 bg-slate-50 max-h-48 overflow-y-auto no-scrollbar space-y-2">
              ${D.length?D.map(e=>{const i=String(e?.id||"").trim(),c=String(e?.name||"Produkt").trim()||"Produkt",p=String(e?.category||"").trim(),$=he(e?.price);return`
                  <label class="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                    <input type="checkbox" data-menu-cross-sell-option value="${r(i)}" ${B.includes(i)?"checked":""} class="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" />
                    <span class="min-w-0 flex-1">
                      <span class="block text-xs font-black text-slate-800 truncate">${r(c)}</span>
                      <span class="block text-[10px] font-bold uppercase tracking-wide text-slate-400">${r(p||"Produkt")} · ${r($)}</span>
                    </span>
                  </label>
                `}).join(""):'<p class="text-[10px] font-bold uppercase tracking-wide text-slate-400 px-2 py-1">Keine weiteren Speisen/Getraenke verfuegbar</p>'}
            </div>
            <p class="text-[10px] font-bold text-slate-400 mt-2 px-2">Wird nur im Produkt-Drawer gezeigt, wenn das Menue per QR-Code geoeffnet wurde.</p>
          </div>
        `:""}
      </div>
    </div>
  `,me=`
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
      <button id="menuModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${o.menuModal.loading?"disabled":""}>
        ${o.menuModal.loading?"Speichern...":"Speichern"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${r(Pe)}</div>
    </div>
  `;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div id="menuModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100  flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          ${Ue}
          ${pe}
          ${me}
        </div>
      </div>
    </div>
  `}function ln({state:o,getMenuItemImages:g,getOptimizedImageUrl:j,isPlaceholderUrl:J,PLACEHOLDER_IMAGE:ee,getFirebaseStorageUrl:te,isDirectImageUrl:ne,formatPrice:oe,getMenuDetailRestaurantId:se,getMenuDetailCatalogProfile:le,isShopCatalogProfile:fe,normalizeMenuType:be,canAddToShopCart:K,getMenuItemSocialId:ge,menuItemMetaKey:xe,ensureMenuItemMeta:ve,resolveMenuItemCounts:r,currentUserBadge:P,ensureCommentShape:he,getCartCountForRestaurant:we,renderMenuDetailComments:l,formatCount:ie,getMenuItemObjectPosition:m,escapeHtml:ye,icon:ke}={}){if(!o||!o.menuDetail?.open||!o.menuDetail?.item)return"";const W=typeof g=="function"?g:(()=>[]),ae=typeof j=="function"?j:(t=>String(t||"")),M=typeof J=="function"?J:(()=>!1),re=typeof te=="function"?te:(t=>String(t||"")),de=typeof ne=="function"?ne:(()=>!1),$e=typeof oe=="function"?oe:(t=>String(t||"")),Se=typeof se=="function"?se:(()=>""),He=typeof le=="function"?le:(()=>null),E=typeof fe=="function"?fe:(()=>!1),Ie=typeof be=="function"?be:(t=>String(t||"food")),ce=typeof K=="function"?K:(()=>!1),Ce=typeof ge=="function"?ge:(()=>""),_e=typeof xe=="function"?xe:(()=>""),Ae=typeof ve=="function"?ve:(()=>({likes:[],comments:[],counts:{likes:0,comments:0}})),F=typeof r=="function"?r:(()=>({likes:0,comments:0})),Ge=typeof P=="function"?P:(()=>({uid:"",handle:""})),nt=typeof he=="function"?he:(t=>t),je=typeof we=="function"?we:(()=>0),Pe=typeof l=="function"?l:(()=>""),O=typeof ie=="function"?ie:(t=>String(t||"0")),ze=typeof m=="function"?m:(()=>"50% 50%"),a=(t,d=t,h={})=>Bt(t,{fallback:d,params:h}),Re=(t="")=>{const d=String(t||"").trim();return d?/^(https?:\/\/|mailto:|tel:)/i.test(d)?d:`https://${d.replace(/^\/+/,"")}`:""},w=(t,{excludeId:d=""}={})=>{const h=String(d||"").trim(),k=new Set,b=x=>{if(x==null)return;if(Array.isArray(x)){x.forEach(b);return}const Ee=typeof x=="object"?x.id||x.itemId||x.productId||x.menuItemId||"":x,Oe=String(Ee||"").trim();Oe&&Oe.split(",").forEach(tt=>{const N=String(tt||"").trim();!N||N===h||k.has(N)||k.add(N)})};return b(t),Array.from(k)},Ze=(t,d=[])=>{const h=String(t||"").trim();if(!h)return null;const k=Array.isArray(o?.menu?.items)?o.menu.items.find(b=>String(b?.id||"").trim()===h):null;return k||Array.isArray(d)&&d.find(b=>String(b?.id||b?.itemId||b?.productId||b?.menuItemId||"").trim()===h)||null},H=(t={},d=0,{showAdd:h=!1}={})=>{const b=(Array.isArray(W(t))?W(t):[])[0]||t.imageUrl||t.image||"",x=ae(b,"thumb"),Ee=M(x)?ee:x,Oe=re(b),tt=de(b)&&b!==Ee?b:Oe,N=String(t.name||`Empfehlung ${d+1}`).trim()||`Empfehlung ${d+1}`,Mt=String(t.category||"Passt dazu").trim()||"Passt dazu",Ft=$e(t.price,t);return`
      <div class="group shrink-0 rounded-[1.8rem] border border-slate-100 bg-white p-2.5 text-left transition-all" style="width:132px;min-width:132px;max-width:132px;flex:0 0 132px;">
        <div class="relative overflow-hidden rounded-[1.2rem] bg-slate-100 mx-auto" style="width:92px;height:92px;">
          <img src="${n(Ee)}" data-fallback-src="${n(tt)}" data-image-reveal="menu" alt="${n(N)}" class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" fetchpriority="low" decoding="async" />
        </div>
        <div class="pt-3 px-1">
          <div class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${n(Mt)}</div>
          <div class="mt-1 text-sm font-black tracking-tight text-slate-900 line-clamp-2">${n(N)}</div>
          <div class="mt-3 flex items-center justify-between gap-3">
            <span class="text-sm font-black text-slate-900">${n(Ft)}</span>
            ${h?`
              <span class="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-900 text-white">
                ${u("plus","w-4 h-4")}
              </span>
            `:""}
          </div>
        </div>
      </div>
    `},ot=(t=[],{showAdd:d=!1}={})=>t.length?`
      <section class="space-y-3">
        <div class="flex items-end justify-between gap-3">
          <div>
            <h4 class="text-base font-black tracking-tight text-slate-900">Passt perfekt dazu</h4>
          </div>
          <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">${t.length} Vorschlaege</div>
        </div>
        <div class="overflow-x-auto no-scrollbar">
          <div class="flex gap-3 pb-1">
            ${t.map((h,k)=>H(h,k,{showAdd:d})).join("")}
          </div>
        </div>
      </section>
    `:"",n=typeof ye=="function"?ye:(t=>String(t||"")),u=typeof ke=="function"?ke:(()=>""),s=o.menuDetail.item,y=W(s),st=y.length?y.length-1:0,I=Math.max(0,Math.min(o.menuDetail.index||0,st)),C=Se(s),Te=s?.id?`menu-detail:${String(C||"")}:${String(s.id)}:${I}`:"",V=y[I]||"",De=ae(V,"large",{stableKey:Te,variantGroup:"menu-detail"}),_=M(De)?ee:De,Me=re(V),lt=de(V)&&V!==_?V:Me,z=bt(s)&&I===0,Fe=z?String(s.videoUrl||"").trim():"",Ve=z?String(s.posterUrl||"").trim()?ae(String(s.posterUrl).trim(),"large"):_:"",Le=(t="")=>z&&Fe?`<video id="menuDetailHeroVideo" src="${n(Fe)}" ${Ve?`poster="${n(Ve)}"`:""} class="absolute inset-0 w-full h-full object-cover${t?` ${t}`:""}" style="object-position:${ze(s)};" controls playsinline preload="metadata"></video>`:`<img id="menuDetailHeroImage" src="${n(_)}" data-fallback-src="${n(lt)}" class="absolute inset-0 w-full h-full object-cover${t?` ${t}`:""}" style="object-position:${ze(s)};" loading="eager" fetchpriority="high" decoding="sync" />`,Be=$e(s.price,s),A=He(s),v=E(A),ue=v?a("menu.product","Produkt"):Ie(s.type)==="drink"?a("menu.drinkItem","Getraenk"):a("menu.foodItem","Speise"),T=v?vt(s.category):s.category||"",G=s.longDescription||s.description||"",L=String(s.ingredients||s.ingredient||s.inhaltsstoffe||"").trim(),R=s.allergens||"",Z=String(s.brand||"").trim(),q=String(s.sku||"").trim(),B=Array.isArray(s.sizes)?s.sizes:[],D=Array.isArray(s.colors)?s.colors:[],it=gt(s.stock),Ue=String(Ie(s.type||"")||"").trim().toLowerCase(),pe=Ue==="food"||Ue==="drink",me=v?s.available===!1||it===0:s.available===!1,at=B.length?String(o.menuDetail.selectedSize||B[0]).trim()||String(B[0]):"",e=D.length?String(o.menuDetail.selectedColor||D[0]).trim()||String(D[0]):"",i=String(o.profileView?.menuAccessSource||"").trim().toLowerCase(),c=String(o.profileTopTab||"").trim().toLowerCase()==="menu",p=!v&&pe&&c&&i==="qr",$=v?ce(A):p,f=Re(s.woltUrl||s.woltLink||""),S=!v&&pe&&!p&&!!f,Q=!v&&pe&&!p&&!S,qe=!!$,Y=w(s.crossSellItemIds||s.crossSellIds||s.crossSell||s.crossSelling,{excludeId:s.id}),rt=Array.isArray(s.crossSell)?s.crossSell:[],dt=Y.map(t=>Ze(t,rt)).filter(Boolean),ct=dt.length?dt:rt.filter(Boolean),Ne=Ce(s),ut=_e(C,Ne),Qe=ut?Ae(ut):{likes:[],comments:[],counts:{likes:0,comments:0}},X=F(Qe),pt=Ge(),Ke=Qe.likes?.some(t=>t.uid===pt.uid||t.handle===pt.handle),ht=(Array.isArray(o.favoriteMenuItems?.items)?o.favoriteMenuItems.items:[]).some(t=>{if(!t||typeof t!="object")return!1;const d=String(t.restaurantId||"").trim();if(C&&d&&d!==C)return!1;const h=[t.itemId,t.menuSocialId,t.menuItemId,t.id].map(k=>String(k||"").trim()).filter(Boolean);return!!Ne&&h.includes(Ne)}),mt=(Qe.comments||[]).map(nt),U=!!C&&!!Ne&&!!o.user,wt=!!String(o.user?.uid||"").trim(),yt="menuDetailTitle",Ye=v?je(C||A?.restaurantId||""):0,ft=(String(o.menuDetail.footerView||"cart").trim().toLowerCase()==="comment"?"comment":"cart")==="comment",Xe=a("menu.noInfo","Keine Informationen, bitte an das Lokal oder den Kellner wenden."),kt=String(G||"").trim()||Xe,$t=L||Xe,St=String(R||"").trim()||Xe,Je=String(o.menuDetail?.infoTab||"info").trim().toLowerCase(),We=Je==="ingredients"||Je==="allergens"?Je:"info",et=t=>["h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer select-none",We===t?"bg-slate-900 text-white border-slate-900":"bg-white text-slate-500 border-slate-200"].join(" "),It=v?`
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-3 px-7 pt-7 pb-4 border-b border-slate-100 bg-white">
        <div class="flex items-center gap-2 min-w-0">
          <button type="button" id="menuDetailHeaderCartBtn" class="inline-flex items-center gap-2 px-4 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black shadow-sm active:scale-95 ${$&&!me?"":"opacity-50 pointer-events-none"}">
            ${u("shopping-cart","w-4 h-4")}
            <span>${n(a("menu.addToCart","In den Warenkorb"))}</span>
            ${Ye?`<span class="inline-flex min-w-[20px] h-5 px-1.5 rounded-full bg-white/14 border border-white/20 text-white text-[9px] font-black items-center justify-center leading-none">${Ye>99?"99+":Ye}</span>`:""}
          </button>
          ${wt?`
            <button type="button" id="menuDetailHeaderFavoritesBtn" aria-label="${n(a("menu.favorite","Favoriten"))}" title="${n(a("menu.favorite","Favoriten"))}" class="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-95 ${ht?"bg-slate-900 text-white border-slate-900":"bg-slate-100 text-slate-700 border-slate-200"}">
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
            <h3 id="${yt}" class="text-[1.05rem] leading-tight font-black tracking-tight text-slate-900 truncate">${n(s.name||a("menu.product","Produkt"))}</h3>
            ${T?`<div class="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${n(T)}</div>`:""}
          </div>
        </div>
        <button id="menuDetailClose" data-menu-detail-close="true" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${u("x","w-4 h-4")}
        </button>
      </div>
    `,Ct=v?`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 space-y-5 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div class="modal-handoff-hero relative rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y; aspect-ratio:4 / 5;">
          ${Le()}
          ${y.length>1?`
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${u("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${u("chevron-right","w-4 h-4")}
            </button>
          `:""}
        </div>
        <div class="modal-handoff-chrome">
        ${y.length>1?`
          <div class="flex items-center justify-center gap-2">
            ${y.map((t,d)=>`
              <button type="button" data-menu-gallery-dot="${d}" class="w-2.5 h-2.5 rounded-full ${d===I?"bg-slate-900":"bg-slate-200"}"></button>
            `).join("")}
          </div>
        `:""}
        <div class="flex items-center justify-between">
          <span class="text-lg font-black text-slate-900">${n(Be)}</span>
        </div>
        <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          ${T?`<span>${n(T)}</span>`:""}
          <span>${n(ue)}</span>
        </div>
        ${Z||q?`
          <div class="grid ${Z&&q?"grid-cols-2":"grid-cols-1"} gap-3">
            ${Z?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${n(a("menu.brand","Marke"))}</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${n(Z)}</p></div>`:""}
            ${q?`<div class="p-4 rounded-[1.6rem] bg-white border border-slate-100 shadow-sm"><p class="text-[9px] font-black uppercase tracking-widest text-slate-300">SKU</p><p class="text-xs font-bold text-slate-700 mt-1 truncate">${n(q)}</p></div>`:""}
          </div>
        `:""}
        ${B.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${n(a("menu.sizes","Groessen"))}</p>
            <select data-menu-detail-variant="size" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${B.map(t=>`<option value="${n(t)}" ${at===String(t)?"selected":""}>${n(t)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${D.length?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">${n(a("menu.colors","Farben"))}</p>
            <select data-menu-detail-variant="color" class="w-full h-12 px-4 rounded-2xl bg-white text-sm font-bold text-slate-700 border border-slate-200 outline-none">
              ${D.map(t=>`<option value="${n(t)}" ${e===String(t)?"selected":""}>${n(t)}</option>`).join("")}
            </select>
          </div>
        `:""}
        ${G?`<p class="text-sm text-slate-600 leading-relaxed">${n(G)}</p>`:""}
        ${R?`
          <div class="p-4 rounded-[1.8rem] bg-white border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">${n(a("menu.notes","Hinweise"))}</p>
            <p class="text-sm text-slate-600">${n(R)}</p>
          </div>
        `:""}
        <div class="flex items-center justify-between" style="padding-top:1.25rem;">
          <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${Ke?"text-rose-500":"text-slate-700"} ${U?"":"opacity-50 pointer-events-none"}">
            ${u("heart","w-3.5 h-3.5")} ${n(Ke?a("likes.liked","Gefaellt"):a("likes.like","Like"))}
          </button>
          <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span id="menuDetailLikesCount">${n(O(X.likes))} ${n(a("likes.count","Likes"))}</span>
            <span id="menuDetailCommentsCount">${n(O(X.comments))} ${n(a("comments.count","Kommentare"))}</span>
          </div>
        </div>
        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${Pe(mt)}
        </div>
        </div>
      </div>
    `:`
      <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll modal-handoff-scroll px-7 py-6 bg-white/98">
        <div class="modal-handoff-hero relative h-56 rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm" data-menu-gallery style="touch-action: pan-y;">
          ${Le()}
          ${y.length>1?`
            <button type="button" data-menu-gallery-nav="prev" class="modal-handoff-chrome absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${u("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-menu-gallery-nav="next" class="modal-handoff-chrome absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow text-slate-600 flex items-center justify-center">
              ${u("chevron-right","w-4 h-4")}
            </button>
          `:""}
        </div>
        <div class="modal-handoff-chrome">
        ${y.length>1?`
          <div class="flex items-center justify-center gap-2">
            ${y.map((t,d)=>`
              <button type="button" data-menu-gallery-dot="${d}" class="w-2.5 h-2.5 rounded-full ${d===I?"bg-slate-900":"bg-slate-200"}"></button>
            `).join("")}
          </div>
        `:""}
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
                <button type="button" data-menu-detail-info-tab="info" class="${et("info")}">${n(a("menu.info","Info"))}</button>
                <button type="button" data-menu-detail-info-tab="ingredients" class="${et("ingredients")}">${n(a("menu.ingredients","Inhaltsstoffe"))}</button>
                <button type="button" data-menu-detail-info-tab="allergens" class="${et("allergens")}">${n(a("menu.allergens","Allergene"))}</button>
              </div>
              <div class="menu-detail-info-panels rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-3.5">
                <p data-menu-detail-info-panel="info" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${We==="info"?"":"hidden"}">${n(kt)}</p>
                <p data-menu-detail-info-panel="ingredients" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${We==="ingredients"?"":"hidden"}">${n($t)}</p>
                <p data-menu-detail-info-panel="allergens" class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line h-full overflow-y-auto no-scrollbar ${We==="allergens"?"":"hidden"}">${n(St)}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100"></div>
          ${ct.length?`<div class="pt-1">${ot(ct,{showAdd:qe})}</div><div class="border-t border-slate-100"></div>`:""}

          <div class="flex items-center justify-between" style="padding-top:1.25rem;">
            <button id="menuDetailLikeBtn" class="flex items-center gap-2 text-sm font-black ${Ke?"text-rose-500":"text-slate-700"} ${U?"":"opacity-50 pointer-events-none"}">
              ${u("heart","w-3.5 h-3.5")} ${n(Ke?a("likes.liked","Gefaellt"):a("likes.like","Like"))}
            </button>
            <div class="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span id="menuDetailLikesCount">${n(O(X.likes))} ${n(a("likes.count","Likes"))}</span>
              <span id="menuDetailCommentsCount">${n(O(X.comments))} ${n(a("comments.count","Kommentare"))}</span>
            </div>
          </div>
        </div>

        <div id="menuDetailComments" class="space-y-4" style="margin-top:3rem;">
          ${Pe(mt)}
        </div>
        </div>
      </div>
    `,At=S?`
      <button type="button" id="menuDetailWoltBtn" data-wolt-url="${n(f)}" class="flex-1 h-[52px] rounded-[1.65rem] text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm" style="background-color:#18b9df;" title="${n(a("menu.openWolt","Bei Wolt oeffnen"))}">
        <span class="font-bold text-sm">Wolt</span>
        ${u("external-link","w-4 h-4")}
      </button>
    `:Q?`
        <button id="menuDetailFavoriteCtaBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all">
          <span class="font-bold text-sm">${n(a("menu.toFavorites","Zu Favoriten"))}</span>
          ${u("bookmark","w-4 h-4")}
        </button>
      `:`
        <button id="menuDetailAddToCartBtn" class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all ${$&&!me?"":"opacity-50 pointer-events-none"}">
          <span class="font-bold text-sm">${n(me?a("menu.soldOut","Ausverkauft"):a("menu.addToCart","In den Warenkorb"))}</span>
          ${u("shopping-bag","w-4 h-4")}
        </button>
      `,jt=S?a("menu.backToWolt","Zurueck zu Wolt"):Q?a("menu.backToFavorites","Zurueck zu Favoriten"):a("menu.backToCart","Zurueck zum Warenkorb"),Pt=S?"text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200",zt=S?'style="background-color:#18b9df;"':"",Tt=S?`
      <span class="w-5 h-5 inline-flex items-center justify-center text-white leading-none select-none" aria-hidden="true">
        <span class="block" style="font-family:'Omnes','Plus Jakarta Sans','Segoe UI',sans-serif;font-size:20px;font-weight:800;font-style:italic;line-height:1;transform:translateY(-1px);">
          w
        </span>
      </span>
    `:u(Q?"bookmark":"shopping-bag","w-5 h-5"),Dt=`
    <div class="modal-handoff-chrome px-7 pb-6 pt-4 border-t border-slate-100 bg-white/98 backdrop-blur-sm modal-footer-safe relative z-10">
      <div id="footer-cart-view" class="flex gap-3 items-center w-full transition-all duration-300 ${ft?"hidden opacity-0":""}">
        <button type="button" id="menuDetailFooterCommentToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95 relative" title="${n(a("menu.commentAction","Kommentare verfassen"))}">
          ${u("message-square","w-5 h-5")}
          ${X.comments>0?`<span id="menuDetailFooterCommentsBadge" class="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">${X.comments}</span>`:""}
        </button>
        ${At}
      </div>

      <div id="footer-comment-view" class="flex gap-3 items-center w-full transition-all duration-300 ${ft?"":"hidden opacity-0"}">
        <button type="button" id="menuDetailFooterCartToggle" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] ${Pt} flex items-center justify-center transition-all active:scale-95" ${zt} title="${jt}">
          ${Tt}
        </button>

        <div class="flex-1 flex gap-2">
          <textarea id="menuDetailCommentInput" placeholder="${n(U?a("menu.commentPlaceholder","Schreib einen Kommentar..."):a("menu.loginRequired","Bitte einloggen"))}" class="flex-1 px-5 py-3.5 rounded-[1.65rem] border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none leading-relaxed ${U?"":"opacity-60"}" rows="1" ${U?"":"disabled"}>${n(o.menuDetail.commentText||"")}</textarea>
          <button id="menuDetailCommentSend" class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-indigo-600 text-white flex items-center justify-center ${U?"":"opacity-60 cursor-not-allowed"}" ${U?"":"disabled"}>
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
          ${It}
          ${Ct}
          ${Dt}
        </div>
      </div>
    </div>
  `}export{ln as renderMenuDetailModalCore,sn as renderMenuItemModalCore};
