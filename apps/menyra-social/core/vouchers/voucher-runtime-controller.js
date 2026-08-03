// Mnyra Ofertat - Datenzugriff und State.
//
// Speicherorte:
//  - restaurants/{id}/public/vouchers          Liste der Ofertat (Business schreibt)
//  - restaurants/{id}/voucherStats/{voucherId} Reichweite/Aktivierungen (Zaehler)
//  - restaurants/{id}/voucherActivations/{voucherId__uid}  Aktivierung je Kunde
//
// Kunden ohne Login koennen Ofertat trotzdem aktivieren: dann bleibt die
// Aktivierung lokal (localStorage) und nur der Reichweiten-/Aktivierungszaehler
// wird nicht geschrieben. So bricht der Gastmodus nicht.

import {
  VOUCHER_PUBLIC_DOC_ID,
  VOUCHER_STATS_COLLECTION,
  VOUCHER_ACTIVATIONS_COLLECTION,
  cleanVoucherText,
  normalizeVoucherItem,
  normalizeVoucherStats,
  normalizeVoucherActivation,
  buildActivationRecord,
  buildVoucherActivationKey,
  buildVoucherActivationDocId,
  toVoucherStoragePayload,
  toVoucherMillis
} from "./voucher-core.js";

const ACTIVATION_STORAGE_PREFIX = "menyra_social_voucher_activations_v1::";
const CUSTOMER_FETCH_LIMIT = 40;
const REACH_SESSION_PREFIX = "menyra_social_voucher_reach_v1::";

function asFn(candidate, fallback) {
  return typeof candidate === "function" ? candidate : fallback;
}

