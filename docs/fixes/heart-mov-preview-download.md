# HEART MOV upload and preview download

Scope: recognize MOV exports with missing/generic or QuickTime alias MIME,
separate invalid format/empty/over-30-MB errors, and add a per-video preview
export in the Heart package gallery. Keep 30 MB/60 seconds and private originals.

Reuse validated marked full-length CDN video including its recorded audio.
For clean/free or older missing derivatives, render the private original with
an explicitly enabled watermark. Never use the original as a download fallback.
Offer a download link and a fresh-tap file share action for iOS.

Verification: see task report. Actual iPhone MOV upload, sound, download, and
Photos share-sheet save require device verification. No production deployment.

Validation completed 2026-11-14:
- `node --test tests/creator-video*.test.mjs tests/content-creator*.test.mjs`:
  189 tests passed, zero failures.
- `npm run build`: passed, encoder H.264 check included.
- `git diff --check`: passed.
- No tracked generated bundle files changed; none require committing.
- Mobile/device and browser smoke tests were not run.
