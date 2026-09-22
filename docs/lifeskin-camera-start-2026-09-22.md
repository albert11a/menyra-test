# LifeSkin camera startup correction

Scope: camera startup for Scan and Me foto on /lifeskin.

- Scan now reveals its preview after 450 ms of stable decoded image dimensions,
  with the existing 1400 ms upper settling bound. The camera frame is measured
  before reveal. The existing crop and matching scan geometry stay consistent.
- Photo uses decoded-image readiness instead of awaiting play() indefinitely.
  Startup retries simpler constraints for constraint failures/native aborts;
  permission denial is not retried. Permission requests time out at 30 seconds,
  and missing images after 10 visible seconds. Cancellation closes late streams.
- Photo preview and capture remain unavailable until ready, including restart
  and switching cameras. Capture rejects missing, paused, muted or ended video.

Validation: 94 tests passed across lifeskin-kamera-lifecycle, lifeskin-kamerastart,
lifeskin-stellenfoto, lifeskin-fotos and lifeskin-service-worker. Tests execute
application methods with simulated media/DOM, including changing resolution,
pending play(), delayed permission, rejection, cancellation, repeated starts,
camera switching, stream interruption and phone-sized geometry.

`npm run build` passed. No tracked bundle changes were generated or committed.
Existing circular-chunk and chunk-size warnings remain outside this change.

Browser check attempted using the local dev server: cloud browser rejected
127.0.0.1 with ERR_BLOCKED_BY_CLIENT. No real mobile browser or camera was tested.
This is not certification for every device/browser. Remaining manual checks:
iOS Safari, Android Chrome and Meta in-app browser; allow/deny permission,
Scan and Me foto preview, capture, back/retry, front/rear switch, app switching.
