export function getStringByteSizeCore(value) {
  const text = String(value || "");
  try {
    return new TextEncoder().encode(text).length;
  } catch {
    return text.length;
  }
}

export function isChatInlineDataUrlCore({
  dataUrl,
  getStringByteSize,
  maxInlineBytes = 0
} = {}) {
  const safeDataUrl = String(dataUrl || "");
  if (!safeDataUrl) return false;
  const readByteSize = typeof getStringByteSize === "function"
    ? getStringByteSize
    : getStringByteSizeCore;
  return readByteSize(safeDataUrl) <= maxInlineBytes;
}

export function sanitizeChatAttachmentsForSyncCore({
  attachments,
  isChatInlineDataUrl,
  maxAttachments = 4
} = {}) {
  const readInline = typeof isChatInlineDataUrl === "function"
    ? isChatInlineDataUrl
    : (() => false);
  const limit = Math.max(1, Number(maxAttachments) || 4);
  return (Array.isArray(attachments) ? attachments : []).slice(0, limit).map((attachment, index) => {
    const rawDataUrl = String(attachment?.dataUrl || "");
    const inlineDataUrl = readInline(rawDataUrl) ? rawDataUrl : "";
    return {
      id: String(attachment?.id || `att_${index}`).trim() || `att_${index}`,
      name: String(attachment?.name || "Datei").trim() || "Datei",
      mime: String(attachment?.mime || "application/octet-stream").trim() || "application/octet-stream",
      kind: String(attachment?.kind || "file").trim() || "file",
      dataUrl: inlineDataUrl,
      size: Math.max(0, Number(attachment?.size || 0) || 0),
      oversize: !!attachment?.oversize || (!inlineDataUrl && !!rawDataUrl)
    };
  });
}

export function normalizeChatDeliveryStatusCore(status = "", fallback = "sent") {
  const normalizedFallback = String(fallback || "").trim().toLowerCase() === "failed"
    ? "failed"
    : (String(fallback || "").trim().toLowerCase() === "pending" ? "pending" : "sent");
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "pending" || normalized === "failed" || normalized === "sent") {
    return normalized;
  }
  return normalizedFallback;
}

export function normalizeChatMessageRecordCore({
  messageId,
  data = {},
  localMap = new Map(),
  isChatInlineDataUrl,
  maxAttachments = 4
} = {}) {
  const safeMessageId = String(messageId || "").trim();
  if (!safeMessageId) return null;
  const source = data && typeof data === "object" ? data : {};
  const local = typeof localMap?.get === "function" ? (localMap.get(safeMessageId) || {}) : {};
  const sourceAttachments = Array.isArray(source.attachments) ? source.attachments : [];
  const localAttachments = Array.isArray(local.attachments) ? local.attachments : [];
  const localAttachmentMap = new Map(localAttachments.map((attachment) => [String(attachment?.id || "").trim(), attachment]));
  const readInline = typeof isChatInlineDataUrl === "function"
    ? isChatInlineDataUrl
    : (() => false);
  const limit = Math.max(1, Number(maxAttachments) || 4);
  const deliveryStatus = normalizeChatDeliveryStatusCore(
    source.deliveryStatus || source.delivery_state || local.deliveryStatus || "",
    "sent"
  );
  const mergedAttachments = (sourceAttachments.length ? sourceAttachments : localAttachments).slice(0, limit).map((attachment, index) => {
    const safeAttachmentId = String(attachment?.id || `att_${index}`).trim() || `att_${index}`;
    const localAttachment = localAttachmentMap.get(safeAttachmentId) || {};
    const rawDataUrl = String(attachment?.dataUrl || localAttachment?.dataUrl || "");
    const inlineDataUrl = readInline(rawDataUrl) ? rawDataUrl : "";
    return {
      id: safeAttachmentId,
      name: String(attachment?.name || localAttachment?.name || "Datei").trim() || "Datei",
      mime: String(attachment?.mime || localAttachment?.mime || "application/octet-stream").trim() || "application/octet-stream",
      kind: String(attachment?.kind || localAttachment?.kind || "file").trim() || "file",
      dataUrl: inlineDataUrl,
      size: Math.max(0, Number(attachment?.size || localAttachment?.size || 0) || 0),
      oversize: !!attachment?.oversize || !!localAttachment?.oversize || (!inlineDataUrl && !!rawDataUrl)
    };
  });
  return {
    id: safeMessageId,
    from: String(source.from || local.from || "other") === "self" ? "self" : "other",
    text: String(source.text || local.text || ""),
    attachments: mergedAttachments,
    liked: typeof local.liked === "boolean" ? local.liked : !!source.liked,
    saved: typeof local.saved === "boolean" ? local.saved : !!source.saved,
    read: !!source.read,
    createdAt: source.createdAt || source.createdAtClient || local.createdAt || new Date().toISOString(),
    deliveryStatus,
    syncError: deliveryStatus === "failed"
      ? String(source.syncError || local.syncError || "").trim()
      : ""
  };
}

