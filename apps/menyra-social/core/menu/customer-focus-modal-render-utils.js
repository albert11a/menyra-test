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
      <div class="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="customerLogoPreview" src="${escapeHtml(logoUrl)}" class="w-full h-44 object-contain bg-white" />
      </div>
      <button id="customerLogoTrigger" class="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
        Logo hochladen
      </button>

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
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
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
  const cleanProfileText = (value = "") => String(value || "").trim();
  const collectProfileRestaurantIds = (...records) => {
    const ids = [];
    records.forEach((record = {}) => {
      [
        record?.restaurantId,
        record?.canonicalRestaurantId,
        record?.staffRestaurantId,
        record?.waiterRestaurantId,
        record?.roleSwitchRestaurantId,
        state?.roleSwitchRestaurantId
      ].forEach((value) => {
        const id = cleanProfileText(value);
        if (id && !ids.includes(id)) ids.push(id);
      });
    });
    return ids;
  };
  const collectRestaurantRecordIds = (record = {}) => [
    record?.id,
    record?.restaurantId,
    record?.canonicalRestaurantId,
    record?.landingRestaurantId,
    record?.rid,
    record?.ownerId
  ].map(cleanProfileText).filter(Boolean);
  const currentRestaurantIds = collectProfileRestaurantIds(state?.userProfile);
  const fallbackRestaurantIds = currentRestaurantIds.length
    ? currentRestaurantIds
    : collectProfileRestaurantIds(state?.profileView?.profile);
  const restaurantRecord = Array.isArray(state?.restaurants)
    ? state.restaurants.find((row) => (
      collectRestaurantRecordIds(row).some((id) => fallbackRestaurantIds.includes(id))
    ))
    : null;
  const profileViewRecord = collectProfileRestaurantIds(state?.profileView?.profile)
    .some((id) => fallbackRestaurantIds.includes(id))
    ? state?.profileView?.profile
    : null;
  const collectTypeCandidates = (...records) => {
    const values = [];
    records.forEach((record = {}) => {
      [
        record?.type,
        record?.customerType,
        record?.businessType,
        record?.restaurantType,
        record?.category,
        record?.kind,
        record?.businessProfileType,
        record?.profileType,
        record?.vertical,
        record?.leadType
      ].forEach((value) => {
        const text = cleanProfileText(value).toLowerCase();
        if (text) values.push(text);
      });
    });
    return values;
  };
  const hasTravelAccommodationShape = (...records) => {
    if (collectTypeCandidates(...records).some((type) => (
      type.includes("hotel")
      || type.includes("motel")
      || type.includes("hostel")
      || type.includes("resort")
      || type.includes("accommodation")
    ))) {
      return true;
    }
    return records.some((record = {}) => {
      const searchable = [
        record?.name,
        record?.restaurantName,
        record?.businessName,
        record?.description,
        record?.bio,
        record?.about
      ].map((value) => cleanProfileText(value).toLowerCase()).join(" ");
      return /\bhotel(s)?\b|\bmotel(s)?\b|\bhostel\b|\bresort\b|\baccommodation\b/.test(searchable);
    });
  };
  const hasTravelOfferFields = item?.isTravelOffer === true
    || item?.travelOffer === true
    || item?.offerBadgeLabel !== undefined
    || item?.offerDurationLabel !== undefined
    || item?.distanceCenter !== undefined
    || item?.distanceBeach !== undefined
    || item?.hotelStartingPrice !== undefined
    || item?.priceUnit !== undefined
    || item?.features !== undefined
    || item?.offerFeatures !== undefined;
  const isTravelOfferContext = hasTravelAccommodationShape(state?.userProfile, profileViewRecord, restaurantRecord)
    || hasTravelOfferFields;
  const title = isTravelOfferContext
    ? (isEdit ? "Oferta bearbeiten" : "Oferta hinzufuegen")
    : (isEdit ? "Fokus bearbeiten" : "Fokus hinzufuegen");
  const eyebrow = isTravelOfferContext ? (isEdit ? "Oferta" : "Neu") : (isEdit ? "Bearbeiten" : "Neu");
  const titlePlaceholder = isTravelOfferContext ? "Sommer-Angebot" : "Sot ne Fokus";
  const activeHelper = isTravelOfferContext ? "Sichtbar fuer Travel und Gaeste" : "Sichtbar fuer Gaeste";
  const collectTextList = (value) => {
    if (Array.isArray(value)) return value.map((entry) => String(entry || "").trim()).filter(Boolean);
    const raw = String(value || "").trim();
    if (!raw) return [];
    return raw.split(/[\n,;|]/).map((entry) => entry.trim()).filter(Boolean);
  };
  const normalizePriceUnit = (value = "") => {
    const key = String(value || "").trim().toLowerCase();
    return key === "total" || key === "totali" || key === "gesamt" ? "total" : "per_person";
  };
  const distanceUnitOptions = [
    { value: "m", label: "m" },
    { value: "km", label: "km" }
  ];
  const foodFeatureOptions = [
    "Mëngjes i përfshirë",
    "Gjysmë pension",
    "Pension i plotë",
    "All inclusive",
    "Restorant në hotel",
    "Pa ushqim"
  ];
  const loungerFeatureOptions = [
    "Shezlongë të përfshirë",
    "Shezlongë me pagesë",
    "Plazh privat me shezlongë",
    "Pa shezlongë"
  ];
  const parkingFeatureOptions = [
    "Parking falas",
    "Parking privat",
    "Parking me pagesë",
    "Pa parking"
  ];
  const normalizeFeatureKey = (value = "") => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[ëèéê]/g, "e")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const findFeatureOption = (features = [], options = []) => {
    const optionKeys = new Map(options.map((option) => [normalizeFeatureKey(option), option]));
    for (const feature of features) {
      const match = optionKeys.get(normalizeFeatureKey(feature));
      if (match) return match;
    }
    return "";
  };
  const parseDistanceValue = (value = "", direct = false) => {
    const raw = String(value || "").trim();
    const normalized = normalizeFeatureKey(raw);
    const isDirect = direct
      || (normalized.includes("direkt") && (normalized.includes("strand") || normalized.includes("zentrum") || normalized.includes("center")))
      || normalized.includes("am_strand")
      || normalized.includes("im_zentrum");
    const match = raw.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i);
    const amount = match ? match[1].replace(",", ".") : "";
    const unitRaw = match ? String(match[2] || "").trim().toLowerCase() : "";
    return {
      amount,
      unit: unitRaw.startsWith("k") ? "km" : "m",
      isDirect
    };
  };
  const renderDistanceField = ({ idPrefix = "", iconName = "navigation", label = "", value = "", directLabel = "", direct = false } = {}) => {
    const parsed = parseDistanceValue(value, direct);
    return `
      <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
            ${icon(iconName, "w-4 h-4")}
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${escapeHtml(label)}</p>
            <p class="text-[10px] font-bold text-slate-400">${escapeHtml(directLabel)}</p>
          </div>
        </div>
        <div class="grid grid-cols-[1fr_92px] gap-2">
          <input id="${escapeHtml(idPrefix)}Value" type="number" min="0" step="0.1" value="${escapeHtml(parsed.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-amber-100" />
          <select id="${escapeHtml(idPrefix)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-amber-100">
            ${distanceUnitOptions.map((unit) => `<option value="${escapeHtml(unit.value)}" ${parsed.unit === unit.value ? "selected" : ""}>${escapeHtml(unit.label)}</option>`).join("")}
          </select>
        </div>
        <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
          <span class="text-xs font-black text-slate-700">${escapeHtml(directLabel)}</span>
          <input id="${escapeHtml(idPrefix)}Direct" type="checkbox" class="w-5 h-5 accent-amber-500" ${parsed.isDirect ? "checked" : ""} />
        </label>
      </div>
    `;
  };
  const renderFeatureOptions = (options = [], selected = "") => `
    <option value="">Auswählen</option>
    ${options.map((option) => `<option value="${escapeHtml(option)}" ${normalizeFeatureKey(option) === normalizeFeatureKey(selected) ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
  `;
  const renderFeatureSelect = ({ id = "", iconName = "badge-check", label = "", value = "", options = [] } = {}) => `
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${icon(iconName, "w-4 h-4")}
        </div>
        <label for="${escapeHtml(id)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${escapeHtml(label)}</label>
      </div>
      <select id="${escapeHtml(id)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-amber-100">
        ${renderFeatureOptions(options, value)}
      </select>
    </div>
  `;
  const offerFeatures = [
    ...collectTextList(item.features),
    ...collectTextList(item.offerFeatures),
    ...collectTextList(item.hotelFeatures),
    String(item.hotelFeatureOneText || "").trim(),
    String(item.hotelFeatureTwoText || "").trim(),
    String(item.hotelFeatureThreeText || "").trim()
  ].filter(Boolean).filter((entry, index, list) => list.indexOf(entry) === index);
  const offerBadgeLabel = String(item.offerBadgeLabel || item.travelOfferBadgeLabel || item.badgeLabel || "OFERTA").trim();
  const offerDurationLabel = String(item.offerDurationLabel || item.nightsDaysLabel || item.durationLabel || "").trim();
  const offerDistanceCenter = String(item.distanceCenter || item.distanceToCenter || item.centerDistance || "").trim();
  const offerDistanceBeach = String(item.distanceBeach || item.distanceToBeach || item.beachDistance || "").trim();
  const offerStartingPrice = String(item.hotelStartingPrice || item.startingPrice || item.priceFrom || item.fromPrice || item.bestPrice || "").trim();
  const offerPriceUnit = normalizePriceUnit(item.priceUnit || item.hotelPriceUnit || item.offerPriceUnit || "");
  const offerFoodFeature = findFeatureOption(offerFeatures, foodFeatureOptions);
  const offerLoungerFeature = findFeatureOption(offerFeatures, loungerFeatureOptions);
  const offerParkingFeature = findFeatureOption(offerFeatures, parkingFeatureOptions);
  const selectedFeatureKeys = new Set([offerFoodFeature, offerLoungerFeature, offerParkingFeature].map(normalizeFeatureKey).filter(Boolean));
  const offerCustomFeatures = offerFeatures.filter((feature) => !selectedFeatureKeys.has(normalizeFeatureKey(feature)));
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
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${escapeHtml(eyebrow)}</span>
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
          <input id="focusTitle" type="text" value="${escapeHtml(item.title || "")}" placeholder="${escapeHtml(titlePlaceholder)}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100" />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Text</label>
          <textarea id="focusText" rows="3" placeholder="Beschreibung..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100 resize-none">${escapeHtml(item.text || "")}</textarea>
        </div>
        ${isTravelOfferContext ? `
          <div class="grid grid-cols-1 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Badge links (OFERTA)</label>
              <input id="focusOfferBadgeLabel" type="text" value="${escapeHtml(offerBadgeLabel)}" placeholder="OFERTA" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Badge rechts (Netë / ditë)</label>
              <input id="focusOfferDurationLabel" type="text" value="${escapeHtml(offerDurationLabel)}" placeholder="3 netë / 4 ditë" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100" />
            </div>
          </div>
          <div class="grid grid-cols-1 gap-3">
            ${renderDistanceField({
              idPrefix: "focusDistanceCenter",
              iconName: "navigation",
              label: "Entfernung Zentrum",
              value: offerDistanceCenter,
              directLabel: "Direkt im Zentrum"
            })}
            ${renderDistanceField({
              idPrefix: "focusDistanceBeach",
              iconName: "waves",
              label: "Entfernung Strand",
              value: offerDistanceBeach,
              directLabel: "Direkt am Strand",
              direct: item.beachfront === true || item.onBeach === true
            })}
            <div class="grid grid-cols-[1.2fr_0.8fr] gap-3">
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Preis</label>
                <input id="focusStartingPrice" type="text" value="${escapeHtml(offerStartingPrice)}" placeholder="145" inputmode="decimal" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100" />
              </div>
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Typ</label>
                <select id="focusPriceUnit" class="w-full px-4 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100">
                  <option value="per_person" ${offerPriceUnit === "per_person" ? "selected" : ""}>p.P</option>
                  <option value="total" ${offerPriceUnit === "total" ? "selected" : ""}>Totali</option>
                </select>
              </div>
            </div>
            ${renderFeatureSelect({
              id: "focusFeatureFoodText",
              iconName: "utensils",
              label: "Ushqimi",
              value: offerFoodFeature,
              options: foodFeatureOptions
            })}
            ${renderFeatureSelect({
              id: "focusFeatureLoungerText",
              iconName: "waves",
              label: "Shezlongët",
              value: offerLoungerFeature,
              options: loungerFeatureOptions
            })}
            ${renderFeatureSelect({
              id: "focusFeatureParkingText",
              iconName: "square-parking",
              label: "Parking",
              value: offerParkingFeature,
              options: parkingFeatureOptions
            })}
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Weitere Features</label>
              <textarea id="focusFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100 resize-none">${escapeHtml(offerCustomFeatures.join("\n"))}</textarea>
            </div>
          </div>
        ` : ""}
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Bild URL (optional)</label>
          <input id="focusImageUrl" type="text" value="${escapeHtml(item.imageUrl || "")}" placeholder="https://..." class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-amber-100" />
        </div>
        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">Aktiv</p>
            <p class="text-[10px] font-bold text-slate-400">${escapeHtml(activeHelper)}</p>
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
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
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
