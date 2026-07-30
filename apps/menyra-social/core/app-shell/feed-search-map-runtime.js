import {
  isBackgroundPreloadDiscouragedCore,
  scheduleIdleCore
} from "../common/task-schedule-utils.js";

// Der Karten-/Such-Chunk wird schon nach dem Start im Idle geholt, damit der
// Tab-Wechsel direkt die finale Karte rendert statt erst einen Platzhalter.
const DISCOVERY_RUNTIME_BOOT_PRELOAD_IDLE_TIMEOUT_MS = 2600;
const DISCOVERY_RUNTIME_BOOT_PRELOAD_FALLBACK_MS = 1400;
// Ein abgebrochener Chunk-Load (Tunnel, Netzwechsel) darf den Platzhalter nicht
// dauerhaft stehen lassen - deshalb Wiederholungen mit steigendem Abstand.
const DISCOVERY_RUNTIME_LOAD_RETRY_DELAYS_MS = [400, 1200, 2600, 6000];

function normalizeDeferredDiscoveryCoords(value = null) {
  const lat = Number(value?.lat ?? value?.latitude ?? value?.y);
  const lng = Number(value?.lng ?? value?.lon ?? value?.longitude ?? value?.x);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function buildRestaurantLocationsFallback(rest = {}, idx = 0) {
  const city = String(rest?.city || "").trim();
  const address = String(rest?.address || rest?.location || "").trim();
  const sourceRows = Array.isArray(rest?.locations) && rest.locations.length ? rest.locations : [null];
  return sourceRows
    .map((location, locationIndex) => {
      const coords = normalizeDeferredDiscoveryCoords(location) || normalizeDeferredDiscoveryCoords(rest);
      if (!coords) return null;
      return {
        id: rest?.id,
        markerKey: `${rest?.id || "biz"}:${locationIndex}`,
        locationIndex,
        name: rest?.name || rest?.restaurantName || "Business",
        type: rest?.type || "food",
        lat: coords.lat,
        lng: coords.lng,
        city: String(location?.city || city).trim(),
        address: String(location?.address || address).trim(),
        hours: rest?.hours || rest?.openHours || "08:00 - 23:00",
        rating: rest?.rating || rest?.score || 4.8,
        img: rest?.logoUrl || rest?.logo || rest?.heroUrl || rest?.coverUrl || "",
        desc: rest?.description || rest?.bio || "Offizielles Lokal.",
        hasVerifiedCoords: true,
        locationStatus: "verified",
        raw: rest,
        sourceIndex: idx
      };
    })
    .filter(Boolean);
}

function asFn(candidate, fallback = () => undefined) {
  return typeof candidate === "function" ? candidate : fallback;
}

function createFeedRuntimeBridge(feed = {}) {
  return {
    renderHomeView: asFn(feed.renderHomeView, () => ""),
    renderFeedView: asFn(feed.renderFeedView, () => ""),
    renderStoryItem: asFn(feed.renderStoryItem, () => ""),
    renderStoriesRow: asFn(feed.renderStoriesRow, () => ""),
    renderFeedItem: asFn(feed.renderFeedItem, () => ""),
    renderFeedList: asFn(feed.renderFeedList, () => ""),
    patchFeedList: asFn(feed.patchFeedList, () => false),
    patchStoriesRow: asFn(feed.patchStoriesRow, () => false),
    updateFeedDom: asFn(feed.updateFeedDom, () => false),
    bindFeedDelegation: asFn(feed.bindFeedDelegation, () => {})
  };
}

export function createFeedSearchMapRouteRuntime({
  feed = {},
  discovery = {}
} = {}) {
  const feedBridge = createFeedRuntimeBridge(feed);
  const openProfileViewFromBusiness = asFn(discovery.openProfileViewFromBusiness, () => {});
  let discoveryRuntimeController = null;
  let discoveryRuntimeControllerPromise = null;

  const createDiscoveryRuntimeControllerAsync = async () => {
    const module = await import("../discovery/discovery-runtime-controller.js");
    const createDiscoveryRuntimeController = module?.createDiscoveryRuntimeController;
    if (typeof createDiscoveryRuntimeController !== "function") {
      throw new Error("createDiscoveryRuntimeController unavailable");
    }
    return createDiscoveryRuntimeController({
      state: discovery.state,
      brandUi: discovery.brandUi,
      documentObj: discovery.documentObj,
      windowObj: discovery.windowObj,
      navigatorObj: discovery.navigatorObj,
      LEAFLET_JS_URL: discovery.leafletJsUrl,
      LEAFLET_CSS_URL: discovery.leafletCssUrl,
      searchLimits: discovery.searchLimits,
      placeholderImage: discovery.placeholderImage,
      getGeoFn: discovery.getGeo,
      normalizeLeadLocationsFn: discovery.normalizeLeadLocations,
      resolveCoordsFromEntityFn: discovery.resolveCoordsFromEntity,
      normalizeCoordPairFn: discovery.normalizeCoordPair,
      preferStableCoordsFn: discovery.preferStableCoords,
      isPlaceholderUrlFn: discovery.isPlaceholderUrl,
      escapeHtmlFn: discovery.escapeHtml,
      isPublicBusinessRecordFn: discovery.isPublicBusinessRecord,
      normalizeRestaurantTypeFn: discovery.normalizeRestaurantType,
      openProfileViewFromBusinessFn: (input, options = {}) => openProfileViewFromBusiness(input, options),
      renderFn: discovery.render,
      getSelfAvatarUrlFn: discovery.getSelfAvatarUrl,
      isCeoUserFn: discovery.isCeoUser,
      getCeoGpsOverrideFn: discovery.getCeoGpsOverride,
      getVerifiedMapLocationFn: discovery.getVerifiedMapLocation,
      alertFn: discovery.alert,
      iconFn: discovery.icon,
      getOptimizedImageUrlFn: discovery.getOptimizedImageUrl,
      resolveRestaurantLogoFn: discovery.resolveRestaurantLogo,
      normalizeSearchKeyFn: discovery.normalizeSearchKey,
      normalizeSearchQueryFn: discovery.normalizeSearchQuery,
      scoreSearchMatchFn: discovery.scoreSearchMatch,
      sanitizeDisplayNameFn: discovery.sanitizeDisplayName,
      normalizeHandleFn: discovery.normalizeHandle,
      resolveSearchUserAvatarDisplayFn: discovery.resolveSearchUserAvatarDisplay,
      isForceHiddenBusinessEntityFn: discovery.isForceHiddenBusinessEntity,
      isForceHiddenHandleFn: discovery.isForceHiddenHandle,
      isForceHiddenEmailFn: discovery.isForceHiddenEmail,
      isGuestSessionFn: discovery.isGuestSession,
      escapeSelectorFn: discovery.escapeSelector,
      collectionFn: discovery.collection,
      queryFn: discovery.query,
      orderByFn: discovery.orderBy,
      startAtFn: discovery.startAt,
      endAtFn: discovery.endAt,
      limitFn: discovery.limit,
      getDocsFn: discovery.getDocs,
      db: discovery.db,
      getLastRenderModeFn: discovery.getLastRenderMode
    });
  };

  let discoveryRuntimeLoadFailures = 0;
  let discoveryRuntimeRetryQueued = false;

  const resolveDiscoveryWindow = () => discovery.windowObj
    || (typeof globalThis.window === "undefined" ? null : globalThis.window);

  const scheduleDiscoveryRuntimeRetry = () => {
    if (discoveryRuntimeController || discoveryRuntimeRetryQueued) return;
    const delayMs = DISCOVERY_RUNTIME_LOAD_RETRY_DELAYS_MS[discoveryRuntimeLoadFailures - 1];
    if (!Number.isFinite(delayMs)) return;
    const win = resolveDiscoveryWindow();
    if (!win || typeof win.setTimeout !== "function") return;
    discoveryRuntimeRetryQueued = true;
    win.setTimeout(() => {
      discoveryRuntimeRetryQueued = false;
      if (discoveryRuntimeController) return;
      void ensureDiscoveryRuntimeController().catch(() => null);
    }, delayMs);
  };

  const ensureDiscoveryRuntimeController = async () => {
    if (discoveryRuntimeController) return discoveryRuntimeController;
    if (discoveryRuntimeControllerPromise) return discoveryRuntimeControllerPromise;
    discoveryRuntimeControllerPromise = createDiscoveryRuntimeControllerAsync()
      .then((controller) => {
        discoveryRuntimeController = controller;
        discoveryRuntimeLoadFailures = 0;
        discovery.render?.();
        return controller;
      })
      .catch((err) => {
        discoveryRuntimeControllerPromise = null;
        discoveryRuntimeLoadFailures += 1;
        scheduleDiscoveryRuntimeRetry();
        throw err;
      });
    return discoveryRuntimeControllerPromise;
  };

  const queueDiscoveryRuntimeControllerLoad = () => {
    void ensureDiscoveryRuntimeController().catch(() => null);
  };

  // Nach dem Start im Idle vorladen: dadurch liegt der Controller schon bereit,
  // wenn Karte oder Suche geoeffnet werden, und er kann Leaflet selbst
  // vorwaermen. Public-Website-Start (QR/Menu) bleibt unangetastet.
  const scheduleDiscoveryRuntimeBootPreload = () => {
    const win = resolveDiscoveryWindow();
    if (!win) return;
    if (win.__MENYRA_SOCIAL_PUBLIC_WEBSITE_STARTUP__ === true) return;
    const navigatorObj = discovery.navigatorObj || win.navigator || null;
    if (isBackgroundPreloadDiscouragedCore({ navigatorObj })) return;
    scheduleIdleCore({
      fn: queueDiscoveryRuntimeControllerLoad,
      windowObj: win,
      timeout: DISCOVERY_RUNTIME_BOOT_PRELOAD_IDLE_TIMEOUT_MS,
      fallbackDelayMs: DISCOVERY_RUNTIME_BOOT_PRELOAD_FALLBACK_MS
    });
  };

  const renderDeferredDiscoveryView = (mode = "search") => {
    queueDiscoveryRuntimeControllerLoad();
    if (mode === "map") {
      // Bewusst dieselbe Struktur wie renderMapView(): map-view-root /
      // map-view-surface. Auf dem Handy ist die Flaeche damit sofort formatfuellend
      // und der Wechsel auf die echte Karte bleibt unsichtbar - vorher sprang hier
      // eine kleine gerundete Kachel auf die Vollbild-Karte.
      return `
        <div class="map-view-root animate-in fade-in duration-700">
          <div class="map-view-intro">
            <div>
              <h2 class="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Harta</h2>
              <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 italic">Zbulo lokale</p>
            </div>
          </div>
          <div class="map-view-surface">
            <div class="absolute inset-0 z-10 bg-slate-200" data-map-deferred-surface="1"></div>
            <div class="absolute inset-0 z-20 flex items-center justify-center opacity-40 text-slate-500 text-xs font-black uppercase tracking-widest">
              Harta po ngarkohet ...
            </div>
          </div>
        </div>
      `;
    }
    return `
      <div id="searchView" class="p-6 animate-in slide-in-from-right-10 duration-500 h-full">
        <div class="mb-6 px-1">
          <p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Zbulo</p>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Kerkimi</h2>
        </div>
        <div class="relative mb-5">
          <input type="text" value="${String(discovery.state?.search?.query || "")}" placeholder="Kerkimi po pergatitet ..." class="w-full h-14 rounded-[2rem] border border-slate-100 bg-white px-5 pr-12 text-sm font-semibold outline-none shadow-sm" readonly />
        </div>
        <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Kerkimi po ngarkohet ...
        </div>
      </div>
    `;
  };

  const discoveryBridge = {
    buildRestaurantLocations: (rest, idx) => buildRestaurantLocationsFallback(rest, idx),
    ensureLeafletLoaded: async (...args) => {
      const controller = await ensureDiscoveryRuntimeController();
      return await controller.ensureLeafletLoaded(...args);
    },
    cleanupLeaflet: (...args) => discoveryRuntimeController?.cleanupLeaflet?.(...args),
    updateMapSheet: (...args) => discoveryRuntimeController?.updateMapSheet?.(...args) || false,
    initLeafletIfNeeded: (...args) => {
      if (!discoveryRuntimeController) {
        queueDiscoveryRuntimeControllerLoad();
        return false;
      }
      return discoveryRuntimeController.initLeafletIfNeeded(...args);
    },
    mapLocate: (...args) => {
      queueDiscoveryRuntimeControllerLoad();
      if (!discoveryRuntimeController) return false;
      return discoveryRuntimeController.mapLocate(...args);
    },
    renderMapView: (...args) => {
      if (!discoveryRuntimeController) return renderDeferredDiscoveryView("map");
      return discoveryRuntimeController.renderMapView(...args);
    },
    buildLocalBusinessResults: (...args) => {
      if (!discoveryRuntimeController) {
        queueDiscoveryRuntimeControllerLoad();
        return [];
      }
      return discoveryRuntimeController.buildLocalBusinessResults(...args);
    },
    handleSearchInput: (...args) => {
      const [value] = args;
      if (discovery.state?.search) {
        discovery.state.search.query = String(value || "");
      }
      queueDiscoveryRuntimeControllerLoad();
      if (!discoveryRuntimeController) return;
      return discoveryRuntimeController.handleSearchInput(...args);
    },
    renderSearchView: (...args) => {
      if (!discoveryRuntimeController) return renderDeferredDiscoveryView("search");
      return discoveryRuntimeController.renderSearchView(...args);
    },
    refreshSearchView: (...args) => {
      if (!discoveryRuntimeController) {
        queueDiscoveryRuntimeControllerLoad();
        return false;
      }
      return discoveryRuntimeController.refreshSearchView(...args);
    }
  };

  const routeRuntimes = Object.freeze({
    feed: Object.freeze({
      key: "feed",
      render: feedBridge.renderFeedView,
      preload: () => {}
    }),
    search: Object.freeze({
      key: "search",
      render: discoveryBridge.renderSearchView,
      preload: queueDiscoveryRuntimeControllerLoad,
      ensureLoaded: ensureDiscoveryRuntimeController
    }),
    map: Object.freeze({
      key: "map",
      render: discoveryBridge.renderMapView,
      preload: queueDiscoveryRuntimeControllerLoad,
      ensureLoaded: ensureDiscoveryRuntimeController
    })
  });

  scheduleDiscoveryRuntimeBootPreload();

  return Object.freeze({
    routeRuntimes,
    bridgeBindings: Object.freeze({
      ...feedBridge,
      ...discoveryBridge
    }),
    ensureDiscoveryRuntimeController
  });
}