export function loadLegacyChatThreadMessagesCore({
  threadId,
  localStorageObj,
  chatThreadsStorageKey = "",
  pruneChatMessages
} = {}) {
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeThreadId || !localStorageObj || !chatThreadsStorageKey) return [];
  const prune = typeof pruneChatMessages === "function"
    ? pruneChatMessages
    : ((messages) => (Array.isArray(messages) ? messages : []));
  try {
    const legacyKey = `${chatThreadsStorageKey}::${safeThreadId}`;
    const rawThread = localStorageObj.getItem(legacyKey);
    if (rawThread) {
      try {
        const parsedThread = JSON.parse(rawThread);
        if (Array.isArray(parsedThread)) {
          return prune(parsedThread);
        }
        if (parsedThread && typeof parsedThread === "object" && Array.isArray(parsedThread.messages)) {
          return prune(parsedThread.messages);
        }
      } catch {}
    }
    const rawMap = localStorageObj.getItem(chatThreadsStorageKey);
    if (!rawMap) return [];
    const parsedMap = JSON.parse(rawMap);
    const entry = parsedMap && typeof parsedMap === "object" ? parsedMap[safeThreadId] : null;
    if (Array.isArray(entry)) return prune(entry);
    if (entry && typeof entry === "object" && Array.isArray(entry.messages)) {
      return prune(entry.messages);
    }
  } catch {}
  return [];
}

export async function readFileAsDataUrlCore(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("file_read_failed"));
    reader.readAsDataURL(file);
  });
}

export async function buildInlineChatAttachmentCore({
  file,
  isImage = false,
  readFileAsDataUrl,
  isChatInlineDataUrl,
  compressImage,
  compressionSteps = []
} = {}) {
  const source = file || {};
  const safeName = String(source.name || "Datei").trim() || "Datei";
  const safeMime = String(source.type || "application/octet-stream").trim() || "application/octet-stream";
  const safeSize = Math.max(0, Number(source.size || 0) || 0);
  const readDataUrl = typeof readFileAsDataUrl === "function"
    ? readFileAsDataUrl
    : readFileAsDataUrlCore;
  const readInline = typeof isChatInlineDataUrl === "function"
    ? isChatInlineDataUrl
    : (() => false);
  const compress = typeof compressImage === "function" ? compressImage : (async (sourceFile) => sourceFile);

  const readInlineDataUrl = async (candidate) => {
    try {
      const dataUrl = await readDataUrl(candidate);
      return readInline(dataUrl) ? dataUrl : "";
    } catch {
      return "";
    }
  };

  let finalFile = source;
  let dataUrl = await readInlineDataUrl(source);

  if (!dataUrl && isImage) {
    for (const step of Array.isArray(compressionSteps) ? compressionSteps : []) {
      const compressed = await compress(source, step?.maxSize, step?.quality, "image/jpeg");
      const candidateDataUrl = await readInlineDataUrl(compressed);
      if (!candidateDataUrl) continue;
      finalFile = compressed;
      dataUrl = candidateDataUrl;
      break;
    }
  }

  return {
    name: String(finalFile?.name || safeName).trim() || safeName,
    mime: String(finalFile?.type || safeMime).trim() || safeMime,
    size: Math.max(0, Number(finalFile?.size || safeSize) || 0),
    dataUrl,
    oversize: !dataUrl
  };
}

export function loadChatThreadMessagesCore({
  profile,
  chatThreadStorageKey,
  safeStorage,
  pruneChatMessages,
  loadLegacyChatThreadMessages,
  getChatThreadId,
  maxItems = 100
} = {}) {
  const readStorageKey = typeof chatThreadStorageKey === "function" ? chatThreadStorageKey : (() => "");
  const prune = typeof pruneChatMessages === "function"
    ? pruneChatMessages
    : ((messages) => (Array.isArray(messages) ? messages : []));
  const loadLegacy = typeof loadLegacyChatThreadMessages === "function"
    ? loadLegacyChatThreadMessages
    : (() => []);
  const readThreadId = typeof getChatThreadId === "function" ? getChatThreadId : (() => "");
  const limit = Math.max(1, Number(maxItems) || 100);
  const key = readStorageKey(profile);
  if (key) {
    try {
      const raw = safeStorage?.getItem ? safeStorage.getItem(key) : null;
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : [];
        const next = prune(list);
        if (next.length !== list.length && safeStorage?.setItem) {
          safeStorage.setItem(key, JSON.stringify(next.slice(-limit)));
        }
        return next;
      }
    } catch {
      return [];
    }
  }
  const legacyMessages = loadLegacy(readThreadId(profile));
  if (legacyMessages.length && key && safeStorage?.setItem) {
    try {
      safeStorage.setItem(key, JSON.stringify(legacyMessages.slice(-limit)));
    } catch {}
  }
  if (!legacyMessages.length) return [];
  return legacyMessages;
}

export function saveChatThreadMessagesCore({
  profile,
  messages,
  chatThreadStorageKey,
  safeStorage,
  pruneChatMessages,
  maxItems = 100
} = {}) {
  const readStorageKey = typeof chatThreadStorageKey === "function" ? chatThreadStorageKey : (() => "");
  const prune = typeof pruneChatMessages === "function"
    ? pruneChatMessages
    : ((items) => (Array.isArray(items) ? items : []));
  const key = readStorageKey(profile);
  if (!key || !safeStorage?.setItem) return;
  try {
    const limit = Math.max(1, Number(maxItems) || 100);
    const next = prune(messages);
    safeStorage.setItem(key, JSON.stringify(next.slice(-limit)));
  } catch {}
}
