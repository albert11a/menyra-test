# Approved LifeSkin landing redesign

Scope: replace only the public entry screen at `/lifeskin` with the user-approved compact cream/green design, simple Kosovo Albanian, Lucide icons, swipeable before/after and customer galleries, and a fixed therapy CTA. Keep customer content managed in Heart. Preserve the existing analysis screens, start delegation, consent, pixel calls, and routes. User explicitly requested commit and push to main.

Implementation uses scoped CSS and a presentation-only gallery module. No embedded customer media or new tracking events. Existing shared normalizers and public read helpers supply gallery content; repository photos remain the offline fallback. Empty enabled selections hide their section. Full-size viewing loads videos only after a tap.

Validation will include the unchanged pixel guard, scoped entry/gallery tests, and `npm run build`. No Playwright/smoke run or production-data test. Phone sizing is encoded explicitly; integrated mobile browser verification must be reported separately.

## Validation completed

- 120 targeted Node tests passed, including the unchanged pixel guard, early entry/start behavior, Heart case loading, media filtering/escaping, and legacy `/lifeskin2` coverage. Fixtures only; no production reads in tests.
- Existing analysis markup verified byte-for-byte unchanged. HTML has no duplicate IDs or attributes; local photo references exist. No preview-entry dialog remains.
- `npm run build` passed. Tracked social bundles remained unchanged; the ignored `dist` output includes the new bundled gallery module and stylesheet. Build entry configuration is committed so CI generates that bundle. Existing Vite chunk-size warnings remain.
- No Playwright/smoke or integrated mobile/desktop browser run. Responsive gallery frames explicitly cap mobile images at 168px / 149px and customer previews at 172px / 160px. The user reviewed the preceding HTML prototype on mobile; that is not an integrated production-browser test.
- Historical card measurement names/fields are unchanged. Removed benefit cards have no substitute selectors; remaining hero/proof/care/FAQ and actual Instagram links retain their matching selectors. Customer media is not assigned the Instagram tracking selector. No changes to consent, pixels or funnel events.
