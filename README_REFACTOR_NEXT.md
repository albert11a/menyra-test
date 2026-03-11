# MNYRA Refactor Next

Last updated: 2026-03-11 20:00:47 +01:00

Current local completed batch (uncommitted):
None.

Current committed safe checkpoint:
Batch 15 — Social-App Public Bootstrap Runtime Extraction + initialization-order follow-up fix (current tip after this commit)

Current exact next step:
Validate the freshly pushed Batch 15 checkpoint on hard refresh / guest bootstrap paths before starting the next reduction slice.

Current exact next batch after Batch 15 review:
Batch 16 — Social-App Startup Bootstrap Entry Sequencing Reduction.

Why this is next:
The real current code history now includes the pushed Batch 15 checkpoint, which removed the inline public bootstrap payload/runtime block from `social-app.js` and folded in the one-line `updateFeedDom` initialization-order follow-up fix before commit.
Route/deeplink/chat-open behavior is already extracted into focused helpers, so the next remaining safe slice in the same startup/bootstrap area is the entry sequencing and handoff that still initiates that runtime from `social-app.js`.
The Batch 3B validation evidence gate remains open, but it is not the currently selected social-app reduction slice.

What must be checked now:
- Load or refresh as guest and confirm feed/stories still hydrate from inline or fetched public bootstrap payloads.
- Confirm bootstrap restaurants still merge into existing restaurant state without dropping names/logos/city/type.
- Confirm the bootstrap event path still reapplies payloads without duplicate or missing feed/story updates.
- Confirm startup fetch timeout/error handling still fails soft and does not block guest startup.
- Confirm the `Cannot access 'updateFeedDom' before initialization` runtime error is gone on first load.

What must not be broken:
- Guest startup and feed render on fresh load.
- Inline bootstrap payload and window bootstrap promise handoff.
- Feed/story bootstrap hydration and restaurant metadata merge behavior.
- Fresh login and auth state restore.
