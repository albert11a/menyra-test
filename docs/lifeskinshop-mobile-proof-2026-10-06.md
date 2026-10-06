# LifeSkin Shop: approved mobile preview

Scope approved by Albert on 06.10.2026: shorten the opening paragraph; keep the 19 EUR purchase button early; show the existing before/after gallery immediately after the trust row; place the large product photos after the hero. Retain original photos, video rail, scan path and all purchase and Meta event logic.

Implementation changes HTML and mobile CSS only. A small synchronous presentation script moves the existing gallery and product nodes at widths <= 800px and restores their original locations above that breakpoint. IDs, gallery controls and shop.js stay intact. No duplicated media or new patient pictures. The product photos use native lazy loading and low fetch priority. This is a conversion hypothesis, not a promise of additional orders.

Validation:
- `npm run build` passed. No tracked bundle files changed.
- 32 tests passed across lifeskin-shop, price/checkout/speed and the unchanged pixel protection checks.
- Mobile WebKit emulation at 390x844, 320x568 and 430x932 passed: no horizontal overflow, 19 EUR CTA visible, original before/after images load, next arrow reaches case 2, checkout total 19 EUR, empty-field validation works. No JavaScript errors or writes. Firestore was replaced by local 404 responses to exercise the existing published fallback without reading production data. No order submitted.
- At 390x844 the CTA is at y294–350, the image pair at y456–626, and the product section begins at y755. At 320x568 the CTA remains visible; results require a short scroll.
- This is mobile emulation, not a physical old-phone or constrained-network performance measurement. Existing customer video playback was not reverified in this local fallback check.

