import { auth, db, app } from "/shared/firebase-config.js?v=2026-03-10-startup-1";
import { BUNNY_EDGE_BASE, MEDIA_TICKET_ENDPOINT } from "/shared/bunny-edge.js";
import { BRAND_UI } from "/shared/brand-ui.js";
import { createRuntimeErrorReporter } from "/shared/runtime-error-reporter.js?v=2026-03-23-runtime-errors-1";
import { initializeApp, getApps } from "/shared/vendor/firebase/11.0.0/firebase-app.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "/shared/vendor/firebase/11.0.0/firebase-auth.js";
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
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
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
  getGuestScopeUid
} from "./_shared/social-storage.js";
import {
  createEmptyShopCart,
  createEmptyOrdersState,
  createEmptyFavoriteMenuItemsState,
  createEmptyMenuDetailState,
  createEmptyTableQrState
} from "./core/common/state-factories.js";
import {
  normalizeInitialTab,
  normalizeAuthMode
} from "./core/auth/route-auth-utils.js";
import { resolveInitialRouteState } from "./core/auth/initial-route-state.js";
import {
  createAuthStartupStateHelpers
} from "./core/auth/auth-startup-state-utils.js";
import { createPendingRouteStartupState } from "./core/auth/pending-route-startup-state.js";
import { bootstrapAuthenticatedSessionCore } from "./core/auth/auth-user-bootstrap-utils.js";
import {
  clearQueryParamsFromCurrentUrlCore,
  resolveRouteStateFromTargetUrlCore,
  applyPendingRouteStateCore
} from "./core/push/push-route-query-utils.js";
import {
  buildCanonicalAppTabPathCore,
  buildCanonicalPublicBusinessPathCore,
  buildCanonicalPublicUserPathCore,
  extractPublicBusinessSlugCore,
  extractPublicUserRouteIdCore,
  parseSiteRoutePathCore
} from "./core/router/public-business-route-utils.js";
import { createShellDomRuntimeController } from "./core/app-shell/shell-dom-runtime-controller.js";
import { createSessionRuntimeCluster } from "./core/app-shell/session-runtime-cluster.js";
import { startAppStartupRuntimeCluster } from "./core/app-shell/app-startup-runtime-cluster.js";
import { createSessionDataRuntimeCluster } from "./core/app-shell/session-data-runtime-cluster.js";
import { createBridgeShellRuntimeCluster } from "./core/app-shell/bridge-shell-runtime-cluster.js";
import { createProfileBusinessMenuRuntimeCluster } from "./core/app-shell/profile-business-menu-runtime-cluster.js";
import { createProfileIdentityRuntimeCluster } from "./core/app-shell/profile-identity-runtime-cluster.js";
import { createShellUiRuntimeCluster } from "./core/app-shell/shell-ui-runtime-cluster.js";
import { createFeedVisibilityRuntimeCluster } from "./core/feed/feed-visibility-runtime-cluster.js";
import { createFocusRuntimeController } from "./core/menu/focus-runtime-controller.js";
import { createMenuPublicRuntimeController } from "./core/menu/menu-public-runtime-controller.js";
import { createTableQrRuntimeController } from "./core/menu/table-qr-runtime-controller.js";
import { createMediaUploadRuntimeCluster } from "./core/media/media-upload-runtime-cluster.js";
import { createOrdersRuntimeController } from "./core/orders/orders-runtime-controller.js";
import { createSocialEngagementRuntimeController } from "./core/profile/social-engagement-runtime-controller.js";
import { createSocialEngagementSupportRuntimeController } from "./core/profile/social-engagement-support-runtime-controller.js";
import { createCrmLeadGeoSupportRuntime } from "./core/crm/crm-lead-geo-support-runtime.js";
import { createCrmCeoScopeSupportRuntime } from "./core/crm/crm-ceo-scope-support-runtime.js";
import { createCrmDomainRuntimeCluster } from "./core/crm/crm-domain-runtime-cluster.js";
import { createChatRuntimeCluster } from "./core/chat/chat-runtime-cluster.js";
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
import { createPublicProfileDirectEntryController } from "./core/profile/public-profile-direct-entry-controller.js";
import {
  normalizeProfileSurfaceStatus,
  resolveVisibleProfileSurface
} from "./core/profile/public-profile-surface-controller.js";
import {
  isPushOpenTargetMessageCore,
  parsePushOpenTargetPayloadCore,
  shouldHandlePushOpenTargetCore
} from "./core/push/push-open-target-message-utils.js";
import {
  normalizeUserPostDocCore,
  normalizeRestaurantPostDocCore
} from "./core/feed/post-doc-normalize-utils.js";
import {
  normalizePendingPostIdCore,
  findPostInLocalSourcesCore
} from "./core/notifications/post-notification-open-utils.js";
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
  ensureOverlayRootCore,
  ensureModalEscapeHandlerCore,
  syncModalOpenUiStateCore
} from "./core/overlays/overlay-root-ui-utils.js";
import { renderCeoGuardCore } from "./core/crm/crm-shared-render-utils.js";
import { bindOverlayEventsCore } from "./core/overlays/overlay-bind-orchestrator-utils.js";
import { renderOverlaysCore } from "./core/overlays/overlay-render-orchestrator-utils.js";
import { saveLeadFromModalCore } from "./core/leads/lead-save-utils.js";
import { deleteLeadFromModalCore } from "./core/leads/lead-delete-utils.js";
import { saveCustomerFromModalCore } from "./core/crm/customer-save-utils.js";
import { convertLeadToCustomerCore } from "./core/leads/lead-convert-utils.js";
import { saveCeoStaffFromViewCore } from "./core/crm/staff-save-utils.js";
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
  normalizeCurrencyCodeCore as normalizeCurrencyCode,
  resolveCurrencyCodeFromLeadCountryCore as resolveCurrencyCodeFromLeadCountry,
  resolveEntityCurrencyCodeCore as resolveEntityCurrencyCode
} from "./core/common/currency-utils.js";
import { normalizeRestaurantTypeCore } from "./core/profile/restaurant-type-utils.js";
import { normalizeLeadTypeKeyCore as normalizeLeadTypeKey } from "./core/leads/lead-type-utils.js";
import { buildShopVariantKeyCore } from "./core/shop/shop-variant-utils.js";
import {
  normalizeOptionListCore as normalizeOptionList,
  normalizeMenuTypeCore as normalizeMenuType
} from "./core/menu/menu-input-utils.js";
import { normalizeMenuItemDocCore as normalizeMenuItemDoc } from "./core/menu/menu-doc-normalize-utils.js";
import { normalizeShopCartStateCore } from "./core/shop/shop-cart-state-utils.js";
import {
  getShopCartProfileContextCore,
  getCartCountForRestaurantCore,
  canAddToShopCartCore,
  getShopCartTotalCore
} from "./core/shop/shop-cart-access-utils.js";
import {
  getBusinessCatalogModeCore,
  getBusinessCatalogLabelCore,
  isShopCatalogProfileCore,
  isRestaurantCafeProfileCore
} from "./core/menu/catalog-mode-utils.js";
import { getBusinessProfileTypeCore } from "./core/profile/business-profile-type-utils.js";
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
const appEl = document.getElementById("app");
const FIREBASE_MESSAGING_MODULE_URL = "/shared/vendor/firebase/11.0.0/firebase-messaging.js";
const FIREBASE_FUNCTIONS_MODULE_URL = "/shared/vendor/firebase/11.0.0/firebase-functions.js";
const LEAFLET_JS_URL = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS_URL = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_FALLBACK_URL = "";
const LEAFLET_CSS_FALLBACK_URL = "";

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
const PUSH_SW_URL = (() => {
  const safeVersionToken = String(globalThis?.__MENYRA_SOCIAL_APP_VERSION__ || "").trim();
  if (!safeVersionToken) return "";
  return `/apps/menyra-social/sw.js?v=${encodeURIComponent(safeVersionToken)}`;
})();
const PUSH_SW_SCOPE = "/apps/menyra-social/";
const PUSH_SW_READY_TIMEOUT_MS = 10000;
const CRM_LAZY_RENDERERS_MODULE_URL = "/apps/menyra-social/_shared/crm-lazy-renderers.js?v=2026-03-11-superadmin-buildstatus-2";
const BUILD_INFO_ENDPOINT_URL = "/api/build-info";
const COMMENT_AVATAR_REMOTE_FETCH_ENABLED = false;
const DETAIL_COMMENTS_LIMIT = 8;
const DETAIL_LIKES_LIMIT = 12;

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
const FEED_TRUTH_LIMIT = 20;
const FEED_FALLBACK_TRUTH_LIMIT = 40;
const FEED_DELTA_TRUTH_LIMIT = 8;
const FAST_LIMITS = {
  feed: FEED_TRUTH_LIMIT,
  feedFallback: FEED_FALLBACK_TRUTH_LIMIT,
  feedDelta: FEED_DELTA_TRUTH_LIMIT,
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
  restaurantsPreview: "menyra_social_restaurants_preview_cache_v1",
  stories: "menyra_social_stories_cache_v1",
  menu: "menyra_social_menu_cache_v1"
};
const PUBLIC_BOOTSTRAP_EVENT = "menyra-social-bootstrap";
const DEFAULT_PUBLIC_BOOTSTRAP_ENDPOINT = "https://us-central1-menyra-c0e68.cloudfunctions.net/socialBootstrapFeed";
const SOCIAL_VENDOR_DEGRADED_EVENT = "menyra-social-vendor-degraded";
const SOCIAL_RUNTIME_BUDGETS_MS = Object.freeze({
  cold_guest_landing: 2200,
  profile_open: 850,
  menu_open: 950,
  add_to_cart: 280,
  chat_send: 800
});
const socialRuntimeBudgetMarks = new Map();
let runtimeDegradedBridgeBound = false;
let runtimeMediaProbeBound = false;
let runtimeDiagnosticsStartupScheduled = false;
let requestRuntimeUiRefresh = () => {};
let runtimeUiRefreshPending = false;
const MEDIA_EDGE_HOST = (() => {
  try {
    return new URL(String(BUNNY_EDGE_BASE || "")).hostname.toLowerCase();
  } catch {
    return "";
  }
})();

function supportsSocialBudgetPerf() {
  return typeof performance !== "undefined"
    && typeof performance.mark === "function"
    && typeof performance.measure === "function";
}

function buildSocialBudgetMarkName(key = "", phase = "start") {
  const safeKey = String(key || "").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  const safePhase = String(phase || "").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  return `mnyra.social.budget.${safeKey}.${safePhase}`;
}

function startSocialBudgetTrace(key = "", { markName = "" } = {}) {
  if (!supportsSocialBudgetPerf()) return "";
  const safeKey = String(key || "").trim();
  if (!safeKey) return "";
  const resolvedMarkName = String(markName || buildSocialBudgetMarkName(safeKey, "start")).trim();
  if (!resolvedMarkName) return "";
  try {
    performance.mark(resolvedMarkName);
    socialRuntimeBudgetMarks.set(safeKey, resolvedMarkName);
    return resolvedMarkName;
  } catch {
    return "";
  }
}

function finishSocialBudgetTrace(key = "", { startMarkName = "" } = {}) {
  if (!supportsSocialBudgetPerf()) return null;
  const safeKey = String(key || "").trim();
  if (!safeKey) return null;
  const resolvedStartMarkName = String(startMarkName || socialRuntimeBudgetMarks.get(safeKey) || "").trim();
  if (!resolvedStartMarkName) return null;
  const endMarkName = buildSocialBudgetMarkName(safeKey, "end");
  try {
    performance.mark(endMarkName);
    const measureName = `mnyra.social.budget.${safeKey}`;
    performance.measure(measureName, resolvedStartMarkName, endMarkName);
    const entries = performance.getEntriesByName(measureName);
    const lastEntry = entries.length ? entries[entries.length - 1] : null;
    const durationMs = Number(lastEntry?.duration || 0) || 0;
    const budgetMs = Number(SOCIAL_RUNTIME_BUDGETS_MS[safeKey] || 0) || 0;
    const withinBudget = budgetMs > 0 ? durationMs <= budgetMs : true;
    if (!state.runtimeBudgets || typeof state.runtimeBudgets !== "object") {
      state.runtimeBudgets = {};
    }
    state.runtimeBudgets[safeKey] = {
      durationMs,
      budgetMs,
      withinBudget,
      measuredAt: Date.now()
    };
    if (!withinBudget) {
      console.warn(`[mnyra][budget] ${safeKey} ${Math.round(durationMs)}ms > ${budgetMs}ms`);
    }
    return durationMs;
  } catch {
    return null;
  } finally {
    socialRuntimeBudgetMarks.delete(safeKey);
    try {
      performance.clearMarks(resolvedStartMarkName);
      performance.clearMarks(endMarkName);
    } catch {}
  }
}

function finishSocialBudgetTraceSoon(key = "", options = {}) {
  const safeKey = String(key || "").trim();
  if (!safeKey) return;
  const done = () => {
    finishSocialBudgetTrace(safeKey, options);
  };
  if (typeof queueMicrotask === "function") {
    queueMicrotask(done);
    return;
  }
  if (typeof window !== "undefined" && typeof window.setTimeout === "function") {
    window.setTimeout(done, 0);
    return;
  }
  done();
}

function normalizeRuntimeDegradedKind(kind = "") {
  const safeKind = String(kind || "").trim().toLowerCase();
  if (safeKind === "leaflet" || safeKind === "tiles" || safeKind === "map") return "map";
  if (safeKind === "font" || safeKind === "fonts") return "fonts";
  if (safeKind === "icon" || safeKind === "icons" || safeKind === "lucide") return "icons";
  if (safeKind === "bootstrap") return "bootstrap";
  if (safeKind === "media" || safeKind === "media_edge" || safeKind === "edge") return "media";
  if (safeKind === "push") return "push";
  return "";
}

function setRuntimeDegradedFlag(kind = "", { active = false, message = "" } = {}) {
  const safeKind = normalizeRuntimeDegradedKind(kind);
  if (!safeKind) return false;
  const nextMessage = active ? String(message || "").trim() : "";
  if (!state.runtimeDegraded || typeof state.runtimeDegraded !== "object") {
    state.runtimeDegraded = {
      bootstrap: "",
      map: "",
      media: "",
      push: "",
      icons: "",
      fonts: ""
    };
  }
  const currentMessage = String(state.runtimeDegraded[safeKind] || "").trim();
  if (currentMessage === nextMessage) return false;
  state.runtimeDegraded = {
    ...state.runtimeDegraded,
    [safeKind]: nextMessage
  };
  requestRuntimeUiRefresh();
  return true;
}

function hydrateRuntimeDegradedFromWindow() {
  if (typeof window === "undefined") return;
  const source = window.__MENYRA_SOCIAL_DEGRADED__;
  if (!source || typeof source !== "object") return;
  Object.entries(source).forEach(([kind, rawValue]) => {
    const normalizedKind = normalizeRuntimeDegradedKind(kind);
    if (!normalizedKind) return;
    const payload = rawValue && typeof rawValue === "object" ? rawValue : {};
    setRuntimeDegradedFlag(normalizedKind, {
      active: payload.active === true,
      message: String(payload.message || "").trim()
    });
  });
}

function bindRuntimeDegradedBridge() {
  if (runtimeDegradedBridgeBound || typeof window === "undefined") return;
  runtimeDegradedBridgeBound = true;
  window.addEventListener(SOCIAL_VENDOR_DEGRADED_EVENT, (event) => {
    const detail = event?.detail && typeof event.detail === "object" ? event.detail : {};
    setRuntimeDegradedFlag(detail.kind, {
      active: detail.active === true,
      message: String(detail.message || "").trim()
    });
  });
}

function resolveMediaProbeUrl() {
  if (typeof window === "undefined" || typeof document === "undefined") return "";
  const seen = new Set();
  const images = Array.from(document.querySelectorAll("img[src]"));
  for (const image of images) {
    const src = String(image?.getAttribute?.("src") || "").trim();
    if (src) seen.add(src);
    const currentSrc = String(image?.currentSrc || "").trim();
    if (currentSrc) seen.add(currentSrc);
  }
  for (const raw of seen) {
    try {
      const parsed = new URL(raw, window.location.origin);
      const host = String(parsed.hostname || "").toLowerCase();
      const path = String(parsed.pathname || "");
      const isWorkerHost = host.endsWith(".workers.dev");
      const isKnownEdgeHost = !!MEDIA_EDGE_HOST && host === MEDIA_EDGE_HOST;
      const isMediaPath = path.startsWith("/media/");
      if (!isMediaPath) continue;
      if (!isKnownEdgeHost && !isWorkerHost) continue;
      return parsed.toString();
    } catch {}
  }
  return "";
}

