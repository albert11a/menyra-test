import { auth, db, app } from "/shared/firebase-config.js?v=2026-03-10-startup-1";
import { BUNNY_EDGE_BASE, MEDIA_TICKET_ENDPOINT } from "/shared/bunny-edge.js";
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
  Timestamp,
  waitForPendingWrites
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
  createEmptyMenuDetailState,
  createEmptyTableQrState
} from "./core/common/state-factories.js";
import { createRestaurantIdentityRuntimeController } from "./core/common/restaurant-identity-runtime-controller.js";
import { createStoryFeedRuntimeController } from "./core/stories/story-feed-runtime-controller.js";
import {
  normalizeInitialTab,
  normalizeAuthMode
} from "./core/auth/route-auth-utils.js";
import { resolveInitialRouteState } from "./core/auth/initial-route-state.js";
import {
  createAuthStartupStateHelpers
} from "./core/auth/auth-startup-state-utils.js";
import { createPostLoginRouteOpenCoordinator } from "./core/auth/auth-post-login-route-open-utils.js";
import { createPendingRouteStartupState } from "./core/auth/pending-route-startup-state.js";
import { createAuthSessionStartupCoordinator } from "./core/auth/auth-session-startup-coordinator.js";
import { bootstrapAuthenticatedSessionCore } from "./core/auth/auth-user-bootstrap-utils.js";
import { createAuthProfileResolutionRuntimeController } from "./core/auth/auth-profile-resolution-runtime.js";
import {
  clearQueryParamsFromCurrentUrlCore,
  resolveRouteStateFromTargetUrlCore,
  applyPendingRouteStateCore
} from "./core/push/push-route-query-utils.js";
import {
  createBridgeShellBootstrapBundle,
  buildSessionDataRuntimeControllerDeps
} from "./core/app-shell/controller-deps-factory.js";
import { createShellDomRuntimeController } from "./core/app-shell/shell-dom-runtime-controller.js";
import { preparePublicBootstrapStartup } from "./core/app-shell/public-bootstrap-startup-utils.js";
import { createPublicBootstrapRuntimeController } from "./core/app-shell/public-bootstrap-runtime-controller.js";
import { createSessionDataRuntimeController } from "./core/app-shell/session-data-runtime-controller.js";
import { createFocusRuntimeController } from "./core/menu/focus-runtime-controller.js";
import { createMenuPublicRuntimeController } from "./core/menu/menu-public-runtime-controller.js";
import { createTableQrRuntimeController } from "./core/menu/table-qr-runtime-controller.js";
import { createMediaUploadRuntimeController } from "./core/media/media-upload-runtime-controller.js";
import { createOrdersRuntimeController } from "./core/orders/orders-runtime-controller.js";
import { renderOrdersViewCore } from "./core/orders/orders-render-utils.js";
import { createProfileMenuFocusRenderController } from "./core/profile/profile-menu-focus-render-controller.js";
import { createPublicProfileRuntimeController } from "./core/profile/public-profile-runtime-controller.js";
import { createSelfProfileRuntimeController } from "./core/profile/self-profile-runtime-controller.js";
import { createSocialEngagementRuntimeController } from "./core/profile/social-engagement-runtime-controller.js";
import { createSocialEngagementSupportRuntimeController } from "./core/profile/social-engagement-support-runtime-controller.js";
import { projectPostCollectionThroughEntityMap } from "./core/profile/post-entity-registry-utils.js";
import { createCeoCrmCountRuntimeController } from "./core/crm/ceo-crm-count-runtime-controller.js";
import { createCrmRuntimeController } from "./core/crm/crm-runtime-controller.js";
import { createBusinessAccountsRuntimeController } from "./core/business-accounts/business-accounts-runtime-controller.js";
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
  sanitizeTabForSessionCore
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
  isLocalBusinessProfileCore,
  isBusinessOwnerProfileCore,
  resolveProfileRestaurantIdCore,
  canAccessRestaurantOrdersCore
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
  computeLatestTimestampCore,
  saveFeedPostsCore
} from "./core/feed/feed-cache-utils.js";
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
  sourceUserRole: "user",
  isPremium: false,
  restaurantId: "",
  staffRestaurantId: "",
  waiterRestaurantId: "",
  businessAccess: false,
  waiterAccess: false,
  permissions: {
    businessAccess: false,
    waiterAccess: false
  },
  staffRole: "",
  businessOwnerUid: "",
  staffActive: true,
  staffStatus: "",
  socialAccessMode: "",
  socialAccessMessage: "",
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
const CRM_LAZY_RENDERERS_MODULE_URL = "/apps/menyra-social/_shared/crm-lazy-renderers.js?v=2026-03-11-superadmin-buildstatus-2";
const BUILD_INFO_ENDPOINT_URL = "/api/build-info";
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
  profilePosts: PERF_CONSTRAINED ? 24 : 36,
  restaurants: PERF_CONSTRAINED ? 40 : 80,
  stories: 24,
  storiesFallback: 30,
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
const userPostsKey = (uid) => (uid ? `menyra_social_user_posts_cache_v2::${uid}` : "");
const businessPostsKey = (rid) => (rid ? `menyra_social_business_posts_cache_v2::${rid}` : "");
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

function reportCriticalRuntimeFailure(scope = "", err = null, { suppressAbort = false } = {}) {
  const safeScope = String(scope || "runtime").trim() || "runtime";
  const name = String(err?.name || "").trim();
  const message = String(err?.message || "").trim();
  const isAbort = name === "AbortError" || /abort/i.test(message);
  if (suppressAbort && isAbort) return;
  if (err) {
    console.warn(`[mnyra][${safeScope}]`, err);
    return;
  }
  console.warn(`[mnyra][${safeScope}] operation failed`);
}

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
  postEntityMap: new Map(),
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
    source: "hybrid",
    statusBadgeVisible: true
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
  tableQr: createEmptyTableQrState(),
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
  businessAccounts: {
    items: [],
    view: "list",
    editorUid: "",
    loading: false,
    saving: false,
    deleting: false,
    loaded: false,
    error: "",
    status: "",
    form: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "waiter",
      businessAccess: false,
      waiterAccess: true,
      active: true
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
const pendingRouteState = createPendingRouteStartupState();
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
  staff: false,
  businessAccounts: false
};
let shellRuntimeController = null;
let shellDomRuntimeController = null;
let profileMenuFocusRenderController = null;
let sessionDataRuntimeController = null;
let socialEngagementRuntimeController = null;
let socialEngagementSupportRuntimeController = null;
let ceoCrmCountRuntimeController = null;
let crmRuntimeController = null;
let businessAccountsRuntimeController = null;
let chatRuntimeController = null;
let menuPublicRuntimeController = null;
let focusRuntimeController = null;
let tableQrRuntimeController = null;
let mediaUploadRuntimeController = null;
let lastAppHtml = "";
let lastRenderMode = "";
let lastRenderedMainTab = "";
let feedDeltaTimer = null;
let crmAutoLoadObserver = null;
let notificationsUnsub = null;
let followingUnsub = null;
let pushMessagingClient = null;
let firebaseMessagingModulePromise = null;
let pushActivationIssue = "";
let feedUnsub = null;
let storiesUnsub = null;
let restaurantsUnsub = null;
let userPostsUnsub = null;
let businessPostsUnsub = null;
let modalPostDocUnsub = null;
let modalLikesUnsub = null;
let modalCommentsUnsub = null;
let menuDetailDocUnsub = null;
let menuDetailLikesUnsub = null;
let menuDetailCommentsUnsub = null;
let storiesRowSignature = "";
let authInitialized = false;
let authBootstrapSnapshot = null;
let selfProfileRuntimeController = null;

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

