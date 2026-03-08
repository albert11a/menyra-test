export function normalizeLeadTypeKeyCore(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
  if (!key) return "";
  if (key === "e_commerce") return "ecommerce";
  if (["online_shop", "onlineshop", "online-shop", "shop", "store", "laden"].includes(key)) return "ecommerce";
  if (["fast_food", "imbiss", "snack"].includes(key)) return "fastfood";
  if (["tank", "gas_station", "gasstation", "fuel", "petrol"].includes(key)) return "tankstelle";
  if (["grocery", "supermarket", "supermarkt", "market"].includes(key)) return "lebensmittel";
  if (["apotheke", "pharmacy"].includes(key)) return "apotheken";
  if (["service", "dienstleistung", "dienstleistungen"].includes(key)) return "services";
  return key || "";
}
