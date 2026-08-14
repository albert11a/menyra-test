import {
  findNextAvailableSlugOnlyForDifferentRestaurant,
  getStableLeadSlug,
  resolveStableLeadIdentity,
  shouldClaimRouteForLead,
  shouldPreserveExistingSlug
} from "./lead-identity-contract-utils.js";
import { normalizeBusinessPlanCore } from "../business-accounts/business-plan-core.js";

function normalizeLeadBusinessNameColor(value = "", fallback = "#111827") {
  const raw = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : fallback;
}

function resolveLeadBusinessNamePartColors(source = {}, legacyFallback = "") {
  const landing = source?.landingScreenOne && typeof source.landingScreenOne === "object"
    ? source.landingScreenOne
    : {};
  const legacyColor = normalizeLeadBusinessNameColor(
    source?.businessNameColor
    || source?.landingBusinessNameColor
    || landing.businessNameColor
    || legacyFallback
    || "",
    ""
  );
  const legacyPart2Color = legacyColor && legacyColor.toLowerCase() !== "#111827" ? legacyColor : "";
  return {
    part1: normalizeLeadBusinessNameColor(
      source?.businessNameColorPart1
      || source?.landingBusinessNameColorPart1
      || landing.businessNameColorPart1
      || legacyColor
      || "",
      "#111827"
    ),
    part2: normalizeLeadBusinessNameColor(
      source?.businessNameColorPart2
      || source?.landingBusinessNameColorPart2
      || landing.businessNameColorPart2
      || legacyPart2Color
      || "",
      "#4f46e5"
    )
  };
}

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
        const previewPath = `/${encodeURIComponent(landingSlug)}`;
        return origin ? `${origin}${previewPath}` : previewPath;
      }
      const origin = String(safeOptions.origin || "https://mnyra.com").trim().replace(/\/+$/, "");
      const path = `/${encodeURIComponent(landingSlug)}`;
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
  const buildBusinessUserBootstrapPayload = ({
    uid = "",
    email = "",
    restaurantId = "",
    restaurant = {},
    leadStatus = "",
    creatorMeta = {},
    includeCreatedAt = false
  } = {}) => {
    const safeUid = String(uid || "").trim();
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeUid || !safeRestaurantId) return null;
    const statusKey = String(leadStatus || restaurant?.status || "").trim().toLowerCase();
    const isActive = statusKey === "kunde" || statusKey === "active" || statusKey === "customer";
    const displayName = String(
      restaurant.ownerName
      || restaurant.name
      || restaurant.restaurantName
      || email
      || "Business"
    ).trim();
    const actorUid = String(state?.user?.uid || "").trim();
    const creatorPatch = { ...(creatorMeta || {}) };
    if (actorUid) {
      const path = Array.isArray(creatorPatch.ceoPath) ? creatorPatch.ceoPath : [];
      creatorPatch.ceoPath = Array.from(new Set([...path, actorUid].map((entry) => String(entry || "").trim()).filter(Boolean)));
      if (!String(creatorPatch.createdByUid || "").trim()) creatorPatch.createdByUid = actorUid;
      if (!String(creatorPatch.createdByRole || "").trim()) creatorPatch.createdByRole = "ceo";
    }
    const businessNameColors = resolveLeadBusinessNamePartColors(restaurant);
    const payload = {
      uid: safeUid,
      role: "business",
      restaurantId: safeRestaurantId,
      businessName: String(restaurant.name || restaurant.restaurantName || "").trim(),
      displayName,
      name: displayName,
      email: String(email || restaurant.ownerEmail || restaurant.email || "").trim(),
      logoUrl: String(restaurant.logoUrl || restaurant.logo || "").trim(),
      avatarUrl: String(restaurant.logoUrl || restaurant.logo || "").trim(),
      businessNameColor: normalizeLeadBusinessNameColor(
        restaurant.businessNameColor
        || restaurant.landingBusinessNameColor
        || restaurant.landingScreenOne?.businessNameColor
        || ""
      ),
      landingBusinessNameColor: normalizeLeadBusinessNameColor(
        restaurant.landingBusinessNameColor
        || restaurant.businessNameColor
        || restaurant.landingScreenOne?.businessNameColor
        || ""
      ),
      businessNameColorPart1: businessNameColors.part1,
      businessNameColorPart2: businessNameColors.part2,
      landingBusinessNameColorPart1: businessNameColors.part1,
      landingBusinessNameColorPart2: businessNameColors.part2,
      publicSlug: String(restaurant.publicSlug || "").trim(),
      landingSlug: String(restaurant.landingSlug || "").trim(),
      updatedAt: getTimestamp(),
      ...creatorPatch
    };
    if (isActive || includeCreatedAt) {
      payload.status = isActive ? "active" : "pending";
    }
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") delete payload[key];
    });
    if (includeCreatedAt) payload.createdAt = getTimestamp();
    return payload;
  };

  if (!state.leadModal || state.leadModal.loading || state.leadModal.saving) return;
  state.leadModal.saving = true;

  try {
  const lead = state.leadModal.lead || {};
  const isInlineCreate = isInlineCreateView();
  const settings = getSettings();
  syncDraftFromForm();
  const businessName = docObj.getElementById("leadBusinessName")?.value?.trim() || "";
  const legacyBusinessNameColorValue = (
    docObj.getElementById("leadBusinessNameColor")?.value
    || lead.businessNameColor
    || lead.landingBusinessNameColor
    || lead.landingScreenOne?.businessNameColor
    || ""
  );
  const legacyBusinessNameColor = normalizeLeadBusinessNameColor(legacyBusinessNameColorValue, "");
  const legacyBusinessNameColorPart2 = legacyBusinessNameColor && legacyBusinessNameColor.toLowerCase() !== "#111827"
    ? legacyBusinessNameColor
    : "";
  const businessNameColor = normalizeLeadBusinessNameColor(legacyBusinessNameColor);
  const businessNameColorPart1 = normalizeLeadBusinessNameColor(
    docObj.getElementById("leadBusinessNameColorPart1")?.value
    || lead.businessNameColorPart1
    || lead.landingBusinessNameColorPart1
    || lead.landingScreenOne?.businessNameColorPart1
    || legacyBusinessNameColor
    || ""
  );
  const businessNameColorPart2 = normalizeLeadBusinessNameColor(
    docObj.getElementById("leadBusinessNameColorPart2")?.value
    || lead.businessNameColorPart2
    || lead.landingBusinessNameColorPart2
    || lead.landingScreenOne?.businessNameColorPart2
    || legacyBusinessNameColorPart2
    || "",
    "#4f46e5"
  );
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
  // Der Haken aus dem Adminbereich, der ein Lokal ausserhalb der freigegebenen
  // Kategorien trotzdem oeffentlich stellt. Steht der Haken nicht im Formular,
  // bleibt der bisherige Wert stehen.
  const publicOverrideToggle = docObj.getElementById("leadPublicOverrideEnabled");
  const publicOverrideEnabled = publicOverrideToggle && "checked" in publicOverrideToggle
    ? !!publicOverrideToggle.checked
    : (lead.publicOverrideEnabled === true);
  const logoUrlInput = docObj.getElementById("leadLogoUrl")?.value?.trim() || "";
  const bestSpotLogoUrlInput = docObj.getElementById("leadBestSpotLogoUrl")?.value?.trim() || "";
  const titleImageUrlInput = docObj.getElementById("leadTitleImageUrl")?.value?.trim() || "";
  const openingHours = docObj.getElementById("leadOpeningHours")?.value?.trim() || "";
  const gardenTerraceText = docObj.getElementById("leadGardenTerraceText")?.value?.trim() || "";
  const accessibilityText = docObj.getElementById("leadAccessibilityText")?.value?.trim() || "";
  const veganOptionsText = docObj.getElementById("leadVeganOptionsText")?.value?.trim() || "";
  const restaurantFeatures = {
    gardenTerrace: gardenTerraceText,
    accessibility: accessibilityText,
    veganOptions: veganOptionsText
  };
  const featureList = [gardenTerraceText, accessibilityText, veganOptionsText].filter(Boolean);
  const note = docObj.getElementById("leadNote")?.value?.trim() || "";
  // Destination-Template (nur vorhanden, wenn der Editor das Feld rendert,
  // z. B. in Heart). Ohne die Felder bleiben gespeicherte Werte unveraendert.
  const destinationIdInput = docObj.getElementById("leadDestinationId");
  const hasDestinationFields = !!destinationIdInput;
  const destinationId = String(destinationIdInput?.value || "").trim();
  const destinationName = destinationId
    ? String(docObj.getElementById("leadDestinationName")?.value || "").trim()
    : "";
  let destinationOverrides = {};
  if (hasDestinationFields && destinationId) {
    try {
      const rawOverrides = String(docObj.getElementById("leadDestinationOverrides")?.value || "").trim();
      const parsedOverrides = rawOverrides ? JSON.parse(rawOverrides) : null;
      if (parsedOverrides && typeof parsedOverrides === "object") destinationOverrides = parsedOverrides;
    } catch {
      destinationOverrides = {};
    }
  }
  const destinationPatch = hasDestinationFields
    ? { destinationId, destinationName, destinationOverrides }
    : {};
  const billingCycle = docObj.getElementById("leadBillingCycle")?.value === "yearly" ? "yearly" : "monthly";
  // Der Plan des Kontos. Steht das Feld nicht im Formular (aeltere Ansicht),
  // bleibt der Wert des Leads stehen - nie stillschweigend auf "free" zurueck.
  const planSelect = docObj.getElementById("leadPlan");
  const plan = normalizeBusinessPlanCore(planSelect ? planSelect.value : lead.plan);
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
    state.leadModal.status = "Ju lutem shkruani emrin e biznesit.";
    state.leadModal.saving = false;
    renderLeadEditor();
    return;
  }

  state.leadModal.loading = true;
  state.leadModal.actionsOpen = false;
  state.leadModal.status = "Duke ruajtur...";
  renderLeadEditor();

  try {
    const identity = resolveStableLeadIdentity({
      state,
      lead,
      mode: state.leadModal.mode || ""
    });
    const originalLeadId = identity.existingLeadId;
    let leadId = identity.leadId;
    if (identity.isExistingUpdate && !leadId) {
      throw new Error("Mungon ID e lead-it ekzistues. Ju lutem hapeni perseri dhe ruajeni serish.");
    }
    const leadRef = leadId ? doc(db, "leads", leadId) : doc(collection(db, "leads"));
    if (!leadId) {
      leadId = leadRef.id;
      state.leadModal.pendingLeadId = leadId;
    }
    const isNewLead = !identity.isExistingUpdate;

    const originalRestaurantId = identity.directRestaurantId || identity.linkedRestaurantId;
    let restaurantId = identity.restaurantId;
    if (identity.isExistingUpdate && !restaurantId) {
      throw new Error("Mungon ID e restorantit ekzistues. Nuk u krijua asnje regjistrim i ri restoranti.");
    }
    let restRef = null;
    if (!restaurantId) {
      restRef = doc(collection(db, "restaurants"));
      restaurantId = restRef.id;
      state.leadModal.pendingRestaurantId = restaurantId;
    } else if (isNewLead && !identity.hasExistingRestaurantId) {
      restRef = doc(db, "restaurants", restaurantId);
    }
    state.leadModal.lead = {
      ...lead,
      ...(originalLeadId ? { id: leadId } : {}),
      ...(originalRestaurantId ? { restaurantId } : {}),
      landingRestaurantId: restaurantId,
      pendingLeadId: leadId,
      pendingRestaurantId: restaurantId
    };

    const existingRest = identity.existingRestaurant
      || (restaurantId ? state.restaurants.find((r) => String(r.id) === String(restaurantId)) : null);
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
    const pendingLandingSlug = getStableLeadSlug({
      publicSlug: state.leadModal.pendingPublicSlug || lead.pendingPublicSlug || "",
      landingSlug: state.leadModal.pendingLandingSlug || lead.pendingLandingSlug || ""
    });
    const stableExistingSlug = getStableLeadSlug(lead, existingRest);
    const slugChangedExplicitly = false; // Future explicit rename flow belongs behind its own contract.
    const preserveExistingSlug = !isNewLead && shouldPreserveExistingSlug(
      { lead, restaurant: existingRest },
      { slugChangedExplicitly }
    );
    const hasExistingValidRoute = preserveExistingSlug && !!stableExistingSlug;
    const shouldClaimRoute = shouldClaimRouteForLead({
      isCreate: isNewLead && !pendingLandingSlug,
      hasExistingValidRoute,
      slugChangedExplicitly
    });
    let landingSlug = preserveExistingSlug
      ? stableExistingSlug
      : pendingLandingSlug;
    if (!landingSlug && shouldClaimRoute) {
      landingSlug = await findNextAvailableSlugOnlyForDifferentRestaurant({
        restaurantId,
        businessName,
        leadId,
        resolveLeadLandingSlugUnique,
        buildLeadLandingSlug: buildLandingSlug
      });
    }
    if (!landingSlug) {
      landingSlug = buildLandingSlug(restaurantId, {
        businessName,
        leadId
      });
    }
    if (isNewLead && landingSlug) {
      state.leadModal.pendingPublicSlug = landingSlug;
      state.leadModal.pendingLandingSlug = landingSlug;
    }
    const canonicalPublicPath = landingSlug ? `/${encodeURIComponent(landingSlug)}` : "";
    const landingPageUrl = buildLandingUrl(restaurantId, {
      publicSlug: landingSlug,
      landingSlug,
      businessName,
      leadId,
      forcePublicOrigin: true
    });
    const hasPendingLeadLogoUpload = (
      !!state.leadModal.logoFile
      || !!state.leadModal.bestSpotLogoFile
      || !!state.leadModal.titleImageFile
    );
    const existingTitleImageUrl = (!state.leadModal.titleImageFile ? titleImageUrlInput : "")
      || (!state.leadModal.titleImageFile ? (state.leadModal.titleImagePreview || "") : "")
      || lead.titleImageUrl
      || lead.coverImageUrl
      || lead.coverUrl
      || lead.heroUrl
      || existingRest?.titleImageUrl
      || existingRest?.coverImageUrl
      || existingRest?.coverUrl
      || existingRest?.heroUrl
      || "";
    const preUploadRestaurantRef = hasPendingLeadLogoUpload && restaurantId
      ? (restRef || doc(db, "restaurants", restaurantId))
      : null;
    if (preUploadRestaurantRef) {
      const preUploadRestaurantPayload = {
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
        publicOverrideEnabled,
        openingHours,
        hours: openingHours,
        restaurantFeatures,
        features: featureList,
        gardenTerraceText,
        accessibilityText,
        veganOptionsText,
        titleImageUrl: existingTitleImageUrl,
        coverImageUrl: existingTitleImageUrl,
        coverUrl: existingTitleImageUrl,
        heroUrl: existingTitleImageUrl,
        status: restaurantStatus,
        locations: locationPayload,
        publicSlug: landingSlug,
        canonicalPublicPath,
        landingEnabled: true,
        landingTemplate: "lead-screen-1",
        landingRestaurantId: restaurantId,
        landingSlug,
        landingPageUrl,
        businessNameColor,
        landingBusinessNameColor: businessNameColor,
        businessNameColorPart1,
        businessNameColorPart2,
        landingBusinessNameColorPart1: businessNameColorPart1,
        landingBusinessNameColorPart2: businessNameColorPart2,
        ...creatorMeta,
        updatedAt: getTimestamp()
      };
      if (!originalRestaurantId) preUploadRestaurantPayload.createdAt = getTimestamp();
      await setDoc(preUploadRestaurantRef, preUploadRestaurantPayload, { merge: true });
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
    let bestSpotLogoUrl = bestSpotLogoUrlInput
      || state.leadModal.bestSpotLogoPreview
      || lead.bestSpotLogoUrl
      || lead.spotLogoUrl
      || "";
    if (state.leadModal.bestSpotLogoFile) {
      const { cdnUrl } = await uploadImage(
        state.leadModal.bestSpotLogoFile,
        restaurantId || state.user.uid,
        { maxSize: 512, quality: 0.82, mimeType: "image/jpeg" }
      );
      bestSpotLogoUrl = cdnUrl || bestSpotLogoUrl;
    }
    let titleImageUrl = existingTitleImageUrl;
    if (state.leadModal.titleImageFile) {
      const { cdnUrl } = await uploadImage(
        state.leadModal.titleImageFile,
        restaurantId || state.user.uid,
        { maxSize: 1280, quality: 0.82, mimeType: "image/jpeg" }
      );
      titleImageUrl = cdnUrl || titleImageUrl;
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
      publicOverrideEnabled,
      businessNameColor,
      landingBusinessNameColor: businessNameColor,
      businessNameColorPart1,
      businessNameColorPart2,
      landingBusinessNameColorPart1: businessNameColorPart1,
      landingBusinessNameColorPart2: businessNameColorPart2,
      contactFirstName,
      contactLastName,
      billingCycle,
      plan,
      monthlyPrice,
      yearlyPrice,
      price: activePrice,
      logoUrl,
      logo: logoUrl,
      bestSpotLogoUrl,
      spotLogoUrl: bestSpotLogoUrl,
      titleImageUrl,
      coverImageUrl: titleImageUrl,
      coverUrl: titleImageUrl,
      heroUrl: titleImageUrl,
      openingHours,
      hours: openingHours,
      restaurantFeatures,
      features: featureList,
      gardenTerraceText,
      accessibilityText,
      veganOptionsText,
      status: restaurantStatus,
      leadId,
      locations: locationPayload,
      publicSlug: landingSlug,
      canonicalPublicPath,
      landingEnabled: true,
      landingTemplate: "lead-screen-1",
      landingRestaurantId: restaurantId,
      landingSlug,
      landingPageUrl,
      ...destinationPatch,
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
      const createPatch = !identity.hasExistingRestaurantId ? { createdAt: getTimestamp() } : {};
      if (hasPendingLeadLogoUpload) {
        await setDoc(restRef, { ...restPayload, ...createPatch }, { merge: true });
      } else {
        await setDoc(restRef, {
          ...restPayload,
          ...createPatch
        }, { merge: true });
      }
    } else {
      await setDoc(doc(db, "restaurants", restaurantId), restPayload, { merge: true });
    }
    const publicMetaPromise = ensurePublicMeta(restaurantId, restPayload, {
      publicSlug: landingSlug,
      landingSlug,
      leadId,
      slugAlreadyResolved: true,
      preserveExistingSlug
    });
    if (isNewLead || !hasExistingValidRoute) {
      await publicMetaPromise;
    } else {
      publicMetaPromise.catch((err) => {
        console.warn("[mnyra][lead.publicMeta.bestEffort]", err?.message || err);
      });
    }

    let socialUid = lead.socialUid || "";
    let socialEmail = lead.socialEmail || "";
    const loginEmail = emailInput || socialEmail || "";
    let loginError = "";
    const leadStatusKey = normalizeStatus(statusValue) || "registered";
    if (!socialUid && loginEmail && passwordInput) {
      try {
        const user = await createUser(loginEmail, passwordInput);
        if (user?.uid) {
          socialUid = user.uid;
          socialEmail = loginEmail;
        }
      } catch (err) {
        loginError = err?.message || "Hyrja deshtoi.";
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
    if (socialUid && restaurantId) {
      const userBootstrapPayload = buildBusinessUserBootstrapPayload({
        uid: socialUid,
        email: loginEmail || socialEmail,
        restaurantId,
        restaurant: { ...restPayload, ownerEmail: loginEmail || socialEmail, ownerName: contactName || businessName },
        leadStatus: leadStatusKey,
        creatorMeta,
        includeCreatedAt: !lead.socialUid
      });
      if (userBootstrapPayload) {
        await setDoc(doc(db, "users", socialUid), userBootstrapPayload, { merge: true });
      }
    }
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
      bestSpotLogoUrl,
      spotLogoUrl: bestSpotLogoUrl,
      titleImageUrl,
      coverImageUrl: titleImageUrl,
      coverUrl: titleImageUrl,
      heroUrl: titleImageUrl,
      openingHours,
      hours: openingHours,
      restaurantFeatures,
      features: featureList,
      gardenTerraceText,
      accessibilityText,
      veganOptionsText,
      specialEnabled,
      publicOverrideEnabled,
      note,
      contactFirstName,
      contactLastName,
      billingCycle,
      plan,
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
      businessNameColor,
      landingBusinessNameColor: businessNameColor,
      businessNameColorPart1,
      businessNameColorPart2,
      landingBusinessNameColorPart1: businessNameColorPart1,
      landingBusinessNameColorPart2: businessNameColorPart2,
      socialUid,
      socialEmail,
      ...destinationPatch,
      updatedAt: getTimestamp(),
      ...creatorMeta
    };
    if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
      leadPayload.lat = coords.lat;
      leadPayload.lng = coords.lng;
      leadPayload.gpsLat = coords.lat;
      leadPayload.gpsLng = coords.lng;
    }
    if (isNewLead) {
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
    state.leadModal.saving = false;
    delete state.leadModal.pendingLeadId;
    delete state.leadModal.pendingRestaurantId;
    delete state.leadModal.pendingPublicSlug;
    delete state.leadModal.pendingLandingSlug;
    if (isInlineCreate) {
      state.leads.view = "list";
      resetDraft();
      rerender();
    } else {
      closeLead();
      rerender();
    }
    if (loginError) {
      notify(`Lead u ruajt. Krijimi i login deshtoi: ${loginError}`);
    }
  } catch (err) {
    console.error(err);
    state.leadModal.status = err?.message || "Ruajtja deshtoi.";
    state.leadModal.loading = false;
    state.leadModal.saving = false;
    renderLeadEditor();
  }
  } catch (err) {
    console.error(err);
    state.leadModal.status = err?.message || "Ruajtja deshtoi.";
    state.leadModal.loading = false;
    state.leadModal.saving = false;
    renderLeadEditor();
  }
}
