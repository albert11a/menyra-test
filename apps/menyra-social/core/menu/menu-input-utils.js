export function normalizeOptionListCore(value) {
  const values = [];
  const add = (entry) => {
    const str = String(entry || "").trim();
    if (!str) return;
    const normalized = str.replace(/\s+/g, " ");
    if (!values.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      values.push(normalized);
    }
  };
  if (Array.isArray(value)) {
    value.forEach((entry) => {
      if (entry && typeof entry === "object") {
        add(entry.label || entry.name || entry.value || "");
      } else {
        add(entry);
      }
    });
    return values;
  }
  String(value || "")
    .split(/[\n,;|]+/)
    .forEach(add);
  return values;
}

export function normalizeMenuTypeCore(value) {
  const t = String(value || "").toLowerCase().trim();
  if (t === "drink" || t === "drinks" || t === "beverage" || t === "getraenke" || t === "getränke") return "drink";
  return "food";
}