function scheduleMediaEdgeProbe() {
  if (runtimeMediaProbeBound || typeof window === "undefined" || typeof fetch !== "function") return;
  runtimeMediaProbeBound = true;
  const probe = async () => {
    const probeUrl = resolveMediaProbeUrl();
    if (!probeUrl) {
      setRuntimeDegradedFlag("media", { active: false });
      return;
    }
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timeout = window.setTimeout(() => controller?.abort(), 2600);
    try {
      await fetch(probeUrl, {
        method: "GET",
        mode: "no-cors",
        cache: "no-store",
        credentials: "omit",
        signal: controller?.signal
      });
      setRuntimeDegradedFlag("media", { active: false });
    } catch {
      setRuntimeDegradedFlag("media", {
        active: true,
        message: "Media-Edge aktuell nicht erreichbar. Bilder/Uploads koennen reduziert sein."
      });
    } finally {
      window.clearTimeout(timeout);
    }
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => { void probe(); }, { timeout: 4200 });
  } else {
    window.setTimeout(() => { void probe(); }, 1600);
  }
  window.addEventListener("online", () => { void probe(); });
}

function scheduleRuntimeDiagnosticsStartup() {
  if (runtimeDiagnosticsStartupScheduled) return;
  runtimeDiagnosticsStartupScheduled = true;
  const runDiagnostics = () => {
    markStartupTimeline("runtime diagnostics start");
    try {
      bindRuntimeDegradedBridge();
      hydrateRuntimeDegradedFromWindow();
      scheduleMediaEdgeProbe();
    } finally {
      markStartupTimeline("runtime diagnostics end");
    }
  };
  if (typeof window === "undefined") {
    runDiagnostics();
    return;
  }
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        runDiagnostics();
      });
    });
    return;
  }
  if (typeof window.setTimeout === "function") {
    window.setTimeout(runDiagnostics, 160);
    return;
  }
  runDiagnostics();
}

