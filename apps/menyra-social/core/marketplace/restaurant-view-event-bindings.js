const FEED_LOCATION_STORAGE_KEY = "mnyra_social_feed_viewer_location_v1";
const RESTAURANT_LOCATION_MIN_QUERY_LENGTH = 2;
const RESTAURANT_LOCATION_CITY_OPTIONS = Object.freeze([
  Object.freeze({ id: "prishtina", label: "Prishtina", lat: 42.6629, lng: 21.1655, aliases: Object.freeze(["prishtine", "prishtin"]), country: "Kosove", countryCode: "xk" }),
  Object.freeze({ id: "prizren", label: "Prizren", lat: 42.2139, lng: 20.7397, aliases: Object.freeze(["prizr"]), country: "Kosove", countryCode: "xk" }),
  Object.freeze({ id: "peja", label: "Peja", lat: 42.6591, lng: 20.2883, aliases: Object.freeze(["peje"]), country: "Kosove", countryCode: "xk" }),
  Object.freeze({ id: "gjakova", label: "Gjakova", lat: 42.3803, lng: 20.4308, aliases: Object.freeze(["gjakove"]), country: "Kosove", countryCode: "xk" }),
  Object.freeze({ id: "ferizaj", label: "Ferizaj", lat: 42.3706, lng: 21.1553, aliases: Object.freeze(["feri"]), country: "Kosove", countryCode: "xk" }),
  Object.freeze({ id: "gjilan", label: "Gjilan", lat: 42.4635, lng: 21.4699, aliases: Object.freeze(["gjilani"]), country: "Kosove", countryCode: "xk" }),
  Object.freeze({ id: "mitrovica", label: "Mitrovica", lat: 42.8914, lng: 20.8660, aliases: Object.freeze(["mitrovice", "mitro"]), country: "Kosove", countryCode: "xk" }),
  Object.freeze({ id: "vushtrria", label: "Vushtrria", lat: 42.8231, lng: 20.9675, aliases: Object.freeze(["vushtrri"]), country: "Kosove", countryCode: "xk" }),
  Object.freeze({ id: "podujeva", label: "Podujeva", lat: 42.9106, lng: 21.1930, aliases: Object.freeze(["podujeve", "podu"]), country: "Kosove", countryCode: "xk" }),
  Object.freeze({ id: "tirana", label: "Tirana", lat: 41.3275, lng: 19.8187, aliases: Object.freeze(["tirane"]), country: "Shqiperi", countryCode: "al" }),
  Object.freeze({ id: "kukes", label: "Kukes", lat: 42.0769, lng: 20.4219, aliases: Object.freeze(["kukes albania"]), country: "Shqiperi", countryCode: "al" }),
  Object.freeze({ id: "smederevo", label: "Smederevo", lat: 44.6644, lng: 20.9276, aliases: Object.freeze(["smederevo serbia"]), country: "Serbi", countryCode: "rs" })
]);

