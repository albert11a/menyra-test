#!/usr/bin/env node
"use strict";

const admin = require("firebase-admin");

if (process.argv.includes("--apply") || process.env.APPLY === "1") {
  console.error("Refusing to run writes. This contract audit is dry-run only in this step.");
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const MAX_DOCS = LIMIT_ARG ? Math.max(1, Number(LIMIT_ARG.split("=")[1]) || 0) : 0;

function text(value = "") {
  return String(value || "").trim();
}

function lower(value = "") {
  return text(value).toLowerCase();
}

function hasOwn(data, field) {
  return Object.prototype.hasOwnProperty.call(data || {}, field);
}

function normalizeSlug(value = "") {
  let slug = lower(value);
  if (!slug || slug.includes(".")) return "";
  try {
    if (typeof slug.normalize === "function") {
      slug = slug.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }
  } catch {}
  return slug
    .replace(/^@+/, "")
    .replace(/&/g, " and ")
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function inferRole(user = {}) {
  const role = lower(user.role);
  if (role) return role;
  if (text(user.staffRestaurantId || user.waiterRestaurantId || user.businessOwnerUid)) return "staff";
  if (text(user.restaurantId)) return "business";
  return "user";
}

function shouldWriteMissing(data, field) {
  return !hasOwn(data, field) || text(data[field]) === "";
}

function propose(summary, path, patch, reason) {
  const cleanPatch = {};
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") cleanPatch[key] = value;
  });
  if (!Object.keys(cleanPatch).length) return;
  summary.proposals += 1;
  console.log(`[DRY-RUN] ${path} ${reason}: ${JSON.stringify(cleanPatch)}`);
}

function risk(summary, path, message) {
  summary.risks += 1;
  console.log(`[RISK] ${path} ${message}`);
}

function limited(ref) {
  return MAX_DOCS > 0 ? ref.limit(MAX_DOCS) : ref;
}

async function loadCollection(name) {
  const snap = await limited(db.collection(name)).get();
  return snap.docs.map((doc) => ({ id: doc.id, ref: doc.ref, data: doc.data() || {} }));
}

async function loadStaffDocs() {
  try {
    const snap = await limited(db.collectionGroup("staff")).get();
    return snap.docs.map((doc) => {
      const restaurantRef = doc.ref.parent.parent;
      return {
        id: doc.id,
        restaurantId: restaurantRef ? restaurantRef.id : "",
        data: doc.data() || {}
      };
    });
  } catch (err) {
    console.warn(`[WARN] collectionGroup(staff) skipped: ${err.message || err}`);
    return [];
  }
}

function buildSlugCandidate(restaurant) {
  return normalizeSlug(
    restaurant.publicSlug
    || restaurant.landingSlug
    || restaurant.name
    || restaurant.restaurantName
    || restaurant.businessName
    || restaurant.id
  );
}

