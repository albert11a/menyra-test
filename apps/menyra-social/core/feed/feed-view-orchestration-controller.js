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
  loadStoryItemsForRestaurantFn = async () => [],
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
  let storyOverlayCleanup = null;
  let storyOverlayNode = null;
  let storyOverlayRequestToken = 0;
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
  const findStoryByRestaurantId = (restaurantId = "") => {
    const rid = String(restaurantId || "").trim();
    if (!rid) return null;
    return (Array.isArray(state.stories) ? state.stories : []).find((story) => {
      const identity = resolveStoryRenderIdentity(story);
      return identity.storyRestaurantId === rid;
    }) || null;
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
  const buildStoryIframeSrc = (story = {}, { muted = true } = {}) => {
    const rawEmbedUrl = String(story?.embedUrl || "").trim();
    const libraryId = String(story?.libraryId || "").trim();
    const videoId = String(story?.videoId || "").trim();
    const base = rawEmbedUrl || ((libraryId && videoId)
      ? `https://iframe.mediadelivery.net/embed/${encodeURIComponent(libraryId)}/${encodeURIComponent(videoId)}`
      : "");
    if (!base) return "";
    try {
      const url = new URL(base, win?.location?.origin || "https://example.com");
      url.searchParams.set("autoplay", "true");
      url.searchParams.set("loop", "true");
      url.searchParams.set("muted", muted ? "true" : "false");
      url.searchParams.set("preload", "true");
      url.searchParams.set("controls", "0");
      return url.toString();
    } catch {
      const separator = base.includes("?") ? "&" : "?";
      return `${base}${separator}autoplay=true&loop=true&muted=${muted ? "true" : "false"}&preload=true&controls=0`;
    }
  };
  const normalizeStoryModalItems = (story = {}) => {
    const items = Array.isArray(story?.storyItems) ? story.storyItems : [];
    return items
      .map((item = {}, index = 0) => {
        const embedUrl = String(item.embedUrl || "").trim();
        const libraryId = String(item.libraryId || "").trim();
        const videoId = String(item.videoId || "").trim();
        const videoUrl = String(item.videoUrl || "").trim();
        const imageUrl = String(item.imageUrl || "").trim();
        const mediaType = String(item.mediaType || (videoUrl || embedUrl || (libraryId && videoId) ? "video" : "image")).trim().toLowerCase() === "video"
          ? "video"
          : "image";
        const hasMedia = !!videoUrl || !!imageUrl || !!embedUrl || (!!libraryId && !!videoId);
        if (!hasMedia) return null;
        return {
          id: String(item.id || `${story?.restaurantId || "story"}-${index}`).trim(),
          restaurantId: String(item.restaurantId || story?.restaurantId || "").trim(),
          title: String(item.title || "").trim(),
          description: String(item.description || "").trim(),
          menuItemId: String(item.menuItemId || "").trim(),
          mediaType,
          videoUrl,
          imageUrl,
          embedUrl,
          libraryId,
          videoId,
          createdAt: toDateSafeFn(item.createdAt) || new Date(0)
        };
      })
      .filter(Boolean)
      .sort((a, b) => (toDateSafeFn(b.createdAt)?.getTime() || 0) - (toDateSafeFn(a.createdAt)?.getTime() || 0));
  };
  const loadStoryItemsForRestaurant = typeof loadStoryItemsForRestaurantFn === "function"
    ? loadStoryItemsForRestaurantFn
    : (async () => []);
  const openStoryOverlay = async (story = {}) => {
    const requestToken = ++storyOverlayRequestToken;
    const identity = resolveStoryRenderIdentity(story);
    if (!identity.storyRestaurantId) return false;
    let stories = normalizeStoryModalItems(story);
    if (!stories.length) {
      setStateFn({
        storyModal: {
          open: true,
          restaurantId: identity.storyRestaurantId,
          name: String(identity.storyLabel || "").trim(),
          logoUrl: String(identity.logoSource || "").trim(),
          stories: [],
          loading: true
        }
      });
      try {
        const loaded = await loadStoryItemsForRestaurant(identity.storyRestaurantId, 20);
        stories = normalizeStoryModalItems({ ...story, storyItems: loaded });
        if (stories.length && Array.isArray(state.stories)) {
          state.stories = state.stories.map((item) => {
            const itemIdentity = resolveStoryRenderIdentity(item);
            if (itemIdentity.storyRestaurantId !== identity.storyRestaurantId) return item;
            return {
              ...item,
              storyItems: stories
            };
          });
        }
      } catch {
        stories = [];
      }
      if (requestToken !== storyOverlayRequestToken) return false;
      if (!stories.length) {
        setStateFn({
          storyModal: {
            open: false,
            restaurantId: "",
            name: "",
            logoUrl: "",
            stories: [],
            loading: false
          }
        });
        return false;
      }
    }
    setStateFn({
      storyModal: {
        open: true,
        restaurantId: identity.storyRestaurantId,
        name: String(identity.storyLabel || "").trim(),
        logoUrl: String(identity.logoSource || "").trim(),
        stories,
        loading: false
      }
    });
    return true;
  };
  const closeStoryOverlay = () => {
    if (!state.storyModal?.open) return;
    storyOverlayRequestToken += 1;
    setStateFn({
      storyModal: {
        open: false,
        restaurantId: "",
        name: "",
        logoUrl: "",
        stories: [],
        loading: false
      }
    });
  };
  const renderStoryOverlay = () => {
    if (!state.storyModal?.open) return "";
    const storyItems = Array.isArray(state.storyModal?.stories) ? state.storyModal.stories : [];
    const title = String(state.storyModal?.name || "Story").trim() || "Story";
    const logoUrl = String(state.storyModal?.logoUrl || "").trim();
    const restaurantId = String(state.storyModal?.restaurantId || "").trim();
    const loading = !!state.storyModal?.loading;
    return `
      <div id="storyOverlay" class="fixed inset-0 z-[95] bg-black text-white">
        <style>
          #storyOverlayReels { height: 100vh; height: 100svh; height: 100dvh; overflow-y: auto; scroll-snap-type: y mandatory; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; scroll-behavior: auto; }
          #storyOverlayReels::-webkit-scrollbar { display: none; }
          #storyOverlayReels { scrollbar-width: none; }
          .story-overlay-reel { position: relative; height: 100vh; height: 100svh; height: 100dvh; scroll-snap-align: start; scroll-snap-stop: always; background: #000; overflow: hidden; }
          .story-overlay-media, .story-overlay-image, .story-overlay-iframe { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #000; border: 0; }
          .story-overlay-vignette { position: absolute; inset: 0; pointer-events: none; background:
            radial-gradient(120% 70% at 50% 10%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.82) 100%),
            linear-gradient(to top, rgba(0,0,0,0.58), rgba(0,0,0,0.00) 45%); z-index: 2; }
        </style>
        <div id="storyOverlayBackdrop" class="absolute inset-0 bg-black"></div>
        <div class="absolute top-0 left-0 right-0 z-[2] px-3 pt-[calc(env(safe-area-inset-top)+10px)] pb-3 pointer-events-none">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0 pointer-events-auto">
              <button id="storyOverlayClose" type="button" class="w-11 h-11 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-md flex items-center justify-center text-white text-xl font-black active:scale-95 transition-transform">×</button>
              <div class="flex items-center gap-3 px-3 py-2 rounded-[1.2rem] bg-black/35 border border-white/10 backdrop-blur-md min-w-0">
                <div class="w-8 h-8 rounded-xl overflow-hidden border border-white/10 bg-white/10 shrink-0">
                  ${logoUrl ? `<img src="${escapeHtmlFn(logoUrl)}" class="w-full h-full object-contain bg-white" />` : `<div class="w-full h-full bg-white/10"></div>`}
                </div>
                <div class="min-w-0">
                  <div class="text-[12px] font-black tracking-tight truncate">${escapeHtmlFn(title)}</div>
                  <div class="text-[9px] font-black uppercase tracking-[0.24em] text-white/60">Stories</div>
                </div>
              </div>
            </div>
            <div id="storyOverlayCounter" class="pointer-events-none px-3 py-2 rounded-[1.2rem] bg-black/35 border border-white/10 backdrop-blur-md text-[11px] font-black tracking-widest uppercase">${storyItems.length ? `1 / ${storyItems.length}` : ""}</div>
          </div>
        </div>
        ${loading && !storyItems.length ? `
          <div class="absolute inset-0 z-[1] flex items-center justify-center">
            <div class="w-10 h-10 rounded-full border-2 border-white/15 border-t-white animate-spin"></div>
          </div>
        ` : `
          <div id="storyOverlayReels" class="relative z-[1]">
            ${(storyItems.length ? storyItems : []).map((item, index) => {
              const hasIframe = !!String(item.embedUrl || "").trim() || (!!String(item.libraryId || "").trim() && !!String(item.videoId || "").trim());
              const menuHref = item.menuItemId
                ? buildUrlFn("apps/menyra-social/index.html", { r: restaurantId, tab: "menu", src: "story" })
                : "";
              return `
                <section class="story-overlay-reel" data-story-overlay-reel="${index}" data-story-overlay-index="${index}">
                  ${hasIframe ? `
                    <div
                      class="absolute inset-0"
                      data-story-overlay-kind="iframe"
                      data-story-overlay-slot="${index}"
                      data-story-overlay-iframe-muted="${escapeHtmlFn(buildStoryIframeSrc(item, { muted: true }))}"
                      data-story-overlay-iframe-unmuted="${escapeHtmlFn(buildStoryIframeSrc(item, { muted: false }))}"
                    ></div>
                  ` : item.mediaType === "video" ? `
                    <video
                      class="story-overlay-media"
                      data-story-overlay-kind="video"
                      data-story-overlay-video="${index}"
                      src="${escapeHtmlFn(item.videoUrl)}"
                      ${item.imageUrl ? `poster="${escapeHtmlFn(item.imageUrl)}"` : ""}
                      playsinline
                      webkit-playsinline
                      loop
                      preload="${index === 0 ? "auto" : "metadata"}"
                    ></video>
                  ` : `
                    <img
                      class="story-overlay-image"
                      data-story-overlay-kind="image"
                      src="${escapeHtmlFn(item.imageUrl)}"
                      loading="${index < 2 ? "eager" : "lazy"}"
                      decoding="async"
                    />
                  `}
                  <div class="story-overlay-vignette"></div>
                  <div class="absolute right-3 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-[3]">
                    <div class="w-[60px] h-[46px] rounded-[18px] bg-black/45 border border-white/10 backdrop-blur-md flex items-center justify-center text-[13px] font-bold">
                      ${index + 1}/${storyItems.length}
                    </div>
                  </div>
                  <div class="absolute left-3 right-[5rem] bottom-[calc(env(safe-area-inset-bottom)+1.75rem)] z-[3] flex flex-col gap-3">
                    ${item.title ? `<div class="text-[18px] font-black leading-tight tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">${escapeHtmlFn(item.title)}</div>` : ""}
                    ${item.description ? `<div class="text-[14px] leading-[1.45] text-white/90 max-w-[92%] whitespace-pre-wrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">${escapeHtmlFn(item.description)}</div>` : ""}
                    ${menuHref ? `<a href="${escapeHtmlFn(menuHref)}" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-white text-[13px] font-semibold w-fit">Produkt ansehen</a>` : ""}
                  </div>
                </section>
              `;
            }).join("")}
          </div>
        `}
      </div>
    `;
  };
  const syncStoryOverlayRuntime = () => {
    const overlay = doc?.getElementById("storyOverlay");
    if (overlay && overlay === storyOverlayNode) return;
    if (typeof storyOverlayCleanup === "function") {
      storyOverlayCleanup();
      storyOverlayCleanup = null;
    }
    storyOverlayNode = null;
    if (!overlay) return;
    storyOverlayNode = overlay;
    const reelsContainer = doc.getElementById("storyOverlayReels");
    const closeBtn = doc.getElementById("storyOverlayClose");
    const backdrop = doc.getElementById("storyOverlayBackdrop");
    const counter = doc.getElementById("storyOverlayCounter");
    const reels = Array.from(doc.querySelectorAll("[data-story-overlay-reel]"));
    if (!reelsContainer || !reels.length) {
      if (closeBtn) closeBtn.addEventListener("click", closeStoryOverlay, { once: true });
      return;
    }

    const entries = reels.map((reel, index) => {
      const video = reel.querySelector(`[data-story-overlay-video="${index}"]`);
      const iframeSlot = reel.querySelector(`[data-story-overlay-slot="${index}"]`);
      return {
        index,
        reel,
        video: video instanceof HTMLVideoElement ? video : null,
        iframeSlot: iframeSlot instanceof HTMLElement ? iframeSlot : null,
        iframeEl: null
      };
    });

    let activeIndex = 0;
    let hasUnlockedMedia = false;
    let autoplayProbeState = "idle";
    let syncFrame = 0;
    const cleanups = [];
    const getAutoplayPolicyCapability = (mediaEl = null) => {
      try {
        const policy = win?.navigator?.getAutoplayPolicy?.(mediaEl || "mediaelement");
        if (policy === "allowed") return "allowed";
        if (policy === "allowed-muted") return "allowed-muted";
        if (policy === "disallowed") return "disallowed";
      } catch {}
      return "";
    };
    const policy = getAutoplayPolicyCapability();
    if (policy === "allowed") {
      autoplayProbeState = "allowed";
      hasUnlockedMedia = true;
    } else if (policy === "allowed-muted" || policy === "disallowed") {
      autoplayProbeState = "blocked";
    }

    const mountIframe = (entry, { muted = true } = {}) => {
      if (!entry?.iframeSlot) return null;
      const nextSrc = String(
        muted
          ? entry.iframeSlot.dataset.storyOverlayIframeMuted || ""
          : entry.iframeSlot.dataset.storyOverlayIframeUnmuted || ""
      ).trim();
      if (!nextSrc) return null;
      if (entry.iframeEl && entry.iframeEl.getAttribute("src") === nextSrc) return entry.iframeEl;
      if (entry.iframeEl) {
        entry.iframeEl.remove();
        entry.iframeEl = null;
      }
      const iframe = doc.createElement("iframe");
      iframe.className = "story-overlay-iframe";
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.setAttribute("allowfullscreen", "");
      iframe.src = nextSrc;
      entry.iframeSlot.appendChild(iframe);
      entry.iframeEl = iframe;
      return iframe;
    };
    const unmountIframe = (entry) => {
      if (!entry?.iframeEl) return;
      entry.iframeEl.remove();
      entry.iframeEl = null;
    };
    const updateCounter = () => {
      if (!counter) return;
      counter.textContent = `${activeIndex + 1} / ${entries.length}`;
    };
    const syncMediaPlayback = ({ fromUserGesture = false } = {}) => {
      entries.forEach((entry) => {
        const isActive = entry.index === activeIndex;
        if (entry.iframeSlot) {
          if (isActive) {
            mountIframe(entry, { muted: !(hasUnlockedMedia || autoplayProbeState === "allowed") });
          } else {
            unmountIframe(entry);
          }
        }
        if (!entry.video) return;
        entry.video.preload = isActive ? "auto" : "metadata";
        if (!isActive) {
          entry.video.defaultMuted = true;
          entry.video.muted = true;
          entry.video.volume = 0;
          entry.video.pause();
          return;
        }
        if (!fromUserGesture && !hasUnlockedMedia && autoplayProbeState === "idle") {
          autoplayProbeState = "pending";
          entry.video.defaultMuted = false;
          entry.video.muted = false;
          entry.video.volume = 1;
          const playAttempt = entry.video.play();
          if (playAttempt && typeof playAttempt.then === "function") {
            playAttempt.then(() => {
              autoplayProbeState = "allowed";
              hasUnlockedMedia = true;
              syncMediaPlayback();
            }).catch(() => {
              autoplayProbeState = "blocked";
              entry.video.defaultMuted = true;
              entry.video.muted = true;
              entry.video.volume = 0;
              void entry.video.play().catch(() => {});
            });
          } else {
            autoplayProbeState = "allowed";
            hasUnlockedMedia = true;
          }
          return;
        }
        const withSound = hasUnlockedMedia || autoplayProbeState === "allowed";
        entry.video.defaultMuted = !withSound;
        entry.video.muted = !withSound;
        entry.video.volume = withSound ? 1 : 0;
        if (entry.video.paused || fromUserGesture) {
          void entry.video.play().catch(() => {});
        }
      });
      updateCounter();
    };
    const setActiveIndex = (nextIndex, { fromUserGesture = false } = {}) => {
      const normalized = Math.max(0, Math.min(entries.length - 1, Number(nextIndex) || 0));
      if (normalized === activeIndex && !fromUserGesture) return;
      activeIndex = normalized;
      syncMediaPlayback({ fromUserGesture });
    };
    const scheduleSync = () => {
      if (!win || syncFrame) return;
      syncFrame = win.requestAnimationFrame(() => {
        syncFrame = 0;
        const viewportHeight = Math.max(1, reelsContainer.clientHeight || win.innerHeight || 1);
        const nextIndex = Math.round((reelsContainer.scrollTop || 0) / viewportHeight);
        setActiveIndex(nextIndex);
      });
    };
    const handleUnlock = () => {
      if (hasUnlockedMedia) return;
      hasUnlockedMedia = true;
      syncMediaPlayback({ fromUserGesture: true });
      reelsContainer.removeEventListener("touchstart", handleUnlock, true);
      reelsContainer.removeEventListener("pointerdown", handleUnlock, true);
      doc.removeEventListener("keydown", handleUnlock, true);
    };
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeStoryOverlay();
    };

    closeBtn?.addEventListener("click", closeStoryOverlay);
    backdrop?.addEventListener("click", closeStoryOverlay);
    reelsContainer.addEventListener("scroll", scheduleSync, { passive: true });
    reelsContainer.addEventListener("touchstart", handleUnlock, { capture: true, passive: true });
    reelsContainer.addEventListener("pointerdown", handleUnlock, { capture: true, passive: true });
    doc.addEventListener("keydown", handleEscape);
    doc.addEventListener("keydown", handleUnlock, true);

    cleanups.push(() => closeBtn?.removeEventListener("click", closeStoryOverlay));
    cleanups.push(() => backdrop?.removeEventListener("click", closeStoryOverlay));
    cleanups.push(() => reelsContainer.removeEventListener("scroll", scheduleSync));
    cleanups.push(() => reelsContainer.removeEventListener("touchstart", handleUnlock, true));
    cleanups.push(() => reelsContainer.removeEventListener("pointerdown", handleUnlock, true));
    cleanups.push(() => doc.removeEventListener("keydown", handleEscape));
    cleanups.push(() => doc.removeEventListener("keydown", handleUnlock, true));
    cleanups.push(() => {
      if (syncFrame && win?.cancelAnimationFrame) win.cancelAnimationFrame(syncFrame);
      entries.forEach((entry) => {
        if (entry.video) {
          entry.video.pause();
          entry.video.muted = true;
          entry.video.volume = 0;
        }
        unmountIframe(entry);
      });
    });

    storyOverlayCleanup = () => {
      cleanups.forEach((cleanup) => {
        try {
          cleanup();
        } catch {}
      });
      if (storyOverlayNode === overlay) {
        storyOverlayNode = null;
      }
    };

    reelsContainer.scrollTop = 0;
    setActiveIndex(0);
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
      ${renderStoryOverlay()}
    </div>
  `;
  }

  function bindFeedDelegation() {
    const feedView = doc?.getElementById("feedView");
    if (!feedView) return;
    syncStoryOverlayRuntime();
    if (feedView.dataset.bound === "true") return;
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
        const restaurantId = storyLink.getAttribute("data-story-item") || "";
        const story = findStoryByRestaurantId(restaurantId);
        event.preventDefault();
        if (story) {
          void openStoryOverlay(story);
        } else {
          const href = storyLink.getAttribute("href") || "";
          if (href && win?.location) win.location.href = href;
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
      const commentBtn = target.closest("[data-feed-post-comment]");
      if (commentBtn) {
        const postId = commentBtn.dataset.feedPostComment || "";
        const post = findFeedPostById(postId);
        if (post) {
          void Promise.resolve(openPostModalFn(post)).then(() => {
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
            storyModal: { open: false, restaurantId: "", name: "", logoUrl: "", stories: [], loading: false },
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
