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

Verification: Node regression tests and production build. Real iPhone Safari
reload timing and native share sheet still require a device check.
