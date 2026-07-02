# MNYRA Mobile Manual Stability Sweep

Status: CURRENT
Generated: 2026-07-02
Branch: `mnyrasocial`
Start commit: `7f1517da7ae5748053ff01224f615c7242bf378c`

## 1. Scope

This sweep inspected Mnyra as a mobile user across public restaurant, shop and
hotel routes; restaurant, shop and hotel owner entry points; Owner Orders;
Waiter; Heart diagnostics; Feed, Restaurants, Travel, Shopping and Map; and
cross-business navigation.

The work was local-only. It did not deploy, change production data, loosen
Firestore Rules, rename routes or collections, activate Ads/Analytics, extract
a runtime, redesign UI or implement a Heart product fix. Shop and Hotel owner
mutations were intentionally not performed.

The evidence is browser automation used as a manual inspection fallback. It is
not a real-device pass and is not a launch-go.

## 2. Test Environment

| Item             | Value                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| OS               | Microsoft Windows NT `10.0.22000.0`                                    |
| Node / npm       | Node `v24.12.0`, npm `11.6.2`                                          |
| Browser          | Playwright Chromium `149.0.7827.55`                                    |
| Mobile project   | Pixel 5 emulation, `393x727`, mobile Chrome profile                    |
| Normal network   | Localhost without throttling                                           |
| Fast 3G          | 150 ms latency, 1.6 Mbit/s down, 750 Kbit/s up                         |
| Slow 3G          | 400 ms latency, 400 Kbit/s down/up                                     |
| Firebase project | `mnyra-local` only                                                     |
| Emulator ports   | Auth `9099`, Firestore `8080`, Functions `5001`, UI `4000`, Hub `4400` |
| Seed             | `npm run emulators:seed`, 62 Firestore documents and 6 Auth users      |
| Local URL        | `http://127.0.0.1:5173/`, HTTP 200                                     |
| Current LAN URL  | `http://172.20.10.3:5173/`, HTTP 200                                   |
| Old LAN URL      | `http://192.168.1.168:5173/`, timed out on this network                |
| Real phone       | Not available / not used                                               |
| Browser tool     | `agent-browser` CLI unavailable; Playwright fallback used              |

The LAN server was HTTP-probed only. The current Firebase emulator selector is
loopback-only, while the emulators listen on `127.0.0.1`. A phone opening the
LAN URL cannot yet be claimed to use the local Firebase emulators safely. This
is a P1 rehearsal/safety blocker, not a passed LAN mobile test.

## 3. Git / Branch / HEAD

- Branch at start: `mnyrasocial`, not `main`.
- Start HEAD: `7f1517da7ae5748053ff01224f615c7242bf378c`.
- Start working tree: clean.
- The branch was already ahead of `origin/mnyrasocial`; no merge or push was
  performed.
- Final commit is recorded in the task closeout after verification.

## 4. Start States

| State                        | Coverage                                                       | Result                                                                                             |
| ---------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Cold start                   | Fresh Pixel 5 context for all 10 public routes                 | Normal-network content rendered; no wrong-business data or overlay                                 |
| Incognito/private equivalent | Separate isolated Pixel 5 contexts, no cookies/storage/session | Same public result as cold start                                                                   |
| Warm session                 | One context across all public routes, then refresh             | Restaurant/shop/hotel identity stayed scoped; refresh retained expected content                    |
| Fast 3G                      | Fresh context for all 10 public routes                         | Blank app surface at the 8-second checkpoint; representative profile/menu content at about 11.1 s  |
| Slow 3G                      | Fresh context for all 10 public routes                         | Blank app surface at the 12-second checkpoint; representative profile/menu content at about 41.8 s |
| Offline/recover              | Public restaurant menu                                         | Direct offline navigation failed at browser level; reconnect plus reload recovered the menu        |

Cold/Incognito normal-network first meaningful text appeared in roughly
`0.28-0.43 s`; public menu completion was roughly `0.5-0.9 s` in the observed
local emulator runs. These localhost numbers are not production performance
claims.

## 5. Route Inventory

Public:

- `/pidhimadh`, `/pidhimadh/posts`, `/pidhimadh/menu`
- `/pidhimadh/menu?src=qr&table=2`
- `/shopdemo`, `/shopdemo/posts`, `/shopdemo/menu`
- `/hoteldemo`, `/hoteldemo/posts`, `/hoteldemo/menu`

