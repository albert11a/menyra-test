# MNYRA Focus Stability Audit

Status: CURRENT
Generated: 2026-07-02
Branch: `mnyrasocial`
Start HEAD: `3a2c9df96ed3243e5d59b6569cc83d461b540d32`

## 1. Scope

This pass covers the public/business Focus area that appears with public
profile/menu surfaces. It does not cover Heart Search focus. The change is
local-only and does not deploy, touch production data, loosen Firestore Rules,
rename routes or collections, activate Ads/Analytics, reintroduce the removed
public startup shell, extract a runtime or perform a broad `social-app.js`
refactor.

The implemented scope is deliberately small: add a pure public Focus state
contract, expose safe DOM diagnostic markers and cover the markers in unit and
Public Menu/QR browser tests. No visible redesign is included.

## 2. Start HEAD / Branch / Environment

| Item               | Value                                                        |
| ------------------ | ------------------------------------------------------------ |
| Branch             | `mnyrasocial`                                                |
| Start HEAD         | `3a2c9df96ed3243e5d59b6569cc83d461b540d32`                   |
| Start working tree | Clean                                                        |
| Local server       | `http://127.0.0.1:5173/`, HTTP 200                           |
| Emulator hub       | `http://127.0.0.1:4400/`, HTTP 200                           |
| Seed               | `npm run emulators:seed`, 62 Firestore docs and 6 Auth users |
| Browser tool       | `agent-browser` CLI unavailable; Playwright fallback used    |
| Real phone         | Not tested                                                   |

## 3. Focus Data Sources

Focus public truth is read from
`restaurants/{restaurantId}/public/offers`. Public enablement metadata is read
from `restaurants/{restaurantId}/public/meta` through `offersEnabled`.

The public menu surface itself is read from
`restaurants/{restaurantId}/public/menu`. The renderer validates Focus against
the loaded Menu where a Focus item targets a menu item or category.

Route/bootstrap snapshots may carry menu/focus truth and counts, but visible
rendering is still guarded by the public menu surface state resolver.

## 4. Focus Load Paths

- `createFocusRuntimeController().loadFocusItems()` reads public offers and
  normalizes them through `buildPublicOffersProjection`.
- `createFocusRuntimeController().loadFocusMeta()` reads public meta and treats
  missing meta as enabled.
- `ensureFocusDataForProfile()` is wired from the profile/business menu runtime
  cluster into the profile/menu/focus renderer.
- Public menu rendering starts Focus ensure only after the matching menu surface
  is ready enough to make Focus meaningful.
- Owner Focus save/delete publishes back to `public/offers` and keeps
  `truthSource: "public-menu"`.

## 5. Focus Render Paths

Public Focus is rendered by
`apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`.
Restaurant/Cafe public menu coordinates Menu and Focus through
`resolveVisiblePublicMenuSurfaceState()`.

The renderer reserves Focus space while Focus truth is pending, but Menu items
are allowed to render when public Menu truth is ready. That means Menu can be
visible while Focus is still loading; the new DOM markers make this state
measurable instead of inferred from pixels.

## 6. Focus Truth Contract

The new pure helper `resolvePublicFocusState(surface)` maps the surface to:

| State                  | Meaning                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| `unknown`              | Focus source is not confirmed for the current visible surface.        |
| `loading`              | Matching Focus source is still loading. Same-surface Menu may render. |
| `present`              | Focus is confirmed and renderable for the current business.           |
| `known-empty`          | Focus is confirmed empty or the current Menu is confirmed empty.      |
| `error`                | A matching public Focus source has a real error.                      |
| `stale-wrong-business` | Public Focus belongs to a different visible business target.          |

The stale state is not renderable. It exists only as a diagnostic/test state.

## 7. Focus State Matrix

| Scenario                                 | Expected state                       | Covered by                   |
| ---------------------------------------- | ------------------------------------ | ---------------------------- |
| Menu present, Focus loading              | `loading`                            | Unit test                    |
| Missing public Focus projection          | `known-empty` through Focus runtime  | Existing unit test           |
| Canonical empty Focus                    | `known-empty`                        | Unit test                    |
| Present Focus                            | `present`                            | Unit test and browser marker |
| Different-business Focus                 | `stale-wrong-business`, not rendered | Unit test                    |
| Menu present, Focus targets missing item | `known-empty`/unavailable            | Existing unit test           |

## 8. Menu-vs-Focus Timing Matrix

Pixel 5 Playwright measurements against local emulators after the marker build:

