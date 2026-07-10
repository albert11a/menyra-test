import {
  auth,
  db
} from "/shared/firebase-config.js";
import {
  BUNNY_EDGE_BASE,
  MEDIA_TICKET_ENDPOINT
} from "/shared/bunny-edge.js";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import {
  buildDestinationPublicProjectionCore,
  buildDestinationSlugCore,
  normalizeDestinationDocCore,
  normalizeDestinationPayloadCore
} from "../menyra-social/core/destinations/destination-template-core.js";
import {
  createMediaUploadRuntimeCluster
} from "../menyra-social/core/media/media-upload-runtime-cluster.js";
import {
  compressImage
} from "../menyra-social/_shared/image-compressor.js";

export const HEART_DESTINATIONS_ADAPTER_VERSION = "heart-destinations-adapter.v1";

const DESTINATIONS_COLLECTION = "heartDestinations";
const DESTINATIONS_PUBLIC_COLLECTION = "destinationsPublic";
const DESTINATIONS_LIST_LIMIT = 100;
const PUBLIC_LIST_CACHE_TTL_MS = 5 * 60 * 1000;

function asText(value = "") {
  if (value == null) return "";
  return String(value).trim();
}

export function createHeartDestinationsAdapter({
  getAuthState
} = {}) {
  let publicListCache = { items: [], loadedAt: 0 };

  function buildCreatorMeta() {
    const authState = typeof getAuthState === "function" ? (getAuthState() || {}) : {};
    return {
      createdByUid: asText(authState.user?.uid),
      createdByName: asText(authState.profile?.name || authState.user?.displayName || authState.user?.email)
    };
  }

  // Gleicher Media-Worker-Pfad wie die CRM-Logo-Uploads (Ticket + CDN-URL),
  // aber lazy: der Upload-Cluster entsteht erst beim ersten Bild.
  let mediaUploadRuntime = null;

  function ensureMediaUploadRuntime() {
    if (mediaUploadRuntime) return mediaUploadRuntime;
    mediaUploadRuntime = createMediaUploadRuntimeCluster({
      stateDeps: {
        state: {},
        auth,
        documentObj: typeof document === "undefined" ? null : document
      },
      constants: {
        mediaBaseUrl: BUNNY_EDGE_BASE,
        mediaTicketEndpoint: MEDIA_TICKET_ENDPOINT,
        cacheKeys: {},
        fastLimits: {}
      },
      firebaseApi: { db },
      mediaApi: {
        fetchFn: typeof fetch === "function" ? fetch.bind(globalThis) : null,
        compressImageFn: compressImage
      }
    });
    return mediaUploadRuntime;
  }

  async function uploadDestinationImage(file, destinationId = "") {
    if (!file) throw new Error("Bild fehlt.");
    const ownerId = asText(destinationId) || "heart-destinations";
    const { url, cdnUrl } = await ensureMediaUploadRuntime().uploadCompressedImage(file, ownerId, {
      maxSize: 1600,
      quality: 0.82,
      mimeType: "image/jpeg"
    });
    const imageUrl = asText(cdnUrl || url);
    if (!imageUrl) throw new Error("Upload lieferte keine Bild-URL.");
    return imageUrl;
  }

  async function listDestinations() {
    const ref = collection(db, DESTINATIONS_COLLECTION);
    let snap;
    try {
      snap = await getDocs(query(ref, orderBy("name"), limit(DESTINATIONS_LIST_LIMIT)));
    } catch {
      snap = await getDocs(query(ref, limit(DESTINATIONS_LIST_LIMIT)));
    }
    const items = [];
    snap.forEach((docSnap) => {
      items.push(normalizeDestinationDocCore(docSnap.id, docSnap.data() || {}));
    });
    return items.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  async function loadDestination(destinationId = "") {
    const safeId = asText(destinationId);
    if (!safeId) return null;
    const snap = await getDoc(doc(db, DESTINATIONS_COLLECTION, safeId));
    if (!snap.exists()) return null;
    return normalizeDestinationDocCore(snap.id, snap.data() || {});
  }

  async function saveDraft(destinationId = "", payload = {}) {
    const draft = normalizeDestinationPayloadCore(payload);
    if (!draft.name) throw new Error("Bitte einen Namen fuer die Destination eingeben.");
    const safeId = asText(destinationId);
    const ref = safeId
      ? doc(db, DESTINATIONS_COLLECTION, safeId)
      : doc(collection(db, DESTINATIONS_COLLECTION));
    const isCreate = !safeId;
    const docPayload = {
      name: draft.name,
      slug: buildDestinationSlugCore(draft.name),
      draft,
      draftUpdatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(isCreate ? { createdAt: serverTimestamp(), ...buildCreatorMeta() } : {})
    };
    await setDoc(ref, docPayload, { merge: true });
    return { id: ref.id, created: isCreate };
  }

  async function publishDestination(destinationId = "") {
    const safeId = asText(destinationId);
    if (!safeId) throw new Error("Destination-ID fehlt.");
    const destination = await loadDestination(safeId);
    if (!destination) throw new Error("Destination wurde nicht gefunden.");
    if (!destination.draft?.name) throw new Error("Der Entwurf hat keinen Namen.");
    const version = (destination.publishedVersion || 0) + 1;
    const projection = buildDestinationPublicProjectionCore(destination, { version });
    if (!projection.places.length) {
      throw new Error("Der Entwurf enthaelt keine aktiven Orte. Bitte mindestens einen Ort aktivieren.");
    }
    await setDoc(doc(db, DESTINATIONS_COLLECTION, safeId), {
      published: destination.draft,
      publishedVersion: version,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    await setDoc(doc(db, DESTINATIONS_PUBLIC_COLLECTION, safeId), {
      ...projection,
      updatedAt: serverTimestamp()
    });
    publicListCache = { items: [], loadedAt: 0 };
    return { id: safeId, version, placeCount: projection.places.length };
  }

  async function deleteDestination(destinationId = "") {
    const safeId = asText(destinationId);
    if (!safeId) throw new Error("Destination-ID fehlt.");
    await deleteDoc(doc(db, DESTINATIONS_COLLECTION, safeId));
    try {
      await deleteDoc(doc(db, DESTINATIONS_PUBLIC_COLLECTION, safeId));
    } catch {}
    publicListCache = { items: [], loadedAt: 0 };
  }

  // Veroeffentlichte Templates fuer den Lead-Editor (klein, gecacht, public-read).
  async function listPublishedDestinations({ force = false } = {}) {
    const isFresh = publicListCache.items.length
      && Date.now() - publicListCache.loadedAt < PUBLIC_LIST_CACHE_TTL_MS;
    if (isFresh && !force) return publicListCache.items;
    const snap = await getDocs(query(collection(db, DESTINATIONS_PUBLIC_COLLECTION), limit(DESTINATIONS_LIST_LIMIT)));
    const items = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() || {};
      items.push({
        id: docSnap.id,
        name: asText(data.name),
        slug: asText(data.slug),
        description: asText(data.description),
        version: Math.max(0, Number(data.version) || 0),
        places: Array.isArray(data.places) ? data.places : []
      });
    });
    publicListCache = {
      items: items.sort((a, b) => String(a.name).localeCompare(String(b.name))),
      loadedAt: Date.now()
    };
    return publicListCache.items;
  }

  return Object.freeze({
    version: HEART_DESTINATIONS_ADAPTER_VERSION,
    listDestinations,
    loadDestination,
    saveDraft,
    publishDestination,
    deleteDestination,
    listPublishedDestinations,
    uploadDestinationImage
  });
}
