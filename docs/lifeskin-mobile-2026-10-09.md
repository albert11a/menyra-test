# Approved mobile landing — 2026-10-09

Scope: implement the approved LifeSkin-Mobile-Konzept.html on /lifeskin.
Preserve existing funnel screens, CTA delegation, Heart-managed galleries,
consent and all Pixel/CAPI call sites. User explicitly authorized commit/push
to main. No production deploy command.

Design: uppercase wordmark, unified smartphone hero card, process directly
below, left-aligned personal analysis/therapy card, customer media card,
and a permanently visible viewport-fixed landing CTA.

Validation: npm run build passed; tracked social bundles unchanged. All 17
scoped tests passed (approved landing, redesign galleries, landing asset build,
and the unmodified Pixel lock). Existing copy/layout assertions were updated
to the explicitly approved wording and section order. git diff --check passed.
The standalone approved preview was checked at 320/390/430 px in the preceding
design task. No new repository browser/Playwright smoke run was made, following
AGENTS.md; no physical Instagram/iPhone test or production deploy was run.

Changed surfaces: landing HTML/CSS, three cacheable image assets, existing
landing assertions, and this scope/validation note. Existing gallery JavaScript,
analysis screens, consent, Pixel and CAPI logic are unchanged.