const userPostsKey = (uid) => (uid ? `menyra_social_user_posts_cache_v2::${uid}` : "");
const businessPostsKey = (rid) => (rid ? `menyra_social_business_posts_cache_v2::${rid}` : "");
const staffCacheKey = (uid) => (uid ? `menyra_social_staff_cache_v1::${uid}` : "");
const leadPageCacheKey = (uid, scope) => (uid && scope ? `menyra_social_leads_cache_v1::${uid}::${scope}` : "");
const customerPageCacheKey = (uid, scope) => (uid && scope ? `menyra_social_customers_cache_v1::${uid}::${scope}` : "");
const CACHE_TTL_MS = {
  feed: 10 * 60 * 1000,
  menu: 15 * 60 * 1000,
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
const socialRuntimeErrorReporter = createRuntimeErrorReporter({
  appName: "social",
  windowObj: typeof window === "undefined" ? null : window,
  maxItems: 160
});
socialRuntimeErrorReporter.captureConsoleErrors();
socialRuntimeErrorReporter.bindGlobalErrorHandlers();

function reportCriticalRuntimeFailure(scope = "", err = null, { suppressAbort = false } = {}) {
  const safeScope = String(scope || "runtime").trim() || "runtime";
  const name = String(err?.name || "").trim();
  const message = String(err?.message || "").trim();
  const isAbort = name === "AbortError" || /abort/i.test(message);
  if (suppressAbort && isAbort) return;
  socialRuntimeErrorReporter.report(
    safeScope,
    err || new Error("Operation failed"),
    { level: "warn" }
  );
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
  bootstrapRestaurantPreview: [],
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
  profileSurface: {
    target: { key: "", restaurantId: "", uid: "", handle: "" },
    header: { status: "loading", truthState: "", identityTruthState: "" },
    posts: { status: "loading", count: 0, loaded: false },
    menu: { status: "ready", restaurantId: "", source: "", count: 0 },
    focus: { status: "ready", restaurantId: "", count: 0 },
    activeTab: "feed",
    activeTopTab: "profile",
    activeContentTab: "posts",
    status: "ready",
    startup: {
      profileStatus: "loading",
      menuStatus: "ready",
      activeStatus: "ready",
      activeSurface: "feed"
    }
  },
  profileLandingStep: 0,
  profileLandingGreetingIndex: 0,
  profileLandingTourIndex: 0,
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
    source: "public",
    statusBadgeVisible: true,
    truthState: "unknown"
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
    index: 0,
    truthState: "unknown"
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
  },
  runtimeBudgets: {},
  runtimeDegraded: {
    bootstrap: "",
    map: "",
    media: "",
    push: "",
    icons: "",
    fonts: ""
  },
  startupSurface: {
    active: "ready",
    activeSurface: "feed",
    profile: "ready",
    menu: "ready"
  },
  __webDirectEntry: {
    active: false,
    restaurantId: "",
    canonicalRestaurantId: "",
    surface: "",
    topTab: "",
    contentTab: "",
    menuAccessSource: "",
    tableNumber: 0,
    explicitLanding: false,
    menuFirst: false,
    postsFirst: false,
    webPriority: false,
    phase: "",
    ts: 0
  },
  __nextRouteHistoryMode: ""
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
const STARTUP_SURFACE_FINAL_STATUSES = new Set(["ready", "empty", "error"]);
let startupFirstFinalSurfaceRenderMarked = false;
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
let sessionDataRuntimeController = null;
let socialEngagementRuntimeController = null;
let socialEngagementSupportRuntimeController = null;
let crmRuntimeController = null;
let chatRuntimeController = null;
let menuPublicRuntimeController = null;
let focusRuntimeController = null;
let tableQrRuntimeController = null;
let mediaUploadRuntimeController = null;
let bridgeShellRuntimeCluster = null;
let getFollowRuntimeController = null;
let getPushRuntimeController = null;
let getNotificationsRuntimeController = null;
let getNotificationSupportRuntimeController = null;
let getSessionTabLifecycleRuntimeController = null;
let lastAppHtml = "";
let lastRenderMode = "";
let lastRenderedMainTab = "";
let crmAutoLoadObserver = null;
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

const shellUiRuntimeCluster = createShellUiRuntimeCluster({
  state,
  constants: {
    placeholderImage: PLACEHOLDER_IMAGE,
    leadTypeOrder: LEAD_TYPE_ORDER,
    leadTypeLabels: LEAD_TYPE_LABELS,
    leadStatusOrder: LEAD_STATUS_ORDER,
    leadStatusLabels: LEAD_STATUS_LABELS
  },
  browserApi: {
    documentObj: typeof document === "undefined" ? null : document
  },
  runtimeGetters: {
    getShellDomRuntimeControllerFn: () => shellDomRuntimeController,
    getMediaUploadRuntimeControllerFn: () => mediaUploadRuntimeController,
    getChatRuntimeControllerFn: () => chatRuntimeController,
    getShellRuntimeControllerFn: () => shellRuntimeController,
    getSessionDataRuntimeControllerFn: () => sessionDataRuntimeController,
    getBridgeBindingsFn: () => bridgeShellRuntimeCluster?.bridgeBindings || null,
    getSocialEngagementSupportRuntimeControllerFn: () => getSocialEngagementSupportRuntimeController()
  },
  helperApi: {
    iconFn: icon,
    escapeHtmlFn: escapeHtml,
    getOptimizedImageUrlFn: getOptimizedImageUrl,
    isPlaceholderUrlFn: isPlaceholderUrl,
    formatRelativeFn: formatRelative,
    toDateSafeFn: toDateSafe,
    formatCountFn: formatCount,
    formatPriceFn: formatPrice,
    resolveCurrencyCodeForMenuItemFn: (...args) => resolveCurrencyCodeForMenuItem(...args),
    parsePriceValueFn: parsePriceValue,
    getFirebaseStorageUrlFn: getFirebaseStorageUrl,
    isDirectImageUrlFn: (...args) => isDirectImageUrl(...args),
    getMenuItemObjectPositionFn: getMenuItemObjectPosition,
    logoFitClassFn: logoFitClass
  },
  profileApi: {
    isFollowingProfileFn: (...args) => (
      typeof getFollowRuntimeController === "function"
        ? getFollowRuntimeController().isFollowingProfile(...args)
        : false
    ),
    resolveUserAvatarFn: (...args) => resolveUserAvatar(...args),
    resolveNotificationAvatarFn: (...args) => resolveNotificationAvatar(...args),
    resolveLikeAvatarFn: (...args) => resolveLikeAvatar(...args),
    resolveCustomerTypeFn: (...args) => resolveCustomerType(...args),
    normalizeLeadStatusKeyFn: (...args) => normalizeLeadStatusKey(...args),
    normalizeLeadLocationsFn: (...args) => normalizeLeadLocations(...args),
    hasLeadLocationCoordsFn: (...args) => hasLeadLocationCoords(...args),
    isShopCatalogProfileFn: (...args) => isShopCatalogProfile(...args),
    getBusinessProfileTypeFn: (...args) => getBusinessProfileType(...args),
    getCartCountForRestaurantFn: (...args) => getCartCountForRestaurant(...args),
    isLocalBusinessProfileFn: (...args) => isLocalBusinessProfile(...args),
    isCeoUserFn: (...args) => isCeoUser(...args),
    canAccessRestaurantOrdersFn: (...args) => canAccessRestaurantOrders(...args)
  },
  menuApi: {
    normalizeMenuTypeFn: normalizeMenuType,
    getMenuModalCropFn: (...args) => getMenuModalCrop(...args),
    getMenuItemImagesFn: (...args) => getMenuItemImages(...args),
    getMenuDetailRestaurantIdFn: (...args) => getMenuDetailRestaurantId(...args),
    getMenuDetailCatalogProfileFn: (...args) => getMenuDetailCatalogProfile(...args),
    canAddToShopCartFn: (...args) => canAddToShopCart(...args),
    getMenuItemSocialIdFn: (...args) => getMenuItemSocialId(...args),
    menuItemMetaKeyFn: (...args) => menuItemMetaKey(...args),
    ensureMenuItemMetaFn: (...args) => ensureMenuItemMeta(...args),
    resolveMenuItemCountsFn: (...args) => resolveMenuItemCounts(...args),
    getFocusModalCropFn: (...args) => getFocusModalCrop(...args),
    normalizeMenuItemDocFn: normalizeMenuItemDoc,
    normalizeOptionListFn: normalizeOptionList,
    syncMenuCachesFn: (...args) => syncMenuCaches(...args),
    publishMenuToPublicFn: (...args) => publishMenuToPublic(...args)
  },
  socialApi: {
    ensurePostMetaFn: (...args) => ensurePostMeta(...args),
    resolvePostCountsFn: (...args) => resolvePostCounts(...args),
    ensureCommentShapeFn: (...args) => ensureCommentShape(...args),
    currentUserBadgeFn: (...args) => currentUserBadge(...args),
    formatDateLabelFn: (...args) => formatDateLabel(...args),
    findPostByIdFn: (...args) => findPostById(...args)
  },
  mainApi: {
    renderPublicProfileViewFn: (...args) => renderPublicProfileView(...args),
    renderProfileViewFn: (...args) => renderProfileView(...args),
    renderMenuAdminViewFn: (...args) => renderMenuAdminView(...args),
    renderBusinessAccountsViewFn: (...args) => renderBusinessAccountsView(...args),
    renderLeadsViewFn: (...args) => renderLeadsView(...args),
    renderStaffViewFn: (...args) => renderStaffView(...args),
    renderCustomersViewFn: (...args) => renderCustomersView(...args),
    bindBusinessAccountsEventsFn: (...args) => bindBusinessAccountsEvents(...args)
  },
  notificationApi: {
    resolveNotificationAvatarFn: (...args) => resolveNotificationAvatar(...args)
  },
  uploadApi: {
    uploadCompressedImageFn: (...args) => uploadCompressedImage(...args)
  },
  actionApi: {
    confirmFn: typeof confirm === "function" ? confirm : () => false,
    alertFn: typeof alert === "function" ? alert : () => {},
    docFn: doc,
    collectionFn: collection,
    db,
    deleteDocFn: deleteDoc,
    setDocFn: setDoc,
    serverTimestampFn: serverTimestamp
  }
});
const {
  renderAuthScreen,
  renderDrawer,
  renderRoleSwitchLinks,
  updateShellDom,
  updateDrawerDom,
  updateNotificationBadges,
  updateNotificationsDom,
  bindNotificationsDelegation,
  handleNotificationsUpdate,
  renderCommentItem,
  renderPostComments,
  renderMenuCommentItem,
  renderMenuDetailComments,
  updatePostModalMeta,
  updatePostModalCountsOnly,
  updatePostModalCommentsOnly,
  updateMenuDetailMeta,
  updateMenuDetailCountsOnly,
  updateMenuDetailCommentsOnly,
  updateCommentLikeButton,
  renderChatModal,
  renderProfileModal,
  renderPostModal,
  renderLikesModal,
  renderLeadModal,
  renderCustomerModal,
  renderMenuItemModal,
  renderMenuDetailModal,
  renderFocusModal,
  renderSettingsView,
  renderNotificationsList,
  renderNotificationsView,
  renderCrmLazyLoadingView,
  renderOrdersView,
  renderUploadView,
  renderChatMessagesPanel,
  renderChatPendingAttachments,
  renderChatListPanel,
  renderChatView,
  renderHeaderActionButton,
  renderHeader,
  renderBusinessTopTabs,
  renderMain,
  bindImageFallbacks,
  render: renderShell,
  bindAuthEvents,
  bindCrmAutoLoadObserver,
  bindAppEvents,
  bindSearchEvents,
  handleUploadPost,
  loadRestaurants,
  loadFeedPosts,
  loadUserPosts,
  loadBusinessPosts,
  loadFocusForRestaurant,
  loadMenuForRestaurant,
  saveMenuItemFromModal,
  deleteMenuItemById
} = shellUiRuntimeCluster;
let lastSyncedTabRouteKey = "";
const ROUTE_PROFILE_ID_QUERY_KEYS = ["restaurant", "restaurantId", "rid", "businessId"];
const ROUTE_PROFILE_TOP_QUERY_KEYS = ["surface", "screen"];
const ROUTE_PROFILE_ACCESS_SOURCE_QUERY_KEYS = ["source", "menuSource", "menuAccessSource", "access"];
const ROUTE_PROFILE_TABLE_QUERY_KEYS = ["tableNumber", "t"];
const ROUTE_USER_ID_QUERY_KEYS = ["uid", "user", "userId", "u"];
const ROUTE_USER_HANDLE_QUERY_KEYS = ["handle"];
const ROUTE_USER_CONTENT_QUERY_KEYS = ["content", "contentTab", "section"];
const AUTH_RESTORE_PRESERVED_TABS = new Set([
  "profile",
  "menu",
  "chat",
  "notifications",
  "settings",
  "upload",
  "leads",
  "staff",
  "customers",
  "businessaccounts"
]);
const STARTUP_SNAPSHOT_ALLOWED_TABS = new Set([
  "feed",
  "chat",
  "search",
  "profile",
  "menu",
  "orders",
  "notifications",
  "settings",
  "leads",
  "staff",
  "customers",
  "businessAccounts"
]);

function resolveRouteTabForState() {
  const normalized = normalizeLegacyHomeTab(state.activeTab);
  const pendingProfileRoute = pendingRouteState.getPendingState?.() || {};
  const hasPendingProfileRoute = !!String(pendingProfileRoute.pendingProfileRestaurantId || "").trim()
    || !!String(pendingProfileRoute.pendingUserRouteId || "").trim();
  const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object"
    ? state.__webDirectEntry
    : null;
  const hasActiveWebDirectRoute = webDirectEntry?.active === true
    && webDirectEntry?.webPriority === true
    && String(webDirectEntry?.restaurantId || "").trim().length > 0;
  const safeTab = sanitizeTabForSession(normalized, {
    hasProfileView: !!state.profileView || hasPendingProfileRoute || hasActiveWebDirectRoute
  });
  return String(safeTab || "feed").trim().toLowerCase();
}

function setCanonicalRouteQueryParam(searchParams, primaryKey, aliasKeys = [], value = "") {
  if (!(searchParams instanceof URLSearchParams)) return;
  const primary = String(primaryKey || "").trim();
  if (!primary) return;
  const aliases = Array.from(new Set(
    [primary, ...(Array.isArray(aliasKeys) ? aliasKeys : [])]
      .map((key) => String(key || "").trim())
      .filter(Boolean)
  ));
  aliases.forEach((key) => {
    if (key !== primary) searchParams.delete(key);
  });
  const nextValue = String(value || "").trim();
  if (!nextValue) {
    searchParams.delete(primary);
    return;
  }
  searchParams.set(primary, nextValue);
}

function resolveRouteQueryStateForCurrentView() {
  const pendingRoute = pendingRouteState.getPendingState?.() || {};
  const pendingProfileRestaurantId = normalizePendingProfileRestaurantIdCore(pendingRoute.pendingProfileRestaurantId || "");
  const pendingProfileTopTab = String(
    normalizeProfileTopTabFromRouteCore(pendingRoute.pendingProfileTopTab || "")
    || "profile"
  ).trim().toLowerCase();
  const pendingProfileAccessSource = String(pendingRoute.pendingProfileAccessSource || "").trim().toLowerCase();
  const pendingProfileTableNumber = Math.max(0, Number(pendingRoute.pendingProfileTableNumber || 0) || 0);
  const pendingUserRouteId = String(pendingRoute.pendingUserRouteId || "").replace(/^@/, "").trim();
  const pendingUserContentTab = String(pendingRoute.pendingUserContentTab || "").trim().toLowerCase() === "media"
    ? "media"
    : "posts";
  const activeProfile = state.profileView?.profile && typeof state.profileView.profile === "object"
    ? state.profileView.profile
    : null;
  const resolvedProfileRestaurantIdFromView = String(
    activeProfile?.canonicalRestaurantId
    || activeProfile?.restaurantId
    || ""
  ).trim();
  const liveUserRouteId = resolvedProfileRestaurantIdFromView
    ? ""
    : extractPublicUserRouteIdCore(activeProfile || {});
  const profileRestaurantId = String(resolvedProfileRestaurantIdFromView || pendingProfileRestaurantId || "").trim();
  const hasLiveBusinessProfileEntity = !!activeProfile && (
    !!String(activeProfile?.canonicalRestaurantId || activeProfile?.restaurantId || "").trim()
    || String(activeProfile?.role || "").trim().toLowerCase() === "business"
  );
  const usingPendingBusinessRoute = !resolvedProfileRestaurantIdFromView
    && !!pendingProfileRestaurantId
    && !hasLiveBusinessProfileEntity;
  const usingPendingUserRoute = !resolvedProfileRestaurantIdFromView && !liveUserRouteId && !!pendingUserRouteId;
  const profileTopTab = String(state.profileTopTab || "").trim().toLowerCase();
  const profileContentTab = String(state.profileContentTab || "").trim().toLowerCase();
  const activeRoutePayload = state?.profileView?.routePayload && typeof state.profileView.routePayload === "object"
    ? state.profileView.routePayload
    : null;
  const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object"
    ? state.__webDirectEntry
    : null;
  const menuAccessSource = String(
    state.profileView?.menuAccessSource
    || activeRoutePayload?.menuAccessSource
    || webDirectEntry?.menuAccessSource
    || ""
  ).trim().toLowerCase();
  const tableNumber = Math.max(0, Number(
    state.profileView?.tableNumber
    || activeRoutePayload?.tableNumber
    || webDirectEntry?.tableNumber
    || 0
  ) || 0);
  const profileRestaurantMeta = Array.isArray(state?.restaurants)
    ? state.restaurants.find((row) => String(row?.id || "").trim() === profileRestaurantId)
    : null;
  const previewRestaurantMeta = !profileRestaurantMeta && Array.isArray(state?.bootstrapRestaurantPreview)
    ? state.bootstrapRestaurantPreview.find((row) => String(row?.id || "").trim() === profileRestaurantId)
    : null;
  const routeState = {
    tab: resolveRouteTabForState(),
    routeKind: "app",
    authMode: state.auth?.open === true
      ? (normalizeAuthMode(String(state.auth?.mode || "").trim()) || "")
      : "",
    profileRestaurantId: "",
    profileTopTab: "",
    profileContentTab: "",
    profileAccessSource: "",
    profileTableNumber: 0,
    canonicalPublicSlug: "",
    userRouteId: "",
    userContentTab: ""
  };
  if (routeState.authMode) {
    routeState.routeKind = "auth";
    routeState.tab = "feed";
    return routeState;
  }
  if (state.activeTab !== "profile") return routeState;

  if (profileRestaurantId) {
    routeState.routeKind = "business";
    routeState.profileRestaurantId = profileRestaurantId;
    routeState.canonicalPublicSlug = extractPublicBusinessSlugCore(
      activeProfile
      || profileRestaurantMeta
      || previewRestaurantMeta
      || state?.profileView?.routePayload?.businessSnapshot?.identity
      || state?.profileView?.routePayload?.identity
      || {}
    );
    const effectiveTopTab = usingPendingBusinessRoute
      ? pendingProfileTopTab
      : (profileTopTab || "profile");
    routeState.profileTopTab = effectiveTopTab === "menu" ? "menu" : "profile";
    routeState.profileContentTab = routeState.profileTopTab === "menu" ? "menu" : "posts";
    const effectiveAccessSource = usingPendingBusinessRoute
      ? pendingProfileAccessSource
      : menuAccessSource;
    routeState.profileAccessSource = effectiveAccessSource === "qr" ? "qr" : "";
    if (routeState.profileAccessSource === "qr") {
      routeState.profileTopTab = "menu";
      routeState.profileContentTab = "menu";
    }
    const effectiveTableNumber = usingPendingBusinessRoute
      ? pendingProfileTableNumber
      : tableNumber;
    routeState.profileTableNumber = routeState.profileAccessSource === "qr"
      ? Math.max(0, Number(effectiveTableNumber || 0) || 0)
      : 0;
    return routeState;
  }

  const resolvedUserRouteId = String(liveUserRouteId || pendingUserRouteId || "").trim();
  if (!resolvedUserRouteId) return routeState;
  routeState.routeKind = "user";
  routeState.userRouteId = resolvedUserRouteId;
  routeState.userContentTab = usingPendingUserRoute
    ? pendingUserContentTab
    : (profileContentTab === "media" ? "media" : "posts");
  return routeState;
}

function buildCurrentRouteSyncKey(url, routeState = {}) {
  if (!(url instanceof URL)) return "";
  const safeRouteState = routeState && typeof routeState === "object" ? routeState : {};
  return [
    url.pathname,
    url.search,
    url.hash || "",
    String(safeRouteState.tab || "").trim().toLowerCase(),
    String(safeRouteState.routeKind || "").trim().toLowerCase(),
    String(safeRouteState.authMode || "").trim().toLowerCase(),
    String(safeRouteState.profileRestaurantId || "").trim(),
    String(safeRouteState.profileTopTab || "").trim().toLowerCase(),
    String(safeRouteState.profileAccessSource || "").trim().toLowerCase(),
    String(safeRouteState.profileTableNumber || "").trim(),
    String(safeRouteState.userRouteId || "").trim(),
    String(safeRouteState.userContentTab || "").trim().toLowerCase()
  ].join("|");
}

function clearProfileRouteQueryParams(searchParams) {
  setCanonicalRouteQueryParam(searchParams, "r", ROUTE_PROFILE_ID_QUERY_KEYS, "");
  setCanonicalRouteQueryParam(searchParams, "top", ROUTE_PROFILE_TOP_QUERY_KEYS, "");
  setCanonicalRouteQueryParam(searchParams, "src", ROUTE_PROFILE_ACCESS_SOURCE_QUERY_KEYS, "");
  setCanonicalRouteQueryParam(searchParams, "table", ROUTE_PROFILE_TABLE_QUERY_KEYS, "");
  setCanonicalRouteQueryParam(searchParams, "uid", ROUTE_USER_ID_QUERY_KEYS.slice(1), "");
  setCanonicalRouteQueryParam(searchParams, "handle", ROUTE_USER_HANDLE_QUERY_KEYS.filter((key) => key !== "handle"), "");
  setCanonicalRouteQueryParam(searchParams, "content", ROUTE_USER_CONTENT_QUERY_KEYS, "");
}

function syncActiveTabRouteQuery() {
  const win = typeof window === "undefined" ? null : window;
  if (!win || !win.history?.replaceState) return;
  const requestedHistoryMode = String(state?.__nextRouteHistoryMode || "").trim().toLowerCase();
  state.__nextRouteHistoryMode = "";
  const routeState = resolveRouteQueryStateForCurrentView();
  if (!routeState.tab && !routeState.authMode) return;
  try {
    const currentUrl = new URL(win.location?.href || "", win.location?.origin || "");
    const nextUrl = new URL(currentUrl.toString());
    const currentPathRoute = parseSiteRoutePathCore(currentUrl.pathname || "");
    if (
      routeState.routeKind === "business"
      && !String(routeState.canonicalPublicSlug || "").trim()
      && currentPathRoute.kind === "business"
      && currentPathRoute.isLegacy !== true
    ) {
      routeState.canonicalPublicSlug = String(currentPathRoute.restaurantId || "").trim().toLowerCase();
    }

    setCanonicalRouteQueryParam(nextUrl.searchParams, "tab", ["view"], "");

    if (routeState.routeKind === "auth" && routeState.authMode) {
      nextUrl.pathname = `/${routeState.authMode}`;
      clearProfileRouteQueryParams(nextUrl.searchParams);
    } else if (routeState.routeKind === "business" && routeState.canonicalPublicSlug) {
      nextUrl.pathname = buildCanonicalPublicBusinessPathCore({
        slug: routeState.canonicalPublicSlug,
        topTab: routeState.profileTopTab,
        contentTab: routeState.profileContentTab,
        accessSource: routeState.profileAccessSource,
        pathnameHint: currentPathRoute.kind === "business" ? currentUrl.pathname : ""
      }) || currentUrl.pathname;
      clearProfileRouteQueryParams(nextUrl.searchParams);
      setCanonicalRouteQueryParam(
        nextUrl.searchParams,
        "src",
        ROUTE_PROFILE_ACCESS_SOURCE_QUERY_KEYS,
        routeState.profileAccessSource
      );
      setCanonicalRouteQueryParam(
        nextUrl.searchParams,
        "table",
        ROUTE_PROFILE_TABLE_QUERY_KEYS,
        routeState.profileTableNumber > 0 ? String(routeState.profileTableNumber) : ""
      );
    } else if (routeState.routeKind === "business" && routeState.profileRestaurantId) {
      nextUrl.pathname = buildCanonicalAppTabPathCore(
        routeState.profileTopTab === "menu" ? "menu" : "profile",
        { pathnameHint: currentUrl.pathname }
      );
      clearProfileRouteQueryParams(nextUrl.searchParams);
      setCanonicalRouteQueryParam(nextUrl.searchParams, "r", ROUTE_PROFILE_ID_QUERY_KEYS, routeState.profileRestaurantId);
      setCanonicalRouteQueryParam(
        nextUrl.searchParams,
        "top",
        ROUTE_PROFILE_TOP_QUERY_KEYS,
        routeState.profileTopTab === "menu" ? "" : routeState.profileTopTab
      );
      setCanonicalRouteQueryParam(
        nextUrl.searchParams,
        "src",
        ROUTE_PROFILE_ACCESS_SOURCE_QUERY_KEYS,
        routeState.profileAccessSource
      );
      setCanonicalRouteQueryParam(
        nextUrl.searchParams,
        "table",
        ROUTE_PROFILE_TABLE_QUERY_KEYS,
        routeState.profileTableNumber > 0 ? String(routeState.profileTableNumber) : ""
      );
    } else if (routeState.routeKind === "user" && routeState.userRouteId) {
      nextUrl.pathname = buildCanonicalPublicUserPathCore({
        userId: routeState.userRouteId,
        contentTab: routeState.userContentTab,
        pathnameHint: currentPathRoute.kind === "user" ? currentUrl.pathname : ""
      }) || currentUrl.pathname;
      clearProfileRouteQueryParams(nextUrl.searchParams);
    } else {
      nextUrl.pathname = buildCanonicalAppTabPathCore(routeState.tab, {
        pathnameHint: currentUrl.pathname
      });
      clearProfileRouteQueryParams(nextUrl.searchParams);
    }

    const nextQuery = nextUrl.searchParams.toString();
    const nextRoute = `${nextUrl.pathname}${nextQuery ? `?${nextQuery}` : ""}${nextUrl.hash || ""}`;
    const currentRoute = `${currentUrl.pathname}${currentUrl.search || ""}${currentUrl.hash || ""}`;
    const routeKey = buildCurrentRouteSyncKey(nextUrl, routeState);
    if (currentRoute === nextRoute) {
      lastSyncedTabRouteKey = routeKey;
      return;
    }
    const shouldPushHistory = requestedHistoryMode === "push"
      && typeof win.history?.pushState === "function";
    if (shouldPushHistory) {
      win.history.pushState(win.history.state || {}, "", nextRoute);
    } else {
      win.history.replaceState(win.history.state || {}, "", nextRoute);
    }
    lastSyncedTabRouteKey = routeKey;
  } catch {}
}

const ENABLE_STARTUP_TIMELINE = (() => {
  if (typeof window === "undefined") return false;
  if (window.__MENYRA_SOCIAL_ENABLE_STARTUP_TIMELINE__ === true) return true;
  const hostname = String(window.location?.hostname || "").trim().toLowerCase();
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
  if (!isLocalHost) return false;
  try {
    const params = new URLSearchParams(window.location?.search || "");
    return params.get("debug-startup") === "1"
      || params.get("startupTimeline") === "1"
      || params.get("debugStartupTimeline") === "1";
  } catch {
    return false;
  }
})();
const STARTUP_TIMELINE_T0 = (
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now()
);

function markStartupTimeline(event = "", detail = {}) {
  if (!ENABLE_STARTUP_TIMELINE) return;
  if (typeof window === "undefined") return;
  const safeEvent = String(event || "").trim();
  if (!safeEvent) return;
  const nowPerf = typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();
  const deltaMs = Math.max(0, nowPerf - STARTUP_TIMELINE_T0);
  const timeline = Array.isArray(window.__MENYRA_SOCIAL_STARTUP_TIMELINE__)
    ? window.__MENYRA_SOCIAL_STARTUP_TIMELINE__
    : [];
  if (!Array.isArray(window.__MENYRA_SOCIAL_STARTUP_TIMELINE__)) {
    window.__MENYRA_SOCIAL_STARTUP_TIMELINE__ = timeline;
  }
  const entry = {
    event: safeEvent,
    deltaMs: Number(deltaMs.toFixed(1)),
    at: Date.now(),
    detail: detail && typeof detail === "object" ? detail : {}
  };
  timeline.push(entry);
  window.__MENYRA_SOCIAL_LAST_STARTUP_TIMELINE_EVENT__ = entry;
  try {
    console.debug(`[mnyra][startup] +${entry.deltaMs}ms ${safeEvent}`, entry.detail);
  } catch {}
}

if (ENABLE_STARTUP_TIMELINE && typeof window !== "undefined") {
  window.__MENYRA_SOCIAL_MARK_STARTUP_TIMELINE__ = markStartupTimeline;
}

function normalizeStartupSurfaceStatus(value = "", fallback = "ready") {
  return normalizeProfileSurfaceStatus(value, fallback);
}

function setStartupSurfaceStatus(surface = "", status = "ready") {
  if (!state.startupSurface || typeof state.startupSurface !== "object") {
    state.startupSurface = {
      active: "ready",
      activeSurface: "feed",
      profile: "ready",
      menu: "ready"
    };
  }
  const key = String(surface || "").trim().toLowerCase();
  if (!key) return;
  state.startupSurface[key] = normalizeStartupSurfaceStatus(status, "ready");
}

function resolveVisibleProfileSurfaceSnapshot(overrides = {}) {
  const snapshot = resolveVisibleProfileSurface(state, overrides);
  state.profileSurface = snapshot;
  return snapshot;
}

function resolveProfileStartupSurfaceStatus(surfaceSnapshot = null) {
  const snapshot = surfaceSnapshot || resolveVisibleProfileSurfaceSnapshot();
  return normalizeStartupSurfaceStatus(snapshot?.startup?.profileStatus || "", "loading");
}

function resolveMenuStartupSurfaceStatus({ strict = false, surfaceSnapshot = null } = {}) {
  const snapshot = surfaceSnapshot || resolveVisibleProfileSurfaceSnapshot();
  const status = normalizeStartupSurfaceStatus(snapshot?.startup?.menuStatus || "", strict ? "error" : "ready");
  if (!strict) return status;
  const restaurantId = String(snapshot?.target?.restaurantId || "").trim();
  if (!restaurantId && status === "ready") return "error";
  return status;
}

function resolveActiveStartupSurfaceSnapshot(surfaceSnapshot = null) {
  const activeTab = String(state.activeTab || "").trim().toLowerCase() || "feed";
  if (activeTab !== "profile") {
    return {
      surface: activeTab,
      status: "ready",
      activeTab,
      profileTopTab: ""
    };
  }
  const snapshot = surfaceSnapshot || resolveVisibleProfileSurfaceSnapshot();
  const profileTopTab = String(snapshot?.activeTopTab || normalizeProfileTopTabFromRouteCore(state.profileTopTab || "") || "profile").trim().toLowerCase();
  const activeSurface = String(snapshot?.startup?.activeSurface || "").trim().toLowerCase() || (profileTopTab === "menu" ? "menu" : "profile");
  const activeStatus = normalizeStartupSurfaceStatus(
    snapshot?.startup?.activeStatus || "",
    activeSurface === "menu"
      ? resolveMenuStartupSurfaceStatus({ strict: true, surfaceSnapshot: snapshot })
      : resolveProfileStartupSurfaceStatus(snapshot)
  );
  return {
    surface: activeSurface,
    status: activeStatus,
    activeTab,
    profileTopTab
  };
}

function syncStartupSurfaceStatus() {
  const surfaceSnapshot = resolveVisibleProfileSurfaceSnapshot();
  const snapshot = resolveActiveStartupSurfaceSnapshot(surfaceSnapshot);
  setStartupSurfaceStatus("profile", resolveProfileStartupSurfaceStatus(surfaceSnapshot));
  setStartupSurfaceStatus("menu", resolveMenuStartupSurfaceStatus({ surfaceSnapshot }));
  setStartupSurfaceStatus("active", snapshot.status);
  state.startupSurface.activeSurface = snapshot.surface;
  return snapshot;
}

const STARTUP_SNAPSHOT_STORAGE_KEY = "mnyra.social.startup-snapshot.v2";
const STARTUP_SNAPSHOT_MAX_BYTES = 180000;
const STARTUP_SNAPSHOT_ICON_RETRY_DELAY_MS = 800;
const STARTUP_SNAPSHOT_MAX_ICON_RETRIES = 3;
const ENABLE_STARTUP_SNAPSHOT = typeof window !== "undefined"
  && window.__MENYRA_SOCIAL_ENABLE_STARTUP_SNAPSHOT__ === true;
let startupSnapshotSaveToken = 0;

if (!ENABLE_STARTUP_SNAPSHOT && typeof window !== "undefined") {
  try {
    window.localStorage?.removeItem?.(STARTUP_SNAPSHOT_STORAGE_KEY);
  } catch {}
}

function buildStartupSnapshotRouteKey() {
  if (typeof window === "undefined") return "";
  try {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search || "");
    [
      "sw-reset",
      "cb",
      "debug-build",
      "sw-off"
    ].forEach((key) => params.delete(key));
    const query = params.toString();
    return `${currentUrl.pathname}?${query}${currentUrl.hash || ""}`;
  } catch {
    return `${window.location.pathname || "/"}?${window.location.search || ""}${window.location.hash || ""}`;
  }
}

