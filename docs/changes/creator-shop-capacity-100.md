# Creator shop capacity: 100 packages / 100 files

User request 2026-10-31: the existing 10-package limit blocks adding the first
video to a shop with ten photo packages. Raise shop capacity to 100 packages
and 100 total photo/video files. Keep file-size, video-duration and promo-page
limits intact. Update editor validation, safe public manifest and cart limits
consistently. Keep the existing bounded first-cover preparation and lazy media
loading; no new requests, dependencies or production-data changes.

Validation: 28 upload/cart/capacity tests and 50 existing shop DOM, public share,
video and private-original regression tests passed (78 total). The boundary
checks create the 100th video package in a 99-item shop, retain its 120 EUR price,
render/quote all 100 entries and refuse package/file 101 before an upload.
`npm run build` and `git diff --check` passed. Tracked Social bundles did not
change; ignored dist entries were regenerated. No visual/CSS changes, no new
mobile browser run and no production test data. Manual phone check: refresh
Heart, add the video as package 11, then open Still preview and check the cart.
