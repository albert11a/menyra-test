Status: CURRENT
Last updated: 2026-09-28

# LifeSkin shop template

Scope requested: a separate mobile-first premium storefront at /lifeskinshop.
Use existing product imagery as placeholders, local Lucide icons, Albanian copy,
concern-based set selection, product details, and a reviewable basket preview.
No claims of measured conversion improvement, fabricated reviews, or scarcity.
No changes to existing pixels, sessions, orders, or medical-check logic.
The template does not submit orders. Its basket is a local preview, explicitly
labelled before completion; the skin-check link opens the existing LifeSkin 2.
Route ownership: apps/lifeskin-shop, exact Vercel/dev route. Shared service worker unchanged.
Existing /lifeskin and /lifeskin2 remain unchanged.

Validation: npm run build passed; tracked bundle files unchanged. Pixel guard: 3/3 passed.
Browser preview at localhost blocked by cloud-browser policy; no real Instagram/Facebook
device test and no Playwright/smoke run performed. Production SW stays unchanged after
automatic approval review rejected its upload. This means existing SW-controlled
clients need a production follow-up check for the new route.
