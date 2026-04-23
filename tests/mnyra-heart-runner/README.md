# mnyra-heart-runner (Playwright)

Dieser Runner testet Menyra-UI-End2End fuer Heart:
- Rollen-Flows (CEO, Business, User, Guest, Staff)
- sichtbare UI/Navigation/Layout
- Laufzeit-Fehler (Page Errors, Console Errors, Request/HTTP Failures)
- Performance-Basiswerte inkl. Cold Start und FCP

## Schnellstart (lokal)

```powershell
cd tests/mnyra-heart-runner
npm ci
npx playwright install chromium
```

Dann einen Pack starten:

```powershell
npm run guard-pack
npm run release-pack
npm run health-pack
```

Weitere Packs:

```powershell
npm run smoke
npm run business-pack
npm run user-pack
npm run guest-pack
npm run full-platform-pack
```

## Casarita Live Launch-Check (Production)

Gast-/QR-Livepfad in Produktion, ohne sichtbare UI-Aenderungen fuer Gaeste:

Ein-Befehl-Lauf (Guest-Pack + Cold-Audit):

```powershell
cd tests/mnyra-heart-runner
npm run casarita-live
```

Oder einzeln:

```powershell
cd tests/mnyra-heart-runner
$env:MNYRA_HEART_PACK_CONFIG_FILE = "config/casarita-prod-config.json"
$env:MNYRA_HEART_FAIL_ON_CONSOLE_ERRORS = "true"
$env:MNYRA_HEART_FAIL_ON_REQUEST_FAILURES = "true"
$env:MNYRA_HEART_FAIL_ON_HTTP_ERRORS = "true"
node ./src/run-pack.mjs guest-pack
```

Was dabei zusaetzlich geprueft wird:
- QR-Menue sichtbar + Timing
- Menue-Deep-Scan (Scroll bis unten, Produktanzahl, Overflow, Bildintegritaet)
- Produktdetail-Samples (mehrere Produkte oeffnen/schliessen + Timing)
- Warenkorb-Erreichbarkeit
- Schutz vor sichtbaren Business-Controls auf Gastseite

Ergaenzender Cold-Load-Audit (mehrfach, inkl. `wifi` und `slow4g`):

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

Wichtige Schalter fuer die Bewertung:
- `COLD_AUDIT_MAX_PENDING_IMAGES` (Standard `10`)
- `COLD_AUDIT_MIN_PASS_RATE_PCT` (Standard `95`)
- `COLD_AUDIT_FAIL_ON_REQUEST_FAILURES` (Standard `false`)

Output:
- `artifacts/<pack>-<timestamp>/...` fuer Pack-Laeufe
- `artifacts/cold-load-audit-<timestamp>/cold-load-audit-report.json` fuer Cold-Audit

## Live Order Load Audit (echte Bestellungen)

Simuliert viele gleichzeitige Gast-Bestellungen inkl. Bild- und Timing-Metriken:

```powershell
cd tests/mnyra-heart-runner
$env:MNYRA_HEART_PACK_CONFIG_FILE = "config/casarita-prod-config.json"
$env:LOAD_ORDER_TOTAL_USERS = "200"
$env:LOAD_ORDER_CONCURRENCY = "25"
$env:LOAD_ORDER_TABLE_START = "1200"
$env:LOAD_ORDER_NETWORK_PROFILE = "wifi"
$env:LOAD_ORDER_MIN_PASS_RATE_PCT = "99"
npm run live-order-load-audit
```

Wichtige Schalter:
- `LOAD_ORDER_TOTAL_USERS`
- `LOAD_ORDER_CONCURRENCY`
- `LOAD_ORDER_TABLE_START`
- `LOAD_ORDER_NETWORK_PROFILE` (`wifi` oder `slow4g`)
- `LOAD_ORDER_TIMEOUT_MS`
- `LOAD_ORDER_MIN_PASS_RATE_PCT`

Sicherheitsregel:
- Alle Packs laufen standardmaessig read-only.
- Live-Schreibaktionen sind nur fuer den expliziten `mutation-pack` moeglich (mit `MNYRA_ALLOW_LIVE_MUTATIONS=true` und `MNYRA_SYNTHETIC_ISOLATION_KEY`).

## Konfiguration

Optional per Datei:

```powershell
$env:MNYRA_HEART_PACK_CONFIG_FILE = "config/heart-pack-config.example.json"
```

Oder JSON direkt:

```powershell
$env:MNYRA_HEART_PACK_CONFIG_JSON = "{ ... }"
```

Credentials laufen ueblich ueber CI-Secrets (`MNYRA_CEO_EMAIL`, `MNYRA_CEO_PASSWORD`, usw.).

## Runtime + Performance Schalter

Standardmaessig aktiv:

- `MNYRA_HEART_RUNTIME_DIAGNOSTICS=true`
- `MNYRA_HEART_COLD_START_WARN_MS=5000`
- `MNYRA_HEART_COLD_START_FAIL_MS=12000`
- `MNYRA_HEART_FCP_WARN_MS=3000`
- `MNYRA_HEART_FCP_FAIL_MS=7000`

Optional strengere Bewertung:

- `MNYRA_HEART_FAIL_ON_CONSOLE_ERRORS=true`
- `MNYRA_HEART_FAIL_ON_REQUEST_FAILURES=true`
- `MNYRA_HEART_FAIL_ON_HTTP_ERRORS=true`

## Artefakte

Alle Ergebnisse landen in `tests/mnyra-heart-runner/artifacts/<pack>-<timestamp>/`:
- `*-report.json` (Heart Report)
- `*-runtime-diagnostics.json` (Runtime + Cold-Start/FCP Details)
- `*-trace.zip` (Playwright Trace)
- `*-final-state.png` / `*-failure-state.png`
