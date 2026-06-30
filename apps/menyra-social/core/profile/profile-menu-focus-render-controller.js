import { normalizeMenuCardStyleCore } from "../menu/menu-card-style-utils.js";
import {
  isSettlingProfileSurfaceStatus,
  resolveVisibleProfileSurface
} from "./public-profile-surface-controller.js";
import {
  normalizePublicMenuTruthState,
  resolveVisiblePublicMenuSurfaceState
} from "./public-menu-surface-state-utils.js";
import { t } from "/shared/i18n/i18n.js";

export function createProfileMenuFocusRenderController(deps = {}) {
  const state = deps.state;
  const resolvePostCounts = deps.resolvePostCountsFn;
  const escapeHtml = deps.escapeHtmlFn;
  const getOptimizedImageUrl = deps.getOptimizedImageUrlFn;
  const icon = deps.iconFn;
  const isLocalBusinessProfile = deps.isLocalBusinessProfileFn;
  const isCeoUser = typeof deps.isCeoUserFn === "function"
    ? deps.isCeoUserFn
    : (() => false);
  const normalizeHandle = deps.normalizeHandleFn;
  const logoFitClass = deps.logoFitClassFn;
  const formatCount = deps.formatCountFn;
  const renderProfileShopCartView = deps.renderProfileShopCartViewFn;
  const renderProfileShopFavoritesView = deps.renderProfileShopFavoritesViewFn;
  const ensurePostsDataForProfile = typeof deps.ensurePostsDataForProfileFn === "function"
    ? deps.ensurePostsDataForProfileFn
    : (() => {});
  const ensureMenuDataForProfile = deps.ensureMenuDataForProfileFn;
  const ensureEditorMenuDataForProfile = typeof deps.ensureEditorMenuDataForProfileFn === "function"
    ? deps.ensureEditorMenuDataForProfileFn
    : (() => {});
  const ensureFocusDataForProfile = deps.ensureFocusDataForProfileFn;
  const ensureAdsDataForProfile = typeof deps.ensureAdsDataForProfileFn === "function"
    ? deps.ensureAdsDataForProfileFn
    : (() => {});
  const ensureTableQrStateForProfile = deps.ensureTableQrStateForProfileFn;
  const isShopCatalogProfile = deps.isShopCatalogProfileFn;
  const getBusinessCatalogLabel = deps.getBusinessCatalogLabelFn;
  const normalizeMenuType = deps.normalizeMenuTypeFn;
  const primeMenuItemCounts = deps.primeMenuItemCountsFn;
  const hydrateMenuCardViewerLikes = typeof deps.hydrateMenuCardViewerLikesFn === "function"
    ? deps.hydrateMenuCardViewerLikesFn
    : (() => Promise.resolve());
  const renderShopProductList = deps.renderShopProductListFn;
  const getMenuLayoutTheme = deps.getMenuLayoutThemeFn;
  const MENU_LAYOUT_COLORS = deps.menuLayoutColors;
  const resolveMenuItemHero = deps.resolveMenuItemHeroFn;
  const isPlaceholderUrl = deps.isPlaceholderUrlFn;
  const PLACEHOLDER_IMAGE = deps.placeholderImage;
  const getFirebaseStorageUrl = deps.getFirebaseStorageUrlFn;
  const isDirectImageUrl = deps.isDirectImageUrlFn;
  const formatPrice = deps.formatPriceFn;
  const resolveCurrencyCodeForMenuItem = typeof deps.resolveCurrencyCodeForMenuItemFn === "function"
    ? deps.resolveCurrencyCodeForMenuItemFn
    : (() => "");
  const getMenuItemImages = deps.getMenuItemImagesFn;
  const getMenuItemObjectPosition = deps.getMenuItemObjectPositionFn;
  const getMenuItemSocialId = deps.getMenuItemSocialIdFn;
  const menuItemMetaKey = deps.menuItemMetaKeyFn;
  const ensureMenuItemMeta = deps.ensureMenuItemMetaFn;
  const resolveMenuItemCounts = deps.resolveMenuItemCountsFn;
  const getFocusStateForRestaurant = deps.getFocusStateForRestaurantFn;
  const getAdsStateForRestaurant = typeof deps.getAdsStateForRestaurantFn === "function"
    ? deps.getAdsStateForRestaurantFn
    : (() => ({ items: [], enabled: true, loading: false, same: false }));
  const getTableQrStateForRestaurant = deps.getTableQrStateForRestaurantFn;
  const getFocusItemObjectPosition = deps.getFocusItemObjectPositionFn;
  const getFocusCardClass = deps.getFocusCardClassFn;
  const getFocusIndex = deps.getFocusIndexFn;
  const isRestaurantCafeProfile = deps.isRestaurantCafeProfileFn;
  const getBusinessProfileType = typeof deps.getBusinessProfileTypeFn === "function"
    ? deps.getBusinessProfileTypeFn
    : (() => "");
  const getRestaurantMetaById = deps.getRestaurantMetaByIdFn;
  const buildUrl = deps.buildUrlFn;
  const normalizeSearchKey = deps.normalizeSearchKeyFn;
  const normalizeFollowHandle = deps.normalizeFollowHandleFn;
  const menuCardViewerLikeHydrationState = {
    key: "",
    inFlightKey: ""
  };
  const tr = (key, fallback = key, params = {}) => t(key, { fallback, params });
  const translateCatalogLabel = (label = "") => {
    const safeLabel = String(label || "").trim();
    if (!safeLabel) return tr("nav.menu", "Menue");
    const normalized = safeLabel.toLowerCase();
    if (normalized === "menue" || normalized === "menu" || normalized === "menü") {
      return tr("nav.menu", safeLabel);
    }
    if (normalized === "shop") return "Shop";
    return safeLabel;
  };
  const normalizeShopProductCategoryLabel = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const normalized = raw.toLowerCase();
    if (["speisen", "food", "getraenke", "getränke", "drink", "drinks", "beverage", "beverages"].includes(normalized)) {
      return tr("menu.products", "Produkte");
    }
    return raw;
  };
  const menuSectionLabel = (section = "food", isShopMode = false) => {
    if (isShopMode) return tr("menu.products", "Produkte");
    return String(section || "").trim().toLowerCase() === "drink"
      ? tr("menu.drinks", "Getraenke")
      : tr("menu.food", "Speisen");
  };
  const menuItemTypeLabel = (item = {}, isShopMode = false) => {
    const type = normalizeMenuType(item?.type || "food");
    if (isShopMode) return tr("menu.product", "Produkt");
    return type === "drink" ? tr("menu.drinkItem", "Getraenk") : tr("menu.foodItem", "Speise");
  };
  const normalizeBusinessNameColor = (value = "", fallback = "#111827") => {
    const raw = String(value || "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : fallback;
  };

function resolveMenuSurfaceRestaurantId(profile = null, routePayload = null) {
  return resolveVisiblePublicMenuSurfaceState(state, {
    profile,
    routePayload,
    webDirectEntry: state?.__webDirectEntry
  }).restaurantId;
}

function buildMenuSurfaceProfile(profile = null, restaurantId = "") {
  if (!profile || typeof profile !== "object") return profile;
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId) return profile;
  const canonicalRestaurantId = String(profile.canonicalRestaurantId || "").trim();
  if (String(profile.restaurantId || "").trim() === safeRestaurantId && canonicalRestaurantId) {
    return profile;
  }
  return {
    ...profile,
    restaurantId: safeRestaurantId,
    ...(canonicalRestaurantId ? { canonicalRestaurantId } : {})
  };
}

function hasConfirmedPublicMenuItemsForRestaurant(restaurantId = "") {
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId) return false;
  const surface = resolveVisiblePublicMenuSurfaceState(state, {
    profile: state?.profileView?.profile || state?.userProfile,
    routePayload: state?.profileView?.routePayload,
    webDirectEntry: state?.__webDirectEntry,
    restaurantId: safeRestaurantId
  });
  return surface.menu.status === "ready";
}

function hasPublicFocusTruthForRestaurant(restaurantId = "") {
  const safeRestaurantId = String(restaurantId || "").trim();
  if (!safeRestaurantId) return false;
  const surface = resolveVisiblePublicMenuSurfaceState(state, {
    profile: state?.profileView?.profile || state?.userProfile,
    routePayload: state?.profileView?.routePayload,
    webDirectEntry: state?.__webDirectEntry,
    restaurantId: safeRestaurantId
  });
  return surface.focus.canRenderFocus;
}

function formatMenuItemPrice(item = {}) {
  const currencyCode = String(resolveCurrencyCodeForMenuItem(item) || "").trim();
  if (currencyCode) return formatPrice(item?.price, currencyCode);
  return formatPrice(item?.price);
}

function buildMenuCardViewerLikeHydrationKey(items = [], restaurantId = "", userUid = "") {
  const rid = String(restaurantId || "").trim();
  const uid = String(userUid || "").trim();
  if (!rid || !uid) return "";
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return `${rid}|${uid}|empty`;
  const ids = [];
  list.forEach((item) => {
    const resolvedId = String(getMenuItemSocialId(item) || item?.id || "").trim();
    if (resolvedId) ids.push(resolvedId);
  });
  if (!ids.length) return `${rid}|${uid}|empty`;
  ids.sort();
  return `${rid}|${uid}|${ids.join(",")}`;
}

function maybeHydrateMenuCardViewerLikes(items = [], restaurantId = "") {
  const userUid = String(state.user?.uid || "").trim();
  const key = buildMenuCardViewerLikeHydrationKey(items, restaurantId, userUid);
  if (!key) return;
  if (menuCardViewerLikeHydrationState.inFlightKey === key) return;
  if (menuCardViewerLikeHydrationState.key === key) {
    return;
  }
  menuCardViewerLikeHydrationState.key = key;
  menuCardViewerLikeHydrationState.inFlightKey = key;
  void hydrateMenuCardViewerLikes(items, restaurantId).catch((err) => {
    console.error(err);
    if (menuCardViewerLikeHydrationState.key === key) {
      menuCardViewerLikeHydrationState.key = "";
    }
  }).finally(() => {
    if (menuCardViewerLikeHydrationState.inFlightKey === key) {
      menuCardViewerLikeHydrationState.inFlightKey = "";
    }
  });
}

function isFollowingProfile(profile = {}) {
  const uid = String(profile?.uid || "").trim();
  if (uid && state.followingTargetIds.includes(uid)) return true;
  const restaurantId = String(profile?.restaurantId || "").trim();
  if (restaurantId && state.followingTargetIds.includes(restaurantId)) return true;
  const followKey = normalizeFollowHandle(profile?.handle || "");
  return !!(followKey && state.followingHandles.includes(followKey));
}

function isSpecialEnabledForProfile(profile = {}) {
  if (profile?.specialEnabled === true) return true;
  if (profile?.specialEnabled === false) return false;
  const restaurantId = String(profile?.restaurantId || "").trim();
  if (!restaurantId) return false;
  const restaurant = typeof getRestaurantMetaById === "function"
    ? (getRestaurantMetaById(restaurantId) || null)
    : null;
  if (restaurant?.specialEnabled === true) return true;
  if (restaurant?.specialEnabled === false) return false;
  return false;
}

function isSpecialMenuItem(item = {}) {
  const style = resolveMenuCardStyle(item);
  if (style === "testfirst_special") return true;
  return String(item?.category || "").trim().toLowerCase() === "special";
}

