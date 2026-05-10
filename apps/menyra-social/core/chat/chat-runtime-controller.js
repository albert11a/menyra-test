import {
  getChatThreadIdCore,
  chatThreadStorageKeyCore,
  chatThreadDocRefCore,
  chatMessageDocRefCore,
  chatMessagesCollectionRefCore,
  getChatMessageTimestampCore,
  pruneChatMessagesCore,
  buildChatPreviewTextCore
} from "./chat-utils.js";
import {
  saveChatThreadIndexCore,
  readChatThreadIndexListCore,
  buildChatThreadSummaryFromMessagesCore,
  rebuildLegacyChatThreadIndexFromStorageCore,
  mergeChatThreadListsCore,
  loadChatThreadIndexCore,
  sortChatThreadsCore,
  rebuildChatThreadIndexFromStorageCore
} from "./chat-thread-index-utils.js";
import {
  normalizeChatThreadSummaryCore,
  getChatUnreadCountCore,
  upsertChatThreadListCore,
  isChatThreadArchivedCore,
  getChatThreadByIdCore,
  getActiveChatThreadSummaryCore
} from "./chat-thread-state-utils.js";
import {
  getStringByteSizeCore,
  isChatInlineDataUrlCore,
  sanitizeChatAttachmentsForSyncCore,
  normalizeChatMessageRecordCore,
  loadLegacyChatThreadMessagesCore,
  readFileAsDataUrlCore,
  buildInlineChatAttachmentCore,
  loadChatThreadMessagesCore,
  saveChatThreadMessagesCore,
  normalizeChatDeliveryStatusCore
} from "./chat-message-utils.js";
import {
  buildChatThreadPatchFromMessagesCore,
  markIncomingChatMessagesAsReadCore,
  updateChatMessageListCore
} from "./chat-message-state-utils.js";
import {
  buildChatMessageSyncContextCore,
  buildChatRemotePayloadBundleCore,
  buildChatMessageNotificationCore
} from "./chat-remote-sync-utils.js";
import {
  buildChatListenerLocalSeedCore,
  shouldUseChatLocalSeedCore,
  buildChatLocalMessageMapCore,
  buildSortedRemoteChatMessagesCore,
  hasUnreadIncomingRemoteMessagesCore
} from "./chat-read-sync-utils.js";
import {
  shouldIgnoreChatMessagesSnapshotCore,
  resolveChatMessagesAfterSnapshotCore
} from "./chat-message-listener-utils.js";
import {
  collectUnreadIncomingChatMessageIdsCore,
  buildChatUnreadResetPatchCore,
  buildChatMessageReadPatchCore
} from "./chat-remote-read-write-utils.js";
import {
  normalizeRemoteChatReadSyncInputsCore,
  buildRemoteChatReadSyncWriteTasksCore
} from "./chat-remote-read-sync-plan-utils.js";
import {
  renderChatMessagesPanelCore,
  renderChatPendingAttachmentsCore
} from "./chat-render-utils.js";
import { renderChatListPanelCore } from "./chat-list-render-utils.js";
import {
  mapChatThreadDocsToSummariesCore,
  buildMergedChatThreadsFromRemoteCore,
  shouldRenderChatThreadListAfterRemoteSyncCore
} from "./chat-thread-listener-utils.js";
import {
  buildClosedChatModalStateCore,
  buildFallbackChatThreadProfileCore,
  getSafeChatThreadIdFromThreadCore,
  shouldCloseChatModalForThreadCore,
  filterChatThreadsAfterDeleteCore
} from "./chat-thread-action-state-utils.js";
import {
  buildNextChatAttachmentsCore,
  removePendingChatAttachmentCore,
  toggleChatMessageFlagCore,
  createOutgoingChatMessageCore
} from "./chat-compose-utils.js";
import {
  resolveChatSendPayloadCore,
  buildChatSendLocalUpdateCore
} from "./chat-send-flow-utils.js";
import {
  buildFollowRequestDocPayloadCore,
  buildFollowRequestNotificationPayloadCore,
  buildAcceptedFollowRecordPayloadCore,
  buildFollowAcceptedNotificationPayloadCore
} from "../follow/follow-request-payload-utils.js";
import {
  markNotificationReadInListCore,
  markAllNotificationsReadInListCore
} from "../notifications/notification-read-state-utils.js";
import {
  normalizeUserPostDocCore,
  normalizeRestaurantPostDocCore
} from "../feed/post-doc-normalize-utils.js";
import {
  readNotificationPostLookupCore,
  shouldFetchUserNotificationPostCore,
  shouldFetchRestaurantNotificationPostCore
} from "../notifications/post-notification-fetch-utils.js";
import { highlightCommentInModalCore } from "../notifications/notification-comment-highlight-utils.js";
import {
  normalizePendingPostIdCore,
  findPostInLocalSourcesCore,
  resolveNotificationCommentHighlightIdCore
} from "../notifications/post-notification-open-utils.js";
import { buildFollowAcceptedFollowingStateCore } from "../follow/follow-accepted-state-utils.js";
import {
  isChatNotificationTypeCore,
  isFollowNotificationTypeCore,
  isPostNotificationTypeCore,
  buildNotificationChatTargetCore,
  buildNotificationProfileTargetCore
} from "../notifications/notification-target-utils.js";
import {
  buildResolveUserByHandleCandidatesCore,
  deriveFollowTargetIdentityCore,
  isSelfFollowTargetCore
} from "../follow/follow-target-utils.js";