export function createVoucherRuntimeController({
  state = null,
  db = null,
  firestoreApi = {},
  storageObj = null,
  renderFn = () => {},
  uploadCompressedImageFn = null
} = {}) {
  const docFn = asFn(firestoreApi.docFn, null);
  const collectionFn = asFn(firestoreApi.collectionFn, null);
  const getDocFn = asFn(firestoreApi.getDocFn, null);
  const getDocsFn = asFn(firestoreApi.getDocsFn, null);
  const setDocFn = asFn(firestoreApi.setDocFn, null);
  const incrementFn = asFn(firestoreApi.incrementFn, null);
  const serverTimestampFn = asFn(firestoreApi.serverTimestampFn, () => null);
  const uploadCompressedImage = asFn(uploadCompressedImageFn, null);
  const render = asFn(renderFn, () => {});
  const storage = storageObj || (typeof localStorage === "undefined" ? null : localStorage);

  const publicLoadPromises = new Map();
  const publicCache = new Map();
  let ownerLoadPromise = null;
  let hydratedScopeId = "";

  function hasFirestore() {
    return !!db && !!docFn && !!getDocFn;
  }

  function ensureState() {
    if (!state) return null;
    if (!state.vouchers || typeof state.vouchers !== "object") {
      state.vouchers = {
        // Business-Editor
        restaurantId: "",
        items: [],
        enabled: true,
        loading: false,
        error: "",
        truthState: "unknown",
        statsById: {},
        statsLoading: false,
        editor: null,
        // Kundentab
        feed: {
          status: "idle", // idle | loading | ready | error
          error: "",
          signature: "",
          entries: []
        },
        activations: {},
        confirm: null,
        notice: ""
      };
    }
    if (!state.vouchers.feed || typeof state.vouchers.feed !== "object") {
      state.vouchers.feed = { status: "idle", error: "", signature: "", entries: [] };
    }
    if (!state.vouchers.activations || typeof state.vouchers.activations !== "object") {
      state.vouchers.activations = {};
    }
    if (!state.vouchers.statsById || typeof state.vouchers.statsById !== "object") {
      state.vouchers.statsById = {};
    }
    syncActivationScope();
    return state.vouchers;
  }

  function currentScopeId() {
    return cleanVoucherText(state?.user?.uid) || "guest";
  }

  function activationStorageKey() {
    return `${ACTIVATION_STORAGE_PREFIX}${currentScopeId()}`;
  }

  function readStoredActivations() {
    if (!storage) return {};
    try {
      const raw = storage.getItem(activationStorageKey());
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeStoredActivations(map = {}) {
    if (!storage) return;
    try {
      storage.setItem(activationStorageKey(), JSON.stringify(map || {}));
    } catch {}
  }

  // Abgelaufene Aktivierungen bleiben sichtbar bis sie deutlich vorbei sind,
  // damit "Skaduar" im Kartenzustand noch angezeigt werden kann.
  function pruneActivations(map = {}, nowMs = Date.now()) {
    const cutoff = nowMs - (24 * 60 * 60 * 1000);
    const next = {};
    Object.entries(map || {}).forEach(([key, value]) => {
      const expiresMs = toVoucherMillis(value?.expiresAt);
      if (!expiresMs || expiresMs < cutoff) return;
      next[key] = value;
    });
    return next;
  }

  // Der Controller wird beim ersten Ofertat-Render erzeugt - da kann der
  // Auth-Bootstrap noch laufen und die uid fehlen. Deshalb wird der
  // Speicher-Scope bei jedem Zugriff geprueft und beim Wechsel neu geladen.
  // Aktivierungen aus dem Gast-Scope wandern beim Login mit, damit eine
  // gerade aktivierte Oferta durch das Anmelden nicht verloren geht.
  function syncActivationScope() {
    const scopeId = currentScopeId();
    if (hydratedScopeId === scopeId) return;
    const previousScopeId = hydratedScopeId;
    hydratedScopeId = scopeId;
    const stored = pruneActivations(readStoredActivations());
    const carriedOver = previousScopeId === "guest" && scopeId !== "guest"
      ? pruneActivations(state.vouchers.activations || {})
      : {};
    state.vouchers.activations = { ...carriedOver, ...stored };
    writeStoredActivations(state.vouchers.activations);
  }

  function hydrateActivationsFromStorage() {
    if (!state) return {};
    hydratedScopeId = "";
    const view = ensureState();
    return view ? view.activations : {};
  }

  function getActivation(restaurantId = "", voucherId = "") {
    const view = ensureState();
    if (!view) return null;
    return view.activations[buildVoucherActivationKey(restaurantId, voucherId)] || null;
  }

  function rememberActivation(record = {}) {
    const view = ensureState();
    if (!view) return;
    const key = buildVoucherActivationKey(record.restaurantId, record.voucherId);
    if (!key.trim() || key === "::") return;
    view.activations = { ...view.activations, [key]: record };
    writeStoredActivations(view.activations);
  }

  // ---------------------------------------------------------------- Business

  function publicDocRef(restaurantId = "") {
    return docFn(db, "restaurants", restaurantId, "public", VOUCHER_PUBLIC_DOC_ID);
  }

  async function loadVoucherDoc(restaurantId = "") {
    const safeId = cleanVoucherText(restaurantId);
    if (!safeId || !hasFirestore()) return { items: [], enabled: true };
    const snap = await getDocFn(publicDocRef(safeId));
    if (!snap?.exists?.()) return { items: [], enabled: true };
    const data = snap.data() || {};
    const rawItems = Array.isArray(data.items) ? data.items : [];
    return {
      items: rawItems.map((item, index) => normalizeVoucherItem(item, item?.id || `ofr_${index}`)),
      enabled: data.enabled !== false
    };
  }

  async function publishVoucherItems(restaurantId = "", items = [], { enabled } = {}) {
    const safeId = cleanVoucherText(restaurantId);
    if (!safeId || !hasFirestore() || !setDocFn) return;
    const payloadItems = (Array.isArray(items) ? items : []).map((item) => toVoucherStoragePayload(item));
    const payload = {
      items: payloadItems,
      truthSource: "public-vouchers",
      truthState: payloadItems.length ? "seeded" : "knownEmpty",
      updatedAt: serverTimestampFn()
    };
    if (typeof enabled === "boolean") payload.enabled = enabled;
    await setDocFn(publicDocRef(safeId), payload, { merge: true });
    publicCache.set(safeId, {
      items: payloadItems.map((item) => normalizeVoucherItem(item)),
      enabled: typeof enabled === "boolean" ? enabled : true,
      ts: Date.now()
    });
  }

  async function loadOwnerVouchers(restaurantId = "", { force = false } = {}) {
    const view = ensureState();
    const safeId = cleanVoucherText(restaurantId);
    if (!view || !safeId) return;
    const sameRestaurant = view.restaurantId === safeId;
    if (!force && sameRestaurant && (view.truthState === "seeded" || view.truthState === "knownEmpty")) return;
    if (ownerLoadPromise) return ownerLoadPromise;

    view.restaurantId = safeId;
    view.loading = true;
    view.error = "";
    if (!sameRestaurant) view.items = [];
    render();

    ownerLoadPromise = (async () => {
      try {
        const [doc, stats] = await Promise.all([
          loadVoucherDoc(safeId),
          loadVoucherStats(safeId)
        ]);
        view.items = doc.items;
        view.enabled = doc.enabled;
        view.statsById = stats;
        view.truthState = doc.items.length ? "seeded" : "knownEmpty";
        view.error = "";
      } catch (err) {
        console.error("[mnyra][ofertat] owner load failed", err);
        view.error = "Ofertat nuk mund te ngarkoheshin.";
        view.truthState = "unknown";
      } finally {
        view.loading = false;
        ownerLoadPromise = null;
        render();
      }
    })();
    return ownerLoadPromise;
  }

  async function loadVoucherStats(restaurantId = "") {
    const safeId = cleanVoucherText(restaurantId);
    if (!safeId || !db || !collectionFn || !getDocsFn) return {};
    try {
      const snap = await getDocsFn(collectionFn(db, "restaurants", safeId, VOUCHER_STATS_COLLECTION));
      const map = {};
      snap.docs.forEach((entry) => {
        map[entry.id] = normalizeVoucherStats(entry.data() || {});
      });
      return map;
    } catch (err) {
      console.error("[mnyra][ofertat] stats load failed", err);
      return {};
    }
  }

  async function saveVoucherFromEditor(restaurantId = "", draft = {}, { imageFile = null } = {}) {
    const view = ensureState();
    const safeId = cleanVoucherText(restaurantId);
    if (!view || !safeId) throw new Error("Kein Business");
    let imageUrl = cleanVoucherText(draft.imageUrl);
    if (imageFile && uploadCompressedImage) {
      const { cdnUrl } = await uploadCompressedImage(imageFile, safeId, {
        maxSize: 1280,
        quality: 0.82,
        mimeType: "image/jpeg"
      });
      imageUrl = cleanVoucherText(cdnUrl) || imageUrl;
    }
    const normalized = normalizeVoucherItem({ ...draft, imageUrl });
    const nextItems = Array.isArray(view.items) ? view.items.slice() : [];
    const index = nextItems.findIndex((item) => item.id === normalized.id);
    if (index >= 0) {
      nextItems[index] = { ...nextItems[index], ...normalized };
    } else {
      nextItems.unshift(normalized);
    }
    await publishVoucherItems(safeId, nextItems);
    view.items = nextItems.map((item) => normalizeVoucherItem(item));
    view.truthState = view.items.length ? "seeded" : "knownEmpty";
    view.restaurantId = safeId;
    return normalized;
  }

  async function deleteVoucherById(restaurantId = "", voucherId = "") {
    const view = ensureState();
    const safeId = cleanVoucherText(restaurantId);
    const safeVoucherId = cleanVoucherText(voucherId);
    if (!view || !safeId || !safeVoucherId) return;
    const nextItems = (Array.isArray(view.items) ? view.items : [])
      .filter((item) => item.id !== safeVoucherId);
    await publishVoucherItems(safeId, nextItems);
    view.items = nextItems;
    view.truthState = view.items.length ? "seeded" : "knownEmpty";
  }

  async function setVouchersEnabled(restaurantId = "", enabled = true) {
    const view = ensureState();
    const safeId = cleanVoucherText(restaurantId);
    if (!view || !safeId) return;
    view.enabled = !!enabled;
    await publishVoucherItems(safeId, Array.isArray(view.items) ? view.items : [], { enabled: !!enabled });
  }

  // ---------------------------------------------------------------- Kunden

  async function loadPublicVouchers(restaurantId = "", { force = false } = {}) {
    const safeId = cleanVoucherText(restaurantId);
    if (!safeId) return { items: [], enabled: true };
    const cached = publicCache.get(safeId);
    if (cached && !force) return { items: cached.items, enabled: cached.enabled };
    if (publicLoadPromises.has(safeId)) return publicLoadPromises.get(safeId);
    const request = loadVoucherDoc(safeId)
      .then((result) => {
        publicCache.set(safeId, { ...result, ts: Date.now() });
        return result;
      })
      .catch((err) => {
        console.error("[mnyra][ofertat] public load failed", err);
        return { items: [], enabled: true };
      })
      .finally(() => {
        publicLoadPromises.delete(safeId);
      });
    publicLoadPromises.set(safeId, request);
    return request;
  }

  // Laedt die Ofertat aller Lokale, die im aktuellen Stadt-Scope sichtbar sind.
  async function loadVoucherFeed({ businesses = [], signature = "", force = false } = {}) {
    const view = ensureState();
    if (!view) return;
    const feed = view.feed;
    const safeSignature = cleanVoucherText(signature);
    if (!force && feed.signature === safeSignature && feed.status === "ready") return;
    if (feed.status === "loading" && feed.signature === safeSignature) return;

    feed.signature = safeSignature;
    feed.status = feed.entries.length ? feed.status : "loading";
    feed.error = "";
    if (!feed.entries.length) render();

    const targets = (Array.isArray(businesses) ? businesses : []).slice(0, CUSTOMER_FETCH_LIMIT);
    try {
      const results = await Promise.all(targets.map(async (business) => {
        const restaurantId = cleanVoucherText(business?.id);
        if (!restaurantId) return null;
        const { items, enabled } = await loadPublicVouchers(restaurantId, { force });
        if (!enabled || !items.length) return null;
        return { business, items };
      }));
      feed.entries = results.filter(Boolean);
      feed.status = "ready";
      feed.error = "";
    } catch (err) {
      console.error("[mnyra][ofertat] feed load failed", err);
      feed.status = feed.entries.length ? "ready" : "error";
      feed.error = "Ofertat nuk mund te ngarkoheshin.";
    }
    render();
  }

  function statsDocRef(restaurantId = "", voucherId = "") {
    return docFn(db, "restaurants", restaurantId, VOUCHER_STATS_COLLECTION, voucherId);
  }

  function activationDocRef(restaurantId = "", voucherId = "", uid = "") {
    return docFn(
      db,
      "restaurants",
      restaurantId,
      VOUCHER_ACTIVATIONS_COLLECTION,
      buildVoucherActivationDocId(voucherId, uid)
    );
  }

  function reachSessionKey(restaurantId = "", voucherId = "") {
    const day = new Date().toISOString().slice(0, 10);
    return `${REACH_SESSION_PREFIX}${day}::${buildVoucherActivationKey(restaurantId, voucherId)}`;
  }

  // Reichweite zaehlt pro Betrachter und Tag genau einmal.
  function markReach(restaurantId = "", voucherId = "") {
    const safeId = cleanVoucherText(restaurantId);
    const safeVoucherId = cleanVoucherText(voucherId);
    if (!safeId || !safeVoucherId) return;
    if (!hasFirestore() || !setDocFn || !incrementFn) return;
    if (!cleanVoucherText(state?.user?.uid)) return;
    const key = reachSessionKey(safeId, safeVoucherId);
    try {
      if (storage?.getItem?.(key)) return;
      storage?.setItem?.(key, "1");
    } catch {}
    void setDocFn(statsDocRef(safeId, safeVoucherId), {
      reachCount: incrementFn(1),
      updatedAt: serverTimestampFn()
    }, { merge: true }).catch(() => {});
  }

  async function activateVoucher(restaurantId = "", voucher = {}) {
    const safeId = cleanVoucherText(restaurantId);
    const item = normalizeVoucherItem(voucher);
    if (!safeId || !item.id) return null;
    const uid = cleanVoucherText(state?.user?.uid);
    const record = buildActivationRecord({
      restaurantId: safeId,
      voucherId: item.id,
      uid,
      activationMinutes: item.activationMinutes
    });
    rememberActivation(record);

    if (uid && hasFirestore() && setDocFn) {
      try {
        await setDocFn(activationDocRef(safeId, item.id, uid), {
          restaurantId: safeId,
          voucherId: item.id,
          uid,
          code: record.code,
          activatedAt: record.activatedAt,
          expiresAt: record.expiresAt,
          createdAt: serverTimestampFn()
        }, { merge: true });
        if (incrementFn) {
          await setDocFn(statsDocRef(safeId, item.id), {
            activationCount: incrementFn(1),
            updatedAt: serverTimestampFn()
          }, { merge: true });
        }
      } catch (err) {
        // Der Kunde behaelt die lokale Aktivierung, auch wenn der Server-Write
        // scheitert. Sonst waere die Oferta "weg", obwohl er sie aktiviert hat.
        console.error("[mnyra][ofertat] activation write failed", err);
      }
    }
    return record;
  }

  async function restoreServerActivations(restaurantId = "", voucherIds = []) {
    const uid = cleanVoucherText(state?.user?.uid);
    const safeId = cleanVoucherText(restaurantId);
    if (!uid || !safeId || !hasFirestore()) return;
    const ids = (Array.isArray(voucherIds) ? voucherIds : []).map(cleanVoucherText).filter(Boolean);
    let restored = 0;
    await Promise.all(ids.map(async (voucherId) => {
      if (getActivation(safeId, voucherId)) return;
      try {
        const snap = await getDocFn(activationDocRef(safeId, voucherId, uid));
        if (!snap?.exists?.()) return;
        const record = normalizeVoucherActivation({ ...(snap.data() || {}), restaurantId: safeId, voucherId, uid });
        if (!record.expiresAtMs || record.expiresAtMs <= Date.now()) return;
        rememberActivation({
          restaurantId: safeId,
          voucherId,
          uid,
          code: record.code,
          activatedAt: new Date(record.activatedAtMs || Date.now()).toISOString(),
          expiresAt: new Date(record.expiresAtMs).toISOString()
        });
        restored += 1;
      } catch {}
    }));
    // Eine auf einem anderen Geraet gestartete Aktivierung muss sofort
    // sichtbar werden, sonst bietet die Karte erneut "Aktivizo" an.
    if (restored > 0) render();
  }

  function resetVoucherUserState() {
    const view = ensureState();
    if (!view) return;
    view.restaurantId = "";
    view.items = [];
    view.enabled = true;
    view.loading = false;
    view.error = "";
    view.truthState = "unknown";
    view.statsById = {};
    view.editor = null;
    view.feed = { status: "idle", error: "", signature: "", entries: [] };
    view.confirm = null;
    view.notice = "";
    publicCache.clear();
    // Beim Logout wird der Scope zurueckgesetzt und der naechste Zugriff
    // hydriert aus dem Bucket des dann aktiven Kontos. Kein Uebertrag: die
    // Aktivierungen des abgemeldeten Kontos bleiben in seinem Bucket.
    hydratedScopeId = "";
    view.activations = {};
  }

  return Object.freeze({
    ensureState,
    hydrateActivationsFromStorage,
    getActivation,
    loadOwnerVouchers,
    loadVoucherStats,
    saveVoucherFromEditor,
    deleteVoucherById,
    setVouchersEnabled,
    loadPublicVouchers,
    loadVoucherFeed,
    markReach,
    activateVoucher,
    restoreServerActivations,
    resetVoucherUserState,
    publishVoucherItems
  });
}
