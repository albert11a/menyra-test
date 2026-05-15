import {
  CRM_ADMIN_MIGRATION_ADAPTER_VERSION,
  createCrmAdminMigrationAdapter
} from "../menyra-social/core/crm/crm-admin-migration-adapter.js";

export const HEART_CRM_ADMIN_CONSUMER_VERSION = "heart-crm-admin-shell-consumer.v1";
export const HEART_CRM_ADMIN_CONSUMER_MODE = "read-only";
export const HEART_CRM_ADMIN_READ_LOADER_DEPS = Object.freeze({
  leads: "loadLeads",
  customers: "loadCustomers",
  staff: "loadCeoStaff",
  businessAccounts: "loadBusinessAccounts"
});

function getReadLoaderSource(deps = {}) {
  return deps.read && typeof deps.read === "object" ? deps.read : deps;
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

function createReadOnlyDomain(load, {
  missingDeps = []
} = {}) {
  return Object.freeze({
    load,
    ready: missingDeps.length === 0,
    missingDeps: Object.freeze(missingDeps.slice())
  });
}

export function createHeartCrmAdminShellConsumer(deps = {}) {
  const readLoaderDeps = resolveReadLoaderDeps(deps);
  const adapter = createCrmAdminMigrationAdapter({
    ...deps,
    read: {
      ...(deps.read && typeof deps.read === "object" ? deps.read : {}),
      ...readLoaderDeps.available
    }
  });

  // READ-ONLY future Heart/Admin migration seam. Mutation methods stay hidden from Heart.
  return Object.freeze({
    version: HEART_CRM_ADMIN_CONSUMER_VERSION,
    mode: HEART_CRM_ADMIN_CONSUMER_MODE,
    leads: createReadOnlyDomain(adapter.leads.load, {
      missingDeps: readLoaderDeps.missingByDomain.leads
    }),
    customers: createReadOnlyDomain(adapter.customers.load, {
      missingDeps: readLoaderDeps.missingByDomain.customers
    }),
    staff: createReadOnlyDomain(adapter.staff.load, {
      missingDeps: readLoaderDeps.missingByDomain.staff
    }),
    businessAccounts: createReadOnlyDomain(adapter.businessAccounts.load, {
      missingDeps: readLoaderDeps.missingByDomain.businessAccounts
    }),
    contract: Object.freeze({
      adapterVersion: adapter.version || CRM_ADMIN_MIGRATION_ADAPTER_VERSION,
      expectedAdapterVersion: CRM_ADMIN_MIGRATION_ADAPTER_VERSION,
      readOnly: true,
      readLoadersReady: readLoaderDeps.ready,
      missingReadDeps: readLoaderDeps.missing,
      domains: adapter.contract?.domains || null
    })
  });
}
