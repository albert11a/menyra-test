// Mini-Entdeckerkarte der Lead-Landing: genau ein Marker - der Kunde selbst.
// Gleiche Quellen wie die echte Discovery-Karte (Leaflet 1.9.4 + Carto
// Voyager), aber komplett eigenstaendig geladen.

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
const MAP_ZOOM = 15;
const PRIMARY_TILE_ERROR_THRESHOLD = 8;

let leafletLoadPromise = null;

function ensureStylesheet() {
  if (document.querySelector("link[data-ll-leaflet-css], link[href*='leaflet.css']")) return;
  const mountAt = (index = 0) => {
    const href = LEAFLET_CSS_URLS[index];
    if (!href) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.llLeafletCss = "1";
    link.addEventListener("error", () => {
      try { link.remove(); } catch {}
      mountAt(index + 1);
    }, { once: true });
    document.head.appendChild(link);
  };
  mountAt(0);
}

async function ensureLeaflet() {
  if (typeof window === "undefined") return false;
  if (window.L) return true;
  if (leafletLoadPromise) return leafletLoadPromise;
  ensureStylesheet();
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

function escapeAttr(value = "") {
  return String(value ?? "").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export async function mountLeadLandingMap(container) {
  if (!(container instanceof HTMLElement) || container.__llMap || container.__llMapBusy) return false;

  const lat = Number(container.dataset.lat);
  const lng = Number(container.dataset.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

  container.__llMapBusy = true;
  try {
    const ready = await ensureLeaflet();
    if (!ready || !container.isConnected || container.__llMap) return false;

    const L = window.L;
    container.innerHTML = "";

    const map = L.map(container, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      scrollWheelZoom: false,
      // Ein-Finger-Drag wuerde auf Mobil das Scrollen der Landing blockieren.
      dragging: !L.Browser?.mobile,
      touchZoom: true
    }).setView([lat, lng], MAP_ZOOM);

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

    const logoUrl = String(container.dataset.logo || "").trim();
    const name = String(container.dataset.name || "").trim();
    const pinInner = logoUrl
      ? `<img src="${escapeAttr(logoUrl)}" alt="${escapeAttr(name)}" />`
      : "";

    L.marker([lat, lng], {
      keyboard: false,
      zIndexOffset: 1000,
      icon: L.divIcon({
        className: "ll-map__marker",
        html: `<span class="ll-map__pin" title="${escapeAttr(name)}">${pinInner}</span>`,
        iconSize: [46, 46],
        iconAnchor: [23, 23]
      })
    }).addTo(map);

    container.__llMap = map;
    // Der Container war beim Aufbau ggf. noch nicht final vermessen.
    window.setTimeout(() => {
      try { map.invalidateSize(); } catch {}
    }, 180);
    return true;
  } catch {
    return false;
  } finally {
    container.__llMapBusy = false;
  }
}
