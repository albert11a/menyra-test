import {
  normalizeLeadCountryCore,
  buildLeadAccountEmailCore as buildLeadAccountEmail,
  inferLeadCountryFromTextCore
} from "../leads/lead-country-utils.js";
import {
  createDefaultLeadPricingCore,
  normalizeLeadPricingCore
} from "../leads/lead-pricing-utils.js";
import {
  normalizeLeadSettingsCore,
  getLeadSettingsConfigCore,
  getLeadCountryCenterCore,
  buildLeadContactNameCore as buildLeadContactName,
  getLeadMonthlyPriceCore,
  getLeadPriceForCycleCore
} from "../leads/lead-settings-utils.js";
import {
  normalizeLeadStatusKeyCore as normalizeLeadStatusKey,
  leadStatusLabelCore,
  customerStatusLabelCore,
  isCustomerRestaurantCore,
  leadTypeLabelCore,
  resolveCustomerTypeCore
} from "../leads/lead-taxonomy-utils.js";
import { normalizeLeadTypeKeyCore as normalizeLeadTypeKey } from "../leads/lead-type-utils.js";
import {
  hasLeadLocationCoordsCore as hasLeadLocationCoords,
  toFiniteCoordNumberCore as toFiniteCoordNumber,
  normalizeCoordPairCore,
  preferStableCoordsCore,
  resolveCoordsFromShapeCore,
  resolveCoordsFromEntityCore
} from "../map/geo-coord-utils.js";
import {
  olcNormalizeLongitudeCore as olcNormalizeLongitude,
  olcClipLatitudeCore as olcClipLatitude,
  sanitizePlusCodeCore as sanitizePlusCode,
  extractPlusCodeFromTextCore,
  olcDecodeValueCore as olcDecodeValue,
  isLikelyFullPlusCodeCore,
  isLikelyShortPlusCodeCore,
  olcDecodeFullPlusCodeCore,
  olcEncodePairPrefixCore,
  olcRecoverShortCodeCore,
  resolvePlusCodeReferenceCoordsCore,
  geocodeReferenceSearchCore,
  parsePlusCodeFromAddressInputCore,
  parseCoordsFromAddressInputCore,
  parseCoordsFromAddressInputAsyncCore
} from "../map/plus-code-utils.js";
import {
  createLeadLocationCore as createLeadLocation,
  normalizeLeadLocationsCore,
  getPrimaryLeadLocationCore
} from "../leads/lead-location-utils.js";

