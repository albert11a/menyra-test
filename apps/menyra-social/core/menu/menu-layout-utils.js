export function saveMenuLayoutToStorageCore({
  safeStorage,
  menuLayoutKey,
  layout
} = {}) {
  try {
    safeStorage?.setItem?.(menuLayoutKey, JSON.stringify(layout || {}));
  } catch {}
}

export function getMenuLayoutThemeCore({
  colorId,
  themes = []
} = {}) {
  const id = String(colorId || "").trim();
  if (!Array.isArray(themes) || !themes.length) return null;
  return themes.find((theme) => theme.id === id) || themes[0] || null;
}

export function getFocusCardClassCore({
  colorId,
  themes = [],
  fallbackClass = "bg-white border-slate-100"
} = {}) {
  const theme = getMenuLayoutThemeCore({ colorId, themes });
  return theme?.cardClass || fallbackClass;
}
