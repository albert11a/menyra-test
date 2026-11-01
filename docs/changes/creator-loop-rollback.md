# Revert the unsuccessful preview handoff

User reports a dark bar on the third video and worse playback, without the
requested seamless boundary. Revert 95b2a8b completely to the b93957f preview
player. Remove the extra decoder helper and its tests/documentation. Preserve
all earlier upload, encoding, video-first ordering, media badges, green arrows,
viewer progress, sound and download changes. Rename the paid photo collection
to `Fotot per biznesin tend` as requested.

## Analysis and recommendation

The rejected helper could keep one additional prepared video element per
visible preview. Three eligible previews could therefore keep three active
players plus three prepared players (both play during a brief overlap).
It added compositor/layer changes as well as decoder resources. That is a
plausible contributor to the reported mobile slowdown/rendering regression;
the screenshot alone does not establish the exact black-bar cause.

The original player already pauses offscreen/covered videos, but every current
visible preview at least 25% onscreen is eligible to autoplay. Native looping
can still show the original end/start seam after this rollback. Forward-only
autoplay removes the reverse effect, but still downloads/decodes videos and
still loops at EOF; it does not reliably address the underlying constraints.

Recommend a static poster/cover image in the catalog with the existing video
icon and media counts; fetch/play the full audible video only when opened.
That avoids video download/decoding on the catalog and removes loop seams from
it. Existing watermarked poster image variants can supply the cover. A cover
mode has NOT been enabled: the user asked for analysis before deciding.

Primary reference: https://web.dev/articles/lazy-loading-video

## Verification

101 focused video, viewer, shop, upload, share, download and pixel checks pass.
npm run build and git diff --check pass. No tracked generated bundle changed.
The playback module matches b93957f exactly. The only functional difference from
that stable snapshot is the requested photo-collection heading. Removed tests
belong exclusively to the reverted implementation. No mobile browser retest,
production-data access, Playwright/smoke or production deploy command was run.
