import test, { after, before, beforeEach } from "node:test";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { AUTH_FIXTURES, firestoreFor } from "./auth-fixtures.mjs";

const repoRoot = dirname(
  fileURLToPath(new URL("../../package.json", import.meta.url)),
);
const projectId = process.env.MNYRA_RULES_PROJECT_ID || "mnyra-local";
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const [host, portText] = firestoreHost.split(":");
const seed = JSON.parse(
  await readFile(resolve(repoRoot, "seed/data/mnyra-local-seed.json"), "utf8"),
);

let testEnv;

before(async () => {
  const rules = await readFile(resolve(repoRoot, "firestore.rules"), "utf8");
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      host,
      port: Number(portText || 8080),
      rules,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await seedFirestore();
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

async function seedFirestore(extraDocuments = []) {
  const documents = [...(seed.documents || []), ...extraDocuments];
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const batchSize = 400;
    for (let index = 0; index < documents.length; index += batchSize) {
      const batch = db.batch();
      for (const document of documents.slice(index, index + batchSize)) {
        batch.set(db.doc(document.path), document.data || {});
      }
      await batch.commit();
    }
  });
}

function validOrderPayload(overrides = {}) {
  const item = {
    id: "menu-001",
    itemId: "menu-001",
    name: "Local Breakfast Plate",
    price: 6.9,
    quantity: 2,
    imageUrl: "https://images.example.local/menu-001.jpg",
    category: "Breakfast",
    comment: "",
  };
  return {
    restaurantId: "pidhi-madh",
    tableNumber: 2,
    tableLabel: "Tisch 2",
    buyerUid: "",
    buyerName: "Guest",
    buyerHandle: "guest",
    contact: {
      name: "Guest",
      phone: "",
      city: "",
      address: "",
      tableNumber: 2,
      tableLabel: "Tisch 2",
    },
    items: [item],
    itemCount: 2,
    total: 13.8,
    status: "Neu",
    orderSource: "canonical",
    ...overrides,
  };
}

function otherRestaurantDocuments() {
  return [
    {
      path: "restaurants/other-restaurant",
      data: {
        id: "other-restaurant",
        name: "Other Restaurant",
        ownerUid: "other-owner",
        ownerEmail: "other-owner@example.test",
        email: "",
        contactEmail: "",
        socialEmail: "",
        loginEmail: "",
        accountEmail: "",
      },
    },
    {
      path: "restaurants/other-restaurant/orders/order-other-001",
      data: {
        id: "order-other-001",
        restaurantId: "other-restaurant",
        status: "new",
        items: [],
      },
    },
  ];
}

test("guest order contract allows valid guest orders and denies manipulated payloads", async () => {
  const guestDb = firestoreFor(testEnv, AUTH_FIXTURES.guest);

  await assertSucceeds(
    guestDb
      .doc("restaurants/pidhi-madh/orders/order-guest-valid")
      .set(validOrderPayload()),
  );

  await assertFails(
    guestDb.doc("restaurants/pidhi-madh/orders/order-manipulated-total").set(
      validOrderPayload({
        total: 999,
      }),
    ),
  );

  await assertFails(
    guestDb.doc("restaurants/pidhi-madh/orders/order-manipulated-price").set(
      validOrderPayload({
        items: [
          {
            id: "menu-001",
            itemId: "menu-001",
            name: "Local Breakfast Plate",
            price: 999,
            quantity: 1,
          },
        ],
        itemCount: 1,
        total: 999,
      }),
    ),
  );

  await assertFails(
    guestDb.doc("restaurants/pidhi-madh/orders/order-manipulated-status").set(
      validOrderPayload({
        status: "archiv",
      }),
    ),
  );

  await assertFails(
    guestDb.doc("restaurants/pidhi-madh/orders/order-forged-buyer").set(
      validOrderPayload({
        buyerUid: "shopper-demo",
      }),
    ),
  );

  await assertFails(
    guestDb.doc("restaurants/pidhi-madh/orders/order-wrong-restaurant").set(
      validOrderPayload({
        restaurantId: "other-restaurant",
      }),
    ),
  );
});

test("signed-in order contract allows own valid orders and denies manipulated payloads", async () => {
  const userDb = firestoreFor(testEnv, AUTH_FIXTURES.user);

  await assertSucceeds(
    userDb.doc("restaurants/pidhi-madh/orders/order-user-valid").set(
      validOrderPayload({
        buyerUid: "shopper-demo",
        buyerName: "Local Shopper",
        buyerHandle: "shopper",
      }),
    ),
  );

  await assertFails(
    userDb
      .doc("restaurants/pidhi-madh/orders/order-user-manipulated-total")
      .set(
        validOrderPayload({
          buyerUid: "shopper-demo",
          total: 999,
        }),
      ),
  );

  await assertFails(
    userDb
      .doc("restaurants/pidhi-madh/orders/order-user-manipulated-price")
      .set(
        validOrderPayload({
          buyerUid: "shopper-demo",
          items: [
            {
              id: "menu-001",
              itemId: "menu-001",
              name: "Local Breakfast Plate",
              price: 999,
              quantity: 1,
            },
          ],
          itemCount: 1,
          total: 999,
        }),
      ),
  );

  await assertFails(
    userDb.doc("restaurants/pidhi-madh/orders/order-user-forged-buyer").set(
      validOrderPayload({
        buyerUid: "other-user",
      }),
    ),
  );
});

