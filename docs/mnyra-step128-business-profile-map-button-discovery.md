Status: CURRENT
Last updated: 2026-06-27

# Mnyra Schritt 128: Business-Profil-Karte-Button zur Entdecker-Karte

## Schritt

Der Karte-Button oben in der Business-Profil-Card wurde an denselben internen
Kartenpfad angeschlossen wie der Karte-Button auf den Restaurant-/Cafe-Cards im
Restaurants-Tab.

## Geaendert

- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
  ermittelt fuer Business-Profile jetzt eine interne Map-Ziel-ID aus
  `canonicalRestaurantId`, `restaurantId` oder kompatiblen Fallback-IDs.
- Der bestehende runde Karte-Quick-Link rendert fuer Business-Profile mit
  interner Ziel-ID als Button mit `data-marketplace-open-map`.
- Das Menyra-Social-Bundle wurde neu gebaut, damit der ausgelieferte
  Profil-Renderer-Chunk die Aenderung enthaelt.
- Der App-Build-Token wurde auf `2026-06-27-profile-map-button-01`
  aktualisiert, damit der Browser den neuen Entry mit dem neuen Chunk-Hash
  nachlaedt.

## Bewusst Nicht Geaendert

- Keine sichtbaren UI-, Layout-, Farb-, Typografie- oder Spacing-Aenderung.
- Keine Aenderung an Restaurant-Cards, Travel-Cards, Map-Rendering, QR, Cart,
  Orders, Firebase Rules oder Functions.
- Kein neuer Karten-Handler; der bestehende `data-marketplace-open-map`-Pfad
  wird wiederverwendet.

## Manuell Testen

1. Business-Profil aus dem Restaurants-Tab oeffnen.
2. Oben in der Profil-Card den runden Karte-Button klicken.
3. Erwartung: Die interne Entdecker-Karte oeffnet sich wie beim Karte-Button
   der Restaurant-Card und das passende Business ist ausgewaehlt.
4. Bei hartem Reload oder `?debug-build=1` muss der Build-Stand
   `2026-06-27-profile-map-button-01` sichtbar/aktiv sein.
5. Kurz gegenpruefen: TikTok-/Instagram-Buttons bleiben externe Links, Profil,
   Info, Menu, QR, Cart und Order-Flows wirken unveraendert.

## Bewertung

Bestanden mit kleinem Rest-Risiko. Der Schritt ist eng auf den
Business-Profil-Quick-Link begrenzt und nutzt den bestehenden Karten-Handler.
