Status: CURRENT
Last updated: 2026-06-20

# Schritt 100 - Travel Hotel Details Editor Corrections

## Ziel

Nach Schritt 99 sollen die Hotel-Details im Editor fachlich knapper und sauberer
wirken: keine deutschen Direkt-Labels im Hotel-/Oferta-Kontext, keine
unklaren reinen Meterangaben bei Zentrum/Strand und keine dauerhaft offene
Details-Form im Hotel-Editor.

## Geaendert

- `Hotel Details` erscheint im Hotel-/Motel-Editor jetzt wie die Oferta-
  Verwaltung zuerst als klickbare Zeile mit Plus.
- Erst Klick auf Plus oder die Hotel-Zeile oeffnet das eigentliche
  Hotel-Details-Formular.
- Das Formular kann wieder geschlossen werden, ohne den Oferta-Editor zu
  beeinflussen.
- Direkte Distanzwerte sind jetzt kurz auf Albanisch:
  `Në qendër` und `Në plazh`.
- Gespeicherte Distanzwerte enthalten jetzt Kontext:
  `150 m nga qendra` und `150 m nga plazhi`.
- Bestehende alte reine Werte wie `150 m` werden auf den Travel-Hotel- und
  Travel-Oferta-Cards mit `nga qendra` bzw. `nga plazhi` angezeigt.
- Hotel-/Oferta-Feldlabels fuer Zentrum, Strand, Preis, Shezlong und freie
  Zusatzfeatures wurden auf kurze albanische Labels umgestellt.
- Sichtbare Travel-Hotel-/Oferta-Card-Fallbacks fuer fehlende Zentrum-/Strand-
  Werte und Review-Zaehler wurden auf kurze albanische Texte nachgezogen.
- Die Hotel-Details-Preview nutzt jetzt ebenfalls kurze albanische Labels fuer
  Lokacion, Adresse, Qendra, Plazhi, Vleresime und enthaltene Ausstattung.
- Shezlong-Presets wurden gekuerzt und fachlich sauberer gemacht:
  `Shezlongë falas`, `Shezlongë me pagesë`, `Plazh privat`, `Pa shezlongë`.
- Food-Presets wurden gekuerzt:
  `Mëngjes`, `Gjysmë pension`, `Pension i plotë`, `All inclusive`,
  `Restorant`, `Pa ushqim`.
- Der gebuendelte Mnyra-Social-Output wurde nachgezogen.

## Bewusst Nicht Geaendert

- Keine Aenderung an QR, Cart, Order, Checkout oder Routing.
- Keine Aenderung an Firebase Rules, Functions oder Collections.
- Keine neue Hotel-Zimmer-/Buchungslogik.
- Keine Aenderung an Restaurant-/Cafe-Editor oder Restaurant-/Cafe-Cards.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps\menyra-social\core\profile\profile-menu-focus-render-controller.js`
- `node --check apps\menyra-social\core\app-events\app-events-menu-focus-bind-utils.js`
- `node --check apps\menyra-social\core\menu\customer-focus-modal-render-utils.js`
- `node --check apps\menyra-social\core\menu\focus-runtime-controller.js`
- `node --check apps\menyra-social\core\marketplace\marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `node --check` fuer die neu erzeugten gebuendelten Hotel-/Marketplace-Chunks
- `git diff --check`
- Konfliktmarker-Pruefung per `rg`

## Manuelle Testliste

- Als Hotel-/Motel-Owner Profil -> Editor oeffnen.
- Pruefen, dass zuerst nur die klickbare `Hotel Details`-Zeile mit Plus
  sichtbar ist.
- Auf Plus oder die Hotel-Zeile klicken und pruefen, dass erst dann das
  Details-Formular erscheint.
- Zentrum als `150 m` speichern und danach auf der Card als
  `150 m nga qendra` pruefen.
- Strand als `150 m` speichern und danach auf der Card als
  `150 m nga plazhi` pruefen.
- `Në qendër` und `Në plazh` ueber die Haken speichern und wieder bearbeiten.
- Food-, Shezlong- und Parking-Presets speichern und im Editor erneut oeffnen.
- Eine Oferta oeffnen und dieselben albanischen Labels/Distanzwerte pruefen.
- Travel `Hotels` und `Ofertat` pruefen, besonders Zentrum-/Strandzeilen und
  Feature-Chips.
- Restaurant-/Cafe-Editor und Restaurant-/Cafe-Cards kurz unveraendert
  gegenpruefen.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die echte Bedienung und Darstellung muss manuell im lokalen
Dev-Setup gegengeprueft werden.
