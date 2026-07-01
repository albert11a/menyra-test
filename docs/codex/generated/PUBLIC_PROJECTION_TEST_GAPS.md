# Public Projection Test Gaps

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This report records the remaining public projection gaps found during the P0
browser launch rehearsal block. It does not approve route changes, collection
renames, rules loosening, UI changes, runtime extraction or production data
access.

## Current Coverage Added

- `tests/public-projection-contract.test.mjs` validates the local emulator seed
  projections for restaurant, shop and hotel businesses.
- The test asserts allowed-key whitelists for `publicRoutes/{slug}`,
  `restaurants/{id}/public/profile`, `public/meta`, `public/menu`,
  `public/offers` and `public/ads`.
- The test recursively rejects private projection fields such as owner UIDs,
  owner emails, billing notes, staff/role data, CRM/lead data and private ad
  moderation fields.
- Public menu items must store `price` as a number or `null`.
- The menu editor save path is covered with a dirty edit-state fixture to prove
  private fields are not carried into saved/published menu items.

## Builder Gap

There is no single dedicated public projection builder yet for profile, meta,
offers or ads. The current runtime still reads a mix of public projection docs
and transitional root restaurant fields while the app remains in the existing
social runtime.

Because of that shape, this P0 block intentionally avoids creating a broad new
architecture. It tests the current seed/public-doc contract and the menu save
normalizer path, then records the missing builder layer as a blocker before
tightening reads or extracting a public runtime.

## Remaining Gaps

| Surface               | Current safe coverage                                                       | Remaining gap                                                                          |
| --------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `publicRoutes/{slug}` | Seed whitelist coverage for restaurant, shop and hotel slugs.               | Add a pure route projection builder before route writes are generated outside seeds.   |
| `public/profile`      | Seed whitelist and private-field denial.                                    | Add a pure builder from business/root inputs that copies only contract fields.         |
| `public/meta`         | Seed whitelist, QR table metadata whitelist and private-field denial.       | Add a pure builder that separates display metadata from owner/staff/account state.     |
| `public/menu`         | Seed whitelist plus menu editor dirty-state regression coverage.            | Keep menu publish projection covered when deleting/reordering items and shop variants. |
| `public/offers`       | Hotel offer seed whitelist and private-field denial.                        | Add offer editor projection tests for hotel/shop/restaurant focus flows.               |
| `public/ads`          | Seed public ads are approved-only and contain no private moderation fields. | Replace array ads with auditable per-ad records before selling ads.                    |

## Launch Impact

Public runtime extraction should not start as an activated runtime until the
profile/meta/offers/ads builder gap is closed or explicitly accepted as a
false-flag planning-only risk. The current branch can continue with contract
and test preparation, but public-read tightening must wait until runtime reads
no longer depend on mixed root restaurant data.
