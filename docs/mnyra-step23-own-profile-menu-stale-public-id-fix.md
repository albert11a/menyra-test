Status: CURRENT
Last updated: 2026-04-26

# Mnyra Schritt 23: Eigenes Profil-Menu nach Public-Profil-Wechsel

## Ziel

Den Folgefall beheben, dass das eigene Business-Profil-Menu nach dem direkten
Wechsel von einem oeffentlichen Business-Profil wieder bei `Menu wird geladen...`
haengen kann, bis ein Refresh ausgefuehrt wird.

## Befund

Nach einem oeffentlichen Profil kann im Runtime-State noch ein alter Public-
Route-/WebDirect-Kontext liegen. Beim anschliessenden Wechsel ins eigene Profil
durfte der eigene Menu-Load zwar starten, die ID-Sammlung fuer den Public-
Menu-Load enthielt aber weiterhin auch IDs aus diesem alten Public-Kontext.

Wenn fuer das alte oeffentliche Profil bereits `source: "public"`-Menu-Items im
State lagen, konnte der Loader daraus faelschlich ableiten, dass ein passender
Public-Menu-Stand vorhanden ist. Das eigene Restaurant wurde dann nicht
nachgeladen. Ein Browser-Refresh loescht diesen stale Runtime-Kontext, deshalb
erscheint das Menu danach.

## Umsetzung

Datei:
`apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`

- Fuer das eigene Business-Profil-Menu gibt es jetzt eine eigene,
  eng begrenzte ID-Sammlung.
- Dieser Pfad verwendet nur IDs aus dem eigenen Profil und dem direkten
  Fallback, nicht aus altem `profileView`, RoutePayload oder WebDirect-State.
- Public-Web-/QR-Pfade behalten die bestehende breite ID-Sammlung.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step23-own-profile-menu-stale-public-id-fix.md`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderungen.
- Keine Public-Routing-Aenderungen.
- Keine Firebase Rules, Functions oder Datenstruktur-Aenderungen.
- Keine QR-/Cart-/Table-Logik.

## Check

- `node --check apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`

Keine Smoke-Tests oder Playwright-Laeufe durch Codex, gemaess aktueller
Mnyra-Regel. Der Nutzer testet manuell.

## Manuelle Testliste

1. Ein oeffentliches Business-Profil oeffnen und dort das Menu anzeigen.
2. Direkt ueber die App-Navigation ins eigene Profil wechseln.
3. Im eigenen Profil auf `Menu` wechseln.
4. Erwartung: Das eigene Menu erscheint ohne Refresh oder zeigt sauber
   `Keine Produkte`.
5. Danach hart refreshen und denselben eigenen Menu-Stand vergleichen.

## Bewertung

`bestanden mit Rest-Risiko`

Rest-Risiko:
- Der Wechsel wurde nicht per Codex-Browserlauf getestet.
- Der Runtime-State hat weiterhin historische Public-/Profile-Schichten; dieser
  Schritt verhindert nur, dass stale Public-IDs den eigenen Menu-Load
  kurzschliessen.
