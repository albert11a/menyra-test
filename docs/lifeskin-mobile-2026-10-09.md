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


## Follow-up: approved two-phone intro and spacing polish

Scope: replace only the hero's image/text arrangement, carry over the approved
mobile typography/spacing refinements and reduced-motion-aware reveal effect.
Preserve the current main branch's newer Pixel/CAPI and landing measurement fixes.
User requests full lint/CI checks before commit and push to main.

Follow-up validation: full ESLint run (`node node_modules/eslint/bin/eslint.js .`,
the command used by npm run lint) exited 0. Full unit suite with the GitHub
runner timezone (TZ=UTC): 3,147 passed, 0 failed, 1 existing skip. A first local
run exposed a timezone-dependent existing response-time test; it passes under
UTC without any production/test changes. The hero measurement marker removed
with the old composition was restored on the new phone image area.
Architecture report/check, npm run build, social bundle budget and bundle report
all passed. Tracked social bundles unchanged. Generated architecture report
noise unrelated to this presentation change was discarded. Approved standalone
preview checked at 320/390/430 px, including fixed CTA; no new repository browser
smoke run (AGENTS.md) and no physical Instagram test. No production deploy command.
