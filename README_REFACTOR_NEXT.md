# MNYRA Refactor Next

Last updated: 2026-03-11 21:40:12 +01:00

Current local completed batch (uncommitted):
- Batch C - Menu / Focus Public Catalog Runtime Extraction.
- Local runtime extraction plus tracking updates only.
- No commit.

Current committed safe checkpoint:
- `8183197` - `refactor(social): extract auth profile resolution runtime`

Current exact next step:
- Review and smoke-test the local Batch C extraction.
- If approved, execute Batch D - Orders Runtime + Orders View Extraction.

Current recommended next batch:
- Batch D - Orders Runtime + Orders View Extraction

Why this is next:
- Batch B is already committed at `8183197`, and Batch C is now the active local batch.
- The next untouched large-safe runtime cluster in the roadmap is orders runtime + orders view.
- It keeps the rollback unit separate from upload/media, CRM, and wrapper-only cleanup.

Recommended follow-up order after Batch C:
1. Batch D - Orders Runtime + Orders View Extraction
2. Batch E - Upload / Post Publishing / Media Ticket Runtime Extraction
3. Batch F - Feed / Story Identity Runtime Extraction

Not the default next batch anymore:
- The pre-blueprint "Batch 16 - startup bootstrap entry sequencing reduction" label is superseded.
- The startup entry left in `social-app.js` is already relatively lean compared with the heavier runtime clusters still inside the file.

Batch C must not break:
- favorite menu load and profile favorites rendering
- public/legacy/collection menu load fallback behavior
- public menu publication after menu save/delete
- focus offer load/meta/publication behavior
- focus carousel rotation and focus save/delete flows
