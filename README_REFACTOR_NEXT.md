# MNYRA Refactor Next

Last updated: 2026-03-22 17:51:00 +01:00

Current committed checkpoint:
- `current HEAD` - `Batch I - Social Engagement Support Runtime Extraction`
- Latest committed code batch under that checkpoint: `current HEAD` - `Batch I - Social Engagement Support Runtime Extraction`

Current local batch state:
- Active local uncommitted Batch J work is in progress.
- Follow runtime ownership is extracted locally.
- Notification persistence / write support is extracted locally.
- Push registration runtime is still pending locally.
- No commit/push has been made for this local Batch J work.

Current exact next step:
- Use `docs/social-batch-j-push-notifications-follow-contract.md` as the execution contract.
- Finish the remaining push registration runtime extraction.
- Re-run the Batch J validation gate before any commit/push decision.

Current recommended next batch:
- Batch J - Push / Notifications / Follow Runtime Extraction

Why this is next:
- Batch I removed the largest remaining real runtime block still owned inline by `social-app.js`.
- Push/follow runtime is now the next untouched cohesive runtime surface with a clear testing boundary.
- Composition-root dependency-map cleanup and wrapper collapse stay deferred until the larger runtime domains are gone.

Batch J control contract:
- `docs/social-batch-j-push-notifications-follow-contract.md`

Batch I must not break:
- post like/comment count updates and post-modal live refresh
- menu-item like/comment count updates and menu-detail live refresh
- profile post widen/narrow/delete actions
- post/menu comment avatar refresh and comment-highlight behavior
- favorite menu payload/doc-id generation and menu-social doc resolution
