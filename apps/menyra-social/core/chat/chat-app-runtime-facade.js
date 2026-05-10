import { createChatRuntimeCluster } from "./chat-runtime-cluster.js";
import {
  captureChatInputFocusStateCore,
  restoreChatInputFocusStateCore,
  scrollChatMessagesToBottomCore,
  autosizeTextareaCore
} from "./chat-dom-utils.js";

const CHAT_MESSAGE_TTL_MS = 24 * 60 * 60 * 1000;
const CHAT_ATTACHMENT_INLINE_MAX_BYTES = 250000;
const CHAT_IMAGE_PREVIEW_COMPRESSION_STEPS = Object.freeze([
  Object.freeze({ maxSize: 1600, quality: 0.82 }),
  Object.freeze({ maxSize: 1280, quality: 0.76 }),
  Object.freeze({ maxSize: 1080, quality: 0.7 }),
  Object.freeze({ maxSize: 900, quality: 0.62 }),
  Object.freeze({ maxSize: 760, quality: 0.56 }),
  Object.freeze({ maxSize: 640, quality: 0.5 })
]);
const CHAT_MESSAGE_READ_LIMIT = 30;

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

export function createChatAppRuntimeFacade({
  stateDeps = {},
  constants = {},
  firebaseApi = {},
  renderApi = {},
  followApi = {},
  stateApi = {},
  uiApi = {},
  browserApi = {},
  traceApi = {}
} = {}) {
  const state = stateDeps.state || {};
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
  const startSocialBudgetTrace = resolveFunction(traceApi.startSocialBudgetTraceFn, () => {});
  const finishSocialBudgetTrace = resolveFunction(traceApi.finishSocialBudgetTraceFn, () => {});

  const controller = createChatRuntimeCluster({
    stateDeps,
    constants: {
      STORAGE_KEYS: constants.STORAGE_KEYS,
      toDateSafe: constants.toDateSafe,
      normalizeHandle: constants.normalizeHandle,
      normalizeFollowHandle: constants.normalizeFollowHandle,
      compressImage: constants.compressImage,
      CHAT_ATTACHMENT_INLINE_MAX_BYTES,
      CHAT_MESSAGE_TTL_MS,
      CHAT_IMAGE_PREVIEW_COMPRESSION_STEPS,
      CHAT_MESSAGE_READ_LIMIT
    },
    firebaseApi,
    renderApi,
    followApi,
    stateApi: {
      ...stateApi,
      getDocumentObj,
      getWindowObj
    },
    uiApi: {
      ...uiApi,
      queueMicrotaskFn,
      setTimeoutFn
    }
  });

  function getController() {
    return controller;
  }

  function captureChatInputFocusState() {
    return captureChatInputFocusStateCore({
      documentObj: getDocumentObj(),
      inputId: "chatMessageInput"
    });
  }

  function restoreChatInputFocusState(focusState) {
    restoreChatInputFocusStateCore({
      focusState,
      canRestore: state.activeTab === "chat" && !!state.chatModal?.open && !!state.chatModal?.profile,
      documentObj: getDocumentObj(),
      queueMicrotaskFn,
      inputId: "chatMessageInput",
      maxHeight: 112
    });
  }

  function scrollChatMessagesToBottom() {
    return scrollChatMessagesToBottomCore({
      documentObj: getDocumentObj(),
      windowObj: getWindowObj(),
      queueMicrotaskFn,
      containerId: "chatMessages"
    });
  }

  function autosizeTextarea(el, { minHeight = 56, maxHeight = 160 } = {}) {
    autosizeTextareaCore(el, { minHeight, maxHeight });
  }

  async function sendChatMessage(...args) {
    startSocialBudgetTrace("chat_send");
    try {
      return await controller.sendChatMessage(...args);
    } finally {
      finishSocialBudgetTrace("chat_send");
    }
  }

  return {
    getController,
    captureChatInputFocusState,
    restoreChatInputFocusState,
    scrollChatMessagesToBottom,
    autosizeTextarea,
    saveChatThreadIndex: (threads) => controller.saveChatThreadIndex(threads),
    readChatThreadIndexList: (key) => controller.readChatThreadIndexList(key),
    buildChatThreadSummaryFromMessages: (threadId, value, fallback = {}) => (
      controller.buildChatThreadSummaryFromMessages(threadId, value, fallback)
    ),
    rebuildLegacyChatThreadIndexFromStorage: () => controller.rebuildLegacyChatThreadIndexFromStorage(),
    mergeChatThreadLists: (...lists) => controller.mergeChatThreadLists(...lists),
    loadChatThreadIndex: (uid = state.user?.uid || "") => controller.loadChatThreadIndex(uid),
    sortChatThreads: (threads) => controller.sortChatThreads(threads),
    rebuildChatThreadIndexFromStorage: (uid = state.user?.uid || "") => controller.rebuildChatThreadIndexFromStorage(uid),
    getChatUnreadCount: () => controller.getChatUnreadCount(),
    upsertChatThread: (profile, patch = {}) => controller.upsertChatThread(profile, patch),
    isChatThreadArchived: (thread) => controller.isChatThreadArchived(thread),
    getChatThreadById: (threadId) => controller.getChatThreadById(threadId),
    setChatThreadArchivedById: async (threadId, archived = true) => controller.setChatThreadArchivedById(threadId, archived),
    deleteChatThreadById: async (threadId) => controller.deleteChatThreadById(threadId),
    getActiveChatThreadSummary: (profile = state.chatModal?.profile) => controller.getActiveChatThreadSummary(profile),
    isActiveChatThreadBlocked: (profile = state.chatModal?.profile) => controller.isActiveChatThreadBlocked(profile),
    getChatThreadId: (profile = state.chatModal?.profile) => controller.getChatThreadId(profile),
    chatThreadStorageKey: (profile = state.chatModal?.profile) => controller.chatThreadStorageKey(profile),
    chatThreadDocRef: (ownerUid, threadId) => controller.chatThreadDocRef(ownerUid, threadId),
    chatMessageDocRef: (ownerUid, threadId, messageId) => controller.chatMessageDocRef(ownerUid, threadId, messageId),
    chatMessagesCollectionRef: (ownerUid, threadId) => controller.chatMessagesCollectionRef(ownerUid, threadId),
    normalizeChatThreadSummary: (threadId, data = {}, fallback = {}) => controller.normalizeChatThreadSummary(threadId, data, fallback),
    getCurrentChatSenderProfile: () => controller.getCurrentChatSenderProfile(),
    getStringByteSize: (value) => controller.getStringByteSize(value),
    isChatInlineDataUrl: (dataUrl) => controller.isChatInlineDataUrl(dataUrl),
    sanitizeChatAttachmentsForSync: (attachments) => controller.sanitizeChatAttachmentsForSync(attachments),
    normalizeChatMessageRecord: (messageId, data = {}, localMap = new Map()) => controller.normalizeChatMessageRecord(messageId, data, localMap),
    getChatMessageTimestamp: (message) => controller.getChatMessageTimestamp(message),
    pruneChatMessages: (messages) => controller.pruneChatMessages(messages),
    buildChatPreviewText: (message) => controller.buildChatPreviewText(message),
    loadLegacyChatThreadMessages: (threadId) => controller.loadLegacyChatThreadMessages(threadId),
    readFileAsDataUrl: async (file) => controller.readFileAsDataUrl(file),
    buildInlineChatAttachment: async (file, isImage = false) => controller.buildInlineChatAttachment(file, isImage),
    loadChatThreadMessages: (profile) => controller.loadChatThreadMessages(profile),
    saveChatThreadMessages: (profile, messages) => controller.saveChatThreadMessages(profile, messages),
    stopChatThreadsListener: () => controller.stopChatThreadsListener(),
    stopActiveChatMessagesListener: () => controller.stopActiveChatMessagesListener(),
    syncLocalChatThreadsFromRemote: (remoteThreads, ownerUid = state.user?.uid || "") => controller.syncLocalChatThreadsFromRemote(remoteThreads, ownerUid),
    startChatThreadsListener: (user = state.user) => controller.startChatThreadsListener(user),
    syncRemoteChatReadState: async (profile, messages = state.chatModal?.messages || []) => controller.syncRemoteChatReadState(profile, messages),
    startActiveChatMessagesListener: (profile = state.chatModal?.profile) => controller.startActiveChatMessagesListener(profile),
    persistCurrentChatMessagePatch: async (messageId, patch = {}) => controller.persistCurrentChatMessagePatch(messageId, patch),
    syncChatMessageToRemote: async (message, partnerProfile = state.chatModal?.profile) => controller.syncChatMessageToRemote(message, partnerProfile),
    syncChatThreadSummary: (profile, messages) => controller.syncChatThreadSummary(profile, messages),
    markChatThreadAsRead: (profile, messages = null) => controller.markChatThreadAsRead(profile, messages),
    updateCurrentChatMessages: (updater) => controller.updateCurrentChatMessages(updater),
    addChatAttachments: async (fileList) => controller.addChatAttachments(fileList),
    removePendingChatAttachment: (attachmentId) => controller.removePendingChatAttachment(attachmentId),
    toggleChatMessageSaved: (messageId) => controller.toggleChatMessageSaved(messageId),
    toggleChatMessageLiked: (messageId) => controller.toggleChatMessageLiked(messageId),
    sendChatMessage,
    hasPendingFollowRequest: async (targetUid) => controller.hasPendingFollowRequest(targetUid),
    sendFollowRequest: async (handle, target = {}) => controller.sendFollowRequest(handle, target),
    acceptFollowRequest: async (notificationId) => controller.acceptFollowRequest(notificationId),
    markNotificationRead: async (id) => controller.markNotificationRead(id),
    markAllNotificationsRead: async () => controller.markAllNotificationsRead(),
    normalizeUserPostDoc: (postId, data, ownerId) => controller.normalizeUserPostDoc(postId, data, ownerId),
    normalizeRestaurantPostDoc: (postId, data, restaurantId) => controller.normalizeRestaurantPostDoc(postId, data, restaurantId),
    fetchPostForNotification: async (notif) => controller.fetchPostForNotification(notif),
    highlightCommentInModal: (commentId) => controller.highlightCommentInModal(commentId),
    openPostFromNotification: async (notif) => controller.openPostFromNotification(notif),
    openNotificationTarget: async (id) => controller.openNotificationTarget(id),
    resolveUserByHandle: async (handle) => controller.resolveUserByHandle(handle),
    toggleFollow: async (handle, target = {}) => controller.toggleFollow(handle, target)
  };
}
