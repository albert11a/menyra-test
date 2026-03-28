# Final Launch Test Matrix

## Purpose
This file is the Step 16 sign-off matrix for Steps 1-15.

Do not mark Step 16 as done until the rows below are executed in real manual testing and the `Actual result`, `Pass/fail`, and `Notes` fields are filled.

## Required roles
- guest
- normal user
- business/restaurant
- CEO
- staff

## Device/browser profiles
- `D1` Mobile PWA on the primary real device
- `D2` Mobile browser on the same device class
- `D3` Desktop Chrome sanity pass
- `D4` Desktop Chrome with CPU throttle (4x or similar)

## Network profiles
- `N1` Normal network
- `N2` Slow 4G / slow network
- `N3` Interrupted network after action dispatch
- `N4` CPU-throttled pass

## Execution rules
- Fill `Actual result`, `Pass/fail`, and `Notes` during the final run.
- For every row, execute the exact click path at least once.
- Where the click path says `repeat x3` or `repeat x5`, do the full sequence that many times.
- For rows with refresh/re-entry, do one full refresh after the main action and verify the final state again.
- For rows with rapid repeated taps, use 3-5 fast taps.
- If a row fails under `N2`, rerun it once more after recovery and record both outcomes in `Notes`.

## Matrix

### Feed / Post / Stories

| Test ID | Role | Device/browser | Network condition | Preconditions | Click path | Expected result | Actual result | Pass/fail | Notes |
|---|---|---|---|---|---|---|---|---|---|
| FLM-001 | guest | D1 | N1 | App cold-open, guest session | Open feed, scroll 20-30 posts, open one post, close, continue scrolling | Feed stays usable, images do not visibly break, post modal opens/closes cleanly |  |  |  |
| FLM-002 | normal user | D1 | N2 | Logged in, feed loaded | Open Post A, close, open Post B, close, open A again, repeat x3 | No stale post state, no wrong likes/comments from another post, modal remains responsive |  |  |  |
| FLM-003 | normal user | D1 | N1 | Logged in, at least one likeable feed post | Like from feed card, immediately open same post modal | Like state and count stay consistent between card and modal |  |  |  |
| FLM-004 | normal user | D1 | N2 | Logged in, post modal available | Open post modal, like/unlike inside modal, close, verify feed card, repeat x3 | Immediate feedback, no double-like, final state matches after close |  |  |  |
| FLM-005 | normal user | D1 | N2 | Logged in, post with comments | Open post modal, add a comment, close modal, verify feed/post card, reopen post | Comment remains visible, count is correct, no duplicate jump |  |  |  |
| FLM-006 | normal user | D2 | N1 | Logged in, post with likes | Open likes modal for same post twice, close/reopen x3 | No blind full-refetch feel, list remains correct, no empty flash |  |  |  |
| FLM-007 | normal user | D1 | N2 | Logged in, stories available | Open story, advance, close, reopen another story, repeat x3 | Story opens reliably, no broken viewer state, no obvious image/video instability |  |  |  |
| FLM-008 | normal user | D1 | N1 | App already open | Open a story via in-app entry, then via deep-link/push target if available | Story target opens correctly even with app already open |  |  |  |

### Menu / Product Detail / Favorites / Cart / Checkout

