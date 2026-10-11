# LifeSkin personal routine — 11 October 2026

Scope authorized by Albert: integrate approved routine section into /lifeskinshop and publish main. Same-card steps, stable recommendation row, four optional products, prices 15/25/35/45 EUR. Apply updates existing product page; continue uses existing setLegen checkout and tracking calls. Default Acne Duo and other routes/pricing stay as before. Preserve customer media, reviews and before/after order. Catalog images from Heart with local fallbacks; LF Clean local fallback is an illustration until a catalog photo is available. No production data writes during verification, no Firebase deploy, no Pixel/CAPI changes, no browser automation.

Validation planned: all selection/price combinations, cart restore, selected order lines and checkout flow, unchanged Pixel lock, full unit tests, lint and mandatory build. Mobile CSS inspected; no mobile browser run requested.

Completed: same-card selection and summary, dynamic shop hero (2.5-product rail for 3+), chosen product details and usage, existing checkout with selected line items and exact totals, canonical session restore and return to default Duo. The stopped Duo promotion ignores delayed stock replies so it cannot disable personal-set buttons. Original customer media, reviews and before/after position preserved.

Validation: 3,169 unit tests passed, including unchanged Pixel lock; lint passed with 0 errors and existing 305 warnings; npm run build passed. No tracked bundle changes. Mobile stylesheet reviewed, no mobile browser check performed. No production test orders or Firebase deploy.
