# MNYRA Refactor Rollback Guide

Last updated: 2026-03-12 01:19:42 +01:00

## Current committed safe checkpoint
- `current HEAD` - `Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction`
- Latest committed code batch under that checkpoint: `current HEAD` - `Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction`

## Current local batch note
- There is no active local uncommitted runtime batch at the moment.
- The latest rollback-safe checkpoint is the current committed Batch G `HEAD`.
- If Batch G is rejected later, revert or rework that committed batch as one unit.

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
15. `edf0cf4` - menu/focus public runtime extraction
16. `b9b54c7` - orders runtime + orders view extraction
17. `ccb962a` - media upload runtime extraction
18. `af24d17` - docs(refactor): correct social-app line count
19. `ba600be` - refactor(social): extract feed story runtime

## Current rollback guidance for the next approved runtime batch
- Review Batch G before starting Batch H.
- Keep the next committed batch single-domain.
- Do not mix CEO CRM count/support runtime with the local shell/auth/drawer/notifications DOM batch, dependency-map cleanup, or wrapper cleanup in the same rollback unit.
- Do not reopen feed/story or shell/auth/drawer/notifications DOM work in the next batch unless Batch G review finds a regression.
- Do not use the old "Batch 16 startup sequencing" label unless a future approved batch actually matches that scope.

## Mandatory rollback documentation rule
- If a runtime batch is reverted later, update:
  - `README_REFACTOR_MASTER.md`
  - `README_REFACTOR_LOG.md`
  - `README_REFACTOR_NEXT.md`
  - `README_REFACTOR_ROLLBACK.md`
  - `README_SOCIAL_APP_REDUCTION_MASTER.md`
