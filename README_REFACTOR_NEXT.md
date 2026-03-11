# MNYRA Refactor Next

Last updated: 2026-03-12 00:20:02 +01:00

Current local completed batch (uncommitted):
- Batch F - Feed / Story Identity Runtime Extraction.
- Local runtime extraction plus tracking updates only.
- No commit.

Current committed safe checkpoint:
- `af24d17` - `docs(refactor): correct social-app line count`
- Latest committed code batch under that checkpoint: `ccb962a` - `refactor(social): extract media upload runtime`

Current exact next step:
- Review and smoke-test the local Batch F extraction.
- If approved, execute Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction.

Current recommended next batch:
- Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction

Why this is next:
- Batch E is already committed in `ccb962a`, and Batch F is now the active local batch.
- The next untouched large-safe runtime cluster in the roadmap is shell / auth / drawer / notifications DOM runtime.
- It keeps the rollback unit separate from CEO CRM count support, composition-root dependency-map cleanup, and wrapper-only cleanup.

Recommended follow-up order after Batch F:
1. Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction
2. Batch H - CEO CRM Count / Support Runtime Extraction
3. Batch I - Late-Stage Controller Dependency-Map Consolidation

Not the default next batch anymore:
- Feed / story identity is no longer the next slice; it is the current local batch under review.
- The pre-blueprint "Batch 16 - startup bootstrap entry sequencing reduction" label remains superseded.

Batch F must not break:
- feed stories row rendering and story viewer links
- story cache hydration from persisted/bootstrap data
- restaurant public-meta enrichment and business-location rebuild handoff
- feed logo reconciliation after restaurant/meta changes
- story refresh after optimistic own-story upload
- fallback feed-derived story generation when live stories are absent
