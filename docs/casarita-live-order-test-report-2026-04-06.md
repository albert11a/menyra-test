# Casarita Live Order Test Report

Datum: 2026-04-06  
Quelle: `tests/mnyra-heart-runner/scripts/live-guest-order-audit.mjs`

## 1) Zusammenfassung (aktuellster Lauf)

- Lauf-Datei: `tests/mnyra-heart-runner/artifacts/live-guest-order-audit-20260406011529/live-guest-order-audit-report.json`
- Gesamt: `6/6` erfolgreich
- Passrate: `100%`
- Echte Bestellungen wurden erfolgreich ausgelost (wifi + slow4g)

## 2) Stabilitaet / Fehler

- Page Errors: `0`
- Console Errors: `0`
- Request Failures: `0`
- HTTP Errors (>=400): `0`

## 3) Zeitmessungen

`wifi` (3 Runs):

- Menue sichtbar: `p50 1268ms`, `p95 1342ms`
- Add-to-cart bestaetigt: `p50 231ms`, `p95 581ms`
- Bestell-Outcome: `p50 827ms`, `p95 5456ms`
- Gesamtlauf: `p50 11441ms`, `p95 15268ms`

`slow4g` (3 Runs):

- Menue sichtbar: `p50 2840ms`, `p95 2929ms`
- Add-to-cart bestaetigt: `p50 3609ms`, `p95 3623ms`
- Bestell-Outcome: `p50 881ms`, `p95 1699ms`
- Gesamtlauf: `p50 16378ms`, `p95 17187ms`

## 4) Bewertung

- Der echte Bestellpfad ist im sequenziellen Live-Audit stabil (`100%`).
- Unter schwachem Netz bleibt `add-to-cart` der langsamste Schritt und muss weiter reduziert werden.
