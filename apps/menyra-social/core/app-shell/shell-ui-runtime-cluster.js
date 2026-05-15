import {
  renderMenuItemModalCore,
  renderMenuDetailModalCore
} from "../menu/menu-modal-render-utils.js";
import { saveMenuItemFromModalCore } from "../menu/menu-save-utils.js";
import { deleteMenuItemByIdCore } from "../menu/menu-delete-utils.js";
import {
  renderCustomerModalCore,
  renderFocusModalCore
} from "../menu/customer-focus-modal-render-utils.js";
import {
  renderChatModalCore,
  renderProfileModalCore,
  renderLikesModalCore,
  renderPostModalCore
} from "../overlays/overlay-basic-render-utils.js";
import { renderMainCore } from "../ui/main-shell-render-utils.js";
import {
  renderNotificationsViewCore,
  renderNotificationsListCore
} from "../notifications/notifications-render-utils.js";
import { isChatEnabledForV1 } from "../chat/chat-v1-guard.js";
import {
  renderCrmLazyLoadingViewCore
} from "../crm/crm-shared-render-utils.js";
import { renderLeadModalCore } from "../leads/lead-modal-render-utils.js";
import { renderSettingsViewCore } from "../ui/settings-render-utils.js";
import { renderOrdersViewCore } from "../orders/orders-render-utils.js";

function expectRuntime(getter, label) {
  const runtime = typeof getter === "function" ? getter() : null;
  if (!runtime) {
    throw new Error(`${label} not initialized`);
  }
  return runtime;
}

