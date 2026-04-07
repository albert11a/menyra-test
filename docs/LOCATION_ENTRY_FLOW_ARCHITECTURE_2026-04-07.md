## Zielbild

- `home`: echte Startseite
- `feed`: normaler Feed
- `location`: dauerhafter Standort-Screen
- `feed-gate`: Fallback-Screen innerhalb des Feed-Tabs, wenn kein Standort gesetzt ist

## Aktuelle Regeln

1. Root ohne Standort startet auf `home`.
2. Root mit Standort startet direkt auf `feed`.
3. `home` ohne Standort rendert den bestehenden Hero-Screen (`#feedLocationGate`) im Modus `home-intro`.
4. `home` mit Standort rendert eine normale weisse Startseite ohne Hero.
5. `feed` ohne Standort rendert denselben Hero-Screen im Modus `feed-gate`.
6. `location` rendert denselben Hero-Screen immer im Modus `location`.

## Warum das stabiler ist

- Die PWA-/Safe-Area-/Overscroll-Logik bleibt an derselben DOM-Struktur (`#feedLocationGate`).
- Die drei Faelle werden nur ueber Modi getrennt:
  - `home-intro`
  - `feed-gate`
  - `location`
- Dadurch bleibt die empfindliche iOS-Standalone-CSS unangetastet.

## Wichtige Dateien

- `apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
  - Screen-Modi
  - Redirect nach Standortwahl
  - Home-Intro vs. Home-Resolved
- `apps/menyra-social/core/ui/main-shell-render-utils.js`
  - neues `home` Rendering
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
  - PWA-Gate-Chrome auch fuer `home-intro`
- `apps/menyra-social/social-app.js`
  - einmalige Root-Entscheidung: `home` nur ohne Standort und ohne explizite Route

## Nicht wieder vermischen

- `home-resolved` darf kein `#feedLocationGate` enthalten.
- `location` darf nach Standortwahl nicht automatisch auf `feed` springen.
- `feed-gate` und `home-intro` duerfen weiter auf `feed` weiterleiten.
- Die Standalone-CSS in `index.html` sollte weiter nur auf `feed-location-gate-active` und `#feedLocationGate` reagieren.
