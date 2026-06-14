const MARKETPLACE_SECTIONS = Object.freeze({
  restaurants: Object.freeze({
    key: "restaurants",
    title: "Restaurants",
    emptyTitle: "Noch keine Restaurants",
    emptyBody: "Keine passenden Profile gefunden.",
    icon: "utensils",
    typeKeys: Object.freeze(["restaurant", "cafe", "coffee", "fastfood", "food"])
  }),
  travel: Object.freeze({
    key: "travel",
    title: "Travel",
    emptyTitle: "Noch keine Travel-Profile",
    emptyBody: "Keine passenden Profile gefunden.",
    icon: "plane",
    typeKeys: Object.freeze(["hotel", "hotels", "motel", "motels", "travel", "hostel", "resort", "accommodation"])
  }),
  shopping: Object.freeze({
    key: "shopping",
    title: "Shopping",
    emptyTitle: "Noch keine Shopping-Profile",
    emptyBody: "Keine passenden Profile gefunden.",
    icon: "shopping-bag",
    typeKeys: Object.freeze(["ecommerce"])
  })
});

const SECTION_BY_TYPE = new Map();
Object.values(MARKETPLACE_SECTIONS).forEach((section) => {
  section.typeKeys.forEach((typeKey) => {
    SECTION_BY_TYPE.set(typeKey, section.key);
  });
});

const BEST_LIMIT = 8;
const LIST_LIMIT = 24;

