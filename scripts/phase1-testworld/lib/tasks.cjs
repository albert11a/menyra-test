"use strict";

const {
  buildPhase1TestWorldManifest,
  collectionPathFromDocPath,
  lastPathSegment
} = require("./manifest.cjs");

function uniqueSorted(values = []) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean))).sort();
}

function compareIdSets(expected = [], actual = []) {
  const expectedSorted = uniqueSorted(expected);
  const actualSorted = uniqueSorted(actual);
  const expectedSet = new Set(expectedSorted);
  const actualSet = new Set(actualSorted);
  return {
    missing: expectedSorted.filter((value) => !actualSet.has(value)),
    extra: actualSorted.filter((value) => !expectedSet.has(value))
  };
}

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function diffDocsById(expectedDocs = [], actualDocs = []) {
  const expectedIds = new Set((expectedDocs || []).map((entry) => asText(entry?.id)).filter(Boolean));
  return (actualDocs || []).filter((entry) => !expectedIds.has(asText(entry?.id)));
}

function isDirectChildDocPath(collectionPath = "", docPath = "") {
  const safeCollectionPath = asText(collectionPath);
  const safeDocPath = asText(docPath);
  if (!safeCollectionPath || !safeDocPath.startsWith(`${safeCollectionPath}/`)) {
    return false;
  }
  const remainder = safeDocPath.slice(safeCollectionPath.length + 1);
  return !!remainder && !remainder.includes("/");
}

function validateManagedDoc(data = {}, entry = {}, manifest = {}, errors = []) {
  if (data.managed !== true) {
    errors.push(`Document is not marked as managed: ${entry.path}`);
  }
  if (String(data.testWorldId || "") !== manifest.metadata.testWorldId) {
    errors.push(`Document testWorldId mismatch: ${entry.path}`);
  }
  if (String(data.seedVersion || "") !== manifest.metadata.seedVersion) {
    errors.push(`Document seedVersion mismatch: ${entry.path}`);
  }
}

async function verifyManifestDocs({ db, manifest, errors, verifiedDocPaths }) {
  for (const entry of manifest.docs) {
    const snap = await db.doc(entry.path).get();
    if (!snap.exists) {
      errors.push(`Missing document: ${entry.path}`);
      continue;
    }
    validateManagedDoc(snap.data() || {}, entry, manifest, errors);
    verifiedDocPaths.push(entry.path);
  }
}

async function verifyManifestAuthUsers({ auth, manifest, errors }) {
  for (const persona of manifest.authUsers) {
    try {
      const userRecord = await auth.getUser(String(persona.uid || ""));
      if (String(userRecord.email || "").toLowerCase() !== String(persona.email || "").toLowerCase()) {
        errors.push(`Auth email mismatch for uid ${persona.uid}`);
      }
    } catch (error) {
      errors.push(`Missing auth user: ${persona.uid}`);
    }
  }
}

function buildExpectedTopLevelByCollection(manifest) {
  const expectedTopLevelByCollection = new Map();
  for (const entry of manifest.docs) {
    const parts = String(entry.path || "").split("/").filter(Boolean);
    if (parts.length !== 2) continue;
    const collectionName = parts[0];
    const docId = parts[1];
    const current = expectedTopLevelByCollection.get(collectionName) || [];
    current.push(docId);
    expectedTopLevelByCollection.set(collectionName, current);
  }
  return expectedTopLevelByCollection;
}

async function verifyTopLevelCollections({ db, manifest, errors }) {
  const expectedTopLevelByCollection = buildExpectedTopLevelByCollection(manifest);
  for (const collectionName of manifest.managedTopLevelCollections || []) {
    const expectedIds = expectedTopLevelByCollection.get(collectionName) || [];
    const snap = await db.collection(collectionName)
      .where("testWorldId", "==", manifest.metadata.testWorldId)
      .get();
    const actualIds = snap.docs.map((docSnap) => docSnap.id);
    const diff = compareIdSets(expectedIds, actualIds);
    if (diff.missing.length || diff.extra.length) {
      errors.push(
        `Top-level collection mismatch for ${collectionName}: missing=[${diff.missing.join(", ")}] extra=[${diff.extra.join(", ")}]`
      );
    }
  }
}

