# Public Projection Test Gaps

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This report records the remaining public projection gaps found during the P0
browser launch rehearsal block. It does not approve route changes, collection
renames, rules loosening, UI changes, runtime extraction or production data
access.

## Current Coverage

- `tests/public-projection-contract.test.mjs` validates the local emulator seed
  projections for restaurant, shop and hotel businesses.
- `apps/menyra-social/core/public-profile/public-projection-builders.js`
  provides pure Firestore-free builders for route, profile, meta, offers and
  ads projections.
- The test asserts allowed-key whitelists for `publicRoutes/{slug}`,
  `restaurants/{id}/public/profile`, `public/meta`, `public/menu`,
  `public/offers` and `public/ads`.
- The test recursively rejects private projection fields such as owner UIDs,
  owner emails, billing notes, staff/role data, CRM/lead data and private ad
  moderation fields.
- Public menu items must store `price` as a number or `null`.
- The menu editor save path is covered with a dirty edit-state fixture to prove
  private fields are not carried into saved/published menu items.
- Mixed restaurant, shop and hotel/travel fixtures prove that owner, staff,
  CRM, booking-admin, product-owner, billing and private targeting fields do
  not survive builder output.
- Ads fixtures prove that pending, rejected, draft and inactive records are not
  emitted by the public ads builder.
- Seed projection documents are passed through the builders and must reproduce
  the same allowed contracts.
- Purity coverage freezes source inputs, runs every builder twice and checks
  deterministic, serializable plain-object output.

## Builder Status

The dedicated builder gap is closed for:

- `buildPublicRouteProjection(input)`
- `buildPublicProfileProjection(input)`
- `buildPublicMetaProjection(input)`
- `buildPublicOffersProjection(input)`
- `buildPublicAdsProjection(input)`

The builders use explicit output allowlists rather than recursive object
copying. Nested tables, social links, public contact data and image descriptors
are rebuilt from approved fields. Offer price fields become numbers or `null`.
No builder imports Firebase or Firestore.

Small runtime integrations are intentionally limited:

- `focus-runtime-controller.js` runs `public/offers` reads through the offers
  builder before normalizing visible focus state.
- `restaurant-identity-runtime-controller.js` uses the offers builder for
  travel discovery data and the ads builder for approved-only public ad data.
- Owner/Heart ads loading is not routed through the approved-only builder,
  because those tools must continue to see pending and rejected moderation
  state.

## Transitional Mixed Inputs Found

| Input or runtime                            | Mixed/private risk found                                                                                                                                                                           | State after this block                                                                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `restaurants/{id}`                          | Seed/root records contain owner UID/email fields and the live schema can also carry account, billing, staff, CRM and operational data.                                                             | Builder output excludes those fields, but the public profile runtime still reads the root document.                                              |
| `public-profile-runtime-controller.js`      | Route resolution reads/queries root restaurants, the visible read-once target is `restaurants/{id}`, and `normalizeExternalProfile` merges root/profile aliases including owner identity fallback. | Not cut over in this block because its visible profile/landing compatibility field set needs a separate guarded migration.                       |
| `restaurant-identity-runtime-controller.js` | Discovery starts from root restaurant rows and merges public meta into the root-shaped state object.                                                                                               | Public offers and public ads are builder-filtered; root/meta identity separation remains transitional.                                           |
| `restaurants/{id}/public/meta`              | Public display fields coexist with QR/offer/ad flags and timestamps; owner/staff/access fields must never be copied from admin inputs.                                                             | Pure meta builder and recursive table allowlist exist; general runtime merge cutover remains open.                                               |
| `restaurants/{id}/public/offers`            | Restaurant focus, shop references and hotel booking fields share one array; dirty editor/admin fields could be present in mixed inputs.                                                            | Public reads and discovery enrichment now use the pure offers builder.                                                                           |
| `restaurants/{id}/public/ads`               | Owner/Heart moderation arrays include pending/rejected state and moderation metadata.                                                                                                              | Public discovery uses approved-only builder output; owner/Heart tools retain full moderation state. Array storage remains a paid-launch blocker. |
| `publicRoutes/{slug}`                       | Runtime resolution also consumes transitional status/canonical aliases that are not part of the narrow seed projection contract.                                                                   | Pure route builder exists for generated projections; existing resolver semantics were not changed.                                               |
| Functions public startup seed               | Functions have a separate public focus normalizer and route-maintenance metadata path.                                                                                                             | Not imported from browser code; Functions/browser ownership boundary remains intact.                                                             |

## Remaining Gaps

| Surface               | Current safe coverage                                                                              | Remaining gap                                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `publicRoutes/{slug}` | Pure builder plus restaurant/shop/hotel seed parity.                                               | Route writers/resolvers still use transitional status/canonical metadata; migrate only under a separate route contract.                          |
| `public/profile`      | Pure builder, mixed-input denial and seed parity.                                                  | Move the public read-once/profile normalization path from root restaurant data to projection data without losing visible landing/profile fields. |
| `public/meta`         | Pure builder, QR table allowlist, mixed access-field denial and seed parity.                       | Stop merging broad root rows into public discovery state before tightening root reads.                                                           |
| `public/menu`         | Seed whitelist plus menu editor dirty-state/numeric-price regression coverage.                     | Keep delete/reorder/shop variant publish coverage in future mutation tests.                                                                      |
| `public/offers`       | Pure builder used by public focus reads and discovery; restaurant/shop/hotel fixtures are covered. | Add owner browser mutation proof for shop and hotel offer editors.                                                                               |
| `public/ads`          | Pure approved-only builder used by public discovery; all non-approved states are denied in tests.  | Replace array ads with auditable per-ad records before paid ads launch.                                                                          |

## Launch Impact

Public read tightening can now be prepared against explicit builder contracts,
but Firestore root-read tightening is not safe yet. The public profile and
discovery identity paths must first stop depending on mixed
`restaurants/{id}` records.

Public runtime extraction remains planning-only behind false feature flags.
No activated split is approved by this block. Ads remain disabled/not sellable
until the array model is replaced by an auditable moderation design.

## Verification 2026-07-01

- `tests/public-projection-contract.test.mjs`: 14/14 passed.
- Full `npm run test:unit`: 120/120 passed.
- `npm run test:functions`: 4/4 passed inside local Functions/Firestore
  emulators for project `mnyra-local`.
- `npm run test:rules`: 17/17 passed inside the local Firestore emulator.
- `npm run lint`, `npm run format:check`, `npm run arch:check` and
  `npm run build`: passed.
- Public profile/menu/QR, owner menu, shop owner and hotel owner Playwright
  coverage passed on desktop and mobile after reseeding from the current
  `seed/data/mnyra-local-seed.json`. The combined correctly seeded run was
  11/12 because one desktop owner assertion read the public menu before its
  projection update; the identical mobile path passed and the targeted desktop
  retry passed 1/1.
- The build updated the tracked `apps/menyra-social/bundled/entry/social-app.js`
  artifact. No new chunk or manifest filename was generated.
