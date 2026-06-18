Status: CURRENT
Last updated: 2026-06-18

# Schritt 82 - Hotel Card Multi Image Upload

## Ziel

Hotel-/Motel-Business-Accounts sollen im Hotel-Card-Editor Titelbilder wie im
restlichen Menu-/Produkt-Upload pflegen koennen: mehrere Bilder in einem
Datei-Dialog auswaehlen, als Galerie sehen, einzelne Bilder entfernen und beim
Speichern gemeinsam hochladen.

## Geaendert

- Der Hotel-Card-Editor nutzt jetzt einen `multiple` File-Input fuer
  Titelbilder statt drei einzelner Bild-Slots.
- Ausgewaehlte Bilder werden als Galerie-Previews im Editor angezeigt.
- Bestehende und neu ausgewaehlte Titelbilder koennen einzeln aus der Galerie
  entfernt werden.
- Beim Speichern werden alle neu ausgewaehlten Bilder ueber denselben
  `uploadCompressedImage`-Pfad wie der normale Menu-/Produkt-Upload
  hochgeladen.
- Die Upload-Kompression nutzt dieselben Eckwerte wie der Menu-Upload:
  `maxSize: 1080`, `quality: 0.8`, `mimeType: image/jpeg`.
- Die gespeicherten Bild-URLs werden weiter in `hotelCoverImages`,
  `coverImages`, `titleImages` und die bestehenden Cover-/Hero-Felder
  gespiegelt.
- Der Mnyra-Social-App-Build-Token wurde angehoben, damit Service Worker und
  Browser nicht am alten Main-Bundle haengen bleiben.

## Bewusst Nicht Geaendert

- Keine Aenderung an Restaurant-/Cafe-Menueditoren.
- Keine Aenderung an Hotel-Zimmern, Buchungsanfragen oder Profil-Routing.
- Keine Aenderung an QR, Cart, Order, Firebase Rules oder Functions.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps\menyra-social\core\profile\profile-menu-focus-render-controller.js`
- `node --check apps\menyra-social\core\app-events\app-events-menu-focus-bind-utils.js`
- `npm run build`

## Manuelle Testliste

- Mit einem Hotel- oder Motel-Business-Account anmelden.
- Profil -> Editor oeffnen und im Hotel-Card-Editor den Kamera-Button bei
  `Titelbilder` nutzen.
- Mehrere Bilder in einem Datei-Dialog auswaehlen.
- Pruefen, dass alle ausgewaehlten Bilder als Galerie-Previews erscheinen.
- Ein bestehendes und ein neu ausgewaehltes Bild per `x` entfernen.
- Speichern und danach Travel -> Hotels pruefen, ob die Titelbilder im
  Hotel-Card-Slider erscheinen.
- Browser/Handy nach dem Deploy hart neu laden, falls vorher noch ein alter
  Service-Worker-Stand aktiv war.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Die echte Upload-Berechtigung und Anzeige im Travel-Slider muessen
mit einem echten Hotel-/Motel-Account manuell getestet werden.