| Profile        | Route                               | App text |   Header | Menu item |   Marker | Focus present | Final marker                             |
| -------------- | ----------------------------------- | -------: | -------: | --------: | -------: | ------------: | ---------------------------------------- |
| Normal mobile  | `/pidhimadh/menu`                   |   325 ms |   585 ms |    735 ms |   429 ms |        735 ms | Menu `present`, Focus `present`, 24/3    |
| Normal mobile  | QR `/pidhimadh/menu?src=qr&table=2` |   251 ms |   481 ms |    612 ms |   368 ms |        612 ms | Menu `present`, Focus `present`, 24/3    |
| Normal mobile  | `/shopdemo/menu`                    |   322 ms |   578 ms |    578 ms |   432 ms |           n/a | Menu `present`, Focus `loading`, 1/0     |
| Fast 3G mobile | `/pidhimadh/menu`                   | 10200 ms | 10200 ms |  11629 ms | 11629 ms |      11629 ms | Menu `present`, Focus `present`, 24/3    |
| Fast 3G mobile | QR `/pidhimadh/menu?src=qr&table=2` | 10154 ms | 11028 ms |  11588 ms | 11588 ms |      11588 ms | Menu `present`, Focus `present`, 24/3    |
| Fast 3G mobile | `/shopdemo/menu`                    | 10186 ms | 11535 ms |  11535 ms | 11535 ms |           n/a | Menu `present`, Focus `known-empty`, 1/0 |
| Slow 3G mobile | `/pidhimadh/menu`, 12 s cap         |     none |     none |      none |     none |          none | Blank/root not mounted                   |

The restaurant Menu and Focus become present together in the measured normal
and Fast 3G runs once the public runtime is available. Slow 3G still fails
before any marker can exist because the shared public runtime has not mounted.
That remains the known P1 visible startup blocker and P3 runtime/bundle cause.

## 9. Public Restaurant Results

`/pidhimadh/menu` and QR menu both ended with
`data-menu-state="present"`, `data-menu-item-count="24"`,
`data-focus-state="present"`, `data-focus-item-count="3"` and
`data-focus-stale="false"`.

The brief normal-network Focus skeleton was observed before stable Focus, but
it disappeared before or at the same point as the menu item appeared. No
wrong-business Focus was observed.

## 10. QR Focus Results

QR retained `src=qr&table=2` after navigation normalization. The QR final URL
kept the QR query, and Focus settled to `present` for `pidhi-madh` with stale
flag `false`.

## 11. Shop/Hotel Public Focus Results

Shop public menu showed its product list. Focus was not a restaurant/cafe
blocking condition. In one normal run the diagnostic state was still `loading`
while the product list was present; in Fast 3G it settled to `known-empty`.
This is recorded as a P2 diagnostic ambiguity, not a product-blocking restaurant
Focus issue.

Hotel route coverage remains entry/public details coverage from existing
reports. No hotel mutation or hotel Focus product fix was made in this pass.

## 12. Owner Focus Results

Owner Focus save/delete code paths publish to `public/offers` and keep public
truth source metadata. This pass did not mutate Focus data through the Owner UI
because the active request and attached guardrails prohibit blind vertical
mutation work.

Existing owner return guard remains relevant: wrong public Menu/Focus from a
foreign business is retargeted away before own Menu render.

## 13. Cold/Incognito/Warm Results

Cold/private-equivalent/warm broad route results remain documented in
`MNYRA_MOBILE_MANUAL_STABILITY_SWEEP.md`. This pass added focused marker
evidence on fresh Pixel 5 contexts. It did not re-run the entire broad matrix
with new screenshots.

## 14. Fast/Slow 3G Results

Fast 3G local emulator runs reached restaurant Menu and Focus together at about
11.6 s. Slow 3G with a 12 s cap still had no app text, no menu item and no
marker. This confirms the existing conclusion: Focus is not the first visible
3G blocker; the shared public runtime and bundle are.

## 15. Refresh/Back/Forward Results

The updated Public Menu E2E covers direct load and refresh for seeded public
menu and QR routes. Existing QR E2E covers query retention and invalid table
sanitizing. Existing reports cover Back/Forward QR behavior; no regression was
introduced by DOM markers.

## 16. Cross-Business Focus Results

The pure unit test now asserts that Focus from another restaurant becomes
`stale-wrong-business` and is not renderable. The Public Menu browser marker
assertion rejects `data-focus-stale="true"` on seeded public routes.

## 17. Empty/Missing/Error Focus Results

