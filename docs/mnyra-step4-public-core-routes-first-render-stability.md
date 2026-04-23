Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 4: Public-Core-Routen First-Render-Stabilitaet

## Schrittziel

Kleiner website-first Kernschritt fuer die oeffentlichen Routen:

- `/:slug`
- `/:slug/menu`
- `/:slug/posts`

Ziel war, den ersten sichtbaren Surface-Zustand stabiler aus der Route-Wahrheit zu halten und false short-circuits mit stale Zwischenzustand zu reduzieren, ohne UI-/Design-Aenderung.

## Was geaendert wurde

Es wurde nur die Short-Circuit-Logik fuer bestehende offene Business-Profile gehaertet:

1. Ein pending Route-Open wird jetzt nur dann als "bereits offen" akzeptiert, wenn nicht nur `topTab`, sondern auch der effektiv sichtbare Content-Surface passt.
2. Fuer Profile-Surface wird dadurch stale `media` nicht mehr als gueltiger Treffer fuer `/:slug` oder `/:slug/posts` akzeptiert.
3. Fuer Menu-Surface bleibt die Menu-Logik unveraendert; dort wird weiterhin auf `menu` abgeglichen.

## Geaenderte Dateien

- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/router/deeplink-flow-utils.js`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Kein Root-Umbau von `/`.
- `/login` nicht angefasst.
- Keine Routing-Grossumbauten.
- Keine Firebase-/Rules-/Functions-Aenderungen.
- Keine Smoke-/Playwright-Tests.
- Keine QR-Route- oder QR-Invarianten-Aenderung.

## Manuelle Testliste

1. Direkt `/:slug` oeffnen (Hard-Reload): Profil-Surface bleibt stabil auf Profil/Posts.
2. Direkt `/:slug/posts` oeffnen (Hard-Reload): startet direkt auf Posts-Surface, kein Sprung auf anderes Profil-Subsurface.
3. Direkt `/:slug/menu` oeffnen (Hard-Reload): startet direkt auf Menu-Surface.
4. Von `/:slug/menu` auf Beitraege wechseln und erneut hart neu laden: kein falscher stale Zwischenzustand.
5. Einen bestehenden echten QR-Link aus dem Menu-Editor scannen: Menu oeffnet weiterhin sofort wie bisher.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko bleibt bei alten/stark gemischten Cache-Zustaenden, die ausserhalb dieses kleinen Schritts liegen. Der Schritt selbst haelt den Blast Radius klein und fokussiert nur die Route-First-Surface-Konsistenz.
