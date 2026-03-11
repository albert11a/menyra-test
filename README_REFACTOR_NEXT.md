Current exact next step:
Execute Batch 3B Firestore validation gate in emulator/staging and capture pass/fail evidence for all critical path groups, while also validating the deployed Superadmin Staff Build Status card (`staff` view) on real host(s).

Why this is the next step:
Code for Firestore hardening, Superadmin build-status visibility, and startup first-click navigation stability is already in `main`.
The remaining blocker is still missing runtime validation evidence for the hardened ruleset and deployed runtime behavior.

What must be checked before doing it:
- Verify `GET /api/build-info` responds `200` on deployed host with `commitShort`, `branch`, `environment`.
- Open Superadmin `staff` view on mobile and confirm Build Status card renders (commit/build/branch/env).
- Confirm first navigation click after refresh no longer bounces back to feed.
- If timestamp is `unknown`, decide whether to inject `BUILD_TIMESTAMP_UTC` in deploy env.
- Run full Batch 3B checklist (public/auth/business/chat/CRM + negative ownership test) in emulator/staging.

What must not be broken:
- Existing leads/staff/customers CRM behavior.
- Startup/auth/session restore behavior (including first-click navigation stability).
- Firestore-gated guest/user/business/CRM flows covered by Batch 3B checklist.
