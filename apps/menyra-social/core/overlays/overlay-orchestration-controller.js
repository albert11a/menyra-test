import { isChatEnabledForV1 } from "../chat/chat-v1-guard.js";
import { t } from "/shared/i18n/i18n.js";

export function createOverlayOrchestrationController({
  state = null,
  getDocumentObjFn = () => (typeof document === "undefined" ? null : document),
  getWindowObjFn = () => (typeof window === "undefined" ? null : window),
  getOverlayCacheFn = () => null,
  isModalEscapeBoundFn = () => false,
  setModalEscapeBoundFn = () => {},
  isMenuDetailCloseBoundFn = () => false,
  setMenuDetailCloseBoundFn = () => {},
  getLastMenuOpenGestureKeyFn = () => "",
  setLastMenuOpenGestureKeyFn = () => {},
  getLastMenuOpenGestureAtFn = () => 0,
  setLastMenuOpenGestureAtFn = () => {},
  setPendingCommentHighlightFn = () => {},
  openGuestAuthPromptFn = () => false,
  normalizeChatOpenProfileCoreFn = () => null,
  normalizeHandleFn = (value) => value,
  upsertChatThreadFn = () => {},
  markChatThreadAsReadFn = () => [],
  buildChatModalStateOnOpenCoreFn = (currentChatModal) => currentChatModal,
  getChatThreadIdFn = () => "",
  syncChatThreadSummaryFn = () => {},
  syncRemoteChatReadStateFn = async () => {},
  startActiveChatMessagesListenerFn = () => {},
  stopActiveChatMessagesListenerFn = () => {},
  buildClosedChatModalStateCoreFn = (currentChatModal) => currentChatModal,
  renderFn = () => {},
  ensurePostMetaFn = () => {},
  attachPostMetaListenersFn = () => {},
  loadPostMetaFromFirebaseFn = async () => {},
  updatePostModalMetaFn = () => {},
  stopPostMetaListenersFn = () => {},
  getFocusItemCropFn = () => ({ x: 50, y: 50 }),
  getMenuItemImagesFn = () => [],
  getMenuItemCropFn = () => ({ x: 50, y: 50 }),
  createEmptyMenuDetailStateFn = () => ({}),
  attachMenuItemMetaListenersFn = () => {},
  loadMenuItemMetaFromFirebaseFn = async () => {},
  updateMenuDetailMetaFn = () => {},
  stopMenuItemMetaListenersFn = () => {},
  ensureOverlayRootCoreFn = () => null,
  ensureModalEscapeHandlerCoreFn = () => {},
  syncModalOpenUiStateCoreFn = () => {},
  renderOverlaysCoreFn = () => null,
  renderProfileModalFn = () => "",
  renderChatModalFn = () => "",
  renderPostModalFn = () => "",
  renderLikesModalFn = () => "",
  renderMenuItemModalFn = () => "",
  renderMenuDetailModalFn = () => "",
  renderFocusModalFn = () => "",
  bindOverlayEventsCoreFn = () => null,
  bindProfileOverlayEventsCoreFn = () => {},
  bindChatOverlayEventsCoreFn = () => {},
  bindPostOverlayEventsCoreFn = () => {},
  bindLikesOverlayEventsCoreFn = () => {},
  bindMenuOverlayEventsCoreFn = () => {},
  bindMenuDetailOverlayEventsCoreFn = () => {},
  bindFocusOverlayEventsCoreFn = () => {},
  toggleFollowFn = () => {},
  sendChatMessageFn = () => {},
  scrollChatMessagesToBottomFn = () => {},
  queueMicrotaskFn = (fn) => fn?.(),
  togglePostLikeFn = () => {},
  loadPostLikesForModalFn = () => {},
  addCommentFn = () => {},
  toggleCommentLikeFn = () => {},
  saveMenuItemFromModalFn = () => {},
  syncMenuModalCropPreviewFn = () => {},
  clampCropPercentFn = (value) => value,
  getMenuDetailCatalogProfileFn = () => null,
  canAddToShopCartFn = () => false,
  addMenuItemToShopCartFn = () => {},
  showPublicProfileFn = () => {},
  setStateFn = () => {},
  toggleMenuItemLikeFn = () => {},
  autosizeTextareaFn = () => {},
  addMenuItemCommentFn = () => {},
  applyCommentAvatarCacheFn = () => {},
  saveFocusItemFromModalFn = () => {},
  syncFocusModalCropPreviewFn = () => {},
  bindImageFallbacksFn = () => {},
  placeholderImage = ""
} = {}) {
  if (!state) {
    return {
      openChatWithProfile: () => {},
      closeChatModal: () => {},
      closeProfileModal: () => {},
      closeLikesModal: () => {},
      closeActiveModal: () => false,
      isAnyModalOpen: () => false,
      openPostModal: async () => {},
      closePostModal: () => {},
      openFocusModal: () => {},
      closeFocusModal: () => {},
      openMenuModal: () => {},
      closeMenuModal: () => {},
      openMenuDetail: async () => {},
      closeMenuDetail: () => {},
      setMenuDetailIndex: () => {},
      setMenuDetailVariant: () => {},
      openMenuDetailFromTrigger: () => {},
      triggerMenuDetailOpenFromGesture: () => {},
      ensureOverlayRoot: () => null,
      ensureModalEscapeHandler: () => {},
      syncModalOpenUiState: () => {},
      renderOverlays: () => null,
      bindModalDismiss: () => {},
      bindOverlayEvents: () => null
    };
  }
  const tr = (key, fallback = key, params = {}) => t(key, { fallback, params });

  function openChatWithProfile(profile) {
    if (!isChatEnabledForV1()) return false;
    if (!profile) return;
    if (!state.user) {
      openGuestAuthPromptFn(tr("auth.chatsRequired", "Ju lutem hyni per te perdorur chat-in."));
      return;
    }
    const nextProfile = normalizeChatOpenProfileCoreFn({
      profile,
      normalizeHandle: (value) => normalizeHandleFn(value)
    });
    if (!nextProfile) return;
    upsertChatThreadFn(nextProfile);
    state.drawerOpen = false;
    state.chatSettingsOpen = false;
    state.chatThreadMenuId = "";
    state.profileModal = { open: false, profile: null };
    state.activeTab = "chat";
    const nextMessages = markChatThreadAsReadFn(nextProfile);
    state.chatModal = buildChatModalStateOnOpenCoreFn({
      currentChatModal: state.chatModal,
      nextProfile,
      nextMessages,
      getChatThreadId: (value) => getChatThreadIdFn(value)
    });
    syncChatThreadSummaryFn(nextProfile, state.chatModal.messages);
    void syncRemoteChatReadStateFn(nextProfile, state.chatModal.messages);
    startActiveChatMessagesListenerFn(nextProfile);
    renderFn();
  }

  function closeChatModal() {
    const doc = getDocumentObjFn();
    if (doc && doc.activeElement instanceof HTMLElement) {
      doc.activeElement.blur();
    }
    stopActiveChatMessagesListenerFn();
    state.chatSettingsOpen = false;
    state.chatThreadMenuId = "";
    state.chatModal = buildClosedChatModalStateCoreFn(state.chatModal);
    if (state.activeTab === "chat") {
      renderFn();
    }
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
    );
  }

  async function openPostModal(post, options = {}) {
    if (!post) return;
    const previewImageEl = options?.previewImageEl || null;
    const previewImageSrc = String(
      options?.previewImageSrc
      || resolvePreviewImageSrc(previewImageEl)
      || ""
    ).trim();
    if (previewImageSrc) {
      await ensurePreviewImageReady(previewImageEl, previewImageSrc);
    }
    ensurePostMetaFn(post.id);
    state.profileModal = { open: false, profile: null };
    state.postModal = {
      open: true,
      post,
      commentText: "",
      replyTo: null,
      previewImageSrc,
      loading: true,
      animate: true,
      sending: false
    };
    renderOverlays();
    state.postModal.animate = false;
    attachPostMetaListenersFn(post);
    void loadPostMetaFromFirebaseFn(post).then(() => {
      if (state.postModal.open && state.postModal.post && String(state.postModal.post.id) === String(post.id)) {
        updatePostModalMetaFn();
      }
    });
    state.postModal.loading = false;
    updatePostModalMetaFn();
  }

  function closePostModal() {
    state.postModal = { open: false, post: null, commentText: "", replyTo: null, previewImageSrc: "", loading: false, animate: false, sending: false };
    state.likesModal = { open: false, postId: "", animate: false };
    setPendingCommentHighlightFn("");
    stopPostMetaListenersFn();
    renderOverlays();
  }

  function openFocusModal(mode = "create", item = null, options = {}) {
    const crop = getFocusItemCropFn(item);
    const kind = String(options?.kind || item?.modalKind || item?.kind || "focus").trim().toLowerCase() === "ad"
      ? "ad"
      : "focus";
    // Zusatzfotos der Oferta-Galerie: alle gespeicherten Bilder ausser dem
    // Hauptbild (das weiter ueber den Hero-Upload laeuft).
    const mainImageUrl = String(item?.imageUrl || "").trim();
    const existingExtraImages = (Array.isArray(item?.images) ? item.images : [])
      .map((url) => String(url || "").trim())
      .filter((url) => url && url !== mainImageUrl)
      .filter((url, index, list) => list.indexOf(url) === index);
    state.focusModal = {
      open: true,
      kind,
      mode,
      item,
      status: "",
      loading: false,
      cropX: crop.x,
      cropY: crop.y,
      imageFile: null,
      imagePreview: "",
      existingExtraImages,
      extraImageFiles: [],
      extraImagePreviews: [],
      videoFile: null,
      videoPreview: "",
      videoPosterPreview: ""
    };
    renderOverlays({ updateFocus: true });
  }

  function closeFocusModal() {
    const staleFocusVideoPreview = String(state.focusModal?.videoPreview || "").trim();
    if (staleFocusVideoPreview.startsWith("blob:") && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
      try {
        URL.revokeObjectURL(staleFocusVideoPreview);
      } catch {}
    }
    // Object-URLs der Oferta-Zusatzfotos freigeben.
    (Array.isArray(state.focusModal?.extraImagePreviews) ? state.focusModal.extraImagePreviews : []).forEach((previewUrl) => {
      const safeUrl = String(previewUrl || "").trim();
      if (!safeUrl.startsWith("blob:")) return;
      if (typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") return;
      try {
        URL.revokeObjectURL(safeUrl);
      } catch {}
    });
    state.focusModal = {
      open: false,
      kind: "focus",
      mode: "create",
      item: null,
      status: "",
      loading: false,
      cropX: 50,
      cropY: 50,
      imageFile: null,
      imagePreview: "",
      existingExtraImages: [],
      extraImageFiles: [],
      extraImagePreviews: [],
      videoFile: null,
      videoPreview: "",
      videoPosterPreview: ""
    };
    renderOverlays({ updateFocus: true });
  }

  function openMenuModal(mode = "create", item = null) {
    const existingImages = getMenuItemImagesFn(item).filter(Boolean);
    const uniqImages = Array.from(new Set(existingImages));
    const crop = getMenuItemCropFn(item);
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
      existingImages: uniqImages,
      videoFile: null,
      videoPreview: "",
      videoPosterPreview: ""
    };
    renderOverlays({ updateMenu: true });
  }

  function closeMenuModal() {
    const staleVideoPreview = String(state.menuModal?.videoPreview || "").trim();
    if (staleVideoPreview.startsWith("blob:") && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
      try {
        URL.revokeObjectURL(staleVideoPreview);
      } catch {}
    }
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
      existingImages: [],
      videoFile: null,
      videoPreview: "",
      videoPosterPreview: ""
    };
    renderOverlays({ updateMenu: true });
  }

  async function openMenuDetail(item, restaurantIdOverride = "", options = {}) {
    if (!item) return;
    stopMenuItemMetaListenersFn();
    const detailImages = getMenuItemImagesFn(item).filter(Boolean);
    const maxInitialIndex = detailImages.length ? detailImages.length - 1 : 0;
    const rawInitialIndex = Number(options?.initialIndex);
    const initialIndex = Number.isFinite(rawInitialIndex)
      ? Math.max(0, Math.min(maxInitialIndex, Math.floor(rawInitialIndex)))
      : 0;
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
      index: initialIndex,
      restaurantId,
      // Bereits geladenes Karten-Bild als Sofort-Hintergrund im Detail-Modal,
      // damit beim Oeffnen keine graue Flaeche sichtbar wird.
      previewImageSrc: String(options?.previewImageSrc || "").trim(),
      selectedSize: Array.isArray(item?.sizes) && item.sizes.length ? String(item.sizes[0]) : "",
      selectedColor: Array.isArray(item?.colors) && item.colors.length ? String(item.colors[0]) : "",
      infoTab: "info",
      footerView: "cart",
      commentText: "",
      loading: true,
      sending: false
    };
    renderOverlays({ updateMenuDetail: true });
    if (!restaurantId) {
      state.menuDetail.loading = false;
      updateMenuDetailMetaFn();
      return;
    }
    attachMenuItemMetaListenersFn(item, restaurantId);
    void loadMenuItemMetaFromFirebaseFn(item, restaurantId).then(() => {
      if (state.menuDetail.open && state.menuDetail.item && String(state.menuDetail.item.id || "") === String(item.id || "")) {
        updateMenuDetailMetaFn();
      }
    });
    state.menuDetail.loading = false;
    updateMenuDetailMetaFn();
  }

  function closeMenuDetail({ afterClose = null } = {}) {
    stopMenuItemMetaListenersFn();
    state.menuDetail = createEmptyMenuDetailStateFn();
    renderOverlays({ updateMenuDetail: true });
    if (typeof afterClose === "function") afterClose();
  }

  function setMenuDetailIndex(nextIndex) {
    if (!state.menuDetail.open || !state.menuDetail.item) return;
    const images = getMenuItemImagesFn(state.menuDetail.item);
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

  function isPlaceholderImageSrc(src = "") {
    const normalized = String(src || "").trim();
    if (!normalized) return true;
    if (normalized.toLowerCase().startsWith("data:image/svg+xml")) return true;
    return !!placeholderImage && normalized === placeholderImage;
  }

  function resolvePreviewImageSrc(imageEl) {
    if (!imageEl) return "";
    const candidates = [
      imageEl.currentSrc,
      imageEl.getAttribute?.("src"),
      imageEl.dataset?.fallbackSrc
    ];
    for (const candidate of candidates) {
      const normalized = String(candidate || "").trim();
      if (!normalized || isPlaceholderImageSrc(normalized)) continue;
      return normalized;
    }
    return "";
  }

  function resolveMenuCardPreviewFromTrigger(trigger) {
    if (!trigger) {
      return {
        imageEl: null,
        index: 0
      };
    }
    const track = trigger.querySelector?.("[data-menu-card-gallery-track]") || null;
    if (track) {
      const slides = Array.from(track.querySelectorAll("[data-menu-card-gallery-slide]"));
      const slideCount = slides.length;
      const measuredWidth = Number(track.clientWidth || track.getBoundingClientRect?.().width || 0);
      const rawIndex = measuredWidth > 0
        ? Math.round(Number(track.scrollLeft || 0) / measuredWidth)
        : 0;
      const index = slideCount
        ? Math.max(0, Math.min(slideCount - 1, rawIndex))
        : 0;
      const currentSlide = slides[index] || slides[0] || null;
      const currentImageEl = currentSlide?.querySelector?.("img") || null;
      if (currentImageEl) {
        return {
          imageEl: currentImageEl,
          index
        };
      }
    }
    const imageCandidates = Array.from(trigger.querySelectorAll?.("img") || []);
    const loadedCandidate = imageCandidates.find((imageEl) => {
      const src = resolvePreviewImageSrc(imageEl);
      return !!src && imageEl.complete && Number(imageEl.naturalWidth || 0) > 0;
    });
    return {
      imageEl: loadedCandidate || imageCandidates[0] || null,
      index: 0
    };
  }

  async function ensurePreviewImageReady(imageEl, src) {
    const safeSrc = String(src || "").trim();
    if (isPlaceholderImageSrc(safeSrc)) return;
    const win = getWindowObjFn();
    const decodeImageElement = async (target) => {
      if (!target || typeof target.decode !== "function") return;
      try {
        await target.decode();
      } catch {}
    };
    const waitForExistingImage = async (target) => {
      if (!target || typeof target.addEventListener !== "function") return false;
      if (target.complete && Number(target.naturalWidth || 0) > 0) {
        await decodeImageElement(target);
        return true;
      }
      await new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve();
        };
        const cleanup = () => {
          target.removeEventListener("load", finish);
          target.removeEventListener("error", finish);
          if (timeoutId && typeof win?.clearTimeout === "function") {
            win.clearTimeout(timeoutId);
          }
        };
        const timeoutId = typeof win?.setTimeout === "function" ? win.setTimeout(finish, 240) : null;
        target.addEventListener("load", finish, { once: true });
        target.addEventListener("error", finish, { once: true });
      });
      if (target.complete && Number(target.naturalWidth || 0) > 0) {
        await decodeImageElement(target);
        return true;
      }
      return false;
    };
    if (await waitForExistingImage(imageEl)) return;
    const ImageCtor = win?.Image || (typeof Image === "function" ? Image : null);
    if (!ImageCtor) return;
    await new Promise((resolve) => {
      const preload = new ImageCtor();
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const cleanup = () => {
        preload.onload = null;
        preload.onerror = null;
        if (timeoutId && typeof win?.clearTimeout === "function") {
          win.clearTimeout(timeoutId);
        }
      };
      const timeoutId = typeof win?.setTimeout === "function" ? win.setTimeout(finish, 240) : null;
      try {
        preload.decoding = "sync";
      } catch {}
      preload.onload = finish;
      preload.onerror = finish;
      preload.src = safeSrc;
      if (preload.complete && Number(preload.naturalWidth || 0) > 0) finish();
    });
  }

  async function openMenuDetailFromTrigger(trigger) {
    const itemId = trigger?.dataset?.menuOpen || "";
    if (!itemId) return;
    const { index: previewIndex, imageEl: previewImageEl } = resolveMenuCardPreviewFromTrigger(trigger);
    // Nur ein wirklich geladenes Karten-Bild taugt als Sofort-Hintergrund: es
    // liegt dann im Cache und kostet keine zusaetzliche Anfrage.
    const previewImageSrc = previewImageEl?.complete && Number(previewImageEl.naturalWidth || 0) > 0
      ? resolvePreviewImageSrc(previewImageEl)
      : "";
    const source = trigger?.dataset?.menuOpenSource || "menu";
    const parseMarketplaceProduct = () => {
      if (source !== "marketplace") return null;
      const raw = String(trigger?.getAttribute?.("data-menu-open-product") || "").trim();
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;
        return {
          ...parsed,
          id: String(parsed.id || itemId).trim(),
          restaurantId: String(
            trigger?.dataset?.menuOpenRestaurant
            || parsed.restaurantId
            || ""
          ).trim(),
          catalogMode: parsed.catalogMode || "shop",
          restaurantType: parsed.restaurantType || parsed.customerType || "ecommerce",
          customerType: parsed.customerType || parsed.restaurantType || "ecommerce"
        };
      } catch {
        return null;
      }
    };
    const sourceItems = source === "favorites"
      ? (Array.isArray(state.favoriteMenuItems?.items) ? state.favoriteMenuItems.items : [])
      : (state.menu.items || []);
    const item = source === "marketplace"
      ? parseMarketplaceProduct()
      : sourceItems.find((it) => String(it.id) === String(itemId));
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
        || "",
      {
        initialIndex: previewIndex,
        previewImageSrc
      }
    );
  }

  function triggerMenuDetailOpenFromGesture(trigger) {
    const key = [
      trigger?.dataset?.menuOpenSource || "menu",
      trigger?.dataset?.menuOpenRestaurant || "",
      trigger?.dataset?.menuOpen || ""
    ].join("::");
    const now = Date.now();
    if (key && key === getLastMenuOpenGestureKeyFn() && now - getLastMenuOpenGestureAtFn() < 700) return;
    setLastMenuOpenGestureKeyFn(key);
    setLastMenuOpenGestureAtFn(now);
    void openMenuDetailFromTrigger(trigger);
  }

  function ensureOverlayRoot() {
    return ensureOverlayRootCoreFn({
      documentObj: getDocumentObjFn()
    });
  }

  function ensureModalEscapeHandler() {
    return ensureModalEscapeHandlerCoreFn({
      documentObj: getDocumentObjFn(),
      isBound: isModalEscapeBoundFn(),
      setBoundFn: (value) => {
        setModalEscapeBoundFn(!!value);
      },
      closeActiveModalFn: closeActiveModal
    });
  }

  function syncModalOpenUiState() {
    return syncModalOpenUiStateCoreFn({
      documentObj: getDocumentObjFn(),
      windowObj: getWindowObjFn(),
      isAnyModalOpenFn: isAnyModalOpen,
      ensureModalEscapeHandlerFn: ensureModalEscapeHandler
    });
  }

  function renderOverlays(options = {}) {
    return renderOverlaysCoreFn({
      options,
      state,
      documentObj: getDocumentObjFn(),
      windowObj: getWindowObjFn(),
      ensureOverlayRootFn: ensureOverlayRoot,
      renderProfileModalFn,
      renderChatModalFn,
      renderPostModalFn,
      renderLikesModalFn,
      renderMenuItemModalFn,
      renderMenuDetailModalFn,
      renderFocusModalFn,
      overlayCache: getOverlayCacheFn(),
      syncModalOpenUiStateFn: syncModalOpenUiState,
      bindOverlayEventsFn: bindOverlayEvents
    });
  }

  function bindModalDismiss(target, handler, { selfOnly = false } = {}) {
    if (!target || typeof handler !== "function") return;
    const onDismiss = (evt) => {
      if (selfOnly && evt.target !== target) return;
      if (evt.cancelable) evt.preventDefault();
      evt.stopPropagation?.();
      evt.stopImmediatePropagation?.();
      handler();
    };
    target.addEventListener("click", onDismiss);
  }

  function bindOverlayEvents({
    profileChanged = true,
    chatChanged = true,
    postChanged = true,
    likesChanged = true,
    menuChanged = true,
    menuDetailChanged = true,
    focusChanged = true
  } = {}) {
    return bindOverlayEventsCoreFn({
      profileChanged,
      chatChanged,
      postChanged,
      likesChanged,
      menuChanged,
      menuDetailChanged,
      focusChanged,
      documentObj: getDocumentObjFn(),
      windowObj: getWindowObjFn(),
      isMenuDetailCloseBoundFn: () => isMenuDetailCloseBoundFn(),
      setMenuDetailCloseBoundFn: (next) => {
        setMenuDetailCloseBoundFn(!!next);
      },
      state,
      bindProfileOverlayEventsFn: bindProfileOverlayEventsCoreFn,
      bindChatOverlayEventsFn: bindChatOverlayEventsCoreFn,
      bindPostOverlayEventsFn: bindPostOverlayEventsCoreFn,
      bindLikesOverlayEventsFn: bindLikesOverlayEventsCoreFn,
      bindMenuOverlayEventsFn: bindMenuOverlayEventsCoreFn,
      bindMenuDetailOverlayEventsFn: bindMenuDetailOverlayEventsCoreFn,
      bindFocusOverlayEventsFn: bindFocusOverlayEventsCoreFn,
      bindModalDismissFn: bindModalDismiss,
      closeMenuDetailFn: closeMenuDetail,
      closeProfileModalFn: closeProfileModal,
      openChatWithProfileFn: openChatWithProfile,
      toggleFollowFn,
      renderFn,
      closeChatModalFn: closeChatModal,
      sendChatMessageFn,
      scrollChatMessagesToBottomFn,
      queueMicrotaskFn: (fn) => queueMicrotaskFn(fn),
      closePostModalFn: closePostModal,
      togglePostLikeFn,
      renderOverlaysFn: renderOverlays,
      loadPostLikesForModalFn,
      addCommentFn,
      toggleCommentLikeFn,
      closeLikesModalFn: closeLikesModal,
      closeMenuModalFn: closeMenuModal,
      saveMenuItemFromModalFn,
      syncMenuModalCropPreviewFn,
      clampCropPercentFn,
      getMenuDetailCatalogProfileFn,
      canAddToShopCartFn,
      addMenuItemToShopCartFn,
      showPublicProfileFn,
      setStateFn,
      openGuestAuthPromptFn,
      toggleMenuItemLikeFn,
      setMenuDetailVariantFn: setMenuDetailVariant,
      autosizeTextareaFn,
      addMenuItemCommentFn,
      applyCommentAvatarCacheFn,
      setMenuDetailIndexFn: setMenuDetailIndex,
      closeFocusModalFn: closeFocusModal,
      saveFocusItemFromModalFn,
      syncFocusModalCropPreviewFn,
      bindImageFallbacksFn,
      placeholderImage
    });
  }

  return {
    openChatWithProfile,
    closeChatModal,
    closeProfileModal,
    closeLikesModal,
    closeActiveModal,
    isAnyModalOpen,
    openPostModal,
    closePostModal,
    openFocusModal,
    closeFocusModal,
    openMenuModal,
    closeMenuModal,
    openMenuDetail,
    closeMenuDetail,
    setMenuDetailIndex,
    setMenuDetailVariant,
    openMenuDetailFromTrigger,
    triggerMenuDetailOpenFromGesture,
    ensureOverlayRoot,
    ensureModalEscapeHandler,
    syncModalOpenUiState,
    renderOverlays,
    bindModalDismiss,
    bindOverlayEvents
  };
}
