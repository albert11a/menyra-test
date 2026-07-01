# Mnyra Safe Refactor Rules

Status: CURRENT
Last updated: 2026-07-01

## Hard Rules

- Plan before implementation.
- Keep every step small and reversible.
- Do not change visible UI without explicit approval.
- Do not change routes without route contract approval.
- Do not rename Firestore collections.
- Do not delete old logic while introducing a new runtime.
- Do not activate new runtime behavior by default.
- Do not use production Firebase data for local tests.

## Runtime Rules

- Public Profile runtime may read public profile/posts/menu identity only.
- Public Menu/QR runtime may read public menu/focus/profile identity and may
  enter cart/order only through the documented order contract.
- Waiter runtime may access only authorized restaurant staff/order data.
- Owner runtime may write only owned business data.
- Heart runtime may manage CRM/admin data only through Heart-owned facades.
- Feed, Travel and Shopping must not own public route truth.

## Feature Flag Rules

- New runtimes start behind false flags in `shared/config/feature-flags.js`.
- A flag may not be switched to true in the same step that creates a runtime.
- Every flag needs rollback instructions before activation.

## Data Rules

- Public reads must be intentionally public in Firestore Rules.
- Direct client writes must be listed before they are moved.
- Counters must not become user-controlled during refactor.
- Guest order writes must remain constrained to the order contract.

## Review Rules

- Review imports before and after every extraction.
- Review generated architecture and bundle reports before activation.
- Review manual test list before merge.
- Treat skipped tests as TODOs, not coverage.
