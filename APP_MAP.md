Status: CURRENT
Branch: main
Stand: 2026-06-29

# MNYRA App Map

Diese Karte basiert auf statischer Codeanalyse, `AGENTS.md`, `docs/mnyra-launch-masterplan.md`, `docs/mnyra-current-phase.md`, `vercel.json`, `firestore.rules`, `firebase.json`, `package.json` und den vorhandenen Tests. Keine Production-Daten wurden veraendert.

## Routes und Redirects

### Vercel/Public Routes

- `/` redirectet nach `/feed`.
- App-Routen: `/feed`, `/restaurants`, `/travel`, `/shopping`, `/search`, `/map`, `/location`, `/profile`, `/menu`, `/orders`, `/notifications`, `/settings`, `/upload`, `/staff`, `/business-accounts`, `/businessaccounts`, `/chat`, `/login`, `/register`.
- Rollen-/Alias-Routen: `/ceo`, `/admin`, `/owner`, `/staff`, `/kitchen`, `/leads`, `/customers`.
- Public/Restaurant: `/:landingSlug`, `/:landingSlug/:surface`, `/lp/:restaurantId`, `/user/:id`, `/user/:id/:surface`.
- Legacy Public: `/b/:slug`, `/b/:slug/menu`, `/b/:slug/posts`, `/b/:slug/qr`.
- Waiter: `/waiter`, `/waiter/:path*`, `/waiter/sw.js`, `/waiter/manifest.webmanifest`.
- Heart/Hub: `/heart`, `/heart/:path*`, `/hub`.
- `/discover` redirectet nach `/search`; `/social` redirectet nach `/feed`.
- App asset/static routes: `/apps/menyra-social/:path*`, `/apps/mnyra-heart/:path*`, `/apps/waiter/:path*`, `/shared/:path*`.

### Runtime Route Mapping

- `route-runtime-registry.js` trennt `feed`, `restaurants`, `travel`, `shopping`, `search`, `map`, `staff`, `businessAccounts`, `publicBusiness`, `publicMenu`, `defaultSocial`.
- `public-business-route-utils.js` reserviert System-Segmente wie `feed`, `search`, `admin`, `ceo`, `owner`, `staff`, `kitchen`, `profile`, `menu`, `orders`, `login`, `register`, `robots.txt`, `sitemap.xml`.
- QR/Menu-Kontext nutzt Query-Keys `src`, `source`, `menuSource`, `menuAccessSource`, `access` und `table`, `tableNumber`, `t`.
- Launch Alias: `casarita`/`casa-rita` mappt auf Restaurant `Lzm6RpNu3ErSDtGCHxpi`.

## Tabs und Hauptbereiche

- Sichtbare Haupttabs: `feed`, `restaurants`, `travel`, `shopping`, `chat`, `search`, `map`, `location`, `profile`, `menu`, `orders`, `notifications`, `upload`, `staff`, `businessAccounts`, `settings`.
- Public Profile Top Tabs: `profile`, `menu`.
- Profil Content Tabs: Posts/Media/Menu je nach Profiltyp.
- Menu/Shop Flows: public menu, focus/offers, product detail, favorites, cart, checkout.
- Staff/Business Bereiche: staff list/editor, business accounts, CRM/leads/customers, waiter/order views.

## Rollen und Personas

- Normale User: `user`.
- Business/Restaurant: `business`, Restaurant Owner via `ownerUid`/Owner-Mail-Felder.
- Staff/Waiter: `staff`, `waiter`, `manager`, permissions `businessAccess`, `waiterAccess`.
- CEO/Admin: `ceo`, `superadmin`, global CEO UID `aklBkkIuZ7Nrpx266TJn63rrxX62`.
- Guest ohne Login: public/QR/menu/cart guest scope.
- Eigenstaendige `kitchen` Rolle wurde im Code nicht als Security-Rolle eindeutig gefunden; `/kitchen` mappt produktseitig auf Menu/Kitchen-Oberflaeche.

## Auth-Flows

- Firebase Auth wird mit persistenten Browser-Persistenzen initialisiert.
- Startup nutzt Auth Bootstrap Snapshot und Shell Snapshot, aber nur UID-gebunden.
- `resetUserScopedState()` setzt beim UID-Wechsel/Logout Profile, Posts, Cart, Orders, Staff, Business Accounts, Menu Detail, Post Meta, Entity Map, Avatar Caches und Listener zurueck.
- Offene Testluecke: echter Multi-Account-Browserlauf mit User A -> User B -> Business -> Staff/Waiter/Owner/CEO wurde mangels Staging-Credentials nicht ausgefuehrt.

## Public/Private Bereiche

- Public lesbar: public restaurant/profile/menu, public route docs, social feed, public restaurant content, guest QR/menu.
- Private/rollenbasiert: orders list/update, staff, business account administration, restaurant writes, CRM/Heart admin.
- Risiko: Firestore Rules erlauben aktuell einige sensible Client-Writes zu breit; Details in `SECURITY_FIRESTORE_REPORT.md`.

## LocalStorage Keys