Authenticated and operational:

- Restaurant Owner `/menu`, `/orders`, own public profile, foreign public shop,
  return to `/menu` and `/orders`
- Shop Owner `/menu`, `/orders`, `/shopdemo`, return to `/menu`
- Hotel Owner `/menu`, `/hoteldemo`, return to `/menu`
- Waiter login, board, status update and refresh
- Heart `/apps/mnyra-heart/index.html?firebase-emulator=1&view=crmLeads`
- `/feed`, `/restaurants`, `/travel`, `/shopping`, `/map`

## 6. Route-by-Route Results

| Area              | Route / flow                     | Cold/private/warm result                                                 | Mobile network result                                   | Verdict                             |
| ----------------- | -------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- | ----------------------------------- |
| Public restaurant | `/pidhimadh`, `/pidhimadh/posts` | Correct restaurant identity; empty posts state settled                   | Blank at 8/12 s; content about 11.1/41.8 s              | P1 3G blocker                       |
| Public menu       | `/pidhimadh/menu`                | 24 seeded products and focus content rendered; no false `Keine Produkte` | Blank at 8/12 s; menu about 11.1/41.8 s                 | P1 3G blocker                       |
| QR menu           | `src=qr&table=2`                 | Query survived refresh/back/forward; canonical menu stayed visible       | Same blank-screen cost before runtime arrives           | P1 3G; functional context passed    |
| Public shop       | profile/posts/menu               | Correct shop identity; `Local Cotton Shirt` rendered                     | Blank at 8/12 s                                         | P1 3G blocker                       |
| Public hotel      | profile/posts/details            | Correct hotel identity; public Details content rendered                  | Blank at 8/12 s                                         | P1 3G blocker                       |
| Restaurant Owner  | `/menu`                          | Editor, 24 products, focus and 12 QR tables present                      | Pixel 5 automated mutation test passed                  | Passed with real-device/media gap   |
| Owner Orders      | `/orders`                        | Own order remained after refresh; no shop order bleed                    | Pixel 5 automated check passed                          | Passed for covered list/empty flow  |
| Shop Owner        | `/menu`, `/orders`               | Product editor entry and clean empty Orders state                        | Entry only; no mutation                                 | P2 coverage gap                     |
| Hotel Owner       | `/menu`                          | Hotel Details and Oferta entry present                                   | Entry only; no mutation                                 | P2 coverage gap                     |
| Waiter            | login/status/refresh             | Own order visible; button enabled before and after update/refresh        | Pixel 5 and E2E passed                                  | Passed for covered flow             |
| Heart             | Leads/Search/Customers/return    | Empty seed view stable in manual observation                             | Diagnostic lead test reproduced Search focus loss       | P1 open; no fix in scope            |
| Feed              | `/feed`                          | Landing rendered                                                         | One denied `collectionGroup("stories")` read logged     | P1 social blocker                   |
| Restaurants       | `/restaurants`                   | City gate rendered                                                       | Mobile gate usable; no seeded result without city input | Observed, not full discovery flow   |
| Travel            | `/travel`                        | Hotel card rendered                                                      | No console error                                        | Passed for read-only seed view      |
| Shopping          | `/shopping`                      | Shop landing rendered                                                    | No console error                                        | Passed for read-only seed view      |
| Map               | `/map`                           | Map surface rendered                                                     | No console error                                        | Passed visually; no GPS interaction |

## 7. Loading Behavior Matrix

| Surface         | First visible state              | Stable state                    | Finding                                                                |
| --------------- | -------------------------------- | ------------------------------- | ---------------------------------------------------------------------- |
| Public profile  | Header brand, then profile shell | Correct profile and empty posts | Brief `Noch keine Bio.` precedes canonical bio on normal cold load; P2 |
| Restaurant menu | Profile/menu skeletons           | Focus plus 24 products          | No false `Keine Produkte`; skeleton heights reserve content space      |
| Shop menu       | Product skeleton                 | `Local Cotton Shirt`            | No empty/product/empty loop observed                                   |
| Hotel details   | Profile/details skeleton         | Hotel detail fields             | Seed route is Details, not a menu product list                         |
| Owner Orders    | Existing row retained            | Same own order                  | Automated renderer/E2E evidence covers refresh retention               |
| Waiter          | Short `wird geladen` state       | Own restaurant board            | Status update did not collapse the board                               |
| Heart           | Short login/loading transition   | Leads or Customers              | Empty manual seed stable; diagnostic focus loss remains                |
| 3G public       | Empty app root                   | Full route after bundle/runtime | No useful loading shell for 11-42 s; P1                                |

