// Deep-Link aus Story-Produkt-Tags: /menu?r=<restaurantId>&item=<menuItemId>
// Der Story-Viewer erzeugt diese Links ("Shiko produktin"); die Menue-Seite
// soll damit exakt das markierte Produkt oeffnen.

export function resolveMenuItemDeepLinkTargetCore({ search = "" } = {}) {
  const raw = String(search || "").trim();
  if (!raw) return { itemId: "", restaurantId: "" };
  let params = null;
  try {
    params = new URLSearchParams(raw.startsWith("?") ? raw.slice(1) : raw);
  } catch {
    return { itemId: "", restaurantId: "" };
  }
  const itemId = String(
    params.get("item")
    || params.get("itemId")
    || params.get("menuItem")
    || ""
  ).trim();
  const restaurantId = String(
    params.get("r")
    || params.get("restaurant")
    || params.get("restaurantId")
    || params.get("rid")
    || params.get("businessId")
    || ""
  ).trim();
  return { itemId, restaurantId };
}

export function buildMenuOpenSelectorCore(itemId = "", cssObj = null) {
  const safeId = String(itemId || "").trim();
  if (!safeId) return "";
  const escaped = cssObj && typeof cssObj.escape === "function"
    ? cssObj.escape(safeId)
    : safeId.replace(/["\\]/g, "\\$&");
  return `[data-menu-open="${escaped}"]`;
}
