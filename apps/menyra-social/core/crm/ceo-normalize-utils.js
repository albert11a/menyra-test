export function parseCoordNumberCore(value) {
  const raw = typeof value === "string" ? value.replace(",", ".").trim() : value;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

export function uniqueStringListCore(values = []) {
  return Array.from(new Set(
    (values || [])
      .map((value) => String(value || "").trim())
      .filter(Boolean)
  ));
}

export function normalizeCeoCountryCore(value, {
  allowedCountries = []
} = {}) {
  const countries = Array.isArray(allowedCountries) && allowedCountries.length
    ? allowedCountries
    : ["Kosovo", "Albanien", "Serbien"];
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return countries[0];
  if (["xk", "kosovo", "kosove", "kosova"].includes(raw)) return "Kosovo";
  if (["al", "albania", "albanien", "shqiperi", "shqiperia"].includes(raw)) return "Albanien";
  if (["rs", "serbia", "serbien", "srbija"].includes(raw)) return "Serbien";
  const match = countries.find((entry) => entry.toLowerCase() === raw);
  return match || countries[0];
}

export function normalizeCeoPathCore(value, fallback = [], {
  uniqueStringListFn
} = {}) {
  const uniqueStringList = typeof uniqueStringListFn === "function"
    ? uniqueStringListFn
    : uniqueStringListCore;
  const base = Array.isArray(value)
    ? value
    : String(value || "")
      .split(/[,\s]+/)
      .filter(Boolean);
  return uniqueStringList([...(base || []), ...(fallback || [])]);
}

export function buildCeoNameCore({
  firstName = "",
  lastName = "",
  fallback = "",
  email = ""
} = {}) {
  const combined = `${String(firstName || "").trim()} ${String(lastName || "").trim()}`.trim();
  if (combined) return combined;
  const safeFallback = String(fallback || "").trim();
  if (safeFallback) return safeFallback;
  const safeEmail = String(email || "").trim();
  return safeEmail ? safeEmail.split("@")[0] : "CEO";
}
