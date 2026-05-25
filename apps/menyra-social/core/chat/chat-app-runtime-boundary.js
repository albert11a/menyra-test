import { isChatEnabledForV1 } from "./chat-v1-guard.js";

function buildChatDisabledResult(action = "chat") {
  return {
    ok: false,
    disabled: true,
    reason: "chat_v1_disabled",
    action
  };
}

function normalizeText(value = "") {
  return String(value || "").trim();
}

function normalizeThreadId(value = "") {
  return String(value || "").replace(/^@/, "").trim();
}

function buildEmptyController(renderDisabledView) {
  return {
    renderChatMessagesPanel: () => "",
    renderChatPendingAttachments: () => "",
    renderChatListPanel: () => renderDisabledView(),
    renderChatView: () => renderDisabledView()
  };
}

function buildUserPostDoc(postId, data = {}, ownerId = "") {
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

function buildRestaurantPostDoc(postId, data = {}, restaurantId = "") {
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
    ownerType: "restaurant",
    ownerId: restaurantId || "",
    restaurantId: restaurantId || data.restaurantId || ""
  };
}

function isElementInstance(el, windowObj, ctorName, tagName = "") {
  if (!el) return false;
  const ctor = windowObj && typeof windowObj[ctorName] === "function" ? windowObj[ctorName] : null;
  if (ctor) return el instanceof ctor;
  return !!tagName && String(el.tagName || "").toUpperCase() === tagName;
}

const ASYNC_DELEGATE_METHODS = new Set([
  "ensureChatRuntime",
  "setChatThreadArchivedById",
  "deleteChatThreadById",
  "readFileAsDataUrl",
  "buildInlineChatAttachment",
  "syncRemoteChatReadState",
  "persistCurrentChatMessagePatch",
  "syncChatMessageToRemote",
  "addChatAttachments",
  "sendChatMessage",
  "hasPendingFollowRequest",
  "sendFollowRequest",
  "acceptFollowRequest",
  "markNotificationRead",
  "markAllNotificationsRead",
  "fetchPostForNotification",
  "openPostFromNotification",
  "openNotificationTarget",
  "resolveUserByHandle",
  "toggleFollow"
]);

