export function renderMainCore({
  state,
  renderHomeViewFn,
  renderFeedViewFn,
  renderChatViewFn,
  renderSearchViewFn,
  renderMapViewFn,
  renderPublicProfileViewFn,
  renderProfileViewFn,
  renderMenuAdminViewFn,
  renderOrdersViewFn,
  renderLeadsViewFn,
  renderStaffViewFn,
  renderCustomersViewFn,
  renderBusinessAccountsViewFn,
  renderSettingsViewFn,
  renderNotificationsViewFn,
  renderUploadViewFn,
  renderDrawerFn,
  renderHeaderFn,
  renderBusinessTopTabsFn
} = {}) {
  const escapeHtml = (value = "") => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  const renderHomeView = typeof renderHomeViewFn === "function" ? renderHomeViewFn : (() => "");
  const renderFeedView = typeof renderFeedViewFn === "function" ? renderFeedViewFn : (() => "");
  const renderChatView = typeof renderChatViewFn === "function" ? renderChatViewFn : (() => "");
  const renderSearchView = typeof renderSearchViewFn === "function" ? renderSearchViewFn : (() => "");
  const renderMapView = typeof renderMapViewFn === "function" ? renderMapViewFn : (() => "");
  const renderPublicProfileView = typeof renderPublicProfileViewFn === "function" ? renderPublicProfileViewFn : (() => "");
  const renderProfileView = typeof renderProfileViewFn === "function" ? renderProfileViewFn : (() => "");
  const renderMenuAdminView = typeof renderMenuAdminViewFn === "function" ? renderMenuAdminViewFn : (() => "");
  const renderOrdersView = typeof renderOrdersViewFn === "function" ? renderOrdersViewFn : (() => "");
  const renderLeadsView = typeof renderLeadsViewFn === "function" ? renderLeadsViewFn : (() => "");
  const renderStaffView = typeof renderStaffViewFn === "function" ? renderStaffViewFn : (() => "");
  const renderCustomersView = typeof renderCustomersViewFn === "function" ? renderCustomersViewFn : (() => "");
  const renderBusinessAccountsView = typeof renderBusinessAccountsViewFn === "function" ? renderBusinessAccountsViewFn : (() => "");
  const renderSettingsView = typeof renderSettingsViewFn === "function" ? renderSettingsViewFn : (() => "");
  const renderNotificationsView = typeof renderNotificationsViewFn === "function" ? renderNotificationsViewFn : (() => "");
  const renderUploadView = typeof renderUploadViewFn === "function" ? renderUploadViewFn : (() => "");
  const renderDrawer = typeof renderDrawerFn === "function" ? renderDrawerFn : (() => "");
  const renderHeader = typeof renderHeaderFn === "function" ? renderHeaderFn : (() => "");
  const renderBusinessTopTabs = typeof renderBusinessTopTabsFn === "function" ? renderBusinessTopTabsFn : (() => "");
  const socialAccessMode = String(state?.userProfile?.socialAccessMode || "").trim().toLowerCase();
  const hasRestrictedSocialAccess = socialAccessMode === "waiteronly" || socialAccessMode === "blocked";

  let view = "";
  if (hasRestrictedSocialAccess) {
    const restrictedTitle = socialAccessMode === "waiteronly"
      ? "Nur Waiter-App freigegeben"
      : "Account gesperrt";
    const restrictedBody = String(state?.userProfile?.socialAccessMessage || "").trim()
      || (socialAccessMode === "waiteronly"
        ? "Dieser Staff-Account kann sich nicht im Business-Bereich von Menyra Social bewegen."
        : "Dieser Staff-Account kann Menyra Social aktuell nicht nutzen.");
    view = `
      <section class="p-6 pb-24">
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 text-center">
          <div class="w-20 h-20 mx-auto mb-6 rounded-[2rem] bg-slate-100 text-slate-400 flex items-center justify-center text-2xl font-black">!</div>
          <h2 class="text-xl font-black tracking-tight text-slate-900">${escapeHtml(restrictedTitle)}</h2>
          <p class="mt-3 text-sm text-slate-500 leading-6">${escapeHtml(restrictedBody)}</p>
          ${socialAccessMode === "waiteronly"
            ? `<a href="/waiter/" class="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest px-6 py-4">Zur Waiter-App</a>`
            : ""
          }
        </div>
      </section>
    `;
  } else {
    if (state?.activeTab === "home") view = renderFeedView();
    if (state?.activeTab === "feed") view = renderFeedView();
    if (state?.activeTab === "chat") view = renderChatView();
    if (state?.activeTab === "search") view = renderSearchView();
    if (state?.activeTab === "map") view = renderMapView();
    if (state?.activeTab === "profile") view = state?.profileView ? renderPublicProfileView() : renderProfileView();
    if (state?.activeTab === "menu") view = renderMenuAdminView();
    if (state?.activeTab === "orders") view = renderOrdersView();
    if (state?.activeTab === "leads") view = renderLeadsView();
    if (state?.activeTab === "staff") view = renderStaffView();
    if (state?.activeTab === "customers") view = renderCustomersView();
    if (state?.activeTab === "businessAccounts") view = renderBusinessAccountsView();
    if (state?.activeTab === "settings") view = renderSettingsView();
    if (state?.activeTab === "notifications") view = renderNotificationsView();
    if (state?.activeTab === "upload") view = renderUploadView();
  }
  const businessTopTabsHtml = renderBusinessTopTabs();
  const hasBusinessTopTabs = !!String(businessTopTabsHtml || "").trim();
  const profile = state?.profileView?.profile || state?.userProfile || null;
  const smartHeaderOverlayIsolationActive = !!state?.profileModal?.open
    || !!state?.postModal?.open
    || !!state?.likesModal?.open
    || !!state?.menuModal?.open
    || !!state?.menuDetail?.open
    || !!state?.focusModal?.open
    || !!state?.leadModal?.open
    || !!state?.customerModal?.open
    || !!state?.chatModal?.open;
  const smartHeaderBlockedState = (state?.activeTab === "staff" && state?.staff?.view === "form")
    || (state?.activeTab === "leads" && (state?.leads?.view === "create" || state?.leads?.view === "settings"))
    || (state?.activeTab === "chat" && state?.chatModal?.open && state?.chatModal?.profile);
  const isBusinessProfile = !!String(profile?.restaurantId || "").trim()
    || String(profile?.role || "").trim().toLowerCase() === "business";
  const hasSmartHeader = !!String(state?.activeTab || "").trim()
    && state?.activeTab !== "map"
    && !smartHeaderBlockedState;
  const hasSmartHeaderTabs = hasSmartHeader
    && state?.activeTab === "profile"
    && isBusinessProfile
    && !smartHeaderOverlayIsolationActive;
  const isMapView = state?.activeTab === "map";
  const isChatThreadOpen = state?.activeTab === "chat" && state?.chatModal?.open && state?.chatModal?.profile;
  const shellClass = isChatThreadOpen
    ? "app-shell app-shell--chat-open bg-slate-50 text-slate-900 max-w-md mx-auto md:shadow-2xl relative flex flex-col font-sans"
    : "app-shell bg-slate-50 text-slate-900 max-w-md mx-auto md:shadow-2xl relative font-sans";
  const mainClass = isChatThreadOpen
    ? "flex-1 min-h-0 flex flex-col overflow-hidden"
    : `app-main-scroll${isMapView ? " app-main-scroll--with-map-fixed-header" : ""}${hasBusinessTopTabs ? " app-main-scroll--with-business-tabs" : ""}${hasSmartHeader ? " app-main-scroll--with-smart-header" : ""}${hasSmartHeaderTabs ? " app-main-scroll--with-smart-header-tabs" : ""}`;
  const headerHtml = renderHeader();
  const shellHeaderHtml = isMapView
    ? `<div class="map-fixed-page-header">${headerHtml}</div>`
    : (hasSmartHeader ? headerHtml : "");
  const mainHeaderHtml = isMapView
    ? ""
    : (hasSmartHeader
    ? ""
    : headerHtml);

  return `
    <div class="${shellClass}">
      ${renderDrawer()}
      ${shellHeaderHtml}
      <main class="${mainClass}">
        ${mainHeaderHtml}
        ${businessTopTabsHtml}
        ${view}
      </main>
    </div>
  `;
}
