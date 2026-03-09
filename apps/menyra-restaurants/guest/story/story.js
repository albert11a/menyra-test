import { db } from "/shared/firebase-config.js?v=2026-03-08-firestore-net-1";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

function qs(id) {
  return document.getElementById(id);
}

function getParam(name) {
  const url = new URL(window.location.href);
  return (url.searchParams.get(name) || "").trim();
}

function toDateSafe(value) {
  try {
    if (value && typeof value.toDate === "function") return value.toDate();
  } catch {}
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  return null;
}

function isStoryActive(row = {}) {
  const status = String(row.status || "").trim().toLowerCase();
  if (["draft", "inactive", "archived", "deleted"].includes(status)) return false;
  if (row.active === false || row.isActive === false) return false;
  const expiresAt = toDateSafe(row.expiresAt || row.expireAt || row.expiresOn);
  if (expiresAt && expiresAt.getTime() < Date.now()) return false;
  return true;
}

function mapStoryRow(id, row = {}) {
  const embedUrl = String(row.embedUrl || "").trim();
  const videoUrl = String(
    row.videoUrl
    || row.mediaUrl
    || row.url
    || row.playbackUrl
    || row.assetUrl
    || row.video?.url
    || ""
  ).trim();
  const hasMedia = !!embedUrl || !!videoUrl || (!!row.libraryId && !!row.videoId);
  if (!hasMedia) return null;
  if (!isStoryActive(row)) return null;
  return {
    id,
    title: String(row.title || row.captionTitle || "").trim(),
    description: String(row.description || row.caption || row.text || "").trim(),
    menuItemId: String(row.menuItemId || row.itemId || "").trim(),
    embedUrl,
    videoUrl,
    libraryId: row.libraryId || "",
    videoId: row.videoId || "",
    createdAt: toDateSafe(row.createdAt) || toDateSafe(row.updatedAt) || new Date(0)
  };
}

async function loadRestaurantMeta(restaurantId) {
  if (!restaurantId) return null;
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() || {}) };
  } catch {
    return null;
  }
}

async function loadStories(restaurantId, max = 20) {
  if (!restaurantId) return [];
  const ref = collection(db, "restaurants", restaurantId, "stories");
  let snap = null;
  try {
    snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(Math.max(max * 3, max))));
  } catch {
    try {
      snap = await getDocs(query(ref, limit(Math.max(max * 3, max))));
    } catch {
      return [];
    }
  }
  const stories = [];
  snap.forEach((docSnap) => {
    const mapped = mapStoryRow(docSnap.id, docSnap.data() || {});
    if (mapped) stories.push(mapped);
  });
  stories.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
  return stories.slice(0, max);
}

let videos = new Map();

