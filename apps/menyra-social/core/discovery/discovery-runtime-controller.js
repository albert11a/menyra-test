export function createDiscoveryRuntimeController(deps = {}) {
  const document = deps.documentObj || (typeof globalThis.document === "undefined" ? null : globalThis.document);
  const window = deps.windowObj || (typeof globalThis.window === "undefined" ? null : globalThis.window);
  const navigator = deps.navigatorObj || (typeof globalThis.navigator === "undefined" ? null : globalThis.navigator);

  const state = deps.state;
  const BRAND_UI = deps.brandUi;
  const LEAFLET_JS_URL = deps.LEAFLET_JS_URL || "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  const LEAFLET_CSS_URL = deps.LEAFLET_CSS_URL || "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  const SEARCH_LIMITS = deps.searchLimits || { users: 10, businesses: 12 };
  const PLACEHOLDER_IMAGE = deps.placeholderImage;

  const getGeo = deps.getGeoFn;
  const normalizeLeadLocations = deps.normalizeLeadLocationsFn;
  const resolveCoordsFromEntity = deps.resolveCoordsFromEntityFn;
  const normalizeCoordPair = deps.normalizeCoordPairFn;
  const preferStableCoords = deps.preferStableCoordsFn;
  const isPlaceholderUrl = deps.isPlaceholderUrlFn;
  const escapeHtml = deps.escapeHtmlFn;
  const isPublicBusinessRecord = deps.isPublicBusinessRecordFn;
  const normalizeRestaurantType = deps.normalizeRestaurantTypeFn;
  const openProfileViewFromBusiness = deps.openProfileViewFromBusinessFn;
  const render = deps.renderFn;
  const getSelfAvatarUrl = deps.getSelfAvatarUrlFn;
  const isCeoUser = deps.isCeoUserFn;
  const getCeoGpsOverride = deps.getCeoGpsOverrideFn;
  const icon = deps.iconFn;
  const getOptimizedImageUrl = deps.getOptimizedImageUrlFn;
  const resolveRestaurantLogo = deps.resolveRestaurantLogoFn;
  const normalizeSearchKey = deps.normalizeSearchKeyFn;
  const normalizeSearchQuery = deps.normalizeSearchQueryFn;
  const scoreSearchMatch = deps.scoreSearchMatchFn;
  const sanitizeDisplayName = deps.sanitizeDisplayNameFn;
  const normalizeHandle = deps.normalizeHandleFn;
  const resolveSearchUserAvatarDisplay = deps.resolveSearchUserAvatarDisplayFn;
  const isForceHiddenBusinessEntity = deps.isForceHiddenBusinessEntityFn;
  const isForceHiddenHandle = deps.isForceHiddenHandleFn;
  const isForceHiddenEmail = deps.isForceHiddenEmailFn;
  const isGuestSession = deps.isGuestSessionFn;
  const escapeSelector = deps.escapeSelectorFn;
  const collection = deps.collectionFn;
  const query = deps.queryFn;
  const orderBy = deps.orderByFn;
  const startAt = deps.startAtFn;
  const endAt = deps.endAtFn;
  const limit = deps.limitFn;
  const getDocs = deps.getDocsFn;
  const db = deps.db;
  const getLastRenderMode = typeof deps.getLastRenderModeFn === "function" ? deps.getLastRenderModeFn : () => "";

  let searchTimer = null;
  let searchToken = 0;
  const searchCache = new Map();

  let leafletLoadPromise = null;
  let leafletLoadFailed = false;
  let leafletMap = null;
  let leafletBizMarkers = [];
  let leafletUserMarker = null;
  let mapNotice = "";
  let mapNoticeTimer = null;
  const DISCOVERY_MAP_DEFAULT_CENTER = [42.6629, 21.1655];
  const DISCOVERY_MAP_MAX_ZOOM = 19;

function getLeafletFocusZoom() {
  if (leafletMap && typeof leafletMap.getMaxZoom === "function") {
    const maxZoom = Number(leafletMap.getMaxZoom());
    if (Number.isFinite(maxZoom) && maxZoom > 0) return maxZoom;
  }
  return DISCOVERY_MAP_MAX_ZOOM;
}

function focusLeafletMap(lat, lng, options = {}) {
  if (!leafletMap) return;
  const coords = normalizeCoordPair(lat, lng);
  if (!coords) return;
  const zoom = Number.isFinite(options.zoom) ? options.zoom : getLeafletFocusZoom();
  const duration = Number.isFinite(options.duration) ? options.duration : 0.5;
  try {
    leafletMap.setView([coords.lat, coords.lng], zoom, { animate: true, duration });
  } catch {}
}

function ensureLeafletStylesheet() {
  if (typeof document === "undefined") return;
  if (document.querySelector('link[data-leaflet-css="1"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = LEAFLET_CSS_URL;
  link.dataset.leafletCss = "1";
  document.head.appendChild(link);
}

async function ensureLeafletLoaded() {
  if (window.L) return true;
  if (leafletLoadFailed) return false;
  if (leafletLoadPromise) return leafletLoadPromise;
  ensureLeafletStylesheet();
  leafletLoadPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.dataset.leafletJs = "1";
    script.onload = () => {
      leafletLoadFailed = !window.L;
      resolve(!!window.L);
    };
    script.onerror = () => {
      leafletLoadFailed = true;
      resolve(false);
    };
    document.head.appendChild(script);
  }).finally(() => {
    leafletLoadPromise = null;
  });
  return leafletLoadPromise;
}

function hashValue(input) {
  return Array.from(String(input || "")).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function getRestaurantLocations(rest) {
  const geo = getGeo(rest) || {};
  return normalizeLeadLocations(rest?.locations || [], rest?.address || rest?.city || "", {
    lat: rest?.lat ?? geo?.lat,
    lng: rest?.lng ?? geo?.lng
  });
}

function normalizeBusinessLocation(rest, idx, location = null, locationIndex = 0) {
  const geo = getGeo(rest);
  const baseLat = 42.6629;
  const baseLng = 21.1655;
  const hash = hashValue(`${rest.id || rest.name || idx}:${locationIndex}`);

  const row = location || {};
  const rowCoords = resolveCoordsFromEntity(row);
  const restCoords = resolveCoordsFromEntity(rest)
    || normalizeCoordPair(rest?.lat ?? geo?.lat, rest?.lng ?? geo?.lng);
  const normalizedCoords = preferStableCoords(rowCoords, restCoords);
  let lat = normalizedCoords?.lat ?? null;
  let lng = normalizedCoords?.lng ?? null;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    lat = baseLat + (((hash % 200) - 100) * 0.0025);
    lng = baseLng + ((((hash >> 3) % 200) - 100) * 0.003);
  }

  return {
    id: rest.id,
    markerKey: `${rest.id || "biz"}:${locationIndex}`,
    locationIndex,
    name: rest.name || rest.restaurantName || "Business",
    type: rest.type || "food",
    lat,
    lng,
    address: row.address || rest.address || rest.city || "Prishtina",
    hours: rest.hours || rest.openHours || "08:00 - 23:00",
    rating: rest.rating || rest.score || 4.8,
    img: rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || "",
    desc: rest.description || rest.bio || `Offizielles Lokal auf ${BRAND_UI.upper}.`,
    raw: rest
  };
}

function buildRestaurantLocations(rest, idx) {
  const locations = getRestaurantLocations(rest);
  if (!locations.length) {
    return [normalizeBusinessLocation(rest, idx, null, 0)];
  }
  return locations.map((location, locationIndex) => normalizeBusinessLocation(rest, idx, location, locationIndex));
}

function cleanupLeaflet() {
  try {
    if (leafletMap) leafletMap.remove();
  } catch {}
  leafletMap = null;
  leafletBizMarkers = [];
  leafletUserMarker = null;
}

function isLeafletMapMountedOn(element) {
  if (!leafletMap || !element) return false;
  try {
    const container = typeof leafletMap.getContainer === "function" ? leafletMap.getContainer() : null;
    if (!container) return false;
    if (container !== element) return false;
    if (!document.body.contains(container)) return false;
    return true;
  } catch {
    return false;
  }
}

function scheduleLeafletRefresh(retries = 3) {
  if (!leafletMap || !document.getElementById("leafletMap")) return;
  const run = (left) => {
    if (!leafletMap) return;
    const el = document.getElementById("leafletMap");
    if (!el || !isLeafletMapMountedOn(el)) return;
    try { leafletMap.invalidateSize(); } catch {}
    if (left <= 0) return;
    window.setTimeout(() => run(left - 1), 180);
  };
  run(Math.max(0, Number(retries) || 0));
}

function makeBizDivIcon(b) {
  const selected = state.selectedBusiness || {};
  const selectedKey = String(selected.markerKey || "");
  const isSelected = selectedKey
    ? selectedKey === String(b.markerKey || "")
    : (String(selected.id || "") === String(b.id || "")
      && Number(selected.locationIndex || 0) === Number(b.locationIndex || 0));
  const safeImg = b.img && !isPlaceholderUrl(b.img) ? escapeHtml(b.img) : PLACEHOLDER_IMAGE;
  const html = `
    <div class="relative flex flex-col items-center justify-center transition-all duration-300 ${isSelected ? 'scale-110 z-[500]' : 'hover:scale-105 z-[400]'}">
      <div class="w-12 h-12 rounded-[1rem] shadow-lg flex items-center justify-center border-[3px] ${isSelected ? 'border-indigo-600' : 'border-white'} bg-white overflow-hidden p-0.5">
        <img src="${safeImg}" class="w-full h-full object-cover rounded-xl" onerror="this.src='${PLACEHOLDER_IMAGE}'"/>
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isSelected ? 'border-t-indigo-600' : 'border-t-white drop-shadow-md'} -mt-1"></div>
    </div>
  `;
  return window.L.divIcon({ className: "custom-div-icon", html, iconSize: [48, 58], iconAnchor: [24, 58] });
}

function isDiscoverableMapBusiness(location = {}) {
  const row = location?.raw || {};
  if (!isPublicBusinessRecord(row)) return false;
  const typeKey = normalizeRestaurantType(
    location?.type
    || location?.raw?.type
    || location?.raw?.customerType
    || location?.raw?.category
    || location?.raw?.kind
    || location?.raw?.restaurantType
    || ""
  );
  return typeKey !== "ecommerce";
}

function getDiscoverableMapLocations(locations = state.businessLocations) {
  return (Array.isArray(locations) ? locations : []).filter(isDiscoverableMapBusiness);
}

function renderMapNotice() {
  const message = String(mapNotice || "").trim();
  if (!message) return "";
  return `
    <div class="inline-flex max-w-full items-center gap-2 rounded-2xl bg-white/92 backdrop-blur-xl border border-white/40 shadow-lg px-4 py-3 text-[11px] font-bold text-slate-700">
      ${icon("info", "w-4 h-4 text-amber-500 flex-shrink-0")}
      <span class="min-w-0">${escapeHtml(message)}</span>
    </div>
  `;
}

function updateMapNoticeDom() {
  const slot = document.getElementById("mapNoticeSlot");
  if (!slot) return false;
  slot.innerHTML = renderMapNotice();
  if (window.lucide?.createIcons) window.lucide.createIcons();
  return true;
}

function clearMapNotice({ refresh = true } = {}) {
  if (mapNoticeTimer) {
    clearTimeout(mapNoticeTimer);
    mapNoticeTimer = null;
  }
  if (!mapNotice) return;
  mapNotice = "";
  if (refresh) {
    const updated = updateMapNoticeDom();
    if (!updated && state.activeTab === "map") render();
  }
}

function setMapNotice(message = "", { durationMs = 4200 } = {}) {
  const nextMessage = String(message || "").trim();
  if (mapNoticeTimer) {
    clearTimeout(mapNoticeTimer);
    mapNoticeTimer = null;
  }
  mapNotice = nextMessage;
  const updated = updateMapNoticeDom();
  if (!updated && state.activeTab === "map") render();
  if (nextMessage && durationMs > 0) {
    mapNoticeTimer = window.setTimeout(() => {
      mapNoticeTimer = null;
      clearMapNotice();
    }, durationMs);
  }
}

function updateMapSheet() {
  const slot = document.getElementById("mapSheetSlot");
  if (!slot) return;
  if (state.selectedBusiness && !isDiscoverableMapBusiness(state.selectedBusiness)) {
    state.selectedBusiness = null;
  }
  slot.innerHTML = state.selectedBusiness ? renderMapSheet(state.selectedBusiness) : "";
  bindMapSheetEvents();
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function bindMapSheetEvents() {
  const mapCloseBtn = document.getElementById("mapCloseBtn");
  if (mapCloseBtn) {
    mapCloseBtn.addEventListener("click", () => {
      state.selectedBusiness = null;
      renderLeafletMarkers(state.businessLocations);
      updateMapSheet();
    });
  }

  const mapOpenRouteBtn = document.getElementById("mapOpenRouteBtn");
  if (mapOpenRouteBtn) {
    mapOpenRouteBtn.addEventListener("click", () => {
      if (!state.selectedBusiness) return;
      const { lat, lng } = state.selectedBusiness;
      if (typeof lat !== "number" || typeof lng !== "number") return;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    });
  }

  const mapVisitProfileBtn = document.getElementById("mapVisitProfileBtn");
  const mapVisitProfileImgBtn = document.getElementById("mapVisitProfileImgBtn");
  [mapVisitProfileBtn, mapVisitProfileImgBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        if (!state.selectedBusiness) return;
        openProfileViewFromBusiness({
          id: state.selectedBusiness.id,
          name: state.selectedBusiness.name
        });
      });
    }
  });
}

