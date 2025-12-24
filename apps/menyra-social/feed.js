import { db } from "@shared/firebase-config.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  attachAuthHeader,
  buildUrl,
  formatRelative,
  toDateSafe
} from "./_shared/social-core.js";

const feedTabs = document.getElementById("feedTabs");
const feedList = document.getElementById("feedList");
const feedStatus = document.getElementById("feedStatus");
const cityInput = document.getElementById("cityInput");
const refreshBtn = document.getElementById("refreshBtn");

let currentType = "all";

attachAuthHeader({ linkId: "authLink", userId: "authUser" });

function normalizeUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  return `https://${value.replace(/^\/+/, "")}`;
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
    const thumb = normalizeUrl(rawThumb);
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

refreshBtn.addEventListener("click", loadFeed);

const initialTab = feedTabs?.querySelector("button.is-active") || feedTabs?.querySelector("button");
if (initialTab) setActiveTab(initialTab);
loadFeed();