function asFn(candidate, fallback = () => "") {
  return typeof candidate === "function" ? candidate : fallback;
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function normalizeLooseKey(value = "") {
  const raw = cleanText(value).toLowerCase();
  if (!raw) return "";
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeSectionKey(value = "") {
  const key = normalizeLooseKey(value);
  if (key === "restaurant") return "restaurants";
  if (["hotel", "hotels", "motel", "motels"].includes(key)) return "travel";
  if (["shop", "ecommerce", "e_commerce", "shopping"].includes(key)) return "shopping";
  return MARKETPLACE_SECTIONS[key] ? key : "restaurants";
}

function normalizeTypeAlias(key = "") {
  const safeKey = normalizeLooseKey(key);
  if (!safeKey) return "";
  if (safeKey === "e_commerce" || safeKey === "online_shop" || safeKey === "onlineshop" || safeKey === "shop" || safeKey === "store") return "ecommerce";
  if (safeKey === "coffee" || safeKey === "coffe" || safeKey === "kaffee") return "cafe";
  if (safeKey === "fast_food" || safeKey === "snack" || safeKey === "imbiss") return "fastfood";
  if (safeKey === "hotels") return "hotel";
  if (safeKey === "motels") return "motel";
  return safeKey;
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

function resolveBusinessType(record = {}, {
  normalizeRestaurantType,
  normalizeLeadTypeKey
} = {}) {
  const normalizeRestaurant = typeof normalizeRestaurantType === "function"
    ? normalizeRestaurantType
    : ((value) => value);
  const normalizeLeadType = typeof normalizeLeadTypeKey === "function"
    ? normalizeLeadTypeKey
    : ((value) => value);
  const candidates = collectTypeCandidates(record);
  for (const candidate of candidates) {
    const normalized = normalizeTypeAlias(
      normalizeRestaurant(candidate)
      || normalizeLeadType(candidate)
      || candidate
    );
    if (normalized) return normalized;
  }
  const searchable = [
    record.name,
    record.restaurantName,
    record.businessName,
    record.description,
    record.bio
  ].map((value) => cleanText(value).toLowerCase()).join(" ");
  if (/\bhotel(s)?\b/.test(searchable)) return "hotel";
  if (/\bmotel(s)?\b/.test(searchable)) return "motel";
  if (/\bcoffee\b|\bcoffe\b|\bcafe\b|\bcaffe\b/.test(searchable)) return "cafe";
  if (/\bfast\s*food\b|\bfastfood\b/.test(searchable)) return "fastfood";
  if (/\be-?commerce\b|\bonline\s*shop\b/.test(searchable)) return "ecommerce";
  if (/\brestaurant\b|\brestoran\b|\bpizza\b|\bpizzeria\b/.test(searchable)) return "restaurant";
  return "";
}

export function resolveMarketplaceSectionForBusinessCore(record = {}, deps = {}) {
  const typeKey = resolveBusinessType(record, deps);
  return SECTION_BY_TYPE.get(typeKey) || "";
}

function getBusinessId(record = {}) {
  return cleanText(record.canonicalRestaurantId || record.restaurantId || record.id || record.landingRestaurantId || "");
}

function getBusinessName(record = {}) {
  return cleanText(record.name || record.restaurantName || record.businessName || record.displayName || "Business");
}

function getBusinessLocationLabel(record = {}) {
  const city = cleanText(record.city || record.locationCity || record.primaryCity);
  const address = cleanText(record.address || record.location || record.primaryAddress);
  if (city && address && city !== address) return `${city} - ${address}`;
  return city || address || "Standort folgt";
}

function getBusinessHours(record = {}) {
  const raw = record.openingHours || record.openHours || record.hours || record.businessHours || record.workingHours || "";
  if (typeof raw === "string" && cleanText(raw)) return cleanText(raw);
  if (raw && typeof raw === "object") {
    const values = Object.values(raw).map(cleanText).filter(Boolean);
    if (values.length) return values[0];
  }
  return "Oeffnungszeiten folgen";
}

function getBusinessDescription(record = {}) {
  return cleanText(record.description || record.bio || record.about || record.shortDescription || "");
}

function getBusinessRating(record = {}) {
  const value = Number(record.rating ?? record.avgRating ?? record.score ?? record.publicRating ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "";
  return Math.min(5, Math.max(1, value)).toFixed(1);
}

function getBusinessImage(record = {}, {
  getOptimizedImageUrl,
  resolveRestaurantLogo,
  placeholderImage = ""
} = {}) {
  const id = getBusinessId(record);
  const raw = cleanText(
    record.logoUrl
    || record.logo
    || record.logoURL
    || record.heroUrl
    || record.coverUrl
    || record.imageUrl
    || record.img
    || ""
  );
  const resolvedLogo = id && typeof resolveRestaurantLogo === "function"
    ? cleanText(resolveRestaurantLogo(id, raw, "medium"))
    : raw;
  const source = resolvedLogo || raw || placeholderImage;
  const optimized = typeof getOptimizedImageUrl === "function"
    ? cleanText(getOptimizedImageUrl(source, "medium"))
    : source;
  return optimized || placeholderImage || "";
}

function getBusinessSortScore(record = {}) {
  const rating = Number(record.rating ?? record.avgRating ?? record.publicRating ?? 0);
  const score = Number(record.score ?? record.publicScore ?? 0);
  const followers = Number(record.followersCount ?? record.followerCount ?? 0);
  const posts = Number(record.postsCount ?? record.postCount ?? 0);
  const updated = Number(record.updatedAt?.seconds || record.createdAt?.seconds || 0);
  return (Number.isFinite(rating) ? rating * 1000 : 0)
    + (Number.isFinite(score) ? score : 0)
    + (Number.isFinite(followers) ? Math.min(followers, 500) : 0)
    + (Number.isFinite(posts) ? Math.min(posts, 200) : 0)
    + (Number.isFinite(updated) ? Math.min(updated / 100000, 100) : 0);
}

function collectMarketplaceBusinesses(state = {}, deps = {}) {
  const byId = new Map();
  const addRecord = (record = {}) => {
    if (!record || typeof record !== "object") return;
    const id = getBusinessId(record);
    if (!id) return;
    const previous = byId.get(id) || {};
    byId.set(id, { ...previous, ...record, id });
  };
  (Array.isArray(state.bootstrapRestaurantPreview) ? state.bootstrapRestaurantPreview : []).forEach(addRecord);
  (Array.isArray(state.restaurants) ? state.restaurants : []).forEach(addRecord);
  return Array.from(byId.values())
    .map((record) => ({
      ...record,
      __marketplaceSection: resolveMarketplaceSectionForBusinessCore(record, deps),
      __marketplaceScore: getBusinessSortScore(record)
    }))
    .filter((record) => record.__marketplaceSection)
    .sort((a, b) => b.__marketplaceScore - a.__marketplaceScore || getBusinessName(a).localeCompare(getBusinessName(b)));
}

export function filterMarketplaceBusinessesCore(state = {}, sectionKey = "", deps = {}) {
  const section = normalizeSectionKey(sectionKey);
  return collectMarketplaceBusinesses(state, deps)
    .filter((record) => record.__marketplaceSection === section);
}

function renderImage(url = "", alt = "", {
  escapeHtml,
  isPlaceholderUrl,
  extraClass = ""
} = {}) {
  const safeUrl = cleanText(url);
  const usePlaceholder = !safeUrl || (typeof isPlaceholderUrl === "function" && isPlaceholderUrl(safeUrl));
  return `
    <img
      src="${escapeHtml(safeUrl)}"
      alt="${escapeHtml(alt)}"
      loading="lazy"
      class="w-full h-full object-cover bg-slate-100 ${extraClass}"
      ${usePlaceholder ? 'data-placeholder-image="true"' : ""}
    />
  `;
}

function renderBestCard(record = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const name = getBusinessName(record);
  const id = getBusinessId(record);
  const image = getBusinessImage(record, deps);
  const rating = getBusinessRating(record);
  const location = getBusinessLocationLabel(record);
  return `
    <button type="button" data-marketplace-open-business="${escapeHtml(id)}" class="shrink-0 w-44 text-left rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
      <div class="h-28 bg-slate-100 overflow-hidden">
        ${renderImage(image, name, deps)}
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest line-clamp-1">${escapeHtml(record.__marketplaceTypeLabel || "Top")}</span>
          ${rating ? `<span class="text-[10px] font-black text-amber-500 flex items-center gap-1">${icon("star", "w-3 h-3 fill-current")} ${escapeHtml(rating)}</span>` : ""}
        </div>
        <h3 class="text-sm font-black text-slate-900 leading-tight line-clamp-2">${escapeHtml(name)}</h3>
        <p class="mt-2 text-[10px] font-bold text-slate-400 leading-4 line-clamp-1">${escapeHtml(location)}</p>
      </div>
    </button>
  `;
}

function renderListCard(record = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const name = getBusinessName(record);
  const id = getBusinessId(record);
  const image = getBusinessImage(record, deps);
  const rating = getBusinessRating(record);
  const location = getBusinessLocationLabel(record);
  const hours = getBusinessHours(record);
  const description = getBusinessDescription(record);
  const typeLabel = cleanText(record.__marketplaceTypeLabel || record.type || record.customerType || "");
  return `
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <button type="button" data-marketplace-open-business="${escapeHtml(id)}" class="w-full text-left active:scale-[0.99] transition-transform">
        <div class="h-48 bg-slate-100 overflow-hidden">
          ${renderImage(image, name, deps)}
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              ${typeLabel ? `<p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">${escapeHtml(typeLabel)}</p>` : ""}
              <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight">${escapeHtml(name)}</h3>
            </div>
            ${rating ? `<span class="shrink-0 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black flex items-center gap-1">${icon("star", "w-3 h-3 fill-current")} ${escapeHtml(rating)}</span>` : ""}
          </div>
          ${description ? `<p class="mt-3 text-xs font-semibold text-slate-500 leading-5 line-clamp-2">${escapeHtml(description)}</p>` : ""}
          <div class="mt-4 grid grid-cols-1 gap-2 text-[11px] font-bold text-slate-500">
            <div class="flex items-center gap-2 min-w-0">
              ${icon("map-pin", "w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${escapeHtml(location)}</span>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              ${icon("clock", "w-3.5 h-3.5 text-slate-400 shrink-0")}
              <span class="truncate">${escapeHtml(hours)}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  `;
}

function withTypeLabel(record = {}, section = {}) {
  const type = cleanText(record.__marketplaceType || record.type || record.customerType || "");
  const normalized = normalizeTypeAlias(type);
  const labels = {
    restaurant: "Restaurant",
    cafe: "Cafe",
    coffee: "Cafe",
    fastfood: "Fastfood",
    hotel: "Hotel",
    motel: "Motel",
    ecommerce: "E-Commerce"
  };
  return {
    ...record,
    __marketplaceTypeLabel: labels[normalized] || section.title,
    __marketplaceType: normalized
  };
}

function renderEmptyState(section = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  return `
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-5 rounded-[1.5rem] bg-slate-100 text-slate-400 flex items-center justify-center">
        ${icon(section.icon, "w-6 h-6")}
      </div>
      <h3 class="text-lg font-black tracking-tight text-slate-900">${escapeHtml(section.emptyTitle)}</h3>
      <p class="mt-2 text-xs font-semibold text-slate-400 leading-5">${escapeHtml(section.emptyBody)}</p>
    </div>
  `;
}

function renderDataLoadingState(section = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  return `
    <div class="rounded-[2rem] border border-slate-100 bg-white p-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
      ${icon("loader-2", "w-4 h-4 animate-spin")}
      Daten werden geladen ...
    </div>
  `;
}

export function renderMarketplaceViewCore({
  state = {},
  dataLoaded = null,
  sectionKey = "restaurants",
  escapeHtmlFn,
  iconFn,
  getOptimizedImageUrlFn,
  isPlaceholderUrlFn,
  placeholderImage = "",
  normalizeRestaurantTypeFn,
  normalizeLeadTypeKeyFn,
  resolveRestaurantLogoFn
} = {}) {
  const section = MARKETPLACE_SECTIONS[normalizeSectionKey(sectionKey)] || MARKETPLACE_SECTIONS.restaurants;
  const escapeHtml = asFn(escapeHtmlFn, (value = "") => String(value || ""));
  const icon = asFn(iconFn, () => "");
  const deps = {
    escapeHtml,
    icon,
    getOptimizedImageUrl: getOptimizedImageUrlFn,
    isPlaceholderUrl: isPlaceholderUrlFn,
    placeholderImage,
    resolveRestaurantLogo: resolveRestaurantLogoFn,
    normalizeRestaurantType: normalizeRestaurantTypeFn,
    normalizeLeadTypeKey: normalizeLeadTypeKeyFn
  };
  const items = filterMarketplaceBusinessesCore(state, section.key, deps)
    .slice(0, LIST_LIMIT)
    .map((record) => withTypeLabel({
      ...record,
      __marketplaceType: resolveBusinessType(record, deps)
    }, section));
  const bestItems = items.slice(0, BEST_LIMIT);
  const restaurantsLoaded = dataLoaded?.restaurants === true;

  return `
    <section class="p-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      ${items.length ? `
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-x-auto hide-scrollbar snap-x" style="-webkit-overflow-scrolling:touch; scrollbar-width:none;">
            ${bestItems.map((record) => renderBestCard(record, deps)).join("")}
          </div>
        </div>

        <div class="space-y-4">
          ${items.map((record) => renderListCard(record, deps)).join("")}
        </div>
      ` : (restaurantsLoaded ? renderEmptyState(section, deps) : renderDataLoadingState(section, deps))}
    </section>
  `;
}
