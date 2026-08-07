import assert from "node:assert/strict";
import test from "node:test";

import { createMediaUploadRuntimeController } from "../apps/menyra-social/core/media/media-upload-runtime-controller.js";

// Firestore-Attrappe: haelt fest, welche Dokumente geschrieben wurden.
// docFn wird auf zwei Arten gerufen - einmal mit einer Collection-Referenz
// (neue Id), einmal mit (db, "socialFeed", postId).
function createFirestoreStub() {
  const writes = [];
  const db = { __db: true };
  return {
    db,
    writes,
    deps: {
      db,
      collectionFn: (_db, ...segments) => ({ kind: "collection", path: segments.join("/") }),
      docFn: (first, ...rest) => (
        first && first.kind === "collection"
          ? { kind: "doc", path: `${first.path}/generated-post-id`, id: "generated-post-id" }
          : { kind: "doc", path: rest.join("/"), id: rest[rest.length - 1] }
      ),
      setDocFn: async (ref, data) => {
        writes.push({ path: ref.path, data });
      },
      serverTimestampFn: () => "server-time"
    }
  };
}

function createController(stub) {
  return createMediaUploadRuntimeController({
    state: { user: { uid: "user-1" }, restaurants: [{ id: "restaurant-1", name: "Lavjerrs", city: "Prishtina" }] },
    ...stub.deps
  });
}

const basePost = {
  restaurantId: "restaurant-1",
  caption: "Njo kafe",
  mediaUrl: "https://cdn.example/p.jpg",
  mediaType: "image"
};

test("a feed post lands in socialFeed and carries the feed surface", async () => {
  const stub = createFirestoreStub();
  await createController(stub).createBusinessPost({ ...basePost, surface: "feed" });

  const paths = stub.writes.map((entry) => entry.path);
  assert.deepEqual(paths, [
    "restaurants/restaurant-1/socialPosts/generated-post-id",
    "socialFeed/generated-post-id"
  ]);
  assert.equal(stub.writes[0].data.surface, "feed");
});

test("a profile post never reaches socialFeed", async () => {
  const stub = createFirestoreStub();
  await createController(stub).createBusinessPost({ ...basePost, surface: "profile" });

  const paths = stub.writes.map((entry) => entry.path);
  assert.deepEqual(paths, ["restaurants/restaurant-1/socialPosts/generated-post-id"]);
  assert.equal(stub.writes[0].data.surface, "profile");
  assert.equal(paths.some((path) => path.startsWith("socialFeed/")), false);
});

test("without a surface the post behaves like before and goes to the feed", async () => {
  const stub = createFirestoreStub();
  await createController(stub).createBusinessPost({ ...basePost });

  assert.deepEqual(stub.writes.map((entry) => entry.path), [
    "restaurants/restaurant-1/socialPosts/generated-post-id",
    "socialFeed/generated-post-id"
  ]);
  assert.equal(stub.writes[0].data.surface, "feed");
});

test("both surfaces keep the post itself under socialPosts", async () => {
  for (const surface of ["feed", "profile"]) {
    const stub = createFirestoreStub();
    await createController(stub).createBusinessPost({ ...basePost, surface });
    const canonical = stub.writes.find((entry) => entry.path.includes("/socialPosts/"));
    // Daran haengen Loeschen, Zaehler und das Aufraeumen im CRM.
    assert.ok(canonical, `surface ${surface} must write the canonical post`);
    assert.equal(canonical.data.caption, "Njo kafe");
    assert.equal(canonical.data.status, "active");
  }
});
