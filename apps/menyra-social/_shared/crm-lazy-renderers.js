function formatBuildTimestamp(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "unbekannt";
  const parsed = new Date(raw);
  if (!Number.isFinite(parsed.getTime())) return raw;
  return parsed.toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

export function renderLeadSettingsView(ctx = {}) {
  const {
    state,
    icon,
    escapeHtml,
    getLeadSettingsConfig,
    CEO_COUNTRIES,
    LEAD_TYPE_ORDER,
    LEAD_TYPE_LABELS
  } = ctx;
  const config = getLeadSettingsConfig();
  return `
    <div id="leadSettingsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="space-y-4">
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
  const isEdit = state.leadModal.mode === "edit" && !!lead.id;
  const actionsOpen = !!state.leadModal.actionsOpen;
  const deleting = !!state.leadModal.deleting;
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
        <div class="mb-6 flex items-start justify-between">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CRM</span>
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">${escapeHtml(isEdit ? "Lead bearbeiten" : "Neuer Lead")}</h2>
          </div>
          ${isEdit ? `
            <div class="relative">
              <button id="leadInlineActionsToggle" type="button" class="w-11 h-11 rounded-2xl bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center active:scale-95 ${deleting ? "opacity-60 cursor-not-allowed" : ""}" ${deleting ? "disabled" : ""}>
                ${icon("ellipsis-vertical", "w-4 h-4")}
              </button>
              ${actionsOpen ? `<button id="leadInlineActionsBackdrop" type="button" class="fixed inset-0 z-[5] bg-transparent"></button>` : ""}
              <div class="absolute right-0 top-14 z-10 min-w-[170px] rounded-2xl border border-slate-100 bg-white shadow-xl p-2 ${actionsOpen ? "" : "hidden"}">
                <button id="leadInlineDeleteBtn" type="button" class="w-full px-4 py-3 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest text-left flex items-center gap-2 active:scale-95 ${deleting ? "opacity-60 cursor-not-allowed" : ""}" ${deleting ? "disabled" : ""}>
                  ${icon("trash-2", "w-3.5 h-3.5")}
                  ${escapeHtml(deleting ? "Loeschen..." : "Lead loeschen")}
                </button>
              </div>
            </div>
          ` : ""}
        </div>
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
            <input id="leadPassword" type="password" value="${escapeHtml(lead.password || "")}" placeholder="leer = kein Login wird erstellt" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
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
        <button id="leadInlineSaveBtn" type="button" class="w-full mt-5 py-4 rounded-[1.8rem] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform" ${state.leadModal.loading ? "disabled" : ""}>${escapeHtml(state.leadModal.loading ? "Speichern..." : (isEdit ? "Lead speichern" : "Lead erstellen"))}</button>
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


export function renderLeadsView(ctx = {}) {
  const {
    state,
    icon,
    escapeHtml,
    isCeoUser,
    renderCeoGuard,
    renderLeadSettingsView,
    renderLeadCreationView,
    normalizeSearchKey,
    normalizeLeadStatusKey,
    normalizeLeadScopeKey,
    createLeadScopeMap,
    sanitizeCeoCrmCounts,
    hasStoredCeoCrmCounts,
    resolveKnownScopeCountLabel,
    leadMatchesQuery,
    leadStatusTone,
    leadStatusLabel,
    getOptimizedImageUrl,
    PLACEHOLDER_IMAGE,
    renderOwnershipPills,
    renderCeoScopeTabs,
    LEAD_STATUS_ORDER,
    LEAD_STATUS_LABELS
  } = ctx;
  if (!isCeoUser()) return renderCeoGuard("Leads");
  if (state.leads.view === "settings") return renderLeadSettingsView();
  if (state.leads.view === "create") return renderLeadCreationView();
  const queryKey = normalizeSearchKey(state.leads.query || "");
  const statusFilter = normalizeLeadStatusKey(state.leads.status || "");
  const scope = normalizeLeadScopeKey(state.leads.scope);
  const scopePages = state.leads.pages || createLeadScopeMap(() => []);
  const scopeHasMore = state.leads.hasMore || createLeadScopeMap(() => false);
  const scopeLoaded = state.leads.loaded || createLeadScopeMap(() => false);
  const knownCount = state.leads.knownCount || createLeadScopeMap(() => 0);
  const countExact = state.leads.countExact || createLeadScopeMap(() => false);
  const profileCounts = sanitizeCeoCrmCounts(state.userProfile?.crmCounts || {});
  const ownCount = hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
    ? String(profileCounts.ownLeads)
    : resolveKnownScopeCountLabel(knownCount.own, !!countExact.own, !!scopeLoaded.own);
  const staffCount = hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
    ? String(profileCounts.staffLeads)
    : resolveKnownScopeCountLabel(knownCount.staff, !!countExact.staff, !!scopeLoaded.staff);
  const archivedCount = hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
    ? String(profileCounts.archivedLeads)
    : resolveKnownScopeCountLabel(knownCount.archived, !!countExact.archived, !!scopeLoaded.archived);
  let items = Array.isArray(scopePages[scope]) ? scopePages[scope].slice() : [];
  if (statusFilter && scope !== "archived") {
    items = items.filter((lead) => normalizeLeadStatusKey(lead.status) === statusFilter);
  }
  items = items.filter((lead) => leadMatchesQuery(lead, queryKey));

  const listHtml = state.leads.loading
    ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Leads laden...</div>`
    : (items.length ? items.map((lead) => {
      const tone = leadStatusTone(lead.status);
      const statusLabel = leadStatusLabel(lead.status);
      const rest = lead.restaurantId ? state.restaurants.find((r) => String(r.id) === String(lead.restaurantId)) : null;
      const logoRaw = lead.logoUrl || lead.logo || rest?.logoUrl || rest?.logo || "";
      const logoUrl = logoRaw ? getOptimizedImageUrl(logoRaw, "avatar") : PLACEHOLDER_IMAGE;
      const businessName = lead.businessName || rest?.name || rest?.restaurantName || "Business";
      const emailLine = lead.email || lead.socialEmail || "";
      const ownershipHtml = renderOwnershipPills(lead, { hideOwn: scope === "own" });
      return `
        <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
              <img src="${escapeHtml(logoUrl)}" class="w-full h-full object-contain bg-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(businessName)}</p>
              ${emailLine ? `<p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">${escapeHtml(emailLine)}</p>` : ""}
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${tone.bg} ${tone.text}">${escapeHtml(statusLabel)}</span>
          </div>
          ${ownershipHtml}
          <div class="flex gap-2 mt-4">
            <button data-lead-edit="${escapeHtml(lead.id)}" class="flex-1 py-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Bearbeiten</button>
          </div>
        </div>
      `;
    }).join("") : `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Keine Leads</div>`);

  return `
    <div id="leadsView" class="p-6 animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CRM</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Leads</h2>
        </div>
        <div class="flex items-center gap-2">
          <button id="leadSettingsBtn" class="w-12 h-12 rounded-2xl bg-white text-slate-700 border border-slate-100 flex items-center justify-center shadow-sm active:scale-95">
            ${icon("settings", "w-4 h-4")}
          </button>
          <button id="newLeadBtn" class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200/60 active:scale-95">
            ${icon("plus", "w-4 h-4")}
          </button>
        </div>
      </div>
      ${renderCeoScopeTabs({
        idPrefix: "lead-scope",
        active: scope,
        tabs: [
          { key: "own", label: "Meine Leads", count: ownCount },
          { key: "staff", label: "Staff Leads", count: staffCount },
          { key: "archived", label: "Archiviert", count: archivedCount }
        ]
      })}
      <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-3 flex items-center gap-3">
        ${icon("search", "w-4 h-4 text-slate-400")}
        <input id="leadsSearchInput" type="text" value="${escapeHtml(state.leads.query || "")}" placeholder="Lead suchen..." class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none" />
      </div>
      ${scope !== "archived" ? `
        <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-4 flex items-center gap-3">
          ${icon("list-filter", "w-4 h-4 text-slate-400")}
          <select id="leadsStatusFilter" class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none appearance-none">
            <option value="">Alle Status</option>
            ${LEAD_STATUS_ORDER.filter((key) => key !== "kunde" && key !== "no_interest").map((key) => `
              <option value="${key}" ${statusFilter === key ? "selected" : ""}>${LEAD_STATUS_LABELS[key]}</option>
            `).join("")}
          </select>
          ${icon("chevron-down", "w-4 h-4 text-slate-400")}
        </div>
      ` : ""}
      ${state.leads.error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${escapeHtml(state.leads.error)}</div>` : ""}
      <div class="space-y-4">${listHtml}</div>
      ${state.leads.hasMore?.[scope] ? `
        <div id="leadsLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${escapeHtml(state.leads.loadingMore ? "Laedt..." : "Scrollt weiter...")}
        </div>
      ` : ""}
    </div>
  `;
}

export function renderCustomersView(ctx = {}) {
  const {
    state,
    icon,
    escapeHtml,
    isCeoUser,
    renderCeoGuard,
    normalizeSearchKey,
    normalizeCustomerScopeKey,
    createCustomerScopeMap,
    sanitizeCeoCrmCounts,
    hasStoredCeoCrmCounts,
    resolveKnownScopeCountLabel,
    customerMatchesQuery,
    toDateSafe,
    getOptimizedImageUrl,
    PLACEHOLDER_IMAGE,
    leadTypeLabel,
    customerStatusLabel,
    isCustomerRestaurant,
    renderOwnershipPills,
    renderCeoScopeTabs
  } = ctx;
  if (!isCeoUser()) return renderCeoGuard("Kunden");
  const queryKey = normalizeSearchKey(state.customers.query || "");
  const scope = normalizeCustomerScopeKey(state.customers.scope);
  const scopePages = state.customers.pages || createCustomerScopeMap(() => []);
  const scopeHasMore = state.customers.hasMore || createCustomerScopeMap(() => false);
  const scopeLoaded = state.customers.loaded || createCustomerScopeMap(() => false);
  const knownCount = state.customers.knownCount || createCustomerScopeMap(() => 0);
  const countExact = state.customers.countExact || createCustomerScopeMap(() => false);
  const profileCounts = sanitizeCeoCrmCounts(state.userProfile?.crmCounts || {});
  const ownCount = hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
    ? String(profileCounts.ownCustomers)
    : resolveKnownScopeCountLabel(knownCount.own, !!countExact.own, !!scopeLoaded.own);
  const staffCount = hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
    ? String(profileCounts.staffCustomers)
    : resolveKnownScopeCountLabel(knownCount.staff, !!countExact.staff, !!scopeLoaded.staff);
  const items = (Array.isArray(scopePages[scope]) ? scopePages[scope].slice() : [])
    .filter((rest) => customerMatchesQuery(rest, queryKey))
    .sort((a, b) => (toDateSafe(b?.createdAt)?.getTime() || 0) - (toDateSafe(a?.createdAt)?.getTime() || 0));
  const listHtml = state.customers.loading
    ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Kunden laden...</div>`
    : (items.length ? items.map((rest) => {
      const logoRaw = rest.logoUrl || rest.logo || "";
      const logoUrl = logoRaw ? getOptimizedImageUrl(logoRaw, "avatar") : PLACEHOLDER_IMAGE;
      const name = rest.name || rest.restaurantName || "Business";
      const typeLabel = leadTypeLabel(rest.type || rest.customerType || "");
      const city = rest.city || "";
      const statusLabel = customerStatusLabel(isCustomerRestaurant(rest) ? "kunde" : rest.status);
      const ownershipHtml = renderOwnershipPills(rest, { hideOwn: scope === "own" });
      return `
        <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
              <img src="${escapeHtml(logoUrl)}" class="w-full h-full object-contain bg-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(name)}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">${escapeHtml([typeLabel, city].filter(Boolean).join(" / "))}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">${escapeHtml(statusLabel)}</span>
          </div>
          ${ownershipHtml}
          <div class="flex gap-2 mt-4">
            <button data-customer-edit="${escapeHtml(rest.id)}" class="flex-1 py-3 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Bearbeiten</button>
          </div>
        </div>
      `;
    }).join("") : `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Keine Kunden</div>`);

  return `
    <div id="customersView" class="p-6 animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CRM</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Kunden</h2>
        </div>
      </div>
      ${renderCeoScopeTabs({
        idPrefix: "customer-scope",
        active: scope,
        ownLabel: "Meine Kunden",
        ownCount,
        staffLabel: "Staff Kunden",
        staffCount
      })}
      <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-4 flex items-center gap-3">
        ${icon("search", "w-4 h-4 text-slate-400")}
        <input id="customersSearchInput" type="text" value="${escapeHtml(state.customers.query || "")}" placeholder="Kunde suchen..." class="flex-1 min-w-0 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none" />
      </div>
      ${state.customers.error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${escapeHtml(state.customers.error)}</div>` : ""}
      <div class="space-y-4">${listHtml}</div>
      ${state.customers.hasMore?.[scope] ? `
        <div id="customersLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${escapeHtml(state.customers.loadingMore ? "Laedt..." : "Scrollt weiter...")}
        </div>
      ` : ""}
    </div>
  `;
}

export function renderStaffView(ctx = {}) {
  const {
    state,
    icon,
    escapeHtml,
    isCeoUser,
    renderCeoGuard,
    renderStaffEditorView,
    getCurrentCeoMeta,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    PLACEHOLDER_IMAGE,
    normalizeHandle,
    staffBuildStatus,
    staffBuildStatusLoading,
    staffBuildStatusError
  } = ctx;
  if (!isCeoUser()) return renderCeoGuard("Staff");
  if (state.staff.view === "form") return renderStaffEditorView();
  const buildStatus = staffBuildStatus && typeof staffBuildStatus === "object"
    ? staffBuildStatus
    : (state?.staff?.buildStatus || {});
  const commitShort = String(buildStatus.commitShort || "").trim() || "unbekannt";
  const buildTimestampLabel = formatBuildTimestamp(buildStatus.buildTimestamp || "");
  const branchLabel = String(buildStatus.branch || "").trim() || "unbekannt";
  const envLabel = String(buildStatus.environment || "").trim() || "unbekannt";
  const showBuildLoading = Boolean(staffBuildStatusLoading ?? state?.staff?.buildStatusLoading);
  const buildLoadError = String(staffBuildStatusError ?? state?.staff?.buildStatusError ?? "").trim();
  const current = getCurrentCeoMeta();
  const items = Array.isArray(state.staff.items) ? state.staff.items.slice() : [];
  const loadedLeadRows = [
    ...(Array.isArray(state.leads.pages?.own) ? state.leads.pages.own : []),
    ...(Array.isArray(state.leads.pages?.staff) ? state.leads.pages.staff : []),
    ...(Array.isArray(state.leads.pages?.archived) ? state.leads.pages.archived : [])
  ];
  const loadedCustomerRows = [
    ...(Array.isArray(state.customers.pages?.own) ? state.customers.pages.own : []),
    ...(Array.isArray(state.customers.pages?.staff) ? state.customers.pages.staff : [])
  ];
  const listHtml = state.staff.loading
    ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Staff laden...</div>`
    : (items.length ? items.map((entry) => {
      const isSelf = String(entry.uid || "") === String(current.uid || "");
      const relation = isSelf ? "Du" : (String(entry.ceoParentUid || "") === String(current.uid || "") ? "Direkt" : "Unterstaff");
      const storedCounts = entry.crmCounts && typeof entry.crmCounts === "object" ? entry.crmCounts : {};
      const leadCount = Number.isFinite(Number(storedCounts.ownLeads))
        ? Number(storedCounts.ownLeads)
        : loadedLeadRows.filter((lead) => String(lead.createdByUid || "") === String(entry.uid || "")).length;
      const customerCount = Number.isFinite(Number(storedCounts.ownCustomers))
        ? Number(storedCounts.ownCustomers)
        : loadedCustomerRows.filter((customer) => String(customer.createdByUid || "") === String(entry.uid || "")).length;
      const locationText = entry.locationLabel || entry.location || entry.city || entry.country || "-";
      const avatarRaw = entry.avatarPreview || entry.avatarUrl || entry.avatar || "";
      const avatarUrl = avatarRaw ? getOptimizedImageUrl(avatarRaw, "avatar") : PLACEHOLDER_IMAGE;
      const safeAvatar = (!avatarUrl || isPlaceholderUrl(avatarUrl)) ? PLACEHOLDER_IMAGE : avatarUrl;
      return `
        <button data-staff-edit="${escapeHtml(entry.uid || "")}" class="w-full text-left bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-[1.4rem] overflow-hidden bg-slate-100 shrink-0">
              <img src="${escapeHtml(safeAvatar)}" class="w-full h-full object-cover" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(entry.name || "CEO")}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">@${escapeHtml(entry.handle || normalizeHandle(entry.name || "ceo"))}</p>
              <p class="text-[10px] font-bold text-slate-500 mt-2 truncate">${escapeHtml(entry.email || "-")}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isSelf ? "bg-slate-900 text-white" : "bg-indigo-50 text-indigo-600"}">${escapeHtml(relation)}</span>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">${escapeHtml(entry.country || "-")}</span>
            <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest truncate max-w-full">${escapeHtml(locationText)}</span>
          </div>
          <div class="grid grid-cols-2 gap-3 mt-4">
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Leads</p>
              <p class="text-sm font-black text-slate-900 mt-1">${escapeHtml(String(leadCount))}</p>
            </div>
            <div class="rounded-2xl bg-slate-50 px-4 py-3">
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Kunden</p>
              <p class="text-sm font-black text-slate-900 mt-1">${escapeHtml(String(customerCount))}</p>
            </div>
          </div>
          <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Tippen zum Bearbeiten</span>
            <span class="w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">${icon("chevron-right", "w-4 h-4")}</span>
          </div>
        </button>
      `;
    }).join("") : `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Noch kein CEO Staff</div>`);

  return `
    <div id="staffView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">CEO</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Staff</h2>
        </div>
        <button id="staffNewBtn" class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200/60 active:scale-95">
          ${icon("plus", "w-4 h-4")}
        </button>
      </div>
      ${state.staff.error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-4">${escapeHtml(state.staff.error)}</div>` : ""}
      ${state.staff.status ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">${escapeHtml(state.staff.status)}</div>` : ""}
      <div class="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Build Status</p>
        <div class="mt-2 grid grid-cols-[0.95fr_1.05fr] gap-y-1 text-[10px] font-bold">
          <span class="text-slate-400 uppercase">Commit</span>
          <span class="text-slate-700 text-right font-mono">${escapeHtml(commitShort)}</span>
          <span class="text-slate-400 uppercase">Build</span>
          <span class="text-slate-700 text-right">${escapeHtml(buildTimestampLabel)}</span>
          <span class="text-slate-400 uppercase">Branch</span>
          <span class="text-slate-700 text-right">${escapeHtml(branchLabel)}</span>
          <span class="text-slate-400 uppercase">Env</span>
          <span class="text-slate-700 text-right">${escapeHtml(envLabel)}</span>
        </div>
        ${showBuildLoading ? `<p class="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Build Info wird geladen...</p>` : ""}
        ${buildLoadError ? `<p class="mt-2 text-[9px] font-bold text-amber-600 uppercase tracking-widest">${escapeHtml(buildLoadError)}</p>` : ""}
      </div>
      <div class="space-y-4">${listHtml}</div>
      ${state.staff.hasMore ? `
        <div id="staffLoadMoreSentinel" class="w-full mt-4 py-4 rounded-[1.8rem] bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-center">
          ${escapeHtml(state.staff.loadingMore ? "Laedt..." : "Scrollt weiter...")}
        </div>
      ` : ""}
    </div>
  `;
}