## 8. Image / Photo Stability Matrix

| Image area                    | Evidence                                                | Result                                                                                               |
| ----------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Public cover/avatar           | Broken local image injection plus screenshot            | Cover hides cleanly; avatar uses neutral fallback; no broken icon                                    |
| Public menu responsive images | Forced failure, request counter and visible-image check | Fixed: 2,616 errors / hundreds of retries reduced to 8 requests total and zero visible broken images |
| Owner menu images             | SVG-stubbed local screenshots and existing CRUD E2E     | Layout stable, but real decode/replacement flicker not proved                                        |
| Shop product image            | SVG-stubbed public/owner entry                          | No broken layout; mutation flicker not tested                                                        |
| Hotel/offer image             | SVG-stubbed public/owner entry                          | No broken layout; mutation flicker not tested                                                        |
| Heart Lead avatar             | Existing diagnostic lead test                           | Product-side flicker not closed; mobile Search focus failed in same diagnostic                       |

The seed uses `images.example.local`; deterministic SVG responses prove layout
and fallback contracts, not production CDN decode behavior. Real phone/3G media
remains manual.

## 9. Empty State Matrix

| Surface                           | Observed empty state      | Assessment                                            |
| --------------------------------- | ------------------------- | ----------------------------------------------------- |
| Public posts                      | `Keine Inhalte gefunden`  | Correct for seeded empty posts                        |
| Public empty-menu fixture         | `Keine Produkte`          | Automated browser coverage passed                     |
| Shop Owner Orders                 | `Noch keine Bestellungen` | Correct and not cross-filled                          |
| Heart Leads                       | `Keine Leads`             | Correct for final seed after cleanup                  |
| Waiter quiet board                | Not isolated manually     | Existing code/test coverage only; still P2 manual gap |
| Restaurants without selected city | City gate, not error      | Correct gate; result-list flow not completed          |

## 10. Error State Matrix

| Case                               | Result                                                     | Status                                      |
| ---------------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| Public normal routes               | No console/page/permission error after local bootstrap fix | Passed                                      |
| QR normal route                    | No production Firebase request after Early-Return fix      | Passed                                      |
| Feed stories read                  | `false for 'list' @ L952`                                  | P1 open; contract issue, Rules not loosened |
| Broken menu images                 | Expected image request failures; bounded, fallback visible | Fixed                                       |
| Offline direct load                | Browser `ERR_INTERNET_DISCONNECTED`                        | Expected; in-place recovery not proved      |
| Heart mobile Search                | Focus lost after typing diagnostic text                    | P1 open, trace saved                        |
| Forced Owner/Waiter listener error | Not injected                                               | P1 evidence gap                             |

## 11. Refresh / Back / Forward Matrix

| Flow                                     | Result                                                       |
| ---------------------------------------- | ------------------------------------------------------------ |
| All 10 public routes, warm refresh       | Expected business identity/content remained                  |
| Restaurant profile -> QR menu -> Back    | Returned to restaurant profile                               |
| Forward to QR menu                       | `src=qr&table=2` and menu restored                           |
| QR refresh                               | Query and menu retained                                      |
| Owner `/menu` -> foreign shop -> `/menu` | Own restaurant menu/focus restored; no shop product bleed    |
| Owner `/orders` return                   | Own order retained                                           |
| Heart Leads -> Customers -> Leads        | View returned; separate Search focus diagnostic still failed |

## 12. Cross-Business Navigation Matrix

| Sequence                                           | Result                               |
| -------------------------------------------------- | ------------------------------------ |
| Restaurant public -> Shop public -> Back           | Correct restaurant restored          |
| Restaurant menu -> Shop menu -> Back               | Correct restaurant products restored |
| Restaurant Owner `/menu` -> Shop public -> `/menu` | No foreign product/focus bleed       |
| Restaurant Owner `/orders` -> public -> `/orders`  | Own order only                       |
| Shop Owner public/owner return                     | Correct shop identity                |
| Hotel Owner public/owner return                    | Correct hotel identity               |

