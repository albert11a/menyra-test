# Creator live timing and legacy Working status

Owner request: keep live visitors, cart and Cash active for the same duration as LifeSkin; fix Working still counting only one business.

Findings: LifeSkin LIVE_FENSTER_MS is 180000 ms, inclusive of the boundary, allows 60 seconds of future clock skew, and expires by last activity rather than an online flag. Creator used 90000 ms, removed hidden/offline visits immediately, and mapped ordered back to page. Legacy creation automatically wrote ready/sent without workflowAt; the manual bulk Ready action writes workflowAt.

Scope: match LifeSkin live time semantics in Creator without importing/modifying its runtime or Pixel; require a valid explicit workflowAt for Ready/sent classification; retain archive and actual-customer precedence and Alle ordering. Cash represents ordered, cart includes cart/checkout because this Creator row has three points. Bound Cash to the actual order event so heartbeats cannot keep it lit forever. No production data migration or test writes.

Validation: 181 Creator/Heart/LifeSkin-live/Pixel tests passed. New tests compare all Creator live stages against LifeSkin at 90 s, 180 s, just outside the window, offline transitions and clock skew; cover actual-order Cash expiry despite fresh heartbeats; and verify legacy Ready/sent entries appear in Working counts and filtering until manual workflowAt exists. Existing controller test verifies manual Ready persists workflowAt. npm run build passed (existing chunk-size warning only); no tracked generated bundle files changed. git diff --check passed. No real mobile visual check; no layout/CSS changes, production test orders or notifications.
