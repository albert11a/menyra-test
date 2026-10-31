# Creator videos — reuse the working menu uploader

## Finding and scope

The menu already supports video. `apps/menyra-social/core/menu/menu-save-utils.js` calls `uploadRawMediaFile(file, restaurantId)` from `apps/menyra-social/core/media/media-upload-runtime-controller.js`. That function uses the existing `story_upload` owner ticket, `POST /story/upload`, MEDIA_BUCKET and `/media/stories/{business}/{file}` CDN URLs. It uploads the supplied bytes without a video re-encoder and separately captures an image poster. No Story document is created by the upload function.

Heart already uses this exact runtime for video media in `heart-crm-admin-write-adapter.js`, with a managed restaurant resolved by `restaurants.createdByUid == auth.uid`. Creator now uses the same actual runtime function and owner-resolution contract. It does not implement a parallel video upload client. The owner is cached per account; failed uploads clear the cache so a retry can resolve current ownership. Missing ownership fails before upload.

The earlier conclusion that a Worker change was necessary was incorrect: it considered only `/image/upload`, not the existing menu video route. The existing Worker's 24-hour value is a cache lifetime, not object deletion or an expiry check. Objects remain readable from R2 after cache expiry. Independent bucket lifecycle configuration was not inspected. The earlier Worker modifications are completely reverted to the pre-repair version (7010dc04). No Worker deployment, new endpoint, bucket, credentials or Firebase deployment is needed.

## Creator behavior preserved

- Paid originals stay byte-exact and private with existing purchase/download checks. Only baked-watermark video derivatives are sent through the menu uploader.
- Full video retains audio, up to 1080×1920 portrait. Card uses a short, silent forward/reverse boomerang without play/volume controls.
- Sharp poster appears before playback; other posters load near the viewport. Offscreen/covered/background videos pause.
- Video packs show a video icon. The earlier missing stylesheet revision is repaired.
- Existing video previews are unchanged until regenerated from protected saved originals with Heart's existing `Vorschauen aktualisieren` action. Keep the page open while processing; no original re-upload is needed.

## Verification

Synthetic tests execute the actual menu uploader against mocked authentication/network and the unmodified Worker. They cover the business owner and exact ticket/route, original derivative bytes and MIME, old-object retrieval after the cache duration, unauthorized/missing owner failures, retry cache invalidation, poster/image delivery, private paid downloads and current manifest filtering. No production Firebase data is used.

The encoder/playback code was unchanged from the earlier Chrome test: 1080×1920 / three-second input with a 440Hz tone; full preview 1,570,360 bytes; boomerang 493,886 bytes; decoded audio two channels, RMS 0.0883. Cards stayed muted and opened viewer played unmuted. This was a narrow Chrome layout, not a real iPhone/Safari test. Production upload/latency was not tested.

All 197 targeted Creator, menu-video, LifeSkin-media and pixel regression tests passed; `npm run build` passed. The existing menu uploader and its dependencies are present in production output. No tracked generated bundle changed. Publishing to main requires no Cloudflare activation; existing saved previews still need regeneration in Heart.
