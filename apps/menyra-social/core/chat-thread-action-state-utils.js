export function normalizeChatOpenProfileCore({
  profile,
  normalizeHandle
} = {}) {
  if (!profile) return null;
  const toHandle = typeof normalizeHandle === "function"
    ? normalizeHandle
    : ((value) => String(value || "").trim());
  return {
    uid: profile.uid || "",
    restaurantId: profile.restaurantId || "",
    handle: String(profile.handle || toHandle(profile.name || "user")).replace(/^@/, ""),
    name: profile.name || "User",
    avatar: profile.avatar || ""
  };
}

export function buildChatModalStateOnOpenCore({
  currentChatModal = {},
  nextProfile = null,
  nextMessages = [],
  getChatThreadId
} = {}) {
  const readThreadId = typeof getChatThreadId === "function" ? getChatThreadId : (() => "");
  const sameThread = !!currentChatModal?.open
    && readThreadId(currentChatModal?.profile) === readThreadId(nextProfile);
  return {
    open: true,
    profile: nextProfile,
    messages: Array.isArray(nextMessages) ? nextMessages : [],
    draft: sameThread ? (currentChatModal?.draft || "") : "",
    attachments: sameThread ? (currentChatModal?.attachments || []) : []
  };
}

export function buildClosedChatModalStateCore(currentChatModal = {}) {
  return {
    ...currentChatModal,
    open: false,
    profile: null,
    messages: [],
    draft: "",
    attachments: []
  };
}

export function buildFallbackChatThreadProfileCore(threadId = "") {
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeThreadId) return null;
  return {
    id: safeThreadId,
    uid: safeThreadId,
    handle: safeThreadId,
    name: safeThreadId
  };
}

export function getSafeChatThreadIdFromThreadCore({
  thread = null,
  threadId = ""
} = {}) {
  return String(thread?.id || threadId || "").replace(/^@/, "").trim();
}

export function shouldCloseChatModalForThreadCore({
  chatModal = {},
  safeThreadId = "",
  getChatThreadId
} = {}) {
  if (!chatModal?.open || !safeThreadId) return false;
  const readThreadId = typeof getChatThreadId === "function" ? getChatThreadId : (() => "");
  return readThreadId(chatModal.profile) === safeThreadId;
}

export function filterChatThreadsAfterDeleteCore({
  threads = [],
  threadId = ""
} = {}) {
  const safeThreadId = String(threadId || "").replace(/^@/, "").trim();
  if (!safeThreadId) return Array.isArray(threads) ? threads.slice() : [];
  return (Array.isArray(threads) ? threads : [])
    .filter((item) => String(item?.id || "") !== safeThreadId);
}
