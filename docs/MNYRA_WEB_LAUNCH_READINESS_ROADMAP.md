# Mnyra Web Launch Readiness Roadmap

## Current Stable Recovery Checkpoint

Branch: `finale-mnyra-mainline`

Stable checkpoint commit:

```text
7352bf0e4482de44b6522fce1beff0c6b8496627
fix(route): map launch public slug to canonical restaurant
```

Current verified recovery status:

- `/casarita` cold start works better and resolves to the intended canonical restaurant.
- `/casarita/menu` works better.
- `/casarita/menu?src=qr&table=7` QR cold start works better.
- Products are visible in the QR/menu flow.
- Public profile avatar is improved.
- The website is no longer in emergency instability mode for the Casarita launch path.

This checkpoint must be treated as the current known-good recovery baseline. Do not perform broad refactors directly on top of it without a focused plan and a rollback path.

---

## Product Framing

Mnyra is a commercial website / web platform, not primarily a native app.

Every public URL must behave like an independent web landing page.

Core rule:

```text
A visitor must be able to open a public Mnyra link in a fresh browser session and get the correct page without login, previous navigation, cached app state, or installed app behavior.
```

Important public web surfaces:

- `/:landingSlug`
- `/:landingSlug/menu`
- `/:landingSlug/menu?src=qr&table=<n>`
- `/feed`
- `/search`
- `/login`
- `/register`

The most important launch test is a cold open in Safari/Chrome private mode.

---

## Web Launch Rules

1. URL decides the public surface.
2. Public slug must resolve to exactly one canonical restaurant ID.
3. Canonical restaurant ID decides identity, posts, menu, QR context, and ordering context.
4. QR context is query-based: `src`, `source`, `table`, and similar query values define table/QR behavior.
5. Path decides the surface: profile, menu, posts, etc.
6. Public pages must not require login.
7. Public pages must not depend on previous feed/bootstrap navigation.
8. Public menu/posts must not settle as final empty until canonical restaurant ID is known.
9. Route seed and bootstrap may improve first paint but must not override the URL-decided surface.
10. Errors must be visible as retry/error states, not silently shown as false empty content.

---

## Phase 1 — Protect the Stable Web Baseline

Goal: preserve the current working Casarita public/QR recovery state before more work.

Tasks:

- [x] Identify stable checkpoint: `7352bf0e4482de44b6522fce1beff0c6b8496627`.
- [x] Treat `finale-mnyra-mainline` as current web recovery branch.
- [ ] Add a small manual smoke checklist for every public/QR change.
- [ ] Avoid broad refactors while public route/menu/profile stability is still being hardened.
- [ ] For every future fix, document exactly which URL was broken and which URL was verified.

Manual smoke checklist:

```text
1. /casarita?sw-reset=1&t=1
2. /casarita/menu?sw-reset=1&t=2
3. /casarita/menu?src=qr&table=7&sw-reset=1&t=3
4. Refresh on each URL
5. Switch posts <-> menu
6. Open in a fresh private Safari tab
```

Success criteria:

- Profile opens without blank screen.
- Logo/avatar appears.
- Public posts are not stuck forever in loading.
- Menu products appear when expected.
- QR context survives cold open and refresh.
- No guest-login requirement for public pages.

---

## Phase 2 — Replace Hardcoded Launch Aliases with a Public Slug Resolver

Current temporary recovery fix:

```text
casarita -> Lzm6RpNu3ErSDtGCHxpi
```

This saved the launch path, but it is not scalable as a commercial web platform.

Target model:

```text
publicRoutes/{slug} = {
  restaurantId: string,
  canonicalSlug: string,
  aliases: string[],
  status: "active" | "inactive" | "redirect",
  createdAt,
  updatedAt
}
```

Tasks:

- [ ] Design `publicRoutes/{slug}` data model.
- [ ] Add resolver: slug -> canonical restaurant ID.
- [ ] Support aliases like `casa-rita -> casarita`.
- [ ] Keep visible URL clean: `/casarita`.
- [ ] Add inactive / not-found handling.
- [ ] Migrate Casarita from hardcoded route alias to Firestore-backed public route.
- [ ] Remove hardcoded launch alias map after resolver is proven.

Success criteria:

- New restaurant slugs can be created without code deploy.
- Every slug resolves to exactly one restaurant ID.
- `/slug`, `/slug/menu`, and `/slug/menu?src=qr&table=n` all use the same canonical restaurant ID.

---

## Phase 3 — Public Business Page Contract

Problem:

Public pages currently depend on multiple state layers: route seed, bootstrap, cached restaurants, feed posts, menu state, profile view, and canonical Firestore docs.

Target contract:

```text
loadPublicBusinessPage(slugOrId) -> {
  restaurantId,
  slug,
  identity,
  counts,
  postsState,
  menuState,
  qrContext,
  status
}
```

Tasks:

