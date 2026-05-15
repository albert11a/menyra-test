import {
  db
} from "/shared/firebase-config.js";
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  query,
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
  normalizeSearchKeyCore as normalizeSearchKey
} from "../menyra-social/core/common/text-normalize-utils.js";
import {
  parseCoordNumberCore,
  uniqueStringListCore,
  normalizeCeoCountryCore,
  normalizeCeoPathCore,
  buildCeoNameCore
} from "../menyra-social/core/crm/ceo-normalize-utils.js";
import {
  getCurrentCeoMetaCore
} from "../menyra-social/core/crm/ceo-meta-utils.js";
import {
  normalizeCeoStaffRecordCore,
  overlayCeoStaffProfileCore,
  createEmptyCeoCrmCountsCore,
  sanitizeCeoCrmCountsCore,
  hasStoredCeoCrmCountsCore
} from "../menyra-social/core/crm/ceo-staff-sync-utils.js";
import {
  loadCrmLeadsCore,
  loadCrmCustomersCore,
  loadCrmCeoStaffCore,
  loadCrmBusinessAccountsCore,
  normalizeCrmBusinessAccountEntryCore
} from "../menyra-social/core/crm/crm-admin-read-loader-core.js";
import {
  normalizeLeadScopeKeyCore,
  normalizeCustomerScopeKeyCore
} from "../menyra-social/core/crm/crm-scope-state-utils.js";
import {
  createLeadLocationCore,
  normalizeLeadLocationsCore,
  getPrimaryLeadLocationCore
} from "../menyra-social/core/leads/lead-location-utils.js";
import {
  normalizeLeadStatusKeyCore,
  resolveCustomerTypeCore,
  isCustomerRestaurantCore
} from "../menyra-social/core/leads/lead-taxonomy-utils.js";
import {
  normalizeLeadTypeKeyCore
} from "../menyra-social/core/leads/lead-type-utils.js";
import {
  normalizeRestaurantTypeCore
} from "../menyra-social/core/profile/restaurant-type-utils.js";

export const HEART_CRM_ADMIN_READ_LOADERS_VERSION = "heart-crm-admin-read-loaders.v1";

const HEART_CRM_READ_PAGE_SIZE = 20;

function asText(value = "") {
  return String(value || "").trim();
}

