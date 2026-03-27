export function bindAppShellEventsCore({
  documentObj,
  state,
  setStateFn,
  signOutFn,
  auth,
  clearAuthBootstrapSnapshotFn,
  safeStorageObj,
  profileKeyFn,
  avatarKeyFn,
  notificationsKeyFn,
  pushSeenKeyFn,
  pushTokenMetaKeyFn,
  followingKeyFn,
  chatIndexKeyFn,
  storageKeys = {},
  resetUserScopedStateFn,
  cleanupLeafletFn,
  openGuestAuthPromptFn,
  normalizeAuthModeFn,
  renderFn,
  ensureMenuDataForProfileFn,
  ensureFocusDataForProfileFn,
  openProfileViewFromBusinessFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return;
  const setState = typeof setStateFn === "function" ? setStateFn : (() => {});
  const signOut = typeof signOutFn === "function" ? signOutFn : (async () => {});
  const clearAuthBootstrapSnapshot = typeof clearAuthBootstrapSnapshotFn === "function"
    ? clearAuthBootstrapSnapshotFn
    : (() => {});
  const safeStorage = safeStorageObj || null;
  const profileKey = typeof profileKeyFn === "function" ? profileKeyFn : (() => "");
  const avatarKey = typeof avatarKeyFn === "function" ? avatarKeyFn : (() => "");
  const notificationsKey = typeof notificationsKeyFn === "function" ? notificationsKeyFn : (() => "");
  const pushSeenKey = typeof pushSeenKeyFn === "function" ? pushSeenKeyFn : (() => "");
  const pushTokenMetaKey = typeof pushTokenMetaKeyFn === "function" ? pushTokenMetaKeyFn : (() => "");
  const followingKey = typeof followingKeyFn === "function" ? followingKeyFn : (() => "");
  const chatIndexKey = typeof chatIndexKeyFn === "function" ? chatIndexKeyFn : (() => "");
  const resetUserScopedState = typeof resetUserScopedStateFn === "function"
    ? resetUserScopedStateFn
    : (() => {});
  const cleanupLeaflet = typeof cleanupLeafletFn === "function"
    ? cleanupLeafletFn
    : (() => {});
  const openGuestAuthPrompt = typeof openGuestAuthPromptFn === "function"
    ? openGuestAuthPromptFn
    : (() => {});
  const normalizeAuthMode = typeof normalizeAuthModeFn === "function"
    ? normalizeAuthModeFn
    : ((mode) => String(mode || "").trim());
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const ensureMenuDataForProfile = typeof ensureMenuDataForProfileFn === "function"
    ? ensureMenuDataForProfileFn
    : (() => {});
  const ensureFocusDataForProfile = typeof ensureFocusDataForProfileFn === "function"
    ? ensureFocusDataForProfileFn
    : (() => {});
  const openProfileViewFromBusiness = typeof openProfileViewFromBusinessFn === "function"
    ? openProfileViewFromBusinessFn
    : null;
  const getActiveProfile = () => state.profileView?.profile || state.userProfile || {};
  const isBusinessProfile = (profile = getActiveProfile()) => {
    const restaurantId = String(profile?.restaurantId || "").trim();
    if (restaurantId) return true;
    return String(profile?.role || "").trim().toLowerCase() === "business";
  };
  const isBusinessProfileView = () => state.activeTab === "profile" && isBusinessProfile();
  const normalizeBusinessMenuCategory = (value = "") => String(value || "").trim().toLowerCase();
  const getRenderedProfileContentTab = (profile = getActiveProfile()) => {
    const requestedTopTab = String(state.profileTopTab || "").trim().toLowerCase();
    const requestedContentTab = String(state.profileContentTab || "").trim().toLowerCase();
    if (isBusinessProfile(profile)) {
      if (requestedTopTab === "menu") return "menu";
      if (requestedContentTab === "media" || requestedContentTab === "menu" || requestedContentTab === "posts") {
        return requestedContentTab;
      }
      return "posts";
    }
    if (requestedContentTab === "media" || requestedContentTab === "checkins") {
      return requestedContentTab;
    }
    return "posts";
  };
  const getRenderedProfilePrimaryTopTab = (profile = getActiveProfile()) => {
    const requestedTopTab = String(state.profileTopTab || "").trim().toLowerCase();
    if (isBusinessProfile(profile)) {
      if (requestedTopTab === "cart" || requestedTopTab === "favorites") {
        return requestedTopTab;
      }
      return "profile";
    }
    if (requestedTopTab === "favorites" && String(state.user?.uid || "").trim()) {
      return "favorites";
    }
    return "profile";
  };
  const scrollWindowToTop = (smooth = false) => {
    if (!doc?.defaultView?.scrollTo) return;
    if (!smooth) {
      doc.defaultView.scrollTo(0, 0);
      return;
    }
    try {
      doc.defaultView.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      doc.defaultView.scrollTo(0, 0);
    }
  };
  const scrollWindowToTopForRender = () => {
    // Full re-renders race with smooth scrolling and can restore the old Y offset.
    scrollWindowToTop(false);
  };
  const getStoredBusinessMenuCategory = () => normalizeBusinessMenuCategory(doc?.documentElement?.dataset?.businessMenuCategory || "");
  const setStoredBusinessMenuCategory = (nextCategory = "") => {
    if (!doc?.documentElement?.dataset) return;
    const normalized = normalizeBusinessMenuCategory(nextCategory);
    if (normalized) {
      doc.documentElement.dataset.businessMenuCategory = normalized;
      return;
    }
    delete doc.documentElement.dataset.businessMenuCategory;
  };
  const resolveBusinessMenuCategoryBaseClass = () => {
    const viewportWidth = Math.max(
      0,
      Number(doc?.defaultView?.innerWidth || doc?.documentElement?.clientWidth || 0)
    );
    const isCompact = viewportWidth > 0 && viewportWidth <= 390;
    return isCompact
      ? "shrink-0 min-w-0 max-w-[7.5rem] h-7 box-border px-2.5 inline-flex items-center justify-center overflow-hidden rounded-full border text-[9px] font-black leading-none transition-all duration-300"
      : "shrink-0 min-w-0 max-w-[8.5rem] h-8 box-border px-3 inline-flex items-center justify-center overflow-hidden rounded-full border text-[10px] font-black leading-none transition-all duration-300";
  };
  const businessMenuCategoryActiveClass = "bg-slate-900 text-white border-slate-900 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.55)]";
  const businessMenuCategoryInactiveClass = "bg-white/80 text-slate-500 border-slate-200";
  const getVisibleBusinessMenuCategory = () => {
    const buttons = Array.from(doc.querySelectorAll("[data-business-menu-category]"));
    if (!buttons.length) return "";
    const available = new Set(
      buttons
        .map((button) => normalizeBusinessMenuCategory(button.dataset.businessMenuCategory || ""))
        .filter(Boolean)
    );
    const headerTop = doc.getElementById("smart-header-top");
    const headerHeight = Math.max(0, Math.round(headerTop?.getBoundingClientRect?.().height || 0));
    const anchors = Array.from(doc.querySelectorAll("[data-menu-category-anchor]"));
    let currentCategory = "";
    let currentTop = Number.NEGATIVE_INFINITY;
    anchors.forEach((anchor) => {
      const category = normalizeBusinessMenuCategory(anchor.getAttribute("data-menu-category-anchor") || "");
      if (!category || !available.has(category)) return;
      const top = Math.round(anchor.getBoundingClientRect().top - headerHeight);
      if (top <= 24 && top > currentTop) {
        currentTop = top;
        currentCategory = category;
      }
    });
    if (currentCategory) return currentCategory;
    const firstAhead = anchors.find((anchor) => {
      const category = normalizeBusinessMenuCategory(anchor.getAttribute("data-menu-category-anchor") || "");
      if (!category || !available.has(category)) return false;
      const top = Math.round(anchor.getBoundingClientRect().top - headerHeight);
      return top > 24;
    });
    if (firstAhead) {
      return normalizeBusinessMenuCategory(firstAhead.getAttribute("data-menu-category-anchor") || "");
    }
    return "";
  };

  const syncBusinessMenuCategoryUi = (nextCategory = "") => {
    const buttons = Array.from(doc.querySelectorAll("[data-business-menu-category]"));
    if (!buttons.length) return;
    const businessMenuCategoryBaseClass = resolveBusinessMenuCategoryBaseClass();
    const available = new Set(
      buttons
        .map((button) => normalizeBusinessMenuCategory(button.dataset.businessMenuCategory || ""))
        .filter(Boolean)
    );
    const fallbackCategory = buttons[0]?.dataset?.businessMenuCategory || "";
    const explicitCategory = normalizeBusinessMenuCategory(nextCategory);
    const storedCategory = getStoredBusinessMenuCategory();
    const visibleCategory = getVisibleBusinessMenuCategory();
    const activeCategory = explicitCategory
      || (storedCategory && available.has(storedCategory) ? storedCategory : "")
      || (visibleCategory && available.has(visibleCategory) ? visibleCategory : "")
      || normalizeBusinessMenuCategory(fallbackCategory);
    setStoredBusinessMenuCategory(activeCategory);
    buttons.forEach((button) => {
      const category = normalizeBusinessMenuCategory(button.dataset.businessMenuCategory || "");
      const isActive = !!activeCategory && category === activeCategory;
      button.className = `${businessMenuCategoryBaseClass} ${isActive ? businessMenuCategoryActiveClass : businessMenuCategoryInactiveClass}${button.disabled ? " opacity-50 cursor-default" : " active:scale-[0.97]"}`;
    });
  };

  const scrollBusinessMenuToCategory = (category = "") => {
    const targetCategory = String(category || "").trim().toLowerCase();
    if (!targetCategory) return;
    const target = doc.querySelector(`[data-menu-category-anchor="${targetCategory}"]`)
      || doc.querySelector(`[data-menu-type-block="${targetCategory}"]`)
      || doc.querySelector(`[data-menu-type="${targetCategory}"]`);
    if (!(target instanceof HTMLElement) || !doc.defaultView?.scrollTo) return;
    const headerTop = doc.getElementById("smart-header-top");
    const headerHeight = Math.max(0, Math.round(headerTop?.getBoundingClientRect?.().height || 0));
    const targetTop = target.getBoundingClientRect().top + Math.max(0, Number(doc.defaultView.scrollY || 0));
    const nextTop = Math.max(0, Math.round(targetTop - headerHeight - 18));
    try {
      doc.defaultView.scrollTo({ top: nextTop, behavior: "smooth" });
    } catch {
      doc.defaultView.scrollTo(0, nextTop);
    }
  };

  const drawerToggle = doc.getElementById("drawerToggle");
  const drawerOverlay = doc.getElementById("drawerOverlay");
  const drawerClose = doc.getElementById("drawerClose");
  const logoutBtn = doc.getElementById("logoutBtn");
  const settingsLogout = doc.getElementById("settingsLogout");

  if (drawerToggle) drawerToggle.addEventListener("click", () => setState({ drawerOpen: true }));
  if (drawerOverlay) drawerOverlay.addEventListener("click", () => setState({ drawerOpen: false }));
  if (drawerClose) drawerClose.addEventListener("click", () => setState({ drawerOpen: false }));

  [logoutBtn, settingsLogout].forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", async () => {
        await signOut(auth);
        clearAuthBootstrapSnapshot();
        if (state.user?.uid) {
          safeStorage?.removeItem?.(profileKey(state.user.uid));
          safeStorage?.removeItem?.(avatarKey(state.user.uid));
          safeStorage?.removeItem?.(notificationsKey(state.user.uid));
          safeStorage?.removeItem?.(pushSeenKey(state.user.uid));
          safeStorage?.removeItem?.(pushTokenMetaKey(state.user.uid));
          safeStorage?.removeItem?.(followingKey(state.user.uid));
          safeStorage?.removeItem?.(chatIndexKey(state.user.uid));
        }
        safeStorage?.removeItem?.(storageKeys.postMeta);
        resetUserScopedState();
        cleanupLeaflet();
        setState({ activeTab: "feed", drawerOpen: false });
      });
    }
  });

  doc.querySelectorAll("[data-nav]").forEach((btn) => {
    if (btn.closest("#feedView")) return;
    btn.addEventListener("click", () => {
      const tab = btn.dataset.nav;
      if (!tab) return;
      if (tab === "favorites" && !String(state.user?.uid || "").trim()) {
        openGuestAuthPrompt("Bitte registrieren oder einloggen, um Favoriten zu nutzen.");
        return;
      }
      const uploadIntent = tab === "upload"
        ? String(btn.dataset.uploadIntent || "feed").trim().toLowerCase()
        : "";
      const nextUploadMode = uploadIntent === "chooser"
        ? "chooser"
        : (uploadIntent === "story" ? "story" : "feed");
      const uploadPatch = tab === "upload"
        ? {
            upload: nextUploadMode === "chooser"
              ? { preview: "", caption: "", file: null, status: "", mode: "chooser" }
              : {
                  ...(state.upload && typeof state.upload === "object" ? state.upload : {}),
                  status: "",
                  mode: nextUploadMode
                }
          }
        : {};
      const activeTab = tab === "favorites" ? "profile" : tab;
      const nextProfileTopTab = tab === "favorites"
        ? "favorites"
        : (tab === "profile" ? "profile" : state.profileTopTab);
      setState({
        activeTab,
        profileTopTab: nextProfileTopTab,
        drawerOpen: false,
        chatSettingsOpen: false,
        chatListScope: "inbox",
        chatThreadMenuId: "",
        settingsView: "main",
        selectedBusiness: null,
        profileView: null,
        profileModal: { open: false, profile: null },
        postModal: { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false },
        likesModal: { open: false, postId: "", animate: false },
        leadModal: { open: false, mode: "create", lead: null, status: "", loading: false, deleting: false, actionsOpen: false, logoFile: null, logoPreview: "", coords: null, locations: [] },
        customerModal: { open: false, mode: "edit", customer: null, status: "", loading: false, logoFile: null, logoPreview: "" },
        ...uploadPatch
      });
    });
  });

  doc.querySelectorAll("[data-auth-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.drawerOpen = false;
      state.auth.mode = normalizeAuthMode(state.auth.mode) || "login";
      state.auth.error = "";
      state.auth.open = true;
      render();
    });
  });

  doc.querySelectorAll("[data-profile-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const profile = getActiveProfile();
      const tab = String(btn.dataset.profileTab || "").trim().toLowerCase();
      if (!tab) return;
      const currentTab = getRenderedProfileContentTab(profile);
      if (tab === currentTab) {
        if (tab === "menu") syncBusinessMenuCategoryUi();
        return;
      }
      state.profileContentTab = tab;
      if (isBusinessProfile(profile) && state.activeTab === "profile") {
        state.profileTopTab = tab === "menu" ? "menu" : "profile";
        if (tab === "menu") {
          ensureMenuDataForProfile();
          ensureFocusDataForProfile();
        } else {
          setStoredBusinessMenuCategory("");
        }
        scrollWindowToTopForRender();
      }
      render();
      if (tab === "menu") {
        syncBusinessMenuCategoryUi();
      }
    });
  });

  doc.querySelectorAll("[data-business-profile-home]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!isBusinessProfileView()) return;
      const profile = getActiveProfile();
      const alreadyHome = state.activeTab === "profile"
        && getRenderedProfilePrimaryTopTab(profile) === "profile"
        && getRenderedProfileContentTab(profile) === "posts"
        && !state.drawerOpen;
      if (alreadyHome) {
        setStoredBusinessMenuCategory("");
        scrollWindowToTop(false);
        return;
      }
      state.activeTab = "profile";
      state.profileTopTab = "profile";
      state.profileContentTab = "posts";
      state.drawerOpen = false;
      setStoredBusinessMenuCategory("");
      scrollWindowToTopForRender();
      render();
    });
  });

  const handleProfileTopTabChange = (tab = "", { smoothTop = false, forceProfile = false } = {}) => {
    const nextTab = String(tab || "").trim();
    if (!nextTab) return;
    if (nextTab === "favorites" && !String(state.user?.uid || "").trim()) {
      openGuestAuthPrompt("Bitte registrieren oder einloggen, um Favoriten zu nutzen.");
      return;
    }
    const profile = getActiveProfile();
    const nextTabKey = nextTab.toLowerCase();
    if (forceProfile) state.activeTab = "profile";
    const shouldRouteMenuThroughContentTab = nextTabKey === "menu" && state.activeTab === "profile" && isBusinessProfile(profile);
    const alreadyOnBusinessMenu = shouldRouteMenuThroughContentTab
      && getRenderedProfilePrimaryTopTab(profile) === "profile"
      && getRenderedProfileContentTab(profile) === "menu"
      && !state.drawerOpen;
    const alreadyOnRawTopTab = !shouldRouteMenuThroughContentTab
      && nextTabKey === String(state.profileTopTab || "").trim().toLowerCase()
      && !state.drawerOpen
      && (!forceProfile || state.activeTab === "profile");
    if (alreadyOnBusinessMenu || alreadyOnRawTopTab) {
      if (smoothTop) scrollWindowToTopForRender();
      if (shouldRouteMenuThroughContentTab) syncBusinessMenuCategoryUi();
      return;
    }
    state.profileTopTab = nextTab;
    if (shouldRouteMenuThroughContentTab) {
      state.profileContentTab = "menu";
    } else if (nextTabKey !== "menu") {
      setStoredBusinessMenuCategory("");
    }
    state.drawerOpen = false;
    if (nextTab === "menu" || nextTab === "favorites" || nextTab === "cart") {
      ensureMenuDataForProfile();
    }
    if (nextTab === "menu") {
      ensureFocusDataForProfile();
    }
    if (smoothTop && doc?.defaultView?.scrollTo) {
      scrollWindowToTopForRender();
    }
    render();
    if (shouldRouteMenuThroughContentTab) {
      syncBusinessMenuCategoryUi();
    }
  };

  const openSmartHeaderCart = () => {
    const cartRestaurantId = String(state.shopCart?.restaurantId || "").trim();
    const cartItems = Array.isArray(state.shopCart?.items) ? state.shopCart.items : [];
    const currentProfile = state.profileView?.profile || state.userProfile || {};
    const currentRestaurantId = String(currentProfile?.restaurantId || "").trim();

    if (cartRestaurantId && cartItems.length) {
      if (currentRestaurantId === cartRestaurantId) {
        handleProfileTopTabChange("cart", { smoothTop: true, forceProfile: true });
        return;
      }
      if (openProfileViewFromBusiness) {
        void openProfileViewFromBusiness({ id: cartRestaurantId }, { showBack: true, topTab: "cart" });
        return;
      }
    }

    if (currentRestaurantId) {
      handleProfileTopTabChange("cart", { smoothTop: true, forceProfile: true });
      return;
    }

    console.log("Warenkorb geklickt");
  };

  doc.querySelectorAll("[data-profile-top-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      handleProfileTopTabChange(btn.dataset.profileTopTab || "");
    });
  });

  doc.querySelectorAll("[data-business-top-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      handleProfileTopTabChange(btn.dataset.businessTopTab || "", { smoothTop: true, forceProfile: true });
    });
  });

  doc.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = String(btn.dataset.action || "").trim().toLowerCase();
      if (!action) return;
      if (action === "cart") {
        openSmartHeaderCart();
        return;
      }
      if (action === "kellner") {
        console.log("Kellner gerufen");
      }
    });
  });

  doc.querySelectorAll("[data-business-menu-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = normalizeBusinessMenuCategory(btn.dataset.businessMenuCategory || "");
      if (!category) return;
      setStoredBusinessMenuCategory(category);
      syncBusinessMenuCategoryUi(category);
      scrollBusinessMenuToCategory(category);
    });
  });

  doc.querySelectorAll("[data-profile-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.profileView;
      if (!mode) return;
      if (state.profileViewMode === mode) return;
      state.profileViewMode = mode;
      render();
    });
  });

  syncBusinessMenuCategoryUi();
}
