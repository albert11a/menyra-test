const EMPTY_RENDER = () => "";

function asRenderFn(candidate) {
  return typeof candidate === "function" ? candidate : EMPTY_RENDER;
}

function asPreloadFn(candidate) {
  return typeof candidate === "function" ? candidate : (() => {});
}

function createRuntimeEntry(key = "", candidate = null, fallbackRender = EMPTY_RENDER) {
  const runtime = candidate && typeof candidate === "object" ? candidate : {};
  return Object.freeze({
    key: String(runtime.key || key || ""),
    render: asRenderFn(runtime.render || fallbackRender),
    preload: asPreloadFn(runtime.preload),
    ensureLoaded: typeof runtime.ensureLoaded === "function" ? runtime.ensureLoaded : null
  });
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
  if (activeTab === "restaurants") return "restaurants";
  if (activeTab === "travel") return "travel";
  if (activeTab === "shopping") return "shopping";
  if (activeTab === "search") return "search";
  if (activeTab === "map") return "map";
  if (activeTab === "staff") return "staff";
  if (activeTab === "businessaccounts") return "businessAccounts";
  if (activeTab === "profile" && hasPublicProfileView(state)) {
    return isPublicMenuRuntime(state) ? "publicMenu" : "publicBusiness";
  }
  return "defaultSocial";
}

export function createSocialRouteRuntimeRegistry({ state = {}, renderers = {}, routeRuntimes = {} } = {}) {
  const feedRuntime = createRuntimeEntry("feed", routeRuntimes.feed, renderers.feed);
  const searchRuntime = createRuntimeEntry("search", routeRuntimes.search, renderers.search);
  const mapRuntime = createRuntimeEntry("map", routeRuntimes.map, renderers.map);
  const restaurantsRuntime = createRuntimeEntry("restaurants", routeRuntimes.restaurants, renderers.restaurants);
  const travelRuntime = createRuntimeEntry("travel", routeRuntimes.travel, renderers.travel);
  const shoppingRuntime = createRuntimeEntry("shopping", routeRuntimes.shopping, renderers.shopping);
  const publicBusinessRuntime = createRuntimeEntry("publicBusiness", routeRuntimes.publicBusiness, renderers.publicProfile);
  const publicMenuRuntime = createRuntimeEntry("publicMenu", routeRuntimes.publicMenu, renderers.publicProfile);
  const renderPublicProfile = publicBusinessRuntime.render;
  const renderOwnProfile = asRenderFn(renderers.ownProfile);
  const renderMenuAdmin = asRenderFn(renderers.menuAdmin);
  const renderFeed = feedRuntime.render;
  const renderRestaurants = restaurantsRuntime.render;
  const renderTravel = travelRuntime.render;
  const renderShopping = shoppingRuntime.render;
  const renderChat = asRenderFn(renderers.chat);
  const renderSearch = searchRuntime.render;
  const renderMap = mapRuntime.render;
  const renderOrders = asRenderFn(renderers.orders);
  const renderStaff = asRenderFn(renderers.staff);
  const renderBusinessAccounts = asRenderFn(renderers.businessAccounts);
  const renderSettings = asRenderFn(renderers.settings);
  const renderNotifications = asRenderFn(renderers.notifications);
  const renderUpload = asRenderFn(renderers.upload);

  function renderDefaultSocialRoute() {
    const activeTab = normalizeRouteKey(state?.activeTab);
    if (activeTab === "home" || activeTab === "feed") return renderFeed();
    if (activeTab === "restaurants") return renderRestaurants();
    if (activeTab === "travel") return renderTravel();
    if (activeTab === "shopping") return renderShopping();
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
    publicBusiness: publicBusinessRuntime,
    publicMenu: publicMenuRuntime,
    feed: feedRuntime,
    restaurants: restaurantsRuntime,
    travel: travelRuntime,
    shopping: shoppingRuntime,
    search: searchRuntime,
    map: mapRuntime,
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
    const runtime = resolveActiveRouteRuntime();
    runtime.preload?.();
    return runtime.render();
  }

  return Object.freeze({
    resolveActiveRouteRuntimeKey,
    resolveActiveRouteRuntime,
    renderActiveRoute,
    getRuntimeMap: () => runtimeMap
  });
}