function buildExpectedDocCountsByCollection(manifest) {
  const expectedDocCountsByCollection = {};
  for (const entry of manifest.docs) {
    const collectionPath = collectionPathFromDocPath(entry.path);
    expectedDocCountsByCollection[collectionPath] = (expectedDocCountsByCollection[collectionPath] || 0) + 1;
  }
  return expectedDocCountsByCollection;
}

async function collectCollectionDocs(db, collectionPath = "") {
  const snap = await db.collection(collectionPath).get();
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    path: docSnap.ref.path,
    fields: docSnap.data() || {}
  }));
}

function buildPhase1GateAllowances(fixture = {}) {
  const alphaRestaurantId = fixture?.restaurants?.alpha?.id;
  const userUid = fixture?.personas?.user?.uid;
  const businessUid = fixture?.personas?.business?.uid;
  const contractPost = Array.isArray(fixture?.posts)
    ? fixture.posts.find((post) => post.id === "mnyra-heart-seed-post-alpha-2")
    : null;
  const targetPostId = contractPost?.id || "mnyra-heart-seed-post-alpha-2";
  const commentCollectionPath = `restaurants/${alphaRestaurantId}/socialPosts/${targetPostId}/comments`;
  const ordersCollectionPath = `restaurants/${alphaRestaurantId}/orders`;
  const businessNotificationsPath = `users/${businessUid}/notifications`;
  return {
    alphaRestaurantId,
    userUid,
    businessUid,
    targetPostId,
    commentCollectionPath,
    ordersCollectionPath,
    businessNotificationsPath,
    likeDocPath: `restaurants/${alphaRestaurantId}/socialPosts/${targetPostId}/likes/${userUid}`,
    seedNotificationPath: `users/${businessUid}/notifications/mnyra-heart-seed-notif-comment-alpha-1`,
    seedRestaurantPostPath: `restaurants/${alphaRestaurantId}/socialPosts/${targetPostId}`,
    seedSocialFeedPath: `socialFeed/${targetPostId}`,
    expectedTableNumber: toNumber(fixture?.guest?.tableNumber, 0)
  };
}

function isAllowedPhase1GateExtraPath(docPath = "", allowances = {}) {
  const safePath = asText(docPath);
  if (!safePath) return false;
  if (safePath === allowances.likeDocPath) {
    return true;
  }
  return (
    isDirectChildDocPath(allowances.commentCollectionPath, safePath)
    || isDirectChildDocPath(allowances.ordersCollectionPath, safePath)
    || isDirectChildDocPath(allowances.businessNotificationsPath, safePath)
  );
}

function validateOrderItemShape(item = {}) {
  return (
    !!asText(item.id)
    && !!asText(item.itemId)
    && !!asText(item.cartKey)
    && toNumber(item.quantity, 0) >= 1
  );
}

async function upsertAuthUser(auth, persona) {
  const payload = {
    uid: String(persona.uid || "").trim(),
    email: String(persona.email || "").trim().toLowerCase(),
    password: String(persona.password || ""),
    displayName: String(persona.displayName || "").trim(),
    emailVerified: true
  };
  if (!payload.uid || !payload.email || !payload.password) {
    throw new Error(`Invalid auth persona payload for uid "${payload.uid || "unknown"}".`);
  }
  try {
    await auth.getUser(payload.uid);
    await auth.updateUser(payload.uid, {
      email: payload.email,
      password: payload.password,
      displayName: payload.displayName,
      emailVerified: true
    });
    return { uid: payload.uid, created: false };
  } catch (error) {
    if (String(error?.code || "").trim() !== "auth/user-not-found") {
      throw error;
    }
  }
  await auth.createUser(payload);
  return { uid: payload.uid, created: true };
}

