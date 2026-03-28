import { after, before, beforeEach, describe, test } from "node:test";

import {
  assertFails,
  assertSucceeds,
  authedFirestore,
  cleanupRulesTestEnvironment,
  clearRulesTestData,
  getRulesTestEnvironment,
  seedWithDisabledRules,
  setDocByPath,
  updateDocByPath
} from "./helpers/test-env.mjs";
import { buildUserDoc, fixture } from "./helpers/fixtures.mjs";

let testEnv;

describe("firestore.rules users/*", () => {
  before(async () => {
    testEnv = await getRulesTestEnvironment();
  });

  beforeEach(async () => {
    await clearRulesTestData();
  });

  after(async () => {
    await cleanupRulesTestEnvironment();
  });

  test("allows self create without privileged fields", async () => {
    const db = authedFirestore(testEnv, fixture.personas.user);
    await assertSucceeds(setDocByPath(db, `users/${fixture.personas.user.uid}`, {
      uid: fixture.personas.user.uid,
      email: fixture.personas.user.email,
      displayName: "Rules Self Create",
      name: "Rules Self Create",
      handle: fixture.personas.user.handle
    }));
  });

  test("denies self create with privileged role fields", async () => {
    const db = authedFirestore(testEnv, fixture.personas.user);
    await assertFails(setDocByPath(db, `users/${fixture.personas.user.uid}`, {
      uid: fixture.personas.user.uid,
      email: fixture.personas.user.email,
      displayName: "Rules Self Create",
      role: "ceo",
      roles: ["ceo"]
    }));
  });

  test("allows self update of non-privileged fields", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.user.uid}`, buildUserDoc(fixture.personas.user));
    });

    const db = authedFirestore(testEnv, fixture.personas.user);
    await assertSucceeds(updateDocByPath(db, `users/${fixture.personas.user.uid}`, {
      displayName: "Rules Self Updated"
    }));
  });

  test("denies self update of privileged role fields", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.user.uid}`, buildUserDoc(fixture.personas.user));
    });

    const db = authedFirestore(testEnv, fixture.personas.user);
    await assertFails(updateDocByPath(db, `users/${fixture.personas.user.uid}`, {
      role: "ceo"
    }));
  });

  test("allows scoped CEO update of scoped user", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.ceo.uid}`, buildUserDoc(fixture.personas.ceo, {
        role: "ceo",
        roles: ["ceo"],
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid]
      }));
      await setDocByPath(db, `users/${fixture.supportUsers.ceoStaff.uid}`, buildUserDoc(fixture.supportUsers.ceoStaff, {
        role: "user",
        roles: ["user"],
        createdByUid: fixture.personas.ceo.uid,
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid, fixture.supportUsers.ceoStaff.uid]
      }));
    });

    const db = authedFirestore(testEnv, fixture.personas.ceo);
    await assertSucceeds(updateDocByPath(db, `users/${fixture.supportUsers.ceoStaff.uid}`, {
      displayName: "Scoped CEO Update"
    }));
  });

  test("denies scoped CEO update outside own scope", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.ceo.uid}`, buildUserDoc(fixture.personas.ceo, {
        role: "ceo",
        roles: ["ceo"],
        ceoParentUid: fixture.personas.ceo.uid,
        ceoRootUid: fixture.personas.ceo.uid,
        ceoPath: [fixture.personas.ceo.uid]
      }));
      await setDocByPath(db, "users/mnyra-rules-outside-user", buildUserDoc({
        uid: "mnyra-rules-outside-user",
        email: "outside-user@mnyra.test",
        displayName: "Outside User",
        firstName: "Outside",
        lastName: "User",
        handle: "outsideuser",
        avatarUrl: "",
        role: "user",
        roles: ["user"]
      }, {
        createdByUid: "mnyra-other-ceo",
        ceoParentUid: "mnyra-other-ceo",
        ceoRootUid: "mnyra-other-ceo",
        ceoPath: ["mnyra-other-ceo"]
      }));
    });

    const db = authedFirestore(testEnv, fixture.personas.ceo);
    await assertFails(updateDocByPath(db, "users/mnyra-rules-outside-user", {
      displayName: "Illegal CEO Update"
    }));
  });

  test("allows foreign signed-in counter-only update on another user", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.user.uid}`, buildUserDoc(fixture.personas.user));
      await setDocByPath(db, `users/${fixture.personas.business.uid}`, buildUserDoc(fixture.personas.business, {
        role: "business",
        roles: ["owner", "business"]
      }));
    });

    const db = authedFirestore(testEnv, fixture.personas.business);
    await assertSucceeds(updateDocByPath(db, `users/${fixture.personas.user.uid}`, {
      followersCount: 1
    }));
  });
});
