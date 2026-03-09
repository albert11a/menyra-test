import { getMenuItemCropCore } from "../media/crop-utils.js";
import { normalizeOptionListCore, normalizeMenuTypeCore } from "./menu-input-utils.js";

export function normalizeMenuItemDocCore(data, id, {
  normalizeMenuTypeFn,
  normalizeOptionListFn,
  getMenuItemCropFn
} = {}) {
  const normalizeMenuType = typeof normalizeMenuTypeFn === "function"
    ? normalizeMenuTypeFn
    : normalizeMenuTypeCore;
  const normalizeOptionList = typeof normalizeOptionListFn === "function"
    ? normalizeOptionListFn
    : normalizeOptionListCore;
  const getMenuItemCrop = typeof getMenuItemCropFn === "function"
    ? getMenuItemCropFn
    : getMenuItemCropCore;

  const d = data || {};
  const looksLikeImageString = (value) => {
    const str = String(value || "").trim();
    if (!str) return false;
    const lower = str.toLowerCase();
    if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("data:") || lower.startsWith("blob:") || lower.startsWith("gs://")) return true;
    if (lower.startsWith("media/") || lower.startsWith("social/") || lower.startsWith("menu/")) return true;
    return /\.(avif|webp|png|jpe?g|gif|svg|bmp|tiff?)(\?.*)?$/i.test(str);
  };

  const normalizeImg = (value, depth = 0, seen = new WeakSet()) => {
    if (!value) return "";
    if (typeof value === "string") {
      const cleaned = value.trim();
      if (!cleaned) return "";
      const lower = cleaned.toLowerCase();
      if (lower === "null" || lower === "undefined" || lower === "data") return "";
      if ((cleaned.startsWith("{") && cleaned.endsWith("}")) || (cleaned.startsWith("[") && cleaned.endsWith("]"))) {
        try {
          const parsed = JSON.parse(cleaned);
          return normalizeImg(parsed, depth + 1, seen);
        } catch {}
      }
      return cleaned;
    }
    if (typeof value === "object") {
      if (seen.has(value)) return "";
      seen.add(value);
      const candidate = value.url
        || value.src
        || value.imageUrl
        || value.imageURL
        || value.image_url
        || value.imagePath
        || value.image_path
        || value.imageSrc
        || value.image_src
        || value.path
        || value.cdnUrl
        || value.cdnURL
        || value.downloadURL
        || value.downloadUrl
        || value.photoUrl
        || value.photoURL
        || value.photo_url
        || value.picture
        || value.pictureUrl
        || value.pictureURL
        || value.photo
        || value.img
        || value.imgUrl
        || value.imgURL
        || value.img_src
        || value.imgSrc
        || value.thumbnail
        || value.thumbnailUrl
        || value.thumbnailURL
        || value.thumb
        || value.original
        || value.file
        || value.fileUrl
        || value.fileURL
        || value.publicUrl
        || value.publicURL
        || value.secure_url
        || value.secureUrl;
      const resolved = normalizeImg(candidate, depth + 1, seen);
      if (resolved) return resolved;
      if (depth < 2) {
        for (const val of Object.values(value)) {
          if (typeof val === "string" && looksLikeImageString(val)) {
            const found = normalizeImg(val, depth + 1, seen);
            if (found) return found;
          } else if (val && typeof val === "object") {
            const found = normalizeImg(val, depth + 1, seen);
            if (found) return found;
          }
        }
      }
      return "";
    }
    return "";
  };

  const rawImages = [];
  [d.imageUrls, d.images, d.image, d.gallery, d.photos, d.media, d.mediaUrls, d.photoUrls, d.pictureUrls].forEach((list) => {
    if (Array.isArray(list)) {
      rawImages.push(...list);
    } else if (typeof list === "string" && list.trim()) {
      rawImages.push(list);
    }
  });
  const primaryImage = normalizeImg(
    d.imageUrl
      || d.imageURL
      || d.image_url
      || d.image
      || d.photoUrl
      || d.photoURL
      || d.photo_url
      || d.img
      || d.imgUrl
      || d.imgURL
      || d.thumbnail
      || d.thumb
      || d.cover
      || d.coverUrl
      || d.coverURL
      || ""
  );
  const mergedImages = Array.from(new Set([primaryImage, ...rawImages.map(normalizeImg)].filter(Boolean)));
  const sizes = normalizeOptionList(d.sizes || d.sizeOptions || d.availableSizes || d.variants || d.size);
  const colors = normalizeOptionList(d.colors || d.colours || d.colorOptions || d.availableColors || d.color);
  const stockRaw = d.stock ?? d.stockCount ?? d.inventory ?? d.quantity ?? "";
  const stockNumber = Number(stockRaw);
  const crop = getMenuItemCrop(d);
  return {
    id: d.id || id || "",
    type: normalizeMenuType(d.type || d.menuType || d.kind || d.group || d.section),
    category: d.category || "Sonstiges",
    name: d.name || d.title || "Produkt",
    description: d.description || d.desc || "",
    longDescription: d.longDescription || "",
    allergens: d.allergens || d.allergen || "",
    brand: String(d.brand || d.manufacturer || "").trim(),
    sku: String(d.sku || d.articleNumber || d.articleNo || d.code || "").trim(),
    stock: stockRaw === "" || stockRaw === null || stockRaw === undefined
      ? null
      : (Number.isFinite(stockNumber) ? Math.max(0, Math.round(stockNumber)) : null),
    sizes,
    colors,
    cropX: crop.x,
    cropY: crop.y,
    price: d.price ?? "",
    available: d.available !== false,
    imageUrl: mergedImages[0] || "",
    imageUrls: mergedImages
  };
}
