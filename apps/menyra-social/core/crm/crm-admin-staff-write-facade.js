export const CRM_ADMIN_STAFF_WRITE_FACADE_VERSION = "crm-admin-staff-write-facade.v1";

export const CRM_ADMIN_STAFF_WRITE_OPERATIONS = Object.freeze([
  "saveCeoStaffFromView",
  "deleteCeoStaffFromView"
]);

function createStaffWriteHandler(name, handler) {
  return function crmAdminStaffWriteFacadeHandler(...args) {
    if (typeof handler !== "function") {
      throw new Error(`CRM admin staff write facade handler missing: ${name}`);
    }
    return handler(...args);
  };
}

export function createCrmAdminStaffWriteFacade({
  saveStaff,
  removeStaff,
  deleteStaff,
  saveCeoStaff,
  removeCeoStaff,
  deleteCeoStaff,
  saveCeoStaffFromView,
  deleteCeoStaffFromView
} = {}) {
  const saveCrmCeoStaff = createStaffWriteHandler(
    "saveCeoStaffFromView",
    typeof saveStaff === "function"
      ? saveStaff
      : (typeof saveCeoStaff === "function" ? saveCeoStaff : saveCeoStaffFromView)
  );
  const removeCrmCeoStaff = createStaffWriteHandler(
    "deleteCeoStaffFromView",
    typeof removeStaff === "function"
      ? removeStaff
      : (
        typeof deleteStaff === "function"
          ? deleteStaff
          : (
            typeof removeCeoStaff === "function"
              ? removeCeoStaff
              : (typeof deleteCeoStaff === "function" ? deleteCeoStaff : deleteCeoStaffFromView)
          )
      )
  );

  return Object.freeze({
    version: CRM_ADMIN_STAFF_WRITE_FACADE_VERSION,
    operations: CRM_ADMIN_STAFF_WRITE_OPERATIONS,
    saveCrmStaff: saveCrmCeoStaff,
    removeCrmStaff: removeCrmCeoStaff,
    deleteCrmStaff: removeCrmCeoStaff,
    saveCrmCeoStaff,
    removeCrmCeoStaff,
    deleteCrmCeoStaff: removeCrmCeoStaff,
    saveCeoStaffFromView: saveCrmCeoStaff,
    deleteCeoStaffFromView: removeCrmCeoStaff
  });
}
