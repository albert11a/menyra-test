# MNYRA Refactor Next

Last updated: 2026-03-11 19:21:46 +01:00

Current local completed batch (uncommitted):
Batch 14 — Social-App Restaurant Identity Runtime Extraction.

Current committed safe checkpoint:
`2e0e715` — `refactor(social): extract public profile runtime`

Current exact next step:
Review the local Batch 14 change set and either commit it or roll it back as one narrow unit before starting new code work.

Current exact next batch after Batch 14 review:
Batch 15 — Social-App Startup Route Resolution Orchestration Reduction.

Why this is next:
The real current code history now includes Batch 13 at `2e0e715`, and the current open local batch extracts the inline restaurant identity hydration/merge block that was still load-bearing inside `social-app.js`.
The next remaining safe slice in the same startup/auth/route orchestration area is startup route resolution and auth-route seed orchestration.
The Batch 3B validation evidence gate remains open, but it is not the currently selected social-app reduction slice.

What must be checked now:
- Load or refresh the feed and confirm restaurant names and logos still hydrate onto feed cards.
- Load or refresh stories and confirm story business identities still hydrate without duplicate or missing updates.
- Trigger a restaurant identity patch path and confirm merged restaurant metadata still propagates into dependent views.
- Confirm cached restaurant hydration plus later Firestore hydration still settle into the same visible feed/story state.

What must not be broken:
- Fresh login and auth state restore.
- Feed card restaurant names/logos.
- Story rail business identity rendering.
- Existing restaurant merge paths used by feed/profile/settings updates.
