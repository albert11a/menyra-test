const OLC_ALPHABET = "23456789CFGHJMPQRVWX";
const OLC_SEPARATOR = "+";
const OLC_SEPARATOR_POSITION = 8;
const OLC_PAIR_RESOLUTIONS = [20, 1, 0.05, 0.0025, 0.000125];
const OLC_GRID_ROWS = 5;
const OLC_GRID_COLUMNS = 4;
const plusCodeSearchCache = new Map();

export function olcNormalizeLongitudeCore(value) {
  let lng = Number(value);
  if (!Number.isFinite(lng)) return null;
  while (lng < -180) lng += 360;
  while (lng >= 180) lng -= 360;
  return lng;
}

export function olcClipLatitudeCore(value) {
  const lat = Number(value);
  if (!Number.isFinite(lat)) return null;
  return Math.min(90, Math.max(-90, lat));
}

export function sanitizePlusCodeCore(raw) {
  const text = String(raw || "").toUpperCase();
  return text
    .replace(/\s+/g, "")
    .replace(/[^23456789CFGHJMPQRVWX+0]/g, "");
}

export function extractPlusCodeFromTextCore(text, {
  sanitizePlusCodeFn
} = {}) {
  const sanitizePlusCode = typeof sanitizePlusCodeFn === "function"
    ? sanitizePlusCodeFn
    : sanitizePlusCodeCore;
  const input = String(text || "");
  if (!input.includes("+")) return null;
  const match = input.toUpperCase().match(/([23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{2,})/);
  if (!match?.[1]) return null;
  const code = sanitizePlusCode(match[1]);
  if (!code.includes(OLC_SEPARATOR)) return null;
  const remainder = input.replace(match[1], " ").replace(/\s+/g, " ").trim();
  return { code, remainder };
}

export function olcDecodeValueCore(ch) {
  const idx = OLC_ALPHABET.indexOf(String(ch || "").toUpperCase());
  return idx >= 0 ? idx : -1;
}

export function isLikelyFullPlusCodeCore(code, {
  sanitizePlusCodeFn
} = {}) {
  const sanitizePlusCode = typeof sanitizePlusCodeFn === "function"
    ? sanitizePlusCodeFn
    : sanitizePlusCodeCore;
  const clean = sanitizePlusCode(code);
  const sep = clean.indexOf(OLC_SEPARATOR);
  if (sep !== OLC_SEPARATOR_POSITION) return false;
  if (clean.indexOf(OLC_SEPARATOR, sep + 1) !== -1) return false;
  const withoutSep = clean.replace(OLC_SEPARATOR, "").replace(/0/g, "");
  if (withoutSep.length < 2) return false;
  return /^[23456789CFGHJMPQRVWX]+$/.test(withoutSep);
}

export function isLikelyShortPlusCodeCore(code, {
  sanitizePlusCodeFn
} = {}) {
  const sanitizePlusCode = typeof sanitizePlusCodeFn === "function"
    ? sanitizePlusCodeFn
    : sanitizePlusCodeCore;
  const clean = sanitizePlusCode(code);
  const sep = clean.indexOf(OLC_SEPARATOR);
  if (sep <= 0 || sep >= OLC_SEPARATOR_POSITION) return false;
  if (clean.indexOf(OLC_SEPARATOR, sep + 1) !== -1) return false;
  const withoutSep = clean.replace(OLC_SEPARATOR, "").replace(/0/g, "");
  if (withoutSep.length < 2) return false;
  return /^[23456789CFGHJMPQRVWX]+$/.test(withoutSep);
}

export function olcDecodeFullPlusCodeCore(code, {
  isLikelyFullPlusCodeFn,
  sanitizePlusCodeFn,
  olcDecodeValueFn,
  normalizeCoordPairFn
} = {}) {
  const isLikelyFullPlusCode = typeof isLikelyFullPlusCodeFn === "function"
    ? isLikelyFullPlusCodeFn
    : ((value) => isLikelyFullPlusCodeCore(value, { sanitizePlusCodeFn }));
  const sanitizePlusCode = typeof sanitizePlusCodeFn === "function"
    ? sanitizePlusCodeFn
    : sanitizePlusCodeCore;
  const olcDecodeValue = typeof olcDecodeValueFn === "function"
    ? olcDecodeValueFn
    : olcDecodeValueCore;
  const normalizeCoordPair = typeof normalizeCoordPairFn === "function"
    ? normalizeCoordPairFn
    : null;
  if (!isLikelyFullPlusCode(code)) return null;
  const clean = sanitizePlusCode(code);
  const digits = clean.replace(OLC_SEPARATOR, "").replace(/0/g, "");
  if (!digits.length) return null;

  const pairLength = Math.min(10, digits.length - (digits.length % 2));
  if (pairLength < 2) return null;

  let lat = -90;
  let lng = -180;
  let latPlace = 20;
  let lngPlace = 20;

  for (let i = 0; i < pairLength; i += 2) {
    const latVal = olcDecodeValue(digits[i]);
    const lngVal = olcDecodeValue(digits[i + 1]);
    if (latVal < 0 || lngVal < 0) return null;
    const place = OLC_PAIR_RESOLUTIONS[i / 2];
    lat += latVal * place;
    lng += lngVal * place;
    latPlace = place;
    lngPlace = place;
  }

  if (digits.length > pairLength) {
    latPlace = OLC_PAIR_RESOLUTIONS[OLC_PAIR_RESOLUTIONS.length - 1];
    lngPlace = OLC_PAIR_RESOLUTIONS[OLC_PAIR_RESOLUTIONS.length - 1];
    for (let i = pairLength; i < digits.length; i += 1) {
      const val = olcDecodeValue(digits[i]);
      if (val < 0) return null;
      const row = Math.floor(val / OLC_GRID_COLUMNS);
      const col = val % OLC_GRID_COLUMNS;
      latPlace /= OLC_GRID_ROWS;
      lngPlace /= OLC_GRID_COLUMNS;
      lat += row * latPlace;
      lng += col * lngPlace;
    }
  }

  if (typeof normalizeCoordPair === "function") {
    return normalizeCoordPair(lat + (latPlace / 2), lng + (lngPlace / 2));
  }
  return { lat: lat + (latPlace / 2), lng: lng + (lngPlace / 2) };
}

export function olcEncodePairPrefixCore(latValue, lngValue, prefixLength, {
  olcClipLatitudeFn,
  olcNormalizeLongitudeFn
} = {}) {
  const olcClipLatitude = typeof olcClipLatitudeFn === "function"
    ? olcClipLatitudeFn
    : olcClipLatitudeCore;
  const olcNormalizeLongitude = typeof olcNormalizeLongitudeFn === "function"
    ? olcNormalizeLongitudeFn
    : olcNormalizeLongitudeCore;
  const latClipped = olcClipLatitude(latValue);
  const lngNorm = olcNormalizeLongitude(lngValue);
  const length = Math.max(0, Number(prefixLength) || 0);
  if (latClipped === null || lngNorm === null || !length) return "";

  let lat = latClipped;
  let lng = lngNorm;
  if (lat === 90) lat = 90 - 1e-12;
  lat += 90;
  lng += 180;

  let out = "";
  for (let i = 0; i < OLC_PAIR_RESOLUTIONS.length && out.length < Math.max(length, OLC_SEPARATOR_POSITION); i += 1) {
    const place = OLC_PAIR_RESOLUTIONS[i];
    const latDigit = Math.floor(lat / place);
    const lngDigit = Math.floor(lng / place);
    lat -= latDigit * place;
    lng -= lngDigit * place;
    out += OLC_ALPHABET[Math.max(0, Math.min(OLC_ALPHABET.length - 1, latDigit))];
    out += OLC_ALPHABET[Math.max(0, Math.min(OLC_ALPHABET.length - 1, lngDigit))];
  }

  return out.slice(0, length);
}

export function olcRecoverShortCodeCore(shortCode, refLat, refLng, {
  isLikelyShortPlusCodeFn,
  sanitizePlusCodeFn,
  olcClipLatitudeFn,
  olcNormalizeLongitudeFn,
  olcEncodePairPrefixFn,
  olcDecodeFullPlusCodeFn,
  normalizeCoordPairFn
} = {}) {
  const isLikelyShortPlusCode = typeof isLikelyShortPlusCodeFn === "function"
    ? isLikelyShortPlusCodeFn
    : ((value) => isLikelyShortPlusCodeCore(value, { sanitizePlusCodeFn }));
  const sanitizePlusCode = typeof sanitizePlusCodeFn === "function"
    ? sanitizePlusCodeFn
    : sanitizePlusCodeCore;
  const olcClipLatitude = typeof olcClipLatitudeFn === "function"
    ? olcClipLatitudeFn
    : olcClipLatitudeCore;
  const olcNormalizeLongitude = typeof olcNormalizeLongitudeFn === "function"
    ? olcNormalizeLongitudeFn
    : olcNormalizeLongitudeCore;
  const olcEncodePairPrefix = typeof olcEncodePairPrefixFn === "function"
    ? olcEncodePairPrefixFn
    : ((lat, lng, length) => olcEncodePairPrefixCore(lat, lng, length, {
      olcClipLatitudeFn: olcClipLatitude,
      olcNormalizeLongitudeFn: olcNormalizeLongitude
    }));
  const olcDecodeFullPlusCode = typeof olcDecodeFullPlusCodeFn === "function"
    ? olcDecodeFullPlusCodeFn
    : ((value) => olcDecodeFullPlusCodeCore(value, {
      sanitizePlusCodeFn: sanitizePlusCode
    }));
  const normalizeCoordPair = typeof normalizeCoordPairFn === "function"
    ? normalizeCoordPairFn
    : null;
  if (!isLikelyShortPlusCode(shortCode)) return null;
  const clean = sanitizePlusCode(shortCode);
  const sep = clean.indexOf(OLC_SEPARATOR);
  if (sep <= 0 || sep >= OLC_SEPARATOR_POSITION) return null;

  const prefixLength = OLC_SEPARATOR_POSITION - sep;
  const refLatClipped = olcClipLatitude(refLat);
  const refLngNorm = olcNormalizeLongitude(refLng);
  if (refLatClipped === null || refLngNorm === null) return null;

  const prefix = olcEncodePairPrefix(refLatClipped, refLngNorm, prefixLength);
  if (!prefix || prefix.length !== prefixLength) return null;
  const fullCode = `${prefix}${clean}`;
  const decoded = olcDecodeFullPlusCode(fullCode);
  if (!decoded) return null;

  const resolution = Math.pow(20, 2 - (prefixLength / 2));
  const edge = resolution / 2;
  let lat = decoded.lat;
  let lng = decoded.lng;

  if (refLatClipped + edge < lat) lat -= resolution;
  else if (refLatClipped - edge > lat) lat += resolution;
  if (refLngNorm + edge < lng) lng -= resolution;
  else if (refLngNorm - edge > lng) lng += resolution;

  if (typeof normalizeCoordPair === "function") {
    return normalizeCoordPair(lat, lng);
  }
  return { lat, lng };
}

export function resolvePlusCodeReferenceCoordsCore(value = "", refCoords = null, {
  normalizeCoordPairFn,
  extractPlusCodeFromTextFn,
  inferLeadCountryFromTextFn,
  getLeadCountryCenterFn
} = {}) {
  const normalizeCoordPair = typeof normalizeCoordPairFn === "function"
    ? normalizeCoordPairFn
    : null;
  const extractPlusCodeFromText = typeof extractPlusCodeFromTextFn === "function"
    ? extractPlusCodeFromTextFn
    : extractPlusCodeFromTextCore;
  const inferLeadCountryFromText = typeof inferLeadCountryFromTextFn === "function"
    ? inferLeadCountryFromTextFn
    : (() => "");
  const getLeadCountryCenter = typeof getLeadCountryCenterFn === "function"
    ? getLeadCountryCenterFn
    : (() => null);
  const direct = normalizeCoordPair
    ? normalizeCoordPair(refCoords?.lat, refCoords?.lng)
    : null;
  if (direct) return direct;
  const extracted = extractPlusCodeFromText(value);
  const inferredCountry = inferLeadCountryFromText(
    `${String(value || "")} ${String(extracted?.remainder || "")}`,
    ""
  );
  return getLeadCountryCenter(inferredCountry);
}

export async function geocodeReferenceSearchCore(text = "", {
  normalizeSearchKeyFn,
  normalizeCoordPairFn,
  fetchFn,
  cache = plusCodeSearchCache
} = {}) {
  const normalizeSearchKey = typeof normalizeSearchKeyFn === "function"
    ? normalizeSearchKeyFn
    : ((value) => String(value || "").trim().toLowerCase());
  const normalizeCoordPair = typeof normalizeCoordPairFn === "function"
    ? normalizeCoordPairFn
    : null;
  const fetchClient = typeof fetchFn === "function"
    ? fetchFn
    : (typeof fetch === "function" ? fetch : null);
  const queryText = String(text || "").trim();
  if (!queryText || !fetchClient) return null;
  const cacheKey = normalizeSearchKey(queryText);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) || null;
  }
  try {
    const res = await fetchClient(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText)}&limit=1`);
    const data = await res.json();
    const coords = Array.isArray(data) && data[0]
      ? (normalizeCoordPair
        ? normalizeCoordPair(data[0].lat, data[0].lon)
        : { lat: Number(data[0].lat), lng: Number(data[0].lon) })
      : null;
    cache.set(cacheKey, coords || null);
    return coords;
  } catch {
    cache.set(cacheKey, null);
    return null;
  }
}

export function parsePlusCodeFromAddressInputCore(value, refCoords = null, {
  extractPlusCodeFromTextFn,
  isLikelyFullPlusCodeFn,
  olcDecodeFullPlusCodeFn,
  isLikelyShortPlusCodeFn,
  resolvePlusCodeReferenceCoordsFn,
  olcRecoverShortCodeFn
} = {}) {
  const extractPlusCodeFromText = typeof extractPlusCodeFromTextFn === "function"
    ? extractPlusCodeFromTextFn
    : extractPlusCodeFromTextCore;
  const isLikelyFullPlusCode = typeof isLikelyFullPlusCodeFn === "function"
    ? isLikelyFullPlusCodeFn
    : isLikelyFullPlusCodeCore;
  const olcDecodeFullPlusCode = typeof olcDecodeFullPlusCodeFn === "function"
    ? olcDecodeFullPlusCodeFn
    : olcDecodeFullPlusCodeCore;
  const isLikelyShortPlusCode = typeof isLikelyShortPlusCodeFn === "function"
    ? isLikelyShortPlusCodeFn
    : isLikelyShortPlusCodeCore;
  const resolvePlusCodeReferenceCoords = typeof resolvePlusCodeReferenceCoordsFn === "function"
    ? resolvePlusCodeReferenceCoordsFn
    : resolvePlusCodeReferenceCoordsCore;
  const olcRecoverShortCode = typeof olcRecoverShortCodeFn === "function"
    ? olcRecoverShortCodeFn
    : olcRecoverShortCodeCore;
  const extracted = extractPlusCodeFromText(value);
  if (!extracted?.code) return null;

  if (isLikelyFullPlusCode(extracted.code)) {
    return olcDecodeFullPlusCode(extracted.code);
  }

  if (isLikelyShortPlusCode(extracted.code)) {
    const ref = resolvePlusCodeReferenceCoords(value, refCoords);
    return olcRecoverShortCode(extracted.code, ref.lat, ref.lng);
  }

  return null;
}

export function parseCoordsFromAddressInputCore(value, refCoords = null, {
  parsePlusCodeFromAddressInputFn,
  toFiniteCoordNumberFn,
  normalizeCoordPairFn
} = {}) {
  const parsePlusCodeFromAddressInput = typeof parsePlusCodeFromAddressInputFn === "function"
    ? parsePlusCodeFromAddressInputFn
    : parsePlusCodeFromAddressInputCore;
  const toFiniteCoordNumber = typeof toFiniteCoordNumberFn === "function"
    ? toFiniteCoordNumberFn
    : (() => null);
  const normalizeCoordPair = typeof normalizeCoordPairFn === "function"
    ? normalizeCoordPairFn
    : null;
  const text = String(value || "").trim();
  if (!text) return null;
  const plusCodeCoords = parsePlusCodeFromAddressInput(text, refCoords);
  if (plusCodeCoords) return plusCodeCoords;
  const cleaned = text.replace(/[|;]/g, ",").replace(/\s+/g, " ").trim();
  const labeledPattern = /(lat(?:itude)?|lng|lon|long|longitude)\s*[:=]\s*(-?\d+(?:[.,]\d+)?)/gi;
  const labeledCoords = {};
  let labeledMatch = null;
  while ((labeledMatch = labeledPattern.exec(cleaned)) !== null) {
    const key = String(labeledMatch[1] || "").toLowerCase();
    const num = toFiniteCoordNumber(labeledMatch[2]);
    if (num === null) continue;
    if (key.startsWith("lat")) labeledCoords.lat = num;
    else labeledCoords.lng = num;
  }
  if (Number.isFinite(labeledCoords.lat) && Number.isFinite(labeledCoords.lng)) {
    return normalizeCoordPair
      ? normalizeCoordPair(labeledCoords.lat, labeledCoords.lng)
      : { lat: labeledCoords.lat, lng: labeledCoords.lng };
  }

  const pairMatch = cleaned.match(/^(-?\d+(?:[.,]\d+)?)\s*[, ]\s*(-?\d+(?:[.,]\d+)?)$/);
  if (!pairMatch) return null;
  const first = toFiniteCoordNumber(pairMatch[1]);
  const second = toFiniteCoordNumber(pairMatch[2]);
  if (first === null || second === null) return null;

  const kosovoLat = (next) => next >= 41 && next <= 44.5;
  const kosovoLng = (next) => next >= 19 && next <= 22.5;
  if (kosovoLng(first) && kosovoLat(second)) {
    return { lat: second, lng: first };
  }
  if (kosovoLat(first) && kosovoLng(second)) {
    return { lat: first, lng: second };
  }

  if (normalizeCoordPair) {
    return normalizeCoordPair(first, second);
  }
  return { lat: first, lng: second };
}

export async function parseCoordsFromAddressInputAsyncCore(value, refCoords = null, {
  parseCoordsFromAddressInputFn,
  extractPlusCodeFromTextFn,
  isLikelyShortPlusCodeFn,
  geocodeReferenceSearchFn,
  olcRecoverShortCodeFn
} = {}) {
  const parseCoordsFromAddressInput = typeof parseCoordsFromAddressInputFn === "function"
    ? parseCoordsFromAddressInputFn
    : parseCoordsFromAddressInputCore;
  const extractPlusCodeFromText = typeof extractPlusCodeFromTextFn === "function"
    ? extractPlusCodeFromTextFn
    : extractPlusCodeFromTextCore;
  const isLikelyShortPlusCode = typeof isLikelyShortPlusCodeFn === "function"
    ? isLikelyShortPlusCodeFn
    : isLikelyShortPlusCodeCore;
  const geocodeReferenceSearch = typeof geocodeReferenceSearchFn === "function"
    ? geocodeReferenceSearchFn
    : geocodeReferenceSearchCore;
  const olcRecoverShortCode = typeof olcRecoverShortCodeFn === "function"
    ? olcRecoverShortCodeFn
    : olcRecoverShortCodeCore;
  const direct = parseCoordsFromAddressInput(value, refCoords);
  const extracted = extractPlusCodeFromText(value);
  const remainder = String(extracted?.remainder || "").trim();
  if (!extracted?.code || !isLikelyShortPlusCode(extracted.code) || !remainder) {
    return direct;
  }
  const preciseRef = await geocodeReferenceSearch(remainder);
  if (!preciseRef) return direct;
  return olcRecoverShortCode(extracted.code, preciseRef.lat, preciseRef.lng) || direct;
}
