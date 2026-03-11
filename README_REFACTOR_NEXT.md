# MNYRA Refactor Next

Last updated: 2026-03-11 06:10:45 +01:00

Current local completed batch (uncommitted):
Batch 8 — Social-App Auth-Startup State Helper Extraction.

Current committed safe checkpoint:
`a5ff4c9` — `fix(startup): dedupe auth-profile bootstrap handoff`

Current exact next step:
Review the local Batch 8 change set and either commit it or roll it back as one narrow unit before starting new code work.

Current exact next batch after Batch 8 review:
Batch 3B validation gate execution — emulator/staging Firestore-rule evidence capture and query-path smoke checks.

Why this is next:
The real current code history now includes Batch 7 at `a5ff4c9`, and the current open local batch is a narrow structural reduction inside `social-app.js`.
The remaining explicit gate after this local Batch 8 review is still Batch 3B validation evidence.

What must be checked now:
- Initial auth restore still applies pending startup tab/auth-mode state correctly.
- Bootstrap snapshot and persisted profile hints still hydrate avatar/name/handle state as before.
- Existing callers of `saveUserProfileToStorage` and `clearAuthBootstrapSnapshot` still behave the same.

What must not be broken:
- Fresh login and auth state restore.
- Guest auth-route handoff and pending initial tab restore.
- Avatar/profile persistence across refresh and sign-out.
- Startup/auth runtime behavior shipped through `a5ff4c9`.
