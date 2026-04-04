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
