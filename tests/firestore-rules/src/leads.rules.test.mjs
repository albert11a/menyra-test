import { after, before, beforeEach, describe, test } from "node:test";

import {
  assertFails,
  assertSucceeds,
  authedFirestore,
  cleanupRulesTestEnvironment,
  clearRulesTestData,
  getDocByPath,
  getRulesTestEnvironment,
  seedWithDisabledRules,
  setDocByPath,
  updateDocByPath
} from "./helpers/test-env.mjs";
import { buildLeadDoc, buildUserDoc, fixture } from "./helpers/fixtures.mjs";

let testEnv;

describe("firestore.rules leads/*", () => {
  before(async () => {
    testEnv = await getRulesTestEnvironment();
  });

  beforeEach(async () => {
    await clearRulesTestData();
  });

  after(async () => {
    await cleanupRulesTestEnvironment();
  });

  test("allows scoped CEO read on own-scope lead", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.ceo.uid}`, buildUserDoc(fixture.personas.ceo, {
        role: "ceo",
        roles: ["ceo"],
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid]
      }));
      await setDocByPath(db, "leads/scoped-lead-read", buildLeadDoc({
        leadId: "scoped-lead-read",
        createdByUid: fixture.personas.ceo.uid,
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid]
      }));
    });

    const db = authedFirestore(testEnv, fixture.personas.ceo);
    await assertSucceeds(getDocByPath(db, "leads/scoped-lead-read"));
  });

  test("allows scoped CEO create on own-scope lead", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.ceo.uid}`, buildUserDoc(fixture.personas.ceo, {
        role: "ceo",
        roles: ["ceo"],
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid]
      }));
    });

    const db = authedFirestore(testEnv, fixture.personas.ceo);
    await assertSucceeds(setDocByPath(db, "leads/scoped-lead-create", buildLeadDoc({
      leadId: "scoped-lead-create",
      createdByUid: fixture.personas.ceo.uid,
      ceoParentUid: fixture.personas.ceo.uid,
      ceoRootUid: fixture.personas.ceo.uid,
      ceoPath: [fixture.personas.ceo.uid]
    })));
  });

  test("denies scoped CEO read outside own ceoPath", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.ceo.uid}`, buildUserDoc(fixture.personas.ceo, {
        role: "ceo",
        roles: ["ceo"],
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid]
      }));
      await setDocByPath(db, "leads/foreign-lead-read", buildLeadDoc({
        leadId: "foreign-lead-read",
        createdByUid: "mnyra-other-ceo",
        ceoParentUid: "mnyra-other-ceo",
        ceoRootUid: "mnyra-other-ceo",
        ceoPath: ["mnyra-other-ceo"]
      }));
    });

    const db = authedFirestore(testEnv, fixture.personas.ceo);
    await assertFails(getDocByPath(db, "leads/foreign-lead-read"));
  });

  test("denies regular user read on lead", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.user.uid}`, buildUserDoc(fixture.personas.user));
      await setDocByPath(db, "leads/user-deny-read", buildLeadDoc({
        leadId: "user-deny-read",
        createdByUid: fixture.personas.ceo.uid,
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid]
      }));
    });

    const db = authedFirestore(testEnv, fixture.personas.user);
    await assertFails(getDocByPath(db, "leads/user-deny-read"));
  });

  test("denies scoped CEO update when request moves lead into foreign scope", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.ceo.uid}`, buildUserDoc(fixture.personas.ceo, {
        role: "ceo",
        roles: ["ceo"],
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid]
      }));
      await setDocByPath(db, "leads/scoped-lead-update", buildLeadDoc({
        leadId: "scoped-lead-update",
        createdByUid: fixture.personas.ceo.uid,
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid]
      }));
    });

    const db = authedFirestore(testEnv, fixture.personas.ceo);
    await assertFails(updateDocByPath(db, "leads/scoped-lead-update", {
      ceoParentUid: "mnyra-other-ceo",
      ceoRootUid: "mnyra-other-ceo",
      ceoPath: ["mnyra-other-ceo"]
    }));
  });
});
