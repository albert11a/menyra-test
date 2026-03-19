import {
  buildTableNumberListCore,
  normalizeTableQrCountCore,
  normalizeTableQrMetaCore
} from "./table-qr-utils.js";

export function createTableQrRuntimeController({
  state = null,
  db = null,
  docFn = null,
  getDocFn = async () => null,
  getDocFromServerFn = null,
  setDocFn = async () => {},
  serverTimestampFn = () => null,
  waitForPendingWritesFn = null,
  isRestaurantCafeProfileFn = () => false,
  renderFn = () => {},
  storageObj = null
} = {}) {
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const getDoc = typeof getDocFn === "function" ? getDocFn : (async () => null);
  const getDocFromServer = typeof getDocFromServerFn === "function" ? getDocFromServerFn : null;
  const setDoc = typeof setDocFn === "function" ? setDocFn : (async () => {});
  const serverTimestamp = typeof serverTimestampFn === "function" ? serverTimestampFn : (() => null);
  const waitForPendingWrites = typeof waitForPendingWritesFn === "function"
    ? waitForPendingWritesFn
    : null;
  const isRestaurantCafeProfile = typeof isRestaurantCafeProfileFn === "function"
    ? isRestaurantCafeProfileFn
    : (() => false);
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const storage = storageObj && typeof storageObj.getItem === "function" && typeof storageObj.setItem === "function"
    ? storageObj
    : (typeof globalThis !== "undefined" && globalThis.localStorage ? globalThis.localStorage : null);

  function createEmptyState() {
    return {
      restaurantId: "",
      enabled: true,
      count: 0,
      loaded: false,
      loading: false,
      saving: false,
      error: "",
      status: "",
      verifiedAt: 0
    };
  }

  function ensureStateShape() {
    if (!state) return createEmptyState();
    if (!state.tableQr || typeof state.tableQr !== "object") {
      state.tableQr = createEmptyState();
    }
    return state.tableQr;
  }

  function cacheKeyForRestaurant(restaurantId) {
    const safeRestaurantId = String(restaurantId || "").trim();
    return safeRestaurantId ? `menyra.tableQr.${safeRestaurantId}` : "";
  }

  function readCachedTableQrMeta(restaurantId) {
    const key = cacheKeyForRestaurant(restaurantId);
    if (!key || !storage) return null;
    try {
      const raw = storage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        restaurantId: String(parsed?.restaurantId || restaurantId || "").trim(),
        ...normalizeTableQrMetaCore(parsed || {}),
        verifiedAt: Number(parsed?.verifiedAt || 0) || 0
      };
    } catch {
      return null;
    }
  }

  function writeCachedTableQrMeta(restaurantId, meta = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const key = cacheKeyForRestaurant(safeRestaurantId);
    if (!key || !storage) return;
    try {
      storage.setItem(key, JSON.stringify({
        restaurantId: safeRestaurantId,
        tableQrEnabled: meta.enabled !== false,
        tableQrCount: normalizeTableQrCountCore(meta.count),
        verifiedAt: Number(meta.verifiedAt || Date.now()) || Date.now()
      }));
    } catch {}
  }

  function buildSaveErrorMessage(err) {
    const code = String(err?.code || "").trim().toLowerCase();
    if (code.includes("permission-denied")) {
      return "Tisch-QR konnte nicht gespeichert werden. Schreibzugriff fehlt.";
    }
    return "Tisch-QR konnte nicht gespeichert werden.";
  }

  async function loadTableQrMeta(restaurantId, { preferServer = false } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !makeDocRef || !getDoc || !db) return createEmptyState();
    try {
      const reader = preferServer && getDocFromServer ? getDocFromServer : getDoc;
      const snap = await reader(makeDocRef(db, "restaurants", safeRestaurantId, "public", "meta"));
      const data = snap?.exists?.() ? (snap.data() || {}) : {};
      const normalized = normalizeTableQrMetaCore(data);
      const next = {
        restaurantId: safeRestaurantId,
        ...normalized,
        verifiedAt: Date.now()
      };
      writeCachedTableQrMeta(safeRestaurantId, next);
      return {
        ...next
      };
    } catch (err) {
      console.error(err);
      const cached = readCachedTableQrMeta(safeRestaurantId);
      if (cached) {
        return {
          ...cached,
          restaurantId: safeRestaurantId,
          error: "Tisch-QR konnte nicht live geladen werden."
        };
      }
      return {
        ...createEmptyState(),
        restaurantId: safeRestaurantId,
        error: "Tisch-QR konnte nicht geladen werden."
      };
    }
  }

  function getTableQrStateForRestaurant(restaurantId) {
    const safeRestaurantId = String(restaurantId || "").trim();
    const current = ensureStateShape();
    const sameRestaurant = !!safeRestaurantId && current.restaurantId === safeRestaurantId;
    const enabled = sameRestaurant ? current.enabled !== false : true;
    const count = sameRestaurant ? normalizeTableQrCountCore(current.count) : 0;
    return {
      restaurantId: safeRestaurantId,
      enabled,
      count,
      tables: buildTableNumberListCore(count),
      sameRestaurant,
      loading: !!safeRestaurantId && (!!current.loading || !sameRestaurant),
      loaded: sameRestaurant ? !!current.loaded : false,
      saving: sameRestaurant ? !!current.saving : false,
      error: sameRestaurant ? String(current.error || "").trim() : "",
      status: sameRestaurant ? String(current.status || "").trim() : "",
      verifiedAt: sameRestaurant ? Number(current.verifiedAt || 0) || 0 : 0
    };
  }

  async function ensureTableQrStateForProfile(profile = state?.userProfile) {
    const restaurantId = String(profile?.restaurantId || "").trim();
    if (!restaurantId || !isRestaurantCafeProfile(profile)) return false;
    const current = ensureStateShape();
    if (current.restaurantId === restaurantId && current.loaded && !current.loading && !current.error) return true;
    const cached = readCachedTableQrMeta(restaurantId);
    state.tableQr = {
      ...createEmptyState(),
      restaurantId,
      enabled: cached?.enabled ?? (current.restaurantId === restaurantId ? current.enabled !== false : true),
      count: cached ? normalizeTableQrCountCore(cached.count) : (current.restaurantId === restaurantId ? normalizeTableQrCountCore(current.count) : 0),
      loaded: !!cached,
      loading: true,
      status: cached ? "Gespeicherte Tisch-QR werden geladen..." : ""
    };
    render();
    const loaded = await loadTableQrMeta(restaurantId);
    state.tableQr = {
      ...createEmptyState(),
      ...loaded,
      restaurantId,
      loaded: true,
      loading: false,
      saving: false,
      status: loaded?.verifiedAt ? "Tisch-QR synchronisiert." : ""
    };
    render();
    return true;
  }

  async function saveTableQrConfig(restaurantId, {
    enabled = true,
    count = 0
  } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId || !makeDocRef || !setDoc || !db) return false;
    const requestedCount = normalizeTableQrCountCore(count);
    const current = ensureStateShape();
    const cached = readCachedTableQrMeta(safeRestaurantId);
    const existingCount = Math.max(
      current.restaurantId === safeRestaurantId ? normalizeTableQrCountCore(current.count) : 0,
      cached ? normalizeTableQrCountCore(cached.count) : 0
    );
    const normalizedCount = Math.max(existingCount, requestedCount);
    const preservingExistingTables = normalizedCount > requestedCount;
    state.tableQr = {
      ...current,
      restaurantId: safeRestaurantId,
      enabled: !!enabled,
      count: normalizedCount,
      loaded: !!current.loaded,
      saving: true,
      error: "",
      status: preservingExistingTables
        ? `Vorhandene Tisch-QR bleiben erhalten. ${normalizedCount} Tische werden gespeichert...`
        : "Tisch-QR wird gespeichert..."
    };
    render();
    try {
      await setDoc(makeDocRef(db, "restaurants", safeRestaurantId, "public", "meta"), {
        tableQrEnabled: !!enabled,
        tableQrCount: normalizedCount,
        updatedAt: serverTimestamp()
      }, { merge: true });
      if (waitForPendingWrites && db) {
        await waitForPendingWrites(db);
      }
      const confirmed = await loadTableQrMeta(safeRestaurantId, { preferServer: true });
      state.tableQr = {
        ...createEmptyState(),
        ...confirmed,
        restaurantId: safeRestaurantId,
        loaded: true,
        loading: false,
        saving: false,
        error: "",
        status: preservingExistingTables
          ? `Vorhandene Tisch-QR bleiben bestehen. ${normalizedCount} Tische gespeichert.`
          : "Tisch-QR gespeichert.",
        verifiedAt: Number(confirmed?.verifiedAt || Date.now()) || Date.now()
      };
      writeCachedTableQrMeta(safeRestaurantId, state.tableQr);
      render();
      return true;
    } catch (err) {
      console.error(err);
      state.tableQr = {
        ...state.tableQr,
        saving: false,
        error: buildSaveErrorMessage(err),
        status: ""
      };
      render();
      return false;
    }
  }

  return {
    createEmptyTableQrState: createEmptyState,
    loadTableQrMeta,
    getTableQrStateForRestaurant,
    ensureTableQrStateForProfile,
    saveTableQrConfig
  };
}
