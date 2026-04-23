const DEFAULT_LEAD_CURRENCY_CODE = "EUR";

function normalizeCountryKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeCurrencyCodeCore(value, fallback = DEFAULT_LEAD_CURRENCY_CODE) {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) return String(fallback || "").trim().toUpperCase();
  if (raw === "€") return "EUR";
  if (/^[A-Z]{3}$/.test(raw)) return raw;
  return String(fallback || "").trim().toUpperCase();
}

export function resolveCurrencyCodeFromLeadCountryCore(country = "", fallback = DEFAULT_LEAD_CURRENCY_CODE) {
  const key = normalizeCountryKey(country);
  if (key === "serbien" || key === "serbia") return "RSD";
  if (key === "albanien" || key === "albania") return "LEK";
  if (key === "kosovo" || key === "kosova") return "EUR";
  return normalizeCurrencyCodeCore("", fallback);
}

export function resolveEntityCurrencyCodeCore(entity = {}, fallback = DEFAULT_LEAD_CURRENCY_CODE) {
  const record = entity && typeof entity === "object" ? entity : {};
  const explicitCurrency = normalizeCurrencyCodeCore(
    record.currencyCode || record.currency || record.currency_code || "",
    ""
  );
  if (explicitCurrency) return explicitCurrency;
  return resolveCurrencyCodeFromLeadCountryCore(
    record.country || record.countryName || record.country_code || "",
    fallback
  );
}

