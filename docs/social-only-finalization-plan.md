# Social-Only Finalization Plan

Date: 2026-03-08
Scope: Keep `menyra-social` as primary app, remove unrelated apps only after safe decoupling.

## Progress Status
- Completed:
  - Step 1 Decouple social runtime links
  - Step 2 Add temporary compatibility redirects
  - Step 5 Remove dead code and legacy paths (ongoing incremental cleanup)
  - Step 6 Soft-disable external app entrypoints
  - Step 7 Delete non-social app directories (including `apps/menyra-main`)
- In progress:
  - Step 8 Clean platform config (remaining: final routing simplification after regression pass)
- Pending:
  - Step 3 Split social bootstrap + lazy loading
  - Step 4 Listener lifecycle hardening
  - Step 9 Regression + performance pass

## Current Safety Baseline
- Restore tag pushed: `social-safepoint-2026-03-08-pre-cleanup`
- Rollback command:
```bash
git checkout main
git reset --hard social-safepoint-2026-03-08-pre-cleanup
git push --force-with-lease origin main
```

## Audit Findings (must be decoupled before deleting other apps)
- Direct paths in social app:
  - `apps/menyra-social/social-app.js:5820` -> `/apps/menyra-ceo/dashboard.html`
  - `apps/menyra-social/social-app.js:5821` -> `/apps/menyra-owner/index.html`
  - `apps/menyra-social/social-app.js:5822` -> `/apps/menyra-staff/dashboard.html`
  - `apps/menyra-social/social-app.js:8281` -> `apps/menyra-restaurants/guest/story/index.html`
- Platform routing still references other apps:
  - `vercel.json` host/path rewrites for `ceo`, `owner`, `staff`, `waiter`, `kitchen`, `menyra-restaurants`
  - `index.js` demo links include restaurants/ceo/staff/owner entries
  - `apps/menyra-main/main.js` links to restaurants guest pages

Status:
- All findings above have been addressed in code/routing before directory removal.

## Execution Strategy (small reversible steps)
1. Decouple social runtime links
- Replace cross-app links in `social-app.js` with social-local routes or remove the switch action.
- Verify: role switch UI and story click do not produce 404s.
- Commit.

2. Add temporary compatibility redirects
- Keep old paths alive by redirecting removed app paths to social equivalents.
- Verify: old bookmarks/open links still open valid social screens.
- Commit.

3. Split social bootstrap and enable lazy loading
- Extract app bootstrap + tab loaders; load tab modules on demand.
- Verify: first paint, feed open, chat open, profile open.
- Commit.

4. Listener lifecycle hardening
- Ensure single active listener per scope and guaranteed unsubscribe.
- Verify: no duplicate notifications/messages after tab switches.
- Commit.

5. Remove dead code and legacy paths
- Delete unused helpers/branches identified by static scan.
- Verify: lint/check + main flows still pass.
- Commit.

6. Soft-disable external app entrypoints
- Remove nav/links to non-social apps from root/hub pages.
- Keep redirects for backward compatibility.
- Verify: all entry links stay valid.
- Commit.

7. Delete non-social app directories
- Remove `apps/menyra-restaurants`, `apps/menyra-ceo`, `apps/menyra-owner`, `apps/menyra-staff` after decoupling.
- Verify: build/runtime has no missing asset/import/path.
- Commit.

8. Clean platform config
- Remove obsolete rewrites/routes/functions references for deleted apps.
- Verify: deploy preview routing and PWA/service worker behavior.
- Commit.

9. Regression and performance pass
- Auth, feed, shop, chat, push, deep links, profile, map, mobile Safari/Android checks.
- Compare startup and interaction timings against baseline.
- Commit final stabilization fixes.

## Test Gate for Every Step
- `node --check apps/menyra-social/social-app.js`
- `node --check` for each new/changed module
- Manual smoke:
  - open app
  - feed scroll
  - shop product drawer tap behavior
  - chat open/send/auto-scroll
  - notification open target
  - refresh while authenticated

## Rule
- No directory deletion before decoupling + compatibility redirects are in place.
