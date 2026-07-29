import test from "node:test";
import assert from "node:assert/strict";

import {
  createCrmDomainRuntimeBoundary
} from "../apps/menyra-social/core/crm/crm-domain-runtime-boundary.js";

test("crm domain runtime boundary renders fallback and loads lazily", async () => {
  const calls = [];
  const boundary = createCrmDomainRuntimeBoundary({
    renderApi: {
      renderCrmLazyLoadingView: (label) => `loading:${label}`,
      render: () => calls.push(["render"])
    },
    importModuleFn: async (url) => {
      calls.push(["import", url]);
      return {
        createCrmDomainRuntimeCluster: () => {
          calls.push(["create"]);
          return {
            renderStaffView: () => "staff-view"
          };
        }
      };
    }
  });

  assert.equal(boundary.renderStaffView(), "loading:Stafi po ngarkohet...");
  await boundary.ensureLoaded();
  assert.equal(boundary.renderStaffView(), "staff-view");
  assert.deepEqual(calls, [
    ["import", "./crm-domain-runtime-cluster.js"],
    ["create"],
    ["render"]
  ]);
});

test("crm domain runtime boundary awaits async controller methods", async () => {
  const boundary = createCrmDomainRuntimeBoundary({
    importModuleFn: async () => ({
      createCrmDomainRuntimeCluster: () => ({
        loadLeads: async ({ scope }) => `loaded:${scope}`
      })
    })
  });

  assert.equal(await boundary.loadLeads({ scope: "mine" }), "loaded:mine");
});

test("crm domain runtime boundary exposes crmRuntimeController facade", () => {
  const boundary = createCrmDomainRuntimeBoundary();
  assert.equal(boundary.crmRuntimeController, boundary);
});

test("crm domain runtime boundary keeps sync fallbacks before load", () => {
  const calls = [];
  const boundary = createCrmDomainRuntimeBoundary({
    importModuleFn: async () => {
      calls.push(["import"]);
      return {
        createCrmDomainRuntimeCluster: () => ({
          resolveRestaurantStatusFromLead: () => "ready"
        })
      };
    }
  });

  assert.equal(boundary.resolveRestaurantStatusFromLead("lead", "current"), "lead");
  assert.deepEqual(boundary.normalizeLeadDoc({ id: "lead-1" }), { id: "lead-1" });
  assert.equal(boundary.isHiddenLegacyCeoEmail("legacy@example.test"), false);
  assert.equal(boundary.getVerifiedMapLocation(), null);
  assert.deepEqual(calls, []);
});

test("crm domain runtime boundary replays sync UI actions after load", async () => {
  const calls = [];
  let resolveModule;
  const modulePromise = new Promise((resolve) => {
    resolveModule = resolve;
  });
  const boundary = createCrmDomainRuntimeBoundary({
    importModuleFn: () => modulePromise
  });

  boundary.openLeadCreator("seed");
  assert.deepEqual(calls, []);

  resolveModule({
    createCrmDomainRuntimeCluster: () => ({
      openLeadCreator: (value) => {
        calls.push(["open", value]);
      }
    })
  });

  await boundary.ensureLoaded();
  assert.deepEqual(calls, [["open", "seed"]]);
});