function initLeafletIfNeeded() {
  if (state.activeTab !== "map") {
    cleanupLeaflet();
    return;
  }

  const el = document.getElementById("leafletMap");
  if (!el) return;
  if (!window.L) {
    void ensureLeafletLoaded().then((loaded) => {
      if (!loaded || state.activeTab !== "map") return;
      initLeafletIfNeeded();
      render();
    });
    return;
  }

  if (leafletMap && !isLeafletMapMountedOn(el)) {
    cleanupLeaflet();
  }

  if (leafletMap) {
    try { leafletMap.invalidateSize(); } catch {}
    scheduleLeafletRefresh(2);
    bindMapSearchInput();
    return;
  }

  leafletMap = window.L.map(el, { zoomControl: false, attributionControl: false, preferCanvas: true }).setView(DISCOVERY_MAP_DEFAULT_CENTER, DISCOVERY_MAP_MAX_ZOOM);
  window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: DISCOVERY_MAP_MAX_ZOOM }).addTo(leafletMap);
  try {
    leafletMap.whenReady(() => {
      scheduleLeafletRefresh(3);
    });
  } catch {}

  renderLeafletMarkers(getDiscoverableMapLocations(state.businessLocations));
  updateMapSheet();
  if (window.lucide?.createIcons) window.lucide.createIcons();
  mapLocate();
  bindMapSearchInput();
  scheduleLeafletRefresh(3);
}

