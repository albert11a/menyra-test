Current exact next step:
Execute Batch 3B Firestore validation in emulator/staging (no deploy yet), running the documented auth/public/business/chat/CRM smoke checklist and collecting pass/fail evidence per path.

Why this is the next step:
Rules are now hardened in source, but local emulator execution is currently blocked on this machine (`java` missing), so production safety requires a verified staging/emulator pass before any rules deployment.
Critical missing item: there is no completed runtime validation proof yet for the new ruleset.
Note: main manual flows (guest/user/business/lead and part of legacy CEO flow) have already passed.

What must be checked before doing it:
- Install/enable Java for Firestore emulator or run equivalent staging validation environment.
- Validate these path groups explicitly:
  - public reads: `socialFeed`, `restaurants`, `restaurants/*/public`, `stories`, `menuItems`, `menuSocial`
  - auth/self: `users/{uid}` + subcollections (`notifications`, `following`, `followRequests`, `chatThreads`, `orders`, `menuFavorites`, `posts`)
  - business/team writes: restaurant profile/public/menu/posts/stories/orders/staff paths
  - CRM/admin: `leads`, `superadmins`, `staffAdmins`, `staffIndex`
- Run negative test: changing `users/{uid}.restaurantId` must not grant restaurant write rights.

What must not be broken:
- Guest first-load feed/story/menu/read behavior.
- Signed-in social flows (follow request/accept, notifications, chat send/read, likes/comments).
- Checkout writes (guest restaurant order + signed-in mirrored user order).
- CEO/CRM workflows that use existing scoped queries.
