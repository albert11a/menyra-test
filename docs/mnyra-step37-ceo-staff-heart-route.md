Status: CURRENT
Last updated: 2026-05-25

# Schritt 37: CEO Staff sicher nach Heart routen

## Ziel

CEO-/interne MNYRA-Staff-Verwaltung soll ueber Heart laufen, ohne Restaurant-
Staff, Waiter, Kitchen oder bestehendes `/staff`-Verhalten zu verschieben.

## Befund

- `/leads` und `/customers` sind bereits Heart-Routen.
- Heart erkennt `crmStaff` bereits fuer sichere Staff-Kontexte wie
  `/admin/staff`.
- Bare `/staff` ist in Heart bewusst kein sicherer Staff-Kontext und bleibt
  Social.
- `staff.mnyra.com`, `staff.menyra.com`, `/staff`, `/staff/:path*`,
  `/waiter`, `/kitchen`, `/business-accounts` und `/businessaccounts` zeigen
  weiter auf die bestehenden Social-/Waiter-Flows.

## Geaendert

- `/admin/staff` wurde als explizite Heart-Route in `vercel.json`
  eingetragen.
- Der Root-Service-Worker behandelt `/admin/staff` wie die bestehenden
  Heart-Owned-Navigationsrouten `/leads` und `/customers`.
- Der CEO-Drawer-Eintrag `Staff` in Social zeigt jetzt auf `/admin/staff`.

## Geaenderte Dateien

- `vercel.json`
- `sw.js`
- `apps/menyra-social/core/app-shell/shell-dom-runtime-controller.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step37-ceo-staff-heart-route.md`

## Bewusst nicht geaendert

- Bare `/staff` bleibt unveraendert Social.
- `staff.mnyra.com` und `staff.menyra.com` bleiben unveraendert auf `/staff`.
- Waiter-, Kitchen-, Restaurant-Staff- und Business-Staff-Flows bleiben
  unveraendert.
- Keine Staff-Save-/Delete-Logik.
- Keine `businessAccounts`.
- Keine Firebase-Pfade, Queries oder Payloads.
- Kein Public Menu, QR, Cart oder Orders.
- Kein Feed, Search, Map oder Chat.
- Kein Build, kein Lint, keine Full Tests, kein Dev Server, kein Playwright.

## Validierung

- `node --check sw.js`
- `node --check apps/menyra-social/core/app-shell/shell-dom-runtime-controller.js`
- `node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf8')); console.log('vercel.json valid')"`
- `git diff --check`

## Manuell testen

- `/admin/staff` oeffnen und pruefen, dass Heart Staff erscheint.
- `/staff` oeffnen und pruefen, dass das bisherige Verhalten bleibt.
- Heart Staff create/edit/delete testen.
- `/leads` oeffnen.
- `/customers` oeffnen.
- `/feed`, `/search`, `/map` oeffnen.
- `/casarita/menu` oeffnen.
- Konsole auf rote Fehler pruefen.

## Bewertung

Bestanden mit kleinem Rest-Risiko.

Rest-Risiko: Ohne manuellen Browser-Test bleibt offen, ob ein alter aktiver
Service Worker im Browser die neue Route erst nach seinem normalen Update-
Zyklus uebernimmt.

## Branch-Hinweis

Auf ausdruecklichen Nutzerwunsch wurde dieser Schritt auf `refactorapp`
umgesetzt.
