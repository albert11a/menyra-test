export const CRM_ADMIN_LEAD_WRITE_FACADE_VERSION = "crm-admin-lead-write-facade.v1";

export const CRM_ADMIN_LEAD_WRITE_OPERATIONS = Object.freeze([
  "saveLeadFromModal",
  "deleteLeadFromModal",
  "saveLeadSettings"
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
  saveLeadSettings,
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
  const saveCrmLeadSettings = createLeadWriteHandler(
    "saveLeadSettings",
    saveLeadSettings
  );

  return Object.freeze({
    version: CRM_ADMIN_LEAD_WRITE_FACADE_VERSION,
    operations: CRM_ADMIN_LEAD_WRITE_OPERATIONS,
    saveCrmLead,
    deleteCrmLead,
    saveCrmLeadSettings,
    saveLead: saveCrmLead,
    deleteLead: deleteCrmLead,
    saveLeadSettings: saveCrmLeadSettings,
    saveLeadFromModal: saveCrmLead,
    deleteLeadFromModal: deleteCrmLead
  });
}
