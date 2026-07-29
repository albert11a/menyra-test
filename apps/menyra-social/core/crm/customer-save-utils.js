export async function saveCustomerFromModalCore({
  state,
  documentObj,
  resolveCustomerType,
  renderOverlays,
  buildCustomerCrmContribution,
  uploadCompressedImage,
  normalizeLeadStatusKey,
  resolveRestaurantStatusFromLead,
  serverTimestamp,
  setDoc,
  doc,
  collection,
  db,
  ensureRestaurantPublicMeta,
  accumulateCeoCrmDelta,
  resolveStoredCeoCreatorMeta,
  buildLeadCrmContribution,
  normalizeLeadDoc,
  leadBelongsToScope,
  syncVisibleLeadPageFromItems,
  applyCeoCrmCountDeltas,
  mergeRestaurants,
  rebuildBusinessLocations,
  refreshCustomersFromRestaurants,
  closeCustomerModal,
  render
} = {}) {
  if (!state || !state.user) return;
  const docObj = documentObj || (typeof document !== "undefined" ? document : null);
  if (
    !docObj
    || typeof resolveCustomerType !== "function"
    || typeof renderOverlays !== "function"
    || typeof uploadCompressedImage !== "function"
    || typeof normalizeLeadStatusKey !== "function"
    || typeof resolveRestaurantStatusFromLead !== "function"
    || typeof serverTimestamp !== "function"
    || typeof setDoc !== "function"
    || typeof doc !== "function"
    || typeof collection !== "function"
    || !db
    || typeof ensureRestaurantPublicMeta !== "function"
    || typeof buildCustomerCrmContribution !== "function"
    || typeof accumulateCeoCrmDelta !== "function"
    || typeof resolveStoredCeoCreatorMeta !== "function"
    || typeof buildLeadCrmContribution !== "function"
    || typeof normalizeLeadDoc !== "function"
    || typeof leadBelongsToScope !== "function"
    || typeof syncVisibleLeadPageFromItems !== "function"
    || typeof applyCeoCrmCountDeltas !== "function"
    || typeof mergeRestaurants !== "function"
    || typeof rebuildBusinessLocations !== "function"
    || typeof refreshCustomersFromRestaurants !== "function"
    || typeof closeCustomerModal !== "function"
    || typeof render !== "function"
  ) {
    return;
  }

  const customer = state.customerModal?.customer;
  if (!customer?.id) return;

  const name = docObj.getElementById("customerName")?.value?.trim() || "";
  const type = resolveCustomerType(docObj.getElementById("customerType")?.value || customer.type || "cafe");
  const ownerName = docObj.getElementById("customerOwnerName")?.value?.trim() || "";
  const ownerEmail = docObj.getElementById("customerOwnerEmail")?.value?.trim() || "";
  const phone = docObj.getElementById("customerPhone")?.value?.trim() || "";
  const instagram = docObj.getElementById("customerInstagram")?.value?.trim() || "";
  const city = docObj.getElementById("customerCity")?.value?.trim() || "";
  const address = docObj.getElementById("customerAddress")?.value?.trim() || "";
  const logoUrlInput = docObj.getElementById("customerLogoUrl")?.value?.trim() || "";
  const statusValue = docObj.getElementById("customerStatus")?.value || customer.status || "kunde";

  if (!name) {
    state.customerModal.status = "Ju lutem shkruani emrin e biznesit.";
    renderOverlays({ updateCustomer: true });
    return;
  }

  state.customerModal.loading = true;
  state.customerModal.status = "Duke ruajtur...";
  renderOverlays({ updateCustomer: true });

  try {
    const prevCustomerContribution = buildCustomerCrmContribution(customer);
    let logoUrl = logoUrlInput || state.customerModal.logoPreview || customer.logoUrl || "";
    if (state.customerModal.logoFile) {
      const { cdnUrl } = await uploadCompressedImage(
        state.customerModal.logoFile,
        customer.id,
        { maxSize: 512, quality: 0.82, mimeType: "image/jpeg" }
      );
      logoUrl = cdnUrl || logoUrl;
    }

    const statusKey = normalizeLeadStatusKey(statusValue) || "kunde";
    const restaurantStatus = resolveRestaurantStatusFromLead(statusKey, customer.status || "");
    const payload = {
      name,
      restaurantName: name,
      type,
      ownerName,
      ownerEmail,
      phone,
      instagram,
      insta: instagram,
      city,
      address,
      logoUrl,
      logo: logoUrl,
      status: restaurantStatus,
      updatedAt: serverTimestamp()
    };
    await setDoc(doc(db, "restaurants", customer.id), payload, { merge: true });
    await ensureRestaurantPublicMeta(customer.id, payload);

    const crmDeltaMap = new Map();
    accumulateCeoCrmDelta(crmDeltaMap, prevCustomerContribution, -1);

    if (statusKey !== "kunde") {
      const leadId = customer.leadId || payload.leadId || "";
      const matchedLead = (leadId
        ? state.leads.items.find((item) => String(item.id || "") === String(leadId))
        : null)
        || state.leads.items.find((item) => String(item.restaurantId || "") === String(customer.id));
      const creatorMeta = resolveStoredCeoCreatorMeta(matchedLead, customer);
      const leadRef = leadId ? doc(db, "leads", leadId) : doc(collection(db, "leads"));
      const leadPayload = {
        businessName: name,
        customerType: type,
        contactName: ownerName,
        phone,
        instagram,
        insta: instagram,
        email: ownerEmail,
        city,
        address,
        logoUrl,
        status: statusKey,
        restaurantId: customer.id,
        updatedAt: serverTimestamp(),
        ...creatorMeta
      };
      if (!leadId) leadPayload.createdAt = serverTimestamp();
      await setDoc(leadRef, leadPayload, { merge: true });
      if (!leadId) {
        await setDoc(doc(db, "restaurants", customer.id), { leadId: leadRef.id }, { merge: true });
        payload.leadId = leadRef.id;
      }
      accumulateCeoCrmDelta(crmDeltaMap, buildLeadCrmContribution({ id: leadRef.id, ...leadPayload }), 1);
      const normalizedLead = normalizeLeadDoc({ id: leadRef.id, ...leadPayload });
      const idx = state.leads.items.findIndex((item) => String(item.id) === String(leadRef.id));
      const visibleInCurrentScope = leadBelongsToScope(normalizedLead);
      if (!visibleInCurrentScope) {
        state.leads.items = state.leads.items.filter((item) => String(item.id || "") !== String(leadRef.id));
      } else if (idx >= 0) state.leads.items[idx] = { ...state.leads.items[idx], ...normalizedLead };
      else state.leads.items.unshift(normalizedLead);
      syncVisibleLeadPageFromItems();
    } else {
      const matchedLead = state.leads.items.find((item) => String(item.restaurantId || "") === String(customer.id));
      const leadId = customer.leadId || matchedLead?.id || "";
      if (leadId) {
        await setDoc(doc(db, "leads", leadId), {
          status: "kunde",
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      accumulateCeoCrmDelta(crmDeltaMap, buildCustomerCrmContribution({ id: customer.id, ...customer, ...payload }), 1);
      state.leads.items = state.leads.items.filter((item) => (
        String(item.restaurantId || "") !== String(customer.id)
        && String(item.id || "") !== String(leadId)
      ));
      syncVisibleLeadPageFromItems();
    }

    await applyCeoCrmCountDeltas(crmDeltaMap);

    state.restaurants = mergeRestaurants(state.restaurants, [{ id: customer.id, ...customer, ...payload }]);
    rebuildBusinessLocations();
    refreshCustomersFromRestaurants();

    state.customerModal.loading = false;
    closeCustomerModal();
    render();
  } catch (err) {
    console.error(err);
    state.customerModal.status = err?.message || "Ruajtja deshtoi.";
    state.customerModal.loading = false;
    renderOverlays({ updateCustomer: true });
  }
}