export function createChatRuntimeController(deps = {}) {
  const state = deps.state;
  const safeStorage = deps.safeStorage;
  const STORAGE_KEYS = deps.STORAGE_KEYS || {};
  const chatIndexKey = typeof deps.chatIndexKey === "function"
    ? deps.chatIndexKey
    : (() => "");
  const toDateSafe = typeof deps.toDateSafe === "function"
    ? deps.toDateSafe
    : ((value) => {
      try {
        return value ? new Date(value) : null;
      } catch {
        return null;
      }
    });
  const normalizeHandle = typeof deps.normalizeHandle === "function"
    ? deps.normalizeHandle
    : ((value) => String(value || "").replace(/^@/, "").trim().toLowerCase());
  const normalizeFollowHandle = typeof deps.normalizeFollowHandle === "function"
    ? deps.normalizeFollowHandle
    : ((value) => String(value || "").replace(/^@/, "").trim().toLowerCase());
  const compressImage = typeof deps.compressImage === "function"
    ? deps.compressImage
    : async (source) => source;
  const CHAT_ATTACHMENT_INLINE_MAX_BYTES = Number.isFinite(Number(deps.CHAT_ATTACHMENT_INLINE_MAX_BYTES))
    ? Number(deps.CHAT_ATTACHMENT_INLINE_MAX_BYTES)
    : 350000;
  const CHAT_MESSAGE_TTL_MS = Number.isFinite(Number(deps.CHAT_MESSAGE_TTL_MS))
    ? Number(deps.CHAT_MESSAGE_TTL_MS)
    : 1000 * 60 * 60 * 24 * 14;
  const CHAT_IMAGE_PREVIEW_COMPRESSION_STEPS = Array.isArray(deps.CHAT_IMAGE_PREVIEW_COMPRESSION_STEPS)
    ? deps.CHAT_IMAGE_PREVIEW_COMPRESSION_STEPS
    : [];
  const CHAT_MESSAGE_READ_LIMIT = Number.isFinite(Number(deps.CHAT_MESSAGE_READ_LIMIT))
    ? Number(deps.CHAT_MESSAGE_READ_LIMIT)
    : 120;
  const db = deps.db;
  const collection = typeof deps.collection === "function" ? deps.collection : (() => null);
  const query = typeof deps.query === "function" ? deps.query : (() => null);
  const orderBy = typeof deps.orderBy === "function" ? deps.orderBy : (() => null);
  const where = typeof deps.where === "function" ? deps.where : (() => null);
  const limit = typeof deps.limit === "function" ? deps.limit : (() => null);
  const onSnapshot = typeof deps.onSnapshot === "function" ? deps.onSnapshot : (() => (() => {}));
  const doc = typeof deps.doc === "function" ? deps.doc : (() => null);
  const getDoc = typeof deps.getDoc === "function" ? deps.getDoc : async () => null;
  const getDocs = typeof deps.getDocs === "function" ? deps.getDocs : async () => ({ empty: true, docs: [] });
  const setDoc = typeof deps.setDoc === "function" ? deps.setDoc : async () => {};
  const updateDoc = typeof deps.updateDoc === "function" ? deps.updateDoc : async () => {};
  const deleteDoc = typeof deps.deleteDoc === "function" ? deps.deleteDoc : async () => {};
  const increment = typeof deps.increment === "function" ? deps.increment : ((value) => value);
  const serverTimestamp = typeof deps.serverTimestamp === "function"
    ? deps.serverTimestamp
    : (() => new Date().toISOString());
  const runTransaction = typeof deps.runTransaction === "function"
    ? deps.runTransaction
    : async (_db, txFn) => txFn({ get: async () => ({ exists: () => false, data: () => ({}) }), set: () => {} });
  const currentUserBadge = typeof deps.currentUserBadge === "function"
    ? deps.currentUserBadge
    : (() => ({ name: "", handle: "", uid: "", avatar: "" }));
  const render = typeof deps.render === "function" ? deps.render : (() => {});
  const renderOverlays = typeof deps.renderOverlays === "function" ? deps.renderOverlays : (() => {});
  const updateNotificationBadges = typeof deps.updateNotificationBadges === "function"
    ? deps.updateNotificationBadges
    : (() => {});
  const saveNotifications = typeof deps.saveNotifications === "function"
    ? deps.saveNotifications
    : (() => {});
  const updateNotificationsDom = typeof deps.updateNotificationsDom === "function"
    ? deps.updateNotificationsDom
    : (() => false);
  const openPostModal = typeof deps.openPostModal === "function"
    ? deps.openPostModal
    : async () => {};
  const openChatWithProfile = typeof deps.openChatWithProfile === "function"
    ? deps.openChatWithProfile
    : (() => {});
  const openProfileFromUser = typeof deps.openProfileFromUser === "function"
    ? deps.openProfileFromUser
    : (() => {});
  const openGuestAuthPrompt = typeof deps.openGuestAuthPrompt === "function"
    ? deps.openGuestAuthPrompt
    : (() => false);
  const applyFollowingHandles = typeof deps.applyFollowingHandles === "function"
    ? deps.applyFollowingHandles
    : (() => {});
  const getFollowDocId = typeof deps.getFollowDocId === "function"
    ? deps.getFollowDocId
    : (targetType, targetId, handle) => [targetType, targetId, handle].map((value) => String(value || "")).join("_");
  const isLocalBusinessProfile = typeof deps.isLocalBusinessProfile === "function"
    ? deps.isLocalBusinessProfile
    : (() => false);
  const saveFollowing = typeof deps.saveFollowing === "function" ? deps.saveFollowing : (() => {});
  const businessProfileCache = deps.businessProfileCache instanceof Map ? deps.businessProfileCache : new Map();
  const findPostById = typeof deps.findPostById === "function" ? deps.findPostById : (() => null);
  const normalizeFeedPost = typeof deps.normalizeFeedPost === "function" ? deps.normalizeFeedPost : ((value) => value);
  const pushUserNotification = typeof deps.pushUserNotification === "function"
    ? deps.pushUserNotification
    : async () => {};
  const pushUserNotificationWithId = typeof deps.pushUserNotificationWithId === "function"
    ? deps.pushUserNotificationWithId
    : async () => {};
  const getPendingCommentHighlight = typeof deps.getPendingCommentHighlight === "function"
    ? deps.getPendingCommentHighlight
    : (() => "");
  const setPendingCommentHighlight = typeof deps.setPendingCommentHighlight === "function"
    ? deps.setPendingCommentHighlight
    : (() => {});
  const getLastRenderMode = typeof deps.getLastRenderMode === "function"
    ? deps.getLastRenderMode
    : (() => "");
  const escapeHtml = typeof deps.escapeHtml === "function" ? deps.escapeHtml : (value) => String(value || "");
  const icon = typeof deps.icon === "function" ? deps.icon : (() => "");
  const formatRelative = typeof deps.formatRelative === "function"
    ? deps.formatRelative
    : ((value) => String(value || ""));
  const getOptimizedImageUrl = typeof deps.getOptimizedImageUrl === "function"
    ? deps.getOptimizedImageUrl
    : (value) => String(value || "");
  const getDocumentObj = typeof deps.getDocumentObj === "function"
    ? deps.getDocumentObj
    : (() => (typeof globalThis.document === "undefined" ? null : globalThis.document));
  const getWindowObj = typeof deps.getWindowObj === "function"
    ? deps.getWindowObj
    : (() => (typeof globalThis.window === "undefined" ? null : globalThis.window));
  const alertFn = typeof deps.alertFn === "function"
    ? deps.alertFn
    : (message) => {
      if (typeof globalThis.alert === "function") globalThis.alert(message);
    };
  const queueMicrotaskFn = typeof deps.queueMicrotaskFn === "function"
    ? deps.queueMicrotaskFn
    : (fn) => {
      if (typeof globalThis.queueMicrotask === "function") {
        globalThis.queueMicrotask(fn);
        return;
      }
      setTimeout(fn, 0);
    };
  const setTimeoutFn = typeof deps.setTimeoutFn === "function"
    ? deps.setTimeoutFn
    : ((fn, ms) => setTimeout(fn, ms));

  let chatSendDispatchLock = false;
  let chatThreadsUnsub = null;
  let chatMessagesUnsub = null;
  const pendingFollowTargetKeys = new Set();

  function saveChatThreadIndex(threads) {
    saveChatThreadIndexCore({
      threads,
      key: chatIndexKey(state.user?.uid || ""),
      safeStorage,
      maxItems: 100
    });
  }

  function readChatThreadIndexList(key) {
    return readChatThreadIndexListCore({
      key,
      safeStorage
    });
  }

  function buildChatThreadSummaryFromMessages(threadId, value, fallback = {}) {
    return buildChatThreadSummaryFromMessagesCore({
      threadId,
      value,
      fallback,
      pruneChatMessages: (messages) => pruneChatMessages(messages),
      buildChatPreviewText: (message) => buildChatPreviewText(message),
      getChatMessageTimestamp: (message) => getChatMessageTimestamp(message),
      nowMs: Date.now()
    });
  }

  function rebuildLegacyChatThreadIndexFromStorage() {
    return rebuildLegacyChatThreadIndexFromStorageCore({
      localStorageObj: typeof localStorage === "undefined" ? null : localStorage,
      chatThreadsStorageKey: STORAGE_KEYS.chatThreads,
      buildChatThreadSummaryFromMessages: (threadId, value, fallback = {}) => buildChatThreadSummaryFromMessages(threadId, value, fallback),
      sortChatThreads: (threads) => sortChatThreads(threads)
    });
  }

  function mergeChatThreadLists(...lists) {
    return mergeChatThreadListsCore(...lists);
  }

  function loadChatThreadIndex(uid = state.user?.uid || "") {
    return loadChatThreadIndexCore({
      uid,
      chatIndexKey,
      legacyChatIndexKey: STORAGE_KEYS.chatIndex,
      readChatThreadIndexList: (key) => readChatThreadIndexList(key),
      rebuildChatThreadIndexFromStorage: (ownerUid) => rebuildChatThreadIndexFromStorage(ownerUid),
      rebuildLegacyChatThreadIndexFromStorage: () => rebuildLegacyChatThreadIndexFromStorage(),
      mergeChatThreadLists: (...lists) => mergeChatThreadLists(...lists)
    });
  }

  function sortChatThreads(threads) {
    return sortChatThreadsCore(threads);
  }

  function rebuildChatThreadIndexFromStorage(uid = state.user?.uid || "") {
    return rebuildChatThreadIndexFromStorageCore({
      uid,
      localStorageObj: typeof localStorage === "undefined" ? null : localStorage,
      chatThreadsStorageKey: STORAGE_KEYS.chatThreads,
      pruneChatMessages: (messages) => pruneChatMessages(messages),
      buildChatPreviewText: (message) => buildChatPreviewText(message),
      getChatMessageTimestamp: (message) => getChatMessageTimestamp(message),
      sortChatThreads: (threads) => sortChatThreads(threads),
      nowMs: Date.now()
    });
  }

  function getChatUnreadCount() {
    return getChatUnreadCountCore({
      threads: state.chatThreads,
      nowMs: Date.now()
    });
  }

  function upsertChatThread(profile, patch = {}) {
    const nextThreads = upsertChatThreadListCore({
      profile,
      patch,
      threads: state.chatThreads,
      getChatThreadId: (value) => getChatThreadId(value),
      normalizeHandle: (value) => normalizeHandle(value),
      sortChatThreads: (threads) => sortChatThreads(threads),
      nowMs: Date.now()
    });
    if (!nextThreads) return;
    state.chatThreads = nextThreads;
    saveChatThreadIndex(state.chatThreads);
  }

  function isChatThreadArchived(thread) {
    return isChatThreadArchivedCore(thread);
  }

  function getChatThreadById(threadId) {
    return getChatThreadByIdCore({
      threadId,
      threads: state.chatThreads
    });
  }

  async function setChatThreadArchivedById(threadId, archived = true) {
    const thread = getChatThreadById(threadId);
    const ownerUid = String(state.user?.uid || "").trim();
    const safeThreadId = getSafeChatThreadIdFromThreadCore({
      thread,
      threadId
    });
    if (!safeThreadId || !ownerUid) return;
    state.chatThreadMenuId = "";
    upsertChatThread(thread || buildFallbackChatThreadProfileCore(safeThreadId), {
      archivedByOwner: !!archived
    });
    render();
    try {
      const threadRef = chatThreadDocRef(ownerUid, safeThreadId);
      if (!threadRef) return;
      await setDoc(threadRef, { archivedByOwner: !!archived }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteChatThreadById(threadId) {
    const thread = getChatThreadById(threadId);
    const safeThreadId = getSafeChatThreadIdFromThreadCore({
      thread,
      threadId
    });
    const ownerUid = String(state.user?.uid || "").trim();
    if (!safeThreadId || !ownerUid) return;
    const windowObj = getWindowObj();
    const confirmed = windowObj && typeof windowObj.confirm === "function"
      ? windowObj.confirm("Diesen Chat wirklich loeschen?")
      : true;
    if (!confirmed) return;

    if (shouldCloseChatModalForThreadCore({
      chatModal: state.chatModal,
      safeThreadId,
      getChatThreadId: (profile) => getChatThreadId(profile)
    })) {
      stopActiveChatMessagesListener();
      state.chatModal = buildClosedChatModalStateCore(state.chatModal);
    }

    state.chatThreadMenuId = "";
    state.chatThreads = filterChatThreadsAfterDeleteCore({
      threads: state.chatThreads,
      threadId: safeThreadId
    });
    saveChatThreadIndex(state.chatThreads);
    const localKey = chatThreadStorageKey(thread || buildFallbackChatThreadProfileCore(safeThreadId));
    if (localKey) safeStorage.removeItem(localKey);
    render();

    try {
      const threadRef = chatThreadDocRef(ownerUid, safeThreadId);
      if (!threadRef) return;
      await deleteDoc(threadRef);
    } catch (err) {
      console.error(err);
    }
  }

  function getActiveChatThreadSummary(profile = state.chatModal.profile) {
    return getActiveChatThreadSummaryCore({
      profile,
      threads: state.chatThreads,
      getChatThreadId: (value) => getChatThreadId(value)
    });
  }

  function isActiveChatThreadBlocked(profile = state.chatModal.profile) {
    const thread = getActiveChatThreadSummary(profile);
    return !!thread?.blockedByOwner;
  }

  function getChatThreadId(profile = state.chatModal.profile) {
    return getChatThreadIdCore(profile);
  }

  function chatThreadStorageKey(profile = state.chatModal.profile) {
    return chatThreadStorageKeyCore({
      profile,
      ownerUid: String(state.user?.uid || "guest").trim(),
      chatThreadsStorageKey: STORAGE_KEYS.chatThreads
    });
  }

  function chatThreadDocRef(ownerUid, threadId) {
    return chatThreadDocRefCore({
      docFn: (...segments) => doc(db, ...segments),
      ownerUid,
      threadId
    });
  }

  function chatMessageDocRef(ownerUid, threadId, messageId) {
    return chatMessageDocRefCore({
      docFn: (...segments) => doc(db, ...segments),
      ownerUid,
      threadId,
      messageId
    });
  }

  function chatMessagesCollectionRef(ownerUid, threadId) {
    return chatMessagesCollectionRefCore({
      collectionFn: (...segments) => collection(db, ...segments),
      ownerUid,
      threadId
    });
  }

  function normalizeChatThreadSummary(threadId, data = {}, fallback = {}) {
    return normalizeChatThreadSummaryCore({
      threadId,
      data,
      fallback,
      toDateSafe,
      nowMs: Date.now()
    });
  }

  function getCurrentChatSenderProfile() {
    const handle = String(state.userProfile.handle || normalizeHandle(state.userProfile.name || state.user?.displayName || "user"))
      .replace(/^@/, "")
      .trim();
    return {
      uid: String(state.user?.uid || "").trim(),
      handle,
      name: String(state.userProfile.name || state.user?.displayName || "User").trim() || "User",
      avatar: String(state.userProfile.avatar || "").trim()
    };
  }

  function getStringByteSize(value) {
    return getStringByteSizeCore(value);
  }

  function isChatInlineDataUrl(dataUrl) {
    return isChatInlineDataUrlCore({
      dataUrl,
      getStringByteSize: (value) => getStringByteSize(value),
      maxInlineBytes: CHAT_ATTACHMENT_INLINE_MAX_BYTES
    });
  }

  function sanitizeChatAttachmentsForSync(attachments) {
    return sanitizeChatAttachmentsForSyncCore({
      attachments,
      isChatInlineDataUrl: (dataUrl) => isChatInlineDataUrl(dataUrl),
      maxAttachments: 4
    });
  }

  function normalizeChatMessageRecord(messageId, data = {}, localMap = new Map()) {
    return normalizeChatMessageRecordCore({
      messageId,
      data,
      localMap,
      isChatInlineDataUrl: (dataUrl) => isChatInlineDataUrl(dataUrl),
      maxAttachments: 4
    });
  }

  function getChatMessageTimestamp(message) {
    return getChatMessageTimestampCore({
      message,
      toDateSafe
    });
  }

  function pruneChatMessages(messages) {
    return pruneChatMessagesCore({
      messages,
      ttlMs: CHAT_MESSAGE_TTL_MS,
      nowMs: Date.now(),
      getChatMessageTimestamp: (message) => getChatMessageTimestamp(message)
    });
  }

  function buildChatPreviewText(message) {
    return buildChatPreviewTextCore(message);
  }

  function normalizeChatDeliveryStatus(status, fallback = "sent") {
    return normalizeChatDeliveryStatusCore(status, fallback);
  }

  function mergeRemoteAndUnsyncedLocalMessages(remoteMessages = [], localSeed = []) {
    const remoteList = Array.isArray(remoteMessages) ? remoteMessages : [];
    const localList = Array.isArray(localSeed) ? localSeed : [];
    if (!localList.length) return remoteList;
    const remoteIds = new Set(
      remoteList
        .map((message) => String(message?.id || "").trim())
        .filter(Boolean)
    );
    const unsyncedLocal = localList.filter((message) => {
      const messageId = String(message?.id || "").trim();
      if (!messageId || remoteIds.has(messageId)) return false;
      if (String(message?.from || "").trim().toLowerCase() !== "self") return false;
      const deliveryStatus = normalizeChatDeliveryStatus(message?.deliveryStatus, "sent");
      return deliveryStatus === "pending" || deliveryStatus === "failed";
    });
    if (!unsyncedLocal.length) return remoteList;
    return [...remoteList, ...unsyncedLocal]
      .sort((a, b) => getChatMessageTimestamp(a) - getChatMessageTimestamp(b));
  }

  function loadLegacyChatThreadMessages(threadId) {
    return loadLegacyChatThreadMessagesCore({
      threadId,
      localStorageObj: typeof localStorage === "undefined" ? null : localStorage,
      chatThreadsStorageKey: STORAGE_KEYS.chatThreads,
      pruneChatMessages: (messages) => pruneChatMessages(messages)
    });
  }

  async function readFileAsDataUrl(file) {
    return await readFileAsDataUrlCore(file);
  }

  async function buildInlineChatAttachment(file, isImage = false) {
    return await buildInlineChatAttachmentCore({
      file,
      isImage,
      readFileAsDataUrl: (candidate) => readFileAsDataUrl(candidate),
      isChatInlineDataUrl: (dataUrl) => isChatInlineDataUrl(dataUrl),
      compressImage: (source, maxSize, quality, mimeType) => compressImage(source, maxSize, quality, mimeType),
      compressionSteps: CHAT_IMAGE_PREVIEW_COMPRESSION_STEPS
    });
  }

  function loadChatThreadMessages(profile) {
    return loadChatThreadMessagesCore({
      profile,
      chatThreadStorageKey: (value) => chatThreadStorageKey(value),
      safeStorage,
      pruneChatMessages: (messages) => pruneChatMessages(messages),
      loadLegacyChatThreadMessages: (threadId) => loadLegacyChatThreadMessages(threadId),
      getChatThreadId: (value) => getChatThreadId(value),
      maxItems: 100
    });
  }

  function saveChatThreadMessages(profile, messages) {
    saveChatThreadMessagesCore({
      profile,
      messages,
      chatThreadStorageKey: (value) => chatThreadStorageKey(value),
      safeStorage,
      pruneChatMessages: (items) => pruneChatMessages(items),
      maxItems: 100
    });
  }

  function stopChatThreadsListener() {
    if (chatThreadsUnsub) {
      chatThreadsUnsub();
      chatThreadsUnsub = null;
    }
  }

  function stopActiveChatMessagesListener() {
    if (chatMessagesUnsub) {
      chatMessagesUnsub();
      chatMessagesUnsub = null;
    }
  }

  function syncLocalChatThreadsFromRemote(remoteThreads, ownerUid = state.user?.uid || "") {
    const merged = buildMergedChatThreadsFromRemoteCore({
      ownerUid,
      stateThreads: state.chatThreads,
      remoteThreads,
      loadChatThreadIndex: (uid) => loadChatThreadIndex(uid),
      mergeChatThreadLists: (...lists) => mergeChatThreadLists(...lists)
    });
    state.chatThreads = merged;
    saveChatThreadIndex(merged);
    if (shouldRenderChatThreadListAfterRemoteSyncCore({
      lastRenderMode: getLastRenderMode(),
      activeTab: state.activeTab,
      chatModalOpen: !!state.chatModal.open
    })) {
      render();
      return;
    }
    updateNotificationBadges();
  }

  function startChatThreadsListener(user = state.user) {
    stopChatThreadsListener();
    const ownerUid = String(user?.uid || "").trim();
    if (!ownerUid) return;
    const ref = collection(db, "users", ownerUid, "chatThreads");
    const threadQuery = query(ref, orderBy("updatedAt", "desc"), limit(25));
    chatThreadsUnsub = onSnapshot(threadQuery, (snap) => {
      const remoteThreads = mapChatThreadDocsToSummariesCore({
        docs: snap.docs,
        normalizeChatThreadSummary: (threadId, data = {}, fallback = {}) => normalizeChatThreadSummary(threadId, data, fallback)
      });
      syncLocalChatThreadsFromRemote(remoteThreads, ownerUid);
    }, (err) => {
      console.error(`[mnyra][firestore.listen.chatThreads] users/${ownerUid}/chatThreads`, err);
    });
  }

  async function syncRemoteChatReadState(profile, messages = state.chatModal.messages || []) {
    const syncInputs = normalizeRemoteChatReadSyncInputsCore({
      ownerUid: String(state.user?.uid || "").trim(),
      threadId: getChatThreadId(profile),
      unreadMessageIds: collectUnreadIncomingChatMessageIdsCore({
        messages,
        pruneChatMessages: (items) => pruneChatMessages(items)
      })
    });
    if (!syncInputs.canSync) return;
    const threadUnreadResetPatch = buildChatUnreadResetPatchCore();
    const messageReadPatch = buildChatMessageReadPatchCore();
    const writeTasks = buildRemoteChatReadSyncWriteTasksCore({
      ownerUid: syncInputs.ownerUid,
      threadId: syncInputs.threadId,
      unreadMessageIds: syncInputs.unreadMessageIds,
      chatThreadDocRef: (ownerUid, threadId) => chatThreadDocRef(ownerUid, threadId),
      chatMessageDocRef: (ownerUid, threadId, messageId) => chatMessageDocRef(ownerUid, threadId, messageId),
      setDocFn: (ref, payload, options) => setDoc(ref, payload, options),
      threadUnreadResetPatch,
      messageReadPatch
    });
    if (!writeTasks.length) return;
    try {
      await Promise.all(writeTasks.map((task) => task()));
    } catch {}
  }

  function startActiveChatMessagesListener(profile = state.chatModal.profile) {
    stopActiveChatMessagesListener();
    const ownerUid = String(state.user?.uid || "").trim();
    const threadId = getChatThreadId(profile);
    const ref = chatMessagesCollectionRef(ownerUid, threadId);
    if (!ref) return;
    const messageQuery = query(ref, orderBy("createdAtClient", "desc"), limit(CHAT_MESSAGE_READ_LIMIT));
    chatMessagesUnsub = onSnapshot(messageQuery, (snap) => {
      if (shouldIgnoreChatMessagesSnapshotCore({
        chatModalOpen: !!state.chatModal.open,
        activeModalThreadId: getChatThreadId(state.chatModal.profile),
        listenerThreadId: threadId
      })) return;
      const localSeed = buildChatListenerLocalSeedCore({
        storedMessages: loadChatThreadMessages(profile),
        modalMessages: Array.isArray(state.chatModal.messages) ? state.chatModal.messages : [],
        pruneChatMessages: (items) => pruneChatMessages(items)
      });
      if (shouldUseChatLocalSeedCore({
        remoteDocsCount: snap.docs.length,
        localSeed
      })) {
        state.chatModal.messages = localSeed;
        render();
        return;
      }
      const localMap = buildChatLocalMessageMapCore(localSeed);
      const remoteMessages = buildSortedRemoteChatMessagesCore({
        entries: snap.docs.map((docSnap) => ({
          id: docSnap.id,
          data: docSnap.data() || {}
        })),
        localMap,
        normalizeChatMessageRecord: (messageId, data = {}, map = new Map()) => normalizeChatMessageRecord(messageId, data, map),
        getChatMessageTimestamp: (message) => getChatMessageTimestamp(message)
      });
      const mergedMessages = mergeRemoteAndUnsyncedLocalMessages(remoteMessages, localSeed);
      const nextMessages = resolveChatMessagesAfterSnapshotCore({
        profile,
        remoteMessages: mergedMessages,
        hasUnreadIncomingRemoteMessages: (messages) => hasUnreadIncomingRemoteMessagesCore(messages),
        markChatThreadAsRead: (threadProfile, messages) => markChatThreadAsRead(threadProfile, messages),
        syncRemoteChatReadState: (threadProfile, messages) => void syncRemoteChatReadState(threadProfile, messages),
        saveChatThreadMessages: (threadProfile, messages) => saveChatThreadMessages(threadProfile, messages),
        syncChatThreadSummary: (threadProfile, messages) => syncChatThreadSummary(threadProfile, messages)
      });
      state.chatModal.messages = pruneChatMessages(nextMessages);
      render();
    }, (err) => {
      console.error(`[mnyra][firestore.listen.chatMessages] users/${ownerUid}/chatThreads/${threadId}/messages`, err);
    });
  }

  async function persistCurrentChatMessagePatch(messageId, patch = {}) {
    const ownerUid = String(state.user?.uid || "").trim();
    const threadId = getChatThreadId(state.chatModal.profile);
    const safeMessageId = String(messageId || "").trim();
    if (!ownerUid || !threadId || !safeMessageId || !patch || typeof patch !== "object") return;
    const messageRef = chatMessageDocRef(ownerUid, threadId, safeMessageId);
    if (!messageRef) return;
    try {
      await setDoc(messageRef, patch, { merge: true });
    } catch {}
  }

  async function syncChatMessageToRemote(message, partnerProfile = state.chatModal.profile) {
    const senderProfile = getCurrentChatSenderProfile();
    const senderUid = senderProfile.uid;
    const partnerUid = String(partnerProfile?.uid || "").trim();
    const senderThreadId = getChatThreadId(partnerProfile);
    const recipientThreadId = senderUid;
    if (!senderUid || !partnerUid || !senderThreadId || !recipientThreadId || senderUid === partnerUid) {
      throw new Error("chat_sync_context_invalid");
    }

    const syncContext = buildChatMessageSyncContextCore({
      message,
      sanitizeChatAttachmentsForSync: (attachments) => sanitizeChatAttachmentsForSync(attachments),
      buildChatPreviewText: (entry) => buildChatPreviewText(entry),
      createdAtClientFallback: new Date().toISOString()
    });
    const safeAttachments = syncContext.safeAttachments;
    const preview = syncContext.preview;
    const createdAtClient = syncContext.createdAtClient;
    const senderThreadRef = chatThreadDocRef(senderUid, senderThreadId);
    const senderMessageRef = chatMessageDocRef(senderUid, senderThreadId, message?.id);
    const recipientThreadRef = chatThreadDocRef(partnerUid, recipientThreadId);
    const recipientMessageRef = chatMessageDocRef(partnerUid, recipientThreadId, message?.id);
    if (!senderThreadRef || !senderMessageRef || !recipientThreadRef || !recipientMessageRef) {
      throw new Error("chat_sync_ref_invalid");
    }

    const payloads = buildChatRemotePayloadBundleCore({
      message,
      safeAttachments,
      preview,
      createdAtClient,
      senderProfile,
      partnerProfile,
      senderUid,
      partnerUid,
      serverTimestampFn: () => serverTimestamp()
    });

    await Promise.all([
      setDoc(senderThreadRef, payloads.senderThreadPayload, { merge: true }),
      setDoc(senderMessageRef, payloads.senderMessagePayload, { merge: true })
    ]);

    const txResult = await runTransaction(db, async (tx) => {
      const recipientSnap = await tx.get(recipientThreadRef);
      const recipientData = recipientSnap.exists() ? (recipientSnap.data() || {}) : {};
      const recipientUnread = Math.max(0, Number(recipientData.unreadCount) || 0);
      const recipientMuted = Number(recipientData.muteUntilMs || 0) > Date.now();
      const recipientArchived = !!recipientData.archivedByOwner;
      const recipientBlocked = !!recipientData.blockedByOwner;
      tx.set(recipientThreadRef, {
        ...payloads.recipientThreadPayloadBase,
        unreadCount: recipientUnread + 1
      }, { merge: true });
      tx.set(recipientMessageRef, payloads.recipientMessagePayload, { merge: true });
      return { recipientMuted, recipientArchived, recipientBlocked };
    });

    const canNotifyRecipient = !!txResult && !txResult.recipientMuted && !txResult.recipientArchived && !txResult.recipientBlocked;
    if (canNotifyRecipient) {
      const notification = buildChatMessageNotificationCore({
        messageId: message?.id,
        senderUid,
        senderProfile,
        preview,
        nowMs: Date.now(),
        encodeURIComponentFn: (value) => encodeURIComponent(value)
      });
      void Promise.resolve()
        .then(() => pushUserNotificationWithId(partnerUid, notification.notificationId, {
          ...notification.payload
        }))
        .catch((err) => {
          console.warn("[mnyra][chat.notification.push_failed]", err);
        });
    }
  }

  function syncChatThreadSummary(profile, messages) {
    if (!profile) return;
    const threadId = getChatThreadId(profile);
    const existing = (state.chatThreads || []).find((item) => String(item?.id || "") === threadId) || null;
    const summaryPatch = buildChatThreadPatchFromMessagesCore({
      messages,
      existingUpdatedAt: Number(existing?.updatedAt || 0),
      pruneChatMessages: (items) => pruneChatMessages(items),
      buildChatPreviewText: (message) => buildChatPreviewText(message),
      getChatMessageTimestamp: (message) => getChatMessageTimestamp(message),
      nowMs: Date.now()
    });
    upsertChatThread(profile, {
      lastMessage: summaryPatch.lastMessage,
      updatedAt: summaryPatch.updatedAt
    });
  }

  function markChatThreadAsRead(profile, messages = null) {
    if (!profile) return [];
    const threadId = getChatThreadId(profile);
    const existing = (state.chatThreads || []).find((item) => String(item?.id || "") === threadId) || null;
    const readResult = markIncomingChatMessagesAsReadCore({
      messages: Array.isArray(messages) ? messages : loadChatThreadMessages(profile),
      pruneChatMessages: (items) => pruneChatMessages(items)
    });
    if (readResult.changed) {
      saveChatThreadMessages(profile, readResult.messages);
    }
    const summaryPatch = buildChatThreadPatchFromMessagesCore({
      messages: readResult.messages,
      existingUpdatedAt: Number(existing?.updatedAt || 0),
      pruneChatMessages: (items) => pruneChatMessages(items),
      buildChatPreviewText: (message) => buildChatPreviewText(message),
      getChatMessageTimestamp: (message) => getChatMessageTimestamp(message),
      nowMs: Date.now()
    });
    upsertChatThread(profile, {
      lastMessage: summaryPatch.lastMessage,
      unreadCount: 0,
      updatedAt: summaryPatch.updatedAt
    });
    return readResult.messages;
  }

  function updateCurrentChatMessages(updater) {
    if (!state.chatModal.profile) return;
    const nextMessages = updateChatMessageListCore({
      currentMessages: state.chatModal.messages || [],
      updater,
      pruneChatMessages: (items) => pruneChatMessages(items)
    });
    state.chatModal.messages = nextMessages;
    saveChatThreadMessages(state.chatModal.profile, nextMessages);
    syncChatThreadSummary(state.chatModal.profile, nextMessages);
  }

  async function addChatAttachments(fileList) {
    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length) return;
    const existing = Array.isArray(state.chatModal.attachments) ? state.chatModal.attachments : [];
    const slotsLeft = Math.max(0, 4 - existing.length);
    if (!slotsLeft) return;
    const nextAttachments = await buildNextChatAttachmentsCore({
      fileList: files.slice(0, slotsLeft),
      existingAttachments: existing,
      maxAttachments: 4,
      buildInlineChatAttachment: (file, isImage) => buildInlineChatAttachment(file, isImage),
      nowMsFn: () => Date.now(),
      randomFn: () => Math.random()
    });
    state.chatModal.attachments = nextAttachments;
    render();
  }

  function removePendingChatAttachment(attachmentId) {
    const safeId = String(attachmentId || "");
    if (!safeId) return;
    state.chatModal.attachments = removePendingChatAttachmentCore({
      attachments: state.chatModal.attachments,
      attachmentId: safeId
    });
    render();
  }

  function toggleChatMessageSaved(messageId) {
    const safeId = String(messageId || "");
    if (!safeId) return;
    let nextSaved = null;
    updateCurrentChatMessages((messages) => {
      const result = toggleChatMessageFlagCore({
        messages,
        messageId: safeId,
        flag: "saved"
      });
      nextSaved = result.nextValue;
      return result.messages;
    });
    render();
    if (typeof nextSaved === "boolean") {
      void persistCurrentChatMessagePatch(safeId, { saved: nextSaved });
    }
  }

  function toggleChatMessageLiked(messageId) {
    const safeId = String(messageId || "");
    if (!safeId) return;
    let nextLiked = null;
    updateCurrentChatMessages((messages) => {
      const result = toggleChatMessageFlagCore({
        messages,
        messageId: safeId,
        flag: "liked"
      });
      nextLiked = result.nextValue;
      return result.messages;
    });
    render();
    if (typeof nextLiked === "boolean") {
      void persistCurrentChatMessagePatch(safeId, { liked: nextLiked });
    }
  }

  function setChatMessageDeliveryStatus(messageId, deliveryStatus = "sent", syncError = "") {
    const safeMessageId = String(messageId || "").trim();
    if (!safeMessageId) return false;
    const nextStatus = normalizeChatDeliveryStatus(deliveryStatus, "sent");
    const nextSyncError = nextStatus === "failed"
      ? String(syncError || "").trim()
      : "";
    let changed = false;
    updateCurrentChatMessages((messages) => (Array.isArray(messages) ? messages : []).map((message) => {
      if (String(message?.id || "").trim() !== safeMessageId) return message;
      const currentStatus = normalizeChatDeliveryStatus(message?.deliveryStatus, "sent");
      const currentSyncError = String(message?.syncError || "").trim();
      if (currentStatus === nextStatus && currentSyncError === nextSyncError) {
        return message;
      }
      changed = true;
      return {
        ...message,
        deliveryStatus: nextStatus,
        syncError: nextSyncError
      };
    }));
    return changed;
  }

  function getRetryableFailedChatMessage(messageId) {
    const safeMessageId = String(messageId || "").trim();
    if (!safeMessageId) return null;
    const list = Array.isArray(state.chatModal.messages) ? state.chatModal.messages : [];
    const message = list.find((entry) => String(entry?.id || "").trim() === safeMessageId) || null;
    if (!message) return null;
    if (String(message?.from || "").trim().toLowerCase() !== "self") return null;
    if (normalizeChatDeliveryStatus(message?.deliveryStatus, "sent") !== "failed") return null;
    return message;
  }

  async function sendChatMessage(options = {}) {
    if (!state.chatModal.open || !state.chatModal.profile) return;
    if (chatSendDispatchLock) return;
    chatSendDispatchLock = true;
    queueMicrotaskFn(() => {
      chatSendDispatchLock = false;
    });
    if (isActiveChatThreadBlocked()) {
      alertFn("Dieser Chat ist blockiert. Entblocke ihn in der Chat-Uebersicht.");
      return;
    }
    const retryMessageId = String(options?.retryMessageId || "").trim();
    if (retryMessageId) {
      const retryTarget = getRetryableFailedChatMessage(retryMessageId);
      if (!retryTarget) return;
      const retryText = String(retryTarget.text || "");
      const retryAttachments = Array.isArray(retryTarget.attachments)
        ? retryTarget.attachments.map((attachment) => ({ ...attachment }))
        : [];
      if (!retryText.trim() && !retryAttachments.length) return;
      setChatMessageDeliveryStatus(retryTarget.id, "pending", "");
      render();
      try {
        await syncChatMessageToRemote({
          ...retryTarget,
          text: retryText,
          attachments: retryAttachments,
          deliveryStatus: "pending",
          syncError: ""
        }, state.chatModal.profile);
        setChatMessageDeliveryStatus(retryTarget.id, "sent", "");
        render();
        void persistCurrentChatMessagePatch(retryTarget.id, {
          deliveryStatus: "sent",
          syncError: ""
        });
      } catch (err) {
        console.error(err);
        const syncError = String(err?.message || err || "").trim();
        setChatMessageDeliveryStatus(retryTarget.id, "failed", syncError);
        render();
        void persistCurrentChatMessagePatch(retryTarget.id, {
          deliveryStatus: "failed",
          syncError
        });
      }
      return;
    }
    const documentObj = getDocumentObj();
    const input = documentObj ? documentObj.getElementById("chatMessageInput") : null;
    const sendPayload = resolveChatSendPayloadCore({
      inputValue: input?.value,
      draft: state.chatModal.draft,
      attachments: state.chatModal.attachments
    });
    if (!sendPayload.canSend) return;
    const createdAt = new Date().toISOString();
    const localUpdate = buildChatSendLocalUpdateCore({
      currentMessages: state.chatModal.messages,
      text: sendPayload.text,
      attachments: sendPayload.attachments,
      createdAt,
      createOutgoingChatMessage: ({ text, attachments, createdAt }) => createOutgoingChatMessageCore({
        text,
        attachments,
        createdAt,
        nowMsFn: () => Date.now(),
        randomFn: () => Math.random()
      }),
      pruneChatMessages: (messages) => pruneChatMessages(messages),
      buildChatPreviewText: (entry) => buildChatPreviewText(entry),
      getChatMessageTimestamp: (entry) => getChatMessageTimestamp(entry)
    });
    state.chatModal.messages = localUpdate.nextMessages;
    state.chatModal.draft = "";
    state.chatModal.attachments = [];
    saveChatThreadMessages(state.chatModal.profile, state.chatModal.messages);
    upsertChatThread(state.chatModal.profile, localUpdate.threadPatch);
    render();
    try {
      await syncChatMessageToRemote(localUpdate.outgoingMessage, state.chatModal.profile);
      setChatMessageDeliveryStatus(localUpdate.outgoingMessage?.id, "sent", "");
      render();
      void persistCurrentChatMessagePatch(localUpdate.outgoingMessage?.id, {
        deliveryStatus: "sent",
        syncError: ""
      });
    } catch (err) {
      console.error(err);
      const syncError = String(err?.message || err || "").trim();
      setChatMessageDeliveryStatus(localUpdate.outgoingMessage?.id, "failed", syncError);
      render();
      void persistCurrentChatMessagePatch(localUpdate.outgoingMessage?.id, {
        deliveryStatus: "failed",
        syncError
      });
    }
  }

  async function hasPendingFollowRequest(targetUid) {
    const safeTargetUid = String(targetUid || "").trim();
    if (!safeTargetUid || !state.user?.uid || safeTargetUid === String(state.user.uid)) return false;
    try {
      const snap = await getDoc(doc(db, "users", safeTargetUid, "followRequests", state.user.uid));
      return snap.exists();
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async function sendFollowRequest(handle, target = {}) {
    if (!state.user) return;
    const safeHandle = normalizeFollowHandle(handle);
    const targetUid = String(target.id || target.uid || "").trim();
    if (!safeHandle || !targetUid || targetUid === String(state.user.uid)) return;
    if (state.followingHandles.includes(safeHandle) || state.pendingFollowRequests.includes(safeHandle)) return;
    try {
      const actor = currentUserBadge();
      await setDoc(doc(db, "users", targetUid, "followRequests", state.user.uid), buildFollowRequestDocPayloadCore({
        actor,
        targetUid,
        targetHandle: safeHandle,
        serverTimestampValue: serverTimestamp()
      }), { merge: true });
      await pushUserNotificationWithId(
        targetUid,
        `follow_request_${state.user.uid}`,
        buildFollowRequestNotificationPayloadCore({
          actor,
          serverTimestampValue: serverTimestamp()
        })
      );
      state.pendingFollowRequests = Array.from(new Set([safeHandle, ...state.pendingFollowRequests]));
      if (state.profileModal.profile?.uid === targetUid) {
        state.profileModal.profile.pendingFollowRequest = true;
      }
      if (state.profileView?.profile?.uid === targetUid) {
        state.profileView.profile.pendingFollowRequest = true;
      }
      render();
    } catch (err) {
      console.error(err);
    }
  }

  async function acceptFollowRequest(notificationId) {
    if (!state.user?.uid || !notificationId) return;
    const notif = state.notifications.find((item) => item.id === notificationId);
    if (!notif || notif.type !== "follow_request") return;
    const requesterUid = String(notif.userUid || "").trim();
    if (!requesterUid || requesterUid === String(state.user.uid)) return;

    const actor = currentUserBadge();
    const targetHandle = normalizeFollowHandle(state.userProfile.handle || actor.handle || normalizeHandle(state.userProfile.name || "user"));
    const followRef = doc(db, "users", requesterUid, "following", getFollowDocId("user", state.user.uid, targetHandle));

    try {
      const existing = await getDoc(followRef);
      if (!existing.exists()) {
        await setDoc(followRef, buildAcceptedFollowRecordPayloadCore({
          targetUid: state.user.uid,
          targetHandle,
          profileName: state.userProfile.name,
          profileAvatar: state.userProfile.avatar,
          actor,
          serverTimestampValue: serverTimestamp()
        }), { merge: true });
        await Promise.allSettled([
          updateDoc(doc(db, "users", requesterUid), { followingCount: increment(1) }),
          updateDoc(doc(db, "users", state.user.uid), { followersCount: increment(1) })
        ]);
      }

      await Promise.allSettled([
        deleteDoc(doc(db, "users", state.user.uid, "followRequests", requesterUid)),
        deleteDoc(doc(db, "users", state.user.uid, "notifications", notificationId))
      ]);

      state.notifications = state.notifications.filter((item) => item.id !== notificationId);
      saveNotifications(state.notifications);
      updateNotificationsDom();

      await pushUserNotification(requesterUid, buildFollowAcceptedNotificationPayloadCore({ actor }));
    } catch (err) {
      console.error(err);
    }
  }

  async function markNotificationRead(id) {
    if (!id) return;
    const local = markNotificationReadInListCore({
      notifications: state.notifications,
      id
    });
    if (local.changed) {
      state.notifications = local.nextNotifications;
      saveNotifications(state.notifications);
      const updated = updateNotificationsDom();
      if (!updated && state.activeTab === "notifications") {
        render();
      }
    }
    if (state.user?.uid) {
      try {
        await updateDoc(doc(db, "users", state.user.uid, "notifications", id), { read: true });
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function markAllNotificationsRead() {
    const local = markAllNotificationsReadInListCore({
      notifications: state.notifications
    });
    if (!local.changed) return;
    state.notifications = local.nextNotifications;
    saveNotifications(state.notifications);
    const updated = updateNotificationsDom();
    if (!updated && state.activeTab === "notifications") {
      render();
    }
    if (state.user?.uid) {
      await Promise.allSettled(local.unreadIds.map((notifId) =>
        updateDoc(doc(db, "users", state.user.uid, "notifications", notifId), { read: true })
      ));
    }
  }

  function normalizeUserPostDoc(postId, data, ownerId) {
    return normalizeUserPostDocCore(postId, data, ownerId);
  }

  function normalizeRestaurantPostDoc(postId, data, restaurantId) {
    return normalizeRestaurantPostDocCore(postId, data, restaurantId);
  }

  async function fetchPostForNotification(notif) {
    const lookup = readNotificationPostLookupCore(notif);
    const postId = lookup.postId;
    if (!postId) return null;
    const ownerType = lookup.ownerType;
    const ownerId = lookup.ownerId;

    try {
      if (shouldFetchUserNotificationPostCore({ ownerType, ownerId })) {
        const snap = await getDoc(doc(db, "users", ownerId, "posts", postId));
        if (snap.exists()) return normalizeUserPostDoc(postId, snap.data() || {}, ownerId);
      }
      if (shouldFetchRestaurantNotificationPostCore({ ownerType, ownerId })) {
        const snap = await getDoc(doc(db, "restaurants", ownerId, "socialPosts", postId));
        if (snap.exists()) return normalizeRestaurantPostDoc(postId, snap.data() || {}, ownerId);
      }
      const feedSnap = await getDoc(doc(db, "socialFeed", postId));
      if (feedSnap.exists()) return normalizeFeedPost({ id: feedSnap.id, ...feedSnap.data() });
    } catch (err) {
      console.error(err);
    }
    return null;
  }

  function highlightCommentInModal(commentId) {
    return highlightCommentInModalCore({
      documentObj: getDocumentObj(),
      commentId,
      commentsRootId: "postModalComments",
      timeoutMs: 2000,
      setTimeoutFn: (fn, ms) => setTimeoutFn(fn, ms)
    });
  }

  async function openPostFromNotification(notif) {
    const postId = normalizePendingPostIdCore(notif.postId);
    if (!postId) return;
    let post = findPostInLocalSourcesCore({
      postId,
      findPostById: (id) => findPostById(id),
      feedPosts: state.feedPosts
    });
    if (!post) {
      post = await fetchPostForNotification(notif);
    }
    if (!post) {
      setPendingCommentHighlight("");
      return;
    }
    const highlightId = resolveNotificationCommentHighlightIdCore({
      notificationType: notif.type,
      commentId: notif.commentId
    });
    if (highlightId) {
      setPendingCommentHighlight(highlightId);
    }
    await openPostModal(post);
    const pendingCommentHighlight = getPendingCommentHighlight();
    if (pendingCommentHighlight) {
      if (highlightCommentInModal(pendingCommentHighlight)) {
        setPendingCommentHighlight("");
      }
    }
  }

  async function openNotificationTarget(id) {
    const notif = state.notifications.find((n) => n.id === id);
    if (!notif) return;
    void markNotificationRead(id);
    if (notif.type === "follow_accepted") {
      const nextFollowing = buildFollowAcceptedFollowingStateCore({
        notif,
        followingHandles: state.followingHandles,
        followingTargetIds: state.followingTargetIds,
        normalizeFollowHandle: (value) => normalizeFollowHandle(value)
      });
      applyFollowingHandles(
        nextFollowing.handles,
        { shouldRender: false, targetIds: nextFollowing.targetIds }
      );
    }
    if (isChatNotificationTypeCore(notif.type)) {
      openChatWithProfile(buildNotificationChatTargetCore(notif));
      return;
    }
    if (isFollowNotificationTypeCore(notif.type)) {
      openProfileFromUser(buildNotificationProfileTargetCore(notif));
      return;
    }
    if (isPostNotificationTypeCore(notif.type)) {
      await openPostFromNotification(notif);
    }
  }

  async function resolveUserByHandle(handle) {
    if (!handle) return null;
    const candidates = buildResolveUserByHandleCandidatesCore({
      handle,
      normalizeFollowHandle: (value) => normalizeFollowHandle(value)
    });
    for (const candidate of candidates) {
      try {
        const snap = await getDocs(query(collection(db, "users"), where("handle", "==", candidate), limit(1)));
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          return { id: docSnap.id, data: docSnap.data() || {} };
        }
      } catch (err) {
        console.error(err);
      }
    }
    return null;
  }

  async function toggleFollow(handle, target = {}) {
    if (!state.user) {
      openGuestAuthPrompt("Bitte einloggen, um Profile zu folgen.");
      return;
    }
    const rawHandle = String(handle || "").replace(/^@/, "").trim();
    const safeHandle = normalizeFollowHandle(rawHandle);
    if (!safeHandle) return;

    let { targetType, targetId } = deriveFollowTargetIdentityCore(target);

    if (!targetId && (rawHandle || safeHandle)) {
      const userSnap = await resolveUserByHandle(rawHandle || safeHandle);
      if (userSnap?.id) {
        targetType = "user";
        targetId = userSnap.id;
      }
    }

    const ownRestaurantId = String(state.userProfile.restaurantId || "");
    const ownUid = String(state.user.uid || "");
    const ownHandle = String(state.userProfile.handle || "").replace(/^@/, "").toLowerCase();
    if (isSelfFollowTargetCore({
      targetType,
      targetId,
      safeHandle,
      ownRestaurantId,
      ownUid,
      ownHandle
    })) return;

    const safeTargetId = String(targetId || "").trim();
    const idx = safeHandle ? state.followingHandles.indexOf(safeHandle) : -1;
    const isTargetIdFollowed = !!safeTargetId && state.followingTargetIds.includes(safeTargetId);
    const isUnfollow = idx >= 0 || isTargetIdFollowed;
    const followTargetKey = `${String(targetType || "handle").trim()}:${safeTargetId || safeHandle}`;
    if (pendingFollowTargetKeys.has(followTargetKey)) return;
    pendingFollowTargetKeys.add(followTargetKey);
    let targetIsPrivate = false;
    if (!isUnfollow && targetType === "user" && targetId) {
      if (state.profileView?.profile?.uid === targetId) {
        targetIsPrivate = !!state.profileView.profile.privateAccount;
      } else if (state.profileModal.profile?.uid === targetId) {
        targetIsPrivate = !!state.profileModal.profile.privateAccount;
      } else if (typeof target.privateAccount === "boolean") {
        targetIsPrivate = !!target.privateAccount;
      } else {
        try {
          const snap = await getDoc(doc(db, "users", targetId));
          if (snap.exists()) targetIsPrivate = !!(snap.data() || {}).privateAccount;
        } catch (err) {
          console.error(err);
        }
      }
    }
    if (!isUnfollow && targetIsPrivate) {
      try {
        await sendFollowRequest(safeHandle, { ...target, id: targetId, uid: targetId, type: "user" });
        return;
      } finally {
        pendingFollowTargetKeys.delete(followTargetKey);
      }
    }

    const followRef = doc(db, "users", state.user.uid, "following", getFollowDocId(targetType, targetId, safeHandle));
    const delta = isUnfollow ? -1 : 1;
    const toNum = (value) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    };
    const isBusiness = isLocalBusinessProfile(state.userProfile);
    const applyFollowerDelta = (profileLike = null) => {
      if (!profileLike) return;
      profileLike.followers = Math.max(0, toNum(profileLike.followers) + delta);
      if (delta > 0 && "pendingFollowRequest" in profileLike) {
        profileLike.pendingFollowRequest = false;
      }
    };
    try {
      if (isUnfollow) {
        await deleteDoc(followRef);
        if (idx >= 0) state.followingHandles.splice(idx, 1);
        if (safeTargetId) {
          state.followingTargetIds = state.followingTargetIds.filter((id) => id !== safeTargetId);
        }
      } else {
        await setDoc(followRef, {
          handle: safeHandle,
          targetType: targetType || "handle",
          targetId: targetId || "",
          name: target.name || "",
          avatar: target.avatar || "",
          createdAt: serverTimestamp()
        });
        if (safeHandle) {
          state.followingHandles.unshift(safeHandle);
        }
        if (safeTargetId) {
          state.followingTargetIds = Array.from(new Set([safeTargetId, ...state.followingTargetIds]));
        }
      }

      state.userProfile.following = Math.max(0, toNum(state.userProfile.following) + delta);
      try {
        if (isBusiness && state.userProfile.restaurantId) {
          await updateDoc(doc(db, "restaurants", state.userProfile.restaurantId), { followingCount: increment(delta) });
        } else {
          await updateDoc(doc(db, "users", state.user.uid), { followingCount: increment(delta) });
        }
      } catch (err) {
        console.error(err);
      }

      if (targetType === "user" && targetId) {
        try {
          await updateDoc(doc(db, "users", targetId), { followersCount: increment(delta) });
          if (delta > 0) {
            const actor = currentUserBadge();
            await pushUserNotification(targetId, {
              type: "follow",
              user: actor.name,
              userHandle: actor.handle,
              userUid: actor.uid,
              avatar: actor.avatar,
              text: "folgt dir jetzt"
            });
          }
        } catch (err) {
          console.error(err);
        }
      }
      if (targetType === "restaurant" && targetId) {
        try {
          await updateDoc(doc(db, "restaurants", targetId), { followersCount: increment(delta) });
        } catch (err) {
          console.error(err);
        }
      }
      saveFollowing(state.followingHandles, state.followingTargetIds);

      const profileModal = state.profileModal.profile;
      const profileView = state.profileView?.profile || null;
      const matchesTargetProfile = (profileLike = null) => {
        if (!profileLike) return false;
        const profileRestaurantId = String(profileLike.restaurantId || "").trim();
        const profileUid = String(profileLike.uid || "").trim();
        const profileHandle = normalizeFollowHandle(profileLike.handle || "");
        if (safeTargetId && (profileRestaurantId === safeTargetId || profileUid === safeTargetId)) return true;
        return !!(safeHandle && profileHandle === safeHandle);
      };
      const updatedProfiles = new Set();
      const updateUniqueProfile = (profileLike = null) => {
        if (!profileLike || updatedProfiles.has(profileLike)) return;
        updatedProfiles.add(profileLike);
        applyFollowerDelta(profileLike);
      };
      if (matchesTargetProfile(profileModal)) {
        updateUniqueProfile(profileModal);
      }
      if (matchesTargetProfile(profileView)) {
        updateUniqueProfile(profileView);
      }

      businessProfileCache.forEach((cached) => {
        if (!matchesTargetProfile(cached)) return;
        updateUniqueProfile(cached);
      });
    } catch (err) {
      console.error(err);
    } finally {
      pendingFollowTargetKeys.delete(followTargetKey);
    }

    if (state.profileModal.open && !state.profileView) {
      renderOverlays();
    } else {
      render();
    }
  }

  function renderChatMessagesPanel({
    messages,
    blockedByOwner,
    mutedActive,
    muteUntilLabel,
    partnerName
  } = {}) {
    return renderChatMessagesPanelCore({
      messages,
      blockedByOwner,
      mutedActive,
      muteUntilLabel,
      partnerName,
      escapeHtml,
      icon,
      formatRelative,
      toDateSafe,
      nowMs: Date.now()
    });
  }

  function renderChatPendingAttachments(pendingAttachments) {
    return renderChatPendingAttachmentsCore({
      pendingAttachments,
      escapeHtml,
      icon
    });
  }

  function renderChatListPanel({
    scope = "inbox",
    inboxThreads = [],
    archivedThreads = [],
    visibleThreads = [],
    chatThreadMenuId = state.chatThreadMenuId
  } = {}) {
    return renderChatListPanelCore({
      scope,
      inboxThreads,
      archivedThreads,
      visibleThreads,
      chatThreadMenuId,
      escapeHtml,
      icon,
      formatRelative,
      getOptimizedImageUrl,
      nowMs: Date.now()
    });
  }

  function renderChatView() {
    const threads = sortChatThreads(state.chatThreads);
    if (!state.chatModal.open || !state.chatModal.profile) {
      const scope = state.chatListScope === "archived" ? "archived" : "inbox";
      const inboxThreads = threads.filter((thread) => !isChatThreadArchived(thread));
      const archivedThreads = threads.filter((thread) => isChatThreadArchived(thread));
      const visibleThreads = scope === "archived" ? archivedThreads : inboxThreads;
      return renderChatListPanel({
        scope,
        inboxThreads,
        archivedThreads,
        visibleThreads,
        chatThreadMenuId: state.chatThreadMenuId
      });
    }

    const partner = state.chatModal.profile;
    const messages = Array.isArray(state.chatModal.messages) ? state.chatModal.messages : [];
    const pendingAttachments = Array.isArray(state.chatModal.attachments) ? state.chatModal.attachments : [];
    const activeThread = getActiveChatThreadSummary(partner);
    const blockedByOwner = !!activeThread?.blockedByOwner;
    const muteUntilMs = Number(activeThread?.muteUntilMs || 0) || 0;
    const mutedActive = muteUntilMs > Date.now();
    const muteUntilLabel = mutedActive ? formatRelative(new Date(muteUntilMs)) : "";
    return `
    <div id="chatThreadView" class="flex-1 min-h-0 px-4 pb-4 flex flex-col">
      <div class="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm">
        <div id="chatMessages" class="flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar p-4 space-y-3 bg-slate-50/70">
          ${renderChatMessagesPanel({
            messages,
            blockedByOwner,
            mutedActive,
            muteUntilLabel,
            partnerName: partner.name || "User"
          })}
        </div>
        <div class="shrink-0 p-4 border-t border-slate-100 bg-white">
          ${renderChatPendingAttachments(pendingAttachments)}
          <input type="file" id="chatAttachmentInput" class="hidden" multiple />
          <div class="flex items-end gap-3">
            <button id="chatAttachmentTrigger" ${blockedByOwner ? "disabled" : ""} class="w-[52px] h-[52px] shrink-0 rounded-2xl ${blockedByOwner ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-slate-100 text-slate-600 active:scale-95"} flex items-center justify-center">
              ${icon("plus", "w-5 h-5")}
            </button>
            <textarea id="chatMessageInput" rows="1" ${blockedByOwner ? "readonly" : ""} placeholder="${blockedByOwner ? "Chat ist blockiert" : "Nachricht..."}" class="flex-1 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none max-h-28">${escapeHtml(state.chatModal.draft || "")}</textarea>
            <button id="chatSendBtn" ${blockedByOwner ? "disabled" : ""} class="px-5 h-[52px] rounded-2xl ${blockedByOwner ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white active:scale-95"} font-black text-[10px] uppercase tracking-widest">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  return {
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
    setChatThreadArchivedById,
    deleteChatThreadById,
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
    readFileAsDataUrl,
    buildInlineChatAttachment,
    loadChatThreadMessages,
    saveChatThreadMessages,
    stopChatThreadsListener,
    stopActiveChatMessagesListener,
    syncLocalChatThreadsFromRemote,
    startChatThreadsListener,
    syncRemoteChatReadState,
    startActiveChatMessagesListener,
    persistCurrentChatMessagePatch,
    syncChatMessageToRemote,
    syncChatThreadSummary,
    markChatThreadAsRead,
    updateCurrentChatMessages,
    addChatAttachments,
    removePendingChatAttachment,
    toggleChatMessageSaved,
    toggleChatMessageLiked,
    sendChatMessage,
    hasPendingFollowRequest,
    sendFollowRequest,
    acceptFollowRequest,
    markNotificationRead,
    markAllNotificationsRead,
    normalizeUserPostDoc,
    normalizeRestaurantPostDoc,
    fetchPostForNotification,
    highlightCommentInModal,
    openPostFromNotification,
    openNotificationTarget,
    resolveUserByHandle,
    toggleFollow,
    renderChatMessagesPanel,
    renderChatPendingAttachments,
    renderChatListPanel,
    renderChatView
  };
}
