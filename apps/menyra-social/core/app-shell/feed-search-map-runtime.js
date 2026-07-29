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

  const ensureDiscoveryRuntimeController = async () => {
    if (discoveryRuntimeController) return discoveryRuntimeController;
    if (discoveryRuntimeControllerPromise) return discoveryRuntimeControllerPromise;
    discoveryRuntimeControllerPromise = createDiscoveryRuntimeControllerAsync()
      .then((controller) => {
        discoveryRuntimeController = controller;
        discovery.render?.();
        return controller;
      })
      .catch((err) => {
        discoveryRuntimeControllerPromise = null;
        throw err;
      });
    return discoveryRuntimeControllerPromise;
  };

  const queueDiscoveryRuntimeControllerLoad = () => {
    void ensureDiscoveryRuntimeController().catch(() => null);
  };

  const renderDeferredDiscoveryView = (mode = "search") => {
    queueDiscoveryRuntimeControllerLoad();
    if (mode === "map") {
      return `
        <div class="p-5 pb-8 h-full flex flex-col relative animate-in fade-in duration-500">
          <div class="mb-4 px-2 flex justify-between items-end">
            <div>
              <h2 class="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Karte</h2>
              <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 italic">Harta po pergatitet</p>
            </div>
          </div>
          <div class="relative flex-1 bg-slate-200 rounded-[2.5rem] overflow-hidden border border-slate-200/50 min-h-[500px]">
            <div class="absolute inset-0 z-10 bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-black uppercase tracking-widest">
              Harta po ngarkohet ...
            </div>
          </div>
        </div>
      `;
    }
    return `
      <div id="searchView" class="p-6 animate-in slide-in-from-right-10 duration-500 h-full">
        <div class="mb-6 px-1">
          <p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Entdecken</p>
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

  return Object.freeze({
    routeRuntimes,
    bridgeBindings: Object.freeze({
      ...feedBridge,
      ...discoveryBridge
    }),
    ensureDiscoveryRuntimeController
  });
}
