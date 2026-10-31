# Creator layout: missing stylesheet on /heart/

Confirmed production cause: /heart/ (after redirect) and /heart/index.html serve the compatibility heart/index.html document, which did not reference heart-content-creator.css. /apps/mnyra-heart/index.html included it. The stylesheet itself was deployed and contained the new layout. This explains plain buttons, stacked metrics, concatenated inline labels and unbounded images on the public entry. The earlier component tests did not inspect both actual entry documents.

Fix: load one identical content-versioned stylesheet from both entries. Heart bootstrap repairs a missing/older link in previously cached HTML before app initialisation. The stylesheet revision matches its source SHA-256; a regression test requires updates when CSS changes. Heart's own service-worker cache revision is advanced and includes the stylesheet/helper. No business data, order logic, LifeSkin or Meta events change.

Validation will be recorded after build and public-entry checks.

Validation: 139 targeted Creator/Heart/Pixel tests passed, including five new entry/repair/revision regressions. npm run build passed; no tracked Social bundles changed. Both built HTML entries contain the matching stylesheet, and built CSS contains the required grid/flex/gallery selectors. git diff --check passed. The local browser server is isolated from the cloud browser, so no authenticated mobile screenshot is claimed. Production public-entry verification follows publication.
