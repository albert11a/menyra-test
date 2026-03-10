import { auth, db, app } from "/shared/firebase-config.js?v=2026-03-10-startup-1";
import { BUNNY_EDGE_BASE } from "/shared/bunny-edge.js";
import { BRAND_UI } from "/shared/brand-ui.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  collection,
  collectionGroup,
  doc,
  documentId,
  getDoc,
  getDocFromServer,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  limit,
  deleteDoc,
  setDoc,
  updateDoc,
  increment,
  writeBatch,
  runTransaction,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  ensureUserProfile,
  formatRelative,
  getGeo,
  toDateSafe,
  buildUrl,
  qs
} from "./_shared/social-core.js";
import { compressImage } from "./_shared/image-compressor.js";
import { getOptimizedImageUrl, getFirebaseStorageUrl, isPlaceholderUrl, PLACEHOLDER_IMAGE } from "./_shared/image-resolver.js";
import {
  safeStorage,
  STORAGE_KEYS,
  profileKey,
  avatarKey,
  notificationsKey,
  followingKey,
  shopCartKey,
  chatIndexKey,
  pushSeenKey,
  pushTokenMetaKey,
  pushDeviceIdKey,
  GUEST_SCOPE_UID
} from "./_shared/social-storage.js";
import {
  createEmptyShopCart,
  createEmptyOrdersState,
  createEmptyFavoriteMenuItemsState,
  createEmptyMenuDetailState
} from "./core/common/state-factories.js";
import {
  normalizeInitialTab,
  normalizeAuthMode
} from "./core/auth/route-auth-utils.js";
import { resolveInitialRouteState } from "./core/auth/initial-route-state.js";
import {
  readAuthBootstrapSnapshotCore,
  buildAuthBootstrapSnapshotPayload,
  persistAuthBootstrapSnapshot,
  clearAuthBootstrapSnapshotStorage,
  applyAuthBootstrapSnapshotToProfile
} from "./core/auth/auth-bootstrap-snapshot.js";
import {
  shouldResetUserScopedStateCore,
  resolvePendingAuthRouteFlagsCore
} from "./core/auth/auth-bootstrap-flow-utils.js";
import {
  runPostLoginPendingRouteOpenFlowCore,
  runPostLoginNonBlockingRouteOpenFlowCore
} from "./core/auth/auth-post-login-route-open-utils.js";
import { bootstrapAuthenticatedSessionCore } from "./core/auth/auth-user-bootstrap-utils.js";
import {
  clearQueryParamsFromCurrentUrlCore,
  resolveRouteStateFromTargetUrlCore,
  applyPendingRouteStateCore
} from "./core/push/push-route-query-utils.js";
import {
  createBridgeShellBootstrapBundle,
  buildSessionDataRuntimeControllerDeps
} from "./core/app-shell/controller-deps-factory.js";
import { createSessionDataRuntimeController } from "./core/app-shell/session-data-runtime-controller.js";
import { createProfileMenuFocusRenderController } from "./core/profile/profile-menu-focus-render-controller.js";
import { createSocialEngagementRuntimeController } from "./core/profile/social-engagement-runtime-controller.js";
import { createCrmRuntimeController } from "./core/crm/crm-runtime-controller.js";
import { createChatRuntimeController } from "./core/chat/chat-runtime-controller.js";
import {
  resolveNativePushActorCore,
  resolveNativePushBodyCore,
  buildNativePushAlertPayloadCore
} from "./core/push/push-alert-utils.js";
import {
  canUseNativeNotificationsCore,
  buildPushActivationIssueCore,
  getPushActivationIssueMessageCore,
  mapPushActivationErrorCore,
  canEmitNativePushAlertsCore
} from "./core/push/push-activation-utils.js";
import { ensureNotificationPermissionCore } from "./core/push/push-permission-utils.js";
import {
  readPushSeenIdsCore,
  writePushSeenIdsCore
} from "./core/push/push-seen-storage-utils.js";
import {
  getOrCreatePushDeviceIdCore,
  readPushTokenMetaCore,
  writePushTokenMetaCore
} from "./core/push/push-token-storage-utils.js";
import {
  ensurePushServiceWorkerRegistrationCore,
  waitForPushServiceWorkerReadyCore
} from "./core/push/push-service-worker-utils.js";
import {
  ensureFirebaseMessagingModuleCore,
  ensureMessagingClientCore
} from "./core/push/push-messaging-utils.js";
import {
  hasPushDeviceRegistrationPrerequisitesCore,
  isPushTokenSyncFreshCore,
  buildPushDeviceRegistrationPayloadCore,
  buildPushDeviceDisablePayloadCore
} from "./core/push/push-device-registration-utils.js";
import {
  normalizeNotificationItemCore,
  mapNotificationSnapshotCore
} from "./core/notifications/notification-item-utils.js";
import {
  shouldSurfaceNativePushNowCore,
  addNotificationItemsToSeenSetCore,
  collectUnseenUnreadNotificationItemsFromChangesCore
} from "./core/notifications/notification-native-push-utils.js";
import {
  buildNotificationsLiveQueryCore,
  buildNotificationsFetchQueryCore,
  fetchNotificationsFromQueryCore
} from "./core/notifications/notification-query-utils.js";
import {
  buildNotificationWritePayloadCore,
  normalizeNotificationWriteIdsCore
} from "./core/notifications/notification-write-utils.js";
import {
  markNotificationReadInListCore,
  markAllNotificationsReadInListCore
} from "./core/notifications/notification-read-state-utils.js";
import {
  isChatNotificationTypeCore,
  isFollowNotificationTypeCore,
  isPostNotificationTypeCore,
  buildNotificationChatTargetCore,
  buildNotificationProfileTargetCore
} from "./core/notifications/notification-target-utils.js";
import {
  buildFollowRequestDocPayloadCore,
  buildFollowRequestNotificationPayloadCore,
  buildAcceptedFollowRecordPayloadCore,
  buildFollowAcceptedNotificationPayloadCore
} from "./core/follow/follow-request-payload-utils.js";
import { mapFollowingSnapshotCore } from "./core/follow/following-listener-utils.js";
import {
  normalizePendingChatUidCore,
  isSelfPendingChatTargetCore,
  isChatThreadAlreadyOpenCore,
  buildChatRouteTargetProfileCore
} from "./core/chat/chat-route-open-utils.js";
import {
  normalizePendingNotificationIdCore,
  findNotificationByIdCore,
  prependNotificationByIdCore
} from "./core/notifications/notification-route-open-utils.js";
import {
  normalizePendingProfileRestaurantIdCore,
  isPendingProfileAlreadyOpenCore,
  normalizeProfileTopTabFromRouteCore
} from "./core/profile/profile-route-open-utils.js";
import {
  isPushOpenTargetMessageCore,
  parsePushOpenTargetPayloadCore,
  shouldHandlePushOpenTargetCore
} from "./core/push/push-open-target-message-utils.js";
import {
  normalizePendingPostIdCore,
  findPostInLocalSourcesCore,
  resolveNotificationCommentHighlightIdCore
} from "./core/notifications/post-notification-open-utils.js";
import {
  normalizeUserPostDocCore,
  normalizeRestaurantPostDocCore
} from "./core/feed/post-doc-normalize-utils.js";
import {
  readNotificationPostLookupCore,
  shouldFetchUserNotificationPostCore,
  shouldFetchRestaurantNotificationPostCore
} from "./core/notifications/post-notification-fetch-utils.js";
import { highlightCommentInModalCore } from "./core/notifications/notification-comment-highlight-utils.js";
import { buildFollowAcceptedFollowingStateCore } from "./core/follow/follow-accepted-state-utils.js";
import {
  buildResolveUserByHandleCandidatesCore,
  deriveFollowTargetIdentityCore,
  isSelfFollowTargetCore
} from "./core/follow/follow-target-utils.js";
import {
  isGuestSessionCore,
  sanitizeTabForSessionCore,
  applyPendingInitialRouteStateCore
} from "./core/auth/session-tab-guards.js";
import {
  loadLogoCacheCore,
  scheduleLogoCacheWriteCore,
  loadAvatarCacheCore,
  scheduleAvatarCacheWriteCore,
  resolveRestaurantLogoCore,
  resolveUserAvatarCore,
  resolveShellAvatarUrlCore
} from "./core/media/avatar-logo-cache.js";
import {
  saveMenuLayoutToStorageCore,
  getMenuLayoutThemeCore,
  getFocusCardClassCore
} from "./core/menu/menu-layout-utils.js";
import {
  foldMenuTextCore as foldMenuText,
  inferMenuTypeHintCore as inferMenuTypeHint,
  coerceMenuItemsFromDataCore
} from "./core/menu/menu-item-coercion-utils.js";
import {
  scheduleIdleCore,
  enqueueMicrotaskCore
} from "./core/common/task-schedule-utils.js";
import { focusInputByIdCore } from "./core/ui/dom-focus-utils.js";
import { scoreSearchMatchCore as scoreSearchMatch } from "./core/map/search-score-utils.js";
import {
  sanitizeDisplayNameCore as sanitizeDisplayName,
  normalizeSearchQueryCore as normalizeSearchQuery,
  normalizeSearchKeyCore as normalizeSearchKey
} from "./core/common/text-normalize-utils.js";
import {
  normalizeHandleCore as normalizeHandle,
  isGenericHandleCore,
  resolvePreferredHandleCore,
  normalizeFollowHandleCore
} from "./core/profile/handle-utils.js";
import {
  normalizeEmailValueCore as normalizeEmailValue,
  getRestaurantEmailCandidatesCore as getRestaurantEmailCandidates,
  getRestaurantUidCandidatesCore as getRestaurantUidCandidates,
  matchesRestaurantIdentityCore as matchesRestaurantIdentity
} from "./core/profile/restaurant-identity-utils.js";
import {
  createLeadScopeMapCore,
  createCustomerScopeMapCore,
  normalizeLeadScopeKeyCore,
  normalizeCustomerScopeKeyCore,
  createEmptyLeadsStateCore,
  createEmptyCustomersStateCore
} from "./core/crm/crm-scope-state-utils.js";
import {
  normalizeRoleListCore,
  roleLabelCore,
  buildRoleSwitchUrlCore
} from "./core/profile/role-switch-utils.js";
import { formatCountCore as formatCount } from "./core/common/count-format-utils.js";
import {
  logoFitClassCore as logoFitClass,
  isLocalBusinessProfileCore
} from "./core/profile/profile-display-utils.js";
import {
  renderMenuItemModalCore,
  renderMenuDetailModalCore
} from "./core/menu/menu-modal-render-utils.js";
import { saveMenuItemFromModalCore } from "./core/menu/menu-save-utils.js";
import { deleteMenuItemByIdCore } from "./core/menu/menu-delete-utils.js";
import {
  renderCustomerModalCore,
  renderFocusModalCore
} from "./core/menu/customer-focus-modal-render-utils.js";
import {
  renderChatModalCore,
  renderProfileModalCore,
  renderLikesModalCore,
  renderPostModalCore
} from "./core/overlays/overlay-basic-render-utils.js";
import {
  renderCommentItemCore,
  renderPostCommentsCore,
  renderMenuCommentItemCore,
  renderMenuDetailCommentsCore
} from "./core/overlays/overlay-comment-render-utils.js";
import {
  updatePostModalCountsOnlyCore,
  updatePostModalCommentsOnlyCore
} from "./core/overlays/post-modal-update-utils.js";
import {
  updateMenuDetailCountsOnlyCore,
  updateMenuDetailCommentsOnlyCore
} from "./core/overlays/menu-detail-update-utils.js";
import {
  ensureOverlayRootCore,
  ensureModalEscapeHandlerCore,
  syncModalOpenUiStateCore
} from "./core/overlays/overlay-root-ui-utils.js";
import { renderMainCore } from "./core/ui/main-shell-render-utils.js";
import {
  renderNotificationsViewCore,
  renderNotificationsListCore
} from "./core/notifications/notifications-render-utils.js";
import {
  renderCrmLazyLoadingViewCore,
  renderCeoGuardCore
} from "./core/crm/crm-shared-render-utils.js";
import { bindOverlayEventsCore } from "./core/overlays/overlay-bind-orchestrator-utils.js";
import { renderOverlaysCore } from "./core/overlays/overlay-render-orchestrator-utils.js";
import { renderLeadModalCore } from "./core/leads/lead-modal-render-utils.js";
import { saveLeadFromModalCore } from "./core/leads/lead-save-utils.js";
import { deleteLeadFromModalCore } from "./core/leads/lead-delete-utils.js";
import { saveCustomerFromModalCore } from "./core/crm/customer-save-utils.js";
import { convertLeadToCustomerCore } from "./core/leads/lead-convert-utils.js";
import { saveCeoStaffFromViewCore } from "./core/crm/staff-save-utils.js";
import { renderSettingsViewCore } from "./core/ui/settings-render-utils.js";
import { escapeHtmlCore as escapeHtml } from "./core/common/html-utils.js";
import {
  clampCropPercentCore,
  getMenuItemCropCore,
  getMenuItemObjectPositionCore,
  getFocusItemCropCore,
  getFocusItemObjectPositionCore
} from "./core/media/crop-utils.js";
import { formatPriceCore as formatPrice, parsePriceValueCore as parsePriceValue } from "./core/common/price-utils.js";
import {
  normalizeOrderItemCore,
  normalizeOrderDocCore
} from "./core/orders/order-normalize-utils.js";
import { normalizeRestaurantTypeCore } from "./core/profile/restaurant-type-utils.js";
import { buildShopVariantKeyCore } from "./core/shop/shop-variant-utils.js";
import {
  normalizeOptionListCore as normalizeOptionList,
  normalizeMenuTypeCore as normalizeMenuType
} from "./core/menu/menu-input-utils.js";
import { normalizeMenuItemDocCore as normalizeMenuItemDoc } from "./core/menu/menu-doc-normalize-utils.js";
import {
  normalizeLeadCountryCore,
  buildLeadAccountEmailCore as buildLeadAccountEmail,
  inferLeadCountryFromTextCore
} from "./core/leads/lead-country-utils.js";
import { normalizeShopCartStateCore } from "./core/shop/shop-cart-state-utils.js";
import {
  getShopCartProfileContextCore,
  getCartCountForRestaurantCore,
  canAddToShopCartCore,
  getShopCartTotalCore
} from "./core/shop/shop-cart-access-utils.js";
import {
  getMenuRestaurantForProfileCore,
  ensureMenuDataForProfileCore,
  ensureFocusDataForProfileCore
} from "./core/profile/profile-menu-focus-utils.js";
import {
  getBusinessCatalogModeCore,
  getBusinessCatalogLabelCore,
  isShopCatalogProfileCore,
  isRestaurantCafeProfileCore
} from "./core/menu/catalog-mode-utils.js";
import { getBusinessProfileTypeCore } from "./core/profile/business-profile-type-utils.js";
import {
  createDefaultLeadPricingCore,
  normalizeLeadPricingCore
} from "./core/leads/lead-pricing-utils.js";
import {
  normalizeLeadSettingsCore,
  getLeadSettingsConfigCore,
  getLeadCountryCenterCore,
  buildLeadContactNameCore as buildLeadContactName,
  getLeadMonthlyPriceCore,
  getLeadPriceForCycleCore
} from "./core/leads/lead-settings-utils.js";
import {
  normalizeLeadStatusKeyCore as normalizeLeadStatusKey,
  leadStatusLabelCore,
  customerStatusLabelCore,
  isCustomerRestaurantCore,
  leadTypeLabelCore,
  resolveCustomerTypeCore
} from "./core/leads/lead-taxonomy-utils.js";
import { normalizeLeadTypeKeyCore as normalizeLeadTypeKey } from "./core/leads/lead-type-utils.js";
import {
  hasLeadLocationCoordsCore as hasLeadLocationCoords,
  toFiniteCoordNumberCore as toFiniteCoordNumber,
  normalizeCoordPairCore,
  preferStableCoordsCore,
  resolveCoordsFromShapeCore,
  resolveCoordsFromEntityCore
} from "./core/map/geo-coord-utils.js";
import {
  olcNormalizeLongitudeCore as olcNormalizeLongitude,
  olcClipLatitudeCore as olcClipLatitude,
  sanitizePlusCodeCore as sanitizePlusCode,
  extractPlusCodeFromTextCore,
  olcDecodeValueCore as olcDecodeValue,
  isLikelyFullPlusCodeCore,
  isLikelyShortPlusCodeCore,
  olcDecodeFullPlusCodeCore,
  olcEncodePairPrefixCore,
  olcRecoverShortCodeCore,
  resolvePlusCodeReferenceCoordsCore,
  geocodeReferenceSearchCore,
  parsePlusCodeFromAddressInputCore,
  parseCoordsFromAddressInputCore,
  parseCoordsFromAddressInputAsyncCore
} from "./core/map/plus-code-utils.js";
import {
  createLeadLocationCore as createLeadLocation,
  normalizeLeadLocationsCore,
  getPrimaryLeadLocationCore
} from "./core/leads/lead-location-utils.js";
import {
  isRestaurantMarkedDeletedCore,
  forceHiddenEmailLocalPartCore,
  isForceHiddenHandleCore,
  isForceHiddenUidCore,
  isForceHiddenEmailCore,
  isForceHiddenBusinessEntityCore,
  isPublicBusinessRecordCore
} from "./core/profile/business-visibility-utils.js";
import {
  isCeoUserCore,
  isAlbertCeoUserCore,
  hasGlobalCeoAccessCore,
  getCeoGpsOverrideCore
} from "./core/crm/ceo-access-utils.js";
import {
  parseCoordNumberCore as parseCoordNumber,
  uniqueStringListCore as uniqueStringList,
  normalizeCeoCountryCore,
  normalizeCeoPathCore,
  buildCeoNameCore as buildCeoName
} from "./core/crm/ceo-normalize-utils.js";
import { getCurrentCeoMetaCore } from "./core/crm/ceo-meta-utils.js";
import {
  normalizeCeoStaffRecordCore,
  overlayCeoStaffProfileCore,
  buildCeoDirectorySyncPatchCore
} from "./core/crm/ceo-staff-sync-utils.js";
import {
  computeLatestTimestampCore,
  saveFeedPostsCore
} from "./core/feed/feed-cache-utils.js";
import {
  buildStoriesSignatureCore,
  refreshFeedStoriesCore
} from "./core/feed/feed-story-utils.js";
import {
  getChatThreadIdCore,
  chatThreadStorageKeyCore,
  chatThreadDocRefCore,
  chatMessageDocRefCore,
  chatMessagesCollectionRefCore,
  getChatMessageTimestampCore,
  pruneChatMessagesCore,
  buildChatPreviewTextCore
} from "./core/chat/chat-utils.js";
import {
  saveChatThreadIndexCore,
  readChatThreadIndexListCore,
  buildChatThreadSummaryFromMessagesCore,
  rebuildLegacyChatThreadIndexFromStorageCore,
  mergeChatThreadListsCore,
  loadChatThreadIndexCore,
  sortChatThreadsCore,
  rebuildChatThreadIndexFromStorageCore
} from "./core/chat/chat-thread-index-utils.js";
import {
  normalizeChatThreadSummaryCore,
  getChatUnreadCountCore,
  upsertChatThreadListCore,
  isChatThreadArchivedCore,
  getChatThreadByIdCore,
  getActiveChatThreadSummaryCore
} from "./core/chat/chat-thread-state-utils.js";
import {
  getStringByteSizeCore,
  isChatInlineDataUrlCore,
  sanitizeChatAttachmentsForSyncCore,
  normalizeChatMessageRecordCore,
  loadLegacyChatThreadMessagesCore,
  readFileAsDataUrlCore,
  buildInlineChatAttachmentCore,
  loadChatThreadMessagesCore,
  saveChatThreadMessagesCore
} from "./core/chat/chat-message-utils.js";
import {
  buildChatThreadPatchFromMessagesCore,
  markIncomingChatMessagesAsReadCore,
  updateChatMessageListCore
} from "./core/chat/chat-message-state-utils.js";
import {
  buildChatMessageSyncContextCore,
  buildChatRemotePayloadBundleCore,
  buildChatMessageNotificationCore
} from "./core/chat/chat-remote-sync-utils.js";
import {
  collectUnreadIncomingChatMessagesCore,
  buildChatListenerLocalSeedCore,
  shouldUseChatLocalSeedCore,
  buildChatLocalMessageMapCore,
  buildSortedRemoteChatMessagesCore,
  hasUnreadIncomingRemoteMessagesCore
} from "./core/chat/chat-read-sync-utils.js";
import {
  shouldIgnoreChatMessagesSnapshotCore,
  resolveChatMessagesAfterSnapshotCore
} from "./core/chat/chat-message-listener-utils.js";
import {
  collectUnreadIncomingChatMessageIdsCore,
  buildChatUnreadResetPatchCore,
  buildChatMessageReadPatchCore
} from "./core/chat/chat-remote-read-write-utils.js";
import {
  normalizeRemoteChatReadSyncInputsCore,
  buildRemoteChatReadSyncWriteTasksCore
} from "./core/chat/chat-remote-read-sync-plan-utils.js";
import {
  renderChatMessagesPanelCore,
  renderChatPendingAttachmentsCore
} from "./core/chat/chat-render-utils.js";
import { renderChatListPanelCore } from "./core/chat/chat-list-render-utils.js";
import {
  mapChatThreadDocsToSummariesCore,
  buildMergedChatThreadsFromRemoteCore,
  shouldRenderChatThreadListAfterRemoteSyncCore
} from "./core/chat/chat-thread-listener-utils.js";
import {
  normalizeChatOpenProfileCore,
  buildChatModalStateOnOpenCore,
  buildClosedChatModalStateCore,
  buildFallbackChatThreadProfileCore,
  getSafeChatThreadIdFromThreadCore,
  shouldCloseChatModalForThreadCore,
  filterChatThreadsAfterDeleteCore
} from "./core/chat/chat-thread-action-state-utils.js";
import {
  buildNextChatAttachmentsCore,
  removePendingChatAttachmentCore,
  toggleChatMessageFlagCore,
  createOutgoingChatMessageCore
} from "./core/chat/chat-compose-utils.js";
import {
  resolveChatSendPayloadCore,
  buildChatSendLocalUpdateCore
} from "./core/chat/chat-send-flow-utils.js";
import {
  captureChatInputFocusStateCore,
  restoreChatInputFocusStateCore,
  scrollChatMessagesToBottomCore,
  autosizeTextareaCore
} from "./core/chat/chat-dom-utils.js";
import {
  bindProfileOverlayEventsCore,
  bindLikesOverlayEventsCore,
  bindCustomerOverlayEventsCore
} from "./core/overlays/overlay-basic-bind-utils.js";
import {
  bindChatOverlayEventsCore,
  bindPostOverlayEventsCore
} from "./core/overlays/overlay-chat-post-bind-utils.js";
import {
  bindMenuOverlayEventsCore,
  bindFocusOverlayEventsCore
} from "./core/overlays/overlay-menu-focus-bind-utils.js";
import { bindLeadOverlayEventsCore } from "./core/overlays/overlay-lead-bind-utils.js";
import { bindMenuDetailOverlayEventsCore } from "./core/overlays/overlay-menu-detail-bind-utils.js";
import { bindAppShellEventsCore } from "./core/app-events/app-events-shell-bind-utils.js";
import { bindAppMenuFocusEventsCore } from "./core/app-events/app-events-menu-focus-bind-utils.js";
import { bindAppSettingsProfileEventsCore } from "./core/app-events/app-events-settings-profile-bind-utils.js";
import { bindAppChatUploadEventsCore } from "./core/app-events/app-events-chat-upload-bind-utils.js";
import {
  bindCrmStaffEventsCore,
  bindLeadInlineCreateEventsCore
} from "./core/app-events/app-events-crm-staff-bind-utils.js";
import { bindAppEventsCore as bindAppEventsMainCore } from "./core/app-events/app-events-main-bind-utils.js";
import {
  ensureTabDataCore,
  loadAuthProfileCore
} from "./core/auth/tab-auth-load-utils.js";

const appEl = document.getElementById("app");
const FIREBASE_MESSAGING_MODULE_URL = "https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging.js";
const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

const ADMIN_LOGINS = {
  admin: {
    email: "admin@menyra.local",
    password: "admin",
    profile: {
      displayName: `${BRAND_UI.title} HQ`,
      city: "Prishtina",
      role: "business",
      avatarUrl: ""
    }
  },
  admin1: {
    email: "admin1@menyra.local",
    password: "admin1",
    profile: {
      displayName: "Max Mustermann",
      city: "Prishtina",
      role: "user",
      avatarUrl: ""
    }
  }
};

const DEFAULT_PROFILE = {
  name: "",
  handle: "",
  bio: "",
  avatar: "",
  location: "",
  address: "",
  followers: 0,
  following: 0,
  privateAccount: false,
  karma: "0",
  roles: [],
  role: "user",
  isPremium: false,
  restaurantId: "",
  leadSettings: null,
  posts: []
};

const DEFAULT_SETTINGS = {
  darkMode: false,
  privateAccount: false,
  showOnline: false,
  pushNotifs: true,
  emailNotifs: false,
  language: "Deutsch"
};

const DEFAULT_MENU_LAYOUT = {
  cardColor: "white"
};

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
const NOTIFICATIONS_LIVE_LIMIT = 12;
const PUSH_SEEN_NOTIFICATIONS_LIMIT = 120;
const PUSH_TOKEN_SYNC_INTERVAL_MS = 12 * 60 * 60 * 1000;
// Firebase Console -> Cloud Messaging -> Web Push certificate key pair (public VAPID key)
const FCM_WEB_PUSH_VAPID_KEY = "BERxbC5-yX8miGIVaFJGAapzd0-jL0D9HQf3swOJiKZcAJsAO_FoC-8v7DCCcDgmfgkKcMVd0X6VVq8zD2hePqk";
const PUSH_SW_URL = "/apps/menyra-social/sw.js";
const PUSH_SW_SCOPE = "/apps/menyra-social/";
const PUSH_SW_READY_TIMEOUT_MS = 10000;
const CRM_LAZY_RENDERERS_MODULE_URL = "/apps/menyra-social/_shared/crm-lazy-renderers.js?v=2026-03-07-perf-9";
const COMMENT_AVATAR_REMOTE_FETCH_ENABLED = false;
const DETAIL_COMMENTS_LIMIT = 8;
const DETAIL_LIKES_LIMIT = 12;

const LEAD_SOCIAL_DEFAULT_PASSWORD = "Alberthoti1992";
const LEAD_STATUS_ORDER = ["registered", "contacted", "testphase", "kunde", "no_interest"];
const LEAD_STATUS_LABELS = {
  registered: "Registriert",
  contacted: "Kontaktiert",
  testphase: "Testphase",
  kunde: "Kunde",
  no_interest: "Keine Interesse"
};
const LEAD_TYPE_ORDER = ["restaurant", "cafe", "fastfood", "ecommerce", "tankstelle", "lebensmittel", "apotheken", "services"];
const LEAD_TYPE_LABELS = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  fastfood: "Fastfood",
  ecommerce: "E-Commerce",
  tankstelle: "Tankstelle",
  lebensmittel: "Lebensmittel",
  apotheken: "Apotheke",
  services: "Services"
};
const ALBERT_CEO_UID = "aklBkkIuZ7Nrpx266TJn63rrxX62";
const ALBERT_CEO_ALIASES = Object.freeze(["alberthoti", "albert_hoti"]);
const ALBERT_CEO_EMAILS = Object.freeze(["alberthoti.vsa@gmail.com"]);
const HIDDEN_LEGACY_CEO_EMAILS = Object.freeze(["albert.hoti@menyra.com"]);
const FORCE_HIDDEN_SOCIAL_HANDLES = Object.freeze(["allo88", "alo2", "alo", "hhh", "llll"]);
const FORCE_HIDDEN_SOCIAL_UIDS = Object.freeze([
  "oqyh9TmALTdH3GqUvtz1qO9DFcC2",
  "5rdVYRGrfFfMna0W9irKsidxIpr1",
  "5h3DKB7fu9Q0xiIkhUsYC1PqJPh2",
  "4l9h3hDWaPPQq5ePoDhy2aVJeaf1",
  "hYlBZN6WNQMIlrgEZDPLbyRGsro1"
]);
const FORCE_HIDDEN_SOCIAL_HANDLE_SET = new Set(FORCE_HIDDEN_SOCIAL_HANDLES);
const FORCE_HIDDEN_SOCIAL_UID_SET = new Set(FORCE_HIDDEN_SOCIAL_UIDS);
const MILAN_OWNED_LEAD_EMAILS = Object.freeze([
  "restorandis@menyra.com",
  "restoranbelvedere@menyra.com",
  "restoranoresac@menyra.com",
  "zeigelrestaurant@menyra.com"
]);
const MILAN_OWNED_LEAD_BUSINESSES = Object.freeze([
  "restoran dis",
  "restoran belvedere",
  "restoran oresac",
  "zeigelrestaurant"
]);
const ALBERT_OWNED_LEAD_EMAILS = Object.freeze([
  "mobishopniti@menyra.com",
  "pizzeriadon@menyra.com",
  "antica@menyra.com"
]);
const ALBERT_OWNED_LEAD_BUSINESSES = Object.freeze([
  "mobi shop niti",
  "pizzeria don napoletano",
  "antica"
]);
const CEO_COUNTRIES = Object.freeze(["Albanien", "Kosovo", "Serbien"]);
const LEAD_SETTINGS_DEFAULT_COUNTRY = "Kosovo";
const LEAD_COUNTRY_CENTERS = Object.freeze({
  Kosovo: Object.freeze({ lat: 42.6629, lng: 21.1655 }),
  Serbien: Object.freeze({ lat: 44.7866, lng: 20.4489 }),
  Albanien: Object.freeze({ lat: 41.3275, lng: 19.8187 })
});
const PRISHTINA_COORDS = Object.freeze({ lat: 42.6629, lng: 21.1655 });

const DEFAULT_NOTIFICATIONS = [
  {
    id: "n1",
    type: "like",
    user: "Marco",
    text: "hat dein Foto geliked",
    time: "10m",
    img: "",
    read: false
  },
  {
    id: "n2",
    type: "follow",
    user: "Elena",
    text: "folgt dir jetzt",
    time: "1h",
    img: "",
    read: false
  },
  {
    id: "n3",
    type: "system",
    user: `${BRAND_UI.title} Team`,
    text: "Willkommen zurueck!",
    time: "2h",
    img: "",
    read: true
  }
];

const MENU_LAYOUT_COLORS = [
  { id: "white", label: "White", swatch: "bg-white border border-slate-200", cardClass: "bg-white border-slate-100" },
  { id: "mint", label: "Mint", swatch: "bg-emerald-400", cardClass: "bg-emerald-50 border-emerald-100" },
  { id: "sky", label: "Sky", swatch: "bg-sky-400", cardClass: "bg-sky-50 border-sky-100" },
  { id: "lemon", label: "Lemon", swatch: "bg-yellow-300", cardClass: "bg-yellow-50 border-yellow-100" },
  { id: "peach", label: "Peach", swatch: "bg-orange-300", cardClass: "bg-orange-50 border-orange-100" },
  { id: "rose", label: "Rose", swatch: "bg-rose-300", cardClass: "bg-rose-50 border-rose-100" }
];

const ROLE_SWITCH_ORDER = ["ceo", "owner", "staff"];
const ROLE_SWITCH_LABELS = {
  ceo: "CEO",
  owner: "Owner",
  staff: "Staff"
};
const businessProfileCache = new Map();
const userProfileCache = new Map();
const restaurantOwnerCache = new Map();
const menuCache = new Map();
const focusCache = new Map();
const menuItemCountsRequested = new Set();
const PERF_WARM_KEY = "menyra_social_perf_warm_v1";
const PERF_CONNECTION = typeof navigator !== "undefined"
  ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection || null)
  : null;
const PERF_EFFECTIVE_TYPE = String(PERF_CONNECTION?.effectiveType || "").trim().toLowerCase();
const PERF_SLOW_NETWORK = ["slow-2g", "2g", "3g"].includes(PERF_EFFECTIVE_TYPE);
const PERF_SAVE_DATA = !!PERF_CONNECTION?.saveData;
const PERF_DEVICE_MEMORY = typeof navigator !== "undefined" ? Number(navigator.deviceMemory || 0) : 0;
const PERF_CPU_CORES = typeof navigator !== "undefined" ? Number(navigator.hardwareConcurrency || 0) : 0;
const PERF_LOW_MEMORY = Number.isFinite(PERF_DEVICE_MEMORY) && PERF_DEVICE_MEMORY > 0 && PERF_DEVICE_MEMORY <= 2;
const PERF_LOW_CPU = Number.isFinite(PERF_CPU_CORES) && PERF_CPU_CORES > 0 && PERF_CPU_CORES <= 4;
const PERF_WARM_VISIT = String(safeStorage.getItem(PERF_WARM_KEY) || "").trim() === "1";
const PERF_CONSTRAINED = PERF_SLOW_NETWORK || PERF_SAVE_DATA || PERF_LOW_MEMORY || PERF_LOW_CPU || !PERF_WARM_VISIT;
const FAST_LIMITS = {
  feed: PERF_CONSTRAINED ? 10 : 20,
  feedFallback: PERF_CONSTRAINED ? 14 : 40,
  feedDelta: PERF_CONSTRAINED ? 6 : 8,
  userPosts: PERF_CONSTRAINED ? 12 : 24,
  businessPosts: PERF_CONSTRAINED ? 12 : 24,
  restaurants: PERF_CONSTRAINED ? 40 : 80,
  stories: PERF_CONSTRAINED ? 10 : 24,
  storiesFallback: PERF_CONSTRAINED ? 12 : 30,
  storyIdentityHydration: PERF_CONSTRAINED ? 8 : 12,
  likes: PERF_CONSTRAINED ? 12 : 20,
  comments: PERF_CONSTRAINED ? 24 : 40
};
const SEARCH_LIMITS = {
  users: PERF_CONSTRAINED ? 8 : 10,
  businesses: PERF_CONSTRAINED ? 10 : 12
};
const FAST_MODE = true;
const CACHE_KEYS = {
  feed: "menyra_social_feed_cache_v1",
  restaurants: "menyra_social_restaurants_cache_v1",
  stories: "menyra_social_stories_cache_v1"
};
const PUBLIC_BOOTSTRAP_EVENT = "menyra-social-bootstrap";
const DEFAULT_PUBLIC_BOOTSTRAP_ENDPOINT = "https://us-central1-menyra-c0e68.cloudfunctions.net/socialBootstrapFeed";
const userPostsKey = (uid) => (uid ? `menyra_social_user_posts_cache_v1::${uid}` : "");
const businessPostsKey = (rid) => (rid ? `menyra_social_business_posts_cache_v1::${rid}` : "");
const staffCacheKey = (uid) => (uid ? `menyra_social_staff_cache_v1::${uid}` : "");
const leadPageCacheKey = (uid, scope) => (uid && scope ? `menyra_social_leads_cache_v1::${uid}::${scope}` : "");
const customerPageCacheKey = (uid, scope) => (uid && scope ? `menyra_social_customers_cache_v1::${uid}::${scope}` : "");
const CACHE_TTL_MS = {
  feed: 10 * 60 * 1000,
  posts: 10 * 60 * 1000,
  restaurants: 60 * 60 * 1000,
  stories: 10 * 60 * 1000,
  staff: 90 * 1000,
  crmPages: 90 * 1000
};
const FEED_DELTA_MIN_MS = 15 * 60 * 1000;
const FEED_PRELOAD_LIMIT = PERF_CONSTRAINED ? 1 : 3;
const FEED_PRELOAD_ATTR = "data-menyrasocial-feed-preload";
const FEED_META_LISTEN_LIMIT = 20;
const CRM_PAGE_SIZE = 20;
let publicBootstrapListenerBound = false;
let publicBootstrapFetchPromise = null;

function applyRuntimePerfMode() {
  if (!FAST_MODE && !PERF_CONSTRAINED) return;
  if (typeof document === "undefined") return;
  document.documentElement.classList.add("fast-mode");
  const applyBody = () => {
    if (document.body) document.body.classList.add("fast-mode");
  };
  applyBody();
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", applyBody, { once: true });
  }
}

function schedulePerfWarmMark() {
  if (PERF_WARM_VISIT) return;
  const markWarm = () => {
    safeStorage.setItem(PERF_WARM_KEY, "1");
  };
  if (typeof window === "undefined") {
    markWarm();
    return;
  }
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(markWarm, { timeout: 3500 });
  } else {
    window.setTimeout(markWarm, 1200);
  }
}

applyRuntimePerfMode();

function createLeadScopeMap(factory = () => null) {
  return createLeadScopeMapCore(factory);
}

function createCustomerScopeMap(factory = () => null) {
  return createCustomerScopeMapCore(factory);
}

function createEmptyLeadsState() {
  return createEmptyLeadsStateCore({
    pageSize: CRM_PAGE_SIZE
  });
}

function createEmptyCustomersState() {
  return createEmptyCustomersStateCore({
    pageSize: CRM_PAGE_SIZE
  });
}

const state = {
  user: null,
  activeTab: "feed",
  drawerOpen: false,
  feedCategory: "all",
  settingsView: "main",
  selectedBusiness: null,
  isLoading: false,
  feedPosts: [],
  restaurants: [],
  restaurantMap: new Map(),
  businessLocations: [],
  stories: [],
  userPosts: [],
  businessPosts: [],
  userProfile: { ...DEFAULT_PROFILE },
  roleSwitchRoles: [],
  roleSwitchRestaurantId: "",
  followingHandles: [],
  followingTargetIds: [],
  pendingFollowRequests: [],
  chatThreads: [],
  shopCart: createEmptyShopCart(),
  orders: createEmptyOrdersState(),
  favoriteMenuItems: createEmptyFavoriteMenuItemsState(),
  profileView: null,
  profileBackTab: "feed",
  profileViewMode: "grid",
  profileTopTab: "profile",
  profileContentTab: "posts",
  profileCheckins: [],
  profilePostMenuId: null,
  profileModal: {
    open: false,
    profile: null
  },
  chatModal: {
    open: false,
    profile: null,
    messages: [],
    draft: "",
    attachments: []
  },
  chatSettingsOpen: false,
  chatListScope: "inbox",
  chatThreadMenuId: "",
  menu: {
    restaurantId: "",
    items: [],
    loading: false,
    error: "",
    filter: "all",
    query: "",
    source: "hybrid"
  },
  menuModal: {
    open: false,
    mode: "create",
    item: null,
    status: "",
    loading: false,
    imageUrlDraft: "",
    cropX: 50,
    cropY: 50,
    imageFiles: [],
    imagePreviews: [],
    existingImages: []
  },
  menuDetail: {
    ...createEmptyMenuDetailState()
  },
  focus: {
    restaurantId: "",
    items: [],
    loading: false,
    enabled: true,
    error: "",
    index: 0
  },
  focusModal: {
    open: false,
    mode: "create",
    item: null,
    status: "",
    loading: false,
    cropX: 50,
    cropY: 50,
    imageFile: null,
    imagePreview: ""
  },
  leads: createEmptyLeadsState(),
  customers: createEmptyCustomersState(),
  staff: {
    items: [],
    view: "list",
    editorUid: "",
    loading: false,
    loadingMore: false,
    hasMore: false,
    pageSize: CRM_PAGE_SIZE,
    saving: false,
    deleting: false,
    error: "",
    status: "",
    form: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      country: CEO_COUNTRIES[0],
      locationLabel: "",
      coords: null,
      avatarUrl: "",
      avatarPreview: "",
      avatarFile: null
    }
  },
  leadModal: {
    open: false,
    mode: "create",
    lead: null,
    status: "",
    loading: false,
    deleting: false,
    actionsOpen: false,
    logoFile: null,
    logoPreview: "",
    coords: null,
    locations: []
  },
  customerModal: {
    open: false,
    mode: "edit",
    customer: null,
    status: "",
    loading: false,
    logoFile: null,
    logoPreview: ""
  },
  settings: { ...DEFAULT_SETTINGS },
  menuLayout: { ...DEFAULT_MENU_LAYOUT },
  menuItemMeta: {},
  notifications: [...DEFAULT_NOTIFICATIONS],
  postMeta: {},
  postModal: {
    open: false,
    post: null,
    commentText: "",
    replyTo: null,
    loading: false,
    animate: false,
    sending: false
  },
  likesModal: {
    open: false,
    postId: "",
    animate: false
  },
  upload: {
    preview: "",
    caption: "",
    file: null,
    status: "",
    mode: "feed"
  },
  search: {
    query: "",
    filter: "all",
    userResults: [],
    businessResults: [],
    loading: false,
    error: "",
    keepFocus: false
  },
  auth: {
    mode: "login",
    role: "user",
    loading: false,
    error: "",
    open: false
  }
};

let renderSuspended = 0;
let ceoCrmCountsPromise = null;
let renderQueued = false;
let modalEscapeBound = false;
let profileMenuBound = false;
let pendingCommentHighlight = "";
let lastCommentKey = "";
let lastCommentAt = 0;
let lastMenuCommentKey = "";
let lastMenuCommentAt = 0;
let lastMenuOpenGestureKey = "";
let lastMenuOpenGestureAt = 0;
let menuDetailCloseBound = false;
let overlayCache = { profile: "", chat: "", post: "", likes: "", menu: "", menuDetail: "", focus: "", lead: "", customer: "" };
let pendingProfileRestaurantId = "";
let pendingProfileTopTab = "";
let pendingProfileHandled = false;
let pendingNotificationId = "";
let pendingNotificationHandled = false;
let pendingPostId = "";
let pendingPostHandled = false;
let pendingChatUid = "";
let pendingChatHandled = false;
let pushOpenMessageBound = false;
let dataLoaded = {
  feed: false,
  profile: false,
  restaurants: false,
  stories: false,
  following: false,
  notifications: false,
  leads: false,
  customers: false,
  staff: false
};
let shellRuntimeController = null;
let profileMenuFocusRenderController = null;
let sessionDataRuntimeController = null;
let socialEngagementRuntimeController = null;
let crmRuntimeController = null;
let chatRuntimeController = null;
let lastAppHtml = "";
let lastRenderMode = "";
let lastRenderedMainTab = "";
let feedDeltaTimer = null;
let crmAutoLoadObserver = null;
let notificationsUnsub = null;
let followingUnsub = null;
let userDocUnsub = null;
let userDocLiveKey = "";
let pushMessagingClient = null;
let firebaseMessagingModulePromise = null;
let pushActivationIssue = "";
let profileViewUnsub = null;
let feedUnsub = null;
let storiesUnsub = null;
let ordersUnsub = null;
let ordersListenerKey = "";
let restaurantsUnsub = null;
let userPostsUnsub = null;
let businessPostsUnsub = null;
let modalPostDocUnsub = null;
let modalLikesUnsub = null;
let modalCommentsUnsub = null;
let menuDetailDocUnsub = null;
let menuDetailLikesUnsub = null;
let menuDetailCommentsUnsub = null;
let restaurantMetaUnsubs = new Map();
let storyRefreshTimer = null;
let liveFeedDisabled = false;
let liveStoriesDisabled = false;
let feedStoriesSignature = "";
let storiesRowSignature = "";
let storiesFreshReconcileQueued = false;
const pendingStoryIdentityHydrationIds = new Set();
let storyIdentityHydrationQueued = false;
let focusRotateTimer = null;
let focusRotateKey = "";
let authInitialized = false;
let authBootstrapSnapshot = null;
let pendingInitialTab = "";
let pendingAuthMode = "";
let authTransitionSeq = 0;

function suspendRender() {
  renderSuspended += 1;
}

function resumeRender() {
  if (renderSuspended > 0) renderSuspended -= 1;
  if (renderSuspended === 0 && renderQueued) {
    renderQueued = false;
    render();
  }
}


const restaurantLogoCache = new Map();
const userSearchAvatarCache = new Map();
const commentAvatarCache = new Map();
const commentAvatarPending = new Set();
let userAvatarCache = "";
let lastShellAvatarUrl = "";
let logoCacheWriteTimer = null;
let avatarCacheWriteTimer = null;
let lastAuthUid = "";
try {
  const initialRouteState = resolveInitialRouteState({
    qs,
    normalizeInitialTab,
    normalizeAuthMode
  });
  pendingProfileRestaurantId = initialRouteState.pendingProfileRestaurantId;
  pendingProfileTopTab = initialRouteState.pendingProfileTopTab;
  pendingNotificationId = initialRouteState.pendingNotificationId;
  pendingPostId = initialRouteState.pendingPostId;
  pendingChatUid = initialRouteState.pendingChatUid;
  pendingInitialTab = initialRouteState.pendingInitialTab;
  pendingAuthMode = initialRouteState.pendingAuthMode;
} catch {}

function isGuestSession() {
  return isGuestSessionCore(state.user);
}

function sanitizeTabForSession(tab, { hasProfileView = !!state.profileView } = {}) {
  return sanitizeTabForSessionCore(tab, { user: state.user, hasProfileView });
}

function openGuestAuthPrompt(message = "Bitte registrieren oder einloggen, um diese Funktion zu nutzen.") {
  if (!isGuestSession()) return false;
  state.auth.mode = normalizeAuthMode(state.auth.mode) || "login";
  state.auth.error = String(message || "").trim() || "Bitte registrieren oder einloggen.";
  state.auth.open = true;
  state.drawerOpen = false;
  render();
  return true;
}

function applyPendingInitialRouteState() {
  const next = applyPendingInitialRouteStateCore({
    activeTab: state.activeTab,
    user: state.user,
    hasProfileView: !!state.profileView,
    pendingInitialTab,
    pendingAuthMode,
    authMode: state.auth.mode,
    authOpen: !!state.auth.open
  });
  state.activeTab = next.activeTab;
  pendingInitialTab = next.pendingInitialTab;
  pendingAuthMode = next.pendingAuthMode;
  state.auth.mode = next.authMode;
  state.auth.open = next.authOpen;
}

function getActiveUid() {
  return state.user?.uid || state.userProfile?.uid || "";
}

function saveUserProfileToStorage(profile = state.userProfile) {
  const uid = profile?.uid || state.user?.uid || "";
  if (!uid) return;
  try {
    safeStorage.setItem(profileKey(uid), JSON.stringify(profile));
  } catch {}
  writeAuthBootstrapSnapshot({
    uid,
    name: profile?.name || state.user?.displayName || "",
    handle: profile?.handle || "",
    avatar: profile?.avatar || state.user?.photoURL || userAvatarCache || ""
  });
}

function readAuthBootstrapSnapshot() {
  return readAuthBootstrapSnapshotCore({
    safeStorage,
    authSnapshotKey: STORAGE_KEYS.authSnapshot,
    now: () => Date.now()
  });
}

function writeAuthBootstrapSnapshot(snapshot = null) {
  const payload = buildAuthBootstrapSnapshotPayload({
    snapshot,
    user: state.user,
    userProfile: state.userProfile,
    userAvatarCache,
    sanitizeDisplayName,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    now: () => Date.now()
  });
  if (!payload) return;
  authBootstrapSnapshot = payload;
  persistAuthBootstrapSnapshot({
    safeStorage,
    authSnapshotKey: STORAGE_KEYS.authSnapshot,
    payload
  });
}

function clearAuthBootstrapSnapshot() {
  authBootstrapSnapshot = null;
  clearAuthBootstrapSnapshotStorage({
    safeStorage,
    authSnapshotKey: STORAGE_KEYS.authSnapshot
  });
}

function applyAuthBootstrapSnapshot(snapshot = authBootstrapSnapshot) {
  const result = applyAuthBootstrapSnapshotToProfile({
    snapshot,
    defaultProfile: DEFAULT_PROFILE,
    currentProfile: state.userProfile,
    sanitizeDisplayName,
    getOptimizedImageUrl
  });
  if (!result.applied) return false;
  state.userProfile = result.nextProfile;
  if (result.resolvedAvatar && !isPlaceholderUrl(result.resolvedAvatar)) {
    userAvatarCache = result.resolvedAvatar;
    lastShellAvatarUrl = result.resolvedAvatar;
  }
  return true;
}

function applyPersistedAuthProfileHints(uid = "") {
  const safeUid = String(uid || "").trim();
  if (!safeUid) return false;
  const raw = safeStorage.getItem(profileKey(safeUid));
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) || {};
    const restaurantId = String(parsed.restaurantId || "").trim();
    const role = String(parsed.role || "").trim();
    const roles = Array.isArray(parsed.roles) ? parsed.roles.slice() : [];
    const name = sanitizeDisplayName(parsed.name || "", "");
    const handle = String(parsed.handle || "").replace(/^@/, "").trim();
    const avatar = String(parsed.avatar || "").trim();
    state.userProfile = {
      ...state.userProfile,
      uid: safeUid,
      role: role || state.userProfile.role,
      roles: roles.length ? roles : state.userProfile.roles,
      restaurantId: restaurantId || state.userProfile.restaurantId,
      name: name || state.userProfile.name,
      handle: handle || state.userProfile.handle,
      avatar: avatar || state.userProfile.avatar
    };
    return true;
  } catch {
    return false;
  }
}

function saveMenuLayoutToStorage(layout = state.menuLayout) {
  saveMenuLayoutToStorageCore({
    safeStorage,
    menuLayoutKey: STORAGE_KEYS.menuLayout,
    layout
  });
}

function getMenuLayoutTheme(colorId = state.menuLayout?.cardColor) {
  return getMenuLayoutThemeCore({
    colorId,
    themes: MENU_LAYOUT_COLORS
  });
}

function getFocusCardClass() {
  return getFocusCardClassCore({
    colorId: state.menuLayout?.cardColor,
    themes: MENU_LAYOUT_COLORS,
    fallbackClass: "bg-white border-slate-100"
  });
}

function loadLogoCache() {
  loadLogoCacheCore({
    safeStorage,
    logoCacheKey: STORAGE_KEYS.logoCache,
    isPlaceholderUrl,
    restaurantLogoCache
  });
}

function scheduleLogoCacheWrite() {
  scheduleLogoCacheWriteCore({
    windowObj: typeof window === "undefined" ? null : window,
    hasPendingTimer: !!logoCacheWriteTimer,
    setPendingTimer: (timer) => { logoCacheWriteTimer = timer; },
    safeStorage,
    logoCacheKey: STORAGE_KEYS.logoCache,
    restaurantLogoCache,
    delayMs: 400
  });
}

function loadAvatarCache(uid) {
  const cached = loadAvatarCacheCore({
    uid,
    safeStorage,
    avatarKey
  });
  if (!cached) return;
  userAvatarCache = cached;
}

function scheduleAvatarCacheWrite(url, uid = getActiveUid()) {
  scheduleAvatarCacheWriteCore({
    windowObj: typeof window === "undefined" ? null : window,
    url,
    uid,
    isPlaceholderUrl,
    hasPendingTimer: !!avatarCacheWriteTimer,
    setPendingTimer: (timer) => { avatarCacheWriteTimer = timer; },
    safeStorage,
    avatarKey,
    onPersist: (persistedUid, persistedUrl) => {
      writeAuthBootstrapSnapshot({ uid: persistedUid, avatar: persistedUrl });
    },
    delayMs: 300
  });
}

function resolveRestaurantLogo(restaurantId, raw, size = "avatar", allowCacheFallback = true) {
  return resolveRestaurantLogoCore({
    restaurantId,
    raw,
    size,
    allowCacheFallback,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    restaurantLogoCache,
    onCacheUpdated: scheduleLogoCacheWrite
  });
}

function resolveUserAvatar(raw) {
  const result = resolveUserAvatarCore({
    raw,
    userPhotoURL: state.user?.photoURL || "",
    userAvatarCache,
    getOptimizedImageUrl,
    isPlaceholderUrl
  });
  if (result.nextUserAvatarCache && result.nextUserAvatarCache !== userAvatarCache) {
    userAvatarCache = result.nextUserAvatarCache;
  }
  if (result.shouldScheduleWrite && userAvatarCache) {
    scheduleAvatarCacheWrite(userAvatarCache);
  }
  return result.url;
}

function resolveShellAvatarUrl() {
  const result = resolveShellAvatarUrlCore({
    profileAvatar: state.userProfile.avatar || "",
    userPhotoURL: state.user?.photoURL || "",
    userAvatarCache,
    lastShellAvatarUrl,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    placeholderImage: PLACEHOLDER_IMAGE
  });
  if (result.nextUserAvatarCache && result.nextUserAvatarCache !== userAvatarCache) {
    userAvatarCache = result.nextUserAvatarCache;
  }
  if (result.nextLastShellAvatarUrl && result.nextLastShellAvatarUrl !== lastShellAvatarUrl) {
    lastShellAvatarUrl = result.nextLastShellAvatarUrl;
  }
  if (result.shouldScheduleWrite && result.url && !isPlaceholderUrl(result.url)) {
    scheduleAvatarCacheWrite(result.url);
  }
  return result.url;
}

function getSelfAvatarUrl() {
  const raw = state.userProfile.avatar || state.user?.photoURL || userAvatarCache || "";
  const url = getOptimizedImageUrl(raw, "avatar");
  return isPlaceholderUrl(url) ? "" : url;
}

function primeSelfAvatarCache(url) {
  if (!url || isPlaceholderUrl(url)) return;
  userAvatarCache = url;
  scheduleAvatarCacheWrite(url);
  const canTouchDom = typeof document !== "undefined";
  if (state.user?.uid) {
    commentAvatarCache.set(state.user.uid, url);
    if (canTouchDom) updateCommentAvatarNodesByUid(state.user.uid, url);
  }
  const handleKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
  if (handleKey) {
    commentAvatarCache.set(handleKey, url);
    if (canTouchDom) updateCommentAvatarNodes(handleKey, url);
  }
}

function resolveUserAvatarInstant(raw) {
  return resolveUserAvatar(raw);
}

function resolveSearchUserAvatarDisplay(user) {
  const uid = user?.uid || "";
  const name = user?.name || user?.displayName || "";
  const handle = user?.handle || "";
  const raw = user?.avatarUrl || user?.avatar || "";
  const url = getOptimizedImageUrl(raw, "avatar");
  if (!isPlaceholderUrl(url)) {
    if (uid && userSearchAvatarCache.get(uid) !== url) {
      userSearchAvatarCache.set(uid, url);
    }
    return url;
  }
  if (uid) {
    const cached = userSearchAvatarCache.get(uid);
    if (cached) return cached;
  }
  return getOptimizedImageUrl("", "avatar");
}

function resolveNotificationAvatar(notif) {
  const raw = notif?.img || notif?.avatar || "";
  const url = getOptimizedImageUrl(raw, "avatar");
  if (!isPlaceholderUrl(url)) return url;
  return getOptimizedImageUrl("", "avatar");
}

function resolveLikeAvatar(user) {
  const raw = user?.avatarUrl || user?.avatar || "";
  const url = getOptimizedImageUrl(raw, "avatar");
  if (!isPlaceholderUrl(url)) return url;
  return getOptimizedImageUrl("", "avatar");
}
function resolveCommentAvatar(comment) {
  if (!comment) return getOptimizedImageUrl("", "avatar");
  const handleKey = normalizeHandle(comment.handle || comment.author || "");
  const selfUid = state.user?.uid || "";
  const selfHandle = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
  const isSelf = (!!selfUid && comment.uid && String(comment.uid) === String(selfUid))
    || (!!selfHandle && handleKey && handleKey === selfHandle);
  const selfAvatar = getSelfAvatarUrl();
  if (isSelf && selfAvatar) {
    primeSelfAvatarCache(selfAvatar);
    if (selfUid) commentAvatarCache.set(selfUid, selfAvatar);
    if (handleKey) commentAvatarCache.set(handleKey, selfAvatar);
    return selfAvatar;
  }
  const url = getOptimizedImageUrl(
    comment.avatarUrl || comment.avatar || comment.avatarURL || comment.photoURL || "",
    "avatar"
  );
  if (!isPlaceholderUrl(url)) {
    if (handleKey && commentAvatarCache.get(handleKey) !== url) {
      commentAvatarCache.set(handleKey, url);
    }
    if (comment.uid && commentAvatarCache.get(comment.uid) !== url) {
      commentAvatarCache.set(comment.uid, url);
    }
    return url;
  }
  if (handleKey) {
    const cached = commentAvatarCache.get(handleKey);
    if (cached) return cached;
  }
  if (comment.uid) {
    const cachedByUid = commentAvatarCache.get(comment.uid);
    if (cachedByUid) return cachedByUid;
    if (state.user?.uid && comment.uid === state.user.uid) {
      const selfAvatar = resolveUserAvatarInstant(state.userProfile.avatar);
      if (!isPlaceholderUrl(selfAvatar)) {
        commentAvatarCache.set(comment.uid, selfAvatar);
        if (handleKey) commentAvatarCache.set(handleKey, selfAvatar);
        return selfAvatar;
      }
    }
  } else if (handleKey) {
    const selfKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "user");
    if (handleKey === selfKey) {
      const selfAvatar = resolveUserAvatar(state.userProfile.avatar);
      if (!isPlaceholderUrl(selfAvatar)) {
        commentAvatarCache.set(handleKey, selfAvatar);
        return selfAvatar;
      }
    }
  }
  return getOptimizedImageUrl("", "avatar");
}

function updateCommentAvatarNodes(handleKey, url) {
  if (!handleKey || !url || isPlaceholderUrl(url)) return;
  const safe = escapeSelector(handleKey);
  document.querySelectorAll(`[data-comment-handle="${safe}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== url) img.setAttribute("src", url);
  });
}

function updateCommentAvatarNodesByUid(uid, url) {
  if (!uid || !url || isPlaceholderUrl(url)) return;
  const safe = escapeSelector(uid);
  document.querySelectorAll(`[data-comment-uid="${safe}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== url) img.setAttribute("src", url);
  });
}

function updateCommentAvatarNodesById(commentId, url) {
  if (!commentId || !url || isPlaceholderUrl(url)) return;
  const safe = escapeSelector(commentId);
  document.querySelectorAll(`img[data-img-key="comment-avatar:${safe}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== url) img.setAttribute("src", url);
  });
}

function scheduleCommentAvatarDomUpdate(uid, handleKey, url) {
  if (!url || isPlaceholderUrl(url)) return;
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    if (uid) updateCommentAvatarNodesByUid(uid, url);
    if (handleKey) updateCommentAvatarNodes(handleKey, url);
  });
}

function refreshSelfCommentAvatars({ attempt = 0, maxAttempts = 6 } = {}) {
  const url = getSelfAvatarUrl() || userAvatarCache || "";
  if (!url || isPlaceholderUrl(url)) {
    if (attempt < maxAttempts && typeof window !== "undefined") {
      window.setTimeout(() => refreshSelfCommentAvatars({ attempt: attempt + 1, maxAttempts }), 250);
    }
    return;
  }
  if (state.user?.uid) updateCommentAvatarNodesByUid(state.user.uid, url);
  const handleKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
  if (handleKey) updateCommentAvatarNodes(handleKey, url);
}

function collectPostComments(postId) {
  if (!postId) return [];
  const meta = ensurePostMeta(postId);
  const all = [];
  (meta.comments || []).forEach((comment) => {
    if (!comment) return;
    all.push(comment);
    (comment.replies || []).forEach((reply) => {
      if (reply) all.push(reply);
    });
  });
  return all;
}

function hydrateCommentAvatars(containerEl, { postId = "" } = {}) {
  if (!containerEl) return;
  const commentMap = new Map();
  if (postId) {
    collectPostComments(postId).forEach((comment) => {
      if (comment?.id) commentMap.set(String(comment.id), comment);
    });
  }
  containerEl.querySelectorAll("div[data-comment-id][data-comment-parent]").forEach((row) => {
    if (!(row instanceof HTMLElement)) return;
    if (row.querySelector("img.comment-avatar")) return;
    const commentId = row.dataset.commentId || "";
    const fromMap = commentId ? commentMap.get(String(commentId)) : null;
    const uid = fromMap?.uid || row.dataset.commentUid || "";
    const handle = fromMap?.handle || row.dataset.commentHandle || "";
    const raw = fromMap?.avatarUrl || fromMap?.avatar || "";
    const resolved = getOptimizedImageUrl(raw, "avatar");
    const safeSrc = (!resolved || isPlaceholderUrl(resolved)) ? PLACEHOLDER_IMAGE : resolved;
    const img = document.createElement("img");
    img.className = "comment-avatar w-9 h-9 rounded-2xl object-cover shadow";
    img.src = safeSrc;
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.alt = "";
    img.setAttribute("data-img-key", `comment-avatar:${commentId || ""}`);
    img.setAttribute("data-comment-id", commentId || "");
    img.setAttribute("data-comment-uid", uid);
    img.setAttribute("data-comment-handle", normalizeHandle(handle));
    img.setAttribute("data-uid", uid);
    img.setAttribute("data-handle", handle);
    img.onerror = () => {
      img.src = PLACEHOLDER_IMAGE;
    };
    row.prepend(img);
  });
  const imgs = containerEl.querySelectorAll("img.comment-avatar[data-uid], img.comment-avatar[data-handle]");
  imgs.forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    const uid = img.getAttribute("data-uid") || "";
    const handle = img.getAttribute("data-handle") || "";
    const handleKey = normalizeHandle(handle);
    let cached = "";
    if (uid && commentAvatarCache.has(uid)) cached = commentAvatarCache.get(uid);
    else if (handleKey && commentAvatarCache.has(handleKey)) cached = commentAvatarCache.get(handleKey);
    if (cached && !isPlaceholderUrl(cached) && img.getAttribute("src") !== cached) {
      img.setAttribute("src", cached);
      return;
    }
    if (uid) {
      scheduleCommentAvatarFetch({
        id: img.getAttribute("data-comment-id") || "",
        uid,
        handle
      });
    }
  });
}

function applyCommentAvatarCache(root = document) {
  if (!root) return;
  const selfUid = state.user?.uid || "";
  const selfHandle = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
  const cachedSelf = userAvatarCache && !isPlaceholderUrl(userAvatarCache) ? userAvatarCache : "";
  root.querySelectorAll("img[data-comment-uid], img[data-comment-handle]").forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    const uid = img.dataset.commentUid || "";
    const handleKey = img.dataset.commentHandle || "";
    let url = "";
    if (uid && commentAvatarCache.has(uid)) url = commentAvatarCache.get(uid);
    if (!url && handleKey && commentAvatarCache.has(handleKey)) url = commentAvatarCache.get(handleKey);
    if (!url && selfUid && uid === selfUid && cachedSelf) url = cachedSelf;
    if (!url && selfHandle && handleKey === selfHandle && cachedSelf) url = cachedSelf;
    if (url && !isPlaceholderUrl(url) && img.getAttribute("src") !== url) {
      img.setAttribute("src", url);
    }
  });
}

function scheduleCommentAvatarFetch(comment) {
  if (!COMMENT_AVATAR_REMOTE_FETCH_ENABLED) return;
  if (!comment) return;
  const handleKey = normalizeHandle(comment.handle || comment.author || "");
  const commentId = comment.id ? String(comment.id) : "";
  if (comment.uid) {
    const uid = String(comment.uid);
    if (commentAvatarCache.has(uid) || commentAvatarPending.has(uid)) return;
    commentAvatarPending.add(uid);
    fetchUserDoc(uid).then((snap) => {
      commentAvatarPending.delete(uid);
      if (!snap || !snap.exists()) return;
      const data = snap.data() || {};
      const avatar = data.avatarUrl || data.avatar || data.avatarURL || data.photoURL || "";
      const url = getOptimizedImageUrl(avatar, "avatar");
      if (isPlaceholderUrl(url)) return;
      commentAvatarCache.set(uid, url);
      if (handleKey) commentAvatarCache.set(handleKey, url);
      scheduleCommentAvatarDomUpdate(uid, handleKey, url);
      if (commentId) updateCommentAvatarNodesById(commentId, url);
    }).catch(() => {
      commentAvatarPending.delete(uid);
    });
    return;
  }
  if (!handleKey || commentAvatarCache.has(handleKey) || commentAvatarPending.has(handleKey)) return;
  commentAvatarPending.add(handleKey);
  resolveUserByHandle(handleKey).then((resolved) => {
    commentAvatarPending.delete(handleKey);
    const data = resolved?.data || {};
    const avatar = data.avatarUrl || data.avatar || "";
    const url = getOptimizedImageUrl(avatar, "avatar");
    if (isPlaceholderUrl(url)) return;
    commentAvatarCache.set(handleKey, url);
    scheduleCommentAvatarDomUpdate("", handleKey, url);
    if (commentId) updateCommentAvatarNodesById(commentId, url);
  }).catch(() => {
    commentAvatarPending.delete(handleKey);
  });
}

function isLocalBusinessProfile(profile = state.userProfile) {
  return isLocalBusinessProfileCore(profile);
}

function getRestaurantMetaById(restaurantId) {
  if (!restaurantId) return null;
  return state.restaurants.find((rest) => String(rest.id) === String(restaurantId)) || null;
}

function resolveHeaderBranding() {
  return {
    title: BRAND_UI.upper,
    subtitle: "Social",
    logoUrl: resolveShellAvatarUrl(),
    isBusinessLogo: isLocalBusinessProfile(state.userProfile)
  };
}

function normalizeLeadCountry(value) {
  return normalizeLeadCountryCore(value, {
    allowedCountries: CEO_COUNTRIES,
    fallbackCountry: LEAD_SETTINGS_DEFAULT_COUNTRY
  });
}

function createDefaultLeadPricing() {
  return createDefaultLeadPricingCore({
    leadTypeOrder: LEAD_TYPE_ORDER
  });
}

function normalizeLeadPricing(raw = {}) {
  return normalizeLeadPricingCore(raw, {
    leadTypeOrder: LEAD_TYPE_ORDER
  });
}

function normalizeLeadSettings(raw = {}) {
  return normalizeLeadSettingsCore(raw, {
    defaultPassword: LEAD_SOCIAL_DEFAULT_PASSWORD,
    defaultCountry: LEAD_SETTINGS_DEFAULT_COUNTRY,
    normalizeLeadCountryFn: normalizeLeadCountry,
    normalizeLeadPricingFn: normalizeLeadPricing
  });
}

function getLeadSettingsConfig() {
  return getLeadSettingsConfigCore(state.userProfile, {
    normalizeLeadSettingsFn: normalizeLeadSettings
  });
}

function getLeadCountryCenter(country = LEAD_SETTINGS_DEFAULT_COUNTRY) {
  return getLeadCountryCenterCore(country, {
    normalizeLeadCountryFn: normalizeLeadCountry,
    countryCenters: LEAD_COUNTRY_CENTERS,
    defaultCountry: LEAD_SETTINGS_DEFAULT_COUNTRY,
    defaultCenter: PRISHTINA_COORDS
  });
}

function getLeadMonthlyPrice(type = "", config = getLeadSettingsConfig()) {
  return getLeadMonthlyPriceCore(type, config, {
    normalizeLeadPricingFn: normalizeLeadPricing,
    resolveCustomerTypeFn: resolveCustomerType
  });
}

function getLeadPriceForCycle(type = "", cycle = "monthly", config = getLeadSettingsConfig()) {
  return getLeadPriceForCycleCore(type, cycle, config, {
    getLeadMonthlyPriceFn: getLeadMonthlyPrice
  });
}

function inferLeadCountryFromText(text = "", fallbackCountry = "") {
  return inferLeadCountryFromTextCore(text, fallbackCountry || getLeadSettingsConfig().defaultCountry, {
    normalizeSearchKeyFn: normalizeSearchKey,
    normalizeLeadCountryFn: normalizeLeadCountry
  });
}

function isCeoUser() {
  return isCeoUserCore(state, {
    normalizeRoleListFn: normalizeRoleList
  });
}

function isAlbertCeoUser() {
  return isAlbertCeoUserCore(state, {
    normalizeEmailValueFn: normalizeEmailValue,
    isHiddenLegacyCeoEmailFn: isHiddenLegacyCeoEmail,
    normalizeHandleFn: normalizeHandle,
    albertCeoAliases: ALBERT_CEO_ALIASES,
    albertCeoEmails: ALBERT_CEO_EMAILS
  });
}

function hasGlobalCeoAccess(profile = state.userProfile, user = state.user) {
  return hasGlobalCeoAccessCore(profile, user, {
    albertCeoUid: ALBERT_CEO_UID,
    isAlbertCeoUserFn: isAlbertCeoUser
  });
}

function getCeoGpsOverride(profile = state.userProfile) {
  return getCeoGpsOverrideCore(profile, {
    isCeoUserFn: isCeoUser
  });
}

function isRestaurantMarkedDeleted(rest = {}) {
  return isRestaurantMarkedDeletedCore(rest, {
    normalizeLeadStatusKeyFn: normalizeLeadStatusKey
  });
}

function forceHiddenEmailLocalPart(value = "") {
  return forceHiddenEmailLocalPartCore(value, {
    normalizeEmailValueFn: normalizeEmailValue
  });
}

function isForceHiddenHandle(value = "") {
  return isForceHiddenHandleCore(value, {
    normalizeHandleFn: normalizeHandle,
    forceHiddenSocialHandleSet: FORCE_HIDDEN_SOCIAL_HANDLE_SET
  });
}

function isForceHiddenUid(value = "") {
  return isForceHiddenUidCore(value, {
    forceHiddenSocialUidSet: FORCE_HIDDEN_SOCIAL_UID_SET
  });
}

function isForceHiddenEmail(value = "") {
  return isForceHiddenEmailCore(value, {
    forceHiddenEmailLocalPartFn: forceHiddenEmailLocalPart,
    forceHiddenSocialHandleSet: FORCE_HIDDEN_SOCIAL_HANDLE_SET
  });
}

function isForceHiddenBusinessEntity(entity = {}) {
  return isForceHiddenBusinessEntityCore(entity, {
    getRestaurantUidCandidatesFn: getRestaurantUidCandidates,
    isForceHiddenUidFn: isForceHiddenUid,
    getRestaurantEmailCandidatesFn: getRestaurantEmailCandidates,
    isForceHiddenEmailFn: isForceHiddenEmail,
    normalizeHandleFn: normalizeHandle,
    isForceHiddenHandleFn: isForceHiddenHandle
  });
}

function isPublicBusinessRecord(rest = {}) {
  return isPublicBusinessRecordCore(rest, {
    isRestaurantMarkedDeletedFn: isRestaurantMarkedDeleted,
    isForceHiddenBusinessEntityFn: isForceHiddenBusinessEntity
  });
}

function leadStatusLabel(value) {
  return leadStatusLabelCore(value, {
    normalizeLeadStatusKeyFn: normalizeLeadStatusKey,
    leadStatusLabels: LEAD_STATUS_LABELS
  });
}

function leadTypeLabel(value) {
  return leadTypeLabelCore(value, {
    normalizeLeadTypeKeyFn: normalizeLeadTypeKey,
    leadTypeLabels: LEAD_TYPE_LABELS
  });
}

function resolveCustomerType(value) {
  return resolveCustomerTypeCore(value, {
    normalizeLeadTypeKeyFn: normalizeLeadTypeKey
  });
}

function normalizeCoordPair(latValue, lngValue) {
  return normalizeCoordPairCore(latValue, lngValue, {
    toFiniteCoordNumberFn: toFiniteCoordNumber
  });
}

function preferStableCoords(candidate, reference) {
  return preferStableCoordsCore(candidate, reference, {
    normalizeCoordPairFn: normalizeCoordPair
  });
}

function resolveCoordsFromShape(shape) {
  return resolveCoordsFromShapeCore(shape, {
    normalizeCoordPairFn: normalizeCoordPair
  });
}

function resolveCoordsFromEntity(entity) {
  return resolveCoordsFromEntityCore(entity, {
    normalizeCoordPairFn: normalizeCoordPair,
    resolveCoordsFromShapeFn: resolveCoordsFromShape
  });
}

function extractPlusCodeFromText(text) {
  return extractPlusCodeFromTextCore(text, {
    sanitizePlusCodeFn: sanitizePlusCode
  });
}

function isLikelyFullPlusCode(code) {
  return isLikelyFullPlusCodeCore(code, {
    sanitizePlusCodeFn: sanitizePlusCode
  });
}

function isLikelyShortPlusCode(code) {
  return isLikelyShortPlusCodeCore(code, {
    sanitizePlusCodeFn: sanitizePlusCode
  });
}

function olcDecodeFullPlusCode(code) {
  return olcDecodeFullPlusCodeCore(code, {
    isLikelyFullPlusCodeFn: isLikelyFullPlusCode,
    sanitizePlusCodeFn: sanitizePlusCode,
    olcDecodeValueFn: olcDecodeValue,
    normalizeCoordPairFn: normalizeCoordPair
  });
}

function olcEncodePairPrefix(latValue, lngValue, prefixLength) {
  return olcEncodePairPrefixCore(latValue, lngValue, prefixLength, {
    olcClipLatitudeFn: olcClipLatitude,
    olcNormalizeLongitudeFn: olcNormalizeLongitude
  });
}

function olcRecoverShortCode(shortCode, refLat, refLng) {
  return olcRecoverShortCodeCore(shortCode, refLat, refLng, {
    isLikelyShortPlusCodeFn: isLikelyShortPlusCode,
    sanitizePlusCodeFn: sanitizePlusCode,
    olcClipLatitudeFn: olcClipLatitude,
    olcNormalizeLongitudeFn: olcNormalizeLongitude,
    olcEncodePairPrefixFn: olcEncodePairPrefix,
    olcDecodeFullPlusCodeFn: olcDecodeFullPlusCode,
    normalizeCoordPairFn: normalizeCoordPair
  });
}

function resolvePlusCodeReferenceCoords(value = "", refCoords = null) {
  return resolvePlusCodeReferenceCoordsCore(value, refCoords, {
    normalizeCoordPairFn: normalizeCoordPair,
    extractPlusCodeFromTextFn: extractPlusCodeFromText,
    inferLeadCountryFromTextFn: inferLeadCountryFromText,
    getLeadCountryCenterFn: getLeadCountryCenter
  });
}

async function geocodeReferenceSearch(text = "") {
  return geocodeReferenceSearchCore(text, {
    normalizeSearchKeyFn: normalizeSearchKey,
    normalizeCoordPairFn: normalizeCoordPair,
    fetchFn: fetch
  });
}

function parsePlusCodeFromAddressInput(value, refCoords = null) {
  return parsePlusCodeFromAddressInputCore(value, refCoords, {
    extractPlusCodeFromTextFn: extractPlusCodeFromText,
    isLikelyFullPlusCodeFn: isLikelyFullPlusCode,
    olcDecodeFullPlusCodeFn: olcDecodeFullPlusCode,
    isLikelyShortPlusCodeFn: isLikelyShortPlusCode,
    resolvePlusCodeReferenceCoordsFn: resolvePlusCodeReferenceCoords,
    olcRecoverShortCodeFn: olcRecoverShortCode
  });
}

async function parseCoordsFromAddressInputAsync(value, refCoords = null) {
  return parseCoordsFromAddressInputAsyncCore(value, refCoords, {
    parseCoordsFromAddressInputFn: parseCoordsFromAddressInput,
    extractPlusCodeFromTextFn: extractPlusCodeFromText,
    isLikelyShortPlusCodeFn: isLikelyShortPlusCode,
    geocodeReferenceSearchFn: geocodeReferenceSearch,
    olcRecoverShortCodeFn: olcRecoverShortCode
  });
}

function parseCoordsFromAddressInput(value, refCoords = null) {
  return parseCoordsFromAddressInputCore(value, refCoords, {
    parsePlusCodeFromAddressInputFn: parsePlusCodeFromAddressInput,
    toFiniteCoordNumberFn: toFiniteCoordNumber,
    normalizeCoordPairFn: normalizeCoordPair
  });
}

function normalizeLeadLocations(locations, fallbackAddress = "", fallbackCoords = null) {
  return normalizeLeadLocationsCore(locations, fallbackAddress, fallbackCoords, {
    resolveCoordsFromEntityFn: resolveCoordsFromEntity,
    createLeadLocationFn: createLeadLocation,
    hasLeadLocationCoordsFn: hasLeadLocationCoords
  });
}

function getPrimaryLeadLocation(locations) {
  return getPrimaryLeadLocationCore(locations, {
    normalizeLeadLocationsFn: normalizeLeadLocations,
    hasLeadLocationCoordsFn: hasLeadLocationCoords,
    createLeadLocationFn: createLeadLocation
  });
}

function customerStatusLabel(value) {
  return customerStatusLabelCore(value, {
    normalizeLeadStatusKeyFn: normalizeLeadStatusKey
  });
}

function isCustomerRestaurant(rest = {}) {
  return isCustomerRestaurantCore(rest, {
    normalizeLeadStatusKeyFn: normalizeLeadStatusKey
  });
}

function normalizeRestaurantType(value) {
  return normalizeRestaurantTypeCore(value, {
    normalizeLeadTypeKeyFn: normalizeLeadTypeKey
  });
}

function getBusinessProfileType(profile = state.userProfile) {
  return getBusinessProfileTypeCore(profile, {
    getRestaurantMetaByIdFn: getRestaurantMetaById,
    normalizeRestaurantTypeFn: normalizeRestaurantType
  });
}

function getBusinessCatalogMode(profile = state.userProfile) {
  return getBusinessCatalogModeCore(profile, {
    getBusinessProfileTypeFn: getBusinessProfileType
  });
}

function getBusinessCatalogLabel(profile = state.userProfile) {
  return getBusinessCatalogLabelCore(profile, {
    getBusinessCatalogModeFn: getBusinessCatalogMode
  });
}

function isShopCatalogProfile(profile = state.userProfile) {
  return isShopCatalogProfileCore(profile, {
    getBusinessCatalogModeFn: getBusinessCatalogMode
  });
}

function isRestaurantCafeProfile(profile = state.userProfile) {
  return isRestaurantCafeProfileCore(profile, {
    getBusinessProfileTypeFn: getBusinessProfileType,
    leadTypeOrder: LEAD_TYPE_ORDER
  });
}

function buildShopVariantKey(itemId, { size = "", color = "" } = {}) {
  return buildShopVariantKeyCore(itemId, { size, color });
}

function normalizeShopCartState(raw) {
  return normalizeShopCartStateCore(raw, {
    createEmptyShopCartFn: createEmptyShopCart,
    buildShopVariantKeyFn: buildShopVariantKey,
    clampCropPercentFn: clampCropPercent
  });
}

function saveShopCartToStorage(uid = state.user?.uid || GUEST_SCOPE_UID) {
  const key = shopCartKey(uid);
  if (!key) return;
  try {
    const payload = normalizeShopCartState(state.shopCart);
    payload.status = "";
    payload.loading = false;
    safeStorage.setItem(key, JSON.stringify(payload));
  } catch {}
}

function getCartCountForRestaurant(restaurantId = "") {
  return getCartCountForRestaurantCore(restaurantId, state.shopCart);
}

function canAddToShopCart(profile = state.profileView?.profile || state.userProfile) {
  return canAddToShopCartCore(profile, {
    isShopCatalogProfileFn: isShopCatalogProfile,
    currentUserRestaurantId: state.userProfile?.restaurantId || ""
  });
}

function coerceMenuItemsFromData(data) {
  return coerceMenuItemsFromDataCore({
    data,
    normalizeMenuItemDoc
  });
}

function icon(name, className = "") {
  return `<i data-lucide="${name}" class="${className}"></i>`;
}

function focusSearchInput() {
  focusInputByIdCore({
    documentObj: typeof document === "undefined" ? null : document,
    inputId: "searchInput",
    preventScroll: true
  });
}

function focusInputById(id) {
  focusInputByIdCore({
    documentObj: typeof document === "undefined" ? null : document,
    inputId: id,
    preventScroll: true
  });
}

function captureChatInputFocusState() {
  return captureChatInputFocusStateCore({
    documentObj: typeof document === "undefined" ? null : document,
    inputId: "chatMessageInput"
  });
}

function restoreChatInputFocusState(focusState) {
  restoreChatInputFocusStateCore({
    focusState,
    canRestore: state.activeTab === "chat" && !!state.chatModal.open && !!state.chatModal.profile,
    documentObj: typeof document === "undefined" ? null : document,
    queueMicrotaskFn: (fn) => queueMicrotask(fn),
    inputId: "chatMessageInput",
    maxHeight: 112
  });
}

function scrollChatMessagesToBottom() {
  return scrollChatMessagesToBottomCore({
    documentObj: typeof document === "undefined" ? null : document,
    windowObj: typeof window === "undefined" ? null : window,
    queueMicrotaskFn: (fn) => queueMicrotask(fn),
    containerId: "chatMessages"
  });
}

function autosizeTextarea(el, { minHeight = 56, maxHeight = 160 } = {}) {
  autosizeTextareaCore(el, { minHeight, maxHeight });
}

function clampCropPercent(value, fallback = 50) {
  return clampCropPercentCore(value, fallback);
}

function getMenuItemCrop(item) {
  return getMenuItemCropCore(item);
}

function getMenuItemObjectPosition(item) {
  return getMenuItemObjectPositionCore(item);
}

function getMenuModalCrop() {
  return {
    x: clampCropPercent(state.menuModal?.cropX ?? 50, 50),
    y: clampCropPercent(state.menuModal?.cropY ?? 50, 50)
  };
}

function syncMenuModalCropPreview() {
  const preview = document.getElementById("menuItemHeroPreview");
  const crop = getMenuModalCrop();
  if (preview) {
    preview.style.objectPosition = `${crop.x}% ${crop.y}%`;
  }
  const xValue = document.getElementById("menuCropXValue");
  const yValue = document.getElementById("menuCropYValue");
  if (xValue) xValue.textContent = `${crop.x}%`;
  if (yValue) yValue.textContent = `${crop.y}%`;
}

function getFocusItemCrop(item) {
  return getFocusItemCropCore(item);
}

function getFocusItemObjectPosition(item) {
  return getFocusItemObjectPositionCore(item);
}

function getFocusModalCrop() {
  return {
    x: clampCropPercent(state.focusModal?.cropX ?? 50, 50),
    y: clampCropPercent(state.focusModal?.cropY ?? 50, 50)
  };
}

function syncFocusModalCropPreview() {
  const preview = document.getElementById("focusHeroPreview");
  const crop = getFocusModalCrop();
  if (preview) {
    preview.style.objectPosition = `${crop.x}% ${crop.y}%`;
  }
  const xValue = document.getElementById("focusCropXValue");
  const yValue = document.getElementById("focusCropYValue");
  if (xValue) xValue.textContent = `${crop.x}%`;
  if (yValue) yValue.textContent = `${crop.y}%`;
}

function setState(patch) {
  const prevTab = state.activeTab;
  const keys = Object.keys(patch || {});
  const drawerOnly = keys.length === 1 && keys[0] === "drawerOpen";
  if (patch && Object.prototype.hasOwnProperty.call(patch, "activeTab")) {
    patch.activeTab = sanitizeTabForSession(patch.activeTab, {
      hasProfileView: !!state.profileView
    });
  }
  Object.assign(state, patch);
  if (drawerOnly && lastRenderMode === "main") {
    updateDrawerDom();
    return;
  }
  render();
  if (patch.activeTab && patch.activeTab !== prevTab) {
    queueMicrotask(() => ensureTabData(state.activeTab));
  }
}

function saveSettings(settings) {
  safeStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

function saveNotifications(notifications) {
  const uid = state.user?.uid || "";
  if (!uid) return;
  safeStorage.setItem(notificationsKey(uid), JSON.stringify(notifications));
}

function readPushSeenIds(uid = state.user?.uid || "") {
  return readPushSeenIdsCore({
    uid,
    resolvePushSeenKey: pushSeenKey,
    storage: safeStorage
  });
}

function writePushSeenIds(ids = [], uid = state.user?.uid || "") {
  writePushSeenIdsCore({
    ids,
    uid,
    resolvePushSeenKey: pushSeenKey,
    storage: safeStorage,
    maxItems: PUSH_SEEN_NOTIFICATIONS_LIMIT
  });
}

function canUseNativeNotifications() {
  return canUseNativeNotificationsCore({
    windowObj: typeof window !== "undefined" ? window : undefined
  });
}

function clearPushActivationIssue() {
  pushActivationIssue = "";
}

function setPushActivationIssue(reason = "", err = null) {
  const base = String(reason || "").trim();
  pushActivationIssue = buildPushActivationIssueCore({ reason, err });
  if (err) {
    console.error("[Push]", base || "Push activation failed", err);
  } else if (base) {
    console.warn("[Push]", base);
  }
}

function getPushActivationIssueMessage() {
  return getPushActivationIssueMessageCore(pushActivationIssue);
}

function mapPushActivationError(stage = "", err = null) {
  return mapPushActivationErrorCore(stage, err);
}

function canEmitNativePushAlerts() {
  return canEmitNativePushAlertsCore({
    settings: state.settings,
    canUseNativeNotifications: canUseNativeNotifications(),
    notificationPermission: Notification.permission
  });
}

async function ensureNotificationPermission({ interactive = false } = {}) {
  return await ensureNotificationPermissionCore({
    interactive,
    canUseNativeNotifications: () => canUseNativeNotifications(),
    notificationApi: typeof Notification !== "undefined" ? Notification : null,
    setPushActivationIssue: (reason, err) => setPushActivationIssue(reason, err)
  });
}

function resolveNativePushActor(notif = {}) {
  return resolveNativePushActorCore(notif);
}

function resolveNativePushBody(notif = {}) {
  return resolveNativePushBodyCore(notif);
}

async function showNativePushAlert(notif) {
  if (!notif?.id || !canEmitNativePushAlerts()) return;
  const alertPayload = buildNativePushAlertPayloadCore({
    notif,
    brandTitle: BRAND_UI.title,
    resolveNotificationAvatar: (entry) => resolveNotificationAvatar(entry),
    encodeURIComponentFn: (value) => encodeURIComponent(value)
  });
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration(PUSH_SW_SCOPE);
      if (reg?.showNotification) {
        await reg.showNotification(alertPayload.title, {
          body: alertPayload.body,
          icon: alertPayload.icon,
          badge: alertPayload.icon,
          tag: alertPayload.tag,
          data: alertPayload.data,
          renotify: false
        });
        return;
      }
    }
    new Notification(alertPayload.title, {
      body: alertPayload.body,
      icon: alertPayload.icon,
      tag: alertPayload.tag
    });
  } catch {}
}

function getOrCreatePushDeviceId() {
  return getOrCreatePushDeviceIdCore({
    resolvePushDeviceIdKey: pushDeviceIdKey,
    storage: safeStorage,
    randomUUIDFn: typeof crypto !== "undefined" && crypto.randomUUID
      ? () => crypto.randomUUID()
      : null,
    nowFn: () => Date.now(),
    randomFn: () => Math.random()
  });
}

function readPushTokenMeta(uid = state.user?.uid || "") {
  return readPushTokenMetaCore({
    uid,
    resolvePushTokenMetaKey: pushTokenMetaKey,
    storage: safeStorage
  });
}

function writePushTokenMeta(uid = state.user?.uid || "", token = "") {
  writePushTokenMetaCore({
    uid,
    token,
    resolvePushTokenMetaKey: pushTokenMetaKey,
    storage: safeStorage,
    nowFn: () => Date.now()
  });
}

async function ensureFirebaseMessagingModule() {
  return ensureFirebaseMessagingModuleCore({
    currentPromise: firebaseMessagingModulePromise,
    moduleUrl: FIREBASE_MESSAGING_MODULE_URL,
    importModule: (url) => import(url),
    setModulePromise: (value) => { firebaseMessagingModulePromise = value; }
  });
}

async function ensureMessagingClient() {
  return await ensureMessagingClientCore({
    currentClient: pushMessagingClient,
    ensureFirebaseMessagingModule: () => ensureFirebaseMessagingModule(),
    setPushActivationIssue: (reason, err) => setPushActivationIssue(reason, err),
    app,
    setMessagingClient: (client) => { pushMessagingClient = client; }
  });
}

async function ensurePushServiceWorkerRegistration() {
  return await ensurePushServiceWorkerRegistrationCore({
    navigatorObj: typeof navigator !== "undefined" ? navigator : null,
    serviceWorkerScope: PUSH_SW_SCOPE,
    serviceWorkerUrl: PUSH_SW_URL,
    setPushActivationIssue: (reason, err) => setPushActivationIssue(reason, err)
  });
}

async function waitForPushServiceWorkerReady() {
  return await waitForPushServiceWorkerReadyCore({
    navigatorObj: typeof navigator !== "undefined" ? navigator : null,
    timeoutMs: PUSH_SW_READY_TIMEOUT_MS,
    setPushActivationIssue: (reason, err) => setPushActivationIssue(reason, err)
  });
}

async function syncPushDeviceRegistration({ interactive = false, force = false, enabled = state.settings?.pushNotifs } = {}) {
  const uid = String(state.user?.uid || "").trim();
  const prerequisitesOk = hasPushDeviceRegistrationPrerequisitesCore({
    uid,
    enabled,
    isSecureContext: !!window.isSecureContext,
    vapidKey: FCM_WEB_PUSH_VAPID_KEY,
    hasServiceWorker: typeof navigator !== "undefined" && ("serviceWorker" in navigator),
    setPushActivationIssue: (reason) => setPushActivationIssue(reason)
  });
  if (!prerequisitesOk) return false;

  const granted = await ensureNotificationPermission({ interactive });
  if (!granted) return false;

  const reg = await ensurePushServiceWorkerRegistration();
  if (!reg) {
    if (!pushActivationIssue) setPushActivationIssue("Service Worker konnte nicht registriert werden.");
    return false;
  }

  const readyReg = await waitForPushServiceWorkerReady();
  const pushReg = readyReg || reg;
  if (!pushReg) {
    if (!pushActivationIssue) setPushActivationIssue("Service Worker Registrierung fuer Push fehlt.");
    return false;
  }

  const messaging = await ensureMessagingClient();
  if (!messaging) return false;

  let safeToken = "";
  try {
    const messagingModule = await ensureFirebaseMessagingModule();
    const token = await messagingModule.getToken(messaging, {
      vapidKey: FCM_WEB_PUSH_VAPID_KEY,
      serviceWorkerRegistration: pushReg
    });
    safeToken = String(token || "").trim();
  } catch (err) {
    setPushActivationIssue(mapPushActivationError("fcm-getToken", err), err);
    return false;
  }
  if (!safeToken) {
    setPushActivationIssue("FCM hat keinen Token geliefert.");
    return false;
  }

  const meta = readPushTokenMeta(uid);
  const freshEnough = isPushTokenSyncFreshCore({
    meta,
    token: safeToken,
    nowTs: Date.now(),
    intervalMs: PUSH_TOKEN_SYNC_INTERVAL_MS
  });
  if (!force && freshEnough) {
    clearPushActivationIssue();
    return true;
  }

  const deviceId = getOrCreatePushDeviceId();
  const ref = doc(db, "users", uid, "devices", deviceId);
  try {
    const stamp = serverTimestamp();
    await setDoc(ref, buildPushDeviceRegistrationPayloadCore({
      token: safeToken,
      userAgent: String(navigator.userAgent || ""),
      locale: String(navigator.language || ""),
      serverTimestampValue: stamp
    }), { merge: true });
  } catch (err) {
    setPushActivationIssue(mapPushActivationError("firestore-write", err), err);
    return false;
  }
  writePushTokenMeta(uid, safeToken);
  clearPushActivationIssue();
  return true;
}

async function disablePushDeviceRegistration() {
  const uid = String(state.user?.uid || "").trim();
  if (!uid) return;
  const deviceId = getOrCreatePushDeviceId();
  try {
    await setDoc(doc(db, "users", uid, "devices", deviceId), buildPushDeviceDisablePayloadCore({
      serverTimestampValue: serverTimestamp()
    }), { merge: true });
  } catch (err) {
    console.error(err);
  }
}

function saveFollowing(handles, targetIds = state.followingTargetIds) {
  if (!Array.isArray(handles)) return;
  try {
    const uid = state.user?.uid || "";
    if (!uid) return;
    const payload = {
      handles: handles.slice(0, 500),
      targetIds: (Array.isArray(targetIds) ? targetIds : [])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
        .slice(0, 500)
    };
    safeStorage.setItem(followingKey(uid), JSON.stringify(payload));
  } catch {}
}

function normalizeFollowHandle(value) {
  return normalizeFollowHandleCore(value, {
    normalizeHandleFn: normalizeHandle
  });
}

function syncPrivateSettingFromProfile(value) {
  const nextValue = !!value;
  if (state.settings.privateAccount === nextValue) return;
  state.settings = { ...state.settings, privateAccount: nextValue };
  saveSettings(state.settings);
}

function getFollowDocId(targetType, targetId, handle) {
  return `${targetType || "handle"}_${targetId || handle}`;
}

function applyFollowingHandles(handles, { shouldRender = true, targetIds = state.followingTargetIds } = {}) {
  const nextHandles = Array.from(new Set(
    (Array.isArray(handles) ? handles : [])
      .map((item) => normalizeFollowHandle(item))
      .filter(Boolean)
  ));
  const nextTargetIds = Array.from(new Set(
    (Array.isArray(targetIds) ? targetIds : [])
      .map((id) => String(id || "").trim())
      .filter(Boolean)
  ));
  const prevKey = state.followingHandles.join("|");
  const prevIdsKey = state.followingTargetIds.join("|");
  const nextKey = nextHandles.join("|");
  const nextIdsKey = nextTargetIds.join("|");
  state.followingHandles = nextHandles;
  state.followingTargetIds = nextTargetIds;
  state.pendingFollowRequests = (Array.isArray(state.pendingFollowRequests) ? state.pendingFollowRequests : [])
    .map((handle) => normalizeFollowHandle(handle))
    .filter((handle) => handle && !nextHandles.includes(handle));
  if (state.profileModal.profile) {
    const modalHandle = normalizeFollowHandle(state.profileModal.profile.handle || "");
    if (modalHandle && nextHandles.includes(modalHandle)) {
      state.profileModal.profile.pendingFollowRequest = false;
    }
  }
  if (state.profileView?.profile) {
    const viewHandle = normalizeFollowHandle(state.profileView.profile.handle || "");
    if (viewHandle && nextHandles.includes(viewHandle)) {
      state.profileView.profile.pendingFollowRequest = false;
    }
  }
  saveFollowing(nextHandles, nextTargetIds);
  if (!shouldRender || (prevKey === nextKey && prevIdsKey === nextIdsKey)) return;
  if (lastRenderMode === "main") {
    render();
    return;
  }
  if (state.profileModal.open && !state.profileView) {
    renderOverlays();
    return;
  }
  if (state.profileView) {
    render();
  }
}

function saveChatThreadIndex(threads) {
  return chatRuntimeController.saveChatThreadIndex(threads);
}

function readChatThreadIndexList(key) {
  return chatRuntimeController.readChatThreadIndexList(key);
}

function buildChatThreadSummaryFromMessages(threadId, value, fallback = {}) {
  return chatRuntimeController.buildChatThreadSummaryFromMessages(threadId, value, fallback);
}

function rebuildLegacyChatThreadIndexFromStorage() {
  return chatRuntimeController.rebuildLegacyChatThreadIndexFromStorage();
}

function mergeChatThreadLists(...lists) {
  return chatRuntimeController.mergeChatThreadLists(...lists);
}

function loadChatThreadIndex(uid = state.user?.uid || "") {
  return chatRuntimeController.loadChatThreadIndex(uid);
}

function sortChatThreads(threads) {
  return chatRuntimeController.sortChatThreads(threads);
}

function rebuildChatThreadIndexFromStorage(uid = state.user?.uid || "") {
  return chatRuntimeController.rebuildChatThreadIndexFromStorage(uid);
}

function getChatUnreadCount() {
  return chatRuntimeController.getChatUnreadCount();
}

function upsertChatThread(profile, patch = {}) {
  return chatRuntimeController.upsertChatThread(profile, patch);
}

function isChatThreadArchived(thread) {
  return chatRuntimeController.isChatThreadArchived(thread);
}

function getChatThreadById(threadId) {
  return chatRuntimeController.getChatThreadById(threadId);
}

async function setChatThreadArchivedById(threadId, archived = true) {
  return chatRuntimeController.setChatThreadArchivedById(threadId, archived);
}

async function deleteChatThreadById(threadId) {
  return chatRuntimeController.deleteChatThreadById(threadId);
}

function getActiveChatThreadSummary(profile = state.chatModal.profile) {
  return chatRuntimeController.getActiveChatThreadSummary(profile);
}

function isActiveChatThreadBlocked(profile = state.chatModal.profile) {
  return chatRuntimeController.isActiveChatThreadBlocked(profile);
}

function getChatThreadId(profile = state.chatModal.profile) {
  return chatRuntimeController.getChatThreadId(profile);
}

function chatThreadStorageKey(profile = state.chatModal.profile) {
  return chatRuntimeController.chatThreadStorageKey(profile);
}

function chatThreadDocRef(ownerUid, threadId) {
  return chatRuntimeController.chatThreadDocRef(ownerUid, threadId);
}

function chatMessageDocRef(ownerUid, threadId, messageId) {
  return chatRuntimeController.chatMessageDocRef(ownerUid, threadId, messageId);
}

function chatMessagesCollectionRef(ownerUid, threadId) {
  return chatRuntimeController.chatMessagesCollectionRef(ownerUid, threadId);
}

function normalizeChatThreadSummary(threadId, data = {}, fallback = {}) {
  return chatRuntimeController.normalizeChatThreadSummary(threadId, data, fallback);
}

function getCurrentChatSenderProfile() {
  return chatRuntimeController.getCurrentChatSenderProfile();
}

function getStringByteSize(value) {
  return chatRuntimeController.getStringByteSize(value);
}

function isChatInlineDataUrl(dataUrl) {
  return chatRuntimeController.isChatInlineDataUrl(dataUrl);
}

function sanitizeChatAttachmentsForSync(attachments) {
  return chatRuntimeController.sanitizeChatAttachmentsForSync(attachments);
}

function normalizeChatMessageRecord(messageId, data = {}, localMap = new Map()) {
  return chatRuntimeController.normalizeChatMessageRecord(messageId, data, localMap);
}

function getChatMessageTimestamp(message) {
  return chatRuntimeController.getChatMessageTimestamp(message);
}

function pruneChatMessages(messages) {
  return chatRuntimeController.pruneChatMessages(messages);
}

function buildChatPreviewText(message) {
  return chatRuntimeController.buildChatPreviewText(message);
}

function loadLegacyChatThreadMessages(threadId) {
  return chatRuntimeController.loadLegacyChatThreadMessages(threadId);
}

async function readFileAsDataUrl(file) {
  return chatRuntimeController.readFileAsDataUrl(file);
}

async function buildInlineChatAttachment(file, isImage = false) {
  return chatRuntimeController.buildInlineChatAttachment(file, isImage);
}

function loadChatThreadMessages(profile) {
  return chatRuntimeController.loadChatThreadMessages(profile);
}

function saveChatThreadMessages(profile, messages) {
  return chatRuntimeController.saveChatThreadMessages(profile, messages);
}

function stopChatThreadsListener() {
  return chatRuntimeController.stopChatThreadsListener();
}

function stopActiveChatMessagesListener() {
  return chatRuntimeController.stopActiveChatMessagesListener();
}

function syncLocalChatThreadsFromRemote(remoteThreads, ownerUid = state.user?.uid || "") {
  return chatRuntimeController.syncLocalChatThreadsFromRemote(remoteThreads, ownerUid);
}

function startChatThreadsListener(user = state.user) {
  return chatRuntimeController.startChatThreadsListener(user);
}

async function syncRemoteChatReadState(profile, messages = state.chatModal.messages || []) {
  return chatRuntimeController.syncRemoteChatReadState(profile, messages);
}

function startActiveChatMessagesListener(profile = state.chatModal.profile) {
  return chatRuntimeController.startActiveChatMessagesListener(profile);
}

async function persistCurrentChatMessagePatch(messageId, patch = {}) {
  return chatRuntimeController.persistCurrentChatMessagePatch(messageId, patch);
}

async function syncChatMessageToRemote(message, partnerProfile = state.chatModal.profile) {
  return chatRuntimeController.syncChatMessageToRemote(message, partnerProfile);
}

function syncChatThreadSummary(profile, messages) {
  return chatRuntimeController.syncChatThreadSummary(profile, messages);
}

function markChatThreadAsRead(profile, messages = null) {
  return chatRuntimeController.markChatThreadAsRead(profile, messages);
}

function updateCurrentChatMessages(updater) {
  return chatRuntimeController.updateCurrentChatMessages(updater);
}

async function addChatAttachments(fileList) {
  return chatRuntimeController.addChatAttachments(fileList);
}

function removePendingChatAttachment(attachmentId) {
  return chatRuntimeController.removePendingChatAttachment(attachmentId);
}

function toggleChatMessageSaved(messageId) {
  return chatRuntimeController.toggleChatMessageSaved(messageId);
}

function toggleChatMessageLiked(messageId) {
  return chatRuntimeController.toggleChatMessageLiked(messageId);
}

async function sendChatMessage() {
  return chatRuntimeController.sendChatMessage();
}

function readCache(key, ttlMs) {
  const raw = safeStorage.getItem(key);
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw);
    if (Array.isArray(payload)) {
      return { data: payload, fresh: false };
    }
    if (!payload || !Array.isArray(payload.data)) return null;
    const age = Date.now() - (payload.ts || 0);
    return { data: payload.data, meta: payload.meta || null, fresh: ttlMs ? age <= ttlMs : true };
  } catch {
    return null;
  }
}

function writeCache(key, data, meta = null) {
  if (!Array.isArray(data)) return;
  try {
    safeStorage.setItem(key, JSON.stringify({ ts: Date.now(), data, meta }));
  } catch {}
}

function isGenericBusinessBootstrapLabel(value = "") {
  return String(value || "").trim().toLowerCase() === "business";
}

function normalizePublicBootstrapRestaurants(restaurants = []) {
  const seen = new Set();
  return (Array.isArray(restaurants) ? restaurants : [])
    .map((row) => {
      const id = String(row?.id || row?.restaurantId || "").trim();
      if (!id || seen.has(id)) return null;
      seen.add(id);
      const nameRaw = String(row?.name || row?.restaurantName || row?.displayName || row?.businessName || "").trim();
      const name = isGenericBusinessBootstrapLabel(nameRaw) ? "" : nameRaw;
      const logoUrl = String(row?.logoUrl || row?.logo || row?.logoURL || "").trim();
      const city = String(row?.city || "").trim();
      const type = normalizeRestaurantType(
        row?.type
        || row?.customerType
        || row?.category
        || row?.kind
        || row?.restaurantType
        || ""
      );
      if (!(name || logoUrl || city || type)) return null;
      return {
        id,
        name,
        restaurantName: String(row?.restaurantName || "").trim(),
        logoUrl,
        city,
        ...(type ? { type, customerType: type } : {})
      };
    })
    .filter(Boolean);
}

function normalizePublicBootstrapFeedPosts(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const id = String(row?.id || "").trim();
      const restaurantId = String(row?.restaurantId || row?.rid || row?.ownerId || "").trim();
      if (!id || !restaurantId) return null;
      const businessRaw = String(row?.business || row?.businessName || row?.restaurantName || "").trim();
      const business = isGenericBusinessBootstrapLabel(businessRaw) ? "" : businessRaw;
      const image = String(row?.image || row?.thumbUrl || row?.mediaUrl || row?.url || "").trim();
      if (!image) return null;
      const createdAtRaw = row?.createdAt;
      const createdAtDate = toDateSafe(createdAtRaw);
      const createdAt = createdAtDate || createdAtRaw || null;
      return {
        id,
        restaurantId,
        business: business || "Business",
        logo: String(row?.logo || row?.logoUrl || row?.logoURL || "").trim(),
        location: String(row?.location || row?.city || "Prishtina").trim() || "Prishtina",
        content: String(row?.content || row?.caption || row?.captionShort || "").trim(),
        image,
        likes: Number.isFinite(Number(row?.likes)) ? Number(row.likes) : (Number.isFinite(Number(row?.likesCount)) ? Number(row.likesCount) : 0),
        comments: Number.isFinite(Number(row?.comments)) ? Number(row.comments) : (Number.isFinite(Number(row?.commentsCount)) ? Number(row.commentsCount) : 0),
        time: formatRelative(createdAtDate),
        createdAt,
        category: String(row?.category || row?.postType || "food").trim() || "food",
        isLive: !!row?.isLive,
        ownerType: "restaurant",
        ownerId: restaurantId
      };
    })
    .filter(Boolean)
    .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
}

function normalizePublicBootstrapStories(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const restaurantId = String(row?.restaurantId || row?.id || row?.rid || "").trim();
      if (!restaurantId) return null;
      const nameRaw = String(row?.name || row?.businessName || row?.restaurantName || "").trim();
      const name = isGenericBusinessBootstrapLabel(nameRaw) ? "" : nameRaw;
      const img = String(row?.img || row?.logo || row?.logoUrl || row?.mediaUrl || row?.imageUrl || "").trim();
      return {
        id: restaurantId,
        restaurantId,
        name,
        img,
        isLive: !!row?.isLive
      };
    })
    .filter(Boolean);
}

function applyPublicBootstrapPayload(payload, { refreshUi = false } = {}) {
  if (!payload || typeof payload !== "object") return false;
  const incomingRestaurants = normalizePublicBootstrapRestaurants(payload.restaurants);
  const incomingFeedPosts = normalizePublicBootstrapFeedPosts(payload.feedPosts || payload.feed || payload.posts);
  const incomingStories = normalizePublicBootstrapStories(payload.stories);
  let changed = false;

  if (incomingRestaurants.length) {
    const prevSignature = state.restaurants
      .map((rest) => `${String(rest?.id || "").trim()}|${String(rest?.name || rest?.restaurantName || "").trim()}|${String(rest?.logoUrl || rest?.logo || "").trim()}`)
      .join(",");
    const mergedRestaurants = mergeRestaurants(state.restaurants, incomingRestaurants);
    const nextSignature = mergedRestaurants
      .map((rest) => `${String(rest?.id || "").trim()}|${String(rest?.name || rest?.restaurantName || "").trim()}|${String(rest?.logoUrl || rest?.logo || "").trim()}`)
      .join(",");
    if (nextSignature !== prevSignature) {
      state.restaurants = mergedRestaurants;
      writeCache(CACHE_KEYS.restaurants, mergedRestaurants);
      rebuildBusinessLocations();
      changed = true;
    }
  }

  if (incomingFeedPosts.length && !state.feedPosts.length) {
    state.feedPosts = incomingFeedPosts;
    const existingFeedMeta = readCache(CACHE_KEYS.feed)?.meta || {};
    saveFeedPosts(state.feedPosts, {
      lastDeltaCheck: Number(existingFeedMeta?.lastDeltaCheck || 0) || 0
    });
    changed = true;
  }

  if (incomingStories.length && !state.stories.length) {
    const normalizedStories = normalizeStoryItemsForDisplay(incomingStories);
    if (normalizedStories.length) {
      state.stories = normalizedStories;
      feedStoriesSignature = buildStoriesSignature(normalizedStories);
      writeCache(CACHE_KEYS.stories, normalizedStories);
      changed = true;
    }
  }

  if (syncFeedPostLogos()) {
    changed = true;
  }
  if (state.stories.length) {
    queueStoryIdentityHydration(state.stories, { max: FAST_LIMITS.storyIdentityHydration });
  }

  if (changed && refreshUi) {
    const inMain = lastRenderMode === "main";
    const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
    if (!updatedFeed && (state.activeTab === "feed" || !inMain)) {
      render();
    }
  }
  return changed;
}

function getPublicBootstrapEndpoint() {
  if (typeof window !== "undefined") {
    const fromWindow = String(window.__MENYRA_SOCIAL_BOOTSTRAP_ENDPOINT__ || "").trim();
    if (fromWindow) return fromWindow;
  }
  return DEFAULT_PUBLIC_BOOTSTRAP_ENDPOINT;
}

function fetchPublicBootstrapPayload({ force = false, timeoutMs = 1200 } = {}) {
  if (publicBootstrapFetchPromise && !force) return publicBootstrapFetchPromise;
  if (typeof fetch !== "function") return Promise.resolve(false);
  const endpoint = getPublicBootstrapEndpoint();
  if (!endpoint) return Promise.resolve(false);
  const request = (async () => {
    const controller = (typeof AbortController !== "undefined") ? new AbortController() : null;
    const timeoutId = typeof window !== "undefined"
      ? window.setTimeout(() => controller?.abort(), timeoutMs)
      : null;
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        signal: controller?.signal
      });
      if (!response.ok) return false;
      const json = await response.json().catch(() => null);
      const data = json && typeof json === "object" ? json.data : null;
      if (!data || typeof data !== "object") return false;
      return applyPublicBootstrapPayload(data, { refreshUi: state.activeTab === "feed" });
    } catch {
      return false;
    } finally {
      if (timeoutId !== null && typeof window !== "undefined") {
        window.clearTimeout(timeoutId);
      }
    }
  })();
  publicBootstrapFetchPromise = request.finally(() => {
    if (publicBootstrapFetchPromise === request) {
      publicBootstrapFetchPromise = null;
    }
  });
  return publicBootstrapFetchPromise;
}

function bindPublicBootstrapPayloadListener() {
  if (publicBootstrapListenerBound) return;
  if (typeof window === "undefined") return;
  publicBootstrapListenerBound = true;
  window.addEventListener(PUBLIC_BOOTSTRAP_EVENT, (event) => {
    const data = event?.detail;
    if (!data || typeof data !== "object") return;
    applyPublicBootstrapPayload(data, { refreshUi: state.activeTab === "feed" });
  });
}

function readLeadScopeCache(uid, scope) {
  const safeUid = String(uid || "").trim();
  const safeScope = normalizeLeadScopeKey(scope);
  if (!safeUid) return null;
  return readCache(leadPageCacheKey(safeUid, safeScope), CACHE_TTL_MS.crmPages);
}

function writeLeadScopeCache(uid, scope, rows, meta = {}) {
  const safeUid = String(uid || "").trim();
  const safeScope = normalizeLeadScopeKey(scope);
  if (!safeUid || !Array.isArray(rows)) return;
  writeCache(leadPageCacheKey(safeUid, safeScope), rows, meta);
}

function readCustomerScopeCache(uid, scope) {
  const safeUid = String(uid || "").trim();
  const safeScope = normalizeCustomerScopeKey(scope);
  if (!safeUid) return null;
  return readCache(customerPageCacheKey(safeUid, safeScope), CACHE_TTL_MS.crmPages);
}

function writeCustomerScopeCache(uid, scope, rows, meta = {}) {
  const safeUid = String(uid || "").trim();
  const safeScope = normalizeCustomerScopeKey(scope);
  if (!safeUid || !Array.isArray(rows)) return;
  writeCache(customerPageCacheKey(safeUid, safeScope), rows, meta);
}

function computeLatestTimestamp(posts) {
  return computeLatestTimestampCore({
    posts,
    toDateSafe
  });
}

function saveFeedPosts(posts, extraMeta = {}) {
  saveFeedPostsCore({
    posts,
    extraMeta,
    toDateSafe,
    writeCache,
    feedCacheKey: CACHE_KEYS.feed,
    feedFallbackLimit: FAST_LIMITS.feedFallback
  });
}

function loadPersisted() {
  const result = sessionDataRuntimeController.loadPersisted(...arguments);
  if (state.stories.length) {
    const nextStories = normalizeStoryItemsForDisplay(state.stories);
    state.stories = nextStories;
    feedStoriesSignature = buildStoriesSignature(nextStories);
    queueStoryIdentityHydration(nextStories, { max: FAST_LIMITS.storyIdentityHydration });
  } else {
    feedStoriesSignature = "";
  }
  return result;
}
function loadUserScopedPersisted(user) {
  return sessionDataRuntimeController.loadUserScopedPersisted(...arguments);
}
function loadGuestScopedPersisted() {
  return sessionDataRuntimeController.loadGuestScopedPersisted(...arguments);
}
function resetUserScopedState() {
  return sessionDataRuntimeController.resetUserScopedState(...arguments);
}
function collectFeedHydrationIds(feedRows = [], { max = 6 } = {}) {
  if (!Array.isArray(feedRows) || !feedRows.length) return [];
  const existing = new Map((state.restaurants || []).map((rest) => [String(rest?.id || "").trim(), rest]));
  const ids = [];
  const seen = new Set();
  for (const row of feedRows) {
    if (ids.length >= max) break;
    const rid = String(row?.restaurantId || row?.rid || row?.ownerId || "").trim();
    if (!rid || seen.has(rid)) continue;
    seen.add(rid);
    const cached = existing.get(rid) || null;
    const cachedName = String(cached?.name || cached?.restaurantName || cached?.displayName || "").trim();
    const cachedLogo = String(cached?.logoUrl || cached?.logo || cached?.logoURL || "").trim();
    const hasCachedName = !!cachedName && !isGenericStoryBusinessLabel(cachedName);
    const rowName = String(row?.businessName || row?.restaurantName || row?.business || "").trim();
    const hasRowName = !!rowName && !isGenericStoryBusinessLabel(rowName);
    const rowLogo = String(row?.logoUrl || row?.logo || row?.logoURL || "").trim();
    if ((hasCachedName && cachedLogo) || (hasRowName && rowLogo)) continue;
    ids.push(rid);
  }
  return ids;
}

function collectStoryHydrationIds(storyRows = [], { max = 12 } = {}) {
  if (!Array.isArray(storyRows) || !storyRows.length) return [];
  const existing = new Map((state.restaurants || []).map((rest) => [String(rest?.id || "").trim(), rest]));
  const ids = [];
  const seen = new Set();
  for (const row of storyRows) {
    if (ids.length >= max) break;
    const rid = String(row?.restaurantId || row?.id || row?.rid || "").trim();
    if (!rid || seen.has(rid)) continue;
    seen.add(rid);
    const cached = existing.get(rid) || null;
    const cachedName = String(
      cached?.name
      || cached?.restaurantName
      || cached?.displayName
      || cached?.businessName
      || ""
    ).trim();
    const cachedLogo = String(cached?.logoUrl || cached?.logo || cached?.logoURL || "").trim();
    const hasCachedName = !!cachedName && !isGenericStoryBusinessLabel(cachedName);
    const hasCachedLogo = !!cachedLogo;
    if (hasCachedName && hasCachedLogo) continue;
    ids.push(rid);
  }
  return ids;
}

function queueStoryIdentityHydration(storyRows = state.stories, { max = 12 } = {}) {
  const ids = collectStoryHydrationIds(storyRows, { max });
  if (!ids.length) return;
  ids.forEach((id) => pendingStoryIdentityHydrationIds.add(id));
  if (storyIdentityHydrationQueued) return;
  storyIdentityHydrationQueued = true;
  queueMicrotask(() => {
    storyIdentityHydrationQueued = false;
    const nextIds = Array.from(pendingStoryIdentityHydrationIds);
    pendingStoryIdentityHydrationIds.clear();
    if (!nextIds.length) return;
    void hydrateRestaurantsByIds(nextIds, { max: nextIds.length });
  });
}

async function hydrateRestaurantsByIds(restaurantIds, { max = 24 } = {}) {
  if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) return;

  const uniqueIds = Array.from(new Set(restaurantIds.filter(Boolean)));
  if (!uniqueIds.length) return;

  const existing = new Map((state.restaurants || []).map((rest) => [rest.id, rest]));
  const missing = uniqueIds.filter((id) => {
    const stored = existing.get(id);
    if (!stored) return true;
    const name = String(
      stored.name
      || stored.restaurantName
      || stored.displayName
      || stored.businessName
      || ""
    ).trim();
    const logo = String(stored.logoUrl || stored.logo || stored.logoURL || "").trim();
    const hasUsableName = !!name && !isGenericStoryBusinessLabel(name);
    const hasUsableLogo = !!logo;
    return !(hasUsableName && hasUsableLogo);
  }).slice(0, max);
  if (missing.length === 0) return;

  const loaded = (await Promise.all(missing.map(async (rid) => {
    try {
      const stored = existing.get(rid) || {};
      let metaData = {};
      try {
        const metaSnap = await getDoc(doc(db, "restaurants", rid, "public", "meta"));
        if (metaSnap.exists()) metaData = metaSnap.data() || {};
      } catch {}

      let restData = stored;
      const currentName = metaData.name || metaData.restaurantName || stored.name || stored.restaurantName || "";
      const currentLogo = metaData.logoUrl || metaData.logo || stored.logoUrl || stored.logo || stored.logoURL || "";
      if (!currentName || !currentLogo) {
        try {
          const restSnap = await getDoc(doc(db, "restaurants", rid));
          if (restSnap.exists()) {
            restData = { ...restData, ...(restSnap.data() || {}) };
          }
        } catch {}
      }

      const name = metaData.name || metaData.restaurantName || restData.name || restData.restaurantName || "";
      const logoUrl = metaData.logoUrl || metaData.logo || restData.logoUrl || restData.logo || restData.logoURL || "";
      const city = metaData.city || restData.city || "";
      const type = normalizeRestaurantType(
        metaData.type
        || metaData.customerType
        || restData.type
        || restData.customerType
        || restData.category
        || restData.kind
        || restData.restaurantType
        || ""
      );
      if (!(name || logoUrl || city || type)) return null;
      return {
        id: rid,
        name,
        restaurantName: restData.restaurantName || "",
        logoUrl,
        city,
        ...(type ? { type, customerType: type } : {})
      };
    } catch (e) {
      console.warn("hydrateRestaurantsByIds failed for", rid, e);
      return null;
    }
  }))).filter(Boolean);

  if (loaded.length) {
    state.restaurants = mergeRestaurants(state.restaurants, loaded);
    rebuildBusinessLocations();
    const feedUpdated = syncFeedPostLogos();
    const storiesUpdated = state.stories.length ? false : refreshFeedStories({ force: true });
    if ((feedUpdated || storiesUpdated) && state.activeTab === "feed" && lastRenderMode === "main") {
      updateFeedDom();
    } else if (feedUpdated || storiesUpdated) {
      render();
    }
  }
}

function mergeRestaurants(existing = [], additions = []) {
  if (!additions.length) return existing;
  const orderedIds = [];
  const map = new Map();
  existing.forEach((rest) => {
    if (!rest?.id) return;
    orderedIds.push(rest.id);
    map.set(rest.id, rest);
  });
  additions.forEach((rest) => {
    if (!rest?.id) return;
    if (!map.has(rest.id)) orderedIds.push(rest.id);
    const previous = map.get(rest.id) || {};
    map.set(rest.id, { ...previous, ...rest });
  });
  return orderedIds.map((id) => map.get(id)).filter(Boolean);
}

function rebuildBusinessLocations() {
  state.businessLocations = state.restaurants
    .filter((rest) => isPublicBusinessRecord(rest))
    .flatMap((rest, idx) => buildRestaurantLocations(rest, idx));
  state.restaurants.forEach((rest) => {
    if (!rest?.id) return;
    const rawLogo = rest.logoUrl || rest.logo || rest.logoURL || "";
    if (rawLogo) resolveRestaurantLogo(rest.id, rawLogo, "avatar");
  });
}

function mergeRestaurantMeta(rest, meta) {
  if (!rest) return rest;
  const data = meta || {};
  const name = data.name || data.restaurantName || rest.name || rest.restaurantName || "";
  const logoUrl = data.logoUrl || data.logo || rest.logoUrl || rest.logo || rest.logoURL || "";
  const type = normalizeRestaurantType(
    data.type
    || data.customerType
    || rest.type
    || rest.customerType
    || rest.category
    || rest.kind
    || rest.restaurantType
    || ""
  );
  return {
    ...rest,
    name: name || rest.name || "",
    restaurantName: rest.restaurantName || "",
    logoUrl,
    city: data.city || rest.city || "",
    ...(type ? { type, customerType: type } : {})
  };
}

function stopRestaurantMetaListeners() {
  restaurantMetaUnsubs.forEach((unsub) => {
    try { unsub(); } catch {}
  });
  restaurantMetaUnsubs.clear();
}

function ensureFeedRestaurantMetaListeners(feedPosts = state.feedPosts, { limit = FEED_META_LISTEN_LIMIT } = {}) {
  void feedPosts;
  void limit;
  stopRestaurantMetaListeners();
}

async function enrichRestaurantsWithPublicMeta(restaurants) {
  if (!Array.isArray(restaurants) || !restaurants.length) return restaurants || [];
  const lookups = restaurants.map((rest) => {
    const rid = rest?.id || "";
    if (!rid) return Promise.resolve(null);
    const hasCoreName = !!String(rest?.name || rest?.restaurantName || "").trim();
    const hasCoreLogo = !!String(rest?.logoUrl || rest?.logo || rest?.logoURL || "").trim();
    const hasCoreCity = !!String(rest?.city || "").trim();
    const hasCoreType = !!normalizeRestaurantType(
      rest?.type
      || rest?.customerType
      || rest?.category
      || rest?.kind
      || rest?.restaurantType
      || ""
    );
    if (hasCoreName && hasCoreLogo && hasCoreCity && hasCoreType) {
      return Promise.resolve(null);
    }
    return getDoc(doc(db, "restaurants", rid, "public", "meta")).catch(() => null);
  });
  const metaSnaps = await Promise.all(lookups);
  return restaurants.map((rest, idx) => {
    const snap = metaSnaps[idx];
    const meta = snap && typeof snap.exists === "function" && snap.exists() ? (snap.data() || {}) : {};
    return mergeRestaurantMeta(rest, meta);
  });
}

function syncFeedPostLogos() {
  const storiesChanged = syncStoryIdentityWithCanonicalBusiness();
  if (!state.feedPosts.length) return storiesChanged;
  const restMap = new Map();
  state.restaurants.forEach((rest) => {
    if (rest?.id) restMap.set(rest.id, rest);
  });
  let changed = false;
  const next = [];
  state.feedPosts.forEach((post) => {
    const rid = String(post.restaurantId || post.ownerId || "").trim();
    if (!rid) {
      next.push(post);
      return;
    }
    const restaurant = restMap.get(rid) || {};
    if (restaurant?.id && !isPublicBusinessRecord(restaurant)) {
      changed = true;
      return;
    }
    const bestLogo = restaurant.logoUrl || restaurant.logo || restaurant.logoURL || post.logo || "";
    const resolved = resolveRestaurantLogo(rid, bestLogo, "avatar");
    if (isPlaceholderUrl(resolved) || resolved === post.logo) {
      next.push(post);
      return;
    }
    changed = true;
    next.push({ ...post, logo: resolved });
  });
  const feedLengthChanged = next.length !== state.feedPosts.length;
  if (!changed && !feedLengthChanged && !storiesChanged) return false;
  if (changed || feedLengthChanged) {
    state.feedPosts = next;
  }
  return changed || feedLengthChanged || storiesChanged;
}

function buildStoriesSignature(storyItems = []) {
  return buildStoriesSignatureCore(storyItems);
}

function isGenericStoryBusinessLabel(value = "") {
  return String(value || "").trim().toLowerCase() === "business";
}

function sanitizeStoryBusinessName(value = "") {
  const label = String(value || "").trim();
  if (!label) return "";
  return isGenericStoryBusinessLabel(label) ? "" : label;
}

function resolveStoryBusinessIdentity(restaurantId = "") {
  const rid = String(restaurantId || "").trim();
  if (!rid) {
    return {
      restaurantId: "",
      known: false,
      hasCanonicalRestaurant: false,
      name: "",
      avatar: "",
      ownStory: false,
      restaurant: null
    };
  }
  const ownRestaurantId = String(state.userProfile?.restaurantId || "").trim();
  const ownStory = ownRestaurantId && ownRestaurantId === rid;
  const restaurant = state.restaurants.find((row) => String(row?.id || "").trim() === rid) || null;
  const hasCanonicalRestaurant = !!restaurant?.id;
  const ownFallbackName = ownStory ? sanitizeStoryBusinessName(state.userProfile?.name || "") : "";
  const ownFallbackAvatar = ownStory ? String(state.userProfile?.avatar || "").trim() : "";
  const canonicalName = sanitizeStoryBusinessName(
    restaurant?.name
    || restaurant?.restaurantName
    || restaurant?.displayName
    || restaurant?.businessName
    || ""
  );
  const canonicalAvatar = String(
    restaurant?.logoUrl
    || restaurant?.logo
    || restaurant?.logoURL
    || ""
  ).trim();
  const name = hasCanonicalRestaurant ? canonicalName : ownFallbackName;
  const avatar = hasCanonicalRestaurant ? canonicalAvatar : ownFallbackAvatar;
  return {
    restaurantId: rid,
    known: !!(hasCanonicalRestaurant || ownStory),
    hasCanonicalRestaurant,
    name,
    avatar,
    ownStory,
    restaurant
  };
}

function resolveStoryRenderIdentity(story = {}) {
  const storyRestaurantId = String(story?.restaurantId || story?.id || story?.rid || "").trim();
  if (!storyRestaurantId) {
    return {
      storyRestaurantId: "",
      hasCanonicalRestaurant: false,
      storyLabel: "",
      logoSource: "",
      borderClass: story?.isLive ? "border-red-500 animate-pulse" : "border-slate-200"
    };
  }
  const identity = resolveStoryBusinessIdentity(storyRestaurantId);
  const sourceName = sanitizeStoryBusinessName(
    story?.name
    || story?.businessName
    || story?.restaurantName
    || story?.business
    || ""
  );
  const sourceLogo = String(story?.img || story?.logo || story?.logoUrl || "").trim();
  const canonicalName = sanitizeStoryBusinessName(identity.name || "");
  const canonicalLogo = String(identity.avatar || "").trim();
  const storyLabel = identity.hasCanonicalRestaurant
    ? (canonicalName || sourceName || "")
    : (sanitizeStoryBusinessName(identity.name || sourceName || ""));
  const logoSource = identity.hasCanonicalRestaurant
    ? canonicalLogo
    : String(identity.avatar || sourceLogo || "").trim();
  return {
    storyRestaurantId,
    hasCanonicalRestaurant: !!identity.hasCanonicalRestaurant,
    storyLabel,
    logoSource,
    borderClass: story?.isLive ? "border-red-500 animate-pulse" : "border-slate-200"
  };
}

function normalizeStoryItemForDisplay(item = {}) {
  const identity = resolveStoryRenderIdentity(item);
  const restaurantId = identity.storyRestaurantId;
  if (!restaurantId) return null;
  return {
    ...item,
    id: restaurantId,
    restaurantId,
    name: sanitizeStoryBusinessName(identity.storyLabel || ""),
    img: String(identity.logoSource || "").trim(),
    isLive: !!item?.isLive
  };
}

function normalizeStoryItemsForDisplay(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => normalizeStoryItemForDisplay(item))
    .filter(Boolean);
}

function syncStoryIdentityWithCanonicalBusiness() {
  if (!Array.isArray(state.stories) || !state.stories.length) return false;
  const nextStories = normalizeStoryItemsForDisplay(state.stories);
  const prevSignature = buildStoriesSignature(state.stories);
  const nextSignature = buildStoriesSignature(nextStories);
  if (prevSignature === nextSignature) return false;
  state.stories = nextStories;
  feedStoriesSignature = nextSignature;
  writeCache(CACHE_KEYS.stories, nextStories);
  return true;
}

function refreshFeedStories({ posts = state.feedPosts, force = false } = {}) {
  if (Array.isArray(state.stories) && state.stories.length) {
    if (!feedStoriesSignature) {
      feedStoriesSignature = buildStoriesSignature(state.stories);
    }
    return false;
  }
  const result = refreshFeedStoriesCore({
    posts,
    force,
    fastMode: FAST_MODE,
    buildStoriesFromFeed,
    currentSignature: feedStoriesSignature
  });
  if (!result.updated) return false;
  const normalizedStories = normalizeStoryItemsForDisplay(result.stories);
  feedStoriesSignature = buildStoriesSignature(normalizedStories);
  state.stories = normalizedStories;
  writeCache(CACHE_KEYS.stories, normalizedStories);
  queueStoryIdentityHydration(normalizedStories, { max: FAST_LIMITS.storyIdentityHydration });
  return true;
}

async function loadStoriesForFeed({ force = false, refreshUi = true } = {}) {
  const cached = readCache(CACHE_KEYS.stories, CACHE_TTL_MS.stories);
  if (cached?.data?.length) {
    const normalizedCachedStories = normalizeStoryItemsForDisplay(cached.data);
    state.stories = normalizedCachedStories;
    feedStoriesSignature = buildStoriesSignature(state.stories);
    queueStoryIdentityHydration(normalizedCachedStories, { max: FAST_LIMITS.storyIdentityHydration });
    if (cached.fresh && !force) {
      if (!storiesFreshReconcileQueued) {
        storiesFreshReconcileQueued = true;
        queueMicrotask(() => {
          void loadStoriesForFeed({ force: true, refreshUi: state.activeTab === "feed" })
            .finally(() => {
              storiesFreshReconcileQueued = false;
            });
        });
      }
      return true;
    }
  }

  try {
    const storiesRef = collectionGroup(db, "stories");
    let snap = null;
    try {
      snap = await getDocs(query(storiesRef, where("status", "==", "active"), orderBy("createdAt", "desc"), limit(FAST_LIMITS.storiesFallback)));
    } catch (statusErr) {
      try {
        snap = await getDocs(query(storiesRef, orderBy("createdAt", "desc"), limit(FAST_LIMITS.storiesFallback)));
      } catch (sortErr) {
        snap = await getDocs(query(storiesRef, limit(FAST_LIMITS.storiesFallback)));
      }
    }
    const docSnaps = [];
    snap.forEach((docSnap) => docSnaps.push(docSnap));
    const nextStories = normalizeStoryItemsForDisplay(
      storySystemController.mapStorySnapshotRowsToFeedStories({
      docSnaps,
      restaurants: state.restaurants,
      canShowFeedRestaurantIdFn: canShowFeedRestaurantId,
      maxItems: FAST_LIMITS.stories,
      toDateSafeFn: toDateSafe
    })
    );
    const shouldRefreshUi = !!refreshUi || state.activeTab === "feed";
    if (!nextStories.length) {
      if (!state.stories.length) return false;
      state.stories = [];
      feedStoriesSignature = "";
      writeCache(CACHE_KEYS.stories, []);
      if (shouldRefreshUi) {
        const inMain = lastRenderMode === "main";
        const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
        if (!updatedFeed && state.activeTab === "feed") {
          render();
        }
      }
      return true;
    }

    const prevSignature = buildStoriesSignature(state.stories);
    const nextSignature = buildStoriesSignature(nextStories);
    if (prevSignature === nextSignature) {
      feedStoriesSignature = nextSignature;
      return true;
    }

    state.stories = nextStories;
    feedStoriesSignature = nextSignature;
    writeCache(CACHE_KEYS.stories, nextStories);
    queueStoryIdentityHydration(nextStories, { max: FAST_LIMITS.storyIdentityHydration });

    if (shouldRefreshUi) {
      const inMain = lastRenderMode === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
      if (!updatedFeed && state.activeTab === "feed") {
        render();
      }
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function preloadFeedHeroImages(feedPosts, { limit = FEED_PRELOAD_LIMIT } = {}) {
  if (!Array.isArray(feedPosts)) return;
  if (typeof document === "undefined") return;
  const head = document.head || document.querySelector("head");
  if (!head) return;
  const wildcard = `[${FEED_PRELOAD_ATTR}]`;
  head.querySelectorAll(wildcard).forEach((node) => node.remove());
  feedPosts.slice(0, limit).forEach((post, index) => {
    const imageUrl = getOptimizedImageUrl(post.image, "large");
    if (!imageUrl) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = imageUrl;
    link.setAttribute(FEED_PRELOAD_ATTR, "hero");
    if (index === 0) link.setAttribute("fetchpriority", "high");
    head.appendChild(link);
  });
}

function resolveAdminLogin(email, pass) {
  const key = String(email || "").trim().toLowerCase();
  if (!key || pass !== key) return null;
  return ADMIN_LOGINS[key] || null;
}

async function signInOrCreateAdmin(admin) {
  try {
    return await signInWithEmailAndPassword(auth, admin.email, admin.password);
  } catch (err) {
    const created = await createUserWithEmailAndPassword(auth, admin.email, admin.password);
    if (admin.profile?.displayName) {
      await updateProfile(created.user, { displayName: admin.profile.displayName });
    }
    return created;
  }
}

function isGenericHandle(handle) {
  return isGenericHandleCore(handle, {
    normalizeHandleFn: normalizeHandle
  });
}

function resolvePreferredHandle(profile, fallbackName = "") {
  return resolvePreferredHandleCore(profile, fallbackName, {
    normalizeHandleFn: normalizeHandle,
    isGenericHandleFn: isGenericHandle
  });
}

function normalizeCeoCountry(value) {
  return normalizeCeoCountryCore(value, {
    allowedCountries: CEO_COUNTRIES
  });
}

function normalizeCeoPath(value, fallback = []) {
  return normalizeCeoPathCore(value, fallback, {
    uniqueStringListFn: uniqueStringList
  });
}

function getCurrentCeoMeta(profile = state.userProfile, user = state.user) {
  return getCurrentCeoMetaCore(profile, user, {
    normalizeCeoPathFn: normalizeCeoPath,
    hasGlobalCeoAccessFn: hasGlobalCeoAccess,
    uniqueStringListFn: uniqueStringList
  });
}

function normalizeCeoStaffRecord(record = {}, userRecord = {}) {
  return normalizeCeoStaffRecordCore(record, userRecord, {
    buildCeoNameFn: buildCeoName,
    normalizeCeoPathFn: normalizeCeoPath,
    normalizeHandleFn: normalizeHandle,
    normalizeCeoCountryFn: normalizeCeoCountry,
    hasStoredCeoCrmCountsFn: hasStoredCeoCrmCounts,
    sanitizeCeoCrmCountsFn: sanitizeCeoCrmCounts,
    parseCoordNumberFn: parseCoordNumber
  });
}

function overlayCeoStaffProfile(record = {}, userRecord = {}) {
  return overlayCeoStaffProfileCore(record, userRecord, {
    parseCoordNumberFn: parseCoordNumber
  });
}

function buildCeoDirectorySyncPatch(record = {}, userRecord = {}) {
  return buildCeoDirectorySyncPatchCore(record, userRecord, {
    overlayCeoStaffProfileFn: overlayCeoStaffProfile,
    parseCoordNumberFn: parseCoordNumber
  });
}

async function hydrateStaffRecordsFromUserProfiles(items = [], { syncDirectory = false } = {}) {
  const list = Array.isArray(items) ? items.slice() : [];
  const uids = uniqueStringList(list.map((item) => String(item?.uid || "").trim()).filter(Boolean));
  if (!uids.length) return list;
  const userMap = new Map();
  const usersRef = collection(db, "users");
  const chunks = chunkStringList(uids, 10);
  await Promise.all(chunks.map(async (chunk) => {
    if (!chunk.length) return;
    try {
      const snap = await getDocs(query(usersRef, where(documentId(), "in", chunk)));
      snap.forEach((docSnap) => {
        userMap.set(docSnap.id, docSnap.data() || {});
      });
      return;
    } catch {}
    await Promise.all(chunk.map(async (uid) => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) userMap.set(uid, snap.data() || {});
      } catch {}
    }));
  }));
  const syncWrites = [];
  const nextItems = list.map((item) => {
    const uid = String(item?.uid || "").trim();
    if (!uid) return item;
    const userRecord = userMap.get(uid);
    if (!userRecord) return item;
    if (syncDirectory) {
      const patch = buildCeoDirectorySyncPatch(item, userRecord);
      if (Object.keys(patch).length) {
        syncWrites.push(setDoc(doc(db, "superadmins", uid), {
          ...patch,
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(() => {}));
      }
    }
    return normalizeCeoStaffRecord(overlayCeoStaffProfile(item, userRecord));
  });
  if (syncWrites.length) {
    void Promise.all(syncWrites);
  }
  return nextItems;
}

function canViewCeoRecord(record = {}) {
  const current = getCurrentCeoMeta();
  if (!current.uid) return false;
  if (String(record.uid || "") === current.uid) return true;
  const path = normalizeCeoPath(record.ceoPath, [record.ceoRootUid, record.ceoParentUid, record.uid]);
  if (path.includes(current.uid)) return true;
  if (hasGlobalCeoAccess() && !String(record.ceoParentUid || "").trim()) return true;
  return false;
}

function getOwnerMeta(row = {}) {
  const source = applyKnownLeadOwnershipOverride(row);
  const creatorUid = String(
    source.createdByUid
    || source.ownerUid
    || source.socialUid
    || source.uid
    || ""
  ).trim();
  const creatorName = String(
    source.createdByName
    || source.createdByHandle
    || source.ownerName
    || ""
  ).trim();
  let ceoPath = normalizeCeoPath(source.ceoPath);
  if (!ceoPath.length && creatorUid) {
    ceoPath = normalizeCeoPath([], [
      source.ceoRootUid || source.rootCeoUid || "",
      source.ceoParentUid || source.parentCeoUid || "",
      creatorUid
    ]);
  }
  return { creatorUid, creatorName, ceoPath };
}

function chunkStringList(values = [], size = 10) {
  const out = [];
  const list = uniqueStringList(values);
  for (let i = 0; i < list.length; i += size) {
    out.push(list.slice(i, i + size));
  }
  return out;
}

function getVisibleCeoTeamUids() {
  if (!isCeoUser()) return [];
  const current = getCurrentCeoMeta();
  const staffUids = (Array.isArray(state.staff.items) ? state.staff.items : [])
    .filter((item) => canViewCeoRecord(item))
    .map((item) => String(item.uid || "").trim())
    .filter(Boolean);
  return uniqueStringList([current.uid, ...staffUids]);
}

function isOwnedByVisibleCeoTeam(row = {}) {
  if (!isCeoUser()) return true;
  const current = getCurrentCeoMeta();
  if (!current.uid) return false;
  const meta = getOwnerMeta(row);
  const teamUids = getVisibleCeoTeamUids();
  if (meta.creatorUid && meta.creatorUid === current.uid) return true;
  if (meta.ceoPath.includes(current.uid)) return true;
  if (meta.creatorUid && teamUids.includes(meta.creatorUid)) return true;
  if (meta.ceoPath.some((uid) => teamUids.includes(uid))) return true;
  return false;
}

function canCurrentCeoSeeRow(row = {}) {
  if (!isCeoUser()) return true;
  const current = getCurrentCeoMeta();
  if (!current.uid) return true;
  const meta = getOwnerMeta(row);
  if (isOwnedByVisibleCeoTeam(row)) return true;
  if (hasGlobalCeoAccess() && !meta.ceoPath.length && !meta.creatorUid) return true;
  return false;
}

function resolveOwnershipMeta(row = {}) {
  if (!isCeoUser()) return null;
  const current = getCurrentCeoMeta();
  if (!current.uid) return null;
  const meta = getOwnerMeta(row);
  if (!meta.creatorUid || meta.creatorUid === current.uid) {
    return { own: true, label: "Eigene", creatorName: "" };
  }
  return {
    own: false,
    label: "Staff",
    creatorName: meta.creatorName || meta.creatorUid || "Unbekannt"
  };
}

function isCurrentCeoOwnRow(row = {}) {
  const meta = resolveOwnershipMeta(row);
  return !meta || !!meta.own;
}

function normalizeLeadScopeKey(value) {
  return normalizeLeadScopeKeyCore(value);
}

function normalizeCustomerScopeKey(value) {
  return normalizeCustomerScopeKeyCore(value);
}

function resolveKnownScopeCountLabel(count = 0, isExact = false, isLoaded = false) {
  if (!isLoaded) return "...";
  const safeCount = Math.max(0, Number(count) || 0);
  return isExact ? String(safeCount) : `${safeCount}+`;
}

function renderCeoScopeTabs({
  idPrefix = "ceoScope",
  active = "own",
  ownLabel = "Meine",
  ownCount = 0,
  staffLabel = "Staff",
  staffCount = 0,
  tabs = null
} = {}) {
  const tabList = Array.isArray(tabs) && tabs.length
    ? tabs
    : [
      {
        key: "own",
        label: ownLabel,
        count: ownCount
      },
      {
        key: "staff",
        label: staffLabel,
        count: staffCount
      }
    ];
  return `
    <div class="grid gap-2 mb-4 w-full" style="grid-template-columns: repeat(${Math.max(1, tabList.length)}, minmax(0, 1fr));">
      ${tabList.map((tab) => {
        const selected = tab.key === active;
        return `
          <button
            type="button"
            data-${escapeHtml(idPrefix)}="${escapeHtml(tab.key)}"
            class="rounded-[1.5rem] px-3 py-2.5 text-left border transition-all ${selected ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200/70" : "bg-white text-slate-600 border-slate-100 shadow-sm"}"
          >
            <p class="text-[8px] font-black uppercase tracking-[0.16em] ${selected ? "text-white/70" : "text-slate-400"}">${escapeHtml(tab.label)}</p>
            <p class="text-base font-black tracking-tight mt-1">${escapeHtml(String(tab.count))}</p>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderOwnershipPills(row = {}, { hideOwn = false } = {}) {
  const meta = resolveOwnershipMeta(row);
  if (!meta) return "";
  if (meta.own && hideOwn) return "";
  const chips = [
    `<span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">${escapeHtml(meta.label)}</span>`
  ];
  if (!meta.own && meta.creatorName) {
    chips.push(`<span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest">${escapeHtml(meta.creatorName)}</span>`);
  }
  return `<div class="flex flex-wrap gap-2 mt-3">${chips.join("")}</div>`;
}

function buildCeoCreatorMeta(profile = state.userProfile, user = state.user) {
  const current = getCurrentCeoMeta(profile, user);
  const handle = String(profile?.handle || normalizeHandle(current.name || "ceo")).trim();
  return {
    createdByUid: current.uid || "",
    createdByRole: "ceo",
    createdByName: current.name || "",
    createdByHandle: handle,
    ceoRootUid: current.rootUid || current.uid || "",
    ceoRootName: current.rootName || current.name || "",
    ceoParentUid: current.parentUid || "",
    ceoPath: Array.isArray(current.path) ? current.path.slice() : []
  };
}

function resolveStoredCeoCreatorMeta(...sources) {
  let createdByUid = "";
  let createdByRole = "";
  let createdByName = "";
  let createdByHandle = "";
  let ceoRootUid = "";
  let ceoRootName = "";
  let ceoParentUid = "";
  let ceoPath = [];
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    if (!createdByUid) createdByUid = String(source.createdByUid || "").trim();
    if (!createdByRole) createdByRole = String(source.createdByRole || "").trim();
    if (!createdByName) createdByName = String(source.createdByName || "").trim();
    if (!createdByHandle) createdByHandle = String(source.createdByHandle || "").trim();
    if (!ceoRootUid) ceoRootUid = String(source.ceoRootUid || "").trim();
    if (!ceoRootName) ceoRootName = String(source.ceoRootName || "").trim();
    if (!ceoParentUid) ceoParentUid = String(source.ceoParentUid || "").trim();
    if (!ceoPath.length) {
      ceoPath = normalizeCeoPath(source.ceoPath, [ceoRootUid, ceoParentUid, createdByUid]);
    }
  }
  if (!createdByUid && ceoPath.length) createdByUid = ceoPath[ceoPath.length - 1];
  if (!ceoRootUid && ceoPath.length) ceoRootUid = ceoPath[0];
  if (!ceoParentUid && ceoPath.length > 1) ceoParentUid = ceoPath[ceoPath.length - 2];
  ceoPath = normalizeCeoPath(ceoPath, [ceoRootUid, ceoParentUid, createdByUid]);
  if (!(createdByUid || createdByName || createdByHandle || ceoRootUid || ceoParentUid || ceoPath.length)) {
    return buildCeoCreatorMeta();
  }
  return {
    createdByUid,
    createdByRole: createdByRole || "ceo",
    createdByName,
    createdByHandle,
    ceoRootUid: ceoRootUid || createdByUid,
    ceoRootName: ceoRootName || createdByName,
    ceoParentUid,
    ceoPath
  };
}

function createEmptyCeoCrmCounts() {
  return {
    ownLeads: 0,
    staffLeads: 0,
    archivedLeads: 0,
    ownCustomers: 0,
    staffCustomers: 0,
    ownArchivedLeads: 0
  };
}

function sanitizeCeoCrmCounts(raw = {}) {
  const base = createEmptyCeoCrmCounts();
  Object.keys(base).forEach((key) => {
    const num = Number(raw?.[key]);
    base[key] = Number.isFinite(num) ? num : 0;
  });
  return base;
}

function hasStoredCeoCrmCounts(raw = {}) {
  if (!raw || typeof raw !== "object") return false;
  return Object.keys(createEmptyCeoCrmCounts()).some((key) => Number.isFinite(Number(raw?.[key])));
}

function applyLocalCeoCrmCountDelta(uid, delta = {}) {
  const safeUid = String(uid || "").trim();
  if (!safeUid) return;
  const keys = Object.keys(createEmptyCeoCrmCounts());
  if (String(state.user?.uid || state.userProfile?.uid || "") === safeUid) {
    const next = sanitizeCeoCrmCounts(state.userProfile?.crmCounts || {});
    keys.forEach((key) => {
      const amount = Number(delta?.[key]) || 0;
      if (!amount) return;
      next[key] = Math.max(0, next[key] + amount);
    });
    state.userProfile = {
      ...state.userProfile,
      crmCounts: next
    };
    saveUserProfileToStorage();
  }
  if (Array.isArray(state.staff.items) && state.staff.items.length) {
    state.staff.items = state.staff.items.map((item) => {
      if (String(item?.uid || "") !== safeUid) return item;
      const next = sanitizeCeoCrmCounts(item?.crmCounts || {});
      keys.forEach((key) => {
        const amount = Number(delta?.[key]) || 0;
        if (!amount) return;
        next[key] = Math.max(0, next[key] + amount);
      });
      return {
        ...item,
        crmCounts: next
      };
    });
  }
}

function buildLeadCrmContribution(lead = null) {
  if (!lead) return null;
  const normalized = normalizeLeadDoc(lead);
  const meta = getOwnerMeta(normalized);
  const path = normalizeCeoPath(meta.ceoPath, [normalized.ceoRootUid, normalized.ceoParentUid, meta.creatorUid]);
  const creatorUid = String(meta.creatorUid || path[path.length - 1] || "").trim();
  if (!creatorUid && !path.length) return null;
  const statusKey = normalizeLeadStatusKey(normalized.status || "");
  if (statusKey === "kunde") return null;
  return {
    creatorUid,
    path: normalizeCeoPath(path, [creatorUid]),
    ownLeads: statusKey === "no_interest" ? 0 : 1,
    ownArchivedLeads: statusKey === "no_interest" ? 1 : 0,
    ownCustomers: 0
  };
}

function buildCustomerCrmContribution(customer = null) {
  if (!customer || !isCustomerRestaurant(customer)) return null;
  const meta = getOwnerMeta(customer);
  const path = normalizeCeoPath(meta.ceoPath, [customer.ceoRootUid, customer.ceoParentUid, meta.creatorUid]);
  const creatorUid = String(meta.creatorUid || path[path.length - 1] || "").trim();
  if (!creatorUid && !path.length) return null;
  return {
    creatorUid,
    path: normalizeCeoPath(path, [creatorUid]),
    ownLeads: 0,
    ownArchivedLeads: 0,
    ownCustomers: 1
  };
}

function accumulateCeoCrmDelta(deltaMap, contribution, sign = 1) {
  if (!contribution || !sign) return;
  const path = normalizeCeoPath(contribution.path, [contribution.creatorUid]);
  const creatorUid = String(contribution.creatorUid || path[path.length - 1] || "").trim();
  const leadDelta = (Number(contribution.ownLeads) || 0) * sign;
  const archivedDelta = (Number(contribution.ownArchivedLeads) || 0) * sign;
  const customerDelta = (Number(contribution.ownCustomers) || 0) * sign;
  const ensure = (uid) => {
    const key = String(uid || "").trim();
    if (!key) return null;
    if (!deltaMap.has(key)) deltaMap.set(key, createEmptyCeoCrmCounts());
    return deltaMap.get(key);
  };
  const creatorCounts = ensure(creatorUid);
  if (creatorCounts) {
    creatorCounts.ownLeads += leadDelta;
    creatorCounts.ownArchivedLeads += archivedDelta;
    creatorCounts.archivedLeads += archivedDelta;
    creatorCounts.ownCustomers += customerDelta;
  }
  path.forEach((uid) => {
    const key = String(uid || "").trim();
    if (!key || key === creatorUid) return;
    const target = ensure(key);
    if (!target) return;
    target.staffLeads += leadDelta;
    target.staffCustomers += customerDelta;
    target.archivedLeads += archivedDelta;
  });
}

async function applyCeoCrmCountDeltas(deltaMap) {
  if (!(deltaMap instanceof Map) || !deltaMap.size) return;
  const writes = [];
  deltaMap.forEach((delta, uid) => {
    const safeUid = String(uid || "").trim();
    if (!safeUid) return;
    const nested = {};
    Object.entries(delta || {}).forEach(([key, value]) => {
      const amount = Number(value) || 0;
      if (!amount) return;
      nested[key] = increment(amount);
    });
    if (!Object.keys(nested).length) return;
    const payload = {
      crmCounts: nested,
      updatedAt: serverTimestamp()
    };
    writes.push(setDoc(doc(db, "users", safeUid), payload, { merge: true }).catch(() => {}));
    writes.push(setDoc(doc(db, "superadmins", safeUid), payload, { merge: true }).catch(() => {}));
    applyLocalCeoCrmCountDelta(safeUid, delta);
  });
  if (writes.length) {
    await Promise.all(writes);
  }
}

async function fetchCeoTeamEntriesForCrmCounts(currentMeta = getCurrentCeoMeta()) {
  const currentUid = String(currentMeta?.uid || "").trim();
  if (!currentUid) return [];
  const staffRef = collection(db, "superadmins");
  const queryRefs = [
    query(staffRef, where("ceoPath", "array-contains", currentUid)),
    query(staffRef, where("ceoParentUid", "==", currentUid))
  ];
  if (hasGlobalCeoAccess()) {
    queryRefs.push(query(staffRef));
  }
  const snaps = await Promise.all(queryRefs.map((ref) => getDocs(ref).catch(() => null)));
  const rowMap = new Map();
  snaps.forEach((snap) => {
    if (!snap?.docs?.length) return;
    snap.docs.forEach((docSnap) => {
      rowMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
    });
  });
  return Array.from(rowMap.values())
    .map((row) => normalizeCeoStaffRecord(row))
    .filter((item) => canViewCeoRecord(item) && String(item.uid || "") !== currentUid)
    .filter((item) => !isHiddenLegacyCeoEmail(item.email || ""))
    .sort((a, b) => {
      const ta = toDateSafe(a.createdAt)?.getTime() || 0;
      const tb = toDateSafe(b.createdAt)?.getTime() || 0;
      if (tb !== ta) return tb - ta;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
}

async function fetchNestedCeoStaffEntries(rootUids = []) {
  const roots = uniqueStringList(rootUids);
  if (!roots.length) return [];
  const staffRef = collection(db, "superadmins");
  const queryRefs = [];
  chunkStringList(roots, 10).forEach((uids) => {
    if (!uids.length) return;
    queryRefs.push(query(staffRef, where("ceoPath", "array-contains-any", uids)));
    queryRefs.push(query(staffRef, where("ceoParentUid", "in", uids)));
  });
  const snaps = await Promise.all(queryRefs.map((ref) => getDocs(ref).catch(() => null)));
  const rowMap = new Map();
  snaps.forEach((snap) => {
    if (!snap?.docs?.length) return;
    snap.docs.forEach((docSnap) => {
      rowMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
    });
  });
  return Array.from(rowMap.values())
    .map((row) => normalizeCeoStaffRecord(row))
    .filter((item) => !isHiddenLegacyCeoEmail(item.email || ""))
    .sort((a, b) => {
      const ta = toDateSafe(a.createdAt)?.getTime() || 0;
      const tb = toDateSafe(b.createdAt)?.getTime() || 0;
      if (tb !== ta) return tb - ta;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
}

async function ensureCeoCrmCountsLoaded({ force = false } = {}) {
  if (!isCeoUser()) return;
  const current = getCurrentCeoMeta();
  if (!current.uid) return;
  const currentReady = hasStoredCeoCrmCounts(state.userProfile?.crmCounts || {});
  const staffReady = (Array.isArray(state.staff.items) ? state.staff.items : []).every((item) => hasStoredCeoCrmCounts(item?.crmCounts || {}));
  if (!force && currentReady && staffReady) return;
  if (ceoCrmCountsPromise) {
    await ceoCrmCountsPromise;
    return;
  }
  ceoCrmCountsPromise = (async () => {
    const currentMeta = getCurrentCeoMeta();
    const visibleStaffItems = Array.isArray(state.staff.items) ? state.staff.items : [];
    const missingVisibleStaff = visibleStaffItems.filter((item) => !hasStoredCeoCrmCounts(item?.crmCounts || {}));
    const needsCurrentRecount = force || !currentReady;
    let teamStaffEntries = [];
    if (needsCurrentRecount) {
      teamStaffEntries = (dataLoaded.staff && !state.staff.hasMore && visibleStaffItems.length)
        ? visibleStaffItems.slice()
        : await fetchCeoTeamEntriesForCrmCounts(currentMeta);
    } else if (missingVisibleStaff.length) {
      const nestedStaff = await fetchNestedCeoStaffEntries(missingVisibleStaff.map((item) => String(item?.uid || "").trim()));
      const mergedStaff = new Map();
      [...missingVisibleStaff, ...nestedStaff].forEach((item) => {
        const uid = String(item?.uid || "").trim();
        if (!uid) return;
        mergedStaff.set(uid, item);
      });
      teamStaffEntries = Array.from(mergedStaff.values());
    }
    const teamEntries = [
      ...(needsCurrentRecount ? [{
        uid: currentMeta.uid,
        ceoPath: Array.isArray(currentMeta.path) ? currentMeta.path.slice() : [currentMeta.uid]
      }] : []),
      ...(teamStaffEntries.map((item) => ({
        uid: String(item?.uid || "").trim(),
        ceoPath: normalizeCeoPath(item?.ceoPath, [item?.ceoRootUid, item?.ceoParentUid, item?.uid])
      })))
    ].filter((entry) => entry.uid);
    const teamUids = uniqueStringList(teamEntries.map((entry) => entry.uid));
    if (!teamUids.length) return;

    const ownMap = new Map(teamUids.map((uid) => [uid, createEmptyCeoCrmCounts()]));

    const leadSnaps = await Promise.all(chunkStringList(teamUids, 10).map((uids) => (
      getDocs(query(collection(db, "leads"), where("createdByUid", "in", uids))).catch(() => null)
    )));
    leadSnaps.forEach((snap) => {
      if (!snap?.docs?.length) return;
      snap.docs.forEach((docSnap) => {
        const lead = normalizeLeadDoc({ id: docSnap.id, ...(docSnap.data() || {}) });
        const uid = String(lead.createdByUid || "").trim();
        if (!uid || !ownMap.has(uid)) return;
        const counts = ownMap.get(uid);
        const statusKey = normalizeLeadStatusKey(lead.status || "");
        if (statusKey === "kunde") return;
        if (statusKey === "no_interest") {
          counts.ownArchivedLeads += 1;
        } else {
          counts.ownLeads += 1;
        }
      });
    });

    const customerSnaps = await Promise.all(chunkStringList(teamUids, 10).map((uids) => (
      getDocs(query(collection(db, "restaurants"), where("createdByUid", "in", uids))).catch(() => null)
    )));
    customerSnaps.forEach((snap) => {
      if (!snap?.docs?.length) return;
      snap.docs.forEach((docSnap) => {
        const row = { id: docSnap.id, ...(docSnap.data() || {}) };
        if (!isCustomerRestaurant(row)) return;
        const uid = String(row.createdByUid || "").trim();
        if (!uid || !ownMap.has(uid)) return;
        ownMap.get(uid).ownCustomers += 1;
      });
    });

    const aggregateMap = new Map();
    teamUids.forEach((uid) => {
      const own = sanitizeCeoCrmCounts(ownMap.get(uid) || {});
      aggregateMap.set(uid, {
        ...createEmptyCeoCrmCounts(),
        ...own,
        archivedLeads: own.ownArchivedLeads
      });
    });

    teamEntries.forEach((entry) => {
      const uid = String(entry.uid || "").trim();
      if (!uid) return;
      const own = sanitizeCeoCrmCounts(ownMap.get(uid) || {});
      const path = normalizeCeoPath(entry.ceoPath, [uid]);
      path.forEach((ancestorUid) => {
        const safeAncestorUid = String(ancestorUid || "").trim();
        if (!safeAncestorUid || safeAncestorUid === uid || !aggregateMap.has(safeAncestorUid)) return;
        const target = aggregateMap.get(safeAncestorUid);
        target.staffLeads += own.ownLeads;
        target.staffCustomers += own.ownCustomers;
        target.archivedLeads += own.ownArchivedLeads;
      });
    });

    const persistWrites = [];
    aggregateMap.forEach((counts, uid) => {
      const safeUid = String(uid || "").trim();
      if (!safeUid) return;
      const payload = {
        crmCounts: sanitizeCeoCrmCounts(counts),
        updatedAt: serverTimestamp()
      };
      persistWrites.push(setDoc(doc(db, "users", safeUid), payload, { merge: true }).catch(() => {}));
      persistWrites.push(setDoc(doc(db, "superadmins", safeUid), payload, { merge: true }).catch(() => {}));
      if (safeUid === String(state.user?.uid || state.userProfile?.uid || "")) {
        state.userProfile = {
          ...state.userProfile,
          crmCounts: sanitizeCeoCrmCounts(counts)
        };
        saveUserProfileToStorage();
      }
    });
    if (persistWrites.length) {
      await Promise.all(persistWrites);
    }
    if (Array.isArray(state.staff.items) && state.staff.items.length) {
      state.staff.items = state.staff.items.map((item) => {
        const counts = aggregateMap.get(String(item?.uid || "").trim());
        return counts ? { ...item, crmCounts: sanitizeCeoCrmCounts(counts) } : item;
      });
    }
    render();
  })();
  try {
    await ceoCrmCountsPromise;
  } finally {
    ceoCrmCountsPromise = null;
  }
}

function normalizeProfile(data, user) {
  const displayName = data?.displayName || user?.displayName || user?.email?.split("@")[0] || "User";
  const roles = normalizeRoleList(data?.roles || data?.role || "");
  const lat = data?.gpsLat ?? data?.lat ?? null;
  const lng = data?.gpsLng ?? data?.lng ?? null;
  return {
    name: displayName,
    handle: data?.handle || normalizeHandle(displayName),
    bio: data?.bio || "",
    avatar: data?.avatarUrl || data?.avatar || user?.photoURL || "",
    location: data?.city || "Prishtina",
    address: data?.address || "",
    followers: data?.followersCount ?? 0,
    following: data?.followingCount ?? 0,
    privateAccount: !!data?.privateAccount,
    karma: String(data?.score ?? "0"),
    roles,
    role: data?.role || "user",
    isPremium: data?.isPremium || false,
    restaurantId: data?.restaurantId || "",
    leadSettings: normalizeLeadSettings(data?.leadSettings || null),
    country: normalizeCeoCountry(data?.country),
    ceoParentUid: data?.ceoParentUid || data?.parentCeoUid || "",
    ceoParentName: data?.ceoParentName || data?.parentCeoName || "",
    ceoRootUid: data?.ceoRootUid || data?.rootCeoUid || "",
    ceoRootName: data?.ceoRootName || data?.rootCeoName || "",
    ceoPath: normalizeCeoPath(data?.ceoPath),
    crmCounts: hasStoredCeoCrmCounts(data?.crmCounts) ? sanitizeCeoCrmCounts(data.crmCounts) : null,
    lat: Number.isFinite(Number(lat)) ? Number(lat) : null,
    lng: Number.isFinite(Number(lng)) ? Number(lng) : null,
    gpsLat: Number.isFinite(Number(lat)) ? Number(lat) : null,
    gpsLng: Number.isFinite(Number(lng)) ? Number(lng) : null,
    posts: []
  };
}

function normalizeBusinessProfile(rest = {}, user) {
  const displayName = rest?.name || rest?.restaurantName || user?.displayName || user?.email?.split("@")[0] || "Business";
  const handle = resolvePreferredHandle({ handle: rest?.handle || "", name: displayName }, displayName);
  const lat = rest?.gpsLat ?? rest?.lat ?? null;
  const lng = rest?.gpsLng ?? rest?.lng ?? null;
  const type = normalizeRestaurantType(rest?.type || rest?.customerType || rest?.category || rest?.kind || rest?.restaurantType || "");
  return {
    name: displayName,
    handle: handle || normalizeHandle(displayName),
    bio: rest?.bio || rest?.description || "",
    avatar: rest?.logoUrl || rest?.logo || "",
    location: rest?.city || "Prishtina",
    address: rest?.address || "",
    followers: rest?.followersCount ?? rest?.followers ?? 0,
    following: rest?.followingCount ?? rest?.following ?? 0,
    privateAccount: false,
    karma: "0",
    roles: normalizeRoleList(rest?.roles || "owner"),
    role: "business",
    isPremium: rest?.isPremium || false,
    restaurantId: rest?.id || rest?.restaurantId || "",
    phone: rest?.phone || "",
    instagram: rest?.instagram || rest?.insta || "",
    ...(type ? { type, customerType: type } : {}),
    lat: Number.isFinite(Number(lat)) ? Number(lat) : null,
    lng: Number.isFinite(Number(lng)) ? Number(lng) : null,
    gpsLat: Number.isFinite(Number(lat)) ? Number(lat) : null,
    gpsLng: Number.isFinite(Number(lng)) ? Number(lng) : null,
    posts: []
  };
}

function syncSelfAvatarCachesFromProfile(profile = state.userProfile) {
  const resolvedAvatar = getOptimizedImageUrl(profile?.avatar || "", "avatar");
  if (isPlaceholderUrl(resolvedAvatar)) return "";
  primeSelfAvatarCache(resolvedAvatar);
  return resolvedAvatar;
}

function commitLiveSelfProfile(normalized, { syncPrivate = true } = {}) {
  if (!normalized || typeof normalized !== "object") return;
  state.userProfile = normalized;
  if (state.user?.uid) state.userProfile.uid = state.user.uid;
  if (syncPrivate) syncPrivateSettingFromProfile(normalized.privateAccount);
  saveUserProfileToStorage();
  syncSelfAvatarCachesFromProfile(state.userProfile);
  if (lastRenderMode === "main") {
    updateShellDom();
    if (state.activeTab === "search" && refreshSearchView()) return;
    if (state.activeTab === "feed") {
      const updatedFeed = updateFeedDom();
      if (!updatedFeed) render();
      return;
    }
  }
  render();
}

function applyLiveUserProfileSnapshot(data = {}) {
  if (!state.user) return;
  const prevAvatar = state.userProfile?.avatar || "";
  const seed = {
    displayName: state.userProfile?.name || "",
    handle: state.userProfile?.handle || "",
    bio: state.userProfile?.bio || "",
    avatarUrl: state.userProfile?.avatar || "",
    city: state.userProfile?.location || "",
    address: state.userProfile?.address || "",
    followersCount: state.userProfile?.followers ?? 0,
    followingCount: state.userProfile?.following ?? 0,
    privateAccount: !!state.userProfile?.privateAccount,
    score: Number(state.userProfile?.karma || 0),
    roles: state.userProfile?.roles || [],
    role: state.userProfile?.role || "user",
    restaurantId: state.userProfile?.restaurantId || "",
    leadSettings: state.userProfile?.leadSettings || null,
    country: state.userProfile?.country || "",
    ceoParentUid: state.userProfile?.ceoParentUid || "",
    ceoParentName: state.userProfile?.ceoParentName || "",
    ceoRootUid: state.userProfile?.ceoRootUid || "",
    ceoRootName: state.userProfile?.ceoRootName || "",
    ceoPath: Array.isArray(state.userProfile?.ceoPath) ? state.userProfile.ceoPath.slice() : [],
    crmCounts: state.userProfile?.crmCounts || null,
    gpsLat: state.userProfile?.gpsLat ?? state.userProfile?.lat ?? null,
    gpsLng: state.userProfile?.gpsLng ?? state.userProfile?.lng ?? null,
    ...(data || {})
  };
  const normalized = normalizeProfile(seed, state.user);
  const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
  if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) normalized.avatar = prevAvatar;
  normalized.uid = state.user.uid;
  commitLiveSelfProfile(normalized);
}

function applyLiveBusinessProfileSnapshot(restData = {}, restaurantId = "") {
  if (!state.user) return;
  const safeRestaurantId = String(restaurantId || restData?.id || restData?.restaurantId || state.userProfile?.restaurantId || "").trim();
  if (!safeRestaurantId) return;
  const prevAvatar = state.userProfile?.avatar || "";
  const seed = {
    id: safeRestaurantId,
    restaurantId: safeRestaurantId,
    name: state.userProfile?.name || "",
    restaurantName: state.userProfile?.name || "",
    handle: state.userProfile?.handle || "",
    bio: state.userProfile?.bio || "",
    description: state.userProfile?.bio || "",
    logoUrl: state.userProfile?.avatar || "",
    city: state.userProfile?.location || "",
    address: state.userProfile?.address || "",
    followersCount: state.userProfile?.followers ?? 0,
    followingCount: state.userProfile?.following ?? 0,
    phone: state.userProfile?.phone || "",
    instagram: state.userProfile?.instagram || "",
    roles: state.userProfile?.roles || ["owner"],
    type: state.userProfile?.type || state.userProfile?.customerType || "",
    customerType: state.userProfile?.customerType || state.userProfile?.type || "",
    gpsLat: state.userProfile?.gpsLat ?? state.userProfile?.lat ?? null,
    gpsLng: state.userProfile?.gpsLng ?? state.userProfile?.lng ?? null,
    ...(restData || {}),
    id: safeRestaurantId,
    restaurantId: safeRestaurantId
  };
  const normalized = normalizeBusinessProfile(seed, state.user);
  const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
  if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) normalized.avatar = prevAvatar;
  normalized.uid = state.user.uid;
  state.restaurants = mergeRestaurants(state.restaurants, [{ id: safeRestaurantId, ...seed }]);
  rebuildBusinessLocations();
  commitLiveSelfProfile(normalized, { syncPrivate: false });
}

function attachCurrentUserProfileListener() {
  const uid = String(state.user?.uid || "").trim();
  if (!uid) return;
  const restaurantId = String(state.userProfile?.restaurantId || "").trim();
  const useRestaurantDoc = !!(restaurantId && isLocalBusinessProfile(state.userProfile));
  const nextKey = useRestaurantDoc ? `restaurant:${restaurantId}` : `user:${uid}`;
  if (userDocUnsub && userDocLiveKey === nextKey) return;
  if (userDocUnsub) {
    userDocUnsub();
    userDocUnsub = null;
  }
  userDocLiveKey = nextKey;
  const ref = useRestaurantDoc ? doc(db, "restaurants", restaurantId) : doc(db, "users", uid);
  userDocUnsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data() || {};
    if (useRestaurantDoc) {
      applyLiveBusinessProfileSnapshot({ id: restaurantId, ...data }, restaurantId);
      return;
    }
    applyLiveUserProfileSnapshot(data);
  }, () => {});
}

async function syncCeoDirectoryProfilePatch(patch = {}) {
  const uid = String(state.user?.uid || "").trim();
  if (!uid || !isCeoUser()) return;
  const payload = {};
  const textFields = ["name", "displayName", "handle", "city", "locationLabel", "country", "firstName", "lastName", "ceoParentName", "ceoRootName"];
  textFields.forEach((key) => {
    if (!(key in patch)) return;
    const value = String(patch[key] || "").trim();
    if (!value) return;
    payload[key] = value;
  });
  ["lat", "lng", "gpsLat", "gpsLng"].forEach((key) => {
    if (!(key in patch)) return;
    const value = Number(patch[key]);
    if (!Number.isFinite(value)) return;
    payload[key] = value;
  });
  const avatarUrl = String(patch.avatarUrl || patch.avatar || "").trim();
  if (avatarUrl) {
    payload.avatarUrl = avatarUrl;
    payload.avatar = avatarUrl;
  }
  if (!Object.keys(payload).length) return;
  payload.updatedAt = serverTimestamp();
  try {
    await setDoc(doc(db, "superadmins", uid), payload, { merge: true });
  } catch {}
}

async function scanRestaurantsForMatch(matchFn, { max = 25 } = {}) {
  try {
    const snap = await getDocs(query(collection(db, "restaurants"), limit(max)));
    if (snap.empty) return null;
    const rows = snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }));
    if (rows.length) {
      state.restaurants = mergeRestaurants(state.restaurants, rows);
    }
    return rows.find((row) => !isRestaurantMarkedDeleted(row) && matchFn(row)) || null;
  } catch {}
  return null;
}

async function queryRestaurantByField(field, value) {
  const needle = String(value || "").trim();
  if (!needle) return null;
  try {
    const snap = await getDocs(query(collection(db, "restaurants"), where(field, "==", needle), limit(1)));
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const row = { id: docSnap.id, ...(docSnap.data() || {}) };
      if (isRestaurantMarkedDeleted(row)) return null;
      return row;
    }
  } catch {}
  return null;
}

async function findRestaurantByEmail(email) {
  const needle = String(email || "").trim();
  if (!needle) return null;
  const lower = needle.toLowerCase();
  const variants = lower && lower !== needle ? [needle, lower] : [needle];
  const fields = ["ownerEmail", "email", "contactEmail", "socialEmail", "loginEmail", "accountEmail"];
  for (const variant of variants) {
    for (const field of fields) {
      const rest = await queryRestaurantByField(field, variant);
      if (rest) return rest;
    }
  }
  const cached = (state.restaurants || []).find((rest) => matchesRestaurantIdentity(rest, { email: needle })) || null;
  if (cached && !isRestaurantMarkedDeleted(cached)) return cached;
  return scanRestaurantsForMatch((rest) => matchesRestaurantIdentity(rest, { email: needle }));
}

async function findRestaurantByUid(uid) {
  const needle = String(uid || "").trim();
  if (!needle) return null;
  const fields = ["ownerUid", "socialUid", "uid", "userUid", "accountUid"];
  for (const field of fields) {
    const rest = await queryRestaurantByField(field, needle);
    if (rest) return rest;
  }
  const cached = (state.restaurants || []).find((rest) => matchesRestaurantIdentity(rest, { uid: needle })) || null;
  if (cached && !isRestaurantMarkedDeleted(cached)) return cached;
  return scanRestaurantsForMatch((rest) => matchesRestaurantIdentity(rest, { uid: needle }));
}

async function queryLeadByField(field, value) {
  const needle = String(value || "").trim();
  if (!needle) return null;
  try {
    const snap = await getDocs(query(collection(db, "leads"), where(field, "==", needle), limit(1)));
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...(docSnap.data() || {}) };
    }
  } catch {}
  return null;
}

async function scanLeadsForMatch(matchFn, { max = 25 } = {}) {
  try {
    const snap = await getDocs(query(collection(db, "leads"), limit(max)));
    if (snap.empty) return null;
    const rows = snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }));
    return rows.find((row) => matchFn(row)) || null;
  } catch {}
  return null;
}

async function resolveLeadByEmail(email) {
  const needle = String(email || "").trim();
  if (!needle) return null;
  const lower = needle.toLowerCase();
  const variants = lower && lower !== needle ? [needle, lower] : [needle];
  for (const variant of variants) {
    const fields = ["email", "socialEmail", "ownerEmail", "loginEmail"];
    for (const field of fields) {
      const lead = await queryLeadByField(field, variant);
      if (lead) return lead;
    }
  }
  return scanLeadsForMatch((lead) => {
    const values = [lead.email, lead.socialEmail, lead.ownerEmail, lead.loginEmail];
    return values.some((item) => normalizeEmailValue(item) === normalizeEmailValue(needle));
  });
}

async function resolveLeadByUid(uid) {
  const needle = String(uid || "").trim();
  if (!needle) return null;
  const fields = ["socialUid", "ownerUid", "uid", "userUid"];
  for (const field of fields) {
    const lead = await queryLeadByField(field, needle);
    if (lead) return lead;
  }
  return scanLeadsForMatch((lead) => {
    const values = [lead.socialUid, lead.ownerUid, lead.uid, lead.userUid];
    return values.some((item) => String(item || "").trim() === needle);
  });
}

function findRestaurantByLeadId(leadId) {
  const key = String(leadId || "").trim();
  if (!key) return null;
  return (state.restaurants || []).find((rest) => String(rest?.leadId || "").trim() === key) || null;
}

async function ensureRestaurantForLead(lead, user) {
  if (!lead) return null;
  let restaurantId = lead.restaurantId || lead.restaurant || "";
  const email = lead.email || lead.socialEmail || user?.email || "";
  const ownerName = lead.contactName || lead.ownerName || lead.businessName || lead.name || "";
  if (restaurantId) {
    try {
      const restSnap = await getDoc(doc(db, "restaurants", restaurantId));
      if (restSnap.exists()) {
        const restData = restSnap.data() || {};
        const patch = {};
        if (user?.uid && !restData.ownerUid) patch.ownerUid = user.uid;
        if (email && !restData.ownerEmail) patch.ownerEmail = email;
        if (ownerName && !restData.ownerName) patch.ownerName = ownerName;
        if (Object.keys(patch).length) {
          patch.updatedAt = serverTimestamp();
          await setDoc(doc(db, "restaurants", restaurantId), patch, { merge: true });
        }
        return { id: restSnap.id, ...restData, ...patch };
      }
    } catch {}
  }

  const restRef = doc(collection(db, "restaurants"));
  restaurantId = restRef.id;
  const status = resolveRestaurantStatusFromLead(lead.status || "registered", "");
  const locations = normalizeLeadLocations(lead.locations || [], lead.address || "", {
    lat: lead.lat ?? null,
    lng: lead.lng ?? null
  });
  const primaryLocation = getPrimaryLeadLocation(locations);
  const locationPayload = locations
    .filter((item) => item.address || hasLeadLocationCoords(item))
    .map((item) => {
      const row = { address: item.address || "" };
      if (hasLeadLocationCoords(item)) {
        row.lat = Number(item.lat);
        row.lng = Number(item.lng);
      }
      return row;
    });
  const restPayload = {
    name: lead.businessName || lead.name || ownerName || "Business",
    restaurantName: lead.businessName || lead.name || ownerName || "Business",
    type: resolveCustomerType(lead.customerType || lead.type || "cafe"),
    city: lead.city || "",
    address: primaryLocation.address || lead.address || "",
    phone: lead.phone || "",
    instagram: lead.instagram || lead.insta || "",
    insta: lead.instagram || lead.insta || "",
    ownerEmail: email || "",
    ownerName: ownerName || "",
    ownerUid: user?.uid || "",
    logoUrl: lead.logoUrl || lead.logo || lead.imageUrl || "",
    logo: lead.logoUrl || lead.logo || lead.imageUrl || "",
    status,
    leadId: lead.id || "",
    locations: locationPayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdByRole: "migration"
  };
  if (hasLeadLocationCoords(primaryLocation)) {
    restPayload.lat = Number(primaryLocation.lat);
    restPayload.lng = Number(primaryLocation.lng);
  } else if (Number.isFinite(Number(lead.lat)) && Number.isFinite(Number(lead.lng))) {
    restPayload.lat = Number(lead.lat);
    restPayload.lng = Number(lead.lng);
  }
  await setDoc(restRef, restPayload, { merge: true });
  await ensureRestaurantPublicMeta(restaurantId, restPayload);
  if (lead.id) {
    await setDoc(doc(db, "leads", lead.id), {
      restaurantId,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
  return { id: restaurantId, ...restPayload };
}

function matchesRestaurantOwner(rest, user) {
  if (!rest || !user) return false;
  if (isRestaurantMarkedDeleted(rest)) return false;
  return matchesRestaurantIdentity(rest, {
    uid: String(user.uid || ""),
    email: String(user.email || "")
  });
}

async function resolveRestaurantForAuthUser(user, { preferCached = true } = {}) {
  if (!user) return null;
  const uid = String(user.uid || "");
  const email = String(user.email || "").toLowerCase();
  const hintId = String(state.userProfile?.restaurantId || "").trim();

  if (preferCached && hintId) {
    const hinted = state.restaurants.find((rest) => String(rest.id) === hintId) || null;
    if (hinted && matchesRestaurantOwner(hinted, user)) return hinted;
    try {
      const hintSnap = await getDoc(doc(db, "restaurants", hintId));
      if (hintSnap.exists()) {
        const hintedDoc = { id: hintSnap.id, ...(hintSnap.data() || {}) };
        state.restaurants = mergeRestaurants(state.restaurants, [hintedDoc]);
        if (matchesRestaurantOwner(hintedDoc, user)) return hintedDoc;
      }
    } catch {}
  }

  if (preferCached && Array.isArray(state.restaurants) && state.restaurants.length) {
    const cached = state.restaurants.find((rest) => matchesRestaurantOwner(rest, user));
    if (cached) return cached;
  }

  if (uid) {
    const byUid = await findRestaurantByUid(uid);
    if (byUid && !isRestaurantMarkedDeleted(byUid)) return byUid;
  }

  if (email) {
    const byEmail = await findRestaurantByEmail(email);
    if (byEmail && !isRestaurantMarkedDeleted(byEmail)) return byEmail;
  }

  return null;
}

function normalizeRoleList(value) {
  return normalizeRoleListCore(value);
}

function roleLabel(role) {
  return roleLabelCore(role, {
    labels: ROLE_SWITCH_LABELS
  });
}

function buildRoleSwitchUrl(role, profile, restaurantIdOverride = "") {
  return buildRoleSwitchUrlCore({
    role,
    profile,
    restaurantIdOverride,
    roleTabMap: {
      ceo: "leads",
      owner: "profile",
      staff: "staff"
    },
    buildUrlFn: buildUrl
  });
}

async function findOwnerRestaurantId(user) {
  if (!user) return "";
  const uid = user.uid || "";
  const email = user.email || "";
  if (uid) {
    try {
      const snap = await getDocs(query(collection(db, "restaurants"), where("ownerUid", "==", uid), limit(1)));
      if (!snap.empty) return snap.docs[0].id;
    } catch {}
  }
  if (email) {
    try {
      const snap = await getDocs(query(collection(db, "restaurants"), where("ownerEmail", "==", email), limit(1)));
      if (!snap.empty) return snap.docs[0].id;
    } catch {}
  }
  return "";
}

async function findOwnerRestaurantFromStaffIndex(user) {
  const uid = user?.uid || "";
  if (!uid) return "";
  try {
    const snap = await getDoc(doc(db, "staffIndex", uid));
    if (!snap.exists()) return "";
    const ids = snap.data()?.restaurantIds || [];
    for (const rid of ids.slice(0, 4)) {
      const staffSnap = await getDoc(doc(db, "restaurants", rid, "staff", uid));
      if (!staffSnap.exists()) continue;
      const row = staffSnap.data() || {};
      const roles = normalizeRoleList(row.roles || row.role || "");
      if (roles.includes("owner") || roles.includes("admin")) return rid;
    }
  } catch {}
  return "";
}

async function resolveRoleSwitchTargets(user) {
  if (!user) {
    state.roleSwitchRoles = [];
    state.roleSwitchRestaurantId = "";
    return;
  }

  const roles = new Set();
  const profile = state.userProfile || {};
  const profileRoles = normalizeRoleList(profile.roles || profile.role || "");
  let ownerRestaurantId = profile.restaurantId || "";

  if (profileRoles.includes("ceo")) roles.add("ceo");
  if (profileRoles.includes("staff")) roles.add("staff");
  if (profileRoles.includes("owner")) roles.add("owner");
  if (String(profile.role || "").toLowerCase() === "business") roles.add("owner");

  const needsRemoteRoleCheck = !profileRoles.length;
  if (needsRemoteRoleCheck) {
    const [ceoSnap, staffSnap] = await Promise.all([
      getDoc(doc(db, "superadmins", user.uid)).catch(() => null),
      getDoc(doc(db, "staffAdmins", user.uid)).catch(() => null)
    ]);

    if (ceoSnap?.exists?.()) roles.add("ceo");
    if (staffSnap?.exists?.()) roles.add("staff");
  }

  if (!roles.has("owner") && profile?.restaurantId) {
    try {
      const staffSnap = await getDoc(doc(db, "restaurants", profile.restaurantId, "staff", user.uid));
      if (staffSnap.exists()) {
        const staffRoles = normalizeRoleList(staffSnap.data()?.roles || staffSnap.data()?.role || "");
        if (staffRoles.includes("owner") || staffRoles.includes("admin")) roles.add("owner");
      }
    } catch {}
  }

  const shouldResolveOwnerRestaurant = !ownerRestaurantId && (
    roles.has("owner")
    || String(profile.role || "").toLowerCase() === "business"
    || !profileRoles.length
  );
  if (shouldResolveOwnerRestaurant && !ownerRestaurantId) {
    ownerRestaurantId = await findOwnerRestaurantId(user);
  }
  if (shouldResolveOwnerRestaurant && !ownerRestaurantId) {
    ownerRestaurantId = await findOwnerRestaurantFromStaffIndex(user);
  }
  if (ownerRestaurantId) roles.add("owner");

  state.roleSwitchRoles = ROLE_SWITCH_ORDER.filter((role) => roles.has(role));
  state.roleSwitchRestaurantId = ownerRestaurantId || profile.restaurantId || "";
  if (lastRenderMode === "main") {
    updateShellDom();
    if (state.activeTab === "search" && refreshSearchView()) return;
    if (state.activeTab === "feed") {
      const updatedFeed = updateFeedDom();
      if (!updatedFeed) render();
      return;
    }
  }
  render();
}

async function fetchUserDoc(uid) {
  if (!uid) return null;
  const ref = doc(db, "users", uid);
  let snap = null;
  if (typeof getDocFromServer === "function") {
    try {
      snap = await getDocFromServer(ref);
    } catch {
      // Fall through to cached getDoc
    }
  }
  try {
    snap = snap || await getDoc(ref);
  } catch {
    snap = null;
  }
  if (snap && typeof snap.exists === "function" && snap.exists()) return snap;
  try {
    const restSnap = await getDocs(query(collection(db, "restaurants"), where("ownerUid", "==", uid), limit(1)));
    if (!restSnap.empty) {
      const docSnap = restSnap.docs[0];
      const data = docSnap.data() || {};
      const payload = { ...data };
      if (!payload.avatarUrl && (payload.logoUrl || payload.logo)) {
        payload.avatarUrl = payload.logoUrl || payload.logo || "";
      }
      return {
        id: docSnap.id,
        exists: () => true,
        data: () => payload
      };
    }
  } catch {}
  return snap;
}

async function ensureSelfAvatarReady({ force = false } = {}) {
  if (!state.user?.uid) return "";
  const fallbackFromState = () => {
    const existing = getOptimizedImageUrl(state.userProfile.avatar || "", "avatar");
    if (!isPlaceholderUrl(existing)) return existing;
    if (userAvatarCache && !isPlaceholderUrl(userAvatarCache)) return userAvatarCache;
    return "";
  };

  if (!force) {
    const cached = fallbackFromState();
    if (cached) return cached;
  }

  try {
    if (isLocalBusinessProfile(state.userProfile) && state.userProfile.restaurantId) {
      const restSnap = await getDoc(doc(db, "restaurants", state.userProfile.restaurantId));
      if (restSnap.exists()) {
        const restData = restSnap.data() || {};
        const raw = restData.logoUrl || restData.logo || "";
        const resolved = getOptimizedImageUrl(raw, "avatar");
        if (!isPlaceholderUrl(resolved)) {
          state.userProfile.avatar = raw;
          userAvatarCache = resolved;
          scheduleAvatarCacheWrite(resolved);
          if (state.user?.uid) {
            commentAvatarCache.set(state.user.uid, resolved);
            updateCommentAvatarNodesByUid(state.user.uid, resolved);
          }
          const handleKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
          if (handleKey) {
            commentAvatarCache.set(handleKey, resolved);
            updateCommentAvatarNodes(handleKey, resolved);
          }
          return resolved;
        }
      }
      return fallbackFromState();
    }
    const snap = await fetchUserDoc(state.user.uid);
    if (!snap) return fallbackFromState();
    const data = snap.exists() ? snap.data() : {};
    const raw = data.avatarUrl || data.avatar || data.avatarURL || data.photoURL || state.user?.photoURL || "";
    const resolved = getOptimizedImageUrl(raw, "avatar");
    if (!isPlaceholderUrl(resolved)) {
      state.userProfile.avatar = raw;
      userAvatarCache = resolved;
      scheduleAvatarCacheWrite(resolved);
      if (state.user?.uid) {
        commentAvatarCache.set(state.user.uid, resolved);
        updateCommentAvatarNodesByUid(state.user.uid, resolved);
      }
      const handleKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
      if (handleKey) {
        commentAvatarCache.set(handleKey, resolved);
        updateCommentAvatarNodes(handleKey, resolved);
      }
      return resolved;
    }
    const authUrl = state.user?.photoURL || "";
    if (authUrl) {
      const authResolved = getOptimizedImageUrl(authUrl, "avatar");
      if (!isPlaceholderUrl(authResolved)) {
        try {
          await setDoc(doc(db, "users", state.user.uid), {
            avatarUrl: authUrl,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch {}
        state.userProfile.avatar = authUrl;
        userAvatarCache = authResolved;
        scheduleAvatarCacheWrite(authResolved);
        if (state.user?.uid) {
          commentAvatarCache.set(state.user.uid, authResolved);
          updateCommentAvatarNodesByUid(state.user.uid, authResolved);
        }
        const handleKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
        if (handleKey) {
          commentAvatarCache.set(handleKey, authResolved);
          updateCommentAvatarNodes(handleKey, authResolved);
        }
        return authResolved;
      }
    }
  } catch (err) {
    console.error("ensureSelfAvatarReady failed", err);
  }
  const authFallback = state.user?.photoURL ? getOptimizedImageUrl(state.user.photoURL, "avatar") : "";
  if (authFallback && !isPlaceholderUrl(authFallback)) return authFallback;
  return fallbackFromState();
}

function currentUserBadge() {
  const avatarRaw = state.userProfile.avatar || state.user?.photoURL || "";
  const resolvedAvatar = resolveUserAvatarInstant(avatarRaw);
  const finalAvatar = isPlaceholderUrl(resolvedAvatar) ? "" : resolvedAvatar;
  if (finalAvatar) primeSelfAvatarCache(finalAvatar);
  return {
    uid: state.user?.uid || "",
    name: state.userProfile.name || "User",
    handle: state.userProfile.handle || "user",
    avatar: finalAvatar
  };
}

function formatDateLabel(value) {
  const date = toDateSafe(value) || new Date();
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTimeLabel(value) {
  const date = toDateSafe(value) || new Date();
  return date.toLocaleString("de-DE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ensurePostMeta(postId) {
  if (!postId) return { likes: [], comments: [] };
  if (!state.postMeta[postId]) {
    state.postMeta[postId] = { likes: [], comments: [] };
  }
  return state.postMeta[postId];
}

function getMenuItemSocialId(item) {
  const raw = item?.id || item?.menuItemId || item?.menuId || "";
  const name = String(item?.name || "").trim();
  const category = String(item?.category || "").trim();
  const price = String(item?.price ?? "").trim();
  const base = raw || [name, category, price].filter(Boolean).join("|");
  if (!base) return "";
  return encodeURIComponent(String(base));
}

function menuItemMetaKey(restaurantId, itemId) {
  if (!restaurantId || !itemId) return "";
  return `${restaurantId}::${itemId}`;
}

function getMenuItemSocialDocRef(item, restaurantIdOverride = "") {
  const restaurantId = restaurantIdOverride
    || state.menu.restaurantId
    || state.profileView?.profile?.restaurantId
    || state.userProfile.restaurantId
    || "";
  const itemId = getMenuItemSocialId(item);
  if (!restaurantId || !itemId) return null;
  return doc(db, "restaurants", restaurantId, "menuSocial", itemId);
}

function favoriteMenuItemDocId(restaurantId, itemId) {
  const safeRestaurantId = encodeURIComponent(String(restaurantId || "").trim());
  const safeItemId = String(itemId || "").trim();
  if (!safeRestaurantId || !safeItemId) return "";
  return `${safeRestaurantId}__${safeItemId}`;
}

function buildFavoriteMenuItemPayload(item, restaurantId, { includeServerTimestamp = false } = {}) {
  const safeRestaurantId = String(restaurantId || "").trim();
  const itemId = getMenuItemSocialId(item);
  const profileMatch = state.profileView?.profile?.restaurantId === safeRestaurantId
    ? state.profileView.profile
    : (state.userProfile?.restaurantId === safeRestaurantId ? state.userProfile : null);
  const restaurantMeta = getRestaurantMetaById(safeRestaurantId) || {};
  const images = getMenuItemImages(item);
  const nowIso = new Date().toISOString();
  const catalogType = normalizeRestaurantType(
    profileMatch?.type
    || profileMatch?.customerType
    || profileMatch?.category
    || profileMatch?.kind
    || profileMatch?.restaurantType
    || restaurantMeta?.type
    || restaurantMeta?.customerType
    || restaurantMeta?.category
    || restaurantMeta?.kind
    || restaurantMeta?.restaurantType
    || item?.restaurantType
    || item?.customerType
    || "ecommerce"
  ) || "ecommerce";
  return {
    restaurantId: safeRestaurantId,
    itemId,
    restaurantName: String(
      profileMatch?.name
      || restaurantMeta?.name
      || restaurantMeta?.restaurantName
      || "Shop"
    ).trim() || "Shop",
    restaurantAvatar: String(
      profileMatch?.avatar
      || restaurantMeta?.logoUrl
      || restaurantMeta?.logo
      || ""
    ).trim(),
    type: item?.type || "food",
    category: String(item?.category || "").trim(),
    name: String(item?.name || "Produkt").trim() || "Produkt",
    description: String(item?.description || "").trim(),
    longDescription: String(item?.longDescription || "").trim(),
    allergens: String(item?.allergens || "").trim(),
    brand: String(item?.brand || "").trim(),
    sku: String(item?.sku || "").trim(),
    stock: Number.isFinite(Number(item?.stock)) ? Math.max(0, Number(item.stock)) : null,
    sizes: Array.isArray(item?.sizes) ? item.sizes : [],
    colors: Array.isArray(item?.colors) ? item.colors : [],
    cropX: clampCropPercent(item?.cropX ?? 50, 50),
    cropY: clampCropPercent(item?.cropY ?? 50, 50),
    price: item?.price ?? "",
    available: item?.available !== false,
    catalogMode: "shop",
    restaurantType: catalogType,
    customerType: catalogType,
    imageUrl: images[0] || resolveMenuItemHero(item) || "",
    imageUrls: images,
    savedAtClient: nowIso,
    ...(includeServerTimestamp ? { savedAt: serverTimestamp() } : {})
  };
}

function normalizeFavoriteMenuItemDoc(data, docId = "") {
  const payload = data || {};
  const itemId = String(payload?.itemId || "").trim();
  const item = normalizeMenuItemDoc(payload, itemId || docId || `favorite_${Date.now()}`);
  return {
    ...item,
    id: itemId || item.id,
    favoriteId: docId || favoriteMenuItemDocId(payload?.restaurantId, itemId),
    restaurantId: String(payload?.restaurantId || "").trim(),
    restaurantName: String(payload?.restaurantName || "").trim(),
    restaurantAvatar: String(payload?.restaurantAvatar || "").trim(),
    catalogMode: String(payload?.catalogMode || "").trim(),
    restaurantType: String(payload?.restaurantType || "").trim(),
    customerType: String(payload?.customerType || "").trim(),
    savedAtClient: String(payload?.savedAtClient || "").trim()
  };
}

function updateFavoriteMenuItemsLocal(item, restaurantId, { remove = false } = {}) {
  const safeRestaurantId = String(restaurantId || "").trim();
  const itemId = getMenuItemSocialId(item);
  const favoriteId = favoriteMenuItemDocId(safeRestaurantId, itemId);
  if (!favoriteId) return;
  const currentItems = Array.isArray(state.favoriteMenuItems?.items) ? state.favoriteMenuItems.items : [];
  let nextItems = currentItems.slice();
  if (remove) {
    nextItems = nextItems.filter((entry) => String(entry.favoriteId || "") !== favoriteId);
  } else {
    const nextItem = normalizeFavoriteMenuItemDoc(buildFavoriteMenuItemPayload(item, safeRestaurantId), favoriteId);
    const existingIndex = nextItems.findIndex((entry) => String(entry.favoriteId || "") === favoriteId);
    if (existingIndex >= 0) nextItems[existingIndex] = nextItem;
    else nextItems.unshift(nextItem);
  }
  state.favoriteMenuItems = {
    ...state.favoriteMenuItems,
    items: nextItems
  };
  if (state.activeTab === "profile" && state.profileTopTab === "favorites" && lastRenderMode === "main") {
    render();
  }
}

async function loadFavoriteMenuItems({ force = false } = {}) {
  const uid = String(state.user?.uid || "").trim();
  if (!uid) {
    state.favoriteMenuItems = createEmptyFavoriteMenuItemsState();
    return;
  }
  if (state.favoriteMenuItems.loading) return;
  if (state.favoriteMenuItems.loaded && !force) return;
  state.favoriteMenuItems = {
    ...state.favoriteMenuItems,
    loading: true,
    error: ""
  };
  if (state.activeTab === "profile" && state.profileTopTab === "favorites" && lastRenderMode === "main") {
    render();
  }
  try {
    const ref = collection(db, "users", uid, "menuFavorites");
    let snap = null;
    try {
      snap = await getDocs(query(ref, orderBy("savedAtClient", "desc"), limit(120)));
    } catch (err) {
      snap = await getDocs(ref);
    }
    const items = snap.docs
      .map((docSnap) => normalizeFavoriteMenuItemDoc(docSnap.data() || {}, docSnap.id))
      .filter((item) => item.id && item.restaurantId)
      .sort((a, b) => String(b.savedAtClient || "").localeCompare(String(a.savedAtClient || "")));
    state.favoriteMenuItems = {
      items,
      loading: false,
      error: "",
      loaded: true
    };
  } catch (err) {
    console.error(err);
    state.favoriteMenuItems = {
      ...state.favoriteMenuItems,
      loading: false,
      error: "Favoriten konnten nicht geladen werden.",
      loaded: true
    };
  }
  if (state.activeTab === "profile" && state.profileTopTab === "favorites" && lastRenderMode === "main") {
    render();
  }
}

function ensureMenuItemMeta(key) {
  if (!key) return { likes: [], comments: [], counts: { likes: 0, comments: 0 } };
  if (!state.menuItemMeta[key]) {
    state.menuItemMeta[key] = { likes: [], comments: [], counts: { likes: 0, comments: 0 } };
  } else if (!state.menuItemMeta[key].counts) {
    state.menuItemMeta[key].counts = { likes: 0, comments: 0 };
  }
  return state.menuItemMeta[key];
}

function resolveMenuItemCounts(meta) {
  const rawLikes = Number.isFinite(Number(meta?.counts?.likes)) ? Number(meta.counts.likes) : null;
  const rawComments = Number.isFinite(Number(meta?.counts?.comments)) ? Number(meta.counts.comments) : null;
  const likeFromList = meta?.likes?.length ?? 0;
  const commentFromList = meta?.comments?.length ?? 0;
  const likes = Math.max(rawLikes ?? 0, likeFromList);
  const comments = Math.max(rawComments ?? 0, commentFromList);
  return { likes, comments };
}

function primeMenuItemCounts(items, restaurantId) {
  if (!restaurantId) return;
  const list = Array.isArray(items) ? items : [];
  list.forEach((item) => {
    const itemId = getMenuItemSocialId(item);
    if (!itemId) return;
    const key = menuItemMetaKey(restaurantId, itemId);
    if (!key) return;
    const meta = ensureMenuItemMeta(key);
    meta.counts = {
      likes: Number(item?.likesCount ?? item?.likes ?? meta.counts?.likes ?? 0) || 0,
      comments: Number(item?.commentsCount ?? item?.comments ?? meta.counts?.comments ?? 0) || 0
    };
    state.menuItemMeta[key] = meta;
    updateMenuCardCountNodes(itemId, resolveMenuItemCounts(meta));
  });
}

function getMenuDetailContext() {
  if (!state.menuDetail?.open || !state.menuDetail?.item) return null;
  const item = state.menuDetail.item;
  const restaurantId = getMenuDetailRestaurantId(item);
  const itemId = getMenuItemSocialId(item);
  if (!restaurantId || !itemId) return null;
  const key = menuItemMetaKey(restaurantId, itemId);
  const ref = doc(db, "restaurants", restaurantId, "menuSocial", itemId);
  return { item, restaurantId, itemId, key, ref };
}

function getMenuDetailRestaurantId(item = state.menuDetail?.item) {
  return String(
    state.menuDetail?.restaurantId
    || item?.restaurantId
    || state.menu.restaurantId
    || state.profileView?.profile?.restaurantId
    || state.userProfile.restaurantId
    || ""
  ).trim();
}

function buildCatalogProfileForRestaurant(restaurantId = "", fallback = {}) {
  const safeRestaurantId = String(restaurantId || fallback?.restaurantId || "").trim();
  if (!safeRestaurantId) return fallback || {};
  if (String(state.profileView?.profile?.restaurantId || "").trim() === safeRestaurantId) {
    return state.profileView.profile;
  }
  if (String(state.userProfile?.restaurantId || "").trim() === safeRestaurantId) {
    return state.userProfile;
  }
  const restaurant = getRestaurantMetaById(safeRestaurantId) || {};
  const displayName = String(
    restaurant?.name
    || restaurant?.restaurantName
    || fallback?.restaurantName
    || fallback?.name
    || "Shop"
  ).trim() || "Shop";
  const explicitCatalogMode = String(
    fallback?.catalogMode
    || restaurant?.catalogMode
    || restaurant?.catalog
    || ""
  ).trim().toLowerCase();
  const fallbackCatalogMode = String(fallback?.catalogMode || "").trim().toLowerCase();
  const type = explicitCatalogMode === "shop"
    ? "ecommerce"
    : normalizeRestaurantType(
      restaurant?.type
      || restaurant?.customerType
      || restaurant?.category
      || restaurant?.kind
      || restaurant?.restaurantType
      || fallback?.type
      || fallback?.customerType
      || fallback?.restaurantType
      || (fallbackCatalogMode === "shop" ? "ecommerce" : "")
    );
  return {
    name: displayName,
    handle: resolvePreferredHandle({
      handle: restaurant?.handle || fallback?.handle || "",
      name: displayName
    }, displayName),
    uid: String(restaurant?.ownerUid || restaurant?.ownerId || fallback?.uid || "").trim(),
    bio: String(restaurant?.description || restaurant?.bio || fallback?.description || "").trim(),
    avatar: String(
      restaurant?.logoUrl
      || restaurant?.logo
      || fallback?.restaurantAvatar
      || fallback?.avatar
      || ""
    ).trim(),
    location: String(restaurant?.city || restaurant?.location || fallback?.location || "").trim(),
    followers: Number(restaurant?.followersCount ?? restaurant?.followers ?? fallback?.followers ?? 0) || 0,
    following: Number(restaurant?.followingCount ?? restaurant?.following ?? fallback?.following ?? 0) || 0,
    privateAccount: false,
    role: "business",
    catalogMode: explicitCatalogMode || (type === "ecommerce" ? "shop" : "menu"),
    restaurantId: safeRestaurantId,
    ...(type ? { type, customerType: type } : {})
  };
}

function getMenuDetailCatalogProfile(item = state.menuDetail?.item) {
  const restaurantId = getMenuDetailRestaurantId(item);
  if (!restaurantId) return state.profileView?.profile || state.userProfile;
  return buildCatalogProfileForRestaurant(restaurantId, item || {});
}

function resolvePostCounts(post) {
  const likeCount = typeof post.likes === "number" ? post.likes : Number(post.likes) || 0;
  const commentCount = typeof post.comments === "number" ? post.comments : Number(post.comments) || 0;
  return { likeLabel: String(likeCount), commentLabel: String(commentCount) };
}

function escapeSelector(value) {
  const str = String(value);
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(str);
  }
  return str.replace(/["\\]/g, "\\$&");
}

function updatePostCountNodes(post) {
  if (!post || !post.id) return;
  const postId = escapeSelector(post.id);
  const likeLabel = formatCount(post.likes);
  const commentLabel = formatCount(post.comments);
  document.querySelectorAll(`[data-post-like-count="${postId}"]`).forEach((el) => {
    el.textContent = likeLabel;
  });
  document.querySelectorAll(`[data-post-comment-count="${postId}"]`).forEach((el) => {
    el.textContent = commentLabel;
  });
}

function updateFeedLogoNodes(post) {
  if (!post || !post.id) return;
  const postId = escapeSelector(post.id);
  const restaurant = state.restaurants.find((r) => r.id === (post.restaurantId || post.ownerId)) || {};
  const logoSource = restaurant.logoUrl || restaurant.logo || restaurant.logoURL || post.logo || "";
  const logoUrl = resolveRestaurantLogo(post.restaurantId || post.ownerId, logoSource, "avatar");
  document.querySelectorAll(`[data-feed-logo="${postId}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== logoUrl) img.setAttribute("src", logoUrl);
  });
}

function updateStoryLogoNodes(story) {
  const renderIdentity = resolveStoryRenderIdentity(story);
  if (!renderIdentity.storyRestaurantId) return;
  const storyId = escapeSelector(renderIdentity.storyRestaurantId);
  const allowCacheFallback = !renderIdentity.hasCanonicalRestaurant;
  const logoUrl = resolveRestaurantLogo(
    renderIdentity.storyRestaurantId,
    renderIdentity.logoSource || "",
    "thumb",
    allowCacheFallback
  );
  document.querySelectorAll(`[data-story-logo="${storyId}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== logoUrl) img.setAttribute("src", logoUrl);
  });
}

function updateStoryMetaNodes(story) {
  const renderIdentity = resolveStoryRenderIdentity(story);
  if (!renderIdentity.storyRestaurantId) return;
  const storyId = escapeSelector(renderIdentity.storyRestaurantId);
  const label = sanitizeStoryBusinessName(renderIdentity.storyLabel || "");
  const live = !!story.isLive;
  document.querySelectorAll(`[data-story-border="${storyId}"]`).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.classList.toggle("border-red-500", live);
    el.classList.toggle("animate-pulse", live);
    el.classList.toggle("border-slate-200", !live);
  });
  document.querySelectorAll(`[data-story-name="${storyId}"]`).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.textContent !== label) el.textContent = label;
  });
}

function updatePostCaches(post) {
  if (!post?.id) return;
  const postId = String(post.id);
  const inUser = state.userPosts.some((item) => String(item.id) === postId);
  const inBusiness = state.businessPosts.some((item) => String(item.id) === postId);
  const inFeed = state.feedPosts.some((item) => String(item.id) === postId);
  if (inUser && state.user?.uid) writeCache(userPostsKey(state.user.uid), state.userPosts);
  if (inBusiness && state.userProfile.restaurantId) writeCache(businessPostsKey(state.userProfile.restaurantId), state.businessPosts);
  if (inFeed) {
    const cached = readCache(CACHE_KEYS.feed);
    saveFeedPosts(state.feedPosts, { lastDeltaCheck: cached?.meta?.lastDeltaCheck || 0 });
  }
}

function scheduleIdle(fn) {
  scheduleIdleCore({
    fn,
    windowObj: typeof window === "undefined" ? null : window,
    timeout: 800,
    fallbackDelayMs: 0
  });
}

async function ensureTabData(tab) {
  return ensureTabDataCore({
    tab,
    state,
    dataLoaded,
    FAST_MODE,
    sanitizeTabForSession,
    render,
    stopRestaurantsListener,
    startChatThreadsListener,
    stopChatThreadsListener,
    startOrdersListener,
    stopOrdersListener,
    stopRestaurantMetaListeners,
    getFeedUnsubFn: () => feedUnsub,
    setFeedUnsubFn: (next) => {
      feedUnsub = next;
    },
    getStoriesUnsubFn: () => storiesUnsub,
    setStoriesUnsubFn: (next) => {
      storiesUnsub = next;
    },
    getFeedDeltaTimerFn: () => feedDeltaTimer,
    setFeedDeltaTimerFn: (next) => {
      feedDeltaTimer = next;
    },
    clearIntervalFn: (id) => clearInterval(id),
    isCeoUser,
    queueCrmLazyRenderersPrefetch,
    loadFeedPosts,
    scheduleIdle,
    loadRestaurants,
    isLocalBusinessProfile,
    loadUserPosts,
    loadBusinessPosts,
    loadAuthProfile,
    loadMenuForRestaurant,
    loadFocusForRestaurant,
    notificationsUnsub,
    updateNotificationsDom,
    loadNotificationsFromFirebase,
    normalizeLeadScopeKey,
    loadLeads,
    normalizeCustomerScopeKey,
    loadCustomers,
    loadCeoStaff
  });
}

function findPostById(postId) {
  const modalPost = state.postModal?.post;
  if (modalPost && String(modalPost.id) === String(postId)) return modalPost;
  const all = [...state.userPosts, ...state.businessPosts, ...state.feedPosts];
  const found = all.find((item) => String(item.id) === String(postId));
  if (found) return found;
  const viewPosts = state.profileView?.posts || [];
  const viewFound = viewPosts.find((item) => String(item.id) === String(postId));
  if (viewFound) return viewFound;
  const modalPosts = state.profileModal.profile?.posts || [];
  return modalPosts.find((item) => String(item.id) === String(postId)) || null;
}

function ensureCommentShape(comment) {
  const rawLikes = Array.isArray(comment.likes) ? comment.likes : [];
  const likesCount = Number.isFinite(Number(comment.likesCount)) ? Number(comment.likesCount) : rawLikes.length;
  const avatar = comment.avatar || comment.avatarUrl || comment.avatarURL || comment.photoURL || "";
  const avatarUrl = comment.avatarUrl || comment.avatarURL || "";
  return {
    id: comment.id,
    uid: comment.uid || "",
    author: comment.author || "User",
    handle: comment.handle || "user",
    avatar,
    avatarUrl,
    text: comment.text || "",
    createdAt: comment.createdAt || new Date().toISOString(),
    likesCount,
    replies: (comment.replies || []).map((reply) => ({
      id: reply.id,
      uid: reply.uid || "",
      author: reply.author || "User",
      handle: reply.handle || "user",
      avatar: reply.avatar || reply.avatarUrl || reply.avatarURL || reply.photoURL || "",
      avatarUrl: reply.avatarUrl || reply.avatarURL || "",
      text: reply.text || "",
      createdAt: reply.createdAt || new Date().toISOString(),
      likesCount: Number.isFinite(Number(reply.likesCount)) ? Number(reply.likesCount) : (Array.isArray(reply.likes) ? reply.likes.length : 0)
    }))
  };
}

async function updatePostCounts(post, { likesDelta = 0, commentsDelta = 0, skipRemote = false } = {}) {
  return socialEngagementRuntimeController.updatePostCounts(...arguments);
}
async function addComment(postId, text, replyTo) {
  return socialEngagementRuntimeController.addComment(...arguments);
}
async function togglePostLike(postId) {
  return socialEngagementRuntimeController.togglePostLike(...arguments);
}
async function toggleMenuItemLike() {
  return socialEngagementRuntimeController.toggleMenuItemLike(...arguments);
}
async function addMenuItemComment(text) {
  return socialEngagementRuntimeController.addMenuItemComment(...arguments);
}
async function toggleCommentLike(postId, commentId, replyId) {
  return socialEngagementRuntimeController.toggleCommentLike(...arguments);
}
function renderAuthScreen() {
  const isRegister = state.auth.mode === "register";
  const canClose = !state.user;
  return `
    <div class="h-full min-h-full overflow-y-auto bg-slate-50 flex flex-col p-8 font-sans animate-in" style="padding-top:calc(var(--safe-area-top) + 2rem); padding-bottom:calc(var(--safe-area-bottom) + 2rem);">
      ${canClose ? `
        <div class="max-w-sm mx-auto w-full mb-4">
          <button id="authCloseBtn" class="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-600 flex items-center justify-center">
            ${icon("arrow-left", "w-4 h-4")}
          </button>
        </div>
      ` : ""}
      <div class="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div class="mb-10 text-center">
          <div class="w-16 h-16 bg-slate-900 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-2xl">
            ${icon("zap", "w-8 h-8")}
          </div>
          <h1 class="text-4xl font-black italic tracking-tighter text-slate-900">${BRAND_UI.upper}</h1>
          <p class="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Social Login</p>
        </div>

        <form id="authForm" class="space-y-4">
          ${isRegister ? `
            <div class="bg-white p-4 rounded-3xl flex items-center gap-3 border border-slate-100 shadow-sm">
              ${icon("user", "w-5 h-5 text-slate-400 ml-2")}
              <input id="authName" type="text" placeholder="Dein Name" class="bg-transparent w-full text-sm font-bold outline-none" />
            </div>
          ` : ""}
          <div class="bg-white p-4 rounded-3xl flex items-center gap-3 border border-slate-100 shadow-sm">
            ${icon("mail", "w-5 h-5 text-slate-400 ml-2")}
            <input id="authEmail" type="text" placeholder="Email / User" class="bg-transparent w-full text-sm font-bold outline-none" />
          </div>
          <div class="bg-white p-4 rounded-3xl flex items-center gap-3 border border-slate-100 shadow-sm">
            ${icon("lock", "w-5 h-5 text-slate-400 ml-2")}
            <input id="authPassword" type="password" placeholder="Passwort" class="bg-transparent w-full text-sm font-bold outline-none" />
          </div>

          ${isRegister ? `
            <div class="pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Registrierung nur fuer User
            </div>
          ` : ""}

          ${state.auth.error ? `<div class="mt-4 text-center text-rose-500 text-xs font-black bg-rose-50 p-3 rounded-xl">${escapeHtml(state.auth.error)}</div>` : ""}

          <button type="submit" class="w-full mt-8 bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-300 active:scale-95 transition-all flex items-center justify-center gap-2" ${state.auth.loading ? "disabled" : ""}>
            ${state.auth.loading ? `${icon("loader-2", "w-4 h-4 animate-spin")}` : (isRegister ? "Konto erstellen" : "Weiter")}
          </button>
        </form>

        <div class="mt-8 text-center">
          <button id="authToggle" class="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">
            ${isRegister ? "Bereits registriert? Login" : "Noch kein Account? Erstellen"}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderDrawer() {
  const isGuest = isGuestSession();
  const unread = isGuest ? 0 : state.notifications.filter((n) => !n.read).length;
  const chatUnread = isGuest ? 0 : getChatUnreadCount();
  const switchLinks = isGuest ? "" : renderRoleSwitchLinks();
  const isCeo = isCeoUser();
  const catalogLabel = getBusinessCatalogLabel(state.userProfile);
  const catalogIcon = catalogLabel === "Shop" ? "shopping-bag" : "utensils";
  const showMenuTab = isLocalBusinessProfile(state.userProfile)
    || !!state.userProfile.restaurantId
    || !!state.roleSwitchRestaurantId
    || isRestaurantCafeProfile(state.userProfile);
  const isRegisteredUser = !!String(state.user?.uid || "").trim();
  const avatarUrl = resolveUserAvatar(state.userProfile.avatar);
  const avatarFit = logoFitClass(isLocalBusinessProfile(state.userProfile));
  const navItems = isGuest
    ? [
      { id: "feed", label: "Feed", icon: "home" },
      { id: "search", label: "Suche", icon: "search" },
      { id: "map", label: "Karte", icon: "map" },
      { id: "orders", label: "Bestellungen", icon: "shopping-cart" }
    ]
    : [
      { id: "feed", label: "Feed", icon: "home" },
      { id: "chat", label: "Chats", icon: "messages-square", badge: chatUnread, badgeType: "chat" },
      { id: "search", label: "Suche", icon: "search" },
      { id: "map", label: "Karte", icon: "map" },
      { id: "profile", label: "Profil", icon: "user" },
      { id: "menu", label: catalogLabel, icon: catalogIcon, hidden: !showMenuTab },
      { id: "favorites", label: "Favoriten", icon: "bookmark", hidden: !isRegisteredUser },
      { id: "orders", label: "Bestellungen", icon: "shopping-cart" },
      { id: "notifications", label: "Updates", icon: "bell", badge: unread, badgeType: "notifications" },
      { id: "leads", label: "Leads", icon: "clipboard-list", hidden: !isCeo },
      { id: "staff", label: "Staff", icon: "users-round", hidden: !isCeo },
      { id: "customers", label: "Kunden", icon: "users", hidden: !isCeo },
      { id: "settings", label: "Optionen", icon: "settings" }
    ];
  return `
    <div id="drawerRoot" class="fixed inset-0 z-[2000] overflow-hidden transition-all duration-500 ${state.drawerOpen ? "visible" : "invisible"}" style="overscroll-behavior:none;">
      <div id="drawerOverlay" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${state.drawerOpen ? "opacity-100" : "opacity-0"}" style="touch-action:none; overscroll-behavior:none;"></div>
      <div id="drawerPanel" class="absolute left-0 top-0 bottom-0 w-80 max-w-[86vw] bg-white shadow-2xl transition-transform duration-500 p-8 flex flex-col overflow-y-auto ${state.drawerOpen ? "translate-x-0" : "-translate-x-full"}" style="overscroll-behavior:contain; -webkit-overflow-scrolling:touch; padding-top:calc(var(--safe-area-top) + 2rem); padding-bottom:calc(var(--safe-area-bottom) + 2rem);">
        <div class="flex justify-between items-center mb-10">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${BRAND_UI.title}</span>
            <h3 class="text-2xl font-black italic">NAVIGATE</h3>
          </div>
          <button id="drawerClose" class="p-2.5 rounded-xl bg-slate-50">${icon("x", "w-4 h-4")}</button>
        </div>
        <div class="p-4 rounded-3xl mb-6 flex items-center gap-3 bg-slate-50">
          ${isGuest
            ? `<div class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center">${icon("user", "w-4 h-4")}</div>`
            : `<img id="drawerAvatar" data-img-key="avatar:drawer" src="${escapeHtml(avatarUrl)}" class="w-10 h-10 rounded-xl ${avatarFit}" />`
          }
          <div>
            <p id="drawerName" class="text-xs font-black">${escapeHtml(isGuest ? "Gast" : (state.userProfile.name || "User"))}</p>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">${isGuest ? "Gastmodus" : "Account"}</p>
          </div>
        </div>
        <nav class="space-y-2 flex-1">
          ${navItems.map((item) => {
            const isFavoritesView = state.activeTab === "profile" && state.profileTopTab === "favorites";
            const isActive = item.id === "favorites"
              ? isFavoritesView
              : (item.id === "profile"
                ? (state.activeTab === "profile" && !isFavoritesView)
                : state.activeTab === item.id);
            return `
            <button data-nav="${item.id}" class="w-full flex items-center justify-between p-4 rounded-2xl font-black text-xs transition-all ${item.hidden ? "hidden" : ""} ${isActive ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20" : "text-slate-400 hover:bg-slate-50"}">
              <div class="flex items-center gap-4">
                ${item.id === "menu"
                  ? `<i data-menu-nav-icon data-lucide="${item.icon}" class="w-4 h-4"></i><span data-menu-nav-label>${item.label}</span>`
                  : `${icon(item.icon, "w-4 h-4")} ${item.label}`
                }
              </div>
              ${item.badge ? `<span ${item.badgeType === "chat" ? 'data-chat-badge="drawer"' : 'data-unread-badge="drawer"'} class="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">${item.badge > 9 ? "9+" : item.badge}</span>` : ""}
            </button>
          `;
          }).join("")}
        </nav>
        <div id="drawerSwitchLinks">${switchLinks}</div>
        ${isGuest
          ? `<button data-auth-open="true" class="mt-auto flex items-center justify-center gap-3 p-4 text-indigo-600 font-black uppercase text-[10px] tracking-widest bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-colors">${icon("log-in", "w-4 h-4")} Login / Registrieren</button>`
          : `<button id="logoutBtn" class="mt-auto flex items-center gap-3 p-4 text-rose-500 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500/10 rounded-2xl transition-colors">${icon("log-out", "w-4 h-4")} Abmelden</button>`
        }
      </div>
    </div>
  `;
}

function renderRoleSwitchLinks() {
  if (!(state.user && state.roleSwitchRoles.length)) return "";
  return `
    <div class="mt-6 space-y-2">
      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Switch</p>
      ${state.roleSwitchRoles.map((role) => {
        const label = roleLabel(role);
        const url = buildRoleSwitchUrl(role, state.userProfile, state.roleSwitchRestaurantId);
        return `
        <a href="${escapeHtml(url)}" class="w-full flex items-center justify-between p-4 rounded-2xl font-black text-xs transition-all bg-slate-900 text-white hover:bg-slate-800">
          <div class="flex items-center gap-4">${icon("arrow-right-left", "w-4 h-4")} Switch to ${escapeHtml(label)}</div>
        </a>
      `;
      }).join("")}
    </div>
  `;
}

function updateShellDom() {
  const avatarUrl = resolveShellAvatarUrl();
  const isBusiness = isLocalBusinessProfile(state.userProfile);
  const branding = resolveHeaderBranding();
  const catalogLabel = getBusinessCatalogLabel(state.userProfile);
  const catalogIcon = catalogLabel === "Shop" ? "shopping-bag" : "utensils";
  const showMenuTab = isLocalBusinessProfile(state.userProfile)
    || !!state.userProfile.restaurantId
    || !!state.roleSwitchRestaurantId
    || isRestaurantCafeProfile(state.userProfile);
  const isRegisteredUser = !!String(state.user?.uid || "").trim();
  const showCeoTabs = isCeoUser();
  const headerAvatar = document.getElementById("headerAvatar");
  if (headerAvatar) {
    const current = headerAvatar.getAttribute("src") || "";
    if (!isPlaceholderUrl(branding.logoUrl) || !current || isPlaceholderUrl(current)) {
      if (current !== branding.logoUrl) headerAvatar.setAttribute("src", branding.logoUrl);
    }
  }
  if (headerAvatar) {
    headerAvatar.classList.toggle("object-contain", branding.isBusinessLogo);
    headerAvatar.classList.toggle("bg-white", branding.isBusinessLogo);
    headerAvatar.classList.toggle("object-cover", !branding.isBusinessLogo);
  }
  const headerTitle = document.getElementById("headerTitle");
  if (headerTitle && headerTitle.textContent !== branding.title) {
    headerTitle.textContent = branding.title;
  }
  if (headerTitle) {
    headerTitle.classList.remove("font-elegant", "font-semibold", "tracking-wide");
    headerTitle.classList.add("font-black", "italic", "tracking-tighter");
  }
  const headerSubtitle = document.getElementById("headerSubtitle");
  if (headerSubtitle) {
    if (headerSubtitle.textContent !== branding.subtitle) {
      headerSubtitle.textContent = branding.subtitle;
    }
    headerSubtitle.classList.toggle("hidden", !branding.subtitle);
  }
  const drawerAvatar = document.getElementById("drawerAvatar");
  if (drawerAvatar) {
    const current = drawerAvatar.getAttribute("src") || "";
    if (!isPlaceholderUrl(avatarUrl) || !current || isPlaceholderUrl(current)) {
      if (current !== avatarUrl) drawerAvatar.setAttribute("src", avatarUrl);
    }
  }
  if (drawerAvatar) {
    drawerAvatar.classList.toggle("object-contain", isBusiness);
    drawerAvatar.classList.toggle("bg-white", isBusiness);
    drawerAvatar.classList.toggle("object-cover", !isBusiness);
  }
  const drawerName = document.getElementById("drawerName");
  if (drawerName) drawerName.textContent = state.userProfile.name || "User";
  const switchLinks = document.getElementById("drawerSwitchLinks");
  if (switchLinks) switchLinks.innerHTML = renderRoleSwitchLinks();
  const menuNavBtn = document.querySelector('[data-nav="menu"]');
  if (menuNavBtn) {
    menuNavBtn.classList.toggle("hidden", !showMenuTab);
    const menuLabel = menuNavBtn.querySelector("[data-menu-nav-label]");
    if (menuLabel && menuLabel.textContent !== catalogLabel) {
      menuLabel.textContent = catalogLabel;
    }
    const menuIcon = menuNavBtn.querySelector("[data-menu-nav-icon]");
    if (menuIcon) {
      const currentIcon = menuIcon.getAttribute("data-lucide") || "";
      if (currentIcon !== catalogIcon) {
        menuIcon.setAttribute("data-lucide", catalogIcon);
      }
    }
  }
  const favoritesNavBtn = document.querySelector('[data-nav="favorites"]');
  if (favoritesNavBtn) {
    favoritesNavBtn.classList.toggle("hidden", !isRegisteredUser);
  }
  document.querySelectorAll('[data-nav="leads"], [data-nav="customers"]').forEach((btn) => {
    btn.classList.toggle("hidden", !showCeoTabs);
  });
  refreshSelfCommentAvatars({ attempt: 0, maxAttempts: 2 });
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function updateDrawerDom() {
  const root = document.getElementById("drawerRoot");
  const overlay = document.getElementById("drawerOverlay");
  const panel = document.getElementById("drawerPanel");
  if (!root || !overlay || !panel) return;
  root.classList.toggle("visible", state.drawerOpen);
  root.classList.toggle("invisible", !state.drawerOpen);
  overlay.classList.toggle("opacity-100", state.drawerOpen);
  overlay.classList.toggle("opacity-0", !state.drawerOpen);
  panel.classList.toggle("translate-x-0", state.drawerOpen);
  panel.classList.toggle("-translate-x-full", !state.drawerOpen);
}

function stopLiveListeners() {
  stopChatThreadsListener();
  stopActiveChatMessagesListener();
  stopOrdersListener();
  if (feedDeltaTimer) {
    clearInterval(feedDeltaTimer);
    feedDeltaTimer = null;
  }
  if (notificationsUnsub) {
    notificationsUnsub();
    notificationsUnsub = null;
  }
  if (followingUnsub) {
    followingUnsub();
    followingUnsub = null;
  }
  if (userDocUnsub) {
    userDocUnsub();
    userDocUnsub = null;
  }
  userDocLiveKey = "";
  if (profileViewUnsub) {
    profileViewUnsub();
    profileViewUnsub = null;
  }
  if (feedUnsub) {
    feedUnsub();
    feedUnsub = null;
  }
  if (storiesUnsub) {
    storiesUnsub();
    storiesUnsub = null;
  }
  stopRestaurantsListener();
  if (userPostsUnsub) {
    userPostsUnsub();
    userPostsUnsub = null;
  }
  if (businessPostsUnsub) {
    businessPostsUnsub();
    businessPostsUnsub = null;
  }
  if (modalPostDocUnsub) {
    modalPostDocUnsub();
    modalPostDocUnsub = null;
  }
  if (modalLikesUnsub) {
    modalLikesUnsub();
    modalLikesUnsub = null;
  }
  if (modalCommentsUnsub) {
    modalCommentsUnsub();
    modalCommentsUnsub = null;
  }
  if (storyRefreshTimer) {
    clearInterval(storyRefreshTimer);
    storyRefreshTimer = null;
  }
}

function updateNotificationBadges() {
  const unread = isGuestSession() ? 0 : state.notifications.filter((n) => !n.read).length;
  const chatUnread = isGuestSession() ? 0 : getChatUnreadCount();
  const headerUnread = unread + chatUnread;
  const headerBadgeText = headerUnread > 9 ? "9+" : String(headerUnread);
  const notifBadgeText = unread > 9 ? "9+" : String(unread);
  const chatBadgeText = chatUnread > 9 ? "9+" : String(chatUnread);
  const drawerToggle = document.getElementById("drawerToggle");
  if (drawerToggle) {
    let badge = drawerToggle.querySelector("[data-unread-badge=\"header\"]");
    if (headerUnread > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.dataset.unreadBadge = "header";
        badge.className = "absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg";
        drawerToggle.appendChild(badge);
      }
      if (badge.textContent !== headerBadgeText) badge.textContent = headerBadgeText;
    } else if (badge) {
      badge.remove();
    }
  }

  const drawerNotifBtn = document.querySelector("[data-nav=\"notifications\"]");
  if (drawerNotifBtn) {
    let badge = drawerNotifBtn.querySelector("[data-unread-badge=\"drawer\"]");
    if (unread > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.dataset.unreadBadge = "drawer";
        badge.className = "bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md";
        drawerNotifBtn.appendChild(badge);
      }
      if (badge.textContent !== notifBadgeText) badge.textContent = notifBadgeText;
    } else if (badge) {
      badge.remove();
    }
  }

  const drawerChatBtn = document.querySelector("[data-nav=\"chat\"]");
  if (drawerChatBtn) {
    let badge = drawerChatBtn.querySelector("[data-chat-badge=\"drawer\"]");
    if (chatUnread > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.dataset.chatBadge = "drawer";
        badge.className = "bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md";
        drawerChatBtn.appendChild(badge);
      }
      if (badge.textContent !== chatBadgeText) badge.textContent = chatBadgeText;
    } else if (badge) {
      badge.remove();
    }
  }
}

function updateNotificationsDom() {
  updateNotificationBadges();
  if (state.activeTab !== "notifications" || lastRenderMode !== "main") return false;
  const list = document.getElementById("notificationsList");
  if (!list) return false;
  list.innerHTML = renderNotificationsList(state.notifications);
  if (window.lucide?.createIcons) window.lucide.createIcons();
  bindNotificationsDelegation();
  return true;
}

function bindNotificationsDelegation() {
  const view = document.getElementById("notificationsView");
  if (!view || view.dataset.bound === "true") return;
  view.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const markAll = target.closest("#markAllRead");
    if (markAll) {
      void markAllNotificationsRead();
      return;
    }
    const acceptBtn = target.closest("[data-follow-request-accept]");
    if (acceptBtn) {
      const id = acceptBtn.dataset.followRequestAccept;
      if (!id) return;
      void acceptFollowRequest(id);
      return;
    }
    const deleteBtn = target.closest("[data-notif-delete]");
    if (deleteBtn) {
      const id = deleteBtn.dataset.notifDelete;
      if (!id) return;
      const notif = state.notifications.find((n) => n.id === id) || null;
      state.notifications = state.notifications.filter((n) => n.id !== id);
      saveNotifications(state.notifications);
      updateNotificationsDom();
      if (state.user?.uid) {
        void deleteDoc(doc(db, "users", state.user.uid, "notifications", id));
        if (notif?.type === "follow_request" && notif.userUid) {
          void deleteDoc(doc(db, "users", state.user.uid, "followRequests", notif.userUid));
        }
      }
      return;
    }
    const openBtn = target.closest("[data-notif-open]");
    if (openBtn) {
      const id = openBtn.dataset.notifOpen;
      if (!id) return;
      void openNotificationTarget(id);
    }
  });
  view.dataset.bound = "true";
}

function handleNotificationsUpdate(items) {
  state.notifications = items;
  saveNotifications(items);
  const updated = updateNotificationsDom();
  if (!updated && state.activeTab === "notifications") {
    render();
  }
}

function startLiveListeners(user) {
  stopLiveListeners();
  if (!user) return;
  liveFeedDisabled = false;
  liveStoriesDisabled = false;
  attachCurrentUserProfileListener();
  startFollowingListener(user);
  void syncNotificationsPushRuntime({ user, interactive: false, enabled: state.settings?.pushNotifs });
}

function attachProfileViewListener(profile) {
  if (profileViewUnsub) {
    profileViewUnsub();
    profileViewUnsub = null;
  }
  if (!profile) return;
  const ref = profile.restaurantId
    ? doc(db, "restaurants", profile.restaurantId)
    : (profile.uid ? doc(db, "users", profile.uid) : null);
  if (!ref) return;
  profileViewUnsub = onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data() || {};
    const viewProfile = state.profileView?.profile;
    if (!viewProfile) return;
    if (profile.restaurantId) {
      viewProfile.followers = data.followersCount ?? viewProfile.followers;
      viewProfile.following = data.followingCount ?? viewProfile.following;
      viewProfile.avatar = data.logoUrl || data.logo || viewProfile.avatar;
      viewProfile.name = data.name || data.restaurantName || viewProfile.name;
      viewProfile.location = data.city || viewProfile.location;
    } else {
      viewProfile.followers = data.followersCount ?? viewProfile.followers;
      viewProfile.following = data.followingCount ?? viewProfile.following;
      viewProfile.privateAccount = !!data.privateAccount;
      viewProfile.avatar = data.avatarUrl || data.avatar || viewProfile.avatar;
      viewProfile.name = data.displayName || viewProfile.name;
      viewProfile.location = data.city || viewProfile.location;
    }
    render();
  });
}

function updateMenuCardCountNodes(itemId, counts = { likes: 0, comments: 0 }) {
  if (!itemId) return;
  const safeId = escapeSelector(itemId);
  const likesLabel = formatCount(counts.likes ?? 0);
  const commentsLabel = formatCount(counts.comments ?? 0);
  document.querySelectorAll(`[data-menu-like-count="${safeId}"]`).forEach((el) => {
    el.textContent = likesLabel;
  });
  document.querySelectorAll(`[data-menu-comment-count="${safeId}"]`).forEach((el) => {
    el.textContent = commentsLabel;
  });
}

function stopPostMetaListeners() {
  return socialEngagementRuntimeController.stopPostMetaListeners(...arguments);
}
function attachPostMetaListeners(post) {
  return socialEngagementRuntimeController.attachPostMetaListeners(...arguments);
}
function stopMenuItemMetaListeners() {
  return socialEngagementRuntimeController.stopMenuItemMetaListeners(...arguments);
}
function attachMenuItemMetaListeners(item, restaurantId) {
  return socialEngagementRuntimeController.attachMenuItemMetaListeners(...arguments);
}
async function loadMenuItemMetaFromFirebase(item, restaurantId) {
  return socialEngagementRuntimeController.loadMenuItemMetaFromFirebase(...arguments);
}
function findProfilePostCardNode(postId) {
  const targetId = String(postId || "");
  const nodes = document.querySelectorAll("[data-open-post]");
  for (const node of nodes) {
    if (node.dataset.openPost === targetId) return node;
  }
  return null;
}

function findProfilePostToggleButton(card, postId) {
  if (!card) return null;
  const targetId = String(postId || "");
  const nodes = card.querySelectorAll("[data-profile-post-toggle]");
  for (const node of nodes) {
    if (node.dataset.profilePostToggle === targetId) return node;
  }
  return null;
}

function updateProfileGridPlaceholder(container) {
  if (!container) return false;
  const existing = container.querySelector("[data-profile-grid-placeholder]");
  if (state.profileViewMode !== "grid") {
    if (existing) existing.remove();
    return true;
  }
  let slotCount = 0;
  container.querySelectorAll("[data-open-post]").forEach((node) => {
    slotCount += node.classList.contains("col-span-2") ? 2 : 1;
  });
  const needsPlaceholder = slotCount % 2 === 1;
  if (needsPlaceholder && !existing) {
    const placeholder = document.createElement("div");
    placeholder.dataset.profileGridPlaceholder = "true";
    placeholder.className = "col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none";
    container.prepend(placeholder);
  } else if (!needsPlaceholder && existing) {
    existing.remove();
  }
  return true;
}

function updateProfilePostCardDom(postId, nextType) {
  const card = findProfilePostCardNode(postId);
  if (!card) return false;
  const isWide = nextType === "wide" || nextType === "hero";
  const isGrid = state.profileViewMode === "grid";
  card.classList.toggle("col-span-2", isGrid && isWide);
  card.classList.remove("aspect-[1.8/1]", "aspect-[4/5]");
  card.classList.add(isGrid ? (isWide ? "aspect-[1.8/1]" : "aspect-[4/5]") : "aspect-[4/5]");
  const img = card.querySelector("img");
  if (img) {
    img.width = isWide ? 800 : 400;
    img.height = isWide ? 400 : 500;
  }
  const toggleBtn = findProfilePostToggleButton(card, postId);
  if (toggleBtn) {
    toggleBtn.innerHTML = `${icon(isWide ? "minimize-2" : "maximize-2", "w-3.5 h-3.5")} ${isWide ? "Schmaler" : "Breiter"}`;
  }
  updateProfileGridPlaceholder(card.parentElement);
  if (window.lucide?.createIcons) window.lucide.createIcons();
  return true;
}

function getProfilePostList() {
  return isLocalBusinessProfile(state.userProfile) ? state.businessPosts : state.userPosts;
}

function findProfilePost(postId) {
  const list = getProfilePostList();
  const idx = list.findIndex((item) => String(item.id) === String(postId));
  return { list, idx, post: idx >= 0 ? list[idx] : null };
}

async function updateProfilePostType(postId, nextType) {
  if (!postId || !state.user) return;
  const isBusiness = isLocalBusinessProfile(state.userProfile);
  if (isBusiness) {
    const restaurantId = state.userProfile.restaurantId;
    if (!restaurantId) return;
    await setDoc(doc(db, "restaurants", restaurantId, "socialPosts", postId), { type: nextType }, { merge: true });
  } else {
    await setDoc(doc(db, "users", state.user.uid, "posts", postId), { type: nextType }, { merge: true });
  }
}

async function toggleProfilePostWidth(postId) {
  if (!postId) return;
  const { post } = findProfilePost(postId);
  if (!post) return;
  const isWide = post.type === "wide" || post.type === "hero";
  const nextType = isWide ? "square" : "wide";
  post.type = nextType;
  state.profilePostMenuId = null;
  setProfileMenuOpen(null);
  const updated = updateProfilePostCardDom(postId, nextType);
  if (!updated && state.activeTab === "profile") {
    render();
  }
  updatePostCaches(post);
  try {
    await updateProfilePostType(postId, nextType);
  } catch (err) {
    console.error(err);
  }
}

async function deleteProfilePost(postId) {
  if (!postId || !state.user) return;
  if (!confirm("Beitrag wirklich loeschen?")) return;
  const { list, idx } = findProfilePost(postId);
  if (idx < 0) return;
  list.splice(idx, 1);
  state.profilePostMenuId = null;
  render();
  const isBusiness = isLocalBusinessProfile(state.userProfile);
  if (isBusiness) {
    if (state.userProfile.restaurantId) {
      writeCache(businessPostsKey(state.userProfile.restaurantId), state.businessPosts);
    }
  } else {
    if (state.user?.uid) {
      writeCache(userPostsKey(state.user.uid), state.userPosts);
    }
  }
  try {
    if (isBusiness) {
      const restaurantId = state.userProfile.restaurantId;
      if (restaurantId) {
        await deleteDoc(doc(db, "restaurants", restaurantId, "socialPosts", postId));
      }
      await deleteDoc(doc(db, "socialFeed", postId));
    } else {
      await deleteDoc(doc(db, "users", state.user.uid, "posts", postId));
    }
  } catch (err) {
    console.error(err);
  }
}

function toggleProfilePostMenu(postId) {
  if (!postId) return;
  const next = String(state.profilePostMenuId) === String(postId) ? null : String(postId);
  state.profilePostMenuId = next;
  setProfileMenuOpen(next);
}

function setProfileMenuOpen(postId) {
  const menus = document.querySelectorAll("[data-profile-menu]");
  const next = postId ? String(postId) : "";
  menus.forEach((menu) => {
    const isOpen = next && menu.dataset.profileMenu === next;
    menu.classList.toggle("hidden", !isOpen);
  });
}

function getPostDocRef(post) {
  return socialEngagementRuntimeController.getPostDocRef(...arguments);
}
function getFeedDocRef(post) {
  return socialEngagementRuntimeController.getFeedDocRef(...arguments);
}
async function resolveRestaurantOwnerUid(restaurantId) {
  return socialEngagementRuntimeController.resolveRestaurantOwnerUid(...arguments);
}
async function resolvePostOwnerUid(post) {
  return socialEngagementRuntimeController.resolvePostOwnerUid(...arguments);
}
async function loadPostMetaFromFirebase(post, { includeLikes = false, includeComments = true } = {}) {
  return socialEngagementRuntimeController.loadPostMetaFromFirebase(...arguments);
}
async function loadPostLikesForModal(postId) {
  return socialEngagementRuntimeController.loadPostLikesForModal(...arguments);
}
function getMenuItemImages(item) {
  const looksLikeImageString = (value) => {
    const str = String(value || "").trim();
    if (!str) return false;
    const lower = str.toLowerCase();
    if (lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("data:") || lower.startsWith("blob:") || lower.startsWith("gs://")) return true;
    if (lower.startsWith("media/") || lower.startsWith("social/") || lower.startsWith("menu/")) return true;
    return /\.(avif|webp|png|jpe?g|gif|svg|bmp|tiff?)(\?.*)?$/i.test(str);
  };
  const normalizeImg = (value, depth = 0, seen = new WeakSet()) => {
    if (!value) return "";
    if (typeof value === "string") {
      const cleaned = value.trim();
      if (!cleaned) return "";
      const lower = cleaned.toLowerCase();
      if (lower === "null" || lower === "undefined" || lower === "data") return "";
      if ((cleaned.startsWith("{") && cleaned.endsWith("}")) || (cleaned.startsWith("[") && cleaned.endsWith("]"))) {
        try {
          const parsed = JSON.parse(cleaned);
          return normalizeImg(parsed, depth + 1, seen);
        } catch {}
      }
      return cleaned;
    }
    if (typeof value === "object") {
      if (seen.has(value)) return "";
      seen.add(value);
      const candidate = value.url
        || value.src
        || value.imageUrl
        || value.imageURL
        || value.image_url
        || value.imagePath
        || value.image_path
        || value.imageSrc
        || value.image_src
        || value.path
        || value.cdnUrl
        || value.cdnURL
        || value.downloadURL
        || value.downloadUrl
        || value.photoUrl
        || value.photoURL
        || value.photo_url
        || value.picture
        || value.pictureUrl
        || value.pictureURL
        || value.photo
        || value.img
        || value.imgUrl
        || value.imgURL
        || value.img_src
        || value.imgSrc
        || value.thumbnail
        || value.thumbnailUrl
        || value.thumbnailURL
        || value.thumb
        || value.original
        || value.file
        || value.fileUrl
        || value.fileURL
        || value.publicUrl
        || value.publicURL
        || value.secure_url
        || value.secureUrl;
      const resolved = normalizeImg(candidate, depth + 1, seen);
      if (resolved) return resolved;
      if (depth < 2) {
        for (const val of Object.values(value)) {
          if (typeof val === "string" && looksLikeImageString(val)) {
            const found = normalizeImg(val, depth + 1, seen);
            if (found) return found;
          } else if (val && typeof val === "object") {
            const found = normalizeImg(val, depth + 1, seen);
            if (found) return found;
          }
        }
      }
      return "";
    }
    return "";
  };
  const rawList = [];
  [item?.imageUrls, item?.images, item?.image, item?.gallery, item?.photos, item?.media, item?.mediaUrls, item?.photoUrls, item?.pictureUrls].forEach((list) => {
    if (Array.isArray(list)) {
      rawList.push(...list);
    } else if (typeof list === "string" && list.trim()) {
      rawList.push(list);
    }
  });
  const list = rawList.map(normalizeImg);
  const primary = normalizeImg(
    item?.imageUrl
      || item?.imageURL
      || item?.image_url
      || item?.image
      || item?.photoUrl
      || item?.photoURL
      || item?.photo_url
      || item?.img
      || item?.imgUrl
      || item?.imgURL
      || item?.thumbnail
      || item?.thumb
      || item?.cover
      || item?.coverUrl
      || item?.coverURL
      || ""
  );
  if (primary) list.unshift(primary);
  const unique = Array.from(new Set(list.filter(Boolean)));
  return unique.length ? unique : [];
}

function isDirectImageUrl(value) {
  const str = String(value || "").trim();
  if (!str) return false;
  const lower = str.toLowerCase();
  return lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("data:") || lower.startsWith("blob:") || lower.startsWith("gs://");
}

function resolveMenuItemHero(item) {
  const images = getMenuItemImages(item);
  return images[0] || "";
}

function renderProfilePostCardFancy(item, isGrid, allowMenu = true) {
  return profileMenuFocusRenderController.renderProfilePostCardFancy(item, isGrid, allowMenu);
}

function renderProfilePostsFancy(posts, viewMode, allowMenu = true) {
  return profileMenuFocusRenderController.renderProfilePostsFancy(posts, viewMode, allowMenu);
}

function renderProfileCheckins() {
  return profileMenuFocusRenderController.renderProfileCheckins();
}

function renderProfileTabs() {
  return profileMenuFocusRenderController.renderProfileTabs();
}

function renderProfileViewControls() {
  return profileMenuFocusRenderController.renderProfileViewControls();
}

function renderPublicProfileView() {
  return profileMenuFocusRenderController.renderPublicProfileView();
}

function renderMenuFilterRow() {
  return profileMenuFocusRenderController.renderMenuFilterRow();
}

function renderMenuLayoutSection() {
  return profileMenuFocusRenderController.renderMenuLayoutSection();
}

function renderMenuItemCard(item, { mode = "profile" } = {}) {
  return profileMenuFocusRenderController.renderMenuItemCard(item, { mode });
}

function renderMenuItemCardStacked(item, { mode = "profile", variant = "food" } = {}) {
  return profileMenuFocusRenderController.renderMenuItemCardStacked(item, { mode, variant });
}

function renderMenuDrinkGrid(items, { mode = "profile" } = {}) {
  return profileMenuFocusRenderController.renderMenuDrinkGrid(items, { mode });
}

function renderMenuFoodList(items, { mode = "profile" } = {}) {
  return profileMenuFocusRenderController.renderMenuFoodList(items, { mode });
}

function renderMenuList(items, { mode = "profile" } = {}) {
  return profileMenuFocusRenderController.renderMenuList(items, { mode });
}

function getActiveFocusItems(items = state.focus.items) {
  const list = Array.isArray(items) ? items : [];
  return list
    .map((item, idx) => normalizeFocusItem(item, item?.id || `focus_${idx}`))
    .filter((item) => item && item.active !== false);
}

function getFocusStateForRestaurant(restaurantId, { includeInactive = false } = {}) {
  const same = !!restaurantId && state.focus.restaurantId === restaurantId;
  const rawItems = same ? (Array.isArray(state.focus.items) ? state.focus.items : []) : [];
  const normalized = rawItems.map((item, idx) => normalizeFocusItem(item, item?.id || `focus_${idx}`));
  const items = includeInactive ? normalized : normalized.filter((item) => item && item.active !== false);
  const enabled = same ? state.focus.enabled !== false : true;
  const loading = !!restaurantId && (state.focus.loading || !same);
  return { items, enabled, loading, same };
}

function getFocusIndex(items) {
  const max = (items?.length || 0) - 1;
  if (max < 0) return 0;
  const raw = Number(state.focus.index || 0);
  if (!Number.isFinite(raw) || raw < 0 || raw > max) return 0;
  return raw;
}

function setFocusIndex(nextIndex) {
  const items = getActiveFocusItems();
  if (!items.length) return;
  const max = items.length;
  let idx = Number(nextIndex);
  if (!Number.isFinite(idx)) idx = 0;
  if (idx < 0) idx = max - 1;
  if (idx >= max) idx = 0;
  if (idx === state.focus.index) return;
  state.focus.index = idx;
  if (!updateFocusCarouselDom()) {
    render();
  }
}

function clearFocusRotation() {
  if (!focusRotateTimer) return;
  if (typeof window !== "undefined") {
    window.clearInterval(focusRotateTimer);
  }
  focusRotateTimer = null;
}

function isFocusRotationActive() {
  const profile = state.profileView?.profile || state.userProfile;
  const restaurantId = profile?.restaurantId || "";
  if (!restaurantId) return false;
  if (state.activeTab !== "profile" || state.profileTopTab !== "menu") return false;
  if (!isRestaurantCafeProfile(profile)) return false;
  if (state.focus.enabled === false) return false;
  if (state.focus.restaurantId !== restaurantId) return false;
  const items = getActiveFocusItems();
  return items.length > 1;
}

function updateFocusRotation() {
  if (typeof window === "undefined") return;
  const profile = state.profileView?.profile || state.userProfile;
  const restaurantId = profile?.restaurantId || "";
  const items = getActiveFocusItems();
  const shouldRotate = isFocusRotationActive();
  const nextKey = shouldRotate ? `${restaurantId}|${items.length}` : "";
  if (!shouldRotate) {
    clearFocusRotation();
    focusRotateKey = nextKey;
    return;
  }
  if (focusRotateKey !== nextKey) {
    clearFocusRotation();
    focusRotateKey = nextKey;
  }
  if (!focusRotateTimer) {
    focusRotateTimer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (!isFocusRotationActive()) {
        clearFocusRotation();
        return;
      }
      setFocusIndex(state.focus.index + 1);
    }, 5000);
  }
}

function updateFocusCarouselDom() {
  if (typeof document === "undefined") return false;
  const root = document.getElementById("focusCarousel");
  if (!root) return false;
  const profile = state.profileView?.profile || state.userProfile;
  const restaurantId = profile?.restaurantId || "";
  if (!restaurantId || !isRestaurantCafeProfile(profile)) return false;
  const { items, enabled } = getFocusStateForRestaurant(restaurantId);
  if (!enabled || !items.length) return false;
  const idx = getFocusIndex(items);
  const item = items[idx] || items[0];
  const imgUrl = getOptimizedImageUrl(item.imageUrl || "", "large");
  const safeImg = isPlaceholderUrl(imgUrl) ? PLACEHOLDER_IMAGE : imgUrl;

  const imgEl = root.querySelector("[data-focus-image]");
  if (imgEl instanceof HTMLImageElement) {
    if (imgEl.getAttribute("src") !== safeImg) imgEl.setAttribute("src", safeImg);
  }
  const titleEl = root.querySelector("[data-focus-title]");
  if (titleEl) titleEl.textContent = item.title || "Sot ne Fokus";
  const textEl = root.querySelector("[data-focus-text]");
  if (textEl) {
    if (item.text) {
      textEl.textContent = item.text;
      textEl.classList.remove("hidden");
    } else {
      textEl.textContent = "";
      textEl.classList.add("hidden");
    }
  }
  root.querySelectorAll("[data-focus-dot]").forEach((btn) => {
    const dotIdx = Number(btn.dataset.focusDot || "0");
    btn.classList.toggle("bg-slate-900", dotIdx === idx);
    btn.classList.toggle("bg-slate-200", dotIdx !== idx);
  });
  return true;
}

function renderFocusAdminSection(restaurantId) {
  return profileMenuFocusRenderController.renderFocusAdminSection(restaurantId);
}

function renderFocusCarousel(profile) {
  return profileMenuFocusRenderController.renderFocusCarousel(profile);
}

function renderMenuQrCard({ label, url, caption }) {
  return profileMenuFocusRenderController.renderMenuQrCard({ label, url, caption });
}

function renderMenuAdminView() {
  return profileMenuFocusRenderController.renderMenuAdminView();
}

function renderProfileMenuView(profile) {
  return profileMenuFocusRenderController.renderProfileMenuView(profile);
}

function renderProfileView() {
  return profileMenuFocusRenderController.renderProfileView();
}

function showPublicProfile(profile, posts, { showBack = true, backTab, topTab } = {}) {
  state.profileView = { profile, posts: posts || profile.posts || [] };
  state.profileModal = { open: false, profile: null };
  state.profileContentTab = "posts";
  state.profileTopTab = profile?.restaurantId
    ? (topTab || "profile")
    : "profile";
  state.profileViewMode = "grid";
  state.profilePostMenuId = null;
  state.drawerOpen = false;
  if (showBack) {
    state.profileBackTab = backTab || state.activeTab || "feed";
  } else {
    state.profileBackTab = "";
  }
  state.activeTab = "profile";
  render();
  attachProfileViewListener(profile);
}

function getDeeplinkPendingState() {
  return {
    pendingProfileRestaurantId,
    pendingProfileTopTab,
    pendingProfileHandled,
    pendingNotificationId,
    pendingNotificationHandled,
    pendingPostId,
    pendingPostHandled,
    pendingChatUid,
    pendingChatHandled,
    pendingInitialTab,
    pendingAuthMode
  };
}

function setDeeplinkPendingState(patch = {}) {
  if (!patch || typeof patch !== "object") return;
  if ("pendingProfileRestaurantId" in patch) pendingProfileRestaurantId = patch.pendingProfileRestaurantId;
  if ("pendingProfileTopTab" in patch) pendingProfileTopTab = patch.pendingProfileTopTab;
  if ("pendingProfileHandled" in patch) pendingProfileHandled = !!patch.pendingProfileHandled;
  if ("pendingNotificationId" in patch) pendingNotificationId = patch.pendingNotificationId;
  if ("pendingNotificationHandled" in patch) pendingNotificationHandled = !!patch.pendingNotificationHandled;
  if ("pendingPostId" in patch) pendingPostId = patch.pendingPostId;
  if ("pendingPostHandled" in patch) pendingPostHandled = !!patch.pendingPostHandled;
  if ("pendingChatUid" in patch) pendingChatUid = patch.pendingChatUid;
  if ("pendingChatHandled" in patch) pendingChatHandled = !!patch.pendingChatHandled;
  if ("pendingInitialTab" in patch) pendingInitialTab = patch.pendingInitialTab;
  if ("pendingAuthMode" in patch) pendingAuthMode = patch.pendingAuthMode;
}

function startFollowingListener(user = state.user) {
  if (followingUnsub) {
    followingUnsub();
    followingUnsub = null;
  }
  const ownerUid = String(user?.uid || "").trim();
  if (!ownerUid) return;
  const ref = collection(db, "users", ownerUid, "following");
  followingUnsub = onSnapshot(ref, (snap) => {
    const { handles, targetIds } = mapFollowingSnapshotCore({
      snap,
      normalizeFollowHandle: (value) => normalizeFollowHandle(value)
    });
    applyFollowingHandles(handles, { targetIds });
  }, (err) => {
    console.error(err);
  });
}

sessionDataRuntimeController = createSessionDataRuntimeController(buildSessionDataRuntimeControllerDeps({
  state,
  dataLoaded,
  DEFAULT_SETTINGS,
  DEFAULT_MENU_LAYOUT,
  DEFAULT_PROFILE,
  CACHE_KEYS,
  STORAGE_KEYS,
  GUEST_SCOPE_UID,
  CRM_PAGE_SIZE,
  CEO_COUNTRIES,
  safeStorage,
  readCache,
  writeCache,
  scheduleIdle,
  collectFeedHydrationIds,
  hydrateRestaurantsByIds,
  rebuildBusinessLocations,
  syncFeedPostLogos,
  refreshFeedStories,
  preloadFeedHeroImages,
  render,
  getLastRenderMode: () => lastRenderMode,
  updateFeedDom: (...args) => updateFeedDom(...args),
  enrichRestaurantsWithPublicMeta,
  loadLogoCache,
  profileKey,
  notificationsKey,
  followingKey,
  shopCartKey,
  userPostsKey,
  businessPostsKey,
  normalizeShopCartState,
  createEmptyShopCart,
  createEmptyOrdersState,
  createEmptyFavoriteMenuItemsState,
  createEmptyMenuDetailState,
  createEmptyLeadsState,
  createEmptyCustomersState,
  sortChatThreads,
  loadChatThreadIndex,
  loadChatThreadMessages,
  buildChatPreviewText,
  getChatMessageTimestamp,
  saveChatThreadIndex,
  loadAvatarCache,
  getOptimizedImageUrl,
  isPlaceholderUrl,
  primeSelfAvatarCache,
  normalizeFollowHandle,
  saveFollowing,
  stopActiveChatMessagesListener,
  stopRestaurantMetaListeners,
  stopMenuItemMetaListeners,
  menuItemCountsRequested,
  commentAvatarCache,
  commentAvatarPending,
  userSearchAvatarCache,
  businessProfileCache,
  userProfileCache,
  setMenuDetailCloseBound: (next) => {
    menuDetailCloseBound = !!next;
  },
  getUserAvatarCache: () => userAvatarCache,
  setUserAvatarCache: (next) => {
    userAvatarCache = String(next || "");
  },
  getLastShellAvatarUrl: () => lastShellAvatarUrl,
  setLastShellAvatarUrl: (next) => {
    lastShellAvatarUrl = String(next || "");
  },
  bootstrapAuthenticatedSessionCore,
  loadAuthProfile,
  resolveRoleSwitchTargets,
  startLiveListeners,
  ensureTabData,
  CACHE_TTL_MS,
  FAST_LIMITS,
  db,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  toDateSafe,
  updateShellDom,
  refreshSearchView: (...args) => refreshSearchView(...args),
  cleanupLeaflet: (...args) => cleanupLeaflet(...args),
  normalizeFeedPost,
  loadStoriesForFeed,
  saveFeedPosts,
  focusCache,
  menuCache,
  focusCacheKey,
  menuCacheKey,
  loadFocusItems,
  loadFocusMeta,
  hasMenuItemImages,
  loadMenuItemsFromCollection,
  loadPublicMenuItems,
  loadLegacyMenuItems,
  fillMenuImagesFromFallback,
  loadMenuHybrid
}));

socialEngagementRuntimeController = createSocialEngagementRuntimeController({
  state,
  db,
  detailLikesLimit: DETAIL_LIKES_LIMIT,
  detailCommentsLimit: DETAIL_COMMENTS_LIMIT,
  restaurantOwnerCache,
  commentAvatarCache,
  documentObj: typeof document === "undefined" ? null : document,
  collectionFn: collection,
  docFn: doc,
  getDocFn: getDoc,
  getDocsFn: getDocs,
  onSnapshotFn: onSnapshot,
  queryFn: query,
  orderByFn: orderBy,
  limitFn: limit,
  updateDocFn: updateDoc,
  writeBatchFn: writeBatch,
  runTransactionFn: runTransaction,
  serverTimestampFn: serverTimestamp,
  incrementFn: increment,
  openGuestAuthPromptFn: openGuestAuthPrompt,
  currentUserBadgeFn: currentUserBadge,
  ensurePostMetaFn: ensurePostMeta,
  ensureMenuItemMetaFn: ensureMenuItemMeta,
  resolveMenuItemCountsFn: resolveMenuItemCounts,
  getMenuDetailContextFn: getMenuDetailContext,
  ensureCommentShapeFn: ensureCommentShape,
  updatePostCountNodesFn: updatePostCountNodes,
  updatePostCachesFn: updatePostCaches,
  updateMenuCardCountNodesFn: updateMenuCardCountNodes,
  updatePostModalMetaFn: updatePostModalMeta,
  updatePostModalCountsOnlyFn: updatePostModalCountsOnly,
  updateMenuDetailCountsOnlyFn: updateMenuDetailCountsOnly,
  updateMenuDetailCommentsOnlyFn: updateMenuDetailCommentsOnly,
  updateMenuDetailMetaFn: updateMenuDetailMeta,
  updateCommentLikeButtonFn: updateCommentLikeButton,
  ensureSelfAvatarReadyFn: ensureSelfAvatarReady,
  normalizeHandleFn: normalizeHandle,
  isPlaceholderUrlFn: isPlaceholderUrl,
  primeSelfAvatarCacheFn: primeSelfAvatarCache,
  scheduleCommentAvatarDomUpdateFn: scheduleCommentAvatarDomUpdate,
  updateCommentAvatarNodesByIdFn: updateCommentAvatarNodesById,
  scheduleCommentAvatarFetchFn: scheduleCommentAvatarFetch,
  hydrateCommentAvatarsFn: hydrateCommentAvatars,
  refreshSelfCommentAvatarsFn: refreshSelfCommentAvatars,
  renderOverlaysFn: (...args) => renderOverlays(...args),
  updateShellDomFn: updateShellDom,
  pushUserNotificationFn: pushUserNotification,
  updateFavoriteMenuItemsLocalFn: updateFavoriteMenuItemsLocal,
  autosizeTextareaFn: autosizeTextarea,
  favoriteMenuItemDocIdFn: favoriteMenuItemDocId,
  buildFavoriteMenuItemPayloadFn: buildFavoriteMenuItemPayload,
  getMenuItemSocialDocRefFn: getMenuItemSocialDocRef,
  getMenuItemSocialIdFn: getMenuItemSocialId,
  menuItemMetaKeyFn: menuItemMetaKey,
  getLastCommentKeyFn: () => lastCommentKey,
  setLastCommentKeyFn: (value) => {
    lastCommentKey = String(value || "");
  },
  getLastCommentAtFn: () => lastCommentAt,
  setLastCommentAtFn: (value) => {
    lastCommentAt = Number(value) || 0;
  },
  getLastMenuCommentKeyFn: () => lastMenuCommentKey,
  setLastMenuCommentKeyFn: (value) => {
    lastMenuCommentKey = String(value || "");
  },
  getLastMenuCommentAtFn: () => lastMenuCommentAt,
  setLastMenuCommentAtFn: (value) => {
    lastMenuCommentAt = Number(value) || 0;
  },
  getModalPostDocUnsubFn: () => modalPostDocUnsub,
  setModalPostDocUnsubFn: (next) => {
    modalPostDocUnsub = typeof next === "function" ? next : null;
  },
  getModalLikesUnsubFn: () => modalLikesUnsub,
  setModalLikesUnsubFn: (next) => {
    modalLikesUnsub = typeof next === "function" ? next : null;
  },
  getModalCommentsUnsubFn: () => modalCommentsUnsub,
  setModalCommentsUnsubFn: (next) => {
    modalCommentsUnsub = typeof next === "function" ? next : null;
  },
  getMenuDetailDocUnsubFn: () => menuDetailDocUnsub,
  setMenuDetailDocUnsubFn: (next) => {
    menuDetailDocUnsub = typeof next === "function" ? next : null;
  },
  getMenuDetailLikesUnsubFn: () => menuDetailLikesUnsub,
  setMenuDetailLikesUnsubFn: (next) => {
    menuDetailLikesUnsub = typeof next === "function" ? next : null;
  },
  getMenuDetailCommentsUnsubFn: () => menuDetailCommentsUnsub,
  setMenuDetailCommentsUnsubFn: (next) => {
    menuDetailCommentsUnsub = typeof next === "function" ? next : null;
  }
});

const {
  storySystemController,
  profileApi: {
    isOwnBusinessTarget,
    openOwnBusinessProfile,
    openProfileViewFromBusiness,
    openProfileFromUser
  },
  deeplinkApi: {
    clearNotificationQueryParams,
    clearPostQueryParams,
    clearChatQueryParams,
    resolveRouteStateFromTargetUrl,
    applyPendingRouteStateFromTargetUrl,
    maybeOpenNotificationFromQuery,
    maybeOpenPostFromQuery,
    maybeOpenChatFromQuery,
    handlePushOpenTargetMessage,
    bindPushOpenTargetMessageHandler,
    maybeOpenProfileFromQuery
  },
  notificationsApi: {
    normalizeNotificationItem,
    mapNotificationSnapshot,
    shouldSurfaceNativePushNow,
    startNotificationsListener,
    syncNotificationsPushRuntime,
    loadNotificationsFromFirebase
  },
  bridgeBindings: {
    openChatWithProfile,
    closeChatModal,
    closeProfileModal,
    closeLikesModal,
    closeActiveModal,
    isAnyModalOpen,
    openPostModal,
    closePostModal,
    renderFeedView,
    renderStoryItem,
    renderStoriesRow,
    renderFeedItem,
    renderFeedList,
    patchFeedList,
    patchStoriesRow,
    updateFeedDom,
    bindFeedDelegation,
    buildRestaurantLocations,
    ensureLeafletLoaded,
    cleanupLeaflet,
    updateMapSheet,
    initLeafletIfNeeded,
    mapLocate,
    renderMapView,
    buildLocalBusinessResults,
    handleSearchInput,
    renderSearchView,
    refreshSearchView,
    renderShopProductList,
    renderProfileShopFavoritesView,
    openMenuDetailFromTrigger,
    triggerMenuDetailOpenFromGesture,
    renderProfileShopCartView,
    ensureOverlayRoot,
    ensureModalEscapeHandler,
    syncModalOpenUiState,
    renderOverlays,
    bindModalDismiss,
    bindOverlayEvents,
    clearShopCart,
    getCurrentShopProfile,
    getShopCartProfileContext,
    addMenuItemToShopCart,
    updateShopCartQuantity,
    openShopCheckout,
    updateShopCheckoutField,
    getShopCartTotal,
    openFocusModal,
    closeFocusModal,
    openLeadModal,
    closeLeadModal,
    openCustomerModal,
    closeCustomerModal,
    openMenuModal,
    closeMenuModal,
    openMenuDetail,
    closeMenuDetail,
    setMenuDetailIndex,
    setMenuDetailVariant
  },
  createShellRuntimeController
} = createBridgeShellBootstrapBundle({
  state,
  BRAND_UI,
  FAST_MODE,
  LEAFLET_JS_URL,
  LEAFLET_CSS_URL,
  SEARCH_LIMITS,
  PLACEHOLDER_IMAGE,
  documentObj: typeof document === "undefined" ? null : document,
  windowObj: typeof window === "undefined" ? null : window,
  navigatorObj: typeof navigator === "undefined" ? null : navigator,
  pushActivationIssue,
  NOTIFICATIONS_LIVE_LIMIT,
  getPendingState: getDeeplinkPendingState,
  setPendingState: setDeeplinkPendingState,
  getPushOpenMessageBound: () => pushOpenMessageBound,
  markPushOpenMessageBound: () => {
    pushOpenMessageBound = true;
  },
  getNotificationsUnsub: () => notificationsUnsub,
  setNotificationsUnsub: (nextUnsub) => {
    notificationsUnsub = typeof nextUnsub === "function" ? nextUnsub : null;
  },
  getStoriesRowSignature: () => storiesRowSignature,
  setStoriesRowSignature: (next) => {
    storiesRowSignature = next;
  },
  getOverlayCache: () => overlayCache,
  isModalEscapeBound: () => modalEscapeBound,
  setModalEscapeBound: (value) => {
    modalEscapeBound = !!value;
  },
  isMenuDetailCloseBound: () => menuDetailCloseBound,
  setMenuDetailCloseBound: (next) => {
    menuDetailCloseBound = !!next;
  },
  getLastMenuOpenGestureKey: () => lastMenuOpenGestureKey,
  setLastMenuOpenGestureKey: (next) => {
    lastMenuOpenGestureKey = next;
  },
  getLastMenuOpenGestureAt: () => lastMenuOpenGestureAt,
  setLastMenuOpenGestureAt: (next) => {
    lastMenuOpenGestureAt = next;
  },
  setPendingCommentHighlight: (value) => {
    pendingCommentHighlight = value;
  },
  collection,
  query,
  orderBy,
  startAt,
  endAt,
  where,
  limit,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  doc,
  serverTimestamp,
  db,
  isLocalBusinessProfile,
  getRestaurantMetaById,
  normalizeSearchKey,
  render,
  ensureMenuDataForProfile,
  ensureFocusDataForProfile,
  hydrateRestaurantsByIds,
  normalizeExternalProfile,
  showPublicProfile,
  fetchBusinessProfileDoc,
  loadBusinessPostsForRestaurant,
  normalizeExternalUserProfile,
  openGuestAuthPrompt,
  userProfileCache,
  hasPendingFollowRequest,
  resolveUserByHandle,
  loadUserPostsForUser,
  clearQueryParamsFromCurrentUrlCore,
  resolveRouteStateFromTargetUrlCore,
  resolveInitialRouteState,
  normalizeInitialTab,
  normalizeAuthMode,
  applyPendingRouteStateCore,
  normalizePendingNotificationIdCore,
  findNotificationByIdCore,
  prependNotificationByIdCore,
  saveNotifications,
  openNotificationTarget,
  normalizePendingPostIdCore,
  findPostInLocalSourcesCore,
  findPostById,
  fetchPostForNotification,
  normalizePendingChatUidCore,
  isSelfPendingChatTargetCore,
  isChatThreadAlreadyOpenCore,
  getChatThreadId,
  getChatThreadById,
  buildChatRouteTargetProfileCore,
  normalizePendingProfileRestaurantIdCore,
  isPendingProfileAlreadyOpenCore,
  normalizeProfileTopTabFromRouteCore,
  parsePushOpenTargetPayloadCore,
  shouldHandlePushOpenTargetCore,
  applyPendingInitialRouteState,
  isPushOpenTargetMessageCore,
  normalizeNotificationItemCore,
  formatRelative,
  toDateSafe,
  mapNotificationSnapshotCore,
  shouldSurfaceNativePushNowCore,
  buildNotificationsLiveQueryCore,
  readPushSeenIds,
  addNotificationItemsToSeenSetCore,
  writePushSeenIds,
  canEmitNativePushAlerts,
  collectUnseenUnreadNotificationItemsFromChangesCore,
  showNativePushAlert,
  handleNotificationsUpdate,
  buildNotificationsFetchQueryCore,
  fetchNotificationsFromQueryCore,
  updateNotificationsDom,
  setPushActivationIssue,
  clearPushActivationIssue,
  ensureNotificationPermission,
  syncPushDeviceRegistration,
  getMenuItemImages,
  resolveMenuItemHero,
  getOptimizedImageUrl,
  isPlaceholderUrl,
  getFirebaseStorageUrl,
  isDirectImageUrl,
  formatPrice,
  escapeHtml,
  getMenuItemObjectPosition,
  icon,
  loadFavoriteMenuItems,
  createEmptyFavoriteMenuItemsState,
  getShopCartProfileContextCore,
  getShopCartTotalCore,
  parsePriceValue,
  canAddToShopCart,
  normalizeShopCartState,
  buildShopVariantKey,
  clampCropPercent,
  createEmptyShopCart,
  saveShopCartToStorage,
  confirm,
  buildStoriesFromFeed,
  updateStoryLogoNodes,
  updateStoryMetaNodes,
  resolveStoryRenderIdentity,
  updateFeedLogoNodes,
  updatePostCountNodes,
  ensureFeedRestaurantMetaListeners,
  preloadFeedHeroImages,
  buildStoriesRowSignature,
  buildUrl,
  resolveRestaurantLogo,
  getLastRenderMode: () => lastRenderMode,
  setState,
  getGeo,
  normalizeLeadLocations,
  resolveCoordsFromEntity,
  normalizeCoordPair,
  preferStableCoords,
  isPublicBusinessRecord,
  normalizeRestaurantType,
  getSelfAvatarUrl,
  isCeoUser,
  getCeoGpsOverride,
  alert,
  normalizeSearchQuery,
  scoreSearchMatch,
  sanitizeDisplayName,
  normalizeHandle,
  resolveSearchUserAvatarDisplay,
  isForceHiddenBusinessEntity,
  isForceHiddenHandle,
  isForceHiddenEmail,
  isGuestSession,
  escapeSelector,
  normalizeChatOpenProfileCore,
  upsertChatThread,
  markChatThreadAsRead,
  buildChatModalStateOnOpenCore,
  syncChatThreadSummary,
  syncRemoteChatReadState,
  startActiveChatMessagesListener,
  stopActiveChatMessagesListener,
  buildClosedChatModalStateCore,
  ensurePostMeta,
  attachPostMetaListeners,
  loadPostMetaFromFirebase,
  updatePostModalMeta,
  stopPostMetaListeners,
  getFocusItemCrop,
  createLeadDraftState,
  resetLeadDraft,
  getMenuItemCrop,
  createEmptyMenuDetailState,
  attachMenuItemMetaListeners,
  loadMenuItemMetaFromFirebase,
  updateMenuDetailMeta,
  stopMenuItemMetaListeners,
  ensureOverlayRootCore,
  ensureModalEscapeHandlerCore,
  syncModalOpenUiStateCore,
  renderOverlaysCore,
  renderProfileModal,
  renderChatModal,
  renderPostModal,
  renderLikesModal,
  renderMenuItemModal,
  renderMenuDetailModal,
  renderFocusModal,
  renderLeadModal,
  renderCustomerModal,
  bindOverlayEventsCore,
  bindProfileOverlayEventsCore,
  bindChatOverlayEventsCore,
  bindPostOverlayEventsCore,
  bindLikesOverlayEventsCore,
  bindMenuOverlayEventsCore,
  bindMenuDetailOverlayEventsCore,
  bindFocusOverlayEventsCore,
  bindLeadOverlayEventsCore,
  bindCustomerOverlayEventsCore,
  toggleFollow,
  sendChatMessage,
  scrollChatMessagesToBottom,
  queueMicrotask,
  togglePostLike,
  loadPostLikesForModal,
  addComment,
  toggleCommentLike,
  saveMenuItemFromModal,
  syncMenuModalCropPreview,
  getMenuDetailCatalogProfile,
  toggleMenuItemLike,
  autosizeTextarea,
  addMenuItemComment,
  applyCommentAvatarCache,
  saveFocusItemFromModal,
  syncFocusModalCropPreview,
  saveLeadFromModal,
  convertLeadToCustomer,
  addLeadModalLocationRow,
  removeLeadModalLocationRow,
  syncLeadModalDraftFromForm,
  openLocationPicker,
  createLeadLocation,
  parseCoordsFromAddressInput,
  getLeadPlusCodeReference,
  hasLeadLocationCoords,
  getPrimaryLeadLocation,
  refineLeadLocationAddressIndex,
  saveCustomerFromModal,
  bindImageFallbacks,
  appEl,
  getRenderSuspended: () => renderSuspended,
  setRenderQueued: (next) => {
    renderQueued = !!next;
  },
  getLastAppHtml: () => lastAppHtml,
  setLastAppHtml: (next) => {
    lastAppHtml = next;
  },
  setLastRenderMode: (next) => {
    lastRenderMode = next;
  },
  getLastRenderedMainTab: () => lastRenderedMainTab,
  setLastRenderedMainTab: (next) => {
    lastRenderedMainTab = next;
  },
  getCrmAutoLoadObserver: () => crmAutoLoadObserver,
  setCrmAutoLoadObserver: (next) => {
    crmAutoLoadObserver = next;
  },
  getAuthInitialized: () => authInitialized,
  getAuthBootstrapSnapshot: () => authBootstrapSnapshot,
  getUserAvatarCache: () => userAvatarCache,
  getProfileMenuBound: () => profileMenuBound,
  setProfileMenuBound: (next) => {
    profileMenuBound = !!next;
  },
  getProfileViewUnsub: () => profileViewUnsub,
  setProfileViewUnsub: (next) => {
    profileViewUnsub = next;
  },
  getChatUnreadCount,
  resolveHeaderBranding,
  logoFitClass,
  isRestaurantCafeProfile,
  getBusinessCatalogLabel,
  isShopCatalogProfile,
  getCartCountForRestaurant,
  renderAuthScreen,
  sanitizeTabForSession,
  renderMain,
  focusSearchInput,
  focusInputById,
  captureChatInputFocusState,
  restoreChatInputFocusState,
  updateNotificationBadges,
  updateFocusRotation,
  ensureAuthLocalPersistence,
  resolveAdminLogin,
  signInOrCreateAdmin,
  signInWithEmailAndPassword,
  auth,
  ensureUserProfile,
  createUserWithEmailAndPassword,
  updateProfile,
  normalizeLeadScopeKey,
  loadLeads,
  normalizeCustomerScopeKey,
  loadCustomers,
  loadCeoStaff,
  bindAppEventsMainCore,
  bindAppShellEventsCore,
  signOut,
  clearAuthBootstrapSnapshot,
  safeStorage,
  profileKey,
  avatarKey,
  notificationsKey,
  pushSeenKey,
  pushTokenMetaKey,
  followingKey,
  chatIndexKey,
  STORAGE_KEYS,
  resetUserScopedState,
  bindAppMenuFocusEventsCore,
  saveMenuLayoutToStorage,
  deleteMenuItemById,
  submitShopCheckout,
  focusCache,
  focusCacheKey,
  saveFocusEnabled,
  deleteFocusItemById,
  setFocusIndex,
  toggleProfilePostMenu,
  toggleProfilePostWidth,
  deleteProfilePost,
  setProfileMenuOpen,
  bindNotificationsDelegation,
  bindAppSettingsProfileEventsCore,
  saveAccountSettings,
  clearVerifiedMapLocation,
  saveSettings,
  disablePushDeviceRegistration,
  getPushActivationIssueMessage,
  saveUserProfileToStorage,
  persistPrivateAccountSetting,
  uploadAvatar,
  bindAppChatUploadEventsCore,
  deleteChatThreadById,
  setChatThreadArchivedById,
  toggleChatMessageSaved,
  toggleChatMessageLiked,
  removePendingChatAttachment,
  addChatAttachments,
  handleUploadPost,
  bindCrmStaffEventsCore,
  openLeadCreator,
  openLeadSettingsView,
  closeLeadSubview,
  saveLeadSettings,
  isLeadInlineCreateView,
  bindLeadInlineCreateEventsCore,
  deleteLeadFromModal,
  syncLeadDerivedFields,
  hydrateLeadGeoFieldsFromCoords,
  closeStaffEditor,
  openStaffEditor,
  syncStaffDerivedEmailField,
  normalizeCeoCountry,
  syncStaffFormFromDom,
  saveCeoStaffFromView,
  deleteCeoStaffFromView
});

chatRuntimeController = createChatRuntimeController({
  state,
  safeStorage,
  STORAGE_KEYS,
  chatIndexKey,
  toDateSafe,
  normalizeHandle,
  normalizeFollowHandle,
  compressImage,
  CHAT_ATTACHMENT_INLINE_MAX_BYTES,
  CHAT_MESSAGE_TTL_MS,
  CHAT_IMAGE_PREVIEW_COMPRESSION_STEPS,
  CHAT_MESSAGE_READ_LIMIT,
  db,
  collection,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  runTransaction,
  currentUserBadge,
  render,
  renderOverlays,
  updateNotificationBadges,
  saveNotifications,
  updateNotificationsDom,
  openPostModal,
  openChatWithProfile,
  openProfileFromUser,
  openGuestAuthPrompt,
  applyFollowingHandles,
  getFollowDocId,
  isLocalBusinessProfile,
  saveFollowing,
  businessProfileCache,
  findPostById,
  normalizeFeedPost,
  pushUserNotification,
  pushUserNotificationWithId,
  getPendingCommentHighlight: () => pendingCommentHighlight,
  setPendingCommentHighlight: (value) => {
    pendingCommentHighlight = value;
  },
  getLastRenderMode: () => lastRenderMode,
  escapeHtml,
  icon,
  formatRelative,
  getOptimizedImageUrl,
  getDocumentObj: () => (typeof document === "undefined" ? null : document),
  getWindowObj: () => (typeof window === "undefined" ? null : window),
  alertFn: (message) => alert(message),
  queueMicrotaskFn: (fn) => queueMicrotask(fn),
  setTimeoutFn: (fn, ms) => setTimeout(fn, ms)
});

crmRuntimeController = createCrmRuntimeController({
  state,
  icon,
  escapeHtml,
  isCeoUser,
  render,
  renderOverlays,
  renderCrmLazyLoadingView,
  renderCeoGuardCore,
  getLeadSettingsConfig,
  LEAD_SOCIAL_DEFAULT_PASSWORD,
  LEAD_SETTINGS_DEFAULT_COUNTRY,
  CEO_COUNTRIES,
  LEAD_TYPE_ORDER,
  LEAD_TYPE_LABELS,
  LEAD_STATUS_ORDER,
  LEAD_STATUS_LABELS,
  resolveCustomerType,
  normalizeSearchKey,
  normalizeLeadStatusKey,
  normalizeLeadScopeKey,
  normalizeCustomerScopeKey,
  createLeadScopeMap,
  createCustomerScopeMap,
  sanitizeCeoCrmCounts,
  hasStoredCeoCrmCounts,
  resolveKnownScopeCountLabel,
  leadStatusLabel,
  renderCeoScopeTabs,
  renderOwnershipPills,
  leadTypeLabel,
  customerStatusLabel,
  isCustomerRestaurant,
  toDateSafe,
  normalizeLeadLocations,
  getLeadCountryCenter,
  getLeadMonthlyPrice,
  buildLeadAccountEmail,
  hasLeadLocationCoords,
  normalizeLeadCountry,
  buildLeadContactName,
  getCurrentCeoMeta,
  normalizeHandle,
  getOptimizedImageUrl,
  isPlaceholderUrl,
  normalizeCeoCountry,
  PLACEHOLDER_IMAGE,
  CRM_LAZY_RENDERERS_MODULE_URL,
  enqueueMicrotaskCore,
  extractPlusCodeFromText,
  isLikelyShortPlusCode,
  parseCoordsFromAddressInputAsync,
  createLeadLocation,
  getPrimaryLeadLocation,
  resolveCoordsFromEntity,
  preferStableCoords,
  normalizeCoordPair,
  inferLeadCountryFromText,
  parseCoordsFromAddressInput,
  getLeadPriceForCycle,
  normalizeLeadSettings,
  setDoc,
  doc,
  db,
  serverTimestamp,
  saveUserProfileToStorage,
  ensureLeafletLoaded,
  getCeoGpsOverride,
  PRISHTINA_COORDS,
  alert: typeof alert === "function" ? alert : () => {},
  getApps,
  initializeApp,
  app,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  normalizeCeoPath,
  normalizeRestaurantType,
  hasGlobalCeoAccess,
  collection,
  query,
  where,
  limit,
  getDocs,
  getDoc,
  mergeRestaurants,
  rebuildBusinessLocations,
  canCurrentCeoSeeRow,
  isCurrentCeoOwnRow,
  ensureCeoCrmCountsLoaded,
  getCeoCrmCountsPromise: () => ceoCrmCountsPromise,
  readLeadScopeCache,
  writeLeadScopeCache,
  readCustomerScopeCache,
  writeCustomerScopeCache,
  CRM_PAGE_SIZE,
  dataLoaded,
  uniqueStringList,
  normalizeCeoStaffRecord,
  canViewCeoRecord,
  hydrateStaffRecordsFromUserProfiles,
  saveCeoStaffFromViewCore,
  uploadCompressedImage,
  buildCeoName,
  createEmptyCeoCrmCounts,
  saveLeadFromModalCore,
  deleteLeadFromModalCore,
  saveCustomerFromModalCore,
  convertLeadToCustomerCore,
  buildLeadCrmContribution,
  buildCustomerCrmContribution,
  resolveStoredCeoCreatorMeta,
  accumulateCeoCrmDelta,
  applyCeoCrmCountDeltas,
  closeLeadModal,
  closeCustomerModal,
  findRestaurantByUid,
  findRestaurantByEmail,
  normalizeEmailValue,
  normalizeRoleList,
  menuCache,
  menuCacheKey,
  focusCache,
  focusCacheKey,
  businessPostsKey,
  writeCache,
  saveFeedPosts,
  readCache,
  CACHE_KEYS,
  buildStoriesSignature,
  setFeedStoriesSignature: (next) => {
    feedStoriesSignature = next;
  },
  isAlbertCeoUser,
  buildCeoCreatorMeta,
  HIDDEN_LEGACY_CEO_EMAILS,
  MILAN_OWNED_LEAD_EMAILS,
  MILAN_OWNED_LEAD_BUSINESSES,
  ALBERT_OWNED_LEAD_EMAILS,
  ALBERT_OWNED_LEAD_BUSINESSES,
  confirm: typeof confirm === "function" ? confirm : () => false,
  deleteDoc
});

profileMenuFocusRenderController = createProfileMenuFocusRenderController({
  state,
  resolvePostCountsFn: resolvePostCounts,
  escapeHtmlFn: escapeHtml,
  getOptimizedImageUrlFn: getOptimizedImageUrl,
  iconFn: icon,
  isLocalBusinessProfileFn: isLocalBusinessProfile,
  normalizeHandleFn: normalizeHandle,
  logoFitClassFn: logoFitClass,
  formatCountFn: formatCount,
  renderProfileShopCartViewFn: renderProfileShopCartView,
  renderProfileShopFavoritesViewFn: renderProfileShopFavoritesView,
  ensureMenuDataForProfileFn: ensureMenuDataForProfile,
  ensureFocusDataForProfileFn: ensureFocusDataForProfile,
  isShopCatalogProfileFn: isShopCatalogProfile,
  getBusinessCatalogLabelFn: getBusinessCatalogLabel,
  normalizeMenuTypeFn: normalizeMenuType,
  primeMenuItemCountsFn: primeMenuItemCounts,
  renderShopProductListFn: renderShopProductList,
  getMenuLayoutThemeFn: getMenuLayoutTheme,
  menuLayoutColors: MENU_LAYOUT_COLORS,
  resolveMenuItemHeroFn: resolveMenuItemHero,
  isPlaceholderUrlFn: isPlaceholderUrl,
  placeholderImage: PLACEHOLDER_IMAGE,
  getFirebaseStorageUrlFn: getFirebaseStorageUrl,
  isDirectImageUrlFn: isDirectImageUrl,
  formatPriceFn: formatPrice,
  getMenuItemObjectPositionFn: getMenuItemObjectPosition,
  getMenuItemSocialIdFn: getMenuItemSocialId,
  menuItemMetaKeyFn: menuItemMetaKey,
  ensureMenuItemMetaFn: ensureMenuItemMeta,
  resolveMenuItemCountsFn: resolveMenuItemCounts,
  getFocusStateForRestaurantFn: getFocusStateForRestaurant,
  getFocusItemObjectPositionFn: getFocusItemObjectPosition,
  getFocusCardClassFn: getFocusCardClass,
  getFocusIndexFn: getFocusIndex,
  isRestaurantCafeProfileFn: isRestaurantCafeProfile,
  getRestaurantMetaByIdFn: getRestaurantMetaById,
  buildUrlFn: buildUrl,
  normalizeSearchKeyFn: normalizeSearchKey,
  normalizeFollowHandleFn: normalizeFollowHandle
});

shellRuntimeController = createShellRuntimeController();

async function pushUserNotification(targetUid, payload) {
  if (!targetUid) return;
  try {
    const ref = doc(collection(db, "users", targetUid, "notifications"));
    await setDoc(ref, buildNotificationWritePayloadCore({
      payload,
      serverTimestampValue: serverTimestamp()
    }));
  } catch (err) {
    console.error(err);
  }
}

async function pushUserNotificationWithId(targetUid, notificationId, payload) {
  const { targetUid: safeTargetUid, notificationId: safeNotificationId } = normalizeNotificationWriteIdsCore({
    targetUid,
    notificationId
  });
  if (!safeTargetUid || !safeNotificationId) return;
  try {
    await setDoc(doc(db, "users", safeTargetUid, "notifications", safeNotificationId), buildNotificationWritePayloadCore({
      payload,
      serverTimestampValue: serverTimestamp()
    }), { merge: true });
  } catch (err) {
    console.error(err);
  }
}

async function hasPendingFollowRequest(targetUid) {
  return chatRuntimeController.hasPendingFollowRequest(targetUid);
}

async function sendFollowRequest(handle, target = {}) {
  return chatRuntimeController.sendFollowRequest(handle, target);
}

async function acceptFollowRequest(notificationId) {
  return chatRuntimeController.acceptFollowRequest(notificationId);
}

async function markNotificationRead(id) {
  return chatRuntimeController.markNotificationRead(id);
}

async function markAllNotificationsRead() {
  return chatRuntimeController.markAllNotificationsRead();
}

function normalizeUserPostDoc(postId, data, ownerId) {
  return chatRuntimeController.normalizeUserPostDoc(postId, data, ownerId);
}

function normalizeRestaurantPostDoc(postId, data, restaurantId) {
  return chatRuntimeController.normalizeRestaurantPostDoc(postId, data, restaurantId);
}

async function fetchPostForNotification(notif) {
  return chatRuntimeController.fetchPostForNotification(notif);
}

function highlightCommentInModal(commentId) {
  return chatRuntimeController.highlightCommentInModal(commentId);
}

async function openPostFromNotification(notif) {
  return chatRuntimeController.openPostFromNotification(notif);
}

async function openNotificationTarget(id) {
  return chatRuntimeController.openNotificationTarget(id);
}

async function resolveUserByHandle(handle) {
  return chatRuntimeController.resolveUserByHandle(handle);
}

async function toggleFollow(handle, target = {}) {
  return chatRuntimeController.toggleFollow(handle, target);
}

function renderChatModal() {
  return renderChatModalCore({
    state,
    getOptimizedImageUrl,
    escapeHtml,
    icon,
    formatRelative,
    toDateSafe
  });
}

function isFollowingProfile(profile = {}) {
  const uid = String(profile?.uid || "").trim();
  if (uid && state.followingTargetIds.includes(uid)) return true;
  const followKey = normalizeFollowHandle(profile?.handle || "");
  return !!(followKey && state.followingHandles.includes(followKey));
}

let authPersistenceReady = null;
function ensureAuthLocalPersistence() {
  if (authPersistenceReady) return authPersistenceReady;
  authPersistenceReady = setPersistence(auth, browserLocalPersistence).catch(() => null);
  return authPersistenceReady;
}

function renderProfileModal() {
  return renderProfileModalCore({
    state,
    isFollowingProfile,
    getOptimizedImageUrl,
    formatCount,
    escapeHtml,
    icon
  });
}

function renderCommentItem(postId, comment, parentId = "") {
  return renderCommentItemCore({
    postId,
    comment,
    parentId,
    state,
    normalizeHandle,
    resolveCommentAvatar,
    getSelfAvatarUrl,
    isPlaceholderUrl,
    scheduleCommentAvatarFetch,
    placeholderImage: PLACEHOLDER_IMAGE,
    escapeHtml,
    formatDateTimeLabel,
    icon
  });
}

function renderPostComments(comments) {
  return renderPostCommentsCore({
    state,
    comments,
    hasLiveComments: typeof modalCommentsUnsub === "function",
    renderCommentItemFn: renderCommentItem
  });
}

function renderMenuCommentItem(comment) {
  return renderMenuCommentItemCore({
    comment,
    normalizeHandle,
    resolveCommentAvatar,
    isPlaceholderUrl,
    scheduleCommentAvatarFetch,
    placeholderImage: PLACEHOLDER_IMAGE,
    escapeHtml,
    formatDateTimeLabel
  });
}

function renderMenuDetailComments(comments) {
  return renderMenuDetailCommentsCore({
    state,
    comments,
    renderMenuCommentItemFn: renderMenuCommentItem
  });
}

function renderPostModal() {
  return renderPostModalCore({
    state,
    ensurePostMeta,
    resolvePostCounts,
    getOptimizedImageUrl,
    ensureCommentShape,
    currentUserBadge,
    renderPostComments,
    formatDateLabel,
    escapeHtml,
    icon
  });
}

function renderLikesModal() {
  return renderLikesModalCore({
    state,
    ensurePostMeta,
    findPostById,
    resolveLikeAvatar,
    escapeHtml,
    icon
  });
}

function renderLeadModal() {
  return renderLeadModalCore({
    state,
    getOptimizedImageUrl,
    PLACEHOLDER_IMAGE,
    resolveCustomerType,
    normalizeLeadStatusKey,
    normalizeLeadLocations,
    hasLeadLocationCoords,
    LEAD_TYPE_ORDER,
    LEAD_TYPE_LABELS,
    LEAD_STATUS_ORDER,
    LEAD_STATUS_LABELS,
    escapeHtml,
    icon
  });
}

function renderCustomerModal() {
  return renderCustomerModalCore({
    state,
    getOptimizedImageUrl,
    PLACEHOLDER_IMAGE,
    resolveCustomerType,
    normalizeLeadStatusKey,
    LEAD_TYPE_ORDER,
    LEAD_TYPE_LABELS,
    LEAD_STATUS_ORDER,
    LEAD_STATUS_LABELS,
    escapeHtml,
    icon
  });
}

function renderMenuItemModal() {
  return renderMenuItemModalCore({
    state,
    isShopCatalogProfile,
    getOptimizedImageUrl,
    PLACEHOLDER_IMAGE,
    isPlaceholderUrl,
    normalizeMenuType,
    getMenuModalCrop,
    escapeHtml,
    icon
  });
}

function renderMenuDetailModal() {
  return renderMenuDetailModalCore({
    state,
    getMenuItemImages,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    PLACEHOLDER_IMAGE,
    getFirebaseStorageUrl,
    isDirectImageUrl,
    formatPrice,
    getMenuDetailRestaurantId,
    getMenuDetailCatalogProfile,
    isShopCatalogProfile,
    normalizeMenuType,
    canAddToShopCart,
    getMenuItemSocialId,
    menuItemMetaKey,
    ensureMenuItemMeta,
    resolveMenuItemCounts,
    currentUserBadge,
    ensureCommentShape,
    getCartCountForRestaurant,
    renderMenuDetailComments,
    formatCount,
    getMenuItemObjectPosition,
    escapeHtml,
    icon
  });
}

function renderFocusModal() {
  return renderFocusModalCore({
    state,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    PLACEHOLDER_IMAGE,
    getFocusModalCrop,
    escapeHtml,
    icon
  });
}


function updatePostModalMeta() {
  if (!state.postModal.open || !state.postModal.post) return;
  updatePostModalCountsOnly();
  updatePostModalCommentsOnly();
}

function updatePostModalCountsOnly() {
  return updatePostModalCountsOnlyCore({
    state,
    documentObj: typeof document === "undefined" ? null : document,
    windowObj: typeof window === "undefined" ? null : window,
    ensurePostMetaFn: ensurePostMeta,
    currentUserBadgeFn: currentUserBadge,
    formatCountFn: formatCount,
    iconFn: icon
  });
}

function updatePostModalCommentsOnly() {
  return updatePostModalCommentsOnlyCore({
    state,
    documentObj: typeof document === "undefined" ? null : document,
    windowObj: typeof window === "undefined" ? null : window,
    ensurePostMetaFn: ensurePostMeta,
    ensureCommentShapeFn: ensureCommentShape,
    renderPostCommentsFn: renderPostComments,
    applyCommentAvatarCacheFn: applyCommentAvatarCache,
    hydrateCommentAvatarsFn: hydrateCommentAvatars,
    getPendingCommentHighlightFn: () => pendingCommentHighlight,
    setPendingCommentHighlightFn: (value) => {
      pendingCommentHighlight = value;
    },
    highlightCommentInModalFn: highlightCommentInModal
  });
}

function updateMenuDetailMeta() {
  if (!state.menuDetail.open || !state.menuDetail.item) return;
  updateMenuDetailCountsOnly();
  updateMenuDetailCommentsOnly();
}

function updateMenuDetailCountsOnly() {
  return updateMenuDetailCountsOnlyCore({
    state,
    documentObj: typeof document === "undefined" ? null : document,
    windowObj: typeof window === "undefined" ? null : window,
    getMenuDetailContextFn: getMenuDetailContext,
    ensureMenuItemMetaFn: ensureMenuItemMeta,
    resolveMenuItemCountsFn: resolveMenuItemCounts,
    currentUserBadgeFn: currentUserBadge,
    formatCountFn: formatCount,
    iconFn: icon
  });
}

function updateMenuDetailCommentsOnly() {
  return updateMenuDetailCommentsOnlyCore({
    state,
    documentObj: typeof document === "undefined" ? null : document,
    windowObj: typeof window === "undefined" ? null : window,
    getMenuDetailContextFn: getMenuDetailContext,
    ensureMenuItemMetaFn: ensureMenuItemMeta,
    ensureCommentShapeFn: ensureCommentShape,
    renderMenuDetailCommentsFn: renderMenuDetailComments,
    applyCommentAvatarCacheFn: applyCommentAvatarCache
  });
}

function updateCommentLikeButton(postId, commentId, replyId, likeCount) {
  if (!postId || !commentId) return;
  const safePost = escapeSelector(postId);
  const safeComment = escapeSelector(commentId);
  const selector = `[data-comment-like="true"][data-post-id="${safePost}"][data-comment-id="${safeComment}"]`;
  const replyKey = replyId ? String(replyId) : "";
  document.querySelectorAll(selector).forEach((btn) => {
    const btnReply = btn.getAttribute("data-reply-id") || "";
    if (replyKey !== btnReply) return;
    btn.innerHTML = `${icon("heart", "w-3 h-3")} ${escapeHtml(String(likeCount))}`;
  });
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function renderSettingsView() {
  return renderSettingsViewCore({
    state,
    icon,
    escapeHtml,
    logoFitClass,
    isLocalBusinessProfile,
    isCeoUser,
    resolveUserAvatar,
    PLACEHOLDER_IMAGE
  });
}

function renderNotificationsView() {
  return renderNotificationsViewCore({
    state,
    renderNotificationsListFn: renderNotificationsList
  });
}

function renderNotificationsList(items) {
  return renderNotificationsListCore({
    items,
    escapeHtml,
    resolveNotificationAvatar,
    icon
  });
}

function renderCrmLazyLoadingView(label = "CRM laden...") {
  return renderCrmLazyLoadingViewCore({
    label,
    icon,
    escapeHtml
  });
}

function queueCrmLazyRenderersPrefetch() {
  return crmRuntimeController.queueCrmLazyRenderersPrefetch();
}

function renderLeadsView() {
  return crmRuntimeController.renderLeadsView();
}

function isLeadInlineCreateView() {
  return crmRuntimeController.isLeadInlineCreateView();
}

function renderLeadEditorUi() {
  return crmRuntimeController.renderLeadEditorUi();
}

async function refineLeadLocationAddressIndex(index, value, { hydratePrimary = false } = {}) {
  return crmRuntimeController.refineLeadLocationAddressIndex(index, value, { hydratePrimary });
}

function renderLeadSettingsView() {
  return crmRuntimeController.renderLeadSettingsView();
}

function renderLeadCreationView() {
  return crmRuntimeController.renderLeadCreationView();
}

function resetLeadDraft() {
  return crmRuntimeController.resetLeadDraft();
}

function createLeadDraftState(mode = "create", lead = null) {
  return crmRuntimeController.createLeadDraftState(mode, lead);
}

function openLeadCreator() {
  return crmRuntimeController.openLeadCreator();
}

function openLeadSettingsView() {
  return crmRuntimeController.openLeadSettingsView();
}

function closeLeadSubview() {
  return crmRuntimeController.closeLeadSubview();
}

async function saveLeadSettings() {
  return crmRuntimeController.saveLeadSettings();
}

function getLeadPlusCodeReference(value = "") {
  return crmRuntimeController.getLeadPlusCodeReference(value);
}

async function hydrateLeadGeoFieldsFromCoords(coords, { sourceInputId = "" } = {}) {
  return crmRuntimeController.hydrateLeadGeoFieldsFromCoords(coords, { sourceInputId });
}

function syncLeadDerivedFields() {
  return crmRuntimeController.syncLeadDerivedFields();
}

function renderCustomersView() {
  return crmRuntimeController.renderCustomersView();
}

function renderStaffEditorView() {
  return crmRuntimeController.renderStaffEditorView();
}

function renderStaffView() {
  return crmRuntimeController.renderStaffView();
}

function renderOrdersView() {
  const isBusiness = isLocalBusinessProfile(state.userProfile) && !!state.userProfile.restaurantId;
  const orders = Array.isArray(state.orders.items) ? state.orders.items : [];
  return `
    <div id="ordersView" class="p-6 animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Orders</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Bestellungen</h2>
        </div>
      </div>
      ${state.orders.loading ? `
        <div class="text-center py-16 text-[10px] font-black uppercase tracking-widest text-slate-400">Bestellungen werden geladen...</div>
      ` : state.orders.error ? `
        <div class="text-center py-16 text-[10px] font-black uppercase tracking-widest text-rose-500">${escapeHtml(state.orders.error)}</div>
      ` : orders.length ? `
        <div class="space-y-4">
          ${orders.map((order) => {
            const avatarRaw = isBusiness ? order.buyerAvatar : order.businessAvatar;
            const avatarUrl = getOptimizedImageUrl(avatarRaw, "avatar");
            const fallbackName = isBusiness ? (order.contact.name || order.buyerName || "Kunde") : (order.businessName || "Shop");
            const metaLine = isBusiness
              ? [order.contact.phone, order.contact.city].filter(Boolean).join(" / ")
              : `${order.itemCount} Artikel`;
            return `
              <div class="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                    <img src="${escapeHtml(avatarUrl)}" class="w-full h-full ${isBusiness ? "object-cover" : "object-contain bg-white"}" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(fallbackName)}</p>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">${escapeHtml(metaLine)}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700">${escapeHtml(order.status || "Neu")}</span>
                </div>
                <div class="space-y-2">
                  ${order.items.slice(0, 3).map((item) => `
                    <div class="flex items-center justify-between text-sm">
                      <span class="font-semibold text-slate-700 truncate pr-3">${escapeHtml(item.quantity)}x ${escapeHtml(item.name)}${item.selectedSize || item.selectedColor ? ` <span class="text-slate-400">(${escapeHtml([item.selectedSize, item.selectedColor].filter(Boolean).join(" / "))})</span>` : ""}</span>
                      <span class="font-black text-slate-900">${escapeHtml(formatPrice(parsePriceValue(item.price) * item.quantity))}</span>
                    </div>
                  `).join("")}
                  ${order.items.length > 3 ? `<p class="text-[10px] font-bold uppercase tracking-widest text-slate-300">+${escapeHtml(order.items.length - 3)} weitere</p>` : ""}
                </div>
                <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    ${isBusiness ? `<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">${escapeHtml([order.contact.city, order.contact.address].filter(Boolean).join(" / "))}</p>` : `<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">@${escapeHtml(order.buyerHandle || "user")}</p>`}
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-1">${escapeHtml(formatRelative(toDateSafe(order.createdAt) || new Date()))}</p>
                  </div>
                  <span class="text-base font-black text-slate-900 shrink-0">${escapeHtml(formatPrice(order.total))}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : `
        <div class="text-center py-16 text-[10px] font-black uppercase tracking-widest text-slate-300">Noch keine Bestellungen</div>
      `}
    </div>
  `;
}

function renderUploadView() {
  const profile = state.userProfile;
  const uploadMode = storySystemController.normalizeUploadIntent(state.upload.mode, { fallback: "feed" });
  if (uploadMode === "chooser") {
    return `
      <div class="p-6 animate-in slide-in-from-bottom-10 duration-700 min-h-[70vh] flex flex-col">
        <header class="flex items-center justify-between mb-8">
          <button data-nav="feed" class="p-3 rounded-2xl bg-slate-100 text-slate-500">${icon("arrow-left", "w-4 h-4")}</button>
          <h2 class="text-xl font-black italic uppercase text-slate-900">Post waehlen</h2>
          <div class="w-10"></div>
        </header>
        ${storySystemController.renderUploadChooserView({ profile })}
      </div>
    `;
  }

  const isStoryMode = uploadMode === "story";
  const selectedUploadMediaType = detectUploadMediaType(state.upload.file);
  const isVideoPreview = selectedUploadMediaType === "video";
  const previewUrl = isVideoPreview
    ? String(state.upload.preview || "").trim()
    : getOptimizedImageUrl(state.upload.preview, "large");
  const uploadAccept = isStoryMode ? "image/*,video/*" : "image/*";
  return `
    <div class="p-6 animate-in slide-in-from-bottom-10 duration-700 min-h-[70vh] flex flex-col">
      <header class="flex items-center justify-between mb-8">
        <button data-nav="feed" class="p-3 rounded-2xl bg-slate-100 text-slate-500">${icon("arrow-left", "w-4 h-4")}</button>
        <h2 class="text-xl font-black italic uppercase text-slate-900">${isStoryMode ? "Neue Story" : "Neuer Post"}</h2>
        <div class="w-10"></div>
      </header>
      <input type="file" id="uploadFileInput" class="hidden" accept="${uploadAccept}" />
      ${state.upload.preview ? `
        <div class="space-y-6">
          ${isVideoPreview
            ? `<video src="${escapeHtml(previewUrl)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg bg-black" autoplay muted loop playsinline preload="metadata"></video>`
            : `<img src="${escapeHtml(previewUrl)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg" />`
          }
          <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
            <textarea id="uploadCaption" placeholder="${isStoryMode ? "Story Text..." : "Bildunterschrift..."}" class="w-full bg-transparent text-sm font-medium outline-none resize-none" rows="2">${escapeHtml(state.upload.caption)}</textarea>
          </div>
          <button id="uploadPostBtn" class="w-full bg-indigo-600 text-white py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30">${state.upload.status || (isStoryMode ? "Story posten" : "Posten")}</button>
          <div class="text-center text-[10px] font-bold text-slate-400">${escapeHtml(state.upload.status)}</div>
        </div>
      ` : `
        <div id="uploadFileTrigger" class="flex-1 flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed p-8 text-center cursor-pointer transition-all border-slate-200 bg-white">
          <div class="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6">${icon("upload", "w-8 h-8")}</div>
          <h3 class="text-lg font-black mb-2 italic text-slate-900">${isStoryMode ? "Foto oder Video waehlen" : "Foto waehlen"}</h3>
          <p class="text-sm font-medium text-slate-500">Posten als ${isStoryMode ? "Business (Story)" : (isLocalBusinessProfile(profile) ? "Business (Feed)" : "User (Profil)")}</p>
        </div>
      `}
    </div>
  `;
}

function renderChatMessagesPanel({
  messages,
  blockedByOwner,
  mutedActive,
  muteUntilLabel,
  partnerName
} = {}) {
  return chatRuntimeController.renderChatMessagesPanel({
    messages,
    blockedByOwner,
    mutedActive,
    muteUntilLabel,
    partnerName
  });
}

function renderChatPendingAttachments(pendingAttachments) {
  return chatRuntimeController.renderChatPendingAttachments(pendingAttachments);
}

function renderChatListPanel({
  scope = "inbox",
  inboxThreads = [],
  archivedThreads = [],
  visibleThreads = [],
  chatThreadMenuId = state.chatThreadMenuId
} = {}) {
  return chatRuntimeController.renderChatListPanel({
    scope,
    inboxThreads,
    archivedThreads,
    visibleThreads,
    chatThreadMenuId
  });
}

function renderChatView() {
  return chatRuntimeController.renderChatView();
}

function renderHeaderActionButton(avatarUrl, avatarFit) {
  return shellRuntimeController.renderHeaderActionButton(avatarUrl, avatarFit);
}

function renderHeader() {
  return shellRuntimeController.renderHeader();
}

function renderBusinessTopTabs() {
  return shellRuntimeController.renderBusinessTopTabs();
}

function renderMain() {
  return renderMainCore({
    state,
    renderFeedViewFn: renderFeedView,
    renderChatViewFn: renderChatView,
    renderSearchViewFn: renderSearchView,
    renderMapViewFn: renderMapView,
    renderPublicProfileViewFn: renderPublicProfileView,
    renderProfileViewFn: renderProfileView,
    renderMenuAdminViewFn: renderMenuAdminView,
    renderOrdersViewFn: renderOrdersView,
    renderLeadsViewFn: renderLeadsView,
    renderStaffViewFn: renderStaffView,
    renderCustomersViewFn: renderCustomersView,
    renderSettingsViewFn: renderSettingsView,
    renderNotificationsViewFn: renderNotificationsView,
    renderUploadViewFn: renderUploadView,
    renderDrawerFn: renderDrawer,
    renderHeaderFn: renderHeader,
    renderBusinessTopTabsFn: renderBusinessTopTabs
  });
}

function bindImageFallbacks(root = document) {
  return shellRuntimeController.bindImageFallbacks(root);
}

function render() {
  return shellRuntimeController.render();
}

function bindAuthEvents() {
  return shellRuntimeController.bindAuthEvents();
}

function bindCrmAutoLoadObserver() {
  return shellRuntimeController.bindCrmAutoLoadObserver();
}

function bindAppEvents() {
  return shellRuntimeController.bindAppEvents();
}

function bindSearchEvents() {
  return shellRuntimeController.bindSearchEvents();
}

async function uploadCompressedImage(file, ownerId, { maxSize, quality, mimeType }) {
  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error("Max 15MB pro Bild.");
  if (!String(file.type || "").startsWith("image/")) throw new Error("Nur Bilder erlaubt.");

  const compressedFile = await compressImage(file, maxSize, quality, mimeType);

  const form = new FormData();
  form.append("file", compressedFile, compressedFile.name || "image.jpg");
  form.append("restaurantId", ownerId || "");

  const res = await fetch(`${BUNNY_EDGE_BASE}/image/upload`, {
    method: "POST",
    body: form
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) throw new Error(data?.error || "Upload fehlgeschlagen.");
  return {url: String(data.url), cdnUrl: String(data.cdnUrl) };
}

function detectUploadMediaType(file) {
  const mime = String(file?.type || "").trim().toLowerCase();
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("image/")) return "image";
  return "";
}

async function uploadRawMediaFile(file, ownerId, { maxBytes = 50 * 1024 * 1024 } = {}) {
  if (!file) throw new Error("Datei fehlt.");
  if (file.size > maxBytes) throw new Error("Max 50MB pro Story Video.");
  const form = new FormData();
  form.append("file", file, file.name || "media");
  form.append("restaurantId", ownerId || "");
  const res = await fetch(`${BUNNY_EDGE_BASE}/story/upload`, {
    method: "POST",
    body: form
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) throw new Error(data?.error || "Upload fehlgeschlagen.");
  const cdnUrl = String(data.cdnUrl || data.url || "").trim();
  const videoId = String(data.videoId || "").trim();
  return { url: String(data.url || "").trim(), cdnUrl, videoId };
}

function releaseUploadPreviewUrl(previewUrl = "") {
  const url = String(previewUrl || "").trim();
  if (!url || !url.startsWith("blob:")) return;
  if (typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") return;
  try {
    URL.revokeObjectURL(url);
  } catch {}
}

async function uploadAvatar(file) {
  if (!state.user) return;
  try {
    const isBusiness = isLocalBusinessProfile(state.userProfile);
    const ownerId = isBusiness ? state.userProfile.restaurantId : state.user.uid;
    const { cdnUrl } = await uploadCompressedImage(file, ownerId, { maxSize: 512, quality: 0.80, mimeType: 'image/jpeg'});
    if (isBusiness && state.userProfile.restaurantId) {
      await setDoc(doc(db, "restaurants", state.userProfile.restaurantId), {
        logoUrl: cdnUrl,
        logo: cdnUrl,
        updatedAt: serverTimestamp()
      }, { merge: true });
      const rest = state.restaurants.find((r) => String(r.id) === String(state.userProfile.restaurantId)) || {};
      await ensureRestaurantPublicMeta(state.userProfile.restaurantId, {
        name: rest.name || rest.restaurantName || state.userProfile.name,
        restaurantName: rest.restaurantName || rest.name || state.userProfile.name,
        type: rest.type || rest.customerType || "cafe",
        city: rest.city || state.userProfile.location || "",
        logoUrl: cdnUrl,
        logo: cdnUrl
      });
      state.restaurants = mergeRestaurants(state.restaurants, [{
        id: state.userProfile.restaurantId,
        ...rest,
        logoUrl: cdnUrl,
        logo: cdnUrl
      }]);
      rebuildBusinessLocations();
    } else {
      await setDoc(doc(db, "users", state.user.uid), {
        avatarUrl: cdnUrl,
        avatar: cdnUrl,
        updatedAt: serverTimestamp()
      }, { merge: true });
      await syncCeoDirectoryProfilePatch({
        avatarUrl: cdnUrl
      });
    }
    state.userProfile.avatar = cdnUrl;
    saveUserProfileToStorage();
    primeSelfAvatarCache(getOptimizedImageUrl(cdnUrl, "avatar"));
    refreshSelfCommentAvatars();
    render();
  } catch (err) {
    console.error(err);
  }
}

function ensureLocationPickerModal() {
  return crmRuntimeController.ensureLocationPickerModal();
}

function bindLocationPickerEvents() {
  return crmRuntimeController.bindLocationPickerEvents();
}

async function openLocationPicker({ addressInputId = "settingsAddress", coordsDisplayId = "coordsDisplay", context = "settings" } = {}) {
  return crmRuntimeController.openLocationPicker({ addressInputId, coordsDisplayId, context });
}

function closeLocationPicker() {
  return crmRuntimeController.closeLocationPicker();
}

async function confirmLocation() {
  return crmRuntimeController.confirmLocation();
}

function getVerifiedMapLocation() {
  return crmRuntimeController.getVerifiedMapLocation();
}

function clearVerifiedMapLocation() {
  return crmRuntimeController.clearVerifiedMapLocation();
}

async function saveAccountSettings() {
  if (!state.user) return;
  const name = document.getElementById("settingsName")?.value?.trim() || state.userProfile.name || "User";
  const handle = document.getElementById("settingsHandle")?.value?.trim() || state.userProfile.handle || normalizeHandle(name);
  const bio = document.getElementById("settingsBio")?.value?.trim() || "";
  const city = document.getElementById("settingsCity")?.value?.trim() || "Prishtina";
  const address = document.getElementById("settingsAddress")?.value?.trim() || "";
  const restaurantId = state.userProfile.restaurantId || ""; // Fix: Verlinkung wurde entfernt, bleibt also der bestehende State
  const allowCeoOverride = isCeoUser();
  const verifiedMapLocation = getVerifiedMapLocation();
  const gpsCoords = verifiedMapLocation
    ? { lat: Number(verifiedMapLocation.lat), lng: Number(verifiedMapLocation.lng) }
    : null;
  const fallbackCeoCoords = allowCeoOverride ? getCeoGpsOverride() : null;
  const effectiveGps = gpsCoords
    || (fallbackCeoCoords && Number.isFinite(Number(fallbackCeoCoords.lat)) && Number.isFinite(Number(fallbackCeoCoords.lng))
      ? { lat: Number(fallbackCeoCoords.lat), lng: Number(fallbackCeoCoords.lng) }
      : null);
  
  const statusEl = document.getElementById("settingsStatus");
  if (statusEl) statusEl.textContent = "Speichere Profil...";

  try {
    const isBusiness = isLocalBusinessProfile(state.userProfile);
    if (isBusiness && restaurantId) {
      const restPayload = {
        name,
        restaurantName: name,
        handle,
        bio,
        description: bio,
        city,
        address,
        updatedAt: serverTimestamp()
      };
      if (effectiveGps && Number.isFinite(effectiveGps.lat) && Number.isFinite(effectiveGps.lng)) {
        restPayload.lat = effectiveGps.lat;
        restPayload.lng = effectiveGps.lng;
      }
      await setDoc(doc(db, "restaurants", restaurantId), restPayload, { merge: true });
      const rest = state.restaurants.find((r) => String(r.id) === String(restaurantId)) || {};
      await ensureRestaurantPublicMeta(restaurantId, {
        name,
        restaurantName: name,
        type: rest.type || rest.customerType || "cafe",
        city,
        logoUrl: rest.logoUrl || rest.logo || "",
        logo: rest.logo || rest.logoUrl || ""
      });
      state.restaurants = mergeRestaurants(state.restaurants, [{ id: restaurantId, ...rest, ...restPayload }]);
      rebuildBusinessLocations();
    } else {
      const payload = {
        displayName: name,
        handle,
        bio,
        city,
        restaurantId,
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, "users", state.user.uid), payload, { merge: true });
      await syncCeoDirectoryProfilePatch({
        name,
        displayName: name,
        handle,
        city,
        locationLabel: city,
        ...(effectiveGps && Number.isFinite(effectiveGps.lat) && Number.isFinite(effectiveGps.lng) ? {
          lat: effectiveGps.lat,
          lng: effectiveGps.lng,
          gpsLat: effectiveGps.lat,
          gpsLng: effectiveGps.lng
        } : {})
      });
    }

    if (allowCeoOverride) {
      const userGpsPayload = {
        handle,
        city,
        address,
        updatedAt: serverTimestamp()
      };
      if (effectiveGps && Number.isFinite(effectiveGps.lat) && Number.isFinite(effectiveGps.lng)) {
        userGpsPayload.lat = effectiveGps.lat;
        userGpsPayload.lng = effectiveGps.lng;
        userGpsPayload.gpsLat = effectiveGps.lat;
        userGpsPayload.gpsLng = effectiveGps.lng;
      }
      await setDoc(doc(db, "users", state.user.uid), userGpsPayload, { merge: true });
    }

    await updateProfile(state.user, { displayName: name });
    state.userProfile = {
      ...state.userProfile,
      name,
      handle,
      bio,
      location: city,
      address,
      restaurantId
    };
    if (effectiveGps && Number.isFinite(effectiveGps.lat) && Number.isFinite(effectiveGps.lng)) {
      state.userProfile.lat = effectiveGps.lat;
      state.userProfile.lng = effectiveGps.lng;
      if (allowCeoOverride) {
        state.userProfile.gpsLat = effectiveGps.lat;
        state.userProfile.gpsLng = effectiveGps.lng;
      }
    }

    saveUserProfileToStorage();
    attachCurrentUserProfileListener();
    
    if (statusEl) statusEl.textContent = "Erfolgreich gespeichert!";
    setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 2000);
  } catch (err) {
    console.error(err);
    if (statusEl) statusEl.textContent = "Fehler beim Speichern.";
  }
}

async function persistPrivateAccountSetting(value) {
  if (!state.user?.uid) return;
  try {
    await setDoc(doc(db, "users", state.user.uid), {
      privateAccount: !!value,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error(err);
  }
}

async function handleUploadPost() {
  if (!state.user || !state.upload.file) return;

  const caption = document.getElementById("uploadCaption")?.value?.trim() || "";
  const uploadMode = storySystemController.normalizeUploadIntent(state.upload.mode, { fallback: "feed" });
  if (uploadMode === "chooser") {
    state.upload.status = "Bitte zuerst Story oder Feed waehlen.";
    render();
    return;
  }
  const isStoryMode = uploadMode === "story";
  const isBusiness = isLocalBusinessProfile(state.userProfile);
  const restaurantId = state.userProfile.restaurantId || document.getElementById("uploadRestaurantSelect")?.value || "";

  if (isBusiness && !restaurantId) {
    state.upload.status = "Bitte Business im Account waehlen.";
    render();
    return;
  }
  if (isStoryMode && (!isBusiness || !restaurantId)) {
    state.upload.status = "Story Upload nur mit Business Profil moeglich.";
    render();
    return;
  }

  try {
    state.upload.status = "Upload startet.";
    render();

    const ownerId = isBusiness ? restaurantId : state.user.uid;
    const mediaType = detectUploadMediaType(state.upload.file);
    if (!mediaType) {
      state.upload.status = "Nur Bild oder Video moeglich.";
      render();
      return;
    }
    if (!isStoryMode && mediaType !== "image") {
      state.upload.status = "Feed Upload nur mit Bild moeglich.";
      render();
      return;
    }

    const uploadResult = mediaType === "video"
      ? await uploadRawMediaFile(state.upload.file, ownerId)
      : await uploadCompressedImage(state.upload.file, ownerId, { maxSize: 1080, quality: 0.78, mimeType: "image/jpeg" });
    const cdnUrl = String(uploadResult?.cdnUrl || uploadResult?.url || "").trim();
    if (!cdnUrl) throw new Error("Upload fehlgeschlagen.");

    if (isStoryMode) {
      await storySystemController.createBusinessStory({
        restaurantId,
        caption,
        mediaUrl: cdnUrl,
        mediaType,
        createdByUid: state.user.uid
      });
      await loadStoriesForFeed({ force: true, refreshUi: true });
    } else if (isBusiness) {
      await createBusinessPost({
        restaurantId,
        caption,
        mediaUrl: cdnUrl,
        mediaType: "image"
      });
      await loadFeedPosts({ force: true });
      await loadBusinessPosts({ force: true });
    } else {
      await createUserPost({
        uid: state.user.uid,
        caption,
        url: cdnUrl
      });
      await loadUserPosts({ force: true });
    }

    releaseUploadPreviewUrl(state.upload.preview);
    state.upload = { preview: "", caption: "", file: null, status: "", mode: "feed" };
    setState({ activeTab: isBusiness ? "feed" : "profile" });
  } catch (err) {
    console.error(err);
    state.upload.status = err?.message || "Upload fehlgeschlagen.";
    render();
  }
}

async function createBusinessPost({ restaurantId, caption, mediaUrl, mediaType }) {
  const base = state.restaurants.find((r) => r.id === restaurantId) || {};
  const postRef = doc(collection(db, "restaurants", restaurantId, "socialPosts"));
  const postId = postRef.id;

  const payload = {
    postType: "food",
    caption,
    media: [{
      url: mediaUrl,
      type: mediaType,
      thumbUrl: mediaType === "image" ? mediaUrl : ""
    }],
    city: base.city || "Prishtina",
    createdAt: serverTimestamp(),
    createdByUid: state.user?.uid || "",
    likesCount: 0,
    commentsCount: 0,
    status: "active"
  };

  const feedPayload = {
    rid: restaurantId,
    postType: payload.postType,
    city: payload.city,
    createdAt: serverTimestamp(),
    captionShort: caption.slice(0, 90),
    thumbUrl: mediaType === "image" ? mediaUrl : "",
    mediaType,
    likesCount: 0,
    commentsCount: 0,
    status: "active",
    businessName: base.name || base.restaurantName || ""
  };

  await setDoc(postRef, payload);
  await setDoc(doc(db, "socialFeed", postId), feedPayload, { merge: true });
}

async function createUserPost({ uid, caption, url }) {
  const postRef = doc(collection(db, "users", uid, "posts"));
  await setDoc(postRef, {
    url,
    caption,
    type: "square",
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp()
  });
}

async function loadUserProfile(user, { force = false } = {}) {
  if (!user) return;
  const ensured = await ensureUserProfile(user, { city: "Prishtina" });
  void force;
  const data = ensured && typeof ensured === "object" ? ensured : {};
  const prevAvatar = state.userProfile?.avatar || "";
  const normalized = normalizeProfile(data, user);
  const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
  if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) normalized.avatar = prevAvatar;
  state.userProfile = normalized;
  state.userProfile.uid = user.uid;
  syncPrivateSettingFromProfile(normalized.privateAccount);
  saveUserProfileToStorage();
  attachCurrentUserProfileListener();
  const resolvedAvatar = getOptimizedImageUrl(state.userProfile.avatar || "", "avatar");
  if (!isPlaceholderUrl(resolvedAvatar)) {
    userAvatarCache = resolvedAvatar;
    scheduleAvatarCacheWrite(resolvedAvatar);
    if (state.user?.uid) {
      commentAvatarCache.set(state.user.uid, resolvedAvatar);
      updateCommentAvatarNodesByUid(state.user.uid, resolvedAvatar);
    }
    const handleKey = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
    if (handleKey) {
      commentAvatarCache.set(handleKey, resolvedAvatar);
      updateCommentAvatarNodes(handleKey, resolvedAvatar);
    }
  }
  if (lastRenderMode === "main") {
    updateShellDom();
    if (state.activeTab === "search" && refreshSearchView()) return normalized;
    if (state.activeTab === "feed") {
      const updatedFeed = updateFeedDom();
      if (!updatedFeed) render();
      return normalized;
    }
  }
  render();
  return normalized;
}

async function loadBusinessProfile(user, { restaurant = null, force = false } = {}) {
  if (!user) return;
  const rest = restaurant || await resolveRestaurantForAuthUser(user, { preferCached: !force });
  if (!rest || isRestaurantMarkedDeleted(rest)) {
    await loadUserProfile(user, { force });
    return;
  }
  const prevAvatar = state.userProfile?.avatar || "";
  const normalized = normalizeBusinessProfile(rest, user);
  normalized.uid = user.uid;
  const normalizedResolved = getOptimizedImageUrl(normalized.avatar || "", "avatar");
  if ((!normalized.avatar || isPlaceholderUrl(normalizedResolved)) && prevAvatar) normalized.avatar = prevAvatar;
  if (!Number.isFinite(Number(rest.followingCount ?? rest.following))) {
    normalized.following = state.userProfile?.following ?? normalized.following;
  }
  if (!Number.isFinite(Number(rest.followersCount ?? rest.followers))) {
    normalized.followers = state.userProfile?.followers ?? normalized.followers;
  }
  state.userProfile = normalized;
  state.userProfile.uid = user.uid;
  syncPrivateSettingFromProfile(false);
  saveUserProfileToStorage();
  attachCurrentUserProfileListener();
  const resolvedAvatar = getOptimizedImageUrl(state.userProfile.avatar || "", "avatar");
  if (!isPlaceholderUrl(resolvedAvatar)) {
    primeSelfAvatarCache(resolvedAvatar);
  }
  if (rest?.id) {
    state.restaurants = mergeRestaurants(state.restaurants, [{ id: rest.id, ...rest }]);
    rebuildBusinessLocations();
  }
  if (lastRenderMode === "main") {
    updateShellDom();
    if (state.activeTab === "search" && refreshSearchView()) return;
    if (state.activeTab === "feed") {
      const updatedFeed = updateFeedDom();
      if (!updatedFeed) render();
      return;
    }
  }
  render();
}

async function loadAuthProfile(user, { force = false } = {}) {
  return loadAuthProfileCore({
    user,
    force,
    state,
    normalizeRoleList,
    isRestaurantMarkedDeleted,
    resolveRestaurantForAuthUser,
    resolveLeadByUid,
    findRestaurantByLeadId,
    ensureRestaurantForLead,
    resolveLeadByEmail,
    getDoc,
    doc,
    db,
    serverTimestamp,
    setDoc,
    loadBusinessProfile,
    loadUserProfile
  });
}

function stopRestaurantsListener() {
  if (restaurantsUnsub) {
    restaurantsUnsub();
    restaurantsUnsub = null;
  }
}

async function loadRestaurants({ force = false } = {}) {
  return sessionDataRuntimeController.loadRestaurants(...arguments);
}

function canShowFeedRestaurantId(restaurantId) {
  const rid = String(restaurantId || "").trim();
  if (!rid) return true;
  if (isForceHiddenUid(rid) || isForceHiddenHandle(rid)) return false;
  const restaurant = state.restaurants.find((row) => String(row?.id || "") === rid) || null;
  if (!restaurant) return true;
  return isPublicBusinessRecord(restaurant);
}

function normalizeFeedPost(row) {
  const restaurantId = String(row.rid || row.restaurantId || "").trim();
  if (isForceHiddenBusinessEntity({ id: restaurantId, restaurantId, ...row })) return null;
  if (!canShowFeedRestaurantId(restaurantId)) return null;
  const restaurant = state.restaurants.find((r) => r.id === restaurantId) || {};
  const thumb = row.thumbUrl || row.mediaUrl || row.media?.[0]?.thumbUrl || row.media?.[0]?.url || "";
  const rowLogo = row.logoUrl || row.logo || row.logoURL || "";
  const caption = row.caption || row.captionShort || "";
  return {
    id: row.id,
    restaurantId,
    business: row.businessName || row.restaurantName || restaurant.name || restaurant.restaurantName || "Business",
    logo: restaurant.logoUrl || restaurant.logo || rowLogo || "",
    location: row.city || restaurant.city || "Prishtina",
    content: caption,
    image: thumb || "",
    likes: row.likesCount || "0",
    comments: row.commentsCount || "0",
    time: formatRelative(toDateSafe(row.createdAt)),
    createdAt: row.createdAt,
    category: row.postType || "food",
    isLive: row.isLive || false,
    ownerType: "restaurant",
    ownerId: restaurantId
  };
}

function buildStoriesFromFeed(posts) {
  if (!Array.isArray(posts)) return [];
  const map = new Map();
  posts.forEach((post) => {
    const rid = String(post.restaurantId || post.ownerId || "").trim();
    if (!rid || map.has(rid) || !canShowFeedRestaurantId(rid)) return;
    const renderIdentity = resolveStoryRenderIdentity({
      restaurantId: rid,
      name: post.business || post.restaurantName || "",
      img: post.logo || "",
      isLive: false
    });
    map.set(rid, {
      id: rid,
      restaurantId: rid,
      name: sanitizeStoryBusinessName(renderIdentity.storyLabel || ""),
      img: String(renderIdentity.logoSource || "").trim(),
      isLive: false
    });
  });
  return Array.from(map.values()).slice(0, FAST_LIMITS.stories);
}

function buildStoriesRowSignature(items) {
  return buildStoriesSignature(items || []);
}

function normalizeExternalProfile({ profileDoc, restaurant, fallbackName, posts }) {
  const data = profileDoc?.data || profileDoc || {};
  const rest = restaurant || {};
  const displayName = data?.displayName || data?.name || rest?.name || rest?.restaurantName || fallbackName || "Business";
  const handle = resolvePreferredHandle({ handle: data?.handle || rest?.handle || "", name: displayName }, displayName);
  const followers = data?.followersCount ?? data?.followers ?? rest?.followersCount ?? rest?.followers ?? 0;
  const following = data?.followingCount ?? data?.following ?? rest?.followingCount ?? rest?.following ?? 0;
  const restaurantId = data?.restaurantId || rest?.id || "";
  const type = normalizeRestaurantType(
    data?.type
    || data?.customerType
    || rest?.type
    || rest?.customerType
    || rest?.category
    || rest?.kind
    || rest?.restaurantType
    || ""
  );
  return {
    name: displayName,
    handle: handle || normalizeHandle(displayName),
    uid: data?.uid || rest?.ownerUid || profileDoc?.id || "",
    bio: data?.bio || rest?.description || rest?.bio || `Offizieller Account auf ${BRAND_UI.social}.`,
    avatar: data?.avatarUrl || data?.avatar || rest?.logoUrl || rest?.logo || "",
    location: data?.city || rest?.city || "Kosovo",
    followers,
    following,
    privateAccount: false,
    role: "business",
    restaurantId,
    ...(type ? { type, customerType: type } : {}),
    pendingFollowRequest: false,
    posts: posts || []
  };
}

function normalizeExternalUserProfile({ userDoc, fallback, posts }) {
  const data = typeof userDoc?.data === "function" ? userDoc.data() : (userDoc?.data || userDoc || {});
  const fallbackName = fallback?.name || fallback?.handle || "User";
  const displayName = sanitizeDisplayName(data?.displayName || data?.name, fallbackName);
  const handle = data?.handle || normalizeHandle(displayName || fallbackName);
  return {
    name: displayName || fallbackName,
    handle: handle || "user",
    uid: userDoc?.id || data?.uid || fallback?.uid || "",
    bio: data?.bio || fallback?.bio || "",
    avatar: data?.avatarUrl || data?.avatar || fallback?.avatar || '',
    location: data?.city || fallback?.location || "Prishtina",
    followers: data?.followersCount ?? data?.followers ?? fallback?.followers ?? 0,
    following: data?.followingCount ?? data?.following ?? fallback?.following ?? 0,
    privateAccount: !!data?.privateAccount,
    role: data?.role || fallback?.role || "user",
    pendingFollowRequest: false,
    posts: posts || []
  };
}

async function fetchBusinessProfileDoc({ restaurantId, restaurant }) {
  const rest = restaurant || (restaurantId ? state.restaurants.find((r) => r.id === restaurantId) : null) || null;
  if (rest?.id) {
    if (!isPublicBusinessRecord(rest)) return null;
    return { id: rest.id, data: rest };
  }
  const restId = restaurantId || rest?.id || "";
  if (!restId) return null;
  try {
    const snap = await getDoc(doc(db, "restaurants", restId));
    if (snap.exists()) {
      const data = snap.data() || {};
      if (!isPublicBusinessRecord({ id: snap.id, ...data })) return null;
      return { id: snap.id, data };
    }
  } catch {}
  return null;
}

async function loadBusinessPostsForRestaurant(restaurantId) {
  if (!restaurantId) return [];
  try {
    const ref = collection(db, "restaurants", restaurantId, "socialPosts");
    let snap = null;
    try {
      snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(FAST_LIMITS.businessPosts)));
    } catch (err) {
      snap = await getDocs(ref);
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    return rows
      .filter((row) => (row.status || "active") === "active")
      .map((row) => ({
        id: row.id,
        url: row.media?.[0]?.url || row.mediaUrl || "",
        type: row.type || "square",
        title: "",
        caption: row.caption || "",
        createdAt: row.createdAt,
        likes: row.likesCount ?? row.likes ?? 0,
        comments: row.commentsCount ?? row.comments ?? 0,
        isVideo: row.media?.[0]?.type === "video",
        ownerType: "restaurant",
        ownerId: restaurantId,
        restaurantId
      }))
      .filter((row) => row.url);
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadFeedPosts({ force = false } = {}) {
  return sessionDataRuntimeController.loadFeedPosts(...arguments);
}

async function loadUserPostsForUser(uid) {
  if (!uid) return [];
  try {
    const ref = collection(db, "users", uid, "posts");
    let snap = null;
    try {
      snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(FAST_LIMITS.userPosts)));
    } catch (err) {
      snap = await getDocs(ref);
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    return rows
      .map((row) => ({
        id: row.id,
        url: row.url || row.mediaUrl || row.media?.[0]?.url || "",
        type: row.type || "square",
        title: "",
        caption: row.caption || "",
        createdAt: row.createdAt,
        likes: row.likesCount ?? row.likes ?? 0,
        comments: row.commentsCount ?? row.comments ?? 0,
        isVideo: row.media?.[0]?.type === "video",
        ownerType: "user",
        ownerId: uid
      }))
      .filter((row) => row.url);
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadUserPosts({ force = false } = {}) {
  return sessionDataRuntimeController.loadUserPosts(...arguments);
}

async function loadBusinessPosts({ force = false } = {}) {
  return sessionDataRuntimeController.loadBusinessPosts(...arguments);
}

async function loadPublicMenuItems(restaurantId) {
  if (!restaurantId) return [];
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId, "public", "menu"));
    if (!snap.exists()) return [];
    const data = snap.data() || {};
    const items = coerceMenuItemsFromData(data);
    return items;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadLegacyMenuItems(restaurantId) {
  if (!restaurantId) return [];
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId));
    if (!snap.exists()) return [];
    const data = snap.data() || {};
    return coerceMenuItemsFromData(data);
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadMenuItemsFromCollection(restaurantId) {
  if (!restaurantId) return [];
  try {
    const ref = collection(db, "restaurants", restaurantId, "menuItems");
    const snap = await getDocs(ref);
    return snap.docs.map((docSnap) => normalizeMenuItemDoc(docSnap.data(), docSnap.id));
  } catch (err) {
    console.error(err);
    return [];
  }
}

function hasMenuItemImages(item) {
  return getMenuItemImages(item).length > 0;
}

function fillMenuImagesFromFallback(baseItems, fallbackItems) {
  const list = Array.isArray(baseItems) ? baseItems : [];
  const fallback = Array.isArray(fallbackItems) ? fallbackItems : [];
  if (!list.length || !fallback.length) return list;
  const fallbackById = new Map(fallback.map((it) => [String(it.id || ""), it]));
  const fallbackByNameCatPrice = new Map();
  const fallbackByNameCat = new Map();
  const fallbackByName = new Map();
  fallback.forEach((fb) => {
    if (!fb) return;
    const nameKey = foldMenuText(fb.name || "").trim();
    const catKey = foldMenuText(fb.category || "").trim();
    const priceKey = String(fb.price ?? "").trim();
    if (nameKey) {
      const byName = fallbackByName.get(nameKey) || [];
      byName.push(fb);
      fallbackByName.set(nameKey, byName);
    }
    if (nameKey || catKey) {
      const key = `${nameKey}|${catKey}`;
      if (!fallbackByNameCat.has(key)) fallbackByNameCat.set(key, fb);
    }
    if (nameKey || catKey || priceKey) {
      const key = `${nameKey}|${catKey}|${priceKey}`;
      if (!fallbackByNameCatPrice.has(key)) fallbackByNameCatPrice.set(key, fb);
    }
  });
  return list.map((it) => {
    if (!it || hasMenuItemImages(it)) return it;
    const byId = it.id ? fallbackById.get(String(it.id)) : null;
    if (byId && hasMenuItemImages(byId)) {
      return {
        ...it,
        imageUrl: byId.imageUrl || "",
        imageUrls: Array.isArray(byId.imageUrls) ? byId.imageUrls : []
      };
    }
    const nameKey = foldMenuText(it.name || "").trim();
    const catKey = foldMenuText(it.category || "").trim();
    const priceKey = String(it.price ?? "").trim();
    let match = null;
    if (nameKey || catKey || priceKey) {
      match = fallbackByNameCatPrice.get(`${nameKey}|${catKey}|${priceKey}`) || null;
    }
    if (!match && (nameKey || catKey)) {
      match = fallbackByNameCat.get(`${nameKey}|${catKey}`) || null;
    }
    if (!match && nameKey) {
      const listByName = fallbackByName.get(nameKey) || [];
      if (listByName.length === 1) match = listByName[0];
    }
    if (match && hasMenuItemImages(match)) {
      return {
        ...it,
        imageUrl: match.imageUrl || "",
        imageUrls: Array.isArray(match.imageUrls) ? match.imageUrls : []
      };
    }
    return it;
  });
}

async function publishMenuToPublic(restaurantId, items) {
  if (!restaurantId) return;
  const ref = doc(db, "restaurants", restaurantId, "public", "menu");
  const payload = {
    items: (items || []).map((item) => ({
      id: item.id || "",
      type: item.type || null,
      category: item.category || "Sonstiges",
      name: item.name || "Produkt",
      description: item.description || "",
      longDescription: item.longDescription || "",
      allergens: item.allergens || "",
      brand: item.brand || "",
      sku: item.sku || "",
      stock: Number.isFinite(Number(item.stock)) ? Math.max(0, Number(item.stock)) : null,
      sizes: Array.isArray(item.sizes) ? item.sizes : [],
      colors: Array.isArray(item.colors) ? item.colors : [],
      cropX: clampCropPercent(item.cropX ?? 50, 50),
      cropY: clampCropPercent(item.cropY ?? 50, 50),
      price: item.price ?? "",
      available: item.available !== false,
      imageUrl: item.imageUrl || null,
      imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : []
    })),
    publishedAt: serverTimestamp()
  };
  await setDoc(ref, payload, { merge: true });
}

async function loadMenuHybrid(restaurantId) {
  const pub = await loadPublicMenuItems(restaurantId);
  if (pub && pub.length) {
    const needsImages = pub.some((it) => !hasMenuItemImages(it));
    if (!needsImages) return pub;
    const [col, legacy] = await Promise.all([
      loadMenuItemsFromCollection(restaurantId),
      loadLegacyMenuItems(restaurantId)
    ]);
    const fallbackItems = col.length ? col : legacy;
    if (!fallbackItems.length) return pub;
    const merged = fillMenuImagesFromFallback(pub, fallbackItems);
    return merged;
  }
  const col = await loadMenuItemsFromCollection(restaurantId);
  if (col && col.length) {
    try {
      await publishMenuToPublic(restaurantId, col);
    } catch (err) {
      console.error(err);
    }
    return col;
  }
  const legacy = await loadLegacyMenuItems(restaurantId);
  if (legacy && legacy.length) {
    try {
      await publishMenuToPublic(restaurantId, legacy);
    } catch (err) {
      console.error(err);
    }
    return legacy;
  }
  return [];
}

function menuCacheKey(restaurantId, source) {
  return `${restaurantId || ""}::${source || "hybrid"}`;
}

function normalizeFocusItem(data, fallbackId) {
  const d = data || {};
  const id = d.id || d._id || fallbackId || (crypto.randomUUID?.() || String(Math.random()).slice(2));
  const crop = getFocusItemCrop(d);
  return {
    id,
    title: d.title || d.name || "Sot ne Fokus",
    text: d.text || d.desc || d.description || "",
    imageUrl: d.imageUrl || d.image || d.photoUrl || "",
    cropX: crop.x,
    cropY: crop.y,
    active: d.active !== false
  };
}

async function loadFocusItems(restaurantId) {
  if (!restaurantId) return [];
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId, "public", "offers"));
    if (!snap.exists()) return [];
    const data = snap.data() || {};
    const arr = Array.isArray(data.items) ? data.items : [];
    return arr.map((item, idx) => normalizeFocusItem(item, item?.id || `focus_${idx}`));
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadFocusMeta(restaurantId) {
  if (!restaurantId) return true;
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId, "public", "meta"));
    if (!snap.exists()) return true;
    const data = snap.data() || {};
    if (typeof data.offersEnabled === "boolean") return data.offersEnabled;
  } catch (err) {
    console.error(err);
  }
  return true;
}

async function saveFocusEnabled(restaurantId, enabled) {
  if (!restaurantId) return;
  try {
    await setDoc(doc(db, "restaurants", restaurantId, "public", "meta"), {
      offersEnabled: !!enabled,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error(err);
  }
}

async function publishFocusItems(restaurantId, items) {
  if (!restaurantId) return;
  const payload = {
    items: (items || []).map((item) => ({
      id: item.id || "",
      title: item.title || "",
      text: item.text || "",
      imageUrl: item.imageUrl || "",
      cropX: clampCropPercent(item.cropX ?? 50, 50),
      cropY: clampCropPercent(item.cropY ?? 50, 50),
      active: item.active !== false
    })),
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, "restaurants", restaurantId, "public", "offers"), payload, { merge: true });
}

function focusCacheKey(restaurantId) {
  return `${restaurantId || ""}`;
}

async function loadFocusForRestaurant(restaurantId, { force = false } = {}) {
  return sessionDataRuntimeController.loadFocusForRestaurant(...arguments);
}

async function loadMenuForRestaurant(restaurantId, { force = false, source = "hybrid" } = {}) {
  return sessionDataRuntimeController.loadMenuForRestaurant(...arguments);
}

function syncMenuCaches(restaurantId, items) {
  const list = Array.isArray(items) ? items : [];
  menuCache.set(menuCacheKey(restaurantId, "collection"), { items: list, ts: Date.now() });
  menuCache.set(menuCacheKey(restaurantId, "hybrid"), { items: list, ts: Date.now() });
  if (state.menu.restaurantId === restaurantId) {
    state.menu = { ...state.menu, items: list };
  }
}

function getMenuRestaurantForProfile(profile) {
  return getMenuRestaurantForProfileCore(profile);
}

function ensureMenuDataForProfile(profile = state.profileView?.profile || state.userProfile) {
  ensureMenuDataForProfileCore(profile, {
    getMenuRestaurantForProfileFn: getMenuRestaurantForProfile,
    loadMenuForRestaurantFn: loadMenuForRestaurant
  });
}

function ensureFocusDataForProfile(profile = state.profileView?.profile || state.userProfile) {
  ensureFocusDataForProfileCore(profile, {
    getMenuRestaurantForProfileFn: getMenuRestaurantForProfile,
    loadFocusForRestaurantFn: loadFocusForRestaurant
  });
}

function normalizeOrderItem(item) {
  return normalizeOrderItemCore(item, {
    buildShopVariantKeyFn: buildShopVariantKey,
    clampCropPercentFn: clampCropPercent
  });
}

function normalizeOrderDoc(data, id) {
  return normalizeOrderDocCore(data, id, {
    normalizeOrderItemFn: normalizeOrderItem,
    parsePriceValueFn: parsePriceValue
  });
}

function stopOrdersListener() {
  if (ordersUnsub) {
    ordersUnsub();
    ordersUnsub = null;
  }
  ordersListenerKey = "";
}

function startOrdersListener(user = state.user) {
  const uid = String(user?.uid || "").trim();
  if (!uid) {
    stopOrdersListener();
    return;
  }
  const isBusiness = isLocalBusinessProfile(state.userProfile) && !!state.userProfile.restaurantId;
  const nextListenerKey = isBusiness
    ? `restaurant:${String(state.userProfile.restaurantId || "").trim()}`
    : `user:${uid}`;
  if (!nextListenerKey || (ordersUnsub && ordersListenerKey === nextListenerKey)) return;
  stopOrdersListener();
  const pathRef = isBusiness
    ? collection(db, "restaurants", state.userProfile.restaurantId, "orders")
    : collection(db, "users", uid, "orders");
  ordersListenerKey = nextListenerKey;
  state.orders = { ...state.orders, loading: true, error: "" };
  if (state.activeTab === "orders") render();
  ordersUnsub = onSnapshot(query(pathRef, orderBy("createdAt", "desc"), limit(60)), (snap) => {
    const items = snap.docs.map((docSnap) => normalizeOrderDoc(docSnap.data() || {}, docSnap.id));
    state.orders = { ...state.orders, items, loading: false, error: "" };
    if (state.activeTab === "orders" && lastRenderMode === "main") {
      render();
    }
  }, (err) => {
    console.error(err);
    ordersUnsub = null;
    ordersListenerKey = "";
    state.orders = { ...state.orders, loading: false, error: "Bestellungen konnten nicht geladen werden." };
    if (state.activeTab === "orders" && lastRenderMode === "main") {
      render();
    }
  });
}

async function submitShopCheckout() {
  const cart = normalizeShopCartState(state.shopCart);
  if (cart.loading || !cart.restaurantId || !cart.items.length) return;
  const hasUser = !!String(state.user?.uid || "").trim();
  const contact = {
    name: String(cart.form.name || "").trim(),
    phone: String(cart.form.phone || "").trim(),
    city: String(cart.form.city || "").trim(),
    address: String(cart.form.address || "").trim()
  };
  if (!contact.name || !contact.phone || !contact.city || !contact.address) {
    state.shopCart = { ...cart, status: "Bitte Name, Tel, Qyteti und Adresse eingeben." };
    saveShopCartToStorage();
    render();
    return;
  }
  const restaurant = getRestaurantMetaById(cart.restaurantId) || {};
  const businessAvatar = cart.businessAvatar || restaurant.logoUrl || restaurant.logo || "";
  const orderRef = doc(collection(db, "restaurants", cart.restaurantId, "orders"));
  const orderId = orderRef.id;
  const nowIso = new Date().toISOString();
  const buyerHandle = hasUser
    ? String(state.userProfile.handle || normalizeHandle(state.userProfile.name || state.user?.displayName || "user")).replace(/^@/, "").trim()
    : "guest";
  const payload = {
    id: orderId,
    restaurantId: cart.restaurantId,
    businessName: cart.businessName || restaurant.name || restaurant.restaurantName || "Shop",
    businessAvatar,
    buyerUid: hasUser ? String(state.user?.uid || "").trim() : "",
    buyerName: hasUser ? (state.userProfile.name || state.user?.displayName || contact.name || "User") : (contact.name || "Gast"),
    buyerHandle,
    buyerAvatar: hasUser ? (state.userProfile.avatar || "") : "",
    contact,
    items: cart.items.map((item) => ({
      id: item.id,
      itemId: item.itemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
      category: item.category,
      cartKey: item.cartKey || buildShopVariantKey(item.itemId || item.id || "", {
        size: item.selectedSize || "",
        color: item.selectedColor || ""
      }),
      selectedSize: item.selectedSize || "",
      selectedColor: item.selectedColor || "",
      cropX: clampCropPercent(item.cropX ?? 50, 50),
      cropY: clampCropPercent(item.cropY ?? 50, 50)
    })),
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    total: getShopCartTotal(),
    status: "Neu",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAtClient: nowIso,
    updatedAtClient: nowIso
  };
  state.shopCart = { ...cart, loading: true, status: "Bestellung wird gesendet..." };
  render();
  try {
    const batch = writeBatch(db);
    batch.set(orderRef, payload, { merge: true });
    if (hasUser) {
      batch.set(doc(db, "users", state.user.uid, "orders", orderId), payload, { merge: true });
    }
    await batch.commit();
    if (!hasUser) {
      const guestOrder = normalizeOrderDoc(payload, orderId);
      state.orders = {
        ...state.orders,
        loading: false,
        error: "",
        items: [guestOrder, ...(Array.isArray(state.orders.items) ? state.orders.items : [])]
      };
    }
    clearShopCart({ keepForm: true });
    state.activeTab = "orders";
    state.drawerOpen = false;
    render();
  } catch (err) {
    console.error(err);
    state.shopCart = { ...cart, loading: false, checkoutOpen: true, status: "Bestellung konnte nicht gesendet werden." };
    saveShopCartToStorage();
    render();
  }
}

async function saveFocusItemFromModal() {
  if (!state.user) return;
  const restaurantId = state.userProfile.restaurantId || "";
  if (!restaurantId) {
    state.focusModal.status = "Kein Restaurant ausgewaehlt.";
    renderOverlays({ updateFocus: true });
    return;
  }
  const title = document.getElementById("focusTitle")?.value?.trim() || "";
  const text = document.getElementById("focusText")?.value?.trim() || "";
  const imageUrlInput = document.getElementById("focusImageUrl")?.value?.trim() || "";
  const active = document.getElementById("focusActive")?.checked !== false;
  const crop = getFocusModalCrop();
  if (!title) {
    state.focusModal.status = "Bitte Titel eingeben.";
    renderOverlays({ updateFocus: true });
    return;
  }

  state.focusModal.loading = true;
  state.focusModal.status = "Speichern...";
  renderOverlays({ updateFocus: true });

  try {
    let imageUrl = imageUrlInput || state.focusModal.item?.imageUrl || "";
    if (state.focusModal.imageFile) {
      const { cdnUrl } = await uploadCompressedImage(
        state.focusModal.imageFile,
        restaurantId,
        { maxSize: 1080, quality: 0.8, mimeType: "image/jpeg" }
      );
      imageUrl = cdnUrl || imageUrl;
    }

    const id = state.focusModal.item?.id || (crypto.randomUUID?.() || String(Math.random()).slice(2));
    const payload = {
      id,
      title,
      text,
      imageUrl,
      cropX: crop.x,
      cropY: crop.y,
      active
    };
    const nextItems = Array.isArray(state.focus.items) ? state.focus.items.slice() : [];
    const idx = nextItems.findIndex((it) => String(it.id) === String(id));
    if (idx >= 0) {
      nextItems[idx] = { ...nextItems[idx], ...payload };
    } else {
      nextItems.unshift(payload);
    }
    await publishFocusItems(restaurantId, nextItems);
    focusCache.set(focusCacheKey(restaurantId), { items: nextItems, enabled: state.focus.enabled, ts: Date.now() });
    state.focus = { ...state.focus, restaurantId, items: nextItems, loading: false, error: "" };

    state.focusModal.loading = false;
    state.focusModal.status = "Gespeichert.";
    closeFocusModal();
    render();
  } catch (err) {
    console.error(err);
    state.focusModal.status = err?.message || "Speichern fehlgeschlagen.";
    state.focusModal.loading = false;
    renderOverlays({ updateFocus: true });
  }
}

async function deleteFocusItemById(itemId) {
  if (!state.user || !itemId) return;
  const restaurantId = state.userProfile.restaurantId || "";
  if (!restaurantId) return;
  if (!confirm("Fokus-Eintrag wirklich loeschen?")) return;
  try {
    const nextItems = (state.focus.items || []).filter((it) => String(it.id) !== String(itemId));
    await publishFocusItems(restaurantId, nextItems);
    focusCache.set(focusCacheKey(restaurantId), { items: nextItems, enabled: state.focus.enabled, ts: Date.now() });
    state.focus = { ...state.focus, restaurantId, items: nextItems };
    render();
  } catch (err) {
    console.error(err);
    alert("Loeschen fehlgeschlagen.");
  }
}

// --- CRM: Leads & Customers (CEO) ---
async function createAuthUser(email, password) {
  return crmRuntimeController.createAuthUser(email, password);
}

async function ensureRestaurantPublicMeta(restaurantId, base) {
  return crmRuntimeController.ensureRestaurantPublicMeta(restaurantId, base);
}

function normalizeLeadDoc(docSnap) {
  return crmRuntimeController.normalizeLeadDoc(docSnap);
}

function normalizeLeadFromRestaurant(rest) {
  return crmRuntimeController.normalizeLeadFromRestaurant(rest);
}

function resolveRestaurantStatusFromLead(leadStatus, currentStatus = "") {
  return crmRuntimeController.resolveRestaurantStatusFromLead(leadStatus, currentStatus);
}

async function loadLeads({ scope = state.leads.scope, grow = false } = {}) {
  return crmRuntimeController.loadLeads({ scope, grow });
}

async function loadCustomers({ scope = state.customers.scope, grow = false } = {}) {
  return crmRuntimeController.loadCustomers({ scope, grow });
}

function isHiddenLegacyCeoEmail(email = "") {
  return crmRuntimeController.isHiddenLegacyCeoEmail(email);
}

function applyKnownLeadOwnershipOverride(entity = {}) {
  return crmRuntimeController.applyKnownLeadOwnershipOverride(entity);
}

function getStaffFormEmail(form = state.staff.form, { preferStored = false } = {}) {
  return crmRuntimeController.getStaffFormEmail(form, { preferStored });
}

function syncStaffDerivedEmailField() {
  return crmRuntimeController.syncStaffDerivedEmailField();
}

function openStaffEditor(mode = "create", entry = null) {
  return crmRuntimeController.openStaffEditor(mode, entry);
}

function closeStaffEditor(status = "") {
  return crmRuntimeController.closeStaffEditor(status);
}

function syncStaffFormFromDom() {
  return crmRuntimeController.syncStaffFormFromDom();
}

async function loadCeoStaff({ grow = false } = {}) {
  return crmRuntimeController.loadCeoStaff({ grow });
}

async function saveCeoStaffFromView() {
  return crmRuntimeController.saveCeoStaffFromView();
}

async function deleteCeoStaffFromView() {
  return crmRuntimeController.deleteCeoStaffFromView();
}

function syncLeadModalDraftFromForm() {
  return crmRuntimeController.syncLeadModalDraftFromForm();
}

function addLeadModalLocationRow() {
  return crmRuntimeController.addLeadModalLocationRow();
}

function removeLeadModalLocationRow(index) {
  return crmRuntimeController.removeLeadModalLocationRow(index);
}

async function saveLeadFromModal() {
  return crmRuntimeController.saveLeadFromModal();
}

async function deleteLeadFromModal() {
  return crmRuntimeController.deleteLeadFromModal();
}

async function saveCustomerFromModal() {
  return crmRuntimeController.saveCustomerFromModal();
}

async function convertLeadToCustomer(leadId) {
  return crmRuntimeController.convertLeadToCustomer(leadId);
}

async function saveMenuItemFromModal() {
  return saveMenuItemFromModalCore({
    state,
    documentObj: typeof document !== "undefined" ? document : null,
    isShopCatalogProfile,
    renderOverlays,
    normalizeOptionList,
    getMenuModalCrop,
    uploadCompressedImage,
    doc,
    collection,
    db,
    normalizeMenuType,
    serverTimestamp,
    setDoc,
    normalizeMenuItemDoc,
    syncMenuCaches,
    publishMenuToPublic,
    closeMenuModal,
    render
  });
}

async function deleteMenuItemById(itemId) {
  return deleteMenuItemByIdCore({
    itemId,
    state,
    confirmFn: confirm,
    doc,
    db,
    deleteDoc,
    syncMenuCaches,
    publishMenuToPublic,
    render,
    alertFn: alert
  });
}

function isCurrentAuthTransition(transitionSeq, expectedUid = "") {
  if (transitionSeq !== authTransitionSeq) return false;
  return String(state.user?.uid || "") === String(expectedUid || "");
}

async function bootstrapUser(user, { transitionSeq = 0 } = {}) {
  const expectedUid = String(user?.uid || "").trim();
  if (!expectedUid) return false;
  if (transitionSeq && !isCurrentAuthTransition(transitionSeq, expectedUid)) return false;
  await sessionDataRuntimeController.bootstrapUser(user);
  if (transitionSeq && !isCurrentAuthTransition(transitionSeq, expectedUid)) return false;
  return true;
}

loadPersisted();
bindPublicBootstrapPayloadListener();
if (typeof window !== "undefined") {
  const inlineBootstrap = window.__MENYRA_SOCIAL_BOOTSTRAP_PAYLOAD__;
  if (inlineBootstrap && typeof inlineBootstrap === "object") {
    applyPublicBootstrapPayload(inlineBootstrap, { refreshUi: false });
  }
}
authBootstrapSnapshot = readAuthBootstrapSnapshot();
bindPushOpenTargetMessageHandler();
state.user = auth.currentUser || null;
authInitialized = false;
if (state.user) {
  loadUserScopedPersisted(state.user);
  writeAuthBootstrapSnapshot();
  lastAuthUid = state.user.uid || "";
} else {
  const appliedSnapshot = applyAuthBootstrapSnapshot(authBootstrapSnapshot);
  const snapshotUid = appliedSnapshot ? String(authBootstrapSnapshot?.uid || "").trim() : "";
  if (snapshotUid) {
    applyPersistedAuthProfileHints(snapshotUid);
  }
  lastAuthUid = snapshotUid;
}
applyPendingInitialRouteState();
render();
schedulePerfWarmMark();
queueMicrotask(() => {
  void fetchPublicBootstrapPayload({ force: false, timeoutMs: 1200 });
});
if (!state.user) {
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => {
      void ensureTabData(state.activeTab);
    });
  } else {
    setTimeout(() => {
      void ensureTabData(state.activeTab);
    }, 0);
  }
}

onAuthStateChanged(auth, (user) => {
  authInitialized = true;
  const transitionSeq = ++authTransitionSeq;
  const nextUid = user?.uid || "";
  const prevUid = lastAuthUid;
  if (shouldResetUserScopedStateCore({ prevUid, nextUid })) {
    resetUserScopedState();
  }
  state.user = user;
  applyPendingInitialRouteState();
  if (user) {
    state.auth.open = false;
    loadUserScopedPersisted(user);
    writeAuthBootstrapSnapshot();
    const pendingRouteFlags = resolvePendingAuthRouteFlagsCore({
      pendingNotificationId,
      pendingPostId,
      pendingChatUid
    });
    if (pendingRouteFlags.hasAny) {
      suspendRender();
      void bootstrapUser(user, { transitionSeq }).catch(() => {});
      queueMicrotask(() => {
        void (async () => {
          try {
            if (!isCurrentAuthTransition(transitionSeq, nextUid)) return;
            await runPostLoginPendingRouteOpenFlowCore({
              openProfileFromQuery: () => maybeOpenProfileFromQuery(),
              openNotificationFromQuery: () => maybeOpenNotificationFromQuery(),
              openPostFromQuery: () => maybeOpenPostFromQuery(),
              openChatFromQuery: () => maybeOpenChatFromQuery(),
              renderFallback: () => render()
            });
          } finally {
            resumeRender();
          }
        })();
      });
    } else {
      render();
      void bootstrapUser(user, { transitionSeq }).catch(() => {});
      queueMicrotask(() => {
        if (!isCurrentAuthTransition(transitionSeq, nextUid)) return;
        runPostLoginNonBlockingRouteOpenFlowCore({
          openProfileFromQuery: () => maybeOpenProfileFromQuery(),
          openNotificationFromQuery: () => maybeOpenNotificationFromQuery(),
          openPostFromQuery: () => maybeOpenPostFromQuery(),
          openChatFromQuery: () => maybeOpenChatFromQuery()
        });
      });
    }
  } else {
    clearAuthBootstrapSnapshot();
    state.roleSwitchRoles = [];
    state.roleSwitchRestaurantId = "";
    stopLiveListeners();
    state.auth.open = false;
    loadGuestScopedPersisted();
    state.activeTab = sanitizeTabForSession(state.activeTab, { hasProfileView: !!state.profileView });
    render();
    queueMicrotask(() => {
      void ensureTabData(state.activeTab);
    });
  }
  lastAuthUid = nextUid;
});

window.addEventListener("load", () => {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
});
