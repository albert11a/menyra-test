import { db } from "@shared/firebase-config.js";
import {
  collection,
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  attachAuthHeader,
  buildUrl,
  formatRelative,
  initials,
  toDateSafe
} from "./_shared/social-core.js";

const feedTabs = document.getElementById("feedTabs");
const feedList = document.getElementById("feedList");
const feedStatus = document.getElementById("feedStatus");
const cityInput = document.getElementById("cityInput");
const refreshBtn = document.getElementById("refreshBtn");
const storiesList = document.getElementById("storiesList");
const storiesStatus = document.getElementById("storiesStatus");

let currentType = "all";

function toCloudflareImageUrl(raw, options = {}) {
  const value = String(raw || "").trim();
  if (!value) return "";

  let path = value;
  try {
    const url = new URL(value);
    // If it's a full R2 public URL, just take the pathname
    if (url.hostname.endsWith(".r2.dev")) {
      path = url.pathname;
    }
  } catch (e) {
    // Not a full URL, assume it's a path already
  }

  // Ensure path starts with a slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(options)) {
    if (val !== undefined) params.set(key, String(val));
  }
  const query = params.toString().replace(/&/g, ",");

  // Format: /cdn-cgi/image/width=400,quality=75/path/to/image.jpg
  return `/cdn-cgi/image/${query}${cleanPath}`;
}

function setActiveTab(btn) {
  feedTabs.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b === btn));
  currentType = btn.dataset.type || "offer";
}

function shortText(text, max = 90) {
  const safe = String(text || "").trim();
  return safe.length > max ? safe.slice(0, max).trim() + "..." : safe || "";
}

