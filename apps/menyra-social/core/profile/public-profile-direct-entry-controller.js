import {
  normalizePendingProfileRestaurantIdCore,
  normalizeProfileTopTabFromRouteCore
} from "./profile-route-open-utils.js";

function safeLower(value = "") {
  return String(value || "").trim().toLowerCase();
}

function normalizeProfileTopTab(value = "", fallback = "profile") {
  const topTab = safeLower(value);
  if (topTab === "profile") return "profile";
  if (topTab === "menu") return "menu";
  if (topTab === "landing") return "landing";
  if (topTab === "cart") return "cart";
  if (topTab === "favorites") return "favorites";
  return safeLower(fallback) || "profile";
}

function normalizeProfileContentTabForTopTab(topTab = "", value = "") {
  const safeTopTab = normalizeProfileTopTab(topTab, "profile");
  if (safeTopTab === "menu") return "menu";
  const contentTab = safeLower(value);
  if (contentTab === "media") return "media";
  if (contentTab === "checkins") return "checkins";
  if (contentTab === "menu") return "menu";
  return "posts";
}

function isQrLikeProfileAccessSource(value = "") {
  const safeAccessSource = safeLower(value);
  return safeAccessSource === "qr"
    || safeAccessSource === "qrcode"
    || safeAccessSource === "qr-code"
    || safeAccessSource === "menuqr"
    || safeAccessSource === "menu-qr"
    || safeAccessSource === "scanqr"
    || safeAccessSource === "scan-qr";
}

export function createPublicProfileDirectEntryController({
  state = null,
  resolveVisibleProfileSurface = () => null
} = {}) {
  const resolveVisibleProfileSurfaceSafe = typeof resolveVisibleProfileSurface === "function"
    ? resolveVisibleProfileSurface
    : (() => null);

  function resolvePendingDirectEntry(pendingRoute = {}) {
    const pendingProfileRestaurantId = normalizePendingProfileRestaurantIdCore(pendingRoute?.pendingProfileRestaurantId || "");
    if (!pendingProfileRestaurantId) {
      return {
        active: false,
        restaurantId: "",
        topTab: "profile",
        contentTab: "posts",
        menuAccessSource: "",
        tableNumber: 0,
        explicitLanding: false
      };
    }
    const requestedTopTab = normalizeProfileTopTabFromRouteCore(pendingRoute?.pendingProfileTopTab || "");
    const resolvedTopTab = normalizeProfileTopTab(requestedTopTab || "profile", "profile");
    const resolvedMenuAccessSource = resolvedTopTab === "menu" && isQrLikeProfileAccessSource(pendingRoute?.pendingProfileAccessSource || "")
      ? "qr"
      : "";
    const pendingTableNumber = Math.max(0, Number(pendingRoute?.pendingProfileTableNumber || 0) || 0);
    const resolvedTableNumber = resolvedMenuAccessSource === "qr" ? pendingTableNumber : 0;
    return {
      active: true,
      restaurantId: pendingProfileRestaurantId,
      topTab: resolvedTopTab,
      contentTab: normalizeProfileContentTabForTopTab(resolvedTopTab, ""),
      menuAccessSource: resolvedMenuAccessSource,
      tableNumber: resolvedTableNumber,
      explicitLanding: resolvedTopTab === "landing"
    };
  }

  function seedPendingDirectEntry(pendingRoute = {}) {
    if (!state || typeof state !== "object") return null;
    const entry = resolvePendingDirectEntry(pendingRoute);
    if (!entry.active || !entry.restaurantId) return null;
    state.profileView = {
      profile: {
        name: "Profil wird geladen...",
        handle: "",
        uid: "",
        bio: "Profil wird geladen...",
        avatar: "",
        location: "",
        followers: null,
        following: null,
        privateAccount: false,
        role: "business",
        restaurantId: entry.restaurantId,
        pendingFollowRequest: false,
        postsLoaded: false,
        posts: [],
        identityTruthState: "pending",
        truthState: "route-pending-loading"
      },
      posts: [],
      menuAccessSource: entry.menuAccessSource,
      tableNumber: entry.tableNumber,
      directEntry: {
        active: true,
        source: "route",
        phase: "pending",
        topTab: entry.topTab,
        contentTab: entry.contentTab,
        explicitLanding: entry.explicitLanding
      }
    };
    state.profileModal = { open: false, profile: null };
    state.profileContentTab = entry.contentTab;
    state.profileTopTab = entry.topTab;
    if (entry.topTab !== "landing") {
      state.profileLandingStep = 0;
      state.profileLandingGreetingIndex = 0;
      state.profileLandingTourIndex = 0;
    }
    state.profileViewMode = "grid";
    state.profilePostMenuId = null;
    state.profileBackTab = "";
    state.drawerOpen = false;
    state.activeTab = "profile";
    const nextSurface = resolveVisibleProfileSurfaceSafe(state, {
      profileView: state.profileView,
      profileTopTab: state.profileTopTab,
      profileContentTab: state.profileContentTab
    });
    if (nextSurface) {
      state.profileSurface = nextSurface;
    }
    return entry;
  }

  return {
    resolvePendingDirectEntry,
    seedPendingDirectEntry
  };
}
