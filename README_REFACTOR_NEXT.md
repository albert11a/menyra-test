# MNYRA Refactor Next

Last updated: 2026-03-11 22:18:32 +01:00

Current local completed batch (uncommitted):
- Batch D - Orders Runtime + Orders View Extraction.
- Local runtime extraction plus tracking updates only.
- No commit.

Current committed safe checkpoint:
- `edf0cf4` - `refactor(social): extract menu focus public runtime`

Current exact next step:
- Review and smoke-test the local Batch D extraction.
- If approved, execute Batch E - Upload / Post Publishing / Media Ticket Runtime Extraction.

Current recommended next batch:
- Batch E - Upload / Post Publishing / Media Ticket Runtime Extraction

Why this is next:
- Batch C is already committed at `edf0cf4`, and Batch D is now the active local batch.
- The next untouched large-safe runtime cluster in the roadmap is upload / post publishing / media ticket runtime.
- It keeps the rollback unit separate from feed/story identity, shell DOM work, CRM, and wrapper-only cleanup.

Recommended follow-up order after Batch D:
1. Batch E - Upload / Post Publishing / Media Ticket Runtime Extraction
2. Batch F - Feed / Story Identity Runtime Extraction
3. Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction

Not the default next batch anymore:
- The pre-blueprint "Batch 16 - startup bootstrap entry sequencing reduction" label is superseded.
- The startup entry left in `social-app.js` is already relatively lean compared with the heavier runtime clusters still inside the file.

Batch D must not break:
- signed-in user orders listener behavior
- business/restaurant orders listener behavior
- guest checkout optimistic order insertion
- auth checkout write-through to `users/{uid}/orders`
- orders tab rendering for buyer and business views
