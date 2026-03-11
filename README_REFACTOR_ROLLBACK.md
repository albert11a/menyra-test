# MNYRA Refactor Rollback Guide

Last updated: 2026-03-11 21:40:12 +01:00

## Current committed safe checkpoint
- `8183197` - `refactor(social): extract auth profile resolution runtime`

## Current local batch note
- The current local work in this chat is `Batch C - Menu / Focus Public Catalog Runtime Extraction`.
- It is not committed or pushed, so the committed safe rollback point remains `8183197`.
- If this batch is rejected, revert or rework the entire local Batch C unit together.

## Rollback principle
- Roll back by completed batch boundaries.
- Never partially revert a coupled runtime batch.
- Keep README tracking files aligned with the real rollback target.

## Safe rollback points
1. `7c1844c` - startup public bootstrap fetch dedupe
2. `252645a` - startup/auth silent failure surfacing
3. `4edc9f1` - listener lifecycle cleanup
4. `a5ff4c9` - auth-profile bootstrap handoff dedupe
5. `090eff5` - auth-startup state helper extraction
6. `2c6daba` - auth session startup coordinator extraction
7. `815e8fa` - startup bootstrap wiring reduction
8. `e79c85e` - pending route startup state extraction
9. `be44f5a` - post-login route coordination reduction
10. `2e0e715` - public profile runtime extraction
11. `4aaf0fc` - restaurant identity runtime extraction
12. `4ebadb2` - public bootstrap runtime extraction
13. `69981fa` - self profile runtime extraction
14. `8183197` - auth profile resolution runtime extraction

## Current rollback guidance for the next approved runtime batch
- Review Batch C before starting Batch D.
- Keep the next committed batch single-domain.
- Do not mix menu/focus publication work with order-write flow changes in the same rollback unit.
- Do not mix upload/post publishing runtime with commerce or CRM runtime in the same rollback unit.
- Do not use the old "Batch 16 startup sequencing" label unless a future approved batch actually matches that scope.

## Mandatory rollback documentation rule
- If a runtime batch is reverted later, update:
  - `README_REFACTOR_MASTER.md`
  - `README_REFACTOR_LOG.md`
  - `README_REFACTOR_NEXT.md`
  - `README_REFACTOR_ROLLBACK.md`
  - `README_SOCIAL_APP_REDUCTION_MASTER.md`