export function createCrmLeadGeoSupportRuntime({
  state = null,
  constants = {},
  utilityApi = {}
} = {}) {
  const normalizeSearchKey = typeof utilityApi.normalizeSearchKeyFn === "function"
    ? utilityApi.normalizeSearchKeyFn
    : ((value = "") => String(value || "").trim().toLowerCase());
  const fetchFn = typeof utilityApi.fetchFn === "function" ? utilityApi.fetchFn : null;

  function normalizeLeadCountry(value) {
    return normalizeLeadCountryCore(value, {
      allowedCountries: constants.ceoCountries || [],
      fallbackCountry: constants.defaultCountry || ""
    });
  }

  function createDefaultLeadPricing() {
    return createDefaultLeadPricingCore({
      leadTypeOrder: constants.leadTypeOrder || []
    });
  }

  function normalizeLeadPricing(raw = {}) {
    return normalizeLeadPricingCore(raw, {
      leadTypeOrder: constants.leadTypeOrder || []
    });
  }

  function normalizeLeadSettings(raw = {}) {
    return normalizeLeadSettingsCore(raw, {
      defaultPassword: constants.defaultPassword || "",
      defaultCountry: constants.defaultCountry || "",
      normalizeLeadCountryFn: normalizeLeadCountry,
      normalizeLeadPricingFn: normalizeLeadPricing
    });
  }

  function getLeadSettingsConfig() {
    return getLeadSettingsConfigCore(state?.userProfile, {
      normalizeLeadSettingsFn: normalizeLeadSettings
    });
  }

  function getLeadCountryCenter(country = constants.defaultCountry || "") {
    return getLeadCountryCenterCore(country, {
      normalizeLeadCountryFn: normalizeLeadCountry,
      countryCenters: constants.countryCenters || {},
      defaultCountry: constants.defaultCountry || "",
      defaultCenter: constants.defaultCenter || null
    });
  }

  function resolveCustomerType(value) {
    return resolveCustomerTypeCore(value, {
      normalizeLeadTypeKeyFn: normalizeLeadTypeKey
    });
  }

  function getLeadMonthlyPrice(type = "", config = getLeadSettingsConfig()) {
    return getLeadMonthlyPriceCore(type, config, {
      normalizeLeadPricingFn: normalizeLeadPricing,
      resolveCustomerTypeFn: resolveCustomerType
    });
  }

  function getLeadPriceForCycle(type = "", cycle = "monthly", config = getLeadSettingsConfig()) {
    return getLeadPriceForCycleCore(type, cycle, config, {
      getLeadMonthlyPriceFn: getLeadMonthlyPrice
    });
  }

  function inferLeadCountryFromText(text = "", fallbackCountry = "") {
    return inferLeadCountryFromTextCore(text, fallbackCountry || getLeadSettingsConfig().defaultCountry, {
      normalizeSearchKeyFn: normalizeSearchKey,
      normalizeLeadCountryFn: normalizeLeadCountry
    });
  }

  function leadStatusLabel(value) {
    return leadStatusLabelCore(value, {
      normalizeLeadStatusKeyFn: normalizeLeadStatusKey,
      leadStatusLabels: constants.leadStatusLabels || {}
    });
  }

  function leadTypeLabel(value) {
    return leadTypeLabelCore(value, {
      normalizeLeadTypeKeyFn: normalizeLeadTypeKey,
      leadTypeLabels: constants.leadTypeLabels || {}
    });
  }

  function customerStatusLabel(value) {
    return customerStatusLabelCore(value, {
      normalizeLeadStatusKeyFn: normalizeLeadStatusKey
    });
  }

  function isCustomerRestaurant(rest = {}) {
    return isCustomerRestaurantCore(rest, {
      normalizeLeadStatusKeyFn: normalizeLeadStatusKey
    });
  }

  function normalizeCoordPair(latValue, lngValue) {
    return normalizeCoordPairCore(latValue, lngValue, {
      toFiniteCoordNumberFn: toFiniteCoordNumber
    });
  }

  function preferStableCoords(candidate, reference) {
    return preferStableCoordsCore(candidate, reference, {
      normalizeCoordPairFn: normalizeCoordPair
    });
  }

  function resolveCoordsFromShape(shape) {
    return resolveCoordsFromShapeCore(shape, {
      normalizeCoordPairFn: normalizeCoordPair
    });
  }

  function resolveCoordsFromEntity(entity) {
    return resolveCoordsFromEntityCore(entity, {
      normalizeCoordPairFn: normalizeCoordPair,
      resolveCoordsFromShapeFn: resolveCoordsFromShape
    });
  }

  function extractPlusCodeFromText(text) {
    return extractPlusCodeFromTextCore(text, {
      sanitizePlusCodeFn: sanitizePlusCode
    });
  }

  function isLikelyFullPlusCode(code) {
    return isLikelyFullPlusCodeCore(code, {
      sanitizePlusCodeFn: sanitizePlusCode
    });
  }

  function isLikelyShortPlusCode(code) {
    return isLikelyShortPlusCodeCore(code, {
      sanitizePlusCodeFn: sanitizePlusCode
    });
  }

  function olcDecodeFullPlusCode(code) {
    return olcDecodeFullPlusCodeCore(code, {
      isLikelyFullPlusCodeFn: isLikelyFullPlusCode,
      sanitizePlusCodeFn: sanitizePlusCode,
      olcDecodeValueFn: olcDecodeValue,
      normalizeCoordPairFn: normalizeCoordPair
    });
  }

  function olcEncodePairPrefix(latValue, lngValue, prefixLength) {
    return olcEncodePairPrefixCore(latValue, lngValue, prefixLength, {
      olcClipLatitudeFn: olcClipLatitude,
      olcNormalizeLongitudeFn: olcNormalizeLongitude
    });
  }

  function olcRecoverShortCode(shortCode, refLat, refLng) {
    return olcRecoverShortCodeCore(shortCode, refLat, refLng, {
      isLikelyShortPlusCodeFn: isLikelyShortPlusCode,
      sanitizePlusCodeFn: sanitizePlusCode,
      olcClipLatitudeFn: olcClipLatitude,
      olcNormalizeLongitudeFn: olcNormalizeLongitude,
      olcEncodePairPrefixFn: olcEncodePairPrefix,
      olcDecodeFullPlusCodeFn: olcDecodeFullPlusCode,
      normalizeCoordPairFn: normalizeCoordPair
    });
  }

  function resolvePlusCodeReferenceCoords(value = "", refCoords = null) {
    return resolvePlusCodeReferenceCoordsCore(value, refCoords, {
      normalizeCoordPairFn: normalizeCoordPair,
      extractPlusCodeFromTextFn: extractPlusCodeFromText,
      inferLeadCountryFromTextFn: inferLeadCountryFromText,
      getLeadCountryCenterFn: getLeadCountryCenter
    });
  }

  async function geocodeReferenceSearch(text = "") {
    return geocodeReferenceSearchCore(text, {
      normalizeSearchKeyFn: normalizeSearchKey,
      normalizeCoordPairFn: normalizeCoordPair,
      fetchFn
    });
  }

  function parsePlusCodeFromAddressInput(value, refCoords = null) {
    return parsePlusCodeFromAddressInputCore(value, refCoords, {
      extractPlusCodeFromTextFn: extractPlusCodeFromText,
      isLikelyFullPlusCodeFn: isLikelyFullPlusCode,
      olcDecodeFullPlusCodeFn: olcDecodeFullPlusCode,
      isLikelyShortPlusCodeFn: isLikelyShortPlusCode,
      resolvePlusCodeReferenceCoordsFn: resolvePlusCodeReferenceCoords,
      olcRecoverShortCodeFn: olcRecoverShortCode
    });
  }

  async function parseCoordsFromAddressInputAsync(value, refCoords = null) {
    return parseCoordsFromAddressInputAsyncCore(value, refCoords, {
      parseCoordsFromAddressInputFn: parseCoordsFromAddressInput,
      extractPlusCodeFromTextFn: extractPlusCodeFromText,
      isLikelyShortPlusCodeFn: isLikelyShortPlusCode,
      geocodeReferenceSearchFn: geocodeReferenceSearch,
      olcRecoverShortCodeFn: olcRecoverShortCode
    });
  }

  function parseCoordsFromAddressInput(value, refCoords = null) {
    return parseCoordsFromAddressInputCore(value, refCoords, {
      parsePlusCodeFromAddressInputFn: parsePlusCodeFromAddressInput,
      toFiniteCoordNumberFn: toFiniteCoordNumber,
      normalizeCoordPairFn: normalizeCoordPair
    });
  }

  function normalizeLeadLocations(locations, fallbackAddress = "", fallbackCoords = null) {
    return normalizeLeadLocationsCore(locations, fallbackAddress, fallbackCoords, {
      resolveCoordsFromEntityFn: resolveCoordsFromEntity,
      createLeadLocationFn: createLeadLocation,
      hasLeadLocationCoordsFn: hasLeadLocationCoords
    });
  }

  function getPrimaryLeadLocation(locations) {
    return getPrimaryLeadLocationCore(locations, {
      normalizeLeadLocationsFn: normalizeLeadLocations,
      hasLeadLocationCoordsFn: hasLeadLocationCoords,
      createLeadLocationFn: createLeadLocation
    });
  }

  return {
    normalizeLeadCountry,
    createDefaultLeadPricing,
    normalizeLeadPricing,
    normalizeLeadSettings,
    getLeadSettingsConfig,
    getLeadCountryCenter,
    getLeadMonthlyPrice,
    getLeadPriceForCycle,
    buildLeadAccountEmail,
    buildLeadContactName,
    inferLeadCountryFromText,
    normalizeLeadStatusKey,
    leadStatusLabel,
    leadTypeLabel,
    resolveCustomerType,
    customerStatusLabel,
    isCustomerRestaurant,
    hasLeadLocationCoords,
    createLeadLocation,
    normalizeCoordPair,
    preferStableCoords,
    resolveCoordsFromShape,
    resolveCoordsFromEntity,
    extractPlusCodeFromText,
    isLikelyFullPlusCode,
    isLikelyShortPlusCode,
    olcDecodeFullPlusCode,
    olcEncodePairPrefix,
    olcRecoverShortCode,
    resolvePlusCodeReferenceCoords,
    geocodeReferenceSearch,
    parsePlusCodeFromAddressInput,
    parseCoordsFromAddressInputAsync,
    parseCoordsFromAddressInput,
    normalizeLeadLocations,
    getPrimaryLeadLocation
  };
}
