import { db } from "@shared/firebase-config.js";
import { collection, getDocs, limit, query } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  attachAuthHeader,
  buildUrl,
  formatKm,
  getGeo,
  haversineKm
} from "../_shared/social-core.js";

const cityInput = document.getElementById("cityInput");
const geoBtn = document.getElementById("geoBtn");
const geoStatus = document.getElementById("geoStatus");
const refreshBtn = document.getElementById("refreshBtn");
const discoverStatus = document.getElementById("discoverStatus");
const discoverList = document.getElementById("discoverList");

attachAuthHeader({ linkId: "authLink", userId: "authUser" });

let userLocation = null;

function loadSavedLocation() {
  try {
    const raw = localStorage.getItem("menyra_social_location");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.lat === "number" && typeof parsed.lng === "number") return parsed;
  } catch (err) {
    console.warn(err);
  }
  return null;
}

function saveLocation(loc) {
  userLocation = loc;
  try {
    localStorage.setItem("menyra_social_location", JSON.stringify(loc));
  } catch (err) {
    console.warn(err);
  }
  updateGeoStatus();
}

function updateGeoStatus() {
  if (!userLocation) {
    geoStatus.textContent = "Location not set";
    return;
  }
  geoStatus.textContent = `Location: ${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)}`;
}

async function fetchBusinesses() {
  const snap = await getDocs(query(collection(db, "restaurants"), limit(250)));
  const list = [];
  snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
  return list;
}

function normalizeStatus(status) {
  return String(status || "").toLowerCase();
}

function renderBusinesses(items) {
  discoverList.innerHTML = "";
  if (!items.length) {
    discoverList.innerHTML = "<div class='empty'>No businesses match this city yet.</div>";
    return;
  }

  items.forEach((item) => {
    const name = item.name || item.restaurantName || "Business";
    const distance = item.distanceKm !== null ? formatKm(item.distanceKm) : "-";
    const link = buildUrl("apps/menyra-main/index.html", { r: item.id });

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="row" style="justify-content:space-between;">
        <span class="badge">${item.type || "business"}</span>
        <span class="meta">${distance}</span>
      </div>
      <h3>${name}</h3>
      <div class="meta">${item.city || "-"}</div>
      <div class="row" style="margin-top:12px;">
        <a class="btn btn--ghost" href="${link}">Open Main</a>
      </div>
    `;
    discoverList.appendChild(card);
  });
}

async function loadDiscover() {
  discoverStatus.textContent = "Loading businesses...";
  try {
    const city = cityInput.value.trim();
    const all = await fetchBusinesses();

    let filtered = all.filter((b) => {
      const status = normalizeStatus(b.status);
      return ["active", "demo", "test", "trial"].includes(status || "active");
    });

    filtered = filtered.map((b) => {
      const geo = getGeo(b);
      let distanceKm = null;
      if (userLocation && geo) {
        distanceKm = haversineKm(userLocation, geo);
      }
      const cityMatch = city
        ? String(b.city || "").toLowerCase() === city.toLowerCase()
        : true;
      return { ...b, distanceKm, cityMatch };
    });

    if (userLocation) {
      filtered.sort((a, b) => {
        if (city && a.cityMatch !== b.cityMatch) return a.cityMatch ? -1 : 1;
        const da = a.distanceKm === null ? Number.POSITIVE_INFINITY : a.distanceKm;
        const db = b.distanceKm === null ? Number.POSITIVE_INFINITY : b.distanceKm;
        return da - db;
      });
    } else {
      if (city) filtered = filtered.filter((b) => b.cityMatch);
      filtered.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    }

    renderBusinesses(filtered);
    discoverStatus.textContent = filtered.length ? "" : "No businesses found.";
  } catch (err) {
    console.error(err);
    discoverStatus.textContent = "Failed to load businesses.";
  }
}

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    geoStatus.textContent = "Geolocation not supported";
    return;
  }
  geoStatus.textContent = "Locating...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      saveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      loadDiscover();
    },
    (err) => {
      console.warn(err);
      geoStatus.textContent = "Location blocked";
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
});

refreshBtn.addEventListener("click", loadDiscover);

userLocation = loadSavedLocation();
updateGeoStatus();
loadDiscover();