- [ ] Define one normalized `PublicBusinessPage` shape.
- [ ] Make `/slug` load identity + posts through this contract.
- [ ] Make `/slug/menu` load identity + menu through this contract.
- [ ] Make QR menu load the same contract plus QR table context.
- [ ] Prevent alias/slug loads from marking menu/posts as final empty.
- [ ] Ensure canonical restaurant ID is always available before final empty state.

Success criteria:

- Public profile and QR menu never disagree about restaurant identity.
- Public posts and menu use the same restaurant ID.
- False `Keine Produkte` does not appear due to wrong alias/slug.

---

## Phase 4 — Public Menu and Posts Data Truth

Menu truth target:

```text
loadPublicBusinessMenu(restaurantId) -> {
  state: "loading" | "ready" | "empty" | "error",
  items: MenuItem[]
}
```

Posts truth target:

```text
loadPublicBusinessPosts(restaurantId) -> {
  state: "loading" | "ready" | "empty" | "error",
  posts: Post[]
}
```

Tasks:

- [ ] Identify all current menu sources.
- [ ] Choose one public menu source as canonical.
- [ ] Identify all current post sources.
- [ ] Choose one public posts loader as canonical.
- [ ] Keep fallback logic internal to loaders, not spread across render and route code.
- [ ] Replace indefinite loading with explicit retry/error/empty states.

Success criteria:

- Public menu has one final truth.
- Public posts have one final truth.
- UI can distinguish loading, empty, and error.

---

## Phase 5 — Browser/Web Testing Without Vercel Login

Problem:

Vercel Preview protection makes quick browser testing difficult. Local testing also needs SPA rewrites for public slug URLs.

Tasks:

- [ ] Add local no-login test server: `tools/local-mnyra-server.mjs`.
- [ ] Support rewrites for `/feed`, `/login`, `/:landingSlug`, `/:landingSlug/menu`, QR URLs.
- [ ] Add script: `npm run dev:web` or documented node command.
- [ ] Add Playwright smoke for public web URLs.

Success criteria:

- Developer can test `/casarita/menu?src=qr&table=7` locally without Vercel login.
- Public coldstart can be tested before deploy.

---

## Phase 6 — Automated Web Smoke Tests

Core tests:

```text
1. Public profile cold open: /casarita
2. Public menu cold open: /casarita/menu
3. QR menu cold open: /casarita/menu?src=qr&table=7
4. Refresh on each URL
5. Posts <-> menu switch
6. No critical console errors
```

Tasks:

- [ ] Add Playwright test for public profile cold open.
- [ ] Add Playwright test for public menu cold open.
- [ ] Add Playwright test for QR menu cold open.
- [ ] Fail test if visible text remains stuck in loading too long.
- [ ] Fail test if menu expected to have products but shows `Keine Produkte`.
- [ ] Save screenshots/artifacts on failure.

Success criteria:

- Public web regressions are caught before manual iPhone testing.

---

## Phase 7 — Commercial Restaurant Onboarding Readiness

Every restaurant should pass this data checklist before being sent to a customer:

```text
- canonical restaurant ID exists
- public slug exists
- public route points to canonical restaurant ID
- logo/avatar exists
- location/city exists
- at least one public menu category exists
- at least one public product exists, if menu is advertised
- QR URL opens the public menu
- table number survives QR URL
- order flow works if ordering is enabled
```

Tasks:

- [ ] Build internal restaurant readiness checker.
- [ ] Show missing launch data in CEO/Admin surface.
- [ ] Prevent sending customer link if required public data is incomplete.

Success criteria:

- No customer receives a public link that opens an empty or wrong restaurant page.

---

## Phase 8 — Ordering / Waiter Commercial Flow

Public page stability is only the first half. For restaurants, QR ordering must work commercially.

Required flow:

```text
QR scan -> menu -> product -> cart -> table number -> special wishes -> send order -> waiter receives order -> status visible
```

Tasks:

- [ ] Smoke test QR order creation.
- [ ] Smoke test waiter app receives order.
- [ ] Smoke test table number is correct.
- [ ] Smoke test special wishes persist.
- [ ] Smoke test order status changes.
- [ ] Confirm disabled ordering shows menu-only mode cleanly.

Success criteria:

- A real restaurant can use QR table ordering without manual support.

---

## Phase 9 — Web UX Polish

Tasks:

- [ ] Remove header flashes on coldstart.
- [ ] Keep profile/menu skeletons stable.
- [ ] Prevent layout jumps when avatar/menu/posts hydrate.
- [ ] Improve empty/error text for public guests.
- [ ] Ensure mobile Safari safe-area behavior is clean.
- [ ] Ensure share links look correct.

Success criteria:

- Mnyra feels like a calm commercial website, not a patched prototype.

---

## Current Next Step

Do not refactor everything at once.

Recommended next engineering step:

```text
Phase 2 Step 1:
Design and implement Firestore-backed public route resolver behind the existing working Casarita behavior.
```

Constraints:

- Keep `7352bf0...` behavior intact.
- Do not break `/casarita`, `/casarita/menu`, or QR menu.
- Add resolver as a safe enhancement first.
- Remove hardcoded alias only after resolver is proven.