try {
  const initialRouteState = resolveInitialRouteState({
    qs,
    normalizeInitialTab,
    normalizeAuthMode
  });
  pendingRouteState.applyInitialRouteState(initialRouteState);
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

const {
  applyPendingInitialRouteState,
  saveUserProfileToStorage,
  readAuthBootstrapSnapshot,
  writeAuthBootstrapSnapshot,
  clearAuthBootstrapSnapshot,
  applyAuthBootstrapSnapshot,
  applyPersistedAuthProfileHints
} = createAuthStartupStateHelpers({
  state,
  defaultProfile: DEFAULT_PROFILE,
  safeStorage,
  authSnapshotKey: STORAGE_KEYS.authSnapshot,
  profileKey,
  sanitizeDisplayName,
  getOptimizedImageUrl,
  isPlaceholderUrl,
  getUserAvatarCache: () => selfProfileRuntimeController?.getUserAvatarCache() || "",
  setUserAvatarCache: (next) => {
    if (selfProfileRuntimeController) selfProfileRuntimeController.setUserAvatarCache(next);
  },
  setLastShellAvatarUrl: (next) => {
    if (selfProfileRuntimeController) selfProfileRuntimeController.setLastShellAvatarUrl(next);
  },
  getAuthBootstrapSnapshot: () => authBootstrapSnapshot,
  setAuthBootstrapSnapshot: (next) => { authBootstrapSnapshot = next; },
  pendingRouteState
});
ceoCrmCountRuntimeController = createCeoCrmCountRuntimeController({
  state,
  db,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  increment,
  serverTimestamp,
  documentId,
  uniqueStringList,
  normalizeCeoPath,
  normalizeHandle,
  normalizeCeoCountry,
  buildCeoName,
  parseCoordNumber,
  getCurrentCeoMeta,
  isCeoUser,
  hasGlobalCeoAccess,
  saveUserProfileToStorage,
  render,
  toDateSafe,
  normalizeLeadDoc,
  normalizeLeadStatusKey,
  isCustomerRestaurant,
  escapeHtml,
  dataLoaded,
  applyKnownLeadOwnershipOverrideFn: (...args) => applyKnownLeadOwnershipOverride(...args),
  isHiddenLegacyCeoEmailFn: (...args) => isHiddenLegacyCeoEmail(...args)
});
const {
  getProfileViewUnsub,
  setProfileViewUnsub,
  stopProfileViewListener,
  showPublicProfile,
  normalizeExternalProfile,
  normalizeExternalUserProfile,
  fetchBusinessProfileDoc,
  loadBusinessPostsForRestaurant
} = createPublicProfileRuntimeController({
  state,
  db,
  docFn: doc,
  collectionFn: collection,
  queryFn: query,
  orderByFn: orderBy,
  limitFn: limit,
  getDocFn: getDoc,
  getDocsFn: getDocs,
  onSnapshotFn: onSnapshot,
  render,
  brandUi: BRAND_UI,
  fastLimits: FAST_LIMITS,
  resolvePreferredHandle,
  pickCountValue,
  normalizeRestaurantType,
  normalizeHandle,
  sanitizeDisplayName,
  isPublicBusinessRecord
});
const {
  collectFeedHydrationIds,
  queueStoryIdentityHydration,
  hydrateRestaurantsByIds,
  mergeRestaurants,
  rebuildBusinessLocations,
  stopRestaurantMetaListeners,
  ensureFeedRestaurantMetaListeners,
  enrichRestaurantsWithPublicMeta
} = createRestaurantIdentityRuntimeController({
  state,
  db,
  docFn: doc,
  getDocFn: getDoc,
  normalizeRestaurantType,
  isGenericStoryBusinessLabel: (...args) => isGenericStoryBusinessLabel(...args),
  queueMicrotaskFn: typeof queueMicrotask === "function" ? queueMicrotask : null,
  buildRestaurantLocationsFn: (...args) => buildRestaurantLocations(...args),
  resolveRestaurantLogoFn: (...args) => resolveRestaurantLogo(...args),
  isPublicBusinessRecordFn: (...args) => isPublicBusinessRecord(...args),
  syncFeedPostLogos: (...args) => syncFeedPostLogos(...args),
  refreshFeedStories: (...args) => refreshFeedStories(...args),
  render,
  updateFeedDom: (...args) => updateFeedDom(...args),
  getLastRenderMode: () => lastRenderMode
});
const {
  buildStoriesSignature,
  isGenericStoryBusinessLabel,
  sanitizeStoryBusinessName,
  resolveStoryRenderIdentity,
  normalizeStoryItemForDisplay,
  normalizeStoryItemsForDisplay,
  syncPersistedStories,
  setFeedStoriesSignature,
  syncFeedPostLogos,
  refreshFeedStories,
  loadStoriesForFeed,
  updateFeedLogoNodes,
  updateStoryLogoNodes,
  updateStoryMetaNodes,
  buildStoriesFromFeed
} = createStoryFeedRuntimeController({
  state,
  db,
  readCacheFn: readCache,
  writeCacheFn: writeCache,
  cacheKeys: CACHE_KEYS,
  cacheTtlMs: CACHE_TTL_MS,
  fastMode: FAST_MODE,
  fastLimits: FAST_LIMITS,
  collectionGroupFn: collectionGroup,
  getDocsFn: getDocs,
  queryFn: query,
  whereFn: where,
  orderByFn: orderBy,
  limitFn: limit,
  mapStorySnapshotRowsToFeedStoriesFn: (...args) => storySystemController.mapStorySnapshotRowsToFeedStories(...args),
  canShowFeedRestaurantIdFn: (...args) => canShowFeedRestaurantId(...args),
  queueStoryIdentityHydrationFn: (...args) => queueStoryIdentityHydration(...args),
  queueMicrotaskFn: typeof queueMicrotask === "function" ? queueMicrotask : null,
  updateFeedDomFn: (...args) => updateFeedDom(...args),
  renderFn: render,
  getLastRenderModeFn: () => lastRenderMode,
  resolveRestaurantLogoFn: (...args) => resolveRestaurantLogo(...args),
  isPlaceholderUrlFn: (...args) => isPlaceholderUrl(...args),
  escapeSelectorFn: (...args) => escapeSelector(...args),
  documentObj: typeof document === "undefined" ? null : document,
  toDateSafeFn: toDateSafe
});
const {
  findRestaurantByUid,
  findRestaurantByEmail,
  resolveLeadByUid,
  resolveLeadByEmail,
  findRestaurantByLeadId,
  ensureRestaurantForLead,
  resolveRestaurantForAuthUser,
  resolveRoleSwitchTargets
} = createAuthProfileResolutionRuntimeController({
  state,
  db,
  collectionFn: collection,
  queryFn: query,
  whereFn: where,
  limitFn: limit,
  docFn: doc,
  getDocFn: getDoc,
  getDocsFn: getDocs,
  setDocFn: setDoc,
  serverTimestampFn: serverTimestamp,
  mergeRestaurants,
  matchesRestaurantIdentity,
  normalizeEmailValue,
  normalizeRoleList,
  normalizeLeadLocations,
  getPrimaryLeadLocation,
  hasLeadLocationCoords,
  resolveCustomerType,
  resolveRestaurantStatusFromLead,
  ensureRestaurantPublicMeta,
  isRestaurantMarkedDeleted,
  roleSwitchOrder: ROLE_SWITCH_ORDER,
  render,
  updateShellDom,
  updateFeedDom: (...args) => updateFeedDom(...args),
  refreshSearchView: (...args) => refreshSearchView(...args),
  getLastRenderMode: () => lastRenderMode
});
const {
  commentAvatarCache,
  commentAvatarPending,
  userSearchAvatarCache,
  getUserAvatarCache,
  setUserAvatarCache,
  getLastShellAvatarUrl,
  setLastShellAvatarUrl,
  stopCurrentUserProfileListener,
  loadLogoCache,
  loadAvatarCache,
  resolveRestaurantLogo,
  resolveUserAvatar,
  resolveShellAvatarUrl,
  getSelfAvatarUrl,
  primeSelfAvatarCache,
  resolveSearchUserAvatarDisplay,
  resolveNotificationAvatar,
  resolveLikeAvatar,
  resolveCommentAvatar,
  scheduleCommentAvatarDomUpdate,
  updateCommentAvatarNodesById,
  refreshSelfCommentAvatars,
  hydrateCommentAvatars,
  applyCommentAvatarCache,
  scheduleCommentAvatarFetch,
  attachCurrentUserProfileListener,
  fetchUserDoc,
  ensureSelfAvatarReady,
  currentUserBadge,
  uploadAvatar,
  saveAccountSettings,
  loadUserProfile,
  loadBusinessProfile,
  loadBusinessStaffProfile
} = (selfProfileRuntimeController = createSelfProfileRuntimeController({
  state,
  db,
  documentObj: typeof document === "undefined" ? null : document,
  windowObj: typeof window === "undefined" ? null : window,
  safeStorage,
  logoCacheKey: STORAGE_KEYS.logoCache,
  avatarKey,
  commentAvatarRemoteFetchEnabled: COMMENT_AVATAR_REMOTE_FETCH_ENABLED,
  placeholderImage: PLACEHOLDER_IMAGE,
  getOptimizedImageUrl,
  isPlaceholderUrl,
  loadLogoCacheCoreFn: loadLogoCacheCore,
  scheduleLogoCacheWriteCoreFn: scheduleLogoCacheWriteCore,
  loadAvatarCacheCoreFn: loadAvatarCacheCore,
  scheduleAvatarCacheWriteCoreFn: scheduleAvatarCacheWriteCore,
  resolveRestaurantLogoCoreFn: resolveRestaurantLogoCore,
  resolveUserAvatarCoreFn: resolveUserAvatarCore,
  resolveShellAvatarUrlCoreFn: resolveShellAvatarUrlCore,
  collectionFn: collection,
  queryFn: query,
  whereFn: where,
  limitFn: limit,
  docFn: doc,
  getDocFn: getDoc,
  getDocFromServerFn: getDocFromServer,
  getDocsFn: getDocs,
  onSnapshotFn: onSnapshot,
  setDocFn: setDoc,
  serverTimestampFn: serverTimestamp,
  updateProfileFn: updateProfile,
  uploadCompressedImageFn: uploadCompressedImage,
  ensureUserProfileFn: ensureUserProfile,
  ensurePostMetaFn: ensurePostMeta,
  resolveUserByHandleFn: resolveUserByHandle,
  ensureRestaurantPublicMetaFn: ensureRestaurantPublicMeta,
  syncCeoDirectoryProfilePatchFn: syncCeoDirectoryProfilePatch,
  resolveRestaurantForAuthUserFn: resolveRestaurantForAuthUser,
  saveUserProfileToStorage,
  writeAuthBootstrapSnapshot,
  syncPrivateSettingFromProfile,
  mergeRestaurants,
  rebuildBusinessLocations,
  render,
  updateShellDom,
  updateFeedDom: (...args) => updateFeedDom(...args),
  refreshSearchView: (...args) => refreshSearchView(...args),
  getLastRenderMode: () => lastRenderMode,
  normalizeHandle,
  normalizeRoleList,
  resolvePreferredHandle,
  normalizeRestaurantType,
  normalizeLeadSettings,
  normalizeCeoCountry,
  normalizeCeoPath,
  hasStoredCeoCrmCounts,
  sanitizeCeoCrmCounts,
  pickCountValue,
  sanitizeDisplayName,
  isLocalBusinessProfile,
  isCeoUser,
  getVerifiedMapLocation,
  getCeoGpsOverride,
  isRestaurantMarkedDeleted
}));
socialEngagementSupportRuntimeController = createSocialEngagementSupportRuntimeController({
  state,
  db,
  documentObj: typeof document === "undefined" ? null : document,
  windowObj: typeof window === "undefined" ? null : window,
  docFn: doc,
  setDocFn: setDoc,
  deleteDocFn: deleteDoc,
  serverTimestampFn: serverTimestamp,
  confirmFn: typeof confirm === "function" ? confirm : () => false,
  renderFn: render,
  readCacheFn: readCache,
  writeCacheFn: writeCache,
  saveFeedPostsFn: saveFeedPosts,
  userPostsKeyFn: userPostsKey,
  businessPostsKeyFn: businessPostsKey,
  cacheKeys: CACHE_KEYS,
  getRestaurantMetaByIdFn: getRestaurantMetaById,
  resolvePreferredHandleFn: resolvePreferredHandle,
  normalizeRestaurantTypeFn: normalizeRestaurantType,
  getMenuItemImagesFn: (...args) => getMenuItemImages(...args),
  resolveMenuItemHeroFn: (...args) => resolveMenuItemHero(...args),
  clampCropPercentFn: clampCropPercent,
  formatCountFn: formatCount,
  iconFn: icon,
  escapeHtmlFn: escapeHtml,
  toDateSafeFn: toDateSafe,
  currentUserBadgeFn: currentUserBadge,
  normalizeHandleFn: normalizeHandle,
  resolveCommentAvatarFn: (...args) => resolveCommentAvatar(...args),
  getSelfAvatarUrlFn: (...args) => getSelfAvatarUrl(...args),
  isPlaceholderUrlFn: isPlaceholderUrl,
  scheduleCommentAvatarFetchFn: (...args) => scheduleCommentAvatarFetch(...args),
  applyCommentAvatarCacheFn: (...args) => applyCommentAvatarCache(...args),
  hydrateCommentAvatarsFn: (...args) => hydrateCommentAvatars(...args),
  highlightCommentInModalFn: (...args) => highlightCommentInModal(...args),
  getPendingCommentHighlightFn: () => pendingCommentHighlight,
  setPendingCommentHighlightFn: (value) => {
    pendingCommentHighlight = value;
  },
  getModalCommentsUnsubFn: () => modalCommentsUnsub,
  placeholderImage: PLACEHOLDER_IMAGE,
  isLocalBusinessProfileFn: isLocalBusinessProfile
});
shellDomRuntimeController = createShellDomRuntimeController({
  state,
  brandUi: BRAND_UI,
  documentObj: typeof document === "undefined" ? null : document,
  windowObj: typeof window === "undefined" ? null : window,
  db,
  getChatUnreadCount,
  isGuestSession,
  isCeoUser,
  isBusinessOwnerProfile,
  isLocalBusinessProfile,
  isRestaurantCafeProfile,
  getBusinessCatalogLabel,
  resolveUserAvatar,
  resolveShellAvatarUrl,
  resolveHeaderBranding,
  logoFitClass,
  roleLabel,
  buildRoleSwitchUrl,
  refreshSelfCommentAvatars,
  renderNotificationsList,
  saveNotifications,
  markAllNotificationsRead,
  acceptFollowRequest,
  openNotificationTarget,
  render,
  getLastRenderMode: () => lastRenderMode,
  isPlaceholderUrl,
  escapeHtml,
  icon,
  deleteDocFn: deleteDoc,
  docFn: doc
});
const {
  updateFavoriteMenuItemsLocal,
  loadFavoriteMenuItems,
  getMenuItemImages,
  isDirectImageUrl,
  resolveMenuItemHero,
  loadPublicMenuItems,
  loadLegacyMenuItems,
  loadMenuItemsFromCollection,
  loadMenuMeta,
  saveMenuStatusBadgeVisible,
  hasMenuItemImages,
  fillMenuImagesFromFallback,
  publishMenuToPublic,
  loadMenuHybrid,
  menuCacheKey,
  syncMenuCaches
} = (menuPublicRuntimeController = createMenuPublicRuntimeController({
  state,
  db,
  menuCache,
  collectionFn: collection,
  queryFn: query,
  orderByFn: orderBy,
  limitFn: limit,
  docFn: doc,
  getDocFn: getDoc,
  getDocsFn: getDocs,
  setDocFn: setDoc,
  serverTimestampFn: serverTimestamp,
  createEmptyFavoriteMenuItemsStateFn: createEmptyFavoriteMenuItemsState,
  favoriteMenuItemDocIdFn: socialEngagementSupportRuntimeController.favoriteMenuItemDocId,
  buildFavoriteMenuItemPayloadFn: socialEngagementSupportRuntimeController.buildFavoriteMenuItemPayload,
  getMenuItemSocialIdFn: socialEngagementSupportRuntimeController.getMenuItemSocialId,
  normalizeMenuItemDocFn: normalizeMenuItemDoc,
  coerceMenuItemsFromDataFn: coerceMenuItemsFromData,
  foldMenuTextFn: foldMenuText,
  clampCropPercentFn: clampCropPercent,
  renderFn: render,
  getLastRenderModeFn: () => lastRenderMode
}));
const {
  getActiveFocusItems,
  getFocusStateForRestaurant,
  getFocusIndex,
  setFocusIndex,
  updateFocusRotation,
  updateFocusCarouselDom,
  loadFocusItems,
  loadFocusMeta,
  saveFocusEnabled,
  publishFocusItems,
  focusCacheKey,
  saveFocusItemFromModal,
  deleteFocusItemById
} = (focusRuntimeController = createFocusRuntimeController({
  state,
  db,
  documentObj: typeof document === "undefined" ? null : document,
  windowObj: typeof window === "undefined" ? null : window,
  focusCache,
  docFn: doc,
  getDocFn: getDoc,
  setDocFn: setDoc,
  serverTimestampFn: serverTimestamp,
  uploadCompressedImageFn: uploadCompressedImage,
  getFocusItemCropFn: getFocusItemCrop,
  getFocusModalCropFn: getFocusModalCrop,
  clampCropPercentFn: clampCropPercent,
  getOptimizedImageUrlFn: getOptimizedImageUrl,
  isPlaceholderUrlFn: isPlaceholderUrl,
  placeholderImage: PLACEHOLDER_IMAGE,
  isRestaurantCafeProfileFn: isRestaurantCafeProfile,
  renderFn: render,
  renderOverlaysFn: (...args) => renderOverlays(...args),
  closeFocusModalFn: (...args) => closeFocusModal(...args),
  confirmFn: typeof confirm === "function" ? confirm : () => false,
  alertFn: typeof alert === "function" ? alert : () => {}
}));
const {
  getTableQrStateForRestaurant,
  ensureTableQrStateForProfile,
  saveTableQrConfig
} = (tableQrRuntimeController = createTableQrRuntimeController({
  state,
  db,
  docFn: doc,
  getDocFn: getDoc,
  getDocFromServerFn: getDocFromServer,
  setDocFn: setDoc,
  serverTimestampFn: serverTimestamp,
  waitForPendingWritesFn: waitForPendingWrites,
  isRestaurantCafeProfileFn: isRestaurantCafeProfile,
  renderFn: render,
  storageObj: safeStorage
}));
const {
  stopOrdersListener,
  startOrdersListener,
  submitShopCheckout
} = createOrdersRuntimeController({
  state,
  db,
  collectionFn: collection,
  docFn: doc,
  queryFn: query,
  orderByFn: orderBy,
  limitFn: limit,
  onSnapshotFn: onSnapshot,
  writeBatchFn: writeBatch,
  serverTimestampFn: serverTimestamp,
  normalizeShopCartStateFn: normalizeShopCartState,
  isLocalBusinessProfileFn: isLocalBusinessProfile,
  canAccessRestaurantOrdersFn: canAccessRestaurantOrders,
  resolveProfileRestaurantIdFn: resolveProfileRestaurantId,
  getRestaurantMetaByIdFn: getRestaurantMetaById,
  normalizeHandleFn: normalizeHandle,
  buildShopVariantKeyFn: buildShopVariantKey,
  clampCropPercentFn: clampCropPercent,
  parsePriceValueFn: parsePriceValue,
  saveShopCartToStorageFn: saveShopCartToStorage,
  clearShopCartFn: (...args) => clearShopCart(...args),
  renderFn: render,
  getLastRenderModeFn: () => lastRenderMode
});

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

function isLocalBusinessProfile(profile = state.userProfile) {
  return isLocalBusinessProfileCore(profile);
}

function isBusinessOwnerProfile(profile = state.userProfile) {
  return isBusinessOwnerProfileCore(profile);
}

function resolveProfileRestaurantId(profile = state.userProfile) {
  return resolveProfileRestaurantIdCore(profile);
}

function canAccessRestaurantOrders(profile = state.userProfile) {
  return canAccessRestaurantOrdersCore(profile);
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
  syncPersistedStories();
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
  return ceoCrmCountRuntimeController.normalizeCeoStaffRecord(record, userRecord);
}

async function hydrateStaffRecordsFromUserProfiles(items = [], { syncDirectory = false } = {}) {
  return ceoCrmCountRuntimeController.hydrateStaffRecordsFromUserProfiles(items, { syncDirectory });
}

function canViewCeoRecord(record = {}) {
  return ceoCrmCountRuntimeController.canViewCeoRecord(record);
}

function canCurrentCeoSeeRow(row = {}) {
  return ceoCrmCountRuntimeController.canCurrentCeoSeeRow(row);
}

function isCurrentCeoOwnRow(row = {}) {
  return ceoCrmCountRuntimeController.isCurrentCeoOwnRow(row);
}

function normalizeLeadScopeKey(value) {
  return normalizeLeadScopeKeyCore(value);
}

function normalizeCustomerScopeKey(value) {
  return normalizeCustomerScopeKeyCore(value);
}

function resolveKnownScopeCountLabel(count = 0, isExact = false, isLoaded = false) {
  return ceoCrmCountRuntimeController.resolveKnownScopeCountLabel(count, isExact, isLoaded);
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
  return ceoCrmCountRuntimeController.renderCeoScopeTabs({
    idPrefix,
    active,
    ownLabel,
    ownCount,
    staffLabel,
    staffCount,
    tabs
  });
}

function renderOwnershipPills(row = {}, { hideOwn = false } = {}) {
  return ceoCrmCountRuntimeController.renderOwnershipPills(row, { hideOwn });
}

function buildCeoCreatorMeta(profile = state.userProfile, user = state.user) {
  return ceoCrmCountRuntimeController.buildCeoCreatorMeta(profile, user);
}

function resolveStoredCeoCreatorMeta(...sources) {
  return ceoCrmCountRuntimeController.resolveStoredCeoCreatorMeta(...sources);
}

function createEmptyCeoCrmCounts() {
  return ceoCrmCountRuntimeController.createEmptyCeoCrmCounts();
}

function sanitizeCeoCrmCounts(raw = {}) {
  return ceoCrmCountRuntimeController.sanitizeCeoCrmCounts(raw);
}

function hasStoredCeoCrmCounts(raw = {}) {
  return ceoCrmCountRuntimeController.hasStoredCeoCrmCounts(raw);
}

function buildLeadCrmContribution(lead = null) {
  return ceoCrmCountRuntimeController.buildLeadCrmContribution(lead);
}

function buildCustomerCrmContribution(customer = null) {
  return ceoCrmCountRuntimeController.buildCustomerCrmContribution(customer);
}

function accumulateCeoCrmDelta(deltaMap, contribution, sign = 1) {
  return ceoCrmCountRuntimeController.accumulateCeoCrmDelta(deltaMap, contribution, sign);
}

async function applyCeoCrmCountDeltas(deltaMap) {
  return ceoCrmCountRuntimeController.applyCeoCrmCountDeltas(deltaMap);
}

async function ensureCeoCrmCountsLoaded({ force = false } = {}) {
  return ceoCrmCountRuntimeController.ensureCeoCrmCountsLoaded({ force });
}

function pickCountValue(...values) {
  return ceoCrmCountRuntimeController.pickCountValue(...values);
}

async function syncCeoDirectoryProfilePatch(patch = {}) {
  return ceoCrmCountRuntimeController.syncCeoDirectoryProfilePatch(patch);
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

function formatDateLabel(value) {
  return getSocialEngagementSupportRuntimeController().formatDateLabel(...arguments);
}

function formatDateTimeLabel(value) {
  return getSocialEngagementSupportRuntimeController().formatDateTimeLabel(...arguments);
}

function ensurePostMeta(postId) {
  return getSocialEngagementSupportRuntimeController().ensurePostMeta(...arguments);
}

function getMenuItemSocialId(item) {
  return getSocialEngagementSupportRuntimeController().getMenuItemSocialId(...arguments);
}

function menuItemMetaKey(restaurantId, itemId) {
  return getSocialEngagementSupportRuntimeController().menuItemMetaKey(...arguments);
}

function getMenuItemSocialDocRef(item, restaurantIdOverride = "") {
  return getSocialEngagementSupportRuntimeController().getMenuItemSocialDocRef(...arguments);
}

function favoriteMenuItemDocId(restaurantId, itemId) {
  return getSocialEngagementSupportRuntimeController().favoriteMenuItemDocId(...arguments);
}

function buildFavoriteMenuItemPayload(item, restaurantId, { includeServerTimestamp = false } = {}) {
  return getSocialEngagementSupportRuntimeController().buildFavoriteMenuItemPayload(...arguments);
}

function ensureMenuItemMeta(key) {
  return getSocialEngagementSupportRuntimeController().ensureMenuItemMeta(...arguments);
}

function resolveMenuItemCounts(meta) {
  return getSocialEngagementSupportRuntimeController().resolveMenuItemCounts(...arguments);
}

function primeMenuItemCounts(items, restaurantId) {
  return getSocialEngagementSupportRuntimeController().primeMenuItemCounts(...arguments);
}

function getMenuDetailContext() {
  return getSocialEngagementSupportRuntimeController().getMenuDetailContext(...arguments);
}

function getMenuDetailRestaurantId(item = state.menuDetail?.item) {
  return getSocialEngagementSupportRuntimeController().getMenuDetailRestaurantId(...arguments);
}

function buildCatalogProfileForRestaurant(restaurantId = "", fallback = {}) {
  return getSocialEngagementSupportRuntimeController().buildCatalogProfileForRestaurant(...arguments);
}

function getMenuDetailCatalogProfile(item = state.menuDetail?.item) {
  return getSocialEngagementSupportRuntimeController().getMenuDetailCatalogProfile(...arguments);
}

function resolvePostCounts(post) {
  return getSocialEngagementSupportRuntimeController().resolvePostCounts(...arguments);
}

function escapeSelector(value) {
  return getSocialEngagementSupportRuntimeController().escapeSelector(...arguments);
}

function updatePostCountNodes(post) {
  return getSocialEngagementSupportRuntimeController().updatePostCountNodes(...arguments);
}

function updatePostCaches(post) {
  return getSocialEngagementSupportRuntimeController().updatePostCaches(...arguments);
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
    getNotificationsUnsubFn: () => notificationsUnsub,
    updateNotificationsDom,
    loadNotificationsFromFirebase,
    normalizeLeadScopeKey,
    loadLeads,
    normalizeCustomerScopeKey,
    loadCustomers,
    loadCeoStaff,
    loadBusinessAccounts
  });
}

