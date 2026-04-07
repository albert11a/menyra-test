export function createFeedViewOrchestrationController({
  state = null,
  toDateSafeFn = (value) => value,
  getStoriesRowSignatureFn = () => "",
  setStoriesRowSignatureFn = () => {},
  FAST_MODE = false,
  buildStoriesFromFeedFn = () => [],
  updateStoryLogoNodesFn = () => {},
  updateStoryMetaNodesFn = () => {},
  updateFeedLogoNodesFn = () => {},
  updatePostCountNodesFn = () => {},
  ensureFeedRestaurantMetaListenersFn = () => {},
  preloadFeedHeroImagesFn = () => {},
  buildStoriesRowSignatureFn = () => "",
  documentObj = null,
  windowObj = null,
  isLocalBusinessProfileFn = () => false,
  iconFn = () => "",
  escapeHtmlFn = (value) => String(value || ""),
  buildUrlFn = () => "",
  buildStoryViewerUrlFn = (restaurantId = "") => buildUrlFn("apps/menyra-social/index.html", { r: restaurantId, tab: "profile" }),
  resolveRestaurantLogoFn = () => "",
  resolveStoryRenderIdentityFn = null,
  getOptimizedImageUrlFn = () => "",
  getVerifiedMapLocationFn = () => null,
  setVerifiedMapLocationFn = null,
  buildUploadStateForIntentFn = (_intent = "", currentUpload = {}) => currentUpload,
  setStateFn = () => {},
  openGuestAuthPromptFn = () => false,
  openProfileViewFromBusinessFn = () => {},
  openPostModalFn = async () => {},
  togglePostLikeFn = async () => {},
  setTimeoutFn = (fn, ms) => setTimeout(fn, ms)
} = {}) {
  if (!state) {
    return {
      renderHomeView: () => "",
      renderFeedView: () => "",
      renderStoryItem: () => "",
      renderStoriesRow: () => "",
      renderFeedItem: () => "",
      renderFeedList: () => "",
      patchFeedList: () => false,
      patchStoriesRow: () => false,
      updateFeedDom: () => false,
      bindFeedDelegation: () => {}
    };
  }

  const doc = documentObj || (typeof document !== "undefined" ? document : null);
  const win = windowObj || (typeof window !== "undefined" ? window : null);
  const storyViewerHintPrefix = "mnyra_story_viewer_hint_v1:";
  const hasProfileUid = () => !!String(state.userProfile?.uid || "").trim();
  const hasBusinessProfileHint = () => !!String(state.userProfile?.restaurantId || "").trim();
  const hasCeoOwnerProfileHint = () => {
    const roleKey = String(state.userProfile?.role || "").toLowerCase();
    if (roleKey === "ceo" || roleKey === "business") return true;
    const roles = Array.isArray(state.userProfile?.roles) ? state.userProfile.roles : [];
    return roles.some((role) => {
      const key = String(role || "").toLowerCase();
      return key === "ceo" || key === "owner";
    });
  };
  const shouldShowStoryUploadSlot = () => (
    !!state.user
    || (hasProfileUid() && (hasBusinessProfileHint() || hasCeoOwnerProfileHint()))
  );
  const shouldShowFeedComposer = () => (
    !!isLocalBusinessProfileFn(state.userProfile)
    || (hasBusinessProfileHint() && (!!state.user || hasProfileUid()))
  );
  const sanitizeStoryBusinessName = (value = "") => {
    const label = String(value || "").trim();
    if (!label) return "";
    return label.toLowerCase() === "business" ? "" : label;
  };
  const normalizeStoryTruthSource = (story = {}) => {
    const source = String(
      story?.truthSource
      || story?.storyTruthSource
      || story?.storyTruth
      || ""
    ).trim().toLowerCase();
    return source === "feed-fallback" ? "feed-fallback" : "canonical";
  };
  const buildStoryRenderSignature = (story = {}) => {
    const truthSource = normalizeStoryTruthSource(story);
    return [
      String(story?.restaurantId || story?.id || "").trim(),
      truthSource,
      story?.isLive ? "1" : "0"
    ].join("|");
  };
  const buildFeedRenderSignature = (post = {}) => ([
    String(post?.id || "").trim(),
    String(post?.business || "").trim(),
    String(post?.location || "").trim(),
    String(post?.content || post?.caption || "").trim(),
    String(post?.image || post?.url || "").trim(),
    post?.isLive ? "1" : "0"
  ].join("|"));
  const resolveStoryRenderIdentityLocal = (story = {}) => {
    const storyRestaurantId = String(story?.restaurantId || "").trim();
    const truthSource = normalizeStoryTruthSource(story);
    const isFeedFallbackStory = truthSource === "feed-fallback";
    if (!storyRestaurantId) {
      return {
        storyRestaurantId: "",
        hasCanonicalRestaurant: false,
        storyLabel: "",
        logoSource: "",
        borderClass: story?.isLive
          ? "border-red-500 animate-pulse"
          : (isFeedFallbackStory ? "border-amber-300 border-dashed" : "border-slate-200"),
        truthSource
      };
    }
    const restaurant = state.restaurants.find((r) => String(r?.id || "").trim() === storyRestaurantId) || null;
    const ownRestaurantId = String(state.userProfile?.restaurantId || "").trim();
    const ownStory = ownRestaurantId && ownRestaurantId === storyRestaurantId;
    const hasCanonicalRestaurant = !!restaurant?.id;
    const canonicalLogo = String(
      restaurant?.logoUrl
      || restaurant?.logo
      || restaurant?.logoURL
      || ""
    ).trim();
    const canonicalName = sanitizeStoryBusinessName(
      restaurant?.name
      || restaurant?.restaurantName
      || restaurant?.displayName
      || restaurant?.businessName
      || ""
    );
    const sourceName = sanitizeStoryBusinessName(story?.name || story?.businessName || story?.restaurantName || "");
    const ownFallbackName = ownStory ? sanitizeStoryBusinessName(state.userProfile?.name || "") : "";
    const ownFallbackLogo = ownStory ? String(state.userProfile?.avatar || "").trim() : "";
    const storyLabel = hasCanonicalRestaurant
      ? (canonicalName || sourceName || ownFallbackName || "")
      : (ownFallbackName || sourceName || canonicalName || "");
    const logoSource = hasCanonicalRestaurant
      ? (canonicalLogo || String(story?.img || story?.logo || story?.logoUrl || "").trim())
      : (ownFallbackLogo || String(story?.img || story?.logo || story?.logoUrl || "").trim());
    return {
      storyRestaurantId,
      hasCanonicalRestaurant,
      storyLabel,
      logoSource,
      borderClass: story?.isLive
        ? "border-red-500 animate-pulse"
        : (isFeedFallbackStory ? "border-amber-300 border-dashed" : "border-slate-200"),
      truthSource
    };
  };
  const resolveStoryRenderIdentity = typeof resolveStoryRenderIdentityFn === "function"
    ? (story = {}) => resolveStoryRenderIdentityFn(story)
    : resolveStoryRenderIdentityLocal;
  const isRenderableStory = (story = {}) => {
    const identity = resolveStoryRenderIdentity(story);
    return !!identity.storyRestaurantId;
  };
  const findFeedPostById = (postId = "") => {
    const safePostId = String(postId || "").trim();
    if (!safePostId) return null;
    return state.feedPosts.find((item) => String(item?.id || "").trim() === safePostId) || null;
  };
  const copyTextToClipboard = async (value = "") => {
    const safeValue = String(value || "");
    if (!safeValue) return false;
    try {
      if (win?.navigator?.clipboard?.writeText) {
        await win.navigator.clipboard.writeText(safeValue);
        return true;
      }
    } catch {}
    if (!doc?.body) return false;
    const textarea = doc.createElement("textarea");
    textarea.value = safeValue;
    textarea.setAttribute("readonly", "readonly");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    doc.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = !!doc.execCommand?.("copy");
    } catch {}
    textarea.remove();
    return copied;
  };
  const setShareButtonFeedback = (button, label = "Link kopiert") => {
    if (!(button instanceof HTMLElement)) return;
    const labelNode = button.querySelector("[data-feed-share-label]");
    if (!labelNode) return;
    const original = button.dataset.shareDefaultLabel || labelNode.textContent || "Share";
    button.dataset.shareDefaultLabel = original;
    labelNode.textContent = label;
    button.classList.add("text-white");
    button.classList.remove("text-white/70");
    if (button._shareFeedbackTimer) {
      clearTimeout(button._shareFeedbackTimer);
    }
    button._shareFeedbackTimer = setTimeoutFn(() => {
      labelNode.textContent = original;
      button.classList.add("text-white/70");
      button.classList.remove("text-white");
      button._shareFeedbackTimer = null;
    }, 1800);
  };
  const buildFeedShareUrl = (post = {}) => {
    const params = { post: post?.id || "" };
    const restaurantId = String(
      post?.restaurantId
      || (String(post?.ownerType || "").trim() === "restaurant" ? post?.ownerId : "")
      || ""
    ).trim();
    if (restaurantId) {
      params.r = restaurantId;
      params.tab = "profile";
    } else {
      params.tab = "feed";
    }
    return buildUrlFn("apps/menyra-social/index.html", params);
  };
  const resolveStoryWarmMeta = (restaurantId = "") => {
    const rid = String(restaurantId || "").trim();
    if (!rid) return null;
    const restaurant = state.restaurants.find((row) => String(row?.id || "").trim() === rid) || null;
    const ownRestaurantId = String(state.userProfile?.restaurantId || "").trim();
    const ownRestaurant = ownRestaurantId && ownRestaurantId === rid;
    const name = String(
      restaurant?.name
      || restaurant?.restaurantName
      || restaurant?.displayName
      || restaurant?.businessName
      || (ownRestaurant ? state.userProfile?.name : "")
      || ""
    ).trim();
    const logoUrl = String(
      restaurant?.logoUrl
      || restaurant?.logo
      || restaurant?.logoURL
      || (ownRestaurant ? state.userProfile?.avatar : "")
      || ""
    ).trim();
    return {
      id: rid,
      restaurantName: name,
      name,
      logoUrl,
      logo: logoUrl
    };
  };
  const warmStoryViewer = (restaurantId = "", href = "") => {
    const rid = String(restaurantId || "").trim();
    if (!rid || !win || !doc) return;
    const meta = resolveStoryWarmMeta(rid);
    if (meta && win.sessionStorage) {
      try {
        win.sessionStorage.setItem(`${storyViewerHintPrefix}${rid}`, JSON.stringify({
          restaurantId: rid,
          meta,
          savedAt: Date.now()
        }));
      } catch {}
    }
    const url = String(href || buildStoryViewerUrlFn(rid) || "").trim();
    if (!url || !doc.head) return;
    const existing = Array.from(doc.head.querySelectorAll("link[data-story-prefetch]"))
      .find((node) => String(node?.getAttribute?.("href") || "").trim() === url);
    if (existing) return;
    const link = doc.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    link.as = "document";
    link.crossOrigin = "anonymous";
    link.dataset.storyPrefetch = "1";
    doc.head.appendChild(link);
  };
  const focusPostCommentComposer = () => {
    setTimeoutFn(() => {
      const input = doc?.getElementById("postCommentInput");
      if (!(input instanceof HTMLElement)) return;
      try {
        input.focus({ preventScroll: false });
      } catch {
        try {
          input.focus();
        } catch {}
      }
      try {
        input.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } catch {}
      if (typeof input.setSelectionRange === "function") {
        const end = String(input.value || "").length;
        try {
          input.setSelectionRange(end, end);
        } catch {}
      }
    }, 90);
  };
  const FEED_LOCATION_STORAGE_KEY = "mnyra_social_feed_viewer_location_v1";
  const FEED_LOCATION_REMOTE_LIMIT = 14;
  const FEED_LOCATION_REMOTE_MIN_QUERY_LENGTH = 3;
  const FEED_LOCATION_REMOTE_CACHE_MAX_ENTRIES = 72;
  const FEED_LOCATION_REMOTE_SUGGESTION_ID_CACHE_MAX = 620;
  const FEED_LOCATION_REMOTE_TIMEOUT_MS = 4200;
  const FEED_LOCATION_REMOTE_FAILURE_BACKOFF_MS = 120000;
  const FEED_LOCATION_REMOTE_ALLOWED_COUNTRY_CODES = new Set(["xk", "al", "rs"]);
  const FEED_LOCATION_REMOTE_ALLOWED_OSM_VALUES = new Set(["city", "town", "village", "hamlet", "municipality"]);
  const FEED_LOCATION_COUNTRY_ALIASES = new Map([
    ["xk", "Kosove"],
    ["kosove", "Kosove"],
    ["kosova", "Kosove"],
    ["kosovo", "Kosove"],
    ["al", "Shqiperi"],
    ["shqiperi", "Shqiperi"],
    ["shqiperia", "Shqiperi"],
    ["albania", "Shqiperi"],
    ["rs", "Serbi"],
    ["serbi", "Serbi"],
    ["serbia", "Serbi"],
    ["srbija", "Serbi"]
  ]);
  const FEED_LOCATION_COUNTRY_CODE_ALIASES = new Map([
    ["xk", "xk"],
    ["kosove", "xk"],
    ["kosova", "xk"],
    ["kosovo", "xk"],
    ["al", "al"],
    ["shqiperi", "al"],
    ["shqiperia", "al"],
    ["albania", "al"],
    ["rs", "rs"],
    ["serbi", "rs"],
    ["serbia", "rs"],
    ["srbija", "rs"]
  ]);
  const FEED_LOCATION_NON_SETTLEMENT_HINTS = [
    "rruga", "street", "bulevard", "boulevard", "lagj", "district", "neighborhood", "quarter", "park", "mall", "plaza"
  ];
  const FEED_LOCATION_CITY_OPTIONS = Object.freeze([
    { id: "prishtina", label: "Prishtina", lat: 42.6629, lng: 21.1655, aliases: ["prishtine", "prishtin"] },
    { id: "prizren", label: "Prizren", lat: 42.2139, lng: 20.7397, aliases: ["prizr"] },
    { id: "peja", label: "Peja", lat: 42.6591, lng: 20.2883, aliases: ["peje"] },
    { id: "gjakova", label: "Gjakova", lat: 42.3803, lng: 20.4308, aliases: ["gjakove"] },
    { id: "ferizaj", label: "Ferizaj", lat: 42.3706, lng: 21.1553, aliases: ["feri"] },
    { id: "gjilan", label: "Gjilan", lat: 42.4635, lng: 21.4699, aliases: ["gjilani"] },
    { id: "mitrovica", label: "Mitrovica", lat: 42.8914, lng: 20.8660, aliases: ["mitrovice", "mitro"] },
    { id: "vushtrria", label: "Vushtrria", lat: 42.8231, lng: 20.9675, aliases: ["vushtrri"] },
    { id: "podujeva", label: "Podujeva", lat: 42.9106, lng: 21.1930, aliases: ["podujeve", "podu"] },
    { id: "tirana", label: "Tirana", lat: 41.3275, lng: 19.8187, aliases: ["tirane"], country: "Shqiperi" },
    { id: "kukes", label: "Kukes", lat: 42.0769, lng: 20.4219, aliases: ["kukes albania"], country: "Shqiperi" },
    { id: "smederevo", label: "Smederevo", lat: 44.6644, lng: 20.9276, aliases: ["smederevo serbia"], country: "Serbi" }
  ]);
  let sessionViewerLocation = null;
  let locationRequestPending = false;
  let locationGateStatus = "idle";
  let locationGateMessage = "";
  let locationRemoteSearchTimer = null;
  let locationRemoteFetchController = null;
  let locationRemoteFetchQueryKey = "";
  let locationRemoteFetchPromise = null;
  let locationRemoteDisabledUntilTs = 0;
  let locationGateResolveTransitionPending = false;
  let locationGateResolveTimer = null;
  let feedEntranceAnimationQueued = false;
  const locationRemoteSuggestionCache = new Map();
  const locationRemoteSuggestionById = new Map();
  const normalizeLocationQuery = (value = "") => String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const toCountryCode = (value = "") => {
    const normalized = normalizeLocationQuery(value);
    if (!normalized) return "";
    return FEED_LOCATION_COUNTRY_CODE_ALIASES.get(normalized) || "";
  };
  const toCountryLabel = (value = "") => {
    const normalized = normalizeLocationQuery(value);
    if (!normalized) return "";
    return FEED_LOCATION_COUNTRY_ALIASES.get(normalized) || "";
  };
  const normalizeViewerCoords = (value = null) => {
    const lat = Number(value?.lat ?? value?.latitude ?? value?.y);
    const lng = Number(value?.lng ?? value?.lon ?? value?.longitude ?? value?.x);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  };
  const normalizeViewerLocationRecord = (value = null) => {
    const coords = normalizeViewerCoords(value);
    if (!coords) return null;
    const label = String(value?.label || value?.city || "").trim();
    const city = String(value?.city || label).trim();
    const source = String(value?.source || "").trim().toLowerCase();
    return {
      lat: coords.lat,
      lng: coords.lng,
      label,
      city,
      source: source || "manual",
      savedAt: Number(value?.savedAt || Date.now()) || Date.now()
    };
  };
  const readStoredViewerLocation = () => {
    if (!win?.localStorage) return null;
    try {
      const raw = win.localStorage.getItem(FEED_LOCATION_STORAGE_KEY);
      if (!raw) return null;
      const normalized = normalizeViewerLocationRecord(JSON.parse(raw));
      if (normalized) return normalized;
      try {
        win.localStorage.removeItem(FEED_LOCATION_STORAGE_KEY);
      } catch {}
      return null;
    } catch {
      try {
        win.localStorage.removeItem(FEED_LOCATION_STORAGE_KEY);
      } catch {}
      return null;
    }
  };
  const hasStoredViewerLocationEntry = () => {
    if (!win?.localStorage) return null;
    try {
      return win.localStorage.getItem(FEED_LOCATION_STORAGE_KEY) !== null;
    } catch {
      return null;
    }
  };
  const writeStoredViewerLocation = (record = null) => {
    if (!win?.localStorage) return;
    if (!record) {
      try {
        win.localStorage.removeItem(FEED_LOCATION_STORAGE_KEY);
      } catch {}
      return;
    }
    try {
      win.localStorage.setItem(FEED_LOCATION_STORAGE_KEY, JSON.stringify(record));
    } catch {}
  };
  const resolveViewerLocationRecord = () => {
    const sessionRecord = normalizeViewerLocationRecord(sessionViewerLocation);
    const storedRecord = readStoredViewerLocation();
    if (storedRecord) {
      sessionViewerLocation = storedRecord;
      if (typeof setVerifiedMapLocationFn === "function") {
        try {
          setVerifiedMapLocationFn({
            lat: storedRecord.lat,
            lng: storedRecord.lng,
            label: storedRecord.label,
            city: storedRecord.city,
            source: storedRecord.source,
            savedAt: storedRecord.savedAt
          });
        } catch {}
      }
      return storedRecord;
    }
    const hasStoredEntry = hasStoredViewerLocationEntry();
    if (sessionRecord && hasStoredEntry !== false) return sessionRecord;
    if (hasStoredEntry === false) {
      sessionViewerLocation = null;
    }
    if (typeof getVerifiedMapLocationFn !== "function") return null;
    let fromMap = null;
    try {
      fromMap = getVerifiedMapLocationFn();
    } catch {}
    const mapRecord = normalizeViewerLocationRecord({
      ...(fromMap && typeof fromMap === "object" ? fromMap : {}),
      source: "gps-map"
    });
    if (mapRecord) {
      sessionViewerLocation = mapRecord;
      writeStoredViewerLocation(mapRecord);
      return mapRecord;
    }
    return null;
  };
  const hasViewerCoords = () => !!normalizeViewerLocationRecord(resolveViewerLocationRecord());
  const isFeedLocationRequired = () => !hasViewerCoords();
  const persistViewerLocation = (record = null) => {
    const normalized = normalizeViewerLocationRecord(record);
    if (!normalized) return false;
    sessionViewerLocation = normalized;
    writeStoredViewerLocation(normalized);
    if (typeof setVerifiedMapLocationFn === "function") {
      try {
        setVerifiedMapLocationFn({
          lat: normalized.lat,
          lng: normalized.lng,
          label: normalized.label,
          city: normalized.city,
          source: normalized.source,
          savedAt: normalized.savedAt
        });
      } catch {}
    }
    return true;
  };
  const clearFeedLocationRemoteSearchTimer = () => {
    if (!locationRemoteSearchTimer) return;
    try {
      clearTimeout(locationRemoteSearchTimer);
    } catch {}
    locationRemoteSearchTimer = null;
  };
  const clearFeedLocationRemoteLookup = () => {
    clearFeedLocationRemoteSearchTimer();
    if (locationRemoteFetchController) {
      try {
        locationRemoteFetchController.abort();
      } catch {}
    }
    locationRemoteFetchPromise = null;
    locationRemoteFetchController = null;
    locationRemoteFetchQueryKey = "";
  };
  const cacheFeedLocationRemoteSuggestions = (queryKey = "", options = []) => {
    const normalizedKey = normalizeLocationQuery(queryKey);
    if (!normalizedKey) return;
    const rows = Array.isArray(options) ? options : [];
    locationRemoteSuggestionCache.set(normalizedKey, rows);
    while (locationRemoteSuggestionCache.size > FEED_LOCATION_REMOTE_CACHE_MAX_ENTRIES) {
      const oldest = locationRemoteSuggestionCache.keys().next().value;
      if (!oldest) break;
      locationRemoteSuggestionCache.delete(oldest);
    }
    if (locationRemoteSuggestionById.size > FEED_LOCATION_REMOTE_SUGGESTION_ID_CACHE_MAX) {
      locationRemoteSuggestionById.clear();
    }
    rows.forEach((entry) => {
      locationRemoteSuggestionById.set(String(entry?.id || "").trim().toLowerCase(), entry);
    });
  };
  const clearLocationGateResolveTimer = () => {
    if (!locationGateResolveTimer) return;
    try {
      clearTimeout(locationGateResolveTimer);
    } catch {}
    locationGateResolveTimer = null;
  };
  const resolveSuggestionCountryLabel = (entry = {}) => {
    const fromCode = toCountryLabel(entry?.countryCode || entry?.country_code || "");
    if (fromCode) return fromCode;
    const fromCountry = toCountryLabel(entry?.country || "");
    if (fromCountry) return fromCountry;
    if (String(entry?.source || "").trim().toLowerCase() === "local") return "Kosove";
    return String(entry?.country || "").trim();
  };
  const buildFeedLocationCityOption = ({
    id = "",
    label = "",
    lat = null,
    lng = null,
    aliases = [],
    source = "local",
    country = "",
    metaLabel = "",
    importance = 0
  } = {}) => {
    const coords = normalizeViewerCoords({ lat, lng });
    const cityLabel = String(label || "").trim();
    if (!coords || !cityLabel) return null;
    const sourceKey = String(source || "local").trim().toLowerCase();
    const countryCode = toCountryCode(country);
    const countryLabel = toCountryLabel(country) || toCountryLabel(countryCode) || (sourceKey === "local" ? "Kosove" : "");
    const searchTerms = Array.from(new Set([
      cityLabel,
      countryLabel,
      countryCode,
      ...(Array.isArray(aliases) ? aliases : [])
    ].map((entry) => normalizeLocationQuery(entry)).filter(Boolean)));
    return Object.freeze({
      id: String(id || cityLabel).trim().toLowerCase(),
      label: cityLabel,
      city: cityLabel,
      lat: coords.lat,
      lng: coords.lng,
      source: sourceKey,
      country: countryLabel,
      countryCode,
      metaLabel: String(metaLabel || "").trim(),
      importance: Number(importance) || 0,
      searchTerms
    });
  };
  const resolveFeedLocationCityOptions = () => FEED_LOCATION_CITY_OPTIONS
    .map((entry) => buildFeedLocationCityOption(entry))
    .filter(Boolean);
  const findFeedLocationCityOption = (cityId = "") => {
    const lookupId = String(cityId || "").trim().toLowerCase();
    if (!lookupId) return null;
    const localMatch = resolveFeedLocationCityOptions().find((entry) => entry.id === lookupId) || null;
    if (localMatch) return localMatch;
    return locationRemoteSuggestionById.get(lookupId) || null;
  };
  const isLikelySettlementLabel = (value = "") => {
    const normalized = normalizeLocationQuery(value);
    if (!normalized) return false;
    if (/[0-9]/.test(normalized)) return false;
    const tokens = normalized.split(" ").filter(Boolean);
    if (!tokens.length || tokens.length > 3) return false;
    return !tokens.some((token) => FEED_LOCATION_NON_SETTLEMENT_HINTS.some((hint) => token.startsWith(hint)));
  };
  const scoreFeedLocationCandidate = (entry = {}, normalizedQuery = "") => {
    if (!entry || !normalizedQuery) return -1;
    const terms = Array.isArray(entry.searchTerms) ? entry.searchTerms : [];
    let score = -1;
    terms.forEach((term) => {
      if (!term) return;
      if (term === normalizedQuery) {
        score = Math.max(score, 420);
        return;
      }
      if (term.startsWith(normalizedQuery)) {
        score = Math.max(score, 260 - Math.max(0, term.length - normalizedQuery.length));
        return;
      }
      const index = term.indexOf(normalizedQuery);
      if (index >= 0) {
        score = Math.max(score, 170 - index);
      }
    });
    if (score < 0) return -1;
    if (String(entry?.source || "").toLowerCase() === "remote") {
      score += 12 + Math.round(Math.max(0, Number(entry.importance || 0) * 10));
    }
    return score;
  };
  const mergeFeedLocationOptionCollections = (...collections) => {
    const dedupe = new Map();
    collections.forEach((rows) => {
      (Array.isArray(rows) ? rows : []).forEach((entry) => {
        if (!entry || typeof entry !== "object") return;
        const key = `${normalizeLocationQuery(entry.label)}|${normalizeLocationQuery(resolveSuggestionCountryLabel(entry))}`;
        if (!key.trim()) return;
        if (!dedupe.has(key)) {
          dedupe.set(key, entry);
          return;
        }
        const current = dedupe.get(key);
        if (String(current?.source || "").trim().toLowerCase() === "local") return;
        dedupe.set(key, entry);
      });
    });
    return Array.from(dedupe.values());
  };
  const buildFeedLocationRemoteSuggestionOptions = (rows = []) => {
    if (!Array.isArray(rows)) return [];
    return rows.map((row, index) => {
      const properties = row?.properties && typeof row.properties === "object" ? row.properties : {};
      const coords = normalizeViewerCoords({
        lat: row?.geometry?.coordinates?.[1],
        lng: row?.geometry?.coordinates?.[0]
      });
      const label = String(properties.name || properties.city || properties.locality || "").trim();
      if (!coords || !label) return null;
      if (!isLikelySettlementLabel(label)) return null;
      const countryCode = toCountryCode(properties.countrycode || properties.country_code || properties.country || "");
      if (!countryCode || !FEED_LOCATION_REMOTE_ALLOWED_COUNTRY_CODES.has(countryCode)) return null;
      const osmValue = normalizeLocationQuery(properties.osm_value || properties.type || "");
      if (!FEED_LOCATION_REMOTE_ALLOWED_OSM_VALUES.has(osmValue)) return null;
      const countryLabel = toCountryLabel(countryCode) || "";
      const region = String(properties.state || properties.county || "").trim();
      const metaLabel = [region, countryLabel].filter(Boolean).join(" · ");
      return buildFeedLocationCityOption({
        id: `remote-${String(properties.osm_id || `${label}-${countryCode}-${index}`).trim().toLowerCase()}`,
        label,
        lat: coords.lat,
        lng: coords.lng,
        aliases: [properties.city, properties.state, properties.county, countryLabel].filter(Boolean),
        source: "remote",
        country: countryCode,
        metaLabel,
        importance: Number(properties.importance || row?.importance || 0)
      });
    }).filter(Boolean);
  };
  const requestRemoteFeedLocationSuggestions = async (query = "") => {
    const queryText = String(query || "").trim();
    const normalizedQuery = normalizeLocationQuery(queryText);
    if (normalizedQuery.length < FEED_LOCATION_REMOTE_MIN_QUERY_LENGTH) return [];
    if (locationRemoteSuggestionCache.has(normalizedQuery)) {
      return locationRemoteSuggestionCache.get(normalizedQuery) || [];
    }
    if (locationRemoteFetchPromise && locationRemoteFetchQueryKey === normalizedQuery) {
      return locationRemoteFetchPromise;
    }
    if (Date.now() < locationRemoteDisabledUntilTs) return [];
    const fetchClient = typeof win?.fetch === "function" ? win.fetch.bind(win) : null;
    if (!fetchClient) return [];
    if (locationRemoteFetchController && locationRemoteFetchQueryKey && locationRemoteFetchQueryKey !== normalizedQuery) {
      try {
        locationRemoteFetchController.abort();
      } catch {}
    }
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    let timeoutHandle = null;
    locationRemoteFetchController = controller;
    locationRemoteFetchQueryKey = normalizedQuery;
    if (controller) {
      timeoutHandle = setTimeoutFn(() => {
        try {
          controller.abort();
        } catch {}
      }, FEED_LOCATION_REMOTE_TIMEOUT_MS);
    }
    const endpoint = new URL("https://photon.komoot.io/api/");
    endpoint.searchParams.set("limit", String(FEED_LOCATION_REMOTE_LIMIT));
    endpoint.searchParams.set("lang", "en");
    endpoint.searchParams.set("osm_tag", "place");
    endpoint.searchParams.set("q", queryText);
    const fetchPromise = (async () => {
      try {
        const response = await fetchClient(endpoint.toString(), {
          method: "GET",
          signal: controller?.signal,
          headers: { "Accept-Language": "sq,sr,de,en" }
        });
        if (!response?.ok) throw new Error(`photon_${Number(response?.status || 0)}`);
        const payload = await response.json();
        const rows = Array.isArray(payload?.features) ? payload.features : [];
        const options = buildFeedLocationRemoteSuggestionOptions(rows);
        cacheFeedLocationRemoteSuggestions(normalizedQuery, options);
        locationRemoteDisabledUntilTs = 0;
        return options;
      } catch (error) {
        if (String(error?.name || "") !== "AbortError") {
          locationRemoteDisabledUntilTs = Date.now() + FEED_LOCATION_REMOTE_FAILURE_BACKOFF_MS;
          cacheFeedLocationRemoteSuggestions(normalizedQuery, []);
        }
        return [];
      } finally {
        if (timeoutHandle) {
          try {
            clearTimeout(timeoutHandle);
          } catch {}
        }
        if (locationRemoteFetchController === controller && locationRemoteFetchQueryKey === normalizedQuery) {
          locationRemoteFetchController = null;
          locationRemoteFetchQueryKey = "";
          locationRemoteFetchPromise = null;
        }
      }
    })();
    locationRemoteFetchPromise = fetchPromise;
    return fetchPromise;
  };
  const getFeedLocationCitySuggestions = (query = "", limit = 6) => {
    const normalizedQuery = normalizeLocationQuery(query);
    if (normalizedQuery.length < 2) return [];
    const localOptions = resolveFeedLocationCityOptions();
    const remoteOptions = locationRemoteSuggestionCache.get(normalizedQuery) || [];
    const merged = mergeFeedLocationOptionCollections(localOptions, remoteOptions);
    return merged
      .map((entry) => {
        const score = scoreFeedLocationCandidate(entry, normalizedQuery);
        if (score < 0) return null;
        return { ...entry, score };
      })
      .filter(Boolean)
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0) || String(a.label || "").localeCompare(String(b.label || ""), "de"))
      .slice(0, Math.max(1, Number(limit) || 6));
  };
  const buildFeedLocationSuggestionMarkup = (suggestions = []) => {
    const rows = Array.isArray(suggestions) ? suggestions : [];
    if (!rows.length) return "";
    return rows.map((entry) => `
      <button
        type="button"
        role="option"
        aria-selected="false"
        data-feed-city-suggestion="${escapeHtmlFn(entry.id)}"
        class="feed-location-suggestion"
      >
        <span class="feed-location-suggestion__label">${escapeHtmlFn(entry.label)}</span>
        <span class="feed-location-suggestion__meta">${escapeHtmlFn(resolveSuggestionCountryLabel(entry))}</span>
      </button>
    `).join("");
  };
  const hideFeedLocationSuggestions = ({ clearContent = true } = {}) => {
    const suggestionsRoot = doc?.getElementById("feedLocationCitySuggestions");
    const input = doc?.getElementById("feedLocationCityInput");
    if (suggestionsRoot instanceof HTMLElement) {
      suggestionsRoot.classList.remove("feed-location-suggestions--open");
      suggestionsRoot.setAttribute("aria-hidden", "true");
      if (clearContent) suggestionsRoot.innerHTML = "";
    }
    if (input instanceof HTMLElement) {
      input.setAttribute("aria-expanded", "false");
    }
  };
  const scheduleFeedLocationRemoteSearch = (query = "") => {
    clearFeedLocationRemoteSearchTimer();
    if (locationRequestPending) return;
    const normalizedQuery = normalizeLocationQuery(query);
    if (normalizedQuery.length < FEED_LOCATION_REMOTE_MIN_QUERY_LENGTH) return;
    if (locationRemoteSuggestionCache.has(normalizedQuery)) return;
    locationRemoteSearchTimer = setTimeoutFn(async () => {
      locationRemoteSearchTimer = null;
      const liveQuery = String(doc?.getElementById("feedLocationCityInput")?.value || "").trim();
      if (normalizeLocationQuery(liveQuery) !== normalizedQuery) return;
      await requestRemoteFeedLocationSuggestions(liveQuery);
      const nextLiveQuery = String(doc?.getElementById("feedLocationCityInput")?.value || "").trim();
      if (normalizeLocationQuery(nextLiveQuery) !== normalizedQuery) return;
      syncFeedLocationSuggestionsDom(nextLiveQuery, { skipRemoteFetch: true });
    }, 260);
  };
  const syncFeedLocationSuggestionsDom = (query = "", { skipRemoteFetch = false } = {}) => {
    const suggestionsRoot = doc?.getElementById("feedLocationCitySuggestions");
    const input = doc?.getElementById("feedLocationCityInput");
    if (!(suggestionsRoot instanceof HTMLElement) || !(input instanceof HTMLElement)) return;
    if (locationRequestPending) {
      hideFeedLocationSuggestions();
      return;
    }
    const normalizedQuery = normalizeLocationQuery(query);
    if (normalizedQuery.length < 2) {
      hideFeedLocationSuggestions();
      return;
    }
    const suggestions = getFeedLocationCitySuggestions(query, 6);
    if (!suggestions.length) {
      hideFeedLocationSuggestions({ clearContent: false });
      if (!skipRemoteFetch) scheduleFeedLocationRemoteSearch(query);
      return;
    }
    suggestionsRoot.innerHTML = buildFeedLocationSuggestionMarkup(suggestions);
    suggestionsRoot.classList.add("feed-location-suggestions--open");
    suggestionsRoot.setAttribute("aria-hidden", "false");
    input.setAttribute("aria-expanded", "true");
    if (!skipRemoteFetch && suggestions.length < 3) scheduleFeedLocationRemoteSearch(query);
  };
  const resolveLocationGateStatusText = () => {
    if (locationGateMessage) return locationGateMessage;
    if (locationGateStatus === "requesting") return "Po kërkohet vendndodhja...";
    if (locationGateStatus === "denied") return "Leja e vendndodhjes u refuzua.";
    if (locationGateStatus === "timeout") return "Vendndodhja nuk u mor me kohe. Provo perseri.";
    if (locationGateStatus === "unsupported") return "Vendndodhja nuk mbeshtetet ne kete pajisje.";
    if (locationGateStatus === "error") return "Nuk arritem te marrim vendndodhjen.";
    return "";
  };
  const resolveLocationScreenMode = () => {
    const activeTabKey = String(state?.activeTab || "").trim().toLowerCase();
    if (activeTabKey === "location") return "location";
    if (activeTabKey === "home") return "home-intro";
    return "feed-gate";
  };
  const getRenderedLocationScreenMode = () => {
    const rootMode = String(doc?.getElementById("feedView")?.dataset?.locationScreenMode || "").trim().toLowerCase();
    if (rootMode) return rootMode;
    const gateMode = String(doc?.getElementById("feedLocationGate")?.dataset?.locationScreenMode || "").trim().toLowerCase();
    return gateMode || resolveLocationScreenMode();
  };
  const syncFeedLocationGateDom = () => {
    const requestBtn = doc?.getElementById("btnLocateMe");
    const locateIcon = doc?.getElementById("locateIcon");
    const locatePulse = doc?.getElementById("locatePulse");
    const cityInput = doc?.getElementById("feedLocationCityInput");
    const statusEl = doc?.getElementById("feedLocationStatus");
    const viewerLocation = resolveViewerLocationRecord();
    const hasLocation = !!normalizeViewerLocationRecord(viewerLocation);
    const busy = locationRequestPending || locationGateResolveTransitionPending;
    if (requestBtn instanceof HTMLButtonElement) {
      requestBtn.disabled = busy;
      requestBtn.classList.toggle("opacity-60", requestBtn.disabled);
      requestBtn.classList.toggle("cursor-not-allowed", requestBtn.disabled);
      requestBtn.classList.toggle("is-success", hasLocation && !busy);
      requestBtn.classList.toggle("is-loading", locationGateResolveTransitionPending);
    }
    if (locateIcon instanceof HTMLElement) {
      locateIcon.classList.toggle("animate-spin", busy);
      locateIcon.setAttribute("data-lucide", locationGateResolveTransitionPending
        ? "loader-circle"
        : (hasLocation && !locationRequestPending ? "check" : "crosshair"));
    }
    if (locatePulse instanceof HTMLElement) {
      locatePulse.classList.toggle("opacity-100", locationRequestPending);
      locatePulse.classList.toggle("opacity-0", !locationRequestPending);
    }
    if (cityInput instanceof HTMLInputElement) {
      cityInput.disabled = locationRequestPending;
      const savedLabel = String(viewerLocation?.label || viewerLocation?.city || "").trim();
      if (savedLabel && !cityInput.value.trim() && doc?.activeElement !== cityInput) {
        cityInput.value = savedLabel;
      }
    }
    if (statusEl instanceof HTMLElement) {
      const text = resolveLocationGateStatusText();
      statusEl.textContent = text;
      statusEl.classList.toggle("hidden", !text);
    }
    if (win?.lucide?.createIcons) win.lucide.createIcons();
  };
  const setLocationGateState = (status = "idle", message = "") => {
    locationGateStatus = String(status || "idle").trim().toLowerCase();
    locationGateMessage = String(message || "").trim();
    syncFeedLocationGateDom();
  };
  const applyViewerLocationSelection = (record = null) => {
    const normalized = normalizeViewerLocationRecord(record);
    if (!normalized) return false;
    if (locationGateResolveTransitionPending) return true;
    locationRequestPending = false;
    locationGateStatus = "granted";
    locationGateMessage = "";
    clearFeedLocationRemoteLookup();
    hideFeedLocationSuggestions();
    persistViewerLocation(normalized);
    const gateRoot = doc?.getElementById("feedLocationGate");
    const locationScreenMode = getRenderedLocationScreenMode();
    const shouldStayOnLocationScreen = locationScreenMode === "location";
    if (shouldStayOnLocationScreen) {
      feedEntranceAnimationQueued = false;
      locationGateResolveTransitionPending = false;
      gateRoot?.classList?.remove?.("feed-location-gate--resolving");
    } else {
      feedEntranceAnimationQueued = true;
      locationGateResolveTransitionPending = true;
      gateRoot?.classList?.add?.("feed-location-gate--resolving");
    }
    syncFeedLocationGateDom();
    if (shouldStayOnLocationScreen) {
      clearLocationGateResolveTimer();
      return true;
    }
    clearLocationGateResolveTimer();
    locationGateResolveTimer = setTimeoutFn(() => {
      locationGateResolveTimer = null;
      locationGateResolveTransitionPending = false;
      const activeTabKey = String(state?.activeTab || "").trim().toLowerCase();
      if (activeTabKey && activeTabKey !== "feed" && activeTabKey !== "home" && activeTabKey !== "location") {
        return;
      }
      setStateFn({ activeTab: "feed" });
    }, 360);
    return true;
  };
  const requestViewerLocationAccess = ({ fallbackCity = null, forceExact = false } = {}) => {
    const fallbackOption = fallbackCity && typeof fallbackCity === "object"
      ? fallbackCity
      : findFeedLocationCityOption(fallbackCity);
    if (fallbackOption && !forceExact) {
      applyViewerLocationSelection({
        lat: fallbackOption.lat,
        lng: fallbackOption.lng,
        label: fallbackOption.label,
        city: fallbackOption.city || fallbackOption.label,
        source: "city-search"
      });
      return;
    }
    const geo = win?.navigator?.geolocation;
    if (win && win.isSecureContext === false) {
      if (fallbackOption) {
        requestViewerLocationAccess({ fallbackCity: fallbackOption, forceExact: false });
        return;
      }
      setLocationGateState("unsupported", "Vendndodhja kerkon HTTPS.");
      return;
    }
    if (!geo || typeof geo.getCurrentPosition !== "function") {
      if (fallbackOption) {
        requestViewerLocationAccess({ fallbackCity: fallbackOption, forceExact: false });
        return;
      }
      setLocationGateState("unsupported");
      return;
    }
    if (locationRequestPending) return;
    locationRequestPending = true;
    clearFeedLocationRemoteLookup();
    hideFeedLocationSuggestions();
    setLocationGateState("requesting");
    const requestStartedAt = Date.now();
    const finalize = (fn) => {
      const waitMs = Math.max(0, 900 - (Date.now() - requestStartedAt));
      if (waitMs > 0) {
        setTimeoutFn(fn, waitMs);
      } else {
        fn();
      }
    };
    const currentLabel = String(doc?.getElementById("feedLocationCityInput")?.value || "").trim();
    geo.getCurrentPosition(
      (position) => {
        finalize(() => {
          const coords = normalizeViewerCoords({
            lat: position?.coords?.latitude,
            lng: position?.coords?.longitude
          });
          if (!coords) {
            locationRequestPending = false;
            setLocationGateState("error");
            return;
          }
          applyViewerLocationSelection({
            lat: coords.lat,
            lng: coords.lng,
            label: currentLabel || "Lokacioni aktual",
            city: currentLabel || "",
            source: "gps"
          });
        });
      },
      (error) => {
        finalize(() => {
          locationRequestPending = false;
          if (fallbackOption) {
            requestViewerLocationAccess({ fallbackCity: fallbackOption, forceExact: false });
            return;
          }
          const code = Number(error?.code);
          if (code === 1) {
            setLocationGateState("denied");
            return;
          }
          if (code === 3) {
            setLocationGateState("timeout");
            return;
          }
          setLocationGateState("error");
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  function renderLocationGate({ mode = resolveLocationScreenMode() } = {}) {
    const viewerLocation = resolveViewerLocationRecord();
    const cityValue = String(viewerLocation?.label || viewerLocation?.city || "").trim();
    const safeMode = String(mode || "feed-gate").trim().toLowerCase() || "feed-gate";
    return `
      <div id="feedLocationGate" data-location-screen-mode="${escapeHtmlFn(safeMode)}">
        <style>
          .smart-header-shell { background: #00cce5 !important; }
          main.feed-location-gate-main { padding-top: 0 !important; }
          .smart-header-top, .smart-header-tabs {
            background: #00cce5 !important;
            border-bottom: 0 !important;
            border-bottom-color: transparent !important;
            box-shadow: none !important;
          }
          #feedLocationGate { background: #f8fafc; color: #0f172a; }
          #feedLocationGate .loc-shell { position: relative; background: #00cce5; }
          #feedLocationGate .loc-glow-a, #feedLocationGate .loc-glow-b { position: absolute; border-radius: 9999px; pointer-events: none; }
          #feedLocationGate .loc-glow-a { top: -12%; right: -12%; width: 16rem; height: 16rem; background: rgb(255 255 255 / 0.12); filter: blur(64px); }
          #feedLocationGate .loc-glow-b { bottom: 20%; left: -10%; width: 12rem; height: 12rem; background: rgb(0 155 175 / 0.22); filter: blur(40px); }
          #feedLocationGate .loc-top { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 5rem 1.5rem 5.25rem; background: #00cce5; }
          #feedLocationGate .loc-title { width: 100%; max-width: 22rem; margin: 0 auto 2.15rem; color: #fff; font-size: clamp(1.65rem, 6.6vw, 2.2rem); font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; line-height: 1.08; }
          #feedLocationGate .text-slider-wrapper { position: relative; height: 1.25em; width: 100%; overflow: hidden; margin-bottom: 0.2rem; }
          #feedLocationGate .text-slide-item { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; white-space: nowrap; opacity: 0; animation: feedLocationTextFadeSlide 9s ease-in-out infinite; will-change: transform, opacity; }
          #feedLocationGate .text-slide-item:nth-child(1) { animation-delay: 0s; }
          #feedLocationGate .text-slide-item:nth-child(2) { animation-delay: 3s; }
          #feedLocationGate .text-slide-item:nth-child(3) { animation-delay: 6s; }
          @keyframes feedLocationTextFadeSlide {
            0% { opacity: 0; transform: translateY(100%); }
            5%, 28% { opacity: 1; transform: translateY(0); }
            33%, 100% { opacity: 0; transform: translateY(-100%); }
          }
          #feedLocationGate .loc-search-wrap { width: 100%; max-width: 22rem; margin: 0 auto; }
          #feedLocationGate .loc-input-row { position: relative; }
          #feedLocationGate .loc-pin { position: absolute; left: 1.2rem; top: 50%; transform: translateY(-50%); color: rgb(148 163 184); pointer-events: none; }
          #feedLocationGate .loc-input { width: 100%; border: 0; outline: none; color: #0f172a; background: #fff; border-radius: 9999px; padding: 1rem 4.2rem 1rem 3rem; font-size: 16px; line-height: 1.2; font-weight: 600; box-shadow: 0 8px 30px rgb(0 0 0 / 0.12); }
          #feedLocationGate .loc-input::placeholder { color: rgb(148 163 184); opacity: 1; }
          #feedLocationGate .loc-input:focus { box-shadow: 0 0 0 4px rgb(255 255 255 / 0.42), 0 8px 30px rgb(0 0 0 / 0.12); }
          #feedLocationGate .loc-request-wrap { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); }
          #feedLocationGate .loc-request-btn { position: relative; width: 2.5rem; height: 2.5rem; border: 0; border-radius: 9999px; background: #eafbfe; color: #00cce5; display: inline-flex; align-items: center; justify-content: center; transition: transform 160ms ease, background-color 160ms ease, color 160ms ease; }
          #feedLocationGate .loc-request-btn:active { transform: scale(0.95); }
          #feedLocationGate .loc-request-btn.is-success { background: rgb(236 253 245); color: rgb(16 185 129); }
          #feedLocationGate .loc-request-btn.is-loading { background: rgb(255 255 255); color: rgb(14 165 233); box-shadow: 0 0 0 3px rgb(255 255 255 / 0.42); }
          #feedLocationGate .loc-request-pulse { position: absolute; inset: 0; border-radius: 9999px; background: rgb(0 204 229 / 0.2); opacity: 0; animation: ping 1.05s cubic-bezier(0, 0, 0.2, 1) infinite; }
          #feedLocationGate .feed-location-suggestions { position: relative; z-index: 30; margin-top: 0; max-height: 0; opacity: 0; padding: 0; overflow: hidden; pointer-events: none; transform: translateY(-4px); border-radius: 1.4rem; background: rgb(255 255 255 / 0.98); border: 1px solid rgb(226 232 240 / 0.95); box-shadow: 0 18px 44px rgb(15 23 42 / 0.16); backdrop-filter: blur(18px); transition: max-height 220ms ease, opacity 180ms ease, margin-top 220ms ease, padding 220ms ease, transform 220ms ease; }
          #feedLocationGate .feed-location-suggestions--open { margin-top: 0.75rem; max-height: 18rem; opacity: 1; padding: 0.5rem; pointer-events: auto; transform: translateY(0); }
          #feedLocationGate .feed-location-suggestion { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; border: 0; background: transparent; border-radius: 1rem; padding: 0.85rem 0.95rem; text-align: left; color: rgb(15 23 42); font-weight: 700; }
          #feedLocationGate .feed-location-suggestion:hover, #feedLocationGate .feed-location-suggestion:focus-visible { background: rgb(241 245 249); outline: none; }
          #feedLocationGate .feed-location-suggestion__label { display: block; font-size: 0.92rem; line-height: 1.1rem; }
          #feedLocationGate .feed-location-suggestion__meta { min-width: 3.7rem; text-align: center; padding: 0.3rem 0.6rem; border-radius: 9999px; background: rgb(236 254 255); color: rgb(8 145 178); font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; }
          #feedLocationGate .loc-status { margin-top: 0.7rem; font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.11em; color: rgb(255 255 255 / 0.9); }
          #feedLocationGate .loc-status.hidden { display: none; }
          #feedLocationGate .loc-bento { position: relative; z-index: 3; background: #f8fafc; border-top-left-radius: 2.5rem; border-top-right-radius: 2.5rem; padding: 2.35rem 1.25rem 2rem; }
          #feedLocationGate .loc-bento-head { text-align: center; max-width: 22rem; margin: 0 auto 1.1rem; }
          #feedLocationGate .loc-bento-line { display: inline-flex; align-items: center; gap: 0.7rem; opacity: 0.82; margin-bottom: 0.9rem; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.24em; color: rgb(100 116 139); }
          #feedLocationGate .loc-bento-line::before, #feedLocationGate .loc-bento-line::after { content: ""; display: block; width: 1.5rem; height: 2px; border-radius: 999px; background: rgb(226 232 240); }
          #feedLocationGate .loc-bento-title { margin: 0 0 0.6rem; font-size: 32px; line-height: 1; letter-spacing: -0.035em; font-weight: 900; color: rgb(15 23 42); }
          #feedLocationGate .loc-bento-sub { margin: 0; font-size: 13px; line-height: 1.55; font-weight: 600; color: rgb(100 116 139); }
          #feedLocationGate .loc-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.875rem; max-width: 22rem; margin: 0 auto; }
          #feedLocationGate .loc-card { position: relative; border-radius: 1.45rem; overflow: hidden; border: 1px solid rgb(241 245 249); background: #fff; padding: 1.2rem; transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 260ms cubic-bezier(0.16, 1, 0.3, 1); }
          #feedLocationGate .loc-card:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 14px 34px rgb(15 23 42 / 0.08); }
          #feedLocationGate .loc-card.full { grid-column: span 2 / span 2; }
          #feedLocationGate .loc-card.dark { background: rgb(15 23 42); border-color: rgb(30 41 59); color: #fff; }
          #feedLocationGate .loc-card p { margin: 0; font-size: 11px; line-height: 1.45; font-weight: 600; color: rgb(100 116 139); }
          #feedLocationGate .loc-card.dark p { color: rgb(203 213 225); }
          #feedLocationGate .loc-card h4 { margin: 0 0 0.3rem; font-size: 1rem; line-height: 1.2; font-weight: 800; letter-spacing: -0.015em; color: inherit; }
          #feedLocationGate .loc-icon { width: 2.75rem; height: 2.75rem; border-radius: 1rem; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 0.8rem; color: #fff; }
          #feedLocationGate .loc-foot { text-align: center; margin-top: 1.35rem; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: rgb(148 163 184); }
          #feedLocationGate .fade-in-up { opacity: 0; transform: translateY(30px); animation: feedLocationFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes feedLocationFadeUp { to { opacity: 1; transform: translateY(0); } }
          #feedLocationGate.feed-location-gate--resolving { pointer-events: none; animation: feedLocationGateResolveOut 360ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
          @keyframes feedLocationGateResolveOut {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-42px); }
          }
        </style>

        <div class="loc-shell">
          <div class="loc-glow-a"></div>
          <div class="loc-glow-b"></div>
          <div class="loc-top">
            <div class="loc-title">
              <div class="text-slider-wrapper">
                <div class="text-slide-item">ZBULO VENDET.</div>
                <div class="text-slide-item">GJEJ OFERTAT.</div>
                <div class="text-slide-item">SHIJO QYTETIN.</div>
              </div>
              <div>PËRRETH TEJE.</div>
            </div>

            <div class="loc-search-wrap">
              <div class="loc-input-row">
                <span class="loc-pin">${iconFn("map-pin", "w-5 h-5")}</span>
                <input id="feedLocationCityInput" type="text" inputmode="search" autocomplete="off" autocapitalize="words" spellcheck="false" data-feed-location-city-input aria-autocomplete="list" aria-controls="feedLocationCitySuggestions" aria-expanded="false" value="${escapeHtmlFn(cityValue)}" placeholder="Vendos qytetin tënd..." class="loc-input" />
                <div class="loc-request-wrap">
                  <button id="btnLocateMe" type="button" data-feed-location-request class="loc-request-btn">
                    <i id="locateIcon" data-lucide="crosshair" class="w-5 h-5 relative z-10"></i>
                    <span id="locatePulse" class="loc-request-pulse opacity-0"></span>
                  </button>
                </div>
              </div>
              <div id="feedLocationCitySuggestions" data-feed-location-city-suggestions role="listbox" aria-hidden="true" class="feed-location-suggestions"></div>
              <p id="feedLocationStatus" class="loc-status hidden"></p>
            </div>
          </div>

          <div class="loc-bento" data-location-screen-content="${escapeHtmlFn(safeMode)}">
            <div class="loc-bento-head fade-in-up" style="animation-delay:0.05s;">
              <div class="loc-bento-line">Çfarë ofron Mnyra</div>
              <h3 class="loc-bento-title">Gjithçka në një vend.</h3>
              <p class="loc-bento-sub">Guida juaj personale. Zbuloni, rezervoni dhe përfitoni nga ofertat më të mira të qytetit çdo ditë.</p>
            </div>

            <div class="loc-grid">
              <div class="loc-card full fade-in-up" style="animation-delay:0.12s;"><div class="loc-icon" style="background:rgb(79 70 229);">${iconFn("utensils-crossed", "w-5 h-5")}</div><h4>Eksploro & Shijo</h4><p>Gjej restorante, kafene dhe evente. Shiko stories, menutë me çmime dhe fotot reale. Rezervo tavolinën tënde me një klikim.</p></div>
              <div class="loc-card full fade-in-up" style="animation-delay:0.2s;"><div class="loc-icon" style="background:rgb(244 63 94);">${iconFn("shopping-bag", "w-5 h-5")}</div><h4>Shopping pa kufi</h4><p>Nga markat tek butiqet lokale. Porosit për në shtëpi ose rezervo dhe merre direkt në dyqan.</p></div>
              <div class="loc-card full dark fade-in-up" style="animation-delay:0.28s;"><div class="loc-icon" style="background:rgb(16 185 129 / 0.25);">${iconFn("badge-percent", "w-5 h-5")}</div><h4>ÇFARË KA NË AKSION SOT?</h4><p>Ofertat më të mira dhe zbritjet ekskluzive nga restorantet dhe dyqanet tuaja të preferuara.</p></div>
              <div class="loc-card fade-in-up" style="animation-delay:0.36s; background:rgb(236 253 245 / 0.65); border-color:rgb(209 250 229 / 0.75);"><div class="loc-icon" style="background:rgb(16 185 129);">${iconFn("store", "w-5 h-5")}</div><h4>Supermarkete & Farmaci</h4><p>Gjej më të afërtat dhe shiko nëse janë hapur tani.</p></div>
              <div class="loc-card fade-in-up" style="animation-delay:0.44s; background:rgb(236 254 255 / 0.7); border-color:rgb(207 250 254 / 0.75);"><div class="loc-icon" style="background:rgb(6 182 212);">${iconFn("bed-double", "w-5 h-5")}</div><h4>Hotele & Akomodim</h4><p>Oferta All-Inclusive, foto dhomash dhe rezervime direkte.</p></div>
              <div class="loc-card full fade-in-up" style="animation-delay:0.52s;"><div class="loc-icon" style="background:linear-gradient(135deg, rgb(139 92 246), rgb(217 70 239));">${iconFn("users", "w-5 h-5")}</div><h4>Komuniteti MNYRA</h4><p>Krijo profilin, pëlqe, komento, bëj check-in dhe ndaj momente me miqtë e tu.</p></div>
            </div>

            <p class="loc-foot">Powered by MNYRA</p>
          </div>
        </div>
      </div>
    `;
  }
  function renderLocationHeroScreen(mode = resolveLocationScreenMode()) {
    const safeMode = String(mode || "feed-gate").trim().toLowerCase() || "feed-gate";
    return `
      <div id="feedView" data-feed-view-mode="location" data-location-screen-mode="${escapeHtmlFn(safeMode)}">
        ${renderLocationGate({ mode: safeMode })}
      </div>
    `;
  }

  function renderFeedLocationView() {
    return renderLocationHeroScreen(resolveLocationScreenMode());
  }

  function renderHomeResolvedView() {
    const viewerLocation = resolveViewerLocationRecord();
    const locationLabel = String(viewerLocation?.label || viewerLocation?.city || "").trim() || "Noch kein Standort gespeichert";
    return `
      <section id="homeView" data-home-view-mode="resolved" class="px-6 pt-6 pb-24 space-y-4">
        <div class="border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <p class="text-[10px] font-black uppercase tracking-[0.28em] text-sky-500">Startseite</p>
          <h2 class="mt-3 text-2xl font-black tracking-tight text-slate-900">Willkommen zurück bei MNYRA.</h2>
          <p class="mt-3 text-sm leading-6 text-slate-600">Hier kann später alles landen, was auf der Startseite sichtbar bleiben soll: Highlights, Neuigkeiten und kuratierte Hinweise. Feed, Feed-Gate und Standort bleiben davon getrennt.</p>
        </div>
        <div class="border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p class="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Aktiver Standort</p>
          <div class="mt-3 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-black tracking-tight text-slate-900">${escapeHtmlFn(locationLabel)}</h3>
              <p class="mt-2 text-sm leading-6 text-slate-600">Standort ändern läuft bewusst über den Standort-Tab. Deshalb bleibt die Startseite nach der ersten Auswahl im normalen weißen App-Layout.</p>
            </div>
            <button data-nav="location" type="button" class="shrink-0 border border-slate-300 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-colors hover:bg-slate-50">Standort</button>
          </div>
        </div>
        <div class="border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p class="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Schnell weiter</p>
          <div class="mt-4 flex flex-col gap-3">
            <button data-nav="feed" type="button" class="w-full bg-slate-900 px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-white transition-colors hover:bg-slate-800">Zum Feed</button>
            <button data-nav="search" type="button" class="w-full border border-slate-300 bg-white px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-700 transition-colors hover:bg-slate-50">Suche Orte & Angebote</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderHomeView() {
    if (isFeedLocationRequired()) {
      return renderLocationHeroScreen("home-intro");
    }
    return renderHomeResolvedView();
  }

  function renderFeedComposer() {
    if (!shouldShowFeedComposer()) return "";
    return `
      <div data-feed-composer-wrap class="px-8 mb-6">
        <button data-nav="upload" data-upload-intent="feed" class="w-full p-4 rounded-[2rem] bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
          ${iconFn("plus-square", "w-4 h-4")} Neuer Feed Post
        </button>
      </div>
    `;
  }

  function renderStoryItem(story, index = 0) {
    const identity = resolveStoryRenderIdentity(story);
    const storyRestaurantId = identity.storyRestaurantId;
    if (!storyRestaurantId) return "";
    const storyTruthSource = String(identity.truthSource || "canonical").trim().toLowerCase();
    const isFeedFallbackStory = storyTruthSource === "feed-fallback";
    const borderClass = identity.borderClass || "border-slate-200";
    const storyUrl = isFeedFallbackStory
      ? buildUrlFn("apps/menyra-social/index.html", { r: storyRestaurantId, tab: "profile", source: "story-fallback" })
      : buildStoryViewerUrlFn(storyRestaurantId);
    const storyLabel = String(identity.storyLabel || "").trim() || "Restaurant";
    const logoSource = String(identity.logoSource || "").trim();
    const imgUrl = resolveRestaurantLogoFn(storyRestaurantId, logoSource, "thumb", false);
    const storyId = storyRestaurantId ? escapeHtmlFn(storyRestaurantId) : "";
    const storyAttr = storyId ? `data-story-logo="${storyId}"` : "";
    const storyKeyAttr = storyId ? `data-img-key="story-logo:${storyId}"` : "";
    const storyBorderAttr = storyId ? `data-story-border="${storyId}"` : "";
    const storyNameAttr = storyId ? `data-story-name="${storyId}"` : "";
    const storyItemAttr = storyId ? `data-story-item="${storyId}"` : "";
    const storyTruthAttr = `data-story-truth="${escapeHtmlFn(storyTruthSource)}"`;
    const storyRenderAttr = `data-story-render-sig="${escapeHtmlFn(buildStoryRenderSignature(story))}"`;
    const eager = index < 4;
    const imgAttrs = eager
      ? `loading="eager" fetchpriority="high"`
      : `loading="lazy" fetchpriority="low"`;
    return `
    <a href="${storyUrl}" ${storyItemAttr} data-story-url="${escapeHtmlFn(storyUrl)}" ${storyTruthAttr} ${storyRenderAttr} class="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
      <div class="w-20 h-20 rounded-[2.2rem] p-0.5 border-2 ${borderClass} bg-slate-200" ${storyBorderAttr}>
        <img src="${escapeHtmlFn(imgUrl)}" ${imgAttrs} decoding="async" width="80" height="80" ${storyAttr} ${storyKeyAttr} class="w-full h-full rounded-[1.8rem] object-contain bg-white group-hover:scale-105 transition-transform" />
      </div>
      <div class="flex flex-col items-center gap-0.5">
        <span class="text-[9px] font-bold tracking-tighter text-slate-800" ${storyNameAttr}>${escapeHtmlFn(storyLabel)}</span>
        ${isFeedFallbackStory ? `<span class="text-[8px] font-black uppercase tracking-widest text-amber-600">Feed</span>` : ""}
      </div>
    </a>
  `;
  }

  function renderStoriesRow(stories) {
    const uploadSlot = shouldShowStoryUploadSlot() ? `
    <div class="flex-shrink-0 flex flex-col items-center gap-2" data-story-upload-wrap data-nav="upload" data-upload-intent="chooser">
      <div data-story-upload class="w-20 h-20 rounded-[2.2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 overflow-hidden relative group">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-800"></div>
        ${iconFn("camera", "w-7 h-7 relative z-10")}
      </div>
      <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Story</span>
    </div>
  ` : "";
    return `
    ${uploadSlot}
    ${stories.length ? stories.map((story, index) => renderStoryItem(story, index)).join("") : `
      <div class="flex items-center text-slate-400 text-xs font-bold uppercase">Keine Stories</div>
    `}
  `;
  }

  function renderFeedItem(post, index) {
    const postId = post.id ? String(post.id) : "";
    const likeAttr = postId ? `data-post-like-count="${escapeHtmlFn(postId)}"` : "";
    const commentAttr = postId ? `data-post-comment-count="${escapeHtmlFn(postId)}"` : "";
    const feedAttr = postId ? `data-feed-id="${escapeHtmlFn(postId)}"` : `data-feed-id=""`;
    const logoAttr = postId ? `data-feed-logo="${escapeHtmlFn(postId)}"` : "";
    const logoKeyAttr = postId ? `data-img-key="feed-logo:${escapeHtmlFn(postId)}"` : "";
    const heroKeyAttr = postId ? `data-img-key="feed-hero:${escapeHtmlFn(postId)}"` : "";
    const feedRenderAttr = `data-feed-render-sig="${escapeHtmlFn(buildFeedRenderSignature(post))}"`;
    const eager = index < 2;
    const heroAttrs = eager
      ? `loading="eager" fetchpriority="high"`
      : `loading="lazy" fetchpriority="low"`;
    const logoAttrs = eager
      ? `loading="eager"`
      : `loading="lazy" fetchpriority="low"`;
    const restaurant = state.restaurants.find((r) => r.id === (post.restaurantId || post.ownerId)) || {};
    const logoSource = restaurant.logoUrl || restaurant.logo || post.logo || "";
    const logoUrl = resolveRestaurantLogoFn(post.restaurantId || post.ownerId, logoSource, "avatar");
    const imageUrl = getOptimizedImageUrlFn(post.image, "medium", {
      stableKey: postId ? `feed-hero:${postId}` : ""
    });
    return `
    <div class="group feed-card" ${feedAttr} ${feedRenderAttr}>
      <div class="flex items-center justify-between mb-5 px-2">
        <button data-profile-business="${escapeHtmlFn(post.business)}" data-profile-id="${escapeHtmlFn(post.restaurantId || "")}" class="flex items-center gap-3 text-left">
          <div class="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 italic overflow-hidden bg-slate-200">
            <img src="${escapeHtmlFn(logoUrl)}" ${logoAttrs} ${logoAttr} ${logoKeyAttr} decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />
          </div>
          <div>
            <h4 class="text-sm font-black flex items-center gap-1.5 uppercase tracking-tighter italic text-slate-900">${escapeHtmlFn(post.business)} ${iconFn("star", "w-3 h-3 text-indigo-500")}</h4>
            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${escapeHtmlFn(post.location)}</p>
          </div>
        </button>
        ${iconFn("more-horizontal", "w-5 h-5 text-slate-400")}
      </div>
      <div class="p-2.5 rounded-[3.5rem] shadow-2xl overflow-hidden relative bg-white shadow-slate-200/50 border border-slate-50">
        <div class="relative rounded-[3rem] overflow-hidden bg-slate-200">
          <img src="${escapeHtmlFn(imageUrl)}" ${heroAttrs} ${heroKeyAttr} decoding="async" class="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-1000" />
          ${post.isLive ? `
            <div class="absolute top-6 left-6 bg-red-600 text-white text-[9px] font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <div class="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div> LIVE
            </div>
          ` : ""}
          <div class="absolute bottom-6 left-6 right-6 p-6 bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 text-white">
            <p class="text-sm font-medium mb-4 line-clamp-2 leading-relaxed">${escapeHtmlFn(post.content)}</p>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <button type="button" data-feed-post-like="${escapeHtmlFn(postId)}" data-post-like-btn="${escapeHtmlFn(postId)}" class="flex items-center gap-2 text-white/80 hover:text-rose-400 transition-colors">
                  ${iconFn("heart", "w-5 h-5")} <span ${likeAttr} class="text-[10px] font-black">${escapeHtmlFn(post.likes)}</span>
                </button>
                <button type="button" data-feed-post-comment="${escapeHtmlFn(postId)}" class="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                  ${iconFn("message-circle", "w-5 h-5")} <span ${commentAttr} class="text-[10px] font-black">${escapeHtmlFn(post.comments)}</span>
                </button>
              </div>
              <button type="button" data-feed-post-share="${escapeHtmlFn(postId)}" class="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                ${iconFn("share-2", "w-4 h-4")} <span data-feed-share-label class="text-[10px] font-black uppercase tracking-widest">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  function renderFeedList(feedPosts) {
    if (!feedPosts.length) {
      return `<div class="text-center py-20 text-slate-400 font-bold text-xs uppercase">Keine Posts vorhanden</div>`;
    }
    return feedPosts.slice(0, 10).map((post, index) => renderFeedItem(post, index)).join("");
  }

  function patchFeedList(feedPosts) {
    const feedList = doc?.getElementById("feedList");
    if (!feedList) return false;
    if (!feedPosts.length) {
      feedList.innerHTML = renderFeedList(feedPosts);
      return true;
    }
    const existingItems = Array.from(feedList.querySelectorAll("[data-feed-id]"));
    const currentIds = existingItems.map((el) => el.dataset.feedId || "");
    const nextIds = feedPosts.map((post) => String(post.id || ""));
    if (currentIds.join("|") === nextIds.join("|")) {
      feedPosts.forEach((post, index) => {
        const existing = existingItems[index];
        if (!existing) return;
        const nextSignature = buildFeedRenderSignature(post);
        const currentSignature = String(existing.getAttribute("data-feed-render-sig") || "").trim();
        if (currentSignature === nextSignature) return;
        const tpl = doc.createElement("template");
        tpl.innerHTML = renderFeedItem(post, index);
        const nextNode = tpl.content.firstElementChild;
        if (!nextNode) return;
        existing.replaceWith(nextNode);
      });
      feedPosts.forEach(updatePostCountNodesFn);
      feedPosts.forEach(updateFeedLogoNodesFn);
      return true;
    }
    const existingMap = new Map();
    existingItems.forEach((el) => existingMap.set(el.dataset.feedId || "", el));
    const fragment = doc.createDocumentFragment();
    feedPosts.forEach((post, index) => {
      const postId = String(post.id || "");
      const existing = postId ? existingMap.get(postId) : null;
      if (existing) {
        existingMap.delete(postId);
        fragment.appendChild(existing);
      } else {
        const tpl = doc.createElement("template");
        tpl.innerHTML = renderFeedItem(post, index);
        const node = tpl.content.firstElementChild;
        if (node) fragment.appendChild(node);
      }
    });
    feedList.replaceChildren(fragment);
    feedPosts.forEach(updatePostCountNodesFn);
    feedPosts.forEach(updateFeedLogoNodesFn);
    return true;
  }

  function patchStoriesRow(stories) {
    const storiesRow = doc?.getElementById("storiesRow");
    if (!storiesRow) return false;
    if (!Array.isArray(stories) || stories.length === 0) {
      storiesRow.innerHTML = renderStoriesRow([]);
      return true;
    }
    const uploadWrap = storiesRow.querySelector("[data-story-upload-wrap]");
    if (!uploadWrap) {
      storiesRow.innerHTML = renderStoriesRow(stories);
      return true;
    }
    const existingItems = Array.from(storiesRow.querySelectorAll("[data-story-item]"));
    const existingMap = new Map();
    existingItems.forEach((el) => existingMap.set(el.dataset.storyItem || "", el));
    const fragment = doc.createDocumentFragment();
    fragment.appendChild(uploadWrap);
    stories.forEach((story) => {
      const id = String(story.restaurantId || "");
      const existing = id ? existingMap.get(id) : null;
      const nextSignature = buildStoryRenderSignature(story);
      const currentSignature = String(existing?.getAttribute?.("data-story-render-sig") || "").trim();
      if (existing && currentSignature === nextSignature) {
        existingMap.delete(id);
        fragment.appendChild(existing);
      } else {
        const tpl = doc.createElement("template");
        tpl.innerHTML = renderStoryItem(story);
        const node = tpl.content.firstElementChild;
        if (node) fragment.appendChild(node);
      }
    });
    storiesRow.replaceChildren(fragment);
    return true;
  }

  function ensureFeedComposerVisibility(feedView) {
    if (!doc || !feedView) return;
    const feedList = doc.getElementById("feedList");
    if (!feedList) return;
    const existingComposer = feedView.querySelector("[data-feed-composer-wrap]");
    const showComposer = shouldShowFeedComposer();
    if (!showComposer) {
      if (existingComposer) existingComposer.remove();
      return;
    }
    if (existingComposer) return;
    const tpl = doc.createElement("template");
    tpl.innerHTML = renderFeedComposer();
    const node = tpl.content.firstElementChild;
    if (!node) return;
    feedList.parentNode?.insertBefore(node, feedList);
  }

  function updateFeedDom() {
    const feedView = doc?.getElementById("feedView");
    if (!feedView) return false;
    const feedViewMode = String(feedView.dataset.feedViewMode || "feed").trim().toLowerCase();
    if (feedViewMode === "location") {
      bindFeedDelegation();
      syncFeedLocationGateDom();
      if (win?.lucide?.createIcons) win.lucide.createIcons();
      return true;
    }
    const feedPosts = state.feedPosts
      .filter((p) => state.feedCategory === "all" || p.category === state.feedCategory)
      .sort((a, b) => (toDateSafeFn(b.createdAt)?.getTime() || 0) - (toDateSafeFn(a.createdAt)?.getTime() || 0));
    const stories = (Array.isArray(state.stories) ? state.stories : []).filter((story) => isRenderableStory(story));
    const storiesRow = doc.getElementById("storiesRow");
    const nextSig = `${buildStoriesRowSignatureFn(stories)}|upload:${shouldShowStoryUploadSlot() ? "1" : "0"}`;
    if (storiesRow) {
      const renderedStoryCount = storiesRow.querySelectorAll("[data-story-item]").length;
      const expectedStoryCount = Array.isArray(stories) ? stories.length : 0;
      const hasUploadWrap = !!storiesRow.querySelector("[data-story-upload-wrap]");
      const shouldShowUploadWrap = shouldShowStoryUploadSlot();
      const needsStructurePatch = renderedStoryCount !== expectedStoryCount || hasUploadWrap !== shouldShowUploadWrap;
      if (getStoriesRowSignatureFn() !== nextSig || needsStructurePatch) {
        patchStoriesRow(stories);
        setStoriesRowSignatureFn(nextSig);
      }
      stories.forEach((story) => {
        updateStoryLogoNodesFn(story);
        updateStoryMetaNodesFn(story);
      });
    }
    ensureFeedComposerVisibility(feedView);
    patchFeedList(feedPosts);
    feedPosts.forEach(updateFeedLogoNodesFn);
    ensureFeedRestaurantMetaListenersFn(feedPosts);
    bindFeedDelegation();
    preloadFeedHeroImagesFn(feedPosts);
    if (win?.lucide?.createIcons) win.lucide.createIcons();
    return true;
  }

  function renderFeedView() {
    if (String(state?.activeTab || "").trim().toLowerCase() === "location") {
      return renderFeedLocationView();
    }
    if (isFeedLocationRequired()) {
      return renderFeedLocationView();
    }
    const feedPosts = state.feedPosts
      .filter((p) => state.feedCategory === "all" || p.category === state.feedCategory)
      .sort((a, b) => (toDateSafeFn(b.createdAt)?.getTime() || 0) - (toDateSafeFn(a.createdAt)?.getTime() || 0));
    const stories = (Array.isArray(state.stories) ? state.stories : []).filter((story) => isRenderableStory(story));
    const withEntranceAnimation = !!feedEntranceAnimationQueued;
    feedEntranceAnimationQueued = false;
    return `
    ${withEntranceAnimation ? `
      <style>
        #feedView.feed-view-slide-enter {
          animation: feedViewSlideIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity;
        }
        @keyframes feedViewSlideIn {
          0% { opacity: 0; transform: translateY(44px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      </style>
    ` : ""}
    <div id="feedView" data-feed-view-mode="feed" class="${withEntranceAnimation ? "feed-view-slide-enter" : ""}">
      <div id="storiesRow" class="flex gap-4 overflow-x-auto px-8 pt-6 pb-8 no-scrollbar">
        ${renderStoriesRow(stories)}
      </div>
      ${renderFeedComposer()}
      <div id="feedList" class="px-8 py-4 space-y-12">
        ${renderFeedList(feedPosts)}
      </div>
    </div>
  `;
  }

  function bindFeedDelegation() {
    const feedView = doc?.getElementById("feedView");
    if (!feedView || feedView.dataset.bound === "true") return;
    const isLocationView = () => String(feedView.dataset.feedViewMode || "").trim().toLowerCase() === "location";
    const handleStoryWarmup = (target) => {
      if (isLocationView()) return;
      if (!(target instanceof Element)) return;
      const storyLink = target.closest("[data-story-item]");
      if (!(storyLink instanceof Element)) return;
      const storyTruth = String(storyLink.getAttribute("data-story-truth") || "").trim().toLowerCase();
      if (storyTruth === "feed-fallback") return;
      warmStoryViewer(
        storyLink.getAttribute("data-story-item") || "",
        storyLink.getAttribute("data-story-url") || storyLink.getAttribute("href") || ""
      );
    };
    feedView.addEventListener("pointerdown", (event) => {
      handleStoryWarmup(event.target);
    }, { passive: true });
    feedView.addEventListener("touchstart", (event) => {
      handleStoryWarmup(event.target);
    }, { passive: true });
    feedView.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cityInput = target.closest("[data-feed-location-city-input]");
      if (!(cityInput instanceof HTMLInputElement)) return;
      syncFeedLocationSuggestionsDom(cityInput.value);
    });
    feedView.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cityInput = target.closest("[data-feed-location-city-input]");
      if (!(cityInput instanceof HTMLInputElement)) return;
      if (doc?.activeElement === cityInput) return;
      event.preventDefault();
      try {
        cityInput.focus({ preventScroll: true });
      } catch {
        cityInput.focus();
      }
    });
    feedView.addEventListener("touchstart", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cityInput = target.closest("[data-feed-location-city-input]");
      if (!(cityInput instanceof HTMLInputElement)) return;
      if (doc?.activeElement === cityInput) return;
      event.preventDefault();
      try {
        cityInput.focus({ preventScroll: true });
      } catch {
        cityInput.focus();
      }
    }, { passive: false });
    feedView.addEventListener("focusin", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cityInput = target.closest("[data-feed-location-city-input]");
      if (!(cityInput instanceof HTMLInputElement)) return;
      syncFeedLocationSuggestionsDom(cityInput.value);
    });
    feedView.addEventListener("focusout", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cityInput = target.closest("[data-feed-location-city-input]");
      if (!cityInput) return;
      setTimeoutFn(() => {
        const active = doc?.activeElement;
        if (active instanceof Element && (active.closest("[data-feed-location-city-input]") || active.closest("[data-feed-city-suggestion]"))) {
          return;
        }
        hideFeedLocationSuggestions();
      }, 120);
    });
    feedView.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cityInput = target.closest("[data-feed-location-city-input]");
      if (!(cityInput instanceof HTMLInputElement)) return;
      const rawValue = String(cityInput.value || "").trim();
      if (!rawValue) return;
      const suggestion = getFeedLocationCitySuggestions(rawValue, 1)[0];
      if (!suggestion) return;
      if (normalizeLocationQuery(rawValue) !== normalizeLocationQuery(suggestion.label)) return;
      hideFeedLocationSuggestions();
      const applied = applyViewerLocationSelection({
        lat: suggestion.lat,
        lng: suggestion.lng,
        label: suggestion.label,
        city: suggestion.city || suggestion.label,
        source: "city-search"
      });
      if (!applied) {
        requestViewerLocationAccess({ fallbackCity: suggestion });
      }
    });
    feedView.addEventListener("keydown", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cityInput = target.closest("[data-feed-location-city-input]");
      if (!(cityInput instanceof HTMLInputElement)) return;
      if (event.key === "Escape") {
        hideFeedLocationSuggestions();
        return;
      }
      if (event.key !== "Enter") return;
      const suggestion = getFeedLocationCitySuggestions(cityInput.value, 1)[0];
      if (!suggestion) return;
      event.preventDefault();
      cityInput.value = suggestion.label;
      hideFeedLocationSuggestions();
      const applied = applyViewerLocationSelection({
        lat: suggestion.lat,
        lng: suggestion.lng,
        label: suggestion.label,
        city: suggestion.city || suggestion.label,
        source: "city-search"
      });
      if (!applied) {
        requestViewerLocationAccess({ fallbackCity: suggestion });
      }
    });
    feedView.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const citySuggestion = target.closest("[data-feed-city-suggestion]");
      if (citySuggestion) {
        const cityOption = findFeedLocationCityOption(citySuggestion.getAttribute("data-feed-city-suggestion") || "");
        if (cityOption) {
          const cityInput = doc?.getElementById("feedLocationCityInput");
          if (cityInput instanceof HTMLInputElement) cityInput.value = cityOption.label;
          hideFeedLocationSuggestions();
          const applied = applyViewerLocationSelection({
            lat: cityOption.lat,
            lng: cityOption.lng,
            label: cityOption.label,
            city: cityOption.city || cityOption.label,
            source: "city-search"
          });
          if (!applied) {
            requestViewerLocationAccess({ fallbackCity: cityOption });
          }
        }
        return;
      }
      const locationBtn = target.closest("[data-feed-location-request]");
      if (locationBtn) {
        requestViewerLocationAccess({ forceExact: true });
        return;
      }
      const storyLink = target.closest("[data-story-item]");
      if (storyLink) {
        handleStoryWarmup(storyLink);
        return;
      }
      const likeBtn = target.closest("[data-feed-post-like]");
      if (likeBtn) {
        const postId = likeBtn.dataset.feedPostLike || "";
        if (postId) {
          void togglePostLikeFn(postId);
        }
        return;
      }
      const commentBtn = target.closest("[data-feed-post-comment]");
      if (commentBtn) {
        const postId = commentBtn.dataset.feedPostComment || "";
        const post = findFeedPostById(postId);
        if (post) {
          const feedCard = commentBtn.closest("[data-feed-id]");
          const previewImage = feedCard?.querySelector?.(`[data-img-key="feed-hero:${postId}"]`) || null;
          const previewImageSrc = String(
            previewImage?.currentSrc
            || previewImage?.getAttribute?.("src")
            || ""
          ).trim();
          void Promise.resolve(openPostModalFn(post, {
            previewImageEl: previewImage,
            previewImageSrc
          })).then(() => {
            focusPostCommentComposer();
          });
        }
        return;
      }
      const shareBtn = target.closest("[data-feed-post-share]");
      if (shareBtn) {
        const postId = shareBtn.dataset.feedPostShare || "";
        const post = findFeedPostById(postId);
        if (!post) return;
        const url = buildFeedShareUrl(post);
        const title = String(post.business || "Menyra").trim() || "Menyra";
        const text = [title, String(post.content || post.caption || "").trim()].filter(Boolean).join("\n");
        if (win?.navigator?.share) {
          void win.navigator.share({ title, text, url })
            .then(() => {
              setShareButtonFeedback(shareBtn, "Geteilt");
            })
            .catch(async (err) => {
              if (String(err?.name || "").trim() === "AbortError") return;
              const copied = await copyTextToClipboard(url);
              setShareButtonFeedback(shareBtn, copied ? "Kopiert" : "Link");
            });
        } else {
          void copyTextToClipboard(url).then((copied) => {
            setShareButtonFeedback(shareBtn, copied ? "Kopiert" : "Link");
          });
        }
        return;
      }
      const navBtn = target.closest("[data-nav]");
      if (navBtn) {
        const tab = navBtn.dataset.nav;
        if (tab) {
          if (tab === "favorites" && !String(state.user?.uid || "").trim()) {
            openGuestAuthPromptFn("Bitte registrieren oder einloggen, um Favoriten zu nutzen.");
            return;
          }
          const uploadPatch = tab === "upload"
            ? { upload: buildUploadStateForIntentFn(navBtn.dataset.uploadIntent || "", state.upload) }
            : {};
          const activeTab = tab === "favorites" ? "profile" : tab;
          const nextProfileTopTab = tab === "favorites"
            ? "favorites"
            : (tab === "profile" ? "profile" : state.profileTopTab);
          setStateFn({
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
        }
        return;
      }
      const profileBtn = target.closest("[data-profile-business]");
      if (profileBtn) {
        openProfileViewFromBusinessFn({
          id: profileBtn.dataset.profileId || "",
          name: profileBtn.dataset.profileBusiness || ""
        }, { showBack: false });
      }
    });
    if (isLocationView()) {
      syncFeedLocationGateDom();
    }
    feedView.dataset.bound = "true";
  }

  return {
    renderHomeView,
    renderFeedView,
    renderStoryItem,
    renderStoriesRow,
    renderFeedItem,
    renderFeedList,
      patchFeedList,
      patchStoriesRow,
      updateFeedDom,
      bindFeedDelegation
    };
}