No wrong-business profile, menu, focus or order data was observed.

## 13. Owner / Waiter Operational Matrix

| Operation                                  | Evidence                                           | Result                                         |
| ------------------------------------------ | -------------------------------------------------- | ---------------------------------------------- |
| Restaurant menu create/edit/publish/delete | Existing desktop/mobile Playwright in final matrix | Passed                                         |
| Numeric/null price contract                | Unit plus Owner E2E                                | Passed                                         |
| Owner Orders list/refresh/scope            | Manual observation plus E2E                        | Passed for covered cases                       |
| Shop product editor entry                  | Manual and E2E                                     | Passed; mutation not run                       |
| Hotel Details/Oferta entry                 | Manual and E2E                                     | Passed; mutation not run                       |
| Waiter accept/status/refresh               | Post-fix Pixel 5 check plus E2E                    | Button enabled before, after and after refresh |
| Waiter foreign-order/write denial          | Rules and E2E                                      | Passed                                         |

## 14. Console / Network Findings

- Fixed: Public and QR emulator routes no longer contact production Firebase
  Functions. The local request is
  `http://127.0.0.1:5001/mnyra-local/us-central1/socialBootstrapFeed`.
- Fixed: failed menu `srcset` candidates no longer issue hundreds of retries.
- Open: `/feed` performs a denied `collectionGroup("stories")` list and logs
  `false for 'list' @ L952`.
- Expected abort noise exists when contexts close active local Firestore
  long-poll channels; it was not classified as an application failure.
- Heart and Waiter observations did not contact production Firebase services.

## 15. UI Quality Findings

1. P1: public routes are blank for an unacceptable interval under emulated 3G.
2. P1: Heart mobile Search loses focus in the existing diagnostic flow.
3. P1: Feed logs a denied story list and cannot be called console-clean.
4. P2: public profile briefly renders `Noch keine Bio.` before canonical bio.
5. P2: several header controls are 36-40 px and menu category chips are 32 px
   high, below the preferred 44 px mobile target.
6. P2: real media decode/flicker for Owner, Shop and Hotel is still unproved
   because the local image host is a deterministic SVG stub.
7. P2: LAN physical-device emulator mode is not safely configured.

## 16. Performance Feeling Notes

Normal localhost feels responsive after the bundle is cached. Cold constrained
network behavior does not: the empty root remains visible while the tracked
`social-app.js` entry (`1,135.72 kB`, `308.44 kB gzip`) and Firebase vendor
chunk (`441.98 kB`, `132.61 kB gzip`) load. The menu additionally needs the
profile/menu renderer (`160.32 kB`, `37.35 kB gzip`).

Measured representative cold completion:

- Fast 3G profile: about `11.1 s`.
- Fast 3G menu: about `11.1 s`.
- Slow 3G profile: about `41.8 s`.
- Slow 3G menu: about `41.8 s`.

The structural cause is P3 runtime/bundle work, but the visible blank-screen
effect is a P1 launch blocker.

## 17. P0 / P1 / P2 / P3 Issue List

| Priority | Issue                                                    | Status                     |
| -------- | -------------------------------------------------------- | -------------------------- |
| P0       | Wrong business/order/private data                        | Not observed               |
| P1       | Public/QR local emulator contacted production bootstrap  | Fixed                      |
| P1       | Failed responsive menu images retried continuously       | Fixed                      |
| P1       | 11-42 s blank public route under emulated 3G             | Open                       |
| P1       | Heart mobile Search loses focus                          | Open; no Heart fix allowed |
| P1       | Feed story collection-group read denied                  | Open; Rules unchanged      |
| P1       | Safe physical-phone LAN emulator path absent             | Open                       |
| P1       | Forced Owner/Waiter listener errors unproved             | Open evidence gap          |
| P2       | Brief `Noch keine Bio.` identity placeholder             | Open                       |
| P2       | 32-40 px mobile tap targets                              | Open                       |
| P2       | Shop/Hotel media mutations                               | Not run by scope           |
| P2       | Waiter zero-order and active revocation browser behavior | Open                       |
| P3       | Large public runtime and Firebase bundle                 | Open structural work       |

