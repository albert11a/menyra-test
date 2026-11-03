# Vercel cost control and reporting

Owner request: 2026-11-04 (Europe/Vienna). Keep the website, Heart, Creator media,
downloads and GitHub push-to-deploy workflow working. Report Vercel cost status
and deployment costs after future code pushes made by the assistant.

## Verified account baseline

- Team: `alberts-projects-d38dc556` (`team_1GK6jCy86SJuPu09Efx5VSex`), Pro.
- Production project: `menyra-test` (`prj_MiYIDtnemjoIdWW3nOrLTHkIpnr6`).
  Hosts `mnyra.com`, `www.mnyra.com` and the LifeSkin custom domains.
- Duplicate project: `menyra-test_recovered_20260311_014955`
  (`prj_1x2Ui9BzMI6DVGLvFagryVOQHjab`). Same GitHub repository
  `albert11a/menyra-test`, no custom domains in the inspected configuration.
  Commits fefbcf7 and 3a36f525 each generated deployments in both projects.
- Legacy separate project: `menyra` (`prj_IMqL8I94ICQyXwmqBRvUEVV5kMEX`),
  connected to `albert11a/menyra`, rather than this repository.
- All three matched Vercel's Turbo build-machine filter before changes.

Five adjacent, successful billing windows covered returned charge periods from
2026-09-30 07:00 UTC through 2026-11-03 08:00 UTC. All summary records were
included; the tool's individual record samples were truncated. Billed cost was
USD 123.309836894989, including Build CPU Minutes USD 91.98, Pro USD 20.752688172042
and Speed Insights Plus USD 8.709677419355. This is an account-level historical
snapshot, not a finalized calendar-month invoice or a per-project allocation.
Do not assume that half the historical build charges belong to either project.

## Approved changes and current verification limits

- Use fixed Standard build machines instead of Turbo.
- Skip builds in the duplicate recovered project while preserving its existing
  deployed version and the main project's GitHub connection. The existing ignored
  build step now returns success only for that project's immutable ID, before
  reading Git history. Verify a CANCELED/ignored deployment for the pushed SHA.
- Replace paid Speed Insights Plus with the free tier. Own Heart analytics are
  independent and must be preserved.
- Preserve the reviewed Creator preview improvements and the 12-second visible
  shop refresh interval. No new realtime listener or analytics rewrite is needed.

Verified in the authenticated Vercel dashboard and independently through the
Standard-filtered project API: all three projects now use Standard (4 vCPU,
8 GB). The main project's Speed Insights Plus renewal was turned off; the
confirmation said the current cycle ends 2026-11-05 with no refund. The page
subsequently displayed the free-tier Upgrade controls. Heart analytics were
not changed.

Automatic approval review rejected disconnecting the recovered project's Git
connection because branch-specific configuration could be affected and a
narrower ignored-build guard exists. The connection remains intact. The tested
source guard is the safer alternative. Verify the exact released SHA after push;
do not infer deployment success from these settings.

## Cost report procedure

1. Verify the current team/project and exact Git SHA before release. A user request
   to commit/push main authorizes that task's normal Git-driven production release.
2. Run applicable local checks and the required production build before pushing.
   Local npm builds do not consume Vercel's remote build minutes.
3. Check all linked Vercel projects for deployments of that exact SHA. Include
   production, previews, retries and duplicates. Preserve the existing live site
   if a smaller build machine fails; diagnose before retrying paid builds.
4. Inspect terminal deployment status and build logs. Confirm machine resources
   from actual deployment evidence where available, rather than team defaults.
5. Read team billing for the requested/current period in bounded, adjacent windows.
   Start with daily/weekly windows to avoid the response-size limit. Use each
   window's exclusive `to` as the next inclusive `from`. Aggregate only after
   every window succeeds. Report returned charge dates as well as requested dates.
6. Report finalized per-deployment charges only when explicitly attributable to
   that deployment. Daily account charges are not an exact per-commit invoice.
   If absent, report a labeled estimate based on observed build duration/machine
   and the current published rate; disclose rounding and timing uncertainty.
   Billable duration includes build and post-build time, rounded up to a minute;
   CPU minutes multiply that duration by the actual machine's vCPU count. The
   connector may omit `duration.timeForBilling`/CPU-minute fields even when the
   REST API/dashboard can show them. Never treat ready minus buildingAt as an
   exact billed duration. Ignored Build Step skips consume no build minutes.
7. Keep fixed Pro fees and optional subscriptions separate from the cost of one
   push. Include usage credits/taxes only when actually evidenced in billing.

Suggested final report: pushed SHA; live deployment result; current billed
USD amount and returned date range; count/machine/duration of resulting builds;
incremental build cost (actual or estimate); outstanding permissions/data lag.

## Published rates checked during this task

Vercel listed Standard at USD 0.014 per build minute and Turbo at USD 0.105.
These are rates, not a guarantee of total savings: smaller machines may take
longer. Check current rates before estimates in future sessions.

- https://vercel.com/pricing
- https://vercel.com/docs/builds/managing-builds
- https://vercel.com/docs/speed-insights/limits-and-pricing
- https://vercel.com/changelog/deployments-now-show-billable-duration-and-cpu-minutes
- https://examples.vercel.com/academy/optimize-your-vercel-account/build-minutes