async function deleteAuthUsers(auth, authUsers = []) {
  const deleted = [];
  for (const persona of authUsers) {
    const uid = String(persona?.uid || "").trim();
    if (!uid) continue;
    try {
      await auth.deleteUser(uid);
      deleted.push(uid);
    } catch (error) {
      if (String(error?.code || "").trim() !== "auth/user-not-found") {
        throw error;
      }
    }
  }
  return deleted;
}

async function writeManagedDocs(db, docs = []) {
  for (const entry of docs) {
    await db.doc(entry.path).set(entry.data, { merge: false });
  }
  return docs.length;
}

async function collectDocTreePaths(docRef) {
  const paths = [];
  const snap = await docRef.get();
  if (!snap.exists) return paths;
  paths.push(docRef.path);
  const subcollections = await docRef.listCollections();
  for (const subcollection of subcollections) {
    const childRefs = await subcollection.listDocuments();
    for (const childRef of childRefs) {
      const childPaths = await collectDocTreePaths(childRef);
      paths.push(...childPaths);
    }
  }
  return uniqueSorted(paths);
}

async function deleteDocTree(docRef) {
  const subcollections = await docRef.listCollections();
  for (const subcollection of subcollections) {
    const childRefs = await subcollection.listDocuments();
    for (const childRef of childRefs) {
      await deleteDocTree(childRef);
    }
  }
  await docRef.delete().catch(() => undefined);
}

async function purgeManagedFirestoreDocs(db, manifest) {
  for (const collectionName of manifest.managedTopLevelCollections || []) {
    const snap = await db.collection(collectionName)
      .where("testWorldId", "==", manifest.metadata.testWorldId)
      .get();
    for (const docSnap of snap.docs) {
      await deleteDocTree(docSnap.ref);
    }
  }
}

async function runSeed({ db, auth, runtime } = {}) {
  const manifest = buildPhase1TestWorldManifest();
  const authResults = [];
  for (const persona of manifest.authUsers) {
    authResults.push(await upsertAuthUser(auth, persona));
  }
  const writtenDocs = await writeManagedDocs(db, manifest.docs);
  return {
    manifest,
    runtime,
    authResults,
    writtenDocs
  };
}

async function runReset({ db, auth, runtime } = {}) {
  const manifest = buildPhase1TestWorldManifest();
  await purgeManagedFirestoreDocs(db, manifest);
  const deletedAuthUsers = await deleteAuthUsers(auth, manifest.authUsers);
  const seedResult = await runSeed({ db, auth, runtime });
  return {
    manifest,
    runtime,
    deletedAuthUsers,
    seedResult
  };
}

