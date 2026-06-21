import {
  db
} from "/shared/firebase-config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import {
  ALBERT_CEO_ALIASES,
  ALBERT_CEO_EMAILS,
  ALBERT_CEO_UID,
  HIDDEN_LEGACY_CEO_EMAILS,
  hasGlobalCeoAccessCore,
  isAlbertCeoUserCore,
  isCeoUserCore,
  normalizeEmailValue,
  normalizeHandleValue,
  normalizeRoleList
} from "/shared/ceo-access.js";
import {
  getCurrentCeoMetaCore
} from "../menyra-social/core/crm/ceo-meta-utils.js";
import {
  normalizeCeoPathCore,
  uniqueStringListCore
} from "../menyra-social/core/crm/ceo-normalize-utils.js";

const HEART_ADS_READ_LIMIT = 160;

function asText(value = "") {
  return String(value || "").trim();
}

function normalizeKey(value = "") {
  let key = asText(value).toLowerCase();
  if (!key) return "";
  try {
    if (typeof key.normalize === "function") {
      key = key.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }
  } catch {}
  return key
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeReviewStatus(value = "") {
  const key = normalizeKey(value);
  if (["approved", "active", "freigegeben", "accepted", "confirmed", "bestaetigt"].includes(key)) return "approved";
  if (["rejected", "declined", "abgelehnt", "denied"].includes(key)) return "rejected";
  return "pending";
}

function toDateMs(value) {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime() || 0;
  if (typeof value.toDate === "function") {
    try {
      return value.toDate()?.getTime?.() || 0;
    } catch {}
  }
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.getTime() : 0;
}

function isRestaurantAdItem(item = {}) {
  const key = normalizeKey(item?.adType || item?.kind || item?.type || "");
  return item?.isRestaurantAd === true
    || item?.restaurantAd === true
    || key === "restaurant_ad"
    || key === "ad"
    || key === "ads"
    || item?.adCategory !== undefined
    || item?.adPriceSegment !== undefined
    || item?.priceSegment !== undefined
    || item?.reviewStatus !== undefined
    || item?.approvalStatus !== undefined;
}

function normalizeRestaurantType(value = "") {
  const key = normalizeKey(value);
  if (key === "coffee") return "cafe";
  if (key === "fast_food") return "fastfood";
  return key;
}

function isRestaurantLike(row = {}) {
  const type = normalizeRestaurantType(
    row.type
    || row.customerType
    || row.category
    || row.kind
    || row.restaurantType
    || row.businessProfileType
    || row.profileType
    || row.vertical
    || row.leadType
    || ""
  );
  if (["restaurant", "restaurants", "cafe", "fastfood", "food", "bakery", "bar", "grill"].includes(type)) return true;
  const searchable = [
    row.name,
    row.restaurantName,
    row.businessName,
    row.description,
    row.bio,
    row.about
  ].map((value) => asText(value).toLowerCase()).join(" ");
  return /\brestaurant(s)?\b|\bcafe(s)?\b|\bcoffee\b|\bburger\b|\bpizza\b|\bbakery\b|\bgrill\b|\bseafood\b/.test(searchable);
}

function getRestaurantName(row = {}) {
  return asText(row.name || row.restaurantName || row.businessName || row.displayName || row.id || "Restaurant");
}

function getRestaurantImage(row = {}) {
  return asText(row.coverImageUrl || row.coverUrl || row.heroImageUrl || row.logoUrl || row.logo || row.imageUrl || "");
}

function normalizeAdItem(row = {}, item = {}, index = 0) {
  const id = asText(item.id || item.offerId || item._id || `ad_${index}`);
  const status = normalizeReviewStatus(item.reviewStatus || item.approvalStatus || "");
  const priceSegment = asText(item.adPriceSegment || item.priceSegment || item.priceRange || item.priceLabel || "");
  return {
    id,
    restaurantId: asText(row.id || row.restaurantId || ""),
    restaurantName: getRestaurantName(row),
    restaurantCity: asText(row.city || row.location || row.address || ""),
    restaurantType: normalizeRestaurantType(row.type || row.customerType || row.category || ""),
    title: asText(item.title || item.name || getRestaurantName(row)),
    text: asText(item.text || item.description || item.desc || ""),
    imageUrl: asText(item.imageUrl || item.image || item.photoUrl || getRestaurantImage(row)),
    adCategory: asText(item.adCategory || item.categoryLabel || "RESTAURANT"),
    priceSegment,
    woltEnabled: item.woltEnabled !== false,
    woltUrl: asText(item.woltUrl || item.deliveryUrl || ""),
    choiceBadge: asText(item.choiceBadge || "Best Choice"),
    deliveryBadge: asText(item.deliveryBadge || "For Delivery"),
    reviewStatus: status,
    approvalStatus: status,
    active: item.active !== false,
    reviewRequestedAt: asText(item.reviewRequestedAt || item.requestedAt || ""),
    reviewedAt: asText(item.reviewedAt || ""),
    reviewedByName: asText(item.reviewedByName || ""),
    createdAtMs: toDateMs(item.reviewRequestedAt || item.createdAt || row.updatedAt || row.createdAt),
    updatedAtMs: toDateMs(item.reviewedAt || item.updatedAt || row.updatedAt || row.createdAt)
  };
}

function readAuth(getAuthState) {
  const auth = typeof getAuthState === "function" ? (getAuthState() || {}) : {};
  return {
    user: auth.user || null,
    profile: auth.profile || auth.userProfile || null,
    roleSwitchRoles: Array.isArray(auth.roleSwitchRoles) ? auth.roleSwitchRoles : []
  };
}

export function createHeartAdsAdapter({
  getAuthState = () => ({})
} = {}) {
  const isHiddenLegacyCeoEmail = (email = "") => HIDDEN_LEGACY_CEO_EMAILS.includes(normalizeEmailValue(email));
  const getAuthAccessState = () => {
    const auth = readAuth(getAuthState);
    return {
      user: auth.user,
      userProfile: auth.profile,
      roleSwitchRoles: auth.roleSwitchRoles
    };
  };
  const isCeoUser = () => isCeoUserCore(getAuthAccessState(), { normalizeRoleListFn: normalizeRoleList });
  const isAlbertCeoUser = () => isAlbertCeoUserCore(getAuthAccessState(), {
    normalizeEmailValueFn: normalizeEmailValue,
    isHiddenLegacyCeoEmailFn: isHiddenLegacyCeoEmail,
    normalizeHandleFn: normalizeHandleValue,
    albertCeoAliases: ALBERT_CEO_ALIASES,
    albertCeoEmails: ALBERT_CEO_EMAILS
  });
  const hasGlobalCeoAccess = () => {
    const auth = readAuth(getAuthState);
    return hasGlobalCeoAccessCore(auth.profile || {}, auth.user || {}, {
      albertCeoUid: ALBERT_CEO_UID,
      isAlbertCeoUserFn: isAlbertCeoUser
    });
  };
  const getCurrentCeoMeta = () => {
    const auth = readAuth(getAuthState);
    return getCurrentCeoMetaCore(auth.profile || {}, auth.user || {}, {
      normalizeCeoPathFn: (value, fallback = []) => normalizeCeoPathCore(value, fallback, {
        uniqueStringListFn: uniqueStringListCore
      }),
      hasGlobalCeoAccessFn: hasGlobalCeoAccess,
      uniqueStringListFn: uniqueStringListCore
    });
  };

  async function loadRestaurantRows() {
    if (!isCeoUser() && !hasGlobalCeoAccess()) return [];
    const current = getCurrentCeoMeta();
    const uid = asText(current.uid);
    if (!uid) return [];
    const restaurantsRef = collection(db, "restaurants");
    const queries = hasGlobalCeoAccess()
      ? [query(restaurantsRef, limit(HEART_ADS_READ_LIMIT))]
      : [
        query(restaurantsRef, where("createdByUid", "==", uid), limit(HEART_ADS_READ_LIMIT)),
        query(restaurantsRef, where("ceoPath", "array-contains", uid), limit(HEART_ADS_READ_LIMIT))
      ];
    const snaps = await Promise.all(queries.map((entry) => getDocs(entry).catch(() => null)));
    const rows = new Map();
    snaps.forEach((snap) => {
      snap?.forEach?.((docSnap) => {
        rows.set(docSnap.id, { id: docSnap.id, ...(docSnap.data?.() || {}) });
      });
    });
    return Array.from(rows.values()).filter(isRestaurantLike);
  }

  async function loadAds() {
    const rows = await loadRestaurantRows();
    const adGroups = await Promise.all(rows.map(async (row) => {
      const restaurantId = asText(row.id || row.restaurantId || "");
      if (!restaurantId) return [];
      try {
        const snap = await getDoc(doc(db, "restaurants", restaurantId, "public", "offers"));
        if (!snap.exists()) return [];
        const data = snap.data() || {};
        const items = Array.isArray(data.items) ? data.items : [];
        return items
          .filter(isRestaurantAdItem)
          .map((item, index) => normalizeAdItem(row, item, index))
          .filter((item) => item.id && item.restaurantId);
      } catch {
        return [];
      }
    }));
    return adGroups
      .flat()
      .sort((left, right) => (right.createdAtMs || right.updatedAtMs || 0) - (left.createdAtMs || left.updatedAtMs || 0));
  }

  async function reviewAd({ restaurantId = "", adId = "", status = "approved" } = {}) {
    const safeRestaurantId = asText(restaurantId);
    const safeAdId = asText(adId);
    const nextStatus = normalizeReviewStatus(status);
    if (!safeRestaurantId || !safeAdId) throw new Error("Ad-Auswahl fehlt.");
    if (!["approved", "rejected", "pending"].includes(nextStatus)) throw new Error("Ungueltiger Review-Status.");
    const current = getCurrentCeoMeta();
    const reviewedAt = new Date().toISOString();
    const offersRef = doc(db, "restaurants", safeRestaurantId, "public", "offers");
    const snap = await getDoc(offersRef);
    if (!snap.exists()) throw new Error("Offers-Dokument nicht gefunden.");
    const data = snap.data() || {};
    const items = Array.isArray(data.items) ? data.items : [];
    let changed = false;
    const nextItems = items.map((item, index) => {
      const itemId = asText(item?.id || item?.offerId || item?._id || `ad_${index}`);
      if (itemId !== safeAdId) return item;
      changed = true;
      return {
        ...(item || {}),
        id: itemId,
        isRestaurantAd: true,
        adType: "restaurant_ad",
        reviewStatus: nextStatus,
        approvalStatus: nextStatus,
        reviewedAt,
        reviewedByUid: asText(current.uid),
        reviewedByName: asText(current.name),
        active: item?.active !== false
      };
    });
    if (!changed) throw new Error("Ad nicht gefunden.");
    await setDoc(offersRef, {
      items: nextItems,
      truthSource: "public-menu",
      truthState: nextItems.length ? "seeded" : "knownEmpty",
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { ok: true };
  }

  return Object.freeze({
    loadAds,
    reviewAd
  });
}
