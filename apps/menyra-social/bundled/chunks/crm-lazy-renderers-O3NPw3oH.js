import{m as le}from"./loading-diagnostics-utils-D9lcQexT.js";function ne(o=""){const e=String(o||"").trim();if(!e)return"unbekannt";const l=new Date(e);return Number.isFinite(l.getTime())?l.toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"}):e}function J(o="",e="#111827"){const l=String(o||"").trim();return/^#[0-9a-fA-F]{6}$/.test(l)?l:e}function oe(o={}){const e=o?.landingScreenOne&&typeof o.landingScreenOne=="object"?o.landingScreenOne:{},l=J(o?.businessNameColor||o?.landingBusinessNameColor||e.businessNameColor||"",""),t=l&&l.toLowerCase()!=="#111827"?l:"";return{part1:J(o?.businessNameColorPart1||o?.landingBusinessNameColorPart1||e.businessNameColorPart1||l||"","#111827"),part2:J(o?.businessNameColorPart2||o?.landingBusinessNameColorPart2||e.businessNameColorPart2||t||"","#4f46e5")}}function de(o={}){const{state:e,icon:l,escapeHtml:t,getLeadSettingsConfig:A,CEO_COUNTRIES:w,LEAD_TYPE_ORDER:h,LEAD_TYPE_LABELS:y}=o,p=A();return`
    <div id="leadSettingsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Standard Standort Land</label>
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
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Typen / Monatlicher Abo Preis</p>
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
          ${t(e.leads.settingsSaving?"Speichern...":"Leads Settings speichern")}
        </button>
      </div>
    </div>
  `}function ce(o={}){const{state:e,icon:l,escapeHtml:t,getLeadSettingsConfig:A,getOptimizedImageUrl:w,PLACEHOLDER_IMAGE:h,resolveCustomerType:y,normalizeLeadLocations:p,getLeadCountryCenter:c,getLeadMonthlyPrice:b,LEAD_TYPE_ORDER:g,LEAD_TYPE_LABELS:r,buildLeadAccountEmail:d,hasLeadLocationCoords:k,CEO_COUNTRIES:x,normalizeLeadCountry:I,resolveCurrencyCodeFromLeadCountry:S,buildLeadContactName:C}=o,a=e.leadModal.lead||{},U=A(),m=e.leadModal.logoPreview||a.logoUrl||"",L=m?w(m,"avatar"):h,M=e.leadModal.bestSpotLogoPreview||a.bestSpotLogoUrl||a.spotLogoUrl||m,K=M?w(M,"avatar"):h,B=e.leadModal.titleImagePreview||a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||"",j=B?w(B,"medium"):h,n=e.leadModal.mode==="edit"&&!!a.id,O=!!e.leadModal.actionsOpen,$=!!e.leadModal.deleting,v=y(a.customerType||"cafe"),T=a.billingCycle==="yearly"?"yearly":"monthly",i=I(a.country||U.defaultCountry),u=String(typeof S=="function"&&S(i,"EUR")||"EUR").trim().toUpperCase()||"EUR",D=p(e.leadModal.locations,a.address||"",e.leadModal.coords||c(i)),E=b(v,U),R=E*12,N=T==="yearly"?R:E,V=oe(a),_=a.specialEnabled===!0,z=e.leadModal.coords&&Number.isFinite(Number(e.leadModal.coords.lat))&&Number.isFinite(Number(e.leadModal.coords.lng))?{lat:Number(e.leadModal.coords.lat),lng:Number(e.leadModal.coords.lng)}:null;return`
    <div id="leadCreateView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-28">
      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="mb-6 flex items-start justify-between">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CRM</span>
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">${t(n?"Lead bearbeiten":"Neuer Lead")}</h2>
          </div>
          ${n?`
            <div class="relative">
              <button id="leadInlineActionsToggle" type="button" class="w-11 h-11 rounded-2xl bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center active:scale-95 ${$?"opacity-60 cursor-not-allowed":""}" ${$?"disabled":""}>
                ${l("ellipsis-vertical","w-4 h-4")}
              </button>
              ${O?'<button id="leadInlineActionsBackdrop" type="button" class="fixed inset-0 z-[5] bg-transparent"></button>':""}
              <div class="absolute right-0 top-14 z-10 min-w-[170px] rounded-2xl border border-slate-100 bg-white shadow-xl p-2 ${O?"":"hidden"}">
                <button id="leadInlineDeleteBtn" type="button" class="w-full px-4 py-3 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest text-left flex items-center gap-2 active:scale-95 ${$?"opacity-60 cursor-not-allowed":""}" ${$?"disabled":""}>
                  ${l("trash-2","w-3.5 h-3.5")}
                  ${t($?"Loeschen...":"Lead loeschen")}
                </button>
              </div>
            </div>
          `:""}
        </div>
        <input type="file" id="leadLogoInput" class="hidden" accept="image/*" />
        <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
          <img id="leadLogoPreview" src="${t(L)}" class="w-full h-44 object-contain bg-white" />
        </div>
        <button id="leadLogoTrigger" type="button" class="w-full mt-4 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Logo hochladen</button>
        <input type="file" id="leadBestSpotLogoInput" class="hidden" accept="image/*" />
        <div class="mt-4 rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
          <img id="leadBestSpotLogoPreview" src="${t(K)}" class="w-full h-44 object-cover bg-white" />
        </div>
        <button id="leadBestSpotLogoTrigger" type="button" class="w-full mt-4 py-3 rounded-2xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">Best-Spot-Logo hochladen</button>
        <input type="file" id="leadTitleImageInput" class="hidden" accept="image/*" />
        <div class="mt-4 rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
          <img id="leadTitleImagePreview" src="${t(j)}" class="w-full h-44 object-cover bg-white" />
        </div>
        <button id="leadTitleImageTrigger" type="button" class="w-full mt-4 py-3 rounded-2xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">Titelbild hochladen</button>
        <div class="mt-5 space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
            <div class="relative mt-2">
              <select id="leadCustomerType" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${g.map(P=>`<option value="${P}" ${v===P?"selected":""}>${t(r[P])}</option>`).join("")}
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
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Passwort</label>
            <input id="leadPassword" type="password" value="${t(a.password||"")}" placeholder="leer = kein Login wird erstellt" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Name Farben</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Farbe Teil 1</label>
              <input id="leadBusinessNameColorPart1" type="text" value="${t(V.part1)}" placeholder="#111827" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-black uppercase border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Farbe Teil 2</label>
              <input id="leadBusinessNameColorPart2" type="text" value="${t(V.part2)}" placeholder="#4f46e5" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-black uppercase border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kunden Daten</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
              <input id="leadCustomerFirstName" type="text" value="${t(a.contactFirstName||"")}" placeholder="Vorname" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
              <input id="leadCustomerLastName" type="text" value="${t(a.contactLastName||"")}" placeholder="Nachname" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
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
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Oeffnungszeiten</label>
            <input id="leadOpeningHours" type="text" value="${t(a.openingHours||a.hours||"")}" placeholder="Mo - So: 11:00 - 22:00 Uhr" class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div class="grid grid-cols-1 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Garten / Terrasse</label>
              <input id="leadGardenTerraceText" type="text" value="${t(a.gardenTerraceText||a.restaurantFeatures?.gardenTerrace||"")}" placeholder="Gastgarten" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Barrierefrei</label>
              <input id="leadAccessibilityText" type="text" value="${t(a.accessibilityText||a.restaurantFeatures?.accessibility||"")}" placeholder="Barrierefrei" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vegane Optionen</label>
              <input id="leadVeganOptionsText" type="text" value="${t(a.veganOptionsText||a.restaurantFeatures?.veganOptions||"")}" placeholder="Vegane Optionen" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abo</p>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Laufzeit</label>
            <div class="relative mt-2">
              <select id="leadBillingCycle" class="w-full px-5 py-4 pr-12 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                <option value="monthly" ${T==="monthly"?"selected":""}>Monatlich</option>
                <option value="yearly" ${T==="yearly"?"selected":""}>Jaehrlich</option>
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${l("chevron-down","w-4 h-4")}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis monatlich</label>
              <input id="leadMonthlyPrice" type="text" value="${t(E?`${E.toFixed(2)} ${u} / Monat`:`0.00 ${u} / Monat`)}" readonly class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis jaehrlich</label>
              <input id="leadAnnualPrice" type="text" value="${t(R?`${R.toFixed(2)} ${u} / Jahr`:`0.00 ${u} / Jahr`)}" readonly class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Aktueller Preis</label>
            <input id="leadPriceValue" type="text" value="${t(N?`${N.toFixed(2)} ${u}`:`0.00 ${u}`)}" readonly class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standorte</p>
            <button type="button" data-lead-location-add class="px-3 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">${l("plus","w-3.5 h-3.5")} Standort</button>
          </div>
          ${D.map((P,F)=>{const s=k(P);return`
              <div class="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Standort ${F+1}</p>
                  ${F>0?`<button type="button" data-lead-location-remove="${F}" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-200">${l("x","w-3.5 h-3.5")}</button>`:""}
                </div>
                <input id="leadLocationAddress_${F}" data-lead-location-address="${F}" type="text" value="${t(P.address||"")}" placeholder="Plus Code oder Adresse" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
                <div id="leadLocationCoords_${F}" class="text-[9px] font-bold text-emerald-600 flex items-center gap-1 ${s?"":"hidden"}">${l("check-circle-2","w-3 h-3")} Standort auf Karte fixiert</div>
                <button type="button" data-lead-location-pick="${F}" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">${l("map-pin","w-3.5 h-3.5")} Auf Karte festlegen</button>
              </div>
            `}).join("")}
          <div id="leadCoordsDisplay" class="${z?"":"hidden"} text-[9px] font-bold text-emerald-600 flex items-center gap-1">
            ${l("check-circle-2","w-3 h-3")} ${z?t(`${z.lat.toFixed(4)}, ${z.lng.toFixed(4)}`):""}
          </div>
        </div>
        <div class="mt-6 space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Land</label>
            <div class="relative mt-2">
              <select id="leadCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${x.map(P=>`<option value="${t(P)}" ${i===P?"selected":""}>${t(P)}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${l("chevron-down","w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Waehrung</label>
            <input id="leadCurrency" type="text" value="${t(u)}" readonly class="w-full mt-2 px-5 py-4 bg-slate-100 rounded-2xl text-sm font-black text-slate-500 border-none outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Stadt</label>
            <input id="leadCity" type="text" value="${t(a.city||"")}" placeholder="Stadt" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Adresse</label>
            <input id="leadAddress" type="text" value="${t(a.address||"")}" placeholder="Adresse" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">ZIP Code</label>
            <input id="leadZipCode" type="text" value="${t(a.zipCode||"")}" placeholder="10000" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Notiz</label>
            <textarea id="leadNote" rows="3" placeholder="Kurz notieren..." class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${t(a.note||"")}</textarea>
          </div>
          <label class="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Special aktivieren</span>
            <input id="leadSpecialEnabled" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${_?"checked":""} />
          </label>
        </div>
        <input id="leadLogoUrl" type="hidden" value="${t(a.logoUrl||"")}" />
        <input id="leadBestSpotLogoUrl" type="hidden" value="${t(a.bestSpotLogoUrl||a.spotLogoUrl||"")}" />
        <input id="leadTitleImageUrl" type="hidden" value="${t(a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||"")}" />
        <input id="leadStatus" type="hidden" value="${t(a.status||"registered")}" />
        <input id="leadContactName" type="hidden" value="${t(C(a.contactFirstName,a.contactLastName,a.contactName||""))}" />
        <div class="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${t(e.leadModal.status||"")}</div>
        <button id="leadInlineSaveBtn" type="button" class="w-full mt-5 py-4 rounded-[1.8rem] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform" ${e.leadModal.loading?"disabled":""}>${t(e.leadModal.loading?"Speichern...":n?"Lead speichern":"Lead erstellen")}</button>
      </div>
    </div>
  `}function pe(o={}){const{state:e,icon:l,escapeHtml:t,getCurrentCeoMeta:A,getStaffFormEmail:w,getOptimizedImageUrl:h,PLACEHOLDER_IMAGE:y,isPlaceholderUrl:p,CEO_COUNTRIES:c,normalizeCeoCountry:b}=o,g=A(),r=e.staff.form||{},d=!!e.staff.editorUid,k=d&&String(e.staff.editorUid||"")===String(g.uid||""),x=r.coords&&Number.isFinite(Number(r.coords.lat))&&Number.isFinite(Number(r.coords.lng))?{lat:Number(r.coords.lat),lng:Number(r.coords.lng)}:null,I=w(r,{preferStored:d}),S=r.avatarPreview||r.avatarUrl||"",C=S?h(S,"avatar"):y,a=!C||p(C)?y:C,U=e.staff.saving?d?"Speichern...":"Erstelle CEO...":d?"CEO speichern":"CEO erstellen";return`
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
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4">Profilbild hochladen</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
            <input id="staffFirstName" type="text" value="${t(r.firstName||"")}" placeholder="Vorname" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
            <input id="staffLastName" type="text" value="${t(r.lastName||"")}" placeholder="Nachname" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="staffEmail" type="email" value="${t(I)}" placeholder="vornamenachname@mnyra.com" readonly class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-500 border-none outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Passwort</label>
            <input id="staffPassword" type="password" value="" placeholder="${t(d?"Passwort bleibt unveraendert":"Passwort eingeben")}" ${d?"disabled":""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 ${d?"text-slate-400":""}" />
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
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Standort</label>
            <input id="staffLocationLabel" type="text" value="${t(r.locationLabel||"")}" placeholder="Standort / Adresse" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>

        <button id="staffLocationPickBtn" type="button" class="w-full mt-4 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
          ${l("map-pin","w-4 h-4")} Standort mit Pin waehlen
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
          <button id="staffDeleteBtn" type="button" class="w-full mt-3 py-4 rounded-[1.8rem] bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 active:scale-95 transition-transform ${k?"opacity-60 cursor-not-allowed":""}" ${e.staff.deleting||k?"disabled":""}>
            ${t(e.staff.deleting?"Loeschen...":"CEO loeschen")}
          </button>
        `:""}
      </div>
    </div>
  `}function ue(o={}){const{state:e,icon:l,escapeHtml:t,isCeoUser:A,renderCeoGuard:w,renderLeadSettingsView:h,renderLeadCreationView:y,normalizeSearchKey:p,normalizeLeadStatusKey:c,normalizeLeadScopeKey:b,createLeadScopeMap:g,sanitizeCeoCrmCounts:r,hasStoredCeoCrmCounts:d,resolveKnownScopeCountLabel:k,leadMatchesQuery:x,leadStatusTone:I,leadStatusLabel:S,buildLeadLandingPageUrl:C,getOptimizedImageUrl:a,PLACEHOLDER_IMAGE:U,renderOwnershipPills:m,renderCeoScopeTabs:L,LEAD_STATUS_ORDER:M,LEAD_STATUS_LABELS:K}=o;if(!A())return w("Leads");if(e.leads.view==="settings")return h();if(e.leads.view==="create")return y();const B=p(e.leads.query||""),j=c(e.leads.status||""),n=b(e.leads.scope),O=e.leads.pages||g(()=>[]);e.leads.hasMore||g(()=>!1);const $=e.leads.loaded||g(()=>!1),v=e.leads.knownCount||g(()=>0),T=e.leads.countExact||g(()=>!1),i=r(e.userProfile?.crmCounts||{}),u=d(e.userProfile?.crmCounts)?String(i.ownLeads):k(v.own,!!T.own,!!$.own),D=d(e.userProfile?.crmCounts)?String(i.staffLeads):k(v.staff,!!T.staff,!!$.staff),E=d(e.userProfile?.crmCounts)?String(i.archivedLeads):k(v.archived,!!T.archived,!!$.archived),R=(()=>{try{return typeof performance<"u"&&typeof performance.now=="function"?performance.now():Date.now()}catch{return Date.now()}})();let N=Array.isArray(O[n])?O[n].slice():[];j&&n!=="archived"&&(N=N.filter(s=>c(s.status)===j));const V=(s,f=null)=>{const H=Array.isArray(s?.locations)?s.locations.map(G=>G?.address||G?.city||"").join(" "):"";return String(s?._searchKey||"").trim()||p([s?.businessName,s?.restaurantName,s?.name,f?.name,f?.restaurantName,s?.contactName,s?.phone,s?.email,s?.socialEmail,s?.instagram,s?.city,s?.address,s?.publicSlug,s?.landingSlug,f?.publicSlug,f?.landingSlug,s?.canonicalPublicPath,s?.status,S(s?.status),s?.customerType,H].filter(Boolean).join(" "))},_=N.map(s=>{const f=s.restaurantId?e.restaurants.find(G=>String(G.id)===String(s.restaurantId)):null,H=V(s,f);return{lead:s,rest:f,searchKey:H,matches:!B||x({...s,_searchKey:H},B)}}),z=_.filter(s=>s.matches).length,P=e.leads.loading?'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Leads laden...</div>':_.length?`
      ${_.map(({lead:s,rest:f,searchKey:H,matches:G})=>{const Y=I(s.status),te=S(s.status),Q=s.logoUrl||s.logo||f?.logoUrl||f?.logo||"",ae=Q?a(Q,"avatar"):U,Z=s.businessName||f?.name||f?.restaurantName||"Business",W=s.email||s.socialEmail||"",X=String(s.landingRestaurantId||s.restaurantId||f?.id||"").trim(),q=String(s.publicSlug||s.landingSlug||f?.publicSlug||f?.landingSlug||"").trim(),ee=!!String(X||q).trim()&&typeof C=="function"?String(C(X,{publicSlug:q,landingSlug:q,businessName:Z})||"").trim():"",se=m(s,{hideOwn:n==="own"});return`
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
            <button data-lead-edit="${t(s.id)}" class="flex-1 py-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Bearbeiten</button>
          </div>
        </div>
      `}).join("")}
      <div id="leadsNoResults" class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16" ${z?"hidden":""}>Keine Leads</div>
    `:'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Keine Leads</div>',F=(()=>{try{return typeof performance<"u"&&typeof performance.now=="function"?performance.now():Date.now()}catch{return Date.now()}})();return le("lead list render",{scope:n,count:_.length,items:z,elapsedMs:F-R}),`
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
      ${L({idPrefix:"lead-scope",active:n,tabs:[{key:"own",label:"Meine Leads",count:u},{key:"staff",label:"Staff Leads",count:D},{key:"archived",label:"Archiviert",count:E}]})}
      <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-3 flex items-center gap-3">
        ${l("search","w-4 h-4 text-slate-400")}
        <input id="leadsSearchInput" type="text" value="${t(e.leads.query||"")}" placeholder="Lead suchen..." class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none" />
      </div>
      ${n!=="archived"?`
        <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-4 flex items-center gap-3">
          ${l("list-filter","w-4 h-4 text-slate-400")}
          <select id="leadsStatusFilter" class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none appearance-none">
            <option value="">Alle Status</option>
            ${M.filter(s=>s!=="kunde"&&s!=="no_interest").map(s=>`
              <option value="${s}" ${j===s?"selected":""}>${K[s]}</option>
            `).join("")}
          </select>
          ${l("chevron-down","w-4 h-4 text-slate-400")}
        </div>
      `:""}
      ${e.leads.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${t(e.leads.error)}</div>`:""}
      <div id="leadsList" class="space-y-4">${P}</div>
      ${e.leads.hasMore?.[n]?`
        <div id="leadsLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${t(e.leads.loadingMore?"Laedt...":"Scrollt weiter...")}
        </div>
      `:""}
    </div>
  `}function be(o={}){const{state:e,icon:l,escapeHtml:t,isCeoUser:A,renderCeoGuard:w,normalizeSearchKey:h,normalizeCustomerScopeKey:y,createCustomerScopeMap:p,sanitizeCeoCrmCounts:c,hasStoredCeoCrmCounts:b,resolveKnownScopeCountLabel:g,customerMatchesQuery:r,toDateSafe:d,getOptimizedImageUrl:k,PLACEHOLDER_IMAGE:x,leadTypeLabel:I,customerStatusLabel:S,isCustomerRestaurant:C,renderOwnershipPills:a,renderCeoScopeTabs:U}=o;if(!A())return w("Kunden");const m=h(e.customers.query||""),L=y(e.customers.scope),M=e.customers.pages||p(()=>[]);e.customers.hasMore||p(()=>!1);const K=e.customers.loaded||p(()=>!1),B=e.customers.knownCount||p(()=>0),j=e.customers.countExact||p(()=>!1),n=c(e.userProfile?.crmCounts||{}),O=b(e.userProfile?.crmCounts)?String(n.ownCustomers):g(B.own,!!j.own,!!K.own),$=b(e.userProfile?.crmCounts)?String(n.staffCustomers):g(B.staff,!!j.staff,!!K.staff),v=(Array.isArray(M[L])?M[L].slice():[]).filter(i=>r(i,m)).sort((i,u)=>(d(u?.createdAt)?.getTime()||0)-(d(i?.createdAt)?.getTime()||0)),T=e.customers.loading?'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Kunden laden...</div>':v.length?v.map(i=>{const u=i.logoUrl||i.logo||"",D=u?k(u,"avatar"):x,E=i.name||i.restaurantName||"Business",R=I(i.type||i.customerType||""),N=i.city||"",V=S(C(i)?"kunde":i.status),_=a(i,{hideOwn:L==="own"});return`
        <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
              <img src="${t(D)}" class="w-full h-full object-contain bg-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${t(E)}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">${t([R,N].filter(Boolean).join(" / "))}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">${t(V)}</span>
          </div>
          ${_}
          <div class="flex gap-2 mt-4">
            <button data-customer-edit="${t(i.id)}" class="flex-1 py-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Bearbeiten</button>
          </div>
        </div>
      `}).join(""):'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Keine Kunden</div>';return`
    <div id="customersView" class="p-6 animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CRM</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Kunden</h2>
        </div>
      </div>
      ${U({idPrefix:"customer-scope",active:L,ownLabel:"Meine Kunden",ownCount:O,staffLabel:"Staff Kunden",staffCount:$})}
      <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-4 flex items-center gap-3">
        ${l("search","w-4 h-4 text-slate-400")}
        <input id="customersSearchInput" type="text" value="${t(e.customers.query||"")}" placeholder="Kunde suchen..." class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none" />
      </div>
      ${e.customers.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${t(e.customers.error)}</div>`:""}
      <div class="space-y-4">${T}</div>
      ${e.customers.hasMore?.[L]?`
        <div id="customersLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${t(e.customers.loadingMore?"Laedt...":"Scrollt weiter...")}
        </div>
      `:""}
    </div>
  `}function xe(o={}){const{state:e,icon:l,escapeHtml:t,isCeoUser:A,renderCeoGuard:w,renderStaffEditorView:h,getCurrentCeoMeta:y,getOptimizedImageUrl:p,isPlaceholderUrl:c,PLACEHOLDER_IMAGE:b,normalizeHandle:g,staffBuildStatus:r,staffBuildStatusLoading:d,staffBuildStatusError:k}=o;if(!A())return w("Staff");if(e.staff.view==="form")return h();const x=r&&typeof r=="object"?r:e?.staff?.buildStatus||{},I=String(x.commitShort||"").trim()||"unbekannt",S=ne(x.buildTimestamp||""),C=String(x.branch||"").trim()||"unbekannt",a=String(x.environment||"").trim()||"unbekannt",U=!!(d??e?.staff?.buildStatusLoading),m=String(k??e?.staff?.buildStatusError??"").trim(),L=y(),M=Array.isArray(e.staff.items)?e.staff.items.slice():[],K=[...Array.isArray(e.leads.pages?.own)?e.leads.pages.own:[],...Array.isArray(e.leads.pages?.staff)?e.leads.pages.staff:[],...Array.isArray(e.leads.pages?.archived)?e.leads.pages.archived:[]],B=[...Array.isArray(e.customers.pages?.own)?e.customers.pages.own:[],...Array.isArray(e.customers.pages?.staff)?e.customers.pages.staff:[]],j=e.staff.loading?'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Staff laden...</div>':M.length?M.map(n=>{const O=String(n.uid||"")===String(L.uid||""),$=O?"Du":String(n.ceoParentUid||"")===String(L.uid||"")?"Direkt":"Unterstaff",v=n.crmCounts&&typeof n.crmCounts=="object"?n.crmCounts:{},T=Number.isFinite(Number(v.ownLeads))?Number(v.ownLeads):K.filter(N=>String(N.createdByUid||"")===String(n.uid||"")).length,i=Number.isFinite(Number(v.ownCustomers))?Number(v.ownCustomers):B.filter(N=>String(N.createdByUid||"")===String(n.uid||"")).length,u=n.locationLabel||n.location||n.city||n.country||"-",D=n.avatarPreview||n.avatarUrl||n.avatar||"",E=D?p(D,"avatar"):b,R=!E||c(E)?b:E;return`
        <button data-staff-edit="${t(n.uid||"")}" class="w-full text-left bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-[1.4rem] overflow-hidden bg-slate-100 shrink-0">
              <img src="${t(R)}" class="w-full h-full object-cover" onerror="this.src='${b}'" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${t(n.name||"CEO")}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">@${t(n.handle||g(n.name||"ceo"))}</p>
              <p class="text-[10px] font-bold text-slate-500 mt-2 truncate">${t(n.email||"-")}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${O?"bg-slate-900 text-white":"bg-indigo-50 text-indigo-600"}">${t($)}</span>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">${t(n.country||"-")}</span>
            <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest truncate max-w-full">${t(u)}</span>
          </div>
          <div class="grid grid-cols-2 gap-3 mt-4">
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Leads</p>
              <p class="text-sm font-black text-slate-900 mt-1">${t(String(T))}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Kunden</p>
              <p class="text-sm font-black text-slate-900 mt-1">${t(String(i))}</p>
            </div>
          </div>
          <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Tippen zum Bearbeiten</span>
            <span class="w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">${l("chevron-right","w-4 h-4")}</span>
          </div>
        </button>
      `}).join(""):'<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Noch kein CEO Staff</div>';return`
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
          <span class="text-slate-700 text-right">${t(S)}</span>
          <span class="text-slate-400 uppercase">Branch</span>
          <span class="text-slate-700 text-right">${t(C)}</span>
          <span class="text-slate-400 uppercase">Env</span>
          <span class="text-slate-700 text-right">${t(a)}</span>
        </div>
        ${U?'<p class="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Build Info wird geladen...</p>':""}
        ${m?`<p class="mt-2 text-[9px] font-bold text-amber-600 uppercase tracking-widest">${t(m)}</p>`:""}
      </div>
      <div class="space-y-4">${j}</div>
      ${e.staff.hasMore?`
        <div id="staffLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${t(e.staff.loadingMore?"Laedt...":"Scrollt weiter...")}
        </div>
      `:""}
    </div>
  `}export{be as renderCustomersView,ce as renderLeadCreationView,de as renderLeadSettingsView,ue as renderLeadsView,pe as renderStaffEditorView,xe as renderStaffView};
