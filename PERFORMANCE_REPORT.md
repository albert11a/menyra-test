Status: CURRENT
Branch: launchready2027
Stand: 2026-06-29

# Performance Report

## Ausgefuehrte Messungen

- `npm run build`
- `npm run check:social-bundle`
- `npm run analyze:public-profile-split`
- Lokaler Guest-Pack gegen `dist` Static Server

## Build-Groessen

| Asset | Raw | Gzip | Bewertung |
|---|---:|---:|---|
| `entry/social-public-entry.js` | 1.24 kB | 0.66 kB | gut |
| `entry/social-app.js` | 1,120.66 kB | 303.83 kB | P1, ueber Budget |
| `vendor-firebase` | 441.95 kB | 132.60 kB | hoch |
| `profile-menu-focus-render-controller` | 145.73 kB | 34.19 kB | bereits dynamic |
| `crm-domain-runtime-cluster` | 85.96 kB | 24.22 kB | bereits dynamic |
| `marketplace-view-render-utils` | 89.94 kB | 20.97 kB | relevant |

## Bundle Budget

Fehlgeschlagen:

- Raw Budget: 1,052,000 Bytes, Ist 1,120,655.
- Gzip Budget: 285,000 Bytes, Ist 303,831.

## Public/Profile Split Analyse

Status: ok, aber Analyse blockiert blindes Splitting:

- `profile-business-menu-runtime-cluster.js`: high risk, statisch im Social Entry.
- `public-profile-runtime-controller.js`: high risk, statisch im Social Entry.
- `public-profile-direct-entry-controller.js`: high risk, statisch im Social Entry.
- `public-bootstrap-runtime-controller.js`: high risk, statisch im Social Entry.
- Empfohlener naechster Schritt laut Script: manuelle Public Profile/Menu/QR/Cart Tests zuerst, dann Split-Planung.

## Lokaler Guest-Pack

Nach Harness-Fix:

- Cold Start im Runner: 88 ms fuer HTML-Navigation.
- Menu sichtbar: 2158 ms.
- Console Errors: 0.
- Console Warnings: 1.
- Menu Scan: 2/27 erwartete Produkte.
- Cart: fehlgeschlagen.

Bewertung: Die lokale HTML-Navigation ist schnell, aber das ist kein vollstaendiger Launch-Performance-Beweis, weil Vercel-Rewrites, Staging-Firebase, echte Datenmenge, Slow Network und echte Bildpipeline nicht abgedeckt wurden.

## Risiken

- P1: Hauptbundle ueber Budget.
- P1: Public/QR kann unnoetig viel Social-App-Code laden.
- P1: Firebase Vendor gross; Route-Level Firebase Reads wurden nicht live gemessen.
- P1: QR/Menu Produktdaten nur teilweise im lokalen Runner sichtbar.
- P2: Lokaler Static-Server simuliert `/feed`, `/:slug`, `/menu` Rewrites nicht.

## Empfehlungen

1. Keine blinden Bundle-Splits vor gruenem Staging-QR/Menu/Cart-Lauf.
2. Danach public profile/menu bootstrap auf klare Runtime Boundaries schneiden.
3. Firebase Reads pro Route instrumentieren.
4. Public/QR Slow-4G und Cache-Cold Messung mit Staging-Daten einfuehren.
5. Bildgroessen fuer Restaurant Cover, Logo, Menu Items und Feed auditieren.
