import {
  renderAppFooterCore,
  shouldShowAppFooterCore
} from "./app-footer-render-utils.js";

export function renderMainCore({
  state,
  brandTitle = "MNYRA",
  renderHomeViewFn,
  renderFeedViewFn,
  renderRestaurantsViewFn,
  renderVoucherFeedViewFn,
  renderVoucherAdminViewFn,
  renderGoViewFn,
  renderGoAdminViewFn,
  renderAdsViewFn,
  renderTravelViewFn,
  renderShoppingViewFn,
  renderChatViewFn,
  renderSearchViewFn,
  renderMapViewFn,
  renderPublicProfileViewFn,
  renderProfileViewFn,
  renderMenuAdminViewFn,
  renderOrdersViewFn,
  renderAnalyticsViewFn,
  renderDashboardViewFn,
  renderStaffViewFn,
  renderBusinessAccountsViewFn,
  renderSettingsViewFn,
  renderNotificationsViewFn,
  renderUploadViewFn,
  renderDrawerFn,
  renderHeaderFn,
  renderBusinessTopTabsFn,
  routeRuntimeRegistry
} = {}) {
  const escapeHtml = (value = "") => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  const renderHomeView = typeof renderHomeViewFn === "function" ? renderHomeViewFn : (() => "");
  const renderFeedView = typeof renderFeedViewFn === "function" ? renderFeedViewFn : (() => "");
  const renderRestaurantsView = typeof renderRestaurantsViewFn === "function" ? renderRestaurantsViewFn : (() => "");
  const renderVoucherFeedView = typeof renderVoucherFeedViewFn === "function" ? renderVoucherFeedViewFn : (() => "");
  const renderVoucherAdminView = typeof renderVoucherAdminViewFn === "function" ? renderVoucherAdminViewFn : (() => "");
  const renderGoView = typeof renderGoViewFn === "function" ? renderGoViewFn : (() => "");
  const renderGoAdminView = typeof renderGoAdminViewFn === "function" ? renderGoAdminViewFn : (() => "");
  const renderAdsView = typeof renderAdsViewFn === "function" ? renderAdsViewFn : (() => "");
  const renderTravelView = typeof renderTravelViewFn === "function" ? renderTravelViewFn : (() => "");
  const renderShoppingView = typeof renderShoppingViewFn === "function" ? renderShoppingViewFn : (() => "");
  const renderChatView = typeof renderChatViewFn === "function" ? renderChatViewFn : (() => "");
  const renderSearchView = typeof renderSearchViewFn === "function" ? renderSearchViewFn : (() => "");
  const renderMapView = typeof renderMapViewFn === "function" ? renderMapViewFn : (() => "");
  const renderPublicProfileView = typeof renderPublicProfileViewFn === "function" ? renderPublicProfileViewFn : (() => "");
  const renderProfileView = typeof renderProfileViewFn === "function" ? renderProfileViewFn : (() => "");
  const renderMenuAdminView = typeof renderMenuAdminViewFn === "function" ? renderMenuAdminViewFn : (() => "");
  const renderOrdersView = typeof renderOrdersViewFn === "function" ? renderOrdersViewFn : (() => "");
  const renderAnalyticsView = typeof renderAnalyticsViewFn === "function" ? renderAnalyticsViewFn : (() => "");
  const renderDashboardView = typeof renderDashboardViewFn === "function" ? renderDashboardViewFn : (() => "");
  const renderStaffView = typeof renderStaffViewFn === "function" ? renderStaffViewFn : (() => "");
  const renderBusinessAccountsView = typeof renderBusinessAccountsViewFn === "function" ? renderBusinessAccountsViewFn : (() => "");
  const renderSettingsView = typeof renderSettingsViewFn === "function" ? renderSettingsViewFn : (() => "");
  const renderNotificationsView = typeof renderNotificationsViewFn === "function" ? renderNotificationsViewFn : (() => "");
  const renderUploadView = typeof renderUploadViewFn === "function" ? renderUploadViewFn : (() => "");
  const renderDrawer = typeof renderDrawerFn === "function" ? renderDrawerFn : (() => "");
  const renderHeader = typeof renderHeaderFn === "function" ? renderHeaderFn : (() => "");
  const renderBusinessTopTabs = typeof renderBusinessTopTabsFn === "function" ? renderBusinessTopTabsFn : (() => "");
  const canUseRouteRuntimeRegistry = routeRuntimeRegistry
    && typeof routeRuntimeRegistry.renderActiveRoute === "function";
  const socialAccessMode = String(state?.userProfile?.socialAccessMode || "").trim().toLowerCase();
  const hasRestrictedSocialAccess = socialAccessMode === "waiteronly" || socialAccessMode === "blocked";

  let view = "";
  if (hasRestrictedSocialAccess) {
    const restrictedTitle = socialAccessMode === "waiteronly"
      ? "I lejuar vetem per Waiter-App"
      : "Account gesperrt";
    const restrictedBody = String(state?.userProfile?.socialAccessMessage || "").trim()
      || (socialAccessMode === "waiteronly"
        ? "Kjo llogari stafi nuk mund te levize ne zonen e biznesit te Menyra Social."
        : "Kjo llogari stafi nuk mund ta perdore Menyra Social per momentin.");
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
  } else if (canUseRouteRuntimeRegistry) {
    view = routeRuntimeRegistry.renderActiveRoute();
  } else {
    if (state?.activeTab === "home") view = renderFeedView();
    if (state?.activeTab === "feed") view = renderFeedView();
    if (state?.activeTab === "restaurants") view = renderRestaurantsView();
    if (state?.activeTab === "ofertat") view = renderVoucherFeedView();
    if (state?.activeTab === "ofertatbiznes") view = renderVoucherAdminView();
    if (state?.activeTab === "go") view = renderGoView();
    if (state?.activeTab === "gobiznes") view = renderGoAdminView();
    if (state?.activeTab === "reklama") view = renderAdsView();
    if (state?.activeTab === "travel") view = renderTravelView();
    if (state?.activeTab === "shopping") view = renderShoppingView();
    if (state?.activeTab === "chat") view = renderChatView();
    if (state?.activeTab === "search") view = renderSearchView();
    if (state?.activeTab === "map") view = renderMapView();
    if (state?.activeTab === "profile") view = state?.profileView ? renderPublicProfileView() : renderProfileView();
    if (state?.activeTab === "menu") view = renderMenuAdminView();
    if (state?.activeTab === "orders") view = renderOrdersView();
    if (state?.activeTab === "analytics") view = renderAnalyticsView();
    if (state?.activeTab === "dashboard") view = renderDashboardView();
    if (state?.activeTab === "staff") view = renderStaffView();
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
    || !!state?.chatModal?.open;
  const smartHeaderBlockedState = (state?.activeTab === "staff" && state?.staff?.view === "form")
    || (state?.activeTab === "chat" && state?.chatModal?.open && state?.chatModal?.profile);
  const isBusinessProfile = !!String(profile?.restaurantId || "").trim()
    || String(profile?.role || "").trim().toLowerCase() === "business";
  const isLandingTopTab = state?.activeTab === "profile"
    && String(state?.profileTopTab || "").trim().toLowerCase() === "landing";
  const hasSmartHeader = !!String(state?.activeTab || "").trim()
    && state?.activeTab !== "map"
    && !smartHeaderBlockedState;
  const hasSmartHeaderContentGap = hasSmartHeader && !isLandingTopTab;
  const hasSmartHeaderTabs = hasSmartHeader
    && state?.activeTab === "profile"
    && isBusinessProfile
    && !smartHeaderOverlayIsolationActive
    && !isLandingTopTab;
  const isMapView = state?.activeTab === "map";
  const isChatThreadOpen = state?.activeTab === "chat" && state?.chatModal?.open && state?.chatModal?.profile;
  const shellClass = isChatThreadOpen
    ? "app-shell app-shell--chat-open bg-slate-50 text-slate-900 max-w-md mx-auto md:shadow-2xl relative flex flex-col font-sans"
    : (isMapView
      ? "app-shell app-shell--map bg-slate-50 text-slate-900 w-full max-w-none relative font-sans"
      : "app-shell bg-slate-50 text-slate-900 max-w-md mx-auto md:shadow-2xl relative font-sans");
  const mainClass = isChatThreadOpen
    ? "flex-1 min-h-0 flex flex-col overflow-hidden"
    : `app-main-scroll${isMapView ? " app-main-scroll--with-map-fixed-header app-main-scroll--map-fill" : ""}${hasBusinessTopTabs ? " app-main-scroll--with-business-tabs" : ""}${hasSmartHeaderContentGap ? " app-main-scroll--with-smart-header" : ""}${hasSmartHeaderTabs ? " app-main-scroll--with-smart-header-tabs" : ""}${isLandingTopTab ? " app-main-scroll--landing" : ""}`;
  const headerHtml = renderHeader();
  const shellHeaderHtml = isMapView
    ? `<div class="map-fixed-page-header">${headerHtml}</div>`
    : (hasSmartHeader ? headerHtml : "");
  const mainHeaderHtml = isMapView
    ? ""
    : (hasSmartHeader
    ? ""
    : headerHtml);
  // Der Fuss steht ganz am Ende von <main> - im Fluss, hinter dem Inhalt.
  // Dort, wo eine Ansicht kein Seitenende hat, steht er nicht.
  const footerHtml = shouldShowAppFooterCore({ isMapView, isChatThreadOpen, isLandingTopTab })
    ? renderAppFooterCore({ brandTitle, escapeHtmlFn: escapeHtml })
    : "";

  return `
    <div class="${shellClass}">
      ${renderDrawer()}
      ${shellHeaderHtml}
      <main class="${mainClass}">
        ${mainHeaderHtml}
        ${businessTopTabsHtml}
        ${view}
        ${footerHtml}
      </main>
    </div>
  `;
}
