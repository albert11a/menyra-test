import {
  CRM_ADMIN_DOMAINS,
  CRM_ADMIN_FACADE_CONTRACT,
  CRM_ADMIN_FACADE_CONTRACT_VERSION,
  CRM_ADMIN_REQUIRED_FUNCTIONS,
  assertCrmAdminFacadeContractShape
} from "./crm-admin-facade-contract.js";
import { createCrmAdminReadFacade } from "./crm-admin-read-facade.js";
import { createCrmAdminUiFacade } from "./crm-admin-ui-facade.js";
import { createCrmAdminLeadWriteFacade } from "./crm-admin-lead-write-facade.js";
import { createCrmAdminLeadConversionFacade } from "./crm-admin-lead-conversion-facade.js";
import { createCrmAdminCustomerWriteFacade } from "./crm-admin-customer-write-facade.js";
import { createCrmAdminStaffWriteFacade } from "./crm-admin-staff-write-facade.js";
import { createCrmAdminBusinessAccountWriteFacade } from "./crm-admin-business-account-write-facade.js";

export const CRM_ADMIN_MIGRATION_ADAPTER_VERSION = "crm-admin-migration-adapter.v1";

export const CRM_ADMIN_MIGRATION_ADAPTER_UNSPECIFIED = Object.freeze([
  "Customer delete/remove is not exposed because no safe existing customer delete facade exists.",
  "Business account delete/remove is not exposed because no safe existing business account delete facade exists.",
  "Heart/Admin route ownership remains unwired until the explicit Heart/Admin integration step."
]);

function getFacadeDeps(deps = {}, groupName) {
  const rootDeps = deps && typeof deps === "object" ? deps : {};
  const groupDeps = rootDeps[groupName] && typeof rootDeps[groupName] === "object"
    ? rootDeps[groupName]
    : {};

  return {
    ...rootDeps,
    ...groupDeps
  };
}

function freezeGroup(group) {
  return Object.freeze(group);
}

