export function buildShopVariantKeyCore(itemId, { size = "", color = "" } = {}) {
  const baseId = String(itemId || "").trim();
  const sizeKey = String(size || "").trim().toLowerCase();
  const colorKey = String(color || "").trim().toLowerCase();
  return `${baseId}::${sizeKey || "-"}::${colorKey || "-"}`;
}
