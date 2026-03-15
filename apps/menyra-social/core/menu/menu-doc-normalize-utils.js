import { getMenuItemCropCore } from "../media/crop-utils.js";
import { normalizeOptionListCore, normalizeMenuTypeCore } from "./menu-input-utils.js";
import { normalizeMenuCardStyleCore } from "./menu-card-style-utils.js";

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
  const stockValue = typeof stockRaw === "string" ? stockRaw.trim() : stockRaw;
  const stockNumber = Number(stockValue);
  const crop = getMenuItemCrop(d);
  const normalizedType = normalizeMenuType(d.type || d.menuType || d.kind || d.group || d.section);
  const orderRaw = d.orderIndex ?? d.sortOrder ?? d.position ?? d.rank ?? null;
  const orderNumber = Number(orderRaw);
  const menuSectionRaw = String(d.menuSection || d.displaySection || d.menuPlacement || "").trim().toLowerCase();
  const menuSection = menuSectionRaw === "drink" || menuSectionRaw === "food"
    ? menuSectionRaw
    : (normalizedType === "drink" ? "drink" : "food");
  const visibilityRaw = String(d.visibility || d.status || "").trim().toLowerCase();
  const statusVisibilityRaw = String(d.statusVisibility || "").trim().toLowerCase();
  const statusHidden = d.statusHidden === true
    || statusVisibilityRaw === "hidden"
    || d.hidden === true
    || d.visible === false
    || visibilityRaw === "hidden";
  const menuVisibilityRaw = String(d.menuVisibility || "").trim().toLowerCase();
  const hidden = d.menuHidden === true || menuVisibilityRaw === "hidden";
  const specialSizeRaw = String(d.specialSize || d.specialCardSize || "").trim().toLowerCase();
  const specialSize = specialSizeRaw === "food" ? "food" : "default";
  const specialActionPayload = d.specialAction && typeof d.specialAction === "object" ? d.specialAction : {};
  const specialActionTypeRaw = String(
    d.specialActionType
      || d.actionType
      || specialActionPayload.type
      || ""
  ).trim().toLowerCase();
  const specialActionType = specialActionTypeRaw === "link" || specialActionTypeRaw === "product"
    ? specialActionTypeRaw
    : "self";
  const specialActionUrl = String(
    d.specialActionUrl
      || d.linkUrl
      || d.actionUrl
      || specialActionPayload.url
      || ""
  ).trim();
  const specialActionProductId = String(
    d.specialActionProductId
      || d.targetProductId
      || d.productId
      || specialActionPayload.productId
      || ""
  ).trim();
  const normalizeExternalUrl = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return raw;
    return `https://${raw.replace(/^\/+/, "")}`;
  };
  const normalizeCrossSellItemIds = (value) => {
    const seen = new Set();
    const pushId = (entry) => {
      if (entry === null || entry === undefined) return;
      if (Array.isArray(entry)) {
        entry.forEach(pushId);
        return;
      }
      const raw = typeof entry === "object"
        ? (entry.id || entry.itemId || entry.productId || entry.menuItemId || "")
        : entry;
      const str = String(raw || "").trim();
      if (!str) return;
      str.split(",").forEach((part) => {
        const next = String(part || "").trim();
        if (!next || seen.has(next)) return;
        seen.add(next);
      });
    };
    pushId(value);
    return Array.from(seen);
  };
  const woltUrl = normalizeExternalUrl(
    d.woltUrl
      || d.woltLink
      || d.woltURL
      || d.deliveryUrl
      || d.deliveryURL
      || ""
  );
  const normalizedId = String(d.id || id || "").trim();
  const crossSellItemIds = normalizeCrossSellItemIds(
    d.crossSellItemIds
      || d.crossSellIds
      || d.crossSellProducts
      || d.crossSelling
      || d.crossSell
  ).filter((entryId) => entryId && entryId !== normalizedId);
  return {
    id: normalizedId,
    type: normalizedType,
    menuSection,
    orderIndex: Number.isFinite(orderNumber) ? Math.max(0, Math.floor(orderNumber)) : null,
    category: d.category || "Sonstiges",
    name: d.name || d.title || "Produkt",
    description: d.description || d.desc || "",
    longDescription: d.longDescription || "",
    allergens: d.allergens || d.allergen || "",
    woltUrl,
    brand: String(d.brand || d.manufacturer || "").trim(),
    sku: String(d.sku || d.articleNumber || d.articleNo || d.code || "").trim(),
    stock: stockValue === "" || stockValue === null || stockValue === undefined
      ? null
      : (Number.isFinite(stockNumber) ? Math.max(0, Math.round(stockNumber)) : null),
    sizes,
    colors,
    cropX: crop.x,
    cropY: crop.y,
    price: d.price ?? "",
    available: d.available !== false,
    hidden,
    statusHidden,
    statusVisibility: statusHidden ? "hidden" : "auto",
    cardStyle: normalizeMenuCardStyleCore(
      d.cardStyle || d.menuCardStyle || d.cardLayout || d.layoutStyle || "",
      normalizedType
    ),
    specialSize,
    specialActionType,
    specialActionUrl: specialActionType === "link" ? specialActionUrl : "",
    specialActionProductId: specialActionType === "product" ? specialActionProductId : "",
    crossSellItemIds,
    imageUrl: mergedImages[0] || "",
    imageUrls: mergedImages
  };
}
