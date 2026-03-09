export function clampCropPercentCore(value, fallback = 50) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

export function getMenuItemCropCore(item) {
  return {
    x: clampCropPercentCore(item?.cropX ?? item?.focusX ?? item?.imageFocusX ?? 50, 50),
    y: clampCropPercentCore(item?.cropY ?? item?.focusY ?? item?.imageFocusY ?? 50, 50)
  };
}

export function getMenuItemObjectPositionCore(item) {
  const crop = getMenuItemCropCore(item);
  return `${crop.x}% ${crop.y}%`;
}

export function getFocusItemCropCore(item) {
  return {
    x: clampCropPercentCore(item?.cropX ?? item?.focusX ?? 50, 50),
    y: clampCropPercentCore(item?.cropY ?? item?.focusY ?? 50, 50)
  };
}

export function getFocusItemObjectPositionCore(item) {
  const crop = getFocusItemCropCore(item);
  return `${crop.x}% ${crop.y}%`;
}
