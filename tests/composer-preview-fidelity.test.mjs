// Die Vorschau im Business-Composer muss 1:1 dem echten Beitrag und der
// echten Story entsprechen. Diese Tests halten das fest: sie schlagen fehl,
// sobald Feed, Story-Kachel oder Story-Seite sich aendern, ohne dass die
// gemeinsamen Bausteine mitgezogen werden.

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
import { STORY_VIEWER_SURFACE_CSS, STORY_VIEWER_SURFACE_CLASS } from "../apps/menyra-social/core/stories/story-viewer-surface-css.js";
import {
  buildStoryViewerSurfaceModuleCore,
  STORY_SURFACE_SELECTORS,
  SURFACE_SCOPE
} from "../scripts/generate-story-viewer-surface-css.mjs";

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
  assert.ok(buildStoryTileInnerStyleCore().startsWith("height:13rem;border-radius:1rem;"));
  assert.ok(renderStoryTileMediaFallbackCore({ iconFn: (n) => n }).includes("camera"));
});

test("story viewer surface css is in sync with story/index.html", async () => {
  const html = await readFile(repoUrl("apps/menyra-social/story/index.html"), "utf8");
  const current = await readFile(repoUrl("apps/menyra-social/core/stories/story-viewer-surface-css.js"), "utf8");
  // Regeneriert man aus der Story-Seite, muss exakt das committete Modul
  // herauskommen. Aendert jemand story/index.html, faellt dieser Test.
  assert.equal(current, buildStoryViewerSurfaceModuleCore(html));
});

test("story viewer surface css covers every visible reel layer", () => {
  assert.equal(STORY_VIEWER_SURFACE_CLASS, SURFACE_SCOPE.slice(1));
  STORY_SURFACE_SELECTORS.forEach((selector) => {
    const first = selector.split(",")[0].trim();
    assert.ok(
      STORY_VIEWER_SURFACE_CSS.includes(`${SURFACE_SCOPE} ${first}`),
      `Regel fehlt: ${first}`
    );
  });
  // Die Buehne darf genau zwei Dinge anders machen: Hoehe und Klickbarkeit.
  assert.ok(STORY_VIEWER_SURFACE_CSS.includes(`${SURFACE_SCOPE} .reel {\n  height: 100%;`));
  assert.ok(STORY_VIEWER_SURFACE_CSS.includes("pointer-events: none;"));
});

test("composer reel preview uses the same nodes the story viewer builds", async () => {
  const viewerSource = await readFile(repoUrl("apps/menyra-social/core/stories/story-viewer-runtime-controller.js"), "utf8");
  const composerSource = await readFile(repoUrl("apps/menyra-social/core/composer/business-composer-controller.js"), "utf8");
  const layers = [
    "reel",
    "vignette",
    "topbar",
    "topbarLeft",
    "topbarRight",
    "btnIcon",
    "brandPill",
    "brandLogo",
    "brandName",
    "content",
    "contentDesc",
    "rail",
    "railBtn",
    "railIcon",
    "productCard",
    "productCardThumb",
    "productCardThumbImg",
    "productCardInfo",
    "productCardName",
    "productCardPrice",
    "productCardBtn",
    "reel-image"
  ];
  layers.forEach((layer) => {
    assert.ok(
      viewerSource.includes(`"${layer}"`) || viewerSource.includes(`class=\\"${layer}\\"`),
      `Story-Viewer kennt "${layer}" nicht mehr - Vorschau anpassen`
    );
    assert.ok(
      composerSource.includes(`class="${layer}"`) || composerSource.includes(`class="${layer} `),
      `Vorschau rendert "${layer}" nicht`
    );
  });
});
