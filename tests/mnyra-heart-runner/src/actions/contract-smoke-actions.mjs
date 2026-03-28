import {
  buildUrl,
  clickFirstVisible,
  ensureElementVisible,
  fillIfPresent,
  openPageAndWait,
  readCountValue,
  waitForAnySelector,
  waitForText
} from "../helpers/social-app.mjs";
import {
  assertContractSeedPaths,
  diffDocumentIds,
  getContractFixture,
  getDocumentByPath,
  listDocumentsByPath,
  waitForContractCondition
} from "../helpers/contract-firestore.mjs";
import { ensureCartReady, submitOrder } from "./commerce-actions.mjs";
import { markGuarded, markNotConfigured, replaceRunTokens } from "./common-actions.mjs";
import { runLikeAction } from "./social-actions.mjs";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function uniqueList(...values) {
  const seen = new Set();
  return values
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map((value) => asText(value))
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function ensureWritableContractMode(env, heart, moduleKey, actionLabel, personaKey) {
  if (!env?.useEmulators) {
    markNotConfigured(
      heart,
      moduleKey,
      `${actionLabel} braucht Firestore Emulator und die lokale Testwelt.`,
      { action: actionLabel, persona: personaKey, area: moduleKey }
    );
    return false;
  }
  if (!env?.allowLiveMutations || !env?.syntheticIsolationKey) {
    markGuarded(
      heart,
      moduleKey,
      `${actionLabel} ist geschuetzt. Aktiviere erst isolierte Mutationen auf der Testwelt.`,
      { action: actionLabel, persona: personaKey, area: moduleKey }
    );
    return false;
  }
  return true;
}

async function waitForCountIncrease(page, selector, previousValue, label) {
  if (previousValue === null || previousValue === undefined) {
    await ensureElementVisible(page, selector, 15000);
    return readCountValue(page, selector);
  }
  return waitForContractCondition(
    async () => {
      const nextValue = await readCountValue(page, selector);
      return nextValue !== null && nextValue > previousValue ? nextValue : false;
    },
    {
      timeoutMs: 20000,
      intervalMs: 250,
      errorMessage: `${label} wurde im DOM nicht erhoeht.`
    }
  );
}

function resolveSocialContractTargets(env, fixture = {}) {
  const contractConfig = env?.packConfig?.contract?.social || {};
  const alphaRestaurantId = asText(contractConfig.restaurantId, fixture?.restaurants?.alpha?.id);
  const defaultPost = Array.isArray(fixture?.posts)
    ? fixture.posts.find((post) => post.restaurantId === alphaRestaurantId && Number(post.likesCount || 0) === 0 && Number(post.commentsCount || 0) === 0)
    : null;
  const postId = asText(contractConfig.postId, defaultPost?.id);
  return {
    restaurantId: alphaRestaurantId,
    postId,
    feedUrl: asText(env?.packConfig?.actions?.social?.like?.url, buildUrl(env?.socialBaseUrl, { tab: "feed" })),
    likeSelector: asText(env?.packConfig?.actions?.social?.like?.triggerSelector, `[data-feed-post-like="${postId}"]`),
    likeCountSelector: asText(env?.packConfig?.actions?.social?.like?.countSelector, `[data-post-like-count="${postId}"]`),
    commentOpenSelector: asText(env?.packConfig?.actions?.social?.commentCreate?.openComposerSelector, `[data-feed-post-comment="${postId}"]`),
    commentCountSelector: asText(env?.packConfig?.actions?.social?.commentCreate?.countSelector, `[data-post-comment-count="${postId}"]`),
    commentInputSelector: asText(env?.packConfig?.actions?.social?.commentCreate?.inputSelector, "#postCommentInput"),
    commentSubmitSelector: asText(env?.packConfig?.actions?.social?.commentCreate?.submitSelector, "#postCommentSend"),
    commentVerifySelector: asText(env?.packConfig?.actions?.social?.commentCreate?.verifySelector, "#postModalComments"),
    commentText: replaceRunTokens(
      asText(
        env?.packConfig?.actions?.social?.commentCreate?.messageTemplate,
        "TEST_RUN_<runId>_COMMENT_1"
      ),
      env
    )
  };
}

function resolveNotificationContractTargets(env, fixture = {}) {
  const businessNotifications = Array.isArray(fixture?.notifications?.business) ? fixture.notifications.business : [];
  const defaultNotification = businessNotifications.find((item) => item.type === "comment") || businessNotifications[0] || {};
  const defaultComment = Array.isArray(fixture?.postInteractions?.comments) ? fixture.postInteractions.comments[0] : {};
  const notificationConfig = env?.packConfig?.contract?.notifications || {};
  const notificationId = asText(notificationConfig.targetNotificationId, defaultNotification.id);
  const expectedPostId = asText(notificationConfig.expectedPostId, defaultNotification.postId);
  return {
    notificationId,
    notificationUrl: asText(notificationConfig.url, buildUrl(env?.socialBaseUrl, { tab: "notifications" })),
    openSelector: asText(notificationConfig.openSelector, `[data-notif-open="${notificationId}"]`),
    listSelector: asText(notificationConfig.listSelector, "#notificationsList"),
    viewSelector: asText(notificationConfig.viewSelector, "#notificationsView"),
    expectedPostId,
    expectedCommentText: asText(notificationConfig.expectedCommentText, defaultComment.text),
    modalCommentSelector: asText(notificationConfig.modalCommentSelector, "#postModalComments"),
    modalPostSelector: asText(notificationConfig.modalPostSelector, `#postCommentSend[data-post-id="${expectedPostId}"]`)
  };
}

function resolveCommerceContractTargets(env, fixture = {}, persona = {}) {
  const guestSeed = fixture?.guest || {};
  const commerceConfig = env?.packConfig?.contract?.commerce || {};
  const restaurantId = asText(commerceConfig.restaurantId, guestSeed.restaurantId, fixture?.restaurants?.alpha?.id);
  const expectedTableNumber = toNumber(
    commerceConfig.expectedTableNumber,
    toNumber(guestSeed.tableNumber, 0)
  );
  const guestUrl = asText(
    persona?.guestRouteUrl,
    env?.packConfig?.actions?.guest?.qrMenu?.url,
    env?.packConfig?.actions?.commerce?.cart?.url
  );
  return {
    restaurantId,
    expectedTableNumber,
    guestUrl
  };
}

export async function runLikesCommentsContractSmoke({ page, env, heart, persona } = {}) {
  if (!ensureWritableContractMode(env, heart, "feed", "Likes / Comments Contract Smoke", persona?.key)) {
    return;
  }

  const fixture = await getContractFixture(env);
  const target = resolveSocialContractTargets(env, fixture);
  if (!target.restaurantId || !target.postId) {
    markNotConfigured(heart, "feed", "Likes / Comments Contract Smoke braucht Seed-Post und Restaurant-Ziel.", {
      action: "contract likes/comments",
      persona: persona?.key,
      area: "feed"
    });
    return;
  }

  const restaurantPostPath = `restaurants/${target.restaurantId}/socialPosts/${target.postId}`;
  const socialFeedPath = `socialFeed/${target.postId}`;
  const likeDocPath = `${restaurantPostPath}/likes/${fixture.personas.user.uid}`;
  const commentsCollectionPath = `${restaurantPostPath}/comments`;
  const businessNotificationsPath = `users/${fixture.personas.business.uid}/notifications`;

  await assertContractSeedPaths(env, [
    `users/${fixture.personas.user.uid}`,
    `users/${fixture.personas.business.uid}`,
    restaurantPostPath,
    socialFeedPath
  ]);

  const restaurantPostBefore = await getDocumentByPath(env, restaurantPostPath);
  const socialFeedBefore = await getDocumentByPath(env, socialFeedPath);
  const businessNotificationsBefore = await listDocumentsByPath(env, businessNotificationsPath);
  const likeCountBeforeModel = toNumber(restaurantPostBefore?.fields?.likesCount, 0);
  const commentCountBeforeModel = toNumber(restaurantPostBefore?.fields?.commentsCount, 0);

  await openPageAndWait(page, target.feedUrl, "body", heart, {
    title: `${persona.label} / Contract likes comments`,
    moduleKey: "feed",
    area: "feed",
    persona: persona.key
  });

  await ensureElementVisible(page, target.likeSelector, 20000);
  const likeCountBeforeDom = await readCountValue(page, target.likeCountSelector);
  await runLikeAction(page, target.likeSelector);
  const likeCountAfterDom = await waitForCountIncrease(page, target.likeCountSelector, likeCountBeforeDom, "Like-Count");

  const likeDoc = await waitForContractCondition(
    async () => await getDocumentByPath(env, likeDocPath),
    {
      timeoutMs: 15000,
      errorMessage: `Like-Dokument ${likeDocPath} wurde nicht angelegt.`
    }
  );

  await clickFirstVisible(page, [target.commentOpenSelector], 10000);
  await ensureElementVisible(page, target.commentInputSelector, 15000);
  const commentCountBeforeDom = await readCountValue(page, target.commentCountSelector);
  const commentFilled = await fillIfPresent(page, target.commentInputSelector, target.commentText, 10000);
  if (!commentFilled) {
    throw new Error("Contract smoke konnte das Kommentarfeld nicht befuellen.");
  }
  const clickedSubmit = await clickFirstVisible(page, [target.commentSubmitSelector], 10000);
  if (!clickedSubmit) {
    throw new Error("Contract smoke konnte den Kommentar nicht absenden.");
  }
  await ensureElementVisible(page, target.commentVerifySelector, 20000);
  await waitForText(page, target.commentText, 20000);
  const commentCountAfterDom = await waitForCountIncrease(page, target.commentCountSelector, commentCountBeforeDom, "Kommentar-Count");

  const commentDoc = await waitForContractCondition(
    async () => {
      const comments = await listDocumentsByPath(env, commentsCollectionPath);
      return comments.find((entry) => asText(entry?.fields?.text) === target.commentText) || false;
    },
    {
      timeoutMs: 20000,
      errorMessage: "Der neue Kommentar ist im Datenmodell nicht sichtbar."
    }
  );

  const modelParity = await waitForContractCondition(
    async () => {
      const restaurantPost = await getDocumentByPath(env, restaurantPostPath);
      const socialFeed = await getDocumentByPath(env, socialFeedPath);
      if (!restaurantPost || !socialFeed) return false;
      const restaurantLikeCount = toNumber(restaurantPost.fields?.likesCount, -1);
      const restaurantCommentCount = toNumber(restaurantPost.fields?.commentsCount, -1);
      const feedLikeCount = toNumber(socialFeed.fields?.likesCount, -1);
      const feedCommentCount = toNumber(socialFeed.fields?.commentsCount, -1);
      if (restaurantLikeCount < likeCountBeforeModel + 1) return false;
      if (restaurantCommentCount < commentCountBeforeModel + 1) return false;
      if (feedLikeCount < toNumber(socialFeedBefore?.fields?.likesCount, 0) + 1) return false;
      if (feedCommentCount < toNumber(socialFeedBefore?.fields?.commentsCount, 0) + 1) return false;
      return {
        restaurantLikeCount,
        restaurantCommentCount,
        feedLikeCount,
        feedCommentCount
      };
    },
    {
      timeoutMs: 20000,
      errorMessage: "Like-/Kommentar-Counts wurden nicht konsistent auf Post und Feed gespiegelt."
    }
  );

  const createdNotification = await waitForContractCondition(
    async () => {
      const notifications = await listDocumentsByPath(env, businessNotificationsPath);
      const newNotifications = diffDocumentIds(businessNotificationsBefore, notifications);
      return newNotifications.find((entry) =>
        asText(entry?.fields?.type) === "comment"
        && asText(entry?.fields?.postId) === target.postId
        && asText(entry?.fields?.userUid) === fixture.personas.user.uid
      ) || false;
    },
    {
      timeoutMs: 20000,
      errorMessage: "Die Business-Comment-Notification wurde nach dem Kommentar nicht angelegt."
    }
  );

  heart.addCreatedEntity({
    id: commentDoc.id,
    type: "comment",
    label: target.commentText,
    status: "success",
    summary: "Contract-Smoke-Kommentar wurde angelegt.",
    cleanupStatus: "pending",
    module: "feed",
    persona: persona.key
  });

  heart.passModule("feed", "Likes / Comments Contract Smoke hat DOM- und Firestore-Paritaet bestaetigt.", {
    action: "contract likes/comments",
    persona: persona.key,
    area: "feed",
    meta: {
      postId: target.postId,
      likeDocId: likeDoc.id,
      commentId: commentDoc.id,
      notificationId: createdNotification.id,
      likeCountAfterDom,
      commentCountAfterDom,
      modelParity
    }
  });
}

export async function runNotificationsContractSmoke({ page, env, heart, persona } = {}) {
  if (!ensureWritableContractMode(env, heart, "notifications", "Notifications Contract Smoke", persona?.key)) {
    return;
  }

  const fixture = await getContractFixture(env);
  const target = resolveNotificationContractTargets(env, fixture);
  const notificationPath = `users/${fixture.personas.business.uid}/notifications/${target.notificationId}`;

  await assertContractSeedPaths(env, [
    `users/${fixture.personas.business.uid}`,
    notificationPath,
    `restaurants/${fixture.restaurants.alpha.id}/socialPosts/${target.expectedPostId}`,
    `socialFeed/${target.expectedPostId}`
  ]);

  const notificationBefore = await getDocumentByPath(env, notificationPath);
  if (notificationBefore?.fields?.read === true) {
    throw new Error(
      `Notification-Seed ${target.notificationId} ist bereits als gelesen markiert. Reset/Seed vor dem Contract-Lauf erneut ausfuehren.`
    );
  }

  await openPageAndWait(page, target.notificationUrl, target.viewSelector, heart, {
    title: `${persona.label} / Contract notifications`,
    moduleKey: "notifications",
    area: "notifications",
    persona: persona.key
  });

  await ensureElementVisible(page, target.listSelector, 15000);
  await ensureElementVisible(page, target.openSelector, 15000);
  const clickedNotification = await clickFirstVisible(page, [target.openSelector], 10000);
  if (!clickedNotification) {
    throw new Error("Contract smoke konnte die Ziel-Notification nicht oeffnen.");
  }

  await ensureElementVisible(page, target.modalPostSelector, 20000);
  await waitForAnySelector(page, uniqueList(target.modalCommentSelector, "#postModalHeroImage"), 20000);
  if (target.expectedCommentText) {
    await waitForText(page, target.expectedCommentText, 20000);
  }

  const notificationAfter = await waitForContractCondition(
    async () => {
      const doc = await getDocumentByPath(env, notificationPath);
      return doc?.fields?.read === true ? doc : false;
    },
    {
      timeoutMs: 15000,
      errorMessage: "Notification wurde im Datenmodell nach dem Oeffnen nicht als gelesen markiert."
    }
  );

  heart.passModule("notifications", "Notifications Contract Smoke hat Read-State und korrektes Post-Target bestaetigt.", {
    action: "contract notifications open",
    persona: persona.key,
    area: "notifications",
    meta: {
      notificationId: target.notificationId,
      postId: target.expectedPostId,
      read: !!notificationAfter.fields?.read
    }
  });
}

export async function runGuestCheckoutContractSmoke({ page, env, heart, persona } = {}) {
  if (!ensureWritableContractMode(env, heart, "orders", "Cart / Checkout Contract Smoke", persona?.key)) {
    return;
  }

  const fixture = await getContractFixture(env);
  const target = resolveCommerceContractTargets(env, fixture, persona);
  const cartConfig = env?.packConfig?.actions?.commerce?.cart || {};
  const orderConfig = env?.packConfig?.actions?.commerce?.order || {};
  const guestConfig = env?.packConfig?.actions?.guest?.qrMenu || {};
  const restaurantOrdersPath = `restaurants/${target.restaurantId}/orders`;
  const userOrdersPath = `users/${fixture.personas.user.uid}/orders`;

  if (!asText(target.guestUrl)) {
    markNotConfigured(heart, "orders", "Cart / Checkout Contract Smoke braucht einen QR-/Gast-Link auf das Seed-Restaurant.", {
      action: "contract checkout",
      persona: persona?.key,
      area: "orders"
    });
    return;
  }

  await assertContractSeedPaths(env, [
    `restaurants/${target.restaurantId}`,
    `users/${fixture.personas.user.uid}`
  ]);

  const restaurantOrdersBefore = await listDocumentsByPath(env, restaurantOrdersPath);
  const userOrdersBefore = await listDocumentsByPath(env, userOrdersPath);

  await openPageAndWait(page, target.guestUrl, "body", heart, {
    title: `${persona.label} / Contract guest checkout`,
    moduleKey: "cart",
    area: "cart",
    persona: persona.key
  });

  const cartOutcome = await ensureCartReady(page, {
    ...cartConfig,
    url: target.guestUrl
  }, guestConfig);
  heart.passModule("cart", "Cart Contract Smoke hat einen echten QR-Warenkorb aufgebaut.", {
    action: "contract cart add",
    persona: persona.key,
    area: "cart",
    meta: {
      usedExistingCart: !!cartOutcome?.usedExistingCart
    }
  });

  const orderOutcome = await submitOrder(page, {
    ...orderConfig,
    url: target.guestUrl
  }, guestConfig);

  const createdOrder = await waitForContractCondition(
    async () => {
      const restaurantOrdersAfter = await listDocumentsByPath(env, restaurantOrdersPath);
      const delta = diffDocumentIds(restaurantOrdersBefore, restaurantOrdersAfter);
      if (delta.length !== 1) return false;
      const orderDoc = await getDocumentByPath(env, `${restaurantOrdersPath}/${delta[0].id}`);
      if (!orderDoc) return false;
      const fields = orderDoc.fields || {};
      const items = Array.isArray(fields.items) ? fields.items : [];
      const itemShapeValid = items.length > 0 && items.every((item) =>
        asText(item?.id)
        && asText(item?.itemId)
        && asText(item?.cartKey)
        && toNumber(item?.quantity, 0) >= 1
      );
      const restaurantIdOk = asText(fields.restaurantId) === target.restaurantId;
      const buyerUidOk = asText(fields.buyerUid) === "";
      const tableNumberOk = toNumber(fields.tableNumber, 0) === target.expectedTableNumber;
      const serviceModeOk = asText(fields.serviceMode).toLowerCase() === "table";
      return restaurantIdOk && buyerUidOk && tableNumberOk && serviceModeOk && itemShapeValid
        ? { orderDoc, orderId: delta[0].id, items }
        : false;
    },
    {
      timeoutMs: 25000,
      errorMessage: "Die neue Gast-/QR-Bestellung ist nicht konsistent im Restaurant-Orders-Pfad angekommen."
    }
  );

  const userOrdersAfter = await listDocumentsByPath(env, userOrdersPath);
  if (userOrdersAfter.length !== userOrdersBefore.length) {
    throw new Error("Gast-/QR-Checkout hat unerwartet den User-Orders-Pfad veraendert.");
  }

  heart.addCreatedEntity({
    id: createdOrder.orderId,
    type: "order",
    label: createdOrder.orderId,
    status: "success",
    summary: "Contract-Smoke-Gastbestellung wurde angelegt.",
    cleanupStatus: "pending",
    module: "orders",
    persona: persona.key
  });

  heart.passModule("orders", "Cart / Checkout Contract Smoke hat Restaurant-Order, Table-Kontext und Guest-Scope bestaetigt.", {
    action: "contract checkout submit",
    persona: persona.key,
    area: "orders",
    meta: {
      orderId: createdOrder.orderId,
      successSignal: asText(orderOutcome?.match),
      tableNumber: target.expectedTableNumber,
      itemCount: createdOrder.items.length
    }
  });
}
