function reportAuthFlowWarning(scope = "", err = null) {
  const safeScope = String(scope || "auth-flow").trim() || "auth-flow";
  if (err) {
    console.warn(`[mnyra][${safeScope}]`, err);
    return;
  }
  console.warn(`[mnyra][${safeScope}] operation failed`);
}

function runNonBlockingAuthTask(scope = "auth-flow", task = null) {
  try {
    const pending = typeof task === "function" ? task() : null;
    if (pending && typeof pending.then === "function") {
      pending.catch((err) => {
        reportAuthFlowWarning(scope, err);
      });
    }
  } catch (err) {
    reportAuthFlowWarning(scope, err);
  }
}

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
  getNotificationsUnsubFn,
  updateNotificationsDom,
  loadNotificationsFromFirebase,
  normalizeLeadScopeKey,
  loadLeads,
  normalizeCustomerScopeKey,
  loadCustomers,
  loadCeoStaff,
  loadBusinessAccounts
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
  const getNotificationsUnsub = typeof getNotificationsUnsubFn === "function"
    ? getNotificationsUnsubFn
    : (() => null);
  const updateNotificationsDomSafe = typeof updateNotificationsDom === "function" ? updateNotificationsDom : (() => false);
  const loadNotificationsFromFirebaseSafe = typeof loadNotificationsFromFirebase === "function"
    ? loadNotificationsFromFirebase
    : (() => Promise.resolve());
  const normalizeLeadScope = typeof normalizeLeadScopeKey === "function" ? normalizeLeadScopeKey : ((value) => value);
  const loadLeadsSafe = typeof loadLeads === "function" ? loadLeads : (() => Promise.resolve());
  const normalizeCustomerScope = typeof normalizeCustomerScopeKey === "function" ? normalizeCustomerScopeKey : ((value) => value);
  const loadCustomersSafe = typeof loadCustomers === "function" ? loadCustomers : (() => Promise.resolve());
  const loadCeoStaffSafe = typeof loadCeoStaff === "function" ? loadCeoStaff : (() => Promise.resolve());
  const loadBusinessAccountsSafe = typeof loadBusinessAccounts === "function" ? loadBusinessAccounts : (() => Promise.resolve());
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
  } else if (!hasUser) {
    stopChatThreads();
  }
  if (tab === "orders") {
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

  const activeUid = String(state.user?.uid || "").trim();
  const isLandingProfileSession = (
    tab === "profile"
    && String(state?.profileTopTab || "").trim().toLowerCase() === "landing"
  );
  const shouldSkipBootstrapAuthProfileLoad = (requestedTab = tab) => {
    const skipUid = String(state.__skipNextAuthProfileEnsureUid || "").trim();
    const skipTab = String(state.__skipNextAuthProfileEnsureTab || "").trim();
    if (!activeUid || skipUid !== activeUid || skipTab !== String(requestedTab || "").trim()) {
      return false;
    }
    state.__skipNextAuthProfileEnsureUid = "";
    state.__skipNextAuthProfileEnsureTab = "";
    return true;
  };
  const runAuthProfileLoad = () => {
    if (!activeUid) return Promise.resolve(null);
    if (shouldSkipBootstrapAuthProfileLoad(tab)) {
      return Promise.resolve(null);
    }
    const currentPromise = state.__authProfileLoadPromise;
    if (currentPromise && state.__authProfileLoadUid === activeUid) {
      return currentPromise;
    }
    const nextPromise = Promise.resolve(loadAuthProfileSafe(state.user)).finally(() => {
      if (state.__authProfileLoadPromise === nextPromise) {
        state.__authProfileLoadPromise = null;
        state.__authProfileLoadUid = "";
      }
    });
    state.__authProfileLoadPromise = nextPromise;
    state.__authProfileLoadUid = activeUid;
    return nextPromise;
  };
  const loadSelfProfilePosts = () => {
    const hasBusinessProfile = isBusinessProfile(state.userProfile);
    if (hasBusinessProfile) return loadBusinessPostsSafe();
    return loadUserPostsSafe();
  };

  const webDirectEntry = state.__webDirectEntry && typeof state.__webDirectEntry === "object"
    ? state.__webDirectEntry
    : {};
  const activeProfileTopTab = String(state.profileTopTab || "").trim().toLowerCase();
  const webDirectSurface = String(webDirectEntry.surface || "").trim().toLowerCase();
  const webDirectTopTab = String(webDirectEntry.topTab || "").trim().toLowerCase();
  const isPublicWebDirectMenuSession = (
    tab === "profile"
    && webDirectEntry.active === true
    && webDirectEntry.webPriority === true
    && activeProfileTopTab === "menu"
    && (webDirectSurface === "menu" || webDirectTopTab === "menu")
  );
  const shouldPrimeRestaurantTruth = !dataLoaded.restaurants
    && !isLandingProfileSession
    && !isPublicWebDirectMenuSession;
  if (shouldPrimeRestaurantTruth) {
    dataLoaded.restaurants = true;
    if (hasUser) {
      runNonBlockingAuthTask("auth-tab.restaurants.prime", () => loadRestaurantsSafe());
    } else {
      scheduleIdleSafe(() => {
        runNonBlockingAuthTask("auth-tab.restaurants.primeIdle", () => loadRestaurantsSafe());
      });
    }
  }

  if (hasUser && tab === "profile" && !isLandingProfileSession) {
    if (!dataLoaded.profile) {
      dataLoaded.profile = true;
    }
    void loadSelfProfilePosts();
    void runAuthProfileLoad()
      .then(() => {
        if (activeUid !== String(state.user?.uid || "").trim()) return;
        if (String(state.activeTab || "").trim().toLowerCase() !== "profile") return;
        return loadSelfProfilePosts();
      })
      .catch((err) => {
        reportAuthFlowWarning("auth-tab.profile.authProfileLoad", err);
      });
  }

  if (hasUser && tab === "menu") {
    void runAuthProfileLoad().then(() => {
      if (activeUid !== String(state.user?.uid || "").trim()) return;
      const restaurantId = state.userProfile.restaurantId || "";
      if (restaurantId) {
        void loadMenuForRestaurantSafe(restaurantId, { source: "collection" });
        void loadFocusForRestaurantSafe(restaurantId);
      }
    });
  }

  if (hasUser && tab === "notifications" && !dataLoaded.notifications) {
    dataLoaded.notifications = true;
    const notificationsUnsub = getNotificationsUnsub();
    if (typeof notificationsUnsub === "function" && Array.isArray(state.notifications) && state.notifications.length) {
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
      void loadCeoStaffSafe().catch((err) => {
        reportAuthFlowWarning("auth-tab.staff.loadCeoStaff", err);
      });
    }
  }

  if (hasUser && tab === "businessAccounts" && !dataLoaded.businessAccounts) {
    dataLoaded.businessAccounts = true;
    void runAuthProfileLoad()
      .then(() => loadBusinessAccountsSafe())
      .catch((err) => {
        reportAuthFlowWarning("auth-tab.businessAccounts.load", err);
      });
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
  loadBusinessStaffProfile,
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
    || typeof loadBusinessStaffProfile !== "function"
    || typeof loadUserProfile !== "function"
  ) {
    return;
  }
  const normalizeAuthRestaurant = (candidate) => (
    candidate && !isRestaurantDeleted(candidate) ? candidate : null
  );
  let authUserData = {};
  try {
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (userSnap.exists()) {
      authUserData = userSnap.data() || {};
    }
  } catch {}
  const authUserRole = String(authUserData?.role || "").trim().toLowerCase();
  const authPermissions = authUserData?.permissions && typeof authUserData.permissions === "object"
    ? authUserData.permissions
    : {};
  const isStaffAccount = authUserRole === "staff"
    || !!String(
      authUserData?.staffRestaurantId
      || authUserData?.waiterRestaurantId
      || authUserData?.businessOwnerUid
      || ""
    ).trim();
  const explicitRestaurantId = String(authUserData?.restaurantId || "").trim();
  const canFastPathNonBusiness = !isStaffAccount
    && !explicitRestaurantId
    && (authUserRole === "user" || authUserRole === "ceo");
  const getRestaurantById = async (restaurantId = "") => {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId) return null;
    try {
      const restSnap = await getDoc(doc(db, "restaurants", safeRestaurantId));
      if (restSnap.exists()) {
        return normalizeAuthRestaurant({ id: restSnap.id, ...(restSnap.data() || {}) });
      }
    } catch {}
    return null;
  };
  const syncBusinessUserBootstrap = (restaurant = {}) => {
    const safeRestaurantId = String(restaurant?.id || restaurant?.restaurantId || "").trim();
    const safeUid = String(user?.uid || "").trim();
    if (!safeUid || !safeRestaurantId) return;
    const restaurantStatus = String(restaurant?.status || "").trim().toLowerCase();
    const bootstrapStatus = (
      restaurantStatus === "active"
      || restaurantStatus === "kunde"
      || restaurantStatus === "customer"
    )
      ? "active"
      : (
        restaurantStatus === "disabled"
        || restaurantStatus === "deleted"
        ? "disabled"
        : (
          restaurantStatus === "blocked"
            ? "blocked"
            : (
              restaurantStatus === "pending"
              || restaurantStatus === "registered"
              || restaurantStatus === "lead"
                ? "pending"
                : ""
            )
        )
      );
    const payload = {
      uid: safeUid,
      role: "business",
      restaurantId: safeRestaurantId,
      businessName: String(restaurant.name || restaurant.restaurantName || "").trim(),
      displayName: String(restaurant.ownerName || restaurant.name || restaurant.restaurantName || user.displayName || user.email || "").trim(),
      name: String(restaurant.ownerName || restaurant.name || restaurant.restaurantName || user.displayName || user.email || "").trim(),
      email: String(user.email || restaurant.ownerEmail || restaurant.email || "").trim(),
      logoUrl: String(restaurant.logoUrl || restaurant.logo || "").trim(),
      avatarUrl: String(restaurant.logoUrl || restaurant.logo || user.photoURL || "").trim(),
      publicSlug: String(restaurant.publicSlug || "").trim(),
      landingSlug: String(restaurant.landingSlug || "").trim(),
      updatedAt: serverTimestamp()
    };
    if (bootstrapStatus) payload.status = bootstrapStatus;
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") delete payload[key];
    });
    runNonBlockingAuthTask(
      "auth-profile.userBootstrap.patch",
      () => setDoc(doc(db, "users", safeUid), payload, { merge: true })
    );
  };
  if (canFastPathNonBusiness && !force) {
    const profile = await loadUserProfile(user, { force: false });
    if (profile && state?.userProfile) {
      if (!String(state.userProfile.sourceUserRole || "").trim()) {
        state.userProfile.sourceUserRole = authUserRole;
      }
      if (!String(state.userProfile.role || "").trim()) {
        state.userProfile.role = authUserRole;
      }
      const normalizedProfileRoles = normalizeRoles(state.userProfile.roles || state.userProfile.role || "");
      if (authUserRole === "ceo" && !normalizedProfileRoles.includes("ceo")) {
        state.userProfile.roles = Array.from(new Set([...normalizedProfileRoles, "ceo"]));
      } else if (!Array.isArray(state.userProfile.roles)) {
        state.userProfile.roles = normalizedProfileRoles;
      }
    }
    return;
  }
  if (!isStaffAccount && (authUserRole === "business" || explicitRestaurantId)) {
    let explicitRestaurant = await getRestaurantById(explicitRestaurantId);
    if (!explicitRestaurant) {
      explicitRestaurant = normalizeAuthRestaurant(await resolveRestaurantForAuthUser(user, { preferCached: !force }));
    }
    if (explicitRestaurant) {
      const ownerPatch = {};
      if (!String(explicitRestaurant.ownerUid || "").trim() && user?.uid) ownerPatch.ownerUid = user.uid;
      if (!String(explicitRestaurant.ownerEmail || "").trim() && user?.email) ownerPatch.ownerEmail = user.email;
      if (Object.keys(ownerPatch).length && explicitRestaurant.id) {
        ownerPatch.updatedAt = serverTimestamp();
        runNonBlockingAuthTask(
          "auth-profile.ownerRestaurant.patch",
          () => setDoc(doc(db, "restaurants", explicitRestaurant.id), ownerPatch, { merge: true })
        );
        explicitRestaurant = { ...explicitRestaurant, ...ownerPatch };
      }
      await loadBusinessProfile(user, { restaurant: explicitRestaurant, force });
      syncBusinessUserBootstrap(explicitRestaurant);
      return;
    }
  }
  if (isStaffAccount) {
    const staffRestaurantId = String(
      authUserData?.staffRestaurantId
      || authUserData?.waiterRestaurantId
      || authUserData?.restaurantId
      || ""
    ).trim();
    let mergedStaffData = {
      ...authUserData,
      sourceUserRole: "staff",
      role: "staff",
      staffRestaurantId,
      waiterRestaurantId: String(authUserData?.waiterRestaurantId || staffRestaurantId).trim()
    };
    if (staffRestaurantId) {
      try {
        const staffSnap = await getDoc(doc(db, "restaurants", staffRestaurantId, "staff", user.uid));
        if (staffSnap.exists()) {
          const staffData = staffSnap.data() || {};
          const mergedPermissions = {
            ...(authPermissions || {}),
            ...((staffData?.permissions && typeof staffData.permissions === "object") ? staffData.permissions : {})
          };
          mergedStaffData = {
            ...mergedStaffData,
            ...staffData,
            permissions: mergedPermissions,
            sourceUserRole: "staff",
            role: "staff",
            staffRestaurantId,
            waiterRestaurantId: String(
              staffData?.waiterRestaurantId
              || authUserData?.waiterRestaurantId
              || staffRestaurantId
            ).trim()
          };
        }
      } catch {}
    }
    const staffPermissions = mergedStaffData?.permissions && typeof mergedStaffData.permissions === "object"
      ? mergedStaffData.permissions
      : {};
    const staffBusinessAccess = mergedStaffData?.businessAccess === true || staffPermissions.businessAccess === true;
    const staffWaiterAccess = mergedStaffData?.waiterAccess === true || staffPermissions.waiterAccess === true;
    const staffStatusKey = String(mergedStaffData?.staffStatus || mergedStaffData?.status || "").trim().toLowerCase();
    const staffActive = mergedStaffData?.staffActive === false
      ? false
      : (mergedStaffData?.active === false ? false : staffStatusKey !== "disabled");

    if (staffActive && staffBusinessAccess && staffRestaurantId) {
      const staffRestaurant = await getRestaurantById(staffRestaurantId);
      if (staffRestaurant) {
        await loadBusinessStaffProfile(user, {
          restaurant: staffRestaurant,
          staffData: {
            ...mergedStaffData,
            businessAccess: staffBusinessAccess,
            waiterAccess: staffWaiterAccess,
            staffActive,
            staffStatus: staffStatusKey || "active"
          },
          force
        });
        return;
      }
    }

    const profile = await loadUserProfile(user, { force });
    if (profile && state?.userProfile) {
      if (!staffActive) {
        state.userProfile.socialAccessMode = "blocked";
        state.userProfile.socialAccessMessage = "Dieser Staff-Account ist deaktiviert.";
        return;
      }
      if (staffBusinessAccess && !staffRestaurantId) {
        state.userProfile.socialAccessMode = "blocked";
        state.userProfile.socialAccessMessage = "Diesem Staff-Account fehlt die Restaurant-Zuordnung fuer Menyra Social.";
        return;
      }
      if (staffBusinessAccess) {
        state.userProfile.socialAccessMode = "blocked";
        state.userProfile.socialAccessMessage = "Der Business-Zugang dieses Staff-Accounts konnte nicht geladen werden.";
        return;
      }
      if (staffWaiterAccess && !staffBusinessAccess) {
        state.userProfile.socialAccessMode = "waiterOnly";
        state.userProfile.socialAccessMessage = "Dieser Staff-Account ist nur fuer die Waiter-App freigegeben.";
        return;
      }
      if (!staffBusinessAccess) {
        state.userProfile.socialAccessMode = "blocked";
        state.userProfile.socialAccessMessage = "Dieser Staff-Account hat keinen Menyra-Social-Zugriff.";
        return;
      }
    }
    return;
  }
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
  const matchesOwnerIdentity = (restaurant = {}) => {
    if (!restaurant || isRestaurantDeleted(restaurant)) return false;
    const uid = String(user?.uid || "").trim();
    const email = String(user?.email || "").trim().toLowerCase();
    const ownerUidFields = [
      restaurant.ownerUid,
      restaurant.socialUid,
      restaurant.uid,
      restaurant.userUid,
      restaurant.accountUid
    ];
    const ownerEmailFields = [
      restaurant.ownerEmail,
      restaurant.email,
      restaurant.contactEmail,
      restaurant.socialEmail,
      restaurant.loginEmail,
      restaurant.accountEmail
    ];
    const uidMatch = !!uid && ownerUidFields.some((value) => String(value || "").trim() === uid);
    const emailMatch = !!email && ownerEmailFields.some((value) => String(value || "").trim().toLowerCase() === email);
    return uidMatch || emailMatch;
  };
  const resolveBusinessRestaurant = async ({ preferCached = true, includeFallback = true } = {}) => {
    let rest = normalizeAuthRestaurant(await resolveRestaurantForAuthUser(user, { preferCached }));
    if (!rest && includeFallback && user?.uid) {
      const leadByUid = await resolveLeadByUid(user.uid);
      if (leadByUid) {
        rest = normalizeAuthRestaurant(
          findRestaurantByLeadId(leadByUid.id) || await ensureRestaurantForLead(leadByUid, user)
        );
      }
    }
    if (!rest && includeFallback && user?.email) {
      const lead = await resolveLeadByEmail(user.email);
      if (lead) {
        rest = normalizeAuthRestaurant(
          findRestaurantByLeadId(lead.id) || await ensureRestaurantForLead(lead, user)
        );
      }
    }
    if (!rest && includeFallback) {
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
                runNonBlockingAuthTask(
                  "auth-profile.resolveBusinessRestaurant.legacyPatch",
                  () => setDoc(doc(db, "restaurants", restId), patch, { merge: true })
                );
              }
              const candidate = { id: restSnap.id, ...restData, ...patch };
              rest = normalizeAuthRestaurant(candidate);
            }
          }
        }
      } catch (err) {
        reportAuthFlowWarning("auth-profile.resolveBusinessRestaurant.legacyFallback", err);
      }
    }
    if (rest && user?.uid) {
      const patch = {};
      const email = user.email || "";
      if (!rest.ownerUid) patch.ownerUid = user.uid;
      if (email && !rest.ownerEmail) patch.ownerEmail = email;
      if (Object.keys(patch).length && rest.id) {
        patch.updatedAt = serverTimestamp();
        runNonBlockingAuthTask(
          "auth-profile.resolveBusinessRestaurant.ownerPatch",
          () => setDoc(doc(db, "restaurants", rest.id), patch, { merge: true })
        );
        rest = { ...rest, ...patch };
      }
    }
    return rest || null;
  };
  const scheduleBackgroundBusinessReconcile = () => {
    const reconcileUid = String(user?.uid || "").trim();
    if (!reconcileUid) return;
    if (state.__authBusinessReconcilePending && state.__authBusinessReconcileUid === reconcileUid) return;
    state.__authBusinessReconcilePending = true;
    state.__authBusinessReconcileUid = reconcileUid;
    const defer = typeof queueMicrotask === "function"
      ? queueMicrotask
      : (fn) => Promise.resolve().then(fn);
    defer(() => {
      Promise.resolve(resolveBusinessRestaurant({ preferCached: false, includeFallback: true }))
        .then(async (resolved) => {
          if (!resolved) return;
          if (String(state.user?.uid || "").trim() !== reconcileUid) return;
          await loadBusinessProfile(user, { restaurant: resolved, force: true });
          syncBusinessUserBootstrap(resolved);
        })
        .catch((err) => {
          reportAuthFlowWarning("auth-profile.backgroundBusinessReconcile", err);
        })
        .finally(() => {
          if (state.__authBusinessReconcileUid === reconcileUid) {
            state.__authBusinessReconcilePending = false;
          }
        });
    });
  };
  if (hasTrustedNonBusinessHint && !force) {
    const profile = await loadUserProfile(user, { force });
    const normalizedRoles = normalizeRoles(profile?.roles || profile?.role || "");
    const normalizedRoleKey = String(profile?.role || "").toLowerCase();
    const hasBusinessProfile = !!String(profile?.restaurantId || "").trim() || normalizedRoleKey === "business" || normalizedRoles.includes("owner");
    if (!hasBusinessProfile) {
      const cachedOwned = Array.isArray(state.restaurants)
        ? state.restaurants.find((row) => matchesOwnerIdentity(row))
        : null;
      if (cachedOwned) {
        await loadBusinessProfile(user, { restaurant: cachedOwned, force: true });
        syncBusinessUserBootstrap(cachedOwned);
        return;
      }
      const quickRest = await resolveBusinessRestaurant({ preferCached: true, includeFallback: false });
      if (quickRest) {
        await loadBusinessProfile(user, { restaurant: quickRest, force: true });
        syncBusinessUserBootstrap(quickRest);
        return;
      }
      scheduleBackgroundBusinessReconcile();
      return;
    }
  }
  const rest = await resolveBusinessRestaurant({ preferCached: !force, includeFallback: true });
  if (rest) {
    await loadBusinessProfile(user, { restaurant: rest, force });
    syncBusinessUserBootstrap(rest);
    return;
  }
  await loadUserProfile(user, { force });
}
