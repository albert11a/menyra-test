# Content Creator: existing MNYRA Cloudflare path

Status: user explicitly requested commit/push to main on 2026-10-30.
This supersedes the repository's default preparation-branch restriction for
this task. No manual production deployment command is needed: the existing
Vercel Git integration builds main.

Public Creator previews and independent title images reuse the deployed
`POST /image/upload` endpoint and the existing MEDIA_BUCKET / Cloudflare CDN.
The existing Firebase image-upload ticket authenticates the signed-in Heart
administrator. There is no Worker modification, new endpoint, new bucket,
feature activation, additional credential or Cloudflare dashboard step.

Paid clean originals remain byte-for-byte in the existing CEO-only Firestore
originals/chunks collection. Their existing order/payment check is unchanged.
Only watermarked derivatives of paid photos are uploaded to public R2.
Free originals up to the existing 15 MB image-upload limit can additionally be
uploaded publicly for faster saves; if that optional upload fails, or the file
is larger, its existing protected download path remains available.
A file previously offered for free cannot be recalled after a price change.

When the administrator opens Content Creator in Heart, existing active images
are copied to the same CDN automatically, one image at a time. Completion is
stored per image; interrupted work resumes without re-uploading finished
images. Captions, existing links and old original chunks are preserved.
Archived originals for previous orders are not moved or deleted; those orders
continue using their established protected download path.

Public HTML includes CDN image addresses before JavaScript starts. Only the
visible hero gets high priority; other cards load lazily. Independent hero
images can be uploaded, sorted and removed without adding them to a package.

Saving reuses prepared Files and can open the share menu on the first tap when
preparation finished. Touch/focus starts preparation. Automatic preparation is
limited to visible free packs with known total size up to 12 MB, and skips 3G
or data-saving connections. Large originals still require a real transfer.

Validation uses synthetic assets and mocked services, followed by the production
build and existing pixel lock. Actual iPhone and throttled 3G browser verification
are not inferred from unit tests. No LifeSkin pixel or Worker changes are included.
