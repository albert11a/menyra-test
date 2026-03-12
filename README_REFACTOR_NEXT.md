# MNYRA Refactor Next

Last updated: 2026-03-12 03:02:22 +01:00

Current committed checkpoint:
- `current HEAD` - `Batch I - Social Engagement Support Runtime Extraction`
- Latest committed code batch under that checkpoint: `current HEAD` - `Batch I - Social Engagement Support Runtime Extraction`

Current local batch state:
- No active local uncommitted runtime batch.

Current exact next step:
- Smoke-test the committed Batch I extraction.
- If green, start Batch J - Push / Notifications / Follow Runtime Extraction as the next rollback unit.

Current recommended next batch:
- Batch J - Push / Notifications / Follow Runtime Extraction

Why this is next:
- Batch I removed the largest remaining real runtime block still owned inline by `social-app.js`.
- Push/follow runtime is now the next untouched cohesive runtime surface with a clear testing boundary.
- Composition-root dependency-map cleanup and wrapper collapse stay deferred until the larger runtime domains are gone.

Batch I must not break:
- post like/comment count updates and post-modal live refresh
- menu-item like/comment count updates and menu-detail live refresh
- profile post widen/narrow/delete actions
- post/menu comment avatar refresh and comment-highlight behavior
- favorite menu payload/doc-id generation and menu-social doc resolution
