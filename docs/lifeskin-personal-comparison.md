# Personal comparison under week 4

Scope: two optional per-report uploads in Heart > Befund, immediately below
customer photos; a native before/after slider under the final week-4 text.
Only a complete pair appears; missing, invalid or failed images hide it.

`reports/{id}.vergleich` stores HTTPS CDN references `vorher` and `nachher`.
Heart reuses its authenticated 1080px JPEG upload (quality .84); no inline
image bytes or additional report reads. Each slot supports replace/remove,
preview, upload errors and upload-in-progress save protection. Changes use
existing draft preservation and are published with the normal report save.
The public component defers the two image requests until within 400px of the
viewport, reserves its aspect ratio, and reveals both images together. A
native range controls CSS clipping at 50% initially; no slider dependency,
network requests or layout measurements run during dragging.

No changes to Pixel/CAPI, routing, Firestore rules or production config.

Validation: 37 targeted Node tests pass (personal comparison, Pixel lock,
report draft preservation, report save states, therapy and view lifecycle).
ESLint passes for the new JS modules/tests. `npm run build` passes; tracked
social bundles remain unchanged. Static output contains the new modules.
No Playwright/smoke runs. Mobile visual/touch checks and authenticated live
upload/save could not be completed: the browser cannot reach the local
server (ERR_CONNECTION_REFUSED); the local server itself responded HTTP 200
in its execution context. No production/customer data was used for tests.
