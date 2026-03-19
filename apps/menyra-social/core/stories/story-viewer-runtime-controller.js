function toDateSafe(value) {
  try {
    if (value && typeof value.toDate === "function") return value.toDate();
  } catch {}
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  }
  return null;
}

function isStoryActive(row = {}) {
  const status = String(row.status || "active").trim().toLowerCase();
  if (status && status !== "active" && status !== "live") return false;
  if (row.active === false || row.isActive === false) return false;
  const expiresAt = toDateSafe(row.expiresAt || row.expireAt || row.expiresOn);
  if (expiresAt && expiresAt.getTime() < Date.now()) return false;
  return true;
}

function extractRestaurantId(docSnap, row = {}) {
  const direct = String(row.restaurantId || row.rid || "").trim();
  if (direct) return direct;
  const parent = docSnap?.ref?.parent?.parent;
  return parent ? String(parent.id || "").trim() : "";
}

function isLikelyVideoMediaUrl(value = "") {
  const url = String(value || "").trim();
  if (!url) return false;
  const lowered = url.toLowerCase();
  if (/\.m3u8($|\?)/.test(lowered)) return true;
  if (/\.mpd($|\?)/.test(lowered)) return true;
  if (/\.mp4($|\?)/.test(lowered)) return true;
  if (/\.webm($|\?)/.test(lowered)) return true;
  if (/\.mov($|\?)/.test(lowered)) return true;
  if (/\.m4v($|\?)/.test(lowered)) return true;
  if (/\.ogv($|\?)/.test(lowered)) return true;
  return false;
}

function mapStoryDoc(docSnap) {
  const row = docSnap?.data?.() || {};
  if (!isStoryActive(row)) return null;
  const rawMediaType = String(row.mediaType || row.type || "").trim().toLowerCase();
  const embedUrl = String(row.embedUrl || "").trim();
  const explicitVideoUrl = String(row.videoUrl || row.playbackUrl || "").trim();
  const explicitImageUrl = String(row.imageUrl || row.thumbUrl || row.mediaImage || "").trim();
  const genericMediaUrl = String(row.mediaUrl || row.url || "").trim();
  let mediaType = "";
  let videoUrl = "";
  let imageUrl = "";

  if (rawMediaType === "video") {
    mediaType = "video";
    videoUrl = explicitVideoUrl || genericMediaUrl;
    imageUrl = explicitImageUrl;
  } else if (rawMediaType === "image") {
    mediaType = "image";
    imageUrl = explicitImageUrl || genericMediaUrl;
    videoUrl = explicitVideoUrl;
  } else if (explicitVideoUrl) {
    mediaType = "video";
    videoUrl = explicitVideoUrl;
    imageUrl = explicitImageUrl;
  } else if (explicitImageUrl) {
    mediaType = "image";
    imageUrl = explicitImageUrl;
  } else if (genericMediaUrl) {
    if (isLikelyVideoMediaUrl(genericMediaUrl)) {
      mediaType = "video";
      videoUrl = genericMediaUrl;
    } else {
      mediaType = "image";
      imageUrl = genericMediaUrl;
    }
  }

  const hasMedia = !!embedUrl || !!videoUrl || !!imageUrl || (!!row.libraryId && !!row.videoId);
  if (!hasMedia) return null;
  return {
    id: docSnap.id,
    restaurantId: extractRestaurantId(docSnap, row),
    title: String(row.title || row.captionTitle || "").trim(),
    description: String(row.description || row.caption || row.text || "").trim(),
    menuItemId: String(row.menuItemId || row.itemId || "").trim(),
    mediaType: mediaType === "image" ? "image" : (mediaType === "video" ? "video" : ""),
    embedUrl,
    videoUrl,
    imageUrl,
    libraryId: String(row.libraryId || "").trim(),
    videoId: String(row.videoId || "").trim(),
    createdAt: toDateSafe(row.createdAt) || toDateSafe(row.updatedAt) || new Date(0)
  };
}

