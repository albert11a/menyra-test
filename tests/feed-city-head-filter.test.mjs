import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { createFeedViewOrchestrationController } from "../apps/menyra-social/core/feed/feed-view-orchestration-controller.js";

const repoRoot = path.resolve(import.meta.dirname, "..");
const socialRoot = path.join(repoRoot, "apps", "menyra-social");

const PRISHTINA = { lat: 42.6629, lng: 21.1655, label: "Prishtina", city: "Prishtina", source: "manual" };
const TIRANA = { lat: 41.3275, lng: 19.8187, label: "Tirana", city: "Tirana", source: "manual" };

const FEED_POSTS = [
  { id: "p1", business: "Moki's", restaurantId: "r1", category: "Grill", image: "a.jpg", createdAt: new Date(3) },
  { id: "p2", business: "Bar Nena", restaurantId: "r2", category: "Drinks", image: "b.jpg", createdAt: new Date(2) },
  { id: "p3", business: "Cafe Lena", restaurantId: "r3", category: "Grill", image: "c.jpg", createdAt: new Date(1) }
];

function makeWindow(viewerLocation) {
  const store = new Map([["mnyra_social_feed_viewer_location_v1", JSON.stringify(viewerLocation)]]);
  return {
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, value),
      removeItem: (key) => store.delete(key)
    },
    matchMedia: () => ({ matches: false })
  };
}