function renderLeafletMarkers(locations) {
  if (!leafletMap || !window.L) return;
  const visibleLocations = getDiscoverableMapLocations(locations);
  leafletBizMarkers.forEach(marker => { try { leafletMap.removeLayer(marker); } catch {} });
  const nextMarkers = [];
  visibleLocations.forEach((entry) => {
    const coords = normalizeCoordPair(entry?.lat, entry?.lng);
    if (!coords) return;
    const b = (coords.lat === entry.lat && coords.lng === entry.lng)
      ? entry
      : { ...entry, lat: coords.lat, lng: coords.lng };
    try {
      const marker = window.L.marker([b.lat, b.lng], { icon: makeBizDivIcon(b) }).addTo(leafletMap);
      marker.__biz = b;
      marker.on("click", () => {
        state.selectedBusiness = b;
        renderLeafletMarkers(visibleLocations);
        updateMapSheet();
        focusLeafletMap(b.lat, b.lng);
      });
      nextMarkers.push(marker);
    } catch (err) {
      console.warn("Skipping invalid map marker", b?.id || "", err);
    }
  });
  leafletBizMarkers = nextMarkers;
}

function filterMapLocationsByQuery(query) {
  const key = String(query || "").toLowerCase().trim();
  const baseLocations = getDiscoverableMapLocations(state.businessLocations);
  if (!key) return baseLocations;
  return baseLocations.filter(b =>
    b.name.toLowerCase().includes(key) || (b.address || b.city || "").toLowerCase().includes(key)
  );
}

function bindMapSearchInput() {
  const searchInput = document.getElementById("mapSearchInput");
  if (!searchInput || searchInput.dataset.bound === "true") return;
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = filterMapLocationsByQuery(query);
    renderLeafletMarkers(filtered);
    state.selectedBusiness = null;
    updateMapSheet();
    if (filtered.length > 0 && query.length > 2) {
      try { leafletMap.panTo([filtered[0].lat, filtered[0].lng], { animate: true, duration: 0.5 }); } catch {}
    }
  });
  searchInput.dataset.bound = "true";
}

