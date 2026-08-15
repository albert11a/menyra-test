import assert from "node:assert/strict";
import test from "node:test";
import { createAppShellRuntimeController } from "../apps/menyra-social/core/app-shell/app-shell-runtime-controller.js";
import { createShellDomRuntimeController } from "../apps/menyra-social/core/app-shell/shell-dom-runtime-controller.js";
import { createSessionTabLifecycleRuntimeController } from "../apps/menyra-social/core/app-shell/session-tab-lifecycle-runtime-controller.js";

class FakeClassList {
  add() {}
  remove() {}
  toggle() {}
}

class FakeNode {
  constructor() {
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.classList = new FakeClassList();
    this.attributes = new Map();
    this.textContent = "";
    this.className = "";
    this.parentNode = null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) || "";
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
  }

  querySelector(selector) {
    if (selector === '[data-unread-badge="header"]') {
      return this.children.find((child) => child.dataset.unreadBadge === "header") || null;
    }
    if (selector === '[data-unread-badge="drawer"]') {
      return this.children.find((child) => child.dataset.unreadBadge === "drawer") || null;
    }
    if (selector === '[data-chat-badge="drawer"]') {
      return this.children.find((child) => child.dataset.chatBadge === "drawer") || null;
    }
    return null;
  }
}

function createFakeDocument() {
  const headerAnchor = new FakeNode();
  const drawerNotifications = new FakeNode();
  const drawerChat = new FakeNode();
  return {
    headerAnchor,
    drawerNotifications,
    drawerChat,
    documentElement: { classList: new FakeClassList() },
    body: { classList: new FakeClassList(), style: {} },
    getElementById: () => null,
    querySelector: (selector) => {
      if (selector === '[data-header-badge-anchor="true"]') return headerAnchor;
      if (selector === '[data-nav="notifications"]') return drawerNotifications;
      if (selector === '[data-nav="chat"]') return drawerChat;
      return null;
    },
    querySelectorAll: () => [],
    createElement: () => new FakeNode()
  };
}

test("shell chrome update refreshes notification badges while chat v1 is disabled", () => {
  const documentObj = createFakeDocument();
  const state = {
    user: { uid: "user-123" },
    userProfile: { uid: "user-123", name: "Casa Rita" },
    notifications: [{ id: "update-1", read: false }],
    drawerOpen: false
  };
  const controller = createShellDomRuntimeController({
    state,
    documentObj,
    getChatUnreadCount: () => 2,
    isGuestSession: () => false,
    resolveShellAvatarUrl: () => "",
    resolveHeaderBranding: () => ({ title: "MNYRA", subtitle: "", logoUrl: "", isBusinessLogo: false }),
    isPlaceholderUrl: (value) => !String(value || "").trim(),
    refreshSelfCommentAvatars: () => {}
  });

  controller.updateShellDom();

  assert.equal(documentObj.headerAnchor.querySelector('[data-unread-badge="header"]').textContent, "1");
  assert.equal(documentObj.drawerNotifications.querySelector('[data-unread-badge="drawer"]').textContent, "1");
  assert.equal(documentObj.drawerChat.querySelector('[data-chat-badge="drawer"]'), null);
});

test("authenticated header avatar exposes fallback source", () => {
  const controller = createAppShellRuntimeController({
    state: { userProfile: {} },
    PLACEHOLDER_IMAGE: "placeholder.jpg",
    getAuthInitialized: () => true,
    isGuestSession: () => false,
    escapeHtml: (value = "") => String(value || ""),
    icon: () => ""
  });

  const html = controller.renderHeaderActionButton("https://images.example.local/avatar.jpg", "object-cover");

  assert.match(html, /id="headerAvatar"/);
  assert.match(html, /data-img-key="avatar:header"/);
  assert.match(html, /data-fallback-src="placeholder\.jpg"/);
});

test("drawer avatar exposes fallback source", () => {
  const controller = createShellDomRuntimeController({
    state: {
      user: { uid: "user-123" },
      userProfile: {
        uid: "user-123",
        name: "Local Owner",
        avatar: "https://images.example.local/owner.jpg"
      }
    },
    brandUi: { title: "MNYRA" },
    isGuestSession: () => false,
    isCeoUser: () => false,
    resolveUserAvatar: (value = "") => String(value || "").trim(),
    placeholderImage: "placeholder.jpg",
    resolveHeaderBranding: () => ({ title: "MNYRA", subtitle: "", logoUrl: "", isBusinessLogo: false }),
    isPlaceholderUrl: (value) => !String(value || "").trim(),
    escapeHtml: (value = "") => String(value || ""),
    icon: () => ""
  });

  const html = controller.renderDrawer();

  assert.match(html, /id="drawerAvatar"/);
  assert.match(html, /data-img-key="avatar:drawer"/);
  assert.match(html, /data-fallback-src="placeholder\.jpg"/);
});

test("login live listeners warm notification chrome while chat v1 is disabled", () => {
  const calls = [];
  const user = { uid: "user-123" };
  const controller = createSessionTabLifecycleRuntimeController({
    state: { user, userProfile: {}, activeTab: "feed", settings: { pushNotifs: false } },
    dataLoaded: {},
    startChatThreadsListenerFn: () => calls.push("startChat"),
    stopChatThreadsListenerFn: () => calls.push("stopChat"),
    attachCurrentUserProfileListenerFn: () => calls.push("attachProfile"),
    startFollowingListenerFn: () => calls.push("startFollowing"),
    updateNotificationsDomFn: () => {
      calls.push("updateNotifications");
      return true;
    },
    syncNotificationsPushRuntimeFn: () => {
      calls.push("syncNotifications");
      return Promise.resolve(false);
    }
  });

  controller.startLiveListeners(user);

  assert.deepEqual(calls, [
    "stopChat",
    "attachProfile",
    "startFollowing",
    "updateNotifications",
    "syncNotifications"
  ]);
});

