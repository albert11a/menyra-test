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
  if (!confirmFn("Lead als Kunde aktivieren?")) return false;
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
        const previewPath = `/apps/menyra-social/index.html?r=${encodeURIComponent(landingSlug)}&tab=profile&top=landing`;
        return origin ? `${origin}${previewPath}` : previewPath;
      }
      const origin = String(safeOptions.origin || "https://mnyra.com").trim().replace(/\/+$/, "");
      const path = `/${encodeURIComponent(landingSlug)}`;
      return origin ? `${origin}${path}` : path;
    });

  try {
    const prevLeadContribution = buildLeadCrmContribution(lead);
    let restaurantId = lead.restaurantId || "";
    let existingRest = restaurantId ? state.restaurants.find((r) => String(r.id) === String(restaurantId)) : null;
    const businessName = lead.businessName || "Neuer Kunde";
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

    if (!restaurantId) {
      const restRef = doc(collection(db, "restaurants"));
      restaurantId = restRef.id;
    }
    const landingSlug = buildLandingSlug(restaurantId, {
      landingSlug: lead?.landingSlug || existingRest?.landingSlug || "",
      businessName,
      leadId: lead?.id || ""
    });
    const landingPageUrl = buildLandingUrl(restaurantId, {
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
      landingSlug,
      landingPageUrl
    };
    if (!existingRest && restaurantId) {
      existingRest = state.restaurants.find((r) => String(r.id) === String(restaurantId)) || existingRest;
    }
    if (!lead.restaurantId) {
      await setDoc(doc(db, "restaurants", restaurantId), {
        ...restPayload,
        createdAt: serverTimestamp()
      }, { merge: true });
    } else {
      await setDoc(doc(db, "restaurants", restaurantId), restPayload, { merge: true });
    }
    await ensureRestaurantPublicMeta(restaurantId, restPayload, { landingSlug, leadId: lead?.id || "" });

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

    await setDoc(doc(db, "leads", lead.id), {
      status: "kunde",
      restaurantId,
      landingEnabled: true,
      landingTemplate: "lead-screen-1",
      landingRestaurantId: restaurantId,
      landingSlug,
      landingPageUrl,
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
    return true;
  } catch (err) {
    console.error(err);
    alertFn(err?.message || "Umwandlung fehlgeschlagen.");
    return false;
  }
}
