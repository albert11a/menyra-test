import { t } from "/shared/i18n/i18n.js";

export function bindMenuDetailOverlayEventsCore({
  documentObj,
  windowObj,
  bindModalDismissFn,
  closeMenuDetailFn,
  getMenuDetailCatalogProfileFn,
  canAddToShopCartFn,
  addMenuItemToShopCartFn,
  showPublicProfileFn,
  setStateFn,
  openGuestAuthPromptFn,
  toggleMenuItemLikeFn,
  setMenuDetailVariantFn,
  autosizeTextareaFn,
  addMenuItemCommentFn,
  applyCommentAvatarCacheFn,
  setMenuDetailIndexFn,
  state
} = {}) {
  const doc = documentObj || null;
  const win = windowObj || null;
  const bindModalDismiss = typeof bindModalDismissFn === "function"
    ? bindModalDismissFn
    : null;
  if (!doc || !bindModalDismiss) return;
  const closeMenuDetail = typeof closeMenuDetailFn === "function"
    ? closeMenuDetailFn
    : (() => {});
  const tr = (key, fallback = key, params = {}) => t(key, { fallback, params });
  const getMenuDetailCatalogProfile = typeof getMenuDetailCatalogProfileFn === "function"
    ? getMenuDetailCatalogProfileFn
    : (() => null);
  const canAddToShopCart = typeof canAddToShopCartFn === "function"
    ? canAddToShopCartFn
    : (() => false);
  const addMenuItemToShopCart = typeof addMenuItemToShopCartFn === "function"
    ? addMenuItemToShopCartFn
    : (() => {});
  const showPublicProfile = typeof showPublicProfileFn === "function"
    ? showPublicProfileFn
    : (() => {});
  const setState = typeof setStateFn === "function"
    ? setStateFn
    : (() => {});
  const openGuestAuthPrompt = typeof openGuestAuthPromptFn === "function"
    ? openGuestAuthPromptFn
    : (() => {});
  const toggleMenuItemLike = typeof toggleMenuItemLikeFn === "function"
    ? toggleMenuItemLikeFn
    : null;
  const setMenuDetailVariant = typeof setMenuDetailVariantFn === "function"
    ? setMenuDetailVariantFn
    : (() => {});
  const autosizeTextarea = typeof autosizeTextareaFn === "function"
    ? autosizeTextareaFn
    : (() => {});
  const addMenuItemComment = typeof addMenuItemCommentFn === "function"
    ? addMenuItemCommentFn
    : null;
  const applyCommentAvatarCache = typeof applyCommentAvatarCacheFn === "function"
    ? applyCommentAvatarCacheFn
    : (() => {});
  const setMenuDetailIndex = typeof setMenuDetailIndexFn === "function"
    ? setMenuDetailIndexFn
    : (() => {});

  const menuDetailOverlay = doc.getElementById("menuDetailOverlay");
  const menuDetailClose = doc.getElementById("menuDetailClose");
  const normalizeExternalUrl = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^(https?:\/\/|mailto:|tel:)/i.test(raw)) return raw;
    return `https://${raw.replace(/^\/+/, "")}`;
  };
  const hasQrMenuAccessForItem = (item, profile) => {
    const safeItem = item || state.menuDetail?.item || null;
    if (!safeItem) return false;
    const type = String(safeItem.type || "").trim().toLowerCase();
    if (type && type !== "food" && type !== "drink") return false;
    const accessSource = String(state.profileView?.menuAccessSource || "").trim().toLowerCase();
    const isMenuTopTab = String(state.profileTopTab || "").trim().toLowerCase() === "menu";
    if (accessSource !== "qr" || !isMenuTopTab) return false;
    return true;
  };
  const cleanupKeyboardGap = () => {
    stopKeyboardGapTracking();
  };
  if (menuDetailOverlay) {
    menuDetailOverlay.addEventListener("click", cleanupKeyboardGap, { capture: true });
  }
  if (menuDetailClose) {
    menuDetailClose.addEventListener("click", cleanupKeyboardGap, { capture: true });
  }
  bindModalDismiss(menuDetailOverlay, closeMenuDetail, { selfOnly: true });
  bindModalDismiss(menuDetailClose, closeMenuDetail);

  const handleAddToCart = () => {
    stopKeyboardGapTracking();
    const item = state.menuDetail.item;
    const profile = getMenuDetailCatalogProfile(item);
    const allowShopCart = canAddToShopCart(profile);
    const allowQrMenuCart = hasQrMenuAccessForItem(item, profile);
    if (!item || (!allowShopCart && !allowQrMenuCart)) return;
    const stockRaw = item.stock;
    const stockValue = typeof stockRaw === "string" ? stockRaw.trim() : stockRaw;
    const parsedStock = stockValue === "" || stockValue === null || stockValue === undefined
      ? null
      : Number(stockValue);
    const stock = parsedStock === null || !Number.isFinite(parsedStock) ? null : Math.max(0, parsedStock);
    if (item.available === false || stock === 0) return;
    const added = addMenuItemToShopCart(item, profile, {
      size: state.menuDetail.selectedSize || "",
      color: state.menuDetail.selectedColor || "",
      forceAdd: !!allowQrMenuCart && !allowShopCart
    });
    if (!added) return;
    const targetRestaurantId = String(profile?.restaurantId || "").trim();
    closeMenuDetail({
      afterClose: () => {
        if (targetRestaurantId && String(state.profileView?.profile?.restaurantId || "").trim() !== targetRestaurantId) {
          showPublicProfile(profile, [], { showBack: false, topTab: "cart" });
          return;
        }
        if (targetRestaurantId) state.profileTopTab = "cart";
        setState({ activeTab: "profile" });
      }
    });
  };

  const menuDetailHeaderCartBtn = doc.getElementById("menuDetailHeaderCartBtn");
  const menuDetailAddToCartBtn = doc.getElementById("menuDetailAddToCartBtn");
  if (menuDetailHeaderCartBtn) menuDetailHeaderCartBtn.addEventListener("click", handleAddToCart);
  if (menuDetailAddToCartBtn) menuDetailAddToCartBtn.addEventListener("click", handleAddToCart);
  const menuDetailWoltBtn = doc.getElementById("menuDetailWoltBtn");
  if (menuDetailWoltBtn) {
    menuDetailWoltBtn.addEventListener("click", () => {
      stopKeyboardGapTracking();
      const href = normalizeExternalUrl(menuDetailWoltBtn.dataset.woltUrl || state.menuDetail.item?.woltUrl || "");
      if (!href) return;
      try {
        const link = doc.createElement("a");
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.display = "none";
        doc.body.appendChild(link);
        link.click();
        link.remove();
      } catch {
        win?.open?.(href, "_blank", "noopener,noreferrer");
      }
    });
  }
  const menuDetailFavoriteCtaBtn = doc.getElementById("menuDetailFavoriteCtaBtn");
  if (menuDetailFavoriteCtaBtn) {
    menuDetailFavoriteCtaBtn.addEventListener("click", () => {
      if (!String(state.user?.uid || "").trim()) {
        openGuestAuthPrompt(tr("auth.favoritesRequired", "Bitte registrieren oder einloggen, um Favoriten zu nutzen."));
        return;
      }
      if (!toggleMenuItemLike) return;
      void toggleMenuItemLike({ favoriteOnly: true });
    });
  }

  const menuDetailHeaderFavoritesBtn = doc.getElementById("menuDetailHeaderFavoritesBtn");
  if (menuDetailHeaderFavoritesBtn) {
    menuDetailHeaderFavoritesBtn.addEventListener("click", () => {
      if (!String(state.user?.uid || "").trim()) {
        openGuestAuthPrompt(tr("auth.favoritesRequired", "Bitte registrieren oder einloggen, um Favoriten zu nutzen."));
        return;
      }
      if (!toggleMenuItemLike) return;
      void toggleMenuItemLike({ favoriteOnly: true });
    });
  }

  doc.querySelectorAll("[data-menu-detail-variant]").forEach((input) => {
    input.addEventListener("change", () => {
      const field = input.dataset.menuDetailVariant || "";
      setMenuDetailVariant(field, input.value || "");
    });
  });

  const normalizeInfoTab = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "ingredients" || normalized === "allergens") return normalized;
    return "info";
  };
  const lockMenuDetailInfoPanelsHeightFromInfo = () => {
    const panelsRoot = doc.querySelector(".menu-detail-info-panels");
    const infoPanel = panelsRoot?.querySelector?.('[data-menu-detail-info-panel="info"]') || null;
    if (!panelsRoot || !infoPanel) return;
    const activeTab = normalizeInfoTab(state.menuDetail?.infoTab || "info");
    if (activeTab !== "info") {
      doc.querySelectorAll("[data-menu-detail-info-panel]").forEach((panel) => {
        const panelTab = normalizeInfoTab(panel.dataset.menuDetailInfoPanel || "");
        panel.classList.toggle("hidden", panelTab !== "info");
      });
    }
    panelsRoot.style.height = "";
    const measured = Math.max(0, Math.ceil(panelsRoot.getBoundingClientRect().height || 0));
    const fallback = Math.max(0, Math.ceil(infoPanel.getBoundingClientRect().height || infoPanel.scrollHeight || 0));
    const targetHeight = Math.max(measured, fallback, 96);
    panelsRoot.style.height = `${targetHeight}px`;
    panelsRoot.classList.add("overflow-hidden");
    if (activeTab !== "info") {
      doc.querySelectorAll("[data-menu-detail-info-panel]").forEach((panel) => {
        const panelTab = normalizeInfoTab(panel.dataset.menuDetailInfoPanel || "");
        panel.classList.toggle("hidden", panelTab !== activeTab);
      });
    }
  };
  const setMenuDetailInfoTab = (value) => {
    const nextTab = normalizeInfoTab(value);
    state.menuDetail.infoTab = nextTab;
    doc.querySelectorAll("[data-menu-detail-info-tab]").forEach((button) => {
      const buttonTab = normalizeInfoTab(button.dataset.menuDetailInfoTab || "");
      const isActive = buttonTab === nextTab;
      button.classList.toggle("bg-slate-900", isActive);
      button.classList.toggle("text-white", isActive);
      button.classList.toggle("border-slate-900", isActive);
      button.classList.toggle("bg-white", !isActive);
      button.classList.toggle("text-slate-500", !isActive);
      button.classList.toggle("border-slate-200", !isActive);
    });
    doc.querySelectorAll("[data-menu-detail-info-panel]").forEach((panel) => {
      const panelTab = normalizeInfoTab(panel.dataset.menuDetailInfoPanel || "");
      panel.classList.toggle("hidden", panelTab !== nextTab);
    });
  };
  const bindInfoTabButton = (button) => {
    if (!button) return;
    if (button.dataset.menuDetailInfoTabBound === "1") return;
    button.dataset.menuDetailInfoTabBound = "1";
    const activate = (event) => {
      event.stopPropagation();
      setMenuDetailInfoTab(button.dataset.menuDetailInfoTab || "info");
    };
    button.addEventListener("click", activate);
  };
  doc.querySelectorAll("[data-menu-detail-info-tab]").forEach((button) => {
    bindInfoTabButton(button);
  });
  setMenuDetailInfoTab(state.menuDetail?.infoTab || "info");
  lockMenuDetailInfoPanelsHeightFromInfo();

  const footerCartView = doc.getElementById("footer-cart-view");
  const footerCommentView = doc.getElementById("footer-comment-view");
  const menuDetailFooterCommentToggle = doc.getElementById("menuDetailFooterCommentToggle");
  const menuDetailFooterCartToggle = doc.getElementById("menuDetailFooterCartToggle");
  let stopKeyboardGapTracking = () => {};
  const rootEl = doc.documentElement;
  const MENU_DETAIL_FOCUS_DATA_KEY = "menuDetailCommentFocus";
  const MENU_DETAIL_GAP_DATA_KEY = "menuDetailFooterGap";
  const POST_FOCUS_DATA_KEY = "postCommentFocus";
  const POST_GAP_DATA_KEY = "postFooterGap";
  const readGapDataValue = (key) => {
    const raw = Number(rootEl?.dataset?.[key] || 0);
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
  };
  const syncSharedKeyboardGapUi = () => {
    const menuDetailActive = rootEl?.dataset?.[MENU_DETAIL_FOCUS_DATA_KEY] === "1";
    const postActive = rootEl?.dataset?.[POST_FOCUS_DATA_KEY] === "1";
    const anyActive = menuDetailActive || postActive;
    rootEl.classList.toggle("menu-detail-comment-focus", anyActive);
    doc.body?.classList?.toggle?.("menu-detail-comment-focus", anyActive);
    if (!anyActive) {
      rootEl.style.setProperty("--menu-detail-footer-gap", "0px");
      return;
    }
    const nextGap = Math.max(
      menuDetailActive ? readGapDataValue(MENU_DETAIL_GAP_DATA_KEY) : 0,
      postActive ? readGapDataValue(POST_GAP_DATA_KEY) : 0
    );
    rootEl.style.setProperty("--menu-detail-footer-gap", `${nextGap}px`);
  };
  const setKeyboardGapUiActive = (active) => {
    const next = !!active;
    if (next) rootEl.dataset[MENU_DETAIL_FOCUS_DATA_KEY] = "1";
    else delete rootEl.dataset[MENU_DETAIL_FOCUS_DATA_KEY];
    syncSharedKeyboardGapUi();
  };
  const setKeyboardGapSize = (value) => {
    const gap = Math.max(0, Number(value) || 0);
    if (gap > 0) rootEl.dataset[MENU_DETAIL_GAP_DATA_KEY] = String(gap);
    else delete rootEl.dataset[MENU_DETAIL_GAP_DATA_KEY];
    syncSharedKeyboardGapUi();
  };
  const startKeyboardGapTracking = (inputEl) => {
    stopKeyboardGapTracking();
    const input = inputEl instanceof Element ? inputEl : doc.getElementById("menuDetailCommentInput");
    if (!input) return;
    const footer = input.closest(".modal-footer-safe");
    if (!footer) return;
    setKeyboardGapUiActive(true);
    const updateGap = () => {
      const viewportHeight = Number(win?.visualViewport?.height || win?.innerHeight || doc.documentElement.clientHeight || 0);
      if (!viewportHeight) {
        setKeyboardGapSize(0);
        return;
      }
      const rect = footer.getBoundingClientRect();
      const gap = Math.max(0, Math.round(viewportHeight - rect.bottom));
      setKeyboardGapSize(gap);
    };
    updateGap();
    const vv = win?.visualViewport;
    const onResize = () => updateGap();
    if (vv?.addEventListener) {
      vv.addEventListener("resize", onResize);
      vv.addEventListener("scroll", onResize);
    }
    win?.addEventListener?.("resize", onResize);
    stopKeyboardGapTracking = () => {
      if (vv?.removeEventListener) {
        vv.removeEventListener("resize", onResize);
        vv.removeEventListener("scroll", onResize);
      }
      win?.removeEventListener?.("resize", onResize);
      setKeyboardGapUiActive(false);
      setKeyboardGapSize(0);
    };
  };
  const toggleFooterView = (view) => {
    if (!footerCartView || !footerCommentView) return;
    if (view === "comment") {
      state.menuDetail.footerView = "comment";
      footerCartView.classList.add("hidden", "opacity-0");
      footerCommentView.classList.remove("hidden");
      win?.setTimeout?.(() => {
        footerCommentView.classList.remove("opacity-0");
        if (win?.lucide?.createIcons) win.lucide.createIcons();
      }, 10);
      const commentsSection = doc.getElementById("menuDetailComments");
      if (commentsSection) {
        try {
          commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch {}
      }
      const commentInput = doc.getElementById("menuDetailCommentInput");
      if (commentInput && !commentInput.disabled) {
        win?.setTimeout?.(() => {
          try { commentInput.focus({ preventScroll: true }); } catch {}
        }, 140);
      }
      return;
    }
    stopKeyboardGapTracking();
    state.menuDetail.footerView = "cart";
    footerCommentView.classList.add("hidden", "opacity-0");
    footerCartView.classList.remove("hidden");
    win?.setTimeout?.(() => {
      footerCartView.classList.remove("opacity-0");
      if (win?.lucide?.createIcons) win.lucide.createIcons();
    }, 10);
  };
  if (menuDetailFooterCommentToggle) {
    menuDetailFooterCommentToggle.addEventListener("click", () => {
      toggleFooterView("comment");
    });
  }
  if (menuDetailFooterCartToggle) {
    menuDetailFooterCartToggle.addEventListener("click", () => {
      toggleFooterView("cart");
    });
  }

  const menuDetailLikeBtn = doc.getElementById("menuDetailLikeBtn");
  if (menuDetailLikeBtn) {
    menuDetailLikeBtn.addEventListener("click", () => {
      if (!toggleMenuItemLike) return;
      void toggleMenuItemLike();
    });
  }

  const menuDetailCommentInput = doc.getElementById("menuDetailCommentInput");
  if (menuDetailCommentInput) {
    autosizeTextarea(menuDetailCommentInput, { minHeight: 52, maxHeight: 160 });
    menuDetailCommentInput.addEventListener("input", () => {
      state.menuDetail.commentText = menuDetailCommentInput.value;
      autosizeTextarea(menuDetailCommentInput, { minHeight: 52, maxHeight: 160 });
    });
    menuDetailCommentInput.addEventListener("focus", () => {
      startKeyboardGapTracking(menuDetailCommentInput);
      win?.setTimeout?.(() => {
        try {
          menuDetailCommentInput.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } catch {}
      }, 180);
    });
    menuDetailCommentInput.addEventListener("blur", () => {
      win?.setTimeout?.(() => {
        if (doc.activeElement === menuDetailCommentInput) return;
        stopKeyboardGapTracking();
      }, 120);
    });
    menuDetailCommentInput.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" && !evt.shiftKey) {
        evt.preventDefault();
        const text = menuDetailCommentInput.value || state.menuDetail.commentText;
        if (!String(text || "").trim() || state.menuDetail.sending || !addMenuItemComment) return;
        state.menuDetail.commentText = text;
        void addMenuItemComment(text);
      }
    });
  }

  const menuDetailCommentSend = doc.getElementById("menuDetailCommentSend");
  if (menuDetailCommentSend) {
    menuDetailCommentSend.addEventListener("click", () => {
      const inputEl = doc.getElementById("menuDetailCommentInput");
      const text = inputEl ? inputEl.value : state.menuDetail.commentText;
      if (!String(text || "").trim() || state.menuDetail.sending || !addMenuItemComment) return;
      state.menuDetail.commentText = text;
      void addMenuItemComment(text);
    });
  }

  const menuDetailComments = doc.getElementById("menuDetailComments");
  if (menuDetailComments) applyCommentAvatarCache(menuDetailComments);

  // Video-Speise: stummes Auto-Loop + eigener Play/Pause-Button oben links
  // (wie bei Beitraegen, ohne Ton, keine nativen Controls).
  const detailVideo = doc.querySelector("[data-menu-detail-video]");
  if (detailVideo) {
    const toggleBtn = doc.querySelector("[data-menu-video-toggle]");
    const syncVideoIcons = () => {
      const playing = !detailVideo.paused && !detailVideo.ended;
      const playIcon = toggleBtn?.querySelector("[data-video-icon-play]");
      const pauseIcon = toggleBtn?.querySelector("[data-video-icon-pause]");
      if (playIcon) playIcon.classList.toggle("hidden", playing);
      if (pauseIcon) pauseIcon.classList.toggle("hidden", !playing);
    };
    detailVideo.muted = true;
    detailVideo.playsInline = true;
    let autoStarted = false;
    const autoStart = () => {
      if (autoStarted) return;
      // Das Video liegt immer im ersten Galerie-Slot: nur starten, wenn dieser
      // Slot gerade sichtbar ist.
      if (Number(state?.menuDetail?.index || 0) !== 0) return;
      autoStarted = true;
      detailVideo.muted = true;
      const attempt = detailVideo.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
    };
    detailVideo.addEventListener("loadeddata", autoStart);
    detailVideo.addEventListener("canplay", autoStart);
    if (detailVideo.readyState >= 2) autoStart();
    if (toggleBtn) {
      toggleBtn.addEventListener("click", (evt) => {
        evt.stopPropagation();
        detailVideo.muted = true;
        if (detailVideo.paused || detailVideo.ended) {
          void detailVideo.play().catch(() => {});
        } else {
          detailVideo.pause();
        }
      });
    }
    detailVideo.addEventListener("play", syncVideoIcons);
    detailVideo.addEventListener("pause", syncVideoIcons);
    detailVideo.addEventListener("ended", syncVideoIcons);
    syncVideoIcons();
  }

  const gallery = doc.querySelector("[data-menu-gallery]");
  const gallerySlides = gallery
    ? Array.from(gallery.querySelectorAll("[data-menu-gallery-slide]"))
    : [];
  const galleryVideo = gallery ? gallery.querySelector("[data-menu-detail-video]") : null;

  // Alle Galerie-Bilder liegen bereits im DOM. Beim Blaettern wird deshalb nur
  // die Sichtbarkeit umgeschaltet statt das Modal neu zu rendern - so erscheint
  // das naechste Bild sofort, ohne grauen Zwischenzustand.
  const isGallerySlideReady = (slide) => {
    if (!slide) return false;
    const img = slide.querySelector("img");
    if (!img) return true;
    return !!img.complete && Number(img.naturalWidth || 0) > 0;
  };

  const showGallerySlide = (nextIndex) => {
    const total = gallerySlides.length;
    if (total < 2) return false;
    if (!state?.menuDetail?.open || !state.menuDetail.item) return false;
    let idx = Number(nextIndex);
    if (!Number.isFinite(idx)) idx = 0;
    idx = ((Math.trunc(idx) % total) + total) % total;
    let prevIdx = Number(state.menuDetail.index);
    if (!Number.isFinite(prevIdx) || prevIdx < 0 || prevIdx >= total) prevIdx = 0;
    // Ist das Zielbild noch nicht geladen (schwaches Netz), bleibt das bisherige
    // Bild als Hintergrund stehen - dadurch blitzt nie eine graue Flaeche auf.
    const targetReady = isGallerySlideReady(gallerySlides[idx]);
    const backdropIdx = !targetReady && prevIdx !== idx ? prevIdx : -1;
    gallerySlides.forEach((slide, slideIdx) => {
      const isActive = slideIdx === idx;
      const isBackdrop = slideIdx === backdropIdx;
      slide.style.opacity = isActive || isBackdrop ? "" : "0";
      slide.style.pointerEvents = isActive ? "" : "none";
      slide.style.zIndex = isActive ? "2" : (isBackdrop ? "1" : "");
      const img = slide.querySelector("img");
      if (!img) return;
      if (isActive) {
        img.id = "menuDetailHeroImage";
        img.setAttribute("fetchpriority", "high");
      } else if (img.id === "menuDetailHeroImage") {
        img.removeAttribute("id");
      }
    });
    if (backdropIdx >= 0) {
      const targetImg = gallerySlides[idx]?.querySelector("img") || null;
      const backdropSlide = gallerySlides[backdropIdx];
      const hideBackdrop = () => {
        if (Number(state?.menuDetail?.index) !== idx) return;
        backdropSlide.style.opacity = "0";
        backdropSlide.style.zIndex = "";
      };
      if (targetImg) {
        targetImg.addEventListener("load", hideBackdrop, { once: true });
        targetImg.addEventListener("error", hideBackdrop, { once: true });
      }
    }
    if (galleryVideo) {
      if (idx === 0) {
        const played = galleryVideo.play?.();
        if (played && typeof played.catch === "function") played.catch(() => {});
      } else {
        galleryVideo.pause?.();
      }
    }
    state.menuDetail.index = idx;
    return true;
  };

  const goToGalleryIndex = (nextIndex) => {
    if (showGallerySlide(nextIndex)) return;
    setMenuDetailIndex(nextIndex);
  };

  doc.querySelectorAll("[data-menu-gallery-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.menuGalleryNav || "next";
      const delta = dir === "prev" ? -1 : 1;
      goToGalleryIndex(state.menuDetail.index + delta);
    });
  });

  doc.querySelectorAll("[data-menu-gallery-dot]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.menuGalleryDot || "0");
      goToGalleryIndex(idx);
    });
  });

  if (gallery) {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    gallery.addEventListener("pointerdown", (evt) => {
      tracking = true;
      startX = evt.clientX;
      startY = evt.clientY;
      try { gallery.setPointerCapture(evt.pointerId); } catch {}
    });
    gallery.addEventListener("pointerup", (evt) => {
      if (!tracking) return;
      tracking = false;
      try { gallery.releasePointerCapture(evt.pointerId); } catch {}
      const dx = evt.clientX - startX;
      const dy = evt.clientY - startY;
      if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) goToGalleryIndex(state.menuDetail.index + 1);
      else goToGalleryIndex(state.menuDetail.index - 1);
    });
    gallery.addEventListener("pointercancel", () => { tracking = false; });
  }
}
