# Creator web-video compression

Scope: optimize only already-public Creator video derivatives, once during upload or
an authenticated Heart migration. Keep pixel dimensions, baked watermark, static
covers, playback UI and byte-exact private download originals unchanged. Continue
using the existing authenticated story uploader and Cloudflare R2 URLs. No Worker
or Firebase deployment and no compression on a visitor's playback request.

Implementation: CEO-only Vercel endpoint downloads an allowlisted, same-owner R2
video, encodes H.264 CRF 18 with faststart, retains audio, and uploads the result
using the existing Firebase-issued story_upload ticket. Only replace the source
when the output saves at least 5%. Each request has a bounded input, encoder time
and temporary directory. The browser publishes only a completed result; existing
assets are updated transactionally after checking the page, product mode and
source have not changed. Errors keep the working source and remain retryable.

Existing videos require one authenticated Content Creator visit after the GitHub
change has deployed. Migration uses the existing Heart migration progress/error
surface; it runs one video at a time and never sends private original chunks to
the optimizer. No Cloudflare dashboard access is required. This reduces transfer
size; it does not repair the Worker's separate HTTP Range issue or guarantee an
instant first frame on every connection. Re-encoding is lossy, with unchanged
pixel dimensions; no promise of bit-identical image quality.

Validation:
- `npm run build`: passed; no tracked generated bundle changes.
- Video/CDN/optimizer and locked Pixel checks: 46 tests passed.
- Broader Creator suite: 205/206 passed. The pre-existing visitor-count test
  expects 1 but receives 2; the unmodified HEAD analytics module reproduces 2.
  No analytics or Pixel code was changed.
- Actual packaged FFmpeg tested with a generated synthetic fixture: dimensions,
  audio and front-loaded MP4 metadata checked.
- Offline analysis copies of the three already-public previews: Fragrance
  8,489,623 -> 3,492,309 bytes (59%); Paparazzi 12,949,620 -> 7,410,409 (43%);
  Lumturi 13,199,505 -> 7,837,633 (41%). Width/height and frame counts match;
  source AAC audio is copied. These are local results, not production migration.
- No authenticated production migration, production deploy command, browser
  smoke/Playwright or real mobile timing test was run. Cloudflare Range remains
  a separate issue. Open Content Creator in signed-in Heart after deployment and
  leave it open until the migration progress finishes; failures keep old URLs.


Deployment packaging: Vercel npm skips unapproved dependency scripts. Pin the
ffmpeg-static installer approval to 5.3.0 and check H.264 encoder availability
at build time. The function explicitly includes the platform binary.

Owner correction: production rejected old videos before encoding because the
selected first restaurant ID did not match the stored R2 owner path exactly.
Resolve each existing video's owner against all restaurants created by the
authenticated user. Match lowercase Worker keys back to the actual mixed-case
Firestore ID; use that exact ID for Firebase ticket authorization. Server path
comparison permits only case differences in the owner segment; foreign owners
and untrusted origins remain rejected. Added multi-business and mixed-case
regressions; 45 video tests passed, build passed.
