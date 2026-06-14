Status: CURRENT
Last updated: 2026-06-14

# Schritt 56 - Marketplace Browser-Back Route Fix

## Ziel

Wenn ein Nutzer aus `Restaurants`, `Travel` oder `Shopping` eine Business-Karte
oeffnet und danach den Browser-Zurueck-Button nutzt, soll er wieder in dieselbe
Marketplace-Kategorie zurueckkommen und nicht auf `Feed`.

## Ursache

Der Profil-Open-Flow legt vor dem Oeffnen eines Business-Profils bereits einen
History-Eintrag fuer den aktuellen App-Tab an. Die drei neuen Marketplace-Tabs
waren aber noch nicht im zentralen App-Route-Vertrag registriert. Dadurch wurde
`restaurants`, `travel` oder `shopping` beim History-Eintrag auf den Default
`/feed` normalisiert.

## Geaendert

- `apps/menyra-social/core/router/public-business-route-utils.js`
  - `restaurants`, `travel` und `shopping` sind jetzt bekannte System-Route-
    Segmente.
  - Die drei Tabs haben kanonische App-Pfade:
    `/restaurants`, `/travel`, `/shopping`.
  - Die drei Segmente sind als reservierte App-Routen geschuetzt, damit sie
    nicht als oeffentliche Business-Slugs interpretiert werden.
- Social-Bundle wurde neu gebaut, damit die ausgelieferten Bundle-Artefakte den
  aktualisierten Router-Vertrag enthalten.

## Bewusst Nicht Geaendert

- Keine UI-/Design-Aenderung.
- Keine Aenderung am Profil-Open-Flow, an Marketplace-Karten oder am Feed.
- Keine neuen Firebase-Reads, Listener, Collections, Rules oder Functions.
- Keine Aenderung an QR, Cart, Order, Menu oder Public-Business-Routen.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Fix ist klein und sitzt an der richtigen Vertragsstelle: Der bestehende
History-/Profil-Flow bleibt unveraendert, bekommt aber fuer die neuen Tabs nun
kanonische Pfade statt des Feed-Fallbacks. Rest-Risiko liegt nur in der
manuellen Browser-History-Pruefung mit echten Daten.

## Verifikation

- `node --check apps/menyra-social/core/router/public-business-route-utils.js`
- Direkter Node-Import von `buildCanonicalAppTabPathCore`,
  `parseSiteRoutePathCore` und `isReservedPublicRouteSegmentCore` fuer
  `restaurants`, `travel` und `shopping`.
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

## Manuelle Testliste

- Drawer oeffnen und `Restaurants` aufrufen.
- Eine Restaurant-/Cafe-/Fastfood-Karte oeffnen und danach Browser-Zurueck
  klicken: Rueckkehr muss zu `Restaurants` gehen.
- `Travel` aufrufen, Hotel-/Motel-Karte oeffnen und Browser-Zurueck klicken:
  Rueckkehr muss zu `Travel` gehen.
- `Shopping` aufrufen, E-Commerce-/Shop-Karte oeffnen und Browser-Zurueck
  klicken: Rueckkehr muss zu `Shopping` gehen.
- Kurz gegenpruefen, dass normale Business-Profil-Links und bestehende QR-Links
  weiter wie bisher oeffnen.
