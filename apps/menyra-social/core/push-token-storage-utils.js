export function getOrCreatePushDeviceIdCore({
  resolvePushDeviceIdKey,
  storage,
  randomUUIDFn,
  nowFn,
  randomFn
} = {}) {
  const readKey = typeof resolvePushDeviceIdKey === "function" ? resolvePushDeviceIdKey : (() => "");
  const key = readKey();
  if (!key || !storage?.getItem || !storage?.setItem) return "";
  let existing = String(storage.getItem(key) || "").trim();
  if (existing) return existing;

  const createUuid = typeof randomUUIDFn === "function" ? randomUUIDFn : null;
  if (createUuid) {
    existing = String(createUuid() || "").trim();
  }
  if (!existing) {
    const readNow = typeof nowFn === "function" ? nowFn : (() => Date.now());
    const readRandom = typeof randomFn === "function" ? randomFn : (() => Math.random());
    existing = `dev_${readNow()}_${readRandom().toString(36).slice(2, 10)}`;
  }
  storage.setItem(key, existing);
  return existing;
}

export function readPushTokenMetaCore({
  uid = "",
  resolvePushTokenMetaKey,
  storage
} = {}) {
  const readKey = typeof resolvePushTokenMetaKey === "function" ? resolvePushTokenMetaKey : (() => "");
  const key = readKey(uid);
  if (!key || !storage?.getItem) return null;
  try {
    const raw = storage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      token: String(parsed.token || "").trim(),
      ts: Math.max(0, Number(parsed.ts || 0) || 0)
    };
  } catch {
    return null;
  }
}

export function writePushTokenMetaCore({
  uid = "",
  token = "",
  resolvePushTokenMetaKey,
  storage,
  nowFn
} = {}) {
  const readKey = typeof resolvePushTokenMetaKey === "function" ? resolvePushTokenMetaKey : (() => "");
  const key = readKey(uid);
  if (!key || !storage?.setItem) return;
  const readNow = typeof nowFn === "function" ? nowFn : (() => Date.now());
  storage.setItem(key, JSON.stringify({
    token: String(token || "").trim(),
    ts: readNow()
  }));
}
