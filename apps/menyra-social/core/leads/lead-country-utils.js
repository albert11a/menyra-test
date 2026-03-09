export function normalizeLeadCountryCore(value, {
  allowedCountries = [],
  fallbackCountry = ""
} = {}) {
  const safe = String(value || "").trim().toLowerCase();
  if (safe === "serbia" || safe === "serbien") return "Serbien";
  if (safe === "albania" || safe === "albanien") return "Albanien";
  if (safe === "kosovo" || safe === "kosova") return "Kosovo";
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
  if (value.includes("serbien") || value.includes("serbia") || value.includes("beograd") || value.includes("belgrad")) return "Serbien";
  if (value.includes("albanien") || value.includes("albania") || value.includes("tirana")) return "Albanien";
  if (value.includes("kosovo") || value.includes("kosova") || value.includes("prishtina") || value.includes("pristina")) return "Kosovo";
  return normalizeCountry(fallbackCountry);
}
