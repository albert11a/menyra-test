function toFiniteLocationNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function readRestaurantAddress(entry = {}) {
  return String(
    entry?.address
    || entry?.streetAddress
    || entry?.fullAddress
    || ""
  ).trim();
}

function readLocationEntryAddress(entry = {}) {
  return String(entry?.address || entry?.label || entry?.name || "").trim();
}

function readLocationEntryCoords(entry = {}) {
  const coords = entry?.coords && typeof entry.coords === "object" ? entry.coords : {};
  const geo = entry?.geo && typeof entry.geo === "object" ? entry.geo : {};
  return {
    lat: toFiniteLocationNumber(
      entry?.lat
      ?? entry?.latitude
      ?? entry?.gpsLat
      ?? coords?.lat
      ?? coords?.latitude
      ?? geo?.lat
      ?? geo?.latitude
    ),
    lng: toFiniteLocationNumber(
      entry?.lng
      ?? entry?.lon
      ?? entry?.longitude
      ?? entry?.gpsLng
      ?? coords?.lng
      ?? coords?.longitude
      ?? coords?.lon
      ?? geo?.lng
      ?? geo?.longitude
      ?? geo?.lon
    )
  };
}

function normalizeRestaurantLocationEntries(entries = []) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => {
      const address = readLocationEntryAddress(entry);
      const coords = readLocationEntryCoords(entry);
      if (!(address || (coords.lat !== null && coords.lng !== null))) return null;
      const normalized = {};
      if (address) normalized.address = address;
      if (coords.lat !== null) normalized.lat = coords.lat;
      if (coords.lng !== null) normalized.lng = coords.lng;
      return normalized;
    })
    .filter(Boolean)
    .slice(0, 12);
}

export function hasRestaurantLocationTruth(restaurant = {}) {
  if (!restaurant || typeof restaurant !== "object") return false;
  if (readRestaurantAddress(restaurant)) return true;
  const coords = readLocationEntryCoords(restaurant);
  if (coords.lat !== null && coords.lng !== null) return true;
  return normalizeRestaurantLocationEntries(restaurant.locations).length > 0;
}

export function buildRestaurantLocationPatch(restaurant = {}) {
  const patch = {};
  const address = readRestaurantAddress(restaurant);
  const location = String(restaurant?.location || "").trim();
  const coords = readLocationEntryCoords(restaurant);
  const locations = normalizeRestaurantLocationEntries(restaurant.locations);
  const hasCoords = coords.lat !== null && coords.lng !== null;

  if (address) patch.address = address;
  if (location) patch.location = location;
  if (coords.lat !== null) patch.lat = coords.lat;
  if (coords.lng !== null) patch.lng = coords.lng;
  if (locations.length) patch.locations = locations;
  if (hasCoords) {
    patch.coords = { lat: coords.lat, lng: coords.lng };
    patch.geo = { lat: coords.lat, lng: coords.lng };
  }

  return patch;
}

function serializeRestaurantLocationEntry(entry = {}) {
  return [
    String(entry?.address || "").trim(),
    Number.isFinite(Number(entry?.lat)) ? Number(entry.lat) : "",
    Number.isFinite(Number(entry?.lng)) ? Number(entry.lng) : ""
  ].join("::");
}

export function buildRestaurantIdentitySignature(restaurants = []) {
  return (Array.isArray(restaurants) ? restaurants : [])
    .map((rest) => {
      const patch = buildRestaurantLocationPatch(rest);
      const coords = patch.coords && typeof patch.coords === "object" ? patch.coords : {};
      const locations = Array.isArray(patch.locations)
        ? patch.locations.map((entry) => serializeRestaurantLocationEntry(entry)).join("^")
        : "";
      return [
        String(rest?.id || "").trim(),
        String(rest?.name || rest?.restaurantName || rest?.displayName || rest?.businessName || "").trim(),
        String(rest?.restaurantName || "").trim(),
        String(rest?.logoUrl || rest?.logo || rest?.logoURL || "").trim(),
        String(rest?.city || "").trim(),
        String(rest?.type || rest?.customerType || rest?.category || rest?.kind || rest?.restaurantType || "").trim(),
        String(patch.address || "").trim(),
        String(patch.location || "").trim(),
        Number.isFinite(Number(coords?.lat)) ? Number(coords.lat) : "",
        Number.isFinite(Number(coords?.lng)) ? Number(coords.lng) : "",
        locations
      ].join("|");
    })
    .join(",");
}

