export const CRM_ADMIN_READ_FACADE_VERSION = "crm-admin-read-facade.v1";

function createReadLoader(name, loader) {
  return function crmAdminReadFacadeLoader(...args) {
    if (typeof loader !== "function") {
      throw new Error(`CRM admin read facade loader missing: ${name}`);
    }
    return loader(...args);
  };
}

export function createCrmAdminReadFacade({
  loadLeads,
  loadCustomers,
  loadCeoStaff,
  loadRestaurantStaff,
  loadBusinessAccounts
} = {}) {
  const loadCrmLeads = createReadLoader("loadLeads", loadLeads);
  const loadCrmCustomers = createReadLoader("loadCustomers", loadCustomers);
  const loadCrmStaff = createReadLoader("loadCeoStaff", loadCeoStaff);
  const loadCrmBusinessAccounts = createReadLoader("loadBusinessAccounts", loadBusinessAccounts);
  const loadCrmRestaurantStaff = createReadLoader(
    "loadRestaurantStaff",
    typeof loadRestaurantStaff === "function" ? loadRestaurantStaff : loadBusinessAccounts
  );

  return Object.freeze({
    version: CRM_ADMIN_READ_FACADE_VERSION,
    loadCrmLeads,
    loadCrmCustomers,
    loadCrmStaff,
    loadCrmCeoStaff: loadCrmStaff,
    loadCrmRestaurantStaff,
    loadCrmBusinessAccounts,
    loadLeads: loadCrmLeads,
    loadCustomers: loadCrmCustomers,
    loadCeoStaff: loadCrmStaff,
    loadRestaurantStaff: loadCrmRestaurantStaff,
    loadBusinessAccounts: loadCrmBusinessAccounts
  });
}
