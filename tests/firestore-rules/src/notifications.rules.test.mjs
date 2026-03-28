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
import { buildNotificationDoc, buildUserDoc, fixture } from "./helpers/fixtures.mjs";

let testEnv;

describe("firestore.rules users/*/notifications", () => {
  before(async () => {
    testEnv = await getRulesTestEnvironment();
  });

  beforeEach(async () => {
    await clearRulesTestData();
  });

  after(async () => {
    await cleanupRulesTestEnvironment();
  });

  test("allows self read of own notification", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.user.uid}`, buildUserDoc(fixture.personas.user));
      await setDocByPath(
        db,
        `users/${fixture.personas.user.uid}/notifications/notif-self-read`,
        buildNotificationDoc()
      );
    });

    const db = authedFirestore(testEnv, fixture.personas.user);
    await assertSucceeds(getDocByPath(db, `users/${fixture.personas.user.uid}/notifications/notif-self-read`));
  });

  test("allows self update of own notification", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.user.uid}`, buildUserDoc(fixture.personas.user));
      await setDocByPath(
        db,
        `users/${fixture.personas.user.uid}/notifications/notif-self-update`,
        buildNotificationDoc()
      );
    });

    const db = authedFirestore(testEnv, fixture.personas.user);
    await assertSucceeds(updateDocByPath(db, `users/${fixture.personas.user.uid}/notifications/notif-self-update`, {
      read: true
    }));
  });

  test("denies foreign read of another user's notification", async () => {
    await seedWithDisabledRules(async (db) => {
      await setDocByPath(db, `users/${fixture.personas.user.uid}`, buildUserDoc(fixture.personas.user));
      await setDocByPath(db, `users/${fixture.personas.business.uid}`, buildUserDoc(fixture.personas.business, {
        role: "business",
        roles: ["owner", "business"]
      }));
      await setDocByPath(
        db,
        `users/${fixture.personas.user.uid}/notifications/notif-foreign-read`,
        buildNotificationDoc()
      );
    });

    const db = authedFirestore(testEnv, fixture.personas.business);
    await assertFails(getDocByPath(db, `users/${fixture.personas.user.uid}/notifications/notif-foreign-read`));
  });

  test("allows foreign create in another user's path when payload.userUid matches actor", async () => {
    const db = authedFirestore(testEnv, fixture.personas.business);
    await assertSucceeds(setDocByPath(
      db,
      `users/${fixture.personas.user.uid}/notifications/notif-cross-user-create`,
      buildNotificationDoc({
        type: "chat_message",
        userUid: fixture.personas.business.uid
      })
    ));
  });

  test("denies foreign create in another user's path when payload.userUid mismatches actor", async () => {
    const db = authedFirestore(testEnv, fixture.personas.business);
    await assertFails(setDocByPath(
      db,
      `users/${fixture.personas.user.uid}/notifications/notif-cross-user-deny`,
      buildNotificationDoc({
        type: "chat_message",
        userUid: fixture.personas.user.uid
      })
    ));
  });
});