| Test ID | Role | Device/browser | Network condition | Preconditions | Click path | Expected result | Actual result | Pass/fail | Notes |
|---|---|---|---|---|---|---|---|---|---|
| FLM-009 | normal user | D1 | N1 | Open a business profile, menu visible | Stay in menu view for 30-60 seconds without interaction | No spontaneous grey repaint, no sticky flicker, view stays visually calm |  |  |  |
| FLM-010 | normal user | D1 | N1 | Menu loaded | Menu card -> product detail -> close -> same item again, repeat x5 | Open/close stays stable, no grey flash, no wrong item state |  |  |  |
| FLM-011 | normal user | D1 | N2 | Menu loaded with at least two items | Open Item A detail, close, Item B detail, close, return to A | No cross-item bleed, no stale detail content, no visible instability |  |  |  |
| FLM-012 | normal user | D1 | N1 | Menu cards visible | Tap menu-card heart to like, then tap again to unlike, repeat x3, then refresh once | Heart turns red immediately, turns neutral immediately, survives refresh correctly |  |  |  |
| FLM-013 | normal user | D1 | N2 | Menu loaded | Tap `+` / expand on menu cards repeatedly x5 | No grey image flash, no unstable card expansion, no remount-looking break |  |  |  |
| FLM-014 | normal user | D1 | N1 | Product detail open | Toggle favorite in modal, then verify like state did not change | Favorite and like remain separate actions |  |  |  |
| FLM-015 | normal user | D1 | N1 | Menu loaded, empty cart | Add Product A to cart, then Product B, open cart | Correct items, correct quantities, same restaurant context |  |  |  |
| FLM-016 | normal user | D1 | N2 | Cart contains items | Open checkout, submit once, use rapid repeated taps on submit | Visible pending state, no duplicate submission, user sees to wait |  |  |  |
| FLM-017 | normal user | D1 | N3 | Cart contains items | Start checkout submit, interrupt network after dispatch, then recover and retry | Failure is recoverable, retry does not create obvious duplicate order state |  |  |  |
| FLM-018 | normal user | D1 | N1 | Restaurant A and B both available | Open Restaurant A menu, interact, switch to B, then back to A | No stale menu, cart, favorite, or like state from the other restaurant |  |  |  |

### Upload / Post / Story Creation

| Test ID | Role | Device/browser | Network condition | Preconditions | Click path | Expected result | Actual result | Pass/fail | Notes |
|---|---|---|---|---|---|---|---|---|---|
| FLM-019 | normal user | D2 | N1 | Logged in, upload screen available | Create normal image post and submit once | Upload runs once, post appears, no duplicate create |  |  |  |
| FLM-020 | business/restaurant | D1 | N2 | Business account active | Create business post, slow network, wait through pending | Pending is visible, no dead submit button, final post appears once |  |  |  |
| FLM-021 | business/restaurant | D1 | N2 | Story upload available | Create story, wait through upload, verify final appearance | Story upload is understandable, no double-post, no broken pending state |  |  |  |
| FLM-022 | business/restaurant | D1 | N3 | Upload screen ready | Start upload, interrupt network, then retry same upload | Retry remains recoverable, no obvious duplicate post/story write |  |  |  |
| FLM-023 | business/restaurant | D1 | N2 | Upload screen ready | Double-tap submit 3-5 times on same upload | Only one upload flow proceeds, user sees pending |  |  |  |

### Profile / Follow / Notifications / Search / Discover

| Test ID | Role | Device/browser | Network condition | Preconditions | Click path | Expected result | Actual result | Pass/fail | Notes |
|---|---|---|---|---|---|---|---|---|---|
| FLM-024 | normal user | D1 | N1 | Public user profile available | Open public profile, tap follow, wait, then unfollow, repeat x3 | Immediate visible pending, no double execution, final state correct |  |  |  |
| FLM-025 | normal user | D1 | N2 | Private profile available | Open private profile, tap request/follow once | Button shows request-pending clearly, no dead state, no duplicate request |  |  |  |
| FLM-026 | normal user | D1 | N2 | Profile modal path available | Open profile modal from post/feed, follow/unfollow there | Modal button gives immediate feedback and final state matches profile view |  |  |  |
| FLM-027 | normal user | D1 | N2 | At least one `follow_request` notification exists | Open notifications, tap `Accept`, repeat only once per request | Button shows `Accepting...`, no duplicate accept, final notification state correct |  |  |  |
| FLM-028 | normal user | D1 | N3 | Same as above | Tap `Accept`, interrupt network, recover, retry | Failure is recoverable, request does not get stuck in fake accepted state |  |  |  |
| FLM-029 | normal user | D2 | N1 | Search available | Search business, open result, go back, open again, repeat x3 | Search -> profile -> back remains stable and returns to correct search context |  |  |  |
| FLM-030 | normal user | D2 | N2 | Search available | Type query changes quickly 5-10 times, open a result while search is still updating | No wrong target open, no global UI refresh outside search, no stale click result |  |  |  |
| FLM-031 | normal user | D1 | N1 | Notifications exist for post/chat/profile | Open notification target, then open same target again while already open | No duplicate reopen/reset, target stays correct |  |  |  |

### Chat