Missing public Focus projection remains a confirmed empty state in the Focus
runtime tests. The new contract distinguishes unknown, loading, known-empty and
error so tests can avoid treating unknown as empty.

## 18. Image/Fallback Findings

No new image renderer change was made here. Existing public menu image fallback
work remains green: the responsive image failure loop stays bounded and visible
broken images remain `0` in the updated Public Menu E2E.

## 19. Console/Network Findings

The marker timing probe reported no console errors. Request failures in the
probe were expected aborts caused by closing the context after enough evidence
was captured, not production calls or permission failures.

## 20. P0/P1/P2/P3 Findings

| Priority | Finding                                                                  | Status                                 |
| -------- | ------------------------------------------------------------------------ | -------------------------------------- |
| P0       | Wrong-business Focus render                                              | Not observed; unit/browser guard added |
| P1       | Slow/Fast 3G blank public root before runtime mount                      | Open                                   |
| P1       | Heart mobile Search/image flicker                                        | Open, no Heart fix in this pass        |
| P1       | Feed story permission error                                              | Open, Rules unchanged                  |
| P2       | Shop Focus marker can be `loading` while product list is already present | Documented                             |
| P2       | Shop/Hotel media mutations                                               | Not run by scope                       |
| P3       | Large public runtime/bundle                                              | Open structural work                   |

## 21. Fixes Applied

- Added `resolvePublicFocusState(surface)`.
- Added `resolvePublicMenuFocusDiagnostics(surface, visibleItems)`.
- Added safe DOM markers on public menu roots:
  `data-menu-state`, `data-menu-item-count`, `data-focus-state`,
  `data-focus-business-id`, `data-focus-item-count`, `data-focus-source` and
  `data-focus-stale`.
- Added unit coverage for loading, present, known-empty and stale wrong-business
  Focus states.
- Added Public Menu/QR E2E assertions that seeded routes expose markers and do
  not expose stale Focus.

## 22. Fixes Not Applied

- No public runtime split.
- No startup shell or fake first paint.
- No Heart product fix.
- No Feed/Rules fix.
- No Shop/Hotel mutation expansion.
- No Owner Focus mutation through UI.
- No route, collection, Rules or production data change.

## 23. Remaining Blockers

There is no launch-go. The launch blockers remain the measured public 3G
blank-root interval, Heart mobile Search/image instability if reproduced on a
real device, Feed story permission errors, safe physical-phone LAN emulator
setup and real phone/QR/media checks.

## 24. Recommended Next Steps

1. Keep the new marker assertions in the Public Menu/QR launch gate.
2. Use the markers for any future Menu-vs-Focus regression before changing
   render order.
3. Treat Slow 3G as a runtime/bundle problem, not as a Focus skeleton problem.
4. Diagnose Heart mobile Search/image flicker separately and mobile-first.
5. Plan public runtime split and bundle budgets as the real fix for blank
   public startup.

## 25. Final Verification 2026-07-02

Required baseline passed for this follow-up:

- `npm run test:functions`: 4/4 passed.
- `npm run test:rules`: 17/17 passed; denied writes were expected rule
  assertions.
- `npm run test:unit`: 134/134 passed.
- `npm run lint`: passed.
- `npm run format:check`: passed.
- `npm run arch:check`: passed.
- `npm run build`: passed with the existing large `social-app.js` warning.

Browser verification:

- Public Menu/QR focused Playwright passed `10/10` across desktop Chromium and
  mobile Chrome.
- Full relevant matrix passed `32`, skipped `1` and failed `1`; the failure is
  the known mobile Heart Search diagnostic
  (`Expected "Diagnostic", Received ""`). No Heart fix is claimed.
- Mobile was checked through Playwright mobile Chrome. Real phone, physical QR,
  real media decode and carrier 3G were not checked.

Bundle and local-server status:

- Tracked bundle delta: `apps/menyra-social/bundled/entry/social-app.js` and
  `apps/menyra-social/bundled/manifest.json` changed,
  `profile-menu-focus-render-controller-lbWlArsR.js` was deleted and
  `profile-menu-focus-render-controller-CmFLZ7KC.js` was added.
- `http://127.0.0.1:5173/` returned HTTP 200.
- Configured LAN `http://192.168.1.168:5173/` timed out on the current network;
  active WLAN `http://172.20.10.3:5173/` returned HTTP 200.

No production deploy, production data mutation, Firestore Rules loosening,
route rename or collection rename was performed. There is still no launch-go.
