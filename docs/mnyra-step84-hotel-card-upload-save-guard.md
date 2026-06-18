Status: CURRENT
Last updated: 2026-06-18

# Mnyra Schritt 84 - Hotel-Card Upload Save Guard

## Schritt

Fix fuer den Hotel-/Motel-Titelbild-Upload im Hotel-Card-Editor auf Branch
`main`.

## Geaendert

- Der Hotel-Card-Save behandelt einen Bild-Upload ohne zurueckgelieferte URL
  nicht mehr als erfolgreichen Upload.
- Wenn der Upload-Pfad oder der Startup-Guard keine Bild-URL liefert, wird
  kein leeres Bildarray mehr auf das Restaurant-Dokument geschrieben.
- Bei Save-Fehlern bleiben bestehende Titelbilder, neu ausgewaehlte Dateien,
  Previews und die URL-Eingabe im lokalen Editor-State erhalten.
- Der App-Build-Token wurde angehoben, damit Browser und Service Worker den
  neuen Bundle-Stand laden.

## Bewusst nicht geaendert

- Keine Aenderung an Hotel-Card-Layout, Farben, Spacing oder sichtbaren
  Komponenten.
- Keine Aenderung am Travel-Hotel-Card-Renderer.
- Keine Aenderung am normalen Restaurant-/Cafe-Menueditor.
- Keine Aenderung an QR, Cart, Order, Routing, Firebase Rules oder Functions.
- Keine Aenderung am Media-Upload-Service selbst.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/app-events/app-events-menu-focus-bind-utils.js`
- `npm run build`

## Manuell testen

- Als Hotel-/Motel-Business den Editor oeffnen.
- Ein oder mehrere Titelbilder auswaehlen und pruefen, dass die Previews
  sichtbar sind.
- Speichern und pruefen, dass die Bilder nach erfolgreichem Upload im Editor
  und in Travel -> Hotels erhalten bleiben.
- Bei einem Upload-Fehler pruefen, dass die ausgewaehlten Previews nicht
  verschwinden und kein leerer Bildstand gespeichert wird.
- Nach Deploy/Neustart hart neu laden, damit der neue Build-Token aktiv ist.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Die echte Upload-Berechtigung und der Fehlerfall muessen mit einem
echten Hotel-/Motel-Account manuell im Browser kontrolliert werden.
