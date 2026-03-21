"use strict";

const admin = require("firebase-admin");
const {
  asText,
  normalizeHandleValue,
  serializeFirestoreValue
} = require("./common");

const HEART_PERSONA_KEYS = Object.freeze(["ceo", "business", "staff", "user"]);

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

function createSyntheticIsolationKey() {
  return `heart-isolation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createPassword() {
  return `Heart!${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-6)}`;
}

function buildPersonaIdentity(personaKey = "", restaurant = {}) {
  const suffix = asText(restaurant.id || "global").slice(-6).toLowerCase();
  const slug = normalizeHandleValue(asText(restaurant.handle || restaurant.name || "mnyra")) || "mnyra";
  const map = {
    ceo: {
      firstName: "Heart",
      lastName: "CEO",
      displayName: "Heart CEO",
      role: "ceo",
      roles: ["ceo"],
      handle: `heart_ceo_${slug}_${suffix}`,
      email: `heart+ceo-${slug}-${suffix}@mnyra.test`
    },
    business: {
      firstName: "Heart",
      lastName: "Business",
      displayName: "Heart Business",
      role: "business",
      roles: ["owner", "staff"],
      handle: `heart_business_${slug}_${suffix}`,
      email: `heart+business-${slug}-${suffix}@mnyra.test`
    },
    staff: {
      firstName: "Heart",
      lastName: "Service",
      displayName: "Heart Service",
      role: "staff",
      roles: ["staff"],
      handle: `heart_staff_${slug}_${suffix}`,
      email: `heart+staff-${slug}-${suffix}@mnyra.test`
    },
    user: {
      firstName: "Heart",
      lastName: "User",
      displayName: "Heart User",
      role: "user",
      roles: ["user"],
      handle: `heart_user_${slug}_${suffix}`,
      email: `heart+user-${slug}-${suffix}@mnyra.test`
    }
  };
  return map[personaKey] || map.user;
}

function buildDefaultPackConfig({
  socialBaseUrl = "",
  waiterBaseUrl = "",
  guestRouteUrl = "",
  personas = {}
} = {}) {
  const businessHandle = asText(personas.business?.handle);
  const userHandle = asText(personas.user?.handle);
  return {
    actions: {
      social: {
        businessProfile: {
          url: businessHandle ? buildProfileUrl(socialBaseUrl, businessHandle) : ""
        },
        userTargetProfile: {
          url: userHandle ? buildProfileUrl(socialBaseUrl, userHandle) : ""
        },
        follow: {
          url: userHandle ? buildProfileUrl(socialBaseUrl, userHandle) : "",
          triggerSelector: "[data-follow-toggle]",
          verifySelector: "[data-following='true']"
        },
        like: {
          url: buildUrl(socialBaseUrl, { tab: "feed" }),
          triggerSelector: "[data-like-toggle]",
          countSelector: "[data-like-count]"
        },
        commentCreate: {
          url: buildUrl(socialBaseUrl, { tab: "feed" }),
          openComposerSelector: "[data-comment-open]",
          inputSelector: "[data-comment-input]",
          submitSelector: "[data-comment-submit]",
          verifyText: "TEST_RUN_<runId>_COMMENT_1"
        },
        postCreate: {
          url: buildUrl(socialBaseUrl, { tab: "feed" }),
          openSelector: "[data-post-open]",
          inputSelector: "[data-post-input]",
          submitSelector: "[data-post-submit]",
          verifyText: "TEST_RUN_<runId>_POST_1"
        }
      },
      business: {
        menu: {
          url: buildUrl(socialBaseUrl, { tab: "menu" })
        },
        focus: {
          url: buildUrl(socialBaseUrl, { tab: "focus" })
        },
        productCreate: {
          url: buildUrl(socialBaseUrl, { tab: "menu" }),
          openSelector: "[data-product-create-open]",
          nameSelector: "[data-product-name-input]",
          saveSelector: "[data-product-save]",
          verifyText: "TEST_RUN_<runId>_PRODUCT_1"
        },
        productEdit: {
          url: buildUrl(socialBaseUrl, { tab: "menu" }),
          openSelector: "[data-product-edit-open]",
          inputSelector: "[data-product-name-input]",
          saveSelector: "[data-product-save]",
          verifyText: "TEST_RUN_<runId>_PRODUCT_EDIT"
        },
        productDelete: {
          url: buildUrl(socialBaseUrl, { tab: "menu" }),
          openSelector: "[data-product-delete-open]",
          confirmSelector: "[data-product-delete-confirm]",
          removedSelector: "[data-product-row]",
          removedText: "TEST_RUN_<runId>_PRODUCT_1"
        }
      },
      commerce: {
        cart: {
          url: guestRouteUrl,
          triggerSelector: "#menuDetailAddToCartBtn",
          removalSelector: "[data-cart-remove]"
        },
        order: {
          url: guestRouteUrl,
          triggerSelector: "[data-submit-order]",
          successText: "Bestellung gesendet"
        }
      },
      chat: {
        send: {
          url: buildUrl(socialBaseUrl, { tab: "chat" }),
          composerSelector: "textarea",
          sendSelector: "[data-chat-send]",
          verifyText: "TEST_RUN_<runId>_CHAT_1"
        }
      },
      crm: {
        leadCreate: {
          url: buildUrl(socialBaseUrl, { tab: "leads" }),
          openSelector: "[data-lead-create-open]",
          nameSelector: "[data-lead-name]",
          emailSelector: "[data-lead-email]",
          saveSelector: "[data-lead-save]",
          verifyText: "TEST_RUN_<runId>_LEAD_1"
        },
        leadEdit: {
          url: buildUrl(socialBaseUrl, { tab: "leads" }),
          openSelector: "[data-lead-edit-open]",
          inputSelector: "[data-lead-name]",
          saveSelector: "[data-lead-save]",
          verifyText: "TEST_RUN_<runId>_LEAD_EDIT"
        }
      },
      guest: {
        qrMenu: {
          url: guestRouteUrl,
          menuVisibleSelector: "[data-menu-grid]",
          cartVisibleSelector: "[data-cart-button]",
          orderTriggerSelector: "[data-submit-order]",
          orderSuccessText: "Bestellung gesendet",
          privilegedSelectors: [
            "[data-business-edit]",
            "[data-crm-create]"
          ]
        }
      },
      staff: {
        waiter: {
          url: asText(waiterBaseUrl),
          orderVisibleSelector: "[data-order-action]",
          statusActionSelector: "[data-order-action='angenommen']"
        }
      },
      journey: {
        modalOpenSelector: "[data-post-open]",
        modalCloseSelector: "[data-modal-close]"
      }
    }
  };
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
    staffRestaurantId: asText(restaurantId),
    waiterRestaurantId: waiterAccess ? asText(restaurantId) : "",
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
          roles: ["ceo"]
        }),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else if (personaKey === "business" || personaKey === "staff") {
      const businessAccess = personaKey === "business";
      const waiterAccess = personaKey === "staff";
      const staffRoles = personaKey === "business" ? ["owner", "staff"] : ["staff"];
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
          roles: staffRoles,
          restaurantId: asText(restaurant.id),
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
          roles: ["user"]
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
  const packConfig = mergeDeep(
    buildDefaultPackConfig({
      socialBaseUrl,
      waiterBaseUrl,
      guestRouteUrl,
      personas: ensureObject(setup.personas)
    }),
    ensureObject(setup.packConfig)
  );
  return {
    MNYRA_CEO_EMAIL: asText(setup.personas?.ceo?.email),
    MNYRA_CEO_PASSWORD: asText(setup.personas?.ceo?.password),
    MNYRA_BUSINESS_EMAIL: asText(setup.personas?.business?.email),
    MNYRA_BUSINESS_PASSWORD: asText(setup.personas?.business?.password),
    MNYRA_STAFF_EMAIL: asText(setup.personas?.staff?.email),
    MNYRA_STAFF_PASSWORD: asText(setup.personas?.staff?.password),
    MNYRA_USER_EMAIL: asText(setup.personas?.user?.email),
    MNYRA_USER_PASSWORD: asText(setup.personas?.user?.password),
    MNYRA_GUEST_QR_URL: guestRouteUrl,
    MNYRA_ALLOW_LIVE_MUTATIONS: setup.allowLiveMutations === true ? "true" : "false",
    MNYRA_SYNTHETIC_ISOLATION_KEY: asText(setup.syntheticIsolationKey),
    MNYRA_HEART_PACK_CONFIG_JSON: JSON.stringify(packConfig),
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
  const nextPackConfig = mergeDeep(
    buildDefaultPackConfig({
      socialBaseUrl,
      waiterBaseUrl,
      guestRouteUrl: nextGuestRouteUrl,
      personas: ensureObject(merged.personas)
    }),
    ensureObject(merged.packConfig)
  );
  return {
    ...merged,
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
  deleteProvisionedPersona,
  buildRunnerEnvPayload,
  deriveSetupPatch
};
