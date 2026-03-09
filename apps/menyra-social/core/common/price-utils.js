export function formatPriceCore(value, currency = "€") {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isFinite(num)) return `${num.toFixed(2)} ${currency}`;
  const str = String(value).trim();
  return str ? `${str} ${currency}` : "-";
}

export function parsePriceValueCore(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const normalized = raw.replace(/[^0-9,.-]/g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}
