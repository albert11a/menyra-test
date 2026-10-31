# Creator video repair — existing photo/CDN path

## Scope

Repair the low-quality silent Firestore video preview, missing viewer audio, and photo icon on video packs. The capacity commit 7010dc04 only changed package/file limits; these video issues came from f4ff9df8.

Per the user's clarification, videos reuse the exact existing photo route: `POST /image/upload`, the existing `image_upload` owner ticket, the same MEDIA_BUCKET and `/media/social/{owner}/{file}` CDN addresses. There is one shared upload implementation for photos, posters and video derivatives. No new Worker, endpoint, status check, bucket, secret or Firebase deployment is introduced.

The checked-in original Worker explicitly rejects non-image MIME with `image required`. Its existing upload handler therefore needs MP4/WebM support; existing photo limits are retained and video derivatives allow 48 MiB. Video files keep their real video MIME and extension. This small update belongs in the existing Worker; it is not a new Worker. Actual live Worker support has not been verified from a signed-in session.

## Behavior

- Full marked preview: up to 1920px long edge (1080×1920 portrait), 30fps, 6Mbps target, original audio recorded at 128kbps.
- Card: first ~1.4 seconds forward/reverse encoded once at up to 960px long edge, 24fps, 3Mbps target, silent. No play/volume controls, negative playbackRate or reverse seeking on the customer's device.
- Existing `/media/` delivery handles video byte ranges, suffix ranges, HEAD, immutable cache headers, and caches complete objects even when requested using a whole-object Range header. Image transforms and Story behavior are unchanged.
- Sharp posters load before playback; other posters are deferred near the viewport. Videos play only while visible, and pause behind the viewer or in background tabs.
- Opening a video starts the complete preview with audio within the opening tap. Native controls are available in the viewer.
- Paid clean originals remain byte-exact and private with existing purchase/download checks. Only baked-watermark derivatives are uploaded to public R2.
- Existing previews remain available until replacement completes. `Vorschauen aktualisieren` in Heart regenerates the selected shop from saved originals; leave the page open.
- The missing Heart stylesheet revision from the earlier video commit is repaired.

## Validation and activation

Synthetic Chrome test: original 1080×1920 / three-second MP4 with a 440Hz tone. Final full preview: 1080×1920, 1,570,360 bytes. Boomerang: 493,886 bytes. Decoded audio: two channels, RMS 0.0883. Card stayed muted; opened viewer was unmuted and completed playback. This was a narrow Chrome layout, not a real iPhone/Safari test. Production latency and customer media were not tested.

The simplified implementation passed all 178 Creator/pixel regression tests and `npm run build`. No tracked generated bundle changed. The encoder/playback code was unchanged from the earlier Chrome check; a real iPhone/Safari check remains outstanding.

Activation order: update the existing `menyra-media` Worker using `cloudflare-edge/menyra-media-worker.js` while retaining its bindings/settings; publish the client; regenerate the affected shop previews; check upload, silent boomerang and audible viewer on an actual iPhone. The user authorized publishing the client to main on 2026-10-31. That Git push does not update the existing Cloudflare Worker or regenerate saved previews. Those two activation steps remain outstanding; no manual production deployment or production data mutation was performed from this checkout.
