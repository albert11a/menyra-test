function normalizeKeyPart(value = "") {
  return String(value || "").trim().toLowerCase();
}

function firstText(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function formatTargetKey(kind = "profile", value = "") {
  const safeKind = normalizeKeyPart(kind) || "profile";
  const raw = normalizeKeyPart(value);
  if (!raw) return "";
  const explicit = raw.match(/^([a-z][a-z0-9_-]*):(.*)$/);
  if (explicit) {
    const explicitKind = explicit[1] || safeKind;
    const explicitValue = explicitKind === "user"
      ? String(explicit[2] || "").replace(/^@/, "")
      : String(explicit[2] || "");
    return explicitValue ? `${explicitKind}:${explicitValue}` : "";
  }
  const safeValue = safeKind === "user" ? raw.replace(/^@/, "") : raw;
  return safeValue ? `${safeKind}:${safeValue}` : "";
}

export function normalizeProfileTargetKey(target = {}) {
  const safeTarget = target && typeof target === "object" ? target : {};
  const kind = normalizeKeyPart(safeTarget.kind || safeTarget.type || safeTarget.targetKind || "");
  if (kind === "business" || kind === "restaurant" || safeTarget.restaurantId || safeTarget.canonicalRestaurantId) {
    const id = firstText(
      safeTarget.targetKey,
      safeTarget.canonicalRestaurantId,
      safeTarget.restaurantId,
      safeTarget.lookupId,
      safeTarget.routeId,
      safeTarget.id,
      safeTarget.slug,
      safeTarget.handle,
      safeTarget.name
    );
    return formatTargetKey("business", id);
  }
  if (kind === "user" || safeTarget.uid || safeTarget.handle || safeTarget.routeId) {
    const id = firstText(
      safeTarget.targetKey,
      safeTarget.uid,
      safeTarget.handle,
      safeTarget.routeId,
      safeTarget.id,
      safeTarget.name
    ).replace(/^@/, "");
    return formatTargetKey("user", id);
  }
  if (kind === "own") return "own:self";
  const id = firstText(safeTarget.targetKey, safeTarget.id, safeTarget.name);
  return formatTargetKey(kind || "profile", id);
}

export function resolveProfileTargetKeyFromProfile(profile = null, view = null) {
  const safeProfile = profile && typeof profile === "object" ? profile : {};
  const safeView = view && typeof view === "object" ? view : {};
  const explicit = firstText(safeView.__profileTargetKey, safeProfile.__profileTargetKey);
  if (explicit) return explicit;
  const restaurantId = firstText(
    safeProfile.canonicalRestaurantId,
    safeView.routePayload?.canonicalRestaurantId,
    safeView.routePayload?.businessSnapshot?.restaurantId,
    safeProfile.restaurantId,
    safeView.routePayload?.restaurantId
  );
  if (restaurantId) {
    return normalizeProfileTargetKey({ kind: "business", restaurantId });
  }
  const uid = firstText(safeProfile.uid);
  if (uid) return normalizeProfileTargetKey({ kind: "user", uid });
  const handle = firstText(safeProfile.handle, safeProfile.name).replace(/^@/, "");
  if (handle) return normalizeProfileTargetKey({ kind: "user", handle });
  return "";
}

export function resolveProfileTargetKeyFromState(state = {}) {
  const view = state?.profileView && typeof state.profileView === "object"
    ? state.profileView
    : null;
  return resolveProfileTargetKeyFromProfile(view?.profile || null, view);
}

function ensureProfileLoadState(state = {}) {
  if (!state || typeof state !== "object") return;
  if (!Number.isFinite(Number(state.profileLoadVersion))) state.profileLoadVersion = 0;
  if (typeof state.profileLoadTargetKey !== "string") state.profileLoadTargetKey = "";
  if (!state.profileLoadTarget || typeof state.profileLoadTarget !== "object") state.profileLoadTarget = null;
  if (!state.__pendingProfileTarget || typeof state.__pendingProfileTarget !== "object") {
    state.__pendingProfileTarget = null;
  }
}

export function createProfileTargetTransaction({
  state = null,
  render = () => {},
  resolveVisibleProfileSurface = null
} = {}) {
  const renderApp = typeof render === "function" ? render : (() => {});
  const resolveSurface = typeof resolveVisibleProfileSurface === "function"
    ? resolveVisibleProfileSurface
    : null;

  function beginProfileLoad(target = {}) {
    if (!state || typeof state !== "object") {
      return { loadId: 0, targetKey: "", target: null };
    }
    ensureProfileLoadState(state);
    const safeTarget = target && typeof target === "object" ? target : {};
    const targetKey = normalizeProfileTargetKey(safeTarget);
    const loadId = Number(state.profileLoadVersion || 0) + 1;
    const nextTarget = {
      ...safeTarget,
      targetKey,
      loadId,
      active: true,
      ts: Date.now()
    };
    state.profileLoadVersion = loadId;
    state.profileLoadTargetKey = targetKey;
    state.profileLoadTarget = nextTarget;
    state.__pendingProfileTarget = nextTarget;
    return { loadId, targetKey, target: nextTarget };
  }

  function isCurrentProfileLoad(loadId, targetKey = "") {
    if (!state || typeof state !== "object") return false;
    const safeLoadId = Number(loadId || 0);
    const safeTargetKey = String(targetKey || "").trim();
    return !!safeLoadId
      && safeLoadId === Number(state.profileLoadVersion || 0)
      && (!safeTargetKey || safeTargetKey === String(state.profileLoadTargetKey || "").trim());
  }

  function cancelProfileLoad(reason = "") {
    if (!state || typeof state !== "object") return;
    ensureProfileLoadState(state);
    state.profileLoadVersion = Number(state.profileLoadVersion || 0) + 1;
    state.profileLoadTargetKey = "";
    state.profileLoadTarget = null;
    state.__pendingProfileTarget = null;
    state.__lastProfileLoadCancelReason = String(reason || "").trim();
  }

  function hasActivePendingProfileLoad() {
    if (!state || typeof state !== "object") return false;
    const target = state.profileLoadTarget && typeof state.profileLoadTarget === "object"
      ? state.profileLoadTarget
      : null;
    const pending = state.__pendingProfileTarget && typeof state.__pendingProfileTarget === "object"
      ? state.__pendingProfileTarget
      : null;
    return !!(
      (target && target.active !== false)
      || (pending && pending.active !== false)
    );
  }

  function commitPublicProfileBundleIfCurrent({
    loadId = null,
    targetKey = "",
    view = null,
    topTab = "",
    contentTab = "",
    backTab = "",
    showBack = true,
    menuAccessSource = "",
    tableNumber = 0,
    directEntry = null,
    routePayload = null,
    renderNow = true
  } = {}) {
    if (!state || typeof state !== "object" || !view || typeof view !== "object" || !view.profile) {
      return false;
    }
    const safeTargetKey = String(targetKey || resolveProfileTargetKeyFromProfile(view.profile, view) || "").trim();
    const hasLoadGuard = loadId !== null && loadId !== undefined;
    if (hasLoadGuard && !isCurrentProfileLoad(loadId, safeTargetKey)) return false;
    if (!hasLoadGuard && hasActivePendingProfileLoad()) return false;
    const nextView = {
      ...view,
      __profileTargetKey: safeTargetKey,
      profile: {
        ...(view.profile || {}),
        ...(safeTargetKey ? { __profileTargetKey: safeTargetKey } : {})
      },
      menuAccessSource: String(menuAccessSource || view.menuAccessSource || "").trim().toLowerCase() === "qr" ? "qr" : "",
      tableNumber: Math.max(0, Number(tableNumber ?? view.tableNumber ?? 0) || 0),
      directEntry: directEntry !== null && directEntry !== undefined ? directEntry : (view.directEntry || null),
      routePayload: routePayload !== null && routePayload !== undefined ? routePayload : (view.routePayload || null)
    };
    state.profileView = nextView;
    state.profileModal = { open: false, profile: null };
    if (contentTab) state.profileContentTab = String(contentTab || "").trim().toLowerCase();
    if (topTab) state.profileTopTab = String(topTab || "").trim().toLowerCase();
    state.profileViewMode = "grid";
    state.profilePostMenuId = null;
    state.drawerOpen = false;
    state.profileBackTab = showBack ? (String(backTab || state.profileBackTab || "feed").trim() || "feed") : "";
    state.activeTab = "profile";
    if (safeTargetKey) state.profileLoadTargetKey = safeTargetKey;
    state.profileLoadTarget = null;
    state.__pendingProfileTarget = null;
    if (resolveSurface) {
      state.profileSurface = resolveSurface(state, {
        profileView: state.profileView,
        profileTopTab: state.profileTopTab,
        profileContentTab: state.profileContentTab
      });
    }
    if (renderNow) renderApp();
    return true;
  }

  function patchVisibleProfileIfCurrent(targetKey = "", patch = {}) {
    if (!state || typeof state !== "object") return false;
    const view = state.profileView && typeof state.profileView === "object" ? state.profileView : null;
    const profile = view?.profile && typeof view.profile === "object" ? view.profile : null;
    if (!view || !profile) return false;
    const currentTargetKey = resolveProfileTargetKeyFromProfile(profile, view);
    const safeTargetKey = String(targetKey || "").trim();
    if (safeTargetKey && currentTargetKey && safeTargetKey !== currentTargetKey) return false;
    const safePatch = patch && typeof patch === "object" ? patch : {};
    const profilePatch = safePatch.profile && typeof safePatch.profile === "object"
      ? safePatch.profile
      : safePatch;
    const nextPosts = Array.isArray(safePatch.posts) ? safePatch.posts : null;
    state.profileView = {
      ...view,
      __profileTargetKey: currentTargetKey || safeTargetKey,
      ...(safePatch.view && typeof safePatch.view === "object" ? safePatch.view : {}),
      profile: {
        ...profile,
        ...profilePatch,
        __profileTargetKey: currentTargetKey || safeTargetKey
      },
      ...(nextPosts ? { posts: nextPosts } : {})
    };
    if (resolveSurface) {
      state.profileSurface = resolveSurface(state, {
        profileView: state.profileView,
        profileTopTab: state.profileTopTab,
        profileContentTab: state.profileContentTab
      });
    }
    return true;
  }

  return {
    beginProfileLoad,
    isCurrentProfileLoad,
    cancelProfileLoad,
    commitPublicProfileBundleIfCurrent,
    patchVisibleProfileIfCurrent
  };
}
