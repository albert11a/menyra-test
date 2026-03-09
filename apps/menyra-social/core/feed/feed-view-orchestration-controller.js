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
  getOptimizedImageUrlFn = () => "",
  buildUploadStateForIntentFn = (_intent = "", currentUpload = {}) => currentUpload,
  setStateFn = () => {},
  openGuestAuthPromptFn = () => false,
  openProfileViewFromBusinessFn = () => {}
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
  const hasProfileUid = () => !!String(state.userProfile?.uid || "").trim();
  const hasBusinessProfileHint = () => !!String(state.userProfile?.restaurantId || "").trim();
  const shouldShowStoryUploadSlot = () => !!state.user || (hasProfileUid() && hasBusinessProfileHint());
  const shouldShowFeedComposer = () => (
    !!isLocalBusinessProfileFn(state.userProfile)
    || (hasBusinessProfileHint() && (!!state.user || hasProfileUid()))
  );

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
    const borderClass = story.isLive ? "border-red-500 animate-pulse" : "border-slate-200";
    const storyUrl = buildStoryViewerUrlFn(story.restaurantId);
    const restaurant = state.restaurants.find((r) => r.id === story.restaurantId) || {};
    const logoSource = restaurant.logoUrl || restaurant.logo || story.img || "";
    const imgUrl = resolveRestaurantLogoFn(story.restaurantId, logoSource, "thumb");
    const storyId = story.restaurantId ? escapeHtmlFn(story.restaurantId) : "";
    const storyAttr = storyId ? `data-story-logo="${storyId}"` : "";
    const storyKeyAttr = storyId ? `data-img-key="story-logo:${storyId}"` : "";
    const storyBorderAttr = storyId ? `data-story-border="${storyId}"` : "";
    const storyNameAttr = storyId ? `data-story-name="${storyId}"` : "";
    const storyItemAttr = storyId ? `data-story-item="${storyId}"` : "";
    const eager = index < 6;
    const imgAttrs = eager ? `fetchpriority="high"` : `loading="lazy"`;
    return `
    <a href="${storyUrl}" ${storyItemAttr} class="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
      <div class="w-20 h-20 rounded-[2.2rem] p-0.5 border-2 ${borderClass} bg-slate-200" ${storyBorderAttr}>
        <img src="${escapeHtmlFn(imgUrl)}" ${imgAttrs} decoding="async" width="80" height="80" ${storyAttr} ${storyKeyAttr} class="w-full h-full rounded-[1.8rem] object-contain bg-white group-hover:scale-105 transition-transform" />
      </div>
      <span class="text-[9px] font-bold tracking-tighter text-slate-800" ${storyNameAttr}>${escapeHtmlFn(story.name)}</span>
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
    const eager = index < 2;
    const heroAttrs = eager ? `fetchpriority="high"` : `loading="lazy"`;
    const logoAttrs = index < 2 ? `fetchpriority="high"` : `loading="lazy"`;
    const restaurant = state.restaurants.find((r) => r.id === (post.restaurantId || post.ownerId)) || {};
    const logoSource = restaurant.logoUrl || restaurant.logo || post.logo || "";
    const logoUrl = resolveRestaurantLogoFn(post.restaurantId || post.ownerId, logoSource, "avatar");
    const imageUrl = getOptimizedImageUrlFn(post.image, "large");
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
                <button class="flex items-center gap-2 hover:text-red-400 transition-colors">
                  ${iconFn("heart", "w-5 h-5")} <span ${likeAttr} class="text-[10px] font-black">${escapeHtmlFn(post.likes)}</span>
                </button>
                <button class="flex items-center gap-2 text-white/70 hover:text-white">
                  ${iconFn("message-circle", "w-5 h-5")} <span ${commentAttr} class="text-[10px] font-black">${escapeHtmlFn(post.comments)}</span>
                </button>
              </div>
              <button class="text-white/70 hover:text-white">${iconFn("share-2", "w-4 h-4")}</button>
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
    const stories = state.stories.length ? state.stories : (FAST_MODE ? buildStoriesFromFeedFn(feedPosts) : state.stories);
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
    const stories = state.stories.length ? state.stories : (FAST_MODE ? buildStoriesFromFeedFn(feedPosts) : state.stories);
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
    feedView.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
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
