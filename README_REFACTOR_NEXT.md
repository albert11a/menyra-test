# MNYRA Refactor Next

Last updated: 2026-03-11 16:15:36 +01:00

Current local completed batch (uncommitted):
Batch 13 — Social-App Public Profile Runtime Extraction.

Current committed safe checkpoint:
`be44f5a` — `refactor(social): reduce post-login route coordination`

Current exact next step:
Review the local Batch 13 change set and either commit it or roll it back as one narrow unit before starting new code work.

Current exact next batch after Batch 13 review:
Batch 14 — Social-App Startup Route Resolution Orchestration Reduction.

Why this is next:
The real current code history now includes Batch 12 at `be44f5a`, and the current open local batch extracts the inline public-profile listener/presentation/fetch block that was still load-bearing inside `social-app.js`.
The next remaining safe slice in the same broader startup/profile orchestration area is startup route resolution and auth-route seed orchestration.
The Batch 3B validation evidence gate remains open, but it is not the currently selected social-app reduction slice.

What must be checked now:
- Open an external business profile and confirm the placeholder profile, resolved profile data, and posts still load correctly.
- Open an external user profile and confirm cached/fallback/resolved profile behavior still works.
- Leave an external profile through normal nav and confirm no stray profile listener updates keep firing afterward.
- Menu/cart or overlay flows that call `showPublicProfile` still open the same public profile view.

What must not be broken:
- Fresh login and auth state restore.
- External business profile opens.
- External user profile opens.
- Detached profile listener teardown behavior shipped through `be44f5a`.
