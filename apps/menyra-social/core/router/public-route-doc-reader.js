import { normalizePublicBusinessSlugCore } from "./public-business-route-utils.js";

function safeText(value = "") {
  return String(value || "").trim();
}

function normalizeSlug(value = "") {
  return normalizePublicBusinessSlugCore(value || "", { allowReserved: false });
}

function normalizeRouteDocSnapshot(snapshot = null, slug = "") {
  if (!snapshot) return null;
  const exists = typeof snapshot.exists === "function" ? snapshot.exists() : snapshot.exists;
  if (exists === false) return null;
  const data = typeof snapshot.data === "function" ? snapshot.data() : snapshot.data;
  if (!data || typeof data !== "object") return null;
  return {
    id: safeText(snapshot.id || slug),
    ...data
  };
}

export function createPublicRouteDocReaderCore({
  db = null,
  docFn = null,
  getDocFn = null,
  collectionName = "publicRoutes"
} = {}) {
  const canRead = !!db && typeof docFn === "function" && typeof getDocFn === "function";

  return async function readPublicRouteDoc(slug = "") {
    const safeSlug = normalizeSlug(slug);
    if (!safeSlug || !canRead) return null;
    try {
      const ref = docFn(db, collectionName, safeSlug);
      const snapshot = await getDocFn(ref);
      return normalizeRouteDocSnapshot(snapshot, safeSlug);
    } catch {
      return null;
    }
  };
}

export async function readPublicRouteDocCore(slug = "", options = {}) {
  const reader = createPublicRouteDocReaderCore(options);
  return reader(slug);
}
