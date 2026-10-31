# Immediately active Creator shops

Owner request: completed businesses are publicly active immediately, with preview and copy links, even without packages, photos or a cover. Working remains the independent manual preparation status.

Scope: publish the final completed creation unconditionally; retain private in-progress/failed uploads. Repair legacy completed empty Working shops when Heart loads, identified by the final-write products array (absent on incomplete drafts). Keep links available after activation; do not loosen public API, asset, checkout or Firestore access checks. No direct production migration/test writes or Pixel changes.

Validation: 145 Creator/Heart/Pixel regression tests passed, including empty-shop creation with all four link actions, public empty-shop HTML/JSON, and activation of legacy completed shops while interrupted drafts/archive stay private. The initial activation test lacked an authenticated Heart session; fixing the test fixture made it exercise the normal authenticated flow. npm run build passed (existing large-chunk warning); no tracked generated bundles changed. git diff --check passed. No device/mobile visual test or production order/notification test was performed; no CSS layout change.
