import test from "node:test";
import assert from "node:assert/strict";
import { buildProfilePostImage } from "../apps/menyra-social/core/profile/profile-post-image-utils.js";

const widths = { small: 480, medium: 768, large: 1280 };
const resolveImage = (key, size) => `https://cdn.example/media/${key}?w=${widths[size]}`;

test("grid starts with a small preview, offers real width variants and prioritizes only its first row", () => {
  const options = { rawImage: "post.jpg", isGrid: true, isWide: false, resolveImage };
  const first = buildProfilePostImage({ ...options, priorityIndex: 0 });
  assert.match(first.src, /w=480$/);
  assert.match(first.srcset, /w=1280 1280w/);
  assert.match(first.sizes, /44vw/);
  assert.equal(first.loading, "eager");
  assert.equal(first.fetchPriority, "high");
  const second = buildProfilePostImage({ ...options, priorityIndex: 1 });
  assert.equal(second.loading, "eager");
  assert.equal(second.fetchPriority, "auto");
  assert.equal(buildProfilePostImage({ ...options, priorityIndex: 2 }).loading, "lazy");
});

test("full-width list prioritizes one image and retains larger responsive sizes", () => {
  const image = buildProfilePostImage({ rawImage: "post.jpg", isGrid: false, priorityIndex: 1, resolveImage });
  assert.match(image.src, /w=768$/);
  assert.match(image.sizes, /90vw/);
  assert.equal(image.loading, "lazy");
});

test("untransformed external, Firebase, inline and missing images never get false width descriptors", () => {
  for (const rawImage of ["https://firebasestorage.googleapis.com/photo", "https://example.com/photo.jpg", "data:image/png;base64,abc", ""]) {
    const image = buildProfilePostImage({ rawImage, isGrid: true, resolveImage: value => value });
    assert.equal(image.src, rawImage);
    assert.equal(image.srcset, "");
  }
});