test("authenticated feed ensure keeps the chat thread listener alive for badges", async () => {
  const calls = [];
  const controller = createSessionTabLifecycleRuntimeController({
    state: { user: { uid: "user-123" }, userProfile: {}, activeTab: "feed", profileView: null },
    dataLoaded: {},
    sanitizeTabForSession: (tab) => tab,
    startChatThreadsListenerFn: () => calls.push("startChat"),
    stopChatThreadsListenerFn: () => calls.push("stopChat"),
    loadFeedPostsFn: async () => calls.push("loadFeed"),
    loadRestaurantsFn: async () => calls.push("loadRestaurants")
  });

  await controller.ensureTabData("feed");

  assert.equal(calls.includes("startChat"), false);
  assert.equal(calls.includes("stopChat"), false);
  assert.ok(calls.includes("loadFeed"));
});

// ===========================================================================
// Katalog-Editor und Offerten-Editor stehen nicht mehr im Drawer.
//
// Beide haben im Panel ihre eigene Karte ("Ndrysho menunë", "Lësho ofertë")
// gleich unter der Posting-Karte. Ein Eintrag im Drawer waere derselbe Weg
// ein zweites Mal - und die Suchen in updateShellDom haetten danach die
// Karten im Panel erwischt statt der Drawer-Eintraege.
// ===========================================================================

function renderBusinessDrawer() {
  const controller = createShellDomRuntimeController({
    state: {
      user: { uid: "u1" },
      userProfile: { uid: "u1", name: "Casa Rita", restaurantId: "r1", role: "business" },
      activeTab: "dashboard",
      drawerOpen: true
    },
    documentObj: null,
    isGuestSession: () => false,
    isLocalBusinessProfile: () => true,
    isBusinessOwnerProfile: () => true,
    resolveShellAvatarUrl: () => "",
    resolveHeaderBranding: () => ({ title: "MNYRA", subtitle: "", logoUrl: "", isBusinessLogo: true }),
    isPlaceholderUrl: () => false,
    escapeHtml: (value = "") => String(value || ""),
    icon: () => ""
  });
  return controller.renderDrawer();
}

test("a business drawer carries nothing the panel already covers", () => {
  const html = renderBusinessDrawer();
  // Katalog- und Offerten-Editor haben im Panel ihre Karte, die Analitika ihre
  // Seite im Bento - keiner der drei steht noch im Drawer.
  // "businessAccounts" ist ebenfalls raus: Stafi steht jetzt in Opsionet.
  ["menu", "ofertatbiznes", "analytics", "businessAccounts"].forEach((id) => {
    assert.equal(html.includes(`data-nav="${id}"`), false, `${id} steht wieder im Drawer`);
  });
  // Opsionet steht ebenfalls im Bento. Der Eintrag ist deshalb nicht geloescht,
  // sondern fuer Business-Konten verborgen - andere Konten haben kein Panel und
  // brauchen ihn weiter.
  assert.ok(html.includes('data-nav="settings"'), "der Eintrag muss es weiter geben");
  const settingsAt = html.indexOf('data-nav="settings"');
  const settingsTag = html.slice(html.lastIndexOf("<button", settingsAt), html.indexOf(">", settingsAt));
  assert.ok(settingsTag.includes("hidden"), settingsTag);
  // Die Marken des alten Katalog-Eintrags sind mit ihm verschwunden.
  assert.equal(html.includes("data-menu-nav-label"), false);
  assert.equal(html.includes("data-menu-nav-icon"), false);
});

test("a drawer without a panel keeps the settings entry visible", () => {
  const controller = createShellDomRuntimeController({
    state: {
      user: { uid: "u2" },
      userProfile: { uid: "u2", name: "Privat" },
      activeTab: "feed",
      drawerOpen: true
    },
    documentObj: null,
    isGuestSession: () => false,
    isLocalBusinessProfile: () => false,
    isBusinessOwnerProfile: () => false,
    resolveShellAvatarUrl: () => "",
    resolveHeaderBranding: () => ({ title: "MNYRA", subtitle: "", logoUrl: "", isBusinessLogo: false }),
    isPlaceholderUrl: () => false,
    escapeHtml: (value = "") => String(value || ""),
    icon: () => ""
  });
  const html = controller.renderDrawer();
  const settingsAt = html.indexOf('data-nav="settings"');
  assert.ok(settingsAt > -1, "ohne Panel ist der Drawer der einzige Weg zu den Einstellungen");
  const settingsTag = html.slice(html.lastIndexOf("<button", settingsAt), html.indexOf(">", settingsAt));
  assert.equal(settingsTag.includes("hidden"), false, settingsTag);
});

test("the rest of the drawer stays where it was", () => {
  const html = renderBusinessDrawer();
  ["dashboard", "feed", "profile", "orders", "notifications"].forEach((id) => {
    assert.ok(html.includes(`data-nav="${id}"`), `${id} fehlt jetzt im Drawer`);
  });
});
