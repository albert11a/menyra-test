export const CRM_ADMIN_BUSINESS_ACCOUNT_WRITE_FACADE_VERSION =
  "crm-admin-business-account-write-facade.v1";

export const CRM_ADMIN_BUSINESS_ACCOUNT_WRITE_OPERATIONS = Object.freeze([
  "saveBusinessAccountFromView",
  "toggleBusinessAccountActive"
]);

function createBusinessAccountWriteHandler(name, handler) {
  return function crmAdminBusinessAccountWriteFacadeHandler(...args) {
    if (typeof handler !== "function") {
      throw new Error(`CRM admin business account write facade handler missing: ${name}`);
    }
    return handler(...args);
  };
}

export function createCrmAdminBusinessAccountWriteFacade({
  saveBusinessAccount,
  updateBusinessAccount,
  saveBusinessAccountFromView,
  toggleBusinessAccountActive
} = {}) {
  const saveCrmBusinessAccount = createBusinessAccountWriteHandler(
    "saveBusinessAccountFromView",
    typeof saveBusinessAccount === "function"
      ? saveBusinessAccount
      : saveBusinessAccountFromView
  );
  const updateCrmBusinessAccount = createBusinessAccountWriteHandler(
    "toggleBusinessAccountActive",
    typeof updateBusinessAccount === "function"
      ? updateBusinessAccount
      : toggleBusinessAccountActive
  );

  return Object.freeze({
    version: CRM_ADMIN_BUSINESS_ACCOUNT_WRITE_FACADE_VERSION,
    operations: CRM_ADMIN_BUSINESS_ACCOUNT_WRITE_OPERATIONS,
    saveCrmBusinessAccount,
    updateCrmBusinessAccount,
    saveBusinessAccount: saveCrmBusinessAccount,
    updateBusinessAccount: updateCrmBusinessAccount,
    saveBusinessAccountFromView: saveCrmBusinessAccount,
    toggleBusinessAccountActive: updateCrmBusinessAccount
  });
}
