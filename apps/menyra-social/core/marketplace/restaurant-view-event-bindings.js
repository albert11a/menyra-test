const RESTAURANT_SUGGESTION_MIN_QUERY_LENGTH = 2;
const RESTAURANT_SUGGESTION_LIMIT = 6;

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

function normalizeLooseKey(value = "") {
  const raw = cleanText(value).toLowerCase();
  if (!raw) return "";
  return raw
    .replace(/[ëèéê]/g, "e")
    .replace(/[çćč]/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeTypeAlias(value = "") {
  const key = normalizeLooseKey(value);
  if (!key) return "";
  if (key === "coffee" || key === "coffe" || key === "kaffee") return "cafe";
  if (key === "fast_food" || key === "snack" || key === "imbiss") return "fastfood";
  if (key === "restaurants" || key === "restoran") return "restaurant";
  return key;
}

function collectTypeCandidates(record = {}) {
  return [
    record.type,
    record.customerType,
    record.restaurantType,
    record.businessProfileType,
    record.profileType,
    record.catalogMode,
    record.category,
    record.kind,
    record.vertical,
    record.leadType
  ];
}

function isRestaurantRecord(record = {}) {
  const restaurantTypes = new Set(["restaurant", "cafe", "coffee", "fastfood", "food"]);
  if (collectTypeCandidates(record).some((value) => restaurantTypes.has(normalizeTypeAlias(value)))) return true;
  const searchable = [
    record.name,
    record.restaurantName,
    record.businessName,
    record.description,
    record.bio,
    record.about
  ].map((value) => cleanText(value).toLowerCase()).join(" ");
  return /\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b|\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b|\bfood\b|\bfast\s*food\b|\bfastfood\b/.test(searchable);
}

function getBusinessId(record = {}) {
  return cleanText(record.canonicalRestaurantId || record.restaurantId || record.id || record.landingRestaurantId || "");
}

function getBusinessName(record = {}) {
  return cleanText(record.name || record.restaurantName || record.businessName || record.displayName || "Restaurant");
}

function getBusinessCityLabel(record = {}) {
  return cleanText(record.city || record.locationCity || record.primaryCity || "");
}

function getBusinessLocationLabel(record = {}) {
  const city = getBusinessCityLabel(record);
  const address = cleanText(record.address || record.location || record.primaryAddress);
  if (city && address && city !== address) return `${city} - ${address}`;
  return city || address || cleanText(record.country || record.region || "") || "Location follows";
}

function collectRestaurantTextCandidates(record = {}) {
  const values = [
    getBusinessId(record),
    record.publicSlug,
    record.landingSlug,
    record.handle,
    ...collectTypeCandidates(record),
    record.city,
    record.locationCity,
    record.primaryCity,
    record.address,
    record.location,
    record.primaryAddress,
    record.country,
    record.region,
    record.district,
    record.name,
    record.restaurantName,
    record.businessName,
    record.displayName,
    record.description,
    record.bio,
    record.about
  ];
  if (Array.isArray(record.locations)) {
    record.locations.forEach((location) => {
      if (!location || typeof location !== "object") return;
      values.push(location.city, location.address, location.country, location.region, location.name);
    });
  }
  return values;
}

function matchesRestaurantQuery(record = {}, query = "") {
  const queryKey = normalizeLooseKey(query);
  if (!queryKey) return true;
  const haystack = collectRestaurantTextCandidates(record)
    .map(normalizeLooseKey)
    .filter(Boolean)
    .join("_");
  if (haystack.includes(queryKey)) return true;
  const queryTokens = queryKey.split("_").filter(Boolean);
  return queryTokens.length > 0 && queryTokens.every((token) => haystack.includes(token));
}

function collectRestaurantSuggestionRecords(state = {}) {
  const byKey = new Map();
  const addRecord = (record = {}) => {
    if (!record || typeof record !== "object" || !isRestaurantRecord(record)) return;
    const id = getBusinessId(record);
    const name = getBusinessName(record);
    const location = getBusinessLocationLabel(record);
    const key = id || `${normalizeLooseKey(name)}:${normalizeLooseKey(location)}`;
    if (!key) return;
    const previous = byKey.get(key) || {};
    byKey.set(key, { ...previous, ...record, id: id || previous.id || "" });
  };
  (Array.isArray(state.bootstrapRestaurantPreview) ? state.bootstrapRestaurantPreview : []).forEach(addRecord);
  (Array.isArray(state.restaurants) ? state.restaurants : []).forEach(addRecord);
  return Array.from(byKey.values());
}

function scoreSuggestionText(label = "", query = "") {
  const queryKey = normalizeLooseKey(query);
  const labelKey = normalizeLooseKey(label);
  if (!queryKey) return 100;
  if (labelKey === queryKey) return 0;
  if (labelKey.startsWith(queryKey)) return 1;
  if (labelKey.includes(queryKey)) return 2;
  return 5;
}

function getRestaurantCitySuggestions(state = {}, query = "", limit = RESTAURANT_SUGGESTION_LIMIT) {
  const queryKey = normalizeLooseKey(query);
  if (queryKey.length < RESTAURANT_SUGGESTION_MIN_QUERY_LENGTH) return [];
  const byCity = new Map();
  collectRestaurantSuggestionRecords(state).forEach((record) => {
    const city = getBusinessCityLabel(record);
    if (!city) return;
    const key = normalizeLooseKey(city);
    if (!key || byCity.has(key)) return;
    if (!key.includes(queryKey)) return;
    byCity.set(key, {
      type: "city",
      value: city,
      label: city,
      meta: "City"
    });
  });
  return Array.from(byCity.values())
    .sort((a, b) => scoreSuggestionText(a.label, query) - scoreSuggestionText(b.label, query)
      || String(a.label || "").localeCompare(String(b.label || "")))
    .slice(0, Math.max(1, Number(limit) || RESTAURANT_SUGGESTION_LIMIT));
}

function getRestaurantSpotSuggestions(state = {}, query = "", limit = RESTAURANT_SUGGESTION_LIMIT) {
  const queryKey = normalizeLooseKey(query);
  if (queryKey.length < RESTAURANT_SUGGESTION_MIN_QUERY_LENGTH) return [];
  return collectRestaurantSuggestionRecords(state)
    .filter((record) => matchesRestaurantQuery(record, query))
    .sort((a, b) => scoreSuggestionText(getBusinessName(a), query) - scoreSuggestionText(getBusinessName(b), query)
      || getBusinessName(a).localeCompare(getBusinessName(b)))
    .slice(0, Math.max(1, Number(limit) || RESTAURANT_SUGGESTION_LIMIT))
    .map((record) => {
      const name = getBusinessName(record);
      return {
        type: "spot",
        value: name || getBusinessLocationLabel(record),
        label: name,
        meta: getBusinessLocationLabel(record)
      };
    });
}

function getRestaurantSuggestions(state = {}, query = "", limit = RESTAURANT_SUGGESTION_LIMIT) {
  const citySuggestions = getRestaurantCitySuggestions(state, query, limit);
  const remaining = Math.max(0, Number(limit || RESTAURANT_SUGGESTION_LIMIT) - citySuggestions.length);
  if (!remaining) return citySuggestions;
  const spotSuggestions = getRestaurantSpotSuggestions(state, query, remaining);
  return [...citySuggestions, ...spotSuggestions].slice(0, Math.max(1, Number(limit) || RESTAURANT_SUGGESTION_LIMIT));
}

function renderRestaurantSuggestionMarkup(entry = {}) {
  const value = cleanText(entry.value || entry.label || "");
  const label = cleanText(entry.label || value);
  const meta = cleanText(entry.meta || (entry.type === "city" ? "City" : "Spot"));
  return `
    <button
      type="button"
      role="option"
      aria-selected="false"
      data-restaurant-city-suggestion="true"
      data-restaurant-suggestion-value="${escapeHtml(value)}"
      class="restaurant-city-suggestion"
    >
      <span class="restaurant-city-suggestion__label">${escapeHtml(label)}</span>
      <span class="restaurant-city-suggestion__meta">${escapeHtml(meta)}</span>
    </button>
  `;
}

export function bindRestaurantViewEvents({
  documentObj,
  state,
  windowObj,
  renderFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return;
  const win = windowObj || doc.defaultView || globalThis;
  const render = typeof renderFn === "function" ? renderFn : (() => {});

  const hideRestaurantSuggestions = ({ clearContent = true } = {}) => {
    const suggestionsRoot = doc.getElementById("restaurantCitySuggestions");
    const input = doc.getElementById("rci");
    if (suggestionsRoot) {
      suggestionsRoot.classList.remove("restaurant-city-suggestions--open");
      suggestionsRoot.setAttribute("aria-hidden", "true");
      if (clearContent) suggestionsRoot.innerHTML = "";
    }
    if (input) input.setAttribute("aria-expanded", "false");
  };
  const syncRestaurantSuggestionsDom = (query = "") => {
    const suggestionsRoot = doc.getElementById("restaurantCitySuggestions");
    const input = doc.getElementById("rci");
    if (!suggestionsRoot || !input) return;
    const suggestions = getRestaurantSuggestions(state, query);
    if (!suggestions.length) {
      hideRestaurantSuggestions({ clearContent: normalizeLooseKey(query).length < RESTAURANT_SUGGESTION_MIN_QUERY_LENGTH });
      return;
    }
    suggestionsRoot.innerHTML = suggestions.map(renderRestaurantSuggestionMarkup).join("");
    suggestionsRoot.classList.add("restaurant-city-suggestions--open");
    suggestionsRoot.setAttribute("aria-hidden", "false");
    input.setAttribute("aria-expanded", "true");
  };
  const getRestaurantViewState = () => {
    if (!state.restaurantView || typeof state.restaurantView !== "object") {
      state.restaurantView = {};
    }
    return state.restaurantView;
  };
  const clearRestaurantNoticeDom = () => {
    doc.querySelectorAll("[data-restaurant-notice]").forEach((node) => node.remove());
  };
  const scrollRestaurantsBenkoIntoView = () => {
    const benko = doc.getElementById("restaurantsBenko");
    if (!benko) return;
    try {
      benko.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      benko.scrollIntoView();
    }
  };
  const commitRestaurantQuery = ({ value = "", immediateScroll = true } = {}) => {
    const query = String(value || "").trim();
    const previousQuery = String(getRestaurantViewState().query || "").trim();
    state.restaurantView = {
      ...getRestaurantViewState(),
      query,
      notice: ""
    };
    hideRestaurantSuggestions();
    render();
    if (query && (immediateScroll || !previousQuery)) {
      if (typeof win?.setTimeout === "function") {
        win.setTimeout(scrollRestaurantsBenkoIntoView, 0);
      } else {
        scrollRestaurantsBenkoIntoView();
      }
    }
  };

  const restaurantInput = doc.getElementById("rci");
  if (restaurantInput && markBound(restaurantInput, "Input")) {
    restaurantInput.addEventListener("input", () => {
      const rawValue = String(restaurantInput.value || "");
      state.restaurantView = {
        ...getRestaurantViewState(),
        notice: ""
      };
      clearRestaurantNoticeDom();
      syncRestaurantSuggestionsDom(rawValue);
    });
    restaurantInput.addEventListener("focus", () => {
      syncRestaurantSuggestionsDom(restaurantInput.value || getRestaurantViewState().query || "");
    });
    restaurantInput.addEventListener("blur", () => {
      if (typeof win?.setTimeout === "function") {
        win.setTimeout(() => {
          const active = doc.activeElement;
          if (active && typeof active.closest === "function" && active.closest("[data-restaurant-city-suggestion]")) return;
          hideRestaurantSuggestions();
        }, 120);
      } else {
        hideRestaurantSuggestions();
      }
    });
    restaurantInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hideRestaurantSuggestions();
        return;
      }
      if (event.key !== "Enter") return;
      event.preventDefault();
      commitRestaurantQuery({ value: restaurantInput.value || "", immediateScroll: true });
    });
  }

  const suggestionsRoot = doc.getElementById("restaurantCitySuggestions");
  if (suggestionsRoot && markBound(suggestionsRoot, "Suggestion")) {
    suggestionsRoot.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      if (!target.closest("[data-restaurant-city-suggestion]")) return;
      event.preventDefault();
    });
    suggestionsRoot.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      const suggestion = target.closest("[data-restaurant-city-suggestion]");
      if (!suggestion) return;
      event.preventDefault();
      event.stopPropagation();
      const value = String(suggestion.getAttribute("data-restaurant-suggestion-value") || "").trim();
      const input = doc.getElementById("rci");
      if (input) input.value = value;
      commitRestaurantQuery({ value, immediateScroll: true });
    });
  }

  doc.querySelectorAll("[data-restaurant-submit]").forEach((btn) => {
    if (!markBound(btn, "Submit")) return;
    btn.addEventListener("click", () => {
      const input = doc.getElementById("rci");
      const value = String(input?.value || getRestaurantViewState().query || "");
      commitRestaurantQuery({ value, immediateScroll: true });
    });
  });
}
