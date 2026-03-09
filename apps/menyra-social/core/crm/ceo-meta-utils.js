export function getCurrentCeoMetaCore(profile = {}, user = {}, {
  normalizeCeoPathFn,
  hasGlobalCeoAccessFn,
  uniqueStringListFn
} = {}) {
  const normalizeCeoPath = typeof normalizeCeoPathFn === "function"
    ? normalizeCeoPathFn
    : ((value, fallback = []) => {
      const base = Array.isArray(value) ? value : String(value || "").split(/[,\s]+/).filter(Boolean);
      return Array.from(new Set([...(base || []), ...(fallback || [])].map((entry) => String(entry || "").trim()).filter(Boolean)));
    });
  const hasGlobalCeoAccess = typeof hasGlobalCeoAccessFn === "function"
    ? hasGlobalCeoAccessFn
    : (() => false);
  const uniqueStringList = typeof uniqueStringListFn === "function"
    ? uniqueStringListFn
    : ((values = []) => Array.from(new Set((values || []).map((entry) => String(entry || "").trim()).filter(Boolean))));
  const uid = String(user?.uid || profile?.uid || "").trim();
  const name = String(profile?.name || user?.displayName || user?.email || "").trim() || "CEO";
  const parentUid = String(profile?.ceoParentUid || profile?.parentCeoUid || "").trim();
  const rootUid = String(profile?.ceoRootUid || profile?.rootCeoUid || "").trim() || uid;
  let path = normalizeCeoPath(profile?.ceoPath);
  if (!path.length) {
    if (hasGlobalCeoAccess(profile, user)) {
      path = uid ? [uid] : [];
    } else {
      path = normalizeCeoPath([], [rootUid, parentUid, uid]);
    }
  }
  if (uid && !path.includes(uid)) path = uniqueStringList([...path, uid]);
  return {
    uid,
    name,
    parentUid,
    rootUid: rootUid || uid,
    rootName: String(profile?.ceoRootName || profile?.rootCeoName || name).trim() || name,
    path,
    isRoot: !parentUid || hasGlobalCeoAccess(profile, user)
  };
}