async function runVerify({ db, auth, runtime } = {}) {
  const manifest = buildPhase1TestWorldManifest();
  const errors = [];
  const verifiedDocPaths = [];

  await verifyManifestDocs({ db, manifest, errors, verifiedDocPaths });
  await verifyManifestAuthUsers({ auth, manifest, errors });
  await verifyTopLevelCollections({ db, manifest, errors });

  for (const rootPath of manifest.hierarchicalRootDocPaths || []) {
    const actualPaths = await collectDocTreePaths(db.doc(rootPath));
    const expectedPaths = manifest.docs
      .map((entry) => entry.path)
      .filter((docPath) => docPath === rootPath || docPath.startsWith(`${rootPath}/`));
    const diff = compareIdSets(expectedPaths, actualPaths);
    if (diff.missing.length || diff.extra.length) {
      errors.push(
        `Document tree mismatch for ${rootPath}: missing=[${diff.missing.join(", ")}] extra=[${diff.extra.join(", ")}]`
      );
    }
  }

  const expectedDocCountsByCollection = {};
  for (const entry of manifest.docs) {
    const collectionPath = collectionPathFromDocPath(entry.path);
    expectedDocCountsByCollection[collectionPath] = (expectedDocCountsByCollection[collectionPath] || 0) + 1;
  }

  const actualDocCountsByCollection = {};
  for (const collectionPath of Object.keys(expectedDocCountsByCollection)) {
    const snap = await db.collection(collectionPath).get();
    actualDocCountsByCollection[collectionPath] = snap.size;
    if (snap.size !== expectedDocCountsByCollection[collectionPath]) {
      errors.push(
        `Collection size mismatch for ${collectionPath}: expected=${expectedDocCountsByCollection[collectionPath]} actual=${snap.size}`
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    runtime,
    manifest,
    verifiedDocCount: verifiedDocPaths.length,
    expectedDocCountsByCollection,
    actualDocCountsByCollection,
    expectedDocIdsByCollection: Object.fromEntries(
      Object.entries(expectedDocCountsByCollection).map(([collectionPath]) => {
        const ids = manifest.docs
          .filter((entry) => collectionPathFromDocPath(entry.path) === collectionPath)
          .map((entry) => lastPathSegment(entry.path));
        return [collectionPath, uniqueSorted(ids)];
      })
    )
  };
}

async function runPhase1GateVerify({ db, auth, runtime } = {}) {
  const manifest = buildPhase1TestWorldManifest();
  const fixture = manifest.fixture || {};
  const errors = [];
  const verifiedDocPaths = [];
  const allowances = buildPhase1GateAllowances(fixture);

  await verifyManifestDocs({ db, manifest, errors, verifiedDocPaths });
  await verifyManifestAuthUsers({ auth, manifest, errors });
  await verifyTopLevelCollections({ db, manifest, errors });

  for (const rootPath of manifest.hierarchicalRootDocPaths || []) {
    const actualPaths = await collectDocTreePaths(db.doc(rootPath));
    const expectedPaths = manifest.docs
      .map((entry) => entry.path)
      .filter((docPath) => docPath === rootPath || docPath.startsWith(`${rootPath}/`));
    const diff = compareIdSets(expectedPaths, actualPaths);
    const unexpectedExtra = diff.extra.filter((docPath) => !isAllowedPhase1GateExtraPath(docPath, allowances));
    if (diff.missing.length || unexpectedExtra.length) {
      errors.push(
        `Document tree mismatch for ${rootPath}: missing=[${diff.missing.join(", ")}] extra=[${unexpectedExtra.join(", ")}]`
      );
    }
  }

  const expectedDocCountsByCollection = buildExpectedDocCountsByCollection(manifest);
  const actualDocCountsByCollection = {};
  const mutableCollections = new Set([
    allowances.commentCollectionPath,
    collectionPathFromDocPath(allowances.likeDocPath),
    allowances.ordersCollectionPath,
    allowances.businessNotificationsPath
  ]);

  for (const collectionPath of Object.keys(expectedDocCountsByCollection)) {
    const snap = await db.collection(collectionPath).get();
    actualDocCountsByCollection[collectionPath] = snap.size;
    if (mutableCollections.has(collectionPath)) {
      continue;
    }
    if (snap.size !== expectedDocCountsByCollection[collectionPath]) {
      errors.push(
        `Collection size mismatch for ${collectionPath}: expected=${expectedDocCountsByCollection[collectionPath]} actual=${snap.size}`
      );
    }
  }

  const baselineLikeDocs = manifest.docs
    .filter((entry) => collectionPathFromDocPath(entry.path) === collectionPathFromDocPath(allowances.likeDocPath))
    .map((entry) => ({ id: lastPathSegment(entry.path), path: entry.path, fields: entry.data }));
  const actualLikeDocs = await collectCollectionDocs(db, collectionPathFromDocPath(allowances.likeDocPath));
  const extraLikeDocs = diffDocsById(baselineLikeDocs, actualLikeDocs);
  if (extraLikeDocs.length !== 1 || asText(extraLikeDocs[0]?.path) !== allowances.likeDocPath) {
    errors.push(
      `Expected exactly one contract like doc at ${allowances.likeDocPath}, found [${extraLikeDocs.map((entry) => entry.path).join(", ")}]`
    );
  } else if (asText(extraLikeDocs[0]?.fields?.uid) !== allowances.userUid) {
    errors.push(`Contract like doc uid mismatch at ${allowances.likeDocPath}`);
  }

  const baselineCommentDocs = manifest.docs
    .filter((entry) => collectionPathFromDocPath(entry.path) === allowances.commentCollectionPath)
    .map((entry) => ({ id: lastPathSegment(entry.path), path: entry.path, fields: entry.data }));
  const actualCommentDocs = await collectCollectionDocs(db, allowances.commentCollectionPath);
  const extraCommentDocs = diffDocsById(baselineCommentDocs, actualCommentDocs);
  if (extraCommentDocs.length !== 1) {
    errors.push(
      `Expected exactly one contract comment doc in ${allowances.commentCollectionPath}, found ${extraCommentDocs.length}.`
    );
  } else {
    const commentFields = extraCommentDocs[0].fields || {};
    if (asText(commentFields.uid) !== allowances.userUid) {
      errors.push(`Contract comment uid mismatch for ${extraCommentDocs[0].path}`);
    }
    if (!asText(commentFields.text).startsWith("TEST_RUN_")) {
      errors.push(`Contract comment text is not marked as synthetic for ${extraCommentDocs[0].path}`);
    }
  }

  const baselineRestaurantOrderDocs = manifest.docs
    .filter((entry) => collectionPathFromDocPath(entry.path) === allowances.ordersCollectionPath)
    .map((entry) => ({ id: lastPathSegment(entry.path), path: entry.path, fields: entry.data }));
  const actualRestaurantOrderDocs = await collectCollectionDocs(db, allowances.ordersCollectionPath);
  const extraRestaurantOrderDocs = diffDocsById(baselineRestaurantOrderDocs, actualRestaurantOrderDocs);
  if (extraRestaurantOrderDocs.length !== 1) {
    errors.push(
      `Expected exactly one contract order doc in ${allowances.ordersCollectionPath}, found ${extraRestaurantOrderDocs.length}.`
    );
  } else {
    const orderFields = extraRestaurantOrderDocs[0].fields || {};
    const orderItems = Array.isArray(orderFields.items) ? orderFields.items : [];
    if (asText(orderFields.restaurantId) !== allowances.alphaRestaurantId) {
      errors.push(`Contract order restaurantId mismatch for ${extraRestaurantOrderDocs[0].path}`);
    }
    if (asText(orderFields.serviceMode).toLowerCase() !== "table") {
      errors.push(`Contract order serviceMode mismatch for ${extraRestaurantOrderDocs[0].path}`);
    }
    if (toNumber(orderFields.tableNumber, 0) !== allowances.expectedTableNumber) {
      errors.push(`Contract order tableNumber mismatch for ${extraRestaurantOrderDocs[0].path}`);
    }
    if (asText(orderFields.buyerUid) !== "") {
      errors.push(`Contract order buyerUid should stay empty for guest checkout at ${extraRestaurantOrderDocs[0].path}`);
    }
    if (!orderItems.length || orderItems.some((item) => !validateOrderItemShape(item))) {
      errors.push(`Contract order items are malformed for ${extraRestaurantOrderDocs[0].path}`);
    }
  }

  const baselineBusinessNotifications = manifest.docs
    .filter((entry) => collectionPathFromDocPath(entry.path) === allowances.businessNotificationsPath)
    .map((entry) => ({ id: lastPathSegment(entry.path), path: entry.path, fields: entry.data }));
  const actualBusinessNotifications = await collectCollectionDocs(db, allowances.businessNotificationsPath);
  const extraBusinessNotifications = diffDocsById(baselineBusinessNotifications, actualBusinessNotifications);
  const likeNotifications = extraBusinessNotifications.filter((entry) =>
    asText(entry?.fields?.type) === "like"
    && asText(entry?.fields?.postId) === allowances.targetPostId
    && asText(entry?.fields?.userUid) === allowances.userUid
  );
  const commentNotifications = extraBusinessNotifications.filter((entry) =>
    asText(entry?.fields?.type) === "comment"
    && asText(entry?.fields?.postId) === allowances.targetPostId
    && asText(entry?.fields?.userUid) === allowances.userUid
  );
  const invalidExtraNotifications = extraBusinessNotifications.filter((entry) => {
    const fields = entry?.fields || {};
    const type = asText(fields.type);
    if (type === "comment") {
      return !(
        asText(fields.postId) === allowances.targetPostId
        && asText(fields.userUid) === allowances.userUid
      );
    }
    if (type === "like") {
      return !(
        asText(fields.postId) === allowances.targetPostId
        && asText(fields.userUid) === allowances.userUid
      );
    }
    if (type === "order") {
      return asText(fields.restaurantId) !== allowances.alphaRestaurantId;
    }
    return true;
  });
  if (!likeNotifications.length) {
    errors.push(`Expected at least one contract like notification in ${allowances.businessNotificationsPath}.`);
  }
  if (!commentNotifications.length) {
    errors.push(`Expected at least one contract comment notification in ${allowances.businessNotificationsPath}.`);
  }
  if (invalidExtraNotifications.length) {
    errors.push(
      `Unexpected extra notifications found: [${invalidExtraNotifications.map((entry) => entry.path).join(", ")}]`
    );
  }

  const readNotificationSnap = await db.doc(allowances.seedNotificationPath).get();
  if (!readNotificationSnap.exists || readNotificationSnap.data()?.read !== true) {
    errors.push(`Seed notification was not marked as read: ${allowances.seedNotificationPath}`);
  }

  const targetPost = Array.isArray(fixture.posts)
    ? fixture.posts.find((entry) => entry.id === allowances.targetPostId)
    : null;
  const expectedLikesAfter = toNumber(targetPost?.likesCount, 0) + 1;
  const expectedCommentsAfter = toNumber(targetPost?.commentsCount, 0) + 1;

  const restaurantPostSnap = await db.doc(allowances.seedRestaurantPostPath).get();
  const socialFeedSnap = await db.doc(allowances.seedSocialFeedPath).get();
  const restaurantPostData = restaurantPostSnap.data() || {};
  const socialFeedData = socialFeedSnap.data() || {};
  if (toNumber(restaurantPostData.likesCount, 0) < expectedLikesAfter) {
    errors.push(`Restaurant social post likesCount did not reach ${expectedLikesAfter}.`);
  }
  if (toNumber(restaurantPostData.commentsCount, 0) < expectedCommentsAfter) {
    errors.push(`Restaurant social post commentsCount did not reach ${expectedCommentsAfter}.`);
  }
  if (toNumber(socialFeedData.likesCount, 0) < expectedLikesAfter) {
    errors.push(`Social feed likesCount did not reach ${expectedLikesAfter}.`);
  }
  if (toNumber(socialFeedData.commentsCount, 0) < expectedCommentsAfter) {
    errors.push(`Social feed commentsCount did not reach ${expectedCommentsAfter}.`);
  }

  return {
    ok: errors.length === 0,
    errors,
    runtime,
    manifest,
    verifiedDocCount: verifiedDocPaths.length,
    expectedDocCountsByCollection,
    actualDocCountsByCollection,
    verifyMode: "phase1-gate",
    allowances: {
      targetPostId: allowances.targetPostId,
      businessNotificationsPath: allowances.businessNotificationsPath,
      ordersCollectionPath: allowances.ordersCollectionPath
    }
  };
}

module.exports = {
  runSeed,
  runReset,
  runVerify,
  runPhase1GateVerify,
  purgeManagedFirestoreDocs,
  collectDocTreePaths
};
