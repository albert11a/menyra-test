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
  const resolveStoryRenderIdentityLocal = (story = {}) => {
    const storyRestaurantId = String(story?.restaurantId || "").trim();
    if (!storyRestaurantId) {
      return {
        storyRestaurantId: "",
        hasCanonicalRestaurant: false,
        storyLabel: "",
        logoSource: "",
        borderClass: story?.isLive ? "border-red-500 animate-pulse" : "border-slate-200"
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
      ? (canonicalName || "")
      : (ownFallbackName || sourceName || "");
    const logoSource = hasCanonicalRestaurant
      ? (canonicalLogo || "")
      : (ownFallbackLogo || String(story?.img || story?.logo || story?.logoUrl || "").trim());
    return {
      storyRestaurantId,
      hasCanonicalRestaurant,
      storyLabel,
      logoSource,
      borderClass: story?.isLive ? "border-red-500 animate-pulse" : "border-slate-200"
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
    const borderClass = identity.borderClass;
    const storyUrl = buildStoryViewerUrlFn(storyRestaurantId);
    const storyLabel = String(identity.storyLabel || "").trim();
    const logoSource = String(identity.logoSource || "").trim();
    const allowCacheFallback = !identity.hasCanonicalRestaurant;
    const imgUrl = resolveRestaurantLogoFn(storyRestaurantId, logoSource, "thumb", allowCacheFallback);
    const storyId = storyRestaurantId ? escapeHtmlFn(storyRestaurantId) : "";
    const storyAttr = storyId ? `data-story-logo="${storyId}"` : "";
    const storyKeyAttr = storyId ? `data-img-key="story-logo:${storyId}"` : "";
    const storyBorderAttr = storyId ? `data-story-border="${storyId}"` : "";
    const storyNameAttr = storyId ? `data-story-name="${storyId}"` : "";
    const storyItemAttr = storyId ? `data-story-item="${storyId}"` : "";
    const eager = index === 0;
    const imgAttrs = eager
      ? `loading="eager" fetchpriority="high"`
      : `loading="lazy" fetchpriority="low"`;
    return `
    <a href="${storyUrl}" ${storyItemAttr} data-story-url="${escapeHtmlFn(storyUrl)}" class="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
      <div class="w-20 h-20 rounded-[2.2rem] p-0.5 border-2 ${borderClass} bg-slate-200" ${storyBorderAttr}>
        <img src="${escapeHtmlFn(imgUrl)}" ${imgAttrs} decoding="async" width="80" height="80" ${storyAttr} ${storyKeyAttr} class="w-full h-full rounded-[1.8rem] object-contain bg-white group-hover:scale-105 transition-transform" />
      </div>
      <span class="text-[9px] font-bold tracking-tighter text-slate-800" ${storyNameAttr}>${escapeHtmlFn(storyLabel)}</span>
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
    const eager = index === 0;
    const heroAttrs = eager
      ? `loading="eager" fetchpriority="high"`
      : `loading="lazy" fetchpriority="low"`;
    const logoAttrs = eager
      ? `loading="eager"`
      : `loading="lazy" fetchpriority="low"`;
    const restaurant = state.restaurants.find((r) => r.id === (post.restaurantId || post.ownerId)) || {};
    const logoSource = restaurant.logoUrl || restaurant.logo || post.logo || "";
    const logoUrl = resolveRestaurantLogoFn(post.restaurantId || post.ownerId, logoSource, "avatar");
    const imageUrl = getOptimizedImageUrlFn(post.image, "large", {
      stableKey: postId ? `feed-hero:${postId}` : ""
    });
    return `
    <div class="group feed-card" ${feedAttr}>
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
      feedPosts.forEach(updatePostCountNodesFn);
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
      if (existing) {
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
    const feedPosts = state.feedPosts
      .filter((p) => state.feedCategory === "all" || p.category === state.feedCategory)
      .sort((a, b) => (toDateSafeFn(b.createdAt)?.getTime() || 0) - (toDateSafeFn(a.createdAt)?.getTime() || 0));
    const storySeed = state.stories.length ? state.stories : (FAST_MODE ? buildStoriesFromFeedFn(feedPosts) : state.stories);
    const stories = (Array.isArray(storySeed) ? storySeed : []).filter((story) => isRenderableStory(story));
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
    const feedPosts = state.feedPosts
      .filter((p) => state.feedCategory === "all" || p.category === state.feedCategory)
      .sort((a, b) => (toDateSafeFn(b.createdAt)?.getTime() || 0) - (toDateSafeFn(a.createdAt)?.getTime() || 0));
    const storySeed = state.stories.length ? state.stories : (FAST_MODE ? buildStoriesFromFeedFn(feedPosts) : state.stories);
    const stories = (Array.isArray(storySeed) ? storySeed : []).filter((story) => isRenderableStory(story));
    return `
    <div id="feedView">
      <div id="storiesRow" class="flex gap-4 overflow-x-auto px-8 pt-4 pb-8 no-scrollbar">
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
    const handleStoryWarmup = (target) => {
      if (!(target instanceof Element)) return;
      const storyLink = target.closest("[data-story-item]");
      if (!(storyLink instanceof Element)) return;
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
    feedView.dataset.bound = "true";
  }

  return {
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
