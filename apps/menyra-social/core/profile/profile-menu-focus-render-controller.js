import { normalizeMenuCardStyleCore } from "../menu/menu-card-style-utils.js";

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
  const ensureMenuDataForProfile = deps.ensureMenuDataForProfileFn;
  const ensureFocusDataForProfile = deps.ensureFocusDataForProfileFn;
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
  const getMenuItemImages = deps.getMenuItemImagesFn;
  const getMenuItemObjectPosition = deps.getMenuItemObjectPositionFn;
  const getMenuItemSocialId = deps.getMenuItemSocialIdFn;
  const menuItemMetaKey = deps.menuItemMetaKeyFn;
  const ensureMenuItemMeta = deps.ensureMenuItemMetaFn;
  const resolveMenuItemCounts = deps.resolveMenuItemCountsFn;
  const getFocusStateForRestaurant = deps.getFocusStateForRestaurantFn;
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

function renderProfilePostCardFancy(item, isGrid, allowMenu = true) {
  const counts = resolvePostCounts(item);
  const postId = item.id ? String(item.id) : "";
  const postAttr = postId ? `data-open-post="${escapeHtml(postId)}"` : "";
  const likeAttr = postId ? `data-post-like-count="${escapeHtml(postId)}"` : "";
  const commentAttr = postId ? `data-post-comment-count="${escapeHtml(postId)}"` : "";
  const imgKeyAttr = postId ? `data-img-key="profile-post:${escapeHtml(postId)}"` : "";
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

function renderProfilePostsFancy(posts, viewMode, allowMenu = true) {
  const isGrid = viewMode === "grid";
  if (!posts.length) {
    return `
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${icon("image", "w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">Keine Inhalte gefunden</p>
      </div>
    `;
  }
  const cards = posts.map((post) => renderProfilePostCardFancy(post, isGrid, allowMenu));
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
      <div class="px-6 app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${icon("map-pin", "w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">Keine Check-ins gefunden</p>
      </div>
    `;
  }
  return `
    <div class="px-6 flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
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
  const restaurantId = String(profile?.restaurantId || "").trim();
  if (restaurantId) return true;
  return String(profile?.role || "").trim().toLowerCase() === "business";
}

function resolveProfileContentTabForRendering(profile = {}) {
  const requestedTopTab = String(state.profileTopTab || "").trim().toLowerCase();
  const requestedContentTab = String(state.profileContentTab || "").trim().toLowerCase();
  if (isBusinessProfileEntity(profile)) {
    if (requestedTopTab === "menu") return "menu";
    if (requestedContentTab === "media" || requestedContentTab === "menu" || requestedContentTab === "posts") {
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
    if (requestedTopTab === "cart" || requestedTopTab === "favorites") {
      return requestedTopTab;
    }
    return "profile";
  }
  if (requestedTopTab === "favorites" && String(state.user?.uid || "").trim()) {
    return "favorites";
  }
  return "profile";
}

function renderProfileTabs(profile = state.profileView?.profile || state.userProfile) {
  const isBusinessProfile = isBusinessProfileEntity(profile);
  const activeTab = resolveProfileContentTabForRendering(profile);
  const tabs = isBusinessProfile
    ? [
      { id: "posts", label: "Beitraege" },
      { id: "menu", label: "Menue" },
      { id: "media", label: "Medien" }
    ]
    : [
      { id: "posts", label: "Beitraege" },
      { id: "media", label: "Medien" },
      { id: "checkins", label: "Check-ins" }
    ];
  return `
    <div class="px-6 mb-6 mt-4">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${tabs.map((tab) => `
          <button data-profile-tab="${tab.id}" class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab.id ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
            ${tab.label}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderProfileViewControls(profile = state.profileView?.profile || state.userProfile) {
  const activeTab = resolveProfileContentTabForRendering(profile);
  if (activeTab === "checkins" || activeTab === "menu") return "";
  return `
    <div class="flex items-center justify-between px-8 mb-6">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Ansicht</span>
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

function renderPublicProfileView() {
  const view = state.profileView;
  if (!view || !view.profile) return "";
  const profile = view.profile;
  const posts = view.posts || profile.posts || [];
  const isFollowing = isFollowingProfile(profile);
  const isLocked = !!profile.privateAccount && profile.uid && String(profile.uid) !== String(state.user?.uid || "") && !isFollowing;
  const hasPendingFollowRequest = !!profile.pendingFollowRequest && !isFollowing;
  const typeLabel = profile.restaurantId ? "Business" : "User";
  const handle = String(profile.handle || normalizeHandle(profile.name || "user")).replace(/^@/, "");
  const safeBio = escapeHtml(profile.bio || "").replace(/\n/g, "<br>");
  const bioHtml = safeBio || "Noch keine Bio.";
  const isBusinessProfile = isBusinessProfileEntity(profile);
  const activeContentTab = resolveProfileContentTabForRendering(profile);
  const isMediaTab = activeContentTab === "media";
  const isMenuTab = activeContentTab === "menu";
  const isCheckinTab = activeContentTab === "checkins";
  const filteredPosts = isMediaTab ? posts.filter((p) => p.isVideo) : posts;
  const avatarUrl = getOptimizedImageUrl(profile.avatar, "avatar");
  const avatarFit = logoFitClass(!!profile.restaurantId);
  const avatarKey = profile.uid || profile.restaurantId || handle || "public";
  const topTab = resolveProfilePrimaryTopTab(profile);
  const topPaddingClass = isBusinessProfile ? (topTab === "profile" ? "pt-2" : "pt-4") : "pt-10";
  const followLabel = isFollowing ? "Following" : (hasPendingFollowRequest ? "Requested" : (isLocked ? "Request" : "Follow"));
  const followTone = isFollowing
    ? "bg-slate-100 text-slate-600 shadow-none border border-slate-200"
    : (hasPendingFollowRequest
      ? "bg-amber-50 text-amber-700 shadow-none border border-amber-200"
      : "bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent");
  return `
    <div class="app-main-content-safe">
      ${topTab === "profile" ? `
      <div class="px-5 pb-2 ${topPaddingClass}">

        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div class="relative">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${escapeHtml(avatarUrl)}" decoding="async" width="100" height="100" data-img-key="avatar:public:${escapeHtml(avatarKey)}" class="w-full h-full rounded-[1.8rem] ${avatarFit} border-2 border-white" />
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
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Fans</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(formatCount(profile.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Folgt</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${escapeHtml(profile.name || "User")}</h1>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${escapeHtml(handle)}</p>
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${bioHtml}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${escapeHtml(profile.location || "-")} / ${typeLabel}</p>
            </div>

            <div class="flex gap-4">
              <button data-public-profile-follow="${escapeHtml(profile.handle)}" data-target-type="${escapeHtml(profile.restaurantId ? "restaurant" : (profile.uid ? "user" : ""))}" data-target-id="${escapeHtml(profile.restaurantId || profile.uid || "")}" data-target-name="${escapeHtml(profile.name || "")}" data-target-avatar="${escapeHtml(profile.avatar || "")}" ${hasPendingFollowRequest ? "disabled" : ""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${followTone} ${hasPendingFollowRequest ? "opacity-90 cursor-default" : ""}">
                <span class="relative z-10 flex items-center gap-2">
                  ${isFollowing ? icon("check", "w-4 h-4") : ""}
                  ${followLabel}
                </span>
              </button>
              <button data-open-chat="profile" data-chat-uid="${escapeHtml(profile.uid || "")}" data-chat-handle="${escapeHtml(profile.handle || "")}" data-chat-name="${escapeHtml(profile.name || "")}" data-chat-avatar="${escapeHtml(profile.avatar || "")}" ${isLocked ? "disabled" : ""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${isLocked ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${icon("message-circle", "w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
      </div>

      ${!isLocked ? `
        ${renderProfileTabs(profile)}
        ${renderProfileViewControls(profile)}

        ${isMenuTab ? `
          ${renderProfileMenuView(profile)}
        ` : isCheckinTab ? `
          ${renderProfileCheckins()}
        ` : `
          <div class="${state.profileViewMode === "grid" ? "grid grid-cols-2 gap-4 px-6 grid-flow-dense" : "flex flex-col gap-8 px-6"}">
            ${renderProfilePostsFancy(filteredPosts, state.profileViewMode, false)}
          </div>
        `}
      ` : `
        <div class="px-6 pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${icon("lock", "w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Privates Profil</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">Folgen muss zuerst akzeptiert werden</p>
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
  return String(item?.category || "Sonstiges").trim() || "Sonstiges";
}

function normalizeMenuCategoryToken(value = "") {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const folded = typeof raw.normalize === "function"
    ? raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    : raw;
  return folded.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const CRITICAL_MENU_IMAGE_COUNT = 2;
const MENU_IMAGE_WIDTH_BY_SIZE = {
  thumb: 160,
  small: 480,
  medium: 768,
  large: 1280
};

function isCriticalMenuImage({ mode = "profile", priorityIndex = -1, slideIndex = 0 } = {}) {
  return mode === "profile"
    && Number.isFinite(priorityIndex)
    && priorityIndex >= 0
    && priorityIndex < CRITICAL_MENU_IMAGE_COUNT
    && slideIndex === 0;
}

function buildMenuImageAttrs({ mode = "profile", priorityIndex = -1, slideIndex = 0 } = {}) {
  const isCritical = isCriticalMenuImage({ mode, priorityIndex, slideIndex });
  const revealAttr = `data-image-reveal="menu"`;
  return isCritical
    ? `loading="eager" fetchpriority="high" ${revealAttr}`
    : `loading="lazy" fetchpriority="low" ${revealAttr}`;
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
  const filter = state.menu.filter || "all";
  const isShop = isShopCatalogProfile(state.userProfile);
  const labels = isShop
    ? [
      { id: "all", label: "Alle" },
      { id: "food", label: "Produkte" },
      { id: "drink", label: "Varianten" }
    ]
    : [
      { id: "all", label: "Alle" },
      { id: "food", label: "Speisen" },
      { id: "drink", label: "Getraenke" }
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
  const priceLabel = formatPrice(item.price);
  const catalogProfile = state.activeTab === "menu" ? state.userProfile : (state.profileView?.profile || state.userProfile);
  const isShopMode = isShopCatalogProfile(catalogProfile);
  const typeLabel = isShopMode
    ? (normalizeMenuType(item.type) === "drink" ? "Variante" : "Produkt")
    : (normalizeMenuType(item.type) === "drink" ? "Getraenk" : "Speise");
  const category = item.category || "";
  const desc = item.description || "";
  if (mode === "admin") {
    return `
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}"${lazyAttrs} class="w-full h-full object-cover" style="object-position:${getMenuItemObjectPosition(item)};" ${imageAttrs} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.name || "Produkt")}</p>
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
          <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.name || "Produkt")}</p>
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
  const priceLabel = formatPrice(item.price);
  const catalogProfile = state.activeTab === "menu" ? state.userProfile : (state.profileView?.profile || state.userProfile);
  const isShopMode = isShopCatalogProfile(catalogProfile);
  const typeLabel = isShopMode
    ? (normalizeMenuType(item.type) === "drink" ? "Variante" : "Produkt")
    : (normalizeMenuType(item.type) === "drink" ? "Getraenk" : "Speise");
  const category = item.category || "";
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
          <p class="text-sm font-black text-slate-900 leading-snug">${escapeHtml(item.name || "Produkt")}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${escapeHtml(priceLabel)}</p>
          ${countsRow}
        </div>
      ` : `
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${escapeHtml(item.name || "Produkt")}</p>
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
  return {
    id: item.id || "",
    title: item.name || item.title || "Sot ne Fokus",
    text: item.description || item.text || "",
    imageUrl: resolveMenuItemHero(item) || item.imageUrl || "",
    objectPosition: item.objectPosition || getMenuItemObjectPosition(item),
    menuItemId: String(menuItemId || "").trim()
  };
}

function renderTestfirstFocusSection(profile, focusItems = [], { mode = "profile" } = {}) {
  const restaurantId = profile?.restaurantId || "";
  if (!restaurantId || !isTestfirstMenuProfile(profile) || !focusItems.length) return "";
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
  const priceLabel = formatPrice(item.price);
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
  const priceLabel = formatPrice(item.price);
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
            <span>Hinzufuegen</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${icon("plus", "w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderTestfirstMenuContent(profile, items, { mode = "profile" } = {}) {
  const allItems = sortMenuItemsByOrder(Array.isArray(items) ? items : []);
  const restaurantId = String(profile?.restaurantId || "").trim();
  const focusState = restaurantId
    ? getFocusStateForRestaurant(restaurantId)
    : { items: [], enabled: false };
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
            <div class="grid grid-cols-2 auto-rows-fr gap-3 px-5">
              ${renderMenuItemsWithCategoryAnchors(bucket.gridItems, (item) => renderGridCard(item, nextPriorityIndex()), anchoredCategories)}
            </div>
          </div>
        ` : ""}
        ${bucket.foodItems.length ? `
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${escapeHtml(menuType)}">
            <div class="px-5">
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
      ${renderTestfirstFocusSection(profile, displayFocusItems, { mode })}
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
          : `<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Keine Eintraege</div>`
        }
      </div>
    `;
    return `
      <div>
        ${renderSection("Getraenke", drinkItems, { addType: "drink" })}
        ${renderSection("Speisen", foodItems, { addType: "food" })}
      </div>
    `;
  }
  if (!items.length) {
    return `
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
        Keine Produkte
      </div>
    `;
  }
  return `
    <div class="space-y-4">
      ${items.map((item, index) => renderMenuItemCard(item, { mode, priorityIndex: index })).join("")}
    </div>
  `;
}

function renderFocusAdminSection(restaurantId) {
  if (!restaurantId) return "";
  const { items, enabled, loading } = getFocusStateForRestaurant(restaurantId, { includeInactive: true });
  const countLabel = formatCount(items.length);
  return `
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
          <h3 class="text-xl font-black italic tracking-tighter">Highlights</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${escapeHtml(countLabel)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${icon("plus", "w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">Im Fokus anzeigen</p>
          <p class="text-[10px] font-bold text-slate-400">Im Profil sichtbar</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${enabled ? "checked" : ""} />
      </label>

      ${loading ? `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fokus wird geladen...</div>
      ` : items.length ? `
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
      ` : `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Fokus-Eintraege</div>
      `}
    </div>
  `;
}

function renderSpecialAdminSection(profile) {
  const isTestfirst = isTestfirstMenuProfile(profile);
  if (!isTestfirst) return "";
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
            const sectionLabel = resolveMenuDisplaySection(item) === "drink" ? "Getraenke" : "Speisen";
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
          const sectionLabel = resolveMenuDisplaySection(item) === "drink" ? "Getraenke" : "Speisen";
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

function renderFocusCarousel(profile) {
  const restaurantId = profile?.restaurantId || "";
  if (!restaurantId) return "";
  if (!isRestaurantCafeProfile(profile)) return "";
  if (!state.focus.loading && state.focus.restaurantId !== restaurantId) {
    ensureFocusDataForProfile(profile);
  }
  const { items, enabled, loading } = getFocusStateForRestaurant(restaurantId);
  if (!enabled) return "";
  if (!items.length && !loading) return "";
  if (loading && !items.length) {
    const focusCardClass = getFocusCardClass();
    return `
      <div class="${focusCardClass} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fokus wird geladen...</div>
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
  const isEligible = isRestaurantCafeProfile(profile);
  const publicMenuProfile = state.profileView?.profile?.restaurantId
    ? state.profileView.profile
    : null;
  const canInspectPublicMenu = isCeoUser()
    && !!publicMenuProfile?.restaurantId
    && isRestaurantCafeProfile(publicMenuProfile);
  const catalogLabel = getBusinessCatalogLabel(profile);
  const restaurant = restaurantId ? getRestaurantMetaById(restaurantId) : null;
  const restaurantName = restaurant?.name || restaurant?.restaurantName || profile.name || "Business";
  const sameRestaurant = restaurantId && state.menu.restaurantId === restaurantId;
  const menuSource = String(state.menu.source || "").trim().toLowerCase();
  const hasAuthoringMenuTruth = !!sameRestaurant && menuSource === "collection";
  const isLoading = restaurantId && (state.menu.loading || !hasAuthoringMenuTruth);
  const rawItems = hasAuthoringMenuTruth
    ? getFilteredMenuItems(state.menu.items, { filter: state.menu.filter, query: state.menu.query })
    : [];
  const items = sortMenuItemsByOrder(rawItems);
  const countLabel = formatCount(items.length);
  const profileUrl = restaurantId ? buildUrl("apps/menyra-social/index.html", { r: restaurantId }) : "";
  const menuUrl = restaurantId
    ? buildUrl("apps/menyra-social/index.html", { r: restaurantId, tab: "menu", source: "qr" })
    : "";

  if (restaurantId && isEligible && !state.focus.loading && state.focus.restaurantId !== restaurantId) {
    ensureFocusDataForProfile(profile);
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
      ` : `
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500 mb-4">Bitte zuerst dein Business im Account auswaehlen.</p>
          <button data-nav="settings" class="px-5 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Zu den Einstellungen</button>
        </div>
      `}

      ${restaurantId ? renderFocusAdminSection(restaurantId) : ""}
      ${restaurantId ? renderSpecialAdminSection(profile) : ""}

      ${restaurantId ? `
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${icon("search", "w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${escapeHtml(state.menu.query || "")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${renderMenuFilterRow()}

        ${isLoading
          ? `<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${catalogLabel} wird geladen...</div>`
          : renderMenuList(items, { mode: "admin" })
        }
        ${state.menu.error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${escapeHtml(state.menu.error)}</div>` : ""}
      ` : ""}

      ${restaurantId ? `
        <div class="mt-10">
          <div class="flex items-end justify-between mb-4">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">QR Codes</span>
              <h3 class="text-xl font-black italic tracking-tighter">Teilen</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direkt zum Profil oder zu ${catalogLabel}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            ${renderMenuQrCard({ label: "Profil", url: profileUrl, caption: "Social Profil" })}
            ${renderMenuQrCard({ label: catalogLabel, url: menuUrl, caption: `${catalogLabel} & Preise` })}
          </div>
          ${renderTableQrAdminSection({ profile, restaurantId, catalogLabel })}
        </div>
      ` : ""}
    </div>
  `;
}

function renderProfileMenuView(profile) {
  const restaurantId = profile?.restaurantId || "";
  if (!restaurantId) {
    return `
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        Keine Restaurant-ID gefunden
      </div>
    `;
  }
  const isSameRestaurant = state.menu.restaurantId === restaurantId;
  const menuSource = String(state.menu.source || "").trim().toLowerCase();
  const hasPublicMenuTruth = isSameRestaurant && menuSource === "public";
  if (!state.menu.loading && !hasPublicMenuTruth) {
    ensureMenuDataForProfile(profile);
  }
  if (!state.focus.loading && state.focus.restaurantId !== restaurantId) {
    ensureFocusDataForProfile(profile);
  }
  const isLoading = state.menu.loading || !hasPublicMenuTruth;
  const items = hasPublicMenuTruth
    ? sortMenuItemsByOrder(getFilteredMenuItems(state.menu.items, { filter: "all", query: "" }))
      .filter((item) => !isMenuItemHidden(item))
    : [];
  const isShop = isShopCatalogProfile(profile);
  const catalogLabel = getBusinessCatalogLabel(profile);
  const error = hasPublicMenuTruth ? state.menu.error : "";
  const drinkItems = items.filter((item) => resolveMenuDisplaySection(item) === "drink");
  const foodItems = items.filter((item) => resolveMenuDisplaySection(item) !== "drink");
  const drinkPriorityOffset = 0;
  const foodPriorityOffset = drinkItems.length;
  const useTestfirstCardUi = isTestfirstMenuProfile(profile);
  const hasItems = items.length > 0;
  const anchoredCategories = new Set();
  if (hasItems && restaurantId) {
    primeMenuItemCounts(items, restaurantId);
    maybeHydrateMenuCardViewerLikes(items, restaurantId);
  }
  if (useTestfirstCardUi) {
    return `
      <div class="app-main-content-safe">
        ${isLoading ? `
          <div class="px-5 pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtml(catalogLabel)} wird geladen...</div>
        ` : `
          ${hasItems
            ? renderTestfirstMenuContent(profile, items, { mode: "profile" })
            : `<div class="px-5 pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">Keine Produkte</div>`
          }
          ${error ? `<div class="px-5 pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${escapeHtml(error)}</div>` : ""}
        `}
      </div>
    `;
  }
  return `
    <div class="px-5 app-main-content-safe space-y-5">
      ${renderFocusCarousel(profile)}
      ${isLoading ? `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtml(catalogLabel)} wird geladen...</div>
        </div>
      ` : `
        ${!hasItems ? `
          <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
            <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
              Keine Produkte
            </div>
          </div>
        ` : `
          ${isShop ? `
            ${renderShopProductList(items, { profile })}
          ` : `
            ${drinkItems.length ? `
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">Getraenke</h3>
                </div>
                <div data-menu-type="drink">
                  ${renderMenuDrinkGrid(drinkItems, { mode: "profile", useTestfirstCardUi, seenCategories: anchoredCategories, priorityOffset: drinkPriorityOffset })}
                </div>
              </section>
            ` : ""}
            ${foodItems.length ? `
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">Speisen</h3>
                </div>
                <div data-menu-type="food">
                  ${renderMenuFoodList(foodItems, { mode: "profile", useTestfirstCardUi, seenCategories: anchoredCategories, priorityOffset: foodPriorityOffset })}
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
  const handle = String(profile.handle || normalizeHandle(profile.name || "user")).replace(/^@/, "");
  const safeBio = escapeHtml(profile.bio || "").replace(/\n/g, "<br>");
  const bioHtml = safeBio || "Noch keine Bio.";
  const activeContentTab = resolveProfileContentTabForRendering(profile);
  const isMediaTab = activeContentTab === "media";
  const isMenuTab = activeContentTab === "menu";
  const isCheckinTab = activeContentTab === "checkins";
  const filteredPosts = isMediaTab ? posts.filter((p) => p.isVideo) : posts;
  const avatarUrl = getOptimizedImageUrl(profile.avatar, "avatar");
  const avatarFit = logoFitClass(isBusiness);
  const topTab = resolveProfilePrimaryTopTab(profile);
  const topPaddingClass = isBusiness ? (topTab === "profile" ? "pt-2" : "pt-4") : "pt-10";
  return `
    <div class="app-main-content-safe">
      ${topTab === "profile" ? `
      <div class="px-5 pb-2 ${topPaddingClass}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
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
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Fans</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(formatCount(profile.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Folgt</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${escapeHtml(profile.name || "User")}</h1>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${escapeHtml(handle)}</p>
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
      </div>

      ${renderProfileTabs(profile)}
      ${renderProfileViewControls(profile)}

      ${isMenuTab ? `
        ${renderProfileMenuView(profile)}
      ` : isCheckinTab ? `
        ${renderProfileCheckins()}
      ` : `
        <div class="${state.profileViewMode === "grid" ? "grid grid-cols-2 gap-4 px-6 grid-flow-dense" : "flex flex-col gap-8 px-6"}">
          ${renderProfilePostsFancy(filteredPosts, state.profileViewMode)}
        </div>
        ${activeContentTab === "posts" ? `
          <div class="px-6 mt-8 mb-4">
            <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
              <span class="relative z-10 flex items-center gap-2">
                ${icon("plus", "w-4 h-4")} Neuen Beitrag
              </span>
              <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        ` : ""}
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

