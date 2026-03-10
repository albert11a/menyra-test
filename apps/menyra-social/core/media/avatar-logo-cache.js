export function loadLogoCacheCore({
  safeStorage,
  logoCacheKey,
  isPlaceholderUrl,
  restaurantLogoCache
} = {}) {
  const raw = safeStorage?.getItem?.(logoCacheKey);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return;
    Object.entries(data).forEach(([id, url]) => {
      if (id && url && !isPlaceholderUrl(url)) restaurantLogoCache?.set?.(id, url);
    });
  } catch {}
}

export function scheduleLogoCacheWriteCore({
  windowObj,
  hasPendingTimer = false,
  setPendingTimer,
  safeStorage,
  logoCacheKey,
  restaurantLogoCache,
  delayMs = 400
} = {}) {
  if (!windowObj) return;
  if (hasPendingTimer) return;
  const timer = windowObj.setTimeout(() => {
    setPendingTimer?.(null);
    try {
      const payload = {};
      restaurantLogoCache?.forEach?.((url, id) => {
        if (id && url) payload[id] = url;
      });
      safeStorage?.setItem?.(logoCacheKey, JSON.stringify(payload));
    } catch {}
  }, delayMs);
  setPendingTimer?.(timer);
}

export function loadAvatarCacheCore({
  uid,
  safeStorage,
  avatarKey
} = {}) {
  if (!uid) return "";
  const key = typeof avatarKey === "function" ? avatarKey(uid) : "";
  if (!key) return "";
  const raw = safeStorage?.getItem?.(key);
  if (!raw) return "";
  const trimmed = String(raw || "").trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return "";
  return trimmed;
}

export function scheduleAvatarCacheWriteCore({
  windowObj,
  url,
  uid,
  isPlaceholderUrl,
  hasPendingTimer = false,
  setPendingTimer,
  safeStorage,
  avatarKey,
  onPersist,
  delayMs = 300
} = {}) {
  if (!windowObj) return;
  if (!url || isPlaceholderUrl?.(url)) return;
  if (!uid) return;
  if (hasPendingTimer) return;
  const key = typeof avatarKey === "function" ? avatarKey(uid) : "";
  if (!key) return;
  const timer = windowObj.setTimeout(() => {
    setPendingTimer?.(null);
    safeStorage?.setItem?.(key, url);
    onPersist?.(uid, url);
  }, delayMs);
  setPendingTimer?.(timer);
}

export function resolveRestaurantLogoCore({
  restaurantId,
  raw,
  size = "avatar",
  allowCacheFallback = true,
  getOptimizedImageUrl,
  isPlaceholderUrl,
  restaurantLogoCache,
  onCacheUpdated
} = {}) {
  const url = getOptimizedImageUrl(raw, size);
  if (restaurantId) {
    if (!isPlaceholderUrl(url)) {
      if (restaurantLogoCache?.get?.(restaurantId) !== url) {
        restaurantLogoCache?.set?.(restaurantId, url);
        onCacheUpdated?.();
      }
      return url;
    }
    if (allowCacheFallback !== false) {
      const cached = restaurantLogoCache?.get?.(restaurantId);
      if (cached) return cached;
    }
  }
  return url;
}

export function resolveUserAvatarCore({
  raw,
  userPhotoURL = "",
  userAvatarCache = "",
  getOptimizedImageUrl,
  isPlaceholderUrl
} = {}) {
  const candidate = raw || userPhotoURL || "";
  const url = getOptimizedImageUrl(candidate, "avatar");
  if (!isPlaceholderUrl(url)) {
    return {
      url,
      nextUserAvatarCache: url,
      shouldScheduleWrite: true
    };
  }
  if (userAvatarCache && !isPlaceholderUrl(userAvatarCache)) {
    return {
      url: userAvatarCache,
      nextUserAvatarCache: userAvatarCache,
      shouldScheduleWrite: false
    };
  }
  return {
    url: getOptimizedImageUrl("", "avatar"),
    nextUserAvatarCache: "",
    shouldScheduleWrite: false
  };
}

export function resolveShellAvatarUrlCore({
  profileAvatar = "",
  userPhotoURL = "",
  userAvatarCache = "",
  lastShellAvatarUrl = "",
  getOptimizedImageUrl,
  isPlaceholderUrl,
  placeholderImage
} = {}) {
  const raw = profileAvatar || userPhotoURL || userAvatarCache || "";
  const resolved = getOptimizedImageUrl(raw, "avatar");
  if (!isPlaceholderUrl(resolved)) {
    return {
      url: resolved,
      nextUserAvatarCache: resolved,
      nextLastShellAvatarUrl: resolved,
      shouldScheduleWrite: true
    };
  }
  if (lastShellAvatarUrl && !isPlaceholderUrl(lastShellAvatarUrl)) {
    return {
      url: lastShellAvatarUrl,
      nextUserAvatarCache: userAvatarCache,
      nextLastShellAvatarUrl: lastShellAvatarUrl,
      shouldScheduleWrite: false
    };
  }
  return {
    url: placeholderImage,
    nextUserAvatarCache: userAvatarCache,
    nextLastShellAvatarUrl: lastShellAvatarUrl,
    shouldScheduleWrite: false
  };
}
