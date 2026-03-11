# MNYRA Refactor Next

Last updated: 2026-03-11 15:23:18 +01:00

Current local completed batch (uncommitted):
Batch 11 — Social-App Pending Route Startup State Extraction.

Current committed safe checkpoint:
`815e8fa` — `refactor(social): reduce startup bootstrap wiring`

Current exact next step:
Review the local Batch 11 change set and either commit it or roll it back as one narrow unit before starting new code work.

Current exact next batch after Batch 11 review:
Batch 12 — Social-App Post-Login Route-Open Coordination Reduction.

Why this is next:
The real current code history now includes Batch 10 at `815e8fa`, and the current open local batch extracts the pending startup/deeplink route state that was still load-bearing inside `social-app.js`.
The next remaining safe slice in the same startup/auth/route area is the post-login route-open coordination bundle still wired from `social-app.js` into the startup coordinator.
The Batch 3B validation evidence gate remains open, but it is not the currently selected social-app reduction slice.

What must be checked now:
- Initial auth restore still applies pending startup tab/auth-mode state correctly.
- Pending notification/post/chat/profile deeplink state still survives the startup/auth handoff and opens the same targets.
- Login, logout, and refresh still follow the same bootstrap/session transition behavior.
- Push/deeplink route patches still update the shared pending state correctly.

What must not be broken:
- Fresh login and auth state restore.
- Guest auth-route handoff and pending initial tab restore.
- Pending notification/post/chat/profile open flows.
- Startup/auth runtime behavior shipped through `815e8fa`.
