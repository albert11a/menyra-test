Status: CURRENT
Last updated: 2026-06-19

# Schritt 90 - Travel Oferta Badge-Kontext

## Ziel

Der Hotel-/Motel-Oferta-Editor soll die Oferta-Zusatzfelder immer im richtigen
Kontext anzeigen und speichern, damit die Travel-`Ofertat`-Card nicht nur die
normalen Hotel-Card-Felder zeigt, sondern auch Badge, `Nete / dite`, Distanzen,
Preis-Typ und Features aus der Oferta verwenden kann.

## Geaendert

- Die Hotel-/Motel-Erkennung im Fokus-/Oferta-Modal nutzt jetzt nicht mehr nur
  das erste gesetzte `userProfile`-Typfeld.
- Modal und Save-Runtime pruefen mehrere Typfelder sowie den passenden
  Restaurant-Datensatz aus `state.restaurants`.
- Bereits vorhandene Oferta-Eintraege mit Travel-Oferta-Feldern bleiben auch
  dann im Oferta-Modus, wenn das aktuelle Profil-Typfeld unvollstaendig ist.
- Speichern und Loeschen nutzen denselben robusteren Restaurant-ID-Kontext und
  synchronisieren den lokalen Restaurant-State weiter fuer Travel.
- Der App-Build-Token wurde angehoben und das Social-Bundle wurde neu gebaut.

## Bewusst Nicht Geaendert

- Keine Entfernung der Oferta-Badges auf der Travel-Card.
- Keine neue Card-Optik und kein neues Layout.
- Keine Aenderung an QR, Cart, Order, Routing, Firebase Rules oder Functions.
- Keine Aenderung am Restaurant-/Cafe-Fokuseditor ausserhalb der gemeinsamen
  Kontext-Erkennung.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/menu/focus-runtime-controller.js`
- `node --check apps/menyra-social/core/menu/customer-focus-modal-render-utils.js`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `git diff --check`

## Manuelle Testliste

- Hotel-/Motel-Editor oeffnen und unter `Oferta` einen neuen Eintrag anlegen.
- Pruefen, dass Badge links, `Nete / dite`, Zentrum, Strand/See, Preis,
  Preis-Typ und mehrere Feature-Zeilen sichtbar sind.
- Oferta speichern und im Travel-Tab `Ofertat` pruefen, dass Badge und
  Zusatzdaten auf der Hotel-Card erscheinen.
- Bestehende Oferta bearbeiten und pruefen, dass gespeicherte Zusatzfelder
  wieder im Editor stehen.
- Oferta deaktivieren oder loeschen und pruefen, dass der lokale Travel-Stand
  entsprechend aktualisiert wird.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die echte Anzeige und Firebase-Ladefolge muss im lokalen Dev-Setup
manuell gegengeprueft werden.
