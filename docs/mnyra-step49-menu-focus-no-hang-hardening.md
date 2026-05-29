Status: umgesetzt
Branch: `refactorapp`

# Mnyra Schritt 49 - Menu/Fokus No-Hang-Haertung

## Ziel

Public Menu, Fokus/Angebote und Menu-Editor-Produkte duerfen nicht dauerhaft
bei `wird geladen...` haengen bleiben, wenn ein Firebase-Read nicht
zurueckkommt.

Dieser Schritt setzt den zweiten technischen Teil aus Schritt 47 um.

## Umsetzung

Die zentralen Menu-/Fokus-Reads in `session-data-runtime-controller.js` haben
jetzt Deadlines:

- Public Menu Items: begrenzte Ladezeit fuer `restaurants/{id}/public/menu`
- Menu-Editor-Produkte: begrenzte Ladezeit fuer `restaurants/{id}/menuItems`
- Migration-/Hybrid-Menu: begrenzte Ladezeit
- Public Menu Meta: begrenzte Ladezeit fuer `restaurants/{id}/public/meta`
- Public Fokus/Angebote: begrenzte Ladezeit fuer
  `restaurants/{id}/public/offers`
- Fokus-Meta: begrenzte Ladezeit fuer `restaurants/{id}/public/meta`

Wenn ein Read nicht rechtzeitig endet, wird der sichtbare Zustand kontrolliert
auf geloest gesetzt:

- Menu ohne gueltigen Fallback: `loading: false`, Fehlertext,
  `truthState: "unknown"`
- Menu mit gueltigem Fallback: vorhandene/stale Items bleiben sichtbar
- Fokus ohne gueltigen Fallback: `loading: false`, Fehlertext,
  `truthState: "knownEmpty"`
- Fokus-Meta-Timeout: Fokus bleibt grundsaetzlich aktiviert, statt den ganzen
  Fokus-Read zu blockieren

Damit blockiert ein haengender Fokus-Read das fertige Menu nicht endlos.

## Warum so

Die bisherigen Loader hatten Backoff und Fehlerbehandlung, aber ein einzelner
nie aufloesender Firebase-Request konnte den sichtbaren Screen trotzdem in
`loading` halten. Das war besonders kritisch bei:

- Public Menu im Business-Profil
- QR/Menu-first Pfaden
- Fokus/Angebote oberhalb der Produkte
- Menu-Editor-Produkten

Die neue Deadline beendet nicht die Firebase-Verbindung selbst, verhindert aber,
dass die UI endlos auf diese Promise wartet. Spaetere erneute Loads koennen
weiter normal laufen.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `tests/session-data-menu-focus-no-hang.test.mjs`
- `docs/mnyra-step49-menu-focus-no-hang-hardening.md`
- `docs/mnyra-current-phase.md`

## Bewusst nicht geaendert

- Keine sichtbare UI-/Design-Aenderung.
- Keine Lucide-Icon-Aenderung.
- Keine Route-Aenderung.
- Keine QR-Aenderung.
- Keine Cart-/Order-Aenderung.
- Keine Firebase Rules.
- Keine Cloud Functions.
- Keine Datenpfade oder Payload-Formate.
- Kein Storefront-/Renderer-Umbau.
- Kein Bundle-Build.
- Kein Dev Server.
- Kein Playwright-/Smoke-Test.

## Lucide-Icons

Fehlende Lucide-Icons in Modals, Drawer oder Menu-Bereichen wurden bewusst
nicht in diesen Ladefix gemischt.

Das ist ein separates Runtime-/Icon-Hydration-Thema und sollte als eigener
kleiner Schritt analysiert werden, damit keine UI-Aenderung nebenbei in den
Firebase-Ladefix rutscht.

## Checks

- `node --test tests/session-data-menu-focus-no-hang.test.mjs tests/public-menu-surface-state-utils.test.mjs tests/public-profile-runtime-controller.test.mjs tests/profile-post-normalization.test.mjs`
- `git diff --check`

## Manuelle Testliste

- `/:slug/menu` kalt oeffnen und pruefen, ob Produkte nicht endlos laden.
- QR-Link scannen und pruefen, ob das Menu weiter direkt offen ist.
- Business-Profil mit Fokus/Angeboten oeffnen und pruefen, ob Produkte nicht
  endlos auf Fokus warten.
- Business-Profil ohne Fokus/Angebote oeffnen und pruefen, ob Produkte trotzdem
  erscheinen oder ein leerer Zustand kommt.
- Menu Editor oeffnen und pruefen, ob Produkte nicht dauerhaft bei Laden
  haengen bleiben.
- Menu Editor bei schlechter Verbindung pruefen: statt endlosem Laden muss ein
  Fehler-/Fallback-Zustand sichtbar werden.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Die Deadlines verhindern endlose UI-Ladezustaende, ersetzen aber
keine echte serverseitige Snapshot-/Pagination-Architektur. Wenn Firebase zu
langsam oder nicht erreichbar ist, sieht der Nutzer jetzt einen geloesten
Fehler-/Leerzustand statt endlosem Laden.
