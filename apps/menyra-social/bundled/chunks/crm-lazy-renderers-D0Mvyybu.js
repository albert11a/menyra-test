import{m as le}from"./loading-diagnostics-utils-D9lcQexT.js";function oe(n=""){const e=String(n||"").trim();if(!e)return"i panjohur";const l=new Date(e);return Number.isFinite(l.getTime())?l.toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"}):e}function Q(n="",e="#111827"){const l=String(n||"").trim();return/^#[0-9a-fA-F]{6}$/.test(l)?l:e}function ne(n={}){const e=n?.landingScreenOne&&typeof n.landingScreenOne=="object"?n.landingScreenOne:{},l=Q(n?.businessNameColor||n?.landingBusinessNameColor||e.businessNameColor||"",""),t=l&&l.toLowerCase()!=="#111827"?l:"";return{part1:Q(n?.businessNameColorPart1||n?.landingBusinessNameColorPart1||e.businessNameColorPart1||l||"","#111827"),part2:Q(n?.businessNameColorPart2||n?.landingBusinessNameColorPart2||e.businessNameColorPart2||t||"","#4f46e5")}}function de(n={}){const{state:e,icon:l,escapeHtml:t,getLeadSettingsConfig:P,CEO_COUNTRIES:w,LEAD_TYPE_ORDER:h,LEAD_TYPE_LABELS:y}=n,p=P();return`
    <div id="leadSettingsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vendi standard i vendndodhjes</label>
            <div class="relative mt-2">
              <select id="leadSettingsDefaultCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${w.map(c=>`<option value="${t(c)}" ${p.defaultCountry===c?"selected":""}>${t(c)}</option>`).join("")}
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
            ${h.map(c=>{const b=Number(p.pricing?.[c])||0;return`
                <div class="grid grid-cols-[1.2fr_0.8fr] gap-3 items-center">
                  <div class="px-4 py-4 rounded-2xl bg-slate-50 text-sm font-black text-slate-700">${t(y[c])}</div>
                  <div class="relative">
                    <input id="leadPrice_${t(c)}" type="number" min="0" step="0.01" value="${t(b?b.toFixed(2):"0.00")}" class="w-full px-4 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
                    <span class="absolute inset-y-0 right-4 flex items-center text-[10px] font-black text-slate-400 uppercase">EUR</span>
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
        ${e.leads.settingsStatus?`<div class="mt-5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${t(e.leads.settingsStatus)}</div>`:""}
        <button id="leadSettingsSaveBtn" type="button" class="w-full mt-6 py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${e.leads.settingsSaving?"disabled":""}>
          ${t(e.leads.settingsSaving?"Duke ruajtur...":"Ruaj cilesimet e leads")}
        </button>
      </div>
    </div>
  `}function ce(n={}){const{state:e,icon:l,escapeHtml:t,getLeadSettingsConfig:P,getOptimizedImageUrl:w,PLACEHOLDER_IMAGE:h,resolveCustomerType:y,normalizeLeadLocations:p,getLeadCountryCenter:c,getLeadMonthlyPrice:b,LEAD_TYPE_ORDER:g,LEAD_TYPE_LABELS:r,buildLeadAccountEmail:d,hasLeadLocationCoords:$,CEO_COUNTRIES:x,normalizeLeadCountry:I,resolveCurrencyCodeFromLeadCountry:C,buildLeadContactName:S}=n,a=e.leadModal.lead||{},U=P(),m=e.leadModal.logoPreview||a.logoUrl||"",L=m?w(m,"avatar"):h,T=e.leadModal.bestSpotLogoPreview||a.bestSpotLogoUrl||a.spotLogoUrl||m,D=T?w(T,"avatar"):h,M=e.leadModal.titleImagePreview||a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||"",B=M?w(M,"medium"):h,o=e.leadModal.mode==="edit"&&!!a.id,O=!!e.leadModal.actionsOpen,k=!!e.leadModal.deleting,v=y(a.customerType||"cafe"),A=a.billingCycle==="yearly"?"yearly":"monthly",i=I(a.country||U.defaultCountry),u=String(typeof C=="function"&&C(i,"EUR")||"EUR").trim().toUpperCase()||"EUR",_=p(e.leadModal.locations,a.address||"",e.leadModal.coords||c(i)),E=b(v,U),R=E*12,j=A==="yearly"?R:E,z=ne(a),V=a.specialEnabled===!0,K=e.leadModal.coords&&Number.isFinite(Number(e.leadModal.coords.lat))&&Number.isFinite(Number(e.leadModal.coords.lng))?{lat:Number(e.leadModal.coords.lat),lng:Number(e.leadModal.coords.lng)}:null;return`
    <div id="leadCreateView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-28">
      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="mb-6 flex items-start justify-between">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CRM</span>
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">${t(o?"Ndrysho lead-in":"Lead i ri")}</h2>
          </div>
          ${o?`
            <div class="relative">
              <button id="leadInlineActionsToggle" type="button" class="w-11 h-11 rounded-2xl bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center active:scale-95 ${k?"opacity-60 cursor-not-allowed":""}" ${k?"disabled":""}>
                ${l("ellipsis-vertical","w-4 h-4")}
              </button>
              ${O?'<button id="leadInlineActionsBackdrop" type="button" class="fixed inset-0 z-[5] bg-transparent"></button>':""}
              <div class="absolute right-0 top-14 z-10 min-w-[170px] rounded-2xl border border-slate-100 bg-white shadow-xl p-2 ${O?"":"hidden"}">
                <button id="leadInlineDeleteBtn" type="button" class="w-full px-4 py-3 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest text-left flex items-center gap-2 active:scale-95 ${k?"opacity-60 cursor-not-allowed":""}" ${k?"disabled":""}>
                  ${l("trash-2","w-3.5 h-3.5")}
                  ${t(k?"Duke fshire...":"Fshi lead-in")}
                </button>
              </div>
            </div>
          `:""}
        </div>
        <input type="file" id="leadLogoInput" class="hidden" accept="image/*" />
        <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
          <img id="leadLogoPreview" src="${t(L)}" class="w-full h-44 object-contain bg-white" />
        </div>
        <button id="leadLogoTrigger" type="button" class="w-full mt-4 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Ngarko logon</button>
        <input type="file" id="leadBestSpotLogoInput" class="hidden" accept="image/*" />
        <div class="mt-4 rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
          <img id="leadBestSpotLogoPreview" src="${t(D)}" class="w-full h-44 object-cover bg-white" />
        </div>
        <button id="leadBestSpotLogoTrigger" type="button" class="w-full mt-4 py-3 rounded-2xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">Ngarko logon Best-Spot</button>
        <input type="file" id="leadTitleImageInput" class="hidden" accept="image/*" />
        <div class="mt-4 rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
          <img id="leadTitleImagePreview" src="${t(B)}" class="w-full h-44 object-cover bg-white" />
        </div>
        <button id="leadTitleImageTrigger" type="button" class="w-full mt-4 py-3 rounded-2xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">Ngarko foton e titullit</button>
        <div class="mt-5 space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
            <div class="relative mt-2">
              <select id="leadCustomerType" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${g.map(N=>`<option value="${N}" ${v===N?"selected":""}>${t(r[N])}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${l("chevron-down","w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Business Name</label>
            <input id="leadBusinessName" type="text" value="${t(a.businessName||"")}" placeholder="Business Name" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="leadEmail" type="email" value="${t(a.email||d(a.businessName||""))}" readonly class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-500 border-none outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Fjalekalimi</label>
            <input id="leadPassword" type="password" value="${t(a.password||"")}" placeholder="bosh = nuk krijohet login" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngjyrat e emrit te biznesit</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Ngjyra pjesa 1</label>
              <input id="leadBusinessNameColorPart1" type="text" value="${t(z.part1)}" placeholder="#111827" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-black uppercase border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Ngjyra pjesa 2</label>
              <input id="leadBusinessNameColorPart2" type="text" value="${t(z.part2)}" placeholder="#4f46e5" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-black uppercase border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Te dhenat e klientit</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
              <input id="leadCustomerFirstName" type="text" value="${t(a.contactFirstName||"")}" placeholder="Emri" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
              <input id="leadCustomerLastName" type="text" value="${t(a.contactLastName||"")}" placeholder="Mbiemri" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Telefon</label>
              <input id="leadPhone" type="text" value="${t(a.phone||"")}" placeholder="+383" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Instagram</label>
              <input id="leadInstagram" type="text" value="${t(a.instagram||"")}" placeholder="@mnyra" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Facebook</label>
              <input id="leadFacebook" type="text" value="${t(a.facebook||"")}" placeholder="Facebook" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">TikTok</label>
              <input id="leadTiktok" type="text" value="${t(a.tiktok||"")}" placeholder="TikTok" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Google Maps</label>
            <input id="leadGoogleMaps" type="text" value="${t(a.googleMaps||"")}" placeholder="https://maps.google.com/..." class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Restaurant Card</p>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Orari i punes</label>
            <input id="leadOpeningHours" type="text" value="${t(a.openingHours||a.hours||"")}" placeholder="Hene - Diel: 11:00 - 22:00" class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div class="grid grid-cols-1 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Garten / Terrasse</label>
              <input id="leadGardenTerraceText" type="text" value="${t(a.gardenTerraceText||a.restaurantFeatures?.gardenTerrace||"")}" placeholder="Kopsht / terrace" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Barrierefrei</label>
              <input id="leadAccessibilityText" type="text" value="${t(a.accessibilityText||a.restaurantFeatures?.accessibility||"")}" placeholder="Pa pengesa" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vegane Optionen</label>
              <input id="leadVeganOptionsText" type="text" value="${t(a.veganOptionsText||a.restaurantFeatures?.veganOptions||"")}" placeholder="Opsione vegane" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
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
              <input id="leadMonthlyPrice" type="text" value="${t(E?`${E.toFixed(2)} ${u} / Monat`:`0.00 ${u} / Monat`)}" readonly class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cmimi vjetor</label>
              <input id="leadAnnualPrice" type="text" value="${t(R?`${R.toFixed(2)} ${u} / Jahr`:`0.00 ${u} / Jahr`)}" readonly class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cmimi aktual</label>
            <input id="leadPriceValue" type="text" value="${t(j?`${j.toFixed(2)} ${u}`:`0.00 ${u}`)}" readonly class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendndodhjet</p>
            <button type="button" data-lead-location-add class="px-3 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">${l("plus","w-3.5 h-3.5")} Shto vendndodhje</button>
          </div>
          ${_.map((N,F)=>{const s=$(N);return`
              <div class="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Vendndodhja ${F+1}</p>
                  ${F>0?`<button type="button" data-lead-location-remove="${F}" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-200">${l("x","w-3.5 h-3.5")}</button>`:""}
                </div>
                <input id="leadLocationAddress_${F}" data-lead-location-address="${F}" type="text" value="${t(N.address||"")}" placeholder="Plus Code ose adresa" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
                <div id="leadLocationCoords_${F}" class="text-[9px] font-bold text-emerald-600 flex items-center gap-1 ${s?"":"hidden"}">${l("check-circle-2","w-3 h-3")} Vendndodhja u fiksua ne harte</div>
                <button type="button" data-lead-location-pick="${F}" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">${l("map-pin","w-3.5 h-3.5")} Auf Karte festlegen</button>
              </div>
            `}).join("")}
          <div id="leadCoordsDisplay" class="${K?"":"hidden"} text-[9px] font-bold text-emerald-600 flex items-center gap-1">
            ${l("check-circle-2","w-3 h-3")} ${K?t(`${K.lat.toFixed(4)}, ${K.lng.toFixed(4)}`):""}
          </div>
        </div>
        <div class="mt-6 space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Land</label>
            <div class="relative mt-2">
              <select id="leadCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${x.map(N=>`<option value="${t(N)}" ${i===N?"selected":""}>${t(N)}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${l("chevron-down","w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Waehrung</label>
            <input id="leadCurrency" type="text" value="${t(u)}" readonly class="w-full mt-2 px-5 py-4 bg-slate-100 rounded-2xl text-sm font-black text-slate-500 border-none outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Qyteti</label>
            <input id="leadCity" type="text" value="${t(a.city||"")}" placeholder="Qyteti" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Adresa</label>
            <input id="leadAddress" type="text" value="${t(a.address||"")}" placeholder="Adresa" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">ZIP Code</label>
            <input id="leadZipCode" type="text" value="${t(a.zipCode||"")}" placeholder="10000" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Notiz</label>
            <textarea id="leadNote" rows="3" placeholder="Shenim i shkurter..." class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${t(a.note||"")}</textarea>
          </div>
          <label class="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktivizo Special</span>
            <input id="leadSpecialEnabled" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${V?"checked":""} />
          </label>
        </div>
        <input id="leadLogoUrl" type="hidden" value="${t(a.logoUrl||"")}" />
        <input id="leadBestSpotLogoUrl" type="hidden" value="${t(a.bestSpotLogoUrl||a.spotLogoUrl||"")}" />
        <input id="leadTitleImageUrl" type="hidden" value="${t(a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||"")}" />
        <input id="leadStatus" type="hidden" value="${t(a.status||"registered")}" />
        <input id="leadContactName" type="hidden" value="${t(S(a.contactFirstName,a.contactLastName,a.contactName||""))}" />
        <div class="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${t(e.leadModal.status||"")}</div>
        <button id="leadInlineSaveBtn" type="button" class="w-full mt-5 py-4 rounded-[1.8rem] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform" ${e.leadModal.loading?"disabled":""}>${t(e.leadModal.loading?"Duke ruajtur...":o?"Ruaj lead-in":"Krijo lead")}</button>
      </div>
    </div>
  `}function pe(n={}){const{state:e,icon:l,escapeHtml:t,getCurrentCeoMeta:P,getStaffFormEmail:w,getOptimizedImageUrl:h,PLACEHOLDER_IMAGE:y,isPlaceholderUrl:p,CEO_COUNTRIES:c,normalizeCeoCountry:b}=n,g=P(),r=e.staff.form||{},d=!!e.staff.editorUid,$=d&&String(e.staff.editorUid||"")===String(g.uid||""),x=r.coords&&Number.isFinite(Number(r.coords.lat))&&Number.isFinite(Number(r.coords.lng))?{lat:Number(r.coords.lat),lng:Number(r.coords.lng)}:null,I=w(r,{preferStored:d}),C=r.avatarPreview||r.avatarUrl||"",S=C?h(C,"avatar"):y,a=!S||p(S)?y:S,U=e.staff.saving?d?"Duke ruajtur...":"Erstelle CEO...":d?"Ruaj CEO-n":"Krijo CEO";return`
    <div id="staffEditorView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="mb-6">
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CEO</span>
        <h2 class="text-2xl font-black italic uppercase tracking-tighter">${t(d?"Edit CEO":"Create CEO")}</h2>
      </div>

      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <input type="file" id="staffAvatarInput" class="hidden" accept="image/*" />
        <div class="flex flex-col items-center mb-6">
          <button id="staffAvatarTrigger" type="button" class="relative group">
            <img id="staffAvatarPreview" src="${t(a)}" class="w-28 h-28 rounded-[2.6rem] object-cover border-4 border-white shadow-xl bg-slate-100" onerror="this.src='${y}'" />
            <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              ${l("camera","w-4 h-4")}
            </div>
          </button>
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4">Ngarko foton e profilit</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
            <input id="staffFirstName" type="text" value="${t(r.firstName||"")}" placeholder="Emri" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
            <input id="staffLastName" type="text" value="${t(r.lastName||"")}" placeholder="Mbiemri" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="staffEmail" type="email" value="${t(I)}" placeholder="vornamenachname@mnyra.com" readonly class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-500 border-none outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Fjalekalimi</label>
            <input id="staffPassword" type="password" value="" placeholder="${t(d?"Fjalekalimi mbetet i pandryshuar":"Shkruaj fjalekalimin")}" ${d?"disabled":""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 ${d?"text-slate-400":""}" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Land</label>
            <div class="relative mt-2">
              <select id="staffCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${c.map(m=>`<option value="${t(m)}" ${b(r.country)===m?"selected":""}>${t(m)}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${l("chevron-down","w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vendndodhja</label>
            <input id="staffLocationLabel" type="text" value="${t(r.locationLabel||"")}" placeholder="Vendndodhja / Adresa" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>

        <button id="staffLocationPickBtn" type="button" class="w-full mt-4 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
          ${l("map-pin","w-4 h-4")} Zgjidh vendndodhjen me pin
        </button>
        <div id="staffCoordsDisplay" class="mt-3 ${x?"":"hidden"} px-3 py-3 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
          ${l("check-circle-2","w-4 h-4")} ${x?t(`${x.lat.toFixed(4)}, ${x.lng.toFixed(4)}`):""}
        </div>

        ${e.staff.error?`<div class="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${t(e.staff.error)}</div>`:""}
        ${e.staff.status?`<div class="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${t(e.staff.status)}</div>`:""}

        <button id="staffSaveBtn" type="button" class="w-full mt-5 py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${e.staff.saving?"disabled":""}>
          ${t(U)}
        </button>
        ${d?`
          <button id="staffDeleteBtn" type="button" class="w-full mt-3 py-4 rounded-[1.8rem] bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 active:scale-95 transition-transform ${$?"opacity-60 cursor-not-allowed":""}" ${e.staff.deleting||$?"disabled":""}>
            ${t(e.staff.deleting?"Duke fshire...":"Fshi CEO-n")}
          </button>
        `:""}
      </div>
    </div>
  `}function ue(n={}){const{state:e,icon:l,escapeHtml:t,isCeoUser:P,renderCeoGuard:w,renderLeadSettingsView:h,renderLeadCreationView:y,normalizeSearchKey:p,normalizeLeadStatusKey:c,normalizeLeadScopeKey:b,createLeadScopeMap:g,sanitizeCeoCrmCounts:r,hasStoredCeoCrmCounts:d,resolveKnownScopeCountLabel:$,leadMatchesQuery:x,leadStatusTone:I,leadStatusLabel:C,buildLeadLandingPageUrl:S,getOptimizedImageUrl:a,PLACEHOLDER_IMAGE:U,renderOwnershipPills:m,renderCeoScopeTabs:L,LEAD_STATUS_ORDER:T,LEAD_STATUS_LABELS:D}=n;if(!P())return w("Leads");if(e.leads.view==="settings")return h();if(e.leads.view==="create")return y();const M=p(e.leads.query||""),B=c(e.leads.status||""),o=b(e.leads.scope),O=e.leads.pages||g(()=>[]);e.leads.hasMore||g(()=>!1);const k=e.leads.loaded||g(()=>!1),v=e.leads.knownCount||g(()=>0),A=e.leads.countExact||g(()=>!1),i=r(e.userProfile?.crmCounts||{}),u=d(e.userProfile?.crmCounts)?String(i.ownLeads):$(v.own,!!A.own,!!k.own),_=d(e.userProfile?.crmCounts)?String(i.staffLeads):$(v.staff,!!A.staff,!!k.staff),E=d(e.userProfile?.crmCounts)?String(i.archivedLeads):$(v.archived,!!A.archived,!!k.archived),R=(()=>{try{return typeof performance<"u"&&typeof performance.now=="function"?performance.now():Date.now()}catch{return Date.now()}})();let j=Array.isArray(O[o])?O[o].slice():[];B&&o!=="archived"&&(j=j.filter(s=>c(s.status)===B));const z=(s,f=null)=>{const H=Array.isArray(s?.locations)?s.locations.map(G=>G?.address||G?.city||"").join(" "):"";return String(s?._searchKey||"").trim()||p([s?.businessName,s?.restaurantName,s?.name,f?.name,f?.restaurantName,s?.contactName,s?.phone,s?.email,s?.socialEmail,s?.instagram,s?.city,s?.address,s?.publicSlug,s?.landingSlug,f?.publicSlug,f?.landingSlug,s?.canonicalPublicPath,s?.status,C(s?.status),s?.customerType,H].filter(Boolean).join(" "))},V=j.map(s=>{const f=s.restaurantId?e.restaurants.find(G=>String(G.id)===String(s.restaurantId)):null,H=z(s,f);return{lead:s,rest:f,searchKey:H,matches:!M||x({...s,_searchKey:H},M)}}),K=V.filter(s=>s.matches).length,N=e.leads.loading?'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Leads po ngarkohen...</div>':V.length?`
      ${V.map(({lead:s,rest:f,searchKey:H,matches:G})=>{const Y=I(s.status),te=C(s.status),J=s.logoUrl||s.logo||f?.logoUrl||f?.logo||"",ae=J?a(J,"avatar"):U,Z=s.businessName||f?.name||f?.restaurantName||"Business",W=s.email||s.socialEmail||"",X=String(s.landingRestaurantId||s.restaurantId||f?.id||"").trim(),q=String(s.publicSlug||s.landingSlug||f?.publicSlug||f?.landingSlug||"").trim(),ee=!!String(X||q).trim()&&typeof S=="function"?String(S(X,{publicSlug:q,landingSlug:q,businessName:Z})||"").trim():"",se=m(s,{hideOwn:o==="own"});return`
        <div data-lead-row="true" data-lead-search-key="${t(H)}" class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm" ${G?"":"hidden"}>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
              <img src="${t(ae)}" class="w-full h-full object-contain bg-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${t(Z)}</p>
              ${W?`<p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">${t(W)}</p>`:""}
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${Y.bg} ${Y.text}">${t(te)}</span>
          </div>
          ${se}
          <div class="flex gap-2 mt-4">
            ${ee?`<a href="${t(ee)}" target="_blank" rel="noopener noreferrer" class="px-4 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500">Profil</a>`:""}
            <button data-lead-edit="${t(s.id)}" class="flex-1 py-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Ndrysho</button>
          </div>
        </div>
      `}).join("")}
      <div id="leadsNoResults" class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16" ${K?"hidden":""}>Nuk ka leads</div>
    `:'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Nuk ka leads</div>',F=(()=>{try{return typeof performance<"u"&&typeof performance.now=="function"?performance.now():Date.now()}catch{return Date.now()}})();return le("lead list render",{scope:o,count:V.length,items:K,elapsedMs:F-R}),`
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
      ${L({idPrefix:"lead-scope",active:o,tabs:[{key:"own",label:"Leads te mi",count:u},{key:"staff",label:"Leads te stafit",count:_},{key:"archived",label:"Archiviert",count:E}]})}
      <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-3 flex items-center gap-3">
        ${l("search","w-4 h-4 text-slate-400")}
        <input id="leadsSearchInput" type="text" value="${t(e.leads.query||"")}" placeholder="Kerko lead..." class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none" />
      </div>
      ${o!=="archived"?`
        <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-4 flex items-center gap-3">
          ${l("list-filter","w-4 h-4 text-slate-400")}
          <select id="leadsStatusFilter" class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none appearance-none">
            <option value="">Te gjitha statuset</option>
            ${T.filter(s=>s!=="kunde"&&s!=="no_interest").map(s=>`
              <option value="${s}" ${B===s?"selected":""}>${D[s]}</option>
            `).join("")}
          </select>
          ${l("chevron-down","w-4 h-4 text-slate-400")}
        </div>
      `:""}
      ${e.leads.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${t(e.leads.error)}</div>`:""}
      <div id="leadsList" class="space-y-4">${N}</div>
      ${e.leads.hasMore?.[o]?`
        <div id="leadsLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${t(e.leads.loadingMore?"Laedt...":"Scrollt weiter...")}
        </div>
      `:""}
    </div>
  `}function be(n={}){const{state:e,icon:l,escapeHtml:t,isCeoUser:P,renderCeoGuard:w,normalizeSearchKey:h,normalizeCustomerScopeKey:y,createCustomerScopeMap:p,sanitizeCeoCrmCounts:c,hasStoredCeoCrmCounts:b,resolveKnownScopeCountLabel:g,customerMatchesQuery:r,toDateSafe:d,getOptimizedImageUrl:$,PLACEHOLDER_IMAGE:x,leadTypeLabel:I,customerStatusLabel:C,isCustomerRestaurant:S,renderOwnershipPills:a,renderCeoScopeTabs:U}=n;if(!P())return w("Klientet");const m=h(e.customers.query||""),L=y(e.customers.scope),T=e.customers.pages||p(()=>[]);e.customers.hasMore||p(()=>!1);const D=e.customers.loaded||p(()=>!1),M=e.customers.knownCount||p(()=>0),B=e.customers.countExact||p(()=>!1),o=c(e.userProfile?.crmCounts||{}),O=b(e.userProfile?.crmCounts)?String(o.ownCustomers):g(M.own,!!B.own,!!D.own),k=b(e.userProfile?.crmCounts)?String(o.staffCustomers):g(M.staff,!!B.staff,!!D.staff),v=(Array.isArray(T[L])?T[L].slice():[]).filter(i=>r(i,m)).sort((i,u)=>(d(u?.createdAt)?.getTime()||0)-(d(i?.createdAt)?.getTime()||0)),A=e.customers.loading?'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Klientet po ngarkohen...</div>':v.length?v.map(i=>{const u=i.logoUrl||i.logo||"",_=u?$(u,"avatar"):x,E=i.name||i.restaurantName||"Business",R=I(i.type||i.customerType||""),j=i.city||"",z=C(S(i)?"kunde":i.status),V=a(i,{hideOwn:L==="own"});return`
        <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
              <img src="${t(_)}" class="w-full h-full object-contain bg-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${t(E)}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">${t([R,j].filter(Boolean).join(" / "))}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">${t(z)}</span>
          </div>
          ${V}
          <div class="flex gap-2 mt-4">
            <button data-customer-edit="${t(i.id)}" class="flex-1 py-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Ndrysho</button>
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
      ${U({idPrefix:"customer-scope",active:L,ownLabel:"Klientet e mi",ownCount:O,staffLabel:"Klientet e stafit",staffCount:k})}
      <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-4 flex items-center gap-3">
        ${l("search","w-4 h-4 text-slate-400")}
        <input id="customersSearchInput" type="text" value="${t(e.customers.query||"")}" placeholder="Kerko klient..." class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none" />
      </div>
      ${e.customers.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${t(e.customers.error)}</div>`:""}
      <div class="space-y-4">${A}</div>
      ${e.customers.hasMore?.[L]?`
        <div id="customersLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${t(e.customers.loadingMore?"Laedt...":"Scrollt weiter...")}
        </div>
      `:""}
    </div>
  `}function xe(n={}){const{state:e,icon:l,escapeHtml:t,isCeoUser:P,renderCeoGuard:w,renderStaffEditorView:h,getCurrentCeoMeta:y,getOptimizedImageUrl:p,isPlaceholderUrl:c,PLACEHOLDER_IMAGE:b,normalizeHandle:g,staffBuildStatus:r,staffBuildStatusLoading:d,staffBuildStatusError:$}=n;if(!P())return w("Staff");if(e.staff.view==="form")return h();const x=r&&typeof r=="object"?r:e?.staff?.buildStatus||{},I=String(x.commitShort||"").trim()||"i panjohur",C=oe(x.buildTimestamp||""),S=String(x.branch||"").trim()||"i panjohur",a=String(x.environment||"").trim()||"i panjohur",U=!!(d??e?.staff?.buildStatusLoading),m=String($??e?.staff?.buildStatusError??"").trim(),L=y(),T=Array.isArray(e.staff.items)?e.staff.items.slice():[],D=[...Array.isArray(e.leads.pages?.own)?e.leads.pages.own:[],...Array.isArray(e.leads.pages?.staff)?e.leads.pages.staff:[],...Array.isArray(e.leads.pages?.archived)?e.leads.pages.archived:[]],M=[...Array.isArray(e.customers.pages?.own)?e.customers.pages.own:[],...Array.isArray(e.customers.pages?.staff)?e.customers.pages.staff:[]],B=e.staff.loading?'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Stafi po ngarkohet...</div>':T.length?T.map(o=>{const O=String(o.uid||"")===String(L.uid||""),k=O?"Du":String(o.ceoParentUid||"")===String(L.uid||"")?"Direkt":"Unterstaff",v=o.crmCounts&&typeof o.crmCounts=="object"?o.crmCounts:{},A=Number.isFinite(Number(v.ownLeads))?Number(v.ownLeads):D.filter(j=>String(j.createdByUid||"")===String(o.uid||"")).length,i=Number.isFinite(Number(v.ownCustomers))?Number(v.ownCustomers):M.filter(j=>String(j.createdByUid||"")===String(o.uid||"")).length,u=o.locationLabel||o.location||o.city||o.country||"-",_=o.avatarPreview||o.avatarUrl||o.avatar||"",E=_?p(_,"avatar"):b,R=!E||c(E)?b:E;return`
        <button data-staff-edit="${t(o.uid||"")}" class="w-full text-left bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-[1.4rem] overflow-hidden bg-slate-100 shrink-0">
              <img src="${t(R)}" class="w-full h-full object-cover" onerror="this.src='${b}'" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${t(o.name||"CEO")}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">@${t(o.handle||g(o.name||"ceo"))}</p>
              <p class="text-[10px] font-bold text-slate-500 mt-2 truncate">${t(o.email||"-")}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${O?"bg-slate-900 text-white":"bg-indigo-50 text-indigo-600"}">${t(k)}</span>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">${t(o.country||"-")}</span>
            <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest truncate max-w-full">${t(u)}</span>
          </div>
          <div class="grid grid-cols-2 gap-3 mt-4">
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Leads</p>
              <p class="text-sm font-black text-slate-900 mt-1">${t(String(A))}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Klientet</p>
              <p class="text-sm font-black text-slate-900 mt-1">${t(String(i))}</p>
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
      ${e.staff.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${t(e.staff.error)}</div>`:""}
      ${e.staff.status?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">${t(e.staff.status)}</div>`:""}
      <div class="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Build Status</p>
        <div class="mt-2 grid grid-cols-[0.95fr_1.05fr] gap-y-1 text-[10px] font-bold">
          <span class="text-slate-400 uppercase">Commit</span>
          <span class="text-slate-700 text-right font-mono">${t(I)}</span>
          <span class="text-slate-400 uppercase">Build</span>
          <span class="text-slate-700 text-right">${t(C)}</span>
          <span class="text-slate-400 uppercase">Branch</span>
          <span class="text-slate-700 text-right">${t(S)}</span>
          <span class="text-slate-400 uppercase">Env</span>
          <span class="text-slate-700 text-right">${t(a)}</span>
        </div>
        ${U?'<p class="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Build info po ngarkohet...</p>':""}
        ${m?`<p class="mt-2 text-[9px] font-bold text-amber-600 uppercase tracking-widest">${t(m)}</p>`:""}
      </div>
      <div class="space-y-4">${B}</div>
      ${e.staff.hasMore?`
        <div id="staffLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${t(e.staff.loadingMore?"Laedt...":"Scrollt weiter...")}
        </div>
      `:""}
    </div>
  `}export{be as renderCustomersView,ce as renderLeadCreationView,de as renderLeadSettingsView,ue as renderLeadsView,pe as renderStaffEditorView,xe as renderStaffView};