function renderFeed({ viewerLocation = PRISHTINA, feedCategory = "all", feedPosts = FEED_POSTS } = {}) {
  const state = {
    feedPosts,
    stories: [{ restaurantId: "r1", name: "Moki's", imageUrl: "s.jpg" }],
    restaurants: [
      { id: "r1", name: "Moki's", city: "Prishtina", lat: 42.66, lng: 21.16 },
      { id: "r2", name: "Bar Nena", city: "Prishtina", lat: 42.66, lng: 21.17 },
      { id: "r3", name: "Cafe Lena", city: "Prishtina", lat: 42.67, lng: 21.16 }
    ],
    feedCategory,
    userProfile: {},
    user: null,
    activeTab: "feed"
  };
  const controller = createFeedViewOrchestrationController({
    state,
    windowObj: makeWindow(viewerLocation),
    documentObj: null,
    toDateSafeFn: (value) => (value instanceof Date ? value : new Date(value || 0)),
    escapeHtmlFn: (value) => String(value == null ? "" : value).replace(/[&<>"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    }[char])),
    iconFn: (name) => `<svg data-icon="${name}"></svg>`,
    buildUrlFn: (page, query) => `${page}?${new URLSearchParams(query)}`,
    getOptimizedImageUrlFn: (url) => String(url || ""),
    resolveRestaurantLogoFn: () => "logo.png"
  });
  return controller.renderFeedView();
}

// Bild 1: erst die Zeile mit Frage und Filter, dann ein Beitrag, dann die
// Story-Reihe, dann die restlichen Beitraege.
test("the feed opens with the city head, one post, then the story row", () => {
  const html = renderFeed();
  const cityHead = html.indexOf("data-feed-city=");
  const leadList = html.indexOf('id="feedLeadList"');
  const storiesRow = html.indexOf('id="storiesRow"');
  const feedList = html.indexOf('id="feedList"');
  assert.ok(cityHead >= 0 && leadList > cityHead, "the city head stands above the first post");
  assert.ok(storiesRow > leadList, "the story row follows the first post");
  assert.ok(feedList > storiesRow, "the remaining posts follow the story row");
  const leadBlock = html.slice(leadList, storiesRow);
  assert.equal((leadBlock.match(/data-feed-id="/g) || []).length, 1, "exactly one post stands above the story row");
  const restBlock = html.slice(feedList);
  assert.equal((restBlock.match(/data-feed-id="/g) || []).length, FEED_POSTS.length - 1, "the rest follows below");
});

// Der erste Beitrag traegt oben links Profilbild und Name - dafuer steht er ganz
// oben im Feed.
test("the first post carries logo and business name in its head", () => {
  const html = renderFeed();
  const leadBlock = html.slice(html.indexOf('id="feedLeadList"'), html.indexOf('id="storiesRow"'));
  assert.ok(leadBlock.includes("data-profile-business="), "the post head links to the business");
  assert.ok(leadBlock.includes("data-feed-logo="), "the post head shows the business logo");
});

// Die Frage steht auf Albanisch und in Versalien - kein uebersetzter Satz.
test("the head asks the albanian question", () => {
  const html = renderFeed();
  assert.ok(html.includes("Çka ka sot?"), "the albanian headline stands in the head");
  assert.ok(!html.includes("Qka ka sot"), "the SMS spelling must not be used");
  const css = html.slice(html.indexOf(".feed-city-head__title {"));
  assert.ok(/text-transform:\s*uppercase/.test(css.slice(0, 400)), "the headline is set in caps");
});

// Das Stadtbild haengt am Ort: Prishtina hat eines, andere Staedte noch nicht.
test("only Prishtina shows its skyline", () => {
  const prishtina = renderFeed({ viewerLocation: PRISHTINA });
  assert.ok(prishtina.includes('data-feed-city="prishtina"'), "Prishtina is recognised");
  assert.ok(prishtina.includes("/apps/menyra-social/assets/city-prishtina.svg"), "the skyline is shown");
  const tirana = renderFeed({ viewerLocation: TIRANA });
  assert.ok(tirana.includes('data-feed-city="none"'), "other cities have no art yet");
  assert.ok(!tirana.includes("city-prishtina.svg"), "the Prishtina skyline stays in Prishtina");
  assert.ok(tirana.includes("Çka ka sot?"), "head and filter stay in every city");
});

// Auch ohne Ortsnamen - reine GPS-Position - erkennt der Feed die Stadt.
test("a bare gps position still resolves the city", () => {
  const html = renderFeed({
    viewerLocation: { lat: 42.6629, lng: 21.1655, label: "Vendndodhja aktuale", source: "gps" }
  });
  assert.ok(html.includes('data-feed-city="prishtina"'), "the nearest city carries the art");
});

// Die Silhouette gibt es als Vektor - ein Foto waere ein Vielfaches schwer.
test("the skyline ships as an svg asset", () => {
  const file = path.join(socialRoot, "assets", "city-prishtina.svg");
  const svg = fs.readFileSync(file, "utf8");
  assert.ok(svg.startsWith("<svg"), "the asset is an svg");
  assert.ok(svg.includes('viewBox="0 0 1651 348"'), "the viewBox matches the rendered ratio");
  assert.ok(fs.statSync(file).size < 120 * 1024, "the asset stays small enough for the first paint");
});

// Der Filter bietet nur an, was der Ort hergibt - und zaehlt die Beitraege.
test("the filter lists the categories that exist at this place", () => {
  const html = renderFeed();
  const panel = html.slice(html.indexOf('data-feed-filter-panel'), html.indexOf("</section>"));
  assert.ok(panel.includes('data-feed-filter-option="all"'), "the unfiltered entry stands first");
  assert.ok(panel.includes('data-feed-filter-option="Grill"'), "Grill is offered");
  assert.ok(panel.includes('data-feed-filter-option="Drinks"'), "Drinks is offered");
  assert.ok(!panel.includes('data-feed-filter-option="Pasta"'), "categories without posts stay out");
});

// Eine Auswahl schneidet den Feed zurecht und steht auf dem Knopf.
test("a chosen category filters the feed and names the button", () => {
  const html = renderFeed({ feedCategory: "Drinks" });
  assert.equal((html.match(/data-feed-id="/g) || []).length, 1, "only the matching post remains");
  assert.ok(/feed-city-filter__label">Drinks</.test(html), "the button carries the active category");
  assert.ok(/class="feed-city-filter__btn feed-city-filter__btn--active"/.test(html), "the button shows that a filter is set");
});

// Eine Kategorie, die es am Ort nicht mehr gibt, darf den Feed nicht leeren.
test("a stale category falls back to the full feed", () => {
  const html = renderFeed({ feedCategory: "Pasta" });
  assert.equal((html.match(/data-feed-id="/g) || []).length, FEED_POSTS.length, "all posts stay visible");
  assert.ok(/class="feed-city-filter__btn"/.test(html), "the button reads unfiltered again");
  assert.ok(/feed-city-filter__label">Filtro</.test(html), "the button falls back to its plain name");
});

// Ohne Beitraege bleibt genau ein Hinweis stehen - nicht einer je Liste.
test("the empty feed shows its notice once", () => {
  const html = renderFeed({ feedPosts: [] });
  assert.equal((html.match(/Nuk ka postime/g) || []).length, 1, "the empty notice stands once");
});

// Der Filter muss bedient werden: Knopf, Liste und Auswahl haengen am
// delegierten Klick-Handler des Feeds.
test("the feed click handler serves the filter", () => {
  const text = fs.readFileSync(path.join(socialRoot, "core", "feed", "feed-view-orchestration-controller.js"), "utf8");
  assert.ok(text.includes('target.closest("[data-feed-filter-toggle]")'), "the button opens the list");
  assert.ok(text.includes('target.closest("[data-feed-filter-option]")'), "an option applies the filter");
  assert.ok(text.includes("setStateFn({ feedCategory: nextCategory })"), "the choice reaches the state");
});

// Nach der Auswahl bleibt der bestehende Feed-Knoten stehen - die Kopfzeile
// muss deshalb im Nachzieh-Durchgang aktualisiert werden.
test("the update pass keeps the head in sync", () => {
  const text = fs.readFileSync(path.join(socialRoot, "core", "feed", "feed-view-orchestration-controller.js"), "utf8");
  const start = text.indexOf("function updateFeedDom");
  assert.ok(start >= 0, "updateFeedDom must be findable");
  const block = text.slice(start, start + 1400);
  assert.ok(block.includes("patchFeedCityHeader("), "the head is patched on every update");
  assert.ok(block.includes("resolveFeedRenderCollections()"), "render and update read the same list");
});

// Das Symbol des Filters steht im ersten Bildschirm - es darf nicht auf das
// nachgeladene Lucide-Script warten.
test("the filter icon is available inline", () => {
  const text = fs.readFileSync(path.join(socialRoot, "social-app.js"), "utf8");
  assert.ok(text.includes('"sliders-horizontal": Object.freeze('), "the icon ships inline");
});
