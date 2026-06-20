import { bindRestaurantViewEvents } from "./restaurant-view-event-bindings.js";

const TRAVEL_DESTINATION_REQUIRED_MESSAGE = "Ju lutem shkruani destinacionin e udhëtimit.";
const TRAVEL_SUGGESTION_MIN_QUERY_LENGTH = 2;
const TRAVEL_SUGGESTION_LIMIT = 6;
const HOTEL_CARD_SWIPE_THRESHOLD_PX = 28;
const HOTEL_CARD_SWIPE_VERTICAL_DRIFT_PX = 44;
const TRAVEL_ALBANIA_CITY_OPTIONS = Object.freeze([
  Object.freeze({ id: "tirana", label: "Tirana", aliases: Object.freeze(["tirane"]) }),
  Object.freeze({ id: "durres", label: "Durres", aliases: Object.freeze(["durresi"]) }),
  Object.freeze({ id: "vlora", label: "Vlora", aliases: Object.freeze(["vlore"]) }),
  Object.freeze({ id: "shkoder", label: "Shkoder", aliases: Object.freeze(["shkodra"]) }),
  Object.freeze({ id: "shengjin", label: "Shengjin", aliases: Object.freeze(["shëngjin", "shen gjin", "shengjini"]) }),
  Object.freeze({ id: "ksamil", label: "Ksamil", aliases: Object.freeze(["ksamili"]) }),
  Object.freeze({ id: "dhermi", label: "Dhermi", aliases: Object.freeze(["dhërmi", "dhermiu"]) }),
  Object.freeze({ id: "velipoje", label: "Velipoje", aliases: Object.freeze(["velipojë", "velipoja"]) }),
  Object.freeze({ id: "theth", label: "Theth", aliases: Object.freeze(["thethi"]) }),
  Object.freeze({ id: "valbone", label: "Valbone", aliases: Object.freeze(["valbonë", "valbona"]) }),
  Object.freeze({ id: "elbasan", label: "Elbasan", aliases: Object.freeze(["elbasani"]) }),
  Object.freeze({ id: "fier", label: "Fier", aliases: Object.freeze(["fieri"]) }),
  Object.freeze({ id: "korce", label: "Korce", aliases: Object.freeze(["korca"]) }),
  Object.freeze({ id: "sarande", label: "Sarande", aliases: Object.freeze(["saranda"]) }),
  Object.freeze({ id: "berat", label: "Berat", aliases: Object.freeze(["berati"]) }),
  Object.freeze({ id: "gjirokaster", label: "Gjirokaster", aliases: Object.freeze(["gjirokastra"]) }),
  Object.freeze({ id: "kukes", label: "Kukes", aliases: Object.freeze(["kukesi"]) }),
  Object.freeze({ id: "lezhe", label: "Lezhe", aliases: Object.freeze(["lezha"]) }),
  Object.freeze({ id: "pogradec", label: "Pogradec", aliases: Object.freeze(["pogradeci"]) }),
  Object.freeze({ id: "kruje", label: "Kruje", aliases: Object.freeze(["kruja"]) }),
  Object.freeze({ id: "fushe kruje", label: "Fushe Kruje", aliases: Object.freeze(["fushë krujë", "fushe-kruje", "fush kruje"]) }),
  Object.freeze({ id: "lushnje", label: "Lushnje", aliases: Object.freeze(["lushnja"]) }),
  Object.freeze({ id: "himare", label: "Himare", aliases: Object.freeze(["himarë", "himara"]) }),
  Object.freeze({ id: "kavaje", label: "Kavaje", aliases: Object.freeze(["kavajë", "kavaja"]) }),
  Object.freeze({ id: "kamze", label: "Kamze", aliases: Object.freeze(["kamëz", "kamza"]) }),
  Object.freeze({ id: "vore", label: "Vore", aliases: Object.freeze(["vorë", "vora"]) }),
  Object.freeze({ id: "divjake", label: "Divjake", aliases: Object.freeze(["divjakë", "divjaka"]) }),
  Object.freeze({ id: "permet", label: "Permet", aliases: Object.freeze(["përmet", "permeti"]) }),
  Object.freeze({ id: "tepelene", label: "Tepelene", aliases: Object.freeze(["tepelenë", "tepelena"]) }),
  Object.freeze({ id: "delvine", label: "Delvine", aliases: Object.freeze(["delvinë", "delvina"]) }),
  Object.freeze({ id: "peshkopi", label: "Peshkopi", aliases: Object.freeze(["peshkopia", "diber", "dibër"]) }),
  Object.freeze({ id: "burrel", label: "Burrel", aliases: Object.freeze(["burreli", "mat"]) }),
  Object.freeze({ id: "puke", label: "Puke", aliases: Object.freeze(["pukë", "puka"]) }),
  Object.freeze({ id: "bajram curri", label: "Bajram Curri", aliases: Object.freeze(["bajramcurri", "tropoje", "tropojë"]) }),
  Object.freeze({ id: "krume", label: "Krume", aliases: Object.freeze(["krumë", "has"]) }),
  Object.freeze({ id: "lac", label: "Lac", aliases: Object.freeze(["laç", "kurbin"]) }),
  Object.freeze({ id: "orikum", label: "Orikum", aliases: Object.freeze(["orikumi"]) }),
  Object.freeze({ id: "golem", label: "Golem", aliases: Object.freeze(["golemi"]) }),
  Object.freeze({ id: "jale", label: "Jale", aliases: Object.freeze(["jalë", "jali"]) }),
  Object.freeze({ id: "qepare", label: "Qeparo", aliases: Object.freeze(["qeparo", "qeparoi"]) }),
  Object.freeze({ id: "borsh", label: "Borsh", aliases: Object.freeze(["borshi"]) }),
  Object.freeze({ id: "lukove", label: "Lukove", aliases: Object.freeze(["lukovë", "lukova"]) }),
  Object.freeze({ id: "palase", label: "Palase", aliases: Object.freeze(["palasë", "palasa"]) }),
  Object.freeze({ id: "drimadhe", label: "Drimadhe", aliases: Object.freeze(["drymades", "drimadhes"]) }),
  Object.freeze({ id: "spille", label: "Spille", aliases: Object.freeze(["spilleja"]) }),
  Object.freeze({ id: "gjiri i lalzit", label: "Gjiri i Lalzit", aliases: Object.freeze(["lalzi", "lalez", "lalëz"]) })
]);

