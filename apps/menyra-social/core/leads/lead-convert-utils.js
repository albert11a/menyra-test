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
  if (state.leadModal?.loading || state.leadModal?.deleting) return false;
  const visibleLead = Array.isArray(state.leads?.items)
    ? state.leads.items.find((item) => String(item?.id || "") === String(leadId))
    : null;
  const modalLead = String(state.leadModal?.lead?.id || "") === String(leadId)
    ? state.leadModal.lead
    : null;
  const lead = visibleLead ? { ...(modalLead || {}), ...visibleLead } : modalLead;
  if (!lead) return false;
  const confirmAction = typeof confirmFn === "function"
    ? confirmFn
    : (typeof confirm === "function" ? confirm : null);
  const notify = typeof alertFn === "function"
    ? alertFn
    : ((message) => {
      if (typeof alert === "function") alert(message);
    });
  if (!confirmAction || !confirmAction("Lead als Kunde aktivieren?")) return false;

  const modalMatchesTarget = String(state.leadModal?.lead?.id || "") === String(leadId);
  if (modalMatchesTarget) {
    state.leadModal.loading = true;
    state.leadModal.actionsOpen = false;
    state.leadModal.status = "Lead wird zu Kunde umgewandelt...";
    render();
  }

  try {
    const prevLeadContribution = buildLeadCrmContribution(lead);
    let restaurantId = lead.restaurantId || "";
    let existingRest = restaurantId ? state.restaurants.find((r) => String(r.id) === String(restaurantId)) : null;
    const existingRestaurantLeadId = String(existingRest?.leadId || "").trim();
    if (restaurantId && existingRestaurantLeadId && existingRestaurantLeadId !== String(lead.id || "").trim()) {
      throw new Error("Verknuepftes Restaurant passt nicht mehr zu diesem Lead.");
    }
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
    const restPayload = {
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
      restPayload.lat = Number(primaryLocation.lat);
      restPayload.lng = Number(primaryLocation.lng);
    } else if (Number.isFinite(Number(lead.lat)) && Number.isFinite(Number(lead.lng))) {
      restPayload.lat = Number(lead.lat);
      restPayload.lng = Number(lead.lng);
    }

    if (!restaurantId) {
      const restRef = doc(collection(db, "restaurants"));
      restaurantId = restRef.id;
      await setDoc(restRef, {
        ...restPayload,
        createdAt: serverTimestamp()
      });
    } else {
      await setDoc(doc(db, "restaurants", restaurantId), restPayload, { merge: true });
    }
    await ensureRestaurantPublicMeta(restaurantId, restPayload);

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
    if (modalMatchesTarget) {
      state.leadModal.loading = false;
      state.leadModal.status = "";
    }
    render();
    return true;
  } catch (err) {
    console.error(err);
    if (modalMatchesTarget) {
      state.leadModal.loading = false;
      state.leadModal.status = err?.message || "Umwandlung fehlgeschlagen.";
      render();
    }
    notify(err?.message || "Umwandlung fehlgeschlagen.");
    return false;
  }
}
