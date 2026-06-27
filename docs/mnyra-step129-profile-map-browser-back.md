Status: CURRENT
Last updated: 2026-06-27

# Mnyra Schritt 129: Profil-Karte-Button Browser-Zurueck

## Schritt

Der interne Karte-Button in Business-Profilen wurde so gehaertet, dass Browser-
Zurueck von der Entdecker-Karte wieder zur vorherigen Profil-URL fuehrt.

## Geaendert

- `apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
  markiert den Wechsel zur Entdecker-Karte als History-`push`, wenn der
  Kartenaufruf aus einer Business-Profilansicht kommt.
- Das Menyra-Social-Bundle wurde neu gebaut, damit `entry/social-app.js` den
  geaenderten Handler enthaelt.
- Der App-Build-Token wurde auf `2026-06-27-profile-map-back-01` aktualisiert.

## Bewusst Nicht Geaendert

- Kein neues Routing-System und kein neuer Karten-Handler.
- Keine sichtbaren UI-, Layout-, Farb-, Typografie- oder Spacing-Aenderungen.
- Keine Aenderung an Map-Rendering, Restaurant-Cards, QR, Cart, Orders,
  Firebase Rules oder Functions.

## Manuell Testen

1. Business-Profil oeffnen.
2. Oben in der Profil-Card den Karte-Button klicken.
3. Erwartung: Die interne Entdecker-Karte oeffnet sich mit dem passenden
   Business.
4. Browser-Zurueck klicken.
5. Erwartung: Das vorherige Business-Profil ist wieder sichtbar.
6. Kurz gegenpruefen: Restaurant-Card-Karte, TikTok-/Instagram-Links, Info,
   Menu, QR, Cart und Order-Flows wirken unveraendert.

## Bewertung

Bestanden mit kleinem Rest-Risiko. Die Aenderung ist auf den History-Modus des
bestehenden Kartenwechsels aus Business-Profilen begrenzt.
