import assert from "node:assert/strict";
import test from "node:test";

import { renderHeartCrmAdminReadView } from "../apps/mnyra-heart/heart-crm-admin-read-view.js";

function createConsumerDeps() {
  return {
    read: {
      loadLeads: async () => [],
      loadCustomers: async () => [],
      loadAds: async () => [],
      loadCeoStaff: async () => [],
      loadBusinessAccounts: async () => []
    }
  };
}

test("Heart CRM keeps populated leads visible while a refresh is loading", () => {
  const html = renderHeartCrmAdminReadView({
    consumerDeps: createConsumerDeps(),
    activeDomain: "leads",
    crmAdmin: {
      sections: {
        leads: {
          status: "loading",
          scope: "own",
          items: [
            {
              id: "lead-1",
              businessName: "Stable Lead Cafe",
              status: "registered",
              email: "lead@example.test"
            }
          ]
        }
      }
    }
  });

  assert.match(html, /Stable Lead Cafe/);
  assert.match(html, /data-heart-crm-row="leads"/);
  assert.match(html, /data-heart-crm-search-text="stable lead cafe/);
  assert.match(html, /data-heart-crm-refreshing="leads"/);
  assert.match(html, /Leads werden aktualisiert/);
  assert.doesNotMatch(html, /Keine Leads/);
});

test("Heart CRM renders stable lead avatar image attributes and fallback initials", () => {
  const html = renderHeartCrmAdminReadView({
    consumerDeps: createConsumerDeps(),
    activeDomain: "leads",
    crmAdmin: {
      sections: {
        leads: {
          status: "ready",
          scope: "own",
          items: [
            {
              id: "lead-image-1",
              businessName: "Logo Stable Bistro",
              status: "registered",
              email: "logo@example.test",
              logoUrl: "https://images.example.local/lead-logo.jpg"
            }
          ]
        }
      }
    }
  });

  assert.match(html, /data-heart-crm-row-id="lead-image-1"/);
  assert.match(html, /data-heart-crm-image-key="leads:lead-image-1"/);
  assert.match(html, /data-heart-crm-stable-src="https:\/\/images\.example\.local\/lead-logo\.jpg"/);
  assert.match(html, /<span hidden>LS<\/span>/);
});

test("Heart CRM still shows first-load loading state when no rows exist", () => {
  const html = renderHeartCrmAdminReadView({
    consumerDeps: createConsumerDeps(),
    activeDomain: "leads",
    crmAdmin: {
      sections: {
        leads: {
          status: "loading",
          items: []
        }
      }
    }
  });

  assert.match(html, /Leads laden/);
  assert.doesNotMatch(html, /data-heart-crm-refreshing="leads"/);
});
