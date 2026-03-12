# MNYRA Refactor Next

Last updated: 2026-03-12 01:19:42 +01:00

Current local completed batch (uncommitted):
- None.
- Batch G is now the current committed checkpoint.

Current committed safe checkpoint:
- `current HEAD` - `Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction`
- Latest committed code batch under that checkpoint: `current HEAD` - `Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction`

Current exact next step:
- Review and smoke-test the committed Batch G extraction.
- If approved, execute Batch H - CEO CRM Count / Support Runtime Extraction.

Current recommended next batch:
- Batch H - CEO CRM Count / Support Runtime Extraction

Why this is next:
- Batch G is now committed at `HEAD`.
- The next untouched large-safe runtime cluster in the roadmap is CEO CRM count / support runtime.
- It keeps the rollback unit separate from late-stage dependency-map cleanup and wrapper-only cleanup.

Recommended follow-up order after Batch G:
1. Batch H - CEO CRM Count / Support Runtime Extraction
2. Batch I - Late-Stage Controller Dependency-Map Consolidation
3. Wrapper-layer collapse only after Batches H and I

Not the default next batch anymore:
- Shell / auth / drawer / notifications DOM runtime is no longer the next slice; it is the current committed checkpoint to review.
- The pre-blueprint "Batch 16 - startup bootstrap entry sequencing reduction" label remains superseded.

Batch G must not break:
- auth screen open/close and login/register toggle rendering
- drawer rendering, drawer-open/drawer-close DOM state, and role-switch links
- shell header/drawer avatar, title, subtitle, and menu-nav patching after profile changes
- notification unread/chat badge updates in header and drawer
- notification list refresh plus mark-all / accept-follow / delete / open delegation
