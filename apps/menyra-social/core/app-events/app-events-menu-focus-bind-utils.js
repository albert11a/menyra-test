export function bindAppMenuFocusEventsCore({
  documentObj,
  state,
  renderFn,
  saveMenuLayoutToStorageFn,
  openMenuModalFn,
  deleteMenuItemByIdFn,
  triggerMenuDetailOpenFromGestureFn,
  updateShopCartQuantityFn,
  openShopCheckoutFn,
  submitShopCheckoutFn,
  updateShopCheckoutFieldFn,
  focusCache,
  focusCacheKeyFn,
  saveFocusEnabledFn,
  openFocusModalFn,
  deleteFocusItemByIdFn,
  setFocusIndexFn,
  toggleProfilePostMenuFn,
  toggleProfilePostWidthFn,
  deleteProfilePostFn,
  setProfileMenuOpenFn,
  profileMenuBound = false,
  mapLocateFn,
  bindNotificationsDelegationFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return { profileMenuBound };
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const saveMenuLayoutToStorage = typeof saveMenuLayoutToStorageFn === "function"
    ? saveMenuLayoutToStorageFn
    : (() => {});
  const openMenuModal = typeof openMenuModalFn === "function" ? openMenuModalFn : (() => {});
  const deleteMenuItemById = typeof deleteMenuItemByIdFn === "function" ? deleteMenuItemByIdFn : null;
  const triggerMenuDetailOpenFromGesture = typeof triggerMenuDetailOpenFromGestureFn === "function"
    ? triggerMenuDetailOpenFromGestureFn
    : (() => {});
  const updateShopCartQuantity = typeof updateShopCartQuantityFn === "function"
    ? updateShopCartQuantityFn
    : (() => {});
  const openShopCheckout = typeof openShopCheckoutFn === "function" ? openShopCheckoutFn : (() => {});
  const submitShopCheckout = typeof submitShopCheckoutFn === "function" ? submitShopCheckoutFn : null;
  const updateShopCheckoutField = typeof updateShopCheckoutFieldFn === "function"
    ? updateShopCheckoutFieldFn
    : (() => {});
  const focusCacheKey = typeof focusCacheKeyFn === "function" ? focusCacheKeyFn : (() => "");
  const saveFocusEnabled = typeof saveFocusEnabledFn === "function" ? saveFocusEnabledFn : null;
  const openFocusModal = typeof openFocusModalFn === "function" ? openFocusModalFn : (() => {});
  const deleteFocusItemById = typeof deleteFocusItemByIdFn === "function" ? deleteFocusItemByIdFn : null;
  const setFocusIndex = typeof setFocusIndexFn === "function" ? setFocusIndexFn : (() => {});
  const toggleProfilePostMenu = typeof toggleProfilePostMenuFn === "function" ? toggleProfilePostMenuFn : (() => {});
  const toggleProfilePostWidth = typeof toggleProfilePostWidthFn === "function" ? toggleProfilePostWidthFn : (() => {});
  const deleteProfilePost = typeof deleteProfilePostFn === "function" ? deleteProfilePostFn : (() => {});
  const setProfileMenuOpen = typeof setProfileMenuOpenFn === "function" ? setProfileMenuOpenFn : (() => {});
  const mapLocate = typeof mapLocateFn === "function" ? mapLocateFn : (() => {});
  const bindNotificationsDelegation = typeof bindNotificationsDelegationFn === "function"
    ? bindNotificationsDelegationFn
    : (() => {});

  const menuSearchInput = doc.getElementById("menuSearchInput");
  if (menuSearchInput) {
    menuSearchInput.addEventListener("input", () => {
      state.menu.query = menuSearchInput.value;
      render();
    });
  }

  doc.querySelectorAll("[data-menu-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.menuFilter || "all";
      state.menu.filter = filter;
      render();
    });
  });

  doc.querySelectorAll("[data-menu-layout-color]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.menuLayoutColor || "";
      if (!color) return;
      state.menuLayout = { ...state.menuLayout, cardColor: color };
      saveMenuLayoutToStorage();
      render();
    });
  });

  doc.querySelectorAll("[data-menu-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openMenuModal("create");
    });
  });

  doc.querySelectorAll("[data-menu-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.menuEdit || "";
      const item = (state.menu.items || []).find((it) => String(it.id) === String(itemId));
      if (!item) return;
      openMenuModal("edit", item);
    });
  });

  doc.querySelectorAll("[data-menu-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.menuDelete || "";
      if (!itemId || !deleteMenuItemById) return;
      void deleteMenuItemById(itemId);
    });
  });

  doc.querySelectorAll("[data-menu-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      triggerMenuDetailOpenFromGesture(btn);
    });
    btn.addEventListener("keydown", (evt) => {
      if (evt.key !== "Enter" && evt.key !== " ") return;
      evt.preventDefault();
      triggerMenuDetailOpenFromGesture(btn);
    });
  });

  doc.querySelectorAll("[data-cart-qty]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.cartQty || "";
      const delta = Number(btn.dataset.cartDelta || "0");
      if (!itemId || !delta) return;
      updateShopCartQuantity(itemId, delta);
    });
  });

  doc.querySelectorAll("[data-cart-checkout]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.cartCheckout || "";
      if (action === "open") {
        openShopCheckout();
        return;
      }
      if (action === "submit" && submitShopCheckout) {
        void submitShopCheckout();
      }
    });
  });

  doc.querySelectorAll("[data-cart-field]").forEach((input) => {
    input.addEventListener("input", () => {
      updateShopCheckoutField(input.dataset.cartField || "", input.value || "");
    });
  });

  const focusEnabledToggle = doc.getElementById("focusEnabledToggle");
  if (focusEnabledToggle) {
    focusEnabledToggle.addEventListener("change", () => {
      const restaurantId = state.userProfile.restaurantId || "";
      if (!restaurantId) return;
      const enabled = !!focusEnabledToggle.checked;
      state.focus.enabled = enabled;
      const cachedItems = state.focus.restaurantId === restaurantId ? (state.focus.items || []) : [];
      focusCache?.set?.(focusCacheKey(restaurantId), { items: cachedItems, enabled, ts: Date.now() });
      if (saveFocusEnabled) void saveFocusEnabled(restaurantId, enabled);
      render();
    });
  }

  doc.querySelectorAll("[data-focus-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openFocusModal("create");
    });
  });

  doc.querySelectorAll("[data-focus-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.focusEdit || "";
      const item = (state.focus.items || []).find((it) => String(it.id) === String(itemId));
      if (!item) return;
      openFocusModal("edit", item);
    });
  });

  doc.querySelectorAll("[data-focus-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemId = btn.dataset.focusDelete || "";
      if (!itemId || !deleteFocusItemById) return;
      void deleteFocusItemById(itemId);
    });
  });

  doc.querySelectorAll("[data-focus-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.focusNav || "next";
      const delta = dir === "prev" ? -1 : 1;
      setFocusIndex(state.focus.index + delta);
    });
  });

  doc.querySelectorAll("[data-focus-dot]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.focusDot || "0");
      setFocusIndex(idx);
    });
  });

  doc.querySelectorAll("[data-profile-menu-button]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const postId = btn.dataset.profileMenuButton;
      if (!postId) return;
      toggleProfilePostMenu(postId);
    });
  });

  doc.querySelectorAll("[data-profile-post-toggle]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const postId = btn.dataset.profilePostToggle;
      if (!postId) return;
      toggleProfilePostWidth(postId);
    });
  });

  doc.querySelectorAll("[data-profile-post-delete]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const postId = btn.dataset.profilePostDelete;
      if (!postId) return;
      deleteProfilePost(postId);
    });
  });

  let nextProfileMenuBound = !!profileMenuBound;
  if (!nextProfileMenuBound) {
    doc.addEventListener("click", (e) => {
      if (!state.profilePostMenuId) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-profile-menu]") || target.closest("[data-profile-menu-button]")) return;
      state.profilePostMenuId = null;
      setProfileMenuOpen(null);
    });
    nextProfileMenuBound = true;
  }

  if (state.profilePostMenuId) {
    setProfileMenuOpen(state.profilePostMenuId);
  }

  const mapLocateBtn = doc.getElementById("mapLocateBtn");
  if (mapLocateBtn) {
    mapLocateBtn.addEventListener("click", () => mapLocate());
  }

  bindNotificationsDelegation();

  return { profileMenuBound: nextProfileMenuBound };
}
