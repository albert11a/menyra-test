export const CRM_ADMIN_UI_FACADE_VERSION = "crm-admin-ui-facade.v1";

export const CRM_ADMIN_UI_FACADE_DEFERRED_OWNERSHIP = Object.freeze([
  "Route and activeTab ownership remain in social-app until Heart/Admin routing is explicitly moved.",
  "CRM write operations remain outside this facade until the dedicated write facade step.",
  "Business account UI remains grouped here only as a current CRM/Admin-adjacent surface."
]);

function createUiHandler(name, handler) {
  return function crmAdminUiFacadeHandler(...args) {
    if (typeof handler !== "function") {
      throw new Error(`CRM admin UI facade handler missing: ${name}`);
    }
    return handler(...args);
  };
}

export function createCrmAdminUiFacade({
  renderLeadsView,
  renderLeadCreationView,
  renderLeadSettingsView,
  renderLeadModal,
  renderCustomersView,
  renderCustomerModal,
  renderStaffView,
  renderStaffEditorView,
  renderBusinessAccountsView,
  bindCrmStaffEvents,
  bindLeadInlineCreateEvents,
  bindLeadOverlayEvents,
  bindCustomerOverlayEvents,
  bindBusinessAccountsEvents,
  openLeadCreator,
  openLeadSettingsView,
  closeLeadSubview,
  isLeadInlineCreateView,
  syncLeadDerivedFields,
  openStaffEditor,
  closeStaffEditor,
  syncStaffDerivedEmailField,
  syncStaffFormFromDom
} = {}) {
  const renderCrmLeads = createUiHandler("renderLeadsView", renderLeadsView);
  const renderCrmLeadCreation = createUiHandler("renderLeadCreationView", renderLeadCreationView);
  const renderCrmLeadSettings = createUiHandler("renderLeadSettingsView", renderLeadSettingsView);
  const renderCrmLeadModal = createUiHandler("renderLeadModal", renderLeadModal);
  const renderCrmCustomers = createUiHandler("renderCustomersView", renderCustomersView);
  const renderCrmCustomerModal = createUiHandler("renderCustomerModal", renderCustomerModal);
  const renderCrmStaff = createUiHandler("renderStaffView", renderStaffView);
  const renderCrmStaffEditor = createUiHandler("renderStaffEditorView", renderStaffEditorView);
  const renderCrmBusinessAccounts = createUiHandler("renderBusinessAccountsView", renderBusinessAccountsView);
  const bindCrmAdminEvents = createUiHandler("bindCrmStaffEvents", bindCrmStaffEvents);
  const bindCrmLeadInlineCreateEvents = createUiHandler("bindLeadInlineCreateEvents", bindLeadInlineCreateEvents);
  const bindCrmLeadOverlayEvents = createUiHandler("bindLeadOverlayEvents", bindLeadOverlayEvents);
  const bindCrmCustomerOverlayEvents = createUiHandler("bindCustomerOverlayEvents", bindCustomerOverlayEvents);
  const bindCrmBusinessAccountsEvents = createUiHandler("bindBusinessAccountsEvents", bindBusinessAccountsEvents);
  const openCrmLeadCreator = createUiHandler("openLeadCreator", openLeadCreator);
  const openCrmLeadSettingsView = createUiHandler("openLeadSettingsView", openLeadSettingsView);
  const closeCrmLeadSubview = createUiHandler("closeLeadSubview", closeLeadSubview);
  const isCrmLeadInlineCreateView = createUiHandler("isLeadInlineCreateView", isLeadInlineCreateView);
  const syncCrmLeadDerivedFields = createUiHandler("syncLeadDerivedFields", syncLeadDerivedFields);
  const openCrmStaffEditor = createUiHandler("openStaffEditor", openStaffEditor);
  const closeCrmStaffEditor = createUiHandler("closeStaffEditor", closeStaffEditor);
  const syncCrmStaffDerivedEmailField = createUiHandler("syncStaffDerivedEmailField", syncStaffDerivedEmailField);
  const syncCrmStaffFormFromDom = createUiHandler("syncStaffFormFromDom", syncStaffFormFromDom);
  const actionHandlers = Object.freeze({
    openLeadCreator: openCrmLeadCreator,
    openLeadSettingsView: openCrmLeadSettingsView,
    closeLeadSubview: closeCrmLeadSubview,
    isLeadInlineCreateView: isCrmLeadInlineCreateView,
    syncLeadDerivedFields: syncCrmLeadDerivedFields,
    openStaffEditor: openCrmStaffEditor,
    closeStaffEditor: closeCrmStaffEditor,
    syncStaffDerivedEmailField: syncCrmStaffDerivedEmailField,
    syncStaffFormFromDom: syncCrmStaffFormFromDom
  });

  function handleCrmAdminAction(actionName, ...args) {
    const handler = actionHandlers[String(actionName || "")];
    if (typeof handler !== "function") {
      throw new Error(`CRM admin UI facade action missing: ${actionName}`);
    }
    return handler(...args);
  }

  return Object.freeze({
    version: CRM_ADMIN_UI_FACADE_VERSION,
    deferredOwnership: CRM_ADMIN_UI_FACADE_DEFERRED_OWNERSHIP,
    renderCrmLeads,
    renderCrmLeadCreation,
    renderCrmLeadSettings,
    renderCrmLeadModal,
    renderCrmCustomers,
    renderCrmCustomerModal,
    renderCrmStaff,
    renderCrmStaffEditor,
    renderCrmBusinessAccounts,
    bindCrmAdminEvents,
    bindCrmLeadInlineCreateEvents,
    bindCrmLeadOverlayEvents,
    bindCrmCustomerOverlayEvents,
    bindCrmBusinessAccountsEvents,
    openCrmLeadCreator,
    openCrmLeadSettingsView,
    closeCrmLeadSubview,
    isCrmLeadInlineCreateView,
    syncCrmLeadDerivedFields,
    openCrmStaffEditor,
    closeCrmStaffEditor,
    syncCrmStaffDerivedEmailField,
    syncCrmStaffFormFromDom,
    handleCrmAdminAction,
    renderLeadsView: renderCrmLeads,
    renderLeadCreationView: renderCrmLeadCreation,
    renderLeadSettingsView: renderCrmLeadSettings,
    renderLeadModal: renderCrmLeadModal,
    renderCustomersView: renderCrmCustomers,
    renderCustomerModal: renderCrmCustomerModal,
    renderStaffView: renderCrmStaff,
    renderStaffEditorView: renderCrmStaffEditor,
    renderBusinessAccountsView: renderCrmBusinessAccounts,
    bindCrmStaffEventsCore: bindCrmAdminEvents,
    bindLeadInlineCreateEventsCore: bindCrmLeadInlineCreateEvents,
    bindLeadOverlayEventsCore: bindCrmLeadOverlayEvents,
    bindCustomerOverlayEventsCore: bindCrmCustomerOverlayEvents,
    bindBusinessAccountsEvents: bindCrmBusinessAccountsEvents,
    actionHandlers
  });
}