function persistStartupSnapshot(iconRetryCount = 0) {
  if (!ENABLE_STARTUP_SNAPSHOT) return;
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const appRoot = document.getElementById("app");
  if (!appRoot) return;
  const activeTabKey = String(state.activeTab || "").trim().toLowerCase();
  if (!STARTUP_SNAPSHOT_ALLOWED_TABS.has(activeTabKey)) return;
  if (state.auth?.open) return;
  if (document.body?.classList?.contains("modal-open")) return;
  if (document.querySelector("#overlayRoot .modal-overlay")) return;
  if (appRoot.querySelector("i[data-lucide]")) {
    if (iconRetryCount < STARTUP_SNAPSHOT_MAX_ICON_RETRIES) {
      window.setTimeout(() => persistStartupSnapshot(iconRetryCount + 1), STARTUP_SNAPSHOT_ICON_RETRY_DELAY_MS);
    }
    return;
  }
  const html = String(appRoot.innerHTML || "");
  if (!html.trim() || html.length > STARTUP_SNAPSHOT_MAX_BYTES) return;
  try {
    window.localStorage?.setItem?.(STARTUP_SNAPSHOT_STORAGE_KEY, JSON.stringify({
      appVersion: String(window.__MENYRA_SOCIAL_APP_VERSION__ || ""),
      savedAt: Date.now(),
      routeKey: buildStartupSnapshotRouteKey(),
      html
    }));
  } catch {}
}

function scheduleStartupSnapshotPersist() {
  if (!ENABLE_STARTUP_SNAPSHOT) return;
  if (typeof window === "undefined") return;
  const token = ++startupSnapshotSaveToken;
  const run = () => {
    if (token !== startupSnapshotSaveToken) return;
    persistStartupSnapshot();
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 1500 });
    return;
  }
  window.setTimeout(run, 240);
}

if (typeof window !== "undefined") {
  window.addEventListener("menyra-social-icons-ready", () => {
    scheduleStartupSnapshotPersist();
  });
}

function render(...args) {
  const activeSurfaceSnapshot = syncStartupSurfaceStatus();
  const result = renderShell(...args);
  try {
    if (typeof window !== "undefined") {
      window.__MENYRA_SOCIAL_APP_MOUNTED__ = true;
    }
    const appRoot = typeof document === "undefined" ? null : document.getElementById("app");
    if (appRoot) {
      appRoot.removeAttribute("aria-busy");
      appRoot.dataset.startupShell = "0";
      appRoot.dataset.startupSnapshot = "0";
    }
  } catch {}
  if (
    !startupFirstFinalSurfaceRenderMarked
    && STARTUP_SURFACE_FINAL_STATUSES.has(String(activeSurfaceSnapshot?.status || "").trim().toLowerCase())
  ) {
    startupFirstFinalSurfaceRenderMarked = true;
    markStartupTimeline("first final surface render", {
      surface: String(activeSurfaceSnapshot?.surface || "").trim().toLowerCase() || "feed",
      status: String(activeSurfaceSnapshot?.status || "").trim().toLowerCase() || "ready",
      tab: String(activeSurfaceSnapshot?.activeTab || "").trim().toLowerCase() || "feed",
      topTab: String(activeSurfaceSnapshot?.profileTopTab || "").trim().toLowerCase()
    });
  }
  syncActiveTabRouteQuery();
  scheduleStartupSnapshotPersist();
  return result;
}
requestRuntimeUiRefresh = () => {
  if (!shellRuntimeController) {
    runtimeUiRefreshPending = true;
    return;
  }
  runtimeUiRefreshPending = false;
  render();
};

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
    pathname: typeof window !== "undefined" ? window.location?.pathname || "" : "",
    normalizeInitialTab,
    normalizeAuthMode
  });
  markStartupTimeline("route parsed", {
    pendingInitialTab: String(initialRouteState?.pendingInitialTab || "").trim().toLowerCase(),
    pendingProfileRestaurantId: String(initialRouteState?.pendingProfileRestaurantId || "").trim(),
    pendingProfileTopTab: String(initialRouteState?.pendingProfileTopTab || "").trim().toLowerCase()
  });
  pendingRouteState.applyInitialRouteState(initialRouteState);
  markStartupTimeline("pending route applied", {
    pendingInitialTab: String(pendingRouteState.getPendingInitialTab?.() || "").trim().toLowerCase(),
    pendingProfileRestaurantId: String(pendingRouteState.getPendingState?.()?.pendingProfileRestaurantId || "").trim()
  });
  const hasPendingProfileRoute = !!normalizePendingProfileRestaurantIdCore(initialRouteState?.pendingProfileRestaurantId || "");
  const eagerInitialTab = sanitizeTabForSessionCore(initialRouteState?.pendingInitialTab, {
    user: state.user,
    hasProfileView: hasPendingProfileRoute || !!state.profileView,
    guestScopeUid: getGuestScopeUid()
  });
  if (String(eagerInitialTab || "").trim()) {
    state.activeTab = eagerInitialTab;
  }
} catch {}

function isGuestSession() {
  return isGuestSessionCore(state.user);
}

function isAuthRestorePendingProtectedRoute(tab = state.activeTab, { hasProfileView = !!state.profileView } = {}) {
  const requestedTab = String(tab || "").trim().toLowerCase();
  if (!AUTH_RESTORE_PRESERVED_TABS.has(requestedTab)) return false;
  if (state.user) return false;
  if (authInitialized) return false;
  if (requestedTab === "profile" && hasProfileView) return true;
  const snapshotUid = String(authBootstrapSnapshot?.uid || "").trim();
  const profileUid = String(state.userProfile?.uid || "").trim();
  const profileRestaurantId = String(state.userProfile?.restaurantId || "").trim();
  return !!(snapshotUid || profileUid || profileRestaurantId);
}

function sanitizeTabForSession(tab, { hasProfileView = !!state.profileView } = {}) {
  if (isAuthRestorePendingProtectedRoute(tab, { hasProfileView })) {
    return String(tab || "").trim().toLowerCase() || "feed";
  }
  return sanitizeTabForSessionCore(tab, {
    user: state.user,
    hasProfileView,
    guestScopeUid: getGuestScopeUid()
  });
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
  applyPendingInitialRouteState: applyPendingInitialRouteStateBase,
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
  getGuestScopeUid: () => getGuestScopeUid(),
  pendingRouteState
});
function normalizeLegacyHomeTab(tab) {
  const nextTab = String(tab || "").trim().toLowerCase();
  if (nextTab !== "home") return tab;
  return "feed";
}

const publicProfileDirectEntryController = createPublicProfileDirectEntryController({
  state,
  resolveVisibleProfileSurface
});

function applyPendingInitialRouteState() {
  const prevActiveTab = String(state.activeTab || "").trim().toLowerCase() || "feed";
  const interactivePrimeUid = String(state.__authInteractivePrimeUid || "").trim();
  const currentUid = String(state.user?.uid || "").trim();
  const interactivePrimeAt = Number(state.__authInteractivePrimeAt || 0);
  const hasFreshInteractivePrime = !!(
    interactivePrimeUid
    && currentUid
    && interactivePrimeUid === currentUid
    && Number.isFinite(interactivePrimeAt)
    && interactivePrimeAt > 0
    && (Date.now() - interactivePrimeAt) <= 15000
  );
  applyPendingInitialRouteStateBase();
  if (hasFreshInteractivePrime) {
    const pendingAfterBase = pendingRouteState.getPendingState?.() || {};
    const hasExplicitOpenTarget = !!(
      String(pendingAfterBase.pendingNotificationId || "").trim()
      || String(pendingAfterBase.pendingPostId || "").trim()
      || String(pendingAfterBase.pendingChatUid || "").trim()
    );
    if (!hasExplicitOpenTarget) {
      state.activeTab = sanitizeTabForSession(prevActiveTab, {
        hasProfileView: !!state.profileView
      });
      pendingRouteState.setPendingInitialTab?.("");
      pendingRouteState.patchPendingState?.({
        pendingProfileRestaurantId: "",
        pendingProfileTopTab: "",
        pendingProfileAccessSource: "",
        pendingProfileTableNumber: 0,
        pendingUserRouteId: "",
        pendingUserContentTab: "",
        pendingProfileHandled: true
      });
    }
  }
  const pendingInitialTab = String(pendingRouteState.getPendingInitialTab?.() || "").trim().toLowerCase();
  if (isAuthRestorePendingProtectedRoute(pendingInitialTab)) {
    state.activeTab = pendingInitialTab;
  }
  const pendingRoute = pendingRouteState.getPendingState?.() || {};
  const pendingDirectEntry = publicProfileDirectEntryController.resolvePendingDirectEntry(pendingRoute);
  if (pendingDirectEntry.active) {
    const currentProfileView = state.profileView && typeof state.profileView === "object"
      ? state.profileView
      : null;
    const currentProfileRestaurantId = String(state.profileView?.profile?.restaurantId || "").trim();
    const currentProfileTruthState = String(state.profileView?.profile?.truthState || "").trim().toLowerCase();
    const currentProfileTopTab = String(state.profileTopTab || "").trim().toLowerCase();
    const currentProfileContentTab = String(state.profileContentTab || "").trim().toLowerCase();
    const currentBusinessSurfaceTopTab = currentProfileTopTab === "menu" ? "menu" : "profile";
    const pendingBusinessSurfaceTopTab = pendingDirectEntry.topTab === "menu" ? "menu" : "profile";
    const currentBusinessSurfaceContentTab = currentBusinessSurfaceTopTab === "menu"
      ? "menu"
      : (currentProfileContentTab === "media" ? "media" : "posts");
    const pendingBusinessSurfaceContentTab = pendingBusinessSurfaceTopTab === "menu"
      ? "menu"
      : (String(pendingDirectEntry.contentTab || "").trim().toLowerCase() === "media" ? "media" : "posts");
    const currentDirectEntry = currentProfileView?.directEntry && typeof currentProfileView.directEntry === "object"
      ? currentProfileView.directEntry
      : null;
    const isPendingRouteSeedContinuation = String(currentDirectEntry?.owner || "").trim().toLowerCase() === "web-direct"
      && currentDirectEntry?.routeFirst === true
      && currentDirectEntry?.active !== false
      && currentProfileRestaurantId === pendingDirectEntry.restaurantId;
    const pendingProfileAlreadyOpen = isPendingProfileAlreadyOpenCore({
      pendingProfileRestaurantId: pendingDirectEntry.restaurantId,
      currentProfileRestaurantId,
      currentProfileTruthState
    })
      && !isPendingRouteSeedContinuation
      && currentBusinessSurfaceTopTab === pendingBusinessSurfaceTopTab
      && currentBusinessSurfaceContentTab === pendingBusinessSurfaceContentTab;
    if (!pendingProfileAlreadyOpen) {
      setStartupSurfaceStatus("profile", "loading");
      if (pendingDirectEntry.topTab === "menu") {
        setStartupSurfaceStatus("menu", "loading");
        state.startupSurface.activeSurface = "menu";
      } else {
        state.startupSurface.activeSurface = "profile";
      }
      setStartupSurfaceStatus("active", "loading");
      publicProfileDirectEntryController.seedPendingDirectEntry(pendingRoute, {
        phase: "seeded"
      });
      const seededSurfaceSnapshot = resolveVisibleProfileSurfaceSnapshot({
        profileView: state.profileView,
        profileTopTab: state.profileTopTab,
        profileContentTab: state.profileContentTab
      });
      if (pendingDirectEntry.postsFirst && String(seededSurfaceSnapshot?.posts?.status || "").trim().toLowerCase() === "ready") {
        setStartupSurfaceStatus("profile", "ready");
        setStartupSurfaceStatus("active", "ready");
      }
      if (pendingDirectEntry.menuFirst && String(seededSurfaceSnapshot?.menu?.status || "").trim().toLowerCase() === "ready") {
        setStartupSurfaceStatus("menu", "ready");
        setStartupSurfaceStatus("active", "ready");
      }
    } else {
      publicProfileDirectEntryController.writeWebDirectEntryState(pendingDirectEntry, {
        active: pendingDirectEntry.webPriority === true,
        phase: "loading"
      });
    }
  } else {
    publicProfileDirectEntryController.writeWebDirectEntryState({}, {
      active: false,
      phase: ""
    });
  }
  const activeTabKey = String(state.activeTab || "").trim().toLowerCase();
  if (activeTabKey === "home") state.activeTab = "feed";
}
const {
  normalizeLeadCountry,
  createDefaultLeadPricing,
  normalizeLeadPricing,
  normalizeLeadSettings,
  getLeadSettingsConfig,
  getLeadCountryCenter,
  getLeadMonthlyPrice,
  getLeadPriceForCycle,
  buildLeadAccountEmail,
  buildLeadContactName,
  inferLeadCountryFromText,
  normalizeLeadStatusKey,
  leadStatusLabel,
  leadTypeLabel,
  resolveCustomerType,
  customerStatusLabel,
  isCustomerRestaurant,
  hasLeadLocationCoords,
  createLeadLocation,
  normalizeCoordPair,
  preferStableCoords,
  resolveCoordsFromShape,
  resolveCoordsFromEntity,
  extractPlusCodeFromText,
  isLikelyFullPlusCode,
  isLikelyShortPlusCode,
  olcDecodeFullPlusCode,
  olcEncodePairPrefix,
  olcRecoverShortCode,
  resolvePlusCodeReferenceCoords,
  geocodeReferenceSearch,
  parsePlusCodeFromAddressInput,
  parseCoordsFromAddressInputAsync,
  parseCoordsFromAddressInput,
  normalizeLeadLocations,
  getPrimaryLeadLocation
} = createCrmLeadGeoSupportRuntime({
  state,
  constants: {
    ceoCountries: CEO_COUNTRIES,
    defaultCountry: LEAD_SETTINGS_DEFAULT_COUNTRY,
    countryCenters: LEAD_COUNTRY_CENTERS,
    defaultCenter: PRISHTINA_COORDS,
    leadTypeOrder: LEAD_TYPE_ORDER,
    leadTypeLabels: LEAD_TYPE_LABELS,
    leadStatusLabels: LEAD_STATUS_LABELS
  },
  utilityApi: {
    normalizeSearchKeyFn: normalizeSearchKey,
    fetchFn: typeof fetch === "function" ? fetch : null
  }
});
const {
  createLeadScopeMap,
  createCustomerScopeMap,
  normalizeLeadScopeKey,
  normalizeCustomerScopeKey,
  uniqueStringList,
  buildCeoName,
  normalizeCeoCountry,
  normalizeCeoPath,
  getCurrentCeoMeta,
  isCeoUser,
  isAlbertCeoUser,
  hasGlobalCeoAccess,
  getCeoGpsOverride,
  readLeadScopeCache,
  writeLeadScopeCache,
  readCustomerScopeCache,
  writeCustomerScopeCache,
  normalizeCeoStaffRecord,
  canViewCeoRecord,
  hydrateStaffRecordsFromUserProfiles,
  canCurrentCeoSeeRow,
  isCurrentCeoOwnRow,
  createEmptyCeoCrmCounts,
  sanitizeCeoCrmCounts,
  hasStoredCeoCrmCounts,
  resolveKnownScopeCountLabel,
  renderCeoScopeTabs,
  renderOwnershipPills,
  buildCeoCreatorMeta,
  resolveStoredCeoCreatorMeta,
  buildLeadCrmContribution,
  buildCustomerCrmContribution,
  accumulateCeoCrmDelta,
  applyCeoCrmCountDeltas,
  ensureCeoCrmCountsLoaded,
  getCeoCrmCountsPromise,
  syncCeoDirectoryProfilePatch,
  pickCountValue
} = createCrmCeoScopeSupportRuntime({
  state,
  dataLoaded,
  constants: {
    ceoCountries: CEO_COUNTRIES,
    crmPagesTtlMs: CACHE_TTL_MS.crmPages,
    albertCeoUid: ALBERT_CEO_UID,
    albertCeoAliases: ALBERT_CEO_ALIASES,
    albertCeoEmails: ALBERT_CEO_EMAILS
  },
  firebaseApi: {
    db,
    collectionFn: collection,
    queryFn: query,
    whereFn: where,
    getDocsFn: getDocs,
    getDocFn: getDoc,
    docFn: doc,
    setDocFn: setDoc,
    incrementFn: increment,
    serverTimestampFn: serverTimestamp,
    documentIdFn: documentId
  },
  renderApi: {
    renderFn: render,
    toDateSafeFn: toDateSafe,
    escapeHtmlFn: escapeHtml
  },
  storageApi: {
    readCacheFn: readCache,
    writeCacheFn: writeCache,
    leadPageCacheKeyFn: leadPageCacheKey,
    customerPageCacheKeyFn: customerPageCacheKey,
    saveUserProfileToStorageFn: saveUserProfileToStorage
  },
  profileApi: {
    normalizeRoleListFn: normalizeRoleList,
    normalizeEmailValueFn: normalizeEmailValue,
    normalizeHandleFn: normalizeHandle
  },
  leadApi: {
    normalizeLeadStatusKeyFn: normalizeLeadStatusKey,
    isCustomerRestaurantFn: isCustomerRestaurant
  },
  crmApi: {
    normalizeLeadDocFn: (...args) => crmRuntimeController?.normalizeLeadDoc?.(...args) || (args[0] || {}),
    applyKnownLeadOwnershipOverrideFn: (...args) => crmRuntimeController?.applyKnownLeadOwnershipOverride?.(...args) || (args[0] || {}),
    isHiddenLegacyCeoEmailFn: (...args) => crmRuntimeController?.isHiddenLegacyCeoEmail?.(...args) || false
  }
});
const feedVisibilityRuntimeCluster = createFeedVisibilityRuntimeCluster({
  state,
  firebaseApi: {
    db,
    collectionFn: collection,
    queryFn: query,
    orderByFn: orderBy,
    limitFn: limit,
    getDocsFn: getDocs
  },
  constants: {
    fastLimits: FAST_LIMITS
  },
  visibilityApi: {
    isForceHiddenUidFn: isForceHiddenUid,
    isForceHiddenHandleFn: isForceHiddenHandle,
    isForceHiddenBusinessEntityFn: isForceHiddenBusinessEntity,
    isPublicBusinessRecordFn: isPublicBusinessRecord
  },
  utilityApi: {
    formatRelativeFn: formatRelative,
    toDateSafeFn: toDateSafe
  }
});
const {
  canShowFeedRestaurantId,
  normalizeFeedPost,
  buildStoriesRowSignature,
  loadUserPostsForUser
} = feedVisibilityRuntimeCluster;

