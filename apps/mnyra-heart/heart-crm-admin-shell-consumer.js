import {
  CRM_ADMIN_MIGRATION_ADAPTER_VERSION,
  createCrmAdminMigrationAdapter
} from "../menyra-social/core/crm/crm-admin-migration-adapter.js";

export const HEART_CRM_ADMIN_CONSUMER_VERSION = "heart-crm-admin-shell-consumer.v1";
export const HEART_CRM_ADMIN_CONSUMER_MODE = "read-only";

function createReadOnlyDomain(load) {
  return Object.freeze({
    load
  });
}

export function createHeartCrmAdminShellConsumer(deps = {}) {
  const adapter = createCrmAdminMigrationAdapter(deps);

  // READ-ONLY future Heart/Admin migration seam. This file is not wired into Heart runtime yet.
  return Object.freeze({
    version: HEART_CRM_ADMIN_CONSUMER_VERSION,
    mode: HEART_CRM_ADMIN_CONSUMER_MODE,
    leads: createReadOnlyDomain(adapter.leads.load),
    customers: createReadOnlyDomain(adapter.customers.load),
    staff: createReadOnlyDomain(adapter.staff.load),
    businessAccounts: createReadOnlyDomain(adapter.businessAccounts.load),
    contract: Object.freeze({
      adapterVersion: adapter.version || CRM_ADMIN_MIGRATION_ADAPTER_VERSION,
      expectedAdapterVersion: CRM_ADMIN_MIGRATION_ADAPTER_VERSION,
      readOnly: true,
      domains: adapter.contract?.domains || null
    })
  });
}
