# MNYRA Refactor Next

Last updated: 2026-03-11 06:32:27 +01:00

Current local completed batch (uncommitted):
Batch 10 — Social-App Startup Bootstrap Wiring Reduction.

Current committed safe checkpoint:
`2c6daba` — `refactor(social): extract auth session startup coordinator`

Current exact next step:
Review the local Batch 10 change set and either commit it or roll it back as one narrow unit before starting new code work.

Current exact next batch after Batch 10 review:
Batch 3B validation gate execution — emulator/staging Firestore-rule evidence capture and query-path smoke checks.

Why this is next:
The real current code history now includes Batch 9 at `2c6daba`, and the current open local batch is the next narrow startup-entry reduction inside `social-app.js`.
The remaining explicit gate after this local Batch 10 review is still Batch 3B validation evidence.

What must be checked now:
- Initial auth restore still applies pending startup tab/auth-mode state correctly.
- Inline public bootstrap payload and existing window bootstrap promise detection still work on refresh.
- Login, logout, and refresh still follow the same bootstrap/session transition behavior.
- Auth listener registration still fires exactly once and pending auth-route opens still run correctly.

What must not be broken:
- Fresh login and auth state restore.
- Guest auth-route handoff and pending initial tab restore.
- Startup public bootstrap hydration on refresh.
- Startup/auth runtime behavior shipped through `2c6daba`.