- `menyra_lang`
- `menyra_social_profile_v3::uid`
- `menyra_social_settings_v3`
- `menyra_social_notifications_v1::uid`
- `menyra_social_notifications_v1::push_seen::uid`
- `menyra_social_notifications_v1::push_meta::uid`
- `menyra_social_notifications_v1::push_device_id`
- `menyra_social_following_v1::uid`
- `menyra_social_shop_cart_v1::uid-or-guest`
- `menyra_social_chat_index_v1`, `menyra_social_chat_threads_v1`
- `menyra_social_post_meta_v1`
- `menyra_social_feed_v1`
- `menyra_social_logo_cache_v1`
- `menyra_social_avatar_cache_v1::uid`
- `menyra_social_menu_layout_v1`
- `menyra_social_auth_snapshot_v1`
- `menyra_social_shell_snapshot_v1::uid`
- `menyra_social_feed_cache_v1`, `menyra_social_restaurants_cache_v1`, `menyra_social_restaurants_preview_cache_v1`, `menyra_social_stories_cache_v1`, `menyra_social_menu_cache_v1`
- `menyra_social_user_posts_cache_v2::uid`
- `menyra_social_business_posts_cache_v2::restaurantId`
- `menyra_social_staff_cache_v1::uid`
- `menyra_social_leads_cache_v1::uid::scope`
- `menyra_social_customers_cache_v1::uid::scope`
- `menyra_orders_guest_session_v1`
- `menyra_orders_guest_lookup_index_v1`
- `mnyra_waiter_device_id_v1`
- `mnyra_waiter_access_v1:*`
- Debug/aux: `menyra_social_perf_warm_v1`, `mnyraDebugLoading`, story viewer cache/hint keys.

## SessionStorage Keys

- `menyra_social_guest_scope_session_v1`
- Story viewer runtime keys under `mnyra_story_viewer_*`.

## Firebase Collections

- `users`
- `users/{uid}/devices`
- `users/{uid}/notifications`
- `users/{uid}/followRequests`
- `users/{uid}/following`
- `users/{uid}/posts`
- `users/{uid}/posts/{postId}/likes`
- `users/{uid}/posts/{postId}/comments`
- `users/{uid}/chatThreads/{threadId}/messages`
- `users/{uid}/orders`
- `users/{uid}/menuFavorites`
- `publicRoutes`
- `restaurants`
- `restaurants/{restaurantId}/public/{menu,meta,offers}`
- `restaurants/{restaurantId}/menuItems`
- `restaurants/{restaurantId}/menuSocial`
- `restaurants/{restaurantId}/socialPosts`
- `restaurants/{restaurantId}/stories`
- `restaurants/{restaurantId}/orders`
- `restaurants/{restaurantId}/orderLookup`
- `restaurants/{restaurantId}/staff`
- `socialFeed`
- `leads`
- `superadmins`
- `staffAdmins`
- `staffIndex`
- Heart/Ops: `heartRuns`, `heartIncidents`, `heartSetup`

## Firestore Rules

- Rules file: `firestore.rules`.
- Index file: `firestore.indexes.json`.
- Critical rule areas: order create/update, social counters, follower counters, restaurant ownership/staff access, public read access.
- Keine Firestore Rules Unit Tests im Hauptpackage gefunden.

## Upload-, Delete-, Edit- und Save-Flows

- Media Upload: Bunny/worker ticket flow via `issueMediaActionTicket`, `uploadStoryImage`, media upload runtime cluster, image compressor lazy import.
- Menu save/edit: menu modal/save utils write menu item payloads.
- Social posts: user posts, restaurant social posts, menu social posts; likes/comments subcollections.
- Deletes: posts/comments/staff/menu/orders teilweise in client/runtime und rules verteilt.
- Orders: Checkout ruft Callable `createRestaurantOrder`; Function schreibt `restaurants/{restaurantId}/orders`, serverseitig berechnete Preise/Totals und Guest Lookup. Direkte Client-Creates sind in `firestore.rules` gesperrt; Mirror-Function spiegelt nach user orders/orderLookup.

## Image-Komponenten und Stabilitaet

- Avatar, business logo, restaurant cover, menu product images, feed/story images, public profile/media grid.
- Image reveal utilities haben eigene Tests.
- Positive Befunde: vorhandene Tests fuer image reveal sind gruen.
- Offenes Risiko: lokaler QR/Menu-Lauf zeigte Platzhalter/teilweise Produktdaten und nur 2/27 erwartete Produkte.

## Loading, Error und Empty States

- Vorhandene Tests decken mehrere no-hang Flows ab: public menu load, menu editor load, public focus load.
- Loading diagnostics existieren (`mnyraDebugLoading`).
- Offene Luecke: keine flaechenhafte Browser-Verifikation fuer alle Empty/Error/Permission/Offline States.

## PWA, SEO und Launch-Dateien

- Vorhanden: `sw.js`, `apps/menyra-social/sw.js`, `apps/menyra-social/manifest.webmanifest`, `apps/waiter/sw.js`, `apps/waiter/manifest.webmanifest`, `apps/mnyra-heart/sw.js`, `apps/mnyra-heart/manifest.json`, `vercel.json`, `firebase.json`.
- Nicht gefunden im Repo-Root: `robots.txt`, `sitemap.xml`, `favicon.ico`.
- Meta/OG/Twitter/canonical Tags sind in den geprueften HTML-Einstiegen nicht ausreichend launchfertig sichtbar.

## Tests und Scripts

- Root scripts: `dev`, `dev:social`, `dev:local`, `build`, `build:menyra-social:bundle`, `analyze:public-profile-split`, `check:social-bundle`.
- Functions scripts: `sync-heart-shared`, `routes:backfill:check`, `routes:backfill:write`.
- Node tests: `tests/*.test.mjs`.
- Playwright/Heart Runner: `tests/mnyra-heart-runner`, Packs fuer guest, user, business, staff, ceo, smoke, release, mutation.

## Grosse Bundles/Dateien

- Build `entry/social-app.js`: 1,121,224 Bytes raw / 304,055 Bytes gzip.
- Build `vendor-firebase`: 452,940 Bytes raw / 136,460 Bytes gzip.
- Bundle budget ist aktuell fehlgeschlagen.
- Alte grosse Testartefakte unter `tests/mnyra-heart-runner/artifacts` und `tmp/heart-run-*` wurden nicht veraendert.
