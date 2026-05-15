export const CRM_ADMIN_LEAD_WRITE_FACADE_VERSION = "crm-admin-lead-write-facade.v1";

export const CRM_ADMIN_LEAD_WRITE_OPERATIONS = Object.freeze([
  "saveLeadFromModal",
  "deleteLeadFromModal"
]);

function createLeadWriteHandler(name, handler) {
  return function crmAdminLeadWriteFacadeHandler(...args) {
    if (typeof handler !== "function") {
      throw new Error(`CRM admin lead write facade handler missing: ${name}`);
    }
    return handler(...args);
  };
}

export function createCrmAdminLeadWriteFacade({
  saveLead,
  deleteLead,
  saveLeadFromModal,
  deleteLeadFromModal
} = {}) {
  const saveCrmLead = createLeadWriteHandler(
    "saveLeadFromModal",
    typeof saveLead === "function" ? saveLead : saveLeadFromModal
  );
  const deleteCrmLead = createLeadWriteHandler(
    "deleteLeadFromModal",
    typeof deleteLead === "function" ? deleteLead : deleteLeadFromModal
  );

  return Object.freeze({
    version: CRM_ADMIN_LEAD_WRITE_FACADE_VERSION,
    operations: CRM_ADMIN_LEAD_WRITE_OPERATIONS,
    saveCrmLead,
    deleteCrmLead,
    saveLead: saveCrmLead,
    deleteLead: deleteCrmLead,
    saveLeadFromModal: saveCrmLead,
    deleteLeadFromModal: deleteCrmLead
  });
}
