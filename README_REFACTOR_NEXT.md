Current exact next technical batch:
Batch 4 — Startup Bootstrap Dedup/Performance Hardening.

Why this is the next batch:
Batch 1/2/3/3B code work is complete, Superadmin build/version status is shipped in the real Superadmin staff area, and the first-click-after-refresh race fix is shipped.
The next pending technical implementation item is startup dedup/perf hardening.

What must be checked before starting:
- Batch 3B validation evidence is recorded (emulator/staging checklist with pass/fail notes).
- Deployed `GET /api/build-info` is healthy (`200` with commit/branch/env fields).
- Superadmin `staff` build/version card is visible on phone in real flow.
- First click after refresh no longer gets forced back to feed.
- Media upload path works with worker ticket authorization flow on deployed host.

What must not be broken:
- Superadmin staff settings/view behavior, including build/version card rendering.
- Startup/auth/session restore and first-click navigation stability.
- Existing upload flow (`/image/upload`, `/story/upload`) and ticket issuance flow.
- Firestore-protected guest/user/business/CRM paths covered by Batch 3B rules.
