Status: CURRENT
Last updated: 2026-06-18

# Mnyra Schritt 83 - Hotel-Card Upload Sichtbarkeit

## Schritt

Fix fuer den Hotel-/Motel-Titelbild-Upload im Hotel-Card-Editor auf Branch
`main`.

## Geaendert

- Frisch ausgewaehlte Hotel-Titelbilder stehen in der Editor-Vorschau sofort
  vor bestehenden Bildern.
- Beim Speichern werden neu hochgeladene Titelbilder vor bestehenden Bildern
  in `hotelCoverImages`, `coverImages`, `titleImages` und den primaeren
  Titelbildfeldern abgelegt.
- Der lokale State aktualisiert neben `state.restaurants` auch passende
  Bootstrap-Preview-Records, damit die Travel-Hotel-Card nach dem Speichern
  nicht weiter den alten Record rendert.
- Der App-Build-Token wurde angehoben, damit Browser und Service Worker den
  neuen Bundle-Stand laden.

## Bewusst nicht geaendert

- Keine Aenderung an Hotel-Card-Layout, Farben, Spacing oder Button-Breiten.
- Keine Aenderung am normalen Restaurant-/Cafe-Menueditor.
- Keine Aenderung an QR, Cart, Order, Routing, Firebase Rules oder Functions.
- Keine Aenderung am Upload-Service selbst.

## Manuell testen

- Als Hotel-/Motel-Business den Editor oeffnen.
- Mehrere Titelbilder auswaehlen und pruefen, dass sie direkt vorne in der
  Vorschau erscheinen.
- Speichern und danach Travel -> Hotels oeffnen.
- Pruefen, dass das erste neu hochgeladene Bild sofort als Card-Titelbild
  sichtbar ist und weitere Bilder im Slider liegen.
- Hart neu laden und denselben Travel-Hotel-Card-Stand erneut pruefen.

## Bewertung

Bestanden mit kleinem Rest-Risiko, weil die Sichtpruefung weiterhin manuell im
Browser erfolgen muss.
