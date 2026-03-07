export function renderLeadSettingsView(ctx = {}) {
  const {
    state,
    icon,
    escapeHtml,
    getLeadSettingsConfig,
    LEAD_SOCIAL_DEFAULT_PASSWORD,
    CEO_COUNTRIES,
    LEAD_TYPE_ORDER,
    LEAD_TYPE_LABELS
  } = ctx;
  const config = getLeadSettingsConfig();
  const explicitPassword = String(state.userProfile?.leadSettings?.defaultPassword || "").trim();
  const passwordValue = explicitPassword && explicitPassword !== LEAD_SOCIAL_DEFAULT_PASSWORD
    ? explicitPassword
    : "";
  return `
    <div id="leadSettingsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Lead Passwort Standard</label>
            <input id="leadSettingsPassword" type="text" value="${escapeHtml(passwordValue)}" placeholder="Hier eingeben" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Standard Standort Land</label>
            <div class="relative mt-2">
              <select id="leadSettingsDefaultCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${CEO_COUNTRIES.map((country) => `<option value="${escapeHtml(country)}" ${config.defaultCountry === country ? "selected" : ""}>${escapeHtml(country)}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${icon("chevron-down", "w-4 h-4")}</div>
            </div>
          </div>
        </div>
        <div class="mt-6">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Typen / Monatlicher Abo Preis</p>
            <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">x12 = Jahr</span>
          </div>
          <div class="space-y-3">
            ${LEAD_TYPE_ORDER.map((key) => {
              const price = Number(config.pricing?.[key]) || 0;
              return `
                <div class="grid grid-cols-[1.2fr_0.8fr] gap-3 items-center">
                  <div class="px-4 py-4 rounded-2xl bg-slate-50 text-sm font-black text-slate-700">${escapeHtml(LEAD_TYPE_LABELS[key])}</div>
                  <div class="relative">
                    <input id="leadPrice_${escapeHtml(key)}" type="number" min="0" step="0.01" value="${escapeHtml(price ? price.toFixed(2) : "0.00")}" class="w-full px-4 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
                    <span class="absolute inset-y-0 right-4 flex items-center text-[10px] font-black text-slate-400 uppercase">EUR</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
        ${state.leads.settingsStatus ? `<div class="mt-5 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${escapeHtml(state.leads.settingsStatus)}</div>` : ""}
        <button id="leadSettingsSaveBtn" type="button" class="w-full mt-6 py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${state.leads.settingsSaving ? "disabled" : ""}>
          ${escapeHtml(state.leads.settingsSaving ? "Speichern..." : "Leads Settings speichern")}
        </button>
      </div>
    </div>
  `;
}

export function renderLeadCreationView(ctx = {}) {
  const {
    state,
    icon,
    escapeHtml,
    getLeadSettingsConfig,
    getOptimizedImageUrl,
    PLACEHOLDER_IMAGE,
    resolveCustomerType,
    normalizeLeadLocations,
    getLeadCountryCenter,
    getLeadMonthlyPrice,
    LEAD_TYPE_ORDER,
    LEAD_TYPE_LABELS,
    buildLeadAccountEmail,
    hasLeadLocationCoords,
    CEO_COUNTRIES,
    normalizeLeadCountry,
    buildLeadContactName
  } = ctx;
  const lead = state.leadModal.lead || {};
  const settings = getLeadSettingsConfig();
  const logoRaw = state.leadModal.logoPreview || lead.logoUrl || "";
  const logoUrl = logoRaw ? getOptimizedImageUrl(logoRaw, "avatar") : PLACEHOLDER_IMAGE;
  const customerType = resolveCustomerType(lead.customerType || "cafe");
  const billingCycle = lead.billingCycle === "yearly" ? "yearly" : "monthly";
  const locations = normalizeLeadLocations(state.leadModal.locations, lead.address || "", state.leadModal.coords || getLeadCountryCenter(lead.country || settings.defaultCountry));
  const monthlyPrice = getLeadMonthlyPrice(customerType, settings);
  const yearlyPrice = monthlyPrice * 12;
  const totalPrice = billingCycle === "yearly" ? yearlyPrice : monthlyPrice;
  const coords = state.leadModal.coords && Number.isFinite(Number(state.leadModal.coords.lat)) && Number.isFinite(Number(state.leadModal.coords.lng))
    ? { lat: Number(state.leadModal.coords.lat), lng: Number(state.leadModal.coords.lng) }
    : null;
  return `
    <div id="leadCreateView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-28">
      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <input type="file" id="leadLogoInput" class="hidden" accept="image/*" />
        <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
          <img id="leadLogoPreview" src="${escapeHtml(logoUrl)}" class="w-full h-44 object-contain bg-white" />
        </div>
        <button id="leadLogoTrigger" type="button" class="w-full mt-4 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Logo hochladen</button>
        <div class="mt-5 space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
            <div class="relative mt-2">
              <select id="leadCustomerType" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${LEAD_TYPE_ORDER.map((key) => `<option value="${key}" ${customerType === key ? "selected" : ""}>${escapeHtml(LEAD_TYPE_LABELS[key])}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${icon("chevron-down", "w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Business Name</label>
            <input id="leadBusinessName" type="text" value="${escapeHtml(lead.businessName || "")}" placeholder="Business Name" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="leadEmail" type="email" value="${escapeHtml(lead.email || buildLeadAccountEmail(lead.businessName || ""))}" readonly class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-500 border-none outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Passwort</label>
            <input id="leadPassword" type="text" value="${escapeHtml(lead.password || settings.defaultPassword || "")}" readonly class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-500 border-none outline-none" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kunden Daten</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
              <input id="leadCustomerFirstName" type="text" value="${escapeHtml(lead.contactFirstName || "")}" placeholder="Vorname" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
              <input id="leadCustomerLastName" type="text" value="${escapeHtml(lead.contactLastName || "")}" placeholder="Nachname" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Telefon</label>
              <input id="leadPhone" type="text" value="${escapeHtml(lead.phone || "")}" placeholder="+383" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Instagram</label>
              <input id="leadInstagram" type="text" value="${escapeHtml(lead.instagram || "")}" placeholder="@mnyra" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Facebook</label>
              <input id="leadFacebook" type="text" value="${escapeHtml(lead.facebook || "")}" placeholder="Facebook" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">TikTok</label>
              <input id="leadTiktok" type="text" value="${escapeHtml(lead.tiktok || "")}" placeholder="TikTok" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Google Maps</label>
            <input id="leadGoogleMaps" type="text" value="${escapeHtml(lead.googleMaps || "")}" placeholder="https://maps.google.com/..." class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abo</p>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Laufzeit</label>
            <div class="relative mt-2">
              <select id="leadBillingCycle" class="w-full px-5 py-4 pr-12 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                <option value="monthly" ${billingCycle === "monthly" ? "selected" : ""}>Monatlich</option>
                <option value="yearly" ${billingCycle === "yearly" ? "selected" : ""}>Jaehrlich</option>
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${icon("chevron-down", "w-4 h-4")}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis monatlich</label>
              <input id="leadMonthlyPrice" type="text" value="${escapeHtml(monthlyPrice ? `${monthlyPrice.toFixed(2)} EUR / Monat` : "0.00 EUR / Monat")}" readonly class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis jaehrlich</label>
              <input id="leadAnnualPrice" type="text" value="${escapeHtml(yearlyPrice ? `${yearlyPrice.toFixed(2)} EUR / Jahr` : "0.00 EUR / Jahr")}" readonly class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Aktueller Preis</label>
            <input id="leadPriceValue" type="text" value="${escapeHtml(totalPrice ? `${totalPrice.toFixed(2)} EUR` : "0.00 EUR")}" readonly class="w-full mt-2 px-5 py-4 bg-white rounded-2xl text-sm font-bold text-slate-500 border border-slate-100 outline-none" />
          </div>
        </div>
        <div class="mt-6 p-5 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standorte</p>
            <button type="button" data-lead-location-add class="px-3 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">${icon("plus", "w-3.5 h-3.5")} Standort</button>
          </div>
          ${locations.map((location, index) => {
            const hasCoords = hasLeadLocationCoords(location);
            return `
              <div class="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Standort ${index + 1}</p>
                  ${index > 0 ? `<button type="button" data-lead-location-remove="${index}" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-200">${icon("x", "w-3.5 h-3.5")}</button>` : ""}
                </div>
                <input id="leadLocationAddress_${index}" data-lead-location-address="${index}" type="text" value="${escapeHtml(location.address || "")}" placeholder="Plus Code oder Adresse" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
                <div id="leadLocationCoords_${index}" class="text-[9px] font-bold text-emerald-600 flex items-center gap-1 ${hasCoords ? "" : "hidden"}">${icon("check-circle-2", "w-3 h-3")} Standort auf Karte fixiert</div>
                <button type="button" data-lead-location-pick="${index}" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">${icon("map-pin", "w-3.5 h-3.5")} Auf Karte festlegen</button>
              </div>
            `;
          }).join("")}
          <div id="leadCoordsDisplay" class="${coords ? "" : "hidden"} text-[9px] font-bold text-emerald-600 flex items-center gap-1">
            ${icon("check-circle-2", "w-3 h-3")} ${coords ? escapeHtml(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`) : ""}
          </div>
        </div>
        <div class="mt-6 space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Land</label>
            <div class="relative mt-2">
              <select id="leadCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${CEO_COUNTRIES.map((country) => `<option value="${escapeHtml(country)}" ${normalizeLeadCountry(lead.country || settings.defaultCountry) === country ? "selected" : ""}>${escapeHtml(country)}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${icon("chevron-down", "w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Stadt</label>
            <input id="leadCity" type="text" value="${escapeHtml(lead.city || "")}" placeholder="Stadt" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Adresse</label>
            <input id="leadAddress" type="text" value="${escapeHtml(lead.address || "")}" placeholder="Adresse" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">ZIP Code</label>
            <input id="leadZipCode" type="text" value="${escapeHtml(lead.zipCode || "")}" placeholder="10000" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Notiz</label>
            <textarea id="leadNote" rows="3" placeholder="Kurz notieren..." class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${escapeHtml(lead.note || "")}</textarea>
          </div>
        </div>
        <input id="leadLogoUrl" type="hidden" value="${escapeHtml(lead.logoUrl || "")}" />
        <input id="leadStatus" type="hidden" value="${escapeHtml(lead.status || "registered")}" />
        <input id="leadContactName" type="hidden" value="${escapeHtml(buildLeadContactName(lead.contactFirstName, lead.contactLastName, lead.contactName || ""))}" />
        <div class="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${escapeHtml(state.leadModal.status || "")}</div>
        <button id="leadInlineSaveBtn" type="button" class="w-full mt-5 py-4 rounded-[1.8rem] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform" ${state.leadModal.loading ? "disabled" : ""}>${escapeHtml(state.leadModal.loading ? "Speichern..." : "Lead erstellen")}</button>
      </div>
    </div>
  `;
}

export function renderStaffEditorView(ctx = {}) {
  const {
    state,
    icon,
    escapeHtml,
    getCurrentCeoMeta,
    getStaffFormEmail,
    getOptimizedImageUrl,
    PLACEHOLDER_IMAGE,
    isPlaceholderUrl,
    CEO_COUNTRIES,
    normalizeCeoCountry
  } = ctx;
  const current = getCurrentCeoMeta();
  const form = state.staff.form || {};
  const isEditing = !!state.staff.editorUid;
  const isSelfEdit = isEditing && String(state.staff.editorUid || "") === String(current.uid || "");
  const coords = form.coords && Number.isFinite(Number(form.coords.lat)) && Number.isFinite(Number(form.coords.lng))
    ? { lat: Number(form.coords.lat), lng: Number(form.coords.lng) }
    : null;
  const emailValue = getStaffFormEmail(form, { preferStored: isEditing });
  const avatarRaw = form.avatarPreview || form.avatarUrl || "";
  const avatarUrl = avatarRaw ? getOptimizedImageUrl(avatarRaw, "avatar") : PLACEHOLDER_IMAGE;
  const safeAvatar = (!avatarUrl || isPlaceholderUrl(avatarUrl)) ? PLACEHOLDER_IMAGE : avatarUrl;
  const saveLabel = state.staff.saving
    ? (isEditing ? "Speichern..." : "Erstelle CEO...")
    : (isEditing ? "CEO speichern" : "CEO erstellen");

  return `
    <div id="staffEditorView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="mb-6">
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CEO</span>
        <h2 class="text-2xl font-black italic uppercase tracking-tighter">${escapeHtml(isEditing ? "Edit CEO" : "Create CEO")}</h2>
      </div>

      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <input type="file" id="staffAvatarInput" class="hidden" accept="image/*" />
        <div class="flex flex-col items-center mb-6">
          <button id="staffAvatarTrigger" type="button" class="relative group">
            <img id="staffAvatarPreview" src="${escapeHtml(safeAvatar)}" class="w-28 h-28 rounded-[2.6rem] object-cover border-4 border-white shadow-xl bg-slate-100" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
            <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              ${icon("camera", "w-4 h-4")}
            </div>
          </button>
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4">Profilbild hochladen</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
            <input id="staffFirstName" type="text" value="${escapeHtml(form.firstName || "")}" placeholder="Vorname" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
            <input id="staffLastName" type="text" value="${escapeHtml(form.lastName || "")}" placeholder="Nachname" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="staffEmail" type="email" value="${escapeHtml(emailValue)}" placeholder="vornamenachname@mnyra.com" readonly class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-500 border-none outline-none" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Passwort</label>
            <input id="staffPassword" type="password" value="" placeholder="${escapeHtml(isEditing ? "Passwort bleibt unveraendert" : "Passwort eingeben")}" ${isEditing ? "disabled" : ""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 ${isEditing ? "text-slate-400" : ""}" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Land</label>
            <div class="relative mt-2">
              <select id="staffCountry" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                ${CEO_COUNTRIES.map((country) => `<option value="${escapeHtml(country)}" ${normalizeCeoCountry(form.country) === country ? "selected" : ""}>${escapeHtml(country)}</option>`).join("")}
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${icon("chevron-down", "w-4 h-4")}</div>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Standort</label>
            <input id="staffLocationLabel" type="text" value="${escapeHtml(form.locationLabel || "")}" placeholder="Standort / Adresse" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>

        <button id="staffLocationPickBtn" type="button" class="w-full mt-4 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
          ${icon("map-pin", "w-4 h-4")} Standort mit Pin waehlen
        </button>
        <div id="staffCoordsDisplay" class="mt-3 ${coords ? "" : "hidden"} px-3 py-3 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
          ${icon("check-circle-2", "w-4 h-4")} ${coords ? escapeHtml(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`) : ""}
        </div>

        ${state.staff.error ? `<div class="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${escapeHtml(state.staff.error)}</div>` : ""}
        ${state.staff.status ? `<div class="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">${escapeHtml(state.staff.status)}</div>` : ""}

        <button id="staffSaveBtn" type="button" class="w-full mt-5 py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${state.staff.saving ? "disabled" : ""}>
          ${escapeHtml(saveLabel)}
        </button>
        ${isEditing ? `
          <button id="staffDeleteBtn" type="button" class="w-full mt-3 py-4 rounded-[1.8rem] bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 active:scale-95 transition-transform ${isSelfEdit ? "opacity-60 cursor-not-allowed" : ""}" ${(state.staff.deleting || isSelfEdit) ? "disabled" : ""}>
            ${escapeHtml(state.staff.deleting ? "Loeschen..." : "CEO loeschen")}
          </button>
        ` : ""}
      </div>
    </div>
  `;
}
