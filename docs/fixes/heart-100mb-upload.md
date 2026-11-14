# HEART Creator package uploads up to 100 MB

Scope: raise Creator package photo/video original uploads to 100 MiB per file
(labelled MB in the existing UI). Preserve the 60-second video duration and
48 MiB encoded-preview cap. Photo Studio, header and sample uploads retain
their separate limits.

Align client validation, preview encoding input, original recovery, public media
metadata and authorized server download readers. Keep original chunks at
400,000 bytes, with at most 263 parts for a 100 MiB file. Upload at most six
small slices at once instead of reading the whole original into JS memory.
No Firebase rules or production data changes.

Validation 2026-11-14:
- Creator suite: 192 passing tests, including actual 100 MiB sliced-original
  upload and exact boundary acceptance/rejection.
- After tightening server metadata guards, 43 affected server/image/video tests
  passed again; final `npm run build` passed with the H.264 encoder check.
- `git diff --check` passed. No tracked generated bundles changed.
- No browser/mobile device tests run; actual iPhone upload still needs checking.
