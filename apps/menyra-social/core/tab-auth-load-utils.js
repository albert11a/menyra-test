export function ensureTabDataCore({
  tab,
  state,
  dataLoaded,
  FAST_MODE = false,
  sanitizeTabForSession,
  render,
  stopRestaurantsListener,
  startChatThreadsListener,
  stopChatThreadsListener,
  startOrdersListener,
  stopOrdersListener,
  stopRestaurantMetaListeners,
  getFeedUnsubFn,
  setFeedUnsubFn,
  getStoriesUnsubFn,
  setStoriesUnsubFn,
  getFeedDeltaTimerFn,
  setFeedDeltaTimerFn,
  clearIntervalFn,
  isCeoUser,
  queueCrmLazyRenderersPrefetch,
  loadFeedPosts,
  scheduleIdle,
  loadRestaurants,
  isLocalBusinessProfile,
  loadUserPosts,
  loadBusinessPosts,
  loadAuthProfile,
  loadMenuForRestaurant,
  loadFocusForRestaurant,
  notificationsUnsub,
  updateNotificationsDom,
  loadNotificationsFromFirebase,
  normalizeLeadScopeKey,
  loadLeads,
  normalizeCustomerScopeKey,
  loadCustomers,
  loadCeoStaff
} = {}) {
  if (!state || !dataLoaded || typeof sanitizeTabForSession !== "function" || typeof render !== "function") return;
  const getFeedUnsub = typeof getFeedUnsubFn === "function" ? getFeedUnsubFn : (() => null);
  const setFeedUnsub = typeof setFeedUnsubFn === "function" ? setFeedUnsubFn : (() => {});
  const getStoriesUnsub = typeof getStoriesUnsubFn === "function" ? getStoriesUnsubFn : (() => null);
  const setStoriesUnsub = typeof setStoriesUnsubFn === "function" ? setStoriesUnsubFn : (() => {});
  const getFeedDeltaTimer = typeof getFeedDeltaTimerFn === "function" ? getFeedDeltaTimerFn : (() => null);
  const setFeedDeltaTimer = typeof setFeedDeltaTimerFn === "function" ? setFeedDeltaTimerFn : (() => {});
  const clearIntervalSafe = typeof clearIntervalFn === "function" ? clearIntervalFn : (() => {});
  const isCeo = typeof isCeoUser === "function" ? isCeoUser : (() => false);
  const queueCeoPrefetch = typeof queueCrmLazyRenderersPrefetch === "function"
    ? queueCrmLazyRenderersPrefetch
    : (() => {});
  const loadFeed = typeof loadFeedPosts === "function" ? loadFeedPosts : (() => Promise.resolve());
  const scheduleIdleSafe = typeof scheduleIdle === "function" ? scheduleIdle : ((fn) => fn?.());
  const loadRestaurantsSafe = typeof loadRestaurants === "function" ? loadRestaurants : (() => Promise.resolve());
  const isBusinessProfile = typeof isLocalBusinessProfile === "function" ? isLocalBusinessProfile : (() => false);
  const loadUserPostsSafe = typeof loadUserPosts === "function" ? loadUserPosts : (() => Promise.resolve());
  const loadBusinessPostsSafe = typeof loadBusinessPosts === "function" ? loadBusinessPosts : (() => Promise.resolve());
  const loadAuthProfileSafe = typeof loadAuthProfile === "function" ? loadAuthProfile : (() => Promise.resolve());
  const loadMenuForRestaurantSafe = typeof loadMenuForRestaurant === "function"
    ? loadMenuForRestaurant
    : (() => Promise.resolve());
  const loadFocusForRestaurantSafe = typeof loadFocusForRestaurant === "function"
    ? loadFocusForRestaurant
    : (() => Promise.resolve());
  const updateNotificationsDomSafe = typeof updateNotificationsDom === "function" ? updateNotificationsDom : (() => false);
  const loadNotificationsFromFirebaseSafe = typeof loadNotificationsFromFirebase === "function"
    ? loadNotificationsFromFirebase
    : (() => Promise.resolve());
  const normalizeLeadScope = typeof normalizeLeadScopeKey === "function" ? normalizeLeadScopeKey : ((value) => value);
  const loadLeadsSafe = typeof loadLeads === "function" ? loadLeads : (() => Promise.resolve());
  const normalizeCustomerScope = typeof normalizeCustomerScopeKey === "function" ? normalizeCustomerScopeKey : ((value) => value);
  const loadCustomersSafe = typeof loadCustomers === "function" ? loadCustomers : (() => Promise.resolve());
  const loadCeoStaffSafe = typeof loadCeoStaff === "function" ? loadCeoStaff : (() => Promise.resolve());
  const stopRestaurants = typeof stopRestaurantsListener === "function" ? stopRestaurantsListener : (() => {});
  const startChatThreads = typeof startChatThreadsListener === "function" ? startChatThreadsListener : (() => {});
  const stopChatThreads = typeof stopChatThreadsListener === "function" ? stopChatThreadsListener : (() => {});
  const startOrders = typeof startOrdersListener === "function" ? startOrdersListener : (() => {});
  const stopOrders = typeof stopOrdersListener === "function" ? stopOrdersListener : (() => {});
  const stopRestaurantMeta = typeof stopRestaurantMetaListeners === "function" ? stopRestaurantMetaListeners : (() => {});

  const safeTab = sanitizeTabForSession(tab, { hasProfileView: !!state.profileView });
  if (safeTab !== state.activeTab) {
    state.activeTab = safeTab;
    render();
  }
  tab = safeTab;
  const hasUser = !!state.user;
  stopRestaurants();
  if (hasUser && tab === "chat") {
    startChatThreads(state.user);
  } else {
    stopChatThreads();
  }
  if (hasUser && tab === "orders") {
    startOrders(state.user);
  } else {
    stopOrders();
  }
  if (tab !== "feed") {
    stopRestaurantMeta();
    const feedUnsub = getFeedUnsub();
    if (feedUnsub) {
      feedUnsub();
      setFeedUnsub(null);
    }
    const storiesUnsub = getStoriesUnsub();
    if (storiesUnsub) {
      storiesUnsub();
      setStoriesUnsub(null);
    }
  }
  if (tab !== "feed" && getFeedDeltaTimer()) {
    clearIntervalSafe(getFeedDeltaTimer());
    setFeedDeltaTimer(null);
  }

  if (hasUser && (tab === "leads" || tab === "staff" || tab === "customers") && isCeo()) {
    queueCeoPrefetch();
  }

  if (tab === "feed" && !dataLoaded.feed) {
    dataLoaded.feed = true;
    dataLoaded.stories = true;
    void loadFeed();
  }

  const needsRestaurants = tab === "map" || tab === "search" || tab === "orders" || (!FAST_MODE && tab === "feed");
  if (needsRestaurants && !dataLoaded.restaurants) {
    dataLoaded.restaurants = true;
    scheduleIdleSafe(() => {
      loadRestaurantsSafe().catch((err) => console.error(err));
    });
  }

  if (hasUser && tab === "profile" && !dataLoaded.profile) {
    dataLoaded.profile = true;
    const hasBusinessProfile = isBusinessProfile(state.userProfile);
    if (!hasBusinessProfile) {
      void loadUserPostsSafe();
    }
    if (hasBusinessProfile) {
      void loadBusinessPostsSafe();
    }
  }
  if (hasUser && tab === "profile") {
    void loadAuthProfileSafe(state.user);
  }

  if (hasUser && tab === "menu") {
    void loadAuthProfileSafe(state.user).then(() => {
      const restaurantId = state.userProfile.restaurantId || "";
      if (restaurantId) {
        void loadMenuForRestaurantSafe(restaurantId, { source: "hybrid" });
        void loadFocusForRestaurantSafe(restaurantId);
      }
    });
  }

  if (hasUser && tab === "notifications" && !dataLoaded.notifications) {
    dataLoaded.notifications = true;
    if (notificationsUnsub && Array.isArray(state.notifications) && state.notifications.length) {
      const updated = updateNotificationsDomSafe();
      if (!updated && state.activeTab === "notifications") {
        render();
      }
    } else {
      void loadNotificationsFromFirebaseSafe({ force: true });
    }
  }

  if (hasUser && tab === "leads" && !dataLoaded.leads) {
    dataLoaded.leads = true;
    if (isCeo()) {
      void loadLeadsSafe({ scope: state.leads.scope });
    }
  } else if (hasUser && tab === "leads" && isCeo() && !state.leads.loaded?.[normalizeLeadScope(state.leads.scope)]) {
    void loadLeadsSafe({ scope: state.leads.scope });
  }

  if (hasUser && tab === "customers" && !dataLoaded.customers) {
    dataLoaded.customers = true;
    if (isCeo()) {
      void loadCustomersSafe({ scope: state.customers.scope });
    }
  } else if (hasUser && tab === "customers" && isCeo() && !state.customers.loaded?.[normalizeCustomerScope(state.customers.scope)]) {
    void loadCustomersSafe({ scope: state.customers.scope });
  }

  if (hasUser && tab === "staff" && !dataLoaded.staff) {
    dataLoaded.staff = true;
    if (isCeo()) {
      void loadCeoStaffSafe().catch(() => {});
    }
  }
}

