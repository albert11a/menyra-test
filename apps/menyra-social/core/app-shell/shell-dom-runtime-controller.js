function getUnreadNotificationsCount(state = null) {
  if (!state || !Array.isArray(state.notifications)) return 0;
  return state.notifications.filter((item) => !item?.read).length;
}

function getBadgeText(count) {
  const value = Number(count) || 0;
  return value > 9 ? "9+" : String(value);
}

function toggleAvatarFitClasses(node, isBusiness) {
  if (!node) return;
  node.classList.toggle("object-contain", !!isBusiness);
  node.classList.toggle("bg-white", !!isBusiness);
  node.classList.toggle("object-cover", !isBusiness);
}

export function createShellDomRuntimeController({
  state = null,
  brandUi = {},
  documentObj = null,
  windowObj = null,
  db = null,
  getChatUnreadCount = () => 0,
  isGuestSession = () => true,
  isCeoUser = () => false,
  isBusinessOwnerProfile = () => false,
  isLocalBusinessProfile = () => false,
  isRestaurantCafeProfile = () => false,
  getBusinessCatalogLabel = () => "Menu",
  resolveUserAvatar = (value = "") => String(value || "").trim(),
  resolveShellAvatarUrl = () => "",
  resolveHeaderBranding = () => ({ title: "", subtitle: "", logoUrl: "", isBusinessLogo: false }),
  logoFitClass = () => "object-cover",
  roleLabel = (value = "") => String(value || "").trim(),
  buildRoleSwitchUrl = () => "",
  refreshSelfCommentAvatars = () => {},
  renderNotificationsList = () => "",
  saveNotifications = () => {},
  markAllNotificationsRead = async () => {},
  acceptFollowRequest = async () => {},
  openNotificationTarget = async () => {},
  render = () => {},
  getLastRenderMode = () => "",
  getVerifiedMapLocationFn = () => null,
  isPlaceholderUrl = () => false,
  escapeHtml = (value = "") => String(value || ""),
  icon = () => "",
  deleteDocFn = async () => {},
  docFn = null
} = {}) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  const win = windowObj || (typeof window === "undefined" ? null : window);
  const deleteDoc = typeof deleteDocFn === "function" ? deleteDocFn : (async () => {});
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const getVerifiedMapLocation = typeof getVerifiedMapLocationFn === "function"
    ? getVerifiedMapLocationFn
    : (() => null);
  const FEED_VIEWER_LOCATION_STORAGE_KEY = "mnyra_social_feed_viewer_location_v1";

  function normalizeViewerCoords(value = null) {
    const lat = Number(value?.lat ?? value?.latitude ?? value?.y);
    const lng = Number(value?.lng ?? value?.lon ?? value?.longitude ?? value?.x);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  function readStoredViewerLocation() {
    if (!win?.localStorage) return null;
    try {
      const raw = win.localStorage.getItem(FEED_VIEWER_LOCATION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const coords = normalizeViewerCoords(parsed);
      if (!coords) {
        try {
          win.localStorage.removeItem(FEED_VIEWER_LOCATION_STORAGE_KEY);
        } catch {}
        return null;
      }
      return {
        lat: coords.lat,
        lng: coords.lng,
        city: String(parsed?.city || parsed?.label || "").trim(),
        label: String(parsed?.label || parsed?.city || "").trim()
      };
    } catch {
      try {
        win.localStorage.removeItem(FEED_VIEWER_LOCATION_STORAGE_KEY);
      } catch {}
      return null;
    }
  }

  function cleanupLegacyDrawerDocumentState() {
    if (!doc) return;
    doc.documentElement.classList.remove("drawer-open");
    doc.body?.classList?.remove?.("drawer-open");
    if (!doc.body) return;
    doc.body.style.position = "";
    doc.body.style.top = "";
    doc.body.style.left = "";
    doc.body.style.right = "";
    doc.body.style.width = "";
    doc.body.style.overflow = "";
  }

  function syncDrawerOpenUiState() {
    cleanupLegacyDrawerDocumentState();
  }

  function renderAuthScreen() {
    const isRegister = state?.auth?.mode === "register";
    const canClose = !state?.user;
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
          <h1 class="text-4xl font-black italic tracking-tighter text-slate-900">${brandUi.upper || ""}</h1>
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

          ${state?.auth?.error ? `<div class="mt-4 text-center text-rose-500 text-xs font-black bg-rose-50 p-3 rounded-xl">${escapeHtml(state.auth.error)}</div>` : ""}

          <button type="submit" class="w-full mt-8 bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-300 active:scale-95 transition-all flex items-center justify-center gap-2" ${state?.auth?.loading ? "disabled" : ""}>
            ${state?.auth?.loading ? `${icon("loader-2", "w-4 h-4 animate-spin")}` : (isRegister ? "Konto erstellen" : "Weiter")}
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

  function renderRoleSwitchLinks() {
    if (!(state?.user && state?.roleSwitchRoles?.length)) return "";
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

  function renderDrawer() {
    const isGuest = isGuestSession();
    const unread = isGuest ? 0 : getUnreadNotificationsCount(state);
    const chatUnread = isGuest ? 0 : getChatUnreadCount();
    const switchLinks = isGuest ? "" : renderRoleSwitchLinks();
    const isCeo = isCeoUser();
    const isBusinessOwner = isBusinessOwnerProfile(state?.userProfile);
    const catalogLabel = getBusinessCatalogLabel(state?.userProfile);
    const catalogIcon = catalogLabel === "Shop" ? "shopping-bag" : "utensils";
    const showMenuTab = isLocalBusinessProfile(state?.userProfile)
      || !!state?.userProfile?.restaurantId
      || !!state?.roleSwitchRestaurantId
      || isRestaurantCafeProfile(state?.userProfile);
    const isRegisteredUser = !!String(state?.user?.uid || "").trim();
    const avatarUrl = resolveUserAvatar(state?.userProfile?.avatar);
    const avatarFit = logoFitClass(isLocalBusinessProfile(state?.userProfile));
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
        { id: "businessAccounts", label: "Staff", icon: "users-round", hidden: !isBusinessOwner },
        { id: "leads", label: "Leads", icon: "clipboard-list", hidden: !isCeo },
        { id: "staff", label: "Staff", icon: "users-round", hidden: !isCeo },
        { id: "customers", label: "Kunden", icon: "users", hidden: !isCeo },
        { id: "settings", label: "Optionen", icon: "settings" }
      ];
    return `
    <div id="drawerRoot" aria-hidden="${state?.drawerOpen ? "false" : "true"}" class="fixed inset-0 z-[2000] overflow-hidden transition-all duration-500 ${state?.drawerOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"}" style="overscroll-behavior:none; touch-action:none;">
      <div id="drawerOverlay" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${state?.drawerOpen ? "opacity-100" : "opacity-0"}" style="touch-action:none; overscroll-behavior:none;"></div>
      <div id="drawerPanel" class="absolute left-0 top-0 bottom-0 w-80 max-w-[86vw] shadow-2xl transition-transform duration-500 p-8 flex flex-col overflow-y-auto ${state?.drawerOpen ? "translate-x-0" : "-translate-x-full"}" style="background:var(--app-bg); touch-action:pan-y; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; padding-top:calc(var(--safe-area-top) + 2rem); padding-bottom:calc(var(--safe-area-bottom) + 2rem);">
        <div class="flex justify-between items-center mb-10">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${brandUi.title || ""}</span>
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
            <p id="drawerName" class="text-xs font-black">${escapeHtml(isGuest ? "Gast" : (state?.userProfile?.name || "User"))}</p>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">${isGuest ? "Gastmodus" : "Account"}</p>
          </div>
        </div>
        <nav class="space-y-2 flex-1">
          ${navItems.map((item) => {
            const isFavoritesView = state?.activeTab === "profile" && state?.profileTopTab === "favorites";
            const isActive = item.id === "favorites"
              ? isFavoritesView
              : (item.id === "profile"
                ? (state?.activeTab === "profile" && !isFavoritesView)
                : state?.activeTab === item.id);
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

  function updateShellDom() {
    syncDrawerOpenUiState();
    const avatarUrl = resolveShellAvatarUrl();
    const isBusiness = isLocalBusinessProfile(state?.userProfile);
    const isBusinessOwner = isBusinessOwnerProfile(state?.userProfile);
    const branding = resolveHeaderBranding();
    const catalogLabel = getBusinessCatalogLabel(state?.userProfile);
    const catalogIcon = catalogLabel === "Shop" ? "shopping-bag" : "utensils";
    const showMenuTab = isLocalBusinessProfile(state?.userProfile)
      || !!state?.userProfile?.restaurantId
      || !!state?.roleSwitchRestaurantId
      || isRestaurantCafeProfile(state?.userProfile);
    const isRegisteredUser = !!String(state?.user?.uid || "").trim();
    const showCeoTabs = isCeoUser();
    const headerAvatar = doc?.getElementById("headerAvatar");
    if (headerAvatar) {
      const current = headerAvatar.getAttribute("src") || "";
      if (!isPlaceholderUrl(branding.logoUrl) || !current || isPlaceholderUrl(current)) {
        if (current !== branding.logoUrl) headerAvatar.setAttribute("src", branding.logoUrl);
      }
      toggleAvatarFitClasses(headerAvatar, branding.isBusinessLogo);
    }
    const headerTitle = doc?.getElementById("headerTitle");
    if (headerTitle && headerTitle.textContent !== branding.title) {
      headerTitle.textContent = branding.title;
    }
    if (headerTitle) {
      headerTitle.classList.remove("font-elegant", "font-semibold", "tracking-wide");
      headerTitle.classList.add("font-black", "italic", "tracking-tighter");
    }
    const headerSubtitle = doc?.getElementById("headerSubtitle");
    if (headerSubtitle) {
      if (headerSubtitle.textContent !== branding.subtitle) {
        headerSubtitle.textContent = branding.subtitle;
      }
      headerSubtitle.classList.toggle("hidden", !branding.subtitle);
    }
    const drawerAvatar = doc?.getElementById("drawerAvatar");
    if (drawerAvatar) {
      const current = drawerAvatar.getAttribute("src") || "";
      if (!isPlaceholderUrl(avatarUrl) || !current || isPlaceholderUrl(current)) {
        if (current !== avatarUrl) drawerAvatar.setAttribute("src", avatarUrl);
      }
      toggleAvatarFitClasses(drawerAvatar, isBusiness);
    }
    const drawerName = doc?.getElementById("drawerName");
    if (drawerName) drawerName.textContent = state?.userProfile?.name || "User";
    const switchLinks = doc?.getElementById("drawerSwitchLinks");
    if (switchLinks) switchLinks.innerHTML = renderRoleSwitchLinks();
    const menuNavBtn = doc?.querySelector('[data-nav="menu"]');
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
    const favoritesNavBtn = doc?.querySelector('[data-nav="favorites"]');
    if (favoritesNavBtn) {
      favoritesNavBtn.classList.toggle("hidden", !isRegisteredUser);
    }
    const businessAccountsNavBtn = doc?.querySelector('[data-nav="businessAccounts"]');
    if (businessAccountsNavBtn) {
      businessAccountsNavBtn.classList.toggle("hidden", !isBusinessOwner);
    }
    doc?.querySelectorAll?.('[data-nav="leads"], [data-nav="customers"]')?.forEach((btn) => {
      btn.classList.toggle("hidden", !showCeoTabs);
    });
    refreshSelfCommentAvatars({ attempt: 0, maxAttempts: 2 });
    if (win?.lucide?.createIcons) win.lucide.createIcons();
  }

  function updateDrawerDom() {
    syncDrawerOpenUiState();
    const root = doc?.getElementById("drawerRoot");
    const overlay = doc?.getElementById("drawerOverlay");
    const panel = doc?.getElementById("drawerPanel");
    if (!root || !overlay || !panel) return;
    root.classList.toggle("visible", !!state?.drawerOpen);
    root.classList.toggle("invisible", !state?.drawerOpen);
    root.classList.toggle("pointer-events-auto", !!state?.drawerOpen);
    root.classList.toggle("pointer-events-none", !state?.drawerOpen);
    root.setAttribute("aria-hidden", state?.drawerOpen ? "false" : "true");
    overlay.classList.toggle("opacity-100", !!state?.drawerOpen);
    overlay.classList.toggle("opacity-0", !state?.drawerOpen);
    panel.classList.toggle("translate-x-0", !!state?.drawerOpen);
    panel.classList.toggle("-translate-x-full", !state?.drawerOpen);
  }

  function updateNotificationBadges() {
    const unread = isGuestSession() ? 0 : getUnreadNotificationsCount(state);
    const chatUnread = isGuestSession() ? 0 : getChatUnreadCount();
    const headerUnread = unread + chatUnread;
    const headerBadgeText = getBadgeText(headerUnread);
    const notifBadgeText = getBadgeText(unread);
    const chatBadgeText = getBadgeText(chatUnread);
    const headerBadgeAnchor = doc?.querySelector?.('[data-header-badge-anchor="true"]')
      || doc?.getElementById("drawerToggle");
    if (headerBadgeAnchor) {
      headerBadgeAnchor.style.position = "relative";
      let badge = headerBadgeAnchor.querySelector('[data-unread-badge="header"]');
      if (headerUnread > 0) {
        if (!badge) {
          badge = doc.createElement("span");
          badge.dataset.unreadBadge = "header";
          badge.className = "absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg";
          headerBadgeAnchor.appendChild(badge);
        }
        if (badge.textContent !== headerBadgeText) badge.textContent = headerBadgeText;
      } else if (badge) {
        badge.remove();
      }
    }

    const drawerNotifBtn = doc?.querySelector('[data-nav="notifications"]');
    if (drawerNotifBtn) {
      let badge = drawerNotifBtn.querySelector('[data-unread-badge="drawer"]');
      if (unread > 0) {
        if (!badge) {
          badge = doc.createElement("span");
          badge.dataset.unreadBadge = "drawer";
          badge.className = "bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md";
          drawerNotifBtn.appendChild(badge);
        }
        if (badge.textContent !== notifBadgeText) badge.textContent = notifBadgeText;
      } else if (badge) {
        badge.remove();
      }
    }

    const drawerChatBtn = doc?.querySelector('[data-nav="chat"]');
    if (drawerChatBtn) {
      let badge = drawerChatBtn.querySelector('[data-chat-badge="drawer"]');
      if (chatUnread > 0) {
        if (!badge) {
          badge = doc.createElement("span");
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

  function bindNotificationsDelegation() {
    const view = doc?.getElementById("notificationsView");
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
        const notif = state?.notifications?.find((item) => item.id === id) || null;
        state.notifications = (state.notifications || []).filter((item) => item.id !== id);
        saveNotifications(state.notifications);
        updateNotificationsDom();
        if (state?.user?.uid && makeDocRef && db) {
          void deleteDoc(makeDocRef(db, "users", state.user.uid, "notifications", id));
          if (notif?.type === "follow_request" && notif.userUid) {
            void deleteDoc(makeDocRef(db, "users", state.user.uid, "followRequests", notif.userUid));
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

  function updateNotificationsDom() {
    updateNotificationBadges();
    if (state?.activeTab !== "notifications" || getLastRenderMode() !== "main") return false;
    const list = doc?.getElementById("notificationsList");
    if (!list) return false;
    list.innerHTML = renderNotificationsList(state?.notifications || []);
    if (win?.lucide?.createIcons) win.lucide.createIcons();
    bindNotificationsDelegation();
    return true;
  }

  function handleNotificationsUpdate(items) {
    state.notifications = Array.isArray(items) ? items : [];
    saveNotifications(state.notifications);
    const updated = updateNotificationsDom();
    if (!updated && state?.activeTab === "notifications") {
      render();
    }
  }

  return {
    renderAuthScreen,
    renderRoleSwitchLinks,
    renderDrawer,
    updateShellDom,
    updateDrawerDom,
    updateNotificationBadges,
    updateNotificationsDom,
    bindNotificationsDelegation,
    handleNotificationsUpdate
  };
}