export function createChatAppRuntimeBoundary(config = {}) {
  const state = config?.stateDeps?.state || {};
  const safeStorage = config?.stateDeps?.safeStorage || null;
  const chatIndexKey = typeof config?.stateDeps?.chatIndexKey === "function"
    ? config.stateDeps.chatIndexKey
    : ((uid = "") => `chatIndex:${uid || "guest"}`);
  const icon = typeof config?.uiApi?.icon === "function" ? config.uiApi.icon : (() => "");
  const escapeHtml = typeof config?.uiApi?.escapeHtml === "function"
    ? config.uiApi.escapeHtml
    : ((value = "") => String(value || ""));
  const getDocumentObj = typeof config?.stateApi?.getDocumentObj === "function"
    ? config.stateApi.getDocumentObj
    : (() => config?.browserApi?.documentObj || (typeof document === "undefined" ? null : document));
  const getWindowObj = typeof config?.stateApi?.getWindowObj === "function"
    ? config.stateApi.getWindowObj
    : (() => config?.browserApi?.windowObj || (typeof window === "undefined" ? null : window));
  const queueMicrotaskFn = typeof config?.browserApi?.queueMicrotaskFn === "function"
    ? config.browserApi.queueMicrotaskFn
    : ((fn) => Promise.resolve().then(fn));
  let realFacade = null;
  let realFacadePromise = null;

  function renderDisabledView() {
    return `
      <section class="p-6 pb-24">
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 text-center">
          <div class="w-16 h-16 mx-auto mb-5 rounded-[1.8rem] bg-slate-100 text-slate-400 flex items-center justify-center">
            ${icon("message-circle", "w-6 h-6")}
          </div>
          <h2 class="text-xl font-black tracking-tight text-slate-900">${escapeHtml("Chat kommt in V2")}</h2>
          <p class="mt-3 text-sm text-slate-500 leading-6">${escapeHtml("Chat is coming in V2.")}</p>
        </div>
      </section>
    `;
  }

  const disabledController = buildEmptyController(renderDisabledView);

  function ensureRealFacade() {
    if (realFacade) return Promise.resolve(realFacade);
    if (!realFacadePromise) {
      realFacadePromise = import("./chat-app-runtime-lazy-facade.js")
        .then((module) => {
          const createFacade = module?.createChatAppRuntimeLazyFacade;
          if (typeof createFacade !== "function") {
            throw new Error("createChatAppRuntimeLazyFacade unavailable");
          }
          realFacade = createFacade(config);
          return realFacade;
        })
        .catch((err) => {
          realFacadePromise = null;
          console.error(err);
          throw err;
        });
    }
    return realFacadePromise;
  }

  function delegateIfLoaded(methodName, args = [], fallback) {
    const method = typeof realFacade?.[methodName] === "function" ? realFacade[methodName] : null;
    if (method) return method(...args);
    return typeof fallback === "function" ? fallback(...args) : fallback;
  }

  async function delegateAsync(methodName, args = [], fallbackValue = undefined) {
    if (!isChatEnabledForV1() && methodName === "sendChatMessage") {
      return buildChatDisabledResult("chat.send");
    }
    const facade = await ensureRealFacade();
    const method = typeof facade?.[methodName] === "function" ? facade[methodName] : null;
    return method ? await method(...args) : fallbackValue;
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
        try {
          input.focus({ preventScroll: true });
        } catch {
          input.focus();
        }
      });
      return true;
    });
  }

  function scrollChatMessagesToBottom() {
    return delegateIfLoaded("scrollChatMessagesToBottom", [], () => {
      const chatMessages = getDocumentObj()?.getElementById?.("chatMessages") || null;
      if (!chatMessages) return false;
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return true;
    });
  }

  function autosizeTextarea(el, { minHeight = 44, maxHeight = 112 } = {}) {
    return delegateIfLoaded("autosizeTextarea", [el, { minHeight, maxHeight }], () => {
      if (!el || typeof el.style !== "object") return false;
      el.style.height = "auto";
      el.style.height = `${Math.min(Math.max(el.scrollHeight || minHeight, minHeight), maxHeight)}px`;
      return true;
    });
  }

  function chatThreadStorageKey(profile = state.chatModal?.profile) {
    return delegateIfLoaded("chatThreadStorageKey", [profile], () => {
      const uid = normalizeThreadId(profile?.uid || profile?.id || profile?.handle || profile?.name || "");
      return uid ? `mnyraChatThread:${uid}` : "";
    });
  }

  function readChatThreadIndexList(key = "") {
    return delegateIfLoaded("readChatThreadIndexList", [key], () => {
      if (!safeStorage?.getItem || !key) return [];
      try {
        const parsed = JSON.parse(safeStorage.getItem(key) || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    });
  }

  function saveChatThreadIndex(threads = []) {
    return delegateIfLoaded("saveChatThreadIndex", [threads], () => {
      if (!safeStorage?.setItem) return;
      try {
        safeStorage.setItem(chatIndexKey(state.user?.uid || ""), JSON.stringify(Array.isArray(threads) ? threads : []));
      } catch {}
    });
  }

  function highlightCommentInModal(commentId) {
    return delegateIfLoaded("highlightCommentInModal", [commentId], () => {
      const commentsRoot = getDocumentObj()?.getElementById?.("postModalComments") || null;
      const safeId = normalizeText(commentId);
      if (!commentsRoot || !safeId) return false;
      const target = commentsRoot.querySelector(`[data-comment-id="${safeId}"]`);
      if (!target) return false;
      target.classList.add("ring-2", "ring-indigo-300", "bg-indigo-50/70");
      if (typeof target.scrollIntoView === "function") target.scrollIntoView({ behavior: "smooth", block: "center" });
      return true;
    });
  }

  const syncFallbacks = {
    getController: () => (realFacade?.getController?.() || disabledController),
    isChatRuntimeLoaded: () => !!realFacade?.isChatRuntimeLoaded?.(),
    captureChatInputFocusState,
    restoreChatInputFocusState,
    scrollChatMessagesToBottom,
    autosizeTextarea,
    saveChatThreadIndex,
    readChatThreadIndexList,
    buildChatThreadSummaryFromMessages: () => null,
    rebuildLegacyChatThreadIndexFromStorage: () => [],
    mergeChatThreadLists: (...lists) => lists.flat().filter(Boolean),
    loadChatThreadIndex: (uid = state.user?.uid || "") => readChatThreadIndexList(chatIndexKey(uid)),
    sortChatThreads: (threads = []) => (Array.isArray(threads) ? threads : []),
    rebuildChatThreadIndexFromStorage: () => [],
    getChatUnreadCount: () => 0,
    upsertChatThread: () => null,
    isChatThreadArchived: (thread = {}) => !!thread?.archived,
    getChatThreadById: () => null,
    getActiveChatThreadSummary: () => null,
    isActiveChatThreadBlocked: () => false,
    getChatThreadId: (profile = state.chatModal?.profile) => normalizeThreadId(profile?.uid || profile?.id || profile?.handle || ""),
    chatThreadStorageKey,
    chatThreadDocRef: () => null,
    chatMessageDocRef: () => null,
    chatMessagesCollectionRef: () => null,
    normalizeChatThreadSummary: () => null,
    getCurrentChatSenderProfile: () => ({
      uid: normalizeText(state.user?.uid),
      handle: normalizeText(state.userProfile?.handle || state.userProfile?.name || state.user?.displayName || "user").replace(/^@/, ""),
      name: normalizeText(state.userProfile?.name || state.user?.displayName || "User") || "User",
      avatar: normalizeText(state.userProfile?.avatar)
    }),
    getStringByteSize: (value = "") => String(value || "").length,
    isChatInlineDataUrl: () => false,
    sanitizeChatAttachmentsForSync: () => [],
    normalizeChatMessageRecord: () => null,
    getChatMessageTimestamp: (message = {}) => message.createdAt || message.createdAtClient || "",
    pruneChatMessages: (messages = []) => (Array.isArray(messages) ? messages : []),
    buildChatPreviewText: (message = {}) => normalizeText(message?.text || ""),
    loadLegacyChatThreadMessages: () => [],
    loadChatThreadMessages: () => [],
    saveChatThreadMessages: () => {},
    stopChatThreadsListener: () => {},
    stopActiveChatMessagesListener: () => {},
    syncLocalChatThreadsFromRemote: (remoteThreads = []) => (Array.isArray(remoteThreads) ? remoteThreads : []),
    startChatThreadsListener: () => {},
    startActiveChatMessagesListener: () => {},
    syncChatThreadSummary: () => null,
    markChatThreadAsRead: () => {},
    updateCurrentChatMessages: () => {},
    removePendingChatAttachment: () => {},
    toggleChatMessageSaved: () => {},
    toggleChatMessageLiked: () => {},
    normalizeUserPostDoc: buildUserPostDoc,
    normalizeRestaurantPostDoc: buildRestaurantPostDoc,
    highlightCommentInModal
  };

  return new Proxy({}, {
    get(_target, prop) {
      const methodName = String(prop || "");
      if (methodName in syncFallbacks) {
        return (...args) => delegateIfLoaded(methodName, args, syncFallbacks[methodName]);
      }
      if (ASYNC_DELEGATE_METHODS.has(methodName)) {
        return (...args) => delegateAsync(methodName, args);
      }
      return (...args) => delegateIfLoaded(methodName, args, undefined);
    }
  });
}
