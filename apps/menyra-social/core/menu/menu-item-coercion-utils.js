export function foldMenuTextCore(value) {
  try {
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch {
    return String(value || "").toLowerCase();
  }
}

export function inferMenuTypeHintCore(value) {
  const raw = foldMenuTextCore(value).trim();
  if (!raw) return "";
  if (raw.includes("drink") || raw.includes("beverage") || raw.includes("getraenk") || raw.includes("getranke") || raw.includes("getraenke")) return "drink";
  if (raw.includes("kafe") || raw.includes("cafe") || raw.includes("coffee") || raw.includes("tea") || raw.includes("pije")) return "drink";
  if (raw.includes("speise") || raw.includes("speisen") || raw.includes("food")) return "food";
  return "";
}

export function coerceMenuItemsFromDataCore({
  data,
  normalizeMenuItemDoc
} = {}) {
  const normalizeDoc = typeof normalizeMenuItemDoc === "function" ? normalizeMenuItemDoc : null;
  if (!normalizeDoc) return [];
  const items = [];
  const seen = new Set();

  const addItems = (list, typeHint = "", categoryHint = "") => {
    if (!Array.isArray(list)) return;
    list.forEach((raw, idx) => {
      if (!raw) return;
      const obj = typeof raw === "string" ? { name: raw } : raw;
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
      if (categoryHint && !obj.category && !obj.categoryName && !obj.cat) obj.category = categoryHint;
      if (typeHint && !obj.type && !obj.menuType && !obj.kind && !obj.section && !obj.group) obj.type = typeHint;

      const baseKey = String(obj.id || obj._id || obj.menuItemId || obj.name || obj.title || obj.product || "");
      const key = baseKey ? `${baseKey}|${obj.price ?? ""}|${obj.category || ""}` : `idx_${items.length}_${idx}`;
      if (seen.has(key)) return;
      seen.add(key);

      const normalized = normalizeDoc(obj, obj.id || obj._id || obj.menuItemId || `item_${items.length}`);
      items.push(normalized);
    });
  };

  const addBuckets = (obj) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
    Object.entries(obj).forEach(([key, val]) => {
      if (!Array.isArray(val)) return;
      const hint = inferMenuTypeHintCore(key);
      addItems(val, hint, key);
    });
  };

  if (!data) return items;
  if (Array.isArray(data)) {
    addItems(data);
    return items;
  }

  addItems(data.items);
  addItems(data.menuItems);
  addItems(data.menu);
  addItems(data.speisekarte);
  addItems(data.food || data.foodItems || data.speisen || data.speise, "food");
  addItems(data.drinks || data.drinkItems || data.getraenke || data.getranke || data.beverages, "drink");

  if (data.menu && typeof data.menu === "object" && !Array.isArray(data.menu)) {
    const m = data.menu;
    addItems(m.items);
    addItems(m.menuItems);
    addItems(m.speisekarte);
    addItems(m.food || m.foodItems || m.speisen || m.speise, "food");
    addItems(m.drinks || m.drinkItems || m.getraenke || m.getranke || m.beverages, "drink");
    addBuckets(m);
  }

  if (Array.isArray(data.categories)) {
    data.categories.forEach((cat) => {
      if (!cat || typeof cat !== "object") return;
      const catName = cat.name || cat.title || cat.category || "";
      const hint = inferMenuTypeHintCore(cat.type || catName);
      addItems(cat.items || cat.products || cat.list, hint, catName);
    });
  }

  addBuckets(data);
  return items;
}
