export function renderCustomerModalCore({
  state,
  getOptimizedImageUrl,
  PLACEHOLDER_IMAGE,
  resolveCustomerType,
  normalizeLeadStatusKey,
  LEAD_TYPE_ORDER,
  LEAD_TYPE_LABELS,
  LEAD_STATUS_ORDER,
  LEAD_STATUS_LABELS,
  escapeHtml,
  icon
} = {}) {
  if (!state?.customerModal?.open || !state?.customerModal?.customer) return "";
  const customer = state.customerModal.customer || {};
  const logoRaw = state.customerModal.logoPreview || customer.logoUrl || customer.logo || "";
  const logoUrl = logoRaw ? getOptimizedImageUrl(logoRaw, "avatar") : PLACEHOLDER_IMAGE;
  const headerLogoRaw = state.customerModal.headerLogoPreview || customer.headerLogoUrl || customer.headerLogo || "";
  const headerLogoUrl = headerLogoRaw ? getOptimizedImageUrl(headerLogoRaw, "header") : PLACEHOLDER_IMAGE;
  const status = state.customerModal.status || "";
  const typeKey = resolveCustomerType(customer.type || customer.customerType || "cafe");
  const customerStatus = normalizeLeadStatusKey(customer.status || "kunde") || "kunde";
  const customerInstagram = customer.instagram || customer.insta || "";

  const headerHtml = `
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Kunde</span>
        <h3 class="text-xl font-black italic tracking-tighter">Kundenprofil</h3>
      </div>
      <button id="customerModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${icon("x", "w-4 h-4")}
      </button>
    </div>
  `;

  const bodyHtml = `
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="customerLogoInput" class="hidden" accept="image/*" />
      <input type="file" id="customerHeaderLogoInput" class="hidden" accept="image/*" />
      <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="customerLogoPreview" src="${escapeHtml(logoUrl)}" class="w-full h-44 object-contain bg-white" />
      </div>
      <button id="customerLogoTrigger" class="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
        Logo hochladen
      </button>
      <div class="rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50 p-3 space-y-3">
        <div class="rounded-[1.6rem] overflow-hidden border border-slate-100 bg-white px-4 py-3">
          <img id="customerHeaderLogoPreview" src="${escapeHtml(headerLogoUrl)}" class="w-full h-20 object-contain" />
        </div>
        <button id="customerHeaderLogoTrigger" class="w-full py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">
          Header Logo hochladen
        </button>
      </div>

      <div class="p-5 rounded-[2rem] border border-slate-100 bg-white space-y-4">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Business Name</label>
          <input id="customerName" type="text" value="${escapeHtml(customer.name || customer.restaurantName || "")}" placeholder="Business Name" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
          <select id="customerType" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            ${LEAD_TYPE_ORDER.map((key) => `
              <option value="${key}" ${typeKey === key ? "selected" : ""}>${LEAD_TYPE_LABELS[key]}</option>
            `).join("")}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Owner</label>
            <input id="customerOwnerName" type="text" value="${escapeHtml(customer.ownerName || "")}" placeholder="Owner Name" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="customerOwnerEmail" type="email" value="${escapeHtml(customer.ownerEmail || "")}" placeholder="owner@mnyra.com" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Telefon</label>
            <input id="customerPhone" type="text" value="${escapeHtml(customer.phone || "")}" placeholder="+383" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">City</label>
            <input id="customerCity" type="text" value="${escapeHtml(customer.city || "")}" placeholder="Prishtina" class="w-full px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Adresse</label>
          <input id="customerAddress" type="text" value="${escapeHtml(customer.address || "")}" placeholder="Strasse, Nr" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Instagram</label>
          <input id="customerInstagram" type="text" value="${escapeHtml(customerInstagram)}" placeholder="@mnyra" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Logo URL (optional)</label>
          <input id="customerLogoUrl" type="text" value="${escapeHtml(customer.logoUrl || customer.logo || "")}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Header Logo URL (optional)</label>
          <input id="customerHeaderLogoUrl" type="text" value="${escapeHtml(customer.headerLogoUrl || customer.headerLogo || "")}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Status</label>
          <select id="customerStatus" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100">
            ${LEAD_STATUS_ORDER.map((key) => `
              <option value="${key}" ${customerStatus === key ? "selected" : ""}>${LEAD_STATUS_LABELS[key]}</option>
            `).join("")}
          </select>
        </div>
      </div>
    </div>
  `;

  const footerHtml = `
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
      <button id="customerModalSave" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all" ${state.customerModal.loading ? "disabled" : ""}>
        ${state.customerModal.loading ? "Speichern..." : "Speichern"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${escapeHtml(status)}</div>
    </div>
  `;

  return `
    <div class="fixed inset-0 z-[75] modal-overlay">
      <div id="customerModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          ${headerHtml}
          ${bodyHtml}
          ${footerHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderFocusModalCore({
  state,
  getOptimizedImageUrl,
  isPlaceholderUrl,
  PLACEHOLDER_IMAGE,
  getFocusModalCrop,
  escapeHtml,
  icon
} = {}) {
  if (!state?.focusModal?.open) return "";
  const item = state.focusModal.item || {};
  const isEdit = state.focusModal.mode === "edit";
  const title = isEdit ? "Fokus bearbeiten" : "Fokus hinzufuegen";
  const preview = state.focusModal.imagePreview || item.imageUrl || "";
  const imageUrl = getOptimizedImageUrl(preview, "large");
  const safeImage = isPlaceholderUrl(imageUrl) ? PLACEHOLDER_IMAGE : imageUrl;
  const active = item.active !== false;
  const status = state.focusModal.status || "";
  const crop = getFocusModalCrop();

  const titleId = "focusModalTitle";
  const headerHtml = `
    <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
      <div>
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${isEdit ? "Bearbeiten" : "Neu"}</span>
        <h3 id="${titleId}" class="text-xl font-black italic tracking-tighter">${title}</h3>
      </div>
      <button id="focusModalClose" class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
        ${icon("x", "w-4 h-4")}
      </button>
    </div>
  `;
  const bodyHtml = `
    <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
      <input type="file" id="focusImageInput" class="hidden" accept="image/*" />
      <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="focusHeroPreview" src="${escapeHtml(safeImage)}" class="w-full h-52 object-cover" style="object-position:${crop.x}% ${crop.y}%;" />
      </div>
      <button id="focusImageTrigger" class="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
        Foto hochladen
      </button>
      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Horizontal</p>
          <span id="focusCropXValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${crop.x}%</span>
        </div>
        <input id="focusCropX" type="range" min="0" max="100" step="1" value="${crop.x}" class="w-full accent-amber-500" />
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Crop Vertikal</p>
          <span id="focusCropYValue" class="text-[10px] font-black uppercase tracking-widest text-slate-500">${crop.y}%</span>
        </div>
        <input id="focusCropY" type="range" min="0" max="100" step="1" value="${crop.y}" class="w-full accent-amber-500" />
      </div>

      <div class="p-5 rounded-[2rem] border border-slate-100 bg-white space-y-4">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Titel</label>
          <input id="focusTitle" type="text" value="${escapeHtml(item.title || "")}" placeholder="Sot ne Fokus" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Text</label>
          <textarea id="focusText" rows="3" placeholder="Beschreibung..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100 resize-none">${escapeHtml(item.text || "")}</textarea>
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Bild URL (optional)</label>
          <input id="focusImageUrl" type="text" value="${escapeHtml(item.imageUrl || "")}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100" />
        </div>
        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">Aktiv</p>
            <p class="text-[10px] font-bold text-slate-400">Sichtbar fuer Gaeste</p>
          </div>
          <input id="focusActive" type="checkbox" class="w-5 h-5 accent-amber-500" ${active ? "checked" : ""} />
        </label>
      </div>
    </div>
  `;
  const footerHtml = `
    <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
      <button id="focusModalSave" class="w-full py-4 rounded-[1.8rem] bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-400/30 active:scale-95 transition-all" ${state.focusModal.loading ? "disabled" : ""}>
        ${state.focusModal.loading ? "Speichern..." : "Speichern"}
      </button>
      <div class="text-center text-[10px] font-bold text-slate-400 mt-3">${escapeHtml(status)}</div>
    </div>
  `;
  const animClass = "";

  return `
    <div class="fixed inset-0 z-[75] modal-overlay">
      <div id="focusModalOverlay" class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 ${animClass} flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          ${headerHtml}
          ${bodyHtml}
          ${footerHtml}
        </div>
      </div>
    </div>
  `;
}
