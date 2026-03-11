# MNYRA Refactor Next

Last updated: 2026-03-11 21:06:33 +01:00

Current local completed batch (uncommitted):
- Batch B - Restaurant / Lead / Auth Resolution + Role Switch Extraction.
- Local runtime extraction plus tracking updates only.
- No commit.

Current committed safe checkpoint:
- `69981fa` - `refactor(social): extract self profile runtime`

Current exact next step:
- Review and smoke-test the local Batch B extraction.
- If approved, execute Batch C - Menu / Focus Public Catalog Runtime Extraction.

Current recommended next batch:
- Batch C - Menu / Focus Public Catalog Runtime Extraction

Why this is next:
- Batch B is now moved out locally into `core/auth/auth-profile-resolution-runtime.js`.
- The next untouched large-safe commerce/profile cluster in the roadmap is menu/focus public catalog runtime.
- It removes a large cohesive runtime surface without mixing order-write flow, upload runtime, or CRM.

Recommended follow-up order after Batch B:
1. Batch C - Menu / Focus Public Catalog Runtime Extraction
2. Batch D - Orders Runtime + Orders View Extraction
3. Batch E - Upload / Post Publishing / Media Ticket Runtime Extraction

Not the default next batch anymore:
- The pre-blueprint "Batch 16 - startup bootstrap entry sequencing reduction" label is superseded.
- The startup entry left in `social-app.js` is already relatively lean compared with the heavier runtime clusters still inside the file.

Batch B must not break:
- guest load and signed-in restore
- owner restaurant resolution from uid/email/profile hint
- lead fallback resolution and lead-to-restaurant materialization
- legacy `users/{uid}` restaurant fallback patching
- role switch target resolution and shell/feed refresh behavior
