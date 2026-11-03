# Purchase previews and download feedback

Scope: keep the Creator Vite split from fefbcf7; change only purchase preview
loading and single-photo button feedback. No original file or checkout changes.

- Start the first two thumbnails per purchased package from the initial HTML,
  including purchases below the fold; keep later thumbnails lazy.
- Allow successful sold-preview redirects and image responses to remain in the
  browser cache for five minutes. Keep private caching; authorization still runs
  on cache misses, and errors, receipts and original downloads stay no-store.
- Keep loading and ready-to-save feedback in the existing button. Retain inline
  errors and native share cancellation behavior.

First-visit follow-up: include existing delivery CDN metadata in the HTML when
it is available within a short budget, alongside cover preparation. Preload the
first two released purchase previews from the head using the exact same URLs as
their image elements. Preserve preview dimensions/encoding and all original
downloads. Fall back to the existing authorized preview endpoint when metadata
is missing or slow; do not hold the entire shop behind cold image preparation.

Verification: Node regression tests and production build. Real iPhone Safari
reload timing and native share sheet still require a device check.
