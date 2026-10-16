# LIFESKIN storefront and Heart catalog

Status: IMPLEMENTED AND VERIFIED — 16 October 2026. Awaiting production merge and domain attachment verification.

Authorized scope: a mobile-first skincare shop inspired by Rhode / The Ordinary, plus a directly accessible lifeskinshop management tab in existing Heart. Existing Vercel repository is albert11a/menyra-test. Prepare host-specific root routing for lifeskin-ks.com and www.lifeskin-ks.com. Domain ownership, DNS and Vercel project attachment cannot be established from repository source alone.

Implementation stays inside the existing storefront and uses its existing checkout/session/order mechanism. Retain the Acne Duo product experience, analysis, original customer evidence, consent and Pixel/CAPI calls. Product management reuses authenticated Heart product/image/set adapters and existing Firestore paths. No production test orders, Firebase deployments or new credentials. Local work uses refactorapp from the current main; the review branch is feature/lifeskin-storefront-20261016; production merge is outside this implementation.

Single product catalog prices come from Heart einzelpreis, fresh from the public product collection. No guessed fallback prices for catalog purchases. Hidden products are not sold. Cached catalog carts are revalidated against current product records; total and line prices agree. Catalog content and photos use Heart data with existing local product imagery only as a photo fallback for known products.

Validation: focused catalog/order/admin regression checks, existing Pixel lock and shop suites, mandatory npm run build. Browser/Playwright runs are not authorized by repository instructions, so physical mobile and visual browser QA remain outstanding.


## Completed verification

- `TZ=Europe/Vienna npm test`: 3,211 passed, 0 failed, 0 skipped after the final build. The timezone matches the user's Austrian environment and the existing answer-time tests' local-hour expectations.
- `npm run build`: passed (Vite plus complete Vercel static packaging). Existing social chunk-size warning remains. No tracked social bundle files changed, so no bundle files need a commit; the new shop module and stylesheet are included in generated dist.
- `git diff --check` and changed JS syntax checks: passed.
- Generated storefront inventory: no duplicate IDs, no missing local image/script/link assets; catalog CSS inlined and catalog runtime bundled.
- Existing Meta Pixel/CAPI lock tests: passed without modification of the lock or event calls.
- Legacy assertions updated only for the explicitly requested new navigation tab, additional stylesheet and catalog-aware price/loading branches.
- No browser, Playwright, physical phone, authenticated Heart upload, live checkout/order or DNS/Vercel-account tests performed. No production data writes or Firebase deployments.

## Manual acceptance

1. On mobile, open `/lifeskinshop?still=1`, filter/sort products, open product details, change a photo and close with X/Escape.
2. In Heart use `lifeskinshop`, edit one product's name, price, description and primary photo; verify these on the storefront after reload. Set hidden and confirm the item cannot be selected.
3. Use the existing checkout to review an individual product and the separate Acne Duo offer. Confirm line prices and totals. Do not submit a production test order.
4. Open Acne Duo details, original customer evidence and skin analysis; return to the catalog using the back control and browser navigation.
5. In Vercel verify ownership and project attachment of `lifeskin-ks.com`/`www.lifeskin-ks.com`, then check the root URLs and canonical metadata after an authorized production merge.

## Commerce rebuild requested 16 October, 04:33 Vienna

The owner rejected the first narrow concept and requested a complete, youthful, professional commerce design for many future products, with add-to-cart and buy-now actions, complete menus, product pages, consistent geometry and Lucide icons. This iteration replaces the storefront presentation and extends the existing catalog cart; production publication remains unapproved.

- Shared 4px spacing scale, 4:5 catalog photos, consistent rounded buttons/cards, search header, complete category menu and footer.
- Product pages use dedicated /lifeskinshop/p/:id URLs (or /p/:id on the custom domain), gallery, quantity, usage/verified ingredients, delivery information and related products.
- Catalog cards support Shto ne shport and Porosit. Native cart drawer merges products, changes quantities, removes lines and sends exact quantity/price lines to the existing checkout. Stored carts contain IDs/quantities and always reload live prices.
- Catalog metadata fetches exclude embedded photos and unrelated recommendation rules. Product cards request resized WebP photos on demand from a read-only Vercel endpoint. Product galleries are loaded only for the opened product. Existing paginated collection loader supports field arrays as well as its original single-field mask.
- Heart supports category, optional factual badge, suitable-skin text and sold-out state. No invented catalog items, ratings, review counts or clinical claims.
- Existing campaign/Acne Duo remains a separate compatibility view; the general shop no longer funnels the header/menu into that single offer.
- Domain ownership/attachment and physical mobile/checkout acceptance remain outstanding. The inline preview uses sample catalog values and cannot place orders. No push or production action follows from this design request.


### Commerce validation, final local iteration

- `TZ=Europe/Vienna npm test`: 3,220 passed, zero failures/skips. Covers cart merging, quantity changes/removal, fresh-price restoration, unavailable products, 150-item search/category/sort fixture, metadata image exclusion, public-image field masks, canonical product routes, preserved still mode, Heart category/sold-out fields, legacy offer preservation and original Pixel/CAPI lock.
- Final `npm run build`: Vite + Vercel packaging executed; final result recorded in the task response. Existing tracked social bundles remain unchanged.
- Syntax, whitespace, unique-ID and Lucide-symbol checks passed. New preview uses existing product photographs and catalog example prices, cannot submit real orders, embeds all assets and has no external scripts or customer data.
- No physical mobile, real browser rendering, authenticated Heart upload or live order test. These are release acceptance items, not claimed as completed by the preview.
- The existing Instagram ordering link remains in the footer. Single-set campaigns remain separate; adding catalog items cannot silently replace a discounted offer, and clearing it requires an explicit cart action.
- No GitHub push, main merge, DNS change or production deployment performed. The earlier automatic approval rejection still applies until explicit publication authorization is given.


### Custom domain connection, 2026-10-16

Owner explicitly authorized connecting lifeskin-ks.com to the existing menyra-test project while preserving mnyra.com/lifeskin and its Pixel behavior. Exclude only the two LifeSkin hosts from the generic root-to-feed redirect, then attach the apex and www domains to production. Existing Mnyra domains and /lifeskin routes remain untouched. No Pixel/CAPI code changes: browser uses the existing consent-gated ID; server source URL validation currently accepts only mnyra.com and needs separate explicit Pixel authorization before expansion. No real orders or synthetic advertising events for verification.
