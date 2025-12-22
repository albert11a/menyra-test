// =========================================================
// MENYRA Social — Story
// - Loads stories from Firestore per restaurant
// - App-like vertical snap + lightweight attach/detach for videos
// =========================================================

import { db, getQueryParam } from "../../shared/firebase-config.js";
import { streamUrls } from "../../shared/bunny-public.js";

import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// --- Params ---
const restaurantId = (getQueryParam("r") || "").trim();
const tableId = (getQueryParam("t") || "").trim();

// --- DOM ---
const reels = document.getElementById("reels");
const backBtn = document.getElementById("backBtn");
const refreshBtn = document.getElementById("refreshBtn");
const restLogo = document.getElementById("storyRestaurantLogo");
const restName = document.getElementById("storyRestaurantName");

backBtn.addEventListener("click", () => {
  // Prefer going back to Karte for same restaurant
  if (restaurantId) {
    const qs = new URLSearchParams();
    qs.set("r", restaurantId);
    if (tableId) qs.set("t", tableId);
    window.location.href = `../guest/karte.html?${qs.toString()}`;
    return;
  }
  history.back();
});

refreshBtn.addEventListener("click", () => {
  loadAll().catch(console.error);
});

function humanTime(ts) {
  try {
    const d = ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : null);
    if (!d) return "";
    const diff = Math.max(0, Date.now() - d.getTime());
    const m = Math.floor(diff / 60000);
    if (m < 1) return "jetzt";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    return `${days}d`;
  } catch {
    return "";
  }
}

function canPlayHlsNatively() {
  const v = document.createElement("video");
  return !!v.canPlayType && v.canPlayType("application/vnd.apple.mpegurl") !== "";
}

function chooseVideoSrc(story) {
  // Prefer MP4 for Chrome/desktop; HLS for iOS Safari.
  const urls = story?.urls || (story?.videoId ? streamUrls(story.videoId) : null);
  if (!urls) return "";
  if (canPlayHlsNatively() && urls.hls) return urls.hls;
  return urls.mp4_720 || urls.hls || "";
}

function renderEmpty(msg) {
  reels.innerHTML = `
    <div class="empty">
      <div>
        <div style="font-weight:900; font-size:16px; color:#fff; margin-bottom:8px;">Keine Story</div>
        <div>${msg || "Der Kunde hat noch nichts gepostet."}</div>
      </div>
    </div>
  `;
}

function iconSvg(pathD) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${pathD}"></path></svg>`;
}

function storyReelEl(story, restaurant) {
  const reel = document.createElement("section");
  reel.className = "reel";
  reel.dataset.storyId = story.id;

  const overlay = document.createElement("div");
  overlay.className = "overlay";

  // Media
  const type = story.mediaType || (story.videoId ? "video" : "image");
  let media;

  if (type === "video") {
    media = document.createElement("video");
    media.className = "reelMedia";
    media.setAttribute("playsinline", "");
    media.setAttribute("webkit-playsinline", "");
    media.muted = true;
    media.loop = true;
    media.preload = "none";
    media.dataset.type = "video";
    media.dataset.src = chooseVideoSrc(story);
  } else {
    media = document.createElement("img");
    media.className = "reelMedia";
    media.alt = story.caption || "Story";
    media.loading = "lazy";
    media.decoding = "async";
    media.dataset.type = "image";
    media.dataset.src = story.mediaUrl || "";
  }

  // Right actions
  const actions = document.createElement("div");
  actions.className = "rightActions";

  const likeBtn = document.createElement("button");
  likeBtn.className = "iconBtn";
  likeBtn.type = "button";
  likeBtn.innerHTML = iconSvg("M12 21s-7-4.35-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.65-7 10-7 10z");

  const likeCount = document.createElement("div");
  likeCount.className = "count";
  likeCount.textContent = String(story.likeCount || 0);

  const commentBtn = document.createElement("button");
  commentBtn.className = "iconBtn";
  commentBtn.type = "button";
  commentBtn.innerHTML = iconSvg("M21 6a3 3 0 00-3-3H6A3 3 0 003 6v9a3 3 0 003 3h9l3.5 3.5V18h.5a3 3 0 003-3z");

  const commentCount = document.createElement("div");
  commentCount.className = "count";
  commentCount.textContent = String(story.commentCount || 0);

  actions.appendChild(likeBtn);
  actions.appendChild(likeCount);
  actions.appendChild(commentBtn);
  actions.appendChild(commentCount);

  // Product tag (optional)
  let productTag;
  const prod = story.product || story.productSnapshot;
  if (prod && (prod.name || prod.title)) {
    productTag = document.createElement("div");
    productTag.className = "productTag";

    const img = document.createElement("img");
    img.className = "productImg";
    img.alt = prod.name || prod.title || "Produkt";
    img.loading = "lazy";
    img.decoding = "async";
    img.src = prod.imageUrl || prod.image || "";

    const meta = document.createElement("div");
    meta.className = "productMeta";
    const pn = document.createElement("div");
    pn.className = "productName";
    pn.textContent = prod.name || prod.title || "Produkt";
    const pp = document.createElement("div");
    pp.className = "productPrice";
    pp.textContent = prod.priceLabel || prod.price || "";
    meta.appendChild(pn);
    meta.appendChild(pp);

    productTag.appendChild(img);
    productTag.appendChild(meta);

    // For now: just show a hint. Later we deep-link to detajet.html.
    productTag.addEventListener("click", () => {
      alert(`Produkt: ${pn.textContent}`);
    });
  }

  // Like demo (local only for now)
  likeBtn.addEventListener("click", () => {
    const k = `menyra_story_like_${restaurantId}_${story.id}`;
    const liked = localStorage.getItem(k) === "1";
    const next = !liked;
    localStorage.setItem(k, next ? "1" : "0");
    const base = Number(story.likeCount || 0);
    const shown = next ? base + 1 : Math.max(0, base);
    likeCount.textContent = String(shown);
    likeBtn.style.transform = next ? "scale(1.04)" : "scale(1)";
    setTimeout(() => (likeBtn.style.transform = "scale(1)"), 120);
  });

  commentBtn.addEventListener("click", () => {
    alert("Kommentare: Platzhalter (kommt als nächster Step)");
  });

  // Top left overlay minimal (time)
  const top = document.createElement("div");
  top.style.position = "absolute";
  top.style.left = "12px";
  top.style.top = `calc(64px + env(safe-area-inset-top))`;
  top.style.padding = "10px 12px";
  top.style.borderRadius = "16px";
  top.style.background = "rgba(0,0,0,0.25)";
  top.style.border = "1px solid rgba(255,255,255,0.14)";
  top.style.backdropFilter = "blur(10px)";
  top.style.pointerEvents = "none";
  top.style.maxWidth = "calc(100% - 24px)";
  top.innerHTML = `<div style="font-weight:900; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${restaurant?.name || ""}</div>
                   <div style="font-size:12px; color:rgba(255,255,255,0.72); margin-top:2px;">${humanTime(story.createdAt)}</div>`;

  overlay.appendChild(top);
  overlay.appendChild(actions);
  if (productTag) overlay.appendChild(productTag);

  reel.appendChild(media);
  reel.appendChild(overlay);
  return reel;
}

