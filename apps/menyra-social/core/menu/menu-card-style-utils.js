export function isTestfirstMenuProfileTypeCore(value = "") {
  const type = String(value || "").trim().toLowerCase();
  return type === "restaurant" || type === "cafe" || type === "fastfood";
}

export function normalizeMenuCardStyleCore(value = "", fallbackType = "food") {
  const normalizedType = String(fallbackType || "").trim().toLowerCase() === "drink"
    ? "drink"
    : "food";
  const raw = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (raw === "testfirst_focus" || raw === "focus") return "testfirst_focus";
  if (raw === "testfirst_special" || raw === "special") return "testfirst_special";
  if (raw === "testfirst_drink" || raw === "drink") return "testfirst_drink";
  if (raw === "testfirst_food" || raw === "food") return "testfirst_food";
  return normalizedType === "drink" ? "testfirst_drink" : "testfirst_food";
}