function renderFeed(items) {
  feedList.innerHTML = "";
  if (!items.length) {
    feedList.innerHTML = "<div class='empty'>No posts yet. Try another tab or city.</div>";
    return;
  }
  items.forEach((item) => {
    const createdAt = formatRelative(toDateSafe(item.createdAt));
    const title = item.businessName || item.restaurantName || item.name || "Business";
    const caption = item.captionShort || shortText(item.caption || "");
    const rawThumb = item.thumbUrl || item.mediaUrl || item.media?.[0]?.thumbUrl || item.media?.[0]?.url || "";
    const thumb = toCloudflareImageUrl(rawThumb, { width: 400, quality: 75, format: "auto" });
    const mediaType = item.mediaType || item.media?.[0]?.type || "image";
    const showType = currentType === "all";
    const typeBadge = showType ? `<span class="badge">${item.postType || "-"}</span>` : "";
    const link = buildUrl("apps/menyra-social/post/index.html", { id: item.id || item.postId });

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="media">
        ${thumb ? `<img src="${thumb}" alt="${title}"/>` : `<div class="meta">${mediaType}</div>`}
      </div>
      <h3>${title}</h3>
      <div class="meta">${caption}</div>
      <div class="row" style="margin-top:10px; justify-content:space-between;">
        <span class="badge">${item.city || "-"}</span>
        ${typeBadge}
        <span class="meta">${createdAt}</span>
      </div>
      <div class="row" style="margin-top:10px;">
        <a class="btn btn--ghost" href="${link}">Open</a>
      </div>
    `;
    feedList.appendChild(card);
  });
}

function renderStories(items) {
  if (!storiesList) return;
  if (!items.length) {
    storiesList.innerHTML = "<div class='empty'>No active stories yet.</div>";
    return;
  }
  storiesList.innerHTML = items.map((item) => {
    const name = item.name || "Business";
    const city = item.city || "";
    const rawLogo = item.logo || "";
    const logo = toCloudflareImageUrl(rawLogo, { width: 80, height: 80, fit: "cover", quality: 75, format: "auto" });
    const avatar = logo
      ? `<img src="${logo}" alt="${name}"/>`
      : `<span>${initials(name)}</span>`;
    const link = buildUrl("apps/menyra-restaurants/guest/story/index.html", { r: item.id });
    return `
      <a class="story-card" href="${link}">
        <div class="story-avatar">${avatar}</div>
        <div class="story-name">${name}</div>
        <div class="story-meta">${city}</div>
      </a>
    `;
  }).join("");
}

async function loadStories() {
  if (!storiesList) return;
  if (storiesStatus) storiesStatus.textContent = "Loading stories...";

  try {
    const now = Timestamp.now();
    const snap = await getDocs(
      query(
        collectionGroup(db, "stories"),
        where("expiresAt", ">", now),
        orderBy("expiresAt", "desc"),
        limit(40)
      )
    );

    const byRestaurant = new Map();
    snap.forEach((docSnap) => {
      const rid = docSnap.ref.parent?.parent?.id;
      if (!rid || byRestaurant.has(rid)) return;
      const data = docSnap.data() || {};
      if (data.status === "deleted") return;
      byRestaurant.set(rid, data);
    });

    const restaurantIds = Array.from(byRestaurant.keys());
    if (!restaurantIds.length) {
      renderStories([]);
      if (storiesStatus) storiesStatus.textContent = "No active stories.";
      return;
    }

    const restaurantSnaps = await Promise.all(
      restaurantIds.map((rid) => getDoc(doc(db, "restaurants", rid)))
    );

    const items = restaurantSnaps.map((snap, idx) => {
      if (!snap.exists()) return null;
      const data = snap.data() || {};
      return {
        id: restaurantIds[idx],
        name: data.name || data.restaurantName || "Business",
        logo: data.logoUrl || data.logo || "",
        city: data.city || "",
        story: byRestaurant.get(restaurantIds[idx])
      };
    }).filter(Boolean);

    renderStories(items);
    if (storiesStatus) storiesStatus.textContent = "";
  } catch (err) {
    console.error(err);
    if (storiesStatus) storiesStatus.textContent = "Failed to load stories.";
  }
}

async function queryFeed(city, type) {
  const ref = collection(db, "socialFeed");
  const trimmedCity = String(city || "").trim();
  const constraints = [where("status", "==", "active")];
  if (trimmedCity) constraints.push(where("city", "==", trimmedCity));
  if (type && type !== "all") constraints.push(where("postType", "==", type));
  const baseQuery = query(ref, ...constraints, orderBy("createdAt", "desc"), limit(20));

  try {
    const snap = await getDocs(baseQuery);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Feed query fallback", err);
    const fallback = await getDocs(query(ref, limit(40)));
    return fallback.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((d) => (d.status || "active") === "active")
      .filter((d) => !trimmedCity || (d.city || "").toLowerCase() === trimmedCity.toLowerCase())
      .filter((d) => !type || type === "all" || d.postType === type)
      .sort((a, b) => {
        const ta = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const tb = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return tb - ta;
      })
      .slice(0, 20);
  }
}

async function loadFeed() {
  const city = cityInput?.value?.trim() || "";
  feedStatus.textContent = "Loading feed...";
  try {
    let items = await queryFeed(city, currentType);
    if (!items.length && city) {
      const fallbackItems = await queryFeed("", currentType);
      if (fallbackItems.length) {
        renderFeed(fallbackItems);
        feedStatus.textContent = "No posts for this city. Showing all cities.";
        return;
      }
    }
    renderFeed(items);
    feedStatus.textContent = items.length ? "" : (city ? "No active posts for this city." : "No active posts.");
  } catch (err) {
    console.error(err);
    feedStatus.textContent = "Failed to load feed.";
  }
}

feedTabs.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  setActiveTab(btn);
  loadFeed();
});

refreshBtn.addEventListener("click", () => {
  loadFeed();
  loadStories();
});

const initialTab = feedTabs?.querySelector("button.is-active") || feedTabs?.querySelector("button");
if (initialTab) setActiveTab(initialTab);
loadFeed();
loadStories();