## 18. Fixes Applied

1. Local public/QR emulator startup now resolves the Functions bootstrap URL
   before both normal and QR Early-Return paths. Browser tests reject production
   Firebase endpoints.
2. Image fallback binding removes failed responsive `srcset` and `sizes`
   candidates before applying the single fallback/placeholder. This stops the
   observed request/error loop.
3. Unit and Playwright regressions cover both behaviors.

## 19. Fixes Not Applied

- No broad public runtime/bundle refactor for 3G.
- No Feed story/Rules contract change.
- No Heart interaction fix.
- No tap-target or visual redesign.
- No public-profile identity pipeline rewrite for the brief bio placeholder.
- No LAN emulator binding/configuration expansion.
- No Shop product or Hotel offer mutation.

## 20. Remaining Blockers

There is no launch-go. The P1 blockers are Slow/Fast-3G blank startup, Heart
mobile Search focus loss, the Feed story permission error, safe real-phone LAN
emulator setup and forced Owner/Waiter listener-error evidence. Real phone image
decode, QR scan and waiter tablet behavior are also required before acceptance.

## 21. Recommended Next Fix Order

1. Define and implement a light public first-render/runtime contract for the
   blank 3G interval; do not patch it with misleading fake content.
2. Diagnose Heart Search focus from the saved mobile trace without reusing the
   reverted blind fix.
3. Resolve Feed story read ownership/projection without loosening Rules.
4. Define a safe LAN emulator configuration for physical-device rehearsal.
5. Add forced Owner/Waiter listener-error fixtures.
6. Then run real phone/3G media and Shop/Hotel mutation rehearsals.

## 22. Real Device / 3G Status

- Real device: not tested.
- Physical QR scan: not tested.
- Real carrier/3G: not tested.
- Playwright CDP Fast/Slow 3G: tested and failed the launch-quality threshold.
- Desktop evidence is supporting only and does not close mobile findings.

## 23. Screenshots / Traces Location

Local ignored evidence:

- `tmp/mobile-manual-stability-artifacts/mobile-manual-stability-results.json`
- `tmp/mobile-manual-stability-artifacts/mobile-*-3g-*.png`
- `tmp/mobile-manual-stability-artifacts/fallback-normal-*.png`
- `tmp/mobile-manual-stability-artifacts/surface-*.png`
- `tmp/mobile-manual-stability-artifacts/post-fix-verification.json`
- `tmp/mobile-manual-stability-artifacts/post-fix-waiter-status.json`
- `tmp/mobile-manual-stability-artifacts/heart-search-focus-failure/trace.zip`
- `tmp/mobile-manual-stability-artifacts/heart-search-focus-failure/error-context.md`

The artifact directory is ignored and intentionally not committed.

## 24. Final Verdict

The normal-network local flow is materially cleaner and two concrete P1 issues
were fixed with small regression-covered changes. The sweep also found real
launch blockers that the prior green smoke matrix did not close. Mnyra remains
not launch-ready from this evidence.

Verification recorded for this sweep:

- Functions `4/4`, Rules `17/17`, Unit `134/134`, lint, format and architecture
  check passed.
- Fix-focused Public Profile/Menu Playwright passed `18/18` on desktop/mobile.
- Relevant full Playwright matrix: `32 passed`, `1 failed`, `1 skipped`; the
  failure is the reproduced mobile Heart Search focus loss, and the skip is the
  intentional desktop Heart diagnostic.
- QR emulator isolation follow-up passed `2/2` on desktop/mobile.
- Build passed with the existing large-chunk warning and changed the tracked
  Social bundle entry.

## 25. Public Startup Shell Product Review Removal 2026-07-02

Product review removed the `16be1d0d` Public Startup Shell. The shell was only a
cosmetic mitigation for the blank public root under throttled startup; it was
not a performance fix and is not the desired product direction. Mnyra should
not mask 3G startup with a generic shell, dummy content, hidden business data or
a Mnyra-like skeleton screen.

Updated issue list:

