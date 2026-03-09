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
  ensureFocusDataForProfileFn
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
        customerModal: { open: false, mode: "edit", customer: null, status: "", loading: false, logoFile: null, logoPreview: "" }
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
      const tab = btn.dataset.profileTab;
      if (!tab) return;
      state.profileContentTab = tab;
      render();
    });
  });

  doc.querySelectorAll("[data-profile-top-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.profileTopTab;
      if (!tab) return;
      if (tab === "favorites" && !String(state.user?.uid || "").trim()) {
        openGuestAuthPrompt("Bitte registrieren oder einloggen, um Favoriten zu nutzen.");
        return;
      }
      state.profileTopTab = tab;
      if (tab === "menu" || tab === "favorites") {
        ensureMenuDataForProfile();
      }
      if (tab === "menu") {
        ensureFocusDataForProfile();
      }
      render();
    });
  });

  doc.querySelectorAll("[data-profile-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.profileView;
      if (!mode) return;
      state.profileViewMode = mode;
      render();
    });
  });
}