test("user cannot directly manipulate likes/comments/follower counters", async () => {
  await seedFirestore([
    {
      path: "users/shopper-demo/posts/user-post-001",
      data: {
        id: "user-post-001",
        uid: "shopper-demo",
        text: "Local user post",
        likesCount: 0,
        commentsCount: 0,
      },
    },
  ]);

  const userDb = firestoreFor(testEnv, AUTH_FIXTURES.user);

  await assertFails(
    userDb.doc("socialFeed/post-demo-001").update({
      likesCount: 999,
      commentsCount: 999,
    }),
  );

  await assertFails(
    userDb.doc("restaurants/pidhi-madh").update({
      followersCount: 999,
    }),
  );

  await assertFails(
    userDb.doc("users/shopper-demo").update({
      followingCount: 999,
    }),
  );

  await assertFails(
    userDb.doc("users/shopper-demo/posts/user-post-001").update({
      likesCount: 999,
    }),
  );

  await assertFails(
    userDb.doc("users/shopper-demo/posts/user-post-forged-counter").set({
      id: "user-post-forged-counter",
      uid: "shopper-demo",
      text: "Forged counter",
      likesCount: 999,
      commentsCount: 999,
    }),
  );

  await assertSucceeds(
    userDb.doc("users/shopper-demo/posts/user-post-zero-counter").set({
      id: "user-post-zero-counter",
      uid: "shopper-demo",
      text: "Initial counters are zero",
      likesCount: 0,
      commentsCount: 0,
    }),
  );

  await assertSucceeds(
    userDb
      .doc(
        "restaurants/pidhi-madh/socialPosts/post-demo-001/likes/shopper-demo",
      )
      .set({
        uid: "shopper-demo",
      }),
  );

  await assertSucceeds(
    userDb
      .doc(
        "restaurants/pidhi-madh/socialPosts/post-demo-001/comments/comment-user-001",
      )
      .set({
        uid: "shopper-demo",
        text: "Allowed comment document",
        likesCount: 0,
      }),
  );
});

test("waiter can read only orders for an authorized restaurant", async () => {
  await seedFirestore(otherRestaurantDocuments());

  const waiterDb = firestoreFor(testEnv, AUTH_FIXTURES.waiter);

  await assertSucceeds(
    waiterDb.doc("restaurants/pidhi-madh/orders/order-demo-001").get(),
  );
  await assertSucceeds(
    waiterDb.collection("restaurants/pidhi-madh/orders").get(),
  );
  await assertFails(
    waiterDb.doc("restaurants/other-restaurant/orders/order-other-001").get(),
  );
  await assertFails(
    waiterDb.collection("restaurants/other-restaurant/orders").get(),
  );
});

test("waiter can update only order status fields for an authorized restaurant", async () => {
  const waiterDb = firestoreFor(testEnv, AUTH_FIXTURES.waiter);

  await assertSucceeds(
    waiterDb.doc("restaurants/pidhi-madh/orders/order-demo-001").update({
      status: "angenommen",
      updatedAtClient: "2026-07-01T07:30:00.000Z",
    }),
  );

  await assertFails(
    waiterDb.doc("restaurants/pidhi-madh/orders/order-demo-001").update({
      status: "paid",
    }),
  );

  await assertFails(
    waiterDb.doc("restaurants/pidhi-madh/orders/order-demo-001").update({
      total: 0,
    }),
  );

  await assertFails(
    waiterDb.doc("restaurants/pidhi-madh/orders/order-demo-001").update({
      items: [],
    }),
  );

  await assertFails(
    waiterDb.doc("restaurants/pidhi-madh/orders/order-demo-001").delete(),
  );
});

test("guest and normal user cannot read foreign restaurant orders", async () => {
  const guestDb = firestoreFor(testEnv, AUTH_FIXTURES.guest);
  const userDb = firestoreFor(testEnv, AUTH_FIXTURES.user);

  await assertFails(
    guestDb.doc("restaurants/pidhi-madh/orders/order-demo-001").get(),
  );
  await assertFails(guestDb.collection("restaurants/pidhi-madh/orders").get());
  await assertFails(
    userDb.doc("restaurants/pidhi-madh/orders/order-demo-001").get(),
  );
  await assertFails(userDb.collection("restaurants/pidhi-madh/orders").get());
});

