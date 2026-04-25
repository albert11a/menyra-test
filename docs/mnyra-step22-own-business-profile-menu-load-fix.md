Status: CURRENT
Last updated: 2026-04-26

# Mnyra Schritt 22: Eigenes Business-Profil-Menue Loader-Fix

## Ziel

Den Fall beheben, dass im eigenen Business-Profil beim Wechsel auf den
Menu-Tab dauerhaft `Menu wird geladen...` stehen bleiben kann.

Der Schritt bleibt bewusst eng:

- kein UI-/Design-Umbau,
- keine Public-Route-Aenderung,
- keine Firebase Rules/Functions,
- kein Eingriff in Menu-Editor-Speichern oder QR-Links.

Auf Nutzerwunsch wurde dieser Schritt auf Branch `bauloginstart` umgesetzt.

## Befund

Der Profil-Menu-Renderer (`renderProfileMenuView`) akzeptiert fuer die sichtbare
Profil-Menu-Ansicht nur echte Public-Menu-Wahrheit:

- gleiche `restaurantId`,
- `state.menu.source === "public"`.

Der bestehende Ensure-Pfad hatte dabei zwei Blocker:

1. Das eigene Business-Profil-Menu war kein erlaubter Public-Menu-Load-Surface.
   Der Loader startete dort nicht sicher, weil bisher nur Web-Direct-/QR-
   Public-Surfaces als sichtbare Menu-Surfaces galten.
2. Bereits geladene Authoring-Daten mit `source: "collection"` konnten den
   Public-Menu-Load ueberspringen, obwohl der Renderer diese Daten nicht als
   Public-Menu-Wahrheit verwendet.

Dadurch konnte der sichtbare Zustand bei `Menu wird geladen...` bleiben.

## Umsetzung

Datei:
`apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`

- Ein eigener Surface-Check erkennt jetzt das eigene Business-Profil, wenn
  `activeTab=profile` und der Profil-Menu-Tab aktiv ist.
- Der Public-Menu-Ensure darf fuer diesen eigenen Profil-Menu-Surface laufen.
- Der Skip-Check fuer vorhandene Menu-Items zaehlt nur noch `source: "public"`.
  `source: "collection"` blockiert den Public-Menu-Nachladepfad nicht mehr.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step22-own-business-profile-menu-load-fix.md`

## Bewusst nicht geaendert

- Keine sichtbaren UI-/Design-Aenderungen.
- Keine Public-Routing-Aenderungen.
- Keine Firebase Rules, Functions oder Datenstruktur-Aenderungen.
- Keine Aenderung am Menu-Editor-Authoring-Pfad `restaurants/{rid}/menuItems`.
- Keine QR-/Cart-/Table-Logik.

## Check

- `node --check apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`

Keine Smoke-Tests oder Playwright-Laeufe durch Codex, gemaess aktueller
Mnyra-Regel. Der Nutzer testet manuell.

## Manuelle Testliste

1. Mit Business-Account einloggen.
2. Eigenes Business-Profil oeffnen.
3. Im eigenen Profil auf `Menu` wechseln.
4. Erwartung: Es bleibt nicht dauerhaft bei `Menu wird geladen...`; es erscheinen
   Produkte oder sauber `Keine Produkte`.
5. Danach den Menu-Editor oeffnen und pruefen, dass eigene Authoring-Produkte
   weiterhin geladen werden.

## Bewertung

`bestanden mit Rest-Risiko`

Rest-Risiko:
- Manuelle echte Firebase-Session wurde gemaess Regel nicht durch Codex getestet.
- Wenn im Public-Menu-Dokument noch keine Produkte publiziert sind, ist
  `Keine Produkte` der erwartete sichtbare Zustand; der Editor kann trotzdem
  Authoring-Produkte in `menuItems` haben.
