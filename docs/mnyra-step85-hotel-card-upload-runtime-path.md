Status: CURRENT
Last updated: 2026-06-18

# Mnyra Schritt 85 - Hotel-Card Upload Runtime Path

## Schritt

Fix fuer den Hotel-/Motel-Titelbild-Upload im Hotel-Card-Editor auf Branch
`main`.

## Geaendert

- Der Hotel-Card-Editor nutzt fuer Titelbild-Uploads jetzt direkt den
  deferred Media-Upload-Pfad.
- Der Hotel-Upload haengt nicht mehr am allgemeinen Startup-Mutationsguard,
  der als Fallback `false` liefern konnte.
- Dadurch kann `false` nicht mehr als scheinbar erfolgreicher Upload ohne
  Bild-URL in die Hotel-Card-Save-Logik laufen.
- Der App-Build-Token wurde erneut angehoben, damit Browser und Service Worker
  den korrigierten Runtime-Pfad laden.

## Bewusst nicht geaendert

- Keine Aenderung an Hotel-Card-Layout, Farben, Spacing oder sichtbaren
  Komponenten.
- Keine Aenderung am Travel-Hotel-Card-Renderer.
- Keine Aenderung am normalen Restaurant-/Cafe-Menueditor.
- Keine Aenderung an QR, Cart, Order, Routing, Firebase Rules oder Functions.
- Keine Aenderung am Media-Upload-Service selbst.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `node --check apps/menyra-social/core/app-events/app-events-menu-focus-bind-utils.js`
- `npm run build`

## Manuell testen

- Als Hotel-/Motel-Business den Editor oeffnen.
- Ein oder mehrere Titelbilder auswaehlen.
- Speichern und pruefen, dass keine Meldung `Bild-Upload hat keine Bild-URL
  geliefert.` erscheint.
- Travel -> Hotels oeffnen und pruefen, dass die gespeicherten Titelbilder in
  der Hotel-Card erscheinen.
- Nach Deploy/Neustart hart neu laden, damit der neue Build-Token aktiv ist.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Der echte Upload- und Firebase-Schreibpfad muss mit einem echten
Hotel-/Motel-Account im Browser kontrolliert werden.
