import {
  findNextAvailableSlugOnlyForDifferentRestaurant,
  getStableLeadSlug,
  resolveStableLeadIdentity,
  shouldClaimRouteForLead,
  shouldPreserveExistingSlug
} from "./lead-identity-contract-utils.js";

function normalizeLeadBusinessNameColor(value = "", fallback = "#111827") {
  const raw = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : fallback;
}

function resolveLeadBusinessNamePartColors(source = {}) {
  const landing = source?.landingScreenOne && typeof source.landingScreenOne === "object"
    ? source.landingScreenOne
    : {};
  const legacyColor = normalizeLeadBusinessNameColor(
    source?.businessNameColor
    || source?.landingBusinessNameColor
    || landing.businessNameColor
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

export async function convertLeadToCustomerCore({
  leadId,
  state,
  confirmFn,
  buildLeadCrmContribution,
  resolveCustomerType,
  resolveStoredCeoCreatorMeta,
  normalizeLeadLocations,
  getPrimaryLeadLocation,
  hasLeadLocationCoords,
  serverTimestamp,
  doc,
  collection,
  db,
  setDoc,
  ensureRestaurantPublicMeta,
  buildLeadLandingPageUrl,
  buildLeadLandingSlug,
  resolveLeadLandingSlugUnique,
  accumulateCeoCrmDelta,
  buildCustomerCrmContribution,
  applyCeoCrmCountDeltas,
  syncVisibleLeadPageFromItems,
  mergeRestaurants,
  rebuildBusinessLocations,
  refreshCustomersFromRestaurants,
  render,
  alertFn
} = {}) {
  if (!state || !state.user || !leadId) return false;
  const lead = state.leads.items.find((item) => String(item.id) === String(leadId));
  if (!lead) return false;
  const convertingKey = String(leadId || "").trim();
  if (!state.leads.convertingIds) state.leads.convertingIds = new Set();
  if (state.leads.convertingIds.has(convertingKey)) return false;
  state.leads.convertingIds.add(convertingKey);
  let confirmed = false;
  try {
    confirmed = typeof confirmFn === "function" ? confirmFn("Lead als Kunde aktivieren?") : false;
  } catch (err) {
    console.error(err);
    if (typeof alertFn === "function") alertFn(err?.message || "Umwandlung fehlgeschlagen.");
    state.leads.convertingIds.delete(convertingKey);
    return false;
  }
  if (!confirmed) {
    state.leads.convertingIds.delete(convertingKey);
    return false;
  }
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
  const buildBusinessUserBootstrapPayload = ({
    uid = "",
    email = "",
    restaurantId = "",
    restaurant = {},
    creatorMeta = {}
  } = {}) => {
    const safeUid = String(uid || "").trim();
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeUid || !safeRestaurantId) return null;
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
      status: "active",
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
      updatedAt: serverTimestamp(),
      ...creatorPatch
    };
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") delete payload[key];
    });
    return payload;
  };

  try {
    const prevLeadContribution = buildLeadCrmContribution(lead);
    const identity = resolveStableLeadIdentity({
      state,
      lead,
      mode: "update"
    });
    let restaurantId = identity.restaurantId || "";
    let existingRest = identity.existingRestaurant
      || (restaurantId ? state.restaurants.find((r) => String(r.id) === String(restaurantId)) : null);
    const businessName = lead.businessName || "Neuer Kunde";
    const businessNameColor = normalizeLeadBusinessNameColor(
      lead.businessNameColor
      || lead.landingBusinessNameColor
      || lead.landingScreenOne?.businessNameColor
      || existingRest?.businessNameColor
      || existingRest?.landingBusinessNameColor
      || existingRest?.landingScreenOne?.businessNameColor
      || ""
    );
    const businessNameColors = resolveLeadBusinessNamePartColors({
      ...(existingRest || {}),
      ...(lead || {}),
      landingScreenOne: lead?.landingScreenOne || existingRest?.landingScreenOne || null
    });
    const businessNameColorPart1 = businessNameColors.part1;
    const businessNameColorPart2 = businessNameColors.part2;
    const type = resolveCustomerType(lead.customerType || "cafe");
    const creatorMeta = resolveStoredCeoCreatorMeta(lead, existingRest);
    const locations = normalizeLeadLocations(lead.locations || [], lead.address || "", {
      lat: lead.lat ?? null,
      lng: lead.lng ?? null
    });
    const primaryLocation = getPrimaryLeadLocation(locations);
    const locationPayload = locations
      .filter((item) => item.address || hasLeadLocationCoords(item))
      .map((item) => {
        const row = { address: item.address || "" };
        if (hasLeadLocationCoords(item)) {
          row.lat = Number(item.lat);
          row.lng = Number(item.lng);
        }
        return row;
      });
    const restPayloadBase = {
      name: businessName,
      restaurantName: businessName,
      type,
      city: lead.city || "",
      address: primaryLocation.address || lead.address || "",
      phone: lead.phone || "",
      instagram: lead.instagram || lead.insta || "",
      insta: lead.instagram || lead.insta || "",
      ownerName: lead.contactName || "",
      ownerEmail: lead.email || lead.socialEmail || "",
      logoUrl: lead.logoUrl || "",
      logo: lead.logoUrl || "",
      businessNameColor,
      landingBusinessNameColor: businessNameColor,
      businessNameColorPart1,
      businessNameColorPart2,
      landingBusinessNameColorPart1: businessNameColorPart1,
      landingBusinessNameColorPart2: businessNameColorPart2,
      bestSpotLogoUrl: lead.bestSpotLogoUrl || lead.spotLogoUrl || existingRest?.bestSpotLogoUrl || existingRest?.spotLogoUrl || "",
      spotLogoUrl: lead.bestSpotLogoUrl || lead.spotLogoUrl || existingRest?.bestSpotLogoUrl || existingRest?.spotLogoUrl || "",
      titleImageUrl: lead.titleImageUrl || lead.coverImageUrl || lead.coverUrl || lead.heroUrl || existingRest?.titleImageUrl || existingRest?.coverImageUrl || existingRest?.coverUrl || existingRest?.heroUrl || "",
      coverImageUrl: lead.coverImageUrl || lead.titleImageUrl || lead.coverUrl || lead.heroUrl || existingRest?.coverImageUrl || existingRest?.titleImageUrl || existingRest?.coverUrl || existingRest?.heroUrl || "",
      coverUrl: lead.coverUrl || lead.titleImageUrl || lead.coverImageUrl || lead.heroUrl || existingRest?.coverUrl || existingRest?.titleImageUrl || existingRest?.coverImageUrl || existingRest?.heroUrl || "",
      heroUrl: lead.heroUrl || lead.titleImageUrl || lead.coverImageUrl || lead.coverUrl || existingRest?.heroUrl || existingRest?.titleImageUrl || existingRest?.coverImageUrl || existingRest?.coverUrl || "",
      openingHours: lead.openingHours || lead.hours || existingRest?.openingHours || existingRest?.hours || "",
      hours: lead.hours || lead.openingHours || existingRest?.hours || existingRest?.openingHours || "",
      restaurantFeatures: lead.restaurantFeatures || existingRest?.restaurantFeatures || {},
      features: Array.isArray(lead.features) ? lead.features : (Array.isArray(existingRest?.features) ? existingRest.features : []),
      gardenTerraceText: lead.gardenTerraceText || existingRest?.gardenTerraceText || "",
      accessibilityText: lead.accessibilityText || existingRest?.accessibilityText || "",
      veganOptionsText: lead.veganOptionsText || existingRest?.veganOptionsText || "",
      status: "active",
      leadId: lead.id || "",
      locations: locationPayload,
      ...creatorMeta,
      updatedAt: serverTimestamp()
    };
    if (hasLeadLocationCoords(primaryLocation)) {
      restPayloadBase.lat = Number(primaryLocation.lat);
      restPayloadBase.lng = Number(primaryLocation.lng);
    } else if (Number.isFinite(Number(lead.lat)) && Number.isFinite(Number(lead.lng))) {
      restPayloadBase.lat = Number(lead.lat);
      restPayloadBase.lng = Number(lead.lng);
    }

    let createdRestaurantForConversion = false;
    if (!restaurantId) {
      const restRef = doc(collection(db, "restaurants"));
      restaurantId = restRef.id;
      createdRestaurantForConversion = true;
    }
    const slugChangedExplicitly = false;
    const preserveExistingSlug = shouldPreserveExistingSlug(
      { lead, restaurant: existingRest },
      { slugChangedExplicitly }
    );
    const stableExistingSlug = getStableLeadSlug(lead, existingRest);
    const shouldClaimRoute = shouldClaimRouteForLead({
      isCreate: createdRestaurantForConversion,
      hasExistingValidRoute: preserveExistingSlug && !!stableExistingSlug,
      slugChangedExplicitly
    });
    let landingSlug = preserveExistingSlug ? stableExistingSlug : "";
    if (!landingSlug && shouldClaimRoute) {
      landingSlug = await findNextAvailableSlugOnlyForDifferentRestaurant({
        restaurantId,
        businessName,
        leadId: lead?.id || "",
        resolveLeadLandingSlugUnique,
        buildLeadLandingSlug: buildLandingSlug
      });
    }
    if (!landingSlug) {
      landingSlug = buildLandingSlug(restaurantId, {
        businessName,
        leadId: lead?.id || ""
      });
    }
    const canonicalPublicPath = landingSlug ? `/${encodeURIComponent(landingSlug)}` : "";
    const landingPageUrl = buildLandingUrl(restaurantId, {
      publicSlug: landingSlug,
      landingSlug,
      businessName,
      leadId: lead?.id || "",
      forcePublicOrigin: true
    });
    const restPayload = {
      ...restPayloadBase,
      landingEnabled: true,
      landingTemplate: "lead-screen-1",
      landingRestaurantId: restaurantId,
      publicSlug: landingSlug,
      canonicalPublicPath,
      landingSlug,
      landingPageUrl,
      businessNameColor,
      landingBusinessNameColor: businessNameColor,
      businessNameColorPart1,
      businessNameColorPart2,
      landingBusinessNameColorPart1: businessNameColorPart1,
      landingBusinessNameColorPart2: businessNameColorPart2
    };
    if (!existingRest && restaurantId) {
      existingRest = state.restaurants.find((r) => String(r.id) === String(restaurantId)) || existingRest;
    }
    if (createdRestaurantForConversion) {
      await setDoc(doc(db, "restaurants", restaurantId), {
        ...restPayload,
        createdAt: serverTimestamp()
      }, { merge: true });
    } else {
      await setDoc(doc(db, "restaurants", restaurantId), restPayload, { merge: true });
    }
    await ensureRestaurantPublicMeta(restaurantId, restPayload, {
      publicSlug: landingSlug,
      landingSlug,
      leadId: lead?.id || "",
      slugAlreadyResolved: true,
      preserveExistingSlug
    });

    const socialUid = lead.socialUid || "";
    const socialEmail = lead.socialEmail || lead.email || "";
    if (restaurantId) {
      const ownerPatch = {};
      if (socialUid) ownerPatch.ownerUid = socialUid;
      if (socialEmail) ownerPatch.ownerEmail = socialEmail;
      if (lead.contactName || businessName) ownerPatch.ownerName = lead.contactName || businessName;
      if (Object.keys(ownerPatch).length) {
        ownerPatch.updatedAt = serverTimestamp();
        await setDoc(doc(db, "restaurants", restaurantId), ownerPatch, { merge: true });
      }
    }
    if (socialUid && restaurantId) {
      const userBootstrapPayload = buildBusinessUserBootstrapPayload({
        uid: socialUid,
        email: socialEmail,
        restaurantId,
        restaurant: { ...restPayload, ownerEmail: socialEmail, ownerName: lead.contactName || businessName },
        creatorMeta
      });
      if (userBootstrapPayload) {
        await setDoc(doc(db, "users", socialUid), userBootstrapPayload, { merge: true });
      }
    }

    await setDoc(doc(db, "leads", lead.id), {
      status: "kunde",
      restaurantId,
      landingEnabled: true,
      landingTemplate: "lead-screen-1",
      landingRestaurantId: restaurantId,
      publicSlug: landingSlug,
      canonicalPublicPath,
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
      convertedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    const crmDeltaMap = new Map();
    accumulateCeoCrmDelta(crmDeltaMap, prevLeadContribution, -1);
    accumulateCeoCrmDelta(crmDeltaMap, buildCustomerCrmContribution({ id: restaurantId, ...(existingRest || {}), ...restPayload, status: "active" }), 1);
    await applyCeoCrmCountDeltas(crmDeltaMap);

    state.leads.items = state.leads.items.filter((item) => String(item.id) !== String(lead.id));
    syncVisibleLeadPageFromItems();
    state.restaurants = mergeRestaurants(state.restaurants, [{ id: restaurantId, ...(existingRest || {}), ...restPayload, status: "active" }]);
    rebuildBusinessLocations();
    refreshCustomersFromRestaurants();
    render();
    state.leads.convertingIds.delete(convertingKey);
    return true;
  } catch (err) {
    console.error(err);
    alertFn(err?.message || "Umwandlung fehlgeschlagen.");
    state.leads.convertingIds.delete(convertingKey);
    return false;
  }
}
