import {
  CRM_ADMIN_MIGRATION_ADAPTER_VERSION,
  createCrmAdminMigrationAdapter
} from "../menyra-social/core/crm/crm-admin-migration-adapter.js";

export const HEART_CRM_ADMIN_CONSUMER_VERSION = "heart-crm-admin-shell-consumer.v1";
export const HEART_CRM_ADMIN_CONSUMER_MODE = "read-write";
export const HEART_CRM_ADMIN_READ_LOADER_DEPS = Object.freeze({
  leads: "loadLeads",
  customers: "loadCustomers",
  staff: "loadCeoStaff",
  businessAccounts: "loadBusinessAccounts"
});
export const HEART_CRM_ADMIN_WRITE_DEPS = Object.freeze({
  leads: Object.freeze(["saveLeadFromModal", "deleteLeadFromModal", "convertLeadToCustomer", "saveLeadSettings"]),
  customers: Object.freeze(["saveCustomerFromModal"]),
  staff: Object.freeze(["saveCeoStaffFromView", "deleteCeoStaffFromView"])
});

function getReadLoaderSource(deps = {}) {
  return deps.read && typeof deps.read === "object" ? deps.read : deps;
}

function getWriteSource(deps = {}) {
  return deps.write && typeof deps.write === "object" ? deps.write : deps;
}

function resolveReadLoaderDeps(deps = {}) {
  const source = getReadLoaderSource(deps);
  const entries = Object.entries(HEART_CRM_ADMIN_READ_LOADER_DEPS);
  const available = {};
  const missingByDomain = {};
  const missing = [];

  entries.forEach(([domainKey, loaderName]) => {
    if (typeof source?.[loaderName] === "function") {
      available[loaderName] = source[loaderName];
      missingByDomain[domainKey] = Object.freeze([]);
      return;
    }

    missing.push(loaderName);
    missingByDomain[domainKey] = Object.freeze([loaderName]);
  });

  return Object.freeze({
    available: Object.freeze(available),
    missing: Object.freeze(missing),
    missingByDomain: Object.freeze(missingByDomain),
    ready: missing.length === 0
  });
}

function resolveWriteDeps(deps = {}) {
  const source = getWriteSource(deps);
  const available = {};
  const missingByDomain = {};
  const missing = [];

  Object.entries(HEART_CRM_ADMIN_WRITE_DEPS).forEach(([domainKey, depNames]) => {
    const domainMissing = [];
    depNames.forEach((depName) => {
      if (typeof source?.[depName] === "function") {
        available[depName] = source[depName];
        return;
      }
      missing.push(depName);
      domainMissing.push(depName);
    });
    missingByDomain[domainKey] = Object.freeze(domainMissing);
  });

  return Object.freeze({
    available: Object.freeze(available),
    missing: Object.freeze(Array.from(new Set(missing))),
    missingByDomain: Object.freeze(missingByDomain),
    ready: missing.length === 0
  });
}

function createDomain(load, writeMethods = {}, {
  missingReadDeps = [],
  missingWriteDeps = []
} = {}) {
  const readReady = missingReadDeps.length === 0;
  const writeReady = missingWriteDeps.length === 0;
  return Object.freeze({
    load,
    ...writeMethods,
    ready: readReady,
    readReady,
    writeReady,
    missingDeps: Object.freeze(missingReadDeps.slice()),
    missingReadDeps: Object.freeze(missingReadDeps.slice()),
    missingWriteDeps: Object.freeze(missingWriteDeps.slice())
  });
}

export function createHeartCrmAdminShellConsumer(deps = {}) {
  const readLoaderDeps = resolveReadLoaderDeps(deps);
  const writeDeps = resolveWriteDeps(deps);
  const writeSource = getWriteSource(deps);
  const adapter = createCrmAdminMigrationAdapter({
    ...deps,
    read: {
      ...(deps.read && typeof deps.read === "object" ? deps.read : {}),
      ...readLoaderDeps.available
    },
    leadWrite: {
      saveLeadFromModal: writeDeps.available.saveLeadFromModal,
      deleteLeadFromModal: writeDeps.available.deleteLeadFromModal,
      saveLeadSettings: writeDeps.available.saveLeadSettings
    },
    leadConversion: {
      convertLeadToCustomer: writeDeps.available.convertLeadToCustomer
    },
    customerWrite: {
      saveCustomerFromModal: writeDeps.available.saveCustomerFromModal
    },
    staffWrite: {
      saveCeoStaffFromView: writeDeps.available.saveCeoStaffFromView,
      deleteCeoStaffFromView: writeDeps.available.deleteCeoStaffFromView
    },
    ui: {
      syncLeadDerivedFields: writeSource.syncLeadDerivedFields,
      syncStaffDerivedEmailField: writeSource.syncStaffDerivedEmailField,
      syncStaffFormFromDom: writeSource.syncStaffFormFromDom
    }
  });

  return Object.freeze({
    version: HEART_CRM_ADMIN_CONSUMER_VERSION,
    mode: HEART_CRM_ADMIN_CONSUMER_MODE,
    leads: createDomain(adapter.leads.load, {
      save: adapter.leads.save,
      delete: adapter.leads.delete,
      saveSettings: adapter.leads.saveSettings,
      convertToCustomer: adapter.leads.convertToCustomer,
      syncDerivedFields: adapter.leads.syncDerivedFields,
      syncDraftFromForm: writeSource.syncLeadModalDraftFromForm,
      refineLocationAddress: writeSource.refineLeadLocationAddressIndex,
      addLocationRow: writeSource.addLeadModalLocationRow,
      removeLocationRow: writeSource.removeLeadModalLocationRow,
      pickLocation: writeSource.pickLeadLocation,
      setLogoFile: writeSource.setLeadLogoFile,
      setBestSpotLogoFile: writeSource.setLeadBestSpotLogoFile,
      setTitleImageFile: writeSource.setLeadTitleImageFile
    }, {
      missingReadDeps: readLoaderDeps.missingByDomain.leads,
      missingWriteDeps: writeDeps.missingByDomain.leads
    }),
    customers: createDomain(adapter.customers.load, {
      save: adapter.customers.save,
      setLogoFile: writeSource.setCustomerLogoFile
    }, {
      missingReadDeps: readLoaderDeps.missingByDomain.customers,
      missingWriteDeps: writeDeps.missingByDomain.customers
    }),
    staff: createDomain(adapter.staff.load, {
      save: adapter.staff.saveCeo,
      remove: adapter.staff.removeCeo,
      syncDerivedEmailField: adapter.staff.syncDerivedEmailField,
      syncFormFromDom: adapter.staff.syncFormFromDom,
      pickLocation: writeSource.pickStaffLocation,
      setAvatarFile: writeSource.setStaffAvatarFile
    }, {
      missingReadDeps: readLoaderDeps.missingByDomain.staff,
      missingWriteDeps: writeDeps.missingByDomain.staff
    }),
    businessAccounts: createDomain(adapter.businessAccounts.load, {}, {
      missingReadDeps: readLoaderDeps.missingByDomain.businessAccounts,
      missingWriteDeps: []
    }),
    contract: Object.freeze({
      adapterVersion: adapter.version || CRM_ADMIN_MIGRATION_ADAPTER_VERSION,
      expectedAdapterVersion: CRM_ADMIN_MIGRATION_ADAPTER_VERSION,
      readOnly: false,
      readLoadersReady: readLoaderDeps.ready,
      writeDepsReady: writeDeps.ready,
      missingReadDeps: readLoaderDeps.missing,
      missingWriteDeps: writeDeps.missing,
      domains: adapter.contract?.domains || null
    })
  });
}