function findPostById(postId) {
  return getSocialEngagementSupportRuntimeController().findPostById(...arguments);
}

function ensureCommentShape(comment) {
  return getSocialEngagementSupportRuntimeController().ensureCommentShape(...arguments);
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
async function toggleMenuItemLikeFromCard(itemId, restaurantId = "") {
  const safeItemId = String(itemId || "").trim();
  if (!safeItemId) return;
  const item = (state.menu.items || []).find((entry) => String(entry?.id || "") === safeItemId);
  if (!item) return;
  const previousDetail = state.menuDetail;
  state.menuDetail = {
    open: true,
    item,
    index: 0,
    restaurantId: String(
      restaurantId
      || item.restaurantId
      || state.menu.restaurantId
      || state.profileView?.profile?.restaurantId
      || state.userProfile.restaurantId
      || ""
    ).trim(),
    selectedSize: Array.isArray(item?.sizes) && item.sizes.length ? String(item.sizes[0]) : "",
    selectedColor: Array.isArray(item?.colors) && item.colors.length ? String(item.colors[0]) : "",
    footerView: "cart",
    commentText: "",
    loading: false,
    sending: false
  };
  try {
    await toggleMenuItemLike();
  } finally {
    state.menuDetail = previousDetail;
  }
}
if (typeof window !== "undefined") {
  window.__MENYRA_TOGGLE_MENU_ITEM_LIKE_FROM_CARD__ = toggleMenuItemLikeFromCard;
}
async function reorderMenuItemFromAdmin(sourceItemId, targetItemId) {
  const sourceId = String(sourceItemId || "").trim();
  const targetId = String(targetItemId || "").trim();
  if (!sourceId || !targetId || sourceId === targetId) return;
  const restaurantId = String(
    state.userProfile.restaurantId
    || state.menu.restaurantId
    || ""
  ).trim();
  if (!restaurantId) return;

  const currentItems = Array.isArray(state.menu.items) ? state.menu.items.slice() : [];
  const fromIndex = currentItems.findIndex((item) => String(item?.id || "") === sourceId);
  const toIndex = currentItems.findIndex((item) => String(item?.id || "") === targetId);
  if (fromIndex < 0 || toIndex < 0) return;
  const sourceItem = currentItems[fromIndex] || null;
  const sourceStyle = String(sourceItem?.cardStyle || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const sourceCategory = String(sourceItem?.category || "").trim().toLowerCase();
  const sourceIsSpecial = sourceStyle === "testfirst_special" || sourceStyle === "special" || sourceCategory === "special";
  if (!sourceIsSpecial) return;

  const [moved] = currentItems.splice(fromIndex, 1);
  currentItems.splice(toIndex, 0, moved);
  const orderedItems = currentItems.map((item, idx) => ({
    ...item,
    orderIndex: idx
  }));

  syncMenuCaches(restaurantId, orderedItems);
  render();

  try {
    if (typeof writeBatch === "function" && typeof doc === "function" && db) {
      const batch = writeBatch(db);
      orderedItems.forEach((item, idx) => {
        const id = String(item?.id || "").trim();
        if (!id) return;
        batch.set(
          doc(db, "restaurants", restaurantId, "menuItems", id),
          { orderIndex: idx, updatedAt: serverTimestamp() },
          { merge: true }
        );
      });
      await batch.commit();
    }
    await publishMenuToPublic(restaurantId, orderedItems);
  } catch (err) {
    console.error(err);
  }
}
if (typeof window !== "undefined") {
  window.__MENYRA_REORDER_MENU_ITEM_FROM_ADMIN__ = reorderMenuItemFromAdmin;
}
async function addMenuItemComment(text) {
  return socialEngagementRuntimeController.addMenuItemComment(...arguments);
}
async function toggleCommentLike(postId, commentId, replyId) {
  return socialEngagementRuntimeController.toggleCommentLike(...arguments);
}
function renderAuthScreen() {
  return getShellDomRuntimeController().renderAuthScreen();
}

function renderDrawer() {
  return getShellDomRuntimeController().renderDrawer();
}

function renderRoleSwitchLinks() {
  return getShellDomRuntimeController().renderRoleSwitchLinks();
}

function updateShellDom() {
  return getShellDomRuntimeController().updateShellDom();
}

function updateDrawerDom() {
  return getShellDomRuntimeController().updateDrawerDom();
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
  stopCurrentUserProfileListener();
  stopProfileViewListener();
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
}

function updateNotificationBadges() {
  return getShellDomRuntimeController().updateNotificationBadges();
}

function updateNotificationsDom() {
  return getShellDomRuntimeController().updateNotificationsDom();
}

function bindNotificationsDelegation() {
  return getShellDomRuntimeController().bindNotificationsDelegation();
}

function handleNotificationsUpdate(items) {
  return getShellDomRuntimeController().handleNotificationsUpdate(items);
}

function startLiveListeners(user) {
  stopLiveListeners();
  if (!user) return;
  attachCurrentUserProfileListener();
  startFollowingListener(user);
  void syncNotificationsPushRuntime({ user, interactive: false, enabled: state.settings?.pushNotifs });
}

function updateMenuCardCountNodes(itemId, counts = { likes: 0, comments: 0 }) {
  return getSocialEngagementSupportRuntimeController().updateMenuCardCountNodes(...arguments);
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
  return getSocialEngagementSupportRuntimeController().findProfilePostCardNode(...arguments);
}

function findProfilePostToggleButton(card, postId) {
  return getSocialEngagementSupportRuntimeController().findProfilePostToggleButton(...arguments);
}

function updateProfileGridPlaceholder(container) {
  return getSocialEngagementSupportRuntimeController().updateProfileGridPlaceholder(...arguments);
}

function updateProfilePostCardDom(postId, nextType) {
  return getSocialEngagementSupportRuntimeController().updateProfilePostCardDom(...arguments);
}

function getProfilePostList() {
  return getSocialEngagementSupportRuntimeController().getProfilePostList(...arguments);
}

function findProfilePost(postId) {
  return getSocialEngagementSupportRuntimeController().findProfilePost(...arguments);
}

async function updateProfilePostType(postId, nextType) {
  return getSocialEngagementSupportRuntimeController().updateProfilePostType(...arguments);
}

async function toggleProfilePostWidth(postId) {
  return getSocialEngagementSupportRuntimeController().toggleProfilePostWidth(...arguments);
}

async function deleteProfilePost(postId) {
  return getSocialEngagementSupportRuntimeController().deleteProfilePost(...arguments);
}

function toggleProfilePostMenu(postId) {
  return getSocialEngagementSupportRuntimeController().toggleProfilePostMenu(...arguments);
}

function setProfileMenuOpen(postId) {
  return getSocialEngagementSupportRuntimeController().setProfileMenuOpen(...arguments);
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
  getUserAvatarCache,
  setUserAvatarCache,
  getLastShellAvatarUrl,
  setLastShellAvatarUrl,
  bootstrapAuthenticatedSessionCore,
  loadAuthProfile,
  resolveRoleSwitchTargets,
  startLiveListeners,
  ensureTabData,
  CACHE_TTL_MS,
  FAST_LIMITS,
  db,
  doc,
  onSnapshot,
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
  loadMenuMeta,
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
  ensurePostMetaFn: socialEngagementSupportRuntimeController.ensurePostMeta,
  ensureMenuItemMetaFn: socialEngagementSupportRuntimeController.ensureMenuItemMeta,
  resolveMenuItemCountsFn: socialEngagementSupportRuntimeController.resolveMenuItemCounts,
  getMenuDetailContextFn: socialEngagementSupportRuntimeController.getMenuDetailContext,
  ensureCommentShapeFn: socialEngagementSupportRuntimeController.ensureCommentShape,
  updatePostCountNodesFn: socialEngagementSupportRuntimeController.updatePostCountNodes,
  updatePostCachesFn: socialEngagementSupportRuntimeController.updatePostCaches,
  updateMenuCardCountNodesFn: socialEngagementSupportRuntimeController.updateMenuCardCountNodes,
  updatePostModalMetaFn: socialEngagementSupportRuntimeController.updatePostModalMeta,
  updatePostModalCountsOnlyFn: socialEngagementSupportRuntimeController.updatePostModalCountsOnly,
  updateMenuDetailCountsOnlyFn: socialEngagementSupportRuntimeController.updateMenuDetailCountsOnly,
  updateMenuDetailCommentsOnlyFn: socialEngagementSupportRuntimeController.updateMenuDetailCommentsOnly,
  updateMenuDetailMetaFn: socialEngagementSupportRuntimeController.updateMenuDetailMeta,
  updateCommentLikeButtonFn: socialEngagementSupportRuntimeController.updateCommentLikeButton,
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
  favoriteMenuItemDocIdFn: socialEngagementSupportRuntimeController.favoriteMenuItemDocId,
  buildFavoriteMenuItemPayloadFn: socialEngagementSupportRuntimeController.buildFavoriteMenuItemPayload,
  getMenuItemSocialDocRefFn: socialEngagementSupportRuntimeController.getMenuItemSocialDocRef,
  getMenuItemSocialIdFn: socialEngagementSupportRuntimeController.getMenuItemSocialId,
  menuItemMetaKeyFn: socialEngagementSupportRuntimeController.menuItemMetaKey,
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
  getPendingState: pendingRouteState.getPendingState,
  setPendingState: pendingRouteState.patchPendingState,
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
  getUserAvatarCache,
  getProfileMenuBound: () => profileMenuBound,
  setProfileMenuBound: (next) => {
    profileMenuBound = !!next;
  },
  getProfileViewUnsub,
  setProfileViewUnsub,
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
  saveTableQrConfig,
  menuCache,
  menuCacheKey,
  focusCache,
  focusCacheKey,
  saveMenuStatusBadgeVisible,
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

const {
  applyPublicBootstrapPayload,
  fetchPublicBootstrapPayload,
  bindPublicBootstrapPayloadListener
} = createPublicBootstrapRuntimeController({
  state,
  windowObj: typeof window === "undefined" ? null : window,
  fetchFn: typeof fetch === "function" ? fetch : null,
  abortControllerCtor: typeof AbortController === "function" ? AbortController : null,
  defaultPublicBootstrapEndpoint: DEFAULT_PUBLIC_BOOTSTRAP_ENDPOINT,
  publicBootstrapEvent: PUBLIC_BOOTSTRAP_EVENT,
  normalizeRestaurantType,
  toDateSafe,
  formatRelative,
  mergeRestaurants,
  writeCache,
  readCache,
  cacheKeys: CACHE_KEYS,
  rebuildBusinessLocations,
  saveFeedPosts,
  normalizeStoryItemsForDisplay,
  buildStoriesSignature,
  setFeedStoriesSignature: (next) => setFeedStoriesSignature(next),
  queueStoryIdentityHydration,
  syncFeedPostLogos,
  updateFeedDom,
  render,
  reportCriticalRuntimeFailure,
  getLastRenderMode: () => lastRenderMode,
  fastLimits: FAST_LIMITS
});

mediaUploadRuntimeController = createMediaUploadRuntimeController({
  state,
  auth,
  db,
  documentObj: typeof document === "undefined" ? null : document,
  mediaBaseUrl: BUNNY_EDGE_BASE,
  mediaTicketEndpoint: MEDIA_TICKET_ENDPOINT,
  fetchFn: typeof fetch === "function" ? fetch : null,
  compressImageFn: compressImage,
  collectionFn: collection,
  docFn: doc,
  setDocFn: setDoc,
  serverTimestampFn: serverTimestamp,
  storySystemController,
  isLocalBusinessProfileFn: isLocalBusinessProfile,
  getOptimizedImageUrlFn: getOptimizedImageUrl,
  escapeHtmlFn: escapeHtml,
  iconFn: icon,
  normalizeStoryItemForDisplayFn: normalizeStoryItemForDisplay,
  buildStoriesSignatureFn: buildStoriesSignature,
  writeCacheFn: writeCache,
  loadStoriesForFeedFn: (...args) => loadStoriesForFeed(...args),
  loadFeedPostsFn: (...args) => loadFeedPosts(...args),
  loadBusinessPostsFn: (...args) => loadBusinessPosts(...args),
  loadUserPostsFn: (...args) => loadUserPosts(...args),
  renderFn: render,
  updateFeedDomFn: (...args) => updateFeedDom(...args),
  getLastRenderModeFn: () => lastRenderMode,
  setStateFn: setState,
  setFeedStoriesSignatureFn: (next) => setFeedStoriesSignature(next),
  cacheKeys: CACHE_KEYS,
  fastLimits: FAST_LIMITS
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
  BUILD_INFO_ENDPOINT_URL,
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
  getCeoCrmCountsPromise: () => ceoCrmCountRuntimeController?.getCeoCrmCountsPromise() || null,
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
  setFeedStoriesSignature: (next) => setFeedStoriesSignature(next),
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

businessAccountsRuntimeController = createBusinessAccountsRuntimeController({
  state,
  icon,
  escapeHtml,
  db,
  auth,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  serverTimestamp,
  createAuthUser,
  signOut,
  saveUserProfileToStorage,
  render,
  getRestaurantMetaById,
  isBusinessOwnerProfile,
  isPlaceholderUrl,
  getOptimizedImageUrl,
  PLACEHOLDER_IMAGE
});

profileMenuFocusRenderController = createProfileMenuFocusRenderController({
  state,
  resolvePostCountsFn: socialEngagementSupportRuntimeController.resolvePostCounts,
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
  ensureTableQrStateForProfileFn: ensureTableQrStateForProfile,
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
  getMenuItemImagesFn: getMenuItemImages,
  getMenuItemObjectPositionFn: getMenuItemObjectPosition,
  getMenuItemSocialIdFn: socialEngagementSupportRuntimeController.getMenuItemSocialId,
  menuItemMetaKeyFn: socialEngagementSupportRuntimeController.menuItemMetaKey,
  ensureMenuItemMetaFn: socialEngagementSupportRuntimeController.ensureMenuItemMeta,
  resolveMenuItemCountsFn: socialEngagementSupportRuntimeController.resolveMenuItemCounts,
  getFocusStateForRestaurantFn: getFocusStateForRestaurant,
  getTableQrStateForRestaurantFn: getTableQrStateForRestaurant,
  getFocusItemObjectPositionFn: getFocusItemObjectPosition,
  getFocusCardClassFn: getFocusCardClass,
  getFocusIndexFn: getFocusIndex,
  isRestaurantCafeProfileFn: isRestaurantCafeProfile,
  getBusinessProfileTypeFn: getBusinessProfileType,
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
  const restaurantId = String(profile?.restaurantId || "").trim();
  if (restaurantId && state.followingTargetIds.includes(restaurantId)) return true;
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
  return getSocialEngagementSupportRuntimeController().renderCommentItem(...arguments);
}

function renderPostComments(comments) {
  return getSocialEngagementSupportRuntimeController().renderPostComments(...arguments);
}

function renderMenuCommentItem(comment) {
  return getSocialEngagementSupportRuntimeController().renderMenuCommentItem(...arguments);
}

function renderMenuDetailComments(comments) {
  return getSocialEngagementSupportRuntimeController().renderMenuDetailComments(...arguments);
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
    getBusinessProfileType,
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
  return getSocialEngagementSupportRuntimeController().updatePostModalMeta(...arguments);
}

function updatePostModalCountsOnly() {
  return getSocialEngagementSupportRuntimeController().updatePostModalCountsOnly(...arguments);
}

function updatePostModalCommentsOnly() {
  return getSocialEngagementSupportRuntimeController().updatePostModalCommentsOnly(...arguments);
}

function updateMenuDetailMeta() {
  return getSocialEngagementSupportRuntimeController().updateMenuDetailMeta(...arguments);
}

function updateMenuDetailCountsOnly() {
  return getSocialEngagementSupportRuntimeController().updateMenuDetailCountsOnly(...arguments);
}

function updateMenuDetailCommentsOnly() {
  return getSocialEngagementSupportRuntimeController().updateMenuDetailCommentsOnly(...arguments);
}

function updateCommentLikeButton(postId, commentId, replyId, likeCount) {
  return getSocialEngagementSupportRuntimeController().updateCommentLikeButton(...arguments);
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

function renderBusinessAccountsView() {
  return businessAccountsRuntimeController.renderBusinessAccountsView();
}

function renderOrdersView() {
  return renderOrdersViewCore({
    state,
    isLocalBusinessProfileFn: isLocalBusinessProfile,
    canAccessRestaurantOrdersFn: canAccessRestaurantOrders,
    escapeHtmlFn: escapeHtml,
    getOptimizedImageUrlFn: getOptimizedImageUrl,
    formatPriceFn: formatPrice,
    parsePriceValueFn: parsePriceValue,
    formatRelativeFn: formatRelative,
    toDateSafeFn: toDateSafe
  });
}

function getSocialEngagementSupportRuntimeController() {
  if (!socialEngagementSupportRuntimeController) {
    throw new Error("socialEngagementSupportRuntimeController not initialized");
  }
  return socialEngagementSupportRuntimeController;
}

function getShellDomRuntimeController() {
  if (!shellDomRuntimeController) {
    throw new Error("shellDomRuntimeController not initialized");
  }
  return shellDomRuntimeController;
}

function getMediaUploadRuntimeController() {
  if (!mediaUploadRuntimeController) {
    throw new Error("mediaUploadRuntimeController not initialized");
  }
  return mediaUploadRuntimeController;
}

function renderUploadView() {
  return getMediaUploadRuntimeController().renderUploadView();
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
    renderBusinessAccountsViewFn: renderBusinessAccountsView,
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
  const result = shellRuntimeController.render();
  if (businessAccountsRuntimeController) {
    businessAccountsRuntimeController.bindBusinessAccountsEvents(typeof document === "undefined" ? null : document);
  }
  return result;
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
  return getMediaUploadRuntimeController().uploadCompressedImage(file, ownerId, { maxSize, quality, mimeType });
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
  return getMediaUploadRuntimeController().handleUploadPost();
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
    loadBusinessStaffProfile,
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
  const ownRestaurantId = String(state.userProfile?.restaurantId || "").trim();
  if (ownRestaurantId && rid === ownRestaurantId) return true;
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

function buildStoriesRowSignature(items) {
  return buildStoriesSignature(items || []);
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
      snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(FAST_LIMITS.profilePosts || FAST_LIMITS.userPosts)));
    } catch (err) {
      snap = await getDocs(ref);
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    return projectPostCollectionThroughEntityMap(state, rows
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
      .filter((row) => row.url));
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

async function loadFocusForRestaurant(restaurantId, { force = false } = {}) {
  return sessionDataRuntimeController.loadFocusForRestaurant(...arguments);
}

async function loadMenuForRestaurant(restaurantId, { force = false, source = "hybrid" } = {}) {
  return sessionDataRuntimeController.loadMenuForRestaurant(...arguments);
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

async function loadBusinessAccounts({ force = false } = {}) {
  return businessAccountsRuntimeController.loadBusinessAccounts({ force });
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
    getBusinessProfileType,
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

loadPersisted();
const {
  hasInlineBootstrapPayload,
  hasWindowBootstrapPromise
} = preparePublicBootstrapStartup({
  windowObj: typeof window === "undefined" ? null : window,
  bindPublicBootstrapPayloadListener,
  applyPublicBootstrapPayload
});
const postLoginRouteOpenCoordinator = createPostLoginRouteOpenCoordinator({
  pendingRouteState,
  routeOpenApi: {
    openProfileFromQuery: maybeOpenProfileFromQuery,
    openNotificationFromQuery: maybeOpenNotificationFromQuery,
    openPostFromQuery: maybeOpenPostFromQuery,
    openChatFromQuery: maybeOpenChatFromQuery
  },
  renderFallback: render
});
const authSessionStartupCoordinator = createAuthSessionStartupCoordinator({
  state,
  auth,
  onAuthStateChangedFn: onAuthStateChanged,
  windowObj: typeof window === "undefined" ? null : window,
  queueMicrotaskFn: typeof queueMicrotask === "function" ? queueMicrotask : null,
  setTimeoutFn: typeof setTimeout === "function" ? setTimeout : null,
  setAuthInitialized: (next) => { authInitialized = !!next; },
  setAuthBootstrapSnapshot: (next) => { authBootstrapSnapshot = next; },
  readAuthBootstrapSnapshot,
  writeAuthBootstrapSnapshot,
  clearAuthBootstrapSnapshot,
  applyAuthBootstrapSnapshot,
  applyPersistedAuthProfileHints,
  bindPushOpenTargetMessageHandler,
  loadUserScopedPersisted,
  loadGuestScopedPersisted,
  applyPendingInitialRouteState,
  resetUserScopedState,
  render,
  schedulePerfWarmMark,
  fetchPublicBootstrapPayload,
  ensureTabData,
  sanitizeTabForSession,
  stopLiveListeners,
  suspendRender,
  resumeRender,
  reportCriticalRuntimeFailure,
  runBootstrapUser: (user) => sessionDataRuntimeController.bootstrapUser(user),
  postLoginRouteOpenCoordinator
});

authSessionStartupCoordinator.start({
  hasInlineBootstrapPayload,
  hasWindowBootstrapPromise
});

window.addEventListener("load", () => {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
});
