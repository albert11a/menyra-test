// Die Vorschau im Business-Composer muss 1:1 dem echten Beitrag und der
// echten Story-Reihe entsprechen. Diese Tests halten das fest: sie schlagen
// fehl, sobald Feed oder Story-Kachel sich aendern, ohne dass die gemeinsamen
// Bausteine mitgezogen werden.

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { renderFeedCardMarkupCore } from "../apps/menyra-social/core/feed/feed-card-markup-utils.js";
import {
  renderStoryTileMarkupCore,
  renderStoryTileMediaFallbackCore,
  buildStoryTileInnerStyleCore,
  buildStoryTileShellStyleCore
} from "../apps/menyra-social/core/feed/story-tile-markup-utils.js";

const repoUrl = (path) => new URL(`../${path}`, import.meta.url);

test("feed renderer and composer preview share one card builder", async () => {
  const feedSource = await readFile(repoUrl("apps/menyra-social/core/feed/feed-view-orchestration-controller.js"), "utf8");
  const composerSource = await readFile(repoUrl("apps/menyra-social/core/composer/business-composer-controller.js"), "utf8");
  // Beide Seiten rufen denselben Baustein auf - kein zweiter Kartenaufbau.
  assert.ok(feedSource.includes("renderFeedCardMarkupCore({"));
  assert.ok(composerSource.includes("renderFeedCardMarkupCore({"));
  // Und keine Seite baut die Karte noch einmal von Hand.
  assert.ok(!feedSource.includes('class="group feed-card"'));
  assert.ok(!composerSource.includes('class="group feed-card"'));
});

test("story tile renderer and composer preview share one tile builder", async () => {
  const feedSource = await readFile(repoUrl("apps/menyra-social/core/feed/feed-view-orchestration-controller.js"), "utf8");
  const composerSource = await readFile(repoUrl("apps/menyra-social/core/composer/business-composer-controller.js"), "utf8");
  assert.ok(feedSource.includes("renderStoryTileMarkupCore({"));
  assert.ok(composerSource.includes("renderStoryTileMarkupCore({"));
  // Der Logo-Ring der Story-Kachel steht nur noch im gemeinsamen Baustein.
  const ring = "linear-gradient(135deg,#f59e0b 0%,#db2777 100%)";
  assert.ok(!feedSource.includes(ring));
  assert.ok(!composerSource.includes(ring));
  // Auch die Masse kommen aus dem Baustein, nicht aus eigenen Zahlen.
  assert.ok(composerSource.includes("buildStoryTileShellStyleCore({ withMarginLeft: first })"));
  assert.ok(composerSource.includes("buildStoryTileInnerStyleCore()"));
});

test("feed card markup keeps the classes the shipped stylesheet knows", () => {
  const html = renderFeedCardMarkupCore({
    business: "Casa Rita",
    location: "Prishtina",
    content: "Pica e re",
    likes: 3,
    comments: 1,
    logoImgHtml: '<img src="l.jpg" />',
    heroMediaHtml: '<img src="h.jpg" />',
    heroReady: true,
    escapeHtmlFn: (value) => String(value ?? ""),
    iconFn: (name) => `<i data-icon="${name}"></i>`
  });
  assert.ok(html.includes('class="group feed-card"'));
  assert.ok(html.includes("rounded-[3.5rem]"));
  assert.ok(html.includes("aspect-ratio:4/5"));
  assert.ok(html.includes("line-clamp-2"));
  assert.ok(html.includes('data-icon="heart"'));
  assert.ok(html.includes('data-icon="message-circle"'));
  assert.ok(html.includes('data-icon="share-2"'));
  // Ohne Bild traegt die Buehne den grauen Platzhalter - genau wie im Feed.
  const empty = renderFeedCardMarkupCore({ heroReady: false });
  assert.ok(empty.includes("bg-slate-200"));
});

test("story tile markup keeps geometry and layers", () => {
  const html = renderStoryTileMarkupCore({
    label: "Casa Rita",
    mediaHtml: '<img src="m.jpg" />',
    logoImgHtml: '<img src="l.jpg" />',
    escapeHtmlFn: (value) => String(value ?? "")
  });
  assert.ok(html.includes("h-52"));
  assert.ok(html.includes("height:13rem;"));
  assert.ok(html.includes("border-radius:1rem;"));
  assert.ok(html.includes("linear-gradient(135deg,#f59e0b 0%,#db2777 100%)"));
  assert.ok(html.includes("Casa Rita"));
  assert.equal(buildStoryTileShellStyleCore(), "flex:0 0 29%;width:29%;max-width:120px;");
  // Die erste Kachel der Reihe steht eingerueckt - im Feed wie in der Vorschau.
  assert.equal(
    buildStoryTileShellStyleCore({ withMarginLeft: true }),
    "flex:0 0 29%;width:29%;max-width:120px;margin-left:1.25rem;"
  );
  assert.ok(buildStoryTileInnerStyleCore().startsWith("height:13rem;border-radius:1rem;"));
  assert.ok(renderStoryTileMediaFallbackCore({ iconFn: (n) => n }).includes("camera"));
});

test("composer story preview is the zbulo story row: own story sharp, neighbours blurred", async () => {
  const composerSource = await readFile(repoUrl("apps/menyra-social/core/composer/business-composer-controller.js"), "utf8");
  const feedSource = await readFile(repoUrl("apps/menyra-social/core/feed/feed-view-orchestration-controller.js"), "utf8");
  // Genau drei Kacheln: die eigene und zwei Nachbarn.
  assert.ok(composerSource.includes("${buildOwnStoryTileMarkup()}"));
  assert.equal((composerSource.match(/\$\{buildNeighbourStoryTileMarkup\(\d\)\}/g) || []).length, 2);
  // Nur die eigene Kachel ist scharf, die Nachbarn traegt der Blur-Marker.
  assert.ok(composerSource.includes('shellAttrs: "data-bc-story-own"'));
  assert.ok(composerSource.includes("data-bc-story-blur="));
  assert.ok(composerSource.includes(".mnyra-bc__story-track > [data-bc-story-blur] > div > * {"));
  assert.ok(composerSource.includes("filter: blur("));
  // Der Abstand der Reihe ist derselbe wie im Feed (gap-2.5 = 10px).
  assert.ok(feedSource.includes("gap-2.5"));
  assert.ok(composerSource.includes("const STORY_TRACK_GAP = 10;"));
  // Die geoeffnete Story wird nicht mehr nachgebaut.
  assert.ok(!composerSource.includes('class="reel"'));
  assert.ok(!composerSource.includes("story-viewer-surface-css"));
});