function setUserMarker(lat, lng, label = "Deine Position") {
  if (!leafletMap || !window.L) return;
  
  let avatarUrl = getSelfAvatarUrl();
  if (!avatarUrl || isPlaceholderUrl(avatarUrl)) {
    const nameStr = state.userProfile.name || "User";
    avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameStr)}&background=4f46e5&color=fff`;
  }

  const html = `
    <div class="relative w-12 h-12 z-[1000] user-radar">
      <img src="${escapeHtml(avatarUrl)}" class="w-full h-full rounded-full object-cover border-[3px] border-white shadow-lg relative z-10 bg-slate-200" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
    </div>
  `;
  const markerIcon = window.L.divIcon({ className: "custom-div-icon", html, iconSize: [48, 48], iconAnchor: [24, 24] });

  if (!leafletUserMarker) {
    leafletUserMarker = window.L.marker([lat, lng], { icon: markerIcon, zIndexOffset: 2000 }).addTo(leafletMap);
  } else {
    leafletUserMarker.setLatLng([lat, lng]);
    leafletUserMarker.setIcon(markerIcon);
  }
}

function mapLocate() {
  const override = getCeoGpsOverride();
  if (isCeoUser() && override) {
    clearMapNotice({ refresh: true });
    if (leafletMap) {
      focusLeafletMap(override.lat, override.lng);
      setUserMarker(override.lat, override.lng, "Deine Position");
    }
    return;
  }
  if (!navigator.geolocation) {
    setMapNotice("Standort ist auf diesem Geraet nicht verfuegbar.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      clearMapNotice({ refresh: true });
      if (leafletMap) {
        focusLeafletMap(lat, lng);
        setUserMarker(lat, lng, "Deine Position");
      }
    },
    () => setMapNotice("Standort konnte nicht abgerufen werden. Bitte Berechtigung pruefen."),
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
  );
}

function updateSearchLogoNodes(biz) {
  if (!biz?.id) return;
  const bizId = escapeSelector(biz.id);
  const restaurant = state.restaurants.find((r) => r.id === biz.id) || {};
  const logoSource = restaurant.logoUrl || restaurant.logo || biz.logo || biz.image || "";
  const logoUrl = resolveRestaurantLogo(biz.id, logoSource, "avatar");
  document.querySelectorAll(`[data-search-logo="${bizId}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== logoUrl) img.setAttribute("src", logoUrl);
  });
}

function updateSearchBusinessNodes(biz) {
  if (!biz?.id) return;
  const bizId = escapeSelector(biz.id);
  const name = biz.name || "Business";
  const city = biz.city || "Prishtina";
  document.querySelectorAll(`[data-search-business="${bizId}"]`).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.dataset.searchName = name;
    const nameEl = el.querySelector("[data-search-business-name]");
    if (nameEl && nameEl.textContent !== name) nameEl.textContent = name;
    const cityEl = el.querySelector("[data-search-business-city]");
    if (cityEl && cityEl.textContent !== city) cityEl.textContent = city;
  });
  updateSearchLogoNodes(biz);
}

function updateSearchUserNodes(user) {
  if (!user?.uid) return;
  const uid = escapeSelector(user.uid);
  const handle = user.handle || normalizeHandle(user.name || "user");
  const displayName = sanitizeDisplayName(user.name, handle || "User");
  const avatarUrl = resolveSearchUserAvatarDisplay(user);
  document.querySelectorAll(`[data-search-user="${uid}"]`).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.dataset.searchHandle = handle;
    el.dataset.searchName = displayName;
    el.dataset.searchAvatar = user.avatarUrl || user.avatar || "";
    el.dataset.searchLocation = user.location || "";
    const nameEl = el.querySelector("[data-search-user-name]");
    if (nameEl && nameEl.textContent !== displayName) nameEl.textContent = displayName;
    const handleEl = el.querySelector("[data-search-user-handle]");
    const handleLabel = `@${handle}`;
    if (handleEl && handleEl.textContent !== handleLabel) handleEl.textContent = handleLabel;
    const img = el.querySelector("img");
    if (img instanceof HTMLImageElement && img.getAttribute("src") !== avatarUrl) {
      img.setAttribute("src", avatarUrl);
    }
  });
}

function normalizeBusinessResult(rest) {
  if (!isPublicBusinessRecord(rest)) return null;
  const name = rest.name || rest.restaurantName || "Business";
  return {
    id: rest.id || rest.restaurantId || "",
    name,
    city: rest.city || rest.location || rest.address || "Prishtina",
    logo: rest.logoUrl || rest.logo || rest.image || ""
  };
}

function buildBusinessResultsFromFeed(posts) {
  const map = new Map();
  posts.forEach((post) => {
    const id = post.restaurantId || post.ownerId || "";
    const key = id || String(post.business || "").toLowerCase();
    if (!key || map.has(key)) return;
    if (isForceHiddenBusinessEntity({
      id: id || key,
      restaurantId: id || key,
      ownerId: post.ownerId || "",
      ownerUid: post.ownerUid || "",
      handle: post.handle || "",
      businessName: post.business || "",
      restaurantName: post.restaurantName || "",
      ownerEmail: post.ownerEmail || "",
      email: post.email || ""
    })) {
      return;
    }
    map.set(key, {
      id: id || key,
      name: post.business || "Business",
      city: post.location || "Prishtina",
      logo: post.logo || ""
    });
  });
  return Array.from(map.values()).slice(0, SEARCH_LIMITS.businesses);
}

function buildLocalBusinessResults(queryKey) {
  const list = state.restaurants.length
    ? state.restaurants.map(normalizeBusinessResult).filter(Boolean)
    : buildBusinessResultsFromFeed(state.feedPosts);
  const localKey = normalizeSearchKey(state.userProfile.location || "");
  const isLocalQuery = queryKey === "lokal" || queryKey === "local" || (!queryKey && localKey);
  const filtered = list.filter((item) => {
    if (isLocalQuery && localKey) {
      return normalizeSearchKey(item.city).includes(localKey);
    }
    const score = Math.max(
      scoreSearchMatch(item.name, queryKey),
      scoreSearchMatch(item.city, queryKey)
    );
    return score > 0;
  }).map((item) => {
    const score = queryKey ? Math.max(
      scoreSearchMatch(item.name, queryKey),
      scoreSearchMatch(item.city, queryKey)
    ) : 0;
    return { ...item, _score: score };
  });
  return filtered.sort((a, b) => (b._score || 0) - (a._score || 0)).slice(0, SEARCH_LIMITS.businesses);
}