async function main() {
  const rid = getParam("r");
  const reelsContainer = qs("reelsContainer");
  const loadingState = qs("loadingState");
  const emptyState = qs("emptyState");

  if (!rid) {
    loadingState.style.display = "none";
    emptyState.style.display = "flex";
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

  renderStories(stories, reelsContainer, restaurantMeta);
  const tapHint = qs("tapHint");
  if (tapHint) tapHint.style.display = "flex";
  setupAutoplay();
  setupKeyboardNav();
}

function renderStories(stories, container, meta) {
  container.innerHTML = "";
  videos = new Map();

  stories.forEach((story, index) => {
    const reel = document.createElement("div");
    reel.className = "reel";
    reel.dataset.index = String(index);

    let videoElement = null;
    const embedUrl = (story.embedUrl || "").trim() || (
      story.libraryId && story.videoId
        ? `https://iframe.mediadelivery.net/embed/${encodeURIComponent(String(story.libraryId))}/${encodeURIComponent(String(story.videoId))}`
        : ""
    );

    if (embedUrl) {
      const iframe = document.createElement("iframe");
      iframe.className = "reel-video";
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.setAttribute("allowfullscreen", "");
      iframe.frameBorder = "0";
      iframe.src = `${embedUrl}?autoplay=true&loop=true&muted=true&preload=true&controls=0`;
      videoElement = iframe;
    } else if (story.videoUrl) {
      const video = document.createElement("video");
      video.className = "reel-video";
      video.src = String(story.videoUrl || "").trim();
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.volume = 1;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.preload = "auto";
      videoElement = video;
    }

    if (videoElement) {
      videos.set(index, videoElement);
      reel.appendChild(videoElement);
    }

    const vignette = document.createElement("div");
    vignette.className = "vignette";
    reel.appendChild(vignette);

    const topbar = document.createElement("div");
    topbar.className = "topbar";

    const topbarLeft = document.createElement("div");
    topbarLeft.className = "topbarLeft";

    const backBtn = document.createElement("button");
    backBtn.className = "btnIcon";
    backBtn.textContent = "←";
    backBtn.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/apps/menyra-social/index.html?tab=feed";
      }
    });
    topbarLeft.appendChild(backBtn);

    const brandPill = document.createElement("div");
    brandPill.className = "brandPill";

    const displayName = (meta?.restaurantName || meta?.name || meta?.slug || "Unbenanntes Lokal");
    const logoUrl = meta?.logoUrl || meta?.logo || "";

    const brandLogo = document.createElement("div");
    brandLogo.className = "brandLogo";
    if (logoUrl) {
      brandLogo.style.backgroundImage = `url(${logoUrl})`;
    } else {
      brandLogo.style.backgroundImage = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
    brandPill.appendChild(brandLogo);

    const brandName = document.createElement("div");
    brandName.className = "brandName";
    brandName.textContent = displayName;
    brandPill.appendChild(brandName);

    topbarLeft.appendChild(brandPill);
    topbar.appendChild(topbarLeft);
    reel.appendChild(topbar);

    const content = document.createElement("div");
    content.className = "content";

    if (story.title) {
      const title = document.createElement("div");
      title.className = "contentTitle";
      title.textContent = story.title;
      content.appendChild(title);
    }

    if (story.description) {
      const desc = document.createElement("div");
      desc.className = "contentDesc";
      desc.textContent = story.description;
      content.appendChild(desc);
    }

    if (story.menuItemId) {
      const linkBtn = document.createElement("a");
      linkBtn.className = "contentBtn";
      linkBtn.href = `/apps/menyra-social/index.html?r=${encodeURIComponent(getParam("r"))}&tab=menu`;
      linkBtn.innerHTML = `<span>👀</span><span>Produkt ansehen</span>`;
      content.appendChild(linkBtn);
    }

    reel.appendChild(content);

    const rail = document.createElement("div");
    rail.className = "rail";
    const progress = document.createElement("div");
    progress.className = "railBtn";
    progress.innerHTML = `<div class="railIcon">${index + 1}/${stories.length}</div>`;
    rail.appendChild(progress);
    reel.appendChild(rail);

    container.appendChild(reel);
  });
}

function setupAutoplay() {
  let hasUserInteracted = false;
  const tapHint = qs("tapHint");

  const handleFirstInteraction = () => {
    hasUserInteracted = true;
    if (tapHint) tapHint.style.display = "none";
    videos.forEach((videoEl) => {
      if (videoEl && videoEl.tagName === "VIDEO") {
        videoEl.muted = false;
        videoEl.volume = 1;
        void videoEl.play().catch(() => {});
      }
    });
    document.removeEventListener("touchstart", handleFirstInteraction);
    document.removeEventListener("click", handleFirstInteraction);
  };

  document.addEventListener("touchstart", handleFirstInteraction, { once: true });
  document.addEventListener("click", handleFirstInteraction, { once: true });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const reel = entry.target;
      const index = Number.parseInt(reel.dataset.index || "", 10);
      const videoElement = videos.get(index);
      if (!videoElement) return;

      if (entry.isIntersecting && hasUserInteracted) {
        if (videoElement.tagName === "VIDEO") {
          videoElement.muted = false;
          videoElement.volume = 1;
          if (videoElement.paused) {
            void videoElement.play().catch(() => {});
          }
        }
      } else if (!entry.isIntersecting) {
        if (videoElement.tagName === "VIDEO") {
          videoElement.pause();
        }
      }
    });
  }, {
    threshold: 0.7,
    rootMargin: "-10% 0px -10% 0px"
  });

  document.querySelectorAll(".reel").forEach((reel) => {
    observer.observe(reel);
  });
}

function setupKeyboardNav() {
  document.addEventListener("keydown", (event) => {
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
  const reels = Array.from(document.querySelectorAll(".reel"));
  if (!reels.length) return;
  const viewportCenter = window.innerHeight / 2;
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
  const targetIndex = Math.max(0, Math.min(reels.length - 1, currentIndex + direction));
  reels[targetIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
}

void main().catch((err) => {
  console.error(err);
  const loadingState = qs("loadingState");
  const emptyState = qs("emptyState");
  if (loadingState) loadingState.style.display = "none";
  if (emptyState) emptyState.style.display = "flex";
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const reel = target.closest(".reel");
  if (!reel) return;
  const index = Number.parseInt(reel.dataset.index || "", 10);
  const videoElement = videos.get(index);
  if (!videoElement || videoElement.tagName !== "VIDEO") return;
  if (videoElement.paused) {
    void videoElement.play().catch(() => {});
  } else {
    videoElement.pause();
  }
});