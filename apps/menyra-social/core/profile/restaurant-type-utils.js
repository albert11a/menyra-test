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
  if (raw.includes("cafe") || raw.includes("coffee") || raw.includes("coffe")) return "cafe";
  if (raw.includes("restaurant") || raw.includes("resto")) return "restaurant";
  if (raw.includes("fast")) return "fastfood";
  // Als ganzes Wort, sonst wuerde jedes "barbecue" oder "barake" zur Bar.
  if (/\bbars?\b|\bpub\b|\blounge\b/.test(raw)) return "bar";
  if (raw.includes("hotel") || raw.includes("hostel") || raw.includes("resort") || raw.includes("accommodation")) return "hotel";
  if (raw.includes("motel")) return "motel";
  if (raw.includes("ecom") || raw.includes("online") || raw.includes("shop") || raw.includes("store")) return "ecommerce";
  if (raw.includes("tank") || raw.includes("gas") || raw.includes("fuel")) return "tankstelle";
  if (raw.includes("lebens") || raw.includes("grocery") || raw.includes("supermarkt")) return "lebensmittel";
  if (raw.includes("apothek") || raw.includes("pharmacy")) return "apotheken";
  if (raw.includes("service") || raw.includes("dienst")) return "services";
  return raw;
}
