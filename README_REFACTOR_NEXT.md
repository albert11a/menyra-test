# MNYRA Refactor Next

Last updated: 2026-03-11 06:22:33 +01:00

Current local completed batch (uncommitted):
Batch 9 — Social-App Auth Session Startup Coordinator Extraction.

Current committed safe checkpoint:
`090eff5` — `refactor(social): extract auth startup state helpers`

Current exact next step:
Review the local Batch 9 change set and either commit it or roll it back as one narrow unit before starting new code work.

Current exact next batch after Batch 9 review:
Batch 3B validation gate execution — emulator/staging Firestore-rule evidence capture and query-path smoke checks.

Why this is next:
The real current code history now includes Batch 8 at `090eff5`, and the current open local batch is the next narrow orchestration reduction inside `social-app.js`.
The remaining explicit gate after this local Batch 9 review is still Batch 3B validation evidence.

What must be checked now:
- Initial auth restore still applies pending startup tab/auth-mode state correctly.
- Login, logout, and refresh still follow the same bootstrap/session transition behavior.
- Pending auth-route opens still run correctly after signed-in transition.
- Guest ensure-tab scheduling after fresh load and sign-out still behaves the same.

What must not be broken:
- Fresh login and auth state restore.
- Guest auth-route handoff and pending initial tab restore.
- Avatar/profile persistence across refresh and sign-out.
- Startup/auth runtime behavior shipped through `090eff5`.