function markBound(node, key = "default") {
  if (!node?.dataset) return true;
  const attr = `travel${key}Bound`;
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

function expandTravelQueryKeys(value = "") {
  const key = normalizeLooseKey(value);
  if (!key) return [];
  const keys = new Set([key]);
  TRAVEL_ALBANIA_CITY_OPTIONS.forEach((option) => {
    const aliases = [option.id, option.label, ...(Array.isArray(option.aliases) ? option.aliases : [])]
      .map(normalizeLooseKey)
      .filter(Boolean);
    if (aliases.includes(key)) aliases.forEach((alias) => keys.add(alias));
  });
  return Array.from(keys);
}

function normalizeTypeAlias(value = "") {
  const key = normalizeLooseKey(value);
  if (!key) return "";
  if (key === "hotels") return "hotel";
  if (key === "motels") return "motel";
  if (key === "unterkunft") return "accommodation";
  return key;
}

function getBusinessId(record = {}) {
  return cleanText(record.canonicalRestaurantId || record.restaurantId || record.id || record.landingRestaurantId || "");
}

function getBusinessName(record = {}) {
  return cleanText(record.name || record.restaurantName || record.businessName || record.displayName || "Hotel");
}

function getBusinessLocationLabel(record = {}) {
  const city = cleanText(record.city || record.locationCity || record.primaryCity);
  const address = cleanText(record.address || record.location || record.primaryAddress);
  if (city && address && city !== address) return `${city} - ${address}`;
  return city || address || cleanText(record.country || record.region || "") || "Standort folgt";
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

function isTravelRecord(record = {}) {
  const travelTypes = new Set(["hotel", "motel", "travel", "hostel", "resort", "accommodation"]);
  if (collectTypeCandidates(record).some((value) => travelTypes.has(normalizeTypeAlias(value)))) return true;
  const searchable = [
    record.name,
    record.restaurantName,
    record.businessName,
    record.description,
    record.bio,
    record.about
  ].map((value) => cleanText(value).toLowerCase()).join(" ");
  return /\bhotel(s)?\b|\bmotel(s)?\b|\bhostel\b|\bresort\b|\baccommodation\b|\bunterkunft\b/.test(searchable);
}

function collectTravelTextCandidates(record = {}) {
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

function matchesTravelQuery(record = {}, query = "") {
  const queryKeys = expandTravelQueryKeys(query);
  if (!queryKeys.length) return true;
  const haystack = collectTravelTextCandidates(record)
    .map(normalizeLooseKey)
    .filter(Boolean)
    .join("_");
  return queryKeys.some((queryKey) => {
    const queryTokens = queryKey.split("_").filter(Boolean);
    if (haystack.includes(queryKey)) return true;
    return queryTokens.length > 0 && queryTokens.every((token) => haystack.includes(token));
  });
}

function collectTravelSuggestionRecords(state = {}) {
  const byKey = new Map();
  const addRecord = (record = {}) => {
    if (!record || typeof record !== "object" || !isTravelRecord(record)) return;
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

function scoreTravelSuggestion(record = {}, query = "") {
  const queryKey = normalizeLooseKey(query);
  const nameKey = normalizeLooseKey(getBusinessName(record));
  const locationKey = normalizeLooseKey(getBusinessLocationLabel(record));
  if (!queryKey) return 100;
  if (nameKey === queryKey) return 0;
  if (nameKey.startsWith(queryKey)) return 1;
  if (locationKey.startsWith(queryKey)) return 2;
  if (nameKey.includes(queryKey)) return 3;
  if (locationKey.includes(queryKey)) return 4;
  return 5;
}

function matchesTravelCityOption(option = {}, query = "") {
  const queryKey = normalizeLooseKey(query);
  if (!queryKey) return false;
  const keys = [option.id, option.label, ...(Array.isArray(option.aliases) ? option.aliases : [])]
    .map(normalizeLooseKey)
    .filter(Boolean);
  return keys.some((key) => key.startsWith(queryKey) || key.includes(queryKey));
}

function scoreTravelCitySuggestion(option = {}, query = "") {
  const queryKey = normalizeLooseKey(query);
  const keys = [option.id, option.label, ...(Array.isArray(option.aliases) ? option.aliases : [])]
    .map(normalizeLooseKey)
    .filter(Boolean);
  if (keys.includes(queryKey)) return 0;
  if (keys.some((key) => key.startsWith(queryKey))) return 1;
  return 2;
}

function getTravelCitySuggestions(query = "", limit = TRAVEL_SUGGESTION_LIMIT) {
  const queryKey = normalizeLooseKey(query);
  if (queryKey.length < TRAVEL_SUGGESTION_MIN_QUERY_LENGTH) return [];
  return TRAVEL_ALBANIA_CITY_OPTIONS
    .filter((option) => matchesTravelCityOption(option, query))
    .sort((a, b) => scoreTravelCitySuggestion(a, query) - scoreTravelCitySuggestion(b, query)
      || String(a.label || "").localeCompare(String(b.label || "")))
    .slice(0, Math.max(1, Number(limit) || TRAVEL_SUGGESTION_LIMIT))
    .map((option) => ({
      type: "city",
      value: cleanText(option.label),
      label: cleanText(option.label),
      meta: "Albanien"
    }));
}

function getTravelHotelSuggestions(state = {}, query = "", limit = TRAVEL_SUGGESTION_LIMIT) {
  const queryKey = normalizeLooseKey(query);
  if (queryKey.length < TRAVEL_SUGGESTION_MIN_QUERY_LENGTH) return [];
  return collectTravelSuggestionRecords(state)
    .filter((record) => matchesTravelQuery(record, query))
    .sort((a, b) => scoreTravelSuggestion(a, query) - scoreTravelSuggestion(b, query)
      || getBusinessName(a).localeCompare(getBusinessName(b)))
    .slice(0, Math.max(1, Number(limit) || TRAVEL_SUGGESTION_LIMIT))
    .map((record) => {
      const name = getBusinessName(record);
      return {
        type: "hotel",
        value: name || getBusinessLocationLabel(record),
        label: name,
        meta: getBusinessLocationLabel(record)
      };
    });
}

function getTravelSuggestions(state = {}, query = "", limit = TRAVEL_SUGGESTION_LIMIT) {
  const citySuggestions = getTravelCitySuggestions(query, limit);
  if (citySuggestions.length) return citySuggestions;
  const hotelSuggestions = getTravelHotelSuggestions(state, query, limit);
  return hotelSuggestions.slice(0, Math.max(1, Number(limit) || TRAVEL_SUGGESTION_LIMIT));
}

function renderTravelSuggestionMarkup(entry = {}) {
  const value = cleanText(entry.value || entry.label || "");
  const label = cleanText(entry.label || value);
  const meta = cleanText(entry.meta || (entry.type === "city" ? "Albanien" : "Hotel"));
  return `
    <button
      type="button"
      role="option"
      aria-selected="false"
      data-travel-destination-suggestion="true"
      data-travel-suggestion-value="${escapeHtml(value)}"
      class="travel-destination-suggestion"
    >
      <span class="travel-destination-suggestion__label">${escapeHtml(label)}</span>
      <span class="travel-destination-suggestion__meta">${escapeHtml(meta)}</span>
    </button>
  `;
}

export function bindTravelViewEvents({
  documentObj,
  state,
  windowObj,
  renderFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return;
  const win = windowObj || doc.defaultView || globalThis;
  const render = typeof renderFn === "function" ? renderFn : (() => {});

  if (doc.getElementById("restaurantLocationCityInput")) {
    bindRestaurantViewEvents({ documentObj: doc, state, windowObj: win, renderFn: render });
  }

  const hideTravelSuggestions = ({ clearContent = true } = {}) => {
    const suggestionsRoot = doc.getElementById("travelDestinationSuggestions");
    const input = doc.getElementById("travelDestinationInput");
    if (suggestionsRoot) {
      suggestionsRoot.classList.remove("travel-destination-suggestions--open");
      suggestionsRoot.setAttribute("aria-hidden", "true");
      if (clearContent) suggestionsRoot.innerHTML = "";
    }
    if (input) input.setAttribute("aria-expanded", "false");
  };
  const syncTravelSuggestionsDom = (query = "") => {
    const suggestionsRoot = doc.getElementById("travelDestinationSuggestions");
    const input = doc.getElementById("travelDestinationInput");
    if (!suggestionsRoot || !input) return;
    const suggestions = getTravelSuggestions(state, query);
    if (!suggestions.length) {
      hideTravelSuggestions({ clearContent: normalizeLooseKey(query).length < TRAVEL_SUGGESTION_MIN_QUERY_LENGTH });
      return;
    }
    suggestionsRoot.innerHTML = suggestions.map(renderTravelSuggestionMarkup).join("");
    suggestionsRoot.classList.add("travel-destination-suggestions--open");
    suggestionsRoot.setAttribute("aria-hidden", "false");
    input.setAttribute("aria-expanded", "true");
  };
  const getTravelViewState = () => {
    if (!state.travelView || typeof state.travelView !== "object") {
      state.travelView = {};
    }
    return state.travelView;
  };
  const clearTravelNoticeDom = () => {
    doc.querySelectorAll("[data-travel-notice]").forEach((node) => node.remove());
  };
  const getHotelCardImages = (card) => {
    if (!card || typeof card.querySelectorAll !== "function") return [];
    const images = [];
    card.querySelectorAll("[data-travel-hotel-image-src]").forEach((node) => {
      const src = String(node.getAttribute("data-travel-hotel-image-src") || "").trim();
      if (src && !images.includes(src)) images.push(src);
    });
    return images;
  };
  const setHotelCardImage = (card, nextIndex = 0) => {
    if (!card) return;
    const images = getHotelCardImages(card);
    if (!images.length) return;
    const size = images.length;
    const normalizedIndex = ((Number(nextIndex) || 0) % size + size) % size;
    card.setAttribute("data-travel-hotel-image-index", String(normalizedIndex));
    const image = card.querySelector("[data-travel-hotel-main-image]");
    if (image) {
      image.setAttribute("src", images[normalizedIndex]);
      image.setAttribute("alt", `${getBusinessName({ name: card.getAttribute("aria-label") || "" }) || "Hotel"} Ansicht ${normalizedIndex + 1}`);
    }
    card.querySelectorAll("[data-travel-hotel-dot]").forEach((dot, index) => {
      if (String(dot.tagName || "").toLowerCase() !== "button") return;
      dot.className = index === normalizedIndex
        ? "w-4 bg-white shadow-sm h-1.5 rounded-full transition-all duration-300"
        : "w-1.5 bg-white/50 h-1.5 rounded-full transition-all duration-300";
    });
  };
  const getHotelCardCurrentImageIndex = (card) => {
    const value = Number(card?.getAttribute?.("data-travel-hotel-image-index") || "0");
    return Number.isFinite(value) ? value : 0;
  };
  const copyTravelHotelProfileUrl = async (restaurantId = "") => {
    const safeId = cleanText(restaurantId);
    if (!safeId) return false;
    const record = collectTravelSuggestionRecords(state).find((item) => getBusinessId(item) === safeId) || {};
    const slug = cleanText(record.publicSlug || record.landingSlug || record.handle || "");
    const path = cleanText(record.canonicalPublicPath) || (slug ? `/${encodeURIComponent(slug)}` : "");
    const value = path && win?.location?.origin
      ? new URL(path, win.location.origin).href
      : String(win?.location?.href || "");
    if (!value) return false;
    try {
      if (win?.navigator?.clipboard?.writeText) {
        await win.navigator.clipboard.writeText(value);
        return true;
      }
    } catch {}
    try {
      const input = doc.createElement("input");
      input.value = value;
      input.setAttribute("readonly", "readonly");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      input.style.opacity = "0";
      doc.body?.appendChild(input);
      input.select();
      const copied = doc.execCommand?.("copy") === true;
      input.remove();
      return copied;
    } catch {}
    return false;
  };
  const showTravelOfferToast = (card, message = "") => {
    const toast = card?.querySelector?.("[data-travel-offer-toast]");
    const text = cleanText(message);
    if (!toast || !text) return;
    toast.textContent = text;
    toast.classList.remove("hidden");
    toast.classList.add("flex");
    if (card.__travelOfferToastTimer) {
      try { win.clearTimeout(card.__travelOfferToastTimer); } catch {}
    }
    card.__travelOfferToastTimer = win.setTimeout?.(() => {
      toast.classList.add("hidden");
      toast.classList.remove("flex");
      card.__travelOfferToastTimer = null;
    }, 2500);
  };
  const setTravelOfferModalOpen = (card, open = false) => {
    const modal = card?.querySelector?.("[data-travel-offer-modal]");
    if (!modal) return;
    modal.classList.toggle("hidden", !open);
    modal.classList.toggle("flex", !!open);
    modal.setAttribute("aria-hidden", open ? "false" : "true");
    if (!open) return;
    const form = card.querySelector("[data-travel-offer-booking-form]");
    const success = card.querySelector("[data-travel-offer-booking-success]");
    if (form) form.classList.remove("hidden");
    if (success) success.classList.add("hidden");
    const nameInput = card.querySelector("[data-travel-offer-booking-name]");
    if (typeof win?.setTimeout === "function") {
      win.setTimeout(() => {
        try { nameInput?.focus?.({ preventScroll: true }); } catch {}
      }, 0);
    }
  };
  const scrollTravelInputIntoView = () => {
    const input = doc.getElementById("travelDestinationInput");
    if (!input) return;
    try {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      input.scrollIntoView();
    }
    if (typeof input.focus === "function") {
      try {
        input.focus({ preventScroll: true });
      } catch {
        input.focus();
      }
    }
  };
  const scrollTravelBenkoIntoView = () => {
    const benko = doc.getElementById("travelBenko");
    if (!benko) return;
    try {
      benko.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      benko.scrollIntoView();
    }
  };
  const setTravelDestinationRequired = () => {
    state.travelView = {
      ...getTravelViewState(),
      activeTab: "offers",
      notice: TRAVEL_DESTINATION_REQUIRED_MESSAGE
    };
    hideTravelSuggestions();
    render();
    if (typeof win?.setTimeout === "function") {
      win.setTimeout(scrollTravelInputIntoView, 0);
    } else {
      scrollTravelInputIntoView();
    }
  };
  const commitTravelDestination = ({ value = "", immediateScroll = true } = {}) => {
    const query = String(value || "").trim();
    const previousQuery = String(getTravelViewState().query || "").trim();
    if (!query) {
      state.travelView = {
        ...getTravelViewState(),
        query: "",
        activeTab: "offers",
        notice: ""
      };
      hideTravelSuggestions();
      render();
      return;
    }
    state.travelView = {
      ...getTravelViewState(),
      query,
      activeTab: "hotels",
      notice: ""
    };
    hideTravelSuggestions();
    render();
    if (immediateScroll || !previousQuery) {
      if (typeof win?.setTimeout === "function") {
        win.setTimeout(scrollTravelBenkoIntoView, 0);
      } else {
        scrollTravelBenkoIntoView();
      }
    }
  };

  const travelInput = doc.getElementById("travelDestinationInput");
  if (travelInput && markBound(travelInput, "Input")) {
    travelInput.addEventListener("input", () => {
      const rawValue = String(travelInput.value || "");
      state.travelView = {
        ...getTravelViewState(),
        notice: ""
      };
      clearTravelNoticeDom();
      syncTravelSuggestionsDom(rawValue);
    });
    travelInput.addEventListener("focus", () => {
      syncTravelSuggestionsDom(travelInput.value || getTravelViewState().query || "");
    });
    travelInput.addEventListener("blur", () => {
      if (typeof win?.setTimeout === "function") {
        win.setTimeout(() => {
          const active = doc.activeElement;
          if (active && typeof active.closest === "function" && active.closest("[data-travel-destination-suggestion]")) return;
          hideTravelSuggestions();
        }, 120);
      } else {
        hideTravelSuggestions();
      }
    });
    travelInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hideTravelSuggestions();
        return;
      }
      if (event.key !== "Enter") return;
      event.preventDefault();
      commitTravelDestination({ value: travelInput.value || "", immediateScroll: true });
    });
  }

  const suggestionsRoot = doc.getElementById("travelDestinationSuggestions");
  if (suggestionsRoot && markBound(suggestionsRoot, "Suggestion")) {
    suggestionsRoot.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      if (!target.closest("[data-travel-destination-suggestion]")) return;
      event.preventDefault();
    });
    suggestionsRoot.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      const suggestion = target.closest("[data-travel-destination-suggestion]");
      if (!suggestion) return;
      event.preventDefault();
      event.stopPropagation();
      const value = String(suggestion.getAttribute("data-travel-suggestion-value") || "").trim();
      const input = doc.getElementById("travelDestinationInput");
      if (input) input.value = value;
      commitTravelDestination({ value, immediateScroll: true });
    });
  }

  doc.querySelectorAll("[data-travel-submit]").forEach((btn) => {
    if (!markBound(btn, "Submit")) return;
    btn.addEventListener("click", () => {
      const input = doc.getElementById("travelDestinationInput");
      const value = String(input?.value || getTravelViewState().query || "");
      if (!value.trim()) {
        setTravelDestinationRequired();
        return;
      }
      commitTravelDestination({ value, immediateScroll: true });
    });
  });

  doc.querySelectorAll("[data-travel-tab]").forEach((btn) => {
    if (!markBound(btn, "Tab")) return;
    btn.addEventListener("click", () => {
      const tab = String(btn.dataset.travelTab || "").trim().toLowerCase();
      if (!tab) return;
      const query = String(getTravelViewState().query || "").trim();
      if ((tab === "hotels" || tab === "map") && !query) {
        setTravelDestinationRequired();
        return;
      }
      state.travelView = {
        ...getTravelViewState(),
        activeTab: tab === "map" ? "map" : (tab === "hotels" ? "hotels" : "offers"),
        notice: ""
      };
      hideTravelSuggestions();
      render();
      if (tab === "hotels" || tab === "map") {
        if (typeof win?.setTimeout === "function") {
          win.setTimeout(scrollTravelBenkoIntoView, 0);
        } else {
          scrollTravelBenkoIntoView();
        }
      }
    });
  });

  doc.querySelectorAll("[data-travel-hotel-card]").forEach((card) => {
    if (!markBound(card, "HotelCard")) return;
    let touchActive = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const gallery = card.querySelector("[data-travel-hotel-gallery]");
    const moveImage = (direction = "next") => {
      const current = getHotelCardCurrentImageIndex(card);
      setHotelCardImage(card, direction === "prev" ? current - 1 : current + 1);
    };
    const resetTouch = () => {
      touchActive = false;
      touchStartX = 0;
      touchStartY = 0;
      touchEndX = 0;
      touchEndY = 0;
    };
    card.querySelectorAll("[data-travel-hotel-image-nav]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        moveImage(String(btn.getAttribute("data-travel-hotel-image-nav") || "") === "prev" ? "prev" : "next");
      });
    });
    card.querySelectorAll("[data-travel-hotel-dot]").forEach((dot) => {
      dot.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        setHotelCardImage(card, Number(dot.getAttribute("data-travel-hotel-dot") || "0"));
      });
    });
    if (gallery) {
      gallery.addEventListener("touchstart", (event) => {
        const touch = event.touches?.[0];
        if (!touch) return;
        touchActive = true;
        touchStartX = Number(touch.clientX || 0);
        touchStartY = Number(touch.clientY || 0);
        touchEndX = touchStartX;
        touchEndY = touchStartY;
      }, { passive: true });
      gallery.addEventListener("touchmove", (event) => {
        const touch = event.touches?.[0];
        if (!touch) return;
        touchEndX = Number(touch.clientX || 0);
        touchEndY = Number(touch.clientY || 0);
      }, { passive: true });
      gallery.addEventListener("touchend", (event) => {
        if (!touchActive) return;
        const touch = event.changedTouches?.[0];
        if (touch) {
          touchEndX = Number(touch.clientX || 0);
          touchEndY = Number(touch.clientY || 0);
        }
        const delta = touchStartX - touchEndX;
        const verticalDrift = Math.abs(touchStartY - touchEndY);
        if (Math.abs(delta) >= HOTEL_CARD_SWIPE_THRESHOLD_PX && verticalDrift <= HOTEL_CARD_SWIPE_VERTICAL_DRIFT_PX) {
          moveImage(delta > 0 ? "next" : "prev");
        }
        resetTouch();
      }, { passive: true });
      gallery.addEventListener("touchcancel", resetTouch, { passive: true });
    }
  });

  doc.querySelectorAll("[data-travel-hotel-like]").forEach((btn) => {
    if (!markBound(btn, "HotelLike")) return;
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const iconNode = btn.querySelector("svg");
      if (iconNode) {
        iconNode.classList.toggle("fill-rose-500");
        iconNode.classList.toggle("text-rose-500");
        iconNode.classList.toggle("text-slate-600");
      }
    });
  });

  doc.querySelectorAll("[data-travel-hotel-share]").forEach((btn) => {
    if (!markBound(btn, "HotelShare")) return;
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      void copyTravelHotelProfileUrl(btn.getAttribute("data-travel-hotel-share") || "").then((success) => {
        const offerCard = btn.closest?.("[data-travel-offer-card]");
        if (!offerCard) return;
        showTravelOfferToast(
          offerCard,
          success ? "Angebots-Link kopiert! Ideal fuer Instagram." : "Link konnte nicht kopiert werden."
        );
      });
    });
  });

  doc.querySelectorAll("[data-travel-offer-card]").forEach((card) => {
    if (!markBound(card, "OfferCard")) return;
    card.querySelectorAll("[data-travel-offer-details]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        setTravelOfferModalOpen(card, true);
      });
    });
    card.querySelectorAll("[data-travel-offer-close]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        setTravelOfferModalOpen(card, false);
      });
    });
    const form = card.querySelector("[data-travel-offer-booking-form]");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const nameValue = cleanText(card.querySelector("[data-travel-offer-booking-name]")?.value || "");
        const phoneValue = cleanText(card.querySelector("[data-travel-offer-booking-phone]")?.value || "");
        if (!nameValue || !phoneValue) {
          showTravelOfferToast(card, "Ju lutem plotësoni të gjitha fushat.");
          return;
        }
        const success = card.querySelector("[data-travel-offer-booking-success]");
        form.classList.add("hidden");
        if (success) success.classList.remove("hidden");
        showTravelOfferToast(card, "Kërkesa u dërgua me sukses!");
      });
    }
  });
}
