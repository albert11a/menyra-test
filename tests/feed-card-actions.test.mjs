import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { renderFeedCardMarkupCore } from "../apps/menyra-social/core/feed/feed-card-markup-utils.js";

const repoRoot = path.resolve(import.meta.dirname, "..");
const controllerPath = path.join(
  repoRoot,
  "apps",
  "menyra-social",
  "core",
  "feed",
  "feed-view-orchestration-controller.js"
);

// Das stumme Drei-Punkte-Zeichen oben rechts ist weg.
test("a feed card has no three dot menu", () => {
  const markup = renderFeedCardMarkupCore({
    business: "Moki",
    iconFn: (name) => `<i data-icon="${name}"></i>`
  });
  assert.ok(!markup.includes("more-horizontal"), "the three dot glyph must be gone");
});

// Der eigene Beitrag behaelt seinen Loeschen-Knopf.
test("the owner delete button still has its place", () => {
  const markup = renderFeedCardMarkupCore({
    business: "Moki",
    menuHtml: '<button data-feed-post-delete="p1">x</button>',
    iconFn: () => ""
  });
  assert.ok(markup.includes('data-feed-post-delete="p1"'), "the delete button must survive");
});

// Ohne Likes und Kommentare steht dort 0 - nicht nichts.
test("missing like and comment counts render as zero", () => {
  const markup = renderFeedCardMarkupCore({
    business: "Moki",
    likeCountAttrs: 'data-post-like-count="p1"',
    commentCountAttrs: 'data-post-comment-count="p1"',
    iconFn: () => ""
  });
  const likeSpan = markup.match(/data-post-like-count="p1"[^>]*>([^<]*)</);
  const commentSpan = markup.match(/data-post-comment-count="p1"[^>]*>([^<]*)</);
  assert.equal(likeSpan?.[1], "0", "an unknown like count must read 0");
  assert.equal(commentSpan?.[1], "0", "an unknown comment count must read 0");
});

test("real like and comment counts are rendered as whole numbers", () => {
  const markup = renderFeedCardMarkupCore({
    business: "Moki",
    likes: 12,
    comments: "5",
    likeCountAttrs: 'data-post-like-count="p1"',
    commentCountAttrs: 'data-post-comment-count="p1"',
    iconFn: () => ""
  });
  assert.equal(markup.match(/data-post-like-count="p1"[^>]*>([^<]*)</)?.[1], "12");
  assert.equal(markup.match(/data-post-comment-count="p1"[^>]*>([^<]*)</)?.[1], "5");
});

// Teilen: erst das native Menue, sonst der Link in der Zwischenablage.
test("share falls back to copying the link", () => {
  const text = fs.readFileSync(controllerPath, "utf8");
  const start = text.indexOf('const shareBtn = target.closest("[data-feed-post-share]")');
  assert.ok(start >= 0, "the share branch must be findable");
  const block = text.slice(start, start + 2400);
  assert.ok(block.includes("const fallbackToCopy"), "there must be a copy fallback");
  assert.ok(
    block.includes("win?.navigator?.canShare"),
    "a device that cannot share this payload must take the fallback"
  );
  assert.ok(
    block.includes('if (typeof nativeShare !== "function" || !canShare)'),
    "a missing native share must take the fallback"
  );
  assert.ok(
    block.includes('if (String(err?.name || "").trim() === "AbortError") return;'),
    "a share the user cancelled must stay silent"
  );
  assert.ok(!block.includes('"Geteilt"'), "the german feedback label must be gone");
  assert.ok(block.includes('"Linku u kopjua"'), "the copy feedback must be albanian");
});
