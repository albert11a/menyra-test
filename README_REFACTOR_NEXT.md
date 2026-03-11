# MNYRA Refactor Next

Last updated: 2026-03-11 15:56:13 +01:00

Current local completed batch (uncommitted):
Batch 12 — Social-App Post-Login Route-Open Coordination Reduction.

Current committed safe checkpoint:
`e79c85e` — `refactor(social): extract pending route startup state`

Current exact next step:
Review the local Batch 12 change set and either commit it or roll it back as one narrow unit before starting new code work.

Current exact next batch after Batch 12 review:
Batch 13 — Social-App Startup Route Resolution Orchestration Reduction.

Why this is next:
The real current code history now includes Batch 11 at `e79c85e`, and the current open local batch extracts the post-login route-open coordination bundle that was still wired through `social-app.js` into the startup auth flow.
The next remaining safe slice in the same startup/auth/route area is startup route resolution and auth-route seed orchestration.
The Batch 3B validation evidence gate remains open, but it is not the currently selected social-app reduction slice.

What must be checked now:
- Login with pending notification/post/chat routes and confirm the same targets still open after auth restore.
- Profile-only pending route opens still run without the blocking pending-route path.
- Login, logout, and refresh still follow the same bootstrap/session transition behavior.
- Pending route flags still drive the same blocking vs non-blocking post-login open behavior.

What must not be broken:
- Fresh login and auth state restore.
- Guest auth-route handoff and pending initial tab restore.
- Pending notification/post/chat/profile open flows.
- Startup/auth runtime behavior shipped through `e79c85e`.
