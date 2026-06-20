Status: CURRENT
Last updated: 2026-06-20

# Schritt 91 - Travel Oferta Premium Card

## Ziel

Der Travel-Tab `Ofertat` soll eine eigene Oferta-Card nach dem freigegebenen
Tailwind-/Lucide-Aufbau bekommen: Bildslider, rotes Oferta-Badge, Like/Share,
Logo, Hotelinfos, Distanzen, Feature-Chips, Paketpreis, `Mehr Details`-Overlay
und ein lokales Anfrageformular.

## Geaendert

- `Ofertat` nutzt jetzt eine eigene Premium-Oferta-Card statt der normalen
  Hotel-Card.
- Die neue Card nutzt weiter die bestehende Tailwind-/Lucide-Struktur und die
  vorhandenen Travel-Slider-Attribute fuer Pfeile, Punkte und Swipe.
- Die Card zeigt rotes `Ofertë`-/Custom-Badge, Dauer wie `3 Netë - 4 Ditë`,
  Preis-Suffix `Për person` oder `Totali`, Distanzen, Features und Hotel-Logo.
- `Mehr Details` oeffnet ein Card-internes Detailoverlay mit Beschreibung,
  Inklusivliste und lokalem Anfrageformular.
- Share nutzt weiterhin den bestehenden Profil-Link und zeigt fuer Oferta-Cards
  einen kleinen Toast.
- Das Anfrageformular bleibt bewusst lokal: Es zeigt Validierung und Erfolg,
  schreibt aber noch keine Buchungsanfrage in Firebase.
- App-Build-Token und Social-Bundles wurden neu gebaut.

## Bewusst Nicht Geaendert

- Keine Aenderung am `Hotels`-Tab und an der normalen Hotel-Card.
- Keine neue Firebase-Collection, keine Rules- oder Functions-Aenderung.
- Keine Aenderung an QR, Cart, Order oder Routing.
- Keine echte Buchungs-/Anfragepersistenz; das bleibt ein separater fachlicher
  Schritt.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `node --check apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `node --check apps/menyra-social/bundled/chunks/marketplace-view-render-utils-CchrLX-G.js`
- `node --check apps/menyra-social/bundled/chunks/travel-view-event-bindings-CDq6wwm4.js`
- `git diff --check`

## Manuelle Testliste

- Travel `Ofertat` oeffnen und pruefen, dass die neue Oferta-Card sichtbar ist.
- Bildslider mit Pfeilen, Punkten und Finger-Swipe testen.
- Like und Share testen; Share soll einen Toast auf der Oferta-Card zeigen.
- `Mehr Details` oeffnen und schliessen.
- Im Overlay Name/Telefon leer absenden und die Validierung pruefen.
- Name und Telefon ausfuellen, absenden und die lokale Erfolgsmeldung pruefen.
- Den `Hotels`-Tab oeffnen und pruefen, dass die normale Hotel-Card unveraendert
  bleibt.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die echte Anzeige, Icons, Swipe-Gesten und Overlay-Bedienung muss
im lokalen Dev-Setup manuell gegengeprueft werden.
