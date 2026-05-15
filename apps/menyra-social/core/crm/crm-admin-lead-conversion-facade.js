export const CRM_ADMIN_LEAD_CONVERSION_FACADE_VERSION = "crm-admin-lead-conversion-facade.v1";

export const CRM_ADMIN_LEAD_CONVERSION_OPERATIONS = Object.freeze([
  "convertLeadToCustomer"
]);

function createLeadConversionHandler(name, handler) {
  return function crmAdminLeadConversionFacadeHandler(...args) {
    if (typeof handler !== "function") {
      throw new Error(`CRM admin lead conversion facade handler missing: ${name}`);
    }
    return handler(...args);
  };
}

export function createCrmAdminLeadConversionFacade({
  convertLead,
  convertLeadToCustomer
} = {}) {
  const convertCrmLeadToCustomer = createLeadConversionHandler(
    "convertLeadToCustomer",
    typeof convertLead === "function" ? convertLead : convertLeadToCustomer
  );

  return Object.freeze({
    version: CRM_ADMIN_LEAD_CONVERSION_FACADE_VERSION,
    operations: CRM_ADMIN_LEAD_CONVERSION_OPERATIONS,
    convertCrmLeadToCustomer,
    convertLead: convertCrmLeadToCustomer,
    convertLeadToCustomer: convertCrmLeadToCustomer
  });
}