const profileIdentityRuntimeCluster = createProfileIdentityRuntimeCluster({
  state,
  firebaseApi: {
    db,
    collectionFn: collection,
    collectionGroupFn: collectionGroup,
    queryFn: query,
    whereFn: where,
    orderByFn: orderBy,
    limitFn: limit,
    docFn: doc,
    getDocFn: getDoc,
    getDocFromServerFn: getDocFromServer,
    getDocsFn: getDocs,
    onSnapshotFn: onSnapshot,
    setDocFn: setDoc,
    serverTimestampFn: serverTimestamp,
    updateProfileFn: updateProfile
  },
  browserApi: {
    documentObj: typeof document === "undefined" ? null : document,
    windowObj: typeof window === "undefined" ? null : window,
    queueMicrotaskFn: typeof queueMicrotask === "function" ? queueMicrotask : null
  },
  storageApi: {
    safeStorageObj: safeStorage,
    logoCacheKey: STORAGE_KEYS.logoCache,
    avatarKey,
    readCacheFn: readCache,
    writeCacheFn: writeCache,
    cacheKeys: CACHE_KEYS,
    cacheTtlMs: CACHE_TTL_MS
  },
  constants: {
    brandUi: BRAND_UI,
    fastMode: FAST_MODE,
    fastLimits: FAST_LIMITS,
    placeholderImage: PLACEHOLDER_IMAGE,
    commentAvatarRemoteFetchEnabled: COMMENT_AVATAR_REMOTE_FETCH_ENABLED,
    roleSwitchOrder: ROLE_SWITCH_ORDER
  },
  renderApi: {
    renderFn: render,
    updateShellDomFn: updateShellDom,
    updateFeedDomFn: (...args) => bridgeShellRuntimeCluster?.bridgeBindings?.updateFeedDom?.(...args) || false,
    refreshSearchViewFn: (...args) => bridgeShellRuntimeCluster?.bridgeBindings?.refreshSearchView?.(...args) || false,
    getLastRenderModeFn: () => lastRenderMode,
    buildRestaurantLocationsFn: (...args) => bridgeShellRuntimeCluster?.bridgeBindings?.buildRestaurantLocations?.(...args) || []
  },
  profileApi: {
    resolvePreferredHandleFn: resolvePreferredHandle,
    pickCountValueFn: pickCountValue,
    normalizeRestaurantTypeFn: normalizeRestaurantType,
    normalizeHandleFn: normalizeHandle,
    sanitizeDisplayNameFn: sanitizeDisplayName,
    isPublicBusinessRecordFn: isPublicBusinessRecord,
    matchesRestaurantIdentityFn: matchesRestaurantIdentity,
    normalizeEmailValueFn: normalizeEmailValue,
    normalizeRoleListFn: normalizeRoleList,
    normalizeLeadLocationsFn: normalizeLeadLocations,
    getPrimaryLeadLocationFn: getPrimaryLeadLocation,
    hasLeadLocationCoordsFn: hasLeadLocationCoords,
    resolveCustomerTypeFn: resolveCustomerType,
    resolveRestaurantStatusFromLeadFn: (leadStatus, currentStatus = "") => crmRuntimeController?.resolveRestaurantStatusFromLead?.(leadStatus, currentStatus) ?? String(leadStatus || currentStatus || "").trim(),
    ensureRestaurantPublicMetaFn: async (...args) => await crmRuntimeController?.ensureRestaurantPublicMeta?.(...args),
    isRestaurantMarkedDeletedFn: isRestaurantMarkedDeleted,
    saveUserProfileToStorageFn: saveUserProfileToStorage,
    writeAuthBootstrapSnapshotFn: writeAuthBootstrapSnapshot,
    saveSettingsFn: saveSettings,
    getOptimizedImageUrlFn: getOptimizedImageUrl,
    isPlaceholderUrlFn: isPlaceholderUrl,
    uploadCompressedImageFn: uploadCompressedImage,
    ensureUserProfileFn: ensureUserProfile,
    ensurePostMetaFn: ensurePostMeta,
    resolveUserByHandleFn: resolveUserByHandle,
    syncCeoDirectoryProfilePatchFn: syncCeoDirectoryProfilePatch,
    normalizeLeadSettingsFn: normalizeLeadSettings,
    normalizeCeoCountryFn: normalizeCeoCountry,
    normalizeCeoPathFn: normalizeCeoPath,
    hasStoredCeoCrmCountsFn: hasStoredCeoCrmCounts,
    sanitizeCeoCrmCountsFn: sanitizeCeoCrmCounts,
    isLocalBusinessProfileFn: isLocalBusinessProfile,
    isCeoUserFn: isCeoUser,
    getVerifiedMapLocationFn: (...args) => crmRuntimeController?.getVerifiedMapLocation?.(...args) || null,
    getCeoGpsOverrideFn: getCeoGpsOverride,
    canShowFeedRestaurantIdFn: canShowFeedRestaurantId,
    escapeSelectorFn: escapeSelector,
    toDateSafeFn: toDateSafe
  },
  storyApi: {
    getStorySystemController: () => bridgeShellRuntimeCluster?.storySystemController || null
  }
});
selfProfileRuntimeController = profileIdentityRuntimeCluster.selfProfileRuntimeController;
const {
  getProfileViewUnsub,
  setProfileViewUnsub,
  stopProfileViewListener,
  showPublicProfile,
  normalizeExternalProfile,
  normalizeExternalUserProfile,
  fetchBusinessProfileDoc,
  loadBusinessPostsForRestaurant,
  collectFeedHydrationIds,
  queueStoryIdentityHydration,
  hydrateRestaurantsByIds,
  mergeRestaurants,
  rebuildBusinessLocations,
  stopRestaurantMetaListeners,
  ensureFeedRestaurantMetaListeners,
  enrichRestaurantsWithPublicMeta,
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
  buildStoriesFromFeed,
  findRestaurantByUid,
  findRestaurantByEmail,
  resolveLeadByUid,
  resolveLeadByEmail,
  findRestaurantByLeadId,
  ensureRestaurantForLead,
  resolveRestaurantForAuthUser,
  resolveRoleSwitchTargets,
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
  persistPrivateAccountSetting,
  loadUserProfile,
  loadBusinessProfile,
  loadBusinessStaffProfile,
  loadAuthProfile
} = profileIdentityRuntimeCluster;
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
  getVerifiedMapLocationFn: (...args) => crmRuntimeController?.getVerifiedMapLocation?.(...args) || null,
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
  getDocFn: getDoc,
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
  getLastRenderModeFn: () => lastRenderMode,
  safeStorageObj: safeStorage,
  guestScopeUid: getGuestScopeUid(),
  resolveGuestScopeUidFn: () => getGuestScopeUid()
});

const crmDomainRuntimeCluster = createCrmDomainRuntimeCluster({
  stateDeps: { state, dataLoaded },
  constants: {
    LEAD_SETTINGS_DEFAULT_COUNTRY,
    CEO_COUNTRIES,
    LEAD_TYPE_ORDER,
    LEAD_TYPE_LABELS,
    LEAD_STATUS_ORDER,
    LEAD_STATUS_LABELS,
    PLACEHOLDER_IMAGE,
    CRM_LAZY_RENDERERS_MODULE_URL,
    BUILD_INFO_ENDPOINT_URL,
    enqueueMicrotaskCore,
    PRISHTINA_COORDS,
    CRM_PAGE_SIZE,
    CACHE_KEYS,
    HIDDEN_LEGACY_CEO_EMAILS,
    MILAN_OWNED_LEAD_EMAILS,
    MILAN_OWNED_LEAD_BUSINESSES,
    ALBERT_OWNED_LEAD_EMAILS,
    ALBERT_OWNED_LEAD_BUSINESSES
  },
  renderApi: {
    icon,
    escapeHtml,
    render,
    renderOverlays: (...args) => bridgeShellRuntimeCluster?.bridgeBindings?.renderOverlays?.(...args),
    renderCrmLazyLoadingView,
    renderCeoGuardCore,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    ensureLeafletLoaded: (...args) => bridgeShellRuntimeCluster?.bridgeBindings?.ensureLeafletLoaded?.(...args),
    alert: typeof alert === "function" ? alert : () => {},
    confirm: typeof confirm === "function" ? confirm : () => false
  },
  leadApi: {
    getLeadSettingsConfig,
    resolveCustomerType,
    normalizeSearchKey,
    normalizeLeadStatusKey,
    normalizeLeadScopeKey,
    normalizeCustomerScopeKey,
    createLeadScopeMap,
    createCustomerScopeMap,
    leadStatusLabel,
    leadTypeLabel,
    customerStatusLabel,
    isCustomerRestaurant,
    toDateSafe,
    getLeadCountryCenter,
    getLeadMonthlyPrice,
    resolveCurrencyCodeFromLeadCountry,
    buildLeadAccountEmail,
    normalizeLeadCountry,
    buildLeadContactName,
    normalizeHandle,
    inferLeadCountryFromText,
    getLeadPriceForCycle,
    normalizeLeadSettings,
    normalizeRestaurantType,
    uniqueStringList,
    findRestaurantByUid,
    findRestaurantByEmail,
    normalizeEmailValue
  },
  geoApi: {
    normalizeLeadLocations,
    hasLeadLocationCoords,
    extractPlusCodeFromText,
    isLikelyShortPlusCode,
    parseCoordsFromAddressInputAsync,
    createLeadLocation,
    getPrimaryLeadLocation,
    resolveCoordsFromEntity,
    preferStableCoords,
    normalizeCoordPair,
    parseCoordsFromAddressInput
  },
  firebaseApi: {
    setDoc,
    doc,
    db,
    serverTimestamp,
    collection,
    query,
    where,
    limit,
    getDocs,
    getDoc,
    deleteDoc
  },
  authApi: {
    getApps,
    initializeApp,
    app,
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
  },
  cacheApi: {
    saveUserProfileToStorage,
    mergeRestaurants,
    rebuildBusinessLocations,
    readLeadScopeCache,
    writeLeadScopeCache,
    readCustomerScopeCache,
    writeCustomerScopeCache,
    menuCache,
    menuCacheKey,
    focusCache,
    focusCacheKey,
    businessPostsKey,
    writeCache,
    saveFeedPosts,
    readCache,
    buildStoriesSignature,
    setFeedStoriesSignature: (next) => setFeedStoriesSignature(next)
  },
  ceoApi: {
    isCeoUser,
    sanitizeCeoCrmCounts,
    hasStoredCeoCrmCounts,
    resolveKnownScopeCountLabel,
    getCurrentCeoMeta,
    normalizeCeoCountry,
    getCeoGpsOverride,
    normalizeCeoPath,
    hasGlobalCeoAccess,
    canCurrentCeoSeeRow,
    isCurrentCeoOwnRow,
    ensureCeoCrmCountsLoaded,
    getCeoCrmCountsPromise,
    normalizeCeoStaffRecord,
    canViewCeoRecord,
    hydrateStaffRecordsFromUserProfiles,
    buildCeoName,
    createEmptyCeoCrmCounts,
    buildLeadCrmContribution,
    buildCustomerCrmContribution,
    resolveStoredCeoCreatorMeta,
    accumulateCeoCrmDelta,
    applyCeoCrmCountDeltas,
    normalizeRoleList,
    isAlbertCeoUser,
    buildCeoCreatorMeta,
    renderCeoScopeTabs,
    renderOwnershipPills
  },
  modalApi: {
    saveCeoStaffFromViewCore,
    uploadCompressedImage,
    saveLeadFromModalCore,
    deleteLeadFromModalCore,
    saveCustomerFromModalCore,
    convertLeadToCustomerCore,
    closeLeadModal: (...args) => bridgeShellRuntimeCluster?.bridgeBindings?.closeLeadModal?.(...args),
    closeCustomerModal: (...args) => bridgeShellRuntimeCluster?.bridgeBindings?.closeCustomerModal?.(...args)
  }
});
crmRuntimeController = crmDomainRuntimeCluster.crmRuntimeController;
const {
  queueCrmLazyRenderersPrefetch,
  renderLeadsView,
  isLeadInlineCreateView,
  renderLeadEditorUi,
  refineLeadLocationAddressIndex,
  renderLeadSettingsView,
  renderLeadCreationView,
  resetLeadDraft,
  createLeadDraftState,
  openLeadCreator,
  openLeadSettingsView,
  closeLeadSubview,
  saveLeadSettings,
  getLeadPlusCodeReference,
  hydrateLeadGeoFieldsFromCoords,
  syncLeadDerivedFields,
  renderCustomersView,
  renderStaffEditorView,
  renderStaffView,
  ensureLocationPickerModal,
  bindLocationPickerEvents,
  openLocationPicker,
  closeLocationPicker,
  confirmLocation,
  getVerifiedMapLocation,
  setVerifiedMapLocation,
  clearVerifiedMapLocation,
  createAuthUser,
  ensureRestaurantPublicMeta,
  normalizeLeadDoc,
  normalizeLeadFromRestaurant,
  resolveRestaurantStatusFromLead,
  loadLeads,
  loadCustomers,
  isHiddenLegacyCeoEmail,
  applyKnownLeadOwnershipOverride,
  getStaffFormEmail,
  syncStaffDerivedEmailField,
  openStaffEditor,
  closeStaffEditor,
  syncStaffFormFromDom,
  loadCeoStaff,
  saveCeoStaffFromView,
  deleteCeoStaffFromView,
  syncLeadModalDraftFromForm,
  addLeadModalLocationRow,
  removeLeadModalLocationRow,
  saveLeadFromModal,
  deleteLeadFromModal,
  saveCustomerFromModal,
  convertLeadToCustomer
} = crmDomainRuntimeCluster;

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

