export function normalizeLeadCountryCore(value, {
  allowedCountries = [],
  fallbackCountry = ""
} = {}) {
  const safe = String(value || "").trim().toLowerCase();
  const normalized = typeof safe.normalize === "function"
    ? safe.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    : safe;
  if (["serbia", "serbien", "srbija", "rs"].includes(normalized)) return "Serbien";
  if (["albania", "albanien", "shqiperi", "shqiperia", "al"].includes(normalized)) return "Albanien";
  if (["kosovo", "kosova", "kosove", "xk"].includes(normalized)) return "Kosovo";
  if (["austria", "osterreich", "oesterreich", "at", "aut"].includes(normalized)) return "Oesterreich";
  const original = String(value || "").trim();
  return allowedCountries.includes(original) ? original : fallbackCountry;
}

export function buildLeadAccountEmailCore(name = "") {
  const localPart = String(name || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/[^a-z0-9]/g, "");
  return localPart ? `${localPart}@mnyra.com` : "";
}

export function inferLeadCountryFromTextCore(text = "", fallbackCountry = "", {
  normalizeSearchKeyFn,
  normalizeLeadCountryFn
} = {}) {
  const normalizeSearch = typeof normalizeSearchKeyFn === "function"
    ? normalizeSearchKeyFn
    : ((value) => String(value || "").trim().toLowerCase());
  const normalizeCountry = typeof normalizeLeadCountryFn === "function"
    ? normalizeLeadCountryFn
    : ((value) => String(value || "").trim());
  const value = normalizeSearch(text);
  const normalizedValue = typeof value.normalize === "function"
    ? value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    : value;
  if (normalizedValue.includes("serbien") || normalizedValue.includes("serbia") || normalizedValue.includes("beograd") || normalizedValue.includes("belgrad")) return "Serbien";
  if (normalizedValue.includes("albanien") || normalizedValue.includes("albania") || normalizedValue.includes("tirana")) return "Albanien";
  if (normalizedValue.includes("kosovo") || normalizedValue.includes("kosova") || normalizedValue.includes("prishtina") || normalizedValue.includes("pristina")) return "Kosovo";
  if (
    normalizedValue.includes("oesterreich")
    || normalizedValue.includes("osterreich")
    || normalizedValue.includes("austria")
    || normalizedValue.includes("wien")
    || normalizedValue.includes("vienna")
    || /(^|[^a-z])(at|aut)([^a-z]|$)/.test(normalizedValue)
  ) {
    return "Oesterreich";
  }
  return normalizeCountry(fallbackCountry);
}
