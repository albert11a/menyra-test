import assert from "node:assert/strict";
import test from "node:test";

import { createFeedVisibilityRuntimeCluster } from "../apps/menyra-social/core/feed/feed-visibility-runtime-cluster.js";

function createDocsSnapshot(rows = []) {
  return {
    forEach(callback) {
      rows.forEach((row) => {
        callback({
          id: row.id,
          data: () => ({ ...row })
        });
      });
    }
  };
}

test("external user post profile reads are bounded by fast limits", async () => {
  const queryCalls = [];
  const rows = Array.from({ length: 5 }, (_value, index) => ({
    id: `post-${index + 1}`,
    url: `https://cdn.example/user-post-${index + 1}.jpg`,
    createdAt: index + 1
  }));
  const controller = createFeedVisibilityRuntimeCluster({
    state: {},
    constants: {
      fastLimits: {
        userPosts: 2,
        profilePosts: 4
      }
    },
    firebaseApi: {
      db: {},
      collectionFn: (_db, ...path) => ({ path }),
      queryFn: (ref, ...constraints) => {
        queryCalls.push(constraints);
        return { ref, constraints };
      },
      orderByFn: (field, direction) => ({ type: "orderBy", field, direction }),
      limitFn: (value) => ({ type: "limit", value }),
      getDocsFn: async (refOrQuery) => {
        const constraints = Array.isArray(refOrQuery?.constraints) ? refOrQuery.constraints : [];
        const limitValue = constraints.find((constraint) => constraint?.type === "limit")?.value;
        return createDocsSnapshot(Number.isFinite(Number(limitValue)) ? rows.slice(0, Number(limitValue)) : rows);
      }
    }
  });

  const posts = await controller.loadUserPostsForUser("user-1");

  assert.equal(posts.length, 2);
  assert.equal(queryCalls.length, 1);
  assert.equal(queryCalls[0].find((constraint) => constraint?.type === "limit")?.value, 2);
});
