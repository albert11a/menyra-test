import { db } from "/shared/firebase-config.js";
import {
  doc,
  getDoc
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";

export const DESTINATION_PUBLIC_LOADER_VERSION = "destination-public-loader.v1";

const DESTINATIONS_PUBLIC_COLLECTION = "destinationsPublic";
const STORAGE_KEY_PREFIX = "menyra_social_destination_public_cache_v1::";
const STORAGE_TTL_MS = 6 * 60 * 60 * 1000;

const memoryCache = new Map();
const pendingLoads = new Map();

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

function normalizePublicDestination(destinationId = "", raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const places = Array.isArray(source.places) ? source.places : [];
  if (!places.length) return null;
  return {
    id: asText(destinationId),
    name: asText(source.name),
    slug: asText(source.slug),
    description: asText(source.description),
    version: Math.max(0, Number(source.version) || 0),
    places
  };
}

function readStorageCache(destinationId = "") {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${destinationId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (Date.now() - Number(parsed.storedAt || 0) > STORAGE_TTL_MS) return null;
    return normalizePublicDestination(destinationId, parsed.data);
  } catch {
    return null;
  }
}

function writeStorageCache(destinationId = "", data = null) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${destinationId}`, JSON.stringify({
      storedAt: Date.now(),
      data
    }));
  } catch {}
}

// Cache-Lesezugriff ohne Netz: fuer sofortiges (synchrones) Rendern bei
// Wiederbesuchen; null bedeutet nur "nicht im Cache", nicht "existiert nicht".
export function peekPublishedDestinationCore(destinationId = "") {
  const safeId = asText(destinationId);
  if (!safeId) return null;
  if (memoryCache.has(safeId)) return memoryCache.get(safeId);
  const stored = readStorageCache(safeId);
  if (stored) memoryCache.set(safeId, stored);
  return stored;
}

export async function loadPublishedDestinationCore(destinationId = "") {
  const safeId = asText(destinationId);
  if (!safeId) return null;
  const cached = peekPublishedDestinationCore(safeId);
  if (cached) return cached;
  if (pendingLoads.has(safeId)) return pendingLoads.get(safeId);
  const load = (async () => {
    try {
      const snap = await getDoc(doc(db, DESTINATIONS_PUBLIC_COLLECTION, safeId));
      const normalized = snap.exists() ? normalizePublicDestination(safeId, snap.data() || {}) : null;
      memoryCache.set(safeId, normalized);
      if (normalized) writeStorageCache(safeId, snap.data() || {});
      return normalized;
    } catch {
      return null;
    } finally {
      pendingLoads.delete(safeId);
    }
  })();
  pendingLoads.set(safeId, load);
  return load;
}
