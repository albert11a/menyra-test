export function normalizeRestaurantTypeCore(value, {
  normalizeLeadTypeKeyFn
} = {}) {
  const normalizeLeadType = typeof normalizeLeadTypeKeyFn === "function"
    ? normalizeLeadTypeKeyFn
    : (() => "");
  const normalized = normalizeLeadType(value);
  if (normalized) return normalized;
  const raw = String(value || "").toLowerCase().trim();
  if (!raw) return "";
  if (raw.includes("cafe") || raw.includes("coffee")) return "cafe";
  if (raw.includes("restaurant") || raw.includes("resto")) return "restaurant";
  if (raw.includes("fast")) return "fastfood";
  if (raw.includes("ecom") || raw.includes("online") || raw.includes("shop") || raw.includes("store")) return "ecommerce";
  if (raw.includes("tank") || raw.includes("gas") || raw.includes("fuel")) return "tankstelle";
  if (raw.includes("lebens") || raw.includes("grocery") || raw.includes("supermarkt")) return "lebensmittel";
  if (raw.includes("apothek") || raw.includes("pharmacy")) return "apotheken";
  if (raw.includes("service") || raw.includes("dienst")) return "services";
  return raw;
}
