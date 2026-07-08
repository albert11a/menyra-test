import assert from "node:assert/strict";
import test from "node:test";

import {
  isVideoFileCore,
  isImageFileCore,
  isVideoMediaItemCore
} from "../apps/menyra-social/core/media/video-poster-utils.js";
import { normalizeMenuItemDocCore } from "../apps/menyra-social/core/menu/menu-doc-normalize-utils.js";
import { normalizeMenuTypeCore, normalizeOptionListCore } from "../apps/menyra-social/core/menu/menu-input-utils.js";
import { saveMenuItemFromModalCore } from "../apps/menyra-social/core/menu/menu-save-utils.js";
import { buildPublicOffersProjection } from "../apps/menyra-social/core/public-profile/public-projection-builders.js";

function createMenuDocument(values = {}) {
  return {
    getElementById(id) {
      if (Object.prototype.hasOwnProperty.call(values, id)) {
        return { value: values[id], checked: values[id] === true };
      }
      return { value: "", checked: false };
    },
    querySelectorAll() {
      return [];
    }
  };
}

test("media type detection classifies video and image files", () => {
  assert.equal(isVideoFileCore({ type: "video/mp4", name: "clip.mp4" }), true);
  assert.equal(isVideoFileCore({ type: "", name: "clip.MOV" }), true);
  assert.equal(isVideoFileCore({ type: "image/jpeg", name: "photo.jpg" }), false);
  assert.equal(isImageFileCore({ type: "image/png", name: "photo.png" }), true);
  assert.equal(isImageFileCore({ type: "video/webm", name: "clip.webm" }), false);
});

test("isVideoMediaItemCore only flags real video records", () => {
  assert.equal(isVideoMediaItemCore({ mediaType: "video" }), true);
  assert.equal(isVideoMediaItemCore({ videoUrl: "https://cdn/x.mp4" }), true);
  // A food menu item with type "food" must not be mistaken for a video.
  assert.equal(isVideoMediaItemCore({ type: "food", imageUrl: "https://cdn/x.jpg" }), false);
  assert.equal(isVideoMediaItemCore(null), false);
});

test("menu normalization carries video fields and uses the poster as image", () => {
  const item = normalizeMenuItemDocCore({
    id: "vid-1",
    name: "Sizzling Plate",
    mediaType: "video",
    videoUrl: "https://cdn.example/clip.mp4",
    posterUrl: "https://cdn.example/poster.jpg"
  }, "vid-1");

  assert.equal(item.mediaType, "video");
  assert.equal(item.videoUrl, "https://cdn.example/clip.mp4");
  assert.equal(item.posterUrl, "https://cdn.example/poster.jpg");
  // Poster becomes the primary image so photo tiles show the first frame.
  assert.equal(item.imageUrl, "https://cdn.example/poster.jpg");

  const imageItem = normalizeMenuItemDocCore({
    id: "img-1",
    name: "Cold Plate",
    imageUrl: "https://cdn.example/photo.jpg"
  }, "img-1");
  assert.equal(imageItem.mediaType, "image");
  assert.equal(imageItem.videoUrl, "");
});

test("public offers projection preserves video fields for customers", () => {
  const projection = buildPublicOffersProjection({
    items: [{
      id: "offer-vid",
      title: "Sot ne Fokus",
      mediaType: "video",
      videoUrl: "https://cdn.example/focus.mp4",
      posterUrl: "https://cdn.example/focus-poster.jpg",
      imageUrl: "https://cdn.example/focus-poster.jpg",
      active: true
    }]
  });

  assert.equal(projection.items.length, 1);
  assert.equal(projection.items[0].mediaType, "video");
  assert.equal(projection.items[0].videoUrl, "https://cdn.example/focus.mp4");
  assert.equal(projection.items[0].posterUrl, "https://cdn.example/focus-poster.jpg");
});

test("menu editor save uploads video plus first-frame poster", async () => {
  const state = {
    user: { uid: "owner-demo" },
    userProfile: { restaurantId: "pidhi-madh", role: "business" },
    restaurants: [],
    menu: { items: [] },
    menuModal: {
      mode: "create",
      item: null,
      status: "",
      loading: false,
      existingImages: [],
      imageFiles: [],
      imageUrlDraft: "",
      videoFile: { type: "video/mp4", name: "dish.mp4" }
    }
  };
  const documentObj = createMenuDocument({
    menuItemName: "Video Dish",
    menuItemPrice: "9,00",
    menuItemCategory: "Special",
    menuItemType: "food",
    menuItemVisibility: "available"
  });
  const setDocCalls = [];
  const rawUploads = [];
  const posterUploads = [];

  await saveMenuItemFromModalCore({
    state,
    documentObj,
    isShopCatalogProfile: () => false,
    getBusinessProfileType: () => "restaurant",
    renderOverlays: () => {},
    normalizeOptionList: normalizeOptionListCore,
    getMenuModalCrop: () => ({ x: 50, y: 50 }),
    uploadCompressedImage: async (file) => {
      posterUploads.push(file);
      return { cdnUrl: "https://cdn.example/poster.jpg" };
    },
    uploadRawMediaFile: async (file) => {
      rawUploads.push(file);
      return { cdnUrl: "https://cdn.example/dish.mp4", videoId: "vid-xyz" };
    },
    captureVideoPoster: async () => ({ type: "image/jpeg", name: "poster.jpg" }),
    collection: (_db, ...path) => ({ id: path.at(-1), path: path.join("/"), __collectionRef: true }),
    doc: (...args) => {
      if (args.length === 1 && args[0]?.__collectionRef) {
        return { id: "generated-video-menu", path: `${args[0].path}/generated-video-menu` };
      }
      return { id: args.at(-1), path: args.slice(1).join("/") };
    },
    db: { projectId: "mnyra-local" },
    normalizeMenuType: normalizeMenuTypeCore,
    serverTimestamp: () => "SERVER_TIMESTAMP",
    setDoc: async (ref, payload, options) => {
      setDocCalls.push({ ref, payload, options });
    },
    normalizeMenuItemDoc: normalizeMenuItemDocCore,
    syncMenuCaches: () => {},
    publishMenuToPublic: async () => {},
    closeMenuModal: () => {},
    render: () => {}
  });

  assert.equal(rawUploads.length, 1);
  assert.equal(posterUploads.length, 1);
  assert.equal(setDocCalls.length, 1);
  const payload = setDocCalls[0].payload;
  assert.equal(payload.mediaType, "video");
  assert.equal(payload.videoUrl, "https://cdn.example/dish.mp4");
  assert.equal(payload.posterUrl, "https://cdn.example/poster.jpg");
  // Poster is the primary image so the menu tile shows the first frame at once.
  assert.equal(payload.imageUrl, "https://cdn.example/poster.jpg");
});
