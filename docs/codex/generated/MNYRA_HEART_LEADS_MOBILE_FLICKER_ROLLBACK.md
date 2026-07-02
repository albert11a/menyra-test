# MNYRA Heart Leads Mobile Flicker Rollback

Status: CURRENT
Generated: 2026-07-02
Branch: `mnyrasocial`

## Rollback

Commit `f3963b07` (`fix: stabilize heart leads interactions`) was backed out
with `git revert --no-commit` and will be committed as
`revert: back out heart leads interaction changes`.

The rollback returns the Heart code, Heart E2E changes, emulator-only lead
fixture and related report updates from that commit to the Clean-Web baseline at
`aaf902d0e6697ca9ba7985a049b803184d2cad4f`, except for the new mobile-first
AGENTS/report documentation in this rollback task.

## Why

Real usage showed that the follow-up did not solve the original Heart Leads
problem. The Lead profile image still flickers, and in some sessions the flicker
is worse:

- the lead profile picture appears, disappears, appears and disappears again;
- the intermediate states are very fast;
- typing in Search is disrupted while the image/card flicker is active;
- the user may need to click Search again after the flicker stops.

The search field appears to be affected by the render/image churn. It must not
be treated as the root cause until mobile-first diagnosis proves that.

## Why Green Tests Were Not Enough

The previous Heart E2E was desktop/mobile-emulation evidence for a narrow DOM
marker assumption. It did not prove real mobile behavior, actual image decode
behavior or the user-visible flicker sequence.

Mnyra is mobile-first. For image flicker, input focus and business tools, real
phone behavior and mobile-first checks carry more weight than green desktop
tests or desktop CSS repairs. If only desktop is green, the issue is not visually
closed.

## Do Not Repeat

The next attempt must not start by reapplying any of these patterns:

- blind DOM-local search filtering;
- global render-skip logic without identifying the data/render source;
- desktop-only CSS changes as the main solution;
- image-marker or fallback changes without proving why the image URL or card DOM
  is changing.

## Next Separate Block: Mobile-First Diagnosis

The next block should be diagnostic only before any fix. It should start on a
real phone or a mobile viewport and record the flicker source.

Checklist for that separate block:

- observe image `src` changes over time;
- check whether Lead data is loaded multiple times;
- check whether the avatar URL changes between value, `null`/empty and value;
- check whether whole lead cards are rebuilt;
- check whether `onerror` or fallback logic repeatedly swaps the image;
- check whether a background refresh overwrites populated Lead data;
- check whether Search is only the victim of the flicker rather than the cause.

This rollback task intentionally does not build a new Heart Leads fix.

## Verification For This Rollback

Required checks after the revert:

| Check                    | Result                                        | Notes                                                                                                                                                     |
| ------------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:functions` | Passed, 4/4                                   | Local emulator only.                                                                                                                                      |
| `npm run test:rules`     | Passed, 17/17                                 | Expected `PERMISSION_DENIED` logs came from negative rules assertions.                                                                                    |
| `npm run test:unit`      | Passed, 123/123                               | Reverted Heart E2E additions are not part of unit scope.                                                                                                  |
| `npm run lint`           | Passed                                        | No lint errors.                                                                                                                                           |
| `npm run format:check`   | Passed after formatting revert-affected files | First run flagged `seed/data/mnyra-local-seed.json` and `tests/e2e/heart.spec.ts`; Prettier was applied to those files only, then the final check passed. |
| `npm run arch:check`     | Passed                                        | No dependency violations.                                                                                                                                 |
| `npm run build`          | Passed                                        | Existing large `social-app.js` chunk warning remains.                                                                                                     |

Bundle status: `npm run build` did not change tracked files under
`apps/menyra-social/bundled` in this rollback.

Mobile status: mobile Heart Leads flicker diagnosis was not executed in this
rollback task. The issue remains open and must not be reported as visually
solved.
