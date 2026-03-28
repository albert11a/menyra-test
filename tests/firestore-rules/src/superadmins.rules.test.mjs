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
import { buildSuperadminDoc, buildUserDoc, fixture } from "./helpers/fixtures.mjs";

let testEnv;

describe("firestore.rules superadmins/*", () => {
  before(async () => {
    testEnv = await getRulesTestEnvironment();
  });

  beforeEach(async () => {
    await clearRulesTestData();
  });

  after(async () => {
    await cleanupRulesTestEnvironment();
  });

  test("allows CEO self create of own superadmin record", async () => {
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
    await assertSucceeds(setDocByPath(
      db,
      `superadmins/${fixture.personas.ceo.uid}`,
      buildSuperadminDoc(fixture.personas.ceo)
    ));
  });

  test("allows parent CEO get of subordinate superadmin record", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.ceo.uid}`, buildUserDoc(fixture.personas.ceo, {
        role: "ceo",
        roles: ["ceo"],
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid]
      }));
      await setDocByPath(db, `superadmins/${fixture.supportUsers.ceoStaff.uid}`, buildSuperadminDoc(fixture.supportUsers.ceoStaff, {
        createdByUid: fixture.personas.ceo.uid,
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid, fixture.supportUsers.ceoStaff.uid]
      }));
    });

    const db = authedFirestore(testEnv, fixture.personas.ceo);
    await assertSucceeds(getDocByPath(db, `superadmins/${fixture.supportUsers.ceoStaff.uid}`));
  });

  test("allows parent CEO update of subordinate superadmin record", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.ceo.uid}`, buildUserDoc(fixture.personas.ceo, {
        role: "ceo",
        roles: ["ceo"],
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid]
      }));
      await setDocByPath(db, `superadmins/${fixture.supportUsers.ceoStaff.uid}`, buildSuperadminDoc(fixture.supportUsers.ceoStaff, {
        createdByUid: fixture.personas.ceo.uid,
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid, fixture.supportUsers.ceoStaff.uid]
      }));
    });

    const db = authedFirestore(testEnv, fixture.personas.ceo);
    await assertSucceeds(updateDocByPath(db, `superadmins/${fixture.supportUsers.ceoStaff.uid}`, {
      displayName: "Updated Subordinate CEO"
    }));
  });

  test("denies out-of-scope CEO get of unrelated superadmin record", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.ceo.uid}`, buildUserDoc(fixture.personas.ceo, {
        role: "ceo",
        roles: ["ceo"],
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid]
      }));
      await setDocByPath(db, "users/mnyra-rules-other-ceo", buildUserDoc({
        uid: "mnyra-rules-other-ceo",
        email: "other-ceo@mnyra.test",
        displayName: "Other CEO",
        firstName: "Other",
        lastName: "CEO",
        handle: "otherceo",
        avatarUrl: "",
        role: "ceo",
        roles: ["ceo"]
      }, {
        role: "ceo",
        roles: ["ceo"],
        ceoParentUid: "mnyra-rules-other-ceo",
        ceoRootUid: "mnyra-rules-other-ceo",
        ceoPath: ["mnyra-rules-other-ceo"]
      }));
      await setDocByPath(db, "superadmins/mnyra-rules-subordinate-outside", {
        uid: "mnyra-rules-subordinate-outside",
        userId: "mnyra-rules-subordinate-outside",
        displayName: "Outside Subordinate",
        name: "Outside Subordinate",
        email: "outside-subordinate@mnyra.test",
        handle: "outsidesubordinate",
        role: "ceo",
        roles: ["ceo"],
        ceoParentUid: "mnyra-rules-other-ceo",
        ceoRootUid: "mnyra-rules-other-ceo",
        ceoPath: ["mnyra-rules-other-ceo", "mnyra-rules-subordinate-outside"]
      });
    });

    const db = authedFirestore(testEnv, fixture.personas.ceo);
    await assertFails(getDocByPath(db, "superadmins/mnyra-rules-subordinate-outside"));
  });

  test("denies non-CEO create of superadmin record", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.user.uid}`, buildUserDoc(fixture.personas.user));
    });

    const db = authedFirestore(testEnv, fixture.personas.user);
    await assertFails(setDocByPath(
      db,
      `superadmins/${fixture.personas.user.uid}`,
      buildSuperadminDoc(fixture.personas.user, {
        uid: fixture.personas.user.uid,
        userId: fixture.personas.user.uid,
        role: "ceo",
        roles: ["ceo"],
        ceoParentUid: fixture.personas.user.uid,
        ceoRootUid: fixture.personas.user.uid,
        ceoPath: [fixture.personas.user.uid]
      })
    ));
  });
});
