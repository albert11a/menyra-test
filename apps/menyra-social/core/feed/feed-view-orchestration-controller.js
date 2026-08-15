import { isImageUrlLoaded } from "../../_shared/image-resolver.js";
import { renderFeedCardMarkupCore } from "./feed-card-markup-utils.js";
import {
  renderStoryTileMarkupCore,
  renderStoryTileMediaFallbackCore
} from "./story-tile-markup-utils.js";
// Mnyra GO haengt mit genau zwei kleinen Modulen im Qyteti: einem, das die
// Karte als Text baut, und einem, das auf den Klick wartet. Alles Weitere -
// Modal, Suche, Firebase - kommt erst, wenn jemand sie antippt.
import { renderGoEntryCardCore } from "../go/go-entry-card-render-utils.js";
import { ensureGoEntryDelegation, readGoEntryState } from "../go/go-boot.js";

const FEED_EAGER_POST_LIMIT = 6;

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
  iconFn = () => "",
  escapeHtmlFn = (value) => String(value || ""),
  buildUrlFn = () => "",
  buildStoryViewerUrlFn = (restaurantId = "", _options = {}) => buildUrlFn("apps/menyra-social/index.html", { r: restaurantId, tab: "profile" }),
  resolveRestaurantLogoFn = () => "",
  resolveStoryRenderIdentityFn = null,
  getOptimizedImageUrlFn = () => "",
  getVerifiedMapLocationFn = () => null,
  setVerifiedMapLocationFn = null,
  buildUploadStateForIntentFn = (_intent = "", currentUpload = {}) => currentUpload,
  setStateFn = () => {},
  openGuestAuthPromptFn = () => false,
  openOwnBusinessProfileFn = null,
  openProfileViewFromBusinessFn = () => {},
  openPostModalFn = async () => {},
  togglePostLikeFn = async () => {},
  deleteOwnFeedPostFn = async () => {},
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
  const HtmlVideoElementCtor = typeof HTMLVideoElement === "function" ? HTMLVideoElement : null;
  const storyViewerHintPrefix = "mnyra_story_viewer_hint_v1:";
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
  const MAX_BEST_SPOT_ITEMS = 15;
  const BEST_SPOT_HEAD_COUNT = 6;
  const MAX_TRACK_STORY_ITEMS = 15;
  const FEED_COORD_CITY_MAX_DISTANCE_KM = 35;
  const FEED_LOCATION_TEXT_FIELDS = Object.freeze([
    "city",
    "locationCity",
    "primaryCity",
    "place",
    "locationPlace",
    "primaryPlace",
    "postalCity",
    "address",
    "primaryAddress",
    "formattedAddress",
    "fullAddress",
    "addressText",
    "streetAddress",
    "street",
    "locationLabel",
    "displayLocation",
    "locality",
    "town",
    "municipality",
    "village",
    "neighborhood",
    "neighbourhood",
    "area",
    "district",
    "county",
    "region",
    "state",
    "province"
  ]);
  const FEED_NESTED_LOCATION_FIELDS = Object.freeze([
    "location",
    "primaryLocation",
    "businessLocation",
    "venueLocation",
    "addressInfo",
    "geo",
    "coords",
    "coordinates",
    "geoPoint"
  ]);
  const TRACK_CARD_WIDTH_STYLE = "flex:0 0 29%;width:29%;max-width:120px;";
  const TRACK_CARD_HEIGHT_STYLE = "height:13rem;";
  const TRACK_CARD_RADIUS_STYLE = "border-radius:1rem;";
  const storyPreviewStateMap = new WeakMap();
  let storyPreviewObserver = null;
  let storyPreviewLifecycleBound = false;
  let storyPreviewGestureRetryBound = false;
  const buildTrackCardShellStyle = ({ withMarginLeft = false } = {}) => (
    `${TRACK_CARD_WIDTH_STYLE}${withMarginLeft ? "margin-left:1.25rem;" : ""}`
  );
  // touch-action stand hier auf "pan-x". Das heisst woertlich: in dieser Reihe
  // darf der Finger nur waagerecht ziehen. Setzte man ihn genau auf den Storys
  // ab und wollte die Seite nach unten schieben, verwarf der Browser die
  // senkrechte Geste - die Seite blieb stehen. "manipulation" erlaubt beide
  // Richtungen (und Zoom, nur kein Doppeltipp-Zoom): der Browser entscheidet
  // an der ersten Fingerbewegung, ob die Reihe waagerecht laeuft oder die
  // Seite senkrecht scrollt.
  const buildTrackRowViewportStyle = () => (
    "margin-left:calc(var(--app-content-inline,1.5rem) * -1);margin-right:calc(var(--app-content-inline,1.5rem) * -1);scroll-padding-left:1.25rem;overscroll-behavior-x:contain;touch-action:manipulation;-webkit-overflow-scrolling:touch;"
  );
  const buildTrackCardInnerStyle = (extra = "") => (
    `${TRACK_CARD_HEIGHT_STYLE}${TRACK_CARD_RADIUS_STYLE}position:relative;overflow:hidden;${extra}`
  );
  const normalizeMetricNumber = (value = 0) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return parsed;
  };
  const toStoryTimestampMs = (story = {}) => toTimestampMs(
    story?.createdAt
    || story?.updatedAt
    || story?.timestamp
    || story?.ts
    || story?.publishedAt
    || null
  );
  const isLikelyVideoMediaUrl = (value = "") => {
    const url = String(value || "").trim().toLowerCase();
    if (!url) return false;
    if (/\.m3u8($|\?)/.test(url)) return true;
    if (/\.mpd($|\?)/.test(url)) return true;
    if (/\.mp4($|\?)/.test(url)) return true;
    if (/\.webm($|\?)/.test(url)) return true;
    if (/\.mov($|\?)/.test(url)) return true;
    if (/\.m4v($|\?)/.test(url)) return true;
    if (/\.ogv($|\?)/.test(url)) return true;
    return false;
  };
  const resolveStoryPreviewMedia = (story = {}) => {
    const rawMediaType = String(story?.mediaType || story?.type || "").trim().toLowerCase();
    const imageUrl = String(story?.imageUrl || story?.thumbUrl || "").trim();
    const videoUrl = String(story?.videoUrl || story?.playbackUrl || "").trim();
    const mediaUrl = String(story?.mediaUrl || story?.url || "").trim();
    const embedUrl = String(story?.embedUrl || "").trim();
    // Do not fall back to logo/avatar media for story preview cards.
    const fallbackImage = String(
      story?.img
      || story?.image
      || story?.thumbnail
      || story?.thumbnailUrl
      || story?.previewImage
      || story?.previewUrl
      || story?.coverImage
      || story?.poster
      || story?.posterUrl
      || ""
    ).trim();
    const inferredVideo = isLikelyVideoMediaUrl(mediaUrl);
    const resolvedVideoUrl = videoUrl || (rawMediaType === "video" ? mediaUrl : (inferredVideo ? mediaUrl : ""));
    const resolvedImageUrl = imageUrl || (rawMediaType === "image" ? mediaUrl : "");
    if (resolvedVideoUrl) {
      return {
        kind: "video",
        src: resolvedVideoUrl,
        poster: resolvedImageUrl || fallbackImage,
        signature: `video:${resolvedVideoUrl}|${resolvedImageUrl || fallbackImage || ""}`
      };
    }
    if (resolvedImageUrl) {
      return {
        kind: "image",
        src: resolvedImageUrl,
        poster: resolvedImageUrl,
        signature: `image:${resolvedImageUrl}`
      };
    }
    if (fallbackImage) {
      return {
        kind: "image",
        src: fallbackImage,
        poster: fallbackImage,
        signature: `fallback:${fallbackImage}`
      };
    }
    if (embedUrl) {
      return {
        kind: "embed",
        src: embedUrl,
        poster: "",
        signature: `embed:${embedUrl}`
      };
    }
    return {
      kind: "none",
      src: "",
      poster: "",
      signature: "none"
    };
  };
  const buildStoryRenderSignature = (story = {}) => {
    const truthSource = normalizeStoryTruthSource(story);
    const preview = resolveStoryPreviewMedia(story);
    return [
      String(story?.restaurantId || story?.id || "").trim(),
      truthSource,
      story?.isLive ? "1" : "0",
      preview.signature
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
  const buildFeedHeroPreloadSignature = (posts = []) => (Array.isArray(posts) ? posts : [])
    .slice(0, 10)
    .map((post) => ([
      String(post?.id || "").trim(),
      String(post?.image || post?.url || "").trim()
    ].join("|")))
    .join(",");
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
    const feedPosts = Array.isArray(state?.feedPosts) ? state.feedPosts : [];
    return feedPosts.find((item) => String(item?.id || "").trim() === safePostId) || null;
  };
  const toTimestampMs = (value = null) => {
    const parsed = toDateSafeFn(value);
    const millis = Number(parsed?.getTime?.() || 0);
    return Number.isFinite(millis) ? millis : 0;
  };
  const resolveFeedRestaurantMap = () => {
    const map = new Map();
    const restaurants = Array.isArray(state?.restaurants) ? state.restaurants : [];
    restaurants.forEach((restaurant) => {
      const rid = String(restaurant?.id || restaurant?.restaurantId || "").trim();
      if (!rid || map.has(rid)) return;
      map.set(rid, restaurant);
    });
    return map;
  };
  const resolveFeedEntryRestaurantId = (entry = {}) => String(
    entry?.restaurantId
    || (String(entry?.ownerType || "").trim().toLowerCase() === "restaurant" ? entry?.ownerId : "")
    || entry?.rid
    || ""
  ).trim();
  const pushFeedLocationText = (values = [], value = "") => {
    if (typeof value === "string" || typeof value === "number") {
      const text = String(value || "").trim();
      if (text) values.push(text);
    }
  };
  const appendFeedLocationFields = (values = [], source = {}) => {
    if (!source || typeof source !== "object") return;
    FEED_LOCATION_TEXT_FIELDS.forEach((field) => pushFeedLocationText(values, source[field]));
    if (typeof source.location === "string" || typeof source.location === "number") {
      pushFeedLocationText(values, source.location);
    }
  };
  const normalizeFeedCityKey = (value = "") => normalizeLocationQuery(value)
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const resolveFeedCityAliasGroups = () => FEED_LOCATION_CITY_OPTIONS
    .map((option) => [option?.id, option?.label, option?.city, ...(Array.isArray(option?.aliases) ? option.aliases : [])]
      .map(normalizeFeedCityKey)
      .filter(Boolean))
    .filter((group) => group.length);
  const expandFeedCityKeys = (value = "") => {
    const key = normalizeFeedCityKey(value);
    if (!key) return [];
    const keys = new Set([key]);
    resolveFeedCityAliasGroups().forEach((group) => {
      if (group.includes(key)) group.forEach((alias) => keys.add(alias));
    });
    return Array.from(keys);
  };
  const matchesFeedCityText = (values = [], cityKeys = []) => {
    const normalizedValues = (Array.isArray(values) ? values : [])
      .map(normalizeFeedCityKey)
      .filter(Boolean);
    if (!normalizedValues.length || !cityKeys.length) return false;
    const haystack = normalizedValues.join(" ");
    return cityKeys.some((cityKey) => {
      const tokens = cityKey.split(" ").filter(Boolean);
      return normalizedValues.some((value) => value === cityKey || value.includes(cityKey))
        || (tokens.length > 0 && tokens.every((token) => haystack.includes(token)));
    });
  };
  const containsKnownFeedCity = (values = []) => {
    const normalizedValues = (Array.isArray(values) ? values : [])
      .map(normalizeFeedCityKey)
      .filter(Boolean);
    if (!normalizedValues.length) return false;
    const haystack = normalizedValues.join(" ");
    return resolveFeedCityAliasGroups().some((group) => group.some((cityKey) => {
      const tokens = cityKey.split(" ").filter(Boolean);
      return normalizedValues.some((value) => value === cityKey || value.includes(cityKey))
        || (tokens.length > 0 && tokens.every((token) => haystack.includes(token)));
    }));
  };
  const inferFeedCityLabelFromCoords = (record = {}) => {
    const coords = normalizeEntityCoords(record);
    if (!coords) return "";
    const nearest = FEED_LOCATION_CITY_OPTIONS
      .map((entry) => {
        const cityCoords = normalizeViewerCoords(entry);
        return {
          label: String(entry?.label || "").trim(),
          distanceKm: cityCoords ? haversineDistanceKm(coords, cityCoords) : Number.POSITIVE_INFINITY
        };
      })
      .filter((entry) => entry.label && Number.isFinite(entry.distanceKm))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0];
    return nearest && nearest.distanceKm <= FEED_COORD_CITY_MAX_DISTANCE_KM ? nearest.label : "";
  };
  const collectFeedCityTextCandidates = (...records) => {
    const values = [];
    records.forEach((record) => {
      if (!record || typeof record !== "object") return;
      appendFeedLocationFields(values, record);
      FEED_NESTED_LOCATION_FIELDS.forEach((field) => appendFeedLocationFields(values, record[field]));
      if (Array.isArray(record.locations)) {
        record.locations.forEach((location) => appendFeedLocationFields(values, location));
      }
    });
    return values;
  };
  const collectFeedInferredCityCandidates = (...records) => {
    const values = [];
    records.forEach((record) => pushFeedLocationText(values, inferFeedCityLabelFromCoords(record)));
    return values;
  };
  const matchesFeedViewerCity = ({ entry = {}, restaurant = null, viewerCity = "" } = {}) => {
    const cityKeys = expandFeedCityKeys(viewerCity);
    if (!cityKeys.length) return true;
    const explicitValues = collectFeedCityTextCandidates(restaurant, entry);
    if (matchesFeedCityText(explicitValues, cityKeys)) return true;
    if (containsKnownFeedCity(explicitValues)) return false;
    return matchesFeedCityText(collectFeedInferredCityCandidates(restaurant, entry), cityKeys);
  };
  const resolveFeedGeoScopedCollections = ({
    feedPosts = [],
    stories = []
  } = {}) => {
    const safeFeedPosts = Array.isArray(feedPosts) ? feedPosts : [];
    const safeStories = Array.isArray(stories) ? stories : [];
    const viewerLocation = normalizeViewerLocationRecord(resolveViewerLocationRecord());
    const viewerCity = resolveFeedViewerCityQuery(viewerLocation);
    const viewerCountryCode = resolveCountryCodeFromAnyRecord(viewerLocation);
    const viewerCoords = normalizeViewerCoords(viewerLocation);
    const restaurantMap = resolveFeedRestaurantMap();
    const shouldStrictCountryFilter = !!viewerCountryCode;
    const shouldStrictCityFilter = !!viewerCity;
    const withGeoMeta = (entry = {}, { type = "post", fallbackIndex = 0 } = {}) => {
      const restaurantId = resolveFeedEntryRestaurantId(entry);
      const restaurant = restaurantId ? restaurantMap.get(restaurantId) || null : null;
      const countryCode = resolveCountryCodeFromAnyRecord({
        ...(restaurant && typeof restaurant === "object" ? restaurant : {}),
        ...(entry && typeof entry === "object" ? entry : {})
      });
      if (shouldStrictCountryFilter) {
        if (!countryCode || countryCode !== viewerCountryCode) return null;
      }
      if (shouldStrictCityFilter && !matchesFeedViewerCity({ entry, restaurant, viewerCity })) return null;
      const coords = normalizeEntityCoords(restaurant) || normalizeEntityCoords(entry);
      const distanceKm = viewerCoords && coords
        ? haversineDistanceKm(viewerCoords, coords)
        : Number.POSITIVE_INFINITY;
      return {
        entry,
        fallbackIndex,
        distanceKm,
        createdAtMs: type === "post"
          ? toTimestampMs(entry?.createdAt || entry?.updatedAt)
          : toStoryTimestampMs(entry)
      };
    };
    // Das Neueste zuerst. Die Entfernung entscheidet erst, wenn zwei Eintraege
    // denselben Zeitstempel tragen (oder gar keinen) - vorher stand sie an
    // erster Stelle und ein Monate alter Beitrag aus dem Nachbarviertel
    // verdraengte den von heute Morgen aus derselben Stadt.
    const byNewestThenNearest = (a, b) => {
      if (a.createdAtMs !== b.createdAtMs) return b.createdAtMs - a.createdAtMs;
      const aFinite = Number.isFinite(a.distanceKm);
      const bFinite = Number.isFinite(b.distanceKm);
      if (aFinite && bFinite && Math.abs(a.distanceKm - b.distanceKm) > 0.001) {
        return a.distanceKm - b.distanceKm;
      }
      if (aFinite !== bFinite) return aFinite ? -1 : 1;
      return a.fallbackIndex - b.fallbackIndex;
    };
    // Derselbe Beitrag kann aus mehreren Quellen kommen (Feed-Projektion und
    // kanonischer Beitrag). Er darf nur einmal in der Liste stehen.
    const dedupeBy = (rows = [], readKey = () => "") => {
      const seen = new Set();
      const unique = [];
      rows.forEach((row) => {
        const key = String(readKey(row?.entry) || "").trim();
        if (key) {
          if (seen.has(key)) return;
          seen.add(key);
        }
        unique.push(row);
      });
      return unique;
    };
    const scopedFeedPosts = dedupeBy(
      safeFeedPosts
        .map((post, index) => withGeoMeta(post, { type: "post", fallbackIndex: index }))
        .filter(Boolean)
        .sort(byNewestThenNearest),
      (post) => post?.id
    ).map((row) => row.entry);
    const scopedStories = dedupeBy(
      safeStories
        .map((story, index) => withGeoMeta(story, { type: "story", fallbackIndex: index }))
        .filter(Boolean)
        .sort(byNewestThenNearest),
      (story) => resolveFeedEntryRestaurantId(story)
    ).map((row) => row.entry);
    return {
      feedPosts: scopedFeedPosts,
      stories: scopedStories
    };
  };
  const compareDistanceValues = (aDistance = Number.POSITIVE_INFINITY, bDistance = Number.POSITIVE_INFINITY) => {
    const aFinite = Number.isFinite(aDistance);
    const bFinite = Number.isFinite(bDistance);
    if (aFinite && bFinite && Math.abs(aDistance - bDistance) > 0.001) {
      return aDistance - bDistance;
    }
    if (aFinite !== bFinite) return aFinite ? -1 : 1;
    return 0;
  };
  const compareBestSpotStrength = (a = {}, b = {}) => {
    if (a.likes !== b.likes) return b.likes - a.likes;
    if (a.visitors !== b.visitors) return b.visitors - a.visitors;
    if (a.comments !== b.comments) return b.comments - a.comments;
    if (a.createdAtMs !== b.createdAtMs) return b.createdAtMs - a.createdAtMs;
    const distanceCompare = compareDistanceValues(a.distanceKm, b.distanceKm);
    if (distanceCompare !== 0) return distanceCompare;
    return a.fallbackIndex - b.fallbackIndex;
  };
  const normalizeRestaurantIdSet = (values = null) => {
    const ids = new Set();
    const source = values instanceof Set ? Array.from(values) : (Array.isArray(values) ? values : []);
    source.forEach((value) => {
      const id = String(value || "").trim();
      if (id) ids.add(id);
    });
    return ids;
  };
  const buildStoryRestaurantIdSet = (...storyGroups) => {
    const ids = new Set();
    storyGroups.forEach((stories) => {
      (Array.isArray(stories) ? stories : []).forEach((story) => {
        const identity = resolveStoryRenderIdentity(story);
        const id = String(story?.restaurantId || story?.storyId || identity.storyRestaurantId || "").trim();
        if (id) ids.add(id);
      });
    });
    return ids;
  };
  const resolveBestSpotTrackItems = (feedPosts = [], fallbackFeedPosts = [], excludedRestaurantIds = null) => {
    const safeFeedPosts = Array.isArray(feedPosts) ? feedPosts : [];
    const safeFallbackFeedPosts = Array.isArray(fallbackFeedPosts) ? fallbackFeedPosts : [];
    const sourcePosts = safeFeedPosts.length ? safeFeedPosts : safeFallbackFeedPosts;
    const viewerLocation = normalizeViewerLocationRecord(resolveViewerLocationRecord());
    const viewerCity = resolveFeedViewerCityQuery(viewerLocation);
    const viewerCoords = normalizeViewerCoords(viewerLocation);
    const viewerCountryCode = resolveCountryCodeFromAnyRecord(viewerLocation);
    const restaurantMap = resolveFeedRestaurantMap();
    const excludedRestaurantIdSet = normalizeRestaurantIdSet(excludedRestaurantIds);
    const bestBySpotId = new Map();
    const putCandidate = (candidate = null) => {
      if (!candidate || !candidate.spotId) return;
      const existing = bestBySpotId.get(candidate.spotId);
      if (!existing) {
        bestBySpotId.set(candidate.spotId, candidate);
        return;
      }
      if (compareBestSpotStrength(candidate, existing) < 0) {
        bestBySpotId.set(candidate.spotId, candidate);
      }
    };
    const toPostCandidate = (post = {}, fallbackIndex = 0) => {
      const restaurantId = resolveFeedEntryRestaurantId(post);
      const postId = String(post?.id || "").trim();
      const spotId = restaurantId || (postId ? `post:${postId}` : `idx:${fallbackIndex}`);
      const restaurant = restaurantId ? restaurantMap.get(restaurantId) || null : null;
      const countryCode = resolveCountryCodeFromAnyRecord({
        ...(restaurant && typeof restaurant === "object" ? restaurant : {}),
        ...(post && typeof post === "object" ? post : {})
      });
      if (viewerCountryCode && (!countryCode || countryCode !== viewerCountryCode)) {
        return null;
      }
      if (viewerCity && !matchesFeedViewerCity({ entry: post, restaurant, viewerCity })) {
        return null;
      }
      const coords = normalizeEntityCoords(restaurant) || normalizeEntityCoords(post);
      const distanceKm = viewerCoords && coords
        ? haversineDistanceKm(viewerCoords, coords)
        : Number.POSITIVE_INFINITY;
      const likes = Math.max(
        0,
        normalizeMetricNumber(post?.likes),
        normalizeMetricNumber(post?.likesCount)
      );
      const comments = Math.max(
        0,
        normalizeMetricNumber(post?.comments),
        normalizeMetricNumber(post?.commentsCount)
      );
      const visitors = Math.max(
        0,
        normalizeMetricNumber(post?.visitors),
        normalizeMetricNumber(post?.visitorCount),
        normalizeMetricNumber(post?.visitorsCount),
        normalizeMetricNumber(post?.views),
        normalizeMetricNumber(post?.viewCount),
        normalizeMetricNumber(post?.viewsCount),
        normalizeMetricNumber(post?.reach),
        normalizeMetricNumber(post?.reachCount),
        normalizeMetricNumber(post?.impressions),
        normalizeMetricNumber(post?.impressionsCount)
      );
      const rating = Math.max(
        0,
        normalizeMetricNumber(post?.rating),
        normalizeMetricNumber(post?.score),
        normalizeMetricNumber(post?.stars),
        normalizeMetricNumber(restaurant?.rating),
        normalizeMetricNumber(restaurant?.score),
        normalizeMetricNumber(restaurant?.stars)
      );
      const createdAtMs = toTimestampMs(post?.createdAt || post?.updatedAt);
      const displayName = String(
        post?.business
        || post?.restaurantName
        || restaurant?.name
        || restaurant?.restaurantName
        || "Best Spot"
      ).trim() || "Best Spot";
      const logoSource = String(
        restaurant?.bestSpotLogoUrl
        || restaurant?.spotLogoUrl
        || restaurant?.bestSpotLogo
        || restaurant?.spotLogo
        || restaurant?.logoUrl
        || restaurant?.logo
        || restaurant?.logoURL
        || post?.bestSpotLogoUrl
        || post?.spotLogoUrl
        || post?.logo
        || post?.image
        || post?.url
        || ""
      ).trim();
      const avatarUrl = restaurantId
        ? resolveRestaurantLogoFn(restaurantId, logoSource, "avatar", false)
        : logoSource;
      const profileUrl = restaurantId
        ? buildUrlFn("apps/menyra-social/index.html", { r: restaurantId, tab: "profile", source: "best-spot" })
        : buildUrlFn("apps/menyra-social/index.html", { tab: "feed", post: postId, source: "best-spot" });
      return {
        spotId,
        postId,
        restaurantId,
        displayName,
        avatarUrl,
        profileUrl,
        likes,
        comments,
        visitors,
        rating,
        distanceKm,
        createdAtMs,
        fallbackIndex
      };
    };
    const toRestaurantCandidate = (restaurant = {}, fallbackIndex = 0) => {
      const restaurantId = String(restaurant?.id || restaurant?.restaurantId || "").trim();
      if (!restaurantId) return null;
      const statusKey = String(restaurant?.status || "").trim().toLowerCase();
      if (statusKey === "archived" || statusKey === "deleted" || statusKey === "blocked" || statusKey === "disabled") {
        return null;
      }
      const countryCode = resolveCountryCodeFromAnyRecord(restaurant);
      if (viewerCountryCode && (!countryCode || countryCode !== viewerCountryCode)) {
        return null;
      }
      if (viewerCity && !matchesFeedViewerCity({ entry: restaurant, restaurant, viewerCity })) {
        return null;
      }
      const coords = normalizeEntityCoords(restaurant);
      const distanceKm = viewerCoords && coords
        ? haversineDistanceKm(viewerCoords, coords)
        : Number.POSITIVE_INFINITY;
      const likes = Math.max(
        0,
        normalizeMetricNumber(restaurant?.likes),
        normalizeMetricNumber(restaurant?.likesCount),
        normalizeMetricNumber(restaurant?.likeCount),
        normalizeMetricNumber(restaurant?.socialLikes),
        normalizeMetricNumber(restaurant?.socialLikesCount),
        normalizeMetricNumber(restaurant?.followersCount),
        normalizeMetricNumber(restaurant?.followers)
      );
      const comments = Math.max(
        0,
        normalizeMetricNumber(restaurant?.comments),
        normalizeMetricNumber(restaurant?.commentsCount),
        normalizeMetricNumber(restaurant?.reviewCount),
        normalizeMetricNumber(restaurant?.reviews),
        normalizeMetricNumber(restaurant?.reviewsCount),
        normalizeMetricNumber(restaurant?.ratingsCount)
      );
      const visitors = Math.max(
        0,
        normalizeMetricNumber(restaurant?.visitors),
        normalizeMetricNumber(restaurant?.visitorCount),
        normalizeMetricNumber(restaurant?.visitorsCount),
        normalizeMetricNumber(restaurant?.views),
        normalizeMetricNumber(restaurant?.viewCount),
        normalizeMetricNumber(restaurant?.viewsCount),
        normalizeMetricNumber(restaurant?.reach),
        normalizeMetricNumber(restaurant?.reachCount),
        normalizeMetricNumber(restaurant?.impressions),
        normalizeMetricNumber(restaurant?.impressionsCount),
        normalizeMetricNumber(restaurant?.ordersCount),
        normalizeMetricNumber(restaurant?.orders)
      );
      const rating = Math.max(
        0,
        normalizeMetricNumber(restaurant?.rating),
        normalizeMetricNumber(restaurant?.score),
        normalizeMetricNumber(restaurant?.stars)
      );
      const createdAtMs = toTimestampMs(
        restaurant?.createdAt
        || restaurant?.updatedAt
        || restaurant?.truthUpdatedAt
      );
      const displayName = String(
        restaurant?.name
        || restaurant?.restaurantName
        || restaurant?.displayName
        || restaurant?.businessName
        || "Best Spot"
      ).trim() || "Best Spot";
      const logoSource = String(
        restaurant?.bestSpotLogoUrl
        || restaurant?.spotLogoUrl
        || restaurant?.bestSpotLogo
        || restaurant?.spotLogo
        || restaurant?.logoUrl
        || restaurant?.logo
        || restaurant?.logoURL
        || restaurant?.image
        || restaurant?.coverImage
        || ""
      ).trim();
      const avatarUrl = resolveRestaurantLogoFn(restaurantId, logoSource, "avatar", false);
      const profileUrl = buildUrlFn("apps/menyra-social/index.html", {
        r: restaurantId,
        tab: "profile",
        source: "best-spot"
      });
      return {
        spotId: restaurantId,
        postId: "",
        restaurantId,
        displayName,
        avatarUrl,
        profileUrl,
        likes,
        comments,
        visitors,
        rating,
        distanceKm,
        createdAtMs,
        fallbackIndex
      };
    };

    sourcePosts.forEach((post, index) => {
      putCandidate(toPostCandidate(post, index));
    });

    if (!sourcePosts.length || bestBySpotId.size < MAX_BEST_SPOT_ITEMS) {
      let fallbackOffset = sourcePosts.length + 1000;
      Array.from(restaurantMap.values()).forEach((restaurant) => {
        const candidate = toRestaurantCandidate(restaurant, fallbackOffset);
        fallbackOffset += 1;
        if (!candidate) return;
        if (bestBySpotId.has(candidate.spotId)) return;
        putCandidate(candidate);
      });
    }

    const dedupedSpots = Array.from(bestBySpotId.values()).filter((row) => {
      if (!excludedRestaurantIdSet.size) return true;
      const restaurantId = String(row?.restaurantId || "").trim();
      return !restaurantId || !excludedRestaurantIdSet.has(restaurantId);
    });
    if (!dedupedSpots.length) return [];
    const hasFiniteDistance = dedupedSpots.some((row) => Number.isFinite(row?.distanceKm));
    const scopedSpots = hasFiniteDistance
      ? dedupedSpots.filter((row) => Number.isFinite(row?.distanceKm))
      : dedupedSpots;
    if (!scopedSpots.length) return [];
    const strongest = [...scopedSpots]
      .sort(compareBestSpotStrength)
      .slice(0, BEST_SPOT_HEAD_COUNT);
    const strongestIds = new Set(strongest.map((row) => row.spotId));
    const remaining = scopedSpots
      .filter((row) => !strongestIds.has(row.spotId))
      .sort((a, b) => {
        const distanceCompare = compareDistanceValues(a.distanceKm, b.distanceKm);
        if (distanceCompare !== 0) return distanceCompare;
        return compareBestSpotStrength(a, b);
      });
    return [...strongest, ...remaining]
      .slice(0, MAX_BEST_SPOT_ITEMS)
      .map((row, index) => ({
        ratingDisplay: (() => {
          const explicit = normalizeMetricNumber(row?.rating);
          if (explicit > 0) {
            return Math.max(1, Math.min(5, explicit)).toFixed(1);
          }
          const signal = Math.max(
            1,
            normalizeMetricNumber(row?.likes) * 1.2
            + normalizeMetricNumber(row?.visitors) * 0.05
            + normalizeMetricNumber(row?.comments) * 0.6
          );
          const normalized = 4.2 + Math.min(0.75, Math.log10(1 + signal) / 4.5);
          return normalized.toFixed(1);
        })(),
        ...row,
        rank: index + 1,
        renderSignature: [
          row.spotId,
          row.postId,
          row.displayName,
          row.avatarUrl,
          String(index + 1),
          String(row.rating || 0),
          String(row.likes || 0),
          String(row.visitors || 0),
          Number(row.distanceKm).toFixed(3),
          String(row.createdAtMs || 0)
        ].join("|")
      }));
  };
  // Storys stehen nach Aktualitaet, nicht nach Entfernung. Vorher schob die
  // Entfernung eine Story von gestern vor die von vor zehn Minuten, nur weil
  // das Lokal ein paar Strassen naeher liegt. Laufende Live-Storys stehen
  // vorne, danach das Neueste; die Entfernung entscheidet erst bei gleichem
  // Zeitstempel.
  const compareStoryNewestFirst = (a = {}, b = {}) => {
    const aLive = !!a.isLive;
    const bLive = !!b.isLive;
    if (aLive !== bLive) return aLive ? -1 : 1;
    if (a.createdAtMs !== b.createdAtMs) return b.createdAtMs - a.createdAtMs;
    const distanceCompare = compareDistanceValues(a.distanceKm, b.distanceKm);
    if (distanceCompare !== 0) return distanceCompare;
    return a.fallbackIndex - b.fallbackIndex;
  };
  const resolveStoryTrackItems = (stories = [], fallbackStories = []) => {
    const safeStories = Array.isArray(stories) ? stories : [];
    const safeFallbackStories = Array.isArray(fallbackStories) ? fallbackStories : [];
    const sourceStories = safeStories.length ? safeStories : safeFallbackStories;
    if (!sourceStories.length) return [];
    const viewerLocation = normalizeViewerLocationRecord(resolveViewerLocationRecord());
    const viewerCity = resolveFeedViewerCityQuery(viewerLocation);
    const viewerCoords = normalizeViewerCoords(viewerLocation);
    const restaurantMap = resolveFeedRestaurantMap();
    const dedupedStories = new Map();
    sourceStories.forEach((story, fallbackIndex) => {
      const identity = resolveStoryRenderIdentity(story);
      const restaurantId = identity.storyRestaurantId;
      if (!restaurantId) return;
      const restaurant = restaurantMap.get(restaurantId) || null;
      if (viewerCity && !matchesFeedViewerCity({ entry: story, restaurant, viewerCity })) return;
      const coords = normalizeEntityCoords(restaurant) || normalizeEntityCoords(story);
      const distanceKm = viewerCoords && coords
        ? haversineDistanceKm(viewerCoords, coords)
        : Number.POSITIVE_INFINITY;
      const createdAtMs = toStoryTimestampMs(story);
      const preview = resolveStoryPreviewMedia(story);
      const storyLabel = String(identity.storyLabel || "").trim() || "Story";
      const storyUrl = buildStoryViewerUrlFn(restaurantId);
      const profileImageUrl = resolveRestaurantLogoFn(
        restaurantId,
        String(identity.logoSource || "").trim(),
        "thumb",
        false
      );
      const candidate = {
        ...story,
        storyId: restaurantId,
        restaurantId,
        storyLabel,
        storyUrl,
        profileImageUrl,
        preview,
        distanceKm,
        createdAtMs,
        isLive: !!story?.isLive,
        fallbackIndex
      };
      const existing = dedupedStories.get(restaurantId);
      if (!existing) {
        dedupedStories.set(restaurantId, candidate);
        return;
      }
      if (compareStoryNewestFirst(candidate, existing) < 0) {
        dedupedStories.set(restaurantId, candidate);
      }
    });
    const deduped = Array.from(dedupedStories.values());
    const hasFiniteDistance = deduped.some((row) => Number.isFinite(row?.distanceKm));
    const scopedStories = hasFiniteDistance
      ? deduped.filter((row) => Number.isFinite(row?.distanceKm))
      : deduped;
    return scopedStories
      .sort(compareStoryNewestFirst)
      .slice(0, MAX_TRACK_STORY_ITEMS);
  };
  const buildMixedSpotStoryTrackItems = ({ spots = [], stories = [] } = {}) => {
    const safeSpots = Array.isArray(spots) ? spots : [];
    const safeStories = Array.isArray(stories) ? stories : [];
    if (!safeSpots.length && !safeStories.length) return [];
    if (!safeStories.length) return safeSpots.map((spot) => ({ type: "spot", spot }));
    if (!safeSpots.length) return safeStories.map((story) => ({ type: "story", story }));
    const mixed = [];
    let spotIndex = 0;
    let storyIndex = 0;
    while (spotIndex < safeSpots.length || storyIndex < safeStories.length) {
      if (spotIndex < safeSpots.length) {
        mixed.push({ type: "spot", spot: safeSpots[spotIndex] });
        spotIndex += 1;
      }
      if (storyIndex < safeStories.length) {
        mixed.push({ type: "story", story: safeStories[storyIndex] });
        storyIndex += 1;
      }
    }
    return mixed;
  };
  const buildSpotStoryTrackSignature = ({ spots = [], stories = [] } = {}) => buildMixedSpotStoryTrackItems({ spots, stories })
    .map((entry) => {
      if (entry.type === "spot") {
        const spot = entry?.spot || {};
        return [
          "spot",
          String(spot?.spotId || "").trim(),
          String(spot?.postId || "").trim(),
          String(spot?.displayName || "").trim(),
          String(spot?.avatarUrl || "").trim(),
          String(spot?.rank || "").trim()
        ].join(":");
      }
      return `story:${buildStoryRenderSignature(entry?.story || {})}`;
    })
    .join(",");
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
  const setShareButtonFeedback = (button, label = "Linku u kopjua") => {
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
  // Sofort-Hintergrund fuer das Beitrags-Modal: das Medium der Feed-Karte liegt
  // bereits im Cache, das Modal steht damit ohne zweite Anfrage. Bei Video-
  // Beitraegen ist das Poster die Bildquelle - die Video-URL an ein <img> zu
  // geben kostet auf 3G nur eine Leeranfrage und zwei Wartefenster.
  const resolveFeedHeroPreview = (trigger, postId) => {
    const card = trigger?.closest?.("[data-feed-id]") || null;
    const node = card?.querySelector?.(`[data-img-key="feed-hero:${postId}"]`) || null;
    if (!node) return { previewImageEl: null, previewImageSrc: "" };
    if (String(node.tagName || "").toLowerCase() === "video") {
      return {
        previewImageEl: null,
        previewImageSrc: String(node.getAttribute?.("poster") || "").trim()
      };
    }
    return {
      previewImageEl: node,
      previewImageSrc: String(node.currentSrc || node.getAttribute?.("src") || "").trim()
    };
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
    { id: "prishtina", label: "Prishtina", lat: 42.6629, lng: 21.1655, aliases: ["prishtine", "prishtin", "pristina"] },
    { id: "prizren", label: "Prizren", lat: 42.2139, lng: 20.7397, aliases: ["prizr", "prizreni"] },
    { id: "peja", label: "Peja", lat: 42.6591, lng: 20.2883, aliases: ["peje", "pec"] },
    { id: "gjakova", label: "Gjakova", lat: 42.3803, lng: 20.4308, aliases: ["gjakove", "djakova"] },
    { id: "ferizaj", label: "Ferizaj", lat: 42.3706, lng: 21.1553, aliases: ["feri", "ferizaji", "uroshevac"] },
    { id: "gjilan", label: "Gjilan", lat: 42.4635, lng: 21.4699, aliases: ["gjilani"] },
    { id: "mitrovica", label: "Mitrovica", lat: 42.8914, lng: 20.8660, aliases: ["mitrovice", "mitro"] },
    { id: "vushtrria", label: "Vushtrria", lat: 42.8231, lng: 20.9675, aliases: ["vushtrri"] },
    { id: "podujeva", label: "Podujeva", lat: 42.9106, lng: 21.1930, aliases: ["podujeve", "podu"] },
    { id: "tirana", label: "Tirana", lat: 41.3275, lng: 19.8187, aliases: ["tirane"], country: "Shqiperi" },
    { id: "kukes", label: "Kukes", lat: 42.0769, lng: 20.4219, aliases: ["kukes albania"], country: "Shqiperi" },
    { id: "smederevo", label: "Smederevo", lat: 44.6644, lng: 20.9276, aliases: ["smederevo serbia"], country: "Serbi" }
  ]);
  const FEED_COUNTRY_BOUNDS = Object.freeze({
    xk: Object.freeze({ minLat: 41.85, maxLat: 43.35, minLng: 20.0, maxLng: 21.85 }),
    al: Object.freeze({ minLat: 39.55, maxLat: 42.75, minLng: 19.0, maxLng: 21.1 }),
    rs: Object.freeze({ minLat: 42.2, maxLat: 46.3, minLng: 18.7, maxLng: 23.1 })
  });
  const FEED_COUNTRY_CITY_HINTS = Object.freeze({
    xk: Object.freeze([
      "prishtina", "prishtine", "prizren", "peja", "peje", "gjakova", "gjakove",
      "ferizaj", "gjilan", "mitrovica", "mitrovice", "vushtrria", "vushtrri",
      "podujeva", "podujeve"
    ]),
    al: Object.freeze([
      "tirana", "tirane", "kukes", "durres", "vlore", "shkoder", "elbasan",
      "fier", "korce", "sarande"
    ]),
    rs: Object.freeze([
      "smederevo", "beograd", "belgrade", "novi sad", "nis", "kragujevac",
      "subotica", "pancevo"
    ])
  });
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
  let lastFeedHeroPreloadSignature = "";
  let feedStageAutoPinScrollQueued = false;
  let feedStageAutoPinScrollFrame = null;
  let feedStagePinSyncCleanup = null;
  let feedStagePinSyncStageEl = null;
  let feedStagePinSyncBentoEl = null;
  let feedLocationControlDelegationBound = false;
  let feedCountryCityHintMap = null;
  const locationRemoteSuggestionCache = new Map();
  const locationRemoteSuggestionById = new Map();
  const normalizeLocationQuery = (value = "") => String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const isGenericFeedLocationLabel = (value = "") => {
    const key = normalizeLocationQuery(value);
    return key === "current location"
      || key === "vendndodhja aktuale"
      || key === "trenutna lokacija"
      || key === "standort"
      || key === "aktueller standort";
  };
  const resolveFeedViewerCityQuery = (viewerLocation = null) => {
    const city = String(viewerLocation?.city || "").trim();
    if (city && !isGenericFeedLocationLabel(city)) return city;
    const label = String(viewerLocation?.label || "").trim();
    if (label && !isGenericFeedLocationLabel(label)) return label;
    return "";
  };
  // Ueber dem Feed steht der Name der Stadt, in der der Nutzer gerade steht -
  // gewaehlt oder erkannt. Steht nur "Vendndodhja aktuale" (GPS ohne bekannten
  // Ort) im Datensatz, bleibt der Platz mit "Qyteti" besetzt statt leer.
  const resolveFeedHeadlineCityName = () => {
    const viewerLocation = normalizeViewerLocationRecord(resolveViewerLocationRecord());
    const city = resolveFeedViewerCityQuery(viewerLocation);
    return city || "Qyteti";
  };
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
  const resolveCountryCodeFromCoords = (value = null) => {
    const coords = normalizeViewerCoords(value);
    if (!coords) return "";
    const lat = Number(coords.lat);
    const lng = Number(coords.lng);
    const inBounds = (bounds = null) => !!bounds
      && lat >= Number(bounds.minLat)
      && lat <= Number(bounds.maxLat)
      && lng >= Number(bounds.minLng)
      && lng <= Number(bounds.maxLng);
    // Keep Kosovo first because its box sits inside the wider Serbia region.
    if (inBounds(FEED_COUNTRY_BOUNDS.xk)) return "xk";
    if (inBounds(FEED_COUNTRY_BOUNDS.al)) return "al";
    if (inBounds(FEED_COUNTRY_BOUNDS.rs)) return "rs";
    return "";
  };
  const resolveFeedCountryCityHintMap = () => {
    if (feedCountryCityHintMap instanceof Map) return feedCountryCityHintMap;
    const map = new Map();
    const register = (term = "", code = "") => {
      const normalizedTerm = normalizeLocationQuery(term);
      const normalizedCode = toCountryCode(code);
      if (!normalizedTerm || !normalizedCode) return;
      map.set(normalizedTerm, normalizedCode);
    };
    Object.entries(FEED_COUNTRY_CITY_HINTS).forEach(([code, hints]) => {
      (Array.isArray(hints) ? hints : []).forEach((hint) => register(hint, code));
    });
    resolveFeedLocationCityOptions().forEach((option) => {
      const optionCode = toCountryCode(option?.countryCode || option?.country);
      if (!optionCode) return;
      register(option?.label, optionCode);
      register(option?.city, optionCode);
      (Array.isArray(option?.searchTerms) ? option.searchTerms : []).forEach((term) => register(term, optionCode));
    });
    feedCountryCityHintMap = map;
    return map;
  };
  const resolveCountryCodeFromTextHints = (...values) => {
    const hintMap = resolveFeedCountryCityHintMap();
    for (const value of values) {
      const directCode = toCountryCode(value);
      if (directCode) return directCode;
      const normalized = normalizeLocationQuery(value);
      if (!normalized) continue;
      const directHint = hintMap.get(normalized);
      if (directHint) return directHint;
      const tokens = normalized.split(" ").filter(Boolean);
      for (const token of tokens) {
        const tokenHint = hintMap.get(token);
        if (tokenHint) return tokenHint;
      }
    }
    return "";
  };
  const resolveCountryCodeFromAnyRecord = (record = null) => {
    if (!record || typeof record !== "object") return "";
    return toCountryCode(
      record?.countryCode
      || record?.country_code
      || record?.country
      || record?.geo?.countryCode
      || record?.geo?.country_code
      || record?.geo?.country
      || record?.coords?.countryCode
      || record?.coords?.country
      || record?.location?.countryCode
      || record?.location?.country
      || ""
    )
      || resolveCountryCodeFromTextHints(
        record?.country,
        record?.geo?.country,
        record?.coords?.country,
        record?.location?.country,
        record?.city,
        record?.geo?.city,
        record?.coords?.city,
        record?.location?.city,
        record?.label,
        record?.address,
        record?.location
      )
      || resolveCountryCodeFromCoords(record);
  };
  const normalizeEntityCoords = (value = null) => {
    if (!value || typeof value !== "object") return null;
    return normalizeViewerCoords(value)
      || normalizeViewerCoords({ lat: value?.latitude, lng: value?.longitude })
      || normalizeViewerCoords({ lat: value?.gpsLat, lng: value?.gpsLng })
      || normalizeViewerCoords({ lat: value?.geo?.lat, lng: value?.geo?.lng })
      || normalizeViewerCoords({ lat: value?.geo?.latitude, lng: value?.geo?.longitude })
      || normalizeViewerCoords({ lat: value?.coords?.lat, lng: value?.coords?.lng })
      || normalizeViewerCoords({ lat: value?.coords?.latitude, lng: value?.coords?.longitude })
      || normalizeViewerCoords({ lat: value?.location?.lat, lng: value?.location?.lng });
  };
  const haversineDistanceKm = (a = null, b = null) => {
    const from = normalizeViewerCoords(a);
    const to = normalizeViewerCoords(b);
    if (!from || !to) return Number.POSITIVE_INFINITY;
    const earthRadiusKm = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(Number(to.lat) - Number(from.lat));
    const dLng = toRad(Number(to.lng) - Number(from.lng));
    const lat1 = toRad(Number(from.lat));
    const lat2 = toRad(Number(to.lat));
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const aVal = sinDLat * sinDLat + (Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng);
    const cVal = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return earthRadiusKm * cVal;
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
    const rawCity = String(value?.city || "").trim();
    const city = rawCity || (isGenericFeedLocationLabel(label) ? "" : label);
    const source = String(value?.source || "").trim().toLowerCase();
    const countryCode = resolveCountryCodeFromAnyRecord({
      ...(value && typeof value === "object" ? value : {}),
      lat: coords.lat,
      lng: coords.lng,
      label,
      city
    });
    const country = toCountryLabel(value?.country || value?.countryCode || value?.country_code || countryCode)
      || toCountryLabel(countryCode)
      || "";
    return {
      lat: coords.lat,
      lng: coords.lng,
      label,
      city,
      country,
      countryCode,
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
  const setFeedGateResolveChromeState = (active = false) => {
    const next = !!active;
    const htmlEl = doc?.documentElement || null;
    const bodyEl = doc?.body || null;
    htmlEl?.classList?.toggle?.("feed-location-gate-resolving", next);
    bodyEl?.classList?.toggle?.("feed-location-gate-resolving", next);
    try {
      const setUiChromeMode = win?.__MENYRA_SOCIAL_SET_UI_CHROME_MODE__;
      if (next && typeof setUiChromeMode === "function") {
        setUiChromeMode("app");
      }
      const forceUiChrome = win?.__MENYRA_SOCIAL_FORCE_UI_CHROME__;
      if (typeof forceUiChrome === "function") forceUiChrome();
    } catch {}
  };
  const clearFeedStageAutoPinScrollFrame = () => {
    if (!feedStageAutoPinScrollFrame) return;
    if (typeof win?.cancelAnimationFrame === "function") {
      try {
        win.cancelAnimationFrame(feedStageAutoPinScrollFrame);
      } catch {}
    } else {
      try {
        clearTimeout(feedStageAutoPinScrollFrame);
      } catch {}
    }
    feedStageAutoPinScrollFrame = null;
  };
  const resolveFeedStageAutoScrollHost = () => {
    if (!win || !doc) return null;
    const mainScrollHost = doc.querySelector("main.app-main-scroll");
    if (!(mainScrollHost instanceof HTMLElement)) return null;
    const style = win.getComputedStyle?.(mainScrollHost);
    const overflowY = String(style?.overflowY || style?.overflow || "").trim().toLowerCase();
    const usesOwnScroll = overflowY === "auto"
      || overflowY === "scroll"
      || overflowY === "overlay";
    const hasScrollableRange = (Number(mainScrollHost.scrollHeight || 0) - Number(mainScrollHost.clientHeight || 0)) > 1;
    if (!usesOwnScroll || !hasScrollableRange) return null;
    return mainScrollHost;
  };
  const scrollFeedBentoIntoPinnedStop = ({ behavior = "smooth" } = {}) => {
    if (!win || !doc) return false;
    const gateRoot = doc.getElementById("feedLocationGate");
    if (!(gateRoot instanceof HTMLElement)) return false;
    const pinOutline = gateRoot.querySelector(".feed-bento-pin-outline");
    if (!(pinOutline instanceof HTMLElement)) return false;
    const mainScrollHost = resolveFeedStageAutoScrollHost();
    const useMainScrollHost = mainScrollHost instanceof HTMLElement;
    const stickyTop = Math.max(
      0,
      Math.round(parseFloat(win.getComputedStyle?.(pinOutline)?.top || "0") || 0)
    );
    const scrollViewportTop = useMainScrollHost
      ? Math.round(Number(mainScrollHost.getBoundingClientRect().top || 0))
      : 0;
    const currentScrollY = useMainScrollHost
      ? Math.max(0, Number(mainScrollHost.scrollTop || 0))
      : Math.max(0, Number(win.scrollY || win.pageYOffset || doc?.documentElement?.scrollTop || 0));
    const pinOutlineTop = Math.round(Number(pinOutline.getBoundingClientRect().top || 0));
    const targetScrollY = Math.max(
      0,
      currentScrollY + (pinOutlineTop - (scrollViewportTop + stickyTop))
    );
    if (Math.abs(targetScrollY - currentScrollY) < 2) return true;
    if (useMainScrollHost) {
      try {
        mainScrollHost.scrollTo({ top: targetScrollY, behavior });
      } catch {
        mainScrollHost.scrollTop = targetScrollY;
      }
      return true;
    }
    try {
      win.scrollTo({ top: targetScrollY, behavior });
    } catch {
      win.scrollTo(0, targetScrollY);
    }
    return true;
  };
  const queueFeedStageAutoPinScroll = () => {
    if (!feedStageAutoPinScrollQueued) return;
    feedStageAutoPinScrollQueued = false;
    clearFeedStageAutoPinScrollFrame();
    // Mit der Header-Tab-Zeile besteht dieser Einstiegs-Scroll praktisch nur
    // noch daraus, genau diese Zeile wegzuschieben - man landet auf dem Feed
    // und die Tabs blenden sich sofort wieder aus. Der Bento pinnt ohnehin,
    // sobald der Nutzer selbst scrollt.
    if (doc?.getElementById?.("smart-tabs")) return;
    let attempts = 0;
    const maxAttempts = 4;
    const initialRafPasses = 4;
    const runAttempt = () => {
      attempts += 1;
      const behavior = attempts === 1 ? "smooth" : "auto";
      scrollFeedBentoIntoPinnedStop({ behavior });
      if (attempts >= maxAttempts) {
        clearFeedStageAutoPinScrollFrame();
        return;
      }
      feedStageAutoPinScrollFrame = setTimeoutFn(runAttempt, attempts === 1 ? 420 : 130);
    };
    if (typeof win?.requestAnimationFrame === "function") {
      let rafPass = 0;
      const scheduleNextPass = () => {
        feedStageAutoPinScrollFrame = win.requestAnimationFrame(() => {
          rafPass += 1;
          if (rafPass < initialRafPasses) {
            scheduleNextPass();
            return;
          }
          feedStageAutoPinScrollFrame = null;
          runAttempt();
        });
      };
      scheduleNextPass();
      return;
    }
    feedStageAutoPinScrollFrame = setTimeoutFn(() => {
      feedStageAutoPinScrollFrame = null;
      runAttempt();
    }, 80);
  };
  const stopFeedStagePinSync = () => {
    clearFeedStageAutoPinScrollFrame();
    if (typeof feedStagePinSyncCleanup === "function") {
      try {
        feedStagePinSyncCleanup();
      } catch {}
    }
    feedStagePinSyncCleanup = null;
    feedStagePinSyncStageEl = null;
    feedStagePinSyncBentoEl = null;
  };
  const bindFeedStagePinSync = (feedView = null) => {
    stopFeedStagePinSync();
    return;
    if (!win || !(feedView instanceof HTMLElement)) {
      return;
    }
    const mode = String(feedView.dataset.feedViewMode || "").trim().toLowerCase();
    if (mode !== "feed") {
      return;
    }
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
  const FEED_GATE_I18N = Object.freeze({
    en: Object.freeze({
      locale: "en",
      htmlLang: "en",
      searchPlaceholder: "Enter your city...",
      useLocationAriaLabel: "Use location",
      currentLocationLabel: "Current location",
      statusRequesting: "Requesting location...",
      statusDenied: "Location access was denied.",
      statusTimeout: "Location did not load in time. Please try again.",
      statusUnsupported: "Location access is not supported on this device.",
      statusError: "Location could not be determined.",
      statusUnsupportedHttps: "Location access requires HTTPS.",
      chaptersAriaLabel: "What MNYRA offers",
      topSliderItems: Object.freeze([
        "DISCOVER SPOTS.",
        "FIND OFFERS.",
        "OPEN MENUS."
      ]),
      topCityLine: "IN YOUR CITY.",
      chapters: Object.freeze([
        Object.freeze({
          title: "Restaurants",
          body: "Find the best restaurants, cafes and spots in your city."
        }),
        Object.freeze({
          title: "Offers",
          body: "Discover special offers only on Mnyra. Enjoy a lunch, a dinner or simply a coffee with the people closest to you, at your favourite spot."
        }),
        Object.freeze({
          title: "Events",
          body: "With Mnyra you always stay in step with your city. Discover events, new venues and the well-known places around you."
        })
      ])
    }),
    sq: Object.freeze({
      locale: "sq",
      htmlLang: "sq",
      searchPlaceholder: "Shkruaj qytetin...",
      useLocationAriaLabel: "Perdor vendndodhjen",
      currentLocationLabel: "Vendndodhja aktuale",
      statusRequesting: "Po kerkohet vendndodhja...",
      statusDenied: "Leja e vendndodhjes u refuzua.",
      statusTimeout: "Vendndodhja nuk u mor me kohe. Provo perseri.",
      statusUnsupported: "Vendndodhja nuk mbeshtetet ne kete pajisje.",
      statusError: "Vendndodhja nuk u gjet.",
      statusUnsupportedHttps: "Vendndodhja kerkon HTTPS.",
      chaptersAriaLabel: "Cfare te ofron MNYRA",
      topSliderItems: Object.freeze([
        "ZBULO SPOTET.",
        "GJEJ OFERTA.",
        "HAP MENYTE."
      ]),
      topCityLine: "NE QYTETIN TEND.",
      chapters: Object.freeze([
        Object.freeze({
          title: "Restorante",
          body: "Gjej restorantet, kafenetë dhe lokalet më të mira në qytetin tënd."
        }),
        Object.freeze({
          title: "Oferta",
          body: "Zbulo oferta speciale vetëm në Mnyra. Shijo një drekë, një darkë apo thjesht një kafe me më të dashurit e tu në lokalin tënd të preferuar."
        }),
        Object.freeze({
          title: "Evente",
          body: "Me Mnyra, qëndro gjithmonë në hap me qytetin tënd. Zbulo eventet, lokalet e reja dhe vendet e njohura përreth teje."
        })
      ])
    }),
    sr: Object.freeze({
      locale: "sr",
      htmlLang: "sr",
      searchPlaceholder: "Unesi svoj grad...",
      useLocationAriaLabel: "Koristi lokaciju",
      currentLocationLabel: "Trenutna lokacija",
      statusRequesting: "Trazi se lokacija...",
      statusDenied: "Pristup lokaciji je odbijen.",
      statusTimeout: "Lokacija nije ucitana na vreme. Pokusaj ponovo.",
      statusUnsupported: "Lokacija nije podrzana na ovom uredjaju.",
      statusError: "Lokacija nije mogla da se odredi.",
      statusUnsupportedHttps: "Pristup lokaciji zahteva HTTPS.",
      chaptersAriaLabel: "Sta nudi MNYRA",
      topSliderItems: Object.freeze([
        "OTKRIJ MESTA.",
        "NADJI PONUDE.",
        "OTVORI MENIJE."
      ]),
      topCityLine: "U SVOM GRADU.",
      chapters: Object.freeze([
        Object.freeze({
          title: "Restorani",
          body: "Nadji najbolje restorane, kafice i mesta u svom gradu."
        }),
        Object.freeze({
          title: "Ponude",
          body: "Otkrij posebne ponude samo na Mnyra. Uzivaj u rucku, veceri ili prosto u kafi sa najblizima, u svom omiljenom lokalu."
        }),
        Object.freeze({
          title: "Dogadjaji",
          body: "Uz Mnyra uvek ides u korak sa svojim gradom. Otkrij dogadjaje, nova mesta i poznate lokale oko sebe."
        })
      ])
    })
  });
  const normalizeFeedGateLocale = (value = "") => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    const base = raw.split(/[_-]/)[0];
    if (["sq", "al", "alb"].includes(base)) return "sq";
    if (["sr", "rs", "srb"].includes(base)) return "sr";
    if (["en", "gb", "uk", "us"].includes(base)) return "en";
    return "";
  };
  const readFeedGateLocaleParam = () => {
    const locationObj = win?.location;
    if (!locationObj) return "";
    const paramKeys = ["lang", "locale", "hl"];
    const tryParams = (queryText = "") => {
      const params = new URLSearchParams(String(queryText || ""));
      for (const key of paramKeys) {
        const value = String(params.get(key) || "").trim();
        if (value) return value;
      }
      return "";
    };
    const directQueryValue = tryParams(String(locationObj.search || "").replace(/^\?/, ""));
    if (directQueryValue) return directQueryValue;
    const hash = String(locationObj.hash || "");
    if (hash) {
      const queryIndex = hash.indexOf("?");
      const hashQuery = queryIndex >= 0
        ? hash.slice(queryIndex + 1)
        : hash.replace(/^#\/?/, "");
      const hashValue = tryParams(hashQuery);
      if (hashValue) return hashValue;
    }
    const pathSegments = String(locationObj.pathname || "")
      .split("/")
      .map((segment) => String(segment || "").trim().toLowerCase())
      .filter(Boolean);
    for (let index = pathSegments.length - 1; index >= 0; index -= 1) {
      const segment = pathSegments[index];
      if (!segment || segment.includes(".")) continue;
      if (normalizeFeedGateLocale(segment)) return segment;
    }
    return "";
  };
  const resolveFeedGateLocale = () => {
    const explicit = normalizeFeedGateLocale(readFeedGateLocaleParam());
    if (explicit) return explicit;
    // Die im App-Sprachmenue gewaehlte Sprache hat Vorrang vor der
    // Browser-Sprache; ohne Auswahl ist Albanisch die Hauptsprache.
    let appLocale = "";
    try {
      appLocale = normalizeFeedGateLocale(String(win?.localStorage?.getItem("menyra_lang") || "").trim());
    } catch {}
    if (appLocale) return appLocale;
    // Bewusst ohne Browser-Sprache: die uebrige App laeuft immer auf Albanisch,
    // solange im Sprachmenue nichts anderes gewaehlt ist. Der Standort-Dialog
    // muss demselben Stand folgen, sonst steht hier Englisch in einer sonst
    // albanischen Oberflaeche.
    return "sq";
  };
  const resolveFeedGateCopy = () => FEED_GATE_I18N[resolveFeedGateLocale()] || FEED_GATE_I18N.en;
  const resolveLocationGateStatusText = () => {
    const gateCopy = resolveFeedGateCopy();
    if (locationGateMessage) return locationGateMessage;
    if (locationGateStatus === "requesting") return gateCopy.statusRequesting;
    if (locationGateStatus === "denied") return gateCopy.statusDenied;
    if (locationGateStatus === "timeout") return gateCopy.statusTimeout;
    if (locationGateStatus === "unsupported") return gateCopy.statusUnsupported;
    if (locationGateStatus === "error") return gateCopy.statusError;
    return "";
  };
  const resolveLocationScreenMode = () => "feed-gate";
  const isFeedLocationScopeActive = () => !!doc?.getElementById("feedLocationCityInput");
  const getRenderedLocationScreenMode = () => {
    const rootMode = String(doc?.getElementById("feedView")?.dataset?.locationScreenMode || "").trim().toLowerCase();
    if (rootMode) return rootMode;
    const gateMode = String(doc?.getElementById("feedLocationGate")?.dataset?.locationScreenMode || "").trim().toLowerCase();
    return gateMode || resolveLocationScreenMode();
  };
  // Die drei Abschnitte unter dem Standort-Bereich blenden sich beim Scrollen
  // ein. Ein Beobachter reicht dafuer: er setzt einmal je Abschnitt das
  // Merkmal, das den CSS-Uebergang startet, und laesst ihn dann los. Ohne
  // IntersectionObserver (sehr alte Browser) stehen alle Abschnitte sofort -
  // sichtbar bleibt der Inhalt in jedem Fall.
  let feedGateChapterObserver = null;
  const revealFeedGateChapter = (node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.dataset.feedGateChapterRevealed === "1") return;
    node.dataset.feedGateChapterRevealed = "1";
  };
  const syncFeedGateChapterRevealDom = () => {
    const chapters = Array.from(doc?.querySelectorAll?.("[data-feed-gate-chapter]") || [])
      .filter((node) => node instanceof HTMLElement);
    if (!chapters.length) {
      if (feedGateChapterObserver) {
        feedGateChapterObserver.disconnect();
        feedGateChapterObserver = null;
      }
      return;
    }
    const ObserverCtor = typeof win?.IntersectionObserver === "function" ? win.IntersectionObserver : null;
    if (!ObserverCtor) {
      chapters.forEach(revealFeedGateChapter);
      return;
    }
    if (!feedGateChapterObserver) {
      feedGateChapterObserver = new ObserverCtor((entries) => {
        entries.forEach((entry) => {
          if (!entry?.isIntersecting) return;
          revealFeedGateChapter(entry.target);
          feedGateChapterObserver?.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    }
    chapters.forEach((chapter) => {
      if (chapter.dataset.feedGateChapterRevealed === "1") return;
      if (chapter.dataset.feedGateChapterObserved === "1") return;
      chapter.dataset.feedGateChapterObserved = "1";
      feedGateChapterObserver.observe(chapter);
    });
  };
  const renderFeedLocationLocateIcon = (name = "crosshair", className = "w-5 h-5 relative z-10") => {
    const allowedName = String(name || "").trim().toLowerCase();
    const safeName = allowedName === "check" || allowedName === "loader-circle" ? allowedName : "crosshair";
    const safeClassName = String(className || "").trim() || "w-5 h-5 relative z-10";
    return iconFn(safeName, safeClassName, {
      id: "locateIcon",
      "data-feed-location-current-icon": safeName
    }) || `<i id="locateIcon" data-lucide="${escapeHtmlFn(safeName)}" data-feed-location-current-icon="${escapeHtmlFn(safeName)}" class="${escapeHtmlFn(safeClassName)}"></i>`;
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
      const nextIconName = locationGateResolveTransitionPending
        ? "loader-circle"
        : (hasLocation && !locationRequestPending ? "check" : "crosshair");
      const iconBaseClass = String(locateIcon.getAttribute("class") || "w-5 h-5 relative z-10")
        .replace(/\banimate-spin\b/g, "")
        .replace(/\s+/g, " ")
        .trim() || "w-5 h-5 relative z-10";
      if (String(locateIcon.getAttribute("data-feed-location-current-icon") || "").trim() !== nextIconName && doc) {
        const tpl = doc.createElement("template");
        tpl.innerHTML = renderFeedLocationLocateIcon(nextIconName, iconBaseClass).trim();
        const nextIcon = tpl.content.firstElementChild;
        if (nextIcon instanceof HTMLElement || (typeof SVGElement === "function" && nextIcon instanceof SVGElement)) {
          nextIcon.classList.toggle("animate-spin", busy);
          locateIcon.replaceWith(nextIcon);
        }
      } else {
        locateIcon.classList.toggle("animate-spin", busy);
      }
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
    syncFeedGateChapterRevealDom();
    if (win?.lucide?.createIcons) win.lucide.createIcons();
  };
  const setLocationGateState = (status = "idle", message = "") => {
    locationGateStatus = String(status || "idle").trim().toLowerCase();
    locationGateMessage = String(message || "").trim();
    syncFeedLocationGateDom();
  };
  // Kennt die lokale Stadtliste die GPS-Position nicht (z.B. Diaspora), holt
  // ein Reverse-Geocode den echten Stadtnamen nach und ersetzt das generische
  // "Vendndodhja aktuale" im Feld und im gespeicherten Datensatz.
  const refineViewerLocationCityFromCoords = async (coords = null) => {
    const safeCoords = normalizeViewerCoords(coords);
    if (!safeCoords) return;
    const fetchClient = typeof win?.fetch === "function" ? win.fetch.bind(win) : null;
    if (!fetchClient) return;
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    let timeoutHandle = null;
    if (controller) {
      timeoutHandle = setTimeoutFn(() => {
        try {
          controller.abort();
        } catch {}
      }, FEED_LOCATION_REMOTE_TIMEOUT_MS);
    }
    try {
      const endpoint = new URL("https://photon.komoot.io/reverse");
      endpoint.searchParams.set("lat", String(safeCoords.lat));
      endpoint.searchParams.set("lon", String(safeCoords.lng));
      endpoint.searchParams.set("limit", "1");
      const response = await fetchClient(endpoint.toString(), {
        method: "GET",
        signal: controller?.signal,
        headers: { "Accept-Language": "sq,sr,de,en" }
      });
      if (!response?.ok) return;
      const payload = await response.json();
      const properties = payload?.features?.[0]?.properties || {};
      const cityName = String(properties.city || properties.town || properties.village || properties.name || "").trim();
      if (!cityName || isGenericFeedLocationLabel(cityName)) return;
      const record = normalizeViewerLocationRecord(resolveViewerLocationRecord());
      if (!record || String(record.source || "") !== "gps") return;
      if (haversineDistanceKm(record, safeCoords) > 1) return;
      if (record.city && !isGenericFeedLocationLabel(record.city)) return;
      const updated = normalizeViewerLocationRecord({
        ...record,
        label: cityName,
        city: cityName,
        country: String(properties.country || record.country || "").trim(),
        savedAt: Date.now()
      });
      if (!updated) return;
      persistViewerLocation(updated);
      const cityInput = doc?.getElementById("feedLocationCityInput");
      if (cityInput instanceof HTMLInputElement && doc?.activeElement !== cityInput) {
        const currentValue = String(cityInput.value || "").trim();
        if (!currentValue || isGenericFeedLocationLabel(currentValue)) cityInput.value = cityName;
      }
      setStateFn({});
    } catch {
    } finally {
      if (timeoutHandle) {
        try {
          clearTimeout(timeoutHandle);
        } catch {}
      }
    }
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
    if (state.activeTab === "restaurants") {
      setStateFn({});
      return true;
    }
    const gateRoot = doc?.getElementById("feedLocationGate");
    const locationScreenMode = getRenderedLocationScreenMode();
    const shouldStayOnLocationScreen = locationScreenMode === "location";
    const feedViewMode = String(doc?.getElementById("feedView")?.dataset?.feedViewMode || "").trim().toLowerCase();
    const isFeedAlreadyVisible = feedViewMode === "feed";
    const shouldAnimateResolve = !shouldStayOnLocationScreen && !isFeedAlreadyVisible;
    if (!shouldStayOnLocationScreen) {
      const activeEl = doc?.activeElement;
      if (activeEl && typeof activeEl.blur === "function") {
        try {
          activeEl.blur();
        } catch {}
      }
    }
    if (shouldStayOnLocationScreen || !shouldAnimateResolve) {
      feedEntranceAnimationQueued = false;
      feedStageAutoPinScrollQueued = false;
      clearFeedStageAutoPinScrollFrame();
      locationGateResolveTransitionPending = false;
      gateRoot?.classList?.remove?.("feed-location-gate--resolving");
      setFeedGateResolveChromeState(false);
    } else {
      feedEntranceAnimationQueued = false;
      feedStageAutoPinScrollQueued = true;
      locationGateResolveTransitionPending = true;
      gateRoot?.classList?.add?.("feed-location-gate--resolving");
      setFeedGateResolveChromeState(true);
    }
    syncFeedLocationGateDom();
    if (shouldStayOnLocationScreen) {
      clearLocationGateResolveTimer();
      return true;
    }
    if (!shouldAnimateResolve) {
      clearLocationGateResolveTimer();
      setFeedGateResolveChromeState(false);
      const activeTabKey = String(state?.activeTab || "").trim().toLowerCase();
      if (!activeTabKey || activeTabKey === "feed" || activeTabKey === "home") {
        setStateFn({ activeTab: "feed" });
      }
      return true;
    }
    clearLocationGateResolveTimer();
    locationGateResolveTimer = setTimeoutFn(() => {
      locationGateResolveTimer = null;
      locationGateResolveTransitionPending = false;
      gateRoot?.classList?.remove?.("feed-location-gate--resolving");
      setFeedGateResolveChromeState(false);
      const activeTabKey = String(state?.activeTab || "").trim().toLowerCase();
      if (activeTabKey && activeTabKey !== "feed" && activeTabKey !== "home") {
        return;
      }
      setStateFn({ activeTab: "feed" });
      feedStageAutoPinScrollQueued = true;
      queueFeedStageAutoPinScroll();
    }, 360);
    return true;
  };
  const requestViewerLocationAccess = ({ fallbackCity = null, forceExact = false } = {}) => {
    const gateCopy = resolveFeedGateCopy();
    const fallbackOption = fallbackCity && typeof fallbackCity === "object"
      ? fallbackCity
      : findFeedLocationCityOption(fallbackCity);
    if (fallbackOption && !forceExact) {
      applyViewerLocationSelection({
        lat: fallbackOption.lat,
        lng: fallbackOption.lng,
        label: fallbackOption.label,
        city: fallbackOption.city || fallbackOption.label,
        country: fallbackOption.country,
        countryCode: fallbackOption.countryCode,
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
      setLocationGateState("unsupported", gateCopy.statusUnsupportedHttps);
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
          // Der echte Stadtname gehoert ins Feld, nicht "Vendndodhja aktuale":
          // erst die naechste bekannte Stadt aus den Koordinaten, sonst der
          // getippte Text; ein Reverse-Geocode verfeinert danach asynchron.
          const inferredCity = inferFeedCityLabelFromCoords(coords);
          const typedCity = currentLabel && !isGenericFeedLocationLabel(currentLabel) ? currentLabel : "";
          const resolvedCity = inferredCity || typedCity;
          applyViewerLocationSelection({
            lat: coords.lat,
            lng: coords.lng,
            label: resolvedCity || gateCopy.currentLocationLabel,
            city: resolvedCity,
            countryCode: resolveCountryCodeFromCoords(coords),
            source: "gps"
          });
          if (!inferredCity) void refineViewerLocationCityFromCoords(coords);
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
  // Die drei Abschnitte unter dem Standort-Bereich. Bewusst ruhig gehalten:
  // eine feine Akzentlinie, eine grosse Ueberschrift, ein Absatz. Jeder
  // Abschnitt blendet sich beim Heranscrollen einmal ein.
  const FEED_GATE_CHAPTER_ACCENTS = Object.freeze(["#00cce5", "#6366f1", "#f59e0b"]);
  const renderFeedGateChapter = ({ title = "", body = "" } = {}, index = 0) => {
    const safeTitle = escapeHtmlFn(String(title || "").trim());
    const safeBody = escapeHtmlFn(String(body || "").trim());
    if (!safeTitle && !safeBody) return "";
    const accent = FEED_GATE_CHAPTER_ACCENTS[index % FEED_GATE_CHAPTER_ACCENTS.length];
    return `
      <article
        class="feed-gate-chapter"
        data-feed-gate-chapter
        data-feed-gate-chapter-index="${escapeHtmlFn(String(index))}"
        style="--feed-gate-chapter-accent:${escapeHtmlFn(accent)};"
      >
        <span class="feed-gate-chapter__rule" aria-hidden="true"></span>
        <h3 class="feed-gate-chapter__title">${safeTitle}</h3>
        <p class="feed-gate-chapter__body">${safeBody}</p>
      </article>
    `;
  };
  const renderFeedGateBentoContent = (gateCopy = resolveFeedGateCopy()) => {
    const chapters = Array.isArray(gateCopy?.chapters) ? gateCopy.chapters : [];
    return `
      <section
        class="feed-gate-chapters"
        data-feed-gate-chapters
        aria-label="${escapeHtmlFn(String(gateCopy?.chaptersAriaLabel || "MNYRA"))}"
      >
        ${chapters.map((chapter, index) => renderFeedGateChapter(chapter, index)).join("")}
        <div class="feed-gate-chapters-spacer" aria-hidden="true"></div>
      </section>
    `;
  };
  function renderLocationGate({
    mode = resolveLocationScreenMode(),
    bentoContentHtml = "",
    showSearchControls = true,
    showTopSection = true
  } = {}) {
    const gateCopy = resolveFeedGateCopy();
    const viewerLocation = resolveViewerLocationRecord();
    const cityValue = String(viewerLocation?.label || viewerLocation?.city || "").trim();
    const safeMode = String(mode || "feed-gate").trim().toLowerCase() || "feed-gate";
    const shouldRenderSearchControls = showSearchControls !== false;
    const shouldRenderTopSection = showTopSection !== false;
    const customBentoContent = String(
      bentoContentHtml
      || renderFeedGateBentoContent(gateCopy)
    ).trim();
    return `
      <div id="feedLocationGate" data-location-screen-mode="${escapeHtmlFn(safeMode)}" data-feed-gate-locale="${escapeHtmlFn(String(gateCopy?.locale || "en"))}" lang="${escapeHtmlFn(String(gateCopy?.htmlLang || "en"))}">
        <style>
          #feedLocationGate {
            --feed-bento-surface: #f8fafc;
            --feed-location-gate-bento-radius: 2.5rem;
            /* Das Polster unter dem Inhalt des Bentos. Es steht als Marke da,
               weil zwei Regeln es kennen muessen: das Bento setzt es, und die
               weisse Kapitel-Flaeche darin zieht es wieder ab, um bis an die
               Unterkante zu reichen. Zwei getrennte Zahlen waeren genau die
               Art Fehler, die man erst auf dem Geraet sieht.
               Hier steht 0: nur das Gate polstert unten (siehe unten). Im Feed
               selbst traegt das Bento kein Polster, und dann darf die weisse
               Flaeche auch keines abziehen. */
            --feed-gate-bento-pad-bottom: 0px;
            min-height: 100svh;
            background: #f8fafc;
            color: #0f172a;
          }
          html.is-standalone #feedLocationGate {
            min-height: 100dvh;
          }
          #feedLocationGate .loc-shell {
            position: relative;
            min-height: 100%;
            display: flex;
            flex-direction: column;
            background: #f8fafc;
          }
          #feedLocationGate .loc-top { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 5rem 1.5rem 5.25rem; background: #f8fafc; }
          #feedLocationGate .loc-top.loc-top--searchless { padding-bottom: 3.35rem; }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) .loc-top {
            background: var(--feed-gate-chrome-color, #00cce5);
            padding-top: 8rem;
            padding-bottom: 10.75rem;
          }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) .loc-top.loc-top--searchless {
            padding-bottom: 8.85rem;
          }
          #feedLocationGate .loc-title { width: 100%; max-width: 22rem; margin: 0 auto 2.15rem; color: #0f172a; font-size: clamp(1.65rem, 6.6vw, 2.2rem); font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; line-height: 1.08; }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) .loc-title {
            color: #fff;
          }
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
          #feedLocationGate .loc-status { margin-top: 0.7rem; font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.11em; color: rgb(100 116 139); }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) .loc-status {
            color: rgb(255 255 255 / 0.9);
          }
          #feedLocationGate .loc-status.hidden { display: none; }
          #feedLocationGate .loc-bento { position: relative; z-index: 3; background: #f8fafc; border-top-left-radius: var(--feed-location-gate-bento-radius); border-top-right-radius: var(--feed-location-gate-bento-radius); padding: 2.35rem 1.25rem 2rem; }
          #feedLocationGate .loc-bento.loc-bento--feed-content {
            background: var(--feed-bento-surface);
            border-top-left-radius: var(--feed-location-gate-bento-radius);
            border-top-right-radius: var(--feed-location-gate-bento-radius);
            padding: 0;
            overflow: visible;
            width: 100%;
            box-sizing: border-box;
          }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) {
            --feed-gate-bento-pad-bottom: 2rem;
          }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) .loc-bento.loc-bento--feed-content {
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            min-height: 0;
            margin-top: calc(var(--feed-location-gate-bento-radius) * -1);
            padding: 2.35rem 1.25rem var(--feed-gate-bento-pad-bottom);
            overflow: hidden;
            /* Hier lag ein Schatten nach OBEN (0 -18px 34px -18px). Er fiel
               aufs Blau darueber und legte einen dunklen Schleier ueber dessen
               unterste ~35px - das war der sichtbare Farbunterschied kurz vor
               der weissen Karte. Auf dem satten Blau braucht die Karte keinen
               Schatten, um sich abzusetzen: die Farbkante allein reicht.
               Die Regel gilt nur im Feed-Gate; der Feed selbst
               (data-location-screen-mode="feed-stage") hat sie ohnehin nie
               getragen und bleibt damit unveraendert. */
            box-shadow: none;
          }
          #feedLocationGate .feed-bento-pin-backdrop {
            position: -webkit-sticky;
            position: sticky;
            top: var(--feed-location-gate-header-height);
            height: 1px;
            margin-bottom: -1px;
            background: transparent;
            pointer-events: none;
            z-index: 6;
            width: 100%;
          }
          #feedLocationGate .feed-bento-pin-outline {
            position: -webkit-sticky;
            position: sticky;
            top: var(--feed-location-gate-header-height);
            height: 1px;
            margin-bottom: -1px;
            background: transparent;
            box-sizing: border-box;
            pointer-events: none;
            z-index: 7;
            width: 100%;
          }
          #feedLocationGate .feed-stage-bento-scroll {
            min-height: 0;
            height: auto;
            overflow: visible;
            margin-top: 0;
            padding-top: 0;
            position: relative;
            z-index: 3;
            background: var(--feed-bento-surface);
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            border: 0;
            box-sizing: border-box;
          }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) .feed-stage-bento-scroll {
            flex: 1 1 auto;
          }
          /* Die drei Abschnitte: viel Luft, eine grosse Ueberschrift, ein
             ruhiger Absatz - und ein Einblenden beim Heranscrollen. Die
             Bewegung laeuft nur ueber opacity und transform, damit sie auch
             auf dem Handy fluessig bleibt und kein Layout neu berechnet wird. */
          /* Die weisse Flaeche der Kapitel. Ihre negativen Margen heben das
             Polster des Bentos auf - oben und an den Seiten tat sie das schon,
             unten nicht: dort blieben 2rem des Bentos (#f8fafc) unter dem
             Weiss stehen, und genau diese Kante sah man am Seitenende als
             Farbunterschied.
             Jetzt hebt sie auch das untere Polster auf und legt es als eigenes
             Polster wieder an. Die Flaeche reicht damit bis zur Unterkante,
             der Abstand des letzten Kapitels zum Rand bleibt derselbe, und die
             Hoehe der Seite aendert sich nicht. */
          #feedLocationGate .feed-gate-chapters {
            position: relative;
            display: flex;
            flex-direction: column;
            margin: -2.35rem -1.25rem calc(-1 * var(--feed-gate-bento-pad-bottom));
            padding: 4.6rem 0 var(--feed-gate-bento-pad-bottom);
            background: #fff;
          }
          #feedLocationGate .feed-gate-chapter {
            --feed-gate-chapter-accent: #00cce5;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 30rem;
            margin: 0 auto;
            padding: 3.25rem 1.75rem;
            text-align: center;
            box-sizing: border-box;
          }
          #feedLocationGate .feed-gate-chapter__rule {
            display: block;
            width: 2.25rem;
            height: 3px;
            border-radius: 9999px;
            background: var(--feed-gate-chapter-accent);
          }
          #feedLocationGate .feed-gate-chapter__title {
            margin: 1.5rem 0 0;
            color: rgb(17 24 39);
            font-size: clamp(1.9rem, 8vw, 2.6rem);
            line-height: 1.05;
            letter-spacing: -0.035em;
            font-weight: 600;
          }
          #feedLocationGate .feed-gate-chapter__body {
            margin: 1.1rem 0 0;
            max-width: 24rem;
            color: rgb(100 116 139);
            font-size: 1rem;
            line-height: 1.65;
            font-weight: 450;
            letter-spacing: -0.01em;
            text-wrap: pretty;
          }
          #feedLocationGate .feed-gate-chapter__rule,
          #feedLocationGate .feed-gate-chapter__title,
          #feedLocationGate .feed-gate-chapter__body {
            opacity: 0;
            transform: translateY(26px);
            transition: opacity 720ms cubic-bezier(0.22, 1, 0.36, 1), transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
            will-change: opacity, transform;
          }
          #feedLocationGate .feed-gate-chapter__title { transition-delay: 90ms; }
          #feedLocationGate .feed-gate-chapter__body { transition-delay: 180ms; }
          #feedLocationGate .feed-gate-chapter[data-feed-gate-chapter-revealed="1"] .feed-gate-chapter__rule,
          #feedLocationGate .feed-gate-chapter[data-feed-gate-chapter-revealed="1"] .feed-gate-chapter__title,
          #feedLocationGate .feed-gate-chapter[data-feed-gate-chapter-revealed="1"] .feed-gate-chapter__body {
            opacity: 1;
            transform: translateY(0);
          }
          @media (min-width: 768px) {
            #feedLocationGate .feed-gate-chapter {
              max-width: 38rem;
              padding: 5rem 2.5rem;
            }
            #feedLocationGate .feed-gate-chapter__body {
              max-width: 30rem;
              font-size: 1.0625rem;
            }
          }
          @media (max-width: 380px) {
            #feedLocationGate .feed-gate-chapter {
              padding: 2.75rem 1.35rem;
            }
          }
          #feedLocationGate .feed-gate-chapters-spacer {
            width: 100%;
            height: clamp(18rem, 44svh, 30rem);
            flex: 0 0 auto;
          }
          #feedLocationGate .fade-in-up { opacity: 0; transform: translateY(30px); animation: feedLocationFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes feedLocationFadeUp { to { opacity: 1; transform: translateY(0); } }
          #feedLocationGate.feed-location-gate--resolving { pointer-events: none; animation: feedLocationGateResolveOut 360ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
          @keyframes feedLocationGateResolveOut {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-42px); }
          }
          @media (prefers-reduced-motion: reduce) {
            #feedLocationGate .feed-gate-chapter__rule,
            #feedLocationGate .feed-gate-chapter__title,
            #feedLocationGate .feed-gate-chapter__body {
              transition: none;
              opacity: 1;
              transform: none;
            }
            #feedLocationGate .text-slide-item {
              animation: none;
              opacity: 0;
              transform: none;
            }
            #feedLocationGate .text-slide-item:nth-child(1) {
              opacity: 1;
            }
          }
        </style>

        <div class="loc-shell">
          ${shouldRenderTopSection ? `
            <div class="loc-top${shouldRenderSearchControls ? "" : " loc-top--searchless"}">
              <div class="loc-title">
                <div class="text-slider-wrapper">
                  ${(Array.isArray(gateCopy?.topSliderItems) ? gateCopy.topSliderItems : []).map((item) => `
                    <div class="text-slide-item">${escapeHtmlFn(String(item || ""))}</div>
                  `).join("")}
                </div>
                <div>${escapeHtmlFn(String(gateCopy?.topCityLine || ""))}</div>
              </div>
              ${shouldRenderSearchControls ? `
                <div class="loc-search-wrap">
                  <div class="loc-input-row">
                    <span class="loc-pin">${iconFn("map-pin", "w-5 h-5")}</span>
                    <input id="feedLocationCityInput" type="text" inputmode="search" autocomplete="off" autocapitalize="words" spellcheck="false" data-feed-location-city-input aria-autocomplete="list" aria-controls="feedLocationCitySuggestions" aria-expanded="false" value="${escapeHtmlFn(cityValue)}" placeholder="${escapeHtmlFn(String(gateCopy?.searchPlaceholder || ""))}" class="loc-input" />
                    <div class="loc-request-wrap">
                      <button id="btnLocateMe" type="button" data-feed-location-request class="loc-request-btn" aria-label="${escapeHtmlFn(String(gateCopy?.useLocationAriaLabel || ""))}">
                        ${renderFeedLocationLocateIcon("crosshair", "w-5 h-5 relative z-10")}
                        <span id="locatePulse" class="loc-request-pulse opacity-0"></span>
                      </button>
                    </div>
                  </div>
                  <div id="feedLocationCitySuggestions" data-feed-location-city-suggestions role="listbox" aria-hidden="true" class="feed-location-suggestions"></div>
                  <p id="feedLocationStatus" class="loc-status hidden"></p>
                </div>
              ` : ""}
            </div>
          ` : ""}

          <div class="feed-bento-pin-backdrop" aria-hidden="true"></div>
          <div class="feed-bento-pin-outline" aria-hidden="true"></div>
          <div class="loc-bento loc-bento--feed-content" data-location-screen-content="${escapeHtmlFn(safeMode)}">
            <div class="feed-stage-bento-scroll">
              ${customBentoContent}
            </div>
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

  function renderHomeView() {
    return renderFeedView();
  }

  function renderSpotStoryIntroCard() {
    return `
      <div class="flex-none w-[29%] sm:w-[120px] snap-start ml-5" style="${buildTrackCardShellStyle({ withMarginLeft: true })}">
        <div class="relative h-52 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black p-3 flex flex-col justify-between border border-white/10" style="${buildTrackCardInnerStyle("background:linear-gradient(145deg,#111827 0%,#1f2937 52%,#000000 100%);padding:0.75rem;display:flex;flex-direction:column;justify-content:space-between;")}">
          <div class="relative z-10" style="position:relative;z-index:10;">
            <div class="absolute top-[26px] left-[13px] h-6 border-l-2 border-dashed border-white/80" style="position:absolute;top:26px;left:13px;height:1.5rem;border-left:2px dashed rgba(255,255,255,0.8);"></div>
            <div class="absolute top-[49px] left-[10px] w-2 h-2 rounded-full border border-white/70 bg-white/20 flex items-center justify-center shadow-sm" style="position:absolute;top:49px;left:10px;width:0.5rem;height:0.5rem;border-radius:9999px;border:1px solid rgba(255,255,255,0.7);background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
              <div style="width:0.25rem;height:0.25rem;border-radius:9999px;background:#fff;"></div>
            </div>
            <div class="bg-gradient-to-b from-white/20 to-white/5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 relative z-10 shadow-sm" style="position:relative;z-index:10;background:linear-gradient(180deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.06) 100%);">
              ${iconFn("map-pin", "w-3.5 h-3.5 text-white")}
            </div>
          </div>
          <div class="mt-auto relative z-10" style="margin-top:auto;position:relative;z-index:20;">
            <h2 class="text-[22px] font-black text-white uppercase leading-[1.05] tracking-tight w-full mb-1.5 opacity-95" style="font-size:clamp(14px,4.2vw,18px);line-height:1.05;opacity:0.95;">
              <span style="display:block;white-space:nowrap;">Spots &amp;</span>
              <span style="display:block;white-space:nowrap;">Stories</span>
            </h2>
            <p class="text-[9px] text-gray-400 leading-tight mb-2" style="position:relative;z-index:20;font-size:9px;line-height:1.15;color:rgb(156 163 175);">Zbulo vendet më të mira.</p>
            <div class="flex items-center gap-1 text-[8px] font-bold text-amber-400 uppercase tracking-widest mt-1" style="position:relative;z-index:20;color:rgb(251 191 36);">
              <span>Swipe</span>
              ${iconFn("arrow-right", "w-2.5 h-2.5")}
            </div>
          </div>
          <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" style="position:absolute;right:-1rem;bottom:-1rem;width:6rem;height:6rem;border-radius:9999px;background:rgba(255,255,255,0.05);filter:blur(24px);pointer-events:none;z-index:0;"></div>
        </div>
      </div>
    `;
  }

  function renderBestSpotItem(spot = {}, index = 0) {
    const spotId = String(spot?.spotId || spot?.postId || "").trim();
    const safeSpotId = escapeHtmlFn(spotId);
    const avatarAttr = safeSpotId ? `data-best-spot-avatar="${safeSpotId}"` : "";
    const avatarKeyAttr = safeSpotId ? `data-img-key="best-spot-avatar:${safeSpotId}"` : "";
    const nameAttr = safeSpotId ? `data-best-spot-name="${safeSpotId}"` : "";
    const href = String(spot?.profileUrl || buildUrlFn("apps/menyra-social/index.html", { tab: "feed", source: "best-spot" })).trim();
    const restaurantId = String(spot?.restaurantId || "").trim();
    const avatarUrl = String(spot?.avatarUrl || "").trim();
    const label = String(spot?.displayName || "Best Spot").trim() || "Best Spot";
    const eager = index < 4;
    const ratingLabel = String(spot?.ratingDisplay || "4.8").trim() || "4.8";
    const imgAttrs = eager
      ? `loading="eager" fetchpriority="high"`
      : `loading="lazy" fetchpriority="low"`;
    const starBadgeIcon = `<svg viewBox="0 0 24 24" width="8" height="8" aria-hidden="true" focusable="false" style="display:block;color:#fbbf24;fill:currentColor;stroke:currentColor;stroke-width:1.5;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    const visualLayer = avatarUrl
      ? `<img src="${escapeHtmlFn(getOptimizedImageUrlFn(avatarUrl, "small"))}" ${imgAttrs} decoding="async" width="120" height="208" ${avatarAttr} ${avatarKeyAttr} class="absolute inset-0 w-full h-full object-cover" />`
      : `<div class="absolute inset-0 flex items-center justify-center text-white/85" style="background:linear-gradient(145deg,#1f2937 0%,#0f172a 60%,#020617 100%);">${iconFn("map-pin", "w-6 h-6")}</div>`;
    const openTag = restaurantId
      ? `<button type="button" data-profile-business="${escapeHtmlFn(label)}" data-profile-id="${escapeHtmlFn(restaurantId)}" data-best-spot-item="${safeSpotId}" class="flex-none w-[29%] sm:w-[120px] snap-start cursor-pointer text-left" style="${buildTrackCardShellStyle()}">`
      : `<a href="${escapeHtmlFn(href)}" data-best-spot-item="${safeSpotId}" class="flex-none w-[29%] sm:w-[120px] snap-start cursor-pointer" style="${buildTrackCardShellStyle()}">`;
    const closeTag = restaurantId ? "</button>" : "</a>";
    return `
      ${openTag}
        <div class="relative h-52 rounded-2xl overflow-hidden shadow-md" style="${buildTrackCardInnerStyle()}">
          ${visualLayer}
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" style="background:linear-gradient(0deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.1) 45%,rgba(0,0,0,0) 100%);"></div>
          <div class="absolute top-2 left-2" style="position:absolute;top:0.5rem;left:0.5rem;z-index:12;">
            <div class="flex items-center gap-1 bg-white/20 backdrop-blur-md border border-white/30 px-1.5 py-0.5 rounded-md shadow-sm">
              ${starBadgeIcon}
              <span class="text-[9px] font-bold text-white pt-[1px]">${escapeHtmlFn(ratingLabel)}</span>
            </div>
          </div>
          <div class="absolute top-2 right-2" style="position:absolute;top:0.5rem;right:0.5rem;z-index:12;">
            <div class="p-1 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 shadow-sm">
              ${iconFn("arrow-right", "w-3 h-3")}
            </div>
          </div>
          <div class="absolute bottom-2 left-2 right-2" style="position:absolute;left:0.5rem;right:0.5rem;bottom:0.5rem;z-index:12;">
            <h3 class="font-medium text-[11px] text-white truncate drop-shadow-md" ${nameAttr}>${escapeHtmlFn(label)}</h3>
          </div>
        </div>
      ${closeTag}
    `;
  }

  function renderStoryPreviewMedia(story = {}, index = 0, storyId = "") {
    const preview = resolveStoryPreviewMedia(story);
    const eager = index < 5;
    if (preview.kind === "video" && preview.src) {
      const attrs = eager
        ? `preload="auto" fetchpriority="high"`
        : `preload="metadata" fetchpriority="low"`;
      const posterAttr = preview.poster ? `poster="${escapeHtmlFn(getOptimizedImageUrlFn(preview.poster, "small"))}"` : "";
      const storyPreviewIdAttr = storyId ? `data-story-preview-id="${escapeHtmlFn(storyId)}"` : "";
      return `
        <video src="${escapeHtmlFn(preview.src)}" ${posterAttr} ${attrs} data-story-preview-video ${storyPreviewIdAttr} autoplay muted loop playsinline draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;"></video>
      `;
    }
    if (preview.src) {
      const attrs = eager
        ? `loading="eager" fetchpriority="high"`
        : `loading="lazy" fetchpriority="low"`;
      return `
        <img src="${escapeHtmlFn(getOptimizedImageUrlFn(preview.src, "small"))}" ${attrs} decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />
      `;
    }
    return renderStoryTileMediaFallbackCore({ iconFn });
  }

  function renderStoryItem(story, index = 0) {
    const identity = resolveStoryRenderIdentity(story);
    const storyRestaurantId = identity.storyRestaurantId;
    if (!storyRestaurantId) return "";
    const storyTruthSource = String(identity.truthSource || "canonical").trim().toLowerCase();
    const isFeedFallbackStory = storyTruthSource === "feed-fallback";
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
    const logoAttrs = index < 6
      ? `loading="eager" fetchpriority="high"`
      : `loading="lazy" fetchpriority="low"`;
    // Markup kommt aus dem gemeinsamen Baustein: die Zbulo-Vorschau im
    // Composer rendert mit exakt derselben Funktion.
    return renderStoryTileMarkupCore({
      label: storyLabel,
      mediaHtml: renderStoryPreviewMedia(story, index, storyRestaurantId),
      logoImgHtml: `<img src="${escapeHtmlFn(imgUrl)}" ${logoAttrs} decoding="async" width="28" height="28" ${storyAttr} ${storyKeyAttr} class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />`,
      shellStyle: buildTrackCardShellStyle(),
      innerStyle: buildTrackCardInnerStyle(),
      hrefAttr: `href="${storyUrl}"`,
      shellAttrs: `${storyItemAttr} data-story-url="${escapeHtmlFn(storyUrl)}" ${storyTruthAttr} ${storyRenderAttr}`,
      logoRingAttrs: storyBorderAttr,
      labelAttrs: storyNameAttr,
      escapeHtmlFn
    });
  }

  function renderStoriesRow(stories, feedPosts = [], {
    fallbackFeedPosts = [],
    fallbackStories = []
  } = {}) {
    const storyTrackItems = resolveStoryTrackItems(stories, fallbackStories);
    const bestSpots = resolveBestSpotTrackItems(
      feedPosts,
      fallbackFeedPosts,
      buildStoryRestaurantIdSet(storyTrackItems, stories, fallbackStories)
    );
    const mixedTrackItems = buildMixedSpotStoryTrackItems({
      spots: bestSpots,
      stories: storyTrackItems
    });
    const cards = mixedTrackItems.map((entry, index) => {
      if (entry.type === "spot") {
        return renderBestSpotItem(entry.spot, index);
      }
      return renderStoryItem(entry.story, index);
    }).join("");
    return `
      <div data-spot-story-track class="flex overflow-x-auto gap-2.5 pb-8 pt-2 snap-x snap-mandatory no-scrollbar scroll-pl-5" style="${buildTrackRowViewportStyle()}">
        ${renderSpotStoryIntroCard()}
        ${cards || `<div class="flex items-center text-slate-400 text-xs font-bold uppercase px-2">Nuk ka spote</div>`}
        <div class="flex-none w-1" aria-hidden="true"></div>
      </div>
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
    const restaurant = state.restaurants.find((r) => r.id === (post.restaurantId || post.ownerId)) || {};
    const logoSource = restaurant.logoUrl || restaurant.logo || post.logo || "";
    const logoUrl = resolveRestaurantLogoFn(post.restaurantId || post.ownerId, logoSource, "avatar");
    const imageUrl = getOptimizedImageUrlFn(post.image, "medium", {
      stableKey: postId ? `feed-hero:${postId}` : ""
    });
    // Responsive Kandidaten (kleines Display / 3G laedt kleines Bild). Ohne
    // stableKey, damit der Last-Good-Cache nur an der src-Variante haengt.
    const heroSmallUrl = getOptimizedImageUrlFn(post.image, "small");
    const heroLargeUrl = getOptimizedImageUrlFn(post.image, "large");
    const heroSrcset = escapeHtmlFn(
      `${heroSmallUrl} 480w, `
      + `${imageUrl} 768w, `
      + `${heroLargeUrl} 1280w`
    );
    // Beim Wechsel zwischen den Kopf-Tabs wird der Feed neu aufgebaut. Bilder,
    // die in dieser Sitzung schon einmal standen, liegen beim Browser bereit
    // und werden sofort geholt statt erst beim Heranscrollen - sonst blitzt
    // die graue Flaeche darunter auf. Welche der drei Groessen das Geraet
    // genommen hat, entscheidet es selbst, also zaehlt jede von ihnen.
    // Sofort holen duerfen nur die vordersten Beitraege: sonst forderte ein
    // schon einmal durchgescrollter Feed beim Zurueckkommen alle Bilder auf
    // einen Schlag an.
    const heroReady = [imageUrl, heroSmallUrl, heroLargeUrl].some((entry) => isImageUrlLoaded(entry));
    const eager = index < 2 || (heroReady && index < FEED_EAGER_POST_LIMIT);
    const heroAttrs = eager
      ? `loading="eager" fetchpriority="high"`
      : `loading="lazy" fetchpriority="low"`;
    const logoAttrs = (index < 2 || (isImageUrlLoaded(logoUrl) && index < FEED_EAGER_POST_LIMIT))
      ? `loading="eager"`
      : `loading="lazy" fetchpriority="low"`;
    const heroSizes = "(max-width: 640px) 100vw, 600px";
    // Video-Posts: Loop-Autoplay (stumm) statt statischem Bild. Bild-Posts
    // rendern exakt wie zuvor (unveraendert). Poster = Titelbild fuer Cold/3G.
    const heroPoster = post.poster
      ? getOptimizedImageUrlFn(post.poster, "medium", { stableKey: postId ? `feed-hero-poster:${postId}` : "" })
      : imageUrl;
    // Feed-Beitraege: Loop-Autoplay (stumm) wie urspruenglich - im Feed darf
    // automatisch abgespielt werden. In den PROFIL-Beitraegen dagegen nicht
    // (dort Standbild + Play-Button, siehe Profil-/Modal-Renderer).
    const heroInner = (post.isVideo && post.videoUrl)
      ? `<video src="${escapeHtmlFn(post.videoUrl)}" poster="${escapeHtmlFn(heroPoster)}" autoplay muted loop playsinline preload="none" ${heroKeyAttr} class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000"></video>`
      : `<img src="${escapeHtmlFn(imageUrl)}" srcset="${heroSrcset}" sizes="${heroSizes}" ${heroAttrs} ${heroKeyAttr} decoding="${heroReady ? "sync" : "async"}" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`;
    // Klick auf das Beitragsbild/-video oeffnet den Beitrag im Modal - dort
    // stehen Text, Likes und Kommentare. Die Stories bleiben ueber die
    // Story-Kreise oben erreichbar; der Beitrag fuehrt nicht mehr dorthin.
    // Die Like/Kommentar/Share-Buttons liegen als absolute Overlay-Geschwister
    // darueber und bleiben klickbar.
    const heroTrackAttr = post.restaurantId
      ? `data-feed-post-open="${escapeHtmlFn(post.restaurantId)}"`
      : "";
    // Der Button traegt seinen Reset inline: p-0/m-0/border-0 liegen nicht im
    // ausgelieferten Tailwind-Build, sonst kaeme die Browser-Voreinstellung
    // durch und das Medium saesse mit Rand und Rahmen in der Karte.
    const heroMediaHtml = postId
      ? `<button type="button" data-feed-post-open-modal="${escapeHtmlFn(postId)}" ${heroTrackAttr} aria-label="Hap postimin nga ${escapeHtmlFn(post.business)}" class="block w-full h-full appearance-none bg-transparent text-left cursor-pointer" style="display:block;width:100%;height:100%;padding:0;margin:0;border:0;background:transparent;">${heroInner}</button>`
      : heroInner;
    // Der eigene Beitrag traegt oben rechts den Loeschen-Knopf. Seit "Postim"
    // und "Profil" getrennt sind, steht ein Feed-Beitrag nicht mehr im
    // Profil-Grid - das war der einzige Ort mit Loeschen. Fremde Karten
    // behalten das stumme Zeichen.
    const ownRestaurantId = String(state.userProfile?.restaurantId || "").trim();
    const isOwnFeedPost = !!postId
      && !!ownRestaurantId
      && String(post.restaurantId || "").trim() === ownRestaurantId;
    const menuHtml = isOwnFeedPost
      ? `<button type="button" data-feed-post-delete="${escapeHtmlFn(postId)}" aria-label="Fshi postimin" class="p-2 -m-2 rounded-full text-slate-400 hover:text-rose-500 active:text-rose-600 transition-colors">${iconFn("trash-2", "w-5 h-5")}</button>`
      : "";
    // Markup kommt aus dem gemeinsamen Baustein: der Composer rendert seine
    // Vorschau mit exakt derselben Funktion.
    return renderFeedCardMarkupCore({
      business: post.business,
      location: post.location,
      content: post.content,
      likes: post.likes,
      comments: post.comments,
      isLive: post.isLive,
      logoImgHtml: `<img src="${escapeHtmlFn(logoUrl)}" ${logoAttrs} ${logoAttr} ${logoKeyAttr} decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />`,
      heroMediaHtml,
      heroReady,
      rootAttrs: `${feedAttr} ${feedRenderAttr}`,
      menuHtml,
      profileButtonAttrs: `data-profile-business="${escapeHtmlFn(post.business)}" data-profile-id="${escapeHtmlFn(post.restaurantId || "")}"`,
      likeButtonAttrs: `data-feed-post-like="${escapeHtmlFn(postId)}" data-post-like-btn="${escapeHtmlFn(postId)}"`,
      likeCountAttrs: likeAttr,
      commentButtonAttrs: `data-feed-post-comment="${escapeHtmlFn(postId)}"`,
      commentCountAttrs: commentAttr,
      shareButtonAttrs: `data-feed-post-share="${escapeHtmlFn(postId)}"`,
      escapeHtmlFn,
      iconFn
    });
  }

  function renderFeedList(feedPosts) {
    if (!feedPosts.length) {
      return `<div class="text-center py-20 text-slate-400 font-bold text-xs uppercase">Nuk ka postime</div>`;
    }
    return feedPosts.slice(0, 10).map((post, index) => renderFeedItem(post, index)).join("");
  }

  function patchFeedList(feedPosts) {
    const feedList = doc?.getElementById("feedList");
    if (!feedList) return false;
    if (!feedPosts.length) {
      const nextHtml = renderFeedList(feedPosts);
      if (feedList.innerHTML !== nextHtml) {
        feedList.innerHTML = nextHtml;
        return true;
      }
      return false;
    }
    const existingItems = Array.from(feedList.querySelectorAll("[data-feed-id]"));
    const currentIds = existingItems.map((el) => el.dataset.feedId || "");
    const nextIds = feedPosts.map((post) => String(post.id || ""));
    if (currentIds.join("|") === nextIds.join("|")) {
      let didMutate = false;
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
        didMutate = true;
      });
      feedPosts.forEach(updatePostCountNodesFn);
      feedPosts.forEach(updateFeedLogoNodesFn);
      return didMutate;
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

  function bindStoryPreviewBoomerang(video) {
    if (!HtmlVideoElementCtor || !(video instanceof HtmlVideoElementCtor)) return;
    if (video.dataset.storyBoomerangBound === "1") return;
    video.dataset.storyBoomerangBound = "1";
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute("muted", "");
    video.autoplay = true;
    video.loop = false;
    video.controls = false;
    video.disablePictureInPicture = true;
    video.preload = "metadata";
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    const ua = String(win?.navigator?.userAgent || "").toLowerCase();
    const isTouchLike = !!win?.matchMedia?.("(pointer: coarse)")?.matches;
    const isMobileUa = /android|iphone|ipad|ipod|mobile/.test(ua);
    const isStandalone = !!win?.matchMedia?.("(display-mode: standalone)")?.matches
      || !!win?.navigator?.standalone;
    const forceLightweightLoop = isTouchLike || isMobileUa || isStandalone;
    const allowReversePlayback = false;
    let direction = 1;
    let reverseSupported = allowReversePlayback && !forceLightweightLoop;
    let previewEnd = 1.35;
    const previewStart = 0.05;
    storyPreviewStateMap.set(video, {
      previewStart,
      previewEnd,
      active: false,
      forceLightweightLoop
    });
    const markActive = (active = false) => {
      const state = storyPreviewStateMap.get(video);
      if (!state) return;
      state.active = !!active;
      state.previewEnd = previewEnd;
      video.dataset.storyPreviewActive = active ? "1" : "0";
    };
    const applyDirection = (nextDirection) => {
      direction = nextDirection >= 0 ? 1 : -1;
      if (!reverseSupported) return;
      try {
        video.playbackRate = direction;
        if (video.playbackRate !== direction) {
          reverseSupported = false;
          video.playbackRate = 1;
        }
      } catch {
        reverseSupported = false;
        try { video.playbackRate = 1; } catch {}
      }
    };
    const syncPreviewBounds = () => {
      const duration = Number(video.duration || 0);
      if (!Number.isFinite(duration) || duration <= 0.05) {
        previewEnd = 1.35;
        const state = storyPreviewStateMap.get(video);
        if (state) state.previewEnd = previewEnd;
        return;
      }
      previewEnd = Math.max(previewStart + 0.45, Math.min(duration, 1.45));
      const state = storyPreviewStateMap.get(video);
      if (state) state.previewEnd = previewEnd;
    };
    const onTimeUpdate = () => {
      const state = storyPreviewStateMap.get(video);
      if (!state?.active) return;
      syncPreviewBounds();
      if (!reverseSupported) {
        if (video.currentTime >= previewEnd) {
          video.currentTime = previewStart + 0.01;
          if (video.paused) {
            void video.play().catch(() => {});
          }
        }
        return;
      }
      if (direction > 0 && video.currentTime >= previewEnd) {
        applyDirection(-1);
      } else if (direction < 0 && video.currentTime <= previewStart) {
        applyDirection(1);
      }
    };
    video.addEventListener("loadedmetadata", syncPreviewBounds);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("stalled", () => {
      const state = storyPreviewStateMap.get(video);
      if (!state?.active) return;
      void video.play().catch(() => {});
    });
    video.addEventListener("waiting", () => {
      const state = storyPreviewStateMap.get(video);
      if (!state?.active) return;
      void video.play().catch(() => {});
    });
    video.addEventListener("ended", () => {
      const state = storyPreviewStateMap.get(video);
      if (!state?.active) return;
      video.currentTime = previewStart;
      applyDirection(1);
      void video.play().catch(() => {});
    });
    applyDirection(1);
    try {
      video.currentTime = previewStart;
    } catch {}
    markActive(false);
  }

  function playStoryPreview(video, { reset = false } = {}) {
    if (!HtmlVideoElementCtor || !(video instanceof HtmlVideoElementCtor)) return;
    const state = storyPreviewStateMap.get(video);
    if (!state) return;
    if (reset || !Number.isFinite(video.currentTime) || video.currentTime > (state.previewEnd + 0.05)) {
      try {
        video.currentTime = state.previewStart;
      } catch {}
    }
    state.active = true;
    video.dataset.storyPreviewActive = "1";
    void video.play().catch(() => {
      // Autoplay blockiert (z.B. iOS-Stromsparmodus): wenigstens ein echtes
      // Video-Frame statt Poster/Logo anzeigen und nach der ersten
      // Nutzer-Geste den Loop erneut starten.
      try {
        if (!video.dataset.storyPreviewFrameSeek && Number(video.currentTime || 0) <= 0.01) {
          video.dataset.storyPreviewFrameSeek = "1";
          video.currentTime = Math.max(0.05, Number(state.previewStart || 0));
        }
      } catch {}
      bindStoryPreviewGestureRetry();
    });
  }

  function bindStoryPreviewGestureRetry() {
    if (storyPreviewGestureRetryBound || !doc) return;
    storyPreviewGestureRetryBound = true;
    const retryVisiblePreviews = () => {
      doc.querySelectorAll("video[data-story-preview-video]").forEach((video) => {
        if (String(video.dataset.storyPreviewVisible || "0") !== "1") return;
        playStoryPreview(video);
      });
    };
    doc.addEventListener("touchend", retryVisiblePreviews, { once: true, passive: true });
    doc.addEventListener("pointerdown", retryVisiblePreviews, { once: true, passive: true });
  }

  function pauseStoryPreview(video) {
    if (!HtmlVideoElementCtor || !(video instanceof HtmlVideoElementCtor)) return;
    const state = storyPreviewStateMap.get(video);
    if (state) state.active = false;
    video.dataset.storyPreviewActive = "0";
    try {
      video.pause();
    } catch {}
  }

  function ensureStoryPreviewObserver() {
    if (!win?.IntersectionObserver || !HtmlVideoElementCtor) return null;
    if (storyPreviewObserver) return storyPreviewObserver;
    storyPreviewObserver = new win.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (!(video instanceof HtmlVideoElementCtor)) return;
        const ratio = entry.isIntersecting ? Number(entry.intersectionRatio || 0) : 0;
        const visible = ratio >= 0.3;
        video.dataset.storyPreviewVisible = visible ? "1" : "0";
        if (visible) {
          playStoryPreview(video);
        } else {
          pauseStoryPreview(video);
        }
      });
    }, {
      threshold: [0, 0.15, 0.3, 0.55, 0.85, 1]
    });
    return storyPreviewObserver;
  }

  function ensureStoryPreviewLifecycleBindings() {
    if (!doc || storyPreviewLifecycleBound) return;
    storyPreviewLifecycleBound = true;
    doc.addEventListener("visibilitychange", () => {
      const scope = doc.getElementById("storiesRow");
      if (!scope) return;
      const videos = Array.from(scope.querySelectorAll("video[data-story-preview-video]"));
      if (doc.hidden) {
        videos.forEach((video) => pauseStoryPreview(video));
        return;
      }
      videos.forEach((video) => {
        const isVisible = String(video.dataset.storyPreviewVisible || "0") === "1";
        if (isVisible) {
          playStoryPreview(video);
        }
      });
    });
    win?.addEventListener?.("pagehide", () => {
      const scope = doc.getElementById("storiesRow");
      if (!scope) return;
      scope.querySelectorAll("video[data-story-preview-video]")?.forEach?.((video) => pauseStoryPreview(video));
    });
  }

  function bindSpotStoryTrackEdgeSwipeGuard(root = null) {
    if (!doc) return;
    const scope = root && typeof root.querySelector === "function" ? root : doc;
    const track = scope.querySelector?.("[data-spot-story-track]");
    if (!(track instanceof HTMLElement)) return;
    if (track.dataset.edgeSwipeGuardBound === "1") return;
    track.dataset.edgeSwipeGuardBound = "1";

    // Ab dieser Fingerstrecke steht fest, wohin die Geste zielt. Darunter
    // koennte ein Wackeln von zwei Pixeln schon als "waagerecht" gelten und der
    // Waechter wuerde einer senkrechten Geste in den Weg treten.
    const GESTURE_DIRECTION_THRESHOLD_PX = 10;
    let isTouchActive = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;

    const onTouchStart = (event) => {
      const touch = event.touches?.[0];
      if (!touch) return;
      isTouchActive = true;
      startX = touch.clientX;
      startY = touch.clientY;
      startScrollLeft = Number(track.scrollLeft || 0);
    };

    const onTouchMove = (event) => {
      if (!isTouchActive) return;
      const touch = event.touches?.[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      // Senkrechte Gesten gehoeren der Seite. Der Waechter haelt nur den
      // waagerechten Wisch ueber die Kante hinaus auf - und auch den erst,
      // wenn die Richtung eindeutig ist.
      if (Math.abs(dx) < GESTURE_DIRECTION_THRESHOLD_PX) return;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      const maxScrollLeft = Math.max(0, Number(track.scrollWidth || 0) - Number(track.clientWidth || 0));
      const atStart = startScrollLeft <= 0.5 || Number(track.scrollLeft || 0) <= 0.5;
      const atEnd = Math.abs(maxScrollLeft - Number(track.scrollLeft || 0)) <= 0.5;
      const swipingPastStart = dx > 0 && atStart;
      const swipingPastEnd = dx < 0 && atEnd;
      if (swipingPastStart || swipingPastEnd) {
        event.preventDefault();
      }
    };

    const onTouchEnd = () => {
      isTouchActive = false;
    };

    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchmove", onTouchMove, { passive: false });
    track.addEventListener("touchend", onTouchEnd, { passive: true });
    track.addEventListener("touchcancel", onTouchEnd, { passive: true });
  }

  function syncStoryPreviewMotion(root = null) {
    const scope = root && typeof root.querySelectorAll === "function"
      ? root
      : doc?.getElementById("storiesRow");
    if (!scope) return;
    const videos = Array.from(scope.querySelectorAll?.("video[data-story-preview-video]") || []);
    const observer = ensureStoryPreviewObserver();
    if (observer) observer.disconnect();
    videos.forEach((video) => {
      bindStoryPreviewBoomerang(video);
      if (observer) {
        observer.observe(video);
      } else {
        playStoryPreview(video, { reset: true });
      }
    });
    bindSpotStoryTrackEdgeSwipeGuard(scope);
    ensureStoryPreviewLifecycleBindings();
  }

  function patchStoriesRow(stories, feedPosts = [], {
    fallbackFeedPosts = [],
    fallbackStories = []
  } = {}) {
    const storiesRow = doc?.getElementById("storiesRow");
    if (!storiesRow) return false;
    storiesRow.innerHTML = renderStoriesRow(stories, feedPosts, {
      fallbackFeedPosts,
      fallbackStories
    });
    syncStoryPreviewMotion(storiesRow);
    return true;
  }

  // Entfernt veraltete Feed-Composer-Knoten aus bereits gerendertem Markup.
  function removeLegacyFeedComposer(feedView) {
    if (!feedView) return false;
    const existingComposer = feedView.querySelector("[data-feed-composer-wrap]");
    if (!existingComposer) return false;
    existingComposer.remove();
    return true;
  }

  function updateFeedDom() {
    const feedView = doc?.getElementById("feedView");
    if (!feedView) return false;
    const feedViewMode = String(feedView.dataset.feedViewMode || "feed").trim().toLowerCase();
    if (feedViewMode !== "feed") {
      bindFeedDelegation();
      syncFeedLocationGateDom();
      if (win?.lucide?.createIcons) win.lucide.createIcons();
      return true;
    }
    // Wechselt die Stadt, ohne dass der Feed komplett neu gebaut wird, muss
    // die Ueberschrift trotzdem den neuen Namen tragen.
    const cityHeadline = doc.querySelector("[data-feed-city-headline]");
    if (cityHeadline instanceof HTMLElement) {
      const nextCityName = resolveFeedHeadlineCityName();
      if (cityHeadline.textContent !== nextCityName) cityHeadline.textContent = nextCityName;
    }
    const feedPostsSource = Array.isArray(state?.feedPosts) ? state.feedPosts : [];
    const categoryFeedPosts = feedPostsSource
      .filter((p) => state.feedCategory === "all" || p.category === state.feedCategory)
      .sort((a, b) => (toDateSafeFn(b.createdAt)?.getTime() || 0) - (toDateSafeFn(a.createdAt)?.getTime() || 0));
    const baseStories = (Array.isArray(state.stories) ? state.stories : []).filter((story) => isRenderableStory(story));
    const { feedPosts, stories } = resolveFeedGeoScopedCollections({
      feedPosts: categoryFeedPosts,
      stories: baseStories
    });
    const trackStories = stories;
    const storyTrackItems = resolveStoryTrackItems(trackStories, trackStories);
    const bestSpotItems = resolveBestSpotTrackItems(
      feedPosts,
      feedPosts,
      buildStoryRestaurantIdSet(storyTrackItems, trackStories)
    );
    const storiesRow = doc.getElementById("storiesRow");
    const nextSig = buildSpotStoryTrackSignature({ spots: bestSpotItems, stories: storyTrackItems });
    let didPatchStoriesRow = false;
    if (storiesRow) {
      const hasTrackContainer = !!storiesRow.querySelector("[data-spot-story-track]");
      if (getStoriesRowSignatureFn() !== nextSig || !hasTrackContainer) {
        patchStoriesRow(trackStories, feedPosts, {
          fallbackFeedPosts: feedPosts,
          fallbackStories: trackStories
        });
        setStoriesRowSignatureFn(nextSig);
        didPatchStoriesRow = true;
      }
      storyTrackItems.forEach((story) => {
        updateStoryLogoNodesFn(story);
        updateStoryMetaNodesFn(story);
      });
      const previewSyncSig = `motion:${nextSig}|${storyTrackItems.length}`;
      const shouldSyncPreviewMotion = didPatchStoriesRow
        || String(storiesRow.dataset.storyPreviewMotionSig || "") !== previewSyncSig;
      if (shouldSyncPreviewMotion) {
        syncStoryPreviewMotion(storiesRow);
        storiesRow.dataset.storyPreviewMotionSig = previewSyncSig;
      }
    }
    const didComposerMutate = removeLegacyFeedComposer(feedView);
    const didFeedListMutate = patchFeedList(feedPosts);
    ensureFeedRestaurantMetaListenersFn(feedPosts);
    bindFeedDelegation();
    const preloadSignature = buildFeedHeroPreloadSignature(feedPosts);
    if (preloadSignature !== lastFeedHeroPreloadSignature) {
      lastFeedHeroPreloadSignature = preloadSignature;
      preloadFeedHeroImagesFn(feedPosts);
    }
    if ((didPatchStoriesRow || didComposerMutate || didFeedListMutate) && win?.lucide?.createIcons) {
      win.lucide.createIcons();
    }
    return true;
  }

  // Mnyra GO im Qyteti.
  //
  // Die Karte steht unter den Stories und ueber den Beitraegen. Sie kostet
  // beim Laden nichts: kein Aufruf, keine Abfrage, kein Bild - nur Text, den
  // dieses Modul aus dem baut, was ohnehin schon im Browser liegt (Punkt 6).
  //
  // Der ganze Block liegt in einem try: Faellt GO aus, faellt die Karte weg -
  // und das Qyteti rendert weiter, als haette es sie nie gegeben (Punkt 131).
  function renderGoEntryCard() {
    try {
      const goState = readGoEntryState();
      if (!goState.enabled) return "";
      ensureGoEntryDelegation({
        documentObj: doc,
        windowObj: win,
        getCityFn: () => resolveFeedHeadlineCityName(),
        getCoordsFn: () => {
          const record = normalizeViewerLocationRecord(resolveViewerLocationRecord());
          return record ? { lat: record.lat, lng: record.lng } : null;
        },
        isSignedInFn: () => !!state?.user?.uid,
        openMenuFn: (restaurantId) => {
          if (!restaurantId || typeof openProfileViewFromBusinessFn !== "function") return;
          openProfileViewFromBusinessFn({ restaurantId });
        }
      });
      return renderGoEntryCardCore({
        enabled: true,
        activeBookings: goState.activeBookings
      });
    } catch {
      return "";
    }
  }

  function renderFeedView() {
    const hasViewerLocation = !!normalizeViewerLocationRecord(resolveViewerLocationRecord());
    const feedViewMode = hasViewerLocation ? "feed" : "feed-gate";
    let feedBentoContent = renderFeedGateBentoContent();
    if (hasViewerLocation) {
      const feedPostsSource = Array.isArray(state?.feedPosts) ? state.feedPosts : [];
      const categoryFeedPosts = feedPostsSource
        .filter((p) => state.feedCategory === "all" || p.category === state.feedCategory)
        .sort((a, b) => (toDateSafeFn(b.createdAt)?.getTime() || 0) - (toDateSafeFn(a.createdAt)?.getTime() || 0));
      const baseStories = (Array.isArray(state.stories) ? state.stories : []).filter((story) => isRenderableStory(story));
      const { feedPosts, stories } = resolveFeedGeoScopedCollections({
        feedPosts: categoryFeedPosts,
        stories: baseStories
      });
      const trackStories = stories;
      feedBentoContent = `
        <div class="app-content-inline pt-6 mb-5" style="margin-bottom:1.25rem;">
          <h1 data-feed-city-headline class="text-xl font-black tracking-tight text-slate-900 md:text-2xl">${escapeHtmlFn(resolveFeedHeadlineCityName())}</h1>
          <p class="text-[11px] text-slate-400 font-semibold mt-0.5">${escapeHtmlFn("Bëhu një me qytetin tënd.")}</p>
        </div>
        <div id="storiesRow" class="app-content-inline">
          ${renderStoriesRow(trackStories, feedPosts, {
            fallbackFeedPosts: feedPosts,
            fallbackStories: trackStories
          })}
        </div>
        ${renderGoEntryCard()}
        <div id="feedList" class="app-content-inline py-4 space-y-12">
          ${renderFeedList(feedPosts)}
        </div>
      `;
    }
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
    <div id="feedView" data-feed-view-mode="${feedViewMode}" class="${withEntranceAnimation ? "feed-view-slide-enter" : ""}">
      ${renderLocationGate({
        mode: hasViewerLocation ? "feed-stage" : "feed-gate",
        bentoContentHtml: feedBentoContent,
        showSearchControls: !hasViewerLocation,
        showTopSection: !hasViewerLocation
      })}
    </div>
  `;
  }

  function bindFeedLocationControlsDelegation() {
    if (!doc || feedLocationControlDelegationBound) return;
    feedLocationControlDelegationBound = true;

    const isLocationControlScope = () => isFeedLocationScopeActive();

    doc.addEventListener("input", (event) => {
      if (!isLocationControlScope()) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cityInput = target.closest("[data-feed-location-city-input]");
      if (!(cityInput instanceof HTMLInputElement)) return;
      syncFeedLocationSuggestionsDom(cityInput.value);
    });

    doc.addEventListener("pointerdown", (event) => {
      if (!isLocationControlScope()) return;
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

    doc.addEventListener("touchstart", (event) => {
      if (!isLocationControlScope()) return;
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

    doc.addEventListener("focusin", (event) => {
      if (!isLocationControlScope()) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cityInput = target.closest("[data-feed-location-city-input]");
      if (!(cityInput instanceof HTMLInputElement)) return;
      syncFeedLocationSuggestionsDom(cityInput.value);
    });

    doc.addEventListener("focusout", (event) => {
      if (!isLocationControlScope()) return;
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

    doc.addEventListener("change", (event) => {
      if (!isLocationControlScope()) return;
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
        country: suggestion.country,
        countryCode: suggestion.countryCode,
        source: "city-search"
      });
      if (!applied) {
        requestViewerLocationAccess({ fallbackCity: suggestion });
      }
    });

    doc.addEventListener("keydown", (event) => {
      if (!isLocationControlScope()) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cityInput = target.closest("[data-feed-location-city-input]");
      if (!(cityInput instanceof HTMLInputElement)) return;
      if (event.key === "Escape") {
        hideFeedLocationSuggestions();
        return;
      }
      if (event.key !== "Enter") return;
      event.preventDefault();
      const query = String(cityInput.value || "").trim();
      if (!query) return;
      const applySuggestion = (suggestion) => {
        if (!suggestion) return false;
        cityInput.value = suggestion.label;
        hideFeedLocationSuggestions();
        const applied = applyViewerLocationSelection({
          lat: suggestion.lat,
          lng: suggestion.lng,
          label: suggestion.label,
          city: suggestion.city || suggestion.label,
          country: suggestion.country,
          countryCode: suggestion.countryCode,
          source: "city-search"
        });
        if (!applied) {
          requestViewerLocationAccess({ fallbackCity: suggestion });
        }
        return true;
      };
      if (applySuggestion(getFeedLocationCitySuggestions(query, 1)[0])) return;
      // Enter darf nie ins Leere laufen: sind die Vorschlaege noch nicht
      // geladen, sofort remote suchen und das beste Ergebnis uebernehmen.
      void (async () => {
        await requestRemoteFeedLocationSuggestions(query);
        const liveQuery = String(cityInput.value || "").trim();
        if (normalizeLocationQuery(liveQuery) !== normalizeLocationQuery(query)) return;
        if (applySuggestion(getFeedLocationCitySuggestions(query, 1)[0])) return;
        syncFeedLocationSuggestionsDom(liveQuery, { skipRemoteFetch: true });
      })();
    });

    doc.addEventListener("click", (event) => {
      if (!isLocationControlScope()) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const citySuggestion = target.closest("[data-feed-city-suggestion]");
      if (citySuggestion) {
        event.preventDefault();
        event.stopPropagation();
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
            country: cityOption.country,
            countryCode: cityOption.countryCode,
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
        event.preventDefault();
        event.stopPropagation();
        requestViewerLocationAccess({ forceExact: true });
      }
    });
  }

  function bindFeedDelegation() {
    bindFeedLocationControlsDelegation();
    if (isFeedLocationScopeActive()) syncFeedLocationGateDom();
    const feedView = doc?.getElementById("feedView");
    if (!feedView) {
      stopFeedStagePinSync();
      return;
    }
    bindFeedStagePinSync(feedView);
    const feedViewMode = String(feedView.dataset.feedViewMode || "").trim().toLowerCase();
    if (feedViewMode === "feed") {
      queueFeedStageAutoPinScroll();
      syncStoryPreviewMotion();
    } else {
      feedStageAutoPinScrollQueued = false;
      clearFeedStageAutoPinScrollFrame();
    }
    if (feedView.dataset.bound === "true") {
      syncStoryPreviewMotion();
      syncFeedLocationGateDom();
      return;
    }
    const isLocationView = () => String(feedView.dataset.feedViewMode || "").trim().toLowerCase() !== "feed";
    // Nur noch die Story-Kreise fuehren in den Viewer - der Beitrag oeffnet das
    // Modal. Ihn weiter vorzuladen wuerde auf 3G ein Dokument holen, das
    // niemand mehr aufruft.
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
    feedView.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const storyLink = target.closest("[data-story-item]");
      if (storyLink) {
        handleStoryWarmup(storyLink);
        return;
      }
      const deleteBtn = target.closest("[data-feed-post-delete]");
      if (deleteBtn) {
        const postId = deleteBtn.dataset.feedPostDelete || "";
        if (postId) {
          void deleteOwnFeedPostFn(postId);
        }
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
      const postOpenBtn = target.closest("[data-feed-post-open-modal]");
      if (postOpenBtn) {
        const postId = postOpenBtn.dataset.feedPostOpenModal || "";
        const post = findFeedPostById(postId);
        if (post) {
          void openPostModalFn(post, resolveFeedHeroPreview(postOpenBtn, postId));
        }
        return;
      }
      const commentBtn = target.closest("[data-feed-post-comment]");
      if (commentBtn) {
        const postId = commentBtn.dataset.feedPostComment || "";
        const post = findFeedPostById(postId);
        if (post) {
          void Promise.resolve(openPostModalFn(post, resolveFeedHeroPreview(commentBtn, postId)))
            .then(() => {
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
        const payload = { title, text, url };
        // Ohne natives Teilen-Menue - oder wenn das Geraet genau diesen Inhalt
        // nicht teilen kann - wandert der Link in die Zwischenablage. Der Knopf
        // sagt danach, was passiert ist, statt still zu bleiben.
        const fallbackToCopy = () => {
          void copyTextToClipboard(url).then((copied) => {
            setShareButtonFeedback(shareBtn, copied ? "Linku u kopjua" : "Kopjo linkun");
          });
        };
        const nativeShare = win?.navigator?.share;
        const canShare = typeof win?.navigator?.canShare === "function"
          ? (() => {
            try {
              return win.navigator.canShare(payload);
            } catch {
              return true;
            }
          })()
          : true;
        if (typeof nativeShare !== "function" || !canShare) {
          fallbackToCopy();
          return;
        }
        // navigator.share wirft auf manchen Geraeten schon beim Aufruf, nicht
        // erst im abgelehnten Versprechen - deshalb der Rahmen darum.
        try {
          void Promise.resolve(nativeShare.call(win.navigator, payload))
            .then(() => {
              setShareButtonFeedback(shareBtn, "U nda");
            })
            .catch((err) => {
              // Abgebrochen heisst: der Nutzer hat das Menue selbst zugemacht.
              // Dann ist nichts schiefgegangen und nichts zu melden.
              if (String(err?.name || "").trim() === "AbortError") return;
              fallbackToCopy();
            });
        } catch {
          fallbackToCopy();
        }
        return;
      }
      const navBtn = target.closest("[data-nav]");
      if (navBtn) {
        const tab = navBtn.dataset.nav;
        if (tab) {
          if (tab === "favorites" && !String(state.user?.uid || "").trim()) {
            openGuestAuthPromptFn("Ju lutem regjistrohuni ose hyni per te perdorur te preferuarat.");
            return;
          }
          const uploadPatch = tab === "upload"
            ? { upload: buildUploadStateForIntentFn(navBtn.dataset.uploadIntent || "", state.upload) }
            : {};
          const activeTab = tab === "favorites" ? "profile" : tab;
          const nextProfileTopTab = tab === "favorites"
            ? "favorites"
            : (tab === "profile" ? "profile" : state.profileTopTab);
          if (tab === "profile" && typeof openOwnBusinessProfileFn === "function") {
            state.chatSettingsOpen = false;
            state.chatListScope = "inbox";
            state.chatThreadMenuId = "";
            state.settingsView = "main";
            state.selectedBusiness = null;
            state.postModal = { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false };
            state.likesModal = { open: false, postId: "", animate: false };
            state.leadModal = { open: false, mode: "create", lead: null, status: "", loading: false, deleting: false, actionsOpen: false, logoFile: null, logoPreview: "", bestSpotLogoFile: null, bestSpotLogoPreview: "", coords: null, locations: [] };
            state.customerModal = { open: false, mode: "edit", customer: null, status: "", loading: false, logoFile: null, logoPreview: "" };
            openOwnBusinessProfileFn({ showBack: false, topTab: "profile" });
            return;
          }
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
            leadModal: { open: false, mode: "create", lead: null, status: "", loading: false, deleting: false, actionsOpen: false, logoFile: null, logoPreview: "", bestSpotLogoFile: null, bestSpotLogoPreview: "", coords: null, locations: [] },
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
        }, { showBack: true });
      }
    });
    syncStoryPreviewMotion();
    syncFeedLocationGateDom();
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
