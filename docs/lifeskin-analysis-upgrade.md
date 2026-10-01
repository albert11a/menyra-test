# LifeSkin: upgrade of the existing analysis landing

Scope agreed 2026-10-01: upgrade ONLY the current `/lifeskin` landing (`apps/lifeskin-landing/index.html`). The offer is a free skin analysis followed by an individually recommended treatment, covering acne, acne marks/scars, melasma and pigmentation concerns. No preset bundle or product-first hero.

Keep the existing funnel, route, DOM IDs, CTA sources, camera/photo methods, waiting screen, reports, shop logic and every Pixel/CAPI call unchanged. Shared CSS additions are gated by `data-ls-upgrade="analyse"` so other pages retain their existing appearance. Existing case imagery remains; prices and product names are omitted from the landing presentation. No new claims about cure rates, timing or guaranteed outcomes.

Verification: required build, Pixel lock and relevant landing regression checks; manual preview inspection where available. Actual device verification remains required; desktop phone-width inspection is supporting evidence only. No production patient/order submissions, Playwright/smoke runs, merge or production deployment.
