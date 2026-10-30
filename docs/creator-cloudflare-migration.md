# Content Creator: Cloudflare media migration

Status: implementation on `codex/creator-cloudflare-media`, not released.

Scope: Creator promo/shop previews and independent hero uploads use the existing
Cloudflare Worker/R2 binding. Originals remain private and byte-exact. Existing
Firestore assets are copied, never deleted, by the signed-in Heart administrator.
No LifeSkin/pixel changes. No production data is used by local tests.

Activation is capability-gated: deploy the updated Worker with
`CREATOR_CDN_ENABLED=1` only after reviewing the branch. Default is disabled.
`CREATOR_ADMIN_UIDS` may contain comma-separated additional CEO UIDs; the canonical
CEO UID already used by Firestore rules is the default. The existing R2 binding
and media-ticket secret are reused; no new Vercel credentials are needed.
Add a `CREATOR_PRIVATE_BUCKET` binding to a private R2 bucket with public access
disabled. Existing `MEDIA_BUCKET` may have a public R2 origin used by image
resizing, so a key prefix alone cannot protect originals in that bucket.
The same Worker serves both buckets; there is no second Worker/service.
The capability stays disabled until the private binding exists.

Public `/media/` must reject `creator-private/` before consulting the cache.
Paid clean images/originals must never enter public storage. Public marked
previews use immutable random keys. Free previews are public; changing a free
package to paid cannot recall files already saved by visitors.

Downloads re-check existing package/order authorization via the fixed MNYRA
Vercel API, then stream the R2 object from the Worker. Authorization responses
and originals are never publicly cached. Legacy assets/downloads keep working.

Migration runs inside authenticated Heart after capability activation, per page,
with visible progress and retry; public visits never perform migrations. Each
asset is published only after all R2 writes complete. Original chunks remain as
a rollback copy. Migration resumes from completed metadata without re-uploading
successful files, and includes archived originals retained for previous orders.

Validation: targeted Node tests (synthetic assets and mocked services), production
build, clean diff, and worker authorization/cache tests. No production deploy or
Playwright run is performed by this task. Actual iPhone/3G verification remains a
release check; no latency guarantee is inferred from unit tests.

Release order (not performed here):
1. Review/merge the application change and publish the updated existing Worker
   with the private bucket binding, leaving `CREATOR_CDN_ENABLED` unset.
2. Verify the application authorization endpoint and fixed production origin.
3. Set `CREATOR_CDN_ENABLED=1` on the existing Worker. Reload authenticated Heart
   and open Content Creator; progress reports the automatic copy of saved files.
4. Verify on an iPhone, including first visit on a throttled mobile connection,
   free save, paid denial/release, independent hero upload and resumed migration.

Turning off the flag stops new CDN uploads/migrations, but authorized downloads
of already migrated originals keep working while the private binding remains.
The legacy originals are not automatically deleted; their retained storage is
intentional until a separately reviewed cleanup after successful migration.

Implementation validation: targeted Creator/Worker/migration/editor/save tests
and the unchanged LifeSkin pixel lock; `npm run build` succeeds. The build changes
no tracked Social bundle files. Browser/iPhone/3G and live Cloudflare activation
are not claimed as tested. GitHub review is required before a release; the
repository's AGENTS.md prohibits automatic merging and production deploy commands.
