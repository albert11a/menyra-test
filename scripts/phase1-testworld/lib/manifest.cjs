"use strict";

const path = require("path");

const fixture = require(path.resolve(
  __dirname,
  "../../../tests/phase1-testworld/fixtures/phase1-testworld.fixture.cjs"
));

const BASELINE_UPDATED_AT = "2026-03-28T10:00:00.000Z";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function lastPathSegment(docPath = "") {
  const parts = String(docPath || "").split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

function collectionPathFromDocPath(docPath = "") {
  const parts = String(docPath || "").split("/").filter(Boolean);
  return parts.slice(0, -1).join("/");
}

function createManagedDoc(docPath, kind, data) {
  return {
    path: docPath,
    data: {
      ...deepClone(data || {}),
      managed: true,
      managedBy: fixture.managedBy,
      testWorldId: fixture.testWorldId,
      seedVersion: fixture.seedVersion,
      syntheticIsolationKey: fixture.syntheticIsolationKey,
      managedKind: kind,
      managedPath: docPath
    }
  };
}

function buildUserDoc(persona, {
  role = "user",
  roles = ["user"],
  restaurantId = "",
  staffRestaurantId = "",
  waiterRestaurantId = "",
  businessAccess = false,
  waiterAccess = false,
  ceoParentUid = "",
  ceoRootUid = "",
  ceoPath = []
} = {}) {
  return {
    uid: persona.uid,
    email: persona.email,
    displayName: persona.displayName,
    name: persona.displayName,
    firstName: persona.firstName,
    lastName: persona.lastName,
    handle: persona.handle,
    avatar: persona.avatarUrl,
    photoUrl: persona.avatarUrl,
    role,
    roles: Array.isArray(roles) ? roles.slice() : [],
    restaurantId: String(restaurantId || "").trim(),
    staffRestaurantId: String(staffRestaurantId || "").trim(),
    waiterRestaurantId: String(waiterRestaurantId || "").trim(),
    businessAccess: businessAccess === true,
    waiterAccess: waiterAccess === true,
    permissions: {
      businessAccess: businessAccess === true,
      waiterAccess: waiterAccess === true
    },
    staffActive: true,
    staffStatus: "active",
    followersCount: 0,
    followingCount: 0,
    ceoParentUid: String(ceoParentUid || "").trim(),
    ceoRootUid: String(ceoRootUid || "").trim(),
    ceoPath: Array.isArray(ceoPath) ? ceoPath.slice() : [],
    updatedAt: BASELINE_UPDATED_AT
  };
}

function buildRestaurantDoc(restaurant, extra = {}) {
  return {
    id: restaurant.id,
    restaurantId: restaurant.id,
    name: restaurant.name,
    restaurantName: restaurant.name,
    handle: restaurant.handle,
    type: restaurant.type,
    customerType: restaurant.customerType,
    city: restaurant.city,
    address: restaurant.address,
    phone: restaurant.phone,
    ownerUid: restaurant.ownerUid,
    ownerEmail: restaurant.ownerEmail,
    logoUrl: restaurant.logoUrl,
    logo: restaurant.logoUrl,
    coverUrl: restaurant.coverUrl,
    status: restaurant.status,
    followersCount: 0,
    followingCount: 0,
    crmCounts: {
      leads: 0,
      customers: 0
    },
    updatedAt: BASELINE_UPDATED_AT,
    ...deepClone(extra || {})
  };
}

function buildRestaurantStaffDoc(persona, restaurant, {
  role = "waiter",
  roles = ["staff"],
  businessAccess = false,
  waiterAccess = false
} = {}) {
  return {
    uid: persona.uid,
    userId: persona.uid,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    firstName: persona.firstName,
    lastName: persona.lastName,
    name: persona.displayName,
    email: persona.email,
    avatar: persona.avatarUrl,
    role,
    roles: Array.isArray(roles) ? roles.slice() : [],
    businessAccess: businessAccess === true,
    waiterAccess: waiterAccess === true,
    permissions: {
      businessAccess: businessAccess === true,
      waiterAccess: waiterAccess === true
    },
    active: true,
    status: "active",
    updatedAt: BASELINE_UPDATED_AT
  };
}

function buildStaffIndexDoc(persona, restaurantId) {
  return {
    uid: persona.uid,
    restaurantIds: [restaurantId],
    active: true,
    updatedAt: BASELINE_UPDATED_AT
  };
}

function buildMenuItemDoc(item, restaurant) {
  return {
    id: item.id,
    itemId: item.id,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    type: item.type,
    menuSection: item.menuSection,
    imageUrl: item.imageUrl,
    imageUrls: [item.imageUrl],
    available: item.available !== false,
    hidden: false,
    menuHidden: false,
    orderIndex: Number(item.orderIndex || 0),
    cropX: 50,
    cropY: 50,
    updatedAt: BASELINE_UPDATED_AT
  };
}

function buildPublicMenuItem(item) {
  return {
    id: item.id,
    type: item.type,
    menuSection: item.menuSection,
    orderIndex: Number(item.orderIndex || 0),
    category: item.category,
    name: item.name,
    description: item.description,
    ingredients: "",
    longDescription: "",
    allergens: "",
    brand: "",
    sku: "",
    stock: null,
    sizes: [],
    colors: [],
    cropX: 50,
    cropY: 50,
    price: item.price,
    available: item.available !== false,
    hidden: false,
    menuHidden: false,
    statusHidden: false,
    statusVisibility: "auto",
    cardStyle: item.type === "drink" ? "drink" : "food",
    specialSize: "default",
    crossSellItemIds: [],
    specialActionType: "self",
    specialActionUrl: "",
    specialActionProductId: "",
    woltUrl: "",
    imageUrl: item.imageUrl,
    imageUrls: [item.imageUrl]
  };
}

function buildSocialPostDoc(post, restaurant) {
  return {
    id: post.id,
    restaurantId: restaurant.id,
    status: post.status || "active",
    ownerType: "restaurant",
    ownerId: restaurant.id,
    business: restaurant.name,
    businessName: restaurant.name,
    restaurantName: restaurant.name,
    logo: restaurant.logoUrl,
    mediaUrl: post.mediaUrl,
    media: [
      {
        type: "image",
        url: post.mediaUrl
      }
    ],
    caption: post.caption,
    title: "",
    type: "square",
    likesCount: Number(post.likesCount || 0),
    commentsCount: Number(post.commentsCount || 0),
    createdAt: post.createdAt,
    updatedAt: post.createdAt
  };
}

function buildSocialFeedDoc(post, restaurant) {
  return {
    id: post.id,
    restaurantId: restaurant.id,
    status: post.status || "active",
    ownerType: "restaurant",
    ownerId: restaurant.id,
    business: restaurant.name,
    businessName: restaurant.name,
    restaurantName: restaurant.name,
    logo: restaurant.logoUrl,
    mediaUrl: post.mediaUrl,
    media: [
      {
        type: "image",
        url: post.mediaUrl
      }
    ],
    caption: post.caption,
    title: "",
    type: "square",
    likesCount: Number(post.likesCount || 0),
    commentsCount: Number(post.commentsCount || 0),
    createdAt: post.createdAt,
    updatedAt: post.createdAt
  };
}

function buildStoryDoc(story, actorUid) {
  return {
    id: story.id,
    title: "",
    description: story.caption,
    caption: story.caption,
    mediaType: story.mediaType,
    mediaUrl: story.mediaUrl,
    imageUrl: story.mediaType === "image" ? story.mediaUrl : "",
    videoUrl: story.mediaType === "video" ? story.mediaUrl : "",
    status: story.status,
    active: story.active !== false,
    isLive: story.isLive === true,
    createdByUid: actorUid,
    createdAt: story.createdAt,
    updatedAt: story.createdAt
  };
}

function buildOrderDoc(order, restaurant) {
  return {
    id: order.id,
    restaurantId: order.restaurantId,
    businessName: restaurant.name,
    businessAvatar: restaurant.logoUrl,
    serviceMode: order.serviceMode,
    tableNumber: Number(order.tableNumber || 0),
    tableLabel: order.tableLabel,
    buyerUid: order.buyerUid,
    buyerName: order.buyerName,
    buyerHandle: order.buyerHandle,
    buyerAvatar: order.buyerAvatar,
    contact: deepClone(order.contact),
    items: deepClone(order.items),
    itemCount: Number(order.itemCount || 0),
    total: Number(order.total || 0),
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}

function buildNotificationDoc(notification) {
  return {
    id: notification.id,
    type: notification.type,
    user: notification.user,
    userHandle: notification.userHandle,
    userUid: notification.userUid,
    avatar: notification.avatar,
    img: notification.avatar,
    text: notification.text,
    postId: notification.postId || "",
    commentId: notification.commentId || "",
    ownerType: notification.ownerType || "",
    ownerId: notification.ownerId || "",
    restaurantId: notification.restaurantId || "",
    orderId: notification.orderId || "",
    link: notification.link || "",
    read: notification.read === true,
    createdAt: notification.createdAt
  };
}

function buildChatThreadSummaryDoc(thread) {
  const lastMessage = Array.isArray(thread.messages) && thread.messages.length
    ? String(thread.messages[thread.messages.length - 1].text || "").trim()
    : "";
  return {
    uid: thread.partner.uid,
    restaurantId: thread.partner.restaurantId,
    handle: thread.partner.handle,
    name: thread.partner.name,
    avatar: thread.partner.avatar,
    lastMessage,
    unreadCount: Number(thread.unreadCount || 0),
    blockedByOwner: false,
    archivedByOwner: false,
    updatedAt: thread.updatedAt,
    updatedAtClient: thread.updatedAt
  };
}

function buildChatMessageDoc(message, threadOwnerUid) {
  const base = {
    id: message.id,
    from: message.from,
    text: message.text,
    attachments: [],
    liked: false,
    saved: false,
    read: message.read === true,
    senderUid: message.senderUid || (message.from === "self" ? threadOwnerUid : ""),
    senderHandle: message.senderHandle || "",
    senderName: message.senderName || "",
    senderAvatar: message.senderAvatar || "",
    createdAt: message.createdAt,
    createdAtClient: message.createdAt
  };
  return base;
}

function buildSuperadminDoc(persona, {
  parentUid,
  rootUid,
  ceoPath,
  lat = 48.2082,
  lng = 16.3738
} = {}) {
  return {
    uid: persona.uid,
    userId: persona.uid,
    name: persona.displayName,
    displayName: persona.displayName,
    firstName: persona.firstName,
    lastName: persona.lastName,
    email: persona.email,
    handle: persona.handle,
    avatar: persona.avatarUrl,
    role: "ceo",
    roles: ["ceo"],
    status: "active",
    createdByUid: parentUid,
    ceoParentUid: parentUid,
    ceoRootUid: rootUid,
    ceoPath: Array.isArray(ceoPath) ? ceoPath.slice() : [],
    location: {
      lat,
      lng
    },
    updatedAt: BASELINE_UPDATED_AT
  };
}

function buildLeadDoc(lead) {
  return {
    id: lead.id,
    businessName: lead.businessName,
    customerType: lead.customerType,
    contactName: lead.contactName,
    phone: lead.phone,
    instagram: "",
    insta: "",
    email: lead.email,
    city: lead.city,
    address: lead.address,
    logoUrl: lead.logoUrl,
    status: lead.status,
    restaurantId: lead.restaurantId,
    createdByUid: lead.createdByUid,
    ceoParentUid: lead.ceoParentUid,
    ceoRootUid: lead.ceoRootUid,
    ceoPath: Array.isArray(lead.ceoPath) ? lead.ceoPath.slice() : [],
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt
  };
}

function buildManifestSummary(docs = [], authUsers = []) {
  const docCountsByCollection = {};
  for (const doc of docs) {
    const collectionPath = collectionPathFromDocPath(doc.path);
    docCountsByCollection[collectionPath] = (docCountsByCollection[collectionPath] || 0) + 1;
  }
  return {
    docCount: docs.length,
    authUserCount: authUsers.length,
    docCountsByCollection
  };
}

function buildPhase1TestWorldManifest() {
  const personas = deepClone(fixture.personas);
  const supportUsers = deepClone(fixture.supportUsers);
  const restaurants = deepClone(fixture.restaurants);
  const menuItems = deepClone(fixture.menuItems);
  const posts = deepClone(fixture.posts);
  const stories = deepClone(fixture.stories);
  const menuSocial = deepClone(fixture.menuSocial);
  const notifications = deepClone(fixture.notifications);
  const chatThreads = deepClone(fixture.chatThreads);
  const leads = deepClone(fixture.leads);
  const docs = [];

  const authUsers = [
    personas.ceo,
    supportUsers.ceoStaff,
    personas.business,
    personas.staff,
    personas.user
  ].map((persona) => ({
    uid: persona.uid,
    email: persona.email,
    password: persona.password,
    displayName: persona.displayName
  }));

  docs.push(createManagedDoc(
    `users/${personas.ceo.uid}`,
    "persona-user",
    buildUserDoc(personas.ceo, {
      role: "ceo",
      roles: ["ceo"],
      ceoParentUid: personas.ceo.uid,
      ceoRootUid: personas.ceo.uid,
      ceoPath: [personas.ceo.uid]
    })
  ));
  docs.push(createManagedDoc(
    `users/${supportUsers.ceoStaff.uid}`,
    "support-user",
    buildUserDoc(supportUsers.ceoStaff, {
      role: "ceo",
      roles: ["ceo"],
      ceoParentUid: personas.ceo.uid,
      ceoRootUid: personas.ceo.uid,
      ceoPath: [personas.ceo.uid, supportUsers.ceoStaff.uid]
    })
  ));
  docs.push(createManagedDoc(
    `users/${personas.business.uid}`,
    "persona-user",
    buildUserDoc(personas.business, {
      role: "business",
      roles: ["owner", "business"],
      restaurantId: restaurants.alpha.id,
      businessAccess: true
    })
  ));
  docs.push(createManagedDoc(
    `users/${personas.staff.uid}`,
    "persona-user",
    buildUserDoc(personas.staff, {
      role: "staff",
      roles: ["staff"],
      restaurantId: restaurants.alpha.id,
      staffRestaurantId: restaurants.alpha.id,
      waiterRestaurantId: restaurants.alpha.id,
      waiterAccess: true
    })
  ));
  docs.push(createManagedDoc(
    `users/${personas.user.uid}`,
    "persona-user",
    buildUserDoc(personas.user)
  ));

  docs.push(createManagedDoc(
    `superadmins/${personas.ceo.uid}`,
    "ceo-record",
    buildSuperadminDoc(personas.ceo, {
      parentUid: personas.ceo.uid,
      rootUid: personas.ceo.uid,
      ceoPath: [personas.ceo.uid]
    })
  ));
  docs.push(createManagedDoc(
    `superadmins/${supportUsers.ceoStaff.uid}`,
    "ceo-record",
    buildSuperadminDoc(supportUsers.ceoStaff, {
      parentUid: personas.ceo.uid,
      rootUid: personas.ceo.uid,
      ceoPath: [personas.ceo.uid, supportUsers.ceoStaff.uid],
      lat: 47.0707,
      lng: 15.4395
    })
  ));

  docs.push(createManagedDoc(
    `staffIndex/${personas.business.uid}`,
    "staff-index",
    buildStaffIndexDoc(personas.business, restaurants.alpha.id)
  ));
  docs.push(createManagedDoc(
    `staffIndex/${personas.staff.uid}`,
    "staff-index",
    buildStaffIndexDoc(personas.staff, restaurants.alpha.id)
  ));

  docs.push(createManagedDoc(
    `restaurants/${restaurants.alpha.id}`,
    "restaurant",
    buildRestaurantDoc(restaurants.alpha)
  ));
  docs.push(createManagedDoc(
    `restaurants/${restaurants.beta.id}`,
    "restaurant",
    buildRestaurantDoc(restaurants.beta)
  ));
  docs.push(createManagedDoc(
    `restaurants/${restaurants.crm1.id}`,
    "customer-restaurant",
    buildRestaurantDoc(restaurants.crm1, {
      leadId: leads[0].id,
      createdByUid: personas.ceo.uid,
      ceoParentUid: personas.ceo.uid,
      ceoRootUid: personas.ceo.uid,
      ceoPath: [personas.ceo.uid]
    })
  ));

  docs.push(createManagedDoc(
    `restaurants/${restaurants.alpha.id}/staff/${personas.business.uid}`,
    "restaurant-staff",
    buildRestaurantStaffDoc(personas.business, restaurants.alpha, {
      role: "owner",
      roles: ["owner", "staff"],
      businessAccess: true
    })
  ));
  docs.push(createManagedDoc(
    `restaurants/${restaurants.alpha.id}/staff/${personas.staff.uid}`,
    "restaurant-staff",
    buildRestaurantStaffDoc(personas.staff, restaurants.alpha, {
      role: "waiter",
      roles: ["staff"],
      waiterAccess: true
    })
  ));

  docs.push(createManagedDoc(
    `restaurants/${restaurants.alpha.id}/public/meta`,
    "public-meta",
    {
      menuStatusBadgeVisible: true,
      updatedAt: BASELINE_UPDATED_AT
    }
  ));
  docs.push(createManagedDoc(
    `restaurants/${restaurants.beta.id}/public/meta`,
    "public-meta",
    {
      menuStatusBadgeVisible: true,
      updatedAt: BASELINE_UPDATED_AT
    }
  ));
  docs.push(createManagedDoc(
    `restaurants/${restaurants.crm1.id}/public/meta`,
    "public-meta",
    {
      menuStatusBadgeVisible: true,
      updatedAt: BASELINE_UPDATED_AT
    }
  ));

  docs.push(createManagedDoc(
    `restaurants/${restaurants.alpha.id}/public/menu`,
    "public-menu",
    {
      items: menuItems.alpha.map((item) => buildPublicMenuItem(item)),
      publishedAt: BASELINE_UPDATED_AT
    }
  ));
  docs.push(createManagedDoc(
    `restaurants/${restaurants.beta.id}/public/menu`,
    "public-menu",
    {
      items: menuItems.beta.map((item) => buildPublicMenuItem(item)),
      publishedAt: BASELINE_UPDATED_AT
    }
  ));

  for (const item of menuItems.alpha) {
    docs.push(createManagedDoc(
      `restaurants/${restaurants.alpha.id}/menuItems/${item.id}`,
      "menu-item",
      buildMenuItemDoc(item, restaurants.alpha)
    ));
  }
  for (const item of menuItems.beta) {
    docs.push(createManagedDoc(
      `restaurants/${restaurants.beta.id}/menuItems/${item.id}`,
      "menu-item",
      buildMenuItemDoc(item, restaurants.beta)
    ));
  }

  for (const post of posts) {
    const restaurant = post.restaurantId === restaurants.alpha.id ? restaurants.alpha : restaurants.beta;
    docs.push(createManagedDoc(
      `socialFeed/${post.id}`,
      "social-feed-post",
      buildSocialFeedDoc(post, restaurant)
    ));
    docs.push(createManagedDoc(
      `restaurants/${restaurant.id}/socialPosts/${post.id}`,
      "restaurant-social-post",
      buildSocialPostDoc(post, restaurant)
    ));
  }

  for (const like of fixture.postInteractions.likes) {
    docs.push(createManagedDoc(
      `restaurants/${like.restaurantId}/socialPosts/${like.postId}/likes/${like.likeId}`,
      "post-like",
      {
        uid: like.uid,
        createdAt: like.createdAt
      }
    ));
  }
  for (const comment of fixture.postInteractions.comments) {
    docs.push(createManagedDoc(
      `restaurants/${comment.restaurantId}/socialPosts/${comment.postId}/comments/${comment.commentId}`,
      "post-comment",
      {
        id: comment.commentId,
        uid: comment.uid,
        user: comment.user,
        handle: comment.handle,
        avatar: comment.avatar,
        text: comment.text,
        likesCount: Number(comment.likesCount || 0),
        replies: [],
        createdAt: comment.createdAt,
        updatedAt: comment.createdAt
      }
    ));
  }

  for (const story of stories) {
    docs.push(createManagedDoc(
      `restaurants/${story.restaurantId}/stories/${story.id}`,
      "story",
      buildStoryDoc(story, personas.business.uid)
    ));
  }

  for (const social of menuSocial) {
    docs.push(createManagedDoc(
      `restaurants/${social.restaurantId}/menuSocial/${social.itemId}`,
      "menu-social",
      {
        itemId: social.itemId,
        restaurantId: social.restaurantId,
        likesCount: Number(social.likesCount || 0),
        commentsCount: Number(social.commentsCount || 0),
        updatedAt: BASELINE_UPDATED_AT
      }
    ));
    for (const like of social.likes || []) {
      docs.push(createManagedDoc(
        `restaurants/${social.restaurantId}/menuSocial/${social.itemId}/likes/${like.likeId}`,
        "menu-social-like",
        {
          uid: like.uid,
          createdAt: like.createdAt
        }
      ));
    }
    for (const comment of social.comments || []) {
      docs.push(createManagedDoc(
        `restaurants/${social.restaurantId}/menuSocial/${social.itemId}/comments/${comment.commentId}`,
        "menu-social-comment",
        {
          id: comment.commentId,
          uid: comment.uid,
          user: comment.user,
          handle: comment.handle,
          avatar: comment.avatar,
          text: comment.text,
          likesCount: Number(comment.likesCount || 0),
          replies: [],
          createdAt: comment.createdAt,
          updatedAt: comment.createdAt
        }
      ));
    }
  }

  docs.push(createManagedDoc(
    `restaurants/${restaurants.alpha.id}/orders/${fixture.orders.guestTable.id}`,
    "restaurant-order",
    buildOrderDoc(fixture.orders.guestTable, restaurants.alpha)
  ));
  docs.push(createManagedDoc(
    `restaurants/${restaurants.alpha.id}/orders/${fixture.orders.userCheckout.id}`,
    "restaurant-order",
    buildOrderDoc(fixture.orders.userCheckout, restaurants.alpha)
  ));
  docs.push(createManagedDoc(
    `users/${personas.user.uid}/orders/${fixture.orders.userCheckout.id}`,
    "user-order",
    buildOrderDoc(fixture.orders.userCheckout, restaurants.alpha)
  ));
  docs.push(createManagedDoc(
    `restaurants/${restaurants.alpha.id}/orders/${fixture.orders.staffOpen.id}`,
    "restaurant-order",
    buildOrderDoc(fixture.orders.staffOpen, restaurants.alpha)
  ));

  for (const notification of notifications.user) {
    docs.push(createManagedDoc(
      `users/${personas.user.uid}/notifications/${notification.id}`,
      "notification",
      buildNotificationDoc(notification)
    ));
  }
  for (const notification of notifications.business) {
    docs.push(createManagedDoc(
      `users/${personas.business.uid}/notifications/${notification.id}`,
      "notification",
      buildNotificationDoc(notification)
    ));
  }

  for (const thread of chatThreads) {
    docs.push(createManagedDoc(
      `users/${thread.ownerUid}/chatThreads/${thread.threadId}`,
      "chat-thread",
      buildChatThreadSummaryDoc(thread)
    ));
    for (const message of thread.messages || []) {
      docs.push(createManagedDoc(
        `users/${thread.ownerUid}/chatThreads/${thread.threadId}/messages/${message.id}`,
        "chat-message",
        buildChatMessageDoc(message, thread.ownerUid)
      ));
    }
  }

  for (const lead of leads) {
    docs.push(createManagedDoc(
      `leads/${lead.id}`,
      "lead",
      buildLeadDoc(lead)
    ));
  }

  const hierarchicalRootDocPaths = [
    `users/${personas.ceo.uid}`,
    `users/${supportUsers.ceoStaff.uid}`,
    `users/${personas.business.uid}`,
    `users/${personas.staff.uid}`,
    `users/${personas.user.uid}`,
    `restaurants/${restaurants.alpha.id}`,
    `restaurants/${restaurants.beta.id}`,
    `restaurants/${restaurants.crm1.id}`
  ];

  return {
    fixture: deepClone(fixture),
    metadata: {
      testWorldId: fixture.testWorldId,
      seedVersion: fixture.seedVersion,
      syntheticIsolationKey: fixture.syntheticIsolationKey,
      managedBy: fixture.managedBy
    },
    authUsers,
    docs,
    hierarchicalRootDocPaths,
    managedTopLevelCollections: [
      "users",
      "restaurants",
      "socialFeed",
      "leads",
      "superadmins",
      "staffIndex"
    ],
    summary: buildManifestSummary(docs, authUsers)
  };
}

module.exports = {
  fixture: deepClone(fixture),
  buildPhase1TestWorldManifest,
  collectionPathFromDocPath,
  lastPathSegment
};
