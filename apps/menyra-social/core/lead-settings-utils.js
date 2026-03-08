export function normalizeLeadSettingsCore(raw = {}, {
  defaultPassword = "",
  defaultCountry = "",
  normalizeLeadCountryFn,
  normalizeLeadPricingFn
} = {}) {
  const normalizeCountry = typeof normalizeLeadCountryFn === "function"
    ? normalizeLeadCountryFn
    : ((value) => String(value || "").trim());
  const normalizePricing = typeof normalizeLeadPricingFn === "function"
    ? normalizeLeadPricingFn
    : ((value) => value || {});
  const input = raw && typeof raw === "object" ? raw : {};
  return {
    defaultPassword: String(input.defaultPassword || defaultPassword || "").trim() || defaultPassword,
    defaultCountry: normalizeCountry(input.defaultCountry || input.locationCountry || defaultCountry),
    pricing: normalizePricing(input.pricing || input.typePricing || {})
  };
}

export function getLeadSettingsConfigCore(profile = {}, {
  normalizeLeadSettingsFn
} = {}) {
  const normalizeSettings = typeof normalizeLeadSettingsFn === "function"
    ? normalizeLeadSettingsFn
    : ((value) => value || {});
  return normalizeSettings(profile?.leadSettings || {});
}

export function getLeadCountryCenterCore(country = "", {
  normalizeLeadCountryFn,
  countryCenters = {},
  defaultCountry = "",
  defaultCenter = null
} = {}) {
  const normalizeCountry = typeof normalizeLeadCountryFn === "function"
    ? normalizeLeadCountryFn
    : ((value) => String(value || "").trim());
  const key = normalizeCountry(country);
  return countryCenters[key] || countryCenters[defaultCountry] || defaultCenter;
}

export function buildLeadContactNameCore(firstName = "", lastName = "", fallback = "") {
  const combined = `${String(firstName || "").trim()} ${String(lastName || "").trim()}`.trim();
  return combined || String(fallback || "").trim();
}

export function getLeadMonthlyPriceCore(type = "", config = {}, {
  normalizeLeadPricingFn,
  resolveCustomerTypeFn
} = {}) {
  const normalizePricing = typeof normalizeLeadPricingFn === "function"
    ? normalizeLeadPricingFn
    : ((value) => value || {});
  const resolveCustomerType = typeof resolveCustomerTypeFn === "function"
    ? resolveCustomerTypeFn
    : ((value) => String(value || "").trim());
  const pricing = normalizePricing(config?.pricing || {});
  const key = resolveCustomerType(type || "cafe");
  return Number(pricing[key]) || 0;
}

export function getLeadPriceForCycleCore(type = "", cycle = "monthly", config = {}, {
  getLeadMonthlyPriceFn
} = {}) {
  const getMonthly = typeof getLeadMonthlyPriceFn === "function"
    ? getLeadMonthlyPriceFn
    : (() => 0);
  const monthly = getMonthly(type, config);
  return cycle === "yearly" ? monthly * 12 : monthly;
}
