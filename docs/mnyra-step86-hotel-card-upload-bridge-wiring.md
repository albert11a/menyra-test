Status: CURRENT
Last updated: 2026-06-18

# Mnyra Schritt 86 - Hotel-Card Upload Bridge Wiring

## Schritt

Fix fuer den Hotel-/Motel-Titelbild-Upload im Hotel-Card-Editor auf Branch
`main`.

## Geaendert

- Das Shell-Bridge-Wiring reicht `uploadCompressedImage` jetzt an den
  Shell-Bootstrap weiter.
- Der Hotel-Card-Event-Binder bekommt dadurch dieselbe Media-Upload-Funktion,
  die auch andere funktionierende Upload-Pfade verwenden.
- Die Meldung `Bild-Upload ist nicht bereit.` kann dadurch nicht mehr aus
  fehlendem Bridge-Wiring entstehen.
- Der App-Build-Token wurde erneut angehoben, damit Browser und Service Worker
  die korrigierte Bundle-Version laden.

## Bewusst nicht geaendert

- Keine Aenderung an Hotel-Card-Layout, Farben, Spacing oder sichtbaren
  Komponenten.
- Keine Aenderung am Travel-Hotel-Card-Renderer.
- Keine Aenderung am normalen Restaurant-/Cafe-Menueditor.
- Keine Aenderung an QR, Cart, Order, Routing, Firebase Rules oder Functions.
- Keine Aenderung am Media-Upload-Service selbst.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/app-shell/bridge-shell-runtime-cluster.js`
- `node --check apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `node --check apps/menyra-social/core/app-events/app-events-menu-focus-bind-utils.js`
- `npm run build`

## Manuell testen

- Als Hotel-/Motel-Business den Editor oeffnen.
- Ein oder mehrere Titelbilder auswaehlen.
- Speichern und pruefen, dass keine Meldung `Bild-Upload ist nicht bereit.`
  erscheint.
- Ebenfalls pruefen, dass keine Meldung `Bild-Upload hat keine Bild-URL
  geliefert.` erscheint, solange der echte Upload-Service erfolgreich ist.
- Travel -> Hotels oeffnen und pruefen, dass die gespeicherten Titelbilder in
  der Hotel-Card erscheinen.
- Nach Deploy/Neustart hart neu laden, damit der neue Build-Token aktiv ist.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Der echte Upload- und Firebase-Schreibpfad muss mit einem echten
Hotel-/Motel-Account im Browser kontrolliert werden.
