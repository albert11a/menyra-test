# Static Creator video covers

Scope: replace all public non-viewer video previews with the existing protected
poster image variants. No video element/source/autoplay on catalog, hero, cart
or purchases. Keep video icons/counts, video-first order, image carousel and
existing full audible viewer with play/pause/progress and original downloads.
Existing posters are reusable; no regeneration or new upload is required.

## Implementation

The shared renderer emits a normal protected img for any non-viewer video,
using the same R2 poster variants/image endpoint, lazy/adjacent image loading
and image dimensions as photos. Only viewer:true emits a video element and
full marked video URL. Catalog/hero/cart/purchase covers contain no video source,
autoplay element or boomerang request. Badges/order still use mediaType metadata.

Poster failures/retries cannot replace a running viewer video, and a failed
cover does not prevent opening the underlying video. The upload/encoder is
unchanged; existing boomerang files may remain stored but aren't requested by
public non-viewer surfaces. Private originals and downloads remain unchanged.

## Validation

103 focused video, viewer, shop, upload, share, download and pixel tests passed.
Broader Creator/menu/pixel run: 198/199 passed; only the known unchanged visitor
count assertion fails (creator-heart-overview, expected 1 / actual 2).
Tests cover image-only catalog/hero with three videos, no video source before
opening, audible viewer/progress preservation, close returning to image-only
markup, failed-cover opening, failed/retried-cover preserving the video node,
protected paid poster URLs and private-original download permissions.

npm run build and git diff --check passed. No tracked generated bundle changed;
static output includes the cover renderer. No real iPhone/mobile visual test,
throttled bandwidth benchmark, Playwright/smoke or production deploy command
was run. Real device loading time is not claimed as measured.
