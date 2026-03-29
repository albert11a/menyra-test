export async function deleteLeadFromModalCore({
  state,
  isCeoUser,
  confirmFn,
  renderLeadEditorUi,
  resolveRestaurantLinkedToLead,
  mergeRestaurants,
  collectLeadIdentityPayload,
  buildLeadCrmContribution,
  buildCustomerCrmContribution,
  deleteDoc,
  doc,
  db,
  setDoc,
  serverTimestamp,
  purgeRestaurantSocialPresence,
  deactivateLinkedBusinessUsers,
  applyDeletedRestaurantStateLocally,
  accumulateCeoCrmDelta,
  applyCeoCrmCountDeltas,
  createLeadScopeMap,
  CRM_PAGE_SIZE,
  writeLeadScopeCache,
  normalizeLeadScopeKey,
  resetLeadDraft,
  render
} = {}) {
  const isCeo = typeof isCeoUser === "function" ? isCeoUser : (() => false);
  const confirmAction = typeof confirmFn === "function"
    ? confirmFn
    : (typeof confirm === "function" ? confirm : null);
  if (
    !state
    || !state.user
    || !isCeo()
    || !confirmAction
    || typeof renderLeadEditorUi !== "function"
    || typeof resolveRestaurantLinkedToLead !== "function"
    || typeof mergeRestaurants !== "function"
    || typeof collectLeadIdentityPayload !== "function"
    || typeof buildLeadCrmContribution !== "function"
    || typeof buildCustomerCrmContribution !== "function"
    || typeof deleteDoc !== "function"
    || typeof doc !== "function"
    || !db
    || typeof setDoc !== "function"
    || typeof serverTimestamp !== "function"
    || typeof purgeRestaurantSocialPresence !== "function"
    || typeof deactivateLinkedBusinessUsers !== "function"
    || typeof applyDeletedRestaurantStateLocally !== "function"
    || typeof accumulateCeoCrmDelta !== "function"
    || typeof applyCeoCrmCountDeltas !== "function"
    || typeof createLeadScopeMap !== "function"
    || typeof writeLeadScopeCache !== "function"
    || typeof normalizeLeadScopeKey !== "function"
    || typeof resetLeadDraft !== "function"
    || typeof render !== "function"
  ) {
    return false;
  }

  const lead = state.leadModal?.lead || {};
  const leadId = String(lead.id || "").trim();
  if (!leadId) return false;

  const leadName = String(lead.businessName || lead.name || "").trim() || "diesen Lead";
  if (!confirmAction(`Lead "${leadName}" wirklich loeschen?`)) {
    return false;
  }

  state.leadModal.actionsOpen = false;
  state.leadModal.deleting = true;
  state.leadModal.status = "Loeschen...";
  renderLeadEditorUi();

  try {
    const linkedRestaurant = await resolveRestaurantLinkedToLead(lead);
    if (linkedRestaurant?.id) {
      state.restaurants = mergeRestaurants(state.restaurants, [{ id: linkedRestaurant.id, ...linkedRestaurant }]);
    }
    const identityPayload = collectLeadIdentityPayload(lead, linkedRestaurant);
    const restaurantId = String(identityPayload.restaurantId || "").trim();
    const prevLeadContribution = buildLeadCrmContribution(lead);
    const prevCustomerContribution = linkedRestaurant?.id
      ? buildCustomerCrmContribution({ id: linkedRestaurant.id, ...linkedRestaurant })
      : null;

    await deleteDoc(doc(db, "leads", leadId));

    if (restaurantId) {
      await setDoc(doc(db, "restaurants", restaurantId), {
        leadId: "",
        status: "deleted",
        hiddenFromDiscover: true,
        deleted: true,
        isDeleted: true,
        deletedAt: serverTimestamp(),
        ownerUid: "",
        ownerEmail: "",
        ownerName: "",
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(() => {});

      await setDoc(doc(db, "restaurants", restaurantId, "public", "meta"), {
        status: "deleted",
        hiddenFromDiscover: true,
        deleted: true,
        isDeleted: true,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(() => {});

      await Promise.all([
        purgeRestaurantSocialPresence(restaurantId).catch(() => {}),
        deactivateLinkedBusinessUsers({
          restaurantId,
          explicitUids: identityPayload.uids,
          emails: identityPayload.emails
        }).catch(() => {})
      ]);
      applyDeletedRestaurantStateLocally(restaurantId);
    } else if (identityPayload.uids.length || identityPayload.emails.length) {
      await deactivateLinkedBusinessUsers({
        restaurantId: "",
        explicitUids: identityPayload.uids,
        emails: identityPayload.emails
      }).catch(() => {});
    }

    const crmDeltaMap = new Map();
    accumulateCeoCrmDelta(crmDeltaMap, prevLeadContribution, -1);
    accumulateCeoCrmDelta(crmDeltaMap, prevCustomerContribution, -1);
    await applyCeoCrmCountDeltas(crmDeltaMap);

    const removeLeadById = (rows) => (Array.isArray(rows)
      ? rows.filter((item) => (
        String(item?.id || "") !== leadId
        && (!restaurantId || String(item?.restaurantId || "") !== restaurantId)
      ))
      : []);

    const scopeKeys = ["own", "staff", "archived"];
    const nextPages = { ...(state.leads.pages || createLeadScopeMap(() => [])) };
    const nextKnown = { ...(state.leads.knownCount || createLeadScopeMap(() => 0)) };
    const nextCountExact = { ...(state.leads.countExact || createLeadScopeMap(() => false)) };
    const currentUid = String(state.user?.uid || "").trim();

    scopeKeys.forEach((scopeKey) => {
      const currentRows = Array.isArray(nextPages[scopeKey]) ? nextPages[scopeKey] : [];
      const filteredRows = removeLeadById(currentRows);
      if (filteredRows.length === currentRows.length) return;
      const removedCount = currentRows.length - filteredRows.length;
      nextPages[scopeKey] = filteredRows;
      if (state.leads.loaded?.[scopeKey]) {
        const prevKnown = Number(nextKnown[scopeKey]) || 0;
        nextKnown[scopeKey] = Math.max(0, prevKnown - removedCount);
        if (!state.leads.hasMore?.[scopeKey]) nextCountExact[scopeKey] = true;
        const pageSize = Math.max(CRM_PAGE_SIZE, Number(state.leads.pageSize?.[scopeKey]) || CRM_PAGE_SIZE);
        writeLeadScopeCache(currentUid, scopeKey, filteredRows, {
          hasMore: !!state.leads.hasMore?.[scopeKey],
          knownCount: nextKnown[scopeKey],
          countExact: nextCountExact[scopeKey] !== false,
          pageSize
        });
      }
    });

    state.leads.pages = nextPages;
    state.leads.knownCount = nextKnown;
    state.leads.countExact = nextCountExact;
    state.leads.items = removeLeadById(state.leads.items);

    const currentScope = normalizeLeadScopeKey(state.leads.scope);
    state.leads.items = Array.isArray(nextPages[currentScope]) ? nextPages[currentScope].slice() : [];
    state.leads.view = "list";
    resetLeadDraft();
    render();
    return true;
  } catch (err) {
    console.error(err);
    state.leadModal.deleting = false;
    state.leadModal.status = err?.message || "Loeschen fehlgeschlagen.";
    renderLeadEditorUi();
    return false;
  }
}
