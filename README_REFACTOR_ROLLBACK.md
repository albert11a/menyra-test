# MNYRA Refactor Rollback Guide

Last updated: 2026-03-12 03:02:22 +01:00

## Current committed safe checkpoint
- `current HEAD` - `Batch I - Social Engagement Support Runtime Extraction`
- Latest committed code batch under that checkpoint: `current HEAD` - `Batch I - Social Engagement Support Runtime Extraction`

## Current local batch note
- No active local uncommitted runtime batch.
- The latest rollback-safe checkpoint is the committed Batch I `HEAD`.

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
18. `ba600be` - feed story runtime extraction
19. `6a61573` - shell DOM runtime extraction
20. `844d435` - CEO CRM count/support runtime extraction
21. `current HEAD` - social engagement support runtime extraction

## Current rollback guidance for the next approved runtime batch
- Start Batch J as its own rollback unit after Batch I smoke validation.
- Keep the next committed batch single-domain.
- Do not mix push/follow runtime extraction with feed/profile support or composition-root cleanup in the same rollback unit.