async function audit() {
  const summary = {
    users: 0,
    restaurants: 0,
    leads: 0,
    staffDocs: 0,
    proposals: 0,
    risks: 0
  };

  const [users, restaurants, leads, staffDocs] = await Promise.all([
    loadCollection("users"),
    loadCollection("restaurants"),
    loadCollection("leads"),
    loadStaffDocs()
  ]);
  summary.users = users.length;
  summary.restaurants = restaurants.length;
  summary.leads = leads.length;
  summary.staffDocs = staffDocs.length;

  const usersById = new Map(users.map((row) => [row.id, row]));
  const leadsByRestaurantId = new Map();
  leads.forEach((row) => {
    const rid = text(row.data.restaurantId || row.data.landingRestaurantId);
    if (rid) leadsByRestaurantId.set(rid, row);
  });

  const restaurantsByOwnerUid = new Map();
  const ownerUidsByRestaurant = new Map();
  restaurants.forEach((row) => {
    const ownerFields = [
      row.data.ownerUid,
      row.data.socialUid,
      row.data.uid,
      row.data.userUid,
      row.data.accountUid
    ].map(text).filter(Boolean);
    ownerUidsByRestaurant.set(row.id, ownerFields);
    ownerFields.forEach((uid) => {
      const list = restaurantsByOwnerUid.get(uid) || [];
      list.push(row);
      restaurantsByOwnerUid.set(uid, list);
    });
  });

  const staffByUid = new Map();
  staffDocs.forEach((row) => {
    const uid = text(row.data.uid || row.data.userId || row.id);
    if (!uid) return;
    const list = staffByUid.get(uid) || [];
    list.push(row);
    staffByUid.set(uid, list);
  });

  restaurantsByOwnerUid.forEach((list, uid) => {
    const active = list.filter((row) => lower(row.data.status) !== "disabled" && row.data.deleted !== true);
    if (active.length > 1) {
      risk(summary, `users/${uid}`, `maps to multiple active restaurants: ${active.map((row) => row.id).join(", ")}`);
    }
  });

  restaurants.forEach((row) => {
    const owners = ownerUidsByRestaurant.get(row.id) || [];
    if (new Set(owners).size > 1) {
      risk(summary, `restaurants/${row.id}`, `has multiple owner uid fields: ${owners.join(", ")}`);
    }
  });

  for (const row of users) {
    const data = row.data;
    const path = `users/${row.id}`;
    const role = inferRole(data);
    const patch = {};
    if (shouldWriteMissing(data, "uid")) patch.uid = row.id;
    if (shouldWriteMissing(data, "role")) patch.role = role;
    if (shouldWriteMissing(data, "status")) patch.status = "active";
    if (role === "business" && shouldWriteMissing(data, "restaurantId")) {
      const matches = restaurantsByOwnerUid.get(row.id) || [];
      if (matches.length === 1) patch.restaurantId = matches[0].id;
      else if (matches.length > 1) risk(summary, path, "business user missing restaurantId and has multiple restaurant matches");
      else risk(summary, path, "business user missing restaurantId and has no explicit restaurant owner match");
    }
    if (role === "staff") {
      const staffRestaurantId = text(data.staffRestaurantId || data.waiterRestaurantId || data.restaurantId);
      if (!staffRestaurantId) {
        const matches = staffByUid.get(row.id) || [];
        const restaurantIds = Array.from(new Set(matches.map((item) => text(item.restaurantId)).filter(Boolean)));
        if (restaurantIds.length === 1) {
          patch.staffRestaurantId = restaurantIds[0];
          patch.waiterRestaurantId = restaurantIds[0];
        } else if (restaurantIds.length > 1) {
          risk(summary, path, `staff user has multiple restaurant staff docs: ${restaurantIds.join(", ")}`);
        } else {
          risk(summary, path, "staff user missing staffRestaurantId/waiterRestaurantId and no staff doc was found");
        }
      }
    }
    propose(summary, path, patch, "missing bootstrap fields");
  }

  for (const row of restaurants) {
    const data = row.data;
    const path = `restaurants/${row.id}`;
    const lead = leadsByRestaurantId.get(row.id)?.data || {};
    const patch = {};
    if (shouldWriteMissing(data, "id")) patch.id = row.id;
    if (shouldWriteMissing(data, "ownerUid") && text(lead.socialUid || lead.ownerUid)) patch.ownerUid = text(lead.socialUid || lead.ownerUid);
    if (shouldWriteMissing(data, "ownerEmail") && text(data.email || data.contactEmail || lead.socialEmail || lead.email)) {
      patch.ownerEmail = text(data.email || data.contactEmail || lead.socialEmail || lead.email);
    }
    const slug = buildSlugCandidate({ id: row.id, ...data });
    if (slug && shouldWriteMissing(data, "publicSlug")) patch.publicSlug = slug;
    if (slug && shouldWriteMissing(data, "landingSlug")) patch.landingSlug = slug;
    propose(summary, path, patch, "missing restaurant identity fields");

    const menuSnap = await row.ref.collection("public").doc("menu").get();
    if (!menuSnap.exists) {
      propose(summary, `${path}/public/menu`, {
        items: [],
        statusBadgeVisible: true,
        menuTruthSource: "public-menu",
        menuTruthState: "knownEmpty"
      }, "missing active public menu doc");
    } else {
      const menu = menuSnap.data() || {};
      const menuPatch = {};
      if (shouldWriteMissing(menu, "menuTruthSource")) menuPatch.menuTruthSource = "public-menu";
      if (shouldWriteMissing(menu, "menuTruthState")) {
        menuPatch.menuTruthState = Array.isArray(menu.items) && menu.items.length ? "seeded" : "knownEmpty";
      }
      propose(summary, `${path}/public/menu`, menuPatch, "missing menu truth metadata");
    }

    const offersSnap = await row.ref.collection("public").doc("offers").get();
    if (offersSnap.exists) {
      const offers = offersSnap.data() || {};
      const offersPatch = {};
      if (shouldWriteMissing(offers, "truthSource")) offersPatch.truthSource = "public-menu";
      if (shouldWriteMissing(offers, "truthState")) {
        offersPatch.truthState = Array.isArray(offers.items) && offers.items.length ? "seeded" : "knownEmpty";
      }
      propose(summary, `${path}/public/offers`, offersPatch, "missing focus truth metadata");
    }
  }

  for (const row of leads) {
    const data = row.data;
    const uid = text(data.socialUid || data.ownerUid);
    const rid = text(data.restaurantId || data.landingRestaurantId);
    if (!uid || !rid) continue;
    const user = usersById.get(uid)?.data || {};
    const patch = {};
    if (shouldWriteMissing(user, "uid")) patch.uid = uid;
    if (shouldWriteMissing(user, "role")) patch.role = "business";
    if (shouldWriteMissing(user, "status")) patch.status = lower(data.status) === "kunde" ? "active" : "pending";
    if (shouldWriteMissing(user, "restaurantId")) patch.restaurantId = rid;
    propose(summary, `users/${uid}`, patch, `linked from leads/${row.id}`);
  }

  for (const row of staffDocs) {
    const uid = text(row.data.uid || row.data.userId || row.id);
    const restaurantId = text(row.restaurantId);
    if (!uid || !restaurantId) continue;
    const user = usersById.get(uid)?.data || {};
    const patch = {};
    if (shouldWriteMissing(user, "uid")) patch.uid = uid;
    if (shouldWriteMissing(user, "role")) patch.role = "staff";
    if (shouldWriteMissing(user, "status")) patch.status = lower(row.data.status) === "disabled" ? "disabled" : "active";
    if (shouldWriteMissing(user, "staffRestaurantId")) patch.staffRestaurantId = restaurantId;
    if (shouldWriteMissing(user, "waiterRestaurantId") && row.data.waiterAccess === true) patch.waiterRestaurantId = restaurantId;
    propose(summary, `users/${uid}`, patch, `linked from restaurants/${restaurantId}/staff/${row.id}`);
  }

  console.log(`[SUMMARY] ${JSON.stringify(summary)}`);
  console.log("No writes were executed.");
}

audit().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
