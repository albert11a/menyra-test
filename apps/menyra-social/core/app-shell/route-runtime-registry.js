const EMPTY_RENDER = () => "";

function asRenderFn(candidate) {
  return typeof candidate === "function" ? candidate : EMPTY_RENDER;
}

function normalizeRouteKey(value = "") {
  return String(value || "").trim().toLowerCase();
}

function hasPublicProfileView(state = {}) {
  return !!(state?.profileView && typeof state.profileView === "object");
}

function getActiveWebDirectEntry(state = {}) {
  const entry = state?.__webDirectEntry;
  return entry && typeof entry === "object" && entry.active === true ? entry : null;
}

function isPublicMenuRuntime(state = {}) {
  if (!hasPublicProfileView(state)) return false;
  const profileView = state.profileView || {};
  const directEntry = getActiveWebDirectEntry(state);
  const routePayload = profileView.routePayload && typeof profileView.routePayload === "object"
    ? profileView.routePayload
    : null;
  const profileTopTab = normalizeRouteKey(state.profileTopTab || profileView.topTab);
  const profileContentTab = normalizeRouteKey(state.profileContentTab || profileView.contentTab);
  const menuAccessSource = normalizeRouteKey(
    profileView.menuAccessSource
    || routePayload?.menuAccessSource
    || directEntry?.menuAccessSource
  );
  return profileTopTab === "menu"
    || profileTopTab === "cart"
    || profileTopTab === "favorites"
    || profileContentTab === "menu"
    || menuAccessSource === "qr";
}

export function resolveSocialRouteRuntimeKey(state = {}) {
  const activeTab = normalizeRouteKey(state?.activeTab);
  if (activeTab === "home" || activeTab === "feed") return "feed";
  if (activeTab === "search") return "search";
  if (activeTab === "map") return "map";
  if (activeTab === "staff") return "staff";
  if (activeTab === "businessaccounts") return "businessAccounts";
  if (activeTab === "profile" && hasPublicProfileView(state)) {
    return isPublicMenuRuntime(state) ? "publicMenu" : "publicBusiness";
  }
  return "defaultSocial";
}

export function createSocialRouteRuntimeRegistry({ state = {}, renderers = {} } = {}) {
  const renderPublicProfile = asRenderFn(renderers.publicProfile);
  const renderOwnProfile = asRenderFn(renderers.ownProfile);
  const renderMenuAdmin = asRenderFn(renderers.menuAdmin);
  const renderFeed = asRenderFn(renderers.feed);
  const renderChat = asRenderFn(renderers.chat);
  const renderSearch = asRenderFn(renderers.search);
  const renderMap = asRenderFn(renderers.map);
  const renderOrders = asRenderFn(renderers.orders);
  const renderStaff = asRenderFn(renderers.staff);
  const renderBusinessAccounts = asRenderFn(renderers.businessAccounts);
  const renderSettings = asRenderFn(renderers.settings);
  const renderNotifications = asRenderFn(renderers.notifications);
  const renderUpload = asRenderFn(renderers.upload);

  function renderDefaultSocialRoute() {
    const activeTab = normalizeRouteKey(state?.activeTab);
    if (activeTab === "home" || activeTab === "feed") return renderFeed();
    if (activeTab === "chat") return renderChat();
    if (activeTab === "search") return renderSearch();
    if (activeTab === "map") return renderMap();
    if (activeTab === "profile") return hasPublicProfileView(state) ? renderPublicProfile() : renderOwnProfile();
    if (activeTab === "menu") return renderMenuAdmin();
    if (activeTab === "orders") return renderOrders();
    if (activeTab === "staff") return renderStaff();
    if (activeTab === "businessaccounts") return renderBusinessAccounts();
    if (activeTab === "settings") return renderSettings();
    if (activeTab === "notifications") return renderNotifications();
    if (activeTab === "upload") return renderUpload();
    return "";
  }

  const runtimeMap = Object.freeze({
    publicBusiness: Object.freeze({ key: "publicBusiness", render: renderPublicProfile }),
    publicMenu: Object.freeze({ key: "publicMenu", render: renderPublicProfile }),
    feed: Object.freeze({ key: "feed", render: renderFeed }),
    search: Object.freeze({ key: "search", render: renderSearch }),
    map: Object.freeze({ key: "map", render: renderMap }),
    staff: Object.freeze({ key: "staff", render: renderStaff }),
    businessAccounts: Object.freeze({ key: "businessAccounts", render: renderBusinessAccounts }),
    defaultSocial: Object.freeze({ key: "defaultSocial", render: renderDefaultSocialRoute })
  });

  function resolveActiveRouteRuntimeKey() {
    return resolveSocialRouteRuntimeKey(state);
  }

  function resolveActiveRouteRuntime() {
    return runtimeMap[resolveActiveRouteRuntimeKey()] || runtimeMap.defaultSocial;
  }

  function renderActiveRoute() {
    return resolveActiveRouteRuntime().render();
  }

  return Object.freeze({
    resolveActiveRouteRuntimeKey,
    resolveActiveRouteRuntime,
    renderActiveRoute,
    getRuntimeMap: () => runtimeMap
  });
}