export async function loadAuthProfileCore({
  user,
  force = false,
  state,
  normalizeRoleList,
  isRestaurantMarkedDeleted,
  resolveRestaurantForAuthUser,
  resolveLeadByUid,
  findRestaurantByLeadId,
  ensureRestaurantForLead,
  resolveLeadByEmail,
  getDoc,
  doc,
  db,
  serverTimestamp,
  setDoc,
  loadBusinessProfile,
  loadUserProfile
} = {}) {
  if (!user || !state) return;
  const normalizeRoles = typeof normalizeRoleList === "function" ? normalizeRoleList : (() => []);
  const isRestaurantDeleted = typeof isRestaurantMarkedDeleted === "function" ? isRestaurantMarkedDeleted : (() => false);
  if (
    typeof resolveRestaurantForAuthUser !== "function"
    || typeof resolveLeadByUid !== "function"
    || typeof findRestaurantByLeadId !== "function"
    || typeof ensureRestaurantForLead !== "function"
    || typeof resolveLeadByEmail !== "function"
    || typeof getDoc !== "function"
    || typeof doc !== "function"
    || !db
    || typeof serverTimestamp !== "function"
    || typeof setDoc !== "function"
    || typeof loadBusinessProfile !== "function"
    || typeof loadUserProfile !== "function"
  ) {
    return;
  }
  const normalizeAuthRestaurant = (candidate) => (
    candidate && !isRestaurantDeleted(candidate) ? candidate : null
  );
  const profileHint = state.userProfile || {};
  const hintRoles = normalizeRoles(profileHint.roles || profileHint.role || "");
  const hintRoleKey = String(profileHint.role || "").toLowerCase();
  const hasStoredProfileHint = (
    hintRoles.length > 0
    || !!String(profileHint.name || "").trim()
    || !!String(profileHint.handle || "").trim()
    || !!String(profileHint.ceoParentUid || profileHint.ceoRootUid || "").trim()
    || !!String(profileHint.restaurantId || "").trim()
    || hintRoleKey !== "user"
  );
  const hasBusinessHint = !!String(profileHint.restaurantId || "").trim() || hintRoleKey === "business" || hintRoles.includes("owner");
  const hasTrustedNonBusinessHint = hasStoredProfileHint && !hasBusinessHint && (
    hintRoleKey === "ceo"
    || hintRoleKey === "staff"
    || hintRoleKey === "user"
    || hintRoles.includes("ceo")
    || hintRoles.includes("staff")
  );
  if (hasTrustedNonBusinessHint && !force) {
    const profile = await loadUserProfile(user, { force });
    const normalizedRoles = normalizeRoles(profile?.roles || profile?.role || "");
    const normalizedRoleKey = String(profile?.role || "").toLowerCase();
    const hasBusinessProfile = !!String(profile?.restaurantId || "").trim() || normalizedRoleKey === "business" || normalizedRoles.includes("owner");
    if (!hasBusinessProfile) return;
  }
  let rest = normalizeAuthRestaurant(await resolveRestaurantForAuthUser(user, { preferCached: !force }));
  if (!rest && user?.uid) {
    const leadByUid = await resolveLeadByUid(user.uid);
    if (leadByUid) {
      rest = normalizeAuthRestaurant(
        findRestaurantByLeadId(leadByUid.id) || await ensureRestaurantForLead(leadByUid, user)
      );
    }
  }
  if (!rest && user?.email) {
    const lead = await resolveLeadByEmail(user.email);
    if (lead) {
      rest = normalizeAuthRestaurant(
        findRestaurantByLeadId(lead.id) || await ensureRestaurantForLead(lead, user)
      );
    }
  }
  if (!rest) {
    try {
      const legacySnap = await getDoc(doc(db, "users", user.uid));
      if (legacySnap.exists()) {
        const legacy = legacySnap.data() || {};
        const roleKey = String(legacy.role || "").toLowerCase();
        const restId = legacy.restaurantId || "";
        if ((roleKey === "business" || restId) && restId) {
          const restSnap = await getDoc(doc(db, "restaurants", restId));
          if (restSnap.exists()) {
            const restData = restSnap.data() || {};
            const patch = {};
            const legacyEmail = legacy.email || user.email || "";
            if (!restData.ownerUid) patch.ownerUid = user.uid;
            if (legacyEmail && !restData.ownerEmail) patch.ownerEmail = legacyEmail;
            const legacyName = legacy.displayName || legacy.name || "";
            if (legacyName && !(restData.name || restData.restaurantName)) {
              patch.name = legacyName;
              patch.restaurantName = legacyName;
            }
            const legacyAvatar = legacy.avatarUrl || legacy.avatar || "";
            if (legacyAvatar && !(restData.logoUrl || restData.logo)) {
              patch.logoUrl = legacyAvatar;
              patch.logo = legacyAvatar;
            }
            if (legacy.city && !restData.city) patch.city = legacy.city;
            if (legacy.address && !restData.address) patch.address = legacy.address;
            if (legacy.phone && !restData.phone) patch.phone = legacy.phone;
            if (legacy.instagram && !restData.instagram) {
              patch.instagram = legacy.instagram;
              patch.insta = legacy.instagram;
            }
            if (Object.keys(patch).length) {
              patch.updatedAt = serverTimestamp();
              await setDoc(doc(db, "restaurants", restId), patch, { merge: true });
            }
            const candidate = { id: restSnap.id, ...restData, ...patch };
            rest = normalizeAuthRestaurant(candidate);
          }
        }
      }
    } catch {}
  }
  if (rest && user?.uid) {
    const patch = {};
    const email = user.email || "";
    if (!rest.ownerUid) patch.ownerUid = user.uid;
    if (email && !rest.ownerEmail) patch.ownerEmail = email;
    if (Object.keys(patch).length && rest.id) {
      patch.updatedAt = serverTimestamp();
      await setDoc(doc(db, "restaurants", rest.id), patch, { merge: true });
      rest = { ...rest, ...patch };
    }
  }
  if (rest) {
    await loadBusinessProfile(user, { restaurant: rest, force });
    return;
  }
  await loadUserProfile(user, { force });
}