test("buyer can read own restaurant order but cannot list restaurant orders", async () => {
  await seedFirestore([
    {
      path: "restaurants/pidhi-madh/orders/order-user-owned",
      data: {
        id: "order-user-owned",
        restaurantId: "pidhi-madh",
        buyerUid: "shopper-demo",
        status: "new",
        items: [],
        total: 0,
      },
    },
  ]);

  const userDb = firestoreFor(testEnv, AUTH_FIXTURES.user);

  await assertSucceeds(
    userDb.doc("restaurants/pidhi-madh/orders/order-user-owned").get(),
  );
  await assertFails(userDb.collection("restaurants/pidhi-madh/orders").get());
});

test("owner and CEO restaurant order access follows existing admin contract", async () => {
  await seedFirestore(otherRestaurantDocuments());

  const ownerDb = firestoreFor(testEnv, AUTH_FIXTURES.owner);
  const heartDb = firestoreFor(testEnv, AUTH_FIXTURES.heart);

  await assertSucceeds(
    ownerDb.doc("restaurants/pidhi-madh/orders/order-demo-001").get(),
  );
  await assertSucceeds(
    ownerDb.collection("restaurants/pidhi-madh/orders").get(),
  );
  await assertFails(
    ownerDb.doc("restaurants/other-restaurant/orders/order-other-001").get(),
  );
  await assertFails(
    ownerDb.collection("restaurants/other-restaurant/orders").get(),
  );
  await assertSucceeds(
    heartDb.doc("restaurants/pidhi-madh/orders/order-demo-001").get(),
  );
  await assertSucceeds(
    heartDb.collection("restaurants/pidhi-madh/orders").get(),
  );
  await assertSucceeds(
    heartDb.doc("restaurants/pidhi-madh/orders/order-demo-001").update({
      status: "fertig",
    }),
  );
  await assertSucceeds(
    heartDb.doc("restaurants/pidhi-madh/orders/order-demo-001").delete(),
  );
});

test("owner can edit only the owned business", async () => {
  await seedFirestore([
    {
      path: "restaurants/other-restaurant",
      data: {
        id: "other-restaurant",
        name: "Other Restaurant",
        ownerUid: "other-owner",
        ownerEmail: "other-owner@example.test",
        email: "",
        contactEmail: "",
        socialEmail: "",
        loginEmail: "",
        accountEmail: "",
      },
    },
  ]);

  const ownerDb = firestoreFor(testEnv, AUTH_FIXTURES.owner);

  await assertSucceeds(
    ownerDb.doc("restaurants/pidhi-madh").update({
      bio: "Owner-updated local test bio",
    }),
  );

  await assertFails(
    ownerDb.doc("restaurants/other-restaurant").update({
      bio: "Should not be allowed",
    }),
  );
});

test("CEO/Heart can approve ads through the admin contract", async () => {
  const heartDb = firestoreFor(testEnv, AUTH_FIXTURES.heart);
  const ownerDb = firestoreFor(testEnv, AUTH_FIXTURES.owner);

  await assertSucceeds(
    heartDb.doc("leads/ad-demo-001").update({
      status: "approved",
      approvedByUid: "heart-demo",
    }),
  );

  await assertFails(
    ownerDb.doc("leads/ad-demo-001").update({
      status: "approved",
      approvedByUid: "owner-demo",
    }),
  );
});

test("public can read only public profile/menu/posts surfaces", async () => {
  const guestDb = firestoreFor(testEnv, AUTH_FIXTURES.guest);

  await assertSucceeds(guestDb.doc("publicRoutes/pidhimadh").get());
  await assertSucceeds(guestDb.doc("restaurants/pidhi-madh").get());
  await assertSucceeds(
    guestDb.doc("restaurants/pidhi-madh/public/profile").get(),
  );
  await assertSucceeds(guestDb.doc("restaurants/pidhi-madh/public/menu").get());
  await assertSucceeds(
    guestDb.doc("restaurants/pidhi-madh/menuItems/menu-001").get(),
  );
  await assertSucceeds(
    guestDb.doc("restaurants/pidhi-madh/socialPosts/post-demo-001").get(),
  );
  await assertFails(guestDb.doc("users/owner-demo").get());
});

test("private user data remains protected", async () => {
  const userDb = firestoreFor(testEnv, AUTH_FIXTURES.user);
  const ownerDb = firestoreFor(testEnv, AUTH_FIXTURES.owner);
  const heartDb = firestoreFor(testEnv, AUTH_FIXTURES.heart);

  await assertSucceeds(userDb.doc("users/shopper-demo").get());
  await assertFails(userDb.doc("users/waiter-demo").get());
  await assertSucceeds(ownerDb.doc("users/waiter-demo").get());
  await assertSucceeds(heartDb.doc("users/waiter-demo").get());
});
