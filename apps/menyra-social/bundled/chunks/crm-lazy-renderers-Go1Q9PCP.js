import{m as de}from"./loading-diagnostics-utils-D9lcQexT.js";import{u as le}from"./domain-leads-ClK_yuqi.js";import{r as oe,P as ce}from"./business-category-visibility-utils-DmseGEnc.js";function pe(n={},{typeKey:t="",escapeHtml:l=c=>String(c||""),icon:e=()=>""}={}){const c=oe({...n||{},type:t||n?.type||""},{normalizeLeadTypeKeyFn:le}),g=ce.join(", "),p=c.isPubliclyListed?{box:"bg-emerald-50 border-emerald-100",text:"text-emerald-700",icon:"eye",label:"Publik"}:{box:"bg-amber-50 border-amber-100",text:"text-amber-700",icon:"eye-off",label:"I fshehur"},m=c.allowedByCategory?"Kategoria eshte e lejuar publikisht.":c.manuallyPublished?"Kategoria eshte e mbyllur - ky lokal eshte aktivizuar me dore.":`Kategoria eshte e mbyllur. Publike jane vetem: ${g}.`;return`
    <div class="rounded-2xl border ${p.box} px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <span class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${p.text}">
          ${e(p.icon,"w-3.5 h-3.5")}
          ${l(p.label)}
        </span>
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${l(c.categoryKey||"pa kategori")}</span>
      </div>
      <p class="mt-2 text-[10px] font-bold leading-4 text-slate-500">${l(m)}</p>
      <label class="mt-3 flex items-center justify-between gap-4 rounded-xl bg-white/70 border border-white px-3 py-2">
        <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktivizo publikisht</span>
        <input id="leadPublicOverrideEnabled" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${c.manuallyPublished?"checked":""} />
      </label>
    </div>
  `}function ue(n=""){const t=String(n||"").trim();if(!t)return"i panjohur";const l=new Date(t);return Number.isFinite(l.getTime())?l.toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"}):t}function J(n="",t="#111827"){const l=String(n||"").trim();return/^#[0-9a-fA-F]{6}$/.test(l)?l:t}function be(n={}){const t=n?.landingScreenOne&&typeof n.landingScreenOne=="object"?n.landingScreenOne:{},l=J(n?.businessNameColor||n?.landingBusinessNameColor||t.businessNameColor||"",""),e=l&&l.toLowerCase()!=="#111827"?l:"";return{part1:J(n?.businessNameColorPart1||n?.landingBusinessNameColorPart1||t.businessNameColorPart1||l||"","#111827"),part2:J(n?.businessNameColorPart2||n?.landingBusinessNameColorPart2||t.businessNameColorPart2||e||"","#4f46e5")}}function ve(n={}){const{state:t,icon:l,escapeHtml:e,getLeadSettingsConfig:c,CEO_COUNTRIES:g,LEAD_TYPE_ORDER:p,LEAD_TYPE_LABELS:m}=n,b=c();return`
    <div id="leadSettingsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vendi standard i vendndodhjes</label>
            <div class="relative mt-2">
              <select id="leadSettingsDefaultCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${g.map(u=>`<option value="${e(u)}" ${b.defaultCountry===u?"selected":""}>${e(u)}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${l("chevron-down","w-4 h-4")}</div>
            </div>
          </div>
        </div>
        <div class="mt-6">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Llojet e lead / Cmimi mujor i abonimit</p>
            <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">x12 = Jahr</span>
          </div>
          <div class="space-y-3">
            ${p.map(u=>{const v=Number(b.pricing?.[u])||0;return`
                <div class="grid grid-cols-[1.2fr_0.8fr] gap-3 items-center">
                  <div class="px-4 py-4 rounded-2xl bg-slate-50 text-sm font-black text-slate-700">${e(m[u])}</div>
                  <div class="relative">
                    <input id="leadPrice_${e(u)}" type="number" min="0" step="0.01" value="${e(v?v.toFixed(2):"0.00")}" class="w-full px-4 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
                    <span class="absolute inset-y-0 right-4 flex items-center text-[10px] font-black text-slate-400 uppercase">EUR</span>
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
        ${t.leads.settingsStatus?`<div class="mt-5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${e(t.leads.settingsStatus)}</div>`:""}
        <button id="leadSettingsSaveBtn" type="button" class="w-full mt-6 py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${t.leads.settingsSaving?"disabled":""}>
          ${e(t.leads.settingsSaving?"Duke ruajtur...":"Ruaj cilesimet e leads")}
        </button>
      </div>
    </div>
  `}function we(n={}){const{state:t,icon:l,escapeHtml:e,getLeadSettingsConfig:c,getOptimizedImageUrl:g,PLACEHOLDER_IMAGE:p,resolveCustomerType:m,normalizeLeadLocations:b,getLeadCountryCenter:u,getLeadMonthlyPrice:v,LEAD_TYPE_ORDER:y,LEAD_TYPE_LABELS:r,buildLeadAccountEmail:d,hasLeadLocationCoords:C,CEO_COUNTRIES:w,normalizeLeadCountry:I,resolveCurrencyCodeFromLeadCountry:S,buildLeadContactName:L}=n,a=t.leadModal.lead||{},T=c(),k=t.leadModal.logoPreview||a.logoUrl||"",E=k?g(k,"avatar"):p,U=t.leadModal.bestSpotLogoPreview||a.bestSpotLogoUrl||a.spotLogoUrl||k,F=U?g(U,"avatar"):p,M=t.leadModal.titleImagePreview||a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||"",B=M?g(M,"medium"):p,o=t.leadModal.mode==="edit"&&!!a.id,O=!!t.leadModal.actionsOpen,$=!!t.leadModal.deleting,h=m(a.customerType||"cafe"),A=a.billingCycle==="yearly"?"yearly":"monthly",i=I(a.country||T.defaultCountry),f=String(typeof S=="function"&&S(i,"EUR")||"EUR").trim().toUpperCase()||"EUR",D=b(t.leadModal.locations,a.address||"",t.leadModal.coords||u(i)),j=v(h,T),R=j*12,N=A==="yearly"?R:j,V=be(a),_=a.specialEnabled===!0,z=t.leadModal.coords&&Number.isFinite(Number(t.leadModal.coords.lat))&&Number.isFinite(Number(t.leadModal.coords.lng))?{lat:Number(t.leadModal.coords.lat),lng:Number(t.leadModal.coords.lng)}:null;return`
    <div id="leadCreateView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-28">
      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="mb-6 flex items-start justify-between">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CRM</span>
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">${e(o?"Ndrysho lead-in":"Lead i ri")}</h2>
          </div>
          ${o?`
            <div class="relative">
              <button id="leadInlineActionsToggle" type="button" class="w-11 h-11 rounded-2xl bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center active:scale-95 ${$?"opacity-60 cursor-not-allowed":""}" ${$?"disabled":""}>
                ${l("ellipsis-vertical","w-4 h-4")}
              </button>
              ${O?'<button id="leadInlineActionsBackdrop" type="button" class="fixed inset-0 z-[5] bg-transparent"></button>':""}
              <div class="absolute right-0 top-14 z-10 min-w-[170px] rounded-2xl border border-slate-100 bg-white shadow-xl p-2 ${O?"":"hidden"}">
                <button id="leadInlineDeleteBtn" type="button" class="w-full px-4 py-3 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest text-left flex items-center gap-2 active:scale-95 ${$?"opacity-60 cursor-not-allowed":""}" ${$?"disabled":""}>
                  ${l("trash-2","w-3.5 h-3.5")}
                  ${e($?"Duke fshire...":"Fshi lead-in")}
                </button>
              </div>
            </div>
          `:""}
        </div>
        <input type="file" id="leadLogoInput" class="hidden" accept="image/*" />
        <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
          <img id="leadLogoPreview" src="${e(E)}" class="w-full h-44 object-contain bg-white" />
        </div>
        <button id="leadLogoTrigger" type="button" class="w-full mt-4 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Ngarko logon</button>
        <input type="file" id="leadBestSpotLogoInput" class="hidden" accept="image/*" />
        <div class="mt-4 rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
          <img id="leadBestSpotLogoPreview" src="${e(F)}" class="w-full h-44 object-cover bg-white" />
        </div>
        <button id="leadBestSpotLogoTrigger" type="button" class="w-full mt-4 py-3 rounded-2xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">Ngarko logon Best-Spot</button>
        <input type="file" id="leadTitleImageInput" class="hidden" accept="image/*" />
        <div class="mt-4 rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
          <img id="leadTitleImagePreview" src="${e(B)}" class="w-full h-44 object-cover bg-white" />
        </div>
        <button id="leadTitleImageTrigger" type="button" class="w-full mt-4 py-3 rounded-2xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">Ngarko foton e titullit</button>
        <div class="mt-5 space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
            <div class="relative mt-2">
              <select id="leadCustomerType" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${y.map(P=>`<option value="${P}" ${h===P?"selected":""}>${e(r[P])}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${l("chevron-down","w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Business Name</label>
            <input id="leadBusinessName" type="text" value="${e(a.businessName||"")}" placeholder="Business Name" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="leadEmail" type="email" value="${e(a.email||d(a.businessName||""))}" readonly class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-500 border-none outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Fjalekalimi</label>
            <input id="leadPassword" type="password" value="${e(a.password||"")}" placeholder="bosh = nuk krijohet login" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngjyrat e emrit te biznesit</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Ngjyra pjesa 1</label>
              <input id="leadBusinessNameColorPart1" type="text" value="${e(V.part1)}" placeholder="#111827" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-black uppercase border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Ngjyra pjesa 2</label>
              <input id="leadBusinessNameColorPart2" type="text" value="${e(V.part2)}" placeholder="#4f46e5" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-black uppercase border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Te dhenat e klientit</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
              <input id="leadCustomerFirstName" type="text" value="${e(a.contactFirstName||"")}" placeholder="Emri" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
              <input id="leadCustomerLastName" type="text" value="${e(a.contactLastName||"")}" placeholder="Mbiemri" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Telefon</label>
              <input id="leadPhone" type="text" value="${e(a.phone||"")}" placeholder="+383" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Instagram</label>
              <input id="leadInstagram" type="text" value="${e(a.instagram||"")}" placeholder="@mnyra" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Facebook</label>
              <input id="leadFacebook" type="text" value="${e(a.facebook||"")}" placeholder="Facebook" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">TikTok</label>
              <input id="leadTiktok" type="text" value="${e(a.tiktok||"")}" placeholder="TikTok" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Google Maps</label>
            <input id="leadGoogleMaps" type="text" value="${e(a.googleMaps||"")}" placeholder="https://maps.google.com/..." class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Restaurant Card</p>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Orari i punes</label>
            <input id="leadOpeningHours" type="text" value="${e(a.openingHours||a.hours||"")}" placeholder="Hene - Diel: 11:00 - 22:00" class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div class="grid grid-cols-1 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Garten / Terrasse</label>
              <input id="leadGardenTerraceText" type="text" value="${e(a.gardenTerraceText||a.restaurantFeatures?.gardenTerrace||"")}" placeholder="Kopsht / terrace" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Barrierefrei</label>
              <input id="leadAccessibilityText" type="text" value="${e(a.accessibilityText||a.restaurantFeatures?.accessibility||"")}" placeholder="Pa pengesa" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vegane Optionen</label>
              <input id="leadVeganOptionsText" type="text" value="${e(a.veganOptionsText||a.restaurantFeatures?.veganOptions||"")}" placeholder="Opsione vegane" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abo</p>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Laufzeit</label>
            <div class="relative mt-2">
              <select id="leadBillingCycle" class="w-full px-5 py-4 pr-12 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                <option value="monthly" ${A==="monthly"?"selected":""}>Mujore</option>
                <option value="yearly" ${A==="yearly"?"selected":""}>Vjetore</option>
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${l("chevron-down","w-4 h-4")}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cmimi mujor</label>
              <input id="leadMonthlyPrice" type="text" value="${e(j?`${j.toFixed(2)} ${f} / Monat`:`0.00 ${f} / Monat`)}" readonly class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cmimi vjetor</label>
              <input id="leadAnnualPrice" type="text" value="${e(R?`${R.toFixed(2)} ${f} / Jahr`:`0.00 ${f} / Jahr`)}" readonly class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cmimi aktual</label>
            <input id="leadPriceValue" type="text" value="${e(N?`${N.toFixed(2)} ${f}`:`0.00 ${f}`)}" readonly class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendndodhjet</p>
            <button type="button" data-lead-location-add class="px-3 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">${l("plus","w-3.5 h-3.5")} Shto vendndodhje</button>
          </div>
          ${D.map((P,K)=>{const s=C(P);return`
              <div class="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Vendndodhja ${K+1}</p>
                  ${K>0?`<button type="button" data-lead-location-remove="${K}" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-200">${l("x","w-3.5 h-3.5")}</button>`:""}
                </div>
                <input id="leadLocationAddress_${K}" data-lead-location-address="${K}" type="text" value="${e(P.address||"")}" placeholder="Plus Code ose adresa" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
                <div id="leadLocationCoords_${K}" class="text-[9px] font-bold text-emerald-600 flex items-center gap-1 ${s?"":"hidden"}">${l("check-circle-2","w-3 h-3")} Vendndodhja u fiksua ne harte</div>
                <button type="button" data-lead-location-pick="${K}" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">${l("map-pin","w-3.5 h-3.5")} Auf Karte festlegen</button>
              </div>
            `}).join("")}
          <div id="leadCoordsDisplay" class="${z?"":"hidden"} text-[9px] font-bold text-emerald-600 flex items-center gap-1">
            ${l("check-circle-2","w-3 h-3")} ${z?e(`${z.lat.toFixed(4)}, ${z.lng.toFixed(4)}`):""}
          </div>
        </div>
        <div class="mt-6 space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Land</label>
            <div class="relative mt-2">
              <select id="leadCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${w.map(P=>`<option value="${e(P)}" ${i===P?"selected":""}>${e(P)}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${l("chevron-down","w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Waehrung</label>
            <input id="leadCurrency" type="text" value="${e(f)}" readonly class="w-full mt-2 px-5 py-4 bg-slate-100 rounded-2xl text-sm font-black text-slate-500 border-none outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Qyteti</label>
            <input id="leadCity" type="text" value="${e(a.city||"")}" placeholder="Qyteti" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Adresa</label>
            <input id="leadAddress" type="text" value="${e(a.address||"")}" placeholder="Adresa" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">ZIP Code</label>
            <input id="leadZipCode" type="text" value="${e(a.zipCode||"")}" placeholder="10000" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Notiz</label>
            <textarea id="leadNote" rows="3" placeholder="Shenim i shkurter..." class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${e(a.note||"")}</textarea>
          </div>
          <label class="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktivizo Special</span>
            <input id="leadSpecialEnabled" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${_?"checked":""} />
          </label>
          ${pe(a,{typeKey:h,escapeHtml:e,icon:l})}
        </div>
        <input id="leadLogoUrl" type="hidden" value="${e(a.logoUrl||"")}" />
        <input id="leadBestSpotLogoUrl" type="hidden" value="${e(a.bestSpotLogoUrl||a.spotLogoUrl||"")}" />
        <input id="leadTitleImageUrl" type="hidden" value="${e(a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||"")}" />
        <input id="leadStatus" type="hidden" value="${e(a.status||"registered")}" />
        <input id="leadContactName" type="hidden" value="${e(L(a.contactFirstName,a.contactLastName,a.contactName||""))}" />
        <div class="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${e(t.leadModal.status||"")}</div>
        <button id="leadInlineSaveBtn" type="button" class="w-full mt-5 py-4 rounded-[1.8rem] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform" ${t.leadModal.loading?"disabled":""}>${e(t.leadModal.loading?"Duke ruajtur...":o?"Ruaj lead-in":"Krijo lead")}</button>
      </div>
    </div>
  `}function he(n={}){const{state:t,icon:l,escapeHtml:e,getCurrentCeoMeta:c,getStaffFormEmail:g,getOptimizedImageUrl:p,PLACEHOLDER_IMAGE:m,isPlaceholderUrl:b,CEO_COUNTRIES:u,normalizeCeoCountry:v}=n,y=c(),r=t.staff.form||{},d=!!t.staff.editorUid,C=d&&String(t.staff.editorUid||"")===String(y.uid||""),w=r.coords&&Number.isFinite(Number(r.coords.lat))&&Number.isFinite(Number(r.coords.lng))?{lat:Number(r.coords.lat),lng:Number(r.coords.lng)}:null,I=g(r,{preferStored:d}),S=r.avatarPreview||r.avatarUrl||"",L=S?p(S,"avatar"):m,a=!L||b(L)?m:L,T=t.staff.saving?d?"Duke ruajtur...":"Erstelle CEO...":d?"Ruaj CEO-n":"Krijo CEO";return`
    <div id="staffEditorView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="mb-6">
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CEO</span>
        <h2 class="text-2xl font-black italic uppercase tracking-tighter">${e(d?"Edit CEO":"Create CEO")}</h2>
      </div>

      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <input type="file" id="staffAvatarInput" class="hidden" accept="image/*" />
        <div class="flex flex-col items-center mb-6">
          <button id="staffAvatarTrigger" type="button" class="relative group">
            <img id="staffAvatarPreview" src="${e(a)}" class="w-28 h-28 rounded-[2.6rem] object-cover border-4 border-white shadow-xl bg-slate-100" onerror="this.src='${m}'" />
            <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              ${l("camera","w-4 h-4")}
            </div>
          </button>
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4">Ngarko foton e profilit</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
            <input id="staffFirstName" type="text" value="${e(r.firstName||"")}" placeholder="Emri" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
            <input id="staffLastName" type="text" value="${e(r.lastName||"")}" placeholder="Mbiemri" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="staffEmail" type="email" value="${e(I)}" placeholder="vornamenachname@mnyra.com" readonly class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-500 border-none outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Fjalekalimi</label>
            <input id="staffPassword" type="password" value="" placeholder="${e(d?"Fjalekalimi mbetet i pandryshuar":"Shkruaj fjalekalimin")}" ${d?"disabled":""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 ${d?"text-slate-400":""}" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Land</label>
            <div class="relative mt-2">
              <select id="staffCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${u.map(k=>`<option value="${e(k)}" ${v(r.country)===k?"selected":""}>${e(k)}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${l("chevron-down","w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vendndodhja</label>
            <input id="staffLocationLabel" type="text" value="${e(r.locationLabel||"")}" placeholder="Vendndodhja / Adresa" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>

        <button id="staffLocationPickBtn" type="button" class="w-full mt-4 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
          ${l("map-pin","w-4 h-4")} Zgjidh vendndodhjen me pin
        </button>
        <div id="staffCoordsDisplay" class="mt-3 ${w?"":"hidden"} px-3 py-3 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
          ${l("check-circle-2","w-4 h-4")} ${w?e(`${w.lat.toFixed(4)}, ${w.lng.toFixed(4)}`):""}
        </div>

        ${t.staff.error?`<div class="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${e(t.staff.error)}</div>`:""}
        ${t.staff.status?`<div class="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${e(t.staff.status)}</div>`:""}

        <button id="staffSaveBtn" type="button" class="w-full mt-5 py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${t.staff.saving?"disabled":""}>
          ${e(T)}
        </button>
        ${d?`
          <button id="staffDeleteBtn" type="button" class="w-full mt-3 py-4 rounded-[1.8rem] bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 active:scale-95 transition-transform ${C?"opacity-60 cursor-not-allowed":""}" ${t.staff.deleting||C?"disabled":""}>
            ${e(t.staff.deleting?"Duke fshire...":"Fshi CEO-n")}
          </button>
        `:""}
      </div>
    </div>
  `}function ye(n={}){const{state:t,icon:l,escapeHtml:e,isCeoUser:c,renderCeoGuard:g,renderLeadSettingsView:p,renderLeadCreationView:m,normalizeSearchKey:b,normalizeLeadStatusKey:u,normalizeLeadScopeKey:v,createLeadScopeMap:y,sanitizeCeoCrmCounts:r,hasStoredCeoCrmCounts:d,resolveKnownScopeCountLabel:C,leadMatchesQuery:w,leadStatusTone:I,leadStatusLabel:S,buildLeadLandingPageUrl:L,getOptimizedImageUrl:a,PLACEHOLDER_IMAGE:T,renderOwnershipPills:k,renderCeoScopeTabs:E,LEAD_STATUS_ORDER:U,LEAD_STATUS_LABELS:F}=n;if(!c())return g("Leads");if(t.leads.view==="settings")return p();if(t.leads.view==="create")return m();const M=b(t.leads.query||""),B=u(t.leads.status||""),o=v(t.leads.scope),O=t.leads.pages||y(()=>[]);t.leads.hasMore||y(()=>!1);const $=t.leads.loaded||y(()=>!1),h=t.leads.knownCount||y(()=>0),A=t.leads.countExact||y(()=>!1),i=r(t.userProfile?.crmCounts||{}),f=d(t.userProfile?.crmCounts)?String(i.ownLeads):C(h.own,!!A.own,!!$.own),D=d(t.userProfile?.crmCounts)?String(i.staffLeads):C(h.staff,!!A.staff,!!$.staff),j=d(t.userProfile?.crmCounts)?String(i.archivedLeads):C(h.archived,!!A.archived,!!$.archived),R=(()=>{try{return typeof performance<"u"&&typeof performance.now=="function"?performance.now():Date.now()}catch{return Date.now()}})();let N=Array.isArray(O[o])?O[o].slice():[];B&&o!=="archived"&&(N=N.filter(s=>u(s.status)===B));const V=(s,x=null)=>{const H=Array.isArray(s?.locations)?s.locations.map(G=>G?.address||G?.city||"").join(" "):"";return String(s?._searchKey||"").trim()||b([s?.businessName,s?.restaurantName,s?.name,x?.name,x?.restaurantName,s?.contactName,s?.phone,s?.email,s?.socialEmail,s?.instagram,s?.city,s?.address,s?.publicSlug,s?.landingSlug,x?.publicSlug,x?.landingSlug,s?.canonicalPublicPath,s?.status,S(s?.status),s?.customerType,H].filter(Boolean).join(" "))},_=N.map(s=>{const x=s.restaurantId?t.restaurants.find(G=>String(G.id)===String(s.restaurantId)):null,H=V(s,x);return{lead:s,rest:x,searchKey:H,matches:!M||w({...s,_searchKey:H},M)}}),z=_.filter(s=>s.matches).length,P=t.leads.loading?'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Leads po ngarkohen...</div>':_.length?`
      ${_.map(({lead:s,rest:x,searchKey:H,matches:G})=>{const Z=I(s.status),ne=S(s.status),W=s.logoUrl||s.logo||x?.logoUrl||x?.logo||"",ie=W?a(W,"avatar"):T,X=s.businessName||x?.name||x?.restaurantName||"Business",ee=s.email||s.socialEmail||"",Q=String(s.landingRestaurantId||s.restaurantId||x?.id||"").trim(),Y=String(s.publicSlug||s.landingSlug||x?.publicSlug||x?.landingSlug||"").trim(),te=!!String(Q||Y).trim()&&typeof L=="function"?String(L(Q,{publicSlug:Y,landingSlug:Y,businessName:X})||"").trim():"",ae=String(Y||Q||"").trim(),se=ae?`/oferta/${encodeURIComponent(ae)}`:"",re=k(s,{hideOwn:o==="own"}),q=oe({...x||{},...s||{},type:s.customerType||s.type||x?.type||""},{normalizeLeadTypeKeyFn:le});return`
        <div data-lead-row="true" data-lead-search-key="${e(H)}" class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm" ${G?"":"hidden"}>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
              <img src="${e(ie)}" class="w-full h-full object-contain bg-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${e(X)}</p>
              ${ee?`<p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">${e(ee)}</p>`:""}
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${Z.bg} ${Z.text}">${e(ne)}</span>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 mt-2">
            ${q.isPubliclyListed?q.manuallyPublished&&!q.allowedByCategory?'<span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-sky-50 text-sky-700">Publik me dore</span>':"":'<span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700">I fshehur publikisht</span>'}
            ${q.isPubliclyListed?"":`<span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-400">${e(q.categoryKey||"pa kategori")}</span>`}
          </div>
          ${re}
          <div class="flex gap-2 mt-4">
            ${te?`<a href="${e(te)}" target="_blank" rel="noopener noreferrer" class="px-4 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500">Profil</a>`:""}
            ${se?`<a href="${e(se)}" target="_blank" rel="noopener noreferrer" class="px-4 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800">Oferta</a>`:""}
            <button data-lead-edit="${e(s.id)}" class="flex-1 py-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Ndrysho</button>
          </div>
        </div>
      `}).join("")}
      <div id="leadsNoResults" class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16" ${z?"hidden":""}>Nuk ka leads</div>
    `:'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Nuk ka leads</div>',K=(()=>{try{return typeof performance<"u"&&typeof performance.now=="function"?performance.now():Date.now()}catch{return Date.now()}})();return de("lead list render",{scope:o,count:_.length,items:z,elapsedMs:K-R}),`
    <div id="leadsView" class="p-6 animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CRM</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Leads</h2>
        </div>
        <div class="flex items-center gap-2">
          <button id="leadSettingsBtn" class="w-12 h-12 rounded-2xl bg-white text-slate-700 border border-slate-100 flex items-center justify-center shadow-sm active:scale-95">
            ${l("settings","w-4 h-4")}
          </button>
          <button id="newLeadBtn" class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200/60 active:scale-95">
            ${l("plus","w-4 h-4")}
          </button>
        </div>
      </div>
      ${E({idPrefix:"lead-scope",active:o,tabs:[{key:"own",label:"Leads te mi",count:f},{key:"staff",label:"Leads te stafit",count:D},{key:"archived",label:"Archiviert",count:j}]})}
      <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-3 flex items-center gap-3">
        ${l("search","w-4 h-4 text-slate-400")}
        <input id="leadsSearchInput" type="text" value="${e(t.leads.query||"")}" placeholder="Kerko lead..." class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none" />
      </div>
      ${o!=="archived"?`
        <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-4 flex items-center gap-3">
          ${l("list-filter","w-4 h-4 text-slate-400")}
          <select id="leadsStatusFilter" class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none appearance-none">
            <option value="">Te gjitha statuset</option>
            ${U.filter(s=>s!=="kunde"&&s!=="no_interest").map(s=>`
              <option value="${s}" ${B===s?"selected":""}>${F[s]}</option>
            `).join("")}
          </select>
          ${l("chevron-down","w-4 h-4 text-slate-400")}
        </div>
      `:""}
      ${t.leads.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${e(t.leads.error)}</div>`:""}
      <div id="leadsList" class="space-y-4">${P}</div>
      ${t.leads.hasMore?.[o]?`
        <div id="leadsLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${e(t.leads.loadingMore?"Laedt...":"Scrollt weiter...")}
        </div>
      `:""}
    </div>
  `}function ke(n={}){const{state:t,icon:l,escapeHtml:e,isCeoUser:c,renderCeoGuard:g,normalizeSearchKey:p,normalizeCustomerScopeKey:m,createCustomerScopeMap:b,sanitizeCeoCrmCounts:u,hasStoredCeoCrmCounts:v,resolveKnownScopeCountLabel:y,customerMatchesQuery:r,toDateSafe:d,getOptimizedImageUrl:C,PLACEHOLDER_IMAGE:w,leadTypeLabel:I,customerStatusLabel:S,isCustomerRestaurant:L,renderOwnershipPills:a,renderCeoScopeTabs:T}=n;if(!c())return g("Klientet");const k=p(t.customers.query||""),E=m(t.customers.scope),U=t.customers.pages||b(()=>[]);t.customers.hasMore||b(()=>!1);const F=t.customers.loaded||b(()=>!1),M=t.customers.knownCount||b(()=>0),B=t.customers.countExact||b(()=>!1),o=u(t.userProfile?.crmCounts||{}),O=v(t.userProfile?.crmCounts)?String(o.ownCustomers):y(M.own,!!B.own,!!F.own),$=v(t.userProfile?.crmCounts)?String(o.staffCustomers):y(M.staff,!!B.staff,!!F.staff),h=(Array.isArray(U[E])?U[E].slice():[]).filter(i=>r(i,k)).sort((i,f)=>(d(f?.createdAt)?.getTime()||0)-(d(i?.createdAt)?.getTime()||0)),A=t.customers.loading?'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Klientet po ngarkohen...</div>':h.length?h.map(i=>{const f=i.logoUrl||i.logo||"",D=f?C(f,"avatar"):w,j=i.name||i.restaurantName||"Business",R=I(i.type||i.customerType||""),N=i.city||"",V=S(L(i)?"kunde":i.status),_=a(i,{hideOwn:E==="own"});return`
        <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
              <img src="${e(D)}" class="w-full h-full object-contain bg-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${e(j)}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">${e([R,N].filter(Boolean).join(" / "))}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">${e(V)}</span>
          </div>
          ${_}
          <div class="flex gap-2 mt-4">
            <button data-customer-edit="${e(i.id)}" class="flex-1 py-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Ndrysho</button>
          </div>
        </div>
      `}).join(""):'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Nuk ka kliente</div>';return`
    <div id="customersView" class="p-6 animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CRM</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Klientet</h2>
        </div>
      </div>
      ${T({idPrefix:"customer-scope",active:E,ownLabel:"Klientet e mi",ownCount:O,staffLabel:"Klientet e stafit",staffCount:$})}
      <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-4 flex items-center gap-3">
        ${l("search","w-4 h-4 text-slate-400")}
        <input id="customersSearchInput" type="text" value="${e(t.customers.query||"")}" placeholder="Kerko klient..." class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none" />
      </div>
      ${t.customers.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${e(t.customers.error)}</div>`:""}
      <div class="space-y-4">${A}</div>
      ${t.customers.hasMore?.[E]?`
        <div id="customersLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${e(t.customers.loadingMore?"Laedt...":"Scrollt weiter...")}
        </div>
      `:""}
    </div>
  `}function $e(n={}){const{state:t,icon:l,escapeHtml:e,isCeoUser:c,renderCeoGuard:g,renderStaffEditorView:p,getCurrentCeoMeta:m,getOptimizedImageUrl:b,isPlaceholderUrl:u,PLACEHOLDER_IMAGE:v,normalizeHandle:y,staffBuildStatus:r,staffBuildStatusLoading:d,staffBuildStatusError:C}=n;if(!c())return g("Staff");if(t.staff.view==="form")return p();const w=r&&typeof r=="object"?r:t?.staff?.buildStatus||{},I=String(w.commitShort||"").trim()||"i panjohur",S=ue(w.buildTimestamp||""),L=String(w.branch||"").trim()||"i panjohur",a=String(w.environment||"").trim()||"i panjohur",T=!!(d??t?.staff?.buildStatusLoading),k=String(C??t?.staff?.buildStatusError??"").trim(),E=m(),U=Array.isArray(t.staff.items)?t.staff.items.slice():[],F=[...Array.isArray(t.leads.pages?.own)?t.leads.pages.own:[],...Array.isArray(t.leads.pages?.staff)?t.leads.pages.staff:[],...Array.isArray(t.leads.pages?.archived)?t.leads.pages.archived:[]],M=[...Array.isArray(t.customers.pages?.own)?t.customers.pages.own:[],...Array.isArray(t.customers.pages?.staff)?t.customers.pages.staff:[]],B=t.staff.loading?'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Stafi po ngarkohet...</div>':U.length?U.map(o=>{const O=String(o.uid||"")===String(E.uid||""),$=O?"Du":String(o.ceoParentUid||"")===String(E.uid||"")?"Direkt":"Unterstaff",h=o.crmCounts&&typeof o.crmCounts=="object"?o.crmCounts:{},A=Number.isFinite(Number(h.ownLeads))?Number(h.ownLeads):F.filter(N=>String(N.createdByUid||"")===String(o.uid||"")).length,i=Number.isFinite(Number(h.ownCustomers))?Number(h.ownCustomers):M.filter(N=>String(N.createdByUid||"")===String(o.uid||"")).length,f=o.locationLabel||o.location||o.city||o.country||"-",D=o.avatarPreview||o.avatarUrl||o.avatar||"",j=D?b(D,"avatar"):v,R=!j||u(j)?v:j;return`
        <button data-staff-edit="${e(o.uid||"")}" class="w-full text-left bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-[1.4rem] overflow-hidden bg-slate-100 shrink-0">
              <img src="${e(R)}" class="w-full h-full object-cover" onerror="this.src='${v}'" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${e(o.name||"CEO")}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">@${e(o.handle||y(o.name||"ceo"))}</p>
              <p class="text-[10px] font-bold text-slate-500 mt-2 truncate">${e(o.email||"-")}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${O?"bg-slate-900 text-white":"bg-indigo-50 text-indigo-600"}">${e($)}</span>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">${e(o.country||"-")}</span>
            <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest truncate max-w-full">${e(f)}</span>
          </div>
          <div class="grid grid-cols-2 gap-3 mt-4">
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Leads</p>
              <p class="text-sm font-black text-slate-900 mt-1">${e(String(A))}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Klientet</p>
              <p class="text-sm font-black text-slate-900 mt-1">${e(String(i))}</p>
            </div>
          </div>
          <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Prek per te ndryshuar</span>
            <span class="w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">${l("chevron-right","w-4 h-4")}</span>
          </div>
        </button>
      `}).join(""):'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Ende nuk ka CEO Staff</div>';return`
    <div id="staffView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CEO</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Staff</h2>
        </div>
        <button id="staffNewBtn" class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200/60 active:scale-95">
          ${l("plus","w-4 h-4")}
        </button>
      </div>
      ${t.staff.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${e(t.staff.error)}</div>`:""}
      ${t.staff.status?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">${e(t.staff.status)}</div>`:""}
      <div class="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Build Status</p>
        <div class="mt-2 grid grid-cols-[0.95fr_1.05fr] gap-y-1 text-[10px] font-bold">
          <span class="text-slate-400 uppercase">Commit</span>
          <span class="text-slate-700 text-right font-mono">${e(I)}</span>
          <span class="text-slate-400 uppercase">Build</span>
          <span class="text-slate-700 text-right">${e(S)}</span>
          <span class="text-slate-400 uppercase">Branch</span>
          <span class="text-slate-700 text-right">${e(L)}</span>
          <span class="text-slate-400 uppercase">Env</span>
          <span class="text-slate-700 text-right">${e(a)}</span>
        </div>
        ${T?'<p class="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Build info po ngarkohet...</p>':""}
        ${k?`<p class="mt-2 text-[9px] font-bold text-amber-600 uppercase tracking-widest">${e(k)}</p>`:""}
      </div>
      <div class="space-y-4">${B}</div>
      ${t.staff.hasMore?`
        <div id="staffLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${e(t.staff.loadingMore?"Laedt...":"Scrollt weiter...")}
        </div>
      `:""}
    </div>
  `}export{ke as renderCustomersView,we as renderLeadCreationView,ve as renderLeadSettingsView,ye as renderLeadsView,he as renderStaffEditorView,$e as renderStaffView};
