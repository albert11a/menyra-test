import { createCeoCrmCountRuntimeController } from "./ceo-crm-count-runtime-controller.js";
import {
  createLeadScopeMapCore,
  createCustomerScopeMapCore,
  normalizeLeadScopeKeyCore,
  normalizeCustomerScopeKeyCore
} from "./crm-scope-state-utils.js";
import {
  isCeoUserCore,
  isAlbertCeoUserCore,
  hasGlobalCeoAccessCore,
  getCeoGpsOverrideCore
} from "./ceo-access-utils.js";
import {
  parseCoordNumberCore as parseCoordNumber,
  uniqueStringListCore as uniqueStringList,
  normalizeCeoCountryCore,
  normalizeCeoPathCore,
  buildCeoNameCore as buildCeoName
} from "./ceo-normalize-utils.js";
import { getCurrentCeoMetaCore } from "./ceo-meta-utils.js";

export function createCrmCeoScopeSupportRuntime({
  state = null,
  dataLoaded = null,
  constants = {},
  firebaseApi = {},
  renderApi = {},
  storageApi = {},
  profileApi = {},
  leadApi = {},
  crmApi = {}
} = {}) {
  const normalizeRoleList = typeof profileApi.normalizeRoleListFn === "function" ? profileApi.normalizeRoleListFn : (() => []);
  const normalizeEmailValue = typeof profileApi.normalizeEmailValueFn === "function"
    ? profileApi.normalizeEmailValueFn
    : ((value = "") => String(value || "").trim().toLowerCase());
  const normalizeHandle = typeof profileApi.normalizeHandleFn === "function"
    ? profileApi.normalizeHandleFn
    : ((value = "") => String(value || "").trim().toLowerCase());
  const readCache = typeof storageApi.readCacheFn === "function" ? storageApi.readCacheFn : (() => null);
  const writeCache = typeof storageApi.writeCacheFn === "function" ? storageApi.writeCacheFn : (() => {});
  const leadPageCacheKey = typeof storageApi.leadPageCacheKeyFn === "function" ? storageApi.leadPageCacheKeyFn : (() => "");
  const customerPageCacheKey = typeof storageApi.customerPageCacheKeyFn === "function" ? storageApi.customerPageCacheKeyFn : (() => "");
  const saveUserProfileToStorage = typeof storageApi.saveUserProfileToStorageFn === "function"
    ? storageApi.saveUserProfileToStorageFn
    : (() => {});
  const render = typeof renderApi.renderFn === "function" ? renderApi.renderFn : (() => {});
  const toDateSafe = typeof renderApi.toDateSafeFn === "function" ? renderApi.toDateSafeFn : ((value) => value);
  const escapeHtml = typeof renderApi.escapeHtmlFn === "function" ? renderApi.escapeHtmlFn : ((value = "") => String(value || ""));
  const normalizeLeadStatusKey = typeof leadApi.normalizeLeadStatusKeyFn === "function"
    ? leadApi.normalizeLeadStatusKeyFn
    : ((value = "") => String(value || "").trim());
  const isCustomerRestaurant = typeof leadApi.isCustomerRestaurantFn === "function"
    ? leadApi.isCustomerRestaurantFn
    : (() => false);

  function createLeadScopeMap(factory = () => null) {
    return createLeadScopeMapCore(factory);
  }

  function createCustomerScopeMap(factory = () => null) {
    return createCustomerScopeMapCore(factory);
  }

  function normalizeLeadScopeKey(value) {
    return normalizeLeadScopeKeyCore(value);
  }

  function normalizeCustomerScopeKey(value) {
    return normalizeCustomerScopeKeyCore(value);
  }

  function normalizeCeoCountry(value) {
    return normalizeCeoCountryCore(value, {
      allowedCountries: constants.ceoCountries || []
    });
  }

  function normalizeCeoPath(value, fallback = []) {
    return normalizeCeoPathCore(value, fallback, {
      uniqueStringListFn: uniqueStringList
    });
  }

  function isCeoUser() {
    return isCeoUserCore(state, {
      normalizeRoleListFn: normalizeRoleList
    });
  }

  function isAlbertCeoUser() {
    return isAlbertCeoUserCore(state, {
      normalizeEmailValueFn: normalizeEmailValue,
      isHiddenLegacyCeoEmailFn: (...args) => crmApi.isHiddenLegacyCeoEmailFn?.(...args) || false,
      normalizeHandleFn: normalizeHandle,
      albertCeoAliases: constants.albertCeoAliases || [],
      albertCeoEmails: constants.albertCeoEmails || []
    });
  }

  function hasGlobalCeoAccess(profile = state?.userProfile, user = state?.user) {
    return hasGlobalCeoAccessCore(profile, user, {
      albertCeoUid: constants.albertCeoUid || "",
      isAlbertCeoUserFn: isAlbertCeoUser
    });
  }

  function getCeoGpsOverride(profile = state?.userProfile) {
    return getCeoGpsOverrideCore(profile, {
      isCeoUserFn: isCeoUser
    });
  }

  function getCurrentCeoMeta(profile = state?.userProfile, user = state?.user) {
    return getCurrentCeoMetaCore(profile, user, {
      normalizeCeoPathFn: normalizeCeoPath,
      hasGlobalCeoAccessFn: hasGlobalCeoAccess,
      uniqueStringListFn: uniqueStringList
    });
  }

  function readLeadScopeCache(uid, scope) {
    const safeUid = String(uid || "").trim();
    const safeScope = normalizeLeadScopeKey(scope);
    if (!safeUid) return null;
    return readCache(leadPageCacheKey(safeUid, safeScope), constants.crmPagesTtlMs);
  }

  function writeLeadScopeCache(uid, scope, rows, meta = {}) {
    const safeUid = String(uid || "").trim();
    const safeScope = normalizeLeadScopeKey(scope);
    if (!safeUid || !Array.isArray(rows)) return;
    writeCache(leadPageCacheKey(safeUid, safeScope), rows, meta);
  }

  function readCustomerScopeCache(uid, scope) {
    const safeUid = String(uid || "").trim();
    const safeScope = normalizeCustomerScopeKey(scope);
    if (!safeUid) return null;
    return readCache(customerPageCacheKey(safeUid, safeScope), constants.crmPagesTtlMs);
  }

  function writeCustomerScopeCache(uid, scope, rows, meta = {}) {
    const safeUid = String(uid || "").trim();
    const safeScope = normalizeCustomerScopeKey(scope);
    if (!safeUid || !Array.isArray(rows)) return;
    writeCache(customerPageCacheKey(safeUid, safeScope), rows, meta);
  }

  const ceoCrmCountRuntimeController = createCeoCrmCountRuntimeController({
    state,
    db: firebaseApi.db,
    collection: firebaseApi.collectionFn,
    query: firebaseApi.queryFn,
    where: firebaseApi.whereFn,
    getDocs: firebaseApi.getDocsFn,
    getDoc: firebaseApi.getDocFn,
    doc: firebaseApi.docFn,
    setDoc: firebaseApi.setDocFn,
    increment: firebaseApi.incrementFn,
    serverTimestamp: firebaseApi.serverTimestampFn,
    documentId: firebaseApi.documentIdFn,
    uniqueStringList,
    normalizeCeoPath,
    normalizeHandle,
    normalizeCeoCountry,
    buildCeoName,
    parseCoordNumber,
    getCurrentCeoMeta,
    isCeoUser,
    hasGlobalCeoAccess,
    saveUserProfileToStorage,
    render,
    toDateSafe,
    normalizeLeadDoc: (...args) => crmApi.normalizeLeadDocFn?.(...args) || (args[0] || {}),
    normalizeLeadStatusKey,
    isCustomerRestaurant,
    escapeHtml,
    dataLoaded,
    applyKnownLeadOwnershipOverrideFn: (...args) => crmApi.applyKnownLeadOwnershipOverrideFn?.(...args) || (args[0] || {}),
    isHiddenLegacyCeoEmailFn: (...args) => crmApi.isHiddenLegacyCeoEmailFn?.(...args) || false
  });

  return {
    createLeadScopeMap,
    createCustomerScopeMap,
    normalizeLeadScopeKey,
    normalizeCustomerScopeKey,
    uniqueStringList,
    normalizeCeoCountry,
    normalizeCeoPath,
    buildCeoName,
    getCurrentCeoMeta,
    isCeoUser,
    isAlbertCeoUser,
    hasGlobalCeoAccess,
    getCeoGpsOverride,
    readLeadScopeCache,
    writeLeadScopeCache,
    readCustomerScopeCache,
    writeCustomerScopeCache,
    ...ceoCrmCountRuntimeController
  };
}
