"use strict";

const admin = require("firebase-admin");
const {
  asText,
  normalizeHandleValue,
  serializeFirestoreValue
} = require("./common");

const HEART_PERSONA_KEYS = Object.freeze(["ceo", "business", "user"]);

function buildStableNumericCode(seed = "", prefix = "90") {
  const safeSeed = asText(seed, "mnyra-heart");
  let hash = 0;
  for (let index = 0; index < safeSeed.length; index += 1) {
    hash = (hash * 31 + safeSeed.charCodeAt(index)) % 1000000;
  }
  return `${prefix}${String(Math.abs(hash)).padStart(6, "0")}`;
}

function ensureObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function mergeDeep(base = {}, patch = {}) {
  const next = { ...ensureObject(base) };
  Object.entries(ensureObject(patch)).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      next[key] = value.slice();
      return;
    }
    if (value && typeof value === "object") {
      next[key] = mergeDeep(next[key], value);
      return;
    }
    if (value !== undefined) {
      next[key] = value;
    }
  });
  return next;
}

function uniqueTextList(...values) {
  const seen = new Set();
  return values.flatMap((value) => {
    if (Array.isArray(value)) {
      return value.map((entry) => asText(entry)).filter(Boolean);
    }
    const safeValue = asText(value);
    return safeValue ? [safeValue] : [];
  }).filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildUrl(baseUrl = "", params = {}) {
  const safeBaseUrl = asText(baseUrl);
  if (!safeBaseUrl) return "";
  try {
    const url = new URL(safeBaseUrl);
    Object.entries(params).forEach(([key, value]) => {
      const safeValue = asText(value);
      if (!safeValue) return;
      url.searchParams.set(key, safeValue);
    });
    return url.toString();
  } catch {
    return safeBaseUrl;
  }
}

function buildGuestRouteUrl(socialBaseUrl = "", restaurantId = "") {
  return buildUrl(socialBaseUrl, {
    tab: "menu",
    src: "qr",
    r: restaurantId
  });
}

function buildProfileUrl(socialBaseUrl = "", handle = "") {
  return buildUrl(socialBaseUrl, {
    tab: "profile",
    handle
  });
}

function parseHandleFromUrl(url = "") {
  const safeUrl = asText(url);
  if (!safeUrl) return "";
  try {
    return asText(new URL(safeUrl).searchParams.get("handle"));
  } catch {
    return "";
  }
}

function buildRestaurantProfileUrl(socialBaseUrl = "", restaurantId = "", topTab = "profile") {
  return buildUrl(socialBaseUrl, {
    tab: topTab,
    r: restaurantId
  });
}

function buildChatRouteUrl(socialBaseUrl = "", targetUid = "") {
  return buildUrl(socialBaseUrl, {
    tab: "chat",
    chat: targetUid
  });
}

function createSyntheticIsolationKey() {
  return `heart-isolation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createPassword() {
  return `Heart!${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-6)}`;
}

function buildPersonaIdentity(personaKey = "", restaurant = {}) {
  const suffix = asText(restaurant.id || "global").slice(-6).toLowerCase();
  const slug = normalizeHandleValue(asText(restaurant.handle || restaurant.name || "mnyra")) || "mnyra";
  const code = {
    ceo: buildStableNumericCode(`${personaKey}:${asText(restaurant.id || restaurant.name || "global")}`, "90"),
    business: buildStableNumericCode(`${personaKey}:${asText(restaurant.id || restaurant.name || "global")}`, "91"),
    staff: buildStableNumericCode(`${personaKey}:${asText(restaurant.id || restaurant.name || "global")}`, "92"),
    user: buildStableNumericCode(`${personaKey}:${asText(restaurant.id || restaurant.name || "global")}`, "93")
  }[personaKey] || buildStableNumericCode(`${personaKey}:${asText(restaurant.id || restaurant.name || "global")}`, "93");
  const map = {
    ceo: {
      firstName: code,
      lastName: "",
      displayName: code,
      role: "ceo",
      roles: ["ceo"],
      handle: `u${code}`,
      email: `heart+ceo-${slug}-${suffix}@mnyra.test`
    },
    business: {
      firstName: code,
      lastName: "",
      displayName: code,
      role: "business",
      roles: ["owner", "staff"],
      handle: `u${code}`,
      email: `heart+business-${slug}-${suffix}@mnyra.test`
    },
    staff: {
      firstName: code,
      lastName: "",
      displayName: code,
      role: "staff",
      roles: ["staff"],
      handle: `u${code}`,
      email: `heart+staff-${slug}-${suffix}@mnyra.test`
    },
    user: {
      firstName: code,
      lastName: "",
      displayName: code,
      role: "user",
      roles: ["user"],
      handle: `u${code}`,
      email: `heart+user-${slug}-${suffix}@mnyra.test`
    }
  };
  return map[personaKey] || map.user;
}

function buildDefaultPackConfig({
  socialBaseUrl = "",
  waiterBaseUrl = "",
  guestRouteUrl = "",
  restaurantId = "",
  restaurantName = "",
  personas = {}
} = {}) {
  const businessHandle = asText(personas.business?.handle);
  const businessUid = asText(personas.business?.uid);
  const userHandle = asText(personas.user?.handle);
  const userUid = asText(personas.user?.uid);
  const businessProfileUrl = restaurantId
    ? buildRestaurantProfileUrl(socialBaseUrl, restaurantId, "profile")
    : "";
  const businessMenuUrl = restaurantId
    ? buildRestaurantProfileUrl(socialBaseUrl, restaurantId, "menu")
    : buildUrl(socialBaseUrl, { tab: "menu" });
  const businessFocusUrl = restaurantId
    ? buildRestaurantProfileUrl(socialBaseUrl, restaurantId, "focus")
    : buildUrl(socialBaseUrl, { tab: "focus" });
  const uploadUrl = buildUrl(socialBaseUrl, { tab: "upload" });
  const userTargetProfileUrl = userHandle ? buildProfileUrl(socialBaseUrl, userHandle) : "";
  const stableSocialTargetUrl = businessProfileUrl;
  return {
    actions: {
      social: {
        businessProfile: {
          url: businessProfileUrl,
          resultSelector: "[data-search-business]"
        },
        userTargetProfile: {
          url: userTargetProfileUrl,
          resultSelector: "[data-search-user]",
          query: asText(personas.user?.displayName, userHandle)
        },
        follow: {
          url: stableSocialTargetUrl,
          triggerSelector: "[data-public-profile-follow]",
          verifySelector: "[data-public-profile-follow] svg"
        },
        like: {
          url: buildUrl(socialBaseUrl, { tab: "feed" }),
          triggerSelector: "[data-feed-post-like], [data-post-like-btn], #postLikeBtn",
          countSelector: "[data-post-like-count], #postLikesBtn"
        },
        commentCreate: {
          url: buildUrl(socialBaseUrl, { tab: "feed" }),
          openComposerSelector: "[data-feed-post-comment]",
          inputSelector: "#postCommentInput",
          submitSelector: "#postCommentSend",
          verifySelector: "#postModalComments",
          verifyText: "TEST_RUN_<runId>_COMMENT_1"
        },
        postCreate: {
          url: uploadUrl,
          openSelector: "",
          fileInputSelector: "#uploadFileInput",
          filePath: "apps/mnyra-heart/assets/icon-192.png",
          inputSelector: "#uploadCaption",
          submitSelector: "#uploadPostBtn",
          verifyText: "TEST_RUN_<runId>_POST_1"
        }
      },
      business: {
        menu: {
          url: businessMenuUrl
        },
        focus: {
          url: businessFocusUrl
        },
        productCreate: {
          url: businessMenuUrl,
          openSelector: "[data-menu-add-food], [data-menu-add-drink], [data-menu-add-special], [data-menu-add]",
          nameSelector: "#menuItemName",
          saveSelector: "#menuModalSave",
          verifyText: "TEST_RUN_<runId>_PRODUCT_1"
        },
        productEdit: {
          url: businessMenuUrl,
          openSelector: "[data-menu-edit]",
          inputSelector: "#menuItemName",
          saveSelector: "#menuModalSave",
          verifyText: "TEST_RUN_<runId>_PRODUCT_EDIT"
        },
        productDelete: {
          url: businessMenuUrl,
          openSelector: "[data-menu-delete]",
          confirmSelector: "",
          removedSelector: "",
          removedText: "TEST_RUN_<runId>_PRODUCT_1"
        }
      },
      commerce: {
        cart: {
          url: guestRouteUrl,
          openSelector: "[data-menu-open]",
          triggerSelector: "#menuDetailAddToCartBtn",
          verifySelector: "[data-cart-checkout], [data-cart-qty]",
          removalSelector: "[data-cart-qty][data-cart-delta='-1']"
        },
        order: {
          url: guestRouteUrl,
          openSelector: "[data-cart-checkout='open']",
          triggerSelector: "[data-cart-checkout='submit']",
          successText: "Bestellung gesendet",
          successTexts: [
            "Bestellung gesendet",
            "Ihre Bestellung wird zubereitet und in Kuerze serviert."
          ],
          failureTexts: [
            "Bestellung konnte nicht gesendet werden."
          ]
        }
      },
      chat: {
        send: {
          url: buildUrl(socialBaseUrl, { tab: "chat" }),
          targetUid: businessUid,
          userTargetUid: userUid,
          threadUrl: businessUid ? buildChatRouteUrl(socialBaseUrl, businessUid) : "",
          userThreadUrl: userUid ? buildChatRouteUrl(socialBaseUrl, userUid) : "",
          targetProfileUrl: stableSocialTargetUrl,
          userTargetProfileUrl,
          composerSelector: "#chatMessageInput",
          sendSelector: "#chatSendBtn",
          threadViewSelector: "#chatThreadView",
          messagesSelector: "#chatMessages",
          threadListSelector: "#chatListView",
          openThreadSelector: "[data-chat-open-thread]",
          openTargetSelector: "[data-open-chat], #profileChatBtn, #chatBtn",
          verifyText: "TEST_RUN_<runId>_CHAT_1"
        }
      },
      discovery: {
        search: {
          url: buildUrl(socialBaseUrl, { tab: "search" }),
          inputSelector: "#searchInput",
          businessResultSelector: "[data-search-business]",
          profileReadySelector: "[data-public-profile-follow], [data-business-top-tab], [data-profile-top-tab]",
          query: asText(restaurantName, personas.business?.displayName, personas.business?.handle)
        },
        map: {
          url: buildUrl(socialBaseUrl, { tab: "map" }),
          inputSelector: "#mapSearchInput",
          businessResultSelector: "[data-search-business]",
          profileReadySelector: "[data-public-profile-follow], [data-business-top-tab], [data-profile-top-tab]",
          query: asText(restaurantName, personas.business?.displayName, personas.business?.handle)
        }
      },
      crm: {
        leadCreate: {
          url: buildUrl(socialBaseUrl, { tab: "leads" }),
          openSelector: "#newLeadBtn",
          nameSelector: "#leadBusinessName",
          emailSelector: "#leadEmail",
          saveSelector: "#leadModalSave, #leadInlineSaveBtn",
          verifyText: "TEST_RUN_<runId>_LEAD_1"
        },
        leadEdit: {
          url: buildUrl(socialBaseUrl, { tab: "leads" }),
          openSelector: "[data-lead-edit]",
          inputSelector: "#leadBusinessName",
          saveSelector: "#leadModalSave, #leadInlineSaveBtn",
          verifyText: "TEST_RUN_<runId>_LEAD_EDIT"
        }
      },
      guest: {
        qrMenu: {
          url: guestRouteUrl,
          menuVisibleSelector: "[data-menu-open], [data-cart-checkout], #menuDetailAddToCartBtn",
          productOpenSelector: "[data-menu-open]",
          addToCartSelector: "#menuDetailAddToCartBtn",
          cartVisibleSelector: "[data-cart-checkout], [data-cart-qty]",
          orderOpenSelector: "[data-cart-checkout='open']",
          orderTriggerSelector: "[data-cart-checkout='submit']",
          orderSuccessText: "Bestellung gesendet",
          orderSuccessTexts: [
            "Bestellung gesendet",
            "Ihre Bestellung wird zubereitet und in Kuerze serviert."
          ],
          orderFailureTexts: [
            "Bestellung konnte nicht gesendet werden."
          ],
          privilegedSelectors: [
            "[data-business-edit]",
            "[data-crm-create]"
          ]
        }
      },
      staff: {
        waiter: {
          url: asText(waiterBaseUrl),
          orderVisibleSelector: "main, [data-tab], [data-order-action], #logoutBtn",
          statusActionSelector: "[data-order-action='angenommen']"
        }
      },
      journey: {
        modalOpenSelector: "[data-feed-post-comment], [data-menu-open]",
        modalCloseSelector: "#postModalClose, #menuModalClose"
      }
    }
  };
}

function normalizeHeartPackConfig(packConfig = {}, {
  socialBaseUrl = "",
  waiterBaseUrl = "",
  guestRouteUrl = "",
  restaurantId = "",
  restaurantName = "",
  personas = {}
} = {}) {
  const defaults = buildDefaultPackConfig({
    socialBaseUrl,
    waiterBaseUrl,
    guestRouteUrl,
    restaurantId,
    restaurantName,
    personas
  });
  const next = mergeDeep(defaults, packConfig);
  next.actions = ensureObject(next.actions);
  next.actions.commerce = ensureObject(next.actions.commerce);
  next.actions.commerce.cart = ensureObject(next.actions.commerce.cart);
  next.actions.commerce.order = ensureObject(next.actions.commerce.order);
  next.actions.chat = ensureObject(next.actions.chat);
  next.actions.chat.send = ensureObject(next.actions.chat.send);
  next.actions.discovery = ensureObject(next.actions.discovery);
  next.actions.discovery.search = ensureObject(next.actions.discovery.search);
  next.actions.discovery.map = ensureObject(next.actions.discovery.map);
  next.actions.crm = ensureObject(next.actions.crm);
  next.actions.crm.leadCreate = ensureObject(next.actions.crm.leadCreate);
  next.actions.crm.leadEdit = ensureObject(next.actions.crm.leadEdit);
  next.actions.business = ensureObject(next.actions.business);
  next.actions.business.productCreate = ensureObject(next.actions.business.productCreate);
  next.actions.business.productEdit = ensureObject(next.actions.business.productEdit);
  next.actions.business.productDelete = ensureObject(next.actions.business.productDelete);
  next.actions.social = ensureObject(next.actions.social);
  next.actions.social.follow = ensureObject(next.actions.social.follow);
  next.actions.social.like = ensureObject(next.actions.social.like);
  next.actions.social.commentCreate = ensureObject(next.actions.social.commentCreate);
  next.actions.social.postCreate = ensureObject(next.actions.social.postCreate);
  next.actions.guest = ensureObject(next.actions.guest);
  next.actions.guest.qrMenu = ensureObject(next.actions.guest.qrMenu);
  next.actions.staff = ensureObject(next.actions.staff);
  next.actions.staff.waiter = ensureObject(next.actions.staff.waiter);
  next.actions.journey = ensureObject(next.actions.journey);

  const commerceCart = next.actions.commerce.cart;
  const commerceOrder = next.actions.commerce.order;
  const chatSend = next.actions.chat.send;
  const discoverySearch = next.actions.discovery.search;
  const discoveryMap = next.actions.discovery.map;
  const crmLeadCreate = next.actions.crm.leadCreate;
  const crmLeadEdit = next.actions.crm.leadEdit;
  const productCreate = next.actions.business.productCreate;
  const productEdit = next.actions.business.productEdit;
  const productDelete = next.actions.business.productDelete;
  const socialFollow = next.actions.social.follow;
  const socialLike = next.actions.social.like;
  const socialCommentCreate = next.actions.social.commentCreate;
  const socialPostCreate = next.actions.social.postCreate;
  const socialBusinessProfile = next.actions.social.businessProfile;
  const socialUserTargetProfile = next.actions.social.userTargetProfile;
  const guestQrMenu = next.actions.guest.qrMenu;
  const staffWaiter = next.actions.staff.waiter;
  const journey = next.actions.journey;
  const stableBusinessProfileUrl = restaurantId
    ? buildRestaurantProfileUrl(socialBaseUrl, restaurantId, "profile")
    : asText(next.actions.social?.businessProfile?.url);
  const stableBusinessMenuUrl = restaurantId
    ? buildRestaurantProfileUrl(socialBaseUrl, restaurantId, "menu")
    : buildUrl(socialBaseUrl, { tab: "menu" });
  const stableBusinessFocusUrl = restaurantId
    ? buildRestaurantProfileUrl(socialBaseUrl, restaurantId, "focus")
    : buildUrl(socialBaseUrl, { tab: "focus" });
  const stableUploadUrl = buildUrl(socialBaseUrl, { tab: "upload" });
  const stableBusinessChatUid = asText(personas.business?.uid);
  const stableUserChatUid = asText(personas.user?.uid);

  if (!asText(socialBusinessProfile?.url) && stableBusinessProfileUrl) {
    socialBusinessProfile.url = stableBusinessProfileUrl;
  }
  socialBusinessProfile.resultSelector = asText(socialBusinessProfile.resultSelector, "[data-search-business]");
  socialUserTargetProfile.resultSelector = asText(socialUserTargetProfile.resultSelector, "[data-search-user]");
  socialUserTargetProfile.query = asText(
    socialUserTargetProfile.query,
    personas.user?.displayName,
    personas.user?.handle
  );

  if (guestRouteUrl) {
    commerceCart.url = guestRouteUrl;
    commerceOrder.url = guestRouteUrl;
    guestQrMenu.url = guestRouteUrl;
  }

  commerceCart.openSelector = asText(commerceCart.openSelector, "[data-menu-open]");
  commerceCart.triggerSelector = asText(commerceCart.triggerSelector, "#menuDetailAddToCartBtn");
  commerceCart.verifySelector = asText(commerceCart.verifySelector, "[data-cart-checkout], [data-cart-qty]");
  if (!asText(commerceCart.removalSelector) || asText(commerceCart.removalSelector) === "[data-cart-remove]") {
    commerceCart.removalSelector = "[data-cart-qty][data-cart-delta='-1']";
  }

  if (!asText(commerceOrder.openSelector)) {
    commerceOrder.openSelector = "[data-cart-checkout='open']";
  }
  if (!asText(commerceOrder.triggerSelector) || asText(commerceOrder.triggerSelector) === "[data-submit-order]") {
    commerceOrder.triggerSelector = "[data-cart-checkout='submit']";
  }
  commerceOrder.successTexts = uniqueTextList(
    commerceOrder.successTexts,
    commerceOrder.successText,
    "Bestellung gesendet",
    "Ihre Bestellung wird zubereitet und in Kuerze serviert."
  );
  commerceOrder.successText = asText(commerceOrder.successText, commerceOrder.successTexts[0] || "Bestellung gesendet");
  commerceOrder.failureTexts = uniqueTextList(
    commerceOrder.failureTexts,
    commerceOrder.failureText,
    "Bestellung konnte nicht gesendet werden."
  );

  if (!asText(socialFollow.triggerSelector) || asText(socialFollow.triggerSelector) === "[data-follow-toggle]") {
    socialFollow.triggerSelector = "[data-public-profile-follow]";
  }
  if (!asText(socialFollow.verifySelector) || asText(socialFollow.verifySelector) === "[data-following='true']") {
    socialFollow.verifySelector = "[data-public-profile-follow] svg";
  }
  if (!asText(socialFollow.url)) {
    socialFollow.url = stableBusinessProfileUrl || asText(next.actions.social?.userTargetProfile?.url);
  }

  if (!asText(socialLike.url)) {
    socialLike.url = buildUrl(socialBaseUrl, { tab: "feed" });
  }
  if (!asText(socialLike.triggerSelector) || asText(socialLike.triggerSelector) === "[data-like-toggle]") {
    socialLike.triggerSelector = "[data-feed-post-like], [data-post-like-btn], #postLikeBtn";
  }
  if (!asText(socialLike.countSelector) || asText(socialLike.countSelector) === "[data-like-count]") {
    socialLike.countSelector = "[data-post-like-count], #postLikesBtn";
  }

  if (!asText(socialCommentCreate.url)) {
    socialCommentCreate.url = buildUrl(socialBaseUrl, { tab: "feed" });
  }
  if (!asText(socialCommentCreate.openComposerSelector) || asText(socialCommentCreate.openComposerSelector) === "[data-comment-open]") {
    socialCommentCreate.openComposerSelector = "[data-feed-post-comment]";
  }
  if (!asText(socialCommentCreate.inputSelector) || asText(socialCommentCreate.inputSelector) === "[data-comment-input]") {
    socialCommentCreate.inputSelector = "#postCommentInput";
  }
  if (!asText(socialCommentCreate.submitSelector) || asText(socialCommentCreate.submitSelector) === "[data-comment-submit]") {
    socialCommentCreate.submitSelector = "#postCommentSend";
  }
  socialCommentCreate.verifySelector = asText(socialCommentCreate.verifySelector, "#postModalComments");

  if (!asText(socialPostCreate.url)) {
    socialPostCreate.url = stableUploadUrl;
  }
  if (
    !asText(socialPostCreate.url)
    || asText(socialPostCreate.url) === buildUrl(socialBaseUrl, { tab: "feed" })
  ) {
    socialPostCreate.url = stableUploadUrl;
  }
  if (
    !asText(socialPostCreate.openSelector)
    || asText(socialPostCreate.openSelector) === "[data-post-open]"
    || asText(socialPostCreate.openSelector) === "[data-nav='upload'][data-upload-intent='feed'], [data-nav='upload'][data-upload-intent='chooser']"
  ) {
    socialPostCreate.openSelector = "";
  }
  if (!asText(socialPostCreate.fileInputSelector)) {
    socialPostCreate.fileInputSelector = "#uploadFileInput";
  }
  if (!asText(socialPostCreate.filePath)) {
    socialPostCreate.filePath = "apps/mnyra-heart/assets/icon-192.png";
  }
  if (!asText(socialPostCreate.inputSelector) || asText(socialPostCreate.inputSelector) === "[data-post-input]") {
    socialPostCreate.inputSelector = "#uploadCaption";
  }
  if (!asText(socialPostCreate.submitSelector) || asText(socialPostCreate.submitSelector) === "[data-post-submit]") {
    socialPostCreate.submitSelector = "#uploadPostBtn";
  }

  if (!asText(chatSend.url)) {
    chatSend.url = buildUrl(socialBaseUrl, { tab: "chat" });
  }
  if (!asText(chatSend.targetUid) && stableBusinessChatUid) {
    chatSend.targetUid = stableBusinessChatUid;
  }
  if (!asText(chatSend.userTargetUid) && stableUserChatUid) {
    chatSend.userTargetUid = stableUserChatUid;
  }
  if (!asText(chatSend.threadUrl) && asText(chatSend.targetUid)) {
    chatSend.threadUrl = buildChatRouteUrl(socialBaseUrl, chatSend.targetUid);
  }
  if (!asText(chatSend.userThreadUrl) && asText(chatSend.userTargetUid)) {
    chatSend.userThreadUrl = buildChatRouteUrl(socialBaseUrl, chatSend.userTargetUid);
  }
  if (!asText(chatSend.targetProfileUrl)) {
    chatSend.targetProfileUrl = asText(stableBusinessProfileUrl || socialBusinessProfile.url);
  }
  chatSend.userTargetProfileUrl = asText(chatSend.userTargetProfileUrl, socialUserTargetProfile.url);
  if (!asText(chatSend.composerSelector) || asText(chatSend.composerSelector) === "textarea") {
    chatSend.composerSelector = "#chatMessageInput";
  }
  if (!asText(chatSend.sendSelector) || asText(chatSend.sendSelector) === "[data-chat-send]") {
    chatSend.sendSelector = "#chatSendBtn";
  }
  chatSend.threadViewSelector = asText(chatSend.threadViewSelector, "#chatThreadView");
  chatSend.messagesSelector = asText(chatSend.messagesSelector, "#chatMessages");
  chatSend.threadListSelector = asText(chatSend.threadListSelector, "#chatListView");
  chatSend.openThreadSelector = asText(chatSend.openThreadSelector, "[data-chat-open-thread]");
  chatSend.openTargetSelector = asText(chatSend.openTargetSelector, "[data-open-chat], #profileChatBtn, #chatBtn");

  if (!asText(discoverySearch.url)) {
    discoverySearch.url = buildUrl(socialBaseUrl, { tab: "search" });
  }
  discoverySearch.inputSelector = asText(discoverySearch.inputSelector, "#searchInput");
  discoverySearch.businessResultSelector = asText(discoverySearch.businessResultSelector, "[data-search-business]");
  discoverySearch.profileReadySelector = asText(discoverySearch.profileReadySelector, "[data-public-profile-follow], [data-business-top-tab], [data-profile-top-tab]");
  discoverySearch.query = asText(discoverySearch.query, restaurantName, personas.business?.displayName, personas.business?.handle);

  if (!asText(discoveryMap.url)) {
    discoveryMap.url = buildUrl(socialBaseUrl, { tab: "map" });
  }
  discoveryMap.inputSelector = asText(discoveryMap.inputSelector, "#mapSearchInput");
  discoveryMap.businessResultSelector = asText(discoveryMap.businessResultSelector, "[data-search-business]");
  discoveryMap.profileReadySelector = asText(discoveryMap.profileReadySelector, "[data-public-profile-follow], [data-business-top-tab], [data-profile-top-tab]");
  discoveryMap.query = asText(discoveryMap.query, discoverySearch.query, restaurantName, personas.business?.displayName, personas.business?.handle);

  if (!asText(crmLeadCreate.openSelector) || asText(crmLeadCreate.openSelector) === "[data-lead-create-open]") {
    crmLeadCreate.openSelector = "#newLeadBtn";
  }
  if (!asText(crmLeadCreate.nameSelector) || asText(crmLeadCreate.nameSelector) === "[data-lead-name]") {
    crmLeadCreate.nameSelector = "#leadBusinessName";
  }
  if (!asText(crmLeadCreate.emailSelector) || asText(crmLeadCreate.emailSelector) === "[data-lead-email]") {
    crmLeadCreate.emailSelector = "#leadEmail";
  }
  if (
    !asText(crmLeadCreate.saveSelector)
    || asText(crmLeadCreate.saveSelector) === "[data-lead-save]"
    || asText(crmLeadCreate.saveSelector) === "#leadModalSave"
  ) {
    crmLeadCreate.saveSelector = "#leadModalSave, #leadInlineSaveBtn";
  }

  if (!asText(crmLeadEdit.openSelector) || asText(crmLeadEdit.openSelector) === "[data-lead-edit-open]") {
    crmLeadEdit.openSelector = "[data-lead-edit]";
  }
  if (!asText(crmLeadEdit.inputSelector) || asText(crmLeadEdit.inputSelector) === "[data-lead-name]") {
    crmLeadEdit.inputSelector = "#leadBusinessName";
  }
  if (
    !asText(crmLeadEdit.saveSelector)
    || asText(crmLeadEdit.saveSelector) === "[data-lead-save]"
    || asText(crmLeadEdit.saveSelector) === "#leadModalSave"
  ) {
    crmLeadEdit.saveSelector = "#leadModalSave, #leadInlineSaveBtn";
  }

  if (!asText(productCreate.openSelector) || asText(productCreate.openSelector) === "[data-product-create-open]") {
    productCreate.openSelector = "[data-menu-add-food], [data-menu-add-drink], [data-menu-add-special], [data-menu-add]";
  }
  if (!asText(next.actions.business.menu?.url) || asText(next.actions.business.menu.url) === buildUrl(socialBaseUrl, { tab: "menu" })) {
    next.actions.business.menu.url = stableBusinessMenuUrl;
  }
  if (!asText(next.actions.business.focus?.url) || asText(next.actions.business.focus.url) === buildUrl(socialBaseUrl, { tab: "focus" })) {
    next.actions.business.focus.url = stableBusinessFocusUrl;
  }
  if (!asText(productCreate.url) || asText(productCreate.url) === buildUrl(socialBaseUrl, { tab: "menu" })) {
    productCreate.url = stableBusinessMenuUrl;
  }
  if (!asText(productCreate.nameSelector) || asText(productCreate.nameSelector) === "[data-product-name-input]") {
    productCreate.nameSelector = "#menuItemName";
  }
  if (!asText(productCreate.saveSelector) || asText(productCreate.saveSelector) === "[data-product-save]") {
    productCreate.saveSelector = "#menuModalSave";
  }

  if (!asText(productEdit.openSelector) || asText(productEdit.openSelector) === "[data-product-edit-open]") {
    productEdit.openSelector = "[data-menu-edit]";
  }
  if (!asText(productEdit.url) || asText(productEdit.url) === buildUrl(socialBaseUrl, { tab: "menu" })) {
    productEdit.url = stableBusinessMenuUrl;
  }
  if (!asText(productEdit.inputSelector) || asText(productEdit.inputSelector) === "[data-product-name-input]") {
    productEdit.inputSelector = "#menuItemName";
  }
  if (!asText(productEdit.saveSelector) || asText(productEdit.saveSelector) === "[data-product-save]") {
    productEdit.saveSelector = "#menuModalSave";
  }

  if (!asText(productDelete.openSelector) || asText(productDelete.openSelector) === "[data-product-delete-open]") {
    productDelete.openSelector = "[data-menu-delete]";
  }
  if (!asText(productDelete.url) || asText(productDelete.url) === buildUrl(socialBaseUrl, { tab: "menu" })) {
    productDelete.url = stableBusinessMenuUrl;
  }
  if (!asText(productDelete.confirmSelector) || asText(productDelete.confirmSelector) === "[data-product-delete-confirm]") {
    productDelete.confirmSelector = "";
  }
  if (!asText(productDelete.removedSelector) || asText(productDelete.removedSelector) === "[data-product-row]") {
    productDelete.removedSelector = "";
  }

  if (!asText(guestQrMenu.menuVisibleSelector) || asText(guestQrMenu.menuVisibleSelector) === "[data-menu-grid]") {
    guestQrMenu.menuVisibleSelector = "[data-menu-open], [data-cart-checkout], #menuDetailAddToCartBtn";
  }
  guestQrMenu.productOpenSelector = asText(guestQrMenu.productOpenSelector || guestQrMenu.openSelector, "[data-menu-open]");
  guestQrMenu.addToCartSelector = asText(guestQrMenu.addToCartSelector, "#menuDetailAddToCartBtn");
  if (!asText(guestQrMenu.cartVisibleSelector) || asText(guestQrMenu.cartVisibleSelector) === "[data-cart-button]") {
    guestQrMenu.cartVisibleSelector = "[data-cart-checkout], [data-cart-qty]";
  }
  if (!asText(guestQrMenu.orderOpenSelector)) {
    guestQrMenu.orderOpenSelector = "[data-cart-checkout='open']";
  }
  if (!asText(guestQrMenu.orderTriggerSelector) || asText(guestQrMenu.orderTriggerSelector) === "[data-submit-order]") {
    guestQrMenu.orderTriggerSelector = "[data-cart-checkout='submit']";
  }
  guestQrMenu.orderSuccessTexts = uniqueTextList(
    guestQrMenu.orderSuccessTexts,
    guestQrMenu.orderSuccessText,
    "Bestellung gesendet",
    "Ihre Bestellung wird zubereitet und in Kuerze serviert."
  );
  guestQrMenu.orderSuccessText = asText(guestQrMenu.orderSuccessText, guestQrMenu.orderSuccessTexts[0] || "Bestellung gesendet");
  guestQrMenu.orderFailureTexts = uniqueTextList(
    guestQrMenu.orderFailureTexts,
    guestQrMenu.orderFailureText,
    "Bestellung konnte nicht gesendet werden."
  );

  if (!asText(staffWaiter.url)) {
    staffWaiter.url = asText(waiterBaseUrl);
  }
  if (!asText(staffWaiter.orderVisibleSelector) || asText(staffWaiter.orderVisibleSelector) === "[data-order-action]") {
    staffWaiter.orderVisibleSelector = "main, [data-tab], [data-order-action], #logoutBtn";
  }
  if (!asText(staffWaiter.statusActionSelector)) {
    staffWaiter.statusActionSelector = "[data-order-action='angenommen']";
  }

  if (!asText(journey.modalOpenSelector) || asText(journey.modalOpenSelector) === "[data-post-open]") {
    journey.modalOpenSelector = "[data-feed-post-comment], [data-menu-open]";
  }
  if (!asText(journey.modalCloseSelector) || asText(journey.modalCloseSelector) === "[data-modal-close]") {
    journey.modalCloseSelector = "#postModalClose, #menuModalClose";
  }

  return next;
}

function createUserProfilePayload({
  uid = "",
  email = "",
  firstName = "",
  lastName = "",
  displayName = "",
  handle = "",
  role = "user",
  roles = [],
  restaurantId = "",
  staffRestaurantId = "",
  waiterRestaurantId = "",
  businessAccess = false,
  waiterAccess = false
} = {}) {
  return {
    uid: asText(uid),
    email: asText(email),
    displayName: asText(displayName),
    name: asText(displayName),
    firstName: asText(firstName),
    lastName: asText(lastName),
    handle: asText(handle),
    role: asText(role),
    roles: Array.isArray(roles) ? roles.slice() : [],
    restaurantId: asText(restaurantId),
    staffRestaurantId: asText(staffRestaurantId),
    waiterRestaurantId: asText(waiterRestaurantId),
    businessAccess: businessAccess === true,
    waiterAccess: waiterAccess === true,
    permissions: {
      businessAccess: businessAccess === true,
      waiterAccess: waiterAccess === true
    },
    staffActive: true,
    staffStatus: "active",
    updatedAt: new Date().toISOString()
  };
}

async function upsertAuthUser({ email = "", password = "", displayName = "" } = {}) {
  const safeEmail = asText(email).toLowerCase();
  if (!safeEmail || !password) throw new Error("Email/Passwort fuer Heart-Testkonto fehlt.");
  try {
    const existing = await admin.auth().getUserByEmail(safeEmail);
    await admin.auth().updateUser(existing.uid, {
      password,
      displayName: asText(displayName) || undefined
    });
    return existing.uid;
  } catch (error) {
    if (String(error?.code || "").trim() !== "auth/user-not-found") throw error;
  }
  const created = await admin.auth().createUser({
    email: safeEmail,
    password,
    displayName: asText(displayName) || undefined,
    emailVerified: true
  });
  return asText(created.uid);
}

function sanitizeRestaurantDoc(docSnap = {}, socialBaseUrl = "") {
  const data = serializeFirestoreValue(docSnap.data ? docSnap.data() : docSnap) || {};
  const id = asText(docSnap.id || data.id);
  const name = asText(data.name || data.restaurantName || "Restaurant");
  const handle = normalizeHandleValue(data.handle || name);
  return {
    id,
    name,
    handle,
    ownerEmail: asText(data.ownerEmail),
    city: asText(data.city),
    guestRouteUrl: buildGuestRouteUrl(socialBaseUrl, id)
  };
}

async function searchRestaurants(db, query = "", { socialBaseUrl = "", limit = 12 } = {}) {
  const rawQuery = asText(query);
  const safeQuery = rawQuery.toLowerCase();
  if (!safeQuery) return [];
  const exactSnap = await db.collection("restaurants").doc(rawQuery).get().catch(() => null);
  const exact = exactSnap?.exists ? [sanitizeRestaurantDoc(exactSnap, socialBaseUrl)] : [];
  const snap = await db.collection("restaurants").limit(80).get();
  const filtered = snap.docs
    .map((docSnap) => sanitizeRestaurantDoc(docSnap, socialBaseUrl))
    .filter((item) => {
      const haystack = [
        item.id,
        item.name,
        item.handle,
        item.ownerEmail,
        item.city
      ].join(" ").toLowerCase();
      return haystack.includes(safeQuery);
    });
  const deduped = new Map();
  [...exact, ...filtered].forEach((item) => {
    if (!item.id) return;
    deduped.set(item.id, item);
  });
  return Array.from(deduped.values()).slice(0, Math.max(1, limit));
}

async function provisionHeartAccounts({
  db,
  setup = {},
  restaurant = {},
  personas = HEART_PERSONA_KEYS
} = {}) {
  const nextSetup = mergeDeep(setup, {});
  nextSetup.personas = ensureObject(nextSetup.personas);
  nextSetup.managed = ensureObject(nextSetup.managed);
  nextSetup.managed.createdPersonaKeys = Array.isArray(nextSetup.managed.createdPersonaKeys)
    ? nextSetup.managed.createdPersonaKeys.slice()
    : [];

  for (const personaKey of personas) {
    if (!HEART_PERSONA_KEYS.includes(personaKey)) continue;
    const identity = buildPersonaIdentity(personaKey, restaurant);
    const password = createPassword();
    const uid = await upsertAuthUser({
      email: identity.email,
      password,
      displayName: identity.displayName
    });

    if (personaKey === "ceo") {
      const ceoPayload = {
        uid,
        userId: uid,
        name: identity.displayName,
        displayName: identity.displayName,
        firstName: identity.firstName,
        lastName: identity.lastName,
        email: identity.email,
        handle: identity.handle,
        role: "ceo",
        roles: ["ceo"],
        status: "active",
        updatedAt: new Date().toISOString()
      };
      await db.collection("superadmins").doc(uid).set(ceoPayload, { merge: true });
      await db.collection("users").doc(uid).set({
        ...createUserProfilePayload({
          uid,
          email: identity.email,
          firstName: identity.firstName,
          lastName: identity.lastName,
          displayName: identity.displayName,
          handle: identity.handle,
          role: "ceo",
          roles: ["ceo"],
          staffRestaurantId: "",
          waiterRestaurantId: ""
        }),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else if (personaKey === "business" || personaKey === "staff") {
      const businessAccess = personaKey === "business";
      const waiterAccess = personaKey === "staff";
      const staffRoles = personaKey === "business" ? ["owner", "staff"] : ["staff"];
      const userRoles = personaKey === "business" ? ["owner", "business"] : ["staff"];
      await db.collection("restaurants").doc(asText(restaurant.id)).collection("staff").doc(uid).set({
        uid,
        userId: uid,
        restaurantId: asText(restaurant.id),
        restaurantName: asText(restaurant.name),
        firstName: identity.firstName,
        lastName: identity.lastName,
        name: identity.displayName,
        email: identity.email,
        role: personaKey === "business" ? "owner" : "waiter",
        roles: staffRoles,
        businessAccess,
        waiterAccess,
        permissions: {
          businessAccess,
          waiterAccess
        },
        active: true,
        status: "active",
        updatedAt: new Date().toISOString()
      }, { merge: true });
      await db.collection("staffIndex").doc(uid).set({
        uid,
        restaurantIds: admin.firestore.FieldValue.arrayUnion(asText(restaurant.id)),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      await db.collection("users").doc(uid).set({
        ...createUserProfilePayload({
          uid,
          email: identity.email,
          firstName: identity.firstName,
          lastName: identity.lastName,
          displayName: identity.displayName,
          handle: identity.handle,
          role: personaKey === "business" ? "business" : "staff",
          roles: userRoles,
          restaurantId: asText(restaurant.id),
          staffRestaurantId: personaKey === "staff" ? asText(restaurant.id) : "",
          waiterRestaurantId: waiterAccess ? asText(restaurant.id) : "",
          businessAccess,
          waiterAccess
        }),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      await db.collection("users").doc(uid).set({
        ...createUserProfilePayload({
          uid,
          email: identity.email,
          firstName: identity.firstName,
          lastName: identity.lastName,
          displayName: identity.displayName,
          handle: identity.handle,
          role: "user",
          roles: ["user"],
          staffRestaurantId: "",
          waiterRestaurantId: ""
        }),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    nextSetup.personas[personaKey] = {
      key: personaKey,
      uid,
      email: identity.email,
      password,
      handle: identity.handle,
      displayName: identity.displayName,
      role: identity.role,
      restaurantId: personaKey === "business" ? asText(restaurant.id) : "",
      managed: true,
      ready: true,
      updatedAt: new Date().toISOString()
    };
    if (!nextSetup.managed.createdPersonaKeys.includes(personaKey)) {
      nextSetup.managed.createdPersonaKeys.push(personaKey);
    }
  }

  return nextSetup;
}

async function reconcileHeartAccounts({
  db,
  setup = {},
  restaurant = {}
} = {}) {
  const nextSetup = mergeDeep(setup, {});
  nextSetup.personas = ensureObject(nextSetup.personas);
  const restaurantId = asText(restaurant.id || setup.restaurantId);
  const restaurantName = asText(restaurant.name || setup.restaurantName);

  for (const personaKey of HEART_PERSONA_KEYS) {
    const persona = ensureObject(nextSetup.personas[personaKey]);
    const uid = asText(persona.uid);
    if (!uid) continue;

    const identity = buildPersonaIdentity(personaKey, restaurant);
    const displayName = asText(persona.displayName, identity.displayName);
    const email = asText(persona.email, identity.email);
    const handle = asText(persona.handle, identity.handle);
    const updatedAt = new Date().toISOString();

    if (personaKey === "ceo") {
      await db.collection("superadmins").doc(uid).set({
        uid,
        userId: uid,
        name: displayName,
        displayName,
        firstName: displayName,
        lastName: "",
        email,
        handle,
        role: "ceo",
        roles: ["ceo"],
        status: "active",
        updatedAt
      }, { merge: true });
      await db.collection("users").doc(uid).set({
        ...createUserProfilePayload({
          uid,
          email,
          firstName: displayName,
          lastName: "",
          displayName,
          handle,
          role: "ceo",
          roles: ["ceo"],
          restaurantId: "",
          staffRestaurantId: "",
          waiterRestaurantId: "",
          businessAccess: false,
          waiterAccess: false
        }),
        businessOwnerUid: "",
        updatedAt
      }, { merge: true });
      nextSetup.personas[personaKey] = {
        ...persona,
        uid,
        email,
        handle,
        displayName,
        role: "ceo",
        managed: true,
        ready: !!email && !!asText(persona.password),
        updatedAt
      };
      continue;
    }

    if (personaKey === "business") {
      await db.collection("restaurants").doc(restaurantId).collection("staff").doc(uid).set({
        uid,
        userId: uid,
        restaurantId,
        restaurantName,
        firstName: displayName,
        lastName: "",
        name: displayName,
        email,
        role: "owner",
        roles: ["owner", "staff"],
        businessAccess: true,
        waiterAccess: false,
        permissions: {
          businessAccess: true,
          waiterAccess: false
        },
        active: true,
        status: "active",
        updatedAt
      }, { merge: true });
      await db.collection("users").doc(uid).set({
        ...createUserProfilePayload({
          uid,
          email,
          firstName: displayName,
          lastName: "",
          displayName,
          handle,
          role: "business",
          roles: ["owner", "business"],
          restaurantId,
          staffRestaurantId: "",
          waiterRestaurantId: "",
          businessAccess: true,
          waiterAccess: false
        }),
        businessOwnerUid: "",
        updatedAt
      }, { merge: true });
      nextSetup.personas[personaKey] = {
        ...persona,
        uid,
        email,
        handle,
        displayName,
        role: "business",
        restaurantId,
        managed: true,
        ready: !!email && !!asText(persona.password),
        updatedAt
      };
      continue;
    }

    await db.collection("users").doc(uid).set({
      ...createUserProfilePayload({
        uid,
        email,
        firstName: displayName,
        lastName: "",
        displayName,
        handle,
        role: "user",
        roles: ["user"],
        restaurantId: "",
        staffRestaurantId: "",
        waiterRestaurantId: "",
        businessAccess: false,
        waiterAccess: false
      }),
      businessOwnerUid: "",
      updatedAt
    }, { merge: true });
    nextSetup.personas[personaKey] = {
      ...persona,
      uid,
      email,
      handle,
      displayName,
      role: "user",
      restaurantId: "",
      managed: true,
      ready: !!email && !!asText(persona.password),
      updatedAt
    };
  }

  return nextSetup;
}

async function deleteProvisionedPersona({
  db,
  setup = {},
  personaKey = "",
  restaurantId = ""
} = {}) {
  const safePersonaKey = asText(personaKey);
  const persona = ensureObject(setup?.personas?.[safePersonaKey]);
  const uid = asText(persona.uid);
  if (uid) {
    await db.collection("users").doc(uid).delete().catch(() => undefined);
    await db.collection("superadmins").doc(uid).delete().catch(() => undefined);
    if (restaurantId) {
      await db.collection("restaurants").doc(restaurantId).collection("staff").doc(uid).delete().catch(() => undefined);
    }
    await db.collection("staffIndex").doc(uid).delete().catch(() => undefined);
    await admin.auth().deleteUser(uid).catch(() => undefined);
  }
  const nextSetup = mergeDeep(setup, {});
  nextSetup.personas = ensureObject(nextSetup.personas);
  delete nextSetup.personas[safePersonaKey];
  nextSetup.managed = ensureObject(nextSetup.managed);
  nextSetup.managed.createdPersonaKeys = (Array.isArray(nextSetup.managed.createdPersonaKeys)
    ? nextSetup.managed.createdPersonaKeys
    : []).filter((item) => item !== safePersonaKey);
  return nextSetup;
}

function buildRunnerEnvPayload({
  setup = {},
  socialBaseUrl = "",
  waiterBaseUrl = ""
} = {}) {
  const guestRouteUrl = asText(setup.guestRouteUrl);
  const packConfig = normalizeHeartPackConfig(ensureObject(setup.packConfig), {
    socialBaseUrl,
    waiterBaseUrl,
    guestRouteUrl,
    restaurantId: asText(setup.restaurantId),
    restaurantName: asText(setup.restaurantName),
    personas: ensureObject(setup.personas)
  });
  return {
    MNYRA_SOCIAL_BASE_URL: asText(socialBaseUrl),
    MNYRA_WAITER_BASE_URL: asText(waiterBaseUrl),
    MNYRA_CEO_EMAIL: asText(setup.personas?.ceo?.email),
    MNYRA_CEO_PASSWORD: asText(setup.personas?.ceo?.password),
    MNYRA_BUSINESS_EMAIL: asText(setup.personas?.business?.email),
    MNYRA_BUSINESS_PASSWORD: asText(setup.personas?.business?.password),
    MNYRA_STAFF_EMAIL: asText(setup.personas?.staff?.email),
    MNYRA_STAFF_PASSWORD: asText(setup.personas?.staff?.password),
    MNYRA_USER_EMAIL: asText(setup.personas?.user?.email),
    MNYRA_USER_PASSWORD: asText(setup.personas?.user?.password),
    MNYRA_GUEST_QR_URL: guestRouteUrl,
    MNYRA_ALLOW_LIVE_MUTATIONS: setup.allowLiveMutations !== false ? "true" : "false",
    MNYRA_SYNTHETIC_ISOLATION_KEY: asText(setup.syntheticIsolationKey),
    MNYRA_HEART_PACK_CONFIG_JSON: JSON.stringify({
      ...ensureObject(packConfig),
      personas: ensureObject(setup.personas)
    }),
    MNYRA_BUSINESS_BASE_URL: asText(socialBaseUrl),
    MNYRA_USER_BASE_URL: asText(socialBaseUrl),
    MNYRA_STAFF_BASE_URL: asText(waiterBaseUrl)
  };
}

function deriveSetupPatch({
  setup = {},
  patch = {},
  socialBaseUrl = "",
  waiterBaseUrl = ""
} = {}) {
  const merged = mergeDeep(setup, patch);
  const restaurantId = asText(merged.restaurantId);
  const nextGuestRouteUrl = asText(
    merged.guestRouteUrl,
    restaurantId ? buildGuestRouteUrl(socialBaseUrl, restaurantId) : ""
  );
  const nextSyntheticIsolationKey = asText(merged.syntheticIsolationKey || createSyntheticIsolationKey());
  const nextPackConfig = normalizeHeartPackConfig(ensureObject(merged.packConfig), {
    socialBaseUrl,
    waiterBaseUrl,
    guestRouteUrl: nextGuestRouteUrl,
    restaurantId,
    restaurantName: asText(merged.restaurantName),
    personas: ensureObject(merged.personas)
  });
  return {
    ...merged,
    allowLiveMutations: merged.allowLiveMutations !== false,
    guestRouteUrl: nextGuestRouteUrl,
    syntheticIsolationKey: nextSyntheticIsolationKey,
    packConfig: nextPackConfig
  };
}

module.exports = {
  HEART_PERSONA_KEYS,
  buildGuestRouteUrl,
  searchRestaurants,
  provisionHeartAccounts,
  reconcileHeartAccounts,
  deleteProvisionedPersona,
  buildRunnerEnvPayload,
  deriveSetupPatch
};