function normalizeUserSearchResult(doc) {
  const data = typeof doc?.data === "function" ? doc.data() : (doc?.data || doc || {});
  const rawName = data.displayName || data.name || data.handle || "";
  const handle = data.handle || normalizeHandle(rawName || "user");
  const email = data.email || data.loginEmail || data.ownerEmail || "";
  if (isForceHiddenHandle(handle || rawName) || isForceHiddenEmail(email)) return null;
  const name = sanitizeDisplayName(rawName, handle || "User");
  return {
    uid: doc?.id || data.uid || "",
    name,
    handle,
    email,
    avatar: data.avatarUrl || data.avatar || '',
    location: data.city || "Prishtina",
    followers: data.followersCount ?? data.followers ?? 0,
    following: data.followingCount ?? data.following ?? 0,
    role: data.role || "user",
    restaurantId: data.restaurantId || "",
    bio: data.bio || ""
  };
}

function isBusinessSearchUser(user) {
  const role = String(user?.role || "").toLowerCase();
  return role === "business" || !!user?.restaurantId;
}

async function searchUsersRemote(queryRaw, token) {
  if (isGuestSession()) {
    state.search.userResults = [];
    return;
  }
  const queryKey = normalizeSearchKey(queryRaw);
  const nameKey = normalizeSearchQuery(queryRaw);
  if (!queryKey) {
    state.search.userResults = [];
    return;
  }
  const cacheKey = `users:${queryKey}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    state.search.userResults = cached.filter((item) => (
      item?.uid
      && !isBusinessSearchUser(item)
      && !isForceHiddenHandle(item?.handle || item?.name || "")
      && !isForceHiddenEmail(item?.email || "")
    ));
    return;
  }
  try {
    const handleKey = normalizeHandle(queryKey);
    const users = new Map();
    if (handleKey) {
      const snap = await getDocs(query(
        collection(db, "users"),
        orderBy("handle"),
        startAt(handleKey),
        endAt(`${handleKey}\uf8ff`),
        limit(SEARCH_LIMITS.users)
      ));
      snap.forEach((docSnap) => {
        const item = normalizeUserSearchResult(docSnap);
        if (item?.uid && !isBusinessSearchUser(item)) users.set(item.uid, item);
      });
    }
    const nameVariants = new Set();
    if (nameKey) {
      nameVariants.add(nameKey);
      const cap = nameKey.charAt(0).toUpperCase() + nameKey.slice(1);
      nameVariants.add(cap);
    }
    for (const variant of nameVariants) {
      const nameSnap = await getDocs(query(
        collection(db, "users"),
        orderBy("displayName"),
        startAt(variant),
        endAt(`${variant}\uf8ff`),
        limit(SEARCH_LIMITS.users)
      ));
      nameSnap.forEach((docSnap) => {
        const item = normalizeUserSearchResult(docSnap);
        if (item?.uid && !isBusinessSearchUser(item)) users.set(item.uid, item);
      });
    }
    if (token !== searchToken) return;
    const key = normalizeSearchKey(queryRaw);
    const results = Array.from(users.values())
      .filter((item) => (
        !isBusinessSearchUser(item)
        && !isForceHiddenHandle(item?.handle || item?.name || "")
        && !isForceHiddenEmail(item?.email || "")
      ))
      .map((item) => ({
        ...item,
        _score: Math.max(
          scoreSearchMatch(item.handle, key),
          scoreSearchMatch(item.name, key)
        )
      }))
      .sort((a, b) => (b._score || 0) - (a._score || 0));
    searchCache.set(cacheKey, results);
    state.search.userResults = results;
  } catch (err) {
    if (token !== searchToken) return;
    state.search.error = "Suche fehlgeschlagen.";
  }
}

async function searchBusinessesRemote(queryRaw, token) {
  const queryKey = normalizeSearchQuery(queryRaw);
  const key = normalizeSearchKey(queryRaw);
  if (!key) return;
  const cacheKey = `biz:${key}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    state.search.businessResults = cached;
    return;
  }
  try {
    const results = new Map();
    const restRef = collection(db, "restaurants");
    try {
      const snap = await getDocs(query(
        restRef,
        orderBy("name"),
        startAt(queryKey),
        endAt(`${queryKey}\uf8ff`),
        limit(SEARCH_LIMITS.businesses)
      ));
      snap.forEach((docSnap) => {
        const row = normalizeBusinessResult({ id: docSnap.id, ...docSnap.data() });
        if (row?.id) results.set(row.id, row);
      });
    } catch {}
    try {
      const snap = await getDocs(query(
        restRef,
        orderBy("restaurantName"),
        startAt(queryKey),
        endAt(`${queryKey}\uf8ff`),
        limit(SEARCH_LIMITS.businesses)
      ));
      snap.forEach((docSnap) => {
        const row = normalizeBusinessResult({ id: docSnap.id, ...docSnap.data() });
        if (row?.id) results.set(row.id, row);
      });
    } catch {}
    if (token !== searchToken) return;
    const list = Array.from(results.values())
      .map((item) => ({
        ...item,
        _score: Math.max(
          scoreSearchMatch(item.name, key),
          scoreSearchMatch(item.city, key)
        )
      }))
      .sort((a, b) => (b._score || 0) - (a._score || 0));
    if (list.length) {
      searchCache.set(cacheKey, list);
      state.search.businessResults = list;
    }
  } catch (err) {
    if (token !== searchToken) return;
    state.search.error = "Suche fehlgeschlagen.";
  }
}

