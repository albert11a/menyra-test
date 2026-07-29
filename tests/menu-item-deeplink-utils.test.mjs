import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMenuOpenSelectorCore,
  resolveMenuItemDeepLinkTargetCore
} from "../apps/menyra-social/core/menu/menu-item-deeplink-utils.js";
import { createStorySystemController } from "../apps/menyra-social/core/stories/story-system-controller.js";
import { renderStoryMenuItemTagPickerCore } from "../apps/menyra-social/core/media/media-upload-view-render-utils.js";

test("resolveMenuItemDeepLinkTargetCore parses story product deep link", () => {
  const target = resolveMenuItemDeepLinkTargetCore({
    search: "?r=rest_123&item=item_456&src=story"
  });
  assert.equal(target.itemId, "item_456");
  assert.equal(target.restaurantId, "rest_123");
});

test("resolveMenuItemDeepLinkTargetCore supports alias query keys", () => {
  assert.equal(
    resolveMenuItemDeepLinkTargetCore({ search: "itemId=abc" }).itemId,
    "abc"
  );
  assert.equal(
    resolveMenuItemDeepLinkTargetCore({ search: "menuItem=xyz&restaurantId=r9" }).restaurantId,
    "r9"
  );
});

test("resolveMenuItemDeepLinkTargetCore returns empty target without item", () => {
  assert.deepEqual(
    resolveMenuItemDeepLinkTargetCore({ search: "?r=rest_123" }),
    { itemId: "", restaurantId: "rest_123" }
  );
  assert.deepEqual(
    resolveMenuItemDeepLinkTargetCore({ search: "" }),
    { itemId: "", restaurantId: "" }
  );
});

test("buildMenuOpenSelectorCore escapes quotes without CSS.escape", () => {
  assert.equal(buildMenuOpenSelectorCore("item_1"), '[data-menu-open="item_1"]');
  assert.equal(
    buildMenuOpenSelectorCore('a"b\\c'),
    '[data-menu-open="a\\"b\\\\c"]'
  );
  assert.equal(buildMenuOpenSelectorCore(""), "");
});

test("buildMenuOpenSelectorCore prefers CSS.escape when available", () => {
  const fakeCss = { escape: (value) => `ESC(${value})` };
  assert.equal(
    buildMenuOpenSelectorCore("item_1", fakeCss),
    '[data-menu-open="ESC(item_1)"]'
  );
});

test("createBusinessStory persists tagged menuItemId", async () => {
  const writes = [];
  const controller = createStorySystemController({
    db: {},
    collectionFn: () => ({}),
    docFn: () => ({ id: "story_1" }),
    setDocFn: async (_ref, payload) => {
      writes.push(payload);
    },
    serverTimestampFn: () => "ts"
  });
  await controller.createBusinessStory({
    restaurantId: "rest_1",
    caption: "Neu im Menue",
    mediaUrl: "https://cdn.example.com/story.mp4",
    mediaType: "video",
    createdByUid: "uid_1",
    menuItemId: "item_9"
  });
  assert.equal(writes.length, 1);
  assert.equal(writes[0].menuItemId, "item_9");
  assert.equal(writes[0].mediaType, "video");
  assert.equal(writes[0].videoUrl, "https://cdn.example.com/story.mp4");
});

test("createBusinessStory stores empty menuItemId when nothing is tagged", async () => {
  const writes = [];
  const controller = createStorySystemController({
    db: {},
    collectionFn: () => ({}),
    docFn: () => ({ id: "story_2" }),
    setDocFn: async (_ref, payload) => {
      writes.push(payload);
    },
    serverTimestampFn: () => "ts"
  });
  await controller.createBusinessStory({
    restaurantId: "rest_1",
    caption: "",
    mediaUrl: "https://cdn.example.com/story.jpg",
    mediaType: "image"
  });
  assert.equal(writes[0].menuItemId, "");
});

test("renderStoryMenuItemTagPickerCore renders options with selection", () => {
  const html = renderStoryMenuItemTagPickerCore({
    storyTag: {
      status: "ready",
      items: [
        { id: "item_1", name: "Pizza Margherita" },
        { id: "item_2", name: "Burger" }
      ]
    },
    selectedMenuItemId: "item_2"
  });
  assert.match(html, /uploadStoryMenuItemSelect/);
  assert.match(html, /<option value="">Kein Produkt<\/option>/);
  assert.match(html, /<option value="item_1">Pizza Margherita<\/option>/);
  assert.match(html, /<option value="item_2" selected>Burger<\/option>/);
});

test("renderStoryMenuItemTagPickerCore stays empty without items", () => {
  assert.equal(renderStoryMenuItemTagPickerCore({ storyTag: null }), "");
  assert.equal(
    renderStoryMenuItemTagPickerCore({ storyTag: { status: "ready", items: [] } }),
    ""
  );
});

test("renderStoryMenuItemTagPickerCore shows a hint when loading failed", () => {
  const html = renderStoryMenuItemTagPickerCore({
    storyTag: { status: "error", items: [] }
  });
  assert.match(html, /Produktet nuk mund te ngarkoheshin/);
});

test("renderStoryMenuItemTagPickerCore shows loading hint while items load", () => {
  const html = renderStoryMenuItemTagPickerCore({
    storyTag: { status: "loading", items: [] }
  });
  assert.match(html, /Produktet po ngarkohen/);
});
