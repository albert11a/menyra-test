Status: CURRENT
Last updated: 2026-05-07

# Schritt 32: Public-Fokus frueher parallel zum Menu anwaermen

## Ziel

Public-Fokus soll im sichtbaren Public-Menu-Pfad frueher verfuegbar sein, ohne
das Menu zu blockieren und ohne falsche Focus-Daten in ein anderes Profil zu
committen.

## Befund

Der Firebase-Lesepfad fuer Fokus ist korrekt:

- `restaurants/{restaurantId}/public/offers` fuer Focus-Items.
- `restaurants/{restaurantId}/public/meta` fuer `offersEnabled`.

Die sichtbare Verzoegerung kam nicht vom falschen Firebase-Pfad, sondern von der
Orchestrierung: Im sichtbaren Public-Menu-Load wurde Fokus erst nach
abgeschlossenem Menu-Read als sichtbarer Experience-Load gestartet.

## Geaendert

- Im sichtbaren Public-Menu-Load startet Fokus jetzt als deduplizierter
  `prefetchOnly`-Read parallel zum Menu-Read.
- Nach bestaetigten Public-Menu-Items wird der bestehende sichtbare
  `loadFocusForRestaurant(...)`-Pfad weiterverwendet.
- Der sichtbare Focus-Commit bleibt damit unveraendert an die passende
  Public-Menu-Surface gebunden.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step32-public-focus-prefetch-alignment.md`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Keine Firebase Rules, Functions oder Datenpfade.
- Kein Routing-Umbau.
- Keine QR-, Warenkorb-, Tisch- oder Produktlogik-Aenderung.
- Kein Smoke-Test, kein Playwright.

## Validierung

- `node --check apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `git diff --check`

## Manuell testen

- `/:slug/menu` kalt oeffnen: Menu erscheint, Fokus erscheint ohne lange zweite
  Nachlaufphase, wenn Focus-Items vorhanden sind.
- `/:slug/menu` refreshen: keine sichtbare Focus-Fehldaten aus einem anderen
  Restaurant.
- QR-Link oeffnen: Menu bleibt sofort offen, Fokus darf nachziehen, Warenkorb
  und Tischkontext bleiben korrekt.
- Entdecker-Karte zu anderem Business oeffnen: kein alter Fokus aus dem
  vorherigen Profil.

## Bewertung

Bestanden mit kleinem Rest-Risiko.

Rest-Risiko bleibt, weil das echte Timing nur unter Smartphone-/Netzwerk-
Bedingungen abschliessend bewertet werden kann.