export function createCrmAdminMigrationAdapter(deps = {}) {
  assertCrmAdminFacadeContractShape(CRM_ADMIN_FACADE_CONTRACT);

  const readFacade = createCrmAdminReadFacade(getFacadeDeps(deps, "read"));
  const uiFacade = createCrmAdminUiFacade(getFacadeDeps(deps, "ui"));
  const leadWriteFacade = createCrmAdminLeadWriteFacade(getFacadeDeps(deps, "leadWrite"));
  const leadConversionFacade = createCrmAdminLeadConversionFacade(getFacadeDeps(deps, "leadConversion"));
  const customerWriteFacade = createCrmAdminCustomerWriteFacade(getFacadeDeps(deps, "customerWrite"));
  const staffWriteFacade = createCrmAdminStaffWriteFacade(getFacadeDeps(deps, "staffWrite"));
  const businessAccountWriteFacade = createCrmAdminBusinessAccountWriteFacade(
    getFacadeDeps(deps, "businessAccountWrite")
  );

  const leads = freezeGroup({
    load: readFacade.loadCrmLeads,
    save: leadWriteFacade.saveCrmLead,
    delete: leadWriteFacade.deleteCrmLead,
    convertToCustomer: leadConversionFacade.convertCrmLeadToCustomer,
    render: uiFacade.renderCrmLeads,
    renderCreate: uiFacade.renderCrmLeadCreation,
    renderSettings: uiFacade.renderCrmLeadSettings,
    renderModal: uiFacade.renderCrmLeadModal,
    bindInlineCreate: uiFacade.bindCrmLeadInlineCreateEvents,
    bindOverlay: uiFacade.bindCrmLeadOverlayEvents,
    openCreator: uiFacade.openCrmLeadCreator,
    openSettings: uiFacade.openCrmLeadSettingsView,
    closeSubview: uiFacade.closeCrmLeadSubview,
    isInlineCreateView: uiFacade.isCrmLeadInlineCreateView,
    syncDerivedFields: uiFacade.syncCrmLeadDerivedFields
  });

  const customers = freezeGroup({
    load: readFacade.loadCrmCustomers,
    save: customerWriteFacade.saveCrmCustomer,
    render: uiFacade.renderCrmCustomers,
    renderModal: uiFacade.renderCrmCustomerModal,
    bindOverlay: uiFacade.bindCrmCustomerOverlayEvents
  });

  const staff = freezeGroup({
    load: readFacade.loadCrmStaff,
    loadCeo: readFacade.loadCrmCeoStaff,
    loadRestaurant: readFacade.loadCrmRestaurantStaff,
    save: staffWriteFacade.saveCrmStaff,
    saveCeo: staffWriteFacade.saveCrmCeoStaff,
    remove: staffWriteFacade.removeCrmStaff,
    removeCeo: staffWriteFacade.removeCrmCeoStaff,
    render: uiFacade.renderCrmStaff,
    renderEditor: uiFacade.renderCrmStaffEditor,
    bind: uiFacade.bindCrmAdminEvents,
    openEditor: uiFacade.openCrmStaffEditor,
    closeEditor: uiFacade.closeCrmStaffEditor,
    syncDerivedEmailField: uiFacade.syncCrmStaffDerivedEmailField,
    syncFormFromDom: uiFacade.syncCrmStaffFormFromDom
  });

  const businessAccounts = freezeGroup({
    load: readFacade.loadCrmBusinessAccounts,
    save: businessAccountWriteFacade.saveCrmBusinessAccount,
    update: businessAccountWriteFacade.updateCrmBusinessAccount,
    render: uiFacade.renderCrmBusinessAccounts,
    bind: uiFacade.bindCrmBusinessAccountsEvents
  });

  const ui = freezeGroup({
    render: freezeGroup({
      leads: uiFacade.renderCrmLeads,
      leadCreate: uiFacade.renderCrmLeadCreation,
      leadSettings: uiFacade.renderCrmLeadSettings,
      leadModal: uiFacade.renderCrmLeadModal,
      customers: uiFacade.renderCrmCustomers,
      customerModal: uiFacade.renderCrmCustomerModal,
      staff: uiFacade.renderCrmStaff,
      staffEditor: uiFacade.renderCrmStaffEditor,
      businessAccounts: uiFacade.renderCrmBusinessAccounts
    }),
    bind: freezeGroup({
      staff: uiFacade.bindCrmAdminEvents,
      leadInlineCreate: uiFacade.bindCrmLeadInlineCreateEvents,
      leadOverlay: uiFacade.bindCrmLeadOverlayEvents,
      customerOverlay: uiFacade.bindCrmCustomerOverlayEvents,
      businessAccounts: uiFacade.bindCrmBusinessAccountsEvents
    }),
    handleAction: uiFacade.handleCrmAdminAction,
    actionHandlers: uiFacade.actionHandlers,
    deferredOwnership: uiFacade.deferredOwnership
  });

  const contract = freezeGroup({
    version: CRM_ADMIN_FACADE_CONTRACT_VERSION,
    domains: CRM_ADMIN_DOMAINS,
    requiredFunctions: CRM_ADMIN_REQUIRED_FUNCTIONS,
    full: CRM_ADMIN_FACADE_CONTRACT,
    assertShape: assertCrmAdminFacadeContractShape
  });

  const facades = freezeGroup({
    read: readFacade,
    ui: uiFacade,
    leadWrite: leadWriteFacade,
    leadConversion: leadConversionFacade,
    customerWrite: customerWriteFacade,
    staffWrite: staffWriteFacade,
    businessAccountWrite: businessAccountWriteFacade
  });

  return freezeGroup({
    version: CRM_ADMIN_MIGRATION_ADAPTER_VERSION,
    leads,
    customers,
    staff,
    businessAccounts,
    ui,
    contract,
    facades,
    unspecified: CRM_ADMIN_MIGRATION_ADAPTER_UNSPECIFIED
  });
}
