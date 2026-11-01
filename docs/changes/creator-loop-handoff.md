# Creator preview loop handoff

Scope: fix the visible pause/stray frame at the end-to-start boundary of the
silent public boomerang. The prior encoder refinements did not solve the
reported browser playback boundary. Keep upload, encoding, original downloads,
large audible viewer, ordering and controls unchanged. Replace the visible
native rewind with a prewarmed, frame-confirmed preview handoff where supported,
with native loop fallback and bounded lifecycle/resource cleanup.

Baseline: b93957f. Existing previews should work without regeneration.

## Implementation

- Apply only to silent previews with requestVideoFrameCallback/cancellation.
  The audible full viewer remains on the existing player. Unsupported browsers
  use the established native loop. Encoder/uploader/public media are unchanged.
- Warm at most one additional decoder per active preview, using the exact same
  CDN URL, only after the short clip (0.5–6 seconds) is fully buffered. No larger
  asset, frame atlas, original or higher bitrate is fetched. The browser may
  issue additional cached/range requests; byte/latency equality is not promised.
- Start the prepared decoder just before EOF and reveal it only after its own
  composited frame callback. A 50 ms maximum overlap hides native EOF rewind;
  the outgoing decoder is paused/reset while covered, then reused next cycle.
  Incoming opacity .001 keeps it eligible for Safari composition before reveal.
  No poster is copied into the second player. Late, rejected or timed-out starts
  retain native looping instead of showing a stale incoming frame.
- Separate active-player state prevents normal visibility synchronization from
  restarting the covered original. Pause/background/covered/offscreen/destroy
  cancel frame callbacks and timers, pause both decoders and release the buffer.
  Late promise rejection/error callbacks cannot affect a new playback session.
- Existing previews need no regeneration. No CSS, ordering, viewer controls,
  audio, uploads, purchase checks, private download or pixel changes.

Frame-callback reference: https://wicg.github.io/video-rvfc/

## Validation

110 focused preview/viewer/upload/download/share/shop/pixel tests passed,
including nine new loop-handoff scenarios: multiple cycles with one buffer,
first-download buffering, no switch before a real frame, native-wrap/timeout
rejection, muted autoplay rejection, pause/destroy cleanup, unsupported/audible
viewer fallback, visibility integration, stale play rejection and buffer errors.
Tests use simulated frame callbacks/media state, not actual Safari decoding.

npm run build and git diff --check passed; no tracked generated bundle changed.
The new helper is included in static build output. No real iPhone/mobile visual,
actual network/decoder timing, Playwright/smoke or production deploy command was
run. Final visual smoothness and browser range/cache behavior remain unmeasured.