// ===== Attach/Detach (videos only) =====
function attachMedia(media) {
  if (!media || media.dataset.attached === "1") return;
  const src = media.dataset.src || "";
  if (!src) return;
  media.dataset.attached = "1";
  media.src = src;
  if (media.tagName === "VIDEO") {
    media.addEventListener(
      "loadedmetadata",
      () => {
        media.play().catch(() => {});
      },
      { once: true }
    );
  }
}

function detachMedia(media) {
  if (!media || media.dataset.attached !== "1") return;
  media.dataset.attached = "0";
  if (media.tagName === "VIDEO") {
    try { media.pause(); } catch {}
  }
  media.removeAttribute("src");
  try { media.load(); } catch {}
}

function setupObserver() {
  const items = Array.from(reels.querySelectorAll(".reel"));
  if (items.length === 0) return;

  const io = new IntersectionObserver(
    (entries) => {
      // Find most visible reel
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
      if (visible.length === 0) return;

      const active = visible[0].target;
      const idx = items.indexOf(active);
      const keep = new Set([idx - 1, idx, idx + 1]);

      items.forEach((r, i) => {
        const m = r.querySelector(".reelMedia");
        if (!m) return;
        if (keep.has(i)) attachMedia(m);
        else if (Math.abs(i - idx) > 2) detachMedia(m);
      });
    },
    { root: reels, threshold: [0.6] }
  );

  items.forEach((it) => io.observe(it));

  // attach first immediately
  const first = items[0].querySelector(".reelMedia");
  attachMedia(first);
}

async function loadRestaurant() {
  if (!restaurantId) return null;
  const ref = doc(db, "restaurants", restaurantId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  restName.textContent = data.name || "Restaurant";
  restLogo.src = data.profileImageUrl || data.logoUrl || data.logo || "";
  restLogo.alt = `${restName.textContent} Logo`;
  return data;
}

async function loadStories(restaurant) {
  if (!restaurantId) {
    renderEmpty("Fehlende Restaurant-ID. Öffne Story über QR (Parameter ?r=...).");
    return;
  }

  const ref = collection(db, "restaurants", restaurantId, "stories");
  const q = query(ref, orderBy("createdAt", "desc"), limit(60));
  const snap = await getDocs(q);

  const now = Date.now();
  const list = [];
  snap.forEach((d) => {
    const s = { id: d.id, ...d.data() };
    // Optional expiry
    const exp = s.expiresAt?.toDate ? s.expiresAt.toDate().getTime() : null;
    if (exp && exp < now) return;
    list.push(s);
  });

  if (list.length === 0) {
    renderEmpty("Noch keine Story — poste im Owner Admin eine Story mit Produkt.");
    return;
  }

  reels.innerHTML = "";
  list.forEach((s) => reels.appendChild(storyReelEl(s, restaurant)));
  setupObserver();
}

async function loadAll() {
  reels.innerHTML = "";
  const restaurant = await loadRestaurant();
  await loadStories(restaurant);
}

loadAll().catch((e) => {
  console.error(e);
  renderEmpty(String(e?.message || e));
});
