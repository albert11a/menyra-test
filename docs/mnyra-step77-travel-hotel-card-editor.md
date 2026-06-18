Status: CURRENT
Last updated: 2026-06-18

# Schritt 77 - Travel Hotel Card And Hotel Editor

## Ziel

Die normalen Hotel-Cards im Travel-Hotels-Tab sollen die vom Nutzer
gelieferte Premium-Hotel-Card-Geometrie uebernehmen. Der Button `Mehr` soll
direkt ins Profil fuehren. Hotel-/Motel-Business-Accounts sollen im Editor
einen eigenen Hotel-Card-Editor bekommen, um Titelbilder, Zentrum-/Strand-
Entfernung, Bestpreis und drei frei benennbare Feature-Texte zu pflegen.

## Geaendert

- Der Travel-Hotels-Renderer nutzt fuer normale Hotel-/Motel-Ergebnisse eine
  eigene Premium-Hotel-Card mit Titelbild-Slider, schwebendem Logo,
  Bewertungszeile, Adresse, Zentrum-/Stranddistanz, Feature-Chips, Bestpreis
  und `Mehr`-Button. Die Card nutzt die gleiche volle Listenbreite wie die
  anderen normalen Marketplace-Cards.
- `Mehr` oeffnet direkt das jeweilige Business-Profil ueber den bestehenden
  Marketplace-Open-Flow.
- Der Travel-Event-Binder steuert den lokalen Titelbild-Slider, die
  Bildpunkte, Touch-Swipes, Like-Zustand und Teilen-Kopieren ohne neue
  Routing- oder Backend-Regeln.
- Der Profil-Menu-/Editor-Tab zeigt fuer Hotel-/Motel-Business-Accounts einen
  eigenen Hotel-Card-Editor statt des Restaurant-/Cafe-Menueditors.
- Hotel-/Motel-Owner koennen bis zu drei Titelbilder per Upload oder URL,
  Entfernung zum Zentrum, Entfernung zu Strand/See, Bestpreis p.P. und drei
  Feature-Texte speichern.
- Die Hotel-Card-Daten werden auf dem bestehenden Restaurant-/Business-Dokument
  gespiegelt, damit Travel-Card und Profilansicht dieselbe Datenbasis nutzen
  koennen.
- Der gebaute Mnyra-Social-Bundle-Output wurde nachgezogen.

## Bewusst Nicht Geaendert

- Keine Aenderung an Restaurant-/Cafe-Card-Logik.
- Keine Aenderung an QR, Cart, Order, Checkout oder Tischkontext.
- Keine Aenderung an Routing-Vertrag, Firebase Rules oder Functions.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.
- Keine Hotel-Zimmer-/Buchungslogik umgesetzt; dieser Schritt pflegt nur die
  Travel-Card-Daten und oeffnet das Profil.

## Verifikation

- `node --check apps\menyra-social\core\marketplace\marketplace-view-render-utils.js`
- `node --check apps\menyra-social\core\marketplace\travel-view-event-bindings.js`
- `node --check apps\menyra-social\core\profile\profile-menu-focus-render-controller.js`
- `node --check apps\menyra-social\core\app-events\app-events-menu-focus-bind-utils.js`
- `node --check` fuer die geaenderten App-Event-/App-Shell-Glue-Dateien
- `npm run build`

## Manuelle Testliste

- Mit einem Hotel- oder Motel-Business-Account anmelden.
- Eigenes Profil oeffnen und im Editor pruefen, dass der Hotel-Card-Editor
  sichtbar ist.
- Titelbild 1 bis 3 per Upload oder URL setzen, Zentrum-/Stranddistanz,
  Bestpreis und drei Feature-Texte speichern.
- Travel oeffnen, Reiseziel suchen und im Hotels-Tab pruefen, dass die neue
  Hotel-Card mit Bildslider, Logo, Distanzen, Feature-Chips und Preis rendert.
- In der Hotel-Card `Mehr` anklicken und pruefen, dass direkt das Profil
  geoeffnet wird.
- Mit einem Restaurant-/Cafe-Business-Account pruefen, dass der normale
  Menueditor unveraendert bleibt.
- QR, Cart, Order und Checkout nur manuell gegenpruefen; Codex hat diese
  Flows nicht geaendert und nicht automatisiert getestet.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Die echte Sichtpruefung haengt von vorhandenen Hotel-/Motel-Daten,
Upload-Rechten und manueller Travel-Suche ab. Der technische Build ist sauber,
aber die finale UX muss im echten Account manuell kontrolliert werden.
