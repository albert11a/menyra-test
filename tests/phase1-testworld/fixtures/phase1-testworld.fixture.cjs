"use strict";

const alphaRestaurantId = "mnyra-heart-seed-r-alpha";
const betaRestaurantId = "mnyra-heart-seed-r-beta";
const crmRestaurantId = "mnyra-heart-seed-r-crm-1";

const ceoUid = "mnyra-heart-seed-u-ceo-alpha";
const ceoStaffUid = "mnyra-heart-seed-u-ceo-staff-alpha";
const businessUid = "mnyra-heart-seed-u-business-alpha";
const staffUid = "mnyra-heart-seed-u-staff-alpha";
const userUid = "mnyra-heart-seed-u-user-alpha";

const itemAlphaBurgerId = "mnyra-heart-seed-item-alpha-burger";
const itemAlphaColaId = "mnyra-heart-seed-item-alpha-cola";
const itemAlphaCakeId = "mnyra-heart-seed-item-alpha-cake";
const itemBetaPastaId = "mnyra-heart-seed-item-beta-pasta";
const itemBetaTeaId = "mnyra-heart-seed-item-beta-tea";
const itemBetaSpecialId = "mnyra-heart-seed-item-beta-special";

module.exports = {
  seedVersion: "phase1-v1",
  testWorldId: "mnyra-phase1-testworld",
  managedBy: "phase1-testworld",
  syntheticIsolationKey: "phase1-testworld-baseline",
  guest: {
    key: "guest",
    restaurantId: alphaRestaurantId,
    tableNumber: 12,
    tableLabel: "T12",
    menuAccessSource: "qr"
  },
  personas: {
    user: {
      key: "user",
      uid: userUid,
      email: "heart+seed-user-alpha@mnyra.test",
      password: "HeartSeed!User01",
      handle: "seeduseralpha",
      displayName: "Seed User Alpha",
      firstName: "Seed",
      lastName: "User",
      avatarUrl: "https://example.test/assets/seed-user-alpha.jpg",
      role: "user",
      roles: ["user"]
    },
    business: {
      key: "business",
      uid: businessUid,
      email: "heart+seed-business-alpha@mnyra.test",
      password: "HeartSeed!Biz01",
      handle: "seedbizalpha",
      displayName: "Seed Business Alpha",
      firstName: "Seed",
      lastName: "Business",
      avatarUrl: "https://example.test/assets/seed-business-alpha.jpg",
      role: "business",
      roles: ["owner", "business"],
      restaurantId: alphaRestaurantId
    },
    staff: {
      key: "staff",
      uid: staffUid,
      email: "heart+seed-staff-alpha@mnyra.test",
      password: "HeartSeed!Staff01",
      handle: "seedstaffalpha",
      displayName: "Seed Staff Alpha",
      firstName: "Seed",
      lastName: "Staff",
      avatarUrl: "https://example.test/assets/seed-staff-alpha.jpg",
      role: "staff",
      roles: ["staff"],
      restaurantId: alphaRestaurantId
    },
    ceo: {
      key: "ceo",
      uid: ceoUid,
      email: "heart+seed-ceo-alpha@mnyra.test",
      password: "HeartSeed!Ceo01",
      handle: "seedceoalpha",
      displayName: "Seed CEO Alpha",
      firstName: "Seed",
      lastName: "CEO",
      avatarUrl: "https://example.test/assets/seed-ceo-alpha.jpg",
      role: "ceo",
      roles: ["ceo"]
    }
  },
  supportUsers: {
    ceoStaff: {
      key: "ceoStaff",
      uid: ceoStaffUid,
      email: "heart+seed-ceostaff-alpha@mnyra.test",
      password: "HeartSeed!CeoStaff01",
      handle: "seedceostaffalpha",
      displayName: "Seed CEO Staff Alpha",
      firstName: "Seed",
      lastName: "CEOStaff",
      avatarUrl: "https://example.test/assets/seed-ceo-staff-alpha.jpg",
      role: "ceo",
      roles: ["ceo"]
    }
  },
  restaurants: {
    alpha: {
      id: alphaRestaurantId,
      name: "Seed Restaurant Alpha",
      handle: "seed-restaurant-alpha",
      type: "restaurant",
      customerType: "restaurant",
      city: "Vienna",
      address: "Alpha Street 1",
      ownerUid: businessUid,
      ownerEmail: "heart+seed-business-alpha@mnyra.test",
      phone: "+43100000001",
      logoUrl: "https://example.test/assets/seed-restaurant-alpha-logo.png",
      coverUrl: "https://example.test/assets/seed-restaurant-alpha-cover.jpg",
      status: "active"
    },
    beta: {
      id: betaRestaurantId,
      name: "Seed Restaurant Beta",
      handle: "seed-restaurant-beta",
      type: "cafe",
      customerType: "cafe",
      city: "Graz",
      address: "Beta Street 2",
      ownerUid: "mnyra-heart-seed-u-business-beta-shadow",
      ownerEmail: "heart+seed-business-beta-shadow@mnyra.test",
      phone: "+43100000002",
      logoUrl: "https://example.test/assets/seed-restaurant-beta-logo.png",
      coverUrl: "https://example.test/assets/seed-restaurant-beta-cover.jpg",
      status: "active"
    },
    crm1: {
      id: crmRestaurantId,
      name: "Seed Customer CRM 1",
      handle: "seed-customer-crm-1",
      type: "cafe",
      customerType: "cafe",
      city: "Linz",
      address: "CRM Street 3",
      ownerUid: "",
      ownerEmail: "heart+seed-customer-crm-1@mnyra.test",
      phone: "+43100000003",
      logoUrl: "https://example.test/assets/seed-customer-crm-1-logo.png",
      coverUrl: "https://example.test/assets/seed-customer-crm-1-cover.jpg",
      status: "kunde"
    }
  },
  menuItems: {
    alpha: [
      {
        id: itemAlphaBurgerId,
        name: "Seed Alpha Burger",
        description: "Seed alpha burger item.",
        price: "12.90",
        category: "Main",
        type: "food",
        menuSection: "food",
        imageUrl: "https://example.test/assets/menu-alpha-burger.jpg",
        available: true,
        orderIndex: 0
      },
      {
        id: itemAlphaColaId,
        name: "Seed Alpha Cola",
        description: "Seed alpha cola item.",
        price: "3.90",
        category: "Drinks",
        type: "drink",
        menuSection: "drink",
        imageUrl: "https://example.test/assets/menu-alpha-cola.jpg",
        available: true,
        orderIndex: 1
      },
      {
        id: itemAlphaCakeId,
        name: "Seed Alpha Cake",
        description: "Seed alpha cake item.",
        price: "5.50",
        category: "Dessert",
        type: "food",
        menuSection: "food",
        imageUrl: "https://example.test/assets/menu-alpha-cake.jpg",
        available: false,
        orderIndex: 2
      }
    ],
    beta: [
      {
        id: itemBetaPastaId,
        name: "Seed Beta Pasta",
        description: "Seed beta pasta item.",
        price: "14.40",
        category: "Main",
        type: "food",
        menuSection: "food",
        imageUrl: "https://example.test/assets/menu-beta-pasta.jpg",
        available: true,
        orderIndex: 0
      },
      {
        id: itemBetaTeaId,
        name: "Seed Beta Tea",
        description: "Seed beta tea item.",
        price: "4.20",
        category: "Drinks",
        type: "drink",
        menuSection: "drink",
        imageUrl: "https://example.test/assets/menu-beta-tea.jpg",
        available: true,
        orderIndex: 1
      },
      {
        id: itemBetaSpecialId,
        name: "Seed Beta Special",
        description: "Seed beta special item.",
        price: "8.80",
        category: "Special",
        type: "food",
        menuSection: "food",
        imageUrl: "https://example.test/assets/menu-beta-special.jpg",
        available: true,
        orderIndex: 2
      }
    ]
  },
  posts: [
    {
      id: "mnyra-heart-seed-post-alpha-1",
      restaurantId: alphaRestaurantId,
      status: "active",
      caption: "TEST_SEED_POST_ALPHA_1",
      createdAt: "2026-03-28T08:00:00.000Z",
      mediaUrl: "https://example.test/assets/post-alpha-1.jpg",
      likesCount: 1,
      commentsCount: 1
    },
    {
      id: "mnyra-heart-seed-post-alpha-2",
      restaurantId: alphaRestaurantId,
      status: "active",
      caption: "TEST_SEED_POST_ALPHA_2",
      createdAt: "2026-03-28T08:10:00.000Z",
      mediaUrl: "https://example.test/assets/post-alpha-2.jpg",
      likesCount: 0,
      commentsCount: 0
    },
    {
      id: "mnyra-heart-seed-post-beta-1",
      restaurantId: betaRestaurantId,
      status: "active",
      caption: "TEST_SEED_POST_BETA_1",
      createdAt: "2026-03-28T08:20:00.000Z",
      mediaUrl: "https://example.test/assets/post-beta-1.jpg",
      likesCount: 0,
      commentsCount: 0
    }
  ],
  postInteractions: {
    likes: [
      {
        restaurantId: alphaRestaurantId,
        postId: "mnyra-heart-seed-post-alpha-1",
        likeId: userUid,
        uid: userUid,
        createdAt: "2026-03-28T08:30:00.000Z"
      }
    ],
    comments: [
      {
        restaurantId: alphaRestaurantId,
        postId: "mnyra-heart-seed-post-alpha-1",
        commentId: "mnyra-heart-seed-comment-alpha-1",
        uid: userUid,
        user: "Seed User Alpha",
        handle: "seeduseralpha",
        avatar: "https://example.test/assets/seed-user-alpha.jpg",
        text: "TEST_SEED_COMMENT_ALPHA_1",
        createdAt: "2026-03-28T08:31:00.000Z",
        likesCount: 0
      }
    ]
  },
  stories: [
    {
      id: "mnyra-heart-seed-story-alpha-live-1",
      restaurantId: alphaRestaurantId,
      caption: "TEST_SEED_STORY_ALPHA_LIVE_1",
      createdAt: "2026-03-28T07:55:00.000Z",
      mediaUrl: "https://example.test/assets/story-alpha-live-1.jpg",
      mediaType: "image",
      status: "active",
      active: true,
      isLive: true
    },
    {
      id: "mnyra-heart-seed-story-alpha-hidden-1",
      restaurantId: alphaRestaurantId,
      caption: "TEST_SEED_STORY_ALPHA_HIDDEN_1",
      createdAt: "2026-03-27T07:55:00.000Z",
      mediaUrl: "https://example.test/assets/story-alpha-hidden-1.jpg",
      mediaType: "image",
      status: "archived",
      active: false,
      isLive: false
    }
  ],
  menuSocial: [
    {
      restaurantId: alphaRestaurantId,
      itemId: itemAlphaBurgerId,
      likesCount: 1,
      commentsCount: 1,
      likes: [
        {
          likeId: userUid,
          uid: userUid,
          createdAt: "2026-03-28T08:40:00.000Z"
        }
      ],
      comments: [
        {
          commentId: "mnyra-heart-seed-menu-comment-alpha-burger-1",
          uid: userUid,
          user: "Seed User Alpha",
          handle: "seeduseralpha",
          avatar: "https://example.test/assets/seed-user-alpha.jpg",
          text: "TEST_SEED_MENU_COMMENT_ALPHA_BURGER_1",
          createdAt: "2026-03-28T08:41:00.000Z",
          likesCount: 0
        }
      ]
    }
  ],
  orders: {
    guestTable: {
      id: "mnyra-heart-seed-order-alpha-table-1",
      restaurantId: alphaRestaurantId,
      serviceMode: "table",
      tableNumber: 12,
      tableLabel: "T12",
      buyerUid: "",
      buyerName: "Guest Alpha",
      buyerHandle: "",
      buyerAvatar: "",
      contact: {
        name: "Guest Alpha",
        phone: "+43000000000",
        city: "Vienna",
        address: "Guest Table Alpha",
        tableNumber: 12,
        tableLabel: "T12"
      },
      items: [
        {
          id: itemAlphaBurgerId,
          itemId: itemAlphaBurgerId,
          cartKey: itemAlphaBurgerId,
          name: "Seed Alpha Burger",
          price: "12.90",
          quantity: 1,
          imageUrl: "https://example.test/assets/menu-alpha-burger.jpg",
          category: "Main"
        }
      ],
      itemCount: 1,
      total: 12.9,
      status: "Neu",
      createdAt: "2026-03-28T09:00:00.000Z",
      updatedAt: "2026-03-28T09:00:00.000Z"
    },
    userCheckout: {
      id: "mnyra-heart-seed-order-alpha-user-1",
      restaurantId: alphaRestaurantId,
      serviceMode: "pickup",
      tableNumber: 0,
      tableLabel: "",
      buyerUid: userUid,
      buyerName: "Seed User Alpha",
      buyerHandle: "seeduseralpha",
      buyerAvatar: "https://example.test/assets/seed-user-alpha.jpg",
      contact: {
        name: "Seed User Alpha",
        phone: "+43111111111",
        city: "Vienna",
        address: "Pickup Alpha 1",
        tableNumber: 0,
        tableLabel: ""
      },
      items: [
        {
          id: itemAlphaColaId,
          itemId: itemAlphaColaId,
          cartKey: itemAlphaColaId,
          name: "Seed Alpha Cola",
          price: "3.90",
          quantity: 2,
          imageUrl: "https://example.test/assets/menu-alpha-cola.jpg",
          category: "Drinks"
        }
      ],
      itemCount: 2,
      total: 7.8,
      status: "Neu",
      createdAt: "2026-03-28T09:05:00.000Z",
      updatedAt: "2026-03-28T09:05:00.000Z"
    },
    staffOpen: {
      id: "mnyra-heart-seed-order-alpha-open-1",
      restaurantId: alphaRestaurantId,
      serviceMode: "table",
      tableNumber: 15,
      tableLabel: "T15",
      buyerUid: "",
      buyerName: "Guest Open Alpha",
      buyerHandle: "",
      buyerAvatar: "",
      contact: {
        name: "Guest Open Alpha",
        phone: "+43222222222",
        city: "Vienna",
        address: "Open Table Alpha",
        tableNumber: 15,
        tableLabel: "T15"
      },
      items: [
        {
          id: itemAlphaBurgerId,
          itemId: itemAlphaBurgerId,
          cartKey: itemAlphaBurgerId,
          name: "Seed Alpha Burger",
          price: "12.90",
          quantity: 1,
          imageUrl: "https://example.test/assets/menu-alpha-burger.jpg",
          category: "Main"
        },
        {
          id: itemAlphaColaId,
          itemId: itemAlphaColaId,
          cartKey: itemAlphaColaId,
          name: "Seed Alpha Cola",
          price: "3.90",
          quantity: 1,
          imageUrl: "https://example.test/assets/menu-alpha-cola.jpg",
          category: "Drinks"
        }
      ],
      itemCount: 2,
      total: 16.8,
      status: "In Bearbeitung",
      createdAt: "2026-03-28T09:10:00.000Z",
      updatedAt: "2026-03-28T09:10:00.000Z"
    }
  },
  notifications: {
    user: [
      {
        id: "mnyra-heart-seed-notif-chat-1",
        type: "chat_message",
        user: "Seed Restaurant Alpha",
        userHandle: "seedbizalpha",
        userUid: businessUid,
        avatar: "https://example.test/assets/seed-restaurant-alpha-logo.png",
        text: "TEST_SEED_CHAT_NOTIFICATION_1",
        ownerType: "chat",
        ownerId: businessUid,
        link: "/apps/menyra-social/?tab=chat&chat=mnyra-heart-seed-u-business-alpha",
        read: false,
        createdAt: "2026-03-28T09:15:00.000Z"
      },
      {
        id: "mnyra-heart-seed-notif-follow-request-1",
        type: "follow_request",
        user: "Seed Staff Alpha",
        userHandle: "seedstaffalpha",
        userUid: staffUid,
        avatar: "https://example.test/assets/seed-staff-alpha.jpg",
        text: "moechte dir folgen",
        read: false,
        createdAt: "2026-03-28T09:16:00.000Z"
      },
      {
        id: "mnyra-heart-seed-notif-follow-accepted-1",
        type: "follow_accepted",
        user: "Seed CEO Staff Alpha",
        userHandle: "seedceostaffalpha",
        userUid: ceoStaffUid,
        avatar: "https://example.test/assets/seed-ceo-staff-alpha.jpg",
        text: "hat deine Anfrage akzeptiert",
        read: true,
        createdAt: "2026-03-28T09:17:00.000Z"
      }
    ],
    business: [
      {
        id: "mnyra-heart-seed-notif-like-alpha-1",
        type: "like",
        user: "Seed User Alpha",
        userHandle: "seeduseralpha",
        userUid: userUid,
        avatar: "https://example.test/assets/seed-user-alpha.jpg",
        text: "hat deinen Beitrag geliked",
        postId: "mnyra-heart-seed-post-alpha-1",
        ownerType: "restaurant",
        ownerId: alphaRestaurantId,
        restaurantId: alphaRestaurantId,
        read: false,
        createdAt: "2026-03-28T09:18:00.000Z"
      },
      {
        id: "mnyra-heart-seed-notif-comment-alpha-1",
        type: "comment",
        user: "Seed User Alpha",
        userHandle: "seeduseralpha",
        userUid: userUid,
        avatar: "https://example.test/assets/seed-user-alpha.jpg",
        text: "hat deinen Beitrag kommentiert",
        postId: "mnyra-heart-seed-post-alpha-1",
        commentId: "mnyra-heart-seed-comment-alpha-1",
        ownerType: "restaurant",
        ownerId: alphaRestaurantId,
        restaurantId: alphaRestaurantId,
        read: false,
        createdAt: "2026-03-28T09:19:00.000Z"
      },
      {
        id: "mnyra-heart-seed-notif-order-alpha-1",
        type: "order",
        user: "Guest Alpha",
        userHandle: "",
        userUid: "",
        avatar: "",
        text: "Neue Bestellung",
        restaurantId: alphaRestaurantId,
        orderId: "mnyra-heart-seed-order-alpha-table-1",
        read: false,
        createdAt: "2026-03-28T09:20:00.000Z"
      }
    ]
  },
  chatThreads: [
    {
      ownerUid: userUid,
      threadId: businessUid,
      partner: {
        uid: businessUid,
        restaurantId: alphaRestaurantId,
        handle: "seedbizalpha",
        name: "Seed Restaurant Alpha",
        avatar: "https://example.test/assets/seed-restaurant-alpha-logo.png"
      },
      unreadCount: 1,
      updatedAt: "2026-03-28T09:21:00.000Z",
      messages: [
        {
          id: "mnyra-heart-seed-chat-user-business-1",
          from: "self",
          text: "TEST_SEED_CHAT_USER_TO_BUSINESS_1",
          read: true,
          createdAt: "2026-03-28T09:00:00.000Z"
        },
        {
          id: "mnyra-heart-seed-chat-user-business-2",
          from: "other",
          text: "TEST_SEED_CHAT_BUSINESS_TO_USER_1",
          read: false,
          senderUid: businessUid,
          senderHandle: "seedbizalpha",
          senderName: "Seed Restaurant Alpha",
          senderAvatar: "https://example.test/assets/seed-restaurant-alpha-logo.png",
          createdAt: "2026-03-28T09:21:00.000Z"
        }
      ]
    },
    {
      ownerUid: businessUid,
      threadId: userUid,
      partner: {
        uid: userUid,
        restaurantId: "",
        handle: "seeduseralpha",
        name: "Seed User Alpha",
        avatar: "https://example.test/assets/seed-user-alpha.jpg"
      },
      unreadCount: 0,
      updatedAt: "2026-03-28T09:21:00.000Z",
      messages: [
        {
          id: "mnyra-heart-seed-chat-user-business-1",
          from: "other",
          text: "TEST_SEED_CHAT_USER_TO_BUSINESS_1",
          read: true,
          senderUid: userUid,
          senderHandle: "seeduseralpha",
          senderName: "Seed User Alpha",
          senderAvatar: "https://example.test/assets/seed-user-alpha.jpg",
          createdAt: "2026-03-28T09:00:00.000Z"
        },
        {
          id: "mnyra-heart-seed-chat-user-business-2",
          from: "self",
          text: "TEST_SEED_CHAT_BUSINESS_TO_USER_1",
          read: true,
          createdAt: "2026-03-28T09:21:00.000Z"
        }
      ]
    },
    {
      ownerUid: userUid,
      threadId: staffUid,
      partner: {
        uid: staffUid,
        restaurantId: alphaRestaurantId,
        handle: "seedstaffalpha",
        name: "Seed Staff Alpha",
        avatar: "https://example.test/assets/seed-staff-alpha.jpg"
      },
      unreadCount: 0,
      updatedAt: "2026-03-28T09:22:00.000Z",
      messages: [
        {
          id: "mnyra-heart-seed-chat-user-staff-1",
          from: "self",
          text: "TEST_SEED_CHAT_USER_TO_STAFF_1",
          read: true,
          createdAt: "2026-03-28T09:22:00.000Z"
        }
      ]
    },
    {
      ownerUid: staffUid,
      threadId: userUid,
      partner: {
        uid: userUid,
        restaurantId: "",
        handle: "seeduseralpha",
        name: "Seed User Alpha",
        avatar: "https://example.test/assets/seed-user-alpha.jpg"
      },
      unreadCount: 1,
      updatedAt: "2026-03-28T09:22:00.000Z",
      messages: [
        {
          id: "mnyra-heart-seed-chat-user-staff-1",
          from: "other",
          text: "TEST_SEED_CHAT_USER_TO_STAFF_1",
          read: false,
          senderUid: userUid,
          senderHandle: "seeduseralpha",
          senderName: "Seed User Alpha",
          senderAvatar: "https://example.test/assets/seed-user-alpha.jpg",
          createdAt: "2026-03-28T09:22:00.000Z"
        }
      ]
    }
  ],
  leads: [
    {
      id: "mnyra-heart-seed-lead-own-1",
      businessName: "Seed Lead Own 1",
      customerType: "cafe",
      contactName: "Owner Lead One",
      phone: "+43333333333",
      email: "lead-own-1@mnyra.test",
      city: "Linz",
      address: "Lead Street 10",
      logoUrl: "https://example.test/assets/seed-lead-own-1.png",
      status: "kunde",
      restaurantId: crmRestaurantId,
      createdByUid: ceoUid,
      ceoParentUid: ceoUid,
      ceoRootUid: ceoUid,
      ceoPath: [ceoUid],
      createdAt: "2026-03-28T09:30:00.000Z",
      updatedAt: "2026-03-28T09:30:00.000Z"
    },
    {
      id: "mnyra-heart-seed-lead-staff-1",
      businessName: "Seed Lead Staff 1",
      customerType: "restaurant",
      contactName: "Owner Lead Two",
      phone: "+43444444444",
      email: "lead-staff-1@mnyra.test",
      city: "Salzburg",
      address: "Lead Street 20",
      logoUrl: "https://example.test/assets/seed-lead-staff-1.png",
      status: "neu",
      restaurantId: "",
      createdByUid: ceoStaffUid,
      ceoParentUid: ceoUid,
      ceoRootUid: ceoUid,
      ceoPath: [ceoUid, ceoStaffUid],
      createdAt: "2026-03-28T09:31:00.000Z",
      updatedAt: "2026-03-28T09:31:00.000Z"
    }
  ]
};
