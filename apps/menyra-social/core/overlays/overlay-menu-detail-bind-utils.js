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
  bindModalDismiss(menuDetailOverlay, closeMenuDetail, { selfOnly: true });
  bindModalDismiss(menuDetailClose, closeMenuDetail);

  const handleAddToCart = () => {
    const item = state.menuDetail.item;
    const profile = getMenuDetailCatalogProfile(item);
    if (!item || !canAddToShopCart(profile)) return;
    const stockRaw = item.stock;
    const stockValue = typeof stockRaw === "string" ? stockRaw.trim() : stockRaw;
    const parsedStock = stockValue === "" || stockValue === null || stockValue === undefined
      ? null
      : Number(stockValue);
    const stock = parsedStock === null || !Number.isFinite(parsedStock) ? null : Math.max(0, parsedStock);
    if (item.available === false || stock === 0) return;
    addMenuItemToShopCart(item, profile, {
      size: state.menuDetail.selectedSize || "",
      color: state.menuDetail.selectedColor || ""
    });
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

  const menuDetailHeaderFavoritesBtn = doc.getElementById("menuDetailHeaderFavoritesBtn");
  if (menuDetailHeaderFavoritesBtn) {
    menuDetailHeaderFavoritesBtn.addEventListener("click", () => {
      if (!String(state.user?.uid || "").trim()) {
        openGuestAuthPrompt("Bitte registrieren oder einloggen, um Favoriten zu nutzen.");
        return;
      }
      if (!toggleMenuItemLike) return;
      void toggleMenuItemLike();
    });
  }

  doc.querySelectorAll("[data-menu-detail-variant]").forEach((input) => {
    input.addEventListener("change", () => {
      const field = input.dataset.menuDetailVariant || "";
      setMenuDetailVariant(field, input.value || "");
    });
  });

  const footerCartView = doc.getElementById("footer-cart-view");
  const footerCommentView = doc.getElementById("footer-comment-view");
  const menuDetailFooterCommentToggle = doc.getElementById("menuDetailFooterCommentToggle");
  const menuDetailFooterCartToggle = doc.getElementById("menuDetailFooterCartToggle");
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
      win?.setTimeout?.(() => {
        try {
          menuDetailCommentInput.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } catch {}
      }, 180);
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

  doc.querySelectorAll("[data-menu-gallery-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.menuGalleryNav || "next";
      const delta = dir === "prev" ? -1 : 1;
      setMenuDetailIndex(state.menuDetail.index + delta);
    });
  });

  doc.querySelectorAll("[data-menu-gallery-dot]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.menuGalleryDot || "0");
      setMenuDetailIndex(idx);
    });
  });

  const gallery = doc.querySelector("[data-menu-gallery]");
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
      if (dx < 0) setMenuDetailIndex(state.menuDetail.index + 1);
      else setMenuDetailIndex(state.menuDetail.index - 1);
    });
    gallery.addEventListener("pointercancel", () => { tracking = false; });
  }
}