function markBound(node, key = "default") {
  if (!node?.dataset) return true;
  const attr = `restaurant${key}Bound`;
  if (node.dataset[attr] === "1") return false;
  node.dataset[attr] = "1";
  return true;
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeLocationQuery(value = "") {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCoords(value = null) {
  const lat = Number(value?.lat ?? value?.latitude);
  const lng = Number(value?.lng ?? value?.lon ?? value?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function buildLocationRecord(record = {}) {
  const coords = normalizeCoords(record);
  if (!coords) return null;
  const label = cleanText(record.label || record.city || "Current location");
  const city = cleanText(record.city || label);
  return {
    lat: coords.lat,
    lng: coords.lng,
    label,
    city,
    country: cleanText(record.country || ""),
    countryCode: cleanText(record.countryCode || ""),
    source: cleanText(record.source || "city-search"),
    savedAt: Date.now()
  };
}

function writeFeedLocation(record = null) {
  const normalized = buildLocationRecord(record);
  if (!normalized) return false;
  try {
    globalThis?.localStorage?.setItem?.(FEED_LOCATION_STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

function scoreLocationSuggestion(entry = {}, query = "") {
  const queryKey = normalizeLocationQuery(query);
  const terms = [entry.label, entry.country, entry.countryCode, ...(Array.isArray(entry.aliases) ? entry.aliases : [])]
    .map(normalizeLocationQuery)
    .filter(Boolean);
  if (!queryKey) return -1;
  let score = -1;
  terms.forEach((term) => {
    if (term === queryKey) score = Math.max(score, 400);
    else if (term.startsWith(queryKey)) score = Math.max(score, 260 - Math.max(0, term.length - queryKey.length));
    else if (term.includes(queryKey)) score = Math.max(score, 160);
  });
  return score;
}

function getLocationSuggestions(query = "", limit = 6) {
  const queryKey = normalizeLocationQuery(query);
  if (queryKey.length < RESTAURANT_LOCATION_MIN_QUERY_LENGTH) return [];
  return RESTAURANT_LOCATION_CITY_OPTIONS
    .map((entry) => ({ ...entry, score: scoreLocationSuggestion(entry, query) }))
    .filter((entry) => Number(entry.score) >= 0)
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0) || String(a.label || "").localeCompare(String(b.label || "")))
    .slice(0, Math.max(1, Number(limit) || 6));
}

function renderLocationSuggestion(entry = {}) {
  return `
    <button
      type="button"
      role="option"
      aria-selected="false"
      data-restaurant-location-suggestion="${escapeHtml(entry.id)}"
      class="feed-location-suggestion"
    >
      <span class="feed-location-suggestion__label">${escapeHtml(entry.label)}</span>
      <span class="feed-location-suggestion__meta">${escapeHtml(entry.country || "City")}</span>
    </button>
  `;
}

export function bindRestaurantViewEvents({
  documentObj,
  windowObj,
  renderFn
} = {}) {
  const doc = documentObj || null;
  if (!doc) return;
  const win = windowObj || doc.defaultView || globalThis;
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const input = doc.getElementById("restaurantLocationCityInput");
  const suggestionsRoot = doc.getElementById("restaurantLocationCitySuggestions");
  const statusEl = doc.getElementById("restaurantLocationStatus");
  const locateBtn = doc.getElementById("btnRestaurantLocateMe");
  const locatePulse = doc.getElementById("restaurantLocatePulse");

  const setStatus = (message = "") => {
    if (!statusEl) return;
    statusEl.textContent = cleanText(message);
    statusEl.classList.toggle("hidden", !cleanText(message));
  };
  const setBusy = (busy = false) => {
    if (locateBtn instanceof HTMLButtonElement) {
      locateBtn.disabled = !!busy;
      locateBtn.classList.toggle("opacity-60", !!busy);
      locateBtn.classList.toggle("cursor-not-allowed", !!busy);
      locateBtn.classList.toggle("is-loading", !!busy);
    }
    if (locatePulse) {
      locatePulse.classList.toggle("opacity-100", !!busy);
      locatePulse.classList.toggle("opacity-0", !busy);
    }
  };
  const hideSuggestions = ({ clearContent = true } = {}) => {
    if (suggestionsRoot) {
      suggestionsRoot.classList.remove("feed-location-suggestions--open");
      suggestionsRoot.setAttribute("aria-hidden", "true");
      if (clearContent) suggestionsRoot.innerHTML = "";
    }
    input?.setAttribute?.("aria-expanded", "false");
  };
  const syncSuggestions = (query = "") => {
    if (!suggestionsRoot || !input) return;
    const suggestions = getLocationSuggestions(query);
    if (!suggestions.length) {
      hideSuggestions({ clearContent: normalizeLocationQuery(query).length < RESTAURANT_LOCATION_MIN_QUERY_LENGTH });
      return;
    }
    suggestionsRoot.innerHTML = suggestions.map(renderLocationSuggestion).join("");
    suggestionsRoot.classList.add("feed-location-suggestions--open");
    suggestionsRoot.setAttribute("aria-hidden", "false");
    input.setAttribute("aria-expanded", "true");
  };
  const applyLocation = (location = {}) => {
    if (!writeFeedLocation(location)) {
      setStatus("Location could not be saved.");
      return;
    }
    hideSuggestions();
    setStatus("");
    render();
  };
  const applySuggestion = (suggestion = null) => {
    if (!suggestion) return;
    if (input) input.value = suggestion.label;
    applyLocation({
      lat: suggestion.lat,
      lng: suggestion.lng,
      label: suggestion.label,
      city: suggestion.label,
      country: suggestion.country,
      countryCode: suggestion.countryCode,
      source: "city-search"
    });
  };

  if (input && markBound(input, "Input")) {
    input.addEventListener("input", () => {
      setStatus("");
      syncSuggestions(input.value || "");
    });
    input.addEventListener("focus", () => {
      syncSuggestions(input.value || "");
    });
    input.addEventListener("blur", () => {
      win.setTimeout?.(() => {
        const active = doc.activeElement;
        if (active && typeof active.closest === "function" && active.closest("[data-restaurant-location-suggestion]")) return;
        hideSuggestions();
      }, 120);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hideSuggestions();
        return;
      }
      if (event.key !== "Enter") return;
      const suggestion = getLocationSuggestions(input.value || "", 1)[0];
      if (!suggestion) return;
      event.preventDefault();
      applySuggestion(suggestion);
    });
  }

  if (suggestionsRoot && markBound(suggestionsRoot, "Suggestion")) {
    suggestionsRoot.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      if (!target.closest("[data-restaurant-location-suggestion]")) return;
      event.preventDefault();
    });
    suggestionsRoot.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      const node = target.closest("[data-restaurant-location-suggestion]");
      if (!node) return;
      event.preventDefault();
      event.stopPropagation();
      const id = cleanText(node.getAttribute("data-restaurant-location-suggestion") || "").toLowerCase();
      applySuggestion(RESTAURANT_LOCATION_CITY_OPTIONS.find((entry) => entry.id === id) || null);
    });
  }

  if (locateBtn && markBound(locateBtn, "Locate")) {
    locateBtn.addEventListener("click", () => {
      const geo = win?.navigator?.geolocation;
      if (!geo || typeof geo.getCurrentPosition !== "function") {
        setStatus("Location access is not supported on this device.");
        return;
      }
      setBusy(true);
      setStatus("Requesting location...");
      const currentLabel = cleanText(input?.value || "");
      geo.getCurrentPosition(
        (position) => {
          setBusy(false);
          const coords = normalizeCoords({
            lat: position?.coords?.latitude,
            lng: position?.coords?.longitude
          });
          if (!coords) {
            setStatus("Location could not be determined.");
            return;
          }
          applyLocation({
            ...coords,
            label: currentLabel || "Current location",
            city: currentLabel || "",
            source: "gps"
          });
        },
        (error) => {
          setBusy(false);
          const code = Number(error?.code);
          if (code === 1) setStatus("Location access was denied.");
          else if (code === 3) setStatus("Location did not load in time. Please try again.");
          else setStatus("Location could not be determined.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }
}
