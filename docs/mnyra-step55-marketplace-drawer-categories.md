Status: CURRENT
Last updated: 2026-06-14

# Schritt 55 - Marketplace-Kategorien im Drawer

## Ziel

Im Menu Drawer sollen drei neue interne Bereiche sichtbar sein:
`Restaurants`, `Travel` und `Shopping`.

Die Bereiche sollen aus der vorhandenen Business-/Lead-Wahrheit gespeist werden,
ohne `social-app.js` mit grossen Render-Templates weiter aufzublasen und ohne neue
Firebase-Listener oder neue Public-/QR-Routen einzufuehren.

## Geaendert

- Neuer Lazy-Bereich `apps/menyra-social/core/marketplace/`
  - `marketplace-runtime-boundary.js` laedt den eigentlichen Renderer erst bei
    Nutzung von `Restaurants`, `Travel` oder `Shopping`.
  - `marketplace-view-render-utils.js` rendert Swipe-Karten fuer die beste Auswahl
    und darunter feed-aehnliche Business-Karten aus `state.restaurants` und
    `state.bootstrapRestaurantPreview`.
- Drawer / Shell / Route-Registry
  - `Restaurants`, `Travel` und `Shopping` wurden als interne Tabs fuer Gast- und
    eingeloggte Sessions ergaenzt.
  - Die drei Tabs nutzen die bestehende Main-Shell- und Route-Runtime-Registry.
  - Marketplace-Karten oeffnen bestehende Business-Profile ueber den vorhandenen
    `openProfileViewFromBusiness`-Flow.
- Lead-/Business-Typisierung
  - `restaurant`, `cafe`/`coffee`/`coffe` und `fastfood` landen in `Restaurants`.
  - `hotel`/`hotels` und `motel`/`motels` landen in `Travel`.
  - `ecommerce` und bestehende Shop-Aliase landen in `Shopping`.
  - Hotel und Motel wurden als Lead-Typen im bestehenden Lead-Type-Vertrag ergaenzt.
- Build-Artefakte
  - Social-Bundle wurde neu gebaut.
  - Der Marketplace-Renderer erscheint als eigener Lazy-Chunk
    `marketplace-view-render-utils-*.js`.

## Bewusst Nicht Geaendert

- Keine neue Firebase-Collection, kein neuer Listener und kein neuer Public-Read-Pfad.
- Keine Aenderung an QR, Cart, Order, Menu, Public-Profile-Routing, Firebase Rules
  oder Functions.
- Kein Storefront-/Renderer-Umbau und kein Public-/App-Grenzen-Umbau.
- Kein breites Redesign: Die neuen Views verwenden die bestehende Card-/Shell-
  Sprache und wurden nur fuer den freigegebenen Drawer-Feature-Scope ergaenzt.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Die Aenderung bleibt fachlich sichtbar, aber technisch klein: `social-app.js`
bekommt nur eine kleine Boundary-Verkabelung; die neue Darstellung liegt in einem
Lazy-Chunk. Das bestehende Restaurant-Caching wird weiterverwendet. Rest-Risiko
liegt in der manuellen Sichtpruefung echter Daten und darin, ob spaeter weitere
Lead-Typen fachlich den drei Kategorien zugeordnet werden sollen.

## Verifikation

- `node --check apps/menyra-social/social-app.js`
- `node --check apps/menyra-social/core/marketplace/marketplace-runtime-boundary.js`
- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `node --check apps/menyra-social/core/app-shell/route-runtime-registry.js`
- Direkter Node-Import von `filterMarketplaceBusinessesCore` mit Mapping-Check fuer
  `restaurants`, `travel` und `shopping`.
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

## Manuelle Testliste

- Drawer oeffnen und pruefen, dass `Restaurants`, `Travel` und `Shopping` sichtbar sind.
- `Restaurants` oeffnen und pruefen, dass Restaurant/Cafe/Fastfood-Businesses erscheinen.
- `Travel` oeffnen und pruefen, dass Hotel/Motel-Businesses erscheinen.
- `Shopping` oeffnen und pruefen, dass E-Commerce-Businesses erscheinen.
- Eine Karte antippen und pruefen, dass das bestehende Business-Profil geoeffnet wird.
- Bestehende QR-Links, `/:slug/menu`, Warenkorb und Bestellungen kurz gegenpruefen.
