export function getPostEntityKey(post = {}) {
  const id = String(post?.id || "").trim();
  if (!id) return "";
  const ownerType = String(
    post?.ownerType
    || (post?.restaurantId || post?.rid ? "restaurant" : "")
    || (post?.uid || post?.userId ? "user" : "")
    || ""
  ).trim();
  const ownerId = String(
    post?.ownerId
    || post?.restaurantId
    || post?.rid
    || post?.uid
    || post?.userId
    || ""
  ).trim();
  if (ownerType && ownerId) return `${ownerType}:${ownerId}:${id}`;
  return `post:${id}`;
}

export function ensurePostEntityMap(state = null) {
  if (!state) return new Map();
  if (!(state.postEntityMap instanceof Map)) {
    state.postEntityMap = new Map();
  }
  return state.postEntityMap;
}

export function clearPostEntityMap(state = null) {
  const map = ensurePostEntityMap(state);
  map.clear();
  return map;
}

export function projectPostCollectionThroughEntityMap(state = null, items = []) {
  const entityMap = ensurePostEntityMap(state);
  const seen = new Set();
  return (Array.isArray(items) ? items : []).map((item) => {
    const key = getPostEntityKey(item);
    if (!key || seen.has(key)) return null;
    seen.add(key);
    const existing = entityMap.get(key);
    if (!existing) {
      const created = { ...(item || {}) };
      entityMap.set(key, created);
      return created;
    }
    Object.assign(existing, item || {});
    return existing;
  }).filter(Boolean);
}