async function searchRemote(queryRaw) {
  const token = ++searchToken;
  state.search.loading = true;
  state.search.error = "";
  if (!refreshSearchView()) render();
  await Promise.all([
    searchUsersRemote(queryRaw, token),
    searchBusinessesRemote(queryRaw, token)
  ]);
  if (token === searchToken) {
    state.search.loading = false;
    if (!refreshSearchView()) render();
  }
}

function handleSearchInput(value) {
  const raw = normalizeSearchQuery(value);
  const queryKey = normalizeSearchKey(raw);
  state.search.query = raw;
  state.search.businessResults = buildLocalBusinessResults(queryKey);
  state.search.keepFocus = true;
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  if (!queryKey) {
    state.search.userResults = [];
    state.search.loading = false;
    state.search.error = "";
    if (!refreshSearchView()) render();
    return;
  }
  if (queryKey.length < 3) {
    state.search.userResults = [];
    state.search.loading = false;
    state.search.error = "";
    if (!refreshSearchView()) render();
    return;
  }
  if (!refreshSearchView()) render();
  searchTimer = window.setTimeout(() => {
    void searchRemote(raw);
  }, 450);
}

function renderMapSheet(selected) {
  const imageUrl = getOptimizedImageUrl(selected.img, "thumb");
  return `
    <div class="animate-in slide-in-from-bottom-6 duration-300">
      <div class="bg-white/95 backdrop-blur-xl rounded-[2rem] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.25)] border border-slate-100/50 relative">
        <div class="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200 rounded-full"></div>

        <button id="mapCloseBtn" class="absolute top-4 right-4 w-8 h-8 bg-slate-100/80 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
          ${icon("x", "w-4 h-4")}
        </button>

        <div class="flex gap-4 pr-6 mt-2">
          <div id="mapVisitProfileImgBtn" class="w-20 h-20 rounded-[1.5rem] bg-slate-50 p-1 border border-slate-100 shadow-sm flex-shrink-0 overflow-hidden relative group cursor-pointer">
            <img src="${escapeHtml(imageUrl)}" class="w-full h-full object-cover rounded-[1.3rem] group-hover:scale-105 transition-transform" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
          </div>
          <div class="flex-1 pt-1">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1">Restaurant</span>
            <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight line-clamp-1">${escapeHtml(selected.name || "Business")}</h3>
            <div class="flex items-center gap-2 mt-1 text-[11px] font-black text-slate-700">
              <span class="flex items-center gap-1 text-indigo-600">${icon("star", "w-3 h-3 fill-indigo-600 text-indigo-600")} ${escapeHtml(selected.rating)}</span>
              <span class="text-emerald-500 flex items-center gap-1.5 ml-2"><div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div> Geoeffnet</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-slate-500 text-[10px] font-bold line-clamp-1">
              ${icon("map-pin", "w-3 h-3")} ${escapeHtml(selected.address)}
            </div>
          </div>
        </div>

        <div class="mt-5 flex gap-3">
          <button id="mapVisitProfileBtn" class="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 hover:bg-slate-800">
            ${icon("user", "w-4 h-4")} Profil
          </button>
          <button id="mapOpenRouteBtn" class="w-14 h-[46px] bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center active:scale-95 transition-all hover:bg-indigo-100 border border-indigo-100/50">
            ${icon("navigation", "w-5 h-5")}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderMapView() {
  const hasLeaflet = !!window.L;
  const mapInfoLabel = leafletLoadFailed
    ? "Karte konnte nicht geladen werden."
    : (leafletLoadPromise ? "Karte wird geladen ..." : "Karte wird vorbereitet ...");
  return `
    <div class="p-5 pb-8 h-full flex flex-col relative animate-in fade-in duration-700">
      <div class="mb-4 px-2 flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Karte</h2>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 italic">Entdecke Lokale</p>
        </div>
      </div>

      <div class="relative flex-1 bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200/50 min-h-[500px]">
        <div id="leafletMap" class="absolute inset-0 z-10 bg-slate-200"></div>
        ${hasLeaflet ? "" : `<div class="absolute inset-0 z-20 flex items-center justify-center opacity-40 text-slate-500 text-xs font-black uppercase tracking-widest">${escapeHtml(mapInfoLabel)}</div>`}
        
        <div class="absolute top-5 left-4 right-4 z-30">
          <div id="mapNoticeSlot" class="mb-3">${renderMapNotice()}</div>
          <div class="relative group shadow-lg rounded-2xl">
            ${icon("search", "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400")}
            <input id="mapSearchInput" type="text" placeholder="Stadt, Lokal suchen..." class="w-full h-14 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl pl-12 pr-12 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/50 transition-all" />
          </div>
        </div>

        <div class="absolute bottom-6 right-4 z-30 flex flex-col gap-3">
          <button id="mapLocateBtn" class="w-12 h-12 rounded-2xl bg-indigo-600 shadow-[0_8px_20px_rgba(79,70,229,0.4)] flex items-center justify-center text-white active:scale-95 transition-all">
            ${icon("navigation", "w-5 h-5 fill-white")}
          </button>
        </div>

        <div id="mapSheetSlot" class="absolute bottom-4 left-4 right-4 z-40"></div>
      </div>
    </div>
  `;
}

function renderSearchUserItem(user) {
  const handle = user.handle || normalizeHandle(user.name || "user");
  const displayName = sanitizeDisplayName(user.name, handle || "User");
  const avatarUrl = resolveSearchUserAvatarDisplay(user);
  const avatarRaw = user.avatarUrl || user.avatar || "";
  return `
    <button data-search-user="${escapeHtml(user.uid)}" data-search-handle="${escapeHtml(handle)}" data-search-name="${escapeHtml(displayName)}" data-search-avatar="${escapeHtml(avatarRaw)}" data-search-location="${escapeHtml(user.location)}" class="w-full flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left">
      <img src="${escapeHtml(avatarUrl)}" data-img-key="search-user:${escapeHtml(user.uid)}" class="w-12 h-12 rounded-2xl object-cover bg-slate-200" />
      <div class="flex-1 min-w-0">
        <p data-search-user-name class="text-sm font-black text-slate-900 truncate">${escapeHtml(displayName)}</p>
        <p data-search-user-handle class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">@${escapeHtml(handle)}</p>
      </div>
      <span class="text-[9px] font-black text-indigo-500 uppercase tracking-widest">User</span>
    </button>
  `;
}

function renderSearchBusinessItem(biz) {
  const name = biz.name || "Business";
  const logoUrl = resolveRestaurantLogo(biz.id, biz.logo, "avatar");
  const logoAttr = biz.id ? `data-search-logo="${escapeHtml(biz.id)}"` : "";
  return `
    <button data-search-business="${escapeHtml(biz.id)}" data-search-name="${escapeHtml(name)}" class="w-full flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left">
      <img src="${escapeHtml(logoUrl)}" ${logoAttr} data-img-key="search-biz:${escapeHtml(biz.id)}" class="w-12 h-12 rounded-2xl object-contain bg-white" />
      <div class="flex-1 min-w-0">
        <p data-search-business-name class="text-sm font-black text-slate-900 truncate">${escapeHtml(name)}</p>
        <p data-search-business-city class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">${escapeHtml(biz.city)}</p>
      </div>
      <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Business</span>
    </button>
  `;
}

function renderSearchView() {
  const query = state.search.query;
  const queryKey = normalizeSearchKey(query);
  const isGuest = isGuestSession();
  const filter = String(state.search.filter || "all");
  const safeFilter = isGuest && (filter === "all" || filter === "users") ? "business" : filter;
  const users = state.search.userResults || [];
  const businesses = state.search.businessResults?.length ? state.search.businessResults : buildLocalBusinessResults(queryKey);
  const showUsers = !isGuest && (safeFilter === "all" || safeFilter === "users");
  const showBusinesses = safeFilter === "all" || safeFilter === "business" || safeFilter === "local";
  const localLabel = safeFilter === "local" || queryKey === "lokal" || queryKey === "local" ? "Lokal" : "Business";
  const hasResults = (showUsers && users.length) || (showBusinesses && businesses.length);
  const filters = isGuest
    ? [
      { id: "business", label: "Business" },
      { id: "local", label: "Lokal" }
    ]
    : [
      { id: "all", label: "Alles" },
      { id: "users", label: "User" },
      { id: "business", label: "Business" },
      { id: "local", label: "Lokal" }
    ];

  return `
    <div id="searchView" class="p-6 animate-in slide-in-from-right-10 duration-700 h-full">
      <div class="mb-6 px-1">
        <p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Entdecken</p>
        <h2 class="text-2xl font-black italic uppercase tracking-tighter">Suche</h2>
      </div>

      <div class="relative mb-5">
        <input id="searchInput" type="text" value="${escapeHtml(query)}" placeholder="Suche nach User, Name oder Lokal..." class="w-full h-14 rounded-[2rem] border border-slate-100 bg-white px-5 pr-12 text-sm font-semibold outline-none shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
        <button id="searchClearBtn" class="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-700 transition">
          ${icon("x", "w-4 h-4")}
        </button>
      </div>

      <div class="flex gap-2 mb-6">
        ${filters.map((item) => `
          <button data-search-filter="${item.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${safeFilter === item.id ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-400 border border-slate-100"}">
            ${item.label}
          </button>
        `).join("")}
      </div>

      <div id="searchStatusLoading" class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ${state.search.loading ? "" : "hidden"}">Suche...</div>
      <div id="searchStatusError" class="text-xs font-bold text-rose-500 mb-4 ${state.search.error ? "" : "hidden"}">${escapeHtml(state.search.error || "")}</div>
      <div id="searchEmptyState" class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em] ${!hasResults && !query ? "" : "hidden"}">Tippe, um zu suchen</div>

      <div id="searchUsersSection" class="space-y-4 mb-10 ${showUsers ? "" : "hidden"}">
        <div class="flex items-center justify-between px-1">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">User</p>
          <p id="searchUsersCount" class="text-[10px] font-bold text-slate-300">${users.length}</p>
        </div>
        <div id="searchUsersList" class="space-y-4">
          ${users.length ? users.map(renderSearchUserItem).join("") : (query ? `<div class="text-xs font-bold text-slate-300 px-2">Keine User gefunden.</div>` : "")}
        </div>
      </div>

      <div id="searchBizSection" class="space-y-4 ${showBusinesses ? "" : "hidden"}">
        <div class="flex items-center justify-between px-1">
          <p id="searchBizLabel" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${localLabel}</p>
          <p id="searchBizCount" class="text-[10px] font-bold text-slate-300">${businesses.length}</p>
        </div>
        <div id="searchBizList" class="space-y-4">
          ${businesses.length ? businesses.map(renderSearchBusinessItem).join("") : (query ? `<div class="text-xs font-bold text-slate-300 px-2">Keine ${localLabel} gefunden.</div>` : "")}
        </div>
      </div>
    </div>
  `;
}

function updateSearchDom() {
  const searchView = document.getElementById("searchView");
  if (!searchView) return false;

  const query = state.search.query;
  const queryKey = normalizeSearchKey(query);
  const isGuest = isGuestSession();
  const filter = String(state.search.filter || "all");
  const safeFilter = isGuest && (filter === "all" || filter === "users") ? "business" : filter;
  const users = state.search.userResults || [];
  const businesses = state.search.businessResults?.length ? state.search.businessResults : buildLocalBusinessResults(queryKey);
  const showUsers = !isGuest && (safeFilter === "all" || safeFilter === "users");
  const showBusinesses = safeFilter === "all" || safeFilter === "business" || safeFilter === "local";
  const localLabel = safeFilter === "local" || queryKey === "lokal" || queryKey === "local" ? "Lokal" : "Business";
  const hasResults = (showUsers && users.length) || (showBusinesses && businesses.length);

  const searchInput = document.getElementById("searchInput");
  if (searchInput && document.activeElement !== searchInput && searchInput.value !== query) {
    searchInput.value = query;
  }

  const loadingEl = document.getElementById("searchStatusLoading");
  if (loadingEl) loadingEl.classList.toggle("hidden", !state.search.loading);
  const errorEl = document.getElementById("searchStatusError");
  if (errorEl) {
    errorEl.textContent = state.search.error || "";
    errorEl.classList.toggle("hidden", !state.search.error);
  }
  const emptyEl = document.getElementById("searchEmptyState");
  if (emptyEl) emptyEl.classList.toggle("hidden", !!query || hasResults);

  const usersSection = document.getElementById("searchUsersSection");
  if (usersSection) usersSection.classList.toggle("hidden", !showUsers);
  const usersCount = document.getElementById("searchUsersCount");
  if (usersCount) usersCount.textContent = String(users.length);
  const usersList = document.getElementById("searchUsersList");
  if (usersList) {
    if (!users.length) {
      usersList.innerHTML = query
        ? `<div class="text-xs font-bold text-slate-300 px-2">Keine User gefunden.</div>`
        : "";
    } else {
      patchSearchUserList(users);
    }
  }

  const bizSection = document.getElementById("searchBizSection");
  if (bizSection) bizSection.classList.toggle("hidden", !showBusinesses);
  const bizLabel = document.getElementById("searchBizLabel");
  if (bizLabel) bizLabel.textContent = localLabel;
  const bizCount = document.getElementById("searchBizCount");
  if (bizCount) bizCount.textContent = String(businesses.length);
  const bizList = document.getElementById("searchBizList");
  if (bizList) {
    if (!businesses.length) {
      bizList.innerHTML = query
        ? `<div class="text-xs font-bold text-slate-300 px-2">Keine ${localLabel} gefunden.</div>`
        : "";
    } else {
      patchSearchBusinessList(businesses);
      businesses.forEach(updateSearchBusinessNodes);
    }
  }

  document.querySelectorAll("[data-search-filter]").forEach((btn) => {
    const isActive = btn.dataset.searchFilter === safeFilter;
    btn.classList.toggle("bg-slate-900", isActive);
    btn.classList.toggle("text-white", isActive);
    btn.classList.toggle("shadow-md", isActive);
    btn.classList.toggle("bg-white", !isActive);
    btn.classList.toggle("text-slate-400", !isActive);
    btn.classList.toggle("border", !isActive);
    btn.classList.toggle("border-slate-100", !isActive);
  });

  if (window.lucide?.createIcons) window.lucide.createIcons();
  return true;
}

function patchSearchBusinessList(businesses) {
  const bizList = document.getElementById("searchBizList");
  if (!bizList) return false;
  const existingItems = Array.from(bizList.querySelectorAll("[data-search-business]"));
  const currentIds = existingItems.map((el) => el.dataset.searchBusiness || "");
  const nextIds = businesses.map((biz) => String(biz.id || ""));
  if (currentIds.join("|") === nextIds.join("|")) {
    return true;
  }
  const existingMap = new Map();
  existingItems.forEach((el) => existingMap.set(el.dataset.searchBusiness || "", el));
  const fragment = document.createDocumentFragment();
  businesses.forEach((biz) => {
    const id = String(biz.id || "");
    const existing = id ? existingMap.get(id) : null;
    if (existing) {
      existingMap.delete(id);
      fragment.appendChild(existing);
    } else {
      const tpl = document.createElement("template");
      tpl.innerHTML = renderSearchBusinessItem(biz);
      const node = tpl.content.firstElementChild;
      if (node) fragment.appendChild(node);
    }
  });
  bizList.replaceChildren(fragment);
  return true;
}

function refreshSearchView() {
  if (state.activeTab === "search" && getLastRenderMode() === "main") {
    if (updateSearchDom()) return true;
  }
  return false;
}

function patchSearchUserList(users) {
  const usersList = document.getElementById("searchUsersList");
  if (!usersList) return false;
  const existingItems = Array.from(usersList.querySelectorAll("[data-search-user]"));
  const currentIds = existingItems.map((el) => el.dataset.searchUser || "");
  const nextIds = users.map((user) => String(user.uid || ""));
  if (currentIds.join("|") === nextIds.join("|")) {
    users.forEach(updateSearchUserNodes);
    return true;
  }
  const existingMap = new Map();
  existingItems.forEach((el) => existingMap.set(el.dataset.searchUser || "", el));
  const fragment = document.createDocumentFragment();
  users.forEach((user) => {
    const id = String(user.uid || "");
    const existing = id ? existingMap.get(id) : null;
    if (existing) {
      existingMap.delete(id);
      fragment.appendChild(existing);
    } else {
      const tpl = document.createElement("template");
      tpl.innerHTML = renderSearchUserItem(user);
      const node = tpl.content.firstElementChild;
      if (node) fragment.appendChild(node);
    }
  });
  usersList.replaceChildren(fragment);
  users.forEach(updateSearchUserNodes);
  return true;
}

  return {
    ensureLeafletStylesheet,
    ensureLeafletLoaded,
    buildRestaurantLocations,
    cleanupLeaflet,
    getDiscoverableMapLocations,
    updateMapSheet,
    initLeafletIfNeeded,
    renderLeafletMarkers,
    filterMapLocationsByQuery,
    bindMapSearchInput,
    mapLocate,
    renderMapSheet,
    renderMapView,
    updateSearchLogoNodes,
    updateSearchBusinessNodes,
    updateSearchUserNodes,
    buildLocalBusinessResults,
    handleSearchInput,
    renderSearchView,
    updateSearchDom,
    patchSearchBusinessList,
    refreshSearchView,
    patchSearchUserList
  };
}