export function createStoryViewerRuntimeController({
  db = null,
  collectionFn = null,
  docFn = null,
  getDocFn = null,
  queryFn = null,
  orderByFn = null,
  limitFn = null,
  getDocsFn = null,
  windowObj = null,
  documentObj = null,
  feedFallbackUrl = "/apps/menyra-social/index.html?tab=feed"
} = {}) {
  const win = windowObj || (typeof window === "undefined" ? null : window);
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const videos = new Map();
  const storyCachePrefix = "mnyra_story_viewer_cache_v2:";
  const storyHintPrefix = "mnyra_story_viewer_hint_v1:";
  let storyStandaloneTopbar = null;
  let reelEntries = [];
  let activeIndex = 0;
  let activeIndexSyncFrame = 0;
  let hasUnlockedMedia = false;
  let suppressNextMediaToggle = false;
  let autoplayProbeState = "idle";

  function getParam(name) {
    if (!win) return "";
    try {
      const url = new URL(win.location.href);
      return (url.searchParams.get(name) || "").trim();
    } catch {
      return "";
    }
  }

  async function loadRestaurantMeta(restaurantId) {
    if (!db || typeof docFn !== "function" || typeof getDocFn !== "function") return null;
    const rid = String(restaurantId || "").trim();
    if (!rid) return null;
    try {
      const snap = await getDocFn(docFn(db, "restaurants", rid));
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() || {}) };
    } catch {
      return null;
    }
  }

  async function loadStories(restaurantId, max = 20) {
    if (!db || typeof collectionFn !== "function" || typeof queryFn !== "function" || typeof getDocsFn !== "function") return [];
    const rid = String(restaurantId || "").trim();
    if (!rid) return [];
    const ref = collectionFn(db, "restaurants", rid, "stories");
    let snap = null;
    try {
      if (typeof orderByFn === "function" && typeof limitFn === "function") {
        snap = await getDocsFn(queryFn(ref, orderByFn("createdAt", "desc"), limitFn(Math.max(1, Number(max) || 20))));
      } else {
        snap = await getDocsFn(queryFn(ref));
      }
    } catch {
      try {
        if (typeof limitFn === "function") {
          snap = await getDocsFn(queryFn(ref, limitFn(Math.max(1, Number(max) || 20))));
        } else {
          snap = await getDocsFn(queryFn(ref));
        }
      } catch {
        return [];
      }
    }

    const stories = [];
    snap.forEach((docSnap) => {
      const mapped = mapStoryDoc(docSnap);
      if (mapped) stories.push(mapped);
    });
    stories.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
    return stories.slice(0, Math.max(1, Number(max) || 20));
  }

  function appendQueryParams(urlString, params = {}) {
    const raw = String(urlString || "").trim();
    if (!raw) return "";
    try {
      const base = win?.location?.origin || "https://example.com";
      const url = new URL(raw, base);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
      return url.toString();
    } catch {
      const separator = raw.includes("?") ? "&" : "?";
      const query = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join("&");
      return query ? `${raw}${separator}${query}` : raw;
    }
  }

  function readSessionJson(key = "") {
    const safeKey = String(key || "").trim();
    if (!safeKey || !win?.sessionStorage) return null;
    try {
      const raw = win.sessionStorage.getItem(safeKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function writeSessionJson(key = "", value = null) {
    const safeKey = String(key || "").trim();
    if (!safeKey || !win?.sessionStorage || !value) return;
    try {
      win.sessionStorage.setItem(safeKey, JSON.stringify(value));
    } catch {}
  }

  function buildStorySignature(stories = []) {
    return (Array.isArray(stories) ? stories : [])
      .map((story = {}) => [
        String(story.id || "").trim(),
        String(story.mediaType || "").trim(),
        String(story.videoUrl || story.imageUrl || story.embedUrl || "").trim(),
        String(story.title || "").trim(),
        String(story.description || "").trim(),
        Number(story.createdAt?.getTime?.() || 0)
      ].join(":"))
      .join("|");
  }

  function readWarmStoryHint(restaurantId = "") {
    const rid = String(restaurantId || "").trim();
    if (!rid) return null;
    const payload = readSessionJson(`${storyHintPrefix}${rid}`);
    if (!payload || typeof payload !== "object") return null;
    return payload;
  }

  function readStoryCache(restaurantId = "") {
    const rid = String(restaurantId || "").trim();
    if (!rid) return null;
    const payload = readSessionJson(`${storyCachePrefix}${rid}`);
    if (!payload || typeof payload !== "object") return null;
    const stories = Array.isArray(payload.stories) ? payload.stories.map((story = {}) => ({
      ...story,
      createdAt: toDateSafe(story.createdAt) || new Date(0)
    })) : [];
    if (!stories.length) return null;
    return {
      restaurantId: rid,
      meta: payload.meta && typeof payload.meta === "object" ? payload.meta : null,
      stories,
      signature: buildStorySignature(stories)
    };
  }

  function writeStoryCache(restaurantId = "", { meta = null, stories = [] } = {}) {
    const rid = String(restaurantId || "").trim();
    const safeStories = Array.isArray(stories) ? stories : [];
    if (!rid || !safeStories.length) return;
    writeSessionJson(`${storyCachePrefix}${rid}`, {
      restaurantId: rid,
      meta: meta && typeof meta === "object" ? meta : null,
      stories: safeStories.map((story = {}) => ({
        ...story,
        createdAt: Number(story.createdAt?.getTime?.() || 0)
      })),
      savedAt: Date.now()
    });
  }

  function buildIframeSrc(story, { muted = true } = {}) {
    if (story.embedUrl) {
      return appendQueryParams(story.embedUrl, {
        autoplay: true,
        loop: true,
        muted: muted ? "true" : "false",
        preload: true,
        controls: 0
      });
    }
    if (story.libraryId && story.videoId) {
      const embedUrl = `https://iframe.mediadelivery.net/embed/${encodeURIComponent(story.libraryId)}/${encodeURIComponent(story.videoId)}`;
      return appendQueryParams(embedUrl, {
        autoplay: true,
        loop: true,
        muted: muted ? "true" : "false",
        preload: true,
        controls: 0
      });
    }
    return "";
  }

  function applyTopbarMeta(brandLogo, brandName, meta) {
    if (!brandLogo || !brandName) return;
    const displayName = meta?.restaurantName || meta?.name || meta?.slug || "Mnyra";
    const logoUrl = meta?.logoUrl || meta?.logo || "";
    brandName.textContent = displayName;
    if (logoUrl) {
      brandLogo.style.backgroundImage = `url(${logoUrl})`;
    } else {
      brandLogo.style.backgroundImage = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
  }

  function updateRenderedTopbarMeta(meta) {
    if (!doc) return;
    const brandNames = doc.querySelectorAll("[data-story-brand-name]");
    const brandLogos = doc.querySelectorAll("[data-story-brand-logo]");
    const length = Math.min(brandNames.length, brandLogos.length);
    for (let index = 0; index < length; index += 1) {
      applyTopbarMeta(brandLogos[index], brandNames[index], meta);
    }
  }

  function createTopbarElement(meta) {
    if (!doc) return null;
    const topbar = doc.createElement("div");
    topbar.className = "topbar";
    const topbarLeft = doc.createElement("div");
    topbarLeft.className = "topbarLeft";

    const backBtn = doc.createElement("button");
    backBtn.className = "btnIcon";
    backBtn.textContent = "←";
    backBtn.addEventListener("click", () => {
      if (win?.history?.length > 1) {
        win.history.back();
      } else if (win) {
        win.location.href = feedFallbackUrl;
      }
    });
    topbarLeft.appendChild(backBtn);

    const brandPill = doc.createElement("div");
    brandPill.className = "brandPill";

    const brandLogo = doc.createElement("div");
    brandLogo.className = "brandLogo";
    brandLogo.dataset.storyBrandLogo = "1";
    brandPill.appendChild(brandLogo);

    const brandName = doc.createElement("div");
    brandName.className = "brandName";
    brandName.dataset.storyBrandName = "1";
    brandPill.appendChild(brandName);
    applyTopbarMeta(brandLogo, brandName, meta);

    topbarLeft.appendChild(brandPill);
    topbar.appendChild(topbarLeft);
    return topbar;
  }

  function hideStandaloneTopbar() {
    if (storyStandaloneTopbar) {
      storyStandaloneTopbar.style.display = "none";
    }
  }

  function showStandaloneTopbar(meta, restaurantId) {
    if (!doc) return;
    if (!storyStandaloneTopbar) {
      storyStandaloneTopbar = doc.createElement("div");
      storyStandaloneTopbar.id = "storyStandaloneTopbar";
      storyStandaloneTopbar.style.position = "fixed";
      storyStandaloneTopbar.style.top = "0";
      storyStandaloneTopbar.style.left = "0";
      storyStandaloneTopbar.style.right = "0";
      storyStandaloneTopbar.style.zIndex = "30";
      storyStandaloneTopbar.style.pointerEvents = "none";
      doc.body.appendChild(storyStandaloneTopbar);
    }
    storyStandaloneTopbar.innerHTML = "";
    const topbar = createTopbarElement(meta);
    if (!topbar) return;
    storyStandaloneTopbar.appendChild(topbar);
    storyStandaloneTopbar.style.display = "block";
  }

  function getMediaKind(story = {}) {
    if (story.embedUrl || (story.libraryId && story.videoId)) return "iframe";
    if (story.videoUrl) return "video";
    if (story.imageUrl) return "image";
    return "";
  }

  function createMediaElement(entry, { active = false } = {}) {
    if (!doc || !entry) return null;
    const story = entry.story || {};
    if (entry.mediaKind === "iframe") {
      const iframe = doc.createElement("iframe");
      iframe.className = "reel-video";
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.setAttribute("allowfullscreen", "");
      iframe.frameBorder = "0";
      iframe.loading = active ? "eager" : "lazy";
      iframe.src = buildIframeSrc(story, {
        muted: !(hasUnlockedMedia || autoplayProbeState === "allowed")
      });
      entry.mediaSrc = iframe.src;
      return iframe;
    }
    if (entry.mediaKind === "video") {
      const video = doc.createElement("video");
      video.className = "reel-video";
      video.src = story.videoUrl;
      video.loop = true;
      video.autoplay = false;
      video.defaultMuted = true;
      video.muted = true;
      video.volume = 0;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.preload = active ? "auto" : "metadata";
      if (story.imageUrl) video.poster = story.imageUrl;
      entry.mediaSrc = story.videoUrl;
      return video;
    }
    if (entry.mediaKind === "image") {
      const image = doc.createElement("img");
      image.className = "reel-image";
      image.src = story.imageUrl;
      image.loading = active ? "eager" : "lazy";
      image.decoding = "async";
      entry.mediaSrc = story.imageUrl;
      return image;
    }
    return null;
  }

  function mountMedia(entry, { active = false } = {}) {
    if (!entry || entry.mediaMounted) return entry?.mediaEl || null;
    const mediaEl = createMediaElement(entry, { active });
    if (!mediaEl) return null;
    entry.mediaEl = mediaEl;
    entry.mediaMounted = true;
    if (entry.mediaKind === "video") {
      videos.set(entry.index, mediaEl);
    }
    entry.reel.insertBefore(mediaEl, entry.overlayAnchor);
    return mediaEl;
  }

  function unmountMedia(entry) {
    if (!entry?.mediaMounted || !entry.mediaEl) return;
    if (entry.mediaKind === "video") {
      try {
        entry.mediaEl.pause();
      } catch {}
      videos.delete(entry.index);
    }
    try {
      entry.mediaEl.remove();
    } catch {}
    entry.mediaEl = null;
    entry.mediaMounted = false;
    entry.mediaSrc = "";
  }

  function ensureMountedForIndex(index, { active = false } = {}) {
    const entry = reelEntries[index];
    if (!entry) return null;
    if (entry.mediaKind === "iframe") {
      if (!active) return null;
      if (entry.mediaMounted) {
        const nextSrc = buildIframeSrc(entry.story, { muted: !hasUnlockedMedia });
        if (entry.mediaSrc !== nextSrc) {
          unmountMedia(entry);
        }
      }
    }
    return mountMedia(entry, { active });
  }

  function primeNearbyMedia(index) {
    reelEntries.forEach((entry) => {
      if (!entry) return;
      const distance = Math.abs(entry.index - index);
      if (entry.mediaKind === "iframe") {
        if (distance !== 0) unmountMedia(entry);
        return;
      }
      if (distance <= 1) {
        mountMedia(entry, { active: distance === 0 });
      }
    });
  }

  function getAutoplayPolicyCapability(mediaEl = null) {
    try {
      const policy = win?.navigator?.getAutoplayPolicy?.(mediaEl || "mediaelement");
      if (policy === "allowed") return "allowed";
      if (policy === "allowed-muted") return "allowed-muted";
      if (policy === "disallowed") return "disallowed";
    } catch {}
    return "";
  }

  function ensureAutoplayProbe(mediaEl) {
    if (!mediaEl || mediaEl.tagName !== "VIDEO") return;
    if (hasUnlockedMedia || autoplayProbeState === "pending" || autoplayProbeState === "allowed") return;
    const capability = getAutoplayPolicyCapability(mediaEl);
    if (capability === "allowed") {
      autoplayProbeState = "allowed";
      hasUnlockedMedia = true;
      return;
    }
    if (capability === "allowed-muted" || capability === "disallowed") {
      autoplayProbeState = "blocked";
      return;
    }
    autoplayProbeState = "pending";
    mediaEl.defaultMuted = false;
    mediaEl.muted = false;
    mediaEl.volume = 1;
    const playAttempt = mediaEl.play();
    if (!playAttempt || typeof playAttempt.then !== "function") {
      autoplayProbeState = "allowed";
      hasUnlockedMedia = true;
      return;
    }
    playAttempt
      .then(() => {
        autoplayProbeState = "allowed";
        hasUnlockedMedia = true;
        syncMediaPlayback();
      })
      .catch(() => {
        autoplayProbeState = "blocked";
        mediaEl.defaultMuted = true;
        mediaEl.muted = true;
        mediaEl.volume = 0;
        void mediaEl.play().catch(() => {});
      });
  }

  function syncMediaPlayback({ fromUserGesture = false } = {}) {
    primeNearbyMedia(activeIndex);
    reelEntries.forEach((entry) => {
      if (!entry) return;
      const isActive = entry.index === activeIndex;
      if (entry.mediaKind === "iframe") {
        if (isActive) {
          ensureMountedForIndex(entry.index, { active: true });
        } else {
          unmountMedia(entry);
        }
        return;
      }
      const mediaEl = entry.mediaEl;
      if (!mediaEl || entry.mediaKind !== "video") return;
      mediaEl.preload = isActive ? "auto" : "metadata";
      if (!isActive) {
        mediaEl.defaultMuted = true;
        mediaEl.muted = true;
        mediaEl.volume = 0;
        try {
          mediaEl.pause();
        } catch {}
        return;
      }
      if (!fromUserGesture && !hasUnlockedMedia && autoplayProbeState === "idle") {
        ensureAutoplayProbe(mediaEl);
      }
      const shouldPlayWithSound = hasUnlockedMedia || autoplayProbeState === "allowed";
      mediaEl.defaultMuted = !shouldPlayWithSound;
      mediaEl.muted = !shouldPlayWithSound;
      mediaEl.volume = shouldPlayWithSound ? 1 : 0;
      if (mediaEl.paused || fromUserGesture) {
        void mediaEl.play().catch(() => {});
      }
    });
  }

  function setActiveIndex(nextIndex, { force = false, fromUserGesture = false } = {}) {
    const maxIndex = Math.max(0, reelEntries.length - 1);
    const normalized = Math.max(0, Math.min(maxIndex, Number(nextIndex) || 0));
    if (!force && normalized === activeIndex) {
      if (fromUserGesture) syncMediaPlayback({ fromUserGesture });
      return;
    }
    activeIndex = normalized;
    syncMediaPlayback({ fromUserGesture });
  }

  function findClosestReelIndex() {
    if (!reelEntries.length) return 0;
    const viewportCenter = (win?.innerHeight || 0) / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    reelEntries.forEach((entry) => {
      const rect = entry.reel.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = entry.index;
      }
    });
    return closestIndex;
  }

  function scheduleActiveIndexSync() {
    if (!win || activeIndexSyncFrame) return;
    activeIndexSyncFrame = win.requestAnimationFrame(() => {
      activeIndexSyncFrame = 0;
      setActiveIndex(findClosestReelIndex());
    });
  }

  function renderStories(stories, container, meta, restaurantId) {
    if (!doc || !container) return;
    if (activeIndexSyncFrame && win?.cancelAnimationFrame) {
      win.cancelAnimationFrame(activeIndexSyncFrame);
      activeIndexSyncFrame = 0;
    }
    videos.clear();
    reelEntries = [];
    activeIndex = 0;
    container.innerHTML = "";
    hideStandaloneTopbar();

    const fragment = doc.createDocumentFragment();
    stories.forEach((story, index) => {
      const reel = doc.createElement("div");
      reel.className = "reel";
      reel.dataset.index = String(index);

      const vignette = doc.createElement("div");
      vignette.className = "vignette";
      reel.appendChild(vignette);

      const topbar = createTopbarElement(meta);
      if (topbar) {
        reel.appendChild(topbar);
      }

      const content = doc.createElement("div");
      content.className = "content";
      if (story.title) {
        const titleEl = doc.createElement("div");
        titleEl.className = "contentTitle";
        titleEl.textContent = story.title;
        content.appendChild(titleEl);
      }
      if (story.description) {
        const descEl = doc.createElement("div");
        descEl.className = "contentDesc";
        descEl.textContent = story.description;
        content.appendChild(descEl);
      }
      if (story.menuItemId) {
        const linkBtn = doc.createElement("a");
        linkBtn.className = "contentBtn";
        linkBtn.href = `/apps/menyra-social/index.html?r=${encodeURIComponent(restaurantId)}&tab=menu&src=story`;
        linkBtn.innerHTML = "<span>👀</span><span>Produkt ansehen</span>";
        content.appendChild(linkBtn);
      }
      reel.appendChild(content);

      const rail = doc.createElement("div");
      rail.className = "rail";
      const progress = doc.createElement("div");
      progress.className = "railBtn";
      progress.innerHTML = `<div class=\"railIcon\">${index + 1}/${stories.length}</div>`;
      rail.appendChild(progress);
      reel.appendChild(rail);

      reelEntries.push({
        index,
        story,
        reel,
        overlayAnchor: vignette,
        mediaKind: getMediaKind(story),
        mediaEl: null,
        mediaMounted: false,
        mediaSrc: ""
      });
      fragment.appendChild(reel);
    });
    container.appendChild(fragment);
    updateRenderedTopbarMeta(meta);
    primeNearbyMedia(0);
    setActiveIndex(0, { force: true });
  }

  function bindMediaUnlock() {
    if (!doc) return;
    const handleFirstInteraction = () => {
      if (hasUnlockedMedia) return;
      hasUnlockedMedia = true;
      suppressNextMediaToggle = true;
      syncMediaPlayback({ fromUserGesture: true });
      if (win?.setTimeout) {
        win.setTimeout(() => {
          suppressNextMediaToggle = false;
        }, 0);
      } else {
        suppressNextMediaToggle = false;
      }
      doc.removeEventListener("pointerdown", handleFirstInteraction, true);
      doc.removeEventListener("touchstart", handleFirstInteraction, true);
      doc.removeEventListener("keydown", handleFirstInteraction, true);
    };

    doc.addEventListener("pointerdown", handleFirstInteraction, { passive: true, capture: true });
    doc.addEventListener("touchstart", handleFirstInteraction, { passive: true, capture: true });
    doc.addEventListener("keydown", handleFirstInteraction, true);
  }

  function bindActiveStoryTracking(container) {
    if (!container) return;
    container.addEventListener("scroll", scheduleActiveIndexSync, { passive: true });
    win?.addEventListener?.("resize", scheduleActiveIndexSync);
    scheduleActiveIndexSync();
  }

  function setupKeyboardNav() {
    if (!doc) return;
    doc.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === " ") {
        event.preventDefault();
        scrollByOne(1);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        scrollByOne(-1);
      }
    });
  }

  function scrollByOne(direction = 1) {
    if (!doc) return;
    const reels = Array.from(doc.querySelectorAll(".reel"));
    if (!reels.length) return;
    const viewportCenter = (win?.innerHeight || 0) / 2;
    let currentIndex = 0;
    let currentDistance = Number.POSITIVE_INFINITY;

    reels.forEach((reel, index) => {
      const rect = reel.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportCenter);
      if (distance < currentDistance) {
        currentDistance = distance;
        currentIndex = index;
      }
    });

    const nextIndex = Math.max(0, Math.min(reels.length - 1, currentIndex + direction));
    reels[nextIndex]?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  function bindMediaClickToggle() {
    if (!doc) return;
    doc.addEventListener("click", (event) => {
      if (suppressNextMediaToggle) {
        suppressNextMediaToggle = false;
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("a,button")) return;
      const reel = target.closest(".reel");
      if (!reel) return;
      const index = Number.parseInt(reel.dataset.index || "", 10);
      if (Number.isNaN(index)) return;
      if (index !== activeIndex) {
        reel.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
      const mediaEl = videos.get(index);
      if (!mediaEl || mediaEl.tagName !== "VIDEO") return;
      if (mediaEl.paused) {
        mediaEl.defaultMuted = !hasUnlockedMedia;
        mediaEl.muted = !hasUnlockedMedia;
        mediaEl.volume = hasUnlockedMedia ? 1 : 0;
        void mediaEl.play().catch(() => {});
      } else {
        mediaEl.pause();
      }
    });
  }

  async function start() {
    if (!doc || !win) return;
    const rid = getParam("r");
    const reelsContainer = doc.getElementById("reelsContainer");
    const loadingState = doc.getElementById("loadingState");
    const emptyState = doc.getElementById("emptyState");
    hideStandaloneTopbar();

    if (!rid || !reelsContainer || !loadingState || !emptyState) {
      if (loadingState) loadingState.style.display = "none";
      if (emptyState) emptyState.style.display = "flex";
      showStandaloneTopbar(null, rid);
      return;
    }

    const initialAutoplayCapability = getAutoplayPolicyCapability();
    if (initialAutoplayCapability === "allowed") {
      autoplayProbeState = "allowed";
      hasUnlockedMedia = true;
    } else if (initialAutoplayCapability === "allowed-muted" || initialAutoplayCapability === "disallowed") {
      autoplayProbeState = "blocked";
    }

    let restaurantMeta = null;
    let stories = [];
    let didRenderFromCache = false;
    let currentStorySignature = "";
    const metaPromise = loadRestaurantMeta(rid);
    const warmHint = readWarmStoryHint(rid);
    const storyCache = readStoryCache(rid);

    if (warmHint?.meta) {
      showStandaloneTopbar(warmHint.meta, rid);
    }
    if (storyCache?.stories?.length) {
      restaurantMeta = storyCache.meta || warmHint?.meta || null;
      currentStorySignature = storyCache.signature || buildStorySignature(storyCache.stories);
      renderStories(storyCache.stories, reelsContainer, restaurantMeta, rid);
      loadingState.style.display = "none";
      didRenderFromCache = true;
      bindMediaUnlock();
      bindActiveStoryTracking(reelsContainer);
      setupKeyboardNav();
      bindMediaClickToggle();
    }

    try {
      stories = await loadStories(rid, 20);
    } catch (err) {
      console.error(err);
    }

    if (!Array.isArray(stories) || !stories.length) {
      try {
        restaurantMeta = await metaPromise;
      } catch {}
      if (didRenderFromCache) {
        if (restaurantMeta) updateRenderedTopbarMeta(restaurantMeta);
        return;
      }
      loadingState.style.display = "none";
      emptyState.style.display = "flex";
      showStandaloneTopbar(restaurantMeta, rid);
      return;
    }

    const nextStorySignature = buildStorySignature(stories);
    if (!didRenderFromCache || nextStorySignature !== currentStorySignature) {
      renderStories(stories, reelsContainer, warmHint?.meta || null, rid);
      loadingState.style.display = "none";
      if (!didRenderFromCache) {
        bindMediaUnlock();
        bindActiveStoryTracking(reelsContainer);
        setupKeyboardNav();
        bindMediaClickToggle();
      }
    }

    try {
      restaurantMeta = await metaPromise;
      if (restaurantMeta) updateRenderedTopbarMeta(restaurantMeta);
    } catch {}

    writeStoryCache(rid, {
      meta: restaurantMeta || warmHint?.meta || null,
      stories
    });
    scheduleActiveIndexSync();
  }

  return {
    start
  };
}