export function createShellUiRuntimeCluster({
  state = null,
  constants = {},
  browserApi = {},
  runtimeGetters = {},
  helperApi = {},
  profileApi = {},
  menuApi = {},
  socialApi = {},
  mainApi = {},
  notificationApi = {},
  uploadApi = {},
  actionApi = {}
} = {}) {
  const documentObj = browserApi.documentObj || null;
  const getBridgeBindings = typeof runtimeGetters.getBridgeBindingsFn === "function"
    ? runtimeGetters.getBridgeBindingsFn
    : (() => null);
  const getShellDomRuntimeController = () => expectRuntime(runtimeGetters.getShellDomRuntimeControllerFn, "shellDomRuntimeController");
  const getMediaUploadRuntimeController = () => expectRuntime(runtimeGetters.getMediaUploadRuntimeControllerFn, "mediaUploadRuntimeController");
  const getChatRuntimeController = () => expectRuntime(runtimeGetters.getChatRuntimeControllerFn, "chatRuntimeController");
  const getShellRuntimeController = () => expectRuntime(runtimeGetters.getShellRuntimeControllerFn, "shellRuntimeController");
  const getSessionDataRuntimeController = () => expectRuntime(runtimeGetters.getSessionDataRuntimeControllerFn, "sessionDataRuntimeController");
  const getSocialEngagementSupportRuntimeController = () => expectRuntime(runtimeGetters.getSocialEngagementSupportRuntimeControllerFn, "socialEngagementSupportRuntimeController");
  const icon = typeof helperApi.iconFn === "function" ? helperApi.iconFn : (() => "");
  const escapeHtml = typeof helperApi.escapeHtmlFn === "function" ? helperApi.escapeHtmlFn : ((value = "") => String(value || ""));
  const getOptimizedImageUrl = typeof helperApi.getOptimizedImageUrlFn === "function" ? helperApi.getOptimizedImageUrlFn : ((value) => String(value || ""));
  const isPlaceholderUrl = typeof helperApi.isPlaceholderUrlFn === "function" ? helperApi.isPlaceholderUrlFn : (() => false);
  const formatRelative = typeof helperApi.formatRelativeFn === "function" ? helperApi.formatRelativeFn : ((value) => value);
  const toDateSafe = typeof helperApi.toDateSafeFn === "function" ? helperApi.toDateSafeFn : ((value) => value);
  const formatCount = typeof helperApi.formatCountFn === "function" ? helperApi.formatCountFn : ((value) => String(value || "0"));
  const formatPrice = typeof helperApi.formatPriceFn === "function" ? helperApi.formatPriceFn : ((value) => String(value || ""));
  const resolveCurrencyCodeForMenuItem = typeof helperApi.resolveCurrencyCodeForMenuItemFn === "function"
    ? helperApi.resolveCurrencyCodeForMenuItemFn
    : (() => "");
  const parsePriceValue = typeof helperApi.parsePriceValueFn === "function" ? helperApi.parsePriceValueFn : (() => 0);
  const getFirebaseStorageUrl = typeof helperApi.getFirebaseStorageUrlFn === "function" ? helperApi.getFirebaseStorageUrlFn : ((value) => String(value || ""));
  const isDirectImageUrl = typeof helperApi.isDirectImageUrlFn === "function" ? helperApi.isDirectImageUrlFn : (() => false);
  const getMenuItemObjectPosition = typeof helperApi.getMenuItemObjectPositionFn === "function" ? helperApi.getMenuItemObjectPositionFn : (() => "center");
  const logoFitClass = typeof helperApi.logoFitClassFn === "function" ? helperApi.logoFitClassFn : (() => "");
  const normalizeMenuType = typeof menuApi.normalizeMenuTypeFn === "function" ? menuApi.normalizeMenuTypeFn : ((value) => value);
  const confirmFn = typeof actionApi.confirmFn === "function" ? actionApi.confirmFn : (() => false);
  const alertFn = typeof actionApi.alertFn === "function" ? actionApi.alertFn : (() => {});

  function getBridgeBinding(name, fallback = null) {
    const bindings = getBridgeBindings();
    const candidate = bindings && typeof bindings[name] === "function" ? bindings[name] : null;
    return candidate || fallback;
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

  function renderCommentItem() {
    return getSocialEngagementSupportRuntimeController().renderCommentItem(...arguments);
  }

  function renderPostComments() {
    return getSocialEngagementSupportRuntimeController().renderPostComments(...arguments);
  }

  function renderMenuCommentItem() {
    return getSocialEngagementSupportRuntimeController().renderMenuCommentItem(...arguments);
  }

  function renderMenuDetailComments() {
    return getSocialEngagementSupportRuntimeController().renderMenuDetailComments(...arguments);
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

  function updateCommentLikeButton() {
    return getSocialEngagementSupportRuntimeController().updateCommentLikeButton(...arguments);
  }

  function renderChatModal() {
    if (!isChatEnabledForV1()) return "";
    return renderChatModalCore({
      state,
      getOptimizedImageUrl,
      escapeHtml,
      icon,
      formatRelative,
      toDateSafe
    });
  }

  function renderProfileModal() {
    return renderProfileModalCore({
      state,
      isFollowingProfile: typeof profileApi.isFollowingProfileFn === "function" ? profileApi.isFollowingProfileFn : (() => false),
      getOptimizedImageUrl,
      formatCount,
      escapeHtml,
      icon
    });
  }

  function renderPostModal() {
    return renderPostModalCore({
      state,
      ensurePostMeta: socialApi.ensurePostMetaFn,
      resolvePostCounts: socialApi.resolvePostCountsFn,
      getOptimizedImageUrl,
      ensureCommentShape: socialApi.ensureCommentShapeFn,
      currentUserBadge: socialApi.currentUserBadgeFn,
      renderPostComments,
      formatDateLabel: socialApi.formatDateLabelFn,
      escapeHtml,
      icon
    });
  }

  function renderLikesModal() {
    return renderLikesModalCore({
      state,
      ensurePostMeta: socialApi.ensurePostMetaFn,
      findPostById: socialApi.findPostByIdFn,
      resolveLikeAvatar: profileApi.resolveLikeAvatarFn,
      escapeHtml,
      icon
    });
  }

  function renderLeadModal() {
    return renderLeadModalCore({
      state,
      getOptimizedImageUrl,
      PLACEHOLDER_IMAGE: constants.placeholderImage,
      resolveCustomerType: profileApi.resolveCustomerTypeFn,
      normalizeLeadStatusKey: profileApi.normalizeLeadStatusKeyFn,
      normalizeLeadLocations: profileApi.normalizeLeadLocationsFn,
      hasLeadLocationCoords: profileApi.hasLeadLocationCoordsFn,
      LEAD_TYPE_ORDER: constants.leadTypeOrder || [],
      LEAD_TYPE_LABELS: constants.leadTypeLabels || {},
      LEAD_STATUS_ORDER: constants.leadStatusOrder || [],
      LEAD_STATUS_LABELS: constants.leadStatusLabels || {},
      escapeHtml,
      icon
    });
  }

  function renderCustomerModal() {
    return renderCustomerModalCore({
      state,
      getOptimizedImageUrl,
      PLACEHOLDER_IMAGE: constants.placeholderImage,
      resolveCustomerType: profileApi.resolveCustomerTypeFn,
      normalizeLeadStatusKey: profileApi.normalizeLeadStatusKeyFn,
      LEAD_TYPE_ORDER: constants.leadTypeOrder || [],
      LEAD_TYPE_LABELS: constants.leadTypeLabels || {},
      LEAD_STATUS_ORDER: constants.leadStatusOrder || [],
      LEAD_STATUS_LABELS: constants.leadStatusLabels || {},
      escapeHtml,
      icon
    });
  }

  function renderMenuItemModal() {
    return renderMenuItemModalCore({
      state,
      isShopCatalogProfile: profileApi.isShopCatalogProfileFn,
      getBusinessProfileType: profileApi.getBusinessProfileTypeFn,
      getOptimizedImageUrl,
      PLACEHOLDER_IMAGE: constants.placeholderImage,
      isPlaceholderUrl,
      normalizeMenuType,
      getMenuModalCrop: menuApi.getMenuModalCropFn,
      escapeHtml,
      icon
    });
  }

  function renderMenuDetailModal() {
    return renderMenuDetailModalCore({
      state,
      getMenuItemImages: menuApi.getMenuItemImagesFn,
      getOptimizedImageUrl,
      isPlaceholderUrl,
      PLACEHOLDER_IMAGE: constants.placeholderImage,
      getFirebaseStorageUrl,
      isDirectImageUrl,
      formatPrice: (value, itemContext = null) => {
        const currencyCode = String(
          resolveCurrencyCodeForMenuItem(itemContext || state?.menuDetail?.item || {})
        ).trim();
        if (currencyCode) return formatPrice(value, currencyCode);
        return formatPrice(value);
      },
      getMenuDetailRestaurantId: menuApi.getMenuDetailRestaurantIdFn,
      getMenuDetailCatalogProfile: menuApi.getMenuDetailCatalogProfileFn,
      isShopCatalogProfile: profileApi.isShopCatalogProfileFn,
      normalizeMenuType,
      canAddToShopCart: menuApi.canAddToShopCartFn,
      getMenuItemSocialId: menuApi.getMenuItemSocialIdFn,
      menuItemMetaKey: menuApi.menuItemMetaKeyFn,
      ensureMenuItemMeta: menuApi.ensureMenuItemMetaFn,
      resolveMenuItemCounts: menuApi.resolveMenuItemCountsFn,
      currentUserBadge: socialApi.currentUserBadgeFn,
      ensureCommentShape: socialApi.ensureCommentShapeFn,
      getCartCountForRestaurant: profileApi.getCartCountForRestaurantFn,
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
      PLACEHOLDER_IMAGE: constants.placeholderImage,
      getFocusModalCrop: menuApi.getFocusModalCropFn,
      escapeHtml,
      icon
    });
  }

  function renderSettingsView() {
    return renderSettingsViewCore({
      state,
      icon,
      escapeHtml,
      logoFitClass,
      isLocalBusinessProfile: profileApi.isLocalBusinessProfileFn,
      isCeoUser: profileApi.isCeoUserFn,
      resolveUserAvatar: profileApi.resolveUserAvatarFn,
      PLACEHOLDER_IMAGE: constants.placeholderImage
    });
  }

  function renderNotificationsList(items) {
    return renderNotificationsListCore({
      items,
      escapeHtml,
      resolveNotificationAvatar: notificationApi.resolveNotificationAvatarFn,
      icon
    });
  }

  function renderNotificationsView() {
    return renderNotificationsViewCore({
      state,
      renderNotificationsListFn: renderNotificationsList
    });
  }

  function renderCrmLazyLoadingView(label = "CRM laden...") {
    return renderCrmLazyLoadingViewCore({
      label,
      icon,
      escapeHtml
    });
  }

  function renderOrdersView() {
    return renderOrdersViewCore({
      state,
      isLocalBusinessProfileFn: profileApi.isLocalBusinessProfileFn,
      canAccessRestaurantOrdersFn: profileApi.canAccessRestaurantOrdersFn,
      escapeHtmlFn: escapeHtml,
      getOptimizedImageUrlFn: getOptimizedImageUrl,
      formatPriceFn: formatPrice,
      parsePriceValueFn: parsePriceValue,
      formatRelativeFn: formatRelative,
      toDateSafeFn: toDateSafe
    });
  }

  function renderUploadView() {
    return getMediaUploadRuntimeController().renderUploadView();
  }

  function renderChatMessagesPanel(options = {}) {
    if (!isChatEnabledForV1()) return "";
    return getChatRuntimeController().renderChatMessagesPanel(options);
  }

  function renderChatPendingAttachments(pendingAttachments) {
    if (!isChatEnabledForV1()) return "";
    return getChatRuntimeController().renderChatPendingAttachments(pendingAttachments);
  }

  function renderChatListPanel(options = {}) {
    if (!isChatEnabledForV1()) return "";
    return getChatRuntimeController().renderChatListPanel(options);
  }

  function renderChatV1DisabledView() {
    return `
      <section class="p-6 pb-24">
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 text-center">
          <div class="w-16 h-16 mx-auto mb-5 rounded-[1.8rem] bg-slate-100 text-slate-400 flex items-center justify-center">
            ${icon("message-circle", "w-6 h-6")}
          </div>
          <h2 class="text-xl font-black tracking-tight text-slate-900">${escapeHtml("Chat kommt in V2")}</h2>
          <p class="mt-3 text-sm text-slate-500 leading-6">${escapeHtml("Chat ist fuer MNYRA V1 deaktiviert.")}</p>
        </div>
      </section>
    `;
  }

  function renderChatView() {
    if (!isChatEnabledForV1()) return renderChatV1DisabledView();
    return getChatRuntimeController().renderChatView();
  }

  function renderHeaderActionButton(avatarUrl, avatarFit) {
    return getShellRuntimeController().renderHeaderActionButton(avatarUrl, avatarFit);
  }

  function renderHeader() {
    return getShellRuntimeController().renderHeader();
  }

  function renderBusinessTopTabs() {
    return getShellRuntimeController().renderBusinessTopTabs();
  }

  function renderMain() {
    const bridgeBindings = getBridgeBindings() || {};
    return renderMainCore({
      state,
      renderHomeViewFn: bridgeBindings.renderHomeView || (() => ""),
      renderFeedViewFn: bridgeBindings.renderFeedView || (() => ""),
      renderChatViewFn: renderChatView,
      renderSearchViewFn: bridgeBindings.renderSearchView || (() => ""),
      renderMapViewFn: bridgeBindings.renderMapView || (() => ""),
      renderPublicProfileViewFn: mainApi.renderPublicProfileViewFn || (() => ""),
      renderProfileViewFn: mainApi.renderProfileViewFn || (() => ""),
      renderMenuAdminViewFn: mainApi.renderMenuAdminViewFn || (() => ""),
      renderOrdersViewFn: renderOrdersView,
      renderLeadsViewFn: mainApi.renderLeadsViewFn || (() => ""),
      renderStaffViewFn: mainApi.renderStaffViewFn || (() => ""),
      renderCustomersViewFn: mainApi.renderCustomersViewFn || (() => ""),
      renderBusinessAccountsViewFn: mainApi.renderBusinessAccountsViewFn || (() => ""),
      renderSettingsViewFn: renderSettingsView,
      renderNotificationsViewFn: renderNotificationsView,
      renderUploadViewFn: renderUploadView,
      renderDrawerFn: renderDrawer,
      renderHeaderFn: renderHeader,
      renderBusinessTopTabsFn: renderBusinessTopTabs
    });
  }

  function bindImageFallbacks(root = documentObj) {
    return getShellRuntimeController().bindImageFallbacks(root);
  }

  function render() {
    const result = getShellRuntimeController().render();
    if (typeof mainApi.bindBusinessAccountsEventsFn === "function") {
      mainApi.bindBusinessAccountsEventsFn(documentObj);
    }
    return result;
  }

  function bindAuthEvents() {
    return getShellRuntimeController().bindAuthEvents();
  }

  function bindCrmAutoLoadObserver() {
    return getShellRuntimeController().bindCrmAutoLoadObserver();
  }

  function bindAppEvents() {
    return getShellRuntimeController().bindAppEvents();
  }

  function bindSearchEvents() {
    return getShellRuntimeController().bindSearchEvents();
  }

  async function handleUploadPost() {
    return getMediaUploadRuntimeController().handleUploadPost();
  }

  async function loadRestaurants() {
    return getSessionDataRuntimeController().loadRestaurants(...arguments);
  }

  async function loadFeedPosts() {
    return getSessionDataRuntimeController().loadFeedPosts(...arguments);
  }

  async function loadUserPosts() {
    return getSessionDataRuntimeController().loadUserPosts(...arguments);
  }

  async function loadBusinessPosts() {
    return getSessionDataRuntimeController().loadBusinessPosts(...arguments);
  }

  async function loadFocusForRestaurant() {
    return getSessionDataRuntimeController().loadFocusForRestaurant(...arguments);
  }

  async function loadMenuForRestaurant() {
    return getSessionDataRuntimeController().loadMenuForRestaurant(...arguments);
  }

  async function saveMenuItemFromModal() {
    return saveMenuItemFromModalCore({
      state,
      documentObj,
      isShopCatalogProfile: profileApi.isShopCatalogProfileFn,
      getBusinessProfileType: profileApi.getBusinessProfileTypeFn,
      renderOverlays: getBridgeBinding("renderOverlays", () => ""),
      normalizeOptionList: menuApi.normalizeOptionListFn,
      getMenuModalCrop: menuApi.getMenuModalCropFn,
      uploadCompressedImage: uploadApi.uploadCompressedImageFn,
      doc: actionApi.docFn,
      collection: actionApi.collectionFn,
      db: actionApi.db,
      normalizeMenuType,
      serverTimestamp: actionApi.serverTimestampFn,
      setDoc: actionApi.setDocFn,
      normalizeMenuItemDoc: menuApi.normalizeMenuItemDocFn,
      syncMenuCaches: menuApi.syncMenuCachesFn,
      publishMenuToPublic: menuApi.publishMenuToPublicFn,
      closeMenuModal: getBridgeBinding("closeMenuModal", () => {}),
      render
    });
  }

  async function deleteMenuItemById(itemId) {
    return deleteMenuItemByIdCore({
      itemId,
      state,
      confirmFn,
      doc: actionApi.docFn,
      db: actionApi.db,
      deleteDoc: actionApi.deleteDocFn,
      syncMenuCaches: menuApi.syncMenuCachesFn,
      publishMenuToPublic: menuApi.publishMenuToPublicFn,
      render,
      alertFn
    });
  }

  return {
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
    render,
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
  };
}
