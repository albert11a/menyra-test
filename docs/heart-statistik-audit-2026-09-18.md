# Heart / LifeSkin statistics audit

Scope: reconcile report checkout flags with period statistics, inspect live counts,
scan funnel, orders/revenue, test exclusion, duplicate handling and read limits.
Changes stay on `fix/heart-statistics-audit`; no production data or deploys.

Confirmed code defects: report statistics filtered by scan creation day; live data
not propagated to dashboard; test sessions counted live; one checkout appears in
both live rows; address progress only written on purchase; silent 3,000-document
read cap; name/device heuristic drops distinct sessions; previous-period boundary
omits one day. Report PATCH HTTP failures were treated as successful requests.

Implementation and validation results follow below.

## Result

- Report activity now uses per-day markers in `timings.ereignisse`. Repeated
  visits on different days remain queryable; one case counts once per marker
  within the selected range. Percentages use the union of active reports.
- Existing flags without event dates use last activity as an **explicitly
  marked estimate**. `Max` counts stored flags without date estimates. No
  historical event times are fabricated or backfilled in production.
- Scan counts, conversion, source and demographic panels use the selected scan
  cohort. Order/revenue cards, order list and daily series use purchase time
  (`order.createdAt`, falling back to report `bestelltAt`, then legacy scan day).
- Recent session snapshots update the same cases used by detail and dashboard.
  Live excludes tests, assigns each person to at most one row, tracks current
  screen separately from highest scan step, and surfaces connection errors.
  It means activity within three minutes, not verified online presence.
- The live query renews its time window every three minutes and no longer cuts
  off after 300 people. Initial reads paginate past 3,000 documents. Failure to
  load report/test metadata no longer silently treats all cases as real.
- Name/device matching no longer deletes distinct session identities. The
  previous week/month now includes its final boundary day.
- Address entry is captured before order submission. PATCH operations are
  serialized and retried once; HTTP failures cannot confirm an unsaved order.
  Preview writes are excluded. Nested masks preserve scan durations and other
  event days. The same session remains the private source of order truth.
- Removed unsupported claims that a drop proves the price is the cause. Missing
  optional milestones no longer label an advanced case as abandoned at waiting.
  Follow-up lists deduplicate contacts and distinguish telephone contacts from
  WhatsApp events; potential revenue is labeled as an estimate.

## Validation

- Focused Node regression suite: **763 passed, 0 failed, 0 skipped**
  (`tests/lifeskin-*.test.mjs`, `tests/heart-lifeskin-*.test.mjs`,
  `tests/heart-statistik-audit.test.mjs`, `tests/heart-state-store.test.mjs`,
  `tests/heart-view-error-boundary.test.mjs`).
- 16 audit regressions include old-scan checkout, multi-day visits, unrelated
  updates, legacy estimates, nested update masks, early address entry, live
  test exclusion and row uniqueness, state reconciliation, distinct identities,
  date boundaries, purchase-day revenue, HTTP failure/retry, write ordering,
  resumed scan preservation, pagination and listener lifecycle/cap removal.
- `npm run build`: passed. Tracked Social bundle files unchanged; no changed
  bundle files to commit. Static output includes the shared statistics module.
- `git diff --check`: passed.
- No production data accessed, no migration, no rules/functions/production
  deployment. No patient identifiers or photographs included in this PR.
- No mobile/browser/Playwright smoke check performed (repository instructions
  reserve these for an explicitly requested run). The screenshot discrepancy
  was reproduced with synthetic cases; the patient's actual record and live
  production totals were not independently verified.

## Remaining verification after release

1. On mobile, use a marked test case created on an earlier day. Open the report,
   view the price, open checkout, type an address, return to the report.
2. Confirm one current live position, exclusion from real totals, and immediate
   agreement between detail and report activity when test marking is removed.
3. Confirm `Heute`, `Gestern`, `7 Tage`, `30 Tage`, `Max`; legacy estimates should
   retain their asterisk. Check an older scan with a new purchase against its
   purchase-day revenue and order list.
4. Disconnect Heart: live must display an unavailable status. Reconnect and
   verify recovery; inactive positions expire after three minutes.

Limits: visitors' device clocks still provide timestamps. Historical events
without event dates cannot be reconstructed exactly. Cross-tab changes to
report metadata and removals outside the recent session query require refresh.
Reports from the former renderer lack the new per-day markers and are treated
as legacy. The screenshot alone does not establish which of these mechanisms
caused this particular patient's discrepancy.
