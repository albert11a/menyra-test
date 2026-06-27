Status: CURRENT
Last updated: 2026-06-27

# Schritt 131 - Shopping Card Bildauswahl pro Produkt

## Ziel

Im Shop-Editor soll pro ausgewaehltem Shopping-Card-Produkt entschieden werden,
welches Bild in der Produktkachel im Shopping-Tab erscheint.

## Umsetzung

- Die Produktkachel im Shopping-Tab nutzt ein separates `cardImageUrl`, wenn es
  gesetzt ist.
- Das Produkt-Modal bekommt weiterhin die normalen Produktbilder ueber
  `imageUrl` und `imageUrls`.
- Beim Speichern der Shopping Landing Card werden alle Produktbilder des
  Produkts in `imageUrls` gesichert, nicht nur das erste Bild.
- Im Editor kann pro Produkt ein vorhandenes Produktbild fuer die Card gewaehlt
  werden.
- Bild 1 wird nicht doppelt angezeigt; es ist die Standard-Auswahl.
- Zusaetzlich kann pro Produkt ein eigenes Card-only-Bild hochgeladen werden.
- Card-only Uploads werden nicht in die normalen Produktbilder uebernommen.
- Der App-Build-Token wurde auf
  `2026-06-27-shopping-card-image-picker-01` aktualisiert.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/profile/shopping-landing-card-editor-bindings.js`
- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/index.html`
- `apps/menyra-social/bundled/`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step131-shopping-card-image-picker.md`

## Bewusst nicht geaendert

- Keine Aenderung an Produkt-/Menu-Editor-Daten ausser der Shopping-Card-
  Auswahl.
- Keine Aenderung an Cart, Checkout, Orders, QR, Routing, Firebase Rules oder
  Functions.
- Keine Aenderung an der Produktdetail-Logik ausser dass die vorhandenen
  `imageUrls` wieder vollstaendig im Shopping-Produkt-Payload bleiben.

## Manuelle Testliste

1. App hart neu laden, bei Bedarf mit `?sw-reset=1`.
2. Bei `?debug-build=1` muss
   `2026-06-27-shopping-card-image-picker-01` aktiv sein.
3. Als Ecommerce-Shop Profil -> Shop/Menu-Editor oeffnen.
4. In `Landing Card` ein Produkt mit mehreren Bildern auswaehlen.
5. Bei `Card-Bild` Bild 2 oder ein anderes vorhandenes Produktbild waehlen und
   speichern.
6. Shopping-Tab oeffnen und pruefen, dass die kleine Produktkachel dieses Bild
   zeigt.
7. Dieselbe Produktkachel antippen und pruefen, dass das Modal weiterhin alle
   normalen Produktbilder zeigt.
8. Danach ueber `Upload` ein Card-only-Bild hochladen, speichern und pruefen,
   dass nur die Shopping-Card-Kachel dieses Bild nutzt.
9. Mit `Standard` zuruecksetzen, speichern und pruefen, dass die Card wieder
   Bild 1 nutzt.
