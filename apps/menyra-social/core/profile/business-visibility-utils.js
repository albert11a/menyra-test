export function isRestaurantMarkedDeletedCore(rest = {}, {
  normalizeLeadStatusKeyFn
} = {}) {
  const normalizeLeadStatusKey = typeof normalizeLeadStatusKeyFn === "function"
    ? normalizeLeadStatusKeyFn
    : ((value) => String(value || "").trim());
  if (!rest || typeof rest !== "object") return false;
  if (rest.deleted === true || rest.isDeleted === true || rest.hiddenFromDiscover === true) return true;
  if (rest.deletedAt) return true;
  const statusKey = normalizeLeadStatusKey(rest.status || rest.state || "");
  return statusKey === "deleted";
}

export function forceHiddenEmailLocalPartCore(value = "", {
  normalizeEmailValueFn
} = {}) {
  const normalizeEmailValue = typeof normalizeEmailValueFn === "function"
    ? normalizeEmailValueFn
    : ((raw) => String(raw || "").trim().toLowerCase());
  const email = normalizeEmailValue(value);
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return "";
  return email.slice(0, atIndex);
}

export function isForceHiddenHandleCore(value = "", {
  normalizeHandleFn,
  forceHiddenSocialHandleSet
} = {}) {
  const normalizeHandle = typeof normalizeHandleFn === "function"
    ? normalizeHandleFn
    : ((raw) => String(raw || "").trim().toLowerCase());
  const hiddenHandleSet = forceHiddenSocialHandleSet instanceof Set
    ? forceHiddenSocialHandleSet
    : new Set();
  const key = normalizeHandle(value || "");
  return !!key && hiddenHandleSet.has(key);
}

export function isForceHiddenUidCore(value = "", {
  forceHiddenSocialUidSet
} = {}) {
  const hiddenUidSet = forceHiddenSocialUidSet instanceof Set
    ? forceHiddenSocialUidSet
    : new Set();
  const key = String(value || "").trim();
  return !!key && hiddenUidSet.has(key);
}

export function isForceHiddenEmailCore(value = "", {
  forceHiddenEmailLocalPartFn,
  forceHiddenSocialHandleSet
} = {}) {
  const forceHiddenEmailLocalPart = typeof forceHiddenEmailLocalPartFn === "function"
    ? forceHiddenEmailLocalPartFn
    : forceHiddenEmailLocalPartCore;
  const hiddenHandleSet = forceHiddenSocialHandleSet instanceof Set
    ? forceHiddenSocialHandleSet
    : new Set();
  const localPart = forceHiddenEmailLocalPart(value);
  return !!localPart && hiddenHandleSet.has(localPart);
}

export function isForceHiddenBusinessEntityCore(entity = {}, {
  getRestaurantUidCandidatesFn,
  isForceHiddenUidFn,
  getRestaurantEmailCandidatesFn,
  isForceHiddenEmailFn,
  normalizeHandleFn,
  isForceHiddenHandleFn
} = {}) {
  const getRestaurantUidCandidates = typeof getRestaurantUidCandidatesFn === "function"
    ? getRestaurantUidCandidatesFn
    : (() => []);
  const isForceHiddenUid = typeof isForceHiddenUidFn === "function"
    ? isForceHiddenUidFn
    : (() => false);
  const getRestaurantEmailCandidates = typeof getRestaurantEmailCandidatesFn === "function"
    ? getRestaurantEmailCandidatesFn
    : (() => []);
  const isForceHiddenEmail = typeof isForceHiddenEmailFn === "function"
    ? isForceHiddenEmailFn
    : (() => false);
  const normalizeHandle = typeof normalizeHandleFn === "function"
    ? normalizeHandleFn
    : ((raw) => String(raw || "").trim().toLowerCase());
  const isForceHiddenHandle = typeof isForceHiddenHandleFn === "function"
    ? isForceHiddenHandleFn
    : (() => false);
  if (!entity || typeof entity !== "object") return false;
  if (getRestaurantUidCandidates(entity).some((value) => isForceHiddenUid(value))) return true;
  if (getRestaurantEmailCandidates(entity).some((value) => isForceHiddenEmail(value))) return true;

  const handleCandidates = [
    entity.handle,
    entity.ownerHandle,
    entity.socialHandle,
    entity.userHandle,
    entity.accountHandle,
    entity.username,
    entity.ownerUsername,
    entity.socialUsername,
    entity.createdByHandle
  ].map((value) => normalizeHandle(value || "")).filter(Boolean);

  [entity.id, entity.restaurantId, entity.ownerId].forEach((value) => {
    const key = normalizeHandle(value || "");
    if (key) handleCandidates.push(key);
  });

  [entity.name, entity.restaurantName, entity.displayName, entity.businessName].forEach((value) => {
    const raw = String(value || "").trim();
    if (!raw.startsWith("@")) return;
    const key = normalizeHandle(raw);
    if (key) handleCandidates.push(key);
  });

  return handleCandidates.some((value) => isForceHiddenHandle(value));
}

export function isPublicBusinessRecordCore(rest = {}, {
  isRestaurantMarkedDeletedFn,
  isForceHiddenBusinessEntityFn,
  isPubliclyListedBusinessCategoryFn
} = {}) {
  const isRestaurantMarkedDeleted = typeof isRestaurantMarkedDeletedFn === "function"
    ? isRestaurantMarkedDeletedFn
    : (() => false);
  const isForceHiddenBusinessEntity = typeof isForceHiddenBusinessEntityFn === "function"
    ? isForceHiddenBusinessEntityFn
    : (() => false);
  // Ohne diese Pruefung bleibt es beim alten Verhalten. Wer sie mitgibt,
  // schaltet den Kategoriefilter scharf: oeffentlich stehen dann nur noch die
  // freigegebenen Kategorien und die von Hand freigeschalteten Lokale.
  const isPubliclyListedBusinessCategory = typeof isPubliclyListedBusinessCategoryFn === "function"
    ? isPubliclyListedBusinessCategoryFn
    : (() => true);
  if (!rest || typeof rest !== "object") return false;
  if (isRestaurantMarkedDeleted(rest)) return false;
  if (isForceHiddenBusinessEntity(rest)) return false;
  if (!isPubliclyListedBusinessCategory(rest)) return false;
  return true;
}