function renderProfilePostCardFancy(item, isGrid, allowMenu = true, { includeImageKey = true } = {}) {
  const counts = resolvePostCounts(item);
  const postId = item.id ? String(item.id) : "";
  const postAttr = postId ? `data-open-post="${escapeHtml(postId)}"` : "";
  const likeAttr = postId ? `data-post-like-count="${escapeHtml(postId)}"` : "";
  const commentAttr = postId ? `data-post-comment-count="${escapeHtml(postId)}"` : "";
  const imgKeyAttr = includeImageKey && postId ? `data-img-key="profile-post:${escapeHtml(postId)}"` : "";
  const isWide = item.type === "wide" || item.type === "hero";
  const colClass = isGrid && isWide ? "col-span-2" : "";
  const aspectClass = isGrid
    ? (isWide ? "aspect-[1.8/1]" : "aspect-[4/5]")
    : "aspect-[4/5]";
  const imageUrl = getOptimizedImageUrl(item.url, isWide ? "large" : "medium", {
    stableKey: postId ? `profile-post:${postId}` : "",
    variantGroup: "post-detail"
  });
  const width = isWide ? 800 : 400;
  const height = isWide ? 400 : 500;
  return `
    <div ${postAttr} role="button" tabindex="0" class="${colClass} relative ${aspectClass} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${escapeHtml(imageUrl)}" loading="lazy" decoding="async" width="${width}" height="${height}" ${imgKeyAttr} class="w-full h-full object-cover" />
        ${item.isVideo ? `<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${icon("play", "w-3 h-3 fill-white")}</div>` : ""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${icon("heart", "w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${likeAttr} class="text-[10px] font-bold tracking-wide">${escapeHtml(counts.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${icon("message-circle", "w-3 h-3 text-indigo-200")}
                <span ${commentAttr} class="text-[10px] font-bold tracking-wide">${escapeHtml(counts.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${postId && allowMenu ? `
        <button type="button" data-profile-menu-button="${escapeHtml(postId)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${icon("more-horizontal", "w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${escapeHtml(postId)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${escapeHtml(postId)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${icon(isWide ? "minimize-2" : "maximize-2", "w-3.5 h-3.5")}
            ${isWide ? "Schmaler" : "Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${escapeHtml(postId)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${icon("trash-2", "w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      ` : ""}
    </div>
  `;
}

function renderProfilePostsFancy(posts, viewMode, allowMenu = true, { includeImageKeys = true } = {}) {
  const isGrid = viewMode === "grid";
  if (!posts.length) {
    return `
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${icon("image", "w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${escapeHtml(tr("profile.noContent", "Keine Inhalte gefunden"))}</p>
      </div>
    `;
  }
  const cards = posts.map((post) => renderProfilePostCardFancy(post, isGrid, allowMenu, { includeImageKey: includeImageKeys }));
  const slotCount = posts.reduce((total, post) => {
    const isWide = post?.type === "wide" || post?.type === "hero";
    return total + (isWide ? 2 : 1);
  }, 0);
  if (isGrid && (slotCount % 2 === 1)) {
    cards.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `);
  }
  return cards.join("");
}

function renderProfileCheckins() {
  const checkins = state.profileCheckins || [];
  if (!checkins.length) {
    return `
      <div class="app-content-inline app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${icon("map-pin", "w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${escapeHtml(tr("profile.noCheckins", "Keine Check-ins gefunden"))}</p>
      </div>
    `;
  }
  return `
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${checkins.map((place) => {
        const imageUrl = getOptimizedImageUrl(place.image, "thumb");
        return `
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${escapeHtml(imageUrl)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${escapeHtml(place.name || "Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${icon("map-pin", "w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${escapeHtml(place.city || "Stadt")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${icon("arrow-right", "w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `;
}

function isBusinessProfileEntity(profile = {}) {
  const restaurantId = String(profile?.canonicalRestaurantId || profile?.restaurantId || "").trim();
  if (restaurantId) return true;
  return String(profile?.role || "").trim().toLowerCase() === "business";
}

function isHotelBusinessProfile(profile = {}) {
  const type = String(getBusinessProfileType(profile) || "").trim().toLowerCase();
  return type === "hotel" || type === "motel";
}

function getHotelProfileRecord(profile = {}) {
  const restaurantId = String(profile?.canonicalRestaurantId || profile?.restaurantId || "").trim();
  const meta = restaurantId ? getRestaurantMetaById(restaurantId) : null;
  return {
    ...(meta && typeof meta === "object" ? meta : {}),
    ...(profile && typeof profile === "object" ? profile : {})
  };
}

function normalizeHotelEditorOfferItem(item = {}, fallbackId = "") {
  const raw = item && typeof item === "object" ? item : {};
  const id = String(raw.id || raw._id || raw.offerId || raw.menuItemId || fallbackId || "offer").trim();
  return {
    ...raw,
    id,
    menuItemId: String(raw.menuItemId || raw.targetMenuItemId || raw.itemId || raw.targetItemId || "").trim(),
    title: raw.title || raw.name || "Oferta",
    text: raw.text || raw.desc || raw.description || "",
    imageUrl: raw.imageUrl || raw.image || raw.photoUrl || "",
    active: raw.active !== false
  };
}

function collectHotelEditorOfferItems(record = {}) {
  const sources = [
    ...(Array.isArray(record.publicOffers) ? record.publicOffers : []),
    ...(Array.isArray(record.travelOffers) ? record.travelOffers : []),
    ...(Array.isArray(record.offerItems) ? record.offerItems : [])
  ];
  const seen = new Set();
  return sources.map((item, index) => normalizeHotelEditorOfferItem(item, `offer_${index}`)).filter((item) => {
    const key = String(item.id || `${item.title}|${item.text}|${item.imageUrl}`).trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function seedHotelEditorOfferStateFromRecord(profile = {}) {
  const record = getHotelProfileRecord(profile);
  const restaurantId = String(profile?.restaurantId || profile?.canonicalRestaurantId || record.restaurantId || record.canonicalRestaurantId || record.id || "").trim();
  if (!restaurantId) return false;
  const current = state.focus && typeof state.focus === "object" ? state.focus : {};
  const sameRestaurant = String(current.restaurantId || "").trim() === restaurantId;
  const currentTruthSource = String(current.truthSource || "").trim().toLowerCase();
  if (sameRestaurant && currentTruthSource === "public-menu") return false;
  const currentItems = sameRestaurant && Array.isArray(current.items) ? current.items : [];
  if (currentItems.length) return false;
  const offerItems = collectHotelEditorOfferItems(record);
  const hasKnownOfferTruth = offerItems.length > 0
    || Array.isArray(record.publicOffers)
    || Array.isArray(record.travelOffers)
    || Array.isArray(record.offerItems)
    || Number.isFinite(Number(record.publicOffersCount))
    || Number.isFinite(Number(record.travelOffersCount))
    || typeof record.hasTravelOffers === "boolean"
    || String(record.offersTruthState || "").trim();
  if (!hasKnownOfferTruth) return false;
  state.focus = {
    ...current,
    restaurantId,
    items: offerItems,
    enabled: current.enabled !== false,
    loading: false,
    error: "",
    index: 0,
    truthSource: "restaurant-cache",
    truthState: offerItems.length ? "seeded" : "knownEmpty"
  };
  return true;
}

function readHotelCoords(record = {}) {
  const candidates = [
    record?.verifiedMapLocation,
    record?.mapLocation,
    record?.geo,
    record?.coordinates,
    record?.coords,
    record?.locationCoords,
    record
  ];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const lat = Number(candidate.lat ?? candidate.latitude);
    const lng = Number(candidate.lng ?? candidate.lon ?? candidate.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  return null;
}

function readFirstHotelText(record = {}, keys = []) {
  for (const key of keys) {
    const value = String(record?.[key] || "").trim();
    if (value) return value;
  }
  return "";
}

function collectHotelTextList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  const raw = String(value || "").trim();
  if (!raw) return [];
  return raw.split(/[\n,;|]/).map((item) => item.trim()).filter(Boolean);
}

function collectHotelCoverImages(record = {}) {
  const images = [
    ...collectHotelTextList(record.coverImages),
    ...collectHotelTextList(record.hotelCoverImages),
    ...collectHotelTextList(record.titleImages),
    record.titleImageUrl,
    record.coverImageUrl,
    record.coverUrl,
    record.heroUrl,
    record.imageUrl
  ].map((item) => String(item || "").trim()).filter(Boolean);
  const unique = [];
  images.forEach((image) => {
    if (!unique.includes(image)) unique.push(image);
  });
  return unique.slice(0, 8);
}

function hasHotelCardEditorScopedDraft(editor = {}) {
  if (!editor || typeof editor !== "object") return false;
  return Array.isArray(editor.existingImages)
    || Array.isArray(editor.imagePreviews)
    || Array.isArray(editor.imageFiles)
    || !!String(editor.imageUrlDraft || "").trim()
    || editor.saving === true
    || editor.detailsOpen === true
    || !!String(editor.status || "").trim();
}

function getHotelCardEditorStateForRestaurant(restaurantId = "") {
  const safeRestaurantId = String(restaurantId || "").trim();
  const editor = state.hotelCardEditor && typeof state.hotelCardEditor === "object"
    ? state.hotelCardEditor
    : {};
  const editorRestaurantId = String(editor.restaurantId || "").trim();
  if (editorRestaurantId) {
    return editorRestaurantId === safeRestaurantId ? editor : {};
  }
  return hasHotelCardEditorScopedDraft(editor) ? {} : editor;
}

function getHotelCardFeatureValues(record = {}) {
  const features = Array.isArray(record.features) ? record.features.map((item) => String(item || "").trim()).filter(Boolean) : [];
  const restaurantFeatures = record.restaurantFeatures && typeof record.restaurantFeatures === "object"
    ? record.restaurantFeatures
    : {};
  return [
    readFirstHotelText(record, ["hotelFeatureOneText", "gardenTerraceText"]) || String(restaurantFeatures.gardenTerrace || "").trim() || features[0] || "",
    readFirstHotelText(record, ["hotelFeatureTwoText", "accessibilityText"]) || String(restaurantFeatures.accessibility || "").trim() || features[1] || "",
    readFirstHotelText(record, ["hotelFeatureThreeText", "veganOptionsText"]) || String(restaurantFeatures.veganOptions || "").trim() || features[2] || ""
  ];
}

function collectHotelAmenities(record = {}) {
  const values = [];
  const push = (label = "") => {
    const safeLabel = String(label || "").trim();
    if (safeLabel && !values.includes(safeLabel)) values.push(safeLabel);
  };
  [
    record.amenities,
    record.features,
    record.included,
    record.facilities,
    record.hotelAmenities
  ].forEach((list) => {
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      if (typeof item === "string") push(item);
      else if (item && typeof item === "object") push(item.label || item.name || item.title);
    });
  });
  if (record.beachfront || record.onBeach || record.amStrand) push("Në plazh");
  if (record.restaurant || record.hasRestaurant) push("Restaurant");
  if (record.breakfast || record.breakfastIncluded) push("Mëngjes");
  if (record.pool || record.hasPool) push("Pool");
  if (record.wifi || record.freeWifi || record.hasWifi) push("WLAN");
  if (record.parking || record.freeParking || record.hasParking) push("Parking");
  if (record.spa || record.wellness) push("Wellness");
  return values.slice(0, 8);
}

const HOTEL_DISTANCE_UNITS = [
  { value: "m", label: "m" },
  { value: "km", label: "km" }
];

const HOTEL_CENTER_DIRECT_LABEL = "Në qendër";
const HOTEL_BEACH_DIRECT_LABEL = "Në plazh";
const HOTEL_CENTER_DISTANCE_SUFFIX = "nga qendra";
const HOTEL_BEACH_DISTANCE_SUFFIX = "nga plazhi";

const HOTEL_FOOD_FEATURE_OPTIONS = [
  "Mëngjes",
  "Gjysmë pension",
  "Pension i plotë",
  "All inclusive",
  "Restorant",
  "Pa ushqim"
];

const HOTEL_LOUNGER_FEATURE_OPTIONS = [
  "Shezlongë falas",
  "Shezlongë me pagesë",
  "Plazh privat",
  "Pa shezlongë"
];

const HOTEL_PARKING_FEATURE_OPTIONS = [
  "Parking falas",
  "Parking privat",
  "Parking me pagesë",
  "Pa parking"
];

function normalizeHotelEditorKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[ëèéê]/g, "e")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseHotelDistanceEditorValue(value = "", { direct = false } = {}) {
  const raw = String(value || "").trim();
  const normalized = normalizeHotelEditorKey(raw);
  const isDirect = direct
    || normalized === "ne_qender"
    || normalized === "ne_plazh"
    || normalized === "direkt_ne_qender"
    || normalized === "direkt_ne_plazh"
    || (normalized.includes("direkt") && (normalized.includes("strand") || normalized.includes("zentrum") || normalized.includes("center")))
    || normalized.includes("am_strand")
    || normalized.includes("im_zentrum");
  const match = raw.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i);
  const amount = match ? match[1].replace(",", ".") : "";
  const unitRaw = match ? String(match[2] || "").trim().toLowerCase() : "";
  const unit = unitRaw.startsWith("k") ? "km" : "m";
  return { amount, unit, isDirect };
}

function renderHotelDistanceEditorField({
  idPrefix = "",
  iconName = "navigation",
  label = "",
  value = "",
  directLabel = "",
  direct = false
} = {}) {
  const parsed = parseHotelDistanceEditorValue(value, { direct });
  return `
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${icon(iconName, "w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${escapeHtml(label)}</p>
          <p class="text-[10px] font-bold text-slate-400">${escapeHtml(directLabel)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${escapeHtml(idPrefix)}Value" type="number" min="0" step="0.1" value="${escapeHtml(parsed.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${escapeHtml(idPrefix)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${HOTEL_DISTANCE_UNITS.map((unit) => `<option value="${escapeHtml(unit.value)}" ${parsed.unit === unit.value ? "selected" : ""}>${escapeHtml(unit.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${escapeHtml(directLabel)}</span>
        <input id="${escapeHtml(idPrefix)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${parsed.isDirect ? "checked" : ""} />
      </label>
    </div>
  `;
}

function renderHotelFeatureOptionList(options = [], selected = "") {
  const safeSelected = String(selected || "").trim();
  const optionKeys = new Set(options.map(normalizeHotelEditorKey));
  return `
    <option value="">Zgjidh</option>
    ${options.map((option) => `<option value="${escapeHtml(option)}" ${normalizeHotelEditorKey(option) === normalizeHotelEditorKey(safeSelected) ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
    ${safeSelected && !optionKeys.has(normalizeHotelEditorKey(safeSelected)) ? `<option value="${escapeHtml(safeSelected)}" selected>Aktuale: ${escapeHtml(safeSelected)}</option>` : ""}
  `;
}

function renderHotelFeatureSelect({
  id = "",
  iconName = "badge-check",
  label = "",
  value = "",
  options = []
} = {}) {
  return `
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${icon(iconName, "w-4 h-4")}
        </div>
        <label for="${escapeHtml(id)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${escapeHtml(label)}</label>
      </div>
      <select id="${escapeHtml(id)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${renderHotelFeatureOptionList(options, value)}
      </select>
    </div>
  `;
}

function collectHotelCustomFeatureValues(record = {}, primaryValues = []) {
  const primaryKeys = new Set(primaryValues.map(normalizeHotelEditorKey).filter(Boolean));
  const custom = [];
  const push = (value = "") => {
    const safeValue = String(value || "").trim();
    if (!safeValue) return;
    const key = normalizeHotelEditorKey(safeValue);
    if (primaryKeys.has(key)) return;
    if (!custom.some((entry) => normalizeHotelEditorKey(entry) === key)) custom.push(safeValue);
  };
  [
    record.features,
    record.hotelFeatures,
    record.amenities,
    record.facilities,
    record.hotelAmenities
  ].forEach((value) => collectHotelTextList(value).forEach(push));
  return custom;
}

function renderHotelCardImagesEditor({ existingImages = [], newPreviews = [], imageUrlDraft = "" } = {}) {
  const gallery = [
    ...newPreviews.map((src, idx) => ({ src, kind: "new", idx })),
    ...existingImages.map((src, idx) => ({ src, kind: "existing", idx }))
  ].filter((entry) => entry.src);
  const heroRaw = gallery[0]?.src || imageUrlDraft || "";
  const heroUrl = heroRaw ? getOptimizedImageUrl(heroRaw, "large") : PLACEHOLDER_IMAGE;
  return `
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${escapeHtml(heroUrl || PLACEHOLDER_IMAGE)}" class="w-full h-52 object-cover bg-white" />
        <button type="button" id="hotelCardCoverImagesTrigger" aria-label="Ngarko foto" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${icon("camera", "w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${icon("plus", "w-2.5 h-2.5")}
          </span>
        </button>
      </div>

      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Fotot</p>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${gallery.length}</span>
        </div>
        ${gallery.length ? `
          <div class="grid grid-cols-3 gap-2">
            ${gallery.map((entry) => `
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                ${entry.kind === "existing" ? `<span data-hotel-card-existing-image="${escapeHtml(entry.src)}" hidden></span>` : ""}
                <img src="${escapeHtml(getOptimizedImageUrl(entry.src, "thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-hotel-card-image-remove="${entry.idx}" data-hotel-card-image-source="${entry.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${icon("x", "w-3 h-3")}
                </button>
              </div>
            `).join("")}
          </div>
        ` : `
          <div class="h-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">
            Pa foto
          </div>
        `}
      </div>

      <input id="hotelCardCoverImageUrl" type="hidden" value="${escapeHtml(imageUrlDraft)}" />
    </div>
  `;
}

function renderHotelDetailCard({ iconName = "info", label = "", value = "", helper = "" } = {}) {
  return `
    <div class="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm">
      <div class="flex items-start gap-4">
        <div class="w-11 h-11 rounded-[1.25rem] bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          ${icon(iconName, "w-5 h-5")}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">${escapeHtml(label)}</p>
          <p class="text-sm font-black text-slate-900 leading-snug">${escapeHtml(value || "Shto detajet")}</p>
          ${helper ? `<p class="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">${escapeHtml(helper)}</p>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderHotelDetailsView(profile = {}) {
  const record = getHotelProfileRecord(profile);
  const coords = readHotelCoords(record);
  const address = readFirstHotelText(record, [
    "address",
    "primaryAddress",
    "location",
    "formattedAddress",
    "street"
  ]);
  const city = readFirstHotelText(record, ["city", "locationCity", "primaryCity", "region", "country"]);
  const beachDistance = readFirstHotelText(record, [
    "beachDistance",
    "distanceToBeach",
    "beachDistanceLabel",
    "strandEntfernung"
  ]);
  const centerDistance = readFirstHotelText(record, [
    "distanceCenter",
    "distanceToCenter",
    "centerDistance",
    "cityCenterDistance",
    "centerDistanceLabel",
    "zentrumEntfernung",
    "distanceCentre"
  ]);
  const rating = readFirstHotelText(record, ["rating", "reviewRating", "stars", "hotelStars"]);
  const reviewCount = readFirstHotelText(record, ["reviewCount", "reviewsCount", "ratingsCount", "commentsCount"]);
  const amenities = collectHotelAmenities(record);
  const mapsUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${coords.lat},${coords.lng}`)}`
    : (address || city ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address} ${city}`.trim())}` : "");
  return `
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm overflow-hidden">
        <div class="h-40 rounded-[1.6rem] bg-cyan-50 border border-cyan-100 relative overflow-hidden mb-4">
          <div class="absolute inset-0 opacity-80" style="background-image: linear-gradient(135deg, rgba(0,204,229,0.18), rgba(15,23,42,0.04));"></div>
          <div class="absolute inset-0 flex items-center justify-center text-cyan-600">
            ${icon("map-pin", "w-10 h-10")}
          </div>
          <div class="absolute left-4 right-4 bottom-4 bg-white/90 backdrop-blur rounded-2xl p-3 border border-white/70">
            <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Lokacioni</p>
            <p class="text-xs font-black text-slate-900 leading-snug">${escapeHtml(address || city || "Shto lokacionin")}</p>
          </div>
        </div>
        ${mapsUrl ? `
          <a href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer" class="w-full h-12 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            ${icon("navigation", "w-4 h-4")} Hap hartën
          </a>
        ` : ""}
      </div>

      <div class="grid grid-cols-1 gap-4">
        ${renderHotelDetailCard({
          iconName: "map-pin",
          label: "Adresa",
          value: [address, city].filter(Boolean).join(", ") || "Shto lokacionin",
          helper: coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : ""
        })}
        ${renderHotelDetailCard({
          iconName: "navigation",
          label: "Qendra",
          value: centerDistance || "Shto detajet"
        })}
        ${renderHotelDetailCard({
          iconName: "waves",
          label: "Plazhi",
          value: beachDistance || (record.beachfront || record.onBeach ? HOTEL_BEACH_DIRECT_LABEL : "Shto detajet")
        })}
        ${renderHotelDetailCard({
          iconName: "star",
          label: "Vlerësime",
          value: rating ? `${rating}${reviewCount ? ` / ${reviewCount} vlerësime` : ""}` : "Pa vlerësime",
          helper: readFirstHotelText(record, ["reviewSummary", "ratingSummary", "commentsSummary"])
        })}
      </div>

      <div class="bg-white rounded-[2.2rem] border border-slate-100 p-5 shadow-sm">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">Të përfshira</p>
        ${amenities.length ? `
          <div class="flex flex-wrap gap-2">
            ${amenities.map((item) => `<span class="px-3 py-2 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600">${escapeHtml(item)}</span>`).join("")}
          </div>
        ` : `
          <p class="text-sm font-bold text-slate-400">Shto pajisjet dhe detajet e dhomave.</p>
        `}
      </div>
    </div>
  `;
}

function renderHotelCardAdminView(profile = {}) {
  const record = getHotelProfileRecord(profile);
  const restaurantId = String(profile?.restaurantId || record.restaurantId || record.id || "").trim();
  const restaurantName = record?.name || record?.restaurantName || profile?.name || "Hotel";
  const editorState = getHotelCardEditorStateForRestaurant(restaurantId);
  const status = String(editorState.status || "").trim();
  const saving = editorState.saving === true;
  const coverImages = Array.isArray(editorState.existingImages)
    ? editorState.existingImages.map((item) => String(item || "").trim()).filter(Boolean)
    : collectHotelCoverImages(record);
  const imagePreviews = Array.isArray(editorState.imagePreviews)
    ? editorState.imagePreviews.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const imageUrlDraft = String(editorState.imageUrlDraft || "").trim();
  const [featureOne, featureTwo, featureThree] = getHotelCardFeatureValues(record);
  const customFeatures = collectHotelCustomFeatureValues(record, [featureOne, featureTwo, featureThree]);
  const distanceCenter = readFirstHotelText(record, [
    "distanceCenter",
    "distanceToCenter",
    "centerDistance",
    "cityCenterDistance",
    "centerDistanceLabel",
    "zentrumEntfernung",
    "distanceCentre"
  ]);
  const distanceBeach = readFirstHotelText(record, [
    "distanceBeach",
    "distanceToBeach",
    "beachDistance",
    "beachDistanceLabel",
    "strandEntfernung",
    "lakeDistance",
    "distanceToLake"
  ]);
  const startingPrice = readFirstHotelText(record, [
    "hotelStartingPrice",
    "startingPrice",
    "priceFrom",
    "fromPrice",
    "bestPrice",
    "roomStartingPrice"
  ]);
  const directCenter = record.directCenter === true || record.inCenter === true || record.cityCenterDirect === true;
  const directBeach = record.beachfront === true || record.onBeach === true || record.amStrand === true;
  const detailsOpen = editorState.detailsOpen === true || saving;
  const detailsThumbRaw = imagePreviews[0] || coverImages[0] || "";
  const detailsThumb = detailsThumbRaw ? getOptimizedImageUrl(detailsThumbRaw, "thumb") : PLACEHOLDER_IMAGE;
  const detailsSummary = [
    distanceCenter,
    distanceBeach,
    startingPrice ? `${startingPrice} €` : ""
  ].filter(Boolean).join(" · ") || "Plotëso detajet";
  const statusIsError = status.includes("fehl") || status.includes("Bitte") || status.includes("Nuk");
  return `
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel Card</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${escapeHtml(restaurantName)}</p>
        </div>
      </div>

      ${restaurantId ? `
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
              <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hotel & Ofertat</p>
            </div>
            <button type="button" data-hotel-card-details-open aria-expanded="${detailsOpen ? "true" : "false"}" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
              ${icon("plus", "w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${detailsOpen ? "true" : "false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${escapeHtml(detailsThumb || PLACEHOLDER_IMAGE)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(restaurantName)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${escapeHtml(detailsSummary)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${detailsOpen ? "Hapur" : "Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${icon("chevron-right", "w-4 h-4")}
            </div>
          </button>

          ${status && !detailsOpen ? `<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${statusIsError ? "text-rose-500" : "text-slate-500"}">${escapeHtml(status)}</div>` : ""}
        </div>

        <div data-hotel-card-editor="${escapeHtml(restaurantId)}" data-hotel-card-details-panel class="${detailsOpen ? "" : "hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
                <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              </div>
              <button type="button" data-hotel-card-details-close class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                ${icon("x", "w-4 h-4")}
              </button>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fotot</p>
              ${renderHotelCardImagesEditor({ existingImages: coverImages, newPreviews: imagePreviews, imageUrlDraft })}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${renderHotelDistanceEditorField({
                idPrefix: "hotelCardDistanceCenter",
                iconName: "navigation",
                label: "Qendra",
                value: distanceCenter,
                directLabel: HOTEL_CENTER_DIRECT_LABEL,
                direct: directCenter
              })}
              ${renderHotelDistanceEditorField({
                idPrefix: "hotelCardDistanceBeach",
                iconName: "waves",
                label: "Plazhi",
                value: distanceBeach,
                directLabel: HOTEL_BEACH_DIRECT_LABEL,
                direct: directBeach
              })}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${escapeHtml(startingPrice)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${renderHotelFeatureSelect({
                id: "hotelCardFeatureOneText",
                iconName: "utensils",
                label: "Ushqimi",
                value: featureOne,
                options: HOTEL_FOOD_FEATURE_OPTIONS
              })}
              ${renderHotelFeatureSelect({
                id: "hotelCardFeatureTwoText",
                iconName: "waves",
                label: "Shezlongë",
                value: featureTwo,
                options: HOTEL_LOUNGER_FEATURE_OPTIONS
              })}
              ${renderHotelFeatureSelect({
                id: "hotelCardFeatureThreeText",
                iconName: "square-parking",
                label: "Parking",
                value: featureThree,
                options: HOTEL_PARKING_FEATURE_OPTIONS
              })}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${escapeHtml(customFeatures.join("\n"))}</textarea>
              </div>
            </div>

            ${status ? `<div class="text-center text-[10px] font-black uppercase tracking-widest ${statusIsError ? "text-rose-500" : "text-slate-500"}">${escapeHtml(status)}</div>` : ""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${saving ? "disabled" : ""}>
              ${saving ? "Po ruhet..." : "Ruaj Hotel Details"}
            </button>
        </div>
        ${renderFocusAdminSection(restaurantId, { variant: "travel-offers", suppressLoading: true })}
      ` : `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `;
}

function resolveProfileContentTabForRendering(profile = {}) {
  const requestedTopTab = String(state.profileTopTab || "").trim().toLowerCase();
  const requestedContentTab = String(state.profileContentTab || "").trim().toLowerCase();
  if (isBusinessProfileEntity(profile)) {
    if (requestedTopTab === "menu") return "menu";
    if (requestedContentTab === "menu" || requestedContentTab === "posts") {
      return requestedContentTab;
    }
    return "posts";
  }
  if (requestedContentTab === "media" || requestedContentTab === "checkins") {
    return requestedContentTab;
  }
  return "posts";
}

function resolveProfilePrimaryTopTab(profile = {}) {
  const requestedTopTab = String(state.profileTopTab || "").trim().toLowerCase();
  if (isBusinessProfileEntity(profile)) {
    if (
      requestedTopTab === "menu"
      || requestedTopTab === "cart"
      || requestedTopTab === "favorites"
      || requestedTopTab === "landing"
    ) {
      return requestedTopTab;
    }
    return "profile";
  }
  if (requestedTopTab === "favorites" && String(state.user?.uid || "").trim()) {
    return "favorites";
  }
  return "profile";
}

function normalizeLandingStep(value = 0) {
  const parsed = Math.round(Number(value || 0));
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(3, parsed));
}

function normalizeLandingGreetingIndex(value = 0, length = 1) {
  const size = Math.max(1, Number(length || 0) || 1);
  const parsed = Math.round(Number(value || 0));
  if (!Number.isFinite(parsed)) return 0;
  const normalized = parsed % size;
  return normalized < 0 ? normalized + size : normalized;
}

function resolveLandingDotStep(step = 0) {
  return normalizeLandingStep(step);
}

function renderBusinessLandingScreenOne(profile = {}) {
  const greetings = [
    "Mirë se vini",
    "Welcome",
    "Willkommen",
    "Bienvenido",
    "Bienvenue",
    "Benvenuto",
    "Olá",
    "Welkom",
    "Välkommen",
    "Hoş geldiniz",
    "Yokoso",
    "Huānyíng",
    "Namaste"
  ];
  const step = normalizeLandingStep(state.profileLandingStep);
  const currentGreetingIndex = normalizeLandingGreetingIndex(state.profileLandingGreetingIndex, greetings.length);
  const landing = profile?.landingScreenOne && typeof profile.landingScreenOne === "object"
    ? profile.landingScreenOne
    : {};
  const businessName = String(
    landing.businessName
    || profile.name
    || "casarita"
  ).trim() || "casarita";
  const businessNameColor = normalizeBusinessNameColor(
    landing.businessNameColor
    || profile.businessNameColor
    || profile.landingBusinessNameColor
    || "",
    "#111827"
  );
  const legacyPart2Color = businessNameColor && businessNameColor.toLowerCase() !== "#111827" ? businessNameColor : "";
  const businessNameColorPart1 = normalizeBusinessNameColor(
    landing.businessNameColorPart1
    || profile.businessNameColorPart1
    || profile.landingBusinessNameColorPart1
    || businessNameColor
    || "",
    "#111827"
  );
  const businessNameColorPart2 = normalizeBusinessNameColor(
    landing.businessNameColorPart2
    || profile.businessNameColorPart2
    || profile.landingBusinessNameColorPart2
    || legacyPart2Color
    || "",
    "#4f46e5"
  );
  const businessNameBase = businessName.replace(/\.+$/g, "").trim() || businessName;
  const businessNameParts = businessNameBase.split(/\s+/).filter(Boolean);
  const businessHeadingPart1 = businessNameParts.length > 1
    ? businessNameParts.slice(0, -1).join(" ")
    : businessNameBase;
  const businessHeadingPart2 = businessNameParts.length > 1
    ? businessNameParts[businessNameParts.length - 1]
    : "";
  const businessHeadingPart1Text = businessHeadingPart2 ? businessHeadingPart1 : `${businessHeadingPart1}.`;
  const businessHeadingPart2Text = businessHeadingPart2 ? `${businessHeadingPart2}.` : "";
  const logoUrl = getOptimizedImageUrl(
    landing.logoUrl
    || profile.avatar
    || "",
    "avatar"
  );
  const inlineLogoPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E";
  const resolvedLogoUrl = String(logoUrl || "").trim() || inlineLogoPlaceholder;
  const line1 = String(
    landing.messageLine1
    || "Lokali juaj është përgatitur tashmë në Mnyra."
  ).trim();
  const line2 = String(
    landing.messageLine2
    || "Prezenca juaj digjitale eshte gati për aktivizim."
  ).trim();
  const shouldRenderPostsSurface = step >= 2;
  const shouldRenderMenuSurface = step >= 3;
  const resolvedPosts = Array.isArray(state.profileView?.posts)
    ? state.profileView.posts
    : (Array.isArray(profile?.posts) ? profile.posts : []);
  const activeDotStep = resolveLandingDotStep(step);
  const landingSwipeHint = `
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${icon("chevron-down", "w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;
  return `
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0, 1, 2, 3].map((dotStep) => {
          const isActiveDot = activeDotStep === dotStep;
          return `
            <div data-landing-step-dot="${dotStep}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${isActiveDot ? "1.22" : "1"}); opacity: ${isActiveDot ? "1" : "0.88"}; background: ${isActiveDot ? "#4f46e5" : "rgba(100,116,139,0.58)"}; border: 1px solid ${isActiveDot ? "rgba(79,70,229,0.96)" : "rgba(255,255,255,0.95)"}; box-shadow: ${isActiveDot ? "0 6px 14px -8px rgba(79,70,229,0.95)" : "0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `;
        }).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${step === 0 ? "translate-y-0" : "-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${step === 0 ? "1" : "0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${greetings.map((greet, idx) => {
              const isActive = idx === currentGreetingIndex;
              const isPrev = idx === (currentGreetingIndex - 1 + greetings.length) % greetings.length;
              const isNext = !isActive && !isPrev;
              const greetingStateStyle = isActive
                ? "opacity: 1; transform: translateY(0) scale(1);"
                : isPrev
                  ? "opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;"
                  : isNext
                    ? "opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;"
                    : "opacity: 0;";
              return `
                <h1 data-landing-greeting-item="${idx}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${greetingStateStyle}">
                  ${escapeHtml(greet)}
                </h1>
              `;
            }).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${escapeHtml(resolvedLogoUrl)}" alt="${escapeHtml(`${businessName} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${escapeHtml(businessNameColorPart1)};">${escapeHtml(businessHeadingPart1Text)}</span>${businessHeadingPart2Text ? `<span style="color:${escapeHtml(businessNameColorPart2)};">${escapeHtml(businessHeadingPart2Text)}</span>` : ""}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${escapeHtml(line1)}<br />
            ${escapeHtml(line2)}
          </p>
        </div>
        ${landingSwipeHint}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${step < 1 ? "translate-y-full" : step === 1 ? "translate-y-0" : "-translate-y-full"}" style="background: #F8F9FA; opacity: ${step === 1 ? "1" : "0"}; pointer-events: ${step === 1 ? "auto" : "none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${renderPublicProfileSurface(profile, resolvedPosts, {
            topTabOverride: "profile",
            tutorialMode: true,
            contentTabOverride: "posts",
            landingHideContent: true,
            collapseIdentity: false,
            landingMode: true
          })}
        </div>
        ${landingSwipeHint}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${step < 2 ? "translate-y-full" : step === 2 ? "translate-y-0" : "-translate-y-full"}" style="background: #F8F9FA; opacity: ${step === 2 ? "1" : "0"}; pointer-events: ${step === 2 ? "auto" : "none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${shouldRenderPostsSurface ? renderPublicProfileSurface(profile, resolvedPosts, {
            topTabOverride: "profile",
            tutorialMode: true,
            contentTabOverride: "posts",
            landingHideContent: false,
            collapseIdentity: true,
            contentReveal: true,
            landingMode: true
          }) : ""}
        </div>
        ${landingSwipeHint}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${step < 3 ? "translate-y-full" : "translate-y-0"}" style="background: #F8F9FA; opacity: ${step === 3 ? "1" : "0"}; pointer-events: ${step === 3 ? "auto" : "none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${shouldRenderMenuSurface ? renderPublicProfileSurface(profile, resolvedPosts, {
            topTabOverride: "profile",
            tutorialMode: true,
            contentTabOverride: "menu",
            landingHideContent: false,
            collapseIdentity: true,
            contentReveal: true,
            landingMode: true
          }) : ""}
        </div>
      </div>
    </section>
  `;
}

function renderProfileTabs(
  profile = state.profileView?.profile || state.userProfile,
  { landingPreview = false, selectedTabOverride = "", compact = false } = {}
) {
  const isBusinessProfile = isBusinessProfileEntity(profile);
  const activeTab = String(selectedTabOverride || resolveProfileContentTabForRendering(profile)).trim().toLowerCase() || "posts";
  const isHotelProfile = isHotelBusinessProfile(profile);
  const isShopProfile = isShopCatalogProfile(profile);
  const catalogTabLabel = isHotelProfile
    ? "Details"
    : (isShopProfile ? "Shop" : tr("nav.menu", "Menue"));
  const tabs = isBusinessProfile
    ? [
      { id: "posts", label: tr("profile.posts", "Beitraege") },
      { id: "menu", label: catalogTabLabel, surface: isHotelProfile ? "hotel-details" : "menu" }
    ]
    : [
      { id: "posts", label: tr("profile.posts", "Beitraege") },
      { id: "media", label: tr("profile.media", "Medien") },
      { id: "checkins", label: tr("profile.checkins", "Check-ins") }
    ];
  return `
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${compact ? "mt-2" : "mt-4"} ${landingPreview ? "pointer-events-auto" : ""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${tabs.map((tab) => `
          <button data-profile-tab="${tab.id}" ${tab.surface ? `data-profile-tab-surface="${escapeHtml(tab.surface)}"` : ""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab.id ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
            ${tab.label}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderProfileViewControls(
  profile = state.profileView?.profile || state.userProfile,
  { disabled = false } = {}
) {
  const activeTab = resolveProfileContentTabForRendering(profile);
  if (activeTab === "checkins" || activeTab === "menu") return "";
  const wrapperClass = disabled ? "pointer-events-none opacity-70" : "";
  return `
    <div class="flex items-center justify-between app-content-inline mb-6 ${wrapperClass}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${escapeHtml(tr("profile.view", "Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${state.profileViewMode === "grid" ? "bg-slate-900 text-white shadow-md" : "text-slate-300 active:text-slate-500"}">
          ${icon("layout-grid", "w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${state.profileViewMode === "feed" ? "bg-slate-900 text-white shadow-md" : "text-slate-300 active:text-slate-500"}">
          ${icon("square", "w-4 h-4")}
        </button>
      </div>
    </div>
  `;
}

function normalizeBusinessProfileText(value = "") {
  return String(value || "").trim();
}

const BUSINESS_TITLE_IMAGE_CACHE_STORAGE_KEY = "mnyra_business_title_image_cache_v1";
const BUSINESS_TITLE_IMAGE_CACHE_MAX_ENTRIES = 80;

function getBusinessTitleImageCacheItems() {
  if (!state) return {};
  const current = state.businessTitleImageCache && typeof state.businessTitleImageCache === "object"
    ? state.businessTitleImageCache
    : null;
  if (current?.loaded === true && current.items && typeof current.items === "object") {
    return current.items;
  }
  let items = {};
  try {
    const storage = typeof window !== "undefined" ? window.localStorage : null;
    const raw = storage?.getItem?.(BUSINESS_TITLE_IMAGE_CACHE_STORAGE_KEY) || "";
    const parsed = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object") {
      Object.entries(parsed).forEach(([key, value]) => {
        const safeKey = normalizeBusinessProfileText(key);
        const safeValue = normalizeBusinessProfileText(value);
        if (safeKey && safeValue && !isPlaceholderUrl(safeValue)) items[safeKey] = safeValue;
      });
    }
  } catch {}
  state.businessTitleImageCache = { loaded: true, items };
  return items;
}

function persistBusinessTitleImageCache(items = {}) {
  try {
    const storage = typeof window !== "undefined" ? window.localStorage : null;
    if (!storage) return;
    storage.setItem(BUSINESS_TITLE_IMAGE_CACHE_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function resolveBusinessTitleImageCacheKeys(profile = {}, fallback = "business") {
  const keys = [
    profile?.restaurantId,
    profile?.canonicalRestaurantId,
    profile?.uid,
    profile?.handle,
    profile?.publicSlug,
    profile?.landingSlug,
    profile?.name,
    fallback
  ].map((item) => normalizeBusinessProfileText(item)).filter(Boolean);
  return [...new Set(keys)];
}

function rememberBusinessTitleImageUrl(keys = [], url = "") {
  const safeUrl = normalizeBusinessProfileText(url);
  if (!safeUrl || isPlaceholderUrl(safeUrl)) return;
  const items = getBusinessTitleImageCacheItems();
  let changed = false;
  keys.forEach((key) => {
    const safeKey = normalizeBusinessProfileText(key);
    if (!safeKey || items[safeKey] === safeUrl) return;
    items[safeKey] = safeUrl;
    changed = true;
  });
  const entries = Object.entries(items);
  if (entries.length > BUSINESS_TITLE_IMAGE_CACHE_MAX_ENTRIES) {
    const trimmed = entries.slice(entries.length - BUSINESS_TITLE_IMAGE_CACHE_MAX_ENTRIES);
    Object.keys(items).forEach((key) => delete items[key]);
    trimmed.forEach(([key, value]) => {
      items[key] = value;
    });
    changed = true;
  }
  if (changed) persistBusinessTitleImageCache(items);
}

function readBusinessTitleImageUrlFromCache(keys = []) {
  const items = getBusinessTitleImageCacheItems();
  for (const key of keys) {
    const safeKey = normalizeBusinessProfileText(key);
    const safeUrl = safeKey ? normalizeBusinessProfileText(items[safeKey]) : "";
    if (safeUrl && !isPlaceholderUrl(safeUrl)) return safeUrl;
  }
  return "";
}

function resolveBusinessProfileKey(profile = {}, fallback = "business") {
  return String(
    profile?.restaurantId
    || profile?.canonicalRestaurantId
    || profile?.uid
    || profile?.handle
    || profile?.name
    || fallback
  ).trim() || fallback;
}

function resolveBusinessProfileMapTargetId(profile = {}) {
  return String(
    profile?.canonicalRestaurantId
    || profile?.restaurantId
    || profile?.id
    || profile?.landingRestaurantId
    || profile?.documentId
    || ""
  ).trim();
}

function resolveBusinessTitleImageRaw(profile = {}) {
  const images = Array.isArray(profile?.coverImages)
    ? profile.coverImages
    : (Array.isArray(profile?.titleImages) ? profile.titleImages : []);
  const firstImage = images.map((item) => String(item || "").trim()).find(Boolean) || "";
  return String(
    profile?.titleImageUrl
    || profile?.coverImageUrl
    || profile?.coverUrl
    || profile?.heroUrl
    || firstImage
    || ""
  ).trim();
}

function resolveBusinessTitleImageUrl(profile = {}, options = {}) {
  const raw = resolveBusinessTitleImageRaw(profile);
  const cacheKeys = Array.isArray(options.cacheKeys) ? options.cacheKeys : [];
  const stableKey = normalizeBusinessProfileText(options.stableKey || cacheKeys[0] || "");
  if (!raw) {
    if (options.allowCacheFallback === true) {
      const cached = readBusinessTitleImageUrlFromCache(cacheKeys);
      if (cached) return cached;
      const resolvedCached = stableKey ? getOptimizedImageUrl("", "medium", { stableKey }) : "";
      return resolvedCached && !isPlaceholderUrl(resolvedCached) ? resolvedCached : "";
    }
    return "";
  }
  const resolved = getOptimizedImageUrl(raw, "medium", stableKey ? { stableKey } : undefined);
  if (resolved && !isPlaceholderUrl(resolved)) {
    rememberBusinessTitleImageUrl(cacheKeys, resolved);
    return resolved;
  }
  return "";
}

function resolveBusinessSocialUrl(value = "", network = "") {
  const raw = normalizeBusinessProfileText(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const clean = raw
    .replace(/^@+/, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/^www\.instagram\.com\//i, "")
    .replace(/^tiktok\.com\/@?/i, "")
    .replace(/^www\.tiktok\.com\/@?/i, "")
    .replace(/^\/+/, "")
    .trim();
  if (!clean) return "";
  if (network === "tiktok") return `https://www.tiktok.com/@${encodeURIComponent(clean)}`;
  if (network === "instagram") return `https://www.instagram.com/${encodeURIComponent(clean)}`;
  return "";
}

function resolveBusinessPhoneHref(phone = "") {
  const raw = normalizeBusinessProfileText(phone);
  if (!raw) return "";
  const dial = raw.replace(/[^\d+]/g, "");
  return dial ? `tel:${dial}` : "";
}

function resolveBusinessMapHref(profile = {}) {
  const lat = Number(profile?.gpsLat ?? profile?.lat);
  const lng = Number(profile?.gpsLng ?? profile?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  }
  const label = [
    profile?.address,
    profile?.locationPlace || profile?.place,
    profile?.location,
    profile?.city,
    profile?.country
  ].map((item) => normalizeBusinessProfileText(item)).filter(Boolean).join(", ");
  return label ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}` : "";
}

function renderBusinessQuickLink({ href = "", label = "", iconName = "", body = "", buttonAttrs = "" } = {}) {
  const safeHref = normalizeBusinessProfileText(href);
  const safeButtonAttrs = String(buttonAttrs || "").trim();
  if (!safeHref && !safeButtonAttrs) return "";
  const content = body || icon(iconName, "w-4 h-4");
  const className = "w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform";
  if (safeButtonAttrs) {
    return `
    <button type="button" ${safeButtonAttrs} title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}" class="${className}">
      ${content}
    </button>
  `;
  }
  return `
    <a href="${escapeHtml(safeHref)}" target="_blank" rel="noreferrer" title="${escapeHtml(label)}" class="${className}">
      ${content}
    </a>
  `;
}

function renderBusinessInfoRow({ href = "", buttonAttrs = "", iconName = "", eyebrow = "", value = "" } = {}) {
  const safeValue = normalizeBusinessProfileText(value);
  if (!safeValue) return "";
  const content = `
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${icon(iconName, "w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${escapeHtml(eyebrow)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(safeValue)}</span>
    </div>
  `;
  if (href) {
    return `<a href="${escapeHtml(href)}" target="${href.startsWith("tel:") ? "_self" : "_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${content}</a>`;
  }
  return `<button type="button" ${buttonAttrs} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${content}</button>`;
}

function renderBusinessProfileCardHeightSizer({
  profileName = "",
  safeBio = "",
  metaLine = "",
  identityPending = false,
  followersLabel = ""
} = {}) {
  return `
    <div aria-hidden="true" style="grid-area:1/1;visibility:hidden;pointer-events:none;min-width:0;max-width:100%;overflow:hidden;">
      <div class="h-40 w-full"></div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div class="relative">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px]"></div>
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(String(followersLabel))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${escapeHtml(tr("profile.fans", "Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <div class="flex flex-col items-center min-w-0">
              <span class="h-7 flex items-center justify-center text-slate-900"></span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${escapeHtml(tr("profile.info", "Info"))}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${escapeHtml(profileName)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${safeBio}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${escapeHtml(metaLine)}</p>
          ${identityPending ? `<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${escapeHtml(tr("profile.headLoading", "Profilkopf wird geladen..."))}</p>` : ""}
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-[56px] rounded-[1.2rem]"></div>
          <div class="w-[56px] h-[56px] rounded-[1.2rem]"></div>
        </div>
      </div>
    </div>
  `;
}

function renderBusinessProfileIdentityCard(profile = {}, options = {}) {
  const mode = options.mode === "self" ? "self" : "public";
  const disabledBlockClass = options.disabledBlockClass || "";
  const avatarUrl = options.avatarUrl || getOptimizedImageUrl(profile.avatar || "", "avatar");
  const avatarFit = options.avatarFit || logoFitClass(!!profile.restaurantId);
  const cardKey = resolveBusinessProfileKey(profile, mode);
  const cardInfoOpen = String(state?.profileCardInfoOpen || "") === cardKey;
  const measuredInfoHeight = Number(state?.profileCardInfoHeights?.[cardKey] || 0);
  const lockedInfoHeightStyle = cardInfoOpen && Number.isFinite(measuredInfoHeight) && measuredInfoHeight > 0
    ? `height:${Math.ceil(measuredInfoHeight)}px;`
    : "";
  const avatarImgKeyAttr = options.avatarImgKeyAttr || (mode === "self"
    ? `data-img-key="avatar:self"`
    : `data-img-key="avatar:public:${escapeHtml(cardKey)}"`);
  const renderAvatarImage = options.renderAvatarImage !== false
    && !!String(avatarUrl || "").trim()
    && !!String(profile?.avatar || "").trim();
  const identityPending = !!options.identityPending;
  const followersLabel = options.followersLabel ?? formatCount(profile.followers);
  const profileName = normalizeBusinessProfileText(profile?.name) || "User";
  const typeLabel = normalizeBusinessProfileText(options.typeLabel || profile?.customerType || profile?.type || "Business");
  const locationLabel = normalizeBusinessProfileText(profile?.location || "-");
  const metaLine = mode === "public" ? `${locationLabel} / ${typeLabel}` : locationLabel;
  const safeBio = options.bioHtml || (escapeHtml(profile?.bio || "").replace(/\n/g, "<br>") || escapeHtml(tr("profile.noBio", "Noch keine Bio.")));
  const titleImageKey = `business-cover:${cardKey}`;
  const titleImageCacheKeys = resolveBusinessTitleImageCacheKeys(profile, cardKey);
  const coverUrl = resolveBusinessTitleImageUrl(profile, {
    cacheKeys: titleImageCacheKeys,
    stableKey: titleImageKey,
    allowCacheFallback: options.allowTitleImageCacheFallback === true
  });
  const mapHref = resolveBusinessMapHref(profile);
  const mapTargetId = resolveBusinessProfileMapTargetId(profile);
  const mapQuickLink = mapTargetId
    ? renderBusinessQuickLink({
        buttonAttrs: `data-marketplace-open-map="${escapeHtml(mapTargetId)}"`,
        label: tr("profile.openMap", "Karte oeffnen"),
        iconName: "map"
      })
    : renderBusinessQuickLink({ href: mapHref, label: tr("profile.openMap", "Karte oeffnen"), iconName: "map" });
  const instagramHref = resolveBusinessSocialUrl(profile?.instagramUrl || profile?.instagram || profile?.insta || "", "instagram");
  const tiktokHref = resolveBusinessSocialUrl(profile?.tiktokUrl || profile?.tiktok || profile?.tikTok || "", "tiktok");
  const phone = normalizeBusinessProfileText(profile?.phone || profile?.telephone || profile?.contactPhone || "");
  const phoneHref = resolveBusinessPhoneHref(phone);
  const addressLabel = normalizeBusinessProfileText(
    profile?.address
    || profile?.locationLabel
    || [profile?.place || profile?.locationPlace, profile?.location || profile?.city].map((item) => normalizeBusinessProfileText(item)).filter(Boolean).join(", ")
  );
  const socialRows = [
    renderBusinessInfoRow({ href: instagramHref, iconName: "instagram", eyebrow: "Instagram", value: profile?.instagram || profile?.instagramUrl || profile?.insta || "" }),
    renderBusinessInfoRow({ href: tiktokHref, iconName: "music-2", eyebrow: "TikTok", value: profile?.tiktok || profile?.tiktokUrl || profile?.tikTok || "" })
  ].filter(Boolean).join("");
  const actionHtml = mode === "self"
    ? `
      <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
        <span class="relative z-10 flex items-center gap-2">${icon("plus", "w-4 h-4")} Status</span>
        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
      <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${icon("settings", "w-5 h-5")}
      </button>
    `
    : `
      <button data-landing-tutorial-target="follow" data-public-profile-follow="${escapeHtml(profile.handle || "")}" data-target-type="${escapeHtml(profile.restaurantId ? "restaurant" : (profile.uid ? "user" : ""))}" data-target-id="${escapeHtml(profile.restaurantId || profile.uid || "")}" data-target-name="${escapeHtml(profile.name || "")}" data-target-avatar="${escapeHtml(profile.avatar || "")}" ${options.hasPendingFollowRequest ? "disabled" : ""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${options.followTone || "bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"} ${options.hasPendingFollowRequest ? "opacity-90 cursor-default" : ""}">
        <span class="relative z-10 flex items-center gap-2">
          ${options.isFollowing ? icon("check", "w-4 h-4") : ""}
          ${escapeHtml(options.followLabel || tr("profile.follow", "Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${escapeHtml(profile.uid || "")}" data-chat-handle="${escapeHtml(profile.handle || "")}" data-chat-name="${escapeHtml(profile.name || "")}" data-chat-avatar="${escapeHtml(profile.avatar || "")}" ${options.isLocked ? "disabled" : ""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${options.isLocked ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${icon("message-circle", "w-5 h-5")}
      </button>
    `;
  if (cardInfoOpen) {
    const infoRows = [
      renderBusinessInfoRow({ href: phoneHref, iconName: "phone", eyebrow: tr("profile.call", "Anrufen"), value: phone }),
      renderBusinessInfoRow({ href: mapHref, iconName: "map-pin", eyebrow: tr("profile.address", "Adresse"), value: addressLabel || locationLabel }),
      socialRows
    ].filter(Boolean).join("");
    return `
      <div data-landing-tutorial-target="identity" data-business-profile-card="${escapeHtml(cardKey)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${disabledBlockClass}" style="${lockedInfoHeightStyle}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${renderBusinessProfileCardHeightSizer({ profileName, safeBio, metaLine, identityPending, followersLabel })}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${escapeHtml(cardKey)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${icon("x", "w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${escapeHtml(tr("profile.contactInfo", "Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${escapeHtml(locationLabel)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${infoRows || `<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${escapeHtml(tr("profile.noContactInfo", "Noch keine Kontaktdaten"))}</div>`}
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 min-w-0 max-w-full overflow-hidden">
            <button type="button" data-profile-card-info-close="${escapeHtml(cardKey)}" class="w-full h-[56px] rounded-[1.2rem] border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center" style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;">
              ${escapeHtml(tr("profile.backToProfile", "Zurueck zum Profil"))}
            </button>
          </div>
        </div>
      </div>
    `;
  }
  return `
    <div data-landing-tutorial-target="identity" data-business-profile-card="${escapeHtml(cardKey)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${disabledBlockClass}" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${coverUrl
          ? `<img src="${escapeHtml(coverUrl)}" data-img-key="${escapeHtml(titleImageKey)}" alt="${escapeHtml(profileName)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`
          : `<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${icon("store", "w-7 h-7")}</div>`
        }
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${mapQuickLink}
          ${renderBusinessQuickLink({ href: tiktokHref, label: "TikTok", iconName: "music-2" })}
          ${renderBusinessQuickLink({ href: instagramHref, label: "Instagram", iconName: "instagram" })}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${mode === "self" ? `id="profileAvatarTrigger"` : ""} class="relative ${mode === "self" ? "cursor-pointer group" : ""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${renderAvatarImage
                ? `<img src="${escapeHtml(avatarUrl)}" decoding="async" width="100" height="100" ${avatarImgKeyAttr} class="w-full h-full rounded-[1.8rem] ${avatarFit} border-2 border-white bg-white" />`
                : `<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${identityPending ? "animate-pulse" : ""}">${icon("store", "w-8 h-8 text-slate-300")}</div>`
              }
            </div>
            ${profile.isPremium ? `
              <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                ${icon("badge-check", "w-4 h-4 fill-blue-500 text-white")}
              </div>
            ` : ""}
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div data-landing-tutorial-target="fans" class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl ${identityPending ? "text-slate-300" : "text-slate-900"} leading-none mb-1">${escapeHtml(String(followersLabel))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${escapeHtml(tr("profile.fans", "Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <button type="button" data-profile-card-info-open="${escapeHtml(cardKey)}" class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${icon("info", "w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${escapeHtml(tr("profile.info", "Info"))}</span>
            </button>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${escapeHtml(profileName)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${safeBio}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${escapeHtml(metaLine)}</p>
          ${identityPending ? `<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${escapeHtml(tr("profile.headLoading", "Profilkopf wird geladen..."))}</p>` : ""}
        </div>
        <div class="flex items-center gap-4">
          ${actionHtml}
        </div>
      </div>
    </div>
  `;
}

function renderPublicProfileSurface(
  profile = {},
  posts = [],
  {
    topTabOverride = "",
    tutorialMode = false,
    contentTabOverride = "",
    landingHideContent = false,
    collapseIdentity = false,
    contentReveal = false,
    landingMode = false
  } = {}
) {
  const isFollowing = isFollowingProfile(profile);
  const isLocked = !!profile.privateAccount && profile.uid && String(profile.uid) !== String(state.user?.uid || "") && !isFollowing;
  const hasPendingFollowRequest = !!profile.pendingFollowRequest && !isFollowing;
  const typeLabel = profile.restaurantId ? "Business" : tr("nav.user", "User");
  const handle = String(profile.handle || normalizeHandle(profile.name || "user")).replace(/^@/, "");
  const safeBio = escapeHtml(profile.bio || "").replace(/\n/g, "<br>");
  const bioHtml = safeBio || escapeHtml(tr("profile.noBio", "Noch keine Bio."));
  const isBusinessProfile = isBusinessProfileEntity(profile);
  const topTab = String(topTabOverride || resolveProfilePrimaryTopTab(profile)).trim().toLowerCase() || "profile";
  const activeContentTab = String(contentTabOverride || resolveProfileContentTabForRendering(profile)).trim().toLowerCase() || "posts";
  const isMenuTab = activeContentTab === "menu";
  const isCheckinTab = activeContentTab === "checkins";
  const filteredPosts = posts;
  const baseProfileView = state?.profileView && typeof state.profileView === "object"
    ? state.profileView
    : {};
  const surfaceProfileView = {
    ...baseProfileView,
    profile,
    posts: Array.isArray(filteredPosts) ? filteredPosts : []
  };
  const surfaceSnapshot = resolveVisibleProfileSurface(state, {
    profileView: surfaceProfileView,
    profileTopTab: topTab,
    profileContentTab: activeContentTab
  });
  const headerStatus = String(surfaceSnapshot?.header?.status || "").trim().toLowerCase() || "loading";
  const postsStatus = String(surfaceSnapshot?.posts?.status || "").trim().toLowerCase() || "loading";
  const avatarRaw = String(profile?.avatar || "").trim();
  const avatarUrl = avatarRaw ? getOptimizedImageUrl(avatarRaw, "avatar") : "";
  const avatarFit = logoFitClass(!!profile.restaurantId);
  const avatarKey = profile.uid || profile.restaurantId || handle || "public";
  const avatarImgKeyAttr = landingMode ? "" : `data-img-key="avatar:public:${escapeHtml(avatarKey)}"`;
  const hasAvatarTruth = !!avatarRaw;
  const hasCountSeed = (value) => {
    if (value === null || value === undefined) return false;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0;
  };
  const hasIdentityDataSeed = hasAvatarTruth
    || hasCountSeed(profile?.followers)
    || hasCountSeed(profile?.following);
  const showIdentityPendingState = isSettlingProfileSurfaceStatus(headerStatus) && !hasIdentityDataSeed;
  const renderAvatarImage = !!String(avatarUrl || "").trim() && hasAvatarTruth;
  const followersLabel = showIdentityPendingState ? "..." : formatCount(profile.followers);
  const followingLabel = showIdentityPendingState ? "..." : formatCount(profile.following);
  const topPaddingClass = isBusinessProfile ? "pt-2" : "pt-10";
  const followLabel = isFollowing
    ? tr("profile.following", "Following")
    : (hasPendingFollowRequest
      ? tr("profile.requested", "Requested")
      : (isLocked ? tr("profile.request", "Request") : tr("profile.follow", "Follow")));
  const followTone = isFollowing
    ? "bg-slate-100 text-slate-600 shadow-none border border-slate-200"
    : (hasPendingFollowRequest
      ? "bg-amber-50 text-amber-700 shadow-none border border-amber-200"
      : "bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent");
  const rootClass = tutorialMode ? "select-none" : "app-main-content-safe";
  const disabledBlockClass = tutorialMode ? "pointer-events-none" : "";
  const showIdentitySection = !collapseIdentity;
  const shouldRenderContent = !landingHideContent;
  const contentAnimationClass = contentReveal
    ? (landingMode ? "transition-opacity duration-200" : "animate-in fade-in duration-300")
    : "";
  const hasRenderablePosts = activeContentTab === "posts" && filteredPosts.length > 0;
  const postsLoaded = activeContentTab !== "posts"
    || hasRenderablePosts
    || postsStatus === "empty"
    || postsStatus === "error";
  const showPostsError = activeContentTab === "posts"
    && !hasRenderablePosts
    && postsStatus === "error";
  if (
    !tutorialMode
    && (activeContentTab === "posts" || activeContentTab === "media")
    && profile?.restaurantId
    && isSettlingProfileSurfaceStatus(postsStatus)
  ) {
    ensurePostsDataForProfile(profile);
  }
  return `
    <div class="${rootClass}" ${tutorialMode ? "data-landing-tutorial-surface=\"true\"" : ""}>
      ${topTab === "profile" || topTab === "menu" ? `
      ${showIdentitySection ? `
        <div class="app-content-inline pb-2 ${topPaddingClass}">
          ${isBusinessProfile ? renderBusinessProfileIdentityCard(profile, {
            mode: "public",
            disabledBlockClass,
            avatarUrl,
            avatarFit,
            avatarKey,
            avatarImgKeyAttr,
            renderAvatarImage,
            identityPending: showIdentityPendingState,
            followersLabel,
            followLabel,
            followTone,
            isFollowing,
            hasPendingFollowRequest,
            isLocked,
            bioHtml,
            typeLabel,
            allowTitleImageCacheFallback: isSettlingProfileSurfaceStatus(headerStatus)
              || isSettlingProfileSurfaceStatus(postsStatus)
          }) : `
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${disabledBlockClass}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${renderAvatarImage
                      ? `<img src="${escapeHtml(avatarUrl)}" decoding="async" width="100" height="100" ${avatarImgKeyAttr} class="w-full h-full rounded-[1.8rem] ${avatarFit} border-2 border-white" />`
                      : `<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${showIdentityPendingState ? "animate-pulse" : ""}">${icon(profile.restaurantId ? "store" : "user", "w-8 h-8 text-slate-300")}</div>`
                    }
                  </div>
                  ${profile.isPremium ? `
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${icon("badge-check", "w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  ` : ""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${showIdentityPendingState ? "text-slate-300" : "text-slate-900"} leading-none mb-1">${escapeHtml(followersLabel)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${escapeHtml(tr("profile.fans", "Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${showIdentityPendingState ? "text-slate-300" : "text-slate-900"} leading-none mb-1">${escapeHtml(followingLabel)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${escapeHtml(tr("profile.followingCount", "Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${escapeHtml(profile.name || "User")}</h1>
                ${isBusinessProfile ? "" : `<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${escapeHtml(handle)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${bioHtml}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${escapeHtml(profile.location || "-")} / ${typeLabel}</p>
                ${showIdentityPendingState ? `<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${escapeHtml(tr("profile.headLoading", "Profilkopf wird geladen..."))}</p>` : ""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${escapeHtml(profile.handle)}" data-target-type="${escapeHtml(profile.restaurantId ? "restaurant" : (profile.uid ? "user" : ""))}" data-target-id="${escapeHtml(profile.restaurantId || profile.uid || "")}" data-target-name="${escapeHtml(profile.name || "")}" data-target-avatar="${escapeHtml(profile.avatar || "")}" ${hasPendingFollowRequest ? "disabled" : ""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${followTone} ${hasPendingFollowRequest ? "opacity-90 cursor-default" : ""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${isFollowing ? icon("check", "w-4 h-4") : ""}
                    ${followLabel}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${escapeHtml(profile.uid || "")}" data-chat-handle="${escapeHtml(profile.handle || "")}" data-chat-name="${escapeHtml(profile.name || "")}" data-chat-avatar="${escapeHtml(profile.avatar || "")}" ${isLocked ? "disabled" : ""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${isLocked ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${icon("message-circle", "w-5 h-5")}
                </button>
              </div>
            </div>
          </div>
          `}
        </div>
      ` : ""}

      ${!isLocked ? `
        ${renderProfileTabs(profile, {
          landingPreview: tutorialMode,
          selectedTabOverride: activeContentTab,
          compact: collapseIdentity
        })}
        ${shouldRenderContent ? renderProfileViewControls(profile, { disabled: tutorialMode }) : ""}

        ${shouldRenderContent ? (isMenuTab ? `
          <div class="${disabledBlockClass} ${contentAnimationClass}">
            ${isHotelBusinessProfile(profile)
              ? renderHotelDetailsView(profile)
              : renderProfileMenuView(profile, {
                  mode: landingMode ? "landing" : "profile",
                  allowAutoEnsure: !landingMode
                })
            }
          </div>
        ` : isCheckinTab ? `
          <div class="${disabledBlockClass} ${contentAnimationClass}">
            ${renderProfileCheckins()}
          </div>
        ` : `
          ${postsLoaded ? `
            ${showPostsError ? `
              <div class="app-content-inline ${disabledBlockClass}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${escapeHtml(tr("profile.contentLoadError", "Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            ` : `
              <div class="${state.profileViewMode === "grid" ? "grid grid-cols-2 gap-4 app-content-inline grid-flow-dense" : "flex flex-col gap-8 app-content-inline"} ${disabledBlockClass} ${contentAnimationClass}">
                ${renderProfilePostsFancy(filteredPosts, state.profileViewMode, false, { includeImageKeys: !landingMode })}
              </div>
            `}
          ` : `
            <div class="app-content-inline ${disabledBlockClass}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${contentAnimationClass}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtml(tr("profile.postsLoading", "Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `) : ""}
      ` : `
        <div class="app-content-inline pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${icon("lock", "w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${escapeHtml(tr("profile.private", "Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${escapeHtml(tr("profile.followAcceptedFirst", "Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `}
      ` : `
        ${topTab === "cart"
          ? renderProfileShopCartView(profile)
          : (topTab === "favorites" ? renderProfileShopFavoritesView(profile) : "")}
      `}
    </div>
  `;
}

function renderPublicProfileView() {
  const view = state.profileView;
  if (!view || !view.profile) return "";
  const profile = view.profile;
  const posts = view.posts || profile.posts || [];
  const topTab = resolveProfilePrimaryTopTab(profile);
  if (topTab === "landing") {
    return renderBusinessLandingScreenOne(profile);
  }
  return renderPublicProfileSurface(profile, posts, { topTabOverride: topTab, tutorialMode: false });
}

function getFilteredMenuItems(items, { filter = "all", query = "" } = {}) {
  const list = Array.isArray(items) ? items : [];
  const q = normalizeSearchKey(query || "");
  return list.filter((item) => {
    const typeOk = filter === "all" || normalizeMenuType(item.type) === filter;
    if (!typeOk) return false;
    if (!q) return true;
    const hay = `${item.name || ""} ${item.category || ""} ${item.description || ""}`.toLowerCase();
    return hay.includes(q);
  });
}

function normalizeMenuOrderIndex(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return Math.max(0, Number(fallback) || 0);
  return Math.max(0, Math.floor(numeric));
}

function sortMenuItemsByOrder(items = []) {
  const list = Array.isArray(items) ? items.slice() : [];
  return list
    .map((item, idx) => ({
      item,
      idx,
      order: normalizeMenuOrderIndex(item?.orderIndex, idx)
    }))
    .sort((a, b) => (a.order - b.order) || (a.idx - b.idx))
    .map((wrapped, idx) => ({
      ...wrapped.item,
      orderIndex: normalizeMenuOrderIndex(wrapped.item?.orderIndex, idx)
    }));
}

function isMenuItemHidden(item = {}) {
  const menuVisibilityRaw = String(item?.menuVisibility || "").trim().toLowerCase();
  return item?.menuHidden === true || menuVisibilityRaw === "hidden";
}

function resolveMenuDisplaySection(item = {}) {
  const raw = String(item?.menuSection || item?.displaySection || item?.menuPlacement || "").trim().toLowerCase();
  if (raw === "drink") return "drink";
  if (raw === "food") return "food";
  return normalizeMenuType(item?.type || "food") === "drink" ? "drink" : "food";
}

function resolveMenuCategoryLabel(item = {}) {
  return String(item?.category || tr("menu.other", "Sonstiges")).trim() || tr("menu.other", "Sonstiges");
}

function normalizeMenuCategoryToken(value = "") {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const folded = typeof raw.normalize === "function"
    ? raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    : raw;
  return folded.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const CRITICAL_MENU_IMAGE_COUNT = 4;
const MENU_IMAGE_WIDTH_BY_SIZE = {
  thumb: 160,
  small: 480,
  medium: 768,
  large: 1280
};

function isCriticalMenuImage({ mode = "profile", priorityIndex = -1, slideIndex = 0 } = {}) {
  return (mode === "profile" || mode === "landing")
    && Number.isFinite(priorityIndex)
    && priorityIndex >= 0
    && priorityIndex < CRITICAL_MENU_IMAGE_COUNT
    && slideIndex === 0;
}

function buildMenuImageAttrs({ mode = "profile", priorityIndex = -1, slideIndex = 0 } = {}) {
  const isCritical = isCriticalMenuImage({ mode, priorityIndex, slideIndex });
  const revealAttr = mode === "profile" ? ` data-image-reveal="menu"` : "";
  return isCritical
    ? `loading="eager" fetchpriority="high"${revealAttr}`
    : `loading="lazy" fetchpriority="low"${revealAttr}`;
}

function resolveResponsiveMenuImageSizes({ variant = "grid" } = {}) {
  if (variant === "thumb") return "(max-width: 640px) 64px, 64px";
  if (variant === "hero") return "(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px";
  return "(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px";
}

function buildResponsiveMenuImageSources(
  rawImage,
  {
    mode = "profile",
    priorityIndex = -1,
    slideIndex = 0,
    stableKey = "",
    preferredSize = "small",
    candidateSizes = ["small", "medium", "large"],
    variant = "grid"
  } = {}
) {
  const rawImg = String(rawImage || "").trim();
  const resolveOptions = mode === "profile" && stableKey
    ? { stableKey }
    : null;
  const isCritical = isCriticalMenuImage({ mode, priorityIndex, slideIndex });
  const shouldStrictLazy = mode === "profile" && !isCritical && variant !== "thumb";
  const resolvedImg = getOptimizedImageUrl(rawImg, preferredSize, resolveOptions);
  const resolvedSafeImg = isPlaceholderUrl(resolvedImg) ? PLACEHOLDER_IMAGE : resolvedImg;
  const firebaseFallback = getFirebaseStorageUrl(rawImg);
  const resolvedFallbackImg = isDirectImageUrl(rawImg) && rawImg !== resolvedSafeImg ? rawImg : firebaseFallback;
  const srcsetParts = [];
  const seen = new Set();
  candidateSizes.forEach((sizeKey) => {
    const width = MENU_IMAGE_WIDTH_BY_SIZE[sizeKey] || 0;
    if (!width) return;
    const url = getOptimizedImageUrl(rawImg, sizeKey, resolveOptions);
    if (!url || isPlaceholderUrl(url)) return;
    const dedupeKey = `${url}|${width}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    srcsetParts.push(`${url} ${width}w`);
  });
  const srcsetValue = srcsetParts.length > 1 ? srcsetParts.join(", ") : "";
  const sizesValue = srcsetValue
    ? resolveResponsiveMenuImageSizes({ variant })
    : "";
  const eagerSrcsetValue = shouldStrictLazy ? "" : srcsetValue;
  const eagerSizesValue = shouldStrictLazy ? "" : sizesValue;
  const srcsetAttr = eagerSrcsetValue ? ` srcset="${escapeHtml(eagerSrcsetValue)}"` : "";
  const sizesAttr = eagerSizesValue ? ` sizes="${escapeHtml(eagerSizesValue)}"` : "";
  const loadingAttrs = buildMenuImageAttrs({ mode, priorityIndex, slideIndex });
  const imageAttrs = `${loadingAttrs}${srcsetAttr}${sizesAttr}`;
  const lazyAttrs = shouldStrictLazy
    ? [
      `data-menu-lazy-src="${escapeHtml(resolvedSafeImg)}"`,
      `data-menu-lazy-fallback="${escapeHtml(resolvedFallbackImg || PLACEHOLDER_IMAGE)}"`,
      srcsetValue ? `data-menu-lazy-srcset="${escapeHtml(srcsetValue)}"` : "",
      sizesValue ? `data-menu-lazy-sizes="${escapeHtml(sizesValue)}"` : ""
    ].filter(Boolean).join(" ")
    : "";
  return {
    safeImg: shouldStrictLazy ? PLACEHOLDER_IMAGE : resolvedSafeImg,
    fallbackImg: shouldStrictLazy ? PLACEHOLDER_IMAGE : resolvedFallbackImg,
    imageAttrs,
    lazyAttrs: lazyAttrs ? ` ${lazyAttrs}` : "",
    srcsetValue,
    sizesValue,
    loadingAttrs
  };
}

function renderMenuItemsWithCategoryAnchors(items = [], renderItem, seenCategories = null) {
  const categoryTracker = seenCategories instanceof Set ? seenCategories : new Set();
  return items.map((item, index) => {
    const categoryLabel = resolveMenuCategoryLabel(item);
    const categoryToken = normalizeMenuCategoryToken(categoryLabel);
    const shouldAnchorCategory = !!categoryToken && !categoryTracker.has(categoryToken);
    if (shouldAnchorCategory) categoryTracker.add(categoryToken);
    const anchorAttrs = shouldAnchorCategory
      ? ` data-menu-category-anchor="${escapeHtml(categoryToken)}"`
      : "";
    return `<div${anchorAttrs} class="h-full">${renderItem(item, index)}</div>`;
  }).join("");
}

function resolveSpecialCardSize(item = {}) {
  return String(item?.specialSize || item?.specialCardSize || "").trim().toLowerCase() === "food"
    ? "food"
    : "default";
}

function normalizeSpecialLinkUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
}

function resolveSpecialCardAction(item = {}) {
  const typeRaw = String(item?.specialActionType || item?.actionType || "").trim().toLowerCase();
  const url = normalizeSpecialLinkUrl(item?.specialActionUrl || item?.linkUrl || item?.actionUrl || "");
  const productId = String(item?.specialActionProductId || item?.targetProductId || "").trim();
  if (typeRaw === "link" && url) return { type: "link", url, productId: "" };
  if (typeRaw === "product" && productId) return { type: "product", url: "", productId };
  return { type: "self", url: "", productId: "" };
}

function renderMenuFilterRow() {
  const isShop = isShopCatalogProfile(state.userProfile);
  const rawFilter = String(state.menu.filter || "all").trim().toLowerCase() || "all";
  const filter = isShop && rawFilter === "drink" ? "all" : rawFilter;
  const labels = isShop
    ? [
      { id: "all", label: tr("menu.all", "Alle") },
      { id: "food", label: tr("menu.products", "Produkte") }
    ]
    : [
      { id: "all", label: tr("menu.all", "Alle") },
      { id: "food", label: tr("menu.food", "Speisen") },
      { id: "drink", label: tr("menu.drinks", "Getraenke") }
    ];
  return `
    <div class="flex gap-2 mb-5">
      ${labels.map((item) => `
        <button data-menu-filter="${item.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${filter === item.id ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-400 border border-slate-100"}">
          ${item.label}
        </button>
      `).join("")}
    </div>
  `;
}

function renderMenuLayoutSection() {
  const activeId = getMenuLayoutTheme().id;
  return `
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${MENU_LAYOUT_COLORS.map((theme) => {
          const isActive = theme.id === activeId;
          const checkClass = theme.id === "white" ? "text-slate-700" : "text-white";
          return `
            <button type="button" data-menu-layout-color="${theme.id}" class="w-12 h-12 rounded-2xl ${theme.swatch} ${isActive ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-white" : "border border-white/60"} shadow flex items-center justify-center">
              ${isActive ? icon("check", `w-4 h-4 ${checkClass}`) : ""}
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderMenuItemCard(item, { mode = "profile", priorityIndex = -1 } = {}) {
  const rawImg = resolveMenuItemHero(item);
  const menuDetailStableKey = mode === "profile"
    ? getMenuDetailImageStableKey(item, { index: 0 })
    : "";
  const { safeImg, fallbackImg, imageAttrs, lazyAttrs } = buildResponsiveMenuImageSources(rawImg, {
    mode,
    priorityIndex,
    stableKey: menuDetailStableKey,
    preferredSize: "thumb",
    candidateSizes: ["thumb", "small"],
    variant: "thumb"
  });
  const priceLabel = formatMenuItemPrice(item);
  const catalogProfile = state.activeTab === "menu" ? state.userProfile : (state.profileView?.profile || state.userProfile);
  const isShopMode = isShopCatalogProfile(catalogProfile);
  const typeLabel = menuItemTypeLabel(item, isShopMode);
  const category = isShopMode ? normalizeShopProductCategoryLabel(item.category) : (item.category || "");
  const desc = item.description || "";
  if (mode === "admin") {
    return `
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}"${lazyAttrs} class="w-full h-full object-cover" style="object-position:${getMenuItemObjectPosition(item)};" ${imageAttrs} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.name || tr("menu.product", "Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${escapeHtml(priceLabel)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${category ? `<span>${escapeHtml(category)}</span>` : ""}
            <span>${escapeHtml(typeLabel)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${icon("more-horizontal", "w-4 h-4")}
          </summary>
          <div class="absolute right-0 top-12 w-40 bg-white border border-slate-100 rounded-2xl shadow-lg p-2 z-20">
            <button data-menu-edit="${escapeHtml(item.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Bearbeiten</button>
            <button data-menu-delete="${escapeHtml(item.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50">Loeschen</button>
          </div>
        </details>
      </div>
    `;
  }
  const wrapperAttrs = mode === "profile"
    ? `data-menu-open="${escapeHtml(item.id)}" role="button"`
    : "";
  return `
    <div ${wrapperAttrs} class="w-full p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${mode === "profile" ? "cursor-pointer" : ""}">
      <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
        <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}"${lazyAttrs} class="w-full h-full object-cover" style="object-position:${getMenuItemObjectPosition(item)};" ${imageAttrs} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.name || tr("menu.product", "Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${escapeHtml(priceLabel)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${category ? `<span>${escapeHtml(category)}</span>` : ""}
          <span>${escapeHtml(typeLabel)}</span>
        </div>
        ${desc ? `<p class="text-xs text-slate-500 mt-2 line-clamp-2">${escapeHtml(desc)}</p>` : ""}
      </div>
    </div>
  `;
}

function renderMenuItemCardStacked(item, { mode = "profile", variant = "food", priorityIndex = -1 } = {}) {
  const rawImg = resolveMenuItemHero(item);
  const menuDetailStableKey = mode === "profile"
    ? getMenuDetailImageStableKey(item, { index: 0 })
    : "";
  const isDrink = variant === "drink";
  const { safeImg, fallbackImg, imageAttrs, lazyAttrs } = buildResponsiveMenuImageSources(rawImg, {
    mode,
    priorityIndex,
    stableKey: menuDetailStableKey,
    preferredSize: isDrink ? "small" : "medium",
    candidateSizes: isDrink ? ["small", "medium"] : ["small", "medium", "large"],
    variant: isDrink ? "grid" : "hero"
  });
  const priceLabel = formatMenuItemPrice(item);
  const catalogProfile = state.activeTab === "menu" ? state.userProfile : (state.profileView?.profile || state.userProfile);
  const isShopMode = isShopCatalogProfile(catalogProfile);
  const typeLabel = menuItemTypeLabel(item, isShopMode);
  const category = isShopMode ? normalizeShopProductCategoryLabel(item.category) : (item.category || "");
  const desc = item.description || "";
  const wrapperAttrs = mode === "profile"
    ? `data-menu-open="${escapeHtml(item.id)}" role="button"`
    : "";
  const restaurantId = state.menu.restaurantId
    || state.profileView?.profile?.restaurantId
    || state.userProfile.restaurantId
    || "";
  const itemId = getMenuItemSocialId(item);
  const metaKey = menuItemMetaKey(restaurantId, itemId);
  const meta = metaKey ? ensureMenuItemMeta(metaKey) : { likes: [], comments: [], counts: { likes: 0, comments: 0 } };
  const counts = resolveMenuItemCounts(meta);
  const countsRow = `
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${icon("heart", "w-3 h-3 text-rose-400")} <span data-menu-like-count="${escapeHtml(itemId)}">${escapeHtml(formatCount(counts.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${icon("message-circle", "w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${escapeHtml(itemId)}">${escapeHtml(formatCount(counts.comments))}</span>
      </span>
    </div>
  `;
  return `
    <div ${wrapperAttrs} class="w-full ${isDrink ? "h-full p-3 rounded-[1.6rem] flex flex-col" : "p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${mode === "profile" ? "cursor-pointer" : ""}">
      <div class="w-full ${isDrink ? "h-28 rounded-[1.4rem]" : "h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}"${lazyAttrs} class="w-full h-full object-cover" style="object-position:${getMenuItemObjectPosition(item)};" ${imageAttrs} decoding="async" />
      </div>
      ${isDrink ? `
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${escapeHtml(item.name || tr("menu.product", "Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${escapeHtml(priceLabel)}</p>
          ${countsRow}
        </div>
      ` : `
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${escapeHtml(item.name || tr("menu.product", "Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${escapeHtml(priceLabel)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${category ? `<span>${escapeHtml(category)}</span>` : ""}
            <span>${escapeHtml(typeLabel)}</span>
          </div>
          ${desc ? `<p class="text-xs text-slate-500 mt-2 line-clamp-2">${escapeHtml(desc)}</p>` : ""}
          ${countsRow}
        </div>
      `}
    </div>
  `;
}

function isTestfirstMenuProfile(profile = {}) {
  if (!profile?.restaurantId) return false;
  if (isShopCatalogProfile(profile)) return false;
  const businessType = String(getBusinessProfileType(profile) || "").trim().toLowerCase();
  return businessType === "restaurant" || businessType === "cafe" || businessType === "fastfood";
}

function getMenuCardSocialMeta(item) {
  const restaurantId = item?.restaurantId
    || state.menu.restaurantId
    || state.profileView?.profile?.restaurantId
    || state.userProfile.restaurantId
    || "";
  const itemId = getMenuItemSocialId(item);
  const metaKey = menuItemMetaKey(restaurantId, itemId);
  const meta = metaKey ? ensureMenuItemMeta(metaKey) : { likes: [], comments: [], counts: { likes: 0, comments: 0 } };
  const userUid = String(state.user?.uid || "").trim();
  const userHandle = String(state.user?.handle || "").trim().toLowerCase();
  const isLiked = !!meta.likes?.some((row) => {
    const rowUid = String(row?.uid || "").trim();
    if (userUid && rowUid && rowUid === userUid) return true;
    const rowHandle = String(row?.handle || "").trim().toLowerCase();
    return !!userHandle && !!rowHandle && rowHandle === userHandle;
  });
  return {
    itemId,
    meta,
    counts: resolveMenuItemCounts(meta),
    isLiked
  };
}

function getMenuDetailImageStableKey(item, { index = 0 } = {}) {
  const restaurantId = String(
    item?.restaurantId
    || state.menu.restaurantId
    || state.profileView?.profile?.restaurantId
    || state.userProfile.restaurantId
    || ""
  ).trim();
  const itemId = String(item?.id || getMenuItemSocialId(item) || "").trim();
  if (!restaurantId || !itemId) return "";
  const numericIndex = Number(index);
  const safeIndex = Number.isFinite(numericIndex)
    ? Math.max(0, Math.floor(numericIndex))
    : 0;
  return `menu-detail:${restaurantId}:${itemId}:${safeIndex}`;
}

function getMenuCardGalleryImages(item) {
  const list = typeof getMenuItemImages === "function" ? getMenuItemImages(item) : [];
  const gallery = Array.isArray(list) ? list.filter(Boolean) : [];
  if (gallery.length) return gallery;
  const hero = resolveMenuItemHero(item);
  return hero ? [hero] : [];
}

function resolveMenuCardStyle(item) {
  return normalizeMenuCardStyleCore(item?.cardStyle || "", normalizeMenuType(item?.type || "food"));
}

function buildFocusCardItem(item, { menuItemId = "" } = {}) {
  if (!item) return null;
  const resolvedMenuItemId = String(menuItemId || item.menuItemId || item.itemId || item.productId || "").trim();
  return {
    id: item.id || "",
    title: item.name || item.title || "Sot ne Fokus",
    text: item.description || item.text || "",
    imageUrl: resolveMenuItemHero(item) || item.imageUrl || "",
    objectPosition: item.objectPosition || getMenuItemObjectPosition(item),
    menuItemId: resolvedMenuItemId
  };
}

function renderSkeletonBlock(className = "") {
  return `<div aria-hidden="true" class="${className} bg-slate-100 animate-pulse"></div>`;
}

function renderFocusCarouselSkeleton() {
  const focusCardClass = getFocusCardClass();
  return `
    <div class="${focusCardClass} rounded-[2.5rem] p-6 border shadow-sm" data-focus-skeleton="true" aria-hidden="true">
      <div class="flex items-center justify-between mb-4">
        ${renderSkeletonBlock("h-3 w-24 rounded-full")}
        <div class="flex items-center gap-2">
          ${renderSkeletonBlock("w-9 h-9 rounded-full")}
          ${renderSkeletonBlock("w-9 h-9 rounded-full")}
        </div>
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${renderSkeletonBlock("w-full h-56")}
      </div>
      <div class="mt-4 space-y-2">
        ${renderSkeletonBlock("h-5 w-2/3 rounded-full")}
        ${renderSkeletonBlock("h-4 w-full rounded-full")}
        ${renderSkeletonBlock("h-4 w-3/5 rounded-full")}
      </div>
    </div>
  `;
}

function renderTestfirstFocusSkeleton() {
  return `
    <div class="pt-2 pb-4" data-focus-skeleton="true" aria-hidden="true">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        <div class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col mb-2" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
            ${renderSkeletonBlock("w-full h-full")}
          </div>
          <div class="px-2 py-4 space-y-2">
            ${renderSkeletonBlock("h-5 w-2/3 rounded-full")}
            ${renderSkeletonBlock("h-4 w-full rounded-full")}
            ${renderSkeletonBlock("h-4 w-1/2 rounded-full")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTestfirstDrinkGridCardSkeleton() {
  return `
    <div class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col relative" aria-hidden="true">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        ${renderSkeletonBlock("w-full h-full")}
        ${renderSkeletonBlock("absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90")}
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="mb-1 space-y-2">
          ${renderSkeletonBlock("h-4 w-4/5 rounded-full")}
          ${renderSkeletonBlock("h-3 w-3/5 rounded-full")}
        </div>
        ${renderSkeletonBlock("h-3 w-full rounded-full mb-1")}
        ${renderSkeletonBlock("h-3 w-2/3 rounded-full mb-3")}
        <div class="mt-auto pt-2 flex items-center justify-between">
          ${renderSkeletonBlock("h-4 w-14 rounded-full")}
          ${renderSkeletonBlock("w-8 h-8 rounded-full bg-slate-900/10")}
        </div>
      </div>
    </div>
  `;
}

function renderTestfirstFoodCardSkeleton() {
  return `
    <div class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 relative" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;" aria-hidden="true">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${renderSkeletonBlock("w-full h-full")}
        ${renderSkeletonBlock("absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90")}
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div class="min-w-0 flex-1">
            ${renderSkeletonBlock("h-5 w-4/5 rounded-full")}
          </div>
          ${renderSkeletonBlock("h-5 w-14 rounded-full shrink-0")}
        </div>
        ${renderSkeletonBlock("h-4 w-full rounded-full mb-2")}
        ${renderSkeletonBlock("h-4 w-2/3 rounded-full mb-4")}
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div></div>
          <div class="h-11 w-32 rounded-2xl bg-slate-100 animate-pulse"></div>
        </div>
      </div>
    </div>
  `;
}

function renderTestfirstMenuSkeleton() {
  return `
    <div id="menu-section" class="mt-5" data-menu-skeleton="true">
      <section class="menu-type-block relative" data-menu-type-block="drink">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
            ${Array.from({ length: 4 }, () => renderTestfirstDrinkGridCardSkeleton()).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block relative" data-menu-type-block="food">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="food">
          <div class="app-content-inline">
            ${Array.from({ length: 2 }, () => renderTestfirstFoodCardSkeleton()).join("")}
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderStandardStackedCardSkeleton(variant = "food") {
  const isDrink = variant === "drink";
  return `
    <div class="w-full ${isDrink ? "h-full p-3 rounded-[1.6rem] flex flex-col" : "p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm" aria-hidden="true">
      <div class="w-full ${isDrink ? "h-28 rounded-[1.4rem]" : "h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        ${renderSkeletonBlock("w-full h-full")}
      </div>
      ${isDrink ? `
        <div class="mt-3 flex flex-1 flex-col space-y-2">
          ${renderSkeletonBlock("h-4 w-4/5 rounded-full")}
          ${renderSkeletonBlock("h-3 w-1/2 rounded-full")}
          <div class="mt-2 flex items-center gap-3">
            ${renderSkeletonBlock("h-3 w-10 rounded-full")}
            ${renderSkeletonBlock("h-3 w-10 rounded-full")}
          </div>
        </div>
      ` : `
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            ${renderSkeletonBlock("h-4 w-3/5 rounded-full")}
            ${renderSkeletonBlock("h-4 w-14 rounded-full")}
          </div>
          ${renderSkeletonBlock("h-3 w-2/5 rounded-full mt-2")}
          ${renderSkeletonBlock("h-3 w-full rounded-full mt-3")}
          ${renderSkeletonBlock("h-3 w-2/3 rounded-full mt-2")}
          <div class="mt-3 flex items-center gap-3">
            ${renderSkeletonBlock("h-3 w-10 rounded-full")}
            ${renderSkeletonBlock("h-3 w-10 rounded-full")}
          </div>
        </div>
      `}
    </div>
  `;
}

function renderShopProductCardSkeleton() {
  return `
    <article class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col" aria-hidden="true">
      <div class="rounded-[1.5rem] overflow-hidden bg-slate-100" style="aspect-ratio:4 / 5;">
        ${renderSkeletonBlock("w-full h-full")}
      </div>
      <div class="pt-3 flex-1 flex flex-col min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1 space-y-2">
            ${renderSkeletonBlock("h-4 w-full rounded-full")}
            ${renderSkeletonBlock("h-4 w-3/5 rounded-full")}
          </div>
          ${renderSkeletonBlock("h-3 w-10 rounded-full shrink-0")}
        </div>
        ${renderSkeletonBlock("h-3 w-full rounded-full mt-3")}
        ${renderSkeletonBlock("h-3 w-2/3 rounded-full mt-2")}
      </div>
    </article>
  `;
}

function renderStandardMenuSkeleton({ isShop = false } = {}) {
  if (isShop) {
    return `
      <div class="grid grid-cols-2 gap-4" data-menu-skeleton="true">
        ${Array.from({ length: 4 }, () => renderShopProductCardSkeleton()).join("")}
      </div>
    `;
  }
  return `
    <div data-menu-skeleton="true" class="space-y-5">
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
        <div class="flex items-center justify-between mb-4">
          ${renderSkeletonBlock("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-4">
            ${Array.from({ length: 4 }, () => renderStandardStackedCardSkeleton("drink")).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
        <div class="flex items-center justify-between mb-4">
          ${renderSkeletonBlock("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="food">
          <div class="space-y-4">
            ${Array.from({ length: 2 }, () => renderStandardStackedCardSkeleton("food")).join("")}
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderTestfirstFocusSection(profile, focusItems = [], { mode = "profile" } = {}) {
  const restaurantId = profile?.restaurantId || "";
  const canUseHighlightFocusUi = isTestfirstMenuProfile(profile) || isShopCatalogProfile(profile);
  if (!restaurantId || !canUseHighlightFocusUi || !focusItems.length) return "";
  return `
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${focusItems.map((item, focusIndex) => {
          const rawImg = item.imageUrl || "";
          const focusStableKey = String(item.menuItemId || item.id || "").trim();
          const { safeImg, fallbackImg, imageAttrs, lazyAttrs } = buildResponsiveMenuImageSources(rawImg, {
            mode,
            priorityIndex: focusIndex,
            preferredSize: "medium",
            candidateSizes: ["small", "medium", "large"],
            variant: "hero",
            stableKey: focusStableKey ? `menu-focus:${restaurantId}:${focusStableKey}` : ""
          });
          const menuItemId = String(item.menuItemId || "").trim();
          const wrapperAttrs = mode === "profile" && menuItemId
            ? `data-menu-open="${escapeHtml(menuItemId)}" role="button"`
            : "";
          return `
            <div ${wrapperAttrs} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${wrapperAttrs ? "cursor-pointer" : ""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}"${lazyAttrs} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${item.objectPosition || "50% 50%"};" ${imageAttrs} decoding="async" />
                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${icon("sparkles", "w-3 h-3 text-amber-500")}
                  <span class="text-[10px] font-black text-slate-900 uppercase tracking-widest pt-[1px]">Tipp</span>
                </div>
              </div>
              <div class="px-2 py-4">
                <h3 class="text-[17px] font-black text-slate-900 leading-tight">${escapeHtml(item.title || "")}</h3>
                <p class="text-[13px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">${escapeHtml(item.text || "")}</p>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderTestfirstDrinkGridCard(item, { mode = "profile", priorityIndex = -1 } = {}) {
  const rawImg = resolveMenuItemHero(item);
  const menuDetailStableKey = mode === "profile"
    ? getMenuDetailImageStableKey(item, { index: 0 })
    : "";
  const { safeImg, fallbackImg, imageAttrs, lazyAttrs } = buildResponsiveMenuImageSources(rawImg, {
    mode,
    priorityIndex,
    stableKey: menuDetailStableKey,
    preferredSize: "small",
    candidateSizes: ["small", "medium"],
    variant: "grid"
  });
  const priceLabel = formatMenuItemPrice(item);
  const wrapperAttrs = mode === "profile"
    ? `data-menu-open="${escapeHtml(item.id)}" role="button"`
    : "";
  const { itemId, counts, isLiked } = getMenuCardSocialMeta(item);
  return `
    <div ${wrapperAttrs} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${mode === "profile" ? "cursor-pointer" : ""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}"${lazyAttrs} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${getMenuItemObjectPosition(item)};" ${imageAttrs} decoding="async" />
        <button
          type="button"
          data-menu-card-like="${escapeHtml(item.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${isLiked ? "text-rose-500" : "text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${isLiked ? "true" : "false"}"
        >
          ${icon("heart", "w-3.5 h-3.5 fill-current opacity-80")}
        </button>
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-[14px] font-black text-slate-900 leading-tight">${escapeHtml(item.name || "")}</h4>
        </div>
        <p class="text-[12px] text-slate-500 leading-relaxed mb-3">${escapeHtml(item.description || "")}</p>
        <div class="mt-auto pt-2 flex items-center justify-between">
          <span class="text-[14px] font-black text-slate-900">${escapeHtml(priceLabel)}</span>
          <button type="button" class="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors active:scale-95">
            ${icon("plus", "w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${escapeHtml(itemId)}">${escapeHtml(formatCount(counts.likes))}</span>
          <span data-menu-comment-count="${escapeHtml(itemId)}">${escapeHtml(formatCount(counts.comments))}</span>
        </div>
      </div>
    </div>
  `;
}

function buildSpecialCardWrapperAttrs(item, mode = "profile") {
  if (mode !== "profile") return "";
  const action = resolveSpecialCardAction(item);
  if (action.type === "link" && action.url) {
    return `data-menu-special-link="${escapeHtml(action.url)}" role="button" tabindex="0"`;
  }
  if (action.type === "product" && action.productId) {
    return `data-menu-open="${escapeHtml(action.productId)}" role="button"`;
  }
  return `data-menu-open="${escapeHtml(item.id)}" role="button"`;
}

function renderTestfirstSpecialCard(item, { mode = "profile", size = "default", priorityIndex = -1 } = {}) {
  const rawImg = resolveMenuItemHero(item);
  const menuDetailStableKey = mode === "profile"
    ? getMenuDetailImageStableKey(item, { index: 0 })
    : "";
  const heroVariant = size === "food";
  const { safeImg, fallbackImg, imageAttrs, lazyAttrs } = buildResponsiveMenuImageSources(rawImg, {
    mode,
    priorityIndex,
    stableKey: menuDetailStableKey,
    preferredSize: heroVariant ? "medium" : "small",
    candidateSizes: heroVariant ? ["small", "medium", "large"] : ["small", "medium"],
    variant: heroVariant ? "hero" : "grid"
  });
  const wrapperAttrs = buildSpecialCardWrapperAttrs(item, mode);
  const badgeLabel = String(item.category || "Special").trim() || "Special";
  const titleHtml = escapeHtml(String(item.name || "Special")).replace(/\n/g, "<br>");
  if (size === "food") {
    return `
      <div ${wrapperAttrs} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${mode === "profile" ? "cursor-pointer" : ""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}"${lazyAttrs} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${getMenuItemObjectPosition(item)};" ${imageAttrs} decoding="async" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${icon("arrow-right", "w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${escapeHtml(badgeLabel)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${titleHtml}</h4>
          </div>
        </div>
      </div>
    `;
  }
  return `
    <div ${wrapperAttrs} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${mode === "profile" ? "cursor-pointer" : ""}">
      <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}"${lazyAttrs} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${getMenuItemObjectPosition(item)};" ${imageAttrs} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${icon("arrow-right", "w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${escapeHtml(badgeLabel)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${titleHtml}</h4>
        </div>
      </div>
    </div>
  `;
}

function renderTestfirstFoodCard(item, { mode = "profile", priorityIndex = -1 } = {}) {
  const priceLabel = formatMenuItemPrice(item);
  const wrapperAttrs = mode === "profile"
    ? `data-menu-open="${escapeHtml(item.id)}" role="button"`
    : "";
  const galleryImages = getMenuCardGalleryImages(item);
  const rawSlides = galleryImages.length ? galleryImages : [resolveMenuItemHero(item) || ""];
  const slides = rawSlides.filter(Boolean);
  const displaySlides = slides.length ? slides.slice(0, 12) : [""];
  const hasSlider = displaySlides.length > 1;
  const { itemId, counts, isLiked } = getMenuCardSocialMeta(item);
  const likesLabel = formatCount(Math.max(0, Number(counts.likes) || 0));
  const commentsLabel = formatCount(Math.max(0, Number(counts.comments) || 0));
  return `
    <div ${wrapperAttrs} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${mode === "profile" ? "cursor-pointer" : ""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${hasSlider ? `
          <div
            data-menu-card-gallery-track="${escapeHtml(item.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${displaySlides.map((image, index) => {
              const menuDetailStableKey = mode === "profile"
                ? getMenuDetailImageStableKey(item, { index })
                : "";
              const responsiveSource = buildResponsiveMenuImageSources(image || "", {
                mode,
                priorityIndex,
                slideIndex: index,
                stableKey: menuDetailStableKey,
                preferredSize: "medium",
                candidateSizes: ["small", "medium", "large"],
                variant: "hero"
              });
              const shouldDeferSlide = index > 0;
              const safeImg = shouldDeferSlide ? PLACEHOLDER_IMAGE : responsiveSource.safeImg;
              const fallbackImg = shouldDeferSlide ? PLACEHOLDER_IMAGE : responsiveSource.fallbackImg;
              const imageAttrs = shouldDeferSlide ? responsiveSource.loadingAttrs : responsiveSource.imageAttrs;
              const lazyAttrs = shouldDeferSlide ? "" : (responsiveSource.lazyAttrs || "");
              const deferredAttrs = shouldDeferSlide
                ? ` data-menu-card-deferred-src="${escapeHtml(responsiveSource.safeImg)}"
                    data-menu-card-deferred-fallback="${escapeHtml(responsiveSource.fallbackImg)}"
                    ${responsiveSource.srcsetValue ? `data-menu-card-deferred-srcset="${escapeHtml(responsiveSource.srcsetValue)}"` : ""}
                    ${responsiveSource.sizesValue ? `data-menu-card-deferred-sizes="${escapeHtml(responsiveSource.sizesValue)}"` : ""}`
                : "";
              return `
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${index}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}"${lazyAttrs}${deferredAttrs} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${getMenuItemObjectPosition(item)};" ${imageAttrs} decoding="async" />
                </div>
              `;
            }).join("")}
          </div>
        ` : `
          ${displaySlides.map((image, index) => {
            const menuDetailStableKey = mode === "profile"
              ? getMenuDetailImageStableKey(item, { index })
              : "";
            const { safeImg, fallbackImg, imageAttrs, lazyAttrs } = buildResponsiveMenuImageSources(image || "", {
              mode,
              priorityIndex,
              slideIndex: index,
              stableKey: menuDetailStableKey,
              preferredSize: "medium",
              candidateSizes: ["small", "medium", "large"],
              variant: "hero"
            });
            return `
              <div class="w-full h-full">
                <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}"${lazyAttrs} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${getMenuItemObjectPosition(item)};" ${imageAttrs} decoding="async" />
              </div>
            `;
          }).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${escapeHtml(item.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${isLiked ? "text-rose-500" : "text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${isLiked ? "true" : "false"}"
        >
          ${icon("heart", "w-4 h-4 fill-current opacity-80")}
        </button>
        ${hasSlider ? `
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${displaySlides.map((_, index) => `
              <div
                data-menu-card-gallery-dot="${escapeHtml(item.id)}"
                data-menu-card-gallery-index="${index}"
                class="${index === 0 ? "w-4 h-1.5 bg-white rounded-full shadow-sm" : "w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm"}"
              ></div>
            `).join("")}
          </div>
        ` : ""}
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div>
            <h4 class="text-[18px] font-black text-slate-900 leading-snug">${escapeHtml(item.name || "")}</h4>
          </div>
          <span class="text-[17px] font-black text-slate-900 whitespace-nowrap">${escapeHtml(priceLabel)}</span>
        </div>
        <p class="text-[14px] text-slate-500 line-clamp-2 leading-relaxed mb-4" style="margin-bottom:16px;">${escapeHtml(item.description || "")}</p>
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div class="flex items-center gap-2">
            <div class="hidden">
              <span data-menu-like-count="${escapeHtml(itemId)}">${escapeHtml(likesLabel)}</span>
              <span data-menu-comment-count="${escapeHtml(itemId)}">${escapeHtml(commentsLabel)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${escapeHtml(tr("menu.add", "Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${icon("plus", "w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderTestfirstMenuContent(profile, items, { mode = "profile", publicMenuSurfaceState = null, focusFallbackHtml = "" } = {}) {
  const allItems = sortMenuItemsByOrder(Array.isArray(items) ? items : []);
  const restaurantId = String(profile?.restaurantId || "").trim();
  const canUseFocusState = mode === "admin" || hasPublicFocusTruthForRestaurant(restaurantId);
  const focusState = publicMenuSurfaceState?.focus?.canRenderFocus
    ? {
      items: Array.isArray(publicMenuSurfaceState.focus.items) ? publicMenuSurfaceState.focus.items : [],
      enabled: true
    }
    : (restaurantId && canUseFocusState
    ? getFocusStateForRestaurant(restaurantId)
    : { items: [], enabled: false });
  const focusItemsFromState = focusState.enabled
    ? (Array.isArray(focusState.items) ? focusState.items : []).map((item) => buildFocusCardItem({
      ...item,
      objectPosition: getFocusItemObjectPosition(item)
    }))
    : [];
  const focusItemsFromMenu = allItems
    .filter((item) => resolveMenuCardStyle(item) === "testfirst_focus" && !isMenuItemHidden(item))
    .map((item) => buildFocusCardItem(item, { menuItemId: item.id || "" }))
    .filter(Boolean);
  const focusSeen = new Set();
  const focusItems = [...focusItemsFromState, ...focusItemsFromMenu].filter((item) => {
    const dedupeKey = String(item.menuItemId || item.id || `${item.title}|${item.text}|${item.imageUrl}`);
    if (!dedupeKey) return false;
    if (focusSeen.has(dedupeKey)) return false;
    focusSeen.add(dedupeKey);
    return true;
  });

  const visibleItems = allItems.filter((item) => !isMenuItemHidden(item));
  const contentItems = visibleItems.filter((item) => resolveMenuCardStyle(item) !== "testfirst_focus");
  // Some legacy restaurant menus tag every entry as focus. In that case we must
  // still render a real menu body instead of leaving the tab visually empty.
  const projectedContentItems = contentItems.length ? contentItems : visibleItems;
  const displayFocusItems = contentItems.length ? focusItems : [];
  const drinkTypeItems = projectedContentItems.filter((item) => resolveMenuDisplaySection(item) === "drink");
  const foodTypeItems = projectedContentItems.filter((item) => resolveMenuDisplaySection(item) !== "drink");

  const splitTypeBuckets = (typeItems = []) => {
    const gridItems = [];
    const foodItems = [];
    typeItems.forEach((item) => {
      const style = resolveMenuCardStyle(item);
      if (style === "testfirst_food" || (style === "testfirst_special" && resolveSpecialCardSize(item) === "food")) {
        foodItems.push(item);
      } else {
        gridItems.push(item);
      }
    });
    return { gridItems, foodItems };
  };

  const renderGridCard = (item, priorityIndex = -1) => {
    const style = resolveMenuCardStyle(item);
    return style === "testfirst_special"
      ? renderTestfirstSpecialCard(item, { mode, priorityIndex })
      : renderTestfirstDrinkGridCard(item, { mode, priorityIndex });
  };
  let globalPriorityIndex = 0;
  const nextPriorityIndex = () => {
    const current = globalPriorityIndex;
    globalPriorityIndex += 1;
    return current;
  };

  const anchoredCategories = new Set();
  const renderTypeBlock = (menuType, bucket) => {
    if (!bucket.gridItems.length && !bucket.foodItems.length) return "";
    return `
      <section class="menu-type-block relative" data-menu-type-block="${escapeHtml(menuType)}">
        ${bucket.gridItems.length ? `
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${escapeHtml(menuType)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${renderMenuItemsWithCategoryAnchors(bucket.gridItems, (item) => renderGridCard(item, nextPriorityIndex()), anchoredCategories)}
            </div>
          </div>
        ` : ""}
        ${bucket.foodItems.length ? `
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${escapeHtml(menuType)}">
            <div class="app-content-inline">
              ${renderMenuItemsWithCategoryAnchors(bucket.foodItems, (item) => {
                const style = resolveMenuCardStyle(item);
                const priorityIndex = nextPriorityIndex();
                if (style === "testfirst_special") return renderTestfirstSpecialCard(item, { mode, size: "food", priorityIndex });
                return renderTestfirstFoodCard(item, { mode, priorityIndex });
              }, anchoredCategories)}
            </div>
          </div>
        ` : ""}
      </section>
    `;
  };

  const drinkBucket = splitTypeBuckets(drinkTypeItems);
  const foodBucket = splitTypeBuckets(foodTypeItems);

  return `
    <div>
      ${renderTestfirstFocusSection(profile, displayFocusItems, { mode }) || focusFallbackHtml}
      <div id="menu-section" class="mt-5">
        ${renderTypeBlock("drink", drinkBucket)}
        ${renderTypeBlock("food", foodBucket)}
      </div>
    </div>
  `;
}

function renderMenuDrinkGrid(items, { mode = "profile", useTestfirstCardUi = false, seenCategories = null, priorityOffset = 0 } = {}) {
  if (!items.length) return "";
  if (useTestfirstCardUi) {
    return `
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${renderMenuItemsWithCategoryAnchors(items, (item, index) => renderTestfirstDrinkGridCard(item, { mode, priorityIndex: priorityOffset + index }), seenCategories)}
      </div>
    `;
  }
  return `
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${renderMenuItemsWithCategoryAnchors(items, (item, index) => renderMenuItemCardStacked(item, { mode, variant: "drink", priorityIndex: priorityOffset + index }), seenCategories)}
    </div>
  `;
}

function renderMenuFoodList(items, { mode = "profile", useTestfirstCardUi = false, seenCategories = null, priorityOffset = 0 } = {}) {
  if (!items.length) return "";
  if (useTestfirstCardUi) {
    return `
      <div>
        ${renderMenuItemsWithCategoryAnchors(items, (item, index) => {
          if (resolveMenuCardStyle(item) === "testfirst_special" && resolveSpecialCardSize(item) === "food") {
            return renderTestfirstSpecialCard(item, { mode, size: "food", priorityIndex: priorityOffset + index });
          }
          return renderTestfirstFoodCard(item, { mode, priorityIndex: priorityOffset + index });
        }, seenCategories)}
      </div>
    `;
  }
  return `
    <div class="space-y-4">
      ${renderMenuItemsWithCategoryAnchors(items, (item, index) => renderMenuItemCardStacked(item, { mode, variant: "food", priorityIndex: priorityOffset + index }), seenCategories)}
    </div>
  `;
}

function renderMenuList(items, { mode = "profile" } = {}) {
  if (mode === "admin") {
    const activeFilter = String(state?.menu?.filter || "all").trim().toLowerCase();
    const isShop = isShopCatalogProfile(state.userProfile);
    const productTitle = tr("menu.products", "Produkte");
    const drinkItems = items.filter((item) => normalizeMenuType(item?.type) === "drink");
    const foodItems = items.filter((item) => normalizeMenuType(item?.type) !== "drink");
    const renderSection = (title, list, { addType = "" } = {}) => `
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${escapeHtml(title)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${escapeHtml(title)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${escapeHtml(formatCount(list.length))} Eintraege</p>
          </div>
          ${addType ? `
            <button type="button" data-menu-add-${escapeHtml(addType)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${icon("plus", "w-4 h-4")}
            </button>
          ` : ""}
        </div>
        ${list.length
          ? `<div class="space-y-3">${list.map((entry) => renderMenuItemCard(entry, { mode: "admin" })).join("")}</div>`
          : `<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${escapeHtml(tr("menu.noProducts", "Keine Produkte"))}</div>`
        }
      </div>
    `;
    if (isShop) {
      return renderSection(productTitle, items, { addType: "food" });
    }
    const allSections = [
      { title: tr("menu.drinks", "Getraenke"), list: drinkItems, addType: "drink" },
      { title: tr("menu.food", "Speisen"), list: foodItems, addType: "food" }
    ];
    if (activeFilter === "all") {
      return `
        <div>
          ${allSections.map((section) => renderSection(section.title, section.list, { addType: section.addType })).join("")}
        </div>
      `;
    }
    const sections = allSections.filter((section) => section.list.length > 0);
    if (!sections.length) {
      if (activeFilter === "drink") {
        return renderSection(tr("menu.drinks", "Getraenke"), [], { addType: "drink" });
      }
      if (activeFilter === "food") {
        return renderSection(tr("menu.food", "Speisen"), [], { addType: "food" });
      }
      return "";
    }
    return `
      <div>
        ${sections.map((section) => renderSection(section.title, section.list, { addType: section.addType })).join("")}
      </div>
    `;
  }
  if (!items.length) {
    return `
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
        ${escapeHtml(tr("menu.noProducts", "Keine Produkte"))}
      </div>
    `;
  }
  return `
    <div class="space-y-4">
      ${items.map((item, index) => renderMenuItemCard(item, { mode, priorityIndex: index })).join("")}
    </div>
  `;
}

function renderFocusAdminSection(restaurantId, { variant = "focus", suppressLoading = false } = {}) {
  if (!restaurantId) return "";
  const { items, enabled, loading } = getFocusStateForRestaurant(restaurantId, { includeInactive: true });
  const countLabel = formatCount(items.length);
  const isTravelOffers = String(variant || "").trim().toLowerCase() === "travel-offers";
  const eyebrow = isTravelOffers ? "Ofertat" : "Sot ne Fokus";
  const title = isTravelOffers ? "Oferta" : "Highlights";
  const helper = isTravelOffers ? "Im Travel und Profil sichtbar" : "Im Profil sichtbar";
  const loadingLabel = isTravelOffers ? "Ofertat werden geladen..." : tr("focus.loading", "Fokus wird geladen...");
  const emptyLabel = isTravelOffers ? "Noch keine Oferta-Eintraege" : "Noch keine Fokus-Eintraege";
  return `
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${escapeHtml(eyebrow)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${escapeHtml(title)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${escapeHtml(countLabel)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${icon("plus", "w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${isTravelOffers ? "Oferta anzeigen" : "Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${escapeHtml(helper)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${enabled ? "checked" : ""} />
      </label>

      ${items.length ? `
        <div class="space-y-3">
          ${items.map((item) => {
            const imgUrl = getOptimizedImageUrl(item.imageUrl || "", "thumb");
            const safeImg = isPlaceholderUrl(imgUrl) ? PLACEHOLDER_IMAGE : imgUrl;
            const status = item.active !== false ? "Aktiv" : "Inaktiv";
            const statusClass = item.active !== false ? "text-emerald-600" : "text-slate-400";
            return `
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${escapeHtml(safeImg)}" class="w-full h-full object-cover" style="object-position:${getFocusItemObjectPosition(item)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.title || "Sot ne Fokus")}</p>
                  ${item.text ? `<p class="text-xs text-slate-500 mt-1 line-clamp-2">${escapeHtml(item.text)}</p>` : ""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${statusClass}">${status}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : loading && !suppressLoading ? `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtml(loadingLabel)}</div>
      ` : loading ? "" : `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${escapeHtml(emptyLabel)}</div>
      `}
    </div>
  `;
}

function isAdsAdminProfile(profile = {}) {
  if (!profile?.restaurantId) return false;
  const type = String(getBusinessProfileType(profile) || "").trim().toLowerCase();
  if (["hotel", "hotels", "motel", "motels", "travel", "hostel", "resort", "accommodation"].includes(type)) return false;
  if (type === "ecommerce" || isShopCatalogProfile(profile)) return false;
  return isRestaurantCafeProfile(profile)
    || ["restaurant", "cafe", "coffee", "fastfood", "food"].includes(type)
    || !type;
}

function getAdStatusView(item = {}) {
  if (item.active === false) return { label: "Inaktiv", className: "text-slate-400" };
  const status = String(item.status || item.approvalStatus || "pending").trim().toLowerCase();
  if (status === "approved") return { label: "Freigegeben", className: "text-emerald-600" };
  if (status === "rejected") return { label: "Abgelehnt", className: "text-rose-600" };
  return { label: "Wartet auf Heart", className: "text-amber-600" };
}

function renderAdsAdminSection(profile, restaurantId) {
  if (!restaurantId || !isAdsAdminProfile(profile)) return "";
  const { items, loading } = getAdsStateForRestaurant(restaurantId, { includeInactive: true });
  const countLabel = formatCount(items.length);
  return `
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${escapeHtml(countLabel)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${icon("plus", "w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${items.length ? `
        <div class="space-y-3">
          ${items.map((item) => {
            const imgUrl = getOptimizedImageUrl(item.imageUrl || "", "thumb");
            const safeImg = isPlaceholderUrl(imgUrl) ? PLACEHOLDER_IMAGE : imgUrl;
            const status = getAdStatusView(item);
            const categoryLabel = item.category || "RESTAURANT";
            const priceLabel = item.priceSegment || "€€ - €€€";
            return `
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${escapeHtml(safeImg)}" class="w-full h-full object-cover" style="object-position:${getFocusItemObjectPosition(item)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.title || "Ad")}</p>
                  ${item.text ? `<p class="text-xs text-slate-500 mt-1 line-clamp-2">${escapeHtml(item.text)}</p>` : ""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${escapeHtml(categoryLabel)} · ${escapeHtml(priceLabel)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${status.className}">${escapeHtml(status.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-ad-edit="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-ad-delete="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : loading ? `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ads werden geladen...</div>
      ` : `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Ads</div>
      `}
    </div>
  `;
}

function collectShoppingLandingTextList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  const raw = String(value || "").trim();
  if (!raw) return [];
  return raw.split(/[\n,;|]/).map((item) => item.trim()).filter(Boolean);
}

function getShoppingLandingRecord(profile = {}) {
  const restaurantId = String(profile?.restaurantId || "").trim();
  const restaurant = restaurantId ? getRestaurantMetaById(restaurantId) : null;
  return {
    ...(restaurant && typeof restaurant === "object" ? restaurant : {}),
    ...(profile && typeof profile === "object" ? profile : {}),
    ...(restaurantId ? { restaurantId } : {})
  };
}

function getShoppingLandingCardData(record = {}) {
  return record.shoppingLandingCard && typeof record.shoppingLandingCard === "object"
    ? record.shoppingLandingCard
    : {};
}

function getShoppingLandingStoredProductIds(record = {}) {
  const card = getShoppingLandingCardData(record);
  return [
    ...collectShoppingLandingTextList(card.productIds),
    ...collectShoppingLandingTextList(record.shoppingLandingCardProductIds),
    ...collectShoppingLandingTextList(record.shoppingLandingProductIds)
  ].filter(Boolean);
}

function normalizeShoppingLandingProductImageOverrides(value = {}) {
  if (!value || typeof value !== "object") return {};
  return Object.entries(value).reduce((acc, [key, imageUrl]) => {
    const id = String(key || "").trim();
    const url = String(imageUrl || "").trim();
    if (id && url) acc[id] = url;
    return acc;
  }, {});
}

function getShoppingLandingStoredProductImageOverrides(record = {}) {
  const card = getShoppingLandingCardData(record);
  return {
    ...normalizeShoppingLandingProductImageOverrides(record.shoppingLandingProductImageOverrides),
    ...normalizeShoppingLandingProductImageOverrides(card.productImageOverrides)
  };
}

function getShoppingLandingEditorStateForRestaurant(restaurantId = "") {
  const safeRestaurantId = String(restaurantId || "").trim();
  const editor = state.shoppingLandingCardEditor && typeof state.shoppingLandingCardEditor === "object"
    ? state.shoppingLandingCardEditor
    : {};
  const editorRestaurantId = String(editor.restaurantId || "").trim();
  if (editorRestaurantId && editorRestaurantId !== safeRestaurantId) return {};
  return editor;
}

function readShoppingLandingImageCandidateValue(entry) {
  if (!entry) return "";
  if (typeof entry === "string") return entry.trim();
  if (typeof entry !== "object") return String(entry || "").trim();
  return String(
    entry.url
    || entry.src
    || entry.cdnUrl
    || entry.imageUrl
    || entry.image
    || entry.photoUrl
    || entry.thumbnail
    || ""
  ).trim();
}

function getShoppingLandingProductImageCandidates(item = {}) {
  const resolved = resolveMenuItemHero(item);
  const candidates = [
    resolved,
    ...(Array.isArray(item.imageUrls) ? item.imageUrls : []),
    ...(Array.isArray(item.images) ? item.images : []),
    item.imageUrl,
    item.image,
    item.photoUrl,
    item.coverUrl,
    item.img,
    item.thumbnail
  ].map(readShoppingLandingImageCandidateValue).filter(Boolean);
  return candidates.filter((entry, index) => candidates.indexOf(entry) === index);
}

function getShoppingLandingProductHero(item = {}) {
  return getShoppingLandingProductImageCandidates(item)[0] || "";
}

function buildShoppingLandingProductPreview(item = {}, productImageOverrides = {}, productImagePreviews = {}) {
  const id = String(item?.id || item?.productId || item?.menuItemId || "").trim();
  if (!id) return null;
  const imageCandidates = getShoppingLandingProductImageCandidates(item).map((rawUrl) => ({
    rawUrl,
    imageUrl: getOptimizedImageUrl(rawUrl, "thumb")
  })).filter((candidate) => candidate.rawUrl && !isPlaceholderUrl(candidate.imageUrl));
  const defaultRaw = imageCandidates[0]?.rawUrl || "";
  const overrideRaw = String(productImageOverrides?.[id] || "").trim();
  const previewRaw = String(productImagePreviews?.[id] || "").trim();
  const selectedRaw = previewRaw || overrideRaw || defaultRaw;
  const imgUrl = selectedRaw ? getOptimizedImageUrl(selectedRaw, "thumb") : "";
  return {
    id,
    name: String(item.name || item.title || "Produkt").trim(),
    price: formatMenuItemPrice(item),
    imageUrl: imgUrl && !isPlaceholderUrl(imgUrl) ? imgUrl : "",
    defaultImageRaw: defaultRaw,
    cardImageUrl: overrideRaw,
    previewImageUrl: previewRaw,
    imageCandidates,
    objectPosition: getMenuItemObjectPosition(item)
  };
}

function renderShoppingLandingCardAdminSection(profile = {}, restaurantId = "", menuItems = []) {
  if (!restaurantId || !isShopCatalogProfile(profile)) return "";
  const record = getShoppingLandingRecord(profile);
  const card = getShoppingLandingCardData(record);
  const editor = getShoppingLandingEditorStateForRestaurant(restaurantId);
  const saving = editor.saving === true;
  const status = String(editor.status || "").trim();
  const statusIsError = /fehl|error|nicht|nuk|kein/i.test(status);
  const storedImage = String(card.imageUrl || record.shoppingLandingCardImageUrl || record.shoppingLandingImageUrl || "").trim();
  const profileImage = String(record.logoUrl || record.logo || record.logoURL || record.avatar || profile.avatar || "").trim();
  const imageDraft = String(editor.imageUrlDraft ?? storedImage).trim();
  const imagePreview = String(editor.imagePreview || imageDraft || profileImage || "").trim();
  const previewImage = imagePreview ? getOptimizedImageUrl(imagePreview, "large") : PLACEHOLDER_IMAGE;
  const titleDraft = String(editor.titleDraft ?? (card.title || record.shoppingLandingCardTitle || profile.name || "")).trim();
  const active = editor.active !== undefined
    ? editor.active !== false
    : (card.active !== false && record.shoppingLandingCardEnabled !== false);
  const storedProductIds = getShoppingLandingStoredProductIds(record);
  const editorProductIds = Array.isArray(editor.productIds)
    ? editor.productIds.map((item) => String(item || "").trim()).filter(Boolean)
    : null;
  const selectedProductIds = new Set(editorProductIds || storedProductIds);
  const productImageOverrides = {
    ...getShoppingLandingStoredProductImageOverrides(record),
    ...normalizeShoppingLandingProductImageOverrides(editor.productImageOverrides)
  };
  const productImagePreviews = editor.productImagePreviews && typeof editor.productImagePreviews === "object"
    ? editor.productImagePreviews
    : {};
  const productOptions = (Array.isArray(menuItems) ? menuItems : [])
    .filter((item) => item && String(item.id || "").trim() && item.hidden !== true && item.available !== false)
    .map((item) => buildShoppingLandingProductPreview(item, productImageOverrides, productImagePreviews))
    .filter(Boolean);
  const selectedCountLabel = selectedProductIds.size
    ? `${formatCount(selectedProductIds.size)} ausgewaehlt`
    : "Keine Auswahl = alle Produkte";
  return `
    <div data-shopping-landing-card-editor="${escapeHtml(restaurantId)}" class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Landing Card</span>
          <h3 class="text-xl font-black italic tracking-tighter">Shopping Card</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${escapeHtml(selectedCountLabel)}</p>
        </div>
        <button type="button" id="shoppingLandingImageTrigger" class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95" aria-label="Bild hochladen">
          ${icon("plus", "w-4 h-4")}
        </button>
      </div>

      <input id="shoppingLandingImageInput" type="file" accept="image/*" class="hidden" />
      <input id="shoppingLandingImageUrl" type="hidden" value="${escapeHtml(imageDraft)}" />

      <div class="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-4">
        <img src="${escapeHtml(previewImage || PLACEHOLDER_IMAGE)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div class="absolute inset-x-0 top-0 h-16 pointer-events-none" style="background:linear-gradient(to bottom, rgba(255,255,255,0.7), transparent);"></div>
        <div class="absolute left-4 bottom-4 right-4">
          <span class="inline-flex max-w-full truncate text-[10px] uppercase tracking-wider font-extrabold text-slate-800 bg-white backdrop-blur-sm py-1 px-2.5 rounded-full" style="background:rgba(255,255,255,0.8);">
            ${escapeHtml(titleDraft || "Shop Picks")}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label for="shoppingLandingTitleInput" class="text-[10px] font-black text-slate-400 uppercase ml-2">Titel</label>
          <input id="shoppingLandingTitleInput" type="text" value="${escapeHtml(titleDraft)}" placeholder="Summer Picks" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-amber-100" />
        </div>

        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">Shopping-Tab anzeigen</p>
            <p class="text-[10px] font-bold text-slate-400">Diese Card erscheint im Tab Shopping.</p>
          </div>
          <input id="shoppingLandingActiveToggle" type="checkbox" class="w-5 h-5 accent-amber-500" style="accent-color:#f97316;" ${active ? "checked" : ""} />
        </label>

        <div class="rounded-[1.8rem] border border-slate-100 bg-slate-50 p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produkte</p>
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${escapeHtml(formatCount(productOptions.length))}</span>
          </div>
          ${productOptions.length ? `
            <div class="grid grid-cols-1 gap-2">
              ${productOptions.map((product) => {
                const checked = selectedProductIds.has(product.id);
                const image = product.imageUrl || PLACEHOLDER_IMAGE;
                const defaultRaw = String(product.defaultImageRaw || product.imageCandidates[0]?.rawUrl || "").trim();
                const overrideRaw = String(product.cardImageUrl || "").trim();
                const previewRaw = String(product.previewImageUrl || "").trim();
                const hasOverride = !!(previewRaw || (overrideRaw && overrideRaw !== defaultRaw));
                const customRaw = previewRaw || (
                  overrideRaw
                  && !product.imageCandidates.some((candidate) => candidate.rawUrl === overrideRaw)
                    ? overrideRaw
                    : ""
                );
                return `
                  <div class="rounded-2xl bg-white border border-slate-100 p-3">
                    <label class="flex items-center gap-3">
                      <input type="checkbox" data-shopping-landing-product="${escapeHtml(product.id)}" class="w-4 h-4 accent-amber-500" style="accent-color:#f97316;" ${checked ? "checked" : ""} />
                      <span class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src="${escapeHtml(image)}" class="w-full h-full object-cover" style="object-position:${escapeHtml(product.objectPosition || "50% 50%")};" loading="lazy" decoding="async" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-xs font-black text-slate-900 truncate">${escapeHtml(product.name)}</span>
                        ${product.price ? `<span class="block text-[10px] font-bold text-slate-400 mt-0.5">${escapeHtml(product.price)}</span>` : ""}
                      </span>
                    </label>
                    ${checked ? `
                      <div class="mt-3 pt-3 border-t border-slate-100">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Card-Bild</span>
                          <div class="flex items-center gap-2">
                            ${hasOverride ? `
                              <button type="button" data-shopping-landing-product-image-reset="${escapeHtml(product.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 active:scale-95">
                                Standard
                              </button>
                            ` : ""}
                            <button type="button" data-shopping-landing-product-image-upload="${escapeHtml(product.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest active:scale-95">
                              Upload
                            </button>
                            <input type="file" accept="image/*" data-shopping-landing-product-image-input="${escapeHtml(product.id)}" class="hidden" />
                          </div>
                        </div>
                        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                          ${product.imageCandidates.map((candidate, imageIndex) => {
                            const isDefault = imageIndex === 0;
                            const selected = previewRaw
                              ? false
                              : (isDefault ? !hasOverride : overrideRaw === candidate.rawUrl);
                            return `
                              <label class="shrink-0 w-16">
                                <input type="radio" name="shoppingLandingProductImage_${escapeHtml(product.id)}" data-shopping-landing-product-image-choice="${escapeHtml(product.id)}" value="${isDefault ? "" : escapeHtml(candidate.rawUrl)}" class="hidden" ${selected ? "checked" : ""} />
                                <span class="block h-16 rounded-2xl overflow-hidden border ${selected ? "border-slate-900" : "border-slate-100"} bg-slate-100">
                                  <img src="${escapeHtml(candidate.imageUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </span>
                                <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">${imageIndex + 1}</span>
                              </label>
                            `;
                          }).join("")}
                          ${customRaw ? `
                            <label class="shrink-0 w-16">
                              <input type="radio" name="shoppingLandingProductImage_${escapeHtml(product.id)}" data-shopping-landing-product-image-choice="${escapeHtml(product.id)}" value="${escapeHtml(customRaw)}" class="hidden" checked />
                              <span class="block h-16 rounded-2xl overflow-hidden border border-slate-900 bg-slate-100">
                                <img src="${escapeHtml(getOptimizedImageUrl(customRaw, "thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                              </span>
                              <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">Upload</span>
                            </label>
                          ` : ""}
                        </div>
                      </div>
                    ` : ""}
                  </div>
                `;
              }).join("")}
            </div>
          ` : `
            <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Produkte</div>
          `}
        </div>

        ${status ? `<div class="text-center text-[10px] font-black uppercase tracking-widest ${statusIsError ? "text-rose-500" : "text-slate-500"}">${escapeHtml(status)}</div>` : ""}

        <button id="shoppingLandingSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${saving ? "disabled" : ""}>
          ${saving ? "Speichern..." : "Landing Card speichern"}
        </button>
      </div>
    </div>
  `;
}

function renderSpecialAdminSection(profile) {
  const isTestfirst = isTestfirstMenuProfile(profile);
  if (!isTestfirst || !isSpecialEnabledForProfile(profile)) return "";
  const specialItems = sortMenuItemsByOrder(
    (state.menu.items || []).filter((item) => resolveMenuCardStyle(item) === "testfirst_special")
  );
  return `
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${escapeHtml(formatCount(specialItems.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${icon("plus", "w-4 h-4")}
        </button>
      </div>
      ${specialItems.length ? `
        <div class="space-y-3">
          ${specialItems.map((item) => {
            const imgUrl = getOptimizedImageUrl(resolveMenuItemHero(item), "thumb");
            const safeImg = isPlaceholderUrl(imgUrl) ? PLACEHOLDER_IMAGE : imgUrl;
            const action = resolveSpecialCardAction(item);
            const actionLabel = action.type === "link"
              ? "Link"
              : (action.type === "product" ? "Produkt-Modal" : "Diese Karte");
            const sizeLabel = resolveSpecialCardSize(item) === "food" ? "Food-Size" : "Normal";
            const sectionLabel = menuSectionLabel(resolveMenuDisplaySection(item));
            return `
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${escapeHtml(safeImg)}" class="w-full h-full object-cover" style="object-position:${getMenuItemObjectPosition(item)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.name || "Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${escapeHtml(sectionLabel)}</span>
                    <span>${escapeHtml(sizeLabel)}</span>
                    <span>${escapeHtml(actionLabel)}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-menu-edit="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-menu-delete="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Special-Karten</div>
      `}
    </div>
  `;
}

function renderMenuOrderSection(items = []) {
  const list = sortMenuItemsByOrder(items).filter((item) => !isMenuItemHidden(item));
  const specialCount = list.filter((item) => resolveMenuCardStyle(item) === "testfirst_special").length;
  if (!list.length || !specialCount) return "";
  return `
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="mb-4">
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Position</span>
        <h3 class="text-xl font-black italic tracking-tighter">Drag &amp; Drop</h3>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nur Special-Karten sind ziehbar. Andere Karten sind Ziel-Positionen.</p>
      </div>
      <div class="space-y-2" data-menu-order-board="true">
        ${list.map((item) => {
          const id = String(item?.id || "").trim();
          const sectionLabel = menuSectionLabel(resolveMenuDisplaySection(item));
          const style = resolveMenuCardStyle(item);
          const isSpecial = style === "testfirst_special";
          const styleLabel = style === "testfirst_focus"
            ? "Focus"
            : (style === "testfirst_special" ? "Special" : (style === "testfirst_food" ? "Food" : "Drink"));
          return `
            <div draggable="${isSpecial ? "true" : "false"}" data-menu-order-item="${escapeHtml(id)}" data-menu-order-draggable="${isSpecial ? "true" : "false"}" class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 flex items-center gap-3 ${isSpecial ? "" : "opacity-70"}">
              <div class="w-8 h-8 rounded-xl bg-white border border-slate-200 ${isSpecial ? "text-slate-500" : "text-slate-300"} flex items-center justify-center shrink-0">
                ${icon("grip-vertical", "w-4 h-4")}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[12px] font-black text-slate-900 truncate">${escapeHtml(item.name || "Produkt")}</p>
                <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">${escapeHtml(sectionLabel)} · ${escapeHtml(styleLabel)}${isSpecial ? " · Drag" : ""}</p>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderFocusCarousel(profile, {
  restaurantId: restaurantIdOverride = "",
  suppressLoading = false,
  allowAutoEnsure = true,
  requirePublicMenuTruth = true
} = {}) {
  const restaurantId = String(restaurantIdOverride || profile?.canonicalRestaurantId || profile?.restaurantId || "").trim();
  if (!restaurantId) return "";
  if (!isRestaurantCafeProfile(profile)) return "";
  const surface = resolveVisiblePublicMenuSurfaceState(state, {
    profile,
    routePayload: state?.profileView?.routePayload,
    webDirectEntry: state?.__webDirectEntry,
    restaurantId
  });
  if (requirePublicMenuTruth && surface.menu.status !== "ready") return "";
  const hasPublicFocusTruth = !requirePublicMenuTruth || surface.focus.canRenderFocus;
  if (allowAutoEnsure && !state.focus.loading && !hasPublicFocusTruth) {
    ensureFocusDataForProfile(buildMenuSurfaceProfile(profile, restaurantId));
  }
  if (requirePublicMenuTruth && !hasPublicFocusTruth) return "";
  const { items, loading } = hasPublicFocusTruth
    ? {
      items: Array.isArray(surface.focus.items) ? surface.focus.items : [],
      loading: surface.focus.loading
    }
    : getFocusStateForRestaurant(restaurantId);
  const enabled = hasPublicFocusTruth ? true : getFocusStateForRestaurant(restaurantId).enabled;
  if (!enabled) return "";
  if (!items.length && !loading) return "";
  if (suppressLoading && loading && !items.length) return "";
  if (loading && !items.length) {
    const focusCardClass = getFocusCardClass();
    return `
      <div class="${focusCardClass} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtml(tr("focus.loading", "Fokus wird geladen..."))}</div>
      </div>
    `;
  }

  const idx = getFocusIndex(items);
  const item = items[idx] || items[0];
  const { safeImg, fallbackImg, imageAttrs, lazyAttrs } = buildResponsiveMenuImageSources(item.imageUrl || "", {
    mode: "profile",
    priorityIndex: 0,
    preferredSize: "medium",
    candidateSizes: ["small", "medium", "large"],
    variant: "hero",
    stableKey: item?.id ? `focus-carousel:${restaurantId}:${String(item.id)}` : ""
  });
  const text = item.text || "";
  const focusCardClass = getFocusCardClass();
  return `
    <div id="focusCarousel" class="${focusCardClass} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${items.length > 1 ? `
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${icon("chevron-left", "w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${icon("chevron-right", "w-4 h-4")}
            </button>
          </div>
        ` : ""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img data-focus-image src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}"${lazyAttrs} class="w-full h-56 object-cover" style="object-position:${getFocusItemObjectPosition(item)};" ${imageAttrs} decoding="async" />
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${escapeHtml(item.title || "Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${text ? "" : "hidden"}">${escapeHtml(text)}</p>
      </div>
      ${items.length > 1 ? `
        <div class="flex items-center justify-center gap-2 mt-4">
          ${items.map((_, dotIdx) => `
            <button type="button" data-focus-dot="${dotIdx}" class="w-2.5 h-2.5 rounded-full ${dotIdx === idx ? "bg-slate-900" : "bg-slate-200"}"></button>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function buildQrImageUrl(value, size = 220) {
  const safe = encodeURIComponent(value || "");
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${safe}`;
}

function renderMenuQrCard({ label, url, caption }) {
  if (!url) return "";
  const qrUrl = buildQrImageUrl(url, 240);
  return `
    <button type="button" data-copy-url="${escapeHtml(url)}" data-copy-label="${escapeHtml(label)}" class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-left active:scale-[0.98] transition-transform">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${escapeHtml(qrUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${escapeHtml(label)}</p>
        ${caption ? `<p class="text-[10px] font-bold text-slate-400 mt-1">${escapeHtml(caption)}</p>` : ""}
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2">Tippen zum Kopieren</p>
      </div>
    </button>
  `;
}

function renderTableQrAdminSection({
  profile,
  restaurantId,
  catalogLabel
}) {
  if (!restaurantId || !isRestaurantCafeProfile(profile)) return "";
  if (typeof ensureTableQrStateForProfile === "function") {
    const current = getTableQrStateForRestaurant ? getTableQrStateForRestaurant(restaurantId) : null;
    if (!current || current.sameRestaurant !== true || (!current.loading && !current.loaded && !current.error)) {
      ensureTableQrStateForProfile(profile);
    }
  }
  const tableQrState = typeof getTableQrStateForRestaurant === "function"
    ? getTableQrStateForRestaurant(restaurantId)
    : { enabled: true, count: 0, tables: [], loading: false, saving: false, error: "" };
  const tableCards = (tableQrState.tables || []).map((tableNumber) => {
    const url = buildUrl("apps/menyra-social/index.html", {
      r: restaurantId,
      tab: "menu",
      source: "qr",
      table: tableNumber
    });
    return renderMenuQrCard({
      label: `Tisch ${tableNumber}`,
      url,
      caption: `${catalogLabel} fuer Tisch ${tableNumber}`
    });
  }).join("");
  return `
    <div class="mt-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Tisch QR</span>
          <h3 class="text-xl font-black italic tracking-tighter">Tische</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gib an, wie viele Tische du hast. Bereits erzeugte Tisch-QR bleiben dauerhaft unter denselben Links.</p>
        </div>
        <label class="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
          <input id="tableQrEnabledToggle" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${tableQrState.enabled !== false ? "checked" : ""} />
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Aktiv</span>
        </label>
      </div>
      <div class="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
        <div class="flex-1">
          <label for="tableQrCountInput" class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Anzahl Tische</label>
          <input id="tableQrCountInput" type="number" min="0" max="200" step="1" inputmode="numeric" value="${escapeHtml(String(tableQrState.count || 0))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button type="button" data-table-qr-save="true" class="h-14 px-6 rounded-[1.6rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-200/60 active:scale-95" ${tableQrState.saving ? "disabled" : ""}>
          ${tableQrState.saving ? "Speichern..." : "Tische speichern"}
        </button>
      </div>
      ${tableQrState.loading ? `<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tisch-QR wird geladen...</p>` : ""}
      ${tableQrState.status ? `<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">${escapeHtml(tableQrState.status)}</p>` : ""}
      ${tableQrState.error ? `<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-rose-500">${escapeHtml(tableQrState.error)}</p>` : ""}
      ${tableCards ? `
        <div class="grid grid-cols-2 gap-4 mt-6">
          ${tableCards}
        </div>
      ` : `
        <div class="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-300">Noch keine Tisch-QR-Codes</p>
        </div>
      `}
    </div>
  `;
}

function renderMenuAdminView() {
  const profile = state.userProfile;
  const restaurantId = profile.restaurantId || "";
  const activeUid = String(state.user?.uid || "").trim();
  const bootstrapInFlightUid = String(state.__authBootstrapInFlightUid || "").trim();
  const isResolvingRestaurantId = !restaurantId
    && !!activeUid
    && (
      !!state.__authProfileLoadPromise
      || bootstrapInFlightUid === activeUid
    );
  const isHotelProfile = isHotelBusinessProfile(profile);
  const isEligible = isRestaurantCafeProfile(profile);
  const publicMenuProfile = state.profileView?.profile?.restaurantId
    ? state.profileView.profile
    : null;
  const canInspectPublicMenu = isCeoUser()
    && !!publicMenuProfile?.restaurantId
    && isRestaurantCafeProfile(publicMenuProfile);
  const isShopProfile = isShopCatalogProfile(profile);
  const catalogLabel = translateCatalogLabel(getBusinessCatalogLabel(profile));
  const restaurant = restaurantId ? getRestaurantMetaById(restaurantId) : null;
  const restaurantName = restaurant?.name || restaurant?.restaurantName || profile.name || "Business";
  const sameRestaurant = restaurantId && state.menu.restaurantId === restaurantId;
  const menuSource = String(state.menu.source || "").trim().toLowerCase();
  const hasAuthoringMenuTruth = !!sameRestaurant && menuSource === "collection";
  const isAuthoringMenuLoading = !!sameRestaurant && menuSource === "collection" && state.menu.loading;
  const isLoading = !!restaurantId && (isAuthoringMenuLoading || !hasAuthoringMenuTruth);
  const effectiveMenuFilter = isShopProfile ? "all" : state.menu.filter;
  const rawItems = hasAuthoringMenuTruth
    ? getFilteredMenuItems(state.menu.items, { filter: effectiveMenuFilter, query: state.menu.query })
    : [];
  const specialEnabled = isSpecialEnabledForProfile(profile);
  const scopedItems = specialEnabled
    ? rawItems
    : rawItems.filter((item) => !isSpecialMenuItem(item));
  const items = sortMenuItemsByOrder(scopedItems);
  const countLabel = formatCount(items.length);

  if (restaurantId && isHotelProfile) {
    seedHotelEditorOfferStateFromRecord(profile);
    const focusTruthSource = String(state.focus?.truthSource || "").trim().toLowerCase();
    if (!state.focus.loading && (state.focus.restaurantId !== restaurantId || focusTruthSource !== "public-menu")) {
      ensureFocusDataForProfile(profile);
    }
    return renderHotelCardAdminView(profile);
  }

  if (restaurantId && isEligible && !hasAuthoringMenuTruth && !isAuthoringMenuLoading) {
    ensureEditorMenuDataForProfile(profile);
  }

  if (restaurantId && isEligible && !state.focus.loading && state.focus.restaurantId !== restaurantId) {
    ensureFocusDataForProfile(profile);
  }
  if (restaurantId && isAdsAdminProfile(profile)) {
    ensureAdsDataForProfile(profile);
  }

  if (!isEligible) {
    if (canInspectPublicMenu) {
      return renderProfileMenuView(publicMenuProfile);
    }
    return `
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${icon("lock", "w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${catalogLabel}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${catalogLabel}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${escapeHtml(restaurantName)}</p>
        </div>
      </div>

      ${restaurantId ? `
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${escapeHtml(countLabel)}</p>
          </div>
        </div>
      ` : (isResolvingRestaurantId ? `
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Business wird geladen...</p>
        </div>
      ` : `
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500 mb-4">Bitte zuerst dein Business im Account auswaehlen.</p>
          <button data-nav="settings" class="px-5 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Zu den Einstellungen</button>
        </div>
      `)}

      ${restaurantId ? renderFocusAdminSection(restaurantId) : ""}
      ${restaurantId ? renderAdsAdminSection(profile, restaurantId) : ""}
      ${restaurantId ? renderShoppingLandingCardAdminSection(profile, restaurantId, hasAuthoringMenuTruth ? state.menu.items : []) : ""}
      ${restaurantId && hasAuthoringMenuTruth ? renderSpecialAdminSection(profile) : ""}

      ${restaurantId ? `
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${icon("search", "w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${escapeHtml(state.menu.query || "")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${renderMenuFilterRow()}

        ${isLoading
          ? `<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtml(tr("menu.loading", `${catalogLabel} wird geladen...`, { label: catalogLabel }))}</div>`
          : renderMenuList(items, { mode: "admin" })
        }
        ${state.menu.error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${escapeHtml(state.menu.error)}</div>` : ""}
        ${renderTableQrAdminSection({ profile, restaurantId, catalogLabel })}
      ` : ""}

    </div>
  `;
}

function renderProfileMenuView(profile, { mode = "profile", allowAutoEnsure = true } = {}) {
  const routePayload = state?.profileView?.routePayload && typeof state.profileView.routePayload === "object"
    ? state.profileView.routePayload
    : null;
  const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object" && state.__webDirectEntry.active === true
    ? state.__webDirectEntry
    : null;
  let menuSurfaceState = resolveVisiblePublicMenuSurfaceState(state, {
    profile,
    routePayload,
    webDirectEntry
  });
  const restaurantId = menuSurfaceState.restaurantId || resolveMenuSurfaceRestaurantId(profile, routePayload);
  if (!restaurantId) {
    return `
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${escapeHtml(tr("menu.noRestaurantId", "Keine Restaurant-ID gefunden"))}
      </div>
    `;
  }
  const surfaceProfile = buildMenuSurfaceProfile(profile, restaurantId);
  const isShop = isShopCatalogProfile(surfaceProfile);
  const shouldCoordinateMenuWithFocus = isRestaurantCafeProfile(surfaceProfile) && !isShop;
  if (shouldCoordinateMenuWithFocus) {
    menuSurfaceState = resolveVisiblePublicMenuSurfaceState(state, {
      profile: surfaceProfile,
      routePayload,
      webDirectEntry,
      restaurantId,
      coordinateFocusWithMenu: true
    });
  }
  const webDirectEntryRestaurantId = String(
    webDirectEntry?.canonicalRestaurantId
    || webDirectEntry?.restaurantId
    || ""
  ).trim();
  const webDirectSurfaceTargetIds = new Set(menuSurfaceState.targetIds);
  const currentFocusTruth = normalizePublicMenuTruthState(menuSurfaceState.focus.truthState || "");
  const hasConfirmedPublicMenuItems = menuSurfaceState.menu.status === "ready";
  const hasPublicFocusTruth = menuSurfaceState.focus.canRenderFocus;
  const shouldCoordinatePublicFocus = hasConfirmedPublicMenuItems && shouldCoordinateMenuWithFocus;
  const focusLoadingForSurface = menuSurfaceState.focus.matches === true && menuSurfaceState.focus.loading === true;
  const menuAccessSource = String(
    state?.profileView?.menuAccessSource
    || webDirectEntry?.menuAccessSource
    || routePayload?.menuAccessSource
    || ""
  ).trim().toLowerCase();
  const isQrMenuAccess = menuAccessSource === "qr";
  const isWebDirectFirstVisibleMenuPath = webDirectEntry?.active === true
    && webDirectEntry?.webPriority === true
    && webDirectEntry?.menuFirst === true
    && String(state?.activeTab || "").trim().toLowerCase() === "profile"
    && String(state?.profileTopTab || "").trim().toLowerCase() === "menu"
    && (
      webDirectEntryRestaurantId === restaurantId
      || webDirectSurfaceTargetIds.has(restaurantId)
    );
  const isNormalWebDirectFirstVisibleMenuPath = isWebDirectFirstVisibleMenuPath && !isQrMenuAccess;
  const hasSettledPublicMenuTruth = ["ready", "empty", "error"].includes(menuSurfaceState.menu.status);
  const skipFirstVisibleMenuEnsure = isWebDirectFirstVisibleMenuPath
    && hasSettledPublicMenuTruth;
  const skipFirstVisibleFocusEnsure = isWebDirectFirstVisibleMenuPath
    && (!shouldCoordinatePublicFocus || menuSurfaceState.menu.status !== "ready");
  const hasSettledFocusTruth = !shouldCoordinatePublicFocus
    || menuSurfaceState.focus.settled === true
    || currentFocusTruth === "knownEmpty"
    || menuSurfaceState.menu.status !== "ready";
  if (allowAutoEnsure && !skipFirstVisibleMenuEnsure && !hasSettledPublicMenuTruth) {
    ensureMenuDataForProfile(surfaceProfile);
  }
  if (
    allowAutoEnsure
    && !skipFirstVisibleFocusEnsure
    && !hasSettledFocusTruth
    && !focusLoadingForSurface
    && hasConfirmedPublicMenuItems
    && (!isNormalWebDirectFirstVisibleMenuPath || hasSettledPublicMenuTruth)
  ) {
    ensureFocusDataForProfile(surfaceProfile);
  }
  // Public focus keeps its own reserved slot. The menu body must render as soon
  // as its public truth is ready, even while focus truth is still loading.
  const canRenderCoordinatedMenu = menuSurfaceState.menu.canRenderItems;
  const items = canRenderCoordinatedMenu
    ? sortMenuItemsByOrder(getFilteredMenuItems(menuSurfaceState.menu.items, { filter: "all", query: "" }))
      .filter((item) => !isMenuItemHidden(item))
    : [];
  const hasItems = items.length > 0;
  const error = menuSurfaceState.menu.error || "";
  const hasError = !!String(error || "").trim();
  const isLoading = menuSurfaceState.menu.status === "loading";
  const drinkItems = items.filter((item) => resolveMenuDisplaySection(item) === "drink");
  const foodItems = items.filter((item) => resolveMenuDisplaySection(item) !== "drink");
  const drinkPriorityOffset = 0;
  const foodPriorityOffset = drinkItems.length;
  const useTestfirstCardUi = isTestfirstMenuProfile(profile);
  const useHighlightFocusUi = useTestfirstCardUi || isShop;
  const anchoredCategories = new Set();
  if (hasItems && restaurantId) {
    primeMenuItemCounts(items, restaurantId);
    maybeHydrateMenuCardViewerLikes(items, restaurantId);
  }
  const testfirstFocusItemsFromState = restaurantId && hasPublicFocusTruth
    ? (() => {
      return (Array.isArray(menuSurfaceState.focus.items) ? menuSurfaceState.focus.items : [])
        .map((item) => buildFocusCardItem({
          ...item,
          objectPosition: getFocusItemObjectPosition(item)
        }))
        .filter(Boolean);
    })()
    : [];
  const hasUnavailablePublicFocus = currentFocusTruth === "knownEmpty"
    || menuSurfaceState.focus.status === "empty"
    || menuSurfaceState.focus.status === "error";
  const shouldReservePublicFocusSpace = shouldCoordinateMenuWithFocus
    && !hasPublicFocusTruth
    && !hasUnavailablePublicFocus
    && menuSurfaceState.menu.status !== "empty"
    && menuSurfaceState.menu.status !== "error";
  const testfirstStableFocusSection = testfirstFocusItemsFromState.length
    ? renderTestfirstFocusSection(surfaceProfile, testfirstFocusItemsFromState, { mode })
    : (shouldReservePublicFocusSpace ? renderTestfirstFocusSkeleton() : "");
  const standardFocusSection = useHighlightFocusUi
    ? testfirstStableFocusSection
    : (renderFocusCarousel(surfaceProfile, {
      restaurantId,
      suppressLoading: true,
      allowAutoEnsure: hasConfirmedPublicMenuItems && (!isNormalWebDirectFirstVisibleMenuPath || hasSettledPublicMenuTruth),
      requirePublicMenuTruth: true
    }) || (shouldReservePublicFocusSpace ? renderFocusCarouselSkeleton() : ""));
  if (useTestfirstCardUi) {
    return `
      <div class="app-main-content-safe">
        ${isLoading ? `
          ${testfirstStableFocusSection}
          ${renderTestfirstMenuSkeleton()}
        ` : `
          ${hasItems
            ? renderTestfirstMenuContent(surfaceProfile, items, {
              mode,
              publicMenuSurfaceState: menuSurfaceState,
              focusFallbackHtml: testfirstStableFocusSection
            })
            : (hasError
              ? `<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${escapeHtml(tr("menu.loadError", "Menu konnte nicht geladen werden"))}</div>`
              : (testfirstStableFocusSection || `<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">${escapeHtml(tr("menu.noProducts", "Keine Produkte"))}</div>`))
          }
          ${error ? `<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${escapeHtml(error)}</div>` : ""}
        `}
      </div>
    `;
  }
  return `
    <div class="app-content-inline app-main-content-safe space-y-5">
      ${standardFocusSection}
      ${isLoading ? `
        ${renderStandardMenuSkeleton({ isShop })}
      ` : `
        ${!hasItems ? `
          ${hasError ? `
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                ${escapeHtml(tr("menu.loadError", "Menu konnte nicht geladen werden"))}
              </div>
            </div>
          ` : `
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${escapeHtml(tr("menu.noProducts", "Keine Produkte"))}
              </div>
            </div>
          `}
        ` : `
          ${isShop ? `
            ${renderShopProductList(items, { profile })}
          ` : `
            ${drinkItems.length ? `
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${escapeHtml(tr("menu.drinks", "Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${renderMenuDrinkGrid(drinkItems, { mode, useTestfirstCardUi, seenCategories: anchoredCategories, priorityOffset: drinkPriorityOffset })}
                </div>
              </section>
            ` : ""}
            ${foodItems.length ? `
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${escapeHtml(tr("menu.food", "Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${renderMenuFoodList(foodItems, { mode, useTestfirstCardUi, seenCategories: anchoredCategories, priorityOffset: foodPriorityOffset })}
                </div>
              </section>
            ` : ""}
          `}
        `}
        ${error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${escapeHtml(error)}</div>` : ""}
      `}
    </div>
  `;
}

function renderProfileView() {
  const profile = state.userProfile;
  const isBusiness = isLocalBusinessProfile(profile);
  const posts = isBusiness ? state.businessPosts : state.userPosts;
  const activeUid = String(state.user?.uid || profile?.uid || "").trim();
  const activeRestaurantId = String(profile?.restaurantId || "").trim();
  const userPostsLoadingUid = String(state.__userPostsLoadingUid || "").trim();
  const businessPostsLoadingRestaurantId = String(state.__businessPostsLoadingRestaurantId || "").trim();
  const bootstrapInFlightUid = String(state.__authBootstrapInFlightUid || "").trim();
  const isUserPostsLoading = !!activeUid && userPostsLoadingUid === activeUid;
  const isBusinessPostsLoading = !!activeRestaurantId && businessPostsLoadingRestaurantId === activeRestaurantId;
  const isBootstrapPendingForProfile = !!activeUid && bootstrapInFlightUid === activeUid;
  const isPostsLoading = isBusiness
    ? (isBusinessPostsLoading || (isBootstrapPendingForProfile && !posts.length))
    : (isUserPostsLoading || (isBootstrapPendingForProfile && !posts.length));
  const handle = String(profile.handle || normalizeHandle(profile.name || "user")).replace(/^@/, "");
  const safeBio = escapeHtml(profile.bio || "").replace(/\n/g, "<br>");
  const bioHtml = safeBio || escapeHtml(tr("profile.noBio", "Noch keine Bio."));
  const activeContentTab = resolveProfileContentTabForRendering(profile);
  const isMenuTab = activeContentTab === "menu";
  const isCheckinTab = activeContentTab === "checkins";
  const filteredPosts = posts;
  const avatarUrl = getOptimizedImageUrl(profile.avatar, "avatar");
  const avatarFit = logoFitClass(isBusiness);
  const topTab = resolveProfilePrimaryTopTab(profile);
  const topPaddingClass = isBusiness ? "pt-2" : "pt-10";
  return `
    <div class="app-main-content-safe">
      ${topTab === "profile" || topTab === "menu" ? `
      <div class="app-content-inline pb-2 ${topPaddingClass}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${isBusiness ? renderBusinessProfileIdentityCard(profile, {
          mode: "self",
          avatarUrl,
          avatarFit,
          followersLabel: formatCount(profile.followers),
          bioHtml
        }) : `
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${escapeHtml(avatarUrl)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${avatarFit} border-2 border-white" />
                </div>
                ${profile.isPremium ? `
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${icon("badge-check", "w-4 h-4 fill-blue-500 text-white")}
                  </div>
                ` : ""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(formatCount(profile.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${escapeHtml(tr("profile.fans", "Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(formatCount(profile.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${escapeHtml(tr("profile.followingCount", "Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${escapeHtml(profile.name || "User")}</h1>
              ${isBusiness ? "" : `<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${escapeHtml(handle)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${bioHtml}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${escapeHtml(profile.location || "-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${icon("plus", "w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${icon("settings", "w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
        `}
      </div>

      ${renderProfileTabs(profile)}
      ${renderProfileViewControls(profile)}

      ${isMenuTab ? `
        ${isHotelBusinessProfile(profile) ? renderHotelDetailsView(profile) : renderProfileMenuView(profile)}
      ` : isCheckinTab ? `
        ${renderProfileCheckins()}
      ` : `
        ${isPostsLoading && !filteredPosts.length ? `
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtml(tr("profile.postsLoading", "Beitraege werden geladen..."))}</div>
            </div>
          </div>
        ` : `
          <div class="${state.profileViewMode === "grid" ? "grid grid-cols-2 gap-4 app-content-inline grid-flow-dense" : "flex flex-col gap-8 app-content-inline"}">
            ${renderProfilePostsFancy(filteredPosts, state.profileViewMode)}
          </div>
          ${activeContentTab === "posts" ? `
            <div class="app-content-inline mt-8 mb-4">
              <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  ${icon("plus", "w-4 h-4")} Neuen Beitrag
                </span>
                <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          ` : ""}
        `}
      `}
      ` : `
        ${topTab === "cart"
          ? renderProfileShopCartView(profile)
          : (topTab === "favorites" ? renderProfileShopFavoritesView(profile) : "")}
      `}
    </div>
  `;
}

  return {
    renderProfilePostCardFancy,
    renderProfilePostsFancy,
    renderProfileCheckins,
    renderProfileTabs,
    renderProfileViewControls,
    renderPublicProfileView,
    renderMenuFilterRow,
    renderMenuLayoutSection,
    renderMenuItemCard,
    renderMenuItemCardStacked,
    renderMenuDrinkGrid,
    renderMenuFoodList,
    renderMenuList,
    renderFocusAdminSection,
    renderFocusCarousel,
    renderMenuQrCard,
    renderMenuAdminView,
    renderProfileMenuView,
    renderProfileView
  };
}

