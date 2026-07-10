export const HOTEL_DETAIL_MAP_RUNTIME_VERSION = "hotel-detail-map-runtime.v1";

// Gleiche Quellen wie die Entdecker-Karte (Discovery): Leaflet 1.9.4 + Carto
// Voyager Kacheln. Ist die Karte im App-Tab schon geladen, wird window.L
// direkt wiederverwendet (kein zweiter Download).
const LEAFLET_JS_URLS = [
  "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];
const LEAFLET_CSS_URLS = [
  "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
];
const TILE_PRIMARY_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_FALLBACK_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const HOTEL_MAP_ZOOM = 14;
const PRIMARY_TILE_ERROR_THRESHOLD = 8;

const HOTEL_PIN_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/></svg>`;

let leafletLoadPromise = null;

function ensureLeafletStylesheet() {
  if (document.querySelector("link[data-leaflet-css], link[href*='leaflet.css']")) return;
  const tryMount = (index = 0) => {
    const href = LEAFLET_CSS_URLS[index];
    if (!href) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.leafletCss = "1";
    link.addEventListener("error", () => {
      try { link.remove(); } catch {}
      tryMount(index + 1);
    }, { once: true });
    document.head.appendChild(link);
  };
  tryMount(0);
}

async function ensureLeafletLoaded() {
  if (typeof window === "undefined") return false;
  if (window.L) return true;
  if (leafletLoadPromise) return leafletLoadPromise;
  ensureLeafletStylesheet();
  leafletLoadPromise = new Promise((resolve) => {
    const loadAt = (index = 0) => {
      const src = LEAFLET_JS_URLS[index];
      if (!src) {
        resolve(false);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      const fail = () => {
        try { script.remove(); } catch {}
        loadAt(index + 1);
      };
      script.addEventListener("load", () => {
        if (window.L) resolve(true);
        else fail();
      }, { once: true });
      script.addEventListener("error", fail, { once: true });
      document.head.appendChild(script);
    };
    loadAt(0);
  }).finally(() => {
    leafletLoadPromise = null;
  });
  return leafletLoadPromise;
}

function asFiniteCoord(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readHotelFromContainer(container) {
  const lat = asFiniteCoord(container?.dataset?.mapLat);
  const lng = asFiniteCoord(container?.dataset?.mapLng);
  if (lat == null || lng == null) return null;
  return {
    lat,
    lng,
    name: String(container?.dataset?.mapName || "").trim()
  };
}

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function makeHotelIcon(name = "") {
  return window.L.divIcon({
    className: "mhd-map-marker",
    html: `<span class="mhd-map-hotel-pin" title="${escapeHtml(name)}">${HOTEL_PIN_SVG}</span>`,
    iconSize: [46, 46],
    iconAnchor: [23, 44]
  });
}

function makePlaceIcon(place = {}) {
  const category = String(place?.category || "nearby").trim() || "nearby";
  return window.L.divIcon({
    className: "mhd-map-marker",
    html: `<span class="mhd-map-place-pin mhd-map-place-pin--${escapeHtml(category)}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
}

function renderPlaceMarkers(container, places = []) {
  const map = container?.__mhdMap || null;
  if (!map || !window.L) return;
  if (container.__mhdPlaceLayer) {
    try { map.removeLayer(container.__mhdPlaceLayer); } catch {}
    container.__mhdPlaceLayer = null;
  }
  const markers = (Array.isArray(places) ? places : [])
    .filter((place) => asFiniteCoord(place?.lat) != null && asFiniteCoord(place?.lng) != null)
    .slice(0, 40)
    .map((place) => {
      const marker = window.L.marker([Number(place.lat), Number(place.lng)], {
        icon: makePlaceIcon(place),
        keyboard: false
      });
      const name = String(place?.name || "").trim();
      if (name) {
        marker.bindTooltip(escapeHtml(name), {
          direction: "top",
          offset: [0, -8],
          className: "mhd-map-tooltip"
        });
      }
      return marker;
    });
  if (!markers.length) return;
  container.__mhdPlaceLayer = window.L.layerGroup(markers).addTo(map);
}

export function setHotelDetailMapPlaces(container, places = []) {
  if (!container) return;
  container.__mhdPlaces = Array.isArray(places) ? places : [];
  if (container.__mhdMap) renderPlaceMarkers(container, container.__mhdPlaces);
}

export async function ensureHotelDetailMap({ container } = {}) {
  if (!container || container.__mhdMap || container.__mhdMapInitializing) return !!container?.__mhdMap;
  const hotel = readHotelFromContainer(container);
  if (!hotel) return false;
  container.__mhdMapInitializing = true;
  try {
    const loaded = await ensureLeafletLoaded();
    // Container kann durch einen Re-Render ersetzt worden sein.
    if (!loaded || !container.isConnected || container.__mhdMap) return !!container?.__mhdMap;
    const L = window.L;
    container.innerHTML = "";
    const map = L.map(container, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      scrollWheelZoom: false,
      // Ein-Finger-Drag wuerde auf Mobil das Seiten-Scrollen blockieren.
      dragging: !L.Browser?.mobile,
      touchZoom: true,
      fadeAnimation: true,
      zoomAnimation: true
    }).setView([hotel.lat, hotel.lng], HOTEL_MAP_ZOOM);

    let primaryErrors = 0;
    let primaryLoads = 0;
    let fallbackActive = false;
    const makeTileLayer = (urlTemplate) => L.tileLayer(urlTemplate, {
      maxZoom: 19,
      subdomains: urlTemplate.includes("tile.openstreetmap.org") ? "abc" : "abcd",
      crossOrigin: true
    });
    const primaryLayer = makeTileLayer(TILE_PRIMARY_URL);
    primaryLayer.on("load", () => { primaryLoads += 1; });
    primaryLayer.on("tileerror", () => {
      primaryErrors += 1;
      if (!fallbackActive && primaryLoads === 0 && primaryErrors >= PRIMARY_TILE_ERROR_THRESHOLD) {
        fallbackActive = true;
        try { map.removeLayer(primaryLayer); } catch {}
        makeTileLayer(TILE_FALLBACK_URL).addTo(map);
      }
    });
    primaryLayer.addTo(map);

    L.marker([hotel.lat, hotel.lng], {
      icon: makeHotelIcon(hotel.name),
      zIndexOffset: 1000,
      keyboard: false
    }).addTo(map);

    container.__mhdMap = map;
    container.__mhdSetPlaces = (places = []) => setHotelDetailMapPlaces(container, places);
    renderPlaceMarkers(container, container.__mhdPlaces || []);
    // Nach dem Einsetzen ins Layout die Groesse nachziehen (Karte im Karten-Layout).
    window.requestAnimationFrame?.(() => {
      try { map.invalidateSize(); } catch {}
    });
    return true;
  } catch {
    return false;
  } finally {
    container.__mhdMapInitializing = false;
  }
}