| Priority | Issue                                               | Status                                                |
| -------- | --------------------------------------------------- | ----------------------------------------------------- |
| P1       | Empty public root under emulated 3G                 | Open again after shell removal; expected known defect |
| P1       | Slow useful public content under emulated 3G        | Open; runtime/bundle work required                    |
| P1       | Feed story collection-group read denied             | Open; Rules unchanged                                 |
| P1       | Safe physical-phone LAN emulator path absent        | Open                                                  |
| P1       | Forced Owner/Waiter listener errors unproved        | Open evidence gap                                     |
| P2       | Real media decode/flicker for Owner, Shop and Hotel | Open; real phone/3G not tested                        |

Retained fixes from the broader sweep: Public/QR emulator bootstrap isolation
and the broken responsive menu image `srcset` request-loop fix remain required
and must stay green.

The real solution remains a separate Public Runtime Split / 3G Stability
Architecture Plan: split Public Profile and Public Menu/QR runtime, avoid
Firebase/Auth/Firestore before public first content where not needed, make
route-specific public entry points, define bundle budgets and verify real
phone/3G/QR/media behavior. There is no launch-go.

Cleanup verification after shell removal:

- Shell-specific source/output markers were absent:
  `data-public-startup-shell`, `.mnyra-public-startup-shell`,
  `public-website-startup` and `MNYRA wird geladen`.
- Mobile route probe passed cold isolated, refresh and warm states for
  `/pidhimadh`, `/pidhimadh/menu`, `/pidhimadh/menu?src=qr&table=2`,
  `/pidhimadh/posts`, `/shopdemo` and `/hoteldemo`.
- Back/Forward preserved QR `src=qr` and `table=2`.
- Public/QR emulator probe observed `0` production Firebase/Functions
  requests.
- Broken image-loop probe observed `8` failed fake image requests and `0`
  visible broken images.
- Slow-3G probe on `/pidhimadh/menu` showed `0` body text after 12s, no shell
  markers and real menu content after about `44.5 s`; this is the expected open
  P1/P3 finding, not a launch pass.
- Non-Heart Playwright matrix passed `32/32`. The full matrix with existing
  Heart diagnostics finished `32 passed`, `1 failed`, `1 skipped`; the failure
  is the known Heart mobile Search diagnostic and was not fixed here.
- Final baseline passed Functions `4/4`, Rules `17/17`, Unit `134/134`, lint,
  format check, architecture check and build. The build retained the known large
  `social-app.js` warning and changed no tracked bundled browser files.

## 26. Public Focus Marker Follow-Up 2026-07-02

This follow-up adds mobile-readable DOM markers for public Menu/Focus state.
It does not change the visible UI and does not close the real-phone/3G gate.

Pixel 5 marker probe:

| Route                            | Normal mobile                                          | Fast 3G mobile                                          | Slow 3G mobile                  |
| -------------------------------- | ------------------------------------------------------ | ------------------------------------------------------- | ------------------------------- |
| `/pidhimadh/menu`                | Menu and Focus present at `735 ms`, stale `false`      | Menu and Focus present at `11629 ms`, stale `false`     | No app text or marker by `12 s` |
| `/pidhimadh/menu?src=qr&table=2` | Menu and Focus present at `612 ms`, QR query retained  | Menu and Focus present at `11588 ms`, QR query retained | Not rerun in this cap           |
| `/shopdemo/menu`                 | Product visible at `578 ms`; Focus marker non-blocking | Product visible at `11535 ms`; Focus `known-empty`      | Not rerun in this cap           |

Updated automated proof:

- Focus/Menu state unit tests passed `20/20`.
- Public Menu E2E passed `10/10` across desktop Chromium and mobile Chrome.
- The stale wrong-business Focus state is now a named testable state.

Real phone, physical QR scan, LAN emulator safety, real image decode and carrier
3G remain untested. There is still no launch-go.

Final automated verification for the marker pass passed Functions `4/4`, Rules
`17/17`, Unit `134/134`, lint, format check, architecture check and build.
Public Menu/QR focused Playwright passed `10/10`; the broader relevant
desktop/mobile matrix retained the known Heart mobile Search failure
(`32 passed`, `1 failed`, `1 skipped`). `127.0.0.1:5173` and current WLAN
`172.20.10.3:5173` responded with HTTP 200; configured `192.168.1.168:5173`
timed out on this network.