| Test ID | Role | Device/browser | Network condition | Preconditions | Click path | Expected result | Actual result | Pass/fail | Notes |
|---|---|---|---|---|---|---|---|---|---|
| FLM-032 | normal user | D1 | N2 | Chat thread exists | Open thread, send one message, rapid-tap send 3-5 times | Visible send pending, only one message send path, no duplicate message |  |  |  |
| FLM-033 | normal user | D1 | N2 | Chat thread exists | Add attachment, then quickly switch thread or close chat | No stale attachment appears in wrong thread, no broken composer state |  |  |  |
| FLM-034 | normal user | D1 | N1 | Notification for chat exists | Open chat from notification, close, open same chat again, repeat x3 | Correct chat thread opens, no duplicated reopen behavior |  |  |  |
| FLM-035 | normal user | D1 | N3 | Chat thread exists | Start send, interrupt network, then retry | Failure is understandable and recoverable, no duplicate send after retry |  |  |  |

### Auth / Session / Reload / Re-entry

| Test ID | Role | Device/browser | Network condition | Preconditions | Click path | Expected result | Actual result | Pass/fail | Notes |
|---|---|---|---|---|---|---|---|---|---|
| FLM-036 | guest -> normal user | D2 | N1 | Guest session active | Fill some guest-visible state, then log in | No stale guest/search/menu/upload/session mix leaks into user session |  |  |  |
| FLM-037 | normal user | D2 | N2 | Logged in on feed or profile | Reload on feed, reload on business menu, reload on product/post context | No double restore churn, no wrong old state after reload |  |  |  |
| FLM-038 | normal user A -> user B | D3 | N1 | Two test accounts available | Login as A, open profile/search/menu, logout, login as B | No stale state from A remains visible for B |  |  |  |

### CRM

| Test ID | Role | Device/browser | Network condition | Preconditions | Click path | Expected result | Actual result | Pass/fail | Notes |
|---|---|---|---|---|---|---|---|---|---|
| FLM-039 | CEO | D3 | N1 | CRM accessible, leads/customers/staff available | Load leads, customers, staff; switch scopes | Visibility remains correct, no rows disappear unexpectedly |  |  |  |
| FLM-040 | CEO | D3 | N2 | CRM open, create lead form ready | Create lead, rapid-tap save 3-5 times | One save flow, visible pending, final lead created once |  |  |  |
| FLM-041 | CEO | D3 | N2 | Existing lead available | Edit lead and save under slow network | Save remains understandable, no duplicate save |  |  |  |
| FLM-042 | CEO | D3 | N2 | Existing lead available | Convert lead to customer | One convert flow, no wrong restaurant link side effect, final state correct |  |  |  |
| FLM-043 | CEO | D3 | N2 | Existing lead available | Delete lead, rapid-tap delete 3-5 times | One delete flow, no duplicate destructive action, no unrelated restaurant damage |  |  |  |
| FLM-044 | CEO | D3 | N1 | Staff editor available | Create staff, edit staff, delete staff | Save/delete are repeat-safe, no wrong target mutation |  |  |  |
| FLM-045 | staff | D3 | N1 | Staff account available | Open allowed CRM views and verify limited scope | Staff only sees intended scope, no CEO-only destructive access |  |  |  |

### Cross-surface control pass

| Test ID | Role | Device/browser | Network condition | Preconditions | Click path | Expected result | Actual result | Pass/fail | Notes |
|---|---|---|---|---|---|---|---|---|---|
| FLM-046 | normal user | D1 | N4 | Chrome or emulator with CPU throttle available | Repeat FLM-002, FLM-010, FLM-016, FLM-024, FLM-032 under CPU throttle | Critical flows still feel responsive enough to understand, no dead or ambiguous states |  |  |  |
| FLM-047 | business/restaurant | D1 | N2 | Business profile/menu active | Observe header, menu, modal opens, favorites/cart/detail in one pass | No visible sticky jump regression, no menu repaint instability, core business flows remain stable |  |  |  |
| FLM-048 | CEO | D3 | N2 | CRM and notifications active | Run one CRM action, one notification action, one reload | Internal tools remain understandable and recoverable under degraded conditions |  |  |  |

## Sign-off summary

Fill this only after all rows above are executed.

- Test run date:
- Build/branch:
- Tester:
- Total rows:
- Passed:
- Failed:
- Blocked:
- Critical blockers:
- Go / no-go:
