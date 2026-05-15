import { isChatEnabledForV1 } from "./chat-v1-guard.js";

const CHAT_MESSAGE_TTL_MS = 24 * 60 * 60 * 1000;
const CHAT_ATTACHMENT_INLINE_MAX_BYTES = 250000;

function defaultQueueMicrotask(fn) {
  if (typeof fn !== "function") return;
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
    return;
  }
  Promise.resolve().then(fn);
}

function defaultSetTimeout(fn, ms) {
  if (typeof setTimeout === "function") return setTimeout(fn, ms);
  if (typeof fn === "function") fn();
  return 0;
}

function resolveFunction(value, fallback) {
  return typeof value === "function" ? value : fallback;
}

function normalizeThreadId(value = "") {
  return String(value || "").replace(/^@/, "").trim();
}

function getSafeLocalStorage() {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function getElementCtor(windowObj, name, fallbackName = name) {
  if (windowObj && typeof windowObj[name] === "function") return windowObj[name];
  try {
    if (typeof globalThis[fallbackName] === "function") return globalThis[fallbackName];
  } catch {}
  return null;
}

function isElementInstance(el, windowObj, ctorName, tagName = "") {
  if (!el) return false;
  const Ctor = getElementCtor(windowObj, ctorName);
  if (Ctor) return el instanceof Ctor;
  return !!tagName && String(el.tagName || "").toUpperCase() === tagName;
}

function normalizeChatDeliveryStatus(status = "", fallback = "sent") {
  const normalizedFallback = String(fallback || "").trim().toLowerCase() === "failed"
    ? "failed"
    : (String(fallback || "").trim().toLowerCase() === "pending" ? "pending" : "sent");
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "pending" || normalized === "failed" || normalized === "sent") {
    return normalized;
  }
  return normalizedFallback;
}

function markNotificationReadInList({ notifications = [], id = "" } = {}) {
  const safeId = String(id || "").trim();
  const list = Array.isArray(notifications) ? notifications : [];
  if (!safeId) return { nextNotifications: list, changed: false };
  const idx = list.findIndex((item) => String(item?.id || "") === safeId);
  if (idx < 0 || list[idx]?.read) return { nextNotifications: list, changed: false };
  const next = list.slice();
  next[idx] = { ...(next[idx] || {}), read: true };
  return { nextNotifications: next, changed: true };
}

function markAllNotificationsReadInList({ notifications = [] } = {}) {
  const list = Array.isArray(notifications) ? notifications : [];
  const unread = list.filter((item) => !item?.read);
  if (!unread.length) {
    return { nextNotifications: list, unreadIds: [], changed: false };
  }
  return {
    nextNotifications: list.map((item) => ({ ...(item || {}), read: true })),
    unreadIds: unread.map((item) => String(item?.id || "").trim()).filter(Boolean),
    changed: true
  };
}

function buildNotificationChatTarget(notif = {}) {
  return {
    uid: notif?.userUid || "",
    handle: notif?.userHandle || notif?.user || "",
    name: notif?.user || "User",
    avatar: notif?.img || ""
  };
}

function buildNotificationProfileTarget(notif = {}) {
  return {
    uid: notif?.userUid || "",
    handle: notif?.userHandle || notif?.user || "",
    name: notif?.user || "User",
    avatar: notif?.img || ""
  };
}

function buildFollowAcceptedFollowingState({
  notif = {},
  followingHandles = [],
  followingTargetIds = [],
  normalizeFollowHandle
} = {}) {
  const normalizeHandle = typeof normalizeFollowHandle === "function"
    ? normalizeFollowHandle
    : ((value) => String(value || "").trim());
  const acceptedHandle = normalizeHandle(notif?.userHandle || "");
  const acceptedUid = String(notif?.userUid || "").trim();
  return {
    handles: acceptedHandle
      ? [acceptedHandle, ...(Array.isArray(followingHandles) ? followingHandles : [])]
      : (Array.isArray(followingHandles) ? followingHandles : []),
    targetIds: [
      acceptedUid,
      ...(Array.isArray(followingTargetIds) ? followingTargetIds : [])
    ]
  };
}

function normalizeUserPostDoc(postId, data = {}, ownerId = "") {
  return {
    id: postId,
    url: data.url || "",
    type: data.type || "square",
    title: data.title || "",
    caption: data.caption || "",
    createdAt: data.createdAt,
    likes: data.likesCount ?? data.likes ?? 0,
    comments: data.commentsCount ?? data.comments ?? 0,
    isVideo: !!data.isVideo,
    ownerType: "user",
    ownerId: ownerId || ""
  };
}

function normalizeRestaurantPostDoc(postId, data = {}, restaurantId = "") {
  return {
    id: postId,
    url: data.media?.[0]?.url || data.mediaUrl || "",
    type: data.type || "square",
    title: data.title || "",
    caption: data.caption || "",
    createdAt: data.createdAt,
    likes: data.likesCount ?? data.likes ?? 0,
    comments: data.commentsCount ?? data.comments ?? 0,
    isVideo: data.media?.[0]?.type === "video",
    ownerType: "restaurant",
    ownerId: restaurantId || "",
    restaurantId: restaurantId || ""
  };
}

export function createChatAppRuntimeLazyFacade({
  stateDeps = {},
  constants = {},
  firebaseApi = {},
  renderApi = {},
  followApi = {},
  stateApi = {},
  uiApi = {},
  browserApi = {},
  traceApi = {},
  errorApi = {}
} = {}) {
  const state = stateDeps.state || {};
  const safeStorage = stateDeps.safeStorage || {};
  const chatIndexKey = typeof stateDeps.chatIndexKey === "function"
    ? stateDeps.chatIndexKey
    : (() => "");
  const STORAGE_KEYS = constants.STORAGE_KEYS || {};
  const toDateSafe = typeof constants.toDateSafe === "function"
    ? constants.toDateSafe
    : ((value) => {
      const date = value instanceof Date ? value : new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    });
  const normalizeHandle = typeof constants.normalizeHandle === "function"
    ? constants.normalizeHandle
    : ((value) => String(value || "").replace(/^@/, "").trim().toLowerCase());
  const normalizeFollowHandle = typeof constants.normalizeFollowHandle === "function"
    ? constants.normalizeFollowHandle
    : normalizeHandle;
  const getDocumentObj = resolveFunction(
    stateApi.getDocumentObj,
    () => browserApi.documentObj || null
  );
  const getWindowObj = resolveFunction(
    stateApi.getWindowObj,
    () => browserApi.windowObj || null
  );
  const queueMicrotaskFn = resolveFunction(
    browserApi.queueMicrotaskFn,
    resolveFunction(uiApi.queueMicrotaskFn, defaultQueueMicrotask)
  );
  const setTimeoutFn = resolveFunction(
    browserApi.setTimeoutFn,
    resolveFunction(uiApi.setTimeoutFn, defaultSetTimeout)
  );
  const reportCriticalRuntimeFailure = resolveFunction(
    errorApi.reportCriticalRuntimeFailureFn,
    () => {}
  );

  let realFacade = null;
  let realFacadePromise = null;
  let chatThreadsStartRequest = null;
  let activeMessagesStartRequest = null;

  function reportChatRuntimeFailure(scope = "chat-runtime", err = null) {
    const safeScope = String(scope || "chat-runtime").trim() || "chat-runtime";
    const alreadyReported = !!err?.__mnyraChatRuntimeReported;
    if (!alreadyReported) {
      try {
        reportCriticalRuntimeFailure(safeScope, err || new Error("Chat runtime failed"), { suppressAbort: true });
      } catch {}
      try {
        if (err && typeof err === "object") {
          err.__mnyraChatRuntimeReported = true;
        }
      } catch {}
    }
    try {
      console.error(`[mnyra][${safeScope}]`, err);
    } catch {}
  }

  function getRealMethod(methodName) {
    const method = realFacade?.[methodName];
    return typeof method === "function" ? method : null;
  }

  function isChatRuntimeSurfaceActive() {
    if (!isChatEnabledForV1()) return false;
    return state.activeTab === "chat" || !!state.chatModal?.open || !!state.chatModal?.profile;
  }

  function requestRenderAfterLoad() {
    const render = renderApi.render;
    if (typeof render !== "function") return;
    queueMicrotaskFn(() => render());
  }

  function replayPendingListenerStarts() {
    if (!realFacade) return;
    const currentUid = String(state.user?.uid || "").trim();
    const shouldStartThreads = !!currentUid && isChatRuntimeSurfaceActive();
    const threadRequest = chatThreadsStartRequest;
    if (shouldStartThreads) {
      const threadUser = threadRequest?.uid === currentUid ? threadRequest.user : state.user;
      try {
        realFacade.startChatThreadsListener(threadUser || state.user);
        chatThreadsStartRequest = { uid: currentUid, user: threadUser || state.user };
      } catch (err) {
        reportChatRuntimeFailure("chat.listener.threads", err);
      }
    }

    const currentProfile = state.chatModal?.profile || null;
    const currentThreadId = getChatThreadId(currentProfile);
    const shouldStartMessages = !!state.chatModal?.open && !!currentProfile && !!currentThreadId;
    const messageRequest = activeMessagesStartRequest;
    if (shouldStartMessages) {
      const messageProfile = messageRequest?.threadId === currentThreadId ? messageRequest.profile : currentProfile;
      try {
        realFacade.startActiveChatMessagesListener(messageProfile || currentProfile);
        activeMessagesStartRequest = { threadId: currentThreadId, profile: messageProfile || currentProfile };
      } catch (err) {
        reportChatRuntimeFailure("chat.listener.messages", err);
      }
    }
  }

  async function ensureChatRuntime(scope = "chat-runtime") {
    if (realFacade) return realFacade;
    if (!realFacadePromise) {
      realFacadePromise = import("./chat-app-runtime-facade.js")
        .then((module) => {
          const createChatAppRuntimeFacade = module?.createChatAppRuntimeFacade;
          if (typeof createChatAppRuntimeFacade !== "function") {
            throw new Error("createChatAppRuntimeFacade unavailable");
          }
          realFacade = createChatAppRuntimeFacade({
            stateDeps,
            constants,
            firebaseApi,
            renderApi,
            followApi,
            stateApi,
            uiApi,
            browserApi,
            traceApi
          });
          replayPendingListenerStarts();
          return realFacade;
        })
        .catch((err) => {
          realFacadePromise = null;
          reportChatRuntimeFailure(scope, err);
          throw err;
        });
    }
    return realFacadePromise;
  }

  function queueChatRuntimeLoad(scope = "chat-runtime", { renderAfterLoad = false } = {}) {
    void ensureChatRuntime(scope)
      .then(() => {
        replayPendingListenerStarts();
        if (renderAfterLoad) requestRenderAfterLoad();
      })
      .catch(() => {});
  }

  async function callRealAsync(methodName, args = [], fallbackValue = undefined, scope = `chat.${methodName}`) {
    try {
      const facade = await ensureChatRuntime(scope);
      const method = typeof facade?.[methodName] === "function" ? facade[methodName] : null;
      if (!method) return fallbackValue;
      return await method(...args);
    } catch (err) {
      reportChatRuntimeFailure(scope, err);
      return fallbackValue;
    }
  }

  function delegateIfLoaded(methodName, args = [], fallback) {
    const method = getRealMethod(methodName);
    if (method) return method(...args);
    return typeof fallback === "function" ? fallback() : fallback;
  }

  const fallbackController = {
    renderChatMessagesPanel() {
      if (isChatRuntimeSurfaceActive()) queueChatRuntimeLoad("chat.render.messages", { renderAfterLoad: true });
      return "";
    },
    renderChatPendingAttachments() {
      if (isChatRuntimeSurfaceActive()) queueChatRuntimeLoad("chat.render.attachments", { renderAfterLoad: true });
      return "";
    },
    renderChatListPanel() {
      if (isChatRuntimeSurfaceActive()) {
        startChatThreadsListener(state.user);
        queueChatRuntimeLoad("chat.render.list", { renderAfterLoad: true });
      }
      return "";
    },
    renderChatView() {
      if (isChatRuntimeSurfaceActive()) {
        startChatThreadsListener(state.user);
        if (state.chatModal?.open && state.chatModal?.profile) {
          startActiveChatMessagesListener(state.chatModal.profile);
        }
        queueChatRuntimeLoad("chat.render.view", { renderAfterLoad: true });
      }
      return "";
    }
  };

  function getController() {
    return realFacade?.getController() || fallbackController;
  }

  function captureChatInputFocusState() {
    return delegateIfLoaded("captureChatInputFocusState", [], () => {
      const documentObj = getDocumentObj();
      const windowObj = getWindowObj();
      const active = documentObj?.activeElement || null;
      if (!isElementInstance(active, windowObj, "HTMLTextAreaElement", "TEXTAREA")) return null;
      if (active.id !== "chatMessageInput") return null;
      return {
        selectionStart: typeof active.selectionStart === "number" ? active.selectionStart : null,
        selectionEnd: typeof active.selectionEnd === "number" ? active.selectionEnd : null
      };
    });
  }

  function restoreChatInputFocusState(focusState) {
    return delegateIfLoaded("restoreChatInputFocusState", [focusState], () => {
      if (!focusState || state.activeTab !== "chat" || !state.chatModal?.open || !state.chatModal?.profile) return false;
      const documentObj = getDocumentObj();
      const windowObj = getWindowObj();
      if (!documentObj) return false;
      queueMicrotaskFn(() => {
        const input = documentObj.getElementById("chatMessageInput");
        if (!isElementInstance(input, windowObj, "HTMLTextAreaElement", "TEXTAREA")) return;
        if (input.disabled || input.readOnly) return;
        try {
          input.focus({ preventScroll: true });
        } catch {
          input.focus();
        }
        const len = String(input.value || "").length;
        const rawStart = Number.isFinite(Number(focusState.selectionStart)) ? Number(focusState.selectionStart) : len;
        const rawEnd = Number.isFinite(Number(focusState.selectionEnd)) ? Number(focusState.selectionEnd) : rawStart;
        const start = Math.max(0, Math.min(len, rawStart));
        const end = Math.max(start, Math.min(len, rawEnd));
        try {
          input.setSelectionRange(start, end);
        } catch {}
        input.style.height = "auto";
        input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
      });
      return true;
    });
  }

  function scrollChatMessagesToBottom() {
    return delegateIfLoaded("scrollChatMessagesToBottom", [], () => {
      const documentObj = getDocumentObj();
      const windowObj = getWindowObj();
      const chatMessages = documentObj?.getElementById?.("chatMessages") || null;
      if (!isElementInstance(chatMessages, windowObj, "HTMLElement")) return false;
      const scrollToBottom = () => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      };
      scrollToBottom();
      queueMicrotaskFn(scrollToBottom);
      if (typeof windowObj?.requestAnimationFrame === "function") {
        windowObj.requestAnimationFrame(() => {
          scrollToBottom();
          windowObj.requestAnimationFrame(scrollToBottom);
        });
      }
      chatMessages.querySelectorAll("img,video").forEach((media) => {
        if (!isElementInstance(media, windowObj, "HTMLElement")) return;
        if (media.dataset.chatScrollBound === "true") return;
        media.dataset.chatScrollBound = "true";
        if (isElementInstance(media, windowObj, "HTMLImageElement", "IMG")) {
          if (media.complete) return;
          media.addEventListener("load", scrollToBottom, { once: true });
          media.addEventListener("error", scrollToBottom, { once: true });
          return;
        }
        if (isElementInstance(media, windowObj, "HTMLVideoElement", "VIDEO")) {
          if (media.readyState >= 2) return;
          media.addEventListener("loadeddata", scrollToBottom, { once: true });
          media.addEventListener("error", scrollToBottom, { once: true });
        }
      });
      return true;
    });
  }

  function autosizeTextarea(el, { minHeight = 56, maxHeight = 160 } = {}) {
    return delegateIfLoaded("autosizeTextarea", [el, { minHeight, maxHeight }], () => {
      const windowObj = getWindowObj();
      if (!isElementInstance(el, windowObj, "HTMLTextAreaElement", "TEXTAREA")) return;
      el.style.height = "auto";
      const next = Math.max(minHeight, Math.min(maxHeight, el.scrollHeight || minHeight));
      el.style.height = `${next}px`;
    });
  }

  function saveChatThreadIndex(threads) {
    return delegateIfLoaded("saveChatThreadIndex", [threads], () => {
      const key = chatIndexKey(state.user?.uid || "");
      if (!key || !safeStorage?.setItem) return;
      try {
        const payload = (Array.isArray(threads) ? threads : []).slice(0, 100);
        safeStorage.setItem(key, JSON.stringify(payload));
      } catch {}
    });
  }

  function readChatThreadIndexList(key) {
    return delegateIfLoaded("readChatThreadIndexList", [key], () => {
      if (!key || !safeStorage?.getItem) return [];
      try {
        const raw = safeStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    });
  }

  function sortChatThreads(threads) {
    return delegateIfLoaded("sortChatThreads", [threads], () => (
      (Array.isArray(threads) ? threads.slice() : [])
        .sort((a, b) => (Number(b?.updatedAt || 0) - Number(a?.updatedAt || 0)))
    ));
  }

  function getChatMessageTimestamp(message) {
    return delegateIfLoaded("getChatMessageTimestamp", [message], () => (
      toDateSafe(message?.createdAt)?.getTime() || 0
    ));
  }

  function pruneChatMessages(messages) {
    return delegateIfLoaded("pruneChatMessages", [messages], () => (
      (Array.isArray(messages) ? messages : []).filter((message) => {
        if (!message) return false;
        if (message.saved) return true;
        const createdAt = getChatMessageTimestamp(message);
        if (!createdAt) return false;
        return (Date.now() - createdAt) <= CHAT_MESSAGE_TTL_MS;
      })
    ));
  }

  function buildChatPreviewText(message) {
    return delegateIfLoaded("buildChatPreviewText", [message], () => {
      if (!message) return "";
      const text = String(message.text || "").trim();
      if (text) return text;
      const count = Array.isArray(message.attachments) ? message.attachments.length : 0;
      if (!count) return "Chat";
      return count === 1 ? "1 Anhang" : `${count} Anhaenge`;
    });
  }

  function buildChatThreadSummaryFromMessages(threadId, value, fallback = {}) {
    return delegateIfLoaded("buildChatThreadSummaryFromMessages", [threadId, value, fallback], () => {
      const safeThreadId = normalizeThreadId(threadId);
      if (!safeThreadId) return null;
      const meta = value && typeof value === "object" && !Array.isArray(value) ? value : {};
      const rawMessages = Array.isArray(value)
        ? value
        : (Array.isArray(meta.messages) ? meta.messages : []);
      const messages = pruneChatMessages(rawMessages);
      const lastMessage = messages[messages.length - 1] || null;
      const unreadCount = messages.filter((message) => message?.from !== "self" && !message?.read).length;
      return {
        id: safeThreadId,
        uid: String(meta.uid || fallback.uid || safeThreadId).trim(),
        restaurantId: String(meta.restaurantId || fallback.restaurantId || "").trim(),
        handle: String(meta.handle || fallback.handle || safeThreadId).replace(/^@/, "").trim(),
        name: String(meta.name || fallback.name || safeThreadId).trim() || safeThreadId,
        avatar: String(meta.avatar || fallback.avatar || "").trim(),
        lastMessage: buildChatPreviewText(lastMessage),
        updatedAt: lastMessage ? getChatMessageTimestamp(lastMessage) : Number(meta.updatedAt || fallback.updatedAt || Date.now()),
        unreadCount
      };
    });
  }

  function rebuildLegacyChatThreadIndexFromStorage() {
    return delegateIfLoaded("rebuildLegacyChatThreadIndexFromStorage", [], () => {
      const localStorageObj = getSafeLocalStorage();
      const chatThreadsStorageKey = STORAGE_KEYS.chatThreads;
      const threads = [];
      if (!localStorageObj || !chatThreadsStorageKey) return threads;
      const legacyPrefix = `${chatThreadsStorageKey}::`;
      try {
        const rawMap = localStorageObj.getItem(chatThreadsStorageKey);
        if (rawMap) {
          try {
            const parsedMap = JSON.parse(rawMap);
            if (parsedMap && typeof parsedMap === "object" && !Array.isArray(parsedMap)) {
              Object.entries(parsedMap).forEach(([threadId, value]) => {
                const summary = buildChatThreadSummaryFromMessages(threadId, value);
                if (summary) threads.push(summary);
              });
            }
          } catch {}
        }
        for (let i = 0; i < localStorageObj.length; i += 1) {
          const key = localStorageObj.key(i);
          if (!key || !key.startsWith(legacyPrefix)) continue;
          const suffix = key.slice(legacyPrefix.length).trim();
          if (!suffix || suffix.includes("::")) continue;
          let value = [];
          try {
            const raw = localStorageObj.getItem(key);
            value = raw ? JSON.parse(raw) : [];
          } catch {
            value = [];
          }
          const summary = buildChatThreadSummaryFromMessages(suffix, value);
          if (summary) threads.push(summary);
        }
      } catch {}
      return sortChatThreads(threads);
    });
  }

  function mergeChatThreadLists(...lists) {
    return delegateIfLoaded("mergeChatThreadLists", lists, () => {
      const byId = new Map();
      lists.flat().forEach((thread) => {
        if (!thread || typeof thread !== "object") return;
        const rawId = normalizeThreadId(thread.id || thread.uid || thread.restaurantId || thread.handle || "");
        if (!rawId) return;
        const existing = byId.get(rawId) || {};
        byId.set(rawId, {
          ...existing,
          ...thread,
          id: rawId,
          uid: String(thread.uid || existing.uid || rawId).trim(),
          restaurantId: String(thread.restaurantId || existing.restaurantId || "").trim(),
          handle: String(thread.handle || existing.handle || rawId).replace(/^@/, "").trim(),
          name: String(thread.name || existing.name || rawId).trim() || rawId,
          avatar: String(thread.avatar || existing.avatar || "").trim(),
          lastMessage: String(thread.lastMessage || existing.lastMessage || "").trim(),
          unreadCount: Math.max(0, Number(thread.unreadCount ?? existing.unreadCount ?? 0) || 0),
          blockedByOwner: !!(thread.blockedByOwner ?? existing.blockedByOwner ?? false),
          archivedByOwner: !!(thread.archivedByOwner ?? existing.archivedByOwner ?? false),
          muteUntilMs: Math.max(0, Number(thread.muteUntilMs ?? existing.muteUntilMs ?? 0) || 0),
          updatedAt: Number(thread.updatedAt || existing.updatedAt || 0) || 0
        });
      });
      return sortChatThreads(Array.from(byId.values()));
    });
  }

  function rebuildChatThreadIndexFromStorage(uid = state.user?.uid || "") {
    return delegateIfLoaded("rebuildChatThreadIndexFromStorage", [uid], () => {
      const safeUid = String(uid || "").trim();
      const localStorageObj = getSafeLocalStorage();
      const chatThreadsStorageKey = STORAGE_KEYS.chatThreads;
      if (!safeUid || !localStorageObj || !chatThreadsStorageKey) return [];
      const prefix = `${chatThreadsStorageKey}::${safeUid}::`;
      const threads = [];
      try {
        for (let i = 0; i < localStorageObj.length; i += 1) {
          const key = localStorageObj.key(i);
          if (!key || !key.startsWith(prefix)) continue;
          const threadId = key.slice(prefix.length).trim();
          if (!threadId) continue;
          let messages = [];
          try {
            const raw = localStorageObj.getItem(key);
            const parsed = raw ? JSON.parse(raw) : [];
            messages = pruneChatMessages(Array.isArray(parsed) ? parsed : []);
          } catch {
            messages = [];
          }
          const lastMessage = messages[messages.length - 1] || null;
          const unreadCount = messages.filter((message) => message?.from !== "self" && !message?.read).length;
          threads.push({
            id: threadId,
            uid: threadId,
            restaurantId: "",
            handle: threadId,
            name: threadId,
            avatar: "",
            lastMessage: buildChatPreviewText(lastMessage),
            updatedAt: lastMessage ? getChatMessageTimestamp(lastMessage) : Date.now(),
            unreadCount
          });
        }
      } catch {}
      return sortChatThreads(threads);
    });
  }

  function loadChatThreadIndex(uid = state.user?.uid || "") {
    return delegateIfLoaded("loadChatThreadIndex", [uid], () => {
      const scopedKey = chatIndexKey(uid);
      const scopedIndex = readChatThreadIndexList(scopedKey);
      const legacyIndex = readChatThreadIndexList(STORAGE_KEYS.chatIndex);
      const scopedThreads = rebuildChatThreadIndexFromStorage(uid);
      const legacyThreads = rebuildLegacyChatThreadIndexFromStorage();
      return mergeChatThreadLists(scopedThreads, legacyThreads, legacyIndex, scopedIndex);
    });
  }

  function getChatUnreadCount() {
    return delegateIfLoaded("getChatUnreadCount", [], () => (
      (Array.isArray(state.chatThreads) ? state.chatThreads : []).reduce((sum, thread) => {
        if (thread?.archivedByOwner) return sum;
        const muted = Number(thread?.muteUntilMs || 0) > Date.now();
        if (muted) return sum;
        const count = Number(thread?.unreadCount || 0);
        return sum + (Number.isFinite(count) ? count : 0);
      }, 0)
    ));
  }

  function getChatThreadId(profile = state.chatModal?.profile) {
    return delegateIfLoaded("getChatThreadId", [profile], () => (
      normalizeThreadId(profile?.uid || profile?.restaurantId || profile?.handle || profile?.id || "")
    ));
  }

  function upsertChatThread(profile, patch = {}) {
    return delegateIfLoaded("upsertChatThread", [profile, patch], () => {
      if (!profile) return;
      const threadId = getChatThreadId(profile);
      if (!threadId) return;
      const existing = Array.isArray(state.chatThreads) ? state.chatThreads : [];
      const existingThread = existing.find((item) => String(item?.id || "") === threadId) || null;
      const nextThread = {
        ...(existingThread || {}),
        id: threadId,
        uid: profile.uid || "",
        restaurantId: profile.restaurantId || "",
        handle: String(profile.handle || normalizeHandle(profile.name || "user")).replace(/^@/, ""),
        name: profile.name || "User",
        avatar: profile.avatar || "",
        lastMessage: "",
        unreadCount: Number(existingThread?.unreadCount || 0),
        updatedAt: Date.now(),
        ...patch
      };
      const rest = existing.filter((item) => String(item?.id || "") !== threadId);
      state.chatThreads = sortChatThreads([nextThread, ...rest]);
      saveChatThreadIndex(state.chatThreads);
    });
  }

  function isChatThreadArchived(thread) {
    return delegateIfLoaded("isChatThreadArchived", [thread], () => !!thread?.archivedByOwner);
  }

  function getChatThreadById(threadId) {
    return delegateIfLoaded("getChatThreadById", [threadId], () => {
      const safeId = normalizeThreadId(threadId);
      if (!safeId) return null;
      return (Array.isArray(state.chatThreads) ? state.chatThreads : [])
        .find((thread) => String(thread?.id || "") === safeId) || null;
    });
  }

  function getActiveChatThreadSummary(profile = state.chatModal?.profile) {
    return delegateIfLoaded("getActiveChatThreadSummary", [profile], () => {
      const threadId = getChatThreadId(profile);
      if (!threadId) return null;
      return (Array.isArray(state.chatThreads) ? state.chatThreads : [])
        .find((thread) => String(thread?.id || "") === threadId) || null;
    });
  }

  function isActiveChatThreadBlocked(profile = state.chatModal?.profile) {
    return delegateIfLoaded("isActiveChatThreadBlocked", [profile], () => !!getActiveChatThreadSummary(profile)?.blockedByOwner);
  }

  function chatThreadStorageKey(profile = state.chatModal?.profile) {
    return delegateIfLoaded("chatThreadStorageKey", [profile], () => {
      const threadId = getChatThreadId(profile);
      const ownerUid = String(state.user?.uid || "guest").trim();
      if (!threadId || !ownerUid || !STORAGE_KEYS.chatThreads) return "";
      return `${STORAGE_KEYS.chatThreads}::${ownerUid}::${threadId}`;
    });
  }

  function chatThreadDocRef(ownerUid, threadId) {
    return delegateIfLoaded("chatThreadDocRef", [ownerUid, threadId], () => {
      const safeOwnerUid = String(ownerUid || "").trim();
      const safeThreadId = normalizeThreadId(threadId);
      if (!safeOwnerUid || !safeThreadId || typeof firebaseApi.doc !== "function") return null;
      return firebaseApi.doc(firebaseApi.db, "users", safeOwnerUid, "chatThreads", safeThreadId);
    });
  }

  function chatMessageDocRef(ownerUid, threadId, messageId) {
    return delegateIfLoaded("chatMessageDocRef", [ownerUid, threadId, messageId], () => {
      const safeOwnerUid = String(ownerUid || "").trim();
      const safeThreadId = normalizeThreadId(threadId);
      const safeMessageId = String(messageId || "").trim();
      if (!safeOwnerUid || !safeThreadId || !safeMessageId || typeof firebaseApi.doc !== "function") return null;
      return firebaseApi.doc(firebaseApi.db, "users", safeOwnerUid, "chatThreads", safeThreadId, "messages", safeMessageId);
    });
  }

  function chatMessagesCollectionRef(ownerUid, threadId) {
    return delegateIfLoaded("chatMessagesCollectionRef", [ownerUid, threadId], () => {
      const safeOwnerUid = String(ownerUid || "").trim();
      const safeThreadId = normalizeThreadId(threadId);
      if (!safeOwnerUid || !safeThreadId || typeof firebaseApi.collection !== "function") return null;
      return firebaseApi.collection(firebaseApi.db, "users", safeOwnerUid, "chatThreads", safeThreadId, "messages");
    });
  }

  function normalizeChatThreadSummary(threadId, data = {}, fallback = {}) {
    return delegateIfLoaded("normalizeChatThreadSummary", [threadId, data, fallback], () => {
      const safeThreadId = normalizeThreadId(threadId);
      if (!safeThreadId) return null;
      const source = data && typeof data === "object" ? data : {};
      const fallbackSource = fallback && typeof fallback === "object" ? fallback : {};
      const muteUntil = toDateSafe(source.muteUntil || source.muteUntilAt || source.mutedUntil || source.muteUntilMs)
        || toDateSafe(fallbackSource.muteUntil || fallbackSource.muteUntilAt || fallbackSource.mutedUntil || fallbackSource.muteUntilMs);
      const muteUntilMs = muteUntil?.getTime() || Number(source.muteUntilMs ?? fallbackSource.muteUntilMs ?? 0) || 0;
      const updatedAt = toDateSafe(source.updatedAt || source.updatedAtClient)?.getTime()
        || Number(source.updatedAtMs || fallbackSource.updatedAt || 0)
        || Date.now();
      return {
        id: safeThreadId,
        uid: String(source.uid || fallbackSource.uid || safeThreadId).trim(),
        restaurantId: String(source.restaurantId || fallbackSource.restaurantId || "").trim(),
        handle: String(source.handle || fallbackSource.handle || safeThreadId).replace(/^@/, "").trim(),
        name: String(source.name || fallbackSource.name || safeThreadId).trim() || safeThreadId,
        avatar: String(source.avatar || fallbackSource.avatar || "").trim(),
        lastMessage: String(source.lastMessage || fallbackSource.lastMessage || "").trim(),
        unreadCount: Math.max(0, Number(source.unreadCount ?? fallbackSource.unreadCount ?? 0) || 0),
        blockedByOwner: !!(source.blockedByOwner ?? fallbackSource.blockedByOwner ?? false),
        archivedByOwner: !!(source.archivedByOwner ?? fallbackSource.archivedByOwner ?? false),
        muteUntilMs: Math.max(0, Number(muteUntilMs || 0) || 0),
        updatedAt
      };
    });
  }

  function getCurrentChatSenderProfile() {
    return delegateIfLoaded("getCurrentChatSenderProfile", [], () => {
      const handle = String(state.userProfile?.handle || normalizeHandle(state.userProfile?.name || state.user?.displayName || "user"))
        .replace(/^@/, "")
        .trim();
      return {
        uid: String(state.user?.uid || "").trim(),
        handle,
        name: String(state.userProfile?.name || state.user?.displayName || "User").trim() || "User",
        avatar: String(state.userProfile?.avatar || "").trim()
      };
    });
  }

  function getStringByteSize(value) {
    return delegateIfLoaded("getStringByteSize", [value], () => {
      const text = String(value || "");
      try {
        return new TextEncoder().encode(text).length;
      } catch {
        return text.length;
      }
    });
  }

  function isChatInlineDataUrl(dataUrl) {
    return delegateIfLoaded("isChatInlineDataUrl", [dataUrl], () => {
      const safeDataUrl = String(dataUrl || "");
      if (!safeDataUrl) return false;
      return getStringByteSize(safeDataUrl) <= CHAT_ATTACHMENT_INLINE_MAX_BYTES;
    });
  }

  function sanitizeChatAttachmentsForSync(attachments) {
    return delegateIfLoaded("sanitizeChatAttachmentsForSync", [attachments], () => (
      (Array.isArray(attachments) ? attachments : []).slice(0, 4).map((attachment, index) => {
        const rawDataUrl = String(attachment?.dataUrl || "");
        const inlineDataUrl = isChatInlineDataUrl(rawDataUrl) ? rawDataUrl : "";
        return {
          id: String(attachment?.id || `att_${index}`).trim() || `att_${index}`,
          name: String(attachment?.name || "Datei").trim() || "Datei",
          mime: String(attachment?.mime || "application/octet-stream").trim() || "application/octet-stream",
          kind: String(attachment?.kind || "file").trim() || "file",
          dataUrl: inlineDataUrl,
          size: Math.max(0, Number(attachment?.size || 0) || 0),
          oversize: !!attachment?.oversize || (!inlineDataUrl && !!rawDataUrl)
        };
      })
    ));
  }

  function normalizeChatMessageRecord(messageId, data = {}, localMap = new Map()) {
    return delegateIfLoaded("normalizeChatMessageRecord", [messageId, data, localMap], () => {
      const safeMessageId = String(messageId || "").trim();
      if (!safeMessageId) return null;
      const source = data && typeof data === "object" ? data : {};
      const local = typeof localMap?.get === "function" ? (localMap.get(safeMessageId) || {}) : {};
      const sourceAttachments = Array.isArray(source.attachments) ? source.attachments : [];
      const localAttachments = Array.isArray(local.attachments) ? local.attachments : [];
      const localAttachmentMap = new Map(localAttachments.map((attachment) => [String(attachment?.id || "").trim(), attachment]));
      const deliveryStatus = normalizeChatDeliveryStatus(
        source.deliveryStatus || source.delivery_state || local.deliveryStatus || "",
        "sent"
      );
      const mergedAttachments = (sourceAttachments.length ? sourceAttachments : localAttachments).slice(0, 4).map((attachment, index) => {
        const safeAttachmentId = String(attachment?.id || `att_${index}`).trim() || `att_${index}`;
        const localAttachment = localAttachmentMap.get(safeAttachmentId) || {};
        const rawDataUrl = String(attachment?.dataUrl || localAttachment?.dataUrl || "");
        const inlineDataUrl = isChatInlineDataUrl(rawDataUrl) ? rawDataUrl : "";
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
    });
  }

  function loadLegacyChatThreadMessages(threadId) {
    return delegateIfLoaded("loadLegacyChatThreadMessages", [threadId], () => {
      const safeThreadId = normalizeThreadId(threadId);
      const localStorageObj = getSafeLocalStorage();
      const chatThreadsStorageKey = STORAGE_KEYS.chatThreads;
      if (!safeThreadId || !localStorageObj || !chatThreadsStorageKey) return [];
      try {
        const legacyKey = `${chatThreadsStorageKey}::${safeThreadId}`;
        const rawThread = localStorageObj.getItem(legacyKey);
        if (rawThread) {
          try {
            const parsedThread = JSON.parse(rawThread);
            if (Array.isArray(parsedThread)) return pruneChatMessages(parsedThread);
            if (parsedThread && typeof parsedThread === "object" && Array.isArray(parsedThread.messages)) {
              return pruneChatMessages(parsedThread.messages);
            }
          } catch {}
        }
        const rawMap = localStorageObj.getItem(chatThreadsStorageKey);
        if (!rawMap) return [];
        const parsedMap = JSON.parse(rawMap);
        const entry = parsedMap && typeof parsedMap === "object" ? parsedMap[safeThreadId] : null;
        if (Array.isArray(entry)) return pruneChatMessages(entry);
        if (entry && typeof entry === "object" && Array.isArray(entry.messages)) {
          return pruneChatMessages(entry.messages);
        }
      } catch {}
      return [];
    });
  }

  function loadChatThreadMessages(profile) {
    return delegateIfLoaded("loadChatThreadMessages", [profile], () => {
      const key = chatThreadStorageKey(profile);
      if (key) {
        try {
          const raw = safeStorage?.getItem ? safeStorage.getItem(key) : null;
          if (raw !== null) {
            const parsed = JSON.parse(raw);
            const list = Array.isArray(parsed) ? parsed : [];
            const next = pruneChatMessages(list);
            if (next.length !== list.length && safeStorage?.setItem) {
              safeStorage.setItem(key, JSON.stringify(next.slice(-100)));
            }
            return next;
          }
        } catch {
          return [];
        }
      }
      const legacyMessages = loadLegacyChatThreadMessages(getChatThreadId(profile));
      if (legacyMessages.length && key && safeStorage?.setItem) {
        try {
          safeStorage.setItem(key, JSON.stringify(legacyMessages.slice(-100)));
        } catch {}
      }
      return legacyMessages.length ? legacyMessages : [];
    });
  }

  function saveChatThreadMessages(profile, messages) {
    return delegateIfLoaded("saveChatThreadMessages", [profile, messages], () => {
      const key = chatThreadStorageKey(profile);
      if (!key || !safeStorage?.setItem) return;
      try {
        const next = pruneChatMessages(messages);
        safeStorage.setItem(key, JSON.stringify(next.slice(-100)));
      } catch {}
    });
  }

  function syncLocalChatThreadsFromRemote(remoteThreads, ownerUid = state.user?.uid || "") {
    return delegateIfLoaded("syncLocalChatThreadsFromRemote", [remoteThreads, ownerUid], () => {
      const merged = mergeChatThreadLists(
        loadChatThreadIndex(ownerUid),
        state.chatThreads,
        remoteThreads
      );
      state.chatThreads = merged;
      saveChatThreadIndex(merged);
      if (isChatRuntimeSurfaceActive() && typeof renderApi.render === "function") {
        renderApi.render();
        return;
      }
      if (typeof renderApi.updateNotificationBadges === "function") {
        renderApi.updateNotificationBadges();
      }
    });
  }

  function startChatThreadsListener(user = state.user) {
    const ownerUid = String(user?.uid || "").trim();
    if (!ownerUid) return;
    if (!isChatRuntimeSurfaceActive()) return;
    chatThreadsStartRequest = { uid: ownerUid, user };
    const method = getRealMethod("startChatThreadsListener");
    if (method) return method(user);
    queueChatRuntimeLoad("chat.listener.threads");
  }

  function stopChatThreadsListener() {
    chatThreadsStartRequest = null;
    const method = getRealMethod("stopChatThreadsListener");
    if (method) return method();
  }

  function startActiveChatMessagesListener(profile = state.chatModal?.profile) {
    if (!isChatEnabledForV1()) return;
    const threadId = getChatThreadId(profile);
    if (!threadId) return;
    activeMessagesStartRequest = { threadId, profile };
    const method = getRealMethod("startActiveChatMessagesListener");
    if (method) return method(profile);
    queueChatRuntimeLoad("chat.listener.messages", { renderAfterLoad: true });
  }

  function stopActiveChatMessagesListener() {
    activeMessagesStartRequest = null;
    const method = getRealMethod("stopActiveChatMessagesListener");
    if (method) return method();
  }

  function buildChatThreadPatchFromMessages(messages, existingUpdatedAt = 0) {
    const list = pruneChatMessages(messages);
    const lastMessage = list[list.length - 1] || null;
    return {
      list,
      lastMessage: buildChatPreviewText(lastMessage),
      updatedAt: lastMessage
        ? Math.max(getChatMessageTimestamp(lastMessage), Number(existingUpdatedAt || 0))
        : Number(existingUpdatedAt || Date.now())
    };
  }

  function syncChatThreadSummary(profile, messages) {
    return delegateIfLoaded("syncChatThreadSummary", [profile, messages], () => {
      if (!profile) return;
      const threadId = getChatThreadId(profile);
      const existing = (Array.isArray(state.chatThreads) ? state.chatThreads : [])
        .find((item) => String(item?.id || "") === threadId) || null;
      const summaryPatch = buildChatThreadPatchFromMessages(messages, Number(existing?.updatedAt || 0));
      upsertChatThread(profile, {
        lastMessage: summaryPatch.lastMessage,
        updatedAt: summaryPatch.updatedAt
      });
    });
  }

  function markChatThreadAsRead(profile, messages = null) {
    return delegateIfLoaded("markChatThreadAsRead", [profile, messages], () => {
      if (!profile) return [];
      const threadId = getChatThreadId(profile);
      const existing = (Array.isArray(state.chatThreads) ? state.chatThreads : [])
        .find((item) => String(item?.id || "") === threadId) || null;
      const currentMessages = pruneChatMessages(Array.isArray(messages) ? messages : loadChatThreadMessages(profile));
      let changed = false;
      const nextMessages = currentMessages.map((message) => {
        if (message?.from !== "self" && !message?.read) {
          changed = true;
          return { ...message, read: true };
        }
        return message;
      });
      if (changed) saveChatThreadMessages(profile, nextMessages);
      const summaryPatch = buildChatThreadPatchFromMessages(nextMessages, Number(existing?.updatedAt || 0));
      upsertChatThread(profile, {
        lastMessage: summaryPatch.lastMessage,
        unreadCount: 0,
        updatedAt: summaryPatch.updatedAt
      });
      return nextMessages;
    });
  }

  function updateCurrentChatMessages(updater) {
    return delegateIfLoaded("updateCurrentChatMessages", [updater], () => {
      if (!state.chatModal?.profile) return;
      const current = pruneChatMessages(state.chatModal.messages || []);
      const nextRaw = typeof updater === "function" ? updater(current) : updater;
      const nextMessages = pruneChatMessages(nextRaw);
      state.chatModal.messages = nextMessages;
      saveChatThreadMessages(state.chatModal.profile, nextMessages);
      syncChatThreadSummary(state.chatModal.profile, nextMessages);
    });
  }

  function removePendingChatAttachment(attachmentId) {
    return delegateIfLoaded("removePendingChatAttachment", [attachmentId], () => {
      const safeId = String(attachmentId || "");
      if (!safeId) return;
      state.chatModal.attachments = (Array.isArray(state.chatModal?.attachments) ? state.chatModal.attachments : [])
        .filter((item) => String(item?.id || "") !== safeId);
      if (typeof renderApi.render === "function") renderApi.render();
    });
  }

  function toggleChatMessageFlag(messageId, flag) {
    const safeId = String(messageId || "");
    if (!safeId) return;
    let nextValue = null;
    updateCurrentChatMessages((messages) => (Array.isArray(messages) ? messages : []).map((message) => {
      if (String(message?.id || "") !== safeId) return message;
      nextValue = !message?.[flag];
      return { ...message, [flag]: nextValue };
    }));
    if (typeof renderApi.render === "function") renderApi.render();
    if (typeof nextValue === "boolean") {
      void persistCurrentChatMessagePatch(safeId, { [flag]: nextValue });
    }
  }

  function toggleChatMessageSaved(messageId) {
    return delegateIfLoaded("toggleChatMessageSaved", [messageId], () => toggleChatMessageFlag(messageId, "saved"));
  }

  function toggleChatMessageLiked(messageId) {
    return delegateIfLoaded("toggleChatMessageLiked", [messageId], () => toggleChatMessageFlag(messageId, "liked"));
  }

  async function markNotificationRead(id) {
    const method = getRealMethod("markNotificationRead");
    if (method) return method(id);
    if (!id) return;
    const local = markNotificationReadInList({ notifications: state.notifications, id });
    if (local.changed) {
      state.notifications = local.nextNotifications;
      if (typeof renderApi.saveNotifications === "function") renderApi.saveNotifications(state.notifications);
      const updated = typeof renderApi.updateNotificationsDom === "function"
        ? renderApi.updateNotificationsDom()
        : false;
      if (!updated && state.activeTab === "notifications" && typeof renderApi.render === "function") {
        renderApi.render();
      }
    }
    if (state.user?.uid && typeof firebaseApi.updateDoc === "function" && typeof firebaseApi.doc === "function") {
      try {
        await firebaseApi.updateDoc(
          firebaseApi.doc(firebaseApi.db, "users", state.user.uid, "notifications", id),
          { read: true }
        );
      } catch (err) {
        try {
          console.error(err);
        } catch {}
      }
    }
  }

  async function markAllNotificationsRead() {
    const method = getRealMethod("markAllNotificationsRead");
    if (method) return method();
    const local = markAllNotificationsReadInList({ notifications: state.notifications });
    if (!local.changed) return;
    state.notifications = local.nextNotifications;
    if (typeof renderApi.saveNotifications === "function") renderApi.saveNotifications(state.notifications);
    const updated = typeof renderApi.updateNotificationsDom === "function"
      ? renderApi.updateNotificationsDom()
      : false;
    if (!updated && state.activeTab === "notifications" && typeof renderApi.render === "function") {
      renderApi.render();
    }
    if (state.user?.uid && typeof firebaseApi.updateDoc === "function" && typeof firebaseApi.doc === "function") {
      await Promise.allSettled(local.unreadIds.map((notifId) => (
        firebaseApi.updateDoc(
          firebaseApi.doc(firebaseApi.db, "users", state.user.uid, "notifications", notifId),
          { read: true }
        )
      )));
    }
  }

  function highlightCommentInModal(commentId) {
    return delegateIfLoaded("highlightCommentInModal", [commentId], () => {
      const documentObj = getDocumentObj();
      if (!documentObj) return false;
      const commentsRoot = documentObj.getElementById("postModalComments");
      if (!commentsRoot) return false;
      const safeId = String(commentId || "");
      if (!safeId) return false;
      const target = commentsRoot.querySelector(`[data-comment-id="${safeId}"]`);
      if (!target) return false;
      target.classList.add("ring-2", "ring-indigo-300", "bg-indigo-50/70");
      if (typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeoutFn(() => {
        target.classList.remove("ring-2", "ring-indigo-300", "bg-indigo-50/70");
      }, 2000);
      return true;
    });
  }

  async function fetchPostForNotification(notif) {
    const method = getRealMethod("fetchPostForNotification");
    if (method) return method(notif);
    const postId = String(notif?.postId || "").trim();
    const ownerType = String(notif?.ownerType || "").trim();
    const ownerId = String(notif?.ownerId || notif?.restaurantId || "").trim();
    if (!postId || typeof firebaseApi.getDoc !== "function" || typeof firebaseApi.doc !== "function") return null;
    try {
      if (ownerType === "user" && ownerId) {
        const snap = await firebaseApi.getDoc(firebaseApi.doc(firebaseApi.db, "users", ownerId, "posts", postId));
        if (snap.exists()) return normalizeUserPostDoc(postId, snap.data() || {}, ownerId);
      }
      if (ownerType === "restaurant" && ownerId) {
        const snap = await firebaseApi.getDoc(firebaseApi.doc(firebaseApi.db, "restaurants", ownerId, "socialPosts", postId));
        if (snap.exists()) return normalizeRestaurantPostDoc(postId, snap.data() || {}, ownerId);
      }
      const feedSnap = await firebaseApi.getDoc(firebaseApi.doc(firebaseApi.db, "socialFeed", postId));
      if (feedSnap.exists()) {
        return typeof followApi.normalizeFeedPost === "function"
          ? followApi.normalizeFeedPost({ id: feedSnap.id, ...feedSnap.data() })
          : { id: feedSnap.id, ...feedSnap.data() };
      }
    } catch (err) {
      try {
        console.error(err);
      } catch {}
    }
    return null;
  }

  async function openPostFromNotification(notif) {
    const method = getRealMethod("openPostFromNotification");
    if (method) return method(notif);
    const postId = String(notif?.postId || "").trim();
    if (!postId) return;
    let post = typeof followApi.findPostById === "function"
      ? followApi.findPostById(postId)
      : null;
    if (!post) {
      post = (Array.isArray(state.feedPosts) ? state.feedPosts : [])
        .find((item) => String(item?.id || "") === postId) || null;
    }
    if (!post) post = await fetchPostForNotification(notif);
    if (!post) {
      if (typeof stateApi.setPendingCommentHighlight === "function") stateApi.setPendingCommentHighlight("");
      return;
    }
    const highlightId = String(notif?.type || "").trim() === "comment"
      ? String(notif?.commentId || "").trim()
      : "";
    if (highlightId && typeof stateApi.setPendingCommentHighlight === "function") {
      stateApi.setPendingCommentHighlight(highlightId);
    }
    if (typeof renderApi.openPostModal === "function") {
      await renderApi.openPostModal(post);
    }
    const pendingCommentHighlight = typeof stateApi.getPendingCommentHighlight === "function"
      ? stateApi.getPendingCommentHighlight()
      : "";
    if (pendingCommentHighlight && highlightCommentInModal(pendingCommentHighlight)) {
      if (typeof stateApi.setPendingCommentHighlight === "function") stateApi.setPendingCommentHighlight("");
    }
  }

  async function openNotificationTarget(id) {
    const notif = (Array.isArray(state.notifications) ? state.notifications : [])
      .find((item) => item?.id === id);
    if (!notif) return;
    void markNotificationRead(id);
    if (notif.type === "follow_accepted") {
      const nextFollowing = buildFollowAcceptedFollowingState({
        notif,
        followingHandles: state.followingHandles,
        followingTargetIds: state.followingTargetIds,
        normalizeFollowHandle: (value) => normalizeFollowHandle(value)
      });
      if (typeof followApi.applyFollowingHandles === "function") {
        followApi.applyFollowingHandles(
          nextFollowing.handles,
          { shouldRender: false, targetIds: nextFollowing.targetIds }
        );
      }
    }
    if (String(notif.type || "").trim() === "chat_message") {
      if (!isChatEnabledForV1()) return;
      if (typeof renderApi.openChatWithProfile === "function") {
        renderApi.openChatWithProfile(buildNotificationChatTarget(notif));
      }
      queueChatRuntimeLoad("chat.notification.target", { renderAfterLoad: true });
      return;
    }
    const type = String(notif.type || "").trim();
    if (type === "follow" || type === "follow_request" || type === "follow_accepted") {
      if (typeof renderApi.openProfileFromUser === "function") {
        renderApi.openProfileFromUser(buildNotificationProfileTarget(notif));
      }
      return;
    }
    if (type === "like" || type === "comment") {
      await openPostFromNotification(notif);
    }
  }

  return {
    getController,
    ensureChatRuntime,
    isChatRuntimeLoaded: () => !!realFacade,
    captureChatInputFocusState,
    restoreChatInputFocusState,
    scrollChatMessagesToBottom,
    autosizeTextarea,
    saveChatThreadIndex,
    readChatThreadIndexList,
    buildChatThreadSummaryFromMessages,
    rebuildLegacyChatThreadIndexFromStorage,
    mergeChatThreadLists,
    loadChatThreadIndex,
    sortChatThreads,
    rebuildChatThreadIndexFromStorage,
    getChatUnreadCount,
    upsertChatThread,
    isChatThreadArchived,
    getChatThreadById,
    setChatThreadArchivedById: async (threadId, archived = true) => callRealAsync("setChatThreadArchivedById", [threadId, archived], undefined, "chat.thread.archive"),
    deleteChatThreadById: async (threadId) => callRealAsync("deleteChatThreadById", [threadId], undefined, "chat.thread.delete"),
    getActiveChatThreadSummary,
    isActiveChatThreadBlocked,
    getChatThreadId,
    chatThreadStorageKey,
    chatThreadDocRef,
    chatMessageDocRef,
    chatMessagesCollectionRef,
    normalizeChatThreadSummary,
    getCurrentChatSenderProfile,
    getStringByteSize,
    isChatInlineDataUrl,
    sanitizeChatAttachmentsForSync,
    normalizeChatMessageRecord,
    getChatMessageTimestamp,
    pruneChatMessages,
    buildChatPreviewText,
    loadLegacyChatThreadMessages,
    readFileAsDataUrl: async (file) => callRealAsync("readFileAsDataUrl", [file], "", "chat.file.read"),
    buildInlineChatAttachment: async (file, isImage = false) => callRealAsync("buildInlineChatAttachment", [file, isImage], {
      name: file?.name || "Datei",
      mime: file?.type || "application/octet-stream",
      size: Math.max(0, Number(file?.size || 0) || 0),
      dataUrl: "",
      oversize: true
    }, "chat.attachment.inline"),
    loadChatThreadMessages,
    saveChatThreadMessages,
    stopChatThreadsListener,
    stopActiveChatMessagesListener,
    syncLocalChatThreadsFromRemote,
    startChatThreadsListener,
    syncRemoteChatReadState: async (profile, messages = state.chatModal?.messages || []) => callRealAsync("syncRemoteChatReadState", [profile, messages], undefined, "chat.read.sync"),
    startActiveChatMessagesListener,
    persistCurrentChatMessagePatch: async (messageId, patch = {}) => callRealAsync("persistCurrentChatMessagePatch", [messageId, patch], undefined, "chat.message.patch"),
    syncChatMessageToRemote: async (message, partnerProfile = state.chatModal?.profile) => callRealAsync("syncChatMessageToRemote", [message, partnerProfile], undefined, "chat.message.remote"),
    syncChatThreadSummary,
    markChatThreadAsRead,
    updateCurrentChatMessages,
    addChatAttachments: async (fileList) => callRealAsync("addChatAttachments", [fileList], undefined, "chat.attachments.add"),
    removePendingChatAttachment,
    toggleChatMessageSaved,
    toggleChatMessageLiked,
    sendChatMessage: async (...args) => callRealAsync("sendChatMessage", args, undefined, "chat.send"),
    hasPendingFollowRequest: async (targetUid) => callRealAsync("hasPendingFollowRequest", [targetUid], false, "chat.follow.pending"),
    sendFollowRequest: async (handle, target = {}) => callRealAsync("sendFollowRequest", [handle, target], undefined, "chat.follow.request"),
    acceptFollowRequest: async (notificationId) => callRealAsync("acceptFollowRequest", [notificationId], undefined, "chat.follow.accept"),
    markNotificationRead,
    markAllNotificationsRead,
    normalizeUserPostDoc: (postId, data, ownerId) => delegateIfLoaded("normalizeUserPostDoc", [postId, data, ownerId], () => normalizeUserPostDoc(postId, data, ownerId)),
    normalizeRestaurantPostDoc: (postId, data, restaurantId) => delegateIfLoaded("normalizeRestaurantPostDoc", [postId, data, restaurantId], () => normalizeRestaurantPostDoc(postId, data, restaurantId)),
    fetchPostForNotification,
    highlightCommentInModal,
    openPostFromNotification,
    openNotificationTarget,
    resolveUserByHandle: async (handle) => callRealAsync("resolveUserByHandle", [handle], null, "chat.follow.resolve"),
    toggleFollow: async (handle, target = {}) => callRealAsync("toggleFollow", [handle, target], undefined, "chat.follow.toggle")
  };
}