function getCatalogProfileByRestaurantId(restaurantId = "") {
  const rid = String(restaurantId || "").trim();
  if (!rid) return null;
  if (String(state.profileView?.profile?.restaurantId || "").trim() === rid) return state.profileView.profile;
  if (String(state.userProfile?.restaurantId || "").trim() === rid) return state.userProfile;
  return null;
}

function getLeadMetaByRestaurantId(restaurantId = "") {
  const rid = String(restaurantId || "").trim();
  if (!rid) return null;
  const leads = Array.isArray(state.leads?.items) ? state.leads.items : [];
  return leads.find((lead) => String(lead?.restaurantId || "").trim() === rid) || null;
}

function getLeadMetaById(leadId = "") {
  const lid = String(leadId || "").trim();
  if (!lid) return null;
  const leads = Array.isArray(state.leads?.items) ? state.leads.items : [];
  return leads.find((lead) => String(lead?.id || "").trim() === lid) || null;
}

function getCustomerMetaByRestaurantId(restaurantId = "") {
  const rid = String(restaurantId || "").trim();
  if (!rid) return null;
  const customers = Array.isArray(state.customers?.items) ? state.customers.items : [];
  return customers.find((customer) => String(customer?.id || customer?.restaurantId || "").trim() === rid) || null;
}

function resolveCurrencyCodeForMenuItem(item = null, { restaurantId = "" } = {}) {
  const record = item && typeof item === "object" ? item : {};
  const explicitItemCurrency = normalizeCurrencyCode(
    record.currencyCode || record.currency || record.currency_code || "",
    ""
  );
  if (explicitItemCurrency) return explicitItemCurrency;

  const resolvedRestaurantId = String(
    restaurantId
      || record.restaurantId
      || state.menuDetail?.restaurantId
      || state.menu.restaurantId
      || state.profileView?.profile?.restaurantId
      || state.userProfile?.restaurantId
      || ""
  ).trim();
  const restaurantMeta = resolvedRestaurantId ? getRestaurantMetaById(resolvedRestaurantId) : null;
  const catalogProfile = getCatalogProfileByRestaurantId(resolvedRestaurantId);
  const leadMeta = getLeadMetaByRestaurantId(resolvedRestaurantId);
  const leadMetaById = getLeadMetaById(record.leadId || record.lead || "");
  const customerMeta = getCustomerMetaByRestaurantId(resolvedRestaurantId);
  return resolveEntityCurrencyCode({
    currencyCode: restaurantMeta?.currencyCode
      || restaurantMeta?.currency
      || catalogProfile?.currencyCode
      || catalogProfile?.currency
      || leadMeta?.currencyCode
      || leadMeta?.currency
      || leadMetaById?.currencyCode
      || leadMetaById?.currency
      || customerMeta?.currencyCode
      || customerMeta?.currency
      || "",
    country: record.country
      || restaurantMeta?.country
      || catalogProfile?.country
      || leadMeta?.country
      || leadMetaById?.country
      || customerMeta?.country
      || ""
  }, "EUR");
}

function resolveHeaderBranding() {
  return {
    title: BRAND_UI.upper,
    subtitle: "Social",
    logoUrl: resolveShellAvatarUrl(),
    isBusinessLogo: isLocalBusinessProfile(state.userProfile)
  };
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

function saveShopCartToStorage(uid = state.user?.uid || getGuestScopeUid()) {
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
    currentUserRestaurantId: state.userProfile?.restaurantId || "",
    allowOwnRestaurantOrdering: isCeoUser() || hasGlobalCeoAccess()
  });
}

function coerceMenuItemsFromData(data) {
  return coerceMenuItemsFromDataCore({
    data,
    normalizeMenuItemDoc
  });
}

const INLINE_LUCIDE_SVG_ATTRS = Object.freeze({
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
});

