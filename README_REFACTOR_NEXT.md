# MNYRA Refactor Next

Last updated: 2026-03-12 01:48:48 +01:00

Current local completed batch (uncommitted):
- Batch H - CEO CRM Count / Support Runtime Extraction.
- This is the active local-only batch under review.

Current committed safe checkpoint:
- `current HEAD` - `Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction`
- Latest committed code batch under that checkpoint: `current HEAD` - `Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction`

Current exact next step:
- Review and smoke-test the local Batch H extraction.
- If approved, commit Batch H as its own rollback unit.
- After Batch H review, execute Batch I - Late-Stage Controller Dependency-Map Consolidation.

Current recommended next batch:
- Batch I - Late-Stage Controller Dependency-Map Consolidation

Why this is next:
- Batch H is no longer untouched; it is the current local batch under review.
- The next untouched large-safe slice after Batch H is late-stage controller dependency-map consolidation.
- It keeps the rollback unit separate from the local CRM extraction and the later wrapper-only cleanup.

Recommended follow-up order after Batch H:
1. Batch I - Late-Stage Controller Dependency-Map Consolidation
2. Wrapper-layer collapse only after Batches H and I

Not the default next batch anymore:
- CEO CRM count / support runtime is no longer the next untouched slice; it is the current local batch under review.
- The pre-blueprint "Batch 16 - startup bootstrap entry sequencing reduction" label remains superseded.

Batch H must not break:
- CEO staff list hydration from `users` into `superadmins`
- CRM own/staff/archive/customer count recomputation and persistence to `users` and `superadmins`
- CEO scope tabs and ownership-pill rendering in leads/customers views
- CEO creator-meta propagation used by lead/customer save, convert, and delete flows
- CEO directory profile patch sync from self-profile updates
