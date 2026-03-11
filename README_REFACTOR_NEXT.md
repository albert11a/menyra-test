# MNYRA Refactor Next

Last updated: 2026-03-11 22:45:59 +01:00

Current local completed batch (uncommitted):
- Batch E - Upload / Post Publishing / Media Ticket Runtime Extraction.
- Local runtime extraction plus tracking updates only.
- No commit.

Current committed safe checkpoint:
- `b9b54c7` - `refactor(social): extract orders runtime and view`

Current exact next step:
- Review and smoke-test the local Batch E extraction.
- If approved, execute Batch F - Feed / Story Identity Runtime Extraction.

Current recommended next batch:
- Batch F - Feed / Story Identity Runtime Extraction

Why this is next:
- Batch D is already committed at `b9b54c7`, and Batch E is now the active local batch.
- The next untouched large-safe runtime cluster in the roadmap is feed / story identity and restaurant-meta runtime.
- It keeps the rollback unit separate from shell DOM work, CRM support, and wrapper-only cleanup.

Recommended follow-up order after Batch E:
1. Batch F - Feed / Story Identity Runtime Extraction
2. Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction
3. Batch H - CEO CRM Count / Support Runtime Extraction

Not the default next batch anymore:
- The pre-blueprint "Batch 16 - startup bootstrap entry sequencing reduction" label is superseded.
- The startup entry left in `social-app.js` is already relatively lean compared with the heavier runtime clusters still inside the file.

Batch E must not break:
- upload chooser and upload tab rendering
- signed-in user feed post creation
- business feed post creation plus `socialFeed/{postId}` write-through
- story upload with optimistic own-story refresh
- media ticket issuance for image/story upload
- shared `uploadCompressedImage(...)` usage for avatar/menu/focus flows
