# Faster Creator video opening

User clarification: fix real playback startup speed; no visual makeover.
Retain cover-only catalog and the existing viewer. Prepare at most one paused
full-preview video (metadata once a visible cover is loaded; auto on pointer
or keyboard intent), then move that exact buffered element into the viewer.
Do not restart its source/load on opening. Start playback from the opening tap.
Retain the same player paused at the beginning on close for quick reopening.
Release it when changing candidates/page exit. No looping preview/second-player
handoff, new UI, original prefetch, or fetching every listed video.

Finding: replacing autoplay cards with covers removed the earlier media warm-up.
The current viewer creates a fresh video and starts its first request only after
click. It also requests a different large poster instead of reusing the cached
cover. This change targets the cold network/decoder path, not an overlay effect.

## Loading changes

- Once a selected cover has loaded and is in the viewport, prepare at most one
  detached paused full-preview video with preload=metadata. Skip this speculative
  warmup when Save-Data is enabled, a sheet/viewer is open or the page is hidden.
- Pointerdown or Enter/Space on a video card promotes that chosen candidate to
  preload=auto. Changing the candidate cancels/releases the old resource.
- Opening moves that same element into the current viewer slide. Its src and
  selected resource are retained; playback starts from the click before generic
  image work. The existing visibility controller does not issue load() again.
- Closing retains one paused player rewound to the beginning, including when
  the user closes on a neighboring photograph. On reopening its controls bind
  to the new viewer. Page exit releases the prepared resource.
- Reuse the cached cover as the poster from initial viewer markup; do not issue
  a second, larger poster request on opening. No additional visual overlay,
  carousel/layout/CSS changes, looping previews, video format or original
  download changes are included.

This intentionally revises strict cover-mode no-prefetch behavior to address
startup. Metadata/auto are browser hints, not byte or latency guarantees. This
is one bounded candidate, not all videos. Only the protected full preview is
prepared, never the original download. No Worker/CDN deployment is involved.

Primary preload references:
https://developer.apple.com/documentation/webkitjs/htmlmediaelement/1633059-preload
https://web.dev/articles/fast-playback-with-preload

## Validation

108 targeted video/cover/viewer/upload/download/share/shop/pixel checks passed.
New tests cover metadata warmup after a visible cover, promotion on intent,
zero play before click, exact element identity and one load across opening,
audible play from the click, close/reopen and control rebinding, closing on a
neighboring photo, bounded candidate replacement, failed-resource replacement
and cleanup. These exercise the real helper/controller with simulated media
methods; they do not measure Safari network/decoder latency.

npm run build and git diff --check passed; no tracked generated bundle changed.
No real iPhone/mobile startup measurement, throttled bandwidth test,
Playwright/smoke or production deploy command was run. Fast startup still
requires the browser to honor preload and sufficient network/media readiness.
