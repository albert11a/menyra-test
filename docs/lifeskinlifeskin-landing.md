# LifeSkin Kosovo — compact landing only

User scope (2026-10-01): redesign ONLY `/lifeskinlifeskin`. Method selection, camera, forms, waiting, report, cart, checkout and tracking remain at the existing baseline. Isolated branch `lifeskin-compact-kosovo` starts before the experimental mobile funnel work. No flow adapter or internal sample report is included in this branch. Existing public patient pages are unchanged.

## Offer and presentation

Immediately show the skin concern, free photo analysis with Dr. Gashi, the two product images, the complete 39 € set price, free Kosovo delivery and payment on receipt. Primary CTA opens the verified native photo entry `/lifeskin?ls_weg=foto`; an explicit secondary link leads to the existing shop's `#setet` offer. Clear simple Albanian, system typography, a phone-width layout, no automatic animation or carousel, short physician block and three brief FAQs. No fabricated reviews, medical outcomes, countdowns, scarcity, guarantees of sales or purchases within three seconds.

Prices come from `shared/lifeskin-preise.js`. Preserve campaign attribution and the destination fragment. `ls_design=classic` explicitly exits a previously stored experimental presentation when reviewing in the same tab. Landing does not import `design.js`. Existing controller IDs, pixel calls, backend logic and purchase state are untouched. Native links and FAQ work without JavaScript.

## Research

- NN/g homepage design principles: https://www.nngroup.com/articles/homepage-design-principles/ — clear purpose, value and descriptive actions in the initial view.
- Baymard shipping visibility: https://baymard.com/research-articles/avoid-banners-only-free-shipping — show delivery cost beside the offer.

These support the usability decisions; they do not establish a Kosovo-specific conversion prediction. Measure completed analyses and paid orders before claiming improvement. No tracking implementation is added.

## Validation and release

`npm run build` passed; tracked Social bundles unchanged. 27 scoped pixel-lock, service-worker and in-app checks passed. `node --check` and `git diff --check` passed. Vercel manual phone-width review required; actual iPhone/Android and Meta in-app browser checks remain outstanding. No production patient records or real orders are used. Draft review only; no automatic main merge or production deployment.
