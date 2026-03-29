import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { createSocialEngagementRuntimeController } from "../../../apps/menyra-social/core/profile/social-engagement-runtime-controller.js";
import { createSocialEngagementSupportRuntimeController } from "../../../apps/menyra-social/core/profile/social-engagement-support-runtime-controller.js";

function buildPath(...segments) {
  const parts = [];
  segments.forEach((segment) => {
    if (!segment) return;
    if (typeof segment === "string") {
      parts.push(...segment.split("/").filter(Boolean));
      return;
    }
    if (typeof segment === "object" && typeof segment.path === "string") {
      parts.push(...segment.path.split("/").filter(Boolean));
    }
  });
  return parts.join("/");
}

function createMenuCounterHarness({
  stateOverrides = {},
  user = null,
  socialDoc = { likesCount: 0, commentsCount: 0 },
  existingLikePaths = []
} = {}) {
  const cardCountUpdates = [];
  const likeButtonUpdates = [];
  const operations = [];
  const existingPaths = new Set(existingLikePaths.map((entry) => buildPath(entry)));
  const docPayloads = new Map();
  const baseUser = user
    ? {
      uid: String(user.uid || "self-user"),
      handle: String(user.handle || "selfuser"),
      name: String(user.name || "Self User"),
      avatar: String(user.avatar || "self-avatar")
    }
    : null;

  const state = {
    user: baseUser ? { uid: baseUser.uid, handle: baseUser.handle } : null,
    userProfile: { restaurantId: "rest-1" },
    profileView: { profile: null, posts: [] },
    menu: {
      restaurantId: "rest-1",
      items: [{ id: "item-1", name: "Seed Item", category: "Main", price: "12.90" }]
    },
    menuDetail: {
      open: false,
      item: null,
      restaurantId: "",
      commentText: "",
      sending: false
    },
    favoriteMenuItems: { items: [] },
    menuItemMeta: {},
    postMeta: {},
    userPosts: [],
    businessPosts: [],
    feedPosts: [],
    restaurants: [],
    postModal: { open: false, post: null, sending: false, commentText: "", replyTo: null },
    likesModal: { open: false, postId: "", animate: false },
    ...stateOverrides
  };

  const socialDocPath = buildPath("restaurants", "rest-1", "menuSocial", "item-1");
  docPayloads.set(socialDocPath, { ...socialDoc });

  const getDoc = async (ref) => {
    const path = buildPath(ref);
    return {
      id: path.split("/").at(-1) || "",
      exists: () => docPayloads.has(path) || existingPaths.has(path),
      data: () => docPayloads.get(path) || {}
    };
  };

  const support = createSocialEngagementSupportRuntimeController({
    state,
    db: {},
    docFn: (...segments) => buildPath(...segments),
    formatCountFn: (value) => String(value ?? 0)
  });

  const runtime = createSocialEngagementRuntimeController({
    state,
    db: {},
    collectionFn: (...segments) => buildPath(...segments),
    docFn: (...segments) => buildPath(...segments),
    getDocFn: getDoc,
    getDocsFn: async () => ({ docs: [] }),
    queryFn: (value) => value,
    orderByFn: (...args) => args,
    limitFn: (value) => value,
    runTransactionFn: async (_db, runFn) => runFn({
      get: async (ref) => {
        const path = buildPath(ref);
        return {
          exists: () => existingPaths.has(path),
          data: () => docPayloads.get(path) || {}
        };
      },
      set: (ref, payload, options) => {
        const path = buildPath(ref);
        operations.push({ type: "set", ref: path, payload, options });
        existingPaths.add(path);
      },
      update: (ref, payload) => {
        operations.push({ type: "update", ref: buildPath(ref), payload });
      },
      delete: (ref) => {
        const path = buildPath(ref);
        operations.push({ type: "delete", ref: path });
        existingPaths.delete(path);
      }
    }),
    serverTimestampFn: () => "server-ts",
    incrementFn: (value) => value,
    currentUserBadgeFn: () => ({
      uid: String(baseUser?.uid || ""),
      handle: String(baseUser?.handle || ""),
      name: String(baseUser?.name || "User"),
      avatar: String(baseUser?.avatar || "")
    }),
    openGuestAuthPromptFn: () => {},
    ensureMenuItemMetaFn: support.ensureMenuItemMeta,
    resolveMenuItemCountsFn: support.resolveMenuItemCounts,
    getMenuDetailContextFn: support.getMenuDetailContext,
    updateMenuCardCountNodesFn: (itemId, counts) => {
      cardCountUpdates.push({ itemId, counts: { ...counts } });
    },
    updateMenuCardLikeButtonsFn: (itemId, isLiked) => {
      likeButtonUpdates.push({ itemId, isLiked });
    },
    updateMenuDetailCountsOnlyFn: () => {},
    updateMenuDetailMetaFn: () => {},
    updateMenuDetailCommentsOnlyFn: () => {},
    updateFavoriteMenuItemsLocalFn: () => {},
    favoriteMenuItemDocIdFn: support.favoriteMenuItemDocId,
    buildFavoriteMenuItemPayloadFn: support.buildFavoriteMenuItemPayload,
    getMenuItemSocialDocRefFn: support.getMenuItemSocialDocRef,
    getMenuItemSocialIdFn: support.getMenuItemSocialId,
    menuItemMetaKeyFn: support.menuItemMetaKey,
    normalizeHandleFn: (value = "") => String(value || "").replace(/^@/, "").trim().toLowerCase()
  });

  return {
    state,
    support,
    runtime,
    operations,
    cardCountUpdates,
    likeButtonUpdates,
    socialDocPath
  };
}

describe("social engagement menu counter runtime", () => {
  test("resolveMenuItemCounts does not keep stale high-watermark list counts", () => {
    const { support } = createMenuCounterHarness();

    const counts = support.resolveMenuItemCounts({
      likes: [{ uid: "viewer" }],
      comments: [{ id: "comment-1" }, { id: "comment-2" }],
      counts: { likes: 0, comments: 1 }
    });

    assert.deepEqual(counts, { likes: 0, comments: 1 });
  });

  test("loadMenuItemMetaFromFirebase hydrates remote counts for menu cards without comment fetch", async () => {
    const { state, support, runtime } = createMenuCounterHarness({
      socialDoc: { likesCount: 4, commentsCount: 7 }
    });
    const item = state.menu.items[0];

    await runtime.loadMenuItemMetaFromFirebase(item, "rest-1", { includeComments: false });

    const key = support.menuItemMetaKey("rest-1", support.getMenuItemSocialId(item));
    const counts = support.resolveMenuItemCounts(state.menuItemMeta[key]);
    assert.deepEqual(counts, { likes: 4, comments: 7 });
  });

  test("toggleMenuItemLike reconciles optimistic menu counts back to remote truth", async () => {
    const { state, support, runtime, cardCountUpdates } = createMenuCounterHarness({
      user: { uid: "self-user", handle: "selfuser", name: "Self User", avatar: "self-avatar" },
      socialDoc: { likesCount: 6, commentsCount: 2 }
    });
    const item = state.menu.items[0];

    await runtime.toggleMenuItemLike({
      item,
      restaurantId: "rest-1"
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    const key = support.menuItemMetaKey("rest-1", support.getMenuItemSocialId(item));
    const counts = support.resolveMenuItemCounts(state.menuItemMeta[key]);
    assert.equal(counts.likes, 6);
    assert.deepEqual(cardCountUpdates.at(-1), {
      itemId: support.getMenuItemSocialId(item),
      counts: { likes: 6, comments: 2 }
    });
  });
});