function toDateSafe(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") {
    try {
      return value.toDate();
    } catch {}
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasLeadLocationCoords(value = {}) {
  return Number.isFinite(Number(value?.lat)) && Number.isFinite(Number(value?.lng));
}

function resolveCoordsFromEntity(entity = {}) {
  const lat = Number(entity?.gpsLat ?? entity?.lat ?? entity?.latitude ?? entity?.coords?.lat ?? entity?.coords?.latitude);
  const lng = Number(entity?.gpsLng ?? entity?.lng ?? entity?.lon ?? entity?.longitude ?? entity?.coords?.lng ?? entity?.coords?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function normalizeLeadLocations(locations, fallbackAddress = "", fallbackCoords = null) {
  return normalizeLeadLocationsCore(locations, fallbackAddress, fallbackCoords, {
    resolveCoordsFromEntityFn: resolveCoordsFromEntity,
    createLeadLocationFn: createLeadLocationCore,
    hasLeadLocationCoordsFn: hasLeadLocationCoords
  });
}

function getPrimaryLeadLocation(locations) {
  return getPrimaryLeadLocationCore(locations, {
    normalizeLeadLocationsFn: normalizeLeadLocations,
    hasLeadLocationCoordsFn: hasLeadLocationCoords,
    createLeadLocationFn: createLeadLocationCore
  });
}

function normalizeCeoPath(value, fallback = []) {
  return normalizeCeoPathCore(value, fallback, {
    uniqueStringListFn: uniqueStringListCore
  });
}

function normalizeLeadStatusKey(value = "") {
  return normalizeLeadStatusKeyCore(value);
}

function normalizeLeadTypeKey(value = "") {
  return normalizeLeadTypeKeyCore(value);
}

function resolveCustomerType(value = "") {
  return resolveCustomerTypeCore(value, {
    normalizeLeadTypeKeyFn: normalizeLeadTypeKey
  });
}

function isCustomerRestaurant(rest = {}) {
  return isCustomerRestaurantCore(rest, {
    normalizeLeadStatusKeyFn: normalizeLeadStatusKey
  });
}

function normalizeRestaurantType(value = "") {
  return normalizeRestaurantTypeCore(value, {
    normalizeLeadTypeKeyFn: normalizeLeadTypeKey
  });
}

function buildLeadSearchKey(lead = {}) {
  const locationText = Array.isArray(lead.locations)
    ? lead.locations.map((item) => item?.address || item?.city || "").join(" ")
    : "";
  return normalizeSearchKey([
    lead.businessName,
    lead.restaurantName,
    lead.name,
    lead.contactName,
    lead.phone,
    lead.email,
    lead.socialEmail,
    lead.instagram,
    lead.city,
    lead.address,
    lead.publicSlug,
    lead.landingSlug,
    lead.canonicalPublicPath,
    lead.status,
    lead.customerType,
    locationText
  ].filter(Boolean).join(" "));
}

function withLeadSearchKey(lead = {}) {
  return {
    ...lead,
    _searchKey: buildLeadSearchKey(lead)
  };
}

function normalizeLeadDoc(docSnap = {}) {
  const data = docSnap && typeof docSnap === "object" ? docSnap : {};
  const status = normalizeLeadStatusKey(data.status || "registered") || "registered";
  const safeLeadId = asText(data.id);
  const safeRestaurantId = asText(data.restaurantId || data.restaurant);
  const fallbackCoords = resolveCoordsFromEntity(data);
  const locations = normalizeLeadLocations(data.locations || [], data.address || "", fallbackCoords);
  const primary = getPrimaryLeadLocation(locations);
  const safeLandingSlug = asText(data.publicSlug || data.landingSlug);
  return withLeadSearchKey({
    id: safeLeadId,
    businessName: data.businessName || data.name || "",
    restaurantName: data.restaurantName || data.name || data.businessName || "",
    name: data.name || data.businessName || data.restaurantName || "",
    customerType: resolveCustomerType(data.customerType || data.type || "cafe"),
    contactName: data.contactName || data.contact || "",
    phone: data.phone || "",
    email: data.email || "",
    instagram: data.instagram || data.insta || "",
    city: data.city || "",
    address: locations[0]?.address || data.address || "",
    lat: hasLeadLocationCoords(primary) ? primary.lat : (fallbackCoords?.lat ?? null),
    lng: hasLeadLocationCoords(primary) ? primary.lng : (fallbackCoords?.lng ?? null),
    gpsLat: Number.isFinite(Number(fallbackCoords?.lat)) ? Number(fallbackCoords.lat) : null,
    gpsLng: Number.isFinite(Number(fallbackCoords?.lng)) ? Number(fallbackCoords.lng) : null,
    locations,
    logoUrl: data.logoUrl || data.logo || data.imageUrl || "",
    bestSpotLogoUrl: data.bestSpotLogoUrl || data.spotLogoUrl || "",
    spotLogoUrl: data.bestSpotLogoUrl || data.spotLogoUrl || "",
    specialEnabled: data.specialEnabled === true,
    note: data.note || "",
    status,
    restaurantId: safeRestaurantId,
    publicSlug: safeLandingSlug,
    canonicalPublicPath: asText(data.canonicalPublicPath || (safeLandingSlug ? `/${encodeURIComponent(safeLandingSlug)}` : "")),
    landingEnabled: data.landingEnabled !== false,
    landingTemplate: data.landingTemplate || "",
    landingRestaurantId: asText(data.landingRestaurantId || safeRestaurantId),
    landingSlug: safeLandingSlug,
    landingPageUrl: data.landingPageUrl || "",
    socialUid: data.socialUid || "",
    socialEmail: data.socialEmail || "",
    createdByUid: data.createdByUid || "",
    createdByRole: data.createdByRole || "",
    createdByName: data.createdByName || "",
    createdByHandle: data.createdByHandle || "",
    ceoRootUid: data.ceoRootUid || "",
    ceoRootName: data.ceoRootName || "",
    ceoParentUid: data.ceoParentUid || "",
    ceoPath: normalizeCeoPath(data.ceoPath),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  });
}

function normalizeLeadFromRestaurant(rest = {}) {
  if (!rest?.id) return null;
  const status = normalizeLeadStatusKey(rest.status || "registered") || "registered";
  const safeRestaurantId = asText(rest.id);
  const safeLeadId = asText(rest.leadId || rest.id);
  const safeLandingSlug = asText(rest.publicSlug || rest.landingSlug);
  const fallbackCoords = resolveCoordsFromEntity(rest);
  const locations = normalizeLeadLocations(rest.locations || [], rest.address || "", fallbackCoords);
  const primary = getPrimaryLeadLocation(locations);
  return withLeadSearchKey({
    id: safeLeadId,
    businessName: rest.name || rest.restaurantName || "",
    restaurantName: rest.restaurantName || rest.name || "",
    name: rest.name || rest.restaurantName || "",
    customerType: resolveCustomerType(rest.type || rest.customerType || "cafe"),
    contactName: rest.ownerName || "",
    phone: rest.phone || "",
    email: rest.ownerEmail || "",
    instagram: rest.instagram || rest.insta || "",
    city: rest.city || "",
    address: locations[0]?.address || rest.address || "",
    logoUrl: rest.logoUrl || rest.logo || "",
    bestSpotLogoUrl: rest.bestSpotLogoUrl || rest.spotLogoUrl || "",
    spotLogoUrl: rest.bestSpotLogoUrl || rest.spotLogoUrl || "",
    specialEnabled: rest.specialEnabled === true,
    note: "",
    status,
    restaurantId: safeRestaurantId,
    publicSlug: safeLandingSlug,
    canonicalPublicPath: asText(rest.canonicalPublicPath || (safeLandingSlug ? `/${encodeURIComponent(safeLandingSlug)}` : "")),
    landingEnabled: true,
    landingTemplate: rest.landingTemplate || "",
    landingRestaurantId: safeRestaurantId,
    landingSlug: safeLandingSlug,
    landingPageUrl: rest.landingPageUrl || "",
    socialUid: rest.ownerUid || "",
    socialEmail: rest.ownerEmail || "",
    createdByUid: rest.createdByUid || "",
    createdByRole: rest.createdByRole || "",
    createdByName: rest.createdByName || "",
    createdByHandle: rest.createdByHandle || "",
    ceoRootUid: rest.ceoRootUid || "",
    ceoRootName: rest.ceoRootName || "",
    ceoParentUid: rest.ceoParentUid || "",
    ceoPath: normalizeCeoPath(rest.ceoPath),
    createdAt: rest.createdAt,
    updatedAt: rest.updatedAt,
    lat: hasLeadLocationCoords(primary) ? primary.lat : (fallbackCoords?.lat ?? null),
    lng: hasLeadLocationCoords(primary) ? primary.lng : (fallbackCoords?.lng ?? null),
    gpsLat: Number.isFinite(Number(fallbackCoords?.lat)) ? Number(fallbackCoords.lat) : null,
    gpsLng: Number.isFinite(Number(fallbackCoords?.lng)) ? Number(fallbackCoords.lng) : null,
    locations
  });
}

function isRestaurantLeadCandidate(rest = {}) {
  const typeKey = normalizeRestaurantType(rest?.type || rest?.customerType || rest?.category || rest?.kind || rest?.restaurantType || "");
  const hasLinkedOwner = !!asText(rest?.ownerUid || rest?.socialUid || rest?.uid || rest?.userUid);
  const statusKey = normalizeLeadStatusKey(rest.status || "");
  if (typeKey === "ecommerce" && hasLinkedOwner && (!statusKey || ["registered", "contacted"].includes(statusKey))) return false;
  if (statusKey === "kunde") return false;
  if (["registered", "contacted", "testphase", "no_interest"].includes(statusKey)) return true;
  if (rest.leadId) return true;
  const noOwner = !rest.ownerUid && !rest.ownerEmail;
  if (!statusKey && noOwner) return true;
  return false;
}

function chunkStringList(values = [], size = 10) {
  const list = uniqueStringListCore(values);
  const out = [];
  for (let i = 0; i < list.length; i += size) {
    out.push(list.slice(i, i + size));
  }
  return out;
}

export function createHeartCrmAdminReadLoaderDeps({
  getAuthState,
  getSetupState
} = {}) {
  const readAuth = () => {
    const auth = typeof getAuthState === "function" ? (getAuthState() || {}) : {};
    const user = auth.user || null;
    const profile = auth.profile || null;
    return {
      user,
      profile,
      roleSwitchRoles: normalizeRoleList(profile?.roles || profile?.role || "")
    };
  };

  const getAuthAccessState = () => {
    const auth = readAuth();
    return {
      user: auth.user,
      userProfile: auth.profile,
      roleSwitchRoles: auth.roleSwitchRoles
    };
  };

  const isHiddenLegacyCeoEmail = (email = "") => HIDDEN_LEGACY_CEO_EMAILS.includes(normalizeEmailValue(email));
  const isCeoUser = () => isCeoUserCore(getAuthAccessState(), { normalizeRoleListFn: normalizeRoleList });
  const isAlbertCeoUser = () => isAlbertCeoUserCore(getAuthAccessState(), {
    normalizeEmailValueFn: normalizeEmailValue,
    isHiddenLegacyCeoEmailFn: isHiddenLegacyCeoEmail,
    normalizeHandleFn: normalizeHandleValue,
    albertCeoAliases: ALBERT_CEO_ALIASES,
    albertCeoEmails: ALBERT_CEO_EMAILS
  });
  const hasGlobalCeoAccess = () => {
    const auth = readAuth();
    return hasGlobalCeoAccessCore(auth.profile || {}, auth.user || {}, {
      albertCeoUid: ALBERT_CEO_UID,
      isAlbertCeoUserFn: isAlbertCeoUser
    });
  };
  const getCurrentCeoMeta = () => {
    const auth = readAuth();
    return getCurrentCeoMetaCore(auth.profile || {}, auth.user || {}, {
      normalizeCeoPathFn: normalizeCeoPath,
      hasGlobalCeoAccessFn: hasGlobalCeoAccess,
      uniqueStringListFn: uniqueStringListCore
    });
  };
  const getOwnerMeta = (row = {}) => {
    const creatorUid = asText(row.createdByUid || row.ownerUid || row.socialUid || row.uid);
    const creatorName = asText(row.createdByName || row.createdByHandle || row.ownerName);
    let ceoPath = normalizeCeoPath(row.ceoPath);
    if (!ceoPath.length && creatorUid) {
      ceoPath = normalizeCeoPath([], [
        row.ceoRootUid || row.rootCeoUid || "",
        row.ceoParentUid || row.parentCeoUid || "",
        creatorUid
      ]);
    }
    return { creatorUid, creatorName, ceoPath };
  };
  const canCurrentCeoSeeRow = (row = {}) => {
    if (!isCeoUser()) return true;
    const current = getCurrentCeoMeta();
    if (!current.uid) return true;
    if (hasGlobalCeoAccess()) return true;
    const meta = getOwnerMeta(row);
    if (meta.creatorUid && meta.creatorUid === current.uid) return true;
    if (meta.ceoPath.includes(current.uid)) return true;
    return false;
  };
  const isCurrentCeoOwnRow = (row = {}) => {
    if (!isCeoUser()) return true;
    const current = getCurrentCeoMeta();
    if (!current.uid) return true;
    const meta = getOwnerMeta(row);
    if (!meta.creatorUid && !meta.ceoPath.length) return true;
    return meta.creatorUid === current.uid;
  };
  const normalizeCeoCountry = (value = "") => normalizeCeoCountryCore(value);
  const normalizeCeoStaffRecord = (record = {}, userRecord = {}) => normalizeCeoStaffRecordCore(record, userRecord, {
    buildCeoNameFn: buildCeoNameCore,
    normalizeCeoPathFn: normalizeCeoPath,
    normalizeHandleFn: normalizeHandleValue,
    normalizeCeoCountryFn: normalizeCeoCountry,
    hasStoredCeoCrmCountsFn: hasStoredCeoCrmCountsCore,
    sanitizeCeoCrmCountsFn: sanitizeCeoCrmCountsCore,
    parseCoordNumberFn: parseCoordNumberCore
  });
  const canViewCeoRecord = (record = {}) => {
    const current = getCurrentCeoMeta();
    if (!current.uid) return false;
    if (asText(record.uid) === current.uid) return true;
    const path = normalizeCeoPath(record.ceoPath, [record.ceoRootUid, record.ceoParentUid, record.uid]);
    if (path.includes(current.uid)) return true;
    if (hasGlobalCeoAccess() && !asText(record.ceoParentUid)) return true;
    return false;
  };
  const hydrateStaffRecordsFromUserProfiles = async (items = []) => {
    const list = Array.isArray(items) ? items.slice() : [];
    const uids = uniqueStringListCore(list.map((item) => asText(item?.uid)).filter(Boolean));
    if (!uids.length) return list;
    const userMap = new Map();
    const usersRef = collection(db, "users");
    await Promise.all(chunkStringList(uids, 10).map(async (chunk) => {
      if (!chunk.length) return;
      try {
        const snap = await getDocs(query(usersRef, where(documentId(), "in", chunk)));
        snap.forEach((docSnap) => {
          userMap.set(docSnap.id, docSnap.data() || {});
        });
        return;
      } catch {}
      await Promise.all(chunk.map(async (uid) => {
        try {
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) userMap.set(uid, snap.data() || {});
        } catch {}
      }));
    }));
    return list.map((item) => {
      const uid = asText(item?.uid);
      const userRecord = uid ? userMap.get(uid) : null;
      if (!userRecord) return item;
      return normalizeCeoStaffRecord(overlayCeoStaffProfileCore(item, userRecord, {
        parseCoordNumberFn: parseCoordNumberCore
      }));
    });
  };

  return Object.freeze({
    version: HEART_CRM_ADMIN_READ_LOADERS_VERSION,
    async loadLeads(options = {}) {
      if (!isCeoUser() && !hasGlobalCeoAccess()) {
        return { items: [], rows: [], hasMore: false, knownCount: 0, countExact: true, missingContext: "CEO access" };
      }
      return loadCrmLeadsCore({
        db,
        collectionFn: collection,
        queryFn: query,
        whereFn: where,
        limitFn: limit,
        getDocsFn: getDocs,
        scope: options.scope || "own",
        desiredCount: options.limit || HEART_CRM_READ_PAGE_SIZE,
        pageSize: HEART_CRM_READ_PAGE_SIZE,
        getCurrentCeoMetaFn: getCurrentCeoMeta,
        normalizeLeadScopeKeyFn: normalizeLeadScopeKeyCore,
        normalizeLeadDocFn: normalizeLeadDoc,
        normalizeLeadFromRestaurantFn: normalizeLeadFromRestaurant,
        isRestaurantLeadCandidateFn: isRestaurantLeadCandidate,
        canCurrentCeoSeeRowFn: canCurrentCeoSeeRow,
        isCurrentCeoOwnRowFn: isCurrentCeoOwnRow,
        normalizeLeadStatusKeyFn: normalizeLeadStatusKey,
        hasGlobalCeoAccessFn: hasGlobalCeoAccess,
        toDateSafeFn: toDateSafe
      });
    },
    async loadCustomers(options = {}) {
      if (!isCeoUser() && !hasGlobalCeoAccess()) {
        return { items: [], rows: [], hasMore: false, knownCount: 0, countExact: true, missingContext: "CEO access" };
      }
      return loadCrmCustomersCore({
        db,
        collectionFn: collection,
        queryFn: query,
        whereFn: where,
        limitFn: limit,
        getDocsFn: getDocs,
        scope: options.scope || "own",
        desiredCount: options.limit || HEART_CRM_READ_PAGE_SIZE,
        pageSize: HEART_CRM_READ_PAGE_SIZE,
        getCurrentCeoMetaFn: getCurrentCeoMeta,
        normalizeCustomerScopeKeyFn: normalizeCustomerScopeKeyCore,
        isCustomerRestaurantFn: isCustomerRestaurant,
        canCurrentCeoSeeRowFn: canCurrentCeoSeeRow,
        isCurrentCeoOwnRowFn: isCurrentCeoOwnRow,
        hasGlobalCeoAccessFn: hasGlobalCeoAccess,
        toDateSafeFn: toDateSafe
      });
    },
    async loadCeoStaff(options = {}) {
      if (!isCeoUser() && !hasGlobalCeoAccess()) {
        return { items: [], rows: [], hasMore: false, missingContext: "CEO access" };
      }
      return loadCrmCeoStaffCore({
        db,
        collectionFn: collection,
        queryFn: query,
        whereFn: where,
        limitFn: limit,
        getDocsFn: getDocs,
        grow: false,
        currentPageSize: options.limit || HEART_CRM_READ_PAGE_SIZE,
        pageSize: HEART_CRM_READ_PAGE_SIZE,
        getCurrentCeoMetaFn: getCurrentCeoMeta,
        hasGlobalCeoAccessFn: hasGlobalCeoAccess,
        normalizeCeoStaffRecordFn: normalizeCeoStaffRecord,
        canViewCeoRecordFn: canViewCeoRecord,
        hydrateStaffRecordsFromUserProfilesFn: hydrateStaffRecordsFromUserProfiles,
        isHiddenLegacyCeoEmailFn: isHiddenLegacyCeoEmail,
        uniqueStringListFn: uniqueStringListCore,
        toDateSafeFn: toDateSafe,
        syncDirectory: false
      });
    },
    async loadBusinessAccounts(options = {}) {
      const setup = typeof getSetupState === "function" ? (getSetupState() || {}) : {};
      const auth = readAuth();
      const restaurantId = asText(
        options.restaurantId
        || auth.profile?.restaurantId
        || auth.profile?.staffRestaurantId
        || setup.data?.restaurantId
        || setup.restaurantId
      );
      if (!restaurantId) {
        return {
          items: [],
          rows: [],
          hasMore: false,
          knownCount: 0,
          countExact: true,
          missingContext: "restaurantId"
        };
      }
      return loadCrmBusinessAccountsCore({
        db,
        collectionFn: collection,
        getDocsFn: getDocs,
        restaurantId,
        normalizeBusinessAccountEntryFn: normalizeCrmBusinessAccountEntryCore
      });
    },
    contract: Object.freeze({
      readOnly: true,
      writesExposed: false,
      createEmptyCeoCrmCounts: createEmptyCeoCrmCountsCore
    })
  });
}
