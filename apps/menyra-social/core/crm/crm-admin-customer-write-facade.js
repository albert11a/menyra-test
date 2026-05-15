export const CRM_ADMIN_CUSTOMER_WRITE_FACADE_VERSION = "crm-admin-customer-write-facade.v1";

export const CRM_ADMIN_CUSTOMER_WRITE_OPERATIONS = Object.freeze([
  "saveCustomerFromModal"
]);

function createCustomerWriteHandler(name, handler) {
  return function crmAdminCustomerWriteFacadeHandler(...args) {
    if (typeof handler !== "function") {
      throw new Error(`CRM admin customer write facade handler missing: ${name}`);
    }
    return handler(...args);
  };
}

export function createCrmAdminCustomerWriteFacade({
  saveCustomer,
  saveCustomerFromModal
} = {}) {
  const saveCrmCustomer = createCustomerWriteHandler(
    "saveCustomerFromModal",
    typeof saveCustomer === "function" ? saveCustomer : saveCustomerFromModal
  );

  return Object.freeze({
    version: CRM_ADMIN_CUSTOMER_WRITE_FACADE_VERSION,
    operations: CRM_ADMIN_CUSTOMER_WRITE_OPERATIONS,
    saveCrmCustomer,
    saveCustomer: saveCrmCustomer,
    saveCustomerFromModal: saveCrmCustomer
  });
}
