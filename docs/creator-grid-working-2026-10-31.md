# Creator package grid and Working status

Owner request: two equally sized package cards per row, edge-to-edge filled images without side gutters. Keep Alle in its current position; businesses not yet Ready belong to Working.

Implementation scope: group package cards in a two-column grid; equal portrait image frames with object-fit cover, compact consistent footers; existing image swiping and editors retained. Businesses default to Working, uploading pictures/packages does not promote them to Ready, and visit telemetry cannot move Working businesses into Seen. Existing explicit Ready/sent, customers and archive remain valid. Alle/chip ordering and production business records are not migrated. CSS revision stays synchronized across both Heart entries, runtime repair and offline precache.

Validation: 142 Creator/Heart/pixel regression tests passed; npm run build passed (existing chunk-size warning only). No tracked generated bundle files changed. git diff --check passed. No production data writes, test orders, notifications or Pixel changes. Real mobile/browser visual verification remains outstanding; automated markup/status tests do not establish actual device layout.
