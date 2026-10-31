# Creator video polish

Baseline: 2478471. Scope: improve bounded preview encoding and loop cadence,
put video packages/assets before photos, show explicit mixed-media counts,
use plain MNYRA-green arrows and add a time/progress control at the rendered
video's lower edge. Keep existing R2 uploader, private downloads and purchase
checks. New video encodings require preview regeneration; existing media is
never rewritten as a side effect of a public page view.

## Behavior and bounds

- All active video-containing packs are the first collection, preserving their
  order, ahead of free/paid photo-only packs. Video assets lead the pack in both
  catalog and viewer. Presentation sorting never mutates saved asset/pack data.
- Mixed badge contains separate video/photo icons and counts, with the existing
  exact media count as its accessible label. Video-only and photo-only badges
  use the matching icon.
- Plain arrows and progress use #9cc450, the existing studio-mark green.
  Range slider lies on the rendered video's bottom edge, including letterboxes;
  elapsed/total time and play/pause sit just above it. Seeking keeps pause state.
  ResizeObserver handles layout/orientation. Animation stops with the video;
  per-frame time updates don't remeasure layout.
- New boomerangs use up to 1080px on the long edge (was 960), no upscaling,
  a shorter up-to-1.2s forward sequence, source-derived cadence up to 30fps,
  mirrored endpoints without duplicated turnaround frames, manual capture when
  supported and a single recording chunk. Ordinary canvas capture is the fallback.
  Frames are bounded by both 36 and 128 MiB. No additional CDN requests/player
  clones were introduced. Native decoder loop behavior remains browser-dependent.
- Full preview remains up to 1920px on the long edge. Prefer supported H.264 Main
  for compression at the same requested bitrate, with the established formats
  as fallbacks (including constructor rejection). Main and other codecs may
  produce different actual file sizes. Requests remain 6 Mbps full/3 Mbps loop,
  not raised; HD video loads only when the viewer is opened, offscreen media
  stays deferred/paused. Larger poster is used in the video viewer only.
- No claim of identical latency or a measured quality gain on every source:
  source resolution, codec and bandwidth still limit results. No 3G/4G/iPhone
  network or visual benchmark was available. Existing previews require Heart's
  `Vorschauen aktualisieren`; controls/order/badges apply without regeneration.

Technical reference for manual canvas frame capture:
https://www.w3.org/TR/mediacapture-fromelement/

## Validation

- 101 focused video/shop/upload/share/download/pixel tests passed after final
  runtime changes. The seven encoder/start/control tests were rerun after
  adding the advertised-but-rejected Main codec fallback scenario, all passed.
- Broader Creator/menu/pixel run: 196/197 passed. The only failure is the known
  unchanged visitor-count assertion in creator-heart-overview (already reproduced
  on the prior baseline during the preceding repair). No analytics change.
- Tests cover presentation ordering without mutation; mixed badge counts;
  elapsed time/seek/pause; portrait/landscape letterbox geometry and resize;
  encoder dimensions/unchanged requested rates; single-chunk loop recording;
  manual frame capture and ordinary capture fallback; codec fallback; private
  original download bytes and permission checks; preserved Safari gesture flow.
- npm run build and git diff --check passed. No tracked generated bundle changed.
  CSS and new runtime helpers are included in static output.
- No real iPhone/mobile visual check, production upload, measured loop seam,
  image-quality comparison, throttled 3G/4G run, Playwright/smoke or production
  deploy command was run. Those remain explicit manual verification limits.