const INLINE_LUCIDE_ICON_NODES = Object.freeze({
  "plus": Object.freeze([["path", { d: "M5 12h14" }], ["path", { d: "M12 5v14" }]]),
  "map-pin": Object.freeze([["path", { d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" }], ["circle", { cx: "12", cy: "10", r: "3" }]]),
  "user": Object.freeze([["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }], ["circle", { cx: "12", cy: "7", r: "4" }]]),
  "x": Object.freeze([["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]]),
  "heart": Object.freeze([["path", { d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" }]]),
  "arrow-left": Object.freeze([["path", { d: "m12 19-7-7 7-7" }], ["path", { d: "M19 12H5" }]]),
  "search": Object.freeze([["circle", { cx: "11", cy: "11", r: "8" }], ["path", { d: "m21 21-4.3-4.3" }]]),
  "chevron-down": Object.freeze([["path", { d: "m6 9 6 6 6-6" }]]),
  "lock": Object.freeze([["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }], ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }]]),
  "check-circle-2": Object.freeze([["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "m9 12 2 2 4-4" }]]),
  "bell": Object.freeze([["path", { d: "M10.268 21a2 2 0 0 0 3.464 0" }], ["path", { d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" }]]),
  "settings": Object.freeze([["path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }], ["circle", { cx: "12", cy: "12", r: "3" }]]),
  "check": Object.freeze([["path", { d: "M20 6 9 17l-5-5" }]]),
  "message-circle": Object.freeze([["path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" }]]),
  "arrow-right": Object.freeze([["path", { d: "M5 12h14" }], ["path", { d: "m12 5 7 7-7 7" }]]),
  "loader-2": Object.freeze([["path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }]]),
  "log-in": Object.freeze([["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" }], ["polyline", { points: "10 17 15 12 10 7" }], ["line", { x1: "15", x2: "3", y1: "12", y2: "12" }]]),
  "globe": Object.freeze([["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }], ["path", { d: "M2 12h20" }]]),
  "shopping-bag": Object.freeze([["path", { d: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" }], ["path", { d: "M3 6h18" }], ["path", { d: "M16 10a4 4 0 0 1-8 0" }]]),
  "menu": Object.freeze([["line", { x1: "4", x2: "20", y1: "12", y2: "12" }], ["line", { x1: "4", x2: "20", y1: "6", y2: "6" }], ["line", { x1: "4", x2: "20", y1: "18", y2: "18" }]]),
  "home": Object.freeze([["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }], ["path", { d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }]]),
  "map": Object.freeze([["path", { d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" }], ["path", { d: "M15 5.764v15" }], ["path", { d: "M9 3.236v15" }]]),
  "shopping-cart": Object.freeze([["circle", { cx: "8", cy: "21", r: "1" }], ["circle", { cx: "19", cy: "21", r: "1" }], ["path", { d: "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" }]]),
  "bookmark": Object.freeze([["path", { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" }]]),
  "users-round": Object.freeze([["path", { d: "M18 21a8 8 0 0 0-16 0" }], ["circle", { cx: "10", cy: "8", r: "5" }], ["path", { d: "M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" }]]),
  "info": Object.freeze([["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "M12 16v-4" }], ["path", { d: "M12 8h.01" }]]),
  "navigation": Object.freeze([["polygon", { points: "3 11 22 2 13 21 11 13 3 11" }]]),
  "more-horizontal": Object.freeze([["circle", { cx: "12", cy: "12", r: "1" }], ["circle", { cx: "19", cy: "12", r: "1" }], ["circle", { cx: "5", cy: "12", r: "1" }]]),
  "trash-2": Object.freeze([["path", { d: "M3 6h18" }], ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }], ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }], ["line", { x1: "10", x2: "10", y1: "11", y2: "17" }], ["line", { x1: "14", x2: "14", y1: "11", y2: "17" }]]),
  "badge-check": Object.freeze([["path", { d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" }], ["path", { d: "m9 12 2 2 4-4" }]]),
  "chevron-right": Object.freeze([["path", { d: "m9 18 6-6-6-6" }]]),
  "zap": Object.freeze([["path", { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" }]]),
  "mail": Object.freeze([["rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }], ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" }]]),
  "arrow-right-left": Object.freeze([["path", { d: "m16 3 4 4-4 4" }], ["path", { d: "M20 7H4" }], ["path", { d: "m8 21-4-4 4-4" }], ["path", { d: "M4 17h16" }]]),
  "log-out": Object.freeze([["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }], ["polyline", { points: "16 17 21 12 16 7" }], ["line", { x1: "21", x2: "9", y1: "12", y2: "12" }]]),
  "messages-square": Object.freeze([["path", { d: "M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" }], ["path", { d: "M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" }]]),
  "clipboard-list": Object.freeze([["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1" }], ["path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }], ["path", { d: "M12 11h4" }], ["path", { d: "M12 16h4" }], ["path", { d: "M8 11h.01" }], ["path", { d: "M8 16h.01" }]]),
  "users": Object.freeze([["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }], ["circle", { cx: "9", cy: "7", r: "4" }], ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }], ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75" }]])
});

function buildIconAttributeString(attributes = {}) {
  return Object.entries(attributes).reduce((markup, [name, value]) => {
    const safeName = String(name || "").trim();
    if (!safeName || value == null || value === false) return markup;
    if (value === true || value === "") return `${markup} ${safeName}`;
    return `${markup} ${safeName}="${escapeHtml(String(value))}"`;
  }, "");
}

function renderInlineLucideIcon(name, className = "", attributes = {}) {
  const node = INLINE_LUCIDE_ICON_NODES[name];
  if (!node) return "";
  const svgAttrs = {
    ...INLINE_LUCIDE_SVG_ATTRS,
    class: className || null,
    "aria-hidden": "true",
    focusable: "false",
    ...attributes
  };
  const body = node.map(([tagName, tagAttrs = {}]) => `<${tagName}${buildIconAttributeString(tagAttrs)}></${tagName}>`).join("");
  return `<svg${buildIconAttributeString(svgAttrs)}>${body}</svg>`;
}

function icon(name, className = "", attributes = {}) {
  const safeName = String(name || "").trim();
  if (!safeName) return "";
  const safeClassName = String(className || "").trim();
  const inlineMarkup = renderInlineLucideIcon(safeName, safeClassName, attributes);
  if (inlineMarkup) return inlineMarkup;
  return `<i${buildIconAttributeString({
    "data-lucide": safeName,
    class: safeClassName,
    ...attributes
  })}></i>`;
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
  const notificationsOnly = keys.length === 1 && keys[0] === "notifications";
  const profileTabOpen = patch && patch.activeTab === "profile" && patch.activeTab !== prevTab;
  const menuOpenRequested = patch && (
    patch.profileTopTab === "menu"
    || patch.profileContentTab === "menu"
  );
  if (profileTabOpen) {
    startSocialBudgetTrace("profile_open");
  }
  if (menuOpenRequested) {
    startSocialBudgetTrace("menu_open");
  }
  if (patch && Object.prototype.hasOwnProperty.call(patch, "activeTab")) {
    patch.activeTab = sanitizeTabForSession(patch.activeTab, {
      hasProfileView: !!state.profileView
    });
    patch.activeTab = normalizeLegacyHomeTab(patch.activeTab);
  }
  Object.assign(state, patch);
  if (drawerOnly && lastRenderMode === "main") {
    updateDrawerDom();
    if (profileTabOpen) finishSocialBudgetTraceSoon("profile_open");
    if (menuOpenRequested) finishSocialBudgetTraceSoon("menu_open");
    return;
  }
  if (notificationsOnly && lastRenderMode === "main") {
    updateNotificationsDom();
    updateNotificationBadges();
    if (profileTabOpen) finishSocialBudgetTraceSoon("profile_open");
    if (menuOpenRequested) finishSocialBudgetTraceSoon("menu_open");
    return;
  }
  render();
  if (profileTabOpen) finishSocialBudgetTraceSoon("profile_open");
  if (menuOpenRequested) finishSocialBudgetTraceSoon("menu_open");
  if (patch.activeTab && patch.activeTab !== prevTab) {
    queueMicrotask(() => {
      void getSessionTabLifecycleRuntimeController().ensureTabData(state.activeTab);
    });
  }
}

function saveSettings(settings) {
  safeStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

function saveNotifications(notifications) {
  return getNotificationSupportRuntimeController().saveNotifications(...arguments);
}

function saveFollowing(handles, targetIds = state.followingTargetIds) {
  return getFollowRuntimeController().saveFollowing(...arguments);
}

function normalizeFollowHandle(value) {
  return normalizeFollowHandleCore(value, {
    normalizeHandleFn: normalizeHandle
  });
}

function getFollowDocId(targetType, targetId, handle) {
  return getFollowRuntimeController().getFollowDocId(...arguments);
}

function applyFollowingHandles(handles, { shouldRender = true, targetIds = state.followingTargetIds } = {}) {
  return getFollowRuntimeController().applyFollowingHandles(...arguments);
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
  startSocialBudgetTrace("chat_send");
  try {
    return await chatRuntimeController.sendChatMessage();
  } finally {
    finishSocialBudgetTrace("chat_send");
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
  const options = arguments[0] && typeof arguments[0] === "object"
    ? arguments[0]
    : {};
  const phase = String(options.phase || options.mode || "").trim().toLowerCase();
  const result = sessionDataRuntimeController.loadPersisted(...arguments);
  if (phase !== "critical") {
    syncPersistedStories();
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

function preloadFeedHeroImages(feedPosts, { limit = FEED_PRELOAD_LIMIT } = {}) {
  if (!Array.isArray(feedPosts)) return;
  if (typeof document === "undefined") return;
  const head = document.head || document.querySelector("head");
  if (!head) return;
  const wildcard = `[${FEED_PRELOAD_ATTR}]`;
  head.querySelectorAll(wildcard).forEach((node) => node.remove());
  const activeTabKey = String(state.activeTab || "").trim().toLowerCase();
  if (activeTabKey !== "feed") return;
  feedPosts.slice(0, limit).forEach((post, index) => {
    const imageUrl = getOptimizedImageUrl(post.image, "medium");
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
    buildUrlFn: buildUrl,
    buildPathFn: (tab) => buildCanonicalAppTabPathCore(tab)
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
  const safeRestaurantId = String(restaurantId || "").trim();
  const menuItems = Array.isArray(state.menu.items) ? state.menu.items : [];
  const favoriteItems = Array.isArray(state.favoriteMenuItems?.items) ? state.favoriteMenuItems.items : [];
  const matchesItemId = (entry) => {
    const ids = [
      entry?.id,
      entry?.itemId,
      entry?.menuItemId,
      entry?.menuSocialId
    ];
    return ids.some((value) => String(value || "").trim() === safeItemId);
  };
  const matchesRestaurant = (entry) => {
    if (!safeRestaurantId) return true;
    return String(entry?.restaurantId || "").trim() === safeRestaurantId;
  };
  const findItem = (list) => {
    if (!Array.isArray(list)) return null;
    return list.find((entry) => matchesItemId(entry) && matchesRestaurant(entry))
      || list.find((entry) => matchesItemId(entry));
  };
  const item = findItem(menuItems) || findItem(favoriteItems);
  if (!item) return;
  const resolvedRestaurantId = String(
    safeRestaurantId
    || item.restaurantId
    || state.menu.restaurantId
    || state.profileView?.profile?.restaurantId
    || state.userProfile.restaurantId
    || ""
  ).trim();
  if (!resolvedRestaurantId) return;
  await toggleMenuItemLike({
    item,
    restaurantId: resolvedRestaurantId
  });
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
    reportCriticalRuntimeFailure("menu-reorder", err);
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
async function hydrateMenuCardViewerLikes(items, restaurantId = "") {
  if (!socialEngagementRuntimeController || typeof socialEngagementRuntimeController.hydrateMenuCardViewerLikes !== "function") {
    return;
  }
  return socialEngagementRuntimeController.hydrateMenuCardViewerLikes(...arguments);
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

const profileBusinessMenuRuntimeCluster = createProfileBusinessMenuRuntimeCluster({
  state,
  businessAccountsDeps: {
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
  },
  profileMenuDeps: {
    state,
    resolvePostCountsFn: socialEngagementSupportRuntimeController.resolvePostCounts,
    escapeHtmlFn: escapeHtml,
    getOptimizedImageUrlFn: getOptimizedImageUrl,
    iconFn: icon,
    isLocalBusinessProfileFn: isLocalBusinessProfile,
    isCeoUserFn: isCeoUser,
    normalizeHandleFn: normalizeHandle,
    logoFitClassFn: logoFitClass,
    formatCountFn: formatCount,
    ensureTableQrStateForProfileFn: ensureTableQrStateForProfile,
    isShopCatalogProfileFn: isShopCatalogProfile,
    getBusinessCatalogLabelFn: getBusinessCatalogLabel,
    normalizeMenuTypeFn: normalizeMenuType,
    primeMenuItemCountsFn: primeMenuItemCounts,
    hydrateMenuCardViewerLikesFn: hydrateMenuCardViewerLikes,
    getMenuLayoutThemeFn: getMenuLayoutTheme,
    menuLayoutColors: MENU_LAYOUT_COLORS,
    resolveMenuItemHeroFn: resolveMenuItemHero,
    isPlaceholderUrlFn: isPlaceholderUrl,
    placeholderImage: PLACEHOLDER_IMAGE,
    getFirebaseStorageUrlFn: getFirebaseStorageUrl,
    isDirectImageUrlFn: isDirectImageUrl,
    formatPriceFn: formatPrice,
    resolveCurrencyCodeForMenuItemFn: resolveCurrencyCodeForMenuItem,
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
  },
  dataLoaders: {
    showPublicProfileFn: (...args) => showPublicProfile(...args),
    fetchBusinessProfileDocFn: (...args) => fetchBusinessProfileDoc(...args),
    loadBusinessPostsForRestaurantFn: (...args) => loadBusinessPostsForRestaurant(...args),
    loadMenuForRestaurantFn: (...args) => loadMenuForRestaurant(...args),
    loadFocusForRestaurantFn: (...args) => loadFocusForRestaurant(...args)
  },
  bridgeBindingsApi: {
    renderProfileShopCartViewFn: (...args) => bridgeShellRuntimeCluster?.bridgeBindings?.renderProfileShopCartView?.(...args) || "",
    renderProfileShopFavoritesViewFn: (...args) => bridgeShellRuntimeCluster?.bridgeBindings?.renderProfileShopFavoritesView?.(...args) || "",
    renderShopProductListFn: (...args) => bridgeShellRuntimeCluster?.bridgeBindings?.renderShopProductList?.(...args) || ""
  }
});
const {
  ensurePostsDataForProfile,
  ensureMenuDataForProfile,
  ensureFocusDataForProfile,
  loadBusinessAccounts,
  renderBusinessAccountsView,
  bindBusinessAccountsEvents,
  renderPublicProfileView,
  renderMenuAdminView,
  renderProfileView
} = profileBusinessMenuRuntimeCluster;

sessionDataRuntimeController = createSessionDataRuntimeCluster({
  stateDeps: { state, dataLoaded },
  constants: {
    DEFAULT_SETTINGS,
    DEFAULT_MENU_LAYOUT,
    DEFAULT_PROFILE,
    CACHE_KEYS,
    STORAGE_KEYS,
    GUEST_SCOPE_UID: getGuestScopeUid(),
    CRM_PAGE_SIZE,
    CEO_COUNTRIES,
    CACHE_TTL_MS,
    FAST_LIMITS
  },
  storageApi: {
    safeStorage,
    readCache,
    writeCache,
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
    createEmptyCustomersState
  },
  renderApi: {
    scheduleIdle,
    render,
    getLastRenderMode: () => lastRenderMode,
    updateFeedDom: (...args) => updateFeedDom(...args),
    updateShellDom,
    refreshSearchView: (...args) => refreshSearchView(...args),
    cleanupLeaflet: (...args) => cleanupLeaflet(...args),
    setMenuDetailCloseBound: (next) => { menuDetailCloseBound = !!next; }
  },
  profileApi: {
    loadLogoCache,
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
    menuItemCountsRequested,
    commentAvatarCache,
    commentAvatarPending,
    userSearchAvatarCache,
    businessProfileCache,
    userProfileCache,
    getUserAvatarCache,
    setUserAvatarCache,
    getLastShellAvatarUrl,
    setLastShellAvatarUrl
  },
  authApi: {
    stopActiveChatMessagesListener,
    stopRestaurantMetaListeners,
    stopMenuItemMetaListeners,
    bootstrapAuthenticatedSessionCore,
    loadAuthProfile,
    resolveRoleSwitchTargets,
    startLiveListeners: (...args) => getSessionTabLifecycleRuntimeController().startLiveListeners(...args),
    ensureTabData: (...args) => getSessionTabLifecycleRuntimeController().ensureTabData(...args)
  },
  firebaseApi: { db, doc, onSnapshot, collection, query, where, orderBy, limit, getDocs },
  feedApi: {
    collectFeedHydrationIds,
    hydrateRestaurantsByIds,
    rebuildBusinessLocations,
    syncFeedPostLogos,
    refreshFeedStories,
    preloadFeedHeroImages,
    enrichRestaurantsWithPublicMeta,
    toDateSafe,
    normalizeFeedPost,
    loadStoriesForFeed,
    saveFeedPosts
  },
  menuApi: {
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
  }
});

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
  updateMenuCardLikeButtonsFn: socialEngagementSupportRuntimeController.updateMenuCardLikeButtons,
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

bridgeShellRuntimeCluster = createBridgeShellRuntimeCluster({
  state,
  constants: {
    BRAND_UI,
    FAST_MODE,
    LEAFLET_JS_URL,
    LEAFLET_CSS_URL,
    LEAFLET_JS_FALLBACK_URL,
    LEAFLET_CSS_FALLBACK_URL,
    SEARCH_LIMITS,
    PLACEHOLDER_IMAGE,
    NOTIFICATIONS_LIVE_LIMIT
  },
  browserApi: {
    documentObj: typeof document === "undefined" ? null : document,
    windowObj: typeof window === "undefined" ? null : window,
    navigatorObj: typeof navigator === "undefined" ? null : navigator,
    appEl,
    confirmFn: confirm,
    alertFn: alert,
    queueMicrotaskFn: typeof queueMicrotask === "function" ? queueMicrotask : null
  },
  stateApi: {
    getPushActivationIssue: () => getPushRuntimeController().getPushActivationIssue(),
    getPendingState: pendingRouteState.getPendingState,
    setPendingState: pendingRouteState.patchPendingState,
    getPushOpenMessageBound: () => getPushRuntimeController().isPushOpenMessageBound(),
    markPushOpenMessageBound: () => getPushRuntimeController().markPushOpenMessageBound(),
    getStoriesRowSignature: () => storiesRowSignature,
    setStoriesRowSignature: (next) => { storiesRowSignature = next; },
    getOverlayCache: () => overlayCache,
    isModalEscapeBound: () => modalEscapeBound,
    setModalEscapeBound: (value) => { modalEscapeBound = !!value; },
    isMenuDetailCloseBound: () => menuDetailCloseBound,
    setMenuDetailCloseBound: (next) => { menuDetailCloseBound = !!next; },
    getLastMenuOpenGestureKey: () => lastMenuOpenGestureKey,
    setLastMenuOpenGestureKey: (next) => { lastMenuOpenGestureKey = next; },
    getLastMenuOpenGestureAt: () => lastMenuOpenGestureAt,
    setLastMenuOpenGestureAt: (next) => { lastMenuOpenGestureAt = next; },
    setPendingCommentHighlight: (value) => { pendingCommentHighlight = value; },
    getRenderSuspended: () => renderSuspended,
    setRenderQueued: (next) => { renderQueued = !!next; },
    getLastAppHtml: () => lastAppHtml,
    setLastAppHtml: (next) => { lastAppHtml = next; },
    getLastRenderMode: () => lastRenderMode,
    setLastRenderMode: (next) => { lastRenderMode = next; },
    getLastRenderedMainTab: () => lastRenderedMainTab,
    setLastRenderedMainTab: (next) => { lastRenderedMainTab = next; },
    getCrmAutoLoadObserver: () => crmAutoLoadObserver,
    setCrmAutoLoadObserver: (next) => { crmAutoLoadObserver = next; },
    getAuthInitialized: () => authInitialized,
    getAuthBootstrapSnapshot: () => authBootstrapSnapshot,
    getUserAvatarCache,
    getProfileMenuBound: () => profileMenuBound,
    setProfileMenuBound: (next) => { profileMenuBound = !!next; },
    getProfileViewUnsub,
    setProfileViewUnsub
  },
  firebaseApi: { collection, query, orderBy, startAt, endAt, where, limit, getDoc, getDocs, onSnapshot, setDoc, doc, serverTimestamp, db },
  notificationsApi: {
    notificationsRuntimeController: {
      normalizeNotificationItem: (...args) => getNotificationsRuntimeController().normalizeNotificationItem(...args),
      mapNotificationSnapshot: (...args) => getNotificationsRuntimeController().mapNotificationSnapshot(...args),
      shouldSurfaceNativePushNow: (...args) => getNotificationsRuntimeController().shouldSurfaceNativePushNow(...args),
      startNotificationsListener: (...args) => getNotificationsRuntimeController().startNotificationsListener(...args),
      syncNotificationsPushRuntime: async (...args) => await getNotificationsRuntimeController().syncNotificationsPushRuntime(...args),
      loadNotificationsFromFirebase: async (...args) => await getNotificationsRuntimeController().loadNotificationsFromFirebase(...args)
    },
    handleNotificationsUpdate,
    updateNotificationsDom,
    saveNotifications,
    openNotificationTarget
  },
  profileApi: {
    isLocalBusinessProfile,
    getRestaurantMetaById,
    ensurePostsDataForProfile,
    ensureMenuDataForProfile,
    ensureFocusDataForProfile,
    normalizeExternalProfile,
    showPublicProfile,
    fetchBusinessProfileDoc,
    normalizeExternalUserProfile,
    openGuestAuthPrompt,
    userProfileCache,
    hasPendingFollowRequest,
    resolveUserByHandle,
    resolveRestaurantLogo,
    getChatUnreadCount,
    resolveHeaderBranding,
    isRestaurantCafeProfile,
    getBusinessCatalogLabel,
    isShopCatalogProfile,
    getCartCountForRestaurant,
    saveUserProfileToStorage,
    persistPrivateAccountSetting,
    uploadAvatar,
    resolveSearchUserAvatarDisplay,
    getSelfAvatarUrl,
    isCeoUser,
    getCeoGpsOverride,
    isGuestSession
  },
  routeApi: {
    clearQueryParamsFromCurrentUrlCore,
    resolveRouteStateFromTargetUrlCore,
    resolveInitialRouteState,
    normalizeInitialTab,
    normalizeAuthMode,
    applyPendingRouteStateCore,
    normalizePendingNotificationIdCore,
    findNotificationByIdCore,
    prependNotificationByIdCore,
    normalizePendingPostIdCore,
    findPostInLocalSourcesCore,
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
    isPushOpenTargetMessageCore
  },
  feedApi: {
    render,
    hydrateRestaurantsByIds,
    loadBusinessPostsForRestaurant,
    loadUserPostsForUser,
    findPostById,
    fetchPostForNotification,
    getMenuItemImages,
    resolveMenuItemHero,
    loadFavoriteMenuItems,
    buildStoriesFromFeed,
    updateStoryLogoNodes,
    updateStoryMetaNodes,
    resolveStoryRenderIdentity,
    updateFeedLogoNodes,
    updatePostCountNodes,
    ensureFeedRestaurantMetaListeners,
    preloadFeedHeroImages,
    getVerifiedMapLocation,
    setVerifiedMapLocation
  },
  utilityApi: {
    normalizeSearchKey,
    formatRelative,
    toDateSafe,
    getOptimizedImageUrl,
    isPlaceholderUrl,
    getFirebaseStorageUrl,
    isDirectImageUrl,
    formatPrice,
    escapeHtml,
    getMenuItemObjectPosition,
    icon,
    buildUrl,
    getGeo,
    normalizeRestaurantType,
    normalizeSearchQuery,
    scoreSearchMatch,
    sanitizeDisplayName,
    normalizeHandle,
    escapeSelector,
    logoFitClass,
    renderAuthScreen,
    sanitizeTabForSession,
    focusSearchInput,
    focusInputById,
    captureChatInputFocusState,
    restoreChatInputFocusState,
    updateNotificationBadges,
    updateFocusRotation,
    ensureAuthLocalPersistence
  },
  shopApi: {
    createEmptyFavoriteMenuItemsState,
    getShopCartProfileContextCore,
    getShopCartTotalCore,
    parsePriceValue,
    canAddToShopCart,
    normalizeShopCartState,
    buildShopVariantKey,
    clampCropPercent,
    createEmptyShopCart,
    saveShopCartToStorage
  },
  storyApi: { buildStoriesRowSignature },
  visibilityApi: {
    normalizeLeadLocations,
    resolveCoordsFromEntity,
    normalizeCoordPair,
    preferStableCoords,
    isPublicBusinessRecord,
    isForceHiddenBusinessEntity,
    isForceHiddenHandle,
    isForceHiddenEmail
  },
  chatApi: {
    normalizeChatOpenProfileCore,
    upsertChatThread,
    markChatThreadAsRead,
    buildChatModalStateOnOpenCore,
    syncChatThreadSummary,
    syncRemoteChatReadState,
    startActiveChatMessagesListener,
    stopActiveChatMessagesListener,
    buildClosedChatModalStateCore,
    sendChatMessage,
    scrollChatMessagesToBottom
  },
  socialApi: {
    ensurePostMeta,
    attachPostMetaListeners,
    loadPostMetaFromFirebase,
    updatePostModalMeta,
    stopPostMetaListeners,
    toggleFollow,
    togglePostLike,
    loadPostLikesForModal,
    addComment,
    toggleCommentLike,
    autosizeTextarea,
    addMenuItemComment,
    applyCommentAvatarCache
  },
  menuApi: {
    getFocusItemCrop,
    createLeadDraftState,
    resetLeadDraft,
    getMenuItemCrop,
    createEmptyMenuDetailState,
    attachMenuItemMetaListeners,
    loadMenuItemMetaFromFirebase,
    updateMenuDetailMeta,
    stopMenuItemMetaListeners,
    saveMenuItemFromModal,
    syncMenuModalCropPreview,
    getMenuDetailCatalogProfile,
    toggleMenuItemLike,
    saveFocusItemFromModal,
    syncFocusModalCropPreview
  },
  overlayApi: {
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
    bindImageFallbacks
  },
  leadApi: {
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
    hydrateLeadGeoFieldsFromCoords
  },
  shellApi: {
    setState,
    renderMain,
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
    loadUserScopedPersisted,
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
    syncNotificationsPushRuntime: async (...args) => await getNotificationsRuntimeController().syncNotificationsPushRuntime(...args),
    saveSettings,
    disablePushDeviceRegistration: async (...args) => await getPushRuntimeController().disablePushDeviceRegistration(...args),
    getPushActivationIssueMessage: () => getPushRuntimeController().getPushActivationIssueMessage(),
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
    closeStaffEditor,
    openStaffEditor,
    syncStaffDerivedEmailField,
    normalizeCeoCountry,
    syncStaffFormFromDom,
    saveCeoStaffFromView,
    deleteCeoStaffFromView
  }
});

const storySystemController = bridgeShellRuntimeCluster.storySystemController;
const openProfileFromUser = bridgeShellRuntimeCluster.openProfileFromUser;
const routeOpenApi = bridgeShellRuntimeCluster.routeOpenApi;
const createShellRuntimeController = bridgeShellRuntimeCluster.createShellRuntimeController;
const {
  openChatWithProfile,
  openPostModal,
  renderFeedView,
  updateFeedDom,
  buildRestaurantLocations,
  ensureLeafletLoaded,
  cleanupLeaflet,
  renderMapView,
  renderSearchView,
  refreshSearchView,
  renderShopProductList,
  renderProfileShopFavoritesView,
  renderProfileShopCartView,
  renderOverlays,
  clearShopCart,
  closeFocusModal,
  closeLeadModal,
  closeCustomerModal,
  closeMenuModal
} = bridgeShellRuntimeCluster.bridgeBindings;
let browserPopstateRouteSyncBound = false;
let lastPopstateReplayLocationKey = "";
let lastPopstateReplayAtMs = 0;
const POPSTATE_REPLAY_DEDUP_WINDOW_MS = 120;

function resolveInitialRouteStateFromWindowLocation() {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(window.location.href);
    return resolveInitialRouteState({
      qs: (key) => String(url.searchParams.get(String(key || "")) || ""),
      pathname: String(url.pathname || ""),
      normalizeInitialTab,
      normalizeAuthMode
    });
  } catch {
    return null;
  }
}

function resolveWindowLocationReplayKey() {
  if (typeof window === "undefined") return "";
  try {
    const url = new URL(window.location.href);
    return `${String(url.pathname || "")}|${String(url.search || "")}|${String(url.hash || "")}`;
  } catch {
    return `${String(window.location.pathname || "")}|${String(window.location.search || "")}|${String(window.location.hash || "")}`;
  }
}

function replayRouteFromWindowLocation() {
  const nextRouteState = resolveInitialRouteStateFromWindowLocation();
  if (!nextRouteState) return false;
  pendingRouteState.applyInitialRouteState(nextRouteState);
  applyPendingInitialRouteState();
  const openedProfile = !!routeOpenApi?.openProfileFromQuery?.();
  if (state?.user?.uid) {
    void routeOpenApi?.openNotificationFromQuery?.();
    void routeOpenApi?.openPostFromQuery?.();
    routeOpenApi?.openChatFromQuery?.();
  }
  if (!openedProfile) {
    render();
    queueMicrotask(() => {
      void getSessionTabLifecycleRuntimeController().ensureTabData(state.activeTab);
    });
  }
  return openedProfile;
}

function bindBrowserPopstateRouteSync() {
  if (browserPopstateRouteSyncBound) return;
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") return;
  browserPopstateRouteSyncBound = true;
  window.addEventListener("popstate", () => {
    const replayLocationKey = resolveWindowLocationReplayKey();
    const nowMs = Date.now();
    if (
      replayLocationKey
      && replayLocationKey === lastPopstateReplayLocationKey
      && (nowMs - lastPopstateReplayAtMs) < POPSTATE_REPLAY_DEDUP_WINDOW_MS
    ) {
      return;
    }
    lastPopstateReplayLocationKey = replayLocationKey;
    lastPopstateReplayAtMs = nowMs;
    state.__nextRouteHistoryMode = "";
    replayRouteFromWindowLocation();
  });
}

bindBrowserPopstateRouteSync();

mediaUploadRuntimeController = createMediaUploadRuntimeCluster({
  stateDeps: {
    state,
    auth,
    documentObj: typeof document === "undefined" ? null : document,
    writeCacheFn: writeCache,
    setStateFn: setState,
    setFeedStoriesSignatureFn: (next) => setFeedStoriesSignature(next)
  },
  constants: { mediaBaseUrl: BUNNY_EDGE_BASE, mediaTicketEndpoint: MEDIA_TICKET_ENDPOINT, cacheKeys: CACHE_KEYS, fastLimits: FAST_LIMITS },
  firebaseApi: { db, collectionFn: collection, docFn: doc, setDocFn: setDoc, serverTimestampFn: serverTimestamp },
  mediaApi: { fetchFn: typeof fetch === "function" ? fetch : null, compressImageFn: compressImage },
  storyApi: {
    storySystemController,
    isLocalBusinessProfileFn: isLocalBusinessProfile,
    normalizeStoryItemForDisplayFn: normalizeStoryItemForDisplay,
    buildStoriesSignatureFn: buildStoriesSignature,
    loadStoriesForFeedFn: (...args) => loadStoriesForFeed(...args),
    loadFeedPostsFn: (...args) => loadFeedPosts(...args),
    loadBusinessPostsFn: (...args) => loadBusinessPosts(...args),
    loadUserPostsFn: (...args) => loadUserPosts(...args)
  },
  renderApi: {
    getOptimizedImageUrlFn: getOptimizedImageUrl,
    escapeHtmlFn: escapeHtml,
    iconFn: icon,
    renderFn: render,
    updateFeedDomFn: (...args) => updateFeedDom(...args),
    getLastRenderModeFn: () => lastRenderMode
  }
});

chatRuntimeController = createChatRuntimeCluster({
  stateDeps: { state, safeStorage, chatIndexKey },
  constants: {
    STORAGE_KEYS,
    toDateSafe,
    normalizeHandle,
    normalizeFollowHandle,
    compressImage,
    CHAT_ATTACHMENT_INLINE_MAX_BYTES,
    CHAT_MESSAGE_TTL_MS,
    CHAT_IMAGE_PREVIEW_COMPRESSION_STEPS,
    CHAT_MESSAGE_READ_LIMIT
  },
  firebaseApi: {
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
    runTransaction
  },
  renderApi: {
    currentUserBadge,
    render,
    renderOverlays,
    updateNotificationBadges,
    saveNotifications,
    updateNotificationsDom,
    openPostModal,
    openChatWithProfile,
    openProfileFromUser,
    openGuestAuthPrompt
  },
  followApi: {
    applyFollowingHandles,
    getFollowDocId,
    isLocalBusinessProfile,
    saveFollowing,
    businessProfileCache,
    findPostById,
    normalizeFeedPost,
    pushUserNotification,
    pushUserNotificationWithId
  },
  stateApi: {
    getPendingCommentHighlight: () => pendingCommentHighlight,
    setPendingCommentHighlight: (value) => { pendingCommentHighlight = value; },
    getLastRenderMode: () => lastRenderMode,
    getDocumentObj: () => (typeof document === "undefined" ? null : document),
    getWindowObj: () => (typeof window === "undefined" ? null : window)
  },
  uiApi: {
    escapeHtml,
    icon,
    formatRelative,
    getOptimizedImageUrl,
    alertFn: (message) => alert(message),
    queueMicrotaskFn: (fn) => queueMicrotask(fn),
    setTimeoutFn: (fn, ms) => setTimeout(fn, ms)
  }
});

const sessionRuntimeClusterGetters = createSessionRuntimeCluster({
  config: {
    app,
    fastMode: FAST_MODE,
    brandTitle: BRAND_UI.title,
    firebaseMessagingModuleUrl: FIREBASE_MESSAGING_MODULE_URL,
    pushSeenNotificationsLimit: PUSH_SEEN_NOTIFICATIONS_LIMIT,
    pushTokenSyncIntervalMs: PUSH_TOKEN_SYNC_INTERVAL_MS,
    fcmWebPushVapidKey: FCM_WEB_PUSH_VAPID_KEY,
    pushServiceWorkerUrl: PUSH_SW_URL,
    pushServiceWorkerScope: PUSH_SW_SCOPE,
    pushServiceWorkerReadyTimeoutMs: PUSH_SW_READY_TIMEOUT_MS,
    notificationsLiveLimit: NOTIFICATIONS_LIVE_LIMIT
  },
  browserContext: {
    documentObj: typeof document === "undefined" ? null : document,
    windowObj: typeof window === "undefined" ? null : window,
    navigatorObj: typeof navigator === "undefined" ? null : navigator,
    cryptoObj: typeof crypto === "undefined" ? null : crypto,
    clearIntervalFn: (id) => clearInterval(id),
    importModuleFn: (url) => import(url),
    encodeURIComponentFn: (value) => encodeURIComponent(value),
    nowFn: () => Date.now(),
    randomFn: () => Math.random()
  },
  firebaseApi: {
    db,
    collectionFn: collection,
    queryFn: query,
    orderByFn: orderBy,
    limitFn: limit,
    getDocsFn: getDocs,
    onSnapshotFn: onSnapshot,
    docFn: doc,
    setDocFn: setDoc,
    serverTimestampFn: serverTimestamp,
    writeUserNotificationFn: writeUserNotificationViaCallable
  },
  storageApi: {
    safeStorageObj: safeStorage,
    followingKeyFn: followingKey,
    notificationsKeyFn: notificationsKey,
    pushSeenKeyFn: pushSeenKey,
    pushTokenMetaKeyFn: pushTokenMetaKey,
    pushDeviceIdKeyFn: pushDeviceIdKey,
    normalizeFollowHandleFn: normalizeFollowHandle
  },
  renderApi: {
    renderFn: render,
    renderOverlaysFn: (...args) => renderOverlays(...args),
    getLastRenderModeFn: () => lastRenderMode,
    updateNotificationsDomFn: updateNotificationsDom,
    handleNotificationsUpdateFn: handleNotificationsUpdate,
    saveNotificationsFn: (...args) => saveNotifications(...args),
    resolveNotificationAvatarFn: (...args) => resolveNotificationAvatar(...args),
    formatRelativeFn: formatRelative,
    toDateSafeFn: toDateSafe
  },
  lifecycleApi: {
    state,
    dataLoaded,
    sanitizeTabForSession,
    startChatThreadsListenerFn: startChatThreadsListener,
    stopChatThreadsListenerFn: stopChatThreadsListener,
    stopActiveChatMessagesListenerFn: stopActiveChatMessagesListener,
    startOrdersListenerFn: startOrdersListener,
    stopOrdersListenerFn: stopOrdersListener,
    stopRestaurantMetaListenersFn: stopRestaurantMetaListeners,
    isCeoUserFn: isCeoUser,
    queueCrmLazyRenderersPrefetchFn: queueCrmLazyRenderersPrefetch,
    loadFeedPostsFn: (...args) => loadFeedPosts(...args),
    scheduleIdleFn: scheduleIdle,
    loadRestaurantsFn: (...args) => loadRestaurants(...args),
    isLocalBusinessProfileFn: isLocalBusinessProfile,
    loadUserPostsFn: (...args) => loadUserPosts(...args),
    loadBusinessPostsFn: (...args) => loadBusinessPosts(...args),
    loadAuthProfileFn: (...args) => loadAuthProfile(...args),
    loadMenuForRestaurantFn: (...args) => loadMenuForRestaurant(...args),
    loadFocusForRestaurantFn: (...args) => loadFocusForRestaurant(...args),
    attachCurrentUserProfileListenerFn: attachCurrentUserProfileListener,
    stopCurrentUserProfileListenerFn: stopCurrentUserProfileListener,
    stopProfileViewListenerFn: stopProfileViewListener,
    normalizeLeadScopeKeyFn: normalizeLeadScopeKey,
    loadLeadsFn: (...args) => loadLeads(...args),
    normalizeCustomerScopeKeyFn: normalizeCustomerScopeKey,
    loadCustomersFn: (...args) => loadCustomers(...args),
    loadCeoStaffFn: (...args) => loadCeoStaff(...args),
    loadBusinessAccountsFn: (...args) => loadBusinessAccounts(...args),
    stopExtraLiveListenersFn: () => {
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
  }
});
getFollowRuntimeController = sessionRuntimeClusterGetters.getFollowRuntimeController;
getPushRuntimeController = sessionRuntimeClusterGetters.getPushRuntimeController;
getNotificationsRuntimeController = sessionRuntimeClusterGetters.getNotificationsRuntimeController;
getNotificationSupportRuntimeController = sessionRuntimeClusterGetters.getNotificationSupportRuntimeController;
getSessionTabLifecycleRuntimeController = sessionRuntimeClusterGetters.getSessionTabLifecycleRuntimeController;

shellRuntimeController = createShellRuntimeController();
if (runtimeUiRefreshPending) {
  requestRuntimeUiRefresh();
}

async function pushUserNotification(targetUid, payload) {
  return await getNotificationSupportRuntimeController().pushUserNotification(...arguments);
}

async function pushUserNotificationWithId(targetUid, notificationId, payload) {
  return await getNotificationSupportRuntimeController().pushUserNotificationWithId(...arguments);
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

function isFollowingProfile(profile = {}) {
  return getFollowRuntimeController().isFollowingProfile(...arguments);
}

let firebaseFunctionsModulePromise = null;
let writeUserNotificationPromise = null;

async function ensureWriteUserNotificationFn() {
  if (writeUserNotificationPromise) return writeUserNotificationPromise;
  writeUserNotificationPromise = (async () => {
    if (!firebaseFunctionsModulePromise) {
      firebaseFunctionsModulePromise = import(FIREBASE_FUNCTIONS_MODULE_URL);
    }
    const firebaseFunctions = await firebaseFunctionsModulePromise;
    const functionsObj = firebaseFunctions.getFunctions(app, "us-central1");
    const callable = firebaseFunctions.httpsCallable(functionsObj, "writeUserNotification");
    return async (input = {}) => {
      const result = await callable(input);
      return result?.data || null;
    };
  })().catch((err) => {
    firebaseFunctionsModulePromise = null;
    writeUserNotificationPromise = null;
    throw err;
  });
  return writeUserNotificationPromise;
}

async function writeUserNotificationViaCallable(input = {}) {
  const writer = await ensureWriteUserNotificationFn();
  return await writer(input);
}

let authPersistenceReady = null;
function ensureAuthLocalPersistence() {
  if (authPersistenceReady) return authPersistenceReady;
  authPersistenceReady = setPersistence(auth, browserLocalPersistence).catch(() => null);
  return authPersistenceReady;
}

function getSocialEngagementSupportRuntimeController() {
  if (!socialEngagementSupportRuntimeController) {
    throw new Error("socialEngagementSupportRuntimeController not initialized");
  }
  return socialEngagementSupportRuntimeController;
}

function getMediaUploadRuntimeController() {
  if (!mediaUploadRuntimeController) {
    throw new Error("mediaUploadRuntimeController not initialized");
  }
  return mediaUploadRuntimeController;
}

async function uploadCompressedImage(file, ownerId, { maxSize, quality, mimeType }) {
  return getMediaUploadRuntimeController().uploadCompressedImage(file, ownerId, { maxSize, quality, mimeType });
}

startAppStartupRuntimeCluster({
  loadPersistedFn: loadPersisted,
  suspendRenderFn: suspendRender,
  resumeRenderFn: resumeRender,
  startupDeps: {
    publicBootstrapDeps: {
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
    },
    startupPrepDeps: {
      windowObj: typeof window === "undefined" ? null : window,
      state,
      pendingRouteState
    },
    routeOpenDeps: {
      pendingRouteState,
      routeOpenApi,
      renderFallback: render
    },
    authStartupDeps: {
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
      bindPushOpenTargetMessageHandler: routeOpenApi.bindPushOpenTargetMessageHandler,
      loadUserScopedPersisted,
      loadGuestScopedPersisted,
      applyPendingInitialRouteState,
      resetUserScopedState,
      render,
      schedulePerfWarmMark,
      ensureTabData: (...args) => getSessionTabLifecycleRuntimeController().ensureTabData(...args),
      sanitizeTabForSession,
      stopLiveListeners: (...args) => getSessionTabLifecycleRuntimeController().stopLiveListeners(...args),
      suspendRender,
      resumeRender,
      reportCriticalRuntimeFailure,
      runBootstrapUser: (user) => sessionDataRuntimeController.bootstrapUser(user)
    },
    startupTimelineMark: markStartupTimeline
  },
  browserApi: {
    windowObj: typeof window === "undefined" ? null : window
  }
});
scheduleRuntimeDiagnosticsStartup();
