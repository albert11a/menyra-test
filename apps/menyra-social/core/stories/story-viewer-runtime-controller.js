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

  function buildIframeSrc(story) {
    if (story.embedUrl) {
      return `${story.embedUrl}?autoplay=true&loop=true&muted=true&preload=true&controls=0`;
    }
    if (story.libraryId && story.videoId) {
      const embedUrl = `https://iframe.mediadelivery.net/embed/${encodeURIComponent(story.libraryId)}/${encodeURIComponent(story.videoId)}`;
      return `${embedUrl}?autoplay=true&loop=true&muted=true&preload=true&controls=0`;
    }
    return "";
  }

  function renderStories(stories, container, meta, restaurantId) {
    if (!doc || !container) return;
    videos.clear();
    container.innerHTML = "";

    stories.forEach((story, index) => {
      const reel = doc.createElement("div");
      reel.className = "reel";
      reel.dataset.index = String(index);

      let mediaEl = null;
      const iframeSrc = buildIframeSrc(story);
      if (iframeSrc) {
        const iframe = doc.createElement("iframe");
        iframe.className = "reel-video";
        iframe.allow = "autoplay; fullscreen; picture-in-picture";
        iframe.setAttribute("allowfullscreen", "");
        iframe.frameBorder = "0";
        iframe.src = iframeSrc;
        mediaEl = iframe;
      } else if (story.videoUrl) {
        const video = doc.createElement("video");
        video.className = "reel-video";
        video.src = story.videoUrl;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.volume = 1;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.preload = "auto";
        mediaEl = video;
      } else if (story.imageUrl) {
        const image = doc.createElement("img");
        image.className = "reel-image";
        image.src = story.imageUrl;
        image.loading = index < 2 ? "eager" : "lazy";
        image.decoding = "async";
        mediaEl = image;
      }

      if (mediaEl) {
        videos.set(index, mediaEl);
        reel.appendChild(mediaEl);
      }

      const vignette = doc.createElement("div");
      vignette.className = "vignette";
      reel.appendChild(vignette);

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

      const displayName = meta?.restaurantName || meta?.name || meta?.slug || "Unbenanntes Lokal";
      const logoUrl = meta?.logoUrl || meta?.logo || "";

      const brandLogo = doc.createElement("div");
      brandLogo.className = "brandLogo";
      if (logoUrl) {
        brandLogo.style.backgroundImage = `url(${logoUrl})`;
      } else {
        brandLogo.style.backgroundImage = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      }
      brandPill.appendChild(brandLogo);

      const brandName = doc.createElement("div");
      brandName.className = "brandName";
      brandName.textContent = displayName;
      brandPill.appendChild(brandName);

      topbarLeft.appendChild(brandPill);
      topbar.appendChild(topbarLeft);
      reel.appendChild(topbar);

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
        linkBtn.href = `/apps/menyra-social/index.html?r=${encodeURIComponent(restaurantId)}&tab=menu`;
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

      container.appendChild(reel);
    });
  }

  function setupAutoplay() {
    if (!doc || typeof IntersectionObserver !== "function") return;
    let hasUserInteracted = false;
    const tapHint = doc.getElementById("tapHint");

    const handleFirstInteraction = () => {
      hasUserInteracted = true;
      if (tapHint) tapHint.style.display = "none";
      videos.forEach((mediaEl) => {
        if (mediaEl && mediaEl.tagName === "VIDEO") {
          mediaEl.muted = false;
          mediaEl.volume = 1;
          void mediaEl.play().catch(() => {});
        }
      });
      doc.removeEventListener("touchstart", handleFirstInteraction);
      doc.removeEventListener("click", handleFirstInteraction);
    };

    doc.addEventListener("touchstart", handleFirstInteraction, { once: true });
    doc.addEventListener("click", handleFirstInteraction, { once: true });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const reel = entry.target;
        const index = Number.parseInt(reel?.dataset?.index || "", 10);
        const mediaEl = videos.get(index);
        if (!mediaEl) return;

        if (entry.isIntersecting && hasUserInteracted) {
          if (mediaEl.tagName === "VIDEO") {
            mediaEl.muted = false;
            mediaEl.volume = 1;
            if (mediaEl.paused) void mediaEl.play().catch(() => {});
          }
          return;
        }

        if (!entry.isIntersecting && mediaEl.tagName === "VIDEO") {
          mediaEl.pause();
        }
      });
    }, {
      threshold: 0.7,
      rootMargin: "-10% 0px -10% 0px"
    });

    doc.querySelectorAll(".reel").forEach((reel) => observer.observe(reel));
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
    reels[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bindMediaClickToggle() {
    if (!doc) return;
    doc.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const reel = target.closest(".reel");
      if (!reel) return;
      const index = Number.parseInt(reel.dataset.index || "", 10);
      const mediaEl = videos.get(index);
      if (!mediaEl || mediaEl.tagName !== "VIDEO") return;
      if (mediaEl.paused) {
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
    const tapHint = doc.getElementById("tapHint");

    if (!rid || !reelsContainer || !loadingState || !emptyState) {
      if (loadingState) loadingState.style.display = "none";
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    let restaurantMeta = null;
    let stories = [];
    try {
      [restaurantMeta, stories] = await Promise.all([
        loadRestaurantMeta(rid),
        loadStories(rid, 20)
      ]);
    } catch (err) {
      console.error(err);
    }

    loadingState.style.display = "none";
    if (!Array.isArray(stories) || !stories.length) {
      emptyState.style.display = "flex";
      return;
    }

    renderStories(stories, reelsContainer, restaurantMeta, rid);
    if (tapHint) tapHint.style.display = "flex";
    setupAutoplay();
    setupKeyboardNav();
    bindMediaClickToggle();
  }

  return {
    start
  };
}
