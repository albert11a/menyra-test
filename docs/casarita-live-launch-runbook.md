# Casarita Live Launch Runbook

Stand: 2026-04-06

## Ziel

Launch-Freigabe fuer den Casarita-Gastpfad unter realen Bedingungen:

- QR scannen
- Menue laden und scrollen
- Produktdetail oeffnen/schliessen
- Warenkorb erreichen
- (optional bewusst) Tischbestellung absenden

## Block A - Automatischer Guest-Flow (Live, read-only)

Schnellstart als Gesamtlauf:

```powershell
cd tests/mnyra-heart-runner
npm run casarita-live
```

Oder getrennt:

```powershell
cd tests/mnyra-heart-runner
$env:MNYRA_HEART_PACK_CONFIG_FILE = "config/casarita-prod-config.json"
$env:MNYRA_HEART_FAIL_ON_CONSOLE_ERRORS = "true"
$env:MNYRA_HEART_FAIL_ON_REQUEST_FAILURES = "true"
$env:MNYRA_HEART_FAIL_ON_HTTP_ERRORS = "true"
node ./src/run-pack.mjs guest-pack
```

Muss gruen sein fuer:

- `menu`: QR-Menue sichtbar, Deep-Scan und Detail-Samples stabil
- `cart`: Warenkorb erreichbar
- `business`: keine privilegierten Business-Controls auf Gastseite sichtbar
- `runtime` und `performance`: keine harten Fehler

Artefakte:

- `tests/mnyra-heart-runner/artifacts/guest-pack-*/guest-pack-report.json`
- `tests/mnyra-heart-runner/artifacts/guest-pack-*/guest-pack-runtime-diagnostics.json`
- Screenshots + Trace

## Block B - Cold + Netzwerk-Matrix

```powershell
cd tests/mnyra-heart-runner
$env:COLD_AUDIT_BASE_URL = "https://www.mnyra.com/social/"
$env:COLD_AUDIT_RESTAURANT_ID = "Lzm6RpNu3ErSDtGCHxpi"
$env:COLD_AUDIT_ITERATIONS = "5"
$env:COLD_AUDIT_EXPECTED_PRODUCTS = "27"
$env:COLD_AUDIT_STRICT_PRODUCT_COUNT = "true"
$env:COLD_AUDIT_NETWORK_PROFILES = "wifi,slow4g"
npm run cold-audit
```

Muss gruen sein fuer:

- keine `pageErrors`, `consoleErrors`, `httpErrors`
- keine kaputten Bilder im Menue-Scan
- Produktanzahl erreicht Ziel (`27`)
- keine horizontalen Overflow-Fehler
- pass rate pro Szenario/Netzprofil >= 95%

Artefakt:

- `tests/mnyra-heart-runner/artifacts/cold-load-audit-*/cold-load-audit-report.json`

## Block C - Echte Handy-Runde im Restaurant

Pflicht-Matrix:

- iPhone Safari (aktuell)
- Android Chrome (aktuell)
- 1 aelteres Android (Low-End)

Pro Geraet:

1. QR am Tisch scannen
2. Menue komplett scrollen
3. 3 verschiedene Produkte oeffnen
4. 1 Produkt in den Warenkorb legen
5. Checkout-Button sichtbar pruefen

Wenn echte Bestellung getestet wird:

- nur mit abgesprochenem Test-Tisch
- Zeitstempel notieren
- Waiter-Seite bestaetigt Eingang

## Go / No-Go

`Go` nur wenn alle Punkte erfuellt sind:

1. Block A gruen
2. Block B gruen
3. Block C ohne kritische Fehler
4. Keine offenen kritischen Incidents fuer `menu`, `cart`, `orders`, `runtime`

`No-Go` bei:

- reproduzierbaren Bestellabbruechen
- fehlenden/kaputten Menuebildern in mehreren Runs
- kritischen Runtime-Fehlern
- deutlichen Slow-Profile-Zeitueberschreitungen
