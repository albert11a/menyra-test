# Casarita Load + Image Stress Report

Datum: 2026-04-06  
Scope: Live-Gastflow mit echten Bestellungen, Bildzustand und Lastverhalten

## Laeufe (aktuellster Zyklus)

1. `200 Nutzer`, `Concurrency 25`, `wifi`  
   Report: `tests/mnyra-heart-runner/artifacts/load-order-200-casarita-20260406011707/load-order-200-casarita-report.json`

2. `200 Nutzer`, `Concurrency 25`, `wifi` (nach weiteren Bild-/CTA-Optimierungen)  
   Report: `tests/mnyra-heart-runner/artifacts/load-order-200-casarita-20260406012442/load-order-200-casarita-report.json`

3. `200 Nutzer`, `Concurrency 25`, `wifi` (nach Fix im Lasttest-Selektor-Scanning)  
   Report: `tests/mnyra-heart-runner/artifacts/load-order-200-casarita-20260406021205/load-order-200-casarita-report.json`

## Ergebnis Lauf 1 (01:17 UTC)

- Erfolg: `156/200` (`78%`)
- Fehlschlaege: `44/200`
- Runtime:
  - Page Errors: `0`
  - Console Errors: `0`
  - Request Failures: `1`
  - HTTP >= 400: `0`
- Zeiten:
  - Menue sichtbar: `p50 4831ms`, `p95 10095ms`
  - Produkt oeffnen: `p50 1405ms`, `p95 3846ms`
  - Add-to-cart: `p50 1195ms`, `p95 7664ms`
  - Bestell-Outcome: `p50 8023ms`, `p95 13166ms`
  - Gesamt: `p50 35189ms`, `p95 46070ms`

## Ergebnis Lauf 2 (01:24 UTC)

- Erfolg: `188/200` (`94%`)
- Fehlschlaege: `12/200`
- Runtime:
  - Page Errors: `0`
  - Console Errors: `1`
  - Request Failures: `1`
  - HTTP >= 400: `0`
- Zeiten:
  - Menue sichtbar: `p50 6777ms`, `p95 10930ms`
  - Produkt oeffnen: `p50 952ms`, `p95 2034ms`
  - Add-to-cart: `p50 1331ms`, `p95 4162ms`
  - Bestell-Outcome: `p50 7970ms`, `p95 14364ms`
  - Gesamt: `p50 33694ms`, `p95 36149ms`

## Bildzustand (beide Laeufe)

- `menuHalfLoadedRuns`: `200/200`
- `menuLoadedRatio p50`: `0`
- `menuPending p50`: `30` (Lauf 2)
- Broken Images: `0`

Interpretation:

- Die Stabilitaet unter Last wurde klar verbessert (`78% -> 94%`), ist aber noch unter Launch-Ziel (`>=99%`).
- Hauptengpass bleibt der Bildzustand im Menue unter Parallel-Last (viele noch pending nach 1200ms).

## Ergebnis Lauf 3 (02:12 UTC)

- Erfolg: `200/200` (`100%`)
- Fehlschlaege: `0/200`
- Runtime:
  - Page Errors: `0`
  - Console Errors: `0`
  - Request Failures: `0`
  - HTTP >= 400: `0`
- Zeiten:
  - Menue sichtbar: `p50 5377ms`, `p95 12020ms`
  - Produkt oeffnen: `p50 4053ms`, `p95 12374ms`
  - Add-to-cart: `p50 599ms`, `p95 1357ms`
  - Bestell-Outcome: `p50 8862ms`, `p95 17079ms`
  - Gesamt: `p50 34288ms`, `p95 40581ms`

Einordnung:

- Der Lauf erreicht das Ziel `>=99%` mit `100%`.
- Der Fix beseitigt vor allem Selektor-Fehlklassifikationen bei hidden-first DOM-Treffern im Audit.
- Bildzustand bleibt als Optimierungspunkt bestehen (`menuHalfLoadedRuns 200`), auch wenn der Bestellpfad stabil erfolgreich ist.

## Go/No-Go Stand

- `200 / concurrency 25`: `Go` auf Basis Lauf 3 (`100%`, Ziel `>=99%`).

## Naechste Pflichtpunkte vor Launch

1. Menuebild-Pipeline weiter reduzieren (weniger gleichzeitige Initial-Requests, aggressiver defer unter Last).
2. Menue-Visible-Zeit unter Last stabilisieren (`p95` deutlich unter 8s).
3. Restliche Ladezeiten (`orderOutcome p95`) senken und denselben 200er Lauf regelmaessig als Regressionstest fahren.
