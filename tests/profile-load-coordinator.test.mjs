import assert from "node:assert/strict";
import test from "node:test";

import {
  createProfileKey,
  createProfileLoadCoordinator
} from "../apps/menyra-social/core/profile/profile-load-coordinator.js";

function deferred() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function wait(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("profile keys use canonical entity identity", () => {
  assert.equal(createProfileKey("business", "restaurant-a"), "business:restaurant-a");
  assert.equal(createProfileKey("restaurant", "restaurant-a"), "business:restaurant-a");
  assert.equal(createProfileKey("user", "uid-1"), "user:uid-1");
});

test("generation increases only when the profile key changes", () => {
  const coordinator = createProfileLoadCoordinator();
  const first = coordinator.beginProfileSession({
    entityType: "business",
    canonicalId: "restaurant-a",
    selectedSurface: "profile"
  });
  const same = coordinator.beginProfileSession({
    entityType: "business",
    canonicalId: "restaurant-a",
    selectedSurface: "menu"
  });
  const next = coordinator.beginProfileSession({
    entityType: "business",
    canonicalId: "restaurant-b",
    selectedSurface: "profile"
  });

  assert.equal(first.generation, 1);
  assert.equal(same.generation, 1);
  assert.equal(same.selectedSurface, "menu");
  assert.equal(next.generation, 2);
});

test("old async result cannot commit into a newer profile session", async () => {
  const coordinator = createProfileLoadCoordinator();
  coordinator.beginProfileSession({ entityType: "business", canonicalId: "restaurant-a" });
  const release = deferred();
  const request = coordinator.ensureProfileSection("posts", async () => {
    await release.promise;
    return { status: "ready", data: [{ id: "post-a" }], source: "firestore" };
  });

  coordinator.beginProfileSession({ entityType: "business", canonicalId: "restaurant-b" });
  release.resolve();
  const result = await request;

  assert.equal(result.accepted, false);
  assert.equal(result.reason, "stale-result");
  assert.equal(coordinator.getSession().key, "business:restaurant-b");
  assert.equal(coordinator.getSession().posts.status, "idle");
  assert.equal(coordinator.getCounters().staleResultsDiscarded, 1);
});

test("wrong request id cannot commit", () => {
  const coordinator = createProfileLoadCoordinator();
  const session = coordinator.beginProfileSession({ entityType: "business", canonicalId: "restaurant-a" });
  void coordinator.ensureProfileSection("menu", async () => ({ status: "ready", data: [{ id: "item-1" }] }));

  const result = coordinator.commitProfileSection({
    profileKey: session.key,
    generation: session.generation,
    section: "menu",
    requestId: "wrong-request",
    status: "ready",
    data: [{ id: "stale-item" }]
  });

  assert.equal(result.accepted, false);
  assert.equal(result.reason, "stale-result");
});

test("second ensure reuses the active request", async () => {
  const coordinator = createProfileLoadCoordinator();
  coordinator.beginProfileSession({ entityType: "business", canonicalId: "restaurant-a" });
  const release = deferred();
  let calls = 0;
  const first = coordinator.ensureProfileSection("focus", async () => {
    calls += 1;
    await release.promise;
    return { status: "empty", data: [], source: "firestore" };
  });
  const second = coordinator.ensureProfileSection("focus", async () => {
    calls += 1;
    return { status: "ready", data: [{ id: "focus-2" }] };
  });

  assert.equal(first, second);
  release.resolve();
  const result = await second;

  assert.equal(result.accepted, true);
  assert.equal(calls, 1);
  assert.equal(coordinator.getCounters().duplicateRequestsPrevented, 1);
  assert.equal(coordinator.getSession().focus.status, "empty");
});

test("refresh keeps existing data visible while loading", async () => {
  const coordinator = createProfileLoadCoordinator();
  coordinator.beginProfileSession({ entityType: "business", canonicalId: "restaurant-a" });
  coordinator.seedProfileSession({
    menu: {
      status: "ready",
      data: [{ id: "item-old" }],
      source: "firestore"
    }
  });
  const release = deferred();
  const refresh = coordinator.refreshProfileSection("menu", async () => {
    await release.promise;
    return { status: "ready", data: [{ id: "item-new" }], source: "firestore" };
  });

  assert.equal(coordinator.getSession().menu.status, "refreshing");
  assert.deepEqual(coordinator.getSession().menu.data, [{ id: "item-old" }]);

  release.resolve();
  await refresh;

  assert.equal(coordinator.getSession().menu.status, "ready");
  assert.deepEqual(coordinator.getSession().menu.data, [{ id: "item-new" }]);
});

test("partial seed does not delete existing count fields", () => {
  const coordinator = createProfileLoadCoordinator();
  coordinator.beginProfileSession({ entityType: "business", canonicalId: "restaurant-a" });
  coordinator.seedProfileSession({
    counts: {
      status: "ready",
      data: { followers: 125, following: 4 },
      source: "firestore",
      updatedAt: 200
    }
  });
  coordinator.seedProfileSession({
    counts: {
      status: "ready",
      data: { followers: undefined, likes: 9 },
      source: "route-seed",
      updatedAt: 200
    }
  });

  assert.deepEqual(coordinator.getSession().counts.data, {
    followers: 125,
    following: 4,
    likes: 9
  });
});

test("older seed cannot overwrite a newer section", () => {
  const coordinator = createProfileLoadCoordinator();
  coordinator.beginProfileSession({ entityType: "business", canonicalId: "restaurant-a" });
  coordinator.seedProfileSession({
    counts: {
      status: "ready",
      data: { followers: 125 },
      source: "firestore",
      updatedAt: 200
    }
  });
  coordinator.seedProfileSession({
    counts: {
      status: "ready",
      data: { followers: 1 },
      source: "bootstrap-seed",
      updatedAt: 100
    }
  });

  assert.equal(coordinator.getSession().counts.data.followers, 125);
  assert.equal(coordinator.getCounters().staleResultsDiscarded, 1);
});

test("cache hit is visible immediately when reopening a profile", async () => {
  const coordinator = createProfileLoadCoordinator();
  const first = coordinator.beginProfileSession({ entityType: "business", canonicalId: "restaurant-a" });
  await coordinator.ensureProfileSection("posts", async () => ({
    status: "ready",
    data: [{ id: "post-1" }],
    source: "firestore"
  }));

  coordinator.beginProfileSession({ entityType: "business", canonicalId: "restaurant-b" });
  const reopened = coordinator.beginProfileSession({ entityType: "business", canonicalId: "restaurant-a" });

  assert.notEqual(reopened.generation, first.generation);
  assert.equal(reopened.posts.status, "ready");
  assert.deepEqual(reopened.posts.data, [{ id: "post-1" }]);
});

test("dispose clears section retry timers", async () => {
  const coordinator = createProfileLoadCoordinator();
  coordinator.beginProfileSession({ entityType: "user", canonicalId: "uid-1" });
  let fired = false;
  coordinator.scheduleProfileSectionRetry("relationship", () => {
    fired = true;
  }, 10);
  coordinator.disposeProfileSession();
  await wait(30);

  assert.equal(fired, false);
  assert.equal(coordinator.getSession(), null);
});
