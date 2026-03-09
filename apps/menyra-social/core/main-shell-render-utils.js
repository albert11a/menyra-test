export function renderMainCore({
  state,
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
  renderSettingsViewFn,
  renderNotificationsViewFn,
  renderUploadViewFn,
  renderDrawerFn,
  renderHeaderFn,
  renderBusinessTopTabsFn
} = {}) {
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
  const renderSettingsView = typeof renderSettingsViewFn === "function" ? renderSettingsViewFn : (() => "");
  const renderNotificationsView = typeof renderNotificationsViewFn === "function" ? renderNotificationsViewFn : (() => "");
  const renderUploadView = typeof renderUploadViewFn === "function" ? renderUploadViewFn : (() => "");
  const renderDrawer = typeof renderDrawerFn === "function" ? renderDrawerFn : (() => "");
  const renderHeader = typeof renderHeaderFn === "function" ? renderHeaderFn : (() => "");
  const renderBusinessTopTabs = typeof renderBusinessTopTabsFn === "function" ? renderBusinessTopTabsFn : (() => "");

  let view = "";
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
  if (state?.activeTab === "settings") view = renderSettingsView();
  if (state?.activeTab === "notifications") view = renderNotificationsView();
  if (state?.activeTab === "upload") view = renderUploadView();
  const isChatThreadOpen = state?.activeTab === "chat" && state?.chatModal?.open && state?.chatModal?.profile;
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