export function createRestaurantIdentityRuntimeController({
  state = null,
  db = null,
  docFn = null,
  getDocFn = async () => null,
  normalizeRestaurantType = (value) => value,
  isGenericStoryBusinessLabel = () => false,
  queueMicrotaskFn = null,
  buildRestaurantLocationsFn = () => [],
  resolveRestaurantLogoFn = (_restaurantId, source = "") => String(source || ""),
  isPublicBusinessRecordFn = () => true,
  syncFeedPostLogos = () => false,
  refreshFeedStories = () => false,
  render = () => {},
  updateFeedDom = () => {},
  getLastRenderMode = () => ""
} = {}) {
  const queueMicrotaskSafe = typeof queueMicrotaskFn === "function"
    ? queueMicrotaskFn
    : ((fn) => fn?.());
  const getDocSafe = typeof getDocFn === "function" ? getDocFn : (async () => null);
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const buildRestaurantLocations = typeof buildRestaurantLocationsFn === "function"
    ? buildRestaurantLocationsFn
    : (() => []);
  const resolveRestaurantLogo = typeof resolveRestaurantLogoFn === "function"
    ? resolveRestaurantLogoFn
    : ((_restaurantId, source = "") => String(source || ""));
  const isPublicBusinessRecord = typeof isPublicBusinessRecordFn === "function"
    ? isPublicBusinessRecordFn
    : (() => true);
  const pendingStoryIdentityHydrationIds = new Set();
  const restaurantMetaUnsubs = new Map();
  let storyIdentityHydrationQueued = false;

  function mergeRestaurants(existing = [], additions = []) {
    if (!additions.length) return existing;
    const orderedIds = [];
    const map = new Map();
    existing.forEach((rest) => {
      if (!rest?.id) return;
      orderedIds.push(rest.id);
      map.set(rest.id, rest);
    });
    additions.forEach((rest) => {
      if (!rest?.id) return;
      if (!map.has(rest.id)) orderedIds.push(rest.id);
      const previous = map.get(rest.id) || {};
      map.set(rest.id, { ...previous, ...rest });
    });
    return orderedIds.map((id) => map.get(id)).filter(Boolean);
  }

  function collectFeedHydrationIds(feedRows = [], { max = 6 } = {}) {
    if (!Array.isArray(feedRows) || !feedRows.length) return [];
    const existing = new Map((state?.restaurants || []).map((rest) => [String(rest?.id || "").trim(), rest]));
    const ids = [];
    const seen = new Set();
    for (const row of feedRows) {
      if (ids.length >= max) break;
      const rid = String(row?.restaurantId || row?.rid || row?.ownerId || "").trim();
      if (!rid || seen.has(rid)) continue;
      seen.add(rid);
      const cached = existing.get(rid) || null;
      const cachedName = String(cached?.name || cached?.restaurantName || cached?.displayName || "").trim();
      const cachedLogo = String(cached?.logoUrl || cached?.logo || cached?.logoURL || "").trim();
      const hasCachedName = !!cachedName && !isGenericStoryBusinessLabel(cachedName);
      const rowName = String(row?.businessName || row?.restaurantName || row?.business || "").trim();
      const hasRowName = !!rowName && !isGenericStoryBusinessLabel(rowName);
      const rowLogo = String(row?.logoUrl || row?.logo || row?.logoURL || "").trim();
      if ((hasCachedName && cachedLogo) || (hasRowName && rowLogo)) continue;
      ids.push(rid);
    }
    return ids;
  }

  function collectStoryHydrationIds(storyRows = [], { max = 12 } = {}) {
    if (!Array.isArray(storyRows) || !storyRows.length) return [];
    const existing = new Map((state?.restaurants || []).map((rest) => [String(rest?.id || "").trim(), rest]));
    const ids = [];
    const seen = new Set();
    for (const row of storyRows) {
      if (ids.length >= max) break;
      const rid = String(row?.restaurantId || row?.id || row?.rid || "").trim();
      if (!rid || seen.has(rid)) continue;
      seen.add(rid);
      const cached = existing.get(rid) || null;
      const cachedName = String(
        cached?.name
        || cached?.restaurantName
        || cached?.displayName
        || cached?.businessName
        || ""
      ).trim();
      const cachedLogo = String(cached?.logoUrl || cached?.logo || cached?.logoURL || "").trim();
      const hasCachedName = !!cachedName && !isGenericStoryBusinessLabel(cachedName);
      const hasCachedLogo = !!cachedLogo;
      if (hasCachedName && hasCachedLogo) continue;
      ids.push(rid);
    }
    return ids;
  }

  function queueStoryIdentityHydration(storyRows = state?.stories, { max = 12 } = {}) {
    const ids = collectStoryHydrationIds(storyRows, { max });
    if (!ids.length) return;
    ids.forEach((id) => pendingStoryIdentityHydrationIds.add(id));
    if (storyIdentityHydrationQueued) return;
    storyIdentityHydrationQueued = true;
    queueMicrotaskSafe(() => {
      storyIdentityHydrationQueued = false;
      const nextIds = Array.from(pendingStoryIdentityHydrationIds);
      pendingStoryIdentityHydrationIds.clear();
      if (!nextIds.length) return;
      void hydrateRestaurantsByIds(nextIds, { max: nextIds.length });
    });
  }

  function rebuildBusinessLocations() {
    state.businessLocations = (state?.restaurants || [])
      .filter((rest) => isPublicBusinessRecord(rest))
      .flatMap((rest, idx) => buildRestaurantLocations(rest, idx));
    (state?.restaurants || []).forEach((rest) => {
      if (!rest?.id) return;
      const rawLogo = rest.logoUrl || rest.logo || rest.logoURL || "";
      if (rawLogo) resolveRestaurantLogo(rest.id, rawLogo, "avatar");
    });
  }

  function mergeRestaurantMeta(rest, meta) {
    if (!rest) return rest;
    const data = meta || {};
    const name = data.name || data.restaurantName || rest.name || rest.restaurantName || "";
    const logoUrl = data.logoUrl || data.logo || rest.logoUrl || rest.logo || rest.logoURL || "";
    const type = normalizeRestaurantType(
      data.type
      || data.customerType
      || rest.type
      || rest.customerType
      || rest.category
      || rest.kind
      || rest.restaurantType
      || ""
    );
    return {
      ...rest,
      name: name || rest.name || "",
      restaurantName: rest.restaurantName || "",
      logoUrl,
      city: data.city || rest.city || "",
      ...(type ? { type, customerType: type } : {})
    };
  }

  function stopRestaurantMetaListeners() {
    restaurantMetaUnsubs.forEach((unsub) => {
      try { unsub(); } catch {}
    });
    restaurantMetaUnsubs.clear();
  }

  function ensureFeedRestaurantMetaListeners(feedPosts = state?.feedPosts, { limit = 12 } = {}) {
    void feedPosts;
    void limit;
    stopRestaurantMetaListeners();
  }

  async function enrichRestaurantsWithPublicMeta(restaurants) {
    if (!Array.isArray(restaurants) || !restaurants.length) return restaurants || [];
    const lookups = restaurants.map((rest) => {
      const rid = rest?.id || "";
      if (!rid || !makeDocRef || !db) return Promise.resolve(null);
      const hasCoreName = !!String(rest?.name || rest?.restaurantName || "").trim();
      const hasCoreLogo = !!String(rest?.logoUrl || rest?.logo || rest?.logoURL || "").trim();
      const hasCoreCity = !!String(rest?.city || "").trim();
      const hasCoreType = !!normalizeRestaurantType(
        rest?.type
        || rest?.customerType
        || rest?.category
        || rest?.kind
        || rest?.restaurantType
        || ""
      );
      if (hasCoreName && hasCoreLogo && hasCoreCity && hasCoreType) {
        return Promise.resolve(null);
      }
      return getDocSafe(makeDocRef(db, "restaurants", rid, "public", "meta")).catch(() => null);
    });
    const metaSnaps = await Promise.all(lookups);
    return restaurants.map((rest, idx) => {
      const snap = metaSnaps[idx];
      const meta = snap && typeof snap.exists === "function" && snap.exists() ? (snap.data() || {}) : {};
      return mergeRestaurantMeta(rest, meta);
    });
  }

  async function hydrateRestaurantsByIds(restaurantIds, { max = 24, requireLocation = false } = {}) {
    if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) return;
    const uniqueIds = Array.from(new Set(restaurantIds.filter(Boolean)));
    if (!uniqueIds.length) return;
    const existing = new Map((state?.restaurants || []).map((rest) => [rest.id, rest]));
    const missing = uniqueIds.filter((id) => {
      const stored = existing.get(id);
      if (!stored) return true;
      const name = String(
        stored.name
        || stored.restaurantName
        || stored.displayName
        || stored.businessName
        || ""
      ).trim();
      const logo = String(stored.logoUrl || stored.logo || stored.logoURL || "").trim();
      const hasUsableName = !!name && !isGenericStoryBusinessLabel(name);
      const hasUsableLogo = !!logo;
      const hasLocationTruth = hasRestaurantLocationTruth(stored);
      return !(hasUsableName && hasUsableLogo) || (requireLocation && !hasLocationTruth);
    }).slice(0, max);
    if (missing.length === 0 || !makeDocRef || !db) return;

    const loaded = (await Promise.all(missing.map(async (rid) => {
      try {
        const stored = existing.get(rid) || {};
        let metaData = {};
        try {
          const metaSnap = await getDocSafe(makeDocRef(db, "restaurants", rid, "public", "meta"));
          if (metaSnap.exists()) metaData = metaSnap.data() || {};
        } catch {}

        let restData = stored;
        const currentName = metaData.name || metaData.restaurantName || stored.name || stored.restaurantName || "";
        const currentLogo = metaData.logoUrl || metaData.logo || stored.logoUrl || stored.logo || stored.logoURL || "";
        const needsFullRestaurantDoc = requireLocation && !hasRestaurantLocationTruth(stored);
        if (!currentName || !currentLogo || needsFullRestaurantDoc) {
          try {
            const restSnap = await getDocSafe(makeDocRef(db, "restaurants", rid));
            if (restSnap.exists()) {
              restData = { ...restData, ...(restSnap.data() || {}) };
            }
          } catch {}
        }

        const name = metaData.name || metaData.restaurantName || restData.name || restData.restaurantName || "";
        const logoUrl = metaData.logoUrl || metaData.logo || restData.logoUrl || restData.logo || restData.logoURL || "";
        const city = metaData.city || restData.city || "";
        const type = normalizeRestaurantType(
          metaData.type
          || metaData.customerType
          || restData.type
          || restData.customerType
          || restData.category
          || restData.kind
          || restData.restaurantType
          || ""
        );
        const locationPatch = buildRestaurantLocationPatch(restData);
        if (!(name || logoUrl || city || type || hasRestaurantLocationTruth(restData))) return null;
        return {
          id: rid,
          name,
          restaurantName: restData.restaurantName || "",
          logoUrl,
          city,
          ...(type ? { type, customerType: type } : {}),
          ...locationPatch
        };
      } catch (err) {
        console.warn("hydrateRestaurantsByIds failed for", rid, err);
        return null;
      }
    }))).filter(Boolean);

    if (loaded.length) {
      state.restaurants = mergeRestaurants(state.restaurants, loaded);
      rebuildBusinessLocations();
      const feedUpdated = syncFeedPostLogos();
      const storiesUpdated = state?.stories?.length ? false : refreshFeedStories({ force: true });
      if ((feedUpdated || storiesUpdated) && state?.activeTab === "feed" && getLastRenderMode() === "main") {
        updateFeedDom();
      } else if (feedUpdated || storiesUpdated) {
        render();
      }
    }
  }

  return {
    collectFeedHydrationIds,
    queueStoryIdentityHydration,
    hydrateRestaurantsByIds,
    mergeRestaurants,
    rebuildBusinessLocations,
    stopRestaurantMetaListeners,
    ensureFeedRestaurantMetaListeners,
    enrichRestaurantsWithPublicMeta
  };
}
