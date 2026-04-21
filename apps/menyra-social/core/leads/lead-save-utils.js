export async function saveLeadFromModalCore({
  state,
  documentObj,
  isLeadInlineCreateView,
  getLeadSettingsConfig,
  syncLeadModalDraftFromForm,
  resolveCustomerType,
  buildLeadContactName,
  buildLeadAccountEmail,
  normalizeLeadCountry,
  resolveCurrencyCodeFromLeadCountry,
  normalizeLeadStatusKey,
  refineLeadLocationAddressIndex,
  readLeadModalLocationsFromForm,
  getPrimaryLeadLocation,
  hasLeadLocationCoords,
  renderLeadEditorUi,
  doc,
  collection,
  db,
  uploadCompressedImage,
  serverTimestamp,
  setDoc,
  ensureRestaurantPublicMeta,
  buildLeadLandingPageUrl,
  buildLeadLandingSlug,
  resolveLeadLandingSlugUnique,
  createAuthUser,
  buildLeadCrmContribution,
  buildCustomerCrmContribution,
  resolveRestaurantStatusFromLead,
  resolveStoredCeoCreatorMeta,
  getLeadMonthlyPrice,
  accumulateCeoCrmDelta,
  applyCeoCrmCountDeltas,
  normalizeLeadDoc,
  leadBelongsToScope,
  syncVisibleLeadPageFromItems,
  mergeRestaurants,
  rebuildBusinessLocations,
  refreshCustomersFromRestaurants,
  resetLeadDraft,
  closeLeadModal,
  render,
  alertFn
} = {}) {
  if (!state || !state.user) return;
  const docObj = documentObj || (typeof document !== "undefined" ? document : null);
  if (!docObj || typeof doc !== "function" || typeof collection !== "function" || typeof setDoc !== "function" || !db) return;
  const isInlineCreateView = typeof isLeadInlineCreateView === "function" ? isLeadInlineCreateView : (() => false);
  const getSettings = typeof getLeadSettingsConfig === "function"
    ? getLeadSettingsConfig
    : (() => ({ defaultCountry: "" }));
  const syncDraftFromForm = typeof syncLeadModalDraftFromForm === "function" ? syncLeadModalDraftFromForm : (() => {});
  const resolveType = typeof resolveCustomerType === "function" ? resolveCustomerType : ((value) => String(value || "cafe"));
  const buildContactName = typeof buildLeadContactName === "function"
    ? buildLeadContactName
    : ((first, last, fallback) => String(`${first || ""} ${last || ""}`.trim() || fallback || ""));
  const buildEmail = typeof buildLeadAccountEmail === "function"
    ? buildLeadAccountEmail
    : (() => "");
  const normalizeCountry = typeof normalizeLeadCountry === "function"
    ? normalizeLeadCountry
    : ((value) => String(value || "").trim());
  const resolveCurrencyCode = typeof resolveCurrencyCodeFromLeadCountry === "function"
    ? resolveCurrencyCodeFromLeadCountry
    : ((country, fallback = "EUR") => {
      const key = String(country || "").trim().toLowerCase();
      if (key === "serbien" || key === "serbia") return "RSD";
      if (key === "albanien" || key === "albania") return "LEK";
      if (key === "kosovo" || key === "kosova") return "EUR";
      return String(fallback || "EUR").trim().toUpperCase() || "EUR";
    });
  const normalizeStatus = typeof normalizeLeadStatusKey === "function"
    ? normalizeLeadStatusKey
    : ((value) => String(value || "").trim());
  const refineLocation = typeof refineLeadLocationAddressIndex === "function"
    ? refineLeadLocationAddressIndex
    : (async () => null);
  const readLocations = typeof readLeadModalLocationsFromForm === "function"
    ? readLeadModalLocationsFromForm
    : (() => []);
  const getPrimaryLocation = typeof getPrimaryLeadLocation === "function"
    ? getPrimaryLeadLocation
    : ((rows) => (Array.isArray(rows) ? rows[0] || {} : {}));
  const hasCoords = typeof hasLeadLocationCoords === "function" ? hasLeadLocationCoords : (() => false);
  const renderLeadEditor = typeof renderLeadEditorUi === "function" ? renderLeadEditorUi : (() => {});
  const uploadImage = typeof uploadCompressedImage === "function"
    ? uploadCompressedImage
    : (async () => ({ cdnUrl: "" }));
  const getTimestamp = typeof serverTimestamp === "function"
    ? serverTimestamp
    : (() => new Date());
  const ensurePublicMeta = typeof ensureRestaurantPublicMeta === "function"
    ? ensureRestaurantPublicMeta
    : (async () => {});
  const normalizeLandingSlug = (value = "") => {
    let slug = String(value || "").trim().toLowerCase();
    if (!slug) return "";
    try {
      if (typeof slug.normalize === "function") {
        slug = slug.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
      }
    } catch {}
    return slug
      .replace(/&/g, " and ")
      .replace(/['"`]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72);
  };
  const buildLandingSlug = typeof buildLeadLandingSlug === "function"
    ? buildLeadLandingSlug
    : ((restaurantId = "", options = {}) => {
      const safeRestaurantId = String(restaurantId || "").trim();
      const safeOptions = options && typeof options === "object" ? options : {};
      const explicit = normalizeLandingSlug(safeOptions.landingSlug || "");
      if (explicit) return explicit;
      const fromName = normalizeLandingSlug(
        safeOptions.businessName
        || safeOptions.name
        || safeOptions.restaurantName
        || safeOptions.base?.name
        || safeOptions.base?.restaurantName
        || safeRestaurantId
        || safeOptions.leadId
        || "business"
      );
      return fromName || "business";
    });
  const isLocalLikeHostname = (hostname = "") => {
    const host = String(hostname || "").trim().toLowerCase();
    if (!host) return false;
    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local")) return true;
    if (/^10\./.test(host) || /^192\.168\./.test(host)) return true;
    const privateMatch = host.match(/^172\.(\d{1,3})\./);
    if (privateMatch) {
      const second = Number(privateMatch[1]);
      if (Number.isFinite(second) && second >= 16 && second <= 31) return true;
    }
    return false;
  };
  const buildLandingUrl = typeof buildLeadLandingPageUrl === "function"
    ? buildLeadLandingPageUrl
    : ((restaurantId = "", options = {}) => {
      const safeRestaurantId = String(restaurantId || "").trim();
      const safeOptions = options && typeof options === "object" ? options : {};
      const landingSlug = buildLandingSlug(safeRestaurantId, safeOptions);
      if (!landingSlug) return "";
      if (!safeOptions.forcePublicOrigin && typeof window !== "undefined" && isLocalLikeHostname(window.location?.hostname || "")) {
        const origin = String(window.location?.origin || "").trim().replace(/\/+$/, "");
        const previewPath = `/apps/menyra-social/index.html?r=${encodeURIComponent(landingSlug)}&tab=profile`;
        return origin ? `${origin}${previewPath}` : previewPath;
      }
      const origin = String(safeOptions.origin || "https://mnyra.com").trim().replace(/\/+$/, "");
      const path = `/b/${encodeURIComponent(landingSlug)}`;
      return origin ? `${origin}${path}` : path;
    });
  const createUser = typeof createAuthUser === "function" ? createAuthUser : (async () => null);
  const buildLeadContribution = typeof buildLeadCrmContribution === "function"
    ? buildLeadCrmContribution
    : (() => null);
  const buildCustomerContribution = typeof buildCustomerCrmContribution === "function"
    ? buildCustomerCrmContribution
    : (() => null);
  const resolveRestStatus = typeof resolveRestaurantStatusFromLead === "function"
    ? resolveRestaurantStatusFromLead
    : ((status) => status);
  const resolveCreatorMeta = typeof resolveStoredCeoCreatorMeta === "function"
    ? resolveStoredCeoCreatorMeta
    : (() => ({}));
  const getMonthlyPrice = typeof getLeadMonthlyPrice === "function" ? getLeadMonthlyPrice : (() => 0);
  const accumulateDelta = typeof accumulateCeoCrmDelta === "function" ? accumulateCeoCrmDelta : (() => {});
  const applyDeltas = typeof applyCeoCrmCountDeltas === "function" ? applyCeoCrmCountDeltas : (async () => {});
  const normalizeLead = typeof normalizeLeadDoc === "function"
    ? normalizeLeadDoc
    : ((value) => value || {});
  const belongsToScope = typeof leadBelongsToScope === "function" ? leadBelongsToScope : (() => true);
  const syncVisiblePage = typeof syncVisibleLeadPageFromItems === "function"
    ? syncVisibleLeadPageFromItems
    : (() => {});
  const mergeRestaurantsSafe = typeof mergeRestaurants === "function"
    ? mergeRestaurants
    : ((current, next) => [...(Array.isArray(current) ? current : []), ...(Array.isArray(next) ? next : [])]);
  const rebuildLocations = typeof rebuildBusinessLocations === "function" ? rebuildBusinessLocations : (() => {});
  const refreshCustomers = typeof refreshCustomersFromRestaurants === "function"
    ? refreshCustomersFromRestaurants
    : (() => {});
  const resetDraft = typeof resetLeadDraft === "function" ? resetLeadDraft : (() => {});
  const closeLead = typeof closeLeadModal === "function" ? closeLeadModal : (() => {});
  const rerender = typeof render === "function" ? render : (() => {});
  const notify = typeof alertFn === "function"
    ? alertFn
    : ((message) => {
      if (typeof alert === "function") alert(message);
    });
  const normalizeCreatorPath = (path = [], fallback = []) => {
    const base = Array.isArray(path) ? path : [];
    const extra = Array.isArray(fallback) ? fallback : [fallback];
    return Array.from(new Set([...base, ...extra].map((entry) => String(entry || "").trim()).filter(Boolean)));
  };
  const buildCurrentCreatorMeta = () => {
    const user = state?.user || {};
    const profile = state?.userProfile || {};
    const createdByUid = String(user.uid || profile.uid || "").trim();
    const createdByName = String(profile.name || user.displayName || user.email || "").trim();
    const createdByHandle = String(profile.handle || "").trim();
    const ceoRootUid = String(profile.ceoRootUid || createdByUid).trim() || createdByUid;
    const ceoRootName = String(profile.ceoRootName || createdByName).trim() || createdByName;
    const ceoParentUid = String(profile.ceoParentUid || profile.parentCeoUid || "").trim();
    const ceoPath = normalizeCreatorPath(profile.ceoPath, [ceoRootUid, ceoParentUid, createdByUid]);
    return {
      createdByUid,
      createdByRole: String(profile.createdByRole || profile.role || "ceo").trim() || "ceo",
      createdByName,
      createdByHandle,
      ceoRootUid,
      ceoRootName,
      ceoParentUid,
      ceoPath
    };
  };

  const lead = state.leadModal.lead || {};
  const isInlineCreate = isInlineCreateView();
  const settings = getSettings();
  syncDraftFromForm();
  const businessName = docObj.getElementById("leadBusinessName")?.value?.trim() || "";
  const customerType = resolveType(docObj.getElementById("leadCustomerType")?.value || lead.customerType || "cafe");
  const contactFirstName = docObj.getElementById("leadCustomerFirstName")?.value?.trim() || lead.contactFirstName || "";
  const contactLastName = docObj.getElementById("leadCustomerLastName")?.value?.trim() || lead.contactLastName || "";
  const contactName = buildContactName(
    contactFirstName,
    contactLastName,
    docObj.getElementById("leadContactName")?.value?.trim() || lead.contactName || ""
  );
  const phone = docObj.getElementById("leadPhone")?.value?.trim() || "";
  const instagram = docObj.getElementById("leadInstagram")?.value?.trim() || "";
  const facebook = docObj.getElementById("leadFacebook")?.value?.trim() || lead.facebook || "";
  const tiktok = docObj.getElementById("leadTiktok")?.value?.trim() || lead.tiktok || "";
  const googleMaps = docObj.getElementById("leadGoogleMaps")?.value?.trim() || lead.googleMaps || "";
  const emailInput = docObj.getElementById("leadEmail")?.value?.trim() || (isInlineCreate ? buildEmail(businessName) : "");
  const passwordInput = String(docObj.getElementById("leadPassword")?.value || "").trim();
  const country = normalizeCountry(docObj.getElementById("leadCountry")?.value || lead.country || settings.defaultCountry);
  const currencyCode = String(resolveCurrencyCode(country, "EUR") || "EUR").trim().toUpperCase() || "EUR";
  const city = docObj.getElementById("leadCity")?.value?.trim() || "";
  const addressInputValue = docObj.getElementById("leadAddress")?.value?.trim() || "";
  const zipCode = docObj.getElementById("leadZipCode")?.value?.trim() || lead.zipCode || "";
  const specialToggle = docObj.getElementById("leadSpecialEnabled");
  const specialEnabled = specialToggle && "checked" in specialToggle
    ? !!specialToggle.checked
    : (lead.specialEnabled === true);
  const logoUrlInput = docObj.getElementById("leadLogoUrl")?.value?.trim() || "";
  const note = docObj.getElementById("leadNote")?.value?.trim() || "";
  const billingCycle = docObj.getElementById("leadBillingCycle")?.value === "yearly" ? "yearly" : "monthly";
  const statusValue = docObj.getElementById("leadStatus")?.value || lead.status || "registered";
  const locationInputs = Array.from(docObj.querySelectorAll("[data-lead-location-address]"));
  if (locationInputs.length) {
    await Promise.all(locationInputs.map((input, index) => (
      refineLocation(index, String(input.value || "").trim(), { hydratePrimary: index === 0 }).catch(() => null)
    )));
  }
  const locations = readLocations();
  state.leadModal.locations = locations;
  const primaryLocation = getPrimaryLocation(locations);
  const address = addressInputValue || primaryLocation.address || "";
  const coords = hasCoords(primaryLocation)
    ? { lat: primaryLocation.lat, lng: primaryLocation.lng }
    : null;
  state.leadModal.coords = coords;
  const locationPayload = locations
    .filter((item) => item.address || hasCoords(item))
    .map((item) => {
      const row = { address: item.address || "" };
      if (hasCoords(item)) {
        row.lat = Number(item.lat);
        row.lng = Number(item.lng);
      }
      return row;
    });

  if (!businessName) {
    state.leadModal.status = "Bitte Business Name eingeben.";
    renderLeadEditor();
    return;
  }

  state.leadModal.loading = true;
  state.leadModal.actionsOpen = false;
  state.leadModal.status = "Speichern...";
  renderLeadEditor();

  try {
    let restaurantId = lead.restaurantId || "";
    let restRef = null;
    if (!restaurantId) {
      restRef = doc(collection(db, "restaurants"));
      restaurantId = restRef.id;
    }

    const existingRest = restaurantId ? state.restaurants.find((r) => String(r.id) === String(restaurantId)) : null;
    const prevLeadContribution = lead?.id ? buildLeadContribution(lead) : null;
    const prevCustomerContribution = existingRest ? buildCustomerContribution(existingRest) : null;
    const restaurantStatus = resolveRestStatus(statusValue, existingRest?.status || "");
    const currentCreatorMeta = buildCurrentCreatorMeta();
    const storedCreatorMeta = resolveCreatorMeta(lead, existingRest) || {};
    const creatorMeta = lead?.id
      ? {
          createdByUid: String(storedCreatorMeta.createdByUid || currentCreatorMeta.createdByUid || "").trim(),
          createdByRole: String(storedCreatorMeta.createdByRole || currentCreatorMeta.createdByRole || "ceo").trim() || "ceo",
          createdByName: String(storedCreatorMeta.createdByName || currentCreatorMeta.createdByName || "").trim(),
          createdByHandle: String(storedCreatorMeta.createdByHandle || currentCreatorMeta.createdByHandle || "").trim(),
          ceoRootUid: String(storedCreatorMeta.ceoRootUid || currentCreatorMeta.ceoRootUid || currentCreatorMeta.createdByUid || "").trim(),
          ceoRootName: String(storedCreatorMeta.ceoRootName || currentCreatorMeta.ceoRootName || currentCreatorMeta.createdByName || "").trim(),
          ceoParentUid: String(storedCreatorMeta.ceoParentUid || currentCreatorMeta.ceoParentUid || "").trim(),
          ceoPath: normalizeCreatorPath(storedCreatorMeta.ceoPath, [
            ...(Array.isArray(currentCreatorMeta.ceoPath) ? currentCreatorMeta.ceoPath : []),
            storedCreatorMeta.ceoRootUid || currentCreatorMeta.ceoRootUid || "",
            storedCreatorMeta.ceoParentUid || currentCreatorMeta.ceoParentUid || "",
            storedCreatorMeta.createdByUid || currentCreatorMeta.createdByUid || ""
          ])
        }
      : currentCreatorMeta;
    const monthlyPrice = getMonthlyPrice(customerType, settings);
    const yearlyPrice = monthlyPrice * 12;
    const activePrice = billingCycle === "yearly" ? yearlyPrice : monthlyPrice;
    const landingSlug = typeof resolveLeadLandingSlugUnique === "function"
      ? await resolveLeadLandingSlugUnique(restaurantId, {
        publicSlug: lead?.publicSlug || existingRest?.publicSlug || "",
        landingSlug: lead?.landingSlug || existingRest?.landingSlug || "",
        businessName,
        leadId: lead?.id || ""
      })
      : buildLandingSlug(restaurantId, {
        publicSlug: lead?.publicSlug || existingRest?.publicSlug || "",
        landingSlug: lead?.landingSlug || existingRest?.landingSlug || "",
        businessName,
        leadId: lead?.id || ""
      });
    const canonicalPublicPath = landingSlug ? `/b/${encodeURIComponent(landingSlug)}` : "";
    const landingPageUrl = buildLandingUrl(restaurantId, {
      publicSlug: landingSlug,
      landingSlug,
      businessName,
      leadId: lead?.id || "",
      forcePublicOrigin: true
    });
    const shouldSeedRestaurantBeforeLogoUpload = !!restRef && !!state.leadModal.logoFile;
    if (shouldSeedRestaurantBeforeLogoUpload) {
      await setDoc(restRef, {
        name: businessName,
        restaurantName: businessName,
        type: customerType,
        country,
        currencyCode,
        currency: currencyCode,
        city,
        address,
        zipCode,
        ownerName: contactName || "",
        ownerEmail: emailInput || "",
        specialEnabled,
        status: restaurantStatus,
        locations: locationPayload,
        publicSlug: landingSlug,
        canonicalPublicPath,
        landingEnabled: true,
        landingTemplate: "lead-screen-1",
        landingRestaurantId: restaurantId,
        landingSlug,
        landingPageUrl,
        ...creatorMeta,
        createdAt: getTimestamp(),
        updatedAt: getTimestamp()
      });
    }

    let logoUrl = logoUrlInput || state.leadModal.logoPreview || lead.logoUrl || "";
    if (state.leadModal.logoFile) {
      const { cdnUrl } = await uploadImage(
        state.leadModal.logoFile,
        restaurantId || state.user.uid,
        { maxSize: 512, quality: 0.82, mimeType: "image/jpeg" }
      );
      logoUrl = cdnUrl || logoUrl;
    }
    const restPayload = {
      name: businessName,
      restaurantName: businessName,
      type: customerType,
      country,
      currencyCode,
      currency: currencyCode,
      city,
      address,
      zipCode,
      phone,
      instagram,
      insta: instagram,
      facebook,
      tiktok,
      googleMaps,
      ownerName: contactName || "",
      ownerEmail: emailInput || "",
      specialEnabled,
      contactFirstName,
      contactLastName,
      billingCycle,
      monthlyPrice,
      yearlyPrice,
      price: activePrice,
      logoUrl,
      logo: logoUrl,
      status: restaurantStatus,
      leadId: lead.id || "",
      locations: locationPayload,
      publicSlug: landingSlug,
      canonicalPublicPath,
      landingEnabled: true,
      landingTemplate: "lead-screen-1",
      landingRestaurantId: restaurantId,
      landingSlug,
      landingPageUrl,
      ...creatorMeta,
      updatedAt: getTimestamp()
    };
    if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
      restPayload.lat = coords.lat;
      restPayload.lng = coords.lng;
      restPayload.gpsLat = coords.lat;
      restPayload.gpsLng = coords.lng;
    }

    if (restRef) {
      if (shouldSeedRestaurantBeforeLogoUpload) {
        await setDoc(restRef, restPayload, { merge: true });
      } else {
        await setDoc(restRef, {
          ...restPayload,
          createdAt: getTimestamp()
        });
      }
    } else {
      await setDoc(doc(db, "restaurants", restaurantId), restPayload, { merge: true });
    }
    await ensurePublicMeta(restaurantId, restPayload, {
      publicSlug: landingSlug,
      landingSlug,
      leadId: lead?.id || ""
    });

    let socialUid = lead.socialUid || "";
    let socialEmail = lead.socialEmail || "";
    const loginEmail = emailInput || socialEmail || "";
    let loginError = "";
    if (!socialUid && loginEmail && passwordInput) {
      try {
        const user = await createUser(loginEmail, passwordInput);
        if (user?.uid) {
          socialUid = user.uid;
          socialEmail = loginEmail;
        }
      } catch (err) {
        loginError = err?.message || "Login fehlgeschlagen.";
      }
    }
    if (restaurantId) {
      const ownerPatch = {};
      if (socialUid) ownerPatch.ownerUid = socialUid;
      if (loginEmail || socialEmail) ownerPatch.ownerEmail = loginEmail || socialEmail;
      if (contactName || businessName) ownerPatch.ownerName = contactName || businessName;
      if (Object.keys(ownerPatch).length) {
        ownerPatch.updatedAt = getTimestamp();
        await setDoc(doc(db, "restaurants", restaurantId), ownerPatch, { merge: true });
      }
    }

    const leadRef = lead.id ? doc(db, "leads", lead.id) : doc(collection(db, "leads"));
    const leadId = lead.id || leadRef.id;
    const leadStatusKey = normalizeStatus(statusValue) || "registered";
    const leadPayload = {
      businessName,
      customerType,
      contactName,
      phone,
      instagram,
      insta: instagram,
      facebook,
      tiktok,
      googleMaps,
      email: loginEmail,
      country,
      currencyCode,
      currency: currencyCode,
      city,
      address,
      zipCode,
      locations: locationPayload,
      logoUrl,
      specialEnabled,
      note,
      contactFirstName,
      contactLastName,
      billingCycle,
      monthlyPrice,
      yearlyPrice,
      price: activePrice,
      status: leadStatusKey,
      restaurantId,
      publicSlug: landingSlug,
      canonicalPublicPath,
      landingEnabled: true,
      landingTemplate: "lead-screen-1",
      landingRestaurantId: restaurantId,
      landingSlug,
      landingPageUrl,
      socialUid,
      socialEmail,
      updatedAt: getTimestamp(),
      ...creatorMeta
    };
    if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
      leadPayload.lat = coords.lat;
      leadPayload.lng = coords.lng;
      leadPayload.gpsLat = coords.lat;
      leadPayload.gpsLng = coords.lng;
    }
    if (!lead.id) {
      leadPayload.createdAt = getTimestamp();
    }
    await setDoc(leadRef, leadPayload, { merge: true });
    if (restaurantId && leadId) {
      await setDoc(doc(db, "restaurants", restaurantId), { leadId }, { merge: true });
    }
    const nextLeadContribution = buildLeadContribution({ id: leadId, ...leadPayload });
    const nextCustomerContribution = buildCustomerContribution({ id: restaurantId, ...(existingRest || {}), ...restPayload });
    const crmDeltaMap = new Map();
    accumulateDelta(crmDeltaMap, prevLeadContribution, -1);
    accumulateDelta(crmDeltaMap, prevCustomerContribution, -1);
    accumulateDelta(crmDeltaMap, nextLeadContribution, 1);
    accumulateDelta(crmDeltaMap, nextCustomerContribution, 1);
    await applyDeltas(crmDeltaMap);

    const normalized = normalizeLead({ id: leadId, ...leadPayload });
    const idx = state.leads.items.findIndex((item) => String(item.id) === String(leadId));
    const visibleInCurrentScope = belongsToScope(normalized);
    if (leadStatusKey === "kunde") {
      state.leads.items = state.leads.items.filter((item) => (
        String(item.id || "") !== String(leadId)
        && String(item.restaurantId || "") !== String(restaurantId)
      ));
    } else if (!visibleInCurrentScope) {
      state.leads.items = state.leads.items.filter((item) => String(item.id || "") !== String(leadId));
    } else if (idx >= 0) {
      state.leads.items[idx] = { ...state.leads.items[idx], ...normalized };
    } else {
      state.leads.items.unshift(normalized);
    }
    syncVisiblePage();

    state.restaurants = mergeRestaurantsSafe(state.restaurants, [{ id: restaurantId, ...(existingRest || {}), ...restPayload }]);
    rebuildLocations();
    refreshCustomers();

    state.leadModal.loading = false;
    if (isInlineCreate) {
      state.leads.view = "list";
      resetDraft();
      rerender();
    } else {
      closeLead();
      rerender();
    }
    if (loginError) {
      notify(`Lead gespeichert. Login fehlgeschlagen: ${loginError}`);
    }
  } catch (err) {
    console.error(err);
    state.leadModal.status = err?.message || "Speichern fehlgeschlagen.";
    state.leadModal.loading = false;
    renderLeadEditor();
  }
}
