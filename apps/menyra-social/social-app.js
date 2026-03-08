import { auth, db, app } from "/shared/firebase-config.js?v=2026-03-08-firestore-net-1";
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
} from "./core/state-factories.js";
import {
  normalizeInitialTab,
  normalizeAuthMode
} from "./core/route-auth-utils.js";
import { resolveInitialRouteState } from "./core/initial-route-state.js";
import {
  readAuthBootstrapSnapshotCore,
  buildAuthBootstrapSnapshotPayload,
  persistAuthBootstrapSnapshot,
  clearAuthBootstrapSnapshotStorage,
  applyAuthBootstrapSnapshotToProfile
} from "./core/auth-bootstrap-snapshot.js";
import {
  shouldResetUserScopedStateCore,
  resolvePendingAuthRouteFlagsCore
} from "./core/auth-bootstrap-flow-utils.js";
import {
  runPostLoginPendingRouteOpenFlowCore,
  runPostLoginNonBlockingRouteOpenFlowCore
} from "./core/auth-post-login-route-open-utils.js";
import { bootstrapAuthenticatedSessionCore } from "./core/auth-user-bootstrap-utils.js";
import {
  clearQueryParamsFromCurrentUrlCore,
  resolveRouteStateFromTargetUrlCore,
  applyPendingRouteStateCore
} from "./core/push-route-query-utils.js";
import {
  resolveNativePushActorCore,
  resolveNativePushBodyCore,
  buildNativePushAlertPayloadCore
} from "./core/push-alert-utils.js";
import {
  canUseNativeNotificationsCore,
  buildPushActivationIssueCore,
  getPushActivationIssueMessageCore,
  mapPushActivationErrorCore,
  canEmitNativePushAlertsCore
} from "./core/push-activation-utils.js";
import { ensureNotificationPermissionCore } from "./core/push-permission-utils.js";
import {
  readPushSeenIdsCore,
  writePushSeenIdsCore
} from "./core/push-seen-storage-utils.js";
import {
  getOrCreatePushDeviceIdCore,
  readPushTokenMetaCore,
  writePushTokenMetaCore
} from "./core/push-token-storage-utils.js";
import {
  ensurePushServiceWorkerRegistrationCore,
  waitForPushServiceWorkerReadyCore
} from "./core/push-service-worker-utils.js";
import {
  ensureFirebaseMessagingModuleCore,
  ensureMessagingClientCore
} from "./core/push-messaging-utils.js";
import {
  hasPushDeviceRegistrationPrerequisitesCore,
  isPushTokenSyncFreshCore,
  buildPushDeviceRegistrationPayloadCore,
  buildPushDeviceDisablePayloadCore
} from "./core/push-device-registration-utils.js";
import {
  normalizeNotificationItemCore,
  mapNotificationSnapshotCore
} from "./core/notification-item-utils.js";
import {
  shouldSurfaceNativePushNowCore,
  addNotificationItemsToSeenSetCore,
  collectUnseenUnreadNotificationItemsFromChangesCore
} from "./core/notification-native-push-utils.js";
import {
  buildNotificationsLiveQueryCore,
  buildNotificationsFetchQueryCore,
  fetchNotificationsFromQueryCore
} from "./core/notification-query-utils.js";
import {
  buildNotificationWritePayloadCore,
  normalizeNotificationWriteIdsCore
} from "./core/notification-write-utils.js";
import {
  markNotificationReadInListCore,
  markAllNotificationsReadInListCore
} from "./core/notification-read-state-utils.js";
import {
  isChatNotificationTypeCore,
  isFollowNotificationTypeCore,
  isPostNotificationTypeCore,
  buildNotificationChatTargetCore,
  buildNotificationProfileTargetCore
} from "./core/notification-target-utils.js";
import {
  buildFollowRequestDocPayloadCore,
  buildFollowRequestNotificationPayloadCore,
  buildAcceptedFollowRecordPayloadCore,
  buildFollowAcceptedNotificationPayloadCore
} from "./core/follow-request-payload-utils.js";
import { mapFollowingSnapshotCore } from "./core/following-listener-utils.js";
import {
  normalizePendingChatUidCore,
  isSelfPendingChatTargetCore,
  isChatThreadAlreadyOpenCore,
  buildChatRouteTargetProfileCore
} from "./core/chat-route-open-utils.js";
import {
  normalizePendingNotificationIdCore,
  findNotificationByIdCore,
  prependNotificationByIdCore
} from "./core/notification-route-open-utils.js";
import {
  normalizePendingProfileRestaurantIdCore,
  isPendingProfileAlreadyOpenCore,
  normalizeProfileTopTabFromRouteCore
} from "./core/profile-route-open-utils.js";
import {
  isPushOpenTargetMessageCore,
  parsePushOpenTargetPayloadCore,
  shouldHandlePushOpenTargetCore
} from "./core/push-open-target-message-utils.js";
import {
  normalizePendingPostIdCore,
  findPostInLocalSourcesCore,
  resolveNotificationCommentHighlightIdCore
} from "./core/post-notification-open-utils.js";
import {
  normalizeUserPostDocCore,
  normalizeRestaurantPostDocCore
} from "./core/post-doc-normalize-utils.js";
import {
  readNotificationPostLookupCore,
  shouldFetchUserNotificationPostCore,
  shouldFetchRestaurantNotificationPostCore
} from "./core/post-notification-fetch-utils.js";
import { highlightCommentInModalCore } from "./core/notification-comment-highlight-utils.js";
import { buildFollowAcceptedFollowingStateCore } from "./core/follow-accepted-state-utils.js";
import {
  buildResolveUserByHandleCandidatesCore,
  deriveFollowTargetIdentityCore,
  isSelfFollowTargetCore
} from "./core/follow-target-utils.js";
import {
  isGuestSessionCore,
  sanitizeTabForSessionCore,
  applyPendingInitialRouteStateCore
} from "./core/session-tab-guards.js";
import {
  loadLogoCacheCore,
  scheduleLogoCacheWriteCore,
  loadAvatarCacheCore,
  scheduleAvatarCacheWriteCore,
  resolveRestaurantLogoCore,
  resolveUserAvatarCore,
  resolveShellAvatarUrlCore
} from "./core/avatar-logo-cache.js";
import {
  saveMenuLayoutToStorageCore,
  getMenuLayoutThemeCore,
  getFocusCardClassCore
} from "./core/menu-layout-utils.js";
import {
  foldMenuTextCore,
  inferMenuTypeHintCore,
  coerceMenuItemsFromDataCore
} from "./core/menu-item-coercion-utils.js";
import {
  scheduleIdleCore,
  enqueueMicrotaskCore
} from "./core/task-schedule-utils.js";
import { focusInputByIdCore } from "./core/dom-focus-utils.js";
import { scoreSearchMatchCore } from "./core/search-score-utils.js";
import {
  sanitizeDisplayNameCore,
  normalizeSearchQueryCore,
  normalizeSearchKeyCore
} from "./core/text-normalize-utils.js";
import {
  normalizeHandleCore,
  isGenericHandleCore,
  resolvePreferredHandleCore,
  normalizeFollowHandleCore
} from "./core/handle-utils.js";
import {
  createLeadScopeMapCore,
  createCustomerScopeMapCore,
  normalizeLeadScopeKeyCore,
  normalizeCustomerScopeKeyCore,
  createEmptyLeadsStateCore,
  createEmptyCustomersStateCore
} from "./core/crm-scope-state-utils.js";
import {
  normalizeRoleListCore,
  roleLabelCore,
  buildRoleSwitchUrlCore
} from "./core/role-switch-utils.js";
import { formatCountCore } from "./core/count-format-utils.js";
import {
  logoFitClassCore,
  isLocalBusinessProfileCore
} from "./core/profile-display-utils.js";
import {
  renderMenuItemModalCore,
  renderMenuDetailModalCore
} from "./core/menu-modal-render-utils.js";
import { saveMenuItemFromModalCore } from "./core/menu-save-utils.js";
import { deleteMenuItemByIdCore } from "./core/menu-delete-utils.js";
import {
  renderCustomerModalCore,
  renderFocusModalCore
} from "./core/customer-focus-modal-render-utils.js";
import {
  renderChatModalCore,
  renderProfileModalCore,
  renderLikesModalCore,
  renderPostModalCore
} from "./core/overlay-basic-render-utils.js";
import { bindOverlayEventsCore } from "./core/overlay-bind-orchestrator-utils.js";
import { renderOverlaysCore } from "./core/overlay-render-orchestrator-utils.js";
import { renderLeadModalCore } from "./core/lead-modal-render-utils.js";
import { saveLeadFromModalCore } from "./core/lead-save-utils.js";
import { deleteLeadFromModalCore } from "./core/lead-delete-utils.js";
import { saveCustomerFromModalCore } from "./core/customer-save-utils.js";
import { convertLeadToCustomerCore } from "./core/lead-convert-utils.js";
import { saveCeoStaffFromViewCore } from "./core/staff-save-utils.js";
import { renderSettingsViewCore } from "./core/settings-render-utils.js";
import { escapeHtmlCore } from "./core/html-utils.js";
import {
  clampCropPercentCore,
  getMenuItemCropCore,
  getMenuItemObjectPositionCore,
  getFocusItemCropCore,
  getFocusItemObjectPositionCore
} from "./core/crop-utils.js";
import { formatPriceCore, parsePriceValueCore } from "./core/price-utils.js";
import {
  normalizeOrderItemCore,
  normalizeOrderDocCore
} from "./core/order-normalize-utils.js";
import { normalizeRestaurantTypeCore } from "./core/restaurant-type-utils.js";
import { buildShopVariantKeyCore } from "./core/shop-variant-utils.js";
import {
  normalizeOptionListCore,
  normalizeMenuTypeCore
} from "./core/menu-input-utils.js";
import {
  normalizeLeadCountryCore,
  buildLeadAccountEmailCore,
  inferLeadCountryFromTextCore
} from "./core/lead-country-utils.js";
import { normalizeShopCartStateCore } from "./core/shop-cart-state-utils.js";
import {
  getShopCartProfileContextCore,
  getCartCountForRestaurantCore,
  canAddToShopCartCore,
  getShopCartTotalCore
} from "./core/shop-cart-access-utils.js";
import {
  getMenuRestaurantForProfileCore,
  ensureMenuDataForProfileCore,
  ensureFocusDataForProfileCore
} from "./core/profile-menu-focus-utils.js";
import {
  getBusinessCatalogModeCore,
  getBusinessCatalogLabelCore,
  isShopCatalogProfileCore,
  isRestaurantCafeProfileCore
} from "./core/catalog-mode-utils.js";
import { getBusinessProfileTypeCore } from "./core/business-profile-type-utils.js";
import {
  createDefaultLeadPricingCore,
  normalizeLeadPricingCore
} from "./core/lead-pricing-utils.js";
import {
  normalizeLeadSettingsCore,
  getLeadSettingsConfigCore,
  getLeadCountryCenterCore,
  buildLeadContactNameCore,
  getLeadMonthlyPriceCore,
  getLeadPriceForCycleCore
} from "./core/lead-settings-utils.js";
import {
  normalizeLeadStatusKeyCore,
  leadStatusLabelCore,
  customerStatusLabelCore,
  isCustomerRestaurantCore,
  leadTypeLabelCore,
  resolveCustomerTypeCore
} from "./core/lead-taxonomy-utils.js";
import { normalizeLeadTypeKeyCore } from "./core/lead-type-utils.js";
import {
  hasLeadLocationCoordsCore,
  toFiniteCoordNumberCore,
  normalizeCoordPairCore,
  preferStableCoordsCore,
  resolveCoordsFromShapeCore,
  resolveCoordsFromEntityCore
} from "./core/geo-coord-utils.js";
import {
  olcNormalizeLongitudeCore,
  olcClipLatitudeCore,
  sanitizePlusCodeCore,
  extractPlusCodeFromTextCore,
  olcDecodeValueCore,
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
} from "./core/plus-code-utils.js";
import {
  createLeadLocationCore,
  normalizeLeadLocationsCore,
  getPrimaryLeadLocationCore
} from "./core/lead-location-utils.js";
import {
  isRestaurantMarkedDeletedCore,
  forceHiddenEmailLocalPartCore,
  isForceHiddenHandleCore,
  isForceHiddenUidCore,
  isForceHiddenEmailCore,
  isForceHiddenBusinessEntityCore,
  isPublicBusinessRecordCore
} from "./core/business-visibility-utils.js";
import {
  isCeoUserCore,
  isAlbertCeoUserCore,
  hasGlobalCeoAccessCore,
  getCeoGpsOverrideCore
} from "./core/ceo-access-utils.js";
import {
  parseCoordNumberCore,
  uniqueStringListCore,
  normalizeCeoCountryCore,
  normalizeCeoPathCore,
  buildCeoNameCore
} from "./core/ceo-normalize-utils.js";
import { getCurrentCeoMetaCore } from "./core/ceo-meta-utils.js";
import {
  normalizeCeoStaffRecordCore,
  overlayCeoStaffProfileCore,
  buildCeoDirectorySyncPatchCore
} from "./core/ceo-staff-sync-utils.js";
import {
  computeLatestTimestampCore,
  saveFeedPostsCore
} from "./core/feed-cache-utils.js";
import {
  buildStoriesSignatureCore,
  refreshFeedStoriesCore
} from "./core/feed-story-utils.js";
import {
  getChatThreadIdCore,
  chatThreadStorageKeyCore,
  chatThreadDocRefCore,
  chatMessageDocRefCore,
  chatMessagesCollectionRefCore,
  getChatMessageTimestampCore,
  pruneChatMessagesCore,
  buildChatPreviewTextCore
} from "./core/chat-utils.js";
import {
  saveChatThreadIndexCore,
  readChatThreadIndexListCore,
  buildChatThreadSummaryFromMessagesCore,
  rebuildLegacyChatThreadIndexFromStorageCore,
  mergeChatThreadListsCore,
  loadChatThreadIndexCore,
  sortChatThreadsCore,
  rebuildChatThreadIndexFromStorageCore
} from "./core/chat-thread-index-utils.js";
import {
  normalizeChatThreadSummaryCore,
  getChatUnreadCountCore,
  upsertChatThreadListCore,
  isChatThreadArchivedCore,
  getChatThreadByIdCore,
  getActiveChatThreadSummaryCore
} from "./core/chat-thread-state-utils.js";
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
} from "./core/chat-message-utils.js";
import {
  buildChatThreadPatchFromMessagesCore,
  markIncomingChatMessagesAsReadCore,
  updateChatMessageListCore
} from "./core/chat-message-state-utils.js";
import {
  buildChatMessageSyncContextCore,
  buildChatRemotePayloadBundleCore,
  buildChatMessageNotificationCore
} from "./core/chat-remote-sync-utils.js";
import {
  collectUnreadIncomingChatMessagesCore,
  buildChatListenerLocalSeedCore,
  shouldUseChatLocalSeedCore,
  buildChatLocalMessageMapCore,
  buildSortedRemoteChatMessagesCore,
  hasUnreadIncomingRemoteMessagesCore
} from "./core/chat-read-sync-utils.js";
import {
  shouldIgnoreChatMessagesSnapshotCore,
  resolveChatMessagesAfterSnapshotCore
} from "./core/chat-message-listener-utils.js";
import {
  collectUnreadIncomingChatMessageIdsCore,
  buildChatUnreadResetPatchCore,
  buildChatMessageReadPatchCore
} from "./core/chat-remote-read-write-utils.js";
import {
  normalizeRemoteChatReadSyncInputsCore,
  buildRemoteChatReadSyncWriteTasksCore
} from "./core/chat-remote-read-sync-plan-utils.js";
import {
  renderChatMessagesPanelCore,
  renderChatPendingAttachmentsCore
} from "./core/chat-render-utils.js";
import { renderChatListPanelCore } from "./core/chat-list-render-utils.js";
import {
  mapChatThreadDocsToSummariesCore,
  buildMergedChatThreadsFromRemoteCore,
  shouldRenderChatThreadListAfterRemoteSyncCore
} from "./core/chat-thread-listener-utils.js";
import {
  normalizeChatOpenProfileCore,
  buildChatModalStateOnOpenCore,
  buildClosedChatModalStateCore,
  buildFallbackChatThreadProfileCore,
  getSafeChatThreadIdFromThreadCore,
  shouldCloseChatModalForThreadCore,
  filterChatThreadsAfterDeleteCore
} from "./core/chat-thread-action-state-utils.js";
import {
  buildNextChatAttachmentsCore,
  removePendingChatAttachmentCore,
  toggleChatMessageFlagCore,
  createOutgoingChatMessageCore
} from "./core/chat-compose-utils.js";
import {
  resolveChatSendPayloadCore,
  buildChatSendLocalUpdateCore
} from "./core/chat-send-flow-utils.js";
import {
  captureChatInputFocusStateCore,
  restoreChatInputFocusStateCore,
  scrollChatMessagesToBottomCore,
  autosizeTextareaCore
} from "./core/chat-dom-utils.js";
import {
  bindProfileOverlayEventsCore,
  bindLikesOverlayEventsCore,
  bindCustomerOverlayEventsCore
} from "./core/overlay-basic-bind-utils.js";
import {
  bindChatOverlayEventsCore,
  bindPostOverlayEventsCore
} from "./core/overlay-chat-post-bind-utils.js";
import {
  bindMenuOverlayEventsCore,
  bindFocusOverlayEventsCore
} from "./core/overlay-menu-focus-bind-utils.js";
import { bindLeadOverlayEventsCore } from "./core/overlay-lead-bind-utils.js";
import { bindMenuDetailOverlayEventsCore } from "./core/overlay-menu-detail-bind-utils.js";
import { bindAppShellEventsCore } from "./core/app-events-shell-bind-utils.js";
import { bindAppMenuFocusEventsCore } from "./core/app-events-menu-focus-bind-utils.js";
import { bindAppSettingsProfileEventsCore } from "./core/app-events-settings-profile-bind-utils.js";
import { bindAppChatUploadEventsCore } from "./core/app-events-chat-upload-bind-utils.js";
import {
  bindCrmStaffEventsCore,
  bindLeadInlineCreateEventsCore
} from "./core/app-events-crm-staff-bind-utils.js";
import { bindAppEventsCore as bindAppEventsMainCore } from "./core/app-events-main-bind-utils.js";
import {
  ensureTabDataCore,
  loadAuthProfileCore
} from "./core/tab-auth-load-utils.js";

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
const FAST_LIMITS = {
  feed: 20,
  feedFallback: 40,
  feedDelta: 8,
  userPosts: 24,
  businessPosts: 24,
  restaurants: 80,
  stories: 24,
  storiesFallback: 30,
  likes: 20,
  comments: 40
};
const SEARCH_LIMITS = {
  users: 10,
  businesses: 12
};
const FAST_MODE = true;
const CACHE_KEYS = {
  feed: "menyra_social_feed_cache_v1",
  restaurants: "menyra_social_restaurants_cache_v1",
  stories: "menyra_social_stories_cache_v1"
};
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
const FEED_PRELOAD_LIMIT = 3;
const FEED_PRELOAD_ATTR = "data-menyrasocial-feed-preload";
const FEED_META_LISTEN_LIMIT = 20;
const CRM_PAGE_SIZE = 20;

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
    status: ""
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
let ceoStaffLoadPromise = null;
let ceoCrmCountsPromise = null;
let hiddenLegacyCeoUids = [];
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
let chatSendDispatchLock = false;
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
let lastAppHtml = "";
let lastRenderMode = "";
let lastRenderedMainTab = "";
let feedDeltaTimer = null;
let searchTimer = null;
let searchToken = 0;
let crmAutoLoadObserver = null;
const searchCache = new Map();
let notificationsUnsub = null;
let followingUnsub = null;
let userDocUnsub = null;
let userDocLiveKey = "";
let pushMessagingClient = null;
let firebaseMessagingModulePromise = null;
let pushActivationIssue = "";
let leafletLoadPromise = null;
let leafletLoadFailed = false;
let profileViewUnsub = null;
let feedUnsub = null;
let storiesUnsub = null;
let chatThreadsUnsub = null;
let chatMessagesUnsub = null;
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
let focusRotateTimer = null;
let focusRotateKey = "";
let authInitialized = false;
let authBootstrapSnapshot = null;
let pendingInitialTab = "";
let pendingAuthMode = "";
let crmLazyRenderers = null;
let crmLazyRenderersPromise = null;
let crmLazyRenderersPrefetchQueued = false;

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

function resolveRestaurantLogo(restaurantId, raw, size = "avatar") {
  return resolveRestaurantLogoCore({
    restaurantId,
    raw,
    size,
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

function logoFitClass(isBusiness) {
  return logoFitClassCore(isBusiness);
}

function escapeHtml(value) {
  return escapeHtmlCore(value);
}

function formatCount(value) {
  return formatCountCore(value);
}

function sanitizeDisplayName(value, fallback) {
  return sanitizeDisplayNameCore(value, fallback);
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

function normalizeSearchQuery(value) {
  return normalizeSearchQueryCore(value);
}

function normalizeSearchKey(value) {
  return normalizeSearchKeyCore(value);
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

function buildLeadAccountEmail(name = "") {
  return buildLeadAccountEmailCore(name);
}

function buildLeadContactName(firstName = "", lastName = "", fallback = "") {
  return buildLeadContactNameCore(firstName, lastName, fallback);
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

function normalizeLeadStatusKey(value) {
  return normalizeLeadStatusKeyCore(value);
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

function normalizeLeadTypeKey(value) {
  return normalizeLeadTypeKeyCore(value);
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

function hasLeadLocationCoords(location) {
  return hasLeadLocationCoordsCore(location);
}

function toFiniteCoordNumber(value) {
  return toFiniteCoordNumberCore(value);
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

function olcNormalizeLongitude(value) {
  return olcNormalizeLongitudeCore(value);
}

function olcClipLatitude(value) {
  return olcClipLatitudeCore(value);
}

function sanitizePlusCode(raw) {
  return sanitizePlusCodeCore(raw);
}

function extractPlusCodeFromText(text) {
  return extractPlusCodeFromTextCore(text, {
    sanitizePlusCodeFn: sanitizePlusCode
  });
}

function olcDecodeValue(ch) {
  return olcDecodeValueCore(ch);
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

function createLeadLocation({ address = "", lat = null, lng = null } = {}) {
  return createLeadLocationCore({ address, lat, lng });
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

function normalizeOptionList(value) {
  return normalizeOptionListCore(value);
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

function normalizeMenuType(value) {
  return normalizeMenuTypeCore(value);
}

function formatPrice(value, currency = "€") {
  return formatPriceCore(value, currency);
}

function parsePriceValue(value) {
  return parsePriceValueCore(value);
}

function normalizeMenuItemDoc(data, id) {
  const d = data || {};
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
  const rawImages = [];
  [d.imageUrls, d.images, d.image, d.gallery, d.photos, d.media, d.mediaUrls, d.photoUrls, d.pictureUrls].forEach((list) => {
    if (Array.isArray(list)) {
      rawImages.push(...list);
    } else if (typeof list === "string" && list.trim()) {
      rawImages.push(list);
    }
  });
  const primaryImage = normalizeImg(
    d.imageUrl
      || d.imageURL
      || d.image_url
      || d.image
      || d.photoUrl
      || d.photoURL
      || d.photo_url
      || d.img
      || d.imgUrl
      || d.imgURL
      || d.thumbnail
      || d.thumb
      || d.cover
      || d.coverUrl
      || d.coverURL
      || ""
  );
  const mergedImages = Array.from(new Set([primaryImage, ...rawImages.map(normalizeImg)].filter(Boolean)));
  const sizes = normalizeOptionList(d.sizes || d.sizeOptions || d.availableSizes || d.variants || d.size);
  const colors = normalizeOptionList(d.colors || d.colours || d.colorOptions || d.availableColors || d.color);
  const stockRaw = d.stock ?? d.stockCount ?? d.inventory ?? d.quantity ?? "";
  const stockNumber = Number(stockRaw);
  const crop = getMenuItemCrop(d);
  return {
    id: d.id || id || "",
    type: normalizeMenuType(d.type || d.menuType || d.kind || d.group || d.section),
    category: d.category || "Sonstiges",
    name: d.name || d.title || "Produkt",
    description: d.description || d.desc || "",
    longDescription: d.longDescription || "",
    allergens: d.allergens || d.allergen || "",
    brand: String(d.brand || d.manufacturer || "").trim(),
    sku: String(d.sku || d.articleNumber || d.articleNo || d.code || "").trim(),
    stock: stockRaw === "" || stockRaw === null || stockRaw === undefined
      ? null
      : (Number.isFinite(stockNumber) ? Math.max(0, Math.round(stockNumber)) : null),
    sizes,
    colors,
    cropX: crop.x,
    cropY: crop.y,
    price: d.price ?? "",
    available: d.available !== false,
    imageUrl: mergedImages[0] || "",
    imageUrls: mergedImages
  };
}

function foldMenuText(value) {
  return foldMenuTextCore(value);
}

function inferMenuTypeHint(value) {
  return inferMenuTypeHintCore(value);
}

function coerceMenuItemsFromData(data) {
  return coerceMenuItemsFromDataCore({
    data,
    normalizeMenuItemDoc
  });
}

function scoreSearchMatch(text, query) {
  return scoreSearchMatchCore(text, query);
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
  const confirmed = typeof window !== "undefined"
    ? window.confirm("Diesen Chat wirklich loeschen?")
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
    lastRenderMode,
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
    console.error(err);
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
    const nextMessages = resolveChatMessagesAfterSnapshotCore({
      profile,
      remoteMessages,
      hasUnreadIncomingRemoteMessages: (messages) => hasUnreadIncomingRemoteMessagesCore(messages),
      markChatThreadAsRead: (threadProfile, messages) => markChatThreadAsRead(threadProfile, messages),
      syncRemoteChatReadState: (threadProfile, messages) => void syncRemoteChatReadState(threadProfile, messages),
      saveChatThreadMessages: (threadProfile, messages) => saveChatThreadMessages(threadProfile, messages),
      syncChatThreadSummary: (threadProfile, messages) => syncChatThreadSummary(threadProfile, messages)
    });
    state.chatModal.messages = pruneChatMessages(nextMessages);
    render();
  }, (err) => {
    console.error(err);
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
  if (!senderUid || !partnerUid || !senderThreadId || !recipientThreadId || senderUid === partnerUid) return;

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
  if (!senderThreadRef || !senderMessageRef || !recipientThreadRef || !recipientMessageRef) return;

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
      unreadCount: recipientUnread + 1,
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
    await pushUserNotificationWithId(partnerUid, notification.notificationId, {
      ...notification.payload
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

function openChatWithProfile(profile) {
  if (!profile) return;
  if (!state.user) {
    openGuestAuthPrompt("Bitte einloggen, um Chats zu nutzen.");
    return;
  }
  const nextProfile = normalizeChatOpenProfileCore({
    profile,
    normalizeHandle: (value) => normalizeHandle(value)
  });
  if (!nextProfile) return;
  upsertChatThread(nextProfile);
  state.drawerOpen = false;
  state.chatSettingsOpen = false;
  state.chatThreadMenuId = "";
  state.profileModal = { open: false, profile: null };
  state.activeTab = "chat";
  const nextMessages = markChatThreadAsRead(nextProfile);
  state.chatModal = buildChatModalStateOnOpenCore({
    currentChatModal: state.chatModal,
    nextProfile,
    nextMessages,
    getChatThreadId: (value) => getChatThreadId(value)
  });
  syncChatThreadSummary(nextProfile, state.chatModal.messages);
  void syncRemoteChatReadState(nextProfile, state.chatModal.messages);
  startActiveChatMessagesListener(nextProfile);
  render();
}

function closeChatModal() {
  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  stopActiveChatMessagesListener();
  state.chatSettingsOpen = false;
  state.chatThreadMenuId = "";
  state.chatModal = buildClosedChatModalStateCore(state.chatModal);
  if (state.activeTab === "chat") {
    render();
  }
}

async function sendChatMessage() {
  if (!state.chatModal.open || !state.chatModal.profile) return;
  if (chatSendDispatchLock) return;
  chatSendDispatchLock = true;
  queueMicrotask(() => {
    chatSendDispatchLock = false;
  });
  if (isActiveChatThreadBlocked()) {
    alert("Dieser Chat ist blockiert. Entblocke ihn in der Chat-Uebersicht.");
    return;
  }
  const input = document.getElementById("chatMessageInput");
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
  } catch (err) {
    console.error(err);
  }
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
  loadLogoCache();
  const savedSettings = safeStorage.getItem(STORAGE_KEYS.settings);
  if (savedSettings) {
    try { state.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) }; } catch {}
  }
  const savedMenuLayout = safeStorage.getItem(STORAGE_KEYS.menuLayout);
  if (savedMenuLayout) {
    try { state.menuLayout = { ...DEFAULT_MENU_LAYOUT, ...JSON.parse(savedMenuLayout) }; } catch {}
  }

  // user-scoped profile/avatar loaded after login

  const restaurantsCache = readCache(CACHE_KEYS.restaurants);
  let needsRestaurantMetaHydration = false;
  if (restaurantsCache?.data?.length) {
    state.restaurants = restaurantsCache.data;
    needsRestaurantMetaHydration = restaurantsCache.data.some((rest) => !(rest?.logoUrl || rest?.logo || rest?.logoURL));
  }

  const feedCache = readCache(CACHE_KEYS.feed);
  let cachedHydrationIds = [];
  if (feedCache?.data?.length) {
    state.feedPosts = feedCache.data;
    cachedHydrationIds = collectFeedHydrationIds(feedCache.data, { max: 6 });
  }

  const storiesCache = readCache(CACHE_KEYS.stories);
  if (!state.stories.length && storiesCache?.data?.length) state.stories = storiesCache.data;

  state.postMeta = {};

  scheduleIdle(() => {
    if (state.restaurants.length) {
      rebuildBusinessLocations();
    }

    const feedUpdated = syncFeedPostLogos();
    const storiesUpdated = refreshFeedStories({ posts: state.feedPosts, force: true });
    preloadFeedHeroImages(state.feedPosts);

    if (feedUpdated || storiesUpdated) {
      const inMain = lastRenderMode === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
      if (!updatedFeed) render();
    }

    if (needsRestaurantMetaHydration) {
      void Promise.resolve(enrichRestaurantsWithPublicMeta(state.restaurants))
        .then((list) => {
          state.restaurants = list;
          rebuildBusinessLocations();
          const feedChanged = syncFeedPostLogos();
          const storiesChanged = refreshFeedStories({ posts: state.feedPosts, force: true });
          writeCache(CACHE_KEYS.restaurants, list);
          if (feedChanged || storiesChanged) {
            const inMain = lastRenderMode === "main";
            const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
            if (!updatedFeed) render();
          }
        })
        .catch(() => null);
    }

    if (cachedHydrationIds.length) {
      void hydrateRestaurantsByIds(cachedHydrationIds, { max: cachedHydrationIds.length });
    }
  });
}

function loadUserScopedPersisted(user) {
  if (!user?.uid) return;
  const uid = user.uid;
  const savedProfile = safeStorage.getItem(profileKey(uid));
  if (savedProfile) {
    try { state.userProfile = { ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) }; } catch { state.userProfile = { ...DEFAULT_PROFILE }; }
  } else {
    state.userProfile = { ...DEFAULT_PROFILE };
  }
  state.userProfile.uid = uid;

  userAvatarCache = "";
  lastShellAvatarUrl = "";
  loadAvatarCache(uid);
  if (!state.userProfile.avatar && userAvatarCache && !isPlaceholderUrl(userAvatarCache)) {
    state.userProfile.avatar = userAvatarCache;
  }
  if (userAvatarCache && !isPlaceholderUrl(userAvatarCache)) {
    lastShellAvatarUrl = userAvatarCache;
  }

  try {
    const raw = state.userProfile.avatar || userAvatarCache || "";
    const url = getOptimizedImageUrl(raw, "avatar");
    if (url && !isPlaceholderUrl(url)) {
      primeSelfAvatarCache(url);
    }
  } catch {}

  const userPostsCache = readCache(userPostsKey(uid));
  state.userPosts = userPostsCache?.data?.length ? userPostsCache.data : [];

  const rid = state.userProfile.restaurantId || "";
  if (rid) {
    const businessCache = readCache(businessPostsKey(rid));
    state.businessPosts = businessCache?.data?.length ? businessCache.data : [];
  } else {
    state.businessPosts = [];
  }

  const scopedNotifs = safeStorage.getItem(notificationsKey(uid));
  if (scopedNotifs) {
    try { state.notifications = JSON.parse(scopedNotifs); } catch { state.notifications = []; }
  } else {
    const legacyNotifs = safeStorage.getItem(STORAGE_KEYS.notifications);
    if (legacyNotifs) {
      try {
        state.notifications = JSON.parse(legacyNotifs);
        safeStorage.setItem(notificationsKey(uid), JSON.stringify(state.notifications));
        safeStorage.removeItem(STORAGE_KEYS.notifications);
      } catch {
        state.notifications = [];
      }
    } else {
      state.notifications = [];
    }
  }

  const scopedFollowing = safeStorage.getItem(followingKey(uid));
  if (scopedFollowing) {
    try {
      const parsed = JSON.parse(scopedFollowing);
      const handlesRaw = Array.isArray(parsed)
        ? parsed
        : (Array.isArray(parsed?.handles) ? parsed.handles : []);
      const targetIdsRaw = Array.isArray(parsed?.targetIds) ? parsed.targetIds : [];
      state.followingHandles = Array.from(new Set(
        handlesRaw
          .map((item) => normalizeFollowHandle(item))
          .filter(Boolean)
      ));
      state.followingTargetIds = Array.from(new Set(
        targetIdsRaw
          .map((id) => String(id || "").trim())
          .filter(Boolean)
      ));
    } catch {
      state.followingHandles = [];
      state.followingTargetIds = [];
    }
  } else {
    const legacyFollowing = safeStorage.getItem(STORAGE_KEYS.following);
    if (legacyFollowing) {
      try {
        state.followingHandles = Array.from(new Set(
          (JSON.parse(legacyFollowing) || [])
            .map((item) => normalizeFollowHandle(item))
            .filter(Boolean)
        ));
        state.followingTargetIds = [];
        saveFollowing(state.followingHandles, state.followingTargetIds);
        safeStorage.removeItem(STORAGE_KEYS.following);
      } catch {
        state.followingHandles = [];
        state.followingTargetIds = [];
      }
    } else {
      state.followingHandles = [];
      state.followingTargetIds = [];
    }
  }

  const scopedCart = safeStorage.getItem(shopCartKey(uid));
  if (scopedCart) {
    try {
      state.shopCart = normalizeShopCartState(JSON.parse(scopedCart));
    } catch {
      state.shopCart = createEmptyShopCart();
    }
  } else {
    state.shopCart = createEmptyShopCart();
  }
  state.orders = createEmptyOrdersState();

  state.chatThreads = sortChatThreads(loadChatThreadIndex(uid).map((thread) => {
    const messages = loadChatThreadMessages(thread);
    const lastMessage = messages[messages.length - 1] || null;
    return {
      ...thread,
      lastMessage: lastMessage ? buildChatPreviewText(lastMessage) : String(thread?.lastMessage || ""),
      updatedAt: lastMessage
        ? Math.max(getChatMessageTimestamp(lastMessage), Number(thread?.updatedAt || 0))
        : Number(thread?.updatedAt || Date.now())
    };
  }));
  saveChatThreadIndex(state.chatThreads);
}

function loadGuestScopedPersisted() {
  const scopedCart = safeStorage.getItem(shopCartKey(GUEST_SCOPE_UID));
  if (scopedCart) {
    try {
      state.shopCart = normalizeShopCartState(JSON.parse(scopedCart));
    } catch {
      state.shopCart = createEmptyShopCart();
    }
  } else {
    state.shopCart = createEmptyShopCart();
  }
  state.orders = createEmptyOrdersState();
}

function resetUserScopedState() {
  stopActiveChatMessagesListener();
  stopRestaurantMetaListeners();
  stopMenuItemMetaListeners();
  menuDetailCloseBound = false;
  commentAvatarCache.clear();
  commentAvatarPending.clear();
  userSearchAvatarCache.clear();
  businessProfileCache.clear();
  userProfileCache.clear();
  state.postMeta = {};
  state.userPosts = [];
  state.businessPosts = [];
  state.profileView = null;
  state.profileModal = { open: false, profile: null };
  state.chatSettingsOpen = false;
  state.chatListScope = "inbox";
  state.chatThreadMenuId = "";
  state.chatModal = { open: false, profile: null, messages: [], draft: "", attachments: [] };
  state.postModal = { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false };
  state.likesModal = { open: false, postId: "", animate: false };
  state.menuDetail = createEmptyMenuDetailState();
  state.menuItemMeta = {};
  menuItemCountsRequested.clear();
  state.leads = createEmptyLeadsState();
  state.customers = createEmptyCustomersState();
  state.staff = {
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
  };
  state.leadModal = { open: false, mode: "create", lead: null, status: "", loading: false, deleting: false, actionsOpen: false, logoFile: null, logoPreview: "", coords: null, locations: [] };
  state.customerModal = { open: false, mode: "edit", customer: null, status: "", loading: false, logoFile: null, logoPreview: "" };
  state.selectedBusiness = null;
  state.followingHandles = [];
  state.followingTargetIds = [];
  state.pendingFollowRequests = [];
  state.chatThreads = [];
  state.shopCart = createEmptyShopCart();
  state.orders = createEmptyOrdersState();
  state.favoriteMenuItems = createEmptyFavoriteMenuItemsState();
  state.notifications = [];
  state.roleSwitchRoles = [];
  state.roleSwitchRestaurantId = "";
  state.userProfile = { ...DEFAULT_PROFILE };
  userAvatarCache = "";
  lastShellAvatarUrl = "";
  dataLoaded.profile = false;
  dataLoaded.following = false;
  dataLoaded.notifications = false;
  dataLoaded.leads = false;
  dataLoaded.customers = false;
  dataLoaded.staff = false;
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
    const cachedName = String(cached?.name || cached?.restaurantName || "").trim();
    const cachedLogo = String(cached?.logoUrl || cached?.logo || cached?.logoURL || "").trim();
    const rowName = String(row?.businessName || row?.restaurantName || row?.business || "").trim();
    const rowLogo = String(row?.logoUrl || row?.logo || row?.logoURL || "").trim();
    if ((cachedName && cachedLogo) || (rowName && rowLogo)) continue;
    ids.push(rid);
  }
  return ids;
}

async function hydrateRestaurantsByIds(restaurantIds, { max = 24 } = {}) {
  if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) return;

  const uniqueIds = Array.from(new Set(restaurantIds.filter(Boolean)));
  if (!uniqueIds.length) return;

  const existing = new Map((state.restaurants || []).map((rest) => [rest.id, rest]));
  const missing = uniqueIds.filter((id) => {
    const stored = existing.get(id);
    if (!stored) return true;
    return !(stored.logoUrl || stored.logo || stored.logoURL);
  }).slice(0, max);
  if (missing.length === 0) return;

  const loaded = [];

  for (const rid of missing) {
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
      if (name || logoUrl || city || type) {
        loaded.push({
          id: rid,
          name,
          restaurantName: restData.restaurantName || "",
          logoUrl,
          city,
          ...(type ? { type, customerType: type } : {})
        });
      }
    } catch (e) {
      console.warn("hydrateRestaurantsByIds failed for", rid, e);
    }
  }

  if (loaded.length) {
    state.restaurants = mergeRestaurants(state.restaurants, loaded);
    rebuildBusinessLocations();
    const feedUpdated = syncFeedPostLogos();
    const storiesUpdated = refreshFeedStories({ force: true });
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
  if (!state.feedPosts.length) return false;
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
  if (!changed && next.length === state.feedPosts.length) return false;
  state.feedPosts = next;
  return true;
}

function buildStoriesSignature(storyItems = []) {
  return buildStoriesSignatureCore(storyItems);
}

function refreshFeedStories({ posts = state.feedPosts, force = false } = {}) {
  const result = refreshFeedStoriesCore({
    posts,
    force,
    fastMode: FAST_MODE,
    buildStoriesFromFeed,
    currentSignature: feedStoriesSignature
  });
  if (!result.updated) return false;
  feedStoriesSignature = result.signature;
  state.stories = result.stories;
  writeCache(CACHE_KEYS.stories, result.stories);
  return true;
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

function normalizeHandle(name) {
  return normalizeHandleCore(name);
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

function parseCoordNumber(value) {
  return parseCoordNumberCore(value);
}

function uniqueStringList(values = []) {
  return uniqueStringListCore(values);
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

function buildCeoName({ firstName = "", lastName = "", fallback = "", email = "" } = {}) {
  return buildCeoNameCore({ firstName, lastName, fallback, email });
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
    if (state.activeTab === "feed") return;
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

function normalizeEmailValue(value) {
  return String(value || "").trim().toLowerCase();
}

function getRestaurantEmailCandidates(rest = {}) {
  return [
    rest.ownerEmail,
    rest.email,
    rest.contactEmail,
    rest.socialEmail,
    rest.loginEmail,
    rest.accountEmail,
    rest?.owner?.email,
    rest?.contact?.email,
    rest?.account?.email
  ].map((item) => String(item || "").trim()).filter(Boolean);
}

function getRestaurantUidCandidates(rest = {}) {
  return [
    rest.ownerUid,
    rest.socialUid,
    rest.uid,
    rest.userUid,
    rest.accountUid,
    rest.ownerId
  ].map((item) => String(item || "").trim()).filter(Boolean);
}

function matchesRestaurantIdentity(rest, { uid = "", email = "" } = {}) {
  if (!rest) return false;
  const uidKey = String(uid || "").trim();
  if (uidKey) {
    const byUid = getRestaurantUidCandidates(rest).some((candidate) => candidate === uidKey);
    if (byUid) return true;
  }
  const emailKey = normalizeEmailValue(email);
  if (emailKey) {
    const byEmail = getRestaurantEmailCandidates(rest).some((candidate) => normalizeEmailValue(candidate) === emailKey);
    if (byEmail) return true;
  }
  return false;
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
    if (state.activeTab === "feed") return;
  }
  render();
}

function ensureLeafletStylesheet() {
  if (typeof document === "undefined") return;
  if (document.querySelector('link[data-leaflet-css="1"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = LEAFLET_CSS_URL;
  link.dataset.leafletCss = "1";
  document.head.appendChild(link);
}

async function ensureLeafletLoaded() {
  if (window.L) return true;
  if (leafletLoadFailed) return false;
  if (leafletLoadPromise) return leafletLoadPromise;
  ensureLeafletStylesheet();
  leafletLoadPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.dataset.leafletJs = "1";
    script.onload = () => {
      leafletLoadFailed = !window.L;
      resolve(!!window.L);
    };
    script.onerror = () => {
      leafletLoadFailed = true;
      resolve(false);
    };
    document.head.appendChild(script);
  }).finally(() => {
    leafletLoadPromise = null;
  });
  return leafletLoadPromise;
}

let leafletMap = null;
let leafletBizMarkers = [];
let leafletUserMarker = null;
let locationPickerMap = null; // NEU: Fuer das Settings-Modal
let locationPickerBizMarkers = [];
let verifiedMapLocation = null; // NEU: Fuer die Koordinaten-Speicherung
let locationPickerTarget = { addressInputId: "settingsAddress", coordsDisplayId: "coordsDisplay", context: "settings" };

function hashValue(input) {
  return Array.from(String(input || "")).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function getRestaurantLocations(rest) {
  const geo = getGeo(rest) || {};
  return normalizeLeadLocations(rest?.locations || [], rest?.address || rest?.city || "", {
    lat: rest?.lat ?? geo?.lat,
    lng: rest?.lng ?? geo?.lng
  });
}

function normalizeBusinessLocation(rest, idx, location = null, locationIndex = 0) {
  const geo = getGeo(rest);
  const baseLat = 42.6629;
  const baseLng = 21.1655;
  const hash = hashValue(`${rest.id || rest.name || idx}:${locationIndex}`);

  const row = location || {};
  const rowCoords = resolveCoordsFromEntity(row);
  const restCoords = resolveCoordsFromEntity(rest)
    || normalizeCoordPair(rest?.lat ?? geo?.lat, rest?.lng ?? geo?.lng);
  const normalizedCoords = preferStableCoords(rowCoords, restCoords);
  let lat = normalizedCoords?.lat ?? null;
  let lng = normalizedCoords?.lng ?? null;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    lat = baseLat + (((hash % 200) - 100) * 0.0025);
    lng = baseLng + ((((hash >> 3) % 200) - 100) * 0.003);
  }

  return {
    id: rest.id,
    markerKey: `${rest.id || "biz"}:${locationIndex}`,
    locationIndex,
    name: rest.name || rest.restaurantName || "Business",
    type: rest.type || "food",
    lat,
    lng,
    address: row.address || rest.address || rest.city || "Prishtina",
    hours: rest.hours || rest.openHours || "08:00 - 23:00",
    rating: rest.rating || rest.score || 4.8,
    img: rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || "",
    desc: rest.description || rest.bio || `Offizielles Lokal auf ${BRAND_UI.upper}.`,
    raw: rest
  };
}

function buildRestaurantLocations(rest, idx) {
  const locations = getRestaurantLocations(rest);
  if (!locations.length) {
    return [normalizeBusinessLocation(rest, idx, null, 0)];
  }
  return locations.map((location, locationIndex) => normalizeBusinessLocation(rest, idx, location, locationIndex));
}

function cleanupLeaflet() {
  try {
    if (leafletMap) leafletMap.remove();
  } catch {}
  leafletMap = null;
  leafletBizMarkers = [];
  leafletUserMarker = null;
}

function isLeafletMapMountedOn(element) {
  if (!leafletMap || !element) return false;
  try {
    const container = typeof leafletMap.getContainer === "function" ? leafletMap.getContainer() : null;
    if (!container) return false;
    if (container !== element) return false;
    if (!document.body.contains(container)) return false;
    return true;
  } catch {
    return false;
  }
}

function scheduleLeafletRefresh(retries = 3) {
  if (!leafletMap || !document.getElementById("leafletMap")) return;
  const run = (left) => {
    if (!leafletMap) return;
    const el = document.getElementById("leafletMap");
    if (!el || !isLeafletMapMountedOn(el)) return;
    try { leafletMap.invalidateSize(); } catch {}
    if (left <= 0) return;
    window.setTimeout(() => run(left - 1), 180);
  };
  run(Math.max(0, Number(retries) || 0));
}

function makeLocationPickerBizIcon(location) {
  const safeImg = location.img && !isPlaceholderUrl(location.img) ? escapeHtml(location.img) : PLACEHOLDER_IMAGE;
  const html = `
    <div class="relative flex flex-col items-center justify-center z-[400]">
      <div class="w-11 h-11 rounded-[0.9rem] shadow-lg flex items-center justify-center border-[3px] border-white bg-white overflow-hidden p-0.5">
        <img src="${safeImg}" class="w-full h-full object-cover rounded-[0.7rem]" onerror="this.src='${PLACEHOLDER_IMAGE}'"/>
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white drop-shadow-md -mt-1"></div>
    </div>
  `;
  return window.L.divIcon({ className: "custom-div-icon", html, iconSize: [44, 54], iconAnchor: [22, 54] });
}

function clearLocationPickerBizMarkers() {
  if (!locationPickerMap) {
    locationPickerBizMarkers = [];
    return;
  }
  locationPickerBizMarkers.forEach((marker) => {
    try { locationPickerMap.removeLayer(marker); } catch {}
  });
  locationPickerBizMarkers = [];
}

function buildLeadLocationPickerLocations() {
  const out = [];
  const seen = new Set();
  const pushLocation = (entry) => {
    const coords = normalizeCoordPair(entry?.lat, entry?.lng);
    if (!coords) return;
    const lat = coords.lat;
    const lng = coords.lng;
    const key = `${entry.markerKey || entry.id || "loc"}:${lat.toFixed(6)}:${lng.toFixed(6)}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ ...entry, lat, lng });
  };
  const businessLocationsByRestaurant = new Map();
  (Array.isArray(state.businessLocations) ? state.businessLocations : []).forEach((biz) => {
    const id = String(biz?.id || "");
    if (!id) return;
    if (!businessLocationsByRestaurant.has(id)) businessLocationsByRestaurant.set(id, []);
    businessLocationsByRestaurant.get(id).push(biz);
  });

  const customers = Array.isArray(state.customers.items) && state.customers.items.length
    ? state.customers.items
    : (Array.isArray(state.restaurants) ? state.restaurants.filter(isCustomerRestaurant) : []);

  customers.forEach((rest, restIndex) => {
    const restId = String(rest?.id || "");
    const mapLocations = restId ? (businessLocationsByRestaurant.get(restId) || []) : [];
    const mapCoordRows = mapLocations
      .map((biz, idx) => {
        const coords = normalizeCoordPair(biz?.lat, biz?.lng);
        if (!coords) return null;
        return { ...coords, biz, idx };
      })
      .filter(Boolean);
    if (mapCoordRows.length && !(Array.isArray(rest?.locations) && rest.locations.length)) {
      mapLocations.forEach((biz, bizIndex) => {
        pushLocation({
          id: rest.id || `customer_${restIndex}`,
          markerKey: `customer:${rest.id || restIndex}:${biz.locationIndex ?? bizIndex}`,
          name: rest.name || rest.restaurantName || biz.name || "Business",
          img: rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || biz.img || "",
          address: biz.address || rest.address || rest.city || "Prishtina",
          lat: biz.lat,
          lng: biz.lng
        });
      });
      return;
    }

    const restCoords = resolveCoordsFromEntity(rest);
    const locations = normalizeLeadLocations(rest?.locations || [], rest?.address || rest?.city || "", restCoords || null);
    let placed = false;
    locations.forEach((loc, locIndex) => {
      const directCoords = resolveCoordsFromEntity(loc) || restCoords || null;
      const refCoords = mapCoordRows[locIndex] || mapCoordRows[0] || null;
      const coords = preferStableCoords(directCoords, refCoords);
      if (!coords) return;
      placed = true;
      pushLocation({
        id: rest.id || `customer_${restIndex}`,
        markerKey: `customer:${rest.id || restIndex}:${locIndex}`,
        name: rest.name || rest.restaurantName || "Business",
        img: rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || "",
        address: loc.address || rest.address || rest.city || "Prishtina",
        lat: coords.lat,
        lng: coords.lng
      });
    });

    if (!placed && mapCoordRows.length) {
      mapCoordRows.forEach(({ biz, idx, lat, lng }) => {
        pushLocation({
          id: rest.id || `customer_${restIndex}`,
          markerKey: `customer:${rest.id || restIndex}:${biz.locationIndex ?? idx}`,
          name: rest.name || rest.restaurantName || biz.name || "Business",
          img: rest.logoUrl || rest.logo || rest.heroUrl || rest.coverUrl || biz.img || "",
          address: biz.address || rest.address || rest.city || "Prishtina",
          lat,
          lng
        });
      });
    }
  });

  const leads = Array.isArray(state.leads.items) ? state.leads.items : [];
  leads
    .filter((lead) => normalizeLeadStatusKey(lead?.status || "") !== "kunde")
    .forEach((lead, leadIndex) => {
      const leadRestaurantId = String(lead?.restaurantId || "");
      const restMapLocations = leadRestaurantId ? (businessLocationsByRestaurant.get(leadRestaurantId) || []) : [];
      const restMapCoordRows = restMapLocations
        .map((biz, idx) => {
          const coords = normalizeCoordPair(biz?.lat, biz?.lng);
          if (!coords) return null;
          return { ...coords, biz, idx };
        })
        .filter(Boolean);
      if (restMapCoordRows.length && !(Array.isArray(lead?.locations) && lead.locations.length)) {
        restMapCoordRows.forEach(({ biz, idx, lat, lng }) => {
          pushLocation({
            id: lead.id || lead.restaurantId || `lead_${leadIndex}`,
            markerKey: `lead:${lead.id || lead.restaurantId || leadIndex}:rest:${biz.locationIndex ?? idx}`,
            name: lead.businessName || lead.contactName || biz.name || "Lead",
            img: lead.logoUrl || lead.logo || lead.imageUrl || biz.img || "",
            address: lead.address || biz.address || lead.city || "Prishtina",
            lat,
            lng
          });
        });
        return;
      }

      const leadCoords = resolveCoordsFromEntity(lead);
      const locations = normalizeLeadLocations(lead?.locations || [], lead?.address || "", {
        lat: leadCoords?.lat ?? null,
        lng: leadCoords?.lng ?? null
      });
      let placed = false;
      locations.forEach((loc, locIndex) => {
        const directCoords = resolveCoordsFromEntity(loc) || leadCoords || null;
        const refCoords = restMapCoordRows[locIndex] || restMapCoordRows[0] || null;
        const coords = preferStableCoords(directCoords, refCoords);
        if (!coords) return;
        placed = true;
        pushLocation({
          id: lead.id || lead.restaurantId || `lead_${leadIndex}`,
          markerKey: `lead:${lead.id || lead.restaurantId || leadIndex}:${locIndex}`,
          name: lead.businessName || lead.contactName || "Lead",
          img: lead.logoUrl || lead.logo || lead.imageUrl || "",
          address: loc.address || lead.address || lead.city || "Prishtina",
          lat: coords.lat,
          lng: coords.lng
        });
      });

      if (!placed && restMapCoordRows.length) {
        restMapCoordRows.forEach(({ biz, idx, lat, lng }) => {
          pushLocation({
            id: lead.id || lead.restaurantId || `lead_${leadIndex}`,
            markerKey: `lead:${lead.id || lead.restaurantId || leadIndex}:rest:${biz.locationIndex ?? idx}`,
            name: lead.businessName || lead.contactName || biz.name || "Lead",
            img: lead.logoUrl || lead.logo || lead.imageUrl || biz.img || "",
            address: lead.address || biz.address || lead.city || "Prishtina",
            lat,
            lng
          });
        });
      }
    });

  return out;
}

function renderLocationPickerContextMarkers() {
  if (!locationPickerMap || !window.L) return;
  const context = String(locationPickerTarget.context || "");
  clearLocationPickerBizMarkers();
  if (!(context === "lead" || context.startsWith("lead_location:"))) return;

  const locations = buildLeadLocationPickerLocations();
  locationPickerBizMarkers = locations.map((location) => (
    window.L.marker([location.lat, location.lng], {
      icon: makeLocationPickerBizIcon(location),
      keyboard: false,
      interactive: false
    }).addTo(locationPickerMap)
  ));
}

function makeBizDivIcon(b) {
  const selected = state.selectedBusiness || {};
  const selectedKey = String(selected.markerKey || "");
  const isSelected = selectedKey
    ? selectedKey === String(b.markerKey || "")
    : (String(selected.id || "") === String(b.id || "")
      && Number(selected.locationIndex || 0) === Number(b.locationIndex || 0));
  const safeImg = b.img && !isPlaceholderUrl(b.img) ? escapeHtml(b.img) : PLACEHOLDER_IMAGE;
  const html = `
    <div class="relative flex flex-col items-center justify-center transition-all duration-300 ${isSelected ? 'scale-110 z-[500]' : 'hover:scale-105 z-[400]'}">
      <div class="w-12 h-12 rounded-[1rem] shadow-lg flex items-center justify-center border-[3px] ${isSelected ? 'border-indigo-600' : 'border-white'} bg-white overflow-hidden p-0.5">
        <img src="${safeImg}" class="w-full h-full object-cover rounded-xl" onerror="this.src='${PLACEHOLDER_IMAGE}'"/>
      </div>
      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isSelected ? 'border-t-indigo-600' : 'border-t-white drop-shadow-md'} -mt-1"></div>
    </div>
  `;
  return window.L.divIcon({ className: "custom-div-icon", html, iconSize: [48, 58], iconAnchor: [24, 58] });
}

function isDiscoverableMapBusiness(location = {}) {
  const row = location?.raw || {};
  if (!isPublicBusinessRecord(row)) return false;
  const typeKey = normalizeRestaurantType(
    location?.type
    || location?.raw?.type
    || location?.raw?.customerType
    || location?.raw?.category
    || location?.raw?.kind
    || location?.raw?.restaurantType
    || ""
  );
  return typeKey !== "ecommerce";
}

function getDiscoverableMapLocations(locations = state.businessLocations) {
  return (Array.isArray(locations) ? locations : []).filter(isDiscoverableMapBusiness);
}

function updateMapSheet() {
  const slot = document.getElementById("mapSheetSlot");
  if (!slot) return;
  if (state.selectedBusiness && !isDiscoverableMapBusiness(state.selectedBusiness)) {
    state.selectedBusiness = null;
  }
  slot.innerHTML = state.selectedBusiness ? renderMapSheet(state.selectedBusiness) : "";
  bindMapSheetEvents();
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function bindMapSheetEvents() {
  const mapCloseBtn = document.getElementById("mapCloseBtn");
  if (mapCloseBtn) {
    mapCloseBtn.addEventListener("click", () => {
      state.selectedBusiness = null;
      renderLeafletMarkers(state.businessLocations);
      updateMapSheet();
    });
  }

  const mapOpenRouteBtn = document.getElementById("mapOpenRouteBtn");
  if (mapOpenRouteBtn) {
    mapOpenRouteBtn.addEventListener("click", () => {
      if (!state.selectedBusiness) return;
      const { lat, lng } = state.selectedBusiness;
      if (typeof lat !== "number" || typeof lng !== "number") return;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    });
  }

  const mapVisitProfileBtn = document.getElementById("mapVisitProfileBtn");
  const mapVisitProfileImgBtn = document.getElementById("mapVisitProfileImgBtn");
  [mapVisitProfileBtn, mapVisitProfileImgBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        if (!state.selectedBusiness) return;
        openProfileViewFromBusiness({
          id: state.selectedBusiness.id,
          name: state.selectedBusiness.name
        });
      });
    }
  });
}

function initLeafletIfNeeded() {
  if (state.activeTab !== "map") {
    cleanupLeaflet();
    return;
  }

  const el = document.getElementById("leafletMap");
  if (!el) return;
  if (!window.L) {
    void ensureLeafletLoaded().then((loaded) => {
      if (!loaded || state.activeTab !== "map") return;
      initLeafletIfNeeded();
      render();
    });
    return;
  }

  if (leafletMap && !isLeafletMapMountedOn(el)) {
    cleanupLeaflet();
  }

  if (leafletMap) {
    try { leafletMap.invalidateSize(); } catch {}
    scheduleLeafletRefresh(2);
    bindMapSearchInput();
    return;
  }

  // Zoom Level 15 = ca 2km Radius
  leafletMap = window.L.map(el, { zoomControl: false, attributionControl: false, preferCanvas: true }).setView([42.6629, 21.1655], 15);
  window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(leafletMap);
  try {
    leafletMap.whenReady(() => {
      scheduleLeafletRefresh(3);
    });
  } catch {}

  renderLeafletMarkers(getDiscoverableMapLocations(state.businessLocations));
  updateMapSheet();
  if (window.lucide?.createIcons) window.lucide.createIcons();

  mapLocate();
  bindMapSearchInput();
  scheduleLeafletRefresh(3);
}

function renderLeafletMarkers(locations) {
  if (!leafletMap || !window.L) return;
  const visibleLocations = getDiscoverableMapLocations(locations);
  leafletBizMarkers.forEach(marker => { try { leafletMap.removeLayer(marker); } catch {} });
  const nextMarkers = [];
  visibleLocations.forEach((entry) => {
    const coords = normalizeCoordPair(entry?.lat, entry?.lng);
    if (!coords) return;
    const b = (coords.lat === entry.lat && coords.lng === entry.lng)
      ? entry
      : { ...entry, lat: coords.lat, lng: coords.lng };
    try {
      const marker = window.L.marker([b.lat, b.lng], { icon: makeBizDivIcon(b) }).addTo(leafletMap);
      marker.__biz = b;
      marker.on("click", () => {
        state.selectedBusiness = b;
        renderLeafletMarkers(visibleLocations);
        updateMapSheet();
        try { leafletMap.panTo([b.lat - 0.003, b.lng], { animate: true, duration: 0.5 }); } catch {}
      });
      nextMarkers.push(marker);
    } catch (err) {
      console.warn("Skipping invalid map marker", b?.id || "", err);
    }
  });
  leafletBizMarkers = nextMarkers;
}

function filterMapLocationsByQuery(query) {
  const key = String(query || "").toLowerCase().trim();
  const baseLocations = getDiscoverableMapLocations(state.businessLocations);
  if (!key) return baseLocations;
  return baseLocations.filter(b =>
    b.name.toLowerCase().includes(key) || (b.address || b.city || "").toLowerCase().includes(key)
  );
}

function bindMapSearchInput() {
  const searchInput = document.getElementById("mapSearchInput");
  if (!searchInput || searchInput.dataset.bound === "true") return;
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = filterMapLocationsByQuery(query);
    renderLeafletMarkers(filtered);
    state.selectedBusiness = null;
    updateMapSheet();
    if (filtered.length > 0 && query.length > 2) {
      try { leafletMap.panTo([filtered[0].lat, filtered[0].lng], { animate: true, duration: 0.5 }); } catch {}
    }
  });
  searchInput.dataset.bound = "true";
}

function setUserMarker(lat, lng, label = "Deine Position") {
  if (!leafletMap || !window.L) return;
  
  let avatarUrl = getSelfAvatarUrl();
  if (!avatarUrl || isPlaceholderUrl(avatarUrl)) {
    const nameStr = state.userProfile.name || "User";
    avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameStr)}&background=4f46e5&color=fff`;
  }

  const html = `
    <div class="relative w-12 h-12 z-[1000] user-radar">
      <img src="${escapeHtml(avatarUrl)}" class="w-full h-full rounded-full object-cover border-[3px] border-white shadow-lg relative z-10 bg-slate-200" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
    </div>
  `;
  const markerIcon = window.L.divIcon({ className: "custom-div-icon", html, iconSize: [48, 48], iconAnchor: [24, 24] });

  if (!leafletUserMarker) {
    leafletUserMarker = window.L.marker([lat, lng], { icon: markerIcon, zIndexOffset: 2000 }).addTo(leafletMap);
  } else {
    leafletUserMarker.setLatLng([lat, lng]);
    leafletUserMarker.setIcon(markerIcon);
  }
}

function mapLocate() {
  const override = getCeoGpsOverride();
  if (isCeoUser() && override) {
    if (leafletMap) {
      try { leafletMap.setView([override.lat, override.lng], 15, { animate: true }); } catch {}
      setUserMarker(override.lat, override.lng, "Deine Position");
    }
    return;
  }
  if (!navigator.geolocation) {
    alert("Geolocation nicht verfuegbar.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      if (leafletMap) {
        try { leafletMap.setView([lat, lng], 15, { animate: true }); } catch {}
        setUserMarker(lat, lng, "Deine Position");
      }
    },
    () => alert("Standort konnte nicht abgerufen werden (Berechtigung?)."),
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
  );
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
  if (!story?.restaurantId) return;
  const storyId = escapeSelector(story.restaurantId);
  const restaurant = state.restaurants.find((r) => r.id === story.restaurantId) || {};
  const logoSource = restaurant.logoUrl || restaurant.logo || story.img || "";
  const logoUrl = resolveRestaurantLogo(story.restaurantId, logoSource, "thumb");
  document.querySelectorAll(`[data-story-logo="${storyId}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== logoUrl) img.setAttribute("src", logoUrl);
  });
}

function updateStoryMetaNodes(story) {
  if (!story?.restaurantId) return;
  const storyId = escapeSelector(story.restaurantId);
  const label = story.name || "Business";
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

function updateSearchLogoNodes(biz) {
  if (!biz?.id) return;
  const bizId = escapeSelector(biz.id);
  const restaurant = state.restaurants.find((r) => r.id === biz.id) || {};
  const logoSource = restaurant.logoUrl || restaurant.logo || biz.logo || biz.image || "";
  const logoUrl = resolveRestaurantLogo(biz.id, logoSource, "avatar");
  document.querySelectorAll(`[data-search-logo="${bizId}"]`).forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute("src") !== logoUrl) img.setAttribute("src", logoUrl);
  });
}

function updateSearchBusinessNodes(biz) {
  if (!biz?.id) return;
  const bizId = escapeSelector(biz.id);
  const name = biz.name || "Business";
  const city = biz.city || "Prishtina";
  document.querySelectorAll(`[data-search-business="${bizId}"]`).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.dataset.searchName = name;
    const nameEl = el.querySelector("[data-search-business-name]");
    if (nameEl && nameEl.textContent !== name) nameEl.textContent = name;
    const cityEl = el.querySelector("[data-search-business-city]");
    if (cityEl && cityEl.textContent !== city) cityEl.textContent = city;
  });
  updateSearchLogoNodes(biz);
}

function updateSearchUserNodes(user) {
  if (!user?.uid) return;
  const uid = escapeSelector(user.uid);
  const handle = user.handle || normalizeHandle(user.name || "user");
  const displayName = sanitizeDisplayName(user.name, handle || "User");
  const avatarUrl = resolveSearchUserAvatarDisplay(user);
  document.querySelectorAll(`[data-search-user="${uid}"]`).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    el.dataset.searchHandle = handle;
    el.dataset.searchName = displayName;
    el.dataset.searchAvatar = user.avatarUrl || user.avatar || "";
    el.dataset.searchLocation = user.location || "";
    const nameEl = el.querySelector("[data-search-user-name]");
    if (nameEl && nameEl.textContent !== displayName) nameEl.textContent = displayName;
    const handleEl = el.querySelector("[data-search-user-handle]");
    const handleLabel = `@${handle}`;
    if (handleEl && handleEl.textContent !== handleLabel) handleEl.textContent = handleLabel;
    const img = el.querySelector("img");
    if (img instanceof HTMLImageElement && img.getAttribute("src") !== avatarUrl) {
      img.setAttribute("src", avatarUrl);
    }
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

function normalizeBusinessResult(rest) {
  if (!isPublicBusinessRecord(rest)) return null;
  const name = rest.name || rest.restaurantName || "Business";
  return {
    id: rest.id || rest.restaurantId || "",
    name,
    city: rest.city || rest.location || rest.address || "Prishtina",
    logo: rest.logoUrl || rest.logo || rest.image || ""
  };
}

function buildBusinessResultsFromFeed(posts) {
  const map = new Map();
  posts.forEach((post) => {
    const id = post.restaurantId || post.ownerId || "";
    const key = id || String(post.business || "").toLowerCase();
    if (!key || map.has(key)) return;
    if (isForceHiddenBusinessEntity({
      id: id || key,
      restaurantId: id || key,
      ownerId: post.ownerId || "",
      ownerUid: post.ownerUid || "",
      handle: post.handle || "",
      businessName: post.business || "",
      restaurantName: post.restaurantName || "",
      ownerEmail: post.ownerEmail || "",
      email: post.email || ""
    })) {
      return;
    }
    map.set(key, {
      id: id || key,
      name: post.business || "Business",
      city: post.location || "Prishtina",
      logo: post.logo || ""
    });
  });
  return Array.from(map.values()).slice(0, SEARCH_LIMITS.businesses);
}

function buildLocalBusinessResults(queryKey) {
  const list = state.restaurants.length
    ? state.restaurants.map(normalizeBusinessResult).filter(Boolean)
    : buildBusinessResultsFromFeed(state.feedPosts);
  const localKey = normalizeSearchKey(state.userProfile.location || "");
  const isLocalQuery = queryKey === "lokal" || queryKey === "local" || (!queryKey && localKey);
  const filtered = list.filter((item) => {
    if (isLocalQuery && localKey) {
      return normalizeSearchKey(item.city).includes(localKey);
    }
    const score = Math.max(
      scoreSearchMatch(item.name, queryKey),
      scoreSearchMatch(item.city, queryKey)
    );
    return score > 0;
  }).map((item) => {
    const score = queryKey ? Math.max(
      scoreSearchMatch(item.name, queryKey),
      scoreSearchMatch(item.city, queryKey)
    ) : 0;
    return { ...item, _score: score };
  });
  return filtered.sort((a, b) => (b._score || 0) - (a._score || 0)).slice(0, SEARCH_LIMITS.businesses);
}

function normalizeUserSearchResult(doc) {
  const data = typeof doc?.data === "function" ? doc.data() : (doc?.data || doc || {});
  const rawName = data.displayName || data.name || data.handle || "";
  const handle = data.handle || normalizeHandle(rawName || "user");
  const email = data.email || data.loginEmail || data.ownerEmail || "";
  if (isForceHiddenHandle(handle || rawName) || isForceHiddenEmail(email)) return null;
  const name = sanitizeDisplayName(rawName, handle || "User");
  return {
    uid: doc?.id || data.uid || "",
    name,
    handle,
    email,
    avatar: data.avatarUrl || data.avatar || '',
    location: data.city || "Prishtina",
    followers: data.followersCount ?? data.followers ?? 0,
    following: data.followingCount ?? data.following ?? 0,
    role: data.role || "user",
    restaurantId: data.restaurantId || "",
    bio: data.bio || ""
  };
}

function isBusinessSearchUser(user) {
  const role = String(user?.role || "").toLowerCase();
  return role === "business" || !!user?.restaurantId;
}

async function searchUsersRemote(queryRaw, token) {
  if (isGuestSession()) {
    state.search.userResults = [];
    return;
  }
  const queryKey = normalizeSearchKey(queryRaw);
  const nameKey = normalizeSearchQuery(queryRaw);
  if (!queryKey) {
    state.search.userResults = [];
    return;
  }
  const cacheKey = `users:${queryKey}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    state.search.userResults = cached.filter((item) => (
      item?.uid
      && !isBusinessSearchUser(item)
      && !isForceHiddenHandle(item?.handle || item?.name || "")
      && !isForceHiddenEmail(item?.email || "")
    ));
    return;
  }
  try {
    const handleKey = normalizeHandle(queryKey);
    const users = new Map();
    if (handleKey) {
      const snap = await getDocs(query(
        collection(db, "users"),
        orderBy("handle"),
        startAt(handleKey),
        endAt(`${handleKey}\uf8ff`),
        limit(SEARCH_LIMITS.users)
      ));
      snap.forEach((docSnap) => {
        const item = normalizeUserSearchResult(docSnap);
        if (item?.uid && !isBusinessSearchUser(item)) users.set(item.uid, item);
      });
    }
    const nameVariants = new Set();
    if (nameKey) {
      nameVariants.add(nameKey);
      const cap = nameKey.charAt(0).toUpperCase() + nameKey.slice(1);
      nameVariants.add(cap);
    }
    for (const variant of nameVariants) {
      const nameSnap = await getDocs(query(
        collection(db, "users"),
        orderBy("displayName"),
        startAt(variant),
        endAt(`${variant}\uf8ff`),
        limit(SEARCH_LIMITS.users)
      ));
      nameSnap.forEach((docSnap) => {
        const item = normalizeUserSearchResult(docSnap);
        if (item?.uid && !isBusinessSearchUser(item)) users.set(item.uid, item);
      });
    }
    if (token !== searchToken) return;
    const key = normalizeSearchKey(queryRaw);
    const results = Array.from(users.values())
      .filter((item) => (
        !isBusinessSearchUser(item)
        && !isForceHiddenHandle(item?.handle || item?.name || "")
        && !isForceHiddenEmail(item?.email || "")
      ))
      .map((item) => ({
        ...item,
        _score: Math.max(
          scoreSearchMatch(item.handle, key),
          scoreSearchMatch(item.name, key)
        )
      }))
      .sort((a, b) => (b._score || 0) - (a._score || 0));
    searchCache.set(cacheKey, results);
    state.search.userResults = results;
  } catch (err) {
    if (token !== searchToken) return;
    state.search.error = "Suche fehlgeschlagen.";
  }
}

async function searchBusinessesRemote(queryRaw, token) {
  const queryKey = normalizeSearchQuery(queryRaw);
  const key = normalizeSearchKey(queryRaw);
  if (!key) return;
  const cacheKey = `biz:${key}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    state.search.businessResults = cached;
    return;
  }
  try {
    const results = new Map();
    const restRef = collection(db, "restaurants");
    try {
      const snap = await getDocs(query(
        restRef,
        orderBy("name"),
        startAt(queryKey),
        endAt(`${queryKey}\uf8ff`),
        limit(SEARCH_LIMITS.businesses)
      ));
      snap.forEach((docSnap) => {
        const row = normalizeBusinessResult({ id: docSnap.id, ...docSnap.data() });
        if (row?.id) results.set(row.id, row);
      });
    } catch {}
    try {
      const snap = await getDocs(query(
        restRef,
        orderBy("restaurantName"),
        startAt(queryKey),
        endAt(`${queryKey}\uf8ff`),
        limit(SEARCH_LIMITS.businesses)
      ));
      snap.forEach((docSnap) => {
        const row = normalizeBusinessResult({ id: docSnap.id, ...docSnap.data() });
        if (row?.id) results.set(row.id, row);
      });
    } catch {}
    if (token !== searchToken) return;
    const list = Array.from(results.values())
      .map((item) => ({
        ...item,
        _score: Math.max(
          scoreSearchMatch(item.name, key),
          scoreSearchMatch(item.city, key)
        )
      }))
      .sort((a, b) => (b._score || 0) - (a._score || 0));
    if (list.length) {
      searchCache.set(cacheKey, list);
      state.search.businessResults = list;
    }
  } catch (err) {
    if (token !== searchToken) return;
    state.search.error = "Suche fehlgeschlagen.";
  }
}

async function searchRemote(queryRaw) {
  const token = ++searchToken;
  state.search.loading = true;
  state.search.error = "";
  if (!refreshSearchView()) render();
  await Promise.all([
    searchUsersRemote(queryRaw, token),
    searchBusinessesRemote(queryRaw, token)
  ]);
  if (token === searchToken) {
    state.search.loading = false;
    if (!refreshSearchView()) render();
  }
}

function handleSearchInput(value) {
  const raw = normalizeSearchQuery(value);
  const queryKey = normalizeSearchKey(raw);
  state.search.query = raw;
  state.search.businessResults = buildLocalBusinessResults(queryKey);
  state.search.keepFocus = true;
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  if (!queryKey) {
    state.search.userResults = [];
    state.search.loading = false;
    state.search.error = "";
    if (!refreshSearchView()) render();
    return;
  }
  if (queryKey.length < 3) {
    state.search.userResults = [];
    state.search.loading = false;
    state.search.error = "";
    if (!refreshSearchView()) render();
    return;
  }
  if (!refreshSearchView()) render();
  searchTimer = window.setTimeout(() => {
    void searchRemote(raw);
  }, 450);
}

function ensureTabData(tab) {
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

function closeProfileModal() {
  state.profileModal = { open: false, profile: null };
  renderOverlays();
}

function closeLikesModal() {
  state.likesModal = { open: false, postId: "", animate: false };
  renderOverlays({ updateLikes: true });
}

function closeActiveModal() {
  if (state.likesModal.open) {
    closeLikesModal();
    return true;
  }
  if (state.menuDetail.open) {
    closeMenuDetail();
    return true;
  }
  if (state.menuModal.open) {
    closeMenuModal();
    return true;
  }
  if (state.focusModal.open) {
    closeFocusModal();
    return true;
  }
  if (state.customerModal.open) {
    closeCustomerModal();
    return true;
  }
  if (state.leadModal.open) {
    closeLeadModal();
    return true;
  }
  if (state.postModal.open) {
    closePostModal();
    return true;
  }
  if (state.profileModal.open) {
    closeProfileModal();
    return true;
  }
  return false;
}

function isAnyModalOpen() {
  return !!(
    state.profileModal.open
    || state.postModal.open
    || state.likesModal.open
    || state.menuModal.open
    || state.menuDetail.open
    || state.focusModal.open
    || state.leadModal.open
    || state.customerModal.open
  );
}

async function openPostModal(post) {
  if (!post) return;
  ensurePostMeta(post.id);
  state.profileModal = { open: false, profile: null };
  state.postModal = {
    open: true,
    post,
    commentText: "",
    replyTo: null,
    loading: true,
    animate: true,
    sending: false
  };
  renderOverlays();
  state.postModal.animate = false;
  attachPostMetaListeners(post);
  void loadPostMetaFromFirebase(post).then(() => {
    if (state.postModal.open && state.postModal.post && String(state.postModal.post.id) === String(post.id)) {
      updatePostModalMeta();
    }
  });
  state.postModal.loading = false;
  updatePostModalMeta();
}

function closePostModal() {
  state.postModal = { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false };
  state.likesModal = { open: false, postId: "", animate: false };
  pendingCommentHighlight = "";
  stopPostMetaListeners();
  renderOverlays();
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
  if (!post) return;
  const likeBase = Number(post.likes) || 0;
  const commentBase = Number(post.comments) || 0;
  if (likesDelta) post.likes = Math.max(0, likeBase + likesDelta);
  if (commentsDelta) post.comments = Math.max(0, commentBase + commentsDelta);
  const feedMatch = state.feedPosts.find((item) => String(item.id) === String(post.id));
  if (feedMatch) {
    if (likesDelta) feedMatch.likes = Math.max(0, (Number(feedMatch.likes) || 0) + likesDelta);
    if (commentsDelta) feedMatch.comments = Math.max(0, (Number(feedMatch.comments) || 0) + commentsDelta);
  }

  const updates = {};
  if (likesDelta) updates.likesCount = increment(likesDelta);
  if (commentsDelta) updates.commentsCount = increment(commentsDelta);

  if (!skipRemote && Object.keys(updates).length) {
    const postRef = getPostDocRef(post);
    if (postRef) {
      try {
        await updateDoc(postRef, updates);
      } catch (err) {
        console.error(err);
      }
    }

    const feedRef = getFeedDocRef(post);
    if (feedRef) {
      try {
        await updateDoc(feedRef, updates);
      } catch {}
    }
  }
  updatePostCountNodes(post);
  updatePostCaches(post);
}

async function addComment(postId, text, replyTo) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return;
  if (!state.user) {
    openGuestAuthPrompt("Bitte registrieren oder einloggen, um Kommentare zu schreiben.");
    return;
  }
  const key = `${postId}|${state.user.uid || ""}|${trimmed}`;
  const now = Date.now();
  if (key === lastCommentKey && now - lastCommentAt < 1500) return;
  lastCommentKey = key;
  lastCommentAt = now;
  const post = findPostById(postId);
  const postRef = getPostDocRef(post);
  if (!post || !postRef) {
    lastCommentKey = "";
    lastCommentAt = 0;
    return;
  }
  if (state.postModal.sending) return;
  state.postModal.sending = true;
  const meta = ensurePostMeta(postId);
  const ensuredAvatar = await ensureSelfAvatarReady({ force: true });
  const user = currentUserBadge();
  const handleKey = normalizeHandle(user.handle || user.name || "");
  const avatarCandidate = ensuredAvatar || user.avatar || "";
  const finalAvatar = avatarCandidate && !isPlaceholderUrl(avatarCandidate) ? avatarCandidate : "";
  if (finalAvatar) {
    user.avatar = finalAvatar;
    primeSelfAvatarCache(finalAvatar);
    if (user.uid) commentAvatarCache.set(user.uid, finalAvatar);
    if (handleKey) commentAvatarCache.set(handleKey, finalAvatar);
  }
  const commentRef = doc(collection(postRef, "comments"));
  const payload = {
    uid: user.uid || "",
    author: user.name,
    handle: user.handle,
    avatarUrl: finalAvatar,
    avatar: finalAvatar,
    text: trimmed,
    createdAt: serverTimestamp(),
    parentId: replyTo || null,
    likesCount: 0
  };

  try {
    const batch = writeBatch(db);
    batch.set(commentRef, payload);
    batch.update(postRef, { commentsCount: increment(1) });
    const feedRef = getFeedDocRef(post);
    if (feedRef) {
      try {
        const feedSnap = await getDoc(feedRef);
        if (feedSnap.exists()) {
          batch.update(feedRef, { commentsCount: increment(1) });
        }
      } catch {}
    }
    await batch.commit();
  } catch (err) {
    console.error(err);
    lastCommentKey = "";
    lastCommentAt = 0;
    state.postModal.sending = false;
    return;
  }

  // --- INSTANT UI FIX: make sure the just-created comment avatar appears without refresh ---
  try {
    if (finalAvatar) {
      if (payload.uid) commentAvatarCache.set(payload.uid, finalAvatar);
      if (handleKey) commentAvatarCache.set(handleKey, finalAvatar);
      scheduleCommentAvatarDomUpdate(payload.uid || "", handleKey, finalAvatar);
      updateCommentAvatarNodesById(commentRef.id, finalAvatar);
    } else {
      scheduleCommentAvatarFetch({
        uid: payload.uid || "",
        handle: payload.handle || "",
        author: payload.author || ""
      });
    }
  } catch {}

  try {
    await updatePostCounts(post, { commentsDelta: 1, skipRemote: true });
  } catch (err) {
    console.error(err);
  }

  updatePostCountNodes(post);
  const hasLiveComments = typeof modalCommentsUnsub === "function";
  if (!hasLiveComments) {
    const newComment = ensureCommentShape({
      id: commentRef.id,
      ...payload,
      createdAt: new Date().toISOString()
    });
    if (replyTo) {
      const target = meta.comments.find((item) => item.id === replyTo);
      if (target) {
        target.replies = [newComment, ...(target.replies || [])];
      } else {
        meta.comments = [newComment, ...(meta.comments || [])];
      }
    } else {
      meta.comments = [newComment, ...(meta.comments || [])];
    }
    state.postMeta[postId] = meta;
  }
  state.postModal.commentText = "";
  const commentInput = document.getElementById("postCommentInput");
  if (commentInput) commentInput.value = "";
  state.postModal.replyTo = null;
  if (state.postModal.open && state.postModal.post && String(state.postModal.post.id) === String(postId)) {
    updatePostModalMeta();
    if (finalAvatar) scheduleCommentAvatarDomUpdate(user.uid || "", handleKey, finalAvatar);
    const postComments = document.getElementById("postModalComments");
    if (postComments) hydrateCommentAvatars(postComments, { postId: postId });
  } else {
    renderOverlays();
  }
  refreshSelfCommentAvatars();
  state.postModal.sending = false;
  const ownerUid = await resolvePostOwnerUid(post);
  if (ownerUid && ownerUid !== state.user.uid) {
    try {
      await pushUserNotification(ownerUid, {
        type: "comment",
        user: user.name,
        userHandle: user.handle,
        userUid: user.uid || "",
        avatar: payload.avatar,
        text: "hat deinen Beitrag kommentiert",
        postId: String(post.id || ""),
        commentId: String(commentRef.id || ""),
        ownerType: post.ownerType || "",
        ownerId: post.ownerId || "",
        restaurantId: post.restaurantId || ""
      });
    } catch {}
  }
}

async function togglePostLike(postId) {
  if (!state.user) {
    openGuestAuthPrompt("Bitte registrieren oder einloggen, um Beitrage zu liken.");
    return;
  }
  const meta = ensurePostMeta(postId);
  const user = currentUserBadge();
  if (!user.uid) return;
  const post = findPostById(postId);
  const postRef = getPostDocRef(post);
  if (!post || !postRef) return;
  const likeId = user.uid;
  const likeRef = doc(collection(postRef, "likes"), likeId);
  const feedRef = getFeedDocRef(post);
  let delta = 0;
  try {
    await runTransaction(db, async (tx) => {
      const likeSnap = await tx.get(likeRef);
      const feedSnap = feedRef ? await tx.get(feedRef) : null;
      if (likeSnap.exists()) {
        tx.delete(likeRef);
        delta = -1;
      } else {
        tx.set(likeRef, {
          uid: user.uid,
          name: user.name,
          handle: user.handle,
          avatar: user.avatar,
          createdAt: serverTimestamp()
        });
        delta = 1;
      }
      tx.update(postRef, { likesCount: increment(delta) });
      if (feedRef && feedSnap?.exists()) {
        tx.update(feedRef, { likesCount: increment(delta) });
      }
    });

    if (!delta) return;
    if (delta < 0) {
      const idx = meta.likes.findIndex((item) => item.uid === user.uid || item.handle === user.handle);
      if (idx >= 0) meta.likes.splice(idx, 1);
    } else {
      meta.likes.unshift({ uid: user.uid, name: user.name, handle: user.handle, avatar: user.avatar });
    }

    state.postMeta[postId] = meta;
    await updatePostCounts(post, { likesDelta: delta, skipRemote: true });
    if (state.postModal.open && state.postModal.post && String(state.postModal.post.id) === String(postId)) {
      updatePostModalCountsOnly();
    } else {
      renderOverlays();
    }

    if (delta > 0) {
      const ownerUid = await resolvePostOwnerUid(post);
      if (ownerUid && ownerUid !== state.user.uid) {
        await pushUserNotification(ownerUid, {
          type: "like",
          user: user.name,
          userHandle: user.handle,
          userUid: user.uid || "",
          avatar: user.avatar,
          text: "hat deinen Beitrag geliked",
          postId: String(post.id || ""),
          ownerType: post.ownerType || "",
          ownerId: post.ownerId || "",
          restaurantId: post.restaurantId || ""
        });
      }
    }
    updateShellDom();
  } catch (err) {
    console.error(err);
  }
}

async function toggleMenuItemLike() {
  if (!state.user) {
    openGuestAuthPrompt("Bitte registrieren oder einloggen, um Produkte zu liken.");
    return;
  }
  const ctx = getMenuDetailContext();
  if (!ctx) return;
  const { ref, key, item, restaurantId, itemId } = ctx;
  const user = currentUserBadge();
  if (!user.uid) return;
  const likeId = user.uid;
  const likeRef = doc(collection(ref, "likes"), likeId);
  const favoriteRef = doc(db, "users", user.uid, "menuFavorites", favoriteMenuItemDocId(restaurantId, itemId));
  let delta = 0;

  try {
    await runTransaction(db, async (tx) => {
      const likeSnap = await tx.get(likeRef);
      if (likeSnap.exists()) {
        tx.delete(likeRef);
        tx.delete(favoriteRef);
        delta = -1;
      } else {
        tx.set(likeRef, {
          uid: user.uid,
          name: user.name,
          handle: user.handle,
          avatar: user.avatar,
          createdAt: serverTimestamp()
        });
        tx.set(favoriteRef, buildFavoriteMenuItemPayload(item, restaurantId, { includeServerTimestamp: true }), { merge: true });
        delta = 1;
      }
      tx.set(ref, { likesCount: increment(delta) }, { merge: true });
    });

    if (!delta) return;
    const meta = ensureMenuItemMeta(key);
    if (delta < 0) {
      const idx = meta.likes.findIndex((item) => item.uid === user.uid || item.handle === user.handle);
      if (idx >= 0) meta.likes.splice(idx, 1);
    } else {
      meta.likes.unshift({ uid: user.uid, name: user.name, handle: user.handle, avatar: user.avatar });
    }
    meta.counts = meta.counts || { likes: 0, comments: 0 };
    meta.counts.likes = Math.max(0, (Number(meta.counts.likes) || 0) + delta);
    state.menuItemMeta[key] = meta;
    updateFavoriteMenuItemsLocal(item, restaurantId, { remove: delta < 0 });
    updateMenuDetailCountsOnly();
    updateMenuCardCountNodes(ctx.itemId, resolveMenuItemCounts(meta));
  } catch (err) {
    console.error(err);
  }
}

async function addMenuItemComment(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return;
  if (!state.user) {
    openGuestAuthPrompt("Bitte registrieren oder einloggen, um Kommentare zu schreiben.");
    return;
  }
  const ctx = getMenuDetailContext();
  if (!ctx) return;
  const { ref, key } = ctx;
  const dedupeKey = `${key}|${state.user.uid || ""}|${trimmed}`;
  const now = Date.now();
  if (dedupeKey === lastMenuCommentKey && now - lastMenuCommentAt < 1500) return;
  lastMenuCommentKey = dedupeKey;
  lastMenuCommentAt = now;
  if (state.menuDetail.sending) return;
  state.menuDetail.sending = true;
  updateMenuDetailCommentsOnly();

  const ensuredAvatar = await ensureSelfAvatarReady({ force: true });
  const user = currentUserBadge();
  const handleKey = normalizeHandle(user.handle || user.name || "");
  const avatarCandidate = ensuredAvatar || user.avatar || "";
  const finalAvatar = avatarCandidate && !isPlaceholderUrl(avatarCandidate) ? avatarCandidate : "";
  if (finalAvatar) {
    user.avatar = finalAvatar;
    primeSelfAvatarCache(finalAvatar);
    if (user.uid) commentAvatarCache.set(user.uid, finalAvatar);
    if (handleKey) commentAvatarCache.set(handleKey, finalAvatar);
  }

  const commentRef = doc(collection(ref, "comments"));
  const payload = {
    uid: user.uid || "",
    author: user.name,
    handle: user.handle,
    avatarUrl: finalAvatar,
    avatar: finalAvatar,
    text: trimmed,
    createdAt: serverTimestamp(),
    parentId: null,
    likesCount: 0
  };

  try {
    const batch = writeBatch(db);
    batch.set(commentRef, payload);
    batch.set(ref, { commentsCount: increment(1) }, { merge: true });
    await batch.commit();
  } catch (err) {
    console.error(err);
    lastMenuCommentKey = "";
    lastMenuCommentAt = 0;
    state.menuDetail.sending = false;
    updateMenuDetailCommentsOnly();
    return;
  }

  const meta = ensureMenuItemMeta(key);
  const newComment = ensureCommentShape({
    id: commentRef.id,
    ...payload,
    createdAt: new Date().toISOString()
  });
  meta.comments = [newComment, ...(meta.comments || [])];
  meta.counts = meta.counts || { likes: 0, comments: 0 };
  meta.counts.comments = Math.max(0, (Number(meta.counts.comments) || 0) + 1);
  state.menuItemMeta[key] = meta;

  state.menuDetail.commentText = "";
  const input = document.getElementById("menuDetailCommentInput");
  if (input) {
    input.value = "";
    autosizeTextarea(input, { minHeight: 56, maxHeight: 160 });
  }

  state.menuDetail.sending = false;
  updateMenuDetailMeta();
  updateMenuCardCountNodes(ctx.itemId, resolveMenuItemCounts(meta));
  if (finalAvatar) scheduleCommentAvatarDomUpdate(user.uid || "", handleKey, finalAvatar);
  refreshSelfCommentAvatars();
}

async function toggleCommentLike(postId, commentId, replyId) {
  if (!state.user) {
    openGuestAuthPrompt("Bitte registrieren oder einloggen, um Kommentare zu liken.");
    return;
  }
  const meta = ensurePostMeta(postId);
  const user = currentUserBadge();
  if (!user.uid) return;
  const list = meta.comments || [];
  const comment = list.find((item) => item.id === commentId);
  if (!comment) return;

  const target = replyId ? (comment.replies || []).find((item) => item.id === replyId) : comment;
  if (!target) return;

  const post = findPostById(postId);
  const postRef = getPostDocRef(post);
  if (!post || !postRef) return;
  const commentDocId = replyId || commentId;
  const commentRef = doc(collection(postRef, "comments"), String(commentDocId));
  try {
    const likeId = user.uid;
    const likeRef = doc(collection(commentRef, "likes"), likeId);
    let delta = 0;
    await runTransaction(db, async (tx) => {
      const likeSnap = await tx.get(likeRef);
      if (likeSnap.exists()) {
        tx.delete(likeRef);
        delta = -1;
      } else {
        tx.set(likeRef, {
          uid: user.uid,
          name: user.name,
          handle: user.handle,
          avatar: user.avatar,
          createdAt: serverTimestamp()
        });
        delta = 1;
      }
      tx.update(commentRef, { likesCount: increment(delta) });
    });
    if (delta) {
      target.likesCount = Math.max(0, (Number(target.likesCount) || 0) + delta);
      state.postMeta[postId] = meta;
      if (state.postModal.open && state.postModal.post && String(state.postModal.post.id) === String(postId)) {
        updateCommentLikeButton(postId, commentId, replyId, target.likesCount);
      } else {
        renderOverlays();
      }
    }
    updateShellDom();
  } catch (err) {
    console.error(err);
  }
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

function renderFeedView() {
  const feedPosts = state.feedPosts
    .filter((p) => state.feedCategory === "all" || p.category === state.feedCategory)
    .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
  const stories = state.stories.length ? state.stories : (FAST_MODE ? buildStoriesFromFeed(feedPosts) : state.stories);
  return `
    <div id="feedView">
      <div id="storiesRow" class="flex gap-4 overflow-x-auto px-8 pt-4 pb-8 no-scrollbar">
        ${renderStoriesRow(stories)}
      </div>
      ${isLocalBusinessProfile(state.userProfile) ? `
        <div class="px-8 mb-6">
          <button data-nav="upload" class="w-full p-4 rounded-[2rem] bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            ${icon("plus-square", "w-4 h-4")} Neuer Feed Post
          </button>
        </div>
      ` : ""}
      <div id="feedList" class="px-8 py-4 space-y-12">
        ${renderFeedList(feedPosts)}
      </div>
    </div>
  `;
}

function renderStoryItem(story, index = 0) {
  const borderClass = story.isLive ? "border-red-500 animate-pulse" : "border-slate-200";
  const storyUrl = buildUrl("apps/menyra-social/index.html", { r: story.restaurantId, tab: "profile" });
  const restaurant = state.restaurants.find((r) => r.id === story.restaurantId) || {};
  const logoSource = restaurant.logoUrl || restaurant.logo || story.img || "";
  const imgUrl = resolveRestaurantLogo(story.restaurantId, logoSource, "thumb");
  const storyId = story.restaurantId ? escapeHtml(story.restaurantId) : "";
  const storyAttr = storyId ? `data-story-logo="${storyId}"` : "";
  const storyKeyAttr = storyId ? `data-img-key="story-logo:${storyId}"` : "";
  const storyBorderAttr = storyId ? `data-story-border="${storyId}"` : "";
  const storyNameAttr = storyId ? `data-story-name="${storyId}"` : "";
  const storyItemAttr = storyId ? `data-story-item="${storyId}"` : "";
  const eager = index < 6;
  const imgAttrs = eager ? `fetchpriority="high"` : `loading="lazy"`;
  return `
    <a href="${storyUrl}" ${storyItemAttr} class="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
      <div class="w-20 h-20 rounded-[2.2rem] p-0.5 border-2 ${borderClass} bg-slate-200" ${storyBorderAttr}>
        <img src="${escapeHtml(imgUrl)}" ${imgAttrs} decoding="async" width="80" height="80" ${storyAttr} ${storyKeyAttr} class="w-full h-full rounded-[1.8rem] object-contain bg-white group-hover:scale-105 transition-transform" />
      </div>
      <span class="text-[9px] font-bold tracking-tighter text-slate-800" ${storyNameAttr}>${escapeHtml(story.name)}</span>
    </a>
  `;
}

function renderStoriesRow(stories) {
  const uploadSlot = state.user ? `
    <div class="flex-shrink-0 flex flex-col items-center gap-2" data-story-upload-wrap data-nav="upload">
      <div data-story-upload class="w-20 h-20 rounded-[2.2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 overflow-hidden relative group">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-800"></div>
        ${icon("camera", "w-7 h-7 relative z-10")}
      </div>
      <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Story</span>
    </div>
  ` : "";
  return `
    ${uploadSlot}
    ${stories.length ? stories.map((story, index) => renderStoryItem(story, index)).join("") : `
      <div class="flex items-center text-slate-400 text-xs font-bold uppercase">Keine Stories</div>
    `}
  `;
}

function renderFeedItem(post, index) {
  const postId = post.id ? String(post.id) : "";
  const likeAttr = postId ? `data-post-like-count="${escapeHtml(postId)}"` : "";
  const commentAttr = postId ? `data-post-comment-count="${escapeHtml(postId)}"` : "";
  const feedAttr = postId ? `data-feed-id="${escapeHtml(postId)}"` : `data-feed-id=""`;
  const logoAttr = postId ? `data-feed-logo="${escapeHtml(postId)}"` : "";
  const logoKeyAttr = postId ? `data-img-key="feed-logo:${escapeHtml(postId)}"` : "";
  const heroKeyAttr = postId ? `data-img-key="feed-hero:${escapeHtml(postId)}"` : "";
  const eager = index < 2;
  const heroAttrs = eager ? `fetchpriority="high"` : `loading="lazy"`;
  const logoAttrs = index < 2 ? `fetchpriority="high"` : `loading="lazy"`;
  const restaurant = state.restaurants.find((r) => r.id === (post.restaurantId || post.ownerId)) || {};
  const logoSource = restaurant.logoUrl || restaurant.logo || post.logo || "";
  const logoUrl = resolveRestaurantLogo(post.restaurantId || post.ownerId, logoSource, "avatar");
  const imageUrl = getOptimizedImageUrl(post.image, "large");
  return `
    <div class="group feed-card" ${feedAttr}>
      <div class="flex items-center justify-between mb-5 px-2">
        <button data-profile-business="${escapeHtml(post.business)}" data-profile-id="${escapeHtml(post.restaurantId || "")}" class="flex items-center gap-3 text-left">
          <div class="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 italic overflow-hidden bg-slate-200">
            <img src="${escapeHtml(logoUrl)}" ${logoAttrs} ${logoAttr} ${logoKeyAttr} decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />
          </div>
          <div>
            <h4 class="text-sm font-black flex items-center gap-1.5 uppercase tracking-tighter italic text-slate-900">${escapeHtml(post.business)} ${icon("star", "w-3 h-3 text-indigo-500")}</h4>
            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${escapeHtml(post.location)}</p>
          </div>
        </button>
        ${icon("more-horizontal", "w-5 h-5 text-slate-400")}
      </div>
      <div class="p-2.5 rounded-[3.5rem] shadow-2xl overflow-hidden relative bg-white shadow-slate-200/50 border border-slate-50">
        <div class="relative rounded-[3rem] overflow-hidden bg-slate-200">
          <img src="${escapeHtml(imageUrl)}" ${heroAttrs} ${heroKeyAttr} decoding="async" class="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-1000" />
          ${post.isLive ? `
            <div class="absolute top-6 left-6 bg-red-600 text-white text-[9px] font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <div class="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div> LIVE
            </div>
          ` : ""}
          <div class="absolute bottom-6 left-6 right-6 p-6 bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 text-white">
            <p class="text-sm font-medium mb-4 line-clamp-2 leading-relaxed">${escapeHtml(post.content)}</p>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <button class="flex items-center gap-2 hover:text-red-400 transition-colors">
                  ${icon("heart", "w-5 h-5")} <span ${likeAttr} class="text-[10px] font-black">${escapeHtml(post.likes)}</span>
                </button>
                <button class="flex items-center gap-2 text-white/70 hover:text-white">
                  ${icon("message-circle", "w-5 h-5")} <span ${commentAttr} class="text-[10px] font-black">${escapeHtml(post.comments)}</span>
                </button>
              </div>
              <button class="text-white/70 hover:text-white">${icon("share-2", "w-4 h-4")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderFeedList(feedPosts) {
  if (!feedPosts.length) {
    return `<div class="text-center py-20 text-slate-400 font-bold text-xs uppercase">Keine Posts vorhanden</div>`;
  }
  return feedPosts.slice(0, 10).map((post, index) => renderFeedItem(post, index)).join("");
}

function patchFeedList(feedPosts) {
  const feedList = document.getElementById("feedList");
  if (!feedList) return false;
  if (!feedPosts.length) {
    feedList.innerHTML = renderFeedList(feedPosts);
    return true;
  }
  const existingItems = Array.from(feedList.querySelectorAll("[data-feed-id]"));
  const currentIds = existingItems.map((el) => el.dataset.feedId || "");
  const nextIds = feedPosts.map((post) => String(post.id || ""));
  if (currentIds.join("|") === nextIds.join("|")) {
    feedPosts.forEach(updatePostCountNodes);
    return true;
  }
  const existingMap = new Map();
  existingItems.forEach((el) => existingMap.set(el.dataset.feedId || "", el));
  const fragment = document.createDocumentFragment();
  feedPosts.forEach((post, index) => {
    const postId = String(post.id || "");
    const existing = postId ? existingMap.get(postId) : null;
    if (existing) {
      existingMap.delete(postId);
      fragment.appendChild(existing);
    } else {
      const tpl = document.createElement("template");
      tpl.innerHTML = renderFeedItem(post, index);
      const node = tpl.content.firstElementChild;
      if (node) fragment.appendChild(node);
    }
  });
  feedList.replaceChildren(fragment);
  feedPosts.forEach(updatePostCountNodes);
  feedPosts.forEach(updateFeedLogoNodes);
  return true;
}

function patchStoriesRow(stories) {
  const storiesRow = document.getElementById("storiesRow");
  if (!storiesRow) return false;
  if (!Array.isArray(stories) || stories.length === 0) {
    storiesRow.innerHTML = renderStoriesRow([]);
    return true;
  }
  const uploadWrap = storiesRow.querySelector("[data-story-upload-wrap]");
  if (!uploadWrap) {
    storiesRow.innerHTML = renderStoriesRow(stories);
    return true;
  }
  const existingItems = Array.from(storiesRow.querySelectorAll("[data-story-item]"));
  const existingMap = new Map();
  existingItems.forEach((el) => existingMap.set(el.dataset.storyItem || "", el));
  const fragment = document.createDocumentFragment();
  fragment.appendChild(uploadWrap);
  stories.forEach((story) => {
    const id = String(story.restaurantId || "");
    const existing = id ? existingMap.get(id) : null;
    if (existing) {
      existingMap.delete(id);
      fragment.appendChild(existing);
    } else {
      const tpl = document.createElement("template");
      tpl.innerHTML = renderStoryItem(story);
      const node = tpl.content.firstElementChild;
      if (node) fragment.appendChild(node);
    }
  });
  storiesRow.replaceChildren(fragment);
  return true;
}

function updateFeedDom() {
  const feedView = document.getElementById("feedView");
  if (!feedView) return false;
  const feedPosts = state.feedPosts
    .filter((p) => state.feedCategory === "all" || p.category === state.feedCategory)
    .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
  const stories = state.stories.length ? state.stories : (FAST_MODE ? buildStoriesFromFeed(feedPosts) : state.stories);
  const storiesRow = document.getElementById("storiesRow");
  const nextSig = buildStoriesRowSignature(stories);
  if (storiesRow) {
    if (storiesRowSignature !== nextSig) {
      patchStoriesRow(stories);
      storiesRowSignature = nextSig;
    }
    stories.forEach((story) => {
      updateStoryLogoNodes(story);
      updateStoryMetaNodes(story);
    });
  }
  patchFeedList(feedPosts);
  feedPosts.forEach(updateFeedLogoNodes);
  ensureFeedRestaurantMetaListeners(feedPosts);
  bindFeedDelegation();
  preloadFeedHeroImages(feedPosts);
  if (window.lucide?.createIcons) window.lucide.createIcons();
  return true;
}

function bindFeedDelegation() {
  const feedView = document.getElementById("feedView");
  if (!feedView || feedView.dataset.bound === "true") return;
  feedView.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const navBtn = target.closest("[data-nav]");
    if (navBtn) {
      const tab = navBtn.dataset.nav;
      if (tab) {
        if (tab === "favorites" && !String(state.user?.uid || "").trim()) {
          openGuestAuthPrompt("Bitte registrieren oder einloggen, um Favoriten zu nutzen.");
          return;
        }
        const activeTab = tab === "favorites" ? "profile" : tab;
        const nextProfileTopTab = tab === "favorites"
          ? "favorites"
          : (tab === "profile" ? "profile" : state.profileTopTab);
        setState({
          activeTab,
          profileTopTab: nextProfileTopTab,
          drawerOpen: false,
          chatSettingsOpen: false,
          chatListScope: "inbox",
          chatThreadMenuId: "",
          settingsView: "main",
          selectedBusiness: null,
          profileView: null,
          profileModal: { open: false, profile: null },
          postModal: { open: false, post: null, commentText: "", replyTo: null, loading: false, animate: false, sending: false },
          likesModal: { open: false, postId: "", animate: false },
          leadModal: { open: false, mode: "create", lead: null, status: "", loading: false, deleting: false, actionsOpen: false, logoFile: null, logoPreview: "", coords: null, locations: [] },
          customerModal: { open: false, mode: "edit", customer: null, status: "", loading: false, logoFile: null, logoPreview: "" }
        });
      }
      return;
    }
    const profileBtn = target.closest("[data-profile-business]");
    if (profileBtn) {
      openProfileViewFromBusiness({
        id: profileBtn.dataset.profileId || "",
        name: profileBtn.dataset.profileBusiness || ""
      }, { showBack: false });
    }
  });
  feedView.dataset.bound = "true";
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

function attachPostMetaListeners(post) {
  stopPostMetaListeners();
  const postRef = getPostDocRef(post);
  if (!postRef || !post?.id) return;
  const postId = String(post.id);
  modalPostDocUnsub = onSnapshot(postRef, (docSnap) => {
    if (!docSnap.exists()) return;
    const data = docSnap.data() || {};
    const nextLikes = Number(data.likesCount ?? data.likes ?? post.likes ?? 0) || 0;
    const nextComments = Number(data.commentsCount ?? data.comments ?? post.comments ?? 0) || 0;
    post.likes = nextLikes;
    post.comments = nextComments;
    if (state.postModal.post && String(state.postModal.post.id) === postId) {
      state.postModal.post.likes = nextLikes;
      state.postModal.post.comments = nextComments;
    }
    updatePostCountNodes(post);
    updatePostModalCountsOnly();
  });
}

function stopMenuItemMetaListeners() {
  if (menuDetailDocUnsub) {
    menuDetailDocUnsub();
    menuDetailDocUnsub = null;
  }
  if (menuDetailLikesUnsub) {
    menuDetailLikesUnsub();
    menuDetailLikesUnsub = null;
  }
  if (menuDetailCommentsUnsub) {
    menuDetailCommentsUnsub();
    menuDetailCommentsUnsub = null;
  }
}

function attachMenuItemMetaListeners(item, restaurantId) {
  stopMenuItemMetaListeners();
  const ctx = getMenuDetailContext() || (() => {
    const ref = getMenuItemSocialDocRef(item, restaurantId);
    const itemId = getMenuItemSocialId(item);
    const rid = restaurantId || state.menu.restaurantId || state.profileView?.profile?.restaurantId || state.userProfile.restaurantId || "";
    if (!ref || !rid || !itemId) return null;
    return { ref, key: menuItemMetaKey(rid, itemId) };
  })();
  if (!ctx) return;
  const { ref, key } = ctx;

  menuDetailDocUnsub = onSnapshot(ref, (docSnap) => {
    if (!docSnap.exists()) return;
    const data = docSnap.data() || {};
    const meta = ensureMenuItemMeta(key);
    meta.counts = {
      likes: Number(data.likesCount ?? data.likes ?? meta.likes?.length ?? 0) || 0,
      comments: Number(data.commentsCount ?? data.comments ?? meta.comments?.length ?? 0) || 0
    };
    state.menuItemMeta[key] = meta;
    updateMenuDetailCountsOnly();
  });
}

async function loadMenuItemMetaFromFirebase(item, restaurantId) {
  const ref = getMenuItemSocialDocRef(item, restaurantId);
  const rid = restaurantId || state.menu.restaurantId || state.profileView?.profile?.restaurantId || state.userProfile.restaurantId || "";
  const itemId = getMenuItemSocialId(item);
  if (!ref || !rid || !itemId) return;
  const key = menuItemMetaKey(rid, itemId);
  const meta = ensureMenuItemMeta(key);
  const userUid = String(state.user?.uid || "");
  if (userUid) {
    try {
      const likeSnap = await getDoc(doc(collection(ref, "likes"), userUid));
      const retainedLikes = (Array.isArray(meta.likes) ? meta.likes : []).filter((row) => String(row?.uid || "") !== userUid);
      meta.likes = likeSnap.exists()
        ? [{ id: likeSnap.id, ...likeSnap.data() }, ...retainedLikes]
        : retainedLikes;
    } catch (err) {
      console.error(err);
    }
  }
  try {
    const commentsSnap = await getDocs(query(collection(ref, "comments"), orderBy("createdAt", "desc"), limit(DETAIL_COMMENTS_LIMIT)));
    const rows = commentsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    meta.comments = rows.filter((row) => !row.parentId).map((row) => ensureCommentShape(row));
  } catch (err) {
    console.error(err);
  }
  state.menuItemMeta[key] = meta;
  return meta;
}

function renderMapSheet(selected) {
  const imageUrl = getOptimizedImageUrl(selected.img, "thumb");
  return `
    <div class="animate-in slide-in-from-bottom-6 duration-300">
      <div class="bg-white/95 backdrop-blur-xl rounded-[2rem] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.25)] border border-slate-100/50 relative">
        <div class="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200 rounded-full"></div>

        <button id="mapCloseBtn" class="absolute top-4 right-4 w-8 h-8 bg-slate-100/80 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
          ${icon("x", "w-4 h-4")}
        </button>

        <div class="flex gap-4 pr-6 mt-2">
          <div id="mapVisitProfileImgBtn" class="w-20 h-20 rounded-[1.5rem] bg-slate-50 p-1 border border-slate-100 shadow-sm flex-shrink-0 overflow-hidden relative group cursor-pointer">
            <img src="${escapeHtml(imageUrl)}" class="w-full h-full object-cover rounded-[1.3rem] group-hover:scale-105 transition-transform" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
          </div>
          <div class="flex-1 pt-1">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1">Restaurant</span>
            <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight line-clamp-1">${escapeHtml(selected.name || "Business")}</h3>
            <div class="flex items-center gap-2 mt-1 text-[11px] font-black text-slate-700">
              <span class="flex items-center gap-1 text-indigo-600">${icon("star", "w-3 h-3 fill-indigo-600 text-indigo-600")} ${escapeHtml(selected.rating)}</span>
              <span class="text-emerald-500 flex items-center gap-1.5 ml-2"><div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div> Geoeffnet</span>
            </div>
            <div class="flex items-center gap-1.5 mt-2 text-slate-500 text-[10px] font-bold line-clamp-1">
              ${icon("map-pin", "w-3 h-3")} ${escapeHtml(selected.address)}
            </div>
          </div>
        </div>

        <div class="mt-5 flex gap-3">
          <button id="mapVisitProfileBtn" class="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 hover:bg-slate-800">
            ${icon("user", "w-4 h-4")} Profil
          </button>
          <button id="mapOpenRouteBtn" class="w-14 h-[46px] bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center active:scale-95 transition-all hover:bg-indigo-100 border border-indigo-100/50">
            ${icon("navigation", "w-5 h-5")}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderMapView() {
  const hasLeaflet = !!window.L;
  const mapInfoLabel = leafletLoadFailed
    ? "Karte konnte nicht geladen werden."
    : (leafletLoadPromise ? "Karte wird geladen ..." : "Karte wird vorbereitet ...");
  return `
    <div class="p-5 pb-8 h-full flex flex-col relative animate-in fade-in duration-700">
      <div class="mb-4 px-2 flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Karte</h2>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 italic">Entdecke Lokale</p>
        </div>
      </div>

      <div class="relative flex-1 bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200/50 min-h-[500px]">
        <div id="leafletMap" class="absolute inset-0 z-10 bg-slate-200"></div>
        ${hasLeaflet ? "" : `<div class="absolute inset-0 z-20 flex items-center justify-center opacity-40 text-slate-500 text-xs font-black uppercase tracking-widest">${escapeHtml(mapInfoLabel)}</div>`}
        
        <div class="absolute top-5 left-4 right-4 z-30">
          <div class="relative group shadow-lg rounded-2xl">
            ${icon("search", "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400")}
            <input id="mapSearchInput" type="text" placeholder="Stadt, Lokal suchen..." class="w-full h-14 rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl pl-12 pr-12 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/50 transition-all" />
          </div>
        </div>

        <div class="absolute bottom-6 right-4 z-30 flex flex-col gap-3">
          <button id="mapLocateBtn" class="w-12 h-12 rounded-2xl bg-indigo-600 shadow-[0_8px_20px_rgba(79,70,229,0.4)] flex items-center justify-center text-white active:scale-95 transition-all">
            ${icon("navigation", "w-5 h-5 fill-white")}
          </button>
        </div>

        <div id="mapSheetSlot" class="absolute bottom-4 left-4 right-4 z-40"></div>
      </div>
    </div>
  `;
}

function renderProfilePostCardFancy(item, isGrid, allowMenu = true) {
  const counts = resolvePostCounts(item);
  const postId = item.id ? String(item.id) : "";
  const postAttr = postId ? `data-open-post="${escapeHtml(postId)}"` : "";
  const likeAttr = postId ? `data-post-like-count="${escapeHtml(postId)}"` : "";
  const commentAttr = postId ? `data-post-comment-count="${escapeHtml(postId)}"` : "";
  const imgKeyAttr = postId ? `data-img-key="profile-post:${escapeHtml(postId)}"` : "";
  const isWide = item.type === "wide" || item.type === "hero";
  const colClass = isGrid && isWide ? "col-span-2" : "";
  const aspectClass = isGrid
    ? (isWide ? "aspect-[1.8/1]" : "aspect-[4/5]")
    : "aspect-[4/5]";
  const imageUrl = getOptimizedImageUrl(item.url, isWide ? "large" : "medium");
  const width = isWide ? 800 : 400;
  const height = isWide ? 400 : 500;
  return `
    <div ${postAttr} role="button" tabindex="0" class="${colClass} relative ${aspectClass} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        <img src="${escapeHtml(imageUrl)}" loading="lazy" decoding="async" width="${width}" height="${height}" ${imgKeyAttr} class="w-full h-full object-cover" />
        ${item.isVideo ? `<div class="absolute top-3 left-3 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full p-1">${icon("play", "w-3 h-3 fill-white")}</div>` : ""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${icon("heart", "w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${likeAttr} class="text-[10px] font-bold tracking-wide">${escapeHtml(counts.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${icon("message-circle", "w-3 h-3 text-indigo-200")}
                <span ${commentAttr} class="text-[10px] font-bold tracking-wide">${escapeHtml(counts.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${postId && allowMenu ? `
        <button type="button" data-profile-menu-button="${escapeHtml(postId)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${icon("more-horizontal", "w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${escapeHtml(postId)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${escapeHtml(postId)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${icon(isWide ? "minimize-2" : "maximize-2", "w-3.5 h-3.5")}
            ${isWide ? "Schmaler" : "Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${escapeHtml(postId)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${icon("trash-2", "w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      ` : ""}
    </div>
  `;
}

function renderProfilePostsFancy(posts, viewMode, allowMenu = true) {
  const isGrid = viewMode === "grid";
  if (!posts.length) {
    return `
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${icon("image", "w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">Keine Inhalte gefunden</p>
      </div>
    `;
  }
  const cards = posts.map((post) => renderProfilePostCardFancy(post, isGrid, allowMenu));
  const slotCount = posts.reduce((total, post) => {
    const isWide = post?.type === "wide" || post?.type === "hero";
    return total + (isWide ? 2 : 1);
  }, 0);
  if (isGrid && (slotCount % 2 === 1)) {
    cards.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `);
  }
  return cards.join("");
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

function renderProfileCheckins() {
  const checkins = state.profileCheckins || [];
  if (!checkins.length) {
    return `
      <div class="px-6 app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${icon("map-pin", "w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">Keine Check-ins gefunden</p>
      </div>
    `;
  }
  return `
    <div class="px-6 flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${checkins.map((place) => {
        const imageUrl = getOptimizedImageUrl(place.image, "thumb");
        return `
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${escapeHtml(imageUrl)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${escapeHtml(place.name || "Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${icon("map-pin", "w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${escapeHtml(place.city || "Stadt")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${icon("arrow-right", "w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `;
}

function renderProfileTabs() {
  return `
    <div class="px-6 mb-6 mt-4">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${[
          { id: "posts", label: "Beitraege" },
          { id: "media", label: "Medien" },
          { id: "checkins", label: "Check-ins" }
        ].map((tab) => `
          <button data-profile-tab="${tab.id}" class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${state.profileContentTab === tab.id ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
            ${tab.label}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderProfileViewControls() {
  if (state.profileContentTab === "checkins") return "";
  return `
    <div class="flex items-center justify-between px-8 mb-6">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Ansicht</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${state.profileViewMode === "grid" ? "bg-slate-900 text-white shadow-md" : "text-slate-300 active:text-slate-500"}">
          ${icon("layout-grid", "w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${state.profileViewMode === "feed" ? "bg-slate-900 text-white shadow-md" : "text-slate-300 active:text-slate-500"}">
          ${icon("square", "w-4 h-4")}
        </button>
      </div>
    </div>
  `;
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
  if (!post || !post.id) return null;
  const id = String(post.id);
  const ownerType = post.ownerType
    || (post.restaurantId || post.rid ? "restaurant" : "")
    || (post.uid || post.userId ? "user" : "");
  const ownerId = post.ownerId
    || post.restaurantId
    || post.rid
    || post.uid
    || post.userId
    || "";

  if (!post.ownerType && ownerType) post.ownerType = ownerType;
  if (!post.ownerId && ownerId) post.ownerId = ownerId;

  if (ownerType === "restaurant" && ownerId) {
    return doc(db, "restaurants", ownerId, "socialPosts", id);
  }
  if (ownerType === "user" && ownerId) {
    return doc(db, "users", ownerId, "posts", id);
  }

  const profileOwner = state.profileView?.profile;
  if (profileOwner?.restaurantId) {
    return doc(db, "restaurants", profileOwner.restaurantId, "socialPosts", id);
  }
  if (profileOwner?.uid) {
    return doc(db, "users", profileOwner.uid, "posts", id);
  }

  if (state.user?.uid) {
    return doc(db, "users", state.user.uid, "posts", id);
  }
  return null;
}

function getFeedDocRef(post) {
  if (!post?.id) return null;
  return doc(db, "socialFeed", String(post.id));
}

async function resolveRestaurantOwnerUid(restaurantId) {
  if (!restaurantId) return "";
  if (restaurantOwnerCache.has(restaurantId)) {
    return restaurantOwnerCache.get(restaurantId) || "";
  }
  const cached = state.restaurants.find((r) => r.id === restaurantId);
  const ownerUid = cached?.ownerUid || cached?.ownerId || "";
  if (ownerUid) {
    restaurantOwnerCache.set(restaurantId, ownerUid);
    return ownerUid;
  }
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId));
    if (snap.exists()) {
      const data = snap.data() || {};
      const uid = data.ownerUid || data.ownerId || "";
      restaurantOwnerCache.set(restaurantId, uid);
      return uid;
    }
  } catch (err) {
    console.error(err);
  }
  return "";
}

async function resolvePostOwnerUid(post) {
  if (!post) return "";
  if (post.ownerType === "user" && post.ownerId) return post.ownerId;
  if (post.ownerType === "restaurant" && post.ownerId) {
    return resolveRestaurantOwnerUid(post.ownerId);
  }
  if (post.restaurantId) {
    return resolveRestaurantOwnerUid(post.restaurantId);
  }
  return "";
}

async function loadPostMetaFromFirebase(post, { includeLikes = false, includeComments = true } = {}) {
  const postRef = getPostDocRef(post);
  const postId = String(post?.id || "");
  if (!postRef || !postId) return { likes: [], comments: [] };
  const meta = ensurePostMeta(postId);
  const userUid = String(state.user?.uid || "");
  if (includeLikes) {
    try {
      const likesSnap = await getDocs(query(collection(postRef, "likes"), orderBy("createdAt", "desc"), limit(DETAIL_LIKES_LIMIT)));
      meta.likes = likesSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    } catch (err) {
      console.error(err);
    }
  } else if (userUid) {
    try {
      const likeSnap = await getDoc(doc(collection(postRef, "likes"), userUid));
      const retainedLikes = (Array.isArray(meta.likes) ? meta.likes : []).filter((row) => String(row?.uid || "") !== userUid);
      meta.likes = likeSnap.exists()
        ? [{ id: likeSnap.id, ...likeSnap.data() }, ...retainedLikes]
        : retainedLikes;
    } catch (err) {
      console.error(err);
    }
  }
  if (includeComments) {
    try {
      const commentsSnap = await getDocs(query(collection(postRef, "comments"), orderBy("createdAt", "desc"), limit(DETAIL_COMMENTS_LIMIT)));
      const rows = commentsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      const byId = new Map();
      const top = [];
      rows.forEach((row) => {
        const item = ensureCommentShape(row);
        byId.set(item.id, item);
      });
      rows.forEach((row) => {
        const item = byId.get(row.id);
        const parentId = row.parentId || null;
        if (parentId && byId.has(parentId)) {
          const parent = byId.get(parentId);
          parent.replies = [item, ...(parent.replies || [])];
        } else if (item) {
          top.push(item);
        }
      });
      meta.comments = top;
    } catch (err) {
      console.error(err);
    }
  }
  state.postMeta[postId] = meta;
  return meta;
}

async function loadPostLikesForModal(postId) {
  const targetId = String(postId || "");
  if (!targetId) return [];
  const post = findPostById(targetId);
  const postRef = getPostDocRef(post);
  if (!postRef) return [];
  const meta = await loadPostMetaFromFirebase(post, { includeLikes: true, includeComments: false });
  if (state.likesModal.open && String(state.likesModal.postId || "") === targetId) {
    renderOverlays({ updateProfile: false, updatePost: false, updateLikes: true });
  } else if (state.postModal.open && String(state.postModal.post?.id || "") === targetId) {
    updatePostModalCountsOnly();
  }
  return meta.likes || [];
}

function isFollowingProfile(profile = {}) {
  const uid = String(profile?.uid || "").trim();
  if (uid && state.followingTargetIds.includes(uid)) return true;
  const followKey = normalizeFollowHandle(profile?.handle || "");
  return !!(followKey && state.followingHandles.includes(followKey));
}

function renderPublicProfileView() {
  const view = state.profileView;
  if (!view || !view.profile) return "";
  const profile = view.profile;
  const posts = view.posts || profile.posts || [];
  const isFollowing = isFollowingProfile(profile);
  const isLocked = !!profile.privateAccount && profile.uid && String(profile.uid) !== String(state.user?.uid || "") && !isFollowing;
  const hasPendingFollowRequest = !!profile.pendingFollowRequest && !isFollowing;
  const typeLabel = profile.restaurantId ? "Business" : "User";
  const handle = String(profile.handle || normalizeHandle(profile.name || "user")).replace(/^@/, "");
  const safeBio = escapeHtml(profile.bio || "").replace(/\n/g, "<br>");
  const bioHtml = safeBio || "Noch keine Bio.";
  const isMediaTab = state.profileContentTab === "media";
  const isCheckinTab = state.profileContentTab === "checkins";
  const filteredPosts = isMediaTab ? posts.filter((p) => p.isVideo) : posts;
  const avatarUrl = getOptimizedImageUrl(profile.avatar, "avatar");
  const avatarFit = logoFitClass(!!profile.restaurantId);
  const avatarKey = profile.uid || profile.restaurantId || handle || "public";
  const requestedTopTab = state.profileTopTab || "profile";
  const hasRegisteredUser = !!String(state.user?.uid || "").trim();
  let topTab = "profile";
  if (profile.restaurantId) {
    topTab = requestedTopTab;
  } else if (requestedTopTab === "favorites" && hasRegisteredUser) {
    topTab = "favorites";
  }
  const topPaddingClass = profile.restaurantId ? (topTab === "profile" ? "pt-2" : "pt-4") : "pt-10";
  const followLabel = isFollowing ? "Following" : (hasPendingFollowRequest ? "Requested" : (isLocked ? "Request" : "Follow"));
  const followTone = isFollowing
    ? "bg-slate-100 text-slate-600 shadow-none border border-slate-200"
    : (hasPendingFollowRequest
      ? "bg-amber-50 text-amber-700 shadow-none border border-amber-200"
      : "bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent");
  return `
    <div class="app-main-content-safe">
      ${topTab === "profile" ? `
      <div class="px-5 pb-2 ${topPaddingClass}">

        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div class="relative">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${escapeHtml(avatarUrl)}" decoding="async" width="100" height="100" data-img-key="avatar:public:${escapeHtml(avatarKey)}" class="w-full h-full rounded-[1.8rem] ${avatarFit} border-2 border-white" />
                </div>
                ${profile.isPremium ? `
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${icon("badge-check", "w-4 h-4 fill-blue-500 text-white")}
                  </div>
                ` : ""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(formatCount(profile.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Fans</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(formatCount(profile.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Folgt</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${escapeHtml(profile.name || "User")}</h1>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${escapeHtml(handle)}</p>
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${bioHtml}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${escapeHtml(profile.location || "-")} / ${typeLabel}</p>
            </div>

            <div class="flex gap-4">
              <button data-public-profile-follow="${escapeHtml(profile.handle)}" data-target-type="${escapeHtml(profile.restaurantId ? "restaurant" : (profile.uid ? "user" : ""))}" data-target-id="${escapeHtml(profile.restaurantId || profile.uid || "")}" data-target-name="${escapeHtml(profile.name || "")}" data-target-avatar="${escapeHtml(profile.avatar || "")}" ${hasPendingFollowRequest ? "disabled" : ""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${followTone} ${hasPendingFollowRequest ? "opacity-90 cursor-default" : ""}">
                <span class="relative z-10 flex items-center gap-2">
                  ${isFollowing ? icon("check", "w-4 h-4") : ""}
                  ${followLabel}
                </span>
              </button>
              <button data-open-chat="profile" data-chat-uid="${escapeHtml(profile.uid || "")}" data-chat-handle="${escapeHtml(profile.handle || "")}" data-chat-name="${escapeHtml(profile.name || "")}" data-chat-avatar="${escapeHtml(profile.avatar || "")}" ${isLocked ? "disabled" : ""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${isLocked ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${icon("message-circle", "w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
      </div>

      ${!isLocked ? `
        ${renderProfileTabs()}
        ${renderProfileViewControls()}

        ${isCheckinTab ? `
          ${renderProfileCheckins()}
        ` : `
          <div class="${state.profileViewMode === "grid" ? "grid grid-cols-2 gap-4 px-6 grid-flow-dense" : "flex flex-col gap-8 px-6"}">
            ${renderProfilePostsFancy(filteredPosts, state.profileViewMode, false)}
          </div>
        `}
      ` : `
        <div class="px-6 pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${icon("lock", "w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Privates Profil</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">Folgen muss zuerst akzeptiert werden</p>
          </div>
        </div>
      `}
      ` : `
        ${topTab === "cart"
          ? renderProfileShopCartView(profile)
          : (topTab === "favorites" ? renderProfileShopFavoritesView(profile) : renderProfileMenuView(profile))}
      `}
    </div>
  `;
}

function getFilteredMenuItems(items, { filter = "all", query = "" } = {}) {
  const list = Array.isArray(items) ? items : [];
  const q = normalizeSearchKey(query || "");
  return list.filter((item) => {
    const typeOk = filter === "all" || normalizeMenuType(item.type) === filter;
    if (!typeOk) return false;
    if (!q) return true;
    const hay = `${item.name || ""} ${item.category || ""} ${item.description || ""}`.toLowerCase();
    return hay.includes(q);
  });
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

function renderMenuFilterRow() {
  const filter = state.menu.filter || "all";
  const isShop = isShopCatalogProfile(state.userProfile);
  const labels = isShop
    ? [
      { id: "all", label: "Alle" },
      { id: "food", label: "Produkte" },
      { id: "drink", label: "Varianten" }
    ]
    : [
      { id: "all", label: "Alle" },
      { id: "food", label: "Speisen" },
      { id: "drink", label: "Getraenke" }
    ];
  return `
    <div class="flex gap-2 mb-5">
      ${labels.map((item) => `
        <button data-menu-filter="${item.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${filter === item.id ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-400 border border-slate-100"}">
          ${item.label}
        </button>
      `).join("")}
    </div>
  `;
}

function renderMenuLayoutSection() {
  const activeId = getMenuLayoutTheme().id;
  return `
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${MENU_LAYOUT_COLORS.map((theme) => {
          const isActive = theme.id === activeId;
          const checkClass = theme.id === "white" ? "text-slate-700" : "text-white";
          return `
            <button type="button" data-menu-layout-color="${theme.id}" class="w-12 h-12 rounded-2xl ${theme.swatch} ${isActive ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-white" : "border border-white/60"} shadow flex items-center justify-center">
              ${isActive ? icon("check", `w-4 h-4 ${checkClass}`) : ""}
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderMenuItemCard(item, { mode = "profile" } = {}) {
  const rawImg = resolveMenuItemHero(item);
  const imgSrc = getOptimizedImageUrl(rawImg, "thumb");
  const safeImg = isPlaceholderUrl(imgSrc) ? PLACEHOLDER_IMAGE : imgSrc;
  const firebaseFallback = getFirebaseStorageUrl(rawImg);
  const fallbackImg = isDirectImageUrl(rawImg) && rawImg !== safeImg ? rawImg : firebaseFallback;
  const priceLabel = formatPrice(item.price);
  const catalogProfile = state.activeTab === "menu" ? state.userProfile : (state.profileView?.profile || state.userProfile);
  const isShopMode = isShopCatalogProfile(catalogProfile);
  const typeLabel = isShopMode
    ? (normalizeMenuType(item.type) === "drink" ? "Variante" : "Produkt")
    : (normalizeMenuType(item.type) === "drink" ? "Getraenk" : "Speise");
  const category = item.category || "";
  const desc = item.description || "";
  const availability = item.available === false
    ? `<span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Nicht verfuegbar</span>`
    : `<span class="text-[9px] font-black uppercase tracking-widest text-emerald-600">Verfuegbar</span>`;
  const wrapperAttrs = mode === "profile"
    ? `data-menu-open="${escapeHtml(item.id)}" role="button"`
    : "";
  return `
    <div ${wrapperAttrs} class="w-full p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${mode === "profile" ? "cursor-pointer" : ""}">
      <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
        <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}" class="w-full h-full object-cover" style="object-position:${getMenuItemObjectPosition(item)};" loading="lazy" decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.name || "Produkt")}</p>
          <span class="text-xs font-black text-slate-900">${escapeHtml(priceLabel)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${category ? `<span>${escapeHtml(category)}</span>` : ""}
          <span>${escapeHtml(typeLabel)}</span>
        </div>
        ${desc ? `<p class="text-xs text-slate-500 mt-2 line-clamp-2">${escapeHtml(desc)}</p>` : ""}
        <div class="mt-2">${availability}</div>
      </div>
      ${mode === "admin" ? `
        <div class="flex flex-col gap-2">
          <button data-menu-edit="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200">Edit</button>
          <button data-menu-delete="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
        </div>
      ` : ""}
    </div>
  `;
}

function renderMenuItemCardStacked(item, { mode = "profile", variant = "food" } = {}) {
  const rawImg = resolveMenuItemHero(item);
  const imgSrc = getOptimizedImageUrl(rawImg, variant === "drink" ? "thumb" : "large");
  const safeImg = isPlaceholderUrl(imgSrc) ? PLACEHOLDER_IMAGE : imgSrc;
  const firebaseFallback = getFirebaseStorageUrl(rawImg);
  const fallbackImg = isDirectImageUrl(rawImg) && rawImg !== safeImg ? rawImg : firebaseFallback;
  const priceLabel = formatPrice(item.price);
  const catalogProfile = state.activeTab === "menu" ? state.userProfile : (state.profileView?.profile || state.userProfile);
  const isShopMode = isShopCatalogProfile(catalogProfile);
  const typeLabel = isShopMode
    ? (normalizeMenuType(item.type) === "drink" ? "Variante" : "Produkt")
    : (normalizeMenuType(item.type) === "drink" ? "Getraenk" : "Speise");
  const category = item.category || "";
  const desc = item.description || "";
  const availability = item.available === false
    ? `<span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Nicht verfuegbar</span>`
    : `<span class="text-[9px] font-black uppercase tracking-widest text-emerald-600">Verfuegbar</span>`;
  const wrapperAttrs = mode === "profile"
    ? `data-menu-open="${escapeHtml(item.id)}" role="button"`
    : "";
  const restaurantId = state.menu.restaurantId
    || state.profileView?.profile?.restaurantId
    || state.userProfile.restaurantId
    || "";
  const itemId = getMenuItemSocialId(item);
  const metaKey = menuItemMetaKey(restaurantId, itemId);
  const meta = metaKey ? ensureMenuItemMeta(metaKey) : { likes: [], comments: [], counts: { likes: 0, comments: 0 } };
  const counts = resolveMenuItemCounts(meta);
  const countsRow = `
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${icon("heart", "w-3 h-3 text-rose-400")} <span data-menu-like-count="${escapeHtml(itemId)}">${escapeHtml(formatCount(counts.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${icon("message-circle", "w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${escapeHtml(itemId)}">${escapeHtml(formatCount(counts.comments))}</span>
      </span>
    </div>
  `;
  const isDrink = variant === "drink";
  return `
    <div ${wrapperAttrs} class="w-full ${isDrink ? "p-3 rounded-[1.6rem]" : "p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${mode === "profile" ? "cursor-pointer" : ""}">
      <div class="w-full ${isDrink ? "h-28 rounded-[1.4rem]" : "h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}" class="w-full h-full object-cover" style="object-position:${getMenuItemObjectPosition(item)};" loading="lazy" decoding="async" />
      </div>
      ${isDrink ? `
        <div class="mt-3">
          <p class="text-sm font-black text-slate-900 leading-snug">${escapeHtml(item.name || "Produkt")}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${escapeHtml(priceLabel)}</p>
          ${countsRow}
        </div>
      ` : `
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${escapeHtml(item.name || "Produkt")}</p>
            <span class="text-xs font-black text-slate-900">${escapeHtml(priceLabel)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${category ? `<span>${escapeHtml(category)}</span>` : ""}
            <span>${escapeHtml(typeLabel)}</span>
          </div>
          ${desc ? `<p class="text-xs text-slate-500 mt-2 line-clamp-2">${escapeHtml(desc)}</p>` : ""}
          <div class="mt-2">${availability}</div>
          ${countsRow}
        </div>
      `}
    </div>
  `;
}

function renderMenuDrinkGrid(items, { mode = "profile" } = {}) {
  if (!items.length) return "";
  return `
    <div class="grid grid-cols-2 gap-4">
      ${items.map((item) => renderMenuItemCardStacked(item, { mode, variant: "drink" })).join("")}
    </div>
  `;
}

function renderMenuFoodList(items, { mode = "profile" } = {}) {
  if (!items.length) return "";
  return `
    <div class="space-y-4">
      ${items.map((item) => renderMenuItemCardStacked(item, { mode, variant: "food" })).join("")}
    </div>
  `;
}

function renderMenuList(items, { mode = "profile" } = {}) {
  if (!items.length) {
    return `
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
        Keine Produkte
      </div>
    `;
  }
  return `
    <div class="space-y-4">
      ${items.map((item) => renderMenuItemCard(item, { mode })).join("")}
    </div>
  `;
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
  if (!restaurantId) return "";
  const { items, enabled, loading } = getFocusStateForRestaurant(restaurantId, { includeInactive: true });
  const countLabel = formatCount(items.length);
  return `
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
          <h3 class="text-xl font-black italic tracking-tighter">Highlights</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${escapeHtml(countLabel)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${icon("plus", "w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">Im Fokus anzeigen</p>
          <p class="text-[10px] font-bold text-slate-400">Im Profil sichtbar</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${enabled ? "checked" : ""} />
      </label>

      ${loading ? `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fokus wird geladen...</div>
      ` : items.length ? `
        <div class="space-y-3">
          ${items.map((item) => {
            const imgUrl = getOptimizedImageUrl(item.imageUrl || "", "thumb");
            const safeImg = isPlaceholderUrl(imgUrl) ? PLACEHOLDER_IMAGE : imgUrl;
            const status = item.active !== false ? "Aktiv" : "Inaktiv";
            const statusClass = item.active !== false ? "text-emerald-600" : "text-slate-400";
            return `
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${escapeHtml(safeImg)}" class="w-full h-full object-cover" style="object-position:${getFocusItemObjectPosition(item)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.title || "Sot ne Fokus")}</p>
                  ${item.text ? `<p class="text-xs text-slate-500 mt-1 line-clamp-2">${escapeHtml(item.text)}</p>` : ""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${statusClass}">${status}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${escapeHtml(item.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : `
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Fokus-Eintraege</div>
      `}
    </div>
  `;
}

function renderFocusCarousel(profile) {
  const restaurantId = profile?.restaurantId || "";
  if (!restaurantId) return "";
  if (!isRestaurantCafeProfile(profile)) return "";
  if (!state.focus.loading && state.focus.restaurantId !== restaurantId) {
    ensureFocusDataForProfile(profile);
  }
  const { items, enabled, loading } = getFocusStateForRestaurant(restaurantId);
  if (!enabled) return "";
  if (!items.length && !loading) return "";
  if (loading && !items.length) {
    const focusCardClass = getFocusCardClass();
    return `
      <div class="${focusCardClass} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Fokus wird geladen...</div>
      </div>
    `;
  }

  const idx = getFocusIndex(items);
  const item = items[idx] || items[0];
  const imgUrl = getOptimizedImageUrl(item.imageUrl || "", "large");
  const safeImg = isPlaceholderUrl(imgUrl) ? PLACEHOLDER_IMAGE : imgUrl;
  const text = item.text || "";
  const focusCardClass = getFocusCardClass();
  return `
    <div id="focusCarousel" class="${focusCardClass} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${items.length > 1 ? `
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${icon("chevron-left", "w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${icon("chevron-right", "w-4 h-4")}
            </button>
          </div>
        ` : ""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img data-focus-image src="${escapeHtml(safeImg)}" class="w-full h-56 object-cover" style="object-position:${getFocusItemObjectPosition(item)};" />
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${escapeHtml(item.title || "Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${text ? "" : "hidden"}">${escapeHtml(text)}</p>
      </div>
      ${items.length > 1 ? `
        <div class="flex items-center justify-center gap-2 mt-4">
          ${items.map((_, dotIdx) => `
            <button type="button" data-focus-dot="${dotIdx}" class="w-2.5 h-2.5 rounded-full ${dotIdx === idx ? "bg-slate-900" : "bg-slate-200"}"></button>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function buildQrImageUrl(value, size = 220) {
  const safe = encodeURIComponent(value || "");
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${safe}`;
}

function renderMenuQrCard({ label, url, caption }) {
  if (!url) return "";
  const qrUrl = buildQrImageUrl(url, 240);
  return `
    <div class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${escapeHtml(qrUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${escapeHtml(label)}</p>
        ${caption ? `<p class="text-[10px] font-bold text-slate-400 mt-1">${escapeHtml(caption)}</p>` : ""}
      </div>
    </div>
  `;
}

function renderMenuAdminView() {
  const profile = state.userProfile;
  const restaurantId = profile.restaurantId || "";
  const isEligible = isRestaurantCafeProfile(profile);
  const catalogLabel = getBusinessCatalogLabel(profile);
  const restaurant = restaurantId ? getRestaurantMetaById(restaurantId) : null;
  const restaurantName = restaurant?.name || restaurant?.restaurantName || profile.name || "Business";
  const sameRestaurant = restaurantId && state.menu.restaurantId === restaurantId;
  const isLoading = restaurantId && (state.menu.loading || !sameRestaurant);
  const items = sameRestaurant
    ? getFilteredMenuItems(state.menu.items, { filter: state.menu.filter, query: state.menu.query })
    : [];
  const countLabel = formatCount(items.length);
  const profileUrl = restaurantId ? buildUrl("apps/menyra-social/index.html", { r: restaurantId }) : "";
  const menuUrl = restaurantId ? buildUrl("apps/menyra-social/index.html", { r: restaurantId, tab: "menu" }) : "";

  if (restaurantId && isEligible && !state.focus.loading && state.focus.restaurantId !== restaurantId) {
    ensureFocusDataForProfile(profile);
  }

  if (!isEligible) {
    return `
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${icon("lock", "w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${catalogLabel}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${catalogLabel}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${escapeHtml(restaurantName)}</p>
        </div>
        <button type="button" data-menu-add class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200/60 active:scale-95">
          ${icon("plus", "w-4 h-4")}
        </button>
      </div>

      ${restaurantId ? `
        <div class="mb-5 flex items-center justify-between p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${escapeHtml(countLabel)}</p>
          </div>
          <button type="button" data-menu-add class="px-4 py-2 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200">Neu</button>
        </div>
      ` : `
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500 mb-4">Bitte zuerst dein Business im Account auswaehlen.</p>
          <button data-nav="settings" class="px-5 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Zu den Einstellungen</button>
        </div>
      `}

      ${restaurantId ? renderFocusAdminSection(restaurantId) : ""}
      ${restaurantId ? renderMenuLayoutSection() : ""}

      ${restaurantId ? `
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${icon("search", "w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${escapeHtml(state.menu.query || "")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${renderMenuFilterRow()}

        ${isLoading
          ? `<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${catalogLabel} wird geladen...</div>`
          : renderMenuList(items, { mode: "admin" })
        }
        ${state.menu.error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${escapeHtml(state.menu.error)}</div>` : ""}
      ` : ""}

      ${restaurantId ? `
        <div class="mt-10">
          <div class="flex items-end justify-between mb-4">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">QR Codes</span>
              <h3 class="text-xl font-black italic tracking-tighter">Teilen</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direkt zum Profil oder zu ${catalogLabel}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            ${renderMenuQrCard({ label: "Profil", url: profileUrl, caption: "Social Profil" })}
            ${renderMenuQrCard({ label: catalogLabel, url: menuUrl, caption: `${catalogLabel} & Preise` })}
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function renderProfileMenuView(profile) {
  const restaurantId = profile?.restaurantId || "";
  if (!restaurantId) {
    return `
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        Keine Restaurant-ID gefunden
      </div>
    `;
  }
  if (!state.menu.loading && state.menu.restaurantId !== restaurantId) {
    ensureMenuDataForProfile(profile);
  }
  if (!state.focus.loading && state.focus.restaurantId !== restaurantId) {
    ensureFocusDataForProfile(profile);
  }
  const isSameRestaurant = state.menu.restaurantId === restaurantId;
  const isLoading = state.menu.loading || !isSameRestaurant;
  const items = isSameRestaurant
    ? getFilteredMenuItems(state.menu.items, { filter: "all", query: "" })
    : [];
  const isShop = isShopCatalogProfile(profile);
  const catalogLabel = getBusinessCatalogLabel(profile);
  const error = isSameRestaurant ? state.menu.error : "";
  const drinkItems = items.filter((item) => normalizeMenuType(item.type) === "drink");
  const foodItems = items.filter((item) => normalizeMenuType(item.type) !== "drink");
  const hasItems = items.length > 0;
  if (hasItems && restaurantId) {
    primeMenuItemCounts(items, restaurantId);
  }
  return `
    <div class="px-5 app-main-content-safe space-y-5">
      ${renderFocusCarousel(profile)}
      ${isLoading ? `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtml(catalogLabel)} wird geladen...</div>
        </div>
      ` : `
        ${!hasItems ? `
          <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
            <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
              Keine Produkte
            </div>
          </div>
        ` : `
          ${isShop ? `
            ${renderShopProductList(items, { profile })}
          ` : `
            ${drinkItems.length ? `
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">Getraenke</h3>
                </div>
                ${renderMenuDrinkGrid(drinkItems, { mode: "profile" })}
              </div>
            ` : ""}
            ${foodItems.length ? `
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">Speisen</h3>
                </div>
                ${renderMenuFoodList(foodItems, { mode: "profile" })}
              </div>
            ` : ""}
          `}
        `}
        ${error ? `<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${escapeHtml(error)}</div>` : ""}
      `}
    </div>
  `;
}

function renderProfileView() {
  const profile = state.userProfile;
  const isBusiness = isLocalBusinessProfile(profile);
  const posts = isBusiness ? state.businessPosts : state.userPosts;
  const handle = String(profile.handle || normalizeHandle(profile.name || "user")).replace(/^@/, "");
  const safeBio = escapeHtml(profile.bio || "").replace(/\n/g, "<br>");
  const bioHtml = safeBio || "Noch keine Bio.";
  const isMediaTab = state.profileContentTab === "media";
  const isCheckinTab = state.profileContentTab === "checkins";
  const filteredPosts = isMediaTab ? posts.filter((p) => p.isVideo) : posts;
  const avatarUrl = getOptimizedImageUrl(profile.avatar, "avatar");
  const avatarFit = logoFitClass(isBusiness);
  const requestedTopTab = state.profileTopTab || "profile";
  const hasRegisteredUser = !!String(state.user?.uid || "").trim();
  let topTab = "profile";
  if (profile.restaurantId) {
    topTab = requestedTopTab;
  } else if (requestedTopTab === "favorites" && hasRegisteredUser) {
    topTab = "favorites";
  }
  const topPaddingClass = profile.restaurantId ? (topTab === "profile" ? "pt-2" : "pt-4") : "pt-10";
  return `
    <div class="app-main-content-safe">
      ${topTab === "profile" ? `
      <div class="px-5 pb-2 ${topPaddingClass}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${escapeHtml(avatarUrl)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${avatarFit} border-2 border-white" />
                </div>
                ${profile.isPremium ? `
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${icon("badge-check", "w-4 h-4 fill-blue-500 text-white")}
                  </div>
                ` : ""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(formatCount(profile.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Fans</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${escapeHtml(formatCount(profile.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Folgt</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${escapeHtml(profile.name || "User")}</h1>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${escapeHtml(handle)}</p>
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${bioHtml}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${escapeHtml(profile.location || "-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${icon("plus", "w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${icon("settings", "w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
      </div>

      ${renderProfileTabs()}
      ${renderProfileViewControls()}

      ${isCheckinTab ? `
        ${renderProfileCheckins()}
      ` : `
        <div class="${state.profileViewMode === "grid" ? "grid grid-cols-2 gap-4 px-6 grid-flow-dense" : "flex flex-col gap-8 px-6"}">
          ${renderProfilePostsFancy(filteredPosts, state.profileViewMode)}
        </div>
        ${state.profileContentTab === "posts" ? `
          <div class="px-6 mt-8 mb-4">
            <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
              <span class="relative z-10 flex items-center gap-2">
                ${icon("plus", "w-4 h-4")} Neuen Beitrag
              </span>
              <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        ` : ""}
      `}
      ` : `
        ${topTab === "cart"
          ? renderProfileShopCartView(profile)
          : (topTab === "favorites" ? renderProfileShopFavoritesView(profile) : renderProfileMenuView(profile))}
      `}
    </div>
  `;
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

function isOwnBusinessTarget({ restaurantId = "", name = "" } = {}) {
  if (!isLocalBusinessProfile(state.userProfile)) return false;
  const ownRestaurantId = String(state.userProfile.restaurantId || "").trim();
  const targetRestaurantId = String(restaurantId || "").trim();
  if (ownRestaurantId && targetRestaurantId && ownRestaurantId === targetRestaurantId) return true;

  const ownRest = ownRestaurantId ? getRestaurantMetaById(ownRestaurantId) : null;
  const ownNames = [
    state.userProfile.name,
    ownRest?.name,
    ownRest?.restaurantName
  ].map((item) => normalizeSearchKey(item)).filter(Boolean);
  const targetName = normalizeSearchKey(name);
  if (!targetName) return false;
  return ownNames.includes(targetName);
}

function openOwnBusinessProfile({ showBack = true, topTab } = {}) {
  const prevTab = state.activeTab || "feed";
  const nextTopTab = topTab === "menu" ? "menu" : "profile";
  state.profileView = null;
  state.profileModal = { open: false, profile: null };
  state.profileContentTab = "posts";
  state.profileTopTab = nextTopTab;
  state.profileViewMode = "grid";
  state.profilePostMenuId = null;
  state.drawerOpen = false;
  state.activeTab = "profile";
  state.profileBackTab = showBack ? prevTab : "";
  render();
  if (nextTopTab === "menu") {
    ensureMenuDataForProfile();
    ensureFocusDataForProfile();
  }
}

function clearNotificationQueryParams() {
  clearQueryParamsFromCurrentUrlCore({
    windowObj: typeof window === "undefined" ? null : window,
    keys: ["notif", "notification", "nid"]
  });
}

function clearPostQueryParams() {
  clearQueryParamsFromCurrentUrlCore({
    windowObj: typeof window === "undefined" ? null : window,
    keys: ["post", "postId"]
  });
}

function clearChatQueryParams() {
  clearQueryParamsFromCurrentUrlCore({
    windowObj: typeof window === "undefined" ? null : window,
    keys: ["chat", "thread"]
  });
}

function resolveRouteStateFromTargetUrl(rawUrl = "") {
  return resolveRouteStateFromTargetUrlCore({
    rawUrl,
    windowObj: typeof window === "undefined" ? null : window,
    resolveInitialRouteState,
    normalizeInitialTab,
    normalizeAuthMode
  });
}

function applyPendingRouteStateFromTargetUrl(rawUrl = "") {
  const routeState = resolveRouteStateFromTargetUrl(rawUrl);
  const applied = applyPendingRouteStateCore({
    current: {
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
    },
    routeState
  });
  if (!applied.changed) return false;
  pendingProfileRestaurantId = applied.next.pendingProfileRestaurantId;
  pendingProfileTopTab = applied.next.pendingProfileTopTab;
  pendingProfileHandled = applied.next.pendingProfileHandled;
  pendingNotificationId = applied.next.pendingNotificationId;
  pendingNotificationHandled = applied.next.pendingNotificationHandled;
  pendingPostId = applied.next.pendingPostId;
  pendingPostHandled = applied.next.pendingPostHandled;
  pendingChatUid = applied.next.pendingChatUid;
  pendingChatHandled = applied.next.pendingChatHandled;
  pendingInitialTab = applied.next.pendingInitialTab;
  pendingAuthMode = applied.next.pendingAuthMode;
  return true;
}

async function maybeOpenNotificationFromQuery() {
  if (pendingNotificationHandled) return false;
  if (!pendingNotificationId) return false;
  if (!state.user?.uid) return false;

  const safeNotificationId = normalizePendingNotificationIdCore(pendingNotificationId);
  if (!safeNotificationId) return false;
  pendingNotificationHandled = true;
  pendingNotificationId = "";
  clearNotificationQueryParams();

  let notificationItem = findNotificationByIdCore({
    notifications: state.notifications || [],
    notificationId: safeNotificationId
  });
  if (!notificationItem) {
    try {
      const snap = await getDoc(doc(db, "users", state.user.uid, "notifications", safeNotificationId));
      if (snap.exists()) {
        notificationItem = normalizeNotificationItem(snap);
      }
    } catch (err) {
      console.error(err);
    }
  }
  if (!notificationItem) return false;

  state.notifications = prependNotificationByIdCore({
    notifications: state.notifications || [],
    notificationItem,
    notificationId: safeNotificationId
  });
  saveNotifications(state.notifications);
  await openNotificationTarget(safeNotificationId);
  return true;
}

async function maybeOpenPostFromQuery() {
  if (pendingPostHandled) return false;
  if (!pendingPostId) return false;
  if (!state.user?.uid) return false;

  const safePostId = normalizePendingPostIdCore(pendingPostId);
  if (!safePostId) return false;
  pendingPostHandled = true;
  pendingPostId = "";
  clearPostQueryParams();

  let post = findPostInLocalSourcesCore({
    postId: safePostId,
    findPostById: (id) => findPostById(id),
    feedPosts: state.feedPosts
  });
  if (!post) {
    post = await fetchPostForNotification({ postId: safePostId });
  }
  if (!post) return false;

  state.activeTab = "feed";
  await openPostModal(post);
  return true;
}

function maybeOpenChatFromQuery() {
  if (pendingChatHandled) return false;
  if (!pendingChatUid) return false;
  if (!state.user?.uid) return false;

  const safeChatUid = normalizePendingChatUidCore(pendingChatUid);
  if (!safeChatUid) return false;
  if (isSelfPendingChatTargetCore({
    chatUid: safeChatUid,
    currentUid: state.user.uid
  })) {
    pendingChatHandled = true;
    pendingChatUid = "";
    clearChatQueryParams();
    return false;
  }

  pendingChatHandled = true;
  pendingChatUid = "";
  clearChatQueryParams();

  if (isChatThreadAlreadyOpenCore({
    chatModalOpen: state.chatModal.open,
    currentThreadId: getChatThreadId(state.chatModal.profile),
    targetUid: safeChatUid
  })) {
    return true;
  }

  const thread = getChatThreadById(safeChatUid);
  openChatWithProfile(buildChatRouteTargetProfileCore({ thread, targetUid: safeChatUid }));
  return true;
}

function handlePushOpenTargetMessage(payload = {}) {
  const parsed = parsePushOpenTargetPayloadCore(payload);
  const safeNotificationId = parsed.notificationId;
  const targetUrl = parsed.targetUrl;
  const hasRouteFromUrl = applyPendingRouteStateFromTargetUrl(targetUrl);
  if (safeNotificationId) {
    pendingNotificationHandled = false;
    pendingNotificationId = safeNotificationId;
  }
  if (!shouldHandlePushOpenTargetCore({ notificationId: safeNotificationId, hasRouteFromUrl })) return;
  const prevActiveTab = state.activeTab;
  applyPendingInitialRouteState();
  const tabChangedByRoute = state.activeTab !== prevActiveTab;
  if (!state.user?.uid) {
    if (tabChangedByRoute) render();
    return;
  }
  void (async () => {
    maybeOpenProfileFromQuery();
    const openedNotification = await maybeOpenNotificationFromQuery();
    if (openedNotification) return;
    const openedPost = await maybeOpenPostFromQuery();
    if (openedPost) return;
    const openedChat = maybeOpenChatFromQuery();
    if (!openedChat && (tabChangedByRoute || hasRouteFromUrl)) {
      render();
    }
  })();
}

function bindPushOpenTargetMessageHandler() {
  if (pushOpenMessageBound) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("message", (event) => {
    const payload = event?.data || {};
    if (!isPushOpenTargetMessageCore(payload)) return;
    handlePushOpenTargetMessage(payload);
  });
  pushOpenMessageBound = true;
}

function maybeOpenProfileFromQuery() {
  if (pendingProfileHandled) return;
  if (!pendingProfileRestaurantId) return;
  if (!state.user) return;
  const safeRestaurantId = normalizePendingProfileRestaurantIdCore(pendingProfileRestaurantId);
  if (isPendingProfileAlreadyOpenCore({
    pendingProfileRestaurantId: safeRestaurantId,
    currentProfileRestaurantId: state.profileView?.profile?.restaurantId || ""
  })) {
    pendingProfileHandled = true;
    pendingProfileRestaurantId = "";
    pendingProfileTopTab = "";
    return;
  }
  pendingProfileHandled = true;
  const nextId = safeRestaurantId;
  const nextTabRaw = pendingProfileTopTab;
  pendingProfileRestaurantId = "";
  pendingProfileTopTab = "";
  const nextTab = normalizeProfileTopTabFromRouteCore(nextTabRaw);
  openProfileViewFromBusiness({ id: nextId }, { showBack: false, topTab: nextTab });
}

async function openProfileViewFromBusiness(input, { showBack = true, topTab } = {}) {
  try {
    const safeName = String(typeof input === "string" ? input : input?.name || "").trim();
    const restaurantId = typeof input === "string" ? "" : (input?.id || "");
    if (!safeName && !restaurantId) return;

    if (isOwnBusinessTarget({ restaurantId, name: safeName })) {
      openOwnBusinessProfile({ showBack, topTab });
      return;
    }

    if (restaurantId) {
      void hydrateRestaurantsByIds([restaurantId], { max: 1 });
    }

    const rest = restaurantId
      ? (state.restaurants.find((r) => r.id === restaurantId) || { id: restaurantId })
      : (state.restaurants.find((r) => (r.name || r.restaurantName || "") === safeName) || {});

    const fallbackPosts = state.feedPosts
      .filter((p) => (restaurantId ? p.restaurantId === restaurantId : p.business === safeName))
      .map((p, idx) => ({
        id: p.id || `feed_${idx}`,
        url: p.image,
        type: p.type || "square",
        caption: p.content || "",
        createdAt: p.createdAt,
        likes: p.likes ?? 0,
        comments: p.comments ?? 0,
        ownerType: "restaurant",
        ownerId: restaurantId || p.restaurantId || ""
      }));

    const placeholderProfile = normalizeExternalProfile({
      profileDoc: null,
      restaurant: rest,
      fallbackName: safeName || rest.name || rest.restaurantName || "Business",
      posts: fallbackPosts
    });

    showPublicProfile(placeholderProfile, placeholderProfile.posts, { showBack, topTab });

    const [profileSnap, posts] = await Promise.all([
      fetchBusinessProfileDoc({ restaurantId, restaurant: rest }),
      restaurantId ? loadBusinessPostsForRestaurant(restaurantId) : Promise.resolve(fallbackPosts)
    ]);

    const resolved = normalizeExternalProfile({
      profileDoc: profileSnap,
      restaurant: rest,
      fallbackName: safeName || rest.name || rest.restaurantName || "Business",
      posts: posts && posts.length ? posts : fallbackPosts
    });

    if (state.activeTab !== "profile") return;
    if (restaurantId && state.profileView?.profile?.restaurantId !== restaurantId) return;
    showPublicProfile(resolved, resolved.posts, { showBack, topTab });
  } catch (err) {
    console.error(err);
  }
}

async function openProfileFromUser(input) {
  if (!state.user) {
    openGuestAuthPrompt("Bitte einloggen, um User-Profile zu sehen.");
    return;
  }
  try {
    const uid = typeof input === "string" ? input : (input?.uid || "");
    const handle = String(typeof input === "string" ? "" : (input?.handle || input?.name || "")).replace(/^@/, "");
    if (!uid && !handle) return;

    const cacheKey = uid || handle;
    const cached = userProfileCache.get(cacheKey);
    if (cached) {
      cached.pendingFollowRequest = await hasPendingFollowRequest(cached.uid || uid || "");
      showPublicProfile(cached, cached.posts || []);
      return;
    }

    const fallbackProfile = normalizeExternalUserProfile({ userDoc: null, fallback: input || {}, posts: [] });
    fallbackProfile.pendingFollowRequest = await hasPendingFollowRequest(fallbackProfile.uid || uid || "");
    showPublicProfile(fallbackProfile, []);

    let userDoc = null;
    if (uid) {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) userDoc = snap;
    } else if (handle) {
      const resolved = await resolveUserByHandle(handle);
      if (resolved?.id) userDoc = { id: resolved.id, data: resolved.data };
    }

    if (!userDoc) return;
    const posts = await loadUserPostsForUser(userDoc.id);
    const resolvedProfile = normalizeExternalUserProfile({
      userDoc,
      fallback: input || {},
      posts
    });
    resolvedProfile.pendingFollowRequest = await hasPendingFollowRequest(resolvedProfile.uid || "");
    userProfileCache.set(cacheKey, resolvedProfile);
    if (state.activeTab !== "profile") return;
    if (uid && state.profileView?.profile?.uid !== uid) return;
    showPublicProfile(resolvedProfile, resolvedProfile.posts);
  } catch (err) {
    console.error(err);
  }
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

function normalizeNotificationItem(docSnap) {
  return normalizeNotificationItemCore({
    docSnap,
    formatRelative,
    toDateSafe
  });
}

function mapNotificationSnapshot(snap) {
  return mapNotificationSnapshotCore({
    snap,
    normalizeNotificationItem: (docSnap) => normalizeNotificationItem(docSnap)
  });
}

function shouldSurfaceNativePushNow() {
  return shouldSurfaceNativePushNowCore({
    documentObj: typeof document !== "undefined" ? document : null,
    activeTab: state.activeTab
  });
}

function startNotificationsListener(user = state.user, { enableNativePush = false } = {}) {
  if (notificationsUnsub) {
    notificationsUnsub();
    notificationsUnsub = null;
  }
  const ownerUid = String(user?.uid || "").trim();
  if (!ownerUid) return;

  const liveQuery = buildNotificationsLiveQueryCore({
    db,
    ownerUid,
    collection,
    query,
    orderBy,
    limit,
    liveLimit: NOTIFICATIONS_LIVE_LIMIT
  });
  if (!liveQuery) return;
  const seenIds = new Set(readPushSeenIds(ownerUid));
  let seeded = false;

  notificationsUnsub = onSnapshot(liveQuery, (snap) => {
    const items = mapNotificationSnapshot(snap);
    handleNotificationsUpdate(items);

    if (!enableNativePush || !canEmitNativePushAlerts()) {
      if (!seeded) {
        addNotificationItemsToSeenSetCore({ items, seenIds });
        writePushSeenIds(Array.from(seenIds), ownerUid);
        seeded = true;
      }
      return;
    }

    if (!seeded) {
      addNotificationItemsToSeenSetCore({ items, seenIds });
      writePushSeenIds(Array.from(seenIds), ownerUid);
      seeded = true;
      return;
    }

    const nextNative = collectUnseenUnreadNotificationItemsFromChangesCore({
      changes: snap.docChanges(),
      normalizeNotificationItem: (docSnap) => normalizeNotificationItem(docSnap),
      seenIds
    });
    if (!nextNative.length) return;

    nextNative.forEach((item) => seenIds.add(item.id));
    writePushSeenIds(Array.from(seenIds), ownerUid);
    if (!shouldSurfaceNativePushNow()) return;
    void (async () => {
      for (const item of nextNative) {
        await showNativePushAlert(item);
      }
    })();
  }, (err) => {
    console.error(err);
  });
}

async function syncNotificationsPushRuntime({ user = state.user, interactive = false, enabled = state.settings?.pushNotifs } = {}) {
  const ownerUid = String(user?.uid || "").trim();
  if (!ownerUid) {
    setPushActivationIssue("Kein angemeldeter User fuer Push-Registrierung.");
    return false;
  }
  if (!enabled) {
    clearPushActivationIssue();
    startNotificationsListener(user, { enableNativePush: false });
    return false;
  }
  clearPushActivationIssue();

  const granted = await ensureNotificationPermission({ interactive });
  if (!granted) {
    startNotificationsListener(user, { enableNativePush: false });
    return false;
  }
  const registered = await syncPushDeviceRegistration({ interactive, force: interactive, enabled });
  // Avoid duplicate system notifications: native snapshot alerts are fallback only.
  startNotificationsListener(user, { enableNativePush: !registered });
  if (!registered && !pushActivationIssue) {
    setPushActivationIssue("Push-Registrierung fehlgeschlagen.");
  }
  return registered;
}

async function loadNotificationsFromFirebase({ force = false } = {}) {
  if (!state.user) return;
  try {
    const notificationsQuery = buildNotificationsFetchQueryCore({
      db,
      ownerUid: state.user.uid,
      collection,
      query,
      orderBy,
      limit,
      fetchLimit: 20
    });
    const items = await fetchNotificationsFromQueryCore({
      queryRef: notificationsQuery,
      getDocs,
      mapNotificationSnapshot: (snap) => mapNotificationSnapshot(snap)
    });
    state.notifications = items;
    saveNotifications(items);
    const updated = updateNotificationsDom();
    if (!updated && state.activeTab === "notifications") {
      render();
    }
  } catch (err) {
    console.error(err);
  }
}

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
    await setDoc(doc(db, "users", targetUid, "notifications", `follow_request_${state.user.uid}`), buildFollowRequestNotificationPayloadCore({
      actor,
      serverTimestampValue: serverTimestamp()
    }), { merge: true });
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
    documentObj: typeof document !== "undefined" ? document : null,
    commentId,
    commentsRootId: "postModalComments",
    timeoutMs: 2000,
    setTimeoutFn: (fn, ms) => setTimeout(fn, ms)
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
    pendingCommentHighlight = "";
    return;
  }
  const highlightId = resolveNotificationCommentHighlightIdCore({
    notificationType: notif.type,
    commentId: notif.commentId
  });
  if (highlightId) {
    pendingCommentHighlight = highlightId;
  }
  await openPostModal(post);
  if (pendingCommentHighlight) {
    if (highlightCommentInModal(pendingCommentHighlight)) {
      pendingCommentHighlight = "";
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

  const idx = state.followingHandles.indexOf(safeHandle);
  const safeTargetId = String(targetId || "").trim();
  const isUnfollow = idx >= 0 || (targetType === "user" && safeTargetId && state.followingTargetIds.includes(safeTargetId));
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
    await sendFollowRequest(safeHandle, { ...target, id: targetId, uid: targetId, type: "user" });
    return;
  }

  const followRef = doc(db, "users", state.user.uid, "following", getFollowDocId(targetType, targetId, safeHandle));
  const delta = isUnfollow ? -1 : 1;
  const toNum = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };
  const isBusiness = isLocalBusinessProfile(state.userProfile);

  try {
    if (isUnfollow) {
      await deleteDoc(followRef);
      if (idx >= 0) state.followingHandles.splice(idx, 1);
      if (targetType === "user" && safeTargetId) {
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
      state.followingHandles.unshift(safeHandle);
      if (targetType === "user" && safeTargetId) {
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
    if (profileModal && profileModal.handle === safeHandle) {
      profileModal.followers = Math.max(0, toNum(profileModal.followers) + delta);
    }
    if (profileView && profileView.handle === safeHandle) {
      profileView.followers = Math.max(0, toNum(profileView.followers) + delta);
      if (delta > 0) profileView.pendingFollowRequest = false;
    }

    businessProfileCache.forEach((cached) => {
      if (cached?.handle !== safeHandle) return;
      cached.followers = Math.max(0, toNum(cached.followers) + delta);
    });
  } catch (err) {
    console.error(err);
  }

  if (state.profileModal.open && !state.profileView) {
    renderOverlays();
  } else {
    render();
  }
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

function renderShopProductList(items, { source = "menu", showRestaurantName = false } = {}) {
  if (!items.length) {
    return `
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
          Keine Produkte
        </div>
      </div>
    `;
  }
  return `
    <div class="grid grid-cols-2 gap-4">
      ${items.map((item) => {
        const images = getMenuItemImages(item);
        const rawImg = images[0] || resolveMenuItemHero(item);
        const imgSrc = getOptimizedImageUrl(rawImg, "large");
        const safeImg = isPlaceholderUrl(imgSrc) ? PLACEHOLDER_IMAGE : imgSrc;
        const firebaseFallback = getFirebaseStorageUrl(rawImg);
        const fallbackImg = isDirectImageUrl(rawImg) && rawImg !== safeImg ? rawImg : firebaseFallback;
        const priceLabel = formatPrice(item.price);
        const stock = Number.isFinite(Number(item.stock)) ? Math.max(0, Number(item.stock)) : null;
        const thumbImages = images.slice(1, 4);
        const soldOut = item.available === false || stock === 0;
        const availabilityLabel = soldOut ? "Nicht verfuegbar" : "Verfuegbar";
        const availabilityClass = soldOut ? "text-slate-300" : "text-emerald-600";
        const restaurantAttr = source === "favorites" && item.restaurantId
          ? ` data-menu-open-restaurant="${escapeHtml(item.restaurantId)}"`
          : "";
        return `
          <article data-menu-open="${escapeHtml(item.id)}" data-menu-open-source="${escapeHtml(source)}"${restaurantAttr} role="button" tabindex="0" class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col" style="touch-action:pan-y;">
            <div class="rounded-[1.5rem] overflow-hidden bg-slate-100" style="aspect-ratio:4 / 5;">
              <img src="${escapeHtml(safeImg)}" data-fallback-src="${escapeHtml(fallbackImg)}" class="w-full h-full object-cover" style="object-position:${getMenuItemObjectPosition(item)};" loading="lazy" decoding="async" />
            </div>
            ${thumbImages.length ? `
              <div class="grid grid-cols-3 gap-2 mt-2">
                ${thumbImages.map((thumb) => `
                  <div class="rounded-xl overflow-hidden bg-slate-100 border border-slate-100" style="aspect-ratio:4 / 5;">
                    <img src="${escapeHtml(getOptimizedImageUrl(thumb, "thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                `).join("")}
              </div>
            ` : ""}
            <div class="pt-3 flex-1 flex flex-col min-w-0">
              ${showRestaurantName && item.restaurantName ? `<p class="text-[9px] font-black uppercase tracking-widest text-indigo-600 truncate mb-1">${escapeHtml(item.restaurantName)}</p>` : ""}
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-[13px] font-black text-slate-900 leading-tight line-clamp-2">${escapeHtml(item.name || "Produkt")}</p>
                </div>
                <span class="text-[11px] font-black text-slate-900 shrink-0">${escapeHtml(priceLabel)}</span>
              </div>
              ${item.description ? `<p class="text-[11px] text-slate-500 mt-2 line-clamp-2">${escapeHtml(item.description)}</p>` : ""}
              <div class="mt-auto pt-3">
                <span class="block text-[9px] font-black uppercase tracking-widest ${availabilityClass}">${availabilityLabel}</span>
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderProfileShopFavoritesView(profile = state.profileView?.profile || state.userProfile) {
  const userUid = String(state.user?.uid || "").trim();
  if (!userUid) {
    return `
      <div class="px-5 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm text-center">
          <div class="w-14 h-14 rounded-[1.4rem] bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            ${icon("bookmark", "w-6 h-6")}
          </div>
          <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Favoriten nur fuer User</p>
          <p class="text-sm font-medium text-slate-500 mt-3">Bitte registrieren oder einloggen.</p>
          <button data-auth-open class="mt-5 px-5 h-11 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
            Login / Register
          </button>
        </div>
      </div>
    `;
  }
  if (!state.favoriteMenuItems.loading && !state.favoriteMenuItems.loaded && !(state.favoriteMenuItems.items || []).length) {
    void loadFavoriteMenuItems();
  }
  const favoriteState = state.favoriteMenuItems || createEmptyFavoriteMenuItemsState();
  const favoriteItems = Array.isArray(favoriteState.items) ? favoriteState.items : [];
  const isLoading = favoriteState.loading || (!favoriteState.loaded && !favoriteItems.length);
  return `
    <div class="p-6 app-main-content-safe space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Favoriten</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Du liebst</h2>
        </div>
      </div>
      ${isLoading ? `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">Favoriten werden geladen...</div>
        </div>
      ` : favoriteState.error ? `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-rose-500">${escapeHtml(favoriteState.error)}</div>
        </div>
      ` : favoriteItems.length ? `
        ${renderShopProductList(favoriteItems, { source: "favorites", showRestaurantName: true })}
      ` : `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm text-center">
          <div class="w-14 h-14 rounded-[1.4rem] bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            ${icon("bookmark", "w-6 h-6")}
          </div>
          <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Noch keine Favoriten</p>
          <p class="text-sm font-medium text-slate-500 mt-3">Tippe im Produkt-Drawer auf das Bookmark-Icon.</p>
        </div>
      `}
    </div>
  `;
}

function openMenuDetailFromTrigger(trigger) {
  const itemId = trigger?.dataset?.menuOpen || "";
  if (!itemId) return;
  const source = trigger?.dataset?.menuOpenSource || "menu";
  const sourceItems = source === "favorites"
    ? (Array.isArray(state.favoriteMenuItems?.items) ? state.favoriteMenuItems.items : [])
    : (state.menu.items || []);
  const item = sourceItems.find((it) => String(it.id) === String(itemId));
  if (!item) return;
  const detailItem = source === "favorites"
    ? {
      ...item,
      catalogMode: "shop",
      restaurantType: item.restaurantType || item.customerType || "ecommerce",
      customerType: item.customerType || item.restaurantType || "ecommerce"
    }
    : item;
  void openMenuDetail(
    detailItem,
    trigger?.dataset?.menuOpenRestaurant
      || item.restaurantId
      || state.menu.restaurantId
      || state.profileView?.profile?.restaurantId
      || state.userProfile.restaurantId
      || ""
  );
}

function triggerMenuDetailOpenFromGesture(trigger) {
  const key = [
    trigger?.dataset?.menuOpenSource || "menu",
    trigger?.dataset?.menuOpenRestaurant || "",
    trigger?.dataset?.menuOpen || ""
  ].join("::");
  const now = Date.now();
  if (key && key === lastMenuOpenGestureKey && now - lastMenuOpenGestureAt < 700) return;
  lastMenuOpenGestureKey = key;
  lastMenuOpenGestureAt = now;
  openMenuDetailFromTrigger(trigger);
}

let authPersistenceReady = null;
function ensureAuthLocalPersistence() {
  if (authPersistenceReady) return authPersistenceReady;
  authPersistenceReady = setPersistence(auth, browserLocalPersistence).catch(() => null);
  return authPersistenceReady;
}

function renderProfileShopCartView(profile = state.profileView?.profile || state.userProfile) {
  const context = getShopCartProfileContext(profile);
  const cartMatches = context.restaurantId && String(state.shopCart.restaurantId || "") === context.restaurantId;
  const items = cartMatches ? (state.shopCart.items || []) : [];
  const total = cartMatches ? getShopCartTotal() : 0;
  const hasOtherCart = !!state.shopCart.restaurantId && !cartMatches && (state.shopCart.items || []).length;
  return `
    <div class="px-5 app-main-content-safe space-y-5">
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Warenkorb</span>
            <h3 class="text-xl font-black italic tracking-tighter">${escapeHtml(context.businessName || "Shop")}</h3>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            ${icon("shopping-cart", "w-5 h-5")}
          </div>
        </div>
        ${hasOtherCart ? `
          <p class="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Dein aktueller Warenkorb gehoert zu einem anderen Shop.</p>
        ` : items.length ? `
          <div class="space-y-3">
            ${items.map((item) => `
              <div class="flex items-center gap-3 p-3 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-14 h-14 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${escapeHtml(getOptimizedImageUrl(item.imageUrl || "", "thumb"))}" class="w-full h-full object-cover" style="object-position:${clampCropPercent(item.cropX ?? 50, 50)}% ${clampCropPercent(item.cropY ?? 50, 50)}%;" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${escapeHtml(item.name)}</p>
                  ${item.selectedSize || item.selectedColor ? `<p class="text-[9px] font-bold uppercase tracking-widest text-slate-300 mt-1">${escapeHtml([item.selectedSize, item.selectedColor].filter(Boolean).join(" / "))}</p>` : ""}
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">${escapeHtml(formatPrice(item.price))}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button data-cart-qty="${escapeHtml(item.cartKey || item.itemId)}" data-cart-delta="-1" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center">${icon("minus", "w-3 h-3")}</button>
                  <span class="w-6 text-center text-sm font-black text-slate-900">${escapeHtml(item.quantity)}</span>
                  <button data-cart-qty="${escapeHtml(item.cartKey || item.itemId)}" data-cart-delta="1" class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center">${icon("plus", "w-3 h-3")}</button>
                </div>
              </div>
            `).join("")}
            <div class="pt-3 flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Gesamt</span>
              <span class="text-lg font-black text-slate-900">${escapeHtml(formatPrice(total))}</span>
            </div>
            <button data-cart-checkout="open" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200/60 active:scale-95">
              Checkout starten
            </button>
            ${state.shopCart.status && !state.shopCart.checkoutOpen ? `<p class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">${escapeHtml(state.shopCart.status)}</p>` : ""}
          </div>
        ` : `
          <div class="text-center py-14">
            <div class="w-14 h-14 rounded-[1.4rem] bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
              ${icon("shopping-bag", "w-6 h-6")}
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Warenkorb leer</p>
            <p class="text-sm font-medium text-slate-500 mt-3">Tippe auf das Plus bei einem Produkt.</p>
          </div>
        `}
      </div>
      ${cartMatches && items.length && state.shopCart.checkoutOpen ? `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Checkout</span>
            <h3 class="text-xl font-black italic tracking-tighter">Lieferdaten</h3>
          </div>
          <div class="grid grid-cols-1 gap-3">
            <input data-cart-field="name" type="text" value="${escapeHtml(state.shopCart.form.name || "")}" placeholder="Name" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <input data-cart-field="phone" type="text" value="${escapeHtml(state.shopCart.form.phone || "")}" placeholder="Tel Nummer" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <input data-cart-field="city" type="text" value="${escapeHtml(state.shopCart.form.city || "")}" placeholder="Qyteti" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            <textarea data-cart-field="address" rows="3" placeholder="Adresa" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${escapeHtml(state.shopCart.form.address || "")}</textarea>
          </div>
          <button data-cart-checkout="submit" class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95" ${state.shopCart.loading ? "disabled" : ""}>
            ${state.shopCart.loading ? "Senden..." : "Bestellung absenden"}
          </button>
          ${state.shopCart.status ? `<p class="text-center text-[10px] font-bold uppercase tracking-widest ${state.shopCart.loading ? "text-slate-400" : "text-slate-500"}">${escapeHtml(state.shopCart.status)}</p>` : ""}
        </div>
      ` : ""}
    </div>
  `;
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
  const likeCount = Number.isFinite(Number(comment.likesCount))
    ? Number(comment.likesCount)
    : (Array.isArray(comment.likes) ? comment.likes.length : 0);
  const isReply = !!parentId;
  const handleKey = normalizeHandle(comment.handle || comment.author || "");
  let avatarUrl = resolveCommentAvatar(comment);
  const selfUid = state.user?.uid || "";
  const selfHandle = normalizeHandle(state.userProfile.handle || state.userProfile.name || "");
  const isSelf = (!!selfUid && comment.uid && String(comment.uid) === String(selfUid))
    || (!!selfHandle && handleKey && handleKey === selfHandle);
  if (isSelf) {
    const selfAvatar = getSelfAvatarUrl();
    if (selfAvatar) avatarUrl = selfAvatar;
  }
  if (isPlaceholderUrl(avatarUrl)) scheduleCommentAvatarFetch(comment);
  const safeSrc = (!avatarUrl || isPlaceholderUrl(avatarUrl)) ? PLACEHOLDER_IMAGE : avatarUrl;
  return `
    <div class="flex gap-3 ${isReply ? "ml-10" : ""}" data-comment-id="${escapeHtml(comment.id)}" data-comment-parent="${escapeHtml(parentId || "")}" data-comment-uid="${escapeHtml(comment.uid || "")}" data-comment-handle="${escapeHtml(handleKey)}">
      <img src="${escapeHtml(safeSrc)}" data-img-key="comment-avatar:${escapeHtml(comment.id)}" data-comment-id="${escapeHtml(comment.id)}" data-comment-handle="${escapeHtml(handleKey)}" data-comment-uid="${escapeHtml(comment.uid || "")}" data-uid="${escapeHtml(comment.uid || "")}" data-handle="${escapeHtml(comment.handle || "")}" class="comment-avatar w-9 h-9 rounded-2xl object-cover shadow" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.src='${PLACEHOLDER_IMAGE}'" alt="" />
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <div class="text-xs font-black text-slate-900">${escapeHtml(comment.author)}</div>
          <div class="text-[10px] font-bold text-slate-400">${escapeHtml(formatDateTimeLabel(comment.createdAt))}</div>
        </div>
        <div class="text-sm text-slate-600 leading-relaxed mt-1">${escapeHtml(comment.text)}</div>
        <div class="flex items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-widest">
          <button data-comment-like="true" data-post-id="${escapeHtml(postId)}" data-comment-id="${escapeHtml(parentId || comment.id)}" data-reply-id="${isReply ? escapeHtml(comment.id) : ""}" class="flex items-center gap-1 text-slate-400 hover:text-rose-500">
            ${icon("heart", "w-3 h-3")} ${escapeHtml(likeCount)}
          </button>
          ${!isReply ? `<button data-comment-reply="true" data-post-id="${escapeHtml(postId)}" data-comment-id="${escapeHtml(comment.id)}" class="text-slate-400 hover:text-slate-900">Antworten</button>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderPostComments(comments) {
  if (state.postModal.loading) {
    return `<div class="text-center text-[10px] font-bold uppercase text-slate-400">Kommentare laden...</div>`;
  }
  const hasLiveComments = typeof modalCommentsUnsub === "function";
  const sendingRow = state.postModal.sending && hasLiveComments
    ? `<div class="text-center text-[10px] font-bold uppercase text-slate-400">Senden...</div>`
    : "";
  if (!comments.length) {
    return sendingRow || `<div class="text-center text-[10px] font-bold uppercase text-slate-400">Noch keine Kommentare</div>`;
  }
  return `${sendingRow}${comments.map((comment) => `
    <div class="space-y-3">
      ${renderCommentItem(state.postModal.post.id, comment)}
      ${(comment.replies || []).map((reply) => renderCommentItem(state.postModal.post.id, reply, comment.id)).join("")}
    </div>
  `).join("")}`;
}

function renderMenuCommentItem(comment) {
  const avatarUrl = resolveCommentAvatar(comment);
  if (isPlaceholderUrl(avatarUrl)) scheduleCommentAvatarFetch(comment);
  const safeSrc = (!avatarUrl || isPlaceholderUrl(avatarUrl)) ? PLACEHOLDER_IMAGE : avatarUrl;
  const handleKey = normalizeHandle(comment.handle || comment.author || "");
  return `
    <div class="flex gap-3" data-comment-id="${escapeHtml(comment.id || "")}" data-comment-uid="${escapeHtml(comment.uid || "")}" data-comment-handle="${escapeHtml(handleKey)}">
      <img src="${escapeHtml(safeSrc)}" data-img-key="comment-avatar:${escapeHtml(comment.id || "")}" data-comment-id="${escapeHtml(comment.id || "")}" data-comment-handle="${escapeHtml(handleKey)}" data-comment-uid="${escapeHtml(comment.uid || "")}" data-uid="${escapeHtml(comment.uid || "")}" data-handle="${escapeHtml(comment.handle || "")}" class="comment-avatar w-9 h-9 rounded-2xl object-cover shadow" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.src='${PLACEHOLDER_IMAGE}'" alt="" />
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <div class="text-xs font-black text-slate-900">${escapeHtml(comment.author || "User")}</div>
          <div class="text-[10px] font-bold text-slate-400">${escapeHtml(formatDateTimeLabel(comment.createdAt))}</div>
        </div>
        <div class="text-sm text-slate-600 leading-relaxed mt-1">${escapeHtml(comment.text || "")}</div>
      </div>
    </div>
  `;
}

function renderMenuDetailComments(comments) {
  if (state.menuDetail.loading) {
    return `<div class="text-center text-[10px] font-bold uppercase text-slate-400">Kommentare laden...</div>`;
  }
  const sendingRow = state.menuDetail.sending
    ? `<div class="text-center text-[10px] font-bold uppercase text-slate-400">Senden...</div>`
    : "";
  if (!comments.length) {
    return sendingRow || `<div class="text-center text-[10px] font-bold uppercase text-slate-400">Noch keine Kommentare</div>`;
  }
  return `${sendingRow}${comments.map((comment) => renderMenuCommentItem(comment)).join("")}`;
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
  if (!state.postModal.open || !state.postModal.post) return;
  const post = state.postModal.post;
  const meta = ensurePostMeta(post.id);
  const likeCount = Number(post.likes) || 0;
  const commentCount = Number(post.comments) || 0;
  const userBadge = currentUserBadge();
  const isLiked = meta.likes?.some((item) => item.uid === userBadge.uid || item.handle === userBadge.handle);

  const postLikeBtn = document.getElementById("postLikeBtn");
  if (postLikeBtn) {
    postLikeBtn.classList.toggle("text-rose-500", !!isLiked);
    postLikeBtn.classList.toggle("text-slate-700", !isLiked);
    postLikeBtn.innerHTML = `${icon("heart", "w-5 h-5")} ${isLiked ? "Gefaellt" : "Like"}`;
  }
  const postLikesBtn = document.getElementById("postLikesBtn");
  if (postLikesBtn) postLikesBtn.textContent = `${formatCount(likeCount)} Likes`;
  const postCommentsCount = document.getElementById("postCommentsCount");
  if (postCommentsCount) postCommentsCount.textContent = `${formatCount(commentCount)} Kommentare`;
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function updatePostModalCommentsOnly() {
  if (!state.postModal.open || !state.postModal.post) return;
  const post = state.postModal.post;
  const meta = ensurePostMeta(post.id);
  const comments = (meta.comments || []).map(ensureCommentShape);
  const postComments = document.getElementById("postModalComments");
  if (postComments) {
    postComments.innerHTML = renderPostComments(comments);
    applyCommentAvatarCache(postComments);
    hydrateCommentAvatars(postComments, { postId: post.id });
  }
  if (window.lucide?.createIcons) window.lucide.createIcons();
  if (pendingCommentHighlight) {
    if (highlightCommentInModal(pendingCommentHighlight)) {
      pendingCommentHighlight = "";
    }
  }
}

function updateMenuDetailMeta() {
  if (!state.menuDetail.open || !state.menuDetail.item) return;
  updateMenuDetailCountsOnly();
  updateMenuDetailCommentsOnly();
}

function updateMenuDetailCountsOnly() {
  if (!state.menuDetail.open || !state.menuDetail.item) return;
  const ctx = getMenuDetailContext();
  if (!ctx) return;
  const meta = ensureMenuItemMeta(ctx.key);
  const counts = resolveMenuItemCounts(meta);
  const userBadge = currentUserBadge();
  const isLiked = meta.likes?.some((item) => item.uid === userBadge.uid || item.handle === userBadge.handle);

  const likeBtn = document.getElementById("menuDetailLikeBtn");
  if (likeBtn) {
    likeBtn.classList.toggle("text-rose-500", !!isLiked);
    likeBtn.classList.toggle("text-slate-700", !isLiked);
    likeBtn.innerHTML = `${icon("heart", "w-5 h-5")} ${isLiked ? "Gefaellt" : "Like"}`;
  }
  const headerFavBtn = document.getElementById("menuDetailHeaderFavoritesBtn");
  if (headerFavBtn) {
    headerFavBtn.classList.toggle("bg-slate-900", !!isLiked);
    headerFavBtn.classList.toggle("text-white", !!isLiked);
    headerFavBtn.classList.toggle("border-slate-900", !!isLiked);
    headerFavBtn.classList.toggle("bg-slate-100", !isLiked);
    headerFavBtn.classList.toggle("text-slate-700", !isLiked);
    headerFavBtn.classList.toggle("border-slate-200", !isLiked);
  }
  const likesCount = document.getElementById("menuDetailLikesCount");
  if (likesCount) likesCount.textContent = `${formatCount(counts.likes)} Likes`;
  const commentsCount = document.getElementById("menuDetailCommentsCount");
  if (commentsCount) commentsCount.textContent = `${formatCount(counts.comments)} Kommentare`;
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

function updateMenuDetailCommentsOnly() {
  if (!state.menuDetail.open || !state.menuDetail.item) return;
  const ctx = getMenuDetailContext();
  if (!ctx) return;
  const meta = ensureMenuItemMeta(ctx.key);
  const comments = (meta.comments || []).map(ensureCommentShape);
  const commentsRoot = document.getElementById("menuDetailComments");
  if (commentsRoot) {
    commentsRoot.innerHTML = renderMenuDetailComments(comments);
    applyCommentAvatarCache(commentsRoot);
  }
  if (window.lucide?.createIcons) window.lucide.createIcons();
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
  return `
    <div id="notificationsView" class="p-6 animate-in slide-in-from-right-10 duration-700 h-full">
      <div class="flex justify-between items-end mb-8 px-2">
        <h2 class="text-2xl font-black italic uppercase">Updates</h2>
        <button id="markAllRead" class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-500">Alle gelesen</button>
      </div>
      <div id="notificationsList" class="space-y-3">
        ${renderNotificationsList(state.notifications)}
      </div>
    </div>
  `;
}

function renderNotificationsList(items) {
  if (!items.length) {
    return "<div class='text-center py-20 text-slate-400 font-bold text-xs uppercase'>Keine neuen Updates</div>";
  }
  return items.map((n) => `
    <div data-notif-open="${escapeHtml(n.id)}" class="flex items-center gap-4 p-4 rounded-[2rem] border transition-all relative overflow-hidden group cursor-pointer ${n.read ? "bg-white border-slate-50" : "bg-indigo-50/50 border-indigo-100"}">
      <img src="${escapeHtml(resolveNotificationAvatar(n))}" data-img-key="notif:${escapeHtml(n.id)}" class="w-12 h-12 rounded-2xl object-cover shadow-sm" />
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-slate-800"><span class="font-black">${escapeHtml(n.user)}</span> ${escapeHtml(n.text)}</p>
        <p class="text-[9px] text-slate-400 font-bold uppercase mt-1">${escapeHtml(n.time)}</p>
      </div>
      <div class="flex items-center gap-2">
        ${n.type === "follow_request" ? `<button data-follow-request-accept="${escapeHtml(n.id)}" class="px-3 py-2 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest active:scale-95">Accept</button>` : ""}
        ${!n.read ? "<div class=\"w-2 h-2 bg-indigo-500 rounded-full\"></div>" : ""}
        <button data-notif-delete="${n.id}" class="p-2 text-slate-300 hover:text-rose-500">${icon("trash-2", "w-4 h-4")}</button>
      </div>
    </div>
  `).join("");
}

function renderCrmLazyLoadingView(label = "CRM laden...") {
  return `
    <div class="p-6 text-center">
      <div class="w-20 h-20 rounded-[2.5rem] bg-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-6">
        ${icon("loader-circle", "w-8 h-8")}
      </div>
      <p class="text-[11px] font-black uppercase tracking-widest text-slate-400">${escapeHtml(label)}</p>
    </div>
  `;
}

function getCrmLazyRendererContext() {
  return {
    state,
    icon,
    escapeHtml,
    isCeoUser,
    renderCeoGuard,
    renderLeadSettingsView,
    renderLeadCreationView,
    renderStaffEditorView,
    getLeadSettingsConfig,
    LEAD_SOCIAL_DEFAULT_PASSWORD,
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
    leadMatchesQuery,
    customerMatchesQuery,
    leadStatusTone,
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
    getStaffFormEmail,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    normalizeCeoCountry,
    PLACEHOLDER_IMAGE
  };
}

async function ensureCrmLazyRenderersLoaded() {
  if (crmLazyRenderers) return crmLazyRenderers;
  if (!crmLazyRenderersPromise) {
    crmLazyRenderersPromise = import(CRM_LAZY_RENDERERS_MODULE_URL)
      .then((mod) => {
        crmLazyRenderers = {
          renderLeadSettingsView: mod.renderLeadSettingsView,
          renderLeadCreationView: mod.renderLeadCreationView,
          renderStaffEditorView: mod.renderStaffEditorView,
          renderLeadsView: mod.renderLeadsView,
          renderCustomersView: mod.renderCustomersView,
          renderStaffView: mod.renderStaffView
        };
        return crmLazyRenderers;
      })
      .catch((err) => {
        crmLazyRenderersPromise = null;
        throw err;
      });
  }
  return crmLazyRenderersPromise;
}

function prefetchCrmLazyRenderers() {
  if (crmLazyRenderers) return;
  const shouldAttachRefresh = !crmLazyRenderersPromise;
  const promise = ensureCrmLazyRenderersLoaded();
  if (!shouldAttachRefresh) return;
  promise.then(() => {
    if (!state.user) return;
    if (state.activeTab === "leads" || state.activeTab === "staff" || state.activeTab === "customers") {
      render();
    }
  }).catch(() => {});
}

function queueCrmLazyRenderersPrefetch() {
  if (crmLazyRenderers || crmLazyRenderersPromise || crmLazyRenderersPrefetchQueued) return;
  crmLazyRenderersPrefetchQueued = true;
  enqueueMicrotaskCore({
    fn: () => {
      crmLazyRenderersPrefetchQueued = false;
      prefetchCrmLazyRenderers();
    },
    queueMicrotaskFn: typeof queueMicrotask === "function" ? queueMicrotask : null,
    setTimeoutFn: typeof window !== "undefined" && typeof window.setTimeout === "function"
      ? window.setTimeout.bind(window)
      : null
  });
}

function renderCeoGuard(title = "CRM") {
  return `
    <div class="p-6 text-center">
      <div class="w-20 h-20 rounded-[2.5rem] bg-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-6">
        ${icon("lock", "w-8 h-8")}
      </div>
      <h2 class="text-lg font-black tracking-tight text-slate-900">${escapeHtml(title)}</h2>
      <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Nur CEO Zugriff</p>
    </div>
  `;
}

function renderLeadsView() {
  if (!crmLazyRenderers?.renderLeadsView) {
    prefetchCrmLazyRenderers();
    return renderCrmLazyLoadingView("Leads laden...");
  }
  return crmLazyRenderers.renderLeadsView(getCrmLazyRendererContext());
}

function isLeadInlineCreateView() {
  return state.activeTab === "leads" && state.leads?.view === "create";
}

function renderLeadEditorUi() {
  if (isLeadInlineCreateView()) {
    render();
    return;
  }
  renderOverlays({ updateLead: true });
}

async function refineLeadLocationAddressIndex(index, value, { hydratePrimary = false } = {}) {
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0) return null;
  const inputValue = String(value || "").trim();
  if (!inputValue) return null;
  const extracted = extractPlusCodeFromText(inputValue);
  if (!extracted?.code || !isLikelyShortPlusCode(extracted.code) || !String(extracted.remainder || "").trim()) {
    return null;
  }
  const refined = await parseCoordsFromAddressInputAsync(inputValue, getLeadPlusCodeReference(inputValue));
  if (!refined) return null;
  const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  while (list.length <= idx) list.push(createLeadLocation());
  const current = list[idx] || createLeadLocation();
  list[idx] = createLeadLocation({
    address: inputValue,
    lat: refined.lat,
    lng: refined.lng
  });
  state.leadModal.locations = list;
  if (idx === 0) {
    state.leadModal.coords = { lat: refined.lat, lng: refined.lng };
    if (hydratePrimary) {
      await hydrateLeadGeoFieldsFromCoords(refined, { sourceInputId: `leadLocationAddress_${idx}` });
    }
  } else if (hasLeadLocationCoords(current) || hasLeadLocationCoords(list[idx])) {
    const primary = getPrimaryLeadLocation(list);
    state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : state.leadModal.coords;
  }
  const badgeId = idx === 0 ? "leadCoordsDisplay" : `leadLocationCoords_${idx}`;
  const badge = document.getElementById(badgeId);
  if (badge) {
    badge.classList.remove("hidden");
    if (idx === 0) {
      badge.innerHTML = `${icon("check-circle-2", "w-3 h-3")} ${escapeHtml(`${refined.lat.toFixed(4)}, ${refined.lng.toFixed(4)}`)}`;
      if (window.lucide?.createIcons) window.lucide.createIcons();
    }
  }
  return refined;
}

function renderLeadSettingsView() {
  if (!crmLazyRenderers?.renderLeadSettingsView) {
    prefetchCrmLazyRenderers();
    return renderCrmLazyLoadingView("Lead Settings laden...");
  }
  return crmLazyRenderers.renderLeadSettingsView(getCrmLazyRendererContext());
}

function renderLeadCreationView() {
  if (!crmLazyRenderers?.renderLeadCreationView) {
    prefetchCrmLazyRenderers();
    return renderCrmLazyLoadingView("Lead Formular laden...");
  }
  return crmLazyRenderers.renderLeadCreationView(getCrmLazyRendererContext());
}

function resetLeadDraft() {
  state.leadModal = {
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
  };
}

function createLeadDraftState(mode = "create", lead = null) {
  const rest = lead?.restaurantId ? state.restaurants.find((r) => String(r.id) === String(lead.restaurantId)) : null;
  const leadCoords = resolveCoordsFromEntity(lead || {});
  const restCoords = resolveCoordsFromEntity(rest || {});
  const coords = preferStableCoords(leadCoords, restCoords);
  const lat = coords?.lat;
  const lng = coords?.lng;
  const locations = normalizeLeadLocations(
    lead?.locations || rest?.locations || [],
    lead?.address || rest?.address || "",
    coords
  );
  const primary = getPrimaryLeadLocation(locations);
  const settings = getLeadSettingsConfig();
  const businessName = lead?.businessName || rest?.name || rest?.restaurantName || "";
  const monthlyPrice = getLeadMonthlyPrice(lead?.customerType || rest?.type || "cafe", settings);
  const yearlyPrice = monthlyPrice * 12;
  const country = normalizeLeadCountry(lead?.country || rest?.country || settings.defaultCountry);
  const merged = {
    ...(lead || {}),
    businessName,
    city: lead?.city || rest?.city || "",
    address: locations[0]?.address || lead?.address || rest?.address || "",
    phone: lead?.phone || rest?.phone || "",
    instagram: lead?.instagram || lead?.insta || rest?.instagram || rest?.insta || "",
    facebook: lead?.facebook || rest?.facebook || "",
    tiktok: lead?.tiktok || rest?.tiktok || "",
    googleMaps: lead?.googleMaps || rest?.googleMaps || "",
    logoUrl: lead?.logoUrl || rest?.logoUrl || rest?.logo || "",
    email: lead?.email || lead?.socialEmail || buildLeadAccountEmail(businessName),
    password: lead?.password || settings.defaultPassword,
    country,
    zipCode: lead?.zipCode || rest?.zipCode || "",
    contactFirstName: lead?.contactFirstName || rest?.contactFirstName || "",
    contactLastName: lead?.contactLastName || rest?.contactLastName || "",
    billingCycle: lead?.billingCycle === "yearly" ? "yearly" : "monthly",
    monthlyPrice,
    yearlyPrice,
    lat: hasLeadLocationCoords(primary) ? primary.lat : (Number.isFinite(lat) ? lat : undefined),
    lng: hasLeadLocationCoords(primary) ? primary.lng : (Number.isFinite(lng) ? lng : undefined),
    locations,
    status: normalizeLeadStatusKey(lead?.status || "registered") || "registered"
  };
  return {
    open: false,
    mode,
    lead: merged,
    status: "",
    loading: false,
    deleting: false,
    actionsOpen: false,
    logoFile: null,
    logoPreview: merged.logoUrl || "",
    coords: hasLeadLocationCoords(primary)
      ? { lat: primary.lat, lng: primary.lng }
      : (coords || getLeadCountryCenter(country)),
    locations
  };
}

function openLeadCreator() {
  if (!isCeoUser()) return;
  state.leads.view = "create";
  state.leads.settingsStatus = "";
  state.leadModal = createLeadDraftState("create", null);
  render();
}

function openLeadSettingsView() {
  if (!isCeoUser()) return;
  state.leads.view = "settings";
  state.leads.settingsStatus = "";
  render();
}

function closeLeadSubview() {
  state.leads.view = "list";
  state.leads.settingsStatus = "";
  if (!state.leadModal.open) {
    resetLeadDraft();
  }
  render();
}

async function saveLeadSettings() {
  if (!state.user) return;
  const password = String(document.getElementById("leadSettingsPassword")?.value || "").trim();
  const defaultCountry = normalizeLeadCountry(document.getElementById("leadSettingsDefaultCountry")?.value || LEAD_SETTINGS_DEFAULT_COUNTRY);
  const pricing = LEAD_TYPE_ORDER.reduce((acc, key) => {
    const raw = Number(document.getElementById(`leadPrice_${key}`)?.value);
    acc[key] = Number.isFinite(raw) && raw >= 0 ? Number(raw) : 0;
    return acc;
  }, {});

  state.leads.settingsSaving = true;
  state.leads.settingsStatus = "Speichern...";
  render();

  try {
    const leadSettings = normalizeLeadSettings({
      defaultPassword: password || LEAD_SOCIAL_DEFAULT_PASSWORD,
      defaultCountry,
      pricing
    });
    await setDoc(doc(db, "users", state.user.uid), { leadSettings, updatedAt: serverTimestamp() }, { merge: true });
    state.userProfile = {
      ...state.userProfile,
      leadSettings
    };
    saveUserProfileToStorage();
    state.leads.settingsSaving = false;
    state.leads.settingsStatus = "Leads Settings gespeichert.";
    render();
  } catch (err) {
    console.error(err);
    state.leads.settingsSaving = false;
    state.leads.settingsStatus = err?.message || "Leads Settings konnten nicht gespeichert werden.";
    render();
  }
}

function getLeadFormCountryValue() {
  const inputValue = document.getElementById("leadCountry")?.value || state.leadModal?.lead?.country || "";
  return normalizeLeadCountry(inputValue || getLeadSettingsConfig().defaultCountry);
}

function getLeadPlusCodeReference(value = "") {
  return getLeadCountryCenter(inferLeadCountryFromText(value, getLeadFormCountryValue()));
}

async function reverseGeocodeCoords(coords) {
  const lat = Number(coords?.lat);
  const lng = Number(coords?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;
    const res = await fetch(url);
    const data = await res.json();
    const addr = data?.address || {};
    const addressLine = [
      addr.road,
      addr.house_number
    ].filter(Boolean).join(" ").trim();
    return {
      displayName: String(data?.display_name || "").trim(),
      country: normalizeLeadCountry(addr.country || addr.country_code || ""),
      city: String(addr.city || addr.town || addr.village || addr.state_district || addr.county || "").trim(),
      zipCode: String(addr.postcode || "").trim(),
      addressLine
    };
  } catch {
    return null;
  }
}

async function hydrateLeadGeoFieldsFromCoords(coords, { sourceInputId = "" } = {}) {
  const details = await reverseGeocodeCoords(coords);
  const sourceInput = sourceInputId ? document.getElementById(sourceInputId) : null;
  const sourceValue = sourceInput ? String(sourceInput.value || "").trim() : "";
  const country = normalizeLeadCountry(details?.country || getLeadFormCountryValue());
  const city = String(details?.city || "").trim();
  const zipCode = String(details?.zipCode || "").trim();
  const address = String(details?.displayName || details?.addressLine || sourceValue || "").trim();

  const countryInput = document.getElementById("leadCountry");
  const cityInput = document.getElementById("leadCity");
  const addressInput = document.getElementById("leadAddress");
  const zipInput = document.getElementById("leadZipCode");
  const googleMapsInput = document.getElementById("leadGoogleMaps");

  if (countryInput) countryInput.value = country;
  if (cityInput && city) cityInput.value = city;
  if (addressInput && address) addressInput.value = address;
  if (zipInput && zipCode) zipInput.value = zipCode;
  if (sourceInput && address) sourceInput.value = address;
  if (googleMapsInput && !String(googleMapsInput.value || "").trim()) {
    googleMapsInput.value = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
  }

  const currentLocations = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  if (currentLocations.length && address) {
    const first = currentLocations[0] || createLeadLocation();
    currentLocations[0] = createLeadLocation({
      address,
      lat: Number.isFinite(Number(first.lat)) ? Number(first.lat) : coords.lat,
      lng: Number.isFinite(Number(first.lng)) ? Number(first.lng) : coords.lng
    });
    state.leadModal.locations = currentLocations;
  }

  const currentLead = { ...(state.leadModal.lead || {}) };
  currentLead.country = country;
  if (city) currentLead.city = city;
  if (address) currentLead.address = address;
  if (zipCode) currentLead.zipCode = zipCode;
  if (!String(currentLead.googleMaps || "").trim()) {
    currentLead.googleMaps = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
  }
  state.leadModal.lead = currentLead;
}

function syncLeadDerivedFields() {
  if (!isLeadInlineCreateView()) return;
  const settings = getLeadSettingsConfig();
  const businessName = String(document.getElementById("leadBusinessName")?.value || state.leadModal?.lead?.businessName || "").trim();
  const type = resolveCustomerType(document.getElementById("leadCustomerType")?.value || state.leadModal?.lead?.customerType || "cafe");
  const cycle = document.getElementById("leadBillingCycle")?.value === "yearly" ? "yearly" : "monthly";
  const email = buildLeadAccountEmail(businessName);
  const password = settings.defaultPassword;
  const monthly = getLeadMonthlyPrice(type, settings);
  const total = getLeadPriceForCycle(type, cycle, settings);
  const yearly = monthly * 12;

  const emailInput = document.getElementById("leadEmail");
  const passwordInput = document.getElementById("leadPassword");
  const monthlyInput = document.getElementById("leadMonthlyPrice");
  const yearlyInput = document.getElementById("leadAnnualPrice");
  const priceInput = document.getElementById("leadPriceValue");

  if (emailInput) emailInput.value = email;
  if (passwordInput) passwordInput.value = password;
  if (monthlyInput) monthlyInput.value = monthly ? `${monthly.toFixed(2)} EUR / Monat` : "0.00 EUR / Monat";
  if (yearlyInput) yearlyInput.value = yearly ? `${yearly.toFixed(2)} EUR / Jahr` : "0.00 EUR / Jahr";
  if (priceInput) priceInput.value = total ? `${total.toFixed(2)} EUR` : "0.00 EUR";

  if (state.leadModal?.lead) {
    state.leadModal.lead = {
      ...state.leadModal.lead,
      businessName,
      customerType: type,
      email,
      password,
      billingCycle: cycle,
      monthlyPrice: monthly,
      yearlyPrice: yearly
    };
  }
}

function renderCustomersView() {
  if (!crmLazyRenderers?.renderCustomersView) {
    prefetchCrmLazyRenderers();
    return renderCrmLazyLoadingView("Kunden laden...");
  }
  return crmLazyRenderers.renderCustomersView(getCrmLazyRendererContext());
}

function renderStaffEditorView() {
  if (!crmLazyRenderers?.renderStaffEditorView) {
    prefetchCrmLazyRenderers();
    return renderCrmLazyLoadingView("Staff Editor laden...");
  }
  return crmLazyRenderers.renderStaffEditorView(getCrmLazyRendererContext());
}

function renderStaffView() {
  if (!crmLazyRenderers?.renderStaffView) {
    prefetchCrmLazyRenderers();
    return renderCrmLazyLoadingView("Staff laden...");
  }
  return crmLazyRenderers.renderStaffView(getCrmLazyRendererContext());
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

function renderSearchUserItem(user) {
  const handle = user.handle || normalizeHandle(user.name || "user");
  const displayName = sanitizeDisplayName(user.name, handle || "User");
  const avatarUrl = resolveSearchUserAvatarDisplay(user);
  const avatarRaw = user.avatarUrl || user.avatar || "";
  return `
    <button data-search-user="${escapeHtml(user.uid)}" data-search-handle="${escapeHtml(handle)}" data-search-name="${escapeHtml(displayName)}" data-search-avatar="${escapeHtml(avatarRaw)}" data-search-location="${escapeHtml(user.location)}" class="w-full flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left">
      <img src="${escapeHtml(avatarUrl)}" data-img-key="search-user:${escapeHtml(user.uid)}" class="w-12 h-12 rounded-2xl object-cover bg-slate-200" />
      <div class="flex-1 min-w-0">
        <p data-search-user-name class="text-sm font-black text-slate-900 truncate">${escapeHtml(displayName)}</p>
        <p data-search-user-handle class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">@${escapeHtml(handle)}</p>
      </div>
      <span class="text-[9px] font-black text-indigo-500 uppercase tracking-widest">User</span>
    </button>
  `;
}

function renderSearchBusinessItem(biz) {
  const name = biz.name || "Business";
  const logoUrl = resolveRestaurantLogo(biz.id, biz.logo, "avatar");
  const logoAttr = biz.id ? `data-search-logo="${escapeHtml(biz.id)}"` : "";
  return `
    <button data-search-business="${escapeHtml(biz.id)}" data-search-name="${escapeHtml(name)}" class="w-full flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left">
      <img src="${escapeHtml(logoUrl)}" ${logoAttr} data-img-key="search-biz:${escapeHtml(biz.id)}" class="w-12 h-12 rounded-2xl object-contain bg-white" />
      <div class="flex-1 min-w-0">
        <p data-search-business-name class="text-sm font-black text-slate-900 truncate">${escapeHtml(name)}</p>
        <p data-search-business-city class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">${escapeHtml(biz.city)}</p>
      </div>
      <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Business</span>
    </button>
  `;
}

function renderSearchView() {
  const query = state.search.query;
  const queryKey = normalizeSearchKey(query);
  const isGuest = isGuestSession();
  const filter = String(state.search.filter || "all");
  const safeFilter = isGuest && (filter === "all" || filter === "users") ? "business" : filter;
  const users = state.search.userResults || [];
  const businesses = state.search.businessResults?.length ? state.search.businessResults : buildLocalBusinessResults(queryKey);
  const showUsers = !isGuest && (safeFilter === "all" || safeFilter === "users");
  const showBusinesses = safeFilter === "all" || safeFilter === "business" || safeFilter === "local";
  const localLabel = safeFilter === "local" || queryKey === "lokal" || queryKey === "local" ? "Lokal" : "Business";
  const hasResults = (showUsers && users.length) || (showBusinesses && businesses.length);
  const filters = isGuest
    ? [
      { id: "business", label: "Business" },
      { id: "local", label: "Lokal" }
    ]
    : [
      { id: "all", label: "Alles" },
      { id: "users", label: "User" },
      { id: "business", label: "Business" },
      { id: "local", label: "Lokal" }
    ];

  return `
    <div id="searchView" class="p-6 animate-in slide-in-from-right-10 duration-700 h-full">
      <div class="mb-6 px-1">
        <p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Entdecken</p>
        <h2 class="text-2xl font-black italic uppercase tracking-tighter">Suche</h2>
      </div>

      <div class="relative mb-5">
        <input id="searchInput" type="text" value="${escapeHtml(query)}" placeholder="Suche nach User, Name oder Lokal..." class="w-full h-14 rounded-[2rem] border border-slate-100 bg-white px-5 pr-12 text-sm font-semibold outline-none shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
        <button id="searchClearBtn" class="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-700 transition">
          ${icon("x", "w-4 h-4")}
        </button>
      </div>

      <div class="flex gap-2 mb-6">
        ${filters.map((item) => `
          <button data-search-filter="${item.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${safeFilter === item.id ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-400 border border-slate-100"}">
            ${item.label}
          </button>
        `).join("")}
      </div>

      <div id="searchStatusLoading" class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ${state.search.loading ? "" : "hidden"}">Suche...</div>
      <div id="searchStatusError" class="text-xs font-bold text-rose-500 mb-4 ${state.search.error ? "" : "hidden"}">${escapeHtml(state.search.error || "")}</div>
      <div id="searchEmptyState" class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em] ${!hasResults && !query ? "" : "hidden"}">Tippe, um zu suchen</div>

      <div id="searchUsersSection" class="space-y-4 mb-10 ${showUsers ? "" : "hidden"}">
        <div class="flex items-center justify-between px-1">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">User</p>
          <p id="searchUsersCount" class="text-[10px] font-bold text-slate-300">${users.length}</p>
        </div>
        <div id="searchUsersList" class="space-y-4">
          ${users.length ? users.map(renderSearchUserItem).join("") : (query ? `<div class="text-xs font-bold text-slate-300 px-2">Keine User gefunden.</div>` : "")}
        </div>
      </div>

      <div id="searchBizSection" class="space-y-4 ${showBusinesses ? "" : "hidden"}">
        <div class="flex items-center justify-between px-1">
          <p id="searchBizLabel" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${localLabel}</p>
          <p id="searchBizCount" class="text-[10px] font-bold text-slate-300">${businesses.length}</p>
        </div>
        <div id="searchBizList" class="space-y-4">
          ${businesses.length ? businesses.map(renderSearchBusinessItem).join("") : (query ? `<div class="text-xs font-bold text-slate-300 px-2">Keine ${localLabel} gefunden.</div>` : "")}
        </div>
      </div>
    </div>
  `;
}

function updateSearchDom() {
  const searchView = document.getElementById("searchView");
  if (!searchView) return false;

  const query = state.search.query;
  const queryKey = normalizeSearchKey(query);
  const isGuest = isGuestSession();
  const filter = String(state.search.filter || "all");
  const safeFilter = isGuest && (filter === "all" || filter === "users") ? "business" : filter;
  const users = state.search.userResults || [];
  const businesses = state.search.businessResults?.length ? state.search.businessResults : buildLocalBusinessResults(queryKey);
  const showUsers = !isGuest && (safeFilter === "all" || safeFilter === "users");
  const showBusinesses = safeFilter === "all" || safeFilter === "business" || safeFilter === "local";
  const localLabel = safeFilter === "local" || queryKey === "lokal" || queryKey === "local" ? "Lokal" : "Business";
  const hasResults = (showUsers && users.length) || (showBusinesses && businesses.length);

  const searchInput = document.getElementById("searchInput");
  if (searchInput && document.activeElement !== searchInput && searchInput.value !== query) {
    searchInput.value = query;
  }

  const loadingEl = document.getElementById("searchStatusLoading");
  if (loadingEl) loadingEl.classList.toggle("hidden", !state.search.loading);
  const errorEl = document.getElementById("searchStatusError");
  if (errorEl) {
    errorEl.textContent = state.search.error || "";
    errorEl.classList.toggle("hidden", !state.search.error);
  }
  const emptyEl = document.getElementById("searchEmptyState");
  if (emptyEl) emptyEl.classList.toggle("hidden", !!query || hasResults);

  const usersSection = document.getElementById("searchUsersSection");
  if (usersSection) usersSection.classList.toggle("hidden", !showUsers);
  const usersCount = document.getElementById("searchUsersCount");
  if (usersCount) usersCount.textContent = String(users.length);
  const usersList = document.getElementById("searchUsersList");
  if (usersList) {
    if (!users.length) {
      usersList.innerHTML = query
        ? `<div class="text-xs font-bold text-slate-300 px-2">Keine User gefunden.</div>`
        : "";
    } else {
      patchSearchUserList(users);
    }
  }

  const bizSection = document.getElementById("searchBizSection");
  if (bizSection) bizSection.classList.toggle("hidden", !showBusinesses);
  const bizLabel = document.getElementById("searchBizLabel");
  if (bizLabel) bizLabel.textContent = localLabel;
  const bizCount = document.getElementById("searchBizCount");
  if (bizCount) bizCount.textContent = String(businesses.length);
  const bizList = document.getElementById("searchBizList");
  if (bizList) {
    if (!businesses.length) {
      bizList.innerHTML = query
        ? `<div class="text-xs font-bold text-slate-300 px-2">Keine ${localLabel} gefunden.</div>`
        : "";
    } else {
      patchSearchBusinessList(businesses);
      businesses.forEach(updateSearchBusinessNodes);
    }
  }

  document.querySelectorAll("[data-search-filter]").forEach((btn) => {
    const isActive = btn.dataset.searchFilter === safeFilter;
    btn.classList.toggle("bg-slate-900", isActive);
    btn.classList.toggle("text-white", isActive);
    btn.classList.toggle("shadow-md", isActive);
    btn.classList.toggle("bg-white", !isActive);
    btn.classList.toggle("text-slate-400", !isActive);
    btn.classList.toggle("border", !isActive);
    btn.classList.toggle("border-slate-100", !isActive);
  });

  if (window.lucide?.createIcons) window.lucide.createIcons();
  return true;
}

function patchSearchBusinessList(businesses) {
  const bizList = document.getElementById("searchBizList");
  if (!bizList) return false;
  const existingItems = Array.from(bizList.querySelectorAll("[data-search-business]"));
  const currentIds = existingItems.map((el) => el.dataset.searchBusiness || "");
  const nextIds = businesses.map((biz) => String(biz.id || ""));
  if (currentIds.join("|") === nextIds.join("|")) {
    return true;
  }
  const existingMap = new Map();
  existingItems.forEach((el) => existingMap.set(el.dataset.searchBusiness || "", el));
  const fragment = document.createDocumentFragment();
  businesses.forEach((biz) => {
    const id = String(biz.id || "");
    const existing = id ? existingMap.get(id) : null;
    if (existing) {
      existingMap.delete(id);
      fragment.appendChild(existing);
    } else {
      const tpl = document.createElement("template");
      tpl.innerHTML = renderSearchBusinessItem(biz);
      const node = tpl.content.firstElementChild;
      if (node) fragment.appendChild(node);
    }
  });
  bizList.replaceChildren(fragment);
  return true;
}

function refreshSearchView() {
  if (state.activeTab === "search" && lastRenderMode === "main") {
    if (updateSearchDom()) return true;
  }
  return false;
}

function patchSearchUserList(users) {
  const usersList = document.getElementById("searchUsersList");
  if (!usersList) return false;
  const existingItems = Array.from(usersList.querySelectorAll("[data-search-user]"));
  const currentIds = existingItems.map((el) => el.dataset.searchUser || "");
  const nextIds = users.map((user) => String(user.uid || ""));
  if (currentIds.join("|") === nextIds.join("|")) {
    users.forEach(updateSearchUserNodes);
    return true;
  }
  const existingMap = new Map();
  existingItems.forEach((el) => existingMap.set(el.dataset.searchUser || "", el));
  const fragment = document.createDocumentFragment();
  users.forEach((user) => {
    const id = String(user.uid || "");
    const existing = id ? existingMap.get(id) : null;
    if (existing) {
      existingMap.delete(id);
      fragment.appendChild(existing);
    } else {
      const tpl = document.createElement("template");
      tpl.innerHTML = renderSearchUserItem(user);
      const node = tpl.content.firstElementChild;
      if (node) fragment.appendChild(node);
    }
  });
  usersList.replaceChildren(fragment);
  users.forEach(updateSearchUserNodes);
  return true;
}

function renderUploadView() {
  const profile = state.userProfile;
  const previewUrl = getOptimizedImageUrl(state.upload.preview, "large");
  return `
    <div class="p-6 animate-in slide-in-from-bottom-10 duration-700 min-h-[70vh] flex flex-col">
      <header class="flex items-center justify-between mb-8">
        <button data-nav="feed" class="p-3 rounded-2xl bg-slate-100 text-slate-500">${icon("arrow-left", "w-4 h-4")}</button>
        <h2 class="text-xl font-black italic uppercase text-slate-900">Neuer Post</h2>
        <div class="w-10"></div>
      </header>
      <input type="file" id="uploadFileInput" class="hidden" accept="image/*" />
      ${state.upload.preview ? `
        <div class="space-y-6">
          <img src="${escapeHtml(previewUrl)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg" />
          <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
            <textarea id="uploadCaption" placeholder="Bildunterschrift..." class="w-full bg-transparent text-sm font-medium outline-none resize-none" rows="2">${escapeHtml(state.upload.caption)}</textarea>
          </div>
          <button id="uploadPostBtn" class="w-full bg-indigo-600 text-white py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30">${state.upload.status || "Posten"}</button>
          <div class="text-center text-[10px] font-bold text-slate-400">${escapeHtml(state.upload.status)}</div>
        </div>
      ` : `
        <div id="uploadFileTrigger" class="flex-1 flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed p-8 text-center cursor-pointer transition-all border-slate-200 bg-white">
          <div class="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6">${icon("upload", "w-8 h-8")}</div>
          <h3 class="text-lg font-black mb-2 italic text-slate-900">Foto waehlen</h3>
          <p class="text-sm font-medium text-slate-500">Posten als ${isLocalBusinessProfile(profile) ? "Business (Feed)" : "User (Profil)"}</p>
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

function renderHeaderActionButton(avatarUrl, avatarFit) {
  if (!authInitialized) {
    const restoringRaw = authBootstrapSnapshot?.avatar || state.userProfile.avatar || userAvatarCache || "";
    const restoringAvatar = getOptimizedImageUrl(restoringRaw, "avatar");
    if (restoringAvatar && !isPlaceholderUrl(restoringAvatar)) {
      return `
        <div aria-hidden="true" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 bg-white border border-slate-50 shadow-slate-200/30 pointer-events-none">
          <img src="${escapeHtml(restoringAvatar)}" class="w-full h-full rounded-[1.4rem] ${avatarFit}" />
        </div>
      `;
    }
    return `
      <div aria-hidden="true" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 bg-white border border-slate-50 shadow-slate-200/30 pointer-events-none">
        <div class="w-full h-full rounded-[1.4rem] bg-slate-200 animate-pulse"></div>
      </div>
    `;
  }
  if (isGuestSession()) {
    return `
      <button data-auth-open="true" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden active:scale-95 transition-transform bg-white border border-slate-50 shadow-slate-200/30 text-slate-900 flex flex-col items-center justify-center leading-none">
        ${icon("log-in", "w-4 h-4")}
        <span class="text-[8px] font-black uppercase tracking-[0.2em] mt-1">Login</span>
      </button>
    `;
  }
  return `
    <button data-nav="profile" class="w-14 h-14 rounded-3xl shadow-xl overflow-hidden p-1 active:scale-95 transition-transform bg-white border border-slate-50 shadow-slate-200/30">
      <img id="headerAvatar" data-img-key="avatar:header" src="${escapeHtml(avatarUrl)}" class="w-full h-full rounded-[1.4rem] ${avatarFit}" />
    </button>
  `;
}

function renderHeader() {
  const unread = isGuestSession() ? 0 : state.notifications.filter((n) => !n.read).length;
  const chatUnread = isGuestSession() ? 0 : getChatUnreadCount();
  const headerUnread = unread + chatUnread;
  const badge = headerUnread > 9 ? "9+" : String(headerUnread || "");
  const branding = resolveHeaderBranding();
  const avatarUrl = branding.logoUrl;
  const avatarFit = logoFitClass(branding.isBusinessLogo);
  const titleClass = "text-2xl font-black italic tracking-tighter leading-none text-slate-900 max-w-[220px] mx-auto truncate";
  const subtitleClass = `text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] block${branding.subtitle ? "" : " hidden"}`;
  if (state.activeTab === "staff" && state.staff?.view === "form") {
    return `
      <header class="app-header-safe p-6 pb-2 flex justify-between items-center relative z-40 bg-slate-50">
        <button data-staff-back="true" class="w-14 h-14 rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30">
          ${icon("arrow-left", "w-5 h-5")}
        </button>
        <div class="text-center">
          <h1 class="${titleClass}">${BRAND_UI.upper}</h1>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] block">CEO Creation</span>
        </div>
        ${renderHeaderActionButton(avatarUrl, avatarFit)}
      </header>
    `;
  }
  if (state.activeTab === "leads" && (state.leads?.view === "create" || state.leads?.view === "settings")) {
    const isSettingsView = state.leads?.view === "settings";
    return `
      <header class="app-header-safe p-6 pb-2 flex justify-between items-center relative z-40 bg-slate-50">
        <button data-leads-back="true" class="w-14 h-14 rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30">
          ${icon("arrow-left", "w-5 h-5")}
        </button>
        <div class="text-center">
          <h1 class="${titleClass}">${BRAND_UI.upper}</h1>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] block">${isSettingsView ? "Leads Settings" : "Leads Creation"}</span>
        </div>
        ${renderHeaderActionButton(avatarUrl, avatarFit)}
      </header>
    `;
  }
  if (state.activeTab === "chat" && state.chatModal.open && state.chatModal.profile) {
    const partner = state.chatModal.profile;
    const partnerAvatar = getOptimizedImageUrl(partner.avatar, "avatar");
    return `
      <header class="app-header-safe shrink-0 p-6 pb-3 flex items-center justify-between gap-3 relative z-40 bg-slate-50">
        <button data-chat-back="true" class="w-14 h-14 rounded-3xl shadow-xl flex items-center justify-center active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30">
          ${icon("arrow-left", "w-5 h-5")}
        </button>
        <div class="flex-1 min-w-0 text-center">
          <h1 class="text-lg font-black tracking-tight text-slate-900 truncate">${escapeHtml(partner.name || "User")}</h1>
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.35em] block truncate">@${escapeHtml(String(partner.handle || "user").replace(/^@/, ""))}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-12 h-12 rounded-2xl overflow-hidden p-1 bg-white border border-slate-100 shadow-sm">
            <img src="${escapeHtml(partnerAvatar)}" class="w-full h-full rounded-[1rem] object-cover" />
          </div>
        </div>
      </header>
    `;
  }
  if (state.activeTab === "chat") {
    return `
      <header class="app-header-safe shrink-0 p-6 pb-3 flex justify-between items-center relative z-40 bg-slate-50">
        <button id="drawerToggle" class="w-14 h-14 rounded-3xl shadow-xl flex flex-col gap-1.5 items-start justify-center p-4 active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30 relative">
          <div class="w-6 h-0.5 rounded-full bg-slate-900"></div>
          <div class="w-4 h-0.5 rounded-full bg-slate-900"></div>
          <div class="w-5 h-0.5 rounded-full bg-slate-900"></div>
          ${headerUnread ? `<span data-unread-badge="header" class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg">${badge}</span>` : ""}
        </button>
        <div class="text-center">
          <h1 class="text-2xl font-black italic tracking-tighter leading-none text-slate-900">CHATS</h1>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] block">DIRECT</span>
        </div>
        ${renderHeaderActionButton(avatarUrl, avatarFit)}
      </header>
    `;
  }
  return `
    <header class="app-header-safe p-6 pb-2 flex justify-between items-center relative z-40 bg-slate-50">
      <button id="drawerToggle" class="w-14 h-14 rounded-3xl shadow-xl flex flex-col gap-1.5 items-start justify-center p-4 active:scale-95 transition-all bg-white border border-slate-50 shadow-slate-200/30 relative">
        <div class="w-6 h-0.5 rounded-full bg-slate-900"></div>
        <div class="w-4 h-0.5 rounded-full bg-slate-900"></div>
        <div class="w-5 h-0.5 rounded-full bg-slate-900"></div>
        ${headerUnread ? `<span data-unread-badge="header" class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg">${badge}</span>` : ""}
      </button>
      <div class="text-center cursor-pointer" data-nav="feed">
        <h1 id="headerTitle" class="${titleClass}">${escapeHtml(branding.title)}</h1>
        <span id="headerSubtitle" class="${subtitleClass}">${escapeHtml(branding.subtitle)}</span>
      </div>
      ${renderHeaderActionButton(avatarUrl, avatarFit)}
    </header>
  `;
}

function shouldShowBusinessTopTabs() {
  if (state.activeTab !== "profile") return false;
  const profile = state.profileView?.profile || state.userProfile;
  return isRestaurantCafeProfile(profile);
}

function renderBusinessTopTabs() {
  if (!shouldShowBusinessTopTabs()) return "";
  const profile = state.profileView?.profile || state.userProfile;
  const catalogLabel = getBusinessCatalogLabel(profile);
  const isShop = isShopCatalogProfile(profile);
  const base = "flex-1 py-3 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2";
  const activeTop = state.profileTopTab || "profile";
  const isProfileActive = activeTop === "profile";
  const isMenuActive = activeTop === "menu";
  const isCartActive = activeTop === "cart";
  const cartCount = isShop ? getCartCountForRestaurant(profile?.restaurantId || "") : 0;
  const spacingClass = isProfileActive ? "pb-1" : "pb-3";
  return `
    <div class="px-6 ${spacingClass}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center gap-1 backdrop-blur-sm">
        <button type="button" data-profile-top-tab="profile" class="${base} ${isProfileActive ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
          Profil
        </button>
        <button type="button" data-profile-top-tab="menu" class="${base} ${isMenuActive ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
          ${catalogLabel}
        </button>
        ${isShop ? `
          <button type="button" data-profile-top-tab="cart" class="${base} relative ${isCartActive ? "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]" : "text-slate-400 hover:text-slate-600"}">
            ${icon("shopping-cart", "w-4 h-4")}
            ${cartCount ? `<span class="absolute top-1 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">${cartCount > 9 ? "9+" : cartCount}</span>` : ""}
          </button>
        ` : `
          <button type="button" disabled class="${base} text-slate-300 cursor-not-allowed">
            Reviews
          </button>
        `}
      </div>
    </div>
  `;
}

function renderMain() {
  let view = "";
  if (state.activeTab === "feed") view = renderFeedView();
  if (state.activeTab === "chat") view = renderChatView();
  if (state.activeTab === "search") view = renderSearchView();
  if (state.activeTab === "map") view = renderMapView();
  if (state.activeTab === "profile") view = state.profileView ? renderPublicProfileView() : renderProfileView();
  if (state.activeTab === "menu") view = renderMenuAdminView();
  if (state.activeTab === "orders") view = renderOrdersView();
  if (state.activeTab === "leads") view = renderLeadsView();
  if (state.activeTab === "staff") view = renderStaffView();
  if (state.activeTab === "customers") view = renderCustomersView();
  if (state.activeTab === "settings") view = renderSettingsView();
  if (state.activeTab === "notifications") view = renderNotificationsView();
  if (state.activeTab === "upload") view = renderUploadView();
  const isChatThreadOpen = state.activeTab === "chat" && state.chatModal.open && state.chatModal.profile;
  const mainClass = isChatThreadOpen
    ? "flex-1 min-h-0 flex flex-col overflow-hidden"
    : "flex-1 min-h-0 app-main-scroll";

  return `
    <div class="app-shell ${isChatThreadOpen ? "app-shell--chat-open" : ""} bg-slate-50 text-slate-900 max-w-md mx-auto md:shadow-2xl relative flex flex-col font-sans">
      ${renderDrawer()}
      <main class="${mainClass}">
        ${renderHeader()}
        ${renderBusinessTopTabs()}
        ${view}
      </main>
    </div>
  `;
}

function ensureOverlayRoot() {
  let root = document.getElementById("overlayRoot");
  if (!root) {
    root = document.createElement("div");
    root.id = "overlayRoot";
    document.body.appendChild(root);
  }
  if (!document.getElementById("modalUnderlay")) {
    const underlay = document.createElement("div");
    underlay.id = "modalUnderlay";
    underlay.className = "fixed inset-0 bg-white z-[50] hidden pointer-events-none";
    root.appendChild(underlay);
  }
  if (!document.getElementById("profileOverlayRoot")) {
    const profileRoot = document.createElement("div");
    profileRoot.id = "profileOverlayRoot";
    root.appendChild(profileRoot);
  }
  if (!document.getElementById("chatOverlayRoot")) {
    const chatRoot = document.createElement("div");
    chatRoot.id = "chatOverlayRoot";
    root.appendChild(chatRoot);
  }
  if (!document.getElementById("postOverlayRoot")) {
    const postRoot = document.createElement("div");
    postRoot.id = "postOverlayRoot";
    root.appendChild(postRoot);
  }
  if (!document.getElementById("likesOverlayRoot")) {
    const likesRoot = document.createElement("div");
    likesRoot.id = "likesOverlayRoot";
    root.appendChild(likesRoot);
  }
  if (!document.getElementById("menuOverlayRoot")) {
    const menuRoot = document.createElement("div");
    menuRoot.id = "menuOverlayRoot";
    root.appendChild(menuRoot);
  }
  if (!document.getElementById("menuDetailOverlayRoot")) {
    const menuDetailRoot = document.createElement("div");
    menuDetailRoot.id = "menuDetailOverlayRoot";
    root.appendChild(menuDetailRoot);
  }
  if (!document.getElementById("focusOverlayRoot")) {
    const focusRoot = document.createElement("div");
    focusRoot.id = "focusOverlayRoot";
    root.appendChild(focusRoot);
  }
  if (!document.getElementById("leadOverlayRoot")) {
    const leadRoot = document.createElement("div");
    leadRoot.id = "leadOverlayRoot";
    root.appendChild(leadRoot);
  }
  if (!document.getElementById("customerOverlayRoot")) {
    const customerRoot = document.createElement("div");
    customerRoot.id = "customerOverlayRoot";
    root.appendChild(customerRoot);
  }
  return root;
}

function ensureModalEscapeHandler() {
  if (modalEscapeBound || typeof document === "undefined") return;
  const handler = (evt) => {
    if (evt.key !== "Escape") return;
    if (closeActiveModal()) {
      evt.preventDefault();
    }
  };
  document.addEventListener("keydown", handler);
  modalEscapeBound = true;
}

function syncModalOpenUiState() {
  const anyModalOpen = isAnyModalOpen();
  const underlay = document.getElementById("modalUnderlay");
  if (underlay) underlay.classList.toggle("hidden", !anyModalOpen);
  document.documentElement.classList.toggle("modal-open", anyModalOpen);
  document.body.classList.toggle("modal-open", anyModalOpen);
  if (anyModalOpen) ensureModalEscapeHandler();
}

function renderOverlays(options = {}) {
  return renderOverlaysCore({
    options,
    state,
    documentObj: typeof document === "undefined" ? null : document,
    windowObj: typeof window === "undefined" ? null : window,
    ensureOverlayRootFn: ensureOverlayRoot,
    renderProfileModalFn: renderProfileModal,
    renderChatModalFn: renderChatModal,
    renderPostModalFn: renderPostModal,
    renderLikesModalFn: renderLikesModal,
    renderMenuItemModalFn: renderMenuItemModal,
    renderMenuDetailModalFn: renderMenuDetailModal,
    renderFocusModalFn: renderFocusModal,
    renderLeadModalFn: renderLeadModal,
    renderCustomerModalFn: renderCustomerModal,
    overlayCache,
    syncModalOpenUiStateFn: syncModalOpenUiState,
    bindOverlayEventsFn: bindOverlayEvents
  });
}

function bindImageFallbacks(root = document) {
  if (!root) return;
  root.querySelectorAll("img[data-fallback-src]").forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.fallbackBound === "true") return;
    img.dataset.fallbackBound = "true";
    img.addEventListener("error", () => {
      const fallback = img.dataset.fallbackSrc || "";
      const current = img.getAttribute("src") || "";
      if (fallback && current !== fallback) {
        img.setAttribute("src", fallback);
        return;
      }
      if (current !== PLACEHOLDER_IMAGE) {
        img.setAttribute("src", PLACEHOLDER_IMAGE);
      }
    });
  });
}

function render() {
  if (renderSuspended > 0) {
    renderQueued = true;
    return;
  }
  const chatInputFocusState = captureChatInputFocusState();
  document.body.classList.toggle("fast-mode", FAST_MODE);
  let nextHtml = "";
  let mode = "";
  const showGuestAuth = !state.user && !!state.auth.open;
  if (showGuestAuth) {
    nextHtml = renderAuthScreen();
    mode = "auth";
  } else {
    state.activeTab = sanitizeTabForSession(state.activeTab, { hasProfileView: !!state.profileView });
    nextHtml = renderMain();
    mode = "main";
  }
  const changed = nextHtml !== lastAppHtml || mode !== lastRenderMode;
  if (changed) {
    const isChatThreadOpen = mode === "main"
      && state.activeTab === "chat"
      && !!state.chatModal.open
      && !!state.chatModal.profile;
    const preserveMainScroll = mode === "main"
      && lastRenderMode === "main"
      && state.activeTab === lastRenderedMainTab
      && !isChatThreadOpen;
    const reuseFeed = preserveMainScroll && state.activeTab === "feed"
      ? document.getElementById("feedView")
      : null;
    const prevScrollTop = preserveMainScroll ? document.querySelector("main")?.scrollTop ?? 0 : 0;
    appEl.innerHTML = nextHtml;
    appEl.removeAttribute("aria-busy");
    lastAppHtml = nextHtml;
    lastRenderMode = mode;
    if (mode === "auth") {
      bindAuthEvents();
    } else if (mode === "main") {
      bindAppEvents();
      bindFeedDelegation();
    }
    if (reuseFeed) {
      const nextFeed = document.getElementById("feedView");
      if (nextFeed && reuseFeed !== nextFeed) {
        nextFeed.replaceWith(reuseFeed);
      }
      const nextMain = document.querySelector("main");
      if (nextMain) nextMain.scrollTop = prevScrollTop;
      updateFeedDom();
    } else if (preserveMainScroll) {
      const nextMain = document.querySelector("main");
      if (nextMain) nextMain.scrollTop = prevScrollTop;
    }
    if (window.lucide?.createIcons) window.lucide.createIcons();
    if (state.activeTab === "search" && state.search.keepFocus) {
      state.search.keepFocus = false;
      focusSearchInput();
    }
    if (state.activeTab === "leads" && state.leads.keepFocus) {
      state.leads.keepFocus = false;
      focusInputById("leadsSearchInput");
    }
    if (state.activeTab === "customers" && state.customers.keepFocus) {
      state.customers.keepFocus = false;
      focusInputById("customersSearchInput");
    }
    restoreChatInputFocusState(chatInputFocusState);
    if (mode === "main") lastRenderedMainTab = state.activeTab;
    else lastRenderedMainTab = "";
  }

  renderOverlays();
  if (mode === "main" || lastRenderMode === "main") {
    updateNotificationBadges();
  }
  updateFocusRotation();

  if (mode === "main" && state.activeTab === "map") {
    window.setTimeout(() => {
      initLeafletIfNeeded();
      updateMapSheet();
    }, 0);
  } else {
    cleanupLeaflet();
  }
}

function bindAuthEvents() {
  const authForm = document.getElementById("authForm");
  const toggleBtn = document.getElementById("authToggle");
  const authCloseBtn = document.getElementById("authCloseBtn");
  if (authCloseBtn) {
    authCloseBtn.addEventListener("click", () => {
      state.auth.open = false;
      state.auth.error = "";
      render();
    });
  }
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      state.auth.mode = state.auth.mode === "login" ? "register" : "login";
      state.auth.error = "";
      state.auth.role = "user";
      render();
    });
  }

  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("authEmail")?.value?.trim() || "";
      const password = document.getElementById("authPassword")?.value || "";
      const name = document.getElementById("authName")?.value?.trim() || "";

      state.auth.loading = true;
      state.auth.error = "";
      render();

      try {
        await ensureAuthLocalPersistence();
        if (state.auth.mode === "login") {
          const admin = resolveAdminLogin(email, password);
          const cred = admin ? await signInOrCreateAdmin(admin) : await signInWithEmailAndPassword(auth, email, password);
          if (admin) {
            await ensureUserProfile(cred.user, admin?.profile || {});
          }
        } else {
          if (!name || !email || !password) {
            throw new Error("Bitte alles ausfuellen.");
          }
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: name });
          await setDoc(doc(db, "users", cred.user.uid), {
            displayName: name,
            handle: normalizeHandle(name),
            city: "Prishtina",
            email,
            role: "user",
            bio: "",
            score: 0,
            followersCount: 0,
            followingCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      } catch (err) {
        state.auth.error = err?.message || "Login fehlgeschlagen.";
      } finally {
        state.auth.loading = false;
        render();
      }
    });
  }
}

function bindModalDismiss(target, handler, { selfOnly = false } = {}) {
  if (!target || typeof handler !== "function") return;
  const onDismiss = (evt) => {
    if (selfOnly && evt.target !== target) return;
    if (evt.type === "touchstart") evt.preventDefault();
    handler();
  };
  target.addEventListener("click", onDismiss);
  target.addEventListener("pointerdown", onDismiss);
  target.addEventListener("touchstart", onDismiss, { passive: false });
}

function bindOverlayEvents({
  profileChanged = true,
  chatChanged = true,
  postChanged = true,
  likesChanged = true,
  menuChanged = true,
  menuDetailChanged = true,
  focusChanged = true,
  leadChanged = true,
  customerChanged = true
} = {}) {
  return bindOverlayEventsCore({
    profileChanged,
    chatChanged,
    postChanged,
    likesChanged,
    menuChanged,
    menuDetailChanged,
    focusChanged,
    leadChanged,
    customerChanged,
    documentObj: typeof document === "undefined" ? null : document,
    windowObj: typeof window === "undefined" ? null : window,
    isMenuDetailCloseBoundFn: () => menuDetailCloseBound,
    setMenuDetailCloseBoundFn: (next) => {
      menuDetailCloseBound = !!next;
    },
    state,
    bindProfileOverlayEventsFn: bindProfileOverlayEventsCore,
    bindChatOverlayEventsFn: bindChatOverlayEventsCore,
    bindPostOverlayEventsFn: bindPostOverlayEventsCore,
    bindLikesOverlayEventsFn: bindLikesOverlayEventsCore,
    bindMenuOverlayEventsFn: bindMenuOverlayEventsCore,
    bindMenuDetailOverlayEventsFn: bindMenuDetailOverlayEventsCore,
    bindFocusOverlayEventsFn: bindFocusOverlayEventsCore,
    bindLeadOverlayEventsFn: bindLeadOverlayEventsCore,
    bindCustomerOverlayEventsFn: bindCustomerOverlayEventsCore,
    bindModalDismissFn: bindModalDismiss,
    closeMenuDetailFn: closeMenuDetail,
    closeProfileModalFn: closeProfileModal,
    openChatWithProfileFn: openChatWithProfile,
    toggleFollowFn: toggleFollow,
    renderFn: render,
    closeChatModalFn: closeChatModal,
    sendChatMessageFn: sendChatMessage,
    scrollChatMessagesToBottomFn: scrollChatMessagesToBottom,
    queueMicrotaskFn: (fn) => queueMicrotask(fn),
    closePostModalFn: closePostModal,
    togglePostLikeFn: togglePostLike,
    renderOverlaysFn: renderOverlays,
    loadPostLikesForModalFn: loadPostLikesForModal,
    addCommentFn: addComment,
    toggleCommentLikeFn: toggleCommentLike,
    closeLikesModalFn: closeLikesModal,
    closeMenuModalFn: closeMenuModal,
    saveMenuItemFromModalFn: saveMenuItemFromModal,
    syncMenuModalCropPreviewFn: syncMenuModalCropPreview,
    clampCropPercentFn: clampCropPercent,
    getMenuDetailCatalogProfileFn: getMenuDetailCatalogProfile,
    canAddToShopCartFn: canAddToShopCart,
    addMenuItemToShopCartFn: addMenuItemToShopCart,
    showPublicProfileFn: showPublicProfile,
    setStateFn: setState,
    openGuestAuthPromptFn: openGuestAuthPrompt,
    toggleMenuItemLikeFn: toggleMenuItemLike,
    setMenuDetailVariantFn: setMenuDetailVariant,
    autosizeTextareaFn: autosizeTextarea,
    addMenuItemCommentFn: addMenuItemComment,
    applyCommentAvatarCacheFn: applyCommentAvatarCache,
    setMenuDetailIndexFn: setMenuDetailIndex,
    closeFocusModalFn: closeFocusModal,
    saveFocusItemFromModalFn: saveFocusItemFromModal,
    syncFocusModalCropPreviewFn: syncFocusModalCropPreview,
    closeLeadModalFn: closeLeadModal,
    saveLeadFromModalFn: saveLeadFromModal,
    convertLeadToCustomerFn: convertLeadToCustomer,
    addLeadModalLocationRowFn: addLeadModalLocationRow,
    removeLeadModalLocationRowFn: removeLeadModalLocationRow,
    syncLeadModalDraftFromFormFn: syncLeadModalDraftFromForm,
    openLocationPickerFn: openLocationPicker,
    normalizeLeadLocationsFn: normalizeLeadLocations,
    createLeadLocationFn: createLeadLocation,
    parseCoordsFromAddressInputFn: parseCoordsFromAddressInput,
    getLeadPlusCodeReferenceFn: getLeadPlusCodeReference,
    hasLeadLocationCoordsFn: hasLeadLocationCoords,
    getPrimaryLeadLocationFn: getPrimaryLeadLocation,
    refineLeadLocationAddressIndexFn: refineLeadLocationAddressIndex,
    closeCustomerModalFn: closeCustomerModal,
    saveCustomerFromModalFn: saveCustomerFromModal,
    bindImageFallbacksFn: bindImageFallbacks,
    placeholderImage: PLACEHOLDER_IMAGE
  });
}

function stopCrmAutoLoadObserver() {
  if (crmAutoLoadObserver) {
    try { crmAutoLoadObserver.disconnect(); } catch {}
    crmAutoLoadObserver = null;
  }
}

function bindCrmAutoLoadObserver() {
  stopCrmAutoLoadObserver();
  if (typeof IntersectionObserver !== "function") return;
  const sentinels = [
    document.getElementById("leadsLoadMoreSentinel"),
    document.getElementById("customersLoadMoreSentinel"),
    document.getElementById("staffLoadMoreSentinel")
  ].filter(Boolean);
  if (!sentinels.length) return;
  crmAutoLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry?.isIntersecting) return;
      const node = entry.target;
      if (!(node instanceof HTMLElement)) return;
      if (node.id === "leadsLoadMoreSentinel") {
        if (!state.leads.loadingMore && !state.leads.loading && state.leads.hasMore?.[normalizeLeadScopeKey(state.leads.scope)]) {
          void loadLeads({ scope: state.leads.scope, grow: true });
        }
        return;
      }
      if (node.id === "customersLoadMoreSentinel") {
        if (!state.customers.loadingMore && !state.customers.loading && state.customers.hasMore?.[normalizeCustomerScopeKey(state.customers.scope)]) {
          void loadCustomers({ scope: state.customers.scope, grow: true });
        }
        return;
      }
      if (node.id === "staffLoadMoreSentinel") {
        if (!state.staff.loadingMore && !state.staff.loading && state.staff.hasMore) {
          void loadCeoStaff({ grow: true });
        }
      }
    });
  }, {
    root: null,
    rootMargin: "0px 0px 240px 0px",
    threshold: 0.05
  });
  sentinels.forEach((node) => crmAutoLoadObserver.observe(node));
}

function bindAppEvents() {
  return bindAppEventsMainCore({
    documentObj: typeof document === "undefined" ? null : document,
    state,
    bindAppShellEventsCoreFn: bindAppShellEventsCore,
    setStateFn: setState,
    signOutFn: signOut,
    auth,
    clearAuthBootstrapSnapshotFn: clearAuthBootstrapSnapshot,
    safeStorageObj: safeStorage,
    profileKeyFn: profileKey,
    avatarKeyFn: avatarKey,
    notificationsKeyFn: notificationsKey,
    pushSeenKeyFn: pushSeenKey,
    pushTokenMetaKeyFn: pushTokenMetaKey,
    followingKeyFn: followingKey,
    chatIndexKeyFn: chatIndexKey,
    storageKeys: STORAGE_KEYS,
    resetUserScopedStateFn: resetUserScopedState,
    cleanupLeafletFn: cleanupLeaflet,
    openGuestAuthPromptFn: openGuestAuthPrompt,
    normalizeAuthModeFn: normalizeAuthMode,
    renderFn: render,
    ensureMenuDataForProfileFn: ensureMenuDataForProfile,
    ensureFocusDataForProfileFn: ensureFocusDataForProfile,
    bindAppMenuFocusEventsCoreFn: bindAppMenuFocusEventsCore,
    saveMenuLayoutToStorageFn: saveMenuLayoutToStorage,
    openMenuModalFn: openMenuModal,
    deleteMenuItemByIdFn: deleteMenuItemById,
    triggerMenuDetailOpenFromGestureFn: triggerMenuDetailOpenFromGesture,
    updateShopCartQuantityFn: updateShopCartQuantity,
    openShopCheckoutFn: openShopCheckout,
    submitShopCheckoutFn: submitShopCheckout,
    updateShopCheckoutFieldFn: updateShopCheckoutField,
    focusCache,
    focusCacheKeyFn: focusCacheKey,
    saveFocusEnabledFn: saveFocusEnabled,
    openFocusModalFn: openFocusModal,
    deleteFocusItemByIdFn: deleteFocusItemById,
    setFocusIndexFn: setFocusIndex,
    toggleProfilePostMenuFn: toggleProfilePostMenu,
    toggleProfilePostWidthFn: toggleProfilePostWidth,
    deleteProfilePostFn: deleteProfilePost,
    setProfileMenuOpenFn: setProfileMenuOpen,
    profileMenuBound,
    setProfileMenuBoundFn: (next) => {
      profileMenuBound = !!next;
    },
    mapLocateFn: mapLocate,
    bindNotificationsDelegationFn: bindNotificationsDelegation,
    bindAppSettingsProfileEventsCoreFn: bindAppSettingsProfileEventsCore,
    iconFn: icon,
    saveAccountSettingsFn: saveAccountSettings,
    openLocationPickerFn: openLocationPicker,
    clearVerifiedMapLocationFn: () => {
      verifiedMapLocation = null;
    },
    syncNotificationsPushRuntimeFn: syncNotificationsPushRuntime,
    saveSettingsFn: saveSettings,
    disablePushDeviceRegistrationFn: disablePushDeviceRegistration,
    getPushActivationIssueMessageFn: getPushActivationIssueMessage,
    saveUserProfileToStorageFn: saveUserProfileToStorage,
    persistPrivateAccountSettingFn: persistPrivateAccountSetting,
    uploadAvatarFn: uploadAvatar,
    openProfileViewFromBusinessFn: openProfileViewFromBusiness,
    findPostByIdFn: findPostById,
    openPostModalFn: openPostModal,
    getProfileViewUnsubFn: () => profileViewUnsub,
    setProfileViewUnsubFn: (next) => {
      profileViewUnsub = next;
    },
    toggleFollowFn: toggleFollow,
    alertFn: (msg) => alert(msg),
    bindAppChatUploadEventsCoreFn: bindAppChatUploadEventsCore,
    openChatWithProfileFn: openChatWithProfile,
    deleteChatThreadByIdFn: deleteChatThreadById,
    setChatThreadArchivedByIdFn: setChatThreadArchivedById,
    closeChatModalFn: closeChatModal,
    toggleChatMessageSavedFn: toggleChatMessageSaved,
    toggleChatMessageLikedFn: toggleChatMessageLiked,
    removePendingChatAttachmentFn: removePendingChatAttachment,
    addChatAttachmentsFn: addChatAttachments,
    sendChatMessageFn: sendChatMessage,
    scrollChatMessagesToBottomFn: scrollChatMessagesToBottom,
    queueMicrotaskFn: (fn) => queueMicrotask(fn),
    handleUploadPostFn: handleUploadPost,
    bindCrmStaffEventsCoreFn: bindCrmStaffEventsCore,
    openLeadCreatorFn: openLeadCreator,
    openLeadSettingsViewFn: openLeadSettingsView,
    closeLeadSubviewFn: closeLeadSubview,
    saveLeadSettingsFn: saveLeadSettings,
    isLeadInlineCreateViewFn: isLeadInlineCreateView,
    bindLeadInlineCreateEventsCoreFn: bindLeadInlineCreateEventsCore,
    deleteLeadFromModalFn: deleteLeadFromModal,
    saveLeadFromModalFn: saveLeadFromModal,
    syncLeadDerivedFieldsFn: syncLeadDerivedFields,
    addLeadModalLocationRowFn: addLeadModalLocationRow,
    removeLeadModalLocationRowFn: removeLeadModalLocationRow,
    syncLeadModalDraftFromFormFn: syncLeadModalDraftFromForm,
    normalizeLeadLocationsFn: normalizeLeadLocations,
    createLeadLocationFn: createLeadLocation,
    parseCoordsFromAddressInputFn: parseCoordsFromAddressInput,
    getLeadPlusCodeReferenceFn: getLeadPlusCodeReference,
    hasLeadLocationCoordsFn: hasLeadLocationCoords,
    getPrimaryLeadLocationFn: getPrimaryLeadLocation,
    hydrateLeadGeoFieldsFromCoordsFn: hydrateLeadGeoFieldsFromCoords,
    refineLeadLocationAddressIndexFn: refineLeadLocationAddressIndex,
    normalizeLeadScopeKeyFn: normalizeLeadScopeKey,
    loadLeadsFn: loadLeads,
    openLeadModalFn: openLeadModal,
    normalizeCustomerScopeKeyFn: normalizeCustomerScopeKey,
    loadCustomersFn: loadCustomers,
    openCustomerModalFn: openCustomerModal,
    closeStaffEditorFn: closeStaffEditor,
    openStaffEditorFn: openStaffEditor,
    syncStaffDerivedEmailFieldFn: syncStaffDerivedEmailField,
    normalizeCeoCountryFn: normalizeCeoCountry,
    syncStaffFormFromDomFn: syncStaffFormFromDom,
    saveCeoStaffFromViewFn: saveCeoStaffFromView,
    deleteCeoStaffFromViewFn: deleteCeoStaffFromView,
    bindImageFallbacksFn: bindImageFallbacks,
    bindCrmAutoLoadObserverFn: bindCrmAutoLoadObserver,
    bindSearchEventsFn: bindSearchEvents
  });
}

function bindSearchEvents() {
  const searchView = document.getElementById("searchView");
  if (!searchView || searchView.dataset.bound === "true") return;

  searchView.addEventListener("input", (e) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.id === "searchInput") {
      handleSearchInput(target.value);
    }
  });

  searchView.addEventListener("keydown", (e) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.id === "searchInput" && e.key === "Enter") {
      e.preventDefault();
    }
  });

  searchView.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const clearBtn = target.closest("#searchClearBtn");
    if (clearBtn) {
      state.search.query = "";
      state.search.userResults = [];
      state.search.businessResults = buildLocalBusinessResults("");
      state.search.loading = false;
      state.search.error = "";
      state.search.keepFocus = true;
      if (!refreshSearchView()) render();
      focusSearchInput();
      return;
    }

    const filterBtn = target.closest("[data-search-filter]");
    if (filterBtn) {
      const requested = filterBtn.dataset.searchFilter || "all";
      const filter = isGuestSession() && (requested === "all" || requested === "users")
        ? "business"
        : requested;
      state.search.filter = filter;
      if (!refreshSearchView()) render();
      return;
    }

    const userBtn = target.closest("[data-search-user]");
    if (userBtn) {
      if (isGuestSession()) {
        openGuestAuthPrompt("Bitte einloggen, um User-Profile zu sehen.");
        return;
      }
      openProfileFromUser({
        uid: userBtn.dataset.searchUser || "",
        handle: userBtn.dataset.searchHandle || "",
        name: userBtn.dataset.searchName || "",
        avatar: userBtn.dataset.searchAvatar || "",
        location: userBtn.dataset.searchLocation || ""
      });
      return;
    }

    const bizBtn = target.closest("[data-search-business]");
    if (bizBtn) {
      openProfileViewFromBusiness({
        id: bizBtn.dataset.searchBusiness || "",
        name: bizBtn.dataset.searchName || ""
      }, { showBack: false });
    }
  });

  searchView.dataset.bound = "true";
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
  if (document.getElementById("locationPickerModal")) return;
  const modal = document.createElement("div");
  modal.id = "locationPickerModal";
  modal.className = "fixed inset-0 z-[3000] hidden flex flex-col fullscreen-safe-pad";
  modal.innerHTML = `
    <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity duration-300 opacity-0" id="pickerOverlay"></div>
    <div class="bg-white rounded-[2.5rem] flex-1 flex flex-col overflow-hidden relative shadow-2xl transition-transform duration-300 translate-y-full" id="pickerPanel">
      <div class="p-5 flex justify-between items-center bg-white z-20 shadow-sm">
        <div>
          <h3 class="font-black text-lg leading-none">Standort anpassen</h3>
          <p class="text-[10px] font-bold text-slate-400 mt-1">Verschiebe die Karte unter den Pin</p>
        </div>
        <button id="closeLocationPickerBtn" type="button" class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">${icon("x", "w-5 h-5")}</button>
      </div>
      <div class="flex-1 relative bg-slate-200">
        <div id="pickerMap" class="absolute inset-0 z-10"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-30 pointer-events-none drop-shadow-2xl">
          <div class="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-bounce">
            ${icon("map-pin", "w-5 h-5 text-white fill-indigo-600")}
          </div>
          <div class="w-1 h-4 bg-slate-800 mx-auto -mt-1 rounded-full shadow-lg"></div>
        </div>
      </div>
      <div class="p-5 bg-white z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <button id="confirmLocationBtn" type="button" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
          ${icon("check", "w-4 h-4")} Hier bestaetigen
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function bindLocationPickerEvents() {
  const modal = document.getElementById("locationPickerModal");
  if (!modal || modal.dataset.bound === "true") return;
  const overlay = document.getElementById("pickerOverlay");
  const closeBtn = document.getElementById("closeLocationPickerBtn");
  const confirmBtn = document.getElementById("confirmLocationBtn");
  if (overlay) overlay.addEventListener("click", closeLocationPicker);
  if (closeBtn) closeBtn.addEventListener("click", closeLocationPicker);
  if (confirmBtn) confirmBtn.addEventListener("click", confirmLocation);
  modal.dataset.bound = "true";
}

async function openLocationPicker({ addressInputId = "settingsAddress", coordsDisplayId = "coordsDisplay", context = "settings" } = {}) {
  ensureLocationPickerModal();
  bindLocationPickerEvents();
  locationPickerTarget = { addressInputId, coordsDisplayId, context };
  const address = document.getElementById(addressInputId)?.value?.trim() || "";
  const pickerContext = String(context || "");
  const isLeadPickerContext = pickerContext === "lead" || pickerContext.startsWith("lead_location:");
  const isStaffPickerContext = pickerContext === "staff";
  if (isLeadPickerContext && isCeoUser()) {
    const tasks = [];
    if (!state.leads.loading && (!Array.isArray(state.leads.items) || !state.leads.items.length)) {
      tasks.push(loadLeads().catch(() => {}));
    }
    if (!state.customers.loading && (!Array.isArray(state.customers.items) || !state.customers.items.length)) {
      tasks.push(loadCustomers().catch(() => {}));
    }
    if (tasks.length) await Promise.all(tasks);
    if (Array.isArray(state.restaurants) && state.restaurants.length) {
      rebuildBusinessLocations();
      refreshCustomersFromRestaurants();
    }
  }
  let targetCoords = null;
  const resolveLeadRestaurantFallback = () => {
    const restId = String(state.leadModal?.lead?.restaurantId || "");
    if (!restId) return null;
    const biz = (Array.isArray(state.businessLocations) ? state.businessLocations : [])
      .find((item) => String(item?.id || "") === restId);
    if (!biz) return null;
    return normalizeCoordPair(biz.lat, biz.lng);
  };
  if (isLeadPickerContext) {
    const restFallback = resolveLeadRestaurantFallback();
    if (pickerContext === "lead") {
      const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
      const primary = getPrimaryLeadLocation(list);
      const direct = resolveCoordsFromEntity(primary) || resolveCoordsFromEntity(state.leadModal.coords || {}) || null;
      targetCoords = preferStableCoords(direct, restFallback);
    } else if (pickerContext.startsWith("lead_location:")) {
      const index = Number(pickerContext.split(":")[1]);
      const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
      const row = Number.isInteger(index) && index >= 0 ? list[index] : null;
      const addressValue = String(row?.address || document.getElementById(addressInputId)?.value || "").trim();
      targetCoords = await parseCoordsFromAddressInputAsync(addressValue, getLeadPlusCodeReference(addressValue));
      if (!targetCoords) {
        targetCoords = resolveCoordsFromEntity(row) || null;
      }
      if (!targetCoords) {
        const primary = getPrimaryLeadLocation(list);
        targetCoords = resolveCoordsFromEntity(primary) || resolveCoordsFromEntity(state.leadModal.coords || {}) || null;
      }
      targetCoords = preferStableCoords(targetCoords, restFallback);
    }
  } else if (isStaffPickerContext) {
    const staffCoords = state.staff.form?.coords;
    if (staffCoords && Number.isFinite(Number(staffCoords.lat)) && Number.isFinite(Number(staffCoords.lng))) {
      targetCoords = { lat: Number(staffCoords.lat), lng: Number(staffCoords.lng) };
    }
  } else if (pickerContext === "settings") {
    if (verifiedMapLocation && Number.isFinite(Number(verifiedMapLocation.lat)) && Number.isFinite(Number(verifiedMapLocation.lng))) {
      targetCoords = { lat: Number(verifiedMapLocation.lat), lng: Number(verifiedMapLocation.lng) };
    } else {
      const override = getCeoGpsOverride();
      if (override) {
        targetCoords = override;
      } else if (Number.isFinite(Number(state.userProfile?.lat)) && Number.isFinite(Number(state.userProfile?.lng))) {
        targetCoords = { lat: Number(state.userProfile.lat), lng: Number(state.userProfile.lng) };
      }
    }
  }

  if (!window.L) {
    const leafletReady = await ensureLeafletLoaded();
    if (!leafletReady || !window.L) {
      alert("Karte konnte nicht geladen werden. Bitte Verbindung pruefen.");
      return;
    }
  }

  const modal = document.getElementById("locationPickerModal");
  const overlay = document.getElementById("pickerOverlay");
  const panel = document.getElementById("pickerPanel");

  if (modal) modal.classList.remove("hidden");
  setTimeout(() => {
    overlay?.classList.remove("opacity-0");
    panel?.classList.remove("translate-y-full");
  }, 10);

  if (locationPickerMap && !document.getElementById("pickerMap")?.hasChildNodes()) {
    locationPickerMap.remove();
    locationPickerMap = null;
  }

  if (!locationPickerMap && window.L) {
    locationPickerMap = window.L.map("pickerMap", { zoomControl: false, attributionControl: false }).setView([PRISHTINA_COORDS.lat, PRISHTINA_COORDS.lng], 16);
    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(locationPickerMap);
  }
  renderLocationPickerContextMarkers();

  if (locationPickerMap) {
    setTimeout(() => locationPickerMap.invalidateSize(), 300);
    if (targetCoords && Number.isFinite(Number(targetCoords.lat)) && Number.isFinite(Number(targetCoords.lng))) {
      locationPickerMap.setView([targetCoords.lat, targetCoords.lng], 17, { animate: false });
    } else if (isLeadPickerContext) {
      const center = getLeadCountryCenter(getLeadFormCountryValue());
      locationPickerMap.setView([center.lat, center.lng], 16, { animate: false });
    } else if (address) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        const data = await res.json();
        if (data.length > 0) locationPickerMap.setView([data[0].lat, data[0].lon], 17, { animate: false });
      } catch {}
    }
  }
}

function closeLocationPicker() {
  const modal = document.getElementById('locationPickerModal');
  document.getElementById('pickerOverlay')?.classList.add('opacity-0');
  document.getElementById('pickerPanel')?.classList.add('translate-y-full');
  setTimeout(() => {
    modal?.classList.add('hidden');
  }, 300);
}

async function confirmLocation() {
  if (!locationPickerMap) return;
  const center = locationPickerMap.getCenter();
  const coords = { lat: center.lat, lng: center.lng };
  const context = String(locationPickerTarget.context || "");
  if (context === "lead") {
    state.leadModal.coords = coords;
  } else if (context.startsWith("lead_location:")) {
    const index = Number(context.split(":")[1]);
    if (Number.isInteger(index) && index >= 0) {
      const list = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
      while (list.length <= index) list.push(createLeadLocation());
      const addressInput = document.getElementById(locationPickerTarget.addressInputId || "");
      const address = addressInput ? String(addressInput.value || "").trim() : list[index].address || "";
      list[index] = createLeadLocation({ address, lat: coords.lat, lng: coords.lng });
      state.leadModal.locations = list;
      state.leadModal.lead = { ...(state.leadModal.lead || {}), address: list[0]?.address || "" };
      const primary = getPrimaryLeadLocation(list);
      state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
      if (index === 0) {
        await hydrateLeadGeoFieldsFromCoords(coords, { sourceInputId: locationPickerTarget.addressInputId || "" });
      }
    }
  } else if (context === "staff") {
    const addressInput = document.getElementById(locationPickerTarget.addressInputId || "");
    const locationLabel = addressInput ? String(addressInput.value || "").trim() : "";
    state.staff = {
      ...state.staff,
      form: {
        ...state.staff.form,
        locationLabel: locationLabel || state.staff.form.locationLabel || state.staff.form.country || CEO_COUNTRIES[0],
        coords
      }
    };
  } else {
    verifiedMapLocation = coords;
  }
  if (context === "staff") {
    closeLocationPicker();
    render();
    return;
  }
  const badge = document.getElementById(locationPickerTarget.coordsDisplayId || "coordsDisplay");
  badge?.classList.remove("hidden");
  closeLocationPicker();
  if (isLeadInlineCreateView()) {
    render();
  }
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
  const isBusiness = isLocalBusinessProfile(state.userProfile);
  const restaurantId = state.userProfile.restaurantId || document.getElementById("uploadRestaurantSelect")?.value || "";

  if (isBusiness && !restaurantId) {
    state.upload.status = "Bitte Business im Account waehlen.";
    render();
    return;
  }

  try {
    state.upload.status = "Upload startet.";
    render();

    const ownerId = isBusiness ? restaurantId : state.user.uid;
    const { cdnUrl } = await uploadCompressedImage(state.upload.file, ownerId, {maxSize: 1080, quality: 0.78, mimeType: 'image/jpeg'});

    if (isBusiness) {
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

    state.upload = { preview: "", caption: "", file: null, status: "" };
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
    if (state.activeTab === "feed") return normalized;
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
    if (state.activeTab === "feed") return;
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
  const cached = readCache(CACHE_KEYS.restaurants, CACHE_TTL_MS.restaurants);
  if (cached?.data?.length) {
    if (!state.restaurants.length) {
      state.restaurants = await enrichRestaurantsWithPublicMeta(cached.data);
      rebuildBusinessLocations();
      if (lastRenderMode === "main") updateShellDom();
      syncFeedPostLogos();
      refreshFeedStories({ force: true });
      cleanupLeaflet();
      const inMain = lastRenderMode === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
      const updatedSearch = state.activeTab === "search" && inMain && refreshSearchView();
      if (!updatedFeed && !updatedSearch) {
        if (!inMain) {
          render();
        } else if (state.activeTab === "map") {
          render();
        } else if (state.activeTab === "feed" || state.activeTab === "search") {
          render();
        }
      }
    }
    if (cached.fresh && !force) return;
  }
  try {
    const snap = await getDocs(query(collection(db, "restaurants")));
    const rawList = [];
    snap.forEach((docSnap) => rawList.push({ id: docSnap.id, ...docSnap.data() }));
    const list = await enrichRestaurantsWithPublicMeta(rawList);
    writeCache(CACHE_KEYS.restaurants, list);
    state.restaurants = list;
    rebuildBusinessLocations();
    if (lastRenderMode === "main") updateShellDom();
    syncFeedPostLogos();
    refreshFeedStories({ force: true });
    cleanupLeaflet();
    const inMain = lastRenderMode === "main";
    const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
    const updatedSearch = state.activeTab === "search" && inMain && refreshSearchView();
    if (!updatedFeed && !updatedSearch) {
      if (!inMain) {
        render();
      } else if (state.activeTab === "map") {
        render();
      } else if (state.activeTab === "feed" || state.activeTab === "search") {
        render();
      }
    }
  } catch (err) {
    console.error(err);
  }
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
    const rid = post.restaurantId || post.ownerId || "";
    if (!rid || map.has(rid) || !canShowFeedRestaurantId(rid)) return;
    const rest = state.restaurants.find(r => r.id === rid) || {};
    const logo = rest.logoUrl || rest.logo || post.logo || "";
    map.set(rid, {
      restaurantId: rid,
      name: post.business || post.restaurantName || "Business",
      img: logo,
      isLive: false
    });
  });
  return Array.from(map.values()).slice(0, FAST_LIMITS.stories);
}

function buildStoriesRowSignature(items) {
  return (items || [])
    .map((item) => item.restaurantId || "")
    .join(";");
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
  const cached = readCache(CACHE_KEYS.feed, CACHE_TTL_MS.feed);
  if (cached?.data?.length) {
    const wasEmpty = !state.feedPosts.length;
    if (wasEmpty) {
      state.feedPosts = cached.data;
    }
    syncFeedPostLogos();
    const storiesUpdated = refreshFeedStories({ force: wasEmpty });
    if (wasEmpty || storiesUpdated) {
      const inMain = lastRenderMode === "main";
      const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
      if (updatedFeed) return;
      if (!inMain) {
        render();
        return;
      }
      if (state.activeTab === "feed") {
        render();
      }
    }
    preloadFeedHeroImages(state.feedPosts);
    if (cached.fresh && !force) return;
  }

  try {
    const ref = collection(db, "socialFeed");
    let snap = null;
    try {
      snap = await getDocs(query(ref, where("status", "==", "active"), orderBy("createdAt", "desc"), limit(FAST_LIMITS.feed)));
    } catch (err) {
      snap = await getDocs(query(ref, limit(FAST_LIMITS.feedFallback)));
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    const hydrationIds = collectFeedHydrationIds(rows, { max: 8 });
    if (hydrationIds.length) {
      await hydrateRestaurantsByIds(hydrationIds, { max: hydrationIds.length });
    }
    const next = rows
      .filter((row) => (row.status || "active") === "active")
      .map(normalizeFeedPost)
      .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
    const cachedFeed = readCache(CACHE_KEYS.feed);
    saveFeedPosts(next, { lastDeltaCheck: cachedFeed?.meta?.lastDeltaCheck || 0 });

    const prevIds = state.feedPosts.map((item) => String(item.id)).join("|");
    const nextIds = next.map((item) => String(item.id)).join("|");
    state.feedPosts = next;
    const storiesChanged = refreshFeedStories({ posts: next });
    preloadFeedHeroImages(next);
    if (prevIds === nextIds && !storiesChanged) return;
    const inMain = lastRenderMode === "main";
    const updatedFeed = state.activeTab === "feed" && inMain && updateFeedDom();
    if (updatedFeed) return;
    const updatedSearch = state.activeTab === "search" && inMain && refreshSearchView();
    if (updatedSearch) return;
    if (!inMain) {
      render();
      return;
    }
    if (state.activeTab === "feed" || state.activeTab === "search") {
      render();
    }
  } catch (err) {
    console.error(err);
  }
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
  if (!state.user) return;
  const cached = readCache(userPostsKey(state.user.uid), CACHE_TTL_MS.posts);
  if (cached?.data?.length) {
    if (!state.userPosts.length) {
      state.userPosts = cached.data.map((post) => ({
        ...post,
        ownerType: post.ownerType || "user",
        ownerId: post.ownerId || state.user.uid
      }));
      render();
    }
    if (cached.fresh && !force) return;
  }
  try {
    const ref = collection(db, "users", state.user.uid, "posts");
    let snap = null;
    try {
      snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(FAST_LIMITS.userPosts)));
    } catch (err) {
      snap = await getDocs(ref);
    }
    const rows = [];
    snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...docSnap.data() }));
    const next = rows.map((row) => ({
      id: row.id,
      url: row.url,
      type: row.type || "square",
      title: row.title || "",
      caption: row.caption || "",
      createdAt: row.createdAt,
      likes: row.likesCount ?? row.likes ?? 0,
      comments: row.commentsCount ?? row.comments ?? 0,
      isVideo: !!row.isVideo,
      ownerType: "user",
      ownerId: state.user.uid
    }));
    writeCache(userPostsKey(state.user.uid), next);
    const prevIds = state.userPosts.map((item) => String(item.id)).join("|");
    const nextIds = next.map((item) => String(item.id)).join("|");
    if (prevIds === nextIds) return;
    state.userPosts = next;
    render();
  } catch (err) {
    console.error(err);
  }
}

async function loadBusinessPosts({ force = false } = {}) {
  const restaurantId = state.userProfile.restaurantId;
  if (!restaurantId) {
    state.businessPosts = [];
    render();
    return;
  }
  const cached = readCache(businessPostsKey(restaurantId), CACHE_TTL_MS.posts);
  if (cached?.data?.length) {
    if (!state.businessPosts.length) {
      state.businessPosts = cached.data.map((post) => ({
        ...post,
        ownerType: post.ownerType || "restaurant",
        ownerId: post.ownerId || restaurantId,
        restaurantId: post.restaurantId || restaurantId
      }));
      render();
    }
    if (cached.fresh && !force) return;
  }
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
    const next = rows
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
    writeCache(businessPostsKey(restaurantId), next);
    const prevIds = state.businessPosts.map((item) => String(item.id)).join("|");
    const nextIds = next.map((item) => String(item.id)).join("|");
    if (prevIds === nextIds) return;
    state.businessPosts = next;
    render();
  } catch (err) {
    console.error(err);
  }
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
  if (!restaurantId) {
    state.focus = { ...state.focus, restaurantId: "", items: [], loading: false, error: "" };
    return;
  }
  const cacheKey = focusCacheKey(restaurantId);
  const cached = focusCache.get(cacheKey);
  if (cached && cached.items?.length && !force) {
    state.focus = { ...state.focus, restaurantId, items: cached.items, enabled: cached.enabled, loading: false, error: "", index: 0 };
    return;
  }
  state.focus = { ...state.focus, restaurantId, loading: true, error: "" };
  render();
  try {
    const [items, enabled] = await Promise.all([
      loadFocusItems(restaurantId),
      loadFocusMeta(restaurantId)
    ]);
    focusCache.set(cacheKey, { items, enabled, ts: Date.now() });
    state.focus = { ...state.focus, restaurantId, items, enabled, loading: false, error: "", index: 0 };
    render();
  } catch (err) {
    console.error(err);
    state.focus = { ...state.focus, restaurantId, items: [], loading: false, error: "Fokus laden fehlgeschlagen." };
    render();
  }
}

async function loadMenuForRestaurant(restaurantId, { force = false, source = "hybrid" } = {}) {
  if (!restaurantId) {
    state.menu = { ...state.menu, restaurantId: "", items: [], loading: false, error: "", source };
    return;
  }
  const cacheKey = menuCacheKey(restaurantId, source);
  const cached = menuCache.get(cacheKey);
  if (cached && cached.items?.length && !force) {
    const cachedNeedsImages = cached.items.some((it) => !hasMenuItemImages(it));
    if (!cachedNeedsImages) {
      state.menu = { ...state.menu, restaurantId, items: cached.items, loading: false, error: "", source };
      return;
    }
  }
  state.menu = { ...state.menu, restaurantId, loading: true, error: "", source };
  render();
  try {
    let items = [];
    if (source === "collection") {
      items = await loadMenuItemsFromCollection(restaurantId);
      const needsImages = items.some((it) => !hasMenuItemImages(it));
      if (needsImages) {
        const publicItems = await loadPublicMenuItems(restaurantId);
        const fallbackItems = publicItems.length ? publicItems : await loadLegacyMenuItems(restaurantId);
        if (fallbackItems.length) {
          items = fillMenuImagesFromFallback(items, fallbackItems);
        }
      }
    } else {
      items = await loadMenuHybrid(restaurantId);
    }
    menuCache.set(cacheKey, { items, ts: Date.now() });
    state.menu = { ...state.menu, restaurantId, items, loading: false, error: "", source };
    render();
  } catch (err) {
    console.error(err);
    state.menu = { ...state.menu, restaurantId, items: [], loading: false, error: "Menu laden fehlgeschlagen.", source };
    render();
  }
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

function clearShopCart({ keepForm = false } = {}) {
  const form = keepForm
    ? { ...(state.shopCart?.form || createEmptyShopCart().form) }
    : { ...createEmptyShopCart().form };
  state.shopCart = {
    ...createEmptyShopCart(),
    form
  };
  saveShopCartToStorage();
}

function getCurrentShopProfile() {
  return state.profileView?.profile || state.userProfile;
}

function getShopCartProfileContext(profile = getCurrentShopProfile()) {
  return getShopCartProfileContextCore(profile, {
    getRestaurantMetaByIdFn: getRestaurantMetaById
  });
}

function addMenuItemToShopCart(item, profile = getCurrentShopProfile(), options = {}) {
  if (!item || !canAddToShopCart(profile)) return;
  const context = getShopCartProfileContext(profile);
  if (!context.restaurantId) return;
  const currentRestaurantId = String(state.shopCart?.restaurantId || "").trim();
  if (currentRestaurantId && currentRestaurantId !== context.restaurantId) {
    const shouldReplace = confirm("Dein Warenkorb enthaelt Produkte von einem anderen Shop. Ersetzen?");
    if (!shouldReplace) return;
    clearShopCart({ keepForm: true });
  }
  const nextCart = normalizeShopCartState(state.shopCart);
  const selectedSize = String(options?.size || "").trim();
  const selectedColor = String(options?.color || "").trim();
  const cartKey = buildShopVariantKey(item.id, { size: selectedSize, color: selectedColor });
  const existingIndex = nextCart.items.findIndex((entry) => String(entry.cartKey || entry.itemId) === cartKey);
  const entry = {
    id: String(item.id || "").trim(),
    itemId: String(item.id || "").trim(),
    cartKey,
    name: String(item.name || "Produkt").trim() || "Produkt",
    price: String(item.price ?? "").trim(),
    quantity: 1,
    imageUrl: String(resolveMenuItemHero(item) || "").trim(),
    category: String(item.category || "").trim(),
    selectedSize,
    selectedColor,
    cropX: clampCropPercent(item?.cropX ?? 50, 50),
    cropY: clampCropPercent(item?.cropY ?? 50, 50)
  };
  if (existingIndex >= 0) {
    nextCart.items[existingIndex] = {
      ...nextCart.items[existingIndex],
      quantity: Math.max(1, Number(nextCart.items[existingIndex].quantity || 1) + 1)
    };
  } else {
    nextCart.items.unshift(entry);
  }
  nextCart.restaurantId = context.restaurantId;
  nextCart.businessName = context.businessName;
  nextCart.businessAvatar = context.businessAvatar;
  nextCart.status = `${entry.name} wurde zum Warenkorb hinzugefuegt.`;
  state.shopCart = nextCart;
  saveShopCartToStorage();
  render();
}

function updateShopCartQuantity(itemId, delta) {
  const safeId = String(itemId || "").trim();
  if (!safeId) return;
  const nextCart = normalizeShopCartState(state.shopCart);
  nextCart.items = nextCart.items
    .map((entry) => (
      String(entry.cartKey || entry.itemId) === safeId
        ? { ...entry, quantity: Math.max(0, Number(entry.quantity || 1) + Number(delta || 0)) }
        : entry
    ))
    .filter((entry) => entry.quantity > 0);
  nextCart.status = "";
  if (!nextCart.items.length) {
    clearShopCart({ keepForm: true });
  } else {
    state.shopCart = nextCart;
    saveShopCartToStorage();
  }
  render();
}

function openShopCheckout() {
  const nextCart = normalizeShopCartState(state.shopCart);
  if (!nextCart.items.length) return;
  nextCart.checkoutOpen = true;
  nextCart.status = "";
  if (!nextCart.form.name) nextCart.form.name = String(state.userProfile?.name || state.user?.displayName || "").trim();
  if (!nextCart.form.phone) nextCart.form.phone = String(state.userProfile?.phone || state.user?.phoneNumber || "").trim();
  if (!nextCart.form.city) nextCart.form.city = String(state.userProfile?.location || "").trim();
  if (!nextCart.form.address) nextCart.form.address = String(state.userProfile?.address || "").trim();
  state.shopCart = nextCart;
  saveShopCartToStorage();
  render();
}

function updateShopCheckoutField(field, value) {
  if (!field) return;
  const nextCart = normalizeShopCartState(state.shopCart);
  if (!(field in nextCart.form)) return;
  nextCart.form[field] = String(value || "");
  nextCart.status = "";
  state.shopCart = nextCart;
  saveShopCartToStorage();
}

function getShopCartTotal() {
  return getShopCartTotalCore(state.shopCart.items || [], {
    parsePriceValueFn: parsePriceValue
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

function openFocusModal(mode = "create", item = null) {
  const crop = getFocusItemCrop(item);
  state.focusModal = {
    open: true,
    mode,
    item,
    status: "",
    loading: false,
    cropX: crop.x,
    cropY: crop.y,
    imageFile: null,
    imagePreview: ""
  };
  renderOverlays({ updateFocus: true });
}

function closeFocusModal() {
  state.focusModal = {
    open: false,
    mode: "create",
    item: null,
    status: "",
    loading: false,
    cropX: 50,
    cropY: 50,
    imageFile: null,
    imagePreview: ""
  };
  renderOverlays({ updateFocus: true });
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
let __secondaryAuth = null;
function getSecondaryAuth() {
  if (__secondaryAuth) return __secondaryAuth;
  const existing = getApps().find((item) => item.name === "menyra-secondary");
  const secondaryApp = existing || initializeApp(app.options, "menyra-secondary");
  __secondaryAuth = getAuth(secondaryApp);
  return __secondaryAuth;
}

async function createAuthUser(email, password) {
  if (!email || !password) throw new Error("Email/Passwort fehlt.");
  const auth2 = getSecondaryAuth();
  let cred = null;
  try {
    cred = await createUserWithEmailAndPassword(auth2, email, password);
  } catch (err) {
    if (err?.code === "auth/email-already-in-use") {
      cred = await signInWithEmailAndPassword(auth2, email, password);
    } else {
      throw err;
    }
  }
  try { await signOut(auth2); } catch {}
  return cred?.user || null;
}

async function ensureRestaurantPublicMeta(restaurantId, base) {
  if (!restaurantId) return;
  const payload = {
    name: base?.name || base?.restaurantName || "",
    restaurantName: base?.restaurantName || base?.name || "",
    type: base?.type || "cafe",
    city: base?.city || "",
    logoUrl: base?.logoUrl || base?.logo || "",
    logo: base?.logo || "",
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, "restaurants", restaurantId, "public", "meta"), payload, { merge: true });
}

function normalizeLeadDoc(docSnap) {
  const sourceData = typeof docSnap?.data === "function" ? docSnap.data() : (docSnap?.data || docSnap || {});
  const data = applyKnownLeadOwnershipOverride(sourceData);
  const status = normalizeLeadStatusKey(data.status || "registered") || "registered";
  const fallbackCoords = resolveCoordsFromEntity(data);
  const fallbackLat = fallbackCoords?.lat ?? null;
  const fallbackLng = fallbackCoords?.lng ?? null;
  const locations = normalizeLeadLocations(data.locations || [], data.address || "", {
    lat: fallbackLat,
    lng: fallbackLng
  });
  const primary = getPrimaryLeadLocation(locations);
  return {
    id: docSnap?.id || data.id || "",
    businessName: data.businessName || data.name || "",
    customerType: resolveCustomerType(data.customerType || data.type || "cafe"),
    contactName: data.contactName || data.contact || "",
    phone: data.phone || "",
    email: data.email || "",
    instagram: data.instagram || data.insta || "",
    city: data.city || "",
    address: locations[0]?.address || data.address || "",
    lat: hasLeadLocationCoords(primary) ? primary.lat : (fallbackLat ?? null),
    lng: hasLeadLocationCoords(primary) ? primary.lng : (fallbackLng ?? null),
    gpsLat: Number.isFinite(Number(fallbackLat)) ? Number(fallbackLat) : null,
    gpsLng: Number.isFinite(Number(fallbackLng)) ? Number(fallbackLng) : null,
    locations,
    logoUrl: data.logoUrl || data.logo || data.imageUrl || "",
    note: data.note || "",
    status,
    restaurantId: data.restaurantId || data.restaurant || "",
    socialUid: data.socialUid || "",
    socialEmail: data.socialEmail || "",
    createdByUid: data.createdByUid || "",
    createdByRole: data.createdByRole || "",
    createdByName: data.createdByName || "",
    createdByHandle: data.createdByHandle || "",
    ceoRootUid: data.ceoRootUid || "",
    ceoRootName: data.ceoRootName || "",
    ceoParentUid: data.ceoParentUid || "",
    ceoPath: normalizeCeoPath(data.ceoPath),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}

function normalizeLeadFromRestaurant(rest) {
  if (!rest?.id) return null;
  const data = applyKnownLeadOwnershipOverride(rest);
  const status = normalizeLeadStatusKey(data.status || "registered") || "registered";
  const fallbackCoords = resolveCoordsFromEntity(data);
  const fallbackLat = fallbackCoords?.lat ?? null;
  const fallbackLng = fallbackCoords?.lng ?? null;
  const locations = normalizeLeadLocations(data.locations || [], data.address || "", {
    lat: fallbackLat,
    lng: fallbackLng
  });
  const primary = getPrimaryLeadLocation(locations);
  return {
    id: data.leadId || data.id,
    businessName: data.name || data.restaurantName || "",
    customerType: resolveCustomerType(data.type || data.customerType || "cafe"),
    contactName: data.ownerName || "",
    phone: data.phone || "",
    email: data.ownerEmail || "",
    instagram: data.instagram || data.insta || "",
    city: data.city || "",
    address: locations[0]?.address || data.address || "",
    logoUrl: data.logoUrl || data.logo || "",
    note: "",
    status,
    restaurantId: data.id,
    socialUid: data.ownerUid || "",
    socialEmail: data.ownerEmail || "",
    createdByUid: data.createdByUid || "",
    createdByRole: data.createdByRole || "",
    createdByName: data.createdByName || "",
    createdByHandle: data.createdByHandle || "",
    ceoRootUid: data.ceoRootUid || "",
    ceoRootName: data.ceoRootName || "",
    ceoParentUid: data.ceoParentUid || "",
    ceoPath: normalizeCeoPath(data.ceoPath),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lat: hasLeadLocationCoords(primary) ? primary.lat : (fallbackLat ?? null),
    lng: hasLeadLocationCoords(primary) ? primary.lng : (fallbackLng ?? null),
    gpsLat: Number.isFinite(Number(fallbackLat)) ? Number(fallbackLat) : null,
    gpsLng: Number.isFinite(Number(fallbackLng)) ? Number(fallbackLng) : null,
    locations
  };
}

function isRestaurantLeadCandidate(rest = {}) {
  const typeKey = normalizeRestaurantType(rest?.type || rest?.customerType || rest?.category || rest?.kind || rest?.restaurantType || "");
  const hasLinkedOwner = !!String(rest?.ownerUid || rest?.socialUid || rest?.uid || rest?.userUid || "").trim();
  const statusKey = normalizeLeadStatusKey(rest.status || "");
  if (typeKey === "ecommerce" && hasLinkedOwner && (!statusKey || ["registered", "contacted"].includes(statusKey))) return false;
  if (statusKey === "kunde") return false;
  if (["registered", "contacted", "testphase", "no_interest"].includes(statusKey)) return true;
  if (rest.leadId) return true;
  const noOwner = !rest.ownerUid && !rest.ownerEmail;
  if (!statusKey && noOwner) return true;
  return false;
}

function leadStatusTone(status) {
  const key = normalizeLeadStatusKey(status);
  if (key === "registered") return { bg: "bg-indigo-50", text: "text-indigo-600" };
  if (key === "contacted") return { bg: "bg-amber-50", text: "text-amber-600" };
  if (key === "testphase") return { bg: "bg-sky-50", text: "text-sky-600" };
  if (key === "kunde") return { bg: "bg-emerald-100", text: "text-emerald-700" };
  if (key === "no_interest") return { bg: "bg-slate-100", text: "text-slate-500" };
  return { bg: "bg-slate-100", text: "text-slate-500" };
}

function resolveRestaurantStatusFromLead(leadStatus, currentStatus = "") {
  const leadKey = normalizeLeadStatusKey(leadStatus);
  if (leadKey === "kunde") return "active";
  if (leadKey === "testphase") return "testphase";
  if (["registered", "contacted", "no_interest"].includes(leadKey)) return "lead";
  if (currentStatus) return currentStatus;
  return "lead";
}

function leadMatchesQuery(lead, queryKey) {
  if (!queryKey) return true;
  const locationText = Array.isArray(lead.locations)
    ? lead.locations.map((item) => item?.address || "").join(" ")
    : "";
  const hay = normalizeSearchKey([
    lead.businessName,
    lead.contactName,
    lead.phone,
    lead.email,
    lead.instagram,
    lead.city,
    lead.customerType,
    locationText
  ].filter(Boolean).join(" "));
  return hay.includes(queryKey);
}

function customerMatchesQuery(rest, queryKey) {
  if (!queryKey) return true;
  const hay = normalizeSearchKey([
    rest.name,
    rest.restaurantName,
    rest.city,
    rest.ownerName,
    rest.ownerEmail,
    rest.phone,
    rest.instagram,
    rest.insta
  ].filter(Boolean).join(" "));
  return hay.includes(queryKey);
}

function leadBelongsToScope(lead, scope = state.leads.scope) {
  const safeScope = normalizeLeadScopeKey(scope);
  const statusKey = normalizeLeadStatusKey(lead?.status || "");
  if (statusKey === "kunde") return false;
  if (safeScope === "archived") return statusKey === "no_interest";
  if (statusKey === "no_interest") return false;
  return safeScope === "own" ? isCurrentCeoOwnRow(lead) : !isCurrentCeoOwnRow(lead);
}

function customerBelongsToScope(customer, scope = state.customers.scope) {
  const safeScope = normalizeCustomerScopeKey(scope);
  if (!isCustomerRestaurant(customer)) return false;
  return safeScope === "own" ? isCurrentCeoOwnRow(customer) : !isCurrentCeoOwnRow(customer);
}

async function fetchLeadScopeRows(scope, desiredCount) {
  const current = getCurrentCeoMeta();
  const safeScope = normalizeLeadScopeKey(scope);
  if (!current.uid) return [];
  const leadRef = collection(db, "leads");
  const restaurantRef = collection(db, "restaurants");
  const fetchLimit = Math.min(Math.max((Number(desiredCount) || CRM_PAGE_SIZE) * (safeScope === "own" ? 3 : 4), CRM_PAGE_SIZE + 1), 160);
  const leadQueries = [];
  const restaurantQueries = [];

  if (safeScope === "own") {
    leadQueries.push(query(leadRef, where("createdByUid", "==", current.uid), limit(fetchLimit)));
    restaurantQueries.push(query(restaurantRef, where("createdByUid", "==", current.uid), limit(fetchLimit)));
  } else {
    leadQueries.push(query(leadRef, where("ceoPath", "array-contains", current.uid), limit(fetchLimit)));
    restaurantQueries.push(query(restaurantRef, where("ceoPath", "array-contains", current.uid), limit(fetchLimit)));
    if (hasGlobalCeoAccess()) {
      leadQueries.push(query(leadRef, limit(fetchLimit)));
      restaurantQueries.push(query(restaurantRef, limit(fetchLimit)));
    }
  }

  const [leadSnaps, restaurantSnaps] = await Promise.all([
    Promise.all(leadQueries.map((ref) => getDocs(ref).catch(() => null))),
    Promise.all(restaurantQueries.map((ref) => getDocs(ref).catch(() => null)))
  ]);
  const leadMap = new Map();
  leadSnaps.forEach((snap) => {
    if (!snap?.docs?.length) return;
    snap.docs.forEach((docSnap) => {
      leadMap.set(docSnap.id, normalizeLeadDoc({ id: docSnap.id, ...(docSnap.data() || {}) }));
    });
  });
  const restaurantMap = new Map();
  restaurantSnaps.forEach((snap) => {
    if (!snap?.docs?.length) return;
    snap.docs.forEach((docSnap) => {
      restaurantMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
    });
  });

  const storedLeads = Array.from(leadMap.values());
  const byRestaurant = new Map();
  const byId = new Map();
  storedLeads.forEach((lead) => {
    if (lead?.restaurantId) byRestaurant.set(String(lead.restaurantId), true);
    if (lead?.id) byId.set(String(lead.id), true);
  });

  const restaurantRows = Array.from(restaurantMap.values());
  if (restaurantRows.length) {
    state.restaurants = mergeRestaurants(state.restaurants, restaurantRows);
    rebuildBusinessLocations();
  }
  const derivedLeads = restaurantRows
    .filter((rest) => isRestaurantLeadCandidate(rest))
    .map((rest) => normalizeLeadFromRestaurant(rest))
    .filter((lead) => lead && (!lead.restaurantId || !byRestaurant.has(String(lead.restaurantId))) && (!lead.id || !byId.has(String(lead.id))));

  const rows = [...storedLeads, ...derivedLeads]
    .filter((lead) => canCurrentCeoSeeRow(lead))
    .filter((lead) => normalizeLeadStatusKey(lead.status) !== "kunde")
    .filter((lead) => {
      const statusKey = normalizeLeadStatusKey(lead.status);
      if (safeScope === "archived") return statusKey === "no_interest";
      if (statusKey === "no_interest") return false;
      return safeScope === "own" ? isCurrentCeoOwnRow(lead) : !isCurrentCeoOwnRow(lead);
    })
    .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));

  return rows;
}

async function fetchCustomerScopeRows(scope, desiredCount) {
  const current = getCurrentCeoMeta();
  const safeScope = normalizeCustomerScopeKey(scope);
  if (!current.uid) return [];
  const baseRef = collection(db, "restaurants");
  const fetchLimit = Math.min(Math.max((Number(desiredCount) || CRM_PAGE_SIZE) * (safeScope === "own" ? 3 : 4), CRM_PAGE_SIZE + 1), 160);
  const queryRefs = [];

  if (safeScope === "own") {
    queryRefs.push(query(baseRef, where("createdByUid", "==", current.uid), limit(fetchLimit)));
  } else {
    queryRefs.push(query(baseRef, where("ceoPath", "array-contains", current.uid), limit(fetchLimit)));
    if (hasGlobalCeoAccess()) {
      queryRefs.push(query(baseRef, limit(fetchLimit)));
    }
  }

  const snaps = await Promise.all(queryRefs.map((ref) => getDocs(ref).catch(() => null)));
  const rowMap = new Map();
  snaps.forEach((snap) => {
    if (!snap?.docs?.length) return;
    snap.docs.forEach((docSnap) => {
      rowMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
    });
  });

  const rows = Array.from(rowMap.values())
    .filter((row) => isCustomerRestaurant(row))
    .filter((row) => canCurrentCeoSeeRow(row))
    .filter((row) => customerBelongsToScope(row, safeScope))
    .sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));

  return rows;
}

function refreshCustomersFromRestaurants() {
  const scope = normalizeCustomerScopeKey(state.customers.scope);
  const size = Math.max(CRM_PAGE_SIZE, Number(state.customers.pageSize?.[scope]) || CRM_PAGE_SIZE);
  const currentUid = String(state.user?.uid || "").trim();
  const list = Array.isArray(state.restaurants)
    ? state.restaurants.filter((rest) => (
      isCustomerRestaurant(rest)
      && (isCeoUser() ? isOwnedByVisibleCeoTeam(rest) : true)
    ))
      .filter((rest) => customerBelongsToScope(rest, scope))
    : [];
  list.sort((a, b) => (toDateSafe(b.createdAt)?.getTime() || 0) - (toDateSafe(a.createdAt)?.getTime() || 0));
  state.customers.pages = {
    ...state.customers.pages,
    [scope]: list.slice(0, size)
  };
  state.customers.hasMore = {
    ...state.customers.hasMore,
    [scope]: list.length > size
  };
  state.customers.loaded = {
    ...state.customers.loaded,
    [scope]: true
  };
  state.customers.items = state.customers.pages[scope].slice();
  writeCustomerScopeCache(currentUid, scope, state.customers.pages[scope], {
    hasMore: state.customers.hasMore?.[scope] || false,
    knownCount: Array.isArray(list) ? list.length : 0,
    countExact: true,
    pageSize: size
  });
}

function syncVisibleLeadPageFromItems() {
  const scope = normalizeLeadScopeKey(state.leads.scope);
  const size = Math.max(CRM_PAGE_SIZE, Number(state.leads.pageSize?.[scope]) || CRM_PAGE_SIZE);
  const currentUid = String(state.user?.uid || "").trim();
  const sourceItems = Array.isArray(state.leads.items) ? state.leads.items.slice() : [];
  const nextItems = sourceItems.slice(0, size);
  state.leads.pages = {
    ...state.leads.pages,
    [scope]: nextItems
  };
  state.leads.hasMore = {
    ...state.leads.hasMore,
    [scope]: !!state.leads.hasMore?.[scope] || sourceItems.length > size
  };
  state.leads.loaded = {
    ...state.leads.loaded,
    [scope]: true
  };
  writeLeadScopeCache(currentUid, scope, nextItems, {
    hasMore: state.leads.hasMore?.[scope] || sourceItems.length > size,
    knownCount: sourceItems.length,
    countExact: !(state.leads.hasMore?.[scope] || sourceItems.length > size),
    pageSize: size
  });
}

async function loadLeads({ scope = state.leads.scope, grow = false } = {}) {
  if (!isCeoUser()) return;
  if (!hasStoredCeoCrmCounts(state.userProfile?.crmCounts) && !ceoCrmCountsPromise) {
    void ensureCeoCrmCountsLoaded();
  }
  const safeScope = normalizeLeadScopeKey(scope);
  const currentUid = String(state.user?.uid || "").trim();
  const currentSize = Math.max(CRM_PAGE_SIZE, Number(state.leads.pageSize?.[safeScope]) || CRM_PAGE_SIZE);
  const nextSize = grow ? currentSize + CRM_PAGE_SIZE : currentSize;
  const fetchLimit = Math.min(Math.max(nextSize * (safeScope === "own" ? 3 : 4), CRM_PAGE_SIZE + 1), 160);
  if (!grow && !state.leads.loaded?.[safeScope] && currentUid) {
    const cached = readLeadScopeCache(currentUid, safeScope);
    if (cached?.fresh && Array.isArray(cached.data)) {
      const cachedRows = cached.data.map((row) => normalizeLeadDoc(row));
      const cachedPageSize = Math.max(nextSize, Number(cached.meta?.pageSize) || cachedRows.length || nextSize);
      state.leads.scope = safeScope;
      state.leads.pageSize = {
        ...state.leads.pageSize,
        [safeScope]: cachedPageSize
      };
      state.leads.pages = {
        ...state.leads.pages,
        [safeScope]: cachedRows.slice(0, cachedPageSize)
      };
      state.leads.loaded = {
        ...state.leads.loaded,
        [safeScope]: true
      };
      state.leads.hasMore = {
        ...state.leads.hasMore,
        [safeScope]: !!cached.meta?.hasMore
      };
      state.leads.knownCount = {
        ...state.leads.knownCount,
        [safeScope]: Math.max(cachedRows.length, Number(cached.meta?.knownCount) || 0)
      };
      state.leads.countExact = {
        ...state.leads.countExact,
        [safeScope]: cached.meta?.countExact !== false
      };
      state.leads.items = state.leads.pages[safeScope].slice();
      state.leads.loading = false;
      state.leads.loadingMore = false;
      state.leads.error = "";
      render();
      return;
    }
  }
  state.leads.scope = safeScope;
  state.leads.pageSize = {
    ...state.leads.pageSize,
    [safeScope]: nextSize
  };
  state.leads.loading = !grow;
  state.leads.loadingMore = !!grow;
  if (!grow) state.leads.error = "";
  render();
  try {
    const rows = await fetchLeadScopeRows(safeScope, nextSize);
    const nextItems = rows.slice(0, nextSize);
    state.leads.pages = {
      ...state.leads.pages,
      [safeScope]: nextItems
    };
    state.leads.loaded = {
      ...state.leads.loaded,
      [safeScope]: true
    };
    state.leads.hasMore = {
      ...state.leads.hasMore,
      [safeScope]: rows.length > nextSize
    };
    state.leads.knownCount = {
      ...state.leads.knownCount,
      [safeScope]: rows.length
    };
    state.leads.countExact = {
      ...state.leads.countExact,
      [safeScope]: rows.length < fetchLimit
    };
    state.leads.items = nextItems.slice();
    state.leads.error = "";
    writeLeadScopeCache(currentUid, safeScope, nextItems, {
      hasMore: rows.length > nextSize,
      knownCount: rows.length,
      countExact: rows.length < fetchLimit,
      pageSize: nextSize
    });
  } catch (err) {
    console.error(err);
    state.leads.error = "Leads laden fehlgeschlagen.";
  } finally {
    state.leads.loading = false;
    state.leads.loadingMore = false;
    render();
  }
}

async function loadCustomers({ scope = state.customers.scope, grow = false } = {}) {
  if (!isCeoUser()) return;
  if (!hasStoredCeoCrmCounts(state.userProfile?.crmCounts) && !ceoCrmCountsPromise) {
    void ensureCeoCrmCountsLoaded();
  }
  const safeScope = normalizeCustomerScopeKey(scope);
  const currentUid = String(state.user?.uid || "").trim();
  const currentSize = Math.max(CRM_PAGE_SIZE, Number(state.customers.pageSize?.[safeScope]) || CRM_PAGE_SIZE);
  const nextSize = grow ? currentSize + CRM_PAGE_SIZE : currentSize;
  const fetchLimit = Math.min(Math.max(nextSize * (safeScope === "own" ? 3 : 4), CRM_PAGE_SIZE + 1), 160);
  if (!grow && !state.customers.loaded?.[safeScope] && currentUid) {
    const cached = readCustomerScopeCache(currentUid, safeScope);
    if (cached?.fresh && Array.isArray(cached.data)) {
      const cachedRows = cached.data.slice();
      const cachedPageSize = Math.max(nextSize, Number(cached.meta?.pageSize) || cachedRows.length || nextSize);
      if (cachedRows.length) {
        state.restaurants = mergeRestaurants(state.restaurants, cachedRows);
        rebuildBusinessLocations();
      }
      state.customers.scope = safeScope;
      state.customers.pageSize = {
        ...state.customers.pageSize,
        [safeScope]: cachedPageSize
      };
      state.customers.pages = {
        ...state.customers.pages,
        [safeScope]: cachedRows.slice(0, cachedPageSize)
      };
      state.customers.loaded = {
        ...state.customers.loaded,
        [safeScope]: true
      };
      state.customers.hasMore = {
        ...state.customers.hasMore,
        [safeScope]: !!cached.meta?.hasMore
      };
      state.customers.knownCount = {
        ...state.customers.knownCount,
        [safeScope]: Math.max(cachedRows.length, Number(cached.meta?.knownCount) || 0)
      };
      state.customers.countExact = {
        ...state.customers.countExact,
        [safeScope]: cached.meta?.countExact !== false
      };
      state.customers.items = state.customers.pages[safeScope].slice();
      state.customers.loading = false;
      state.customers.loadingMore = false;
      state.customers.error = "";
      render();
      return;
    }
  }
  state.customers.scope = safeScope;
  state.customers.pageSize = {
    ...state.customers.pageSize,
    [safeScope]: nextSize
  };
  state.customers.loading = !grow;
  state.customers.loadingMore = !!grow;
  if (!grow) state.customers.error = "";
  render();
  try {
    const rows = await fetchCustomerScopeRows(safeScope, nextSize);
    if (rows.length) {
      state.restaurants = mergeRestaurants(state.restaurants, rows);
      rebuildBusinessLocations();
    }
    const nextItems = rows.slice(0, nextSize);
    state.customers.pages = {
      ...state.customers.pages,
      [safeScope]: nextItems
    };
    state.customers.loaded = {
      ...state.customers.loaded,
      [safeScope]: true
    };
    state.customers.hasMore = {
      ...state.customers.hasMore,
      [safeScope]: rows.length > nextSize
    };
    state.customers.knownCount = {
      ...state.customers.knownCount,
      [safeScope]: rows.length
    };
    state.customers.countExact = {
      ...state.customers.countExact,
      [safeScope]: rows.length < fetchLimit
    };
    state.customers.items = nextItems.slice();
    state.customers.error = "";
    writeCustomerScopeCache(currentUid, safeScope, nextItems, {
      hasMore: rows.length > nextSize,
      knownCount: rows.length,
      countExact: rows.length < fetchLimit,
      pageSize: nextSize
    });
  } catch (err) {
    console.error(err);
    state.customers.error = "Kunden laden fehlgeschlagen.";
  } finally {
    state.customers.loading = false;
    state.customers.loadingMore = false;
    render();
  }
}

function isHiddenLegacyCeoEmail(email = "") {
  return HIDDEN_LEGACY_CEO_EMAILS.includes(normalizeEmailValue(email));
}

function resolveKnownLeadOwnerMeta(entity = {}) {
  const email = normalizeEmailValue(entity.email || entity.ownerEmail || entity.socialEmail || "");
  const businessKey = normalizeSearchKey(entity.businessName || entity.name || entity.restaurantName || "");
  const creatorUid = String(entity.createdByUid || "").trim();
  const hasStoredMeta = !!String(entity.createdByUid || "").trim() || normalizeCeoPath(entity.ceoPath).length > 0;
  let targetHandle = "";
  let targetName = "";

  if (MILAN_OWNED_LEAD_EMAILS.includes(email) || MILAN_OWNED_LEAD_BUSINESSES.includes(businessKey)) {
    targetHandle = "milannikolic";
    targetName = "Milan Nikolic";
  } else if (ALBERT_OWNED_LEAD_EMAILS.includes(email) || ALBERT_OWNED_LEAD_BUSINESSES.includes(businessKey)) {
    targetHandle = "alberthoti";
    targetName = "Albert Hoti";
  } else if (creatorUid && hiddenLegacyCeoUids.includes(creatorUid) && isAlbertCeoUser()) {
    return buildCeoCreatorMeta();
  } else if (!hasStoredMeta && isAlbertCeoUser()) {
    return buildCeoCreatorMeta();
  }

  if (!targetHandle) return null;

  const normalizedTargetHandle = normalizeHandle(targetHandle);
  const currentHandle = normalizeHandle(state.userProfile.handle || state.userProfile.name || state.user?.displayName || "");
  if (currentHandle && currentHandle === normalizedTargetHandle) {
    const selfMeta = buildCeoCreatorMeta();
    return {
      ...selfMeta,
      createdByName: selfMeta.createdByName || targetName,
      createdByHandle: state.userProfile.handle || normalizedTargetHandle
    };
  }

  const staffEntry = (Array.isArray(state.staff.items) ? state.staff.items : []).find((item) => (
    normalizeHandle(item.handle || item.name || "") === normalizedTargetHandle
  ));
  if (!staffEntry) return null;

  const ceoPath = normalizeCeoPath(staffEntry.ceoPath, [staffEntry.ceoRootUid, staffEntry.ceoParentUid, staffEntry.uid]);
  return {
    createdByUid: String(staffEntry.uid || "").trim(),
    createdByRole: "ceo",
    createdByName: staffEntry.name || targetName,
    createdByHandle: staffEntry.handle || normalizedTargetHandle,
    ceoRootUid: String(staffEntry.ceoRootUid || ceoPath[0] || staffEntry.uid || "").trim(),
    ceoRootName: String(staffEntry.ceoRootName || "").trim(),
    ceoParentUid: String(staffEntry.ceoParentUid || "").trim(),
    ceoPath
  };
}

function applyKnownLeadOwnershipOverride(entity = {}) {
  const meta = resolveKnownLeadOwnerMeta(entity);
  return meta ? { ...entity, ...meta } : entity;
}

function createEmptyStaffForm() {
  return {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: normalizeCeoCountry(state.userProfile?.country || CEO_COUNTRIES[0]),
    locationLabel: "",
    coords: null,
    avatarUrl: "",
    avatarPreview: "",
    avatarFile: null
  };
}

function buildStaffAccountEmail(firstName = "", lastName = "", fallback = "") {
  const toEmailLocal = (value) => String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/[^a-z0-9]/g, "");
  const localPart = toEmailLocal(`${firstName || ""}${lastName || ""}`) || toEmailLocal(fallback || "");
  return localPart ? `${localPart}@mnyra.com` : "";
}

function getStaffFormEmail(form = state.staff.form, { preferStored = false } = {}) {
  const safeForm = form || {};
  const stored = normalizeEmailValue(safeForm.email || "");
  if (preferStored && stored) return stored;
  return buildStaffAccountEmail(safeForm.firstName || "", safeForm.lastName || "", safeForm.name || stored.split("@")[0] || "");
}

function syncStaffDerivedEmailField() {
  if (!state.staff.editorUid) {
    state.staff.form = {
      ...state.staff.form,
      email: getStaffFormEmail(state.staff.form)
    };
  }
  const input = document.getElementById("staffEmail");
  if (input instanceof HTMLInputElement) {
    input.value = getStaffFormEmail(state.staff.form, { preferStored: !!state.staff.editorUid });
  }
}

function openStaffEditor(mode = "create", entry = null) {
  if (!isCeoUser()) return;
  if (mode === "edit" && entry) {
    const fallbackParts = String(entry.name || "").trim().split(/\s+/).filter(Boolean);
    const firstName = String(entry.firstName || fallbackParts[0] || "").trim();
    const lastName = String(entry.lastName || fallbackParts.slice(1).join(" ") || "").trim();
    const coords = Number.isFinite(Number(entry.gpsLat ?? entry.lat)) && Number.isFinite(Number(entry.gpsLng ?? entry.lng))
      ? { lat: Number(entry.gpsLat ?? entry.lat), lng: Number(entry.gpsLng ?? entry.lng) }
      : null;
    const avatarUrl = String(entry.avatarUrl || entry.avatar || "").trim();
    state.staff = {
      ...state.staff,
      view: "form",
      editorUid: String(entry.uid || entry.userId || entry.id || "").trim(),
      saving: false,
      deleting: false,
      error: "",
      status: "",
      form: {
        firstName,
        lastName,
        email: normalizeEmailValue(entry.email || buildStaffAccountEmail(firstName, lastName, entry.name || "")),
        password: "",
        country: normalizeCeoCountry(entry.country),
        locationLabel: String(entry.locationLabel || entry.location || entry.city || "").trim(),
        coords,
        avatarUrl,
        avatarPreview: avatarUrl,
        avatarFile: null
      }
    };
  } else {
    state.staff = {
      ...state.staff,
      view: "form",
      editorUid: "",
      saving: false,
      deleting: false,
      error: "",
      status: "",
      form: createEmptyStaffForm()
    };
  }
  render();
}

function closeStaffEditor(status = "") {
  state.staff = {
    ...state.staff,
    view: "list",
    editorUid: "",
    saving: false,
    deleting: false,
    status,
    form: createEmptyStaffForm()
  };
}

function syncStaffFormFromDom() {
  const read = (id) => {
    const node = document.getElementById(id);
    return node ? String(node.value || "") : "";
  };
  const nextCoords = state.staff.form.coords && Number.isFinite(Number(state.staff.form.coords.lat)) && Number.isFinite(Number(state.staff.form.coords.lng))
    ? { lat: Number(state.staff.form.coords.lat), lng: Number(state.staff.form.coords.lng) }
    : null;
  const nextForm = {
    ...state.staff.form,
    firstName: read("staffFirstName").trim(),
    lastName: read("staffLastName").trim(),
    password: read("staffPassword"),
    country: normalizeCeoCountry(read("staffCountry")),
    locationLabel: read("staffLocationLabel").trim(),
    coords: nextCoords
  };
  nextForm.email = getStaffFormEmail(nextForm, { preferStored: !!state.staff.editorUid });
  state.staff.form = nextForm;
}

function resetStaffForm(status = "") {
  closeStaffEditor(status);
}

async function loadCeoStaff({ grow = false } = {}) {
  if (!isCeoUser()) return;
  if (ceoStaffLoadPromise) return ceoStaffLoadPromise;
  ceoStaffLoadPromise = (async () => {
    const currentSize = Math.max(CRM_PAGE_SIZE, Number(state.staff.pageSize) || CRM_PAGE_SIZE);
    const nextSize = grow ? currentSize + CRM_PAGE_SIZE : currentSize;
    state.staff.pageSize = nextSize;
    state.staff.loading = !grow;
    state.staff.loadingMore = !!grow;
    if (!grow) state.staff.error = "";
    render();
    try {
      const current = getCurrentCeoMeta();
      const staffRef = collection(db, "superadmins");
      const staffQueries = [
        query(staffRef, where("ceoPath", "array-contains", current.uid), limit(nextSize + 1)),
        query(staffRef, where("ceoParentUid", "==", current.uid), limit(nextSize + 1))
      ];
      if (hasGlobalCeoAccess()) {
        staffQueries.push(query(staffRef, limit(nextSize + 1)));
      }
      const staffSnaps = await Promise.all(staffQueries.map((ref) => getDocs(ref).catch(() => null)));
      const rowMap = new Map();
      staffSnaps.forEach((snap) => {
        if (!snap?.docs?.length) return;
        snap.docs.forEach((docSnap) => {
          rowMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
        });
      });
      hiddenLegacyCeoUids = uniqueStringList(Array.from(rowMap.values())
        .filter((row) => isHiddenLegacyCeoEmail(row.email || row.loginEmail || row.ownerEmail || ""))
        .map((row) => String(row.uid || row.userId || row.id || "").trim()));
      let items = Array.from(rowMap.values()).map((row) => normalizeCeoStaffRecord(row));
      items = items.filter((item) => canViewCeoRecord(item) && String(item.uid || "") !== String(current.uid || ""));
      items = items.filter((item) => !isHiddenLegacyCeoEmail(item.email || ""));
      items = await hydrateStaffRecordsFromUserProfiles(items, { syncDirectory: true });
      items = items.sort((a, b) => {
        const ta = toDateSafe(a.createdAt)?.getTime() || 0;
        const tb = toDateSafe(b.createdAt)?.getTime() || 0;
        if (tb !== ta) return tb - ta;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
      dataLoaded.staff = true;
      state.staff.hasMore = items.length > nextSize;
      state.staff.items = items.slice(0, nextSize);
      state.staff.error = "";
      if (!ceoCrmCountsPromise && (
        !hasStoredCeoCrmCounts(state.userProfile?.crmCounts)
        || state.staff.items.some((item) => !hasStoredCeoCrmCounts(item?.crmCounts || {}))
      )) {
        void ensureCeoCrmCountsLoaded();
      }
    } catch (err) {
      console.error(err);
      state.staff.error = "Staff laden fehlgeschlagen.";
    } finally {
      state.staff.loading = false;
      state.staff.loadingMore = false;
      render();
    }
  })();
  try {
    return await ceoStaffLoadPromise;
  } finally {
    ceoStaffLoadPromise = null;
  }
}

async function saveCeoStaffFromView() {
  return saveCeoStaffFromViewCore({
    state,
    isCeoUser,
    syncStaffFormFromDom,
    getStaffFormEmail,
    normalizeCeoCountry,
    buildCeoName,
    render,
    getCurrentCeoMeta,
    createAuthUser,
    uploadCompressedImage,
    normalizeCeoPath,
    uniqueStringList,
    normalizeHandle,
    setDoc,
    doc,
    db,
    serverTimestamp,
    createEmptyCeoCrmCounts,
    resetStaffForm,
    loadCeoStaff,
    saveUserProfileToStorage,
    sanitizeCeoCrmCounts
  });
}

async function deleteCeoStaffFromView() {
  if (!state.user || !isCeoUser()) return;
  const uid = String(state.staff.editorUid || "").trim();
  if (!uid) return;
  if (uid === String(state.user.uid || "")) {
    state.staff.status = "Du kannst deinen eigenen CEO hier nicht loeschen.";
    render();
    return;
  }
  const entry = (state.staff.items || []).find((item) => String(item.uid || "") === uid);
  const label = entry?.name || "diesen CEO";
  if (!confirm(`Willst du ${label} wirklich loeschen?`)) return;

  state.staff.deleting = true;
  state.staff.saving = false;
  state.staff.status = "CEO wird geloescht...";
  render();

  try {
    await Promise.all([
      deleteDoc(doc(db, "superadmins", uid)),
      deleteDoc(doc(db, "users", uid))
    ]);
    resetStaffForm("CEO Staff geloescht.");
    await loadCeoStaff();
  } catch (err) {
    console.error(err);
    state.staff.status = err?.message || "CEO Staff konnte nicht geloescht werden.";
    state.staff.deleting = false;
    render();
  }
}

function readLeadModalLocationsFromForm() {
  const inputs = Array.from(document.querySelectorAll("[data-lead-location-address]"));
  if (!inputs.length) {
    return normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  }
  const current = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  const rows = inputs.map((input, index) => {
    const saved = current[index] || createLeadLocation();
    const address = String(input.value || "").trim();
    const parsedCoords = parseCoordsFromAddressInput(address, getLeadPlusCodeReference(address));
    const keepSavedCoords = hasLeadLocationCoords(saved);
    const extracted = extractPlusCodeFromText(address);
    const shouldPreferSaved = !!(extracted?.code && isLikelyShortPlusCode(extracted.code) && String(extracted.remainder || "").trim() && keepSavedCoords);
    return createLeadLocation({
      address,
      lat: shouldPreferSaved ? saved.lat : (parsedCoords ? parsedCoords.lat : (keepSavedCoords ? saved.lat : null)),
      lng: shouldPreferSaved ? saved.lng : (parsedCoords ? parsedCoords.lng : (keepSavedCoords ? saved.lng : null))
    });
  });
  return normalizeLeadLocations(rows, state.leadModal.lead?.address || "", state.leadModal.coords || null);
}

function syncLeadModalDraftFromForm() {
  if (!state.leadModal.open && !isLeadInlineCreateView()) return;
  const lead = { ...(state.leadModal.lead || {}) };
  const readText = (id) => {
    const node = document.getElementById(id);
    return node ? String(node.value || "").trim() : "";
  };
  const readValue = (id) => {
    const node = document.getElementById(id);
    return node ? String(node.value || "") : "";
  };

  lead.businessName = readText("leadBusinessName") || lead.businessName || "";
  lead.customerType = resolveCustomerType(readValue("leadCustomerType") || lead.customerType || "cafe");
  lead.contactFirstName = readText("leadCustomerFirstName") || lead.contactFirstName || "";
  lead.contactLastName = readText("leadCustomerLastName") || lead.contactLastName || "";
  lead.contactName = buildLeadContactName(
    lead.contactFirstName,
    lead.contactLastName,
    readText("leadContactName") || lead.contactName || ""
  );
  lead.phone = readText("leadPhone") || lead.phone || "";
  lead.instagram = readText("leadInstagram") || lead.instagram || "";
  lead.facebook = readText("leadFacebook") || lead.facebook || "";
  lead.tiktok = readText("leadTiktok") || lead.tiktok || "";
  lead.googleMaps = readText("leadGoogleMaps") || lead.googleMaps || "";
  lead.email = readText("leadEmail") || lead.email || "";
  lead.password = readValue("leadPassword") || lead.password || getLeadSettingsConfig().defaultPassword;
  lead.country = normalizeLeadCountry(readValue("leadCountry") || lead.country || "");
  lead.city = readText("leadCity") || lead.city || "";
  lead.zipCode = readText("leadZipCode") || lead.zipCode || "";
  lead.address = readText("leadAddress") || lead.address || "";
  lead.logoUrl = readText("leadLogoUrl") || lead.logoUrl || "";
  lead.note = readText("leadNote") || lead.note || "";
  lead.billingCycle = readValue("leadBillingCycle") === "yearly" ? "yearly" : (lead.billingCycle || "monthly");
  lead.status = normalizeLeadStatusKey(readValue("leadStatus") || lead.status || "registered") || "registered";

  const locations = readLeadModalLocationsFromForm();
  state.leadModal.locations = locations;
  if (!readText("leadAddress")) lead.address = locations[0]?.address || lead.address || "";
  state.leadModal.lead = lead;
  const primary = getPrimaryLeadLocation(locations);
  state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
  syncLeadDerivedFields();
}

function addLeadModalLocationRow() {
  syncLeadModalDraftFromForm();
  const next = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  next.push(createLeadLocation());
  state.leadModal.locations = next;
  renderLeadEditorUi();
}

function removeLeadModalLocationRow(index) {
  syncLeadModalDraftFromForm();
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0) return;
  const next = normalizeLeadLocations(state.leadModal.locations, state.leadModal.lead?.address || "", state.leadModal.coords || null);
  if (next.length <= 1) return;
  next.splice(idx, 1);
  state.leadModal.locations = next.length ? next : [createLeadLocation()];
  state.leadModal.lead = { ...(state.leadModal.lead || {}), address: state.leadModal.locations[0]?.address || "" };
  const primary = getPrimaryLeadLocation(state.leadModal.locations);
  state.leadModal.coords = hasLeadLocationCoords(primary) ? { lat: primary.lat, lng: primary.lng } : null;
  renderLeadEditorUi();
}

function openLeadModal(mode = "create", lead = null) {
  if (!isCeoUser()) return;
  if (mode === "edit") {
    state.leads.view = "create";
    state.leads.settingsStatus = "";
    state.leadModal = createLeadDraftState("edit", lead);
    render();
    return;
  }
  state.leadModal = {
    ...createLeadDraftState(mode, lead),
    open: true
  };
  renderOverlays({ updateLead: true });
}

function closeLeadModal() {
  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  resetLeadDraft();
  syncModalOpenUiState();
  renderOverlays({ updateLead: true });
}

function openCustomerModal(customer) {
  if (!isCeoUser() || !customer) return;
  state.customerModal = {
    open: true,
    mode: "edit",
    customer,
    status: "",
    loading: false,
    logoFile: null,
    logoPreview: customer.logoUrl || customer.logo || ""
  };
  renderOverlays({ updateCustomer: true });
}

function closeCustomerModal() {
  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  state.customerModal = {
    open: false,
    mode: "edit",
    customer: null,
    status: "",
    loading: false,
    logoFile: null,
    logoPreview: ""
  };
  syncModalOpenUiState();
  renderOverlays({ updateCustomer: true });
}

async function saveLeadFromModal() {
  return saveLeadFromModalCore({
    state,
    documentObj: typeof document !== "undefined" ? document : null,
    isLeadInlineCreateView,
    getLeadSettingsConfig,
    syncLeadModalDraftFromForm,
    resolveCustomerType,
    buildLeadContactName,
    buildLeadAccountEmail,
    normalizeLeadCountry,
    normalizeLeadStatusKey,
    refineLeadLocationAddressIndex,
    readLeadModalLocationsFromForm,
    getPrimaryLeadLocation,
    hasLeadLocationCoords,
    renderLeadEditorUi,
    doc,
    collection,
    db,
    uploadCompressedImage,
    serverTimestamp,
    setDoc,
    ensureRestaurantPublicMeta,
    createAuthUser,
    LEAD_SOCIAL_DEFAULT_PASSWORD,
    buildLeadCrmContribution,
    buildCustomerCrmContribution,
    resolveRestaurantStatusFromLead,
    resolveStoredCeoCreatorMeta,
    getLeadMonthlyPrice,
    accumulateCeoCrmDelta,
    applyCeoCrmCountDeltas,
    normalizeLeadDoc,
    leadBelongsToScope,
    syncVisibleLeadPageFromItems,
    mergeRestaurants,
    rebuildBusinessLocations,
    refreshCustomersFromRestaurants,
    resetLeadDraft,
    closeLeadModal,
    render,
    alertFn: typeof alert === "function" ? alert : null
  });
}

async function resolveRestaurantLinkedToLead(lead = {}) {
  const directId = String(lead?.restaurantId || "").trim();
  if (directId) {
    const cached = (state.restaurants || []).find((row) => String(row?.id || "") === directId) || null;
    if (cached?.id) return { id: directId, ...cached };
    try {
      const snap = await getDoc(doc(db, "restaurants", directId));
      if (snap.exists()) return { id: snap.id, ...(snap.data() || {}) };
    } catch {}
  }

  const leadId = String(lead?.id || "").trim();
  if (leadId) {
    const cachedByLead = (state.restaurants || []).find((row) => String(row?.leadId || "") === leadId) || null;
    if (cachedByLead?.id) return { id: String(cachedByLead.id || ""), ...cachedByLead };
    try {
      const snap = await getDocs(query(collection(db, "restaurants"), where("leadId", "==", leadId), limit(1)));
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, ...(docSnap.data() || {}) };
      }
    } catch {}
  }

  const uidCandidates = uniqueStringList([
    lead?.socialUid,
    lead?.ownerUid,
    lead?.uid
  ].map((value) => String(value || "").trim()).filter(Boolean));
  for (const uid of uidCandidates) {
    const match = await findRestaurantByUid(uid);
    if (match?.id) return match;
  }

  const emailCandidates = uniqueStringList([
    lead?.socialEmail,
    lead?.email,
    lead?.ownerEmail
  ].map((value) => normalizeEmailValue(value)).filter(Boolean));
  for (const email of emailCandidates) {
    const match = await findRestaurantByEmail(email);
    if (match?.id) return match;
  }

  return null;
}

function collectLeadIdentityPayload(lead = {}, restaurant = null) {
  const linkedRestaurantId = String(restaurant?.id || lead?.restaurantId || "").trim();
  const uidList = uniqueStringList([
    lead?.socialUid,
    lead?.ownerUid,
    restaurant?.ownerUid,
    restaurant?.socialUid,
    restaurant?.uid,
    restaurant?.userUid
  ].map((value) => String(value || "").trim()).filter(Boolean));
  const emailList = uniqueStringList([
    lead?.socialEmail,
    lead?.email,
    lead?.ownerEmail,
    restaurant?.ownerEmail,
    restaurant?.socialEmail,
    restaurant?.email,
    restaurant?.contactEmail
  ].map((value) => normalizeEmailValue(value)).filter(Boolean));
  return {
    restaurantId: linkedRestaurantId,
    uids: uidList,
    emails: emailList
  };
}

async function findUserIdsByEmailList(emails = []) {
  const list = uniqueStringList((emails || []).map((value) => normalizeEmailValue(value)).filter(Boolean));
  if (!list.length) return [];
  const found = new Set();
  const usersRef = collection(db, "users");
  await Promise.all(list.map(async (email) => {
    try {
      const snap = await getDocs(query(usersRef, where("email", "==", email), limit(10)));
      snap.forEach((docSnap) => found.add(docSnap.id));
    } catch {}
  }));
  return Array.from(found);
}

async function deactivateLinkedBusinessUsers({ restaurantId = "", explicitUids = [], emails = [] } = {}) {
  const rid = String(restaurantId || "").trim();
  const explicitUidList = uniqueStringList((explicitUids || []).map((value) => String(value || "").trim()).filter(Boolean));
  const explicitUidSet = new Set(explicitUidList);
  const emailList = uniqueStringList((emails || []).map((value) => normalizeEmailValue(value)).filter(Boolean));
  const uidSet = new Set(explicitUidList);

  if (rid) {
    try {
      const snap = await getDocs(query(collection(db, "users"), where("restaurantId", "==", rid), limit(20)));
      snap.forEach((docSnap) => uidSet.add(docSnap.id));
    } catch {}
  }

  const idsByEmail = await findUserIdsByEmailList(emailList);
  idsByEmail.forEach((uid) => uidSet.add(uid));

  const currentUid = String(state.user?.uid || "").trim();
  const tasks = [];
  uidSet.forEach((uid) => {
    const safeUid = String(uid || "").trim();
    if (!safeUid || safeUid === currentUid) return;
    tasks.push((async () => {
      try {
        const snap = await getDoc(doc(db, "users", safeUid));
        if (!snap.exists()) return;
        const data = snap.data() || {};
        const roleKey = String(data.role || "").toLowerCase();
        const roles = normalizeRoleList(data.roles || data.role || "");
        if (roles.includes("ceo") || roles.includes("staff") || roleKey === "ceo" || roleKey === "staff") return;

        const linkedRestaurantId = String(data.restaurantId || "").trim();
        const linkedEmail = normalizeEmailValue(data.email || "");
        const matchesRestaurant = !!(rid && linkedRestaurantId === rid);
        const matchesEmail = !!(linkedEmail && emailList.includes(linkedEmail));
        const isBusiness = roleKey === "business" || roles.includes("owner") || roles.includes("business");
        const isExplicit = explicitUidSet.has(safeUid);
        if (!(isExplicit || matchesRestaurant || (isBusiness && matchesEmail))) return;

        await setDoc(doc(db, "users", safeUid), {
          restaurantId: "",
          role: "user",
          roles: ["user"],
          businessStatus: "deleted",
          businessDeleted: true,
          deletedRestaurantId: rid || linkedRestaurantId || "",
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch {}
    })());
  });

  if (tasks.length) {
    await Promise.all(tasks);
  }
}

async function purgeRestaurantSocialPresence(restaurantId) {
  const rid = String(restaurantId || "").trim();
  if (!rid) return;

  const postIds = new Set();
  try {
    const postsSnap = await getDocs(query(collection(db, "restaurants", rid, "socialPosts"), limit(300)));
    const deletes = [];
    postsSnap.forEach((docSnap) => {
      postIds.add(docSnap.id);
      deletes.push(deleteDoc(docSnap.ref).catch(() => {}));
    });
    if (deletes.length) await Promise.all(deletes);
  } catch {}

  try {
    const storiesSnap = await getDocs(query(collection(db, "restaurants", rid, "stories"), limit(300)));
    const storyDeletes = [];
    storiesSnap.forEach((docSnap) => {
      storyDeletes.push(deleteDoc(docSnap.ref).catch(() => {}));
    });
    if (storyDeletes.length) await Promise.all(storyDeletes);
  } catch {}

  const feedDeletes = [];
  postIds.forEach((postId) => {
    feedDeletes.push(deleteDoc(doc(db, "socialFeed", postId)).catch(() => {}));
  });

  await Promise.all([
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "socialFeed"), where("rid", "==", rid), limit(300)));
        snap.forEach((docSnap) => {
          feedDeletes.push(deleteDoc(docSnap.ref).catch(() => {}));
        });
      } catch {}
    })(),
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "socialFeed"), where("restaurantId", "==", rid), limit(300)));
        snap.forEach((docSnap) => {
          feedDeletes.push(deleteDoc(docSnap.ref).catch(() => {}));
        });
      } catch {}
    })()
  ]);

  if (feedDeletes.length) {
    await Promise.all(feedDeletes);
  }

  writeCache(businessPostsKey(rid), []);
  menuCache.delete(menuCacheKey(rid, "collection"));
  menuCache.delete(menuCacheKey(rid, "hybrid"));
  focusCache.delete(focusCacheKey(rid));
}

function applyDeletedRestaurantStateLocally(restaurantId) {
  const rid = String(restaurantId || "").trim();
  if (!rid) return;

  state.restaurants = (state.restaurants || []).map((row) => {
    if (String(row?.id || "") !== rid) return row;
    return {
      ...row,
      leadId: "",
      status: "deleted",
      hiddenFromDiscover: true,
      deleted: true,
      isDeleted: true,
      ownerUid: "",
      ownerEmail: "",
      ownerName: ""
    };
  });

  state.feedPosts = (state.feedPosts || []).filter((post) => String(post?.restaurantId || post?.ownerId || "") !== rid);
  state.stories = (state.stories || []).filter((story) => String(story?.restaurantId || "") !== rid);
  state.businessPosts = (state.businessPosts || []).filter((post) => String(post?.restaurantId || post?.ownerId || "") !== rid);

  const cachedFeed = readCache(CACHE_KEYS.feed);
  saveFeedPosts(state.feedPosts, { lastDeltaCheck: cachedFeed?.meta?.lastDeltaCheck || 0 });
  writeCache(CACHE_KEYS.stories, state.stories);
  feedStoriesSignature = buildStoriesSignature(state.stories);
  writeCache(businessPostsKey(rid), []);

  if (state.selectedBusiness && String(state.selectedBusiness.id || "") === rid) {
    state.selectedBusiness = null;
  }

  rebuildBusinessLocations();
  refreshCustomersFromRestaurants();
}

async function deleteLeadFromModal() {
  return deleteLeadFromModalCore({
    state,
    isCeoUser,
    confirmFn: typeof confirm === "function" ? confirm : null,
    renderLeadEditorUi,
    resolveRestaurantLinkedToLead,
    mergeRestaurants,
    collectLeadIdentityPayload,
    buildLeadCrmContribution,
    buildCustomerCrmContribution,
    deleteDoc,
    doc,
    db,
    setDoc,
    serverTimestamp,
    purgeRestaurantSocialPresence,
    deactivateLinkedBusinessUsers,
    applyDeletedRestaurantStateLocally,
    accumulateCeoCrmDelta,
    applyCeoCrmCountDeltas,
    createLeadScopeMap,
    CRM_PAGE_SIZE,
    writeLeadScopeCache,
    normalizeLeadScopeKey,
    resetLeadDraft,
    render
  });
}

async function saveCustomerFromModal() {
  return saveCustomerFromModalCore({
    state,
    documentObj: typeof document !== "undefined" ? document : null,
    resolveCustomerType,
    renderOverlays,
    buildCustomerCrmContribution,
    uploadCompressedImage,
    normalizeLeadStatusKey,
    resolveRestaurantStatusFromLead,
    serverTimestamp,
    setDoc,
    doc,
    collection,
    db,
    ensureRestaurantPublicMeta,
    accumulateCeoCrmDelta,
    resolveStoredCeoCreatorMeta,
    buildLeadCrmContribution,
    normalizeLeadDoc,
    leadBelongsToScope,
    syncVisibleLeadPageFromItems,
    applyCeoCrmCountDeltas,
    mergeRestaurants,
    rebuildBusinessLocations,
    refreshCustomersFromRestaurants,
    closeCustomerModal,
    render
  });
}

async function convertLeadToCustomer(leadId) {
  return convertLeadToCustomerCore({
    leadId,
    state,
    confirmFn: confirm,
    buildLeadCrmContribution,
    resolveCustomerType,
    resolveStoredCeoCreatorMeta,
    normalizeLeadLocations,
    getPrimaryLeadLocation,
    hasLeadLocationCoords,
    serverTimestamp,
    doc,
    collection,
    db,
    setDoc,
    ensureRestaurantPublicMeta,
    createAuthUser,
    LEAD_SOCIAL_DEFAULT_PASSWORD,
    accumulateCeoCrmDelta,
    buildCustomerCrmContribution,
    applyCeoCrmCountDeltas,
    syncVisibleLeadPageFromItems,
    mergeRestaurants,
    rebuildBusinessLocations,
    refreshCustomersFromRestaurants,
    render,
    alertFn: alert
  });
}

function openMenuModal(mode = "create", item = null) {
  const existingImages = getMenuItemImages(item).filter(Boolean);
  const uniqImages = Array.from(new Set(existingImages));
  const crop = getMenuItemCrop(item);
  state.menuModal = {
    open: true,
    mode,
    item,
    status: "",
    loading: false,
    imageUrlDraft: "",
    cropX: crop.x,
    cropY: crop.y,
    imageFiles: [],
    imagePreviews: [],
    existingImages: uniqImages
  };
  renderOverlays({ updateMenu: true });
}

function closeMenuModal() {
  state.menuModal = {
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
  };
  renderOverlays({ updateMenu: true });
}

async function openMenuDetail(item, restaurantIdOverride = "") {
  if (!item) return;
  stopMenuItemMetaListeners();
  const restaurantId = String(
    restaurantIdOverride
    || item?.restaurantId
    || state.menu.restaurantId
    || state.profileView?.profile?.restaurantId
    || state.userProfile.restaurantId
    || ""
  ).trim();
  state.menuDetail = {
    open: true,
    item,
    index: 0,
    restaurantId,
    selectedSize: Array.isArray(item?.sizes) && item.sizes.length ? String(item.sizes[0]) : "",
    selectedColor: Array.isArray(item?.colors) && item.colors.length ? String(item.colors[0]) : "",
    commentText: "",
    loading: true,
    sending: false
  };
  renderOverlays({ updateMenuDetail: true });
  if (!restaurantId) {
    state.menuDetail.loading = false;
    updateMenuDetailMeta();
    return;
  }
  attachMenuItemMetaListeners(item, restaurantId);
  void loadMenuItemMetaFromFirebase(item, restaurantId).then(() => {
    if (state.menuDetail.open && state.menuDetail.item && String(state.menuDetail.item.id || "") === String(item.id || "")) {
      updateMenuDetailMeta();
    }
  });
  state.menuDetail.loading = false;
  updateMenuDetailMeta();
}

function closeMenuDetail({ afterClose = null } = {}) {
  stopMenuItemMetaListeners();
  state.menuDetail = createEmptyMenuDetailState();
  renderOverlays({ updateMenuDetail: true });
  if (typeof afterClose === "function") afterClose();
}

function setMenuDetailIndex(nextIndex) {
  if (!state.menuDetail.open || !state.menuDetail.item) return;
  const images = getMenuItemImages(state.menuDetail.item);
  if (!images.length) return;
  const max = images.length;
  let idx = Number(nextIndex);
  if (!Number.isFinite(idx)) idx = 0;
  if (idx < 0) idx = max - 1;
  if (idx >= max) idx = 0;
  if (idx === state.menuDetail.index) return;
  state.menuDetail.index = idx;
  renderOverlays({ updateMenuDetail: true });
}

function setMenuDetailVariant(field, value) {
  if (!state.menuDetail.open) return;
  if (field !== "size" && field !== "color") return;
  const key = field === "size" ? "selectedSize" : "selectedColor";
  state.menuDetail[key] = String(value || "").trim();
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

async function bootstrapUser(user) {
  await bootstrapAuthenticatedSessionCore({
    user,
    loadAuthProfile: (currentUser) => loadAuthProfile(currentUser),
    getRestaurantId: () => state.userProfile.restaurantId || "",
    hydrateRestaurantsByIds: (ids, options) => hydrateRestaurantsByIds(ids, options),
    resolveRoleSwitchTargets: (currentUser) => resolveRoleSwitchTargets(currentUser),
    ensureFollowingLoaded: () => {
      if (!dataLoaded.following) dataLoaded.following = true;
    },
    startLiveListeners: (currentUser) => startLiveListeners(currentUser),
    ensureTabData: (tab) => ensureTabData(tab),
    activeTab: state.activeTab
  });
}

loadPersisted();
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
  lastAuthUid = appliedSnapshot ? String(authBootstrapSnapshot?.uid || "").trim() : "";
}
applyPendingInitialRouteState();
render();
if (!state.user) {
  queueMicrotask(() => ensureTabData(state.activeTab));
}

onAuthStateChanged(auth, (user) => {
  authInitialized = true;
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
      bootstrapUser(user);
      queueMicrotask(() => {
        void (async () => {
          try {
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
      bootstrapUser(user);
      queueMicrotask(() => {
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
    ensureTabData(state.activeTab);
    render();
  }
  lastAuthUid = nextUid;
});

window.addEventListener("load", () => {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
});


