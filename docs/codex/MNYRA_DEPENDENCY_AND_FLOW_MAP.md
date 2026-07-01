# Mnyra Dependency And Flow Map

Status: CURRENT
Last updated: 2026-07-01

## App Map

- Social app: `apps/menyra-social/social-app.js`
- Public entry: `apps/menyra-social/social-public-entry.js`
- Public bundled entry: `apps/menyra-social/social-public-bundled-entry.js`
- Heart app: `apps/mnyra-heart/heart.js`
- Waiter app: `apps/waiter/waiter-app.js`
- Firebase Functions: `functions/index.js`, `functions/heart/*`
- Shared code: `shared/*`

## Public Profile / Menu / QR

Important files:

- `apps/menyra-social/core/router/public-business-route-resolver.js`
- `apps/menyra-social/core/router/public-route-doc-reader.js`
- `apps/menyra-social/core/app-shell/public-route-runtime-cluster.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
- `apps/menyra-social/core/profile/public-profile-surface-controller.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js`
- `apps/menyra-social/core/menu/focus-runtime-controller.js`
- `apps/menyra-social/core/menu/table-qr-runtime-controller.js`
- `apps/menyra-social/core/orders/orders-runtime-controller.js`

Known Firestore surfaces:

- `publicRoutes/{slug}`
- `restaurants/{restaurantId}`
- `restaurants/{restaurantId}/public/{publicDocId}`
- `restaurants/{restaurantId}/menuItems/{itemId}`
- `restaurants/{restaurantId}/menuSocial/{itemId}`
- `restaurants/{restaurantId}/socialPosts/{postId}`
- `restaurants/{restaurantId}/stories/{storyId}`
- `restaurants/{restaurantId}/orders/{orderId}`
- `restaurants/{restaurantId}/orderLookup/{lookupToken}`

## Feed / Social Engagement

Important files:

- `apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
- `apps/menyra-social/core/feed/feed-visibility-runtime-cluster.js`
- `apps/menyra-social/core/feed/post-doc-normalize-utils.js`
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`
- `apps/menyra-social/core/profile/social-engagement-support-runtime-controller.js`

Known Firestore surfaces:

- `socialFeed/{postId}`
- `users/{userId}/posts/{postId}`
- `users/{userId}/posts/{postId}/likes/{likeId}`
- `users/{userId}/posts/{postId}/comments/{commentId}`
- `restaurants/{restaurantId}/socialPosts/{postId}`

## Travel

Important files:

- `apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/core/marketplace/marketplace-runtime-boundary.js`

Known data shape is currently coupled to marketplace/business profile data and
must be mapped before extraction.

## Shopping

Important files:

- `apps/menyra-social/core/marketplace/shopping-view-event-bindings.js`
- `apps/menyra-social/core/profile/shopping-landing-card-editor-bindings.js`
- `apps/menyra-social/core/shop/shop-cart-state-utils.js`
- `apps/menyra-social/core/shop/shop-view-cart-orchestration-controller.js`

Known Firestore surfaces overlap with restaurant/business profile docs, menu
items/products, cart/order state and public business identity.

## Owner Tool

Important files:

- `apps/menyra-social/core/menu/menu-save-utils.js`
- `apps/menyra-social/core/menu/menu-delete-utils.js`
- `apps/menyra-social/core/menu/ads-runtime-controller.js`
- `apps/menyra-social/core/business-accounts/business-accounts-runtime-controller.js`
- `apps/menyra-social/core/crm/crm-admin-*.js`

Critical client writes must be inventoried before extraction.

## Waiter

Important files:

- `apps/waiter/waiter-app.js`
- `restaurants/{restaurantId}/orders/{orderId}`
- `restaurants/{restaurantId}/staff/{staffUid}`
- `users/{uid}` staff records

Security ownership is restaurant staff access, not public guest access.

## Heart / CRM

Important files:

- `apps/mnyra-heart/heart.js`
- `apps/mnyra-heart/heart-api-client.js`
- `apps/mnyra-heart/heart-crm-admin-*.js`
- `functions/heart/*`
- `shared/heart-pack-catalog.js`
- `shared/github-execution-state.js`

Known Firestore surfaces:

- `leads/{leadId}`
- `superadmins/{uid}`
- `staffAdmins/{uid}`
- `staffIndex/{uid}`
- CRM-related restaurant and user records

## Strong Coupling To Watch

- Public profile and public menu share route identity, canonical restaurant ID,
  focus/menu state and QR table context.
- Shopping and restaurant menu/product flows share editor and display surfaces.
- Feed and profile engagement share counter updates.
- Owner writes and public reads share restaurant document structure.
- Heart/CRM reads and writes overlap with business account lifecycle.
