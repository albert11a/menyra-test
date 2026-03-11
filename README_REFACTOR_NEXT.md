# MNYRA Refactor Next

Last updated: 2026-03-11 05:56:55 +01:00

Current local completed batch (uncommitted):
Batch 7 — Startup/Auth Bootstrap Auth-Profile Handoff Dedupe.

Current committed safe checkpoint:
`4edc9f1` — `fix(social): clean listener lifecycle dead paths`

Current exact next step:
Review the local Batch 7 change set and either commit it or roll it back as one narrow unit before starting new code work.

Current exact next batch after Batch 7 review:
Batch 3B validation gate execution — emulator/staging Firestore-rule evidence capture and query-path smoke checks.

Why this is next:
The real current code history already includes Batch 4 (`7c1844c`), startup/auth silent failure surfacing (`252645a`), and Batch 6 (`4edc9f1`).
The current open local batch is a later startup/auth dedupe fix, and the remaining explicit gate after it is still Batch 3B validation evidence.

What must be checked now:
- Auth/session restore on `profile` or `menu` does not trigger a second immediate auth-profile load.
- Sign-out or user switch clears one-shot bootstrap auth-profile dedupe state.
- Startup/bootstrap behavior shipped in `7c1844c`, `252645a`, and `4edc9f1` remains intact.

What must not be broken:
- Fresh login and auth state restore.
- Restored `profile` / `menu` startup hydration.
- Menu/focus loading after auth-profile hydration.
- Listener cleanup and detached-profile teardown shipped through `4edc9f1`.
