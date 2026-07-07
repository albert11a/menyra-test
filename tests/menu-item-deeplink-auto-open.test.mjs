import assert from "node:assert/strict";
import test from "node:test";

import { bindAppMenuFocusEventsCore } from "../apps/menyra-social/core/app-events/app-events-menu-focus-bind-utils.js";

function createFakeMenuOpenButton(itemId) {
  return {
    dataset: { menuOpen: itemId },
    scrollIntoViewCalls: 0,
    scrollIntoView() {
      this.scrollIntoViewCalls += 1;
    },
    addEventListener() {}
  };
}

function createFakeEnvironment({ search = "", menuOpenButton = null, menuTabButton = null } = {}) {
  const win = {
    location: { search },
    CSS: { escape: (value) => String(value) },
    setTimeout: (fn) => fn(),
    clearTimeout: () => {}
  };
  const doc = {
    defaultView: win,
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: (selector) => {
      if (menuOpenButton && selector === `[data-menu-open="${menuOpenButton.dataset.menuOpen}"]`) {
        return menuOpenButton;
      }
      if (menuTabButton && selector.includes("data-profile-top-tab")) {
        return menuTabButton;
      }
      return null;
    },
    addEventListener: () => {}
  };
  return { win, doc };
}

function createFakeState({ menuRestaurantId = "" } = {}) {
  return {
    menu: { restaurantId: menuRestaurantId, items: [] },
    menuDetail: { open: false },
    profilePostMenuId: null,
    profileView: null,
    userProfile: {},
    upload: {},
    tableQr: {}
  };
}

function bindWithDeepLink({ search, menuOpenButton, menuRestaurantId }) {
  const { win, doc } = createFakeEnvironment({ search, menuOpenButton });
  const state = createFakeState({ menuRestaurantId });
  const openedTriggers = [];
  bindAppMenuFocusEventsCore({
    documentObj: doc,
    state,
    triggerMenuDetailOpenFromGestureFn: (trigger) => openedTriggers.push(trigger),
    profileMenuBound: true
  });
  return { win, openedTriggers };
}

test("story deep link auto-opens the tagged product once the card is rendered", () => {
  const button = createFakeMenuOpenButton("item_7");
  const { win, openedTriggers } = bindWithDeepLink({
    search: "?r=rest_1&item=item_7&src=story",
    menuOpenButton: button,
    menuRestaurantId: "rest_1"
  });
  assert.equal(openedTriggers.length, 1);
  assert.equal(openedTriggers[0], button);
  assert.equal(button.scrollIntoViewCalls, 1);
  assert.equal(win.__MENYRA_MENU_ITEM_DEEPLINK_DONE__, true);
});

test("deep link waits while a different restaurant menu is visible", () => {
  const button = createFakeMenuOpenButton("item_7");
  const { win, openedTriggers } = bindWithDeepLink({
    search: "?r=rest_1&item=item_7",
    menuOpenButton: button,
    menuRestaurantId: "rest_OTHER"
  });
  assert.equal(openedTriggers.length, 0);
  assert.notEqual(win.__MENYRA_MENU_ITEM_DEEPLINK_DONE__, true);
});

test("deep link retries while the card is not rendered yet", () => {
  const { win, openedTriggers } = bindWithDeepLink({
    search: "?r=rest_1&item=item_7",
    menuOpenButton: null,
    menuRestaurantId: "rest_1"
  });
  assert.equal(openedTriggers.length, 0);
  assert.notEqual(win.__MENYRA_MENU_ITEM_DEEPLINK_DONE__, true);
});

test("without item param the deep link check settles immediately", () => {
  const { win, openedTriggers } = bindWithDeepLink({
    search: "?r=rest_1",
    menuOpenButton: createFakeMenuOpenButton("item_7"),
    menuRestaurantId: "rest_1"
  });
  assert.equal(openedTriggers.length, 0);
  assert.equal(win.__MENYRA_MENU_ITEM_DEEPLINK_DONE__, true);
});

test("deep link switches to the menu tab when route landed on the profile tab", () => {
  const menuTabButton = {
    clicks: 0,
    click() {
      this.clicks += 1;
    }
  };
  const { win, doc } = createFakeEnvironment({
    search: "?r=rest_1&item=item_7&src=story",
    menuOpenButton: null,
    menuTabButton
  });
  const state = createFakeState({ menuRestaurantId: "" });
  state.activeTab = "profile";
  state.profileTopTab = "profile";
  state.profileView = { profile: { restaurantId: "rest_1" } };
  const openedTriggers = [];
  const bind = () => bindAppMenuFocusEventsCore({
    documentObj: doc,
    state,
    triggerMenuDetailOpenFromGestureFn: (trigger) => openedTriggers.push(trigger),
    profileMenuBound: true
  });
  bind();
  assert.equal(menuTabButton.clicks, 1);
  assert.equal(openedTriggers.length, 0);
  assert.notEqual(win.__MENYRA_MENU_ITEM_DEEPLINK_DONE__, true);
  // Der Tab-Wechsel passiert nur einmal, auch wenn weitere Renders folgen.
  bind();
  assert.equal(menuTabButton.clicks, 1);
});

test("deep link never switches tabs on a foreign business profile", () => {
  const menuTabButton = {
    clicks: 0,
    click() {
      this.clicks += 1;
    }
  };
  const { doc } = createFakeEnvironment({
    search: "?r=rest_1&item=item_7",
    menuOpenButton: null,
    menuTabButton
  });
  const state = createFakeState({ menuRestaurantId: "" });
  state.activeTab = "profile";
  state.profileTopTab = "profile";
  state.profileView = { profile: { restaurantId: "rest_OTHER" } };
  bindAppMenuFocusEventsCore({
    documentObj: doc,
    state,
    triggerMenuDetailOpenFromGestureFn: () => {},
    profileMenuBound: true
  });
  assert.equal(menuTabButton.clicks, 0);
});

test("deep link fires only once per page load", () => {
  const button = createFakeMenuOpenButton("item_7");
  const { win, doc } = createFakeEnvironment({
    search: "?r=rest_1&item=item_7",
    menuOpenButton: button
  });
  const state = createFakeState({ menuRestaurantId: "rest_1" });
  const openedTriggers = [];
  const bind = () => bindAppMenuFocusEventsCore({
    documentObj: doc,
    state,
    triggerMenuDetailOpenFromGestureFn: (trigger) => openedTriggers.push(trigger),
    profileMenuBound: true
  });
  bind();
  bind();
  assert.equal(openedTriggers.length, 1);
  assert.equal(win.__MENYRA_MENU_ITEM_DEEPLINK_DONE__, true);
});
